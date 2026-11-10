'use strict';


/* =========================================================
   EFEITOS: partículas, decalques, traçantes, clarões
   ========================================================= */
const FX={parts:[],decals:[],tracers:[],flashes:[],pi:0,di:0,ti:0,fi:0,
  init(){
    const pg=new T.BoxGeometry(.035,.035,.035);
    for(let i=0;i<180;i++){ const m=new T.Mesh(pg,new T.MeshBasicMaterial({color:0xffffff,transparent:true})); m.visible=false; scene.add(m); this.parts.push({m,v:V3(),life:0,max:1,grav:9.8}); }
    const dg=new T.PlaneGeometry(.11,.11);
    this.decalMats={stone:new T.MeshBasicMaterial({color:0x111111,transparent:true,opacity:.7,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false}),wood:new T.MeshBasicMaterial({color:0x22160c,transparent:true,opacity:.8,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false}),metal:new T.MeshBasicMaterial({color:0x9aa0a0,transparent:true,opacity:.6,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false})};
    for(let i=0;i<80;i++){ const m=new T.Mesh(dg,this.decalMats.stone); m.visible=false; scene.add(m); this.decals.push(m); }
    for(let i=0;i<20;i++){ const geo=new T.BufferGeometry().setFromPoints([V3(),V3()]); const l=new T.Line(geo,new T.LineBasicMaterial({color:0xffd690,transparent:true,opacity:0})); l.frustumCulled=false; scene.add(l); this.tracers.push({l,t:0}); }
    this.sprites=[]; for(let i=0;i<130;i++){ const sp=new T.Sprite(new T.SpriteMaterial({map:SOFTTEX||null,transparent:true,depthWrite:false,opacity:0})); sp.visible=false; scene.add(sp); this.sprites.push({sp,v:V3(),life:0,max:1,size:1,a:1}); } this.si=0;
    this.casings=[]; FX.cgeo=FX.cgeo||new T.BoxGeometry(.01,.01,.026); FX.cmat=FX.cmat||new T.MeshPhongMaterial({color:0xb8913a,specular:0x887744,shininess:80}); for(let i=0;i<24;i++){ const m=new T.Mesh(FX.cgeo,FX.cmat); m.visible=false; scene.add(m); this.casings.push({m,v:V3(),av:V3(),life:0,b:0}); } this.ci=0;
    const fg=new T.PlaneGeometry(.45,.45); const fm=new T.MeshBasicMaterial({map:FLASHTEX||null,color:0xffd27a,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
    for(let i=0;i<8;i++){ const m=new T.Mesh(fg,fm); m.visible=false; scene.add(m); this.flashes.push({m,t:0}); }
  },
  burst(p,n,color,speed,life,grav=9.8,spread=1,dir){
    n=Math.round(n*QUALITY[settings.quality].particles); for(let i=0;i<n;i++){
      const q=this.parts[this.pi=(this.pi+1)%this.parts.length]; q.m.visible=true; q.m.position.copy(p); q.m.material.color.setHex(color); q.m.material.opacity=1;
      q.v.set(rnd(-1,1)*spread,rnd(.2,1.2),rnd(-1,1)*spread).multiplyScalar(speed); if(dir) q.v.addScaledVector(dir,speed*.8);
      q.life=0; q.max=life*rnd(.6,1.2); q.grav=grav; q.m.scale.setScalar(rnd(.6,1.4));
    }
  },
  decal(p,n,mat){
    const lim=QUALITY[settings.quality].decals; const m=this.decals[this.di=(this.di+1)%lim]; m.visible=true; m.material=this.decalMats[mat]||this.decalMats.stone;
    m.position.copy(p).addScaledVector(n,.012); m.lookAt(V3().copy(p).add(n)); m.rotation.z=Math.random()*6; m.scale.setScalar(rnd(.7,1.2));
  },
  tracer(a,b){ const t=this.tracers[this.ti=(this.ti+1)%this.tracers.length]; const pos=t.l.geometry.attributes.position; pos.setXYZ(0,a.x,a.y,a.z); pos.setXYZ(1,b.x,b.y,b.z); pos.needsUpdate=true; t.l.geometry.computeBoundingSphere(); t.t=.07; t.l.material.opacity=.75; },
  puff(p,n,color,size,life,vel,alpha=.35){ if(!MAT_HQ&&n>1) n=1; for(let i=0;i<n;i++){ const q=this.sprites[this.si=(this.si+1)%this.sprites.length]; q.sp.visible=true; q.sp.position.copy(p).add(V3(rnd(-.05,.05),rnd(-.03,.05),rnd(-.05,.05))); q.sp.material.color.setHex(color); q.a=alpha*rnd(.7,1); q.sp.material.opacity=q.a; q.size=size*rnd(.8,1.3); q.sp.scale.setScalar(q.size); q.v.copy(vel||V3()).add(V3(rnd(-.15,.15),rnd(0,.2),rnd(-.15,.15))); q.life=0; q.max=life*rnd(.8,1.2); } },
  casing(p,v){ const c=this.casings[this.ci=(this.ci+1)%this.casings.length]; c.m.visible=true; c.m.position.copy(p); c.v.copy(v); c.av.set(rnd(-20,20),rnd(-20,20),rnd(-20,20)); c.life=0; c.b=0; },
  flash(p){ const f=this.flashes[this.fi=(this.fi+1)%this.flashes.length]; f.m.visible=true; f.m.position.copy(p); f.m.lookAt(camera.position); f.m.rotation.z=Math.random()*3; f.t=.05; },
  update(dt){
    for(const q of this.parts){ if(!q.m.visible) continue; q.life+=dt; if(q.life>=q.max){ q.m.visible=false; continue; } q.v.y-=q.grav*dt; q.m.position.addScaledVector(q.v,dt); if(q.m.position.y<.02){ q.m.position.y=.02; q.v.multiplyScalar(.3); } q.m.material.opacity=1-q.life/q.max; }
    for(const t of this.tracers){ if(t.t>0){ t.t-=dt; t.l.material.opacity=Math.max(0,t.t/.07*.75); } }
    for(const f of this.flashes){ if(f.t>0){ f.t-=dt; if(f.t<=0) f.m.visible=false; } }
    for(const q of this.sprites){ if(!q.sp.visible) continue; q.life+=dt; const t=q.life/q.max; if(t>=1){ q.sp.visible=false; continue; } q.sp.position.addScaledVector(q.v,dt); q.v.multiplyScalar(.97); q.sp.scale.setScalar(q.size*(1+t*1.8)); q.sp.material.opacity=q.a*(1-t); }
    for(const c of this.casings){ if(!c.m.visible) continue; c.life+=dt; if(c.life>7){ c.m.visible=false; continue; } if(c.b>=3) continue; c.v.y-=9.8*dt; c.m.position.addScaledVector(c.v,dt); c.m.rotation.x+=c.av.x*dt; c.m.rotation.y+=c.av.y*dt; c.m.rotation.z+=c.av.z*dt;
      if(c.m.position.y<.006){ c.m.position.y=.006; c.b++; if(c.b<=2) AudioSys.play('casing',c.m.position,.8); c.v.y*=-.35; c.v.x*=.5; c.v.z*=.5; c.av.multiplyScalar(.4); if(c.b>=3){ c.m.rotation.set(0,c.m.rotation.y,Math.PI/2); } } }
  }
};
const SURF={stone:{c:0x8d877a,snd:'stone'},wood:{c:0x7a5a38,snd:'wood'},metal:{c:0xffd98a,snd:'metal'},sandbag:{c:0x8a7f5c,snd:'cloth'},cloth:{c:0x6b6650,snd:'cloth'},glass:{c:0xffe9b0,snd:'glass'},dirt:{c:0x4a4232,snd:'dirtHit'}};
function worldImpact(point,normal,surf,silent){
  const s=SURF[surf]||SURF.stone;
  FX.burst(point,surf==='metal'?6:8,s.c,surf==='metal'?3.5:1.8,surf==='metal'?.25:.5,surf==='metal'?3:9.8,1,normal);
  if(surf!=='cloth'&&surf!=='sandbag') FX.decal(point,normal,surf==='wood'?'wood':surf==='metal'?'metal':'stone');
  if(surf!=='metal'&&surf!=='glass') FX.puff(point,2,surf==='wood'?0x6a5238:surf==='dirt'?0x4e4636:0x8d877a,.22,.9,normal.clone().multiplyScalar(.5),.4);
  if(!silent) AudioSys.play(s.snd,point,.8);
}

/* =========================================================
   FÍSICA DE OBJETOS SOLTOS (capacetes, armas, quepes)
   ========================================================= */
function addProp(mesh,o){
  const p={mesh,vel:o.vel,ang:o.ang,radius:o.radius||.1,kind:o.kind,life:0,resting:false,bounces:0,snd:o.snd||'helmetDrop',owner:o.owner||null,settle:null};
  W.props.push(p);
  const maxH=QUALITY[settings.quality].helmets;
  const helmets=W.props.filter(q=>q.kind==='helmet'&&!q.removed);
  if(helmets.length>maxH){ const old=helmets.find(q=>q.resting)||helmets[0]; removeProp(old); }
  return p;
}
function propLanded(p){ if(p.onLand&&!p.landed){ p.landed=true; p.onLand(p.mesh.position.clone()); } }
function removeProp(p){ if(p.removed) return; p.removed=true; if(p.mesh.parent) p.mesh.parent.remove(p.mesh); }
const _q=new T.Quaternion(), _v=V3();
function updateProps(dt){
  for(const p of W.props){
    if(p.removed) continue;
    p.life+=dt;
    if((p.kind!=='weapon' && p.life>CFG.helmet.life)||(p.kind==='pebble'&&p.life>5)){ removeProp(p); continue; }
    if(p.resting){
      if(p.settle){ p.settle.t=Math.min(1,p.settle.t+dt*3); p.mesh.quaternion.slerp(p.settle.q,p.settle.t*.5); p.mesh.position.y=lerp(p.mesh.position.y,p.settle.y,p.settle.t); }
      continue;
    }
    const m=p.mesh, steps=2, h=dt/steps;
    for(let s=0;s<steps;s++){
      p.vel.y-=9.8*h; m.position.addScaledVector(p.vel,h);
      const w=p.ang.length(); if(w>1e-4){ _v.copy(p.ang).divideScalar(w); _q.setFromAxisAngle(_v,w*h); m.quaternion.premultiply(_q); }
      if(m.position.y<p.radius){
        m.position.y=p.radius; propLanded(p);
        if(p.vel.y<-.7 && p.bounces<3){ p.bounces++; AudioSys.play(p.snd,m.position,clamp(-p.vel.y/4,.25,1)); }
        p.vel.y*=-.34; p.vel.x*=.66; p.vel.z*=.66; p.ang.multiplyScalar(.6);
      }
      for(const sd of W.solids){
        if(!sd.active) continue; const x=m.position.x, y=m.position.y, z=m.position.z, r=p.radius;
        if(x>sd.minX-r&&x<sd.maxX+r&&z>sd.minZ-r&&z<sd.maxZ+r&&y>sd.minY-r&&y<sd.maxY+r){
          propLanded(p);
          const pen=[[x-(sd.minX-r),0,-1],[(sd.maxX+r)-x,0,1],[z-(sd.minZ-r),2,-1],[(sd.maxZ+r)-z,2,1],[(sd.maxY+r)-y,1,1]].sort((a,b)=>a[0]-b[0])[0];
          if(pen[1]===0){ m.position.x+=pen[2]*pen[0]; p.vel.x*=-.3; } else if(pen[1]===2){ m.position.z+=pen[2]*pen[0]; p.vel.z*=-.3; } else { m.position.y+=pen[0]; if(p.vel.y<-.7&&p.bounces<3){p.bounces++; AudioSys.play(p.snd,m.position,.5);} p.vel.y*=-.3; p.vel.x*=.7; p.vel.z*=.7; }
        }
      }
    }
    const onSurface=m.position.y<=p.radius+.02||p.vel.y===0;
    if(onSurface && p.vel.length()<.22 && p.life>.3){
      p.resting=true;
      if(p.kind==='helmet'){ const up=Math.random()<.55; const e=new T.Euler(up?0:Math.PI,Math.random()*6.28,(Math.random()-.5)*.5,'YXZ'); p.settle={q:new T.Quaternion().setFromEuler(e),y:m.position.y<.5?(up?.03:.13):m.position.y,t:0}; }
      else if(p.kind==='weapon'){ const e=new T.Euler(0,Math.random()*6.28,Math.PI/2,'YXZ'); p.settle={q:new T.Quaternion().setFromEuler(e),y:m.position.y<.5?.04:m.position.y,t:0}; }
    }
  }
  W.props=W.props.filter(p=>!p.removed);
}