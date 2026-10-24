import { useEffect, useRef, useState, type CSSProperties } from 'react';
function shuffled<T>(items:T[]):T[] { const result=[...items]; for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result; }
export function Intro({ ready, progress, title, warning, paused, stageHome, finish }: { ready:boolean; progress:number; title:string; warning:string; paused:boolean; stageHome:()=>void; finish:()=>void }) {
 const root=useRef<HTMLDivElement>(null), button=useRef<HTMLButtonElement>(null);
 const [exiting,setExiting]=useState(false);
 useEffect(()=>{if(ready)button.current?.focus({preventScroll:true});else root.current?.focus();},[ready]);
 useEffect(()=>{
  if(!exiting)return;
  if(paused){finish();return;}
  const loader=root.current!;let alive=true;const animations:Animation[]=[];
  const animate=(el:Element,frames:Keyframe[],timing:KeyframeAnimationOptions)=>{const a=el.animate(frames,timing);animations.push(a);return a.finished.catch(()=>{});};
  const groups=Array.from(loader.querySelectorAll<HTMLElement>('.cinema-landscape,.cinema-content'));
  groups.forEach(el=>{el.style.transform=getComputedStyle(el).transform;el.style.animation='none';});
  const pieces=Array.from(loader.querySelectorAll<HTMLElement>('.cinema-landscape > *, .cinema-content > *, .cinema-bottom > *'));
  // Pieces fade out while they rise (the reference keeps them at .85), so no solid slab sweeps across the page being revealed.
  // The ground is the largest piece, a full-width grid plane, so it is gone before it reaches the header.
  const tasks=shuffled(pieces).map((el,i)=>{const transform=getComputedStyle(el).transform;const base=transform==='none'?'':transform;const ground=el.classList.contains('cinema-ground');return animate(el,[{transform:base||'none',opacity:1},{offset:ground?.35:.55,opacity:ground?.25:.8},{transform:'translate3d(0,-115vh,0) '+base,opacity:0}],{duration:650+(i%3)*60,delay:i*18,easing:'cubic-bezier(.64,0,.32,1)',fill:'forwards'});});
  shuffled(Array.from(loader.querySelectorAll('.intro-shutters > span'))).forEach((el,i)=>tasks.push(animate(el,[{transform:'translateY(0)'},{transform:'translateY(-102%)'}],{duration:680,delay:320+i*46,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'})));
  document.querySelectorAll('#site-header,main .hero-copy > *, main .hero-world,#site-footer').forEach(el=>tasks.push(animate(el,[{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,delay:560,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'})));
  document.body.classList.add('world-entering');
  void Promise.all(tasks).then(()=>{if(alive)finish();});
  return ()=>{alive=false;animations.forEach(a=>a.cancel());document.body.classList.remove('world-entering');groups.forEach(el=>{el.style.removeProperty('animation');el.style.removeProperty('transform');});};
 },[exiting,paused,finish]);
 return <div id="loader" ref={root} tabIndex={-1} className={'loader intro-playing'+(exiting?' intro-exiting':'')} role="dialog" aria-modal="true" aria-labelledby="intro-title" data-phase={exiting?'exiting':ready?'ready':'loading'} onKeyDown={event=>{if(event.key==='Tab'){event.preventDefault();if(ready&&!exiting)button.current?.focus();}}}>
 {exiting&&<div className="intro-shutters" aria-hidden="true">{Array.from({length:8},(_,i)=><span key={i} style={{'--panel':i} as CSSProperties}/>)}</div>}
 <div className="cinema-grain"/><div className="cinema-landscape" aria-hidden="true"><div className="voxel-sun"/><div className="mountains far"/><div className="mountains near"/><div className="cinema-ground"/><div className="cinema-block block-one"/><div className="cinema-block block-two"/><div className="cinema-block block-three"/><div className="cinema-particles">✦ · ✦ · ✦</div></div>
 <div className="cinema-content"><span className="eyebrow">JVD / AN INTERACTIVE PORTFOLIO</span><h1 id="intro-title">{title}</h1><p id="load-status" role="status">{ready?(warning||'World ready. Your story starts here.'):'Gathering the first blocks…'}</p><progress id="load-progress" max="100" value={progress} aria-label="Loading assets"/></div>
 <div className="cinema-bottom"><span>EXPLORE. CREATE. KEEP BUILDING.</span><button ref={button} id="skip-intro" className="text-button" disabled={!ready||exiting} onClick={()=>{if(!ready||exiting)return;stageHome();setExiting(true);}}>{ready?'Enter world →':'Preparing world…'}</button><span>WORLD 001 / JON VINCENT DIN</span></div></div>;
}
