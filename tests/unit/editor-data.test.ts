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
import { shared, stricter } from '../fixtures/validation-cases';

const fresh=()=>structuredClone(seed) as PortfolioContent;
const verdict=(fn:(x:unknown)=>unknown,doc:unknown)=>{try{fn(structuredClone(doc));return 'ok';}catch(error){return (error as Error).message;}};
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
