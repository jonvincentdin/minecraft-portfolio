import {mountSectionMotion,pixelBurst} from './motion.js';
import {VoxelView} from './renderer.js';
import {data,init} from './state.js';
import {mountPublic} from './public.js';
import {mountEditor} from './editor.js';
const $=s=>document.querySelector(s),main=$('#main'),dialog=$('#detail'),body=$('#detail-body');
const sections=[['home','Spawn'],['about','About'],['projects','Inventory'],['skills','Crafting'],['experience','Experience'],['achievements','Advancements'],['contact','Message']];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let models={},views=[],controller,cleanup,modalHandler,toastTimer,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,ready=false,introTimer,entering=false;const entryAnimations=new Set();const active={};let sectionMotionCleanup,routeAnimation,routeSequence=0;
function notify(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),5500)}
function closeModal(){dialog.close();modalHandler=null}
function modal(html,handler){body.innerHTML=html;modalHandler=handler;if(!dialog.open)dialog.showModal()}
dialog.addEventListener('click',e=>{if(e.target.closest('[data-close],.dialog-close'))closeModal();else if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal()}else modalHandler?.(e,body)});dialog.addEventListener('close',()=>modalHandler=null);
function view(sel,key,options={}){const canvas=main.querySelector(sel);if(!canvas)return null;let v;try{if(models[key])v=new VoxelView(canvas,models[key],{...options,paused:()=>paused});if(v?.gl){views.push(v);return v}}catch(error){console.warn('Model fallback:',key,error.message)}v?.destroy();const fallback=document.createElement('img');fallback.className='model-fallback';fallback.alt=canvas.getAttribute('aria-label')||key;fallback.src=key==='home_landscape'?'assets/thumbs/crafting_table.png':`assets/thumbs/${key}.png`;canvas.replaceWith(fallback);return null}
function render(){if(!ready)return;sectionMotionCleanup?.();cleanup?.();controller?.abort();views.forEach(v=>{if(v.alive)v.destroy()});views=[];closeModal();controller=new AbortController();let route=location.hash.slice(1)||'home';if(!route.startsWith('editor')&&!sections.some(x=>x[0]===route))route='home';const editing=route.startsWith('editor');document.body.classList.toggle('editing',editing);$('#main-nav').innerHTML=sections.map(([id,label])=>`<a href="#${id}" ${route===id?'aria-current="page"':''}>${label}</a>`).join('');$('#site-name').textContent=data.settings.name;$('#footer-name').textContent=data.settings.name;document.title=`${editing?'World Editor':sections.find(x=>x[0]===route)?.[1]} — ${data.settings.name}`;const ctx={route,models,active,esc,listen:(target,type,handler,options={})=>target?.addEventListener(type,handler,{...options,signal:controller.signal}),notify,view,modal,closeModal,paused:()=>paused,replay:()=>intro(true),rerender:render};cleanup=(editing?mountEditor:mountPublic)(main,ctx);if(!editing&&!document.body.classList.contains('intro-open'))sectionMotionCleanup=mountSectionMotion(main,()=>paused);window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true})}
async function navigate(){
 const sequence=++routeSequence;routeAnimation?.cancel();
 if(!ready)return;
 if(paused||document.body.classList.contains('intro-open')||document.body.classList.contains('editing')||location.hash.startsWith('#editor')){render();return}
 sectionMotionCleanup?.();
 routeAnimation=main.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:140,easing:'ease-in',fill:'forwards'});
 try{await routeAnimation.finished}catch{}if(sequence!==routeSequence)return;
 render();routeAnimation.cancel();routeAnimation=null;
}
window.addEventListener('hashchange',navigate);
document.addEventListener('click',event=>{const button=event.target.closest('.btn');if(button&&!paused&&!document.body.classList.contains('editing')&&!document.body.classList.contains('intro-open'))pixelBurst(button,event)});
$('#back-top').onclick=()=>{if(location.hash==='#home')window.scrollTo({top:0,behavior:paused?'instant':'smooth'});else location.hash='home'};
function updateMotion(){document.body.classList.toggle('paused',paused);$('#motion').setAttribute('aria-pressed',paused);$('#motion').innerHTML=paused?'▷ <span>Resume motion</span>':'Ⅱ <span>Pause motion</span>';if(paused){sectionMotionCleanup?.();routeAnimation?.finish()}views.forEach(v=>v.draw())}$('#motion').onclick=()=>{paused=!paused;updateMotion()};updateMotion();
function finishEntry(){const loader=$('#loader');loader.classList.add('done');loader.classList.remove('intro-exiting');loader.querySelector('.intro-shutters')?.remove();loader.inert=true;loader.setAttribute('aria-hidden','true');$('#site-header').inert=false;main.inert=false;$('#site-footer').inert=false;document.body.classList.remove('intro-open','world-entering');for(const a of entryAnimations)a.cancel();entryAnimations.clear();entering=false;main.focus({preventScroll:true})}
function shuffled(items){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
async function dismissIntro(){
 if(entering||!ready)return;entering=true;clearTimeout(introTimer);const loader=$('#loader');$('#skip-intro').disabled=true;
 // Stage Spawn behind the intro before revealing it. Entry always lands at home.
 if(location.hash!=='#home')history.replaceState(null,'','#home');render();
 if(paused||matchMedia('(prefers-reduced-motion: reduce)').matches){finishEntry();return}
 const animate=(element,frames,timing)=>{const a=element.animate(frames,timing);entryAnimations.add(a);return a.finished.catch(()=>{})};
 const landscape=$('.cinema-landscape'),content=$('.cinema-content');
 // Freeze the opening camera/title poses before their individual pieces lift away.
 for(const group of [landscape,content]){group.style.transform=getComputedStyle(group).transform;group.style.animation='none'}
 const pieces=[...loader.querySelectorAll('.cinema-landscape > *, .cinema-content > *, .cinema-bottom > *')];
 const transforms=new Map(pieces.map(el=>[el,getComputedStyle(el).transform]));
 const shutters=document.createElement('div');shutters.className='intro-shutters';shutters.setAttribute('aria-hidden','true');
 for(let i=0;i<8;i++){const panel=document.createElement('span');panel.style.setProperty('--panel',i);shutters.append(panel)}loader.prepend(shutters);
 loader.classList.add('intro-exiting');document.body.classList.add('world-entering');
 const tasks=shuffled(pieces).map((el,i)=>{const base=transforms.get(el)==='none'?'':transforms.get(el);return animate(el,[{transform:base||'none',opacity:1},{transform:`translate3d(0,-115vh,0) ${base}`,opacity:.85}],{duration:650+(i%3)*60,delay:i*18,easing:'cubic-bezier(.64,0,.32,1)',fill:'forwards'})});
 // Uneven vertical strips expose the home screen in a different order each time.
 shuffled([...shutters.children]).forEach((panel,i)=>tasks.push(animate(panel,[{transform:'translateY(0)'},{transform:'translateY(-102%)'}],{duration:680,delay:320+i*46,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'})));
 for(const el of [$('#site-header'),...main.querySelectorAll('.hero-copy > *, .hero-world, .hotbar'),$('#site-footer')])tasks.push(animate(el,[{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,delay:560,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'}));
 await Promise.all(tasks);if(entering)finishEntry();
}

function intro(replay=false){entering=false;for(const a of entryAnimations)a.cancel();entryAnimations.clear();document.body.classList.remove('world-entering');$('#loader').classList.remove('intro-exiting');$('#loader .intro-shutters')?.remove();for(const el of document.querySelectorAll('#loader *')){el.getAnimations().forEach(a=>{if(a.effect?.getTiming().fill==='forwards')a.cancel()});el.style.removeProperty('animation');el.style.removeProperty('transform')}clearTimeout(introTimer);document.body.classList.add('intro-open');const loader=$('#loader');loader.classList.remove('done');loader.inert=false;loader.removeAttribute('aria-hidden');$('#site-header').inert=true;main.inert=true;$('#site-footer').inert=true;loader.classList.remove('intro-playing');void loader.offsetWidth;loader.classList.add('intro-playing');$('#intro-title').textContent=data.settings.introTitle;$('#skip-intro').disabled=!ready;$('#skip-intro').textContent=ready?'Enter world →':'Preparing world…';$('#skip-intro').focus({preventScroll:true});if(ready){$('#load-progress').value=100;$('#load-status').textContent='World ready. Your story starts here.';}}
$('#skip-intro').onclick=()=>{if(ready)dismissIntro()};
intro();
async function load(){const status=$('#load-status'),progress=$('#load-progress');const steps=[init().then(()=>{progress.value+=25;status.textContent='Reading your field notes…'}),fetch('assets/models/scene-data.json',{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error('Models unavailable');return r.json()}).then(x=>{models=x;progress.value+=50;status.textContent='Placing the last blocks…'}).catch(()=>notify('3D data could not load. Model thumbnails remain available.')),document.fonts.ready.then(()=>{progress.value+=25})];await Promise.allSettled(steps);ready=true;render();intro()}
load().catch(()=>{ready=true;render();intro();notify('Some content could not load. Refresh to try again.')});
