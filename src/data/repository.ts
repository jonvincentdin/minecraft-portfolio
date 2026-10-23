import { readEnvironment, type PublicEnvironment } from '../lib/environment';
import { LocalContentRepository } from './LocalContentRepository';
import { SupabaseContentRepository } from './SupabaseContentRepository';
export function createContentRepository(env: PublicEnvironment) {
 return readEnvironment(env).mode === 'demo' ? new LocalContentRepository() : new SupabaseContentRepository();
}
