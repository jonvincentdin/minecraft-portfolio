import type { PostgrestError, SupabaseClient, User } from '@supabase/supabase-js';
import seed from './demo-content.json';
import type { ContentSnapshot, PortfolioContent } from '../types/content';
import type { Database } from '../types/database';
import { AuthorizationError, ConflictError, type ContentRepository, type MediaMetadata } from './ContentRepository';
import { validateContent } from '../domain/content-validation';
import { dataUrlFile, prepareImage } from '../lib/media';
import { mediaFile, setMediaResolver } from '../lib/urls';

const PORTFOLIO = 'jvd-world';
const DRAFTS = 'portfolio-drafts', PUBLIC = 'portfolio-media';
const SIGNED_SECONDS = 60 * 60;
const TIMEOUT_MS = 15000;
export const MIN_PASSWORD = 12;
export type Client = SupabaseClient<Database>;
export interface Membership { user: User; role: 'owner' | 'editor' | null }

// Every uploaded image a document shows (portrait and project photos), as storage file names.
export function mediaFiles(content: PortfolioContent) {
 return [...new Set([content.settings.portrait, ...content.projects.flatMap(p => p.photos.map(x => x.src))].map(mediaFile).filter(Boolean))];
}
// Turns a failed request into the error the editor understands. Edits are never discarded on failure.
export function requestError(error: PostgrestError | { message: string; code?: string; details?: string; status?: number }, status?: number): Error {
 const code = error.code ?? '', http = status ?? (error as { status?: number }).status;
 if (code === 'PT409' || http === 409) return new ConflictError(Number((error as PostgrestError).details) || 0);
 if (code === '42501' || code === 'PGRST301' || code === 'PGRST303' || http === 401 || http === 403)
  return new AuthorizationError(code === '42501' && error.message.startsWith('Sign in') ? error.message + ' Your edits were kept.' : 'Your sign-in ended or does not allow editing. Sign in again; your edits were kept and not saved.');
 if (code === 'PT422' || http === 422) return new Error(error.message);
 if (/fetch|network|abort|timeout|timed out/i.test(error.message)) return new Error('The content service could not be reached. Your edits were kept and not saved.');
 return new Error(error.message || 'The content service refused the request. Your edits were kept and not saved.');
}

// Authorized content adapter. Visitors read the publication; enrolled editors read and change the draft
// only through the database RPCs, which validate the document and compare-and-swap its revision.
export class SupabaseContentRepository implements ContentRepository {
 readonly kind = 'supabase' as const;
 recoveryActive = false;
 recoveryError = '';
 private recoveryReady: Promise<void> = Promise.resolve();
 // Explicitly consume recovery tokens once; URL fragments never go to the host.
 acceptRecoveryLink(hash: string) {
  const params = new URLSearchParams(hash.slice(1));
  if (params.get('type') !== 'recovery' && !params.has('error_description')) return;
  this.recoveryActive = true;
  history.replaceState(null, '', location.pathname + location.search + '#editor');
  this.recoveryReady = (async () => {
   const access_token = params.get('access_token'), refresh_token = params.get('refresh_token');
   if (!access_token || !refresh_token || params.has('error_description')) {
    this.recoveryError = 'This reset link is invalid or expired. Request a new link below.'; return;
   }
   const { error } = await this.client.auth.setSession({ access_token, refresh_token });
   if (error) this.recoveryError = 'This reset link is invalid or expired. Request a new link below.';
  })().catch(() => { this.recoveryError = 'The reset link could not be verified. Request a new link below.'; });
 }
 async requestPasswordReset(email: string) {
  const { error } = await this.client.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
  if (error) throw new Error(error.message);
 }
 async finishPasswordReset(password: string) {
  await this.recoveryReady;
  if (!this.recoveryActive || this.recoveryError) throw new AuthorizationError('Open a valid password reset link first.');
  if (password.length < MIN_PASSWORD) throw new Error('Use at least ' + MIN_PASSWORD + ' characters.');
  const member = await this.membership();
  if (member?.role !== 'owner') throw new AuthorizationError('Only the portfolio owner can reset the owner password here.');
  const { error } = await this.client.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  this.recoveryActive = false;
  await this.signOut();
 }
 // Draft-only uploads are private, so the editor and preview show them through signed or local URLs.
 private readonly drafted = new Map<string, string>();
 constructor(readonly client: Client, private readonly url: string) {
  setMediaResolver(file => this.drafted.get(file) ?? `${this.url.replace(/\/$/, '')}/storage/v1/object/public/${PUBLIC}/${encodeURIComponent(file)}`);
 }

 async isPersistent() { return true; }

 // Visitors never fall back to a draft: with nothing published yet they see the bundled sample world.
 async getPublishedContent(_portfolioId: string): Promise<ContentSnapshot> {
  const { data, error, status } = await this.client.from('portfolio_publications').select('content, revision').eq('portfolio_id', PORTFOLIO)
   .abortSignal(AbortSignal.timeout(TIMEOUT_MS)).maybeSingle();
  if (error) throw new Error('The published portfolio could not be loaded. ' + requestError(error, status).message.replace(/ Your edits.*$/, ''));
  if (!data) return { content: structuredClone(seed) as PortfolioContent, revision: 0, source: 'demo' };
  const content = data.content as unknown as PortfolioContent;
  validateContent(content);
  return { content, revision: data.revision, source: 'supabase' };
 }

 async getDraft(_portfolioId: string): Promise<ContentSnapshot> {
  const { data, error, status } = await this.client.from('portfolio_drafts').select('content, revision').eq('portfolio_id', PORTFOLIO)
   .abortSignal(AbortSignal.timeout(TIMEOUT_MS)).maybeSingle();
  if (error) throw requestError(error, status);
  // A first draft starts from the publication (or the sample world) at revision 0.
  const snapshot = data ? { content: data.content as unknown as PortfolioContent, revision: data.revision, source: 'supabase' as const }
   : { ...(await this.getPublishedContent(PORTFOLIO)), revision: 0 };
  await this.signDraftMedia(snapshot.content);
  return { ...snapshot, content: structuredClone(snapshot.content) };
 }

 async saveDraft(content: PortfolioContent, expectedRevision: number) {
  const next = structuredClone(content); validateContent(next);
  return this.rpc('save_draft', { expected_revision: expectedRevision, content: next as never });
 }

 // Copies every draft-only image to its immutable public name, then publishes exactly the saved revision.
 // The database refuses the publication if any image is missing, so a failed copy publishes nothing.
 async publishDraft(expectedRevision: number) {
  const { data, error, status } = await this.client.from('portfolio_drafts').select('content, revision').eq('portfolio_id', PORTFOLIO).maybeSingle();
  if (error) throw requestError(error, status);
  if (!data || data.revision !== expectedRevision) throw new ConflictError(data?.revision ?? 0);
  const files = mediaFiles(data.content as unknown as PortfolioContent);
  if (files.length) {
   const records = await this.client.from('media_assets').select('file, published_at').in('file', files);
   if (records.error) throw requestError(records.error, records.status);
   for (const record of records.data.filter(x => !x.published_at)) {
    const copied = await this.client.storage.from(DRAFTS).copy(record.file, record.file, { destinationBucket: PUBLIC });
    // An earlier attempt may already have copied it; publish_draft verifies the object either way.
    if (copied.error && !/exists|duplicate/i.test(copied.error.message)) throw new Error('An image could not be prepared for publishing: ' + copied.error.message + '. Nothing was published.');
   }
  }
  return this.rpc('publish_draft', { expected_revision: expectedRevision });
 }

 // Registers the upload, stores the resized WebP privately and returns its 'media:' reference.
 async uploadMedia(file: File, metadata: MediaMetadata) {
  const image = await prepareImage(file);
  const name = await this.rpc('register_media', { mime: 'image/webp', size_bytes: image.blob.size, width: image.width, height: image.height, alt: metadata.alt.slice(0, 500) });
  const stored = await this.client.storage.from(DRAFTS).upload(name, image.blob, { contentType: 'image/webp', upsert: false, cacheControl: '31536000' });
  if (stored.error) {
   // Clean up the unused registration; a failure here leaves only an unreferenced record.
   await this.client.rpc('remove_unused_media', { file: name });
   throw new Error('The image could not be uploaded: ' + stored.error.message);
  }
  this.drafted.set(name, URL.createObjectURL(image.blob));
  return 'media:' + name;
 }

 // Deletes an upload that neither the draft nor the publication shows (the database checks), then its objects.
 async removeUnusedMedia(id: string) {
  const file = mediaFile(id) || id;
  await this.rpc('remove_unused_media', { file });
  for (const bucket of [DRAFTS, PUBLIC]) await this.client.storage.from(bucket).remove([file]);
  this.drafted.delete(file);
 }

 // Local-mode exports carry inline images; they are uploaded first so the document stays small.
 async importDraft(content: PortfolioContent, expectedRevision: number) {
  const next = structuredClone(content); validateContent(next);
  const upload = async (src: string, alt: string) => src.startsWith('data:') ? this.uploadMedia(await dataUrlFile(src, 'imported'), { alt, width: 0, height: 0 }) : src;
  next.settings.portrait = await upload(next.settings.portrait, 'Portrait of ' + next.settings.name);
  for (const project of next.projects) for (const photo of project.photos) photo.src = await upload(photo.src, photo.alt);
  validateContent(next);
  return this.rpc('import_draft', { expected_revision: expectedRevision, content: next as never });
 }

 async getRecovery() {
  const { data, error, status } = await this.client.from('portfolio_drafts').select('recovery').eq('portfolio_id', PORTFOLIO).maybeSingle();
  if (error) throw requestError(error, status);
  return data?.recovery ? { content: data.recovery as unknown as PortfolioContent } : undefined;
 }

 // Sign-in state for the editor gate. Membership is read from the database, never from user metadata.
 async membership(): Promise<Membership | null> {
  await this.recoveryReady;
  const { data: { session } } = await this.client.auth.getSession();
  if (!session) return null;
  const { data, error, status } = await this.client.from('portfolio_editors').select('role').eq('portfolio_id', PORTFOLIO).eq('user_id', session.user.id).maybeSingle();
  if (error) throw requestError(error, status);
  const role = data?.role === 'owner' || data?.role === 'editor' ? data.role : null;
  return { user: session.user, role };
 }
 async signIn(email: string, password: string) {
  const { error } = await this.client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(/invalid/i.test(error.message) ? 'That email and password do not match an account.' : error.message);
  this.recoveryActive = false;
  this.recoveryError = '';
 }
 async signOut() { await this.client.auth.signOut(); }
 // Confirms the current password by signing in with it again, then sets the new one for this account.
 async changePassword(current: string, next: string) {
  if (next.length < MIN_PASSWORD) throw new Error('Use at least ' + MIN_PASSWORD + ' characters for the new password.');
  if (next === current) throw new Error('Choose a password different from the current one.');
  const { data: { session } } = await this.client.auth.getSession();
  const email = session?.user.email;
  if (!email) throw new AuthorizationError('Sign in again before changing the password.');
  const check = await this.client.auth.signInWithPassword({ email, password: current });
  if (check.error) throw new Error(/invalid/i.test(check.error.message) ? 'The current password is not correct. Nothing was changed.' : check.error.message);
  const { error } = await this.client.auth.updateUser({ password: next });
  if (error) throw new Error(/different/i.test(error.message) ? 'Choose a password different from the current one.' : /weak|short|characters/i.test(error.message) ? 'That password is too weak: ' + error.message : 'The password was not changed: ' + error.message);
 }
 // After the service refused the session: keep it if a refresh succeeds, otherwise end it on this device.
 async refreshAccess() {
  const { error } = await this.client.auth.refreshSession();
  if (error) await this.client.auth.signOut({ scope: 'local' });
  return !error;
 }
 onAuthChange(listener: (signedIn: boolean) => void) {
  const { data } = this.client.auth.onAuthStateChange((_event, session) => listener(!!session));
  return () => data.subscription.unsubscribe();
 }

 private async rpc<F extends keyof Database['public']['Functions']>(fn: F, args: Database['public']['Functions'][F]['Args']) {
  const { data, error, status } = await this.client.rpc(fn, args as never).abortSignal(AbortSignal.timeout(TIMEOUT_MS));
  if (error) throw requestError(error, status);
  return data as Database['public']['Functions'][F]['Returns'];
 }

 // Signed URLs for uploads the publication does not show yet, so the editor and preview can display them.
 private async signDraftMedia(content: PortfolioContent) {
  const files = mediaFiles(content).filter(file => !this.drafted.has(file));
  if (!files.length) return;
  const records = await this.client.from('media_assets').select('file, published_at').in('file', files);
  const pending = (records.data ?? []).filter(x => !x.published_at).map(x => x.file);
  if (!pending.length) return;
  const { data } = await this.client.storage.from(DRAFTS).createSignedUrls(pending, SIGNED_SECONDS);
  for (const item of data ?? []) if (item.path && item.signedUrl) this.drafted.set(item.path, item.signedUrl);
 }
}
