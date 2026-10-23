import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
await mkdir('test-results/m03',{recursive:true});
await writeFile('test-results/m03-fixture.tsx',"\nimport React,{StrictMode,useState} from 'react';\nimport {createRoot} from 'react-dom/client';\nimport {SkillsPage} from '/src/features/skills/SkillsPage';\nimport seed from '/src/data/demo-content.json';\nimport '/src/styles/reference.css';\nimport '/src/styles/foundation.css';\nconst models=await fetch('/assets/models/scene-data.json').then(r=>r.json());\nfunction Fixture(){\n const [content,setContent]=useState(()=>{const c=structuredClone(seed);Object.assign(c.recipes[0],{bookCount:3,colorCount:2,specialCount:1,amount:2,resultModel:'material_book'});c.startingInventory[0].quantity=130;c.actualSkills[0].resultModel='material_book';return c;});\n return <><button id=\"change-config\" onClick={()=>setContent(c=>{const n=structuredClone(c);n.startingInventory[0].quantity=64;return n;})}>Change test configuration</button><SkillsPage content={content} scenes={models} paused={false} notify={()=>{}}/></>;\n}\ncreateRoot(document.getElementById('root')).render(<StrictMode><Fixture/></StrictMode>);\n");
await writeFile('test-results/m03-fixture.html','<!doctype html><html><body><div id="root"></div><script type="module" src="/test-results/m03-fixture.tsx"></script></body></html>');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/test-results/m03-fixture.html');await page.locator('#workshop-table').waitFor();
 assert.match(await page.locator('.skill-item-frame img').first().getAttribute('src'),/material_book.png/);
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('jvd-workshop-play-v2')).state);
 await page.locator('#open-workbench').click();assert.deepEqual(await page.locator('[data-ingredient="book"] .stack-count').allTextContents(),['64','64','2']);
 await page.locator('[data-recipe="recipe-html"].recipe-pick').click();assert.equal(await page.locator('.ingredient-flight').count(),6);
 assert.equal((await read()).bag.book,127);assert.equal((await read()).crafted,0);
 const durations=await page.locator('.ingredient-flight').evaluateAll(els=>els.map(el=>el.getAnimations()[0].effect.getTiming()));
 assert.deepEqual(durations.map(d=>d.duration),[420,420,420,420,420,420]);assert.deepEqual(durations.map(d=>d.delay),[0,90,180,270,360,450]);
 await page.locator('.placing-ingredients').waitFor({state:'detached'});assert.match(await page.locator('#take-output img').getAttribute('src'),/material_book.png/);
 await page.locator('#take-output').click();assert.equal((await read()).bag.html,2);assert.equal((await read()).crafted,1);await page.keyboard.press('Escape');
 await page.locator('#change-config').click();await page.locator('#open-workbench').click();assert.deepEqual(await page.locator('[data-ingredient="book"] .stack-count').allTextContents(),['64']);assert.equal(await page.locator('[data-ingredient="html"]').count(),0);await page.keyboard.press('Escape');
 const canvas=page.locator('#workshop-table');await page.getByRole('button',{name:'Reset view'}).click();
 const angles=()=>canvas.evaluate(c=>{const gl=c.getContext('webgl'),p=gl.getParameter(gl.CURRENT_PROGRAM),r=gl.getUniform(p,gl.getUniformLocation(p,'right'));return Math.atan2(-r[2],r[0]);});
 const before=await angles(),box=await canvas.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+30,box.y+box.height/2);const after=await angles();assert.ok(Math.abs(after-before+.27)<.001);await page.mouse.up();
 await page.getByRole('button',{name:'Wireframe'}).click();await page.locator('.table-island').screenshot({path:'test-results/m03/table-wire.png'});await page.getByRole('button',{name:'Wireframe'}).click();await page.getByRole('button',{name:'Reset view'}).click();await page.locator('.table-island').screenshot({path:'test-results/m03/table-solid.png'});
 assert.deepEqual(errors,[]);
 await writeFile('test-results/m03/config-report.json',JSON.stringify({errors,checks:['StrictMode fixture','three stacks 64/64/2','six exact-unit flights','420ms duration and 90ms stagger','two outputs','model override','configuration change resets play','table drag -0.27 radians','wireframe/reset']},null,2));console.log('M03 edited configuration and table checks passed');
}finally{await browser.close();}
