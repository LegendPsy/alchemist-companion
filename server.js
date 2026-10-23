import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname)); if(!p.startsWith(root+path.sep)&&p!==root){res.writeHead(403).end();return;} const f=p===root?path.join(root,'index.html'):p;fs.readFile(f,(e,data)=>{if(e){res.writeHead(404).end('Not found');return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'})[path.extname(f)]||'application/octet-stream');res.end(data);});}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));
