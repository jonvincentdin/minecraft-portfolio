// Trims transparent padding and writes resized copies, using the browser's canvas.
// Usage: node post.mjs trim <in.png> <out.png> [padFraction]
//        node post.mjs resize <in.png> <out.png> <size>
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const [op, input, output, arg] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage();
const src = 'data:image/png;base64,' + readFileSync(input).toString('base64');
const data = await p.evaluate(async ({ src, op, arg }) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement('canvas'); let g;
  if (op === 'trim') {
    c.width = img.width; c.height = img.height; g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 6) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const pad = Math.round(Math.max(x1 - x0, y1 - y0) * +(arg || .04));
    const o = document.createElement('canvas'); o.width = x1 - x0 + 1 + pad * 2; o.height = y1 - y0 + 1 + pad * 2;
    o.getContext('2d').drawImage(c, x0, y0, x1 - x0 + 1, y1 - y0 + 1, pad, pad, x1 - x0 + 1, y1 - y0 + 1);
    return o.toDataURL('image/png');
  }
  // resize: halve repeatedly for quality, then final step
  let cur = img, w = img.width; const target = +arg;
  while (w / 2 >= target) { const s = document.createElement('canvas'); s.width = s.height = w / 2; const sg = s.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(cur, 0, 0, w / 2, w / 2); cur = s; w /= 2; }
  c.width = c.height = target; g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, target, target);
  return c.toDataURL('image/png');
}, { src, op, arg });
writeFileSync(output, Buffer.from(data.split(',')[1], 'base64'));
await b.close(); console.log('wrote', output);
