import {useMemo,useRef,useState} from 'react';
import type {PortfolioContent} from '../../types/content';
import type {Scene} from '../../components/three/renderer.js';
import {ModelViewer} from '../../components/three/ModelViewer';
import {Notice} from '../../components/ui/Notice';
import {configureWorkshop,itemById,recipes} from '../../domain/crafting-data.js';
import {validateConfig,workshopFingerprint} from '../../domain/workshop-storage';
import {SkillLoadout} from './SkillLoadout';
import {ItemIcon} from './ItemIcon';
import {WorkshopDialog} from './WorkshopDialog';
import {useWorkshop} from './useWorkshop';
interface Props {content:PortfolioContent;scenes:Record<string,Scene>;paused:boolean;notify:(message:string)=>void}
export function SkillsPage(props:Props) {
 const config=useMemo(()=>{try{validateConfig(props.content.recipes,props.content.startingInventory);configureWorkshop(props.content.recipes,props.content.startingInventory);return {fingerprint:workshopFingerprint(props.content.recipes,props.content.startingInventory)};}catch(error){return {error:(error as Error).message};}},[props.content.recipes,props.content.startingInventory]);
 return config.error?<Notice error>{'Workshop configuration unavailable: '+config.error}</Notice>:<SkillsContent key={config.fingerprint} {...props} fingerprint={config.fingerprint!}/>;
}
function SkillsContent({content,scenes,paused,notify,fingerprint}:Props&{fingerprint:string}) {
 const [open,setOpen]=useState(false),dialog=useRef<HTMLDialogElement>(null);
 const workshop=useWorkshop(fingerprint,paused,dialog,notify),actual=content.actualSkills.filter(s=>!s.sample);
 const close=()=>{workshop.refund();setOpen(false);};
 const jump=()=>{if(open)close();document.getElementById('skill-loadout')?.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});};
 return <><section className="atelier-page"><div className="atelier-head"><div><span className="eyebrow">03 / THE LEARNING WORKSHOP</span><h1>Every skill starts<br/>with a few ingredients.</h1></div><p>Explore the tools I bring to a project, then step up to the workbench and discover how ideas build on each other.</p></div>
 <div className="atelier-scene"><aside className="atelier-placard"><span className="eyebrow">THE PORTFOLIO</span><h2>Skills on display.</h2><p>{actual.length?'My skills are displayed below, ready to explore. No crafting required.':'The skill display below is ready for your real skills. Example entries are clearly marked until you replace them.'}</p><a className="btn secondary" href="#skill-loadout" id="jump-skills" onClick={e=>{e.preventDefault();jump();}}>View skill loadout ↓</a><div className="placard-rule"/><span className="atelier-counter">{actual.length?String(actual.length).padStart(2,'0'):'—'}<small>{actual.length?'PORTFOLIO SKILLS':'AWAITING YOUR SKILL LIST'}</small></span></aside>
 <div className="table-island"><span className="stage-label">THE WORKBENCH / DRAG TO TURN</span><div className="table-glow"/><ModelViewer scene={scenes.crafting_table} model="crafting_table" paused={paused} id="workshop-table" label="Interactive crafting table"/><button className="btn use-workbench" id="open-workbench" onClick={()=>{workshop.setMessage('Choose ingredients from your inventory, or follow a recipe.');setOpen(true);}}><span>▦</span> Use crafting table <span>↗</span></button><span className="table-caption">A hands-on recipe playground</span></div>
 <aside className="atelier-notes"><span className="eyebrow">THE VISITOR’S JOURNEY</span><h3>A blank page.<br/>A bright idea.</h3><div className="ingredient-parade">{['book','dye_cyan','pearl'].map(id=><span key={id}><ItemIcon id={id}/><small>{itemById[id].name}</small></span>)}</div><p>One book. One color. One special ingredient. Discover each skill’s unique artifact.</p><div className="discovery-mini" id="discovery-mini"><span>{String(workshop.game.learned.filter(id=>itemById[id].kind==='Skill').length).padStart(2,'0')+' / '+String(new Set(recipes.map(r=>r.output)).size).padStart(2,'0')}</span><small>SKILL RECIPES DISCOVERED<br/>IN YOUR PLAYGROUND</small></div><span className="play-label">PLAY PROGRESS ≠ PORTFOLIO SKILLS</span></aside></div>
 <SkillLoadout content={content}/></section>
 {open&&<WorkshopDialog dialog={dialog} workshop={workshop} name={content.settings.name} paused={paused} close={close} jump={jump}/>}</>;
}
