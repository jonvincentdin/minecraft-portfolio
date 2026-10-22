import assert from 'node:assert/strict';
import fs from 'node:fs';
import {recipes,recipeById,craftItems,defaultRecipes,defaultStartingInventory,configureWorkshop,validateWorkshopConfig} from './dist/crafting-data.js';
import {freshWorkshop,validWorkshop,inventoryStacks,recipeStatus,matchRecipe,clearGrid,placeItem,returnItem,moveGrid,loadRecipe,takeOutput,craftRecipe,totalAvailable,quantities} from './dist/crafting-engine.js';
import {dragRotation} from './dist/renderer.js';
import {defaults,migrate,validate} from './dist/state.js';
const total=s=>Object.fromEntries(craftItems.map(x=>[x.id,totalAvailable(s,x.id)]));
let s=freshWorkshop(),before=structuredClone(s);assert(validWorkshop(s));
s=placeItem(s,'book',0);assert.equal(s.bag.book,23);assert.deepEqual(total(s),total(before));
s=placeItem(s,'plank',0);assert.equal(s.bag.book,24);assert.equal(s.bag.plank,7);s=moveGrid(s,0,8);assert.equal(s.grid[8],'plank');s=returnItem(s,8);assert.deepEqual(total(s),total(before));
assert.strictEqual(placeItem(s,'react',0),s);assert.strictEqual(placeItem(s,'book',-1),s);
// Manual, translated recipe pattern and prerequisite enforcement.
s=placeItem(placeItem(placeItem(s,'book',6),'dye_orange',7),'plank',8);assert.equal(matchRecipe(s.grid).id,'recipe-html');
let result=takeOutput(s);s=result.state;assert.equal(s.bag.html,1);assert.equal(s.bag.book,23);assert.equal(s.bag.plank,7);assert.equal(takeOutput(s).recipe,null);
let locked=placeItem(placeItem(placeItem(freshWorkshop(),'book',0),'dye_cyan',1),'pearl',2);assert.equal(matchRecipe(locked.grid).id,'recipe-react');assert.equal(takeOutput(locked).recipe,null);assert.strictEqual(loadRecipe(locked,'recipe-react'),locked);
// Complete the entire learning pathway and verify exact resource conservation.
s=freshWorkshop();for(const id of ['html','css','javascript','react','sql','api']){const r=recipeById['recipe-'+id],prev=structuredClone(s);assert(recipeStatus(s,r).ready);const loaded=loadRecipe(s,r.id);assert.deepEqual(total(loaded),total(prev),'autofill only reserves inventory');assert.equal(loaded.crafted,prev.crafted);assert.equal(matchRecipe(loaded.grid).id,r.id);result=takeOutput(loaded);s=result.state;for(const item of craftItems)assert.equal(totalAvailable(s,item.id),totalAvailable(prev,item.id)-(quantities(r.pattern)[item.id]||0)+(r.output===item.id?r.amount:0));assert.equal(s.crafted,prev.crafted+1);assert(validWorkshop(s));}assert.equal(s.bag.book,18);assert.equal(s.bag.react,1);assert.deepEqual(s.learned,['html','css','javascript','react','sql','api']);
// Re-clicking a recipe does not lose additional units; changing recipes refunds the old grid.
s=placeItem(s,'iron',8);before=total(s);s=loadRecipe(s,'recipe-html');s=loadRecipe(s,'recipe-html');s=loadRecipe(s,'recipe-sql');assert.deepEqual(total(s),before);assert.deepEqual(total(clearGrid(s)),before);
let poor=freshWorkshop();poor.bag.book=0;assert.strictEqual(loadRecipe(poor,'recipe-html'),poor);assert.equal(craftRecipe(poor,'recipe-html').recipe,null);
// Edited quantities and starting inventory are applied; 1-3 per ingredient maps to explicit grid squares.
let edited=defaultRecipes(),starter=defaultStartingInventory();Object.assign(edited[0],{bookCount:3,colorCount:2,specialCount:1,amount:2,resultModel:'material_book'});starter.find(x=>x.item==='book').quantity=130;configureWorkshop(edited,starter);s=freshWorkshop();assert.deepEqual(inventoryStacks(s).filter(x=>x.id==='book').map(x=>x.count),[64,64,2]);s=loadRecipe(s,'recipe-html');assert.equal(s.grid.filter(x=>x==='book').length,3);assert.equal(s.grid.filter(x=>x==='dye_orange').length,2);assert.equal(s.bag.book,127);assert.equal(matchRecipe(s.grid).id,'recipe-html');s=takeOutput(s).state;assert.equal(s.bag.html,2);
let bad=defaultRecipes();bad[0].requires=['react'];assert.throws(()=>validateWorkshopConfig(bad,starter),/cycle/);bad=defaultRecipes();bad[0].bookCount=4;assert.throws(()=>validateWorkshopConfig(bad,starter));bad=defaultRecipes();bad[0].resultModel='bad';assert.throws(()=>validateWorkshopConfig(bad,starter));assert.throws(()=>validateWorkshopConfig([...defaultRecipes(),{...defaultRecipes()[0],id:'duplicate'}],starter),/same ingredient/);assert.throws(()=>validateWorkshopConfig(defaultRecipes(),[...starter,{...starter[0],id:'duplicate'}]));
configureWorkshop();assert.equal(recipeById['recipe-react'].resultModel,'skill_react');assert(!validWorkshop({...s,grid:['bad']}));
const d=defaults(),snapshot=JSON.stringify(d);craftRecipe(freshWorkshop(),'recipe-html');assert.equal(JSON.stringify(d),snapshot);delete d.actualSkills;delete d.recipes;delete d.startingInventory;const projects=JSON.stringify(d.projects);migrate(d);assert(validate(d));assert.equal(JSON.stringify(d.projects),projects);assert(d.actualSkills.every(x=>x.sample));d.actualSkills[0].resultModel='" onerror="bad';assert.throws(()=>validate(d),/Unknown skill model/);
for(const dx of [-12,12])assert.equal(Math.sign(-Math.sin(dragRotation(dx,0).yaw)),Math.sign(dx));for(const dy of [-12,12])assert.equal(Math.sign(Math.sin(dragRotation(0,dy).elevation)),Math.sign(dy));
for(const item of craftItems)for(const [folder,ext] of [['models','glb'],['thumbs','png']])assert(fs.existsSync(`dist/assets/${folder}/${item.model}.${ext}`),item.id);
const app=fs.readFileSync('dist/app.js','utf8');assert(!/setTimeout\s*\(\s*dismissIntro/.test(app));assert(!app.includes('jvd-intro-seen'));assert(app.includes("$('#skip-intro').onclick=()=>{if(ready)dismissIntro()}"));
console.log('PASS: six book+dye+special recipes, manual/autofill crafting, exact consumption/refunds, edited quantities, stack splitting, prerequisites, output models, starter config, migration, intro click gate and drag direction.');
