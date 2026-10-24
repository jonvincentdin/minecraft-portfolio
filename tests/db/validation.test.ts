import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import seed from '../../src/data/demo-content.json' with { type: 'json' };
import { contentProblem } from '../../src/domain/content-validation';
import { craftItems, resultModels } from '../../src/domain/crafting-data.js';
import { symbols } from '../../src/data/symbols';
import { shared, stricter, type Mutation } from '../fixtures/validation-cases';
import { createDatabase, as } from './harness';

let db: PGlite;
before(async () => { db = await createDatabase(); });
const fresh = () => structuredClone(seed) as any;
const serverProblem = async (doc: unknown) =>
 (await as<{ problem: string | null }>(db, 'admin', 'select portfolio_internal.content_problem($1::jsonb) as problem', [JSON.stringify(doc)]))[0].problem ?? '';

// Workshop rules exercised beyond the reference parity list.
const workshop: Mutation[] = [
 ['duplicate recipe pattern', c => { c.recipes[1].color = c.recipes[0].color; c.recipes[1].special = c.recipes[0].special; }],
 ['recipe output not a skill', c => { c.recipes[0].output = 'book'; }],
 ['recipe special is a dye', c => { c.recipes[0].special = 'dye_blue'; }],
 ['recipe special is book', c => { c.recipes[0].special = 'book'; }],
 ['blank recipe title', c => { c.recipes[0].title = '  '; }],
 ['duplicate recipe id', c => { c.recipes[1].id = c.recipes[0].id; }],
 ['prerequisite without recipe', c => { c.recipes[0].requires = ['bow']; }],
 ['self prerequisite', c => { c.recipes[1].requires = [c.recipes[1].output]; }],
 ['repeated prerequisite', c => { c.recipes[3].requires = ['html', 'html']; }],
 ['unknown output model', c => { c.recipes[0].resultModel = 'skill_cobol'; }],
 ['fractional amount', c => { c.recipes[0].amount = 1.5; }],
 ['output amount 17', c => { c.recipes[0].amount = 17; }],
 ['unknown inventory item', c => { c.startingInventory[0].item = 'netherite'; }],
 ['repeated inventory item', c => { c.startingInventory[1].item = c.startingInventory[0].item; }],
 ['three-step prerequisite cycle', c => { const [a, b, d] = c.recipes; a.requires = [d.output]; }],
 ['non-string text field', c => { c.highlights[0].body = 7; }],
 ['tree parent cleared', c => { c.achievements[1].parent = ''; }],
 ['portrait from https', c => { c.settings.portrait = 'https://example.test/portrait.webp'; }],
 ['photo string coordinate', c => { c.certifications[0].y = '40'; }],
 ['skill with empty model', c => { c.actualSkills[0].resultModel = ''; }],
];

test('the database validator returns the client validator’s verdict and message on every case', async () => {
 for (const [name, mutate] of [...shared, ...stricter, ...workshop]) {
  const doc = fresh(); mutate(doc);
  assert.equal(await serverProblem(doc), contentProblem(doc), name);
 }
});

test('the database refuses what only the server limits', async () => {
 const inline = fresh(); inline.projects[0].photos[0].src = 'data:image/webp;base64,AAAA';
 assert.equal(contentProblem(inline), '', 'local mode keeps inline images');
 assert.equal(await serverProblem(inline), 'Invalid photo.');
 const large = fresh(); large.settings.bio = 'x'.repeat(2_000_001);
 assert.match(await serverProblem(large), /larger than 2 MB/);
 const uploaded = fresh(); uploaded.settings.portrait = 'media:3f1c2a4e-1b2c-4d5e-8f90-123456789abc.webp';
 assert.equal(await serverProblem(uploaded), '');
 assert.equal(contentProblem(uploaded), '', 'the client accepts uploaded media references');
 const forged = fresh(); forged.settings.portrait = 'media:../../secret.webp';
 assert.equal(await serverProblem(forged), 'Invalid portrait image.');
 assert.equal(await serverProblem(null), 'Choose a version 5 portfolio content export.');
});

test('the database catalog matches the client crafting data and symbols', async () => {
 const items = await as<{ id: string; kind: string; model: string }>(db, 'admin', 'select id, kind, model from portfolio_internal.craft_items order by id');
 assert.deepEqual(items, craftItems.map(x => ({ id: x.id, kind: x.kind, model: x.model })).sort((a, b) => a.id.localeCompare(b.id)));
 const models = await as<{ id: string }>(db, 'admin', 'select id from portfolio_internal.result_models order by id');
 assert.deepEqual(models.map(x => x.id), [...new Set(resultModels.map(([id]) => id))].sort());
 const syms = await as<{ id: string }>(db, 'admin', 'select id from portfolio_internal.symbols order by id');
 assert.deepEqual(syms.map(x => x.id), symbols.map(([id]) => id).sort());
});
