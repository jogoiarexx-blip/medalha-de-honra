'use strict';



/* =========================================================
   OPERAÇÃO 15 — O Desvio (Montecalvo, Itália, 14/02/1944, fim de tarde)
   torre de vigia, depósito de combustível, chave da grade do ossário
   ========================================================= */
const Y15=3.2;
const ENEMY_DEFS_15=[
  {id:'t1',x:12,z:30,yaw:Math.PI,weapon:'rifle',helmet:true,fixed:true,sight:1.6},
  {id:'e1',x:15,z:26.5,yaw:Math.PI*.9,weapon:'rifle'},
  {id:'p1',x:1.2,z:46,weapon:'rifle',helmet:true,patrol:[[1.2,46],[1.2,18],[-1.2,18],[-1.2,46]]},
  {id:'r1',x:-2.4,z:12.4,yaw:Math.PI,weapon:'smg',helmet:true},
  {id:'r2',x:6,z:10.4,yaw:Math.PI*.8,weapon:'rifle'},
  {id:'g1',x:-20,z:42,weapon:'rifle',patrol:[[-20,42],[-20,18],[-34,18],[-34,42]]},
  {id:'k1',x:-4,z:-5,weapon:'smg',helmet:true,patrol:[[-4,-5],[-11,-5],[-11,-9],[-4,-9]]},
  {id:'d1',x:-37,z:-17,weapon:'rifle',patrol:[[-36,-17],[-15,-17]]},
  {id:'d2',x:-40,z:-18.6,yaw:Math.PI/2,weapon:'pistol',officer:true},
  {id:'d3',x:-31,z:-6.2,yaw:-Math.PI/2,weapon:'rifle',helmet:true},
  {id:'d4',x:-22,z:-21.6,yaw:0,weapon:'pistol'},
  {id:'s1',x:0,z:-33,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'s2',x:2,z:-40.4,weapon:'rifle',patrol:[[2,-40.4],[19.4,-40.4],[19.4,-44.9],[2,-44.9]]},
  {id:'s3',x:26,z:-46.5,yaw:Math.PI,weapon:'smg',helmet:true},
  {id:'s4',x:35,z:-33,yaw:Math.PI,weapon:'rifle'},
  {id:'s5',x:-18,z:-36,weapon:'rifle',helmet:true,patrol:[[-18,-36],[-18,-55],[-8,-55],[-8,-36]]},
];
function light15(x,z){ let l=.4; const R=G.refs; if(R&&R.lit15) for(const [a,b,r] of R.lit15){ const d=Math.hypot(x-a,z-b); if(d<r) l=Math.max(l,.66*(1-d/r)+.4); } return l; }
function zone15(x,z,y){ if(x>-46&&x<-12&&z>-28&&z<0) return 'Depósito do comboio'; if(z<-30) return 'Terraço do mosteiro'; if(Math.hypot(x-12,z-30)<10) return 'Torre de vigia'; return 'Estrada de Montecalvo'; }
function buildLevel15(){
  M5=mats05(); M6=mats06(); const M=M6;
  scene.background=new T.Color(0x6a6058); scene.fog=new T.FogExp2(0x7a6a5e,.012);
  skyDome(1515,[[0,'#3a3e4a'],[.3,'#6a6870'],[.44,'#b08870'],[.5,'#d89a68'],[.53,'#5a5048'],[1,'#3a3430']],null,8);
  const hemi=new T.HemisphereLight(0xb0a8a8,0x4a4032,.62); scene.add(hemi); const sun=new T.DirectionalLight(0xffb88a,.5); sun.position.set(-50,22,30); sun.target.position.set(0,0,0); scene.add(sun); scene.add(sun.target); scene.add(new T.AmbientLight(0x4a4440,.3));
  const grass=MAT_HQ?new T.MeshPhongMaterial({map:TEX.dust5,color:0x7a8058,shininess:2,specular:0x050505}):new T.MeshLambertMaterial({map:TEX.dust5,color:0x7a8058});
  const stone=new T.MeshLambertMaterial({map:TEX.lime5,color:0xb8ab98}), stoneD=new T.MeshLambertMaterial({map:TEX.lime5,color:0x8a8070}), dirt=new T.MeshLambertMaterial({map:TEX.dust5,color:0x8a7458});
  floorPlane(130,140,0,0,grass,'stone',0);
  floorPlane(6,70,0,23,M.road,'stone',.012); floorPlane(48,6,-23,-5,M.road,'stone',.012); floorPlane(4,12,0,-18,dirt,'stone',.011); floorPlane(5,8,35,-26,dirt,'stone',.011); floorPlane(34,26,-29,-14,dirt,'stone',.01);
  // limites: rocha nos lados, parapeito do vale ao sul
  const rk=(x0,x1,z0,z1,h,y0)=>addBlock(x0,x1,z0,z1,h,{y0:y0||0,mat:M.rock,surf:'stone',top:M.rock,seg:4});
  rk(-62,-50,-70,64,9); rk(50,62,-70,64,9); rk(-50,-24,-70,-30,8); rk(44,50,-70,-30,8);
  addBlock(-50,50,60,60.8,1,{mat:stoneD,surf:'stone',seg:6,cover:true}); addSolidOnly(-50,50,60,61,4);
  // terraço do mosteiro
  addWalk(-24,44,-62,-30,Y15,{mat:stone,top:grass,seg:6});
  stairSteps('z',-30,1,-2,2,Y15-.2,16,stone,stone); stairSteps('z',-30,1,33,37,Y15-.2,16,stone,stone);
  for(const [a,b] of [[-24,-2],[2,33],[37,44]]){ addBlock(a,b,-30.4,-30,.9,{y0:Y15,mat:stoneD,surf:'stone',seg:2,cover:true}); addSolidOnly(a,b,-30.4,-30,4,Y15); }
  addSolidOnly(-24.4,-24,-62,-30,4,Y15); addSolidOnly(44,44.4,-62,-30,4,Y15);
  // muralha da abadia e fachada
  addBlock(-24,44,-66,-62,12,{y0:Y15,mat:stone,surf:'stone',seg:6}); addBlock(-10,30,-80,-66,22,{y0:Y15,mat:stone,surf:'stone',top:MAT.roof,seg:4});
  for(let x=-20;x<=40;x+=6) addBlock(x-.6,x+.6,-62,-61,8,{y0:Y15,mat:stoneD,surf:'stone',seg:1});
  for(let i=0;i<16;i++){ const x=-8+i*2.5, y=Y15+14+(i%2)*4; addMesh(BOX(.7,1.6,.1),new T.MeshBasicMaterial({color:i%3?0x2a2420:0xd8a868}),x,y,-65.95,null); }
  // cemitério e ciprestes
  const stones=[]; for(let x=2;x<=18.1;x+=2.3) for(const z of [-38.2,-42.6,-47]){ addBlock(x-.32,x+.32,z-.09,z+.09,.85,{y0:Y15,mat:stoneD,surf:'stone',seg:1,cover:true}); stones.push(x); }
  const cyp=[]; for(const [x,z] of [[-2,-36],[-2,-44],[-2,-52],[22,-36],[22,-44],[40,-36],[40,-46],[40,-56],[-22,-34],[-22,-46]]){ cyp.push([x,Y15+3.6,z,1.1,6.4,1.1,0]); cyp.push([x,Y15+.6,z,.25,1.2,.25,0]); addSolidOnly(x-.35,x+.35,z-.35,z+.35,2,Y15,true); }
  instanced(new T.ConeGeometry(.9,1,8),hm(0x2a3a22),cyp.filter((c,i)=>i%2===0)); instanced(new T.CylinderGeometry(.5,.5,1,6),hm(0x3a2a1a),cyp.filter((c,i)=>i%2===1));
  // ossário (acesso à cripta)
  addBlock(23,33,-60,-50.2,5,{y0:Y15,mat:stone,surf:'stone',top:MAT.roof,seg:2}); addMesh(new T.ConeGeometry(2.2,2,4),hm(0x6a4a3a),28,Y15+6,-55,null).rotation.y=Math.PI/4;
  const grate=new T.Group(); grate.position.set(28,Y15,-50.1); scene.add(grate); for(let x=-.9;x<=.91;x+=.3){ const b=new T.Mesh(BOX(.05,2.2,.05),MAT.darkMetal); b.position.set(x,1.1,0); grate.add(b); } const gb=new T.Mesh(BOX(2,.08,.06),MAT.darkMetal); gb.position.y=1.9; grate.add(gb);
  addMesh(BOX(2,2.3,.05),new T.MeshBasicMaterial({color:0x080606}),28,Y15+1.15,-50.25,null);
  // torre de vigia
  const tower=new T.Group(); scene.add(tower); const tw=M.wood;
  for(const [a,b] of [[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]]){ const l=new T.Mesh(BOX(.22,7.4,.22),tw); l.position.set(12+a,3.7,30+b); tower.add(l); }
  for(const y of [1.6,3.4]) for(const [w,d,x,z] of [[2.6,.1,12,28.8],[2.6,.1,12,31.2],[.1,2.6,10.8,30],[.1,2.6,13.2,30]]){ const b=new T.Mesh(BOX(w,.12,d),tw); b.position.set(x,y,z); tower.add(b); }
  const plat=new T.Mesh(BOX(3.2,.2,3.2),tw); plat.position.set(12,4.9,30); tower.add(plat); const roofT=new T.Mesh(new T.ConeGeometry(2.6,1.2,4),hm(0x4a3a2a)); roofT.position.set(12,8,30); roofT.rotation.y=Math.PI/4; tower.add(roofT);
  for(const [w,d,x,z] of [[3.2,.08,12,28.4],[3.2,.08,12,31.6],[.08,3.2,10.4,30],[.08,3.2,13.6,30]]){ const r=new T.Mesh(BOX(w,.9,d),tw); r.position.set(x,5.45,z); tower.add(r); }
  for(const c of tower.children){ c.position.x-=12; c.position.z-=30; } tower.position.set(12,0,30);
  const tSolid=addSolidOnly(10.6,13.4,28.6,31.4,4.8,0), tWalk=addWalk(10.4,13.6,28.4,31.6,5,{y0:4.8,mat:tw,surf:'wood',seg:1}); tWalk.mesh&&(tWalk.mesh.visible=false);
  const tRail=[addSolidOnly(10.3,13.7,28.3,28.5,1,5),addSolidOnly(10.3,13.7,31.5,31.7,1,5),addSolidOnly(10.3,10.5,28.3,31.7,1,5),addSolidOnly(13.5,13.7,28.3,31.7,1,5)];
  // posto de controle da estrada
  makeDoor('bar15',{x:0,z:10,y0:.9,w:5.6,d:.16,h:.16,mat:M.barrier,offset:V3(0,2.4,0),npc:true,nav:true});
  addBlock(5,9,6,10,2.6,{mat:stone,surf:'stone',top:MAT.roof,seg:1}); addMesh(BOX(.8,.6,.05),new T.MeshBasicMaterial({color:0xffc070}),7,1.6,10.03,null);
  addBlock(-6.4,-3.2,9.6,10.4,.9,{mat:M.lime,surf:'stone',seg:1,cover:true});
  // depósito do comboio
  truck04(-30,-20); truck04(-30,-14); tanker(-20,-24); drums(-44,-40.8,-12,-9.4,1.8,M.drumG); crate(-16,-12,1.1,1); crate(-16,-10.8,1,.9); crate(-15.8,-11.4,.8,.8,1.1);
  tent(-44,-36,-23,-15,3.2,new T.MeshLambertMaterial({color:0x8a8462,side:T.DoubleSide})); addBlock(-42,-39.6,-21,-20,.78,{mat:M.wood,surf:'wood',cover:true,seg:1});
  const mapM=addMesh(BOX(.9,.02,.7),hm(0xd8ccb0),-40.3,.8,-20.5,null); const keyM=addMesh(BOX(.16,.03,.06),hm(0xc8a040),-41.4,.8,-20.3,null);
  const fuel=[]; const fuelG=new T.CylinderGeometry(.32,.32,.9,10), redM=MAT_HQ?new T.MeshPhongMaterial({color:0x9a2a1a,shininess:40,specular:0x442222}):new T.MeshLambertMaterial({color:0x9a2a1a});
  for(let i=0;i<10;i++){ const x=-38.6+(i%5)*.7, z=-8.4+Math.floor(i/5)*.7; const m=addMesh(fuelG,redM,x,.45,z,'metal'); m.userData.zoneHit=()=>depotBoom15('tiro'); W.shootables.push(m); fuel.push(m); }
  addSolidOnly(-39,-35.3,-8.8,-7.3,.9,0,true);
  // oliveiras, muretas
  const trunks=[], tops=[]; const clear=(x,z)=>(Math.abs(x)<5.5&&z>-14)||(z>-11&&z<1&&x<1)||(x>-48&&x<-11&&z>-28&&z<1)||(Math.hypot(x-12,z-30)<5)||(x>-9&&x<12&&z>3&&z<15)||(Math.abs(x)<4&&z<-11)||(x>29&&x<41&&z<-18)||(Math.hypot(x,z-56)<6)||z<-29;
  for(let i=0;i<260;i++){ const R=mulberry32(15000+i); const x=-48+R()*96, z=-28+R()*86; if(clear(x,z)) continue; trunks.push([x,.9,z,.25,1.8,.25,R()*3]); const s=1.5+R()*.8; tops.push([x,2.3+R()*.4,z,s,s*.75,s,R()*3]); addSolidOnly(x-.22,x+.22,z-.22,z+.22,2,0,true); }
  instanced(new T.CylinderGeometry(.5,.7,1,6),hm(0x4a3a2a),trunks); instanced(new T.IcosahedronGeometry(1,0),hm(0x5a6a48),tops);
  for(const [a,b,c,d] of [[-32,-20,30,30.7],[18,30,40,40.7],[-16,-8,24,24.7],[20,30,12,12.7],[-40,-30,8,8.7],[30,40,-8,-7.3],[-14,-8,48,48.7]]) addBlock(a,b,c,d,1,{mat:stoneD,surf:'stone',seg:2,cover:true});
  // luzes
  const lit15=[]; for(const [id,x,z,r,dx] of [['L1',3.6,13,9,-1],['L2',-34,-14.4,10,1],['L3',-24,-10,9,1]]){ const L=lampPost(id,x,z,dx,0); if(L){ L.base=1.05; L.light.intensity=1.05; } lit15.push([x,z,r]); }
  for(const [id,x,z,r] of [['L4',2.6,-32,8],['L5',30,-48,8]]){ addMesh(new T.CylinderGeometry(.06,.09,3.4,6),MAT.darkMetal,x,Y15+1.7,z,'metal'); addSolidOnly(x-.12,x+.12,z-.12,z+.12,3.4,Y15); bulb(id,x,Y15+3.5,z,r); const L=W.lamps[W.lamps.length-1]; L.base=1; L.light.intensity=1; lit15.push([x,z,r]); }
  bulb('TB',12,7.2,30,6); { const L=W.lamps[W.lamps.length-1]; L.base=.8; L.light.intensity=.8; } lit15.push([12,30,5]);
  // navegação
  const N=[];
  for(let x=-47;x<=47.1;x+=3) for(let z=-28;z<=58.1;z+=3) N.push({x,z});
  for(let x=-22;x<=42.1;x+=3) for(let z=-58;z<=-32.4;z+=3) N.push({x,z});
  for(const x of [0,35]) for(const z of [-31.6,-29.4,-27,-24.6,-22]) N.push({x,z});
  N.push({x:0,z:8.4},{x:0,z:11.6},{x:-1.6,z:10},{x:1.6,z:10},{x:20.2,z:-38.2},{x:20.2,z:-42.6},{x:-.2,z:-42.6},{x:28,z:-48.6});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=4.3; buildNav();
  return {hemi,sun,tower,tSolid,tWalk,tRail,grate,mapM,keyM,fuel,lit15};
}
function towerDown15(how){
  const F=G.flags, R=G.refs; if(F.towerDown) return; F.towerDown=true; F.armedT=false; G.progress=null;
  if(how==='charge'){ F.towerCollapsed=true; explode(V3(12,.6,30),{r:5.5,dmgE:200,dmgP:90,src:'charge',kind:'charge'}); F.towerFall=0; }
  R.tSolid.active=false; R.tWalk.active=false; for(const s of R.tRail) s.active=false; removeShootables([R.tWalk.mesh]);
  const t1=G.enemies.find(e=>e.id==='t1'); if(t1&&!t1.dead) t1.takeDamage({dmg:999,region:'chest',dir:V3(0,-1,0),point:t1.pos.clone(),shooter:'player'});
  done15tower();
}
function done15tower(){ if(obj('tower').state!=='active') return; complete('tower'); G.radioMsg('BRUNA','A torre caiu calada. A estrada é sua.','tip'); check15(); cp15(); }
function depotBoom15(how){
  const F=G.flags, R=G.refs; if(F.depotDone) return; F.depotDone=true; F.armedD=false; G.progress=null;
  for(const m of R.fuel) m.visible=false;
  explode(V3(-37,.6,-8),{r:7,dmgE:200,dmgP:90,src:'charge',kind:'wreck'}); F.boomQ=[[1.2,-30,-14],[2.2,-30,-20],[3.1,-20,-24],[3.8,-42,-10.6]]; F.boomT=0;
  G.fires=[]; complete('depot'); if(obj('quiet15').state==='active'&&!G.alarm) complete('quiet15');
  G.radioMsg('BRUNA','Brucia! Dá para ver a coluna de fumaça daqui de baixo. Agora a chave e a cripta.','tip'); check15(); cp15();
}
function check15(){ const F=G.flags; if(obj('crypt').state==='active'||obj('crypt').state==='done') return; if(F.key15&&obj('tower').state==='done'&&obj('depot').state==='done'){ activate('crypt'); G.radioMsg('ÉLISE','Torre, depósito, chave. A grade do ossário fica no terraço, à direita do cemitério.','warn'); } }
function objectives15(){ return [
  {id:'tower',text:'Neutralize a torre de vigia sobre a estrada',state:'active',marker:{x:12,z:30}},
  {id:'depot',text:'Destrua o combustível do depósito do comboio (pátio oeste)',state:'active',marker:{x:-37,z:-8}},
  {id:'key',text:'Pegue a chave da grade do ossário na tenda do comando',state:'active',marker:{x:-40.6,z:-20.5}},
  {id:'crypt',text:'Abra a grade do ossário no terraço e desça à cripta',state:'hidden',marker:{x:28,z:-49}},
  {id:'map15',text:'Opcional: fotografe o mapa de artilharia na tenda',state:'active',optional:true},
  {id:'quiet15',text:'Opcional: destrua o depósito antes de soar o alarme',state:'active',optional:true},
]; }
function interact15(R){
  const I=W.interactables, F=()=>G.flags;
  I.push({id:'chT',pt:()=>V3(12,.8,32),r:2.2,hold:()=>2.4,label:()=>F().towerDown||F().armedT?null:'Prender a carga nas pernas da torre (segure)',use:()=>{ F().armedT=true; F().fuseT=8; AudioSys.play('unlock'); pickupMsg('Carga armada — 8 s'); }});
  I.push({id:'chD',pt:()=>V3(-37,.8,-6.8),r:2.4,hold:()=>2,label:()=>F().depotDone||F().armedD?null:'Abrir um tambor e acender o pavio (segure)',use:()=>{ F().armedD=true; F().fuseD=10; AudioSys.play('unlock'); pickupMsg('Pavio aceso — 10 s'); }});
  I.push({id:'key15',pt:()=>V3(-41,.9,-20.4),r:2,label:()=>F().key15?null:'Pegar a chave e as ordens',use:()=>{ F().key15=true; R.keyM.visible=false; AudioSys.play('pickup'); pickupMsg('Chave da grade do ossário'); openDoc('ordem15'); complete('key'); check15(); cp15(); }});
  I.push({id:'grate15',pt:()=>V3(28,Y15+1.1,-49.6),r:2.4,skip:true,label:()=>obj('crypt').state==='active'?'Abrir a grade e descer à cripta':(F().key15?'Ainda não: torre e depósito primeiro':'Grade trancada'),
    use:()=>{ if(obj('crypt').state!=='active'){ G.radioMsg('ÉLISE',F().key15?'Se eu descer agora, a torre e o depósito continuam lá. Primeiro o trabalho.':'Trancada com corrente. A chave deve estar com o comando do depósito.','warn'); return; } AudioSys.play('unlock'); R.grate.rotation.y=-1.4; complete('crypt'); missionComplete(); }});
}
function photos15(){ W.photo.push({id:'map15',label:'Mapa das baterias de artilharia',pos:V3(-40.3,.82,-20.5),normal:V3(0,1,0),max:2.8,obj:'map15',size:.5,msg:'Posições de canhões ao longo do vale, marcadas a lápis vermelho.'}); }
DOCS.ordem15={title:'Ordem — Depósito Montecalvo',sub:'pasta sobre a mesa da tenda, com uma chave de ferro presa ao clipe',body:`1. O comboio sobe à noite; combustível
   reservado às baterias do vale.
2. A cripta sob o mosteiro serve de
   cela provisória: 14 prisioneiros
   aliados, transferência no dia 16.
3. Chave da grade do ossário: com o
   oficial de serviço. NÃO entregar
   aos monges.`,pencil:'Catorze prisioneiros debaixo dos nossos pés. A cripta é o caminho.'};
DOCS.carta15={title:'Bilhete de Bruna',sub:'Rede partigiana do vale',map:'15',body:'',pencil:'A torre vê a estrada inteira — vá pelos olivais. O combustível fica no pátio oeste, os tambores vermelhos. A chave da grade, na tenda do comando.'};
function drawMap15(g,w,h){
  g.fillStyle='#e0d6bc'; g.fillRect(0,0,w,h); const S=w/104, X=x=>(x+52)*S, Z=z=>(z+66)*S*.86+4;
  g.fillStyle='#a8b08a'; g.fillRect(X(-50),Z(-30),100*S,90*S*.86); g.fillStyle='#c8bca0'; g.fillRect(X(-24),Z(-62),68*S,32*S*.86); g.fillStyle='#8a7a68'; g.fillRect(X(-24),Z(-66),68*S,4*S*.86);
  g.fillStyle='#b89a70'; g.fillRect(X(-3),Z(-12),6*S,72*S*.86); g.fillRect(X(-46),Z(-8),46*S,6*S*.86); g.fillStyle='#9a8a70'; g.fillRect(X(-46),Z(-28),34*S,26*S*.86);
  g.fillStyle='#5a4a3a'; g.fillRect(X(10.6),Z(28.6),2.8*S,2.8*S*.86); g.fillRect(X(23),Z(-60),10*S,10*S*.86); g.fillRect(X(-44),Z(-23),8*S,8*S*.86);
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'11px serif'; g.fillText(s,X(x),Z(z)); };
  t('ABADIA DE MONTECALVO',10,-63,'bold 10px serif'); t('cemitério',10,-35,'italic 10px serif'); t('ossário',28,-47,'bold 10px serif'); t('torre',12,35,'bold 10px serif'); t('posto',0,6,'10px serif'); t('DEPÓSITO',-30,-26,'bold 10px serif'); t('comando',-40,-13,'9px serif'); t('combustível',-37,-3,'9px serif'); t('olivais',-24,30,'italic 11px serif'); t('olivais',30,24,'italic 11px serif'); t('estrada do vale',0,58,'10px serif');
}
function update15(dt){
  const P=G.player, F=G.flags, R=G.refs;
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('BRUNA','Benvenuta a Montecalvo. A torre da curva vê a estrada inteira — e o vigia tem binóculo. Vá pelos olivais.','tip'); }
  if(!F.i2&&G.introT>9){ F.i2=true; G.radioMsg('DICA','Torre: derrube o vigia com o fuzil de luneta (tecla 5) ou prenda uma carga nas pernas. Combustível: tiro num tambor vermelho ou pavio aceso.','tip'); }
  // vigia morto conta como torre neutralizada
  if(!F.towerDown&&obj('tower').state==='active'){ const t1=G.enemies.find(e=>e.id==='t1'); if(t1&&t1.dead){ F.towerDown=true; done15tower(); } }
  if(F.armedT&&!F.towerDown){ F.fuseT-=dt; G.progress={label:'Carga na torre: '+Math.max(0,Math.ceil(F.fuseT))+' s',v:F.fuseT/8}; if(F.fuseT<=0) towerDown15('charge'); }
  if(F.towerFall!==undefined&&F.towerFall<2.4){ F.towerFall+=dt; R.tower.rotation.z=-Math.min(1.45,F.towerFall*F.towerFall*.45); if(F.towerFall>=2.4){ AudioSys.play('wood',V3(18,0,30),1.4); AudioSys.play('thud',V3(18,0,30),1.4); FX.burst(V3(18,.3,30),30,0x8a7a5a,5,1,9.8,1.2); } }
  if(F.armedD&&!F.depotDone){ F.fuseD-=dt; G.progress={label:'Pavio no combustível: '+Math.max(0,Math.ceil(F.fuseD))+' s',v:F.fuseD/10}; if(Math.random()<dt*8) FX.puff(V3(-37,.6,-7.2),1,0xffd080,.15,.3,V3(0,1,0),.9); if(F.fuseD<=0) depotBoom15('pavio'); }
  if(F.boomQ){ F.boomT+=dt; for(const b of F.boomQ){ if(b[3]||F.boomT<b[0]) continue; b[3]=1; explode(V3(b[1],.6,b[2]),{r:5,dmgE:200,dmgP:60,src:'charge',kind:'wreck'}); if(G.fires.length<6) G.fires.push({x:b[1],z:b[2],L:G.fires.length<3?(()=>{ const l=new T.PointLight(0xff8a3a,2,18,1.6); l.position.set(b[1],2,b[2]); scene.add(l); return l; })():null}); } }
  if(G.fires) for(const f of G.fires){ if(Math.random()<dt*6) FX.puff(V3(f.x+rnd(-1,1),1.2,f.z+rnd(-1,1)),1,Math.random()<.5?0xff9a40:0x2a2420,Math.random()<.5?.8:1.6,Math.random()<.5?.6:3,V3(0,1.4,0),.6); if(f.L) f.L.intensity=1.6+Math.random()*.8; }
  // artilharia distante no vale
  F.artT=(F.artT===undefined?6:F.artT)-dt; if(F.artT<=0){ F.artT=7+Math.random()*9; F.flash=.5; AudioSys.play('explosion',V3(P.pos.x+rnd(-60,60),0,P.pos.z+70),.35); }
  if(F.flash>0){ F.flash-=dt; R.hemi.intensity=.62+Math.max(0,F.flash)*.9; } else R.hemi.intensity=.62;
  if(obj('quiet15').state==='active'&&G.alarm&&!F.depotDone) failObjective('quiet15');
}
function cp15(){ checkpoint(); }
function restore15(s){ const F=G.flags, R=G.refs;
  if(F.towerCollapsed){ R.tower.visible=false; R.tSolid.active=false; R.tWalk.active=false; removeShootables([R.tWalk.mesh]); for(const r of R.tRail) r.active=false; F.towerFall=9; F.armedT=false; }
  if(F.depotDone){ for(const m of R.fuel) m.visible=false; F.armedD=false; G.fires=[]; if(F.boomQ) for(const b of F.boomQ){ b[3]=1; if(G.fires.length<4) G.fires.push({x:b[1],z:b[2],L:null}); } }
  if(F.key15) R.keyM.visible=false; if(F.armedT&&!F.towerDown) F.fuseT=Math.max(F.fuseT||0,5); if(F.armedD&&!F.depotDone) F.fuseD=Math.max(F.fuseD||0,5);
}
LEVELS['15']={id:'15',num:15,op:'Operação 15',name:'O Desvio',place:'Montecalvo, Itália',prev:'14',
  loadout:{weapons:['rifle','silenced','smg'],ammo:{rifle:{mag:5,reserve:20},silenced:{mag:6,reserve:12},smg:{mag:32,reserve:64}},cur:'silenced',camera:true},baseLight:.45,lightFn:light15,zoneAt:zone15,shadows:false,bloomTh:.8,grenades:true,
  build:()=>{ const r=buildLevel15(); photos15(); return r; },enemies:ENEMY_DEFS_15,ally:null,start:{x:0,z:56,yaw:0},startDocs:['carta15'],drawMap:drawMap15,
  reinf:[{id:'n1',x:-46,z:-6,weapon:'smg',helmet:true},{id:'n2',x:-46,z:-3,weapon:'rifle',helmet:true,nades:1},{id:'n3',x:40,z:-40,weapon:'rifle',helmet:true}],
  radio:{x:-42.4,z:-18,fx:-41.4,fz:-18.6},radioRun:'O oficial corre para o rádio da tenda!',alarmPos:V3(-42,1.4,-18),alarmText:'Alarme no depósito! Patrulhas sobem pela estrada do vale.',alarmObjective:null,
  alarmYes:'O alarme soou antes da hora. ',alarmLate:'O alarme só soou com o combustível já em chamas. ',alarmNo:'',alarmOk:()=>!!G.flags.depotDone,deathText:'Os paraquedistas de Montecalvo encontraram Élise nos olivais.',
  objectives:objectives15,interact:interact15,pickups:()=>{ addPickup('m_r1',-24,30,'rifle',5,.1); addPickup('m_med1',8.6,8,'med',30,.1); addPickup('m_nade1',-16,-13,'nade',2,.1); addPickup('m_med2',18,-34,'med',35,Y15+.1); addPickup('m_smg1',-31,-11,'smg',32,.1); addPickup('m_med3',-38,20,'med',25,.1); G.player.nades=Math.max(G.player.nades||0,1); },
  update:update15,restore:restore15,
  resultTitle:'O desvio',outro:['ÉLISE','A grade range e o cheiro de pedra molhada sobe da escada. Lá em baixo, entre os ossos dos monges, há catorze homens vivos esperando.'],menuCam:{cx:-8,cz:40,y:4,tx:12,tz:20},ambient:'forest',mist:null,
  briefing:{meta:'ITÁLIA — 14 DE FEVEREIRO DE 1944 — 17h20',paras:['A lista de Schwarzfels apontou para o sul: a Abadia de Montecalvo, no alto do vale, virou depósito e prisão. As baterias que seguram a frente vivem do combustível que sobe a estrada à noite, sob os olhos de uma torre de vigia.','A partigiana Bruna guia Élise pelos olivais. Neutralize a torre, queime o combustível do comboio e encontre a chave da grade do ossário: a cripta é o caminho até os prisioneiros.'],list:['Neutralizar a torre de vigia','Destruir o combustível do depósito','Chave da grade do ossário → cripta']}};
LEVEL_ORDER.push('15');


/* =========================================================
   OPERAÇÃO 16 — Prisioneiros de Guerra (cripta de Montecalvo, 14/02/1944, 22h)
   celas, catacumbas, Capitão Hale (seguir/aguardar), túnel do poço
   ========================================================= */
const ENEMY_DEFS_16=[
  {id:'k1',x:20,z:17,weapon:'rifle',helmet:true,patrol:[[20,17],[27,17],[27,14],[20,14]]},
  {id:'k2',x:16.5,z:28,yaw:-Math.PI/2,weapon:'smg'},
  {id:'w1',x:20,z:-6,weapon:'rifle',patrol:[[20,-6],[29,-6],[29,6],[20,6]]},
  {id:'w2',x:16.6,z:-1,yaw:-Math.PI/2,weapon:'smg',helmet:true},
  {id:'o1',x:26,z:-24,yaw:Math.PI,weapon:'pistol',officer:true},
  {id:'o2',x:20,z:-28,yaw:0,weapon:'rifle'},
  {id:'i1',x:10,z:-22,yaw:-Math.PI/2,weapon:'pistol',officer:true},
  {id:'c1',x:-8,z:15,weapon:'rifle',lantern:true,patrol:[[-8,15],[10,15],[10,8],[-8,8]]},
  {id:'c2',x:-2,z:0,weapon:'smg',lantern:true,patrol:[[-2,0],[10,0],[10,-6],[-2,-6]]},
  {id:'c3',x:-10,z:-13,weapon:'rifle',lantern:true,patrol:[[-10,-13],[10,-13]]},
  {id:'j1',x:-23,z:28,weapon:'smg',patrol:[[-23,28],[-23,3]]},
  {id:'j2',x:-17.5,z:19,yaw:Math.PI/2,weapon:'pistol'},
  {id:'q1',x:-24,z:-8,yaw:Math.PI/2,weapon:'rifle',helmet:true},
  {id:'x1',x:-20,z:-24,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'x2',x:-27,z:-21,yaw:Math.PI*.8,weapon:'smg',helmet:true},
];
const POW_LOOK=[{uniform:0x8a7a58,pants:0x6a5a40,skin:0xd0a080,hair:0x6a4a2a},{uniform:0x5a6040,pants:0x4a4a36,skin:0xc89070,hair:0x2a1a10},{uniform:0x7a6a50,pants:0x5a5040,skin:0x8a5a3a,hair:0x140e0a}];
function light16(x,z){ return .3; }
function zone16(x,z){ if(x>14&&z>12) return 'Cripta dos ossos'; if(x>14&&z>-16) return 'Depósito'; if(x>16&&z<-16) return 'Escritório'; if(x>0&&z<-16) return 'Interrogatório'; if(z<-16) return 'Túnel do poço'; if(x<-14&&z>0) return 'Celas'; if(x<-14) return 'Carvoaria'; if(z>19) return 'Corredor'; return 'Catacumbas'; }
function buildLevel16(){
  M5=mats05(); M6=mats06(); const M=M6, H=3.4;
  scene.background=new T.Color(0x050506); scene.fog=new T.FogExp2(0x0a0908,.045);
  scene.add(new T.HemisphereLight(0x8a7a6a,0x2a221a,.62)); scene.add(new T.AmbientLight(0x3a3028,.5));
  const stone=new T.MeshLambertMaterial({map:TEX.lime5,color:0x8a8070}), stoneD=new T.MeshLambertMaterial({map:TEX.lime5,color:0x5a5248}), floorM=new T.MeshLambertMaterial({map:TEX.lime5,color:0x5a5046});
  floorPlane(66,66,0,0,floorM,'stone',0);
  addBlock(-33,33,-33,33,.4,{y0:H,mat:stoneD,bottom:MAT.ceil,surf:'stone',seg:6});
  const wl=(axis,c0,c1,a0,a1,ops,mat)=>wallOpen(axis,c0,c1,a0,a1,H,ops||[],mat||stone,{inner:{}});
  // muralhas externas
  wl('x',-32.4,-32,-33,33); wl('x',32,32.4,-33,33); wl('z',-32.4,-32,-32,32); wl('z',32,32.4,-32,32);
  // faixa norte (túnel / interrogatório / escritório)
  wl('x',-16.2,-16,-32,32,[{c:-23,w:1.6},{c:-7,w:1.6},{c:8,w:1.4},{c:23,w:1.6}]); wl('z',-.2,0,-32,-16); wl('z',16,16.2,-32,-16);
  // parede oeste das catacumbas / leste das celas
  wl('z',-14.2,-14,-16,32,[{c:-8,w:1.6},{c:22,w:1.6}]);
  // parede leste das catacumbas / oeste do depósito e da cripta
  wl('z',14,14.2,-16,32,[{c:-2,w:1.6},{c:22,w:1.6}]); wl('x',12,12.2,14,32,[{c:23,w:1.6}]);
  // corredor
  wl('x',18.8,19,-14,14,[{c:0,w:1.8}]); wl('x',25,25.2,-14,14); addBlock(-14,14,25.2,32,H,{mat:stoneD,surf:'stone',seg:4});
  // bloco das celas
  wl('x',-.2,0,-32,-14,[{c:-23,w:1.6}]);
  const cellsW=[[0,8],[8,16],[16,24],[24,32]], cellsE=[[0,8],[8,16]];
  wl('z',-25.2,-25,0,32,cellsW.map(([a,b])=>({c:(a+b)/2,w:1.3})));
  wl('z',-21,-20.8,0,32,[{c:4,w:1.3},{c:12,w:1.3},{c:24,w:1.6}]);
  for(const z of [8,16,24]) wl('x',z-.1,z+.1,-32,-25.2); wl('x',7.9,8.1,-20.8,-14.2); wl('x',15.9,16.1,-20.8,-14.2);
  const cells=[]; cellsW.forEach(([a,b],i)=>{ const c=(a+b)/2; makeDoor('cell'+i,{x:-25.1,z:c,w:.1,d:1.3,h:2.3,mat:MAT.darkMetal,offset:V3(0,0,1.3),locked:true,npc:false,nav:true,snd:'door'}); cells.push({i,door:'cell'+i,x:-28.5,z:c,ex:-23,ez:c}); });
  cellsE.forEach(([a,b],k)=>{ const c=(a+b)/2, i=4+k; makeDoor('cell'+i,{x:-20.9,z:c,w:.1,d:1.3,h:2.3,mat:MAT.darkMetal,offset:V3(0,0,1.3),locked:true,npc:false,nav:true,snd:'door'}); cells.push({i,door:'cell'+i,x:-17.5,z:c,ex:-23,ez:c}); });
  for(const c of cells){ for(const dz of [-2.2,2.2]) addBlock(c.x-.9,c.x+.9,c.z+dz-.45,c.z+dz+.45,.45,{mat:M.cot,surf:'cloth',seg:1}); }
  // sala da guarda: alavanca das celas
  addBlock(-16,-14.4,27,31,.8,{mat:M.wood,surf:'wood',cover:true,seg:1}); const lever=new T.Group(); lever.position.set(-15.2,1.5,30.4); scene.add(lever); const lb=addMesh(BOX(.5,.7,.2),MAT.darkMetal,-15.2,1.5,30.6,'metal'); const lh=new T.Mesh(BOX(.06,.5,.06),hm(0xa02a1a)); lh.position.y=.25; lever.add(lh); lever.rotation.x=-.6;
  // catacumbas: paredes de nichos
  const niche=new T.MeshLambertMaterial({map:TEX.lime5,color:0x7a6e5e});
  for(const [a,b,z] of [[-14,-4,-10],[0,14,-10],[-10,14,-3],[-14,-6,4],[-2,8,4],[-10,14,11]]){ addBlock(a,b,z-.3,z+.3,H,{mat:niche,surf:'stone',seg:2}); for(let x=a+1;x<b-.5;x+=1.6) for(const y of [.6,1.5,2.4]) for(const s of [-1,1]) addMesh(BOX(1.1,.5,.05),new T.MeshBasicMaterial({color:0x1a1612}),x+.3,y,z+s*.31,null); }
  const skulls=[]; for(let i=0;i<90;i++){ const R=mulberry32(1600+i); const segs=[[-14,-4,-10],[0,14,-10],[-10,14,-3],[-14,-6,4],[-2,8,4],[-10,14,11]]; const sg=segs[i%6]; const x=sg[0]+1.2+R()*(sg[1]-sg[0]-2.4), y=[.6,1.5,2.4][Math.floor(R()*3)], s=R()<.5?-1:1; skulls.push([x,y,sg[2]+s*.36,.16,.16,.16,0]); }
  instanced(new T.SphereGeometry(1,6,5),hm(0xd8ccb0),skulls);
  // cripta dos ossos (início)
  for(const [x,z] of [[19,18],[19,26],[27,18],[27,26]]){ addMesh(new T.CylinderGeometry(.45,.5,H,10),stone,x,H/2,z,'stone'); addSolidOnly(x-.45,x+.45,z-.45,z+.45,H,0,true); }
  for(let z=14;z<31;z+=2.2) for(const y of [.7,1.7,2.6]) addMesh(BOX(.06,.6,1.6),new T.MeshLambertMaterial({map:TEX.lime5,color:0xc8bca0}),31.9,y,z,null);
  addBlock(28,32,29,32,H,{mat:stone,surf:'stone',seg:1});
  addBlock(21,25,21,23,.9,{mat:stoneD,surf:'stone',seg:1,cover:true});
  // depósito: caixas de obras roubadas
  for(const [x,z] of [[18,-12],[18,-9.8],[21,-12],[26,-12],[28.5,-12],[28.5,-9.6],[18,8],[20.2,8],[28,9],[28,6.6],[24,1],[24,-2]]) crate(x,z,1.9,1.4);
  for(const [x,z] of [[18,-11],[26,-11.8],[28,8]]) crate(x,z,1.2,.9,1.4);
  const stencil=poster(24,1.1,2.02,0,1.2,.6,(g,w,h)=>{ g.fillStyle='#8a6a42'; g.fillRect(0,0,w,h); g.fillStyle='#1a1410'; g.font='bold 34px monospace'; g.textAlign='center'; g.fillText('K.S. MONTECALVO',w/2,h*.45); g.font='26px monospace'; g.fillText('Nr. 417 — TIZIANO',w/2,h*.8); });
  // escritório
  addBlock(24,28,-26,-24.8,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); const keyM=addMesh(BOX(.16,.03,.06),hm(0xc8a040),25,.8,-25.4,null); const papers=addMesh(BOX(.5,.02,.36),hm(0xe0d4b8),26.6,.8,-25.4,null);
  addBlock(30.4,32,-30,-27,1.4,{mat:MAT.darkMetal,surf:'metal',seg:1}); addMesh(BOX(.6,.4,.4),hm(0x3a3a30),29.4,1,-28,'metal');
  // interrogatório
  makeDoor('intr',{x:8,z:-16.1,w:1.4,d:.1,h:2.3,mat:MAT.darkMetal,offset:V3(1.4,0,0),locked:true,npc:true,nav:true,snd:'door'});
  addBlock(4,7,-27,-25.6,.75,{mat:M.wood,surf:'wood',cover:true,seg:1}); addMesh(new T.CylinderGeometry(.03,.03,1.6,4),MAT.darkMetal,4,2.6,-22,null);
  // carvoaria e túnel do poço
  for(const [x0,x1,z0,z1] of [[-31,-28,-15,-12],[-31,-29,-6,-2],[-18,-15.6,-15,-12.4]]) addBlock(x0,x1,z0,z1,1.4,{mat:hm(0x1a1816),surf:'stone',seg:1,cover:true});
  for(let i=0;i<14;i++){ const R=mulberry32(1660+i); const s=.3+R()*.5; addMesh(new T.DodecahedronGeometry(s,0),stoneD,-30+R()*3.6,s*.4,-30+R()*3.6,'stone'); }
  addMesh(new T.CylinderGeometry(1.3,1.3,.1,16),new T.MeshBasicMaterial({color:0x8a9aa8}),-29,H-.02,-29,null);
  for(let y=.3;y<H;y+=.45) addMesh(BOX(.9,.05,.05),MAT.darkMetal,-30.6,y,-29,null);
  const shaft=new T.PointLight(0x9ab0c8,.9,7,1.6); shaft.position.set(-29,H-.4,-29); scene.add(shaft);
  // luzes
  for(const [id,x,z,r] of [['B1',23,24,8],['B2',23,15,7],['B3',0,22,8],['B4',-23,28,7],['B5',-23,14,7],['B6',-23,4,7],['B7',-17,24,6],['B8',0,15,6],['B9',4,-6,6],['B10',-8,-13,6],['B11',23,-4,9],['B12',25,-24,7],['B13',8,-24,6],['B14',-23,-8,7],['B15',-20,-25,7]]){ bulb(id,x,H-.5,z,r); const L=W.lamps[W.lamps.length-1]; L.base=1.05; L.light.intensity=1.05; L.light.distance=r*1.5; }
  // prisioneiros
  const pows=[]; let n=0; for(const c of cells){ const k=c.i===0?3:2; for(let j=0;j<k;j++){ const lk=POW_LOOK[(n++)%3]; const a=new Actor({id:'pow'+n,x:c.x+(j-(k-1)/2)*1.1*(c.x<-23?1:-1)*0,z:c.z+(j-(k-1)/2)*1.4,yaw:c.x<-23?Math.PI/2:-Math.PI/2},Object.assign({weapon:null,boots:true,cap:null},lk)); removeShootables(a.h.hitMeshes); a.aimTarget=0; a.crouchTarget=j%2?.6:0; pows.push({a,c,stage:0,delay:j*.6+c.i*.35,done:false}); } }
  // navegação
  const N=[];
  for(let x=-30.5;x<=30.6;x+=2.2) for(let z=-30.5;z<=30.6;z+=2.2) N.push({x,z});
  for(const [x,z] of [[-23,-16],[-23,-17.6],[-23,-14.4],[-7,-16],[-7,-17.6],[-7,-14.4],[8,-16],[8,-17.6],[8,-14.4],[23,-16],[23,-17.6],[23,-14.4],[-14,-8],[-15.6,-8],[-12.4,-8],[-14,22],[-15.6,22],[-12.4,22],[14,-2],[12.4,-2],[15.6,-2],[14,22],[12.4,22],[15.6,22],[23,12],[23,10.4],[23,13.6],[0,19],[0,17.4],[0,20.6],[-23,0],[-23,1.6],[-23,-1.6],[-20.9,24],[-22.5,24],[-19.3,24],[-5,-10],[-1,-10],[-12,-3],[-12,4],[-4,4],[7,4],[11,4],[-12,11]]) N.push({x,z});
  for(const c of cells){ N.push({x:c.x,z:c.z},{x:(c.x<-23?-25.1:-20.9),z:c.z},{x:(c.x<-23?-26.6:-19.4),z:c.z}); }
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.36)); W.nav.link=3.4; buildNav();
  return {cells,lever,keyM,papers,pows,shaft};
}
function objectives16(){ return [
  {id:'key16',text:'Pegue a chave do interrogatório no escritório (nordeste)',state:'active',marker:{x:25,z:-25.4}},
  {id:'cells',text:'Abra as celas pela alavanca da sala da guarda (oeste)',state:'active',marker:{x:-15.2,z:30.4}},
  {id:'hale',text:'Liberte o Capitão Hale na sala de interrogatório',state:'active',marker:{x:5,z:-24}},
  {id:'exit16',text:'Leve Hale até o túnel do poço (noroeste)',state:'hidden',marker:{x:-29,z:-29}},
  {id:'art16',text:'Opcional: fotografe as caixas de obras roubadas no depósito',state:'active',optional:true},
  {id:'hale50',text:'Opcional: Hale chega ao túnel com mais da metade da saúde',state:'active',optional:true},
]; }
function check16(){ if(obj('hale').state==='done'&&obj('cells').state==='done'&&obj('exit16').state==='hidden'){ activate('exit16'); G.radioMsg('HALE','Os rapazes já estão no túnel. Vamos atrás deles — eu cubro sua retaguarda.','warn'); } }
function interact16(R){
  const I=W.interactables, F=()=>G.flags;
  I.push({id:'key16',pt:()=>V3(25.6,.9,-25.4),r:2,label:()=>F().key16?null:'Pegar a chave e a lista de transferência',use:()=>{ F().key16=true; R.keyM.visible=false; R.papers.visible=false; AudioSys.play('pickup'); pickupMsg('Chave do interrogatório'); openDoc('lista16'); complete('key16'); cp16(); }});
  I.push({id:'intr',pt:()=>V3(8,1.2,-15.6),r:2,label:()=>W.doors.intr.state==='LOCKED'?(F().key16?'Destrancar o interrogatório':'Porta trancada — a chave fica no escritório'):null,
    use:()=>{ const d=W.doors.intr; if(d.state!=='LOCKED') return; if(!F().key16){ AudioSys.play('metal',d.mesh.position,.6); return; } AudioSys.play('unlock'); d.state='CLOSED'; openDoor(d,null); }});
  I.push({id:'lever16',pt:()=>V3(-15.2,1.5,30.4),r:2.2,hold:()=>1.4,label:()=>F().cellsOpen?null:'Puxar a alavanca das celas (segure — faz barulho)',
    use:()=>{ F().cellsOpen=true; R.lever.rotation.x=.6; AudioSys.play('clank',V3(-23,1,16),1.4); emitNoise(V3(-23,1,16),16,'lure',null); for(const c of R.cells){ const d=W.doors[c.door]; d.state='CLOSED'; openDoor(d,null); }
      complete('cells'); G.radioMsg('HALE?','(gritos abafados) As portas! Andem, rapazes, pelo túnel do poço!'); check16(); cp16(); }});
  I.push({id:'hale',pt:()=>{ const A=G.ally; return V3(A.pos.x,A.pos.y+1.1,A.pos.z); },r:2.4,skip:true,
    label:()=>{ const A=G.ally; if(!A) return null; if(A.downed) return 'Reanimar o Capitão Hale'; if(!A.joined&&W.doors.intr.state!=='LOCKED') return 'Soltar o Capitão Hale'; return null; },
    hold:()=>G.ally.downed?1.6:.8,
    use:()=>{ const A=G.ally; if(A.downed){ A.revive(); return; } A.joined=true; A.mode='FOLLOW'; A.hidden=false; complete('hale');
      G.radioMsg('HALE','Capitão Arthur Hale, Royal Engineers. Me dê qualquer coisa que atire. (G: Hale segue / espera)'); check16(); cp16(); }});
  I.push({id:'exit16',pt:()=>V3(-29.6,1.2,-29),r:2.6,skip:true,label:()=>obj('exit16').state==='active'?'Subir pelo poço com Hale':null,
    use:()=>{ const A=G.ally; if(!A||A.downed||Math.hypot(A.pos.x-G.player.pos.x,A.pos.z-G.player.pos.z)>8){ G.radioMsg('ÉLISE','Hale ficou para trás. Não subo sem ele. (G: chamar)','warn'); if(A&&A.mode!=='FOLLOW') toggleAlly(); return; }
      if(A.hp>A.maxHp*.5) complete('hale50'); else failObjective('hale50'); complete('exit16'); missionComplete(); }});
}
function photos16(){ W.photo.push({id:'art16',label:'Caixas “K.S. Montecalvo”',pos:V3(24,1.1,2.1),normal:V3(0,0,1),max:3.4,obj:'art16',size:.7,msg:'Tiziano, Nr. 417 — e mais quatrocentas caixas numeradas.'}); }
DOCS.lista16={title:'Transferência — 16.II.44',sub:'papel timbrado do escritório da cripta',body:`Prisioneiros: 13 + 1 oficial (Hale, A.,
Royal Engineers) — interrogatório
diário, sala 3. Transferência por
caminhão às 05h00.

Caixas K.S. 401-417: embarque junto.
Poço do claustro: TAPADO? — verificar.`,pencil:'“Verificar” quer dizer que ninguém verificou. O poço é a saída.'};
function update16(dt){
  const P=G.player, F=G.flags, R=G.refs, A=G.ally;
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('ÉLISE','Debaixo do mosteiro. Celas a oeste, escritório a nordeste. E a Bruna disse: o poço do claustro, a noroeste, ainda desce até aqui.','tip'); }
  if(!F.i2&&G.introT>9){ F.i2=true; G.radioMsg('DICA','Depois de soltar Hale, G alterna entre seguir e aguardar. Deixe-o esperando antes de um tiroteio difícil.','tip'); }
  // prisioneiros fogem pelo túnel
  for(const p of R.pows){ const a=p.a; if(p.done) continue;
    if(F.cellsOpen){ p.delay-=dt; if(p.delay<=0){ const wps=[[p.c.ex,p.c.ez],[-23,-2],[-23,-12],[-23,-17.5],[-28.6,-28.6]]; if(p.stage===3&&G.enemies.some(e=>(e.id==='x1'||e.id==='x2')&&!e.dead)){ a.speedNow=0; a.crouchTarget=.7; a.animate(dt); if(!F.powWait){ F.powWait=true; G.radioMsg('HALE','Os rapazes esperam na carvoaria: tem guarda no túnel do poço.','warn'); } continue; } const w=wps[p.stage]; const dx=w[0]-a.pos.x, dz=w[1]-a.pos.z, d=Math.hypot(dx,dz);
        if(d<.3){ p.stage++; if(p.stage>=wps.length){ p.done=true; a.h.root.visible=false; F.powOut=(F.powOut||0)+1; continue; } }
        else { const sp=Math.min(d,2.8*dt); a.pos.x+=dx/d*sp; a.pos.z+=dx===0&&dz===0?0:dz/d*sp; a.yaw=Math.atan2(dx,dz); a.speedNow=2.8; a.crouchTarget=.25; } } else a.speedNow=0; }
    else { a.speedNow=0; }
    a.animate(dt); }
  if(F.cellsOpen&&!F.powMsg&&(F.powOut||0)>=13){ F.powMsg=true; pickupMsg('Os 13 prisioneiros subiram pelo poço'); }
  if(A&&!A.joined&&!A.hidden){ A.aimTarget=0; }
}
function cp16(){ checkpoint(); }
function restore16(s){ const F=G.flags, R=G.refs;
  if(F.key16){ R.keyM.visible=false; R.papers.visible=false; }
  if(F.cellsOpen){ R.lever.rotation.x=.6; for(const c of R.cells){ const d=W.doors[c.door]; if(d.state==='LOCKED'){ d.state='CLOSED'; openDoor(d,null); } } for(const p of R.pows){ p.done=true; p.a.h.root.visible=false; } }
}
LEVELS['16']={id:'16',num:16,op:'Operação 16',name:'Prisioneiros de Guerra',place:'Cripta de Montecalvo, Itália',prev:'15',
  loadout:{weapons:['silenced','smg','pistol'],ammo:{silenced:{mag:6,reserve:18},smg:{mag:32,reserve:64},pistol:{mag:8,reserve:16}},cur:'silenced',camera:true},baseLight:.3,lightFn:light16,zoneAt:zone16,shadows:false,bloomTh:.75,grenades:true,
  build:()=>{ const r=buildLevel16(); photos16(); return r; },enemies:ENEMY_DEFS_16,
  ally:{id:'hale',x:5.5,z:-24,yaw:0,caged:true,name:'HALE',title:'Capitão Hale',hp:140,range:40,dmg:34,look:{uniform:0x7a6a4a,pants:0x5a4a34,skin:0xd8a888,hair:0x8a6a3a,cap:null,weapon:'pistol'},failTitle:'Hale não resistiu',failText:'O Capitão Hale ficou caído tempo demais nas catacumbas.'},
  start:{x:29,z:27,yaw:Math.PI/2},startDocs:[],drawMap:null,
  reinf:[{id:'n1',x:28,z:-8,weapon:'smg',helmet:true},{id:'n2',x:28,z:-4,weapon:'rifle',helmet:true,nades:1},{id:'n3',x:-28,z:-10,weapon:'rifle',helmet:true}],
  radio:{x:29.4,z:-28,fx:28.4,fz:-27},radioRun:'O oficial corre para o rádio do escritório!',alarmPos:V3(29,1.4,-28),alarmText:'Alarme na cripta! Reforços descem do mosteiro.',alarmObjective:null,
  alarmYes:'O alarme soou nas catacumbas. ',alarmLate:'',alarmNo:'',deathText:'Os guardas da cripta encontraram Élise entre os ossos.',
  objectives:objectives16,interact:interact16,pickups:()=>{ addPickup('c_med1',22,22,'med',30,.1); addPickup('c_smg1',-17,30.5,'smg',32,.85); addPickup('c_nade1',27,-14,'nade',2,.1); addPickup('c_med2',-2,-14,'med',35,.1); addPickup('c_sil1',6,13,'silenced',6,.1); addPickup('c_med3',-30,-10,'med',40,.1); },
  update:update16,restore:restore16,
  resultTitle:'Prisioneiros de guerra',outro:['ÉLISE','O poço tem cento e doze degraus de ferro. Hale conta cada um em voz baixa. Lá em cima, o claustro de Montecalvo dorme — por enquanto.'],menuCam:{cx:23,cz:28,y:1.7,tx:23,tz:16},ambient:'crypt',mist:null,
  briefing:{meta:'ITÁLIA — 14 DE FEVEREIRO DE 1944 — 22h40',paras:['Debaixo da Abadia de Montecalvo, a cripta virou prisão: treze soldados aliados nas celas e um oficial, o Capitão Hale, interrogado todos os dias. Ao amanhecer, um caminhão leva todos — junto com as caixas de obras roubadas.','Abra as celas, pegue a chave do interrogatório no escritório e solte Hale. O poço do claustro, a noroeste, é a única saída que os guardas esqueceram. Hale segue você ou espera (tecla G).'],list:['Chave do interrogatório (escritório)','Alavanca das celas (sala da guarda)','Soltar Hale e levá-lo ao poço']}};
LEVEL_ORDER.push('16');


/* =========================================================
   OPERAÇÃO 17 — Caos no Mosteiro (claustro de Montecalvo, 15/02/1944, 05h)
   metralhadoras das galerias, rádio do campanário, portão, defesa do embarque
   ========================================================= */
const ENEMY_DEFS_17=[
  {id:'mg1',x:-17.2,z:17.2,yaw:Math.PI*.75,weapon:'smg',helmet:true,fixed:true,sight:1.3},
  {id:'mg2',x:17.2,z:-17.2,yaw:-Math.PI*.25,weapon:'smg',helmet:true,fixed:true,sight:1.3},
  {id:'g1',x:-17,z:-10,weapon:'rifle',patrol:[[-17,-10],[-17,-17],[10,-17]]},
  {id:'g2',x:17,z:10,weapon:'rifle',helmet:true,patrol:[[17,10],[17,17],[-10,17]]},
  {id:'y1',x:-6,z:-6,weapon:'rifle',lantern:true,patrol:[[-6,-6],[6,-6],[6,6],[-6,6]]},
  {id:'h1',x:-8,z:-30,yaw:0,weapon:'rifle',helmet:true},
  {id:'h2',x:8,z:-34,weapon:'smg',patrol:[[8,-34],[-8,-34]]},
  {id:'h3',x:0,z:-37,yaw:0,weapon:'pistol',officer:true},
  {id:'b1',x:16,z:-36,yaw:Math.PI,weapon:'rifle'},
  {id:'r1',x:-22.4,z:-8,weapon:'rifle',patrol:[[-22.4,-8],[-22.4,10]]},
  {id:'r2',x:-26,z:8,yaw:Math.PI/2,weapon:'smg',helmet:true},
  {id:'l1',x:33,z:-6,weapon:'rifle',patrol:[[33,-6],[33,8]]},
  {id:'l2',x:26,z:12,yaw:-Math.PI/2,weapon:'pistol',officer:true},
  {id:'o1',x:-12,z:34,weapon:'rifle',helmet:true,patrol:[[-12,34],[12,34]]},
  {id:'o2',x:-4.8,z:42,yaw:Math.PI,weapon:'smg',helmet:true},
  {id:'o3',x:14,z:42,yaw:Math.PI,weapon:'rifle'},
];
function light17(x,z){ if(x>-14&&x<14&&z>-14&&z<14) return .62; if(z>26) return .6; return .42; }
function zone17(x,z){ if(z<-20) return x>12&&z<-32?'Campanário':'Igreja'; if(x<-20) return 'Refeitório'; if(x>20) return 'Biblioteca'; if(z>20) return z>26?'Pátio de fora':'Portaria'; return Math.abs(x)<14&&Math.abs(z)<14?'Jardim do claustro':'Galerias'; }
function buildLevel17(){
  M5=mats05(); M6=mats06(); const M=M6, H=9;
  scene.background=new T.Color(0x8a7a88); scene.fog=new T.FogExp2(0x9a8a8e,.012);
  skyDome(1717,[[0,'#2a3050'],[.3,'#6a6a8a'],[.44,'#d8a0a0'],[.5,'#f0c090'],[.53,'#7a6a6a'],[1,'#3a3430']],null,6);
  scene.add(new T.HemisphereLight(0xc8b8c8,0x5a4a3a,.7)); const sun=new T.DirectionalLight(0xffc8a0,.55); sun.position.set(40,18,30); scene.add(sun); scene.add(new T.AmbientLight(0x4a4448,.35));
  const stone=new T.MeshLambertMaterial({map:TEX.lime5,color:0xd0c4b0}), stoneD=new T.MeshLambertMaterial({map:TEX.lime5,color:0x9a8e7c}), grass=new T.MeshLambertMaterial({map:TEX.dust5,color:0x6a7a4a}), floorM=new T.MeshLambertMaterial({map:TEX.terra5,color:0xb09a84});
  floorPlane(84,96,0,0,floorM,'stone',0); floorPlane(28,28,0,0,grass,'stone',.01); floorPlane(48,20,0,36,MAT.ground||M.road,'stone',.011);
  const wl=(axis,c0,c1,a0,a1,ops,mat,h)=>wallOpen(axis,c0,c1,a0,a1,h||H,ops||[],mat||stone,{inner:{}});
  // muralha externa
  wl('x',-46.4,-46,-40,40); wl('x',46,46.4,-40,40,[{c:0,w:6}]); wl('z',-40.4,-40,-46,46); wl('z',40,40.4,-46,46);
  // edifícios em volta do claustro
  wl('x',-20.2,-20,-40,40,[{c:0,w:2}]); wl('x',20,20.2,-40,40,[{c:-12,w:2},{c:0,w:2},{c:12,w:2}]); wl('z',-20.2,-20,-46,46,[{c:0,w:2},{c:30,w:2}]); wl('z',20,20.2,-46,46,[{c:0,w:2}]);
  // telhados dos edifícios
  const roof=(x0,x1,z0,z1,h)=>addBlock(x0,x1,z0,z1,.5,{y0:h||H,mat:MAT.roof,bottom:MAT.ceil,surf:'stone',seg:4});
  roof(-20,20,-46,-20,9); roof(-40,-20,-20,20,7); roof(20,40,-20,20,7); roof(-20,-6,20,26,6); roof(6,20,20,26,6);
  // portaria (passagem)
  wl('z',-6.2,-6,20,26,[],stone,6); wl('z',6,6.2,20,26,[],stone,6);
  wl('x',25.8,26,-20,20,[{c:0,w:4}],stone,6); roof(-6,6,20,26,5);
  // galerias do claustro: colunas, parapeito, telhado
  for(let t=-14;t<=14.01;t+=3.5){ for(const [x,z] of [[t,-14],[t,14],[-14,t],[14,t]]){ addMesh(new T.CylinderGeometry(.22,.26,3.4,8),stone,x,1.7,z,'stone'); addSolidOnly(x-.24,x+.24,z-.24,z+.24,3.4,0,true); } }
  for(const [a,b] of [[-14,-2],[2,14]]){ addBlock(a,b,-14.2,-13.8,.8,{mat:stoneD,surf:'stone',seg:2,cover:true}); addBlock(a,b,13.8,14.2,.8,{mat:stoneD,surf:'stone',seg:2,cover:true}); addBlock(-14.2,-13.8,a,b,.8,{mat:stoneD,surf:'stone',seg:2,cover:true}); addBlock(13.8,14.2,a,b,.8,{mat:stoneD,surf:'stone',seg:2,cover:true}); }
  for(const [x0,x1,z0,z1] of [[-20,20,-20,-14],[-20,20,14,20],[-20,-14,-14,14],[14,20,-14,14]]) addBlock(x0,x1,z0,z1,.3,{y0:3.4,mat:MAT.roof,bottom:MAT.ceil,surf:'stone',seg:3});
  // jardim: poço (saída da cripta), canteiros
  addMesh(new T.CylinderGeometry(1,1.1,.9,16),stone,-9,.45,-9,'stone'); addSolidOnly(-10,-8,-10,-8,.9,0,true); addMesh(BOX(2.4,.12,.12),MAT.darkMetal,-9,2,-9,null); for(const x of [-10.1,-7.9]) addMesh(BOX(.12,2,.12),MAT.darkMetal,x,1,-9,null);
  for(const [x,z] of [[6,-7],[-6,7],[7,7]]) { addBlock(x-2,x+2,z-1,z+1,.5,{mat:stoneD,surf:'stone',seg:1,cover:true}); }
  const cyp=[]; for(const [x,z] of [[0,0],[-4,-11],[11,-4],[4,11],[-11,4]]) cyp.push([x,3.2,z,1,5.5,1,0]); instanced(new T.ConeGeometry(.9,1,8),hm(0x2a3a22),cyp); for(const c of cyp) addSolidOnly(c[0]-.3,c[0]+.3,c[2]-.3,c[2]+.3,2,0,true);
  // ninhos de metralhadora
  for(const [x,z,sx,sz] of [[-17.2,17.2,1,-1],[17.2,-17.2,-1,1]]){ addBlock(Math.min(x,x+sx*1.6),Math.max(x,x+sx*1.6),z+sz*1.2-.3,z+sz*1.2+.3,1.05,{mat:MAT.sandbag,surf:'sandbag',cover:true,seg:1}); addBlock(x+sx*1.2-.3,x+sx*1.2+.3,Math.min(z,z+sz*1.6),Math.max(z,z+sz*1.6),1.05,{mat:MAT.sandbag,surf:'sandbag',cover:true,seg:1}); const mg=addMesh(BOX(.12,.12,1.1),MAT.darkMetal,x+sx*.9,1.15,z+sz*.9,'metal'); mg.rotation.y=Math.atan2(sx,sz); }
  // igreja: bancos, altar, campanário
  for(let z=-31;z<=-23;z+=2.4) for(const x of [-12,-5,5,12]) addBlock(x-2.6,x+2.6,z-.3,z+.3,.5,{mat:MAT.darkWood,surf:'wood',cover:true,seg:1});
  addBlock(-3,3,-44,-42,1.1,{mat:stone,surf:'stone',seg:1,cover:true}); for(const x of [-14,-7,7,14]){ addMesh(new T.CylinderGeometry(.5,.55,9,10),stone,x,4.5,-21.6,'stone'); addSolidOnly(x-.5,x+.5,-22.1,-21.1,9,0,true); }
  wl('x',-32.2,-32,12,20,[{c:16,w:1.4}],stoneD); wl('z',12,12.2,-46,-32,[],stoneD);
  const radio=addMesh(BOX(.7,.5,.45),hm(0x3a3a30),17.5,1.05,-38,'metal'); addBlock(16.6,18.6,-38.6,-37.4,.8,{mat:M.wood,surf:'wood',seg:1}); radio.userData.zoneHit=()=>radioDown17('tiro'); W.shootables.push(radio);
  addMesh(new T.CylinderGeometry(.03,.03,8,4),MAT.darkMetal,19.4,6,-39.4,null);
  for(let i=0;i<8;i++) addMesh(BOX(.4,1.8,.1),new T.MeshBasicMaterial({color:0xe8b080}),-17+i*4.8,6.4,-45.94,null);
  // refeitório e biblioteca
  for(const z of [-12,-4,4,12]) addBlock(-36,-24,z-.5,z+.5,.78,{mat:M.wood,surf:'wood',cover:true,seg:2});
  for(const [x,z] of [[24,-16],[26.2,-16],[34,-16],[36.2,-16],[24,16],[34,16],[36,14],[30,-10]]) crate(x,z,1.9,1.4);
  for(const z of [-12,-6,6,12]) addBlock(38,39.6,z-2,z+2,3,{mat:M.wood,surf:'wood',seg:1});
  const tiz=crate(30,4,1.4,1.1); const tizM=poster(30,.7,4.72,0,1.2,.5,(g,w,h)=>{ g.fillStyle='#8a6a42'; g.fillRect(0,0,w,h); g.fillStyle='#1a1410'; g.font='bold 30px monospace'; g.textAlign='center'; g.fillText('Nr. 417',w/2,h*.65); });
  // pátio de fora: caminhões, portão, guincho
  truck04(8,36); truck04(-14,36); const gate=new T.Group(); scene.add(gate); for(let x=-2.9;x<=2.91;x+=.4){ const b=new T.Mesh(BOX(.08,5,.08),MAT.darkMetal); b.position.set(x,2.5,46.2); gate.add(b); } for(const y of [.6,2.5,4.4]){ const b=new T.Mesh(BOX(6,.1,.1),MAT.darkMetal); b.position.set(0,y,46.2); gate.add(b); }
  const gateS=addSolidOnly(-3,3,45.8,46.6,6); addSolidOnly(-4,4,47.4,48,6); floorPlane(6,10,0,51,M.road,'stone',.012);
  const winch=new T.Group(); winch.position.set(-5.4,1,44.6); scene.add(winch); const wh=new T.Mesh(new T.CylinderGeometry(.35,.35,.5,12),MAT.darkMetal); wh.rotation.z=Math.PI/2; winch.add(wh); addBlock(-6,-4.8,44.2,45,.6,{mat:stoneD,surf:'stone',seg:1});
  sandbags(-9,-6,30,30.8); sandbags(6,9,28,28.8);
  // luzes
  for(const [id,x,z,r] of [['G1',-17,-17,7],['G2',17,17,7],['G3',-17,10,6],['G4',17,-10,6],['C1',0,-30,10],['C2',16,-36,6],['R1',-30,0,10],['L1',30,0,10],['P1',0,23,6]]){ bulb(id,x,id[0]==='G'?3.1:id[0]==='P'?5.5:6,z,r); const L=W.lamps[W.lamps.length-1]; L.base=.9; L.light.intensity=.9; L.light.distance=r*1.6; }
  const L1=lampPost('O1',10,30,-1,0); if(L1){ L1.base=1; L1.light.intensity=1; }
  // navegação
  const N=[];
  for(let x=-44;x<=44.1;x+=2.5) for(let z=-38.5;z<=44.1;z+=2.5) N.push({x,z});
  for(const [x,z] of [[0,-20],[0,-21.6],[0,-18.4],[-20,0],[-21.6,0],[-18.4,0],[20,0],[18.4,0],[21.6,0],[-12,20],[-12,18.4],[-12,21.6],[12,20],[12,18.4],[12,21.6],[0,20],[0,18.4],[0,21.6],[0,26],[0,27.6],[0,24.4],[16,-32],[16,-30.4],[16,-33.6],[0,-14],[0,14],[-14,0],[14,0],[-20,30],[-21.6,30],[-18.4,30]]) N.push({x,z});
  for(let x=-18;x<=18.1;x+=2.25) N.push({x,z:-22.7}); for(let x=-18;x<=10.5;x+=2.25) N.push({x,z:-32.6}); for(let z=-31;z<=-22;z+=2.2) N.push({x:17.3,z},{x:-17.3,z},{x:0,z},{x:-8.5,z},{x:8.5,z}); for(let x=-18;x<=-7;x+=2.2) N.push({x,z:23});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=3.7; buildNav();
  return {radio,gate,gateS,winch,tizM,sun};
}
function radioDown17(how){ const F=G.flags, R=G.refs; if(F.radio17) return; F.radio17=true; R.radio.material=hm(0x1a1a16); FX.burst(R.radio.position.clone(),16,0xffe0a0,3,.3,4); AudioSys.play('metal',R.radio.position,1.2); emitNoise(R.radio.position,8,'impact',null);
  complete('radio17'); G.radioMsg('HALE','O observador ficou mudo. Os canhões do vale vão atirar no escuro.','tip'); check17(); cp17(); }
function check17(){ if(['mgs','radio17'].every(id=>obj(id).state==='done')&&obj('gate').state==='hidden'){ activate('gate'); G.radioMsg('ÉLISE','Galerias limpas, rádio mudo. Agora o guincho do portão, no pátio de fora — e então os rapazes sobem no caminhão.','warn'); } }
function objectives17(){ return [
  {id:'mgs',text:'Silencie as duas metralhadoras das galerias do claustro (0/2)',state:'active',marker:{x:-17.2,z:17.2}},
  {id:'radio17',text:'Destrua o rádio do observador no campanário (igreja, nordeste)',state:'active',marker:{x:17.5,z:-38}},
  {id:'gate',text:'Abra o portão pelo guincho do pátio de fora',state:'hidden',marker:{x:-5.4,z:44.6}},
  {id:'hold17',text:'Proteja o embarque dos prisioneiros no caminhão',state:'hidden',marker:{x:8,z:36}},
  {id:'board',text:'Suba no caminhão',state:'hidden',marker:{x:4.4,z:36}},
  {id:'tiz17',text:'Opcional: recupere a caixa Nr. 417 (Tiziano) na biblioteca',state:'active',optional:true},
  {id:'hale17',text:'Opcional: Hale termina com mais da metade da saúde',state:'active',optional:true},
]; }
function interact17(R){
  const I=W.interactables, F=()=>G.flags;
  I.push({id:'radio17',pt:()=>V3(17.5,1.1,-37.4),r:2.2,hold:()=>1,label:()=>F().radio17?null:'Arrancar os fios do rádio (segure)',use:()=>radioDown17('mão')});
  I.push({id:'tiz17',pt:()=>V3(30,1,5.4),r:2.2,hold:()=>1.6,label:()=>F().tiz17?null:'Tirar a tela da caixa Nr. 417 (segure)',use:()=>{ F().tiz17=true; R.tizM.visible=false; AudioSys.play('pickup'); pickupMsg('Tiziano enrolado na mochila'); complete('tiz17'); cp17(); }});
  I.push({id:'winch',pt:()=>V3(-5.4,1.1,44.6),r:2.2,hold:()=>2.6,label:()=>obj('gate').state==='active'?'Girar o guincho do portão (segure)':(F().gateOpen?null:'O guincho está preso — primeiro as metralhadoras e o rádio'),
    use:()=>{ if(obj('gate').state!=='active') return; F().gateOpen=true; F().gateT=0; AudioSys.play('clank',V3(0,2,46),1.4); complete('gate'); activate('hold17'); F().holdT=G.diff==='recruta'?45:G.diff==='veterano'?75:60; F().waveT=3; F().wave=0;
      G.radioMsg('HALE','Portão aberto! Rapazes, para o caminhão! Élise, eles vão sair da igreja e do refeitório — segure o pátio!','warn'); G.alarm=true; cp17(); }});
  I.push({id:'board',pt:()=>V3(4.4,1.2,36),r:2.6,skip:true,label:()=>obj('board').state==='active'?'Subir no caminhão':null,use:()=>{ if(obj('board').state!=='active') return; const A=G.ally; if(A&&!A.dead){ if(A.hp>A.maxHp*.5) complete('hale17'); else failObjective('hale17'); } complete('board'); missionComplete(); }});
  I.push({id:'haleRev',pt:()=>{ const A=G.ally; return V3(A.pos.x,A.pos.y+1.1,A.pos.z); },r:2.4,skip:true,label:()=>G.ally&&G.ally.downed?'Reanimar o Capitão Hale':null,hold:()=>1.6,use:()=>{ if(G.ally.downed) G.ally.revive(); }});
}
function update17(dt){
  const P=G.player, F=G.flags, R=G.refs, A=G.ally;
  if(!F.allyInit&&A){ F.allyInit=true; A.joined=true; A.mode='FOLLOW'; A.hidden=false; }
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('HALE','Subimos pelo poço bem no meio do claustro. Duas metralhadoras nas galerias, cantos opostos. Os rapazes esperam lá embaixo.','tip'); }
  if(!F.i2&&G.introT>10){ F.i2=true; G.radioMsg('DICA','As metralhadoras cobrem o jardim: avance pelas galerias, atrás das colunas. G manda Hale esperar.','tip'); }
  const mgDead=['mg1','mg2'].filter(id=>{ const e=G.enemies.find(x=>x.id===id); return e&&e.dead; }).length;
  if(obj('mgs').state==='active'){ const o=obj('mgs'); const t='Silencie as duas metralhadoras das galerias do claustro ('+mgDead+'/2)'; if(o.text!==t){ o.text=t; if(mgDead===1) o.marker={x:17.2,z:-17.2}; refreshObjectiveUI(); } if(mgDead>=2){ complete('mgs'); G.radioMsg('HALE','As duas metralhadoras caladas. Bom trabalho.'); check17(); cp17(); } }
  if(F.gateOpen&&F.gateT<3){ F.gateT+=dt; R.gate.position.y=Math.min(4.6,F.gateT*1.6); if(R.gate.position.y>2.2) R.gateS.active=false; }
  // embarque: ondas de inimigos e prisioneiros correndo
  if(F.gateOpen&&obj('hold17').state==='active'){
    F.holdT-=dt; F.waveT-=dt; G.progress={label:'Embarque: '+Math.max(0,Math.ceil(F.holdT))+' s',v:Math.max(0,F.holdT)/60};
    if(F.waveT<=0&&F.wave<6){ F.wave++; F.waveT=G.diff==='veterano'?9:12; const n=F.wave; const src=n%2?[[0,-23],[3,-23]]:[[-22.6,-2],[-22.6,2]];
      spawnEnemy04({id:'z'+n+'a',x:src[0][0],z:src[0][1],weapon:n%3?'rifle':'smg',helmet:true},true); spawnEnemy04({id:'z'+n+'b',x:src[1][0],z:src[1][1],weapon:'rifle',helmet:n>2,nades:n>3?1:0},true); }
    if(!R.pows17){ R.pows17=[]; for(let i=0;i<8;i++){ const lk=POW_LOOK[i%3]; const a=new Actor({id:'p17_'+i,x:-6.2+(i%3-1)*.8,z:-6-Math.floor(i/3)*.8,yaw:0},Object.assign({weapon:null,boots:true,cap:null},lk)); removeShootables(a.h.hitMeshes); a.aimTarget=0; R.pows17.push({a,d:i*1.4,st:0}); } }
    for(const p of R.pows17){ const a=p.a; if(p.done) continue; p.d-=dt; if(p.d>0){ a.animate(dt); continue; } const wps=[[-2,-2],[1.6,13],[0,22],[0,30],[4.4,36]]; const w=wps[p.st]; const dx=w[0]-a.pos.x, dz=w[1]-a.pos.z, d=Math.hypot(dx,dz);
      if(d<.3){ p.st++; if(p.st>=wps.length){ p.done=true; a.h.root.visible=false; } } else { const sp=Math.min(d,3.2*dt); a.pos.x+=dx/d*sp; a.pos.z+=dz/d*sp; a.yaw=Math.atan2(dx,dz); a.speedNow=3.2; } a.animate(dt); }
    if(F.holdT<=0){ G.progress=null; complete('hold17'); activate('board'); G.radioMsg('HALE','Todos a bordo! Motor ligado — suba, Élise!','tip'); cp17(); }
  }
}
function cp17(){ checkpoint(); }
function restore17(s){ const F=G.flags, R=G.refs;
  if(F.radio17) R.radio.material=hm(0x1a1a16); if(F.tiz17) R.tizM.visible=false;
  if(F.gateOpen){ R.gate.position.y=4.6; R.gateS.active=false; F.gateT=9; if(obj('hold17').state==='active'){ F.holdT=Math.max(F.holdT||0,20); F.waveT=6; } }
  F.allyInit=false; R.pows17=null;
}
LEVELS['17']={id:'17',num:17,op:'Operação 17',name:'Caos no Mosteiro',place:'Claustro de Montecalvo, Itália',prev:'16',
  loadout:{weapons:['smg','silenced','rifle'],ammo:{smg:{mag:32,reserve:96},silenced:{mag:6,reserve:12},rifle:{mag:5,reserve:15}},cur:'smg',camera:false},baseLight:.5,lightFn:light17,zoneAt:zone17,shadows:false,bloomTh:.8,grenades:true,
  build:()=>buildLevel17(),enemies:ENEMY_DEFS_17,
  ally:{id:'hale',x:-7.4,z:-8.2,yaw:Math.PI/4,name:'HALE',title:'Capitão Hale',hp:150,range:45,dmg:36,look:{uniform:0x7a6a4a,pants:0x5a4a34,skin:0xd8a888,hair:0x8a6a3a,cap:null,weapon:'smg'},failTitle:'Hale não resistiu',failText:'O Capitão Hale caiu no claustro de Montecalvo.'},
  start:{x:-8.4,z:-7.2,yaw:Math.PI*.75},startDocs:[],drawMap:null,
  reinf:[{id:'n1',x:0,z:-24,weapon:'smg',helmet:true},{id:'n2',x:-24,z:0,weapon:'rifle',helmet:true,nades:1},{id:'n3',x:24,z:0,weapon:'rifle',helmet:true}],
  radio:{x:17.5,z:-38,fx:17.5,fz:-36.8},radioRun:'O observador corre para o rádio do campanário!',alarmPos:V3(17.5,1.4,-38),alarmText:'Alarme no mosteiro! A guarnição inteira acorda.',alarmObjective:null,
  alarmYes:'',alarmLate:'',alarmNo:'',alarmOk:()=>true,deathText:'A guarnição de Montecalvo cercou Élise no claustro.',
  objectives:objectives17,interact:interact17,pickups:()=>{ addPickup('k_med1',-17,-17.6,'med',30,.1); addPickup('k_nade1',8,-30,'nade',2,.1); addPickup('k_smg1',-30,12,'smg',32,.85); addPickup('k_med2',24,14,'med',40,.1); addPickup('k_r1',16,-34,'rifle',5,.1); addPickup('k_med3',-10,30,'med',35,.1); addPickup('k_nade2',12,30,'nade',2,.1); G.player.nades=Math.max(G.player.nades||0,2); },
  update:update17,restore:restore17,
  resultTitle:'Caos no mosteiro',outro:['ÉLISE','O caminhão desce a serpentina de faróis apagados, com catorze homens e um Tiziano enrolado num cobertor. Atrás de nós, os sinos de Montecalvo tocam sozinhos.'],menuCam:{cx:-10,cz:10,y:2,tx:6,tz:-6},ambient:'dawn',mist:null,
  briefing:{meta:'ITÁLIA — 15 DE FEVEREIRO DE 1944 — 05h10',paras:['O poço da cripta sai no jardim do claustro. Duas metralhadoras vigiam as galerias em cantos opostos, e no campanário um observador passa por rádio a posição de cada coluna aliada no vale.','Com o Capitão Hale ao seu lado, silencie as metralhadoras e o rádio, abra o portão pelo guincho do pátio de fora e segure a posição enquanto os prisioneiros sobem no caminhão.'],list:['Duas metralhadoras das galerias','Rádio do campanário','Guincho do portão e defesa do embarque']}};
LEVEL_ORDER.push('17');