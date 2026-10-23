import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const out = 'test-results/m02'; await mkdir(out, { recursive: true });
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
const page=await context.newPage(), reference=await context.newPage(), errors=[];
for(const p of [page,reference])p.on('pageerror',e=>errors.push(e.message));
async function enter(p,url){await p.goto(url);await p.locator('#skip-intro:not([disabled])').waitFor();await p.locator('#skip-intro').click();await p.locator('#loader').waitFor({state:p===reference?'hidden':'detached'});}
await enter(page,'http://127.0.0.1:5173');await enter(reference,'http://127.0.0.1:4174');
async function route(p,id){await p.evaluate(id=>location.hash=id,id);await p.locator('nav a[aria-current="page"][href="#'+id+'"]').waitFor();await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));}
for(const size of [{width:1440,height:900},{width:390,height:844}]){
 await page.setViewportSize(size);await reference.setViewportSize(size);
 for(const id of ['about','projects','experience','contact']){
  await route(page,id);await route(reference,id);
  await page.mouse.move(0,0);await reference.mouse.move(0,0);
  await page.screenshot({path:out+'/react-'+id+'-'+size.width+'.png',fullPage:true});
  await reference.screenshot({path:out+'/reference-'+id+'-'+size.width+'.png',fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+id);
 }
}

for(const size of [{width:1440,height:900},{width:390,height:844}]){
 for(const p of [page,reference]){await p.setViewportSize(size);await route(p,'projects');await p.getByRole('button',{name:/Open project/}).click();await p.mouse.move(0,0);await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));}
 const suffix=size.width===1440?'desktop':'mobile';
 await page.screenshot({path:out+'/react-project-modal-'+suffix+'.png'});await reference.screenshot({path:out+'/reference-project-modal-'+suffix+'.png'});
 for(const p of [page,reference])await p.keyboard.press('Escape');
}
await browser.close();
