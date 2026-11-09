'use strict';



/* =========================================================
   OPERAÇÃO 8 — Bir Zitoun / Henchir Souar (30/04/1943, 13h)
   fuzil com luneta, visão ampliada, aliada Yasmina,
   defesa da retirada até a patrulha do LRDG
   ========================================================= */
WEAPONS.rifle={id:'rifle',name:'Lee-Enfield Nº 4 (T)',cat:'Fuzil com luneta',mode:'FERROLHO',auto:false,scope:true,rpm:46,dmg:120,mag:5,reserveMax:40,reload:{out:.45,in:2.3,end:2.9},spreadHip:3.4,spreadADS:.04,bloom:1.4,recoil:2.4,recoilX:.3,adsTime:.32,noise:46,falloff:[70,170,.8],fovADS:15,ammoName:'munição .303'};
EW.mg={dmg:8,interval:.075,burst:[7,14],pause:[1,1.8],mag:75,reload:4.2,spread:2.4,noise:46,len:.62,drop:{type:'smg',n:24}};
function buildVM08(B,M){
  const g=new T.Group(); const wood=new T.MeshPhongMaterial({color:0x6a4a2c,shininess:14,specular:0x151515});
  B(g,.05,.07,.62,0,-.02,-.12,wood); B(g,.045,.12,.2,0,-.07,.22,wood,-.2); B(g,.022,.022,.5,0,.01,-.62,M.gun); B(g,.03,.03,.16,0,.02,-.34,M.gun);
  const sc=new T.Mesh(new T.CylinderGeometry(.022,.022,.3,10),M.gun); sc.rotation.x=Math.PI/2; sc.position.set(0,.075,-.08); g.add(sc);
  for(const z of [-.24,.08]){ const r=new T.Mesh(new T.CylinderGeometry(.028,.028,.05,10),M.gun); r.rotation.x=Math.PI/2; r.position.set(0,.075,z); g.add(r); }
  B(g,.012,.04,.012,.03,.02,.02,M.gun); const bolt=new T.Mesh(new T.SphereGeometry(.014,8,6),M.gun); bolt.position.set(.045,.03,.03); g.add(bolt);
  const mag=new T.Group(); g.add(mag); B(mag,.035,.07,.06,0,-.08,-.05,M.gun);
  B(g,.05,.07,.08,0,-.07,.1,M.skin); B(g,.062,.062,.3,.03,-.12,.26,M.sleeve,-.25); B(g,.05,.06,.07,-.02,-.06,-.36,M.skin); B(g,.06,.06,.3,-.07,-.11,-.22,M.sleeve,-.5);
  const muzzle=new T.Object3D(); muzzle.position.set(0,.01,-.88); g.add(muzzle);
  VM.models.rifle={g,mag,muzzle,hip:V3(.15,-.13,-.36),ads:V3(0,-.075,-.3),magHome:mag.position.clone()};
}
function scoped(){ const P=G.player, w=WEAPONS[P.cur]; const on=!!(w&&w.scope&&P.adsT>.86&&!G.camMode&&!P.dead&&!P.holster); const el=$('#scope'); if(el&&el.hidden===on) el.hidden=!on; const ch=$('#crosshair'); if(ch) ch.style.visibility=on?'hidden':''; return on; }
/* ---- veículos que se movem ---- */
function makeCargo08(x,z,yaw,lrdg){
  const g=new T.Group(); g.position.set(x,0,z); g.rotation.y=yaw; scene.add(g);
  const v={g,x,z,yaw,speed:0,pathI:0,state:'IDLE',lrdg:!!lrdg};
  const col=lrdg?0xc8a48c:0x8a8064, body=hm(col), dark=hm(0x2a2824);
  const part=(w,h,d,px,py,pz,m,surf)=>{ const o=new T.Mesh(BOX(w,h,d),m); o.position.set(px,py,pz); o.userData.mat=surf||'metal'; g.add(o); W.shootables.push(o); return o; };
  part(2,.3,7.6,0,.8,.2,dark); part(2.2,1.3,1.6,0,1.65,2.4,body); part(1.7,.8,1.1,0,1.3,3.75,body);
  if(lrdg){ part(2.2,.6,4.6,0,1.25,-1.4,body,'wood'); for(const s of [-1,1]) part(.06,.5,4.4,s*1.08,1.8,-1.4,body,'wood'); const gun=new T.Group(); gun.position.set(0,2.2,-.2); g.add(gun); const b=new T.Mesh(new T.CylinderGeometry(.035,.035,.9,8),dark); b.rotation.x=Math.PI/2; b.position.z=.4; gun.add(b); const dr=new T.Mesh(new T.CylinderGeometry(.13,.13,.05,12),dark); dr.position.set(0,.12,.1); gun.add(dr); gun.add(new T.Mesh(BOX(.06,.5,.06),dark)); v.gun=gun;
    for(const k of [-2.6,-1.8]) part(.5,.5,.5,.5,1.7,k,hm(0x6a6a50),'wood'); part(.9,.06,.3,0,2.45,2.4,hm(0x3a3a2e)); }
  else { part(2.2,.5,4.6,0,1.2,-1.4,body,'wood'); const cv=new T.Mesh(new T.CylinderGeometry(1.15,1.15,4.6,12,1,true,-Math.PI/2,Math.PI),hm(0x7a7458)); cv.material.side=T.DoubleSide; cv.rotation.x=Math.PI/2; cv.position.set(0,1.5,-1.4); cv.scale.y=1; g.add(cv); }
  v.tires=[]; for(const [a,b] of [[-1,-2.6],[1,-2.6],[-1,-1.5],[1,-1.5],[-1,3.5],[1,3.5]]){ const w=new T.Mesh(new T.CylinderGeometry(.44,.44,.28,12),MAT.tire); w.rotation.z=Math.PI/2; w.position.set(a*1.0,.44,b); g.add(w); v.tires.push(w); }
  cargoDecor08(g,lrdg); v.solid=addSolidOnly(0,0,0,0,2.6,0,true); truckBox07(v); return v;
}
function driveVeh08(v,dt){
  const path=v.path, wp=path[Math.min(v.pathI,path.length-1)], P=G.player;
  const fx=Math.sin(v.yaw), fz=Math.cos(v.yaw), ax=v.x+fx*5, az=v.z+fz*5;
  const blocked=!P.dead&&Math.hypot(P.pos.x-ax,P.pos.z-az)<2.8;
  const last=v.pathI>=path.length-1, dist=Math.hypot(wp[0]-v.x,wp[1]-v.z);
  const vmax=last?Math.min(9,dist*.9+.5):9;
  v.speed=blocked?Math.max(0,v.speed-dt*10):Math.min(vmax,v.speed+dt*3);
  const want=Math.atan2(wp[0]-v.x,wp[1]-v.z); v.yaw+=clamp(angDiff(v.yaw,want),-1,1)*Math.min(1.2,.3+v.speed*.2)*dt;
  v.x+=Math.sin(v.yaw)*v.speed*dt; v.z+=Math.cos(v.yaw)*v.speed*dt; setTruckPose07(v);
  for(const w of v.tires) w.rotation.x+=v.speed*dt/.44;
  v.engT=(v.engT||0)-dt; if(v.engT<=0){ v.engT=.35; AudioSys.play('engine',V3(v.x,1,v.z),.9); }
  if(Math.random()<dt*8&&v.speed>2) FX.puff(t2w(v,rnd(-1,1),.3,-4),1,0xc8b08a,1.2,1.6,V3(0,.5,0),.35);
  if(dist<2.4){ if(last){ v.speed=0; v.state='ARRIVED'; return true; } v.pathI++; }
  return false;
}
/* ---- dados ---- */
const ENEMY_DEFS_08=[
  {id:'spot',x:-15.5,z:-13.5,yaw:-Math.PI/2-.2,weapon:'rifle',helmet:true,fixed:true,sight:1.45},
  {id:'mg1',x:-22.6,z:2,yaw:-Math.PI/2,weapon:'smg',helmet:true,fixed:true,mg:true},
  {id:'mg2',x:4,z:23,yaw:0,weapon:'smg',helmet:true,fixed:true,mg:true},
  {id:'ten',x:-4,z:9.4,yaw:Math.PI/2,weapon:'pistol',officer:true},
  {id:'g1',x:3.8,z:9,yaw:-Math.PI/2,weapon:'rifle',helmet:true},
  {id:'p1',x:-21,z:-19,weapon:'rifle',helmet:true,patrol:[[-21,-19],[21,-19],[21,19],[-21,19]]},
  {id:'p2',x:-9,z:-1,weapon:'smg',patrol:[[-9,-1],[9,-1.4],[9,-9],[-9,-9]]},
  {id:'w1',x:-1.4,z:3.4,yaw:2.6,weapon:'rifle'},
  {id:'r1',x:11.6,z:-21,yaw:-1.2,weapon:'rifle'},
  {id:'r2',x:14,z:-25.6,yaw:2.8,weapon:'rifle',helmet:true,sleep:true},
  {id:'pl1',x:-58,z:-22,weapon:'rifle',helmet:true,patrol:[[-58,-22],[-46,4],[-58,30],[-46,4]]},
  {id:'pl2',x:41,z:-8,yaw:-.4,weapon:'rifle',helmet:true},
  {id:'h1',x:73.4,z:24,yaw:Math.PI,weapon:'rifle'},
];
let BUSH08=[];
function light08(x,z){
  for(const b of BUSH08){ const dx=x-b[0], dz=z-b[1]; if(dx*dx+dz*dz<b[2]*b[2]) return .24; }
  if(x>6&&x<12&&z>6&&z<12) return .4; if(x>-8&&x<0&&z>6&&z<12.4) return .5;
  return .88;
}
function buildLevel08(){
  M5=mats05(); M6=mats06(); const M=M6;
  scene.background=new T.Color(0xc8d0d8); scene.fog=new T.FogExp2(0xd8ccb4,.0042);
  skyDome(808,[[0,'#3e6a9c'],[.3,'#6a94bc'],[.44,'#b8c8d4'],[.5,'#e8dcc4'],[.53,'#c8a882'],[1,'#8a6a4a']],null,6);
  scene.add(new T.HemisphereLight(0xc8d8f0,0xa88a64,.72));
  const sun=new T.DirectionalLight(0xfff0d8,1.15); sun.target.position.set(0,0,0); sun.position.set(-34,80,26); scene.add(sun); scene.add(sun.target);
  scene.add(new T.AmbientLight(0x7a6a5a,.34));
  // ---- terreno ----
  floorPlane(290,210,10,-2,M.sand,'stone',0);
  floorPlane(6,80,40,-55,M.road,'stone',.01); floorPlane(40,5,26,24,M.road,'stone',.011); floorPlane(76,46,88,0,M.road,'stone',.012);
  const rock=(x0,x1,z0,z1,h)=>addBlock(x0,x1,z0,z1,h,{mat:M.rock,surf:'stone',top:M.rock,seg:4});
  rock(-128,36,-104,-96,5); rock(44,146,-104,-96,5); rock(-128,146,96,104,4.5); rock(-128,-118,-96,96,9); rock(138,146,-96,-12,4.5); rock(138,146,12,96,4.5);
  addSolidOnly(36,44,-108,-107.6,6); addSolidOnly(150,150.4,-12,12,6);
  for(const [x,z,s] of [[-40,-70,9],[10,-75,8],[60,-70,10],[100,-60,7],[-30,70,9],[30,72,8],[120,60,9],[-60,60,7],[80,80,6]]){ const d=new T.Mesh(new T.SphereGeometry(s,16,8,0,Math.PI*2,0,Math.PI/2),M.dune); d.scale.y=.22; d.position.set(x,0,z); scene.add(d); }
  // planalto (crista) a oeste
  addWalk(-118,-80,-50,46,4.2,{mat:M.rock,top:M.rock,seg:4});
  stairSteps('x',-80,1,-30,-26.8,4.0,20,M.rock,M.rock); stairSteps('x',-80,1,24,27.2,4.0,20,M.rock,M.rock);
  const boulder=(x,z,s,h,y0)=>{ const m=new T.Mesh(new T.DodecahedronGeometry(s,0),M.rock); m.scale.set(1,h/s/2,1); m.position.set(x,(y0||0)+h*.45,z); m.rotation.y=x*.7; m.userData.mat='stone'; scene.add(m); W.shootables.push(m); addSolidOnly(x-s*.75,x+s*.75,z-s*.75,z+s*.75,h*.9,y0||0,true); };
  for(const [x,z,s,h] of [[-86,-14,1.4,1.5],[-84,8,1.6,1.4],[-88,22,1.2,1.3],[-98,-30,1.8,2],[-100,14,1.5,1.6],[-84,-38,1.3,1.4],[-96,36,1.6,1.8]]) boulder(x,z,s,h,4.2);
  for(const [x,z,s,h] of [[-62,-6,1.5,1.4],[-52,20,1.3,1.2],[-44,-24,1.6,1.5],[-34,6,1.2,1.1],[-66,34,1.4,1.3],[-28,-30,1.5,1.4],[-38,32,1.3,1.2],[26,-34,1.6,1.5],[30,8,1.3,1.2],[46,26,1.4,1.3],[56,-30,1.5,1.4],[34,40,1.6,1.6],[-70,-34,1.4,1.4]]) boulder(x,z,s,h,0);
  // arbustos de espinho (camuflagem)
  BUSH08=[]; const bush=(x,z,r)=>{ BUSH08.push([x,z,r]); const R=mulberry32(Math.round(x*31+z*7)); for(let k=0;k<4;k++){ const m=new T.Mesh(new T.SphereGeometry(r*(.45+R()*.25),7,5),M.shrub); m.scale.y=.55; m.position.set(x+(R()-.5)*r*.9,.25+R()*.25,z+(R()-.5)*r*.9); scene.add(m); } };
  for(const [x,z,r] of [[-72,-14,1.7],[-68,12,1.6],[-60,-30,1.8],[-56,6,1.6],[-50,-12,1.7],[-48,28,1.5],[-42,-4,1.8],[-36,18,1.6],[-32,-16,1.5],[-28,26,1.7],[-26,-6,1.5],[-62,40,1.6],[-74,26,1.5],[24,-12,1.6],[28,20,1.7],[36,-22,1.5],[48,6,1.8],[52,-16,1.6],[44,34,1.5],[58,22,1.6],[64,40,1.7],[34,-44,1.6],[-14,30,1.6],[14,30,1.5],[-30,-40,1.6]]) bush(x,z,r);
  // caminhão do LRDG emboscado + sargento morto
  { const ch=hm(0x262220), pk=hm(0x7a5a48), Y=4.2;
    addBlock(-95,-87.6,-6.9,-5.1,.22,{y0:Y+.5,mat:ch,surf:'metal',seg:1}); addBlock(-95,-90.6,-7.1,-4.9,.12,{y0:Y+.72,mat:pk,surf:'wood',seg:1});
    for(const z of [-7.1,-5.02]) addBlock(-95,-90.6,z,z+.08,.5,{y0:Y+.84,mat:pk,surf:'wood',seg:1}); addBlock(-95.08,-95,-7.1,-4.9,.5,{y0:Y+.84,mat:pk,surf:'wood',seg:1});
    addBlock(-90.4,-89,-7,-5,.55,{y0:Y+.72,mat:ch,surf:'metal',seg:1}); addBlock(-89,-87.6,-6.7,-5.3,.7,{y0:Y+.72,mat:pk,surf:'metal',seg:1}); addBlock(-89.05,-88.95,-6.9,-5.1,.5,{y0:Y+1.42,mat:ch,surf:'metal',seg:1,solid:false});
    addSolidOnly(-95.1,-87.5,-7.2,-4.8,1.5,Y,true);
    for(const [a,b,fl] of [[-93.6,-7.25,1],[-93.6,-4.75,0],[-88.4,-7.25,0],[-88.4,-4.75,1]]){ const w=addMesh(new T.CylinderGeometry(.44,.44,.26,10),MAT.tire,a,Y+(fl?.3:.44),b,'metal'); w.rotation.x=Math.PI/2; if(fl) w.scale.z=.7; }
    for(let k=0;k<6;k++) FX&&0;
    const vk=new T.Mesh(new T.CylinderGeometry(.03,.03,.9,8),ch); vk.rotation.z=1.2; vk.position.set(-91.6,Y+1.6,-6); scene.add(vk);
    for(let k=0;k<4;k++) addMesh(BOX(.5,.4,.6),hm(0x5a5a46),-96.2+k*.2,4.4,-9+k*.7,'wood').rotation.y=k;
    const body=new T.Group(); body.position.set(-91.6,4.32,-9.2); body.rotation.y=.4; const kh=hm(0xa8946a); const bp=(w,h,d,x,y,z,m)=>{ const o=new T.Mesh(BOX(w,h,d),m||kh); o.position.set(x,y,z); body.add(o); };
    bp(.4,.2,.7,0,0,0); bp(.18,.16,.2,0,.02,.48,hm(0xb88a64)); bp(.2,.16,.24,0,.08,.48,hm(0x8a7a50)); bp(.14,.12,.6,-.12,0,-.64,hm(0x8a7a5a)); bp(.14,.12,.6,.12,0,-.64,hm(0x8a7a5a)); bp(.5,.1,.12,-.3,.02,.2); scene.add(body);
    addMesh(BOX(.5,.36,.32),hm(0x3e4234),-92.6,4.4,-8.2,'metal'); addMesh(new T.CylinderGeometry(.01,.01,1.6,4),MAT.darkMetal,-92.5,5.2,-8.2,null); }
  const rifleM=new T.Group(); rifleM.position.set(-91,4.26,-8.6); rifleM.rotation.y=1.1; { const a=new T.Mesh(BOX(.06,.06,1.1),hm(0x5a3e24)); rifleM.add(a); const s=new T.Mesh(new T.CylinderGeometry(.025,.025,.3,8),hm(0x222222)); s.rotation.x=Math.PI/2; s.position.set(0,.06,.05); rifleM.add(s); } scene.add(rifleM);
  // ---- ruínas de Bir Zitoun ----
  const sw=(x0,x1,z0,z1,h)=>addBlock(x0,x1,z0,z1,h,{mat:M.adobe,surf:'stone',top:M.lime,seg:2,cover:h<1.6});
  sw(-18,-6,-16.6,-16,3.4); sw(-3,6,-16.6,-16,1.2); sw(9,18,-16.6,-16,2.6); sw(-18,-17.4,-16,-6,3); sw(-18,-17.4,-1,8,1.1); sw(-18,-17.4,12,16.6,2.2);
  sw(-14,-4,16,16.6,1.3); sw(0,9,16,16.6,2.8); sw(13,18,16,16.6,1.2); sw(17.4,18,-12,-3,2.4); sw(17.4,18,2,10,1.2); sw(17.4,18,13,16,3);
  addWalk(-18,-13,-16,-11,5,{mat:M.adobe,top:M.lime,seg:2}); for(const [a,b] of [[-17.8,-15.8],[-13.2,-15.8],[-17.8,-11.2],[-13.2,-11.2]]) addBlock(a-.2,a+.2,b-.2,b+.2,.7,{y0:5,mat:M.adobe,surf:'stone',seg:1});
  for(const [x,h] of [[-10,3.6],[-6,1.4],[-2,3.6],[2,2.2],[6,3.6],[10,.9]]){ addMesh(new T.CylinderGeometry(.42,.48,h,12),M.lime,x,h/2,-4.4,'stone'); addSolidOnly(x-.45,x+.45,-4.85,-3.95,h,0,true); if(h>3) addMesh(BOX(1.1,.3,1.1),M.lime,x,h+.15,-4.4,'stone'); }
  addMesh(BOX(4.6,.5,1),M.lime,-4,3.85,-4.4,'stone'); addMesh(new T.CylinderGeometry(.5,.5,.9,12),M.lime,-7,.45,-8.6,'stone').rotation.z=Math.PI/2; addSolidOnly(-7.45,-6.55,-9.1,-8.1,.9,0,true);
  addMesh(new T.CylinderGeometry(1.1,1.2,.9,16),M.lime,-2,.45,1,'stone'); addSolidOnly(-3,-1,0,2,.9,0,true); addMesh(BOX(.12,1.6,.12),M.wood,-2.9,.8,1,'wood'); addMesh(BOX(.12,1.6,.12),M.wood,-1.1,.8,1,'wood'); addMesh(BOX(2,.1,.1),M.wood,-2,1.6,1,'wood');
  // cisterna (cela de Yasmina)
  wallOpen('x',6,6.2,6,12,3,[],M.adobeD,{inner:{}}); wallOpen('x',11.8,12,6,12,3,[],M.adobeD,{inner:{}}); wallOpen('z',11.8,12,6.2,11.8,3,[{c:9,w:.8,sill:1.6,top:2.2}],M.adobeD,{inner:{}}); wallOpen('z',6,6.2,6.2,11.8,3,[{c:9,w:1.3}],M.adobeD,{inner:{}});
  addBlock(5.8,12.2,5.8,12.2,.3,{y0:3,mat:M.adobe,bottom:MAT.ceil,surf:'stone',seg:2});
  makeDoor('cell',{x:6.1,z:9,w:.1,d:1.3,h:2.3,mat:MAT.darkMetal,offset:V3(0,0,1.3),locked:true,npc:false,nav:true,snd:'door'});
  for(let k=0;k<5;k++) addMesh(BOX(.04,2.2,.04),MAT.darkMetal,5.98,1.1,8.5+k*.25,null);
  addBlock(10.8,11.8,10.4,11.8,.45,{mat:M.cot,surf:'cloth',seg:1}); addMesh(BOX(.5,.4,.4),hm(0x6a5a40),7,.2,11.3,'wood');
  // barraca do oficial
  tent(-8,0,6,12.4,3,new T.MeshLambertMaterial({color:0xb8a882,side:T.DoubleSide})); addBlock(-6.6,-4.4,10.6,11.6,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); const radio8=addMesh(BOX(.6,.45,.4),hm(0x3a3e34),-4,1.0,11.2,'metal');
  // ninhos de metralhadora
  const nest=(x,z,open)=>{ for(let a=0;a<12;a++){ const t=a/12*Math.PI*2; if(Math.abs(angDiff(t,open))<.5) continue; const bx=x+Math.sin(t)*1.9, bz=z+Math.cos(t)*1.9; sandbags(bx-.5,bx+.5,bz-.5,bz+.5,.95); } const mg=new T.Group(); mg.position.set(x+Math.sin(open)*1.4,1.05,z+Math.cos(open)*1.4); const b=new T.Mesh(new T.CylinderGeometry(.03,.035,1.1,8),hm(0x222222)); b.rotation.x=Math.PI/2; b.position.z=.3; mg.add(b); mg.rotation.y=open; scene.add(mg); };
  nest(-22.6,2,-Math.PI/2); nest(4,23,0);
  truck04(14,-23); crate(10,-24,1.1,1); crate(10,-25.2,1,.9); car(-24,-12,true);
  // ---- pista de Henchir Souar ----
  for(let x=52;x<=124;x+=8){ addMesh(BOX(.6,.25,.6),M.lime,x,.12,-18,'stone'); addMesh(BOX(.6,.25,.6),M.lime,x,.12,18,'stone'); }
  const hutW=(x0,x1,z0,z1,h)=>addBlock(x0,x1,z0,z1,h,{mat:M.adobeD,surf:'stone',top:M.adobe,seg:2,cover:true});
  hutW(70,77,26,26.5,1.4); hutW(70,70.5,26.5,33,1.2); hutW(76.5,77,26.5,30,1.6); hutW(70.5,74,32.5,33,1.1);
  { const f=new T.Mesh(new T.CylinderGeometry(.9,.6,9,10),hm(0x6a6a58)); f.rotation.z=Math.PI/2; f.rotation.y=.4; f.position.set(92,.8,-30); scene.add(f); W.shootables.push(f); f.userData.mat='metal'; addSolidOnly(87.6,96.4,-32.4,-27.6,1.6,0,true);
    const wg=new T.Mesh(BOX(11,.16,1.8),hm(0x5a5a4a)); wg.position.set(91,.3,-28.6); wg.rotation.y=.4; wg.rotation.z=.12; scene.add(wg); }
  drums(58,60.6,28,30.4,1.8,M.drum); sandbags(84,88,8,9); sandbags(96,100,-9,-8); crate(64,6,1.2,1.1); crate(112,10,1.1,1); sandbags(104,108,24,25);
  addMesh(BOX(.12,6,.12),M.wood,124,3,24,'wood'); { const ws=new T.Mesh(new T.ConeGeometry(.35,1.6,8,1,true),hm(0xd86a3a)); ws.rotation.z=Math.PI/2; ws.position.set(124.8,5.6,24); scene.add(ws); }
  const pots=[]; for(const [x,z] of [[62,-14],[108,-14]]){ const m=addMesh(new T.CylinderGeometry(.2,.2,.4,10),hm(0x4a5a3a),x,.2,z,'metal'); pots.push({x,z,m}); }
  // veículos
  const lrdg=[makeCargo08(168,-5,-Math.PI/2,true),makeCargo08(176,6,-Math.PI/2,true)]; lrdg[0].path=[[140,-5],[118,-6]]; lrdg[1].path=[[140,6],[112,7]]; for(const v of lrdg){ v.g.visible=false; v.solid.active=false; }
  // ---- navegação ----
  const N=[];
  for(let x=-112;x<=-84;x+=6) for(let z=-46;z<=42;z+=6) N.push({x,z});
  for(let k=0;k<20;k++){ N.push({x:-80+.36*k+.18,z:-28.4}); N.push({x:-80+.36*k+.18,z:25.6}); } N.push({x:-81.6,z:-28.4},{x:-81.6,z:25.6},{x:-71.6,z:-28.4},{x:-71.6,z:25.6});
  for(let x=-72;x<=134;x+=7) for(let z=-90;z<=90;z+=7) N.push({x,z});
  for(let x=-21;x<=21;x+=2.6) for(let z=-20;z<=20;z+=2.6) N.push({x,z});
  N.push({x:9,z:9},{x:7.4,z:9},{x:4.6,z:9},{x:9.2,z:7.2},{x:9.2,z:10.8});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.45)); W.nav.link=7.6; buildNav();
  return {sun,radio8,rifleM,pots,lrdg,trucks8:[]};
}
function objectives08(){ return [
  {id:'radio',text:'Use o rádio do caminhão do LRDG emboscado, no alto da crista',state:'active',marker:{x:-92.6,z:-8.2}},
  {id:'yasmina',text:'Liberte Yasmina na cisterna de Bir Zitoun',state:'hidden',marker:{x:6,z:9}},
  {id:'smoke',text:'Com Yasmina, acenda as duas latas de fumaça na pista de Henchir Souar (0/2)',state:'hidden',marker:{x:62,z:-14}},
  {id:'hold',text:'Resista até a patrulha do LRDG chegar',state:'hidden'},
  {id:'board',text:'Embarque com Yasmina no caminhão do LRDG',state:'hidden',marker:{x:112,z:7}},
  {id:'sniper',text:'Opcional: abata o observador da atalaia a mais de 80 m',state:'active',optional:true},
  {id:'mgs',text:'Opcional: cale as duas metralhadoras de Bir Zitoun',state:'active',optional:true},
  {id:'quietRescue',text:'Opcional: solte Yasmina sem soar o alarme',state:'active',optional:true},
]; }
function giveRifle08(){ const P=G.player; if(!P.weapons.includes('rifle')) P.weapons.push('rifle'); const a=P.ammo.rifle=P.ammo.rifle||{mag:0,reserve:0}; a.mag=5; a.reserve=Math.min(WEAPONS.rifle.reserveMax,a.reserve+Math.round(20*D().pickups)); G.hud.ammoT=4; }
function interact08(R){
  const I=W.interactables, F=()=>G.flags;
  I.push({id:'rifle8',pt:()=>V3(-91,4.4,-8.6),r:2.4,label:()=>F().gotRifle?null:'Pegar o fuzil com luneta do sargento',
    use:()=>{ F().gotRifle=true; R.rifleM.visible=false; giveRifle08(); switchWeapon('rifle'); AudioSys.play('pickup'); pickupMsg('Lee-Enfield Nº 4 (T) — tecla 5');
      G.radioMsg('DICA','Botão direito mira pela luneta. A bala da .303 derruba a mais de 100 m, mas o tiro é ouvido de longe.','tip'); cp08(); }});
  I.push({id:'radio8w',pt:()=>V3(-92.6,4.5,-8.2),r:2.4,hold:()=>2.6,label:()=>obj('radio').state==='active'?'Chamar a patrulha Y2 no rádio (segure)':null,
    use:()=>{ complete('radio'); activate('yasmina'); AudioSys.play('morse'); F().called=true;
      G.radioMsg('Y2 (LRDG)','“Tocha, aqui Y2. Pegamos vocês na pista velha de Henchir Souar, a leste das ruínas. Marquem com duas fumaças quando estiverem lá.”');
      setTimeout(()=>{ if(G&&G.levelId==='08'&&!G.ending) G.radioMsg('ÉLISE','Não sem a Yasmina. Ela está na cisterna de Bir Zitoun.'); },5200); cp08(); }});
  I.push({id:'cellkey',pt:()=>{ const k=F().keySpot; return k?V3(k[0],.3,k[1]):V3(0,-99,0); },r:2.2,label:()=>F().keySpot&&!F().cellKey?'Pegar a chave da cisterna':null,
    use:()=>{ F().cellKey=true; if(G.keyMesh8) G.keyMesh8.visible=false; AudioSys.play('pickup'); pickupMsg('Chave da cisterna'); }});
  I.push({id:'celldoor',pt:()=>V3(5.9,1.2,9),r:2.4,skipSolid:()=>W.doors.cell.solid,
    label:()=>{ const d=W.doors.cell; if(d.state!=='LOCKED') return null; return F().cellKey?'Abrir a grade com a chave':'Forçar o cadeado da grade (segure — barulhento)'; },
    hold:()=>F().cellKey?.8:(G.diff==='veterano'?5:4),
    use:()=>{ const d=W.doors.cell; if(!F().cellKey){ AudioSys.play('clank',d.mesh.position,1.3); AudioSys.play('metal',d.mesh.position,1); emitNoise(V3(6,0,9),16,'lure',null); pickupMsg('Cadeado arrombado'); } else AudioSys.play('unlock'); d.state='CLOSED'; openDoor(d,null); }});
  I.push({id:'yas',pt:()=>{ const A=G.ally; return V3(A.pos.x,A.pos.y+1.1,A.pos.z); },r:2.4,skip:true,
    label:()=>{ const A=G.ally; if(!A) return null; if(A.downed) return 'Reanimar Yasmina'; if(!A.joined&&W.doors.cell.state!=='LOCKED') return 'Soltar Yasmina'; return null; },
    hold:()=>G.ally.downed?1.6:0,
    use:()=>{ const A=G.ally; if(A.downed){ A.revive(); return; } A.joined=true; A.mode='FOLLOW'; A.hidden=false; complete('yasmina'); activate('smoke'); if(!G.alarm&&obj('quietRescue').state==='active') complete('quietRescue');
      G.radioMsg('YASMINA','Élise! Achei que você estava no fundo do uádi. Me dá um fuzil — tirei um Carcano do guarda. Para onde?'); setTimeout(()=>{ if(G&&G.levelId==='08'&&!G.ending) G.radioMsg('ÉLISE','Pista velha de Henchir Souar, a leste. O LRDG vem nos buscar. (G: Yasmina segue / espera)'); },4800); cp08(); }});
  R.pots.forEach((p,i)=>I.push({id:'pot'+i,pt:()=>V3(p.x,.5,p.z),r:2.3,hold:()=>1.2,label:()=>obj('smoke').state==='active'&&!F()['pot'+i]?'Acender a lata de fumaça (segure)':null,
    use:()=>{ F()['pot'+i]=true; F().potN=(F().potN||0)+1; AudioSys.play('flare',V3(p.x,.5,p.z)); pickupMsg('Fumaça '+F().potN+'/2'); const o=obj('smoke'); o.text='Com Yasmina, acenda as duas latas de fumaça na pista de Henchir Souar ('+F().potN+'/2)';
      if(F().potN>=2){ complete('smoke'); activate('hold'); F().holdT=0; G.radioMsg('Y2 (LRDG)','“Vemos as duas fumaças. Aguentem firme — estamos chegando pelo leste.”','warn'); setTimeout(()=>{ if(G&&G.levelId==='08'&&!G.ending) G.radioMsg('YASMINA','Caminhões na estrada do norte! Eles também viram a fumaça.','warn'); },3000); cp08(); }
      else { const nx=R.pots.find((q,j)=>!F()['pot'+j]); if(nx){ o.marker={x:nx.x,z:nx.z}; } refreshObjectiveUI(); } }}));
  I.push({id:'board',pt:()=>{ const v=R.lrdg[1]; return V3(v.x,1.6,v.z); },r:4,skip:true,
    label:()=>{ if(obj('board').state!=='active') return null; const A=G.ally; if(A.downed) return 'Yasmina está caída — reanime-a primeiro'; if(Math.hypot(A.pos.x-G.player.pos.x,A.pos.z-G.player.pos.z)>25) return 'Espere Yasmina (G: chamar)'; return 'Embarcar no caminhão do LRDG'; },
    locked:()=>{ const A=G.ally; return A.downed||Math.hypot(A.pos.x-G.player.pos.x,A.pos.z-G.player.pos.z)>25; },
    use:()=>{ const A=G.ally; if(A.downed||Math.hypot(A.pos.x-G.player.pos.x,A.pos.z-G.player.pos.z)>25){ if(A.mode!=='FOLLOW') toggleAlly(); return; } missionComplete(); }});
}
function pickups08(){
  addPickup('d_nade1',-93.4,-9.6,'nade',2,4.3); addPickup('d_med1',-95.6,-8.8,'med',35,4.3); addPickup('d_rif1',-98,-7,'rifle',10,4.3);
  addPickup('d_med2',-5.4,11.1,'med',35,.85); addPickup('d_pis1',-6,11.2,'pistol',8,.85); addPickup('d_smg1',12,-24,'smg',32,.1); addPickup('d_rif2',-15.6,-13.6,'rifle',10,5.05);
  addPickup('d_med3',72,30,'med',40,.1); addPickup('d_smg2',74.6,28,'smg',32,.1); addPickup('d_nade2',73.2,31.6,'nade',2,.1); addPickup('d_rif3',86,8.6,'rifle',10,.1); addPickup('d_med4',98,-9.6,'med',35,.1);
  G.player.nades=G.player.nades||0;
}
function wave08(k){
  const R=G.refs, defs=[
    {path:[[40,-110],[40,-50],[56,-40],[64,-36]],men:[['smg',1],['rifle',0],['rifle',0],['smg',0],['rifle',1]]},
    {path:[[-74,30],[-20,30],[20,30],[40,26],[52,20]],men:[['rifle',0],['smg',1],['rifle',0],['rifle',0],['smg',0]]},
  ][k];
  if(!defs) return; const p=defs.path; const v=makeCargo08(p[0][0],p[0][1],Math.atan2(p[1][0]-p[0][0],p[1][1]-p[0][1]),false); v.path=p.slice(1); v.state='DRIVE'; v.men=defs.men; v.k=k; R.trucks8.push(v);
}
function unload08(v){
  v.men.forEach(([w,n],i)=>{ const p=t2w(v,(i%2?1:-1)*1.4,0,-4.6-Math.floor(i/2)*1.1); const e=spawnEnemy04({id:'w'+v.k+'_'+i,x:p.x,z:p.z,weapon:w,helmet:true,nades:n},true); if(e) e.reactionT+=i*.25; });
  AudioSys.play('shout',V3(v.x,1,v.z)); G.radioMsg('YASMINA',v.k===0?'Desembarcaram ao norte da pista!':'Mais um caminhão, vindo das ruínas — oeste!','warn');
}
function footWave08(){ const P=G.player; [['rifle',1,92,84],['smg',0,96,86],['rifle',0,88,88],['smg',1,100,82]].forEach(([w,n,x,z],i)=>{ spawnEnemy04({id:'f'+i,x,z,weapon:w,helmet:true,nades:n},true); }); G.radioMsg('YASMINA','Infantaria pelo sul, rente ao chão! Estão tentando nos cercar.','warn'); }
function update08(dt){
  const P=G.player, F=G.flags, R=G.refs, A=G.ally;
  if(!F.mgSet){ F.mgSet=true; for(const e of G.enemies) if(e.def.mg){ e.ew=EW.mg; e.mag=EW.mg.mag; } }
  else for(const e of G.enemies) if(e.def.mg&&e.ew!==EW.mg){ e.ew=EW.mg; }
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('ÉLISE','O carro capotou no uádi e levaram a Yasmina para Bir Zitoun. Lá embaixo, ao lado do caminhão inglês emboscado, deve ter um rádio.','tip'); }
  if(!F.i2&&G.introT>9){ F.i2=true; G.radioMsg('DICA','No deserto eles enxergam longe. Agachada dentro de um arbusto de espinhos você quase some; de pé, no descampado, não.','tip'); }
  // chave do tenente
  const ten=G.enemies.find(e=>e.id==='ten'); if(ten&&ten.dead&&!F.keySpot){ F.keySpot=[+ten.pos.x.toFixed(2),+ten.pos.z.toFixed(2)]; spawnKey08(); if(obj('yasmina').state==='active') G.radioMsg('ÉLISE','O tenente caiu. A chave da cisterna deve estar com ele.','tip'); }
  // observador e metralhadoras
  const sp=G.enemies.find(e=>e.id==='spot'); if(sp&&sp.dead&&!F.spotDone){ F.spotDone=true; const d=Math.hypot(P.pos.x-sp.pos.x,P.pos.z-sp.pos.z); if(d>80&&sp.lastHitBy==='player'){ complete('sniper'); pickupMsg('Observador abatido a '+Math.round(d)+' m'); } else failObjective('sniper'); }
  if(obj('mgs').state==='active'&&G.enemies.filter(e=>e.def.mg).every(e=>e.dead)) complete('mgs');
  if(G.alarm&&obj('quietRescue').state==='active') failObjective('quietRescue');
  // fumaça
  R.pots.forEach((p,i)=>{ if(!F['pot'+i]) return; if(Math.random()<dt*10) FX.puff(V3(p.x+rnd(-.2,.2),.6,p.z+rnd(-.2,.2)),1,i?0xe86a3a:0xd8d0c0,1.6,6,V3(rnd(.6,1.2),1.6,rnd(-.3,.3)),.55); });
  // defesa
  if(obj('hold').state==='active'){
    const total=G.diff==='recruta'?100:G.diff==='veterano'?150:125; F.holdT=(F.holdT||0)+dt; const left=Math.max(0,total-F.holdT);
    G.progress={label:'Patrulha do LRDG chega em '+Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0'),v:1-F.holdT/total};
    if(!F.w0&&F.holdT>5){ F.w0=true; wave08(0); if(!G.alarm) raiseAlarm(); }
    if(!F.w1&&F.holdT>total*.36){ F.w1=true; wave08(1); }
    if(!F.w2&&F.holdT>total*.62){ F.w2=true; footWave08(); }
    if(!F.lrdgGo&&F.holdT>total-13){ F.lrdgGo=true; for(const v of R.lrdg){ v.g.visible=true; v.solid.active=true; v.state='DRIVE'; } G.radioMsg('Y2 (LRDG)','“Tocha, estamos vendo vocês. Cabeça baixa!”'); }
    if(F.holdT>=total&&!F.arrivedMsg){ F.arrivedMsg=true; }
  }
  for(const v of R.trucks8){ if(v.state==='DRIVE'&&driveVeh08(v,dt)){ unload08(v); v.state='EMPTY'; } }
  for(const v of R.lrdg){ if(v.state==='DRIVE'&&driveVeh08(v,dt)){ v.state='FIRE'; v.fireT=0; } }
  if(R.lrdg.every(v=>v.state==='FIRE'||v.state==='DONE')&&R.lrdg[0].state==='FIRE'){
    for(const v of R.lrdg){ v.fireT+=dt; v.cd=(v.cd||0)-dt; if(v.cd>0) continue; v.cd=.12;
      let best=null,bd=95; for(const e of G.enemies){ if(e.dead) continue; const d=Math.hypot(e.pos.x-v.x,e.pos.z-v.z); if(d<bd){ bd=d; best=e; } }
      const m=t2w(v,0,2.3,.4); if(best){ const tp=V3(best.pos.x+rnd(-.6,.6),best.pos.y+1.1,best.pos.z+rnd(-.6,.6)); FX.tracer(m,tp); AudioSys.play('eshot',m,.7); v.gun.lookAt(tp); if(Math.random()<.16) best.takeDamage({dmg:45,region:'chest',dir:V3().subVectors(tp,m).normalize(),point:tp,shooter:'lrdg'}); } }
    if(!F.boardOn&&(R.lrdg[0].fireT>9||G.enemies.every(e=>e.dead))){ F.boardOn=true; complete('hold'); activate('board'); G.progress=null; G.radioMsg('Y2 (LRDG)','“Subam! Vamos embora antes que mandem os blindados.”'); if(A&&!A.downed&&A.mode!=='FOLLOW') toggleAlly(); cp08(); }
  }
  // marcador de fumaça
  if(obj('smoke').state==='active'&&A&&A.joined&&!F.smokeHint&&Math.hypot(P.pos.x-62,P.pos.z+14)<30){ F.smokeHint=true; G.radioMsg('YASMINA','Duas latas, uma em cada ponta da pista. Depois é só aguentar.'); }
}
function spawnKey08(){ const k=G.flags.keySpot; if(!k||G.flags.cellKey) return; const m=new T.Mesh(BOX(.1,.03,.24),hm(0xc8a040)); m.position.set(k[0],.05,k[1]); scene.add(m); G.keyMesh8=m; const l=new T.PointLight(0xffd080,.5,2.5,2); l.position.set(k[0],.5,k[1]); }
function cp08(){ checkpoint(); }
function restore08(s){
  const F=G.flags, R=G.refs, A=G.ally;
  if(F.gotRifle) R.rifleM.visible=false; if(F.keySpot) spawnKey08();
  if(A&&A.joined){ A.hidden=false; }
  F.mgSet=false;
  if(F.boardOn){ for(const v of R.lrdg){ v.g.visible=true; v.solid.active=true; v.x=v.path[v.path.length-1][0]; v.z=v.path[v.path.length-1][1]; setTruckPose07(v); v.state='DONE'; } }
  else if(obj('hold').state==='active'){ F.lrdgGo=false; }
}
function drawMap08(g,w,h){
  g.fillStyle='#e8dcc0'; g.fillRect(0,0,w,h); const S=w/260, X=x=>(x+120)*S, Z=z=>(z+100)*S;
  const rect=(x0,x1,z0,z1,fill,stroke)=>{ g.fillStyle=fill; g.fillRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); if(stroke){ g.strokeStyle=stroke; g.lineWidth=2; g.strokeRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); } };
  rect(-118,-80,-50,46,'#b8a07a','#6a5232'); rect(-18,18,-16.6,16.6,'#d8c8a4','#5a4a32'); rect(6,12,6,12,'#8a7a5a',null); rect(50,126,-20,20,'#d4c4a0','#8a7a5a'); rect(38,42,-100,-10,'#cbb894',null); rect(6,46,22,26,'#cbb894',null);
  g.fillStyle='#7a8a4a'; for(const b of BUSH08){ g.beginPath(); g.arc(X(b[0]),Z(b[1]),Math.max(2,b[2]*S),0,7); g.fill(); }
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'12px serif'; g.fillText(s,X(x),Z(z)); };
  t('CRISTA',-99,-20,'bold 13px serif'); t('caminhão do LRDG',-92,-1,'11px serif'); t('BIR ZITOUN',0,-21,'bold 13px serif'); t('cisterna',9,15.4,'10px serif'); t('atalaia',-15.5,-18,'10px serif');
  t('HENCHIR SOUAR — pista velha',88,-24,'bold 12px serif'); t('estrada do norte',44,-70,'italic 11px serif'); t('casebre',73.5,38,'10px serif'); t('LRDG ⟶',130,2,'italic 12px serif');
  g.fillStyle='#8a2a1a'; for(const [x,z] of [[-22.6,2],[4,23]]){ g.beginPath(); g.arc(X(x),Z(z),4,0,7); g.fill(); } t('MG',-27,0,'bold 10px serif'); t('MG',4,29,'bold 10px serif');
  g.fillStyle='#6a6a6a'; for(const [x,z] of [[62,-14],[108,-14]]){ g.beginPath(); g.arc(X(x),Z(z),4,0,7); g.fill(); } t('fumaça',85,-12,'italic 11px serif');
  g.fillStyle='#4a6a3a'; g.font='italic 11px serif'; g.fillText('arbustos: agachada, ninguém vê',X(-40),Z(56));
}
DOCS.mapa08={title:'Bir Zitoun e Henchir Souar',sub:'Croqui do LRDG — achado no caminhão emboscado',map:'08',body:'',pencil:'Atalaia na esquina NO das ruínas: o observador vê a crista inteira. MG voltada para o oeste.'};
LEVELS['08']={id:'08',num:8,op:'Operação 8',name:'Uma Aliada no Deserto',place:'Bir Zitoun, Tunísia central',prev:'07',
  loadout:{weapons:['silenced','pistol'],ammo:{silenced:{mag:6,reserve:12},pistol:{mag:8,reserve:16}},cur:'silenced',camera:true},baseLight:.88,lightFn:light08,tropical:true,shadows:true,bloomTh:.92,grenades:true,sightMul:1.6,
  build:buildLevel08,enemies:ENEMY_DEFS_08,
  ally:{id:'yas',x:10.2,z:9.6,yaw:-Math.PI/2,caged:true,name:'YASMINA',title:'Yasmina',hp:160,range:70,dmg:46,look:{uniform:0x2e3a52,pants:0x5a4a3a,skin:0xb88a64,hair:0x140e0a,cap:null,weapon:'rifle'},failTitle:'Yasmina não resistiu',failText:'Yasmina ficou caída tempo demais na areia.'},
  start:{x:-106,z:18,yaw:-Math.PI/2},startDocs:['mapa08'],drawMap:drawMap08,
  reinf:[{id:'n1',x:12,z:-26,weapon:'rifle',helmet:true},{id:'n2',x:16,z:-27,weapon:'smg',helmet:true,nades:1},{id:'n3',x:18,z:-24,weapon:'rifle',helmet:true}],
  radio:{x:-4,z:10.2,fx:-4,fz:11.2},radioRun:'O tenente corre para o rádio da barraca!',alarmPos:V3(-4,1.2,11),alarmText:'Alarme em Bir Zitoun! Os soldados descansando perto do caminhão pegam as armas.',alarmObjective:null,
  alarmYes:'Bir Zitoun deu o alarme. ',alarmLate:'O alarme só veio na pista, com a fumaça. ',alarmNo:'',alarmOk:()=>!!(G&&G.flags.potN>=2&&!G.flags.alarmEarly8),
  deathText:'A guarnição de Bir Zitoun cercou a pista de Henchir Souar.',
  objectives:objectives08,interact:interact08,pickups:pickups08,update:(dt)=>{ if(G.alarm&&!(G.flags.potN>=2)) G.flags.alarmEarly8=true; update08(dt); },restore:restore08,
  resultTitle:'Fim da campanha africana',outro:['YASMINA','Olha o pó atrás de nós, Élise… Daqui a uma semana não sobra um alemão na Tunísia. E nós duas vamos estar longe.'],menuCam:{cx:-100,cz:30,y:6,tx:0,tz:0},ambient:'desert',
  mist:null,
  briefing:{meta:'TUNÍSIA CENTRAL — 30 DE ABRIL DE 1943 — 13h10',paras:['Na fuga de Oued el-Kebir, um carro blindado alcançou o carro de Yasmina na planície. Élise caiu no uádi; Yasmina foi levada para Bir Zitoun, um posto de observação montado nas ruínas romanas de uma cisterna.','Ao meio-dia o deserto não esconde ninguém: a visão vai longe, as pedras são poucas e só os arbustos de espinho servem de abrigo. Do alto da crista, um caminhão do LRDG emboscado ainda tem rádio — e o fuzil com luneta do sargento. Chame a patrulha Y2, tire Yasmina da cisterna e segure a pista velha de Henchir Souar até os caminhões ingleses chegarem.'],list:['Rádio e fuzil no caminhão do LRDG, na crista','Libertar Yasmina na cisterna de Bir Zitoun','Duas fumaças na pista e resistir até o LRDG']}};
LEVEL_ORDER.push('08');

window.__SDP8={wave08,footWave08,giveRifle08,scoped};
window.__SDP9={restartLevel,inspectTick,showPapers};
window.__SDP7={detonate07,plantCharge07,truckExplode07,ignite07,startTruck07,powerOff07,applyDawn07,t2w,syncTrucks07};