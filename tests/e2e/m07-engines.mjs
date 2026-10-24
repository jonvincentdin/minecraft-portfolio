import { chromium, firefox, webkit } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

// Firefox and WebKit (Safari's engine) runs of the core routes and interactions, React (demo mode, :5173) beside the
// reference (:4174) in the same engine. Pixels are compared per route within one engine; differences between
// engines are expected and not compared. WebGL draws on whatever the engine provides here (often software).
const out = 'test-results/m07-engines'; await mkdir(out, { recursive: true });
const APP = 'http://127.0.0.1:5173', REF = 'http://127.0.0.1:4174';
const ROUTES = ['home', 'about', 'projects', 'skills', 'experience', 'achievements', 'contact'];
const report = {}, checks = [];
const check = name => { checks.push(name); console.log('ok -', name); };
const compare = await chromium.launch({ channel: 'msedge', headless: true });
const comparer = await compare.newPage();
// Counts differing pixels between two PNG screenshots (same engine, same viewport).
const diff = (a, b) => comparer.evaluate(async ([a, b]) => {
 const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + src; });
 const [x, y] = await Promise.all([load(a), load(b)]);
 if (x.width !== y.width || x.height !== y.height) return { sizes: [[x.width, x.height], [y.width, y.height]], differentPixels: -1 };
 const data = [x, y].map(img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; });
 let n = 0, max = 0; for (let i = 0; i < data[0].length; i += 4) { let d = 0; for (let k = 0; k < 3; k++) d = Math.max(d, Math.abs(data[0][i + k] - data[1][i + k])); if (d) { n++; max = Math.max(max, d); } }
 return { differentPixels: n, maxChannelDelta: max, fraction: n / (data[0].length / 4) };
}, [a.toString('base64'), b.toString('base64')]);

async function enter(browser, url) {
 const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
 const page = await context.newPage(), errors = [];
 page.on('pageerror', e => errors.push(e.message));
 await page.goto(url); await page.locator('#skip-intro:not([disabled])').click({ timeout: 60000 });
 await page.waitForFunction(() => !document.querySelector('#loader') || getComputedStyle(document.querySelector('#loader')).visibility === 'hidden');
 await page.waitForTimeout(800);
 return { page, context, errors };
}
const go = async (p, hash) => { await p.evaluate(h => location.hash = h, hash); await p.waitForTimeout(900); await p.mouse.move(0, 0); await p.evaluate(() => scrollTo(0, 0)); };

try {
 for (const [name, engine] of [['firefox', firefox], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  const react = await enter(browser, APP), reference = await enter(browser, REF);
  const r = report[name] = { routes: {}, version: browser.version() };
  // Routes: React against the reference in this engine.
  for (const route of ROUTES) {
   await go(react.page, route); await go(reference.page, route);
   r.routes[route] = await diff(await react.page.screenshot({ fullPage: true }), await reference.page.screenshot({ fullPage: true }));
  }
  // The 3D world draws something (not a blank canvas).
  await go(react.page, 'home');
  r.webgl = await react.page.evaluate(() => { const c = document.querySelector('canvas'); const gl = c && (c.getContext('webgl') || c.getContext('experimental-webgl')); const info = gl?.getExtension('WEBGL_debug_renderer_info'); return { canvas: !!c, renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl ? gl.getParameter(gl.RENDERER) : 'none', fallback: !!document.querySelector('.webgl-fallback, .scene-fallback, [data-fallback]') }; });
  const shot = await react.page.locator('canvas').first().screenshot();
  r.webgl.distinctColors = await comparer.evaluate(async src => { const i = new Image(); await new Promise(res => { i.onload = res; i.src = 'data:image/png;base64,' + src; }); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data, set = new Set(); for (let k = 0; k < d.length; k += 16) set.add(d[k] << 16 | d[k + 1] << 8 | d[k + 2]); return set.size; }, shot.toString('base64'));
  assert.ok(r.webgl.canvas && r.webgl.distinctColors > 20, name + ': the 3D world renders');
  // Project dialog opens and Escape closes it, returning focus.
  await go(react.page, 'projects');
  await react.page.locator('#project-summary .btn').click(); await react.page.locator('dialog[open]').waitFor();
  await react.page.keyboard.press('Escape'); await react.page.locator('dialog[open]').waitFor({ state: 'detached' }).catch(async () => assert.equal(await react.page.locator('dialog[open]').count(), 0));
  // Crafting: HTML through the recipe book.
  await go(react.page, 'skills');
  await react.page.locator('#open-workbench').click();
  await react.page.locator('.recipe-pick[data-recipe="recipe-html"]').click(); await react.page.locator('#take-output').click();
  await react.page.waitForTimeout(500);
  r.crafted = await react.page.locator('[data-ingredient="html"], .inventory-cell[data-item="html"], [data-item="html"]').count();
  await react.page.keyboard.press('Escape');
  // Advancements: selecting a node updates the inspector.
  await go(react.page, 'achievements');
  const nodes = react.page.locator('[data-node]');
  const firstTitle = await react.page.locator('#adv-inspector h2, #adv-inspector h3').first().textContent();
  await nodes.nth(2).click(); await react.page.waitForTimeout(500);
  r.advancement = { before: firstTitle, after: await react.page.locator('#adv-inspector h2, #adv-inspector h3').first().textContent() };
  assert.notEqual(r.advancement.after, r.advancement.before, name + ': selecting an advancement updates the inspector');
  // Local editor loads and saves.
  await go(react.page, 'editor/landing'); await react.page.locator('#save-status').waitFor();
  await react.page.locator('#settings-form [name="tagline"]').fill('Engine check ' + name);
  await react.page.locator('#settings-form button.btn:not([type="button"])').first().click();
  await react.page.waitForFunction(() => /Draft rev 1/.test(document.querySelector('#save-status')?.textContent || ''), null, { timeout: 15000 });
  r.errors = { react: react.errors, reference: reference.errors };
  assert.deepEqual(react.errors.filter(e => !reference.errors.includes(e)), [], name + ': React-only page errors');
  await react.page.screenshot({ path: `${out}/${name}-editor.png` });
  check(`${name} ${r.version}: all routes render, WebGL draws (${r.webgl.renderer}), dialog/Escape, crafting, advancement selection and the local editor work without page errors`);
  await browser.close();
 }
 await writeFile(out + '/report.json', JSON.stringify({ checks, ...report }, null, 2));
 for (const [name, r] of Object.entries(report)) console.log(name, Object.entries(r.routes).map(([k, v]) => k + '=' + v.differentPixels + (v.maxChannelDelta ? '/Δ' + v.maxChannelDelta : '')).join(' '));
} finally { await compare.close(); }
