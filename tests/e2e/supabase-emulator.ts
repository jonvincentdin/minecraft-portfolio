import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createDatabase, as, OWNER, STRANGER, type Actor } from '../db/harness';

// A local stand-in for the Supabase HTTP APIs the app calls (Auth password grant, PostgREST table reads and RPCs,
// Storage upload/copy/sign/remove/public reads), executing every request against the real migrations in PGlite
// under the caller's role and JWT claims. It lets browser tests drive the actual UI and supabase-js end to end.
// It is a test double: it does not prove hosted Supabase configuration (redirects, bucket limits, email).
// Control endpoints under /__test are for the test runner only.
const port = Number(process.env.EMULATOR_PORT || 54329);
const db = await createDatabase();
const accounts: Record<string, { id: string; password: string }> = {
 'owner@example.test': { id: OWNER, password: 'correct horse battery' },
 'stranger@example.test': { id: STRANGER, password: 'correct horse battery' },
};
const objects = new Map<string, { type: string; body: Buffer }>();
let generation = 0;
const TABLES: Record<string, string[]> = {
 portfolio_publications: ['content', 'revision', 'portfolio_id'], portfolio_drafts: ['content', 'revision', 'recovery', 'portfolio_id'],
 portfolio_editors: ['role', 'portfolio_id', 'user_id'], media_assets: ['file', 'published_at', 'portfolio_id'],
};
const RPCS: Record<string, string[]> = {
 save_draft: ['expected_revision', 'content'], import_draft: ['expected_revision', 'content'], publish_draft: ['expected_revision'],
 register_media: ['mime', 'size_bytes', 'width', 'height', 'alt'], remove_unused_media: ['file'],
};
const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
function token(id: string, email: string) {
 const exp = Math.floor(Date.now() / 1000) + 3600;
 return { access_token: [b64({ alg: 'none', typ: 'JWT' }), b64({ sub: id, email, role: 'authenticated', aud: 'authenticated', exp, gen: generation }), 'emulator'].join('.'),
  token_type: 'bearer', expires_in: 3600, expires_at: exp, refresh_token: 'refresh.' + id + '.' + generation,
  user: { id, email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date(0).toISOString() } };
}
// Resolves the caller like PostgREST: a user JWT of the current generation, otherwise the anon role.
function actor(req: IncomingMessage): Actor | 'expired' {
 const bearer = String(req.headers.authorization || '').replace(/^Bearer /, '');
 const parts = bearer.split('.');
 if (parts.length !== 3) return 'anon';
 const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
 return claims.gen === generation ? { user: claims.sub } : 'expired';
}
async function body(req: IncomingMessage) { const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(chunk as Buffer); return Buffer.concat(chunks); }
function send(res: ServerResponse, status: number, data?: unknown, type = 'application/json') {
 res.writeHead(status, { 'content-type': type, 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' });
 res.end(data === undefined ? '' : Buffer.isBuffer(data) ? data : JSON.stringify(data));
}
// PostgREST's mapping of database errors to HTTP statuses.
function dbError(res: ServerResponse, error: { code?: string; message: string; detail?: string }, who: Actor) {
 const code = error.code ?? '';
 const status = /^PT\d{3}$/.test(code) ? Number(code.slice(2)) : code === '42501' ? (who === 'anon' ? 401 : 403) : 400;
 send(res, status, { code, message: error.message, details: error.detail ?? null, hint: null });
}
const storageError = (res: ServerResponse, status: number, message: string) => send(res, status, { statusCode: String(status), error: status === 409 ? 'Duplicate' : 'Unauthorized', message });

createServer(async (req, res) => {
 try {
  if (req.method === 'OPTIONS') return send(res, 204);
  const url = new URL(req.url!, 'http://emulator');
  const path = url.pathname;
  if (path === '/__test/sql') { const sql = (await body(req)).toString(); return send(res, 200, await as(db, 'admin', sql)); }
  if (path === '/__test/expire-sessions') { generation++; return send(res, 200, { generation }); }

  if (path === '/auth/v1/token') {
   const input = JSON.parse((await body(req)).toString() || '{}');
   if (url.searchParams.get('grant_type') === 'password') {
    const account = accounts[String(input.email).toLowerCase()];
    if (!account || account.password !== input.password) return send(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials', code: 'invalid_credentials', msg: 'Invalid login credentials' });
    return send(res, 200, token(account.id, input.email));
   }
   const [, id, gen] = String(input.refresh_token).split('.');
   const email = Object.keys(accounts).find(key => accounts[key].id === id);
   if (!email || Number(gen) !== generation) return send(res, 400, { error: 'invalid_grant', error_description: 'Invalid Refresh Token', code: 'refresh_token_not_found', msg: 'Invalid Refresh Token' });
   return send(res, 200, token(id, email));
  }
  if (path === '/auth/v1/logout') return send(res, 204);
  if (path === '/auth/v1/user') {
   const who = actor(req);
   if (typeof who !== 'object') return send(res, 401, { code: 401, msg: 'invalid JWT' });
   const email = Object.keys(accounts).find(key => accounts[key].id === who.user)!;
   if (req.method === 'PUT') {
    const input = JSON.parse((await body(req)).toString() || '{}');
    if (typeof input.password === 'string') {
     if (input.password === accounts[email].password) return send(res, 422, { code: 'same_password', msg: 'New password should be different from the old password.' });
     accounts[email].password = input.password;
    }
   }
   return send(res, 200, token(who.user, email).user);
  }

  const who = actor(req);
  if (who === 'expired' && (path.startsWith('/rest/') || path.startsWith('/storage/v1/object/') && !path.startsWith('/storage/v1/object/public/')))
   return path.startsWith('/rest/') ? send(res, 401, { code: 'PGRST303', message: 'JWT expired', details: null, hint: null }) : storageError(res, 400, 'jwt expired');
  const role = who as Actor;

  const table = /^\/rest\/v1\/(\w+)$/.exec(path)?.[1];
  if (table && req.method === 'GET') {
   const columns = TABLES[table];
   if (!columns) return send(res, 404, { code: 'PGRST205', message: 'Unknown table' });
   const select = (url.searchParams.get('select') || '*').split(',').map(x => x.trim()).filter(x => columns.includes(x));
   const where: string[] = [], params: unknown[] = [];
   for (const [key, value] of url.searchParams) {
    if (key === 'select' || !columns.includes(key)) continue;
    if (value.startsWith('eq.')) { params.push(value.slice(3)); where.push(`${key}::text = $${params.length}`); }
    else if (value.startsWith('in.(')) { params.push(value.slice(4, -1).split(',').map(x => x.replace(/^"|"$/g, ''))); where.push(`${key}::text = any($${params.length})`); }
   }
   const sql = `select ${select.join(', ')} from public.${table}${where.length ? ' where ' + where.join(' and ') : ''}`;
   try { return send(res, 200, await as(db, role, sql, params)); } catch (error) { return dbError(res, error as never, role); }
  }
  const rpc = /^\/rest\/v1\/rpc\/(\w+)$/.exec(path)?.[1];
  if (rpc && req.method === 'POST') {
   const names = RPCS[rpc];
   if (!names) return send(res, 404, { code: 'PGRST202', message: 'Unknown function' });
   const input = JSON.parse((await body(req)).toString() || '{}');
   const used = names.filter(name => name in input);
   const sql = `select public.${rpc}(${used.map((name, i) => `${name} => $${i + 1}${name === 'content' ? '::jsonb' : ''}`).join(', ')}) as result`;
   try { const [row] = await as<{ result: unknown }>(db, role, sql, used.map(name => name === 'content' ? JSON.stringify(input[name]) : input[name])); return send(res, 200, row.result ?? null); }
   catch (error) { return dbError(res, error as never, role); }
  }

  const insertObject = async (bucket: string, name: string, data: { type: string; body: Buffer }) => {
   await as(db, role, 'insert into storage.objects (bucket_id, name, metadata) values ($1, $2, $3)', [bucket, name, JSON.stringify({ mimetype: data.type, size: data.body.length })]);
   objects.set(bucket + '/' + name, data);
  };
  const storageFailure = (error: unknown) => { const e = error as { code?: string; message: string }; return e.code === '23505' ? storageError(res, 409, 'The resource already exists') : storageError(res, 403, 'new row violates row-level security policy'); };
  if (path === '/storage/v1/object/copy' && req.method === 'POST') {
   const input = JSON.parse((await body(req)).toString());
   const visible = await as(db, role, 'select 1 from storage.objects where bucket_id = $1 and name = $2', [input.bucketId, input.sourceKey]);
   const source = objects.get(input.bucketId + '/' + input.sourceKey);
   if (!visible.length || !source) return storageError(res, 404, 'Object not found');
   try { await insertObject(input.destinationBucket || input.bucketId, input.destinationKey, source); } catch (error) { return storageFailure(error); }
   return send(res, 200, { Key: `${input.destinationBucket}/${input.destinationKey}` });
  }
  const signBucket = /^\/storage\/v1\/object\/sign\/([\w-]+)$/.exec(path)?.[1];
  if (signBucket && req.method === 'POST') {
   const input = JSON.parse((await body(req)).toString());
   const visible = new Set((await as<{ name: string }>(db, role, 'select name from storage.objects where bucket_id = $1 and name = any($2)', [signBucket, input.paths])).map(x => x.name));
   return send(res, 200, input.paths.map((p: string) => visible.has(p) ? { path: p, signedURL: `/object/sign/${signBucket}/${p}?token=emulator`, error: null } : { path: p, signedURL: null, error: 'Either the object does not exist or you do not have access to it' }));
  }
  const served = /^\/storage\/v1\/object\/(public|sign)\/([\w-]+)\/(.+)$/.exec(path);
  if (served && req.method === 'GET') {
   const [, kind, bucket, name] = served;
   const [bucketRow] = await as<{ public: boolean }>(db, 'admin', 'select public from storage.buckets where id = $1', [bucket]);
   const object = objects.get(bucket + '/' + decodeURIComponent(name));
   if (!object || (kind === 'public' && !bucketRow?.public)) return storageError(res, 404, 'Object not found');
   return send(res, 200, object.body, object.type);
  }
  const objectPath = /^\/storage\/v1\/object\/([\w-]+)(?:\/(.+))?$/.exec(path);
  if (objectPath && req.method === 'POST' && objectPath[2]) {
   const [, bucket, name] = objectPath;
   const form = await new Request('http://emulator', { method: 'POST', headers: { 'content-type': String(req.headers['content-type']) }, body: await body(req) }).formData();
   const file = [...form.values()].find(value => typeof value !== 'string') as Blob | undefined;
   if (!file) return storageError(res, 400, 'No file');
   const [limits] = await as<{ file_size_limit: number; allowed_mime_types: string[] }>(db, 'admin', 'select file_size_limit::int, allowed_mime_types from storage.buckets where id = $1', [bucket]);
   if (!limits || file.size > limits.file_size_limit || !limits.allowed_mime_types.includes(file.type)) return storageError(res, 400, 'Invalid file');
   try { await insertObject(bucket, decodeURIComponent(name), { type: file.type, body: Buffer.from(await file.arrayBuffer()) }); } catch (error) { return storageFailure(error); }
   return send(res, 200, { Key: `${bucket}/${name}`, Id: name });
  }
  if (objectPath && req.method === 'DELETE' && !objectPath[2]) {
   const input = JSON.parse((await body(req)).toString());
   const removed = await as<{ name: string }>(db, role, 'delete from storage.objects where bucket_id = $1 and name = any($2) returning name', [objectPath[1], input.prefixes]);
   for (const row of removed) objects.delete(objectPath[1] + '/' + row.name);
   return send(res, 200, removed);
  }
  send(res, 404, { message: 'Not emulated: ' + req.method + ' ' + path });
 } catch (error) { send(res, 500, { message: (error as Error).message }); }
}).listen(port, '127.0.0.1', () => console.log('Supabase emulator: http://127.0.0.1:' + port));
