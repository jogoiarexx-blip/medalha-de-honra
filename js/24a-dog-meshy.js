'use strict';
/*
 * Pastor-alemao Meshy: renderer leve compatível com Three.js r128.
 *
 * Diagnostico reproduzido em Chromium: a exportacao original do skin
 * deslocava a malha centenas de unidades para longe do cachorro.
 *
 * Solucao: amostrar o GLB uma unica vez, com boneTransform (CPU),
 * construir 8 poses compartilhadas como morph targets e exibir Mesh
 * sem GPU skinning/bindMatrix. 8 poses usam ~0.34 MB de posicoes e
 * UMA draw call por cachorro, sem recalcular vertices/frame.
 *
 * A superfície do GLB foi reconstruída offline para fechar as fraturas.
 * Pelagem contínua em cores lineares evita o atlas UV danificado.
 *
 * O rig procedural original continua dirigindo os estados: repouso,
 * alerta, marcha/corrida, mordida e morte. A escala local do
 * personagem, inclusive 0.85 no menu e 1.0 na missao S1, nao muda.
 */
(function(){
  const oldMake=makeDogRig,oldPose=poseDogRig;
  const DATA={
    url:'assets/models/pastor-alemao-animado.glb?v=superficie-20261116',
    status:'idle',error:null,instances:[],mounted:0,
    renderMode:'baked-morph',walkFrames:4,morphFrames:8,
    trianglesPerDog:0,visibleMeshes:0,
    originalSize:null,importedSize:null,menuDogVisible:false
  };
  window.__PASTOR_MESHY=DATA;
  let shared=null, loading=false;
  // O GLB do pastor acompanha EXATAMENTE a variante do soldado Meshy.
  // Detalhados e Classicos mantêm o cachorro procedural antigo.
  const useMeshy=()=>settings.chars==='modelo';
  DATA.useMeshy=useMeshy;
  const point=new T.Vector3();
  const XAXIS=new T.Vector3(1,0,0),YAXIS=new T.Vector3(0,1,0);
  const HEAD_COUNT=8;
  // Pelagem contínua no espaço neutro do corpo. O atlas otimizado perdeu
  // ilhas UV; remendar vértices isolados não recupera essa informação.
  // As cores ficam presas aos mesmos vértices em todas as poses, sem custo/frame.
  function bakeFurColors(geo,map){
    const p=geo.getAttribute('position'),box=new T.Box3().setFromBufferAttribute(p);
    const size=box.getSize(new T.Vector3()),color=new Float32Array(p.count*3);
    const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
    const hash=(x,y,z)=>{let n=Math.imul(x,73856093)^Math.imul(y,19349663)^Math.imul(z,83492791);n=Math.imul(n^(n>>>13),1274126177);return (n>>>0)/4294967295;};
    const noise=(x,y,z)=>{
      const a=Math.floor(x),b=Math.floor(y),c=Math.floor(z),u=smooth(0,1,x-a),v=smooth(0,1,y-b),w=smooth(0,1,z-c);
      const mix=(x,y,t)=>x+(y-x)*t;
      return mix(mix(mix(hash(a,b,c),hash(a+1,b,c),u),mix(hash(a,b+1,c),hash(a+1,b+1,c),u),v),mix(mix(hash(a,b,c+1),hash(a+1,b,c+1),u),mix(hash(a,b+1,c+1),hash(a+1,b+1,c+1),u),v),w);
    };
    for(let i=0;i<p.count;i++){
      const x=(p.getX(i)-(box.min.x+box.max.x)/2)/(size.x*.5),y=(p.getY(i)-box.min.y)/size.y,z=(p.getZ(i)-box.min.z)/size.z;
      const grain=(noise(x*28,y*40,z*48)-.5)*.035;
      const edge=.49+.15*Math.abs(x)+.035*Math.cos(z*9);
      const saddle=smooth(.17,.27,z)*(1-smooth(.68,.79,z))*smooth(edge-.06,edge+.06,y);
      const tail=(1-smooth(.08,.23,z))*smooth(.10,.30,y)*.85;
      const head=smooth(.69,.77,z)*smooth(.60,.70,y);
      const muzzle=head*smooth(.84,.94,z)*(1-smooth(.84,.90,y));
      const ears=head*smooth(.90,.96,y)*(1-smooth(.82,.87,z));
      const eye=head*Math.exp(-((Math.abs(x)-.50)**2/.025+(y-.825)**2/.0012+(z-.84)**2/.0018))*.92;
      const dark=Math.max(saddle,tail,muzzle,ears,eye),shade=.86+.12*y+.02*x;
      // Paleta do pastor procedural: patas castanhas, sela e máscara escuras.
      const tan=[.69,.51,.31],black=[.15,.125,.105];
      for(let k=0;k<3;k++){
        const srgb=Math.max(0,Math.min(1,(tan[k]*(1-dark)+black[k]*dark+grain)*shade));
        color[i*3+k]=srgb<=.04045?srgb/12.92:Math.pow((srgb+.055)/1.055,2.4);
      }
    }
    geo.setAttribute('color',new T.Float32BufferAttribute(color,3));
    DATA.furColorVertices=p.count;DATA.furTextureResolution=map?.image?[map.image.width,map.image.height]:[0,0];
    DATA.sourceUvRepairs=0;DATA.textureMode='fur-spatial-baked';
    return true;
  }

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
      if(hips)hips.position.z+=.20;
      adjust('frontleg',XAXIS,-1.10);adjust('R_frontleg',XAXIS,-1.10);
      adjust('backleg',XAXIS,-1.4);adjust('R_backleg',XAXIS,-1.4);
      for(const side of ['', 'R_']){
        adjust(side+'frontleg0',XAXIS,.1);adjust(side+'frontleg1',XAXIS,0);adjust(side+'frontleg2',XAXIS,.6);
        adjust(side+'backleg0',XAXIS,1.8);adjust(side+'backleg1',XAXIS,-.27);
      }
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

    // boneTransform r128 lê atributos normalizados como inteiros na CPU.
    // Decodificar uma vez mantém a unidade correta antes de amostrar o rig.
    const weights=skin.geometry.getAttribute('skinWeight');
    if(weights.normalized){
      const decoded=new Float32Array(weights.count*4);
      for(let i=0;i<weights.count;i++){
        const sum=weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i);
        for(let k=0;k<4;k++)decoded[i*4+k]=sum?weights.array[i*4+k]/sum:(k===0?1:0);
      }
      skin.geometry.setAttribute('skinWeight',new T.BufferAttribute(decoded,4));
    }
    const restore=snapshot(scene);
    const bones={};scene.traverse(o=>{if(o.isBone)bones[o.name]=o;});
    const mixer=new T.AnimationMixer(scene),action=mixer.clipAction(clip);action.play();
    const samples=[];
    for(let i=0;i<4;i++){mixer.setTime(clip.duration*i/4);samples.push(sourceSample(scene,skin));}
    action.stop();restore();const neutral=sourceSample(scene,skin);
    localPose(scene,restore,bones,'rest');const resting=sourceSample(scene,skin);restore();
    samples.push(neutral,resting,neutral,neutral);
    const restReference=oldMake(false);restReference.restT=1;
    oldPose(restReference,0,.016,{resting:true});
    const restBox=new T.Box3().setFromObject(restReference.spine);
    DATA.originalSize=target.toArray();DATA.importedSize=neutral.max.clone().sub(neutral.min).toArray();
    DATA.scaleReference='procedural-per-pose';
    const normalized=samples.map((s,frame)=>{
      // Repouso tem referência própria: nunca recebe o fator de uma pose de marcha.
      const anchor=frame<4?samples[0]:frame===5?resting:neutral;
      const ref=frame===5?restBox:expected,refSize=ref.getSize(new T.Vector3()),refCenter=ref.getCenter(new T.Vector3());
      const sz=anchor.max.clone().sub(anchor.min),center=anchor.min.clone().add(anchor.max).multiplyScalar(.5);
      const factor=new T.Vector3(refSize.x/sz.x,ref.max.y/sz.y,refSize.z/sz.z);
      const out=new Float32Array(s.vertices.length);
      for(let i=0;i<out.length;i+=3){
        out[i]=(s.vertices[i]-center.x)*factor.x+refCenter.x;
        out[i+1]=(s.vertices[i+1]-s.min.y)*factor.y;
        out[i+2]=(s.vertices[i+2]-center.z)*factor.z+refCenter.z;
        if(frame===6||frame===7){
          const head=Math.max(0,Math.min(1,(out[i+2]-.33)*2.6))*Math.max(0,Math.min(1,(out[i+1]-.53)*2));
          if(frame===6){out[i+2]+=head*.12;out[i+1]-=head*.04;}else out[i+1]+=head*.06;
        }
      }
      return out;
    });
    DATA.poseSizes=normalized.map(a=>new T.Box3().setFromBufferAttribute(new T.BufferAttribute(a,3)).getSize(new T.Vector3()).toArray());

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

    // O campo de pelagem não interpola as ilhas UV quebradas do atlas.
    const sourceTexture=skin.material&&skin.material.map;
    bakeFurColors(geo,sourceTexture);
    const material=new T.MeshBasicMaterial({
      vertexColors:true,map:null,color:0xffffff,
      side:T.DoubleSide,morphTargets:true,
      depthWrite:true,transparent:false
    });
    DATA.textureMode='fur-spatial-baked';
    DATA.visibleMeshes=1;DATA.trianglesPerDog=geo.index.count/3;
    return {geometry:geo,material,reference:expected};
  }

  function attach(d){
    if(!useMeshy()||!shared||!d.root||d._meshy)return;
    const mesh=new T.Mesh(shared.geometry,shared.material);
    mesh.frustumCulled=false;
    mesh.morphTargetInfluences.fill(0);
    mesh.morphTargetInfluences[4]=1; // idle
    d.root.add(mesh);
    d._meshy={model:mesh,mesh,cycle:0,state:'idle'};
    if(d._wantsDogHelmet){
      // Capacete compartilhado entre todos os cães (mesma geometria e material).
      if(!shared.capGeo){
        shared.capGeo=new T.SphereGeometry(1,12,7,0,Math.PI*2,0,Math.PI*.53);
        shared.capMat=new T.MeshLambertMaterial({color:0x596346,side:T.DoubleSide});
      }
      const cap=new T.Mesh(shared.capGeo,shared.capMat);
      cap.scale.set(.25,.25,.24);cap.position.set(0,1.285,.61);d.root.add(cap);d._meshy.cap=cap;
    }
    // O cachorro antigo so e ocultado depois que o substituto foi anexado.
    d.spine.visible=false;
    DATA.mounted++;
  }

  function syncVariant(d){
    if(!d)return;
    const modelOn=useMeshy();
    if(modelOn && shared && !d._meshy && d.root){
      try{attach(d);}catch(e){DATA.error=String(e);console.warn('Pastor: mantendo o cachorro original',e);}
    }
    const hasModel=!!d._meshy;
    d.spine.visible=!(modelOn&&hasModel);
    if(hasModel){
      d._meshy.mesh.visible=modelOn;
      if(d._meshy.cap)d._meshy.cap.visible=modelOn;
    }
  }
  DATA.syncVariant=syncVariant;

  function inLiveScene(x){
    let o=x&&x.root; if(!o)return false;
    while(o.parent)o=o.parent;
    return o===scene||(typeof MENU3D!=='undefined'&&o===MENU3D.scene);
  }
  DATA.inLiveScene=inLiveScene;
  const WEIGHTS=new Float32Array(HEAD_COUNT);   // rascunho reutilizado (sem alocar por quadro)

  makeDogRig=function(helmet){
    const d=oldMake(helmet);
    d._wantsDogHelmet=!!helmet;
    // Só ficam na lista os cães presos a uma cena viva (missão atual ou menu);
    // os de missões anteriores são soltos para o coletor de lixo.
    if(DATA.instances.length>16){
      DATA.instances=DATA.instances.filter(inLiveScene);
    }
    DATA.instances.push(d);
    if(useMeshy()){
      requestMeshy();
      syncVariant(d);
    }
    return d;
  };

  poseDogRig=function(d,time,dt,opts){
    oldPose(d,time,dt,opts||{});
    if(!d)return;
    if(useMeshy()&&!shared)requestMeshy();
    syncVariant(d);
    if(!useMeshy()||!d._meshy)return;
    const m=d._meshy,o=opts||{};
    const speed=Math.max(0,Math.min(8,o.speed||0)),delta=Math.min(.06,Math.max(0,dt||0));
    const weights=WEIGHTS;weights.fill(0);
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

  // Só faz download/decodificação quando a variante de soldados é Modelo 3D.
  // A mudança de seleção durante download não substitui o cão procedural.
  function requestMeshy(){
    if(!useMeshy() || loading || shared || DATA.status==='fallback')return;
    if(!T.GLTFLoader){
      DATA.status='fallback';DATA.error='GLTFLoader não carregado';return;
    }
    loading=true;DATA.status='loading';
    new T.GLTFLoader().load(DATA.url,gltf=>{
      loading=false;
      try{
        shared=buildMorphs(gltf);
        DATA.status='ready';
        for(const d of DATA.instances){
          if(inLiveScene(d))syncVariant(d);
        }
      }catch(e){
        DATA.error=String(e);DATA.status='fallback';shared=null;
        console.warn('Falha ao otimizar pastor: cachorro procedural mantido',e);
      }
    },undefined,e=>{
      loading=false;DATA.status='fallback';
      DATA.error=e&&e.message||'GLB indisponível';
      console.warn('Pastor GLB indisponível; cachorro anterior ativo',DATA.error);
    });
  }
  if(useMeshy())requestMeshy();
})();
