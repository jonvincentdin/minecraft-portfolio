import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorPage } from '../features/editor/EditorPage';
import { Shell } from '../components/layout/Shell';
import { Notice } from '../components/ui/Notice';
import { HomePage } from '../features/home/HomePage';
import { Intro } from '../features/intro/Intro';
import { PublicRoute } from '../features/PublicRoute';
import { createContentRepository } from '../data/repository';
import type { ContentSnapshot, PortfolioContent } from '../types/content';
import type { Scene } from '../components/three/renderer.js';
import { readRoute, routes } from './routes';
import { mountSectionMotion, pixelBurst } from '../lib/motion.js';
export function App() {
 const [route,setRoute]=useState(()=>readRoute(location.hash));
 const [paused,setPaused]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [snapshot,setSnapshot]=useState<ContentSnapshot>();
 const [scenes,setScenes]=useState<Record<string,Scene>>({});
 const [progress,setProgress]=useState(0),[ready,setReady]=useState(false),[error,setError]=useState(''),[warning,setWarning]=useState('');
 const [open,setOpen]=useState(true),[cycle,setCycle]=useState(0),[toast,setToast]=useState('');
 // One repository for the published snapshot and the editor; an invalid environment surfaces as an error.
 const [source]=useState(()=>{try{return {repository:createContentRepository(import.meta.env)};}catch(reason){return {failure:(reason as Error).message};}});
 // Draft preview renders the unchanged public pages with the editor's working copy, under a visible banner.
 const [preview,setPreview]=useState<{content:PortfolioContent;revision:number}|null>(null);
 const published=useCallback((next:ContentSnapshot)=>{setSnapshot(next);setPreview(null);},[]);
 const startPreview=useCallback((content:PortfolioContent,revision:number)=>setPreview({content:structuredClone(content),revision}),[]);
 const pausedRef=useRef(paused),openRef=useRef(open),sectionMotion=useRef<(()=>void)|undefined>(undefined);
 pausedRef.current=paused;openRef.current=open;
 const stageHome=useCallback(()=>{history.replaceState(null,'','#home');setRoute('home');},[]);
 const finish=useCallback(()=>setOpen(false),[]);
 useEffect(()=>{document.body.classList.toggle('intro-open',open);if(!open)document.getElementById('main')?.focus({preventScroll:true});return()=>document.body.classList.remove('intro-open');},[open]);
 useEffect(()=>{document.body.classList.toggle('paused',paused);return()=>document.body.classList.remove('paused');},[paused]);
 useEffect(()=>{document.body.classList.toggle('editing',route==='editor');return()=>document.body.classList.remove('editing');},[route]);
 useEffect(()=>{document.title=(route in routes?routes[route as keyof typeof routes]:'World Editor')+' — '+(snapshot?.content.settings.name||'Jon Vincent Din');},[route,snapshot]);
 useEffect(()=>{
  let animation:Animation|undefined;let sequence=0;
  const change=()=>{const id=++sequence;animation?.cancel();const next=readRoute(location.hash);const main=document.getElementById('main')!;
   const settle=()=>{if(id!==sequence)return;setRoute(next);animation?.cancel();window.scrollTo({top:0,behavior:'instant'});if(!open)main.focus({preventScroll:true});};
   if(paused||open){settle();return;}
   animation=main.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:140,easing:'ease-in',fill:'forwards'});
   void animation.finished.then(settle,()=>{});
  };
  // Settle the latest hash if a preference change cancelled an in-flight navigation.
  setRoute(readRoute(location.hash));
  addEventListener('hashchange',change);return()=>{sequence++;animation?.cancel();removeEventListener('hashchange',change);};
 },[paused,open]);
 // Reveal each rendered route once, as the reference did after render(); the intro already animates the page beneath it.
 useEffect(()=>{
  if(!snapshot||openRef.current||route==='editor')return;
  const stop=mountSectionMotion(document.getElementById('main')!,()=>pausedRef.current);sectionMotion.current=stop;
  return()=>{stop();if(sectionMotion.current===stop)sectionMotion.current=undefined;};
 },[route,snapshot]);
 useEffect(()=>{if(paused)sectionMotion.current?.();},[paused]);
 useEffect(()=>{
  const click=(event:MouseEvent)=>{const button=(event.target as Element|null)?.closest?.('.btn');if(button&&!pausedRef.current&&!document.body.classList.contains('editing')&&!document.body.classList.contains('intro-open'))pixelBurst(button,event);};
  document.addEventListener('click',click);return()=>document.removeEventListener('click',click);
 },[]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setPaused(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{
  const abort=new AbortController();let alive=true;
  const advance=(amount:number)=>{if(alive)setProgress(value=>value+amount);};
  setProgress(0);
  const content=Promise.resolve().then(()=>{if(!source.repository)throw Error(source.failure);return source.repository.getPublishedContent('jvd-world');}).then(value=>{if(alive)setSnapshot(value);advance(25);});
  const models=fetch('/assets/models/scene-data.json',{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(15000)])}).then(r=>{if(!r.ok)throw Error('Models unavailable');return r.json();}).then(value=>{if(alive)setScenes(value);}).catch(()=>{if(alive)setWarning('3D data unavailable. Supplied thumbnails remain available.');}).finally(()=>advance(50));
  const fonts=document.fonts.load('16px JVD').then(()=>document.fonts.ready).finally(()=>advance(25));
  void Promise.all([content,models,fonts]).then(()=>{if(alive){setProgress(100);setReady(true);}}).catch(reason=>{if(alive){setError(reason.message);setOpen(false);}});
  return()=>{alive=false;abort.abort();};
 },[source]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),5500);return()=>clearTimeout(timer);},[toast]);
 const shown=preview&&route!=='editor'?preview.content:snapshot?.content;
 return <>{open&&!error&&<Intro key={cycle} ready={ready} progress={progress} title={snapshot?.content.settings.introTitle||'A world built one idea at a time.'} warning={warning} paused={paused} stageHome={stageHome} finish={finish}/>}
 <Shell route={route} paused={paused} togglePause={()=>setPaused(value=>!value)} locked={open&&!error} name={shown?.settings.name}>
 {preview&&route!=='editor'&&<p className="foundation-notice preview-banner" role="status">{'Draft preview · local revision '+preview.revision+' · not published. '}<a href="#editor">Back to editor</a>{' · '}<button className="text-button" onClick={()=>setPreview(null)}>Exit preview</button></p>}
 {error?<Notice error>{error}</Notice>:snapshot&&shown&&(route==='editor'&&source.repository?<EditorPage repository={source.repository} notify={setToast} paused={paused} onPreview={startPreview} onPublished={published}/>:route==='home'?<HomePage content={shown} scene={scenes.home_landscape} paused={paused} replay={()=>{setCycle(value=>value+1);setOpen(true);}} notify={setToast}/>:<PublicRoute route={route} content={shown} scenes={scenes} paused={paused} notify={setToast}/>)}
 </Shell><div id="toast" role="status" aria-live="polite" className={toast?'visible':''}>{toast}</div></>;
}
