import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(resolve(root,'assets/asset-manifest.json'),'utf8'));
let failed=0;
for(const asset of manifest.assets){
 try{const bytes=await readFile(resolve(root,asset.path));const hash=createHash('sha256').update(bytes).digest('hex');if(bytes.length!==asset.bytes||hash!==asset.sha256)throw Error('size or SHA-256 mismatch');}
 catch(error){failed++;console.error(asset.path+': '+error.message);}
}
if(failed){process.exitCode=1;console.error(`${failed} asset(s) failed verification.`);}
else console.log(`Verified ${manifest.assets.length} original assets, including skill_react.glb.`);
