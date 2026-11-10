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
   const r={status:d.status,error:d.error,renderMode:d.renderMode,mounted:d.mounted,originalSize:d.originalSize,importedSize:d.importedSize,textureMode:d.textureMode,furColorVertices:d.furColorVertices,furTextureResolution:d.furTextureResolution,menuBuilt:!!menu?.built,menuOn:!!menu?.on,webgl:!!window.__SDP};
   if(dog){
     r.dog={pos:dog.root.position.toArray(),scale:dog.root.scale.toArray(),visible:dog.root.visible,hasModel:!!dog._meshy,spineVisible:dog.spine.visible,originalBounds:dog._pastorOriginalBounds&&dog._pastorOriginalBounds.getSize(new t.Vector3()).toArray()};
     if(dog._meshy){
       const m=dog._meshy.mesh,geo=m.geometry,box=new t.Box3().setFromObject(m),center=box.getCenter(new t.Vector3()),projection=center.clone().project(menu.cam);
       r.visual={meshType:m.type,material:m.material.type,hasMap:!!m.material.map,hasVertexColors:!!m.material.vertexColors,
         colorVertices:geo.getAttribute('color')?.count||0,mapWidth:d.furTextureResolution?.[0]||0,
         morphs:geo.morphAttributes.position?.length||0,influences:m.morphTargetInfluences?.slice(),worldBox:[box.min.toArray(),box.max.toArray()],
         worldSize:box.getSize(new t.Vector3()).toArray(),screen:projection.toArray(),triangles:geo.index.count/3};
       const ca=geo.getAttribute('color');
       if(ca){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],sum=[0,0,0];
         for(let i=0;i<ca.count;i++){for(let c=0;c<3;c++){const v=c===0?ca.getX(i):c===1?ca.getY(i):ca.getZ(i);min[c]=Math.min(min[c],v);max[c]=Math.max(max[c],v);sum[c]+=v;}}
         r.visual.colorStats={min,max,mean:sum.map(v=>v/ca.count),samples:[0,100,1000,5000].map(i=>[ca.getX(i),ca.getY(i),ca.getZ(i)]),normalized:ca.normalized,vertexColors:m.material.vertexColors};
       }
     }
   }
   return r;
  });
  console.log('PASTOR_BROWSER_REPORT '+JSON.stringify(report));
  console.log('PASTOR_BROWSER_LOGS '+JSON.stringify(logs.slice(0,30)));
  fs.mkdirSync('qa-shots',{recursive:true});
  await page.screenshot({path:'qa-shots/pastor-menu.png',fullPage:true});
  // Vista isolada com luz neutra para auditar textura, UV e a orientacao do pastor.
  const views=await page.evaluate(()=>{
    const t=window.THREE,d=window.MENU3D?.dog,m=d?._meshy?.mesh;
    if(!m)return [];
    const canvas=document.createElement('canvas');canvas.width=520;canvas.height=480;
    const r=new t.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
    r.setSize(520,480,false);r.setPixelRatio(1);r.outputEncoding=t.sRGBEncoding;
    const scene=new t.Scene();scene.background=new t.Color(0xc0bcb7);
    const cam=new t.PerspectiveCamera(48,520/480,.1,30),images=[];
    scene.add(new t.AmbientLight(0xffffff,1));
    const light=new t.DirectionalLight(0xffffff,1.4);light.position.set(-4,8,7);scene.add(light);
    const mesh=m.clone();mesh.position.set(0,.1,0);mesh.visible=true;scene.add(mesh);
    for(const [label,px,pz] of [['front',0,5],['side',5,0],['back',0,-5],['other',-5,0]]){
      cam.position.set(px,1.5,pz);cam.lookAt(0,.7,0);r.render(scene,cam);
      images.push({label,url:canvas.toDataURL('image/png')});
    }
    r.dispose();return images;
  });
  for(const v of views)fs.writeFileSync('qa-shots/pastor-'+v.label+'.png',Buffer.from(v.url.split(',')[1],'base64'));
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
  // Alterna a MESMA opcao de personagens que escolhe o soldado Meshy.
  const variants=await page.evaluate(()=>{
    const results=[];
    const select=document.querySelector('#oChars');
    for(const mode of ['detalhado','classico','modelo']){
      select.value=mode;
      select.dispatchEvent(new Event('change',{bubbles:true}));
      MENU3D.update(1/60);
      const menuDog=MENU3D.dog;
      const secretDog=makeDogRig(true);
      const scene=window.__SDP.scene;
      scene.add(secretDog.root);
      poseDogRig(secretDog,1,.05,{speed:5,alert:true});
      results.push({
        option:mode,selected:settings.chars,
        menuMesh:!!menuDog._meshy&&menuDog._meshy.mesh.visible,
        menuProcedural:menuDog.spine.visible,
        secretMesh:!!secretDog._meshy&&secretDog._meshy.mesh.visible,
        secretProcedural:secretDog.spine.visible
      });
      scene.remove(secretDog.root);
    }
    return results;
  });
  console.log('PASTOR_VARIANTS_PROBE '+JSON.stringify(variants));
  fs.writeFileSync('qa-shots/report.json',JSON.stringify({report,logs,s1,variants},null,2));
  if(report.status!=='ready'||!report.dog?.hasModel||!report.visual)throw new Error('Pastor Meshy nao carregou no menu: '+report.error);
  if(report.visual.morphs!==8||!report.visual.hasVertexColors||report.visual.colorVertices!==9008||
      report.textureMode!=='fur-vertex-baked')throw new Error('Morph targets ou pelagem corrigida ausentes');
  const tone=report.visual.colorStats;
  if(!tone||tone.max[0]-tone.min[0]<80||tone.max[1]-tone.min[1]<60||
     tone.max[2]-tone.min[2]<30){
    throw new Error('Textura virou cor uniforme por UVs nao normalizadas: '+JSON.stringify(tone));
  }
  const p=report.visual.screen;if(Math.abs(p[0])>1||Math.abs(p[1])>1||Math.abs(p[2])>1)throw new Error('Pastor fora da camera: '+p);
  if(!s1.hasModel||s1.moving.length!==8||s1.biting.length!==8)throw new Error('Pastor da missao S1 nao anima');
  if(!variants.every(x=>x.option===x.selected))throw new Error('A opcao de personagem nao foi persistida no menu');
  for(const v of variants){
    const expectedMeshy=v.option==='modelo';
    if(v.menuMesh!==expectedMeshy||v.secretMesh!==expectedMeshy||
       v.menuProcedural===expectedMeshy||v.secretProcedural===expectedMeshy){
      throw new Error('Modelo errado na variante '+v.option+': '+JSON.stringify(v));
    }
  }
  if(logs.some(x=>x.includes('pageerror:')))throw new Error('Excecao durante teste do navegador');
 }finally{if(browser)await browser.close();srv.kill('SIGTERM');}
})().catch(e=>{console.error('PASTOR_BROWSER_FAIL '+String(e.stack||e));process.exitCode=1;});
