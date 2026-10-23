import {useState} from 'react';
import {recipes,itemById} from '../../domain/crafting-data.js';
import {recipeStatus,type WorkshopState} from '../../domain/crafting-engine.js';
import {ItemIcon} from './ItemIcon';
export function RecipeBook({game,selected,choose,busy,hidden}:{game:WorkshopState;selected:string;choose:(id:string)=>void;busy:boolean;hidden:boolean}) {
 const [filter,setFilter]=useState('All'),[query,setQuery]=useState('');
 const visible=recipes.filter(r=>(filter==='All'||(filter==='Ready'?recipeStatus(game,r).ready:!recipeStatus(game,r).ready))&&(r.title+' '+itemById[r.output].name).toLowerCase().includes(query.toLowerCase().trim()));
 return <aside className="recipe-book" id="recipe-book" hidden={hidden}><div className="recipe-book-heading"><span>{'FIELD GUIDE / '+recipes.length+' RECIPES'}</span><h3>A book of possibilities.</h3></div><label className="recipe-search"><span className="sr-only">Search recipes</span><input id="recipe-search" placeholder="Find a recipe…" value={query} disabled={busy} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="recipe-filters">{['All','Ready','Locked'].map(c=><button key={c} data-recipe-filter={c} disabled={busy} aria-pressed={c===filter} onClick={()=>setFilter(c)}>{c}</button>)}</div>
 <div className="recipe-list" id="recipe-list">{visible.length?visible.map(r=>{const status=recipeStatus(game,r),item=itemById[r.output];return <div key={r.id} className={'recipe-row '+(selected===r.id?'active':'')}><button className="recipe-pick" data-recipe={r.id} aria-pressed={selected===r.id} aria-label={'View '+item.name+' recipe'} disabled={busy} onClick={()=>choose(r.id)}><ItemIcon id={r.output} model={r.resultModel||item.model}/><span><strong>{r.title}</strong><small>{status.missingSkills.length?'PREREQUISITES NEEDED':status.ready?'READY TO CRAFT':'GATHER INGREDIENTS'}</small></span>{game.learned.includes(r.output)&&<b title="Discovered">✓</b>}</button><button className="quick-craft" data-quick-craft={r.id} aria-label={'Place ingredients for '+item.name} disabled={busy||!status.ready} onClick={()=>choose(r.id)}>Place</button></div>;}):<p className="recipe-empty">No matching recipes.</p>}</div>
 <p className="recipe-footnote">An illustrative learning pathway. Crafting is a discovery game, not a certification of knowledge.</p></aside>;
}
