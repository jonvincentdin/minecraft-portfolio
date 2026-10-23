import type { ContentSnapshot, PortfolioContent } from '../types/content';
export interface MediaMetadata { alt: string; width: number; height: number }
export interface ContentRepository {
 getPublishedContent(portfolioId: string): Promise<ContentSnapshot>;
 getDraft(portfolioId: string): Promise<ContentSnapshot>;
 saveDraft(content: PortfolioContent, expectedRevision: number): Promise<number>;
 publishDraft(expectedRevision: number): Promise<number>;
 uploadMedia(file: File, metadata: MediaMetadata): Promise<string>;
 removeUnusedMedia(id: string): Promise<void>;
}
// Thrown when the stored revision moved on since the caller loaded it; local edits must be kept, not overwritten.
export class ConflictError extends Error {
 constructor(readonly currentRevision:number){super('This draft was changed elsewhere (now revision '+currentRevision+'). Your edits were kept and not saved.');this.name='ConflictError';}
}
export class UnavailableWrites {
 protected unavailable(): never { throw new Error('Content editing and publication are unavailable in M00. No data was saved.'); }
 async getDraft(_id: string): Promise<ContentSnapshot> { return this.unavailable(); }
 async saveDraft(_content: PortfolioContent, _revision: number): Promise<number> { return this.unavailable(); }
 async publishDraft(_revision: number): Promise<number> { return this.unavailable(); }
 async uploadMedia(_file: File, _metadata: MediaMetadata): Promise<string> { return this.unavailable(); }
 async removeUnusedMedia(_id: string): Promise<void> { return this.unavailable(); }
}
