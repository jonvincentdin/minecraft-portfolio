import {useEffect,useState} from 'react';
import type {ContentRepository} from '../../data/ContentRepository';
import type {ContentSnapshot,PortfolioContent} from '../../types/content';
import {validateContent} from '../../domain/content-validation';
import {Notice} from '../../components/ui/Notice';
import {sections,collectionOf,viewLink,readSection} from './schema';
import {ConfirmDialog,type Confirmation} from './fields';
import {useDraft,type DraftState} from './useDraft';
import {EntryEditor} from './EntryEditor';
import {SettingsCard,CharactersCard} from './SettingsCards';
import {TreeConnectionEditor} from './TreeConnectionEditor';
import {WorkshopEditor,SkillEditorNav} from './WorkshopEditor';

interface Props { repository:ContentRepository; notify:(m:string)=>void; paused:boolean; onPreview:(content:PortfolioContent,revision:number)=>void; onPublished:(snapshot:ContentSnapshot)=>void }
const EXPORT_NAME='Jon_Vincent_Din_Portfolio_Content.json',MAX_IMPORT=50*1024*1024;

function download(content:unknown,name=EXPORT_NAME){
 const url=URL.createObjectURL(new Blob([JSON.stringify(content,null,2)],{type:'application/json'})),a=document.createElement('a');
 a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
// Every state names where the data actually is; nothing here is a shared or server save.
function statusText(s:DraftState){
 if(s.status==='saving')return 'Saving…';
 if(s.status==='error')return 'Not saved — export a backup';
 if(s.status==='conflict')return 'Conflict — your edits were kept';
 if(!s.persistent)return 'Session only — export to keep';
 const published=s.publishedRevision?'published rev '+s.publishedRevision:'not published';
 return (s.revision?'Draft rev '+s.revision+' saved on this browser':'No draft saved yet')+' · '+published;
}

export function EditorPage({repository,notify,paused,onPreview,onPublished}:Props) {
 const [where,setWhere]=useState(()=>readSection(location.hash));
 useEffect(()=>{const change=()=>{if(location.hash.startsWith('#editor'))setWhere(readSection(location.hash));};addEventListener('hashchange',change);return()=>removeEventListener('hashchange',change);},[]);
 const {state,commit,publish,importDraft,overwrite,reload,local}=useDraft(repository,notify,onPublished);
 const [confirm,setConfirm]=useState<Confirmation|null>(null);
 if(state.status==='unavailable')return <><Notice error>{'Editing is unavailable: '+state.message}</Notice></>;
 const draft=state.content;
 if(!draft)return <p className="editor-notice" role="status">Loading the local draft…</p>;
 const {section,workshop}=where,collection=collectionOf[section];
 const preview=()=>onPreview(draft,state.revision);
 const dialog=confirm&&<ConfirmDialog confirm={confirm} close={()=>setConfirm(null)}/>;
 const canPublish=state.status==='saved'&&state.revision>0&&state.revision!==state.publishedRevision;
 const requestPublish=()=>setConfirm({eyebrow:'PUBLISH LOCALLY',title:'Publish draft revision '+state.revision+'?',lead:'This browser’s public pages will show this revision. Nothing is uploaded: other visitors and devices keep seeing their own content until the authorized backend arrives.',action:'Publish in this browser',run:publish});
 const chooseImport=async(file:File|undefined)=>{
  if(!file)return;
  try{
   if(file.size>MAX_IMPORT)throw Error('Choose an export smaller than 50 MB.');
   const next=JSON.parse(await file.text());validateContent(next);
   setConfirm({eyebrow:'IMPORT CONTENT',title:'Replace this local draft?',lead:'Importing replaces the current browser draft, including its project galleries. The replaced draft is kept as a recovery copy you can download, and nothing is published.',action:'Replace local draft',run:()=>importDraft(next)});
  }catch(error){notify(error instanceof SyntaxError?'That file is not valid JSON.':(error as Error).message);}
 };
 const recovery=async()=>{const copy=await local?.getRecovery();if(copy)download(copy.content,'Portfolio_Content_before_import.json');};
 const shared={draft,commit,notify,repository,paused,confirm:setConfirm};
 if(workshop)return <><WorkshopEditor draft={draft} inventory={workshop==='inventory'} commit={commit} confirm={setConfirm} notify={notify} paused={paused} preview={preview} status={statusText(state)}/>{dialog}</>;
 return <><div className="editor-shell"><aside className="editor-sidebar"><a href="#home" className="editor-logo">JVD<span>WORLD EDITOR</span></a><span className="editor-mode"><i></i> LOCAL DRAFT</span>
 <nav aria-label="Editor sections">{sections.map(([id,name,icon])=><a key={id} href={'#editor/'+id} aria-current={id===section?'page':undefined}><span>{icon}</span>{name}<small>{id==='projects'?draft.projects.length:id==='experience'?draft.experience.length:''}</small></a>)}</nav>
 <div className="editor-side-bottom"><button className="text-button" id="export-content" onClick={()=>download(draft)}>↓ Export content JSON</button><label className="text-button import-control">↑ Import content JSON<input type="file" id="import-content" accept="application/json,.json" className="sr-only" onChange={e=>{void chooseImport(e.currentTarget.files?.[0]);e.currentTarget.value='';}}/></label>{state.recovery&&<button className="text-button" id="download-recovery" onClick={recovery}>↓ Pre-import recovery copy</button>}<a href="#home">← Return to portfolio</a></div></aside>
 <div className="editor-main"><div className="editor-topbar"><div><span className="eyebrow">{'CONTENT STUDIO / '+section.toUpperCase()}</span><h1>{sections.find(([id])=>id===section)![1]}</h1></div>
 <div className="editor-actions"><a href={'#'+viewLink[section]} className="btn secondary" id="preview-section" onClick={preview}>Preview section ↗</a><button className="btn" id="publish-draft" disabled={!canPublish} onClick={requestPublish}>Publish in this browser</button><span className="local-status" id="save-status" role="status">{statusText(state)}</span></div></div>
 <p className="editor-notice" id="local-mode-notice">Local mode · no sign-in and no shared backend yet. Drafts and publications stay in this browser{state.persistent?'':' for this session only'}; other visitors never see them. Export a backup to carry your content into the real project.</p>
 {state.status==='conflict'&&<ConflictPanel message={state.message} reload={reload} overwrite={overwrite} exportMine={()=>download(draft,'Portfolio_Content_my_version.json')}/>}
 {section==='skills'&&<SkillEditorNav active="loadout"/>}
 <div id="settings-area"><SettingsCard {...shared} section={section}/>{section==='experience'&&<CharactersCard draft={draft} commit={commit}/>}</div>
 {(section==='achievements'||section==='certifications')&&<div id="tree-connection-editor"><TreeConnectionEditor draft={draft} tree={section} commit={commit}/></div>}
 <EntryEditor key={section} {...shared} collection={collection}/></div></div>{dialog}</>;
}


function ConflictPanel({message,reload,overwrite,exportMine}:{message:string;reload:()=>void;overwrite:()=>void;exportMine:()=>void}) {
 return <div className="editor-notice conflict-notice" role="alert"><strong>{message}</strong> Choose how to continue: <button className="text-button" id="conflict-reload" onClick={reload}>Load the newer draft</button> · <button className="text-button" id="conflict-export" onClick={exportMine}>Download my version</button> · <button className="text-button danger" id="conflict-overwrite" onClick={overwrite}>Save mine over it</button></div>;
}
