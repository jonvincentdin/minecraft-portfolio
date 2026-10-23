import seed from './demo-content.json';
import type { PortfolioContent, ContentSnapshot } from '../types/content';
import { UnavailableWrites, type ContentRepository } from './ContentRepository';
const content: PortfolioContent = seed;
export class DemoContentRepository extends UnavailableWrites implements ContentRepository {
 async getPublishedContent(_portfolioId: string): Promise<ContentSnapshot> {
  return { content: structuredClone(content), revision: 0, source: 'demo' };
 }
}
