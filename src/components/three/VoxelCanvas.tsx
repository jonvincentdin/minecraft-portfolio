import { useEffect, useRef, useState } from 'react';
import { VoxelView, type Scene } from './renderer.js';
export function VoxelCanvas({ paused }: { paused: boolean }) {
 const host = useRef<HTMLDivElement>(null);
 const view = useRef<VoxelView | null>(null);
 const pause = useRef(paused); pause.current = paused;
 const [status, setStatus] = useState('loading');
 useEffect(() => {
  const container = host.current!;
  const abort = new AbortController();
  let instance: VoxelView | null = null;
  // destroy() loses the WebGL context, so StrictMode remounts need a fresh canvas.
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Original React voxel artifact. Drag to rotate, or use the controls below.');
  container.replaceChildren(canvas);
  setStatus('loading');
  fetch('/assets/models/scene-data.json', { signal: abort.signal })
   .then(response => { if (!response.ok) throw new Error('Scene data unavailable'); return response.json() as Promise<Record<string, Scene>>; })
   .then(scenes => {
    if (abort.signal.aborted) return;
    if (!scenes.skill_react) throw new Error('React scene unavailable');
    instance = new VoxelView(canvas, scenes.skill_react, { paused: () => pause.current });
    view.current = instance;
    setStatus(instance.gl ? 'webgl' : 'fallback');
   }).catch(() => { if (!abort.signal.aborted) setStatus('fallback'); });
  return () => { abort.abort(); instance?.destroy(); view.current = null; canvas.remove(); };
 }, []);
 return <figure className="model-smoke" data-render-mode={status}>
  <div className="model-stage"><div ref={host} className="model-canvas" hidden={status === 'fallback'} />
   {status === 'fallback' && <img src="/assets/thumbs/skill_react.png" alt="Original React voxel artifact thumbnail" />}
  </div>
  <figcaption>{status === 'webgl' ? 'Scene-data renderer active' : status === 'fallback' ? '3D unavailable — supplied thumbnail' : 'Loading original scene…'}</figcaption>
  <div className="toolbar" aria-label="Model controls">
   <button className="filter" disabled={status !== 'webgl'} onClick={() => view.current?.turn(-0.3)}>Rotate left</button>
   <button className="filter" disabled={status !== 'webgl'} onClick={() => view.current?.turn(0.3)}>Rotate right</button>
   <button className="filter" disabled={status !== 'webgl'} onClick={() => view.current?.reset()}>Reset view</button>
  </div>
 </figure>;
}
