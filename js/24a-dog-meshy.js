'use strict';
/*
 * Pastor-alemao Meshy: renderer leve compatível com Three.js r128.
 *
 * Diagnostico reproduzido em Chromium: a exportacao original do skin
 * deslocava a malha centenas de unidades para longe do cachorro.
 *
 * Solucao: amostrar o GLB uma unica vez, com boneTransform (CPU),
 * construir 8 poses compartilhadas como morph targets e exibir Mesh
 * sem GPU skinning/bindMatrix. 8 poses usam ~0.9 MB de posicoes e
 * UMA draw call por cachorro, sem calculo de 9 mil vertices/frame.
 *
 * O rig procedural original continua dirigindo os estados: repouso,
 * alerta, marcha/corrida, mordida e morte. A escala local do
 * personagem, inclusive 0.85 no menu e 1.0 na missao S1, nao muda.
 */
(function(){
  const oldMake=makeDogRig,oldPose=poseDogRig;
  const DATA={
    url:'assets/models/pastor-alemao-animado.glb',
    status:'loading',error:null,instances:[],mounted:0,
    renderMode:'baked-morph',walkFrames:4,morphFrames:8,
    trianglesPerDog:12245,visibleMeshes:0,
    originalSize:null,importedSize:null,menuDogVisible:false
  };
  window.__PASTOR_MESHY=DATA;
  let shared=null;
  const point=new T.Vector3();
  const XAXIS=new T.Vector3(1,0,0),YAXIS=new T.Vector3(0,1,0);
  const HEAD_COUNT=8;

  function snapshot(root){
    const a=[];
    root.traverse(o=>a.push({
      node:o,position:o.position.clone(),rotation:o.quaternion.clone(),scale:o.scale.clone()
    }));
    return ()=>{for(const p of a){
      p.node.position.copy(p.position);
      p.node.quaternion.copy(p.rotation);
      p.node.scale.copy(p.scale);
    }};
  }

  function sourceSample(scene,sk){
    scene.updateMatrixWorld(true);
    const attr=sk.geometry.getAttribute('position'),N=attr.count;
    const vertices=new Float32Array(N*3);
    const min=new T.Vector3(Infinity,Infinity,Infinity),max=new T.Vector3(-Infinity,-Infinity,-Infinity);
    for(let i=0;i<N;i++){
      sk.boneTransform(i,point).applyMatrix4(sk.matrixWorld);
      if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||!Number.isFinite(point.z)){
        throw new Error('Vértice skinned inválido: '+i);
      }
      vertices[i*3]=point.x;vertices[i*3+1]=point.y;vertices[i*3+2]=point.z;
      min.min(point);max.max(point);
    }
    return {vertices,min,max};
  }

  function localPose(scene,restore,bones,kind){
    restore();
    const adjust=(name,axis,angle)=>{
      const b=bones[name];
      if(b)b.quaternion.multiply(new T.Quaternion().setFromAxisAngle(axis,angle));
    };
    const hips=bones.Hips;
    if(kind==='rest'){
      if(hips)hips.position.z+=.32;
      adjust('frontleg',XAXIS,-.92);adjust('R_frontleg',XAXIS,-.92);
      adjust('backleg',XAXIS,.85);adjust('R_backleg',XAXIS,.85);
      adjust('head',XAXIS,.13);adjust('chest',XAXIS,.14);
    }else if(kind==='bite'){
      adjust('head',XAXIS,-.43);adjust('chest',XAXIS,-.12);
      adjust('frontleg',XAXIS,-.13);adjust('R_frontleg',XAXIS,-.13);
    }else if(kind==='alert'){
      adjust('head',XAXIS,-.15);adjust('head',YAXIS,.12);
      adjust('tail',YAXIS,.26);adjust('chest',XAXIS,-.05);
    }
    scene.updateMatrixWorld(true);
  }

  function buildMorphs(gltf){
    const scene=gltf.scene;let skin=null;
    scene.traverse(o=>{if(o.isSkinnedMesh&&!skin)skin=o;});
    if(!skin||!skin.geometry||!skin.geometry.getAttribute('position')){
      throw new Error('GLB sem SkinnedMesh válido');
    }
    const clip=(gltf.animations||[])[0];
    if(!clip||!Number.isFinite(clip.duration)||clip.duration<=0){
      throw new Error('Cachorro precisa da animação Walk do Meshy');
    }

    // Referencia exata da geometria original do jogo, sem aplicar poses.
    const reference=oldMake(false);
    const expected=new T.Box3().setFromObject(reference.spine);
    const target=expected.getSize(new T.Vector3()),center=expected.getCenter(new T.Vector3());
    if(Math.min(target.x,target.y,target.z)<=0)throw new Error('Dimensões do rig original inválidas');

    const restore=snapshot(scene);
    const bones={};scene.traverse(o=>{if(o.isBone)bones[o.name]=o;});
    const mixer=new T.AnimationMixer(scene),action=mixer.clipAction(clip);
    action.play();
    const samples=[];
    for(let i=0;i<4;i++){
      mixer.setTime(clip.duration*i/4);
      samples.push(sourceSample(scene,skin));
    }
    action.stop();restore();
    for(const kind of ['idle','rest','bite','alert']){
      localPose(scene,restore,bones,kind);
      samples.push(sourceSample(scene,skin));
    }
    restore();

    const b0=samples[0],sz=b0.max.clone().sub(b0.min);
    if(Math.min(sz.x,sz.y,sz.z)<1e-5)throw new Error('Animação Meshy inválida');
    const factor=new T.Vector3(target.x/sz.x,target.y/sz.y,target.z/sz.z);
    DATA.originalSize=target.toArray();DATA.importedSize=sz.toArray();
    const normalized=samples.map((s,frame)=>{
      const n=s.vertices.length/3,out=new Float32Array(s.vertices.length);
      const c=s.min.clone().add(s.max).multiplyScalar(.5);
      const heightMul=frame===5?.60:1;
      for(let i=0;i<n;i++){
        out[i*3]=(s.vertices[i*3]-c.x)*factor.x+center.x;
        out[i*3+1]=(s.vertices[i*3+1]-s.min.y)*factor.y*heightMul+expected.min.y;
        out[i*3+2]=(s.vertices[i*3+2]-c.z)*factor.z+center.z;
      }
      return out;
    });

    const base=skin.geometry;
    const geo=new T.BufferGeometry();
    geo.setIndex(base.getIndex().clone());
    geo.setAttribute('position',new T.BufferAttribute(normalized[4],3));
    const uv=base.getAttribute('uv');
    if(uv)geo.setAttribute('uv',uv.clone());
    geo.morphAttributes.position=normalized.map(x=>new T.BufferAttribute(x,3));
    geo.morphTargetsRelative=false;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();

    // Textura original do GLB com iluminação constante e barata:
    // em r128, o material PBR exportado era escuro demais neste porao.
    const material=new T.MeshBasicMaterial({
      map:skin.material&&skin.material.map||null,
      color:0xffffff,side:T.DoubleSide,morphTargets:true,
      depthWrite:true,transparent:false
    });
    if(!material.map)throw new Error('Textura do pastor indisponível');
    DATA.visibleMeshes=1;
    return {geometry:geo,material,reference:expected};
  }

  function attach(d){
    if(!shared||!d.root||d._meshy)return;
    const mesh=new T.Mesh(shared.geometry,shared.material);
    mesh.frustumCulled=false;
    mesh.morphTargetInfluences.fill(0);
    mesh.morphTargetInfluences[4]=1; // idle
    d.root.add(mesh);
    d._meshy={model:mesh,mesh,cycle:0,state:'idle'};
    if(d._wantsDogHelmet){
      const cap=new T.Mesh(
        new T.SphereGeometry(.18,12,7,0,Math.PI*2,0,Math.PI*.54),
        new T.MeshLambertMaterial({color:0x596346,side:T.DoubleSide})
      );
      cap.position.set(0,1.025,.38);d.root.add(cap);d._meshy.cap=cap;
    }
    // O cachorro antigo so e ocultado depois que o substituto foi anexado.
    d.spine.visible=false;
    DATA.mounted++;
  }

  makeDogRig=function(helmet){
    const d=oldMake(helmet);
    d._wantsDogHelmet=!!helmet;
    if(DATA.instances.length>45){
      DATA.instances=DATA.instances.filter(x=>x.root&&x.root.parent);
    }
    DATA.instances.push(d);
    if(shared){
      try{attach(d);}catch(e){DATA.error=String(e);console.warn('Pastor: mantendo rig original',e);}
    }
    return d;
  };

  poseDogRig=function(d,time,dt,opts){
    oldPose(d,time,dt,opts||{});
    if(!d||!d._meshy)return;
    const m=d._meshy,o=opts||{};
    const speed=Math.max(0,Math.min(8,o.speed||0)),delta=Math.min(.06,Math.max(0,dt||0));
    const weights=new Array(HEAD_COUNT).fill(0);
    if(o.dead){
      weights[5]=1;
    }else if(o.resting){
      const alert=o.alert?(.08+.05*(1+Math.sin(time*2.2))):0;
      weights[5]=1-alert;weights[7]=alert;
    }else if(o.bite){
      const b=Math.max(0,Math.min(1,o.bite));
      weights[6]=b;weights[4]=1-b;
    }else if(speed>.2){
      m.cycle=(m.cycle+delta*Math.max(.6,Math.min(3,speed/3.2)))%1;
      const f=m.cycle*4,i=Math.floor(f),r=f-i;
      weights[i]=1-r;weights[(i+1)%4]+=r;
    }else{
      const alert=o.alert?.12*(1+Math.sin(time*2)):0;
      weights[4]=1-alert;weights[7]=alert;
    }
    const mix=m.mesh.morphTargetInfluences,k=1-Math.exp(-delta*13);
    for(let i=0;i<HEAD_COUNT;i++)mix[i]+=(weights[i]-mix[i])*k;
    if(m.cap)m.cap.visible=!o.dead;
  };

  if(!T.GLTFLoader){
    DATA.status='fallback';DATA.error='GLTFLoader não carregado';return;
  }
  new T.GLTFLoader().load(DATA.url,gltf=>{
    try{
      shared=buildMorphs(gltf);
      DATA.status='ready';
      for(const d of DATA.instances){
        if(d.root&&d.root.parent&&!d._meshy){
          try{attach(d);}catch(e){DATA.error=String(e);console.warn('Pastor:',e);}
        }
      }
    }catch(e){
      DATA.error=String(e);DATA.status='fallback';shared=null;
      console.warn('Falha ao otimizar pastor: cachorro procedural mantido',e);
    }
  },undefined,e=>{
    DATA.status='fallback';DATA.error=e&&e.message||'GLB indisponível';
    console.warn('Pastor GLB indisponível; cachorro anterior ativo',DATA.error);
  });
})();
