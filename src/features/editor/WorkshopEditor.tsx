import {useEffect,useRef,useState,type FormEvent,type RefObject} from 'react';
import {craftItems,itemById,resultModels,recipePattern} from '../../domain/crafting-data.js';
import {validateConfig} from '../../domain/workshop-storage';
import type {Recipe,StartingItem} from '../../types/content';
import type {Confirmation} from './fields';
import {newId,type Draft} from './schema';

interface Props { draft:Draft; inventory:boolean; commit:(change:(d:Draft)=>void,message:string)=>Promise<boolean>; confirm:(c:Confirmation)=>void; notify:(m:string)=>void; paused:boolean; preview:()=>void; status:string }
type Option=readonly [string,string];
const Select=({name,label,items,value,onChange}:{name:string;label:string;items:readonly Option[];value:string;onChange?:(v:string)=>void})=><label className="editor-field"><span>{label}</span><select name={name} defaultValue={value} onChange={e=>onChange?.(e.target.value)}>{items.map(([id,text])=><option key={id} value={id}>{text}</option>)}</select></label>;
const NumberField=({name,label,value,min,max}:{name:string;label:string;value:number;min:number;max:number})=><label className="editor-field"><span>{label}</span><input type="number" name={name} defaultValue={value} min={min} max={max} step={1} required/></label>;
const skillItems=craftItems.filter(x=>x.kind==='Skill').map(x=>[x.id,x.name] as Option);

export const SkillEditorNav=({active}:{active:'loadout'|'recipes'|'inventory'})=><nav className="skill-editor-nav" aria-label="Skills editor"><a href="#editor/skills" aria-current={active==='loadout'?'page':undefined}>Portfolio skills</a><a href="#editor/skills/recipes" aria-current={active==='recipes'?'page':undefined}>Recipes</a><a href="#editor/skills/inventory" aria-current={active==='inventory'?'page':undefined}>Starting inventory</a></nav>;

// Recipe studio and starter kit, as reference/site/workshop-editor.js. Saves are checked against the whole workshop configuration.
export function WorkshopEditor({draft,inventory,commit,confirm,notify,paused,preview,status}:Props) {
 const key=inventory?'startingInventory':'recipes';
 const [editing,setEditing]=useState<(Recipe|StartingItem)|null>(null);
 useEffect(()=>setEditing(null),[inventory]);
 const open=(id?:string)=>{
  const found=(draft[key] as (Recipe|StartingItem)[]).find(x=>x.id===id);
  const unused=craftItems.find(x=>!draft.startingInventory.some(s=>s.item===x.id));
  setEditing(structuredClone(found??(inventory?{id:newId(),title:itemById[unused?.id||'book'].name,item:unused?.id||'book',quantity:8}:{id:newId(),title:'',output:'html',color:'dye_orange',special:'plank',bookCount:1,colorCount:1,specialCount:1,amount:1,requires:[],note:'',resultModel:'skill_html'})));
 };
 // Removing a recipe also drops it from other recipes' prerequisites; the result must still be a valid workshop.
 const remove=(id:string)=>confirm({title:'Remove this '+(inventory?'starter item':'recipe')+'?',lead:'The next playground session will use the updated configuration.',action:'Delete',run:async()=>{
  const recipes=inventory?draft.recipes:draft.recipes.filter(x=>x.id!==id).map(r=>({...r,requires:r.requires.filter(p=>draft.recipes.some(x=>x.id!==id&&x.output===p))}));
  const items=inventory?draft.startingInventory.filter(x=>x.id!==id):draft.startingInventory;
  try{validateConfig(recipes,items);}catch(error){notify((error as Error).message);return;}
  if(await commit(d=>{d.recipes=recipes;d.startingInventory=items;},'Entry removed.'))setEditing(null);
 }});
 const cards=draft[key] as (Recipe&StartingItem)[];
 return <section className="workshop-editor"><a className="text-button" href="#editor/skills">← World Editor</a><div className="section-head"><div><span className="eyebrow">CONTENT STUDIO / SKILLS</span><h1>{inventory?'Starting inventory.':'The recipe studio.'}</h1></div><a className="btn secondary" href="#skills" onClick={preview}>Preview crafting ↗</a></div>
 <SkillEditorNav active={inventory?'inventory':'recipes'}/>
 <p className="editor-notice"><span className="local-status" id="save-status" role="status">{status}</span>{'. Local mode: changes stay in this browser. The playground uses the published configuration on its next visit; your portfolio skill loadout stays separate.'}</p>
 <div className="recipe-studio-guide"><img src="/assets/thumbs/material_book.png" alt="Blank book"/><span>+</span><img src="/assets/thumbs/dye_cyan.png" alt="Colored dye"/><span>+</span><img src="/assets/thumbs/item_ender_pearl.png" alt="Special item"/><span>→</span><img src="/assets/thumbs/skill_react.png" alt="Original React artifact"/><div><strong>Shared ingredients. Distinct results.</strong><p>Choose a custom artifact or a classic book for each result. React keeps its original model by default.</p></div></div>
 <div className="collection-header"><h2>{inventory?'The visitor’s starter kit':'Skill recipes'}</h2><button className="btn" id="add-config" onClick={()=>open()}>{'+ '+(inventory?'Add item':'Add recipe')}</button></div>
 <div id="config-list"><div className="config-cards">{cards.length?cards.map(x=><article className="config-card" key={x.id}><img src={'/assets/thumbs/'+(inventory?itemById[x.item].model:x.resultModel||itemById[x.output].model)+'.png'} alt=""/><div><h3>{inventory?itemById[x.item].name:x.title}</h3>
  <p>{inventory?`${x.quantity} items · ${Math.ceil(x.quantity/64)} stack${x.quantity>64?'s':''}`:`${x.bookCount} book + ${x.colorCount} ${itemById[x.color].name} + ${x.specialCount} ${itemById[x.special].name}`}</p>
  {!inventory&&<small>{'Craft first: '+(x.requires.map(id=>itemById[id].name).join(', ')||'No prerequisites')}</small>}</div>
  <div className="entry-actions"><button data-config-edit={x.id} onClick={()=>open(x.id)}>Edit</button><button data-config-delete={x.id} className="danger" onClick={()=>remove(x.id)}>Delete</button></div></article>):<p className="empty-state">Add an entry to begin.</p>}</div></div>
 <div id="config-form" hidden={!editing}>{editing&&<ConfigForm key={editing.id} draft={draft} inventory={inventory} entry={editing} commit={commit} paused={paused} close={()=>setEditing(null)}/>}</div></section>;
}

function ConfigForm({draft,inventory,entry,commit,paused,close}:{draft:Draft;inventory:boolean;entry:Recipe|StartingItem;commit:Props['commit'];paused:boolean;close:()=>void}) {
 const form=useRef<HTMLFormElement>(null),[error,setError]=useState(''),[,refresh]=useState(0),[model,setModel]=useState((entry as Recipe).resultModel||'');
 useEffect(()=>{form.current?.parentElement?.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});form.current?.querySelector('input')?.focus({preventScroll:true});},[paused]);
 const read=():Recipe|StartingItem=>{
  const f=new FormData(form.current!);
  if(inventory){const item=String(f.get('item'));return {...entry as StartingItem,item,title:itemById[item].name,quantity:Number(f.get('quantity'))};}
  const x={...entry as Recipe};
  for(const n of ['title','output','resultModel','color','special','note'] as const)x[n]=String(f.get(n)||'');
  for(const n of ['bookCount','colorCount','specialCount','amount'] as const)x[n]=Number(f.get(n));
  x.requires=f.getAll('requires').map(String);return x;
 };
 const submit=async(event:FormEvent)=>{
  event.preventDefault();const x=read();
  const upsert=<T extends {id:string}>(list:T[])=>{const next=structuredClone(list),i=next.findIndex(y=>y.id===x.id);if(i<0)next.push(x as unknown as T);else next[i]=x as unknown as T;return next;};
  const recipes=inventory?draft.recipes:upsert(draft.recipes),items=inventory?upsert(draft.startingInventory):draft.startingInventory;
  try{validateConfig(recipes,items);}catch(e){setError((e as Error).message);return;}
  if(await commit(d=>{d.recipes=recipes;d.startingInventory=items;},'Saved. Open crafting to try the updated configuration.'))close();
  else setError('Not saved. Your form is unchanged.');
 };
 const recipe=entry as Recipe,item=entry as StartingItem;
 const kinds=(test:(kind:string,id:string)=>boolean)=>craftItems.filter(x=>test(x.kind,x.id)).map(x=>[x.id,x.name] as Option);
 return <form id="workshop-config-form" className="settings-card" ref={form} onSubmit={submit} onInput={()=>refresh(n=>n+1)}><h2>{(draft[inventory?'startingInventory':'recipes'].some(x=>x.id===entry.id)?'Edit':'Create')+' '+(inventory?'starter item':'recipe')}</h2><div className="editor-fields">
 {inventory?<><Select name="item" label="Inventory item" items={craftItems.map(x=>[x.id,x.name] as Option)} value={item.item}/><NumberField name="quantity" label="Starting quantity (stacks of 64)" value={item.quantity} min={0} max={256}/></>
 :<><label className="editor-field"><span>Recipe name</span><input name="title" defaultValue={recipe.title} required/></label>
  <Select name="output" label="Skill created" items={skillItems} value={recipe.output} onChange={v=>setModel(itemById[v].model)}/>
  <label className="editor-field"><span>Result appearance</span><select name="resultModel" value={model||itemById[recipe.output].model} onChange={e=>setModel(e.target.value)}>{resultModels.map(([id,text])=><option key={id} value={id}>{text}</option>)}</select></label>
  <NumberField name="amount" label="Output quantity" value={recipe.amount} min={1} max={16}/><NumberField name="bookCount" label="Blank books" value={recipe.bookCount} min={1} max={3}/>
  <Select name="color" label="Dye color" items={kinds(k=>k==='Color')} value={recipe.color}/><NumberField name="colorCount" label="Dye quantity" value={recipe.colorCount} min={1} max={3}/>
  <Select name="special" label="Special ingredient" items={kinds((k,id)=>!['Color','Skill'].includes(k)&&id!=='book')} value={recipe.special}/><NumberField name="specialCount" label="Special ingredient quantity" value={recipe.specialCount} min={1} max={3}/>
  <label className="editor-field"><span>Description</span><textarea name="note" rows={3} defaultValue={recipe.note}/></label>
  <fieldset className="prerequisite-editor"><legend>Skills to craft first</legend>{craftItems.filter(c=>c.kind==='Skill'&&draft.recipes.some(r=>r.output===c.id)).map(c=><label key={c.id}><input type="checkbox" name="requires" value={c.id} defaultChecked={recipe.requires.includes(c.id)}/> {c.name}</label>)}<small>Leave the output skill unchecked. Circular dependencies are prevented.</small></fieldset>
  <LivePreview read={read} form={form}/></>}
 </div><p id="config-error" role="alert">{error}</p><div className="form-actions"><button className="btn">{'Save '+(inventory?'item':'recipe')}</button><button type="button" className="btn secondary" id="cancel-config" onClick={close}>Cancel</button></div></form>;
}

// The reference live pattern: books, dye and special item laid out as the crafting grid, then the output model.
function LivePreview({read,form}:{read:()=>Recipe|StartingItem;form:RefObject<HTMLFormElement|null>}) {
 const [,mounted]=useState(false);useEffect(()=>mounted(true),[]);
 if(!form.current)return <div className="recipe-live-preview" id="recipe-live-preview"/>;
 const x=read() as Recipe,cells:(string|null)[]=Array(9).fill(null);
 if([x.bookCount,x.colorCount,x.specialCount].every(n=>n>=1&&n<=3))recipePattern(x).forEach((row,y)=>row.forEach((id,i)=>cells[y*3+i]=id));
 return <div className="recipe-live-preview" id="recipe-live-preview"><span className="label">Live recipe pattern</span><div className="recipe-preview-row"><div className="recipe-diagram">{cells.map((id,i)=><span key={i}>{id&&<img src={'/assets/thumbs/'+itemById[id].model+'.png'} alt={itemById[id].name}/>}</span>)}</div><span>→</span><img className="preview-output" src={'/assets/thumbs/'+x.resultModel+'.png'} alt="Selected output model"/></div></div>;
}
