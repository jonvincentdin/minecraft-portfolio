import { useCallback, useEffect, useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Notice } from '../components/ui/Notice';
import { HomePage } from '../features/home/HomePage';
import { Intro } from '../features/intro/Intro';
import { PublicRoute } from '../features/PublicRoute';
import { createContentRepository } from '../data/repository';
import type { ContentSnapshot } from '../types/content';
import type { Scene } from '../components/three/renderer.js';
import { readRoute, routes } from './routes';
export function App() {
 const [route,setRoute]=useState(()=>readRoute(location.hash));
 const [paused,setPaused]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [snapshot,setSnapshot]=useState<ContentSnapshot>();
 const [scenes,setScenes]=useState<Record<string,Scene>>({});
 const [progress,setProgress]=useState(0),[ready,setReady]=useState(false),[error,setError]=useState(''),[warning,setWarning]=useState('');
 const [open,setOpen]=useState(true),[cycle,setCycle]=useState(0),[toast,setToast]=useState('');
 const stageHome=useCallback(()=>{history.replaceState(null,'','#home');setRoute('home');},[]);
 const finish=useCallback(()=>setOpen(false),[]);
 useEffect(()=>{document.body.classList.toggle('intro-open',open);if(!open)document.getElementById('main')?.focus({preventScroll:true});return()=>document.body.classList.remove('intro-open');},[open]);
 useEffect(()=>{document.body.classList.toggle('paused',paused);return()=>document.body.classList.remove('paused');},[paused]);
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
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setPaused(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{
  const abort=new AbortController();let alive=true;
  const advance=(amount:number)=>{if(alive)setProgress(value=>value+amount);};
  setProgress(0);
  const content=Promise.resolve().then(()=>createContentRepository(import.meta.env).getPublishedContent('jvd-world')).then(value=>{if(alive)setSnapshot(value);advance(25);});
  const models=fetch('/assets/models/scene-data.json',{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(15000)])}).then(r=>{if(!r.ok)throw Error('Models unavailable');return r.json();}).then(value=>{if(alive)setScenes(value);}).catch(()=>{if(alive)setWarning('3D data unavailable. Supplied thumbnails remain available.');}).finally(()=>advance(50));
  const fonts=document.fonts.load('16px JVD').then(()=>document.fonts.ready).finally(()=>advance(25));
  void Promise.all([content,models,fonts]).then(()=>{if(alive){setProgress(100);setReady(true);}}).catch(reason=>{if(alive){setError(reason.message);setOpen(false);}});
  return()=>{alive=false;abort.abort();};
 },[]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),5500);return()=>clearTimeout(timer);},[toast]);
 return <>{open&&!error&&<Intro key={cycle} ready={ready} progress={progress} title={snapshot?.content.settings.introTitle||'A world built one idea at a time.'} warning={warning} paused={paused} stageHome={stageHome} finish={finish}/>}
 <Shell route={route} paused={paused} togglePause={()=>setPaused(value=>!value)} locked={open&&!error} name={snapshot?.content.settings.name}>
 {error?<Notice error>{error}</Notice>:snapshot&&(route==='home'?<HomePage content={snapshot.content} scene={scenes.home_landscape} paused={paused} replay={()=>{setCycle(value=>value+1);setOpen(true);}} notify={setToast}/>:<PublicRoute route={route} content={snapshot.content} scenes={scenes} paused={paused} notify={setToast}/>)}
 </Shell><div id="toast" role="status" aria-live="polite" className={toast?'visible':''}>{toast}</div></>;
}
