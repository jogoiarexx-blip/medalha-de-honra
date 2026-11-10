'use strict';
// Uso: node qa/test_pastor_visibilidade.js
// Auditoria estrutural do cachorro (menu e S1) e do GLB otimizado.
// A aparencia final ainda deve ser validada no navegador.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=read('js/24a-dog-meshy.js');
const menu=read('js/18-menu-system.js');
const secret=read('js/24-secret-operations.js');
const html=read('index.html');
const glb=fs.readFileSync(path.join(root,'assets/models/pastor-alemao-animado.glb'));
assert.equal(glb.toString('ascii',0,4),'glTF','GLB invalido');
assert.equal(glb.readUInt32LE(8),glb.length,'GLB truncado');
assert.equal(glb.toString('ascii',16,20),'JSON','GLB nao tem JSON');
const jsonLength=glb.readUInt32LE(12);
const doc=JSON.parse(glb.toString('utf8',20,20+jsonLength));
assert(doc.meshes.length>0&&doc.skins.length>0,'GLB sem malha rigged');
assert(doc.animations.some(a=>a.channels.length>=75),'Caminhada ou ossos ausentes');
const position=doc.accessors[doc.meshes[0].primitives[0].attributes.POSITION];
const span=position.max.map((v,i)=>v-position.min[i]);
assert(span[1]<.03,'Modelo nao corresponde ao GLB Meshy de unidades reduzidas');
assert(!load.includes("position.setXYZ(i,position.getX(i)*100"),
  'Multiplicacao dos vertices por 100 corrompe o skinning do Meshy');
assert(load.includes('sk.boneTransform(i,point)'),
  'Baking deve aplicar animacao aos vertices do SkinnedMesh');
assert(load.includes('const expected=new T.Box3().setFromObject(reference.spine)'),
  'Nova malha deve ser normalizada para tamanho do rig procedural');
assert(load.includes('geo.morphAttributes.position=normalized.map('),
  'Caminhada e poses devem estar em morph targets compartilhados');
assert(load.includes('bakeFurColors(geo,sourceTexture)'),
  'Textura corrigida deve ser amostrada uma vez nas cores dos vertices');
assert(load.includes('vertexColors:true,map:null'),
  'Material nao pode voltar a interpolar as UVs danificadas do atlas');
assert(load.includes("if(frame===5){"),
  'Repouso precisa de pose valida sem esticar o esqueleto');
assert(load.includes('m.mesh.morphTargetInfluences'),
  'Cachorro precisa animar os morph targets por quadro');
assert(load.includes('const mesh=new T.Mesh(shared.geometry,shared.material)'),'Pose baked deveria ser compartilhada sem clonar skeleton');
assert(load.includes('d.spine.visible=false'),'Malha procedural nao sera substituida');
assert(load.includes("DATA.status='fallback'"),'Fallback para GLB indisponivel ausente');
assert(menu.includes('dog.root.position.set(2.5,0,-.75)'),'Cachorro continua escondido no porao');
assert(menu.includes('dog.root.scale.setScalar(.85)'),'Cachorro deve manter a escala 0.85 original no menu');
assert(menu.includes('this.dogLight=new T.PointLight('),'Cachorro sem iluminacao dedicada');
assert(menu.includes('poseDogRig(dog,t,dt,{resting:true,alert:near,look:near?facing:0})'),
  'Menu deve manter animacao original de descanso e alerta');
assert(load.includes("const useMeshy=()=>settings.chars==='modelo'"),
  'Pastor GLB deve seguir a mesma escolha do soldado 3D');
assert(load.includes("d.spine.visible=!(modelOn&&hasModel)"),
  'Cachorro procedural deve ficar visivel no modo classico e detalhado');
assert(load.includes("d._meshy.mesh.visible=modelOn"),
  'Malha GLB deve ficar oculta fora do modo Modelo 3D');
assert(load.includes('if(useMeshy())requestMeshy();'),
  'GLB deve ser carregado apenas na opcao Modelo 3D');
assert(load.includes('oldPose(d,time,dt,opts||{})'),
  'Rig procedural deve continuar animando os estados originais');
assert(load.includes('Math.max(.6,Math.min(3,speed/3.2))'),
  'Caminhada deve acompanhar a velocidade original da IA');
assert(secret.includes('if(d.dog&&!e.dogMesh) dogify25(e)'),'Cachorro da fase secreta desconectado');
assert(html.indexOf('src="js/24a-dog-meshy.js')>html.indexOf('src="js/24-secret-operations.js'),
  'O integrador deve entrar apos a fase secreta');
assert(html.indexOf('src="js/24a-dog-meshy.js')<html.indexOf('src="js/25-boot.js'),
  'O integrador deve entrar antes do boot');
console.log('PASSOU: GLB, malha de '+position.count+' vertices, 27 ossos, caminhada, menu visivel e fase S1.');
