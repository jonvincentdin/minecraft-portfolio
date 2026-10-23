import { useEffect, useRef, useState } from 'react';
import { VoxelView, type Scene } from './renderer.js';
interface Props { scene?:Scene; model:string; paused:boolean; character?:boolean; rotate?:boolean; controls?:boolean; id:string; label:string; containerClass?:string; stage?:boolean }
export function ModelViewer({scene,model,paused,character=false,rotate=false,controls=true,id,label,containerClass,stage=false}:Props) {
 const host=useRef<HTMLDivElement>(null), view=useRef<VoxelView | null>(null);
 const activeScene=useRef<Scene|undefined>(undefined);
 const pause=useRef(paused);pause.current=paused;
 const [fallback,setFallback]=useState(false),[wire,setWire]=useState(false);
 useEffect(()=>{
  const canvas=document.createElement('canvas');canvas.id=id;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',label);
  host.current!.replaceChildren(canvas);
  if(!scene){setFallback(true);return()=>canvas.remove();}
  let instance:VoxelView|undefined;
  try { instance=new VoxelView(canvas,scene,{character,rotate,paused:()=>pause.current});view.current=instance;activeScene.current=scene;setFallback(!instance.gl);instance.setWire(wire); }
  catch {canvas.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext();setFallback(true);}
  return()=>{instance?.destroy();view.current=null;canvas.remove();};
  // Availability changes need a fresh canvas; scene changes use the original set()
  // behavior below to preserve elevation, wire state and one animation clock.
 },[Boolean(scene),character,rotate,id,label]);
 useEffect(()=>{if(scene&&view.current&&scene!==activeScene.current){view.current.set(scene);activeScene.current=scene;}},[scene]);
 const drawing=<><div className="scene-host" ref={host} hidden={fallback} data-model={model} data-render-mode={fallback?'fallback':'webgl'}/>{fallback&&<img className="model-fallback" src={'/assets/thumbs/'+model+'.png'} alt={label}/>}</>;
 const buttons=controls&&<div className="viewer-controls">
 <button aria-label="Rotate left" disabled={fallback} onClick={()=>view.current?.turn(-.35)}>↶</button>
 <button aria-label="Rotate right" disabled={fallback} onClick={()=>view.current?.turn(.35)}>↷</button>
 <button disabled={fallback} onClick={()=>view.current?.reset()}>Reset view</button>
 <button disabled={fallback} aria-pressed={wire} onClick={()=>{view.current?.setWire(!wire);setWire(!wire);}}>Wireframe</button></div>;
 if(stage)return <div className="character-stage"><div className="stage-ring"/>{drawing}{buttons}</div>;
 return <>{containerClass?<div className={containerClass}>{drawing}</div>:drawing}{buttons}</>;
}
