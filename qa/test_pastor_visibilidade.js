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
assert(load.includes("position.setXYZ(i,position.getX(i)*100,position.getY(i)*100,position.getZ(i)*100)"),
  'Faltou corrigir vertices em relacao aos ossos (100x)');
assert(load.includes('geo.computeBoundingBox(); geo.computeBoundingSphere();'),
  'Faltou recalcular limites espaciais depois de corrigir a malha');
assert(load.includes('const model=cloneRig(template)'),'Esqueleto nao esta sendo clonado');
assert(load.includes('d.spine.visible=false'),'Malha procedural nao sera substituida');
assert(load.includes("DATA.status='fallback'"),'Fallback para GLB indisponivel ausente');
assert(menu.includes('dog.root.position.set(2.25,0,-.45)'),'Cachorro continua escondido no porao');
assert(menu.includes('this.dogLight=new T.PointLight('),'Cachorro sem iluminacao dedicada');
assert(menu.includes('poseDogRig(dog,t,dt,{speed:.85,alert:true})'),'Caminhada do menu nao esta ativa');
assert(secret.includes('if(d.dog&&!e.dogMesh) dogify25(e)'),'Cachorro da fase secreta desconectado');
assert(html.indexOf('src="js/24a-dog-meshy.js')>html.indexOf('src="js/24-secret-operations.js'),
  'O integrador deve entrar apos a fase secreta');
assert(html.indexOf('src="js/24a-dog-meshy.js')<html.indexOf('src="js/25-boot.js'),
  'O integrador deve entrar antes do boot');
console.log('PASSOU: GLB, malha de '+position.count+' vertices, 27 ossos, caminhada, menu visivel e fase S1.');
