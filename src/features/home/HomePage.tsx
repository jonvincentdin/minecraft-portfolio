import { Fragment } from 'react';
import type { PortfolioContent } from '../../types/content';
import type { Scene } from '../../components/three/renderer.js';
import { WorldScene } from '../../components/three/SceneCanvas';
function Social({ name, url, notify }: { name:string; url:string; notify:(message:string)=>void }) {
 let safe = ''; try { const parsed = new URL(url); if (['https:','http:'].includes(parsed.protocol)) safe=parsed.href; } catch { /* Empty owner URL */ }
 return safe ? <a className="social" href={safe} target="_blank" rel="noopener noreferrer">{name} ↗</a> : <button className="social" onClick={()=>notify(name+' link has not been supplied yet.')}>{name} <small>Add link</small></button>;
}
export function HomePage({ content, scene, paused, notify }: { content:PortfolioContent; scene?:Scene; paused:boolean; notify:(message:string)=>void }) {
 return <section className="hero"><div className="hero-copy"><span className="eyebrow">{content.settings.heroLabel}</span><h1>{content.settings.name.split(' ').map((part,i)=><Fragment key={i}>{i>0&&<><wbr /> </>}{part}</Fragment>)}</h1><p>{content.settings.tagline}</p>
 <div className="hero-actions"><a className="btn" href="#projects">Explore projects ↗</a><a className="btn secondary" href="#experience">Meet the characters</a></div>
 <div className="socials"><Social name="GitHub" url={content.settings.github} notify={notify}/><Social name="LinkedIn" url={content.settings.linkedin} notify={notify}/></div>
 <div className="hero-meta">{content.highlights.map(item=><span key={item.id}>{item.title}<br/><b>{item.body}</b></span>)}</div></div>
 <div className="hero-world"><WorldScene scene={scene} paused={paused}/></div><div className="world-caption"><span className="status-dot"/> A WORLD OF IDEAS / JVD</div></section>;
}
