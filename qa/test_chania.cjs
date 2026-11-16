'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),T=require('../js/vendor/three-r128.min.js');
const src=fs.readFileSync(path.join(__dirname,'../js/19-crete-operations-09-11.js'),'utf8');
const part=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b,src.indexOf(a)));
function boarding(states={pass:'done',map:'done',sched:'done',board:'active'}){
 const objectives=Object.fromEntries(Object.entries(states).map(([id,state])=>[id,{id,state}])),c=vm.createContext({G:{flags:{},enemies:[],refs:{},cred:1,disguise:{blown:false}},W:{interactables:[]},V3:(...a)=>new T.Vector3(...a),doorInteract:id=>({id}),obj:id=>objectives[id],missionComplete:()=>{c.completed++;for(const o of Object.values(objectives))if(o.state==='active')o.state='done';},completed:0});
 if(src.includes('function boardingBlock09('))vm.runInContext(part('function boardingBlock09(','function interact09('),c);
 vm.runInContext(part('function interact09(','function photos09('),c);vm.runInContext('interact09(G.refs)',c);return {c,objectives,it:c.W.interactables.find(i=>i.id==='board9')};
}
for(const missing of ['pass','map','sched'])test('embarque não encerra objetivos faltantes: '+missing,()=>{
 const s={pass:'done',map:'done',sched:'done',board:'active'};s[missing]='active';const f=boarding(s);f.it.use();assert.equal(f.c.completed,0);assert.equal(f.objectives[missing].state,'active');assert.ok(f.it.locked());assert.ok(!f.it.label().startsWith('Esconder-se'));
});
test('callback de embarque oculto não encerra a fase',()=>{const f=boarding({pass:'done',map:'done',sched:'done',board:'hidden'});f.it.use();assert.equal(f.c.completed,0);assert.equal(f.it.label(),null);});
test('embarque aceita todos os requisitos, mesmo após perder disfarce',()=>{const f=boarding();f.c.G.disguise.blown=true;f.it.use();assert.equal(f.c.completed,1);});
test('carregar visto sem passe restaura orientação para o escrivão',()=>{
 const pass={state:'active',text:'Consiga um Passierschein'},c=vm.createContext({G:{flags:{visto:true},refs:{},enemies:[]},W:{photo:[]},obj:()=>pass});vm.runInContext(part('function restore09(',"LEVELS['09']="),c);vm.runInContext('restore09({})',c);assert.ok(/visto.*escrivão/i.test(pass.text));assert.equal(c.G.cred,1);
});
function props(code){
 const solids=[],posts=[],mat=new T.MeshLambertMaterial(),c=vm.createContext({T,M:{awn:mat,awnS:mat,wood:mat,dark:mat},BOX:(...a)=>new T.BoxGeometry(...a),scene:new T.Scene(),addBlock:(a,b,d,e,h)=>solids.push({a,b,d,e,h}),addSolidOnly:(a,b,d,e,h)=>solids.push({a,b,d,e,h}),addMesh:(g,m,x,y,z)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);posts.push(o);return o;}});vm.runInContext(code,c);return {solids,posts,c};
}
for(const area of ['café','barracas'])test('apoios visíveis têm colisão na mesma posição e altura: '+area,()=>{
 const code=area==='café'?part('  { const a=new T.Mesh(BOX(7,.06,4)',"  for(const [x,z] of [[-2.6,-25]"):part('  const stall=(x,z,c)=>','  const civs=[];');const {solids,posts}=props(code);assert.equal(posts.length,area==='café'?2:6);
 for(const p of posts){const g=p.geometry.parameters;assert.ok(solids.some(s=>Math.abs((s.a+s.b)/2-p.position.x)<1e-8&&Math.abs((s.d+s.e)/2-p.position.z)<1e-8&&Math.abs(s.h-g.height)<1e-8&&Math.abs(s.b-s.a-g.width)<1e-8),'poste sem colisor: '+p.position.toArray());}
});
test('acabamento do porto fica na 09, compartilha recursos e deixa acessos/fotos livres',()=>{
 const added=[],pins=[],c=vm.createContext({T,BOX:(...a)=>new T.BoxGeometry(...a),TEX:{stone9:new T.Texture()},canvasTex:()=>new T.Texture(),G:{refs:{}},W:{solids:[],lamps:[],shootables:[]},RES:{pin:f=>pins.push(f)},dressAdd:m=>added.push(m)}),p=path.join(__dirname,'../js/23g-chania-scenery.js');
 if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),c);vm.runInContext("improveChaniaScenery({id:'10'})",c);assert.equal(added.length,0);vm.runInContext("improveChaniaScenery({id:'09'})",c);assert.ok(added.length>=12);const n=added.length;vm.runInContext("improveChaniaScenery({id:'09'})",c);assert.equal(added.length,n);assert.equal(c.W.solids.length+c.W.shootables.length+c.W.lamps.length,0);assert.equal(new Set(added.map(m=>m.material)).size,2);assert.equal(pins.flatMap(f=>f()).length,2);
 for(const bounds of [[34.45,35.55,0,2.3,-45,-43],[-34.75,-33.25,0,2.3,-20.5,-19],[38.6,41.4,0,2.3,-21,-19.5],[34.9,35.1,1.6,2,-51.7,-48],[35,46.4,1.6,2,-48.1,-47.9]]){
  const box=new T.Box3(new T.Vector3(bounds[0],bounds[2],bounds[4]),new T.Vector3(bounds[1],bounds[3],bounds[5]));for(const m of added)assert.ok(!new T.Box3().setFromObject(m).intersectsBox(box),'acabamento invade acesso/foto '+bounds);
 }
});

test('fotos já registradas não voltam a ser alvos ao carregar a 09',()=>{
 const c=vm.createContext({G:{flags:{photo_map9:true,photo_eboat:true},refs:{},enemies:[]},W:{photo:[{id:'map9'},{id:'eboat'}]}});vm.runInContext(part('function restore09(',"LEVELS['09']="),c);vm.runInContext('restore09({})',c);assert.ok(c.W.photo.every(t=>t.taken));
});

test('patrulha do cais não atravessa bancas, mesas ou apoios',()=>{
 const code=part('  { const a=new T.Mesh(BOX(7,.06,4)',"  poster(0,3.3,-22.06")+part('  const stall=(x,z,c)=>','  const civs=[];');const {solids,c}=props(code),world=fs.readFileSync(path.join(__dirname,'../js/03-world.js'),'utf8');
 vm.runInContext(src.slice(src.indexOf('const ENEMY_DEFS_09='),src.indexOf('const IT_LOOK=')),c);vm.runInContext(world.slice(world.indexOf('function slab('),world.indexOf('const _st=')),c);vm.runInContext(world.slice(world.indexOf('function segRect('),world.indexOf('function segClear2D(')),c);
 const patrol=vm.runInContext("ENEMY_DEFS_09.find(e=>e.id==='fp1').patrol",c);for(let i=0;i<patrol.length;i++){const a=patrol[i],b=patrol[(i+1)%patrol.length];for(const s of solids)assert.ok(!c.segRect(...a,...b,s.a-.36,s.b+.36,s.d-.36,s.e+.36),'trajeto colide com feira: '+a+' → '+b);}
});
