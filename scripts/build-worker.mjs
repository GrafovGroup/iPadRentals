import fs from 'node:fs';import path from 'node:path';import {build} from 'esbuild';
const routes=JSON.parse(fs.readFileSync('routes.json')),redirects=JSON.parse(fs.readFileSync('redirects.json'));const pages={};for(const r of routes)pages[r.path]=fs.readFileSync('dist'+r.path+'index.html','utf8');pages['/404.html']=fs.readFileSync('dist/404.html','utf8');
const assets={};const mime={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
for(const file of fs.readdirSync('dist/assets',{recursive:true})){if(file.endsWith('.jpg'))continue;const ext=path.extname(file);if(mime[ext])assets['/assets/'+file]={type:mime[ext],data:fs.readFileSync('dist/assets/'+file).toString('base64')}}
for(const name of ['sitemap.xml','robots.txt'])assets['/'+name]={type:name.endsWith('.xml')?'application/xml':'text/plain',data:fs.readFileSync('dist/'+name).toString('base64')};
fs.mkdirSync('.sites-runtime',{recursive:true});fs.writeFileSync('.sites-runtime/content.mjs','export const pages='+JSON.stringify(pages)+';\nexport const assets='+JSON.stringify(assets)+';\nexport const redirects='+JSON.stringify(redirects)+';');
fs.mkdirSync('dist/server',{recursive:true});await build({entryPoints:['server/index.mjs'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
fs.mkdirSync('dist/.openai',{recursive:true});fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Worker ready: '+routes.length+' routes, '+Object.keys(assets).length+' assets');
