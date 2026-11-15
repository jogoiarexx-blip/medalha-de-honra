'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),T=require('../js/vendor/three-r128.min.js');
const source=fs.readFileSync(path.join(__dirname,'../js/15-africa-operations-06-07-fixes.js'),'utf8');
function tentFixture(){const solids=[],ctx=vm.createContext({T,Math,BOX:(...a)=>new T.BoxGeometry(...a),scene:new T.Scene(),M6:{wood:new T.MeshLambertMaterial()},
 addMesh:(g,m,x,y,z)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);ctx.scene.add(o);return o;},addSolidOnly:(a,b,c,d,h)=>solids.push({a,b,c,d,h})});
 vm.runInContext(source.slice(source.indexOf('function tent('),source.indexOf('function bomberMesh(')),ctx);return {ctx,solids};}
for(const [x0,x1,z0,z1] of [[-18.6,-11,9,17.6],[8.6,18.6,11,19.4],[-12,-4,-27.4,-21],[18,28,14,22]])test('barraca: apoios e colisões acompanham cumeeira e beirais '+x0+','+z0,()=>{
 const {ctx,solids}=tentFixture();ctx.args={x0,x1,z0,z1};vm.runInContext('tent(args.x0,args.x1,args.z0,args.z1,3.2,new T.MeshLambertMaterial())',ctx);
 assert.equal(solids.length,6);for(const x of [x0,x1])for(const z of [z0,(z0+z1)/2,z1]){
  const s=solids.find(s=>Math.abs((s.a+s.b)/2-x)<1e-8&&Math.abs((s.c+s.d)/2-z)<1e-8);assert.ok(s);
  const wanted=z===(z0+z1)/2?3.2:2;assert.ok(Math.abs(s.h-wanted)<1e-8);
  const matches=ctx.scene.children.filter(m=>m.position.x===x&&m.position.z===z&&m.geometry.parameters?.height===wanted);assert.ok(matches.length,'poste visível na altura do colisor');
 }
});
test('postes do depósito deixam o vão cortável desobstruído',()=>{
 const ctx=vm.createContext({});const a=source.indexOf('function fuelFencePosts06');if(a>=0)vm.runInContext(source.slice(a,source.indexOf('function buildLevel06',a)),ctx);
 const posts=vm.runInContext('fuelFencePosts06()',ctx);assert.ok(posts.length>20);
 for(const p of posts)assert.ok(!(Math.abs(p[2]-16.05)<.01&&p[0]>23.05&&p[0]<24.55),'poste no meio do corte');
 assert.ok(posts.some(p=>p[0]===23&&p[2]===16.05));assert.ok(posts.some(p=>p[0]===24.6&&p[2]===16.05));
});
test('restaurar arame cortado reconstrói navegação com a passagem já aberta',()=>{
 const ctx=vm.createContext({G:{flags:{wireCut:true},refs:{wire:{active:true},wireMesh:[{visible:true}]},player:{}},obj:()=>({state:'active'}),buildNav:()=>{ctx.routeOpen=!ctx.G.refs.wire.active;}});
 vm.runInContext(source.slice(source.indexOf('function restore06('),source.indexOf('function drawMap06(')),ctx);vm.runInContext('restore06({})',ctx);
 assert.equal(ctx.G.refs.wire.active,false);assert.equal(ctx.G.refs.wireMesh[0].visible,false);assert.equal(ctx.routeOpen,true);
});
function decor(){const added=[],pins=[],ctx=vm.createContext({T,Math,BOX:(...a)=>new T.BoxGeometry(...a),canvasTex:()=>new T.Texture(),RES:{pin:f=>pins.push(f)},G:{refs:{}},W:{solids:[],lamps:[],shootables:[]},scene:new T.Scene(),dressAdd:m=>{ctx.scene.add(m);added.push(m);}});
 const p=path.join(__dirname,'../js/23d-bordj-scenery.js');if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),ctx);return {ctx,added,pins,run:s=>vm.runInContext(s,ctx)};}
test('kit do Bordj é isolado, compartilhado e não acrescenta colisão/luz/alvo',()=>{
 const f=decor();f.run("improveBordjScenery({id:'07'});");assert.equal(f.added.length,0);f.run("improveBordjScenery({id:'06'});");assert.ok(f.added.length>15);
 const n=f.added.length;f.run("improveBordjScenery({id:'06'});");assert.equal(f.added.length,n);assert.equal(f.ctx.W.solids.length+f.ctx.W.lamps.length+f.ctx.W.shootables.length,0);assert.ok(new Set(f.added.map(m=>m.material)).size<=5);assert.ok(f.pins.flatMap(p=>p()).some(m=>m.isMaterial));
});
test('ornamentos não invadem portais, escada e corte do arame',()=>{
 const f=decor();f.run("improveBordjScenery({id:'06'});");
 for(const a of [[-23,-19.7,0,4.3,-2.15,2.15],[19.7,21.1,0,4.3,-1.95,1.95],[9,16,0,5.7,-7.9,-6.5],[23.05,24.55,0,2.4,15.8,16.3]]){
  const b=new T.Box3(new T.Vector3(a[0],a[2],a[4]),new T.Vector3(a[1],a[3],a[5]));for(const m of f.added)assert.ok(!new T.Box3().setFromObject(m).intersectsBox(b));
 }
});
