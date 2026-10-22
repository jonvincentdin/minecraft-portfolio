export interface PublicEnvironment { VITE_CONTENT_MODE?: string; VITE_SUPABASE_URL?: string; VITE_SUPABASE_PUBLISHABLE_KEY?: string }
export function readEnvironment(env: PublicEnvironment) {
 const mode = env.VITE_CONTENT_MODE || 'demo';
 if (mode !== 'demo' && mode !== 'supabase') throw new Error('VITE_CONTENT_MODE must be demo or supabase.');
 if (mode === 'supabase') {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) throw new Error('Supabase mode requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  const url = new URL(env.VITE_SUPABASE_URL);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Supabase URL must use HTTP or HTTPS.');
 }
 return { mode, url: env.VITE_SUPABASE_URL, publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY } as const;
}
