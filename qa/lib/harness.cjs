'use strict';
// Infra comum dos testes de navegador: servidor estático embutido + Chromium headless.
// Uso: const {withGame}=require('./lib/harness.cjs'); await withGame(async ({page,logs})=>{...});
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT=process.env.QA_ROOT?path.resolve(process.env.QA_ROOT):path.resolve(__dirname,'..','..');   // QA_ROOT: testar outra cópia do jogo (ex.: revisão anterior)
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary','.mp3':'audio/mpeg','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.md':'text/plain; charset=utf-8'};
function startServer(){
  return new Promise((resolve,reject)=>{
    const srv=http.createServer((req,res)=>{
      let p=decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/')) p+='index.html';
      const file=path.normalize(path.join(ROOT,p));
      if(!file.startsWith(ROOT)){ res.writeHead(403); res.end(); return; }
      fs.readFile(file,(err,buf)=>{
        if(err){ res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}); res.end(buf);
      });
    });
    srv.on('error',reject);
    srv.listen(0,'127.0.0.1',()=>resolve({srv,url:'http://127.0.0.1:'+srv.address().port+'/'}));
  });
}
const CHROME_ARGS=['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'];
// Mensagens de driver/rede que não são defeitos do jogo.
const NOISE=[/GPU stall due to ReadPixels/,/fonts\.(googleapis|gstatic)\.com/,/ERR_TUNNEL_CONNECTION_FAILED/,/ERR_INTERNET_DISCONNECTED/,/ERR_NAME_NOT_RESOLVED/,/ERR_FAILED/,/GL Driver Message/,/Automatic fallback to software WebGL/,/GroupMarkerNotSet/];
async function withGame(fn,opts={}){
  const {chromium}=require('playwright');
  const {srv,url}=await startServer();
  const browser=await chromium.launch({headless:true,args:CHROME_ARGS});
  const logs=[];
  try{
    const ctx=await browser.newContext({viewport:opts.viewport||{width:1280,height:720},deviceScaleFactor:1,hasTouch:!!opts.touch,isMobile:!!opts.mobile});
    // As fontes externas não fazem parte do que está em teste; evita depender de rede.
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
    if(opts.initScript) await ctx.addInitScript(opts.initScript);
    const page=await ctx.newPage();
    page.on('console',m=>{ if(['warning','error'].includes(m.type())){ const t=m.text(); if(!NOISE.some(re=>re.test(t))) logs.push(m.type()+': '+t.slice(0,400)); } });
    page.on('pageerror',e=>logs.push('pageerror: '+(e.stack||e.message).slice(0,600)));
    page.on('requestfailed',r=>{ const u=r.url(); if(!NOISE.some(re=>re.test(u))) logs.push('requestfailed: '+u); });
    const boot=async()=>{ await page.goto(url,{waitUntil:'domcontentloaded'}); await page.waitForFunction(()=>!!window.__SDP,{timeout:30000}); };
    await boot();
    return await fn({page,logs,url,ctx,boot});
  } finally { await browser.close(); srv.close(); }
}
const errorsOf=logs=>logs.filter(l=>/^(error|pageerror|requestfailed)/.test(l));
function finish(name,failures,extra){
  if(failures.length){ console.error('FALHOU: '+name); for(const f of failures) console.error('  - '+f); process.exit(1); }
  console.log('PASSOU: '+name+(extra?' — '+extra:''));
}
module.exports={withGame,startServer,errorsOf,finish,ROOT,CHROME_ARGS};
