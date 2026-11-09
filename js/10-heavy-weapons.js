'use strict';


/* =========================================================
   GRANADAS, PANZERFAUST E EXPLOSÕES
   ========================================================= */
WEAPONS.pzf={id:'pzf',name:'Panzerfaust',cat:'Antitanque',mode:'TIRO ÚNICO',auto:false,rocket:true,rpm:30,dmg:0,mag:1,reserveMax:3,reload:{out:.5,in:2.1,end:2.7},spreadHip:1.4,spreadADS:.35,bloom:0,recoil:3,recoilX:.4,adsTime:.32,noise:45,falloff:[1,2,1],fovADS:60,ammoName:'tubos Panzerfaust'};
const NADE={player:{fuse:3.0,r:6,dmgE:150,dmgP:90},enemy:{fuse:3.4,r:6,dmgE:120,dmgP:80},molotov:{fuse:6,r:3,dmgE:40,dmgP:20}};
function buildVM04(B,M){
  const g=new T.Group();
  const olive=new T.MeshPhongMaterial({color:0x50553e,shininess:18,specular:0x1a1a1a}), tubeM=new T.MeshPhongMaterial({color:0x3e4234,shininess:10});
  const tube=new T.Mesh(new T.CylinderGeometry(.03,.03,.9,10),tubeM); tube.rotation.x=Math.PI/2; tube.position.set(0,0,.05); g.add(tube);
  const mag=new T.Group(); g.add(mag);
  const head=new T.Mesh(new T.SphereGeometry(.07,12,10),olive); head.scale.set(1,1,1.7); head.position.set(0,0,-.5); mag.add(head);
  const cone=new T.Mesh(new T.CylinderGeometry(.068,.03,.12,10),olive); cone.rotation.x=Math.PI/2; cone.position.set(0,0,-.37); mag.add(cone);
  B(g,.045,.05,.006,0,.055,-.22,M.gun); B(g,.006,.022,.006,0,.088,-.22,M.gun); B(g,.02,.03,.08,0,-.04,-.2,M.gun);
  B(g,.05,.07,.08,0,-.06,-.12,M.skin); B(g,.062,.062,.3,.03,-.11,.05,M.sleeve,-.25); B(g,.05,.06,.07,-.05,-.04,-.32,M.skin); B(g,.06,.06,.3,-.09,-.1,-.2,M.sleeve,-.5);
  const muzzle=new T.Object3D(); muzzle.position.set(0,0,-.6); g.add(muzzle);
  VM.models.pzf={g,mag,muzzle,hip:V3(.16,-.12,-.42),ads:V3(0,-.088,-.44),magHome:mag.position.clone()};
}
function nadeMesh(kind){
  const g=new T.Group();
  if(kind==='player'){ const b=new T.Mesh(new T.SphereGeometry(.05,8,6),hm(0x4a4f38)); b.scale.y=1.25; g.add(b); const lv=new T.Mesh(BOX(.015,.07,.02),hm(0x2a2a2a)); lv.position.set(.045,.02,0); g.add(lv); }
  else if(kind==='molotov'){ const b=new T.Mesh(new T.CylinderGeometry(.045,.05,.2,8),new T.MeshLambertMaterial({color:0x4a6a3a,transparent:true,opacity:.85})); g.add(b); const r=new T.Mesh(BOX(.03,.08,.03),new T.MeshBasicMaterial({color:0xffa040})); r.position.y=.13; g.add(r); }
  else { const hd=new T.Mesh(new T.CylinderGeometry(.04,.04,.09,8),hm(0x3d443a)); g.add(hd); const hn=new T.Mesh(new T.CylinderGeometry(.016,.016,.3,6),hm(0x6a5034)); hn.position.y=-.19; g.add(hn); }
  scene.add(g); return g;
}
function spawnNade(pos,vel,kind,owner){
  const m=nadeMesh(kind); m.position.copy(pos);
  const n={mesh:m,vel:vel.clone(),ang:V3(rnd(-9,9),rnd(-6,6),rnd(-9,9)),kind,owner,fuse:NADE[kind].fuse,age:0,exploded:false,bounces:0,radius:kind==='player'?.06:.07,resting:false,scanT:0};
  W.nades.push(n); return n;
}
function throwGrenade(){
  if(!G||APP.state!=='PLAYING'||G.player.dead||G.ending) return; const P=G.player;
  if(!(P.nades>0)){ if(G.level.grenades) showHint('Sem granadas. Procure caixas com o símbolo da rede.'); return; }
  if(G.camMode||P.wpn.state==='SWITCH'||(G.nadeThrowCD||0)>0) return;
  G.nadeThrowCD=1; if(!CHEATS.ammo) P.nades--; VM.throwT=.5; G.hud.ammoT=4;
  const f=V3(0,0,-1).applyQuaternion(camera.quaternion), up=V3(0,1,0).applyQuaternion(camera.quaternion);
  const cp=camera.position; const pos=cp.clone().addScaledVector(f,.45).addScaledVector(up,-.12);
  if(segFirst(cp.x,cp.y,cp.z,pos.x,pos.y,pos.z)) pos.copy(cp).addScaledVector(f,.08);
  const vel=f.clone().multiplyScalar(13).add(V3(0,3,0)).add(V3(P.vx,0,P.vz).multiplyScalar(.6));
  const nk=G.level.nadeKind||'player'; spawnNade(pos,vel,nk,'player'); AudioSys.play(nk==='molotov'?'cloth':'pin'); AudioSys.play('throw');
}
function stepBody(p,dt){
  const m=p.mesh, steps=3, h=dt/steps; p.touch=false;
  for(let s=0;s<steps;s++){
    p.vel.y-=9.8*h; m.position.addScaledVector(p.vel,h);
    const w=p.ang.length(); if(w>1e-4){ _v.copy(p.ang).divideScalar(w); _q.setFromAxisAngle(_v,w*h); m.quaternion.premultiply(_q); }
    if(m.position.y<p.radius){ m.position.y=p.radius; p.touch=true; if(p.vel.y<-1&&p.bounces<5){ p.bounces++; AudioSys.play('nadeBounce',m.position,clamp(-p.vel.y/5,.2,1)); } p.vel.y*=-.3; p.vel.x*=.6; p.vel.z*=.6; p.ang.multiplyScalar(.6); }
    for(const sd of W.solids){
      if(!sd.active) continue; const x=m.position.x, y=m.position.y, z=m.position.z, r=p.radius;
      if(x>sd.minX-r&&x<sd.maxX+r&&z>sd.minZ-r&&z<sd.maxZ+r&&y>sd.minY-r&&y<sd.maxY+r){
        p.touch=true;
        const pen=[[x-(sd.minX-r),0,-1],[(sd.maxX+r)-x,0,1],[z-(sd.minZ-r),2,-1],[(sd.maxZ+r)-z,2,1],[(sd.maxY+r)-y,1,1],[y-(sd.minY-r),1,-1]].sort((a,b)=>a[0]-b[0])[0];
        const sp=p.vel.length(); if(sp>2&&p.bounces<6){ p.bounces++; AudioSys.play('nadeBounce',m.position,clamp(sp/7,.2,1)); }
        if(pen[1]===0){ m.position.x+=pen[2]*pen[0]; p.vel.x*=-.35; p.vel.z*=.8; }
        else if(pen[1]===2){ m.position.z+=pen[2]*pen[0]; p.vel.z*=-.35; p.vel.x*=.8; }
        else { m.position.y+=pen[2]*pen[0]; p.vel.y*=-.3; p.vel.x*=.65; p.vel.z*=.65; }
      }
    }
  }
  if(p.touch&&p.vel.length()<.25&&p.age>.4){ p.resting=true; p.vel.set(0,0,0); }
}
function updateNades(dt){
  if(!W.nades||!G) return;
  if(G.nadeThrowCD>0) G.nadeThrowCD-=dt; if(G.nadeCD>0) G.nadeCD-=dt;
  if(G.boomLight){ G.boomT=Math.max(0,(G.boomT||0)-dt); G.boomLight.intensity=G.boomT*G.boomT*14; }
  for(const n of W.nades){
    if(n.exploded) continue; n.age+=dt; n.fuse-=dt;
    if(!n.resting) stepBody(n,dt);
    if(n.kind==='molotov'&&n.age>.08&&(n.touch||n.bounces>0)) n.fuse=0;
    if(n.fuse<=0){ n.exploded=true; if(n.mesh.parent) n.mesh.parent.remove(n.mesh); const N=NADE[n.kind]; const mp=n.mesh.position.clone(); explode(mp,{r:N.r,dmgE:N.dmgE,dmgP:N.dmgP,src:n.owner==='player'?'player':'enemy',kind:n.kind==='molotov'?'molotov':'nade'}); if(n.kind==='molotov'&&typeof molotovFire==='function'){ AudioSys.play('glass',mp,1.2); molotovFire(mp); } continue; }
    nadeAwareness(n,dt);
  }
  W.nades=W.nades.filter(n=>!n.exploded);
}
function nadeAwareness(n,dt){
  n.scanT-=dt; if(n.scanT>0) return; n.scanT=.1;
  if(n.age<.3+D().react*.4) return;
  const np=n.mesh.position;
  for(const e of G.enemies){
    if(e.dead||e.asleep||e.fleeFrom===n) continue;
    const dx=np.x-e.pos.x, dz=np.z-e.pos.z, d=Math.hypot(dx,dz); if(d>8.5) continue;
    if(d>2.5 && Math.abs(angDiff(e.yaw+e.headYaw,Math.atan2(dx,dz)))>1.9) continue;
    if(segFirst(e.pos.x,e.eyeY(),e.pos.z,np.x,np.y+.08,np.z)) continue;
    e.fleeNade(n);
  }
}
Enemy.prototype.fleeNade=function(n){
  const np=n.mesh.position; let best=null, bs=1e9, far=null, fd=-1;
  for(const nd of W.nav.nodes){
    const dm=Math.hypot(nd.x-this.pos.x,nd.z-this.pos.z); if(dm>13) continue;
    const dn=Math.hypot(nd.x-np.x,nd.z-np.z); if(dn>fd){ fd=dn; far=nd; }
    const shield=dn>3.5&&!!segFirst(np.x,np.y+.3,np.z,nd.x,1,nd.z);
    if(dn<7.5&&!shield) continue;
    const away=((nd.x-this.pos.x)*(this.pos.x-np.x)+(nd.z-this.pos.z)*(this.pos.z-np.z))>=-.5;
    const sc=dm+(away?0:4)-(shield?1.5:0); if(sc<bs){ bs=sc; best=nd; }
  }
  const tgt=best||far; if(!tgt) return;
  this.releaseCover(); this.fleeT=Math.max(.8,n.fuse+.6); this.fleeFrom=n; this.setPath(tgt.x,tgt.z); this.cower=false; this.wake();
  if(Math.random()<.7) AudioSys.play('shout',this.pos);
  if(this.state!=='COMBAT'&&this.state!=='RADIO'&&this.state!=='DISARMED'){ this.awareness=Math.max(this.awareness,.9); this.alertLevel=1; this.lastKnown={x:np.x,z:np.z}; }
};
Enemy.prototype.fleeStep=function(dt){
  this.fleeT-=dt; this.aimTarget=.2; this.headYaw*=.9;
  if(this.followPath(3.9*this.speedMul(),dt)){ this.crouchTarget=1; this.moveDir(0,0,0,dt); } else this.crouchTarget=0;
  if(this.fleeT<=0){ this.fleeFrom=null; this.crouchTarget=0;
    if(this.state==='COMBAT'){ this.coverT=0; this.path=null; }
    else if(this.state!=='DISARMED'&&this.state!=='RECOVER'&&this.state!=='DEAD'&&this.state!=='RADIO') this.toSearch(); }
};
function arcClear(o,vel,Tt){
  const p=o.clone(), v=vel.clone(), h=.05; let t=0;
  while(t<Tt+.2){ const q=p.clone().addScaledVector(v,h); v.y-=9.8*h; const hit=segFirst(p.x,p.y,p.z,q.x,q.y,q.z); if(hit) return t/Tt>.86; p.copy(q); t+=h; if(p.y<.1) break; }
  return true;
}
Enemy.prototype.nadeThink=function(){
  if(!this.nades||(G.nadeCD||0)>0||this.fleeT>0||!this.hasWeapon||this.staggerT>0||this.reloadT>0) return;
  if(this.canSeeTarget||this.lostT<1.2||this.lostT>10) return;
  const t=this.lastKnown; if(!t) return;
  const dx=t.x-this.pos.x, dz=t.z-this.pos.z, d=Math.hypot(dx,dz); if(d<7||d>23) return;
  for(const e of G.enemies) if(e!==this&&!e.dead&&Math.hypot(e.pos.x-t.x,e.pos.z-t.z)<5.5) return;
  if(Math.random()>.35) return;
  const o=V3(this.pos.x+dx/d*.35,this.pos.y+1.75,this.pos.z+dz/d*.35), ty=heightAt(t.x,t.z)+.2;
  let vel=null;
  for(const Tt of [.8+d*.045,.45+d*.035]){ const vy=(ty-o.y+.5*9.8*Tt*Tt)/Tt; const v=V3(dx/Tt,vy,dz/Tt); if(arcClear(o,v,Tt)){ vel=v; break; } }
  if(!vel) return;
  this.nades--; G.nadeCD=(G.diff==='recruta'?15:G.diff==='veterano'?7.5:10)*rnd(.9,1.25);
  this.yaw=Math.atan2(dx,dz); this.react.aR-=1.8; this.reactionT=Math.max(this.reactionT,.8); this.shotCD=Math.max(this.shotCD,1);
  AudioSys.play('shout',this.pos); spawnNade(o,vel,'enemy',this);
};
function scorchMark(pos,r){
  if(!G.scorch){ G.scorch=[]; G.scorchI=0; const geo=new T.CircleGeometry(1,14); geo.rotateX(-Math.PI/2); const mat=new T.MeshBasicMaterial({color:0x0b0907,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}); for(let i=0;i<12;i++){ const m=new T.Mesh(geo,mat); m.visible=false; scene.add(m); G.scorch.push(m); } }
  const m=G.scorch[G.scorchI=(G.scorchI+1)%G.scorch.length]; m.visible=true; m.position.set(pos.x,.02+G.scorchI*.0006,pos.z); m.scale.setScalar(r*rnd(.85,1.1)); m.rotation.y=rnd(0,6);
}
function explode(pos,o){
  if(G.level&&G.level.onExplode) G.level.onExplode(pos,o);
  const P=G.player, R=o.r;
  const occ=(x,y,z)=>!!segFirst(pos.x,pos.y+.3,pos.z,x,y,z,s=>!(G.tank&&s===G.tank.solid&&o.kind==='wreck'));
  const fall=d=>Math.pow(clamp(1-d/R,0,1),1.25);
  for(const e of G.enemies){
    if(e.dead) continue; const d=Math.hypot(e.pos.x-pos.x,(e.pos.y+1)-pos.y,e.pos.z-pos.z); if(d>R) continue;
    let f=fall(d); if(occ(e.pos.x,e.pos.y+1.1,e.pos.z)&&occ(e.pos.x,e.pos.y+.4,e.pos.z)) f*=.12; if(f<.01) continue;
    const dir=V3(e.pos.x-pos.x,.3,e.pos.z-pos.z).normalize();
    if(e.helmetState==='ATTACHED'&&f>.45) detachHelmet(e,V3(dir.x,1,dir.z).normalize(),dir,30);
    const killed=e.takeDamage({dmg:o.dmgE*f,region:'chest',dir,point:V3(e.pos.x,1.1,e.pos.z),shooter:o.src==='player'?'player':'blast'});
    if(!e.dead){ e.staggerT=Math.max(e.staggerT,.3+.9*f); e.suppression=1.5; }
    if(o.src==='player'&&killed) hitMarker('kill');
  }
  if(!P.dead){
    const d=Math.hypot(P.pos.x-pos.x,P.pos.y+1-pos.y,P.pos.z-pos.z);
    if(d<R){ let f=fall(d); const ey=P.pos.y+pStance(1.5,1,.35); if(occ(P.pos.x,ey,P.pos.z)&&occ(P.pos.x,P.pos.y+.5,P.pos.z)) f*=.1; const dmg=o.dmgP*f*(o.src==='player'?1:D().dmg); if(dmg>1){ G.deathCause='explosion'; hurtPlayer(dmg,pos); } }
    const sd=Math.hypot(P.pos.x-pos.x,P.pos.z-pos.z);
    if(settings.shake) P.shake=Math.min(1.4,P.shake+clamp(1-sd/28,0,1)*1.1);
    P.suppress=Math.min(1,P.suppress+clamp(1-sd/14,0,1));
  }
  if(G.tank&&o.kind==='nade') tankBlast(pos);
  for(const L of W.lamps){ if(!L.broken&&Math.hypot(L.x-pos.x,L.z-pos.z)<R*.6) breakLamp(L,false); }
  for(const p of W.props){ if(p.removed) continue; const v=V3().subVectors(p.mesh.position,pos); const d=v.length(); if(d>R) continue; const f=1-d/R; p.resting=false; p.settle=null; p.vel.addScaledVector(v.normalize(),5*f).add(V3(0,3*f,0)); p.ang.set(rnd(-9,9),rnd(-9,9),rnd(-9,9)); }
  for(const n of W.nades){ if(n.exploded) continue; const v=V3().subVectors(n.mesh.position,pos); const d=v.length(); if(d<R*.8){ n.resting=false; n.vel.addScaledVector(v.normalize(),3*(1-d/R)).add(V3(0,1.5,0)); } }
  const big=o.kind==='shell'||o.kind==='wreck';
  FX.burst(pos,big?46:34,0xffb050,big?8:6.5,.45,6,1);
  FX.burst(pos,big?30:22,0x3a3428,big?6:4.5,1.1,9.8,1);
  FX.puff(V3(pos.x,pos.y+.5,pos.z),big?9:7,0x5a524a,big?2:1.5,2.8,V3(0,1.1,0),.55);
  FX.puff(pos,3,0xffa040,big?1.3:.9,.28,V3(0,.6,0),.85);
  if(pos.y<.6) scorchMark(pos,big?2.2:1.5);
  if(!G.boomLight){ G.boomLight=new T.PointLight(0xffb060,0,24,2); scene.add(G.boomLight); }
  G.boomLight.position.set(pos.x,pos.y+1,pos.z); G.boomT=big?.75:.6;
  AudioSys.play('explosion',pos,big?1.3:1);
  emitNoise(pos,55,'gunshot',null); G.combatT=Math.max(G.combatT,8);
}
function fireRocket(){
  const P=G.player; const f=V3(0,0,-1).applyQuaternion(camera.quaternion); const rng=mulberry32((++G.shotId)*31+G.seed); jitterDir(f,currentSpread()*DEG,rng);
  const right=V3(1,0,0).applyQuaternion(camera.quaternion), cp=camera.position;
  const pos=cp.clone().addScaledVector(f,.7).addScaledVector(right,.1).add(V3(0,-.06,0));
  const m=new T.Group(); const body=new T.Mesh(new T.CylinderGeometry(.03,.03,.5,8),hm(0x3a3d2e)); body.rotation.x=Math.PI/2; m.add(body);
  const head=new T.Mesh(new T.SphereGeometry(.075,10,8),hm(0x50553e)); head.scale.z=1.6; head.position.z=.3; m.add(head);
  m.position.copy(pos); m.lookAt(pos.clone().add(f)); scene.add(m);
  W.rockets.push({mesh:m,pos:pos.clone(),vel:f.clone().multiplyScalar(46),age:0,trailT:0,done:false});
  G.rocketsFired=(G.rocketsFired||0)+1;
  AudioSys.play('rocket',null); emitNoise(P.pos,45,'gunshot',null);
  const back=cp.clone().addScaledVector(f,-1.3); FX.puff(back,6,0x9a948a,1,1.6,f.clone().multiplyScalar(-3),.5); FX.puff(pos,3,0xd8c8a8,.5,.6,V3(),.5);
  P.pitch+=3*DEG; P.wpn.recover+=1.5*DEG; VM.kick=.08; VM.kickRot=.12; VM.flashT=.06; G.flashLightT=.08; if(settings.shake) P.shake=Math.min(1,P.shake+.35);
  G.playerShotT=6; G.hud.ammoT=4;
  const bb=segFirst(cp.x,cp.y,cp.z,back.x,back.y,back.z); if(bb&&bb.t<.55){ hurtPlayer(8,back); showHint('Contra-chama! Deixe espaço livre atrás do Panzerfaust.'); }
}
function updateRockets(dt){
  if(!W.rockets||!W.rockets.length) return;
  for(const r of W.rockets){
    if(r.done) continue; r.age+=dt; r.vel.y-=1.6*dt;
    const a=r.pos.clone(), b=a.clone().addScaledVector(r.vel,dt), dir=V3().subVectors(b,a), len=dir.length(); dir.divideScalar(len);
    let hitT=Infinity, hit=null;
    const sh=segFirst(a.x,a.y,a.z,b.x,b.y,b.z); if(sh){ hitT=sh.t*len; hit={type:G.tank&&sh.solid===G.tank.solid?'tankHull':'solid'}; }
    for(const e of G.enemies){ if(e.dead) continue; const t=rayCylinder(a,dir,Math.min(len,hitT),e.pos.x,e.pos.z,.34,0,1.8); if(t>=0&&t<hitT){ hitT=t; hit={type:'enemy'}; } }
    const K=G.tank; if(K&&K.state!=='HIDDEN'){ const tz=tankRayZone(K,a,dir,Math.min(len,hitT)); if(tz){ hitT=tz.t; hit={type:'tank',zone:tz.zone}; } }
    if(!hit&&b.y<=.02){ hitT=Math.max(0,(a.y-.02)/Math.max(1e-4,a.y-b.y)*len); hit={type:'ground'}; }
    if(hit||r.age>3){
      const p=hit?a.clone().addScaledVector(dir,hitT):b; r.done=true; scene.remove(r.mesh);
      if(hit&&hit.type==='tankHull') tankRocketHit(tankZoneAt(K,p),p);
      else if(hit&&hit.type==='tank') tankRocketHit(hit.zone,p);
      explode(p.clone().addScaledVector(dir,-.25),{r:3.6,dmgE:170,dmgP:85,src:'player',kind:'rocket'});
      continue;
    }
    r.pos.copy(b); r.mesh.position.copy(b); r.mesh.lookAt(b.clone().add(r.vel));
    r.trailT-=dt; if(r.trailT<=0){ r.trailT=.03; FX.puff(b,1,0xb8b0a0,.35,.9,V3(0,.2,0),.4); }
  }
  W.rockets=W.rockets.filter(r=>!r.done);
}

/* =========================================================
   BLINDADO: casco, torre e canhão
   ========================================================= */
function tankMats(){
  if(!TEX.tank4) TEX.tank4=canvasTex(256,256,(g,w,h)=>{ const R=mulberry32(4404); g.fillStyle='#5b5d51'; g.fillRect(0,0,w,h);
    for(let i=0;i<1800;i++){ g.fillStyle=R()<.5?'rgba(0,0,0,.07)':'rgba(255,255,255,.04)'; g.fillRect(R()*w,R()*h,1+R()*4,1+R()*3); }
    for(let i=0;i<16;i++){ g.fillStyle='rgba(70,56,36,.2)'; g.fillRect(R()*w,R()*h*.4,2+R()*3,40+R()*90); }
    g.strokeStyle='rgba(0,0,0,.35)'; g.lineWidth=2; for(let i=1;i<4;i++){ g.beginPath(); g.moveTo(i*64,0); g.lineTo(i*64,h); g.stroke(); }
    for(let i=0;i<46;i++){ g.fillStyle='rgba(18,18,18,.55)'; g.beginPath(); g.arc(R()*w,R()*h,1.6,0,7); g.fill(); } });
  const HQ=MAT_HQ, L=(o,ex)=>HQ?new T.MeshPhongMaterial(Object.assign({shininess:14,specular:0x1c1c1c},o,ex||{})):new T.MeshLambertMaterial(o);
  return {hull:L({map:TEX.tank4},{bumpMap:TEX.tank4,bumpScale:.04}),dark:L({color:0x2a2c28},{specular:0x333333,shininess:30}),track:L({color:0x1d1b19}),wheel:L({color:0x3a3c34}),burnt:L({color:0x1b1a18},{specular:0x080808,shininess:4})};
}
function makeTank(x,z,yaw){
  const M=tankMats(), root=new T.Group(), meshes=[], wheels=[];
  const add=(parent,geo,mat,px,py,pz,rx=0,ry=0,rz=0)=>{ const m=new T.Mesh(geo,mat); m.position.set(px,py,pz); m.rotation.set(rx,ry,rz); parent.add(m); m.userData={mat:'metal',tank:true}; meshes.push(m); return m; };
  add(root,BOX(2.3,.9,6.0),M.hull,0,.95,0);
  add(root,BOX(3.0,.5,5.4),M.hull,0,1.62,-.15);
  add(root,BOX(2.3,.55,.8),M.hull,0,1.25,3.0,-.62);
  for(const s of [-1,1]){
    add(root,BOX(.52,.95,6.3),M.track,s*1.36,.55,0);
    add(root,BOX(.62,.05,6.2),M.hull,s*1.36,1.36,0);
    add(root,BOX(.05,.62,4.4),M.hull,s*1.69,1.12,-.25);
    for(let i=0;i<8;i++){ const w=add(root,new T.CylinderGeometry(.29,.29,.54,10),M.wheel,s*1.36,.42,-2.45+i*.7,0,0,Math.PI/2); wheels.push(w); }
    wheels.push(add(root,new T.CylinderGeometry(.33,.33,.54,10),M.dark,s*1.36,.82,2.95,0,0,Math.PI/2));
    wheels.push(add(root,new T.CylinderGeometry(.3,.3,.54,10),M.dark,s*1.36,.8,-2.95,0,0,Math.PI/2));
  }
  add(root,BOX(2.2,.06,1.6),M.dark,0,1.9,-2.1);
  add(root,new T.CylinderGeometry(.12,.12,.9,8),M.dark,.5,1.15,-3.1,0,0,Math.PI/2);
  add(root,new T.SphereGeometry(.14,8,6),M.dark,.62,1.55,2.72);
  for(let i=0;i<3;i++) add(root,BOX(.3,.22,.6),M.track,-1.1+i*.36,1.98,1.9);
  const tur=new T.Group(); tur.position.set(0,1.88,-.25); root.add(tur);
  add(tur,BOX(2.0,.8,2.5),M.hull,0,.4,0); add(tur,BOX(1.6,.52,.36),M.hull,0,.45,1.36); add(tur,BOX(1.7,.55,.62),M.hull,0,.4,-1.5);
  add(tur,new T.CylinderGeometry(.32,.34,.32,12),M.hull,-.45,.95,-.55); add(tur,new T.CylinderGeometry(.33,.33,.05,12),M.dark,-.45,1.13,-.55);
  for(const s of [-1,1]) add(tur,BOX(.05,.6,1.9),M.hull,s*1.12,.42,-.15);
  const gun=new T.Group(); gun.position.set(0,.45,1.45); tur.add(gun);
  add(gun,new T.CylinderGeometry(.085,.1,3.3,10),M.dark,0,0,1.65,Math.PI/2); add(gun,new T.CylinderGeometry(.13,.13,.3,10),M.dark,0,0,3.3,Math.PI/2);
  add(gun,new T.CylinderGeometry(.03,.03,.4,6),M.dark,.32,-.05,.2,Math.PI/2);
  const num=textTex(128,64,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='rgba(225,222,205,.85)'; g.font='bold 40px "Barlow Condensed",sans-serif'; g.textAlign='center'; g.fillText('412',w/2,h/2+14); });
  const nm=new T.MeshBasicMaterial({map:num,transparent:true,depthWrite:false});
  for(const s of [-1,1]){ const p=new T.Mesh(new T.PlaneGeometry(.8,.4),nm); p.position.set(s*1.147,.5,-.1); p.rotation.y=s*Math.PI/2; tur.add(p); }
  scene.add(root); root.visible=false;
  const solid=addSolidOnly(0,0,0,0,1.88); solid.active=false; solid.tank=true;
  const fireL=new T.PointLight(0xff8a3a,0,14,1.8); scene.add(fireL);
  const K={g:root,tur,gun,meshes,wheels,solid,fireL,M,x,z,yaw,ty:0,pitch:0,state:'HIDDEN',hull:100,turretOK:true,gunOK:true,reload:2.5,warn:0,warnMax:1.7,aimT:0,mgCD:2,mgLeft:0,mgT:0,patrolDir:1,waitT:0,engT:0,trackT:0,smokeT:0,los:false,lastSeen:null,recoil:0,speed:0,hintT:0,blastHint:false};
  tankDetail(K); syncTank(K); return K;
}
// ---------- tanque: esteiras com elos, camuflagem e detalhes ----------
function tankTrackTex(vertical){ return canvasTex(32,32,(g,w,h)=>{ g.fillStyle='#141311'; g.fillRect(0,0,w,h); for(let i=0;i<2;i++){ const o=i*16; if(vertical){ g.fillStyle='#3a3832'; g.fillRect(o+2,1,12,w-2); g.fillStyle='#4e4a42'; g.fillRect(o+4,3,3,w-6); g.fillRect(o+10,3,3,w-6); g.fillStyle='#0a0a09'; g.fillRect(o+7,10,2,12); } else { g.fillStyle='#3a3832'; g.fillRect(1,o+2,w-2,12); g.fillStyle='#4e4a42'; g.fillRect(3,o+4,w-6,3); g.fillRect(3,o+10,w-6,3); g.fillStyle='#0a0a09'; g.fillRect(10,o+7,12,2); } } }); }
function tankCamo(){ if(TEX.tank4c) return TEX.tank4c; const R=mulberry32(4421); TEX.tank4c=canvasTex(256,256,(g,w,h)=>{ g.drawImage(TEX.tank4.image,0,0,w,h);
  for(const [col,n] of [['rgba(62,70,44,.55)',16],['rgba(92,60,38,.5)',12]]) for(let i=0;i<n;i++){ g.fillStyle=col; g.beginPath(); let x=R()*w, y=R()*h; g.moveTo(x,y); for(let k=0;k<9;k++){ x+=(R()-.45)*34; y+=(R()-.5)*22; g.lineTo(x,y); } g.closePath(); g.fill(); }
  for(let i=0;i<40;i++){ g.fillStyle='rgba(60,46,30,.12)'; g.fillRect(R()*w,h*.6+R()*h*.4,6+R()*30,2+R()*8); } }); return TEX.tank4c; }
function tankDetail(K){ const M=K.M, V=vehMats(), root=K.g, tur=K.tur, gun=K.gun;
  const ts=tankTrackTex(true), tt=tankTrackTex(false); ts.repeat.set(20,1); tt.repeat.set(1,20); const sideM=new T.MeshLambertMaterial({map:ts}), topM=new T.MeshLambertMaterial({map:tt}); K.trkS=ts; K.trkT=tt;
  for(const m of K.meshes){ const p=m.geometry.parameters; if(m.material===M.track&&p&&Math.abs(p.depth-6.3)<.01) m.material=[sideM,sideM,topM,topM,topM,topM]; }
  const cam=tankCamo(); M.hull.map=cam; M.hull.needsUpdate=true;
  const out=(B,parent)=>{ for(const m of B.bake(parent)){ m.userData={mat:'metal',tank:true}; K.meshes.push(m); } };
  // casco
  let B=vehB();
  for(const s of [-1,1]){ for(let i=0;i<8;i++){ const z=-2.45+i*.7; B.cylX(.2,.58,10,M.dark,s*1.36,.42,z); B.cylX(.08,.62,8,V.chrome,s*1.36,.42,z); } B.cylX(.24,.58,8,M.dark,s*1.36,.82,2.95); for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; B.box(.56,.07,.07,M.dark,s*1.36,.82+Math.sin(a)*.34,2.95+Math.cos(a)*.34,a); }
    for(let z=-2.2;z<=1.9;z+=.55) B.box(.03,.03,.03,V.dark,s*1.72,1.38,z); for(let i=0;i<5;i++) B.box(.02,.6,.012,M.dark,s*1.72,1.12,-2.2+i*.95); }
  for(const s of [-1,1]){ B.cylX(.13,.55,10,V.soot,s*.62,1.22,-3.08); B.cylZ(.05,.15,6,V.soot,s*.62,1.22,-3.38); B.cylZ(.1,.16,10,M.dark,s*.95,1.62,2.78); B.cylZ(.085,.02,10,V.lamp,s*.95,1.62,2.865); B.box(.05,.14,.24,M.dark,s*.95,1.72,2.7); B.box(.3,.12,.12,M.dark,s*.7,.75,-3.08); }
  for(let r=0;r<2;r++) for(let i=0;i<4;i++) B.box(.48,.06,.17,M.track,-.78+i*.52,1.36+r*.12,2.9-r*.18,-.62);
  B.box(.42,.08,.05,V.glass,-.5,1.75,2.62); B.box(.5,.14,.06,M.dark,-.5,1.75,2.6);
  B.box(.05,.05,1.1,M.wheel,1.52,1.43,.9); B.box(.22,.02,.26,M.dark,1.52,1.43,1.55); B.box(.05,.05,.8,M.wheel,1.52,1.43,-.6); B.box(.2,.12,.04,M.dark,1.52,1.43,-1.0); B.cylZ(.025,4.2,6,M.dark,-1.52,1.42,-.2); for(const z of [-2.2,1.9]) B.geo(new T.TorusGeometry(.12,.025,4,10),M.dark,-1.52,1.42,z,0,Math.PI/2,0);
  for(let i=0;i<3;i++) B.box(.16,.36,.26,vehBody(0x4a4e3e),-.7+i*.22,2.06,-2.75); B.box(.85,.04,.3,M.dark,-.48,1.87,-2.75);
  B.cylZ(.012,2.6,5,M.dark,.95,3.15,-2.4); B.geo(new T.CylinderGeometry(.04,.05,.1,8),M.dark,.95,1.92,-2.4);
  out(B,root);
  // torre
  B=vehB(); for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; B.box(.08,.07,.05,V.glass,-.45+Math.sin(a)*.33,1.02,-.55+Math.cos(a)*.33,0,a); } B.geo(new T.CylinderGeometry(.3,.3,.04,12),M.hull,-.45,1.2,-.55,0,0,.15);
  B.box(1.5,.52,.55,M.hull,0,.42,-2.05); for(const s of [-1,1]){ B.box(.03,.5,.6,M.hull,s*1.02,.42,-.1); B.box(.03,.03,.1,M.dark,s*1.04,.55,-.1); for(let i=0;i<3;i++){ const t=B.cylZ(.045,.26,8,M.dark,s*(.86+i*.07),.55+i*.06,1.1); t.rotation.set(Math.PI/2-.5,0,s*.4); } }
  B.cylX(.32,1.36,12,M.hull,0,.45,1.52); B.box(.1,.12,.1,M.dark,.32,.42,1.75);
  B.box(.05,.05,1.0,M.dark,-.95,.82,-.6); B.geo(new T.CylinderGeometry(.012,.012,1.6,5),M.dark,.55,1.6,-1.7,0,0,-.08);
  out(B,tur);
  // canhão
  B=vehB(); B.cylZ(.15,.75,10,M.hull,0,0,.45); B.cylZ(.17,.06,10,M.dark,0,0,3.18); B.cylZ(.17,.06,10,M.dark,0,0,3.45); B.cylZ(.11,.3,10,M.dark,0,0,3.32);
  out(B,gun);
}

function tankBox(x,z,yaw){ const s=Math.abs(Math.sin(yaw)), c=Math.abs(Math.cos(yaw)), hl=3.3, hw=1.72; const ex=s*hl+c*hw, ez=c*hl+s*hw; return {minX:x-ex,maxX:x+ex,minZ:z-ez,maxZ:z+ez}; }
function syncTank(K){
  K.g.position.set(K.x,0,K.z); K.g.rotation.y=K.yaw; K.tur.rotation.y=K.ty; K.gun.rotation.x=-K.pitch; K.gun.position.z=1.45-K.recoil;
  const b=tankBox(K.x,K.z,K.yaw); Object.assign(K.solid,b); K.solid.minY=0; K.solid.maxY=1.88;
}
function activateTank(K){ if(K.active) return; K.active=true; K.g.visible=true; K.solid.active=true; for(const m of K.meshes) W.shootables.push(m); }
function tankPivot(K){ return V3(K.x+Math.sin(K.yaw)*-.25,1.88,K.z+Math.cos(K.yaw)*-.25); }
function tankGunBase(K){ const p=tankPivot(K), wy=K.yaw+K.ty; return V3(p.x+Math.sin(wy)*1.45,p.y+.45,p.z+Math.cos(wy)*1.45); }
function tankAimDir(K){ const wy=K.yaw+K.ty; return V3(Math.sin(wy)*Math.cos(K.pitch),Math.sin(K.pitch),Math.cos(wy)*Math.cos(K.pitch)); }
function tankMuzzle(K){ return tankGunBase(K).addScaledVector(tankAimDir(K),3.45); }
function tankZoneAt(K,p){
  const dx=p.x-K.x, dz=p.z-K.z, s=Math.sin(K.yaw), c=Math.cos(K.yaw);
  const lz=dx*s+dz*c, lx=dx*c-dz*s;
  if(lz<-2.0) return 'rear'; if(Math.abs(lx)>1.3&&lz<2.7) return 'side'; return 'front';
}
function tankRayZone(K,a,dir,maxT){
  let best=null;
  const gb=tankGunBase(K), gm=gb.clone().addScaledVector(tankAimDir(K),3.45);
  for(let i=0;i<=12;i++){ const t=maxT*i/12; const p=a.clone().addScaledVector(dir,t); if(distPointSeg(p,gb,gm)<.3){ best={t,zone:'gun'}; break; } }
  const tp=tankPivot(K); const tt=rayCylinder(a,dir,best?best.t:maxT,tp.x,tp.z,1.2,1.88,2.75); if(tt>=0) best={t:tt,zone:'turret'};
  return best;
}
function tankRocketHit(zone,p){
  const K=G.tank; if(!K||K.state==='DEAD') return;
  const dmg={rear:100,side:65,front:38,turret:35,gun:15}[zone]||38; let msg='';
  if(zone==='turret'){ if(K.turretOK){ K.turretOK=false; msg='torre travada!'; } else msg='torre atingida'; }
  else if(zone==='gun'){ if(K.gunOK){ K.gunOK=false; K.warn=0; msg='canhão inutilizado!'; } else msg='canhão atingido'; }
  else if(zone==='rear') msg='motor atingido!'; else if(zone==='side') msg='lateral perfurada'; else msg='blindagem frontal — mire na lateral ou na traseira';
  K.hull-=dmg; hitMarker('kill'); pickupMsg('Blindado: '+msg);
  if(K.hull<=0) tankDestroyed(K,false);
  else { FX.puff(V3(K.x,2.4,K.z),4,0x2a2622,1.4,2.4,V3(0,1,0),.5); if(zone==='front'&&!K.frontHint){ K.frontHint=true; G.radioMsg('LUCIEN','A frente aguenta! Vá pelo café ou pela lateral e acerte o motor, atrás.','tip'); } }
}
function tankBlast(pos){
  const K=G.tank; if(!K||K.state==='HIDDEN'||K.state==='DEAD') return;
  const d=Math.hypot(pos.x-K.x,pos.z-K.z); if(d>4.2) return;
  const zone=tankZoneAt(K,pos); const dmg=(zone==='rear'&&pos.y>1.5)?10:4;
  K.hull=Math.max(25,K.hull-dmg);
  if(!K.blastHint){ K.blastHint=true; pickupMsg('A granada mal arranha o blindado'); }
}
function tankSmallArms(pt){
  const K=G.tank; if(!K||K.state==='DEAD') return;
  AudioSys.play('clank',pt,.8);
  if(simTime-(K.hintT||-99)>8){ K.hintT=simTime; showHint('As balas ricocheteiam na blindagem. Só o Panzerfaust (4) derruba o blindado.'); }
}
function tankDestroyed(K,silent){
  K.state='DEAD'; K.warn=0; K.hull=0; K.speed=0;
  K.tur.position.y+=.22; K.tur.rotation.z=.14; K.ty+=.35; K.recoil=0; syncTank(K);
  for(const m of K.meshes) if(m.material!==K.M.track) m.material=K.M.burnt;
  K.fireL.position.set(K.x,2.8,K.z); K.fireL.intensity=1.8;
  W.nav.nodes=W.nav.nodes.filter(n=>!(n.x>K.solid.minX-.4&&n.x<K.solid.maxX+.4&&n.z>K.solid.minZ-.4&&n.z<K.solid.maxZ+.4)); buildNav();
  if(silent) return;
  explode(V3(K.x,2.2,K.z),{r:5.5,dmgE:200,dmgP:60,src:'player',kind:'wreck'});
  FX.burst(V3(K.x,2.6,K.z),40,0xffc070,9,.7,6,1.2);
  onTankDestroyed04();
}
function tankFrontBlocked(K,sg){
  const b=K.solid, test=(x,z,r)=>{
    if(K.state==='ENTER') return z>b.minZ-r&&z<b.maxZ+r&&x>b.minX-1.3&&x<b.minX+.6;
    if(sg>0) return x>b.minX-r&&x<b.maxX+r&&z>b.maxZ-.6&&z<b.maxZ+1.3;
    return x>b.minX-r&&x<b.maxX+r&&z<b.minZ+.6&&z>b.minZ-1.3; };
  const P=G.player.pos; if(test(P.x,P.z,.5)) return true;
  for(const a of G.actors) if(!a.dead&&test(a.pos.x,a.pos.z,.35)) return true;
  return false;
}
function tankTurnBlocked(K){ const P=G.player.pos; if(Math.hypot(P.x-K.x,P.z-K.z)<3.95) return true; for(const a of G.actors) if(!a.dead&&Math.hypot(a.pos.x-K.x,a.pos.z-K.z)<3.85) return true; return false; }
function updateTank(dt){
  const K=G.tank; if(!K||K.state==='HIDDEN') return;
  if(K.state==='DEAD'){
    K.smokeT-=dt; if(K.smokeT<=0){ K.smokeT=.14; FX.puff(V3(K.x+rnd(-.6,.6),2.7,K.z+rnd(-.6,.6)),1,0x2a2622,1.5,3.6,V3(rnd(-.25,.25),1.5,rnd(-.25,.25)),.5); if(Math.random()<.45) FX.puff(V3(K.x+rnd(-.4,.4),2.3,K.z+rnd(-.4,.4)),1,0xff9a40,.6,.4,V3(0,.9,0),.7); }
    K.fireL.intensity=1.5+Math.sin(simTime*17)*.35+Math.random()*.3; return;
  }
  const P=G.player; let speed=0;
  if(K.state==='ENTER'){ if(K.x>2.05){ if(!tankFrontBlocked(K,0)){ speed=2.4; K.x=Math.max(2,K.x-speed*dt); } } else { K.x=2; K.state='TURN'; } }
  else if(K.state==='TURN'){ if(!tankTurnBlocked(K)){ const d=angDiff(K.yaw,0); K.yaw+=clamp(d,-.38*dt,.38*dt); speed=.6; if(Math.abs(d)<.01){ K.yaw=0; K.state='PATROL'; K.waitT=4; K.patrolDir=1; } } }
  else if(K.state==='PATROL'){
    if(K.waitT>0) K.waitT-=dt;
    else { const target=K.patrolDir>0?-37:-50, sg=Math.sign(target-K.z);
      if(Math.abs(target-K.z)<.05){ K.waitT=rnd(4,7); K.patrolDir*=-1; }
      else if(!tankFrontBlocked(K,sg)){ speed=1.3; K.z+=clamp(target-K.z,-speed*dt,speed*dt); } }
  }
  K.speed=lerp(K.speed,speed,1-Math.exp(-dt*4));
  for(const w of K.wheels) w.rotation.x+=K.speed*dt/.3*(K.state==='ENTER'?1:K.patrolDir>0?1:-1);
  if(K.trkS){ const dd=K.speed*dt*(K.state==='ENTER'?1:K.patrolDir>0?1:-1)*20/6.3; K.trkS.offset.x-=dd; K.trkT.offset.y+=dd; }
  // torre e mira
  const piv=tankPivot(K), gb=tankGunBase(K);
  const tp=V3(P.pos.x,P.pos.y+pStance(1.3,.8,.3),P.pos.z), dist=Math.hypot(tp.x-gb.x,tp.z-gb.z);
  K.los=!P.dead&&dist<75&&!segFirst(piv.x,piv.y+.75,piv.z,tp.x,tp.y,tp.z,s=>s!==K.solid);
  if(K.los) K.lastSeen={x:P.pos.x,z:P.pos.z,y:tp.y};
  const tgt=K.los?{x:tp.x,z:tp.z,y:tp.y}:K.lastSeen;
  let err=9;
  if(tgt){
    const want=Math.atan2(tgt.x-gb.x,tgt.z-gb.z), wy=K.yaw+K.ty; err=Math.abs(angDiff(wy,want));
    if(K.turretOK){ const rate=K.warn>0?.12:(K.speed>.2?.38:.55); K.ty+=clamp(angDiff(wy,want),-rate*dt,rate*dt); }
    const pw=clamp(Math.atan2(tgt.y-gb.y,Math.max(1,Math.hypot(tgt.x-gb.x,tgt.z-gb.z))),-.14,.3); K.pitch+=clamp(pw-K.pitch,-.4*dt,.4*dt);
  }
  K.reload-=dt; K.recoil=Math.max(0,K.recoil-dt*1.2);
  if(K.gunOK){
    if(K.warn>0){ K.warn-=dt; K.aimedAtPlayer=K.los&&err<.07; if(K.warn<=0) tankFire(K); }
    else if(K.reload<=0&&K.los&&err<.05&&dist>5&&K.state!=='TURN'){ K.aimT+=dt; if(K.aimT>.5){ const sh=tankShellRay(K); if(G.enemies.some(e=>!e.dead&&e.pos.distanceTo(sh.p)<3.6)){ K.aimT=0; K.reload=.8; } else { K.warnMax=G.diff==='recruta'?2.2:G.diff==='veterano'?1.35:1.7; K.warn=K.warnMax; K.aimT=0; AudioSys.play('turret',piv); } } }
    else K.aimT=Math.max(0,K.aimT-dt);
  }
  // metralhadora coaxial
  K.mgCD-=dt;
  if(K.mgLeft>0){ K.mgT-=dt; if(K.mgT<=0){ K.mgT=.1; K.mgLeft--; tankMG(K); } }
  else if(K.mgCD<=0&&K.los&&K.warn<=0&&err<.09&&dist<40){ K.mgLeft=6; K.mgCD=2.6; }
  // som do motor e lagartas
  K.engT-=dt; if(K.engT<=0){ K.engT=.34; AudioSys.play('engine',V3(K.x,1,K.z),K.speed>.2?1.4:.8); }
  if(K.speed>.2){ K.trackT-=dt; if(K.trackT<=0){ K.trackT=.16; AudioSys.play('tracks',V3(K.x,.5,K.z),1); } }
  if(K.hull<55){ K.smokeT-=dt; if(K.smokeT<=0){ K.smokeT=.35; FX.puff(V3(K.x+Math.sin(K.yaw)*-2.4,2,K.z+Math.cos(K.yaw)*-2.4),1,0x3a3632,1,2.2,V3(0,1,0),.4); } }
  syncTank(K);
}
function tankShellRay(K){
  const m=tankMuzzle(K), d=tankAimDir(K), far=m.clone().addScaledVector(d,90);
  const h=segFirst(m.x,m.y,m.z,far.x,far.y,far.z,s=>s!==K.solid); let t=h?h.t*90:90, who=null;
  const P=G.player; if(!P.dead){ const tp=rayCylinder(m,d,t,P.pos.x,P.pos.z,.4,P.pos.y,P.pos.y+pStance(1.75,1.15,.55)); if(tp>=0){ t=tp; who='player'; } }
  for(const e of G.enemies){ if(e.dead) continue; const te=rayCylinder(m,d,t,e.pos.x,e.pos.z,.35,0,1.8); if(te>=0){ t=te; who=e; } }
  if(d.y<-1e-3&&m.y+d.y*t<0) t=-m.y/d.y;
  return {m,d,t,p:m.clone().addScaledVector(d,t),who};
}
function tankFire(K){
  const s=tankShellRay(K); K.reload=G.diff==='recruta'?7:G.diff==='veterano'?4.3:5.5; K.recoil=.45; K.fired=(K.fired||0)+1;
  AudioSys.play('tankfire',s.m,1.3); emitNoise(s.m,60,'enemyshot',null);
  FX.flash(s.m); FX.flash(s.m.clone().addScaledVector(s.d,.4)); FX.puff(s.m,6,0x8a847a,1.2,1.6,s.d.clone().multiplyScalar(2),.5); FX.tracer(s.m,s.p);
  explode(s.p.clone().addScaledVector(s.d,-.3),{r:4.4,dmgE:150,dmgP:70,src:'tank',kind:'shell'});
}
function tankMG(K){
  const P=G.player; if(P.dead) return;
  const gb=tankGunBase(K), wy=K.yaw+K.ty; const m=V3(gb.x+Math.cos(wy)*.32,gb.y-.05,gb.z-Math.sin(wy)*.32);
  const aim=V3(P.pos.x,P.pos.y+pStance(1.2,.75,.3),P.pos.z); const dir=aim.clone().sub(m).normalize(); jitterDir(dir,3.4*D().spread*DEG,Math.random);
  const far=m.clone().addScaledVector(dir,80); const h=segFirst(m.x,m.y,m.z,far.x,far.y,far.z,s=>s!==K.solid); const tw=h?h.t*80:80;
  const tp=rayCylinder(m,dir,tw,P.pos.x,P.pos.z,.33,P.pos.y,P.pos.y+pStance(1.75,1.15,.55));
  const hp=m.clone().addScaledVector(dir,tp>=0?tp:tw);
  if(tp>=0){ G.deathCause='tank'; hurtPlayer(4.5*D().dmg,V3(K.x,0,K.z)); }
  else { if(h){ const n=V3(); n.setComponent(h.axis<0?1:h.axis,h.sign||1); worldImpact(hp,n,h.solid.mesh?h.solid.mesh.userData.mat:'stone',true); } const eye=V3(P.pos.x,P.pos.y+1.5,P.pos.z); if(distPointSeg(eye,m,hp)<1.2){ AudioSys.play('whiz',eye); P.suppress=Math.min(1,P.suppress+.3); } }
  FX.tracer(m,hp); FX.flash(m); AudioSys.play('smg',m,.6);
}