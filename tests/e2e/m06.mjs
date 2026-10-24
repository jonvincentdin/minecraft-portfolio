import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

// M06 browser acceptance in backend mode: the real UI and supabase-js against tests/e2e/supabase-emulator.ts,
// which runs the actual migrations, RLS and RPCs in PGlite. It is not the hosted service; see M06_VERIFICATION.md.
const out = 'test-results/m06'; await mkdir(out, { recursive: true });
const EMU = 'http://127.0.0.1:54330', APP = 'http://127.0.0.1:5175';
const children = [];
function start(args, env) {
 const child = spawn(process.execPath, args, { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
 child.stderr.on('data', d => process.stderr.write(d)); children.push(child); return child;
}
async function waitFor(url) { for (let i = 0; i < 60; i++) { try { await fetch(url); return; } catch { await new Promise(r => setTimeout(r, 500)); } } throw Error('Not reachable: ' + url); }
start(['node_modules/tsx/dist/cli.mjs', 'tests/e2e/supabase-emulator.ts'], { EMULATOR_PORT: '54330' });
start(['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5175', '--strictPort'], { VITE_CONTENT_MODE: 'supabase', VITE_SUPABASE_URL: EMU, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_emulator' });
await waitFor(EMU + '/rest/v1/portfolio_publications'); await waitFor(APP);

const sql = async query => { const r = await fetch(EMU + '/__test/sql', { method: 'POST', body: query }); assert.ok(r.ok, await r.clone().text()); return r.json(); };
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [], checks = [];
const check = name => { checks.push(name); console.log('ok -', name); };
const OWNER = { email: 'owner@example.test', password: 'correct horse battery' }, STRANGER = { email: 'stranger@example.test', password: 'correct horse battery' };
let png;

async function open(c, hash = '') {
 const p = await c.newPage();
 p.on('pageerror', e => errors.push(e.message));
 await p.goto(APP); await p.locator('#skip-intro:not([disabled])').click(); await p.locator('#loader').waitFor({ state: 'detached' });
 if (hash) await go(p, hash.slice(1));
 return p;
}
const context = () => browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', acceptDownloads: true });
const go = async (p, hash) => { await p.evaluate(h => location.hash = h, hash); await p.waitForTimeout(250); };
const statusIs = (p, pattern) => p.waitForFunction(source => new RegExp(source).test(document.querySelector('#save-status')?.textContent || ''), pattern.source, { timeout: 10000 });
const toastShows = (p, pattern) => p.waitForFunction(source => new RegExp(source).test(document.querySelector('#toast')?.textContent || ''), pattern.source, { timeout: 10000 });
async function signIn(p, who, scope = '') {
 await p.locator(scope + ' #sign-in-form [name="email"]').fill(who.email); await p.locator(scope + ' #sign-in-form [name="password"]').fill(who.password);
 await p.locator(scope + ' #sign-in-form button[type="submit"]').click();
}
async function saveSettings(p, values) {
 for (const [name, value] of Object.entries(values)) await p.locator(`#settings-form [name="${name}"]`).fill(value);
 await p.locator('#settings-form button.btn:not([type="button"])').first().click();
}
const published = async () => (await sql("select revision::int, content #>> '{settings,name}' as name, content #>> '{settings,portrait}' as portrait from public.portfolio_publications"))[0];

try {
 // ---- Visitors before anything is published ----
 const visitorContext = await context();
 const visitor = await open(visitorContext);
 assert.match(await visitor.locator('.foundation-notice[role="status"]').first().textContent(), /Nothing has been published yet · showing the sample world/);
 png = Buffer.from(await visitor.evaluate(() => { const c = document.createElement('canvas'); c.width = 60; c.height = 80; const g = c.getContext('2d'); g.fillStyle = '#c96'; g.fillRect(0, 0, 60, 80); return c.toDataURL('image/png').split(',')[1]; }), 'base64');
 // The notice holds its place but stays invisible during the intro, so it never flashes ahead of the page reveal.
 const intro = await visitorContext.newPage();
 await intro.goto(APP); await intro.locator('#skip-intro:not([disabled])').waitFor();
 assert.equal(await intro.locator('.publish-notice').evaluate(n => getComputedStyle(n).opacity), '0');
 const heroTop = await intro.locator('.hero').evaluate(h => h.getBoundingClientRect().top);
 await intro.locator('#skip-intro').click(); await intro.locator('#loader').waitFor({ state: 'detached' });
 await intro.waitForFunction(() => getComputedStyle(document.querySelector('.publish-notice')).opacity === '1');
 assert.equal(await intro.locator('.hero').evaluate(h => h.getBoundingClientRect().top), heroTop, 'no layout shift when the notice appears');
 await intro.close();
 check('visitors see the labelled sample world while nothing is published; the notice fades in only after the intro, without shifting the page');
 await go(visitor, 'editor');
 await visitor.locator('#sign-in-form').waitFor();
 assert.equal(await visitor.locator('#publish-draft').count(), 0);
 await visitor.screenshot({ path: out + '/sign-in.png' });
 check('the editor asks visitors to sign in and shows no editing controls');

 // ---- Sign-in failures and a non-enrolled account ----
 const strangerContext = await context(), stranger = await open(strangerContext, '#editor');
 await signIn(stranger, { ...STRANGER, password: 'wrong' });
 await stranger.locator('#sign-in-error').waitFor(); assert.match(await stranger.locator('#sign-in-error').textContent(), /do not match an account/);
 await signIn(stranger, STRANGER);
 await stranger.locator('#not-enrolled').waitFor();
 assert.match(await stranger.locator('#not-enrolled').textContent(), /stranger@example\.test.*not enrolled/);
 assert.equal(await stranger.locator('#settings-form').count(), 0);
 const strangerDenied = await stranger.evaluate(async url => (await fetch(url + '/rest/v1/rpc/save_draft', { method: 'POST', headers: { 'content-type': 'application/json', apikey: 'x', authorization: 'Bearer ' + JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.endsWith('-auth-token')))).access_token }, body: '{"expected_revision":0,"content":{}}' })).status, EMU);
 assert.equal(strangerDenied, 403);
 await stranger.screenshot({ path: out + '/not-enrolled.png' });
 await stranger.locator('#sign-out').click(); await stranger.locator('#sign-in-form').waitFor();
 check('wrong passwords and non-enrolled accounts are refused, in the UI and by the database (403)');

 // ---- Enrolled owner: draft saves stay private ----
 await sql("insert into public.portfolio_editors (user_id, role) values ('00000000-0000-4000-8000-000000000001', 'owner')");
 const ownerContext = await context(), owner = await open(ownerContext, '#editor/landing');
 await signIn(owner, OWNER);
 await owner.locator('#backend-mode-notice').waitFor();
 assert.match(await owner.locator('.editor-mode').textContent(), /SHARED DRAFT/);
 assert.match(await owner.locator('#backend-mode-notice').textContent(), /Signed in as owner@example\.test/);
 await statusIs(owner, /No draft saved yet · not published/);
 await saveSettings(owner, { name: 'Jon (draft one)' });
 await statusIs(owner, /^Draft rev 1 saved · not published$/);
 assert.deepEqual(await sql("select revision::int, content #>> '{settings,name}' as name from public.portfolio_drafts"), [{ revision: 1, name: 'Jon (draft one)' }]);
 assert.equal(await published(), undefined);
 await visitor.reload(); await visitor.locator('#skip-intro:not([disabled])').click(); await visitor.locator('#loader').waitFor({ state: 'detached' });
 assert.ok(!(await visitor.locator('header').textContent()).includes('draft one'), 'visitors never see the draft');
 await owner.screenshot({ path: out + '/editor-saved.png' });
 check('the enrolled owner saves a revision-guarded draft that visitors cannot see');

 // ---- Upload a portrait: private until published ----
 await go(owner, 'editor/about');
 await owner.locator('#portrait-upload').setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: png });
 await statusIs(owner, /^Draft rev 2 saved/);
 const src = await owner.locator('#portrait-editor-preview').getAttribute('src');
 assert.match(src, /^blob:/, 'the fresh upload shows from this browser');
 const [media] = await sql('select file, mime, width, height, published_at from public.media_assets');
 assert.deepEqual([media.mime, media.width, media.height, media.published_at], ['image/webp', 60, 80, null]);
 assert.equal((await fetch(`${EMU}/storage/v1/object/public/portfolio-media/${media.file}`)).status, 404, 'not public before publishing');
 assert.equal((await fetch(`${EMU}/storage/v1/object/public/portfolio-drafts/${media.file}`)).status, 404, 'the drafts bucket is private');
 // A fresh session shows the draft-only upload through a signed URL.
 const secondContext = await context(), second = await open(secondContext, '#editor/about');
 await signIn(second, OWNER); await second.locator('#portrait-editor-preview').waitFor();
 assert.match(await second.locator('#portrait-editor-preview').getAttribute('src'), /\/storage\/v1\/object\/sign\/portfolio-drafts\//);
 assert.ok(await second.locator('#portrait-editor-preview').evaluate(img => img.decode().then(() => img.naturalWidth > 0)));
 check('uploads are registered, stored privately as resized WebP, and shown to editors through signed URLs');

 // ---- A failed upload leaves no media record behind and changes nothing ----
 await owner.route('**/storage/v1/object/portfolio-drafts/**', route => route.request().method() === 'POST' ? route.abort('failed') : route.continue());
 await owner.locator('#portrait-upload').setInputFiles({ name: 'second.png', mimeType: 'image/png', buffer: png });
 await toastShows(owner, /could not be uploaded/);
 await owner.unroute('**/storage/v1/object/portfolio-drafts/**');
 assert.deepEqual((await sql('select count(*)::int as n from public.media_assets'))[0].n, 1, 'the failed registration was removed');
 assert.equal((await sql('select revision::int from public.portfolio_drafts'))[0].revision, 2, 'the draft is unchanged');
 assert.equal(await owner.locator('#portrait-editor-preview').getAttribute('src'), src, 'the previous portrait stays');
 check('a failed upload is reported, its reservation is cleaned up, and the draft keeps the previous image');

 // ---- Preview, then publish ----
 await owner.locator('#preview-section').click(); await owner.locator('.preview-banner').waitFor();
 assert.match(await owner.locator('.preview-banner').textContent(), /Draft preview · draft revision 2 · not published/);
 assert.ok(await owner.locator('#portrait-frame img').evaluate(img => img.decode().then(() => img.naturalWidth > 0)));
 await owner.locator('.preview-banner a').click(); await owner.locator('#publish-draft').waitFor();
 await owner.locator('#publish-draft').click();
 assert.match(await owner.locator('#detail').textContent(), /Every visitor will see this revision/);
 await owner.locator('#detail .btn:not(.secondary)').click();
 await toastShows(owner, /Revision 2 is now public\./);
 await statusIs(owner, /^Draft rev 2 saved · published rev 2$/);
 const pub = await published();
 assert.deepEqual([pub.revision, pub.name, pub.portrait], [2, 'Jon (draft one)', 'media:' + media.file]);
 assert.equal((await fetch(`${EMU}/storage/v1/object/public/portfolio-media/${media.file}`)).status, 200);
 await visitor.reload(); await visitor.locator('#skip-intro:not([disabled])').click(); await visitor.locator('#loader').waitFor({ state: 'detached' });
 await go(visitor, 'about');
 assert.equal(await visitor.locator('.foundation-notice[role="status"]').count(), 0, 'the sample-world notice is gone');
 assert.equal(await visitor.locator('#portrait-frame img').getAttribute('src'), `${EMU}/storage/v1/object/public/portfolio-media/${media.file}`);
 assert.ok(await visitor.locator('#portrait-frame img').evaluate(img => img.decode().then(() => img.naturalWidth > 0)));
 await visitor.screenshot({ path: out + '/visitor-published.png' });
 check('publishing copies the upload to its public name and publishes exactly the saved revision to visitors');

 // ---- Concurrent editors: the stale save is refused and edits are kept ----
 await go(second, 'editor/landing'); await second.locator('#settings-form').waitFor();
 await saveSettings(second, { tagline: 'Saved from the second session' });
 await statusIs(second, /^Draft rev 3 saved/);
 await go(owner, 'editor/landing'); await owner.locator('#settings-form').waitFor();
 await saveSettings(owner, { heroLabel: 'Stale tab edit' });
 await owner.locator('.conflict-notice').waitFor();
 assert.match(await owner.locator('.conflict-notice').textContent(), /changed elsewhere \(now revision 3\).*edits were kept/);
 assert.equal(await owner.locator('#settings-form [name="heroLabel"]').inputValue(), 'Stale tab edit');
 assert.equal((await sql("select revision::int from public.portfolio_drafts"))[0].revision, 3);
 await owner.screenshot({ path: out + '/conflict.png' });
 await owner.locator('#conflict-overwrite').click();
 await statusIs(owner, /^Draft rev 4 saved/);
 assert.equal((await sql("select content #>> '{settings,heroLabel}' as label from public.portfolio_drafts"))[0].label, 'Stale tab edit');
 check('a stale save is refused with the current revision, keeps the edit, and saves only on explicit choice');

 // ---- Session expiry: failed saves keep input ----
 await sql('select 1'); await fetch(EMU + '/__test/expire-sessions', { method: 'POST' });
 await saveSettings(owner, { tagline: 'Written after the session ended' });
 await owner.locator('#retry-save').waitFor({ timeout: 15000 });
 assert.match(await owner.locator('#save-status').textContent(), /Signed out — your edits were kept, not saved|Not saved/);
 assert.equal(await owner.locator('#settings-form [name="tagline"]').inputValue(), 'Written after the session ended');
 assert.equal((await sql("select revision::int from public.portfolio_drafts"))[0].revision, 4, 'nothing was saved');
 await owner.screenshot({ path: out + '/session-ended.png' });
 const modalOpen = await owner.locator('#detail #sign-in-form').count();
 if (modalOpen) await signIn(owner, OWNER, '#detail');
 else { await owner.locator('#sign-out').click(); throw Error('expected the sign-in prompt over the kept editor'); }
 await owner.locator('#detail').waitFor({ state: 'detached' });
 await owner.locator('#retry-save').click();
 await statusIs(owner, /^Draft rev 5 saved/);
 assert.equal((await sql("select content #>> '{settings,tagline}' as t from public.portfolio_drafts"))[0].t, 'Written after the session ended');
 check('after the session ends, the failed save keeps the input; signing in again and retrying saves it');

 // ---- Changing the password ----
 await owner.locator('#change-password').click();
 await owner.locator('#password-form [name="current"]').fill('not the password');
 await owner.locator('#password-form [name="next"]').fill('a new long passphrase');
 await owner.locator('#password-form [name="repeat"]').fill('a new long passphrase');
 await owner.locator('#password-form button[type="submit"]').click();
 await owner.locator('#password-error').waitFor(); assert.match(await owner.locator('#password-error').textContent(), /current password is not correct\. Nothing was changed/);
 await owner.locator('#password-form [name="current"]').fill(OWNER.password);
 await owner.locator('#password-form [name="repeat"]').fill('a different passphrase');
 await owner.locator('#password-form button[type="submit"]').click();
 assert.match(await owner.locator('#password-error').textContent(), /do not match/);
 await owner.locator('#password-form [name="repeat"]').fill('a new long passphrase');
 await owner.locator('#password-form button[type="submit"]').click();
 await toastShows(owner, /Password changed/);
 await owner.screenshot({ path: out + '/password-changed.png' });
 const pwContext = await context(), pw = await open(pwContext, '#editor');
 await signIn(pw, OWNER); await pw.locator('#sign-in-error').waitFor(); assert.match(await pw.locator('#sign-in-error').textContent(), /do not match/);
 await signIn(pw, { ...OWNER, password: 'a new long passphrase' }); await pw.locator('#backend-mode-notice').waitFor();
 OWNER.password = 'a new long passphrase';
 check('changing the password needs the current one; afterwards only the new password signs in');

 // ---- Invalid documents are refused by the database even if the client is bypassed ----
 const bypass = await owner.evaluate(async url => {
  const key = Object.keys(localStorage).find(k => k.endsWith('-auth-token')), token = JSON.parse(localStorage.getItem(key)).access_token;
  const r = await fetch(url + '/rest/v1/rpc/save_draft', { method: 'POST', headers: { 'content-type': 'application/json', apikey: 'x', authorization: 'Bearer ' + token }, body: JSON.stringify({ expected_revision: 5, content: { version: 5, settings: { name: 'x' } } }) });
  return [r.status, (await r.json()).message];
 }, EMU);
 assert.deepEqual(bypass, [422, 'Invalid workshop configuration.']);
 check('the database validates the whole document (422) when the client is bypassed');

 // ---- A failing content service ends the loader with an explained retry ----
 const outageContext = await context(); const outage = await outageContext.newPage(); outage.on('pageerror', e => errors.push(e.message));
 await outageContext.route(EMU + '/rest/v1/**', route => route.abort('connectionrefused'));
 await outage.goto(APP);
 await outage.locator('#retry-content').waitFor({ timeout: 20000 });
 assert.match(await outage.locator('.foundation-notice[role="alert"]').textContent(), /published portfolio could not be loaded/);
 await outage.screenshot({ path: out + '/outage.png' });
 await outageContext.unroute(EMU + '/rest/v1/**');
 await outage.locator('#retry-content').click();
 await outage.locator('#skip-intro:not([disabled])').click(); await outage.locator('#loader').waitFor({ state: 'detached' });
 assert.match(await outage.locator('header').textContent(), /Jon \(draft one\)/);
 check('an unreachable service shows an error with Try again instead of a stuck loader, and recovers');

 // ---- No secrets in the bundle ----
 const env = await (await fetch(APP + '/src/lib/environment.ts')).text();
 assert.ok(!/service_role|SUPABASE_SERVICE/.test(env));
 check('only the URL and publishable key are configured in the browser');

 assert.deepEqual(errors, []);
 await writeFile(out + '/report.json', JSON.stringify({ checks, errors }, null, 2));
 console.log(`\n${checks.length} M06 checks passed.`);
} finally {
 await browser.close();
 for (const child of children) child.kill();
}
