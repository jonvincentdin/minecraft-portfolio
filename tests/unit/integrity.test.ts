import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
test('runtime copies and renderer preserve every original byte', async () => {
 for (const entry of await readdir('assets', { recursive: true, withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const file = join(entry.parentPath, entry.name);
  assert.deepEqual(await readFile(file), await readFile(join('public', file)), file);
 }
 assert.equal((await readdir('assets/models')).filter(f => f.endsWith('.glb')).length, 48);
 assert.equal((await readdir('assets/thumbs')).filter(f => f.endsWith('.png')).length, 39);
 assert.deepEqual(await readFile('src/components/three/renderer.js'), await readFile('reference/site/renderer.js'));
 assert.equal(await readFile('src/styles/reference.css','utf8'), (await readFile('reference/site/style.css','utf8')).replaceAll("url('assets/", "url('/assets/"));
 assert.deepEqual(await readFile('src/data/demo-content.json'), await readFile('context/v1/content-seed.json'));
});
