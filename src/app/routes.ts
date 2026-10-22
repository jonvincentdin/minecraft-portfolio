export const routes = { home: 'Spawn', about: 'About', projects: 'Projects', skills: 'Skills', experience: 'Experience', advancements: 'Advancements', contact: 'Contact' } as const;
export type Route = keyof typeof routes | 'editor' | 'not-found';
export function readRoute(hash: string): Route { const key = hash.slice(1).split('/')[0] || 'home'; return key === 'editor' || Object.hasOwn(routes, key) ? key as Route : 'not-found'; }
