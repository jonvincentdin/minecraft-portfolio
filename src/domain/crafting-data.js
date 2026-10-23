// Game recipes are an illustrative learning pathway, not claims about the owner's skills.
const material=(id,name,model,note)=>({id,name,model,kind:'Material',note});
const skill=(id,name,model,note)=>({id,name,model,kind:'Skill',note});
export const craftItems=[
 material('book','Blank book','material_book','A place to collect knowledge.'),
 ...[['orange','Orange'],['blue','Blue'],['yellow','Yellow'],['cyan','Cyan'],['green','Green'],['purple','Purple']].map(([id,name])=>({...material('dye_'+id,name+' dye',id==='blue'?'material_pigment':'dye_'+id,'Color for a skill book.'),kind:'Color'})),
 material('shield','Layout shield','item_shield','Panels and visual structure for CSS.'),
 material('pearl','Component pearl','item_ender_pearl','Reusable components for React.'),
 material('compass','Routing compass','item_compass','Directions and connections for APIs.'),
 material('plank','Oak plank','material_plank','A foundation for tools and structure.'),
 material('fiber','Plant fiber','material_fiber','Twist into string or press into paper.'),
 material('pigment','Blue pigment','material_pigment','Color, hierarchy, and visual expression.'),
 material('iron','Iron ingot','material_iron','A building block for connected systems.'),
 material('redstone','Redstone','item_redstone','The spark behind logic and behavior.'),
 material('stick','Stick','material_stick','A shaped piece of wood, crafted from planks.'),
 material('string','String','material_string','Three fibers become three lengths of string.'),
 material('paper','Paper','material_paper','A blank page for structure and ideas.'),
 {id:'bow',name:'Bow',model:'item_bow',kind:'Tool',note:'A familiar recipe to practice with.'},
 skill('html','HTML','skill_html','Structure and semantic building blocks.'),
 skill('css','CSS','skill_css','Presentation, layout, and responsive styling.'),
 skill('javascript','JavaScript','skill_javascript','Behavior, logic, and interaction.'),
 skill('react','React','skill_react','Compose interfaces from reusable components.'),
 skill('sql','SQL','skill_sql','Model and query structured information.'),
 skill('api','API integration','skill_api','Connect interfaces to other systems.')
];
export const itemById=Object.fromEntries(craftItems.map(x=>[x.id,x]));
export const resultModels=[...craftItems.filter(x=>x.kind==='Skill').map(x=>[x.model,x.name+' artifact']),['material_book','Classic book'],...craftItems.filter(x=>x.model.startsWith('item_')).map(x=>[x.model,x.name])];
export const defaultRecipes=()=>[
 ['html','HTML','dye_orange','plank',[],'A book, orange dye, and an oak plank: the structure of a page.'],
 ['css','CSS','dye_blue','shield',['html'],'A book, blue dye, and a layout shield: give the structure a visual style.'],
 ['javascript','JavaScript','dye_yellow','redstone',['html','css'],'A book, yellow dye, and redstone: add logic and behavior.'],
 ['react','React','dye_cyan','pearl',['html','css','javascript'],'A book, cyan dye, and a component pearl: build reusable interfaces.'],
 ['sql','SQL','dye_green','iron',[],'A book, green dye, and an ingot: give your data a strong structure.'],
 ['api','API integration','dye_purple','compass',['javascript'],'A book, purple dye, and a routing compass: connect systems.']
].map(([output,title,color,special,requires,note])=>({id:'recipe-'+output,title,output,color,special,bookCount:1,colorCount:1,specialCount:1,amount:1,requires,note,resultModel:itemById[output].model}));
export const defaultStartingInventory=()=>[['book',24],...['orange','blue','yellow','cyan','green','purple'].map(c=>['dye_'+c,8]),...['plank','shield','redstone','pearl','iron','compass'].map(id=>[id,8])].map(([item,quantity])=>({id:'start-'+item,title:itemById[item].name,item,quantity}));
export function recipePattern(r){return Array.from({length:Math.max(r.bookCount,r.colorCount,r.specialCount)},(_,y)=>[y<r.bookCount?'book':null,y<r.colorCount?r.color:null,y<r.specialCount?r.special:null])}
export function validateWorkshopConfig(records,inventory){
 if(!Array.isArray(records)||records.length>100||!Array.isArray(inventory)||inventory.length>100)throw Error('Invalid workshop configuration.');
 const ids=new Set(),patterns=new Set();
 for(const r of records){if(!r||typeof r.id!=='string'||!/^[a-zA-Z0-9_-]{1,120}$/.test(r.id)||ids.has(r.id))throw Error('Recipe IDs must be unique.');ids.add(r.id);if(typeof r.title!=='string'||!r.title.trim()||typeof r.note!=='string')throw Error('Add a recipe title and description.');if(itemById[r.output]?.kind!=='Skill'||itemById[r.color]?.kind!=='Color'||!itemById[r.special]||['Color','Skill'].includes(itemById[r.special].kind)||r.special==='book')throw Error('Choose a skill output, a dye, and a special item.');if(![r.bookCount,r.colorCount,r.specialCount].every(n=>Number.isInteger(n)&&n>=1&&n<=3)||!Number.isInteger(r.amount)||r.amount<1||r.amount>16)throw Error('Use 1–3 of each ingredient and 1–16 output items.');if(!Array.isArray(r.requires)||new Set(r.requires).size!==r.requires.length||r.requires.some(id=>id===r.output||!records.some(x=>x.output===id)))throw Error('Prerequisites must be other skills with recipes.');if(r.resultModel&&!resultModels.some(([id])=>id===r.resultModel))throw Error('Choose an available output model.');const key=JSON.stringify(recipePattern(r));if(patterns.has(key))throw Error('Two recipes cannot use the same ingredient pattern.');patterns.add(key);}
 const visit=(id,path=[])=>{if(path.includes(id))throw Error('Recipe prerequisites cannot form a cycle.');for(const r of records.filter(r=>r.output===id))for(const p of r.requires)visit(p,[...path,id]);};for(const r of records)visit(r.output);
 const seen=new Set(),inventoryIds=new Set();for(const x of inventory){if(!x||typeof x.id!=='string'||!/^[a-zA-Z0-9_-]{1,120}$/.test(x.id)||inventoryIds.has(x.id)||!Object.hasOwn(itemById,x.item)||seen.has(x.item)||!Number.isInteger(x.quantity)||x.quantity<0||x.quantity>256)throw Error('Starting inventory needs unique items with quantities from 0 to 256.');seen.add(x.item);inventoryIds.add(x.id)}return true;
}
export let recipes=[],recipeById={},startingBag={};
export function configureWorkshop(records=defaultRecipes(),inventory=defaultStartingInventory()){validateWorkshopConfig(records,inventory);recipes=records.map(r=>({...r,category:'Skills',pattern:recipePattern(r)}));recipeById=Object.fromEntries(recipes.map(r=>[r.id,r]));startingBag=Object.fromEntries(inventory.map(x=>[x.item,x.quantity]));}
configureWorkshop();
export const STACK_LIMIT=64;
export const demoSkills=()=>[
 ['html','HTML','Web foundations','diamond_pickaxe','Semantic structure and accessible page content.'],
 ['css','CSS','Web foundations','potion','Responsive layouts, visual hierarchy, and styling.'],
 ['javascript','JavaScript','Programming','redstone','Browser interactions and application logic.'],
 ['react','React','Interfaces','ender_pearl','Component-based interfaces and state.'],
 ['sql','SQL','Data & systems','furnace','Structured data and relational queries.'],
 ['api','API integration','Data & systems','compass','Connecting interfaces to data and services.']
].map(([recipeId,title,category,symbol,description])=>({id:'actual-'+recipeId,recipeId,title,category,symbol,description,level:'Working knowledge',projectId:'',evidence:'',sample:true}));
