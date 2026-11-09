'use strict';


/* =========================================================
   OPERAÇÃO 9 — Porto de Chania, Creta (12/05/1943, 09h)
   jornalista suíça, duas facções (alemães e italianos),
   permissão de circulação, mapa de rotas, embarque para Cnossos
   ========================================================= */
let M9=null;
function mats09(){
  tex05(); const HQ=MAT_HQ; const L=(o,ex)=>HQ?new T.MeshPhongMaterial(Object.assign({shininess:8,specular:0x111111},o,ex||{})):new T.MeshLambertMaterial(o);
  if(!TEX.water9) TEX.water9=canvasTex(128,128,(g,w,h)=>{ const R=mulberry32(909); g.fillStyle='#2a5a6a'; g.fillRect(0,0,w,h); for(let i=0;i<260;i++){ g.fillStyle=R()<.5?`rgba(160,210,220,${R()*.22})`:`rgba(10,40,60,${R()*.2})`; g.fillRect(R()*w,R()*h,4+R()*18,1+R()*2); } },10);
  if(!TEX.stone9) TEX.stone9=canvasTex(128,128,(g,w,h)=>{ const R=mulberry32(919); g.fillStyle='#c8b490'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=16){ for(let x=(y/16)%2?-12:0;x<w;x+=24){ const v=R()*22|0; g.fillStyle=`rgba(${176+v},${160+v},${134+v},.6)`; g.fillRect(x+1,y+1,22,14); } g.fillStyle='rgba(60,50,40,.35)'; g.fillRect(0,y,w,1); } },3);
  const col=c=>L({map:TEX.lime5,color:c});
  return {water:new T.MeshPhongMaterial({map:TEX.water9,color:0x6aa8b8,shininess:80,specular:0x88aabb,transparent:true,opacity:.92}),stone:L({map:TEX.stone9}),quay:L({map:TEX.stone9,color:0xb8a888}),
    ochre:col(0xe0b070),rose:col(0xe0a090),cream:col(0xece0c4),blue:col(0x9ab4c4),white:col(0xf0ece0),shutter:L({color:0x3a6a5a}),shutterB:L({color:0x4a5a8a}),tile:L({color:0xa85a3a}),
    hull:L({color:0x8a8a86}),hullW:L({color:0xd8d0c0}),hullB:L({color:0x3a5a8a}),dark:L({color:0x2a2a28}),awn:L({color:0xb84a3a}),awnS:L({color:0x2a5a8a}),wood:L({color:0x7a5a3a})};
}
const ENEMY_DEFS_09=[
  {id:'kd',x:-36.2,z:-21.4,yaw:Math.PI-.5,weapon:'rifle',helmet:true},
  {id:'kc',x:-34,z:-15.6,yaw:Math.PI,weapon:'pistol',fixed:true},
  {id:'ko',x:-36,z:-9.6,weapon:'pistol',officer:true,patrol:[[-36,-9.6],[-29,-9.6],[-29,-11],[-36,-11]]},
  {id:'mg',x:35,z:-34.6,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'hk',x:35,z:-46,weapon:'pistol',officer:true,patrol:[[35,-46],[35,-41],[37.6,-41],[35,-46]]},
  {id:'mb',x:42,z:-50,weapon:'smg',helmet:true,patrol:[[39.4,-56],[39.4,-38]]},
  {id:'dg',x:40,z:-21.6,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'di',x:46,z:-10,weapon:'smg',patrol:[[46,-10],[34,-10],[34,-15],[46,-15]]},
  {id:'pg',x:42,z:2.4,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'pm',x:33,z:6,weapon:'rifle',patrol:[[33,6],[54,6],[54,22],[33,22]]},
  {id:'fp1',x:-50,z:-27,weapon:'rifle',helmet:true,patrol:[[-50,-27],[20,-27],[24,-28.4],[-50,-27]]},
  {id:'fp2',x:-10,z:-2,weapon:'smg',patrol:[[-58,-2],[50,-2]]},
  {id:'it1',x:.4,z:-25.4,yaw:Math.PI,weapon:'pistol',officer:true,faction:'it',fixed:true},
  {id:'it2',x:-2.2,z:-26.8,yaw:2.4,weapon:'rifle',faction:'it'},
  {id:'it3',x:27.4,z:14,yaw:-Math.PI/2,weapon:'rifle',faction:'it',fixed:true},
  {id:'it4',x:12,z:-28.6,weapon:'rifle',faction:'it',patrol:[[12,-28.6],[26,-28.6]]},
];
const IT_LOOK={uniform:0x6e6c52,pants:0x5c5a44,helmetColor:0x5e5c46,capColor:0x6a684e};
function zone09(x,z){
  if(x>-42&&x<-26&&z>-20&&z<-13) return 1;
  if(x>-42&&x<-26&&z>=-13&&z<-6) return 2;
  if(x>28.5&&x<44&&z<-35) return 2;
  if(x>26&&x<54&&z>-20&&z<-4) return 2;
  if(x>30&&x<56&&z>4&&z<24) return 2;
  return 0;
}
function light09(x,z){ if(x>-42&&x<-26&&z>-20&&z<-6) return .55; if(x>26&&x<54&&z>-20&&z<-4) return .45; if(x>31&&x<39&&z>-52&&z<-44) return .55; return .9; }
function buildLevel09(){
  M5=mats05(); M6=mats06(); M9=mats09(); const M=M9;
  scene.background=new T.Color(0xc8dcec); scene.fog=new T.FogExp2(0xc8d8e4,.006);
  skyDome(909,[[0,'#4a86c4'],[.3,'#7aaad4'],[.45,'#c4d8e8'],[.5,'#e8eef0'],[.52,'#9ab8c8'],[1,'#4a6a7a']],null,10);
  scene.add(new T.HemisphereLight(0xd8e8f8,0x9a8a70,.7));
  const sun=new T.DirectionalLight(0xfff4e0,1.0); sun.target.position.set(0,0,-10); sun.position.set(-30,70,40); scene.add(sun); scene.add(sun.target); scene.add(new T.AmbientLight(0x6a6a7a,.3));
  // ---- mar e cais ----
  const water=new T.Mesh(new T.PlaneGeometry(220,90),M.water); water.rotation.x=-Math.PI/2; water.position.set(0,-.7,-77); scene.add(water);
  floorPlane(140,62,-2,-1,M.quay,'stone',0);
  addBlock(-70,70,-33.4,-32,.01,{mat:M.stone,surf:'stone',seg:4,solid:false}); addSolidOnly(-70,28.5,-33,-32.6,1.2); addSolidOnly(44,70,-33,-32.6,1.2);
  { const q=new T.Mesh(BOX(140,.8,.6),M.stone); q.position.set(0,-.4,-32.3); scene.add(q); }
  for(let x=-64;x<=26;x+=7){ addMesh(new T.CylinderGeometry(.2,.26,.55,8),M.dark,x,.27,-31.8,'metal'); addSolidOnly(x-.25,x+.25,-32.05,-31.55,.55,0,true); }
  // molhe com a capitania
  floorPlane(15.5,30,36.25,-47,M.quay,'stone',.01);
  { const q=new T.Mesh(BOX(15.5,.8,30),M.stone); q.position.set(36.25,-.42,-47); scene.add(q); }
  addSolidOnly(28.2,28.5,-62,-33,1.2); addSolidOnly(44,44.3,-62,-33,1.2); addSolidOnly(28.2,44.3,-62.3,-62,1.2);
  const wl=(axis,c0,c1,a0,a1,h,ops,mat)=>wallOpen(axis,c0,c1,a0,a1,h,ops,mat,{inner:{}});
  wl('x',-52,-51.8,31,39,3.4,[],M.white); wl('x',-44.2,-44,31,39,3.4,[{c:35,w:1.2},{c:32.6,w:1,sill:1,top:2.2},{c:37.4,w:1,sill:1,top:2.2}],M.white); wl('z',31,31.2,-51.8,-44.2,3.4,[{c:-48,w:1,sill:1,top:2.2}],M.white); wl('z',38.8,39,-51.8,-44.2,3.4,[],M.white);
  addBlock(30.8,39.2,-52.2,-43.8,.25,{y0:3.4,mat:M.tile,bottom:MAT.ceil,surf:'stone',seg:2});
  makeDoor('hk',{x:35,z:-44.1,w:1.2,d:.1,h:2.3,mat:M.shutter,offset:V3(-1.15,0,0),npc:true,nav:true});
  addBlock(35.6,38.4,-51.6,-50.8,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); addBlock(31.4,32.2,-50,-46,1.8,{mat:MAT.cabinet,surf:'metal',seg:1});
  const mapBoard=poster(35,1.8,-51.76,0,3.2,1.8,(g,w,h)=>{ g.fillStyle='#d8ccae'; g.fillRect(0,0,w,h); g.strokeStyle='#5a7a9a'; g.lineWidth=2; g.beginPath(); g.moveTo(10,90); for(let x=10;x<w-10;x+=20) g.lineTo(x,80+Math.sin(x*.05)*20); g.stroke(); g.fillStyle='#c8a870'; g.beginPath(); g.moveTo(30,95); g.quadraticCurveTo(w*.5,40,w-30,95); g.quadraticCurveTo(w*.5,140,30,95); g.fill(); g.fillStyle='#8a1a10'; for(const [x,y] of [[60,92],[110,70],[170,66],[230,74],[280,90]]){ g.beginPath(); g.arc(x,y,5,0,7); g.fill(); } g.strokeStyle='#8a1a10'; g.setLineDash([6,4]); g.beginPath(); g.moveTo(60,92); g.lineTo(170,66); g.lineTo(230,74); g.stroke(); g.setLineDash([]); g.fillStyle='#222'; g.font='bold 14px serif'; g.fillText('KRETA — Küstenbatterien u. Nachschubwege',12,20); g.font='11px serif'; g.fillText('Chania',48,110); g.fillText('Heraklion / Knossos',200,118); });
  bulb('H1',35,3.15,-48,6); W.lamps[W.lamps.length-1].base=.6; W.lamps[W.lamps.length-1].light.intensity=.6;
  // lancha torpedeira atracada
  { const g=new T.Group(); g.position.set(46.4,-.3,-48); scene.add(g); const hull=new T.Mesh(BOX(4,1.8,26),M.hull); hull.position.y=.4; g.add(hull); const bow=new T.Mesh(new T.ConeGeometry(2,5,4),M.hull); bow.rotation.x=-Math.PI/2; bow.rotation.y=Math.PI/4; bow.scale.set(1,1,.45); bow.position.set(0,.4,-15.5); g.add(bow);
    const br=new T.Mesh(BOX(2.4,1.6,4),M.hull); br.position.set(0,2,-2); g.add(br); for(const s of [-1,1]){ const t=new T.Mesh(new T.CylinderGeometry(.28,.28,6,10),M.dark); t.rotation.x=Math.PI/2; t.position.set(s*1.3,1.5,-8); g.add(t); } const gun=new T.Mesh(new T.CylinderGeometry(.06,.06,1.6,8),M.dark); gun.rotation.x=Math.PI/2; gun.position.set(0,2,4); g.add(gun);
    const flag=new T.Mesh(BOX(.02,.5,.8),hm(0xb02a20)); flag.position.set(0,3.2,10); g.add(flag); }
  // barcos de pesca
  for(const [x,z,r,m] of [[-56,-37,.2,M.hullB],[-40,-38,-.3,M.hullW],[-20,-37.4,.1,M.hullB],[8,-38,.4,M.hullW]]){ const g=new T.Group(); g.position.set(x,-.45,z); g.rotation.y=r; const h=new T.Mesh(BOX(2.4,1,7),m); g.add(h); const c=new T.Mesh(BOX(1.4,1.1,1.8),M.white); c.position.set(0,.9,-.6); g.add(c); const ms=new T.Mesh(new T.CylinderGeometry(.05,.05,4,6),M.wood); ms.position.set(0,2.4,1.6); g.add(ms); scene.add(g); }
  // ---- casario ----
  const house=(x0,x1,z0,z1,h,mat,sh)=>{ addBlock(x0,x1,z0,z1,h,{mat,surf:'stone',top:M.tile,seg:3,cover:false}); const R=mulberry32(Math.round(x0*13+z0*7));
    for(let y=1.4;y<h-.8;y+=2.6) for(let x=x0+1.2;x<x1-.8;x+=2.4){ if(R()<.2) continue; const m=new T.Mesh(BOX(.9,1.3,.08),R()<.5?sh:M.dark); m.position.set(x,y+.4,z0-.03); scene.add(m); if(z1<0){} } };
  house(-68,-54,-22,-6,7.6,M.ochre,M.shutter); house(-52,-46,-22,-8,6.4,M.rose,M.shutterB); house(-22,-12.4,-22,-8,6.8,M.cream,M.shutter); house(4,14,-22,-8,7.2,M.blue,M.shutterB); house(16,24,-22,-8,6,M.ochre,M.shutter);
  house(-68,-50,2,20,6,M.cream,M.shutterB); house(-46,-34,4,20,7,M.rose,M.shutter); house(-30,-18,4,20,6.4,M.ochre,M.shutterB); house(-14,-4,4,20,6.8,M.white,M.shutter); house(0,12,4,20,6,M.blue,M.shutter); house(14,22.6,4,20,7.4,M.cream,M.shutterB);
  // beco do mercado negro (entre -12.4 e -4) e café
  addBlock(-4,4,-22,-8,6.2,{mat:M.white,surf:'stone',top:M.tile,seg:3});
  { const a=new T.Mesh(BOX(7,.06,4),M.awn); a.position.set(0,2.7,-24.1); a.rotation.x=.25; scene.add(a); for(const x of [-3.4,3.4]) addMesh(BOX(.07,2.6,.07),M.dark,x,1.3,-26,'metal'); }
  for(const [x,z] of [[-2.6,-25],[1.6,-25.8],[3,-24.2],[-1.2,-28]]){ addMesh(new T.CylinderGeometry(.45,.45,.05,12),M.white,x,.74,z,'wood'); addMesh(new T.CylinderGeometry(.05,.05,.72,6),M.dark,x,.37,z,'metal'); addSolidOnly(x-.4,x+.4,z-.4,z+.4,.76,0,true); }
  poster(0,3.3,-22.06,Math.PI,3.4,.6,(g,w,h)=>{ g.fillStyle='#2a5a8a'; g.fillRect(0,0,w,h); g.fillStyle='#f0e8d0'; g.font='bold 26px serif'; g.textAlign='center'; g.fillText('ΚΑΦΕΝΕΙΟΝ  Ο  ΛΙΜΗΝ',w/2,40); });
  // Kommandantur (palazzo veneziano)
  wl('x',-20,-19.8,-42,-26,4,[{c:-34,w:1.6},{c:-39,w:1.2,sill:1,top:2.4},{c:-29,w:1.2,sill:1,top:2.4}],M.cream); wl('x',-6.2,-6,-42,-26,4,[{c:-38,w:1.2}],M.cream);
  wl('z',-42,-41.8,-19.8,-6.2,4,[],M.cream); wl('z',-26.2,-26,-19.8,-6.2,4,[{c:-10,w:1.2,sill:1,top:2.4}],M.cream);
  addBlock(-42,-30,-13.1,-12.9,4,{mat:M.cream,surf:'stone',seg:2});
  addBlock(-42.2,-25.8,-20.2,-5.8,.3,{y0:4,mat:M.tile,bottom:MAT.ceil,surf:'stone',seg:3});
  makeDoor('kfront',{x:-34,z:-19.9,w:1.6,d:.1,h:2.5,mat:M.shutter,offset:V3(1.55,0,0),npc:true,nav:true});
  makeDoor('kback',{x:-38,z:-6.1,w:1.2,d:.1,h:2.3,mat:M.wood,offset:V3(1.15,0,0),npc:true,nav:true});
  addBlock(-37,-31,-16.8,-16,1,{mat:M.wood,surf:'wood',cover:true,seg:1}); poster(-34,2.6,-13.16,Math.PI,1.2,1.4,(g,w,h)=>{ g.fillStyle='#d8ccb0'; g.fillRect(0,0,w,h); g.fillStyle='#8a1a10'; g.fillRect(0,0,w,40); g.fillStyle='#f0e8d0'; g.font='bold 20px serif'; g.textAlign='center'; g.fillText('BEKANNTMACHUNG',w/2,28); g.fillStyle='#222'; g.font='12px serif'; ['Ausgangssperre 21.00 Uhr','Passierscheine nur','mit Zustimmung des','ital. Verbindungsoffiziers'].forEach((s,i)=>g.fillText(s,w/2,70+i*20)); });
  for(const x of [-40.6,-27.4]) addBlock(x-.3,x+.3,-19.6,-14,.45,{mat:M.wood,surf:'wood',seg:1});
  // escritório dos fundos: porta interna (abertura em x -29) e mesa do carimbo
  addBlock(-28.8,-26.2,-13.1,-12.9,4,{mat:M.cream,surf:'stone',seg:1}); addBlock(-30,-28.8,-13.1,-12.9,1.6,{y0:2.4,mat:M.cream,surf:'stone',seg:1});
  addBlock(-40.6,-37.6,-9,-8,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); const stamp9=addMesh(BOX(.12,.14,.12),hm(0x3a2a1a),-39.2,.85,-8.5,'wood'); addBlock(-41.6,-41,-12,-7.4,1.9,{mat:MAT.cabinet,surf:'metal',seg:1});
  bulb('K1',-34,3.7,-16.5,7); bulb('K2',-36,3.7,-9.5,6);
  // depósito (arsenal veneziano)
  wl('x',-20,-19.8,26,54,6,[{c:40,w:3}],M.stone); wl('x',-4.2,-4,26,54,6,[{c:30,w:1.2}],M.stone); wl('z',26,26.2,-19.8,-4.2,6,[],M.stone); wl('z',53.8,54,-19.8,-4.2,6,[],M.stone);
  for(let x=31;x<54;x+=6) addBlock(x-.4,x+.4,-19.8,-4.2,.6,{y0:5.4,mat:M.stone,surf:'stone',seg:2,solid:false});
  addBlock(25.8,54.2,-20.2,-3.8,.4,{y0:6,mat:M.tile,bottom:M.stone,surf:'stone',seg:4});
  makeDoor('dep',{x:30,z:-4.1,w:1.2,d:.1,h:2.3,mat:M.wood,offset:V3(1.15,0,0),npc:true,nav:true});
  for(const [x,z] of [[30,-17],[32,-17],[30,-15.6],[44,-17.4],[46,-17.4],[48.6,-17.4],[50,-8],[50,-6.6],[36,-8],[37.4,-8]]) crate(x,z,1.2,1.15);
  drums(28,30,-8.6,-6.2,1.8,M6.drum); addBlock(44,46.6,-7.6,-6.8,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); const clip=addMesh(BOX(.3,.02,.42),hm(0xe8e0c8),45.3,.8,-7.2,null);
  bulb('D1',40,5.6,-12,9); bulb('D2',45,5.6,-7,6);
  // pátio de viaturas
  addBlock(30,30.4,4,10.6,3,{mat:M.stone,surf:'stone',seg:2}); addBlock(30,30.4,12.4,24,3,{mat:M.stone,surf:'stone',seg:2}); addBlock(30,40.6,23.6,24,3,{mat:M.stone,surf:'stone',seg:2}); addBlock(43.4,56,23.6,24,3,{mat:M.stone,surf:'stone',seg:2}); addBlock(55.6,56,4,24,3,{mat:M.stone,surf:'stone',seg:2});
  addBlock(30,40.6,3.8,4.2,3,{mat:M.stone,surf:'stone',seg:2}); addBlock(43.4,56,3.8,4.2,3,{mat:M.stone,surf:'stone',seg:2});
  makeDoor('itgate',{x:30.2,z:11.5,w:.12,d:1.8,h:2.4,mat:M.wood,offset:V3(0,0,1.7),locked:true,npc:true,nav:true});
  truck04(37,9); truck04(37,19); truck04(49,15);
  for(const z of [14.6,15.4]) addMesh(BOX(.8,.75,.7),MAT.crate,46.4,1.75,z,'wood');
  addMesh(BOX(.08,1.6,.08),M.wood,44.6,.8,12.2,'wood'); poster(44.6,1.5,12.16,Math.PI,1.4,.45,(g,w,h)=>{ g.fillStyle='#e8dcc0'; g.fillRect(0,0,w,h); g.fillStyle='#1a1a1a'; g.font='bold 24px sans-serif'; g.textAlign='center'; g.fillText('LKW 3 — KNOSSOS',w/2,32); });
  crate(52,8,1.2,1.1); crate(52,9.3,1,1); sandbags(40.4,43.6,2.6,3.4);
  // feira e figurantes
  const stall=(x,z,c)=>{ addBlock(x-1,x+1,z-.5,z+.5,.85,{mat:M.wood,surf:'wood',cover:true,seg:1}); const a=new T.Mesh(BOX(2.2,.05,1.4),c); a.position.set(x,2.2,z); scene.add(a); for(const s of [-1,1]) addMesh(BOX(.06,2.2,.06),M.wood,x+s,1.1,z+.5,'wood'); };
  stall(-24,-27.6,M.awnS); stall(-30,-27.6,M.awn); stall(-8.2,-14.4,M.awn);
  const civs=[]; for(const [id,x,z,yaw,lk] of [['c_sell',-8.2,-13.4,Math.PI,{uniform:0x3a3a40,pants:0x2a2a2a,skin:0xb88a64,hair:0xdcdcdc,cap:'field',capColor:0x1a1a1a}],['c_f1',-24,-26.8,Math.PI,{uniform:0x5a4a3a,pants:0x2a2a2a,skin:0xc49a74,hair:0x1a1410,cap:null}],['c_f2',-30,-26.8,Math.PI,{uniform:0x2a2a2a,pants:0x2a2a2a,skin:0xc49a74,hair:0x3a2a1a,cap:null}],['c_fish',-46,-31,0.2,{uniform:0x2a3a5a,pants:0x3a3a3a,skin:0xa87a54,hair:0x1a1a1a,cap:'beret'}]]){
    const a=new Actor({id,x,z,yaw},Object.assign({weapon:null,boots:true},lk)); removeShootables(a.h.hitMeshes); civs.push(a); }
  // navegação
  const N=[];
  for(let x=-66;x<=54;x+=3.2) for(let z=-30.8;z<=-22.9;z+=2.6) N.push({x,z});
  for(let x=-66;x<=56;x+=3.2) N.push({x,z:-23.1});
  for(const x of [-53,-44,15,25]) for(let z=-23;z<=-4;z+=2.4) N.push({x,z});
  for(let x=-66;x<=54;x+=3.2) for(let z=-5;z<=1.7;z+=2.2) N.push({x,z});
  for(let x=29.6;x<=43;x+=2.4) for(let z=-60;z<=-33.5;z+=2.6) N.push({x,z});
  for(let x=-40.6;x<=-27.4;x+=2.2) for(let z=-18.6;z<=-7.4;z+=1.9) N.push({x,z});
  for(let x=27.6;x<=52.6;x+=2.4) for(let z=-18.6;z<=-5.4;z+=2.2) N.push({x,z});
  for(let x=31.6;x<=54.4;x+=2.4) for(let z=5.6;z<=22.4;z+=2.2) N.push({x,z});
  for(let x=-11.6;x<=-4.8;x+=1.7) for(let z=-21;z<=-9;z+=2) N.push({x,z});
  for(let x=23.8;x<=28.6;x+=2.4) for(let z=3;z<=23;z+=2.5) N.push({x,z});
  N.push({x:-34,z:-21},{x:-34,z:-18.6},{x:-29.4,z:-13},{x:-29.4,z:-11.6},{x:-29.4,z:-14.4},{x:-38,z:-5},{x:-38,z:-7.4},{x:40,z:-21},{x:40,z:-18.6},{x:30,z:-3},{x:30,z:-5.4},{x:42,z:3},{x:42,z:5.4},{x:31.6,z:11.6},{x:35,z:-43},{x:35,z:-45.4},{x:35,z:-48},{x:33,z:-49},{x:37,z:-49});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=4.4; buildNav();
  G.cred=1; G.disguise={blown:false};
  return {sun,water,mapBoard,stamp9,clip,civs};
}
function objectives09(){ return [
  {id:'pass',text:'Consiga um Passierschein (permissão de circulação) na Kommandantur',state:'active',marker:{x:-34,z:-17}},
  {id:'map',text:'Fotografe o mapa de rotas na capitania, no fim do molhe',state:'active',marker:{x:35,z:-50}},
  {id:'sched',text:'Encontre a programação dos caminhões no depósito do arsenal',state:'active',marker:{x:45.3,z:-7.2}},
  {id:'board',text:'Esconda-se no caminhão 3, que vai para Cnossos',state:'hidden',marker:{x:45.4,z:15}},
  {id:'eboat',text:'Opcional: fotografe a lancha torpedeira atracada no molhe',state:'active',optional:true},
  {id:'cover9',text:'Opcional: termine sem perder o disfarce',state:'active',optional:true,autoDone:true},
]; }
function interact09(R){
  const I=W.interactables, F=()=>G.flags;
  for(const [id,x,z] of [['kfront',-34,-19.9],['kback',-38,-6.1],['dep',30,-4.1],['hk',35,-44.1]]) I.push(doorInteract(id,V3(x,1.2,z)));
  I.push({id:'seller',pt:()=>V3(-8.2,1.3,-14.2),r:2.4,label:()=>F().cigs||F().cigUsed?null:'Comprar um maço de Papastratos no mercado negro',
    use:()=>{ F().cigs=true; AudioSys.play('pickup'); pickupMsg('Cigarros Papastratos (um maço)'); G.radioMsg('VENDEDOR','“Último maço, kyría. Os italianos pagam o dobro — mas a senhora é jornalista, né?”'); }});
  I.push({id:'tenente',pt:()=>V3(.4,1.4,-25.4),r:2.6,label:()=>{ if(F().visto||!disguiseOn()) return null; return F().cigs?'Oferecer os cigarros ao tenente Bellandi e pedir o visto':'Pedir o visto ao tenente Bellandi (oficial de ligação italiano)'; },
    use:()=>{ if(!F().cigs){ G.radioMsg('TEN. BELLANDI','“Un visto, signorina? Com este calor, minha caneta só funciona com um bom maço de Papastratos…”'); if(!F().tipCig){ F().tipCig=true; setTimeout(()=>{ if(G&&G.levelId==='09'&&!G.ending) G.radioMsg('ÉLISE','Tem um velho vendendo coisas no beco atrás do café.','tip'); },3000); } return; }
      F().cigs=false; F().cigUsed='ten'; F().visto=true; AudioSys.play('stamp'); pickupMsg('Visto do oficial de ligação italiano'); G.radioMsg('TEN. BELLANDI','“Grazie! Pronto — Bellandi, Ufficiale di collegamento. Os alemães vão odiar, mas não podem recusar.”'); const o=obj('pass'); o.text='Leve o visto ao escrivão da Kommandantur e peça o Passierschein'; refreshObjectiveUI(); cp09(); }});
  I.push({id:'clerk',pt:()=>V3(-34,1.4,-16.4),r:2.6,hold:()=>F().visto?1.6:0,label:()=>{ if(G.cred>=2||!disguiseOn()) return null; return F().visto?'Pedir o Passierschein ao escrivão (segure)':'Pedir um Passierschein ao escrivão'; },
    use:()=>{ if(!F().visto){ G.radioMsg('ESCRIVÃO','“Jornalista suíça? Sem o visto do oficial de ligação italiano, nada de Passierschein. Regra nova. O tenente está no café do cais.”'); const o=obj('pass'); o.text='Consiga o visto do tenente italiano (café do cais) — ou carimbe um passe nos fundos da Kommandantur'; refreshObjectiveUI(); return; }
      G.cred=2; F().pass=true; AudioSys.play('stamp'); pickupMsg('Passierschein Kreta — acesso ao porto militar'); complete('pass'); G.radioMsg('ESCRIVÃO','“Passierschein Nr. 2231. Porto, molhe e depósito. Não perca, Fräulein.”'); cp09(); }});
  I.push({id:'stamp9',pt:()=>V3(-39.2,.95,-8.5),r:2,hold:()=>2.4,sus:2.2,susWhy:'credencial',label:()=>G.cred>=2?null:'Carimbar um Passierschein em branco (segure — se alguém vir, acabou)',
    use:()=>{ G.cred=2; F().pass=true; F().forged=true; AudioSys.play('stamp'); pickupMsg('Passierschein carimbado por você mesma'); complete('pass'); cp09(); }});
  I.push({id:'itsentry',pt:()=>V3(27.4,1.4,14),r:2.6,label:()=>{ const e=G.enemies.find(x=>x.id==='it3'); if(!e||e.dead||F().bribed||!disguiseOn()) return null; return F().cigs?'Oferecer os cigarros ao sentinela italiano':'Sentinela italiano no portão lateral'; },
    use:()=>{ const e=G.enemies.find(x=>x.id==='it3'); if(!F().cigs){ G.radioMsg('SENTINELA ITALIANO','“Chiuso, signorina. Só com ordem — ou com alguma coisa para fumar…”'); return; }
      F().cigs=false; F().cigUsed='it'; F().bribed=true; e.bribed=true; const d=W.doors.itgate; d.state='CLOSED'; openDoor(d,null); AudioSys.play('unlock'); G.radioMsg('SENTINELA ITALIANO','“Papastratos! Eu não vi nada, eh. Os alemães lá dentro também não precisam ver.”'); cp09(); }});
  I.push({id:'sched',pt:()=>V3(45.3,.9,-7.2),r:2.2,hold:()=>1.4,sus:1.2,susWhy:'credencial',label:()=>F().sched?null:'Ler a programação dos caminhões (segure)',
    use:()=>{ F().sched=true; R.clip.visible=false; AudioSys.play('pickup'); complete('sched'); openDoc('sched09'); activate('board'); F().departT=0; G.radioMsg('ÉLISE','LKW 3 — Knossos, saída às 11h30. Caixotes “arqueológicos”. Preciso estar naquela carroceria.','warn'); cp09(); }});
  I.push({id:'board9',pt:()=>V3(45.6,1.5,15),r:2.6,hold:()=>2,label:()=>obj('board').state==='active'?'Esconder-se entre os caixotes do caminhão 3 (segure)':null,sus:2,susWhy:'suspeita',
    use:()=>missionComplete()});
}
function photos09(){
  W.photo.push({id:'map9',label:'Mapa de rotas e baterias costeiras',pos:V3(35,1.8,-51.7),normal:V3(0,0,1),max:5,obj:'map',size:1.2,msg:'Baterias costeiras de Chania a Heraklion e a estrada de abastecimento até Cnossos. Londres vai querer isto inteiro.'});
  W.photo.push({id:'eboat',label:'Lancha torpedeira (S-Boot)',pos:V3(46.4,1.8,-48),normal:V3(-1,0,0),max:24,obj:'eboat',size:3.5,msg:'S-Boot da 21ª flotilha, atracado em Chania. A Marinha Real paga bem por isto.'});
}
DOCS.sched09={title:'Fahrbefehl — Transportkolonne Chania',sub:'prancheta do depósito, 12.5.1943',body:`LKW 1  Souda — Munition        09.40
LKW 2  Rethymno — Verpflegung    10.15
LKW 3  KNOSSOS — Baumaterial /
       "archäologische Kisten"    11.30
       Begleitung: 2 Mann, Feldgend.
       Ziel: Villa Ariadne (Stab)

Abfahrt nur mit gest. Fahrbefehl.`,pencil:'Caixotes “arqueológicos” para a Villa Ariadne — o QG alemão em Cnossos.'};
DOCS.planta09={title:'Porto de Chania',sub:'Croqui da Rede — deixado no caíque',map:'09',body:'',pencil:'Alemães mandam na cidade; italianos fazem a ligação e fecham os olhos por cigarros.'};
function drawMap09(g,w,h){
  g.fillStyle='#e8dcc0'; g.fillRect(0,0,w,h); const S=w/140, X=x=>(x+70)*S, Z=z=>(z+64)*S;
  g.fillStyle='#9ab8c8'; g.fillRect(0,0,w,Z(-32.6)); g.fillRect(X(28.5),Z(-62),(44-28.5)*S,0); g.fillStyle='#d8ccb0'; g.fillRect(X(28.5),Z(-62),15.5*S,30*S);
  const rect=(x0,x1,z0,z1,fill,stroke)=>{ g.fillStyle=fill; g.fillRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); if(stroke){ g.strokeStyle=stroke; g.lineWidth=2; g.strokeRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); } };
  for(const [a,b,c,d] of [[-68,-54,-22,-6],[-52,-46,-22,-8],[-22,-12.4,-22,-8],[-4,4,-22,-8],[4,14,-22,-8],[16,24,-22,-8],[-68,-50,2,20],[-46,-34,4,20],[-30,-18,4,20],[-14,-4,4,20],[0,12,4,20],[14,22.6,4,20]]) rect(a,b,c,d,'#c8b490',null);
  rect(-42,-26,-20,-6,'#b8a07a','#4a3a22'); rect(26,54,-20,-4,'#b8a07a','#4a3a22'); rect(30,56,4,24,'#d0c4a4','#4a3a22'); rect(31,39,-52,-44,'#b8a07a','#4a3a22');
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'12px serif'; g.fillText(s,X(x),Z(z)); };
  t('KOMMANDANTUR',-34,-14,'bold 11px serif'); t('frente · fundos',-34,-9,'italic 10px serif'); t('ARSENAL (depósito)',40,-12,'bold 11px serif'); t('VIATURAS',43,12,'bold 11px serif'); t('LKW 3',48.5,19,'10px serif'); t('capitania',35,-56,'11px serif');
  t('café',-7,-27,'italic 11px serif'); t('mercado negro',-9,-14,'italic 10px serif'); t('portão (italiano)',23,9,'italic 10px serif'); t('S-Boot',47,-60,'italic 10px serif'); t('CAIS',-30,-29,'bold 12px serif'); t('rua',-30,-1,'italic 11px serif'); t('caíque',-56,-40,'italic 10px serif');
}
function update09(dt){
  const P=G.player, F=G.flags, R=G.refs;
  inspectTick(dt);
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('ÉLISE','Claire Vautrin, Gazette de Lausanne. Uma jornalista suíça pode fotografar o cais à vontade — o porto militar, não.','tip'); }
  if(!F.i2&&G.introT>9){ F.i2=true; G.radioMsg('DICA','Os italianos (farda verde-cinza) desconfiam menos e não chamam os alemães. Alemães pedem documentos. Arma guardada (H).','tip'); }
  if(TEX.water9) TEX.water9.offset.set((simTime*.004)%1,(simTime*.007)%1);
  for(const c of R.civs){ c.animate&&c.animate(dt); }
  if(obj('board').state==='active'){ const total=G.diff==='recruta'?360:G.diff==='veterano'?220:280; F.departT=(F.departT||0)+dt; const left=Math.max(0,total-F.departT);
    G.progress={label:'LKW 3 parte para Cnossos em '+Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0'),v:1-F.departT/total};
    if(left<=0&&!G.ending){ missionFail('O caminhão partiu','O LKW 3 saiu para Cnossos sem você. Os caixotes “arqueológicos” chegam à Villa Ariadne sem testemunha.'); } }
  else if(!G.ending) G.progress=null;
  if(G.disguise.blown&&obj('cover9').state==='active') failObjective('cover9');
}
function cp09(){ checkpoint(); }
function restore09(s){ const F=G.flags, R=G.refs; G.cred=F.pass?2:1; G.disguise={blown:!!F.blown}; if(F.sched) R.clip.visible=false; if(F.bribed){ const e=G.enemies.find(x=>x.id==='it3'); if(e) e.bribed=true; } }
LEVELS['09']={id:'09',num:9,op:'Operação 9',name:'A Matéria do Porto',place:'Chania, Creta ocupada',prev:'08',
  loadout:{weapons:['silenced','pistol'],ammo:{silenced:{mag:6,reserve:12},pistol:{mag:8,reserve:16}},cur:'silenced',camera:true},baseLight:.9,lightFn:light09,shadows:true,bloomTh:.9,zoneAt:zone09,camPublic:true,
  credNames:['','imprensa','imprensa + Passierschein'],
  papersHTML:red=>'<div class="pc-h">'+(red?'PASSIERSCHEIN KRETA · Nr. 2231':'PRESSEAUSWEIS · CH')+'</div><div class="pc-n">VAUTRIN, Claire</div><div class="pc-r">Korrespondentin — Gazette de Lausanne</div><div class="pc-z">'+(red?'Zutritt: <b>Hafen · Mole · Arsenal · Fahrbereitschaft</b>':'Zutritt: <b>Stadt · Kai · Kommandantur (Vorraum)</b>')+'</div><div class="pc-s">'+(red?'gez. Ortskommandant · visto: Ten. Bellandi':'Schweizer Presse — neutral')+'</div>'+(red?'<div class="pc-red">HAFEN</div>':'')+'<div class="pc-stamp">'+(red?'ORTSKDTR.<br>CHANIA':'PRESSE<br>BERN')+'</div>',
  clearLine:()=>G.cred>=2?'“Passierschein do porto… em ordem. Pode seguir, Fräulein.”':'“Imprensa suíça. Fique longe do porto militar, Fräulein.”',
  build:()=>{ const r=buildLevel09(); photos09(); return r; },enemies:ENEMY_DEFS_09,ally:null,start:{x:-60,z:-28,yaw:-Math.PI/2},startDocs:['planta09'],drawMap:drawMap09,
  reinf:[{id:'n1',x:-36,z:-2,weapon:'smg',helmet:true},{id:'n2',x:-32,z:-2.4,weapon:'rifle',helmet:true},{id:'n3',x:40,z:-1,weapon:'rifle',helmet:true}],
  radio:{x:-36,z:-10.6,fx:-41.2,fz:-10},radioRun:'O oficial corre para o telefone da Kommandantur!',alarmPos:V3(-41,1.4,-10),alarmText:'Alarme no porto de Chania! A Feldgendarmerie fecha as ruas.',alarmObjective:null,
  alarmYes:'O porto deu o alarme. ',alarmNo:'',deathText:'A Feldgendarmerie de Chania cercou a jornalista suíça.',
  objectives:objectives09,interact:interact09,pickups:()=>{ addPickup('c_med1',-58,-24,'med',30,.1); addPickup('c_pis1',-39,-8.5,'pistol',8,.82); addPickup('c_med2',45.6,-7.4,'med',30,.82); addPickup('c_sil1',33,-50.2,'silenced',6,.1); G.player.holster=true; },
  update:update09,restore:restore09,
  onBlown:()=>{ G.radioMsg('ÉLISE','Descobriram a jornalista. Agora é correr até o caminhão 3 — ou nada.','warn'); },
  resultTitle:'A matéria do porto',outro:['ÉLISE','Escuro, cheiro de lona e serragem. Os caixotes “arqueológicos” chacoalham a cada curva. Daqui a três horas, Cnossos.'],menuCam:{cx:-30,cz:-44,y:6,tx:0,tz:-20},ambient:'harbor',mist:null,
  briefing:{meta:'CRETA — 12 DE MAIO DE 1943 — 09h00',paras:['Fim da África. Londres manda Élise para Creta como Claire Vautrin, correspondente suíça. A Rede quer duas coisas: o mapa das baterias costeiras e a pista dos caixotes “arqueológicos” que os alemães levam de Chania para a Villa Ariadne, em Cnossos.','No porto mandam os alemães, mas os italianos cuidam da ligação — e fecham os olhos por cigarros. Jornalista pode fotografar o cais; o porto militar exige Passierschein. Consiga o passe (com o visto italiano ou carimbando um você mesma), fotografe o mapa na capitania, leia a programação no arsenal e entre no caminhão para Cnossos.'],list:['Passierschein: visto do tenente italiano ou carimbo nos fundos','Mapa de rotas na capitania (molhe)','Programação no arsenal; esconder-se no caminhão 3']}};
LEVEL_ORDER.push('09');


/* =========================================================
   OPERAÇÃO 10 — Cnossos (12/05/1943, 23h)
   ruínas em plataforma, armazéns de jarros, holofote,
   provas do saque, sabotagem do goniômetro e carga-relógio
   ========================================================= */
const Y10=1.6;
const ENEMY_DEFS_10=[
  {id:'u1',x:4,z:44,weapon:'rifle',helmet:true,patrol:[[4,45.6],[14,36],[4,45.6]]},
  {id:'u2',x:9,z:47,weapon:'rifle',patrol:[[9,47.4],[17,40],[9,47.4]]},
  {id:'u3',x:-6,z:34,yaw:2.4,weapon:'rifle',helmet:true},
  {id:'u4',x:12,z:30.4,yaw:Math.PI,weapon:'pistol',officer:true},
  {id:'s1',x:-2,z:20.6,yaw:0,weapon:'rifle',helmet:true},
  {id:'c1',x:-10,z:-12,weapon:'rifle',helmet:true,lantern:true,patrol:[[-10,-12],[10,-12],[10,10],[-10,10]]},
  {id:'c2',x:-8,z:0,weapon:'smg',patrol:[[-8,0],[12,0]]},
  {id:'m1',x:-15,z:-22,weapon:'rifle',lantern:true,patrol:[[-15,-22],[-15,6]]},
  {id:'m2',x:-17.4,z:-9,yaw:Math.PI/2,weapon:'smg',helmet:true},
  {id:'m3',x:-26,z:.6,yaw:0,weapon:'rifle',sleep:true},
  {id:'kso',x:-9,z:-20.6,weapon:'pistol',officer:true,patrol:[[-9,-20.6],[-6,-20.6],[-6,-18],[-9,-18]]},
  {id:'ks2',x:-7,z:-14.4,yaw:0,weapon:'rifle',helmet:true},
  {id:'sl1',x:0,z:-35.4,yaw:0,weapon:'rifle',helmet:true,fixed:true},
  {id:'e1',x:16,z:-12,weapon:'rifle',helmet:true,patrol:[[16,-12],[27,-12],[27,10],[16,10]]},
  {id:'v1',x:43.4,z:-1,yaw:-Math.PI/2,weapon:'smg'},
  {id:'v2',x:52,z:6,yaw:0,weapon:'rifle',sleep:true},
  {id:'n1',x:-6,z:-32,weapon:'rifle',helmet:true,patrol:[[-6,-32],[6,-32]]},
];
function light10(x,z){
  let l=.24; const R=G.refs;
  if(x>-13&&x<-4&&z>-24&&z<-16) l=.5;
  if(x>-36&&x<-16.6&&z>-24&&z<8) l=.14;
  if(R&&R.braziers) for(const b of R.braziers){ const d=Math.hypot(x-b[0],z-b[1]); if(d<6) l=Math.max(l,.75*(1-d/6)+.2); }
  return l;
}
function buildLevel10(){
  M5=mats05(); M6=mats06(); if(!M9) M9=mats09(); const M=M6, Q=M9;
  scene.background=new T.Color(0x0e1420); scene.fog=new T.FogExp2(0x0e1420,.02);
  skyDome(1010,[[0,'#03060e'],[.3,'#0a1224'],[.45,'#18203a'],[.5,'#262a3a'],[.53,'#14141a'],[1,'#0a0a0a']],[620,120,14],6);
  scene.add(new T.HemisphereLight(0x4a5a80,0x1a1814,.38));
  const sun=new T.DirectionalLight(0x8a9ad0,.3); sun.position.set(-30,60,-20); sun.target.position.set(0,0,0); scene.add(sun); scene.add(sun.target); scene.add(new T.AmbientLight(0x20263a,.22));
  floorPlane(190,170,10,4,M.sand,'stone',0); floorPlane(50,30,4,38,M.road,'stone',.01);
  const rock=(x0,x1,z0,z1,h)=>addBlock(x0,x1,z0,z1,h,{mat:M.rock,surf:'stone',top:M.rock,seg:4});
  rock(-80,96,-82,-74,6); rock(-80,96,74,82,6); rock(-80,-72,-74,74,6); rock(88,96,-74,74,6);
  rock(66,88,-74,-50,5); rock(66,72,-50,-30,4); rock(48,66,-74,-56,4);
  for(let i=0;i<40;i++){ const R=mulberry32(1000+i); const x=-60+R()*140, z=-60+R()*120; if(x>-40&&x<62&&z>-40&&z<52) continue; const t=new T.Mesh(new T.ConeGeometry(.9+R()*.6,3+R()*2.4,7),hm(0x1e2a1e)); t.position.set(x,1.6,z); scene.add(t); }
  for(const [x,z] of [[-30,30],[-34,40],[24,46],[30,40],[-44,-10],[-46,12],[60,30],[70,10]]) palm(x,z,5.4);
  // ---- plataforma do palácio ----
  addWalk(-36,30,-28,22,Y10,{mat:M.lime,top:M.tiles,seg:4});
  stairSteps('z',22,1,-5,1,Y10-.2,7,M.lime,M.lime); stairSteps('x',30,1,-6,-1,Y10-.2,7,M.lime,M.lime); stairSteps('z',-28,-1,7,12,Y10-.2,7,M.lime,M.lime);
  const pw=(x0,x1,z0,z1,h,mat,cover)=>addBlock(x0,x1,z0,z1,h,{y0:Y10,mat:mat||M.adobe,surf:'stone',top:M.lime,seg:2,cover:!!cover});
  const red=new T.MeshLambertMaterial({color:0x8a2a1a}), blk=new T.MeshLambertMaterial({color:0x1a1614});
  const column=(x,z,h)=>{ const c=new T.Mesh(new T.CylinderGeometry(.42,.3,h,12),red); c.position.set(x,Y10+h/2,z); c.userData.mat='stone'; scene.add(c); W.shootables.push(c); const cap=new T.Mesh(new T.CylinderGeometry(.55,.55,.3,12),blk); cap.position.set(x,Y10+h+.15,z); scene.add(cap); W.shootables.push(cap); cap.userData.mat='stone'; addSolidOnly(x-.42,x+.42,z-.42,z+.42,h+.3,Y10,true); };
  // armazéns do oeste (corredores com jarros)
  pw(-36,-35.4,-24,8,3.2); pw(-36,-13,-24.6,-24,3.2);
  const jar=new T.LatheGeometry([[0,0],[.3,.05],[.42,.5],[.46,.9],[.36,1.3],[.22,1.45],[.24,1.55],[0,1.55]].map(p=>new T.Vector2(p[0],p[1])),10);
  const jarMat=new T.MeshLambertMaterial({color:0x9a6a44}); const jars=[]; const mags=[];
  for(let k=0;k<10;k++){ const z0=-24+k*3.2; pw(-35.4,-16.6,z0,z0+1.2,3.2); const zc=z0+2.2; mags.push(zc);
    if(k<9) for(let x=-34.4;x<-17.6;x+=1.15){ if(k===3||k===4){ if(x>-30) continue; } for(const s of [-1,1]){ if(((x*7+k*3+s)|0)%5===0) continue; jars.push([x,zc+s*.72]); } } }
  pw(-35.4,-16.6,8,8.6,3.2);
  const jm=instanced(jar,jarMat,jars.map(([x,z])=>[x,Y10,z,.72,.8,.72,x*3])); if(jm){ jm.userData.mat='stone'; W.shootables.push(jm); }
  for(const [x,z] of jars) addSolidOnly(x-.3,x+.3,z-.3,z+.3,1.25,Y10,true);
  pw(-13.6,-13,-24,-7.2,3.2); pw(-13.6,-13,-4.8,2.8,3.2); pw(-13.6,-13,5.2,8.6,3.2);
  // munição nos armazéns 3 e 4
  const AM1=new T.MeshLambertMaterial({color:0x4a5038}), AM2=new T.MeshLambertMaterial({color:0x3e4430}); const ammo=[]; for(const k of [3,4]){ const zc=mags[k]; for(let x=-29;x<-18;x+=1.25){ ammo.push([x,zc-.62]); ammo.push([x,zc+.62]); } }
  for(const [x,z] of ammo){ addMesh(BOX(1,.5,.36),AM1,x,Y10+.25,z,'wood'); addMesh(BOX(.9,.4,.34),AM2,x,Y10+.7,z,'wood'); addSolidOnly(x-.5,x+.5,z-.18,z+.18,.9,Y10,true); }
  poster(-28,Y10+1.8,mags[4]-1.0,0,1,.4,(g,w,h)=>{ g.fillStyle='#d8ccb0'; g.fillRect(0,0,w,h); g.fillStyle='#8a1a10'; g.font='bold 22px sans-serif'; g.textAlign='center'; g.fillText('MUNITION 8,8',w/2,30); });
  // sala do trono / escritório do Kunstschutz
  pw(-13,-4,-24.6,-24,3.2); pw(-13,-12.4,-24,-16,3.2); pw(-4.6,-4,-24,-16,3.2); pw(-13,-9.6,-16.6,-16,3.2); pw(-7.4,-4,-16.6,-16,3.2); 
  addBlock(-9.6,-7.4,-16.6,-16,.8,{y0:Y10+2.4,mat:M.adobe,surf:'stone',seg:1});
  addBlock(-13.2,-3.8,-24.8,-15.8,.25,{y0:Y10+3.2,mat:MAT.roof,bottom:MAT.ceil,surf:'stone',seg:2});
  addBlock(-12.4,-11.6,-21.6,-19.2,.5,{y0:Y10,mat:M.lime,surf:'stone',seg:1}); addBlock(-12.4,-12,-21,-19.8,1.3,{y0:Y10+.5,mat:M.lime,surf:'stone',seg:1});
  addBlock(-8,-5.6,-23.4,-22.4,.78,{y0:Y10,mat:M.wood,surf:'wood',cover:true,seg:1}); const ledger=addMesh(BOX(.34,.06,.26),hm(0x5a2a1a),-6.8,Y10+.82,-22.9,'cloth');
  crate(-11,-17.6,1.1,1.05,Y10); const bull=addMesh(BOX(.28,.22,.34),hm(0x3a3634),-10.8,Y10+1.2,-22.6,'stone'); addBlock(-11.4,-10.2,-23.2,-22,1,{y0:Y10,mat:M.wood,surf:'wood',seg:1});
  for(const [x,y] of [[-7.4,2.2],[-5.6,1.4]]) addMesh(BOX(.9,.7,.02),hm(0x8a2a1a),x,Y10+y,-23.96,null);
  poster(-9,Y10+1.9,-23.95,0,1.6,1,(g,w,h)=>{ g.fillStyle='#e0d4b8'; g.fillRect(0,0,w,h); g.fillStyle='#1a1a1a'; g.font='bold 16px serif'; g.textAlign='center'; g.fillText('KUNSTSCHUTZ',w/2,26); g.font='12px serif'; ['Kreta — Abt. Knossos','Abtransport nach Berlin','über Chania / Piräus'].forEach((s,i)=>g.fillText(s,w/2,52+i*18)); });
  bulb('O1',-8.5,Y10+2.9,-20,6); W.lamps[W.lamps.length-1].base=.7; W.lamps[W.lamps.length-1].light.intensity=.7;
  // pátio central: colunas e ruínas baixas
  for(const [x,z,h] of [[-10,-14,2.6],[-6,-14,2.6],[4,-14,2.6],[8,-14,2.6],[12,-6,2.2],[12,2,2.4],[-10,6,1.4],[2,12,2.6]]) column(x,z,h);
  for(const [a,b,c,d,h] of [[14,24,-24,-23.4,2.4],[14,14.6,-23.4,-14,1.8],[18,26,-6,-5.4,1.2],[16,16.6,0,10,1.4],[20,28,14,14.6,1.6],[24,24.6,-20,-10,2],[-12,-2,16,16.6,1.2],[4,12,16,16.6,1.4],[2,8,-26,-25.4,1.6]]) pw(a,b,c,d,h,null,h<1.7);
  // escadaria leste e área baixa com o furgão goniômetro
  const van=new T.Group(); van.position.set(46,0,-4); scene.add(van); { const b=new T.Mesh(BOX(2.3,2.4,5.6),hm(0x4a5040)); b.position.y=1.5; van.add(b); const c=new T.Mesh(BOX(2.2,1.6,1.6),hm(0x4a5040)); c.position.set(0,1.1,3.4); van.add(c);
    const loop=new T.Mesh(new T.TorusGeometry(.6,.05,6,16),hm(0x222222)); loop.position.set(0,3.4,-.6); van.add(loop); const pole=new T.Mesh(new T.CylinderGeometry(.04,.04,.7,6),hm(0x222222)); pole.position.set(0,2.95,-.6); van.add(pole);
    for(const [a,b] of [[-1.1,-1.8],[1.1,-1.8],[-1.1,2.6],[1.1,2.6]]){ const w=new T.Mesh(new T.CylinderGeometry(.42,.42,.26,10),MAT.tire); w.rotation.z=Math.PI/2; w.position.set(a,.42,b); van.add(w); } van.loop=loop; }
  addSolidOnly(44.8,47.2,-6.8,1.2,2.8,0,true); addMesh(BOX(.5,.5,.05),hm(0x9a9a8a),44.83,1.3,-5.6,null);
  addBlock(49,50.6,-9,-7.6,1.1,{mat:MAT.stove,surf:'metal',cover:true,seg:1}); tent(48,56,3,9,2.8,new T.MeshLambertMaterial({color:0x5a5a48,side:T.DoubleSide}));
  // pátio sul (chegada): caminhão, tenda do Kunstschutz, braseiros
  truck04(4,40); for(const [x,z] of [[0,41.4],[0,39],[-.4,43]]) crate(x,z,1,1);
  tent(10,18,33,41,3,new T.MeshLambertMaterial({color:0x6a6450,side:T.DoubleSide})); for(const [x,z] of [[12,35],[13.4,35],[12,36.4],[16,35],[16,36.4]]) crate(x,z,1.15,1.1);
  poster(14,1.4,33.95,Math.PI,1.6,.6,(g,w,h)=>{ g.fillStyle='#c8b48a'; g.fillRect(0,0,w,h); g.fillStyle='#1a1a1a'; g.font='bold 18px sans-serif'; g.textAlign='center'; g.fillText('KUNSTSCHUTZ — BERLIN',w/2,26); g.font='12px sans-serif'; g.fillText('Vorsicht! Antiken — Knossos',w/2,46); });
  const braziers=[]; for(const [x,z] of [[-4,32],[18,30],[40,-10]]){ addMesh(new T.CylinderGeometry(.35,.25,.8,8),MAT.darkMetal,x,.4,z,'metal'); addSolidOnly(x-.35,x+.35,z-.35,z+.35,.8,0,true); const l=new T.PointLight(0xff8a3a,1.2,9,1.8); l.position.set(x,1.3,z); scene.add(l); braziers.push([x,z,l]); }
  // torre do holofote ao norte
  { const s=addWalk(-1.4,1.4,-36.8,-34,4.6,{mat:M.wood,top:M.wood,seg:1}); s.mesh.visible=false; for(const [a,b] of [[-1.3,-36.7],[1.3,-36.7],[-1.3,-34.1],[1.3,-34.1]]) addMesh(BOX(.18,4.6,.18),M.wood,a,2.3,b,'wood'); addMesh(BOX(2.9,.16,2.9),M.wood,0,4.55,-35.4,'wood'); }
  const spot=new T.SpotLight(0xdde6ff,3,58,.17,.45,1.1); spot.position.set(0,5.6,-34.6); scene.add(spot); scene.add(spot.target);
  addMesh(BOX(.7,.5,.8),MAT.darkMetal,0,5.6,-34.9,'metal'); const lens=addMesh(new T.CylinderGeometry(.24,.24,.05,14),MAT.bulb,0,5.6,-34.48,'glass'); lens.rotation.x=Math.PI/2;
  let beam=null; if(MAT_HQ){ const len=46, rad=Math.tan(.17)*len; const bg=new T.ConeGeometry(rad,len,20,1,true); bg.translate(0,-len/2,0); bg.rotateX(-Math.PI/2); beam=new T.Mesh(bg,MAT.beamCold); beam.position.copy(spot.position); scene.add(beam); }
  const SL={id:'SL10',x:0,z:-34.6,r:0,light:spot,lantern:lens,broken:false,base:3,ph:0,cone:beam}; lens.userData.breakable=true; lens.userData.lamp=SL; W.lamps.push(SL);
  G.sl={light:spot,beam,lamp:SL,t:0,lit:false,litT:0,cd:0,msg:'Da torre: “Movimento nas ruínas!”',path:t=>V3(Math.sin(t*.27)*18,Y10,-6+Math.cos(t*.19)*15)};
  // guia na ravina
  const guide=new Actor({id:'manolis',x:62,z:-46,yaw:Math.PI*.8},{uniform:0x1a1a1a,pants:0x2a2a2a,skin:0xb08060,hair:0x1a1410,cap:'beret',capColor:0x111111,weapon:'rifle',boots:true}); removeShootables(guide.h.hitMeshes);
  // navegação
  const N=[];
  for(let x=-34;x<=28;x+=2.6) for(let z=-26;z<=20;z+=2.6) N.push({x,z});
  for(const zc of mags) for(let x=-34;x<=-17.4;x+=1.6) N.push({x,z:zc});
  for(let x=-12;x<=-5;x+=1.4) for(let z=-23;z<=-17;z+=1.5) N.push({x,z});
  for(let k=0;k<7;k++){ N.push({x:-2,z:22.2+k*.36+.18}); N.push({x:30.2+k*.36+.18,z:-3.5}); N.push({x:9.5,z:-28.2-k*.36-.18}); }
  for(let x=-60;x<=84;x+=4.2) for(let z=-66;z<=66;z+=4.2){ if(x>-37&&x<31&&z>-29&&z<23) continue; N.push({x,z}); }
  for(const zc of mags){ N.push({x:-15.2,z:zc},{x:-16.2,z:zc}); }
  for(const [x,z] of [[43.2,-8],[43.2,-4],[43.2,0],[48.6,-4],[46,-8.6],[46,2.6]]) N.push({x,z});
  N.push({x:-8.5,z:-15},{x:-8.5,z:-17.2},{x:-2,z:25.4},{x:33.6,z:-3.5},{x:9.5,z:-31.2});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=4.4; buildNav();
  return {sun,ledger,bull,braziers,mags,van,guide,spot};
}
function objectives10(){ return [
  {id:'evid',text:'Reúna provas do saque (0/3)',state:'active',marker:{x:-8.5,z:-20}},
  {id:'van',text:'Sabote o furgão goniômetro na área leste, ao pé da escadaria',state:'active',marker:{x:46,z:-4}},
  {id:'charge',text:'Arme a carga-relógio no armazém de munição (oeste)',state:'active',marker:{x:-22,z:-9}},
  {id:'escape',text:'Fuja até Manolis na ravina do Kairatos, a nordeste',state:'hidden',marker:{x:62,z:-46}},
  {id:'allEvid',text:'Opcional: reúna as quatro provas',state:'active',optional:true},
  {id:'quietVan',text:'Opcional: sabote o furgão sem soar o alarme',state:'active',optional:true},
]; }
function evid10(id,txt){
  const F=G.flags; if(F['ev_'+id]) return; F['ev_'+id]=true; F.evN=(F.evN||0)+1; const o=obj('evid'); o.text='Reúna provas do saque ('+Math.min(3,F.evN)+'/3)';
  pickupMsg('Prova '+F.evN+'/4 — '+txt);
  if(F.evN>=3&&o.state==='active'){ complete('evid'); G.radioMsg('ÉLISE','Provas suficientes: Berlin está esvaziando Cnossos pelo porto de Chania.'); }
  if(F.evN>=4) complete('allEvid'); refreshObjectiveUI(); cp10();
}
function interact10(R){
  const I=W.interactables, F=()=>G.flags;
  I.push({id:'ledger',pt:()=>V3(-6.8,Y10+.9,-22.9),r:2.2,hold:()=>1,label:()=>F().ev_ledger?null:'Ler o livro-razão do Kunstschutz (segure)',use:()=>{ R.ledger.visible=false; openDoc('ledger10'); evid10('ledger','livro-razão do Kunstschutz'); }});
  I.push({id:'bull',pt:()=>V3(-10.8,Y10+1.2,-22.6),r:2.2,label:()=>F().ev_bull?null:'Pegar a cabeça de touro em pedra (peça roubada)',use:()=>{ R.bull.visible=false; AudioSys.play('pickup'); evid10('bull','cabeça de touro em pedra, minoica'); }});
  I.push({id:'van',pt:()=>V3(44.7,1.3,-5.6),r:2.3,hold:()=>G.diff==='veterano'?4.4:3.4,label:()=>F().vanDone?null:'Arrancar as válvulas do goniômetro (segure)',
    use:()=>{ F().vanDone=true; AudioSys.play('clank'); AudioSys.play('glass',V3(46,1.5,-4),.6); complete('van'); if(!G.alarm) complete('quietVan'); G.radioMsg('ÉLISE','Sem válvulas, esse furgão não acha rádio nenhum. Os andartes vão poder transmitir de novo.'); cp10(); }});
  I.push({id:'charge10',pt:()=>V3(-22,Y10+.9,R.mags[4]),r:2.4,hold:()=>G.diff==='veterano'?4:3,label:()=>F().armed?null:'Armar a carga-relógio nos caixotes de munição (segure)',
    use:()=>{ F().armed=true; F().boomLeft=G.diff==='recruta'?100:G.diff==='veterano'?60:80; complete('charge'); activate('escape'); AudioSys.play('unlock'); pickupMsg('Carga-relógio armada');
      G.radioMsg('ÉLISE','Lápis de tempo quebrado. Tenho pouco mais de um minuto para sair dessa colina.','warn'); cp10(); }});
  I.push({id:'manolis',pt:()=>V3(62,1.5,-46),r:3,skip:true,label:()=>obj('escape').state==='active'?(F().boomed?'Seguir Manolis pela ravina':'Manolis: “Espere a explosão, depois descemos.”'):null,locked:()=>!F().boomed,use:()=>{ if(F().boomed) missionComplete(); }});
}
function photos10(){
  W.photo.push({id:'crates10',label:'Caixotes “Kunstschutz — Berlin”',pos:V3(14,1.2,35.4),normal:V3(0,0,-1),max:9,obj:null,size:1.4,msg:'Antiguidades encaixotadas para Berlim, com o carimbo do Kunstschutz.',after:()=>evid10('crates','foto dos caixotes para Berlim')});
  W.photo.push({id:'ammo10',label:'Munição guardada nos armazéns minoicos',pos:V3(-21,Y10+.7,-9),normal:V3(1,0,0),max:10,obj:null,size:1.6,msg:'Munição de 8,8 empilhada entre os jarros de 3.500 anos.',after:()=>evid10('ammo','foto da munição nos armazéns')});
}
DOCS.ledger10={title:'Kunstschutz — Abt. Knossos',sub:'livro-razão, abril–maio de 1943',body:`Kiste 41  Stierkopf (Stein)        → Berlin
Kiste 42  Siegelsteine, 38 Stück   → Berlin
Kiste 43  Fresko-Fragmente         → Berlin
Kiste 44  "Baumaterial" (Munition) → W-Magazine

Transport: LKW Chania — Piräus — Berlin
gez. Sonderführer R.`,pencil:'Caixotes de antiguidades para Berlim; os “de material de construção” são munição escondida nos armazéns do palácio.'};
DOCS.planta10={title:'Cnossos',sub:'esboço do arqueólogo da Rede',map:'10',body:'',pencil:'Plataforma do palácio: armazéns a oeste, sala do trono ao norte do pátio, escadaria a leste.'};
function drawMap10(g,w,h){
  g.fillStyle='#1e2430'; g.fillRect(0,0,w,h); g.fillStyle='#e8dcc0'; g.fillRect(4,4,w-8,h-8); const S=(w-8)/130, X=x=>4+(x+50)*S, Z=z=>4+(z+50)*S;
  const rect=(x0,x1,z0,z1,fill,stroke)=>{ g.fillStyle=fill; g.fillRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); if(stroke){ g.strokeStyle=stroke; g.lineWidth=2; g.strokeRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); } };
  rect(-36,30,-28,22,'#d4c4a0','#6a5232'); for(let k=0;k<10;k++) rect(-35.4,-16.6,-24+k*3.2,-24+k*3.2+1.2,'#8a7a5a',null); rect(-13,-4,-24,-16,'#b8a07a','#4a3a22');
  rect(30,60,-20,20,'#cbb894',null); rect(-20,24,25,50,'#cbb894',null); rect(66,88,-74,-30,'#7a7060',null);
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'11px serif'; g.fillText(s,X(x),Z(z)); };
  t('ARMAZÉNS',-26,-26,'bold 11px serif'); t('munição (3–4)',-26,-12,'italic 10px serif'); t('sala do trono',-8.5,-25,'10px serif'); t('PÁTIO CENTRAL',0,-2,'bold 11px serif'); t('escadaria',34,-8,'italic 10px serif');
  t('goniômetro',46,4,'10px serif'); t('chegada · caminhão',4,48,'10px serif'); t('Kunstschutz',14,32,'italic 10px serif'); t('holofote',0,-39,'italic 10px serif'); t('ravina do Kairatos',70,-26,'bold 11px serif'); t('Manolis',62,-50,'italic 10px serif');
}
function update10(dt){
  const P=G.player, F=G.flags, R=G.refs;
  updateSearchlight(dt);
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('ÉLISE','Cnossos. Os caixotes vão para a tenda do Kunstschutz — e a munição sobe para o palácio. Saio da carroceria quando os carregadores virarem as costas.','tip'); }
  if(!F.i2&&G.introT>9){ F.i2=true; G.radioMsg('DICA','O holofote da torre norte varre o pátio e os armazéns. Na luz dele, alguém vem conferir. A lente se quebra com um tiro.','tip'); }
  for(const b of R.braziers){ b[2].intensity=1.05+Math.sin(simTime*9+b[0])*.12+Math.random()*.1; if(Math.random()<dt*6) FX.puff(V3(b[0],1,b[1]),1,0xff8a30,.4,.4,V3(0,1,0),.7); }
  if(R.van&&!F.vanDone) R.van.loop.rotation.y+=dt*.6;
  if(F.armed&&!F.boomed){ F.boomLeft-=dt; G.progress={label:'Carga-relógio: '+Math.max(0,Math.ceil(F.boomLeft))+' s',v:F.boomLeft/(G.diff==='recruta'?100:G.diff==='veterano'?60:80)};
    if(F.boomLeft<=0){ F.boomed=true; G.progress=null; boom10(); } }
  if(F.boomed&&F.chain){ F.chainT=(F.chainT||0)+dt; while(F.chain.length&&F.chain[0].t<=F.chainT){ const c=F.chain.shift(); explode(V3(c.x,Y10+.8,c.z),{r:6,dmgE:300,dmgP:120,src:'player',kind:'shell'}); FX.puff(V3(c.x,Y10+3,c.z),3,0xffa040,2.4,1,V3(0,3,0),.9); } }
  if(F.boomed&&!F.boomMsg&&F.chainT>3){ F.boomMsg=true; G.radioMsg('MANOLIS','Panagía mou! Vem, kyría — pela ravina, agora!'); }
}
function boom10(){
  const F=G.flags, R=G.refs; AudioSys.play('fireball',V3(-24,2,-8),2);
  F.chain=[]; let t=0; for(const k of [3,4]) for(let x=-29;x<-18;x+=2.5){ F.chain.push({t,x,z:R.mags[k]}); t+=.22; }
  for(let k=0;k<6;k++) FX.puff(V3(-24+rnd(-4,4),Y10+2+k*1.5,R.mags[4]-2+rnd(-2,2)),3,k<3?0xffd070:0xff6a20,3.6,1.2+k*.3,V3(0,4+k,0),.95);
  FX.puff(V3(-24,Y10+10,-8),10,0x221e1c,5,8,V3(0,3,0),.7); scorchMark(V3(-24,Y10+.02,-8),5);
  if(settings.shake) G.player.shake=Math.min(1.8,G.player.shake+1.4); if(!G.alarm) raiseAlarm(); cp10();
}
function cp10(){ checkpoint(); }
function restore10(s){ const F=G.flags, R=G.refs; if(F.ev_ledger) R.ledger.visible=false; if(F.ev_bull) R.bull.visible=false; if(F.armed&&!F.boomed) F.boomLeft=Math.max(F.boomLeft||0,25); if(F.boomed){ F.chain=null; scorchMark(V3(-24,Y10+.02,-8),5); } }
LEVELS['10']={id:'10',num:10,op:'Operação 10',name:'O Que Há em Cnossos',place:'Palácio de Cnossos, Creta',prev:'09',
  loadout:{weapons:['silenced','pistol'],ammo:{silenced:{mag:6,reserve:18},pistol:{mag:8,reserve:16}},cur:'silenced',camera:true},baseLight:.24,lightFn:light10,shadows:false,bloomTh:.75,grenades:true,
  build:()=>{ const r=buildLevel10(); photos10(); return r; },enemies:ENEMY_DEFS_10,ally:null,start:{x:1.4,z:44,yaw:-.3},startDocs:['planta10'],drawMap:drawMap10,
  reinf:[{id:'n1',x:40,z:20,weapon:'smg',helmet:true},{id:'n2',x:42,z:22,weapon:'rifle',helmet:true,nades:1},{id:'n3',x:-2,z:48,weapon:'rifle',helmet:true}],
  radio:{x:43.6,z:-7.6,fx:46,fz:-5.6},radioRun:'O oficial corre para o rádio do furgão!',alarmPos:V3(46,1.4,-4),alarmText:'Alarme em Cnossos! Lanternas em todo o palácio.',alarmObjective:'quietVan',
  alarmYes:'Cnossos acordou antes da hora. ',alarmLate:'O palácio só acordou com a explosão. ',alarmNo:'',alarmOk:()=>!!(G&&G.flags.boomed&&!G.flags.alarmEarly10),
  deathText:'A guarnição de Cnossos fechou as saídas do palácio.',
  objectives:objectives10,interact:interact10,pickups:()=>{ addPickup('k_med1',12.4,37.6,'med',30,.1); addPickup('k_sil1',-10,-18.4,'silenced',6,Y10+.05); addPickup('k_nade1',47.6,-8.3,'nade',2,1.15); addPickup('k_med2',22,0,'med',35,Y10+.05); addPickup('k_pis1',-33,mags10mid(),'pistol',8,Y10+.05); G.player.nades=G.player.nades||0; },
  update:(dt)=>{ if(G.alarm&&!G.flags.boomed) G.flags.alarmEarly10=true; update10(dt); },restore:restore10,
  resultTitle:'O que há em Cnossos',outro:['MANOLIS','Atrás de nós, a colina inteira acende. Amanhã os alemães vão dizer que foi um raio. Os velhos da aldeia vão saber que não foi.'],menuCam:{cx:-40,cz:40,y:8,tx:0,tz:0},ambient:'dawn',mist:{n:12,x0:-40,x1:60,z0:-40,z1:50,color:0x2a3248},
  briefing:{meta:'CRETA — 12 DE MAIO DE 1943 — 23h00',paras:['O caminhão de Chania para no pátio sul do palácio de Cnossos. A Rede suspeitava: o Kunstschutz — o “serviço de proteção da arte” alemão — encaixota antiguidades para Berlim, e os caixotes de “material de construção” escondem munição nos armazéns de jarros do palácio.','À noite, só lanternas, braseiros e o holofote da torre norte. Reúna provas do saque, arranque as válvulas do furgão goniômetro que caça os rádios dos andartes e arme a carga-relógio na munição. Depois, corra até Manolis na ravina do Kairatos.'],list:['Três provas: livro-razão, peça roubada, fotos dos caixotes e da munição','Sabotar o furgão goniômetro (leste)','Carga-relógio nos armazéns; fuga pela ravina']}};
function mags10mid(){ return -24+6*3.2+2.2; }
LEVEL_ORDER.push('10');


/* =========================================================
   OPERAÇÃO 11 — Labirinto (bateria costeira, 13/05/1943, 05h30)
   trincheiras em labirinto, três canhões com dano contextual,
   HUD de baterias, aliado Manolis, evacuação pela enseada
   ========================================================= */
const Y11=4;
const ENEMY_DEFS_11=[
  {id:'a1',x:-40,z:8.4,yaw:Math.PI,weapon:'rifle',helmet:true},{id:'a2',x:-37,z:6.6,yaw:-2.4,weapon:'rifle'},
  {id:'b1',x:0,z:6.4,yaw:Math.PI,weapon:'rifle',helmet:true},{id:'b2',x:3,z:4.4,yaw:2.6,weapon:'smg'},
  {id:'c1',x:40,z:8.4,yaw:Math.PI,weapon:'rifle',helmet:true},{id:'c2',x:43,z:6.6,yaw:-2.6,weapon:'rifle'},
  {id:'hq',x:-1.6,z:26,weapon:'pistol',officer:true,patrol:[[-1.6,26],[2.6,26],[2.6,22.6],[-1.6,22.6]]},
  {id:'ro',x:3.2,z:25.4,yaw:Math.PI/2,weapon:'pistol'},
  {id:'mgb',x:0,z:21.2,yaw:Math.PI,weapon:'smg',helmet:true,fixed:true,mg:true},
  {id:'t1',x:-20,z:30,weapon:'rifle',helmet:true,patrol:[[-28,30],[-12,30],[-12,40],[-28,40]]},
  {id:'t2',x:20,z:30,weapon:'smg',helmet:true,patrol:[[12,30],[28,30],[28,40],[12,40]]},
  {id:'t3',x:0,z:46,weapon:'rifle',lantern:true,patrol:[[-16,46],[16,46]]},
  {id:'g1',x:-3,z:58,yaw:0,weapon:'rifle',helmet:true},{id:'g2',x:3.4,z:56.6,yaw:.4,weapon:'rifle',helmet:true},
  {id:'cp',x:53.4,z:-4,yaw:0,weapon:'rifle',helmet:true},
];
function light11(x,z){ const k=G.flags.dawn11||0; let l=.34+k*.25; if(x>-6&&x<6&&z>20&&z<29) l=.42; return l; }
function buildLevel11(){
  M5=mats05(); M6=mats06(); if(!M9) M9=mats09(); const M=M6, Q=M9;
  scene.background=new T.Color(0x2a3448); scene.fog=new T.FogExp2(0x3a4458,.011);
  skyDome(1111,[[0,'#141c34'],[.3,'#2a3a5c'],[.43,'#8a7a8a'],[.49,'#e0a070'],[.52,'#6a5a5a'],[1,'#2a2420']],null,8);
  scene.add(new T.HemisphereLight(0x8a9ac0,0x3a3028,.5));
  const sun=new T.DirectionalLight(0xffc89a,.55); sun.position.set(60,24,-30); sun.target.position.set(0,0,20); scene.add(sun); scene.add(sun.target); scene.add(new T.AmbientLight(0x3a3a4a,.28));
  // mar e enseada
  const water=new T.Mesh(new T.PlaneGeometry(260,120),Q.water); water.rotation.x=-Math.PI/2; water.position.set(0,-.5,-90); scene.add(water);
  floorPlane(200,160,0,30,M.sand,'stone',0);
  // plataforma da bateria no alto do penhasco
  addWalk(-66,64,-10,62,Y11,{mat:M.rock,top:M.dune,seg:5});
  stairSteps('z',-10,-1,56,59,Y11-.2,19,M.rock,M.rock);
  stairSteps('z',62,1,-2,2,Y11-.2,19,M.rock,M.rock);
  const rock=(x0,x1,z0,z1,h,y0)=>addBlock(x0,x1,z0,z1,h,{y0:y0||0,mat:M.rock,surf:'stone',top:M.rock,seg:4});
  rock(-90,-66,-40,90,9); rock(64,90,-40,90,9);
  addSolidOnly(-66,56,-10.4,-10,6,Y11); addSolidOnly(59,64,-10.4,-10,6,Y11); addSolidOnly(-66,-2,62,62.4,6,Y11); addSolidOnly(2,64,62,62.4,6,Y11); rock(-90,90,90,98,9); rock(-66,40,-24,-10,3); rock(40,52,-24,-14,2.4);
  addSolidOnly(-90,90,-41,-40.6,4);
  const sb=(x0,x1,z0,z1,h)=>addBlock(x0,x1,z0,z1,h||1.7,{y0:Y11,mat:MAT.sandbag,surf:'sandbag',cover:true,seg:1});
  // trincheiras (labirinto) — paredes de sacos de areia
  const walls=[[-50,-30,14,15],[-26,-6,14,15],[6,26,14,15],[30,50,14,15],[-50,-49,15,30],[-34,-33,18,34],[-20,-19,15,26],[19,20,15,26],[33,34,18,34],[49,50,15,30],
    [-44,-20,34,35],[20,44,34,35],[-8,8,38,39],[-30,-10,50,51],[10,30,50,51],[-10,-9,39,50],[9,10,39,50],[-50,-36,42,43],[36,50,42,43],[-60,-50,24,25],[50,60,24,25]];
  for(const [a,b,c,d] of walls) sb(a,b,c,d,1.7);
  // canhões
  const guns=[]; for(const [i,x,z] of [[0,-40,4],[1,0,2],[2,40,4]]){
    for(let a=0;a<14;a++){ const t=a/14*Math.PI*2; if(Math.abs(angDiff(t,0))<.55) continue; const bx=x+Math.sin(t)*5, bz=z+Math.cos(t)*5; addBlock(bx-.7,bx+.7,bz-.7,bz+.7,1.3,{y0:Y11,mat:M5.lime||M.lime,surf:'stone',seg:1,cover:true}); }
    const g=new T.Group(); g.position.set(x,Y11,z); scene.add(g);
    const base=new T.Mesh(new T.CylinderGeometry(1.5,1.7,.6,14),hm(0x5a5e52)); base.position.y=.3; g.add(base);
    const shield=new T.Mesh(BOX(3,1.9,.2),hm(0x6a6e60)); shield.position.set(0,1.5,-.9); g.add(shield);
    const cradle=new T.Group(); cradle.position.set(0,1.6,0); g.add(cradle); const br=new T.Mesh(new T.CylinderGeometry(.16,.2,6.4,12),hm(0x4a4e44)); br.rotation.x=Math.PI/2; br.position.z=-3.2; cradle.add(br); const brc=new T.Mesh(BOX(.8,.8,1.4),hm(0x3a3e36)); brc.position.z=.5; cradle.add(brc); cradle.rotation.x=.12;
    for(const m of [base,shield,br,brc]){ m.userData.mat='metal'; W.shootables.push(m); }
    addSolidOnly(x-1.7,x+1.7,z-1.7,z+1.7,2.4,Y11,true);
    const sx=x+(i===1?-3.6:3.4), sz=z+3; const stk=[]; for(let k=0;k<6;k++) stk.push([sx+(k%3)*.36-.36,Y11+.4+Math.floor(k/3)*.5,sz,.3,.8,.3,0]); const sm=instanced(new T.CylinderGeometry(.5,.5,1,8),hm(0xb08a3a),stk);
    const stack={x:sx,z:sz,hp:90,state:'OK',im:sm}; addSolidOnly(sx-.7,sx+.7,sz-.3,sz+.3,1.3,Y11,true);
    const gun={i,x,z,g,cradle,br,state:'OK',fuse:0,stack,fireT:4+i*3.5,flashT:0};
    if(sm){ sm.userData.mat='metal'; sm.userData.zoneHit=(h,o)=>{ if(stack.state!=='OK') return; stack.hp-=computeDamage(o.weapon.dmg,h.distance,o.weapon.falloff,1); AudioSys.play('clank',h.point,.7); if(o.shooter==='player'){ hitMarker('equip'); limbTag(stack.hp<=0?'MUNIÇÃO · pegou fogo':'MUNIÇÃO'); } if(stack.hp<=0){ stack.state='BURN'; stack.t=1.6; AudioSys.play('flare',h.point,.8); } }; W.shootables.push(sm); }
    guns.push(gun); }
  // abrigo de comando
  const cw=(x0,x1,z0,z1,h,y)=>addBlock(x0,x1,z0,z1,h,{y0:Y11+(y||0),mat:M.lime,surf:'stone',seg:2});
  cw(-6,-5.6,20,29,3); cw(5.6,6,20,29,3); cw(-6,-1.4,20,20.4,3); cw(1.4,6,20,20.4,3); cw(-1.4,1.4,20,20.4,1.2); cw(-1.4,1.4,20,20.4,1,2);
  cw(-6,-1,28.6,29,3); cw(1,6,28.6,29,3); cw(-1,1,28.6,29,.6,2.4);
  addBlock(-6.4,6.4,19.6,29.4,.6,{y0:Y11+3,mat:M.lime,bottom:MAT.ceil,surf:'stone',seg:2});
  addBlock(2,5.2,23,23.8,.78,{y0:Y11,mat:M.wood,surf:'wood',cover:true,seg:1}); const radio11=addMesh(BOX(.5,.45,.4),hm(0x3a3e34),4,Y11+1,23.4,'metal');
  addMesh(new T.CylinderGeometry(.06,.06,1.8,6),MAT.darkMetal,-3,Y11+3.9,24,'metal'); addMesh(BOX(2.4,.14,.2),MAT.darkMetal,-3,Y11+4.8,24,'metal');
  bulb('B11',2,Y11+2.7,24,6); W.lamps[W.lamps.length-1].base=.7; W.lamps[W.lamps.length-1].light.intensity=.7;
  // portão sul e barracão
  addBlock(-12,-4,60,60.6,2.6,{y0:Y11,mat:M.lime,surf:'stone',seg:2}); addBlock(4,12,60,60.6,2.6,{y0:Y11,mat:M.lime,surf:'stone',seg:2});
  addBlock(40,54,44,54,3,{y0:Y11,mat:M.wood,surf:'wood',top:MAT.roof,seg:2});
  for(const [x,z] of [[-24,22],[24,22],[-6,44],[6,44],[-44,30],[44,30]]) crate(x,z,1.1,1.05,Y11);
  // enseada e lancha
  floorPlane(20,26,52,-23,M.dune,'stone',.01);
  const mtb=new T.Group(); mtb.position.set(52,-.3,-46); mtb.rotation.y=.4; scene.add(mtb); { const h=new T.Mesh(BOX(4.2,1.8,20),hm(0x7a8288)); h.position.y=.5; mtb.add(h); const b=new T.Mesh(BOX(2.6,1.8,4),hm(0x6a7278)); b.position.set(0,2.2,-1); mtb.add(b); const f=new T.Mesh(BOX(.02,.6,.9),hm(0x1a2a6a)); f.position.set(0,3.6,7); mtb.add(f); }
  const dinghy=new T.Mesh(BOX(1.6,.6,3.4),hm(0x3a3a2e)); dinghy.position.set(52,.3,-30); dinghy.rotation.y=.3; scene.add(dinghy);
  // navegação
  const N=[];
  for(let x=-62;x<=60;x+=2.6) for(let z=-8;z<=59;z+=2.6) N.push({x,z});
  for(let k=0;k<19;k++){ N.push({x:57.5,z:-10.2-k*.36-.18}); N.push({x:0,z:62.2+k*.36+.18}); }
  for(let x=44;x<=62;x+=2.6) for(let z=-34;z<=-18;z+=2.6) N.push({x,z});
  for(let x=-20;x<=20;x+=3) for(let z=70;z<=86;z+=3) N.push({x,z});
  N.push({x:57.5,z:-17.6},{x:57.5,z:-8.6},{x:0,z:69.4},{x:0,z:60.6},{x:0,z:29.8},{x:0,z:27.6},{x:-3,z:24},{x:3,z:26},{x:-1.6,z:26},{x:0,z:21.6});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=3.8; buildNav();
  return {sun,guns,radio11,mtb,dinghy};
}
function gunDestroy11(g){
  if(g.state==='DEAD') return; g.state='DEAD'; const p=V3(g.x,Y11+1.6,g.z);
  explode(p,{r:7,dmgE:320,dmgP:120,src:'player',kind:'shell'}); AudioSys.play('fireball',p,1.4);
  for(let k=0;k<4;k++) FX.puff(V3(g.x+rnd(-1,1),Y11+1.5+k,g.z+rnd(-1,1)),2,k<2?0xffb050:0x5a2a10,2.4-k*.2,.9+k*.3,V3(0,2.6+k,0),.9);
  FX.puff(V3(g.x,Y11+4,g.z),5,0x222020,2.6,5,V3(0,2,0),.6); g.cradle.rotation.x=-.35; g.br.position.z=-2.6; g.br.material=hm(0x1c1a18); scorchMark(V3(g.x,Y11+.02,g.z),3.6);
  if(g.stack.state==='OK'){ g.stack.state='BURN'; g.stack.t=.5; }
  G.flags['gun'+g.i]=true; const n=G.refs.guns.filter(x=>x.state==='DEAD').length; const o=obj('guns'); o.text='Neutralize os canhões costeiros ('+n+'/3)'; refreshObjectiveUI();
  pickupMsg('Canhão '+(g.i+1)+' neutralizado'); if(settings.shake) G.player.shake=Math.min(1.6,G.player.shake+.9);
  if(n>=3){ complete('guns'); activate('cove'); if(!G.flags.convoyLate) complete('convoy'); G.radioMsg('MANOLIS','Os três calaram! Agora para a enseada — a lancha inglesa não espera o sol.','warn'); }
  cp11();
}
function onExplode11(pos,o){
  const R=G.refs; if(!R||!R.guns) return; const r=o.r||5;
  for(const g of R.guns){ const st=g.stack; if(st.state==='OK'){ const d=Math.hypot(st.x-pos.x,st.z-pos.z); if(d<r*.8){ st.state='BURN'; st.t=.4+Math.random()*.4; } }
    if(g.state!=='DEAD'){ const d=Math.hypot(g.x-pos.x,g.z-pos.z); if(o.kind==='nade'&&d<2.4) { g.fuse=.05; g.state='ARMED'; } } }
}
function updateGuns11(dt){
  const R=G.refs, F=G.flags, P=G.player;
  for(const g of R.guns){
    const st=g.stack; if(st.state==='BURN'){ st.t-=dt; if(Math.random()<dt*16) FX.puff(V3(st.x,Y11+1.4,st.z),1,0xff8a30,.6,.4,V3(0,1.4,0),.8); if(st.t<=0){ st.state='GONE'; if(st.im) st.im.visible=false; explode(V3(st.x,Y11+.8,st.z),{r:6,dmgE:260,dmgP:110,src:'player',kind:'shell'}); AudioSys.play('fireball',V3(st.x,Y11+1,st.z),1.1); if(Math.hypot(st.x-g.x,st.z-g.z)<6) gunDestroy11(g); } }
    if(g.state==='ARMED'){ g.fuse-=dt; if(Math.random()<dt*8) FX.burst(V3(g.x,Y11+2,g.z+.6),1,0xffe0a0,1,.3,3); if(g.fuse<=0) gunDestroy11(g); }
    if(g.state==='OK'){ g.fireT-=dt; const crew=G.enemies.filter(e=>!e.dead&&e.def.gun===g.i&&e.state!=='COMBAT').length; if(g.fireT<=0&&crew>0){ g.fireT=11+Math.random()*4; const tip=V3(g.x,Y11+2.2,g.z-6.6); FX.puff(tip,3,0xffd080,1.6,.25,V3(0,.5,-3),.9); FX.puff(tip,4,0x6a6a6a,2.2,3,V3(0,1,-2),.5); AudioSys.play('tankfire',tip,1.2); g.flashT=.12; g.br.position.z=-2.6; if(settings.shake&&Math.hypot(P.pos.x-g.x,P.pos.z-g.z)<30) P.shake=Math.min(1.2,P.shake+.4); emitNoise(tip,8,'lure',null); }
      if(g.br.position.z>-3.2) g.br.position.z=Math.max(-3.2,g.br.position.z-dt*1.8); }
  }
}
function objectives11(){ return [
  {id:'guns',text:'Neutralize os canhões costeiros (0/3)',state:'active',marker:{x:0,z:2}},
  {id:'cove',text:'Desça para a enseada e embarque no bote da lancha inglesa',state:'hidden',marker:{x:52,z:-30}},
  {id:'convoy',text:'Opcional: cale os canhões antes de o comboio passar',state:'active',optional:true},
  {id:'quiet11',text:'Opcional: neutralize o primeiro canhão sem soar o alarme',state:'active',optional:true},
]; }
function interact11(R){
  const I=W.interactables, F=()=>G.flags;
  R.guns.forEach(g=>{
    I.push({id:'gc'+g.i,pt:()=>V3(g.x,Y11+1.6,g.z+1.4),r:2.4,skip:true,hold:()=>G.diff==='veterano'?3.6:2.8,
      label:()=>g.state!=='OK'?null:(F().charges11>0?'Prender carga-relógio na culatra do canhão '+(g.i+1)+' (segure)':(G.player.nades>0?'Enfiar uma granada no cano do canhão '+(g.i+1)+' (segure)':'Canhão '+(g.i+1)+' — precisa de carga ou granada')),
      locked:()=>!(F().charges11>0||G.player.nades>0),
      use:()=>{ if(g.state!=='OK') return; if(F().charges11>0){ F().charges11--; g.fuse=8; pickupMsg('Carga presa — 8 s'); } else if(G.player.nades>0){ G.player.nades--; g.fuse=3.2; pickupMsg('Granada no cano — 3 s'); } else return; g.state='ARMED'; AudioSys.play('unlock'); if(!G.alarm&&obj('quiet11').state==='active') complete('quiet11'); }});
  });
  I.push({id:'dinghy',pt:()=>V3(52,.8,-30),r:3,skip:true,label:()=>{ if(obj('cove').state!=='active') return null; const A=G.ally; if(A&&!A.dead&&A.downed) return 'Manolis está caído — reanime-o'; return 'Embarcar no bote'; },
    locked:()=>{ const A=G.ally; return !!(A&&A.downed); }, use:()=>{ if(obj('cove').state==='active') missionComplete(); }});
  I.push({id:'man11',pt:()=>{ const A=G.ally; return V3(A.pos.x,A.pos.y+1.1,A.pos.z); },r:2.4,skip:true,label:()=>G.ally&&G.ally.downed?'Reanimar Manolis':null,hold:()=>1.6,use:()=>G.ally.revive()});
}
function update11(dt){
  const P=G.player, F=G.flags, R=G.refs, A=G.ally;
  if(!F.allyInit&&A){ F.allyInit=true; A.joined=true; A.mode='FOLLOW'; A.hidden=false; }
  if(F.charges11===undefined) F.charges11=2;
  if(!F.mgSet){ F.mgSet=true; for(const e of G.enemies) if(e.def.mg){ e.ew=EW.mg; e.mag=EW.mg.mag; } }
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('MANOLIS','A bateria fica além das trincheiras. Três canhões de costa — o comboio inglês passa diante deles ao nascer do sol. Tenho duas cargas da Rede; o resto, granadas.','tip'); }
  if(!F.i2&&G.introT>10){ F.i2=true; G.radioMsg('DICA','Bala não estraga canhão. Carga ou granada na culatra — ou acerte a munição empilhada ao lado e deixe ela fazer o serviço. G: Manolis segue/espera.','tip'); }
  F.convT=(F.convT||0)+dt; const total=G.diff==='recruta'?600:G.diff==='veterano'?360:480; F.dawn11=clamp(F.convT/total,0,1);
  if(obj('guns').state==='active'){ const left=Math.max(0,total-F.convT); G.progress={label:'Comboio diante da bateria em '+Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0'),v:1-F.convT/total}; if(left<=0&&!F.convoyLate){ F.convoyLate=true; failObjective('convoy'); G.radioMsg('MANOLIS','O comboio está passando… e os canhões ainda atiram. Rápido!','warn'); } }
  else G.progress=null;
  updateGuns11(dt);
  const cs=$('#convChip'); if(cs&&G.levelId==='11'){ cs.hidden=false; const sig=R.guns.map(g=>g.state).join()+'|'+F.charges11; if(cs.dataset.sig!==sig){ cs.dataset.sig=sig; const lb=cs.querySelector('.lbl'); if(lb&&lb.firstChild) lb.firstChild.nodeValue='Baterias · '; cs.className='disg conv'+(R.guns.every(g=>g.state==='DEAD')?' ok':''); $('#convState').textContent=R.guns.filter(g=>g.state!=='DEAD').length+' ativas'; $('#convRow').innerHTML=R.guns.map(g=>'<span class="trk '+(g.state==='DEAD'?'wreck':g.state==='ARMED'?'burn':'')+'">C'+(g.i+1)+'</span>').join(''); $('#convSub').textContent='Cargas: '+F.charges11+' · granadas: '+(P.nades||0); } }
  if(obj('cove').state==='active'&&!F.coveMsg&&P.pos.z<-12){ F.coveMsg=true; G.radioMsg('LANCHA','“Tocha, bote na praia. Dois minutos e vamos embora.”'); }
}
function cp11(){ checkpoint(); }
function restore11(s){ const F=G.flags, R=G.refs; for(const g of R.guns) if(F['gun'+g.i]){ g.state='DEAD'; g.cradle.rotation.x=-.35; g.br.material=hm(0x1c1a18); g.stack.state='GONE'; if(g.stack.im) g.stack.im.visible=false; } F.mgSet=false; }
function drawMap11(g,w,h){
  g.fillStyle='#e8dcc0'; g.fillRect(0,0,w,h); const S=w/140, X=x=>(x+70)*S, Z=z=>(z+30)*S;
  g.fillStyle='#9ab8c8'; g.fillRect(0,0,w,Z(-24)); g.fillStyle='#d8c8a4'; g.fillRect(X(-66),Z(-10),130*S,72*S); g.fillStyle='#e0d0a8'; g.fillRect(X(42),Z(-34),20*S,24*S);
  g.fillStyle='#8a7a5a'; for(const [a,b,c,d] of [[-50,-30,14,15],[-26,-6,14,15],[6,26,14,15],[30,50,14,15],[-50,-49,15,30],[-34,-33,18,34],[-20,-19,15,26],[19,20,15,26],[33,34,18,34],[49,50,15,30],[-44,-20,34,35],[20,44,34,35],[-8,8,38,39],[-30,-10,50,51],[10,30,50,51],[-10,-9,39,50],[9,10,39,50],[-50,-36,42,43],[36,50,42,43],[-60,-50,24,25],[50,60,24,25]]) g.fillRect(X(a),Z(c),(b-a)*S,Math.max(2,(d-c)*S));
  g.fillStyle='#8a2a1a'; for(const [x,z] of [[-40,4],[0,2],[40,4]]){ g.beginPath(); g.arc(X(x),Z(z),5*S,0,7); g.fill(); }
  g.fillStyle='#4a3a22'; g.fillRect(X(-6),Z(20),12*S,9*S);
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'11px serif'; g.fillText(s,X(x),Z(z)); };
  t('C1',-40,-2,'bold 12px serif'); t('C2',0,-4,'bold 12px serif'); t('C3',40,-2,'bold 12px serif'); t('comando',0,32,'10px serif'); t('trincheiras',-30,24,'italic 10px serif'); t('portão',0,64,'10px serif'); t('enseada',52,-26,'italic 11px serif'); t('lancha',52,-28+ -8,'italic 10px serif'); t('trilha do penhasco',58,-12,'italic 9px serif');
}
DOCS.planta11={title:'Bateria de Ammoudara',sub:'croqui dos andartes',map:'11',body:'',pencil:'Três canhões de 15 cm voltados para o mar. Trincheiras em zigue-zague entre o portão e as peças. Trilha do penhasco a leste desce até a enseada.'};
LEVELS['11']={id:'11',num:11,op:'Operação 11',name:'Labirinto',place:'Bateria costeira, oeste de Heraklion',prev:'10',
  loadout:{weapons:['silenced','pistol','smg'],ammo:{silenced:{mag:6,reserve:12},pistol:{mag:8,reserve:16},smg:{mag:32,reserve:64}},cur:'smg',camera:false},baseLight:.4,lightFn:light11,shadows:true,bloomTh:.8,grenades:true,onExplode:onExplode11,
  build:buildLevel11,enemies:ENEMY_DEFS_11.map(d=>Object.assign({},d,{gun:d.id[0]==='a'?0:d.id[0]==='b'?1:d.id[0]==='c'&&d.id!=='cp'?2:undefined})),
  ally:{id:'man',x:3,z:72,yaw:Math.PI,name:'MANOLIS',title:'Manolis',hp:150,range:45,dmg:38,look:{uniform:0x1a1a1a,pants:0x2a2a2a,skin:0xb08060,hair:0x1a1410,cap:'beret',capColor:0x111111,weapon:'rifle'},failTitle:'Manolis não resistiu',failText:'Manolis ficou caído tempo demais nas trincheiras.'},
  start:{x:0,z:76,yaw:0},startDocs:['planta11'],drawMap:drawMap11,
  reinf:[{id:'n1',x:46,z:42,weapon:'smg',helmet:true,nades:1},{id:'n2',x:48,z:42,weapon:'rifle',helmet:true},{id:'n3',x:44,z:41,weapon:'rifle',helmet:true},{id:'n4',x:50,z:41,weapon:'smg',helmet:true}],
  radio:{x:4,z:22.6,fx:4,fz:23.4},radioRun:'O operador corre para o rádio do abrigo de comando!',alarmPos:V3(4,Y11+1.2,23.4),alarmText:'Alarme na bateria! O barracão despeja soldados nas trincheiras.',alarmObjective:null,
  alarmYes:'A bateria deu o alarme. ',alarmNo:'',deathText:'A guarnição da bateria fechou as trincheiras.',
  objectives:objectives11,interact:interact11,pickups:()=>{ addPickup('l_nade1',-24,23.2,'nade',2,Y11+1.1); addPickup('l_nade2',24,23.2,'nade',2,Y11+1.1); addPickup('l_med1',-6,45.2,'med',35,Y11+1.1); addPickup('l_smg1',6,45.2,'smg',32,Y11+1.1); addPickup('l_med2',3,24.6,'med',30,Y11+.85); addPickup('l_nade3',-44,31.2,'nade',1,Y11+1.1); addPickup('l_med3',50,-20,'med',40,.1); G.player.nades=Math.max(G.player.nades||0,1); },
  update:update11,restore:restore11,
  resultTitle:'Fim da campanha de Creta',outro:['ÉLISE','Da lancha, a bateria é só fumaça sobre o penhasco. O comboio passa inteiro. Manolis fica na praia acenando — a ilha é dele. A minha próxima parada, dizem, é um castelo na Vestfália.'],menuCam:{cx:30,cz:-30,y:10,tx:0,tz:10},ambient:'harbor',mist:{n:10,x0:-60,x1:60,z0:-30,z1:60,color:0x6a7088},
  briefing:{meta:'CRETA — 13 DE MAIO DE 1943 — 05h30',paras:['A fuga de Cnossos terminou numa cabana de pastores com Manolis e uma mensagem de Londres: ao nascer do sol, um comboio aliado passa ao largo de Heraklion — bem diante de uma bateria costeira de três canhões de 15 cm.','A bateria é um labirinto de trincheiras de sacos de areia no alto do penhasco. Bala não estraga canhão: use as duas cargas da Rede, granadas na culatra ou a munição empilhada ao lado de cada peça. Depois, a trilha do penhasco leva à enseada, onde uma lancha inglesa espera.'],list:['Neutralizar os três canhões (carga, granada ou munição)','Manolis acompanha (G: segue/espera; reanime se cair)','Descer à enseada e embarcar no bote']}};
LEVEL_ORDER.push('11');