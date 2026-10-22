import {cp,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'public/assets'),{recursive:true});
await cp(resolve(root,'assets'),resolve(root,'public/assets'),{recursive:true});
console.log('Copied canonical assets to public/assets. Canonical source was not modified.');
