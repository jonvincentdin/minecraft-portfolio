import type { ContentSnapshot, PortfolioContent } from '../types/content';
export interface MediaMetadata { alt: string; width: number; height: number }
export interface ContentRepository {
 // Where drafts and publications live; the editor words its status and actions from this.
 readonly kind: 'local' | 'supabase';
 getPublishedContent(portfolioId: string): Promise<ContentSnapshot>;
 getDraft(portfolioId: string): Promise<ContentSnapshot>;
 saveDraft(content: PortfolioContent, expectedRevision: number): Promise<number>;
 publishDraft(expectedRevision: number): Promise<number>;
 uploadMedia(file: File, metadata: MediaMetadata): Promise<string>;
 removeUnusedMedia(id: string): Promise<void>;
 // Replaces the draft, keeping the replaced one as a recovery copy. Never publishes.
 importDraft(content: PortfolioContent, expectedRevision: number): Promise<number>;
 getRecovery(): Promise<{ content: PortfolioContent } | undefined>;
 // False when drafts survive only this browser session.
 isPersistent(): Promise<boolean>;
}
// Thrown when the stored revision moved on since the caller loaded it; local edits must be kept, not overwritten.
export class ConflictError extends Error {
 constructor(readonly currentRevision:number){super('This draft was changed elsewhere (now revision '+currentRevision+'). Your edits were kept and not saved.');this.name='ConflictError';}
}
// Thrown when the session ended or the account may not edit; the editor asks to sign in again and keeps edits.
export class AuthorizationError extends Error {
 constructor(message:string){super(message);this.name='AuthorizationError';}
}
