import {useState,type FormEvent} from 'react';
import type {ContentRepository} from '../../data/ContentRepository';
import {safeImage} from '../../lib/urls';
import {Field} from './fields';
import type {Draft,Section} from './schema';

interface Props { draft:Draft; section:Section; commit:(change:(d:Draft)=>void,message:string)=>Promise<boolean>; notify:(m:string)=>void; repository:ContentRepository }
const headings:Partial<Record<Section,string>>={landing:'Identity & social links',about:'The person behind the player',contact:'Book & quill'};

// Singleton settings for Landing, About and Contact, as in the reference settings() form.
export function SettingsCard({draft,section,commit,notify,repository}:Props) {
 const s=draft.settings,[busy,setBusy]=useState(false);
 if(!headings[section])return null;
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();const form=new FormData(event.currentTarget),values:Record<string,string|number>={};
  for(const [key,value] of form){if(['github','linkedin'].includes(key)&&value&&!/^https:\/\//.test(String(value))){notify('Use a complete https:// profile URL.');return;}values[key]=key==='portraitPosition'?Math.max(0,Math.min(100,Number(value))):String(value);}
  await commit(d=>Object.assign(d.settings,values),'Section settings saved.');
 };
 const portrait=async(file:File|undefined)=>{
  if(!file)return;setBusy(true);
  try{const src=await repository.uploadMedia(file,{alt:'Portrait of '+s.name,width:0,height:0});await commit(d=>{d.settings.portrait=src;},'Portrait saved. Open About to see the framed photograph.');}
  catch(error){notify((error as Error).message);}finally{setBusy(false);}
 };
 return <form className="settings-card" id="settings-form" key={JSON.stringify(s)} onSubmit={submit}><h2>{headings[section]}</h2><div className="editor-fields">
 {section==='landing'&&<><Field name="name" label="Display name" value={s.name}/><Field name="heroLabel" label="Intro label" value={s.heroLabel}/><Field name="tagline" label="Landing introduction" kind="textarea" value={s.tagline}/><Field name="introTitle" label="Cinematic intro title" value={s.introTitle}/><Field name="github" label="GitHub profile URL" kind="url" value={s.github}/><Field name="linkedin" label="LinkedIn profile URL" kind="url" value={s.linkedin}/></>}
 {section==='about'&&<><Field name="aboutTitle" label="About heading" value={s.aboutTitle}/><Field name="bio" label="Biography" kind="textarea" value={s.bio}/>
  <div className="editor-field"><span>Actual portrait</span><div className="portrait-upload">{s.portrait?<img id="portrait-editor-preview" src={safeImage(s.portrait)} alt="Current portrait"/>:<div className="portrait-upload-empty">YOUR PHOTO<br/>3:4 PORTRAIT</div>}
  <div><p>Use a chest-up photo with a little space around your head. The portfolio places it inside an oak item frame.</p><label className="btn secondary upload-label">{busy?'Preparing…':'Choose portrait'}<input type="file" accept="image/png,image/jpeg,image/webp" id="portrait-upload" className="sr-only" disabled={busy} onChange={e=>{void portrait(e.currentTarget.files?.[0]);e.currentTarget.value='';}}/></label><button type="button" className="text-button danger" id="remove-portrait" disabled={!s.portrait} onClick={()=>commit(d=>{d.settings.portrait='';},'Portrait removed.')}>Remove photo</button></div></div></div>
  <Field name="portraitPosition" label="Vertical crop position (0–100)" kind="number" value={s.portraitPosition}/></>}
 {section==='contact'&&<><Field name="contactTitle" label="Contact heading" value={s.contactTitle}/><Field name="contactCopy" label="Invitation text" kind="textarea" value={s.contactCopy}/></>}
 </div><div className="form-actions"><button className="btn">Save section</button><span className="help">{repository.kind==='supabase'?'Saved to the draft until you publish. Contact sends nothing.':'Saved to this browser’s draft. Contact sends nothing.'}</span></div></form>;
}

// EDITOR.md: the five fixed character categories keep their ids; only names, labels and intros change.
export function CharactersCard({draft,commit}:Pick<Props,'draft'|'commit'>) {
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();const form=new FormData(event.currentTarget);
  await commit(d=>d.characters.forEach(c=>{for(const f of ['name','label','intro'] as const)c[f]=String(form.get(c.id+'.'+f)??c[f]);}),'Characters saved.');
 };
 return <form className="settings-card" id="characters-form" key={JSON.stringify(draft.characters)} onSubmit={submit}><h2>Five characters, one story</h2><p className="help">Each experience entry belongs to one of these fixed categories. Rename them freely; the categories themselves cannot be removed.</p>
 {draft.characters.map(c=><fieldset className="editor-fields" key={c.id} data-character={c.id}><Field name={c.id+'.name'} label={'Character name ('+c.id+')'} value={c.name}/><Field name={c.id+'.label'} label="Label" value={c.label}/><Field name={c.id+'.intro'} label="Introduction" kind="textarea" value={c.intro}/></fieldset>)}
 <div className="form-actions"><button className="btn">Save characters</button></div></form>;
}
