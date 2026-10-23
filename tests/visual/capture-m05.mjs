import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const out='test-results/m05';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],captured=[];
// Separate contexts, fresh storage: both editors start from the same seed.
async function open(url){const c=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const p=await c.newPage();p.on('pageerror',e=>errors.push(url+': '+e.message));await p.goto(url);await p.locator('#skip-intro:not([disabled])').click();await p.locator('#loader').waitFor({state:url.endsWith('4174')?'hidden':'detached'});return p;}
const states={
 landing:async p=>{await p.evaluate(()=>location.hash='editor/landing');},
 projects:async p=>{await p.evaluate(()=>location.hash='editor/projects');},
 'project-form':async p=>{await p.evaluate(()=>location.hash='editor/projects');await p.locator('[data-edit]').first().click();},
 'project-media':async p=>{await p.evaluate(()=>location.hash='editor/projects');await p.locator('[data-edit]').first().click();await p.locator('[data-edit-tab="media"]').click();},
 achievements:async p=>{await p.evaluate(()=>location.hash='editor/achievements');},
 recipes:async p=>{await p.evaluate(()=>location.hash='editor/skills/recipes');},
 'recipe-form':async p=>{await p.evaluate(()=>location.hash='editor/skills/recipes');await p.locator('[data-config-edit]').first().click();},
 inventory:async p=>{await p.evaluate(()=>location.hash='editor/skills/inventory');},
};
const pages={react:await open('http://127.0.0.1:5173'),reference:await open('http://127.0.0.1:4174')};
try {
 for(const size of [{width:1440,height:900},{width:390,height:844}]){
  for(const [name,enter] of Object.entries(states)){
   if(size.width===390&&!['projects','project-form','achievements','recipes'].includes(name))continue;
   for(const [kind,p] of Object.entries(pages)){await p.setViewportSize(size);await p.evaluate(()=>location.hash='home');await p.waitForTimeout(200);await enter(p);await p.waitForTimeout(500);await p.mouse.move(0,0);await p.evaluate(()=>document.activeElement?.blur());await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));await p.screenshot({path:`${out}/${kind}-${name}-${size.width}.png`});}
   captured.push(`${name}-${size.width}`);
  }
 }
} finally {await writeFile(out+'/captured.json',JSON.stringify({errors,captured},null,2));await browser.close();}
if(errors.length)throw Error(errors.join('\n'));
console.log('Captured '+captured.length+' pairs');
