'use strict';


/* =========================================================
   OPERAÇÃO 6 — Bordj el-Hamra (entardecer, 28/04/1943)
   ========================================================= */
function mats06(){
  tex05(); const HQ=MAT_HQ;
  if(!TEX.rock6) TEX.rock6=canvasTex(256,256,(g,w,h)=>{ const R=mulberry32(606); g.fillStyle='#8a7258'; g.fillRect(0,0,w,h); for(let i=0;i<3000;i++){ g.fillStyle=R()<.5?`rgba(40,30,20,${R()*.15})`:`rgba(255,230,190,${R()*.1})`; g.fillRect(R()*w,R()*h,2+R()*8,1+R()*5); } for(let i=0;i<30;i++){ g.strokeStyle='rgba(50,36,24,.35)'; g.beginPath(); g.moveTo(R()*w,R()*h); g.lineTo(R()*w,R()*h); g.stroke(); } },5);
  const L=(o,ex)=>{ if(!HQ) return new T.MeshLambertMaterial(o); const p=Object.assign({shininess:6,specular:0x0d0d0d},o,ex||{}); if(p.map&&p.bump!==false){ p.bumpMap=p.map; p.bumpScale=p.bumpScale||.04; } delete p.bump; return new T.MeshPhongMaterial(p); };
  return {adobe:L({map:TEX.ochre5,color:0xe6c8a0}), adobeD:L({map:TEX.ochre5,color:0xb89870}), lime:L({map:TEX.lime5}), sand:L({map:TEX.dust5,color:0xe2c49a}), road:L({map:TEX.dust5,color:0xa89070}),
    tiles:L({map:TEX.terra5}), rock:L({map:TEX.rock6},{bumpScale:.08}), wood:L({map:TEX.wood,color:0x7a5534}), canvas:L({map:TEX.canvas||null,color:0xb8a682}), drum:L({color:0x6a3a24},{specular:0x332211,shininess:30}), drumG:L({color:0x4a5238},{specular:0x222222,shininess:30}),
    tank:L({color:0xa8aaa4},{specular:0x666666,shininess:50}), board:L({color:0x1e2a22}), cot:L({color:0x6a6450}), net:new T.MeshLambertMaterial({color:0x6a6a48,side:T.DoubleSide,transparent:true,opacity:.75}), red:new T.MeshBasicMaterial({color:0xff3a20}), barrier:L({color:0xe8e0d0}),
    door:L({map:TEX.door5,bump:false}), leaf:L({color:0x4a6a2e}), trunk:L({color:0x7a6248}), shrub:L({color:0x6a6a3e}), dune:L({map:TEX.dust5,color:0xd8b888},{bumpScale:.02})};
}
let M6=null;
function wallOpen(axis,c0,c1,a0,a1,h,openings,mat,o={}){
  // parede ao longo de 'axis' (x ou z) de a0 a a1, espessura c0..c1, com aberturas {c,w,sill,top}
  const ops=[...openings].sort((p,q)=>p.c-q.c); let cur=a0;
  const piece=(p0,p1,y0,y1)=>{ if(p1-p0<.01||y1-y0<.01) return; if(axis==='x') addBlock(p0,p1,c0,c1,y1-y0,Object.assign({y0,mat,surf:'stone',seg:1.5,top:mat},o)); else addBlock(c0,c1,p0,p1,y1-y0,Object.assign({y0,mat,surf:'stone',seg:1.5,top:mat},o)); };
  for(const q of ops){ const p0=q.c-q.w/2, p1=q.c+q.w/2; piece(cur,p0,0,h); if(q.sill) piece(p0,p1,0,q.sill); piece(p0,p1,q.top||2.4,h); cur=p1; }
  piece(cur,a1,0,h);
}
function drums(x0,x1,z0,z1,h,mat){ addSolidOnly(x0,x1,z0,z1,h,0,true);
  const list=[]; for(let x=x0+.32;x<x1-.1;x+=.64) for(let z=z0+.32;z<z1-.1;z+=.64) for(let y=0;y<h-.1;y+=.92) list.push([x,y+.45,z,.6,.9,.6,0]); const im=instanced(new T.CylinderGeometry(.5,.5,1,10),mat||M6.drum,list); if(im){ im.userData.mat='metal'; W.shootables.push(im); } }
function tanker(x,z){ const a=addBlock(x-3,x+3,z-1.05,z+1.05,.9,{mat:MAT.truck,surf:'metal',cover:true,y0:.45,seg:1}); a.minY=0; const b=addBlock(x+.2,x+3,z-1,z+1,1.25,{mat:MAT.truck,surf:'metal',y0:1.35,seg:1});
  const t=addMesh(new T.CylinderGeometry(1,1,4.2,14),M6.tank,x-.7,2.1,z,'metal'); t.rotation.z=Math.PI/2; addSolidOnly(x-2.8,x+1.4,z-1,z+1,3.1,1.35);
  a.mesh.visible=false; b.mesh.visible=false; t.visible=false; const B=vehB(); const desert=G&&G.level&&['06','07','08'].includes(G.level.id); vehTruck(B,desert?0x8a7c5c:0x3b4434,'tank',{tankMat:M6.tank}); B.place(x,z,Math.PI/2); }
function tent(x0,x1,z0,z1,h,mat){ const cx=(x0+x1)/2, cz=(z0+z1)/2, w=x1-x0, d=z1-z0;
  for(const s of [-1,1]){ const r=new T.Mesh(new T.PlaneGeometry(w+.4,Math.hypot(d/2,1.2)+.2),mat); r.position.set(cx,h-.6,cz+s*d/4); r.rotation.x=-Math.PI/2+s*Math.atan2(1.2,d/2); r.rotation.order='XYZ'; r.material.side=T.DoubleSide; scene.add(r); }
  for(const [x,z] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1],[x0,cz],[x1,cz]]) addMesh(BOX(.1,h-1.2,.1),M6.wood,x,(h-1.2)/2,z,'wood'); for(const x of [x0,x1]) addSolidOnly(x-.08,x+.08,z0-.08,z0+.08,h), addSolidOnly(x-.08,x+.08,z1-.08,z1+.08,h); }
function bomberMesh(){ const g=new T.Group(); const m=hm(0x2a2c2e); const f=new T.Mesh(BOX(1.4,1.4,14),m); g.add(f); const w=new T.Mesh(BOX(22,.3,3),m); w.position.z=1; g.add(w); const t=new T.Mesh(BOX(7,.25,1.8),m); t.position.z=-6.2; g.add(t); const v=new T.Mesh(BOX(.25,2.6,1.6),m); v.position.set(0,1.2,-6.2); g.add(v); for(const x of [-5,-2.4,2.4,5]){ const e=new T.Mesh(new T.CylinderGeometry(.45,.45,2.2,8),m); e.rotation.x=Math.PI/2; e.position.set(x,-.1,2); g.add(e); } scene.add(g); return g; }
const ENEMY_DEFS_06=[
  {id:'g1',x:-25.4,z:3,yaw:-Math.PI/2,weapon:'rifle',helmet:true},
  {id:'g2',x:-26.8,z:-6.6,yaw:-Math.PI/2+.5,weapon:'smg'},
  {id:'w1',x:-20,z:-20,yaw:-Math.PI*.75,weapon:'rifle',helmet:true,fixed:true},
  {id:'w2',x:20,z:20,yaw:Math.PI*.25,weapon:'rifle',helmet:true,fixed:true},
  {id:'o1',x:-5,z:-14.2,yaw:Math.PI,weapon:'pistol',officer:true},
  {id:'k1',x:-17.2,z:-15.4,weapon:'pistol',patrol:[[-17.2,-15.4],[-15,-12.2],[-15,-9.5],[3,-9.5],[3,-12.2],[.8,-15.1],[3,-12.2],[3,-9.5],[-2,1],[-13,11.6],[-14.6,14.6],[-13,11.6],[-2,1],[-15,-9.5],[-15,-12.2]]},
  {id:'c1',x:-14,z:-5,weapon:'rifle',helmet:true,patrol:[[-14,-5],[5,-5],[5,8],[-14,8]]},
  {id:'c2',x:-2.6,z:8.2,yaw:0,weapon:'smg'},
  {id:'c3',x:-16,z:12.4,yaw:Math.PI/2,weapon:'rifle'},
  {id:'k2',x:10.6,z:-9.4,yaw:0,weapon:'rifle',helmet:true},
  {id:'r1',x:17.4,z:-16.6,weapon:'pistol',patrol:[[17.4,-16.6],[17,-11],[9.6,-9.6],[16.6,-5.6],[12,4],[-12.6,12.6],[-14.2,15],[-12.6,12.6],[12,4],[16.6,-5.6],[9.6,-9.6],[17,-11]]},
  {id:'e1',x:17.4,z:2.8,yaw:-Math.PI/2,weapon:'rifle',helmet:true},
  {id:'d1',x:24,z:-13.6,weapon:'rifle',helmet:true,patrol:[[24,-13.6],[42.4,-13.6],[42.4,8.6],[24,14.4]]},
  {id:'d2',x:33.4,z:6.4,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'d3',x:30,z:-1.6,yaw:-Math.PI/2,weapon:'smg'},
];
function zone06(x,z,y){
  if(x>21&&x<44.5&&z>-16.5&&z<16.5) return 2;
  if(x>-20&&x<20&&z>-20&&z<20){ if(y>2.5) return 2; if(x>16.5&&z>-3.5&&z<3.5) return 2; return 1; }
  if(x>=19.8&&x<=21&&z>-2&&z<2) return 2;
  return 0;
}
function light06(x,z){
  const h=heightAt(x,z);
  if(x>-19.8&&x<7.8&&z>-19.8&&z<-11) return .42;
  if(h>3&&z<-13) return .4;
  return .62;
}
function buildLevel06(){
  M5=mats05(); M6=mats06(); const M=M6; G.cred=1; G.disguise={blown:false}; photos06();
  scene.background=new T.Color(0x8a6a6a); scene.fog=new T.FogExp2(0xa87a68,.0105);
  skyDome(606,[[0,'#1c2a4c'],[.3,'#3e4672'],[.42,'#9a6a86'],[.48,'#e89a5a'],[.51,'#f4b868'],[.54,'#8a5a3e'],[1,'#3a2a24']],[880,236,30],12);
  scene.add(new T.HemisphereLight(0x8a94c0,0x6a4a38,.5));
  const sun=new T.DirectionalLight(0xffa868,.95); sun.target.position.set(4,0,0); sun.position.set(4-72,14,0+8); scene.add(sun); scene.add(sun.target);
  scene.add(new T.AmbientLight(0x4a3a40,.24));
  // ---- terreno ----
  floorPlane(140,110,-6,4,M.sand,'stone',0);
  floorPlane(40,6,-41,0,M.road,'stone',.012); floorPlane(42,42,0,0,M.road,'stone',.014); floorPlane(23,32,32.5,0,M.road,'stone',.014);
  const rock=(x0,x1,z0,z1,h)=>addBlock(x0,x1,z0,z1,h,{mat:M.rock,surf:'stone',top:M.rock,seg:4});
  rock(-62,50,-36,-30,7); rock(-62,18,30,36,6); rock(50,56,-36,48,8); rock(-66,-60,-36,36,7);
  rock(18,21.6,16,48,5.5); rock(30.6,34,16.2,48,6); rock(18,34,46,50,6); rock(34,50,16.2,48,5);
  for(const [x,z,s] of [[-48,-22,6],[-30,24,5],[-8,26,7],[40,-24,6],[-52,18,4],[10,-26,5]]){ const d=new T.Mesh(new T.SphereGeometry(s,14,8,0,Math.PI*2,0,Math.PI/2),M.dune); d.scale.y=.28; d.position.set(x,0,z); scene.add(d); }
  for(let i=0;i<26;i++){ const R=mulberry32(600+i); const x=-58+R()*104, z=(R()<.5?-28+R()*6:23+R()*6); if(x>16&&x<36&&z>0) continue; const b=new T.Mesh(new T.SphereGeometry(.4+R()*.5,7,5),M.shrub); b.scale.y=.6; b.position.set(x,.15,z); scene.add(b); }
  for(let x=-58;x<-22;x+=9){ addMesh(BOX(.15,6,.15),M.wood,x,3,-4.4,'wood'); addMesh(BOX(1,.1,.1),M.wood,x,5.8,-4.4,'wood'); }
  // carro de Yasmina e caminhão de fuga
  car(-50,4.4,false); truck04(26,42);
  // ---- muralhas do bordj ----
  const wall=(x0,x1,z0,z1,h=6,y0=0)=>addBlock(x0,x1,z0,z1,h,{y0,mat:M.adobe,surf:'stone',top:M.adobe,seg:3});
  wall(-21,21,-21,-19.8); wall(-21,21,19.8,21); wall(-21,-19.8,-21,-2.2); wall(-21,-19.8,2.2,21); wall(-21,-19.8,-2.2,2.2,1.6,4.4);
  wall(19.8,21,-21,-2); wall(19.8,21,2,21); wall(19.8,21,-2,2,1.6,4.4);
  wall(-22.6,-19.8,-4.8,-2.2,7.6); wall(-22.6,-19.8,2.2,4.8,7.6);
  addWalk(-22.5,-17.5,-22.5,-17.5,8,{mat:M.adobe,top:M.adobeD,seg:3}); addWalk(17.5,22.5,17.5,22.5,8,{mat:M.adobe,top:M.adobeD,seg:3}); wall(-22.5,-17.5,17.5,22.5,8);
  for(const [x0,x1,z0,z1] of [[-22.5,-17.5,-22.5,-22.2],[-22.5,-22.2,-22.5,-17.5],[17.5,22.5,22.2,22.5],[22.2,22.5,17.5,22.5]]) addBlock(x0,x1,z0,z1,1,{y0:8,mat:M.adobe,surf:'stone',cover:true,seg:1});
  { const list=[]; const merl=(x0,x1,z0,z1,y)=>{ const L=Math.max(Math.abs(x1-x0),Math.abs(z1-z0)); for(let t=1;t<L;t+=2){ const k=t/L; list.push([x0+(x1-x0)*k,y+.3,z0+(z1-z0)*k,.7,.6,.7,0]); } };
    merl(-21,21,-20.4,-20.4,6); merl(-21,21,20.4,20.4,6); merl(-20.4,-20.4,-21,21,6); merl(20.4,20.4,-21,21,6); instanced(UNIT,M.adobe,list); }
  // cancela e guarita
  const bar=makeDoor('barrier',{x:-24,z:0,y0:.9,w:.16,d:4.6,h:.16,mat:M.barrier,offset:V3(0,2.4,0),locked:true,npc:false,nav:true,snd:'door'});
  addMesh(BOX(.3,1.1,.3),M.wood,-24,.55,-2.6,'wood'); addMesh(BOX(.3,1.1,.3),M.wood,-24,.55,2.6,'wood'); addSolidOnly(-24.15,-23.85,-2.75,-2.45,1.1); addSolidOnly(-24.15,-23.85,2.45,2.75,1.1);
  addBlock(-29,-26.4,-6,-3.8,2.6,{mat:M.wood,surf:'wood',top:MAT.roof,seg:1}); addBlock(-29.2,-26.2,-6.2,-3.6,.15,{y0:2.6,mat:MAT.roof,surf:'wood',seg:1,solid:false});
  for(const [id,x,z] of [['P1',-27,3.6],['P2',-14,4],['P3',4,-6],['P4',8,10],['P5',-6,14],['P6',26,-8],['P7',38,6],['P8',28,10]]){ const L=lampPost(id,x,z,.6,0); L.base=.85; }
  // ---- QG (térreo) ----
  wallOpen('x',-11.2,-11,-19.8,7.8,3.6,[{c:-15,w:1.2},{c:-5,w:1.2},{c:3,w:1.2},{c:-12.2,w:1.4,sill:.9,top:2.3},{c:-8,w:1.4,sill:.9,top:2.3},{c:-1.6,w:1.4,sill:.9,top:2.3},{c:5.8,w:1.4,sill:.9,top:2.3}],M.lime,{inner:{'+z':M.adobe}});
  for(const [id,c] of [['w1',-12.2],['w2',-8],['w3',-1.6],['w4',5.8]]) addGlass('hq'+id,c-.7,c+.7,.9,2.3,-11.14,-11.06);
  addBlock(-10.1,-9.9,-19.8,-11.2,3.6,{mat:M.lime,surf:'stone',seg:1.5}); addBlock(-.1,.1,-19.8,-11.2,3.6,{mat:M.lime,surf:'stone',seg:1.5}); addBlock(7.6,7.8,-19.8,-11,3.6,{mat:M.lime,surf:'stone',seg:1.5});
  addBlock(-19.8,7.8,-19.8,-11,.35,{y0:3.6,mat:M.adobe,bottom:MAT.ceil,top:M.adobeD,seg:3});
  for(const [id,x] of [['dsch',-15],['dops',-5],['dcan',3]]) makeDoor(id,{x,z:-11.1,w:1.2,d:.1,h:2.3,mat:M.door,offset:V3(1.15,0,0),npc:true,nav:true});
  floorPlane(27.6,8.8,-6,-15.4,M.tiles,'stone',.02);
  // secretaria (Schreibstube)
  addBlock(-19.6,-17.4,-19.6,-18.8,1.8,{mat:MAT.cabinet,surf:'metal',seg:1}); addBlock(-13.4,-10.4,-19.6,-19,1.9,{mat:MAT.cabinet,surf:'metal',seg:1});
  const stampDesk=addBlock(-18.4,-16.2,-16.8,-15.8,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); addBlock(-13.2,-11.2,-15.4,-14.4,.78,{mat:M.wood,surf:'wood',cover:true,seg:1});
  addMesh(BOX(.4,.2,.32),hm(0x1e1e1e),-12.2,.9,-14.9,'metal'); const stamp=addMesh(new T.CylinderGeometry(.05,.07,.12,8),hm(0x4a2a1a),-17.6,.85,-16.2,'wood'); addMesh(BOX(.3,.02,.2),hm(0xd8cfb8),-17,.8,-16.3,'cloth');
  chairT(-17.3,-15.2,Math.PI,0); chairT(-12.2,-13.8,Math.PI,0);
  bulb('H1',-15,3.3,-15.4,6); bulb('H2',-5,3.3,-15.4,6); bulb('H3',3.8,3.3,-15.4,6); W.lamps.slice(-3).forEach(l=>{ l.base=.7; l.light.intensity=.75; });
  // sala de operações
  addBlock(-7.4,-2.6,-17,-15.4,.9,{mat:M.wood,surf:'wood',cover:true,seg:1}); addMesh(BOX(4.6,.02,1.5),MAT.mapTable,-5,.91,-16.2,'cloth');
  poster(-5,1.9,-19.76,0,3.2,1.6,(g,w,h)=>{ g.fillStyle='#1e2a22'; g.fillRect(0,0,w,h); g.strokeStyle='#8a7a5a'; g.lineWidth=6; g.strokeRect(3,3,w-6,h-6); g.fillStyle='#e8e4d8'; g.font='bold 15px monospace'; g.fillText('KOLONNE 7 — TREIBSTOFF',14,24); g.font='12px monospace'; const L=['Do 29.4  02.00  La Goulette','        04.10  km 31 (ponte)','        05.30  Oued el-Kebir','Fz: 14 × 4500 l','Eskorte: 2 Sd.Kfz., 1 Lkw','Fr 30.4  02.00  idem']; L.forEach((s,i)=>g.fillText(s,14,48+i*16)); });
  for(const [x,z] of [[-8.6,-12.6],[-1.4,-12.6]]) chairT(x,z,0,0);
  // cantina
  for(const z of [-16.6,-13.6]){ addBlock(1.2,6.2,z-.4,z+.4,.75,{mat:M.wood,surf:'wood',cover:true,seg:1}); }
  addBlock(6.4,7.5,-19.6,-17.4,1.1,{mat:MAT.stove,surf:'metal',seg:1});
  // ---- torre de comando (keep) ----
  addWalk(8,19.8,-19.8,-8,4,{mat:M.adobe,top:M.tiles,seg:3});
  stairSteps('x',9,1,-8,-6.4,3.8,19,M.tiles,M.adobe); stairParapet('x',9,1,-6.4,-6.25,3.8,19,M.adobe);
  addBlock(8,8.8,-8.2,-8,.95,{y0:4,mat:M.adobe,surf:'stone',cover:true,seg:1}); addBlock(10,19.6,-8.2,-8,.95,{y0:4,mat:M.adobe,surf:'stone',cover:true,seg:1});
  const kw=(x0,x1,z0,z1)=>addBlock(x0,x1,z0,z1,3,{y0:4,mat:M.lime,surf:'stone',seg:1.5,top:M.lime});
  kw(8,19.8,-19.8,-19.6); kw(19.6,19.8,-19.6,-13); kw(8,8.2,-19.6,-13); kw(13.8,14,-19.6,-13);
  kw(8,10.4,-13.2,-13); kw(11.6,16.4,-13.2,-13); kw(17.6,19.8,-13.2,-13); addBlock(10.4,11.6,-13.2,-13,.7,{y0:6.3,mat:M.lime,seg:1}); addBlock(16.4,17.6,-13.2,-13,.7,{y0:6.3,mat:M.lime,seg:1});
  makeDoor('dcmd',{x:11,z:-13.1,y0:4,w:1.2,d:.1,h:2.3,mat:M.door,offset:V3(1.15,0,0),npc:true,nav:true}); makeDoor('drad',{x:17,z:-13.1,y0:4,w:1.2,d:.1,h:2.3,mat:M.door,offset:V3(-1.15,0,0),npc:true,nav:true});
  addBlock(8,19.8,-19.8,-13,.3,{y0:7,mat:M.adobe,bottom:MAT.ceil,top:M.adobeD,seg:3});
  addBlock(10.6,13.4,-18.2,-17.2,.78,{y0:4,mat:M.wood,surf:'wood',cover:true,seg:1}); chairT(12,-16.6,Math.PI,4); addBlock(8.25,8.9,-15,-13.5,1.9,{y0:4,mat:MAT.cabinet,surf:'metal',seg:1});
  poster(8.23,5.7,-16.6,Math.PI/2,2.6,1.6,(g,w,h)=>{ g.fillStyle='#d8cdb0'; g.fillRect(0,0,w,h); g.strokeStyle='#5a4a30'; g.lineWidth=3; g.strokeRect(3,3,w-6,h-6); g.fillStyle='#4a6a8a'; g.fillRect(150,10,100,h-20); g.fillStyle='#2a2418'; g.font='bold 13px serif'; g.fillText('FLAK — SETOR TUNIS-SUL',12,22);
    const R=mulberry32(66); for(let i=0;i<9;i++){ const x=20+R()*120, y=40+R()*100; g.strokeStyle='#8a2a1a'; g.lineWidth=2; g.beginPath(); g.arc(x,y,7,0,7); g.stroke(); g.fillStyle='#8a2a1a'; g.fillText(String(i+1),x-3,y+4); } g.strokeStyle='#2a2418'; g.setLineDash([4,3]); g.beginPath(); g.moveTo(20,150); g.lineTo(140,60); g.stroke(); g.setLineDash([]); });
  // sala de rádio
  addBlock(15.4,19.4,-19.6,-18.8,.8,{y0:4,mat:M.wood,surf:'wood',cover:true,seg:1}); const radio6=addMesh(BOX(1.1,.5,.45),hm(0x3a3e34),17.4,5.05,-19.1,'metal'); addMesh(BOX(.5,.3,.4),hm(0x2e322a),16.2,4.95,-19.1,'metal');
  for(let i=0;i<5;i++) addMesh(new T.CylinderGeometry(.03,.03,.02,8),hm(0xd8c890),16.95+i*.22,5.16,-18.87,null).rotation.x=Math.PI/2;
  chairT(17.4,-18.2,Math.PI,4);
  addMesh(new T.CylinderGeometry(.06,.1,9,6),MAT.darkMetal,17,11.8,-16,'metal'); for(const [dx,dz] of [[-3,0],[2.5,2.6],[2.5,-3]]){ const w=new T.Mesh(BOX(.02,.02,1),MAT.darkMetal); const a=V3(17,15.6,-16), b=V3(17+dx,7.3,-16+dz); w.position.copy(a).add(b).multiplyScalar(.5); w.lookAt(b); w.scale.z=a.distanceTo(b); scene.add(w); }
  bulb('K1',11,6.7,-16,5); bulb('K2',17,6.7,-16,5); W.lamps.slice(-2).forEach(l=>{ l.base=.6; l.light.intensity=.6; });
  // ---- pátio ----
  truck04(-6,4.6); truck04(5,13.4); car(13,4,true);
  drums(-18.6,-15.4,-9.4,-7,1.8,M.drumG); crate(-12.6,-.4,1.1,1.1); crate(-11.4,.6,1,.9); crate(-12,0,.8,.8,1.1);
  addMesh(new T.CylinderGeometry(.9,1,.85,12),M.lime,-2,.42,-4.6,'stone'); addSolidOnly(-2.8,-1.2,-5.4,-3.8,.85,0,true);
  palm(-9,16.6,6.8); palm(14.6,15.6,7.4);
  tent(-18.6,-11,9,17.6,3.2,new T.MeshLambertMaterial({color:0xb4a27c,side:T.DoubleSide})); for(const z of [10.8,13.2,15.6]) addBlock(-17.4,-12.4,z-.35,z+.35,.75,{mat:M.wood,surf:'wood',cover:true,seg:1});
  tent(8.6,18.6,11,19.4,3.2,new T.MeshLambertMaterial({color:0xa8986e,side:T.DoubleSide})); for(let x=9.6;x<18;x+=1.6) addBlock(x-.35,x+.35,16.4,18.6,.45,{mat:M.cot,surf:'cloth',seg:1});
  addBlock(16.4,18.2,5,6.4,1.3,{mat:MAT.cabinet,surf:'metal',cover:true,seg:1});
  // ---- depósito de combustível ----
  const fence=(x0,x1,z0,z1)=>{ const s=addSolidOnly(x0,x1,z0,z1,2.3); s.see=true; return s; };
  fence(21,44,-16.1,-16); fence(44,44.1,-16,16.1); fence(21,23,16,16.1); fence(24.6,44,16,16.1); const wire=fence(23,24.6,16,16.1);
  { const posts=[]; for(let x=21.5;x<44.2;x+=2.5){ posts.push([x,1.15,-16.05,.1,2.3,.1,0],[x,1.15,16.05,.1,2.3,.1,0]); } for(let z=-16;z<16.2;z+=2.5) posts.push([44.05,1.15,z,.1,2.3,.1,0]); instanced(UNIT,M.wood,posts);
    const wires=[]; for(const y of [.6,1.2,1.8,2.25]){ wires.push([32.5,y,-16.05,23,.02,.02,0],[44.05,y,0,.02,.02,32,0],[22,y,16.05,2,.02,.02,0],[34.3,y,16.05,19.4,.02,.02,0]); } instanced(UNIT,MAT.darkMetal,wires); }
  const wireMesh=[]; for(const y of [.6,1.2,1.8,2.25]){ const w=addMesh(BOX(1.6,.02,.02),MAT.darkMetal,23.8,y,16.05,null); wireMesh.push(w); }
  drums(23,26,-6,-3.4,1.8); drums(23,25.6,4,7,1.8); drums(36,39.4,-1.6,1,1.8); drums(40,43,10,13,1.8,M.drumG); drums(27.6,30,-14.6,-13,1.8);
  tanker(30,2.6); tanker(38,-6.4);
  addMesh(new T.CylinderGeometry(2.4,2.4,4,16),M.tank,34,2,-11,'metal'); addSolidOnly(31.8,36.2,-13.2,-8.8,4,0,true);
  sandbags(31.6,35.2,8.6,9.4); sandbags(31.6,32.4,9.4,12.2); sandbags(34.4,35.2,9.4,12.2); sandbags(31.6,35.2,12.2,13);
  const flak=new T.Group(); flak.position.set(33.4,1,10.8); const fb=new T.Mesh(new T.CylinderGeometry(.4,.5,.6,10),hm(0x3d443a)); flak.add(fb); const brl=new T.Mesh(new T.CylinderGeometry(.05,.06,2.2,8),hm(0x2a2c28)); brl.position.set(0,.9,.5); brl.rotation.x=.6; flak.add(brl); scene.add(flak);
  for(const [x,z,w,d] of [[24.4,-4.8,4,4],[37.6,-.4,4.4,4]]){ const n=new T.Mesh(new T.PlaneGeometry(w,d),M.net); n.rotation.x=-Math.PI/2; n.position.set(x,2.5,z); scene.add(n); for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) addMesh(BOX(.07,2.5,.07),M.wood,x+a*w/2,1.25,z+b*d/2,'wood'); }
  const flares=[]; for(const [x,z] of [[26.4,-11.8],[41.4,-1.6],[27.6,11.6]]){ addMesh(BOX(.08,.7,.08),M.wood,x,.35,z,'wood'); const f=addMesh(new T.CylinderGeometry(.06,.06,.32,8),M.red,x+.15,.2,z,null); f.rotation.z=1.2; const L=new T.PointLight(0xff3a1a,0,16,1.6); L.position.set(x,1.2,z); scene.add(L); flares.push({x,z,mesh:f,light:L}); }
  // ---- navegação ----
  const N=[];
  for(let x=-46;x<=-23;x+=3) for(let z=-10;z<=10;z+=3) N.push({x,z});
  for(let x=-18.6;x<=18.6;x+=2.4) for(let z=-10;z<=18.6;z+=2.4) N.push({x,z});
  for(let x=-18.6;x<=6.6;x+=2) for(let z=-18.6;z<=-12;z+=2) N.push({x,z});
  for(let x=9.2;x<=19;x+=2) for(let z=-18.6;z<=-8.6;z+=2) N.push({x,z});
  for(let k=1;k<19;k+=2) N.push({x:9+.36*k+.18,z:-7.2}); N.push({x:16.8,z:-7.2},{x:9.3,z:-8.8});
  for(let x=22.2;x<=43;x+=2.6) for(let z=-15;z<=15;z+=2.6) N.push({x,z});
  for(let x=22.4;x<=29.6;x+=2.4) for(let z=17.4;z<=45;z+=2.6) N.push({x,z});
  N.push({x:-22.8,z:0},{x:-18.6,z:0},{x:18.6,z:0},{x:22.2,z:0},{x:23.8,z:15.1},{x:23.8,z:17});
  for(const x of [-15,-5,3]) N.push({x,z:-12},{x,z:-10.2}); for(const x of [11,17]) N.push({x,z:-13.9},{x,z:-12.2}); N.push({x:.65,z:-15.1},{x:6.9,z:-15.1},{x:6.9,z:-12.4},{x:.65,z:-12.4});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=5.2; buildNav();
  return {sun,bar,wire,wireMesh,stamp,radio6,flares,flak,yas:null};
}
function objectives06(){ return [
  {id:'gate',text:'Apresente o salvo-conduto do major na cancela do bordj',state:'active',marker:{x:-24.8,z:0}},
  {id:'photo1',text:'Fotografe o quadro de horários do comboio (sala de operações)',state:'hidden',marker:{x:-5,z:-18.6}},
  {id:'stamp',text:'Carimbe um passe vermelho na secretaria (mesa do comandante)',state:'hidden',marker:{x:-17.3,z:-16.2}},
  {id:'photo2',text:'Fotografe o mapa das baterias antiaéreas (gabinete na torre)',state:'hidden',marker:{x:9,z:-16.6}},
  {id:'radio',text:'Chame o “Farol” no rádio de campo da torre e passe as coordenadas',state:'hidden',marker:{x:17.4,z:-18.6}},
  {id:'flares',text:'Acenda os três sinalizadores no depósito de combustível',state:'hidden',marker:{x:26.4,z:-11.8}},
  {id:'escape',text:'Corte o arame ao sul do depósito e desça o uádi até Yasmina',state:'hidden',marker:{x:23.8,z:16}},
  {id:'cover',text:'Opcional: não seja descoberta antes dos sinalizadores',state:'active',optional:true,autoDone:true},
]; }
function interact06(R){
  const I=W.interactables, F=()=>G.flags;
  for(const [id,x,z,y] of [['dsch',-15,-11.1,0],['dops',-5,-11.1,0],['dcan',3,-11.1,0],['dcmd',11,-13.1,4],['drad',17,-13.1,4]]) I.push(doorInteract(id,V3(x,y+1.2,z)));
  I.push({id:'gate',pt:()=>V3(-24.6,1.4,0),r:2.8,skip:true,
    label:()=>{ if(obj('gate').state==='done') return null; const g=G.enemies.find(e=>e.id==='g1'); return g&&!g.dead&&disguiseOn()?'Apresentar o salvo-conduto do major Kessel':'Levantar a cancela (segure)'; },
    hold:()=>{ const g=G.enemies.find(e=>e.id==='g1'); return g&&!g.dead&&disguiseOn()?0:1; },
    use:()=>{ const g=G.enemies.find(e=>e.id==='g1'); if(g&&!g.dead&&disguiseOn()){ if(!G.player.holster){ g.sus=.6; G.radioMsg('SENTINELA','“Guarde essa arma antes de chegar perto da cancela.”','warn'); return; } G.radioMsg('SENTINELA','“Intérprete da Intendência, assinado pelo major Kessel… Pode passar. O rancho é às oito.”'); }
      const d=W.doors.barrier; d.state='CLOSED'; openDoor(d,null); complete('gate'); activate('photo1'); activate('stamp');
      G.radioMsg('YASMINA','Lá dentro: fotografe o quadro do comboio na sala de operações. Para subir à torre você precisa de um passe vermelho — o carimbo fica na secretaria.','tip'); checkpoint(); }});
  I.push({id:'papers',pt:()=>{ const f=V3(0,0,-1).applyQuaternion(camera.quaternion); return camera.position.clone().addScaledVector(f,.8); },r:3,skip:true,
    label:()=>{ const e=G.inspector; if(!e||e.dead||!disguiseOn()||G.papers||G.escort) return null; const P=G.player; if(Math.hypot(P.pos.x-e.pos.x,P.pos.z-e.pos.z)>3.8) return null; return 'Entregar o passe e o salvo-conduto'; }, use:()=>showPapers(G.inspector)});
  I.push({id:'stamp',pt:()=>V3(-17.3,.9,-16.2),r:2.2,hold:()=>2.4,sus:3,susWhy:'falsificacao',label:()=>F().stamped?null:'Carimbar um passe em branco (segure)',
    use:()=>{ F().stamped=true; G.cred=2; AudioSys.play('stamp'); pickupMsg('Passe vermelho (área restrita)'); complete('stamp'); activate('photo2'); activate('radio'); G.radioMsg('ÉLISE','Carimbo do comandante. Com isto a torre e o depósito estão abertos — enquanto ninguém olhar de perto.'); checkpoint(); }});
  I.push({id:'radio6',pt:()=>V3(17.4,5.1,-19.1),r:2.3,hold:()=>F().radioStage?3.4:2,sus:1.4,susWhy:'sabotagem',
    label:()=>{ if(obj('radio').state!=='active') return null; return F().radioStage?'Transmitir as coordenadas do depósito em código (segure)':'Sintonizar 6.240 kHz — frequência do Farol (segure)'; },
    use:()=>{ if(!F().radioStage){ F().radioStage=1; AudioSys.play('morse'); pickupMsg('Frequência do Farol'); return; } F().radioStage=2; F().morseT=3.2; complete('radio'); AudioSys.play('morse'); checkpoint(); }});
  R.flares.forEach((f,i)=>I.push({id:'flare'+i,pt:()=>V3(f.x,.5,f.z),r:2.2,hold:()=>1.4,sus:2.8,susWhy:'sabotagem',
    label:()=>obj('flares').state==='active'&&!F()['flare'+i]?'Acender o sinalizador (segure)':null,
    use:()=>{ F()['flare'+i]=true; F().flareN=(F().flareN||0)+1; AudioSys.play('flare',V3(f.x,.5,f.z)); emitNoise(V3(f.x,0,f.z),8,'lure',null); pickupMsg('Sinalizador '+F().flareN+'/3');
      const o=obj('flares'); if(F().flareN>=3){ complete('flares'); if(obj('cover').state==='active') complete('cover',true); activate('escape'); F().raidIn=Math.min(F().bombT||22,22); G.radioMsg('FAROL','“Tocha, vemos as três luzes. Saiam daí — bombas em vinte segundos.”','warn'); checkpoint(); }
      else { const nxt=R.flares.findIndex((g,j)=>!F()['flare'+j]); if(nxt>=0){ o.marker={x:R.flares[nxt].x,z:R.flares[nxt].z}; refreshObjectiveUI(); } } }}));
  I.push({id:'wire',pt:()=>V3(23.8,1.2,16.05),r:2.3,hold:()=>2,sus:1.6,susWhy:'sabotagem',label:()=>F().wireCut?null:'Cortar o arame (segure)',
    use:()=>{ F().wireCut=true; R.wire.active=false; for(const w of R.wireMesh) w.visible=false; AudioSys.play('cloth'); buildNav(); if(obj('escape').state==='active'){ const o=obj('escape'); o.marker={x:26,z:42}; refreshObjectiveUI(); } }});
  I.push({id:'truck',pt:()=>V3(26,1.6,42),r:3.2,skip:true,label:()=>obj('escape').state==='active'?'Subir no caminhão de Yasmina':'Yasmina: “Ainda não — a tocha precisa estar acesa.”',locked:()=>obj('escape').state!=='active',
    use:()=>{ if(obj('escape').state==='active') missionComplete(); }});
}
function pickups06(){
  addPickup('b_med1',-12.2,-14.6,'med',30,.85); addPickup('b_pis1',5.4,-16.6,'pistol',8,.82); addPickup('b_sil1',12,-17.6,'silenced',6,4.86);
  addPickup('b_med2',-16,10.8,'med',35,.82); addPickup('b_smg1',17,5.7,'smg',32,1.38); addPickup('b_med3',24.6,-1.6,'med',35,.1); addPickup('b_smg2',40.4,8.4,'smg',32,.1); addPickup('b_med4',26,30,'med',40,.1);
  G.player.holster=true;
}
function photos06(){
  W.photo.push({id:'schedule',label:'Quadro de horários do comboio',pos:V3(-5,1.9,-19.74),normal:V3(0,0,1),max:9,obj:'photo1',size:2.4,msg:'Horários e escolta do comboio de quinta: no filme.'});
  W.photo.push({id:'flak',label:'Mapa das baterias antiaéreas',pos:V3(8.25,5.7,-16.6),normal:V3(1,0,0),max:7,obj:'photo2',size:2,msg:'As baterias antiaéreas do setor sul: os pilotos vão agradecer.'});
}
function startRaid06(){
  const F=G.flags; if(F.raid) return; F.raid=true; G.raidT=0; G.progress=null;
  blowDisguise(null,'raid'); if(!G.alarm) raiseAlarm();
  AudioSys.play('siren',V3(0,5,0),1.2);
  const list=[]; const R=mulberry32(777); for(let i=0;i<18;i++) list.push({t:1.5+i*.55+R()*.3,x:24+R()*19,z:-14+R()*28});
  list.push({t:7.5,x:30,z:2.6,big:1},{t:9.2,x:38,z:-6.4,big:1},{t:11,x:34,z:-11,big:2});
  G.bombs=list; G.bombers=[0,1,2].map(i=>{ const m=bomberMesh(); m.position.set(70+i*12,55+i*4,-30+i*14); m.rotation.y=-Math.PI/2; return m; });
  G.fires=[];
}
function updateRaid06(dt){
  const F=G.flags; G.raidT+=dt; const P=G.player;
  for(const b of G.bombers){ b.position.x-=dt*26; }
  if(Math.random()<dt*3) AudioSys.play('drone',V3(30,40,0),1);
  if(G.raidT<14&&Math.random()<dt*9){ const R=G.refs; R.flak.rotation.y=Math.sin(simTime*3)*.6; const m=V3(33.4,2.2,10.8); const t=V3(m.x+rnd(-20,20),60,m.z+rnd(-20,20)); FX.tracer(m,t); if(Math.random()<.3) AudioSys.play('eshot',m,.5); }
  for(const b of G.bombs){ if(b.done||G.raidT<b.t) continue; b.done=true;
    let x=b.x, z=b.z; if(Math.hypot(P.pos.x-x,P.pos.z-z)<7.5&&!b.big){ continue; }
    explode(V3(x,.3,z),{r:b.big?6:4.6,dmgE:200,dmgP:b.big?60:75,src:'tank',kind:b.big?'wreck':'shell'});
    if(G.fires.length<7) G.fires.push({x,z,L:G.fires.length<3?(()=>{ const l=new T.PointLight(0xff8a3a,2,18,1.6); l.position.set(x,2,z); scene.add(l); return l; })():null}); }
  for(const f of G.fires){ if(Math.random()<dt*6) FX.puff(V3(f.x+rnd(-1,1),1.2,f.z+rnd(-1,1)),1,Math.random()<.5?0xff9a40:0x2a2420,Math.random()<.5?.8:1.6,Math.random()<.5?.6:3,V3(0,1.4,0),.6); if(f.L) f.L.intensity=1.6+Math.random()*.8; }
}
function update06(dt){
  inspectTick(dt);
  const P=G.player, F=G.flags, R=G.refs;
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('YASMINA','Você é a intérprete Morel, da Intendência. Arma guardada (H), passos calmos. Correr, se agachar ou sacar a arma na frente deles levanta suspeita.','tip'); }
  if(!F.i2&&G.introT>9){ F.i2=true; G.radioMsg('DICA','Se um guarda gritar “Documentos!”, pare e mostre o passe (E). O passe branco vale para o pátio e o QG; a torre e o depósito exigem o vermelho.','tip'); }
  if(F.morseT>0){ F.morseT-=dt; if(Math.random()<dt*7) AudioSys.play('morse'); if(F.morseT<=0){ const total=G.diff==='recruta'?300:G.diff==='veterano'?200:240; F.bombT=total; F.bombTotal=total; activate('flares');
      G.radioMsg('FAROL','“Tocha, aqui Farol. Coordenadas recebidas. Bombardeiros decolando — marquem o alvo com três sinalizadores. Chegada em '+Math.round(total/60)+' minutos.”'); checkpoint(); } }
  if(F.bombT>0&&!F.raid){
    if(F.raidIn>0){ F.raidIn-=dt; F.bombT-=dt; if(F.raidIn<=0) startRaid06(); }
    else { F.bombT-=dt; if(F.bombT<=0){ F.bombT=0; missionFail('A tocha não acendeu','Os bombardeiros cruzaram o céu sem encontrar o depósito.'); return; } }
    if(!F.raid){ const s=Math.max(0,F.raidIn>0?F.raidIn:F.bombT); G.progress={label:(F.raidIn>0?'Bombas em ':'Bombardeiros em ')+Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'),v:F.raidIn>0?s/22:s/F.bombTotal}; }
    if(Math.random()<dt*.4&&F.bombT<60) AudioSys.play('drone',V3(60,40,-30),.5);
  }
  if(F.raid) updateRaid06(dt);
  R.flares.forEach((f,i)=>{ if(!F['flare'+i]) return; f.light.intensity=2.4+Math.sin(simTime*23+i)*.5+Math.random()*.6; if(Math.random()<dt*14){ FX.burst(V3(f.x+.15,.3,f.z),1,0xff5030,1.2,.4,2,.4); } if(Math.random()<dt*5) FX.puff(V3(f.x,.6,f.z),1,0xd06a5a,.5,2.2,V3(.3,1,0),.4); });
  if(obj('escape').state==='active'&&F.wireCut){ const o=obj('escape'); if(o.marker.x!==26){ o.marker={x:26,z:42}; refreshObjectiveUI(); } }
  if(disguiseOn()&&!P.holster&&!F.drawHint&&G.introT>3){ F.drawHint=true; showHint('Arma à mostra chama atenção. H guarda a arma.'); }
}
function restore06(s){
  const F=G.flags, R=G.refs; G.cred=F.stamped?2:1; G.disguise={blown:!!F.blown};
  if(obj('gate').state==='done') setDoorOpenInstant(W.doors.barrier);
  if(F.wireCut){ R.wire.active=false; for(const w of R.wireMesh) w.visible=false; }
  G.player.holster=!F.blown;
  if(F.raid){ F.raid=false; startRaid06(); G.raidT=40; for(const b of G.bombs) b.done=true; for(const b of G.bombers) b.position.x=-200; }
}
function drawMap06(g,w,h){
  g.fillStyle='#e6d6b8'; g.fillRect(0,0,w,h); const S=w/76, X=x=>(x+30)*S, Z=z=>(z+26)*S;
  const rect=(x0,x1,z0,z1,fill,stroke)=>{ g.fillStyle=fill; g.fillRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); if(stroke){ g.strokeStyle=stroke; g.lineWidth=2; g.strokeRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); } };
  rect(-21,21,-21,21,'#d2bc98','#4a3a22'); rect(-19.8,7.8,-19.8,-11,'#c4ae88','#4a3a22'); rect(8,19.8,-19.8,-8,'#b8a07a','#4a3a22'); rect(21,44,-16,16,'#ddd0b0','#6a2a1a'); rect(21.6,30.6,16,46,'#cbb894',null);
  g.strokeStyle='#4a3a22'; g.lineWidth=1; for(const x of [-10,0]){ g.beginPath(); g.moveTo(X(x),Z(-19.8)); g.lineTo(X(x),Z(-11)); g.stroke(); } g.beginPath(); g.moveTo(X(13.9),Z(-19.8)); g.lineTo(X(13.9),Z(-13)); g.stroke(); g.beginPath(); g.moveTo(X(8),Z(-13)); g.lineTo(X(19.8),Z(-13)); g.stroke();
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'12px serif'; g.fillText(s,X(x),Z(z)); };
  t('secretaria',-15,-15.4); t('(carimbo)',-15,-14,'italic 11px serif'); t('operações',-5,-15.4); t('cantina',3.8,-15.4); t('gabinete',11,-16.4,'11px serif'); t('rádio',17,-16.4,'11px serif'); t('TORRE',14,-10,'bold 12px serif');
  t('PÁTIO',0,4,'bold 15px serif'); t('rancho',-14.8,13.4); t('barraca',13.6,15.4); t('DEPÓSITO',33,-3,'bold 14px serif'); t('uádi',26,30,'italic 13px serif'); t('cancela',-26,-1.4); t('estrada de Túnis',-42,-2,'italic 12px serif');
  g.fillStyle='#8a2a1a'; for(const [x,z] of [[26.4,-11.8],[41.4,-1.6],[27.6,11.6]]){ g.beginPath(); g.arc(X(x),Z(z),5,0,7); g.fill(); }
  g.font='italic 12px serif'; g.fillText('sinalizadores',36,0); g.strokeStyle='#8a2a1a'; g.lineWidth=2; g.setLineDash([5,4]); g.beginPath(); g.moveTo(X(23.8),Z(16)); g.lineTo(X(26),Z(42)); g.stroke(); g.setLineDash([]); g.fillText('arame — saída',X(23.8)+60,Z(18));
  g.fillStyle='#2a2418'; g.font='11px serif'; g.fillText('passe vermelho: torre e depósito',X(0),Z(-23.5));
}
DOCS.planta06={title:'Bordj el-Hamra',sub:'Croqui de Yasmina — depósito avançado da Intendência',map:'06',body:'',pencil:'Com o passe branco: pátio, QG e cantina. Com o vermelho: torre e depósito. A cancela só abre com o salvo-conduto do major.'};
DOCS.codigos06={title:'Folha de códigos',sub:'OSS · uso único — queimar depois',body:`Você:            TOCHA
Aliados (1º Ex.): FAROL
Frequência:      6.240 kHz, após as 19h30

Mensagem: “Tocha para Farol. Lenha seca
em Bordj el-Hamra. Acendam o fogo.”

Sinal ao alvo: três sinalizadores vermelhos
no depósito de combustível.`,pencil:'Primeiro sintonizar, depois transmitir. A resposta leva alguns segundos.'};
LEVELS['06']={id:'06',num:6,op:'Operação 6',name:'Acendendo a Tocha',place:'Bordj el-Hamra, sul de Túnis',prev:'05',
  loadout:{weapons:['silenced','pistol'],ammo:{silenced:{mag:6,reserve:12},pistol:{mag:8,reserve:16}},cur:'silenced',camera:true},baseLight:.62,lightFn:light06,tropical:true,shadows:true,bloomTh:.86,zoneAt:zone06,
  build:buildLevel06,enemies:ENEMY_DEFS_06,ally:null,start:{x:-44,z:.6,yaw:-Math.PI/2},startDocs:['passe05','planta06','codigos06'],drawMap:drawMap06,
  reinf:[{id:'n1',x:12,z:15,weapon:'smg',helmet:true},{id:'n2',x:15,z:15.5,weapon:'rifle',helmet:true},{id:'n3',x:-14,z:15,weapon:'rifle',helmet:true},{id:'n4',x:-12,z:11,weapon:'smg',helmet:true}],
  radio:{x:17.4,z:-17.6,fx:17.4,fz:-19.1},radioRun:'O oficial corre para o rádio da torre!',alarmPos:V3(17.4,5,-19),alarmText:'Alarme no Bordj el-Hamra! A guarnição sai das barracas.',alarmObjective:null,
  alarmYes:'O bordj inteiro acordou antes da hora. ',alarmNo:'',deathText:'A guarnição do Bordj el-Hamra fechou o cerco.',
  objectives:objectives06,interact:interact06,pickups:pickups06,update:update06,restore:restore06,
  resultTitle:'A tocha acesa',outro:['YASMINA','Olhe para trás — dá para ver o fogo de Túnis. Londres vai ouvir isso antes do amanhecer.'],menuCam:{cx:-36,cz:8,y:3,tx:-20,tz:0},ambient:'medina',
  mist:{n:18,x0:-50,x1:44,z0:-28,z1:28,color:0xd8a888},
  briefing:{meta:'SUL DE TÚNIS — 28 DE ABRIL DE 1943 — 19h40',paras:['O dossiê de Kessel apontou o Bordj el-Hamra: um velho forte de adobe que a Intendência transformou no depósito avançado de combustível do setor sul. O 1º Exército aliado está a poucas dezenas de quilômetros e precisa de um alvo marcado para os bombardeiros noturnos.','Élise entra como intérprete civil da Intendência, com o salvo-conduto do major Kessel. Os guardas não atiram em quem parece pertencer ao lugar — mas observam. Fotografe os horários do comboio e as baterias antiaéreas, consiga um passe vermelho, chame o “Farol” pelo rádio da torre e acenda três sinalizadores no depósito. Depois, saia antes das bombas.'],list:['Passar pela cancela com o salvo-conduto','Fotografar o comboio e o mapa da flak; carimbar um passe vermelho','Rádio para o Farol, três sinalizadores, fuga pelo uádi']}};
LEVEL_ORDER.push('06');

window.__SDP6={blowDisguise,showPapers,startRaid06,toggleHolster,zone06,takePhoto,photoCandidate};

/* =========================================================
   OPERAÇÃO 7 — Oued el-Kebir (madrugada, 29/04/1943)
   cargas de demolição, caminhões com zonas de dano,
   explosões em cadeia e partida do comboio ao amanhecer
   ========================================================= */
let M7=null;
function mats07(){
  tex05(); const HQ=MAT_HQ;
  const L=(o,ex)=>{ if(!HQ) return new T.MeshLambertMaterial(o); return new T.MeshPhongMaterial(Object.assign({shininess:14,specular:0x1a1a1a},o,ex||{})); };
  if(!TEX.tank7){ TEX.tank7=textTex(512,512,(g,w,h)=>{ const R=mulberry32(707); g.fillStyle='#b49c6c'; g.fillRect(0,0,w,h);
    for(let i=0;i<2200;i++){ g.fillStyle=R()<.5?`rgba(60,48,30,${R()*.12})`:`rgba(255,240,200,${R()*.08})`; g.fillRect(R()*w,R()*h,2+R()*10,1+R()*3); }
    for(let i=0;i<14;i++){ g.fillStyle=`rgba(40,30,18,${.05+R()*.08})`; g.fillRect(R()*w,0,3+R()*8,h); }
    g.strokeStyle='rgba(40,30,20,.5)'; g.lineWidth=2; for(let x=w/6;x<w;x+=w/6){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
    g.textAlign='center'; for(const y0 of [96,352]){ g.fillStyle='#8a2a1a'; g.fillRect(40,y0+22,w-80,30); g.fillStyle='#e8dcc0'; g.font='bold 24px monospace'; g.fillText('FEUERGEFÄHRLICH',w/2,y0+46); g.fillStyle='#2a2418'; g.font='bold 26px monospace'; g.fillText('KRAFTSTOFF  4500 L',w/2,y0+8); g.font='bold 18px monospace'; g.fillText('WH-1427 · Nachsch.Kp.309',w/2,y0+80); } });
    TEX.tank7.center.set(.5,.5); TEX.tank7.rotation=Math.PI/2; }
  if(!TEX.tin7) TEX.tin7=canvasTex(128,128,(g,w,h)=>{ const R=mulberry32(717); g.fillStyle='#8a8476'; g.fillRect(0,0,w,h); for(let x=0;x<w;x+=8){ g.fillStyle='rgba(255,255,255,.08)'; g.fillRect(x,0,3,h); g.fillStyle='rgba(0,0,0,.14)'; g.fillRect(x+4,0,3,h); }
    for(let i=0;i<120;i++){ g.fillStyle=`rgba(${110+R()*40|0},${60+R()*20|0},30,${R()*.25})`; g.fillRect(R()*w,R()*h,2+R()*6,2+R()*12); } },3);
  return {tank:L({map:TEX.tank7},{shininess:30,specular:0x2a2a2a}), cab:L({color:0xb09a6a}), chassis:L({color:0x2a2824}), grille:L({color:0x3a3830}),
    glass:L({color:0x16202a},{shininess:40,specular:0x1e2830}), charred:L({color:0x1c1a18},{shininess:2,specular:0x000000}), tin:L({map:TEX.tin7}), tinD:L({map:TEX.tin7,color:0x9a9488}),
    concrete:L({map:TEX.lime5,color:0xb8b0a0}), charge:L({color:0x6a5a3a}), wire:new T.MeshBasicMaterial({color:0x1a1a1a}), fuel:new T.MeshBasicMaterial({color:0x14110c,transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),
    hose:L({color:0x1e1e1c}), tower:L({color:0x9a9a92},{shininess:40,specular:0x444444}), key:L({color:0xc8a040},{shininess:60,specular:0x886622}), book:L({color:0x2a3a5a}), red:new T.MeshBasicMaterial({color:0xff3a20})};
}
function t2w(t,lx,ly,lz){ const c=Math.cos(t.yaw), s=Math.sin(t.yaw); return V3(t.x+lx*c+lz*s,ly,t.z-lx*s+lz*c); }
function truckBox07(t){ let a=1e9,b=-1e9,c=1e9,d=-1e9; for(const [lx,lz] of [[-1.2,-3.8],[1.2,-3.8],[-1.2,4.45],[1.2,4.45]]){ const p=t2w(t,lx,0,lz); a=Math.min(a,p.x); b=Math.max(b,p.x); c=Math.min(c,p.z); d=Math.max(d,p.z); } Object.assign(t.solid,{minX:a,maxX:b,minZ:c,maxZ:d,minY:0,maxY:3.05}); }
function makeTanker07(i,x,z,yaw){
  const M=M7, g=new T.Group(); g.position.set(x,0,z); g.rotation.y=yaw; scene.add(g);
  const t={i,id:'T'+(i+1),g,x,z,yaw,state:'PARKED',tankHp:160,engHp:90,cabHp:46,flat:0,leak:0,charge:false,speed:0,pathI:0,burnT:0,smokeT:0,startT:0,honkT:0,disc:0,fireLeft:0};
  const part=(geo,mat,px,py,pz,zone,surf)=>{ const m=new T.Mesh(geo,mat); m.position.set(px,py,pz); m.userData.mat=surf||'metal'; g.add(m); W.shootables.push(m); if(zone) m.userData.zoneHit=(h,o)=>truckHit07(t,zone,h,o,m); return m; };
  part(BOX(2.0,.32,8.1),M.chassis,0,.8,.3,null);
  t.tank=part(new T.CylinderGeometry(1.02,1.02,5.0,18),M.tank,0,2.0,-1.25,'tank'); t.tank.rotation.x=Math.PI/2; t.tank.rotation.y=Math.PI/2;
  part(BOX(.5,.08,4.8),M.chassis,0,3.06,-1.25,'tank'); part(new T.CylinderGeometry(.24,.24,.18,10),M.chassis,0,3.1,-.2,'tank');
  for(const zz of [-3.5,1.0]) part(BOX(2.06,2.06,.12),M.chassis,0,2.0,zz,null);
  t.cab=part(BOX(2.24,1.45,1.7),M.cab,0,1.72,2.45,'cab'); part(BOX(2.3,.1,1.8),M.cab,0,2.5,2.45,'cab');
  t.wind=part(BOX(1.9,.55,.05),M.glass,0,2.12,3.31,'cab','glass');
  for(const s of [-1,1]) part(BOX(.05,.5,.8),M.glass,s*1.13,2.12,2.5,'cab','glass');
  t.hood=part(BOX(1.6,.82,1.1),M.cab,0,1.36,3.86,'engine'); part(BOX(1.3,.62,.05),M.grille,0,1.34,4.43,'engine');
  for(const s of [-1,1]){ part(BOX(.5,.14,1.1),M.cab,s*1.0,1.0,3.76,null); const hl=new T.Mesh(new T.CylinderGeometry(.11,.11,.08,10),hm(0xd8d0a0)); hl.rotation.x=Math.PI/2; hl.position.set(s*.62,1.6,4.43); g.add(hl); }
  part(BOX(.06,1.6,.06),M.chassis,-.8,2.2,1.2,null);
  t.tires=[]; [[-1.02,-3.05],[1.02,-3.05],[-1.02,-1.85],[1.02,-1.85],[-1.0,3.62],[1.0,3.62]].forEach(([px,pz],k)=>{ const w=part(new T.CylinderGeometry(.46,.46,.3,12),MAT.tire,px,.46,pz,'tire'+k,'metal'); w.rotation.z=Math.PI/2; w.flat=false; t.tires.push(w); });
  const ch=new T.Group(); ch.position.set(-.98,1.5,-1.7); g.add(ch); const cb=new T.Mesh(BOX(.16,.3,.4),M.charge); ch.add(cb); const cd=new T.Mesh(new T.CylinderGeometry(.03,.03,.16,6),hm(0x8a8070)); cd.position.set(-.09,.12,.1); cd.rotation.z=Math.PI/2; ch.add(cd); const cw=new T.Mesh(BOX(.02,1.1,.02),M.wire); cw.position.set(-.06,-.66,.15); ch.add(cw); ch.visible=false; t.ch=ch;
  t.fireL=new T.PointLight(0xff7a2a,0,22,1.6); t.fireL.position.set(0,3.2,-1); g.add(t.fireL);
  tankerDecor07(g); t.solid=addSolidOnly(0,0,0,0,3.05,0,true); t.solid.truck=t; truckBox07(t);
  return t;
}
function setTruckPose07(t){ t.g.position.set(t.x,0,t.z); t.g.rotation.y=t.yaw; truckBox07(t); }
function flatTire07(t,w){ if(w.flat) return; w.flat=true; w.scale.x=.7; w.position.y=.34; t.flat++; }
function truckHit07(t,zone,h,o,mesh){
  if(t.state==='WRECK'||t.state==='GONE') return; const isP=o.shooter==='player';
  const dmg=computeDamage(o.weapon.dmg,h.distance,o.weapon.falloff,1); const F=G.flags;
  if(isP) hitMarker('equip');
  if(zone==='tank'){
    const pre=t.tankHp; t.tankHp-=dmg; AudioSys.play('clank',h.point,.8); FX.burst(h.point,5,0xffd080,3,.2,3); emitNoise(h.point,7,'glass',null);
    if(t.tankHp<115) startLeak07(t,h.point);
    if(t.state!=='BURNING'){ if(t.tankHp<=0&&(pre>0?Math.random()<.25:Math.random()<.3)){ ignite07(t,1.6); if(isP) limbTag('TANQUE · pegou fogo'); }
      else if(isP) limbTag(t.tankHp<=0?'TANQUE · rompido':t.leak?'TANQUE · vazando':'TANQUE'); }
  } else if(zone==='engine'){
    t.engHp-=dmg; AudioSys.play('metal',h.point,.9); FX.burst(h.point,6,0xffd080,3.5,.2,3);
    if(t.engHp<=0&&!t.engDead){ t.engDead=true; if(isP) limbTag('MOTOR · fora de combate'); if(t.state==='DRIVING'||t.state==='STARTING') stopTruck07(t); syncTrucks07(); }
    else if(isP&&!t.engDead) limbTag('MOTOR');
  } else if(zone==='cab'){
    if(mesh.userData.mat==='glass'&&mesh.visible){ mesh.visible=false; FX.burst(h.point,14,0xd8eef4,2.6,.7); AudioSys.play('glass',h.point,.9); }
    if(t.state==='DRIVING'||t.state==='STARTING'){ t.cabHp-=dmg*1.3; if(t.cabHp<=0&&!t.driverDead){ t.driverDead=true; stopTruck07(t); if(isP){ limbTag('MOTORISTA ABATIDO'); G.stats.hits++; } syncTrucks07(); } else if(isP) limbTag('CABINE'); }
    else if(isP) limbTag('CABINE · vazia');
  } else if(zone.startsWith('tire')){
    const w=t.tires[+zone.slice(4)]; AudioSys.play('cloth',h.point,.7);
    if(!w.flat&&dmg>=14){ flatTire07(t,w); AudioSys.play('hiss',h.point,.9); emitNoise(h.point,6,'step',null); FX.puff(h.point,2,0x8a8478,.5,.7,V3(0,.4,0),.4);
      if(t.flat>=2&&!t.tiresOut){ t.tiresOut=true; if(isP) limbTag('PNEUS · imobilizado'); if(t.state==='DRIVING'||t.state==='STARTING') stopTruck07(t); } else if(isP) limbTag('PNEU · furado');
      syncTrucks07(); }
    else if(isP) limbTag('PNEU');
  }
}
function startLeak07(t,p){
  if(t.leak) return; t.leak=1; const loc=t.g.worldToLocal(p.clone()); t.leakL=[Math.sign(loc.x||1)*1.0,Math.max(1.3,Math.min(2.6,loc.y)),clamp(loc.z,-3.4,.8)];
  const pd=new T.Mesh(new T.CircleGeometry(1,20),M7.fuel); pd.rotation.x=-Math.PI/2; const lp=t2w(t,t.leakL[0]*1.4,0,t.leakL[2]); pd.position.set(lp.x,.03,lp.z); pd.scale.setScalar(.2); scene.add(pd); t.puddle=pd;
  AudioSys.play('leak',p,1); syncTrucks07();
}
function ignite07(t,delay){
  if(t.state==='BURNING'||t.state==='WRECK'||t.state==='GONE') return;
  if(t.state==='DRIVING'||t.state==='STARTING') t.driverDead=true;
  t.prev=t.state; t.state='BURNING'; t.burnT=delay===undefined?2.4:delay; AudioSys.play('flare',t2w(t,0,2,-1.2),.9); t.fireL.intensity=1.2;
  if(G.flags.valve&&t.i===2) startTrail07();
}
function stopTruck07(t){ if(t.state==='DRIVING'||t.state==='STARTING'){ t.state='STOPPED'; AudioSys.play('clank',t2w(t,0,1.4,3.8),.7); } }
function wreckVisual07(t){
  for(const m of [t.tank,t.cab,t.hood]) m.material=M7.charred; t.g.traverse(o=>{ if(o.isMesh&&o.material===M7.cab) o.material=M7.charred; });
  t.g.traverse(o=>{ if(o.isMesh&&o.material===M7.glass) o.visible=false; }); t.ch.visible=false; t.tank.position.y=1.78; t.tank.rotation.z=.12; t.g.rotation.z=(t.i%2?1:-1)*.05; for(const w of t.tires) flatTire07(t,w);
  if(t.puddle) t.puddle.visible=false; t.fireL.intensity=2; t.fireLeft=150;
}
function truckExplode07(t){
  if(t.state==='WRECK'||t.state==='GONE') return; t.state='WRECK'; t.speed=0; t.charge=false;
  const p=t2w(t,0,1.9,-1.25);
  explode(p,{r:9.5,dmgE:320,dmgP:125,src:'player',kind:'wreck'});
  AudioSys.play('fireball',p,1.4);
  for(let k=0;k<5;k++) FX.puff(V3(p.x+rnd(-1.6,1.6),p.y+.6+k*1.1,p.z+rnd(-1.6,1.6)),2,k<2?0xffc060:k<4?0xff7a28:0x8a3a18,2.8-k*.25,.8+k*.3,V3(rnd(-.4,.4),2.6+k*.9,rnd(-.4,.4)),.9);
  FX.puff(V3(p.x,p.y+3.4,p.z),6,0x262220,3.4,6,V3(0,2.4,0),.62); FX.burst(p,34,0xffc060,13,1.3,9,1.5);
  scorchMark(V3(t.x,.02,t.z),3.4); wreckVisual07(t);
  if(settings.shake){ const P=G.player; P.shake=Math.min(1.6,P.shake+clamp(1-Math.hypot(P.pos.x-p.x,P.pos.z-p.z)/60,0,1)*1.2); }
  syncTrucks07(); onWreck07();
}
function onWreck07(){
  const R=G.refs, n=R.trucks.filter(t=>t.state==='WRECK').length, o=obj('trucks');
  if(o){ o.text='Destrua os caminhões-tanque restantes ('+n+'/4)'; refreshObjectiveUI(); }
  refreshCharges07();
  if(n>=4){ for(const id of ['charges','detonate']) if(obj(id).state!=='done') complete(id,true); complete('trucks',true); refreshObjectiveUI(true); AudioSys.play('objective');
    G.flags.allWrecked=true;
    if(obj('cipher').state==='done') activate('escape'); else G.radioMsg('YASMINA','Os quatro estão queimando! Mas o livro de cifras — sem a foto, Londres continua surda. Galpão B, rápido.','warn');
    G.flags.cpWreck=1.5; }
}
/* tambores e tanque elevado */
function drums07(id,x0,x1,z0,z1,h,mat){
  const solid=addSolidOnly(x0,x1,z0,z1,h,0,true); const list=[]; for(let x=x0+.32;x<x1-.1;x+=.64) for(let z=z0+.32;z<z1-.1;z+=.64) for(let y=0;y<h-.1;y+=.92) list.push([x,y+.45,z,.6,.9,.6,0]);
  const im=instanced(new T.CylinderGeometry(.5,.5,1,10),mat,list); const s={id,x:(x0+x1)/2,z:(z0+z1)/2,hp:150,state:'OK',t:0,solid,im};
  if(im){ im.userData.mat='metal'; im.userData.zoneHit=(h,o)=>{ if(s.state!=='OK') return; s.hp-=computeDamage(o.weapon.dmg,h.distance,o.weapon.falloff,1); AudioSys.play('clank',h.point,.7); emitNoise(h.point,7,'glass',null); if(o.shooter==='player'){ hitMarker('equip'); limbTag(s.hp<60?'TAMBORES · vazando':'TAMBORES'); } if(s.hp<=0) igniteDrums07(s,1.8); else if(s.hp<60&&Math.random()<.5) FX.burst(h.point,4,0x3a3020,1,.6,6); }; W.shootables.push(im); }
  return s;
}
function igniteDrums07(s,delay){ if(s.state!=='OK') return; s.state='BURN'; s.t=delay; AudioSys.play('flare',V3(s.x,1,s.z),.7); }
function drumsExplode07(s){
  s.state='GONE'; if(s.im) s.im.visible=false; s.solid.active=false; G.flags['drums_'+s.id]=true;
  explode(V3(s.x,.9,s.z),{r:6.5,dmgE:230,dmgP:90,src:'player',kind:'shell'}); AudioSys.play('fireball',V3(s.x,1,s.z),1);
  for(let k=0;k<3;k++) FX.puff(V3(s.x,1+k,s.z),2,k<2?0xffa040:0x5a2a14,2-k*.2,.8+k*.3,V3(0,2.4+k,0),.85);
  scorchMark(V3(s.x,.02,s.z),2.4); s.fireLeft=60;
}
function towerExplode07(){
  const W_=G.refs.tower; if(W_.state==='GONE') return; W_.state='GONE'; G.flags.towerGone=true; W_.charge=false;
  const p=V3(28,5.4,-18); explode(p,{r:13,dmgE:420,dmgP:150,src:'player',kind:'wreck'}); AudioSys.play('fireball',p,2);
  for(let k=0;k<8;k++) FX.puff(V3(p.x+rnd(-2.4,2.4),p.y+k*1.4,p.z+rnd(-2.4,2.4)),3,k<3?0xffd070:k<6?0xff7a20:0x7a3010,4-k*.25,1+k*.35,V3(rnd(-.6,.6),3+k*1.1,rnd(-.6,.6)),.95);
  FX.puff(V3(p.x,p.y+8,p.z),10,0x221e1c,5,8,V3(0,3,0),.7); FX.burst(p,60,0xffc060,16,1.6,9,1.8);
  towerWreck07(); complete('tower'); G.radioMsg('YASMINA','O tanque elevado também! Isso foi ouvido em Kairouan.');
  if(settings.shake) G.player.shake=Math.min(1.8,G.player.shake+1.2); syncTrucks07();
}
function towerWreck07(){ const W_=G.refs.tower; W_.tankM.visible=false; W_.wreckM.visible=true; for(const l of W_.legs) l.rotation.z=rnd(-.25,.25); W_.fireL.intensity=2.4; W_.fireLeft=200; W_.ch.visible=false; scorchMark(V3(28,.02,-18),4.5); }
function startTrail07(){ const F=G.flags; if(F.trail||G.refs.tower.state==='GONE') return; F.trail=true; G.trailT07=0; G.radioMsg('ÉLISE','O fogo pegou na mangueira — está correndo para o tanque elevado!','warn'); }
function onExplode07(pos,o){
  const R=G.refs; if(!R||!R.trucks) return; const r=o.r||5; const pow=o.kind==='wreck'?240:o.kind==='shell'?200:o.kind==='nade'?150:130; const reach=r+2.5;
  for(const t of R.trucks){ if(t.state==='WRECK'||t.state==='GONE') continue; const c=t2w(t,0,1.6,-1.25); const d=Math.max(0,Math.hypot(c.x-pos.x,c.z-pos.z)-1.1); if(d>reach) continue; const f=1-d/reach;
    const wasLeak=!!t.leak||t.tankHp<=0; t.tankHp-=pow*f; t.engHp-=pow*f*.5;
    if(f>.5) for(const w of t.tires) if(Math.random()<f) flatTire07(t,w); if(t.flat>=2) t.tiresOut=true; if(t.engHp<=0) t.engDead=true;
    if(t.tankHp<115) startLeak07(t,c);
    if(t.state==='BURNING') { t.burnT=Math.min(t.burnT,.4); continue; }
    if(t.charge&&f>.4) ignite07(t,.15);
    else if(f>.6||(wasLeak&&f>.25)||t.tankHp<=-60) ignite07(t,.5+Math.random()*1.1);
    else if(t.state==='DRIVING'&&(t.engDead||t.tiresOut)) stopTruck07(t);
  }
  for(const s of R.drums){ if(s.state!=='OK') continue; const d=Math.max(0,Math.hypot(s.x-pos.x,s.z-pos.z)-1); if(d>r*.85) continue; s.hp-=pow*(1-d/(r*.85)); if(s.hp<=0) igniteDrums07(s,.45+Math.random()*.5); }
  const T_=R.tower; if(T_.state!=='GONE'){ const d=Math.max(0,Math.hypot(28-pos.x,-18-pos.z)-1.6); if(d<r+1){ const f=1-d/(r+1); T_.hp-=pow*f; if(T_.charge&&f>.3) T_.burnT=Math.min(T_.burnT||9,.2); else if(T_.hp<=0||f>.5){ if(!(T_.burnT>0)) T_.burnT=.8+Math.random(); } } }
}
/* gerador e holofotes */
function powerOff07(silent){
  const F=G.flags; F.power=false;
  for(const L of G.refs.floods){ L.broken=true; L.light.intensity=0; if(L.cone) L.cone.visible=false; L.lantern.material=hm(0x2a2824); }
  if(!silent){ AudioSys.play('clank',V3(-13.5,1,2.2)); emitNoise(V3(-13.5,0,2.2),12,'lure',null); G.radioMsg('ÉLISE','Gerador desligado. O pátio dos caminhões ficou no escuro — alguém vai vir ver.','tip'); }
}
/* plantio, detonação e partida */
function refreshCharges07(){
  const R=G.refs, F=G.flags, o=obj('charges'); if(!o) return;
  const covered=R.trucks.filter(t=>t.charge||t.state==='WRECK').length;
  o.text='Plante cargas nos caminhões-tanque ('+covered+'/4)';
  if(o.state==='active'){ const nx=nearestTruck07(t=>!t.charge&&t.state!=='WRECK'&&t.state!=='GONE'); if(nx){ const p=t2w(nx,-1.4,0,-1.7); o.marker={x:p.x,z:p.z}; } }
  if(covered>=4&&o.state==='active'){ complete('charges'); if(!G.alarm&&obj('quiet').state==='active') complete('quiet');
    const planted=R.trucks.filter(t=>t.charge).length; if(planted>0&&!F.detonated){ activate('detonate'); G.radioMsg('YASMINA','Quatro cargas. Volte ao bueiro e acione o detonador — de longe, Élise.'); } }
  refreshObjectiveUI();
}
function nearestTruck07(pred){ const P=G.player.pos; let b=null,bd=1e9; for(const t of G.refs.trucks){ if(!pred(t)) continue; const d=Math.hypot(t.x-P.x,t.z-P.z); if(d<bd){ bd=d; b=t; } } return b; }
function plantCharge07(t){
  const F=G.flags; if(!(F.charges>0)||t.charge) return; F.charges--; t.charge=true; t.ch.visible=true; AudioSys.play('cloth'); AudioSys.play('unlock');
  pickupMsg('Carga plantada · caminhão '+(t.i+1)); F.planted=(F.planted||0)+1;
  if(F.planted===1) G.radioMsg('YASMINA','Boa. A espoleta está ligada ao fio do bueiro. Atenção: uma sentinela com luz que passe colada no tanque vai ver a carga.','tip');
  syncTrucks07(); refreshCharges07(); cp07();
}
function detonate07(){
  const F=G.flags, R=G.refs; if(F.detonated) return;
  const list=R.trucks.filter(t=>t.charge&&t.state!=='WRECK'&&t.state!=='GONE').sort((a,b)=>a.i-b.i);
  if(R.tower.charge&&R.tower.state!=='GONE') list.push(R.tower);
  if(!list.length){ showHint('Nenhuma carga ligada ao fio.'); return; }
  F.detonated=true; complete('detonate'); AudioSys.play('clank'); AudioSys.play('stamp');
  G.radioMsg('ÉLISE','Fogo.');
  G.seq07=list.map((t,k)=>({t:.6+k*.8,fn:()=>{ if(t===R.tower){ R.tower.burnT=.05; return; } const p=t2w(t,-1.05,1.5,-1.7); FX.burst(p,16,0xffe0a0,7,.25,4,1); ignite07(t,.04); }}));
  const last=.6+list.length*.8;
  G.seq07.push({t:last+1.4,fn:()=>{ if(!G.alarm) raiseAlarm(); }});
  G.seq07.push({t:last+3.2,fn:()=>{ const n=R.trucks.filter(t=>t.state==='WRECK').length; if(n<4){ activate('trucks'); onWreck07(); G.radioMsg('YASMINA','Ainda há caminhão inteiro! Fure o tanque, use granada, atire nos tambores ao lado — não deixe sair pelo portão.','warn'); } else G.radioMsg('YASMINA','Dá para ver daqui! Quatro colunas de fogo. Saia daí — o acampamento inteiro acordou.'); cp07(); }});
  G.seqT07=0; syncTrucks07();
}
function truckPath07(t){ return [[t.homeX,-10],[1.2,-19.5],[0,-29],[0,-40],[0,-60]]; }
function startTruck07(t){ t.state='STARTING'; t.startT=2.4; t.pathI=0; AudioSys.play('engine',t2w(t,0,1,3),1); if(t.i===2&&G.flags.valve&&!G.flags.trail){ G.refs.hoseEnd.visible=false; } syncTrucks07(); }
function driveTruck07(t,dt){
  const path=truckPath07(t), wp=path[Math.min(t.pathI,path.length-1)];
  const P=G.player; const fwd=V3(Math.sin(t.yaw),0,Math.cos(t.yaw));
  const look=4.6+t.speed*.5, fx=t.x+fwd.x*look, fz=t.z+fwd.z*look, nx=t.x+fwd.x*3.2, nz=t.z+fwd.z*3.2;
  let blocked=false; const segD=(px,pz)=>{ const ax=nx,az=nz,bx=fx,bz=fz,dx=bx-ax,dz=bz-az; const k=clamp(((px-ax)*dx+(pz-az)*dz)/(dx*dx+dz*dz),0,1); return Math.hypot(px-(ax+dx*k),pz-(az+dz*k)); };
  if(!P.dead&&segD(P.pos.x,P.pos.z)<1.9) blocked=true;
  for(const e of G.enemies){ if(!e.dead&&segD(e.pos.x,e.pos.z)<1.6){ blocked=true; break; } }
  for(const o of G.refs.trucks){ if(o===t||o.state==='GONE') continue; const s=o.solid; if(fx>s.minX-.6&&fx<s.maxX+.6&&fz>s.minZ-.6&&fz<s.maxZ+.6){ blocked=true; break; } }
  const gate=W.doors.gate; if(gate&&gate.state==='CLOSED'&&t.z<-14&&Math.abs(t.x)<6){ openDoor(gate,null); }
  if(gate&&(gate.state==='CLOSED'||gate.state==='OPENING')&&t.z<-24&&t.z>-31) blocked=true;
  const vmax=G.diff==='veterano'?6.2:G.diff==='recruta'?4.6:5.4;
  t.speed=blocked?Math.max(0,t.speed-dt*9):Math.min(vmax,t.speed+dt*1.6);
  if(blocked){ t.honkT-=dt; if(t.honkT<=0&&t.speed<.5){ t.honkT=2.4; AudioSys.play('honk',t2w(t,0,1.5,4),1); } }
  const want=Math.atan2(wp[0]-t.x,wp[1]-t.z); const turn=clamp(angDiff(t.yaw,want),-1,1)*Math.min(1.1,.3+t.speed*.22)*dt; t.yaw+=turn;
  t.x+=Math.sin(t.yaw)*t.speed*dt; t.z+=Math.cos(t.yaw)*t.speed*dt; setTruckPose07(t);
  if(Math.hypot(wp[0]-t.x,wp[1]-t.z)<2.6) t.pathI++;
  t.engT=(t.engT||0)-dt; if(t.engT<=0){ t.engT=.34; AudioSys.play('engine',t2w(t,0,1,3),.8); }
  if(Math.random()<dt*6) FX.puff(t2w(t,.7,.5,-3.9),1,0x3a3632,.5,1.4,V3(0,.5,0),.35);
  for(const w of t.tires) if(!w.flat) w.rotation.x+=t.speed*dt/.46;
  if(t.z<-52){ t.state='GONE'; t.g.visible=false; t.solid.active=false; syncTrucks07(); missionFail('O comboio partiu','Um caminhão-tanque cruzou o portão de Oued el-Kebir. O combustível chegou ao front.'); }
}
function syncTrucks07(){
  const R=G.refs; if(!R||!R.trucks) return;
  G.flags.trk=JSON.stringify(R.trucks.map(t=>({s:t.state,x:+t.x.toFixed(2),z:+t.z.toFixed(2),y:+t.yaw.toFixed(3),th:Math.round(t.tankHp),eh:Math.round(t.engHp),fl:t.tires.map(w=>w.flat?1:0),c:t.charge?1:0,lk:t.leak?1:0,pi:t.pathI,dd:t.driverDead?1:0,ed:t.engDead?1:0})));
  G.flags.twr=JSON.stringify({s:R.tower.state,hp:Math.round(R.tower.hp),c:R.tower.charge?1:0});
}
function cp07(){ syncTrucks07(); checkpoint(); }
/* ---- dados ---- */
const ENEMY_DEFS_07=[
  {id:'g1',x:-3.6,z:-32,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'g2',x:4,z:-26.6,yaw:.3,weapon:'smg',helmet:true},
  {id:'t1',x:-27.5,z:-27.5,yaw:Math.PI/4,weapon:'rifle',helmet:true,fixed:true},
  {id:'t2',x:31.5,z:23.5,yaw:-2.2,weapon:'rifle',helmet:true,fixed:true},
  {id:'p1',x:-27,z:10,weapon:'rifle',helmet:true,lantern:true,patrol:[[-27,10],[-27,-11],[-12.4,-11],[-11.8,-2],[-12.4,8.8],[-20,10.4]]},
  {id:'p2',x:5.5,z:-2.6,weapon:'smg',lantern:true,patrol:[[5.5,-2.6],[5.5,10.4],[16,10.4],[26.6,10.4],[26.6,-2.6],[16,-2.6]]},
  {id:'p3',x:31.5,z:-24,weapon:'rifle',helmet:true,patrol:[[31.5,-24],[31.5,-6],[31.5,19],[31.5,-6]]},
  {id:'a1',x:-12.6,z:-17.4,yaw:.5,weapon:'rifle',helmet:true},
  {id:'rt',x:-2.7,z:15.6,yaw:Math.PI/2,weapon:'pistol'},
  {id:'ob',x:-8.8,z:16.6,weapon:'pistol',officer:true,patrol:[[-8.8,16.6],[-5.6,15],[-3.5,13.4],[-3.5,10.2],[-6.4,8.4],[-3.5,10.2],[-3.5,13.4],[-5.6,15]]},
  {id:'fw',x:-22.6,z:6,weapon:'pistol',officer:true,patrol:[[-22.6,6],[-20.6,5],[-17,5],[-15.4,3.6],[-17,5],[-20.6,5]]},
  {id:'m1',x:24.2,z:-1.6,yaw:0,weapon:'rifle'},
  {id:'d1',x:20.4,z:18.8,yaw:0,weapon:'rifle',sleep:true},
  {id:'d2',x:25.2,z:18.8,yaw:0,weapon:'smg',sleep:true},
  {id:'s1',x:-10.2,z:-24.2,yaw:0,weapon:'rifle',sleep:true},
  {id:'s2',x:-6,z:-24.2,yaw:0,weapon:'rifle',helmet:true,sleep:true},
];
let DAWN07=0;
function light07(x,z){
  let l=lerp(.2,.58,DAWN07);
  if(x>-26&&x<-14&&z>-24&&z<-14) l=Math.min(l,.18);
  else if(x>-12&&x<-1&&z>12&&z<22) l=Math.min(l,.3);
  else if(x>-26&&x<-19&&z>2&&z<8) l=Math.min(l,.26);
  const R=G.refs; if(R&&R.trucks){ for(const t of R.trucks) if((t.state==='WRECK'&&t.fireLeft>0)||t.state==='BURNING'){ const d=Math.hypot(x-t.x,z-t.z); if(d<12) l=Math.max(l,.82*(1-d/12)+.2); } if(R.tower&&R.tower.fireLeft>0){ const d=Math.hypot(x-28,z+18); if(d<16) l=Math.max(l,.85*(1-d/16)+.2); } }
  return l;
}
function applyDawn07(k){
  DAWN07=k; const R=G.refs; if(!R.hemi) return;
  const c=(a,b)=>new T.Color(a).lerp(new T.Color(b),k);
  R.hemi.color.copy(c(0x56648a,0xb0b4c8)); R.hemi.groundColor.copy(c(0x221e1c,0x6a5040)); R.hemi.intensity=lerp(.4,.62,k);
  R.amb.color.copy(c(0x262c3e,0x5a4a48)); R.amb.intensity=lerp(.22,.3,k);
  R.sun.color.copy(c(0x7a8ac0,0xffb070)); R.sun.intensity=lerp(.24,.95,k*k);
  R.sun.position.set(lerp(-38,74,k)+2,lerp(52,12,k),lerp(26,-6,k));
  scene.fog.color.copy(c(0x101622,0xa08070)); scene.fog.density=lerp(.017,.0095,k); scene.background.copy(scene.fog.color);
  if(R.dawnSky) R.dawnSky.material.opacity=clamp(k*1.25-.1,0,1);
}
function buildLevel07(){
  M5=mats05(); M6=mats06(); M7=mats07(); const M=M6, Q=M7; DAWN07=0;
  scene.background=new T.Color(0x101622); scene.fog=new T.FogExp2(0x101622,.017);
  skyDome(707,[[0,'#04070f'],[.3,'#0c1226'],[.45,'#1c2238'],[.5,'#2e2c3c'],[.53,'#1a1a20'],[1,'#0e0c0c']],[300,150,16],8);
  const dawnSky=skyDome(708,[[0,'#2a3a5c'],[.3,'#5a6488'],[.43,'#c08a7a'],[.49,'#f6b06a'],[.52,'#d8905a'],[.55,'#5a4234'],[1,'#3a2a22']],null,14);
  dawnSky.scale.setScalar(.96); dawnSky.material.transparent=true; dawnSky.material.opacity=0;
  const hemi=new T.HemisphereLight(0x56648a,0x221e1c,.4); scene.add(hemi);
  const sun=new T.DirectionalLight(0x7a8ac0,.24); sun.target.position.set(2,0,0); sun.position.set(-36,52,26); scene.add(sun); scene.add(sun.target);
  const amb=new T.AmbientLight(0x262c3e,.22); scene.add(amb);
  // ---- terreno ----
  floorPlane(130,140,-8,-8,M.sand,'stone',0);
  floorPlane(16,96,-45,4,M.dune,'stone',.008); floorPlane(64,56,2,-2,M.road,'stone',.014); floorPlane(7,40,0,-50,M.road,'stone',.012);
  const rock=(x0,x1,z0,z1,h)=>addBlock(x0,x1,z0,z1,h,{mat:M.rock,surf:'stone',top:M.rock,seg:4});
  rock(-62,48,-78,-70,7); rock(-62,-56,-70,58,7); rock(-62,48,52,58,6); rock(42,48,-70,52,7);
  rock(-56,-52,-70,52,4.2); rock(-36,-33,-44,9,3.2); rock(-36,-33,19,52,3.2);
  for(const [x,z,s] of [[-44,-30,5],[-42,10,4],[-47,40,4.5],[20,40,6],[-20,40,5],[36,-46,6],[-30,-50,5]]){ const d=new T.Mesh(new T.SphereGeometry(s,14,8,0,Math.PI*2,0,Math.PI/2),M.dune); d.scale.y=.24; d.position.set(x,0,z); scene.add(d); }
  for(let i=0;i<34;i++){ const R=mulberry32(700+i); const x=-51+R()*14, z=-60+R()*108; if(Math.abs(z-14)<6&&x>-40) continue; const b=new T.Mesh(new T.SphereGeometry(.35+R()*.5,7,5),M.shrub); b.scale.y=.6; b.position.set(x,.12,z); scene.add(b); }
  palm(-49,-6,6.4); palm(-50.5,22,7); palm(-38.6,40,5.8);
  // carro de Yasmina e detonador
  car(-46,46,true);
  addMesh(BOX(.5,.42,.36),hm(0x4a3e2c),-38,.21,12,'wood'); addMesh(new T.CylinderGeometry(.03,.03,.5,6),MAT.darkMetal,-38,.66,12,'metal'); addMesh(BOX(.42,.05,.05),MAT.darkMetal,-38,.92,12,'metal');
  { const pts=[[-38,12],[-35,13.6],[-32,14],[-29,14],[-24,12.6],[-13,6],[-4,3],[0,1]]; for(let k=0;k<pts.length-1;k++){ const a=pts[k],b=pts[k+1]; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); const w=new T.Mesh(BOX(.03,.03,L),Q.wire); w.position.set((a[0]+b[0])/2,.04,(a[1]+b[1])/2); w.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]); scene.add(w); } }
  // ---- cerca do depósito ----
  const fence=(x0,x1,z0,z1)=>{ const s=addSolidOnly(x0,x1,z0,z1,2.4); s.see=true; return s; };
  fence(-30,-2.6,-30.05,-29.95); fence(2.6,34,-30.05,-29.95); fence(-30,34,25.95,26.05); fence(33.95,34.05,-30,26); fence(-30.05,-29.95,-30,12.8); fence(-30.05,-29.95,15.2,26);
  { const posts=[]; for(let x=-30;x<=34;x+=2.5){ if(Math.abs(x)>2.4) posts.push([x,1.2,-30,.1,2.4,.1,0]); posts.push([x,1.2,26,.1,2.4,.1,0]); } for(let z=-30;z<=26;z+=2.5){ posts.push([34,1.2,z,.1,2.4,.1,0]); if(z<12.6||z>15.4) posts.push([-30,1.2,z,.1,2.4,.1,0]); } instanced(UNIT,M.wood,posts);
    const wires=[]; for(const y of [.6,1.2,1.8,2.3]){ wires.push([-16.3,y,-30,27.4,.02,.02,0],[18.3,y,-30,31.4,.02,.02,0],[2,y,26,64,.02,.02,0],[34,y,-2,.02,.02,56,0],[-30,y,-8.6,.02,.02,42.8,0],[-30,y,20.6,.02,.02,10.8,0]); } instanced(UNIT,MAT.darkMetal,wires); }
  for(const y of [.35,.9]){ const w=addMesh(BOX(.02,.02,1.2),MAT.darkMetal,-30.3,y,12.5,null); w.rotation.y=.6; const w2=addMesh(BOX(.02,.02,1.2),MAT.darkMetal,-30.3,y+.2,15.5,null); w2.rotation.y=-.5; }
  { const c=new T.Mesh(new T.CylinderGeometry(.5,.5,3.4,14,1,true,0,Math.PI),new T.MeshLambertMaterial({map:TEX.lime5,color:0x9a948a,side:T.DoubleSide})); c.rotation.z=Math.PI/2; c.position.set(-30,0,11.5); scene.add(c); addMesh(new T.CircleGeometry(.46,12,0,Math.PI),hm(0x0a0a0a),-31.69,0,11.5,null).rotation.y=-Math.PI/2; }
  poster(-7,1.5,-30.12,Math.PI,2.4,.9,(g,w,h)=>{ g.fillStyle='#e8dcc0'; g.fillRect(0,0,w,h); g.fillStyle='#8a1a10'; g.font='bold 22px sans-serif'; g.textAlign='center'; g.fillText('TREIBSTOFFLAGER',w/2,34); g.fillStyle='#1e1e1e'; g.font='bold 16px sans-serif'; g.fillText('RAUCHEN VERBOTEN · FEUER!',w/2,64); g.font='12px sans-serif'; g.fillText('Oued el-Kebir — Nachschub-Kp. 309',w/2,86); });
  // portão
  makeDoor('gate',{x:0,z:-30,y0:.9,w:5,d:.16,h:.16,mat:M.barrier,offset:V3(0,2.6,0),npc:false,nav:true,snd:'door'});
  for(const x of [-2.8,2.8]){ addMesh(BOX(.3,1.1,.3),M.wood,x,.55,-30,'wood'); addSolidOnly(x-.15,x+.15,-30.15,-29.85,1.1); }
  addBlock(5.2,7.4,-29.4,-27.2,2.5,{mat:M.wood,surf:'wood',top:MAT.roof,seg:1}); sandbags(-5.6,-3.8,-33.6,-33);
  // torres de vigia
  const towerW=(x,z)=>{ const s=addWalk(x-1.5,x+1.5,z-1.5,z+1.5,4.6,{mat:M.wood,top:M.wood,seg:1}); s.mesh.visible=false;
    for(const [a,b] of [[-1.35,-1.35],[1.35,-1.35],[-1.35,1.35],[1.35,1.35]]) addMesh(BOX(.18,4.6,.18),M.wood,x+a,2.3,z+b,'wood');
    addMesh(BOX(3.1,.18,3.1),M.wood,x,4.5,z,'wood'); for(const [a,b,w,d] of [[0,-1.5,3,.08],[0,1.5,3,.08],[-1.5,0,.08,3],[1.5,0,.08,3]]) addBlock(x+a-w/2,x+a+w/2,z+b-d/2,z+b+d/2,1,{y0:4.6,mat:M.wood,surf:'wood',seg:1,cover:true});
    addMesh(BOX(3.4,.1,3.4),MAT.roof,x,6.9,z,'wood'); for(const [a,b] of [[-1.4,-1.4],[1.4,1.4]]) addMesh(BOX(.1,2.3,.1),M.wood,x+a,5.75,z+b,'wood');
    for(let k=0;k<6;k++) addMesh(BOX(.5,.05,.05),M.wood,x+1.6,.5+k*.75,z,'wood'); };
  towerW(-27.5,-27.5); towerW(31.5,23.5);
  // ---- galpão A: arsenal ----
  const wl=(axis,c0,c1,a0,a1,h,ops,mat)=>wallOpen(axis,c0,c1,a0,a1,h,ops,mat||Q.tin,{inner:{}});
  wl('x',-24,-23.8,-26,-14,3.8,[]); wl('x',-14.2,-14,-26,-14,3.8,[]); wl('z',-26,-25.8,-23.8,-14.2,3.8,[]); wl('z',-14.2,-14,-23.8,-14.2,3.8,[{c:-19,w:1.4}]);
  addBlock(-26.2,-13.8,-24.2,-13.8,.2,{y0:3.8,mat:MAT.roof,bottom:MAT.ceil,surf:'metal',seg:3});
  makeDoor('arsenal',{x:-14.1,z:-19,w:.12,d:1.4,h:2.4,mat:Q.tinD,offset:V3(0,0,1.4),locked:true,npc:true,nav:true,snd:'door'});
  addMesh(BOX(.06,.16,.1),hm(0x8a7a3a),-13.98,1.2,-19.5,'metal');
  for(const [x,z] of [[-24.4,-15.4],[-22.8,-15.4],[-24.4,-19.4],[-22.4,-19.6]]) crate(x,z,1.1,1.05);
  crate(-24.4,-15.4,1,1,1.05); crate(-17,-22.8,1.2,1.1); crate(-15.6,-22.8,1,.9); crate(-17,-15.4,1.2,1.1); crate(-17,-15.4,.9,.9,1.1);
  addBlock(-21.6,-18.4,-23.8,-23.1,1.8,{mat:MAT.cabinet,surf:'metal',seg:1}); addBlock(-21.6,-18.4,-23.8,-23.1,.05,{y0:.9,mat:M.wood,surf:'wood',seg:1,solid:false});
  const chg=addBlock(-25.4,-23.8,-23.6,-22.2,.7,{mat:M.wood,surf:'wood',cover:true,seg:1}); for(let k=0;k<5;k++) addMesh(BOX(.36,.22,.16),Q.charge,-25.1+k*.3,.81,-22.9,'wood');
  poster(-24.6,1.6,-23.78,0,1.2,.6,(g,w,h)=>{ g.fillStyle='#d8c8a0'; g.fillRect(0,0,w,h); g.fillStyle='#8a1a10'; g.font='bold 22px sans-serif'; g.textAlign='center'; g.fillText('SPRENGMITTEL',w/2,40); g.fillStyle='#222'; g.font='13px sans-serif'; g.fillText('Zündmittel getrennt lagern',w/2,70); });
  addBlock(-25.8,-25.5,-17.8,-16.2,1.6,{mat:M.wood,surf:'wood',seg:1}); for(let k=0;k<3;k++){ const s=addMesh(BOX(.08,.2,.8),hm(0x2a2a28),-25.4,1.1+k*.0,-17.4+k*.5,'metal'); s.rotation.x=.1; }
  bulb('A1',-20,3.5,-19,6); W.lamps[W.lamps.length-1].base=.5; W.lamps[W.lamps.length-1].light.intensity=.5;
  // ---- cabana do Feldwebel (Schirrmeisterei) ----
  wl('x',2,2.2,-26,-19,3,[{c:-23,w:1.2,sill:1,top:2}],M.adobe); wl('x',7.8,8,-26,-19,3,[],M.adobe); wl('z',-26,-25.8,2.2,7.8,3,[],M.adobe); wl('z',-19.2,-19,2.2,7.8,3,[{c:5,w:1.1}],M.adobe);
  addBlock(-26.2,-18.8,1.8,8.2,.2,{y0:3,mat:MAT.roof,bottom:MAT.ceil,surf:'wood',seg:2});
  makeDoor('dfw',{x:-19.1,z:5,w:.1,d:1.1,h:2.3,mat:M5.door,offset:V3(0,0,-1.05),npc:true,nav:true});
  addBlock(-23.6,-21.6,6.6,7.5,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); addBlock(-25.7,-25.2,2.4,4,1.8,{mat:MAT.cabinet,surf:'metal',seg:1});
  addMesh(BOX(.04,.6,.9),hm(0x6a5034),-25.78,1.55,5.4,'wood'); const keyM=addMesh(BOX(.03,.12,.05),Q.key,-25.74,1.45,5.4,'metal');
  for(let k=0;k<3;k++) addMesh(BOX(.03,.1,.04),hm(0x8a8a80),-25.74,1.5,5.1+k*.18*(k===1?2.6:1),'metal');
  bulb('B1',-22.6,2.75,5,5); W.lamps[W.lamps.length-1].base=.55; W.lamps[W.lamps.length-1].light.intensity=.55;
  // gerador
  addBlock(-14.4,-12.6,1.6,2.8,1.25,{mat:MAT.stove,surf:'metal',cover:true,seg:1}); addMesh(new T.CylinderGeometry(.07,.07,1.2,8),MAT.darkMetal,-12.9,1.85,2.5,'metal');
  // ---- galpão B: transmissões ----
  wl('x',12,12.2,-12,-1,3.4,[{c:-3.5,w:1.2},{c:-9.4,w:1.4,sill:.9,top:2.1}]); wl('x',21.8,22,-12,-1,3.4,[]); wl('z',-12,-11.8,12.2,21.8,3.4,[]); wl('z',-1.2,-1,12.2,21.8,3.4,[{c:16.5,w:1.2,sill:1,top:2.1}]);
  addGlass('bw1',-10.1,-8.7,.9,2.1,12.06,12.14); addGlass('bw2',-1.14,-1.06,1,2.1,15.9,17.1);
  addBlock(-6.6,-6.4,12.2,14.45,3.4,{mat:Q.tin,surf:'metal',seg:1.5}); addBlock(-6.6,-6.4,15.55,21.8,3.4,{mat:Q.tin,surf:'metal',seg:1.5}); addBlock(-6.6,-6.4,14.45,15.55,1,{y0:2.4,mat:Q.tin,surf:'metal',seg:1});
  addBlock(-12.2,-.8,11.8,22.2,.2,{y0:3.4,mat:MAT.roof,bottom:MAT.ceil,surf:'metal',seg:3});
  makeDoor('dB',{x:-3.5,z:12.1,w:1.2,d:.1,h:2.3,mat:Q.tinD,offset:V3(1.15,0,0),npc:true,nav:true});
  floorPlane(10.6,9.6,-6.5,17,M.tiles,'stone',.02);
  addBlock(-2,-1.2,14,17.4,.8,{mat:M.wood,surf:'wood',cover:true,seg:1}); const radio7=addMesh(BOX(.45,.5,1.1),hm(0x3a3e34),-1.6,1.05,15.6,'metal'); addMesh(BOX(.4,.3,.5),hm(0x2e322a),-1.6,.95,14.5,'metal');
  for(let k=0;k<5;k++) addMesh(new T.CylinderGeometry(.03,.03,.02,8),hm(0xd8c890),-1.83,1.16,15.15+k*.22,null).rotation.z=Math.PI/2;
  addBlock(-6.2,-4.6,20.8,21.6,1.9,{mat:MAT.cabinet,surf:'metal',seg:1}); addBlock(-5.6,-2.6,19.2,20.2,.75,{mat:M.wood,surf:'wood',cover:true,seg:1});
  poster(-3.6,1.9,21.78,Math.PI,2.4,1.3,(g,w,h)=>{ g.fillStyle='#d8cdb0'; g.fillRect(0,0,w,h); g.fillStyle='#2a2418'; g.font='bold 14px serif'; g.fillText('FUNKPLAN — NACHSCHUB SÜD',12,22); g.font='12px monospace'; ['Rufzeichen: KOBRA / ADLER 7','Wechsel 00.00 Uhr','Schlüssel: Heft "Mai"','Notfrequenz 3.880 kHz'].forEach((s,i)=>g.fillText(s,12,46+i*18)); });
  // escritório do livro
  addBlock(-11.4,-9.4,19.4,20.6,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); addBlock(-11.8,-11.2,13,15.6,1.9,{mat:MAT.cabinet,surf:'metal',seg:1});
  const book=addMesh(BOX(.34,.05,.24),Q.book,-10.4,.805,20,'cloth'); addMesh(BOX(.3,.012,.2),hm(0xe8e0c8),-10.4,.836,20,null);
  addMesh(new T.CylinderGeometry(.08,.12,.05,10),MAT.darkMetal,-9.75,.805,20.35,'metal');
  chair(-10.4,18.7,0,M5.dark);
  bulb('C1',-9,3.15,17,5); W.lamps[W.lamps.length-1].base=.75; W.lamps[W.lamps.length-1].light.intensity=.75;
  bulb('C2',-3.6,3.15,16.5,5); W.lamps[W.lamps.length-1].base=.55; W.lamps[W.lamps.length-1].light.intensity=.55;
  // ---- barracas ----
  tent(-12,-4,-27.4,-21,3.2,new T.MeshLambertMaterial({color:0x8a7c5e,side:T.DoubleSide})); for(const x of [-11,-8,-5]) addBlock(x-.35,x+.35,-26.8,-25.4,.45,{mat:M.cot,surf:'cloth',seg:1});
  tent(18,28,14,22,3.2,new T.MeshLambertMaterial({color:0x8e8062,side:T.DoubleSide})); for(const x of [19.2,22.8,26.8]) addBlock(x-.35,x+.35,20,21.6,.45,{mat:M.cot,surf:'cloth',seg:1});
  // ---- pátio dos caminhões ----
  const trucks=[2,9,16,23].map((x,i)=>{ const t=makeTanker07(i,x,4,Math.PI); t.homeX=x; return t; });
  for(const t of trucks) addMesh(new T.CircleGeometry(1.4,14),hm(0x1e1a14),t.x+.3,.016,t.z-1.6,null).rotation.x=-Math.PI/2;
  const drums=[drums07('A',11.6,13.4,2.6,5.4,1.8,M.drum),drums07('B',22.4,25,-21.2,-19.4,1.8,M.drumG),drums07('C',-4.6,-2.8,1,3.6,1.8,M.drum)];
  sandbags(-1.6,1,-13.6,-12.8); crate(8,-12.6,1.1,1.05); crate(9.2,-12.4,1,.95); crate(15,-14.8,1.1,1.1); crate(-7.4,-8,1.2,1.1); crate(-6.2,-8.2,1,1);
  car(13,17.6,false);
  // tanque elevado
  const tw={state:'OK',hp:300,charge:false,burnT:0,fireLeft:0,legs:[]};
  for(const [a,b] of [[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]]){ const l=addMesh(BOX(.22,4.2,.22),MAT.darkMetal,28+a,2.1,-18+b,'metal'); addSolidOnly(28+a-.14,28+a+.14,-18+b-.14,-18+b+.14,4.2); tw.legs.push(l); }
  for(const y of [1.4,2.8]){ addMesh(BOX(3,.08,.08),MAT.darkMetal,28,y,-19.4,'metal'); addMesh(BOX(3,.08,.08),MAT.darkMetal,28,y,-16.6,'metal'); }
  addMesh(BOX(3.3,.12,3.3),MAT.darkMetal,28,4.2,-18,'metal');
  tw.tankM=addMesh(new T.CylinderGeometry(1.55,1.55,5.4,18),Q.tower,28,5.8,-18,'metal'); tw.tankM.rotation.z=Math.PI/2;
  tw.tankM.userData.zoneHit=(h,o)=>{ if(tw.state==='GONE') return; const d=computeDamage(o.weapon.dmg,h.distance,o.weapon.falloff,1); tw.hp-=d; AudioSys.play('clank',h.point,.9); emitNoise(h.point,8,'glass',null); if(o.shooter==='player'){ hitMarker('equip'); limbTag(tw.hp<=0?'TANQUE ELEVADO · rompido':'TANQUE ELEVADO'); } if(tw.hp<180&&Math.random()<.6) FX.burst(h.point,5,0x2a2018,1.2,.8,6); if(tw.hp<=0&&!(tw.burnT>0)&&Math.random()<.22) tw.burnT=1.8; };
  tw.wreckM=addMesh(BOX(4.6,1.2,2.6),Q.charred,28,4.6,-18,null); tw.wreckM.visible=false; tw.wreckM.rotation.z=.25;
  for(let k=0;k<8;k++) addMesh(BOX(.42,.04,.04),MAT.darkMetal,29.6,.4+k*.5,-18,'metal');
  tw.ch=new T.Group(); tw.ch.position.set(26.55,1.1,-16.6); tw.ch.add(new T.Mesh(BOX(.2,.3,.4),Q.charge)); tw.ch.visible=false; scene.add(tw.ch);
  tw.fireL=new T.PointLight(0xff7a2a,0,30,1.6); tw.fireL.position.set(28,6,-18); scene.add(tw.fireL);
  addMesh(new T.CylinderGeometry(.12,.12,.4,8),hm(0xa82a1a),27.2,1.2,-16.55,'metal').rotation.x=Math.PI/2;
  poster(28,5.8,-16.42,0,2.8,.6,(g,w,h)=>{ g.fillStyle='#9a9a92'; g.fillRect(0,0,w,h); g.fillStyle='#8a1a10'; g.font='bold 26px sans-serif'; g.textAlign='center'; g.fillText('VERGASERKRAFTSTOFF',w/2,38); });
  // mangueira do tanque elevado até o caminhão 3
  const hosePts=[[27.2,-16.4],[24,-12],[20.6,-6.4],[19.4,-1.4],[17.6,1.6]]; const hose=[];
  for(let k=0;k<hosePts.length-1;k++){ const a=hosePts[k],b=hosePts[k+1]; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); const m=new T.Mesh(new T.CylinderGeometry(.07,.07,L,6),Q.hose); m.rotation.x=Math.PI/2; m.position.set((a[0]+b[0])/2,.07,(a[1]+b[1])/2); m.rotation.order='YXZ'; m.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]); scene.add(m); hose.push(m); }
  const hoseEnd=hose[hose.length-1];
  // holofotes (gerador) e luz do portão
  const floods=[]; for(const [id,x,z,ax,az] of [['F1',5.5,-4.6,0,.6],['F2',19.5,-4.6,0,.6],['F3',12.5,11,0,-.6],['F4',-5,9.6,0,.6],['F5',-12,-12,-.6,0]]){ const L=lampPost(id,x,z,ax,az); L.base=1.5; L.light.intensity=1.5; L.light.distance=17; L.r=11; floods.push(L); }
  { const L=lampPost('F6',4.6,-31.6,0,.6); L.base=1.2; L.light.intensity=1.2; L.r=9; }
  // ---- navegação ----
  const N=[];
  for(let x=-28.4;x<=32.6;x+=2.6) for(let z=-28.4;z<=24.6;z+=2.6) N.push({x,z});
  for(let x=-25;x<=-15;x+=2) for(let z=-23;z<=-15;z+=2) N.push({x,z});
  for(let x=-11;x<=-2;x+=1.8) for(let z=13;z<=21;z+=1.8) N.push({x,z});
  for(let x=-25;x<=-20;x+=1.6) for(let z=3;z<=7;z+=1.6) N.push({x,z});
  for(let x=-51;x<=-38;x+=4.2) for(let z=-66;z<=50;z+=4.2) N.push({x,z});
  for(let x=-34;x<=40;x+=4.6) for(let z=-67;z<=-33;z+=4.6) N.push({x,z});
  for(let x=37;x<=40.5;x+=3.5) for(let z=-30;z<=50;z+=4.5) N.push({x,z});
  for(let x=-30;x<=36;x+=4.6) for(let z=29;z<=50;z+=4.6) N.push({x,z});
  N.push({x:-3.6,z:-31.4},{x:3.6,z:-31.4},{x:-34.4,z:14},{x:-31.6,z:14},{x:-28.6,z:14},{x:0,z:-31.6},{x:0,z:-28.4},{x:-15,z:-19},{x:-12.9,z:-19},{x:-3.5,z:11},{x:-3.5,z:13.2},{x:-6.5,z:15},{x:-18.2,z:5},{x:-20,z:5});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=5.4; buildNav();
  return {sun,hemi,amb,dawnSky,trucks,drums,tower:tw,hose,hoseEnd,hosePts,floods,keyM,book,radio7};
}
function objectives07(){ return [
  {id:'enter',text:'Entre no depósito pelo bueiro cortado no uádi',state:'active',marker:{x:-30,z:14}},
  {id:'arsenal',text:'Pegue as cargas de demolição no arsenal (galpão A)',state:'active',marker:{x:-13.4,z:-19}},
  {id:'cipher',text:'Fotografe o livro de cifras no galpão B',state:'active',marker:{x:-10.4,z:20}},
  {id:'charges',text:'Plante cargas nos caminhões-tanque (0/4)',state:'hidden',marker:{x:2,z:-1}},
  {id:'detonate',text:'Volte ao bueiro e acione o detonador',state:'hidden',marker:{x:-38,z:12}},
  {id:'trucks',text:'Destrua os caminhões-tanque restantes (0/4)',state:'hidden',marker:{x:2,z:-1}},
  {id:'escape',text:'Desça o uádi até o carro de Yasmina',state:'hidden',marker:{x:-46,z:46}},
  {id:'quiet',text:'Opcional: plante as quatro cargas sem soar o alarme',state:'active',optional:true},
  {id:'book',text:'Opcional: deixe o livro de cifras no lugar — só a foto',state:'active',optional:true,autoDone:true},
  {id:'tower',text:'Opcional: leve junto o tanque elevado de abastecimento',state:'active',optional:true},
]; }
function interact07(R){
  const I=W.interactables, F=()=>G.flags;
  for(const [id,x,z] of [['dfw',-19.1,5],['dB',-3.5,12.1]]) I.push(doorInteract(id,V3(x,1.2,z)));
  I.push({id:'arsdoor',pt:()=>V3(-13.95,1.2,-19),r:2.4,skipSolid:()=>W.doors.arsenal.solid,
    label:()=>{ const d=W.doors.arsenal; if(d.state==='LOCKED') return F().akey?'Destrancar o arsenal':'Forçar o cadeado do arsenal (segure — barulhento)'; return d.state==='CLOSED'?'Abrir porta':d.state==='OPEN'?'Fechar porta':null; },
    hold:()=>W.doors.arsenal.state==='LOCKED'?(F().akey?.8:(G.diff==='veterano'?5:4)):0,
    use:()=>{ const d=W.doors.arsenal; if(d.state==='LOCKED'){ if(!F().akey){ F().forced=true; AudioSys.play('clank',d.mesh.position,1.2); AudioSys.play('metal',d.mesh.position,1); emitNoise(V3(-14,0,-19),15,'lure',null); pickupMsg('Cadeado arrombado'); } else AudioSys.play('unlock'); d.state='CLOSED'; openDoor(d,null); cp07(); }
      else if(d.state==='CLOSED') openDoor(d,null); else if(d.state==='OPEN') closeDoor(d); }});
  I.push({id:'akey',pt:()=>V3(-25.7,1.45,5.4),r:2.2,label:()=>F().akey?null:'Pegar a chave do arsenal',
    use:()=>{ F().akey=true; R.keyM.visible=false; AudioSys.play('pickup'); pickupMsg('Chave do arsenal'); const o=obj('arsenal'); if(o.state==='active'){ o.text='Pegue as cargas de demolição no arsenal (galpão A) — você tem a chave'; refreshObjectiveUI(); } cp07(); }});
  I.push({id:'charges',pt:()=>V3(-24.6,.9,-22.9),r:2.3,label:()=>F().gotCharges?null:'Pegar as cargas de demolição',
    use:()=>{ F().gotCharges=true; F().charges=G.diff==='recruta'?6:G.diff==='veterano'?4:5; AudioSys.play('pickup'); AudioSys.play('cloth'); pickupMsg('Cargas de demolição ×'+F().charges);
      complete('arsenal'); activate('charges'); refreshCharges07();
      G.radioMsg('ÉLISE',F().charges>4?'Cinco cargas com espoleta elétrica. Uma de sobra — o tanque elevado ia ficar bonito com ela.':'Quatro cargas. Nenhuma de sobra.'); cp07(); }});
  I.push({id:'sten',pt:()=>V3(-25.4,1.2,-17),r:2.2,label:()=>F().gotSten?null:'Pegar a Sten capturada (submetralhadora)',
    use:()=>{ F().gotSten=true; const P=G.player; if(!P.weapons.includes('smg')){ P.weapons.push('smg'); P.ammo.smg={mag:32,reserve:Math.round(64*D().pickups)}; } else { P.ammo.smg.reserve=Math.min(WEAPONS.smg.reserveMax,P.ammo.smg.reserve+64); } AudioSys.play('pickup'); pickupMsg('Sten Mk II (capturada) — tecla 3'); G.hud.ammoT=4; }});
  R.trucks.forEach(t=>I.push({id:'plant'+t.i,pt:()=>t2w(t,-1.45,1.4,-1.7),r:2.3,skip:true,
    label:()=>{ if(t.charge||t.state==='WRECK'||t.state==='GONE'||t.state==='BURNING'||!F().gotCharges) return null; if(t.state==='DRIVING'||t.state==='STARTING') return null; return F().charges>0?'Plantar carga no caminhão '+(t.i+1)+' (segure)':'Caminhão '+(t.i+1)+' — sem cargas na mochila'; },
    locked:()=>!(F().charges>0), hold:()=>F().charges>0?(G.diff==='veterano'?3.8:3.2):0, use:()=>{ if(F().charges>0) plantCharge07(t); }}));
  I.push({id:'plantT',pt:()=>V3(26.55,1.1,-16.4),r:2.3,label:()=>R.tower.charge||R.tower.state==='GONE'||!(F().charges>0)?null:'Plantar carga no pé do tanque elevado (segure)',hold:()=>3.2,
    use:()=>{ F().charges--; R.tower.charge=true; R.tower.ch.visible=true; AudioSys.play('cloth'); pickupMsg('Carga plantada · tanque elevado'); cp07(); }});
  I.push({id:'valve',pt:()=>V3(27.2,1.2,-16.5),r:2.2,label:()=>F().valve||R.tower.state==='GONE'?null:'Abrir a válvula da mangueira (segure)',hold:()=>2,
    use:()=>{ F().valve=true; AudioSys.play('leak',V3(27.2,1,-16.5),1); pickupMsg('Válvula aberta — gasolina escorrendo pela mangueira'); G.radioMsg('ÉLISE','A mangueira vai até o caminhão 3. Se ele pegar fogo, o fogo sobe pela gasolina até aqui.','tip'); cp07(); }});
  I.push({id:'gen',pt:()=>V3(-13.5,1.2,2.2),r:2.3,label:()=>F().power===false?null:'Desligar o gerador dos holofotes (segure)',hold:()=>1.6,use:()=>{ powerOff07(false); cp07(); }});
  I.push({id:'takebook',pt:()=>V3(-10.4,.86,20),r:1.9,label:()=>F().bookTaken?null:'Levar o livro de cifras (eles vão dar falta)',hold:()=>1.2,
    use:()=>{ F().bookTaken=true; R.book.visible=false; for(const t of W.photo) if(t.id==='cipher') t.taken=true; failObjective('book'); complete('cipher'); AudioSys.play('pickup'); pickupMsg('Livro de cifras');
      G.radioMsg('YASMINA','Você levou o livro? Ao amanhecer vão dar falta e trocar todas as cifras — Londres fica surda de novo. Bom, agora está feito.','warn'); if(F().allWrecked) activate('escape'); cp07(); }});
  I.push({id:'det',pt:()=>V3(-38,.7,12),r:2.4,label:()=>{ if(F().detonated) return null; const n=R.trucks.filter(t=>t.charge&&t.state!=='WRECK').length+(R.tower.charge&&R.tower.state!=='GONE'?1:0); return n?'Acionar o detonador ('+n+(n===1?' carga)':' cargas)'):'Detonador — nenhuma carga ligada ao fio'; },
    locked:()=>!(R.trucks.some(t=>t.charge&&t.state!=='WRECK')||R.tower.charge), hold:()=>.9, use:()=>detonate07()});
  I.push({id:'car7',pt:()=>V3(-46,1.2,46),r:3.2,skip:true,label:()=>obj('escape').state==='active'?'Entrar no carro de Yasmina':'Yasmina: “Ainda não — os caminhões e o livro primeiro.”',locked:()=>obj('escape').state!=='active',
    use:()=>{ if(obj('escape').state==='active') missionComplete(); }});
}
function pickups07(){
  addPickup('a_nade1',-20.4,-23.45,'nade',2,.98); addPickup('a_nade2',-19.4,-23.45,'nade',1,.98); addPickup('a_med1',-15.6,-15.6,'med',35,.1);
  addPickup('a_pis1',-22.6,7.05,'pistol',8,.82); addPickup('a_med2',-5.2,19.7,'med',30,.8); addPickup('a_sil1',-1.6,16.9,'silenced',6,.83);
  addPickup('a_med3',27.4,17.4,'med',35,.1); addPickup('a_smg1',6,-27.6,'smg',32,.1); addPickup('a_med4',-44,-12,'med',40,.1);
  G.player.nades=G.player.nades||0;
}
function photos07(){ W.photo.push({id:'cipher',label:'Livro de cifras (Schlüsselheft “Mai”)',pos:V3(-10.4,.84,20),normal:V3(0,1,0),max:2.6,obj:'cipher',size:.28,
  msg:'Schlüsselheft de maio, página por página. Londres vai ler o Afrika Korps até o fim da campanha — desde que o livro continue aqui.',after:()=>{ if(G.flags.allWrecked) activate('escape'); }}); }
function update07(dt){
  const P=G.player, F=G.flags, R=G.refs;
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('YASMINA','Estou com o carro no fim do uádi. Cortei o arame do bueiro ontem à noite. Cargas no arsenal, livro de cifras no galpão B. O comboio parte quando o sol nascer.','tip'); }
  if(!F.i2&&G.introT>10){ F.i2=true; G.radioMsg('DICA','Os holofotes do pátio dependem do gerador ao lado da cabana do Feldwebel. Caminhão: tanque, motor, pneus e cabine são alvos diferentes.','tip'); }
  // amanhecer
  const total=G.diff==='recruta'?840:G.diff==='veterano'?540:660;
  if(!F.allWrecked) F.dawnT=(F.dawnT||0)+dt; const dawn=clamp((F.dawnT||0)/total,0,1); applyDawn07(dawn);
  if(!F.allWrecked&&!F.depart){ const s=Math.max(0,total-(F.dawnT||0)); G.progress={label:'Amanhecer — o comboio parte em '+Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'),v:1-dawn}; }
  else if(F.depart&&!F.allWrecked){ const n=R.trucks.filter(t=>t.state==='DRIVING'||t.state==='STARTING').length; G.progress={label:n?'Caminhão a caminho do portão!':'Comboio partindo — próximo caminhão em '+Math.max(0,Math.ceil(F.departT))+' s',v:n?1:clamp(F.departT/16,0,1)}; }
  else G.progress=null;
  if(!F.dawnMsg&&dawn>.75&&!F.allWrecked){ F.dawnMsg=true; G.radioMsg('YASMINA','O céu está clareando no leste. Daqui a pouco os motoristas acordam.','warn'); }
  // entrada
  if(obj('enter').state==='active'&&P.pos.x>-29.2&&P.pos.x<33.8&&P.pos.z>-29.8&&P.pos.z<25.8){ complete('enter'); G.radioMsg('ÉLISE','Dentro.'); cp07(); }
  // partida do comboio
  if(!F.depart&&!F.allWrecked&&(dawn>=1||G.alarm)){ F.depart=true; F.departT=G.alarm?14:6; activate('trucks'); onWreck07();
    G.radioMsg('RÁDIO','“Motoristas aos caminhões! Kolonne 7, partida imediata!”','warn'); setTimeout(()=>{ if(G&&G.levelId==='07'&&!G.ending) G.radioMsg('DICA','Caminhão em movimento: motor, dois pneus ou o motorista o param. Tanque furado + fogo o destrói.','tip'); },3500); }
  if(F.depart&&!F.allWrecked){ F.departT-=dt; if(F.departT<=0){ const nx=R.trucks.find(t=>t.state==='PARKED'&&!t.engDead&&!t.tiresOut&&!t.driverDead); if(nx){ startTruck07(nx); G.radioMsg('ALERTA','O caminhão '+(nx.i+1)+' ligou o motor!','warn'); } F.departT=G.diff==='veterano'?12:G.diff==='recruta'?20:16; } }
  // descoberta de cargas
  for(const t of R.trucks){ if(!t.charge||(t.state!=='PARKED'&&t.state!=='STOPPED')) { if(t.discE){ susMark(t.discE,null); t.discE=null; } t.disc=0; continue; }
    const cp=t2w(t,-1.1,1.5,-1.7); let who=null;
    for(const e of G.enemies){ if(e.dead||e.asleep||e.state==='COMBAT'||e.state==='RADIO') continue; const d=Math.hypot(e.pos.x-cp.x,e.pos.z-cp.z); if(d>3) continue;
      const lit=lightAt(cp.x,cp.z)>.45||(e.h.lanternLight&&!e.lanternBroken); if(!lit) continue; if(Math.abs(angDiff(e.yaw+e.headYaw,Math.atan2(cp.x-e.pos.x,cp.z-e.pos.z)))>1.1) continue; who=e; break; }
    if(who){ t.disc+=dt*(G.diff==='veterano'?1.25:G.diff==='recruta'?.7:1); t.discE=who; susMark(who,'q'); if(t.disc>1.4){ t.charge=false; t.ch.visible=false; susMark(who,'x'); t.discE=null; F.found=(F.found||0)+1; F.charges=F.charges||0;
        G.radioMsg('SENTINELA','“Sprengladung! Uma carga no tanque do caminhão '+(t.i+1)+'!”','warn'); AudioSys.play('shout',who.pos); who.enterCombat(who.pos.x,who.pos.z,true); if(!G.alarm) raiseAlarm(); syncTrucks07(); refreshCharges07(); setTimeout(()=>{ if(who.mark) who.mark.visible=false; },2500); } }
    else { t.disc=Math.max(0,t.disc-dt*.5); if(t.discE&&t.disc<=0){ susMark(t.discE,null); t.discE=null; } } }
  // vazamento percebido
  for(const t of R.trucks){ if(!t.leak||t.leakSeen||t.state==='WRECK') continue; for(const e of G.enemies){ if(e.dead||e.asleep||e.state==='COMBAT') continue; if(Math.hypot(e.pos.x-t.x,e.pos.z-t.z)<7&&lightAt(t.x,t.z)>.35){ t.leakSeen=true; e.awareness=Math.max(e.awareness,.6); e.toInvestigate(t.x+1.8,t.z); G.radioMsg('SENTINELA','“Benzin! O caminhão '+(t.i+1)+' está vazando!”'); break; } } }
  // caminhões
  for(const t of R.trucks){
    if(t.state==='STARTING'){ t.startT-=dt; if(Math.random()<dt*8) FX.puff(t2w(t,.7,.5,-3.9),1,0x3a3632,.6,1.6,V3(0,.6,0),.45); if(t.startT<=0) t.state='DRIVING'; }
    if(t.state==='DRIVING') driveTruck07(t,dt);
    if(t.state==='STOPPED'&&t.speed>0){ t.speed=Math.max(0,t.speed-dt*6); t.x+=Math.sin(t.yaw)*t.speed*dt; t.z+=Math.cos(t.yaw)*t.speed*dt; setTruckPose07(t); if(t.speed===0) syncTrucks07(); }
    if(t.state==='BURNING'){ if(t.speed>0){ t.speed=Math.max(0,t.speed-dt*5); t.x+=Math.sin(t.yaw)*t.speed*dt; t.z+=Math.cos(t.yaw)*t.speed*dt; setTruckPose07(t); }
      t.burnT-=dt; const top=t2w(t,0,3,-1.25); t.fireL.intensity=1.4+Math.random()*.8; if(Math.random()<dt*22) FX.puff(V3(top.x+rnd(-.8,.8),top.y,top.z+rnd(-.8,.8)),1,Math.random()<.6?0xff8a30:0xffc060,.9,.5,V3(0,2.2,0),.85); if(Math.random()<dt*6) FX.puff(top,1,0x2a2622,1.4,2.6,V3(0,1.8,0),.5); if(Math.random()<dt*3) AudioSys.play('flare',top,.4);
      if(t.burnT<=0) truckExplode07(t); }
    if(t.leak&&t.state!=='WRECK'){ if(t.puddle&&t.puddle.scale.x<2.3) t.puddle.scale.setScalar(Math.min(2.3,t.puddle.scale.x+dt*.08)); if(Math.random()<dt*10){ const p=t2w(t,t.leakL[0],t.leakL[1],t.leakL[2]); FX.burst(p,1,0x4a3c22,.8,.45,7,.3); } }
    if(t.state==='WRECK'&&t.fireLeft>0){ t.fireLeft-=dt; t.smokeT-=dt; const top=t2w(t,0,2.4,-1.25); if(t.smokeT<=0){ t.smokeT=.12; FX.puff(V3(top.x+rnd(-.9,.9),top.y+.4,top.z+rnd(-.9,.9)),1,0x221e1c,1.8,4.2,V3(rnd(-.3,.3),1.8,rnd(-.3,.3)),.55); if(Math.random()<.7) FX.puff(V3(top.x+rnd(-.9,.9),top.y,top.z+rnd(-.9,.9)),1,Math.random()<.5?0xff9a40:0xff6a20,.9,.45,V3(0,1.6,0),.8); }
      t.fireL.intensity=(1.6+Math.sin(simTime*17+t.i)*.35+Math.random()*.3)*clamp(t.fireLeft/30,.25,1);
      if(!P.dead&&Math.hypot(P.pos.x-top.x,P.pos.z-top.z)<2.7){ G.deathCause='explosion'; hurtPlayer(16*dt,top); } }
  }
  for(const s of R.drums){ if(s.state==='BURN'){ s.t-=dt; if(Math.random()<dt*16) FX.puff(V3(s.x+rnd(-.8,.8),1.9,s.z+rnd(-.8,.8)),1,0xff8a30,.7,.45,V3(0,1.6,0),.8); if(s.t<=0) drumsExplode07(s); }
    else if(s.state==='GONE'&&s.fireLeft>0){ s.fireLeft-=dt; if(Math.random()<dt*7) FX.puff(V3(s.x+rnd(-1,1),.6,s.z+rnd(-1,1)),1,Math.random()<.5?0xff8a30:0x2a2420,Math.random()<.5?.7:1.4,Math.random()<.5?.5:2.6,V3(0,1.4,0),.6); } }
  // tanque elevado
  const TW=R.tower; if(TW.state!=='GONE'&&TW.burnT>0){ TW.burnT-=dt; if(Math.random()<dt*14) FX.puff(V3(28+rnd(-2,2),7.2,-18+rnd(-1,1)),1,0xff8a30,1,.5,V3(0,2,0),.8); if(TW.burnT<=0) towerExplode07(); }
  if(TW.state==='GONE'&&TW.fireLeft>0){ TW.fireLeft-=dt; if(Math.random()<dt*9) FX.puff(V3(28+rnd(-2,2),4.4+rnd(0,1),-18+rnd(-1.5,1.5)),1,Math.random()<.5?0xff9a40:0x221e1c,Math.random()<.5?1.2:2.4,Math.random()<.5?.6:5,V3(0,2,0),.6); TW.fireL.intensity=2+Math.random()*.6; }
  if(F.valve&&TW.state!=='GONE'&&!F.trail&&Math.random()<dt*3){ const p=R.hosePts[R.hosePts.length-1]; FX.burst(V3(p[0],.15,p[1]),1,0x4a3c22,.5,.4,7,.3); }
  if(F.trail&&TW.state!=='GONE'){ G.trailT07=(G.trailT07||0)+dt; const pts=R.hosePts, k=clamp(1-G.trailT07/3.4,0,1)*(pts.length-1); const i0=Math.floor(Math.min(k,pts.length-2)), f=k-i0; const a=pts[i0],b=pts[i0+1]; const p=V3(lerp(a[0],b[0],f),.25,lerp(a[1],b[1],f));
    for(let n=0;n<2;n++) FX.puff(V3(p.x+rnd(-.2,.2),.3,p.z+rnd(-.2,.2)),1,0xff9a40,.55,.5,V3(0,1.2,0),.85); if(Math.random()<dt*4) AudioSys.play('flare',p,.5);
    if(G.trailT07>=3.4&&!(TW.burnT>0)) TW.burnT=.3; }
  // sequência da detonação
  if(G.seq07){ G.seqT07+=dt; for(const ev of G.seq07){ if(!ev.done&&G.seqT07>=ev.t){ ev.done=true; ev.fn(); } } if(G.seq07.every(e=>e.done)) G.seq07=null; }
  if(F.cpWreck>0){ F.cpWreck-=dt; if(F.cpWreck<=0){ F.cpWreck=0; cp07(); } }
  // marcador dos caminhões
  F.mkT=(F.mkT||0)-dt; if(F.mkT<=0){ F.mkT=.8; const o=obj('trucks'); if(o.state==='active'){ const nx=nearestTruck07(t=>t.state!=='WRECK'&&t.state!=='GONE'); if(nx){ o.marker={x:nx.x,z:nx.z}; refreshObjectiveUI(); } } if(obj('charges').state==='active') refreshCharges07(); }
  if(F.allWrecked&&obj('cipher').state==='done'&&obj('escape').state==='hidden') activate('escape');
  if(G.alarm&&!F.detonated&&!F.alarmEarly) F.alarmEarly=true;
  if(G.alarm&&obj('quiet').state==='active') failObjective('quiet');
  if(G.alarm&&!F.gateOpen){ F.gateOpen=true; const gd=W.doors.gate; if(gd&&gd.state==='CLOSED') openDoor(gd,null); }
  // gerador: ronco enquanto ligado
  if(F.power!==false){ F.genT=(F.genT||0)-dt; if(F.genT<=0){ F.genT=.42; if(Math.hypot(P.pos.x+13.5,P.pos.z-2.2)<16) AudioSys.play('engine',V3(-13.5,1,2.2),.22); } }
}
function updateHUD07(dt){
  const el=$('#convChip'); if(G&&(G.levelId==='11'||G.levelId==='14')) return; if(!G||G.levelId!=='07'||!G.refs.trucks){ if(el) el.hidden=true; return; } { const lb=el.querySelector('.lbl'); if(lb&&lb.firstChild&&lb.firstChild.nodeValue!=='Comboio · ') lb.firstChild.nodeValue='Comboio · '; } el.hidden=false; const R=G.refs, F=G.flags;
  const cls=t=>t.state==='WRECK'?'wreck':t.state==='BURNING'?'burn':(t.state==='DRIVING'||t.state==='STARTING')?'mov':(t.engDead||t.tiresOut||t.driverDead||t.state==='STOPPED')?'dis':t.charge?'chg':'';
  const sig=R.trucks.map(t=>cls(t)+(t.leak?'L':'')).join(',')+'|'+(F.charges||0)+'|'+(F.depart?1:0);
  if(el.dataset.sig===sig) return; el.dataset.sig=sig;
  const wrecks=R.trucks.filter(t=>t.state==='WRECK').length;
  el.className='disg conv '+(wrecks>=4?'ok':F.depart?'bad':'');
  $('#convState').textContent=wrecks>=4?'destruído':F.depart?'partindo':'estacionado';
  $('#convRow').innerHTML=R.trucks.map(t=>'<span class="trk '+cls(t)+'">'+(t.i+1)+(t.charge?'·C':'')+(t.leak&&t.state!=='WRECK'?'·V':'')+'</span>').join('');
  $('#convSub').textContent=F.gotCharges?'Cargas na mochila: '+(F.charges||0):'Cargas: no arsenal';
}
function restore07(s){
  const F=G.flags, R=G.refs;
  if(F.power===false) powerOff07(true);
  if(F.akey) R.keyM.visible=false; if(F.bookTaken) R.book.visible=false;
  for(const d of R.drums) if(F['drums_'+d.id]){ d.state='GONE'; if(d.im) d.im.visible=false; d.solid.active=false; }
  if(F.trk){ const A=JSON.parse(F.trk); A.forEach((a,i)=>{ const t=R.trucks[i]; t.x=a.x; t.z=a.z; t.yaw=a.y; setTruckPose07(t); t.tankHp=a.th; t.engHp=a.eh; t.engDead=!!a.ed; t.driverDead=!!a.dd; t.pathI=a.pi||0;
      a.fl.forEach((f,k)=>{ if(f) flatTire07(t,t.tires[k]); }); if(t.flat>=2) t.tiresOut=true; if(a.c){ t.charge=true; t.ch.visible=true; }
      if(a.lk) startLeak07(t,t2w(t,-1,1.8,-1.2));
      if(a.s==='WRECK'){ t.state='WRECK'; wreckVisual07(t); scorchMark(V3(t.x,.02,t.z),3.4); }
      else if(a.s==='BURNING'){ t.state='PARKED'; ignite07(t,1.2); }
      else if(a.s==='DRIVING'||a.s==='STARTING'){ t.state='DRIVING'; t.speed=0; }
      else t.state=a.s==='GONE'?'PARKED':a.s; }); }
  if(F.twr){ const a=JSON.parse(F.twr); R.tower.hp=a.hp; if(a.c){ R.tower.charge=true; R.tower.ch.visible=true; } if(a.s==='GONE'){ R.tower.state='GONE'; towerWreck07(); } }
  if(F.detonated) G.seq07=null;
  syncTrucks07();
  G.player.nades=G.player.nades||0;
}
function drawMap07(g,w,h){
  g.fillStyle='#e6d6b8'; g.fillRect(0,0,w,h); const S=w/100, X=x=>(x+56)*S, Z=z=>(z+40)*S;
  const rect=(x0,x1,z0,z1,fill,stroke)=>{ g.fillStyle=fill; g.fillRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); if(stroke){ g.strokeStyle=stroke; g.lineWidth=2; g.strokeRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); } };
  rect(-52,-36,-40,52,'#d8c49c',null); rect(-30,34,-30,26,'#ddd0b0','#5a4a32');
  rect(-26,-14,-24,-14,'#b8a07a','#4a3a22'); rect(-26,-19,2,8,'#c4ae88','#4a3a22'); rect(-12,-1,12,22,'#b8a07a','#4a3a22'); rect(-12,-4,-27.4,-21,'#cbb894',null); rect(18,28,14,22,'#cbb894',null);
  g.fillStyle='#6a5a3a'; for(const x of [2,9,16,23]) g.fillRect(X(x-1.1),Z(-.4),2.2*S,8.2*S);
  g.fillStyle='#8a2a1a'; g.beginPath(); g.arc(X(28),Z(-18),2.2*S,0,7); g.fill(); g.fillStyle='#3a3020'; for(const [x,z] of [[12.5,4],[23.7,-20.3],[-3.7,2.3]]){ g.beginPath(); g.arc(X(x),Z(z),.9*S,0,7); g.fill(); }
  g.strokeStyle='#2a2418'; g.lineWidth=1.5; g.setLineDash([3,3]); g.beginPath(); g.moveTo(X(27.2),Z(-16.4)); g.lineTo(X(24),Z(-12)); g.lineTo(X(20.6),Z(-6.4)); g.lineTo(X(17.6),Z(1.6)); g.stroke(); g.setLineDash([]);
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'12px serif'; g.fillText(s,X(x),Z(z)); };
  t('A — arsenal',-20,-19); t('B — transmissões',-6.5,17.4); t('Feldwebel',-22.5,5.4,'11px serif'); t('(chave)',-22.5,6.9,'italic 10px serif'); t('gerador',-13.5,0.4,'italic 11px serif');
  t('KOLONNE 7',12.5,10,'bold 13px serif'); for(const x of [2,9,16,23]) t(String((x-2)/7+1),x,-1.6,'bold 11px serif'); t('tanque elevado',28,-21.6,'11px serif'); t('mangueira',23.5,-9,'italic 10px serif'); t('tambores',12.5,6.6,'italic 10px serif');
  t('barracas',-8,-21.6,'11px serif'); t('motoristas',23,17.6,'11px serif'); t('portão',0,-32,'11px serif'); t('UÁDI',-44,0,'bold 14px serif'); t('bueiro',-32,11.6,'italic 11px serif'); t('detonador',-42,10,'italic 11px serif'); t('carro',-46,49,'italic 11px serif');
  g.fillStyle='#4a3a22'; for(const [x,z] of [[-27.5,-27.5],[31.5,23.5]]){ g.fillRect(X(x)-4,Z(z)-4,8,8); } t('torre',-27.5,-30.4,'10px serif'); t('torre',31.5,28,'10px serif');
  g.strokeStyle='#8a2a1a'; g.lineWidth=2; g.setLineDash([5,4]); g.beginPath(); g.moveTo(X(-44),Z(40)); g.lineTo(X(-44),Z(14)); g.lineTo(X(-30),Z(14)); g.stroke(); g.setLineDash([]);
}
DOCS.planta07={title:'Oued el-Kebir',sub:'Croqui de Yasmina — parque de combustível da Nachschub-Kp. 309',map:'07',body:'',pencil:'Arame do bueiro já cortado. O fio do detonador passa por ali. Os caminhões ficam lado a lado, de frente para o portão.'};
DOCS.nota07={title:'Bilhete de Yasmina',sub:'escrito a lápis, atrás de um maço de cigarros',body:`O Feldwebel guarda a chave do arsenal num
quadro de pregos na cabana dele. Ele sai
de vez em quando para ver o gerador.
Sem chave: o cadeado cede com o pé de
cabra, mas faz barulho.

Os tambores entre o 2 e o 3 estão cheios.
Se um caminhão for, o vizinho vai junto.

O 3 abastece pela mangueira do tanque
elevado. Válvula no pé da torre.

O livro de cifras fica no escritório do
galpão B. Fotografe. NÃO leve — se sumir,
trocam as cifras no mesmo dia.`,pencil:'Comboio parte às 05h30, com o sol.'};
LEVELS['07']={id:'07',num:7,op:'Operação 7',name:'Areias em Chamas',place:'Oued el-Kebir, Tunísia central',prev:'06',
  loadout:{weapons:['silenced','pistol'],ammo:{silenced:{mag:6,reserve:12},pistol:{mag:8,reserve:16}},cur:'silenced',camera:true},baseLight:.22,lightFn:light07,tropical:true,shadows:true,bloomTh:.78,grenades:true,
  build:()=>{ const r=buildLevel07(); photos07(); return r; },enemies:ENEMY_DEFS_07,ally:null,start:{x:-44,z:36,yaw:-.12},startDocs:['planta07','nota07'],drawMap:drawMap07,
  reinf:[{id:'n1',x:-9,z:-23,weapon:'smg',helmet:true,nades:1},{id:'n2',x:-6.4,z:-22.6,weapon:'rifle',helmet:true},{id:'n3',x:2,z:-44,weapon:'rifle',helmet:true},{id:'n4',x:-2,z:-46,weapon:'smg',helmet:true,nades:1}],
  radio:{x:-2.7,z:15.6,fx:-1.6,fz:15.6},radioRun:'O operador corre para o rádio do galpão B!',alarmPos:V3(-1.6,1.4,15.6),alarmText:'Alarme em Oued el-Kebir! A guarnição corre para o pátio dos caminhões.',alarmObjective:null,
  alarmYes:'O depósito acordou antes da hora. ',alarmLate:'O depósito só acordou com as explosões. ',alarmNo:'',alarmOk:()=>!!(G&&G.flags.detonated&&!G.flags.alarmEarly),deathText:'A guarnição de Oued el-Kebir cercou o pátio dos caminhões.',
  objectives:objectives07,interact:interact07,pickups:pickups07,update:update07,restore:restore07,onExplode:onExplode07,
  resultTitle:'Areias em chamas',outro:['YASMINA','Quatro colunas de fumaça no retrovisor. Sem gasolina, os Panzer do setor sul vão esperar parados.'],menuCam:{cx:-40,cz:24,y:4,tx:0,tz:2},ambient:'dawn',
  mist:{n:14,x0:-52,x1:36,z0:-40,z1:50,color:0x6a7088},
  briefing:{meta:'TUNÍSIA CENTRAL — 29 DE ABRIL DE 1943 — 04h40',paras:['A foto do quadro no Bordj el-Hamra deu a rota: a Kolonne 7 — quatro caminhões-tanque com 18 mil litros de gasolina — passa a noite no depósito de Oued el-Kebir e parte com o sol para abastecer os blindados do setor sul.','Élise entra pelo bueiro do uádi, onde Yasmina cortou o arame. No arsenal estão as cargas de demolição; no galpão de transmissões, o livro de cifras de maio. Fotografe o livro sem levá-lo, prenda uma carga em cada caminhão e acione o detonador do lado de fora. Se o depósito acordar, o comboio tenta sair pelo portão — e nenhum caminhão pode passar.'],list:['Entrar pelo bueiro; cargas no arsenal (chave com o Feldwebel)','Fotografar o livro de cifras no galpão B — sem levá-lo','Cargas nos quatro caminhões, detonador no uádi, fuga com Yasmina']}};
LEVEL_ORDER.push('07');


/* =========================================================
   AJUSTES — corpos que somem, reiniciar fase,
   inspeção de documentos (fase 6) com passe na tela
   ========================================================= */
Enemy.prototype.fadeBody=function(){
  const t=this.deathT-5; if(t<=0) return;
  this.h.root.position.y-=Math.min(1,t)*.75;
  if(t>=1){ this.gone=true; this.h.root.visible=false; const me=this; W.shootables=W.shootables.filter(m=>m.userData.char!==me);
    if(this.h.lanternLight) this.h.lanternLight.intensity=0; if(this.mark) this.mark.visible=false; }
};
function restartLevel(){ if(!G) return; const id=G.levelId, d=G.diff, keep=settings.difficulty; clearCheckpoint(); settings.difficulty=d; startPlaying(null,id); settings.difficulty=keep; }
/* ---- inspeção ---- */
function clearInspect(e,line){
  e.sus=0; e.clearedT=simTime; e.waitT2=0; e.closeT=0; e.awareness=0; e.alertLevel=0; e.susWhy=''; G.inspector=null; G.escort=null; e.aimTarget=0; e.toReturn();
  const P=G.player; for(const o of G.enemies){ if(o===e||o.dead) continue; o.closeT=0; if(Math.hypot(o.pos.x-P.pos.x,o.pos.z-P.pos.z)<18){ o.sus=(o.sus||0)*.4; o.vouchT=simTime; } } G.stats.inspections=(G.stats.inspections||0)+1;
  G.radioMsg('SENTINELA',line||(G.level.clearLine?G.level.clearLine():G.cred>=2?'“Passe vermelho, carimbo do comandante… Certo. Pode seguir.”':'“Intérprete da Intendência, assinado pelo major… Certo. Pode seguir.”'));
}
function showPapers(e){
  if(!e||e.dead||!disguiseOn()||G.papers) return; const P=G.player;
  const d=Math.hypot(P.pos.x-e.pos.x,P.pos.z-e.pos.z); if(d>3.8){ showHint('Chegue mais perto do guarda para entregar o passe.'); return; }
  if(!P.holster){ P.holster=true; P.adsT=0; e.sus=Math.min(.95,(e.sus||0)+.12); }
  if(G.camMode) toggleCamera();
  AudioSys.play('cloth'); G.papers={e,t:0,dur:G.diff==='veterano'?2.8:2.2}; e.waitT2=0; e.reached=true; papersCard(true);
}
function papersCard(on,ok){
  const el=$('#papersCard'); if(!el) return;
  if(on){ const red=G.cred>=2; el.className='papers'+(red?' red':''); el.innerHTML=G.level.papersHTML?G.level.papersHTML(red):'<div class="pc-h">PASSIERSCHEIN · Nr. 0417</div><div class="pc-n">MOREL, Élise</div><div class="pc-r">Dolmetscherin — Intendantur Tunis</div>'
      +'<div class="pc-z">'+(red?'Zutritt: <b>Hof · Stab · Turm · Treibstofflager</b>':'Zutritt: <b>Hof · Stab · Kantine</b>')+'</div><div class="pc-s">gez. Maj. A. Kessel</div>'+(red?'<div class="pc-red">SPERRGEBIET</div>':'')+'<div class="pc-stamp">INTENDANTUR<br>TUNIS</div>';
    el.hidden=false; void el.offsetWidth; el.classList.add('show'); }
  else { const hide=()=>{ el.classList.remove('show'); setTimeout(()=>{ if(!G||!G.papers) el.hidden=true; },300); };
    if(ok!==undefined){ el.classList.add(ok?'okd':'bad'); setTimeout(()=>{ if(!G||!G.papers) hide(); },950); } else hide(); }
}
function inspectTick(dt){
  if(!G||!G.disguise) return; const P=G.player;
  const S=G.papers;
  if(S){ const e=S.e; if(!disguiseOn()||e.dead){ G.papers=null; papersCard(false); return; }
    S.t+=dt; e.waitT2=0; const d=Math.hypot(P.pos.x-e.pos.x,P.pos.z-e.pos.z);
    if(d>4.6){ G.papers=null; papersCard(false,false); blowDisguise(e,'fuga'); return; }
    if(S.t>=S.dur){ G.papers=null; const zl=G.level.zoneAt(P.pos.x,P.pos.z,P.pos.y);
      if(zl<=G.cred){ papersCard(false,true); clearInspect(e); }
      else if(!G.flags.zoneWarned){ papersCard(false,false); G.flags.zoneWarned=1; G.escort={e,t:G.diff==='veterano'?8:G.diff==='recruta'?14:11};
        G.radioMsg('SENTINELA','“Este passe não vale aqui — área restrita! Volte para o pátio. Agora.”','warn'); AudioSys.play('shout',e.pos); }
      else { papersCard(false,false); blowDisguise(e,'credencial'); } } }
  const E=G.escort;
  if(E){ if(!disguiseOn()||E.e.dead){ G.escort=null; return; } E.t-=dt; const zl=G.level.zoneAt(P.pos.x,P.pos.z,P.pos.y);
    if(zl<=G.cred){ clearInspect(E.e,'“Assim está melhor. Sem passe vermelho, não quero ver você lá de novo.”'); }
    else if(E.t<=0){ G.escort=null; blowDisguise(E.e,'credencial'); } }
}
function inspectHUD(){
  const box=$('#inspBox'); if(!box) return; const e=G&&G.inspector;
  if(!G||!G.disguise||!disguiseOn()||!e||e.dead){ box.hidden=true; return; }
  const P=G.player, d=Math.hypot(P.pos.x-e.pos.x,P.pos.z-e.pos.z); let t,s,v,cls='';
  if(G.escort){ t='Área restrita'; s='Volte para uma área do seu passe'; v=G.escort.t/(G.diff==='veterano'?8:G.diff==='recruta'?14:11); cls='bad'; }
  else if(G.papers){ t='O guarda examina os papéis…'; s='Fique perto e não se mexa muito'; v=G.papers.t/G.papers.dur; cls='go'; }
  else if(!e.reached&&d>3.8){ t='Inspeção de documentos'; s=(P.holster?'Pare e espere o guarda chegar':'Guarde a arma (H) e espere o guarda'); v=1; }
  else { t='“Documentos!”'; s=(APP.touch?'USAR':'E')+' — entregar o passe'+(P.holster?'':' (a arma será guardada)'); v=clamp(1-(e.waitT2||0)/7,0,1); cls='warn'; }
  box.hidden=false; box.className='insp '+cls; $('#inspT').textContent=t; $('#inspS').textContent=s; $('#inspB').style.width=(v*100).toFixed(1)+'%';
}