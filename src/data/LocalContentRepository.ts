import seed from './demo-content.json';
import type {ContentSnapshot,PortfolioContent} from '../types/content';
import type {ContentRepository,MediaMetadata} from './ContentRepository';
import {ConflictError} from './ContentRepository';
import {IndexedDbDocumentStore,MemoryDocumentStore,type DocumentStore,type StoredDocument} from './document-store';
import {validateContent} from '../domain/content-validation';
import {readImage} from '../lib/media';

const fromSeed=():StoredDocument=>({content:structuredClone(seed) as PortfolioContent,revision:0,savedAt:''});
const now=()=>new Date().toISOString();

// Browser-only content adapter for demo mode. Drafts and publications live in this browser's IndexedDB;
// nothing reaches other visitors and there is no sign-in. M06 replaces it with the authorized Supabase adapter.
export class LocalContentRepository implements ContentRepository {
 private ready:Promise<DocumentStore>;
 // Without usable IndexedDB (private windows, blocked site data) work continues in memory and reports it.
 constructor(store?:DocumentStore){this.ready=store?Promise.resolve(store):IndexedDbDocumentStore.open().catch(()=>new MemoryDocumentStore());}
 async isPersistent(){return (await this.ready).persistent;}

 async getPublishedContent(_portfolioId:string):Promise<ContentSnapshot>{
  const doc=await this.read('published');
  return {content:doc.content,revision:doc.revision,source:'local'};
 }
 // A first draft starts from what this browser publishes, or the seed.
 async getDraft(_portfolioId:string):Promise<ContentSnapshot>{
  const draft=await (await this.ready).read('draft');
  const doc=draft?? await this.read('published');
  return {content:structuredClone(doc.content),revision:draft?draft.revision:0,source:'local'};
 }
 async saveDraft(content:PortfolioContent,expectedRevision:number):Promise<number>{
  const next=structuredClone(content);validateContent(next);
  return (await this.ready).update(docs=>{
   const current=docs.draft?.revision??0;
   if(current!==expectedRevision)throw new ConflictError(current);
   const revision=current+1;
   return {writes:{draft:{content:next,revision,savedAt:now()}},result:revision};
  });
 }
 // Publishes exactly the saved draft revision; the check and the write share one transaction.
 async publishDraft(expectedRevision:number):Promise<number>{
  return (await this.ready).update(docs=>{
   const draft=docs.draft;
   if(!draft||draft.revision!==expectedRevision)throw new ConflictError(draft?.revision??0);
   validateContent(structuredClone(draft.content));
   return {writes:{published:{content:draft.content,revision:draft.revision,savedAt:now()}},result:draft.revision};
  });
 }
 // Replaces the draft with an imported document, keeping the replaced draft as a recovery copy. Never publishes.
 async importDraft(content:PortfolioContent,expectedRevision:number):Promise<number>{
  const next=structuredClone(content);validateContent(next);
  return (await this.ready).update(docs=>{
   const current=docs.draft?.revision??0;
   if(current!==expectedRevision)throw new ConflictError(current);
   const previous=docs.draft??docs.published??fromSeed();
   return {writes:{recovery:{...previous,savedAt:now()},draft:{content:next,revision:current+1,savedAt:now()}},result:current+1};
  });
 }
 async getRecovery(){return (await this.ready).read('recovery');}
 // Local mode keeps images inline in the document as resized WebP data URLs, as the reference editor did.
 async uploadMedia(file:File,_metadata:MediaMetadata):Promise<string>{return readImage(file);}
 // Inline images have no separate stored object to delete.
 async removeUnusedMedia(_id:string):Promise<void>{}

 private async read(key:'published'){return (await (await this.ready).read(key))??fromSeed();}
}
