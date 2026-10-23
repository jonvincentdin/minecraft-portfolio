import { useEffect, useMemo, useRef, useState } from 'react';
import type { PortfolioContent, Project } from '../../types/content';
import type { Scene } from '../../components/three/renderer.js';
import { ModelViewer } from '../../components/three/ModelViewer';
import { SectionHeading, EmptyState } from '../../components/ui/SectionHeading';
import { projectSymbol } from '../../data/symbols';
import { reconcileLayout, moveSlot, type Layout } from '../../domain/inventory';
import { safeImage } from '../../lib/urls';
import { ProjectModal } from './ProjectModal';
const storageKey='jvd-slots-v5';
export function ProjectsPage({content,scenes,paused,notify}:{content:PortfolioContent;scenes:Record<string,Scene>;paused:boolean;notify:(message:string)=>void}) {
 const ids=useMemo(()=>content.projects.map(item=>item.id),[content.projects]);
 const [layout,setLayout]=useState<Layout>(()=>{let saved:unknown;try{saved=JSON.parse(localStorage.getItem(storageKey)||'null');}catch{saved=null;}return reconcileLayout(saved,ids);});
 const [filter,setFilter]=useState('All'),[query,setQuery]=useState(''),[arrange,setArrange]=useState(false),[picked,setPicked]=useState<number|null>(null);
 const [selected,setSelected]=useState(()=>{const id=location.hash.split('/')[1];return ids.includes(id)?id:ids[0];}),[modal,setModal]=useState<Project|null>(null),[focused,setFocused]=useState(0);
 const [status,setStatus]=useState('Drag an item onto any slot to move it. Drop onto another item to swap.');
 const drag=useRef<number|null>(null),slots=useRef<(HTMLButtonElement|null)[]>([]);
 useEffect(()=>{setLayout(value=>reconcileLayout(value,ids));setSelected(value=>ids.includes(value)?value:ids[0]);},[ids]);
 const filtered=filter!=='All'||query.length>0;
 const shown=layout.map(id=>{const p=content.projects.find(item=>item.id===id);return p&&(filter==='All'||p.category===filter)&&(p.title+' '+projectSymbol(p.symbol)[1]).toLowerCase().includes(query.toLowerCase())?p:null;});
 const project=content.projects.find(item=>item.id===selected),model='item_'+projectSymbol(project?.symbol||'')[0];
 function save(next:Layout){setLayout(next);try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{notify('Arrangement changed for this session; browser storage is unavailable.');}}
 function move(from:number,to:number){if(filtered)return;save(moveSlot(layout,from,to));setPicked(null);setFocused(to);setStatus('Item moved to slot '+(to+1)+'.');slots.current[to]?.focus();}
 function resetFilter(value:string,search=false){if(search)setQuery(value);else setFilter(value);setArrange(false);setPicked(null);drag.current=null;}
 return <section className="inventory-page"><SectionHeading label="02 / PROJECT COLLECTION" title="Builds worth exploring." description="Pick an item, inspect the build, and open its story. Arrange your inventory however you like."/>
 <div className="toolbar">{['All',...new Set(content.projects.map(item=>item.category))].map(value=><button key={value} className="filter" aria-pressed={filter===value} onClick={()=>resetFilter(value)}>{value}</button>)}<label className="search">⌕<input id="project-search" aria-label="Search projects" placeholder="Find a project…" value={query} onChange={event=>resetFilter(event.target.value,true)}/></label></div>
 <div className="inventory-layout"><div><div className="inventory"><div className="inventory-top"><h2>PROJECT INVENTORY</h2><span className="meta" id="inventory-count">{`${shown.filter(Boolean).length} BUILDS / ${layout.length} SLOTS`}</span></div>
 <div className="grid" id="inventory-grid" aria-label="Rearrangeable project inventory">{shown.map((p,i)=><button key={i} ref={node=>{slots.current[i]=node;}} data-slot={i} data-project={p?.id} className={'slot'+(p&&p.id===selected?' selected':'')+(picked===i?' picked':'')+(!p?' vacant':'')} draggable={Boolean(p)&&!filtered} tabIndex={i===focused?0:-1} aria-label={'Slot '+(i+1)+(p?', '+p.title:', empty')} title={p?.title||'Empty slot'}
 onFocus={()=>setFocused(i)} onClick={()=>{if(arrange&&!filtered){if(picked===null&&layout[i]){setPicked(i);setStatus('Choose any destination slot.');}else if(picked!==null)move(picked,i);}else if(p)setSelected(p.id);}}
 onKeyDown={event=>{const cols=matchMedia('(max-width:760px)').matches?5:9;const delta:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols};if(event.key in delta){event.preventDefault();const next=Math.max(0,Math.min(layout.length-1,i+delta[event.key]));setFocused(next);slots.current[next]?.focus();}}}
 onDragStart={event=>{if(filtered||!p){event.preventDefault();return;}drag.current=i;event.dataTransfer.setData('text/plain',p.id);event.dataTransfer.effectAllowed='move';}}
 onDragOver={event=>{if(drag.current!==null&&!filtered)event.preventDefault();}}
 onDrop={event=>{if(drag.current!==null&&!filtered){event.preventDefault();move(drag.current,i);drag.current=null;}}}
 onDragEnd={()=>{drag.current=null;setPicked(null);}}>
 {p&&<><img src={'/assets/thumbs/item_'+projectSymbol(p.symbol)[0]+'.png'} alt=""/><span className="count">{String(i+1).padStart(2,'0')}</span></>}</button>)}</div>
 <div className="inventory-bottom"><div className="arrange-toolbar"><button className="filter" id="arrange" disabled={filtered} aria-pressed={arrange} onClick={()=>{setArrange(!arrange);setPicked(null);setStatus(!arrange?'Select an item, then select its destination slot.':'Drag an item to move it. Drop onto another item to swap.');}}>Rearrange items</button><button className="filter" id="reset-layout" onClick={()=>{save(reconcileLayout(null,ids));setPicked(null);setStatus('Inventory layout reset.');}}>Reset layout</button></div><p id="move-status" role="status">{status}</p></div></div>
 <div className="inventory-foot"><span>YOUR ARRANGEMENT IS SAVED ON THIS BROWSER</span><span>14 SYMBOL OPTIONS</span></div></div>
 <aside className="inspector frame" id="project-inspector">{project?<><ModelViewer scene={scenes[model]} model={model} paused={paused} rotate id="item-view" label="Selected project symbol" containerClass="model"/>
 <div id="project-summary"><span className="label">{project.category} / {project.status}</span><h2>{project.title}</h2><p>{project.summary}</p>{project.sample&&<span className="chip">DEMO PROJECT</span>}{project.photos[0]&&safeImage(project.photos[0].src)&&<button className="project-cover" aria-label={'Open '+project.title} onClick={()=>setModal(project)}><img src={safeImage(project.photos[0].src)} alt={project.photos[0].alt||project.title}/><span>{project.photos.length} IMAGES · VIEW CASE STUDY ↗</span></button>}<button className="btn" onClick={()=>setModal(project)}>Open project →</button></div></>:<EmptyState title="Your first build awaits."/>}</aside></div>
 {modal&&<ProjectModal project={modal} close={()=>setModal(null)}/>}</section>;
}
