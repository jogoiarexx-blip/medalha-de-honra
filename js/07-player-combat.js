'use strict';


/* =========================================================
   JOGADOR, ARMAS E VIEWMODEL
   ========================================================= */
function stanceCycle(){ const P=G&&G.player; if(!P||P.dead||G.camMode) return; if(P.proneOn){ P.proneOn=false; P.crouchOn=false; } else if(P.crouchOn){ P.proneOn=true; } else P.crouchOn=true; AudioSys.play('step',null,.35); }
function proneToggle(){ const P=G&&G.player; if(!P||P.dead||G.camMode) return; P.proneOn=!P.proneOn; if(!P.proneOn) P.crouchOn=false; else P.crouchOn=true; AudioSys.play('step',null,.4); }
function pStance(a,b,c){ const P=G.player; return lerp(lerp(a,b,P.crouch),c,P.prone||0); }
function playerTargetInfo(){ const P=G.player; return {light:P.light,crouch:P.crouch>.5,prone:(P.prone||0)>.5,moving:Math.hypot(P.vx,P.vz)>.4,sprint:P.sprinting,head:P.pos.y+pStance(1.6,1.05,.4),chest:P.pos.y+pStance(1.2,.75,.3)}; }
function newPlayer(){
  return {pos:V3(0,0,41),vx:0,vz:0,vy:0,yaw:0,pitch:0,onGround:true,crouch:0,crouchOn:false,prone:0,proneOn:false,hp:100,dead:false,deadT:0,light:.2,moving:false,sprinting:false,stepAcc:0,bob:0,suppress:0,shake:0,
    weapons:['pistol'],cur:'pistol',ammo:{pistol:{mag:8,reserve:24},smg:{mag:0,reserve:0},silenced:{mag:0,reserve:0}},
    wpn:{state:'READY',t:0,cd:0,bloom:0,recover:0,ev:{},switchTo:null,semiLatch:false,wallBlock:false},adsT:0,key:false,lantern:false};
}
const VM={root:new T.Group(),models:{},kick:0,kickRot:0,swayX:0,swayY:0,flashT:0};
function buildViewmodels(){
  vmScene.add(VM.root);
  const amb=new T.AmbientLight(0xffffff,.5); VM.amb=amb; vmScene.add(amb);
  const dl=new T.DirectionalLight(0xffe0b0,.7); dl.position.set(.5,1,.3); VM.dl=dl; vmScene.add(dl);
  const L=(c)=>new T.MeshPhongMaterial({color:c,shininess:c===0x2a2d30?60:14,specular:c===0x2a2d30?0x4a4a4a:0x151515});
  const gun=L(0x2a2d30), grip=L(0x3d2b1f), sleeve=L(0x2a2832), skin=L(0xc49b78);
  const B=(g,w,h,d,x,y,z,m,rx=0)=>{ const o=new T.Mesh(new T.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.rotation.x=rx; g.add(o); return o; };
  // P38
  { const g=new T.Group(); B(g,.034,.04,.2,0,0,-.1,gun); B(g,.03,.1,.045,0,-.065,.0,grip,-.22); B(g,.02,.02,.03,0,0,-.21,gun); B(g,.006,.012,.008,0,.026,-.19,gun); B(g,.006,.012,.008,-.009,.026,-.012,gun); B(g,.006,.012,.008,.009,.026,-.012,gun);
    B(g,.05,.07,.08,.004,-.085,.02,skin,-.2); B(g,.062,.062,.32,.03,-.13,.21,sleeve,-.25); B(g,.045,.06,.07,-.03,-.09,.0,skin,-.2); B(g,.06,.06,.3,-.065,-.14,.19,sleeve,-.3);
    B(g,.006,.006,.05,0,-.028,-.04,gun); B(g,.006,.03,.006,0,-.04,-.064,gun); B(g,.012,.016,.014,0,.026,.008,gun); B(g,.036,.012,.12,0,.012,-.1,gun);
    const mag=B(g,.024,.08,.034,0,-.1,.005,gun); mag.visible=false;
    const muzzle=new T.Object3D(); muzzle.position.set(0,0,-.24); g.add(muzzle);
    VM.models.pistol={g,mag,muzzle,hip:V3(.15,-.16,-.5),ads:V3(0,-.031,-.56),magHome:mag.position.clone()}; }
  // Sten
  { const g=new T.Group(); const tube=new T.Mesh(new T.CylinderGeometry(.022,.022,.36,8),gun); tube.rotation.x=Math.PI/2; tube.position.set(0,0,-.12); g.add(tube);
    const sh=new T.Mesh(new T.CylinderGeometry(.018,.018,.16,8),gun); sh.rotation.x=Math.PI/2; sh.position.set(0,0,-.37); g.add(sh);
    const mag=B(g,.2,.036,.034,-.13,-.004,-.15,gun);
    B(g,.012,.07,.24,0,-.035,.13,gun); B(g,.045,.09,.012,0,-.07,.25,gun); B(g,.006,.018,.006,0,.03,-.42,gun); B(g,.02,.02,.004,0,.031,-.04,gun);
    B(g,.05,.065,.08,.02,-.055,.0,skin,-.15); B(g,.062,.062,.32,.045,-.11,.19,sleeve,-.2); B(g,.05,.055,.075,-.1,-.035,-.15,skin); B(g,.06,.06,.3,-.12,-.1,-.01,sleeve,-.45);
    const muzzle=new T.Object3D(); muzzle.position.set(0,0,-.46); g.add(muzzle);
    VM.models.smg={g,mag,muzzle,hip:V3(.16,-.18,-.52),ads:V3(0,-.0405,-.56),magHome:mag.position.clone()}; }
  { const g=new T.Group(); const body=new T.Mesh(new T.CylinderGeometry(.021,.021,.34,12),gun); body.rotation.x=Math.PI/2; body.position.set(0,0,-.13); g.add(body);
    for(let i=0;i<3;i++){ const r=new T.Mesh(new T.CylinderGeometry(.023,.023,.01,12),gun); r.rotation.x=Math.PI/2; r.position.set(0,0,-.05-i*.09); g.add(r); }
    B(g,.03,.11,.04,0,-.075,.035,grip,-.15); B(g,.016,.016,.028,0,0,.05,gun); B(g,.005,.011,.006,0,.026,-.27,gun); B(g,.014,.008,.004,0,.024,.0,gun);
    B(g,.006,.006,.045,0,-.03,-.02,gun);
    B(g,.05,.07,.08,.004,-.085,.035,skin,-.2); B(g,.062,.062,.32,.03,-.13,.22,sleeve,-.25); B(g,.045,.06,.07,-.03,-.09,.01,skin,-.2); B(g,.06,.06,.3,-.065,-.14,.2,sleeve,-.3);
    const mag=B(g,.026,.09,.034,0,-.11,.035,gun); mag.visible=false; const muzzle=new T.Object3D(); muzzle.position.set(0,0,-.31); g.add(muzzle);
    VM.models.silenced={g,mag,muzzle,hip:V3(.15,-.16,-.5),ads:V3(0,-.031,-.56),magHome:mag.position.clone()}; }
  buildVM04(B,{gun,grip,sleeve,skin}); buildVM08(B,{gun,grip,sleeve,skin}); buildVM12(B,{gun,grip,sleeve,skin}); if(typeof buildVMmg==='function') buildVMmg(B,{gun,grip,sleeve,skin});
  upgradeVMHands(skin,sleeve);
  for(const k in VM.models){ VM.models[k].g.visible=false; VM.root.add(VM.models[k].g); }
  { const g=new T.Group(); const gl=new T.Mesh(new T.BoxGeometry(.06,.075,.06),new T.MeshBasicMaterial({color:0xffd590})); g.add(gl);
    B(g,.078,.014,.078,0,.045,0,gun); B(g,.078,.014,.078,0,-.045,0,gun); for(const [x,z] of [[-.034,-.034],[.034,-.034],[-.034,.034],[.034,.034]]) B(g,.008,.09,.008,x,0,z,gun);
    B(g,.006,.05,.006,0,.075,0,gun); B(g,.035,.03,.06,0,.11,.01,skin); B(g,.045,.045,.24,.0,.04,.14,sleeve,.75);
    g.position.set(-.24,-.25,-.5); g.visible=false; VM.lamp=g; VM.root.add(g); }
  const fm=new T.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  fm.map=FLASHTEX; VM.flash=new T.Group(); for(let i=0;i<2;i++){ const p=new T.Mesh(new T.PlaneGeometry(.24,.24),fm); p.rotation.z=i*Math.PI/4; VM.flash.add(p); } VM.flash.visible=false; VM.root.add(VM.flash);
}
function upgradeVMHands(skin,sleeve){
  const skinD=new T.MeshPhongMaterial({color:0x9a7050,shininess:8,specular:0x111111}), nail=new T.MeshPhongMaterial({color:0xe0bca0,shininess:40,specular:0x333333}), cuffM=new T.MeshPhongMaterial({color:0x1c1b22,shininess:6}), strap=new T.MeshPhongMaterial({color:0x3a2a1a,shininess:10}), watch=new T.MeshPhongMaterial({color:0xd8d0b8,shininess:90,specular:0x999999}), crease=new T.MeshBasicMaterial({color:0x6a4a34});
  const BX=(w,h,d,m)=>new T.Mesh(new T.BoxGeometry(w,h,d),m); const up=new T.Vector3(0,1,0);
  for(const k in VM.models){ const g=VM.models[k].g; const hands=[], sleeves=[]; g.traverse(o=>{ if(o.isMesh&&o.geometry.type==='BoxGeometry'){ if(o.material===skin) hands.push(o); else if(o.material===sleeve) sleeves.push(o); } });
    for(const o of sleeves) o.parent.remove(o);
    const xs=hands.map(o=>o.position.x); const maxX=Math.max(...xs);
    hands.forEach(o=>{ const p=o.geometry.parameters, W=Math.max(.045,p.width), H=Math.max(.06,p.height), D=Math.max(.065,p.depth); const right=hands.length<2||o.position.x>=maxX-1e-4; const sd=right?1:-1; const par=o.parent;
      const hg=new T.Group(); hg.position.copy(o.position); hg.rotation.copy(o.rotation); par.add(hg); par.remove(o);
      if(!right&&hands.length>1&&!VM.models[k].lh){ const lh0=new T.Group(); par.add(lh0); VM.models[k].lh=lh0; VM.models[k].lhParts=[]; }
      // palma e dorso
      const palm=BX(W*.9,H*.86,D*.62,skin); palm.position.set(0,0,D*.14); hg.add(palm);
      const knu=BX(W*.96,H*.9,D*.14,skin); knu.position.set(0,0,-D*.2); hg.add(knu);
      // dedos fechados na empunhadura, com vincos
      const fin=BX(W*1.02,H*.84,D*.36,skin); fin.position.set(-sd*W*.04,-H*.02,-D*.42); hg.add(fin);
      for(let i=1;i<4;i++){ const c=BX(W*1.04,.0025,D*.37,crease); c.position.set(-sd*W*.04,H*.4-i*H*.21,-D*.42); hg.add(c); }
      for(let i=0;i<4;i++){ const n=BX(.004,H*.13,D*.12,nail); n.position.set(-sd*W*.52,H*.3-i*H*.2,-D*.52); hg.add(n); }
      // polegar por cima
      const t1=BX(W*.42,H*.24,D*.5,skin); t1.position.set(sd*W*.42,H*.38,-D*.12); t1.rotation.y=-sd*.25; hg.add(t1);
      const t2=BX(W*.36,H*.2,D*.32,skin); t2.position.set(sd*W*.32,H*.44,-D*.5); hg.add(t2); const tn=BX(W*.22,.004,D*.14,nail); tn.position.set(sd*W*.32,H*.545,-D*.58); hg.add(tn);
      // antebraço até a borda da tela: manga com punho
      hg.updateMatrix(); const wrist=new T.Vector3(0,-H*.15,D*.45).applyMatrix4(hg.matrix);
      const anchor=wrist.clone().add(new T.Vector3(right?.15:-.2,-.23,.34)); const dir=anchor.clone().sub(wrist); const L=.62; dir.normalize();
      const q=new T.Quaternion().setFromUnitVectors(up,dir);
      const arm=new T.Mesh(new T.CylinderGeometry(W*.62,W*.8,L,10),sleeve); arm.quaternion.copy(q); arm.position.copy(wrist).addScaledVector(dir,L/2+.025); par.add(arm); const LHq=(!right&&VM.models[k].lh)?VM.models[k].lh:null; if(LHq) LHq.attach(arm);
      const cuff=new T.Mesh(new T.CylinderGeometry(W*.66,W*.66,.03,10),cuffM); cuff.quaternion.copy(q); cuff.position.copy(wrist).addScaledVector(dir,.04); par.add(cuff); if(LHq) LHq.attach(cuff);
      const wr=new T.Mesh(new T.CylinderGeometry(W*.48,W*.52,.05,10),skin); wr.quaternion.copy(q); wr.position.copy(wrist).addScaledVector(dir,.005); par.add(wr); if(LHq) LHq.attach(wr);
      if(!right&&hands.length>1){ VM.models[k].lh.attach(hg); }
      const LH=(!right&&VM.models[k].lh)?VM.models[k].lh:null; const addP=(mm)=>{ if(LH) LH.attach(mm); return mm; };
      if(!right){ const st=new T.Mesh(new T.CylinderGeometry(W*.53,W*.53,.018,10),strap); st.quaternion.copy(q); st.position.copy(wrist).addScaledVector(dir,.012); par.add(st); if(LHq) LHq.attach(st); const wf=BX(.026,.006,.026,watch); wf.position.copy(wrist).addScaledVector(dir,.012).add(new T.Vector3(0,W*.5,0)); par.add(wf); if(LHq) LHq.attach(wf); }
      for(const s2 of [-1,1]){ const f=BX(.006,.006,L*.6,cuffM); f.quaternion.copy(q); f.rotateX(Math.PI/2); f.position.copy(wrist).addScaledVector(dir,L*.45).add(new T.Vector3(s2*W*.55,W*.3,0)); par.add(f); if(LHq) LHq.attach(f); } });
  }
}
function showVM(id){ for(const k in VM.models) VM.models[k].g.visible=(k===id); }

function currentSpread(){
  const P=G.player, w=WEAPONS[P.cur]; const moving=Math.hypot(P.vx,P.vz);
  let s=lerp(w.spreadHip,w.spreadADS,P.adsT);
  s*=1+clamp(moving/3,0,1)*.9*(1-P.adsT*.5); if(!P.onGround) s*=2; if(P.prone>.5) s*=.55; else if(P.crouch>.5) s*=.78;
  return s+P.wpn.bloom;
}
function playerFire(){
  const P=G.player, w=WEAPONS[P.cur], a=P.ammo[P.cur];
  G.lastFireT=simTime; if(CHEATS.ammo) a.mag++;
  if(w.bolt){ a.mag--; fireBolt12(); return; }
  if(w.rocket){ a.mag--; fireRocket(); return; }
  a.mag--; G.shotId++; G.stats.shots++;
  const rng=mulberry32(G.shotId*7919+G.seed);
  const dir=V3(0,0,-1).applyQuaternion(camera.quaternion); jitterDir(dir,currentSpread()*DEG,rng);
  resolveShot({shooter:'player',origin:camera.getWorldPosition(V3()),dir,weapon:w,shotId:G.shotId});
  P.wpn.bloom=Math.min(4,P.wpn.bloom+w.bloom);
  const kick=w.recoil*DEG*(P.adsT>.5?.7:1)*(P.prone>.5?.65:P.crouch>.5?.8:1);
  P.pitch+=kick; P.yaw+=(rng()-.45)*w.recoilX*DEG; P.wpn.recover+=kick*.62;
  VM.kick=Math.min(.06,VM.kick+.025); VM.kickRot=Math.min(.18,VM.kickRot+.07); VM.flashT=.05; ejectCasing(w); VM.inspectT=0;
  G.flashLightT=.05;
  AudioSys.play(w.silent?'silenced':(w.id==='smg'||w.id==='mg')?'smg':'pistol',null);
  emitNoise(P.pos,w.noise,w.silent?'muffled':'gunshot',null);
  if(w.silent){ VM.flashT=0; G.flashLightT=0; }
  { const m=VM.models[P.cur]; if(m){ VM.root.updateMatrixWorld(true); const mp=m.muzzle.getWorldPosition(V3()); FX.puff(mp,w.silent?1:2,0x9a9a9a,.14,.9,V3(0,.25,0),.32);
      if(P.cur!=='silenced'){ const right=V3(1,0,0).applyQuaternion(camera.quaternion), up=V3(0,1,0).applyQuaternion(camera.quaternion), fw=V3(0,0,-1).applyQuaternion(camera.quaternion); FX.casing(mp.clone().addScaledVector(fw,-.22).addScaledVector(right,.04),right.multiplyScalar(rnd(1.4,2.2)).addScaledVector(up,rnd(1.2,1.9)).addScaledVector(fw,rnd(-.4,0))); } } }
  G.playerShotT=6; G.hud.ammoT=4;
  if(settings.shake) P.shake=Math.min(.6,P.shake+.12);
}
function startReload(){ const P=G.player, s=P.wpn; s.state='RELOAD'; s.t=0; s.ev={}; G.hud.ammoT=4; }
function switchWeapon(id){ const P=G.player; if(!P.weapons.includes(id)||id===P.cur||P.wpn.state==='SWITCH') return; P.wpn.state='SWITCH'; P.wpn.t=0; P.wpn.switchTo=id; P.wpn.swapped=false; G.hud.ammoT=4; }
function updatePlayerWeapon(dt){
  const P=G.player, w=WEAPONS[P.cur], a=P.ammo[P.cur], s=P.wpn;
  s.cd-=dt; s.bloom=Math.max(0,s.bloom-dt*4.5);
  if(s.recover>0){ const r=Math.min(s.recover,dt*.22); P.pitch-=r; s.recover-=r; }
  const adsWanted=input.ads && s.state!=='RELOAD' && s.state!=='SWITCH' && !P.sprinting;
  P.adsT=clamp(P.adsT+(adsWanted?1:-1)*dt/w.adsTime,0,1);
  // arma encostada na parede: baixa a arma e bloqueia o disparo
  const eye=camera.position, f=V3(0,0,-1).applyQuaternion(camera.quaternion);
  const hit=segFirst(eye.x,eye.y,eye.z,eye.x+f.x*.6,eye.y+f.y*.6,eye.z+f.z*.6); s.wallBlock=!!hit;
  if(P.holster&&!G.camMode){ P.adsT=0; if(input.selectPressed||input.swapPressed||(input.firePressed&&!disguiseOn())) drawWeapon(input.selectPressed); else if(input.firePressed&&simTime-(G.holsterHintT||-99)>4){ G.holsterHintT=simTime; showHint('Arma guardada — aperte H (ou ARMA) para sacar. Sob disfarce, sacar chama atenção.'); } return; }
  if(G.camMode){ P.adsT=Math.max(0,P.adsT-dt*8); if((input.fire||input.firePressed)&&!s.camLatch){ s.camLatch=true; takePhoto(); } if(!input.fire) s.camLatch=false; return; }
  const fire=input.fire||input.firePressed;
  switch(s.state){
    case 'READY':
      if(fire && s.cd<=0 && !(!w.auto && s.semiLatch)){
        s.semiLatch=true;
        if(a.mag>0 && !s.wallBlock && !P.sprinting){ playerFire(); s.cd=60/w.rpm; }
        else if(a.mag<=0){ AudioSys.play('dry'); s.cd=.3; if(a.reserve>0) startReload(); else G.hud.ammoT=4; }
      }
      if(!fire) s.semiLatch=false;
      if(input.reloadPressed && a.mag<w.mag && a.reserve>0) startReload();
      if(input.swapPressed&&P.weapons.length>1){ const i=P.weapons.indexOf(P.cur); switchWeapon(P.weapons[(i+1)%P.weapons.length]); }
      if(input.selectPressed) switchWeapon(input.selectPressed);
      break;
    case 'RELOAD':
      s.t+=dt;
      if(!s.ev.out && s.t>=w.reload.out){ s.ev.out=true; AudioSys.play('magout'); }
      if(!s.ev.in && s.t>=w.reload.in){ s.ev.in=true; const take=Math.min(w.mag-a.mag,a.reserve); a.mag+=take; a.reserve-=take; AudioSys.play('magin'); }
      if(!s.ev.ch && s.t>=w.reload.end-.2){ s.ev.ch=true; AudioSys.play('chamber'); }
      if(s.t>=w.reload.end) s.state='READY';
      if(P.sprinting && !s.ev.in){ s.state='READY'; }
      if(input.swapPressed && !s.ev.in && P.weapons.length>1){ s.state='READY'; const i=P.weapons.indexOf(P.cur); switchWeapon(P.weapons[(i+1)%P.weapons.length]); }
      break;
    case 'SWITCH':
      s.t+=dt; if(s.t>=.28 && !s.swapped){ P.cur=s.switchTo; s.swapped=true; showVM(P.cur); }
      if(s.t>=.56) s.state='READY';
      break;
  }
}
function updatePlayer(dt){
  const P=G.player;
  if(P.dead){ P.deadT+=dt; return; }
  let mx=input.mx, mz=input.mz;
  const sprint=input.sprint && mz>.3 && P.adsT<.3;
  if(sprint){ P.crouchOn=false; if(P.proneOn){ P.proneOn=false; AudioSys.play('step',null,.5); } }
  if(G.camMode) P.proneOn=false;
  const crouchWanted=(settings.crouchToggle?P.crouchOn:input.crouchHeld)||P.proneOn;
  P.crouch=lerp(P.crouch,crouchWanted?1:0,1-Math.exp(-dt*10)); P.prone=lerp(P.prone||0,P.proneOn?1:0,1-Math.exp(-dt*5.5)); if(Math.abs(P.prone-(P.proneOn?1:0))<.002) P.prone=P.proneOn?1:0;
  const speed=(P.prone>.5?.85:P.crouch>.5?CFG.player.crouch:sprint?CFG.player.sprint:CFG.player.walk)*(P.adsT>.5?.7:1)*(G.camMode?.55:1);
  const fx=-Math.sin(P.yaw), fz=-Math.cos(P.yaw), rx=Math.cos(P.yaw), rz=-Math.sin(P.yaw);
  let wx=fx*mz+rx*mx, wz=fz*mz+rz*mx; const l=Math.hypot(wx,wz); if(l>1){ wx/=l; wz/=l; }
  const acc=1-Math.exp(-dt*(P.onGround?12:2));
  P.vx=lerp(P.vx,wx*speed,acc); P.vz=lerp(P.vz,wz*speed,acc);
  P.pos.x+=P.vx*dt; P.pos.z+=P.vz*dt;
  if(input.jumpPressed && P.proneOn){ P.proneOn=false; if(settings.crouchToggle) P.crouchOn=true; }
  if(input.jumpPressed && P.onGround && P.crouch<.3){ P.vy=CFG.player.jump; P.onGround=false; }
  resolveCircle(P.pos,CFG.player.radius,P.pos.y,P.pos.y+1.7);
  const gh=heightAt(P.pos.x,P.pos.z);
  P.vy-=9.8*dt; P.pos.y+=P.vy*dt;
  if(P.onGround&&P.vy<=0&&P.pos.y>gh&&P.pos.y-gh<.45) P.pos.y=gh;
  if(P.pos.y<=gh){ if(P.vy<-3.5) AudioSys.play('land'); if(P.vy<-8.6){ hurtPlayer((-P.vy-8.6)*15,P.pos.clone().add(V3(0,0,.01))); showHint('Queda feia. Use as escadas.'); } P.pos.y=gh; P.vy=0; P.onGround=true; } else if(P.pos.y>gh+.05) P.onGround=false;
  P.ys=(P.ys==null||!P.onGround||Math.abs(P.ys-P.pos.y)>1.2)?P.pos.y:lerp(P.ys,P.pos.y,1-Math.exp(-dt*16));
  for(const a of G.actors){ if(a.dead) continue; const dx=P.pos.x-a.pos.x, dz=P.pos.z-a.pos.z, d=Math.hypot(dx,dz); if(d>0&&d<.64){ const k=(.64-d)/d; P.pos.x+=dx*k; P.pos.z+=dz*k; } }
  const hs=Math.hypot(P.vx,P.vz); P.moving=hs>.4; P.sprinting=sprint&&hs>3.2;
  P.stepAcc+=hs*dt; if(P.stepAcc>(P.sprinting?1.9:1.4) && P.onGround){ P.stepAcc=0; AudioSys.surf=footSurf(P.pos); AudioSys.play('step',null,P.prone>.5?.22:P.crouch>.5?.4:P.sprinting?1.2:.8); emitNoise(P.pos,(P.prone>.5?.8:P.crouch>.5?1.6:P.sprinting?9:4.2)*(SURF_NOISE[AudioSys.surf]||1),'step',null); if(W.shards.length&&nearShards(P.pos)){ AudioSys.play('glass',null,.18); emitNoise(P.pos,P.crouch>.5?3.5:7,'step',null); } }
  P.bob+=hs*dt*2.2;
  P.light=Math.max(lightAt(P.pos.x,P.pos.z),P.lantern?.85:0,G.sl&&G.sl.lit?1:0); G.pebbleCD=Math.max(0,G.pebbleCD-dt);
  P.suppress=Math.max(0,P.suppress-dt*.5); P.shake=Math.max(0,P.shake-dt*3);
  updatePlayerWeapon(dt);
}
function toggleLantern(){ if(!G||G.player.dead) return; G.player.lantern=!G.player.lantern; AudioSys.play('lamp'); }
function throwPebble(){
  if(!G||G.player.dead||G.pebbleCD>0) return; G.pebbleCD=1.1;
  const dir=V3(0,0,-1).applyQuaternion(camera.quaternion);
  const m=new T.Mesh(new T.SphereGeometry(.045,5,4),hm(0x77736b)); m.position.copy(camera.position).addScaledVector(dir,.5); scene.add(m);
  const p=addProp(m,{vel:dir.clone().multiplyScalar(13).add(V3(0,2.4,0)),ang:V3(rnd(-8,8),rnd(-8,8),rnd(-8,8)),radius:.045,kind:'pebble',snd:'pebble'});
  p.onLand=(pos)=>{ AudioSys.play('pebble',pos,1.4); emitNoise(pos,10,'lure',null); };
  AudioSys.play('throw');
}
function openMap(){
  if(!G) return; const id=Object.keys(DOCS).find(k=>DOCS[k].map===G.levelId&&G.docs.includes(k));
  if(id) openDoc(id); else showHint('Você ainda não tem uma planta deste lugar.');
}
function hurtPlayer(dmg,from){
  const P=G.player; if(P.dead||G.ending) return;
  if(CHEATS.god){ G.hud.healthT=2; return; }
  if(G.level&&G.level.dmgMul) dmg*=G.level.dmgMul();
  P.hp-=dmg; G.stats.dmgTaken+=dmg; G.hud.healthT=4; G.combatT=Math.max(G.combatT,6);
  const b=Math.atan2(from.x-P.pos.x,-(from.z-P.pos.z)); G.dmgMarks.push({b,t:1.6}); showDamageArc(b);
  AudioSys.play('hurt'); if(settings.shake) P.shake=Math.min(1,P.shake+.45);
  if(P.hp<=0){ P.hp=0; P.dead=true; P.deadT=0; MUS.stinger('lose'); const g=G; setTimeout(()=>{ if(G===g) missionFail('Élise caiu',G.level.deathText||'A patrulha encontrou você antes do amanhecer.'); },1300); }
}

/* =========================================================
   BALÍSTICA E RESOLUÇÃO DE DANO
   ========================================================= */
const raycaster=new T.Raycaster(); raycaster.far=200;
let matricesFresh=false; function ensureMatrices(){ if(!matricesFresh){ scene.updateMatrixWorld(true); matricesFresh=true; } }
function computeDamage(base,dist,falloff,mult){ const [s,e,mn]=falloff; let f=1; if(dist>s) f=dist>=e?mn:lerp(1,mn,(dist-s)/(e-s)); return base*f*mult; }
function resolveShot(o){
  ensureMatrices();
  raycaster.set(o.origin,o.dir); raycaster.far=o.far||200;
  const hits=raycaster.intersectObjects(W.shootables,false);
  const damaged=new Set(), equipHit=new Set(); let end=o.origin.clone().addScaledVector(o.dir,120), hitChar=null;
  const isPlayer=o.shooter==='player';
  for(const h of hits){
    const ob=h.object, ud=ob.userData; if(!ob.visible) continue;
    if(ud.char){
      const ch=ud.char; if(ch===o.shooter) continue; if(damaged.has(ch)) continue;
      if(ch.dead||ch.downed){ end=h.point; FX.burst(h.point,3,0x4a4434,1,.3); break; }
      const base=computeDamage(o.weapon.dmg,h.distance,o.weapon.falloff,1);
      if(ud.region==='equipment'){
        if(ud.equip==='helmet'){ damaged.add(ch); end=h.point; hitChar=ch;
          if(ch.isEnemy && !settings.helmetSave){
            const n=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize():V3(0,1,0);
            AudioSys.play('helmet',h.point); FX.burst(h.point,6,0xffe2a0,3.2,.2,2,1,n); detachHelmet(ch,n,o.dir,base);
            ch.takeDamage({dmg:ch.hp+1,region:'head',dir:o.dir,point:h.point,shooter:o.shooter});
            if(isPlayer){ G.stats.hits++; G.stats.heads++; hitMarker('kill head'); headTag(); logShot(o,ch,'cabeça (pelo capacete)',base,ch.maxHp,'neutralizado · capacete soltou'); }
          } else { helmetHit(ch,h,o.dir,base,o.shooter); if(isPlayer) hitMarker('equip'); }
          break; }
        if(equipHit.has(ch)) continue; equipHit.add(ch);
        if(ud.equip==='lantern'){ breakLantern(ch); if(isPlayer){ hitMarker('equip'); logShot(o,ch,'lanterna',0,0,'quebrada'); } if(ch.isEnemy&&ch.state!=='COMBAT'){ ch.awareness+=.7; ch.enterCombat(G.player.pos.x,G.player.pos.z); } continue; }
        if(ud.equip==='cap'){ knockCap(ch,o.dir); if(isPlayer){ hitMarker('equip'); logShot(o,ch,'quepe/boina',0,0,'derrubado'); } continue; }
        if(ud.equip==='weapon'){ AudioSys.play('metal',h.point,.7); FX.burst(h.point,4,0xffd98a,3,.2,3); if(ch.isEnemy){ ch.aimPenalty=Math.min(1.5,ch.aimPenalty+.5); if(!ch.armored&&Math.random()<(base>=25?.55:.35)){ ch.disarm(o.dir); if(isPlayer) limbTag('Arma arrancada da mão'); } } continue; }
        continue;
      }
      damaged.add(ch); hitChar=ch; end=h.point;
      const mult=REGIONS[ud.region]?REGIONS[ud.region].m:1;
      let dmg=base*mult; if(isPlayer&&ch.isAlly) dmg*=.5;
      const armorHit=!!ud.armor; if(armorHit){ dmg=base*.16; AudioSys.play('clank',h.point,1); FX.burst(h.point,7,0xffe2a0,3.4,.18,2,1); if(isPlayer){ hitMarker('equip'); limbTag('ARMADURA'); } if(ch.isEnemy&&!ch.dead){ ch.staggerT=Math.max(ch.staggerT,.3); } }
      if(isPlayer&&CHEATS.oneshot&&ch.isEnemy) dmg=999;
      const headshot=!armorHit&&ch.isEnemy&&(ud.region==='head'||ud.region==='neck'); if(headshot) dmg=Math.max(dmg,ch.hp+1);
      let furtive=false; if(isPlayer&&o.weapon.silent&&ch.isEnemy&&!headshot&&!armorHit&&ch.state!=='COMBAT'&&ch.state!=='RADIO'&&h.distance<30&&(ud.region==='chest'||ud.region==='abdomen'||ud.region==='pelvis')&&dmg<ch.hp){ dmg=ch.hp+1; furtive=true; }
      const killed=ch.takeDamage({dmg,region:ud.region,dir:o.dir,point:h.point,shooter:o.shooter});
      AudioSys.play('body',h.point,.8);
      if(isPlayer && ch.isEnemy){ G.stats.hits++; if(ud.region==='head'||ud.region==='neck') G.stats.heads++; hitMarker(killed?(headshot?'kill head':'kill'):'body'); if(headshot) headTag(); logShot(o,ch,REGIONS[ud.region].n,base,dmg,killed?'neutralizado':''); }
      if(furtive&&killed) limbTag('TIRO FURTIVO');
      break;
    }
    if(ud.glass){ if(!ud.glass.broken) breakGlass(ud.glass,h.point,isPlayer); continue; }
    if(ud.glassDoor){ const d=Object.values(W.doors).find(x=>x.mesh===ob); if(d&&d.state!=='OPEN'){ setDoorOpenInstant(d); ob.visible=false; FX.burst(h.point,24,0xd8eef4,3,.9); AudioSys.play('glass',h.point,1.2); emitNoise(h.point,16,'glass',null); if(d.nav) buildNav(); G.flags.balcBroken=true; } continue; }
    if(ud.breakable){ const L=ud.lamp; if(L&&!L.broken) breakLamp(L,true); continue; }
    if(ud.zoneHit) ud.zoneHit(h,o);
    const n=h.face?h.face.normal.clone().transformDirection(ob.matrixWorld):V3(0,1,0);
    if(ud.tank&&isPlayer) tankSmallArms(h.point);
    worldImpact(h.point,n,ud.mat||'stone'); end=h.point;
    if(isPlayer) logShot(o,null,'cenário ('+(ud.mat||'pedra')+')',0,0,'');
    break;
  }
  // supressão por projéteis próximos (sem contar o atingido)
  if(isPlayer||o.shooter&&o.shooter.isAlly){
    const src=isPlayer?G.player.pos:o.shooter.pos;
    for(const e of G.enemies){ if(e.dead||e===hitChar) continue; const hp=V3(e.pos.x,e.eyeY(),e.pos.z); if(distPointSeg(hp,o.origin,end)<1.2){ e.suppression=Math.min(1.5,e.suppression+.45); if(e.state!=='COMBAT'&&e.state!=='RADIO'&&e.state!=='DISARMED'&&e.state!=='RECOVER'){ if(o.weapon&&o.weapon.silent){ e.awareness=Math.min(.9,e.awareness+.3); if(e.awareness>.5) e.toInvestigate(end.x,end.z); } else { e.awareness+=.6; e.enterCombat(src.x,src.z); } } } }
  }
  return end;
}
function helmetHit(ch,h,dir,base,shooter){
  const n=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize():V3(0,1,0);
  const directness=clamp(Math.abs(n.dot(dir)),.35,1);
  const absorbed=base*directness; ch.helmetDur-=absorbed;
  AudioSys.play('helmet',h.point); FX.burst(h.point,6,0xffe2a0,3.2,.2,2,1,n);
  let ev='absorveu '+absorbed.toFixed(1)+' (durab. '+Math.max(0,ch.helmetDur).toFixed(1)+')';
  if(ch.helmetDur<=0||absorbed>=CFG.helmet.detachThreshold){ detachHelmet(ch,n,dir,absorbed); ev+=' · SOLTOU'; }
  const transfer=base*CFG.helmet.transferRatio*directness;
  ch.takeDamage({dmg:transfer,region:'head',dir,point:h.point,shooter});
  if(ch.react){ ch.react.hx+=-.5; ch.react.hz+=(Math.random()-.5)*.6; }
  if(ch.isEnemy&&!ch.dead){ ch.staggerT=Math.max(ch.staggerT,1.1); ch.reactionT=Math.max(ch.reactionT,1); ch.burstLeft=0; ch.aimPenalty=Math.min(1.5,ch.aimPenalty+.8); }
  if(shooter==='player'){ G.stats.hits++; logShot({weapon:{dmg:base}},ch,'capacete',base,transfer,ev); }
}
function detachHelmet(ch,n,dir,impulse){
  if(ch.helmetState!=='ATTACHED') return;
  ch.helmetState='DETACHED';
  ensureMatrices();
  const g=ch.h.helmet; removeShootables(ch.h.helmetMeshes); scene.attach(g); if(ch.h.scalp) ch.h.scalp.visible=true;
  const out=V3().copy(n).multiplyScalar(.65).addScaledVector(UP,.4).addScaledVector(dir,.15).normalize();
  const sp=clamp(CFG.helmet.minSpeed+impulse*.08,CFG.helmet.minSpeed,CFG.helmet.maxSpeed);
  let axis=V3().crossVectors(out,UP); if(axis.lengthSq()<1e-4) axis.set(1,0,0); axis.normalize().multiplyScalar(rnd(4,10));
  addProp(g,{vel:out.multiplyScalar(sp),ang:axis,radius:.11,kind:'helmet',snd:'helmetDrop',owner:ch});
  G.stats.helmets++;
}
function breakLantern(ch,silent){
  if(!ch.h.lanternLight||ch.lanternBroken) return; ch.lanternBroken=true; ch.h.lanternLight.intensity=0; ch.h.lanternGlass.visible=false;
  if(!silent){ ensureMatrices(); const p=ch.h.lanternGlass.getWorldPosition(V3()); FX.burst(p,10,0xffe9b0,2,.5); AudioSys.play('glass',p); }
}
function knockCap(ch,dir){
  if(!ch.h.cap||!ch.hasCap) return; ch.hasCap=false; ensureMatrices();
  const c=ch.h.cap; removeShootables(ch.h.capMeshes); scene.attach(c);
  addProp(c,{vel:V3(dir.x*1.6,1.4,dir.z*1.6),ang:V3(rnd(-6,6),rnd(-3,3),rnd(-6,6)),radius:.07,kind:'cap',snd:'cloth'});
  AudioSys.play('cloth',c.position);
  if(ch.isEnemy && ch.state!=='COMBAT'){ ch.awareness+=.7; ch.enterCombat(G.player.pos.x,G.player.pos.z); }
}
function breakLamp(L,loud){
  L.broken=true; L.lantern.visible=false; L.light.intensity=0; if(L.cone) L.cone.visible=false;
  if(loud){ FX.burst(L.lantern.position,12,0xffe9b0,2.2,.6); AudioSys.play('glass',L.lantern.position); emitNoise(V3(L.x,0,L.z),9,'glass',null); }
}
function emitNoise(pos,radius,kind,src){
  for(const e of G.enemies){
    if(e.dead||e===src) continue; const d=Math.hypot(e.pos.x-pos.x,e.pos.z-pos.z);
    let r=radius; if(d<r && segFirst(e.pos.x,e.pos.y+1.5,e.pos.z,pos.x,(pos.y||0)+1.4,pos.z)) r*=.55; if(d>=r) continue;
    if(e.asleep){ if(kind==='gunshot'||kind==='glass'||kind==='enemyshot'||d<2.2) e.wake(); else continue; }
    if(e.state==='COMBAT'||e.state==='RADIO'){ if(kind==='gunshot'&&!e.canSeeTarget) e.lastKnown={x:pos.x,z:pos.z}; continue; }
    if(e.state==='DISARMED'||e.state==='RECOVER') continue;
    if(kind==='step'){ if(disguiseOn()) continue; e.awareness+=.18; if(e.awareness>.35) e.toInvestigate(pos.x,pos.z); }
    else if(kind==='muffled'){ e.awareness=Math.min(.95,e.awareness+.45); e.toInvestigate(pos.x,pos.z); }
    else if(kind==='lure'){ e.awareness=Math.min(.9,e.awareness+.3); e.toInvestigate(pos.x,pos.z); }
    else if(kind==='enemyshot'){ e.alertLevel=1; e.awareness=Math.max(e.awareness,.7); e.toInvestigate(src?src.pos.x:pos.x,src?src.pos.z:pos.z); }
    else { e.alertLevel=1; e.awareness+=kind==='gunshot'?.75:.4; if(e.awareness>=1) e.enterCombat(pos.x,pos.z); else e.toInvestigate(pos.x,pos.z); }
  }
}