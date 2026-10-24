import { createClient } from '@supabase/supabase-js';
import { readEnvironment, type PublicEnvironment } from '../lib/environment';
import type { Database } from '../types/database';
import { LocalContentRepository } from './LocalContentRepository';
import { SupabaseContentRepository } from './SupabaseContentRepository';
export function createContentRepository(env: PublicEnvironment) {
 const config = readEnvironment(env);
 if (config.mode === 'demo') return new LocalContentRepository();
 // Only the publishable key reaches the browser; the signed-in editor's token and RLS decide access.
 const client = createClient<Database>(config.url!, config.publishableKey!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
 return new SupabaseContentRepository(client, config.url!);
}
