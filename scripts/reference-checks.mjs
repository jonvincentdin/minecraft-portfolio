import { cp, mkdtemp, readdir, rm, copyFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Runs the immutable reference/check-*.mjs scripts unchanged. They import from ./dist/, which this
// repository does not have, so a temporary folder is staged:
//   dist/                   reference/site (state.js, content.js, app.js: reference-only modules)
//   dist/<shared module>    the React app's copies of crafting-data, crafting-engine, tree-paths, renderer
//   dist/assets             public/assets, the runtime copy the React app serves
// The original assertions therefore run against the modules and assets the React app actually ships.
const stage = await mkdtemp(join(tmpdir(), 'jvd-reference-checks-'));
try {
 await cp('reference/site', join(stage, 'dist'), { recursive: true, filter: src => !src.replace(/\\/g, '/').includes('reference/site/assets') });
 await cp('public/assets', join(stage, 'dist/assets'), { recursive: true });
 const shared = { 'src/domain/crafting-data.js': 'crafting-data.js', 'src/domain/crafting-engine.js': 'crafting-engine.js', 'src/domain/tree-paths.js': 'tree-paths.js', 'src/components/three/renderer.js': 'renderer.js' };
 for (const [from, to] of Object.entries(shared)) await copyFile(from, join(stage, 'dist', to));
 let failed = 0;
 for (const script of (await readdir('reference')).filter(name => /^check-.*\.mjs$/.test(name)).sort()) {
  await copyFile(join('reference', script), join(stage, script));
  const run = spawnSync(process.execPath, [script], { cwd: stage, encoding: 'utf8' });
  const output = (run.stdout + run.stderr).trim();
  console.log((run.status === 0 ? 'ok - ' : 'FAIL - ') + script + '\n  ' + output.split('\n').slice(-3).join('\n  '));
  if (run.status !== 0) failed++;
 }
 if (failed) process.exitCode = 1;
} finally { await rm(stage, { recursive: true, force: true }); }
