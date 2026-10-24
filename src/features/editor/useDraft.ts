import {useCallback,useEffect,useRef,useState} from 'react';
import type {ContentRepository} from '../../data/ContentRepository';
import {ConflictError} from '../../data/ContentRepository';
import {AuthorizationError} from '../../data/ContentRepository';
import {validateContent} from '../../domain/content-validation';
import type {ContentSnapshot,PortfolioContent} from '../../types/content';

export type SaveStatus='loading'|'saved'|'saving'|'error'|'conflict'|'unauthorized'|'unavailable';
export interface DraftState { content?:PortfolioContent; revision:number; status:SaveStatus; message:string; persistent:boolean; publishedRevision:number; recovery:boolean }

const failure=(error:unknown):SaveStatus=>error instanceof ConflictError?'conflict':error instanceof AuthorizationError?'unauthorized':'error';

// Owns the working copy. Every change is validated as a whole document and saved with compare-and-swap;
// a failed or conflicting save keeps the working copy so no edit is lost.
export function useDraft(repository:ContentRepository,notify:(message:string)=>void,onPublished:(snapshot:ContentSnapshot)=>void) {
 const [state,setState]=useState<DraftState>({revision:0,status:'loading',message:'',persistent:false,publishedRevision:0,recovery:false});
 const latest=useRef(state);latest.current=state;
 // Synchronous copies, so back-to-back commits build on each other and saves run one at a time.
 const working=useRef<PortfolioContent|undefined>(undefined),revision=useRef(0),queue=useRef<Promise<unknown>>(Promise.resolve());

 const load=useCallback(async()=>{
  try{
   const [draft,published,persistent,recovery]=await Promise.all([repository.getDraft('jvd-world'),repository.getPublishedContent('jvd-world'),repository.isPersistent(),repository.getRecovery()]);
   working.current=draft.content;revision.current=draft.revision;
   setState({content:draft.content,revision:draft.revision,status:'saved',message:'',persistent,publishedRevision:published.revision,recovery:!!recovery});
  }catch(error){setState(s=>({...s,status:error instanceof AuthorizationError?'unauthorized':'unavailable',message:(error as Error).message}));}
 },[repository]);
 useEffect(()=>{void load();},[load]);

 const save=useCallback((next:PortfolioContent,message:string)=>{
  working.current=next;
  setState(s=>({...s,content:next,status:'saving',message:''}));
  const run=queue.current.then(async()=>{
   try{
    revision.current=await repository.saveDraft(working.current!,revision.current);
    if(working.current===next)setState(s=>({...s,revision:revision.current,status:'saved'}));
    notify(message);return true;
   }catch(error){
    setState(s=>({...s,status:failure(error),message:(error as Error).message}));notify((error as Error).message);return false;
   }
  });
  queue.current=run;return run;
 },[repository,notify]);

 // Applies a change to a copy, rejects it before saving if the whole document becomes invalid.
 const commit=useCallback(async(change:(draft:PortfolioContent)=>void,message:string)=>{
  const current=working.current;if(!current)return false;
  const next=structuredClone(current);change(next);
  try{validateContent(structuredClone(next));}catch(error){notify((error as Error).message);return false;}
  return save(next,message);
 },[save,notify]);

 // Conflict recovery: explicitly keep this tab's copy over the newer stored revision.
 const overwrite=useCallback(async()=>{
  const current=working.current;if(!current)return;
  revision.current=(await repository.getDraft('jvd-world')).revision;
  await save(current,'Your version was saved over the newer draft.');
 },[repository,save]);

 const publish=useCallback(async()=>{
  await queue.current;
  if(latest.current.status!=='saved'){notify('Save the draft before publishing.');return false;}
  try{
   const published=await repository.publishDraft(revision.current);
   const snapshot=await repository.getPublishedContent('jvd-world');
   setState(s=>({...s,publishedRevision:published}));onPublished(snapshot);
   notify(repository.kind==='local'?'Revision '+published+' published in this browser.':'Revision '+published+' is now public.');return true;
  }catch(error){setState(s=>({...s,status:error instanceof ConflictError||error instanceof AuthorizationError?failure(error):s.status,message:(error as Error).message}));notify((error as Error).message);return false;}
 },[repository,notify,onPublished]);

// Saves the current working copy again after a failed save, for example once the editor signed back in.
 const retry=useCallback(async()=>{const current=working.current;if(current)await save(current,'Draft saved.');},[save]);

 const importDraft=useCallback(async(next:PortfolioContent)=>{
  try{
   await queue.current;
   revision.current=await repository.importDraft(next,revision.current);working.current=structuredClone(next);
   setState(s=>({...s,content:working.current,revision:revision.current,status:'saved',message:'',recovery:true}));
   notify('Content imported as a draft. Nothing was published.');return true;
  }catch(error){setState(s=>({...s,status:error instanceof ConflictError||error instanceof AuthorizationError?failure(error):s.status,message:(error as Error).message}));notify((error as Error).message);return false;}
 },[repository,notify]);

 return {state,commit,publish,importDraft,overwrite,retry,reload:load};
}
