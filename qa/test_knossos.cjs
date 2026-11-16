'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),T=require('../js/vendor/three-r128.min.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'),src=read('js/19-crete-operations-09-11.js');
const part=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b,src.indexOf(a)));
function escape(states={evid:'done',van:'done',charge:'done',escape:'active'},boomed=true){
 const objectives=Object.fromEntries(Object.entries(states).map(([id,state])=>[id,{id,state}])),c=vm.createContext({G:{flags:{boomed},refs:{mags:[]}},W:{interactables:[]},Y10:1.6,V3:(...a)=>new T.Vector3(...a),obj:id=>objectives[id],missionComplete:()=>{c.completed++;for(const o of Object.values(objectives))if(o.state==='active')o.state='done';},completed:0});
 if(src.includes('function escapeBlock10('))vm.runInContext(part('function escapeBlock10(','function interact10('),c);vm.runInContext(part('function interact10(','function photos10('),c);vm.runInContext('interact10(G.refs)',c);return {c,objectives,it:c.W.interactables.find(i=>i.id==='manolis')};
}
for(const id of ['evid','van','charge'])test('fuga recusa requisito faltante: '+id,()=>{const s={evid:'done',van:'done',charge:'done',escape:'active'};s[id]='active';const f=escape(s);f.it.use();assert.equal(f.c.completed,0);assert.equal(f.objectives[id].state,'active');assert.ok(f.it.locked());});
test('fuga ainda oculta não encerra missão',()=>{const f=escape({evid:'done',van:'done',charge:'done',escape:'hidden'});f.it.use();assert.equal(f.c.completed,0);assert.equal(f.it.label(),null);});
test('Manolis espera explosão e aceita três provas, van e carga concluídos',()=>{const f=escape(undefined,false);f.it.use();assert.equal(f.c.completed,0);f.c.G.flags.boomed=true;f.it.use();assert.equal(f.c.completed,1);});
function restore(flags){
 const objectives={evid:{state:'active',text:'Reúna provas do saque (0/3)',marker:{x:-8.5,z:-20}},allEvid:{state:'active'}};
 const c=vm.createContext({G:{flags,refs:{ledger:{visible:true},bull:{visible:true}}},W:{photo:[{id:'crates10'},{id:'ammo10'}]},Y10:1.6,obj:id=>objectives[id],V3:(...a)=>new T.Vector3(...a),scorchMark(){}});
 if(src.includes('function syncEvidence10('))vm.runInContext(part('function syncEvidence10(','function evid10('),c);vm.runInContext(part('function restore10(',"LEVELS['10']="),c);vm.runInContext('restore10({})',c);return {c,objectives};
}
for(const flags of [{ev_ledger:true,ev_bull:true,evN:2},{ev_crates:true,ev_ammo:true,photo_crates10:true,photo_ammo10:true,evN:2}])test('load recompõe texto e aponta prova ainda disponível '+JSON.stringify(flags),()=>{
 const {c,objectives:o}=restore(flags);assert.ok(o.evid.text.includes('2/3'));const done=flags.ev_ledger?[-6.8,-10.8]:[14,-21];assert.ok(!done.includes(o.evid.marker.x));assert.equal(c.G.flags.evN,2);
});
test('provas completas retiram marcador e fotos registradas não são repetidas',()=>{
 const {c,objectives:o}=restore({ev_ledger:true,ev_bull:true,ev_crates:true,ev_ammo:true,photo_crates10:true,photo_ammo10:true,evN:4});assert.ok(o.evid.text.includes('3/3'));assert.equal(o.evid.marker,null);assert.ok(c.W.photo.every(t=>t.taken));
});
for(const h of [1.4,2.2,2.4,2.6])test('capitel tem colisão própria, sem volume invisível abaixo da borda: '+h,()=>{
 const c=vm.createContext({T,Y10:1.6,red:new T.MeshLambertMaterial(),blk:new T.MeshLambertMaterial(),scene:new T.Scene(),W:{solids:[],shootables:[]},addSolidOnly:(a,b,d,e,height,y)=>{const s={minX:a,maxX:b,minZ:d,maxZ:e,minY:y,maxY:y+height,active:true};c.W.solids.push(s);return s;}});
 vm.runInContext(part('  const column=(x,z,h)=>','  // armazéns do oeste'),c);vm.runInContext('column(0,0,'+h+')',c);const world=read('js/03-world.js');vm.runInContext(world.slice(world.indexOf('function slab('),world.indexOf('function segRect(')),c);
 c.scene.updateMatrixWorld(true);const y=1.6+h+.15;assert.ok(new T.Raycaster(new T.Vector3(.5,y,-1),new T.Vector3(0,0,1),0,2).intersectObjects(c.scene.children).length>0);assert.ok(c.segFirst(.5,y,-1,.5,y,1),'borda visível sem colisão');assert.equal(c.segFirst(.5,1.6+h-.1,-1,.5,1.6+h-.1,1),null,'borda cria parede invisível abaixo do capitel');
});
test('acabamento de Cnossos é isolado, fixa recursos e deixa entrada/fotos livres',()=>{
 const added=[],pins=[],c=vm.createContext({T,Y10:1.6,TEX:{lime5:new T.Texture()},BOX:(...a)=>new T.BoxGeometry(...a),canvasTex:()=>new T.Texture(),G:{refs:{}},W:{solids:[],lamps:[],shootables:[]},RES:{pin:f=>pins.push(f)},dressAdd:m=>added.push(m)}),p=path.join(__dirname,'../js/23h-knossos-scenery.js');
 if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),c);vm.runInContext("improveKnossosScenery({id:'09'})",c);assert.equal(added.length,0);vm.runInContext("improveKnossosScenery({id:'10'})",c);assert.ok(added.length>=25);const n=added.length;vm.runInContext("improveKnossosScenery({id:'10'})",c);assert.equal(added.length,n);assert.equal(c.W.solids.length+c.W.lamps.length+c.W.shootables.length,0);assert.equal(new Set(added.map(m=>m.material)).size,2);assert.equal(pins.flatMap(f=>f()).length,2);
 for(const a of [[-9.5,-7.5,1.7,3.8,-17,-15],[-21,-15,2.2,3.3,-9.05,-8.95],[13.95,14.05,1.1,1.8,31,35.4]]){const box=new T.Box3(new T.Vector3(a[0],a[2],a[4]),new T.Vector3(a[1],a[3],a[5]));for(const m of added)assert.ok(!new T.Box3().setFromObject(m).intersectsBox(box),'acabamento invade passagem/foto '+a);}
});
