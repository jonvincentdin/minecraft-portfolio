
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5173');await page.locator('#skip-intro:not([disabled])').click();await page.locator('#loader').waitFor({state:'detached'});
 await page.evaluate(()=>location.hash='experience');await page.locator('#character-view').waitFor();
 const angles=()=>page.locator('#character-view').evaluate(c=>{const gl=c.getContext('webgl'),p=gl.getParameter(gl.CURRENT_PROGRAM),r=gl.getUniform(p,gl.getUniformLocation(p,'right')),v=gl.getUniform(p,gl.getUniformLocation(p,'view'));return {yaw:Math.atan2(-r[2],r[0]),elevation:Math.asin(v[1])};});
 const report=[];
 for(const id of ['professional','student','casual','builder','explorer']){
  await page.locator('.role-index [data-role="'+id+'"]').click();
  await page.getByRole('button',{name:'Reset view'}).click();
  const before=await angles(),box=await page.locator('#character-view').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+30,box.y+box.height/2+10);await page.mouse.up();
  const after=await angles();assert.ok(Math.abs(after.yaw-before.yaw+.27)<.001);assert.ok(Math.abs(after.elevation-before.elevation-.04)<.001);
  await page.locator('.character-stage').screenshot({path:'test-results/m02/oblique-'+id+'.png'});
  report.push({id,before,after});
 }
 await page.evaluate(()=>location.hash='projects');await page.getByRole('button',{name:/Open project/}).click();
 await page.locator('.dialog-close').focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('dialog').evaluate(d=>d.contains(document.activeElement)),true);
 await page.keyboard.press('Tab');assert.equal(await page.locator('.dialog-close').evaluate(d=>d===document.activeElement),true);
 await page.locator('.dialog-close').click();assert.equal(await page.locator('dialog').count(),0);
 await writeFile('test-results/m02/pointer.json',JSON.stringify({characters:report,modalFocusTrap:true,closeButton:true},null,2));console.log('Pointer direction, pitch and dialog focus checks passed');
}finally{await browser.close();}
