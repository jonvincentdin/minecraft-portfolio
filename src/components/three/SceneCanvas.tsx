import { useEffect, useRef, useState } from 'react';
import { VoxelView, type Scene } from './renderer.js';
export function SceneCanvas({ scene, paused }: { scene?: Scene; paused: boolean }) {
 const host = useRef<HTMLDivElement>(null);
 const pause = useRef(paused); pause.current = paused;
 const [fallback, setFallback] = useState(!scene);
 useEffect(() => {
  const container = host.current!;
  if (!scene) { setFallback(true); return; }
  const canvas = document.createElement('canvas');
  canvas.id = 'world'; canvas.setAttribute('aria-label','Voxel landscape'); canvas.setAttribute('role','img');
  container.replaceChildren(canvas);
  let view: VoxelView | undefined;
  try {
   view = new VoxelView(canvas, scene, { world:true, paused:()=>pause.current });
   setFallback(!view.gl);
  } catch {
   // A failed shader setup may allocate resources before the constructor returns.
   canvas.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext();
   setFallback(true);
  }
  return () => { view?.destroy(); canvas.remove(); };
 }, [scene]);
 return <><div className="scene-host" ref={host} hidden={fallback} data-render-mode={fallback?'fallback':'webgl'} />{fallback && <img className="model-fallback" src="/assets/thumbs/crafting_table.png" alt="Voxel landscape fallback: crafting table" />}</>;
}

export const WorldScene = SceneCanvas;
