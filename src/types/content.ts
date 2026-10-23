export interface TextEntry { id: string; title: string; body: string }
export interface Photo { id: string; src: string; alt: string; caption: string }
export interface Project { id: string; symbol: string; title: string; category: string; summary: string; status: string; sample: boolean; role: string; date: string; stack: string; overview: string; problem: string; solution: string; features: string; process: string; outcome: string; liveUrl: string; sourceUrl: string; photos: Photo[] }
export interface ActualSkill { resultModel?: string; id: string; recipeId: string; title: string; category: string; symbol: string; description: string; level: string; projectId: string; evidence: string; sample: boolean }
export interface LegacySkill { id: string; title: string; tools: string; outcome: string; body: string; symbol: string; projectId: string }
export interface Recipe { id: string; title: string; output: string; color: string; special: string; bookCount: number; colorCount: number; specialCount: number; amount: number; requires: string[]; note: string; resultModel: string }
export interface StartingItem { id: string; title: string; item: string; quantity: number }
export interface Character { id: string; name: string; label: string; intro: string }
export interface Experience { id: string; character: string; title: string; organization: string; start: string; end: string; description: string; contribution: string; evidence: string; sample: boolean }
export interface Advancement { id: string; title: string; description: string; date: string; issuer: string; evidence: string; symbol: string; parent: string; x: number; y: number; sample: boolean }
export interface Settings { name: string; tagline: string; heroLabel: string; github: string; linkedin: string; introTitle: string; aboutTitle: string; bio: string; portrait: string; portraitPosition: number; contactTitle: string; contactCopy: string }
export interface PortfolioContent { version: number; settings: Settings; highlights: TextEntry[]; journal: TextEntry[]; projects: Project[]; actualSkills: ActualSkill[]; skills: LegacySkill[]; characters: Character[]; experience: Experience[]; achievements: Advancement[]; certifications: Advancement[]; contacts: (TextEntry & { url: string })[]; recipes: Recipe[]; startingInventory: StartingItem[] }
export interface ContentSnapshot { content: PortfolioContent; revision: number; source: 'demo' | 'local' | 'supabase' }
