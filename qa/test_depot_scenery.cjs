'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),T=require('../js/vendor/three-r128.min.js');
const src=fs.readFileSync(path.join(__dirname,'../js/15-africa-operations-06-07-fixes.js'),'utf8');
test('bueiro corresponde ao vão de cerca e tem abertura sem tampa opaca',()=>{
 const meshes=[],ctx=vm.createContext({T,TEX:{lime5:new T.Texture()},scene:new T.Scene(),addMesh:(g,m,x,y,z)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);meshes.push(o);return o;},hm:()=>new T.MeshBasicMaterial()});
 const i=src.indexOf('function buildCulvert07');if(i>=0)vm.runInContext(src.slice(i,src.indexOf('function buildLevel07',i)),ctx);
 vm.runInContext('buildCulvert07()',ctx);const box=new T.Box3().setFromObject(ctx.scene);
 assert.ok(Math.abs((box.min.z+box.max.z)/2-14)<.01);assert.ok(box.min.z>=12.8&&box.max.z<=15.2);assert.ok(box.max.y>=1.9);
 const hits=new T.Raycaster(new T.Vector3(-33,1.6,14),new T.Vector3(1,0,0),0,6).intersectObjects(ctx.scene.children,true);assert.equal(hits.length,0,'abertura bloqueada por tampa');
});
test('restore07 atualiza rotas após restaurar obstáculos e sincronizar caminhões',()=>{
 const events=[],drum={id:'C',solid:{active:true},im:{visible:true}};
 const ctx=vm.createContext({G:{flags:{drums_C:true},refs:{drums:[drum]},player:{}},syncTrucks07:()=>events.push('sync'),buildNav:()=>{assert.equal(drum.solid.active,false);events.push('nav');}});
 vm.runInContext(src.slice(src.indexOf('function restore07('),src.indexOf('function drawMap07(')),ctx);vm.runInContext('restore07({})',ctx);assert.deepEqual(events,['sync','nav']);
});
test('sinalização só aparece na 07, compartilha materiais e não cria obstáculos',()=>{
 const added=[],pins=[],ctx=vm.createContext({T,BOX:(...a)=>new T.BoxGeometry(...a),canvasTex:()=>new T.Texture(),RES:{pin:f=>pins.push(f)},G:{refs:{}},W:{solids:[],shootables:[],lamps:[]},dressAdd:m=>added.push(m)});
 const p=path.join(__dirname,'../js/23e-depot-scenery.js');if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),ctx);
 vm.runInContext("improveDepotScenery({id:'06'});",ctx);assert.equal(added.length,0);vm.runInContext("improveDepotScenery({id:'07'});",ctx);assert.ok(added.length>=8);
 const n=added.length;vm.runInContext("improveDepotScenery({id:'07'});",ctx);assert.equal(added.length,n);assert.equal(ctx.W.solids.length+ctx.W.shootables.length+ctx.W.lamps.length,0);assert.ok(new Set(added.map(m=>m.material)).size<=3);assert.ok(pins.flatMap(f=>f()).length>0);
});
