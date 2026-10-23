import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const out='test-results/m04';await mkdir(out,{recursive:true});
const REACT='http://127.0.0.1:5173',REFERENCE='http://127.0.0.1:4174';
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],checks=[];
const check=name=>{checks.push(name);console.log('ok -',name);};

// Records every Web Animation with the attributes the reference contract fixes.
function recordAnimations(){
 window.__anim=[];const original=Element.prototype.animate;
 Element.prototype.animate=function(keyframes,options){
  const el=this,first=keyframes[0]||{},last=keyframes[keyframes.length-1]||{};
  const tag=el.dataset?.glowEdge?'edge:'+el.dataset.glowEdge:el.dataset?.node?'node:'+el.dataset.node:el.classList?.contains('interaction-pixel')?'pixel':(typeof el.className==='string'&&el.className.split(' ')[0])||el.id||el.tagName;
  window.__anim.push({tag,from:first.strokeDashoffset??first.opacity??first.filter??null,to:last.strokeDashoffset??last.opacity??last.filter??null,duration:options?.duration,delay:options?.delay||0,easing:options?.easing||'linear',fill:options?.fill||'auto'});
  return original.call(this,keyframes,options);
 };
}
function trackLifecycle(){
 const stats=window.__lifecycle={frames:new Set(),observers:0};
 const raf=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
 window.requestAnimationFrame=callback=>{const id=raf(time=>{stats.frames.delete(id);callback(time);});stats.frames.add(id);return id;};
 window.cancelAnimationFrame=id=>{stats.frames.delete(id);cancel(id);};
 for(const name of ['ResizeObserver','IntersectionObserver']){const Original=window[name];window[name]=class extends Original{constructor(cb,o){super(cb,o);stats.observers++;this.active=true;}disconnect(){if(this.active){stats.observers--;this.active=false;}super.disconnect();}};}
}
async function open(context,url,route='achievements'){
 const p=await context.newPage();p.on('pageerror',e=>errors.push(url+': '+e.message));
 await p.goto(url);await p.locator('#skip-intro:not([disabled])').click();
 await p.locator('#loader').waitFor({state:url===REFERENCE?'hidden':'detached'});
 await go(p,route);await p.evaluate(()=>document.fonts.ready);return p;
}
async function go(p,route){await p.evaluate(r=>location.hash=r,route);await p.waitForFunction(r=>r!=='achievements'||!!document.querySelector('#map-world'),route);await p.waitForTimeout(220);}
// No script-driven animation still running; CSS animations are owned by the stylesheet.
const quiet=p=>p.waitForFunction(()=>document.getAnimations().filter(a=>!(a instanceof CSSAnimation||a instanceof CSSTransition)&&a.playState==='running').length===0,null,{timeout:8000});
const state=p=>p.evaluate(()=>({
 edges:[...document.querySelectorAll('[data-glow-edge]')].filter(e=>e.style.strokeDashoffset==='0').map(e=>e.dataset.glowEdge).sort(),
 lit:[...document.querySelectorAll('.path-lit')].map(e=>e.dataset.node).sort(),
 active:[...document.querySelectorAll('[data-node].active')].map(e=>e.dataset.node),
 pressed:[...document.querySelectorAll('[data-node][aria-pressed="true"]')].map(e=>e.dataset.node),
 title:document.querySelector('#adv-inspector h2')?.textContent??null,
 transform:document.querySelector('#map-world')?.style.transform,
 zoom:document.querySelector('#zoom-label')?.textContent,
}));
const both=async(pages,fn)=>Promise.all(pages.map(fn));
const same=async(pages,fn,label)=>{const [a,b]=await both(pages,fn);assert.deepEqual(a,b,label);return a;};
// Structural snapshot: tags, classes, data/aria attributes, placement and raw text, with asset paths normalized.
const structure=p=>p.evaluate(()=>{const walk=el=>({tag:el.tagName,cls:[...el.classList].filter(c=>c!=='active'&&c!=='path-lit').sort().join(' '),attrs:[...el.attributes].filter(a=>/^(data-|aria-|role|viewBox|pathLength|d$|href|target|rel|alt|id$)/.test(a.name)).map(a=>a.name+'='+a.value).sort(),src:el.getAttribute('src')?.replace(/^\//,''),place:el.style?.left?[el.style.left,el.style.top,el.style.getPropertyValue('--delay')]:undefined,text:[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.nodeValue).join('|'),children:[...el.children].map(walk)});return walk(document.querySelector('.advancement-page'));});

try {
 // ---- Structure, selection, pan/zoom and list parity, reduced motion ----
 const still=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await still.addInitScript(trackLifecycle);
 const pages=[await open(still,REACT),await open(still,REFERENCE)];
 await same(pages,structure,'initial achievements markup');
 assert.deepEqual((await state(pages[0])).lit,['ach1']);check('markup matches the reference; first root selected and lit');
 for(const [id,edges,lit] of [['ach4',['ach2','ach4'],['ach1','ach2','ach4']],['ach3',['ach3'],['ach1','ach3']],['ach1',[],['ach1']],['ach2',['ach2'],['ach1','ach2']]]){
  await both(pages,p=>p.locator(`[data-node="${id}"]`).click());
  const s=await same(pages,state,'selection '+id);assert.deepEqual([s.edges,s.lit,s.active,s.pressed],[edges,lit,[id],[id]],id);
  await same(pages,p=>p.locator('#adv-inspector').innerText(),'inspector '+id);
 }
 check('ancestor, descendant and sibling selections light exactly the root path; inspector text matches');
 await both(pages,async p=>{await p.locator('[data-node="ach3"]').focus();await p.keyboard.press('Enter');});
 assert.equal((await same(pages,state,'keyboard')).title,'Built together');check('keyboard Enter selects a focused node');
 const steps=[['+',6],['-',10]];
 for(const [sign,count] of steps)for(let i=0;i<count;i++){await both(pages,p=>p.locator(`[data-zoom="${sign}"]`).click());await same(pages,state,'zoom '+sign+i);}
 assert.equal((await state(pages[0])).zoom,'50%');
 for(const [dx,dy] of [[2000,2000],[-3000,-3000],[-120,80]]){
  await both(pages,async p=>{const box=await p.locator('#map-viewport').boundingBox();const x=box.x+box.width-12,y=box.y+box.height-12;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+dx,y+dy,{steps:6});await p.mouse.up();});
  await same(pages,state,'pan '+dx);
 }
 assert.equal(await pages[0].locator('#map-viewport.panning').count(),0);
 await both(pages,p=>p.getByRole('button',{name:'Center map'}).click());
 assert.equal((await same(pages,state,'center')).transform,'translate(30px, 25px) scale(1)');check('zoom clamps 50–180%, pan clamps and Center map match the reference');
 await both(pages,p=>p.locator('[data-tree="certifications"]').click());
 await same(pages,structure,'certifications markup');
 assert.deepEqual((await state(pages[0])).lit,['cert1']);
 await both(pages,p=>p.locator('[data-node="cert3"]').click());await same(pages,state,'cert3');
 await same(pages,p=>p.locator('#adv-inspector').innerText(),'credential inspector');check('certification tree is separate, resets selection and has credential wording');
 await both(pages,p=>p.locator('[data-list]').click());
 await same(pages,structure,'list markup');const listed=await same(pages,state,'list view');
 assert.equal(listed.transform,'none');assert.deepEqual(listed.pressed,['cert3']);
 await both(pages,p=>p.locator('[data-zoom="+"]').click());assert.equal((await same(pages,state,'zoom ignored in list')).zoom,'100%');
 await both(pages,p=>p.locator('[data-node="cert2"]').click());await same(pages,state,'list select');
 await both(pages,p=>p.locator('[data-list]').click());const back=await same(pages,state,'map again');
 assert.deepEqual([back.lit,back.active],[['cert1','cert2'],['cert2']]);check('list view keeps selection, ignores zoom and restores the map path');
 // Lifecycle: leaving the trees releases frames and observers, three times.
 for(let i=0;i<3;i++){
  await go(pages[0],'home');await go(pages[0],'achievements');await pages[0].locator('[data-node="ach4"]').click();await pages[0].locator('[data-zoom="+"]').click();
  await go(pages[0],'contact');
  assert.deepEqual(await pages[0].evaluate(()=>({frames:__lifecycle.frames.size,observers:__lifecycle.observers,running:document.getAnimations().filter(a=>!(a instanceof CSSAnimation||a instanceof CSSTransition)).length})),{frames:0,observers:0,running:0});
 }
 check('three tree teardowns leave no frames, observers or script animations');
 await still.close();

 // ---- Real motion: glow order, timing, rapid clicks, pause and reveal parity ----
 // Separate contexts keep both pages in the foreground, so neither timeline is throttled.
 const moving=await Promise.all([0,1].map(()=>browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'})));
 for(const c of moving)await c.addInitScript(recordAnimations);
 const live=[await open(moving[0],REACT),await open(moving[1],REFERENCE)];
 await both(live,quiet);
 const log=(p,filter)=>p.evaluate(f=>window.__anim.filter(a=>new RegExp(f).test(a.tag)),filter);
 const clear=p=>p.evaluate(()=>{window.__anim.length=0;});
 // Section reveal on the route render.
 const reveal=await same(live,p=>log(p,'^(section-head|adv-toolbar|map-viewport|adv-inspector)$').then(list=>list.map(({tag,duration,delay,easing,fill})=>({tag,duration,delay,easing,fill})).sort((a,b)=>a.tag.localeCompare(b.tag))),'section reveal timing');
 assert(reveal.length>=3&&reveal.every(a=>a.duration===460&&a.easing==='cubic-bezier(.16,1,.3,1)'&&a.fill==='backwards'),'reveal contract');
 check('section reveals match: 460ms, 42ms index stagger, backwards fill');
 await both(live,clear);
 await both(live,p=>p.locator('[data-node="ach4"]').click());await both(live,quiet);
 await both(live,clear);
 await both(live,p=>p.locator('[data-node="ach3"]').click());await both(live,quiet);
 const glow=await same(live,p=>log(p,'^(edge|node):'),'retract/extend order');
 assert.deepEqual(glow.map(a=>[a.tag,a.from,a.to]),[['edge:ach4','0','1'],['edge:ach2','0','1'],['edge:ach3','1','0'],['node:ach3','brightness(1)','brightness(1)']]);
 assert(glow.filter(a=>a.tag.startsWith('edge')).every(a=>a.duration===280&&a.easing==='ease-in-out'&&a.fill==='forwards'));
 assert.equal(glow.at(-1).duration,400);
 check('sibling route retracts in reverse, then extends; 280ms ease-in-out edges, 400ms node pulse');
 // The detail entrance replays on every selection.
 const entrance=await same(live,p=>p.evaluate(()=>[...document.querySelectorAll('#adv-inspector>*')].map(el=>el.getAnimations().map(a=>a.animationName).join(','))),'inspector entrance');
 assert(entrance.every(name=>name==='detailArrive'));check('inspector children replay detailArrive on selection');
 for(const p of live){for(const id of ['ach4','ach1','ach2','ach3','ach4']){await p.locator(`[data-node="${id}"]`).click();await p.waitForTimeout(40);}}
 await both(live,quiet);
 const rapid=await same(live,state,'rapid clicks');
 assert.deepEqual([rapid.edges,rapid.lit,rapid.active],[['ach2','ach4'],['ach1','ach2','ach4'],['ach4']]);check('five rapid clicks settle on the last node in both');
 // Pause mid-route settles at once (deliberate: the reference lets the sequence finish).
 const [r]=live;
 await r.locator('[data-node="ach3"]').click();await r.waitForTimeout(60);await r.locator('#motion').click();
 await r.waitForTimeout(30);
 assert.equal(await r.evaluate(()=>document.getAnimations().filter(a=>!(a instanceof CSSAnimation||a instanceof CSSTransition)&&a.playState==='running').length),0);
 assert.deepEqual((await state(r)).edges,['ach3']);await r.locator('#motion').click();await r.waitForFunction(()=>!document.body.classList.contains('paused'));
 await r.locator('[data-node="ach4"]').click();await r.waitForTimeout(60);await r.emulateMedia({reducedMotion:'reduce'});await r.waitForFunction(()=>document.body.classList.contains('paused'));
 assert.deepEqual((await state(r)).edges,['ach2','ach4']);await r.emulateMedia({reducedMotion:'no-preference'});
 check('pause or a reduced-motion change mid-route settles the glow immediately');
 // Route exit and section cancellation leave nothing invisible.
 const groups='.section-head,.contact-book>*,.adv-toolbar,.adv-explorer>*';
 const hidden=p=>p.evaluate(s=>[...document.querySelectorAll(s)].filter(el=>getComputedStyle(el).opacity!=='1'||el.getAnimations().some(a=>!(a instanceof CSSAnimation||a instanceof CSSTransition))).map(el=>el.className+' '+getComputedStyle(el).opacity+' '+el.getAnimations().map(a=>a.constructor.name+':'+a.playState+':'+a.effect.getTiming().duration).join(',')),groups);
 const visible=async p=>{const left=await hidden(p);if(left.length)console.log(p.url(),left);return !left.length;};
 for(const p of live){await p.evaluate(()=>location.hash='contact');await p.waitForTimeout(180);await p.locator('#motion').click();await p.waitForTimeout(40);assert(await visible(p),'paused reveal settles');await p.locator('#motion').click();}
 for(const p of live){await p.evaluate(()=>location.hash='achievements');await p.waitForTimeout(200);await p.evaluate(()=>location.hash='contact');await p.waitForTimeout(500);await quiet(p);assert(await visible(p),'interrupted route settles');}
 check('pausing mid-reveal and interrupting a route leave every group fully opaque');
 // Pixel feedback on .btn only, from the pointer or the button centre.
 await both(live,clear);
 const burst=await same(live,async p=>{const b=p.locator('#main button.btn').first();await b.click();const n=await p.locator('.interaction-pixel').count();const timing=(await log(p,'^pixel$')).map(({duration,easing})=>({duration,easing}));await p.waitForTimeout(700);return {n,timing,after:await p.locator('.interaction-pixel').count()};},'pixel burst');
 assert.deepEqual([burst.n,burst.timing.length,burst.timing[0].duration,burst.after],[6,6,440,0]);
 const centred=await same(live,async p=>{const b=p.locator('#main button.btn').first();await b.focus();await p.keyboard.press('Enter');const box=await b.boundingBox();const left=await p.locator('.interaction-pixel').first().evaluate(e=>parseFloat(e.style.left));await p.waitForTimeout(700);return Math.abs(left-(box.x+box.width/2))<1;},'keyboard burst');
 assert(centred);
 await both(live,p=>p.locator('#motion').click());
 assert.deepEqual(await both(live,async p=>{await p.locator('#main button.btn').first().click();return p.locator('.interaction-pixel').count();}),[0,0]);
 await both(live,p=>p.locator('#motion').click());
 check('pixel bursts: six 440ms pixels, centred for keyboard, none while paused, all removed');
 // Shared reveal parity on every public route, entered from another route as a visitor would.
 const revealed={};
 for(const route of ['about','projects','skills','experience','achievements','contact','home']){
  await both(live,clear);await both(live,p=>p.evaluate(r=>location.hash=r,route));await both(live,p=>p.waitForTimeout(1400));
  revealed[route]=await same(live,p=>log(p,'.').then(list=>list.filter(a=>a.duration===460).map(({tag,delay,easing,fill})=>tag+'@'+delay+':'+easing+':'+fill).sort()),'reveal on '+route);
  assert(await visible(live[0])&&await visible(live[1]),'settled '+route);
 }
 check('section reveals match the reference on all seven routes ('+Object.entries(revealed).map(([r,l])=>r+' '+l.length).join(', ')+')');
 // Hover and press come from the stylesheet; compare the settled transforms.
 const lift=await same(live,async p=>{const b=p.locator('#main .btn').first();await b.hover();await p.waitForTimeout(400);const hover=await b.evaluate(e=>getComputedStyle(e).transform);await p.mouse.down();await p.waitForTimeout(300);const press=await b.evaluate(e=>getComputedStyle(e).transform);await p.mouse.up();await p.mouse.move(0,0);return {hover,press};},'hover and press');
 assert.notEqual(lift.hover,'none');
 check('button hover and press transforms match ('+lift.hover+' / '+lift.press+')');
 for(const c of moving)await c.close();

 // ---- StrictMode fixture: disconnected roots and invalid trees ----
 await writeFile('test-results/m04-fixture.tsx',`import React,{StrictMode,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AdvancementsPage} from '/src/features/advancements/AdvancementsPage';
import seed from '/src/data/demo-content.json';
import '/src/styles/reference.css';
import '/src/styles/foundation.css';
function Fixture(){
 const [content,setContent]=useState(()=>{const c=structuredClone(seed);const base=c.achievements[3];c.achievements.push({...base,id:'ach5',title:'Second root',parent:'',x:620,y:310},{...base,id:'ach6',title:'Second branch',parent:'ach5',x:860,y:310});return c;});
 return <><button id="break-tree" onClick={()=>setContent(c=>{const n=structuredClone(c);n.certifications[0].parent='cert3';return n;})}>Break certifications</button><AdvancementsPage content={content} paused={false}/></>;
}
createRoot(document.getElementById('root')).render(<StrictMode><Fixture/></StrictMode>);
`);
 await writeFile('test-results/m04-fixture.html','<!doctype html><html><body><div id="root"></div><script type="module" src="/test-results/m04-fixture.tsx"></script></body></html>');
 const fixture=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
 await fixture.addInitScript(recordAnimations);
 const f=await fixture.newPage();f.on('pageerror',e=>errors.push('fixture: '+e.message));
 await f.goto(REACT+'/test-results/m04-fixture.html');await f.locator('#map-world').waitFor();await quiet(f);
 assert.equal(await f.locator('[data-glow-edge="ach5"]').count(),0,'roots are never joined by an edge');
 await f.locator('[data-node="ach4"]').click();await quiet(f);
 await f.evaluate(()=>{window.__anim.length=0;});
 await f.locator('[data-node="ach6"]').click();await quiet(f);
 const jump=await f.evaluate(()=>window.__anim.filter(a=>a.tag.startsWith('edge:')).map(a=>[a.tag,a.from,a.to]));
 assert.deepEqual(jump,[['edge:ach4','0','1'],['edge:ach2','0','1'],['edge:ach6','1','0']],'StrictMode runs one sequence across disconnected roots');
 const split=await state(f);assert.deepEqual([split.edges,split.lit],[['ach6'],['ach5','ach6']]);
 check('disconnected roots clear the old path and start the new root, once, under StrictMode');
 await f.locator('#break-tree').click();await f.locator('[data-tree="certifications"]').click();
 assert.match(await f.getByRole('alert').innerText(),/Certification tree unavailable: .*cycle/);
 assert.equal(await f.locator('#map-world [data-node]').count(),0);
 await f.locator('[data-tree="achievements"]').click();assert.equal(await f.getByRole('alert').count(),0);
 check('an invalid tree is reported and not drawn; the other tree still works');
 await fixture.close();
} finally {
 await writeFile(out+'/report.json',JSON.stringify({errors,checks},null,2));
 await browser.close();
}
assert.deepEqual(errors,[]);
console.log('M04 browser checks passed ('+checks.length+')');
