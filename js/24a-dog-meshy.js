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
    status:'idle',error:null,instances:[],mounted:0,
    renderMode:'baked-morph',walkFrames:4,morphFrames:8,
    trianglesPerDog:12245,visibleMeshes:0,
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
  // O GLB otimizado agrupou coordenadas UV de ilhas diferentes.
  // Interpolar a textura entre essas coordenadas causava riscas claras na pelagem.
  // Amostramos a textura ORIGINAL uma unica vez e pintamos as cores nos
  // vertices da malha simplificada. Assim a animacao por morph targets
  // permanece leve, sem seams de atlas nem carregamento adicional.
  function bakeFurColors(geo,map){
    const uv=geo.getAttribute('uv'),image=map&&map.image;
    if(!uv||!image||!image.width||!image.height){
      throw new Error('Textura/UV do pastor ausente para corrigir a pelagem');
    }
    const canvas=document.createElement('canvas');
    canvas.width=image.width;canvas.height=image.height;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    if(!context)throw new Error('Canvas 2D nao disponivel para a textura do pastor');
    context.drawImage(image,0,0);
    const rgba=context.getImageData(0,0,canvas.width,canvas.height).data;
    const width=canvas.width,height=canvas.height;
    const color=new Uint8Array(uv.count*3);
    const clampByte=v=>Math.max(0,Math.min(255,Math.round(v)));
    // THREE.BufferAttribute.getX/getY em r128 retornam valores BRUTOS;
    // normalized=true somente normaliza na GPU. O GLB guarda UVs Uint16.
    // Sem dividir por 65535, quase todos os vertices leem um unico texel.
    const normalizedScale=uv.normalized?
      (uv.array instanceof Uint16Array?1/65535:
       uv.array instanceof Uint8Array?1/255:
       uv.array instanceof Int16Array?1/32767:1):1;
    for(let i=0;i<uv.count;i++){
      const u=Math.min(1,Math.max(0,uv.getX(i)*normalizedScale));
      // glTF Loader usa flipY=false (V cresce para baixo no atlas glTF).
      const vy=Math.min(1,Math.max(0,uv.getY(i)*normalizedScale));
      const v=map.flipY?1-vy:vy;
      const x=Math.min(width-1,Math.floor(u*(width-1)));
      const y=Math.min(height-1,Math.floor(v*(height-1)));
      // Filtragem de quatro texels elimina pontilhados de compressao JPEG.
      const x1=Math.min(width-1,x+1),y1=Math.min(height-1,y+1);
      const c=[0,0,0];
      for(const [px,py] of [[x,y],[x1,y],[x,y1],[x1,y1]]){
        const p=(py*width+px)*4;
        c[0]+=rgba[p];c[1]+=rgba[p+1];c[2]+=rgba[p+2];
      }
      for(let ch=0;ch<3;ch++){
        const srgb=c[ch]/(4*255);
        // Vertex colors em Three.js r128 sao LINEARES; a imagem JPEG e sRGB.
        // Sem converter, a curva sRGB e aplicada duas vezes, lavando toda a pelagem.
        const linear=srgb<=.04045?srgb/12.92:Math.pow((srgb+.055)/1.055,2.4);
        color[i*3+ch]=clampByte(255*linear);
      }
    }
    // O simplificador agrupou vertices de pequenas ilhas UV de cor oposta.
    // Essas amostras isoladas apareciam como riscos claros no dorso preto.
    // Filtro de mediana em apenas uma volta de vizinhos: remove ilhas
    // aberrantes, sem desfazer o desenho natural do dorso e da barriga.
    const index=geo.getIndex();
    if(index){
      const neighbours=Array.from({length:uv.count},()=>[]);
      const idx=index.array;
      for(let k=0;k<idx.length;k+=3){
        const a=idx[k],b=idx[k+1],c=idx[k+2];
        neighbours[a].push(b,c);neighbours[b].push(a,c);neighbours[c].push(a,b);
      }
      const corrected=new Uint8Array(color);
      let softened=0;
      for(let i=0;i<uv.count;i++){
        const adj=neighbours[i];
        if(adj.length<3)continue;
        const list=[i,...adj],m=[0,0,0];
        for(let ch=0;ch<3;ch++){
          const samples=list.map(v=>color[v*3+ch]).sort((a,b)=>a-b);
          m[ch]=samples[samples.length>>1];
        }
        const p=i*3;
        const difference=Math.max(
          Math.abs(color[p]-m[0]),Math.abs(color[p+1]-m[1]),Math.abs(color[p+2]-m[2]));
        const blend=difference>28?.80:difference>13?.45:.06;
        if(blend>.1)softened++;
        for(let ch=0;ch<3;ch++)corrected[p+ch]=clampByte(color[p+ch]*(1-blend)+m[ch]*blend);
      }
      color.set(corrected);
      DATA.softenedFurVertices=softened;
    }
    geo.setAttribute('color',new T.Uint8BufferAttribute(color,3,true));
    DATA.furColorVertices=uv.count;
    DATA.furTextureResolution=[width,height];
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
    // O GLB original nao possui clips Idle/Rest/Bite: os ossos de descanso
    // criados artificialmente esticavam as patas e explodiam a silhueta.
    // As quatro poses extras partem do MESMO repouso neutro valido.
    const neutral=sourceSample(scene,skin);
    for(let i=0;i<4;i++)samples.push(neutral);
    restore();

    const b0=samples[0],sz=b0.max.clone().sub(b0.min);
    if(Math.min(sz.x,sz.y,sz.z)<1e-5)throw new Error('Animação Meshy inválida');
    const factor=new T.Vector3(target.x/sz.x,target.y/sz.y,target.z/sz.z);
    DATA.originalSize=target.toArray();DATA.importedSize=sz.toArray();
    const normalized=samples.map((s,frame)=>{
      const n=s.vertices.length/3,out=new Float32Array(s.vertices.length);
      const c=s.min.clone().add(s.max).multiplyScalar(.5);
      for(let i=0;i<n;i++){
        out[i*3]=(s.vertices[i*3]-c.x)*factor.x+center.x;
        out[i*3+1]=(s.vertices[i*3+1]-s.min.y)*factor.y+expected.min.y;
        out[i*3+2]=(s.vertices[i*3+2]-c.z)*factor.z+center.z;
      }
      // Todas as poses usam coordenadas coerentes com a mesma topologia.
      // Repouso = agachar, e nao fazer as quatro pernas apontarem para frente.
      if(frame===5){
        for(let i=0;i<n;i++){
          const y=i*3+1;
          out[y]=expected.min.y+(out[y]-expected.min.y)*.64;
        }
      }else if(frame===6){
        // Mordida: avançar apenas cabeca e focinho, sem afetar o tronco.
        for(let i=0;i<n;i++){
          const k=i*3,y=out[k+1],z=out[k+2];
          const head=Math.max(0,Math.min(1,(z-.35)*2.6))*Math.max(0,Math.min(1,(y-.55)*2.0));
          out[k+2]+=head*.12;out[k+1]-=head*.04;
        }
      }else if(frame===7){
        // Alerta: cabeca erguida e respiracao, sem deformar membros.
        for(let i=0;i<n;i++){
          const k=i*3,y=out[k+1],z=out[k+2];
          const head=Math.max(0,Math.min(1,(z-.33)*2.6))*Math.max(0,Math.min(1,(y-.53)*2));
          out[k+1]+=head*.06;
        }
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

    // Riscos amarelados e pelagem quebrada vinham da interpolacao de
    // coordenadas UV medias, nao de falha no download do JPG.
    // O color baking preserva a paleta do atlas original e anula o artefato.
    const sourceTexture=skin.material&&skin.material.map;
    if(!sourceTexture)throw new Error('Textura do pastor indisponível');
    bakeFurColors(geo,sourceTexture);
    const material=new T.MeshBasicMaterial({
      vertexColors:true,map:null,color:0xffffff,
      side:T.DoubleSide,morphTargets:true,
      depthWrite:true,transparent:false
    });
    DATA.textureMode='fur-vertex-baked';
    DATA.visibleMeshes=1;
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

  makeDogRig=function(helmet){
    const d=oldMake(helmet);
    d._wantsDogHelmet=!!helmet;
    if(DATA.instances.length>45){
      DATA.instances=DATA.instances.filter(x=>x.root&&x.root.parent);
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
          if(d.root&&d.root.parent)syncVariant(d);
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
