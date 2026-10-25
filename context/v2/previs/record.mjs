// Records the v2 previs as a video: intro → Enter world → a scripted scroll through every chapter.
// Usage: node context/v2/previs/record.mjs [out.webm]
// Needs Microsoft Edge (Playwright's msedge channel) and network access for Google Fonts.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, copyFile, rm, readdir, mkdtemp } from 'node:fs/promises';
import { extname, join, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const out = resolve(process.argv[2] || join(root, 'context/v2/previs/din-v2-previs.webm'));
const TYPES = { '.html': 'text/html', '.png': 'image/png', '.json': 'application/json', '.woff': 'font/woff', '.js': 'text/javascript' };
const server = createServer(async (req, res) => {
  const path = normalize(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  if (!path.startsWith(root)) { res.writeHead(403).end(); return; }
  let body;
  try { body = await readFile(path); } catch { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }).end(body);
}).listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const url = `http://127.0.0.1:${server.address().port}/context/v2/previs/index.html`;

const W = 1280, H = 720, dir = await mkdtemp(join(tmpdir(), 'previs-'));
const browser = await chromium.launch({ channel: 'msedge' });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir, size: { width: W, height: H } } });
const page = await ctx.newPage();
await page.setContent('<body style="margin:0;background:#07060d"></body>');
await page.goto(url);
await page.waitForFunction(() => window.__ready === true);
await page.waitForTimeout(3600);                       // intro: runes, logo, Enter world
await page.click('#enter');
await page.waitForTimeout(2000);

// Scroll in-page with eased segments: each chapter gets its own pace, with a short hold at its start.
await page.evaluate(async () => {
  const run = (to, ms) => new Promise(done => { const from = scrollY, t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0) / ms); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; scrollTo(0, from + (to - from) * e); k < 1 ? requestAnimationFrame(step) : done(); }; requestAnimationFrame(step); });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const pace = { spawn: 7000, about: 9000, projects: 12000, skills: 19000, experience: 13000, advancements: 10000, contact: 8000, credits: 6000 };
  for (const c of document.querySelectorAll('.chapter')) {
    await run(c.offsetTop, 900); await wait(500);
    await run(c.offsetTop + c.offsetHeight - innerHeight, pace[c.id]); await wait(300);
  }
  await wait(1200);
});
await page.close(); await ctx.close(); await browser.close(); server.close();
const video = (await readdir(dir)).find(f => f.endsWith('.webm'));
await copyFile(join(dir, video), out); await rm(dir, { recursive: true });
console.log('wrote', out);
