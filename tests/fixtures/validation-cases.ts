// Shared by the client validator tests and the database validator tests.
export type Mutation=[string,(c:any)=>void];
// Each mutation is applied to a fresh seed; both validators must agree on accept/reject and the message.
export const shared:Mutation[]=[
 ['unchanged',()=>{}],
 ['wrong version',c=>{c.version=4;}],
 ['missing name',c=>{delete c.settings.name;}],
 ['portrait crop out of range',c=>{c.settings.portraitPosition=101;}],
 ['missing setting',c=>{delete c.settings.tagline;}],
 ['duplicate project id',c=>{c.projects[1].id=c.projects[0].id;}],
 ['unsafe id',c=>{c.journal[0].id='bad id!';}],
 ['missing project field',c=>{delete c.projects[0].problem;}],
 ['unknown symbol',c=>{c.projects[0].symbol='netherite';}],
 ['too many entries',c=>{c.highlights=Array.from({length:201},(_,i)=>({id:'h'+i,title:'t',body:'b'}));}],
 ['four characters',c=>{c.characters.pop();}],
 ['renamed character category',c=>{c.characters[0].id='pirate';}],
 ['bad photo source',c=>{c.projects[0].photos[0].src='javascript:alert(1)';}],
 ['too many photos',c=>{c.projects[0].photos=Array.from({length:31},(_,i)=>({id:'p'+i,src:'assets/demos/project-1-1.svg',alt:'',caption:''}));}],
 ['tree cycle',c=>{c.achievements[0].parent='ach4';}],
 ['tree parent in other tree',c=>{c.achievements[1].parent='cert1';}],
 ['tree coordinate',c=>{c.certifications[0].x=950;}],
 ['unknown skill model',c=>{c.actualSkills[0].resultModel='skill_cobol';}],
 ['non-skill artifact',c=>{c.actualSkills[0].recipeId='book';}],
 ['skill sample flag',c=>{c.actualSkills[0].sample='yes';}],
 ['unknown experience character',c=>{c.experience[0].character='ghost';}],
 ['recipe quantity',c=>{c.recipes[0].bookCount=4;}],
 ['starting quantity',c=>{c.startingInventory[0].quantity=257;}],
 ['recipe prerequisite cycle',c=>{c.recipes[0].requires=[c.recipes[1].output];c.recipes[1].requires=[c.recipes[0].output];}],
];
// Stricter than the reference, as EDITOR.md requires: references must resolve and items must exist.
export const stricter:Mutation[]=[
 ['dangling project link',c=>{c.actualSkills[0].projectId='project-gone';}],
 ['unsafe portrait',c=>{c.settings.portrait='javascript:alert(1)';}],
 ['duplicate photo id',c=>{c.projects[0].photos[1].id=c.projects[0].photos[0].id;}],
 ['missing project sample flag',c=>{delete c.projects[0].sample;}],
];
