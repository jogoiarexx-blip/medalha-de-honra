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
   const res={status:d.status,error:d.error,correctedVertices:d.correctedVertices,mounted:d.mounted,visibleMeshes:d.visibleMeshes,instances:d.instances&&d.instances.length,menuBuilt:!!menu?.built,menuOn:!!menu?.on,webgl:!!window.__SDP,originalSize:d.originalSize,importedSize:d.importedSize,meshyScale:d.meshyScale};
   if(dog){res.dog={position:dog.root.position.toArray(),scale:dog.root.scale.toArray(),visible:dog.root.visible,parent:dog.root.parent?.type,meshy:!!dog._meshy,spineVisible:dog.spine.visible};
    if(dog._meshy){
      const m=dog._meshy.model; const b=new t.Box3().setFromObject(m),c=b.getCenter(new t.Vector3());
      const ob=dog._pastorOriginalBounds;
      res.model={oldBox:ob&&[ob.min.toArray(),ob.max.toArray()],approxBox:[b.min.toArray(),b.max.toArray()],meshes:0,bones:0,actualBox:null,skinnedVisible:null};
      const skin=new t.Box3().makeEmpty(),pt=new t.Vector3();m.updateMatrixWorld(true);
      m.traverse(o=>{
        if(o.isSkinnedMesh){
          res.model.meshes++;res.model.bones+=o.skeleton.bones.length;
          const a=o.geometry.getAttribute('position');
          res.model.material={map:!!o.material.map,transparent:o.material.transparent,opacity:o.material.opacity,visible:o.visible,name:o.name,frustumCulled:o.frustumCulled};
          const points=[];
          for(let i=0;i<a.count;i++){
            o.boneTransform(i,pt);
            if(i===0)points.push(pt.toArray());
            pt.applyMatrix4(o.matrixWorld);skin.expandByPoint(pt);
          }
          res.model.sample=points;
        }
      });
      if(!skin.isEmpty()){
        const center=skin.getCenter(new t.Vector3()), proj=center.clone().project(menu.cam);
        res.model.actualBox=[skin.min.toArray(),skin.max.toArray()];
        res.model.actualSize=skin.getSize(new t.Vector3()).toArray();
        res.model.actualCenter=center.toArray();res.model.screen=proj.toArray();
        res.model.skinnedVisible=proj.x>=-1&&proj.x<=1&&proj.y>=-1&&proj.y<=1&&proj.z>=-1&&proj.z<=1;
      }
    }
   }
   return res;
  });
  console.log('PASTOR_BROWSER_REPORT '+JSON.stringify(report));
  console.log('PASTOR_BROWSER_LOGS '+JSON.stringify(logs.slice(0,30)));
  fs.mkdirSync('qa-shots',{recursive:true});
  await page.screenshot({path:'qa-shots/pastor-menu.png',fullPage:true});
  // Diagnostico: cria UMA malha estatica a partir da pose skinned e a encaixa
  // no volume do pastor original, sem depender do bindMatrix do clone.
  const baked=await page.evaluate(()=>{
    const d=window.MENU3D?.dog,m=d?._meshy,t=window.THREE;
    if(!m)return {error:'sem modelo Meshy'};
    let sk=null;m.model.traverse(o=>{if(o.isSkinnedMesh)sk=o;});
    if(!sk)return {error:'sem SkinnedMesh'};
    const a=sk.geometry.getAttribute('position'),root=d.root;
    const points=new Float32Array(a.count*3),pt=new t.Vector3(),lo=new t.Vector3(Infinity,Infinity,Infinity),hi=new t.Vector3(-Infinity,-Infinity,-Infinity);
    m.model.updateMatrixWorld(true);root.updateMatrixWorld(true);
    for(let i=0;i<a.count;i++){
      sk.boneTransform(i,pt);pt.applyMatrix4(sk.matrixWorld);root.worldToLocal(pt);
      points[i*3]=pt.x;points[i*3+1]=pt.y;points[i*3+2]=pt.z;
      lo.min(pt);hi.max(pt);
    }
    const ref=d._pastorOriginalBounds,rs=ref.getSize(new t.Vector3()),sz=hi.clone().sub(lo);
    const sc=new t.Vector3(rs.x/sz.x,rs.y/sz.y,rs.z/sz.z);
    const center=ref.getCenter(new t.Vector3()),base=lo.clone().add(hi).multiplyScalar(.5);
    for(let i=0;i<a.count;i++){
      points[i*3]=(points[i*3]-base.x)*sc.x+center.x;
      points[i*3+1]=(points[i*3+1]-lo.y)*sc.y+ref.min.y;
      points[i*3+2]=(points[i*3+2]-base.z)*sc.z+center.z;
    }
    const geo=sk.geometry.clone();
    geo.setAttribute('position',new t.BufferAttribute(points,3));
    geo.deleteAttribute('skinIndex');geo.deleteAttribute('skinWeight');geo.computeVertexNormals();geo.computeBoundingSphere();
    const mat=new t.MeshBasicMaterial({map:sk.material.map||null,color:0xffffff,side:t.DoubleSide});
    const visual=new t.Mesh(geo,mat); visual.frustumCulled=false;root.add(visual);
    m.model.visible=false;d.spine.visible=false;
    return {vertices:a.count,normalisedSize:rs.toArray(),originalRaw:sz.toArray(),offset:base.toArray(),visible:visual.visible};
  });
  console.log('PASTOR_BAKED_PROBE '+JSON.stringify(baked));
  await page.waitForTimeout(500);
  await page.screenshot({path:'qa-shots/pastor-baked.png',fullPage:true});
  fs.writeFileSync('qa-shots/report.json',JSON.stringify({report,logs,baked},null,2));
  if(!report.menuBuilt)throw new Error('Menu nao inicializado');
  if(!report.dog)throw new Error('Cachorro procedural nao criado');
 }finally{if(browser)await browser.close();srv.kill('SIGTERM');}
})().catch(e=>{console.error('PASTOR_BROWSER_FAIL '+String(e.stack||e));process.exitCode=1;});
