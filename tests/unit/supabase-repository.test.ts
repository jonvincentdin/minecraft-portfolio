import { test } from 'node:test';
import assert from 'node:assert/strict';
import seed from '../../src/data/demo-content.json' with { type: 'json' };
import { SupabaseContentRepository, mediaFiles, requestError, type Client } from '../../src/data/SupabaseContentRepository';
import { AuthorizationError, ConflictError } from '../../src/data/ContentRepository';
import { safeImage } from '../../src/lib/urls';
import type { PortfolioContent } from '../../src/types/content';

const FILE = '3f1c2a4e-1b2c-4d5e-8f90-123456789abc.webp';
type Result = { data?: unknown; error?: { message: string; code?: string; details?: string } | null; status?: number };
// A recording stand-in for the supabase-js client: each table read, RPC and storage call returns the next scripted
// result for its key and is logged, so tests can assert what reached the service and in which order.
function fakeClient(script: Record<string, Result[]>) {
 const calls: string[] = [];
 const next = (key: string): Result => { calls.push(key); const queue = script[key]; return queue?.length ? queue.shift()! : { data: null, error: null, status: 200 }; };
 const answer = (key: string) => { const r = next(key); return { data: r.data ?? null, error: r.error ?? null, status: r.status ?? (r.error ? 400 : 200) }; };
 const query = (table: string) => {
  let key = 'from:' + table;
  const chain: any = { select: () => chain, eq: () => chain, in: () => chain, abortSignal: () => chain,
   maybeSingle: async () => answer(key), then: (resolve: (v: unknown) => void, reject: (e: unknown) => void) => Promise.resolve(answer(key)).then(resolve, reject) };
  return chain;
 };
 const client = {
  from: query,
  rpc: (fn: string, args: unknown) => { const key = 'rpc:' + fn; return { abortSignal: async () => { calls.push(JSON.stringify(args).slice(0, 0)); return answer(key); }, then: (res: any, rej: any) => Promise.resolve(answer(key)).then(res, rej) }; },
  storage: { from: (bucket: string) => ({
   copy: async (from: string, to: string, options: { destinationBucket: string }) => answer(`copy:${bucket}:${from}->${options.destinationBucket}:${to}`),
   upload: async (path: string) => answer(`upload:${bucket}:${path}`),
   remove: async (paths: string[]) => answer(`remove:${bucket}:${paths.join()}`),
   createSignedUrls: async (paths: string[]) => answer(`sign:${bucket}:${paths.join()}`),
  }) },
  auth: { getSession: async () => ({ data: { session: null } }), signOut: async () => {}, onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
 };
 return { client: client as unknown as Client, calls: () => calls.filter(Boolean) };
}
const fresh = () => structuredClone(seed) as PortfolioContent;
const withMedia = () => { const c = fresh(); c.settings.portrait = 'media:' + FILE; return c; };

test('visitors get the publication, or the labelled sample world, and never a draft', async () => {
 const published = fresh(); published.settings.name = 'Published name';
 const { client, calls } = fakeClient({ 'from:portfolio_publications': [{ data: { content: published, revision: 4 } }, { data: null }] });
 const repo = new SupabaseContentRepository(client, 'https://example.supabase.co');
 assert.deepEqual(await repo.getPublishedContent('jvd-world').then(x => [x.content.settings.name, x.revision, x.source]), ['Published name', 4, 'supabase']);
 assert.deepEqual(await repo.getPublishedContent('jvd-world').then(x => [x.content.settings.name, x.revision, x.source]), [seed.settings.name, 0, 'demo']);
 assert.ok(calls().every(c => c === 'from:portfolio_publications'), 'no draft is read for visitors');
});
test('a failing content service is reported, not replaced with sample content', async () => {
 const { client } = fakeClient({ 'from:portfolio_publications': [{ error: { message: 'Failed to fetch' } }] });
 await assert.rejects(new SupabaseContentRepository(client, 'https://example.supabase.co').getPublishedContent('jvd-world'), /could not be loaded\. The content service could not be reached\.$/);
});
test('a first draft starts from the publication at revision 0', async () => {
 const published = fresh(); published.settings.tagline = 'From publication';
 const { client } = fakeClient({ 'from:portfolio_drafts': [{ data: null }], 'from:portfolio_publications': [{ data: { content: published, revision: 2 } }] });
 const draft = await new SupabaseContentRepository(client, 'https://example.supabase.co').getDraft('jvd-world');
 assert.equal(draft.revision, 0); assert.equal(draft.content.settings.tagline, 'From publication');
});
test('save results map to conflicts, sign-in problems and validation messages', async () => {
 const { client, calls } = fakeClient({ 'rpc:save_draft': [
  { data: 3 },
  { error: { message: 'This draft was changed elsewhere.', code: 'PT409', details: '5' }, status: 409 },
  { error: { message: 'Sign in with an enrolled editor account to change this portfolio.', code: '42501' }, status: 403 },
  { error: { message: 'JWT expired', code: 'PGRST303' }, status: 401 },
  { error: { message: 'Tree contains a cycle.', code: 'PT422' }, status: 422 },
 ] });
 const repo = new SupabaseContentRepository(client, 'https://example.supabase.co');
 assert.equal(await repo.saveDraft(fresh(), 2), 3);
 await assert.rejects(repo.saveDraft(fresh(), 2), (e: unknown) => e instanceof ConflictError && e.currentRevision === 5);
 await assert.rejects(repo.saveDraft(fresh(), 5), (e: unknown) => e instanceof AuthorizationError && /enrolled editor.*edits were kept/.test((e as Error).message));
 await assert.rejects(repo.saveDraft(fresh(), 5), (e: unknown) => e instanceof AuthorizationError && /Sign in again; your edits were kept/.test((e as Error).message));
 await assert.rejects(repo.saveDraft(fresh(), 5), /^Error: Tree contains a cycle\.$/);
 const invalid = fresh(); invalid.characters.pop();
 await assert.rejects(repo.saveDraft(invalid, 5), /five supplied character/);
 assert.equal(calls().filter(c => c === 'rpc:save_draft').length, 5, 'invalid content never reaches the service');
});
test('publishing copies unpublished images before the atomic publish, and a failed copy publishes nothing', async () => {
 const draft = { content: withMedia(), revision: 7 };
 const ok = fakeClient({ 'from:portfolio_drafts': [{ data: draft }], 'from:media_assets': [{ data: [{ file: FILE, published_at: null }] }], 'rpc:publish_draft': [{ data: 7 }] });
 assert.equal(await new SupabaseContentRepository(ok.client, 'https://example.supabase.co').publishDraft(7), 7);
 assert.deepEqual(ok.calls(), ['from:portfolio_drafts', 'from:media_assets', `copy:portfolio-drafts:${FILE}->portfolio-media:${FILE}`, 'rpc:publish_draft']);
 const failed = fakeClient({ 'from:portfolio_drafts': [{ data: draft }], 'from:media_assets': [{ data: [{ file: FILE, published_at: null }] }],
  [`copy:portfolio-drafts:${FILE}->portfolio-media:${FILE}`]: [{ error: { message: 'Bucket quota exceeded' } }] });
 await assert.rejects(new SupabaseContentRepository(failed.client, 'https://example.supabase.co').publishDraft(7), /Nothing was published/);
 assert.ok(!failed.calls().includes('rpc:publish_draft'));
 const stale = fakeClient({ 'from:portfolio_drafts': [{ data: { ...draft, revision: 8 } }] });
 await assert.rejects(new SupabaseContentRepository(stale.client, 'https://example.supabase.co').publishDraft(7), (e: unknown) => e instanceof ConflictError && e.currentRevision === 8);
 assert.deepEqual(stale.calls(), ['from:portfolio_drafts']);
});
test('uploaded media resolves to the public bucket, and draft-only uploads to signed URLs', async () => {
 const { client } = fakeClient({ 'from:portfolio_drafts': [{ data: { content: withMedia(), revision: 1 } }], 'from:media_assets': [{ data: [{ file: FILE, published_at: null }] }],
  [`sign:portfolio-drafts:${FILE}`]: [{ data: [{ path: FILE, signedUrl: 'https://example.supabase.co/signed/' + FILE }] }] });
 const repo = new SupabaseContentRepository(client, 'https://example.supabase.co/');
 assert.equal(safeImage('media:' + FILE), 'https://example.supabase.co/storage/v1/object/public/portfolio-media/' + FILE);
 await repo.getDraft('jvd-world');
 assert.equal(safeImage('media:' + FILE), 'https://example.supabase.co/signed/' + FILE);
 assert.equal(safeImage('media:../secret.webp'), '', 'only well-formed media references resolve');
 assert.deepEqual(mediaFiles(withMedia()), [FILE]);
});
test('removing media asks the database first and keeps storage untouched when it refuses', async () => {
 const { client, calls } = fakeClient({ 'rpc:remove_unused_media': [{ error: { message: 'This image is still used by the draft or the published portfolio.', code: 'PT422' }, status: 422 }, { data: null }] });
 const repo = new SupabaseContentRepository(client, 'https://example.supabase.co');
 await assert.rejects(repo.removeUnusedMedia('media:' + FILE), /still used/);
 assert.deepEqual(calls(), ['rpc:remove_unused_media']);
 await repo.removeUnusedMedia('media:' + FILE);
 assert.deepEqual(calls().slice(1), ['rpc:remove_unused_media', `remove:portfolio-drafts:${FILE}`, `remove:portfolio-media:${FILE}`]);
});
test('a password change checks the current password before setting the new one', async () => {
 const calls: string[] = [];
 let signInError: { message: string } | null = { message: 'Invalid login credentials' };
 const client = { auth: {
  getSession: async () => ({ data: { session: { user: { email: 'owner@example.test' } } } }),
  signInWithPassword: async () => { calls.push('verify'); return { error: signInError }; },
  updateUser: async (attributes: { password: string }) => { calls.push('update:' + attributes.password); return { error: null }; },
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
 } } as unknown as Client;
 const repo = new SupabaseContentRepository(client, 'https://example.supabase.co');
 await assert.rejects(repo.changePassword('old', 'short'), /at least 12 characters/);
 await assert.rejects(repo.changePassword('same-long-password', 'same-long-password'), /different from the current/);
 await assert.rejects(repo.changePassword('wrong', 'a new long passphrase'), /current password is not correct\. Nothing was changed/);
 assert.deepEqual(calls, ['verify'], 'nothing is updated when the check fails');
 signInError = null;
 await repo.changePassword('right', 'a new long passphrase');
 assert.deepEqual(calls, ['verify', 'verify', 'update:a new long passphrase']);
});
test('network failures say the edits were kept', () => {
 assert.match(requestError({ message: 'TypeError: Failed to fetch' }).message, /could not be reached\. Your edits were kept/);
 assert.match(requestError({ message: 'signal timed out', code: '' }).message, /could not be reached/);
});
