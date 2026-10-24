import seed from '../data/demo-content.json';
import {craftItems,resultModels} from './crafting-data.js';
import {validateConfig} from './workshop-storage';
import {symbols} from '../data/symbols';
import type {PortfolioContent} from '../types/content';

// Ported from reference/site/state.js validate(); stricter where the editor spec requires references to resolve.
export const characterIds=['professional','student','casual','builder','explorer'] as const;
export const MAX_ENTRIES=200,MAX_PHOTOS=30;
const idSafe=/^[a-zA-Z0-9_-]{1,120}$/;
export const collectionFields={
 actualSkills:['title','category','symbol','recipeId','description','level','projectId','evidence'],
 highlights:['title','body'],journal:['title','body'],
 projects:['symbol','title','category','summary','status','role','date','stack','overview','problem','solution','features','process','outcome','liveUrl','sourceUrl'],
 skills:['title','tools','outcome','body','symbol','projectId'],characters:['name','label','intro'],
 experience:['character','title','organization','start','end','description','contribution','evidence'],
 achievements:['title','description','date','issuer','evidence','symbol','parent'],
 certifications:['title','description','date','issuer','evidence','symbol','parent'],
 contacts:['title','url','body'],
} as const;

export function safeUrl(url:string){try{const u=new URL(url);return ['https:','http:','mailto:'].includes(u.protocol)?u.href:'';}catch{return '';}}
// An owner upload stored by the backend; the database accepts exactly this form.
export const MEDIA_REF=/^media:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:webp|png|jpg))$/;
// Same accepted forms as the reference (bundled assets, inline PNG/JPEG/WebP, http(s) URLs) plus uploaded media.
export function safeImage(src:unknown){if(typeof src!=='string')return '';if(/^assets\/[a-zA-Z0-9_./-]+$/.test(src)||MEDIA_REF.test(src))return src;if(/^data:image\/(png|jpeg|webp);base64,/.test(src))return src;const u=safeUrl(src);return u.startsWith('http')?u:'';}

type Doc=Record<string,any>;
// Older version-5 exports predate the workshop collections; fill them from the seed, as the reference migrate() did.
export function migrateContent(next:Doc){if(next?.version===5){for(const key of ['actualSkills','recipes','startingInventory'] as const)if(!next[key])next[key]=structuredClone(seed[key]);}return next;}

export function validateContent(input:unknown):asserts input is PortfolioContent {
 const next=input as Doc;
 if(!next||next.version!==5||!next.settings||typeof next.settings.name!=='string')throw Error('Choose a version 5 portfolio content export.');
 migrateContent(next);
 validateConfig(next.recipes,next.startingInventory);
 for(const k of Object.keys(seed.settings)){const v=next.settings[k];if(k==='portraitPosition'){if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>100)throw Error('Invalid portrait crop.');}else if(typeof v!=='string')throw Error('Missing setting: '+k);}
 if(next.settings.portrait&&!safeImage(next.settings.portrait))throw Error('Invalid portrait image.');
 for(const [k,names] of Object.entries(collectionFields)){
  if(!Array.isArray(next[k])||next[k].length>MAX_ENTRIES)throw Error('Invalid collection: '+k);
  const ids=new Set<string>();
  for(const x of next[k]){
   if(!x||typeof x.id!=='string'||!idSafe.test(x.id)||ids.has(x.id))throw Error('Invalid or duplicate entry in '+k);
   ids.add(x.id);
   for(const name of names)if(typeof x[name]!=='string')throw Error('Missing '+name+' in '+k);
   if(x.symbol&&!symbols.some(([id])=>id===x.symbol))throw Error('Unknown symbol.');
  }
 }
 if(next.characters.length!==5||next.characters.some((x:Doc)=>!characterIds.includes(x.id)))throw Error('Keep the five supplied character categories.');
 for(const p of next.projects){
  if(!Array.isArray(p.photos)||p.photos.length>MAX_PHOTOS)throw Error('Invalid project gallery.');
  const photoIds=new Set<string>();
  for(const photo of p.photos){if(!photo||typeof photo.id!=='string'||!idSafe.test(photo.id)||photoIds.has(photo.id)||typeof photo.src!=='string'||!safeImage(photo.src)||typeof photo.alt!=='string'||typeof photo.caption!=='string')throw Error('Invalid photo.');photoIds.add(photo.id);}
 }
 for(const k of ['achievements','certifications']){
  const nodes:Doc[]=next[k];
  for(const n of nodes){
   if(![n.x,n.y].every(v=>Number.isFinite(v)&&v>=0&&v<=900))throw Error('Invalid tree coordinates.');
   let p:Doc|undefined=n;const seen=new Set<string>();
   while(p){if(seen.has(p.id))throw Error('Tree contains a cycle.');seen.add(p.id);if(p.parent&&!nodes.some(x=>x.id===p!.parent))throw Error('Tree parent missing.');p=nodes.find(x=>x.id===p!.parent);}
  }
 }
 const projectIds=new Set(next.projects.map((x:Doc)=>x.id));
 for(const x of next.actualSkills){
  if(x.resultModel&&!resultModels.some(([id])=>id===x.resultModel))throw Error('Unknown skill model.');
  if(x.recipeId&&!craftItems.some(c=>c.id===x.recipeId&&c.kind==='Skill'))throw Error('Unknown skill artifact.');
  if(typeof x.sample!=='boolean')throw Error('Invalid skill sample flag.');
 }
 for(const x of [...next.actualSkills,...next.skills])if(x.projectId&&!projectIds.has(x.projectId))throw Error('A skill links to a project that no longer exists.');
 for(const x of next.experience)if(!next.characters.some((c:Doc)=>c.id===x.character))throw Error('Unknown experience character.');
 for(const k of ['projects','experience','achievements','certifications'])for(const x of next[k])if(typeof x.sample!=='boolean')throw Error('Invalid sample flag in '+k+'.');
}

export function contentProblem(input:unknown){try{validateContent(structuredClone(input));return '';}catch(error){return (error as Error).message;}}
