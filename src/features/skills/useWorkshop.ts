import {useEffect,useRef,useState,type RefObject} from 'react';
import {flushSync} from 'react-dom';
import {itemById,recipeById} from '../../domain/crafting-data.js';
import {clearGrid,loadRecipe,recipeStatus,takeOutput,freshWorkshop,type WorkshopState} from '../../domain/crafting-engine.js';
import {restoreWorkshop,workshopStorageKey} from '../../domain/workshop-storage';
export function useWorkshop(fingerprint:string,paused:boolean,dialog:RefObject<HTMLDialogElement|null>,notify:(message:string)=>void) {
 const [game,setGame]=useState(()=>{let raw=null;try{raw=localStorage.getItem(workshopStorageKey);}catch{}return restoreWorkshop(raw,fingerprint);});
 const current=useRef(game),alive=useRef(true),busyRef=useRef(false),epoch=useRef(0);
 const flights=useRef(new Set<{animation:Animation;ghost:HTMLImageElement}>()),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const [busy,setBusy]=useState(false),[success,setSuccess]=useState(false),[message,setMessage]=useState('Choose ingredients from your inventory, or follow a recipe.');
 function persist(next:WorkshopState){try{localStorage.setItem(workshopStorageKey,JSON.stringify({config:fingerprint,state:next}));}catch{if(alive.current)notify('Play progress is available for this visit only; browser storage is unavailable.');}}
 function commit(next:WorkshopState){current.current=next;persist(next);if(alive.current)setGame(next);}
 function cancelFlights(){for(const {animation,ghost} of flights.current){animation.cancel();ghost.remove();}flights.current.clear();}
 function refund(render=true){epoch.current++;cancelFlights();busyRef.current=false;const next=clearGrid(current.current);current.current=next;persist(next);if(render&&alive.current){setGame(next);setBusy(false);setMessage('All unfinished ingredients returned to your inventory.');}}
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;refund(false);clearTimeout(timer.current);};},[fingerprint]);
 useEffect(()=>{if(paused)cancelFlights();},[paused]);
 function update(next:WorkshopState,text:string){if(busyRef.current)return;if(next===current.current){setMessage('That move is unavailable. Check your inventory and selected ingredient.');return;}commit(next);setMessage(text);}
 async function autofill(id:string) {
  if(busyRef.current)return;
  const recipe=recipeById[id];if(!recipe)return;
  const next=loadRecipe(current.current,id);
  if(next===current.current){const s=recipeStatus(current.current,recipe);setMessage(s.missingSkills.length?'Craft '+s.missingSkills.map(id=>itemById[id].name).join(', ')+' first.':'Not enough ingredients: '+s.missing.map(x=>x.count+' '+itemById[x.id].name).join(', '));return;}
  const node=dialog.current;if(!node?.open)return;
  busyRef.current=true;const run=++epoch.current;
  // Render the refund before reading inventory geometry; each ghost represents one unit.
  flushSync(()=>{commit(clearGrid(current.current));setBusy(true);});
  node.querySelector('.craft-work-area')!.scrollTop=0;
  const moves=next.grid.flatMap((item,index)=>item?[{item,index,from:node.querySelector('[data-ingredient="'+item+'"]')?.getBoundingClientRect(),to:node.querySelector('[data-craft-cell="'+index+'"]')!.getBoundingClientRect()}]:[]);
  flushSync(()=>{commit(next);setMessage('Moving exactly the required quantities…');});
  const bounds=node.getBoundingClientRect();
  try {
   if(!paused)await Promise.all(moves.map(async(move,i)=>{
    if(!move.from)return;
    const ghost=document.createElement('img');ghost.src='/assets/thumbs/'+itemById[move.item].model+'.png';ghost.className='ingredient-flight';ghost.alt='';ghost.dataset.item=move.item;ghost.dataset.quantity='1';ghost.style.left=(move.from.left-bounds.left)+'px';ghost.style.top=(move.from.top-bounds.top)+'px';node.append(ghost);
    const animation=ghost.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+(move.to.left-move.from.left)+'px,'+(move.to.top-move.from.top)+'px) scale(1.12)',opacity:1}],{duration:420,delay:i*90,easing:'cubic-bezier(.22,.8,.3,1)',fill:'both'});
    const entry={animation,ghost};flights.current.add(entry);
    try{await animation.finished;}catch{/* Cancellation settles below or is invalidated by close. */}finally{ghost.remove();flights.current.delete(entry);}
   }));
  } finally {
   if(alive.current&&run===epoch.current){busyRef.current=false;setBusy(false);setMessage('Ingredients placed. Click the result to craft '+itemById[recipe.output].name+'.');}
  }
 }
 function collect(){
  if(busyRef.current)return;const result=takeOutput(current.current);
  if(!result.recipe){setMessage('This recipe is not ready. Check the pattern, ingredients, and prerequisites.');return;}
  commit(result.state);setMessage('Crafted '+result.recipe.amount+' × '+itemById[result.recipe.output].name+'. Added to your play inventory.');
  clearTimeout(timer.current);setSuccess(true);timer.current=setTimeout(()=>setSuccess(false),paused?0:800);
  notify(itemById[result.recipe.output].name+' crafted — added to your play inventory.');
 }
 function restart(){if(busyRef.current)return;commit(freshWorkshop());setMessage('Playground restarted. Fresh materials are ready.');}
 return {game,current,busy,busyRef,success,message,setMessage,update,autofill,collect,refund,restart};
}
