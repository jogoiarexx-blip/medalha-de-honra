'use strict';



/* =========================================================
   OPERAÇÃO 12 — Subida a Schwarzfels (Vestfália, 03/06/1943, 01h)
   besta silenciosa com virote físico, ferramentas, rádio,
   teleférico até o castelo
   ========================================================= */
WEAPONS.xbow={id:'xbow',name:'Besta de caça',cat:'Besta silenciosa',mode:'VIROTE',auto:false,bolt:true,silent:true,rpm:30,dmg:120,mag:1,reserveMax:16,reload:{out:.15,in:1.5,end:1.8},spreadHip:1.5,spreadADS:.06,bloom:.3,recoil:.5,recoilX:.1,adsTime:.24,noise:1,falloff:[35,90,.8],fovADS:42,ammoName:'virotes'};
function buildVM12(B,M){
  const g=new T.Group(); const wood=new T.MeshPhongMaterial({color:0x5a3e24,shininess:12,specular:0x111111});
  B(g,.05,.06,.56,0,-.03,-.12,wood); B(g,.045,.1,.18,0,-.08,.2,wood,-.25); B(g,.62,.025,.04,0,.0,-.38,M.gun); B(g,.4,.006,.006,0,.0,-.3,new T.MeshBasicMaterial({color:0xd8d0b8}));
  const bolt=new T.Group(); g.add(bolt); B(bolt,.012,.012,.38,0,.03,-.26,hm(0x6a5a3a)); B(bolt,.02,.02,.04,0,.03,-.46,M.gun);
  B(g,.05,.07,.08,0,-.07,.1,M.skin); B(g,.062,.062,.3,.03,-.12,.26,M.sleeve,-.25); B(g,.05,.06,.07,-.02,-.06,-.32,M.skin); B(g,.06,.06,.3,-.07,-.11,-.2,M.sleeve,-.5);
  const muzzle=new T.Object3D(); muzzle.position.set(0,.03,-.5); g.add(muzzle);
  VM.models.xbow={g,mag:bolt,muzzle,hip:V3(.15,-.13,-.34),ads:V3(0,-.1,-.28),magHome:bolt.position.clone()};
}
function fireBolt12(){
  const P=G.player; const f=V3(0,0,-1).applyQuaternion(camera.quaternion); const rng=mulberry32((++G.shotId)*31+G.seed); jitterDir(f,currentSpread()*DEG,rng);
  const pos=camera.position.clone().addScaledVector(f,.5).add(V3(0,-.05,0));
  const m=new T.Group(); const sh=new T.Mesh(new T.CylinderGeometry(.012,.012,.42,6),hm(0x6a5a3a)); sh.rotation.x=Math.PI/2; m.add(sh); const tip=new T.Mesh(new T.ConeGeometry(.02,.06,6),hm(0x3a3a3a)); tip.rotation.x=-Math.PI/2; tip.position.z=-.24; m.add(tip);
  m.position.copy(pos); m.lookAt(pos.clone().add(f)); scene.add(m);
  (W.bolts=W.bolts||[]).push({mesh:m,pos:pos.clone(),vel:f.clone().multiplyScalar(58),age:0,done:false});
  G.stats.shots++; AudioSys.play('cloth',null,1); AudioSys.play('pin',null,.6); emitNoise(P.pos,1,'muffled',null);
  P.pitch+=.6*DEG; VM.kick=.03; G.hud.ammoT=4;
}
function dropBolt12(p){
  const id='bolt'+(G.boltN=(G.boltN||0)+1); const m=new T.Group(); const sh=new T.Mesh(new T.CylinderGeometry(.014,.014,.42,6),hm(0x6a5a3a)); sh.rotation.z=Math.PI/2+.3; m.add(sh); m.position.copy(p); scene.add(m);
  const it={id,pt:()=>m.position,r:1.8,skip:true,label:()=>it.done?null:'Recuperar o virote',use:()=>{ if(it.done) return; it.done=true; scene.remove(m); const a=G.player.ammo.xbow; if(a){ a.reserve=Math.min(WEAPONS.xbow.reserveMax,a.reserve+1); } G.flags.boltsBack=(G.flags.boltsBack||0)+1; AudioSys.play('pickup'); pickupMsg('Virote recuperado'); if(G.flags.boltsBack>=5&&obj('bolts')&&obj('bolts').state==='active') complete('bolts'); }};
  W.interactables.push(it);
}
function updateBolts(dt){
  if(!W.bolts||!W.bolts.length) return;
  for(const r of W.bolts){
    if(r.done) continue; r.age+=dt; r.vel.y-=4.9*dt;
    const a=r.pos.clone(), b=a.clone().addScaledVector(r.vel,dt), dir=V3().subVectors(b,a), len=dir.length(); dir.divideScalar(len);
    let hitT=Infinity, hit=null;
    const sh=segFirst(a.x,a.y,a.z,b.x,b.y,b.z); if(sh){ hitT=sh.t*len; hit='solid'; }
    let he=null; for(const e of G.enemies){ if(e.dead||e===r.skip) continue; const t=rayCylinder(a,dir,Math.min(len,hitT),e.pos.x,e.pos.z,.36,e.pos.y,1.85); if(t>=0&&t<hitT){ hitT=t; hit='enemy'; he=e; } }
    const gy=heightAt(b.x,b.z); if(!hit&&b.y<=gy+.02){ hitT=Math.max(0,(a.y-gy-.02)/Math.max(1e-4,a.y-b.y)*len); hit='ground'; }
    if(hit||r.age>4){
      const p=a.clone().addScaledVector(dir,Math.min(hitT,len));
      if(hit==='enemy'){ const hp0=he.hp; const o=a.clone().addScaledVector(dir,Math.max(0,hitT-.6)); resolveShot({shooter:'player',origin:o,dir:dir.clone(),weapon:WEAPONS.xbow,shotId:G.shotId,far:2.5}); if(he.hp===hp0&&!he.dead){ r.skip=he; r.pos.copy(b); r.mesh.position.copy(b); continue; } r.done=true; scene.remove(r.mesh); dropBolt12(V3(p.x,heightAt(p.x,p.z)+.05,p.z)); continue; }
      r.done=true;
      if(hit){ r.mesh.position.copy(p.clone().addScaledVector(dir,-.15)); AudioSys.play('clank',p,.35); FX.burst(p,3,0x9a8a6a,1.2,.2,3); const it={id:'bs'+G.shotId,pt:()=>r.mesh.position,r:1.8,skip:true,label:()=>it.done?null:'Recuperar o virote',use:()=>{ if(it.done) return; it.done=true; scene.remove(r.mesh); const am=G.player.ammo.xbow; if(am) am.reserve=Math.min(WEAPONS.xbow.reserveMax,am.reserve+1); G.flags.boltsBack=(G.flags.boltsBack||0)+1; AudioSys.play('pickup'); pickupMsg('Virote recuperado'); if(G.flags.boltsBack>=5&&obj('bolts')&&obj('bolts').state==='active') complete('bolts'); }}; W.interactables.push(it); emitNoise(p,3,'lure',null); }
      else scene.remove(r.mesh);
      continue; }
    r.pos.copy(b); r.mesh.position.copy(b); r.mesh.lookAt(b.clone().add(r.vel));
  }
  W.bolts=W.bolts.filter(r=>!r.done);
}
/* ---- fase ---- */
const ENEMY_DEFS_12=[
  {id:'k1',x:-3,z:17.6,yaw:-Math.PI/2,weapon:'rifle',helmet:true},{id:'k2',x:3,z:22.4,yaw:Math.PI/2,weapon:'rifle',helmet:true},
  {id:'kr',x:6,z:16,weapon:'pistol',officer:true,patrol:[[6,16],[6,18.6],[9.6,18.6],[9.6,16]]},
  {id:'r1',x:-30,z:20,weapon:'rifle',lantern:true,patrol:[[-40,22.4],[-12,22.4]]},{id:'r2',x:30,z:20,weapon:'smg',lantern:true,patrol:[[14,22.4],[46,22.4]]},
  {id:'h1',x:28,z:33,yaw:0,weapon:'rifle',helmet:true},{id:'h2',x:34,z:30.6,weapon:'rifle',patrol:[[22,31],[46,31]]},
  {id:'sh',x:40,z:47,yaw:0,weapon:'rifle',sleep:true},
  {id:'f1',x:-20,z:-6,weapon:'rifle',helmet:true,lantern:true,patrol:[[-30,-8],[-10,4],[-30,10]]},{id:'f2',x:24,z:-6,weapon:'rifle',helmet:true,lantern:true,patrol:[[30,-8],[12,4],[30,10]]},
  {id:'s1',x:-4,z:-25,yaw:0,weapon:'rifle',helmet:true},{id:'s2',x:4.4,z:-25.6,yaw:0,weapon:'smg',helmet:true},
  {id:'s3',x:0,z:-38,weapon:'pistol',officer:true,patrol:[[-5,-38],[5,-38]]},{id:'s4',x:-12,z:-30,weapon:'rifle',patrol:[[-12,-30],[-12,-44],[12,-44],[12,-30]]},
];
function light12(x,z){ let l=.18; const R=G.refs; if(x>-8&&x<8&&z>-46&&z<-30) l=.5; if(x>2&&x<10&&z>13&&z<20) l=.55; if(R&&R.lampsXZ) for(const [lx,lz] of R.lampsXZ){ const d=Math.hypot(x-lx,z-lz); if(d<8) l=Math.max(l,.7*(1-d/8)+.2); } return l; }
function buildLevel12(){
  M5=mats05(); M6=mats06(); const M=M6;
  scene.background=new T.Color(0x0a0e16); scene.fog=new T.FogExp2(0x0c1018,.022);
  skyDome(1212,[[0,'#02040a'],[.3,'#080c18'],[.45,'#121828'],[.5,'#1a1e2a'],[.53,'#0c0c10'],[1,'#060606']],[200,90,12],10);
  scene.add(new T.HemisphereLight(0x3a4a6a,0x10120e,.34)); const sun=new T.DirectionalLight(0x8a9ad0,.22); sun.position.set(-30,60,10); scene.add(sun); scene.add(new T.AmbientLight(0x1a2030,.22));
  const grass=new T.MeshLambertMaterial({color:0x2a3424}), dirt=new T.MeshLambertMaterial({color:0x3a3428});
  floorPlane(200,260,0,-40,grass,'stone',0); floorPlane(140,6,0,20,M.road,'stone',.012); floorPlane(140,4,0,36,dirt,'stone',.011); floorPlane(8,60,0,-6,M.road,'stone',.013); floorPlane(4,30,-48,38,dirt,'stone',.012);
  // trilhos
  for(let x=-68;x<=68;x+=1.1) addMesh(BOX(.25,.08,2.4),hm(0x2a2218),x,.05,36,null); for(const z of [35.3,36.7]) addMesh(BOX(136,.1,.08),hm(0x5a5a5a),0,.14,z,'metal');
  // vagões
  for(const [x,c] of [[18,0x4a2a1e],[27,0x3a3a30],[36,0x4a2a1e]]){ addBlock(x-3.8,x+3.8,34.8,37.2,2.4,{y0:.7,mat:hm(c),surf:'wood',cover:true,seg:1}).minY=0; for(const s of [-2.6,2.6]){ const w=addMesh(new T.CylinderGeometry(.42,.42,.2,10),MAT.tire,x+s,.42,34.7,'metal'); w.rotation.x=Math.PI/2; } }
  addBlock(42,52,38.4,40,.6,{mat:M.lime,surf:'stone',seg:2});
  // galpão de manutenção
  wallOpen('x',44,44.2,36,44,3,[{c:40,w:1.6}],M.wood,{inner:{}}); wallOpen('x',50,50.2,36,44,3,[],M.wood,{inner:{}}); wallOpen('z',36,36.2,44.2,50,3,[],M.wood,{inner:{}}); wallOpen('z',43.8,44,44.2,50,3,[],M.wood,{inner:{}});
  addBlock(35.8,44.2,43.8,50.4,.2,{y0:3,mat:MAT.roof,bottom:MAT.ceil,surf:'wood',seg:2}); addBlock(41,43.6,48.8,49.8,.85,{mat:M.wood,surf:'wood',cover:true,seg:1}); const tools=addMesh(BOX(.5,.06,.12),hm(0x8a1a10),42,.92,49.2,'metal');
  bulb('T1',40,2.7,47,5); W.lamps[W.lamps.length-1].base=.5; W.lamps[W.lamps.length-1].light.intensity=.5;
  // posto de controle com rádio
  makeDoor('bar12',{x:0,z:20,y0:.9,w:5,d:.16,h:.16,mat:M.barrier,offset:V3(0,2.4,0),npc:false,nav:true});
  wallOpen('x',13.8,14,2,10,2.8,[{c:6,w:1}],M.wood,{inner:{}}); wallOpen('x',20,20.2,2,10,2.8,[{c:4,w:1.2,sill:1,top:2}],M.wood,{inner:{}}); wallOpen('z',2,2.2,14,20,2.8,[{c:17,w:1,sill:1,top:2}],M.wood,{inner:{}}); wallOpen('z',9.8,10,14,20,2.8,[],M.wood,{inner:{}});
  addBlock(1.8,10.2,13.8,20.2,.2,{y0:2.8,mat:MAT.roof,bottom:MAT.ceil,surf:'wood',seg:2}); addBlock(7.6,9.6,18.6,19.6,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); const radio12=addMesh(BOX(.6,.45,.4),hm(0x3a3e34),8.6,1.0,19.1,'metal');
  addMesh(new T.CylinderGeometry(.03,.03,4,6),MAT.darkMetal,9.6,4.6,19.6,'metal');
  // estação do vale do teleférico
  const sw=(x0,x1,z0,z1,h,y)=>addBlock(x0,x1,z0,z1,h,{y0:y||0,mat:M.lime,surf:'stone',seg:2});
  sw(-8,-7.6,-46,-30,6); sw(7.6,8,-46,-30,6); sw(-8,8,-46.4,-46,6); sw(-8,-3,-30.4,-30,6); sw(3,8,-30.4,-30,6); sw(-3,3,-30.4,-30,2,4);
  addBlock(-8.4,8.4,-46.8,-29.6,.3,{y0:6,mat:MAT.roof,bottom:MAT.ceil,surf:'stone',seg:2});
  addBlock(-6,-3,-44,-41,1.6,{mat:MAT.stove,surf:'metal',cover:true,seg:1}); const wheel=new T.Mesh(new T.TorusGeometry(1.6,.12,8,24),MAT.darkMetal); wheel.rotation.x=Math.PI/2; wheel.position.set(0,5.2,-42); scene.add(wheel);
  addBlock(3,6,-36,-35,1.1,{mat:M.wood,surf:'wood',cover:true,seg:1}); const lever=addMesh(BOX(.08,.8,.08),hm(0x8a1a10),4.5,1.5,-35.5,'metal'); lever.rotation.x=.4;
  // gôndola
  const gon=new T.Group(); gon.position.set(0,0,-38); scene.add(gon); { const fl=new T.Mesh(BOX(2.6,.12,3.2),MAT.darkMetal); fl.position.y=.06; gon.add(fl); const roof=new T.Mesh(BOX(2.8,.12,3.4),hm(0x8a2a1a)); roof.position.y=2.5; gon.add(roof);
    for(const [a,b] of [[-1.25,-1.55],[1.25,-1.55],[-1.25,1.55],[1.25,1.55]]){ const p=new T.Mesh(BOX(.08,2.4,.08),MAT.darkMetal); p.position.set(a,1.25,b); gon.add(p); }
    for(const s of [-1,1]){ const w=new T.Mesh(BOX(.04,1,3.1),hm(0x5a2a1a)); w.position.set(s*1.27,.6,0); gon.add(w); } const hang=new T.Mesh(BOX(.1,3.6,.1),MAT.darkMetal); hang.position.y=4.3; gon.add(hang); const chain=new T.Mesh(new T.TorusGeometry(.12,.025,6,10),hm(0xb0b0a0)); chain.position.set(0,.9,1.6); gon.add(chain); gon.chain=chain; }
  const gonSolid=addSolidOnly(-1.35,-1.25,-39.6,-36.4,2.4,0); const gonSolid2=addSolidOnly(1.25,1.35,-39.6,-36.4,2.4,0); const gonSolid3=addSolidOnly(-1.35,1.35,-39.7,-39.6,2.4,0);
  // cabo, torres e castelo
  const A=V3(0,6.1,-40), Bp=V3(0,64,-220);
  for(const dx of [-.5,.5]){ const c=new T.Mesh(new T.CylinderGeometry(.03,.03,A.distanceTo(Bp),4),MAT.darkMetal); c.position.copy(A).add(Bp).multiplyScalar(.5); c.position.x+=dx; c.lookAt(Bp.x+dx,Bp.y,Bp.z); c.rotateX(Math.PI/2); scene.add(c); }
  for(const [z,h] of [[-100,28],[-160,46]]){ const y=A.y+(Bp.y-A.y)*((z-A.z)/(Bp.z-A.z)); const t=new T.Mesh(BOX(1.2,y,1.2),MAT.darkMetal); t.position.set(0,y/2-.4,z); scene.add(t); const arm=new T.Mesh(BOX(2.4,.3,.4),MAT.darkMetal); arm.position.set(0,y,z); scene.add(arm); }
  const crag=new T.Mesh(new T.CylinderGeometry(44,80,62,9),hm(0x2a2a28)); crag.position.set(0,31,-240); scene.add(crag);
  const cst=hm(0x3a3a3c); for(const [x,z,w,d,h] of [[-14,-232,30,24,22],[10,-236,18,30,16]]){ const b=new T.Mesh(BOX(w,h,d),cst); b.position.set(x,62+h/2,z); scene.add(b); }
  for(const [x,z,r,h] of [[-30,-222,5,34],[2,-218,4.5,30],[18,-248,5,28],[-26,-246,4,26]]){ const t=new T.Mesh(new T.CylinderGeometry(r,r,h,12),cst); t.position.set(x,62+h/2,z); scene.add(t); const cone=new T.Mesh(new T.ConeGeometry(r*1.15,6,12),hm(0x1e2228)); cone.position.set(x,62+h+3,z); scene.add(cone); }
  for(let i=0;i<14;i++){ const R=mulberry32(1200+i); const w=new T.Mesh(BOX(1,1.6,.2),new T.MeshBasicMaterial({color:R()<.6?0xffc870:0x302820})); w.position.set(-26+R()*44,68+R()*16,-219.6); scene.add(w); }
  const castleStation=new T.Mesh(BOX(10,6,8),cst); castleStation.position.set(0,61,-222); scene.add(castleStation);
  // floresta
  const trunks=[], tops=[]; const clear=(x,z)=>(Math.abs(z-20)<5)||(Math.abs(z-36)<4)||(x>-10&&x<12&&z>-48&&z<-24)||(x>-12&&x<12&&z>-24&&z<26&&Math.abs(x)<5)||(x>12&&x<22&&z>0&&z<12)||(x>34&&x<54&&z>34&&z<52)||(x>-58&&x<-42&&z>40&&z<62)||(Math.abs(x+48)<3&&z>22&&z<56);
  for(let i=0;i<520;i++){ const R=mulberry32(7000+i); const x=-68+R()*136, z=-58+R()*124; if(clear(x,z)) continue; const h=5+R()*5; trunks.push([x,1.4,z,.35,2.8,.35,0]); tops.push([x,2.4+h/2,z,1.8+R()*.8,h,1.8+R()*.8,R()*3]); if(Math.hypot(x+48,z-50)>6) addSolidOnly(x-.3,x+.3,z-.3,z+.3,3,0,true); }
  instanced(new T.CylinderGeometry(.5,.6,1,6),hm(0x2a1e14),trunks); instanced(new T.ConeGeometry(1,1,7),hm(0x14221a),tops);
  // cabana da Rede
  addBlock(-56,-50,54,60,2.6,{mat:M.wood,surf:'wood',top:MAT.roof,seg:1});
  // lampiões
  const lampsXZ=[]; for(const [id,x,z] of [['L1',-3,14],['L2',26,40],['L3',-6,-28],['L4',6,-28]]){ const L=lampPost(id,x,z,0,.6); L.base=1.2; L.light.intensity=1.2; lampsXZ.push([x,z]); }
  // holofote no telhado da estação
  const spot=new T.SpotLight(0xdde6ff,2.6,50,.17,.45,1.1); spot.position.set(0,6.8,-29.4); scene.add(spot); scene.add(spot.target); const lens=addMesh(new T.CylinderGeometry(.24,.24,.05,14),MAT.bulb,0,6.8,-29.2,'glass'); lens.rotation.x=Math.PI/2; addMesh(BOX(.7,.5,.8),MAT.darkMetal,0,6.8,-29.6,'metal');
  let beam=null; if(MAT_HQ){ const len=44, rad=Math.tan(.17)*len; const bg=new T.ConeGeometry(rad,len,20,1,true); bg.translate(0,-len/2,0); bg.rotateX(-Math.PI/2); beam=new T.Mesh(bg,MAT.beamCold); beam.position.copy(spot.position); scene.add(beam); }
  const SL={id:'SL12',x:0,z:-29.4,r:0,light:spot,lantern:lens,broken:false,base:2.6,ph:0,cone:beam}; lens.userData.breakable=true; lens.userData.lamp=SL; W.lamps.push(SL);
  G.sl={light:spot,beam,lamp:SL,t:0,lit:false,litT:0,cd:0,msg:'Da estação: “Tem alguém na clareira!”',path:t=>V3(Math.sin(t*.3)*16,0,-8+Math.cos(t*.22)*10)};
  // navegação
  const N=[];
  for(let x=-66;x<=66;x+=3) for(let z=-56;z<=64;z+=3) N.push({x,z});
  for(let x=-6.6;x<=6.6;x+=2.2) for(let z=-44.6;z<=-31.4;z+=2.2) N.push({x,z});
  for(let x=2.8;x<=9.4;x+=1.6) for(let z=14.6;z<=19.4;z+=1.6) N.push({x,z});
  for(let x=36.8;x<=43.4;x+=1.6) for(let z=44.8;z<=49.4;z+=1.5) N.push({x,z});
  N.push({x:0,z:-29},{x:0,z:-31.4},{x:6,z:13},{x:6,z:14.6},{x:40,z:43},{x:40,z:44.8},{x:0,z:18.6},{x:0,z:21.4});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=4.3; buildNav();
  return {sun,tools,radio12,lever,gon,gonSolids:[gonSolid,gonSolid2,gonSolid3],wheel,cA:A,cB:Bp,lampsXZ};
}
function objectives12(){ return [
  {id:'radio',text:'Destrua o rádio do posto de controle da estrada',state:'active',marker:{x:8.6,z:19.1}},
  {id:'tools',text:'Pegue o alicate corta-correntes no galpão da ferrovia',state:'active',marker:{x:42,z:49.2}},
  {id:'cable',text:'Corte a corrente da gôndola e acione a alavanca do teleférico',state:'hidden',marker:{x:4.5,z:-35.5}},
  {id:'ride',text:'Suba ao castelo de Schwarzfels pelo teleférico',state:'hidden'},
  {id:'warn',text:'Opcional: destrua o rádio antes de qualquer alarme',state:'active',optional:true},
  {id:'bolts',text:'Opcional: recupere cinco virotes',state:'active',optional:true},
]; }
function interact12(R){
  const I=W.interactables, F=()=>G.flags;
  I.push({id:'radio12',pt:()=>V3(8.6,1.1,19.1),r:2.2,hold:()=>2.2,label:()=>F().radioDead?null:'Arrebentar o rádio do posto (segure)',
    use:()=>{ F().radioDead=true; G.radioDead=true; R.radio12.material=hm(0x1c1a18); AudioSys.play('glass',V3(8.6,1,19.1),.8); AudioSys.play('clank'); FX.burst(V3(8.6,1.2,19.1),10,0xffe0a0,3,.3,4); complete('radio'); if(!G.alarm) complete('warn'); G.radioMsg('ÉLISE','Rádio mudo. Se eles gritarem agora, o castelo não escuta.'); cp12(); }});
  I.push({id:'tools12',pt:()=>V3(42,.95,49.2),r:2.2,label:()=>F().tools?null:'Pegar o alicate corta-correntes',use:()=>{ F().tools=true; R.tools.visible=false; AudioSys.play('pickup'); pickupMsg('Alicate corta-correntes'); complete('tools'); activate('cable'); cp12(); }});
  I.push({id:'chain12',pt:()=>V3(0,1,-36.3),r:2.2,hold:()=>1.6,label:()=>F().chainCut||obj('cable').state!=='active'?null:'Cortar a corrente da gôndola (segure)',use:()=>{ F().chainCut=true; R.gon.chain.visible=false; AudioSys.play('clank'); R.gonSolids[2].active=true; pickupMsg('Corrente cortada'); }});
  I.push({id:'lever12',pt:()=>V3(4.5,1.5,-35.5),r:2.2,hold:()=>1.2,label:()=>{ if(F().riding||obj('cable').state!=='active') return null; return F().chainCut?'Acionar a alavanca e pular na gôndola':'Alavanca do teleférico — a gôndola está acorrentada'; },locked:()=>!F().chainCut,
    use:()=>{ if(!F().chainCut) return; complete('cable'); activate('ride'); F().riding=true; F().rideT=0; R.lever.rotation.x=-.4; AudioSys.play('clank'); AudioSys.play('engine'); const P=G.player; P.pos.set(0,0,-38); P.vx=P.vz=P.vy=0; G.radioMsg('ÉLISE','Segure firme. Seiscentos metros de cabo no escuro.','warn'); emitNoise(V3(0,0,-38),18,'lure',null); }});
}
function update12(dt){
  const P=G.player, F=G.flags, R=G.refs;
  updateSearchlight(dt);
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('ÉLISE','Schwarzfels lá no alto, na rocha. O único caminho rápido é o teleférico do vale. A besta não faz barulho — e os virotes podem ser recuperados.','tip'); }
  if(!F.i2&&G.introT>10){ F.i2=true; G.radioMsg('DICA','Tecla 6: besta. O virote cai com a distância — mire um pouco acima. Aperte E sobre um virote cravado para recuperá-lo.','tip'); }
  if(G.alarm&&obj('warn').state==='active'&&!F.radioDead) failObjective('warn');
  R.wheel.rotation.z+=dt*(F.riding?1.6:0);
  if(F.riding&&!F.arrived){ F.rideT+=dt; const T_=G.diff==='recruta'?20:22; const k=clamp(F.rideT/T_,0,1), e=k*k*(3-2*k); const p=V3().lerpVectors(V3(0,0,-38),V3(R.cB.x,R.cB.y-6.1,R.cB.z+2),e);
    R.gon.position.copy(p); P.pos.set(p.x,p.y,p.z+.4); P.vx=P.vz=0; P.vy=0; P.ys=null; P.onGround=true; for(const s of R.gonSolids) s.active=false;
    G.progress={label:'Teleférico — subindo para Schwarzfels',v:k}; if(Math.random()<dt*2) AudioSys.play('clank',null,.15);
    if(k>=1){ F.arrived=true; G.progress=null; complete('ride'); missionComplete(); } }
}
function cp12(){ checkpoint(); }
function restore12(s){ const F=G.flags, R=G.refs; if(F.tools) R.tools.visible=false; if(F.radioDead){ G.radioDead=true; R.radio12.material=hm(0x1c1a18); } if(F.chainCut) R.gon.chain.visible=false; F.riding=false; }
function drawMap12(g,w,h){
  g.fillStyle='#1e2430'; g.fillRect(0,0,w,h); g.fillStyle='#d8d0b8'; g.fillRect(4,4,w-8,h-8); const S=(w-8)/140, X=x=>4+(x+70)*S, Z=z=>4+(z+60)*S;
  g.fillStyle='#8a9a7a'; g.fillRect(X(-68),Z(-58),136*S,124*S); g.fillStyle='#b8a888'; g.fillRect(X(-68),Z(18),136*S,4*S); g.fillStyle='#6a5a4a'; g.fillRect(X(-68),Z(35),136*S,2*S); g.fillRect(X(-3),Z(-24),6*S,40*S);
  g.fillStyle='#4a3a22'; for(const [a,b,c,d] of [[-8,8,-46,-30],[2,10,14,20],[44,50,36,44],[-56,-50,54,60]]) g.fillRect(X(a),Z(c),(b-a)*S,(d-c)*S);
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'11px serif'; g.fillText(s,X(x),Z(z)); };
  t('TELEFÉRICO',0,-48,'bold 11px serif'); t('rádio',6,12,'10px serif'); t('posto',-6,26,'italic 10px serif'); t('ferrovia',-30,40,'italic 10px serif'); t('galpão (alicate)',47,34,'10px serif'); t('cabana',-53,63,'10px serif'); t('estrada',-40,18,'italic 10px serif'); t('↑ castelo',0,-54,'italic 10px serif');
}
DOCS.planta12={title:'Vale de Schwarzfels',sub:'croqui do guarda-florestal da Rede',map:'12',body:'',pencil:'O rádio do posto da estrada avisa o castelo. A gôndola fica acorrentada à noite — o alicate está no galpão da ferrovia.'};
LEVELS['12']={id:'12',num:12,op:'Operação 12',name:'Subida a Schwarzfels',place:'Vale de Schwarzfels, Vestfália',prev:'11',
  loadout:{weapons:['xbow','silenced','pistol'],ammo:{xbow:{mag:1,reserve:9},silenced:{mag:6,reserve:12},pistol:{mag:8,reserve:16}},cur:'xbow',camera:false},baseLight:.18,lightFn:light12,shadows:false,bloomTh:.75,grenades:true,
  build:buildLevel12,enemies:ENEMY_DEFS_12,ally:null,start:{x:-48,z:50,yaw:Math.PI*.9},startDocs:['planta12'],drawMap:drawMap12,
  reinf:[{id:'n1',x:-2,z:-50,weapon:'smg',helmet:true},{id:'n2',x:2,z:-50,weapon:'rifle',helmet:true},{id:'n3',x:60,z:20,weapon:'rifle',helmet:true}],
  radio:{x:8.6,z:18,fx:8.6,fz:19.1},radioRun:'O oficial corre para o rádio do posto!',alarmPos:V3(8.6,1.2,19.1),alarmText:'Alarme no vale! O castelo foi avisado.',alarmObjective:null,
  alarmYes:'O vale deu o alarme. ',alarmNo:'',deathText:'A patrulha do vale fechou a estrada e o teleférico.',
  objectives:objectives12,interact:interact12,pickups:()=>{ addPickup('w_x1',-52,57,'xbow',4,.1); addPickup('w_med1',-49,56,'med',30,.1); addPickup('w_x2',8,15,'xbow',3,.1); addPickup('w_med2',42.8,46,'med',30,.1); addPickup('w_nade',-4,-43,'nade',1,1.65); G.player.nades=G.player.nades||0; },
  update:update12,restore:restore12,
  resultTitle:'Subida a Schwarzfels',outro:['ÉLISE','A gôndola range até parar sob a rocha. Lá dentro, salões, armaduras e um museu que ninguém deveria ver. Dizem que o “instituto” guarda tudo no salão abobadado.'],menuCam:{cx:30,cz:60,y:6,tx:0,tz:-40},ambient:'forest',mist:{n:14,x0:-60,x1:60,z0:-50,z1:60,color:0x1a2230},
  briefing:{meta:'VESTFÁLIA — 3 DE JUNHO DE 1943 — 01h00',paras:['De Creta, a Rede manda Élise para a Alemanha. No alto de um rochedo, o castelo de Schwarzfels virou sede de um “instituto de pesquisas ancestrais”: arquivos, artefatos roubados de meia Europa e uma escola de oficiais que brinca de cavaleiros.','O único acesso rápido é o teleférico do vale. Destrua o rádio do posto da estrada para que ninguém avise o castelo, pegue o alicate no galpão da ferrovia, corte a corrente da gôndola e suba. Para a floresta, a Rede deixou uma besta de caça: silenciosa, e os virotes podem ser recuperados.'],list:['Rádio do posto de controle','Alicate no galpão da ferrovia','Corrente da gôndola, alavanca e subida']}};
LEVEL_ORDER.push('12');
window.__SDP12={fireBolt12,updateBolts};


/* =========================================================
   OPERAÇÃO 13 — Valhala Sombrio (castelo de Schwarzfels, 03/06/1943, 02h)
   armaduras com proteção própria, armaduras "vivas" entre as decorativas,
   museu com vitrines, arquivo, salão abobadado
   ========================================================= */
const STEEL=()=>MAT_HQ?new T.MeshPhongMaterial({color:0xa8acb4,shininess:70,specular:0x8a8a90}):new T.MeshLambertMaterial({color:0xa0a4ac});
function armorUp13(e){
  const m=STEEL(), P=e.h.parts; e.armored=true;
  const plate=(name,sx,sy,sz,oy)=>{ const p=P[name]; if(!p) return; p.userData.armor=true; const g=p.geometry.parameters; const o=new T.Mesh(BOX(g.width*sx,g.height*sy,g.depth*sz),m); o.position.set(0,oy||0,0); p.add(o); };
  plate('chest',1.14,1.06,1.22); plate('abdomen',1.12,1.08,1.22); plate('pelvis',1.1,1.08,1.18);
  for(const s of ['L','R']){ plate('upperArm_'+s,1.5,1.02,1.5); plate('thigh_'+s,1.2,1.02,1.2); plate('forearm_'+s,1.5,.85,1.5); }
  plate('head',1.3,1.22,1.3,.02); if(P.hair) P.hair.userData.armor=true; const crest=new T.Mesh(BOX(.03,.12,.26),hm(0x8a1a1a)); crest.position.set(0,.2,0); P.head.add(crest);
}
(function(){ const sm=Enemy.prototype.speedMul; Enemy.prototype.speedMul=function(){ return sm.call(this)*(this.armored?.78:1); }; })();
/* armaduras paradas: só "acordam" quando alguém chega perto, leva tiro ou há alarme */
(function(){ const up=Enemy.prototype.update; Enemy.prototype.update=function(dt){
  if(this.def&&this.def.statue&&!this.statueAwake&&!this.dead){
    const P=G.player, d=Math.hypot(P.pos.x-this.pos.x,P.pos.z-this.pos.z);
    if(d<2.6||G.alarm||this.hp<this.maxHp||(this.awareness>.6)){ this.statueAwake=true; AudioSys.play('clank',this.pos,1.2); AudioSys.play('shout',this.pos); G.flags.statues=(G.flags.statues||0)+1; this.enterCombat(P.pos.x,P.pos.z,false,true); if(G.levelId==='13'&&G.flags.statues===1) G.radioMsg('ÉLISE','A armadura se mexeu! Tem gente dentro de algumas delas.','warn'); return up.call(this,dt); }
    this.moveDir(0,0,0,dt); this.animate(dt); return; }
  return up.call(this,dt); }; })();
const ENEMY_DEFS_13=[
  {id:'st1',x:26,z:-24,yaw:-Math.PI/2,weapon:'rifle',helmet:true},
  {id:'g1',x:-30,z:-29,weapon:'smg',patrol:[[-30,-29],[16,-29]]},
  {id:'S1',x:-19.1,z:-22,yaw:Math.PI/2,weapon:'smg',statue:true,armor:true},
  {id:'S2',x:13.1,z:-17,yaw:-Math.PI/2,weapon:'rifle',statue:true,armor:true},
  {id:'S3',x:-19.1,z:-12,yaw:Math.PI/2,weapon:'smg',statue:true,armor:true},
  {id:'K1',x:-14,z:-19.6,weapon:'smg',armor:true,patrol:[[-14,-19.6],[9,-19.6],[9,-11],[-14,-11]]},
  {id:'h1',x:-1,z:-9.4,yaw:0,weapon:'rifle',helmet:true},
  {id:'m1',x:-29,z:-20,weapon:'rifle',patrol:[[-29,-20],[-29,-6],[-29,8],[-29,-6]]},
  {id:'m2',x:-27.6,z:-6,yaw:Math.PI/2,weapon:'pistol',officer:true},
  {id:'c1',x:-16,z:-4,weapon:'rifle',helmet:true,patrol:[[-16,-4],[10,-4],[10,12],[-16,12]]},
  {id:'c2',x:-7.5,z:6,yaw:2.2,weapon:'rifle'},
  {id:'a1',x:24,z:-6,weapon:'pistol',officer:true,patrol:[[24,-6],[28,-6],[28,0],[24,0]]},
  {id:'a2',x:19,z:0,yaw:-Math.PI/2,weapon:'rifle',helmet:true},
  {id:'v1',x:-10,z:24,weapon:'rifle',armor:true,patrol:[[-10,24],[4,24],[4,30],[-10,30]]},
  {id:'v2',x:-1,z:32.8,yaw:Math.PI,weapon:'smg',helmet:true},
  {id:'x1',x:-1,z:36.4,yaw:0,weapon:'rifle',helmet:true},
];
const ARM_LOOK={uniform:0x6a6c72,pants:0x5a5c62,helmet:false,cap:null};
function light13(x,z){ if(x>-20&&x<14&&z>-8&&z<16) return .3; if(x>-14&&x<8&&z>18&&z<34) return .42; return .38; }
function buildLevel13(){
  M5=mats05(); M6=mats06(); if(!M9) M9=mats09(); const M=M6;
  scene.background=new T.Color(0x0a0c12); scene.fog=new T.FogExp2(0x0a0c12,.018);
  skyDome(1313,[[0,'#02040a'],[.3,'#080c18'],[.45,'#121828'],[.5,'#1a1e2a'],[.53,'#0c0c10'],[1,'#060606']],[700,100,10],6);
  scene.add(new T.HemisphereLight(0x7a7a90,0x3a3026,.8)); scene.add(new T.AmbientLight(0x4a4038,.55));
  const stone=new T.MeshLambertMaterial({map:TEX.lime5,color:0x8a8478}), dark=new T.MeshLambertMaterial({map:TEX.lime5,color:0x5a564e}), floorM=new T.MeshLambertMaterial({map:TEX.lime5,color:0x6a6052}), red=new T.MeshLambertMaterial({color:0x5a1a14});
  floorPlane(80,84,-2,4,floorM,'stone',0); floorPlane(34,24,-3,4,MAT.ground,'stone',.01);
  const H=6, wl=(axis,c0,c1,a0,a1,ops,mat)=>wallOpen(axis,c0,c1,a0,a1,H,ops||[],mat||stone,{inner:{}});
  const roof=(x0,x1,z0,z1)=>addBlock(x0,x1,z0,z1,.4,{y0:H,mat:dark,bottom:MAT.ceil,surf:'stone',seg:3});
  // muralha externa
  wl('x',-32.4,-32,-36,32); wl('x',40,40.4,-36,32,[{c:-3,w:2}]); wl('z',-36.4,-36,-32,40); wl('z',32,32.4,-32,40);
  // estação do teleférico (NE) e galeria norte
  wl('z',20,20.2,-32,-18,[{c:-25,w:1.6}]); wl('x',-18.2,-18,20.2,32,[{c:26,w:1.6}]); roof(20,32,-32,-18); addBlock(29.4,31.8,-31.4,-27.2,2.3,{y0:.35,mat:hm(0x5a1e18),surf:'metal',seg:1}); addMesh(BOX(2.5,.08,4.4),MAT.darkMetal,30.6,2.7,-29.3,'metal'); addMesh(new T.CylinderGeometry(.03,.03,14,6).rotateX(Math.PI/2),MAT.darkMetal,30.6,4.6,-36,null); for(const z of [-30.6,-28]) addMesh(BOX(.04,.7,1),new T.MeshBasicMaterial({color:0x2a3440}),29.38,1.9,z,null);
  wl('x',-26.2,-26,-36,20,[{c:-29,w:1.6},{c:-3,w:1.8},{c:-21,w:1.6},{c:15,w:1.6}]); roof(-36,20,-32,-26);
  // salão dos cavaleiros
  wl('z',-20.2,-20,-26,-8,[]); wl('z',14,14.2,-26,-8,[]); wl('x',-8.2,-8,-20,14.2,[{c:-3,w:2}]); roof(-20.2,14.2,-26,-8);
  for(const [x,z] of [[-12,-21],[-12,-13],[6,-21],[6,-13]]){ const c=addMesh(new T.CylinderGeometry(.5,.5,H,12),dark,x,H/2,z,'stone'); addSolidOnly(x-.5,x+.5,z-.5,z+.5,H,0,true); }
  addMesh(new T.PlaneGeometry(3.2,17).rotateX(-Math.PI/2),red,-3,.02,-17,null); addBlock(-7,1,-17.6,-16.4,.8,{mat:MAT.darkWood,surf:'wood',cover:true,seg:1}); for(let x=-6;x<=0;x+=2) addMesh(new T.CylinderGeometry(.05,.05,.3,6),hm(0xe8e0c8),x,.95,-17,null);
  for(const [x,z] of [[-14,-25.6],[8,-25.6]]) poster(x,3.2,-25.56,0,1.8,2.6,(g,w,h)=>{ g.fillStyle='#4a1414'; g.fillRect(0,0,w,h); g.fillStyle='#c8a860'; g.fillRect(w*.42,h*.12,w*.16,h*.7); g.beginPath(); g.arc(w/2,h*.3,w*.22,0,7); g.lineWidth=6; g.strokeStyle='#c8a860'; g.stroke(); });
  // armaduras decorativas (iguais às "vivas")
  const deco=(x,z,yaw)=>{ const a=new Actor({id:'deco'+x+z,x,z,yaw},Object.assign({weapon:'rifle',boots:true,skin:0x6a6c72,hair:0x6a6c72,pants:0x5a5c62},ARM_LOOK)); removeShootables(a.h.hitMeshes); const m=STEEL(); a.decoPose=true; const sz={chest:[1.14,1.06,1.22],abdomen:[1.12,1.08,1.22],pelvis:[1.1,1.08,1.18],head:[1.3,1.22,1.3],upperArm_L:[1.5,1.02,1.5],upperArm_R:[1.5,1.02,1.5],forearm_L:[1.5,.85,1.5],forearm_R:[1.5,.85,1.5],thigh_L:[1.2,1.02,1.2],thigh_R:[1.2,1.02,1.2]}; for(const k in sz){ const p=a.h.parts[k]; if(!p) continue; const gp=p.geometry.parameters, f=sz[k]; const o=new T.Mesh(BOX(gp.width*f[0],gp.height*f[1],gp.depth*f[2]),m); if(k==='head'){ o.position.y=.02; const cr=new T.Mesh(BOX(.03,.12,.26),hm(0x8a1a1a)); cr.position.set(0,.2,0); p.add(cr); } p.add(o); o.userData={mat:'metal'}; W.shootables.push(o); } addSolidOnly(x-.35,x+.35,z-.35,z+.35,1.9,0,true); return a; };
  const decos=[deco(-19.1,-17,Math.PI/2),deco(13.1,-22,-Math.PI/2),deco(13.1,-12,-Math.PI/2),deco(-16,-25.2,0),deco(10,-25.2,0)];
  // museu (oeste) — três salas com vitrines
  wl('x',-12.2,-12,-36,-26,[{c:-29,w:1.6}]); wl('x',2,2.2,-36,-26,[{c:-29,w:1.6}]); wl('z',-26.2,-26,-26,14,[{c:8,w:1.6}]); wl('x',14,14.2,-36,-26);
  roof(-36,-26,-26,14.2);
  const cases=[]; for(const [i,x,z,lbl,ar] of [[0,-31,-19,'relicário de prata','o'],[1,-31,-5,'coroa votiva','a'],[2,-31,8,'códice iluminado','o']]){ addBlock(x-.7,x+.7,z-.7,z+.7,1,{mat:dark,surf:'stone',seg:1,cover:true}); const gl=addGlass('case'+i,x-.6,x+.6,1,1.8,z-.6,z+.6,{small:true,loud:16}); const art=addMesh(i===0?new T.BoxGeometry(.3,.3,.3):i===1?new T.TorusGeometry(.18,.05,6,12):new T.BoxGeometry(.32,.06,.42),hm(i===1?0xd8b040:i===0?0xc8c8d0:0x6a2a1a),x,1.25,z,null); cases.push({i,x,z,art,lbl,ar,gl}); }
  for(const [x,z] of [[-28,-22],[-34,-15],[-34,-9],[-28,-1],[-34,11]]){ addBlock(x-.4,x+.4,z-.4,z+.4,1,{mat:dark,surf:'stone',seg:1}); addMesh(new T.CylinderGeometry(.12,.16,.4,8),hm(0x9a8a6a),x,1.2,z,'stone'); }
  // arquivo (leste)
  wl('x',-14.2,-14,16,32,[]); wl('x',6,6.2,16,32,[]); wl('z',16,16.2,-14,6.2,[{c:-4,w:1.6}]); wl('x',-18.2,-18,14,20,[]);
  roof(16,32,-14,6.2); for(const x of [20,24,28]) for(const z of [-11,-7]) addBlock(x-1.2,x+1.2,z-.3,z+.3,2.4,{mat:M.wood,surf:'wood',seg:1});
  addBlock(25,28,2,3,.78,{mat:M.wood,surf:'wood',cover:true,seg:1}); const planM=addMesh(BOX(.8,.02,.6),hm(0xe8dcc0),26.5,.8,2.5,null);
  // salão abobadado (sul)
  wl('x',16,16.2,-14,8,[{c:-3,w:2}]); wl('x',34,34.2,-14,8,[{c:-3,w:1.6}]); wl('z',-14.2,-14,16,34,[]); wl('z',8,8.2,16,34,[]); roof(-14.2,8.2,16,34.2);
  for(let a=0;a<12;a++){ const t=a/12*Math.PI*2; const x=-3+Math.sin(t)*6.5, z=25+Math.cos(t)*6.5; addBlock(x-.35,x+.35,z-.35,z+.35,1.1,{mat:dark,surf:'stone',seg:1,cover:true}); }
  addMesh(new T.CylinderGeometry(2.4,2.4,.2,24),red,-3,.1,25,null); addBlock(-4.4,-1.6,24.4,25.6,.9,{mat:dark,surf:'stone',seg:1,cover:true}); const rite=addMesh(BOX(1.2,.03,.8),hm(0xd8ccb0),-3,.93,25,null);
  const braz=[]; for(const [x,z] of [[-10,19],[4,19],[-10,31],[4,31]]){ addMesh(new T.CylinderGeometry(.3,.2,.9,8),MAT.darkMetal,x,.45,z,'metal'); addSolidOnly(x-.3,x+.3,z-.3,z+.3,.9,0,true); const l=new T.PointLight(0xff8a3a,1.5,13,1.6); l.position.set(x,1.4,z); scene.add(l); braz.push([x,z,l]); }
  // portão sul
  wl('x',34,34.2,-36,-6,[]); wl('x',34,34.2,2,32,[]); wl('z',-6.2,-6,34.2,40,[]); wl('z',2,2.2,34.2,40,[]); makeDoor('gate13',{x:-3,z:40.2,w:2,d:.15,h:3,mat:M.wood,offset:V3(1.9,0,0),npc:true,nav:true});
  // poço do pátio
  addMesh(new T.CylinderGeometry(1,1.1,.9,16),stone,-4,.45,4,'stone'); addSolidOnly(-5,-3,3,5,.9,0,true);
  // luzes
  for(const [id,x,z,r] of [['C1',26,-25,7],['C2',-12,-29,8],['C3',8,-29,8],['C4',-3,-20,9],['C5',-3,-13,9],['C6',-29,-19,7],['C7',-29,-5,7],['C8',-29,8,7],['C9',24,-4,8],['C10',-3,37,6]]){ bulb(id,x,H-.4,z,r); const L=W.lamps[W.lamps.length-1]; L.base=1.25; L.light.intensity=1.25; L.light.distance=r*1.6; }
  [[-19.7,-20,1],[-19.7,-14,1],[13.7,-20,-1],[13.7,-14,-1],[-35.7,-19,1],[-35.7,-5,1],[-35.7,8,1],[31.7,-8,-1],[-13.7,25,1],[7.7,25,-1]].forEach(([x,z,yaw],si)=>{ addMesh(BOX(.12,.3,.12),MAT.darkMetal,x,2.4,z,null); const fl=addMesh(new T.ConeGeometry(.08,.22,6),new T.MeshBasicMaterial({color:0xffb050}),x+yaw*.05,2.68,z,null); if(si%2===0||si>=4&&si<=6){ const l=new T.PointLight(0xff9a48,1.15,11,1.6); l.position.set(x+yaw*.5,2.7,z); scene.add(l); } });
  // navegação
  const N=[];
  for(let x=-35;x<=31.2;x+=2.3) for(let z=-31;z<=39.2;z+=2.3) N.push({x,z});
  N.push({x:20,z:-25},{x:18.4,z:-25},{x:21.6,z:-25},{x:26,z:-18},{x:26,z:-16.4},{x:-29,z:-26},{x:-29,z:-27.6},{x:-29,z:-24.4},{x:-3,z:-26},{x:-3,z:-8},{x:-21,z:-26},{x:15,z:-26},{x:-26,z:8},{x:-27.6,z:8},{x:-24.4,z:8},{x:-29,z:-13.6},{x:-29,z:-10.4},{x:-29,z:.4},{x:-29,z:3.6},{x:15,z:-26},{x:15,z:-27.6},{x:15,z:-24.4},{x:-21,z:-26},{x:-21,z:-27.6},{x:-21,z:-24.4},{x:-3,z:-27.6},{x:-3,z:-24.4},{x:-3,z:-9.6},{x:-3,z:-6.4},{x:14.4,z:-4},{x:-29,z:-12},{x:-29,z:2},{x:16,z:-4},{x:17.6,z:-4},{x:-3,z:16},{x:-3,z:17.6},{x:-3,z:34},{x:-3,z:35.6},{x:-3,z:39});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=3.4; buildNav();
  return {cases,planM,rite,braz,decos};
}
function objectives13(){ return [
  {id:'arts',text:'Recupere três artefatos roubados no museu, ala oeste (0/3)',state:'active',marker:{x:-31,z:-19}},
  {id:'plan',text:'Fotografe o plano de confisco no arquivo, ala leste',state:'active',marker:{x:26.5,z:2.5}},
  {id:'rite',text:'Examine a mesa do salão abobadado, ao sul do pátio',state:'active',marker:{x:-3,z:25}},
  {id:'exit',text:'Saia pelo portão sul do castelo',state:'hidden',marker:{x:-3,z:39}},
  {id:'statues',text:'Opcional: descubra as três armaduras vivas',state:'active',optional:true},
  {id:'quiet13',text:'Opcional: pegue os artefatos sem soar o alarme',state:'active',optional:true},
]; }
function art13(c){ const F=G.flags; if(F['art'+c.i]) return; F['art'+c.i]=true; c.art.visible=false; F.artN=(F.artN||0)+1; AudioSys.play('pickup'); pickupMsg('Artefato '+F.artN+'/3 — '+c.lbl); const o=obj('arts'); o.text='Recupere três artefatos roubados no museu, ala oeste ('+F.artN+'/3)'; const nx=G.refs.cases.find(k=>!F['art'+k.i]); if(nx) o.marker={x:nx.x,z:nx.z}; refreshObjectiveUI(); if(F.artN>=3){ complete('arts'); if(!G.alarm) complete('quiet13'); } check13(); cp13(); }
function check13(){ if(['arts','plan','rite'].every(id=>obj(id).state==='done')&&obj('exit').state==='hidden'){ activate('exit'); G.radioMsg('ÉLISE','Artefatos, plano e lista. Agora sair deste lugar antes que a cidadela inteira acorde.','warn'); } }
function interact13(R){
  const I=W.interactables, F=()=>G.flags;
  R.cases.forEach(c=>I.push({id:'case'+c.i,pt:()=>V3(c.x,1.3,c.z),r:2.3,skip:true,hold:()=>c.gl.broken?0:2.4,
    label:()=>F()['art'+c.i]?null:(c.gl.broken?'Pegar '+c.ar+' '+c.lbl:'Abrir a vitrine com a gazua (segure) — ou quebre o vidro'),
    use:()=>{ if(!c.gl.broken){ c.gl.broken=true; if(c.gl.solid) c.gl.solid.active=false; c.gl.mesh.position.y+=.82; c.gl.mesh.scale.y=.08; F()['caseOpen'+c.i]=true; AudioSys.play('unlock'); return; } art13(c); }}));
  I.push({id:'rite13',pt:()=>V3(-3,1,25),r:2.4,hold:()=>1.2,label:()=>obj('rite').state==='done'?null:'Examinar os papéis da mesa (segure)',use:()=>{ R.rite.visible=false; openDoc('rito13'); complete('rite'); check13(); cp13(); }});
  I.push({id:'exit13',pt:()=>V3(-3,1.4,39.6),r:2.6,skip:true,label:()=>obj('exit').state==='active'?'Sair pelo portão sul':null,use:()=>{ if(obj('exit').state==='active') missionComplete(); }});
}
function photos13(){ W.photo.push({id:'plan13',label:'Plano de confisco (“Sicherstellung”)',pos:V3(26.5,.82,2.5),normal:V3(0,1,0),max:2.8,obj:'plan',size:.5,msg:'Lista de museus de Paris, Bruxelas e Cracóvia com datas de “recolhimento”.',after:()=>check13()}); }
DOCS.rito13={title:'Programa da cerimônia de solstício',sub:'papéis sobre a mesa do salão abobadado',body:`21.6.  Investidura dos novos “cavaleiros”
       (oficiais da escola — de armadura)
       Exposição dos objetos “recuperados”:
       relicário de prata (Aachen), coroa
       votiva (Toledo), códice (Cracóvia)

Lista de convidados anexa: 40 nomes,
patentes, unidades.`,pencil:'Teatro de cavaleiros — e uma lista com os nomes de quem manda no saque.'};
DOCS.planta13={title:'Schwarzfels — interior',sub:'planta desenhada por um ex-criado do castelo',map:'13',body:'',pencil:'Museu a oeste, arquivo a leste, salão abobadado ao sul do pátio. Cuidado com as armaduras do salão dos cavaleiros.'};
function drawMap13(g,w,h){
  g.fillStyle='#e8dcc0'; g.fillRect(0,0,w,h); const S=w/76, X=x=>(x+38)*S, Z=z=>(z+34)*S;
  const rect=(x0,x1,z0,z1,fill,stroke)=>{ g.fillStyle=fill; g.fillRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); if(stroke){ g.strokeStyle=stroke; g.lineWidth=2; g.strokeRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); } };
  rect(-36,32,-32,40,'#c8b894','#3a2a1a'); rect(-20,14,-8,16,'#e0d4b0',null); rect(-20,14,-26,-8,'#b8a07a','#4a3a22'); rect(-36,-22,-26,14,'#b8a07a','#4a3a22'); rect(16,32,-14,6,'#b8a07a','#4a3a22'); rect(-14,8,16,34,'#a89070','#4a3a22'); rect(20,32,-32,-18,'#b8a07a','#4a3a22');
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'11px serif'; g.fillText(s,X(x),Z(z)); };
  t('teleférico',26,-24,'10px serif'); t('galeria norte',-8,-29,'italic 10px serif'); t('SALÃO DOS CAVALEIROS',-3,-16,'bold 10px serif'); t('MUSEU',-29,-6,'bold 11px serif'); t('ARQUIVO',24,-4,'bold 11px serif'); t('PÁTIO',-3,6,'bold 11px serif'); t('SALÃO ABOBADADO',-3,26,'bold 10px serif'); t('portão sul',-3,39,'10px serif');
}
function update13(dt){
  const F=G.flags, R=G.refs;
  if(!F.armSet){ F.armSet=true; for(const e of G.enemies) if(e.def.armor&&!e.armored){ armorUp13(e); } }
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('ÉLISE','Dentro do castelo. Museu a oeste, arquivo a leste, salão abobadado ao sul. E armaduras por todo lado.','tip'); }
  if(!F.i2&&G.introT>9){ F.i2=true; G.radioMsg('DICA','Bala em armadura só arranha: mire nas canelas, mãos e pescoço — ou use granada. Vitrine: abra devagar ou quebre o vidro (barulho).','tip'); }
  for(const b of R.braz){ b[2].intensity=1.45+Math.sin(simTime*8+b[0])*.12+Math.random()*.1; if(Math.random()<dt*5) FX.puff(V3(b[0],1.1,b[1]),1,0xff8a30,.35,.4,V3(0,1,0),.7); }
  if(!F.decoP){ F.decoP=true; for(const a of R.decos){ a.aimTarget=0; a.animate(1); a.animate(1); } }
  if((F.statues||0)>=3&&obj('statues').state==='active') complete('statues');
  if(G.alarm&&obj('quiet13').state==='active') failObjective('quiet13');
}
function cp13(){ checkpoint(); }
function restore13(s){ const F=G.flags, R=G.refs; for(const c of R.cases){ if(F['art'+c.i]) c.art.visible=false; if(F['caseOpen'+c.i]&&!c.gl.broken){ c.gl.broken=true; if(c.gl.solid) c.gl.solid.active=false; c.gl.mesh.position.y+=.82; c.gl.mesh.scale.y=.08; } } if(obj('rite').state==='done') R.rite.visible=false; F.armSet=false; F.decoP=false; }
LEVELS['13']={id:'13',num:13,op:'Operação 13',name:'Valhala Sombrio',place:'Castelo de Schwarzfels, Vestfália',prev:'12',
  loadout:{weapons:['xbow','silenced','pistol'],ammo:{xbow:{mag:1,reserve:8},silenced:{mag:6,reserve:12},pistol:{mag:8,reserve:16}},cur:'xbow',camera:true},baseLight:.38,lightFn:light13,shadows:false,bloomTh:.75,grenades:true,
  build:()=>{ const r=buildLevel13(); photos13(); return r; },enemies:ENEMY_DEFS_13.map(d=>d.armor?Object.assign({},d,{look:ARM_LOOK,hp:130}):d),ally:null,start:{x:27.6,z:-29.3,yaw:Math.PI/2},startDocs:['planta13'],drawMap:drawMap13,
  reinf:[{id:'n1',x:-3,z:38,weapon:'smg',helmet:true},{id:'n2',x:0,z:38,weapon:'rifle',helmet:true,nades:1},{id:'n3',x:28,z:-22,weapon:'rifle',helmet:true}],
  radio:{x:24,z:-2,fx:24,fz:-4},radioRun:'O oficial corre para o telefone do arquivo!',alarmPos:V3(24,1.4,-4),alarmText:'Alarme em Schwarzfels! Os cadetes vestem armas, não armaduras.',alarmObjective:'quiet13',
  alarmYes:'O castelo deu o alarme. ',alarmNo:'',deathText:'Os guardas de Schwarzfels cercaram a ladra do museu.',
  objectives:objectives13,interact:interact13,pickups:()=>{ addPickup('v_x1',24,-30,'xbow',3,.1); addPickup('v_med1',-6,-17,'med',30,.85); addPickup('v_nade1',30,4,'nade',2,.1); addPickup('v_med2',-26,12,'med',35,.1); addPickup('v_pis1',-12,32,'pistol',8,.1); addPickup('v_nade2',-34,-30,'nade',1,.1); G.player.nades=G.player.nades||0; },
  update:update13,restore:restore13,
  resultTitle:'Valhala sombrio',outro:['ÉLISE','Três objetos roubados na mochila e quarenta nomes na câmera. Atrás de mim, as sirenes do castelo começam a uivar.'],menuCam:{cx:0,cz:10,y:2,tx:-3,tz:-17},ambient:'forest',mist:null,
  briefing:{meta:'VESTFÁLIA — 3 DE JUNHO DE 1943 — 02h00',paras:['A gôndola deixou Élise na estação do teleférico, dentro das muralhas. O “instituto” transformou o castelo em museu particular: objetos levados de catedrais e bibliotecas da Europa ocupada, um salão de armaduras para os cadetes brincarem de cavaleiros e um salão abobadado para cerimônias.','Recupere três artefatos do museu, fotografe o plano de confisco no arquivo e examine os papéis do salão abobadado. As armaduras não são todas enfeite: algumas têm gente dentro, e bala em placa de aço só arranha.'],list:['Três artefatos nas vitrines do museu','Plano de confisco no arquivo; papéis do salão abobadado','Sair pelo portão sul']}};
LEVEL_ORDER.push('13');


/* =========================================================
   OPERAÇÃO 14 — Círculo Vicioso (encosta de Schwarzfels, 03/06/1943, 03h)
   fuga sob sirenes; ponte do quartel; reforços em ciclo; casa segura
   ========================================================= */
const ENEMY_DEFS_14=[
  {id:'p1',x:0,z:-40,weapon:'rifle',lantern:true,patrol:[[0,-40],[0,-22],[3,-22],[3,-40]]},
  {id:'p2',x:-7,z:-29,yaw:Math.PI*.9,weapon:'smg',helmet:true},
  {id:'p3',x:7,z:-14,yaw:-2.4,weapon:'rifle'},
  {id:'b1',x:14,z:-13,yaw:-Math.PI/2,weapon:'smg',helmet:true},
  {id:'b2',x:29,z:-8,yaw:-Math.PI/2,weapon:'rifle',helmet:true},
  {id:'b3',x:38,z:-13,weapon:'rifle',patrol:[[38,-13],[46,-13],[46,-9],[38,-9]]},
  {id:'b4',x:34,z:-8,yaw:-Math.PI/2,weapon:'pistol',officer:true},
  {id:'m1',x:2,z:2,weapon:'rifle',lantern:true,patrol:[[2,2],[2,26],[-2,26],[-2,2]]},
  {id:'m2',x:-14,z:12,weapon:'rifle',patrol:[[-14,12],[-14,-6],[-24,-6],[-24,12]]},
  {id:'c1',x:-3.5,z:37,yaw:Math.PI,weapon:'smg',helmet:true},
  {id:'c2',x:3.6,z:38,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'c3',x:9,z:40,yaw:Math.PI*.8,weapon:'rifle'},
  {id:'c4',x:-8,z:43.5,yaw:Math.PI/2,weapon:'pistol',officer:true},
  {id:'v1',x:10,z:55,weapon:'rifle',patrol:[[10,55],[28,55],[28,51],[10,51]]},
  {id:'h1',x:-18,z:48,weapon:'smg',patrol:[[-18,48],[-4,48]]},
];
function light14(x,z){ let l=.2; const R=G.refs; if(R&&R.lit14) for(const [a,b,r] of R.lit14){ const d=Math.hypot(x-a,z-b); if(d<r) l=Math.max(l,.62*(1-d/r)+.2); } return l; }
function buildLevel14(){
  M5=mats05(); M6=mats06(); const M=M6;
  scene.background=new T.Color(0x0a0e16); scene.fog=new T.FogExp2(0x0c1018,.02);
  skyDome(1414,[[0,'#02040a'],[.3,'#080c18'],[.45,'#141a2a'],[.5,'#1c2030'],[.53,'#0c0c10'],[1,'#060606']],[600,120,12],10);
  scene.add(new T.HemisphereLight(0x4a5a7a,0x14160e,.5)); const sun=new T.DirectionalLight(0x8a9ad0,.3); sun.position.set(-30,60,10); scene.add(sun); scene.add(new T.AmbientLight(0x1e2434,.32));
  const grass=new T.MeshLambertMaterial({color:0x2a3424}), dirt=new T.MeshLambertMaterial({color:0x3a3428}), rock=new T.MeshLambertMaterial({map:TEX.lime5,color:0x4a4844}), wallM=new T.MeshLambertMaterial({map:TEX.lime5,color:0x6a665e});
  // chão: dois lados da garganta
  floorPlane(88,132,-26,5,grass,'stone',0); floorPlane(44,132,48,5,grass,'stone',0);
  floorPlane(6,110,0,-3,M.road,'stone',.012); floorPlane(36,4,-18,48,dirt,'stone',.011); floorPlane(18,4,35,-11,M.road,'stone',.012); floorPlane(30,20,16,60,dirt,'stone',.011);
  // garganta
  for(const x of [18,26]){ addMesh(BOX(.5,9,132),rock,x,-4.5,5,null); for(const [z0,z1] of [[-61,-12.8],[-7.2,71]]) addMesh(BOX(.9,.45,z1-z0),rock,x+(x<22?-.1:.1),.12,(z0+z1)/2,null); }
  for(let i=0;i<6;i++){ const m=new T.Mesh(new T.PlaneGeometry(7.6,22).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x9aa6b4,transparent:true,opacity:.07,depthWrite:false})); m.position.set(22,-2.5-i*.8,-50+i*22); scene.add(m); }
  const water=addMesh(new T.PlaneGeometry(8,132).rotateX(-Math.PI/2),(MAT_HQ?new T.MeshPhongMaterial({color:0x1c3040,specular:0x8899aa,shininess:80}):new T.MeshLambertMaterial({color:0x1c3040})),22,-8,5,null);
  for(let i=0;i<26;i++){ const R=mulberry32(1400+i); const z=-58+R()*126; if(Math.abs(z+10)<5) continue; const s=.6+R()*1.2; addMesh(new T.DodecahedronGeometry(s,0),rock,(R()<.5?18.6:25.4),-.2+R()*.3,z,null); }
  const gorgeN=addSolidOnly(17.8,26.2,-62,-12.7,3), gorgeS=addSolidOnly(17.8,26.2,-7.3,72,3), gorgeB=addSolidOnly(17.8,26.2,-12.7,-7.3,3); gorgeB.active=false;
  // ponte de madeira
  const bridge=new T.Group(); scene.add(bridge); const bw=MAT_HQ?new T.MeshPhongMaterial({map:TEX.wood,color:0x7a5a3a,shininess:4}):new T.MeshLambertMaterial({map:TEX.wood,color:0x7a5a3a});
  const deck=new T.Mesh(BOX(9.2,.22,5),bw); deck.position.set(22,-.11,-10); bridge.add(deck); deck.userData.mat='wood'; W.shootables.push(deck);
  for(const z of [-12.4,-7.6]){ const r=new T.Mesh(BOX(9.2,.12,.12),bw); r.position.set(22,1,z); bridge.add(r); for(let x=17.8;x<=26.3;x+=2.1){ const p=new T.Mesh(BOX(.14,1,.14),bw); p.position.set(x,.5,z); bridge.add(p); } }
  for(const [x,z] of [[19,-12],[19,-8],[25,-12],[25,-8]]){ const b=new T.Mesh(BOX(.3,7.6,.3),bw); b.position.set(x,-3.9,z); b.rotation.z=(x<22?-.18:.18); bridge.add(b); }
  const railN=addSolidOnly(17.8,26.2,-12.7,-12.3,1.1,0), railS=addSolidOnly(17.8,26.2,-7.7,-7.3,1.1,0);
  // muralha do castelo e portão (atrás do jogador)
  addBlock(-70,-2.6,-62,-57,11,{mat:wallM,surf:'stone',seg:4}); addBlock(2.6,70,-62,-57,11,{mat:wallM,surf:'stone',seg:4}); addBlock(-2.6,2.6,-62,-57,5,{y0:6,mat:wallM,surf:'stone',seg:1});
  addBlock(-2.6,2.6,-57.4,-57.1,6,{mat:MAT.darkMetal,surf:'metal',seg:1});
  for(const x of [-5,5]){ addMesh(new T.CylinderGeometry(2.6,2.8,14,12),wallM,x,7,-57.6,'stone'); addSolidOnly(x-2.6,x+2.6,-60.2,-55,14,0); const c=addMesh(new T.ConeGeometry(3,4,12),hm(0x1e2228),x,16,-57.6,null); }
  for(let i=0;i<10;i++){ const R=mulberry32(1450+i); addMesh(BOX(.9,1.4,.15),new T.MeshBasicMaterial({color:R()<.7?0xffc870:0x302820}),-40+R()*80,4+R()*5,-56.9,null); }
  // sirenes
  const sirens=[]; const siren=(i,x,z,h,yaw,box)=>{ addMesh(new T.CylinderGeometry(.08,.12,h,6),MAT.darkMetal,x,h/2,z,'metal'); addSolidOnly(x-.15,x+.15,z-.15,z+.15,h); const horn=new T.Group(); horn.position.set(x,h+.2,z); horn.rotation.y=yaw; scene.add(horn); const hm1=hm(0x8a8a80);
    const cones=[]; for(const s of [-1,1]){ const c=new T.Mesh(new T.CylinderGeometry(.32,.12,.6,10),hm1); c.rotation.x=Math.PI/2; c.position.set(s*.36,0,.25); horn.add(c); cones.push(c); } const body=new T.Mesh(BOX(.5,.4,.4),hm(0x5a5a52)); horn.add(body); cones.push(body);
    const S={i,x,z,h,horn,cones,on:true,boxPt:box?V3(x+box[0],1.2,z+box[1]):null,ph:i*1.3};
    for(const c of cones){ c.userData={mat:'metal',zoneHit:()=>killSiren14(S,true)}; W.shootables.push(c); }
    if(box){ addMesh(BOX(.4,.55,.22),hm(0x3a4034),x+box[0],1.2,z+box[1],'metal'); } sirens.push(S); return S; };
  siren(0,7,-54.6,8,0,[0,.25]); siren(1,40,-11,7.5,-Math.PI/2,null); siren(2,-7,41,7,Math.PI/2,[.25,0]);
  // quartel (lado leste)
  addBlock(30,47,-25,-18,3.2,{mat:M.wood,surf:'wood',top:MAT.roof,seg:2}); addBlock(30,47,-4,3,3.2,{mat:M.wood,surf:'wood',top:MAT.roof,seg:2});
  for(let x=31.5;x<=46;x+=2.5) for(const z of [-17.95,-4.05]) addMesh(BOX(.8,.7,.05),new T.MeshBasicMaterial({color:0xffc070}),x,1.8,z,null);
  sandbags(28.4,29.2,-15.4,-12.9); sandbags(28.4,29.2,-7.1,-4.6); addMesh(new T.CylinderGeometry(.05,.05,9,6),MAT.darkMetal,48,4.5,-11,'metal'); poster(48.6,7.6,-11,Math.PI/2,1.6,1,(g,w,h)=>{ g.fillStyle='#8a1a14'; g.fillRect(0,0,w,h); g.fillStyle='#e8e0d0'; g.beginPath(); g.arc(w/2,h/2,h*.32,0,7); g.fill(); });
  // posto de controle da vila
  makeDoor('bar14',{x:0,z:40,y0:.9,w:5.6,d:.16,h:.16,mat:M.barrier,offset:V3(0,2.4,0),npc:true,nav:true});
  addBlock(-6.2,-3.2,39.6,40.4,.9,{mat:M.lime,surf:'stone',seg:1,cover:true}); addBlock(3.2,6.2,39.6,40.4,.9,{mat:M.lime,surf:'stone',seg:1,cover:true});
  sandbags(-5.6,-2.6,35.6,36.4); sandbags(2.6,5.6,35.6,36.4); truck04(11,34);
  addBlock(-12,-8,44,48,2.6,{mat:M.wood,surf:'wood',top:MAT.roof,seg:1}); addMesh(BOX(.8,.6,.05),new T.MeshBasicMaterial({color:0xffc070}),-10,1.6,43.96,null);
  // vila ao sul
  for(const [x0,x1,z0,z1] of [[6,14,58,66],[17,24,60,68],[27,34,57,64],[8,13,68,72]]){ addBlock(x0,x1,z0,z1,4,{mat:M.lime,surf:'stone',top:MAT.roof,seg:2}); addMesh(BOX(.8,.9,.05),new T.MeshBasicMaterial({color:mulberry32(x0|0)()<.6?0xffc070:0x2a2418}),(x0+x1)/2,2.2,z0-.03,null); }
  // casa segura (cabana do guarda-florestal)
  const hut=(axis,c0,c1,a0,a1,ops)=>wallOpen(axis,c0,c1,a0,a1,2.8,ops||[],M.wood,{inner:{}});
  hut('x',53.8,54,-39,-29,[]); hut('x',62,62.2,-39,-29,[{c:-36,w:1,sill:1,top:2}]); hut('z',-39.2,-39,54,62.2,[]); hut('z',-29.2,-29,54,62.2,[{c:58,w:1.2}]);
  addBlock(-39.4,-28.8,53.6,62.6,.2,{y0:2.8,mat:MAT.roof,bottom:MAT.ceil,surf:'wood',seg:2}); addBlock(-37,-35,59,61,.8,{mat:M.wood,surf:'wood',seg:1,cover:true});
  bulb('H14',-34,2.5,58,5); { const L=W.lamps[W.lamps.length-1]; L.base=.9; L.light.intensity=.9; }
  makeDoor('hut14',{x:-29.1,z:58,w:.12,d:1.2,h:2.1,mat:MAT.doorWood,offset:V3(0,0,1.1),npc:true,nav:true});
  // floresta
  const trunks=[], tops=[]; const clear=(x,z)=>(Math.abs(x)<5.5&&z<54)||(x>14&&x<28)||(z<-50)||(x>27&&x<52&&z>-29&&z<7)||(x>27&&x<46&&Math.abs(z+11)<4)||(x>-14&&x<16&&z>31&&z<52)||(z>44&&z<52&&x>-40&&x<2)||(x>-44&&x<-24&&z>50&&z<66)||(x>2&&x<36&&z>48)||(x>8&&x<14&&z>-16&&z<-6)||(Math.hypot(x+19,z-3)<8);
  for(let i=0;i<560;i++){ const R=mulberry32(14000+i); const x=-68+R()*136, z=-54+R()*124; if(clear(x,z)) continue; const h=5+R()*6; trunks.push([x,1.4,z,.35,2.8,.35,0]); tops.push([x,2.4+h/2,z,1.8+R()*.8,h,1.8+R()*.8,R()*3]); addSolidOnly(x-.3,x+.3,z-.3,z+.3,3,0,true); }
  instanced(new T.CylinderGeometry(.5,.6,1,6),hm(0x2a1e14),trunks); instanced(new T.ConeGeometry(1,1,7),hm(0x14221a),tops);
  for(let i=0;i<30;i++){ const R=mulberry32(14900+i); const x=-60+R()*120, z=-50+R()*110; if(clear(x,z)) continue; const s=.4+R()*.7; addMesh(new T.DodecahedronGeometry(s,0),rock,x,s*.5,z,'stone'); addSolidOnly(x-s*.7,x+s*.7,z-s*.7,z+s*.7,s,0,true); }
  // clareira com troncos cortados (cobertura)
  for(const [x,z] of [[-19,1],[-16,6],[-22,5]]){ const l=addMesh(new T.CylinderGeometry(.35,.35,4,8).rotateZ(Math.PI/2),hm(0x4a3422),x,.35,z,'wood'); addSolidOnly(x-2,x+2,z-.35,z+.35,.7,0,true); }
  // lampiões
  const lit14=[]; for(const [id,x,z,r] of [['L1',3.4,-50,9],['L2',15.6,-14.6,8],['L3',30,-11,9],['L4',7.4,42.5,9],['L5',-8.6,42,7],['L6',40,-15,9]]){ const L=lampPost(id,x,z,-1,0); L.base=1.15; L.light.intensity=1.15; lit14.push([x,z,r]); }
  // holofote da muralha
  const spot=new T.SpotLight(0xdde6ff,2.8,70,.16,.45,1.1); spot.position.set(-9,11.6,-56.6); scene.add(spot); scene.add(spot.target); const lens=addMesh(new T.CylinderGeometry(.26,.26,.05,14),MAT.bulb,-9,11.6,-56.4,'glass'); lens.rotation.x=Math.PI/2; addMesh(BOX(.8,.6,.9),MAT.darkMetal,-9,11.6,-56.9,'metal');
  let beam=null; if(MAT_HQ){ const len=60, rad=Math.tan(.16)*len; const bg=new T.ConeGeometry(rad,len,20,1,true); bg.translate(0,-len/2,0); bg.rotateX(-Math.PI/2); beam=new T.Mesh(bg,MAT.beamCold); beam.position.copy(spot.position); scene.add(beam); }
  const SL={id:'SL14',x:-9,z:-56.4,r:0,light:spot,lantern:lens,broken:false,base:2.8,ph:0,cone:beam}; lens.userData.breakable=true; lens.userData.lamp=SL; W.lamps.push(SL);
  G.sl={light:spot,beam,lamp:SL,t:0,lit:false,litT:0,cd:0,msg:'Da muralha: “Lá embaixo, na encosta!”',path:t=>V3(Math.sin(t*.27)*13,0,-34+Math.cos(t*.19)*13)};
  // navegação
  const N=[];
  for(let x=-66;x<=15.1;x+=3) for(let z=-53;z<=67;z+=3) N.push({x,z});
  for(let x=29;x<=66;x+=3) for(let z=-53;z<=67;z+=3) N.push({x,z});
  for(let x=16.6;x<=27.5;x+=1.8) N.push({x,z:-10},{x,z:-11.4},{x,z:-8.6});
  for(let x=-37.4;x<=-30.6;x+=1.7) for(let z=55;z<=61.4;z+=1.6) N.push({x,z});
  N.push({x:-27.6,z:58},{x:-29.1,z:58},{x:0,z:38.4},{x:0,z:41.6},{x:-1.6,z:40},{x:1.6,z:40});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=4.3; buildNav();
  return {sun,sirens,bridge,gorgeB,railN,railS,water,lit14};
}
function killSiren14(S,shot){
  const F=G.flags; if(!S.on) return; S.on=false; F['siren'+S.i]=true; F.sirensOff=(F.sirensOff||0)+1;
  for(const c of S.cones) c.material=hm(0x2a2a26); S.horn.rotation.x=shot?.5:0;
  AudioSys.play(shot?'metal':'clank',V3(S.x,S.h,S.z),1.2); FX.burst(V3(S.x,S.h+.2,S.z),shot?12:6,0xffe0a0,3,.3,4); if(shot) emitNoise(V3(S.x,S.h,S.z),10,'impact',null);
  const left=3-F.sirensOff; pickupMsg(left?'Sirene calada — faltam '+left:'Todas as sirenes caladas');
  if(!left){ complete('sirens'); G.alarm=false; G.radioMsg('ÉLISE','Silêncio. Sem as sirenes, eles voltam a caçar no escuro — e eu também.','tip'); for(const e of G.enemies) if(!e.dead&&e.state!=='COMBAT') e.alertLevel=Math.min(e.alertLevel,.5); }
  else if(F.sirensOff===1) G.radioMsg('ÉLISE','Uma a menos. Cada sirene calada é um caminhão a menos subindo do quartel.');
  cp14();
}
function objectives14(){ return [
  {id:'bridge',text:'Exploda a ponte do quartel antes que os reforços desçam (garganta, leste)',state:'active',marker:{x:17,z:-10}},
  {id:'house',text:'Chegue à casa segura do guarda-florestal (sudoeste)',state:'hidden',marker:{x:-31,z:58}},
  {id:'sirens',text:'Opcional: cale as três sirenes (tiro na buzina ou cabo cortado)',state:'active',optional:true},
  {id:'check14',text:'Opcional: atravesse o posto da vila sem ser ferida abaixo de 50',state:'active',optional:true},
]; }
function interact14(R){
  const I=W.interactables, F=()=>G.flags;
  for(const S of R.sirens) if(S.boxPt) I.push({id:'siren'+S.i,pt:()=>S.boxPt,r:2,hold:()=>1.4,label:()=>S.on?'Cortar o cabo da sirene (segure)':null,use:()=>killSiren14(S,false)});
  I.push({id:'charge14',pt:()=>V3(17.4,.6,-10),r:2.6,hold:()=>G.diff==='veterano'?3.2:2.4,label:()=>F().armed14||F().bridgeDown?null:'Prender a carga nos pilares da ponte (segure)',
    use:()=>{ F().armed14=true; F().fuse14=G.diff==='recruta'?12:9; AudioSys.play('unlock'); pickupMsg('Carga armada — afaste-se da ponte'); G.radioMsg('ÉLISE','Pavio curto. Para trás!','warn'); cp14(); }});
  I.push({id:'house14',pt:()=>V3(-34,1.2,58),r:2.6,skip:true,label:()=>F().bridgeDown?'Fechar a porta e esperar o amanhecer':'Casa segura — a ponte ainda está de pé',
    use:()=>{ if(!F().bridgeDown){ G.radioMsg('ÉLISE','Se o quartel continuar ligado à encosta, eles vasculham a floresta até chegar aqui. A ponte primeiro.','warn'); return; } complete('house'); if(obj('check14').state==='active') complete('check14'); missionComplete(); }});
}
function bridgeBoom14(){
  const F=G.flags, R=G.refs; F.bridgeDown=true; F.armed14=false; G.progress=null;
  explode(V3(22,.6,-10),{r:7,dmgE:200,dmgP:120,src:'charge',kind:'charge'});
  FX.burst(V3(22,.4,-10),40,0x8a6a4a,6,1.2,9.8,1.4); AudioSys.play('explosion',V3(22,0,-10),1.6);
  F.bridgeFall=0; R.gorgeB.active=true; R.railN.active=false; R.railS.active=false;
  for(const e of G.enemies){ if(!e.dead&&e.pos.x>17.8&&e.pos.x<26.2&&e.pos.z>-12.7&&e.pos.z<-7.3) e.takeDamage({dmg:999,region:'chest',dir:V3(0,-1,0),point:e.pos.clone(),shooter:'player'}); }
  W.nav.nodes=W.nav.nodes.filter(n=>!insideSolid(n.x,n.z,.4)); buildNav();
  complete('bridge'); activate('house'); G.radioMsg('ÉLISE','A ponte caiu na garganta. O quartel ficou do lado errado. Agora: a casa do guarda-florestal, depois da vila.','tip'); cp14();
}
function drawMap14(g,w,h){
  g.fillStyle='#1e2430'; g.fillRect(0,0,w,h); g.fillStyle='#d8d0b8'; g.fillRect(4,4,w-8,h-8); const S=(w-8)/140, X=x=>4+(x+70)*S, Z=z=>4+(z+62)*S;
  g.fillStyle='#7a8a6a'; g.fillRect(X(-68),Z(-56),136*S,126*S); g.fillStyle='#3a4a5a'; g.fillRect(X(18),Z(-62),8*S,134*S); g.fillStyle='#b8a888'; g.fillRect(X(-3),Z(-57),6*S,110*S); g.fillRect(X(26),Z(-13),18*S,4*S); g.fillStyle='#8a6a4a'; g.fillRect(X(18),Z(-12.5),8*S,5*S);
  g.fillStyle='#4a3a2a'; g.fillRect(X(-70),Z(-62),140*S,5*S); for(const [a,b,c,d] of [[30,47,-25,-18],[30,47,-4,3],[-39,-29,54,62],[6,14,58,66],[17,24,60,68],[27,34,57,64],[-12,-8,44,48]]) g.fillRect(X(a),Z(c),(b-a)*S,(d-c)*S);
  g.fillStyle='#2a2418'; g.textAlign='center'; const t=(s,x,z,f)=>{ g.font=f||'11px serif'; g.fillText(s,X(x),Z(z)); };
  t('muralha de Schwarzfels',0,-58.5,'bold 10px serif'); t('garganta',22,30,'italic 10px serif'); t('ponte',22,-14,'10px serif'); t('QUARTEL',38,-20,'bold 10px serif'); t('posto da vila',0,34,'10px serif'); t('vila',22,56,'italic 11px serif'); t('casa segura',-34,52,'bold 10px serif');
  g.fillStyle='#8a1a14'; for(const [x,z] of [[7,-54.6],[40,-11],[-7,41]]){ g.beginPath(); g.arc(X(x),Z(z),4,0,7); g.fill(); } t('sirene',10,-51,'9px serif');
}
DOCS.mapa14={title:'Encosta de Schwarzfels',sub:'rascunho de um lenhador da Rede',map:'14',body:'',pencil:'A ponte de madeira liga o quartel à estrada. Sem ela, só dando a volta pelo vale — horas. Três sirenes: muralha, quartel e o posto da vila.'};
function update14(dt){
  const P=G.player, F=G.flags, R=G.refs;
  updateSearchlight(dt);
  if(!F.start14){ F.start14=true; G.alarm=true; for(const e of G.enemies) e.alertLevel=1; }
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('ÉLISE','Portão fechado atrás de mim e o castelo todo uivando. O quartel do outro lado da garganta vai mandar gente pela ponte — sem parar.','warn'); }
  if(!F.i2&&G.introT>9){ F.i2=true; G.radioMsg('DICA','Cale as sirenes (tiro na buzina ou cortando o cabo) para espaçar os reforços. Exploda a ponte para cortá-los de vez.','tip'); }
  // sirenes
  for(const S of R.sirens){ if(!S.on) continue; S.ph-=dt; S.horn.rotation.y+=dt*.6; if(S.ph<=0){ S.ph=4.4; AudioSys.play('siren',V3(S.x,S.h,S.z),.9); } }
  // reforços em ciclo
  if(!F.bridgeDown){ if(F.reT===undefined) F.reT=G.diff==='recruta'?60:42; F.reT-=dt;
    const alive=G.enemies.filter(e=>!e.dead&&e.id.startsWith('q')).length;
    if(F.reT<=0){ F.reT=(G.diff==='veterano'?20:26)+12*(F.sirensOff||0)+(G.diff==='recruta'?14:0);
      if(alive<4&&(F.waves||0)<6){ F.waves=(F.waves||0)+1; const n=F.waves; spawnEnemy04({id:'q'+n+'a',x:44,z:-12.5,weapon:n%2?'smg':'rifle',helmet:true},true); spawnEnemy04({id:'q'+n+'b',x:44,z:-9.5,weapon:'rifle',helmet:true,nades:n>2?1:0},true);
        if(n===1) G.radioMsg('ÉLISE','Caminhão no pátio do quartel. Lá vêm eles pela ponte.','warn'); } } }
  if(F.armed14&&!F.bridgeDown){ F.fuse14-=dt; G.progress={label:'Carga na ponte: '+Math.max(0,Math.ceil(F.fuse14))+' s',v:F.fuse14/(G.diff==='recruta'?12:9)}; if(Math.random()<dt*6) FX.puff(V3(18.2,.4,-10),1,0xffd080,.15,.3,V3(0,1,0),.9); if(F.fuse14<=0) bridgeBoom14(); }
  if(F.bridgeDown&&F.bridgeFall<3){ F.bridgeFall+=dt; R.bridge.position.y-=dt*(2+F.bridgeFall*6); R.bridge.rotation.z=F.bridgeFall*.25; if(F.bridgeFall>=3) R.bridge.visible=false; }
  if(obj('check14').state==='active'&&P.hp<50&&P.pos.z>30) failObjective('check14');
  if(obj('house').state==='active'&&!F.houseMsg&&P.pos.z>44){ F.houseMsg=true; G.radioMsg('ÉLISE','A trilha de terra a oeste leva à cabana. A lamparina acesa quer dizer: porta aberta.'); }
  const cs=$('#convChip'); if(cs){ cs.hidden=false; const sig=R.sirens.map(s=>s.on?1:0).join('')+'|'+(F.bridgeDown?1:0)+'|'+Math.ceil(Math.max(0,F.reT||0)/5);
    if(cs.dataset.sig!==sig){ cs.dataset.sig=sig; const lb=cs.querySelector('.lbl'); if(lb&&lb.firstChild) lb.firstChild.nodeValue='Sirenes · '; cs.className='disg conv'+(R.sirens.every(s=>!s.on)?' ok':'');
      $('#convState').textContent=R.sirens.filter(s=>s.on).length+' tocando'; $('#convRow').innerHTML=R.sirens.map(s=>'<span class="trk '+(s.on?'burn':'wreck')+'">'+['M','Q','V'][s.i]+'</span>').join('');
      $('#convSub').textContent=F.bridgeDown?'Ponte destruída — sem reforços':'Próximos reforços: ~'+Math.max(0,Math.ceil(F.reT||0))+' s'; } }
}
function cp14(){ checkpoint(); }
function restore14(s){ const F=G.flags, R=G.refs;
  for(const S of R.sirens) if(F['siren'+S.i]){ S.on=false; for(const c of S.cones) c.material=hm(0x2a2a26); }
  if(F.bridgeDown){ R.bridge.visible=false; F.bridgeFall=9; R.gorgeB.active=true; R.railN.active=false; R.railS.active=false; W.nav.nodes=W.nav.nodes.filter(n=>!insideSolid(n.x,n.z,.4)); buildNav(); }
  if(F.armed14&&!F.bridgeDown) F.fuse14=Math.max(F.fuse14||0,6);
  F.start14=true; G.alarm=(F.sirensOff||0)<3; if(F.reT!==undefined) F.reT=Math.max(F.reT,15);
}
LEVELS['14']={id:'14',num:14,op:'Operação 14',name:'Círculo Vicioso',place:'Encosta de Schwarzfels, Vestfália',prev:'13',
  loadout:{weapons:['xbow','silenced','smg'],ammo:{xbow:{mag:1,reserve:6},silenced:{mag:6,reserve:12},smg:{mag:32,reserve:96}},cur:'smg',camera:false},baseLight:.2,lightFn:light14,shadows:false,bloomTh:.75,grenades:true,
  build:()=>buildLevel14(),enemies:ENEMY_DEFS_14,ally:null,start:{x:0,z:-53.5,yaw:Math.PI},startDocs:['mapa14'],drawMap:drawMap14,
  reinf:[],radio:{x:0,z:0,fx:0,fz:0},radioRun:'',alarmPos:V3(7,8,-54.6),alarmText:'',alarmObjective:null,
  alarmYes:'As sirenes tocaram a noite inteira. ',alarmLate:'Ela calou as sirenes uma a uma. ',alarmNo:'Ela calou as sirenes uma a uma. ',alarmOk:()=>true,deathText:'A patrulha do quartel encontrou Élise na encosta.',
  objectives:objectives14,interact:interact14,pickups:()=>{ addPickup('w_smg1',-6,-27,'smg',32,.1); addPickup('w_med1',14.4,-15,'med',35,.1); addPickup('w_nade1',2,-20,'nade',2,.1); addPickup('w_med2',-10,46,'med',40,.85); addPickup('w_x1',-18,4,'xbow',3,.1); addPickup('w_smg2',12,38,'smg',32,.1); G.player.nades=Math.max(G.player.nades||0,2); },
  update:update14,restore:restore14,
  resultTitle:'Círculo vicioso',outro:['ÉLISE','A porta da cabana fecha. Lá em cima, Schwarzfels continua aceso, mas as sirenes calaram — e a ponte do quartel está no fundo da garganta. Os quarenta nomes seguem para Londres ao amanhecer.'],menuCam:{cx:6,cz:-30,y:4,tx:22,tz:-10},ambient:'forest',mist:null,
  briefing:{meta:'VESTFÁLIA — 3 DE JUNHO DE 1943 — 03h10',paras:['Élise saiu pelo portão sul com os artefatos e a lista, mas o castelo inteiro acordou. Três sirenes — na muralha, no quartel e no posto da vila — chamam reforços sem parar: enquanto a ponte de madeira ligar o quartel à encosta, caminhões de soldados vão descer atrás dela.','Exploda a ponte sobre a garganta para cortar o ciclo e chegue à cabana do guarda-florestal, depois da vila. Calar as sirenes espaça os reforços — e, com as três mudas, a encosta volta a ficar escura.'],list:['Explodir a ponte do quartel','Calar as sirenes (opcional)','Chegar à casa segura']}};
LEVEL_ORDER.push('14');