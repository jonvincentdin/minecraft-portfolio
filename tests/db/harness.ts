import { PGlite } from '@electric-sql/pglite';
import { readdir, readFile } from 'node:fs/promises';

// A minimal stand-in for the parts of a Supabase project the migrations rely on: API roles, auth.uid()
// from the request JWT claims, storage tables under RLS, and Supabase's default grants on public.
// It proves the SQL, policies and grants behave as intended in Postgres; it is not the hosted service.
const SUPABASE_STANDIN = `
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
$$;

create schema storage;
grant usage on schema storage to anon, authenticated, service_role;
create table storage.buckets (id text primary key, name text not null, public boolean default false,
 file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets (id),
 name text not null, owner uuid default auth.uid(), metadata jsonb, created_at timestamptz default now(), unique (bucket_id, name));
alter table storage.objects enable row level security;
grant all on storage.objects to anon, authenticated, service_role;
grant select on storage.buckets to anon, authenticated, service_role;
`;

export const OWNER = '00000000-0000-4000-8000-000000000001';
export const STRANGER = '00000000-0000-4000-8000-000000000002';

export async function createDatabase() {
 const db = new PGlite();
 await db.exec(SUPABASE_STANDIN);
 await db.exec(`insert into auth.users (id, email) values ('${OWNER}', 'owner@example.test'), ('${STRANGER}', 'stranger@example.test');`);
 const dir = new URL('../../supabase/migrations/', import.meta.url);
 for (const file of (await readdir(dir)).filter(name => name.endsWith('.sql')).sort()) await db.exec(await readFile(new URL(file, dir), 'utf8'));
 return db;
}

export type Actor = 'anon' | 'admin' | { user: string };
// Runs one statement as an API role, the way PostgREST does: SET ROLE plus the JWT claims.
export async function as<T = Record<string, unknown>>(db: PGlite, actor: Actor, sql: string, params: unknown[] = []) {
 await db.exec('reset role');
 if (actor === 'anon') await db.query(`select set_config('request.jwt.claims', '{"role":"anon"}', false)`);
 else if (actor !== 'admin') await db.query(`select set_config('request.jwt.claims', $1, false)`, [JSON.stringify({ sub: actor.user, role: 'authenticated' })]);
 else await db.query(`select set_config('request.jwt.claims', '', false)`);
 if (actor !== 'admin') await db.exec(`set role ${actor === 'anon' ? 'anon' : 'authenticated'}`);
 try { return (await db.query<T>(sql, params)).rows; } finally { await db.exec('reset role'); }
}

// Resolves to the SQLSTATE and message of a failed statement, or 'ok'.
export async function outcome(run: Promise<unknown>) {
 try { await run; return 'ok'; } catch (error) { const e = error as { code?: string; message: string }; return (e.code ?? '?') + ' ' + e.message; }
}
