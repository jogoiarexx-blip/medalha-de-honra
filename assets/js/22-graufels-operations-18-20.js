'use strict';



/* =========================================================
   CAMPANHA 6 — GRAUFELS (fábrica subterrânea de bombas voadoras)
   OPERAÇÃO 18 — Planos de Destruição (vilarejo de Graufels, 20/11/1944, 23h)
   ========================================================= */
function roofPrism(x,z,len,w,h,y0,alongX,mat){ const g=new T.CylinderGeometry(1,1,len,3); g.rotateX(-Math.PI/2); g.scale(w/2/.866,h/1.5,1); g.translate(0,h/3,0); if(alongX) g.rotateY(Math.PI/2); const m=new T.Mesh(g,mat||MAT.roof); m.position.set(x,y0,z); scene.add(m); return m; }
function house18(x0,x1,z0,z1,h,mat,opt={}){ const b=addBlock(x0,x1,z0,z1,h,{mat,surf:'stone',seg:2}); const alongX=(x1-x0)>(z1-z0); roofPrism((x0+x1)/2,(z0+z1)/2,(alongX?x1-x0:z1-z0)+.6,(alongX?z1-z0:x1-x0)+.8,opt.rh||2.6,h,alongX,opt.roof||null);
  if(opt.win!==false){ const R=mulberry32((x0*7+z0*13)|0); const lit=new T.MeshBasicMaterial({color:0xffc070}), dark=new T.MeshBasicMaterial({color:0x1a1a22}); for(const [fx,fz,ry,len] of [[0,z0-.03,0,x1-x0],[0,z1+.03,0,x1-x0]]) for(let t=1.2;t<len-.8;t+=2.4){ const m=new T.Mesh(BOX(.7,.9,.04),R()<.4?lit:dark); m.position.set(x0+t,h*.55,fz); scene.add(m); } }
  return b; }
function makeSnow(n){ const g=new T.BufferGeometry(), p=new Float32Array(n*3); for(let i=0;i<n;i++){ p[i*3]=rnd(-25,25); p[i*3+1]=rnd(0,14); p[i*3+2]=rnd(-25,25); } g.setAttribute('position',new T.BufferAttribute(p,3)); const m=new T.Points(g,new T.PointsMaterial({color:0xffffff,size:.07,transparent:true,opacity:.85,depthWrite:false})); m.frustumCulled=false; scene.add(m); return m; }
function updateSnow(S,dt,wind){ if(!S) return; const a=S.geometry.attributes.position, p=a.array, c=camera.position; for(let i=0;i<p.length;i+=3){ p[i+1]-=dt*(1.3+(i%7)*.08); p[i]+=dt*(wind||.4)*Math.sin(simTime*.7+i); if(p[i+1]<0){ p[i+1]=14; p[i]=rnd(-25,25); p[i+2]=rnd(-25,25); } } S.position.set(Math.floor(c.x),0,Math.floor(c.z)); a.needsUpdate=true; }
const ENEMY_DEFS_18=[
  {id:'v1',x:0,z:30,weapon:'rifle',lantern:true,patrol:[[0,30],[0,4],[2,4],[2,30]]},
  {id:'v2',x:-5,z:18,yaw:Math.PI/2,weapon:'rifle',helmet:true},
  {id:'v3',x:12,z:22,weapon:'smg',patrol:[[12,22],[28,22],[28,2],[12,2]]},
  {id:'b1',x:19,z:6,yaw:Math.PI,weapon:'pistol',officer:true},
  {id:'b2',x:22.4,z:13,yaw:-Math.PI/2,weapon:'rifle'},
  {id:'q1',x:33,z:-6,weapon:'rifle',helmet:true,patrol:[[33,-6],[42,-6]]},
  {id:'q2',x:28.6,z:-22.5,yaw:-Math.PI/2,weapon:'smg',helmet:true},
  {id:'q3',x:30,z:-16,yaw:-Math.PI/2,weapon:'rifle'},
  {id:'p1',x:-26,z:-6,weapon:'rifle',lantern:true,patrol:[[-26,-6],[-40,-6]]},
  {id:'p2',x:-36,z:-24.2,yaw:0,weapon:'smg',helmet:true},
  {id:'p3',x:-31,z:-16,yaw:Math.PI/2,weapon:'pistol'},
  {id:'t1',x:-6,z:-36,yaw:0,weapon:'rifle',helmet:true},
  {id:'t2',x:10,z:-34,weapon:'smg',helmet:true,patrol:[[10,-34],[16,-34],[16,-28],[10,-28]]},
  {id:'t3',x:8,z:-42,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'c1',x:-14,z:-12,weapon:'rifle',patrol:[[-14,-12],[14,-12]]},
];
function light18(x,z){ let l=.22; const R=G.refs; if(R&&R.lit18) for(const [a,b,r] of R.lit18){ const d=Math.hypot(x-a,z-b); if(d<r) l=Math.max(l,.66*(1-d/r)+.22); } return l; }
function zone18(x,z){ if(z<-30) return 'Boca do túnel'; if(x>28) return 'Pedreira'; if(x<-26) return 'Usina elétrica'; if(x>12&&z>2&&z<20) return 'Escritório da obra'; return 'Graufels'; }
function buildLevel18(){
  M5=mats05(); M6=mats06(); const M=M6;
  scene.background=new T.Color(0x10141c); scene.fog=new T.FogExp2(0x1a1e26,.024);
  skyDome(1818,[[0,'#0a0e18'],[.3,'#1a2030'],[.45,'#2a3040'],[.5,'#3a3e48'],[.53,'#1a1a1e'],[1,'#0a0a0a']],null,4);
  scene.add(new T.HemisphereLight(0x8a9ab8,0x3a3e44,.55)); const moon=new T.DirectionalLight(0xa8b8d8,.25); moon.position.set(20,40,30); scene.add(moon); scene.add(new T.AmbientLight(0x2a3040,.35));
  const snow=MAT_HQ?new T.MeshPhongMaterial({map:TEX.dust5,color:0xd8dce4,shininess:20,specular:0x222428}):new T.MeshLambertMaterial({map:TEX.dust5,color:0xd8dce4});
  const plaster=new T.MeshLambertMaterial({map:TEX.lime5,color:0xb8b0a0}), timber=new T.MeshLambertMaterial({map:TEX.lime5,color:0x8a7a6a}), rock=new T.MeshLambertMaterial({map:TEX.rock6||TEX.lime5,color:0xa8a8b0}), roofS=new T.MeshLambertMaterial({color:0xd0d4dc});
  floorPlane(110,110,0,0,snow,'stone',0); floorPlane(7,92,0,4,new T.MeshLambertMaterial({map:TEX.dust5,color:0x8a8478}),'stone',.012);
  // montanha ao norte e limites
  addBlock(-60,60,-62,-46,26,{mat:rock,surf:'stone',seg:6,top:roofS}); addBlock(-60,-50,-46,56,10,{mat:rock,surf:'stone',seg:5,top:roofS}); addBlock(50,60,-46,56,10,{mat:rock,surf:'stone',seg:5,top:roofS}); addSolidOnly(-50,50,52,53,6);
  // boca do túnel
  const portal=addMesh(BOX(9,7,1),new T.MeshLambertMaterial({map:TEX.lime5,color:0x7a7470}),4,3.5,-45.6,'stone'); addMesh(BOX(6,5,.2),new T.MeshBasicMaterial({color:0x040404}),4,2.5,-45,null); addSolidOnly(-.5,8.5,-46.2,-45.1,7,0,false);
  // trilhos e trem de minério
  for(let z=-45;z<=-20;z+=.9) addMesh(BOX(2.2,.08,.25),hm(0x3a2a1a),4,.04,z,null); for(const x of [3.3,4.7]) addMesh(BOX(.08,.1,26),MAT.darkMetal,x,.1,-32.5,null);
  const train=new T.Group(); scene.add(train); const loco=new T.Mesh(BOX(2,2.4,4),hm(0x2a2e2a)); loco.position.set(4,1.4,-41); train.add(loco); const cab=new T.Mesh(BOX(2,1,1.6),hm(0x1a1e1a)); cab.position.set(4,3.1,-39.6); train.add(cab);
  const cars=[]; for(let i=0;i<3;i++){ const c=new T.Mesh(BOX(1.9,1.2,3.2),hm(0x4a3a2a)); c.position.set(4,.9,-36.4+i*3.6); train.add(c); cars.push(c); }
  addSolidOnly(2.9,5.1,-43,-29.6,2.6,0,true);
  const tLamp=new T.PointLight(0xffe0a0,0,12,1.6); tLamp.position.set(4,3,-43.5); scene.add(tLamp);
  // vilarejo
  for(const [x0,x1,z0,z1,h] of [[-16,-6,22,30,4.5],[-18,-8,8,16,5],[-16,-6,-4,4,4],[6,10,26,34,4],[30,38,20,30,4.5],[-30,-22,16,26,4],[-40,-32,28,36,4],[6,10,-6,0,3.5]]) house18(x0,x1,z0,z1,h,(x0*3)%2?plaster:timber,{roof:roofS});
  // igreja
  addBlock(-30,-20,0,10,7,{mat:plaster,surf:'stone',seg:3}); roofPrism(-25,5,10.6,10.8,4,7,false,roofS); addBlock(-23,-19,-2,2,14,{mat:plaster,surf:'stone',seg:2}); addMesh(new T.ConeGeometry(2.6,5,4),roofS,-21,16.5,0,null).rotation.y=Math.PI/4;
  // escritório da obra (interior acessível)
  const wl=(axis,c0,c1,a0,a1,ops,mat)=>wallOpen(axis,c0,c1,a0,a1,3.6,ops||[],mat||plaster,{inner:{}});
  wl('x',4,4.2,12,26,[{c:19,w:1.6}]); wl('x',20,20.2,12,26); wl('z',12,12.2,4,20.2); wl('z',26,26.2,4,20.2); wl('z',18,18.2,4,20.2,[{c:12,w:1.4}]);
  addBlock(11.8,26.4,3.8,20.4,.4,{y0:3.6,mat:MAT.ceil,bottom:MAT.ceil,surf:'stone',seg:3}); roofPrism(19.1,12.1,14.6,17,3,4,true,roofS);
  addBlock(13,16.6,14,15.4,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); const plans=addMesh(BOX(1.1,.02,.8),hm(0xb8c8e0),14.8,.8,14.7,null);
  addBlock(21,25,18.6,19.6,1.9,{mat:M.wood,surf:'wood',seg:1}); const board=poster(23,1.6,4.26,0,1.8,1,(g,w,h)=>{ g.fillStyle='#2a2a26'; g.fillRect(0,0,w,h); g.fillStyle='#e8e0d0'; g.font='bold 22px monospace'; g.fillText('ZUGFAHRPLAN',14,30); g.font='18px monospace'; ['22.40  Erz  ↑','01.15  Fracht ↑','03.30  Teile  ↑','05.00  ↓'].forEach((t,i)=>g.fillText(t,14,62+i*26)); });
  // pedreira (explosivos)
  addBlock(30,46,-30,-26,6,{mat:rock,surf:'stone',seg:3,top:roofS}); for(let i=0;i<10;i++){ const R=mulberry32(1830+i); const s=.6+R()*1.2, x=32+R()*12, z=-24+R()*3; addMesh(new T.DodecahedronGeometry(s,0),rock,x,s*.4,z,'stone'); addSolidOnly(x-s*.7,x+s*.7,z-s*.7,z+s*.7,s,0,true); }
  wl('x',-20.2,-20,34,42,[]); wl('x',-14,-13.8,34,42,[{c:38,w:1.4}]); wl('z',34,34.2,-20,-14); wl('z',41.8,42,-20,-14); addBlock(33.8,42.2,-20.2,-13.8,.3,{y0:3.6,mat:MAT.roof,bottom:MAT.ceil,surf:'wood',seg:2});
  const expl=[]; for(const [x,z] of [[39.6,-18.6],[40.6,-18.6]]){ crate(x,z,.9,.7); } const explM=addMesh(BOX(.7,.3,.5),hm(0x8a2a1a),36,.95,-18.6,null); addBlock(35,37,-19.2,-18,.8,{mat:M.wood,surf:'wood',seg:1}); poster(36,1.9,-19.75,0,1,.5,(g,w,h)=>{ g.fillStyle='#c8a020'; g.fillRect(0,0,w,h); g.fillStyle='#1a1a1a'; g.font='bold 40px sans-serif'; g.textAlign='center'; g.fillText('SPRENG',w/2,h*.65); });
  // usina elétrica
  wl('x',-26.2,-26,-44,-28,[]); wl('x',-10,-9.8,-44,-28,[{c:-36,w:1.8}]); wl('z',-44.2,-44,-26,-10); wl('z',-28,-27.8,-26,-10,[{c:-14,w:1.6}]); addBlock(-44.2,-27.6,-26.2,-9.6,.4,{y0:3.6,mat:MAT.roof,bottom:MAT.ceil,surf:'stone',seg:3}); roofPrism(-35.9,-17.9,16.8,17,3,4,true,roofS);
  addBlock(-40,-34,-22,-18,1.6,{mat:hm(0x3a4a3a),surf:'metal',seg:1}); const fly=new T.Mesh(new T.CylinderGeometry(.9,.9,.3,16),MAT.darkMetal); fly.rotation.z=Math.PI/2; fly.position.set(-33.6,1.4,-20); scene.add(fly); addMesh(new T.CylinderGeometry(.25,.25,8,8),MAT.darkMetal,-41,5,-14,null);
  addBlock(-32,-30.4,-25.6,-25,1.8,{mat:hm(0x4a4a44),surf:'metal',seg:1}); const genLamp=addMesh(BOX(.12,.12,.04),new T.MeshBasicMaterial({color:0x5a1a14}),-31.2,1.5,-24.98,null);
  for(const [x0,x1] of [[-26,-10]]) for(let x=x0;x<x1;x+=4) addMesh(new T.CylinderGeometry(.08,.1,6,6),hm(0x4a3a2a),x,3,-27,null);
  // árvores nevadas
  const trunks=[], tops=[]; const clear=(x,z)=>Math.abs(x)<6||(z<-24&&x>-12&&x<20)||(x>-46&&x<-24&&z>-30&&z<-6)||(x>26&&x<48&&z>-32&&z<-2)||(x>-42&&x<34&&z>-8&&z<38)||(z>44);
  for(let i=0;i<220;i++){ const R=mulberry32(18000+i); const x=-48+R()*96, z=-44+R()*94; if(clear(x,z)) continue; trunks.push([x,1,z,.3,2,.3,0]); const h=4+R()*4; tops.push([x,2+h/2,z,1.6,h,1.6,R()*3]); addSolidOnly(x-.3,x+.3,z-.3,z+.3,3,0,true); }
  instanced(new T.CylinderGeometry(.5,.6,1,6),hm(0x2a1e14),trunks); instanced(new T.ConeGeometry(1,1,7),hm(0x2a3a34),tops); instanced(new T.ConeGeometry(1.02,1,7),new T.MeshLambertMaterial({color:0xe8ecf4,transparent:true,opacity:.5}),tops.map(t=>[t[0],t[1]+t[4]*.18,t[2],t[3]*.7,t[4]*.6,t[5]*.7,t[6]]));
  // luzes
  const lit18=[]; for(const [id,x,z,dx] of [['L1',3.8,20,-1],['L2',-3.8,6,1],['L3',3.8,-10,-1],['L4',8,-26,-1],['L5',-12,-30,1],['L6',30,-8,1]]){ const L=lampPost(id,x,z,dx,0); if(L){ L.base=1.05; L.light.intensity=1.05; } lit18.push([x,z,9]); }
  bulb('O1',14,3.2,16,6); bulb('O2',19,3.2,22,5); bulb('X1',38,3.2,-17,6); lit18.push([14,16,6],[38,-17,6]);
  const genBulbs=[]; for(const [x,z] of [[-36,-24],[-30,-14]]){ bulb('G'+x,x,3.2,z,7); const L=W.lamps[W.lamps.length-1]; L.base=0; L.light.intensity=0; genBulbs.push(L); }
  // holofote na boca do túnel
  const spot=new T.SpotLight(0xdde6ff,2.6,60,.18,.45,1.1); spot.position.set(-3,6.8,-45); scene.add(spot); scene.add(spot.target); const lens=addMesh(new T.CylinderGeometry(.26,.26,.05,14),MAT.bulb,-3,6.8,-44.8,'glass'); lens.rotation.x=Math.PI/2;
  let beam=null; if(MAT_HQ){ const len=50, rad=Math.tan(.18)*len; const bg=new T.ConeGeometry(rad,len,20,1,true); bg.translate(0,-len/2,0); bg.rotateX(-Math.PI/2); beam=new T.Mesh(bg,MAT.beamCold); beam.position.copy(spot.position); scene.add(beam); }
  const SL={id:'SL18',x:-3,z:-44.8,r:0,light:spot,lantern:lens,broken:false,base:2.6,ph:0,cone:beam}; lens.userData.breakable=true; lens.userData.lamp=SL; W.lamps.push(SL);
  G.sl={light:spot,beam,lamp:SL,t:0,lit:false,litT:0,cd:0,msg:'Do túnel: “Halt! Wer da?”',path:t=>V3(Math.sin(t*.25)*16,0,-26+Math.cos(t*.2)*8)};
  const snowP=makeSnow(1600);
  // navegação
  const N=[];
  for(let x=-48;x<=48.1;x+=3) for(let z=-43;z<=50.1;z+=3) N.push({x,z});
  for(let x=12.7;x<=25.4;x+=1.9) for(let z=4.8;z<=19.4;z+=1.9) N.push({x,z});
  for(const [x,z] of [[19,4],[19,2.4],[19,5.6],[18,12],[16.4,12],[19.6,12],[38,-14],[38,-12.4],[38,-15.6],[-36,-10],[-36,-8.4],[-36,-11.6],[-28,-14],[-26.4,-14],[-29.6,-14]]) N.push({x,z});
  for(let x=34.8;x<=41.4;x+=1.6) for(let z=-19.4;z<=-14.6;z+=1.6) N.push({x,z});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=3.5; buildNav();
  return {snowP,plans,explM,fly,genLamp,genBulbs,tLamp,train,cars,lit18};
}
function check18(){ if(['plans18','expl18','gen18'].every(id=>obj(id).state==='done')&&obj('train18').state==='hidden'){ activate('train18'); G.radioMsg('PAVEL','Luz no túnel! O trem das 01h15 vai subir. Entre num vagão de minério e se cubra com a lona.','warn'); } }
function objectives18(){ return [
  {id:'plans18',text:'Pegue as plantas da fábrica no escritório da obra',state:'active',marker:{x:14.8,z:14.7}},
  {id:'expl18',text:'Pegue os explosivos no paiol da pedreira (leste)',state:'active',marker:{x:36,z:-18.6}},
  {id:'gen18',text:'Ligue o gerador da usina elétrica (oeste)',state:'active',marker:{x:-31.2,z:-24.6}},
  {id:'train18',text:'Embarque num vagão do trem de minério',state:'hidden',marker:{x:4,z:-33}},
  {id:'sched18',text:'Opcional: fotografe o horário dos trens no escritório',state:'active',optional:true},
  {id:'quiet18',text:'Opcional: chegue ao trem sem soar o alarme',state:'active',optional:true},
]; }
function interact18(R){
  const I=W.interactables, F=()=>G.flags;
  I.push({id:'plans18',pt:()=>V3(14.8,.9,14.7),r:2,label:()=>F().plans18?null:'Enrolar as plantas da fábrica',use:()=>{ F().plans18=true; R.plans.visible=false; AudioSys.play('pickup'); pickupMsg('Plantas de Graufels'); openDoc('plantas18'); complete('plans18'); check18(); cp18(); }});
  I.push({id:'expl18',pt:()=>V3(36,1,-18.6),r:2,hold:()=>1.2,label:()=>F().expl18?null:'Pegar cargas de demolição (segure)',use:()=>{ F().expl18=true; R.explM.visible=false; AudioSys.play('pickup'); pickupMsg('4 cargas de demolição'); complete('expl18'); check18(); cp18(); }});
  I.push({id:'gen18',pt:()=>V3(-31.2,1.2,-24.4),r:2.2,hold:()=>2.6,label:()=>F().gen18?null:'Dar partida no gerador (segure — barulhento)',use:()=>{ F().gen18=true; R.genLamp.material=new T.MeshBasicMaterial({color:0x3aff5a}); for(const L of R.genBulbs){ L.base=1; L.light.intensity=1; } AudioSys.play('engine',V3(-36,1,-20),1.4); emitNoise(V3(-36,1,-20),18,'lure',null); R.tLamp.intensity=1.6; complete('gen18'); check18(); cp18(); }});
  I.push({id:'train18',pt:()=>V3(4,1.3,-33),r:2.6,skip:true,label:()=>obj('train18').state==='active'?'Subir no vagão e se cobrir':null,use:()=>{ if(obj('train18').state!=='active') return; if(!G.alarm) complete('quiet18'); F().ride18=true; F().rideT=0; complete('train18'); AudioSys.play('engine',V3(4,1,-40),1.2); }});
}
function photos18(){ W.photo.push({id:'sched18',label:'Horário dos trens',pos:V3(23,1.6,4.3),normal:V3(0,0,1),max:3.4,obj:'sched18',size:.9,msg:'Trens de minério, carga e peças a cada duas horas.'}); }
DOCS.plantas18={title:'Graufels — Anlage B',sub:'plantas da fábrica, papel vegetal azul',body:`Galeria A: linha de montagem (fuselagens)
Galeria B: depósito de peças, ogivas
Câmaras 1-3: prensas, tornos, bancada
de giroscópios — energia pela usina
do vale. Sala de controle: chave do
mestre de obras.`,pencil:'Três máquinas e o depósito de peças. Com quatro cargas, dá.'};
DOCS.pavel18={title:'Bilhete de Pavel',sub:'escrito num pedaço de saco de cimento',map:'18',body:'',pencil:'O escritório da obra fica na rua principal. Explosivo no paiol da pedreira. O trem só sobe com o gerador da usina ligado.'};
function drawMap18(g,w,h){ g.fillStyle='#e0dcd0'; g.fillRect(0,0,w,h); const S=w/104, X=x=>(x+52)*S, Z=z=>(z+50)*S*.92+4; g.fillStyle='#7a7a7e'; g.fillRect(X(-50),Z(-50),100*S,6*S); g.fillStyle='#b8b0a0'; g.fillRect(X(-3.5),Z(-42),7*S,92*S*.92);
  g.fillStyle='#5a4a3a'; for(const [a,b,c,d] of [[4,20,12,26],[30,46,-30,-26],[34,42,-20,-14],[-44,-26,-28,-10],[-30,-20,0,10]]) g.fillRect(X(a),Z(c),(b-a)*S,(d-c)*S*.92);
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'11px serif'; g.fillText(s,X(x),Z(z)); }; t('túnel',4,-43,'bold 10px serif'); t('trem',8,-34,'10px serif'); t('escritório',12,10,'bold 10px serif'); t('paiol',38,-11,'bold 10px serif'); t('pedreira',38,-32,'italic 10px serif'); t('usina',-35,-6,'bold 10px serif'); t('igreja',-25,13,'10px serif'); t('GRAUFELS',-10,40,'bold 12px serif'); }
function update18(dt){
  const P=G.player, F=G.flags, R=G.refs;
  updateSnow(R.snowP,dt,.5); updateSearchlight(dt);
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('PAVEL','Pavel na escuta. Fugi da fábrica há um mês. Plantas no escritório da obra, explosivo na pedreira, e o gerador da usina faz o trem subir.','tip'); }
  if(!F.i2&&G.introT>10){ F.i2=true; G.radioMsg('DICA','A neve abafa seus passos, mas a lanterna dos guardas alcança longe. O holofote do túnel varre a rampa.','tip'); }
  if(F.gen18) R.fly.rotation.x+=dt*14;
  if(G.alarm&&obj('quiet18').state==='active') failObjective('quiet18');
  if(F.ride18&&!F.rideDone){ F.rideT+=dt; const k=Math.min(1,F.rideT/6); R.train.position.z=-k*k*9; P.pos.set(4,1.25,-36.4-k*k*9); P.vx=P.vz=P.vy=0; P.ys=null; G.progress={label:'Trem de minério — entrando no túnel',v:k}; if(k>=1){ F.rideDone=true; G.progress=null; missionComplete(); } }
}
function cp18(){ checkpoint(); }
function restore18(s){ const F=G.flags, R=G.refs; if(F.plans18) R.plans.visible=false; if(F.expl18) R.explM.visible=false; if(F.gen18){ R.genLamp.material=new T.MeshBasicMaterial({color:0x3aff5a}); for(const L of R.genBulbs){ L.base=1; L.light.intensity=1; } R.tLamp.intensity=1.6; } F.ride18=false; }
LEVELS['18']={id:'18',num:18,op:'Operação 18',name:'Planos de Destruição',place:'Graufels, Turíngia',prev:'17',
  loadout:{weapons:['silenced','smg','pistol'],ammo:{silenced:{mag:6,reserve:18},smg:{mag:32,reserve:64},pistol:{mag:8,reserve:16}},cur:'silenced',camera:true},baseLight:.22,lightFn:light18,zoneAt:zone18,shadows:false,bloomTh:.75,grenades:true,
  build:()=>{ const r=buildLevel18(); photos18(); return r; },enemies:ENEMY_DEFS_18,ally:null,start:{x:0,z:48,yaw:0},startDocs:['pavel18'],drawMap:drawMap18,
  reinf:[{id:'n1',x:4,z:-30,weapon:'smg',helmet:true},{id:'n2',x:-4,z:-30,weapon:'rifle',helmet:true,nades:1},{id:'n3',x:40,z:-10,weapon:'rifle',helmet:true}],
  radio:{x:24,z:17.6,fx:23,fz:16.8},radioRun:'O oficial corre para o telefone do escritório!',alarmPos:V3(24,1.4,17.6),alarmText:'Alarme em Graufels! Patrulhas descem do túnel.',alarmObjective:null,
  alarmYes:'O alarme soou no vilarejo. ',alarmLate:'',alarmNo:'',deathText:'A guarda da fábrica encontrou Élise na neve de Graufels.',
  objectives:objectives18,interact:interact18,pickups:()=>{ addPickup('g_med1',-8,26,'med',30,.1); addPickup('g_nade1',26,24,'nade',2,.1); addPickup('g_smg1',-30,-20,'smg',32,.1); addPickup('g_med2',40,-8,'med',35,.1); addPickup('g_sil1',8,-22,'silenced',6,.1); G.player.nades=Math.max(G.player.nades||0,1); },
  update:update18,restore:restore18,
  resultTitle:'Planos de destruição',outro:['ÉLISE','Debaixo da lona, entre pedras de minério, ouço o túnel engolir o trem. O ar fica quente e cheira a óleo. Graufels respira dentro da montanha.'],menuCam:{cx:-4,cz:30,y:3,tx:4,tz:0},ambient:'wind',mist:null,
  briefing:{meta:'TURÍNGIA — 20 DE NOVEMBRO DE 1944 — 23h00',paras:['Dentro da montanha de Graufels, trabalhadores forçados montam bombas voadoras dia e noite. Pavel, um tcheco que fugiu da fábrica, espera Élise no vilarejo coberto de neve aos pés do túnel.','Pegue as plantas no escritório da obra, as cargas de demolição no paiol da pedreira e ligue o gerador da usina: sem energia, o trem de minério não sobe. Depois, entre num vagão.'],list:['Plantas da fábrica','Explosivos da pedreira','Gerador da usina → trem de minério']}};
LEVEL_ORDER.push('18');


/* =========================================================
   OPERAÇÃO 19 — Sabotagem! (fábrica subterrânea de Graufels, 21/11/1944, 01h30)
   chave do mestre, painel das grades, 3 máquinas + depósito de peças, evacuação
   ========================================================= */
function flyingBomb(x,y,z,ry,mat){ const g=new T.Group(); g.position.set(x,y,z); g.rotation.y=ry||0; scene.add(g); const m=mat||hm(0x6a7058);
  const b=new T.Mesh(new T.CylinderGeometry(.42,.38,5.4,12),m); b.rotation.z=Math.PI/2; g.add(b); const n=new T.Mesh(new T.ConeGeometry(.42,1.1,12),m); n.rotation.z=-Math.PI/2; n.position.x=3.25; g.add(n);
  const w=new T.Mesh(BOX(1,.08,5),m); w.position.x=.6; g.add(w); const t=new T.Mesh(new T.CylinderGeometry(.24,.2,3.4,10),hm(0x3a3a36)); t.rotation.z=Math.PI/2; t.position.set(-2,.6,0); g.add(t); const f=new T.Mesh(BOX(.9,.8,.06),m); f.position.set(-2.4,.4,0); g.add(f); return g; }
const ENEMY_DEFS_19=[
  {id:'a1',x:-40,z:-14,weapon:'smg',helmet:true,patrol:[[-40,-14],[-20,-14]]},
  {id:'a2',x:-4,z:-12,yaw:Math.PI/2,weapon:'rifle'},
  {id:'a3',x:20,z:-16,weapon:'rifle',helmet:true,patrol:[[20,-16],[48,-16]]},
  {id:'a4',x:54,z:-14,yaw:-Math.PI/2,weapon:'smg'},
  {id:'mestre',x:26,z:-13,weapon:'pistol',officer:true,patrol:[[26,-13],[40,-13],[40,13],[20,14.6]]},
  {id:'k1',x:40,z:-4,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'k2',x:42.4,z:4,yaw:-Math.PI/2,weapon:'smg'},
  {id:'b1',x:-30,z:14,weapon:'rifle',patrol:[[-30,14],[-6,14]]},
  {id:'b2',x:6,z:16,yaw:Math.PI,weapon:'smg',helmet:true},
  {id:'b3',x:30,z:14,weapon:'rifle',lantern:true,patrol:[[30,14],[54,14]]},
  {id:'b4',x:-50,z:12,yaw:Math.PI/2,weapon:'rifle',helmet:true},
  {id:'m1',x:-40,z:-2,yaw:0,weapon:'rifle'},
  {id:'m2',x:-14,z:3,yaw:Math.PI,weapon:'smg',helmet:true},
  {id:'m3',x:14,z:-3,yaw:0,weapon:'rifle'},
];
function light19(x,z){ return .42; }
function zone19(x,z){ if(z<-10) return 'Galeria A — montagem'; if(z>10) return 'Galeria B — peças'; if(x>34) return 'Sala de controle'; if(x<-30) return 'Câmara 1 — prensas'; if(x<0) return 'Câmara 2 — tornos'; return 'Câmara 3 — giroscópios'; }
function buildLevel19(){
  M5=mats05(); M6=mats06(); const M=M6, H=7;
  scene.background=new T.Color(0x0a0a0a); scene.fog=new T.FogExp2(0x14120e,.022);
  scene.add(new T.HemisphereLight(0xb0a890,0x3a3228,.85)); scene.add(new T.AmbientLight(0x3a3630,.6));
  const rock=new T.MeshLambertMaterial({map:TEX.rock6||TEX.lime5,color:0x8a8478}), conc=new T.MeshLambertMaterial({map:TEX.lime5,color:0x8a8a84}), floorM=new T.MeshLambertMaterial({map:TEX.lime5,color:0x5a5850});
  floorPlane(124,52,0,0,floorM,'stone',0); addBlock(-62,62,-26,26,.5,{y0:H,mat:rock,bottom:rock,surf:'stone',seg:8});
  const fill=(x0,x1,z0,z1)=>addBlock(x0,x1,z0,z1,H,{mat:rock,surf:'stone',seg:4});
  // rocha entre as galerias, deixando 4 câmaras
  fill(-62,62,-26,-18.4); fill(-62,62,18.4,26); fill(-62,-58,-18.4,18.4); fill(58,62,-18.4,18.4);
  for(const [a,b] of [[-58,-44],[-36,-18],[-10,10],[18,36],[44,58]]) fill(a,b,-10,10);
  // grades das câmaras 1-3 (controladas pelo painel)
  const barsT=textTex(64,128,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='#2a2a28'; g.fillRect(26,0,12,h); g.fillRect(0,56,w,10); }); barsT.wrapS=T.RepeatWrapping; barsT.repeat.set(18,1); const barsM=new T.MeshLambertMaterial({map:barsT,transparent:true,alphaTest:.4,side:T.DoubleSide});
  const grilles=[]; for(const [i,x] of [[0,-40],[1,-14],[2,14]]){ for(const z of [-10.1,10.1]){ const id='gr'+i+(z<0?'a':'b'); makeDoor(id,{x,z,w:8,d:.12,h:3.2,mat:barsM,offset:V3(0,3.3,0),locked:true,npc:false,nav:true,snd:'door'}); grilles.push(id); } }
  // linha de montagem (galeria A)
  for(let z0 of [-15.6,-12.4]) addMesh(BOX(112,.1,.12),MAT.darkMetal,0,.06,z0,null);
  const bombs=[]; for(let x=-50;x<=50;x+=9){ if(Math.abs(x-(-40))<5||Math.abs(x+14)<5||Math.abs(x-14)<5||Math.abs(x-40)<5) continue; const g=flyingBomb(x,1.4,-14,0); bombs.push(g); addSolidOnly(x-3.2,x+3.8,-14.5,-13.5,1.8,0,true); addBlock(x-1.5,x+1.5,-14.8,-13.2,.8,{mat:MAT.darkMetal,surf:'metal',seg:1}); }
  // depósito de peças (galeria B)
  for(let x=-48;x<=48;x+=6){ if(Math.abs(x)<4) continue; crate(x,16.4,1.8,1.6); if((x/6)%2===0) crate(x,16.4,1.4,1.1,1.6); }
  const depot=[]; for(const [x,z] of [[-2,15.2],[2,15.2],[0,16.8]]){ const w=new T.Mesh(new T.ConeGeometry(.45,1.2,10),hm(0x8a7a3a)); w.position.set(x,.6,z); scene.add(w); depot.push(w); }
  addBlock(-3,3,14.4,17.8,.5,{mat:M.wood,surf:'wood',seg:1}); for(let i=0;i<4;i++){ const g=flyingBomb(-24+i*16,1.2,13.4,0,hm(0x5a604a)); addSolidOnly(-24+i*16-3.2,-24+i*16+3.8,12.9,13.9,1.6,0,true); }
  // máquinas das câmaras
  const mach=[];
  { const x=-40; addBlock(x-2.4,x+2.4,-2,2,3.6,{mat:hm(0x3a4a5a),surf:'metal',seg:1}); addBlock(x-1.8,x+1.8,-1.4,1.4,1.2,{y0:3.6,mat:hm(0x2a3a4a),surf:'metal',seg:1}); const ram=addMesh(BOX(2.6,.6,2),MAT.darkMetal,x,2.8,0,'metal'); mach.push({id:'m0',x,z:0,nm:'a prensa hidráulica',ram}); }
  { const x=-14; for(const dz of [-4,4]) addBlock(x-3,x+3,dz-.8,dz+.8,1.1,{mat:hm(0x4a5a4a),surf:'metal',seg:1}); addBlock(x-1,x+1,-.6,.6,1.6,{mat:hm(0x4a5a4a),surf:'metal',seg:1}); mach.push({id:'m1',x,z:0,nm:'o torno de precisão'}); }
  { const x=14; addBlock(x-3,x+3,-1,1,.9,{mat:M.wood,surf:'wood',seg:1}); for(let k=-2;k<=2;k++){ const s=new T.Mesh(new T.SphereGeometry(.2,10,8),hm(0xb0a060)); s.position.set(x+k,1.1,0); scene.add(s); } mach.push({id:'m2',x,z:0,nm:'a bancada de giroscópios'}); }
  for(const m of mach){ m.charge=addMesh(BOX(.4,.3,.25),hm(0x8a2a1a),m.x+(m.id==='m0'?2.5:m.id==='m1'?1.1:3.1),.9,m.z,null); m.charge.visible=false; }
  // sala de controle
  addBlock(38,42,-8.6,-7.4,1.4,{mat:hm(0x3a3a34),surf:'metal',seg:1}); const panel=addMesh(BOX(3,.8,.05),new T.MeshBasicMaterial({color:0x2a3a2a}),40,1.6,-7.36,null); const knob=addMesh(BOX(.2,.4,.12),hm(0xa02a1a),40,1.4,-7.25,null);
  addBlock(36.4,38,4,8,.78,{mat:M.wood,surf:'wood',seg:1,cover:true}); for(let i=0;i<5;i++) addMesh(BOX(.3,.3,.05),new T.MeshBasicMaterial({color:i%2?0xffa040:0x3aff5a}),38.6+i*.6,2.2,-7.36,null);
  // poço de ventilação (saída)
  addMesh(new T.CylinderGeometry(1.4,1.4,.1,16),new T.MeshBasicMaterial({color:0x8a9aa8}),-55.5,H-.05,15,null); for(let y=.3;y<H;y+=.45) addMesh(BOX(.9,.05,.05),MAT.darkMetal,-57.6,y,15,null); const shaft=new T.PointLight(0x9ab0c8,.8,8,1.6); shaft.position.set(-55.5,H-.6,15); scene.add(shaft);
  // trem que trouxe Élise
  for(let i=0;i<2;i++){ addBlock(-56+i*3.6-1.6,-56+i*3.6+1.6,-15,-13,1.4,{mat:hm(0x4a3a2a),surf:'metal',seg:1}); }
  // trabalhadores forçados (não combatentes)
  const workers=[]; for(const [x,z,ry] of [[-30,-11.2,0],[-6,-16.8,Math.PI],[24,-11.2,0],[46,-16.8,Math.PI],[-20,12,Math.PI],[20,11.4,0]]){ const a=new Actor({id:'wk'+x,x,z,yaw:ry},{uniform:0x6a6a74,pants:0x6a6a74,skin:0xc8a080,hair:0x3a2a1a,cap:null,weapon:null,boots:true}); removeShootables(a.h.hitMeshes); a.aimTarget=0; for(const k of ['chest','abdomen']){ const p=a.h.parts[k]; if(!p) continue; for(let y=-.15;y<=.16;y+=.1){ const st=new T.Mesh(BOX(p.geometry.parameters.width*1.02,.035,p.geometry.parameters.depth*1.02),hm(0x2a2a3a)); st.position.y=y; p.add(st); } } workers.push(a); }
  // luzes
  for(const [id,x,z,r] of [['A1',-48,-14,10],['A2',-26,-14,10],['A3',0,-14,10],['A4',26,-14,10],['A5',50,-14,10],['B1',-44,14,10],['B2',-16,14,10],['B3',10,14,10],['B4',36,14,10],['C1',-40,0,9],['C2',-14,0,9],['C3',14,0,9],['C4',40,0,9]]){ bulb(id,x,H-.8,z,r); const L=W.lamps[W.lamps.length-1]; L.base=1.15; L.light.intensity=1.15; L.light.distance=r*1.7; }
  const alarmL=new T.PointLight(0xff2a10,0,30,1.4); alarmL.position.set(0,H-1,0); scene.add(alarmL);
  // navegação
  const N=[];
  for(let x=-57;x<=57.1;x+=2.4) for(const z of [-17.2,-14.8,-12.4,-11,11,12.6,14.2,15.4,17.4]) N.push({x,z});
  for(const cx of [-40,-14,14,40]) for(let x=cx-3.4;x<=cx+3.5;x+=1.7) for(let z=-9;z<=9.1;z+=1.8) N.push({x,z});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.36)); W.nav.link=3.2; buildNav();
  return {grilles,mach,depot,panel,knob,workers,alarmL,bombs};
}
function objectives19(){ return [
  {id:'key19',text:'Pegue a chave do mestre de obras (ele circula pelas galerias)',state:'active'},
  {id:'panel19',text:'Abra as grades das câmaras no painel da sala de controle (leste)',state:'hidden',marker:{x:40,z:-7}},
  {id:'mach19',text:'Instale cargas nas três máquinas (0/3)',state:'hidden'},
  {id:'depot19',text:'Instale a última carga no depósito de ogivas (galeria B)',state:'hidden',marker:{x:0,z:15}},
  {id:'evac19',text:'Saia pelo poço de ventilação (galeria B, extremo oeste)',state:'hidden',marker:{x:-55.5,z:15}},
  {id:'workers19',text:'Opcional: avise os trabalhadores antes das explosões (0/6)',state:'active',optional:true},
]; }
function interact19(R){
  const I=W.interactables, F=()=>G.flags;
  I.push({id:'key19',pt:()=>F().keyPos?V3(F().keyPos[0],.3,F().keyPos[1]):V3(0,-50,0),r:2,label:()=>F().keyPos&&!F().key19?'Pegar a chave do mestre':null,use:()=>{ F().key19=true; if(R.keyM) R.keyM.visible=false; AudioSys.play('pickup'); pickupMsg('Chave do painel'); complete('key19'); activate('panel19'); cp19(); }});
  I.push({id:'panel19',pt:()=>V3(40,1.4,-7),r:2.2,hold:()=>1.2,label:()=>F().grillesUp?null:(F().key19?'Girar a chave e erguer as grades (segure)':'Painel trancado — a chave fica com o mestre de obras'),
    use:()=>{ if(!F().key19) return; F().grillesUp=true; R.knob.rotation.z=1.2; AudioSys.play('clank',V3(0,3,0),1.4); emitNoise(V3(40,1,-6),14,'lure',null); for(const id of R.grilles){ const d=W.doors[id]; d.state='CLOSED'; openDoor(d,null); }
      complete('panel19'); activate('mach19'); G.radioMsg('PAVEL','As grades sobem! Prensa na câmara 1, tornos na 2, giroscópios na 3.','tip'); cp19(); }});
  R.mach.forEach(m=>I.push({id:'mach'+m.id,pt:()=>V3(m.x,1,m.z),r:3.4,hold:()=>2,label:()=>F().grillesUp&&!F()['c_'+m.id]?'Instalar carga em '+m.nm+' (segure)':null,use:()=>placeCharge19('c_'+m.id,m.charge)}));
  I.push({id:'depot19',pt:()=>V3(0,.9,15),r:2.6,hold:()=>2,label:()=>obj('depot19').state==='active'?'Instalar a última carga e acender o pavio (segure)':null,use:()=>{ R.depotCharge=R.depotCharge||addMesh(BOX(.4,.3,.25),hm(0x8a2a1a),0,.7,14.2,null); placeCharge19('c_depot',R.depotCharge); }});
  R.workers.forEach((a,i)=>I.push({id:'wk'+i,pt:()=>V3(a.pos.x,1.5,a.pos.z),r:2,skip:true,label:()=>F()['wk'+i]?null:'Avisar o trabalhador (“Raus! Bombe!”)',use:()=>{ F()['wk'+i]=true; F().wkN=(F().wkN||0)+1; AudioSys.play('cloth',a.pos,1); const o=obj('workers19'); o.text='Opcional: avise os trabalhadores antes das explosões ('+F().wkN+'/6)'; refreshObjectiveUI(); if(F().wkN>=6) complete('workers19'); }}));
  I.push({id:'evac19',pt:()=>V3(-55.5,1.2,15),r:2.8,skip:true,label:()=>obj('evac19').state==='active'?'Subir pelo poço de ventilação':null,use:()=>{ if(obj('evac19').state!=='active') return; if(!F().boom19) F().boom19=0.01; F().escaped=true; complete('evac19'); if(obj('workers19').state==='active') failObjective('workers19'); missionComplete(); }});
}
function placeCharge19(key,mesh){ const F=G.flags; if(F[key]) return; F[key]=true; mesh.visible=true; AudioSys.play('unlock'); F.nCh=(F.nCh||0)+1;
  const m=['c_m0','c_m1','c_m2'].filter(k=>F[k]).length; const o=obj('mach19'); if(o.state==='active'){ o.text='Instale cargas nas três máquinas ('+m+'/3)'; refreshObjectiveUI(); if(m>=3){ complete('mach19'); activate('depot19'); G.radioMsg('PAVEL','Três máquinas armadas. A última carga vai no depósito de ogivas — essa acende o pavio de todas.','warn'); } }
  if(key==='c_depot'){ complete('depot19'); activate('evac19'); F.fuse19=G.diff==='recruta'?120:G.diff==='veterano'?75:95; G.alarm=true; G.radioMsg('ÉLISE','Pavio aceso. Noventa segundos até a montanha cair em cima disto. Poço de ventilação, extremo oeste da galeria B!','warn'); }
  pickupMsg('Carga instalada ('+F.nCh+'/4)'); cp19(); }
function update19(dt){
  const P=G.player, F=G.flags, R=G.refs;
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('PAVEL','Você está na galeria A, a da montagem. As câmaras das máquinas ficam atrás de grades — o painel da sala de controle as ergue, mas só com a chave do mestre de obras.','tip'); }
  if(!F.i2&&G.introT>11){ F.i2=true; G.radioMsg('DICA','Os trabalhadores de uniforme listrado não lutam. Fale com eles (E) para que fujam antes das explosões.','tip'); }
  // chave do mestre
  if(!F.keyPos){ const m=G.enemies.find(e=>e.id==='mestre'); if(m&&m.dead){ F.keyPos=[m.pos.x,m.pos.z]; R.keyM=addMesh(BOX(.16,.03,.06),hm(0xc8a040),m.pos.x,.05,m.pos.z,null); G.radioMsg('PAVEL','O mestre caiu. A chave está com ele — pegue antes que alguém pise em cima.'); const o=obj('key19'); o.marker={x:m.pos.x,z:m.pos.z}; refreshObjectiveUI(); } }
  // trabalhadores avisados fogem para o poço
  R.workers.forEach((a,i)=>{ if(F['wk'+i]&&!a.gone){ if(!a.wps) a.wps=a.pos.z<-10?[[40,-14],[40,14.6],[-55.5,14.6]]:[[a.pos.x,14.6],[-55.5,14.6]];
      const w=a.wps[0], dx=w[0]-a.pos.x, dz=w[1]-a.pos.z, d=Math.hypot(dx,dz); if(d<.3){ a.wps.shift(); if(!a.wps.length){ a.gone=true; a.h.root.visible=false; } } else { const sp=Math.min(d,3.4*dt); a.pos.x+=dx/d*sp; a.pos.z+=dz/d*sp; a.yaw=Math.atan2(dx,dz); a.speedNow=3.4; a.crouchTarget=.2; } }
    else { a.speedNow=0; a.crouchTarget=G.alarm?.8:0; } a.animate(dt); });
  if(F.grillesUp&&!F.navRe&&R.grilles.every(id=>W.doors[id].state==='OPEN')){ F.navRe=true; buildNav(); }
  // prensa animada
  const ram=R.mach[0].ram; if(ram&&!F.boomDone) ram.position.y=2.8-Math.abs(Math.sin(simTime*1.3))*1.2;
  // pavio
  if(F.fuse19>0&&!F.boomDone){ F.fuse19-=dt; G.progress={label:'Evacuação: '+Math.max(0,Math.ceil(F.fuse19))+' s',v:F.fuse19/95}; R.alarmL.intensity=Math.sin(simTime*8)>0?2.4:0; if(Math.random()<dt*1.2) AudioSys.play('siren',V3(0,5,0),.5);
    if(Math.random()<dt*.6){ FX.burst(V3(P.pos.x+rnd(-4,4),6.5,P.pos.z+rnd(-4,4)),6,0x8a8478,2,.6,9.8,1); AudioSys.play('stone',P.pos,.7); }
    if(F.fuse19<=0){ F.boomDone=true; G.progress=null; for(const [x,z] of [[-40,0],[-14,0],[14,0],[0,15]]) explode(V3(x,1,z),{r:9,dmgE:300,dmgP:300,src:'charge',kind:'wreck'}); if(!F.escaped){ hurtPlayer(999,P.pos.clone()); } } }
}
function cp19(){ checkpoint(); }
function restore19(s){ const F=G.flags, R=G.refs; F.navRe=false;
  if(F.keyPos&&!F.key19){ R.keyM=addMesh(BOX(.16,.03,.06),hm(0xc8a040),F.keyPos[0],.05,F.keyPos[1],null); }
  if(F.grillesUp){ R.knob.rotation.z=1.2; for(const id of R.grilles){ const d=W.doors[id]; if(d.state==='LOCKED'){ d.state='CLOSED'; openDoor(d,null); } } }
  for(const m of R.mach) if(F['c_'+m.id]) m.charge.visible=true; if(F.c_depot){ R.depotCharge=addMesh(BOX(.4,.3,.25),hm(0x8a2a1a),0,.7,14.2,null); F.fuse19=Math.max(F.fuse19||0,45); }
  R.workers.forEach((a,i)=>{ if(F['wk'+i]){ a.gone=true; a.h.root.visible=false; } });
}
LEVELS['19']={id:'19',num:19,op:'Operação 19',name:'Sabotagem!',place:'Fábrica subterrânea de Graufels',prev:'18',
  loadout:{weapons:['silenced','smg','pistol'],ammo:{silenced:{mag:6,reserve:18},smg:{mag:32,reserve:96},pistol:{mag:8,reserve:16}},cur:'silenced',camera:false},baseLight:.42,lightFn:light19,zoneAt:zone19,shadows:false,bloomTh:.75,grenades:true,
  build:()=>buildLevel19(),enemies:ENEMY_DEFS_19,ally:null,start:{x:-54,z:-11.6,yaw:-Math.PI/2},startDocs:['plantas18'],drawMap:null,
  reinf:[{id:'n1',x:56,z:14,weapon:'smg',helmet:true},{id:'n2',x:56,z:-14,weapon:'rifle',helmet:true,nades:1},{id:'n3',x:40,z:6,weapon:'rifle',helmet:true}],
  radio:{x:37,z:6,fx:37.4,fz:3.6},radioRun:'O guarda corre para o telefone da sala de controle!',alarmPos:V3(37,1.4,6),alarmText:'Alarme na fábrica! A guarda desce das galerias.',alarmObjective:null,
  alarmYes:'As sirenes da fábrica tocaram. ',alarmLate:'',alarmNo:'',alarmOk:()=>!!G.flags.c_depot,deathText:'A guarda de Graufels encontrou Élise entre as bombas voadoras.',
  objectives:objectives19,interact:interact19,pickups:()=>{ addPickup('f_med1',-28,-17.2,'med',30,.1); addPickup('f_smg1',-14,8,'smg',32,.1); addPickup('f_nade1',40,8,'nade',2,.1); addPickup('f_med2',30,17.2,'med',35,.1); addPickup('f_med3',-40,17.2,'med',40,.1); G.player.nades=Math.max(G.player.nades||0,1); },
  update:update19,restore:restore19,
  resultTitle:'Sabotagem',outro:['ÉLISE','Estou no meio da escada de ferro quando a montanha tosse. O poço inteiro treme, e uma nuvem de pó sobe comigo até a neve. Lá embaixo, a linha de montagem de Graufels virou pedra.'],menuCam:{cx:-30,cz:-14,y:2,tx:0,tz:-14},ambient:'crypt',mist:null,
  briefing:{meta:'GRAUFELS — 21 DE NOVEMBRO DE 1944 — 01h30',paras:['O trem de minério deixou Élise na galeria A, onde bombas voadoras passam de trilho em trilho. As máquinas que fazem as peças — a prensa, o torno de precisão e a bancada de giroscópios — ficam em câmaras atrás de grades, e o painel que as ergue só gira com a chave do mestre de obras.','Pegue a chave, erga as grades, arme as três máquinas e acenda o pavio no depósito de ogivas. Depois, corra para o poço de ventilação. Avise os trabalhadores forçados: eles não têm culpa.'],list:['Chave do mestre → painel das grades','Três máquinas e o depósito de ogivas','Evacuação pelo poço de ventilação']}};
LEVEL_ORDER.push('19');


/* =========================================================
   OPERAÇÃO 20 — Fuga de Sidecar (estrada do vale, 21/11/1944, 03h)
   modo especial: Élise na metralhadora do sidecar, Pavel pilota
   ========================================================= */
WEAPONS.mg=Object.assign({},WEAPONS.smg,{id:'mg',name:'MG 34 (montada)',cat:'Metralhadora do sidecar',mode:'AUTO',auto:true,rpm:760,dmg:40,mag:75,reserveMax:999,recoil:.9,recoilX:.35,spreadHip:1.6,spreadADS:.9,bloom:.35,noise:30,falloff:[40,120,.7],fovADS:52,ammoName:'cartuchos'});
function buildVMmg(B,M){
  const g=new T.Group(); const blk=new T.MeshPhongMaterial({color:0x26282a,shininess:24,specular:0x222222});
  B(g,.07,.09,.5,0,-.02,-.1,blk); B(g,.05,.11,.2,0,-.06,.2,new T.MeshPhongMaterial({color:0x3a2a1c,shininess:8}),-.15);
  const jacket=new T.Mesh(new T.CylinderGeometry(.03,.03,.5,10),blk); jacket.rotation.x=Math.PI/2; jacket.position.set(0,.01,-.58); g.add(jacket);
  for(let i=0;i<5;i++){ const h=new T.Mesh(BOX(.062,.012,.04),new T.MeshBasicMaterial({color:0x0a0a0a})); h.position.set(0,.03,-.4-i*.08); g.add(h); }
  const mag=new T.Group(); g.add(mag); const drum=new T.Mesh(new T.CylinderGeometry(.075,.075,.09,14),blk); drum.rotation.z=Math.PI/2; drum.position.set(-.08,-.02,-.14); mag.add(drum);
  B(g,.05,.07,.08,.0,-.08,.06,M.skin); B(g,.062,.062,.3,.03,-.12,.22,M.sleeve,-.25); B(g,.05,.06,.07,-.03,-.05,-.3,M.skin); B(g,.06,.06,.3,-.08,-.1,-.18,M.sleeve,-.5);
  const muzzle=new T.Object3D(); muzzle.position.set(0,.01,-.85); g.add(muzzle);
  VM.models.mg={g,mag,muzzle,hip:V3(.13,-.15,-.36),ads:V3(0,-.1,-.3),magHome:mag.position.clone()};
}
const PATH20=[[0,180],[0,130],[30,100],[30,60],[0,30],[-40,20],[-60,-10],[-60,-50],[-30,-80],[10,-90],[40,-120],[40,-160],[40,-196]];
function path20(){ const P=PATH20, seg=[]; let L=0; for(let i=0;i<P.length-1;i++){ const a=P[i], b=P[i+1], l=Math.hypot(b[0]-a[0],b[1]-a[1]); seg.push({a,b,l,s0:L}); L+=l; } return {seg,L}; }
let PATH20C=null; function pathData20(){ return PATH20C||(PATH20C=path20()); }
function pathAt20(s,off){ const R=pathData20(); s=clamp(s,0,R.L-.01); let sg=R.seg[0]; for(const g of R.seg) if(s>=g.s0) sg=g; const t=(s-sg.s0)/sg.l, dx=(sg.b[0]-sg.a[0])/sg.l, dz=(sg.b[1]-sg.a[1])/sg.l;
  // suaviza a direção perto das curvas
  const nx=sg.a[0]+(sg.b[0]-sg.a[0])*t, nz=sg.a[1]+(sg.b[1]-sg.a[1])*t; const o=off||0; return {x:nx-dz*o, z:nz+dx*o, dx, dz, yaw:Math.atan2(dx,dz)}; }
function distToPath20(x,z){ let m=1e9; for(const g of path20().seg){ const ax=g.a[0], az=g.a[1], bx=g.b[0], bz=g.b[1]; const vx=bx-ax, vz=bz-az; const t=clamp(((x-ax)*vx+(z-az)*vz)/(vx*vx+vz*vz),0,1); m=Math.min(m,Math.hypot(x-ax-vx*t,z-az-vz*t)); } return m; }
function bike20(rider){ const g=new T.Group(); scene.add(g); const blk=hm(0x2a2e2a);
  const body=new T.Mesh(BOX(.35,.45,1.5),blk); body.position.y=.65; g.add(body); for(const z of [-.7,.7]){ const w=new T.Mesh(new T.CylinderGeometry(.33,.33,.12,12),MAT.tire||hm(0x111111)); w.rotation.z=Math.PI/2; w.position.set(0,.33,z); g.add(w); }
  const bar=new T.Mesh(BOX(.7,.05,.05),MAT.darkMetal); bar.position.set(0,1.05,.55); g.add(bar);
  if(!rider){ const tub=new T.Mesh(BOX(.8,.55,1.6),blk); tub.position.set(1.05,.55,0); g.add(tub); const w=new T.Mesh(new T.CylinderGeometry(.3,.3,.12,12),hm(0x111111)); w.rotation.z=Math.PI/2; w.position.set(1.5,.3,0); g.add(w); const mg=new T.Mesh(BOX(.08,.08,1),MAT.darkMetal); mg.position.set(1.05,1.1,.5); g.add(mg); }
  bikeDetail(g,rider); return g; }
function buildLevel20(){
  M5=mats05(); M6=mats06(); const M=M6;
  scene.background=new T.Color(0x10141c); scene.fog=new T.FogExp2(0x1a1e26,.018);
  skyDome(2020,[[0,'#0a0e18'],[.3,'#1a2030'],[.45,'#2a3040'],[.5,'#3a3e48'],[.53,'#1a1a1e'],[1,'#0a0a0a']],null,4);
  scene.add(new T.HemisphereLight(0x9aaac8,0x3a3e44,.62)); const moon=new T.DirectionalLight(0xa8b8d8,.3); moon.position.set(20,40,30); scene.add(moon); scene.add(new T.AmbientLight(0x2a3040,.4));
  const snow=MAT_HQ?new T.MeshPhongMaterial({map:TEX.dust5,color:0xd8dce4,shininess:20,specular:0x222428}):new T.MeshLambertMaterial({map:TEX.dust5,color:0xd8dce4}), roadM=new T.MeshLambertMaterial({map:TEX.dust5,color:0x8a8478}), roofS=new T.MeshLambertMaterial({color:0xd0d4dc}), plaster=new T.MeshLambertMaterial({map:TEX.lime5,color:0xb0a898});
  floorPlane(260,440,-10,-5,snow,'stone',0);
  const path=path20(); for(const g of path.seg){ const cx=(g.a[0]+g.b[0])/2, cz=(g.a[1]+g.b[1])/2; const m=new T.Mesh(new T.PlaneGeometry(7,g.l+7).rotateX(-Math.PI/2),roadM); m.position.set(cx,.012,cz); m.rotation.y=Math.atan2(g.b[0]-g.a[0],g.b[1]-g.a[1]); scene.add(m); }
  // floresta
  const trunks=[], tops=[]; for(let i=0;i<900;i++){ const R=mulberry32(20000+i); const x=-130+R()*240, z=-220+R()*430; if(distToPath20(x,z)<9) continue; trunks.push([x,1,z,.3,2,.3,0]); const h=4+R()*5; tops.push([x,2+h/2,z,1.7,h,1.7,R()*3]); }
  instanced(new T.CylinderGeometry(.5,.6,1,6),hm(0x2a1e14),trunks); instanced(new T.ConeGeometry(1,1,7),hm(0x2a3a34),tops); instanced(new T.ConeGeometry(1.02,1,7),new T.MeshLambertMaterial({color:0xe8ecf4,transparent:true,opacity:.5}),tops.map(t=>[t[0],t[1]+t[4]*.18,t[2],t[3]*.7,t[4]*.6,t[5]*.7,t[6]]));
  // vila no meio do caminho
  for(const [x0,x1,z0,z1] of [[-52,-44,26,34],[-34,-26,6,12],[-38,-30,-6,0],[-76,-68,-6,2]]) house18(x0,x1,z0,z1,4,plaster,{roof:roofS});
  // ponte no fim
  const br=path.seg[path.seg.length-1]; addBlock(br.b[0]-5,br.b[0]+5,br.b[1]-2,br.b[1]+14,.4,{mat:M.wood,surf:'wood',seg:2}); for(const s of [-1,1]) addBlock(br.b[0]+s*4.6-.15,br.b[0]+s*4.6+.15,br.b[1]-2,br.b[1]+14,1.1,{mat:M.wood,surf:'wood',seg:2});
  const water=new T.Mesh(new T.PlaneGeometry(260,12).rotateX(-Math.PI/2),MAT_HQ?new T.MeshPhongMaterial({color:0x223444,specular:0x8899aa,shininess:60}):new T.MeshLambertMaterial({color:0x223444})); water.position.set(-10,.008,br.b[1]+6); scene.add(water);
  // barreira do posto (s≈300)
  const pb=pathAt20(300); const barrier=new T.Group(); barrier.position.set(pb.x,0,pb.z); barrier.rotation.y=pb.yaw; scene.add(barrier); const bb=new T.Mesh(BOX(7,.16,.16),M.barrier||hm(0xe8e0d0)); bb.position.y=1; barrier.add(bb); for(const sx of [-3.6,3.6]){ const p=new T.Mesh(BOX(.2,1.1,.2),MAT.darkMetal); p.position.set(sx,.55,0); barrier.add(p); }
  // motos: a nossa (Pavel + sidecar)
  const myBike=bike20(false); const pavel=new Actor({id:'pavel',x:0,z:180,yaw:Math.PI},{uniform:0x3a3a40,pants:0x2a2a2e,skin:0xd0a080,hair:0x3a2a1a,cap:'beret',capColor:0x1a1a1a,weapon:null,boots:true}); removeShootables(pavel.h.hitMeshes); pavel.crouchTarget=.55; pavel.aimTarget=0;
  const headL=new T.SpotLight(0xffe8b0,1.6,40,.42,.6,1.2); scene.add(headL); scene.add(headL.target);
  // postes nas aldeias
  const lit20=[]; for(const s of [40,190,300,470]){ const p=pathAt20(s,5); const L=lampPost('P'+s,p.x,p.z,0,0); if(L){ L.base=1; L.light.intensity=1; } lit20.push([p.x,p.z,10]); }
  const snowP=makeSnow(1400);
  // navegação esparsa ao longo da estrada
  const N=[]; for(let s=0;s<path.L;s+=6) for(const o of [-5,0,5]){ const p=pathAt20(s,o); N.push({x:p.x,z:p.z}); }
  W.nav.nodes=N; W.nav.link=8; buildNav();
  return {path,myBike,pavel,headL,snowP,barrier,lit20,bikes:[]};
}
function spawnSide20(id,s,off,w,extra){ const p=pathAt20(s,off), c=pathAt20(s-20); const e=spawnEnemy04(Object.assign({id,x:p.x,z:p.z,yaw:Math.atan2(c.x-p.x,c.z-p.z),weapon:w,helmet:true,fixed:true},extra||{}),false); if(e){ e.alertLevel=1; e.reactionT=(e.reactionT||0)+1.4; } return e; }
function objectives20(){ return [
  {id:'ride20',text:'Segure a metralhadora do sidecar: chegue à ponte do rio',state:'active'},
  {id:'block20',text:'Abra caminho no posto da estrada',state:'hidden'},
  {id:'bikes20',text:'Opcional: derrube todas as motos que perseguem vocês',state:'active',optional:true},
  {id:'hp20',text:'Opcional: chegue à ponte com mais da metade da saúde',state:'active',optional:true},
]; }
function interact20(R){}
const EVENTS20=[
  {s:20,run:()=>{ spawnSide20('a1',62,-9,'rifle'); spawnSide20('a2',66,9,'rifle'); spawnSide20('a3',72,-8,'smg'); G.radioMsg('PAVEL','Emboscada na curva! Atire em tudo que se mexer na beira da estrada!','warn'); }},
  {s:95,run:()=>{ chaser20('c1',-14,'smg'); chaser20('c2',-22,'rifle'); G.radioMsg('PAVEL','Motos atrás de nós! Vire a metralhadora!','warn'); }},
  {s:170,run:()=>{ spawnSide20('v1',214,-10,'rifle'); spawnSide20('v2',220,10,'smg'); spawnSide20('v3',232,-9,'rifle'); spawnSide20('v4',226,11,'rifle',{nades:1}); }},
  {s:250,run:()=>{ for(const [i,o] of [[1,-4],[2,4],[3,-6],[4,6]]) spawnSide20('r'+i,308,o,i%2?'rifle':'smg'); G.radioMsg('PAVEL','Posto com barreira à frente! Vou parar — limpe o caminho e eu passo por cima.','warn'); activate('block20'); }},
  {s:340,run:()=>{ chaser20('c3',-12,'smg'); chaser20('c4',-20,'smg'); chaser20('c5',-30,'rifle'); }},
  {s:420,run:()=>{ spawnSide20('p1',470,-7,'rifle'); spawnSide20('p2',476,7,'rifle'); spawnSide20('p3',486,-6,'smg'); G.radioMsg('PAVEL','A ponte! Os guardas da ponte — derrube e eu acelero!','warn'); }},
];
function chaser20(id,lag,w){ const R=G.refs, F=G.flags; const p=pathAt20(Math.max(0,F.s20+lag)); const e=spawnEnemy04({id,x:p.x,z:p.z,yaw:p.yaw,weapon:w,helmet:true,fixed:true},true); if(!e) return; e.chase={lag,off:(R.bikes.length%2?-2.2:2.2)}; e.bike=bike20(true); R.bikes.push(e); F.bikesN=(F.bikesN||0)+1; }
function update20(dt){
  const P=G.player, F=G.flags, R=G.refs;
  updateSnow(R.snowP,dt,.7);
  if(F.s20===undefined){ F.s20=0; F.v20=0; F.ev=0; P.cur='mg'; }
  if(!F.i1&&G.introT>.6){ F.i1=true; G.radioMsg('PAVEL','Segure firme no sidecar! Daqui até a ponte do rio são cinco quilômetros de estrada e todos os quartéis do vale acordados.','tip'); }
  if(!F.i2&&G.introT>5){ F.i2=true; G.radioMsg('DICA','Você só controla a mira: a moto segue sozinha. A MG 34 tem munição de sobra — recarregue (R) quando o tambor acabar.','tip'); }
  // eventos
  while(F.ev<EVENTS20.length&&F.s20>=EVENTS20[F.ev].s){ EVENTS20[F.ev].run(); F.ev++; }
  // posto: parar até limpar
  const blockAlive=G.enemies.some(e=>/^r\d/.test(e.id)&&!e.dead);
  let target=G.diff==='recruta'?7.5:8.5; if(F.s20>285&&F.s20<298&&(blockAlive||F.ev<4)) target=0; if(F.s20>=pathData20().L-6) target=0;
  if(obj('block20').state==='active'&&!blockAlive&&F.ev>=4){ complete('block20'); F.ram=true; G.radioMsg('PAVEL','Segure-se!'); P.hp=Math.min(100,P.hp+25); cp20(); }
  if(F.ram&&F.s20>299&&!F.rammed){ F.rammed=true; R.barrier.rotation.x=-1.4; R.barrier.position.y=.2; AudioSys.play('wood',P.pos,1.4); FX.burst(V3(R.barrier.position.x,1,R.barrier.position.z),20,0xe8e0d0,4,.5,9.8,1); }
  F.v20=lerp(F.v20,target,1-Math.exp(-dt*(target<F.v20?3:.8))); F.s20+=F.v20*dt;
  const me=pathAt20(F.s20,0), look=pathAt20(F.s20+3,0); const yaw=Math.atan2(look.x-me.x,look.z-me.z);
  R.myBike.position.set(me.x,0,me.z); R.myBike.rotation.y=yaw; R.myBike.rotation.z=Math.sin(simTime*9)*.01*F.v20/8;
  R.pavel.pos.set(me.x,.35,me.z); R.pavel.yaw=yaw; R.pavel.speedNow=0; R.pavel.animate(dt);
  const sx=Math.cos(yaw), sz=-Math.sin(yaw); P.pos.set(me.x+sx*1.05,-.42,me.z+sz*1.05); P.vx=P.vz=P.vy=0; P.ys=null; P.onGround=true;
  R.headL.position.set(me.x,1.2,me.z); R.headL.target.position.set(me.x+Math.sin(yaw)*20,0,me.z+Math.cos(yaw)*20);
  if(Math.random()<dt*(F.v20>1?6:1)) AudioSys.play('engine',P.pos,.25);
  // motos inimigas
  for(const e of R.bikes){ if(!e.bike) continue; if(e.dead){ if(!e.crashed){ e.crashed=true; e.crashT=0; AudioSys.play('metal',e.pos,1.2); F.bikesDown=(F.bikesDown||0)+1; } e.crashT+=dt; e.bike.rotation.z=Math.min(1.4,e.crashT*3); continue; }
    e.chase.lag=Math.min(-6,e.chase.lag+dt*1.6); const p=pathAt20(Math.max(0,F.s20+e.chase.lag),e.chase.off); const q=pathAt20(Math.max(0,F.s20+e.chase.lag+2),e.chase.off); const by=Math.atan2(q.x-p.x,q.z-p.z);
    e.pos.set(p.x,.3,p.z); e.bike.position.set(p.x,0,p.z); e.bike.rotation.y=by; e.crouchTarget=.55; if(e.state!=='COMBAT') e.enterCombat(P.pos.x,P.pos.z,true); }
  if(F.bikesN&&F.bikesDown>=F.bikesN&&F.ev>=5&&obj('bikes20').state==='active') complete('bikes20');
  G.progress={label:'Até a ponte: '+Math.max(0,Math.round((pathData20().L-F.s20)*10))+' m',v:F.s20/pathData20().L};
  if(F.s20>=pathData20().L-6.5&&!F.end20){ const bridgeAlive=G.enemies.some(e=>/^p\d/.test(e.id)&&!e.dead); if(!bridgeAlive){ F.end20=true; G.progress=null; complete('ride20'); if(F.bikesN&&F.bikesDown<F.bikesN) failObjective('bikes20'); if(P.hp>50) complete('hp20'); else failObjective('hp20'); missionComplete(); } }
}
function cp20(){ checkpoint(); }
function restore20(s){ const F=G.flags; F.s20=Math.max(0,(F.s20||0)-4); F.v20=0; G.refs.bikes=[]; for(const e of G.enemies) if(/^c\d/.test(e.id)&&!e.dead){ e.hp=0; e.dead=true; e.gone=true; e.h.root.visible=false; } F.bikesN=F.bikesDown=G.enemies.filter(e=>/^c\d/.test(e.id)).length; if(F.rammed){ G.refs.barrier.rotation.x=-1.4; G.refs.barrier.position.y=.2; } }
LEVELS['20']={id:'20',num:20,op:'Operação 20',name:'Fuga de Sidecar',place:'Estrada do vale de Graufels',prev:'19',
  loadout:{weapons:['mg'],ammo:{mg:{mag:75,reserve:999}},cur:'mg',camera:false},baseLight:.3,lightFn:(x,z)=>.32,shadows:false,bloomTh:.75,grenades:false,
  build:()=>buildLevel20(),enemies:[],ally:null,start:{x:1.05,z:180,yaw:0},startDocs:[],drawMap:null,dmgMul:()=>G.flags.v20>2?(G.diff==='veterano'?.4:.3):.45,
  reinf:[],radio:{x:0,z:0,fx:0,fz:0},radioRun:'',alarmPos:V3(0,1,0),alarmText:'',alarmObjective:null,alarmYes:'',alarmLate:'',alarmNo:'',alarmOk:()=>true,deathText:'A moto tombou na neve. Pavel e Élise não chegaram à ponte.',
  objectives:objectives20,interact:interact20,pickups:()=>{},
  update:update20,restore:restore20,
  resultTitle:'Fuga de sidecar',outro:['ÉLISE','Pavel desliga o motor do outro lado da ponte. O cano da MG ainda solta fumaça na neve. Atrás de nós, o vale inteiro tem um brilho laranja — Graufels queima por dentro.'],menuCam:{cx:0,cz:170,y:2,tx:0,tz:140},ambient:'wind',mist:null,
  briefing:{meta:'TURÍNGIA — 21 DE NOVEMBRO DE 1944 — 03h00',paras:['Élise saiu do poço de ventilação direto na neve. Pavel a esperava com uma moto roubada de sidecar e uma MG 34 montada. Cinco quilômetros de estrada até a ponte do rio, e todos os quartéis do vale já sabem o que aconteceu na montanha.','Pavel pilota. Você só cuida da metralhadora: emboscadas na beira da estrada, motos na cola e um posto com barreira — ele para até o caminho estar limpo.'],list:['Metralhadora do sidecar (munição de sobra)','Limpar o posto da estrada','Chegar à ponte do rio']}};
LEVEL_ORDER.push('20');