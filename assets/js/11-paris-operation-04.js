'use strict';


/* =========================================================
   OPERAÇÃO 4 — Rue des Tanneurs / Quai Saint-Léger
   ========================================================= */
const DEF04={recruta:80,soldado:92,veterano:105};
const ENEMY_DEFS_04=[
  {id:'k1',x:-4.5,z:-42.6,yaw:0,weapon:'smg',helmet:true},
  {id:'k2',x:7.5,z:-41.4,yaw:0,weapon:'rifle',helmet:true},
  {id:'k3',x:-8.5,z:-55,yaw:0,weapon:'rifle',helmet:true,nades:1},
  {id:'k4',x:9,z:-54,yaw:0,weapon:'smg',helmet:true},
  {id:'k5',x:-16,z:-36,yaw:Math.PI/2,weapon:'rifle',helmet:true},
];
const WAVES04=[
  {t:2,list:[{id:'a1',x:30.5,z:15,weapon:'rifle',helmet:true},{id:'a2',x:30.5,z:18.5,weapon:'smg',helmet:true},{id:'a3',x:-30.5,z:14,weapon:'rifle',helmet:true},{id:'a4',x:-30.5,z:18,weapon:'smg'}]},
  {t:30,list:[{id:'b1',x:30.5,z:16,weapon:'smg',helmet:true,nades:1},{id:'b2',x:30,z:20,weapon:'rifle',helmet:true},{id:'b3',x:-30.5,z:16.5,weapon:'rifle',helmet:true},{id:'b4',x:-30,z:20,weapon:'smg',helmet:true}]},
  {t:58,list:[{id:'c1',x:30.5,z:14.5,weapon:'smg',helmet:true,nades:2},{id:'c2',x:30.5,z:19,weapon:'rifle',helmet:true},{id:'c3',x:-30.5,z:15,weapon:'smg',helmet:true,nades:1},{id:'c4',x:-30.5,z:19.5,weapon:'rifle',helmet:true},{id:'c5',x:26,z:20.6,weapon:'rifle',helmet:true}]},
];
function mats04(){
  const HQ=MAT_HQ, L=(o,ex)=>{ if(!HQ) return new T.MeshLambertMaterial(o); const p=Object.assign({shininess:6,specular:0x0d0d0d},o,ex||{}); if(p.map&&p.bump!==false){ p.bumpMap=p.map; p.bumpScale=p.bumpScale||.035; } delete p.bump; return new T.MeshPhongMaterial(p); };
  return {
    facA:L({map:TEX.facade,emissiveMap:TEX.facadeEm,emissive:0xffffff,emissiveIntensity:.1,color:0xe0d2bc}),
    facB:L({map:TEX.facade,emissiveMap:TEX.facadeEm,emissive:0xffffff,emissiveIntensity:.1,color:0xc4b8a6}),
    facC:L({map:TEX.facade,emissiveMap:TEX.facadeEm,emissive:0xffffff,emissiveIntensity:.1,color:0xbcc0bc}),
    wall:L({map:TEX.plaster,color:0xd6cab2}), court:L({map:TEX.concrete,color:0xa49e90}), rubble:L({map:TEX.concrete,color:0x8a8070}),
    press:L({color:0x2b2d2f},{specular:0x666666,shininess:70}), paper:L({color:0xdcd4c0}), quay:L({map:TEX.mstone||TEX.concrete,color:0xa8a090}),
    barge:L({map:TEX.wood,color:0x6a4a30}), bus:L({color:0x2a2622},{specular:0x111111,shininess:8}), busP:L({color:0x5a3a2a}),
  };
}
function smokeColumn(x,y,z,n,h,col){
  if(!MAT_HQ) return; G.smoke4=G.smoke4||[];
  for(let i=0;i<n;i++){ const s=new T.Sprite(new T.SpriteMaterial({map:SOFTTEX,color:col||0x3a3530,transparent:true,opacity:0,depthWrite:false,fog:true})); scene.add(s); G.smoke4.push({s,x,y,z,h,ph:i/n,sp:rnd(.05,.07),a:rnd(.3,.45),dx:rnd(.6,1.4)}); }
}
function truck04(x,z){
  const a=addBlock(x-3,x+3,z-1.05,z+1.05,.9,{mat:MAT.truck,surf:'metal',cover:true,y0:.45,seg:1}); a.minY=0;
  const b=addBlock(x+.2,x+3,z-1,z+1,1.25,{mat:MAT.truck,surf:'metal',y0:1.35,seg:1});
  const c=addBlock(x-3,x+.2,z-1.05,z+1.05,1.55,{mat:MAT.canvas,surf:'cloth',y0:1.35,seg:1});
  for(const s of [a,b,c]) s.mesh.visible=false; const B=vehB(); const desert=G&&G.level&&['06','07','08'].includes(G.level.id); vehTruck(B,desert?0x8a7c5c:0x3b4434,'canvas',{jerry:true}); B.place(x,z,Math.PI/2);
}
function planeTree(x,z){ addMesh(new T.CylinderGeometry(.18,.24,4.6,7),MAT.desk,x,2.3,z,'wood'); addSolidOnly(x-.24,x+.24,z-.24,z+.24,4.6); const c=new T.Mesh(new T.SphereGeometry(2.1,10,8),MAT.tree); c.position.set(x,5.6,z); c.scale.y=.85; scene.add(c); }
function morris(x,z){ addMesh(new T.CylinderGeometry(.55,.6,3,12),MAT.kiosk,x,1.5,z,'metal'); addMesh(new T.SphereGeometry(.62,12,6,0,Math.PI*2,0,Math.PI/2),MAT.kiosk,x,3,z,'metal'); addSolidOnly(x-.55,x+.55,z-.55,z+.55,3,0,true);
  poster(x,1.7,z+.6,0,.8,1.1,(g,w,h)=>{ g.fillStyle='#d8c8a0'; g.fillRect(0,0,w,h); g.fillStyle='#7a2a20'; g.font='bold 34px serif'; g.textAlign='center'; g.fillText('CINÉMA',w/2,60); g.fillStyle='#2a241b'; g.font='22px serif'; g.fillText('LE DERNIER',w/2,130); g.fillText('TRAIN',w/2,160); g.fillRect(40,200,w-80,4); }); }
function buildLevel04(){
  const M=mats04(); G.radioDead=true;
  scene.background=new T.Color(0x8a7a72); scene.fog=new T.FogExp2(0x8c7c72,.0125);
  skyDome(404,[[0,'#2c3754'],[.3,'#5a5a6a'],[.44,'#c08a66'],[.5,'#e8a868'],[.54,'#8a6a5a'],[1,'#3a3430']],[930,236,16],14);
  scene.add(new T.HemisphereLight(0xb8bfd0,0x5a4834,.78));
  const sun=new T.DirectionalLight(0xffc896,.95); sun.position.set(70,20,-14); scene.add(sun);
  scene.add(new T.AmbientLight(0x3a3430,.32));
  // chão
  floorPlane(68,94,0,-17,MAT.ground,'stone',.0);
  floorPlane(64,2,0,11,MAT.concrete,'stone',.016); floorPlane(64,1.6,0,21.2,MAT.concrete,'stone',.016);
  floorPlane(2,42,-11,-43,MAT.concrete,'stone',.016); floorPlane(2,42,11,-43,MAT.concrete,'stone',.016);
  floorPlane(18,12,0,4,MAT.floorWood,'wood',.02); floorPlane(18,12,0,-8,M.court,'stone',.02); floorPlane(4,8,4,-18,M.court,'stone',.02);
  // quarteirões
  const fb=(x0,x1,z0,z1,h,mat,inner)=>addBlock(x0,x1,z0,z1,h,{mat,surf:'stone',top:MAT.roof,seg:4,inner});
  fb(-34,-9,-14,10,13,M.facB,{'+x':M.wall}); fb(9,34,-14,10,12,M.facA,{'-x':M.wall});
  fb(-34,34,22,30,12,M.facC);
  addBlock(-34,-32.6,10,22,2.6,{mat:M.rubble,surf:'stone',top:M.rubble,seg:1}); addBlock(32.6,34,10,22,2.6,{mat:M.rubble,surf:'stone',top:M.rubble,seg:1});
  for(const s of [-1,1]) for(let i=0;i<6;i++) addMesh(BOX(rnd(.5,1.2),rnd(.3,.7),rnd(.5,1.1)),M.rubble,s*rnd(30.6,32.4),rnd(.2,.4),rnd(10.5,21.5),'stone').rotation.y=rnd(0,3);
  fb(-34,2,-22,-14,12,M.facA,{'+x':M.wall}); fb(6,34,-22,-14,12,M.facB,{'-x':M.wall});
  addBlock(2,6,-22,-14,8.6,{y0:3.4,mat:M.facB,bottom:MAT.ceil,top:MAT.roof,seg:4});
  fb(-34,-12,-28,-22,11,M.facC); fb(-34,-20,-40,-28,11,M.facB); fb(-34,-12,-66,-40,12,M.facA);
  fb(12,34,-42,-22,11,M.facA); fb(12,34,-66,-48,12,M.facC); addBlock(34,35,-48,-42,6,{mat:M.rubble,surf:'stone',seg:2});
  // ---- gráfica ----
  const sw=(x0,x1,h,y0=0,cover=false)=>addBlock(x0,x1,9.8,10.2,h,{mat:M.wall,surf:'stone',seg:1.5,y0,cover,top:M.wall,inner:{'+z':M.facB}});
  sw(-9,-7,4); sw(-7,-2.6,1,0,true); sw(-7,-2.6,1.3,2.7); sw(-2.6,-1.2,4); sw(-1.2,1.2,1.4,2.6); sw(1.2,2.6,4); sw(2.6,7,1,0,true); sw(2.6,7,1.3,2.7); sw(7,9,4);
  addBlock(-9,9,-2,10,.4,{y0:4,mat:MAT.ceil,bottom:MAT.ceil,top:MAT.roof,seg:3});
  addBlock(-9,9,-2,10.2,8.6,{y0:4.4,mat:M.facB,top:MAT.roof,seg:4});
  poster(0,3.3,10.24,0,6,.7,(g,w,h)=>{ g.fillStyle='#1d2a24'; g.fillRect(0,0,w,h); g.strokeStyle='#c9a85a'; g.lineWidth=3; g.strokeRect(4,4,w-8,h-8); g.fillStyle='#e8d29a'; g.font='bold 18px serif'; g.textAlign='center'; g.fillText('IMPRIMERIE VASSEUR',w/2,h/2+6); });
  const pw=(x0,x1,h,y0=0)=>addBlock(x0,x1,1.8,2.2,h,{mat:M.wall,surf:'stone',seg:1.5,y0,top:M.wall});
  pw(-9,3,4); pw(5,9,4); pw(3,5,1.4,2.6);
  const bw=(x0,x1,h,y0=0)=>addBlock(x0,x1,-2.2,-1.8,h,{mat:M.wall,surf:'stone',seg:1.5,y0,top:M.wall,inner:{'-z':M.facB}});
  bw(-9,5,4); bw(7,9,4); bw(5,7,1.4,2.6);
  makeDoor('back',{x:6,z:-2,w:2,h:2.6,d:.12,mat:MAT.doorWood,offset:V3(1.95,0,0),locked:true,nav:true});
  // salão de impressão
  addBlock(2.2,6,5,7.4,1.55,{mat:M.press,surf:'metal',cover:true,seg:1}); addMesh(new T.CylinderGeometry(.35,.35,3.6,12),M.press,4.1,1.75,6.2,'metal').rotation.z=Math.PI/2;
  addMesh(BOX(.6,.6,1.8),M.press,6.5,.9,6.2,'metal'); addSolidOnly(6.2,6.8,5.3,7.1,1.2);
  addBlock(-8.8,-8,3,8.6,1.9,{mat:MAT.cabinet,surf:'wood',seg:1});
  addBlock(-5.6,-4,5,6.2,1,{mat:M.paper,surf:'cloth',cover:true,seg:1}); addBlock(-3.2,-1.9,6.8,7.8,.8,{mat:M.paper,surf:'cloth',cover:true,seg:1});
  addBlock(-6.2,-2.8,8.1,8.7,1,{mat:MAT.desk,surf:'wood',cover:true,seg:1});
  addBlock(6.4,8.6,8.2,8.9,1,{mat:MAT.desk,surf:'wood',cover:true,seg:1});
  crate(-1.6,8.6,.8,.8); crate(1.7,8.7,.8,.8);
  bulb('S1',-1,3.7,6,9); W.lamps[W.lamps.length-1].light.color.setHex(0xffe0b0);
  bulb('S2',-4,3.6,0,6); W.lamps[W.lamps.length-1].light.color.setHex(0xffd8a0);
  { const papers=[]; const R=mulberry32(44); for(let i=0;i<60;i++){ const x=-8+R()*16, z=-1.6+R()*11; if(insideSolid(x,z,.1)) continue; papers.push([x,.03,z,.22,.004,.3,R()*6]); } instanced(UNIT,MAT.paper,papers); }
  // sala dos fundos e fornalha
  addBlock(-8.7,-7.1,-1.7,-.3,1.3,{mat:MAT.stove,surf:'metal',seg:1}); addMesh(new T.CylinderGeometry(.16,.16,2.7,8),MAT.darkMetal,-8.2,2.6,-1.3,'metal');
  addBlock(-8.8,-8.2,.3,1.6,2,{mat:MAT.books,surf:'wood',seg:1}); addBlock(-3,-1,-1.6,-.6,.8,{mat:MAT.desk,surf:'wood',cover:true,seg:1});
  const nadeCrate=addMesh(BOX(.7,.4,.5),MAT.crate,-7.4,.2,7.5,'wood'); addSolidOnly(-7.75,-7.05,7.25,7.75,.4);
  { const lid=addMesh(BOX(.72,.04,.52),M.court,-7.4,.42,7.5,'wood'); lid.material=hm(0x4a5a3a); }
  const stoveL=new T.PointLight(0xff8a3a,1.2,6,2); stoveL.position.set(-7.6,1.3,-.6); scene.add(stoveL);
  // ---- rua ----
  car(-14,17,false); car(15,14.6,false); truck04(25.5,18.6);
  sandbags(-22.5,-19.5,12.6,13.6); sandbags(19,21.5,20,21);
  crate(8,18.2); crate(9.1,18.6,.9,.9); crate(8.5,18.4,.8,.7,1);
  addBlock(-6.2,-3.6,17,18.4,1.1,{mat:MAT.crate,surf:'wood',cover:true,seg:1}); for(const x of [-6.4,-3.4]){ const w=addMesh(new T.CylinderGeometry(.55,.55,.08,12),MAT.desk,x,.55,17.7,'wood'); w.rotation.x=Math.PI/2; }
  morris(-26,12.6); barrel(27.5,12); barrel(28.2,12.5);
  for(const [id,x] of [['L1',-17],['L2',-1],['L3',16]]){ const L=lampPost(id,x,11.4,0,.6); L.base=.45; L.light.intensity=.45; }
  const carFire=new T.PointLight(0xff8a3a,1.6,11,1.8); carFire.position.set(-14,1.6,17); scene.add(carFire);
  // ---- pátio ----
  addBlock(-4.7,-4.5,-14,-11.4,2.6,{mat:MAT.crate,surf:'wood',seg:1}); addBlock(-9,-6.4,-9.7,-9.5,2.6,{mat:MAT.crate,surf:'wood',seg:1});
  addBlock(-9,-4.5,-14,-9.5,.15,{y0:2.6,mat:MAT.roof,surf:'wood',seg:2});
  addBlock(-8.4,-6.6,-13.4,-11.8,.7,{mat:MAT.crate,surf:'wood',cover:true,seg:1});
  const pzfMesh=new T.Group(); for(let i=0;i<2;i++){ const t=new T.Mesh(new T.CylinderGeometry(.04,.04,1,8),hm(0x3e4234)); t.rotation.z=Math.PI/2; t.position.set(0,0,i*.14-.07); pzfMesh.add(t); const h=new T.Mesh(new T.SphereGeometry(.075,8,6),hm(0x50553e)); h.scale.x=1.6; h.position.set(.55,0,i*.14-.07); pzfMesh.add(h); } pzfMesh.position.set(-7.5,.78,-12.6); scene.add(pzfMesh);
  { const tarp=new T.Mesh(new T.PlaneGeometry(1.6,1.2),MAT.canvas); tarp.rotation.x=-Math.PI/2+.25; tarp.position.set(-7.9,.82,-12.1); scene.add(tarp); }
  crate(5.5,-12.6,1.1,1.1); crate(6.7,-12.8,1,.9); crate(6,-12.7,.9,.8,1.1); barrel(-1,-13.2); barrel(-.3,-13.4);
  addBlock(1.5,4.2,-7,-6,1,{mat:MAT.crate,surf:'wood',cover:true,seg:1});
  bulb('Y1',6,3,-2.6,6); W.lamps[W.lamps.length-1].base=.6;
  // ---- passagem e cais ----
  sandbags(-7,-2.5,-26.6,-25.6); addBlock(7,9.6,-28.6,-27.5,1.1,{mat:MAT.crate,surf:'wood',cover:true,seg:1});
  morris(-8,-33); addBlock(7.5,9.5,-35,-33,2.4,{mat:MAT.kiosk,surf:'metal',cover:true,top:MAT.roof,seg:1});
  sandbags(-7,-3,-41.5,-40.5); sandbags(6,9,-40.5,-39.5);
  addBlock(-10,-7.4,-52,-44,2.4,{mat:M.bus,surf:'metal',cover:true,top:M.bus,seg:1}); for(let i=0;i<4;i++) addMesh(new T.PlaneGeometry(1.4,.8),hm(0x0d0f10),-7.38,1.6,-50.8+i*1.9,'metal').rotation.y=Math.PI/2;
  crate(9.5,-52); crate(10.1,-53.2,.9,.9);
  for(const z of [-26,-58]) planeTree(-10.6,z); for(const z of [-26,-60]) planeTree(10.6,z); planeTree(-10.6,-40.5); planeTree(10.6,-44.4+12);
  for(const [id,x,z,ax] of [['Q1',-10.9,-34,.6],['Q2',10.9,-50.5,-.6]]){ const L=lampPost(id,x,z,ax,0); L.base=.4; L.light.intensity=.4; }
  // café em ruínas
  const cw=(z0,z1,h,y0=0,cover=false)=>addBlock(-12.4,-12,z0,z1,h,{mat:M.facC,surf:'stone',seg:1.5,y0,cover,inner:{'-x':M.wall}});
  cw(-30,-28,4); cw(-40,-38,4); cw(-36,-34,.9,0,true); cw(-38,-28,.8,3.2);
  addBlock(-20,-12,-40,-28,.4,{y0:4,mat:MAT.ceil,bottom:MAT.ceil,top:MAT.roof,seg:3}); addBlock(-20,-12.4,-40,-28,7,{y0:4.4,mat:M.facC,top:MAT.roof,seg:4});
  addBlock(-20,-19.6,-40,-28,4,{mat:M.wall,surf:'stone',seg:2});
  floorPlane(8,12,-16,-34,MAT.tiles,'stone',.02);
  addBlock(-19.4,-18.6,-38,-31,1.05,{mat:MAT.darkWood,surf:'wood',cover:true,seg:1});
  for(const [x,z] of [[-15.5,-30.5],[-14.6,-37.6],[-16.8,-34]]){ addMesh(new T.CylinderGeometry(.4,.4,.04,14),MAT.cafeTop,x,.74,z,'metal'); addSolidOnly(x-.3,x+.3,z-.3,z+.3,.75); chair(x+.6,z+.3,-1.9); }
  addBlock(-14.4,-13.2,-33,-32.2,.9,{mat:MAT.darkWood,surf:'wood',cover:true,seg:1});
  poster(-11.97,3.6,-34,Math.PI/2,4,.6,(g,w,h)=>{ g.fillStyle='#2a1a14'; g.fillRect(0,0,w,h); g.fillStyle='#e8c77a'; g.font='bold 26px serif'; g.textAlign='center'; g.fillText('CAFÉ DU PONT',w/2,h/2+9); });
  bulb('C1',-16,3.6,-34,6); W.lamps[W.lamps.length-1].base=.7;
  // parapeito, escada e rio
  addBlock(-12,6,-64.5,-64,1,{mat:M.quay,surf:'stone',cover:true,top:M.quay,seg:1}); addBlock(9,12,-64.5,-64,1,{mat:M.quay,surf:'stone',cover:true,top:M.quay,seg:1});
  addSolidOnly(6,9,-64.4,-64,3);
  for(let i=0;i<9;i++) addMesh(BOX(3,.22,.5),M.quay,7.5,-.12-.26*i,-64.3-.48*i,'stone');
  { const qw=new T.Mesh(new T.PlaneGeometry(80,3),M.quay); qw.position.set(0,-1.4,-64.02); qw.rotation.y=Math.PI; scene.add(qw); }
  { const wg=new T.PlaneGeometry(160,90); wg.rotateX(-Math.PI/2); const w=new T.Mesh(wg,MAT.water); w.position.set(0,-2.5,-109); scene.add(w); }
  addBlock(5,10,-80,-66,.8,{y0:-2.4,mat:M.barge,surf:'wood',seg:2,solid:false}); addBlock(6,9,-76,-72,1.1,{y0:-1.6,mat:M.barge,surf:'wood',seg:1,solid:false});
  addBlock(18,25,-130,-66,.8,{y0:-.6,mat:M.quay,surf:'stone',seg:4,solid:false}); for(let z=-74;z>-130;z-=14) addBlock(18.6,24.4,z-2,z,2,{y0:-2.6,mat:M.quay,surf:'stone',seg:2,solid:false});
  for(const [x0,x1,h] of [[-70,-30,16],[-30,-4,13],[-4,16,15],[27,70,14]]) addBlock(x0,x1,-160,-148,h,{mat:M.facB,surf:'stone',seg:6,solid:false,y0:-2.5});
  // fumaça e névoa de incêndio
  smokeColumn(-14,1.4,17,12,10,0x2e2a26); smokeColumn(-44,10,-30,14,26); smokeColumn(40,9,4,12,22); smokeColumn(-8,12,-150,10,28,0x4a4440);
  // Mme. Vasseur e Lucien (figurantes)
  const vas=new Actor({id:'vasseur',x:-6.2,z:-.6,yaw:-Math.PI/2+.5},{uniform:0x3b3230,pants:0x2e2624,skin:0xd2a888,hair:0x9a9288,boots:false}); removeShootables(vas.h.hitMeshes); addSolidOnly(-6.55,-5.85,-.95,-.25,1.7);
  const luc=new Actor({id:'lucien_b',x:7.5,z:-67.4,yaw:0},{uniform:0x5a4630,pants:0x2d2a26,skin:0xcfa27e,hair:0x2b1e14,cap:'beret',weapon:'pistol',boots:true}); luc.pos.y=-1.6; removeShootables(luc.h.hitMeshes); luc.aimTarget=.2;
  // blindado
  G.tank=makeTank(30.4,-45,-Math.PI/2);
  // navegação
  const N=[];
  for(let x=-30;x<=30;x+=2.5) for(let z=11;z<=21;z+=2.5) N.push({x,z});
  for(let x=-8;x<=8;x+=2) for(let z=-1;z<=9;z+=2) N.push({x,z});
  for(let x=-8;x<=8;x+=2) for(let z=-13;z<=-3;z+=2) N.push({x,z});
  for(let z=-15;z>=-21;z-=2) N.push({x:4,z});
  for(let x=-11;x<=11;x+=3) for(let z=-23;z>=-63;z-=3) N.push({x,z});
  for(let x=-19;x<=-13;x+=2) for(let z=-39;z<=-29;z+=2) N.push({x,z});
  for(let x=13;x<=31;x+=3) for(const z of [-46.5,-43.5]) N.push({x,z});
  N.push({x:0,z:9.2},{x:0,z:10.9},{x:4,z:2.9},{x:4,z:1.1},{x:6,z:-1.3},{x:6,z:-2.7},{x:4,z:-13.3},{x:4,z:-22.7},{x:-11.3,z:-37},{x:-12.8,z:-37},{x:-11.3,z:-32},{x:-12.8,z:-32});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.42)); W.nav.link=5.4; buildNav();
  return {vas,luc,stoveL,carFire,nadeCrate,pzfMesh};
}
function objectives04(){ return [
  {id:'defend',text:'Defenda a gráfica enquanto Mme. Vasseur queima os arquivos',state:'active',marker:{x:0,z:10}},
  {id:'back',text:'Saia pelos fundos: a porta do pátio foi destrancada',state:'hidden',marker:{x:6,z:-2}},
  {id:'pzf',text:'Pegue os Panzerfaust sob a lona, no galpão do pátio',state:'hidden',marker:{x:-7.5,z:-12.6}},
  {id:'quai',text:'Atravesse a passagem até o Quai Saint-Léger',state:'hidden',marker:{x:4,z:-22}},
  {id:'tank',text:'Destrua o blindado: Panzerfaust (4) na lateral ou na traseira',state:'hidden',marker:{x:2,z:-45}},
  {id:'barge',text:'Desça a escada do cais: Lucien espera na barcaça',state:'hidden',marker:{x:7.5,z:-63.6}},
  {id:'inside',text:'Opcional: nenhum soldado entra na gráfica durante a queima',state:'active',optional:true,autoDone:true},
  {id:'twoAT',text:'Opcional: derrube o blindado com no máximo dois Panzerfaust',state:'active',optional:true,autoDone:true},
]; }
function givePzf(mag,reserve){
  const P=G.player; if(!P.weapons.includes('pzf')) P.weapons.push('pzf');
  const a=P.ammo.pzf=P.ammo.pzf||{mag:0,reserve:0}; a.mag=Math.max(a.mag,mag); a.reserve=Math.min(WEAPONS.pzf.reserveMax,a.reserve+reserve); G.hud.ammoT=4;
}
function pzfTotal(){ const a=G.player.ammo.pzf; return a?a.mag+a.reserve:0; }
function interact04(refs){
  const I=W.interactables;
  I.push({id:'backdoor',pt:()=>V3(6,1.2,-2),r:2.3,skipSolid:()=>W.doors.back.solid,
    label:()=>{ const d=W.doors.back; if(d.state==='LOCKED') return 'Porta dos fundos — Mme. Vasseur tem a chave'; return d.state==='CLOSED'?'Abrir porta':d.state==='OPEN'?'Fechar porta':null; },
    locked:()=>W.doors.back.state==='LOCKED',
    use:()=>{ const d=W.doors.back; if(d.state==='LOCKED'){ G.radioMsg('MME. VASSEUR','Só quando o último papel virar cinza. Segure a frente!','tip'); return; } if(d.state==='CLOSED') openDoor(d,null); else if(d.state==='OPEN') closeDoor(d); }});
  I.push({id:'nadecrate',pt:()=>V3(-7.4,.5,7.5),r:2.2,label:()=>G.flags.nadeCrate?null:'Pegar granadas da caixa',
    use:()=>{ const P=G.player; if((P.nades||0)>=6){ showHint('Você já carrega o máximo de granadas.'); return; } G.flags.nadeCrate=true; const add=Math.min(3,6-(P.nades||0)); P.nades=(P.nades||0)+add; refs.nadeCrate.material=MAT.roof; pickupMsg('Granadas +'+add); AudioSys.play('pickup'); G.hud.ammoT=4; }});
  I.push({id:'pzfcrate',pt:()=>V3(-7.5,.9,-12.6),r:2.4,
    label:()=>{ if(!G.flags.pzfTaken) return 'Pegar os Panzerfaust'; if(G.tank&&G.tank.state!=='DEAD'&&pzfTotal()===0) return 'Pegar o último Panzerfaust da lona'; return null; },
    use:()=>{ if(!G.flags.pzfTaken){ G.flags.pzfTaken=true; refs.pzfMesh.visible=false; givePzf(1,1); switchWeapon('pzf'); pickupMsg('Panzerfaust ×2'); AudioSys.play('pickup'); complete('pzf'); if(obj('quai').state==='hidden') activate('quai');
        G.radioMsg('DICA','4 seleciona o Panzerfaust. Um disparo por tubo; R pega o próximo. Mire acima do alvo à distância e deixe espaço atrás de você.','tip'); cp04(); }
      else { givePzf(1,0); switchWeapon('pzf'); pickupMsg('Panzerfaust +1'); AudioSys.play('pickup'); } }});
  I.push({id:'barge',pt:()=>V3(7.5,1,-63.9),r:2.8,skip:true,
    label:()=>obj('barge').state==='active'?'Descer à barcaça':'Escada do cais — Lucien espera na barcaça', locked:()=>obj('barge').state!=='active',
    use:()=>{ if(obj('barge').state!=='active'){ G.radioMsg('LUCIEN','Com esse blindado no cais, não saímos da margem. Acabe com ele!','tip'); return; } missionComplete(); }});
}
function pzfPickup(id,x,z){
  addPickup(id,x,z,'pzf',1); const p=W.pickups[W.pickups.length-1]; scene.remove(p.mesh);
  const g=new T.Group(); const t=new T.Mesh(new T.CylinderGeometry(.04,.04,1,8),hm(0x3e4234)); t.rotation.z=Math.PI/2; g.add(t); const h=new T.Mesh(new T.SphereGeometry(.075,8,6),hm(0x50553e)); h.scale.x=1.6; h.position.x=.55; g.add(h);
  g.position.set(x,.08,z); g.rotation.y=rnd(0,3); scene.add(g); p.mesh=g;
}
function pickups04(){
  G.player.nades=G.level.grenades;
  addPickup('t_med1',7.6,3.2,'med',35); addPickup('t_med2',-2.2,-1.1,'med',35,.82); addPickup('t_smg1',-4.8,4.3,'smg',32); addPickup('t_pis1',7.5,8.5,'pistol',8,1.02);
  addPickup('t_med3',6.4,-11.6,'med',35); addPickup('t_smg2',-2.2,-12.8,'smg',32); addPickup('t_nade1',2.8,-6.5,'nade',2,1.02);
  addPickup('t_med4',-17,-38.5,'med',40); addPickup('t_smg3',-14.2,-29.4,'smg',32); addPickup('t_nade2',-18.9,-33,'nade',2,1.07); pzfPickup('t_pzf1',-15.6,-39.2);
  addPickup('t_med5',10.5,-57.2,'med',35); pzfPickup('t_pzf2',-6.6,-46.5); addPickup('t_smg4',-6.8,-49,'smg',24);
}
function pickupSpecial(p){
  const P=G.player;
  if(p.type==='nade'){ if((P.nades||0)>=6) return false; P.nades=Math.min(6,(P.nades||0)+p.n); pickupMsg('Granadas +'+p.n); G.hud.ammoT=4; return true; }
  if(p.type==='pzf'){ givePzf(p.n,0); pickupMsg('Panzerfaust +'+p.n); return true; }
  return false;
}
function spawnEnemy04(d,combat){
  if(G.enemies.find(e=>e.id===d.id)) return null;
  const e=new Enemy(Object.assign({yaw:d.x>0?-Math.PI/2:Math.PI/2},d)); G.enemies.push(e); G.actors.push(e); addTakedown(e);
  if(combat){ e.enterCombat(G.player.pos.x,G.player.pos.z,true); e.reactionT+=.5; }
  return e;
}
function cp04(){
  const K=G.tank, F=G.flags;
  if(K){ F.tankState=K.state; F.tankX=K.x; F.tankZ=K.z; F.tankYaw=K.yaw; F.tankTy=K.ty; F.tankHull=K.hull; F.tankTurret=K.turretOK; F.tankGun=K.gunOK; }
  F.rockets=G.rocketsFired||0; checkpoint();
}
function defenseDone04(){
  const F=G.flags; F.backDone=true; complete('defend'); G.progress=null;
  if(obj('inside').state==='active') complete('inside',true);
  const d=W.doors.back; if(d.state==='LOCKED'){ d.state='CLOSED'; openDoor(d,null); }
  activate('back');
  G.radioMsg('MME. VASSEUR','Está feito — não sobrou um nome. A porta dos fundos está aberta. Eu saio pelo esgoto; vão!');
  spawnEnemy04({id:'q1',x:4,z:-20.4,yaw:0,weapon:'smg',helmet:true},false); spawnEnemy04({id:'q2',x:3.2,z:-17.6,yaw:0,weapon:'rifle',helmet:true},false);
  cp04();
}
function startTank04(){
  const K=G.tank; if(K.state!=='HIDDEN') return; activateTank(K); K.state='ENTER';
  if(obj('quai').state==='active') complete('quai',true);
  activate('tank'); G.combatT=9;
  G.radioMsg('LUCIEN','Ouviu esse motor? Blindado vindo pela Rue du Pont! Balas não adiantam: Panzerfaust, de lado ou por trás.','warn');
}
function onTankDestroyed04(){
  complete('tank'); activate('barge');
  G.radioMsg('LUCIEN','Ele queimou! Venha para a escada do cais, estou soltando as cordas!');
  if(!G.flags.reinf){ G.flags.reinf=true; spawnEnemy04({id:'r1',x:28,z:-44,weapon:'smg',helmet:true,nades:1},true); spawnEnemy04({id:'r2',x:30,z:-46.5,weapon:'rifle',helmet:true},true); spawnEnemy04({id:'r3',x:-6,z:-61,yaw:0,weapon:'rifle',helmet:true},true); }
  cp04();
}
function update04(dt){
  const P=G.player, F=G.flags, R=G.refs, K=G.tank;
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('MME. VASSEUR','Estão fechando a rua! Preciso de um minuto e meio na fornalha. Segure a frente da gráfica!','warn'); }
  if(!F.i2&&G.introT>7){ F.i2=true; G.radioMsg('DICA','G (ou X) arremessa uma granada: raio de uns 6 m, e os soldados fogem se a virem. Agachado atrás das vitrines você expõe só a cabeça.','tip'); }
  if(obj('defend').state==='active'){
    if(G.introT>2){ F.burnT=(F.burnT||0)+dt; F.burn=Math.min(1,F.burnT/DEF04[G.diff]); }
    for(let i=0;i<WAVES04.length;i++){ const w=WAVES04[i]; if(!F['wave'+i]&&(F.burnT||0)>=w.t){ F['wave'+i]=true; for(const d of w.list) spawnEnemy04(d,true);
      if(i===1){ G.radioMsg('LUCIEN','(rádio) Outro caminhão na esquina leste — tem gente com granada!','warn'); cp04(); }
      if(i===2){ G.radioMsg('MME. VASSEUR','Falta pouco! Não deixe entrarem!','warn'); cp04(); } } }
    G.progress={label:'Arquivos queimados · '+Math.floor((F.burn||0)*100)+'%',v:F.burn||0};
    if(obj('inside').state==='active'&&G.enemies.some(e=>!e.dead&&e.pos.x>-9&&e.pos.x<9&&e.pos.z>-1.8&&e.pos.z<9.7)){ failObjective('inside'); G.radioMsg('MME. VASSEUR','Tem soldado dentro da gráfica!','warn'); }
    if((F.burn||0)>=1) defenseDone04();
    // Mme. Vasseur alimenta a fornalha
    const v=R.vas; v.react.aR=-.9*Math.max(0,Math.sin(simTime*2.2)); v.react.aL=-.7*Math.max(0,Math.sin(simTime*2.2+.6)); v.yaw=-Math.PI/2+.5+Math.sin(simTime*.7)*.25;
    if(Math.random()<dt*3) FX.puff(V3(-7.9,1.45,-1),1,0xffa040,.35,.5,V3(0,.7,0),.7);
  } else { G.progress=null; if(R.vas.h.root.visible&&P.pos.z<-4){ R.vas.h.root.visible=false; } }
  R.vas.animate(dt); R.luc.pos.y=-1.6+Math.sin(simTime*.9)*.03; R.luc.animate(dt); R.luc.h.root.position.y=R.luc.pos.y;
  R.stoveL.intensity=(F.backDone?.5:1.2)+Math.sin(simTime*11)*.15+Math.random()*.12;
  R.carFire.intensity=1.5+Math.sin(simTime*13)*.25+Math.random()*.3;
  if(Math.random()<dt*7) FX.puff(V3(-14+rnd(-1,1),1.4,17+rnd(-.4,.4)),1,0xff9a40,.5,.45,V3(0,1,0),.6);
  if(obj('back').state==='active'&&P.pos.z<-2.6){ complete('back'); activate('pzf'); G.radioMsg('LUCIEN','(rádio) Élise, o galpão à esquerda do pátio: dois Panzerfaust embaixo da lona.'); }
  if(K.state==='HIDDEN'&&F.backDone&&P.pos.z<-13.5) startTank04();
  if(obj('quai').state==='active'&&P.pos.z<-22.6) complete('quai');
  if(K.state!=='HIDDEN'&&K.state!=='DEAD'){ const o=obj('tank'); o.marker={x:K.x,z:K.z}; }
  if(obj('twoAT').state==='active'&&(G.rocketsFired||0)>2&&K.state!=='DEAD') failObjective('twoAT');
  if(K.state!=='HIDDEN'&&K.state!=='DEAD'&&F.pzfTaken&&pzfTotal()===0&&!W.rockets.length){ F.noAT=(F.noAT||0)+dt; if(F.noAT>5&&!F.noATmsg){ F.noATmsg=true; G.radioMsg('LUCIEN','Sem tubos? Tem Panzerfaust no café, atrás do ônibus e ainda um sob a lona do pátio.','tip'); } }
  if(G.smoke4) for(const m of G.smoke4){ const t=(m.ph+simTime*m.sp)%1; m.s.position.set(m.x+Math.sin(t*3+m.ph*9)*m.dx+t*2,m.y+t*m.h,m.z+Math.cos(t*2+m.ph*7)*m.dx*.6); const k=1.2+t*5; m.s.scale.set(k,k,1); m.s.material.opacity=m.a*Math.min(1,t*6)*(1-t); }
  F.ambT=(F.ambT||4)-dt; if(F.ambT<=0){ F.ambT=rnd(5,11); AudioSys.play(Math.random()<.3?'explosion':'eshot',V3(rnd(-80,80),5,rnd(-90,40)),.25); }
  updateTank(dt);
}
function restore04(s){
  const F=G.flags, K=G.tank, R=G.refs, P=G.player;
  if(F.nadeCrate) R.nadeCrate.material=MAT.roof;
  if(F.pzfTaken) R.pzfMesh.visible=false;
  if(F.backDone) R.vas.h.root.visible=false;
  G.rocketsFired=F.rockets||0;
  if(F.tankState&&F.tankState!=='HIDDEN'){
    K.x=F.tankX; K.z=F.tankZ; K.yaw=F.tankYaw; K.ty=F.tankTy||0; K.hull=F.tankHull; K.turretOK=F.tankTurret!==false; K.gunOK=F.tankGun!==false;
    activateTank(K); K.state=F.tankState==='DEAD'?'PATROL':F.tankState; syncTank(K); if(F.tankState==='DEAD') tankDestroyed(K,true);
  }
  for(const e of G.enemies) if(!e.dead&&e.alertLevel) e.enterCombat(P.pos.x,P.pos.z,true);
}
function updateHUD04(dt){
  const P=G.player, L=G.level;
  const nt=$('#nadeTag'); nt.hidden=!L.grenades; if(L.grenades){ $('#nadeN').textContent=P.nades||0; $('#nadeKey').textContent=APP.touch?'GRAN.':'G'; nt.classList.toggle('empty',!(P.nades>0)); }
  const pr=$('#objProg'); if(G.progress){ pr.hidden=false; $('#objProgL').textContent=G.progress.label; $('#objProgB').style.width=(G.progress.v*100).toFixed(1)+'%'; } else pr.hidden=true;
  let best=null, bd=9; for(const n of W.nades||[]){ const d=Math.hypot(n.mesh.position.x-P.pos.x,n.mesh.position.z-P.pos.z); if(d<bd){ bd=d; best=n; } }
  const ni=$('#nadeInd');
  if(best&&!P.dead&&!(best.owner==='player'&&best.age<.6)){ ni.hidden=false; const b=Math.atan2(best.mesh.position.x-P.pos.x,-(best.mesh.position.z-P.pos.z)); const rel=angDiff(-P.yaw,b); const r=Math.min(innerHeight*.2,130); const sp=ni.firstElementChild; sp.style.left=(Math.sin(rel)*r)+'px'; sp.style.top=(-Math.cos(rel)*r)+'px'; sp.textContent='Granada · '+bd.toFixed(0)+' m'; sp.classList.toggle('near',bd<NADE.enemy.r); }
  else ni.hidden=true;
  const K=G.tank, tc=$('#tankChip'), th=$('#threat');
  if(K&&K.state!=='HIDDEN'&&K.state!=='DEAD'){ tc.hidden=false; $('#tankHull').style.width=Math.max(0,K.hull)+'%'; $('#tankSys').textContent='Torre '+(K.turretOK?'ativa':'travada')+' · canhão '+(K.gunOK?'ativo':'inutilizado'); } else tc.hidden=true;
  if(K&&K.warn>0&&K.state!=='DEAD'&&!P.dead){ th.hidden=false; $('#threatB').style.width=(K.warn/K.warnMax*100)+'%'; $('#threatT').textContent=K.aimedAtPlayer?'Canhão mirando em você — saia da linha':'O canhão do blindado vai disparar'; th.classList.toggle('on',!!K.aimedAtPlayer); } else th.hidden=true;
}
LEVELS['04']={id:'04',num:4,op:'Operação 4',name:'Pise com Cuidado',place:'Rue des Tanneurs e Quai Saint-Léger',prev:'03',
  loadout:{weapons:['pistol','smg'],ammo:{pistol:{mag:8,reserve:24},smg:{mag:32,reserve:96}},cur:'smg'},grenades:3,baseLight:.8,
  build:buildLevel04,enemies:ENEMY_DEFS_04,ally:null,start:{x:1.5,z:6.4,yaw:Math.PI},
  reinf:[],radio:{x:0,z:0,fx:0,fz:0},radioRun:'',alarmPos:V3(0,2,0),alarmText:'',alarmObjective:null,
  alarmYes:'',alarmNo:'A Rede Lampião deixou Paris pelo rio, com os arquivos em cinzas. ',deathText:'A Sûreté fechou a Rue des Tanneurs antes que a rede saísse de Paris.',
  objectives:objectives04,interact:interact04,pickups:pickups04,update:update04,restore:restore04,
  resultTitle:'Paris ficou para trás',outro:['LUCIEN','Solte a corda! Rio abaixo até Rouen — e de lá, Londres.'],menuCam:{cx:0,cz:15,y:5,tx:0,tz:6},ambient:'dawn',
  mist:{n:24,x0:-30,x1:30,z0:-62,z1:21,color:0x9a8a80},
  briefing:{meta:'PARIS — 19 DE MARÇO DE 1943 — 05h50',paras:['As fotos do Hôtel Delorme chegaram a Londres, mas a Sûreté seguiu o carro de Lucien até a Imprimerie Vasseur, a gráfica que imprime os jornais da Rede Lampião. Ao amanhecer, caminhões fecham a Rue des Tanneurs.','Segure a frente enquanto Mme. Vasseur queima os arquivos: nomes, endereços, chapas. Depois saia pelos fundos. No galpão do pátio há dois Panzerfaust tomados de um depósito. O Quai Saint-Léger desce até o rio, onde Lucien espera com uma barcaça. Se aparecer um blindado, balas não resolvem: a blindagem só cede de lado ou por trás.'],list:['Defender a gráfica até os arquivos virarem cinza','Pegar os Panzerfaust no galpão e atravessar a passagem','Destruir o blindado do cais e embarcar com Lucien']}};
LEVEL_ORDER.push('04');
window.__SDP4={spawnNade,fireRocket,throwGrenade,explode,tankRocketHit,updateTank};