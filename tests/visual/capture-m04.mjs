import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const out='test-results/m04';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],captured=[];
// Each page gets its own context so neither is a throttled background tab. Reduced motion freezes the glow and reveals.
async function open(url){const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const p=await context.newPage();p.on('pageerror',e=>errors.push(url+': '+e.message));await p.goto(url);await p.locator('#skip-intro:not([disabled])').click();await p.locator('#loader').waitFor({state:url.endsWith('4174')?'hidden':'detached'});await p.evaluate(()=>location.hash='achievements');await p.locator('#map-world').waitFor();await p.evaluate(()=>document.fonts.ready);return p;}
async function settle(p){await p.mouse.move(0,0);await p.evaluate(()=>scrollTo(0,0));await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));await p.waitForTimeout(150);}
// Bring a page back to the default achievements map with the first root selected.
async function reset(p){if(await p.locator('[data-list][aria-pressed="true"]').count())await p.locator('[data-list]').click();await p.locator('[data-tree="certifications"]').click();await p.locator('[data-tree="achievements"]').click();}
const states={
 achievements:async()=>{},
 certifications:async p=>p.locator('[data-tree="certifications"]').click(),
 list:async p=>p.locator('[data-list]').click(),
 ach4:async p=>p.locator('[data-node="ach4"]').evaluate(e=>e.click()),
};
const pages={react:await open('http://127.0.0.1:5173'),reference:await open('http://127.0.0.1:4174')};
try {
 for(const size of [{width:1440,height:900},{width:390,height:844},{width:1366,height:768},{width:1024,height:768},{width:768,height:1024}]){
  const names=size.width===1440||size.width===390?Object.keys(states):['achievements'];
  for(const name of names){
   for(const [kind,p] of Object.entries(pages)){await p.setViewportSize(size);await reset(p);await states[name](p);await settle(p);await p.screenshot({path:`${out}/${kind}-${name}-${size.width}.png`,fullPage:true});}
   captured.push(`${name}-${size.width}`);
  }
 }
} finally {
 await writeFile(out+'/captured.json',JSON.stringify({errors,captured},null,2));
 await browser.close();
}
if(errors.length)throw Error(errors.join('\n'));
console.log('Captured '+captured.length+' pairs: '+captured.join(', '));
