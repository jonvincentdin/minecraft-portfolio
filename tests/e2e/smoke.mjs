import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const out = 'test-results/m01'; await mkdir(out, { recursive: true });
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
const errors=[];
const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
await page.goto('http://127.0.0.1:5173/#projects');
await page.locator('#loader[data-phase="ready"]').waitFor();
assert.equal(await page.locator('#main').evaluate(el=>el.inert),true);
await page.waitForTimeout(10000);
assert.equal(await page.locator('#loader').count(),1);
await page.keyboard.press('Tab');assert.equal(await page.locator('#skip-intro').evaluate(el=>el===document.activeElement),true);
await page.screenshot({path:out+'/react-intro-desktop.png',fullPage:true});
await page.locator('#skip-intro').click();
await page.locator('#loader').waitFor({state:'detached'});
assert.equal(await page.locator('#main').evaluate(el=>el===document.activeElement&&!el.inert),true);
assert.equal(new URL(page.url()).hash,'#home');
await page.locator('canvas#world').waitFor();
await page.screenshot({path:out+'/react-home-desktop.png',fullPage:true});
const gpu=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl');const debug=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(debug.UNMASKED_RENDERER_WEBGL);});
for(let i=0;i<2;i++){
 await page.getByRole('button',{name:'Replay intro'}).click();
 await page.locator('#loader[data-phase="ready"]').waitFor();
 await page.locator('#skip-intro').click();
 await page.locator('#loader').waitFor({state:'detached'});
 assert.equal(await page.locator('.intro-shutters').count(),0);
 assert.equal(await page.locator('canvas').count(),1);
}
for(let i=0;i<3;i++){
 await page.getByRole('link',{name:'Advancements',exact:true}).click();
 await page.getByRole('heading',{name:'Collected along the way.',exact:true}).waitFor();
 assert.deepEqual(await page.evaluate(()=>({frames:__lifecycle.frames.size,buffers:__lifecycle.buffers,programs:__lifecycle.programs,observers:__lifecycle.observers})),{frames:0,buffers:0,programs:0,observers:0});
 await page.getByRole('link',{name:'Spawn',exact:true}).click();await page.locator('canvas').waitFor();
}
await page.getByRole('button',{name:'GitHub'}).click();await page.locator('#toast.visible').waitFor();
const ref=await context.newPage();ref.on('pageerror',error=>errors.push('reference: '+error.message));
// Same deep link as the React page above, so the page staged under the intro matches (the reference also returns to #home on entry).
await ref.goto('http://127.0.0.1:4174/#projects');await ref.locator('#skip-intro:not([disabled])').waitFor();
await ref.waitForTimeout(1000);
await ref.screenshot({path:out+'/reference-intro-desktop.png',fullPage:true});
await ref.locator('#skip-intro').click();await ref.locator('#loader').waitFor({state:'hidden'});
await ref.screenshot({path:out+'/reference-home-desktop.png',fullPage:true});
const sizes=[[390,844],[1366,768],[1024,768],[768,1024]];
await page.waitForTimeout(5600);
for(const [width,height] of sizes){
 await page.setViewportSize({width,height});await ref.setViewportSize({width,height});
 await page.mouse.move(0,0);await ref.mouse.move(0,0);
 await page.screenshot({path:out+'/react-home-'+width+'.png',fullPage:true});
 await ref.screenshot({path:out+'/reference-home-'+width+'.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+width);
}
await page.getByRole('button',{name:'Replay intro'}).click();await page.screenshot({path:out+'/react-intro-tablet.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/react-intro-mobile.png',fullPage:true});
await page.locator('#skip-intro').click();await page.locator('#loader').waitFor({state:'detached'});
// Real timing and interruption on an independent normal-motion document.
const normal=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
const np=await normal.newPage();np.on('pageerror',error=>errors.push(error.message));
await np.goto('http://127.0.0.1:5173');await np.locator('#loader[data-phase="ready"]').waitFor();
const start=Date.now();await np.locator('#skip-intro').click();
await np.locator('.intro-shutters > span').last().waitFor();assert.equal(await np.locator('.intro-shutters > span').count(),8);
// Near the end of the exit no landscape piece may still cover the page: they fade out as they rise, so nothing
// (notably the large ground plane, which stops over the header) is left on screen to vanish when the loader is removed.
await np.waitForTimeout(Math.max(0,1050-(Date.now()-start)));
const leftovers=await np.evaluate(()=>[...document.querySelectorAll('#loader .cinema-landscape > *, #loader .cinema-content > *, #loader .cinema-bottom > *')].filter(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&Number(getComputedStyle(el).opacity)>0.05;}).map(el=>el.className));
assert.ok(await np.locator('#loader').count(),'the loader is still present when checked');
assert.deepEqual(leftovers,[],'intro pieces still visible at the end of the exit');
await np.locator('#loader').waitFor({state:'detached'});const duration=Date.now()-start;assert.ok(duration>=1200&&duration<2500,'entry duration '+duration);
await np.getByRole('button',{name:'Replay intro'}).click();await np.locator('#skip-intro').click();
await np.emulateMedia({reducedMotion:'reduce'});await np.locator('#loader').waitFor({state:'detached'});
assert.equal(await np.locator('#main').evaluate(el=>getComputedStyle(el).opacity),'1');
await np.emulateMedia({reducedMotion:'no-preference'});
await np.evaluate(()=>{location.hash='projects';setTimeout(()=>location.hash='experience',20);setTimeout(()=>location.hash='contact',40);});
await np.getByRole('heading',{name:'Let’s write the next chapter.',exact:true}).waitFor();assert.equal(await np.locator('#main').evaluate(el=>getComputedStyle(el).opacity),'1');
await np.getByRole('button',{name:'Pause motion'}).click();assert.equal(await np.locator('body').evaluate(el=>el.classList.contains('paused')),true);
await normal.close();
const fallback=await browser.newContext({reducedMotion:'reduce'});
await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);};});
const fp=await fallback.newPage();fp.on('pageerror',error=>errors.push(error.message));
await fp.goto('http://127.0.0.1:5173');await fp.locator('#skip-intro:not([disabled])').waitFor();await fp.locator('#skip-intro').click();
await fp.locator('img.model-fallback').waitFor();assert.ok(await fp.locator('img.model-fallback').evaluate(img=>img.complete&&img.naturalWidth>0));
await fp.screenshot({path:out+'/react-fallback.png',fullPage:true});await fallback.close();
const failed=await context.newPage();await failed.route('**/scene-data.json',route=>route.abort());await failed.goto('http://127.0.0.1:5173');
await failed.locator('#skip-intro:not([disabled])').waitFor();assert.match(await failed.locator('#load-status').textContent(),/thumbnails/);await failed.locator('#skip-intro').click();await failed.locator('.model-fallback').waitFor();
assert.equal((await page.request.get('http://127.0.0.1:5173/downloads/Character_and_Item_Models.zip')).status(),200);
await writeFile(out+'/report.json',JSON.stringify({gpu,errors,entryDurationMs:duration,checks:['ready waits 10 seconds','focus trap and inert shell','two replays','8 exit strips','reduced motion mid-exit','rapid hash changes','three renderer teardown cycles','WebGL and thumbnail fallback','scene fetch failure','downloads','five responsive sizes']},null,2));
assert.deepEqual(errors,[]);console.log(JSON.stringify({gpu,errors,entryDurationMs:duration}));
await browser.close();
