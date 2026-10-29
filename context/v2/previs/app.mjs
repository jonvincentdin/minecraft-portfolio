import { VoxelView } from '../../../src/components/three/renderer.js';
import { createModels } from './model-sources.mjs';
const $=s=>document.querySelector(s),clamp=v=>Math.min(1,Math.max(0,v));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const [doc,canonical]=await Promise.all([fetch('../../v1/content-seed.json').then(r=>r.json()),fetch('../../../assets/models/scene-data.json').then(r=>r.json())]);
const models=createModels(),views=[],media=matchMedia('(prefers-reduced-motion: reduce)');let paused=media.matches,frame,opening=performance.now(),selected=0;
const featured=doc.projects.slice(0,3),art=i=>`../../../assets/demos/project-${i+1}-1.svg`;
$('#tagline').textContent=doc.settings.tagline;$('#bio').textContent=doc.settings.bio;
$('#journal').innerHTML=doc.journal.map(j=>`<details><summary>${escape(j.title)}</summary><p>${escape(j.body)}</p></details>`).join('');
$('#project-track').innerHTML=featured.map((p,i)=>`<article class="project" data-project="${i}" aria-labelledby="project-${i}"><div class="project-picture"><img src="${art(i)}" alt="Illustrative ${escape(p.title)} screen" width="1200" height="750"></div><div class="project-info"><p class="category">${escape(p.category)}</p><h3 id="project-${i}">${escape(p.title.split(' — ')[0])}</h3><p>${escape(p.summary)}</p><dl class="project-meta"><div><dt>Role</dt><dd>${escape(p.role||'Add your contribution')}</dd></div><div><dt>Stack</dt><dd>${escape(p.stack||'Add the tools used')}</dd></div></dl><button class="project-link" data-open="${escape(p.id)}">Explore the case study ↗</button><p class="sample">Sample project · illustrative artwork</p></div></article>`).join('');
$('#project-nav').innerHTML=featured.map((p,i)=>`<button data-jump="${i}" aria-label="Scroll to ${escape(p.title)}"></button>`).join('');
$('#project-count').textContent=`(${doc.projects.length})`;$('#all-projects').innerHTML=doc.projects.map(p=>`<button data-open="${escape(p.id)}">${escape(p.title)} ↗</button>`).join('');
$('#skill-list').innerHTML=doc.actualSkills.map(s=>`<div><h3>${escape(s.title)}</h3><p>${escape(s.description)}</p>${s.sample?'<p class="sample">Sample capability</p>':''}</div>`).join('');
$('#experience-list').innerHTML=doc.experience.slice(0,4).map(e=>`<article class="experience-row"><div class="date">${escape([e.start,e.end].filter(Boolean).join(' — ')||'Your timeline')}<div class="sample">${e.sample?'Sample entry':''}</div></div><div><h3>${escape(e.title)}</h3><p>${escape(e.organization)}</p></div><p>${escape(e.description)}</p></article>`).join('');
$('#achievement-grid').innerHTML=[['Achievements',doc.achievements],['Certifications',doc.certifications]].map(([label,list])=>`<div class="achievement-list"><h3>${label}</h3>${list.slice(0,3).map(n=>`<div><h3>${escape(n.title)}</h3><p>${escape(n.description)}</p></div>`).join('')}</div>`).join('');
function register(id,scene,yaw,elevation,screen=false){views.push({el:$(id),scene,yaw,elevation,screen,view:null,failed:false});}
register('#hero-scene',models['portfolio-studio'],.27,.25,true);register('#book-scene',models['builder-journal'],.48,.56);
const reactScene=canonical.skill_react||canonical.scenes?.skill_react;if(!reactScene)throw Error('Canonical React scene missing');
register('#react-scene',reactScene,.45,.42);register('#lamp-scene',models['workshop-lantern'],.48,.22);
function mount(entry){
  try{const v=new VoxelView(entry.el.querySelector('canvas'),entry.scene,{paused:()=>true});if(!v.gl)throw Error('WebGL unavailable');entry.view=v;}
  catch{entry.failed=true;entry.el.dataset.fallback='true';if(!entry.el.querySelector('img')){const img=new Image();img.src=entry.el.id==='react-scene'?'../../../assets/thumbs/skill_react.png':'../../../assets/thumbs/item_lantern.png';img.alt='Static fallback; concept model unavailable';entry.el.append(img);}}
}
function projectScreen(entry){
  const {view:v,scene,el}=entry,im=el.querySelector('.projected');if(!im||!scene.screen)return;
  const w=el.clientWidth,h=el.clientHeight,e=v.elevation,a=v.angle,c=Math.cos,s=Math.sin;
  const right=[c(a),0,-s(a)],up=[-s(e)*s(a),c(e),-s(e)*c(a)],ex=v.extent;
  const scale=Math.min(w/(Math.hypot(ex[0],ex[2])+.55),h/(ex[1]+ex[2]*s(Math.max(e,0))+.4))*.95;
  const pos=p=>{const q=p.map((x,k)=>x-v.center[k]);return[w/2+q.reduce((n,x,k)=>n+x*right[k],0)*scale,h/2-q.reduce((n,x,k)=>n+x*up[k],0)*scale];};
  const {center:[x,y,z],width:sw,height:sh}=scene.screen,tl=pos([x-sw/2,y+sh/2,z]),tr=pos([x+sw/2,y+sh/2,z]),bl=pos([x-sw/2,y-sh/2,z]);
  im.style.transform=`matrix(${(tr[0]-tl[0])/1200},${(tr[1]-tl[1])/1200},${(bl[0]-tl[0])/750},${(bl[1]-tl[1])/750},${tl[0]},${tl[1]})`;im.style.opacity='1';
}
function staticMode(){document.body.classList.toggle('is-static',paused);$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').textContent=paused?'Resume motion':'Pause motion';}
staticMode();$('#motion').onclick=()=>{paused=!paused;staticMode();update(performance.now());};media.addEventListener('change',e=>{paused=e.matches;staticMode();update(performance.now());});
const work=$('#work'),track=$('#project-track'),nav=[...document.querySelectorAll('[data-jump]')];
function update(now){
  const mobile=innerWidth<=760,range=Math.max(1,work.offsetHeight-innerHeight),progress=paused||mobile?0:clamp((scrollY-work.offsetTop)/range);
  track.style.transform=`translate3d(${-progress*(featured.length-1)*innerWidth}px,0,0)`;selected=Math.round(progress*(featured.length-1));
  const arrival=paused||mobile?1:clamp((scrollY-work.offsetTop+innerHeight*.75)/(innerHeight*.75));
  work.style.setProperty('--image-scale',String(.82+.18*arrival));work.style.setProperty('--frame-open',String(arrival));
  nav.forEach((b,i)=>i===selected?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current'));$('#work-position').textContent=featured[selected].title;
  $('.reading-progress i').style.transform=`scaleX(${clamp(scrollY/(document.documentElement.scrollHeight-innerHeight))})`;
  const links=[...document.querySelectorAll('nav a')];let active=links[0];for(const link of links)if($(link.hash).getBoundingClientRect().top<innerHeight*.4)active=link;links.forEach(a=>a===active?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  // Dispose offscreen contexts before mounting nearby scenes; no more than three.
  for(const entry of views){const rect=entry.el.getBoundingClientRect();entry.near=rect.bottom>-100&&rect.top<innerHeight+100;if(!entry.near&&entry.view){entry.view.destroy();entry.view=null;entry.el.querySelector('canvas').replaceWith(document.createElement('canvas'));}}
  for(const entry of views){if(!entry.near)continue;if(!entry.view&&!entry.failed&&views.filter(e=>e.view).length<3)mount(entry);if(!entry.view)continue;
    const rect=entry.el.getBoundingClientRect(),p=clamp((innerHeight-rect.top)/(innerHeight+rect.height)),intro=paused?1:clamp((now-opening)/1400);
    entry.view.angle=entry.view.target=entry.yaw+(paused?0:(p-.5)*.28-Math.pow(1-intro,3)*.12);entry.view.elevation=entry.elevation;entry.view.draw();if(entry.screen)projectScreen(entry);
  }
}
let dirty=true;addEventListener('scroll',()=>dirty=true,{passive:true});addEventListener('resize',()=>dirty=true);
function tick(now){if(dirty||now-opening<1600){update(now);dirty=false;}frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);
nav.forEach((b,i)=>b.onclick=()=>scrollTo({top:work.offsetTop+i/(featured.length-1)*(work.offsetHeight-innerHeight),behavior:paused?'instant':'smooth'}));
track.addEventListener('focusin',e=>{const panel=e.target.closest('[data-project]');if(panel&&!paused&&innerWidth>760){const i=+panel.dataset.project;scrollTo({top:work.offsetTop+i/(featured.length-1)*(work.offsetHeight-innerHeight),behavior:'instant'});update(performance.now());}});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const target=$(a.hash);if(target){target.tabIndex=-1;target.focus({preventScroll:true});}}));
const dialog=$('#details'),content=$('#detail-content');let previousFocus;
function openDialog(html){previousFocus=document.activeElement;content.innerHTML=html;dialog.showModal();}
dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>previousFocus?.focus({preventScroll:true}));
document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(!b)return;const p=doc.projects.find(p=>p.id===b.dataset.open);openDialog(`<h2>${escape(p.title)}</h2><p class="sample-note">Sample case study · illustrative content from v1</p>${p.photos[0]?`<img src="../../../${escape(p.photos[0].src.replace(/^\//,''))}" alt="${escape(p.photos[0].alt)}">`:''}${['overview','problem','solution','process','outcome'].map(k=>`<h3>${k[0].toUpperCase()+k.slice(1)}</h3><p>${escape(p[k])}</p>`).join('')}`);});
$('#editor-note').onclick=()=>openDialog('<h2>Your editor stays familiar.</h2><p>The production logo will open the separate editor page. This local concept does not connect to an account.</p><p>Existing content, draft saving, preview, publication, and media storage stay on the v1 database structure.</p>');
$('#contact-open').onclick=()=>{openDialog('<h2>Start a conversation.</h2><p>This concept demonstrates message review. It does not send email.</p><form id="message-form"><label>Your name<input name="name" autocomplete="name" required></label><label>Email<input type="email" name="email" autocomplete="email" required></label><label>Message<textarea name="message" required></textarea></label><button class="button">Review message</button></form>');$('#message-form').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target);content.innerHTML=`<h2>Message review</h2><p>From ${escape(data.get('name'))} · ${escape(data.get('email'))}</p><p style="white-space:pre-wrap">${escape(data.get('message'))}</p><p>Nothing has been sent. The production site will use the existing contact workflow.</p>`;};};
$('#replay').onclick=()=>{opening=performance.now();scrollTo({top:0,behavior:paused?'instant':'smooth'});};
await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));update(performance.now());
window.__previs={views,models,doc,update,progress:()=>({project:selected,paused,scroll:scrollY}),setPaused(value){paused=value;staticMode();update(performance.now());},destroy(){cancelAnimationFrame(frame);views.forEach(e=>e.view?.destroy());}};window.__ready=true;
addEventListener('pagehide',()=>window.__previs.destroy(),{once:true});
