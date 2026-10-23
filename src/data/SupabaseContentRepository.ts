import type { ContentSnapshot } from '../types/content';
import { UnavailableWrites, type ContentRepository } from './ContentRepository';
// M06 will implement the authorized published snapshot contract here.
// No SDK, migrations or simulated persistence in M00.
export class SupabaseContentRepository extends UnavailableWrites implements ContentRepository {
 async getPublishedContent(_id: string): Promise<ContentSnapshot> {
  throw new Error('Supabase is configured, but backend integration is scheduled for M06. No remote content was loaded.');
 }
}
