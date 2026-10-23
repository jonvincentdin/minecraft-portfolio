import type {PortfolioContent} from '../../types/content';

// Transcribed from reference/site/editor.js so field order, labels and kinds stay identical.
export const sections=[['landing','Landing','◈'],['about','About','▣'],['projects','Projects','▦'],['skills','Skills','⚒'],['experience','Experience','♙'],['achievements','Achievements','✦'],['certifications','Certifications','▤'],['contact','Contact','✉']] as const;
export type Section=typeof sections[number][0];
export type CollectionKey='highlights'|'journal'|'projects'|'actualSkills'|'experience'|'achievements'|'certifications'|'contacts';
export const collectionOf:Record<Section,CollectionKey>={landing:'highlights',about:'journal',projects:'projects',skills:'actualSkills',experience:'experience',achievements:'achievements',certifications:'certifications',contact:'contacts'};
export const viewLink:Record<Section,string>={landing:'home',about:'about',projects:'projects',skills:'skills',experience:'experience',achievements:'achievements',certifications:'achievements',contact:'contact'};
export const collectionTitle:Record<CollectionKey,string>={highlights:'Landing highlights',journal:'Journal chapters',projects:'Project collection',actualSkills:'Portfolio skill loadout',experience:'Experience entries',achievements:'Achievement tree',certifications:'Certification tree',contacts:'Contact links'};
export const sampled:CollectionKey[]=['projects','actualSkills','experience','achievements','certifications'];
export const withSymbol:CollectionKey[]=['actualSkills','achievements','certifications'];

export type FieldKind='text'|'textarea'|'select'|'url'|'number'|'craftskills'|'resultmodels'|'projects'|'characters'|'parents';
export type FieldSpec=readonly [name:string,label:string,kind?:FieldKind,options?:readonly string[]];
export const schema:Record<CollectionKey,readonly FieldSpec[]>={
 actualSkills:[['title','Skill name'],['category','Category'],['level','Experience level','select',['Learning','Working knowledge','Comfortable','Advanced']],['recipeId','Skill artifact','craftskills'],['resultModel','Model override (optional)','resultmodels'],['description','What you can do with this skill','textarea'],['projectId','Project evidence','projects'],['evidence','External evidence URL','url']],
 highlights:[['title','Label'],['body','Text']],
 journal:[['title','Chapter title'],['body','Content','textarea']],
 projects:[['title','Project title'],['category','Category'],['summary','Short introduction','textarea'],['status','Status','select',['Concept','In progress','Completed','Archived']],['role','Your role'],['date','Project date'],['stack','Technology stack'],['overview','Overview','textarea'],['problem','The problem','textarea'],['solution','The solution','textarea'],['features','Features — one per line','textarea'],['process','Process','textarea'],['outcome','Outcome & lessons','textarea'],['liveUrl','Live project URL','url'],['sourceUrl','Source code URL','url']],
 experience:[['title','Role or activity'],['character','Character category','characters'],['organization','Organization / context'],['start','Start date or period'],['end','End date or period'],['description','Description','textarea'],['contribution','Your contribution','textarea'],['evidence','Evidence URL','url']],
 achievements:[['title','Achievement title'],['description','Description','textarea'],['date','Date'],['issuer','Context / organization'],['evidence','Evidence URL','url'],['parent','Parent node','parents'],['x','Map X position','number'],['y','Map Y position','number']],
 certifications:[['title','Certification title'],['description','Description','textarea'],['date','Issue date'],['issuer','Issuing organization'],['evidence','Verification URL','url'],['parent','Parent node','parents'],['x','Map X position','number'],['y','Map Y position','number']],
 contacts:[['title','Link label'],['url','URL or mailto address','url'],['body','Description','textarea']],
};

export function readSection(hash:string):{section:Section;workshop?:'recipes'|'inventory'} {
 const [,name='landing',sub]=hash.replace(/^#/,'').split('/');
 if(name==='skills'&&(sub==='recipes'||sub==='inventory'))return {section:'skills',workshop:sub};
 return {section:sections.some(([id])=>id===name)?name as Section:'landing'};
}
export type Draft=PortfolioContent;
export const newId=()=>globalThis.crypto?.randomUUID?.()||`id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
