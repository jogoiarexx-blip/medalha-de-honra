'use strict';
/* Pastor alemão Meshy | GLB otimizado e rig de caminhada.
 * Compartilha geometria/texturas, clona somente o esqueleto por cão.
 * Preserva a IA, colisões e o cachorro procedural se o arquivo não existir.
 * Coloque o modelo em assets/models/pastor-alemao-animado.glb
 */
(function(){
  const oldMake=makeDogRig, oldPose=poseDogRig;
  const DATA={
    url:'assets/models/pastor-alemao-animado.glb',
    status:'loading', mounted:0, instances:[], error:null,
    trianglesPerDog:12245, correctedVertices:0, menuDogVisible:false, visibleMeshes:0
  };
  window.__PASTOR_MESHY=DATA;
  let template=null,walk=null;
  const SIZE=1.12;

  function cloneRig(original){
    const copy=original.clone(true);
    const a=[],b=[];
    original.traverse(x=>a.push(x));
    copy.traverse(x=>b.push(x));
    if(a.length!==b.length) throw new Error('Hierarquia do pastor incompatível');
    const mapped=new Map(a.map((x,i)=>[x,b[i]]));
    a.forEach((o,i)=>{
      if(!o.isSkinnedMesh)return;
      const c=b[i],bones=o.skeleton.bones.map(x=>mapped.get(x));
      if(bones.some(x=>!x))throw new Error('Osso ausente no cachorro clonado');
      const inv=o.skeleton.boneInverses.map(x=>x.clone());
      c.bind(new T.Skeleton(bones,inv),o.bindMatrix.clone());
      c.bindMode=o.bindMode;
      c.frustumCulled=false;
      c.castShadow=true;
    });
    return copy;
  }

  function attach(d){
    if(!template||d._meshy||!d.root)return;
    const model=cloneRig(template);
    // Alguns GLB do Meshy exportam Z-up; a detecção também aceita Y-up.
    const bounds=new T.Box3().setFromObject(model);
    const dim=bounds.getSize(new T.Vector3());
    if(dim.z>dim.y*1.2)model.rotation.x=-Math.PI/2;
    model.updateMatrixWorld(true);
    const pre=new T.Box3().setFromObject(model);
    const height=pre.max.y-pre.min.y;
    if(!Number.isFinite(height)||height<1e-9)throw new Error('Dimensões inválidas no GLB');
    model.scale.multiplyScalar(SIZE/height);
    model.updateMatrixWorld(true);
    const box=new T.Box3().setFromObject(model);
    model.position.x-=(box.min.x+box.max.x)*.5;
    model.position.y-=box.min.y;
    model.position.z-=(box.min.z+box.max.z)*.5;

    d.root.add(model);
    d.spine.visible=false;
    d._meshy={model,mixer:new T.AnimationMixer(model),action:null,rest:0};
    if(walk){
      const action=d._meshy.mixer.clipAction(walk);
      action.setLoop(T.LoopRepeat,Infinity);
      action.play();
      action.paused=true;
      d._meshy.action=action;
    }
    // Capacete do bônus preservado como equipamento visual independente.
    if(d._wantsDogHelmet){
      const cap=new T.Mesh(
        new T.SphereGeometry(.18,12,7,0,Math.PI*2,0,Math.PI*.54),
        new T.MeshLambertMaterial({color:0x596346,side:T.DoubleSide})
      );
      cap.position.set(0,1.025,.38);
      d.root.add(cap);
      d._meshy.cap=cap;
    }
    DATA.mounted++;
  }
  makeDogRig=function(helmet){
    const d=oldMake(helmet);
    d._wantsDogHelmet=!!helmet;
    if(DATA.instances.length>45){
      DATA.instances=DATA.instances.filter(x=>x.root&&x.root.parent);
    }
    DATA.instances.push(d);
    if(template){
      try{attach(d);}catch(e){DATA.error=String(e);console.warn('Pastor Meshy: fallback procedural',e);}
    }
    return d;
  };
  poseDogRig=function(d,time,dt,opts){
    if(!d||!d._meshy)return oldPose(d,time,dt,opts);
    opts=opts||{};
    const m=d._meshy;
    const delta=Math.max(0,Math.min(.05,dt||0));
    const speed=Math.max(0,Math.min(8,opts.speed||0));
    const resting=!!opts.resting,dead=!!opts.dead;
    const walking=!resting&&!dead&&speed>.2;
    if(m.action){
      m.action.paused=!walking;
      m.action.timeScale=Math.max(.55,Math.min(2.3,speed/3.1));
      if(walking)m.mixer.update(delta);
    }
    m.rest+=(resting?1-m.rest:-m.rest)*Math.min(1,delta*4);
    if(m.cap)m.cap.visible=!dead;
  };

  if(!T.GLTFLoader){
    DATA.status='fallback'; DATA.error='GLTFLoader não carregado';
    return;
  }
  const loader=new T.GLTFLoader();
  loader.load(DATA.url,gltf=>{
    if(!gltf||!gltf.scene)throw new Error('GLB sem cena');
    template=gltf.scene;walk=(gltf.animations||[])[0]||null;
    // Correção de unidades Meshy/FBX: o arquivo guarda vértices ~100x menores
    // que as juntas do esqueleto (posição ~0.014 vs ossos ~1.4).
    // Sem essa correção a animação afasta a malha da posição do cão.
    // Corrigir somente a posição do mesh; ossos, pesos, binds e clips permanecem.
    const scaledGeometries=new Set();
    template.traverse(o=>{
      if(!o.isMesh||!o.material)return;
      DATA.visibleMeshes++;
      if(o.isSkinnedMesh && o.geometry && !scaledGeometries.has(o.geometry)){
        const geo=o.geometry, position=geo.getAttribute('position');
        if(!position || !position.count)throw new Error('Pastor: geometria sem vértices');
        for(let i=0;i<position.count;i++){
          position.setXYZ(i,position.getX(i)*100,position.getY(i)*100,position.getZ(i)*100);
        }
        position.needsUpdate=true; geo.computeBoundingBox(); geo.computeBoundingSphere();
        scaledGeometries.add(geo);
        DATA.correctedVertices+=position.count;
      }
      // O GLB exportou textura emissiva duplicada: deixar pelagem fosca.
      const mats=Array.isArray(o.material)?o.material:[o.material];
      mats.forEach(m=>{
        if(m.emissive)m.emissive.setRGB(0,0,0);
        if('emissiveMap' in m)m.emissiveMap=null;
        if('metalness' in m)m.metalness=0;
        if('roughness' in m)m.roughness=.9;
        m.needsUpdate=true;
      });
    });
    if(!DATA.correctedVertices)throw new Error('Pastor: nenhum SkinnedMesh foi encontrado');
    DATA.status='ready';
    DATA.instances.forEach(d=>{
      if(d.root&&d.root.parent&&!d._meshy){
        try{attach(d);}catch(e){DATA.error=String(e);console.warn('Pastor Meshy:',e);}
      }
    });
  },undefined,err=>{
    DATA.status='fallback';
    DATA.error=err&&err.message?err.message:'Modelo externo indisponível';
    // Nenhuma falha de jogo: os cães procedurais continuam ativos.
  });
})();