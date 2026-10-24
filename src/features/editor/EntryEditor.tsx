import {useEffect,useRef,useState,type FormEvent} from 'react';
import {craftItems} from '../../domain/crafting-data.js';
import {safeUrl,MAX_PHOTOS} from '../../domain/content-validation';
import {safeImage} from '../../lib/urls';
import type {ContentRepository} from '../../data/ContentRepository';
import type {Photo} from '../../types/content';
import {schema,sampled,withSymbol,newId,collectionTitle,type CollectionKey,type Draft} from './schema';
import {SchemaField,SymbolPicker,type Confirmation} from './fields';

type Entry=Record<string,any>&{id:string};
interface Props { draft:Draft; collection:CollectionKey; commit:(change:(d:Draft)=>void,message:string)=>Promise<boolean>; confirm:(c:Confirmation)=>void; notify:(m:string)=>void; repository:ContentRepository; paused:boolean }
const entries=(draft:Draft,key:CollectionKey)=>draft[key] as unknown as Entry[];
const label=(x:Entry)=>x.title||x.name;
// A new entry carries exactly its collection's fields, with the reference editor's default values.
function blank(collection:CollectionKey,count:number):Entry {
 const defaults:Record<string,unknown>={status:'In progress',category:collection==='actualSkills'?'Web foundations':'Tools',level:'Working knowledge',character:'professional',x:150+count*100%600,y:130+count%2*180};
 const entry:Entry={id:newId(),title:''};
 for(const [name] of schema[collection])entry[name]=defaults[name]??'';
 if(collection==='projects'||withSymbol.includes(collection))entry.symbol='diamond_pickaxe';
 if(collection==='projects')entry.photos=[];
 if(sampled.includes(collection))entry.sample=false;
 return entry;
}

export function EntryEditor(props:Props) {
 const {draft,collection,commit,confirm,repository}=props;
 const [editing,setEditing]=useState<{entry:Entry;isNew:boolean}|null>(null);
 useEffect(()=>setEditing(null),[collection]);
 const list=entries(draft,collection);
 const move=(id:string,dir:number)=>commit(d=>{const arr=entries(d,collection),i=arr.findIndex(x=>x.id===id),j=i+dir;if(j>=0&&j<arr.length)[arr[i],arr[j]]=[arr[j],arr[i]];},'Order updated.');
 const duplicate=(id:string)=>commit(d=>{const arr=entries(d,collection),x=structuredClone(arr.find(x=>x.id===id)!);x.id=newId();x.title+=' (copy)';if(x.photos)x.photos.forEach((p:Photo)=>p.id=newId());arr.push(x);},'Entry duplicated.');
 const remove=(id:string)=>{
  const x=list.find(x=>x.id===id)!;
  const children=['achievements','certifications'].includes(collection)?list.filter(n=>n.parent===id):[];
  const linked=collection==='projects'?[...draft.actualSkills,...draft.skills].filter(s=>s.projectId===id):[];
  const lead=children.length?`${label(x)} is the parent of ${children.map(label).join(', ')}. Deleting it makes ${children.length===1?'that node a root':'those nodes roots'}; no other entry is removed.`
   :linked.length?`${label(x)} is linked from ${linked.map(s=>s.title).join(', ')}. Deleting it removes ${linked.length===1?'that link':'those links'}; the skills themselves stay.`
   :`${label(x)} will be removed from ${repository.kind==='supabase'?'the draft':'this browser draft'}. Export a backup first if you need to keep it.`;
  confirm({eyebrow:'DELETE ENTRY',title:'Remove this entry?',lead,danger:true,cancel:'Keep it',action:children.length?'Detach children and delete':linked.length?'Unlink and delete':'Delete entry',run:async()=>{
   if(await commit(d=>{(d[collection] as unknown as Entry[])=entries(d,collection).filter(e=>e.id!==id);if(children.length)entries(d,collection).forEach(n=>{if(n.parent===id)n.parent='';});if(linked.length)[...d.skills,...d.actualSkills].forEach(s=>{if(s.projectId===id)s.projectId='';});},'Entry deleted.'))setEditing(e=>e?.entry.id===id?null:e);
  }});
 };
 const open=(id?:string)=>{
  const base=id?list.find(x=>x.id===id):undefined;
  setEditing({entry:structuredClone(base??blank(collection,list.length)),isNew:!base});
 };
 const visual=(x:Entry,i:number)=>{const artifact=collection==='actualSkills'&&craftItems.find(c=>c.id===x.recipeId);
  if(artifact)return <img src={'/assets/thumbs/'+artifact.model+'.png'} alt=""/>;
  if(x.symbol)return <img src={'/assets/thumbs/item_'+x.symbol+'.png'} alt=""/>;
  if(x.character)return <img src={'/assets/thumbs/character_'+x.character+'.png'} alt=""/>;
  return <span>{String(i+1).padStart(2,'0')}</span>;};
 const intro=collection==='projects'?'Manage each project’s symbol, story, cover, and gallery.':collection==='actualSkills'?'These are your actual portfolio skills. Visitor crafting never modifies them. Uncheck Sample only for skills you really have.':'Create, edit, duplicate, reorder, or remove entries.';
 return <><div className="collection-header"><div><h2>{collectionTitle[collection]}</h2><p>{intro}</p></div><button className="btn" id="add-entry" onClick={()=>open()}>{'+ Add '+(collection==='projects'?'project':'entry')}</button></div><div id="entry-list">{list.length?<div className="entry-table"><div className="entry-table-head"><span>{list.length+' '+collection.toUpperCase()}</span><span>CONTENT ACTIONS</span></div>
 {list.map((x,i)=><article className="entry-row" key={x.id}><div className="entry-visual">{visual(x,i)}</div><div className="entry-title"><strong>{label(x)}</strong><small>{(x.category||x.organization||x.issuer||x.body?.slice(0,80)||'Portfolio content')+(x.photos?` · ${x.photos.length} images`:'')+(x.sample?' · SAMPLE':'')}</small></div>
 <div className="entry-actions"><button data-reorder={x.id} aria-label={'Move '+x.title+' up'} disabled={i===0} onClick={()=>move(x.id,-1)}>↑</button><button data-reorder={x.id} aria-label={'Move '+x.title+' down'} disabled={i===list.length-1} onClick={()=>move(x.id,1)}>↓</button><button data-edit={x.id} onClick={()=>open(x.id)}>Edit</button><button data-duplicate={x.id} aria-label={'Duplicate '+x.title} onClick={()=>duplicate(x.id)}>Copy</button><button className="danger" data-delete={x.id} onClick={()=>remove(x.id)}>Delete</button></div></article>)}</div>
 :<div className="empty-state"><h3>A fresh page.</h3><p>Add your first entry to this section.</p></div>}</div>
 <div className="editor-form-panel" id="editor-form-panel" hidden={!editing}>{editing&&<EntryForm key={editing.entry.id} {...props} entry={editing.entry} isNew={editing.isNew} close={()=>setEditing(null)}/>}</div></>;
}

function EntryForm({draft,collection,commit,notify,repository,paused,entry,isNew,close}:Props&{entry:Entry;isNew:boolean;close:()=>void}) {
 const [tab,setTab]=useState('details'),[photos,setPhotos]=useState<Photo[]>(()=>structuredClone(entry.photos||[]));
 const shared=repository.kind==='supabase';
 const [pending,setPending]=useState(false),[note,setNote]=useState(shared?'Saved to the draft; visitors see it only after you publish.':'Saved locally, not published to a shared CMS.');
 const form=useRef<HTMLFormElement>(null),projects=collection==='projects';
 useEffect(()=>{const panel=form.current?.parentElement;panel?.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});form.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus({preventScroll:true});},[paused]);
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();if(pending)return;
  const data=new FormData(event.currentTarget),next:Entry={...entry};
  for(const [name,,type] of schema[collection])next[name]=type==='number'?Math.max(0,Math.min(900,Number(data.get(name))||0)):String(data.get(name)||'');
  if(!next.title.trim()){notify('Add a title before saving.');setTab('details');form.current?.querySelector<HTMLInputElement>('[name="title"]')?.focus();return;}
  for(const name of ['liveUrl','sourceUrl','evidence','url'])if(next[name]&&!safeUrl(next[name])){notify('Use a valid http, https, or mailto link.');return;}
  if(data.has('symbol'))next.symbol=String(data.get('symbol'));
  if(sampled.includes(collection))next.sample=data.has('sample');
  if(projects){if(photos.length>MAX_PHOTOS){notify('Keep this reference gallery to 30 images per project.');return;}next.photos=structuredClone(photos);}
  if(['achievements','certifications'].includes(collection)){let p=next.parent;const seen=new Set([next.id]);while(p){if(seen.has(p)){notify('A node cannot link back to itself. Choose another parent.');return;}seen.add(p);p=entries(draft,collection).find(x=>x.id===p)?.parent;}}
  if(await commit(d=>{const arr=entries(d,collection),i=arr.findIndex(x=>x.id===next.id);i>=0?arr.splice(i,1,next):arr.push(next);},'Entry saved. Preview the section to see your changes.'))close();
  else setNote('Not saved. Your form is unchanged; fix the problem and save again.');
 };
 const addPhotos=async(files:FileList|null)=>{
  if(!files?.length)return;setPending(true);setNote('Preparing images…');
  try{const added:Photo[]=[];for(const file of Array.from(files)){if(photos.length+added.length>=MAX_PHOTOS)break;added.push({id:newId(),src:await repository.uploadMedia(file,{alt:file.name,width:0,height:0}),alt:file.name.replace(/\.[^.]+$/,''),caption:''});}
   setPhotos(p=>[...p,...added]);setNote('Images ready. Save the project to keep them.');}
  catch(error){notify((error as Error).message);setNote('Image import stopped. Previously added images remain.');}
  finally{setPending(false);}
 };
 const setPhoto=(i:number,field:'alt'|'caption',value:string)=>setPhotos(p=>p.map((x,j)=>j===i?{...x,[field]:value}:x));
 const swap=(i:number,j:number)=>setPhotos(p=>{if(j<0||j>=p.length)return p;const n=[...p];[n[i],n[j]]=[n[j],n[i]];return n;});
 const fields=(specs:typeof schema[CollectionKey])=><div className="editor-fields">{specs.map(spec=><SchemaField key={spec[0]} spec={spec} draft={draft} collection={collection} current={entry}/>)}</div>;
 const tabs=[['details','Details & symbol'],['story','Case study'],['media','Photos & cover'],['links','Links']] as const;
 return <form id="entry-form" ref={form} onSubmit={submit}><div className="form-panel-heading"><div><span className="eyebrow">{(isNew?'NEW ENTRY':'EDIT ENTRY')+(shared?' / DRAFT':' / LOCAL DRAFT')}</span><h2>{isNew?'Create something new.':entry.title}</h2></div><button type="button" className="text-button" data-cancel onClick={close}>Cancel ×</button></div>
 {projects?<><div className="editor-tabs">{tabs.map(([id,name])=><button type="button" key={id} data-edit-tab={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{name}</button>)}</div>
  <div className="edit-tab" data-panel="details" hidden={tab!=='details'}>{fields(schema.projects.slice(0,7))}<SymbolPicker value={entry.symbol} project/></div>
  <div className="edit-tab" data-panel="story" hidden={tab!=='story'}>{fields(schema.projects.slice(7,13))}</div>
  <div className="edit-tab" data-panel="media" hidden={tab!=='media'}><div className="upload-zone"><span>▧</span><h3>Your project, in pictures.</h3><p>Add screenshots, process images, and photos. The first image is the cover.</p><label className="btn secondary upload-label">+ Add images<input type="file" id="project-photos" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" disabled={pending} onChange={e=>{void addPhotos(e.currentTarget.files);e.currentTarget.value='';}}/></label></div>
   <div id="photo-editor">{photos.length?photos.map((x,i)=><article className="photo-edit" data-photo-id={x.id} key={x.id}><img src={safeImage(x.src)} alt={x.alt||'Project image'}/><div><span className="chip">{i===0?'COVER IMAGE':'GALLERY / '+(i+1)}</span><label>Alt text<input data-photo-field="alt" value={x.alt} onChange={e=>setPhoto(i,'alt',e.target.value)}/></label><label>Caption<input data-photo-field="caption" value={x.caption} onChange={e=>setPhoto(i,'caption',e.target.value)}/></label>
    <div className="photo-actions"><button type="button" data-photo-cover={i} disabled={!i} onClick={()=>setPhotos(p=>[p[i],...p.filter((_,j)=>j!==i)])}>Make cover</button><button type="button" data-photo-move={i} disabled={!i} onClick={()=>swap(i,i-1)}>↑</button><button type="button" data-photo-move={i} disabled={i===photos.length-1} onClick={()=>swap(i,i+1)}>↓</button><button type="button" className="danger" data-photo-remove={i} onClick={()=>setPhotos(p=>p.filter((_,j)=>j!==i))}>Remove</button></div></div></article>)
   :<p className="empty-state">No images yet. Add your project screenshots or photographs.</p>}</div></div>
  <div className="edit-tab" data-panel="links" hidden={tab!=='links'}>{fields(schema.projects.slice(13))}</div></>
 :<>{fields(schema[collection])}{withSymbol.includes(collection)&&<SymbolPicker value={entry.symbol} project={false}/>}</>}
 {sampled.includes(collection)&&<label className="sample-toggle"><input type="checkbox" name="sample" defaultChecked={!!entry.sample}/> Label this as sample content</label>}
 <div className="form-actions sticky-actions"><button className="btn" type="submit" disabled={pending}>{'Save '+(projects?'project':'entry')}</button><button className="btn secondary" type="button" data-cancel onClick={close}>Cancel</button><span className="help" id="form-save-note" role="status">{note}</span></div></form>;
}
