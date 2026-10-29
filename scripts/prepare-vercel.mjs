import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

// Package only the verified public build, never source, context or environment files.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await readFile(resolve(root, 'dist/index.html'));
const output = resolve(root, '.vercel/output');
await mkdir(output, { recursive: true });
await cp(resolve(root, 'dist'), resolve(output, 'static'), { recursive: true });
await writeFile(resolve(output, 'config.json'), JSON.stringify({ version: 3 }) + '\n');
console.log('Prepared dist as a Vercel static deployment. Deploy with vercel deploy --prebuilt --prod.');
