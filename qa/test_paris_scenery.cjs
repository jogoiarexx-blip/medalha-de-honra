'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('../js/vendor/three-r128.min.js'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function fixture(){
 const solids=[],batches=[],pins=[];
 const ctx=vm.createContext({T,Math,scene:new T.Scene(),G:{refs:{}},W:{solids,shootables:[],lamps:[{id:'L1',x:0,z:30,broken:false},{id:'B1',x:19,z:0,broken:false}],doors:{}},
 canvasTex:()=>new T.Texture(),BOX:(...v)=>new T.BoxGeometry(...v),dressAdd:m=>{ctx.scene.add(m);batches.push(m);},RES:{pin:f=>pins.push(f)},
 addSolidOnly:(minX,maxX,minZ,maxZ,h,y=0,cover=false)=>{const s={minX,maxX,minZ,maxZ,minY:y,maxY:y+h,active:true,cover};solids.push(s);return s;},
 });
 const file=path.resolve(__dirname,'../js/23a-paris-scenery.js');if(fs.existsSync(file))vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
 return {ctx,solids,batches,pins,run:s=>vm.runInContext(s,ctx)};
}
test('fonte: colisores acompanham borda sem bloquear cantos vazios',()=>{
 const f=fixture();f.run('fountainCollision01();');
 assert.equal(f.solids.length,8);
 assert.ok(f.solids.some(s=>s.minX<=0&&s.maxX>=0&&s.minZ<=2&&s.maxZ>=2&&s.maxY===.6));
 assert.ok(!f.solids.some(s=>1.9>s.minX&&1.9<s.maxX&&1.9>s.minZ&&1.9<s.maxZ));
 for(const s of f.solids.filter(s=>s.maxY===.6))for(const x of [s.minX,s.maxX])for(const z of [s.minZ,s.maxZ])assert.ok(Math.hypot(x,z)<=2.21);
});
test('acabamento da 01 preserva colisores/objetivos e não afeta outras operações',()=>{
 const f=fixture();f.run("improveParisScenery({id:'02'});");assert.equal(f.batches.length,0);
 f.run("improveParisScenery({id:'01'});");assert.equal(f.solids.length,0);assert.equal(f.ctx.W.shootables.length,0);
 assert.ok(f.batches.length>30);assert.ok(f.ctx.G.refs.parisScenery.storefronts===8);
 assert.ok(f.ctx.W.lamps[0].spill);assert.ok(!f.ctx.W.lamps[1].spill);
 assert.equal(f.ctx.W.lamps[0].spill.material.depthWrite,false);
 assert.ok(f.pins.flatMap(f=>f()).length>0);
});
test('peças estáticas compartilham poucos materiais e acabamento é idempotente',()=>{
 const f=fixture();f.run("improveParisScenery({id:'01'});");const n=f.batches.length;
 assert.ok(new Set(f.batches.map(m=>m.material)).size<=8);
 f.run("improveParisScenery({id:'01'});");assert.equal(f.batches.length,n);
});

test('quebrar lampião remove halo de chão junto da luz',()=>{
 const f=fixture();f.run("improveParisScenery({id:'01'});");
 const lamp=f.ctx.W.lamps[0];lamp.lantern={visible:true};lamp.light={intensity:1};lamp.cone={visible:true};
 const src=fs.readFileSync(path.resolve(__dirname,'../js/07-player-combat.js'),'utf8');
 vm.runInContext(src.slice(src.indexOf('function breakLamp('),src.indexOf('function emitNoise(')),f.ctx);
 f.run('breakLamp(W.lamps[0],false);');assert.equal(lamp.spill.visible,false);assert.equal(lamp.light.intensity,0);assert.equal(lamp.cone.visible,false);
});
