import {itemById,validateWorkshopConfig} from './crafting-data.js';
import {clearGrid,freshWorkshop,validWorkshop} from './crafting-engine.js';
import type {Recipe,StartingItem} from '../types/content';
export const workshopStorageKey='jvd-workshop-play-v2';
export const workshopFingerprint=(recipes:Recipe[],inventory:StartingItem[])=>JSON.stringify([recipes,inventory]);
export function validateConfig(recipes:Recipe[],inventory:StartingItem[]) {
 validateWorkshopConfig(recipes,inventory);
 for(const r of recipes)for(const id of [r.output,r.color,r.special,...r.requires])if(!Object.hasOwn(itemById,id))throw Error('Unknown crafting item.');
}
export function restoreWorkshop(raw:string|null,fingerprint:string) {
 try {
  const saved=JSON.parse(raw||'null'),s=saved?.state;
  if(saved.config===fingerprint&&validWorkshop(s)&&
   Object.keys(s.bag).every(id=>Object.hasOwn(itemById,id))&&
   s.grid.every((id:string|null)=>id===null||Object.hasOwn(itemById,id))&&
   s.learned.every((id:string)=>Object.hasOwn(itemById,id)&&itemById[id].kind==='Skill'))return clearGrid(s);
 }catch{/* Missing, obsolete or malformed local play state starts fresh. */}
 return freshWorkshop();
}
