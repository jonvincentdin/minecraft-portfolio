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
await page.setViewportSize({width:1440,height:900});await reference.setViewportSize({width:1440,height:900});
await route(page,'about');
await page.getByRole('button',{name:'The player',exact:true}).click();await page.locator('#portraitModel').waitFor();
await page.screenshot({path:out+'/react-about-avatar.png',fullPage:true});
const journal=page.locator('.paper .toolbar button');await journal.nth(1).click();assert.equal(await journal.nth(1).getAttribute('aria-pressed'),'true');
await page.getByRole('button',{name:'The person',exact:true}).click();assert.equal(await page.locator('canvas').count(),0);
await route(page,'projects');await route(reference,'projects');
await page.getByRole('button',{name:'Open project →',exact:true}).click();await reference.getByRole('button',{name:'Open project →',exact:true}).click();
await page.mouse.move(0,0);await reference.mouse.move(0,0);
await page.screenshot({path:out+'/react-project-modal-desktop.png',fullPage:true});
await reference.screenshot({path:out+'/reference-project-modal-desktop.png',fullPage:true});
const firstImage=await page.locator('.case-hero').getAttribute('src');
await page.getByRole('button',{name:'View image 2'}).click();assert.notEqual(await page.locator('.case-hero').getAttribute('src'),firstImage);
assert.match(await page.locator('#photo-caption').textContent(),/Demo artwork/);
await page.keyboard.press('Escape');await reference.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Open project →',exact:true}).evaluate(el=>el===document.activeElement),true);
// Move to empty, swap with occupied, disable edits when filtered, persist and reset.
const slot=i=>page.locator('[data-slot="'+i+'"]');
const first=await slot(0).getAttribute('data-project'),second=await slot(1).getAttribute('data-project');
await page.getByRole('button',{name:'Rearrange items'}).click();await slot(0).click();await slot(25).click();assert.equal(await slot(25).getAttribute('data-project'),first);
await slot(25).click();await slot(1).click();assert.equal(await slot(1).getAttribute('data-project'),first);assert.equal(await slot(25).getAttribute('data-project'),second);
await page.getByRole('button',{name:'Rearrange items'}).click();
await slot(1).dragTo(slot(26));assert.equal(await slot(26).getAttribute('data-project'),first);
const before=await page.evaluate(()=>localStorage.getItem('jvd-slots-v5'));
await page.getByRole('textbox',{name:'Search projects'}).fill('Atlas');
assert.equal(await page.locator('#arrange').isDisabled(),true);assert.equal(await slot(26).getAttribute('draggable'),'false');
assert.equal(await page.evaluate(()=>localStorage.getItem('jvd-slots-v5')),before);
await page.getByRole('textbox',{name:'Search projects'}).fill('');
await page.getByRole('button',{name:'Magic',exact:true}).click();assert.equal(await page.locator('#arrange').isDisabled(),true);
await page.getByRole('button',{name:'All',exact:true}).click();
await route(page,'about');await route(page,'projects');assert.equal(await slot(26).getAttribute('data-project'),first);
await page.getByRole('button',{name:'Reset layout'}).click();assert.equal(await slot(0).getAttribute('data-project'),first);
await page.getByRole('button',{name:'Rearrange items'}).click();await slot(0).focus();await page.keyboard.press('Enter');await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');assert.equal(await slot(1).getAttribute('data-project'),first);
await page.getByRole('button',{name:'Reset layout'}).click();await slot(0).click();
await route(page,'experience');await route(reference,'experience');
for(const id of ['professional','student','casual','builder','explorer']){
 await page.locator('.role-index [data-role="'+id+'"]').click();await page.locator('[data-model="character_'+id+'"]').waitFor();
 assert.equal(await page.locator('canvas').count(),1);
 await page.getByRole('button',{name:'Rotate left',exact:true}).click();await page.getByRole('button',{name:'Rotate right',exact:true}).click();await page.getByRole('button',{name:'Reset view'}).click();
 await page.screenshot({path:out+'/character-'+id+'.png',fullPage:true});
}
await page.getByRole('button',{name:'Wireframe'}).click();assert.equal(await page.getByRole('button',{name:'Wireframe'}).getAttribute('aria-pressed'),'true');
await page.getByRole('button',{name:'Wireframe'}).click();
await page.locator('.role-index [data-role="professional"]').click();
for(const p of [page,reference]){await p.locator('.compare-check input').nth(0).check();await p.locator('.compare-check input').nth(1).check();}
assert.equal(await page.locator('.compare-grid > article').count(),2);
await page.screenshot({path:out+'/react-experience-compare.png',fullPage:true});
await reference.screenshot({path:out+'/reference-experience-compare.png',fullPage:true});
// Resource counts on leaving every model route.
for(const id of ['experience','projects','experience']){
 await route(page,id);await route(page,'contact');
 assert.deepEqual(await page.evaluate(()=>({frames:__lifecycle.frames.size,buffers:__lifecycle.buffers,programs:__lifecycle.programs,observers:__lifecycle.observers})),{frames:0,buffers:0,programs:0,observers:0});
}
await page.getByLabel('NAME',{exact:true}).fill('Browser test');
await page.getByLabel('EMAIL',{exact:true}).fill('test@example.com');
await page.getByLabel('MESSAGE',{exact:true}).fill('A local review, not a sent message.');
await page.getByRole('button',{name:'Review message'}).click();await page.getByRole('dialog',{name:'Message review'}).waitFor();
assert.match(await page.locator('dialog').textContent(),/Nothing was sent/);
await page.getByRole('button',{name:'Continue editing'}).click();
assert.equal(await page.getByLabel('MESSAGE',{exact:true}).inputValue(),'A local review, not a sent message.');
assert.equal(await page.getByRole('button',{name:'Review message'}).evaluate(el=>el===document.activeElement),true);
await page.setViewportSize({width:390,height:844});await reference.setViewportSize({width:390,height:844});
await route(page,'projects');await route(reference,'projects');
for(const p of [page,reference])await p.getByRole('button',{name:'Open project →',exact:true}).click();
await page.screenshot({path:out+'/react-project-modal-mobile.png',fullPage:true});await reference.screenshot({path:out+'/reference-project-modal-mobile.png',fullPage:true});
await page.keyboard.press('Escape');await reference.keyboard.press('Escape');
// Tap alternative and unavailable browser storage (no false remote save).
const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
await touch.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('storage blocked');};});
const tp=await touch.newPage();tp.on('pageerror',e=>errors.push(e.message));await enter(tp,'http://127.0.0.1:5173');
await route(tp,'projects');await tp.getByRole('button',{name:'Rearrange items'}).tap();await tp.locator('[data-slot="0"]').tap();await tp.locator('[data-slot="20"]').tap();
assert.equal(await tp.locator('[data-slot="20"]').getAttribute('data-project'),first);await tp.locator('#toast.visible').waitFor();assert.match(await tp.locator('#toast').textContent(),/storage is unavailable/);
await touch.close();
const fallback=await browser.newContext({reducedMotion:'reduce'});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);};});
const fp=await fallback.newPage();fp.on('pageerror',e=>errors.push(e.message));await enter(fp,'http://127.0.0.1:5173');await route(fp,'experience');await fp.locator('.model-fallback').waitFor();assert.ok(await fp.locator('.model-fallback').evaluate(i=>i.complete&&i.naturalWidth>0));await fallback.close();
assert.deepEqual(errors,[]);
await writeFile(out+'/report.json',JSON.stringify({errors,viewports:['1440x900','390x844'],checks:['four routes','portrait/avatar/journal','case study/gallery/Escape/focus restoration','move/swap/drag/filter/reset/persistence','keyboard rearrangement','five character models and controls','two chapter comparison','three zero-resource route teardowns','unsent contact review preserves fields','emulated touch rearrangement','blocked storage notice','model thumbnail fallback']},null,2));
console.log('M02 browser checks passed');await browser.close();
