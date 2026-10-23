export const routes = { home: 'Spawn', about: 'About', projects: 'Inventory', skills: 'Crafting', experience: 'Experience', achievements: 'Advancements', contact: 'Message' } as const;
export type Route = keyof typeof routes | 'editor' | 'not-found';
export function readRoute(hash: string): Route { const key = hash.slice(1).split('/')[0] || 'home'; if (key === 'advancements') return 'achievements'; return key === 'editor' || Object.hasOwn(routes,key) ? key as Route : 'not-found'; }
