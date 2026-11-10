'use strict';
// Teste real no navegador WebGL: cachorro Meshy no menu e no rig S1.
const {chromium}=require('playwright');
const {spawn}=require('child_process');
const fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const srv=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
 let browser;const logs=[];
 try{
  for(let i=0;i<40;i++){try{const r=await fetch('http://127.0.0.1:8765/index.html');if(r.ok)break;}catch{}await sleep(250);}
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor:1});
  page.on('console',m=>{if(['warning','error'].includes(m.type()))logs.push('console '+m.type()+': '+m.text().slice(0,500));});
  page.on('pageerror',e=>logs.push('pageerror: '+e.message));
  page.on('requestfailed',r=>logs.push('requestfailed: '+r.url()+' '+r.failure()?.errorText));
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__PASTOR_MESHY?.status!=='loading',{timeout:25000});
  await page.waitForTimeout(1600);
  const report=await page.evaluate(()=>{
   const d=window.__PASTOR_MESHY||{},menu=window.MENU3D,dog=menu&&menu.dog||null,t=window.THREE;
   const r={status:d.status,error:d.error,renderMode:d.renderMode,mounted:d.mounted,originalSize:d.originalSize,importedSize:d.importedSize,menuBuilt:!!menu?.built,menuOn:!!menu?.on,webgl:!!window.__SDP};
   if(dog){
     r.dog={pos:dog.root.position.toArray(),scale:dog.root.scale.toArray(),visible:dog.root.visible,hasModel:!!dog._meshy,spineVisible:dog.spine.visible,originalBounds:dog._pastorOriginalBounds&&dog._pastorOriginalBounds.getSize(new t.Vector3()).toArray()};
     if(dog._meshy){
       const m=dog._meshy.mesh,geo=m.geometry,box=new t.Box3().setFromObject(m),center=box.getCenter(new t.Vector3()),projection=center.clone().project(menu.cam);
       r.visual={meshType:m.type,material:m.material.type,hasMap:!!m.material.map,mapWidth:m.material.map?.image?.width||0,
         morphs:geo.morphAttributes.position?.length||0,influences:m.morphTargetInfluences?.slice(),worldBox:[box.min.toArray(),box.max.toArray()],
         worldSize:box.getSize(new t.Vector3()).toArray(),screen:projection.toArray(),triangles:geo.index.count/3};
     }
   }
   return r;
  });
  console.log('PASTOR_BROWSER_REPORT '+JSON.stringify(report));
  console.log('PASTOR_BROWSER_LOGS '+JSON.stringify(logs.slice(0,30)));
  fs.mkdirSync('qa-shots',{recursive:true});
  await page.screenshot({path:'qa-shots/pastor-menu.png',fullPage:true});
  const s1=await page.evaluate(()=>{
    const scene=window.__SDP.scene;
    const dog=makeDogRig(true);
    dog.root.position.set(0,0,0);scene.add(dog.root);
    poseDogRig(dog,1,.05,{speed:6,alert:true,bite:0});
    const moving=dog._meshy?.mesh?.morphTargetInfluences?.slice()||[];
    poseDogRig(dog,2,.05,{speed:6,alert:true,bite:.9});
    const biting=dog._meshy?.mesh?.morphTargetInfluences?.slice()||[];
    dog.root.parent.remove(dog.root);
    return {hasModel:!!dog._meshy,scale:dog.root.scale.toArray(),moving,biting};
  });
  console.log('PASTOR_S1_PROBE '+JSON.stringify(s1));
  fs.writeFileSync('qa-shots/report.json',JSON.stringify({report,logs,s1},null,2));
  if(report.status!=='ready'||!report.dog?.hasModel||!report.visual)throw new Error('Pastor Meshy nao carregou no menu: '+report.error);
  if(report.visual.morphs!==8||!report.visual.hasMap)throw new Error('Morph targets ou textura ausentes');
  const p=report.visual.screen;if(Math.abs(p[0])>1||Math.abs(p[1])>1||Math.abs(p[2])>1)throw new Error('Pastor fora da camera: '+p);
  if(!s1.hasModel||s1.moving.length!==8||s1.biting.length!==8)throw new Error('Pastor da missao S1 nao anima');
  if(logs.some(x=>x.includes('pageerror:')))throw new Error('Excecao durante teste do navegador');
 }finally{if(browser)await browser.close();srv.kill('SIGTERM');}
})().catch(e=>{console.error('PASTOR_BROWSER_FAIL '+String(e.stack||e));process.exitCode=1;});
