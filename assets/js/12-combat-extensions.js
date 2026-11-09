'use strict';


/* =========================================================
   ANDARES: blocos caminháveis (altura única por ponto XZ)
   ========================================================= */
function addWalk(x0,x1,z0,z1,top,o={}){
  const y0=o.y0||0; const s=addBlock(x0,x1,z0,z1,top-y0,Object.assign({},o,{y0}));
  s.walk=true; W.walk.push(s); return s;
}
function heightAt(x,z){
  const L=W.walk; if(!L||!L.length) return 0; let h=0;
  for(let i=0;i<L.length;i++){ const s=L[i]; if(s.active&&x>=s.minX&&x<=s.maxX&&z>=s.minZ&&z<=s.maxZ&&s.maxY>h) h=s.maxY; }
  return h;
}
function segClear2DH(x1,z1,x2,z2,r,npc){
  const len=Math.hypot(x2-x1,z2-z1), n=Math.max(1,Math.ceil(len/.3)), xs=[], zs=[], hs=[];
  let hmin=1e9, hmax=-1e9;
  for(let i=0;i<=n;i++){ const t=i/n, x=x1+(x2-x1)*t, z=z1+(z2-z1)*t, h=heightAt(x,z); if(i>0&&Math.abs(h-hs[i-1])>.42) return false; xs.push(x); zs.push(z); hs.push(h); if(h<hmin)hmin=h; if(h>hmax)hmax=h; }
  for(const s of W.solids){
    if(!s.active) continue;
    if(s.walk){
      if(s.maxY<=hmin+.42) continue;
      if(!segRect(x1,z1,x2,z2,s.minX-r,s.maxX+r,s.minZ-r,s.maxZ+r)) continue;
      for(let i=0;i<=n;i++){ if(xs[i]>s.minX-r&&xs[i]<s.maxX+r&&zs[i]>s.minZ-r&&zs[i]<s.maxZ+r&&s.maxY>hs[i]+.42) return false; }
      continue;
    }
    if(s.maxY<hmin+.3||s.minY>hmax+1.6) continue;
    if(npc && s.door && s.door.npc) continue;
    if(segRect(x1,z1,x2,z2,s.minX-r,s.maxX+r,s.minZ-r,s.maxZ+r)) return false;
  }
  return true;
}
Actor.prototype.limbW=function(k){
  const w=this.wounds; if(!w) return 0;
  if(k==='leg') return clamp(Math.max(w.legL,w.legR),0,1);
  if(k==='arm') return clamp(Math.max(w.armL,w.armR),0,1);
  return clamp(w[k]||0,0,1);
};

/* =========================================================
   FERIMENTOS NOS MEMBROS — hitboxes auxiliares, marcas e
   penalidades persistentes (moderadas e legíveis)
   ========================================================= */
const LIMB_OF={upperArm_L:'armL',forearm_L:'armL',hand_L:'armL',upperArm_R:'armR',forearm_R:'armR',hand_R:'armR',thigh_L:'legL',shin_L:'legL',foot_L:'legL',thigh_R:'legR',shin_R:'legR',foot_R:'legR'};
const LIMB_NAME={armL:'braço esquerdo',armR:'braço da arma',legL:'perna esquerda',legR:'perna direita'};
const LIMB_PROXY={upperArm:1.45,forearm:1.5,hand:1.6,thigh:1.12,shin:1.25,foot:1.2};
let WOUNDGEO=null, WOUNDMAT=null, PROXYMAT=null;
function limbTag(text){ const el=$('#hsTag'); el.textContent=text; el.className='limb'; el.hidden=false; void el.offsetWidth; el.classList.add('show'); clearTimeout(headTagT); headTagT=setTimeout(()=>el.hidden=true,1100); }
Enemy.prototype.woundLimb=function(reg,dmg,o){
  const limb=LIMB_OF[reg]; if(!limb) return;
  if(!this.wounds){ this.wounds={armL:0,armR:0,legL:0,legR:0}; this.woundFloor={armL:0,armR:0,legL:0,legR:0}; }
  const before=this.wounds[limb], add=clamp(dmg/22,.28,.9);
  this.wounds[limb]=Math.min(1.6,before+add);
  const severe=this.wounds[limb]>=1, newly=severe&&before<1;
  if(severe) this.woundFloor[limb]=Math.max(this.woundFloor[limb],.55);
  if(o.point&&settings.blood!=='off') this.woundMark(o.point,reg);
  const isLeg=limb[0]==='l';
  if(newly){
    AudioSys.play('grunt',this.pos);
    if(isLeg){ this.kneelT=Math.max(this.kneelT,1.7); if(this.state==='COMBAT'){ this.coverT=0; } }
    else { if(this.state==='COMBAT') this.coverT=0; if(limb==='armR'&&this.hasWeapon&&(this.wounds.armL>=1||Math.random()<.35)) this.disarm(o.dir); }
  }
  if(o.shooter==='player'){
    let t=REGIONS[reg].n; if(newly) t+=isLeg?' · mancando':(this.hasWeapon?' · mira prejudicada':''); else if(severe) t+=' · ferido';
    limbTag(t); G.stats.limbs=(G.stats.limbs||0)+1;
    lastShotLog(LIMB_NAME[limb]+' '+Math.round(Math.min(1,this.wounds[limb])*100)+'%'+(newly?(isLeg?' → manca':' → braço caído'):''));
  }
};
Enemy.prototype.woundMark=function(p,reg){
  const part=this.h.parts[reg]; if(!part||(this.marks||0)>=7) return; this.marks=(this.marks||0)+1;
  ensureMatrices(); const lp=part.worldToLocal(p.clone());
  if(!WOUNDGEO){ WOUNDGEO=BOX(.045,.045,.045); WOUNDMAT=hm(0x4a0f0c); }
  const m=new T.Mesh(WOUNDGEO,WOUNDMAT); m.position.copy(lp); m.scale.set(rnd(.8,1.2),rnd(.8,1.4),rnd(.8,1.2)); part.add(m);
};
Enemy.prototype.woundTick=function(dt){
  const w=this.wounds, f=this.woundFloor; for(const k in w) w[k]=Math.max(f[k],w[k]-dt*.035);
  this.aimPenalty=Math.max(this.aimPenalty,.55*clamp(w.armR,0,1)+.3*clamp(w.armL,0,1));
};

/* =========================================================
   VIDRO QUEBRÁVEL (janelas, espelhos, garrafas)
   ========================================================= */
let GLASSMAT=null;
function addGlass(id,x0,x1,y0,y1,z0,z1,o={}){
  if(!GLASSMAT) GLASSMAT=new T.MeshPhongMaterial({color:0xa8ccd8,specular:0xffffff,shininess:90,transparent:true,opacity:.24,depthWrite:false});
  const m=new T.Mesh(BOX(Math.max(.02,x1-x0),y1-y0,Math.max(.02,z1-z0)),o.mat||GLASSMAT); m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2); scene.add(m);
  const g={id,mesh:m,broken:false,minX:x0,maxX:x1,minY:y0,maxY:y1,minZ:z0,maxZ:z1,solid:null,small:!!o.small,loud:o.loud||14};
  if(o.solid!==false){ g.solid=addSolidOnly(x0,x1,z0,z1,y1-y0,y0); g.solid.see=true; g.solid.glass=g; }
  m.userData={mat:'glass',glass:g}; W.shootables.push(m); W.glass.push(g); return g;
}
function breakGlass(g,p,byPlayer){
  if(g.broken) return; g.broken=true; g.mesh.visible=false; if(g.solid) g.solid.active=false;
  const c=p||g.mesh.position; const n=g.small?8:26;
  FX.burst(c,n,0xd8eef4,g.small?2:3.2,.9,9.8,1.2); FX.burst(c,Math.round(n*.4),0xffffff,1.6,.5,9.8,.8);
  AudioSys.play('glass',c,g.small?.7:1.2); emitNoise(c,g.loud,'glass',null);
  if(!g.small){ W.shards.push({x:(g.minX+g.maxX)/2,z:(g.minZ+g.maxZ)/2,y:g.minY>2.5?heightAt((g.minX+g.maxX)/2,(g.minZ+g.maxZ)/2):0,r:1.5});
    const R=mulberry32(g.id.length*977+((g.minX*13)|0)); const list=[]; for(let i=0;i<14;i++){ const sh=W.shards[W.shards.length-1]; list.push([sh.x+rnd(-1.1,1.1),sh.y+.025,sh.z+rnd(-1.1,1.1),rnd(.04,.12),.006,rnd(.03,.09),R()*6]); } instanced(UNIT,GLASSMAT,list); }
  if(G&&G.flags){ G.flags.glass=G.flags.glass||[]; if(!G.flags.glass.includes(g.id)) G.flags.glass.push(g.id); }
  if(g.onBreak) g.onBreak(byPlayer);
}
function segAABB(a,b,s){ const st={t0:0,t1:1,sign:0,axisHit:false}; return slab(a.x,b.x-a.x,s.minX,s.maxX,st)&&slab(a.y,b.y-a.y,s.minY,s.maxY,st)&&slab(a.z,b.z-a.z,s.minZ,s.maxZ,st); }
function glassAlongSeg(a,b){ for(const g of W.glass){ if(!g.broken&&segAABB(a,b,g)) breakGlass(g,null,false); } }
function nearShards(p){ for(const s of W.shards){ if(Math.abs(p.y-s.y)<1&&Math.hypot(p.x-s.x,p.z-s.z)<s.r) return true; } return false; }

/* =========================================================
   SOMBRAS DO SOL (fases diurnas)
   ========================================================= */
function enableShadows(sun){
  const q=settings.quality; if(q==='baixo'||!sun){ renderer.shadowMap.enabled=false; return; }
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFShadowMap;
  sun.castShadow=true; const sz=q==='alto'?2048:1024; sun.shadow.mapSize.set(sz,sz);
  const c=sun.shadow.camera; c.left=-50; c.right=50; c.top=50; c.bottom=-50; c.near=1; c.far=220; c.updateProjectionMatrix();
  sun.shadow.bias=-.0006; sun.shadow.normalBias=.03;
  scene.traverse(o=>{ if(!o.isMesh) return; const m=Array.isArray(o.material)?o.material[0]:o.material; if(!m||m.visible===false||m.transparent) return; o.castShadow=true; o.receiveShadow=true; });
}