import { useState } from 'react';
import type { PortfolioContent } from '../../types/content';
import type { Scene } from '../../components/three/renderer.js';
import { ModelViewer } from '../../components/three/ModelViewer';
import { SectionHeading, EmptyState } from '../../components/ui/SectionHeading';
import { safeImage } from '../../lib/urls';
export function AboutPage({content,scenes,paused}:{content:PortfolioContent;scenes:Record<string,Scene>;paused:boolean}) {
 const [mode,setMode]=useState('portrait'),[chapter,setChapter]=useState(0);
 const entry=content.journal[chapter]||content.journal[0], portrait=safeImage(content.settings.portrait);
 return <section><SectionHeading label="01 / THE PERSON & THE PLAYER" title={content.settings.aboutTitle} description="A real face, a personal story, and the character that represents your journey."/>
 <div className="journal"><div><div className="portrait-controls">{[['portrait','The person'],['avatar','The player']].map(([id,title])=><button key={id} className="filter" aria-pressed={mode===id} onClick={()=>setMode(id)}>{title}</button>)}</div>
 <div className="portrait-frame" id="portrait-frame">{mode==='avatar'?<><ModelViewer scene={scenes.character_casual} model="character_casual" id="portraitModel" label="Casual voxel character" character controls={false} paused={paused}/><span className="portrait-caption">THE PLAYER / ORIGINAL AVATAR</span></>:portrait?<><img src={portrait} style={{objectPosition:'50% '+Math.max(0,Math.min(100,content.settings.portraitPosition))+'%'}} alt={'Portrait of '+content.settings.name}/><span className="portrait-caption">THE PERSON / {content.settings.name}</span></>:<div className="portrait-placeholder"><div className="portrait-silhouette"><i/></div><h3>Your face belongs here.</h3><p>A clear chest-up photo,<br/>soft light, a simple background.</p><a href="#editor/about" className="btn">Add your portrait ↗</a></div>}</div>
 <p className="portrait-note">Your actual portrait in an oak item frame. Keep the photograph natural; use the voxel border to connect it to the world.</p></div>
 <article className="paper"><span className="eyebrow">FIELD NOTES / JON VINCENT DIN</span><h2>A little about me.</h2><p>{content.settings.bio}</p><div className="toolbar">{content.journal.map((item,i)=><button key={item.id} className="filter" aria-pressed={i===chapter} onClick={()=>setChapter(i)}>{item.title}</button>)}</div><div id="journal-text">{entry?<><h3>{entry.title}</h3><p>{entry.body}</p></>:<EmptyState title="An unwritten page."/>}</div><span className="paper-signature">{content.settings.name}</span></article></div></section>;
}
