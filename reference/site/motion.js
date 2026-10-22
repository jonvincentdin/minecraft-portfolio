// Short, disposable motion for section changes and progressive content reveals.
export function reveal(element,{delay=0,distance=20,duration=460}={}){
 if(!element)return null;
 const animation=element.animate([{opacity:0,transform:`translateY(${distance}px)`},{opacity:1,transform:'translateY(0)'}],{duration,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
 return animation;
}
export function mountSectionMotion(root,paused){
 if(paused()||!('IntersectionObserver' in window))return()=>{};
 const animations=new Set(),observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);if(paused())continue;const a=reveal(entry.target,{delay:Number(entry.target.dataset.revealOrder||0)*42});animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));}},{threshold:.08});
 const groups=root.querySelectorAll('.section-head,.atelier-head,.journal>*,.inventory-layout>*,.experience-layout>*,.role-card,.loadout-heading,.loadout-card,.atelier-scene>*,.adv-toolbar,.adv-explorer>*,.contact-book>*,.hero-copy>*,.hero-world');
 groups.forEach((el,i)=>{el.dataset.revealOrder=String(i%5);observer.observe(el)});
 return()=>{observer.disconnect();for(const a of animations)a.cancel();animations.clear()};
}
export function pixelBurst(button,event){
 const box=button.getBoundingClientRect(),x=event.detail?event.clientX:box.left+box.width/2,y=event.detail?event.clientY:box.top+box.height/2;
 for(let i=0;i<6;i++){const pixel=document.createElement('i');pixel.className='interaction-pixel';pixel.setAttribute('aria-hidden','true');pixel.style.left=x+'px';pixel.style.top=y+'px';document.body.append(pixel);const angle=(i/6)*Math.PI*2,reach=24+(i%3)*12;const a=pixel.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(${Math.cos(angle)*reach}px,${Math.sin(angle)*reach-16}px) scale(.2)`,opacity:0}],{duration:440,easing:'cubic-bezier(.15,.7,.3,1)'});a.finished.catch(()=>{}).finally(()=>pixel.remove());}
}
