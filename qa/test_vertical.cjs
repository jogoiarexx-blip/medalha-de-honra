'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const T=require('../js/vendor/three-r128.min.js'),root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function fixture(){
  const ctx=vm.createContext({T,console,Math,Set,V3:(...a)=>new T.Vector3(...a),clamp:T.MathUtils.clamp,lerp:T.MathUtils.lerp,
    W:{walk:[],solids:[],doors:{},lamps:[],pickups:[],nav:{nodes:[{x:0,z:5}]}},buildNav(){},
    G:{player:{pos:new T.Vector3(),yaw:0},ally:{pos:new T.Vector3()},objectives:[],stats:{},enemies:[],level:{},diff:'soldado'},
    save:{player:{x:0,z:0,hp:80,yaw:0,cur:'pistol',weapons:['pistol'],ammo:{pistol:{mag:8,reserve:12}}},obj:{},flags:{},doors:{},lamps:[],taken:[],enemies:[],ally:{x:0,z:5,mode:'WAIT',hp:120,joined:true,hidden:false}},
  });
  const w=read('js/03-world.js');vm.runInContext(w.slice(w.indexOf('function slab('),w.indexOf('/* --- luz ambiente')),ctx);
  vm.runInContext(read('js/06-actors.js'),ctx);
  const h=read('js/12-combat-extensions.js');vm.runInContext(h.slice(h.indexOf('function heightAt('),h.indexOf('function segClear2DH(')),ctx);
  const m=read('js/08-mission-framework.js');vm.runInContext(m,ctx);
  vm.runInContext('G=globalThis.G;',ctx);
  return {ctx,run:s=>vm.runInContext(s,ctx)};
}
const cases=[
 ['vertical de cima',[0,5,0],[0,-1,0],10,3.2],
 ['vertical de baixo',[0,-2,0],[0,1,0],10,2],
 ['vertical fora do raio',[1,5,0],[0,-1,0],10,-1],
 ['limite antes da cabeça',[0,5,0],[0,-1,0],3,-1],
 ['horizontal lateral',[0,1,5],[0,0,-1],10,4.5],
 ['acima sem cruzar corpo',[0,3,5],[0,0,-1],10,-1],
 ['origem dentro',[0,1,0],[0,0,1],10,0],
 ['direção vazia',[0,1,0],[0,0,0],10,-1],
 ['tangente',[.5,1,5],[0,0,-1],10,5],
 ['afastando',[0,1,5],[0,0,1],10,-1],
 ['quase vertical',[0,5,0],[1e-10,-1,0],10,3.2],
 ['fronteira no alcance',[0,5,0],[0,-1,0],3.2,3.2],
];
for(const [name,o,d,max,want] of cases)test('cilindro: '+name,()=>{
 const f=fixture();f.ctx.o=new T.Vector3(...o);f.ctx.d=new T.Vector3(...d);
 const t=f.run(`rayCylinder(o,d,${max},0,0,.5,0,1.8)`);
 assert.ok(Math.abs(t-want)<1e-9,`${name}: ${t} em vez de ${want}`);
});
test('cilindro oblíquo entra pelo topo antes da lateral',()=>{
 const f=fixture();f.ctx.o=new T.Vector3(0,5,0);f.ctx.d=new T.Vector3(.1,-1,0).normalize();
 assert.ok(Math.abs(f.run('rayCylinder(o,d,10,0,0,.5,0,1.8)')-3.2*Math.sqrt(1.01))<1e-9);
});
for(const mode of ['WAIT','FOLLOW'])test('save antigo sem Y restaura aliado no piso: '+mode,()=>{
 const f=fixture();f.ctx.save.ally.mode=mode;
 f.run('W.walk.push({active:true,minX:-2,maxX:2,minZ:4,maxZ:6,maxY:3}); applySave(save);');
 assert.equal(f.run('G.ally.pos.y'),3);assert.equal(f.run('G.ally.pos.z'),5);assert.equal(f.run('G.ally.mode'),mode);
 assert.equal(f.run('G.ally.hp'),120);assert.equal(f.run('G.player.ammo.pistol.mag'),8);
 if(mode==='WAIT')assert.equal(f.run('G.ally.waitPos.z'),5);
 assert.equal(Object.hasOwn(f.ctx.save.ally,'y'),false);
});
test('aliado preso se recupera no piso do ponto de navegação',()=>{
 const f=fixture();f.run('W.walk.push({active:true,minX:-2,maxX:2,minZ:4,maxZ:6,maxY:3}); Ally.prototype.recover.call(G.ally);');
 assert.equal(f.run('G.ally.pos.y'),3);assert.equal(f.run('G.ally.pos.z'),5);
});
