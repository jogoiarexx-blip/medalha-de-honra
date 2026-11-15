'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),T=require('../js/vendor/three-r128.min.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'),src=read('js/16-africa-operation-08.js');
const slice=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
function cell(){
 const mat=new T.MeshLambertMaterial(),ctx=vm.createContext({T,BOX:(...a)=>new T.BoxGeometry(...a),scene:new T.Scene(),W:{solids:[],shootables:[],doors:{}},MAT:{darkMetal:mat,ceil:mat},M:{adobeD:mat,adobe:mat,cot:mat},hm:()=>mat,V3:(...a)=>new T.Vector3(...a),FACE:{'+x':0,'-x':1,'+y':2,'-y':3,'+z':4,'-z':5}});
 const world=read('js/03-world.js');vm.runInContext(slice(world,'function worldUV(','/* --- colisão'),ctx);vm.runInContext(slice(world,'function makeDoor(','function buildLevel01('),ctx);
 vm.runInContext(slice(read('js/15-africa-operations-06-07-fixes.js'),'function wallOpen(','function drums('),ctx);vm.runInContext(slice(read('js/23-liberation-operations-21-24.js'),'function vehB(','const CAR_COLORS='),ctx);
 if(src.includes('function cellGate08('))vm.runInContext(slice(src,'function cellGate08(','function buildLevel08('),ctx);
 vm.runInContext(slice(src,'  // cisterna (cela de Yasmina)','  // barraca do oficial'),ctx);
 return ctx;
}
test('grade da cisterna sai por completo do vão quando a porta abre',()=>{
 const c=cell(),d=c.W.doors.cell,ray=new T.Raycaster(new T.Vector3(4,1.1,9.25),new T.Vector3(1,0,0),0,6.5);
 c.scene.updateMatrixWorld(true);assert.ok(ray.intersectObjects(c.scene.children,true).length>0);
 d.mesh.position.copy(d.open);d.solid.active=false;c.scene.updateMatrixWorld(true);assert.equal(ray.intersectObjects(c.scene.children,true).length,0,'barra fixa continuou na passagem aberta');
 assert.equal(c.W.doors.cell.id,'cell');assert.equal(c.W.shootables.filter(m=>m===d.mesh).length,1);
});
function smoke(flags){
 const objectives={smoke:{state:'active',text:'0/2',marker:{x:62,z:-14}},hold:{state:'hidden'}},pots=[{x:62,z:-14},{x:108,z:-14}],ctx=vm.createContext({T,V3:(...a)=>new T.Vector3(...a),G:{flags,refs:{pots,lrdg:[]},ally:null},W:{interactables:[]},obj:id=>objectives[id],refreshObjectiveUI:()=>{},AudioSys:{play(){}},pickupMsg(){},checkpoint:()=>ctx.saved++,buildNav:()=>ctx.nav++,saved:0,nav:0});
 if(src.includes('function syncSmoke08('))vm.runInContext(slice(src,'function syncSmoke08(','function restore08('),ctx);
 vm.runInContext(slice(src,'function restore08(','function drawMap08('),ctx);return {ctx,objectives,pots};
}
for(const flags of [{},{pot0:true,potN:1},{pot1:true,potN:1}])test('restore fumaça recupera contagem e próximo marcador '+JSON.stringify(flags),()=>{
 const {ctx:c,objectives:o}=smoke(flags);vm.runInContext('restore08({})',c);const n=+!!flags.pot0 + +!!flags.pot1;
 assert.ok(o.smoke.text.includes(n+'/2'));assert.equal(o.smoke.marker.x,flags.pot0?108:62);
});
test('primeira fumaça grava checkpoint depois de atualizar texto e marcador',()=>{
 const {ctx:c,objectives:o,pots}=smoke({});c.G.refs.pots=pots;
 vm.runInContext(slice(src,'function cp08(','function restore08('),c);
 vm.runInContext(slice(src,'function interact08(','function pickups08('),c);vm.runInContext('interact08(G.refs);W.interactables.find(i=>i.id==="pot0").use()',c);
 assert.equal(c.saved,1);assert.equal(o.smoke.marker.x,108);assert.ok(o.smoke.text.includes('1/2'));
});
test('restore embarque recalcula rotas após ativar e mover caminhões',()=>{
 const {ctx:c}=smoke({boardOn:true});c.G.refs.lrdg=[{g:{visible:false},solid:{active:false},path:[[140,-5],[118,-6]]}];c.setTruckPose07=v=>{c.pose=[v.x,v.z,v.solid.active];};c.buildNav=()=>{assert.deepEqual(c.pose,[118,-6,true]);c.nav++;};
 vm.runInContext('restore08({})',c);assert.equal(c.nav,1,'grafo ficou anterior aos caminhões restaurados');
});
test('duas fumaças restauradas mostram 2/2 sem marcador de lata pendente',()=>{
 const {ctx:c,objectives:o}=smoke({pot0:true,pot1:true,potN:2});vm.runInContext('restore08({})',c);assert.ok(o.smoke.text.includes('2/2'));assert.equal(o.smoke.marker,null);
});
test('identificação da cisterna/pista fica só na 08 e deixa o vão livre',()=>{
 const added=[],pins=[],c=vm.createContext({T,BOX:(...a)=>new T.BoxGeometry(...a),canvasTex:()=>new T.Texture(),G:{refs:{}},W:{solids:[],shootables:[],lamps:[]},RES:{pin:f=>pins.push(f)},dressAdd:m=>added.push(m)}),p=path.join(__dirname,'../js/23f-bir-zitoun-scenery.js');
 if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),c);vm.runInContext("improveBirZitounScenery({id:'07'})",c);assert.equal(added.length,0);vm.runInContext("improveBirZitounScenery({id:'08'})",c);assert.ok(added.length>=6);const n=added.length;vm.runInContext("improveBirZitounScenery({id:'08'})",c);assert.equal(added.length,n);
 const lane=new T.Box3(new T.Vector3(46,0,19),new T.Vector3(50,3,25));for(const m of added)assert.ok(!new T.Box3().setFromObject(m).intersectsBox(lane),'placa na chegada do caminhão da onda oeste');
 const passage=new T.Box3(new T.Vector3(4,0,8.36),new T.Vector3(7.4,2.3,9.64));for(const m of added)assert.ok(!new T.Box3().setFromObject(m).intersectsBox(passage));assert.equal(c.W.solids.length+c.W.shootables.length+c.W.lamps.length,0);assert.equal(new Set(added.map(m=>m.material)).size,2);assert.equal(pins.flatMap(f=>f()).length,2);
});
