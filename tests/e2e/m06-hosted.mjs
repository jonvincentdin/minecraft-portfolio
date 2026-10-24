import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

// M06 acceptance against a real Supabase project (not the emulator). Requires, from the environment only:
//   .env.local (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY), M06_OWNER_EMAIL, M06_OWNER_PASSWORD,
//   SUPABASE_SECRET_KEY (used here for test setup and cleanup only; never sent to the browser).
// It creates a temporary non-enrolled user, exercises the flows, then deletes every draft, publication,
// media record, stored object and temporary user it created, leaving the project empty for the owner.
const out = 'test-results/m06-hosted'; await mkdir(out, { recursive: true });
const env = Object.fromEntries((await readFile('.env.local', 'utf8')).split(/\r?\n/).filter(l => /^\w+=/.test(l)).map(l => l.split(/=(.*)/s).slice(0, 2)));
const URL_ = env.VITE_SUPABASE_URL, KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY, SECRET = process.env.SUPABASE_SECRET_KEY;
const OWNER = { email: process.env.M06_OWNER_EMAIL, password: process.env.M06_OWNER_PASSWORD };
assert.ok(URL_ && KEY && SECRET && OWNER.email && OWNER.password, 'missing configuration');
const APP = 'http://127.0.0.1:5176';
const admin = { apikey: SECRET, 'content-type': 'application/json' };
const anon = { apikey: KEY, 'content-type': 'application/json' };
const api = async (path, init = {}) => { const r = await fetch(URL_ + path, init); const text = await r.text(); let body; try { body = JSON.parse(text); } catch { body = text; } return { status: r.status, body }; };

const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5176', '--strictPort'], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) { try { await fetch(APP); break; } catch { await new Promise(r => setTimeout(r, 500)); } }

const stranger = { email: `m06-stranger-${randomBytes(4).toString('hex')}@example.com`, password: randomBytes(18).toString('base64url') };
const created = await api('/auth/v1/admin/users', { method: 'POST', headers: admin, body: JSON.stringify({ ...stranger, email_confirm: true }) });
assert.equal(created.status, 200, JSON.stringify(created.body)); stranger.id = created.body.id;

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [], checks = [], observed = {};
const check = name => { checks.push(name); console.log('ok -', name); };
const context = () => browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const go = async (p, hash) => { await p.evaluate(h => location.hash = h, hash); await p.waitForTimeout(300); };
async function open(c, hash) { const p = await c.newPage(); p.on('pageerror', e => errors.push(e.message)); await p.goto(APP); await p.locator('#skip-intro:not([disabled])').click({ timeout: 30000 }); await p.locator('#loader').waitFor({ state: 'detached' }); if (hash) await go(p, hash); return p; }
async function signIn(p, who, scope = '') { await p.locator(scope + ' #sign-in-form [name="email"]').fill(who.email); await p.locator(scope + ' #sign-in-form [name="password"]').fill(who.password); await p.locator(scope + ' #sign-in-form button[type="submit"]').click(); }
const statusIs = (p, pattern) => p.waitForFunction(s => new RegExp(s).test(document.querySelector('#save-status')?.textContent || ''), pattern.source, { timeout: 20000 });
async function saveSettings(p, values) { for (const [k, v] of Object.entries(values)) await p.locator(`#settings-form [name="${k}"]`).fill(v); await p.locator('#settings-form button.btn:not([type="button"])').first().click(); }
const token = p => p.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.endsWith('-auth-token')))).access_token);
const asUser = (t, path, init = {}) => api(path, { ...init, headers: { ...anon, authorization: 'Bearer ' + t, ...(init.headers || {}) } });

try {
 // Anonymous API access
 assert.deepEqual((await api('/rest/v1/portfolio_publications?select=revision', { headers: anon })).body, []);
 for (const table of ['portfolio_drafts', 'portfolio_editors', 'media_assets']) assert.equal((await api(`/rest/v1/${table}?select=*`, { headers: anon })).status, 401, table);
 const anonSave = await api('/rest/v1/rpc/save_draft', { method: 'POST', headers: anon, body: '{"expected_revision":0,"content":{}}' });
 assert.equal(anonSave.status, 401); observed.anonSave = anonSave.body;
 check('anonymous requests read only the (empty) publication; drafts, membership, media and RPCs are refused (401)');

 // Visitor UI before publishing
 const visitorContext = await context(), visitor = await open(visitorContext);
 assert.match(await visitor.locator('.foundation-notice[role="status"]').first().textContent(), /Nothing has been published yet/);
 const png = Buffer.from(await visitor.evaluate(() => { const c = document.createElement('canvas'); c.width = 60; c.height = 80; c.getContext('2d').fillStyle = '#c96'; c.getContext('2d').fillRect(0, 0, 60, 80); return c.toDataURL('image/png').split(',')[1]; }), 'base64');
 check('visitors see the labelled sample world');

 // Sign-up is disabled
 const signup = await api('/auth/v1/signup', { method: 'POST', headers: anon, body: JSON.stringify({ email: 'm06-signup@example.com', password: randomBytes(12).toString('hex') }) });
 assert.ok(signup.status >= 400, 'sign-up must be refused'); observed.signup = { status: signup.status, code: signup.body?.error_code ?? signup.body?.code };
 check('public sign-up is disabled (' + signup.status + ')');

 // Non-enrolled account
 const sc = await context(), sp = await open(sc, 'editor');
 await signIn(sp, stranger); await sp.locator('#not-enrolled').waitFor({ timeout: 20000 });
 const st = await token(sp);
 const strangerSave = await asUser(st, '/rest/v1/rpc/save_draft', { method: 'POST', body: '{"expected_revision":0,"content":{}}' });
 assert.equal(strangerSave.status, 403); observed.strangerSave = strangerSave.body;
 assert.equal((await asUser(st, '/rest/v1/rpc/register_media', { method: 'POST', body: '{"mime":"image/webp","size_bytes":10,"width":1,"height":1}' })).status, 403);
 assert.equal((await asUser(st, '/rest/v1/portfolio_editors', { method: 'POST', body: JSON.stringify({ user_id: stranger.id, role: 'owner' }) })).status, 403, 'no self-enrollment');
 assert.deepEqual((await asUser(st, '/rest/v1/portfolio_drafts?select=revision')).body, []);
 await sp.screenshot({ path: out + '/not-enrolled.png' });
 check('a signed-in account that is not enrolled sees the not-enrolled state and is refused by the database (403)');

 // Owner draft
 const oc = await context(), owner = await open(oc, 'editor/landing');
 await signIn(owner, OWNER); await owner.locator('#backend-mode-notice').waitFor({ timeout: 20000 });
 await saveSettings(owner, { name: 'Hosted check (draft)' }); await statusIs(owner, /^Draft rev 1 saved · not published$/);
 assert.deepEqual((await api('/rest/v1/portfolio_publications?select=revision', { headers: anon })).body, [], 'saving never publishes');
 const ot = await token(owner);
 const stale = await asUser(ot, '/rest/v1/rpc/save_draft', { method: 'POST', body: JSON.stringify({ expected_revision: 0, content: JSON.parse(await readFile('src/data/demo-content.json', 'utf8')) }) });
 assert.equal(stale.status, 409); assert.equal(stale.body.code, 'PT409'); assert.equal(stale.body.details, '1'); observed.stale = stale.body;
 const invalid = await asUser(ot, '/rest/v1/rpc/save_draft', { method: 'POST', body: JSON.stringify({ expected_revision: 1, content: { version: 5, settings: { name: 'x' } } }) });
 assert.equal(invalid.status, 422); assert.equal(invalid.body.message, 'Invalid workshop configuration.'); observed.invalid = invalid.body;
 check('the owner saves a private draft; the hosted API returns PT409 with the current revision (409) and validation errors (422)');

 // Upload stays private, signed URL in another session
 await go(owner, 'editor/about');
 await owner.locator('#portrait-upload').setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: png });
 await statusIs(owner, /^Draft rev 2 saved/);
 const [media] = (await api('/rest/v1/media_assets?select=file,width,height,mime,published_at', { headers: admin })).body;
 assert.deepEqual([media.mime, media.width, media.height, media.published_at], ['image/webp', 60, 80, null]);
 const publicUrl = `${URL_}/storage/v1/object/public/portfolio-media/${media.file}`;
 assert.ok((await fetch(publicUrl)).status >= 400, 'not public before publishing');
 assert.ok((await fetch(`${URL_}/storage/v1/object/public/portfolio-drafts/${media.file}`)).status >= 400, 'drafts bucket is private');
 const oc2 = await context(), owner2 = await open(oc2, 'editor/about');
 await signIn(owner2, OWNER); await owner2.locator('#portrait-editor-preview').waitFor({ timeout: 20000 });
 assert.match(await owner2.locator('#portrait-editor-preview').getAttribute('src'), /\/storage\/v1\/object\/sign\/portfolio-drafts\//);
 assert.ok(await owner2.locator('#portrait-editor-preview').evaluate(img => img.decode().then(() => img.naturalWidth > 0)));
 check('an upload is stored privately as resized WebP and shown to a second owner session through a signed URL');

 // Publish
 await owner.locator('#publish-draft').click(); await owner.locator('#detail .btn:not(.secondary)').click();
 await owner.waitForFunction(() => /Revision 2 is now public/.test(document.querySelector('#toast')?.textContent || ''), null, { timeout: 20000 });
 const pub = (await api("/rest/v1/portfolio_publications?select=revision,content->settings->>name", { headers: anon })).body[0];
 assert.deepEqual([pub.revision, pub.name], [2, 'Hosted check (draft)']);
 assert.equal((await fetch(publicUrl)).status, 200);
 await visitor.reload(); await visitor.locator('#skip-intro:not([disabled])').click({ timeout: 30000 }); await visitor.locator('#loader').waitFor({ state: 'detached' }); await go(visitor, 'about');
 assert.equal(await visitor.locator('#portrait-frame img').getAttribute('src'), publicUrl);
 assert.ok(await visitor.locator('#portrait-frame img').evaluate(img => img.decode().then(() => img.naturalWidth > 0)));
 await visitor.screenshot({ path: out + '/visitor-published.png' });
 check('publishing copies the image to the public bucket and visitors see revision 2 with the image');

 // Sessions persist across reloads
 await owner.reload(); await owner.locator('#skip-intro:not([disabled])').click({ timeout: 30000 }); await owner.locator('#loader').waitFor({ state: 'detached' });
 await go(owner, 'editor/landing'); await owner.locator('#backend-mode-notice').waitFor({ timeout: 20000 });
 check('the owner session persists across a reload');

 // Concurrent sessions
 await go(owner2, 'editor/landing'); await owner2.locator('#settings-form').waitFor();
 await saveSettings(owner2, { tagline: 'From the second session' }); await statusIs(owner2, /^Draft rev 3 saved/);
 await saveSettings(owner, { heroLabel: 'Stale edit' }); await owner.locator('.conflict-notice').waitFor({ timeout: 20000 });
 assert.match(await owner.locator('.conflict-notice').textContent(), /now revision 3/);
 assert.equal(await owner.locator('#settings-form [name="heroLabel"]').inputValue(), 'Stale edit');
 check('a stale session gets the conflict with the current revision and keeps its edit');

 // Sign out
 await owner2.locator('#sign-out').click(); await owner2.locator('#sign-in-form').waitFor();
 check('sign-out returns to the sign-in screen');

 assert.deepEqual(errors, []);
 await writeFile(out + '/report.json', JSON.stringify({ project: URL_, checks, observed, errors }, null, 2));
 console.log(`\n${checks.length} hosted M06 checks passed.`);
} finally {
 await browser.close(); vite.kill();
 // Cleanup: leave the project empty for the owner.
 const files = (await api('/rest/v1/media_assets?select=file', { headers: admin })).body.map(x => x.file);
 for (const bucket of ['portfolio-drafts', 'portfolio-media']) if (files.length) await api(`/storage/v1/object/${bucket}`, { method: 'DELETE', headers: admin, body: JSON.stringify({ prefixes: files }) });
 for (const table of ['media_assets', 'portfolio_publications', 'portfolio_drafts']) await api(`/rest/v1/${table}?portfolio_id=eq.jvd-world`, { method: 'DELETE', headers: admin });
 await api(`/auth/v1/admin/users/${stranger.id}`, { method: 'DELETE', headers: admin });
 const left = await Promise.all(['media_assets', 'portfolio_publications', 'portfolio_drafts'].map(t => api(`/rest/v1/${t}?select=portfolio_id`, { headers: admin })));
 console.log('cleanup: remaining rows', left.map(x => x.body.length).join('/'));
}
