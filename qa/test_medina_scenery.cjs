'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),T=require('../js/vendor/three-r128.min.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function fronts(){
 const walls=[],glass=[],s=read('js/13-africa-operation-05.js');
 const ctx=vm.createContext({YT:3.6,M:{lime:{},fac:{}},M5:{lime:{},fac:{}},wallT:(...a)=>walls.push(a),addGlass:(...a)=>glass.push(a)});
 if(s.includes('function hotelFront05'))vm.runInContext(s.slice(s.indexOf('function hotelFront05'),s.indexOf('function buildLevel05')),ctx);
 vm.runInContext(s.slice(s.indexOf('  // (fachada frontal)')+2,s.indexOf('  // parede leste externa')),ctx);return {walls,glass};
}
test('alas frontais da 05 têm segmentos com largura positiva',()=>{
 const f=fronts();for(const w of f.walls)assert.ok(w[1]>w[0],JSON.stringify(w.slice(0,4)));
});
test('quatro vidros da 05 ficam dentro das alas e livres de paredes na abertura',()=>{
 const f=fronts();assert.equal(f.glass.length,4);
 for(const g of f.glass){const [,x0,x1,y0,y1,z0,z1]=g;assert.ok((x0>=-16&&x1<=-8)||(x0>=8&&x1<=16));
  for(const w of f.walls){const wy0=w[5]??3.6,wy1=w[6]??7;assert.ok(!(Math.min(x1,w[1])-Math.max(x0,w[0])>1e-6&&Math.min(y1,wy1)-Math.max(y0,wy0)>1e-6),'parede cobre vidro '+g[0]);}
 }
});
test('IDs dos vidros frontais continuam compatíveis com saves anteriores',()=>{
 assert.deepEqual(fronts().glass.map(g=>g[0]),['fw-16a','fw-16b','fw10a','fw10b']);
});
function fixture(){
 const added=[],pins=[],ctx=vm.createContext({T,Math,YT:3.6,TEX:{zellige:new T.Texture()},BOX:(...a)=>new T.BoxGeometry(...a),canvasTex:()=>new T.Texture(),RES:{pin:f=>pins.push(f)},G:{refs:{}},W:{solids:[],lamps:[],shootables:[]},scene:new T.Scene(),dressAdd:m=>{ctx.scene.add(m);added.push(m);}});
 const p=path.join(__dirname,'../js/23c-medina-scenery.js');if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),ctx);
 return {ctx,added,pins,run:s=>vm.runInContext(s,ctx)};
}
test('kit da Medina fica só na 05 e não registra colisores/luzes/alvos',()=>{
 const f=fixture();f.run("improveMedinaScenery({id:'04'});");assert.equal(f.added.length,0);f.run("improveMedinaScenery({id:'05'});");
 assert.ok(f.added.length>25);assert.equal(f.ctx.G.refs.medinaScenery.version,'cp03c');assert.equal(f.ctx.W.solids.length+f.ctx.W.lamps.length+f.ctx.W.shootables.length,0);
 const n=f.added.length;f.run("improveMedinaScenery({id:'05'});");assert.equal(f.added.length,n);assert.ok(new Set(f.added.map(m=>m.material)).size<=6);assert.ok(f.pins.flatMap(p=>p()).some(m=>m.isMaterial));
});
test('kit deixa livre entrada, corredores e degraus da 05',()=>{
 const f=fixture();f.run("improveMedinaScenery({id:'05'});");
 const free=[[-1.58,1.58,0,2.59,13.7,15.2],[-9.5,-8.5,3.61,5.8,-13,13],[8.5,9.5,3.61,5.8,-13,13],[-7,7,3.61,5.8,-9.5,-8.5],[.08,6.1,0,5.8,-7.9,-6.3]];
 for(const a of free){const box=new T.Box3(new T.Vector3(a[0],a[2],a[4]),new T.Vector3(a[1],a[3],a[5]));for(const m of f.added)assert.ok(!new T.Box3().setFromObject(m).intersectsBox(box),'decoração na passagem '+a);}
});
