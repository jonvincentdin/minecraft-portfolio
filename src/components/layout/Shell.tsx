import { useRef, type ReactNode } from 'react';
import { routes, type Route } from '../../app/routes';
export function Shell({ route, paused, togglePause, children, locked=false, name='Jon Vincent Din' }: { route:Route; paused:boolean; togglePause:()=>void; children:ReactNode; locked?:boolean; name?:string }) {
 const logoClicks=useRef({count:0,last:0});
 const enterOwner=(event:React.MouseEvent<HTMLAnchorElement>)=>{
  event.preventDefault();const now=Date.now();
  logoClicks.current.count=now-logoClicks.current.last>4000?1:logoClicks.current.count+1;
  logoClicks.current.last=now;
  if(logoClicks.current.count===5){logoClicks.current.count=0;location.hash='editor';}
  else if(route!=='home')location.hash='home';
 };
 return <><a className="skip" href="#main" inert={locked} onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();}}>Skip to content</a>
 <header id="site-header" inert={locked}><a href="#home" className="brand" aria-label="Portfolio home" onClick={enterOwner}><b>JVD<span className="brand-dot">▪</span></b><span id="site-name">{name}</span></a>
 <nav id="main-nav" aria-label="Main navigation">{Object.entries(routes).map(([id,title])=><a key={id} href={'#'+id} aria-current={route===id?'page':undefined}>{title}</a>)}</nav>
 <button id="motion" className="motion" aria-label={paused?'Resume motion':'Pause motion'} aria-pressed={paused} onClick={togglePause}>{paused?'▷':'Ⅱ'} <span>{paused?'Resume motion':'Pause motion'}</span></button></header>
 <main id="main" tabIndex={-1} inert={locked}>{children}</main>
 <footer id="site-footer" inert={locked}><span><i className="status-dot"/><span id="footer-name">{name}</span> <span className="muted">/ DESIGN REFERENCE</span></span>
 <a href="/downloads/Character_and_Item_Models.zip" download>39 refined models ↓</a><a href="/downloads/Voxel_Portfolio_Design_Kit.zip" download>Source &amp; design kit ↓</a>
 <button className="text-button" id="back-top" onClick={()=>{if(location.hash==='#home')window.scrollTo({top:0,behavior:paused?'instant':'smooth'});else location.hash='home';}}>Back to spawn ↑</button></footer></>;
}
