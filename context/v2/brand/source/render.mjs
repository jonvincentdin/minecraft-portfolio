// Renders one v2 brand image from the Canvas 2D scene.html in headless Edge.
// Usage: node context/v2/brand/source/render.mjs <out.png> <keyart|logo|emblem> <width> <height> [dpr] [transparent 0|1] [extra query]
// Needs network access for the Cinzel and Inter fonts loaded by scene.html.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const font = fileURLToPath(new URL('../../../../assets/fonts/JVDPixel.woff', import.meta.url));
const [out, mode, w, h, dpr = '1', transparent = '0', extra = ''] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'msedge', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.route('**/JVDPixel.woff', route => route.fulfill({ path: font }));
await p.goto(pathToFileURL(`${here}scene.html`).href + `?mode=${mode}${extra}`);
await p.waitForFunction(() => window.__done === true, null, { timeout: 240000 });
await p.screenshot({ path: out, omitBackground: transparent === '1' });
await b.close(); console.log('wrote', out);
