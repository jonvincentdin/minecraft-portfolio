import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {craftItems,recipes,recipeById,configureWorkshop,defaultRecipes,defaultStartingInventory} from '../../src/domain/crafting-data.js';
import {freshWorkshop,validWorkshop,inventoryStacks,recipeStatus,matchRecipe,clearGrid,placeItem,returnItem,moveGrid,loadRecipe,takeOutput,totalAvailable,quantities} from '../../src/domain/crafting-engine.js';
import {validateConfig,restoreWorkshop,workshopFingerprint} from '../../src/domain/workshop-storage';
const total=(s:ReturnType<typeof freshWorkshop>)=>Object.fromEntries(craftItems.map(i=>[i.id,totalAvailable(s,i.id)]));
test('source engine/data remain byte-identical to the immutable reference',async()=>{
 for(const name of ['crafting-data','crafting-engine'])assert.deepEqual(await readFile('src/domain/'+name+'.js'),await readFile('reference/site/'+name+'.js'));
});
test('translated manual pattern, replacement, grid swap and prerequisite history',()=>{
 configureWorkshop();let s=freshWorkshop(),before=total(s);
 s=placeItem(s,'book',0);s=placeItem(s,'plank',0);s=moveGrid(s,0,8);s=returnItem(s,8);assert.deepEqual(total(s),before);
 assert.equal(placeItem(s,'book',-1),s);assert.equal(placeItem(s,'react',0),s);
 s=placeItem(placeItem(placeItem(s,'book',6),'dye_orange',7),'plank',8);
 assert.equal(matchRecipe(s.grid)?.id,'recipe-html');s=takeOutput(s).state;assert.equal(s.bag.html,1);assert.equal(takeOutput(s).recipe,null);
 s.bag.html=0;assert.equal(recipeStatus(s,recipeById['recipe-css']).ready,true,'discovery remains when output is no longer owned');
 const locked=placeItem(placeItem(placeItem(freshWorkshop(),'book',0),'dye_cyan',1),'pearl',2);
 assert.equal(matchRecipe(locked.grid)?.id,'recipe-react');assert.equal(takeOutput(locked).recipe,null);assert.equal(loadRecipe(locked,'recipe-react'),locked);
});
test('six paths consume exact quantities once, repeated autofill and close refunds conserve resources',()=>{
 configureWorkshop();let s=freshWorkshop();
 for(const id of ['html','css','javascript','react','sql','api']){
  const r=recipeById['recipe-'+id],before=s;assert.ok(recipeStatus(s,r).ready);
  s=loadRecipe(s,r.id);assert.deepEqual(total(s),total(before));assert.equal(s.crafted,before.crafted);
  s=loadRecipe(s,r.id);assert.deepEqual(total(s),total(before));
  const result=takeOutput(s);assert.equal(result.recipe?.id,r.id);s=result.state;
  for(const item of craftItems)assert.equal(totalAvailable(s,item.id),totalAvailable(before,item.id)-(quantities(r.pattern)[item.id]||0)+(r.output===item.id?r.amount:0));
  assert.equal(takeOutput(s).recipe,null);assert.ok(validWorkshop(s));
 }
 assert.equal(s.bag.book,18);assert.equal(s.bag.react,1);assert.equal(s.crafted,6);
 const before=total(s);s=loadRecipe(s,'recipe-html');s=loadRecipe(s,'recipe-sql');s=clearGrid(s);assert.deepEqual(total(s),before);
 const poor=freshWorkshop();poor.bag.book=0;assert.equal(loadRecipe(poor,'recipe-html'),poor);
 assert.equal(recipeById['recipe-react'].resultModel,'skill_react');
});
test('edited quantities, output override and stack splitting follow the existing engine',()=>{
 const records=defaultRecipes(),starter=defaultStartingInventory();
 Object.assign(records[0],{bookCount:3,colorCount:2,specialCount:1,amount:2,resultModel:'material_book'});starter[0].quantity=130;
 configureWorkshop(records,starter);let s=freshWorkshop();assert.deepEqual(inventoryStacks(s).filter(x=>x.id==='book').map(x=>x.count),[64,64,2]);
 s=loadRecipe(s,records[0].id);assert.equal(s.grid.filter(x=>x==='book').length,3);assert.equal(s.grid.filter(x=>x==='dye_orange').length,2);assert.equal(s.bag.book,127);
 s=takeOutput(s).state;assert.equal(s.bag.html,2);configureWorkshop();
});
test('invalid configurations reject cycles, duplicate patterns/IDs, unknown items/models and impossible quantities',()=>{
 const starter=defaultStartingInventory();
 for(const patch of [{requires:['react']},{bookCount:-1},{colorCount:4},{amount:17},{special:'unknown'},{special:'constructor'},{output:'iron'},{resultModel:'missing_model'}]){
  const records=defaultRecipes();Object.assign(records[0],patch);assert.throws(()=>validateConfig(records,starter));
 }
 const records=defaultRecipes();assert.throws(()=>validateConfig([...records,{...records[0],id:'duplicate'}],starter),/same ingredient/);
 assert.throws(()=>validateConfig([...records,records[0]],starter),/unique/);
 assert.throws(()=>validateConfig(records,[...starter,{...starter[0],id:'duplicate'}]));
 assert.throws(()=>validateConfig(records,[{...starter[0],quantity:-1}]));
});
test('fingerprint mismatch and invalid saved state reset; interrupted reservations recover without duplication',()=>{
 configureWorkshop();const fingerprint=workshopFingerprint(defaultRecipes(),defaultStartingInventory()),initial=freshWorkshop(),reserved=loadRecipe(initial,'recipe-html');
 const raw=JSON.stringify({config:fingerprint,state:reserved});const restored=restoreWorkshop(raw,fingerprint);
 assert.deepEqual(restored.grid,Array(9).fill(null));assert.deepEqual(total(restored),total(initial));
 assert.deepEqual(restoreWorkshop(raw,'new config'),initial);
 assert.deepEqual(restoreWorkshop('{bad',fingerprint),initial);
 for(const state of [{...reserved,bag:{constructor:1}},{...reserved,learned:['book']},{...reserved,bag:{book:-2}}])assert.deepEqual(restoreWorkshop(JSON.stringify({config:fingerprint,state}),fingerprint),initial);
});
