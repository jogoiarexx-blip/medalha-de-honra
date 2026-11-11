'use strict';


/* =========================================================
   MUNDO / COLISÃO
   ========================================================= */
const W={solids:[],shootables:[],lamps:[],doors:{},interactables:[],nav:{nodes:[],edges:[]},covers:[],pickups:[],props:[]};
const MAT={};
let MAT_Q=null, MAT_HQ=false;
function makeMaterials(){
  const HQ=settings.quality!=='baixo'; MAT_Q=settings.quality; MAT_HQ=HQ;
  const L=(o,ex)=>{ const q=Object.assign({},o); if(!HQ){ return new T.MeshLambertMaterial(q); } const p=Object.assign({shininess:6,specular:0x0d0d0d},q,ex||{}); if(p.bump===false){ delete p.bump; } else if(p.map&&!p.bumpMap){ p.bumpMap=p.map; p.bumpScale=p.bumpScale||.035; } delete p.bump; return new T.MeshPhongMaterial(p); };
  MAT.facadeA=L({map:TEX.facade,emissiveMap:TEX.facadeEm,emissive:0xffffff,emissiveIntensity:.8});
  MAT.facadeB=L({map:TEX.facade,emissiveMap:TEX.facadeEm,emissive:0xffffff,emissiveIntensity:.8,color:0xcfc4b2});
  MAT.facadeC=L({map:TEX.facade,emissiveMap:TEX.facadeEm,emissive:0xffffff,emissiveIntensity:.8,color:0xb4bcbe});
  MAT.roof=L({color:0x15181b});
  MAT.plaster=L({map:TEX.plaster});
  MAT.ground=L({map:TEX.cobble},{specular:0x2c3238,shininess:42,bumpScale:.07});
  MAT.crate=L({map:TEX.wood});
  MAT.floorWood=L({map:TEX.floorWood});
  MAT.sandbag=L({map:TEX.sandbag});
  MAT.metal=L({map:TEX.metal},{specular:0x3a3a3a,shininess:35});
  MAT.concrete=L({map:TEX.concrete});
  MAT.darkMetal=L({color:0x24282a});
  MAT.stone=L({color:0x857e72});
  MAT.water=L({color:0x14222a},{specular:0x667788,shininess:90});
  MAT.kiosk=L({color:0x2c4637});
  MAT.car=L({color:0x2f383c},{specular:0x445055,shininess:50});
  MAT.truck=L({color:0x3b4434});
  MAT.canvas=L({color:0x5e5a43});
  MAT.tire=L({color:0x111111});
  MAT.desk=L({color:0x5a4029});
  MAT.paper=new T.MeshBasicMaterial({color:0xd8ceb4});
  MAT.lantern=new T.MeshBasicMaterial({color:0xffcf7a});
  MAT.bulb=new T.MeshBasicMaterial({color:0xfff0c0});
  MAT.shadow=new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.38,depthWrite:false});
  MAT.red=L({color:0x7a2a20});
  MAT.grass=L({map:TEX.grass}); MAT.gravel=L({map:TEX.gravel}); MAT.cwall=L({map:TEX.cwall}); MAT.mstone=L({map:TEX.mstone});
  MAT.lodge=L({map:TEX.mstone,color:0xc8bca6}); MAT.cryptIn=L({map:TEX.mstone,color:0x6a645a}); MAT.bones=L({map:TEX.bones}); MAT.tfloor=L({map:TEX.tfloor}); MAT.tceil=L({map:TEX.tfloor,color:0x8a8a8a});
  MAT.headstone=L({color:0x6b6862});
  MAT.chimney=L({map:TEX.cwall,color:0x9a8e80}); MAT.pot=L({color:0x8a4a30}); MAT.cafeTop=L({color:0x6a6e70},{specular:0x555555,shininess:60});
  MAT.puddle=new (HQ?T.MeshPhongMaterial:T.MeshLambertMaterial)(HQ?{color:0x2a323a,specular:0x9aaabb,shininess:120,transparent:true,opacity:.38,depthWrite:false}:{color:0x0b0e11});
  MAT.flame=new T.MeshBasicMaterial({color:0xffb050}); MAT.wreath=L({color:0x2f4a26}); MAT.statue=L({map:TEX.mstone,color:0xb0aca0}); MAT.bone=L({color:0x8a7e62});
  MAT.beam=new T.MeshBasicMaterial({color:0xffc27a,transparent:true,opacity:.075,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,alphaMap:TEX.beamGrad});
  MAT.beamCold=new T.MeshBasicMaterial({color:0xcfe0ff,transparent:true,opacity:.07,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,alphaMap:TEX.beamGrad2});
  MAT.lawn=L({map:TEX.grass,color:0x9fb08a}); MAT.gardenWall=L({map:TEX.lime,color:0xc8c0ae}); MAT.lime=L({map:TEX.lime}); MAT.slate=L({map:TEX.slate},{specular:0x222830,shininess:30});
  MAT.wallpaper=L({map:TEX.wallpaper},{bumpScale:.015}); MAT.ceil=L({color:0xa69e88}); MAT.parquet=L({map:TEX.parquet},{specular:0x2a2016,shininess:40,bumpScale:.02});
  MAT.marble=L({map:TEX.marble},{specular:0x555555,shininess:80,bump:false}); MAT.tiles=L({map:TEX.marble,color:0xb8b0a0},{specular:0x333333,shininess:50,bump:false});
  MAT.carpet=L({map:TEX.carpet}); MAT.rug=L({map:TEX.carpet,color:0xc8a080}); MAT.hedge=L({map:TEX.hedge},{bumpScale:.08}); MAT.tree=L({map:TEX.hedge,color:0x6a7a5a});
  MAT.doorWood=L({map:TEX.wood,color:0x8a6040}); MAT.darkWood=L({color:0x3a2516},{specular:0x2a1a10,shininess:40}); MAT.piano=L({color:0x0c0c0e},{specular:0x666666,shininess:110});
  MAT.fabric=L({color:0x6a2022}); MAT.books=L({map:TEX.books}); MAT.bed=L({color:0x5e5c50}); MAT.stove=L({color:0x262626},{specular:0x444444,shininess:40});
  MAT.cabinet=L({color:0x4f5552},{specular:0x333333,shininess:30}); MAT.brass=L({color:0xa88a40},{specular:0x998855,shininess:70}); MAT.marbleW=L({color:0xd8d4cc},{specular:0x666666,shininess:70});
  MAT.greenShade=new T.MeshBasicMaterial({color:0x2f6a3a,side:T.DoubleSide}); MAT.winLit=new T.MeshBasicMaterial({color:0xc08a3e}); MAT.winDark=L({color:0x10161c},{specular:0x445566,shininess:90});
  MAT.curtain=L({color:0x5a1a1c}); MAT.switchb=L({map:TEX.switchb}); MAT.dossier=L({map:TEX.dossier}); MAT.listPaper=L({map:TEX.listPaper}); MAT.mapTable=L({map:TEX.wallMap,color:0xc8c0a8}); MAT.wallMap=new T.MeshBasicMaterial({map:TEX.wallMap,color:0xbdb6a2}); MAT.headstone2=L({color:0x58554f}); MAT.cypress=L({color:0x141c14}); MAT.book=L({color:0x5a1d16}); MAT.window=new T.MeshBasicMaterial({color:0x8a5f24});
}
const FACE={'+x':0,'-x':1,'+y':2,'-y':3,'+z':4,'-z':5};
function worldUV(geo,ox,oy,oz){
  const p=geo.attributes.position, n=geo.attributes.normal, uv=geo.attributes.uv;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i)+ox, y=p.getY(i)+oy, z=p.getZ(i)+oz, nx=n.getX(i), ny=n.getY(i);
    if(Math.abs(nx)>.5) uv.setXY(i,-z*Math.sign(nx),y); else if(Math.abs(ny)>.5) uv.setXY(i,x,z); else uv.setXY(i,x*Math.sign(n.getZ(i)),y);
  }
  uv.needsUpdate=true;
}
function addBlock(x0,x1,z0,z1,h,o={}){
  const y0=o.y0||0, w=x1-x0, d=z1-z0, seg=o.seg||1.8;
  const geo=new T.BoxGeometry(w,h,d,Math.max(1,Math.ceil(w/seg)),Math.max(1,Math.ceil(h/seg)),Math.max(1,Math.ceil(d/seg)));
  const cx=(x0+x1)/2, cy=y0+h/2, cz=(z0+z1)/2;
  worldUV(geo,cx,cy,cz);
  const base=o.mat||MAT.facadeA;
  const arr=[base,base,o.top||(o.mat?base:MAT.roof),o.bottom||base,base,base];
  if(o.inner) for(const k in o.inner) arr[FACE[k]]=o.inner[k];
  const m=new T.Mesh(geo,arr); m.position.set(cx,cy,cz); m.userData.mat=o.surf||'stone';
  scene.add(m); W.shootables.push(m);
  if(o.solid!==false){ const s={minX:x0,maxX:x1,minZ:z0,maxZ:z1,minY:y0,maxY:y0+h,active:true,mesh:m,cover:!!o.cover,door:null}; W.solids.push(s); m.userData.solid=s; return s; }
  return {mesh:m};
}
function floorPlane(w,d,x,z,mat,surf,y=.012){ const g=new T.PlaneGeometry(w,d); g.rotateX(-Math.PI/2); g.translate(x,y,z); const uv=g.attributes.uv,p=g.attributes.position; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i),p.getZ(i)); const m=new T.Mesh(g,mat); m.userData.mat=surf; scene.add(m); W.shootables.push(m); return m; }
function addMesh(geo,mat,x,y,z,surf,parent){ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.userData.mat=surf||'stone'; (parent||scene).add(m); if(surf!==null) W.shootables.push(m); return m; }
function addSolidOnly(x0,x1,z0,z1,h,y0=0,cover=false){ const s={minX:x0,maxX:x1,minZ:z0,maxZ:z1,minY:y0,maxY:y0+h,active:true,mesh:null,cover,door:null}; W.solids.push(s); return s; }

/* --- colisão círculo × AABB (XZ) --- */
function resolveCircle(p,r,y0,y1){
  for(let it=0;it<2;it++) for(const s of W.solids){
    if(!s.active||s.maxY<=y0+.28||s.minY>=y1) continue;
    const cx=clamp(p.x,s.minX,s.maxX), cz=clamp(p.z,s.minZ,s.maxZ); const dx=p.x-cx, dz=p.z-cz, d2=dx*dx+dz*dz;
    if(d2>=r*r) continue;
    if(d2>1e-9){ const d=Math.sqrt(d2), k=(r-d)/d; p.x+=dx*k; p.z+=dz*k; }
    else { const l=p.x-s.minX, rr=s.maxX-p.x, b=p.z-s.minZ, f=s.maxZ-p.z, m=Math.min(l,rr,b,f);
      if(m===l) p.x=s.minX-r; else if(m===rr) p.x=s.maxX+r; else if(m===b) p.z=s.minZ-r; else p.z=s.maxZ+r; }
  }
}
/* --- segmento × AABB (3D), retorna primeiro impacto --- */
function slab(a,d,mn,mx,st){
  if(Math.abs(d)<1e-9) return (a<mn||a>mx)?false:true;
  let ta=(mn-a)/d, tb=(mx-a)/d, sg=-1; if(ta>tb){ const q=ta; ta=tb; tb=q; sg=1; }
  if(ta>st.t0){ st.t0=ta; st.sign=sg; st.axisHit=true; }
  if(tb<st.t1) st.t1=tb;
  return st.t0<=st.t1;
}
const _st={t0:0,t1:1,sign:0,axisHit:false};
function segFirst(ax,ay,az,bx,by,bz,filter){
  const dx=bx-ax, dy=by-ay, dz=bz-az; let best=1.0001, bs=null, bAxis=-1, bSign=0;
  for(const s of W.solids){
    if(!s.active) continue; if(filter && !filter(s)) continue;
    const st=_st; st.t0=0; st.t1=best; st.sign=0; let axis=-1;
    st.axisHit=false; if(!slab(ax,dx,s.minX,s.maxX,st)) continue; if(st.axisHit){axis=0;}
    let sg=st.sign; st.axisHit=false; if(!slab(ay,dy,s.minY,s.maxY,st)) continue; if(st.axisHit){axis=1;sg=st.sign;}
    st.axisHit=false; if(!slab(az,dz,s.minZ,s.maxZ,st)) continue; if(st.axisHit){axis=2;sg=st.sign;}
    if(st.t0<best){ best=st.t0; bs=s; bAxis=axis; bSign=sg; }
  }
  return bs?{t:best,solid:bs,axis:bAxis,sign:bSign}:null;
}
function segRect(x1,z1,x2,z2,a,b,c,d){
  const st={t0:0,t1:1,sign:0,axisHit:false};
  if(!slab(x1,x2-x1,a,b,st)) return false; if(!slab(z1,z2-z1,c,d,st)) return false; return true;
}
function segClear2D(x1,z1,x2,z2,r,npc){
  if(W.walk&&W.walk.length) return segClear2DH(x1,z1,x2,z2,r,npc);
  for(const s of W.solids){
    if(!s.active||s.maxY<.3||s.minY>1.6) continue;
    if(npc && s.door && s.door.npc) continue;
    if(segRect(x1,z1,x2,z2,s.minX-r,s.maxX+r,s.minZ-r,s.maxZ+r)) return false;
  }
  return true;
}
function rayCylinder(o,d,maxT,cx,cz,r,y0,y1){
  const ox=o.x-cx, oz=o.z-cz, a=d.x*d.x+d.z*d.z; if(a<1e-8) return -1;
  const b=2*(ox*d.x+oz*d.z), c=ox*ox+oz*oz-r*r, disc=b*b-4*a*c; if(disc<0) return -1;
  const sq=Math.sqrt(disc); let t=(-b-sq)/(2*a); if(t<0) t=(-b+sq)/(2*a); if(t<0||t>maxT) return -1;
  const y=o.y+d.y*t; if(y<y0||y>y1) return -1; return t;
}
const _dpsA=new T.Vector3(), _dpsB=new T.Vector3();   // rascunho: função chamada em laços de IA e de tiro
function distPointSeg(p,a,b){ const ab=_dpsA.subVectors(b,a), ap=_dpsB.subVectors(p,a); const t=clamp(ap.dot(ab)/Math.max(1e-6,ab.lengthSq()),0,1); return ap.sub(ab.multiplyScalar(t)).length(); }

/* --- luz ambiente para furtividade --- */
function lightAt(x,z){
  let l=(G&&G.level&&G.level.baseLight)||.12; if(G&&G.level&&G.level.lightFn) l=G.level.lightFn(x,z);
  for(const L of W.lamps){ if(L.broken) continue; const d=Math.hypot(x-L.x,z-L.z); if(d<L.r) l=Math.max(l,.12+.88*(1-d/L.r)); }
  return l;
}

/* --- navegação por grafo de pontos --- */
function buildNav(){
  const N=W.nav.nodes; W.nav.edges=N.map(()=>[]);
  for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){
    const d=Math.hypot(N[i].x-N[j].x,N[i].z-N[j].z);
    if(d<(W.nav.link||17) && segClear2D(N[i].x,N[i].z,N[j].x,N[j].z,.36,true)){ W.nav.edges[i].push(j); W.nav.edges[j].push(i); }
  }
}
function nearestNode(x,z){
  const N=W.nav.nodes; if(!N.length) return -1;
  const idx=N.map((n,i)=>[Math.hypot(n.x-x,n.z-z),i]).sort((a,b)=>a[0]-b[0]);
  for(let k=0;k<Math.min(12,idx.length);k++){ const i=idx[k][1]; if(segClear2D(x,z,N[i].x,N[i].z,.22,true)) return i; }
  return idx[0][1];
}
function astar(a,b){
  const N=W.nav.nodes, n=N.length, g=new Float64Array(n).fill(Infinity), f=new Float64Array(n).fill(Infinity), came=new Int32Array(n).fill(-1), closed=new Uint8Array(n);
  const h=(i)=>Math.hypot(N[i].x-N[b].x,N[i].z-N[b].z); const open=new Set([a]); g[a]=0; f[a]=h(a);
  while(open.size){
    let cur=-1,bf=Infinity; for(const i of open) if(f[i]<bf){bf=f[i];cur=i;}
    if(cur===b) break; open.delete(cur); closed[cur]=1;
    for(const j of W.nav.edges[cur]){ if(closed[j]) continue; const ng=g[cur]+Math.hypot(N[cur].x-N[j].x,N[cur].z-N[j].z); if(ng<g[j]){ g[j]=ng; f[j]=ng+h(j); came[j]=cur; open.add(j); } }
  }
  if(g[b]===Infinity) return null;
  const out=[]; let c=b; while(c!==-1){ out.unshift(c); c=came[c]; } return out;
}
function findPath(x0,z0,x1,z1){
  if(segClear2D(x0,z0,x1,z1,.3,true)) return [{x:x1,z:z1}];
  const a=nearestNode(x0,z0), b=nearestNode(x1,z1); if(a<0||b<0) return [{x:x1,z:z1}];
  const ids=astar(a,b); if(!ids) return [{x:x1,z:z1}];
  const pts=ids.map(i=>({x:W.nav.nodes[i].x,z:W.nav.nodes[i].z})); pts.push({x:x1,z:z1});
  while(pts.length>1 && segClear2D(x0,z0,pts[1].x,pts[1].z,.3,true)) pts.shift();
  return pts;
}

/* =========================================================
   CONSTRUÇÃO DA FASE 1-1 (Rue des Lanternes)
   ========================================================= */
function poster(x,y,z,ry,w,h,draw){ const t=textTex(256,Math.round(256*h/w),draw); const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshLambertMaterial({map:t})); m.position.set(x,y,z); m.rotation.y=ry; scene.add(m); return m; }
let CONEGEO=null;
function addCone(L,x,y,z,r){ if(!MAT_HQ) return; CONEGEO=CONEGEO||new T.ConeGeometry(1,1,20,1,true); const c=new T.Mesh(CONEGEO,MAT.beam); c.scale.set(r,y-.1,r); c.position.set(x,y-(y-.1)/2,z); c.renderOrder=2; scene.add(c); L.cone=c; }
function lampPost(id,x,z,armDX,armDZ){
  addMesh(new T.CylinderGeometry(.06,.09,3.8,6),MAT.darkMetal,x,1.9,z,'metal');
  addSolidOnly(x-.12,x+.12,z-.12,z+.12,3.8);
  const lx=x+armDX*.7, lz=z+armDZ*.7;
  const arm=addMesh(new T.BoxGeometry(Math.abs(armDX)*.7+.05,.05,Math.abs(armDZ)*.7+.05),MAT.darkMetal,(x+lx)/2,3.72,(z+lz)/2,'metal');
  const lan=addMesh(new T.BoxGeometry(.26,.36,.26),MAT.lantern,lx,3.5,lz,'glass');
  addMesh(new T.ConeGeometry(.24,.16,4),MAT.darkMetal,lx,3.76,lz,'metal').rotation.y=Math.PI/4;
  const light=new T.PointLight(0xffc27a,1.55,13,1.6); light.position.set(lx,3.3,lz); scene.add(light);
  const L={id,x:lx,z:lz,r:8.5,light,lantern:lan,broken:false,base:1.55,ph:Math.random()*10};
  addCone(L,lx,3.5,lz,1.75);
  lan.userData.breakable=true; lan.userData.lamp=L; W.lamps.push(L); return L;
}
function bulb(id,x,y,z,r){
  const b=addMesh(new T.SphereGeometry(.09,6,4),MAT.bulb,x,y,z,'glass'); addMesh(new T.CylinderGeometry(.006,.006,.5,3),MAT.darkMetal,x,y+.3,z,null);
  const light=new T.PointLight(0xffe2a8,1.2,9,1.7); light.position.set(x,y-.15,z); scene.add(light);
  const L={id,x,z,r,light,lantern:b,broken:false,base:1.2,ph:Math.random()*10}; b.userData.breakable=true; b.userData.lamp=L; W.lamps.push(L); return L;
}
function crate(x,z,s=1,h=1,y0=0){ return addBlock(x-s/2,x+s/2,z-s/2,z+s/2,h,{mat:MAT.crate,surf:'wood',cover:true,seg:1,y0}); }
function sandbags(x0,x1,z0,z1,h=1.05){ return addBlock(x0,x1,z0,z1,h,{mat:MAT.sandbag,surf:'sandbag',cover:true,seg:1}); }
function barrel(x,z){ addMesh(new T.CylinderGeometry(.3,.3,.9,8),MAT.metal,x,.45,z,'metal'); addSolidOnly(x-.3,x+.3,z-.3,z+.3,.9,0,true); }
function car(x,z,alongZ){
  const L=4.2, Wd=1.75; const hx=alongZ?Wd/2:L/2, hz=alongZ?L/2:Wd/2;
  const a=addBlock(x-hx,x+hx,z-hz,z+hz,.95,{mat:MAT.car,surf:'metal',cover:true,y0:.25,seg:1}); a.minY=0;
  const cx=alongZ?Wd*.45:L*.27, cz=alongZ?L*.27:Wd*.45;
  const b=addBlock(x-cx,x+cx,z-cz,z+cz,.5,{mat:MAT.car,surf:'metal',y0:1.2,seg:1});
  a.mesh.visible=false; b.mesh.visible=false; carDetail(x,z,alongZ);
}
function makeDoor(id,o){
  const m=addMesh(new T.BoxGeometry(o.w,o.h,o.d),o.mat,o.x,o.h/2+(o.y0||0),o.z,o.surf||'wood');
  const s={minX:o.x-o.w/2,maxX:o.x+o.w/2,minZ:o.z-o.d/2,maxZ:o.z+o.d/2,minY:o.y0||0,maxY:(o.y0||0)+o.h,active:true,mesh:m,cover:false,door:null};
  W.solids.push(s);
  const door={id,y0:o.y0||0,mesh:m,solid:s,state:o.locked?'LOCKED':'CLOSED',closed:m.position.clone(),open:m.position.clone().add(o.offset),t:0,dur:o.dur||.7,npc:!!o.npc,label:o.label,snd:o.snd||'door',nav:!!o.nav};
  s.door=door; m.userData.solid=s; W.doors[id]=door; return door;
}

function buildLevel01(){
  scene.background=new T.Color(0x0a1016);
  scene.fog=new T.FogExp2(0x0b1117,.03);
  // céu
  const sky=new T.Mesh(new T.SphereGeometry(200,16,8),new T.MeshBasicMaterial({side:T.BackSide,fog:false,depthWrite:false,map:textTex(512,256,(g,w,h)=>{
    const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#05080c'); gr.addColorStop(.45,'#0c1520'); gr.addColorStop(.52,'#1b2532'); gr.addColorStop(1,'#0a0f14'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    const R=mulberry32(9); for(let i=0;i<260;i++){ g.fillStyle=`rgba(255,255,255,${.2+R()*.6})`; g.fillRect(R()*w,R()*h*.45,1,1); }
    g.fillStyle='#e8e2cf'; g.beginPath(); g.arc(360,58,9,0,Math.PI*2); g.fill(); g.fillStyle='rgba(232,226,207,.08)'; g.beginPath(); g.arc(360,58,26,0,Math.PI*2); g.fill();
  })}));
  sky.material.map.magFilter=T.LinearFilter; sky.renderOrder=-1; scene.add(sky);
  scene.add(new T.HemisphereLight(0x5a6b85,0x14110d,.42));
  const moon=new T.DirectionalLight(0x8ea4c8,.38); moon.position.set(-30,60,-20); scene.add(moon);
  scene.add(new T.AmbientLight(0x1a1f26,.35));
  // chão
  const gg=new T.PlaneGeometry(66,106,44,70); gg.rotateX(-Math.PI/2); gg.translate(0,0,-1);
  { const p=gg.attributes.position, uv=gg.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i),p.getZ(i)); }
  const ground=new T.Mesh(gg,MAT.ground); ground.userData.mat='stone'; scene.add(ground); W.shootables.push(ground);

  // ---- quarteirões oeste ----
  addBlock(-30,-5,8,46,14,{mat:MAT.facadeB});
  addBlock(-30,-14,3,8,12,{mat:MAT.facadeA});
  addBlock(-30,-26,-26,3,12,{mat:MAT.facadeC});
  addBlock(-17,-5,-22,-8,13,{mat:MAT.facadeA});
  addBlock(-17,-14,-8,-3,13,{mat:MAT.facadeA});
  // garagem Moreau (interior x[-17,-6] z[-44,-30])
  const gIn={mat:MAT.facadeC};
  addBlock(-30,-17,-48,-26,9,{mat:MAT.facadeC,inner:{'+x':MAT.plaster}});
  addBlock(-17,-5,-30,-26,9,{mat:MAT.facadeC,inner:{'-z':MAT.plaster}});
  addBlock(-17,-5,-48,-44,9,{mat:MAT.facadeC,inner:{'+z':MAT.plaster}});
  addBlock(-6,-5,-44,-39,9,{mat:MAT.facadeC,inner:{'-x':MAT.plaster}});
  addBlock(-6,-5,-35,-30,9,{mat:MAT.facadeC,inner:{'-x':MAT.plaster}});
  addBlock(-6,-5,-39,-35,5,{mat:MAT.facadeC,y0:4,inner:{'-x':MAT.plaster}});
  addBlock(-17,-6,-44,-30,4,{y0:5,mat:MAT.facadeC,bottom:MAT.roof});
  floorPlane(11,14,-11.5,-37,MAT.concrete,'stone');
  void gIn;
  // ---- leste ----
  addBlock(5,30,8,46,13,{mat:MAT.facadeC});
  addBlock(5,30,-48,-8,12,{mat:MAT.facadeB});
  // posto da guarda (interior x[15,23] z[-5,5])
  addBlock(14,15,-8,-1,10,{mat:MAT.facadeA,inner:{'+x':MAT.plaster}});
  addBlock(14,15,1,8,10,{mat:MAT.facadeA,inner:{'+x':MAT.plaster}});
  addBlock(14,15,-1,1,7.6,{mat:MAT.facadeA,y0:2.4});
  addBlock(15,30,-8,-5,10,{mat:MAT.facadeA,inner:{'+z':MAT.plaster}});
  addBlock(15,30,5,8,10,{mat:MAT.facadeA,inner:{'-z':MAT.plaster}});
  addBlock(23,30,-5,5,10,{mat:MAT.facadeA,inner:{'-x':MAT.plaster}});
  addBlock(15,23,-5,5,6.6,{y0:3.4,mat:MAT.facadeA,bottom:MAT.plaster});
  floorPlane(8,10,19,0,MAT.floorWood,'wood');
  // extremidades da rua
  addBlock(-6,6,-52,-46,12,{mat:MAT.facadeA});
  addBlock(-6,6,44,50,12,{mat:MAT.facadeA});

  // ---- portas ----
  makeDoor('guard',{x:14.5,z:0,w:.12,h:2.4,d:2,mat:MAT.crate,offset:V3(0,0,1.95),npc:true,label:'porta do posto'});
  makeDoor('garage',{x:-5.5,z:-37,w:.2,h:4,d:4,mat:MAT.metal,surf:'metal',offset:V3(0,3.9,0),locked:true,dur:2.1,label:'portão da garagem',snd:'garage',nav:true});

  // ---- iluminação ----
  lampPost('L1',-4.5,33,1,0);
  lampPost('L2',4.5,21,-1,0);
  lampPost('L3',-4.5,10.5,1,0);
  lampPost('L4',10.5,6.6,0,-1);
  lampPost('L5',-6.5,-6.6,0,1);
  lampPost('L6',4.5,-13,-1,0);
  lampPost('L7',-4.5,-27.5,1,0);
  lampPost('L8',4.5,-38,-1,0);
  { // luminária de parede do pátio
    addMesh(new T.BoxGeometry(.5,.05,.05),MAT.darkMetal,-17.25,2.9,-14,'metal');
    const lan=addMesh(new T.BoxGeometry(.24,.32,.24),MAT.lantern,-17.55,2.7,-14,'glass');
    const light=new T.PointLight(0xffc27a,1.3,11,1.6); light.position.set(-17.8,2.5,-14); scene.add(light);
    const L={id:'L9',x:-17.6,z:-14,r:7,light,lantern:lan,broken:false,base:1.3,ph:2}; addCone(L,-17.55,2.6,-14,1.4); lan.userData.breakable=true; lan.userData.lamp=L; W.lamps.push(L);
  }
  bulb('B1',19,3.15,0,6.5);
  bulb('B2',-11.5,4.7,-37,7.5);

  // ---- cobertura e cenário ----
  crate(3.7,30.6,1,1);
  crate(-3.6,19.6,1.2,1); crate(-3.6,19.6,.9,.8,1);
  car(-3.35,13,true);
  barrel(3.9,10.4); barrel(3.4,9.8);
  // praça
  addMesh(new T.CylinderGeometry(2.1,2.2,.6,14),MAT.stone,0,.3,0,'stone');
  addMesh(new T.CylinderGeometry(1.85,1.85,.05,14),MAT.water,0,.58,0,'stone');
  addMesh(new T.CylinderGeometry(.3,.38,2.2,8),MAT.stone,0,1.1,0,'stone');
  addMesh(new T.CylinderGeometry(.75,.3,.3,10),MAT.stone,0,2.05,0,'stone');
  addSolidOnly(-1.7,1.7,-1.7,1.7,.6,0,true); addSolidOnly(-.4,.4,-.4,.4,2.3);
  addBlock(-12.3,-10.7,5.2,6.8,2.4,{mat:MAT.kiosk,surf:'wood',cover:true,seg:1});
  addMesh(new T.ConeGeometry(1.35,.7,8),MAT.kiosk,-11.5,2.75,6,'wood');
  addBlock(5,7,6.3,6.9,.5,{mat:MAT.crate,surf:'wood',seg:1,cover:false});
  sandbags(10.2,12.2,-3.6,-2.8);
  crate(9.6,6.8,1,1); crate(-12.6,-6.6,1.1,1);
  // pátio
  crate(-23.8,-8.6,1.2,1.1); crate(-19.4,-13.6,1.2,1.1); crate(-19.4,-13.6,.9,.9,1.1);
  crate(-23.4,-18.6,1,1); crate(-24.6,-23.6,.9,.6);
  barrel(-12.6,-22.6); barrel(-9.2,-25.5);
  // rua norte
  crate(-3.7,-12.6,1.1,1); car(3.4,-18,true); crate(3.6,-24.6,1.1,1);
  sandbags(-4.6,-1.3,-31.4,-30.6); sandbags(1.3,4.6,-31.4,-30.6);
  addMesh(new T.BoxGeometry(2.6,.08,.08),MAT.red,0,1.05,-31,null);
  // posto: mobília
  addBlock(18.7,20.3,1.8,2.6,.78,{mat:MAT.desk,surf:'wood',cover:true,seg:1});
  addMesh(new T.BoxGeometry(.32,.01,.24),MAT.paper,19.3,.79,2.15,'wood');
  addBlock(21.5,22.7,-4.6,-3.9,.75,{mat:MAT.desk,surf:'wood',seg:1});
  const radioMesh=addMesh(new T.BoxGeometry(.5,.34,.3),MAT.darkMetal,22.1,.92,-4.25,'metal');
  addMesh(new T.BoxGeometry(.08,.08,.02),MAT.lantern,21.95,.95,-4.09,null);
  addBlock(15.1,15.7,-4.8,-2.8,2,{mat:MAT.desk,surf:'wood',seg:1});
  addMesh(new T.BoxGeometry(.04,.5,.6),MAT.crate,22.97,1.6,3,'wood');
  const keyMesh=addMesh(new T.BoxGeometry(.03,.12,.05),MAT.metal,22.92,1.55,3.05,'metal');
  // garagem: caminhão e oficina
  for(const bl of [addBlock(-16,-9.8,-38.2,-35.8,.9,{mat:MAT.truck,surf:'metal',solid:false,y0:.45,seg:1}),addBlock(-12.7,-9.8,-38.1,-35.9,1.2,{mat:MAT.truck,surf:'metal',solid:false,y0:1.35,seg:1}),addBlock(-16,-12.7,-38.2,-35.8,1.5,{mat:MAT.canvas,surf:'cloth',solid:false,y0:1.35,seg:1})]) bl.mesh.visible=false;
  addSolidOnly(-16,-9.8,-38.2,-35.8,2.9,0,true);
  { const B=vehB(); vehTruck(B,0x3b4434,'canvas',{jerry:true}); B.place(-12.9,-37,Math.PI/2); }
  addBlock(-16.9,-15.6,-32,-30.2,.9,{mat:MAT.desk,surf:'wood',cover:true,seg:1});
  barrel(-7,-43.2); barrel(-7.8,-43.3);
  crate(-15.8,-42.8,1.1,1);

  // cartazes e placas
  poster(-4.98,2.3,24,Math.PI/2,1.1,1.5,(g,w,h)=>{ g.fillStyle='#d9cfb4'; g.fillRect(0,0,w,h); g.fillStyle='#1f1a14'; g.font='bold 54px serif'; g.textAlign='center'; g.fillText('AVIS',w/2,70); g.font='22px serif'; ['COUVRE-FEU','À 22 HEURES','—','Toute personne','circulant après','l\'heure sera','arrêtée.'].forEach((t,i)=>g.fillText(t,w/2,120+i*32)); g.fillStyle='#8c2b1d'; g.fillRect(16,h-26,w-32,8); });
  poster(4.98,2.2,-10.5,-Math.PI/2,1,1.3,(g,w,h)=>{ g.fillStyle='#c9bd9c'; g.fillRect(0,0,w,h); g.fillStyle='#223'; g.font='bold 40px serif'; g.textAlign='center'; g.fillText('RATIONNEMENT',w/2,60); g.font='22px serif'; ['Pain · 275 g / jour','Viande · 120 g / sem.','Présentez vos','tickets.'].forEach((t,i)=>g.fillText(t,w/2,110+i*34)); });
  poster(-17.02,1.9,-19.5,-Math.PI/2,.9,.9,(g,w,h)=>{ g.fillStyle='rgba(0,0,0,0)'; g.clearRect(0,0,w,h); g.strokeStyle='#e8e2cf'; g.lineWidth=18; g.beginPath(); g.moveTo(50,40); g.lineTo(128,220); g.lineTo(206,40); g.stroke(); }).material.transparent=true;
  poster(-4.97,4.7,-37,Math.PI/2,3.4,.7,(g,w,h)=>{ g.fillStyle='#2a2f2b'; g.fillRect(0,0,w,h); g.fillStyle='#d9cfb4'; g.font='bold 34px serif'; g.textAlign='center'; g.fillText('GARAGE  MOREAU',w/2,h/2+12); });
  poster(13.97,2.9,3.5,-Math.PI/2,1.6,.45,(g,w,h)=>{ g.fillStyle='#1d2124'; g.fillRect(0,0,w,h); g.fillStyle='#e6dfcc'; g.font='bold 30px sans-serif'; g.textAlign='center'; g.fillText('POSTE DE GARDE  7',w/2,h/2+10); });
  addMesh(new T.BoxGeometry(.06,.24,.16),MAT.darkMetal,-4.95,1.3,-34.2,'metal');
  addMesh(new T.BoxGeometry(.02,.06,.06),MAT.red,-4.91,1.33,-34.2,null);

  dress01();
  // ---- grafo de navegação ----
  W.nav.nodes=[[0,41],[1,34],[1.2,26],[0,19],[0.5,12],[0,7],[-5.5,5.2],[5.5,5.2],[-8,0],[8,0],[-5.5,-5.2],[5.5,-5.2],[0,-6.5],[-9.5,3.8],[-12.8,1],[11.5,0],[12.6,-5.8],[11.8,4.5],
    [16.2,0],[19.2,-.6],[20.8,-2.6],[21.4,2.6],[17,3.5],
    [-17,0],[-21.5,0],[-21.5,-5],[-21.5,-11],[-21.2,-16],[-21.5,-21],[-20,-24.3],
    [-15,-24],[-10.5,-24.4],[-6.5,-24],
    [0,-10],[0,-15],[0,-21],[-2.5,-24.5],[0,-28.5],[0,-34],[-2.6,-37],[2.5,-37],[0,-41],[3,-43],
    [-7.6,-37],[-8,-33],[-12.5,-32.6],[-15.6,-32.8],[-8,-41.5],[-13,-41.4],[-16,-34]].map(([x,z])=>({x,z}));
  buildNav();
  // ---- pontos de cobertura ----
  W.covers=[];
  for(const s of W.solids){
    if(!s.cover) continue;
    const cx=(s.minX+s.maxX)/2, cz=(s.minZ+s.maxZ)/2, w=s.maxX-s.minX, d=s.maxZ-s.minZ, o=.6;
    const pts=[];
    const along=(n,len)=>len>2.2?[-len/4,len/4]:[0];
    for(const k of along(0,d)) { pts.push([s.minX-o,cz+k,1,0]); pts.push([s.maxX+o,cz+k,-1,0]); }
    for(const k of along(0,w)) { pts.push([cx+k,s.minZ-o,0,1]); pts.push([cx+k,s.maxZ+o,0,-1]); }
    for(const [x,z,nx,nz] of pts){
      let ok=true; for(const t of W.solids){ if(!t.active||t.maxY<.3) continue; if(x>t.minX-.32&&x<t.maxX+.32&&z>t.minZ-.32&&z<t.maxZ+.32){ ok=false; break; } }
      if(ok) W.covers.push({x,z,nx,nz,h:s.maxY,occupant:null});
    }
  }
  return {radioMesh,keyMesh};
}