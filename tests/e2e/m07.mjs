import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

// M07 sweep over every route plus the editor, React (demo mode, :5173) beside the immutable reference (:4174),
// at desktop and at a touch-emulated phone size. It checks console errors, landmarks, image alt text,
// accessible names, keyboard focus visibility, horizontal overflow and tap navigation, and records both sides
// so any finding can be attributed to the port or to the original design.
const out = 'test-results/m07'; await mkdir(out, { recursive: true });
const APP = 'http://127.0.0.1:5173', REF = 'http://127.0.0.1:4174';
const ROUTES = ['home', 'about', 'projects', 'skills', 'experience', 'achievements', 'contact', 'editor'];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { routes: {}, keyboard: {}, touch: {} }, checks = [];
const check = name => { checks.push(name); console.log('ok -', name); };

async function open(url, options = {}) {
 const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', ...options });
 const page = await context.newPage(), errors = [];
 page.on('pageerror', e => errors.push(e.message));
 page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
 await page.goto(url);
 await page.locator('#skip-intro:not([disabled])').click({ timeout: 30000 });
 await page.waitForFunction(() => !document.querySelector('#loader') || getComputedStyle(document.querySelector('#loader')).visibility === 'hidden' || document.querySelector('#loader').classList.contains('done'));
 await page.waitForTimeout(400);
 return { page, context, errors };
}
const go = async (p, hash) => { await p.evaluate(h => location.hash = h, hash); await p.waitForTimeout(600); };

// Everything a screen reader or keyboard user meets on the current page.
const audit = p => p.evaluate(() => {
 const visible = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('[inert],[hidden],[aria-hidden="true"]'); };
 const label = el => {
  if (el.getAttribute('aria-label')?.trim()) return el.getAttribute('aria-label').trim();
  const by = el.getAttribute('aria-labelledby'); if (by) return by.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim();
  if (el.labels?.length) return [...el.labels].map(l => l.textContent).join(' ').trim();
  const text = (el.innerText || el.textContent || '').trim(); if (text) return text;
  const img = el.querySelector?.('img[alt]'); if (img?.alt.trim()) return img.alt.trim();
  return (el.getAttribute('title') || el.getAttribute('placeholder') || '').trim();
 };
 const describe = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
 const controls = [...document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=button], [tabindex]:not([tabindex="-1"])')].filter(visible);
 return {
  lang: document.documentElement.lang, title: document.title,
  landmarks: ['header', 'nav', 'main', 'footer'].filter(tag => document.querySelector(tag)),
  imagesWithoutAlt: [...document.images].filter(visible).filter(img => !img.hasAttribute('alt')).map(describe),
  unnamedControls: controls.filter(el => !label(el)).map(describe),
  controls: controls.length,
  overflow: document.documentElement.scrollWidth - innerWidth,
 };
});

// Tabs through the page and records any focused element without a visible focus indicator.
async function tabWalk(p, steps = 30) {
 await p.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
 await p.locator('body').click({ position: { x: 1, y: 1 } }).catch(() => {});
 const seen = [], invisible = [];
 for (let i = 0; i < steps; i++) {
  await p.keyboard.press('Tab');
  const info = await p.evaluate(() => {
   const el = document.activeElement; if (!el || el === document.body) return null;
   const s = getComputedStyle(el), r = el.getBoundingClientRect();
   const outlined = x => { const c = getComputedStyle(x); return (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) || c.boxShadow !== 'none'; };
   // A ring may be drawn on the control or, through :focus-within, on its immediate wrapper.
   const ring = outlined(el) || (el.parentElement && el.parentElement.matches(':focus-within') && outlined(el.parentElement));
   return { id: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '[' + (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24) + ']', ring, onScreen: r.width > 0 && r.height > 0 };
  });
  if (!info) continue;
  seen.push(info.id);
  if (!info.ring || !info.onScreen) invisible.push(info.id);
 }
 return { visited: [...new Set(seen)].length, invisible: [...new Set(invisible)] };
}

try {
 // ---- Desktop sweep: React beside the reference ----
 const react = await open(APP), reference = await open(REF);
 for (const route of ROUTES) {
  await go(react.page, route); await go(reference.page, route);
  const [r, ref] = [await audit(react.page), await audit(reference.page)];
  report.routes[route] = { react: r, reference: ref };
  assert.equal(r.lang, 'en', route + ' lang');
  assert.ok(r.landmarks.includes('main'), route + ' has main');
  assert.deepEqual(r.imagesWithoutAlt, [], route + ' images need alt');
  assert.deepEqual(r.unnamedControls, [], route + ' controls need accessible names');
  assert.ok(r.overflow <= 0, route + ' horizontal overflow');
 }
 // Neither site declares an icon, so both log the browser's /favicon.ico 404; React may add no error of its own.
 report.consoleErrors = { react: react.errors, reference: reference.errors };
 assert.deepEqual(react.errors.filter(e => !reference.errors.includes(e)), [], 'React-only console errors');
 check('desktop: every route and the editor has lang, a main landmark, alt on every image, a name on every control, no overflow and no console errors');

 // ---- Keyboard focus visibility ----
 for (const route of ['home', 'projects', 'skills', 'achievements', 'contact', 'editor']) {
  await go(react.page, route); await go(reference.page, route);
  report.keyboard[route] = { react: await tabWalk(react.page), reference: await tabWalk(reference.page) };
  assert.deepEqual(report.keyboard[route].react.invisible, [], route + ': focus without a visible indicator');
  assert.ok(report.keyboard[route].react.visited >= 5, route + ': keyboard reaches controls');
 }
 check('keyboard: Tab reaches the controls on every checked route, and every focused control shows a focus indicator (the reference lacks one on the project search)');
 await react.context.close(); await reference.context.close();

 // ---- Phone with touch: React beside the reference ----
 const phone = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
 const rp = await open(APP, phone), fp = await open(REF, phone);
 for (const route of ROUTES) {
  await go(rp.page, route); await go(fp.page, route);
  const [r, ref] = [await audit(rp.page), await audit(fp.page)];
  report.touch[route] = { react: r, reference: ref };
  assert.ok(r.overflow <= 0, route + ' phone overflow ' + r.overflow);
  assert.deepEqual(r.unnamedControls, [], route + ' phone unnamed controls');
 }
 await go(rp.page, 'home');
 await rp.page.locator('nav a[href="#projects"]').first().tap();
 await rp.page.waitForFunction(() => location.hash === '#projects');
 const before = await rp.page.locator('#project-summary h2').textContent();
 await rp.page.locator('.inventory-grid button, [data-project]').nth(1).tap();
 await rp.page.waitForTimeout(400);
 report.touch.inventoryTap = { before, after: await rp.page.locator('#project-summary h2').textContent() };
 assert.notEqual(report.touch.inventoryTap.after, before, 'tapping another project updates the inspector');
 await rp.page.screenshot({ path: out + '/phone-projects.png' });
 report.consoleErrors.phone = { react: rp.errors, reference: fp.errors };
 assert.deepEqual(rp.errors.filter(e => !fp.errors.includes(e)), [], 'React-only phone console errors');
 check('phone (touch emulation): no overflow or unnamed controls on any route; tapping navigation and inventory items works');

 await writeFile(out + '/report.json', JSON.stringify({ checks, ...report }, null, 2));
 console.log(`\n${checks.length} M07 sweep checks passed.`);
} finally { await browser.close(); }
