import { Fragment, useState } from 'react';
import type { Project } from '../../types/content';
import { Modal } from '../../components/ui/Modal';
import { safeImage, safeUrl } from '../../lib/urls';
export function ProjectModal({project:p,close}:{project:Project;close:()=>void}) {
 const photos=p.photos.filter(photo=>safeImage(photo.src)),[index,setIndex]=useState(0),photo=photos[index];
 return <Modal label={p.title} close={close}><span className="eyebrow">{`${p.category} / ${p.status}${p.sample?' / DEMO PROJECT':''}`}</span><h2>{p.title}</h2><p className="modal-lead">{p.summary}</p>
 {photo&&<><img className="case-hero" src={safeImage(photo.src)} alt={photo.alt}/><div className="case-gallery">{photos.map((item,i)=><button key={item.id} aria-label={'View image '+(i+1)} aria-pressed={i===index} onClick={()=>setIndex(i)}><img src={safeImage(item.src)} alt={item.alt}/></button>)}</div><p className="help" id="photo-caption">{photo.caption}</p></>}
 <div className="case-facts"><span>ROLE<strong>{p.role}</strong></span><span>TOOLS<strong>{p.stack}</strong></span><span>DATE<strong>{p.date||'Not provided'}</strong></span></div>
 <div className="case-story">{[['Overview',p.overview],['The problem',p.problem],['The solution',p.solution],['Features',p.features],['Process',p.process],['Outcome & lessons',p.outcome]].map(([title,body])=><article key={title}><h3>{title}</h3><p>{body.split('\n').map((line,i)=><Fragment key={i}>{i>0&&<br/>}{line}</Fragment>)}</p></article>)}</div>
 <div className="toolbar">{safeUrl(p.liveUrl,false)&&<a className="btn" href={safeUrl(p.liveUrl,false)} target="_blank" rel="noopener noreferrer">Live project ↗</a>}{safeUrl(p.sourceUrl,false)&&<a className="btn secondary" href={safeUrl(p.sourceUrl,false)} target="_blank" rel="noopener noreferrer">Source code ↗</a>}<button className="btn secondary" onClick={close}>Back to inventory</button></div></Modal>;
}
