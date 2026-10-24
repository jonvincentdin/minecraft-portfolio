import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import seed from '../../src/data/demo-content.json' with { type: 'json' };
import { createDatabase, as, outcome, OWNER, STRANGER, type Actor } from './harness';

// The authorization matrix of context/SUPABASE.md, run in order against one database.
let db: PGlite;
const owner: Actor = { user: OWNER }, stranger: Actor = { user: STRANGER };
const doc = (change: (c: any) => void = () => {}) => { const c = structuredClone(seed) as any; change(c); return JSON.stringify(c); };
const save = (actor: Actor, revision: number, content: string) => as<{ save_draft: number }>(db, actor, 'select public.save_draft($1, $2::jsonb)', [revision, content]);
const publish = (actor: Actor, revision: number) => as<{ publish_draft: number }>(db, actor, 'select public.publish_draft($1)', [revision]);
const published = async () => (await as<{ revision: number; name: string }>(db, 'anon', "select revision::int, content #>> '{settings,name}' as name from public.portfolio_publications"))[0];
const denied = /^42501 /;

before(async () => { db = await createDatabase(); });

test('anonymous visitors read only the publication', async () => {
 assert.deepEqual(await as(db, 'anon', 'select * from public.portfolio_publications'), []);
 for (const table of ['portfolio_drafts', 'portfolio_editors', 'media_assets'])
  assert.match(await outcome(as(db, 'anon', `select * from public.${table}`)), denied, table);
 for (const call of ['public.save_draft(0, $1::jsonb)', 'public.import_draft(0, $1::jsonb)'])
  assert.match(await outcome(as(db, 'anon', 'select ' + call, [doc()])), denied, call);
 for (const call of ['public.publish_draft(1)', "public.register_media('image/webp', 10, 1, 1)", "public.remove_unused_media('x')", "portfolio_internal.content_problem('{}')"])
  assert.match(await outcome(as(db, 'anon', 'select ' + call)), denied, call);
 assert.match(await outcome(as(db, 'anon', "insert into public.portfolio_publications values ('jvd-world', 5, '{}', 1)")), denied);
 assert.match(await outcome(as(db, 'anon', "insert into storage.objects (bucket_id, name) values ('portfolio-media', 'x.webp')")), /row-level security/);
});

test('a signed-in account that is not enrolled cannot read drafts, enroll itself or write', async () => {
 assert.match(await outcome(save(stranger, 0, doc())), /^42501 Sign in with an enrolled editor/);
 assert.match(await outcome(publish(stranger, 0)), /^42501 /);
 assert.match(await outcome(as(db, stranger, "select public.register_media('image/webp', 10, 1, 1)")), /^42501 /);
 assert.match(await outcome(as(db, stranger, `insert into public.portfolio_editors (user_id, role) values ('${STRANGER}', 'owner')`)), denied, 'no self-enrollment');
 assert.match(await outcome(as(db, stranger, "insert into public.portfolio_drafts values ('jvd-world', 5, '{}', 1)")), denied, 'no direct draft writes');
 assert.match(await outcome(as(db, stranger, "insert into public.portfolio_publications values ('jvd-world', 5, '{}', 1)")), denied, 'no direct publication');
 assert.deepEqual(await as(db, stranger, 'select * from public.portfolio_editors'), []);
});

test('enrollment is a trusted administrative step', async () => {
 await as(db, 'admin', `insert into public.portfolio_editors (user_id, role) values ('${OWNER}', 'owner')`);
 assert.deepEqual(await as(db, owner, 'select role from public.portfolio_editors'), [{ role: 'owner' }]);
 assert.match(await outcome(as(db, owner, `insert into public.portfolio_editors (user_id, role) values ('${STRANGER}', 'editor')`)), denied, 'editors cannot enroll others');
 assert.match(await outcome(as(db, owner, `update public.portfolio_editors set role = 'editor'`)), denied);
});

test('the owner saves drafts with compare-and-swap revisions; invalid or stale saves change nothing', async () => {
 assert.deepEqual(await save(owner, 0, doc(c => { c.settings.name = 'Draft one'; })), [{ save_draft: 1 }]);
 assert.match(await outcome(save(owner, 0, doc())), /^PT409 This draft was changed elsewhere/);
 try { await save(owner, 0, doc()); } catch (error) { assert.equal((error as { detail?: string }).detail, '1', 'the conflict reports the current revision'); }
 assert.equal(await outcome(save(owner, 1, doc(c => { c.characters.pop(); }))), 'PT422 Keep the five supplied character categories.');
 const [draft] = await as<{ revision: number; name: string }>(db, owner, "select revision::int, content #>> '{settings,name}' as name from public.portfolio_drafts");
 assert.deepEqual(draft, { revision: 1, name: 'Draft one' });
 assert.deepEqual(await as(db, stranger, 'select * from public.portfolio_drafts'), [], 'non-editors see no draft rows');
 assert.match(await outcome(as(db, owner, "update public.portfolio_drafts set revision = 99")), denied, 'even editors write only through the RPC');
 assert.equal(await published(), undefined, 'saving never publishes');
});

test('publishing copies exactly the saved revision and rejects a stale one', async () => {
 assert.match(await outcome(publish(owner, 7)), /^PT409 /);
 assert.deepEqual(await publish(owner, 1), [{ publish_draft: 1 }]);
 assert.deepEqual(await published(), { revision: 1, name: 'Draft one' });
 await save(owner, 1, doc(c => { c.settings.name = 'Draft two'; }));
 assert.match(await outcome(publish(owner, 1)), /^PT409 /);
 assert.deepEqual(await published(), { revision: 1, name: 'Draft one' }, 'the public still sees revision 1');
 assert.deepEqual(await as(db, stranger, "select content #>> '{settings,name}' as name from public.portfolio_publications"), [{ name: 'Draft one' }]);
});

test('import keeps the replaced draft as a recovery copy and does not publish', async () => {
 assert.deepEqual(await as(db, owner, 'select public.import_draft(2, $1::jsonb)', [doc(c => { c.settings.name = 'Imported'; })]), [{ import_draft: 3 }]);
 const [row] = await as<{ name: string; recovered: string }>(db, owner, "select content #>> '{settings,name}' as name, recovery #>> '{settings,name}' as recovered from public.portfolio_drafts");
 assert.deepEqual(row, { name: 'Imported', recovered: 'Draft two' });
 assert.equal((await published()).name, 'Draft one');
});

test('media is accepted only under registered names, published only once copied, and removed only when unused', async () => {
 assert.equal(await outcome(as(db, owner, "select public.register_media('image/svg+xml', 10, 1, 1)")), 'PT422 Choose a PNG, JPEG, or WebP image.');
 assert.equal(await outcome(as(db, owner, "select public.register_media('image/webp', 20000000, 1, 1)")), 'PT422 Choose images smaller than 10 MB each.');
 const [{ file }] = await as<{ file: string }>(db, owner, "select public.register_media('image/webp', 2048, 640, 480, 'Portrait') as file");
 assert.match(file, /^[0-9a-f-]{36}\.webp$/);
 const upload = (actor: Actor, bucket: string, name: string) => as(db, actor, 'insert into storage.objects (bucket_id, name) values ($1, $2)', [bucket, name]);
 assert.match(await outcome(upload(owner, 'portfolio-drafts', 'unregistered.webp')), /row-level security/);
 assert.match(await outcome(upload(stranger, 'portfolio-drafts', file)), /row-level security/);
 assert.equal(await outcome(upload(owner, 'portfolio-drafts', file)), 'ok');
 assert.deepEqual(await as(db, stranger, 'select name from storage.objects'), [], 'draft uploads stay private');
 assert.deepEqual(await as(db, 'anon', 'select name from storage.objects'), []);
 await save(owner, 3, doc(c => { c.settings.portrait = 'media:' + file; }));
 assert.match(await outcome(publish(owner, 4)), /^PT422 An image \(.+\) is not ready for publishing/);
 assert.equal((await published()).revision, 1, 'a failed publish changes nothing');
 assert.equal(await outcome(upload(owner, 'portfolio-media', file)), 'ok', 'copy to the public bucket');
 assert.deepEqual(await publish(owner, 4), [{ publish_draft: 4 }]);
 assert.equal((await as<{ done: boolean }>(db, owner, 'select published_at is not null as done from public.media_assets where file = $1', [file]))[0].done, true);
 assert.equal(await outcome(as(db, owner, 'select public.remove_unused_media($1)', [file])), 'PT422 This image is still used by the draft or the published portfolio.');
 assert.deepEqual(await as(db, owner, "delete from storage.objects where name = $1 returning name", [file]), [], 'referenced objects cannot be deleted');
 assert.deepEqual(await as(db, owner, "update storage.objects set name = 'other.webp' where name = $1 returning name", [file]), [], 'published names are immutable');
 await save(owner, 4, doc());
 assert.match(await outcome(as(db, owner, 'select public.remove_unused_media($1)', [file])), /still used/, 'the publication still shows it');
 await publish(owner, 5);
 assert.equal(await outcome(as(db, owner, 'select public.remove_unused_media($1)', [file])), 'ok');
 assert.equal((await as(db, owner, 'delete from storage.objects where name = $1 returning name', [file])).length, 2, 'both copies removed once unused');
});

test('function execute grants are explicit', async () => {
 const rows = await as<{ fn: string; anon: boolean; auth: boolean }>(db, 'admin', `
  select n.nspname || '.' || p.proname as fn, has_function_privilege('anon', p.oid, 'execute') as anon, has_function_privilege('authenticated', p.oid, 'execute') as auth
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname in ('public', 'portfolio_internal') order by 1`);
 for (const row of rows) {
  assert.equal(row.anon, row.fn.startsWith('portfolio_internal.is_editor'), row.fn + ' anon');
  assert.equal(row.auth, row.fn.startsWith('portfolio_internal.is_editor') || row.fn.startsWith('public.'), row.fn + ' authenticated');
 }
 const definers = await as<{ fn: string; config: string[] }>(db, 'admin', `select n.nspname || '.' || p.proname as fn, p.proconfig as config from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'portfolio_internal') and p.prosecdef`);
 for (const row of definers) assert.deepEqual(row.config, ['search_path=""'], row.fn + ' pins search_path');
});
