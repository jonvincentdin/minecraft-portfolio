import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const out = 'test-results/m03'; await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await context.addInitScript(() => {
 const stats = window.__lifecycle = { frames: new Set(), buffers: 0, programs: 0, observers: 0, draws: 0 };
 const raf = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window);
 window.requestAnimationFrame = callback => { const id = raf(time => { stats.frames.delete(id); callback(time); }); stats.frames.add(id); return id; };
 window.cancelAnimationFrame = id => { stats.frames.delete(id); cancel(id); };
 for (const name of ['ResizeObserver','IntersectionObserver']) {
  const Original = window[name]; window[name] = class extends Original { constructor(cb) { super(cb); stats.observers++; this.active = true; } disconnect() { if (this.active) { stats.observers--; this.active = false; } super.disconnect(); } };
 }
 for (const [create, del, key] of [['createBuffer','deleteBuffer','buffers'],['createProgram','deleteProgram','programs']]) {
  const proto = WebGLRenderingContext.prototype, originalCreate = proto[create], originalDelete = proto[del];
  proto[create] = function(...args) { const result = originalCreate.apply(this,args); if(result) stats[key]++; return result; };
  proto[del] = function(value) { if(value) stats[key]--; return originalDelete.call(this,value); };
 }
 const draw = WebGLRenderingContext.prototype.drawArrays;
 WebGLRenderingContext.prototype.drawArrays = function(...args) { stats.draws++; return draw.apply(this,args); };
});

const page=await context.newPage(),reference=await context.newPage(),errors=[];
for(const p of [page,reference])p.on('pageerror',e=>errors.push(e.message));
async function enter(p,url){await p.goto(url);await p.locator('#skip-intro:not([disabled])').click();await p.locator('#loader').waitFor({state:p===reference?'hidden':'detached'});await p.evaluate(()=>location.hash='skills');await p.locator('#workshop-table').waitFor();await p.evaluate(()=>document.fonts.ready);}
async function settled(p){await p.mouse.move(0,0);await p.evaluate(()=>scrollTo(0,0));await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));}
// After a fullPage capture Chromium composites the dialog backdrop's blur(5px) edge with up
// to 6/255 drift that depends on layer history, not on markup or CSS (both sides have the same
// dialog tree and identical pixels underneath). Exact pairs therefore disable the blur on both
// sides; the as-rendered pair is kept as *-blur.png and reported separately.
async function blur(p,on){await p.evaluate(on=>{let s=document.getElementById('qa-no-blur');if(!s){s=document.createElement('style');s.id='qa-no-blur';s.textContent='.craft-dialog::backdrop{backdrop-filter:none!important}';document.head.append(s);}s.disabled=on;},on);}
async function shoot(p,file){await blur(p,true);await p.screenshot({path:file.replace('.png','-blur.png')});await blur(p,false);await p.screenshot({path:file});await blur(p,true);}
await enter(page,'http://127.0.0.1:5173');await enter(reference,'http://127.0.0.1:4174');
const initialSkills=await page.locator('#real-skills').textContent();assert.equal(await page.locator('.loadout-card').count(),6);
for(const size of [{width:1440,height:900},{width:390,height:844},{width:1366,height:768},{width:1024,height:768},{width:768,height:1024}]){
 for(const p of [page,reference]){await p.setViewportSize(size);await p.evaluate(()=>scrollTo(0,0));await settled(p);}
 for(const [p,kind] of [[page,'react'],[reference,'reference']])await p.screenshot({path:out+'/'+kind+'-skills-'+size.width+'.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'route overflow');
 for(const p of [page,reference]){await p.locator('#open-workbench').click();await settled(p);}
 for(const [p,kind] of [[page,'react'],[reference,'reference']])await shoot(p,out+'/'+kind+'-workshop-'+size.width+'.png');
 assert.ok(await page.locator('#craft-dialog').evaluate(d=>d.getBoundingClientRect().width<=innerWidth),'dialog overflow');
 for(const p of [page,reference])await p.keyboard.press('Escape');
}

await page.setViewportSize({width:1440,height:900});await reference.setViewportSize({width:1440,height:900});
for(const p of [page,reference]){
 await p.locator('#open-workbench').click();
 for(const id of ['html','css','javascript','react']){await p.locator('.recipe-pick[data-recipe="recipe-'+id+'"]').click();await p.locator('#take-output').click();}
 await p.locator('#close-workbench').focus();await p.evaluate(()=>{document.querySelector('.craft-work-area').scrollTop=0;document.querySelector('.recipe-book').scrollTop=0;});await settled(p);
}
for(const [p,kind] of [[page,'react'],[reference,'reference']]){
 console.log(kind,await p.locator('[data-ingredient="book"] img').evaluate(i=>({rect:JSON.stringify(i.getBoundingClientRect()),width:getComputedStyle(i).width,height:getComputedStyle(i).height})));
 await shoot(p,out+'/'+kind+'-react-crafted.png');
}
await browser.close();
