import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const out = 'test-results/m00'; await mkdir(out, { recursive: true });
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
const page = await context.newPage(), errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto('http://127.0.0.1:5173');
await page.locator('[data-render-mode]:not([data-render-mode="loading"])').waitFor();
await page.locator('text=Demo mode').waitFor();
const mode = await page.locator('[data-render-mode]').getAttribute('data-render-mode');
const gpu = await page.evaluate(() => {
 const gl = document.querySelector('canvas')?.getContext('webgl'); if (!gl) return null;
 const debug = gl.getExtension('WEBGL_debug_renderer_info');
 return { vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR), renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) };
});
await page.screenshot({ path: out + '/react-desktop.png', fullPage: true });
if (mode === 'webgl') {
 assert.ok(await page.evaluate(() => window.__lifecycle.draws > 0));
 const canvas = page.locator('canvas'), box = await canvas.boundingBox();
 await page.mouse.move(box.x + 100, box.y + 100); await page.mouse.down(); await page.mouse.move(box.x + 170, box.y + 120); await page.mouse.up();
 await page.getByRole('button', { name: 'Rotate left' }).click(); await page.getByRole('button', { name: 'Reset view' }).click();
}
for(let i=0;i<3;i++){
 await page.getByRole('link', { name: 'Projects', exact:true }).click();
 await page.getByRole('heading',{ name:'Projects',exact:true }).waitFor();
 assert.deepEqual(await page.evaluate(() => ({ frames:window.__lifecycle.frames.size, buffers:window.__lifecycle.buffers, programs:window.__lifecycle.programs, observers:window.__lifecycle.observers })), { frames:0,buffers:0,programs:0,observers:0 });
 await page.getByRole('link', { name:'Spawn',exact:true }).click();
 await page.locator('[data-render-mode]:not([data-render-mode="loading"])').waitFor();
 assert.equal(await page.locator('canvas').count(),1);
}
for(const label of ['About','Skills','Experience','Advancements','Contact']){
 await page.getByRole('link',{name:label,exact:true}).click(); await page.getByRole('heading',{name:label,exact:true}).waitFor();
}
await page.goto('http://127.0.0.1:5173/#editor/projects'); await page.getByRole('heading',{name:'Editor',exact:true}).waitFor();
await page.goto('http://127.0.0.1:5173/#home'); await page.locator('[data-render-mode]:not([data-render-mode="loading"])').waitFor();
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:out+'/react-mobile.png',fullPage:true});
assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
await page.keyboard.press('Tab');
for(const path of ['/assets/models/skill_react.glb','/assets/models/scene-data.json','/assets/thumbs/skill_react.png','/assets/fonts/JVDPixel.woff','/assets/fonts/LICENSE.txt','/assets/demos/project-1-1.svg']) assert.equal((await page.request.get('http://127.0.0.1:5173'+path)).status(),200);
assert.equal((await page.request.get('http://127.0.0.1:5173/context/content-seed.json')).status(),403);
const fallback = await browser.newContext();
await fallback.addInitScript(() => { const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);}; });
const fp = await fallback.newPage(); fp.on('pageerror',error=>errors.push(error.message));
await fp.goto('http://127.0.0.1:5173'); await fp.locator('[data-render-mode="fallback"] img').waitFor();
await fp.screenshot({path:out+'/react-fallback.png'});
await fallback.close();
const reference = await context.newPage(); const referenceErrors=[];
reference.on('pageerror',error=>referenceErrors.push(error.message));
await reference.goto('http://127.0.0.1:4174');
await reference.locator('#skip-intro:not([disabled])').waitFor();
await reference.screenshot({path:out+'/reference-intro-desktop.png',fullPage:true});
await reference.locator('#skip-intro').click(); await reference.locator('#loader').waitFor({state:'hidden'});
await reference.screenshot({path:out+'/reference-home-desktop.png',fullPage:true});
const referenceMode=await reference.locator('canvas').evaluateAll(nodes=>nodes.map(n=>({fallback:n.dataset.fallback||false})));
await reference.setViewportSize({width:390,height:844});
await reference.screenshot({path:out+'/reference-home-mobile.png',fullPage:true});
await writeFile(out+'/report.json',JSON.stringify({mode,gpu,referenceMode,errors,referenceErrors,viewports:['1440x900','390x844'],checks:['demo shell','all routes','WebGL draws and mouse rotation','3 teardown/remount cycles with zero RAF/buffer/program/observer leaks','runtime assets','private context blocked','mobile overflow','forced thumbnail fallback']},null,2));
assert.deepEqual(errors,[]); console.log(JSON.stringify({mode,gpu,errors,referenceErrors},null,2));
await browser.close();
