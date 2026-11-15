'use strict';
// Three.js/raycast e rotinas reais, com fronteiras de áudio/UI e atores mínimos.
// Não valida animação, navegador nem trajeto das fases.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),T=require('../js/vendor/three-r128.min.js');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function fixture(){
  const sounds=[],markers=[],tags=[], scene=new T.Scene();
  const ctx=vm.createContext({T,Math,Set,console,scene,settings:{helmetSave:true,hitmarkers:true},CHEATS:{oneshot:false},
    UP:new T.Vector3(0,1,0),V3:(...v)=>new T.Vector3(...v),clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),lerp:T.MathUtils.lerp,
    W:{shootables:[],solids:[],glass:[]},G:{player:{pos:new T.Vector3(100,0,100),dead:false,vx:0,vz:0},enemies:[],stats:{hits:0,heads:0,helmets:0}},
    AudioSys:{play:id=>sounds.push(id)},FX:{burst(){},puff(){},tracer(){},flash(){}},
    hitMarker:k=>markers.push(k),headTag:()=>tags.push('head'),limbTag:t=>tags.push(t),logShot(){},lastShotLog(){},
    worldImpact(){},lightAt:()=>1,angDiff:()=>0,DEG:Math.PI/180,D:()=>({spread:0,dmg:1}),pStance:a=>a,
    hurtPlayer(){},emitNoise(){},glassAlongSeg(){},removeShootables(){},addProp(){},rnd:(a,b)=>(a+b)/2,
  });
  const core=read('js/00-core.js');vm.runInContext(core.slice(core.indexOf('const CFG='),core.indexOf('const QUALITY=')),ctx);
  vm.runInContext(core.slice(core.indexOf('const REGIONS=')),ctx);
  vm.runInContext(read('js/06-actors.js'),ctx);
  const world=read('js/03-world.js');vm.runInContext(world.slice(world.indexOf('function slab('),world.indexOf('/* --- luz ambiente')),ctx);
  const combat=read('js/07-player-combat.js');vm.runInContext(combat.slice(combat.indexOf('const raycaster=')),ctx);
  const run=s=>vm.runInContext(s,ctx);
  const target=(extra={})=>({hp:100,maxHp:100,isEnemy:true,dead:false,pos:new T.Vector3(0,0,-5),state:'COMBAT',calls:[],
    takeDamage(o){this.calls.push(o);this.hp-=o.dmg;return this.hp<=0;},...extra});
  const mesh=(char,z=-5,region='chest',extra={})=>{const m=new T.Mesh(new T.BoxGeometry(1,1,.2),new T.MeshBasicMaterial());m.position.set(0,1,z);m.userData={char,region,...extra};scene.add(m);ctx.W.shootables.push(m);return m;};
  const shot=()=>run("matricesFresh=false;resolveShot({shooter:'player',origin:V3(0,1,0),dir:V3(0,0,-1),weapon:{dmg:20,falloff:[20,45,.7]},shotId:1})");
  return {ctx,run,target,mesh,shot,sounds,markers,tags};
}
test('armadura mantém feedback metálico, sem som de carne nem acerto na cabeça',()=>{
  const f=fixture(),c=f.target();f.mesh(c,-5,'head',{armor:true});f.shot();
  assert.equal(c.calls.length,1);assert.equal(c.hp,96.8);
  assert.equal(f.markers.at(-1),'equip');assert.equal(f.sounds.filter(s=>s==='body').length,0);
  assert.equal(f.ctx.G.stats.heads,0);
});
test('dano de capacete que neutraliza alvo mostra neutralização uma vez',()=>{
  const f=fixture(),c=f.target({hp:1,helmetDur:1000,react:{hx:0,hz:0},staggerT:0,reactionT:0,aimPenalty:0});
  // weak round keeps the helmet attached: test only transferred damage, not drop physics.
  f.mesh(c,-5,'equipment',{equip:'helmet'});
  f.run("CFG.helmet.detachThreshold=1000;");f.shot();
  assert.equal(c.calls.length,1);assert.ok(c.hp<=0);
  assert.equal(f.markers.at(-1),'kill equip');assert.equal(f.ctx.G.stats.hits,1);
});
test('peito e proxies sobrepostos recebem um único dano; cobertura bloqueia',()=>{
  const f=fixture(),c=f.target();f.mesh(c);f.mesh(c,-5.1,'abdomen');f.shot();
  assert.equal(c.calls.length,1);assert.equal(c.hp,80);
  const wall=f.mesh(null,-2);wall.userData={mat:'stone'};f.shot();
  assert.equal(c.calls.length,1,'atravessou parede');
});
test('percepção do aliado usa altura absoluta, mantendo postura agachada',()=>{
  const f=fixture();f.ctx.ally={pos:new T.Vector3(1,5,2),crouch:1,speedNow:0};
  const r=f.run('Ally.prototype.targetInfo.call(ally)');
  assert.equal(r.head,6.1);assert.equal(r.chest,5.8);
});
test('tiros inimigos acertam aliado elevado e não um cilindro fantasma no chão',()=>{
  for(const y of [1.2,6.2]){
    const f=fixture();f.ctx.G.ally={pos:new T.Vector3(0,5,-5),crouch:0,dead:false,downed:false,damage:0,takeDamage(o){this.damage+=o.dmg;}};
    f.ctx.shooter={pos:new T.Vector3(0,y,0),muzzleWorld:()=>new T.Vector3(0,y,0),ew:{spread:0,dmg:10,noise:0},aimPenalty:0,suppression:0,reactionT:-2,tgtKind:'ally'};
    f.run(`Enemy.prototype.fireAt.call(shooter,{x:0,z:-5,chest:${y},head:${y+.4}})`);
    assert.equal(f.ctx.G.ally.damage,y>5?8:0,`tiro na altura ${y}`);
  }
});
test('capacete que absorve dano mantém acerto metálico e conta um único impacto',()=>{
  const f=fixture(),c=f.target({helmetDur:1000,react:{hx:0,hz:0},staggerT:0,reactionT:0,aimPenalty:0});
  f.mesh(c,-5,'equipment',{equip:'helmet'});f.run('CFG.helmet.detachThreshold=1000;');f.shot();
  assert.equal(c.calls.length,1);assert.equal(c.hp,91);assert.equal(f.ctx.G.stats.hits,1);assert.equal(f.ctx.G.stats.heads,0);assert.equal(f.markers.at(-1),'equip');
});
test('armadura letal sinaliza neutralização metálica sem fingir headshot',()=>{
  const f=fixture(),c=f.target({hp:1});f.mesh(c,-5,'head',{armor:true});f.shot();
  assert.equal(f.markers.at(-1),'kill equip');assert.equal(f.ctx.G.stats.heads,0);assert.equal(c.calls.length,1);
});
test('tiro na arma pode desarmar e atingir corpo, mas aplica dano corporal uma vez',()=>{
  const f=fixture(),c=f.target({aimPenalty:0,hasWeapon:true,disarms:0,disarm(){this.hasWeapon=false;this.disarms++;}});
  f.ctx.Math=Object.create(Math);f.ctx.Math.random=()=>0;
  f.mesh(c,-4,'equipment',{equip:'weapon'});f.mesh(c,-5,'chest');f.shot();
  assert.equal(c.disarms,1);assert.equal(c.calls.length,1);assert.equal(c.hp,80);
});
test('capacete sem proteção preserva regra de neutralização e desprende uma vez',()=>{
  const f=fixture(),c=f.target({helmetState:'ATTACHED'});const m=f.mesh(c,-5,'equipment',{equip:'helmet'});
  const group=new T.Group();f.ctx.scene.add(group);group.attach(m);c.h={helmet:group,helmetMeshes:[m],scalp:{visible:false}};
  f.ctx.settings.helmetSave=false;f.shot();
  assert.equal(c.helmetState,'DETACHED');assert.equal(f.ctx.G.stats.helmets,1);assert.equal(c.calls.length,1);assert.equal(f.markers.at(-1),'kill head');
});
