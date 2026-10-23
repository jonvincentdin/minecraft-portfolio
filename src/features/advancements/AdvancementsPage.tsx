import {Fragment,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type PointerEvent} from 'react';
import type {Advancement,PortfolioContent} from '../../types/content';
import {SectionHeading,EmptyState} from '../../components/ui/SectionHeading';
import {Notice} from '../../components/ui/Notice';
import {createPathAnimator,treeLine,type PathAnimator} from '../../domain/tree-paths.js';
import {initialSelection,treeProblem,type TreeName} from '../../domain/advancement-trees';
import {safeUrl} from '../../lib/urls';

const HOME={x:30,y:25};
const thumb=(symbol:string)=>'/assets/thumbs/item_'+symbol+'.png';
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

export function AdvancementsPage({content,paused}:{content:PortfolioContent;paused:boolean}) {
 const [tree,setTree]=useState<TreeName>('achievements');
 const [selected,setSelected]=useState<string|undefined>(()=>content.achievements[0]?.id);
 const [zoom,setZoom]=useState(1),[list,setList]=useState(false);
 // Each selection rewrites the inspector so its CSS entrance replays, as the reference's innerHTML did.
 const [revision,setRevision]=useState(0);
 const world=useRef<HTMLDivElement>(null),pan=useRef(HOME),drag=useRef<{x:number;y:number;px:number;py:number}|null>(null);
 const animator=useRef<PathAnimator|null>(null),pausedRef=useRef(paused),selectedRef=useRef<string|undefined>(selected);
 pausedRef.current=paused;selectedRef.current=selected;
 const problem=useMemo(()=>treeProblem(content[tree]),[content,tree]);
 const nodes=useMemo(()=>problem?[]:content[tree],[problem,content,tree]),cert=tree==='certifications';
 const record=nodes.find(node=>node.id===selected);

 const place=(scale=zoom)=>{const w=world.current;if(w&&!list)w.style.transform=`translate(${pan.current.x}px,${pan.current.y}px) scale(${scale})`;};
 const choose=(id:string|undefined)=>{selectedRef.current=id;setSelected(id);setRevision(value=>value+1);animator.current?.select(id!);};

 // Redraw: a fresh animator per drawn tree, then light the current selection, before paint.
 useLayoutEffect(()=>{
  const w=world.current;if(!w)return;
  if(list){w.style.transform='none';return;}
  place();
  const instance=createPathAnimator(w,nodes,()=>pausedRef.current);animator.current=instance;
  void instance.select(selectedRef.current!);
  return()=>{instance.destroy();if(animator.current===instance)animator.current=null;};
 },[nodes,list]);
 // The animator owns path-lit and dash offsets, so the active class is toggled directly rather than through className.
 useLayoutEffect(()=>{world.current?.querySelectorAll<HTMLElement>('[data-node]').forEach(b=>b.classList.toggle('active',b.dataset.node===selected));},[selected,nodes,list]);
 // Pausing mid-route settles the glow on the current selection instead of finishing the sequence.
 useLayoutEffect(()=>{if(paused)void animator.current?.select(selectedRef.current!);},[paused]);

 const switchTree=(next:TreeName)=>{pan.current=HOME;setZoom(1);setTree(next);selectedRef.current=content[next][0]?.id;setSelected(selectedRef.current);setRevision(value=>value+1);};
 const toggleList=()=>{const keep=initialSelection(nodes,selected);selectedRef.current=keep;setSelected(keep);setList(value=>!value);setRevision(value=>value+1);};
 const step=(delta:number)=>{if(list)return;const next=clamp(zoom+delta,.5,1.8);setZoom(next);place(next);};
 const reset=()=>{setZoom(1);pan.current=HOME;place(1);};
 const down=(e:PointerEvent<HTMLDivElement>)=>{if(list||(e.target as Element).closest('button'))return;drag.current={x:e.clientX,y:e.clientY,px:pan.current.x,py:pan.current.y};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add('panning');};
 const move=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d)return;pan.current={x:clamp(d.px+e.clientX-d.x,-850,450),y:clamp(d.py+e.clientY-d.y,-450,350)};place();};
 const up=(e:PointerEvent<HTMLDivElement>)=>{drag.current=null;e.currentTarget.classList.remove('panning');};

 return <section className="advancement-page"><SectionHeading label="05 / ADVANCEMENTS" title="Collected along the way." description="Two distinct trees: the things you have achieved, and the credentials that support your skills."/>
 <div className="adv-toolbar"><div className="tree-tabs"><button data-tree="achievements" aria-pressed={tree==='achievements'} onClick={()=>switchTree('achievements')}>✦ Achievements <span>{content.achievements.length}</span></button><button data-tree="certifications" aria-pressed={cert} onClick={()=>switchTree('certifications')}>▤ Certifications <span>{content.certifications.length}</span></button></div>
 <div className="map-controls"><button data-zoom="-" aria-label="Zoom out" onClick={()=>step(-.15)}>−</button><span id="zoom-label">{Math.round(zoom*100)+'%'}</span><button data-zoom="+" aria-label="Zoom in" onClick={()=>step(.15)}>+</button><button data-map-reset="" onClick={reset}>Center map</button><button data-list="" aria-pressed={list} onClick={toggleList}>{list?'Map view':'List view'}</button></div></div>
 {problem&&<Notice error>{(cert?'Certification':'Achievement')+' tree unavailable: '+problem}</Notice>}
 <div className="adv-explorer"><div className={'map-viewport'+(list?' list-mode':'')} id="map-viewport" aria-label="Interactive advancement tree" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}><div className="map-coordinate">DRAG THE MAP TO EXPLORE · SELECT A NODE</div>
 <div className="map-world" id="map-world" ref={world} key={tree+(list?':list':':map')}>{list?(nodes.length?nodes.map(x=><button key={x.id} className="node-list-item" data-node={x.id} aria-pressed={x.id===selected} onClick={()=>choose(x.id)}><img src={thumb(x.symbol)} alt=""/><span><strong>{x.title}</strong><small>{x.issuer||'Portfolio entry'}</small></span>↗</button>):<EmptyState title="No records yet."/>):<TreeMap nodes={nodes} cert={cert} selected={selected} choose={choose}/>}</div></div>
 <aside className="adv-inspector frame" id="adv-inspector" aria-live="polite" key={revision}>{record?<Inspector record={record} cert={cert}/>:<EmptyState title="A new chapter awaits."/>}</aside></div>
 <div className="adv-legend"><span><i></i> Selectable milestone</span><span><i className="cert"></i> Separate credential tree</span><span>Sample nodes stay labeled until replaced.</span></div></section>;
}

function TreeMap({nodes,cert,selected,choose}:{nodes:readonly Advancement[];cert:boolean;selected?:string;choose:(id:string)=>void}) {
 const byId=new Map(nodes.map(node=>[node.id,node]));
 return <><svg className="tree-lines" viewBox="0 0 1000 1000" aria-hidden="true"><g>{nodes.map(x=>{const p=byId.get(x.parent);if(!p)return null;const d=treeLine(p,x);return <Fragment key={x.id}><path d={d}/><path className="glow-edge" data-glow-edge={x.id} pathLength={1} d={d}/></Fragment>;})}</g></svg>
 {nodes.map((x,i)=><button key={x.id} className={'tree-node '+(cert?'cert-node':'')} data-node={x.id} style={{left:Number(x.x)+'px',top:Number(x.y)+'px','--delay':i*70+'ms'} as CSSProperties} aria-label={x.title} aria-pressed={x.id===selected} onClick={()=>choose(x.id)}><span className="node-frame"><img src={thumb(x.symbol)} alt=""/></span><strong>{x.title}</strong><small>{x.sample?'SAMPLE':x.date||'VIEW DETAILS'}</small></button>)}</>;
}

function Inspector({record:x,cert}:{record:Advancement;cert:boolean}) {
 const evidence=safeUrl(x.evidence);
 return <><span className="eyebrow">{cert?'CREDENTIAL RECORD':'MILESTONE RECORD'}</span><img className="achievement-symbol" src={thumb(x.symbol)} alt=""/><h2>{x.title}</h2><span className="chip">{x.sample?'SAMPLE ENTRY':'PORTFOLIO ENTRY'}</span><p>{x.description}</p>
 <dl><dt>DATE</dt><dd>{x.date||'Not provided'}</dd><dt>{cert?'ISSUER':'CONTEXT'}</dt><dd>{x.issuer||'Not provided'}</dd></dl>
 {evidence?<a className="btn" href={evidence} target="_blank" rel="noopener">{(cert?'Verify credential':'View evidence')+' ↗'}</a>:<p className="help">Add an evidence or verification link in the editor.</p>}</>;
}
