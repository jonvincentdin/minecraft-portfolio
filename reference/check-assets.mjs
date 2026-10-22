import fs from 'node:fs';
import assert from 'node:assert/strict';
import {items,roles} from './dist/content.js';
import {geometry} from './dist/renderer.js';
import {defaults,validate,moveSlot,safeUrl,safeImage} from './dist/state.js';
const models=JSON.parse(fs.readFileSync('dist/assets/models/scene-data.json','utf8'));
let refined=0,triangles=0;
for(const [key,scene] of Object.entries(models)){
 const m=geometry(scene);assert(m.positions.length>0,key);assert.equal(m.positions.length,m.normals.length);assert.equal(m.positions.length,m.colors.length);assert.equal(m.indices.length%3,0);assert.equal(m.edges.length%2,0);
 for(const p of [...m.positions,...m.normals,...m.colors,...m.edges]){assert.equal(p.length,3);assert(p.every(Number.isFinite),key)}
 for(const n of m.normals)assert(Math.abs(Math.hypot(...n)-1)<1e-6,key);
 for(const c of m.colors)assert(c.every(v=>v>=0&&v<=1),key);
 for(const i of m.indices)assert(Number.isInteger(i)&&i>=0&&i<m.positions.length,key);
 const seen=new Set();
 for(let t=0;t<m.indices.length;t+=3){const [a,b,c]=m.indices.slice(t,t+3).map(i=>m.positions[i]),u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];assert(Math.hypot(...cross)>1e-10,key+' degenerate triangle');if(scene.mesh){const n=m.normals[m.indices[t]];assert(cross.reduce((sum,x,i)=>sum+x*n[i],0)>0,key+' winding');const signature=[a,b,c].map(x=>x.map(v=>v.toFixed(6)).join(',')).sort().join('/');assert(!seen.has(signature),key+' duplicate triangle');seen.add(signature)}}
 if(scene.mesh){refined++;triangles+=m.indices.length/3;const file=fs.readFileSync(`dist/assets/models/${key}.glb`);assert.equal(file.toString('ascii',0,4),'glTF');assert.equal(file.readUInt32LE(8),file.length);const len=file.readUInt32LE(12),gltf=JSON.parse(file.toString('utf8',20,20+len));assert.equal(gltf.meshes[0].primitives[0].attributes.COLOR_0,2);assert.equal(gltf.accessors[3].count,m.indices.length);assert(gltf.animations.length===1);for(const b of gltf.bufferViews)assert((b.byteOffset||0)+b.byteLength<=gltf.buffers[0].byteLength)}
}
assert.equal(refined,39);assert.equal(items.length,14);assert.equal(roles.length,5);
for(const id of [...items.map(x=>'item_'+x.id),...roles.map(x=>'character_'+x.id),'crafting_table']){assert(models[id]);assert(fs.existsSync(`dist/assets/thumbs/${id}.png`))}
const d=defaults();assert(validate(d));for(const p of d.projects)for(const ph of p.photos)assert(fs.existsSync('dist/'+ph.src));
const initial=['a','b',null,null];assert.deepEqual(moveSlot(initial,0,3),[null,'b',null,'a']);assert.deepEqual(moveSlot(initial,0,1),['b','a',null,null]);assert.deepEqual(initial,['a','b',null,null]);assert.deepEqual(moveSlot(initial,-1,1),initial);
for(const k of ['achievements','certifications']){const nodes=d[k];for(const n of nodes){let p=n,seen=new Set();while(p){assert(!seen.has(p.id),'Tree cycle');seen.add(p.id);if(p.parent)assert(nodes.some(n=>n.id===p.parent),'Parent missing');p=nodes.find(n=>n.id===p.parent)}}}
assert.equal(safeUrl('javascript:alert(1)'),'');assert.equal(safeUrl('data:text/html,test'),'');assert.equal(safeImage('javascript:alert(1)'),'');assert.equal(safeImage('data:image/svg+xml;base64,test'),'');assert(safeImage('assets/demos/project-1-1.svg'));
console.log(`PASS: ${Object.keys(models).length} scenes, ${refined} refined GLBs, ${triangles} refined triangles; valid normals/winding, no duplicate refined triangles, all assets mapped. Inventory move/swap, separate tree integrity and URL restrictions pass.`);
