import { test } from 'node:test';
import assert from 'node:assert/strict';
import seed from '../../src/data/demo-content.json' with { type: 'json' };
import { validateContent, contentProblem } from '../../src/domain/content-validation';
import { LocalContentRepository } from '../../src/data/LocalContentRepository';
import { MemoryDocumentStore } from '../../src/data/document-store';
import { ConflictError } from '../../src/data/ContentRepository';
import { createContentRepository } from '../../src/data/repository';
// The immutable reference validator is the parity oracle.
import { validate as referenceValidate } from '../../reference/site/state.js';
import type { PortfolioContent } from '../../src/types/content';

const fresh=()=>structuredClone(seed) as PortfolioContent;
const verdict=(fn:(x:unknown)=>unknown,doc:unknown)=>{try{fn(structuredClone(doc));return 'ok';}catch(error){return (error as Error).message;}};
type Mutation=[string,(c:any)=>void];
// Each mutation is applied to a fresh seed; both validators must agree on accept/reject and the message.
const shared:Mutation[]=[
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
const stricter:Mutation[]=[
 ['dangling project link',c=>{c.actualSkills[0].projectId='project-gone';}],
 ['unsafe portrait',c=>{c.settings.portrait='javascript:alert(1)';}],
 ['duplicate photo id',c=>{c.projects[0].photos[1].id=c.projects[0].photos[0].id;}],
 ['missing project sample flag',c=>{delete c.projects[0].sample;}],
];

test('validation agrees with the reference validator on every shared case', () => {
 for(const [name,mutate] of shared){const doc=fresh();mutate(doc);assert.equal(verdict(validateContent,doc),verdict(referenceValidate,doc),name);}
 assert.equal(contentProblem(fresh()),'');
});
test('validation is stricter where references must resolve', () => {
 for(const [name,mutate] of stricter){const doc=fresh();mutate(doc);assert.equal(verdict(referenceValidate,doc),'ok',name+' (reference)');assert.notEqual(contentProblem(doc),'',name);}
});
test('older version 5 exports gain the workshop collections, as in the reference migration', () => {
 const doc:any=fresh();delete doc.recipes;delete doc.startingInventory;delete doc.actualSkills;
 validateContent(doc);assert.ok(doc.recipes.length&&doc.startingInventory.length&&doc.actualSkills.length);
});

test('local drafts use compare-and-swap revisions and never touch the publication', async () => {
 const repo=new LocalContentRepository(new MemoryDocumentStore());
 const first=await repo.getDraft('jvd-world');assert.equal(first.revision,0);
 first.content.settings.name='Draft name';
 assert.equal(await repo.saveDraft(first.content,0),1);
 await assert.rejects(repo.saveDraft(first.content,0),(e:unknown)=>e instanceof ConflictError&&e.currentRevision===1);
 assert.equal((await repo.getDraft('jvd-world')).content.settings.name,'Draft name');
 assert.equal((await repo.getPublishedContent('jvd-world')).content.settings.name,seed.settings.name,'unpublished drafts stay private');
 const invalid=fresh();invalid.characters.pop();
 await assert.rejects(repo.saveDraft(invalid,1),/five supplied character/);
 assert.equal((await repo.getDraft('jvd-world')).revision,1,'a rejected save changes nothing');
});
test('publishing copies exactly the saved revision and rejects a stale one', async () => {
 const repo=new LocalContentRepository(new MemoryDocumentStore());
 await assert.rejects(repo.publishDraft(0),ConflictError,'nothing saved yet');
 const draft=(await repo.getDraft('jvd-world')).content;draft.settings.tagline='Published tagline';
 await repo.saveDraft(draft,0);draft.settings.tagline='Later unsaved tagline';
 assert.equal(await repo.publishDraft(1),1);
 const published=await repo.getPublishedContent('jvd-world');
 assert.equal(published.content.settings.tagline,'Published tagline');assert.equal(published.revision,1);assert.equal(published.source,'local');
 await repo.saveDraft(draft,1);
 await assert.rejects(repo.publishDraft(1),ConflictError,'a newer draft exists');
 assert.equal((await repo.getPublishedContent('jvd-world')).content.settings.tagline,'Published tagline');
});
test('import validates first, keeps a recovery copy and never publishes', async () => {
 const repo=new LocalContentRepository(new MemoryDocumentStore());
 const original=(await repo.getDraft('jvd-world')).content;original.settings.name='Before import';await repo.saveDraft(original,0);
 const bad=fresh();bad.achievements[0].parent='ach4';
 await assert.rejects(repo.importDraft(bad,1),/cycle/);assert.equal((await repo.getRecovery()),undefined);
 const incoming=fresh();incoming.settings.name='Imported';
 assert.equal(await repo.importDraft(incoming,1),2);
 assert.equal((await repo.getDraft('jvd-world')).content.settings.name,'Imported');
 assert.equal((await repo.getRecovery())!.content.settings.name,'Before import');
 assert.equal((await repo.getPublishedContent('jvd-world')).content.settings.name,seed.settings.name);
});
test('demo mode uses the browser-local adapter and falls back to memory without IndexedDB', async () => {
 const repo=createContentRepository({});assert.ok(repo instanceof LocalContentRepository);
 assert.equal(await (repo as LocalContentRepository).isPersistent(),false);
 const snapshot=await repo.getPublishedContent('jvd-world');
 snapshot.content.settings.name='mutated';
 assert.equal((await repo.getPublishedContent('jvd-world')).content.settings.name,seed.settings.name,'reads are isolated copies');
});
