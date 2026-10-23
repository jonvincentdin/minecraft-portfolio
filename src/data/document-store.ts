import type {PortfolioContent} from '../types/content';

export interface StoredDocument { content:PortfolioContent; revision:number; savedAt:string }
export type DocumentKey='draft'|'published'|'recovery';
export type Documents=Partial<Record<DocumentKey,StoredDocument>>;
// One atomic read-modify-write over all local documents; the updater's result is written in the same transaction.
export interface DocumentStore {
 readonly persistent:boolean;
 read(key:DocumentKey):Promise<StoredDocument|undefined>;
 update<T>(updater:(docs:Documents)=>{writes:Documents;result:T}):Promise<T>;
}

const KEYS:DocumentKey[]=['draft','published','recovery'];

export class MemoryDocumentStore implements DocumentStore {
 readonly persistent=false;
 private docs:Documents={};
 async read(key:DocumentKey){return structuredClone(this.docs[key]);}
 async update<T>(updater:(docs:Documents)=>{writes:Documents;result:T}){
  const {writes,result}=updater(structuredClone(this.docs));
  this.docs={...this.docs,...structuredClone(writes)};
  return result;
 }
}

export const LOCAL_DATABASE='jvd-world-local-v1';
export class IndexedDbDocumentStore implements DocumentStore {
 readonly persistent=true;
 private constructor(private db:IDBDatabase){}
 static async open(name=LOCAL_DATABASE){
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open(name,1);request.onupgradeneeded=()=>request.result.createObjectStore('documents');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Browser storage is blocked by another tab.'));});
  return new IndexedDbDocumentStore(db);
 }
 read(key:DocumentKey){return new Promise<StoredDocument|undefined>((resolve,reject)=>{const request=this.db.transaction('documents').objectStore('documents').get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
 // Reads every key and writes the updater's result inside a single readwrite transaction, so concurrent tabs cannot interleave.
 update<T>(updater:(docs:Documents)=>{writes:Documents;result:T}){
  return new Promise<T>((resolve,reject)=>{
   const tx=this.db.transaction('documents','readwrite'),store=tx.objectStore('documents'),docs:Documents={};let result:T,failure:unknown;
   let pending=KEYS.length;
   for(const key of KEYS){const request=store.get(key);request.onsuccess=()=>{if(request.result)docs[key]=request.result;if(--pending)return;try{const outcome=updater(docs);result=outcome.result;for(const [k,v] of Object.entries(outcome.writes))store.put(v,k);}catch(error){failure=error;tx.abort();}};}
   tx.oncomplete=()=>resolve(result);
   tx.onabort=()=>reject(failure??tx.error??Error('Browser storage transaction was aborted.'));
   tx.onerror=()=>{if(!failure)failure=tx.error;};
  });
 }
}
