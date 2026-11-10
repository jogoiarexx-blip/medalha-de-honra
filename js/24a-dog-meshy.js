'use strict';
/*
 * Pastor-alemao Meshy - ponte para o rig de cachorro existente.
 *
 * O GLB tem escala 0.01 em Armature e matrizes inverseBind ~100.
 * Suas posicoes de vertices NAO podem ser multiplicadas por 100:
 * o skinning ja converte as unidades. Box3.setFromObject()
 * nao considera a deformacao skinned do Three r128 e da dimensao
 * incorreta. Aqui medimos os vertices com SkinnedMesh.boneTransform()
 * para preservar o tamanho do cachorro procedural em cada eixo.
 *
 * A IA e hitboxes permanecem no personagem antigo. Conservamos
 * descanso, alerta, corrida, mordida e morte; o GLB oferece
 * a animacao original Walk apenas para locomocao.
 */
(function(){
  const oldMake=makeDogRig, oldPose=poseDogRig;
  const DATA={
    url:'assets/models/pastor-alemao-animado.glb',
    status:'loading',mounted:0,instances:[],error:null,
    trianglesPerDog:12245,correctedVertices:0,
    visibleMeshes:0,menuDogVisible:false,
    originalSize:null,importedSize:null,meshyScale:null
  };
  window.__PASTOR_MESHY=DATA;
  let template=null,walk=null,sourceBox=null;
  const V=new T.Vector3(),XAXIS=new T.Vector3(1,0,0),YAXIS=new T.Vector3(0,1,0);

  function skinnedBounds(root){
    root.updateMatrixWorld(true);
    const out=new T.Box3().makeEmpty();
    const pt=new T.Vector3();
    root.traverse(o=>{
      if(!o.isMesh||!o.geometry)return;
      const attr=o.geometry.getAttribute('position');
      if(!attr)return;
      for(let i=0;i<attr.count;i++){
        if(o.isSkinnedMesh && typeof o.boneTransform==='function'){
          o.boneTransform(i,pt);
        }else{
          pt.fromBufferAttribute(attr,i);
        }
        pt.applyMatrix4(o.matrixWorld);
        if(Number.isFinite(pt.x)&&Number.isFinite(pt.y)&&Number.isFinite(pt.z))out.expandByPoint(pt);
      }
    });
    return out;
  }

  function cloneRig(original){
    const copy=original.clone(true);
    const a=[],b=[];
    original.traverse(o=>a.push(o));
    copy.traverse(o=>b.push(o));
    if(a.length!==b.length)throw new Error('Hierarquia incompatível no pastor');
    const mapped=new Map(a.map((x,i)=>[x,b[i]]));
    a.forEach((o,i)=>{
      if(!o.isSkinnedMesh)return;
      const c=b[i],bones=o.skeleton.bones.map(x=>mapped.get(x));
      if(bones.some(x=>!x))throw new Error('Osso ausente no pastor');
      c.bind(new T.Skeleton(bones,o.skeleton.boneInverses.map(x=>x.clone())),o.bindMatrix.clone());
      c.bindMode=o.bindMode;
      c.frustumCulled=false;
      c.castShadow=false;
      c.receiveShadow=true;
    });
    return copy;
  }

  function preparePose(model){
    const bones={};
    model.traverse(o=>{if(o.isBone)bones[o.name]=o;});
    const original={};
    for(const name in bones){
      const b=bones[name];
      original[name]={p:b.position.clone(),q:b.quaternion.clone(),s:b.scale.clone()};
    }
    return {bones,original};
  }

  function attach(d){
    if(!template||d._meshy||!d.root||!sourceBox)return;
    const model=cloneRig(template);
    const desired=d._pastorOriginalBounds;
    if(!desired||desired.isEmpty())throw new Error('Cachorro original sem dimensões');
    const oldSize=desired.getSize(new T.Vector3());
    const newSize=sourceBox.getSize(new T.Vector3());
    if(Math.min(oldSize.x,oldSize.y,oldSize.z,newSize.x,newSize.y,newSize.z)<1e-6){
      throw new Error('Medidas inválidas no GLB');
    }
    const fit=new T.Vector3(oldSize.x/newSize.x,oldSize.y/newSize.y,oldSize.z/newSize.z);
    // Nonuniform fitting reproduz o volume do personagem original e sua escala 0.85/1.0.
    // Nenhum dos vértices ou ossos recebe multiplicação manual.
    model.scale.copy(fit);
    const a=desired.getCenter(new T.Vector3()),b=sourceBox.getCenter(new T.Vector3());
    model.position.set(a.x-b.x*fit.x,desired.min.y-sourceBox.min.y*fit.y,a.z-b.z*fit.z);
    model.updateMatrixWorld(true);
    // Não ocultar o cachorro antigo antes de confirmar a presença do SkinnedMesh.
    const skinned=[];
    model.traverse(o=>{if(o.isSkinnedMesh)skinned.push(o);});
    if(!skinned.length)throw new Error('GLB não tem SkinnedMesh');
    d.root.add(model);
    const pose=preparePose(model);
    d._meshy={
      model,mixer:new T.AnimationMixer(model),action:null,
      bones:pose.bones,original:pose.original,rest:0,mode:'idle'
    };
    if(walk){
      const action=d._meshy.mixer.clipAction(walk);
      action.setLoop(T.LoopRepeat,Infinity);
      d._meshy.action=action;
    }
    if(d._wantsDogHelmet){
      const cap=new T.Mesh(
        new T.SphereGeometry(.18,12,7,0,Math.PI*2,0,Math.PI*.54),
        new T.MeshLambertMaterial({color:0x596346,side:T.DoubleSide})
      );
      cap.position.set(0,1.025,.38);
      d.root.add(cap);d._meshy.cap=cap;
    }
    d.spine.visible=false;
    DATA.mounted++;
    DATA.originalSize=oldSize.toArray();
    DATA.importedSize=newSize.toArray();
    DATA.meshyScale=fit.toArray();
  }

  makeDogRig=function(helmet){
    const d=oldMake(helmet);
    d._wantsDogHelmet=!!helmet;
    // Capturar dimensões antes de poses (dormir, morder, morrer).
    d._pastorOriginalBounds=new T.Box3().setFromObject(d.spine);
    if(DATA.instances.length>45){
      DATA.instances=DATA.instances.filter(x=>x.root&&x.root.parent);
    }
    DATA.instances.push(d);
    if(template){
      try{attach(d);}catch(e){DATA.error=String(e);console.warn('Pastor: mantendo cachorro procedural',e);}
    }
    return d;
  };

  const turn=new T.Quaternion();
  function rotate(m,name,axis,angle){
    const bone=m.bones[name],base=m.original[name];
    if(!bone||!base)return;
    turn.setFromAxisAngle(axis,angle);
    bone.quaternion.copy(base.q).multiply(turn);
  }
  function restPose(m,t,rest,opts){
    for(const name in m.original){
      const b=m.bones[name],base=m.original[name];
      b.position.copy(base.p);b.quaternion.copy(base.q);b.scale.copy(base.s);
    }
    const hips=m.bones.Hips,base=m.original.Hips;
    if(hips&&base){
      // Eixo local Z da armature corresponde a altura (negativo para cima).
      hips.position.z=base.p.z+.33*rest;
    }
    const breath=Math.sin(t*1.7)*.015,look=(opts.look||0)*.18;
    rotate(m,'chest',XAXIS,.12*rest+breath);
    rotate(m,'head',YAXIS,look+Math.sin(t*.48)*.05);
    rotate(m,'frontleg',XAXIS,-.85*rest);
    rotate(m,'R_frontleg',XAXIS,-.85*rest);
    rotate(m,'backleg',XAXIS,.72*rest);
    rotate(m,'R_backleg',XAXIS,.72*rest);
    rotate(m,'tail',YAXIS,Math.sin(t*(opts.alert?7:3.2))*.12);
  }

  poseDogRig=function(d,time,dt,opts){
    // Mantém TODAS as transições e reações originais (IA, rig, estados).
    oldPose(d,time,dt,opts||{});
    if(!d||!d._meshy)return;
    const m=d._meshy,o=opts||{},delta=Math.max(0,Math.min(.05,dt||0));
    const speed=Math.max(0,Math.min(8,o.speed||0));
    const walking=!o.resting&&!o.dead&&speed>.2;
    const targetRest=(o.resting||o.dead)?1:0;
    m.rest+=(targetRest-m.rest)*(1-Math.exp(-delta*6));
    if(walking&&m.action){
      if(m.mode!=='walking'){m.action.reset().play();m.mode='walking';}
      m.action.timeScale=Math.max(.55,Math.min(2.3,speed/3.1));
      m.mixer.update(delta);
      // Feedback de ataque, sem destruir os keyframes de caminhada.
      if(o.bite){
        const head=m.bones.head;
        if(head)head.quaternion.multiply(turn.setFromAxisAngle(XAXIS,-.23*o.bite));
      }
    }else{
      if(m.mode==='walking'){m.action.stop();m.mode='idle';}
      restPose(m,time,m.rest,o);
      if(o.bite){
        const head=m.bones.head;
        if(head)head.quaternion.multiply(turn.setFromAxisAngle(XAXIS,-.23*o.bite));
      }
    }
    if(m.cap)m.cap.visible=!o.dead;
  };

  if(!T.GLTFLoader){
    DATA.status='fallback';DATA.error='GLTFLoader não carregado';
    return;
  }
  const loader=new T.GLTFLoader();
  loader.load(DATA.url,gltf=>{
    try{
      if(!gltf||!gltf.scene)throw new Error('GLB sem cena');
      template=gltf.scene;walk=(gltf.animations||[])[0]||null;
      template.traverse(o=>{
        if(!o.isMesh||!o.material)return;
        DATA.visibleMeshes++;
        // Não reescalar posições: o skinning preserva as proporções originais.
        const mats=Array.isArray(o.material)?o.material:[o.material];
        mats.forEach(mat=>{
          if(mat.emissive)mat.emissive.setRGB(0,0,0);
          if('emissiveMap' in mat)mat.emissiveMap=null;
          if('metalness' in mat)mat.metalness=0;
          if('roughness' in mat)mat.roughness=.9;
          mat.needsUpdate=true;
        });
      });
      sourceBox=skinnedBounds(template);
      const size=sourceBox.getSize(new T.Vector3());
      if(sourceBox.isEmpty()||Math.min(size.x,size.y,size.z)<1e-6)throw new Error('GLB sem volume skinned válido');
      DATA.status='ready';
      for(const d of DATA.instances){
        if(d.root&&d.root.parent&&!d._meshy){
          try{attach(d);}catch(e){DATA.error=String(e);console.warn('Pastor não pôde ser anexado:',e);}
        }
      }
      if(DATA.mounted===0)console.info('Pastor carregado: aguardando cão visível');
    }catch(e){DATA.status='fallback';DATA.error=String(e);console.warn('Pastor: usando modelo original',e);}
  },undefined,err=>{
    DATA.status='fallback';
    DATA.error=err&&err.message?err.message:'Modelo GLB indisponível';
    console.warn('Pastor GLB indisponível; modelo original preservado:',DATA.error);
  });
})();
