import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('reference/site');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.woff':'font/woff', '.ttf':'font/ttf' };
createServer(async (req, res) => {
 try {
  const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  const file = (await stat(path)).isDirectory() ? resolve(path, 'index.html') : path;
  const body = await readFile(file); res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(body);
 } catch { res.writeHead(404).end('Not found'); }
}).listen(4174, '127.0.0.1', () => console.log('Immutable reference: http://127.0.0.1:4174'));
