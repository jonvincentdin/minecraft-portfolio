import {cp,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'public/assets'),{recursive:true});
await cp(resolve(root,'assets'),resolve(root,'public/assets'),{recursive:true});
console.log('Copied canonical assets to public/assets. Canonical source was not modified.');

// Preserve the original downloadable reference bundles used by the shared footer.
await mkdir(resolve(root,'public/downloads'),{recursive:true});
await cp(resolve(root,'reference/site/downloads'),resolve(root,'public/downloads'),{recursive:true});
