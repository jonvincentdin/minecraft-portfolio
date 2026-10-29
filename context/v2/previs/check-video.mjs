// Decode and seek through the actual delivered MP4, then save review frames.
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { serve } from './server.mjs';

const out = 'test-results/v2-previs';
await mkdir(out, { recursive: true });
const metadata = JSON.parse(await readFile('context/v2/previs/video-metadata.json', 'utf8'));
const { server, url } = await serve();
const browser = await chromium.launch({ channel: 'msedge' });
try {
  const page = await browser.newPage();
  await page.goto(url);
  const result = await page.evaluate(async () => {
    const video = document.createElement('video');
    video.src = 'din-v2-previs.mp4';
    video.muted = true;
    video.preload = 'auto';
    document.body.replaceChildren(video);
    const event = name => new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(Error(`Timed out: ${name}`)), 15000);
      video.addEventListener(name, () => { clearTimeout(timer); resolve(); }, { once: true });
      video.addEventListener('error', () => { clearTimeout(timer); reject(Error('Video decode error')); }, { once: true });
    });
    await event('loadeddata');
    const times = [0.05, 5, 10, 16, 23, 29, 35, 41, 45, 47, 49, 51, 53, 59, video.duration - 0.15];
    const canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = Math.ceil(times.length / 3) * 326;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#161c18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const frames = [];
    for (let i = 0; i < times.length; i++) {
      const pending = event('seeked');
      const presented = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('Timed out presenting decoded frame')), 15000);
        video.requestVideoFrameCallback(() => { clearTimeout(timer); resolve(); });
      });
      video.currentTime = times[i];
      await pending;
      await presented;
      const x = (i % 3) * 480, y = Math.floor(i / 3) * 326;
      ctx.drawImage(video, x, y, 480, 300);
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      ctx.fillText(`${times[i].toFixed(2)} s`, x + 10, y + 320);
      frames.push({ requested: times[i], decoded: video.currentTime, readyState: video.readyState });
    }
    const playing = event('playing');
    video.currentTime = 1;
    await video.play();
    await playing;
    await new Promise(resolve => setTimeout(resolve, 1000));
    video.pause();
    return {
      duration: video.duration, width: video.videoWidth, height: video.videoHeight,
      frames, advancedWhilePlaying: video.currentTime > 1.5,
      error: video.error?.message ?? null, sheet: canvas.toDataURL('image/png')
    };
  });
  assert(Math.abs(result.duration - metadata.seconds) < 0.1);
  assert.equal(result.width, 1440);
  assert.equal(result.height, 900);
  assert(result.frames.every(frame => Math.abs(frame.requested - frame.decoded) < 0.05 && frame.readyState >= 2));
  assert(result.advancedWhilePlaying);
  assert.equal(result.error, null);
  const { sheet, ...report } = result;
  await writeFile(`${out}/video-contact-sheet.png`, Buffer.from(sheet.split(',')[1], 'base64'));
  await writeFile(`${out}/video-report.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  server.close();
}
