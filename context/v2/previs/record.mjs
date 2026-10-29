// Full local portfolio concept walkthrough. No production service or external asset access.
// node context/v2/previs/record.mjs [output.mp4]
import { chromium } from 'playwright';
import { mkdir,readFile,writeFile,readdir } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { serve } from './server.mjs';
import { makeSeekable } from './mp4.mjs';
const out=resolve(process.argv[2]||'context/v2/previs/din-v2-previs.mp4'),dir=resolve('test-results/v2-previs/recording-'+Date.now());await mkdir(dir,{recursive:true});
const {server,url}=await serve();const browser=await chromium.launch({channel:'msedge'}),W=1440,H=900;
try{
 const ctx=await browser.newContext({viewport:{width:W,height:H},recordVideo:{dir,size:{width:W,height:H}}});const page=await ctx.newPage();
 page.on('pageerror',e=>console.error(e.message));await page.goto(url);await page.waitForFunction(()=>window.__ready);await page.waitForTimeout(3300);
 console.log('Recording hero, work, about, skills, experience, credentials and contact');
 await page.evaluate(async()=>{
  document.documentElement.style.scrollBehavior='auto';
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const move=(to,ms)=>new Promise(done=>{const from=scrollY,start=performance.now();const step=now=>{const p=Math.min(1,(now-start)/ms),ease=p*p*(3-2*p);scrollTo(0,from+(to-from)*ease);if(p<1)requestAnimationFrame(step);else done();};requestAnimationFrame(step);});
  const work=document.querySelector('#work');await move(work.offsetTop,5500);await wait(2200);
  const range=work.offsetHeight-innerHeight;await move(work.offsetTop+range*.5,6500);await wait(1800);await move(work.offsetTop+range,6500);await wait(1800);
  await move(document.querySelector('#about').offsetTop,5500);await wait(2000);
  for(const id of ['skills','experience','advancements','contact']){await move(document.querySelector('#'+id).offsetTop,5000);await wait(2000);}
  await move(document.documentElement.scrollHeight-innerHeight,2200);await wait(2000);
 });
 await page.close();await ctx.close();const webm=join(dir,(await readdir(dir)).find(f=>f.endsWith('.webm')));console.log('Encoding MP4');
 const conv=await browser.newPage({viewport:{width:W,height:H}});await conv.route('**/__take.webm',r=>r.fulfill({path:webm,contentType:'video/webm'}));await conv.goto(url);
 const encoded=await conv.evaluate(async({W,H})=>{
  const v=document.createElement('video');v.src='/__take.webm';v.muted=true;v.preload='auto';await new Promise(r=>v.addEventListener('loadeddata',r,{once:true}));
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const mime=['video/mp4;codecs=avc1.640028','video/mp4;codecs=avc1.42001f','video/mp4'].find(m=>MediaRecorder.isTypeSupported(m));if(!mime)throw Error('H.264 MediaRecorder unavailable');
  const recorder=new MediaRecorder(c.captureStream(30),{mimeType:mime,videoBitsPerSecond:4_500_000}),chunks=[];recorder.ondataavailable=e=>e.data.size&&chunks.push(e.data);const stopped=new Promise(r=>recorder.onstop=r);let started=false;
  const draw=(now,meta)=>{if(meta.mediaTime>=1.1){g.drawImage(v,0,0,W,H);if(!started){recorder.start(1000);started=true;}}if(!v.ended)v.requestVideoFrameCallback(draw);};
  v.requestVideoFrameCallback(draw);await v.play();await new Promise(r=>v.addEventListener('ended',r,{once:true}));if(!started)throw Error('No frames');recorder.stop();await stopped;
  const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s);
 },{W,H});
 const fragmented=Buffer.from(encoded,'base64');await writeFile(join(dir,'fragmented.mp4'),fragmented);const {output,metadata}=makeSeekable(fragmented);await writeFile(out,output);
 await writeFile('context/v2/previs/video-metadata.json',JSON.stringify({...metadata,width:W,height:H,targetFrameRate:30,recorded:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Singapore'}).format(new Date()),timezone:'Asia/Singapore',source:'Actual Edge recording of the standalone previs; illustrative v1 content; no audio.'},null,2)+'\n');console.log(JSON.stringify({out,...metadata}));
}finally{await browser.close();server.close();}
