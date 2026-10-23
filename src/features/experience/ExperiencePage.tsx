import { useState } from 'react';
import type { PortfolioContent, Experience } from '../../types/content';
import type { Scene } from '../../components/three/renderer.js';
import { ModelViewer } from '../../components/three/ModelViewer';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { safeUrl } from '../../lib/urls';
function Entries({entries}:{entries:Experience[]}) {
 return <ol className="timeline">{entries.length?entries.map(item=><li key={item.id}><span className="meta">{item.organization} {[item.start,item.end].filter(Boolean).join(' — ')}</span><h3>{item.title}</h3><p>{item.description}</p><p>{item.contribution}</p>{item.sample&&<span className="help">EXPERIENCE TEMPLATE</span>}{safeUrl(item.evidence)&&<a className="text-button" href={safeUrl(item.evidence)} target="_blank" rel="noopener noreferrer">View evidence ↗</a>}</li>):<li>No experience entries yet.</li>}</ol>;
}
export function ExperiencePage({content,scenes,paused}:{content:PortfolioContent;scenes:Record<string,Scene>;paused:boolean}) {
 const [selected,setSelected]=useState(content.characters[0]?.id),[compared,setCompared]=useState<string[]>([]);
 const character=content.characters.find(item=>item.id===selected)||content.characters[0];
 if(!character)return <section><h1>No experience chapters yet.</h1></section>;
 const model='character_'+character.id;
 return <section><SectionHeading label="04 / CHARACTER SELECT" title="One player. Many chapters." description="A change of outfit, a different part of the journey. Choose a character, or compare several chapters."/>
 <div className="experience-layout"><aside className="role-index">{content.characters.map((item,i)=><button key={item.id} data-role={item.id} className={item.id===selected?'active':''} aria-pressed={item.id===selected} onClick={()=>setSelected(item.id)}><span>0{i+1}</span><span>{item.name}<small>{item.label}</small></span></button>)}</aside>
 <ModelViewer scene={scenes[model]} model={model} paused={paused} character stage id="character-view" label="Selected experience character"/>
 <article className="experience-detail" id="role-detail" aria-live="polite"><span className="chip">{character.name.toUpperCase()}</span><h2>{character.label}</h2><p>{character.intro}</p><Entries entries={content.experience.filter(item=>item.character===character.id)}/></article></div>
 <div className="roster">{content.characters.map(item=><div key={item.id} data-card={item.id} className={'role-card'+(item.id===selected?' active':'')}><button className={'role-select'+(item.id===selected?' active':'')} data-role={item.id} aria-pressed={item.id===selected} onClick={()=>setSelected(item.id)}><img src={'/assets/thumbs/character_'+item.id+'.png'} alt={item.name+' outfit'}/><span><strong>{item.name}</strong><small>{item.label}</small></span></button><label className="compare-check"><input type="checkbox" checked={compared.includes(item.id)} onChange={event=>setCompared(ids=>event.target.checked?[...ids,item.id]:ids.filter(id=>id!==item.id))}/> Compare chapter</label></div>)}</div>
 <div className={'compare-panel frame'+(compared.length?' visible':'')} id="role-comparison"><span className="label">COMPARE CHAPTERS</span><div className="compare-grid">{content.characters.filter(item=>compared.includes(item.id)).map(item=><article key={item.id}><h3>{item.label}</h3><Entries entries={content.experience.filter(entry=>entry.character===item.id)}/></article>)}</div></div></section>;
}
