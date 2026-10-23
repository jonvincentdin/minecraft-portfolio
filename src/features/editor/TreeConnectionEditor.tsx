import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {canConnect,treeLine} from '../../domain/tree-paths.js';
import type {Advancement} from '../../types/content';
import type {Draft} from './schema';

type TreeKey='achievements'|'certifications';
interface Props { draft:Draft; tree:TreeKey; commit:(change:(d:Draft)=>void,message:string)=>Promise<boolean> }

// Visual parent links and layout, as reference/site/tree-editor.js: move or connect mode, make root, numeric position.
export function TreeConnectionEditor({draft,tree,commit}:Props) {
 const saved=draft[tree];
 const [mode,setMode]=useState<'move'|'connect'>('move'),[parent,setParent]=useState<string|null>(null),[selected,setSelected]=useState<string|null>(null);
 const [help,setHelp]=useState('Drag nodes to arrange them. Select a node to edit its position below.');
 // While dragging, positions live here until pointerup saves them.
 const [moving,setMoving]=useState<Record<string,{x:number;y:number}>>({});
 const drag=useRef<{id:string;x:number;y:number;nx:number;ny:number}|null>(null),moved=useRef(false);
 const [position,setPosition]=useState({x:'',y:''});
 useEffect(()=>{setMode('move');setParent(null);setSelected(null);setMoving({});},[tree]);
 const nodes:Advancement[]=saved.map(n=>moving[n.id]?{...n,...moving[n.id]}:n);
 const node=(id:string|null)=>nodes.find(x=>x.id===id);
 const show=(id:string)=>{setSelected(id);const n=node(id);if(n)setPosition({x:String(n.x),y:String(n.y)});};

 const choose=async(id:string)=>{
  if(moved.current){moved.current=false;return;}
  show(id);if(mode!=='connect')return;
  if(!parent){setParent(id);setHelp('Now select the child of '+node(id)!.title+'.');return;}
  if(!canConnect(saved,parent,id)){setHelp('That connection would form a cycle. Choose a different child.');return;}
  const from=parent;setParent(null);
  if(await commit(d=>{d[tree].find(x=>x.id===id)!.parent=from;},'Connection saved.'))setHelp('Connected. Select a parent to add another connection.');
 };
 const detach=async()=>{if(!selected){setHelp('Select the node to make a root first.');return;}setParent(null);await commit(d=>{d[tree].find(x=>x.id===selected)!.parent='';},'Node is now a root.');};
 const savePosition=async()=>{
  const x=Number(position.x),y=Number(position.y);
  if(!selected)return;
  if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>900||y<0||y>900){setHelp('Use positions between 0 and 900.');return;}
  await commit(d=>{Object.assign(d[tree].find(n=>n.id===selected)!,{x,y});},'Position saved.');
 };
 const down=(e:PointerEvent<HTMLDivElement>)=>{const b=(e.target as Element).closest<HTMLElement>('[data-edit-node]');if(!b||mode!=='move')return;const n=node(b.dataset.editNode!)!;drag.current={id:n.id,x:e.clientX,y:e.clientY,nx:Number(n.x),ny:Number(n.y)};moved.current=false;};
 // Capture only once a drag starts: capturing on pointerdown retargets the click to the canvas, which is why
 // selecting a node in move mode never worked in the reference under current Chromium.
 const move=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)<4&&!moved.current)return;if(!moved.current)e.currentTarget.setPointerCapture(e.pointerId);moved.current=true;setSelected(d.id);setMoving(m=>({...m,[d.id]:{x:Math.round(Math.max(40,Math.min(900,d.nx+dx))),y:Math.round(Math.max(40,Math.min(900,d.ny+dy)))}}));};
 const up=async()=>{const d=drag.current;if(!d)return;drag.current=null;if(!moved.current)return;const at=moving[d.id];if(!at)return;setPosition({x:String(at.x),y:String(at.y)});await commit(c=>{Object.assign(c[tree].find(n=>n.id===d.id)!,at);},'Node position saved.');setMoving(m=>{const {[d.id]:_,...rest}=m;return rest;});};
 const cancel=()=>{drag.current=null;setMoving({});};
 const current=node(selected);

 return <div className="tree-editor"><div className="tree-editor-heading"><div><span className="eyebrow">{(tree==='achievements'?'ACHIEVEMENT':'CERTIFICATION')+' CONNECTIONS'}</span><h2>Shape the journey.</h2></div>
 <div className="tree-edit-tools">{(['move','connect'] as const).map(m=><button key={m} data-tree-mode={m} aria-pressed={mode===m} onClick={()=>{setMode(m);setParent(null);setHelp(m==='connect'?'Select the parent node, then the child to connect.':'Drag nodes to arrange them, or use the position fields.');}}>{m==='move'?'Move nodes':'Connect nodes'}</button>)}<button data-tree-detach onClick={detach}>Make root</button></div></div>
 <p className="help" id="connection-help" aria-live="polite">{help}</p>
 <div className="tree-edit-scroll"><div className="tree-edit-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}><svg viewBox="0 0 1000 1000" aria-hidden="true">{nodes.map(n=>{const p=nodes.find(x=>x.id===n.parent);return p?<path key={n.id} d={treeLine(p,n)}/>:null;})}</svg>
 <div className="tree-edit-nodes">{nodes.map(n=><button key={n.id} data-edit-node={n.id} className={[n.id===selected?'selected':'',n.id===parent?'connection-parent':''].join(' ')} style={{left:Number(n.x)+'px',top:Number(n.y)+'px'}} onClick={()=>void choose(n.id)}><img src={'/assets/thumbs/item_'+n.symbol+'.png'} alt=""/><span>{n.title}</span>{!n.parent&&<small>ROOT</small>}</button>)}</div></div></div>
 <div className="tree-selected-position" hidden={!current}><span id="tree-selected-label">{current?.title}</span><label>X <input type="number" min="0" max="900" step="10" data-tree-x value={position.x} onChange={e=>setPosition(p=>({...p,x:e.target.value}))}/></label><label>Y <input type="number" min="0" max="900" step="10" data-tree-y value={position.y} onChange={e=>setPosition(p=>({...p,y:e.target.value}))}/></label><button data-save-position onClick={savePosition}>Save position</button></div>
 <p className="help">Connect mode: select a parent, then its child. Each node has one parent; cycles are blocked. Achievements and certifications stay separate.</p></div>;
}
