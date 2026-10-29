// Repackage Chromium's fragmented H.264 MediaRecorder output as a seekable MP4.
// Single video track only; preserve encoded samples and codec configuration without transcoding.
const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n>>>0);return b;};
const box=(type,...parts)=>{const data=Buffer.concat(parts);return Buffer.concat([u32(data.length+8),Buffer.from(type),data]);};
const full=(type,flags,...parts)=>box(type,u32(flags),...parts);
function children(buf,start=0,end=buf.length){const out=[];for(let p=start;p<end;){let size=buf.readUInt32BE(p),head=8;if(size===1){size=Number(buf.readBigUInt64BE(p+8));head=16;}if(size===0)size=end-p;if(size<head||p+size>end)throw Error('Invalid MP4 box');out.push({type:buf.toString('ascii',p+4,p+8),start:p,end:p+size,head,data:buf.subarray(p,p+size)});p+=size;}return out;}
const inside=b=>children(b.data,b.head);
const child=(b,t)=>inside(b).find(x=>x.type===t);
function timescale(b){return b.data.readUInt32BE(b.data[8]===1?28:20);}
function durationBox(b,duration,track=false){const data=Buffer.from(b.data),v=data[8],offset=track?(v===1?36:28):(v===1?32:24);if(v===1)data.writeBigUInt64BE(BigInt(duration),offset);else data.writeUInt32BE(duration,offset);return data;}
function tableRuns(values){const runs=[];for(const v of values){const last=runs.at(-1);if(last&&last[1]===v)last[0]++;else runs.push([1,v]);}return Buffer.concat([u32(runs.length),...runs.flatMap(([count,v])=>[u32(count),u32(v)])]);}
export function makeSeekable(input){
 const top=children(input),moov=top.find(b=>b.type==='moov'),ftyp=top.find(b=>b.type==='ftyp');if(!moov||!ftyp)throw Error('Missing movie header');
 const tracks=inside(moov).filter(b=>b.type==='trak');if(tracks.length!==1)throw Error('Recorder must contain exactly one video track');
 const trak=tracks[0],mdia=child(trak,'mdia'),minf=child(mdia,'minf'),stbl=child(minf,'stbl'),mdhd=child(mdia,'mdhd'),mvhd=child(moov,'mvhd'),tkhd=child(trak,'tkhd');
 const samples=[],duration=[],flags=[],cts=[];const trex=child(moov,'mvex')&&child(child(moov,'mvex'),'trex');
 for(const fragment of top.filter(b=>b.type==='moof'))for(const traf of inside(fragment).filter(b=>b.type==='traf')){
  const tfhd=child(traf,'tfhd'),f=tfhd.data.readUInt32BE(8)&0xffffff;let p=16,base=fragment.start;
  if(f&1){base=Number(tfhd.data.readBigUInt64BE(p));p+=8;}if(f&2)p+=4;
  let dur=trex?trex.data.readUInt32BE(20):0,size=trex?trex.data.readUInt32BE(24):0,flag=trex?trex.data.readUInt32BE(28):0;
  if(f&8){dur=tfhd.data.readUInt32BE(p);p+=4;}if(f&16){size=tfhd.data.readUInt32BE(p);p+=4;}if(f&32)flag=tfhd.data.readUInt32BE(p);
  let cursor=top.find(b=>b.type==='mdat'&&b.start>=fragment.end)?.start+8;
  for(const run of inside(traf).filter(b=>b.type==='trun')){const rf=run.data.readUInt32BE(8)&0xffffff,count=run.data.readUInt32BE(12);let q=16,first=flag;
   if(rf&1){cursor=base+run.data.readInt32BE(q);q+=4;}if(rf&4){first=run.data.readUInt32BE(q);q+=4;}
   for(let i=0;i<count;i++){let d=dur,s=size,fl=i===0?first:flag,ct=0;if(rf&256){d=run.data.readUInt32BE(q);q+=4;}if(rf&512){s=run.data.readUInt32BE(q);q+=4;}if(rf&1024){fl=run.data.readUInt32BE(q);q+=4;}if(rf&2048){ct=run.data[8]===1?run.data.readInt32BE(q):run.data.readUInt32BE(q);q+=4;}
    if(!s||cursor+s>input.length)throw Error('Invalid sample');samples.push(input.subarray(cursor,cursor+s));duration.push(d);flags.push(fl);cts.push(ct);cursor+=s;
   }
  }
 }
 if(!samples.length)throw Error('No video samples');for(let i=0;i<duration.length;i++)if(!duration[i])duration[i]=duration[i-1]||Math.round(timescale(mdhd)/30);
 const ticks=duration.reduce((a,b)=>a+b,0),movieTicks=Math.round(ticks/timescale(mdhd)*timescale(mvhd));
 function movie(offset){const sync=flags.map((f,i)=>!(f&0x10000)?i+1:0).filter(Boolean);
  const sampleTable=box('stbl',child(stbl,'stsd').data,full('stts',0,tableRuns(duration)),...(cts.some(Boolean)?[full('ctts',cts.some(v=>v<0)?0x01000000:0,tableRuns(cts))]:[]),full('stsc',0,u32(1),u32(1),u32(samples.length),u32(1)),full('stsz',0,u32(0),u32(samples.length),...samples.map(s=>u32(s.length))),full('stco',0,u32(1),u32(offset)),full('stss',0,u32(sync.length),...sync.map(u32)));
  const newMinf=box('minf',...inside(minf).map(b=>b.type==='stbl'?sampleTable:b.data));
  const newMdia=box('mdia',...inside(mdia).map(b=>b.type==='mdhd'?durationBox(b,ticks):b.type==='minf'?newMinf:b.data));
  const newTrak=box('trak',...inside(trak).filter(b=>b.type!=='edts').map(b=>b.type==='tkhd'?durationBox(b,movieTicks,true):b.type==='mdia'?newMdia:b.data));
  return box('moov',...inside(moov).filter(b=>b.type!=='mvex').map(b=>b.type==='mvhd'?durationBox(b,movieTicks):b.type==='trak'?newTrak:b.data));
 }
 const preliminary=movie(0),header=movie(ftyp.data.length+preliminary.length+8),output=Buffer.concat([ftyp.data,header,box('mdat',...samples)]);
 return{output,metadata:{seconds:ticks/timescale(mdhd),samples:samples.length,bytes:output.length,seekable:true,codec:'H.264 / AVC',audio:false}};
}
