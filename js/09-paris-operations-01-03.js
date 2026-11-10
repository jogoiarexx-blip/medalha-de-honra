'use strict';


/* =========================================================
   OPERAÇÃO 1 — Rue des Lanternes
   ========================================================= */
const ENEMY_DEFS_01=[
  {id:'g1',x:2,z:27,yaw:Math.PI,weapon:'rifle',helmet:true,patrol:[[2,27],[1,12]]},
  {id:'g2',x:6,z:5,yaw:0,weapon:'smg',helmet:true,patrol:[[6,4.6],[6.5,-5],[-5.5,-5.5],[-4.5,-1]]},
  {id:'g3',x:20.6,z:-1.6,yaw:-Math.PI/2,weapon:'pistol',officer:true},
  {id:'g4',x:-21.5,z:-6,yaw:Math.PI,weapon:'rifle',helmet:true,patrol:[[-21.5,-5],[-21.3,-22]]},
  {id:'g5',x:-10.5,z:-24.4,yaw:Math.PI/2,weapon:'smg',helmet:true},
  {id:'g6',x:-2.8,z:-33,yaw:0,weapon:'rifle',helmet:true},
  {id:'g7',x:2.8,z:-33.4,yaw:0,weapon:'smg',helmet:true},
  {id:'g8',x:-8.2,z:-32.6,yaw:Math.PI/2,weapon:'smg',helmet:true},
  {id:'g9',x:.5,z:-11,yaw:Math.PI,weapon:'rifle',helmet:true,patrol:[[.5,-10],[-.5,-21]]},
];
function objectives01(){ return [
  {id:'meet',text:'Encontre Lucien na praça da fonte',state:'active',marker:{x:-9.6,z:6.2}},
  {id:'key',text:'Pegue a chave da garagem no posto da guarda',state:'hidden',marker:{x:22.6,z:3}},
  {id:'garage',text:'Abra a garagem Moreau, no fim da rua (lado oeste)',state:'hidden',marker:{x:-4.9,z:-34.2}},
  {id:'escape',text:'Chegue ao caminhão com Lucien',state:'hidden',marker:{x:-12,z:-34}},
  {id:'radio',text:'Opcional: inutilize o rádio do posto antes do alarme',state:'hidden',optional:true,marker:{x:22.1,z:-4.2}},
]; }
function interact01(refs){
  const I=W.interactables;
  I.push({id:'lucien',pt:()=>V3(G.ally.pos.x,1.3,G.ally.pos.z),r:2.4,skip:true,
    label:()=>{ const A=G.ally; if(A.downed) return 'Reanimar Lucien'; if(obj('meet').state==='active') return 'Falar com Lucien'; return null; },
    hold:()=>G.ally.downed?1.6:0,
    use:()=>{ const A=G.ally; if(A.downed){ A.revive(); return; } meetLucien(); }});
  I.push({id:'key',pt:()=>V3(22.85,1.55,3),r:2.2,label:()=>G.player.key?null:'Pegar a chave da garagem',use:()=>takeKey(refs.keyMesh)});
  I.push({id:'log',pt:()=>V3(19.3,.82,2.15),r:2.2,label:()=>'Ler registro de turnos',use:()=>openDoc('shiftlog')});
  I.push({id:'radio',pt:()=>V3(22.1,.95,-4.1),r:2.2,
    label:()=>G.radioDead||G.alarm?null:'Inutilizar o rádio do posto', hold:()=>1.2,
    use:()=>{ G.radioDead=true; AudioSys.play('sabotage',refs.radioMesh.position); refs.radioMesh.material=MAT.roof; complete('radio'); G.radioMsg('ÉLISE','Fios cortados. Ninguém chama o quartel daqui.'); checkpoint(); }});
  I.push(doorInteract('guard',V3(14.5,1.2,0)));
  I.push({id:'garage',pt:()=>V3(-4.88,1.3,-34.2),r:2.3,
    label:()=>{ const d=W.doors.garage; if(d.state!=='LOCKED') return null; return G.player.key?'Destrancar e abrir a garagem':'Portão trancado — falta a chave'; },
    locked:()=>!G.player.key, hold:()=>G.player.key?.8:0,
    use:()=>{ if(!G.player.key){ G.radioMsg('ÉLISE','Trancado. A chave está no posto da guarda.','tip'); return; } const d=W.doors.garage; d.state='CLOSED'; openDoor(d,null); complete('garage'); activate('escape'); G.radioMsg('LUCIEN','O caminhão está lá dentro. Vamos!'); setTimeout(()=>{ if(G) checkpoint(); },2300); }});
  I.push({id:'stencrate',pt:()=>V3(-24.6,.75,-23.6),r:2.2,
    label:()=>G.flags.sten?null:'Pegar a Sten e os carregadores',
    use:()=>{ G.flags.sten=true; const P=G.player; if(!P.weapons.includes('smg')) P.weapons.push('smg'); P.ammo.smg.mag=32; P.ammo.smg.reserve=Math.max(P.ammo.smg.reserve,Math.round(64*D().pickups)); pickupMsg('Sten Mk II + '+P.ammo.smg.reserve+' cartuchos'); AudioSys.play('pickup'); switchWeapon('smg'); if(!G.docs.includes('note')) G.docs.push('note'); G.radioMsg('ÉLISE','Há um bilhete junto. Está no diário (Tab).','tip'); }});
}
function pickups01(){
  addPickup('p_ammo1',3.7,30.6,'pistol',8,1.08); addPickup('p_med1',-12.9,4.4,'med',35); addPickup('p_ammo2',12.6,-6.4,'pistol',8);
  addPickup('p_med2',21.1,4.2,'med',35); addPickup('p_smg1',-12,-25.3,'smg',32); addPickup('p_med3',-21.2,-25.2,'med',35);
  addPickup('p_smg2',2.6,-32,'smg',32); addPickup('p_med4',-8.2,-43.2,'med',40); addPickup('p_ammo3',-3.7,-12.6,'pistol',8,1.08);
}
function meetLucien(){
  if(!complete('meet')) return;
  const A=G.ally; A.faceTowards(G.player.pos.x,G.player.pos.z,1,10);
  G.radioMsg('LUCIEN','Élise. Ainda bem. A chave da garagem fica no posto da guarda, do outro lado da praça.');
  G.radioMsg('LUCIEN','Se o oficial chegar ao rádio, a rua inteira acorda. Corte os fios antes, se puder.');
  G.radioMsg('LUCIEN','Eu espero aqui. No pátio do beco oeste há uma Sten escondida, se precisar.');
  activate('key'); activate('radio'); checkpoint();
}
function takeKey(mesh){
  const P=G.player; if(P.key) return; P.key=true; mesh.visible=false; AudioSys.play('pickup'); pickupMsg('Chave da garagem Moreau');
  if(obj('meet').state==='active'){ complete('meet',true); G.radioMsg('LUCIEN','Você já pegou a chave? Estou indo até você.'); }
  else G.radioMsg('LUCIEN','Tem a chave? Ótimo. Vou atrás de você. A garagem fica no fim da rua, lado oeste.');
  complete('key'); activate('garage');
  const A=G.ally; A.mode='FOLLOW'; A.joined=true; A.hidden=false;
  G.radioMsg('DICA','G alterna Lucien entre seguir e aguardar.','tip');
  checkpoint();
}
function update01(dt){
  if(!G.flags.intro1 && G.introT>1){ G.flags.intro1=true; G.radioMsg('LUCIEN','Élise, estou na praça da fonte, junto ao quiosque. Venha pela rua e fique longe das lâmpadas.'); }
  if(!G.flags.intro2 && G.introT>9){ G.flags.intro2=true; G.radioMsg('DICA','C agacha. A sombra e o silêncio reduzem a chance de ser vista. Lâmpadas podem ser apagadas a tiro, mas o disparo é ouvido.','tip'); }
  if(obj('escape').state==='active' && !G.ending){
    const P=G.player.pos, A=G.ally, z={x:-12,z:-34};
    if(Math.hypot(P.x-z.x,P.z-z.z)<2.6){
      const ad=Math.hypot(A.pos.x-z.x,A.pos.z-z.z);
      if(!A.downed && ad<6.5) missionComplete();
      else if(!G.flags.waitHint){ G.flags.waitHint=true; G.radioMsg('DICA',A.downed?'Lucien está caído. Volte e segure E perto dele.':A.mode==='WAIT'?'Lucien está aguardando. Pressione G para chamá-lo.':'Espere Lucien chegar ao caminhão.','tip'); setTimeout(()=>{ if(G) G.flags.waitHint=false; },8000); }
    }
  }
}
function restore01(s){
  const r=G.refs;
  if(G.player.key && r.keyMesh) r.keyMesh.visible=false;
  if(G.radioDead && r.radioMesh) r.radioMesh.material=MAT.roof;
}

/* =========================================================
   OPERAÇÃO 2 — Cemitério de Saint-Aubin e ossuário
   ========================================================= */
const MAUS02=[[-22.8,-8.1,3,4,'+x'],[-8.1,8.1,4,3,'-z'],[8.1,22.8,3,3,'-z'],[22.8,8.1,3,4,'-x'],[-22.8,22.8,4,3,'+z'],[8.1,-8.1,3,3,'+x'],[-8.1,-22.8,3,3,'+z']];
const TUNNEL02=[
  '############',
  '#######....#',
  '#######....#',
  '###..####.##',
  '###..####.##',
  '###........#',
  '#....#####.#',
  '#....#####.#',
  '###..#####.#',
  '###..#####.#',
  '###..#####.#',
  '###..#####.#',
  '###..#####.#',
  '.....#####.#',
  '###..#####.#',
  '###..#####.#',
  '###..##....#',
  '###..##....#',
  '###........#',
  '###..##....#',
  '############',
];
const ENEMY_DEFS_02=[
  {id:'c1',x:-16,z:24,yaw:Math.PI,weapon:'rifle',helmet:true,lantern:true,patrol:[[-16,26],[-16,-26]]},
  {id:'c2',x:16,z:-24,yaw:0,weapon:'smg',helmet:true,lantern:true,patrol:[[16,-26],[16,26]]},
  {id:'c3',x:-11.6,z:-27.6,yaw:0,weapon:'pistol',officer:true},
  {id:'c4',x:-2.6,z:-29.4,yaw:0,weapon:'rifle',helmet:true},
  {id:'c5',x:2.6,z:-29.6,yaw:0,weapon:'smg',helmet:true},
  {id:'c6',x:-26,z:0,yaw:Math.PI/2,weapon:'rifle',helmet:true,lantern:true,patrol:[[-29.5,0],[29.5,0]]},
  {id:'c7',x:21,z:-19,yaw:-Math.PI/2,weapon:'rifle',helmet:true},
  {id:'t1',x:41,z:-38,yaw:0,weapon:'smg',helmet:true,lantern:true,patrol:[[41,-39],[41,-7]]},
  {id:'t2',x:50.5,z:-42.6,yaw:0,weapon:'rifle',helmet:true},
  {id:'t3',x:51,z:-10,yaw:-Math.PI/2,weapon:'smg',helmet:true},
];
function cypress(x,z,h){
  addMesh(new T.CylinderGeometry(.12,.16,1.2,6),MAT.desk,x,.6,z,'wood'); addSolidOnly(x-.18,x+.18,z-.18,z+.18,1.2);
  const c=new T.Mesh(new T.ConeGeometry(.75,h,7),MAT.cypress); c.position.set(x,1+h/2,z); scene.add(c);
}
function mausoleum(cx,cz,w,d,h,face){
  const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
  addBlock(x0,x1,z0,z1,h,{mat:MAT.mstone,surf:'stone',cover:true,top:MAT.mstone,seg:1.5});
  const r=new T.Mesh(new T.CylinderGeometry(.02,Math.max(w,d)*.72,1.1,4),MAT.mstone); r.position.set(cx,h+.55,cz); r.rotation.y=Math.PI/4; r.scale.set(w/Math.max(w,d),1,d/Math.max(w,d)); scene.add(r);
  const dm=new T.Mesh(new T.PlaneGeometry(1,2.1),hm(0x14120f)); dm.position.y=1.05;
  if(face==='+z'){ dm.position.set(cx,1.05,z1+.012); } else if(face==='-z'){ dm.position.set(cx,1.05,z0-.012); dm.rotation.y=Math.PI; } else if(face==='+x'){ dm.position.set(x1+.012,1.05,cz); dm.rotation.y=Math.PI/2; } else { dm.position.set(x0-.012,1.05,cz); dm.rotation.y=-Math.PI/2; }
  scene.add(dm);
  addMesh(BOX(.08,.5,.08),MAT.mstone,cx,h+1.25,cz,null); addMesh(BOX(.3,.08,.08),MAT.mstone,cx,h+1.35,cz,null);
}
function buildLevel02(){
  scene.background=new T.Color(0x060a0e); scene.fog=new T.FogExp2(0x070b10,.042);
  const sky=new T.Mesh(new T.SphereGeometry(200,16,8),new T.MeshBasicMaterial({side:T.BackSide,fog:false,depthWrite:false,map:textTex(512,256,(g,w,h)=>{
    const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#04060a'); gr.addColorStop(.46,'#0b1119'); gr.addColorStop(.52,'#141b24'); gr.addColorStop(1,'#07090c'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    const R=mulberry32(31); for(let i=0;i<120;i++){ g.fillStyle=`rgba(255,255,255,${.15+R()*.4})`; g.fillRect(R()*w,R()*h*.42,1,1); }
    for(let i=0;i<12;i++){ g.fillStyle='rgba(38,46,58,.4)'; g.beginPath(); g.ellipse(R()*w,30+R()*80,60+R()*90,8+R()*10,0,0,Math.PI*2); g.fill(); }
    g.fillStyle='#d9d4c2'; g.beginPath(); g.arc(120,70,7,0,Math.PI*2); g.fill();
  })}));
  sky.material.map.magFilter=T.LinearFilter; sky.renderOrder=-1; scene.add(sky);
  scene.add(new T.HemisphereLight(0x45536e,0x0e0c09,.42));
  const moon=new T.DirectionalLight(0x8a9ec2,.32); moon.position.set(40,50,30); scene.add(moon);
  scene.add(new T.AmbientLight(0x141820,.28));
  { const gg=new T.PlaneGeometry(100,100,50,50); gg.rotateX(-Math.PI/2); gg.translate(12,0,-8); const p=gg.attributes.position, uv=gg.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i),p.getZ(i)); const m=new T.Mesh(gg,MAT.grass); m.userData.mat='dirt'; scene.add(m); W.shootables.push(m); }
  // caminhos de cascalho
  floorPlane(3,62,0,0,MAT.gravel,'stone',.012); floorPlane(62,3,0,0,MAT.gravel,'stone',.014);
  for(const k of [-16,16]){ floorPlane(2,62,k,0,MAT.gravel,'stone',.013); floorPlane(62,2,0,k,MAT.gravel,'stone',.015); }
  // muros
  const cw={mat:MAT.cwall,surf:'stone',top:MAT.cwall,seg:2};
  addBlock(-33,-2.6,-33,-32,3.2,cw); addBlock(2.6,33,-33,-32,3.2,cw);
  addBlock(-33,33,32,33,3.2,cw); addBlock(-33,-32,-32,32,3.2,cw);
  addBlock(32,33,-32,-20,3.2,cw); addBlock(32,33,-18,32,3.2,cw); addBlock(32,33,-20,-18,.6,Object.assign({},cw,{y0:2.6}));
  addBlock(-2.6,-2,-33.2,-31.6,3.8,cw); addBlock(2,2.6,-33.2,-31.6,3.8,cw);
  for(let x=-1.8;x<=1.81;x+=.3) addMesh(new T.CylinderGeometry(.025,.025,2.8,4),MAT.darkMetal,x,1.4,-32.5,'metal');
  addMesh(BOX(4,.08,.06),MAT.darkMetal,0,2.6,-32.5,'metal'); addSolidOnly(-2,2,-32.6,-32.4,2.8);
  poster(0,3.55,-31.58,0,3.4,.5,(g,w,h)=>{ g.fillStyle='#2b2a26'; g.fillRect(0,0,w,h); g.fillStyle='#cfc6ae'; g.font='bold 26px serif'; g.textAlign='center'; g.fillText('CIMETIÈRE DE SAINT-AUBIN',w/2,h/2+9); });
  lampPost('G1',-3.6,-30.2,1,0); lampPost('G2',3.6,-30.2,-1,0);
  // casa do zelador
  const ls={mat:MAT.lodge,surf:'stone',top:MAT.roof,seg:1.5};
  addBlock(-14,-13,-32,-24,4.2,Object.assign({},ls,{inner:{'+x':MAT.plaster}}));
  addBlock(-7,-6,-32,-24,4.2,Object.assign({},ls,{inner:{'-x':MAT.plaster}}));
  addBlock(-13,-7,-32,-31,4.2,Object.assign({},ls,{inner:{'+z':MAT.plaster}}));
  addBlock(-13,-11,-25,-24,4.2,Object.assign({},ls,{inner:{'-z':MAT.plaster}}));
  addBlock(-9,-7,-25,-24,4.2,Object.assign({},ls,{inner:{'-z':MAT.plaster}}));
  addBlock(-11,-9,-25,-24,1.9,Object.assign({},ls,{y0:2.3}));
  addBlock(-13,-7,-31,-25,1.2,Object.assign({},ls,{y0:3,bottom:MAT.plaster}));
  { const r=new T.Mesh(new T.CylinderGeometry(.02,5.9,1.6,4),MAT.roof); r.position.set(-10,5,-28); r.rotation.y=Math.PI/4; r.scale.set(1,1,1); scene.add(r); }
  floorPlane(6,6,-10,-28,MAT.floorWood,'wood',.016);
  makeDoor('lodge',{x:-10,z:-24.5,w:2,h:2.3,d:.12,mat:MAT.crate,offset:V3(1.95,0,0),npc:true});
  { const wdw=new T.Mesh(new T.PlaneGeometry(.9,.9),MAT.window); wdw.position.set(-12.1,1.7,-23.98); scene.add(wdw); }
  addBlock(-12.6,-10.4,-30.6,-29.6,.78,{mat:MAT.desk,surf:'wood',cover:true,seg:1});
  const planMesh=addMesh(new T.BoxGeometry(.42,.01,.3),MAT.paper,-11.5,.79,-30.1,'wood');
  addBlock(-8.4,-7.1,-30.9,-30.1,.75,{mat:MAT.desk,surf:'wood',seg:1});
  const phoneMesh=addMesh(new T.BoxGeometry(.26,.18,.2),MAT.darkMetal,-7.75,.84,-30.5,'metal');
  addBlock(-12.9,-12.2,-25.9,-25.2,1.6,{mat:MAT.desk,surf:'wood',seg:1});
  bulb('B1',-10,2.8,-28,6);
  // jazigo Vautrin
  const cs={mat:MAT.mstone,surf:'stone',top:MAT.mstone,seg:1.5};
  addBlock(25,26,-22.5,-20,4,Object.assign({},cs,{inner:{'+x':MAT.cryptIn}}));
  addBlock(25,26,-18,-15.5,4,Object.assign({},cs,{inner:{'+x':MAT.cryptIn}}));
  addBlock(25,26,-20,-18,1.6,Object.assign({},cs,{y0:2.4}));
  addBlock(26,32,-22.5,-21.5,4,Object.assign({},cs,{inner:{'+z':MAT.cryptIn}}));
  addBlock(26,32,-16.5,-15.5,4,Object.assign({},cs,{inner:{'-z':MAT.cryptIn}}));
  addBlock(31,32,-21.5,-20,4,Object.assign({},cs,{inner:{'-x':MAT.cryptIn}}));
  addBlock(31,32,-18,-16.5,4,Object.assign({},cs,{inner:{'-x':MAT.cryptIn}}));
  addBlock(31,32,-20,-18,1.6,Object.assign({},cs,{y0:2.4}));
  addBlock(26,31,-21.5,-16.5,1,Object.assign({},cs,{y0:3,bottom:MAT.cryptIn}));
  { const r=new T.Mesh(new T.CylinderGeometry(.02,5.2,1.4,4),MAT.mstone); r.position.set(28.5,4.7,-19); r.rotation.y=Math.PI/4; r.scale.set(1,1,.95); scene.add(r); addMesh(BOX(.1,.7,.1),MAT.mstone,28.5,5.8,-19,null); addMesh(BOX(.4,.1,.1),MAT.mstone,28.5,5.95,-19,null); }
  floorPlane(6,7,28.5,-19,MAT.tfloor,'stone',.02);
  addBlock(27.2,29.8,-21.45,-20.6,.95,{mat:MAT.mstone,surf:'stone',seg:1,top:MAT.mstone});
  const bookMesh=addMesh(new T.BoxGeometry(.24,.06,.32),MAT.book,28.5,.98,-21,'cloth');
  for(const cx of [27.5,29.5]) addMesh(new T.CylinderGeometry(.03,.03,.22,5),MAT.paper,cx,1.06,-21.1,null);
  bulb('C1',28.5,1.25,-21.1,4.5); W.lamps[W.lamps.length-1].light.color.setHex(0xffa860); W.lamps[W.lamps.length-1].base=.9;
  makeDoor('crypt',{x:25.5,z:-19,w:.22,h:2.4,d:2,mat:MAT.mstone,surf:'stone',offset:V3(0,0,1.95),locked:true,dur:1.6,snd:'garage',nav:true});
  makeDoor('slab',{x:31.5,z:-19,w:.26,h:2.4,d:2,mat:MAT.mstone,surf:'stone',offset:V3(0,-2.45,0),locked:true,dur:2.2,snd:'garage',nav:true});
  W.doors.crypt.loud=7; W.doors.slab.loud=7;
  poster(24.97,2.95,-19,-Math.PI/2,2.2,.42,(g,w,h)=>{ g.fillStyle='#55524a'; g.fillRect(0,0,w,h); g.fillStyle='#1c1a16'; g.font='bold 30px serif'; g.textAlign='center'; g.fillText('FAMILLE VAUTRIN',w/2,h/2+10); });
  // mausoléus e árvores
  for(const [x,z,w,d,f] of MAUS02) mausoleum(x,z,w,d,3.4,f);
  for(const [x,z,h] of [[-30.2,10,4.5],[-30.2,-10,5],[30.2,12,4.8],[30.2,-4,4.4],[10,30.2,5],[-10,30.2,4.6],[-24,-30.2,4.8],[20,-30.9,5.2],[-2.4,22,4],[2.4,-14,4.2]]) cypress(x,z,h);
  // sepulturas (geradas com semente fixa)
  const keep=[[17,25.2,-21.6,-16.4],[-13.5,-6.5,-24,-20.5],[-30,-26,26,32]];
  const R=mulberry32(77);
  const near=(x0,x1,z0,z1)=>keep.some(k=>x1>k[0]&&x0<k[1]&&z1>k[2]&&z0<k[3])||W.solids.some(s=>s.active&&x1>s.minX-.9&&x0<s.maxX+.9&&z1>s.minZ-.9&&z0<s.maxZ+.9);
  const P=[[-28,-17.6],[-14.4,-1.8],[1.8,14.4],[17.6,28]];
  for(const [px0,px1] of P) for(const [pz0,pz1] of P){
    for(let z=pz0+1.1;z<pz1-1;z+=2.9) for(let x=px0+.9;x<px1-.6;x+=2.2){
      if(R()<.24) continue; const t=R();
      if(t<.6){ const h=.7+R()*.45, w=.55+R()*.15; if(near(x-w/2,x+w/2,z-.08,z+.08)) continue; addBlock(x-w/2,x+w/2,z-.08,z+.08,h,{mat:R()<.5?MAT.headstone:MAT.headstone2,surf:'stone',seg:3}); }
      else if(t<.85){ if(near(x-.5,x+.5,z-.95,z+.85)) continue; addBlock(x-.5,x+.5,z-.95,z+.85,.5+R()*.22,{mat:MAT.headstone2,surf:'stone',cover:true,seg:3}); }
      else { if(near(x-.3,x+.3,z-.06,z+.06)) continue; addBlock(x-.06,x+.06,z-.06,z+.06,1.35,{mat:MAT.headstone,surf:'stone',seg:3}); addBlock(x-.3,x+.3,z-.06,z+.06,.12,{y0:.95,mat:MAT.headstone,surf:'stone',seg:3,solid:false}); }
    }
  }
  // ossuário (grade de 2 m)
  const X0=33, Z0=-46, C=2;
  floorPlane(26,42,45,-25,MAT.tfloor,'stone',.02);
  addBlock(32,57,-46,-4,.6,{y0:2.8,mat:MAT.tceil,surf:'stone',bottom:MAT.tceil,top:MAT.tceil,seg:2});
  const runs={};
  TUNNEL02.forEach((row,r)=>{ let c=0; while(c<row.length){ if(row[c]==='#'){ let c1=c; while(c1<row.length&&row[c1]==='#') c1++; (runs[c+'-'+c1]=runs[c+'-'+c1]||[]).push(r); c=c1; } else c++; } });
  for(const k in runs){ const [c0,c1]=k.split('-').map(Number); const rows=runs[k]; let s=rows[0], p=rows[0];
    for(let i=1;i<=rows.length;i++){ if(i<rows.length&&rows[i]===p+1){ p=rows[i]; continue; } addBlock(X0+c0*C,X0+c1*C,Z0+s*C,Z0+(p+1)*C,2.8,{mat:MAT.bones,surf:'stone',top:MAT.tceil,seg:1.2}); if(i<rows.length){ s=rows[i]; p=rows[i]; } } }
  bulb('T1',39.25,1.6,-24,4.5); W.lamps[W.lamps.length-1].light.color.setHex(0xffa860);
  bulb('T2',54.7,1.6,-11,5); W.lamps[W.lamps.length-1].light.color.setHex(0xffa860);
  { const shaft=new T.PointLight(0x8aa0c8,.9,6,1.6); shaft.position.set(52,2.5,-43); scene.add(shaft); }
  for(let i=0;i<6;i++) addMesh(BOX(.5,.04,.04),MAT.darkMetal,52,.3+i*.42,-43.92,null);
  addMesh(BOX(.04,2.6,.04),MAT.darkMetal,51.75,1.3,-43.92,null); addMesh(BOX(.04,2.6,.04),MAT.darkMetal,52.25,1.3,-43.92,null);
  dress02();
  // navegação: grade no cemitério + células do ossuário + pontos internos
  const N=[];
  for(let x=-30;x<=30;x+=4) for(let z=-30;z<=30;z+=4) if(!insideSolid(x,z,.45)) N.push({x,z});
  for(const [x,z] of [[-10,-27.6],[-11.6,-28.8],[-8.4,-28.4],[-10,-23],[23.6,-19],[27.4,-19],[29.9,-18.6],[32.2,-19],[0,-30.2],[-16,-30],[16,-30]]) N.push({x,z});
  TUNNEL02.forEach((row,r)=>{ for(let c=0;c<row.length;c++) if(row[c]==='.') N.push({x:X0+c*C+1,z:Z0+r*C+1}); });
  W.nav.nodes=N; W.nav.link=8.6; buildNav();
  return {planMesh,phoneMesh,bookMesh};
}
function objectives02(){ return [
  {id:'plan',text:'Pegue a planta do cemitério na casa do zelador, junto ao portão',state:'active',marker:{x:-10,z:-24}},
  {id:'crypt',text:'Encontre o jazigo Vautrin (planta: tecla M)',state:'hidden',marker:{x:24.4,z:-19},needs:'mapRead'},
  {id:'book',text:'Pegue o livro de cifras no altar do jazigo',state:'hidden',marker:{x:28.5,z:-21}},
  {id:'exit',text:'Passe pela laje do altar e saia pela escada de serviço do ossuário',state:'hidden',marker:{x:52,z:-43.4},needs:'book'},
  {id:'ghost',text:'Opcional: atravesse sem ser descoberta',state:'active',optional:true,autoDone:true},
  {id:'phone',text:'Opcional: corte o telefone de campanha do zelador',state:'hidden',optional:true,marker:{x:-7.75,z:-30.5}},
]; }
function interact02(refs){
  const I=W.interactables;
  I.push(doorInteract('lodge',V3(-10,1.2,-24.5)));
  I.push({id:'plan',pt:()=>V3(-11.5,.84,-30.1),r:2.2,label:()=>G.flags.plan?null:'Pegar a planta do cemitério',
    use:()=>{ G.flags.plan=true; G.flags.mapRead=true; refs.planMesh.visible=false; if(!G.docs.includes('plan')) G.docs.push('plan'); complete('plan'); activate('crypt'); activate('phone'); openDoc('plan'); G.radioMsg('DICA','M abre a planta a qualquer momento. O jazigo agora aparece na bússola.','tip'); checkpoint(); }});
  I.push({id:'phone',pt:()=>V3(-7.75,.95,-30.5),r:2.2,label:()=>G.radioDead||G.alarm?null:'Cortar o fio do telefone de campanha',hold:()=>1.2,
    use:()=>{ G.radioDead=true; AudioSys.play('sabotage',refs.phoneMesh.position); refs.phoneMesh.material=MAT.roof; activate('phone'); complete('phone'); G.radioMsg('ÉLISE','Fio cortado. O portão não vai ouvir falar de mim.'); checkpoint(); }});
  I.push({id:'cryptdoor',pt:()=>V3(25.5,1.2,-19),r:2.3,skipSolid:()=>W.doors.crypt.solid,
    label:()=>W.doors.crypt.state==='LOCKED'?'Abrir a porta do jazigo Vautrin':null, hold:()=>1.4,
    use:()=>{ const d=W.doors.crypt; d.state='CLOSED'; openDoor(d,null); complete('plan',true); complete('crypt'); activate('book'); }});
  I.push({id:'book',pt:()=>V3(28.5,1.02,-21),r:2.2,label:()=>G.flags.book?null:'Pegar o livro de cifras',
    use:()=>{ G.flags.book=true; refs.bookMesh.visible=false; pickupMsg('Livro de cifras da rede'); AudioSys.play('pickup'); complete('plan',true); complete('crypt',true); complete('book'); activate('exit'); if(!G.docs.includes('madeleine')) G.docs.push('madeleine'); openDoc('madeleine'); checkpoint(); }});
  I.push({id:'slab',pt:()=>V3(31.22,1.1,-19),r:2.2,skipSolid:()=>W.doors.slab.solid,
    label:()=>{ const d=W.doors.slab; if(d.state!=='LOCKED') return null; return G.flags.book?'Empurrar a laje atrás do altar':'Uma laje pesada atrás do altar'; },
    locked:()=>!G.flags.book, hold:()=>G.flags.book?2:0,
    use:()=>{ if(!G.flags.book){ G.radioMsg('ÉLISE','Primeiro o livro. Depois penso em sair.','tip'); return; } const d=W.doors.slab; d.state='CLOSED'; openDoor(d,null); G.radioMsg('ÉLISE','A passagem de Madeleine. Para o ossuário.'); }});
  I.push({id:'ladder',pt:()=>V3(52,1.4,-43.6),r:2.3,label:()=>G.flags.book?'Subir pela escada de serviço':null,use:()=>missionComplete()});
}
function pickups02(){
  addPickup('q_med1',-7.6,-25.7,'med',35); addPickup('q_ammo1',-30,20,'pistol',8); addPickup('q_smg1',.9,10,'smg',32);
  addPickup('q_med2',30,-26,'med',30); addPickup('q_med3',35.5,-32,'med',35); addPickup('q_smg2',37.5,-31.2,'smg',32);
  addPickup('q_ammo2',52.5,-8.6,'pistol',8); addPickup('q_med4',48.5,-43,'med',40);
}
function update02(dt){ cataTick02(dt);
  const P=G.player;
  if(!G.flags.i1&&G.introT>1){ G.flags.i1=true; G.radioMsg('ÉLISE','O zelador guarda uma planta do cemitério na casinha do portão. Sem ela, não acho o jazigo no escuro.'); }
  if(!G.flags.i2&&G.introT>9){ G.flags.i2=true; G.radioMsg('DICA','F acende o lampião: você enxerga, mas também é vista. T arremessa uma pedra para atrair um guarda.','tip'); }
  if(obj('ghost').state==='active'&&G.stats.alerts>0){ failObjective('ghost'); G.radioMsg('ÉLISE','Fui vista. Agora é sair viva.','warn'); }
  if(!G.flags.tunnel&&P.pos.x>33.2){ G.flags.tunnel=true; G.radioMsg('ÉLISE','O ossuário. A galeria principal segue para o norte.'); if(!P.lantern) G.radioMsg('DICA','Aqui embaixo só há velas. F acende o lampião.','tip'); checkpoint(); }
}
function restore02(s){
  const r=G.refs;
  if(G.flags.plan&&r.planMesh) r.planMesh.visible=false;
  if(G.flags.book&&r.bookMesh) r.bookMesh.visible=false;
  if(G.radioDead&&r.phoneMesh) r.phoneMesh.material=MAT.roof;
}
function drawMap02(g,w,h){
  const sx=x=>(x+34)/68*w, sz=z=>(z+34)/68*h, R=mulberry32(5);
  g.fillStyle='#e2d5b3'; g.fillRect(0,0,w,h);
  for(let i=0;i<14;i++){ g.fillStyle=`rgba(120,90,40,${.03+R()*.05})`; g.beginPath(); g.ellipse(R()*w,R()*h,20+R()*60,14+R()*40,R()*3,0,Math.PI*2); g.fill(); }
  g.strokeStyle='rgba(70,60,45,.28)'; g.lineWidth=w/68*2;
  for(const k of [0,-16,16]){ g.beginPath(); g.moveTo(sx(k),sz(-31)); g.lineTo(sx(k),sz(31)); g.stroke(); g.beginPath(); g.moveTo(sx(-31),sz(k)); g.lineTo(sx(31),sz(k)); g.stroke(); }
  g.fillStyle='rgba(60,50,38,.35)';
  for(const [a,b] of [[-28,-17.6],[-14.4,-1.8],[1.8,14.4],[17.6,28]]) for(const [c,d] of [[-28,-17.6],[-14.4,-1.8],[1.8,14.4],[17.6,28]]) for(let z=c+1;z<d-.5;z+=2.9) for(let x=a+.9;x<b-.5;x+=2.2){ g.fillRect(sx(x)-2,sz(z)-.5,4,1.4); g.fillRect(sx(x)-.6,sz(z)-2,1.4,4); }
  g.fillStyle='#8a7e64'; g.strokeStyle='#3a3226'; g.lineWidth=1.5;
  for(const [x,z,ww,dd] of MAUS02){ g.fillRect(sx(x-ww/2),sz(z-dd/2),sx(ww)-sx(0),sz(dd)-sz(0)); g.strokeRect(sx(x-ww/2),sz(z-dd/2),sx(ww)-sx(0),sz(dd)-sz(0)); }
  g.fillStyle='#9a8d70'; g.fillRect(sx(-14),sz(-32),sx(8)-sx(0),sz(8)-sz(0)); g.strokeRect(sx(-14),sz(-32),sx(8)-sx(0),sz(8)-sz(0));
  g.fillRect(sx(25),sz(-22.5),sx(7)-sx(0),sz(7)-sz(0)); g.strokeRect(sx(25),sz(-22.5),sx(7)-sx(0),sz(7)-sz(0));
  g.strokeStyle='#2a241b'; g.lineWidth=5; g.strokeRect(sx(-32.5),sz(-32.5),sx(65)-sx(0),sz(65)-sz(0));
  g.fillStyle='#e2d5b3'; g.fillRect(sx(-2.2),sz(-33.4),sx(4.4)-sx(0),9);
  g.fillStyle='#2a241b'; g.font=`${Math.round(w/34)}px "Special Elite","Courier New",monospace`; g.textAlign='center';
  g.fillText('PORTÃO',sx(0),sz(-29.6)); g.fillText('ZELADOR',sx(-10),sz(-27.4)); g.fillText('CIMETIÈRE DE SAINT-AUBIN',w/2,sz(30.4));
  g.strokeStyle='#9a2a1b'; g.lineWidth=3; const cx=sx(28.5), cz=sz(-19), q=w/40; g.beginPath(); g.moveTo(cx-q,cz-q); g.lineTo(cx+q,cz+q); g.moveTo(cx+q,cz-q); g.lineTo(cx-q,cz+q); g.stroke();
  g.fillStyle='#4a5a7a'; g.font=`italic ${Math.round(w/30)}px "Barlow Condensed",sans-serif`; g.textAlign='right'; g.fillText('Vautrin',sx(24),sz(-23.4)); g.fillText('telefone →',sx(-14.6),sz(-29.6));
  g.textAlign='center'; g.strokeStyle='#2a241b'; g.lineWidth=2; const nx=w-34, ny=40; g.beginPath(); g.moveTo(nx,ny-22); g.lineTo(nx-8,ny+4); g.lineTo(nx,ny-2); g.lineTo(nx+8,ny+4); g.closePath(); g.stroke(); g.fillStyle='#2a241b'; g.font=`bold ${Math.round(w/30)}px serif`; g.fillText('N',nx,ny+22);
  g.lineWidth=2; g.beginPath(); g.moveTo(sx(-30),h-14); g.lineTo(sx(-20),h-14); g.stroke(); g.font=`${Math.round(w/40)}px "Barlow Condensed",sans-serif`; g.fillText('10 m',sx(-25),h-20);
}

/* =========================================================
   REGISTRO DE FASES
   ========================================================= */
const LEVELS={
  '01':{id:'01',num:1,op:'Operação 1',name:'Encontro à Meia-Noite',place:'Rue des Lanternes, Paris ocupada',
    build:buildLevel01,enemies:ENEMY_DEFS_01,ally:{id:'lucien',x:-9.6,z:6.2,yaw:Math.PI/2},start:{x:0,z:41,yaw:0},
    reinf:[{id:'r1',x:-1.2,z:-44,yaw:0,weapon:'smg',helmet:true},{id:'r2',x:1.4,z:-44.5,yaw:0,weapon:'rifle',helmet:true}],
    radio:{x:21.6,z:-3.4,fx:22.1,fz:-4.25},radioRun:'O oficial corre para o rádio do posto!',alarmPos:V3(20,2,-2),alarmText:'Sirene! O posto chamou reforços pelo norte.',alarmObjective:'radio',
    alarmYes:'O alarme do posto soou; a rede terá de mudar de rota. ',alarmNo:'Nenhum alarme chegou ao quartel. ',
    objectives:objectives01,interact:interact01,pickups:pickups01,update:update01,restore:restore01,
    resultTitle:'Caminhão recuperado',outro:['LUCIEN','Motor pegou! Segure-se!'],menuCam:{cx:0,cz:8,y:5.5,tx:0,tz:-8},
    briefing:{meta:'PARIS — 14 DE MARÇO DE 1943 — 23h40',paras:['Um caminhão de entregas da garagem Moreau, requisitado pela guarnição, esconde no assoalho falso as peças de rádio que a rede espera há três semanas. Lucien Ferrand sabe ligá-lo sem chave de ignição. Falta a chave da porta da garagem, guardada no posto da praça.','Toque de recolher em vigor. A rua é iluminada a gás e patrulhada. Fique nas sombras: uma lâmpada apagada a tiro é um esconderijo, mas o disparo é ouvido.'],list:['Encontrar Lucien na praça da fonte','Pegar a chave da garagem no posto da guarda','Abrir a garagem e levar Lucien até o caminhão']}},
  '02':{id:'02',num:2,op:'Operação 2',name:'Entre os Mortos',place:'Cemitério de Saint-Aubin e ossuário',prev:'01',
    loadout:{weapons:['pistol','smg'],ammo:{pistol:{mag:8,reserve:24},smg:{mag:32,reserve:32}},cur:'pistol'},
    build:buildLevel02,enemies:ENEMY_DEFS_02,ally:null,start:{x:-29.4,z:29.4,yaw:-Math.PI/4},
    reinf:[{id:'r1',x:-1,z:-30.6,yaw:0,weapon:'smg',helmet:true},{id:'r2',x:1.2,z:-30.8,yaw:0,weapon:'rifle',helmet:true,lantern:true}],
    radio:{x:-8.4,z:-29.3,fx:-7.75,fz:-30.5},radioRun:'O guarda da casinha corre para o telefone!',alarmPos:V3(-8,2,-30),alarmText:'O telefone tocou no portão. A guarda entra no cemitério!',alarmObjective:'phone',
    alarmYes:'O telefone do zelador chamou a guarda do portão. ',alarmNo:'Ninguém chamou o portão. ',
    objectives:objectives02,interact:interact02,pickups:pickups02,update:update02,restore:restore02,drawMap:drawMap02,
    resultTitle:'Livro de cifras salvo',outro:['ÉLISE','Ar fresco. O livro está seguro.'],menuCam:{cx:-6,cz:12,y:5,tx:0,tz:-6},
    briefing:{meta:'PARIS — 15 DE MARÇO DE 1943 — 02h10',paras:['O caminhão chegou ao esconderijo, mas a operadora de rádio Madeleine Roux foi presa ontem ao amanhecer. Antes disso, ela escondeu o livro de cifras da rede no jazigo da família Vautrin, no cemitério de Saint-Aubin. Sem ele, as mensagens de Londres não podem ser lidas.','A guarnição ronda o cemitério com lanternas desde que descobriu a passagem para o ossuário. Você entra pelo muro sudoeste, sozinha. Leve o lampião, mas acenda-o só onde ninguém possa ver. Uma pedra jogada longe atrai quem estiver perto.'],list:['Pegar a planta na casa do zelador, junto ao portão','Encontrar o jazigo Vautrin e o livro de cifras','Sair pelo ossuário, sem voltar pelo portão']}},
};
const LEVEL_ORDER=['01','02'];
const SECRET_ORDER=[];

/* =========================================================
   CENÁRIO EXTRA, INSTÂNCIAS E ATMOSFERA
   ========================================================= */
const UNIT=new T.BoxGeometry(1,1,1);
function instanced(geo,mat,list){
  if(!list.length) return null;
  const im=new T.InstancedMesh(geo,mat,list.length), m=new T.Matrix4(), q=new T.Quaternion(), e=new T.Euler();
  list.forEach((it,i)=>{ e.set(it[7]||0,it[6]||0,0); q.setFromEuler(e); m.compose(V3(it[0],it[1],it[2]),q,V3(it[3],it[4],it[5])); im.setMatrixAt(i,m); });
  im.instanceMatrix.needsUpdate=true; im.frustumCulled=false; scene.add(im); return im;
}
function chair(x,z,ry,mat){
  const g=new T.Group(); g.position.set(x,0,z); g.rotation.y=ry; const m=mat||MAT.darkMetal;
  const add=(w,h,d,px,py,pz)=>{ const o=new T.Mesh(BOX(w,h,d),m); o.position.set(px,py,pz); g.add(o); };
  add(.4,.04,.4,0,.46,0); add(.4,.45,.04,0,.7,-.19); for(const [a,b] of [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]]) add(.03,.46,.03,a,.23,b);
  scene.add(g); return g;
}
function skyDome(seed,stops,moon,clouds){
  const sky=new T.Mesh(new T.SphereGeometry(200,20,10),new T.MeshBasicMaterial({side:T.BackSide,fog:false,depthWrite:false,map:textTex(1024,512,(g,w,h)=>{
    const gr=g.createLinearGradient(0,0,0,h); stops.forEach(([p,c])=>gr.addColorStop(p,c)); g.fillStyle=gr; g.fillRect(0,0,w,h);
    const R=mulberry32(seed); const night=parseInt(stops[0][1].slice(1,3),16)<0x40; for(let i=0;i<(night?420:0);i++){ const a=.15+R()*.6; g.fillStyle=`rgba(255,255,255,${a*a})`; const s=R()<.06?2:1; g.fillRect(R()*w,R()*h*.44,s,s); }
    if(moon){ const [mx,my,r]=moon; const rg=g.createRadialGradient(mx,my,0,mx,my,r*7); rg.addColorStop(0,'rgba(230,226,205,.35)'); rg.addColorStop(1,'rgba(230,226,205,0)'); g.fillStyle=rg; g.fillRect(mx-r*7,my-r*7,r*14,r*14); g.fillStyle='#ece7d4'; g.beginPath(); g.arc(mx,my,r,0,Math.PI*2); g.fill(); g.fillStyle='rgba(150,145,130,.35)'; g.beginPath(); g.arc(mx-r*.3,my-r*.2,r*.28,0,Math.PI*2); g.fill(); }
    for(let i=0;i<clouds;i++){ g.fillStyle=night?`rgba(${34+R()*20|0},${40+R()*20|0},${52+R()*20|0},${.05+R()*.08})`:`rgba(255,250,240,${.1+R()*.14})`; g.beginPath(); g.ellipse(R()*w,h*.38+R()*h*.1,80+R()*160,6+R()*10,0,0,Math.PI*2); g.fill(); }
  })}));
  sky.material.map.magFilter=T.LinearFilter; sky.renderOrder=-1; sky.frustumCulled=false; sky.onBeforeRender=function(r,sc,c){ this.position.set(c.position.x,0,c.position.z); this.updateMatrixWorld(); }; scene.add(sky); return sky;
}
/* garoa (fase 1) e névoa rasteira (fases 2 e 3) */
function makeRain(){
  if(!MAT_HQ) return null; const n=650, pos=new Float32Array(n*6), data=[];
  for(let i=0;i<n;i++) data.push({x:rnd(-14,14),y:rnd(0,12),z:rnd(-14,14),s:rnd(8,11)});
  const geo=new T.BufferGeometry(); geo.setAttribute('position',new T.BufferAttribute(pos,3));
  const mesh=new T.LineSegments(geo,new T.LineBasicMaterial({color:0x8c9aac,transparent:true,opacity:.28,depthWrite:false})); mesh.frustumCulled=false; scene.add(mesh);
  return {mesh,data,pos};
}
function makeMist(o){
  if(!MAT_HQ) return null; const list=[];
  for(let i=0;i<o.n;i++){ const s=new T.Sprite(new T.SpriteMaterial({map:SOFTTEX,color:o.color,transparent:true,opacity:rnd(.07,.14),depthWrite:false,fog:true}));
    s.position.set(rnd(o.x0,o.x1),rnd(.5,1.4),rnd(o.z0,o.z1)); const k=rnd(6,11); s.scale.set(k,k*.42,1); scene.add(s); list.push({s,vx:rnd(-.25,.25),vz:rnd(-.15,.15),o}); }
  return list;
}
function updateAtmo(dt){
  if(!G) return;
  const R=G.rain; if(R){ const c=camera.position, p=R.pos;
    R.data.forEach((d,i)=>{ d.y-=d.s*dt; if(d.y<0){ d.y=rnd(9,12); d.x=rnd(-14,14); d.z=rnd(-14,14); } const x=c.x+d.x, z=c.z+d.z; p[i*6]=x; p[i*6+1]=d.y; p[i*6+2]=z; p[i*6+3]=x+.02; p[i*6+4]=d.y+.32; p[i*6+5]=z+.03; });
    R.mesh.geometry.attributes.position.needsUpdate=true; }
  if(G.mist) for(const m of G.mist){ m.s.position.x+=m.vx*dt; m.s.position.z+=m.vz*dt; const o=m.o; if(m.s.position.x<o.x0) m.s.position.x=o.x1; if(m.s.position.x>o.x1) m.s.position.x=o.x0; if(m.s.position.z<o.z0) m.s.position.z=o.z1; if(m.s.position.z>o.z1) m.s.position.z=o.z0; }
}
function dress01(){
  const R=mulberry32(1101);
  const chim=[], pots=[];
  for(const s of W.solids){ if(!s.mesh||s.maxY<9.5||s.minY>0) continue; const w=s.maxX-s.minX, d=s.maxZ-s.minZ; if(w<3||d<3) continue;
    const n=Math.max(1,Math.round(w*d/80)); for(let i=0;i<n;i++){ const x=s.minX+.8+R()*(w-1.6), z=s.minZ+.8+R()*(d-1.6), h=1+R()*.9; chim.push([x,s.maxY+h/2,z,.75,h,.5]); pots.push([x-.18,s.maxY+h+.16,z,.13,.32,.13],[x+.18,s.maxY+h+.16,z,.13,.32,.13]); } }
  instanced(UNIT,MAT.chimney,chim); instanced(new T.CylinderGeometry(.5,.5,1,6),MAT.pot,pots);
  // terraço do café
  for(const [x,z] of [[-10.4,-2.6],[-12.4,-3.9],[-10.2,-5.2]]){
    addMesh(new T.CylinderGeometry(.4,.4,.04,14),MAT.cafeTop,x,.74,z,'metal'); addMesh(new T.CylinderGeometry(.03,.05,.72,6),MAT.darkMetal,x,.37,z,'metal'); addSolidOnly(x-.32,x+.32,z-.32,z+.32,.75);
    chair(x+.62,z+.25,-1.9); chair(x-.6,z-.3,1.2); }
  { const t=textTex(256,64,(g,w,h)=>{ for(let i=0;i<8;i++){ g.fillStyle=i%2?'#e2d6bc':'#8e2a20'; g.fillRect(i*32,0,32,h); } g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(0,h-8,w,8); });
    const aw=new T.Mesh(new T.PlaneGeometry(6,1.7),MAT_HQ?new T.MeshPhongMaterial({map:t,side:T.DoubleSide,shininess:4}):new T.MeshLambertMaterial({map:t,side:T.DoubleSide})); aw.position.set(-11,3.05,-7.35); aw.rotation.x=-Math.PI/2+.55; aw.userData.mat='cloth'; scene.add(aw); W.shootables.push(aw); }
  poster(-11,4.05,-7.98,0,3.4,.5,(g,w,h)=>{ g.fillStyle='#1d2420'; g.fillRect(0,0,w,h); g.fillStyle='#e8c77a'; g.font='bold 30px serif'; g.textAlign='center'; g.fillText('CAFÉ DES LANTERNES',w/2,h/2+10); });
  // bicicleta encostada
  { const b=new T.Group(); b.position.set(-4.72,0,27); b.rotation.z=.12; const wm=new T.TorusGeometry(.32,.022,6,18);
    for(const z of [-.52,.52]){ const w=new T.Mesh(wm,MAT.darkMetal); w.position.set(0,.34,z); w.rotation.y=Math.PI/2; b.add(w); }
    const fr=(len,x,y,z,rx)=>{ const o=new T.Mesh(BOX(.025,.025,len),hm(0x2a3a30)); o.position.set(x,y,z); o.rotation.x=rx; b.add(o); };
    fr(.75,0,.6,-.05,.35); fr(.6,0,.5,.2,-.9); fr(.55,0,.42,-.3,1.0); fr(.22,0,.82,-.42,0); fr(.06,0,.82,.32,0);
    scene.add(b); }
  poster(-4.97,3.15,39.5,Math.PI/2,1.1,.34,(g,w,h)=>{ g.fillStyle='#1e3f86'; g.fillRect(0,0,w,h); g.strokeStyle='#e8edf5'; g.lineWidth=5; g.strokeRect(5,5,w-10,h-10); g.fillStyle='#f0f2f6'; g.font='bold 22px sans-serif'; g.textAlign='center'; g.fillText('RUE DES LANTERNES',w/2,h/2+8); });
  // calhas
  const pipes=[]; for(const z of [37,28,16,-14,-20]) pipes.push([-4.94,6,z,.1,12,.1]); for(const z of [36,24,14,-12,-26,-40]) pipes.push([4.94,6,z,.1,12,.1]);
  instanced(new T.CylinderGeometry(.5,.5,1,6),MAT.darkMetal,pipes);
  // poças d'água
  if(MAT_HQ){ const pg=new T.CircleGeometry(1,20); pg.rotateX(-Math.PI/2);
    for(let i=0;i<14;i++){ const x=rnd(-3.6,3.6), z=rnd(-28,38); if(insideSolid(x,z,.6)) continue; const m=new T.Mesh(pg,MAT.puddle); m.position.set(x,.017,z); m.scale.set(rnd(.5,1.2),1,rnd(.35,.8)); m.rotation.y=rnd(0,3); scene.add(m); }
    for(const [x,z] of [[4,4],[-6,-2],[9,-3],[-3,6.5]]){ const m=new T.Mesh(pg,MAT.puddle); m.position.set(x,.017,z); m.scale.set(1.3,1,.8); scene.add(m); } }
}
function dress02(){
  const R=mulberry32(2202);
  // grades de ferro em volta de túmulos
  const posts=[], rails=[];
  const tombs=W.solids.filter(s=>s.cover&&s.maxY<1&&(s.maxZ-s.minZ)>1.5&&s.mesh);
  tombs.forEach((s,i)=>{ if(i%3) return; const x0=s.minX-.18,x1=s.maxX+.18,z0=s.minZ-.18,z1=s.maxZ+.18;
    for(const [x,z] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1]]) posts.push([x,.45,z,.04,.9,.04]);
    for(let t=x0+.18;t<x1-.05;t+=.18){ posts.push([t,.36,z0,.014,.72,.014]); posts.push([t,.36,z1,.014,.72,.014]); }
    for(let t=z0+.18;t<z1-.05;t+=.18){ posts.push([x0,.36,t,.014,.72,.014]); posts.push([x1,.36,t,.014,.72,.014]); }
    rails.push([(x0+x1)/2,.72,z0,x1-x0,.03,.03],[(x0+x1)/2,.72,z1,x1-x0,.03,.03],[x0,.72,(z0+z1)/2,.03,.03,z1-z0],[x1,.72,(z0+z1)/2,.03,.03,z1-z0]); });
  instanced(UNIT,MAT.darkMetal,posts); instanced(UNIT,MAT.darkMetal,rails);
  // velas e coroas de flores
  const stones=W.solids.filter(s=>!s.cover&&s.mesh&&s.maxY<1.3&&(s.maxZ-s.minZ)<.2&&(s.maxX-s.minX)>.4);
  const candles=[], flames=[], wreaths=[];
  stones.forEach(s=>{ const cx=(s.minX+s.maxX)/2, z=s.maxZ+.12; if(R()<.22){ candles.push([cx+.16,.09,z,.05,.18,.05]); flames.push([cx+.16,.21,z,.025,.05,.025]); } if(R()<.14) wreaths.push([cx,.42,s.maxZ+.035,1,1,1]); });
  instanced(new T.CylinderGeometry(.5,.5,1,6),MAT.paper,candles); instanced(UNIT,MAT.flame,flames); instanced(new T.TorusGeometry(.16,.045,5,12),MAT.wreath,wreaths);
  // anjo de pedra perto do jazigo
  addBlock(29.3,30.7,-26.7,-25.3,1.2,{mat:MAT.mstone,surf:'stone',cover:true,top:MAT.mstone,seg:1});
  const ang=new T.Group(); ang.position.set(30,1.2,-26); ang.rotation.y=-Math.PI/2; const sm=MAT.statue;
  const A=(w,h,d,x,y,z,rx=0,rz=0,geo)=>{ const o=new T.Mesh(geo||BOX(w,h,d),sm); o.position.set(x,y,z); o.rotation.set(rx,0,rz); ang.add(o); o.userData.mat='stone'; W.shootables.push(o); return o; };
  A(.5,.9,.32,0,.45,0); A(.36,.5,.26,0,1.1,0); A(0,0,0,0,1.5,0,0,0,new T.SphereGeometry(.13,8,6));
  A(.06,.9,.5,-.22,1.15,-.25,.35,.25); A(.06,.9,.5,.22,1.15,-.25,.35,-.25); A(.09,.45,.09,-.2,1.2,.12,-1.1,.2); A(.09,.45,.09,.2,1.2,.12,-1.1,-.2);
  scene.add(ang);
  // ossuário: pilhas de ossos e velas
  const bones=[], skulls=[], tc=[], tf=[];
  TUNNEL02.forEach((row,r)=>{ for(let c=0;c<row.length;c++){ if(row[c]!=='.') continue; const cx=33+c*2+1, cz=-46+r*2+1;
    if(c>0&&row[c-1]==='#'&&R()<.6) for(let k=0;k<4;k++) bones.push([cx-.7+R()*.2,.05+k*.05,cz-.7+R()*1.4,.08,.05,.5,R()*.4,0]);
    if(c<row.length-1&&row[c+1]==='#'&&R()<.45) skulls.push([cx+.68,.1,cz-.6+R()*1.2,1,1,1]);
    if(R()<.12){ tc.push([cx+(R()<.5?-.85:.85),.1,cz,.06,.2,.06]); tf.push([cx+(tc[tc.length-1][0]-cx),.24,cz,.03,.06,.03]); tf[tf.length-1][0]=tc[tc.length-1][0]; } } });
  instanced(UNIT,MAT.bone,bones); instanced(new T.SphereGeometry(.1,6,5),MAT.bone,skulls); instanced(new T.CylinderGeometry(.5,.5,1,6),MAT.paper,tc); instanced(UNIT,MAT.flame,tf);
  cataDress02();
}
/* ---------- Op 2: ossuário caprichado (paredes de ossos, faixas de crânios, velas) ---------- */
function cataTex(){
  if(TEX.ossuB) return; const R=mulberry32(7702);
  TEX.ossuB=canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#17130e'; g.fillRect(0,0,w,h);
    for(let y=h+4;y>-8;y-=11){ const off=(y/11|0)%2?6:0; for(let x=-8+off;x<w+8;x+=12+(R()*3|0)){ const v=R(); const c=v<.3?[176,160,126]:v<.6?[150,134,104]:v<.85?[128,112,86]:[196,182,150]; const r=5+R()*2.5, cx=x+R()*2, cy=y+R()*2;
      g.fillStyle=`rgb(${c[0]},${c[1]},${c[2]})`; g.beginPath(); g.ellipse(cx,cy,r,r*.85,0,0,7); g.fill(); g.fillStyle='rgba(255,245,220,.18)'; g.beginPath(); g.ellipse(cx-1.5,cy-1.5,r*.5,r*.4,0,0,7); g.fill(); if(R()<.5){ g.fillStyle='rgba(30,20,10,.35)'; g.beginPath(); g.arc(cx+1,cy+1,r*.3,0,7); g.fill(); } } }
    const b0=Math.round((1-1.07/1.4)*h), b1=Math.round((1-.83/1.4)*h); const gr=g.createLinearGradient(0,b0,0,b1); gr.addColorStop(0,'rgba(10,8,5,.95)'); gr.addColorStop(.5,'rgba(10,8,5,.75)'); gr.addColorStop(1,'rgba(10,8,5,.95)'); g.fillStyle=gr; g.fillRect(0,b0,w,b1-b0);
    const d0=Math.round((1-.14/1.4)*h); g.fillStyle='rgba(30,24,16,.7)'; g.fillRect(0,d0,w,h-d0); for(let i=0;i<300;i++){ g.fillStyle=`rgba(0,0,0,${R()*.25})`; g.fillRect(R()*w,R()*h,2+R()*6,1+R()*3); } },1.4);
  TEX.ossuL=canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#8a8070'; g.fillRect(0,0,w,h); for(let i=0;i<1800;i++){ const v=R(); g.fillStyle=v<.5?`rgba(40,32,24,${R()*.12})`:`rgba(255,250,235,${R()*.08})`; g.fillRect(R()*w,R()*h,2+R()*10,1+R()*4); }
    g.strokeStyle='rgba(40,30,20,.35)'; for(let i=0;i<70;i++){ const x=R()*w, y=R()*h; g.lineWidth=1+R(); g.beginPath(); g.moveTo(x,y); g.lineTo(x+8+R()*16,y+R()*6-3); g.stroke(); }
    g.strokeStyle='rgba(20,15,10,.45)'; for(let i=0;i<6;i++){ let x=R()*w, y=R()*h; g.beginPath(); g.moveTo(x,y); for(let k=0;k<8;k++){ x+=R()*14-7; y+=6+R()*8; g.lineTo(x,y); } g.stroke(); } },2);
  TEX.skullFace=canvasTex(64,64,(g)=>{ g.fillStyle='#120d08'; for(const x of [20,44]){ g.beginPath(); g.ellipse(x,25,9,8,0,0,7); g.fill(); } g.beginPath(); g.moveTo(32,34); g.lineTo(27,46); g.lineTo(37,46); g.closePath(); g.fill(); for(let i=0;i<6;i++) g.fillRect(19+i*4.6,55,2.4,7); });
  TEX.skullFace.magFilter=T.LinearFilter;
  TEX.soft2=canvasTex(64,64,(g)=>{ const gr=g.createRadialGradient(32,32,1,32,32,31); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.35,'rgba(255,255,255,.45)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); }); TEX.soft2.magFilter=T.LinearFilter;
}
function plaqueTex(lines){ return canvasTex(256,128,(g,w,h)=>{ const R=mulberry32(lines[0].length*31); g.fillStyle='#a8a090'; g.fillRect(0,0,w,h); for(let i=0;i<500;i++){ g.fillStyle=`rgba(${R()<.5?'40,30,20':'255,250,240'},${R()*.1})`; g.fillRect(R()*w,R()*h,2+R()*6,1+R()*3); }
  g.strokeStyle='rgba(40,30,20,.6)'; g.lineWidth=3; g.strokeRect(8,8,w-16,h-16); g.textAlign='center'; const fs=lines.length>2?20:24; g.font=`bold ${fs}px serif`;
  lines.forEach((t,i)=>{ const y=h/2+(i-(lines.length-1)/2)*(fs+8)+fs*.35; g.fillStyle='rgba(255,250,235,.55)'; g.fillText(t,w/2+1,y+1); g.fillStyle='#2a2018'; g.fillText(t,w/2,y); }); }); }
function cataSkullGeo(){ if(cataSkullGeo.g) return cataSkullGeo.g; const cr=new T.SphereGeometry(.1,6,4,0,Math.PI*2,0,Math.PI*.78); cr.scale(.86,.92,1.06); const jaw=new T.BoxGeometry(.12,.075,.09); jaw.translate(0,-.075,.04);
  const parts=[cr,jaw].map(x=>x.index?x.toNonIndexed():x); let n=0; for(const p of parts) n+=p.attributes.position.count; const pos=new Float32Array(n*3), nor=new Float32Array(n*3), uv=new Float32Array(n*2); let o=0; for(const p of parts){ pos.set(p.attributes.position.array,o*3); nor.set(p.attributes.normal.array,o*3); uv.set(p.attributes.uv.array,o*2); o+=p.attributes.position.count; }
  const g=new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(pos,3)); g.setAttribute('normal',new T.BufferAttribute(nor,3)); g.setAttribute('uv',new T.BufferAttribute(uv,2)); return cataSkullGeo.g=g; }
function cataChunks(geo,mat,list,ro){ const S=12, groups=new Map(); for(const it of list){ const k=Math.floor(it[0]/S)+'|'+Math.floor(it[2]/S); if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(it); }
  for(const L of groups.values()){ const im=instanced(geo.clone(),mat,L); let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9; for(const it of L){ x0=Math.min(x0,it[0]); x1=Math.max(x1,it[0]); y0=Math.min(y0,it[1]); y1=Math.max(y1,it[1]); z0=Math.min(z0,it[2]); z1=Math.max(z1,it[2]); }
    const c=V3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2); im.geometry.boundingSphere=new T.Sphere(c,Math.hypot(x1-x0,y1-y0,z1-z0)/2+.4); im.frustumCulled=true; if(ro) im.renderOrder=ro; CATA_CH.push(im); } }
let CATA_CH=[];
function cataDress02(){
  CATA_CH=[]; cataTex(); const R=mulberry32(4402), X0=33, Z0=-46, C=2, SH=1.72, SD=.14;
  MAT.bones.map=TEX.ossuL; if(MAT.bones.bumpMap) MAT.bones.bumpMap=TEX.ossuL; MAT.bones.color.setHex(0x9a9080); MAT.bones.needsUpdate=true;
  const boneM=MAT_HQ?new T.MeshPhongMaterial({map:TEX.ossuB,bumpMap:TEX.ossuB,bumpScale:.05,shininess:14,specular:0x1a1810}):new T.MeshLambertMaterial({map:TEX.ossuB});
  const limeM=new T.MeshLambertMaterial({map:TEX.lime,color:0x8a8070}), ceilM=new T.MeshLambertMaterial({map:TEX.ossuL,color:0x6a6258});
  const skullM=hm(0xcfc2a0), faceM=new T.MeshLambertMaterial({map:TEX.skullFace,transparent:true,alphaTest:.4,depthWrite:false,color:0xcfc2a0});
  const open=(c,r)=>r>=0&&r<TUNNEL02.length&&c>=0&&c<TUNNEL02[r].length&&TUNNEL02[r][c]==='.';
  const isWall=(c,r)=>r>=0&&r<TUNNEL02.length&&c>=0&&c<TUNNEL02[r].length&&TUNNEL02[r][c]==='#';
  const slab=(x0,x1,z0,z1,y0,y1,mat)=>{ const geo=new T.BoxGeometry(x1-x0,y1-y0,z1-z0); const cx=(x0+x1)/2, cy=(y0+y1)/2, cz=(z0+z1)/2; worldUV(geo,cx,cy,cz); const m=new T.Mesh(geo,mat); m.position.set(cx,cy,cz); m.userData.mat='stone'; dressAdd(m); return m; };
  const skulls=[], faces=[], faceList=[], arches=[];
  const pushSkull=(x,y,z,ry,s)=>{ skulls.push([x,y,z,s,s*(.95+R()*.1),s,ry+(R()-.5)*.25,(R()-.5)*.15]); faces.push([x+Math.sin(ry)*.112*s,y-.01*s,z+Math.cos(ry)*.112*s,.16*s,.14*s,1,ry]); };
  TUNNEL02.forEach((row,r)=>{ for(let c=0;c<row.length;c++){ if(row[c]!=='.') continue; const cx=X0+c*C+1, cz=Z0+r*C+1;
    for(const [dc,dr] of [[-1,0],[1,0],[0,-1],[0,1]]){ if(!isWall(c+dc,r+dr)) continue; faceList.push({c,r,dc,dr});
      const ry=Math.atan2(-dc,-dr); const hy=SH+(dc?0:.004);
      let x0,x1,z0,z1; if(dc){ const xw=cx+dc*1; x0=dc<0?xw:xw-SD; x1=dc<0?xw+SD:xw; z0=cz-1; z1=cz+1; } else { const zw=cz+dr*1; z0=dr<0?zw:zw-SD; z1=dr<0?zw+SD:zw; x0=cx-1; x1=cx+1; }
      slab(x0,x1,z0,z1,0,hy,boneM); slab(dc?(dc<0?x0:x1-.2):x0-.0,dc?(dc<0?x0+.2:x1):x1,dc?z0:(dr<0?z0:z1-.2),dc?z1:(dr<0?z0+.2:z1),hy,hy+.06,limeM);
      const fx=dc?cx+dc*(1-SD+.02):0, fz=dr?cz+dr*(1-SD+.02):0;
      for(let t=-.92;t<=.92;t+=.205){ const x=dc?fx-dc*.0:cx+t, z=dc?cz+t:fz; pushSkull(x-dc*.04,hy+.14,z-dr*.04,ry,1); pushSkull(x-dc*.05,.95,z-dr*.05,ry,.95); }
      if((c*7+r*3)%9===0){ for(const [a,b] of [[0,0],[-.21,.21],[.21,.21],[-.21,-.21],[.21,-.21]]) { const x=dc?fx:cx+a, z=dc?cz+a:fz; pushSkull(x-dc*.06,.48+b,z-dr*.06,ry,.9); } }
    }
    // arcos de pedra nos corredores
    const vert=isWall(c-1,r)&&isWall(c+1,r)&&open(c,r-1)&&open(c,r+1), horz=isWall(c,r-1)&&isWall(c,r+1)&&open(c-1,r)&&open(c+1,r);
    if(vert&&r%3===0){ for(const s of [-1,1]) slab(cx+s*1-(s>0?.24:0),cx+s*1+(s<0?.24:0),cz-1-.16,cz-1+.16,0,2.8,limeM); slab(cx-1,cx+1,cz-1-.16,cz-1+.16,2.5,2.79,limeM); }
    if(horz&&c%3===0){ for(const s of [-1,1]) slab(cx-1-.16,cx-1+.16,cz+s*1-(s>0?.24:0),cz+s*1+(s<0?.24:0),0,2.8,limeM); slab(cx-1-.16,cx-1+.16,cz-1,cz+1,2.5,2.79,limeM); }
  } });
  // ---- colunas-barril de ossos nas salas maiores
  const pillars=[[51,-10],[51,-42],[37,-32]];
  for(const [px,pz] of pillars){ const pr=.58; const cyl=new T.Mesh(new T.CylinderGeometry(pr,pr*1.06,2.2,14,1,true),boneM); cyl.position.set(px,1.1,pz); const uv=cyl.geometry.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*2.6,uv.getY(i)*1.57); dressAdd(cyl);
    const cap=new T.Mesh(new T.CylinderGeometry(pr*1.25,pr*1.1,.3,14),limeM); cap.position.set(px,2.65,pz); dressAdd(cap); const sh=new T.Mesh(new T.CylinderGeometry(pr*.9,pr*.9,.4,12),limeM); sh.position.set(px,2.4,pz); dressAdd(sh); const base=new T.Mesh(new T.CylinderGeometry(pr*1.2,pr*1.25,.16,14),limeM); base.position.set(px,.08,pz); dressAdd(base);
    for(const [yy,n,rr] of [[.95,16,pr+.02],[2.24,16,pr+.0]]) for(let k=0;k<n;k++){ const a=k/n*Math.PI*2; pushSkull(px+Math.sin(a)*rr,yy,pz+Math.cos(a)*rr,a,.92); }
    addSolidOnly(px-pr,px+pr,pz-pr,pz+pr,2.8,0,true); }
  // ---- fêmures em X em algumas paredes
  const fem=[]; for(const f of faceList){ if((f.c*5+f.r*3)%7!==0) continue; const cx=X0+f.c*C+1, cz=Z0+f.r*C+1, ry=Math.atan2(-f.dc,-f.dr), fx=cx+f.dc*(1-SD-.03), fz=cz+f.dr*(1-SD-.03);
    for(const sg of [-1,1]) fem.push([fx,.5,fz,.035,.75,.035,ry,0,sg*.75]); pushSkull(fx-f.dc*.05,.5,fz-f.dr*.05,ry,.85); }
  for(const it of fem){ const m=new T.Mesh(new T.CylinderGeometry(1,1,1,6),skullM); m.position.set(it[0],it[1],it[2]); m.rotation.set(0,it[6],it[8],'YXZ'); m.scale.set(it[3],it[4],it[5]); dressAdd(m); for(const e of [-1,1]){ const k=new T.Mesh(new T.SphereGeometry(.045,6,4),skullM); const v=new T.Vector3(0,e*.37,0).applyEuler(m.rotation); k.position.set(it[0]+v.x,it[1]+v.y,it[2]+v.z); dressAdd(k); } }
  // ---- linha negra de fuligem no teto (o caminho antigo dos pedreiros)
  { const Q=[[13,0]], prev={}, key=(r,c)=>r+','+c; prev[key(13,0)]=null; let found=null; while(Q.length){ const [r,c]=Q.shift(); if(r===1&&c===9){ found=[r,c]; break; } for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nr=r+dr, nc=c+dc; if(!open(nc,nr)||key(nr,nc) in prev) continue; prev[key(nr,nc)]=[r,c]; Q.push([nr,nc]); } }
    const soot=new T.MeshBasicMaterial({color:0x0a0806,transparent:true,opacity:.75,depthWrite:false}); let cur=found; while(cur&&prev[key(cur[0],cur[1])]){ const pv=prev[key(cur[0],cur[1])]; const ax=X0+cur[1]*C+1, az=Z0+cur[0]*C+1, bx=X0+pv[1]*C+1, bz=Z0+pv[0]*C+1; const m=new T.Mesh(new T.PlaneGeometry(.07,2.05),soot); m.rotation.set(Math.PI/2,0,ax!==bx?Math.PI/2:0); m.position.set((ax+bx)/2+(R()-.5)*.08,2.785,(az+bz)/2); dressAdd(m); cur=pv; } }
  // ---- teias nos cantos do teto
  { const web=canvasTex(64,64,(g)=>{ g.strokeStyle='rgba(220,220,210,.55)'; g.lineWidth=1; for(let k=0;k<7;k++){ const a=k/6*Math.PI/2; g.beginPath(); g.moveTo(0,0); g.lineTo(Math.cos(a)*64,Math.sin(a)*64); g.stroke(); } for(let r=10;r<64;r+=9){ g.beginPath(); for(let k=0;k<=6;k++){ const a=k/6*Math.PI/2, rr=r+(k%2)*2; k?g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr); } g.stroke(); } }); web.magFilter=T.LinearFilter;
    const wm=new T.MeshBasicMaterial({map:web,transparent:true,depthWrite:false,side:T.DoubleSide,color:0x9a948a}); let n=0;
    TUNNEL02.forEach((row,r)=>{ for(let c=0;c<row.length;c++){ if(row[c]!=='.'||n>26||(c*3+r*5)%4) continue; const cx=X0+c*C+1, cz=Z0+r*C+1; for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ if(!isWall(c+dx,r)||!isWall(c,r+dz)) continue; const m=new T.Mesh(new T.PlaneGeometry(.9,.9),wm); m.position.set(cx+dx*.62,2.5,cz+dz*.62); m.rotation.set(0,Math.atan2(-dx,-dz)+Math.PI/4*0,0); m.lookAt(cx,2.2,cz); dressAdd(m); n++; break; } } }); }
  // ---- grelha no teto com um feixe de luar
  { const gx=41, gz=-25; const gr=new T.Mesh(new T.PlaneGeometry(.9,.9),new T.MeshBasicMaterial({color:0x8aa0c8})); gr.rotation.x=Math.PI/2; gr.position.set(gx,2.78,gz); scene.add(gr); for(let i=-2;i<=2;i++){ const b=new T.Mesh(BOX(.04,.04,.9),hm(0x1a1a1a)); b.position.set(gx+i*.18,2.76,gz); scene.add(b); }
    const beam=new T.Mesh(new T.CylinderGeometry(.42,.75,2.75,12,1,true),new T.MeshBasicMaterial({map:TEX.soft2||SOFTTEX||null,color:0x4a5a7a,transparent:true,opacity:.35,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide})); beam.position.set(gx,1.4,gz); scene.add(beam);
    const spot=new T.Mesh(new T.PlaneGeometry(1.8,1.8),new T.MeshBasicMaterial({map:TEX.soft2||SOFTTEX||null,color:0x3a4a6a,transparent:true,blending:T.AdditiveBlending,depthWrite:false})); spot.rotation.x=-Math.PI/2; spot.position.set(gx,.02,gz); scene.add(spot);
    const ml=new T.PointLight(0x7a90c8,.9,6,1.6); ml.position.set(gx,2.2,gz); scene.add(ml); }
  // ---- ratos
  const rats=[]; { const rm=hm(0x2a2622), tm=hm(0x6a5048); const spots=faceList.filter((f,i)=>i%9===4).slice(0,7);
    for(const f of spots){ const g=new T.Group(); const b=new T.Mesh(new T.SphereGeometry(.06,6,4),rm); b.scale.set(1,.8,1.9); b.position.y=.05; g.add(b); const hd=new T.Mesh(new T.ConeGeometry(.04,.09,5),rm); hd.rotation.x=Math.PI/2; hd.position.set(0,.05,.14); g.add(hd); const tl=new T.Mesh(BOX(.01,.01,.18),tm); tl.position.set(0,.03,-.19); g.add(tl); scene.add(g);
      const cx=X0+f.c*C+1, cz=Z0+f.r*C+1, wx=cx+f.dc*(1-SD-.1), wz=cz+f.dr*(1-SD-.1), ax=f.dc?0:1, az=f.dc?1:0; rats.push({g,ax,az,ox:wx,oz:wz,t:R()*2,dir:1,pause:R()*3,spd:0,flee:0,len:.85}); g.position.set(wx,0,wz); } }
  cataChunks(cataSkullGeo(),skullM,skulls); cataChunks(new T.PlaneGeometry(1,1),faceM,faces,1);
  // teto de calcário
  { const pl=new T.Mesh(new T.PlaneGeometry(26,42),ceilM); pl.rotation.x=Math.PI/2; pl.position.set(45,2.795,-25); const uv=pl.geometry.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*13,uv.getY(i)*21); scene.add(pl); }
  // placas gravadas
  const plaques=[['OSSEMENTS DU CIMETIÈRE','DE SAINT-AUBIN','DÉPOSÉS EN 1787'],['PASSANT, ARRÊTE-TOI :','CE QUE TU ES, ILS LE FURENT'],['SILENCE','ICI DORMENT CEUX QUI VEILLENT'],['GALERIE DU NORD','N° VII'],['MEMENTO MORI']];
  const pf=faceList.filter(f=>(f.c*5+f.r*11)%13===0).slice(0,plaques.length);
  pf.forEach((f,i)=>{ const cx=X0+f.c*C+1, cz=Z0+f.r*C+1, ry=Math.atan2(-f.dc,-f.dr); const m=new T.Mesh(new T.BoxGeometry(.9,.46,.05),[limeM,limeM,limeM,limeM,new T.MeshLambertMaterial({map:plaqueTex(plaques[i])}),limeM]); m.position.set(cx+f.dc*.97,2.22,cz+f.dr*.97); m.rotation.y=ry; scene.add(m); });
  // velas, poças, entulho
  const tc=[], tf=[], glows=[], pools=[], lights=[], rubble=[]; const soft=TEX.soft2||SOFTTEX;
  const cand=faceList.filter((f,i)=>(f.c*3+f.r*7+i)%6===0);
  cand.forEach((f,i)=>{ const cx=X0+f.c*C+1, cz=Z0+f.r*C+1; const bx=cx+f.dc*(1-SD-.1), bz=cz+f.dr*(1-SD-.1); const n=2+(R()*3|0);
    for(let k=0;k<n;k++){ const ox=f.dc?0:(k-n/2)*.1+R()*.04, oz=f.dc?(k-n/2)*.1+R()*.04:0, hgt=.08+R()*.16; tc.push([bx+ox,hgt/2,bz+oz,.045,hgt,.045]); tf.push([bx+ox,hgt+.035,bz+oz,.022,.05,.022]); }
    const gl=new T.Sprite(new T.SpriteMaterial({map:soft,color:0xffa040,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.75})); gl.position.set(bx,.28,bz); gl.scale.setScalar(.7); scene.add(gl); glows.push(gl);
    const pool=new T.Mesh(new T.PlaneGeometry(2.4,2.4),new T.MeshBasicMaterial({map:soft,color:0x8a5018,transparent:true,blending:T.AdditiveBlending,depthWrite:false})); pool.rotation.x=-Math.PI/2; pool.position.set(bx-f.dc*.5,.02,bz-f.dr*.5); scene.add(pool); pools.push(pool);
    if(i%3===0&&lights.length<4){ const L=new T.PointLight(0xff9a48,1.1,5.5,1.7); L.position.set(bx-f.dc*.15,.5,bz-f.dr*.15); scene.add(L); lights.push(L); } });
  instanced(new T.CylinderGeometry(.5,.5,1,7),MAT.paper,tc); instanced(UNIT,MAT.flame,tf);
  const wet=MAT_HQ?new T.MeshPhongMaterial({color:0x0a0a0c,shininess:90,specular:0x6a6a70,transparent:true,opacity:.85}):new T.MeshLambertMaterial({color:0x0a0a0c,transparent:true,opacity:.7});
  TUNNEL02.forEach((row,r)=>{ for(let c=0;c<row.length;c++){ if(row[c]!=='.') continue; const cx=X0+c*C+1, cz=Z0+r*C+1; if(R()<.16){ const p=new T.Mesh(new T.CircleGeometry(.5,14),wet); p.rotation.x=-Math.PI/2; p.scale.set(.8+R()*.9,.6+R()*.7,1); p.position.set(cx+R()-.5,.012,cz+R()-.5); scene.add(p); }
    for(let k=0;k<3;k++) if(R()<.5){ const a=R()*6.28, s=.04+R()*.07; rubble.push([cx+Math.cos(a)*.7,s*.4,cz+Math.sin(a)*.7,s,s*.7,s,R()*3]); } } });
  instanced(new T.DodecahedronGeometry(1,0),hm(0x6a6254),rubble);
  // névoa rasteira
  const mist=[]; for(let i=0;i<14;i++){ const f=faceList[(i*17)%faceList.length]; const sp=new T.Sprite(new T.SpriteMaterial({map:soft,color:0x8a7a68,transparent:true,depthWrite:false,opacity:.06})); sp.position.set(X0+f.c*C+1,.35,Z0+f.r*C+1); sp.scale.set(3.4,1.1,1); scene.add(sp); mist.push({sp,ph:R()*6,x:sp.position.x,z:sp.position.z}); }
  mergeDress();
  G.cata={rats,chunks:CATA_CH,glows,pools,lights,mist,drip:2,fogBase:scene.fog?scene.fog.color.clone():null,fogD:scene.fog?scene.fog.density:0};
}
function cataTick02(dt){ const K=G.cata; if(!K) return; const t=simTime, P=G.player;
  K.glows.forEach((g,i)=>{ const f=.85+Math.sin(t*11+i*1.7)*.08+Math.sin(t*23+i)*.05+(Math.random()-.5)*.06; g.scale.setScalar(.7*f); g.material.opacity=.7*f; K.pools[i].material.opacity=.9*f; });
  K.lights.forEach((L,i)=>{ L.intensity=1.05+Math.sin(t*9+i*2.1)*.12+(Math.random()-.5)*.14; });
  for(const m of K.mist){ m.sp.position.x=m.x+Math.sin(t*.15+m.ph)*.6; m.sp.position.z=m.z+Math.cos(t*.11+m.ph)*.6; m.sp.material.opacity=.05+Math.sin(t*.3+m.ph)*.02; }
  for(const ch of K.chunks){ const c=ch.geometry.boundingSphere.center; ch.visible=P.pos.x>29&&Math.hypot(c.x-P.pos.x,c.z-P.pos.z)<ch.geometry.boundingSphere.radius+22; }
  for(const r of K.rats){ const dx=P.pos.x-r.g.position.x, dz=P.pos.z-r.g.position.z, d=Math.hypot(dx,dz); if(d<3.2&&r.flee<=0){ r.flee=1.2; r.dir=-(Math.sign(dx*r.ax+dz*r.az)||1); if(d<6&&Math.random()<.5) AudioSys.play('squeak',r.g.position,.6); }
    let sp=0; if(r.flee>0){ r.flee-=dt; sp=3.2; } else if(r.pause>0){ r.pause-=dt; } else { sp=.8; if(Math.random()<dt*.6){ r.pause=.6+Math.random()*2.5; r.dir*=Math.random()<.5?-1:1; } }
    r.t+=r.dir*sp*dt; if(Math.abs(r.t)>r.len){ r.t=Math.sign(r.t)*r.len; r.dir*=-1; } r.g.position.set(r.ox+r.ax*r.t,0,r.oz+r.az*r.t); r.g.rotation.y=Math.atan2(r.ax*r.dir,r.az*r.dir); r.g.children[0].position.y=.05+(sp>0?Math.abs(Math.sin(simTime*30))*.012:0); r.g.children[2].rotation.y=Math.sin(simTime*(sp>0?20:3))*.4; }
  const inside=P.pos.x>33.2; if(scene.fog&&K.fogBase){ const k=K.inK=clamp((K.inK||0)+(inside?dt:-dt)*.8,0,1); scene.fog.color.copy(K.fogBase).lerp(_cataFog,k); scene.fog.density=K.fogD+(.058-K.fogD)*k; }
  if(inside&&(K.drip-=dt)<0){ K.drip=1.5+Math.random()*4; AudioSys.play('drip',V3(P.pos.x+rnd(-4,4),2.6,P.pos.z+rnd(-4,4)),.8); }
}
const _cataFog=new T.Color(0x0e0a07);


/* =========================================================
   RENDIÇÃO SILENCIOSA, CÂMERA E HOLOFOTE
   ========================================================= */
function canTakedown(e){
  if(e.dead||e.state==='COMBAT'||e.state==='RADIO'||G.player.dead||Math.abs(e.pos.y-G.player.pos.y)>.8) return false;
  const P=G.player.pos, dx=P.x-e.pos.x, dz=P.z-e.pos.z, d=Math.hypot(dx,dz); if(d>1.7) return false;
  if(e.asleep||e.state==='DISARMED') return true;
  return Math.abs(angDiff(e.yaw+e.headYaw,Math.atan2(dx,dz)))>1.95;
}
function addTakedown(e){
  W.interactables.push({id:'td_'+e.id,pt:()=>V3(e.pos.x,e.pos.y+1.2,e.pos.z),r:2.3,skip:true,label:()=>canTakedown(e)?'Render em silêncio':null,hold:()=>.45,use:()=>{ if(canTakedown(e)) e.knockOut(); }});
}
function photoCandidate(){
  if(!W.photo||!W.photo.length) return null;
  const c=camera.position, f=V3(0,0,-1).applyQuaternion(camera.quaternion); let best=null;
  for(const t of W.photo){
    if(t.taken) continue; const v=V3().subVectors(t.pos,c); const d=v.length(); v.divideScalar(d);
    const ang=Math.acos(clamp(v.dot(f),-1,1)), allow=.3+Math.atan((t.size||0)/d); if(ang>allow+.3||d>16) continue;
    let reason=null;
    if(ang>allow) reason='Centralize o alvo'; else if(d>t.max) reason='Aproxime-se'; else if(t.normal.dot(v)>-.08) reason='Ângulo ruim'; else { const h=segFirst(c.x,c.y,c.z,t.pos.x,t.pos.y,t.pos.z); if(h&&h.t<.96) reason='Algo bloqueia a visão'; }
    const sc=ang+d*.02; if(!best||sc<best.sc) best={t,ok:!reason,reason,sc};
  }
  return best;
}
function takePhoto(){
  G.photoT=simTime;
  AudioSys.play('shutter'); const fl=$('#camFlash'); fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on');
  const c=photoCandidate();
  if(c&&c.ok){
    for(const t of W.photo) if(t.id===c.t.id) t.taken=true; G.flags['photo_'+c.t.id]=true; G.stats.photos++;
    const o=c.t.obj&&obj(c.t.obj); if(o&&o.state==='hidden'&&G.levelId==='03'){ if(obj('enter')&&obj('enter').state==='active') complete('enter',true); for(const id of ['dossier','map','list']) activate(id); }
    if(c.t.obj) complete(c.t.obj); pickupMsg('Fotografado: '+c.t.label.replace(' (cópia da mesa)',''));
    G.radioMsg('ÉLISE',c.t.msg||{dossier:'O dossiê está no filme.',map:'O mapa de batidas está no filme.',list:'A lista de informantes também. Londres vai querer ver isso.'}[c.t.id]||'Fotografado.');
    if(c.t.after) c.t.after(); checkpoint();
  } else { const msg=c?('Foto não serviu: '+c.reason.toLowerCase()+' ('+c.t.label.replace(' (cópia da mesa)','')+')'):'Foto não serviu: nenhum documento no quadro'; showHint(msg); }
}
function toggleCamera(){
  if(!G||G.player.dead) return;
  if(!G.player.hasCamera){ showHint('Você não tem câmera nesta operação.'); return; }
  G.camMode=!G.camMode; $('#camView').hidden=!G.camMode; AudioSys.play('lamp'); input.fire=false; G.player.wpn.camLatch=true;
}
function updateSearchlight(dt){
  const S=G.sl; if(!S) return; const L=S.lamp;
  if(L.broken){ S.lit=false; return; }
  S.t+=dt; if(S.path) S.light.target.position.copy(S.path(S.t)); else S.light.target.position.set(Math.sin(S.t*.32)*17,0,21+Math.cos(S.t*.21)*9); S.light.target.updateMatrixWorld();
  if(S.beam) S.beam.lookAt(S.light.target.position);
  const P=G.player, lp=S.light.position, tp=V3(P.pos.x,P.pos.y+1.1,P.pos.z), dir=V3().subVectors(S.light.target.position,lp).normalize(), v=V3().subVectors(tp,lp), d=v.length(); v.divideScalar(d);
  S.lit=!P.dead && Math.acos(clamp(v.dot(dir),-1,1))<.19 && d<46 && !segFirst(lp.x,lp.y,lp.z,tp.x,tp.y,tp.z);
  S.litT=S.lit?S.litT+dt:Math.max(0,S.litT-dt*.5); S.cd-=dt;
  if(S.litT>1.1&&S.cd<=0){ S.cd=8; let best=null,bd=36; for(const e of G.enemies){ if(e.dead||e.asleep||e.state==='COMBAT'||e.state==='RADIO') continue; const dd=e.pos.distanceTo(P.pos); if(dd<bd){ bd=dd; best=e; } }
    G.radioMsg('RÁDIO',S.msg||'Do telhado: “Movimento no jardim!”','warn'); if(best){ best.alertLevel=1; best.awareness=Math.max(best.awareness,.65); best.toInvestigate(P.pos.x,P.pos.z); } }
}

/* =========================================================
   OPERAÇÃO 3 — Hôtel Delorme
   ========================================================= */
const ENEMY_DEFS_03=[
  {id:'h1',x:12,z:31,yaw:Math.PI/2,weapon:'rifle',helmet:true,lantern:true,patrol:[[21,31],[21,12.5],[-21,12.5],[-21,31]]},
  {id:'h2',x:-6,z:27.5,yaw:Math.PI/2,weapon:'smg',helmet:true,patrol:[[-6,27.5],[6,27.5],[6,13],[-6,13]]},
  {id:'h3',x:-1.9,z:7.9,yaw:0,weapon:'rifle',helmet:true},
  {id:'h4',x:21.5,z:3.2,yaw:0,weapon:'rifle',helmet:true},
  {id:'h5',x:15.5,z:-2.6,yaw:Math.PI/2,weapon:'pistol'},
  {id:'h6',x:5.9,z:3.4,yaw:Math.PI/2,weapon:'rifle',sleep:true},
  {id:'h7',x:8.4,z:-2,yaw:-Math.PI/2,weapon:'smg'},
  {id:'h8',x:9,z:-15.5,yaw:Math.PI,weapon:'pistol',officer:true},
  {id:'h9',x:-14,z:-8,yaw:Math.PI/2,weapon:'smg',helmet:true,patrol:[[-16.5,-8],[16.5,-8]]},
  {id:'h10',x:2.2,z:-12.6,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'h11',x:-8,z:2,yaw:-Math.PI/2,weapon:'pistol'},
];
function chandelier(id,x,z,r){
  bulb(id,x,3.45,z,r); const L=W.lamps[W.lamps.length-1]; L.light.color.setHex(0xffd9a0); L.base=1.35; L.light.intensity=1.35;
  const ring=new T.Mesh(new T.TorusGeometry(.5,.03,6,20),MAT.brass); ring.rotation.x=Math.PI/2; ring.position.set(x,3.38,z); scene.add(ring);
  const cs=[]; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; cs.push([x+Math.cos(a)*.5,3.46,z+Math.sin(a)*.5,.035,.12,.035]); } instanced(UNIT,MAT.bulb,cs);
  addMesh(new T.CylinderGeometry(.012,.012,.75,4),MAT.brass,x,3.85,z,null);
}
function deskLamp(id,x,y,z,r){
  addMesh(new T.ConeGeometry(.16,.14,10,1,true),MAT.greenShade,x,y+.12,z,null); addMesh(new T.CylinderGeometry(.015,.015,.3,4),MAT.brass,x,y-.08,z,null);
  bulb(id,x,y+.04,z,r); const L=W.lamps[W.lamps.length-1]; L.light.color.setHex(0xffe0a8); L.base=.95; L.light.distance=7;
}
function painting(x,y,z,ry,w,h,seed){
  const R=mulberry32(seed);
  const m=poster(x,y,z,ry,w,h,(g,W2,H2)=>{ const gr=g.createLinearGradient(0,0,0,H2); gr.addColorStop(0,`hsl(${200+R()*30},30%,${35+R()*15}%)`); gr.addColorStop(1,`hsl(${30+R()*20},35%,${40+R()*10}%)`); g.fillStyle=gr; g.fillRect(0,0,W2,H2);
    for(let i=0;i<3;i++){ g.fillStyle=`hsl(${80+R()*60},25%,${20+i*8}%)`; g.beginPath(); g.moveTo(0,H2*(.55+i*.12)); for(let x2=0;x2<=W2;x2+=W2/6) g.lineTo(x2,H2*(.5+i*.12)+(R()-.5)*H2*.12); g.lineTo(W2,H2); g.lineTo(0,H2); g.fill(); }
    g.strokeStyle='#b08a3a'; g.lineWidth=14; g.strokeRect(7,7,W2-14,H2-14); g.strokeStyle='#5a4018'; g.lineWidth=3; g.strokeRect(14,14,W2-28,H2-28); });
  return m;
}
function buildLevel03(){
  scene.background=new T.Color(0x0a0f16); scene.fog=new T.FogExp2(0x0b1119,.02);
  skyDome(77,[[0,'#04070c'],[.45,'#0c1420'],[.52,'#1a2433'],[1,'#080b0f']],[760,90,9],10);
  scene.add(new T.HemisphereLight(0x5a6a8c,0x16120c,.5));
  const moon=new T.DirectionalLight(0x9db2d4,.42); moon.position.set(-30,55,40); scene.add(moon);
  scene.add(new T.AmbientLight(0x1a2030,.36));
  { const gg=new T.PlaneGeometry(60,64,30,32); gg.rotateX(-Math.PI/2); gg.translate(0,0,6); const p=gg.attributes.position, uv=gg.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i),p.getZ(i)); const m=new T.Mesh(gg,MAT.lawn); m.userData.mat='dirt'; scene.add(m); W.shootables.push(m); }
  // muros do terreno e portão de serviço
  const pw={mat:MAT.gardenWall,surf:'stone',top:MAT.lime,seg:2};
  addBlock(-26.6,26.6,34,34.6,3.4,pw); addBlock(-26.6,26.6,-22.6,-22,3.4,pw);
  addBlock(-26.6,-26,-22,34,3.4,pw); addBlock(26,26.6,-22,18,3.4,pw); addBlock(26,26.6,22,34,3.4,pw);
  addBlock(25.8,26.8,17.2,18,4.2,pw); addBlock(25.8,26.8,22,22.8,4.2,pw);
  for(let z=18.2;z<=21.81;z+=.3) addMesh(new T.CylinderGeometry(.025,.025,3,4),MAT.darkMetal,26.3,1.5,z,'metal');
  addMesh(BOX(.06,.08,4),MAT.darkMetal,26.3,2.8,20,'metal'); addSolidOnly(26.2,26.4,18,22,3);
  // caminhos
  floorPlane(3,26.6,0,20.2,MAT.gravel,'stone',.014); floorPlane(48,2,0,20,MAT.gravel,'stone',.016); floorPlane(3,24,21.5,8,MAT.gravel,'stone',.015);
  floorPlane(10,2,0,7.5,MAT.lime,'stone',.02);
  // ---- palacete ----
  const ex={mat:MAT.lime,surf:'stone',top:MAT.slate,seg:2}, wp=MAT.wallpaper;
  addBlock(-18.5,-1.2,6,6.5,5.3,Object.assign({},ex,{inner:{'-z':wp}}));
  addBlock(1.2,18.5,6,6.5,5.3,Object.assign({},ex,{inner:{'-z':wp}}));
  addBlock(-1.2,1.2,6,6.5,2.3,Object.assign({},ex,{y0:3}));
  addBlock(-18.5,18.5,-20.5,-20,5.3,Object.assign({},ex,{inner:{'+z':wp}}));
  addBlock(-18.5,-18,-20,6,5.3,Object.assign({},ex,{inner:{'+x':wp}}));
  addBlock(18,18.5,-20,-1,5.3,Object.assign({},ex,{inner:{'-x':MAT.plaster}}));
  addBlock(18,18.5,1,6,5.3,Object.assign({},ex,{inner:{'-x':MAT.plaster}}));
  addBlock(18,18.5,-1,1,2.9,Object.assign({},ex,{y0:2.4}));
  const wall=(x0,x1,z0,z1,y0=0,h=4.2,m=wp)=>addBlock(x0,x1,z0,z1,h,{mat:m,surf:'stone',seg:2,top:MAT.ceil,y0});
  for(const [a,b] of [[-18,-12],[-10,-4],[4,6],[8,14],[16,18]]) wall(a,b,-6.15,-5.85);
  for(const [a,b,y] of [[-12,-10,2.6],[-4,4,3.2],[6,8,2.6],[14,16,2.6]]) wall(a,b,-6.15,-5.85,y,4.2-y);
  for(const [a,b] of [[-18,-11],[-9,-1],[1,8],[10,14],[16,18]]) wall(a,b,-10.15,-9.85);
  for(const [a,b] of [[-11,-9],[-1,1],[8,10],[14,16]]) wall(a,b,-10.15,-9.85,2.6,1.6);
  for(const x of [-6,6,12]) wall(x-.15,x+.15,-20,-10.15);
  wall(-4.15,-3.85,-5.85,-1); wall(-4.15,-3.85,1,6); wall(-4.15,-3.85,-1,1,2.6,1.6);
  wall(3.85,4.15,-5.85,6);
  wall(9.85,10.15,-5.85,2,0,4.2,MAT.plaster); wall(9.85,10.15,4,6,0,4.2,MAT.plaster); wall(9.85,10.15,2,4,2.6,1.6,MAT.plaster);
  addBlock(-18,18,-20,6,.5,{y0:4.2,mat:MAT.ceil,bottom:MAT.ceil,top:MAT.slate,seg:2});
  addBlock(-18.9,18.9,-20.9,6.9,1,{y0:5.3,mat:MAT.slate,surf:'stone',seg:2});
  addBlock(-16.5,16.5,-18.5,4.5,1.8,{y0:6.3,mat:MAT.slate,surf:'stone',seg:2});
  addBlock(-18.9,18.9,6.5,6.95,.3,{y0:5,mat:MAT.lime,solid:false,seg:2});
  // fachada sul: janelas, pilastras, mansardas
  const wins=[];
  for(const x of [-15,-11,-7,7,11,15]){ const lit=[-11,7,15].includes(x); const w=new T.Mesh(new T.PlaneGeometry(1.5,2.6),lit?MAT.winLit:MAT.winDark); w.position.set(x,2.1,6.52); scene.add(w); wins.push([x,.75,6.6,1.8,.12,.25],[x,3.45,6.6,1.8,.18,.22]);
    const c=new T.Mesh(new T.PlaneGeometry(1.6,2.8),MAT.curtain); c.position.set(x,2.1,5.98); c.rotation.y=Math.PI; scene.add(c); }
  for(const x of [-17.2,-13,-9,-3,3,9,13,17.2]) wins.push([x,2.6,6.58,.45,5.2,.16]);
  instanced(UNIT,MAT.lime,wins);
  for(const x of [-12,-6,6,12]){ const w=new T.Mesh(new T.PlaneGeometry(1,1.1),x===-6?MAT.winLit:MAT.winDark); w.position.set(x,7.1,4.52); scene.add(w); }
  addBlock(-3,3,6.5,8.2,.14,{mat:MAT.lime,surf:'stone',seg:2,top:MAT.lime});
  // portas
  makeDoor('terrace',{x:0,z:6.25,w:2.4,h:3,d:.1,mat:MAT.doorWood,offset:V3(2.45,0,0),npc:true});
  makeDoor('service',{x:18.25,z:0,w:.1,h:2.4,d:2,mat:MAT.doorWood,offset:V3(0,0,-1.95),npc:true});
  makeDoor('guardroom',{x:7,z:-6,w:2,h:2.6,d:.1,mat:MAT.doorWood,offset:V3(1.95,0,0),npc:true});
  makeDoor('office',{x:-10,z:-10,w:2,h:2.6,d:.1,mat:MAT.doorWood,offset:V3(-1.95,0,0),locked:true,nav:true});
  makeDoor('switch',{x:9,z:-10,w:2,h:2.6,d:.1,mat:MAT.doorWood,offset:V3(1.95,0,0),npc:true});
  makeDoor('archive',{x:15,z:-10,w:2,h:2.6,d:.1,mat:MAT.doorWood,offset:V3(1.95,0,0),npc:true});
  // pisos
  floorPlane(8,12,0,0,MAT.marble,'stone',.02); floorPlane(14,12,-11,0,MAT.parquet,'wood',.02); floorPlane(6,12,7,0,MAT.floorWood,'wood',.02);
  floorPlane(8,12,14,0,MAT.tiles,'stone',.02); floorPlane(36,4,0,-8,MAT.parquet,'wood',.02); floorPlane(33,1.2,0,-8,MAT.carpet,'cloth',.026);
  floorPlane(36,10,0,-15,MAT.parquet,'wood',.02); floorPlane(4,5,0,1,MAT.rug,'cloth',.026);
  // hall
  chandelier('H1',0,0,8.5);
  addBlock(-3.3,-2.7,4.6,5.2,1.1,{mat:MAT.marbleW,surf:'stone',seg:1}); addMesh(new T.SphereGeometry(.2,8,6),MAT.marbleW,-3,1.32,4.9,'stone');
  addBlock(2.7,3.3,4.6,5.2,1.1,{mat:MAT.marbleW,surf:'stone',seg:1}); addMesh(new T.SphereGeometry(.2,8,6),MAT.marbleW,3,1.32,4.9,'stone');
  addBlock(2.9,3.7,-5.7,-5.2,2.3,{mat:MAT.darkWood,surf:'wood',seg:1});
  painting(-3.83,2.4,-3,Math.PI/2,1.4,1.1,5); painting(3.83,2.4,-3,-Math.PI/2,1.4,1.1,6);
  // salão
  chandelier('S1',-11,0,8.5);
  addBlock(-14.8,-13.2,-4.6,-2.6,1,{mat:MAT.piano,surf:'wood',cover:true,seg:1});
  const keyMesh=addMesh(new T.BoxGeometry(.05,.015,.11),MAT.brass,-14,1.01,-3.1,'metal');
  addBlock(-12.2,-9.8,3.7,4.6,.8,{mat:MAT.fabric,surf:'cloth',cover:true,seg:1}); addBlock(-12.2,-9.8,4.6,5,1.2,{mat:MAT.fabric,surf:'cloth',seg:1});
  addBlock(-17.2,-16.4,-1.2,1.2,.8,{mat:MAT.fabric,surf:'cloth',cover:true,seg:1});
  addBlock(-18,-17.5,-5.6,-1.6,3,{mat:MAT.books,surf:'wood',seg:1}); addBlock(-18,-17.5,1.6,5.6,3,{mat:MAT.books,surf:'wood',seg:1});
  addBlock(-16.5,-14.5,-5.85,-5.3,1.3,{mat:MAT.marbleW,surf:'stone',seg:1});
  painting(-11,2.5,-5.83,0,2,1.4,9); painting(-7,2.4,5.98,Math.PI,1.2,1.4,11);
  // sala da guarda
  addBlock(4.2,5.2,1,5,1.5,{mat:MAT.bed,surf:'cloth',cover:true,seg:1});
  addBlock(6.2,7.8,-2.6,-1.4,.78,{mat:MAT.desk,surf:'wood',cover:true,seg:1});
  chair(5.7,-2,Math.PI/2); chair(6.35,3.95,0,MAT.darkWood);
  for(let i=0;i<4;i++) addMesh(BOX(.05,1.1,.08),MAT.darkMetal,4.6+i*.35,1.4,-5.78,null);
  // cozinha
  bulb('K1',14,3.6,-1,7.5); W.lamps[W.lamps.length-1].light.color.setHex(0xfff0d0);
  addBlock(16.6,17.8,-5.6,-4,.95,{mat:MAT.stove,surf:'metal',seg:1});
  addBlock(12.8,15.2,0,1.4,.85,{mat:MAT.desk,surf:'wood',cover:true,seg:1});
  addBlock(10.3,10.8,-5.5,-2.2,2.2,{mat:MAT.darkWood,surf:'wood',seg:1});
  for(let i=0;i<5;i++) addMesh(new T.CylinderGeometry(.12,.1,.18,8),MAT.metal,12.9+i*.5,.95,.6,'metal');
  // corredor
  bulb('C1',0,3.7,-8,14); W.lamps[W.lamps.length-1].light.color.setHex(0xffd9a0);
  for(const [x,s] of [[-14,1],[-4,2],[4,3],[12,4]]) painting(x,2.3,-9.83,0,1.3,1,20+s);
  for(const [x,s] of [[-15,5],[-7,6],[11,7]]) painting(x,2.3,-6.17,Math.PI,1.3,1,30+s);
  // gabinete
  addBlock(-13.4,-10.6,-17.2,-15.9,.8,{mat:MAT.darkWood,surf:'wood',cover:true,seg:1});
  const dossierMesh=addMesh(new T.BoxGeometry(.36,.03,.27),MAT.dossier,-12,.815,-16.55,'cloth');
  deskLamp('O1',-11,.82,-16.95,5);
  chair(-12,-17.9,0,MAT.darkWood);
  addBlock(-17.6,-6.6,-20,-19.5,3,{mat:MAT.books,surf:'wood',seg:1});
  addBlock(-17.9,-17,-13,-12,1.1,{mat:MAT.metal,surf:'metal',seg:1});
  addBlock(-8.6,-7.6,-13.2,-12.2,.8,{mat:MAT.fabric,surf:'cloth',cover:true,seg:1});
  painting(-17.97,2.3,-15,Math.PI/2,1.6,1.2,41);
  // sala de operações
  chandelier('P1',0,-15,8.5);
  addBlock(-1.6,1.6,-15.6,-13.4,.85,{mat:MAT.darkWood,surf:'wood',cover:true,seg:1});
  { const t=new T.Mesh(new T.PlaneGeometry(3,2),MAT.mapTable); t.rotation.x=-Math.PI/2; t.position.set(0,.856,-14.5); scene.add(t); }
  const wallMap=new T.Mesh(new T.PlaneGeometry(6,2.6),MAT.wallMap); wallMap.position.set(0,2.3,-19.97); scene.add(wallMap);
  addBlock(-5.85,-5.3,-19.2,-16,1.9,{mat:MAT.cabinet,surf:'metal',seg:1});
  addBlock(3.6,5.6,-12.2,-11.2,.8,{mat:MAT.desk,surf:'wood',seg:1}); addMesh(BOX(.5,.3,.4),MAT.darkMetal,4.6,.95,-11.7,'metal');
  // mesa telefônica
  const switchMesh=addMesh(new T.BoxGeometry(3.2,2,.6),MAT.switchb,9,1,-19.7,'metal'); addSolidOnly(7.4,10.6,-20,-19.4,2);
  chair(9,-18.4,Math.PI,MAT.darkWood); deskLamp('W1',11.3,.82,-18.6,5); addBlock(10.8,11.8,-19.1,-18.1,.8,{mat:MAT.desk,surf:'wood',seg:1});
  // arquivo (escuro)
  for(const z of [-18.6,-15.6]) addBlock(13.5,17.4,z-.3,z+.3,1.9,{mat:MAT.cabinet,surf:'metal',cover:true,seg:1});
  addBlock(12.2,13.4,-11.9,-10.7,.8,{mat:MAT.desk,surf:'wood',seg:1});
  const listMesh=addMesh(new T.BoxGeometry(.3,.01,.38),MAT.listPaper,12.8,.81,-11.3,'cloth');
  // jardim
  const hedge=(x0,x1,z0,z1,h=1.3)=>addBlock(x0,x1,z0,z1,h,{mat:MAT.hedge,surf:'cloth',cover:true,top:MAT.hedge,seg:1.2});
  for(const r of [[-12,-3,10,11],[3,12,10,11],[-12,-3,29,30],[3,12,29,30],[-20,-15,14,15.2],[15,20,14,15.2],[-20,-15,25,26.2],[15,20,25,26.2]]) hedge(...r);
  for(const [x,z] of [[-4.6,7.9],[4.6,7.9],[-13,7.9],[13,7.9]]){ addMesh(new T.ConeGeometry(.55,1.9,10),MAT.hedge,x,1.15,z,'cloth'); addMesh(new T.CylinderGeometry(.35,.3,.4,10),MAT.lime,x,.2,z,'stone'); addSolidOnly(x-.4,x+.4,z-.4,z+.4,1.6,0,true); }
  addMesh(new T.CylinderGeometry(2.6,2.7,.6,18),MAT.lime,0,.3,20,'stone'); addMesh(new T.CylinderGeometry(2.35,2.35,.05,18),MAT.water,0,.58,20,'stone');
  addMesh(new T.CylinderGeometry(.3,.4,1.6,10),MAT.lime,0,.8,20,'stone'); addMesh(new T.CylinderGeometry(.9,.35,.3,12),MAT.lime,0,1.65,20,'stone'); addMesh(new T.SphereGeometry(.28,8,6),MAT.statue,0,2.05,20,'stone');
  addSolidOnly(-2.3,2.3,17.7,22.3,.6,0,true); addSolidOnly(-.45,.45,19.55,20.45,2.2);
  for(const x of [-8.5,8.5]){ addBlock(x-.4,x+.4,19.6,20.4,1.3,{mat:MAT.lime,surf:'stone',cover:true,seg:1}); addMesh(BOX(.35,.9,.25),MAT.statue,x,1.75,20,'stone'); addMesh(new T.SphereGeometry(.13,8,6),MAT.statue,x,2.32,20,'stone'); }
  for(const [x,z,h] of [[-23.4,32.4,4.5],[23.4,32.4,4.8],[-23,9.4,4.2],[-12,32.8,3.8],[12,32.8,4]]){ addMesh(new T.CylinderGeometry(.16,.22,2,7),MAT.desk,x,1,z,'wood'); addSolidOnly(x-.22,x+.22,z-.22,z+.22,2); const c=new T.Mesh(new T.SphereGeometry(1.5,10,8),MAT.tree); c.position.set(x,2+h*.45,z); c.scale.y=1.15; scene.add(c); }
  for(const x of [-10.5,10.5]){ addBlock(x-.9,x+.9,21.5,21.9,.48,{mat:MAT.darkWood,surf:'wood',seg:1}); }
  lampPost('J1',-4,9.2,1,0); lampPost('J2',23.2,23.4,-1,0); lampPost('J3',-23,18,1,0);
  // pátio de serviço e lateral oeste
  bulb('Y1',18.95,2.9,1.6,6.5); W.lamps[W.lamps.length-1].light.color.setHex(0xfff0c8);
  crate(24.6,-6,1.1,1); crate(24.6,-7.2,1,1); crate(24.4,-6.6,.9,.8,1); car(23.6,-14.5,true); barrel(24.8,-2); barrel(24.2,-1.3);
  addBlock(-25.6,-21.4,-12,-8.6,2.6,{mat:MAT.crate,surf:'wood',cover:true,top:MAT.roof,seg:1});
  crate(-20.4,-16,1.1,1); crate(-21.6,2.2,1,1);
  // holofote no telhado
  const spot=new T.SpotLight(0xdde6ff,3.2,48,.2,.45,1.2); spot.position.set(0,6.9,7.45); scene.add(spot); scene.add(spot.target);
  addMesh(BOX(.7,.5,.8),MAT.darkMetal,0,6.9,7.2,'metal');
  const lens=addMesh(new T.CylinderGeometry(.24,.24,.05,14),MAT.bulb,0,6.9,7.62,'glass'); lens.rotation.x=Math.PI/2;
  let beam=null; if(MAT_HQ){ const len=42, rad=Math.tan(.2)*len; const bg=new T.ConeGeometry(rad,len,20,1,true); bg.translate(0,-len/2,0); bg.rotateX(-Math.PI/2); beam=new T.Mesh(bg,MAT.beamCold); beam.position.copy(spot.position); scene.add(beam); }
  const SL={id:'SL',x:0,z:7.4,r:0,light:spot,lantern:lens,broken:false,base:3.2,ph:0,cone:beam};
  lens.userData.breakable=true; lens.userData.lamp=SL; W.lamps.push(SL);
  G.sl={light:spot,beam,lamp:SL,t:0,lit:false,litT:0,cd:0};
  // alvos fotográficos
  W.photo=[
    {id:'dossier',label:'Dossiê da Rede Lampião',pos:V3(-12,.832,-16.55),normal:V3(0,1,0),max:4.5,obj:'dossier',size:.18},
    {id:'map',label:'Mapa de batidas',pos:V3(0,2.3,-19.96),normal:V3(0,0,1),max:11,obj:'map',size:2},
    {id:'map',label:'Mapa de batidas (cópia da mesa)',pos:V3(0,.86,-14.5),normal:V3(0,1,0),max:5.5,obj:'map',size:1.1},
    {id:'list',label:'Lista de informantes',pos:V3(12.8,.818,-11.3),normal:V3(0,1,0),max:4.5,obj:'list',size:.18},
  ];
  // navegação
  const N=[];
  for(let x=-24;x<=24;x+=3) for(let z=-21;z<=33;z+=3){ if(x>-18.8&&x<18.8&&z>-20.8&&z<6.8) continue; if(!insideSolid(x,z,.45)) N.push({x,z}); }
  for(let x=-17;x<=17;x+=2) for(let z=-19;z<=5;z+=2) if(!insideSolid(x,z,.4)) N.push({x,z});
  for(const [x,z] of [[0,4.8],[0,7.7],[17,0],[19.7,0],[-10,-8.8],[-10,-11.2],[0,-8.8],[0,-11.2],[9,-8.8],[9,-11.2],[-5.2,0],[-2.8,0],[-24,-21],[-21,-21],[24,-21],[21,-21],[22.4,-.2]]) if(!insideSolid(x,z,.3)) N.push({x,z});
  W.nav.nodes=N; W.nav.link=5.4; buildNav();
  return {keyMesh,switchMesh,dossierMesh,listMesh,wallMap};
}
function objectives03(){ return [
  {id:'enter',text:'Entre no palacete pela porta de serviço da cozinha (lado leste)',state:'active',marker:{x:18.3,z:0}},
  {id:'dossier',text:'Fotografe o dossiê da Rede Lampião no gabinete (V: câmera)',state:'hidden',marker:{x:-12,z:-16.5}},
  {id:'map',text:'Fotografe o mapa de batidas na sala de operações',state:'hidden',marker:{x:0,z:-19.5}},
  {id:'leave',text:'Saia pelo portão de serviço do jardim, onde Lucien espera',state:'hidden',marker:{x:25.6,z:20}},
  {id:'noalarm',text:'Opcional: nenhuma ligação sai da mesa telefônica',state:'active',optional:true,autoDone:true},
  {id:'nokill',text:'Opcional: não mate ninguém (rendições silenciosas valem)',state:'active',optional:true,autoDone:true},
  {id:'list',text:'Opcional: fotografe a lista de informantes no arquivo',state:'hidden',optional:true,marker:{x:12.8,z:-11.3}},
]; }
function interact03(refs){
  const I=W.interactables;
  for(const [id,p] of [['terrace',V3(0,1.3,6.25)],['service',V3(18.25,1.2,0)],['guardroom',V3(7,1.2,-6)],['switch',V3(9,1.2,-10)],['archive',V3(15,1.2,-10)]]) I.push(doorInteract(id,p));
  I.push({id:'officedoor',pt:()=>V3(-10,1.2,-10),r:2.3,skipSolid:()=>W.doors.office.solid,
    label:()=>{ const d=W.doors.office; if(d.state==='LOCKED') return G.flags.officeKey?'Destrancar o gabinete':'Gabinete trancado — a chave fica com o ajudante, no salão'; return d.state==='CLOSED'?'Abrir porta':d.state==='OPEN'?'Fechar porta':null; },
    locked:()=>W.doors.office.state==='LOCKED'&&!G.flags.officeKey, hold:()=>W.doors.office.state==='LOCKED'&&G.flags.officeKey?.9:0,
    use:()=>{ const d=W.doors.office; if(d.state==='LOCKED'){ if(!G.flags.officeKey){ G.radioMsg('ÉLISE','Trancado. O ajudante de ordens deixa a chave no salão.','tip'); return; } d.state='CLOSED'; d.npc=true; openDoor(d,null); } else if(d.state==='CLOSED') openDoor(d,null); else if(d.state==='OPEN') closeDoor(d); }});
  I.push({id:'okey',pt:()=>V3(-14,1.05,-3.1),r:2.2,label:()=>G.flags.officeKey?null:'Pegar a chave do gabinete',use:()=>{ G.flags.officeKey=true; refs.keyMesh.visible=false; pickupMsg('Chave do gabinete'); AudioSys.play('pickup'); checkpoint(); }});
  I.push({id:'switchboard',pt:()=>V3(9,1.2,-19.3),r:2.3,label:()=>G.radioDead||G.alarm?null:'Desligar a mesa telefônica',hold:()=>1.4,
    use:()=>{ G.radioDead=true; refs.switchMesh.material=MAT.roof; AudioSys.play('sabotage',refs.switchMesh.position); G.radioMsg('ÉLISE','Cabos soltos. Nenhuma ligação sai daqui.'); checkpoint(); }});
  I.push({id:'gate',pt:()=>V3(25.7,1.3,20),r:2.5,skip:true,
    label:()=>obj('leave').state==='active'?'Sair pelo portão de serviço':'Portão de serviço — Lucien espera do outro lado', locked:()=>obj('leave').state!=='active',
    use:()=>{ if(obj('leave').state!=='active'){ G.radioMsg('LUCIEN','Ainda não. Sem as duas fotos, a noite foi à toa.','tip'); return; } missionComplete(); }});
}
function pickups03(){
  addPickup('h_sil1',-24.6,31.6,'silenced',6); addPickup('h_med1',12,-5.2,'med',35); addPickup('h_smg1',9.4,5.3,'smg',32);
  addPickup('h_sil2',17.2,-11.2,'silenced',6); addPickup('h_med2',-23.4,-7.6,'med',35); addPickup('h_ammo1',-16.8,4.4,'pistol',8);
}
function update03(dt){
  const P=G.player;
  if(!G.flags.i1&&G.introT>1){ G.flags.i1=true; G.radioMsg('LUCIEN','Estou com o carro no beco, atrás do portão leste. Entre pela cozinha. O holofote do telhado varre o jardim.'); }
  if(!G.flags.i2&&G.introT>9){ G.flags.i2=true; G.radioMsg('DICA','Por trás de um guarda, segure E para rendê-lo em silêncio. A Welrod (3) quase não faz barulho. V usa a câmera; M abre a planta.','tip'); }
  if(obj('enter').state==='active'&&P.pos.x>-18&&P.pos.x<18&&P.pos.z>-20&&P.pos.z<6){ complete('enter'); activate('dossier'); activate('map'); activate('list'); G.radioMsg('ÉLISE','Dentro. O gabinete fica no canto noroeste; a chave deve estar com o ajudante.'); checkpoint(); }
  if(obj('nokill').state==='active'&&G.stats.kills>0) failObjective('nokill');
  if(obj('dossier').state==='done'&&obj('map').state==='done'&&obj('leave').state!=='done'&&obj('leave').state!=='active'){ activate('leave'); G.radioMsg('LUCIEN','Tenho o motor ligado. Portão leste do jardim.'); checkpoint(); }
  updateSearchlight(dt);
}
function restore03(){
  const r=G.refs;
  if(G.flags.officeKey&&r.keyMesh) r.keyMesh.visible=false;
  if(G.radioDead&&r.switchMesh) r.switchMesh.material=MAT.roof;
  for(const t of W.photo) if(G.flags['photo_'+t.id]) t.taken=true;
  for(const id of ['dossier','map','list']){ const o=obj(id); if(G.flags['photo_'+id]&&o&&o.state!=='done') o.state='done'; }
}
function drawMap03(g,w,h){
  const s=w/60, sx=x=>(x+30)*s, sz=z=>(z+24)*s*h/w/ (64/60) *1 + 0;
  const Z=z=>(z+25)*h/62, X=x=>(x+30)*w/60, R=mulberry32(8);
  g.fillStyle='#e2d5b3'; g.fillRect(0,0,w,h);
  for(let i=0;i<12;i++){ g.fillStyle=`rgba(120,90,40,${.03+R()*.05})`; g.beginPath(); g.ellipse(R()*w,R()*h,20+R()*60,14+R()*40,R()*3,0,Math.PI*2); g.fill(); }
  const rect=(x0,x1,z0,z1,fill,stroke,lw=1.5)=>{ if(fill){ g.fillStyle=fill; g.fillRect(X(x0),Z(z0),X(x1)-X(x0),Z(z1)-Z(z0)); } if(stroke){ g.strokeStyle=stroke; g.lineWidth=lw; g.strokeRect(X(x0),Z(z0),X(x1)-X(x0),Z(z1)-Z(z0)); } };
  rect(-26.3,26.3,-22.3,34.3,null,'#2a241b',4); g.fillStyle='#e2d5b3'; g.fillRect(X(25.6),Z(18),10,Z(22)-Z(18));
  g.fillStyle='rgba(70,60,45,.25)'; g.fillRect(X(-1.5),Z(7),X(1.5)-X(-1.5),Z(33.5)-Z(7)); g.fillRect(X(-24),Z(19),X(24)-X(-24),Z(21)-Z(19)); g.fillRect(X(20),Z(-4),X(23)-X(20),Z(20)-Z(-4));
  for(const r of [[-12,-3,10,11],[3,12,10,11],[-12,-3,29,30],[3,12,29,30],[-20,-15,14,15.2],[15,20,14,15.2],[-20,-15,25,26.2],[15,20,25,26.2]]) rect(...r,'#7d8a5c',null);
  g.strokeStyle='#3a3226'; g.lineWidth=1.5; g.beginPath(); g.arc(X(0),Z(20),2.6*w/60,0,Math.PI*2); g.stroke();
  rect(-18.5,18.5,-20.5,6.5,'#cbbd98','#2a241b',3);
  g.strokeStyle='#3a3226'; g.lineWidth=1.6;
  const line=(x0,z0,x1,z1)=>{ g.beginPath(); g.moveTo(X(x0),Z(z0)); g.lineTo(X(x1),Z(z1)); g.stroke(); };
  for(const [a,b] of [[-18,-12],[-10,-4],[4,6],[8,14],[16,18]]) line(a,-6,b,-6);
  for(const [a,b] of [[-18,-11],[-9,-1],[1,8],[10,14],[16,18]]) line(a,-10,b,-10);
  for(const x of [-6,6,12]) line(x,-20,x,-10);
  line(-4,-6,-4,-1); line(-4,1,-4,6); line(4,-6,4,6); line(10,-6,10,2); line(10,4,10,6);
  g.fillStyle='#2a241b'; g.font=`${Math.round(w/44)}px "Special Elite","Courier New",monospace`; g.textAlign='center';
  const lab=(t,x,z)=>g.fillText(t,X(x),Z(z));
  lab('SALÃO',-11,1); lab('HALL',0,1); lab('GUARDA',7,1); lab('COZINHA',14,1); lab('CORREDOR',0,-7.6);
  lab('GABINETE',-12,-14.5); lab('OPERAÇÕES',0,-17.5); lab('TELEFONES',9,-14.5); lab('ARQUIVO',15,-14.5);
  lab('JARDIM',0,27); lab('PORTÃO',22.6,17.2);
  g.fillStyle='#4a5a7a'; g.font=`italic ${Math.round(w/34)}px "Barlow Condensed",sans-serif`; g.textAlign='left';
  g.fillText('← porta de serviço',X(18.8),Z(-1.6)); g.fillText('holofote',X(1),Z(8.6)); g.fillText('dossiê?',X(-15),Z(-12));
  g.strokeStyle='#9a2a1b'; g.lineWidth=3; const cx=X(-12), cz=Z(-16.5), q=w/50; g.beginPath(); g.moveTo(cx-q,cz-q); g.lineTo(cx+q,cz+q); g.moveTo(cx+q,cz-q); g.lineTo(cx-q,cz+q); g.stroke();
  g.textAlign='center'; g.strokeStyle='#2a241b'; g.lineWidth=2; const nx=w-34, ny=40; g.beginPath(); g.moveTo(nx,ny-22); g.lineTo(nx-8,ny+4); g.lineTo(nx,ny-2); g.lineTo(nx+8,ny+4); g.closePath(); g.stroke(); g.fillStyle='#2a241b'; g.font=`bold ${Math.round(w/30)}px serif`; g.fillText('N',nx,ny+22);
  g.font=`${Math.round(w/30)}px "Special Elite",monospace`; g.fillText('HÔTEL DELORME — TÉRREO',w/2,h-16);
  void sx; void sz;
}
DOCS.delorme={title:'Planta do térreo — Hôtel Delorme',sub:'Cópia do arquiteto, entregue pela rede',map:'03',body:'',pencil:'A lápis: o gabinete fica no canto noroeste e vive trancado. A mesa telefônica liga direto para o quartel.'};
LEVELS['03']={id:'03',num:3,op:'Operação 3',name:'Sem Deixar Rastro',place:'Hôtel Delorme, margem esquerda',prev:'02',
  loadout:{weapons:['pistol','silenced'],ammo:{pistol:{mag:8,reserve:16},silenced:{mag:6,reserve:18}},cur:'silenced',camera:true},
  build:buildLevel03,enemies:ENEMY_DEFS_03,ally:null,start:{x:-24,z:32,yaw:-Math.PI/4},
  reinf:[{id:'r1',x:23.4,z:24.5,yaw:-Math.PI/2,weapon:'smg',helmet:true},{id:'r2',x:23.4,z:16,yaw:-Math.PI/2,weapon:'rifle',helmet:true}],
  radio:{x:9,z:-18.5,fx:9,fz:-19.6},radioRun:'O telefonista corre para a mesa!',alarmPos:V3(9,2,-18),alarmText:'A mesa telefônica chamou o quartel. Reforços entram pelo portão!',alarmObjective:'noalarm',
  alarmYes:'A mesa telefônica chamou o quartel: a Sûreté saberá que alguém esteve lá. ',alarmNo:'Nenhuma ligação saiu do palacete. ',
  objectives:objectives03,interact:interact03,pickups:pickups03,update:update03,restore:restore03,drawMap:drawMap03,startDocs:['delorme'],
  resultTitle:'Dossiê fotografado',outro:['LUCIEN','Entre, rápido. Ninguém viu nada?'],menuCam:{cx:0,cz:27,y:6,tx:0,tz:2},ambient:'night',
  mist:{n:22,x0:-24,x1:24,z0:8,z1:33,color:0x8a9ab0},
  briefing:{meta:'PARIS — 18 DE MARÇO DE 1943 — 01h30',paras:['O livro de cifras decifrou uma mensagem de Londres: a Sûreté da ocupação montou um dossiê sobre a Rede Lampião no Hôtel Delorme, um palacete requisitado na margem esquerda. Se soubermos o que eles sabem, a rede sobrevive. Se souberem que sabemos, não.','Fotografe o dossiê e o mapa de batidas sem levar nada. A Welrod silenciada e a câmera vieram de Londres. O holofote do telhado varre o jardim; a porta de serviço da cozinha é o caminho mais discreto. Quem for rendido em silêncio acorda tarde demais para lembrar de você.'],list:['Entrar pela porta de serviço da cozinha','Fotografar o dossiê no gabinete e o mapa da sala de operações','Sair pelo portão leste, sem alarme e sem mortes']}};
LEVEL_ORDER.push('03');
LEVELS['01'].rain=true; LEVELS['01'].ambient='rain';
LEVELS['02'].ambient='wind'; LEVELS['02'].mist={n:40,x0:-30,x1:30,z0:-30,z1:30,color:0x7d8da0};