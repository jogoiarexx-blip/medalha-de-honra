'use strict';
// Teste real no navegador: menu, malha, ossos, frustum e escala do pastor.
const {chromium}=require('playwright');
const {spawn}=require('child_process');
const fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const srv=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
 let browser;const logs=[];
 try{
  for(let i=0;i<40;i++){try{const r=await fetch('http://127.0.0.1:8765/index.html');if(r.ok)break;}catch{}await sleep(250);}
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor:1});
  page.on('console',m=>{if(['warning','error'].includes(m.type()))logs.push('console '+m.type()+': '+m.text().slice(0,500));});
  page.on('pageerror',e=>logs.push('pageerror: '+e.message));
  page.on('requestfailed',r=>logs.push('requestfailed: '+r.url()+' '+r.failure()?.errorText));
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const report=await page.evaluate(()=>{
   const d=window.__PASTOR_MESHY||{},menu=window.MENU3D, dog=menu&&menu.dog||null, t=window.THREE;
   const res={status:d.status,error:d.error,correctedVertices:d.correctedVertices,mounted:d.mounted,visibleMeshes:d.visibleMeshes,instances:d.instances&&d.instances.length,menuBuilt:!!menu?.built,menuOn:!!menu?.on,webgl:!!window.__SDP};
   if(dog){res.dog={position:dog.root.position.toArray(),scale:dog.root.scale.toArray(),visible:dog.root.visible,parent:dog.root.parent?.type,meshy:!!dog._meshy,spineVisible:dog.spine.visible};
    if(dog._meshy){
      const m=dog._meshy.model; const b=new t.Box3().setFromObject(m);const c=b.getCenter(new t.Vector3()),v=c.clone().project(menu.cam);res.model={center:c.toArray(),box:[b.min.toArray(),b.max.toArray()],projected:v.toArray(),w:Number(b.max.x-b.min.x),h:Number(b.max.y-b.min.y),d:Number(b.max.z-b.min.z),meshes:0,bones:0};
      m.traverse(o=>{if(o.isSkinnedMesh){res.model.meshes++;res.model.bones+=o.skeleton.bones.length;}});
    }
   }
   return res;
  });
  console.log('PASTOR_BROWSER_REPORT '+JSON.stringify(report));
  console.log('PASTOR_BROWSER_LOGS '+JSON.stringify(logs.slice(0,30)));
  fs.mkdirSync('qa-shots',{recursive:true});
  await page.screenshot({path:'qa-shots/pastor-menu.png',fullPage:true});
  fs.writeFileSync('qa-shots/report.json',JSON.stringify({report,logs},null,2));
  if(!report.menuBuilt)throw new Error('Menu nao inicializado');
  if(!report.dog)throw new Error('Cachorro procedural nao criado');
 }finally{if(browser)await browser.close();srv.kill('SIGTERM');}
})().catch(e=>{console.error('PASTOR_BROWSER_FAIL '+String(e.stack||e));process.exitCode=1;});
