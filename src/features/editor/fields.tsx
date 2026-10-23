import type {ReactNode} from 'react';
import {craftItems,resultModels} from '../../domain/crafting-data.js';
import {symbols} from '../../data/symbols';
import {Modal} from '../../components/ui/Modal';
import type {Draft,FieldSpec,CollectionKey} from './schema';

type Option=readonly [string,string];
// Same markup as the reference field(): a labelled input, textarea or select; URLs are text inputs with a placeholder.
export function Field({name,label,kind='text',value,options=[]}:{name:string;label:string;kind?:string;value:unknown;options?:readonly (string|Option)[]}) {
 const v=value==null?'':String(value);let input:ReactNode;
 if(kind==='textarea')input=<textarea name={name} rows={4} defaultValue={v}/>;
 else if(kind==='select')input=<select name={name} defaultValue={v}>{options.map(o=>{const [id,title]=Array.isArray(o)?o:[o,o];return <option key={id} value={id}>{title}</option>;})}</select>;
 else if(kind==='number')input=<input name={name} type="number" min="0" max="900" step="10" defaultValue={v}/>;
 else input=<input name={name} type="text" defaultValue={v} placeholder={kind==='url'?'https://…':undefined}/>;
 return <label className="editor-field"><span>{label}</span>{input}</label>;
}

// Resolves the reference's derived field kinds into concrete select options.
export function SchemaField({spec,draft,collection,current}:{spec:FieldSpec;draft:Draft;collection:CollectionKey;current:Record<string,any>}) {
 const [name,label,type='text',opts=[]]=spec;let options:readonly (string|Option)[]=opts,kind:string=type;
 if(type==='resultmodels'){options=[['','Use skill / selected symbol'],...resultModels.map(([id,title])=>[id,title] as Option)];kind='select';}
 if(type==='craftskills'){options=[['','Use selected item symbol'],...craftItems.filter(x=>x.kind==='Skill').map(x=>[x.id,x.name] as Option)];kind='select';}
 if(type==='projects'){options=[['','No linked project'],...draft.projects.map(x=>[x.id,x.title] as Option)];kind='select';}
 if(type==='characters'){options=draft.characters.map(x=>[x.id,x.name+' — '+x.label] as Option);kind='select';}
 if(type==='parents'){options=[['','Root node'],...(draft[collection] as {id:string;title:string}[]).filter(x=>x.id!==current.id).map(x=>[x.id,x.title] as Option)];kind='select';}
 return <Field name={name} label={label} kind={kind} value={current[name]} options={options}/>;
}

export function SymbolPicker({value,project}:{value:string;project:boolean}) {
 return <div className="editor-field symbol-field"><span>{project?'Choose a project symbol':'Choose an item symbol'}</span><div className="symbol-picker">{symbols.map(([id,name])=><label className="symbol-option" title={name} key={id}><input type="radio" name="symbol" value={id} defaultChecked={value===id}/><img src={'/assets/thumbs/item_'+id+'.png'} alt=""/><span>{name}</span></label>)}</div></div>;
}

export interface Confirmation { eyebrow?:string; title:string; lead:ReactNode; action:string; danger?:boolean; cancel?:string; run:()=>Promise<unknown>|unknown }
// The reference confirmation dialog: eyebrow, heading, lead, primary action and a cancel button.
export function ConfirmDialog({confirm,close}:{confirm:Confirmation;close:()=>void}) {
 return <Modal label={confirm.title} close={close}>{confirm.eyebrow&&<span className="eyebrow">{confirm.eyebrow}</span>}<h2>{confirm.title}</h2><p className="modal-lead">{confirm.lead}</p>
 <button className={'btn'+(confirm.danger?' danger-button':'')} onClick={async()=>{await confirm.run();close();}}>{confirm.action}</button><button className="btn secondary" onClick={close}>{confirm.cancel||'Cancel'}</button></Modal>;
}
