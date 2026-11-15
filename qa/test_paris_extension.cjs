'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),T=require('../js/vendor/three-r128.min.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
for(const hq of [false,true])test('fachadas próprias do cais usam vidro diurno sem emissão, HQ='+hq,()=>{
 const night=new T.Texture(),day=new T.Texture(),tex={};for(const k of ['facadeEm','plaster','concrete','mstone','wood'])tex[k]=new T.Texture();tex.facade=night;
 const ctx=vm.createContext({T,MAT_HQ:hq,TEX:tex,facadeDayTex:()=>day});
 const s=read('js/11-paris-operation-04.js');vm.runInContext(s.slice(s.indexOf('function mats04'),s.indexOf('function smokeColumn')),ctx);
 const mats=vm.runInContext('mats04()',ctx);
 for(const k of ['facA','facB','facC']){assert.equal(mats[k].map,day);assert.equal(mats[k].emissiveIntensity,0);if(hq)assert.equal(mats[k].bumpMap,day);}
});
function fixture(){
 const added=[],pins=[],ctx=vm.createContext({T,Math,BOX:(...a)=>new T.BoxGeometry(...a),canvasTex:()=>new T.Texture(),RES:{pin:f=>pins.push(f)},
 G:{refs:{}},W:{solids:[{id:'preservado'}],shootables:[],lamps:[],doors:{},nav:{nodes:[]}},scene:new T.Scene(),
 MAUS02:[[-22.8,-8.1,3,4,'+x'],[-8.1,8.1,4,3,'-z'],[8.1,22.8,3,3,'-z'],[22.8,8.1,3,4,'-x'],[-22.8,22.8,4,3,'+z'],[8.1,-8.1,3,3,'+x'],[-8.1,-22.8,3,3,'+z']],
 dressAdd:m=>{ctx.scene.add(m);added.push(m);}});
 const file=path.join(__dirname,'../js/23b-paris-extension.js');if(fs.existsSync(file))vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
 return {ctx,added,pins,run:s=>vm.runInContext(s,ctx)};
}
for(const id of ['02','03','04'])test('acabamento '+id+' preserva obstáculos/alvos/luzes e é idempotente',()=>{
 const f=fixture(),before=JSON.stringify(f.ctx.W);f.run(`extendParisScenery({id:'${id}'});`);
 assert.equal(JSON.stringify(f.ctx.W),before);assert.ok(f.added.length>12);assert.equal(f.ctx.G.refs.parisExtension.version,'cp03b');
 const n=f.added.length;f.run(`extendParisScenery({id:'${id}'});`);assert.equal(f.added.length,n);
 const mats=new Set(f.added.map(m=>m.material));assert.ok(mats.size<=6);assert.ok(f.pins.flatMap(p=>p()).some(m=>m.isMaterial));
 for(const mesh of f.added){assert.ok(mesh.isMesh);assert.ok(!mesh.isLight);for(const x of mesh.geometry.attributes.position.array)assert.ok(Number.isFinite(x));}
});
test('kit 02–04 não aparece na 01 nem nas demais operações',()=>{
 const f=fixture();for(const id of ['01','05','S1'])f.run(`extendParisScenery({id:'${id}'});`);assert.equal(f.added.length,0);assert.equal(f.ctx.G.refs.parisExtension,undefined);
});
test('molduras respeitam os vãos livres da varanda e do café',()=>{
 for(const [id,apertures] of [['03',[[-1.2,1.2,0,2.99,6.2,6.7]]],['04',[[-12.1,-11.8,0,2.99,-33.9,-30.1],[-12.1,-11.8,0,2.99,-37.9,-36.1]]]]){
  const f=fixture();f.run(`extendParisScenery({id:'${id}'});`);
  for(const a of apertures){const free=new T.Box3(new T.Vector3(a[0],a[2],a[4]),new T.Vector3(a[1],a[3],a[5]));
   for(const mesh of f.added)assert.equal(new T.Box3().setFromObject(mesh).intersectsBox(free),false,'decoração atravessa abertura '+id);}
 }
});
