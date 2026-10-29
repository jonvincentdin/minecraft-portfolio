// node context/v2/previs/build-models.mjs
// Local procedural authoring, no external service. Outputs are versioned review drafts.
import { mkdir,writeFile,readFile,copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { geometry } from '../../../src/components/three/renderer.js';
import { createModels } from './model-sources.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const out=join(root,'work/model-drafts/portfolio-exhibition/v1');
await mkdir(out,{recursive:true});
function glb(mesh) {
  const attrs=['positions','normals','colors'], chunks=[],views=[],accessors=[];let offset=0;
  for(const name of attrs) {
    const data=Float32Array.from(mesh.indices.flatMap(i=>mesh[name][i])), chunk=Buffer.from(data.buffer);
    views.push({buffer:0,byteOffset:offset,byteLength:chunk.length,target:34962});
    const acc={bufferView:views.length-1,componentType:5126,count:mesh.indices.length,type:'VEC3'};
    if(name==='positions'){acc.min=[0,1,2].map(k=>Math.min(...mesh.positions.map(v=>v[k])));acc.max=[0,1,2].map(k=>Math.max(...mesh.positions.map(v=>v[k])));}
    accessors.push(acc);chunks.push(chunk);offset+=chunk.length;
  }
  const doc={asset:{version:'2.0',generator:'DIN deterministic voxel authoring'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0,NORMAL:1,COLOR_0:2},material:0}]}],materials:[{pbrMetallicRoughness:{metallicFactor:0,roughnessFactor:1},doubleSided:false}],buffers:[{byteLength:offset}],bufferViews:views,accessors};
  let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
  const bin=Buffer.concat(chunks), head=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);
  head.writeUInt32LE(0x46546c67,0);head.writeUInt32LE(2,4);head.writeUInt32LE(28+json.length+bin.length,8);
  jh.writeUInt32LE(json.length,0);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bin.length,0);bh.writeUInt32LE(0x004e4942,4);
  return Buffer.concat([head,jh,json,bh,bin]);
}
const models=createModels(), manifest={version:1,created:'2026-10-27',timezone:'Asia/Singapore',provenance:'Original local deterministic voxel geometry; no AI generation service, Blender or MCP used.',axes:'+Y up, +Z front; arbitrary scene units',runtime:'Existing VoxelView scene boxes; GLB supplied for interchange, not loaded by the site.',limitations:'Intersecting cuboids are intentional. No manifold, rigging, UV, PBR, cast-shadow or production-readiness claim.',assets:[],protected:{}};
for(const [id,scene] of Object.entries(models)) {
  const mesh=geometry(scene);let wrongWinding=0;
  if(mesh.positions.some(p=>p.some(v=>!Number.isFinite(v))))throw Error('Nonfinite '+id);
  for(const b of scene.boxes)if(b.s.some(v=>v<=0))throw Error('Invalid box '+id);
  for(let i=0;i<mesh.indices.length;i+=3){const [a,b,c]=mesh.indices.slice(i,i+3).map(n=>mesh.positions[n]);const u=b.map((v,k)=>v-a[k]),v=c.map((q,k)=>q-a[k]);const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(cross.reduce((n,x,k)=>n+x*mesh.normals[mesh.indices[i]][k],0)<=0)wrongWinding++;}
  if(wrongWinding)throw Error('Winding '+id);
  const bytes=glb(mesh);await writeFile(join(out,id+'.glb'),bytes);await writeFile(join(out,id+'.scene.json'),JSON.stringify(scene));
  const min=[0,1,2].map(k=>Math.min(...mesh.positions.map(v=>v[k]))),max=[0,1,2].map(k=>Math.max(...mesh.positions.map(v=>v[k])));
  manifest.assets.push({id,boxes:scene.boxes.length,triangles:mesh.indices.length/3,bytes:bytes.length,bounds:{min,max},dimensions:max.map((v,k)=>v-min[k]),finite:true,winding:true,sha256:createHash('sha256').update(bytes).digest('hex')});
}
for(const name of ['assets/models/skill_react.glb','assets/thumbs/skill_react.png','assets/models/scene-data.json'])manifest.protected[name]=createHash('sha256').update(await readFile(join(root,name))).digest('hex');
await copyFile(fileURLToPath(new URL('./model-sources.mjs',import.meta.url)),join(out,'model-sources.mjs'));
await writeFile(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({out,assets:manifest.assets},null,2));
