import { readEnvironment, type PublicEnvironment } from '../lib/environment';
import { DemoContentRepository } from './DemoContentRepository';
import { SupabaseContentRepository } from './SupabaseContentRepository';
export function createContentRepository(env: PublicEnvironment) {
 return readEnvironment(env).mode === 'demo' ? new DemoContentRepository() : new SupabaseContentRepository();
}
