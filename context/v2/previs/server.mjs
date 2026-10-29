import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve,relative as relativePath,extname,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const allowed=['context/v2/previs/','context/v2/brand/','assets/fonts/','assets/demos/','assets/thumbs/','assets/models/scene-data.json','context/v1/content-seed.json','src/components/three/renderer.js'];
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff':'font/woff','.mp4':'video/mp4'};
export async function serve(port=0){
 const server=createServer(async(req,res)=>{try{
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'context/v2/previs/index.html';
  const path=resolve(root,relative);if(!path.startsWith(resolve(root)+sep)){res.writeHead(403).end();return;}
  const normalized=relativePath(root,path).split(sep).join('/');
  if(!allowed.some(p=>p.endsWith('/')?normalized.startsWith(p):normalized===p)){res.writeHead(403).end();return;}
  const data=await readFile(path),range=req.headers.range,mime=types[extname(path)]||'application/octet-stream';
  if(range){const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(!match){res.writeHead(416).end();return;}const start=+match[1],end=Math.min(match[2]?+match[2]:data.length-1,data.length-1);if(start>end){res.writeHead(416).end();return;}res.writeHead(206,{'content-type':mime,'content-range':`bytes ${start}-${end}/${data.length}`,'content-length':end-start+1,'accept-ranges':'bytes'}).end(data.subarray(start,end+1));}
  else res.writeHead(200,{'content-type':mime,'content-length':data.length,'accept-ranges':'bytes'}).end(data);
 }catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(port,'127.0.0.1',r));return {server,url:`http://127.0.0.1:${server.address().port}/context/v2/previs/index.html`};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const {url}=await serve(+(process.argv[2]||4182));console.log(url);}
