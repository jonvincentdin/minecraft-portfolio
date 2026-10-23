import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const out='test-results/m05';await mkdir(out,{recursive:true});
const APP='http://127.0.0.1:5173';
const seed=JSON.parse(await readFile('src/data/demo-content.json','utf8'));
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],checks=[],matrix={};
const check=name=>{checks.push(name);console.log('ok -',name);};
// A real PNG drawn by the browser, so uploads go through decoding, resizing and WebP encoding.
let png;
const image=name=>({name,mimeType:'image/png',buffer:png});

async function context(options={}){const c=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',acceptDownloads:true,...options});return c;}
async function open(c){const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(APP);await p.locator('#skip-intro:not([disabled])').click();await p.locator('#loader').waitFor({state:'detached'});return p;}
async function go(p,hash){await p.evaluate(h=>location.hash=h,hash);await p.waitForTimeout(250);}
async function editor(p,section){await go(p,'editor/'+section);await p.locator('#save-status').waitFor();await p.waitForFunction(()=>!/Saving/.test(document.querySelector('#save-status')?.textContent||''));}
const settled=p=>p.waitForFunction(()=>{const t=document.querySelector('#save-status')?.textContent||'';return t&&!/Saving/.test(t);});
// Messages arrive asynchronously (file reads, saves), so wait for the expected text rather than reading once.
const toastShows=(p,pattern)=>p.waitForFunction(source=>new RegExp(source).test(document.querySelector('#toast')?.textContent||''),pattern.source,{timeout:8000});
const names=(p,scope)=>p.locator(scope).evaluate(el=>[...new Set([...el.querySelectorAll('[name]')].map(x=>x.getAttribute('name')))]);
async function fill(p,values){for(const [name,value] of Object.entries(values)){const el=p.locator(`#entry-form [name="${name}"]`);const tag=await el.evaluate(e=>e.tagName);if(tag==='SELECT')await el.selectOption(String(value));else await el.fill(String(value));}}
async function save(p,form='#entry-form'){await p.locator(form+' button[type="submit"], '+form+' button.btn:not([type="button"])').first().click();await settled(p);}
const draftOf=p=>p.evaluate(()=>new Promise((resolve,reject)=>{const q=indexedDB.open('jvd-world-local-v1');q.onsuccess=()=>{const g=q.result.transaction('documents').objectStore('documents').get('draft');g.onsuccess=()=>resolve(g.result);g.onerror=()=>reject(g.error);};q.onerror=()=>reject(q.error);}));

try {
 // ---- Field coverage matrix ----
 {
  const c=await context(),p=await open(c);
  const expect={
   landing:{settings:['name','heroLabel','tagline','introTitle','github','linkedin'],entry:['title','body']},
   about:{settings:['aboutTitle','bio','portraitPosition'],entry:['title','body']},
   projects:{entry:['title','category','summary','status','role','date','stack','symbol','overview','problem','solution','features','process','outcome','liveUrl','sourceUrl','sample']},
   skills:{entry:['title','category','level','recipeId','resultModel','description','projectId','evidence','symbol','sample']},
   experience:{characters:['professional','student','casual','builder','explorer'].flatMap(id=>['name','label','intro'].map(f=>id+'.'+f)),entry:['title','character','organization','start','end','description','contribution','evidence','sample']},
   achievements:{entry:['title','description','date','issuer','evidence','parent','x','y','symbol','sample']},
   certifications:{entry:['title','description','date','issuer','evidence','parent','x','y','symbol','sample']},
   contact:{settings:['contactTitle','contactCopy'],entry:['title','url','body']},
  };
  for(const [section,parts] of Object.entries(expect)){
   await editor(p,section);matrix[section]={};
   if(parts.settings){matrix[section].settings=await names(p,'#settings-form');assert.deepEqual([...matrix[section].settings].sort(),[...parts.settings].sort(),section+' settings');}
   if(parts.characters){matrix[section].characters=await names(p,'#characters-form');assert.deepEqual([...matrix[section].characters].sort(),[...parts.characters].sort(),'characters');}
   await p.locator('#add-entry').click();matrix[section].entry=await names(p,'#entry-form');
   assert.deepEqual([...matrix[section].entry].sort(),[...parts.entry].sort(),section+' entry');
   await p.locator('#entry-form [data-cancel]').first().click();
  }
  await editor(p,'about');matrix.about.media=['portrait-upload','remove-portrait'];assert.equal(await p.locator('#portrait-upload').count(),1);
  await editor(p,'projects');await p.locator('[data-edit]').first().click();await p.locator('[data-edit-tab="media"]').click();
  matrix.projects.media=['project-photos','alt','caption','cover','move','remove'];
  assert.equal(await p.locator('#project-photos').count(),1);assert.equal(await p.locator('[data-photo-field="alt"]').count(),2);
  await editor(p,'achievements');matrix.achievements.tree=['move','connect','make-root','x','y'];
  for(const s of ['[data-tree-mode="move"]','[data-tree-mode="connect"]','[data-tree-detach]','[data-tree-x]','[data-tree-y]'])assert.equal(await p.locator(s).count(),1,s);
  await go(p,'editor/skills/recipes');await p.locator('#add-config').click();matrix.recipes=await names(p,'#workshop-config-form');
  assert.deepEqual([...matrix.recipes].sort(),['amount','bookCount','color','colorCount','note','output','requires','resultModel','special','specialCount','title'].sort());
  await go(p,'editor/skills/inventory');await p.locator('#add-config').click();matrix.inventory=await names(p,'#workshop-config-form');
  assert.deepEqual([...matrix.inventory].sort(),['item','quantity']);
  check('field coverage: every EDITOR.md field has an input across all ten editors');
  await c.close();
 }

 // ---- CRUD, references, validation and preview ----
 {
  const c=await context(),p=await open(c);
  png=Buffer.from(await p.evaluate(()=>{const c=document.createElement('canvas');c.width=40;c.height=30;const g=c.getContext('2d');g.fillStyle='#7a9';g.fillRect(0,0,40,30);return c.toDataURL('image/png').split(',')[1];}),'base64');
  await editor(p,'landing');
  assert.match(await p.locator('#local-mode-notice').innerText(),/no sign-in and no shared backend/);
  assert.match(await p.locator('#save-status').innerText(),/No draft saved yet · not published/);
  await p.locator('#settings-form [name="name"]').fill('Draft Name');await p.locator('#settings-form [name="github"]').fill('http://insecure.example');await save(p,'#settings-form');
  await toastShows(p,/complete https/);assert.equal((await draftOf(p))?.revision,undefined,'insecure profile URL rejected before saving');
  await p.locator('#settings-form [name="github"]').fill('https://github.com/example');await save(p,'#settings-form');
  assert.match(await p.locator('#save-status').innerText(),/Draft rev 1 saved on this browser · not published/);
  // Create, edit, duplicate, reorder and delete a highlight.
  await p.locator('#add-entry').click();await fill(p,{title:'',body:'No title'});await save(p);await toastShows(p,/Add a title/);
  await fill(p,{title:'Fresh highlight',body:'Added in M05'});await save(p);
  assert.equal(await p.locator('.entry-row strong').last().innerText(),'Fresh highlight');
  await p.locator('[data-duplicate]').last().click();await settled(p);assert.equal(await p.locator('.entry-row strong').last().innerText(),'Fresh highlight (copy)');
  await p.locator('.entry-row').last().locator('[data-reorder]').first().click();await settled(p);
  assert.deepEqual(await p.locator('.entry-row strong').allInnerTexts(),['Crafted with curiosity','Explore at your pace','Fresh highlight (copy)','Fresh highlight']);
  await p.locator('.entry-row').last().locator('[data-edit]').click();await fill(p,{title:'Edited highlight'});await save(p);
  await p.locator('.entry-row').nth(2).locator('[data-delete]').click();await p.getByRole('button',{name:'Delete entry'}).click();await settled(p);
  assert.deepEqual(await p.locator('.entry-row strong').allInnerTexts(),['Crafted with curiosity','Explore at your pace','Edited highlight']);
  check('create, edit, duplicate, reorder and delete with confirmation; empty titles and http profile URLs rejected');
  // Projects: invalid link, gallery upload, alt/caption, cover and order, then delete with a linked skill.
  await editor(p,'projects');await p.locator('#add-entry').click();await fill(p,{title:'Lantern Lab',category:'Devices'});
  await p.locator('[data-edit-tab="links"]').click();await fill(p,{liveUrl:'javascript:alert(1)'});await save(p);await toastShows(p,/valid http, https, or mailto/);
  await fill(p,{liveUrl:'https://example.com/lantern'});
  await p.locator('[data-edit-tab="details"]').click();await p.locator('#entry-form input[name="symbol"][value="lantern"]').check();
  await p.locator('[data-edit-tab="media"]').click();await p.locator('#project-photos').setInputFiles([image('first.png'),image('second.png')]);
  await p.locator('[data-photo-field="alt"]').nth(1).waitFor();
  await p.locator('[data-photo-field="alt"]').nth(1).fill('Second screen');await p.locator('[data-photo-field="caption"]').nth(1).fill('The detail view');
  await p.locator('[data-photo-cover="1"]').click();assert.equal(await p.locator('.photo-edit .chip').first().innerText(),'COVER IMAGE');
  assert.equal(await p.locator('[data-photo-field="alt"]').first().inputValue(),'Second screen');
  await save(p);
  let draft=(await draftOf(p)).content,lantern=draft.projects.at(-1);
  assert.equal(lantern.title,'Lantern Lab');assert.equal(lantern.symbol,'lantern');assert.equal(lantern.photos.length,2);
  assert.deepEqual([lantern.photos[0].alt,lantern.photos[0].caption],['Second screen','The detail view']);assert.match(lantern.photos[0].src,/^data:image\/webp;base64,/);
  check('project gallery: uploads are resized to WebP, alt/caption/cover order persist, unsafe links rejected');
  // Link a skill to the new project, then delete the project: the explicit choice unlinks the skill and keeps it.
  await editor(p,'skills');await p.locator('[data-edit]').first().click();await fill(p,{projectId:lantern.id});await save(p);
  await editor(p,'projects');await p.locator('.entry-row').last().locator('[data-delete]').click();
  assert.match(await p.locator('#detail .modal-lead').innerText(),/is linked from/);await p.getByRole('button',{name:'Unlink and delete'}).click();await settled(p);
  draft=(await draftOf(p)).content;assert.ok(!draft.projects.some(x=>x.id===lantern.id));assert.equal(draft.actualSkills[0].projectId,'');assert.equal(draft.actualSkills.length,seed.actualSkills.length);
  check('deleting a referenced project needs an explicit unlink choice and keeps the skill');
  // Trees: cycle through the parent field and through connect mode, connect, make root, numeric position, parent deletion.
  await editor(p,'achievements');await p.locator('.entry-row').first().locator('[data-edit]').click();await fill(p,{parent:'ach4'});await save(p);
  await toastShows(p,/cannot link back to itself/);await p.locator('#entry-form [data-cancel]').first().click();
  await p.locator('[data-tree-mode="connect"]').click();await p.locator('[data-edit-node="ach4"]').click();await p.locator('[data-edit-node="ach1"]').click();
  assert.match(await p.locator('#connection-help').innerText(),/would form a cycle/);
  await p.locator('[data-tree-mode="connect"]').click();await p.locator('[data-edit-node="ach3"]').click();await p.locator('[data-edit-node="ach4"]').click();await settled(p);
  assert.equal((await draftOf(p)).content.achievements.find(x=>x.id==='ach4').parent,'ach3');
  await p.locator('[data-tree-mode="move"]').click();await p.locator('[data-edit-node="ach3"]').click();await p.locator('[data-tree-x]').fill('950');await p.locator('[data-save-position]').click();
  assert.match(await p.locator('#connection-help').innerText(),/between 0 and 900/);
  await p.locator('[data-tree-x]').fill('400');await p.locator('[data-tree-y]').fill('500');await p.locator('[data-save-position]').click();await settled(p);
  const node3=(await draftOf(p)).content.achievements.find(x=>x.id==='ach3');assert.deepEqual([node3.x,node3.y],[400,500]);
  const box=await p.locator('[data-edit-node="ach2"]').boundingBox();await p.mouse.move(box.x+20,box.y+20);await p.mouse.down();await p.mouse.move(box.x+80,box.y+60,{steps:5});await p.mouse.up();await settled(p);
  const node2=(await draftOf(p)).content.achievements.find(x=>x.id==='ach2');assert.notDeepEqual([node2.x,node2.y],[350,110],'drag saves a new position');
  await p.locator('[data-edit-node="ach3"]').click();await p.locator('[data-tree-detach]').click();await settled(p);
  assert.equal((await draftOf(p)).content.achievements.find(x=>x.id==='ach3').parent,'');
  // By now ach4 hangs under ach3 and ach3 is a root, so ach1 is the parent of ach2 only.
  await p.locator('.entry-row').nth(0).locator('[data-delete]').click();assert.match(await p.locator('#detail .modal-lead').innerText(),/is the parent of A build worth sharing./);
  await p.getByRole('button',{name:'Detach children and delete'}).click();await settled(p);
  draft=(await draftOf(p)).content;assert.ok(!draft.achievements.some(x=>x.id==='ach1'));assert.equal(draft.achievements.find(x=>x.id==='ach2').parent,'');assert.equal(draft.achievements.length,3);
  check('trees reject cycles in both editors, connect/root/position/drag persist, parent deletion is explicit');
  // Recipes: a prerequisite cycle and an invalid starting quantity are rejected with the form kept.
  await go(p,'editor/skills/recipes');await p.locator('[data-config-edit]').first().click();
  await p.locator('#workshop-config-form [name="requires"][value="css"]').check();await p.locator('#workshop-config-form button.btn').first().click();
  assert.notEqual(await p.locator('#config-error').innerText(),'');assert.equal(await p.locator('#workshop-config-form [name="requires"][value="css"]').isChecked(),true,'form kept');
  await p.locator('#cancel-config').click();await p.locator('#add-config').click();await p.locator('#workshop-config-form [name="title"]').fill('Second HTML');
  await p.locator('#workshop-config-form [name="bookCount"]').fill('3');await p.locator('#workshop-config-form [name="colorCount"]').fill('2');
  assert.equal(await p.locator('#recipe-live-preview .recipe-diagram img').count(),6,'live pattern shows 3 books + 2 dye + 1 special');
  await p.locator('#cancel-config').click();
  await go(p,'editor/skills/inventory');await p.locator('[data-config-edit]').first().click();await p.locator('#workshop-config-form [name="quantity"]').fill('130');await p.locator('#workshop-config-form button.btn').first().click();await settled(p);
  assert.match(await p.locator('.config-card').first().innerText(),/130 items · 3 stacks/);
  check('recipe cycles rejected keeping the form; live pattern; starting quantity shows split stacks');
  // Characters and experience.
  await editor(p,'experience');await p.locator('#characters-form [name="student.name"]').fill('Scholar');await save(p,'#characters-form');
  assert.equal((await draftOf(p)).content.characters.find(x=>x.id==='student').name,'Scholar');
  check('the five fixed characters are renamed in place');
  // Preview shows the draft through public components; the published site still shows the seed.
  await editor(p,'landing');await p.locator('#preview-section').click();await p.locator('.preview-banner').waitFor();
  assert.match(await p.locator('header').innerText(),/Draft Name/);
  await go(p,'experience');assert.match(await p.locator('main').innerText(),/Scholar/);
  await go(p,'achievements');assert.equal(await p.locator('[data-node="ach1"]').count(),0,'deleted tree node is gone in preview');
  await go(p,'skills');await p.locator('#workshop-table').waitFor();
  await p.getByRole('button',{name:'Exit preview'}).click();assert.doesNotMatch(await p.locator('header').innerText(),/Draft Name/);
  check('preview renders the unpublished draft through the public pages; exiting returns to the published site');
  // Publish, then the public site and a reload show it.
  await editor(p,'landing');await p.locator('#publish-draft').click();await p.getByRole('button',{name:'Publish in this browser'}).last().click();
  await p.waitForFunction(()=>/published rev/.test(document.querySelector('#save-status').textContent));
  assert.equal(await p.locator('#publish-draft').isDisabled(),true);
  await go(p,'home');assert.match(await p.locator('header').innerText(),/Draft Name/);
  await p.reload();await p.locator('#skip-intro:not([disabled])').click();await p.locator('#loader').waitFor({state:'detached'});
  assert.match(await p.locator('header').innerText(),/Draft Name/);
  check('publishing replaces this browser’s public content and survives a reload');
  // Export the draft and compare.
  await editor(p,'landing');const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#export-content').click()]);
  const exported=JSON.parse(await readFile(await download.path(),'utf8'));
  assert.deepEqual(exported,(await draftOf(p)).content);assert.equal(download.suggestedFilename(),'Jon_Vincent_Din_Portfolio_Content.json');
  check('export downloads exactly the saved draft');
  // Import: not JSON, invalid tree, then a valid file that replaces the draft, keeps a recovery copy and does not publish.
  const before=(await draftOf(p)).revision;
  await p.locator('#import-content').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{not json')});await toastShows(p,/not valid JSON/);
  const cyclic=structuredClone(seed);cyclic.certifications[0].parent='cert3';
  await p.locator('#import-content').setInputFiles({name:'cycle.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(cyclic))});await toastShows(p,/cycle/);
  assert.equal((await draftOf(p)).revision,before,'rejected imports change nothing');
  const legacy=structuredClone(seed);legacy.settings.name='Imported Name';delete legacy.recipes;delete legacy.startingInventory;
  await p.locator('#import-content').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
  await p.getByRole('button',{name:'Replace local draft'}).click();await settled(p);
  draft=(await draftOf(p)).content;assert.equal(draft.settings.name,'Imported Name');assert.ok(draft.recipes.length,'older exports gain the workshop collections');
  assert.equal(await p.locator('#download-recovery').count(),1);
  const [recovery]=await Promise.all([p.waitForEvent('download'),p.locator('#download-recovery').click()]);
  assert.equal(JSON.parse(await readFile(await recovery.path(),'utf8')).settings.name,'Draft Name');
  await go(p,'home');assert.match(await p.locator('header').innerText(),/Draft Name/,'import never publishes');
  await editor(p,'landing');await p.locator('#preview-section').click();await p.locator('.preview-banner').waitFor();assert.match(await p.locator('header').innerText(),/Imported Name/);
  await p.getByRole('button',{name:'Exit preview'}).click();
  check('import rejects bad files, migrates older exports, keeps a recovery copy and is reflected in preview only');
  await c.close();
 }

 // ---- Conflict between two tabs ----
 {
  const c=await context(),a=await open(c),b=await open(c);
  await editor(a,'landing');await editor(b,'landing');
  await a.locator('#settings-form [name="tagline"]').fill('From tab A');await save(a,'#settings-form');
  await b.locator('#settings-form [name="tagline"]').fill('From tab B');await save(b,'#settings-form');
  await b.locator('.conflict-notice').waitFor();assert.match(await b.locator('#save-status').innerText(),/Conflict/);
  assert.equal((await draftOf(b)).content.settings.tagline,'From tab A','the other tab’s save is not overwritten');
  assert.equal(await b.locator('#publish-draft').isDisabled(),true);
  await b.locator('#conflict-overwrite').click();await settled(b);
  assert.equal((await draftOf(b)).content.settings.tagline,'From tab B');assert.equal((await draftOf(b)).revision,2);
  await a.locator('#settings-form [name="name"]').fill('Stale tab');await save(a,'#settings-form');await a.locator('.conflict-notice').waitFor();
  await a.locator('#conflict-reload').click();await a.locator('.conflict-notice').waitFor({state:'detached'});
  assert.equal(await a.locator('#settings-form [name="tagline"]').inputValue(),'From tab B');
  check('a stale tab gets a conflict, keeps its edits, and can explicitly overwrite or reload');
  await c.close();
 }

 // ---- Blocked storage is labelled honestly ----
 {
  const c=await context();await c.addInitScript(()=>{Object.defineProperty(window,'indexedDB',{get(){throw new DOMException('blocked','SecurityError');}});});
  const p=await open(c);await editor(p,'landing');
  assert.match(await p.locator('#save-status').innerText(),/Session only/);assert.match(await p.locator('#local-mode-notice').innerText(),/for this session only/);
  await p.locator('#settings-form [name="name"]').fill('Memory only');await save(p,'#settings-form');assert.match(await p.locator('#save-status').innerText(),/Session only/);
  check('blocked browser storage works for the session and says so');
  await c.close();
 }
} finally {
 await writeFile(out+'/report.json',JSON.stringify({errors,checks},null,2));
 await writeFile(out+'/field-matrix.json',JSON.stringify(matrix,null,2));
 await browser.close();
}
assert.deepEqual(errors,[]);
console.log('M05 browser checks passed ('+checks.length+')');
