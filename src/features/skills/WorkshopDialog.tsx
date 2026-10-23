import {useEffect,useRef,useState,type RefObject,type DragEvent} from 'react';
import {itemById,recipes} from '../../domain/crafting-data.js';
import {inventoryStacks,matchRecipe,placeItem,returnItem,moveGrid,clearGrid} from '../../domain/crafting-engine.js';
import {useWorkshop} from './useWorkshop';
import {ItemIcon} from './ItemIcon';
import {RecipeBook} from './RecipeBook';
import {RecipeDetail} from './RecipeDetail';
type Drag={from:'bag';id:string}|{from:'grid';index:number};
export function WorkshopDialog({dialog,workshop:w,name,paused,close,jump}:{dialog:RefObject<HTMLDialogElement|null>;workshop:ReturnType<typeof useWorkshop>;name:string;paused:boolean;close:()=>void;jump:()=>void}) {
 const [selected,setSelected]=useState(recipes[0]?.id||''),[picked,setPicked]=useState<string|null>(null),[bookHidden,setBookHidden]=useState(false),[confirm,setConfirm]=useState(false);
 const drag=useRef<Drag|null>(null),[drop,setDrop]=useState<string|null>(null),[dragging,setDragging]=useState<string|null>(null);
 const cells=useRef<(HTMLButtonElement|null)[]>([]),game=w.game,stacks=inventoryStacks(game),match=matchRecipe(game.grid),locked=match?.requires.filter(id=>!game.learned.includes(id))||[];
 const chosen=picked&&game.bag[picked]>0?picked:null;
 useEffect(()=>{
  const node=dialog.current!,opener=document.activeElement as HTMLElement;node.showModal();document.body.classList.add('workshop-open');node.querySelector<HTMLButtonElement>('#close-workbench')?.focus();
  return()=>{node.close();document.body.classList.remove('workshop-open');if(opener?.isConnected)opener.focus({preventScroll:true});};
 },[]);
 function choose(id:string){if(w.busyRef.current)return;setSelected(id);setPicked(null);void w.autofill(id);}
 function start(event:DragEvent,source:Drag,key:string){if(w.busyRef.current){event.preventDefault();return;}drag.current=source;setDragging(key);event.dataTransfer.setData('text/plain','jvd-workshop');event.dataTransfer.effectAllowed='move';}
 function end(){drag.current=null;setDrop(null);setDragging(null);}
 function put(event:DragEvent,index?:number){if(w.busyRef.current||!drag.current)return;event.preventDefault();event.stopPropagation();const source=drag.current;
  if(index!==undefined)w.update(source.from==='bag'?placeItem(w.current.current,source.id,index):moveGrid(w.current.current,source.index,index),'Ingredient placed. Match the pattern to reveal an output.');
  else if(source.from==='grid')w.update(returnItem(w.current.current,source.index),'Ingredient returned to inventory.');
  end();
 }
 return <dialog className={'craft-dialog'+(w.busy?' placing-ingredients':'')} id="craft-dialog" ref={dialog} aria-labelledby="craft-title" onKeyDown={e=>{if(e.key!=='Tab')return;const focusable=[...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href]')].filter(el=>el.getClientRects().length>0);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}} onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}}>
 <div className="craft-window-head"><div><span className="eyebrow">VISITOR PLAYGROUND / LOCAL PROGRESS</span><h2 id="craft-title">The crafting workshop.</h2></div><button className="craft-close" id="close-workbench" aria-label="Close crafting workshop" onClick={close}>×</button></div>
 <div className="craft-window-toolbar"><button className="filter" id="toggle-book" disabled={w.busy} aria-expanded={!bookHidden} onClick={()=>setBookHidden(!bookHidden)}>▤ Recipe book</button><span>Place one item per square. Crafting consumes the ingredients.</span><button className="text-button" id="reset-workshop" disabled={w.busy} onClick={()=>{if(confirm){w.restart();setPicked(null);setConfirm(false);}else{setConfirm(true);w.setMessage('Press Confirm restart to refill starting materials and clear only your play discoveries. Portfolio content is unaffected.');}}}>{confirm?'Confirm restart':'Restart playground'}</button></div>
 <div className={'craft-window-body'+(bookHidden?' book-hidden':'')}><RecipeBook game={game} selected={selected} choose={choose} busy={w.busy} hidden={bookHidden}/>
 <div className={'craft-work-area'+(w.success?' craft-success':'')}><div className="craft-station-head"><span className="label">CRAFTING / 3 × 3</span><button className="text-button" id="clear-craft-grid" disabled={w.busy} onClick={()=>{setPicked(null);w.update(clearGrid(w.current.current),'All ingredients returned. Inventory is unchanged overall.');}}>Return all ingredients ↙</button></div>
 <div className="craft-station"><div className="craft-nine" id="craft-nine" aria-label="Crafting grid">{game.grid.map((id,i)=><button key={i} ref={el=>{cells.current[i]=el;}} className={'craft-cell '+(id?'occupied':'')+(drop===String(i)?' drop-here':'')+(dragging===String(i)?' being-dragged':'')} data-craft-cell={i} draggable={Boolean(id)&&!w.busy} aria-label={'Crafting square '+(Math.floor(i/3)+1)+', '+(i%3+1)+(id?', '+itemById[id].name:', empty')}
 onClick={()=>{if(w.busyRef.current)return;if(chosen)w.update(placeItem(w.current.current,chosen,i),'Placed one '+itemById[chosen].name+'.');else if(id)w.update(returnItem(w.current.current,i),'Ingredient returned to inventory.');cells.current[i]?.focus({preventScroll:true});}}
 onContextMenu={e=>{e.preventDefault();w.update(returnItem(w.current.current,i),'Ingredient returned.');}}
 onKeyDown={e=>{if(w.busyRef.current)return;const offsets:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-3,ArrowDown:3};if(e.key in offsets){e.preventDefault();cells.current[Math.max(0,Math.min(8,i+offsets[e.key]))]?.focus();}if(['Delete','Backspace'].includes(e.key)){e.preventDefault();w.update(returnItem(w.current.current,i),'Ingredient returned.');}}}
 onDragStart={e=>{if(id)start(e,{from:'grid',index:i},String(i));else e.preventDefault();}} onDragEnd={end}
 onDragOver={e=>{if(drag.current&&!w.busy){e.preventDefault();e.stopPropagation();setDrop(String(i));}}} onDrop={e=>put(e,i)}>
 {id?<span style={{display:'contents',visibility:w.busy&&!paused?'hidden':undefined}}><ItemIcon id={id}/></span>:<small>{i+1}</small>}</button>)}</div><span className="craft-arrow" aria-hidden="true">→</span>
 <div className="craft-result" id="craft-result">{match?<><button id="take-output" disabled={w.busy||locked.length>0} className="output-item" aria-label={'Craft '+itemById[match.output].name} onClick={w.collect}><ItemIcon id={match.output} model={match.resultModel||itemById[match.output].model}/><span>{match.amount}</span></button><strong>{itemById[match.output].name}</strong><small>{locked.length?'PREREQUISITES NEEDED':'CLICK TO CRAFT'}</small></>:<><div className="output-item empty-output">?</div><strong>Result</strong><small>MATCH A RECIPE</small></>}</div></div>
 <p className="craft-feedback" id="craft-feedback" role="status" aria-live="polite">{w.message}</p>
 <div className={'player-inventory'+(drop==='bag'?' drop-here':'')} onDragOver={e=>{if(drag.current&&!w.busy){e.preventDefault();setDrop('bag');}}} onDrop={e=>put(e)}><div className="player-inventory-head"><h3>Player inventory</h3><span id="picked-item">{chosen?itemById[chosen].name.toUpperCase()+' SELECTED · TAP A SQUARE':'SELECT AN INGREDIENT'}</span></div>
 <div className="player-slots" id="player-slots" aria-label="Your crafting ingredients">{stacks.map(x=><button key={x.key} className={'craft-cell inventory-cell '+(chosen===x.id?'chosen':'')+(dragging===x.key?' being-dragged':'')} data-ingredient={x.id} draggable={!w.busy} aria-pressed={chosen===x.id} aria-label={itemById[x.id].name+', '+x.count+' available'} title={itemById[x.id].name+' × '+x.count}
 onClick={()=>{if(w.busyRef.current)return;const next=chosen===x.id?null:x.id;setPicked(next);w.setMessage(next?itemById[next].name+' selected. Choose a crafting square.':'Selection cleared. Click a filled crafting square to return its ingredient.');}}
 onDragStart={e=>start(e,{from:'bag',id:x.id},x.key)} onDragEnd={end}><ItemIcon id={x.id}/><span className="stack-count">{x.count}</span></button>)}{Array.from({length:Math.max(0,18-stacks.length)},(_,i)=><div key={i} className="craft-cell inventory-empty" aria-hidden="true"/>)}</div>
 <p>Drag to the grid, or select an ingredient and tap a square. Click a filled square with nothing selected to return it.</p></div>
 <RecipeDetail selected={selected} game={game} choose={choose} busy={w.busy}/>
 <div className="discovered-strip"><span>YOUR DISCOVERIES</span><div id="discovered-items">{game.learned.length?game.learned.map(id=><button key={id} data-recipe={recipes.find(r=>r.output===id)?.id||''} title={itemById[id].name} aria-label={'View discovered '+itemById[id].name+' recipe'} disabled={w.busy} onClick={()=>choose(recipes.find(r=>r.output===id)?.id||'')}><ItemIcon id={id}/><span>{itemById[id].name}</span></button>):<p>Nothing discovered yet. Start with HTML: a book, orange dye, and an oak plank.</p>}</div></div>
 </div></div><div className="craft-window-footer"><span>{'This is your play inventory. '+name+'’s actual skills are listed in the Skill Loadout.'}</span><button className="text-button" id="close-to-skills" onClick={jump}>View skill loadout ↗</button></div></dialog>;
}
