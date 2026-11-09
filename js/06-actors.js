'use strict';


/* =========================================================
   ATORES
   ========================================================= */
class Actor{
  constructor(def,look){
    this.id=def.id; this.def=def;
    this.pos=V3(def.x,heightAt(def.x,def.z),def.z); this.yaw=def.yaw||0;
    this.h=makeHuman(look,this); this.h.root.position.copy(this.pos); this.h.root.rotation.y=this.yaw; scene.add(this.h.root);
    if(renderer.shadowMap.enabled) this.h.root.traverse(o=>{ if(o.isMesh&&o.material.visible!==false&&!o.material.transparent) o.castShadow=true; });
    for(const m of this.h.hitMeshes) W.shootables.push(m);
    this.hp=def.hp||100; this.maxHp=this.hp; this.dead=false; this.deathT=0; this.fallSign=-1; this.fallSide=0;
    this.crouch=0; this.crouchTarget=0; this.walkPhase=Math.random()*6; this.speedNow=0; this.aimBlend=0; this.aimTarget=0; this.headYaw=0;
    this.react={sx:0,sz:0,sy:0,hx:0,hz:0,aL:0,aR:0,lL:0,lR:0,kL:0,kR:0,pz:0};
    this.path=null; this.pathI=0; this.goal=null; this.progT=0; this.progPos=this.pos.clone(); this.repathT=0;
    this.doze=0; this.staggerT=0; this.kneelT=0; this.lastFlinch=-9; this.aimPenalty=0; this.movePenalty=0; this.suppression=0; this.curl=0;
  }
  eyeY(){ return this.pos.y+lerp(1.62,1.08,this.crouch)-(this.kneelT>0?.3:0); }
  speedMul(){ return clamp(1-.35*this.movePenalty,.6,1)*(1-.45*this.limbW('leg'))*(this.kneelT>0?0:1)*(this.staggerT>0?.25:1); }
  faceTowards(x,z,dt,rate=7){ const t=Math.atan2(x-this.pos.x,z-this.pos.z); this.yaw+=clamp(angDiff(this.yaw,t),-rate*dt,rate*dt); }
  moveDir(dx,dz,speed,dt){
    if(this.def&&this.def.fixed){ this.speedNow=lerp(this.speedNow,0,1-Math.exp(-dt*10)); return; }
    const l=Math.hypot(dx,dz); if(l<1e-4||speed<=0){ this.speedNow=lerp(this.speedNow,0,1-Math.exp(-dt*10)); return; }
    this.pos.x+=dx/l*speed*dt; this.pos.z+=dz/l*speed*dt;
    resolveCircle(this.pos,.32,this.pos.y,this.pos.y+1.7); separateActor(this); if(W.walk.length) this.pos.y=heightAt(this.pos.x,this.pos.z);
    this.speedNow=lerp(this.speedNow,speed,1-Math.exp(-dt*10));
  }
  setPath(x,z){ this.path=findPath(this.pos.x,this.pos.z,x,z); this.pathI=0; this.goal={x,z}; this.progT=0; this.progPos.copy(this.pos); }
  followPath(speed,dt,faceMove=true){
    if(!this.path||this.pathI>=this.path.length){ this.moveDir(0,0,0,dt); return true; }
    const p=this.path[this.pathI]; const dx=p.x-this.pos.x, dz=p.z-this.pos.z, d=Math.hypot(dx,dz);
    if(d<.45){ this.pathI++; return this.pathI>=this.path.length; }
    for(const k in W.doors){ const dr=W.doors[k]; if(dr.npc && dr.state==='CLOSED' && Math.hypot(dr.closed.x-this.pos.x,dr.closed.z-this.pos.z)<1.9 && Math.abs((dr.y0||0)-this.pos.y)<1.5) openDoor(dr,this); }
    this.moveDir(dx,dz,speed,dt); if(faceMove) this.faceTowards(p.x,p.z,dt,6);
    this.progT+=dt;
    if(this.progT>1.6){ if(this.progPos.distanceTo(this.pos)<.25 && this.goal){ this.stuck=(this.stuck||0)+1; this.setPath(this.goal.x,this.goal.z); } else this.stuck=0; this.progT=0; this.progPos.copy(this.pos); }
    return false;
  }
  muzzleWorld(){ ensureMatrices(); if(this.h.muzzle&&this.h.weapon&&this.h.weapon.parent===this.h.g.chest) return this.h.muzzle.getWorldPosition(V3()); return V3(this.pos.x,this.pos.y+1.35,this.pos.z); }
  localDir(dir){ const s=Math.sin(this.yaw), c=Math.cos(this.yaw); return {lx:dir.x*c-dir.z*s, lz:dir.x*s+dir.z*c}; }
  animate(dt){
    const g=this.h.g, r=this.react, k=Math.exp(-dt*7.5);
    if(this.h.lod&&G&&G.player){ const dx=this.pos.x-G.player.pos.x, dz=this.pos.z-G.player.pos.z, v=dx*dx+dz*dz<520||APP.state==='MENU'; if(v!==this.h.lodV){ this.h.lodV=v; for(const m of this.h.lod) m.visible=v; } }
    for(const key in r) r[key]*=k;
    this.crouch=lerp(this.crouch,this.crouchTarget,1-Math.exp(-dt*7));
    this.aimBlend=lerp(this.aimBlend,this.aimTarget,1-Math.exp(-dt*6));
    const root=this.h.root; root.position.set(this.pos.x,this.pos.y,this.pos.z); root.rotation.y=this.yaw;
    if(this.dead){
      if(this.tied){ this.deathT+=dt; const t=Math.min(1,this.deathT/.8), e2=t*t*(3-2*t); root.rotation.set(0,root.rotation.y,0); root.position.y=this.pos.y; g.pelvis.position.y=lerp(.53,.2,e2);
        for(const S of ['L','R']){ g['hip'+S].rotation.x=lerp(-.04,-1.42,e2); g['kn'+S].rotation.x=lerp(1.6,.3+(S==='L'?.25:0),e2); g['an'+S].rotation.x=0; } g.spine.rotation.set(.12,0,0); g.chest.rotation.set(0,0,0); g.head.rotation.set(.4+Math.sin(simTime*.4)*.05,Math.sin(simTime*.3)*.2,0);
        ikArm(g.shL,g.elL,g.wrL,.05,-.2,-.2,1,0,-.4); ikArm(g.shR,g.elR,g.wrR,-.05,-.2,-.2,-1,0,-.4); return; }
      this.deathT+=dt; const dT=this.deathT, tb=Math.min(1,dT/.26), t=ease(clamp((dT-.1)/.7,0,1)); if(this.deathVar===undefined) this.deathVar=Math.random()*3|0; const dv=this.deathVar;
      const bounce=dT>.8&&dT<1.8?Math.sin((dT-.8)*15)*.07*Math.exp(-(dT-.8)*4.5):0, buck=tb*(1-t);
      root.rotation.x=this.fallSign*(t*1.52-bounce); root.rotation.z=this.fallSide*t*.25; root.position.y=this.pos.y+.13*t;
      g.pelvis.position.y=.95-.34*buck; g.pelvis.rotation.y=0; g.spine.rotation.x=(dv===1?.55:.3)*buck+(dv===2?.18*t:0); g.spine.rotation.z=(dv===2?.25:0)*t; g.chest.rotation.set(0,0,0);
      g.head.rotation.x=this.fallSign*-.3*t+(dv===1?.35*buck:0); g.head.rotation.y=(dv-1)*.45*t;
      const aL=dv===1?[-2.75,-.3]:dv===2?[.25,-.15]:[-2.4*(this.fallSign<0?1:-.2),-.6], aR=dv===1?[-2.55,.4]:dv===2?[-1.2,1.15]:[-.4,.9];
      g.shL.rotation.set(lerp(g.shL.rotation.x,aL[0],t*.2),0,lerp(g.shL.rotation.z,aL[1],t*.2)); g.shR.rotation.set(lerp(g.shR.rotation.x,aR[0],t*.2),0,lerp(g.shR.rotation.z,aR[1],t*.2));
      g.elL.rotation.x=lerp(g.elL.rotation.x,dv===1?-.3:-.5,t*.2); g.elR.rotation.x=lerp(g.elR.rotation.x,dv===2?-1.4:-.4,t*.2);
      g.hipL.rotation.x=lerp(-.55*tb,dv===2?-.6:-.1,t); g.hipR.rotation.x=lerp(-.35*tb,.15,t); g.knL.rotation.x=lerp(1.05*tb,dv===2?1.1:.3,t); g.knR.rotation.x=lerp(.8*tb,.1,t); g.anL.rotation.x=0; g.anR.rotation.x=0;
      return;
    }
    root.rotation.x=0; root.rotation.z=r.pz*.5;
    const amp=clamp(this.speedNow/3,0,1)*(1-this.crouch*.5);
    this.walkPhase+=this.speedNow*dt*3.1;
    const s=Math.sin(this.walkPhase), c=Math.cos(this.walkPhase);
    const kneel=this.kneelT>0?1:0;
    const cr=Math.max(this.crouch,kneel*.85);
    const hipC=-1.15*cr, kneeC=2.0*cr, ankC=-.85*cr;
    g.hipL.rotation.x=hipC-s*.55*amp+r.lL-(kneel*.5); g.hipR.rotation.x=hipC+s*.55*amp+r.lR+(kneel*.6);
    g.knL.rotation.x=kneeC+Math.max(0,c)*.85*amp; g.knR.rotation.x=kneeC+Math.max(0,-c)*.85*amp+kneel*.3;
    g.anL.rotation.x=ankC-s*.24*amp; g.anR.rotation.x=ankC+s*.24*amp;
    g.pelvis.rotation.y=s*.1*amp;
    g.pelvis.position.y=.95-.42*cr+Math.abs(s)*.025*amp;
    g.pelvis.rotation.z=(this.staggerT>0?Math.sin(this.staggerT*14)*.12:0);
    g.spine.rotation.x=.14*cr+r.sx+this.curl*.45+(this.suppression>.6?.15:0)+this.doze*.22;
    g.spine.rotation.z=r.sz; g.spine.rotation.y=r.sy; g.knL.rotation.x+=r.kL; g.knR.rotation.x+=r.kR;
    g.pelvis.rotation.z+=c*.035*amp; g.spine.rotation.x+=.17*clamp((this.speedNow-3.4)/2,0,1);
    if(this.h.weapon&&this.h.weapon.parent===g.chest) g.spine.rotation.y-=s*.1*amp;
    if(this.wounds){ const wl=clamp(this.wounds.legL,0,1), wr=clamp(this.wounds.legR,0,1), lw=Math.max(wl,wr);
      if(lw>.05){ const sd=wl>=wr?1:-1, stiff=lw*.6;
        if(sd>0){ g.hipL.rotation.x=lerp(g.hipL.rotation.x,hipC,stiff); g.knL.rotation.x=lerp(g.knL.rotation.x,kneeC+.08,stiff); } else { g.hipR.rotation.x=lerp(g.hipR.rotation.x,hipC,stiff); g.knR.rotation.x=lerp(g.knR.rotation.x,kneeC+.08,stiff); }
        const load=Math.max(0,sd>0?-s:s)*amp;
        g.pelvis.position.y-=load*.08*lw; g.pelvis.rotation.z+=sd*(.04+load*.14)*lw; g.spine.rotation.z-=sd*(.05+load*.16)*lw; } }
    g.head.rotation.x=r.hx+this.doze*.8; g.head.rotation.z=r.hz; g.head.rotation.y=this.headYaw;
    const ab=this.h.weapon&&this.h.weapon.parent===g.chest?this.aimBlend:0;
    const noW=!(this.h.weapon&&this.h.weapon.parent===g.chest);
    if(noW && this.cower){ g.shR.rotation.set(-2.6+r.aR,0,.3); g.shL.rotation.set(-2.6+r.aL,0,-.3); g.elR.rotation.x=-1.2; g.elL.rotation.x=-1.2; }
    else {
      g.shR.rotation.set(lerp(-.35,-1.12,ab)+r.aR+(noW?.3:0),0,lerp(.12,.22,ab));
      g.shL.rotation.set(lerp(-.5,-1.05,ab)+r.aL+(noW?.4:0),0,lerp(-.22,-.62,ab));
      g.elR.rotation.x=lerp(-.55,-.6,ab); g.elL.rotation.x=lerp(-.7,-.55,ab);
      if(noW){ g.shR.rotation.x-=s*.42*amp; g.shL.rotation.x+=s*.42*amp; g.elR.rotation.x-=.3*amp; g.elL.rotation.x-=.3*amp; }
    }
    if(this.h.weapon && !noW){ const tw=this.h.wtype==='rifle'?-.3:0; if(tw){ g.spine.rotation.y+=tw*ab; g.head.rotation.y-=tw*ab; } if(HGRIP[this.h.wtype]) holdWeaponIK(this,ab); else this.h.weapon.rotation.x=lerp(.55,0,ab); }
    if(this.wounds){ const wL=clamp(this.wounds.armL,0,1), wR=clamp(this.wounds.armR,0,1);
      if(wL>.05){ const k=wL*.85; g.shL.rotation.x=lerp(g.shL.rotation.x,-.06+r.aL,k); g.shL.rotation.z=lerp(g.shL.rotation.z,-.08,k); g.elL.rotation.x=lerp(g.elL.rotation.x,-.15,k); }
      if(wR>.05){ if(this.h.weapon&&!noW){ g.shR.rotation.x+=.4*wR; this.h.weapon.rotation.x+=.28*wR; } else { const k=wR*.85; g.shR.rotation.x=lerp(g.shR.rotation.x,-.06+r.aR,k); g.elR.rotation.x=lerp(g.elR.rotation.x,-.15,k); } } }
    // passo leve de idle, respiração, peso e olhar
    if(amp<.05) g.spine.rotation.x+=Math.sin(simTime*1.6+this.walkPhase)*.012;
    const ph=this.yaw*3.7+(this.walkPhase%7); g.chest.rotation.set(Math.sin(simTime*1.7+ph)*.016*(1-amp),-Math.sin(this.walkPhase)*.11*amp*(1-ab*.8)*(noW?1:.35),0);
    if(this.surrender){ const k=this.kneelK=Math.min(1,(this.kneelK||0)+dt*1.4), e2=k*k*(3-2*k);
      g.pelvis.position.y=lerp(g.pelvis.position.y,.53,e2); for(const S of ['L','R']){ g['hip'+S].rotation.x=lerp(g['hip'+S].rotation.x,-.04,e2); g['kn'+S].rotation.x=lerp(g['kn'+S].rotation.x,1.6,e2); g['an'+S].rotation.x=lerp(g['an'+S].rotation.x,.5,e2); }
      g.spine.rotation.x=.06*e2; g.head.rotation.x=lerp(g.head.rotation.x,.22,e2); ikArm(g.shL,g.elL,g.wrL,.06,.56,-.07,1,.25,.5); ikArm(g.shR,g.elR,g.wrR,-.06,.56,-.07,-1,.25,.5); }
    else this.kneelK=0;
    if(amp<.05&&ab<.25&&!this.cower&&!this.doze){ g.head.rotation.y+=Math.sin(simTime*.31+ph)*.24+Math.sin(simTime*.83+ph*2)*.06; g.pelvis.rotation.z+=Math.sin(simTime*.42+ph)*.022; g.head.rotation.x+=Math.sin(simTime*.5+ph)*.04; }
  }
}
/* mãos na arma: pose da arma no espaço do peito + IK de dois ossos para cada braço */
const HGRIP={
  rifle:{R:[0,-.045,.05],L:[0,-.03,.33],idle:[-.09,.1,.34,.5,-.22],aim:[-.17,.25,.17,0,.3]},
  smg:{R:[0,-.04,.0],L:[0,-.08,.2],idle:[-.06,.08,.24,.55,-.1],aim:[-.1,.23,.22,0,0]},
  pistol:{R:[0,-.055,.04],L:[.03,-.07,.03],idle:[-.08,.0,.2,1.05,-.1],aim:[-.03,.29,.43,0,0]}};
const _ikV=new T.Vector3(), _ikW=new T.Vector3(), _ikE=new T.Vector3(), _ikA=new T.Vector3(), _ikP=new T.Vector3(), _ikQ=new T.Quaternion(), _ikQ2=new T.Quaternion(), _ikT=new T.Vector3();
function ikArm(sh,el,wr,tx,ty,tz,px,py,pz){
  const L1=-el.position.y, L2=(wr?-wr.position.y:.27)+.05; _ikV.set(tx-sh.position.x,ty-sh.position.y,tz-sh.position.z); let d=_ikV.length(); if(d<1e-4) return; const dc=clamp(d,.14,L1+L2-.004);
  const cosA=clamp((L1*L1+L2*L2-dc*dc)/(2*L1*L2),-1,1), bend=Math.PI-Math.acos(cosA);
  el.rotation.set(-bend,0,0);
  _ikW.set(0,-L1-L2*Math.cos(bend),L2*Math.sin(bend)).normalize(); _ikV.multiplyScalar(1/d);
  _ikQ.setFromUnitVectors(_ikW,_ikV);
  _ikE.set(0,-1,0).applyQuaternion(_ikQ); _ikA.copy(_ikV);
  _ikE.addScaledVector(_ikA,-_ikE.dot(_ikA)); _ikP.set(px,py,pz); _ikP.addScaledVector(_ikA,-_ikP.dot(_ikA));
  if(_ikE.lengthSq()>1e-6&&_ikP.lengthSq()>1e-6){ _ikE.normalize(); _ikP.normalize(); let ang=Math.acos(clamp(_ikE.dot(_ikP),-1,1)); _ikT.crossVectors(_ikE,_ikP); if(_ikT.dot(_ikA)<0) ang=-ang; _ikQ2.setFromAxisAngle(_ikA,ang); _ikQ.premultiply(_ikQ2); }
  sh.quaternion.copy(_ikQ); if(wr) wr.rotation.set(-.15,0,0);
}
function holdWeaponIK(a,ab){
  const h=a.h, g=h.g, w=h.weapon, G_=HGRIP[h.wtype]; const I=G_.idle, A=G_.aim;
  const wx=lerp(I[0],A[0],ab), wy=lerp(I[1],A[1],ab), wz=lerp(I[2],A[2],ab), rx=lerp(I[3],A[3],ab), ry=lerp(I[4],A[4],ab);
  w.position.set(wx,wy,wz); w.rotation.set(rx,ry,0);
  const cx=Math.cos(rx), sx=Math.sin(rx), cy=Math.cos(ry), sy=Math.sin(ry);
  const tp=(p)=>{ const y1=p[1]*cx-p[2]*sx, z1=p[1]*sx+p[2]*cx; const x2=p[0]*cy+z1*sy, z2=-p[0]*sy+z1*cy; return [wx+x2,wy+y1,wz+z2]; };
  const r=tp(G_.R), l=tp(G_.L);
  ikArm(g.shR,g.elR,g.wrR,r[0],r[1],r[2],-.8,-1,-.25);
  ikArm(g.shL,g.elL,g.wrL,l[0],l[1],l[2],.6,-1,-.1);
}
/* ---------- lapidação visual comum a todas as fases ---------- */
function facadeDayTex(){ if(TEX.facadeDay) return TEX.facadeDay; const src=TEX.facade.image; const c=document.createElement('canvas'); c.width=src.width; c.height=src.height; const g=c.getContext('2d'); g.drawImage(src,0,0);
  for(let r=0;r<3;r++) for(let k=0;k<4;k++){ const x=k*128+42, y=r*128+26; const gr=g.createLinearGradient(x,y,x+44,y+72); gr.addColorStop(0,'#9fb4c4'); gr.addColorStop(.45,'#4a5a66'); gr.addColorStop(1,'#25303a'); g.fillStyle=gr; g.fillRect(x,y,44,72); g.fillStyle='rgba(255,255,255,.35)'; g.fillRect(x+4,y+4,10,30); g.fillStyle='rgba(60,50,40,.95)'; g.fillRect(x+20,y,3,72); g.fillRect(x,y+30,44,3);
    if(((r*7+k*3)%5)===0){ g.fillStyle='#e8e2d4'; g.fillRect(x,y,44,22); g.fillStyle='rgba(0,0,0,.15)'; for(let i=0;i<5;i++) g.fillRect(x+i*9,y,1,22); } }
  const t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.magFilter=T.NearestFilter; t.anisotropy=4; t.repeat.copy(TEX.facade.repeat); TEX.facadeDay=t; return t; }
function surrenderTarget(){ const P=G&&G.player; if(!P||P.dead||P.adsT<.4||APP.state!=='PLAYING') return null; const cp=Math.cos(P.pitch), dir=V3(-Math.sin(P.yaw)*cp,Math.sin(P.pitch),-Math.cos(P.yaw)*cp), eyeY=P.pos.y+pStance(CFG.player.eye,CFG.player.eyeCrouch,.42); let best=null, bs=.03;
  for(const e of G.enemies){ if(e.dead||e.surrender||e.isAlly||e.def.melee||e.def.boss||e.def.armor||e.armored||e.dog||e.robot||e.zombie) continue; const tx=e.pos.x-P.pos.x, ty=e.pos.y+1.25-eyeY, tz=e.pos.z-P.pos.z, d=Math.hypot(tx,ty,tz); if(d>9) continue;
    const off=1-(tx*dir.x+ty*dir.y+tz*dir.z)/d; if(off<bs&&segClear2D(P.pos.x,P.pos.z,e.pos.x,e.pos.z,.1,true)){ bs=off; best=e; } } return best; }
function yieldEnemy(e,quiet){ e.usedBackup=true; e.yielded=true; if(e.hasWeapon){ if(quiet) e.layDown(); else e.disarm(V3(Math.sin(e.yaw),0,Math.cos(e.yaw))); } e.backupT=0; e.surrender=true; e.cower=true; e.state='DISARMED'; e.fleeing=false; e.awareness=0; if(!quiet) AudioSys.play('shout',e.pos,.9); limbTag(quiet?'Rendeu-se em silêncio':'Rendeu-se!'); G.stats.surrenders=(G.stats.surrenders||0)+1; }
function demandSurrender(){ const e=surrenderTarget(); if(!e) return; const P=G.player; if((e.surrAskT||-99)>simTime-5){ limbTag('Ele já recusou'); return; } e.surrAskT=simTime;
  const combat=e.state==='COMBAT'||e.state==='RADIO'; const toP=Math.atan2(P.pos.x-e.pos.x,P.pos.z-e.pos.z); const behind=Math.abs(angDiff(e.yaw,toP))>1.9; const dE=Math.hypot(P.pos.x-e.pos.x,P.pos.z-e.pos.z);
  const quiet=!combat&&dE<4.5; if(quiet){ pickupMsg('« Pas un bruit. Les mains. »'); emitNoise(P.pos,1.2,'step',null); } else { pickupMsg('« Haut les mains ! »'); emitNoise(P.pos,7,'step',null); }
  let c=.15; if(!combat) c+=.3; if(!combat&&behind) c+=.3; if(quiet) c+=.15; if(e.hp<e.maxHp*.5) c+=.25; if(!e.hasWeapon) c+=.5; if(e.def.officer) c-=.25; if(P.lantern) c-=.05;
  let buddies=0; for(const o of G.enemies){ if(o===e||o.dead||o.surrender) continue; if(Math.hypot(o.pos.x-e.pos.x,o.pos.z-e.pos.z)<14&&(o.state==='COMBAT'||o.canSeeTarget)) buddies++; } c-=.15*buddies; if(CHEATS.ghost) c+=.3;
  if(Math.random()<clamp(c,.03,.95)) yieldEnemy(e,quiet);
  else { e.state='COMBAT'; e.lastKnown={x:P.pos.x,z:P.pos.z}; e.reactionT=Math.min(e.reactionT||.4,.3); e.aimTarget=1; e.alertLevel=1; AudioSys.play('shout',e.pos,1); limbTag('Ele reagiu!'); } }
function surrenderInteract(){ const near=()=>{ const P=G.player; let b=null,bd=2.2; for(const e of G.enemies){ if(e.dead||!e.surrender) continue; const d=Math.hypot(e.pos.x-P.pos.x,e.pos.z-P.pos.z); if(d<bd){ bd=d; b=e; } } return b; };
  W.interactables.push({id:'surr',pt:()=>{ const e=near(); return e?V3(e.pos.x,1.3,e.pos.z):V3(0,-99,0); },r:2.4,skip:true,label:()=>near()?'Amarrar o soldado rendido':null,hold:()=>.9,use:()=>{ const e=near(); if(!e) return; e.tied=true; e.knockOut(); AudioSys.play('cloth',e.pos,.8); pickupMsg('Soldado amarrado'); }}); }
function ejectCasing(w){ if(w.silent||w.bolt||w.rocket) return; if(Math.random()<.4){ const q=camera.quaternion; const right=V3(1,0,0).applyQuaternion(q), fwd=V3(0,0,-1).applyQuaternion(q), up=V3(0,1,0).applyQuaternion(q); FX.puff(camera.position.clone().addScaledVector(fwd,.95).addScaledVector(right,.12).addScaledVector(up,-.06),1,0x9a9a96,.1,.45,V3(0,.35,0).addScaledVector(fwd,.3),.3); } }
const FOOT_BY_ID={'05':'stone','06':'sand','07':'sand','08':'sand','12':'grass','14':'grass','15':'grass','18':'snow','20':'snow','11':'sand'};
const SURF_NOISE={metal:1.6,wood:1.25,stone:1,cloth:.7,grass:.7,sand:.75,snow:.65};
function footSurf(p){ for(const w of W.walk){ if(w.active===false) continue; if(p.x>=w.minX&&p.x<=w.maxX&&p.z>=w.minZ&&p.z<=w.maxZ&&Math.abs(p.y-w.maxY)<.35) return (w.mesh&&w.mesh.userData.mat)||'stone'; }
  const L=G.level; return L.foot||FOOT_BY_ID[G.levelId]||'stone'; }
let MED_M=null;
function medDress(x0,x1,z0,z1,h){ if(!MED_M){ const sh=[0x2a5a8a,0x2a7a6a,0x3a6a3a,0x6a3a2a,0x2a4a7a]; MED_M={glass:new T.MeshLambertMaterial({color:0x1a2026}),sh:sh.map(c=>new T.MeshLambertMaterial({color:c})),door:new T.MeshLambertMaterial({color:0x5a3a22}),lint:new T.MeshLambertMaterial({map:TEX.lime5,color:0xd8d0c0}),pot:new T.MeshLambertMaterial({color:0xa85a32}),fl:[0xd83a8a,0xe86a2a,0xc82a4a].map(c=>new T.MeshLambertMaterial({color:c})),leaf:new T.MeshLambertMaterial({color:0x3a6a2a}),iron:new T.MeshLambertMaterial({color:0x1e2022})}; }
  const M=MED_M, R=mulberry32(((x0*13+z0*29+h*7)|0)+11); const w=x1-x0, d=z1-z0;
  const faces=[[0,z0,-1,w],[0,z1,1,w],[1,x0,-1,d],[1,x1,1,d]];
  for(const [ax,c,sg,len] of faces){ const shM=M.sh[Math.floor(R()*M.sh.length)]; const n=Math.max(1,Math.floor(len/3.2)); for(let fl=0;fl<4;fl++){ const y=fl===0?1.15:1.9+fl*2.6; if(y+.9>h-.2) break;
      for(let i=0;i<n;i++){ if(R()<.25) continue; const t=-len/2+(i+.5)*(len/n); const isDoor=fl===0&&R()<.35; const ww=isDoor?1.1:.85, hh=isDoor?2.1:1.15, yy=isDoor?1.05:y+.25;
        const at=(ox,oy,oz,bw,bh,bd,mat,ry)=>{ const m=new T.Mesh(BOX(bw,bh,bd),mat); if(ax===0) m.position.set((x0+x1)/2+t+ox,oy,c+sg*oz); else { m.position.set(c+sg*oz,oy,(z0+z1)/2+t+ox); m.rotation.y=Math.PI/2; } if(ry) m.rotation.y+=ry; dressAdd(m); return m; };
        at(0,yy,.02,ww,hh,.06,isDoor?M.door:M.glass); at(0,yy+hh/2+.08,.05,ww+.3,.14,.12,M.lint);
        if(!isDoor){ at(0,yy-hh/2-.05,.08,ww+.2,.08,.18,M.lint); const open=R()<.5; for(const s2 of [-1,1]) at(s2*(ww/2+(open?.25:-.21)),yy,open?.12:.06,.42,hh,.04,shM,open?s2*(ax===0?.0:0):0);
          if(fl>0&&R()<.3){ at(0,yy-hh/2-.02,.35,ww+.6,.06,.6,M.lint); at(0,yy-hh/2+.4,.64,ww+.6,.04,.04,M.iron); for(let k=0;k<3;k++){ const f=at(-ww/2+.1+k*.45,yy-hh/2+.18,.5,.28,.22,.22,M.pot); for(let q=0;q<3;q++) at(-ww/2+.05+k*.45+q*.08,yy-hh/2+.36,.5,.12,.12,.12,M.fl[Math.floor(R()*3)]); } } } } } }
  // parapeito no telhado
  const pm=new T.Mesh(BOX(w+.2,.35,d+.2),M.lint); pm.position.set((x0+x1)/2,h+.05,(z0+z1)/2); dressAdd(pm);
}
function palmTree(x,z,s){ const R=mulberry32(((x*7+z*13)|0)+5); const lean=rnd(-.25,.25); const tr=new T.Mesh(new T.CylinderGeometry(.14*s,.24*s,5*s,7),new T.MeshLambertMaterial({color:0x7a6248})); tr.position.set(x+lean*1.2*s,2.5*s,z); tr.rotation.z=-lean*.5; dressAdd(tr);
  const top=V3(x+lean*2.4*s,5*s,z); const lm=new T.MeshLambertMaterial({color:R()<.5?0x4a7a32:0x3e6a2a,side:T.DoubleSide}); for(let i=0;i<7;i++){ const a=i/7*Math.PI*2+R(); const f=new T.Mesh(new T.PlaneGeometry(.55*s,2.8*s),lm); f.geometry.translate(0,1.4*s,0); f.position.copy(top); f.rotation.set(0,a,0); f.rotateX(1.1+R()*.4); dressAdd(f); } }
function ringAlpine(id){ const N=W.nav.nodes; let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(const n of N){ x0=Math.min(x0,n.x); x1=Math.max(x1,n.x); z0=Math.min(z0,n.z); z1=Math.max(z1,n.z); }
  const snow=['18','20'].includes(id), R=mulberry32(5151+(+id)); const hill=new T.MeshLambertMaterial({color:snow?0xdfe6ee:0x3a4a34}), rock=new T.MeshLambertMaterial({color:snow?0x8a8e94:0x6a6a62}), fir=new T.MeshLambertMaterial({color:0x1e3424}), cap=new T.MeshLambertMaterial({color:0xe8eef4}), trunk=new T.MeshLambertMaterial({color:0x3a2a1e});
  for(let i=0;i<40;i++){ const side=Math.floor(R()*4), t=R(), off=14+R()*40; let x,z; if(side===0){ x=x0+(x1-x0)*t; z=z0-off; } else if(side===1){ x=x0+(x1-x0)*t; z=z1+off; } else if(side===2){ x=x0-off; z=z0+(z1-z0)*t; } else { x=x1+off; z=z0+(z1-z0)*t; }
    if(insideSolid(x,z,3)) continue; const k=R();
    if(k<.35){ const sc=8+R()*16; const m=new T.Mesh(new T.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI/2),hill); m.scale.set(sc,3+R()*8,sc*(.6+R()*.8)); m.position.set(x,-.1,z); dressAdd(m); }
    else if(k<.85){ const s2=.9+R()*.8; const tr=new T.Mesh(new T.CylinderGeometry(.12*s2,.18*s2,1.2*s2,5),trunk); tr.position.set(x,.6*s2,z); dressAdd(tr); for(let j=0;j<3;j++){ const c=new T.Mesh(new T.ConeGeometry((1.5-j*.4)*s2,(1.8-j*.3)*s2,7),fir); c.position.set(x,(1.6+j*1.05)*s2,z); dressAdd(c); if(snow){ const sc2=new T.Mesh(new T.ConeGeometry((1.1-j*.3)*s2,.5*s2,7),cap); sc2.position.set(x,(2.25+j*1.05)*s2,z); dressAdd(sc2); } } }
    else { const sc=1.2+R()*2.6; const m=new T.Mesh(new T.DodecahedronGeometry(sc,0),rock); m.position.set(x,sc*.3,z); m.rotation.set(R()*3,R()*3,R()*3); dressAdd(m); } }
}
function ringBackdrop(id){ const N=W.nav.nodes; if(!N.length) return; let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(const n of N){ x0=Math.min(x0,n.x); x1=Math.max(x1,n.x); z0=Math.min(z0,n.z); z1=Math.max(z1,n.z); }
  if(['12','14','18','20'].includes(id)) return ringAlpine(id);
  const desert=['06','07','08'].includes(id), R=mulberry32(4242+(+id||7)); const sand=new T.MeshLambertMaterial({map:TEX.dust5||null,color:desert?0xc8a070:0x8a8a5a}), rock=new T.MeshLambertMaterial({color:desert?0xa08060:0x8a8070}), olive=new T.MeshLambertMaterial({color:0x5a6a48}), trunk=new T.MeshLambertMaterial({color:0x5a4a3a});
  for(let i=0;i<46;i++){ const side=Math.floor(R()*4), t=R(), off=10+R()*42; let x,z; if(side===0){ x=x0+(x1-x0)*t; z=z0-off; } else if(side===1){ x=x0+(x1-x0)*t; z=z1+off; } else if(side===2){ x=x0-off; z=z0+(z1-z0)*t; } else { x=x1+off; z=z0+(z1-z0)*t; }
    if(insideSolid(x,z,2)) continue; const k=R();
    if(k<.45){ const sc=6+R()*14; const m=new T.Mesh(new T.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI/2),sand); m.scale.set(sc,(desert?1.2:2.4)+R()*(desert?2.4:5),sc*(.6+R()*.8)); m.position.set(x,-.05,z); m.rotation.y=R()*3; dressAdd(m); }
    else if(k<.75){ if(desert) palmTree(x,z,.8+R()*.5); else { const tr=new T.Mesh(new T.CylinderGeometry(.2,.3,1.8,6),trunk); tr.position.set(x,.9,z); dressAdd(tr); const c=new T.Mesh(new T.IcosahedronGeometry(1.6+R()*.6,0),olive); c.position.set(x,2.4,z); c.scale.y=.75; dressAdd(c); } }
    else { const sc=1+R()*2.6; const m=new T.Mesh(new T.DodecahedronGeometry(sc,0),rock); m.position.set(x,sc*.3,z); m.rotation.set(R()*3,R()*3,R()*3); dressAdd(m); } }
}
function polishLevel(L){
  surrenderInteract();
  // fachadas: janelas apagadas e vidro refletindo o céu nas fases de dia
  const day=L.day!==undefined?L.day:(L.baseLight>=.7); for(const k of ['facadeA','facadeB','facadeC']){ const m=MAT[k]; if(!m) continue; const want=day?facadeDayTex():TEX.facade; if(m.map!==want){ m.map=want; if(MAT_HQ&&m.bumpMap) m.bumpMap=want; m.needsUpdate=true; } m.emissiveIntensity=day?0:.8; }
  // gradação: puxa o tom da névoa da fase, com saturação/contraste pelo clima
  if(L.grade) G.grade=L.grade.slice(); else { const f=scene.fog?scene.fog.color:new T.Color(.5,.5,.5); const mx=Math.max(f.r,f.g,f.b,.001); const k=.1; const b=L.baseLight||.4;
    G.grade=[1-k+k*f.r/mx*1.05,1-k+k*f.g/mx*1.02,1-k+k*f.b/mx,b<.3?.9:b<.5?1:1.08,b<.3?1.08:1.04]; }
  // quarteirões de fachada das fases antigas de Paris ganham os mesmos detalhes
  if(['01','02','03','04'].includes(L.id)) for(const so of W.solids.slice()){ const m=so.mesh; if(!m||so.dressed||!Array.isArray(m.material)) continue; if(!['facadeA','facadeB','facadeC'].some(k=>m.material[0]===MAT[k])) continue; const h=so.maxY-so.minY; if(so.minY>.01||h<9||so.maxX-so.minX<3.5||so.maxZ-so.minZ<3.5) continue; so.dressed=true; parisDress(so.minX,so.maxX,so.minZ,so.maxZ,h); }
  if(['05','09','10'].includes(L.id)) for(const so of W.solids.slice()){ const m=so.mesh; if(!m||so.dressed||so.walk||so.door) continue; const h=so.maxY-so.minY, w=so.maxX-so.minX, d=so.maxZ-so.minZ; if(so.minY>.05||h<3.4||h>14||w<3||d<3||m.userData.mat==='wood'||m.userData.mat==='metal') continue; so.dressed=true; medDress(so.minX,so.maxX,so.minZ,so.maxZ,h); }
  if(['06','07','08','11','10','09','12','14','15','17','18','20','24'].includes(L.id)) ringBackdrop(L.id);
  if(['16','19'].includes(L.id)) scene.add(new T.HemisphereLight(0x8a7a60,0x221a12,.2));
  if(L.id==='13') interiorDress('castle',6); if(L.id==='16') interiorDress('abbey',3.4);
  streetLife();
  if(['07','10','11','12','14'].includes(L.id)){ scene.add(new T.HemisphereLight(0x7088c0,0x30281c,.38)); const mn=new T.DirectionalLight(0x9aaee0,.22); mn.position.set(-30,60,-20); scene.add(mn); }
  mergeDress();
  // poeira no ar em interiores
  G.motes=null; if(L.motes||['crypt'].includes(L.ambient)||['13','16','19','S1','S2','S3','05','06'].includes(L.id)) G.motes=makeMotes(500);
}
function makeMotes(n){ const g=new T.BufferGeometry(), p=new Float32Array(n*3), ph=new Float32Array(n); for(let i=0;i<n;i++){ p[i*3]=rnd(-9,9); p[i*3+1]=rnd(.2,4.5); p[i*3+2]=rnd(-9,9); ph[i]=Math.random()*6.28; } g.setAttribute('position',new T.BufferAttribute(p,3)); const m=new T.Points(g,new T.PointsMaterial({color:0xffe8c0,size:.025,transparent:true,opacity:.5,depthWrite:false,blending:T.AdditiveBlending})); m.frustumCulled=false; m.userData.ph=ph; scene.add(m); return m; }
function motesTick(dt){ const M=G&&G.motes; if(!M) return; const a=M.geometry.attributes.position, p=a.array, ph=M.userData.ph, c=camera.position; for(let i=0,j=0;i<p.length;i+=3,j++){ p[i]+=Math.sin(simTime*.3+ph[j])*dt*.05; p[i+1]+=Math.sin(simTime*.21+ph[j]*1.7)*dt*.04; p[i+2]+=Math.cos(simTime*.27+ph[j])*dt*.05; } const ox=Math.round(c.x/6)*6, oz=Math.round(c.z/6)*6; M.position.set(ox,0,oz); a.needsUpdate=true; }
function separateActor(a){
  for(const b of G.actors){ if(b===a||b.dead) continue; const dx=a.pos.x-b.pos.x, dz=a.pos.z-b.pos.z, d=Math.hypot(dx,dz); if(d>0&&d<.62){ const k=(.62-d)/d*.5; a.pos.x+=dx*k; a.pos.z+=dz*k; } }
  const P=G.player.pos; const dx=a.pos.x-P.x, dz=a.pos.z-P.z, d=Math.hypot(dx,dz); if(d>0&&d<.66){ const k=(.66-d)/d; a.pos.x+=dx*k; a.pos.z+=dz*k; }
}

/* ---------------- INIMIGO ---------------- */
const SKINS=[0xc9a07a,0xb88a66,0xd4ae8a,0xbf9470], HAIRS=[0x2e2117,0x5b4128,0x1e1a17,0x7a6040];
class Enemy extends Actor{
  constructor(def){
    const r=mulberry32(def.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0));
    const tro=!!(def.tropical||(G&&G.level&&G.level.tropical));
    super(def,Object.assign({uniform:tro?(def.officer?0x8a7a54:0x9c8a5e):def.officer?0x3a3e36:0x4a5040,pants:tro?(def.officer?0x6e6248:0x857452):def.officer?0x2b2d29:0x3f4537,skin:pick(SKINS,r),hair:pick(HAIRS,r),helmet:!!def.helmet,helmetColor:tro?0x9a8a64:0,capColor:tro?0xa08e62:0,cap:def.officer?'officer':(def.helmet?null:'field'),weapon:def.weapon,boots:true,lantern:!!def.lantern},(def.faction==='it'&&typeof IT_LOOK!=='undefined')?IT_LOOK:{},def.look||{}));
    this.isEnemy=true; this.type=def.weapon; this.ew=EW[def.weapon]; this.officer=!!def.officer;
    this.hasWeapon=true; this.mag=this.ew.mag; this.reloadT=0; this.shotCD=0; this.burstLeft=0;
    this.helmetState=def.helmet?'ATTACHED':'NONE'; this.helmetDur=CFG.helmet.durability; this.hasCap=!!this.h.cap;
    this.post={x:def.x,z:def.z,yaw:def.yaw||0}; this.patrol=def.patrol||null; this.patrolI=0; this.waitT=0;
    this.state=this.patrol?'PATROL':'IDLE';
    this.awareness=0; this.alertLevel=0; this.lastKnown=null; this.lostT=0; this.reactionT=0; this.thinkT=Math.random()*.3; this.thinkDt=.2;
    this.target=null; this.tgtKind=null; this.canSeeTarget=false; this.cover=null; this.coverT=0; this.peekT=0; this.exposed=true; this.atCover=false;
    this.searchT=0; this.lookT=0; this.invPoint=null; this.handHits=0; this.staggerHist=[]; this.radioT=0; this.radioTried=false; this.painCD=0; this.cower=false; this.cowerT=0;
    this.nades=def.nades||0; this.fleeT=0; this.fleeFrom=null; this.droppedWeapon=null; this.strafeDir=Math.random()<.5?1:-1; this.strafeT=0;
    if(this.patrol) this.setPath(this.patrol[0][0],this.patrol[0][1]);
    this.asleep=!!def.sleep; if(this.asleep){ this.crouchTarget=.85; this.crouch=.85; this.doze=1; }
  }
  wake(){ if(!this.asleep) return; this.asleep=false; this.doze=0; this.crouchTarget=0; AudioSys.play('grunt',this.pos); }
  knockOut(){
    if(this.dead) return; G.koT=simTime; this.dead=true; this.ko=true; this.hp=0; this.state='DEAD'; this.deathT=0; this.fallSign=1; this.fallSide=rnd(-.5,.5);
    this.releaseCover(); this.cower=false; this.asleep=false; this.doze=0; if(this.h.lanternLight&&!this.lanternBroken) this.h.lanternLight.intensity=.3;
    G.stats.takedowns++; AudioSys.play('thud',this.pos); emitNoise(this.pos,2.4,'step',this); spawnDrop(this);
  }
  visibility(tx,tz,info){
    if(CHEATS.ghost&&this.state!=='COMBAT') return 0;
    const dx=tx-this.pos.x, dz=tz-this.pos.z, dist=Math.hypot(dx,dz);
    const combat=this.state==='COMBAT'||this.state==='RADIO';
    let lt=info.light; if(this.h.lanternLight&&!this.lanternBroken) lt=Math.max(lt,clamp(1-dist/9,0,1)*.75);
    let range=combat?48:(6+26*lt)*D().perception*(info.prone?.4:info.crouch?.62:1)*(info.sprint?1.25:info.moving?1:.85)*(this.alertLevel?1.3:1);
    range*=((G.level&&G.level.sightMul)||1)*(this.def.sight||1);
    if(dist>range) return 0;
    const fov=combat?110*DEG:(this.state==='INVESTIGATE'||this.state==='SEARCH')?78*DEG:56*DEG;
    const ang=Math.abs(angDiff(this.yaw+this.headYaw,Math.atan2(dx,dz)));
    if(ang>fov && dist>2.2) return 0;
    const ey=this.eyeY();
    const blockedHead=segFirst(this.pos.x,ey,this.pos.z,tx,info.head,tz,s=>!s.door||s.active);
    const blockedChest=segFirst(this.pos.x,ey,this.pos.z,tx,info.chest,tz);
    if(blockedHead&&blockedChest) return 0;
    if(combat) return 1;
    return clamp(1-dist/range,0,1)*(ang<28*DEG?1:.55)+.12;
  }
  think(){
    if(this.asleep){ this.thinkT=.5; return; }
    const dt=this.thinkDt, P=G.player, A=G.ally;
    const pInfo=playerTargetInfo();
    const pv=P.dead?0:this.visibility(P.pos.x,P.pos.z,pInfo);
    const av=(A&&A.targetable())?this.visibility(A.pos.x,A.pos.z,A.targetInfo()):0;
    const dP=Math.hypot(P.pos.x-this.pos.x,P.pos.z-this.pos.z);
    if(disguiseOn()&&this.state!=='COMBAT'&&this.state!=='RADIO'&&this.state!=='DISARMED'&&this.state!=='RECOVER'){ this.disguiseThink(pv,dP,dt); if(this.state!=='COMBAT'){ if(this.state!=='INSPECT') this.checkCorpses(); this.thinkDt=dP<30?.2:.55; this.thinkT=this.thinkDt; return; } }
    if(this.state==='COMBAT'||this.state==='RADIO'){
      let t=null;
      if(pv>0 && (av<=0 || dP<=Math.hypot(A.pos.x-this.pos.x,A.pos.z-this.pos.z)+3)) t='player'; else if(av>0) t='ally';
      this.tgtKind=t; this.canSeeTarget=!!t;
      if(t){ const tp=t==='player'?P.pos:A.pos; this.lastKnown={x:tp.x,z:tp.z}; this.lostT=0; }
      else { this.lostT+=dt; if(this.lostT>6.5 && this.state==='COMBAT') this.toSearch(); }
      if(this.state==='COMBAT'){
        this.coverT-=dt; if(this.coverT<=0){ this.coverT=rnd(3,4.5); this.pickCover(); }
        if(this.nades) this.nadeThink();
        if(this.officer && !this.def.faction && !G.alarm && !G.radioDead && !this.radioTried && this.hasWeapon && dP>5){ this.state='RADIO'; this.radioTried=true; this.radioT=0; this.setPath(G.level.radio.x,G.level.radio.z); G.radioMsg('RÁDIO',G.level.radioRun,'warn'); }
      }
    } else if(this.state!=='DISARMED' && this.state!=='RECOVER'){
      if(pv>0){ this.awareness+=pv*dt*1.8*D().perception+(dP<2.6?1:0); }
      else this.awareness=Math.max(0,this.awareness-dt*.1);
      if(this.awareness>=1) this.enterCombat(P.pos.x,P.pos.z);
      else if(this.awareness>=.4 && pv>0 && (this.state==='PATROL'||this.state==='IDLE'||this.state==='RETURN'||this.state==='INVESTIGATE')){
        if(!this.invPoint||Math.hypot(this.invPoint.x-P.pos.x,this.invPoint.z-P.pos.z)>2.5) this.toInvestigate(P.pos.x,P.pos.z);
      }
      if(this.state!=='COMBAT') this.checkCorpses();
    }
    const near=dP<30; this.thinkDt=near?.2:.55; this.thinkT=this.thinkDt;
  }
  checkCorpses(){
    for(const e of G.enemies){
      if(!e.dead||e.gone||e===this||G.discovered.has(e.id)) continue;
      const dx=e.pos.x-this.pos.x, dz=e.pos.z-this.pos.z, d=Math.hypot(dx,dz); if(d>14) continue;
      if(Math.abs(angDiff(this.yaw,Math.atan2(dx,dz)))>65*DEG) continue;
      if(segFirst(this.pos.x,this.eyeY(),this.pos.z,e.pos.x,e.pos.y+.3,e.pos.z)) continue;
      G.discovered.add(e.id); this.alertLevel=1; this.awareness=Math.max(this.awareness,.6);
      AudioSys.play('shout',this.pos); this.toInvestigate(e.pos.x,e.pos.z); this.searchT=12; return;
    }
  }
  enterCombat(x,z,shared,force){
    if(this.dead||this.state==='DISARMED'||this.state==='RECOVER') return;
    if(disguiseOn()&&!force&&this.state!=='COMBAT'&&this.state!=='RADIO'){ this.alertLevel=1; this.awareness=Math.max(this.awareness,.9); if(this.state!=='INSPECT') this.toInvestigate(x,z); return; }
    this.wake();
    if(this.state==='COMBAT'||this.state==='RADIO'){ if(!this.canSeeTarget) this.lastKnown={x,z}; return; }
    this.state='COMBAT'; this.awareness=1; this.alertLevel=1; this.lastKnown={x,z}; this.lostT=0; this.coverT=0; this.path=null; this.aimTarget=1;
    this.reactionT=D().react*rnd(.85,1.3)+(shared?.35:0);
    G.stats.alerts++; G.combatT=9;
    if(!shared){ AudioSys.play('shout',this.pos); this.alertNearby(); }
  }
  alertNearby(){
    for(const e of G.enemies){
      if(e===this||e.dead||(e.def.faction||'')!==(this.def.faction||'')) continue; const d=this.pos.distanceTo(e.pos);
      if((d<9&&Math.abs(e.pos.y-this.pos.y)<2) || (d<22 && !segFirst(this.pos.x,this.pos.y+1.5,this.pos.z,e.pos.x,e.pos.y+1.5,e.pos.z))) e.enterCombat(this.lastKnown.x,this.lastKnown.z,true);
    }
  }
  toInvestigate(x,z){ this.wake(); this.state='INVESTIGATE'; this.invPoint={x,z}; this.setPath(x,z); this.lookT=0; this.aimTarget=.7; }
  toSearch(){ this.state='SEARCH'; this.searchT=14; this.lookT=0; if(this.lastKnown) this.setPath(this.lastKnown.x,this.lastKnown.z); this.releaseCover(); this.aimTarget=.8; this.crouchTarget=0; }
  toReturn(){ this.state='RETURN'; this.setPath(this.post.x,this.post.z); this.aimTarget=0; this.crouchTarget=0; this.invPoint=null; }
  releaseCover(){ if(this.cover&&this.cover.occupant===this) this.cover.occupant=null; this.cover=null; this.atCover=false; }
  pickCover(){
    const th=this.lastKnown; if(!th){ this.releaseCover(); return; }
    let best=null, bs=1e9;
    for(const c of W.covers){
      if(c.occupant&&c.occupant!==this&&!c.occupant.dead) continue;
      const dx=th.x-c.x, dz=th.z-c.z, d=Math.hypot(dx,dz); if(d<3.5||d>32) continue;
      if((dx*c.nx+dz*c.nz)/d<.55) continue;
      const dm=Math.hypot(c.x-this.pos.x,c.z-this.pos.z); if(dm>(this.limbW('leg')>.6?6.5:14)) continue; if(W.walk.length&&Math.abs(heightAt(c.x,c.z)-this.pos.y)>1.5) continue;
      const sc=dm+Math.abs(d-11)*.3+(c===this.cover?-2:0); if(sc<bs){ bs=sc; best=c; }
    }
    if(best===this.cover) return;
    this.releaseCover(); this.cover=best;
    if(best){ best.occupant=this; this.setPath(best.x,best.z); }
  }
  targetPoint(){
    const P=G.player, A=G.ally;
    if(this.tgtKind==='ally'&&A){ return {x:A.pos.x,z:A.pos.z,chest:A.pos.y+lerp(1.25,.8,A.crouch),head:A.pos.y+lerp(1.65,1.1,A.crouch)}; }
    const ch=P.pos.y+pStance(1.2,.75,.3), hd=P.pos.y+pStance(1.6,1.05,.4);
    return {x:P.pos.x,z:P.pos.z,chest:ch,head:hd};
  }
  update(dt){
    if(this.dead){ if(this.gone) return; this.animate(dt); if(settings.bodies!=='ficam') this.fadeBody(); return; }
    if(this.asleep){ this.moveDir(0,0,0,dt); this.animate(dt); return; }
    this.aimPenalty=Math.max(0,this.aimPenalty-dt*.35); this.movePenalty=Math.max(0,this.movePenalty-dt*.25); this.suppression=Math.max(0,this.suppression-dt*.28);
    if(this.wounds) this.woundTick(dt);
    this.staggerT=Math.max(0,this.staggerT-dt); this.kneelT=Math.max(0,this.kneelT-dt); this.curl=Math.max(0,this.curl-dt*1.2);
    this.reactionT-=dt; this.shotCD-=dt; this.painCD-=dt;
    if(this.reloadT>0){ this.reloadT-=dt; if(this.reloadT<=0) this.mag=this.ew.mag; }
    this.thinkT-=dt; if(this.thinkT<=0) this.think();
    if(this.fleeT>0){ this.fleeStep(dt); this.animate(dt); return; }
    const walk=1.35, run=3.4*this.speedMul();
    switch(this.state){
      case 'PATROL':
        this.aimTarget=0; this.crouchTarget=0;
        if(this.waitT>0){ this.waitT-=dt; this.headYaw=Math.sin(this.waitT*1.3)*.6; this.moveDir(0,0,0,dt); }
        else { this.headYaw*=.9; if(this.followPath(walk*this.speedMul(),dt)){ this.waitT=2.4; this.patrolI=(this.patrolI+1)%this.patrol.length; const p=this.patrol[this.patrolI]; this.setPath(p[0],p[1]); } }
        break;
      case 'IDLE':
        this.aimTarget=0;
        if(Math.hypot(this.post.x-this.pos.x,this.post.z-this.pos.z)>.6){ if(!this.path||this.pathI>=this.path.length) this.setPath(this.post.x,this.post.z); this.followPath(walk,dt); }
        else { this.moveDir(0,0,0,dt); this.yaw+=clamp(angDiff(this.yaw,this.post.yaw),-2*dt,2*dt); this.headYaw=Math.sin(simTime*.35+this.walkPhase)*.55; }
        break;
      case 'INVESTIGATE':
        this.crouchTarget=0;
        if(this.followPath(1.9*this.speedMul(),dt)){ this.lookT+=dt; this.headYaw=Math.sin(this.lookT*1.4)*.9; if(this.lookT>4.5){ this.awareness*=.5; this.toReturn(); } }
        else this.headYaw*=.9;
        break;
      case 'SEARCH':
        this.searchT-=dt;
        if(this.followPath(2.2*this.speedMul(),dt)){ this.lookT+=dt; this.headYaw=Math.sin(this.lookT*1.2)*1; if(this.lookT>4){ this.lookT=0; const n=W.nav.nodes[Math.floor(Math.random()*W.nav.nodes.length)]; if(Math.hypot(n.x-this.pos.x,n.z-this.pos.z)<16) this.setPath(n.x,n.z); } }
        if(this.searchT<=0){ this.alertLevel=1; this.toReturn(); }
        break;
      case 'RETURN':
        this.headYaw*=.9;
        if(this.followPath(walk*1.1,dt)){ this.state=this.patrol?'PATROL':'IDLE'; if(this.patrol){ const p=this.patrol[this.patrolI]; this.setPath(p[0],p[1]); } }
        break;
      case 'COMBAT': this.combatStep(dt,run); break;
      case 'RADIO': this.radioStep(dt,run); break;
      case 'INSPECT': this.inspectStep(dt); break;
      case 'DISARMED': this.disarmedStep(dt); break;
      case 'RECOVER':
        if(!this.droppedWeapon||this.droppedWeapon.removed){ this.state='DISARMED'; break; }
        if(this.followPath(3*this.speedMul(),dt) || this.pos.distanceTo(this.droppedWeapon.mesh.position)<.9){ this.rearm(); }
        break;
    }
    this.animate(dt);
  }
  combatStep(dt,run){
    const tp=this.lastKnown;
    if(this.staggerT<=0 && this.kneelT<=0){
      if(this.cover){
        const arrived=this.followPath(run,dt,false);
        if(arrived){
          this.atCover=true; this.peekT-=dt;
          if(this.peekT<=0){ this.exposed=!this.exposed; this.peekT=this.exposed?rnd(1.5,3):rnd(1,2.2)*(1+this.suppression); }
          if(this.suppression>.85) this.exposed=false;
          this.crouchTarget=this.exposed?(this.cover.h<1.2?.15:0):1;
          if(this.exposed && this.cover.h<1.2 && this.cover.h>.8) this.crouchTarget=.45;
        } else { this.exposed=true; this.crouchTarget=0; }
      } else if(tp){
        const d=Math.hypot(tp.x-this.pos.x,tp.z-this.pos.z);
        const lw=this.limbW('leg'); this.exposed=true; this.crouchTarget=this.suppression>.6?1:(lw>.5?.7:0);
        if(d>17||!this.canSeeTarget){ this.repathT-=dt; if(this.repathT<=0||!this.path){ this.setPath(tp.x,tp.z); this.repathT=1.2; } this.followPath(run,dt,false); }
        else if(d<4.5){ this.moveDir(this.pos.x-tp.x,this.pos.z-tp.z,1.6*this.speedMul(),dt); }
        else if(lw>.5){ this.moveDir(0,0,0,dt); }
        else { this.strafeT-=dt; if(this.strafeT<=0){ this.strafeT=rnd(1.2,2.6); this.strafeDir*=-1; } const ux=(tp.z-this.pos.z)/d*this.strafeDir, uz=-(tp.x-this.pos.x)/d*this.strafeDir; if(this.crouchTarget<.5) this.moveDir(ux,uz,1.1*this.speedMul(),dt); else this.moveDir(0,0,0,dt); }
      }
    } else this.moveDir(0,0,0,dt);
    if(tp){ const look=this.canSeeTarget?this.targetPoint():tp; this.faceTowards(look.x,look.z,dt,6.5); }
    this.headYaw*=.85; this.aimTarget=this.hasWeapon?1:0;
    this.tryShoot();
  }
  radioStep(dt,run){
    if(G.radioDead||G.alarm){ this.state='COMBAT'; return; }
    if(this.followPath(run,dt)){ this.faceTowards(G.level.radio.fx,G.level.radio.fz,dt,5); this.aimTarget=0; this.radioT+=dt; if(this.radioT>3.2) raiseAlarm(); }
    else if(this.canSeeTarget && Math.hypot(G.player.pos.x-this.pos.x,G.player.pos.z-this.pos.z)<5){ this.state='COMBAT'; }
  }
  drawBackup(){
    this.usedBackup=true; this.backupT=0; const h=this.h, wm=hm(0x232527); const grp=new T.Group(); grp.position.set(-.08,.0,.2); h.g.chest.add(grp);
    const ms=[]; for(const [w,hh,d,x,y,z] of [[.04,.1,.06,0,-.03,.05],[.035,.04,.16,0,.02,.1]]){ const o=new T.Mesh(BOX(w,hh,d),wm); o.position.set(x,y,z); grp.add(o); o.userData={char:this,region:'equipment',equip:'weapon'}; ms.push(o); h.hitMeshes.push(o); W.shootables.push(o); }
    const mz=new T.Object3D(); mz.position.set(0,.02,.2); grp.add(mz);
    h.weapon=grp; h.weaponMeshes=ms; h.muzzle=mz; h.wtype='pistol'; h.weaponHome={pos:grp.position.clone(),rot:grp.rotation.clone()};
    this.ew=EW.pistol; this.mag=this.ew.mag; this.hasWeapon=true; this.droppedWeapon=null; this.fleeing=false; this.cower=false; this.surrender=false;
    this.state='COMBAT'; this.lastKnown={x:G.player.pos.x,z:G.player.pos.z}; this.reactionT=.45; this.aimTarget=1; AudioSys.play('chamber',this.pos,1); if(APP.state==='PLAYING') limbTag('Sacou a pistola reserva!');
  }
  disarmedStep(dt){
    this.aimTarget=0;
    if(this.backupT>0){ this.backupT-=dt; if(this.backupT<=0){ this.drawBackup(); return; } }
    { const P=G.player, d=Math.hypot(P.pos.x-this.pos.x,P.pos.z-this.pos.z); if(!this.def.melee&&!(this.backupT>0)&&!P.dead&&(d<9||(this.surrender&&d<(this.yielded?22:15)))){ if(!this.surrender){ this.surrender=true; AudioSys.play('shout',this.pos,.9); if(APP.state==='PLAYING') limbTag('Rendendo-se'); } this.cower=true; this.crouchTarget=0; this.moveDir(0,0,0,dt); this.faceTowards(P.pos.x,P.pos.z,dt,4); this.fleeing=false; return; } else if(this.surrender){ this.surrender=false; this.cower=false; } }
    if(!this.fleeing){
      const P=G.player.pos; let best=null, bd=-1;
      for(const n of W.nav.nodes){ const dm=Math.hypot(n.x-this.pos.x,n.z-this.pos.z); if(dm>18) continue; const dp=Math.hypot(n.x-P.x,n.z-P.z); if(dp>bd){ bd=dp; best=n; } }
      if(best) this.setPath(best.x,best.z); this.fleeing=true; this.cowerT=0;
    }
    if(this.followPath(3.6*this.speedMul(),dt)){
      this.crouchTarget=1; this.cowerT+=dt; this.cower=this.cowerT<4;
      const w=this.droppedWeapon;
      if(this.cowerT>6 && w && !w.removed && G.player.pos.distanceTo(w.mesh.position)>8){ this.state='RECOVER'; this.cower=false; this.crouchTarget=0; this.setPath(w.mesh.position.x,w.mesh.position.z); }
    }
  }
  rearm(){
    const w=this.droppedWeapon; if(!w||w.removed){ this.state='DISARMED'; return; }
    removeProp(w); W.props=W.props.filter(p=>p!==w);
    const wp=this.h.weapon; this.h.g.chest.add(wp); wp.position.copy(this.h.weaponHome.pos); wp.rotation.copy(this.h.weaponHome.rot); wp.quaternion.setFromEuler(wp.rotation);
    for(const m of this.h.weaponMeshes) W.shootables.push(m);
    this.hasWeapon=true; this.droppedWeapon=null; this.fleeing=false; this.cower=false; this.mag=this.ew.mag;
    this.state='COMBAT'; this.lastKnown={x:G.player.pos.x,z:G.player.pos.z}; this.reactionT=.6; this.aimTarget=1;
  }
  tryShoot(){
    if(!this.hasWeapon||!this.canSeeTarget||this.reactionT>0||this.staggerT>0||this.reloadT>0) return;
    if(this.cover&&this.atCover&&!this.exposed) return;
    const t=this.targetPoint(); if(Math.abs(angDiff(this.yaw,Math.atan2(t.x-this.pos.x,t.z-this.pos.z)))>.22) return;
    if(this.shotCD>0) return;
    if(this.mag<=0){ this.reloadT=this.ew.reload*(1+.7*this.limbW('arm')); this.burstLeft=0; return; }
    if(this.burstLeft<=0) this.burstLeft=Math.round(rnd(this.ew.burst[0],this.ew.burst[1]));
    if(!this.fireAt(t)){ this.shotCD=.4; this.strafeT=0; return; }
    this.mag--; this.burstLeft--;
    this.shotCD=(this.burstLeft>0?this.ew.interval:(this.ew.pause?rnd(this.ew.pause[0],this.ew.pause[1]):this.ew.interval*rnd(.9,1.4)))*(1+.6*this.limbW('armR'));
  }
  fireAt(t){
    const m=this.muzzleWorld();
    const aimY=segFirst(m.x,m.y,m.z,t.x,t.chest,t.z)?t.head-.08:t.chest;
    const aim=V3(t.x,aimY,t.z);
    // não atira através de companheiros
    for(const e of G.enemies){ if(e===this||e.dead) continue; if(distPointSeg(V3(e.pos.x,e.pos.y+1.2,e.pos.z),m,aim)<.5 && e.pos.distanceTo(this.pos)<m.distanceTo(aim)) return false; }
    const P=G.player; const moving=Math.hypot(P.vx,P.vz)>1.2;
    let spread=this.ew.spread*D().spread*(1+this.aimPenalty*1.5)*(1+this.suppression*1.1)*(moving&&this.tgtKind==='player'?1.35:1);
    if(this.reactionT>-1.2) spread*=1.7;
    const dir=aim.clone().sub(m).normalize(); jitterDir(dir,spread*DEG,Math.random);
    const maxT=90; const end=m.clone().addScaledVector(dir,maxT);
    const wh=segFirst(m.x,m.y,m.z,end.x,end.y,end.z); const tw=wh?wh.t*maxT:maxT;
    let who=null, th=Infinity;
    if(!P.dead){ const tp=rayCylinder(m,dir,tw,P.pos.x,P.pos.z,.33,P.pos.y,P.pos.y+pStance(1.75,1.15,.55)); if(tp>=0){ who='player'; th=tp; } }
    const A=G.ally; if(A&&!A.downed&&!A.dead){ const ta=rayCylinder(m,dir,Math.min(tw,th),A.pos.x,A.pos.z,.3,0,lerp(1.8,1.2,A.crouch)); if(ta>=0){ who='ally'; th=ta; } }
    const hitT=Math.min(th,tw); const hp=m.clone().addScaledVector(dir,hitT); if(W.glass.length) glassAlongSeg(m,hp);
    const dmg=this.ew.dmg*D().dmg;
    if(who==='player') hurtPlayer(dmg,this.pos);
    else if(who==='ally') A.takeDamage({dmg:dmg*.8,dir,shooter:this});
    else if(wh){ const n=V3(); n.setComponent(wh.axis<0?1:wh.axis,wh.sign||1); worldImpact(hp,n,wh.solid.mesh?wh.solid.mesh.userData.mat:'stone',true); }
    if(!who && !P.dead){ const eye=V3(P.pos.x,P.pos.y+pStance(CFG.player.eye,CFG.player.eyeCrouch,.42),P.pos.z); if(distPointSeg(eye,m,hp)<1.1){ AudioSys.play('whiz',eye); G.player.suppress=Math.min(1,G.player.suppress+.35); } }
    FX.tracer(m,hp); FX.flash(m); FX.puff(m,1,0x8a8a8a,.18,1,V3(0,.3,0),.3);
    AudioSys.play('eshot',m);
    emitNoise(this.pos,this.ew.noise,'enemyshot',this);
    return true;
  }
  /* ---- dano e reações localizadas ---- */
  takeDamage(o){
    if(this.dead) return false;
    const dmg=o.dmg; this.hp-=dmg; this.lastHit={region:o.region,dmg}; this.lastHitBy=o.shooter==='player'?'player':'other';
    const {lx,lz}=this.localDir(o.dir);
    if(this.hp<=0){ this.die(o.dir,o.region); return true; }
    if(o.shooter==='player'&&disguiseOn()&&this.hp>0) blowDisguise(this,'atacada');
    if(o.shooter==='player'||o.shooter===G.ally){ const s0=o.shooter==='player'?G.player.pos:G.ally.pos, dd=Math.hypot(s0.x-this.pos.x,s0.z-this.pos.z), fk=dd>40?dd*.22:0, s={x:s0.x+rnd(-fk,fk),z:s0.z+rnd(-fk,fk)}; this.enterCombat(s.x,s.z,false); this.lastKnown={x:s.x,z:s.z}; this.reactionT=Math.max(this.reactionT,.35); }
    if(this.state==='RADIO') this.radioT=0;
    if(this.painCD<=0){ AudioSys.play('grunt',this.pos); this.painCD=.7; }
    if(settings.blood!=='off' && o.point) FX.burst(o.point,3,0x5a1410,1.2,.35);
    const now=simTime, anim=now-this.lastFlinch>CFG.flinchCooldown; if(anim) this.lastFlinch=now;
    const r=this.react, reg=o.region, side=reg.endsWith('_L')?'L':reg.endsWith('_R')?'R':'';
    const sev=anim?1:.35;
    const stagger=(t)=>{ const n=simTime; this.staggerHist=this.staggerHist.filter(x=>n-x<3); if(this.staggerHist.length>=2){ this.pickCover(); return; } this.staggerHist.push(n); this.staggerT=Math.max(this.staggerT,t); };
    const fb=lz<0?1:-1;
    switch(reg){
      case 'head': case 'neck': r.hx+=lz*.9*sev; r.hz+=-lx*.6*sev; r.sx+=lz*.2*sev; this.aimPenalty=Math.min(1.5,this.aimPenalty+.6); this.burstLeft=0; break;
      case 'chest': r.sx+=lz*.38*sev; r.sz+=-lx*.25*sev; r.sy+=-lx*.25*sev; this.aimPenalty=Math.min(1.5,this.aimPenalty+.3); this.burstLeft=0; break;
      case 'abdomen': this.curl=Math.min(1,this.curl+.8*sev); r.sy+=-lx*.2*sev; this.aimPenalty=Math.min(1.5,this.aimPenalty+.4); this.burstLeft=0; break;
      case 'pelvis': stagger(.6); r.pz+=lx*.5*sev; r.kL+=.35*sev; r.kR+=.35*sev; this.movePenalty=Math.min(1,this.movePenalty+.5); break;
      case 'upperArm_L': case 'forearm_L': r.aL+=.8*sev; r.sy+=fb*.4*sev; r.sz+=.08*sev; this.aimPenalty=Math.min(1.5,this.aimPenalty+(reg[0]==='f'?.9:.7)); if(this.reloadT>0) this.reloadT+=.4; if(this.hasWeapon&&!this.armored&&Math.random()<(reg[0]==='f'?.35:.2)) this.disarm(o.dir); break;
      case 'upperArm_R': case 'forearm_R': r.aR+=.8*sev; r.sy+=-fb*.4*sev; r.sz+=-.08*sev; this.aimPenalty=Math.min(1.5,this.aimPenalty+(reg[0]==='f'?.9:.7)); if(this.reloadT>0) this.reloadT+=.6; this.burstLeft=0; this.shotCD=Math.max(this.shotCD,.45); if(this.hasWeapon&&!this.armored&&Math.random()<(reg[0]==='f'?.55:.3)) this.disarm(o.dir); break;
      case 'hand_L': r.aL+=.55*sev; r.sy+=fb*.15*sev; this.aimPenalty=Math.min(1.5,this.aimPenalty+.6); if(this.hasWeapon&&Math.random()<.35) this.disarm(o.dir); break;
      case 'hand_R': r.aR+=.55*sev; r.sy+=-fb*.15*sev; this.aimPenalty=Math.min(1.5,this.aimPenalty+.8); this.handHits++; this.burstLeft=0; if(this.hasWeapon) this.disarm(o.dir); break;
      case 'thigh_L': case 'thigh_R': r['l'+side]+=-.6*sev; r['k'+side]+=.5*sev; r.pz+=(side==='L'?.25:-.25)*sev; this.movePenalty=Math.min(1,this.movePenalty+.6); if(dmg>15) stagger(.65); break;
      case 'shin_L': case 'shin_R': r['l'+side]+=-.4*sev; r['k'+side]+=.8*sev; this.movePenalty=Math.min(1,this.movePenalty+.6); if(dmg>=12){ this.kneelT=Math.max(this.kneelT,1.3); } else stagger(.5); break;
      case 'foot_L': case 'foot_R': r['l'+side]+=-.3*sev; r['k'+side]+=.45*sev; this.movePenalty=Math.min(1,this.movePenalty+.4); stagger(.4); break;
    }
    this.woundLimb(reg,dmg,o);
    return false;
  }
  layDown(){ if(!this.hasWeapon) return; this.hasWeapon=false; ensureMatrices(); const wp=this.h.weapon; removeShootables(this.h.weaponMeshes); scene.attach(wp); const f=V3(Math.sin(this.yaw),0,Math.cos(this.yaw)); wp.position.set(this.pos.x+f.x*.55,(this.pos.y||0)+.3,this.pos.z+f.z*.55); wp.rotation.set(0,this.yaw,0); this.droppedWeapon=addProp(wp,{vel:V3(0,0,0),ang:V3(0,0,0),radius:.06,kind:'weapon',snd:'cloth',owner:this}); this.releaseCover(); this.burstLeft=0; this.reloadT=0; }
  disarm(dir){
    if(!this.hasWeapon) return;
    this.hasWeapon=false; G.stats.disarms++;
    ensureMatrices();
    const wp=this.h.weapon; removeShootables(this.h.weaponMeshes); scene.attach(wp);
    const v=V3(dir.x*1.2+rnd(-.5,.5),1.6,dir.z*1.2+rnd(-.5,.5));
    this.droppedWeapon=addProp(wp,{vel:v,ang:V3(rnd(-6,6),rnd(-4,4),rnd(-6,6)),radius:.06,kind:'weapon',snd:'wood',owner:this});
    this.releaseCover(); this.state='DISARMED'; this.fleeing=false; this.burstLeft=0; this.reloadT=0;
    this.backupT=(!this.usedBackup&&!this.def.melee&&!this.isAlly&&Math.random()<(this.def.officer?.75:.3))?1.1+Math.random()*.8:0;
    lastShotLog('desarmado: arma caiu como objeto físico'); if(APP.state==='PLAYING') limbTag('Desarmado');
  }
  die(dir,region){
    if(this.dead) return; this.dead=true; this.hp=0; this.state='DEAD'; this.deathT=0;
    const {lx,lz}=dir?this.localDir(dir):{lx:0,lz:-1};
    this.fallSign=lz<0?-1:1; this.fallSide=clamp(-lx,-1,1);
    this.releaseCover(); this.cower=false;
    if(this.hasWeapon && this.h.weapon){ ensureMatrices(); const wp=this.h.weapon; removeShootables(this.h.weaponMeshes); scene.attach(wp); addProp(wp,{vel:V3(rnd(-.6,.6),1,rnd(-.6,.6)),ang:V3(rnd(-4,4),rnd(-2,2),rnd(-4,4)),radius:.06,kind:'weapon',snd:'wood'}); this.hasWeapon=false; }
    AudioSys.play('death',this.pos); if(this.h.lanternLight&&!this.lanternBroken) this.h.lanternLight.intensity=.3;
    G.stats.kills++;
    spawnDrop(this);
    if(G.alarmPending===this) G.alarmPending=null;
  }
  killInstant(){ this.dead=true; this.hp=0; this.state='DEAD'; this.deathT=5; this.fallSign=-1; if(this.h.weapon){ removeShootables(this.h.weaponMeshes); this.h.weapon.visible=false; } this.hasWeapon=false; this.animate(0); }
}
function jitterDir(dir,rad,rng){
  if(rad<=0) return dir; const a=rng()*Math.PI*2, r=Math.sqrt(rng())*rad;
  const up=Math.abs(dir.y)>.95?V3(1,0,0):UP; const right=V3().crossVectors(dir,up).normalize(), u=V3().crossVectors(right,dir).normalize();
  dir.addScaledVector(right,Math.tan(r)*Math.cos(a)).addScaledVector(u,Math.tan(r)*Math.sin(a)).normalize(); return dir;
}

/* ---------------- ALIADO (Lucien) ---------------- */
class Ally extends Actor{
  constructor(def){
    super(def,Object.assign({uniform:0x5a4630,pants:0x2d2a26,skin:0xcfa27e,hair:0x2b1e14,cap:'beret',weapon:'pistol',boots:true},def.look||{}));
    this.isAlly=true; this.hp=def.hp||150; this.maxHp=this.hp; this.nm=def.name||'LUCIEN'; this.nmT=def.title||'Lucien'; this.mode='WAIT'; this.joined=false; this.downed=false; this.downT=0; this.shotCD=1; this.tgt=null; this.scanT=0; this.hidden=true; this.ffCD=0; this.crouchTarget=.7; this.aimTarget=.2; this.waitPos={x:def.x,z:def.z};
  }
  targetable(){ return !this.dead&&!this.downed&&!this.hidden; }
  targetInfo(){ return {light:lightAt(this.pos.x,this.pos.z),crouch:this.crouch>.5,moving:this.speedNow>.4,sprint:this.speedNow>3,head:lerp(1.65,1.1,this.crouch),chest:lerp(1.25,.8,this.crouch)}; }
  takeDamage(o){
    if(this.downed||this.dead) return;
    if(o.shooter==='player'){ if(this.ffCD<=0){ G.radioMsg(this.nm,'Cuidado, Élise! Sou eu!'); this.ffCD=4; } }
    this.hp-=o.dmg; const {lx,lz}=this.localDir(o.dir||V3(0,0,1)); this.react.sx+=lz*.3; this.react.sz+=-lx*.2;
    if(this.hp<=0){ this.hp=0; this.downed=true; this.downT=30; this.path=null; this.crouchTarget=1; this.aimTarget=0; G.radioMsg(this.nm,'Fui atingido! Élise… me ajude a levantar!','warn'); G.hintT=0; }
  }
  update(dt){
    this.ffCD-=dt;
    if(this.downed){ this.downT-=dt; this.speedNow=0; this.crouchTarget=1; this.react.sx=-.5; if(this.downT<=0) missionFail(this.def.failTitle||'Lucien não resistiu',this.def.failText||'Lucien ficou caído tempo demais. Sem ele, ninguém liga o caminhão.'); this.animate(dt); return; }
    const P=G.player;
    this.scanT-=dt;
    if(this.scanT<=0){
      this.scanT=.3; this.tgt=null; let bd=this.def.range||24;
      for(const e of G.enemies){
        if(e.dead||e.state==='DISARMED') continue;
        const hostile=e.state==='COMBAT'||e.state==='RADIO'||G.playerShotT>0; if(!hostile||(this.mode==='WAIT'&&!this.joined&&e.state!=='COMBAT')) continue;
        const d=this.pos.distanceTo(e.pos); if(d>bd) continue;
        if(segFirst(this.pos.x,this.eyeY(),this.pos.z,e.pos.x,1.3+e.pos.y-e.crouch*.4,e.pos.z)) continue;
        bd=d; this.tgt=e;
      }
    }
    if(this.mode==='FOLLOW'){
      const d=Math.hypot(P.pos.x-this.pos.x,P.pos.z-this.pos.z);
      this.repathT-=dt;
      if(d>3.4){
        if(this.repathT<=0){ const fx=-Math.sin(P.yaw), fz=-Math.cos(P.yaw); let gx=P.pos.x-fx*2.2, gz=P.pos.z-fz*2.2; if(!segClear2D(P.pos.x,P.pos.z,gx,gz,.35,true)){ gx=P.pos.x; gz=P.pos.z; } this.setPath(gx,gz); this.repathT=.6; }
        this.followPath(d>8?3.9:2.8,dt,!this.tgt);
      } else {
        this.path=null; this.moveDir(0,0,0,dt);
        const fx=-Math.sin(P.yaw), fz=-Math.cos(P.yaw); const vx=this.pos.x-P.pos.x, vz=this.pos.z-P.pos.z; const along=vx*fx+vz*fz, perp=vx*fz-vz*fx;
        if(along>0 && Math.abs(perp)<1) this.moveDir(fz*Math.sign(perp||1),-fx*Math.sign(perp||1),2.2,dt);
      }
      if(this.stuck>2 && d>10){ this.recover(); }
      this.crouchTarget=this.tgt?.5:(P.crouch>.5?.8:0);
    } else { this.crouchTarget=this.joined?.5:.7; if(Math.hypot(this.waitPos.x-this.pos.x,this.waitPos.z-this.pos.z)>.8){ if(!this.path) this.setPath(this.waitPos.x,this.waitPos.z); this.followPath(2.6,dt); } else this.moveDir(0,0,0,dt); }
    if(!this.joined&&this.def.caged) this.tgt=null;
    if(this.tgt){
      this.aimTarget=1; this.faceTowards(this.tgt.pos.x,this.tgt.pos.z,dt,6); this.shotCD-=dt;
      if(this.shotCD<=0 && Math.abs(angDiff(this.yaw,Math.atan2(this.tgt.pos.x-this.pos.x,this.tgt.pos.z-this.pos.z)))<.2){ this.shotCD=rnd(.85,1.4); this.fire(this.tgt); }
    } else { this.aimTarget=.25; if(this.mode==='WAIT'&&!this.joined) this.faceTowards(0,0,dt,1); }
    this.animate(dt);
  }
  recover(){
    const P=G.player.pos, fx=-Math.sin(G.player.yaw), fz=-Math.cos(G.player.yaw);
    let best=null, bd=1e9;
    for(const n of W.nav.nodes){ const dx=n.x-P.x, dz=n.z-P.z, d=Math.hypot(dx,dz); if(d<2.5||d>12) continue; if((dx*fx+dz*fz)/d>-.2) continue; if(d<bd){ bd=d; best=n; } }
    if(best){ this.pos.set(best.x,0,best.z); this.path=null; this.stuck=0; }
  }
  fire(e){
    const m=this.muzzleWorld(); const aim=V3(e.pos.x,e.pos.y+lerp(1.25,.85,e.crouch),e.pos.z);
    const P=G.player; const pe=V3(P.pos.x,P.pos.y+1.1,P.pos.z); if(distPointSeg(pe,m,aim)<.7) return;
    const dir=aim.sub(m).normalize(); jitterDir(dir,1.8*DEG,Math.random);
    this.hidden=false;
    resolveShot({shooter:this,origin:m,dir,weapon:{dmg:this.def.dmg||28,falloff:this.def.dmg?[40,90,.7]:[15,35,.7]},shotId:++G.shotId});
    FX.flash(m); AudioSys.play('eshot',m,.9); emitNoise(this.pos,30,'gunshot',null);
  }
  revive(){ this.downed=false; this.hp=70; this.react.sx=0; G.radioMsg(this.nm,'Obrigado… ainda consigo andar. Vamos.'); }
}