import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DemoContentRepository } from '../../src/data/DemoContentRepository';
import { createContentRepository } from '../../src/data/repository';
import { readRoute } from '../../src/app/routes';
test('demo reads are isolated from visitor and editor mutations', async () => {
 const repo = new DemoContentRepository(); const first = await repo.getPublishedContent('jvd-world');
 const original = first.content.actualSkills[0].title;
 first.content.actualSkills[0].title = 'visitor mutation'; first.content.startingInventory[0].quantity = 0;
 const second = await repo.getPublishedContent('jvd-world');
 assert.equal(second.content.actualSkills[0].title, original); assert.ok(second.content.startingInventory[0].quantity > 0);
 assert.equal(second.source, 'demo'); assert.ok(second.content.projects.every(project => project.sample));
});
test('all draft, publication and media operations reject honestly', async () => {
 const repo = new DemoContentRepository(); const { content } = await repo.getPublishedContent('jvd-world');
 for (const action of [() => repo.getDraft('jvd-world'), () => repo.saveDraft(content, 0), () => repo.publishDraft(0), () => repo.uploadMedia(new File([], 'x'), { alt: '', width: 1, height: 1 }), () => repo.removeUnusedMedia('x')]) await assert.rejects(action, /unavailable.*No data was saved/);
});
test('backend mode never falls back silently', async () => {
 assert.throws(() => createContentRepository({ VITE_CONTENT_MODE: 'invalid' }), /must be/);
 assert.throws(() => createContentRepository({ VITE_CONTENT_MODE: 'supabase' }), /requires/);
 const repo = createContentRepository({ VITE_CONTENT_MODE: 'supabase', VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'public-placeholder' });
 await assert.rejects(() => repo.getPublishedContent('jvd-world'), /scheduled for M06/);
});
test('hash routes handle editor paths and unknown prototype names', () => {
 assert.equal(readRoute(''), 'home'); assert.equal(readRoute('#editor/projects'), 'editor');
 assert.equal(readRoute('#toString'), 'not-found');
});
