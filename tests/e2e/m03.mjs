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
async function settled(p){await p.mouse.move(0,0);await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));}
await enter(page,'http://127.0.0.1:5173');await enter(reference,'http://127.0.0.1:4174');
const initialSkills=await page.locator('#real-skills').textContent();assert.equal(await page.locator('.loadout-card').count(),6);
for(const size of [{width:1440,height:900},{width:390,height:844},{width:1366,height:768},{width:1024,height:768},{width:768,height:1024}]){
 for(const p of [page,reference]){await p.setViewportSize(size);await p.evaluate(()=>scrollTo(0,0));await settled(p);}
 for(const [p,kind] of [[page,'react'],[reference,'reference']])await p.screenshot({path:out+'/'+kind+'-skills-'+size.width+'.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'route overflow');
 for(const p of [page,reference]){await p.locator('#open-workbench').click();await settled(p);}
 for(const [p,kind] of [[page,'react'],[reference,'reference']])await p.screenshot({path:out+'/'+kind+'-workshop-'+size.width+'.png'});
 assert.ok(await page.locator('#craft-dialog').evaluate(d=>d.getBoundingClientRect().width<=innerWidth),'dialog overflow');
 for(const p of [page,reference])await p.keyboard.press('Escape');
}
console.log('M03 responsive captures complete');
await page.setViewportSize({width:1440,height:900});await reference.setViewportSize({width:1440,height:900});
await page.getByRole('button',{name:'Data & systems',exact:true}).click();assert.equal(await page.locator('.loadout-card').count(),2);
await page.getByRole('button',{name:'All',exact:true}).click();
for(const p of [page,reference])await p.locator('#open-workbench').click();
const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('jvd-workshop-play-v2')).state);
await page.getByRole('button',{name:'View React recipe',exact:true}).click();assert.match(await page.locator('#craft-feedback').textContent(),/Craft HTML, CSS, JavaScript first/);assert.equal(await page.locator('#take-output').count(),0);
for(const [i,id] of ['html','css','javascript','react','sql','api'].entries()){
 for(const p of [page,reference]){
  await p.locator('.recipe-pick[data-recipe="recipe-'+id+'"]').click();
  if(p===page){const s=await stored();assert.equal(s.bag.book,23-i);assert.equal(s.crafted,i);assert.equal(s.grid.filter(Boolean).length,3);}
  await p.locator('#take-output').click();
 }
 let s=await stored();assert.equal(s.bag[id],1);assert.equal(s.crafted,i+1);assert.equal(s.grid.filter(Boolean).length,0);
 if(id==='react'){
  assert.match(await page.locator('[data-ingredient="react"] img').getAttribute('src'),/skill_react.png/);
  for(const p of [page,reference])await settled(p);
  for(const [p,kind] of [[page,'react'],[reference,'reference']])await p.screenshot({path:out+'/'+kind+'-react-crafted.png'});
 }
}
assert.equal(await page.locator('#real-skills').textContent(),initialSkills);assert.equal((await stored()).bag.book,18);
await page.locator('[data-recipe-filter="Locked"]').click();assert.equal(await page.locator('.recipe-row').count(),0);
await page.locator('[data-recipe-filter="All"]').click();await page.locator('#recipe-search').fill('SQL');assert.equal(await page.locator('.recipe-row').count(),1);await page.locator('#recipe-search').fill('');
await page.locator('#toggle-book').click();assert.equal(await page.locator('#recipe-book').isVisible(),false);await page.locator('#toggle-book').click();
// Reset requires a second deliberate activation.
await page.locator('#reset-workshop').click();assert.equal((await stored()).crafted,6);await page.locator('#reset-workshop').click();assert.equal((await stored()).bag.book,24);
await page.locator('.recipe-pick[data-recipe="recipe-html"]').evaluate(b=>{b.click();b.click();});assert.equal((await stored()).bag.book,23);
await page.locator('#take-output').evaluate(b=>{b.click();b.click();});assert.equal((await stored()).crafted,1);assert.equal((await stored()).bag.html,1);
// Manual translated placement, grid move, keyboard return and drag return.
await page.locator('#clear-craft-grid').click();
for(const [id,index] of [['book',6],['dye_orange',7],['plank',8]]){await page.locator('[data-ingredient="'+id+'"]').click();await page.locator('[data-craft-cell="'+index+'"]').click();}
assert.equal(await page.locator('#take-output').getAttribute('aria-label'),'Craft HTML');
await page.locator('[data-ingredient="plank"]').click();
await page.locator('[data-craft-cell="6"]').focus();await page.keyboard.press('Delete');assert.equal((await stored()).bag.book,23);
await page.locator('[data-ingredient="book"]').dragTo(page.locator('[data-craft-cell="6"]'));assert.equal((await stored()).grid[6],'book');
await page.locator('[data-craft-cell="6"]').dragTo(page.locator('[data-craft-cell="3"]'));assert.equal((await stored()).grid[3],'book');
await page.locator('[data-craft-cell="3"]').dragTo(page.locator('.player-inventory'));assert.equal((await stored()).grid[3],null);
// Escape refunds unfinished ingredients and restores opener focus.
await page.keyboard.press('Escape');assert.equal((await stored()).bag.book,23);assert.equal((await stored()).grid.filter(Boolean).length,0);
assert.equal(await page.locator('#open-workbench').evaluate(el=>el===document.activeElement),true);
await page.reload();await page.locator('#skip-intro:not([disabled])').click();await page.locator('#loader').waitFor({state:'detached'});await page.evaluate(()=>location.hash='skills');await page.locator('#workshop-table').waitFor();assert.match(await page.locator('#discovery-mini').textContent(),/01 \/ 06/);
await page.locator('#open-workbench').click();await page.locator('#close-workbench').focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#craft-dialog').evaluate(d=>d.contains(document.activeElement)),true);await page.locator('#close-workbench').click();
await page.locator('#jump-skills').click();assert.equal(await page.evaluate(()=>location.hash),'#skills');
for(let i=0;i<3;i++){await page.evaluate(()=>location.hash='contact');await page.locator('#contact-form').waitFor();assert.deepEqual(await page.evaluate(()=>({frames:__lifecycle.frames.size,buffers:__lifecycle.buffers,programs:__lifecycle.programs,observers:__lifecycle.observers})),{frames:0,buffers:0,programs:0,observers:0});await page.evaluate(()=>location.hash='skills');await page.locator('#workshop-table').waitFor();}
console.log('M03 pathway, manual, persistence and teardown checks complete');
// Real timing and cancellation.
const normal=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
const np=await normal.newPage();np.on('pageerror',e=>errors.push(e.message));await enter(np,'http://127.0.0.1:5173');
const ns=()=>np.evaluate(()=>JSON.parse(localStorage.getItem('jvd-workshop-play-v2')).state);
for(const action of ['close','route','pause','finish']){
 await np.locator('#open-workbench').click();
 await np.locator('.recipe-pick[data-recipe="recipe-html"]').click();
 if(action!=='finish'){assert.equal(await np.locator('.ingredient-flight').count(),3);assert.deepEqual(await np.locator('.ingredient-flight').evaluateAll(els=>els.map(e=>e.dataset.quantity)),['1','1','1']);}
 assert.equal((await ns()).bag.book,23);assert.equal((await ns()).crafted,0);
 if(action==='close')await np.keyboard.press('Escape');
 if(action==='route'){await np.evaluate(()=>location.hash='contact');await np.locator('#contact-form').waitFor();await np.evaluate(()=>location.hash='skills');await np.locator('#workshop-table').waitFor();}
 if(action==='pause'){await np.emulateMedia({reducedMotion:'reduce'});await np.locator('.placing-ingredients').waitFor({state:'detached'});assert.equal(await np.locator('.ingredient-flight').count(),0);await np.keyboard.press('Escape');await np.emulateMedia({reducedMotion:'no-preference'});}
 if(action==='finish'){await np.locator('.placing-ingredients').waitFor({state:'detached'});await np.screenshot({path:out+'/react-filled-motion.png'});await np.locator('#take-output').click();assert.equal((await ns()).crafted,1);await np.keyboard.press('Escape');}
 else {await np.waitForTimeout(700);assert.equal((await ns()).bag.book,24);assert.equal((await ns()).grid.filter(Boolean).length,0);}
 assert.equal(await np.locator('.ingredient-flight').count(),0);
}
await normal.close();
const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
await touch.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('blocked');};});
const tp=await touch.newPage();tp.on('pageerror',e=>errors.push(e.message));await enter(tp,'http://127.0.0.1:5173');await tp.locator('#open-workbench').tap();await tp.locator('#toggle-book').tap();
await tp.locator('[data-ingredient="book"]').tap();await tp.locator('[data-craft-cell="0"]').tap();assert.match(await tp.locator('[data-craft-cell="0"]').getAttribute('aria-label'),/Blank book/);
await tp.locator('#close-workbench').tap();assert.match(await tp.locator('#toast').textContent(),/visit only/);await touch.close();
assert.deepEqual(errors,[]);
await writeFile(out+'/report.json',JSON.stringify({errors,viewports:[1440,390,1366,1024,768],checks:['always-visible skills','all six paths','exact reservation and consumption','double click and collection','translated manual placement and drag','keyboard return','filters and restart confirmation','persistence and owner-content separation','close/route/pause cancellation','three single-unit flights','focus containment/restoration','three zero-resource teardowns','emulated touch and blocked storage']},null,2));
console.log('M03 browser checks passed');await browser.close();
