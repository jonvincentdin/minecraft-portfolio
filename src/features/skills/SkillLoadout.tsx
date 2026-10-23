import {useState} from 'react';
import type {PortfolioContent} from '../../types/content';
import {itemById,resultModels} from '../../domain/crafting-data.js';
import {outputModel} from './ItemIcon';
import {projectSymbol} from '../../data/symbols';
import {safeUrl} from '../../lib/urls';
export function SkillLoadout({content}:{content:PortfolioContent}) {
 const [filter,setFilter]=useState('All');
 const entries=content.actualSkills.filter(s=>filter==='All'||s.category===filter);
 return <div className="skill-loadout" id="skill-loadout"><div className="loadout-heading"><div><span className="eyebrow">THE PORTFOLIO / ALWAYS VISIBLE</span><h2>My skill loadout.</h2><p>These entries describe my work. Your crafting progress never changes this display.</p></div><a className="text-button" href="#editor/skills">Manage portfolio skills ↗</a></div>
 <div className="toolbar skill-filters">{['All',...new Set(content.actualSkills.map(s=>s.category))].map(c=><button key={c} className="filter" data-skill-filter={c} aria-pressed={c===filter} onClick={()=>setFilter(c)}>{c}</button>)}</div>
 <div id="real-skills">{entries.length?<div className="loadout-grid">{entries.map((s,i)=>{
 const item=Object.hasOwn(itemById,s.recipeId)?itemById[s.recipeId]:undefined,project=content.projects.find(p=>p.id===s.projectId);
 const model=s.resultModel&&resultModels.some(([id])=>id===s.resultModel)?s.resultModel:item?outputModel(s.recipeId):'item_'+projectSymbol(s.symbol)[0];
 return <article key={s.id} className={'loadout-card '+(s.sample?'example-skill':'')}><span className="loadout-number">{'SLOT '+String(i+1).padStart(2,'0')}</span><div className="skill-item-frame"><img src={'/assets/thumbs/'+model+'.png'} alt="" loading="lazy"/></div><div className="skill-card-copy"><span className="skill-category">{s.category}</span><h3>{s.title}</h3><span className="skill-status">{s.sample?'EXAMPLE · REPLACE WITH YOUR SKILL':s.level}</span><p>{s.description}</p><div className="skill-proof">{project?<button className="text-button" onClick={()=>{location.hash='projects/'+project.id;}}>{'See '+project.title+' ↗'}</button>:safeUrl(s.evidence)?<a href={safeUrl(s.evidence)} target="_blank" rel="noopener noreferrer">View evidence ↗</a>:<span>{s.sample?'Editable in World Editor':'Portfolio skill · owner supplied'}</span>}</div></div></article>;
 })}</div>:<div className="empty-state"><h3>Your tools deserve a place here.</h3><p>Add your actual skills, experience level, and project evidence in the editor.</p><a className="btn secondary" href="#editor/skills">Add portfolio skills</a></div>}</div></div>;
}
