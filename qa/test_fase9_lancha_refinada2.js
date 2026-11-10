'use strict';
// Uso: node qa/test_fase9_lancha_refinada2.js (na raiz do repositorio).
// Teste estrutural; a verificacao visual final deve ser feita no navegador.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../js/19-crete-operations-09-11.js'),'utf8');
for(const name of ['function harborHull09(', 'function harborBoat09(', 'function dockEdgeStrip09(',
  'Tubos de torpedo com suportes inferiores','Mastro/radar agora com base',
  'Canhão traseiro com pedestal',"LEVELS['09']={","LEVELS['10']={","LEVELS['11']={"])
  assert(src.includes(name),'Trecho faltando: '+name);
assert(src.includes('harborBoat09(46.4,-48,0,M.hull,M,true)'),'Posicao da S-Boot mudou');
assert(src.includes("id:'eboat'"),'Objetivo opcional da S-Boot foi removido');
assert(src.includes('water.position.set(0,-.82,-77)'),'Nivel da agua voltou ao anterior');
const a=src.indexOf('function harborHull09('),b=src.indexOf('function buildLevel09(){',a);
assert(a>=0&&b>a,'Funcoes da lancha ausentes');
class V {constructor(x=0,y=0,z=0){this.set(x,y,z)} set(x,y,z){this.x=x;this.y=y;this.z=z;return this} clone(){return new V(this.x,this.y,this.z)} copy(v){return this.set(v.x,v.y,v.z)} sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this} add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this} multiplyScalar(k){this.x*=k;this.y*=k;this.z*=k;return this} length(){return Math.hypot(this.x,this.y,this.z)} normalize(){return this.multiplyScalar(1/(this.length()||1))}}
class Obj {constructor(){this.children=[];this.position=new V();this.rotation={x:0,y:0,z:0};this.quaternion={setFromUnitVectors(){}}} add(o){this.children.push(o)}}
class Mesh extends Obj{constructor(geometry,material){super();this.geometry=geometry;this.material=material}}
class Geo{setAttribute(name,attr){assert(attr.array.every(Number.isFinite),'Vertices invalidos')}computeVertexNormals(){}}
class Attr{constructor(array,itemSize){this.array=array;this.itemSize=itemSize}}
class Cyl{constructor(...args){this.args=args}}
class Tor{constructor(...args){this.args=args}}
const mat=color=>({color,clone(){return mat(color)}}), scene=new Obj();
const T={Vector3:V,Group:Obj,Mesh,BufferGeometry:Geo,Float32BufferAttribute:Attr,CylinderGeometry:Cyl,TorusGeometry:Tor};
const M={hull:mat(1),hullW:mat(2),hullB:mat(3),wood:mat(4),cream:mat(5)};
const ctx={T,M,scene,hm:mat,BOX:(...size)=>({size})};vm.createContext(ctx);
vm.runInContext(src.slice(a,b),ctx,{filename:'fase9-geometria.js'});
vm.runInContext("harborBoat09(46.4,-48,0,M.hull,M,true);for(const [i,x,z,r,p] of [[0,-56,-37,.2,M.hullB],[1,-40,-38,-.3,M.hullW],[2,-20,-37.4,.1,M.hullB],[3,8,-38,.4,M.hullW]])harborBoat09(x,z,r,p,M,false,i);dockEdgeStrip09(0,-32.04,140,0,hm(0xe9dfbf),1.06,.15);",ctx);
assert.equal(scene.children.length,6,'Esperado: 1 lancha, 4 barcos e 1 borda');
assert(scene.children[0].children.length>=90,'Detalhes da lancha ausentes');
assert.equal(scene.children[0].position.x,46.4);assert.equal(scene.children[0].position.z,-48);
assert.equal(scene.children.slice(1,5).filter(b=>/^Barco pesqueiro/.test(b.name)).length,4);
assert.equal(scene.children[5].position.y,.09);
assert.equal(scene.children[5].material.polygonOffset,true,'Protecao contra z-fighting ausente');
console.log('PASSOU: lancha refinada, 4 barcos, cais e objetivo preservados.');
