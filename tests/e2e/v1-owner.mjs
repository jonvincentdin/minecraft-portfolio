import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const base=process.env.CHECK_URL||'http://127.0.0.1:4178';
const env=Object.fromEntries((await readFile('.env.local','utf8')).split(/\r?\n/).filter(x=>/^\w+=/.test(x)).map(x=>x.split(/=(.*)/s).slice(0,2)));
const email=env.VITE_OWNER_EMAIL;
assert.ok(email);
const out='test-results/v1-owner';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(base);await page.locator('#skip-intro:not([disabled])').click();await page.locator('#loader').waitFor({state:'detached'});
 assert.equal(await page.getByRole('link',{name:/Edit world/}).count(),0);
 assert.equal(await page.getByRole('button',{name:/Replay intro/}).count(),0);
 for(let i=0;i<4;i++)await page.locator('header .brand').click();assert.ok(!page.url().includes('#editor'));
 await page.locator('header .brand').click();await page.locator('#sign-in-form').waitFor();
 assert.equal(await page.locator('[name="password"]').count(),0);
 await page.locator('[name="email"]').fill('wrong@gmail.com');await page.getByRole('button',{name:'Continue',exact:true}).click();
 assert.equal(await page.locator('[name="password"]').count(),0);
 await page.locator('[name="email"]').fill(email.toUpperCase());await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('[name="password"]').waitFor();
 await page.route('**/auth/v1/token?**',route=>route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({code:'invalid_credentials',message:'Invalid login credentials'})}));
 await page.locator('[name="password"]').fill('deliberately-wrong');await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#sign-in-error')?.textContent.includes('do not match'));
 let recoveryRequested=false;
 await page.route('**/auth/v1/recover**',route=>{assert.equal(route.request().postDataJSON().email.toLowerCase(),email.toLowerCase());assert.equal(new URL(route.request().url()).searchParams.get('redirect_to'),new URL(base).origin);recoveryRequested=true;return route.fulfill({status:200,contentType:'application/json',body:'{}'});});
 await page.getByRole('button',{name:'Forgot password?'}).click();await page.waitForFunction(()=>document.querySelector('#sign-in-error')?.textContent.includes('Check your inbox'));
 assert.ok(recoveryRequested);await page.screenshot({path:out+'/email-password.png',fullPage:true});
 checks.push('Five-click entry, wrong email rejected, email-first password step, wrong password refused, reset request payload (intercepted; no email sent)');
 for(const route of ['projects','skills','experience']){
  await page.evaluate(r=>location.hash=r,route);await page.waitForTimeout(450);assert.equal(await page.locator('.viewer-controls').count(),0);
  const canvas=page.locator('main canvas').first();await canvas.waitFor();const box=await canvas.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+70,box.y+box.height/2+20,{steps:8});await page.mouse.up();
 }
 checks.push('Inventory, skills and experience have no viewer toolbar; models render and accept drag');
 await page.evaluate(()=>location.hash='skills');await page.locator('#open-workbench').click();await page.getByRole('button',{name:'View CSS recipe',exact:true}).click();
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:900});await page.waitForTimeout(200);
  const fits=await page.locator('#recipe-detail .recipe-diagram').evaluate(el=>{const frame=el.getBoundingClientRect();return [...el.children].every(c=>{const r=c.getBoundingClientRect();return r.left>=frame.left&&r.top>=frame.top&&r.right<=frame.right+.5&&r.bottom<=frame.bottom+.5;});});
  assert.ok(fits,'all nine cells inside frame at '+width);await page.locator('#recipe-detail').screenshot({path:out+'/recipe-'+width+'.png'});
 }
 checks.push('All nine recipe cells fit frame at 1440, 768 and 390px');
 await page.keyboard.press('Escape');
 const invalid=await context.newPage();await invalid.goto(base+'/#error=access_denied&error_description=Expired');await invalid.getByText('This reset link is invalid or expired. Request a new link below.').waitFor();assert.equal(await invalid.locator('#reset-password-form').count(),0);await invalid.close();
 const recovery=await browser.newContext({reducedMotion:'reduce'}),rp=await recovery.newPage();
 const user={id:'00000000-0000-0000-0000-000000000001',email,role:'authenticated',aud:'authenticated',app_metadata:{},user_metadata:{},created_at:new Date(0).toISOString()};
 const jwt=Buffer.from(JSON.stringify({alg:'none'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:user.id,email,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test';let changed=false;
 await rp.route('**/auth/v1/user',route=>{if(route.request().method()==='PUT'){assert.equal(route.request().postDataJSON().password,'new-test-password-123');changed=true;}return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)});});
 await rp.route('**/rest/v1/portfolio_editors?**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({role:'owner'})}));
 await rp.route('**/auth/v1/logout**',route=>route.fulfill({status:204}));
 await rp.goto(base+'/#type=recovery&access_token='+jwt+'&refresh_token=test-refresh');await rp.locator('#reset-password-form').waitFor();
 assert.ok(!rp.url().includes('access_token'));
 await rp.locator('[name="password"]').fill('new-test-password-123');await rp.locator('[name="confirm"]').fill('not-matching-123');await rp.getByRole('button',{name:'Save new password'}).click();await rp.getByText('The passwords do not match.').waitFor();assert.equal(changed,false);
 await rp.locator('[name="confirm"]').fill('new-test-password-123');await rp.getByRole('button',{name:'Save new password'}).click();await rp.locator('#sign-in-form').waitFor();assert.ok(changed);await recovery.close();
 checks.push('Recovery tokens removed from URL, invalid link rejected, new-password confirmation and update/sign-out flow (auth responses simulated)');
 assert.deepEqual(errors,[]);await writeFile(out+'/report.json',JSON.stringify({base,checks,errors},null,2));console.log(JSON.stringify({checks,errors}));
}finally{await browser.close();}
