// Records the v2 previs as a video: intro → Enter world → a scripted scroll through every chapter.
// Usage: node context/v2/previs/record.mjs [out.mp4]
// Needs Microsoft Edge (Playwright's msedge channel) and network access for Google Fonts.
// Playwright records WebM only, so the take is re-encoded to H.264 MP4 inside Edge (MediaRecorder).
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, rm, readdir, mkdtemp } from 'node:fs/promises';
import { extname, join, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const out = resolve(process.argv[2] || join(root, 'context/v2/previs/din-v2-previs.mp4'));
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

// One continuous scroll down the whole world at a steady pace; the page's own inertia adds the weight.
await page.evaluate(async () => {
  const run = (to, ms) => new Promise(done => { const from = scrollY, t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0) / ms); scrollTo(0, from + (to - from) * k); k < 1 ? requestAnimationFrame(step) : done(); }; requestAnimationFrame(step); });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  for (const s of document.querySelectorAll('#world > section, #world > .band')) {
    const pinned = !!s.querySelector('.pin'), to = Math.min(s.offsetTop + s.offsetHeight, document.documentElement.scrollHeight - innerHeight);
    await run(to, (to - scrollY) / innerHeight * (pinned ? 3600 : 2600));
  }
  await wait(2500);
});
await page.close(); await ctx.close();

// Re-encode: play the WebM onto a canvas in real time and record it as MP4, skipping the blank start-up frames.
const webm = join(dir, (await readdir(dir)).find(f => f.endsWith('.webm')));
const conv = await browser.newPage();
await conv.route('**/__take.webm', route => route.fulfill({ path: webm, contentType: 'video/webm' }));
await conv.goto(url);
const mp4 = await conv.evaluate(async ({ W, H, START }) => {
  const v = document.createElement('video'); v.src = '/__take.webm'; v.muted = true; v.preload = 'auto';
  await new Promise(r => v.addEventListener('loadeddata', r, { once: true }));
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(v, 0, 0, W, H);
  const rec = new MediaRecorder(c.captureStream(30), { mimeType: 'video/mp4;codecs=avc1.640028', videoBitsPerSecond: 2_500_000 });
  const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const stopped = new Promise(r => rec.onstop = r);
  const draw = () => { g.drawImage(v, 0, 0, W, H); if (!v.ended) v.requestVideoFrameCallback(draw); };
  // Playwright's WebM has no seek index, so skip the start-up frames by timestamp instead of seeking.
  // Draw a few good frames before recording so the first MP4 frame (and its thumbnail) is clean.
  const wait = (now, meta) => { if (meta.mediaTime >= START) g.drawImage(v, 0, 0, W, H); if (meta.mediaTime < START + .3) { v.requestVideoFrameCallback(wait); return; } rec.start(1000); v.requestVideoFrameCallback(draw); };
  await v.play(); v.requestVideoFrameCallback(wait);
  await new Promise(r => v.addEventListener('ended', r, { once: true }));
  rec.stop(); await stopped;
  const buf = new Uint8Array(await new Blob(chunks, { type: 'video/mp4' }).arrayBuffer());
  let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return btoa(s);
}, { W, H, START: 1.5 });
await writeFile(out, Buffer.from(mp4, 'base64'));
await browser.close(); server.close(); await rm(dir, { recursive: true });
console.log('wrote', out);
