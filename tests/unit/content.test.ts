import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalContentRepository } from '../../src/data/LocalContentRepository';
import { SupabaseContentRepository } from '../../src/data/SupabaseContentRepository';
import { MemoryDocumentStore } from '../../src/data/document-store';
import { createContentRepository } from '../../src/data/repository';
import { readRoute } from '../../src/app/routes';
test('demo reads are isolated from visitor and editor mutations', async () => {
 const repo = new LocalContentRepository(new MemoryDocumentStore()); const first = await repo.getPublishedContent('jvd-world');
 const original = first.content.actualSkills[0].title;
 first.content.actualSkills[0].title = 'visitor mutation'; first.content.startingInventory[0].quantity = 0;
 const second = await repo.getPublishedContent('jvd-world');
 assert.equal(second.content.actualSkills[0].title, original); assert.ok(second.content.startingInventory[0].quantity > 0);
 assert.equal(second.source, 'local'); assert.ok(second.content.projects.every(project => project.sample));
});
test('backend mode never falls back silently', () => {
 assert.throws(() => createContentRepository({ VITE_CONTENT_MODE: 'invalid' }), /must be/);
 assert.throws(() => createContentRepository({ VITE_CONTENT_MODE: 'supabase' }), /requires/);
 const repo = createContentRepository({ VITE_CONTENT_MODE: 'supabase', VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'public-placeholder' });
 assert.ok(repo instanceof SupabaseContentRepository); assert.equal(repo.kind, 'supabase');
});
test('hash routes handle editor paths and unknown prototype names', () => {
 assert.equal(readRoute(''), 'home'); assert.equal(readRoute('#editor/projects'), 'editor');
 assert.equal(readRoute('#toString'), 'not-found');
});
