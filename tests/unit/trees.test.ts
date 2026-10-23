import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {rootPath,routeBetween,canConnect,createPathAnimator} from '../../src/domain/tree-paths.js';
import {treeProblem,initialSelection} from '../../src/domain/advancement-trees';
import type {Advancement} from '../../src/types/content';
import content from '../../src/data/demo-content.json' with { type: 'json' };

const nodes=[{id:'r',parent:''},{id:'a',parent:'r'},{id:'b',parent:'r'},{id:'leaf',parent:'a'},{id:'other',parent:''}];
const node=(id:string,parent='',x=100,y=100)=>({id,parent,x,y,title:id,description:'',date:'',issuer:'',evidence:'',symbol:'emerald',sample:true}) as Advancement;

// A fake world that records edge animations, so ordering is checked without browser timing.
function fakeWorld(){
 const events:[string,string,string][]=[];
 const elements=nodes.map(n=>({dataset:{node:n.id},lit:false,classList:{toggle(this:void){},add(){}},animate(){return {finished:Promise.resolve(),cancel(){}};}}));
 const edges=nodes.filter(n=>n.parent).map(n=>({dataset:{glowEdge:n.id},style:{strokeDashoffset:''},animate(frames:{strokeDashoffset:string}[]){events.push([n.id,frames[0].strokeDashoffset,frames[1].strokeDashoffset]);return {finished:Promise.resolve(),cancel(){}};}}));
 const world={querySelectorAll:(selector:string)=>selector==='[data-node]'?elements:edges} as unknown as ParentNode;
 return {events,edges,world};
}

test('the copied tree and motion modules preserve every original byte', async () => {
 assert.deepEqual(await readFile('src/domain/tree-paths.js'),await readFile('reference/site/tree-paths.js'));
 assert.deepEqual(await readFile('src/lib/motion.js'),await readFile('reference/site/motion.js'));
});

test('root paths, shortest routes, cycle prevention and disconnected roots match check-trees', () => {
 assert.deepEqual(rootPath(nodes,'leaf'),['r','a','leaf']);
 assert.deepEqual(routeBetween(nodes,null,'leaf').extend,['a','leaf']);
 const route=routeBetween(nodes,'leaf','b');
 assert.deepEqual(route.retract,['leaf','a']);assert.deepEqual(route.extend,['b']);assert.deepEqual(route.shared,['r']);
 assert.deepEqual(routeBetween(nodes,'leaf','a').extend,[]);
 assert.deepEqual(routeBetween(nodes,'a','a').retract,[]);
 assert(routeBetween(nodes,'leaf','other').disconnected);
 assert(!canConnect(nodes,'leaf','r'));assert(!canConnect(nodes,'a','a'));
 assert(canConnect(nodes,'b','leaf'));assert(canConnect(nodes,'','leaf'));
});

test('ancestor, descendant and sibling navigation retract only the non-shared path', () => {
 assert.deepEqual(routeBetween(nodes,'a','leaf'),{oldPath:['r','a'],newPath:['r','a','leaf'],shared:['r','a'],retract:[],extend:['leaf'],disconnected:false});
 assert.deepEqual(routeBetween(nodes,'leaf','r').retract,['leaf','a']);
 assert.deepEqual(routeBetween(nodes,'leaf','r').extend,[]);
 assert.deepEqual(routeBetween(nodes,'a','b').retract,['a']);
 // Disconnected roots never animate a root, and never invent an edge between them.
 assert.deepEqual(routeBetween(nodes,'leaf','other').extend,[]);
});

test('glow animates in reverse then forward order and settles the final edges', async () => {
 const {events,edges,world}=fakeWorld();
 const animator=createPathAnimator(world,nodes,()=>false);
 await animator.select('leaf');assert.deepEqual(events,[['a','1','0'],['leaf','1','0']]);
 events.length=0;await animator.select('b');
 assert.deepEqual(events,[['leaf','0','1'],['a','0','1'],['b','1','0']]);
 assert.equal(edges.find(x=>x.dataset.glowEdge==='b')!.style.strokeDashoffset,'0');
 assert.equal(edges.find(x=>x.dataset.glowEdge==='a')!.style.strokeDashoffset,'1');
 animator.destroy();
});

test('rapid selection cancels the old sequence and settles on the last node', async () => {
 const {edges,world}=fakeWorld();
 const animator=createPathAnimator(world,nodes,()=>false);
 const first=animator.select('leaf'),second=animator.select('b'),last=animator.select('leaf');
 await Promise.all([first,second,last]);
 const lit=edges.filter(x=>x.style.strokeDashoffset==='0').map(x=>x.dataset.glowEdge).sort();
 assert.deepEqual(lit,['a','leaf']);
 animator.destroy();
});

test('paused selection settles immediately without animating', async () => {
 const {events,edges,world}=fakeWorld();
 const reduced=createPathAnimator(world,nodes,()=>true);
 await reduced.select('leaf');
 assert.equal(events.length,0);
 assert.equal(edges.find(x=>x.dataset.glowEdge==='leaf')!.style.strokeDashoffset,'0');
 reduced.destroy();
});

test('tree validation accepts multiple roots and rejects cycles, missing or cross-tree parents', () => {
 assert.equal(treeProblem([node('r'),node('a','r'),node('s')]),'');
 assert.match(treeProblem([node('a','b'),node('b','a')]),/cycle/);
 assert.match(treeProblem([node('a','a')]),/cycle/);
 assert.match(treeProblem([node('a','ghost')]),/outside this tree/);
 assert.match(treeProblem([node('a','cert1')]),/outside this tree/);
 assert.match(treeProblem([node('a'),node('a')]),/Duplicate/);
 assert.match(treeProblem([node('a','',901,0)]),/0–900/);
 assert.match(treeProblem([node('a','',Number.NaN,0)]),/0–900/);
 // Inherited object names are not nodes.
 assert.match(treeProblem([node('a','constructor')]),/outside this tree/);
});

test('the demo trees are valid, independent, and keep a selection across switches', () => {
 assert.equal(treeProblem(content.achievements as Advancement[]),'');
 assert.equal(treeProblem(content.certifications as Advancement[]),'');
 const achievementIds=new Set(content.achievements.map(x=>x.id));
 assert(content.certifications.every(x=>!achievementIds.has(x.parent)));
 assert.equal(initialSelection(content.certifications as Advancement[],'ach2'),'cert1');
 assert.equal(initialSelection(content.achievements as Advancement[],'ach3'),'ach3');
 assert.equal(initialSelection([],'ach3'),undefined);
});
