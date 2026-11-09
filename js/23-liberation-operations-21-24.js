'use strict';



/* =========================================================
   CAMPANHA 7 — LIBERTAÇÃO (Paris, agosto de 1944)
   kit comum: quarteirões, barricadas, combatentes FFI, semilagartas, coquetéis
   ========================================================= */
const FFI_LOOKS=[{uniform:0xd8d0c0,pants:0x3a3a40,skin:0xd0a080,hair:0x3a2a1a,cap:'beret',capColor:0x1a1a1a},{uniform:0x6a7a8a,pants:0x4a4038,skin:0xc89070,hair:0x1a1410,cap:null},{uniform:0xa89878,pants:0x2a2a2e,skin:0xe0b090,hair:0x8a5a2a,cap:null},{uniform:0x3a4a3a,pants:0x5a5040,skin:0xb88060,hair:0x2a1a10,cap:'beret',capColor:0x2a2a40}];
function ffiSquad(list){ const out=[]; list.forEach(([x,z,yaw,w],i)=>{ const lk=FFI_LOOKS[i%FFI_LOOKS.length]; const a=new Actor({id:'ffi'+i+'_'+x,x,z,yaw},Object.assign({weapon:w||'rifle',boots:true},lk)); removeShootables(a.h.hitMeshes);
  const band=new T.Mesh(BOX(.13,.07,.13),new T.MeshBasicMaterial({color:0xe8e8e8})); const ua=a.h.parts.upperArm_L; if(ua){ band.position.y=0; ua.add(band); }
  a.aimTarget=.9; a.crouchTarget=.55; out.push({a,cd:1+Math.random()*2,home:{x,z},yaw}); }); return out; }
function ffiTick(squad,dt,range){ if(!squad) return; for(const f of squad){ const a=f.a; a.speedNow=0; f.cd-=dt;
    let best=null,bd=range||38; for(const e of G.enemies){ if(e.dead) continue; const d=Math.hypot(e.pos.x-a.pos.x,e.pos.z-a.pos.z); if(d<bd&&!segFirst(a.pos.x,1.5,a.pos.z,e.pos.x,1.4,e.pos.z)){ bd=d; best=e; } }
    if(best){ a.yaw=Math.atan2(best.pos.x-a.pos.x,best.pos.z-a.pos.z); a.crouchTarget=.25; if(f.cd<=0){ f.cd=1.1+Math.random()*1.4; const mz=V3(a.pos.x+Math.sin(a.yaw)*.6,1.45,a.pos.z+Math.cos(a.yaw)*.6); FX.tracer(mz,V3(best.pos.x+rnd(-.6,.6),1.3+rnd(-.4,.4),best.pos.z+rnd(-.6,.6))); AudioSys.play('eshot',mz,.7);
        if(best.state!=='COMBAT') best.enterCombat(a.pos.x,a.pos.z,false); if(Math.random()<(G.diff==='recruta'?.32:.24)) best.takeDamage({dmg:34,region:'chest',dir:V3(best.pos.x-a.pos.x,0,best.pos.z-a.pos.z).normalize(),point:best.pos.clone().add(V3(0,1.3,0)),shooter:'ally'}); } }
    else { a.crouchTarget=.55; a.yaw=lerp(a.yaw,f.yaw,.02); } a.animate(dt); } }
function parisBlock(x0,x1,z0,z1,h,mat){ const r=addBlock(x0,x1,z0,z1,h,{mat:mat||[MAT.facadeA,MAT.facadeB,MAT.facadeC][Math.abs((x0*3+z0*7)|0)%3]}); r.dressed=true; parisDress(x0,x1,z0,z1,h); return r; }
let DRESS=[];
// ---------- vida de rua nas fachadas: calhas, cartazes, bicicletas, lixeiras, papéis, bueiros ----------
let STREET_M=null;
function streetPoster(k){ const T2=[['CAFÉ LUMIÈRE','le meilleur de Paris','#b8862a','#2a1a12'],['SAVON RIVOLI','pur et doux','#2a5a7a','#f0e8d0'],['THÉÂTRE DU CANAL','ce soir à 20 h','#7a1a1a','#e8d8a8'],['AVIS','couvre-feu à 23 h','#e8e0c8','#1a1a1a'],['BAL MUSETTE','samedi · rue des Rosiers','#2a6a3a','#f0e0b0'],['CHOCOLAT MARVAL','pour les enfants','#5a3a7a','#f8e8c8']][k%6];
  return canvasTex(64,96,(g,w,h)=>{ g.fillStyle=T2[2]; g.fillRect(0,0,w,h); g.fillStyle=T2[3]; g.font='bold 10px serif'; g.textAlign='center'; const words=T2[0].split(' '); words.forEach((t,i)=>g.fillText(t,w/2,20+i*12)); g.font='7px serif'; g.fillText(T2[1],w/2,h-12);
    g.globalAlpha=.5; g.beginPath(); g.arc(w/2,52,14,0,7); g.fill(); g.globalAlpha=1; g.fillStyle='rgba(0,0,0,.18)'; for(let i=0;i<40;i++) g.fillRect(Math.random()*w,Math.random()*h,2,1); g.fillStyle='rgba(240,230,200,.5)'; g.fillRect(w-12,0,12,10); }); }
function streetLife(){ const facade=['facadeA','facadeB','facadeC'].map(k=>MAT[k]).filter(Boolean); if(!facade.length) return; const N=W.nav.nodes; if(!N.length) return; const R=mulberry32(777+(+G.level.id||0));
  const near=(x,z,r2)=>{ for(const n of N){ const dx=n.x-x, dz=n.z-z; if(dx*dx+dz*dz<r2) return true; } return false; };
  if(!STREET_M) STREET_M={pipe:new T.MeshLambertMaterial({color:0x4a4e50}),bin:new T.MeshLambertMaterial({color:0x3a4038}),bike:new T.MeshLambertMaterial({color:0x1e2a22}),tire:new T.MeshLambertMaterial({color:0x111111}),paper:new T.MeshLambertMaterial({color:0xd8d0bc,side:T.DoubleSide}),cover:new T.MeshLambertMaterial({color:0x2a2a28}),posters:[0,1,2,3,4,5].map(k=>new T.MeshLambertMaterial({map:streetPoster(k)}))};
  const M=STREET_M; let bikes=0, bins=0, posters=0;
  const put=(geo,mat,x,y,z,rx,ry,rz)=>{ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); dressAdd(m); return m; };
  for(const so of W.solids.slice()){ const m=so.mesh; if(!m||!Array.isArray(m.material)||!facade.includes(m.material[0])||so.minY>.05) continue; const h=so.maxY-so.minY; if(h<5) continue;
    for(const [ax,s] of [['x',-1],['x',1],['z',-1],['z',1]]){ const alongX=ax==='z'; const c=ax==='x'?(s<0?so.minX:so.maxX):(s<0?so.minZ:so.maxZ); const a0=alongX?so.minX:so.minZ, a1=alongX?so.maxX:so.maxZ, len=a1-a0; if(len<3) continue;
      const P=(a,off)=>alongX?[a,c+s*off]:[c+s*off,a]; const [fx,fz]=P((a0+a1)/2,1.4); if(!near(fx,fz,9)||insideSolid(fx,fz,.1)) continue; const ry=alongX?(s>0?0:Math.PI):(s>0?Math.PI/2:-Math.PI/2);
      for(const e of [a0+.25,a1-.25]){ const [x,z]=P(e,.1); put(new T.CylinderGeometry(.05,.05,h-.2,6),M.pipe,x,(h-.2)/2,z); put(new T.CylinderGeometry(.08,.06,.25,6),M.pipe,x,h-.3,z); const [x2,z2]=P(e,.22); put(new T.CylinderGeometry(.05,.05,.3,6),M.pipe,x2,.18,z2,alongX?Math.PI/2*s:0,0,alongX?0:Math.PI/2*s); }
      const nP=Math.floor(len/9); for(let i=0;i<nP;i++){ if(R()<.35) continue; const a=a0+len*(i+.5)/nP+(R()-.5)*1.5; const [x,z]=P(a,.03); const k=R()*6|0; put(new T.PlaneGeometry(.6+R()*.15,.9),M.posters[k],x,1.55+R()*.3,z,0,ry,(R()-.5)*.06); posters++; if(R()<.5){ const [x3,z3]=P(a+.68,.035); put(new T.PlaneGeometry(.55,.8),M.posters[(k+1+(R()*4|0))%6],x3,1.5+R()*.3,z3,0,ry,(R()-.5)*.08); } }
      if(bikes<6&&len>6&&R()<.3){ const a=a0+len*(.2+R()*.6); const [x,z]=P(a,.32); const g=new T.Group(); g.position.set(x,0,z); g.rotation.set(0,ry+Math.PI/2,0); g.rotateX(-.16*s*0); g.updateMatrixWorld(true);
        const parts=[]; const add=(geo,mat,px,py,pz,rx,ryy,rz)=>{ const mm=new T.Mesh(geo,mat); mm.position.set(px,py,pz); mm.rotation.set(rx||0,ryy||0,rz||0); parts.push(mm); };
        for(const z2 of [-.52,.52]) add(new T.TorusGeometry(.32,.02,4,14),M.tire,0,.34,z2,0,Math.PI/2,0); add(BOX(.03,.03,.62),M.bike,0,.62,-.02,-.25); add(BOX(.03,.5,.03),M.bike,0,.52,-.2,.35); add(BOX(.03,.03,.66),M.bike,0,.36,-.15,.55); add(BOX(.03,.5,.03),M.bike,0,.55,.42,-.3); add(BOX(.42,.025,.025),M.bike,0,.86,.38); add(BOX(.1,.04,.2),M.cover,0,.8,-.3);
        const lean=new T.Group(); lean.rotation.z=-.18; g.add(lean); for(const p of parts) lean.add(p); g.updateMatrixWorld(true); for(const p of parts){ p.updateMatrixWorld(true); const w=p.clone(); w.matrixAutoUpdate=true; p.matrixWorld.decompose(w.position,w.quaternion,w.scale); dressAdd(w); } bikes++; }
      if(bins<8&&R()<.22){ const a=a0+len*(.1+R()*.8); const [x,z]=P(a,.45); put(new T.CylinderGeometry(.28,.24,.75,10),M.bin,x,.375,z); put(new T.CylinderGeometry(.31,.31,.05,10),M.bin,x,.77,z); put(BOX(.12,.04,.04),M.cover,x,.82,z); bins++; }
      for(let i=0;i<3;i++) if(R()<.5){ const a=a0+len*R(); const [x,z]=P(a,.4+R()*1.2); put(new T.PlaneGeometry(.18+R()*.12,.24),M.paper,x,.012,z,-Math.PI/2,0,R()*3); } } }
  // bueiros e tampas nas ruas
  let n=0; for(let i=0;i<N.length&&n<10;i+=7){ const p=N[(i*13)%N.length]; if(insideSolid(p.x,p.z,1.4)) continue; put(new T.CylinderGeometry(.34,.34,.02,14),M.cover,p.x,.012,p.z); n++; }
}

// ---------- interiores de pedra: castelo (Op 13) e mosteiro (Op 16) ----------
function heraldTex(k){ return canvasTex(64,128,(g,w,h)=>{ const C=[['#6a1a16','#c8a048'],['#1a2a5a','#d8d0b8'],['#1e3a24','#c8a048'],['#2a2a2a','#b84a2a']][k%4]; g.fillStyle=C[0];
  g.beginPath(); g.moveTo(0,0); g.lineTo(w,0); g.lineTo(w,h); g.lineTo(w/2,h-18); g.lineTo(0,h); g.closePath(); g.fill(); g.strokeStyle=C[1]; g.lineWidth=3; g.strokeRect(4,4,w-8,h-30);
  g.fillStyle=C[1]; if(k%4===0){ g.fillRect(27,30,10,44); g.fillRect(17,40,30,8); g.beginPath(); g.arc(32,24,8,0,7); g.fill(); }
  else if(k%4===1){ for(let i=0;i<3;i++){ g.beginPath(); g.moveTo(10,34+i*18); g.lineTo(32,22+i*18); g.lineTo(54,34+i*18); g.lineTo(54,40+i*18); g.lineTo(32,28+i*18); g.lineTo(10,40+i*18); g.closePath(); g.fill(); } }
  else if(k%4===2){ g.fillRect(18,40,28,34); for(let i=0;i<3;i++) g.fillRect(18+i*11,32,6,10); g.fillStyle=C[0]; g.fillRect(28,58,8,16); }
  else { g.beginPath(); g.arc(32,52,18,0,7); g.fill(); g.fillStyle=C[0]; g.beginPath(); g.arc(32,52,10,0,7); g.fill(); g.fillStyle=C[1]; g.fillRect(30,24,4,56); } }); }
function interiorDress(kind,H){ const R=mulberry32(kind==='castle'?1313:1616); const N=W.nav.nodes;
  const near=(x,z)=>{ for(const n of N){ const dx=n.x-x, dz=n.z-z; if(dx*dx+dz*dz<4.4) return true; } return false; };
  const stoneL=new T.MeshLambertMaterial({map:TEX.lime5,color:kind==='castle'?0xa09a8c:0x9a9080}), stoneD=new T.MeshLambertMaterial({map:TEX.lime5,color:0x4e4a42}), iron=hm(0x1e1e20), wax=hm(0xe8e0c8), flame=MAT.flame;
  const ban=[0,1,2,3].map(k=>new T.MeshLambertMaterial({map:heraldTex(k),transparent:true,alphaTest:.5,side:T.DoubleSide}));
  let glows=0; const gTex=TEX.soft2||canvasTex(32,32,(g)=>{ const gr=g.createRadialGradient(16,16,1,16,16,15); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,32,32); });
  const put=(geo,mat,x,y,z,ry)=>{ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.y=ry||0; dressAdd(m); return m; };
  for(const so of W.solids.slice()){ if(so.door||so.walk||so.tank||so.truck) continue; const h=so.maxY-so.minY; if(so.minY>.05||h<H-.05||h>H+.3) continue;
    const tx=so.maxX-so.minX, tz=so.maxZ-so.minZ, alongX=tx>tz, len=alongX?tx:tz, th=alongX?tz:tx; if(th>.5||len<2.2) continue;
    const a0=alongX?so.minX:so.minZ, a1=alongX?so.maxX:so.maxZ, mid=(a0+a1)/2;
    for(const s of [-1,1]){ const c=alongX?(s<0?so.minZ:so.maxZ):(s<0?so.minX:so.maxX); const P=(a,off)=>alongX?[a,c+s*off]:[c+s*off,a]; const [fx,fz]=P(mid,.8); if(!near(fx,fz)||insideSolid(fx,fz,.1)) continue;
      const ry=alongX?(s>0?0:Math.PI):(s>0?Math.PI/2:-Math.PI/2);
      const bx=(w,hh,d,mat,a,y,off)=>{ const [x,z]=P(a,off); return put(BOX(alongX?w:d,hh,alongX?d:w),mat,x,y,z); };
      bx(len,.42,.07,stoneD,mid,.21,.035); bx(len,.18,.16,stoneL,mid,H-.09,.08); bx(len,.08,.1,stoneD,mid,H-.24,.05);
      const step=kind==='castle'?4.6:3.6; const n=Math.floor((len-1.6)/step); for(let i=0;i<=n&&len>3;i++){ const a=a0+.8+(len-1.6)*(n?i/n:.5); bx(.42,H-.6,.14,stoneL,a,(H-.6)/2+.42,.07); bx(.56,.18,.22,stoneD,a,H-.45,.11); bx(.52,.12,.2,stoneD,a,.48,.1); }
      if(kind==='castle'&&len>=5&&R()<.75){ const a=a0+len*(.3+R()*.4), k=R()*4|0; const [x,z]=P(a,.1); put(new T.PlaneGeometry(1.1,2.5),ban[k],x,3.55,z,ry); bx(1.45,.05,.05,iron,a,4.82,.14); for(const e of [-.74,.74]) bx(.08,.08,.08,MAT.brass||iron,a+e,4.82,.14); }
      if(kind==='abbey'&&len>=4&&R()<.55&&glows<14){ const a=a0+len*(.25+R()*.5); bx(.5,.7,.05,stoneD,a,1.5,.03); bx(.56,.06,.16,stoneL,a,1.16,.08); const [x,z]=P(a,.1); put(new T.CylinderGeometry(.03,.03,.16,6),wax,x,1.27,z); put(new T.ConeGeometry(.02,.06,5),flame,x,1.38,z);
        const sp=new T.Sprite(new T.SpriteMaterial({map:gTex,color:0xffa040,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.6})); const [gx,gz]=P(a,.16); sp.position.set(gx,1.38,gz); sp.scale.setScalar(.6); scene.add(sp); glows++; } } } }

/* =========================================================
   VEÍCULOS DETALHADOS — carros, caminhões, tanque-pipa, moto, trem
   (peças fundidas por material: poucos draw calls)
   ========================================================= */
let VEHM=null;
function vehMats(){ if(VEHM) return VEHM; const HQ=MAT_HQ; const P=(c,sh,sp,ex)=>HQ?new T.MeshPhongMaterial(Object.assign({color:c,shininess:sh,specular:sp},ex||{})):new T.MeshLambertMaterial(Object.assign({color:c},ex||{}));
  const plateT=canvasTex(64,16,(g,w,h)=>{ g.fillStyle='#d8d4c4'; g.fillRect(0,0,w,h); g.fillStyle='#1a1a1a'; g.fillRect(1,1,w-2,1); g.fillRect(1,h-2,w-2,1); g.font='bold 11px monospace'; g.textAlign='center'; g.fillText('WH·'+(100+(Math.random()*800|0)),w/2,12); });
  const canvT=canvasTex(64,64,(g,w,h)=>{ g.fillStyle='#6e6a50'; g.fillRect(0,0,w,h); for(let i=0;i<260;i++){ g.fillStyle=`rgba(${Math.random()<.5?'30,28,20':'200,190,150'},${Math.random()*.12})`; g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*4,1); } for(let x=0;x<w;x+=16){ g.fillStyle='rgba(20,18,12,.25)'; g.fillRect(x,0,2,h); } },1.2);
  const plankT=canvasTex(64,64,(g,w,h)=>{ g.fillStyle='#5a4630'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=8){ const v=Math.random()*24|0; g.fillStyle=`rgb(${84+v},${64+v},${42+v*.6|0})`; g.fillRect(0,y+1,w,7); g.fillStyle='rgba(0,0,0,.4)'; g.fillRect(0,y,w,1); } },1);
  const trackT=canvasTex(32,64,(g,w,h)=>{ g.fillStyle='#1a1916'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=8){ g.fillStyle='#34322c'; g.fillRect(2,y+1,w-4,5); g.fillStyle='#46423a'; g.fillRect(4,y+2,w-8,2); g.fillStyle='#0c0b0a'; g.fillRect(w/2-2,y+2,4,3); } },.5);
  VEHM={P,bodies:new Map(),chrome:P(0xb8b4a8,90,0x9a9a9a),glass:P(0x141c22,110,0x8a9aaa),tire:P(0x151515,4,0x050505),rim:P(0x2c2c2a,20,0x1a1a1a),white:P(0xd8d4c4,10,0x111111),
    lamp:P(0xe8e2c0,120,0xffffff,{emissive:0x3a3420}),tail:P(0x8a1a12,60,0x442222),dark:P(0x1b1b1a,12,0x111111),plate:new T.MeshLambertMaterial({map:plateT}),
    canvas:new T.MeshLambertMaterial({map:canvT,color:0xb8b090}),plank:new T.MeshLambertMaterial({map:plankT}),track:new T.MeshLambertMaterial({map:trackT}),rust:P(0x5a3a26,6,0x0a0a0a),brass:P(0xa8843a,60,0x6a5a3a),soot:P(0x111110,8,0x0a0a0a),red:P(0x7a1a14,20,0x221111)};
  return VEHM; }
function vehBody(c){ const M=vehMats(); if(!M.bodies.has(c)) M.bodies.set(c,M.P(c,45,0x3a3a3a)); return M.bodies.get(c); }
// construtor: peças em coordenadas locais (frente = +z)
function vehB(){ const list=[]; const B={list,
  geo(geo,mat,x,y,z,rx,ry,rz,sx,sy,sz){ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); if(sx!==undefined) m.scale.set(sx,sy,sz); list.push(m); return m; },
  box(w,h,d,mat,x,y,z,rx,ry,rz){ return B.geo(BOX(w,h,d),mat,x,y,z,rx,ry,rz); },
  cylX(r,len,seg,mat,x,y,z){ return B.geo(new T.CylinderGeometry(r,r,len,seg),mat,x,y,z,0,0,Math.PI/2); },
  cylZ(r,len,seg,mat,x,y,z,r2){ return B.geo(new T.CylinderGeometry(r2!==undefined?r2:r,r,len,seg),mat,x,y,z,Math.PI/2,0,0); },
  domeZ(r,len,mat,x,y,z,sy,seg){ const g=new T.CylinderGeometry(r,r,len,seg||12,1,false,-Math.PI/2,Math.PI); g.rotateX(-Math.PI/2); return B.geo(g,mat,x,y,z,0,0,0,1,sy||1,1); },
  domeX(r,len,mat,x,y,z,sz,seg){ const g=new T.CylinderGeometry(r,r,len,seg||12,1,false,0,Math.PI); g.rotateZ(Math.PI/2); return B.geo(g,mat,x,y,z,0,0,0,1,1,sz||1); },
  wheel(x,y,z,r,w,o){ const M=vehMats(); o=o||{}; B.cylX(r,w,14,M.tire,x,y,z); const s=Math.sign(x)||1; B.cylX(r*.62,w+.02,12,o.rim||M.rim,x,y,z); if(o.white) B.cylX(r*.8,w+.012,14,M.white,x,y,z); B.cylX(r*.62,w+.016,12,o.rim||M.rim,x,y,z); B.cylX(r*.22,w+.06,8,M.chrome,x+s*.01,y,z); },
  // estáticos: transforma para o mundo e entrega ao mesclador do cenário
  place(x,z,yaw,y0){ const g=new T.Group(); g.position.set(x,y0||0,z); g.rotation.y=yaw; g.updateMatrixWorld(true); for(const m of list){ m.updateMatrix(); m.applyMatrix4(g.matrixWorld); dressAdd(m); } },
  // dinâmicos: funde por material e pendura no grupo do veículo
  bake(parent){ const groups=new Map(); for(const m of list){ m.updateMatrix(); const k=m.material.uuid; if(!groups.has(k)) groups.set(k,{mat:m.material,l:[]}); groups.get(k).l.push(m); } const out=[];
    for(const {mat,l} of groups.values()){ let n=0; const gs=l.map(m=>{ const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone(); g.applyMatrix4(m.matrix); n+=g.attributes.position.count; return g; });
      const pos=new Float32Array(n*3), nor=new Float32Array(n*3), uv=new Float32Array(n*2); let o=0; for(const g of gs){ pos.set(g.attributes.position.array,o*3); nor.set(g.attributes.normal.array,o*3); if(g.attributes.uv) uv.set(g.attributes.uv.array,o*2); o+=g.attributes.position.count; g.dispose(); }
      const G2=new T.BufferGeometry(); G2.setAttribute('position',new T.BufferAttribute(pos,3)); G2.setAttribute('normal',new T.BufferAttribute(nor,3)); G2.setAttribute('uv',new T.BufferAttribute(uv,2)); G2.computeBoundingSphere(); const mm=new T.Mesh(G2,mat); mm.userData.mat='metal'; parent.add(mm); out.push(mm); }
    return out; } }; return B; }
const CAR_COLORS=[0x18191b,0x23302a,0x3e1a1a,0x34404c,0x4a4c48,0x2a2a34,0x5a5040];
// sedã dos anos 30/40 (4,3 m)
function vehSedan(B,col,o){ const M=vehMats(), body=vehBody(col); o=o||{};
  B.box(1.28,.16,4.0,M.dark,0,.42,0);
  B.box(1.5,.55,2.7,body,0,.8,-.45); B.box(1.02,.5,1.4,body,0,.9,1.45); B.domeZ(.51,1.4,body,0,1.15,1.45,.28);
  B.box(.5,.62,.07,M.chrome,0,.93,2.16); B.box(.42,.54,.08,M.dark,0,.93,2.165); for(let i=-2;i<=2;i++) B.box(.025,.5,.09,M.chrome,i*.08,.93,2.17);
  B.box(1.36,.5,1.62,body,0,1.32,-.55); B.domeZ(.68,1.66,body,0,1.56,-.55,.3);
  B.box(1.375,.34,1.38,M.glass,0,1.36,-.6); B.box(1.18,.36,.05,M.glass,0,1.36,.27,-.32); B.box(1.0,.3,.05,M.glass,0,1.38,-1.37,.3);
  B.box(1.38,.06,1.5,body,0,1.55,-.57); B.box(.05,.4,.05,body,.66,1.35,-.55); B.box(.05,.4,.05,body,-.66,1.35,-.55);
  B.box(1.36,.44,.7,body,0,.92,-2.05,.32);
  for(const s of [-1,1]){ B.domeX(.44,.32,body,s*.62,.44,1.32,1.45); B.domeX(.42,.3,body,s*.62,.44,-1.42,1.3); B.box(.24,.04,1.75,M.dark,s*.78,.42,-.06); B.box(.04,.04,.12,M.chrome,s*.755,1.0,-.2); B.box(.04,.04,.12,M.chrome,s*.755,1.0,-1.05);
    B.box(.012,.5,.012,M.dark,s*.752,.82,-.6); B.box(.012,.5,.012,M.dark,s*.752,.82,.25);
    B.cylZ(.12,.16,12,M.chrome,s*.56,1.08,1.82); B.cylZ(.1,.02,12,M.lamp,s*.56,1.08,1.905); B.box(.07,.1,.05,M.tail,s*.55,.95,-2.42);
    B.wheel(s*.64,.36,1.32,.36,.2,{white:o.white}); B.wheel(s*.64,.36,-1.42,.36,.2,{white:o.white}); }
  B.box(1.62,.09,.1,M.chrome,0,.54,2.24); B.box(1.62,.09,.1,M.chrome,0,.54,-2.46); for(const s of [-1,1]){ B.box(.06,.16,.06,M.chrome,s*.4,.6,2.21); B.box(.06,.16,.06,M.chrome,s*.4,.6,-2.43); }
  B.box(.36,.1,.02,M.plate,0,.72,2.2); B.box(.36,.1,.02,M.plate,0,.72,-2.43,0,Math.PI,0);
  B.cylZ(.34,.16,14,M.tire,0,.98,-2.48); B.cylZ(.2,.17,10,body,0,.98,-2.48); }
// caminhão de carga 3 t (6 m) — variantes: 'canvas' | 'open' | 'tank'
function vehTruck(B,col,kind,o){ const M=vehMats(), body=vehBody(col); o=o||{};
  for(const s of [-1,1]) B.box(.12,.2,5.7,M.dark,s*.46,.66,-.1);
  B.box(1.04,.74,1.2,body,0,1.3,2.32); B.domeZ(.52,1.2,body,0,1.66,2.32,.3); for(let i=0;i<4;i++) for(const s of [-1,1]) B.box(.012,.3,.5,M.dark,s*.525,1.38,2.0+i*.15);
  B.box(1.0,.74,.06,M.dark,0,1.3,2.93); for(let i=-4;i<=4;i++) B.box(.03,.7,.07,M.chrome,i*.1,1.3,2.94); B.box(1.06,.08,.08,body,0,1.7,2.93);
  B.box(1.98,1.1,1.32,body,0,1.92,1.02); B.box(2.04,.08,1.44,body,0,2.5,1.0); B.box(1.66,.52,.05,M.glass,0,2.16,1.69); B.box(.05,.52,1.32,body,0,2.16,1.69);
  for(const s of [-1,1]){ B.box(.03,.44,.62,M.glass,s*.995,2.14,1.18); B.box(.04,.04,.14,M.chrome,s*1.0,1.86,1.2); B.box(.02,.02,.4,M.dark,s*1.12,2.3,1.6,0,s*.5,0); B.box(.04,.14,.1,M.glass,s*1.24,2.34,1.72);
    B.domeX(.52,.42,body,s*.82,.5,2.3,1.55); B.box(.42,.05,.9,body,s*.82,1.03,1.7); B.box(.34,.04,.5,M.dark,s*.95,.62,1.0);
    B.cylZ(.14,.18,12,M.dark,s*.74,1.26,2.62); B.cylZ(.12,.02,12,M.lamp,s*.74,1.26,2.72); B.box(.06,.08,.04,M.tail,s*.92,1.0,-2.98);
    B.wheel(s*.86,.46,2.3,.46,.26); B.wheel(s*.9,.46,-1.9,.46,.24); B.wheel(s*.62,.46,-1.9,.46,.24); B.box(.4,.06,1.2,body,s*.95,1.06,-1.9); }
  B.box(2.06,.12,.14,M.dark,0,.62,3.0); B.box(.36,.1,.02,M.plate,0,.82,3.0);
  B.cylZ(.05,1.4,6,M.soot,.7,.5,-.2);
  if(kind==='tank'){ B.box(2.0,.14,3.3,M.dark,0,1.1,-1.4); B.cylZ(.98,3.2,18,o.tankMat||body,0,1.98,-1.4); for(const zz of [-2.85,.05]) B.cylZ(1.0,.06,18,M.dark,0,1.98,zz); for(const zz of [-2.2,-1.4,-.6]) B.cylZ(1.0,.04,18,M.dark,0,1.98,zz); B.cylX(.03,1.9,6,M.dark,0,2.98,-1.4); B.geo(new T.CylinderGeometry(.24,.24,.16,10),M.dark,0,3.0,-1.4); for(let i=0;i<5;i++) B.box(.4,.03,.03,M.dark,0,1.1+i*.36,-3.06); for(const s of [-1,1]) B.box(.03,1.8,.03,M.dark,s*.2,1.9,-3.06); B.box(.12,.12,.2,M.chrome,.3,1.0,-3.1); }
  else { B.box(2.1,.12,3.3,M.plank,0,1.12,-1.4); for(const s of [-1,1]) B.box(.06,.5,3.3,M.plank,s*1.03,1.43,-1.4); B.box(2.1,.5,.06,M.plank,0,1.43,-3.03); B.box(2.1,.5,.06,M.plank,0,1.43,.22);
    if(kind==='canvas'){ B.box(2.12,.62,3.3,M.canvas,0,1.98,-1.4); B.domeZ(1.06,3.3,M.canvas,0,2.29,-1.4,.42,14); for(const zz of [-2.9,-1.95,-1.0,-.05]){ const t=new T.TorusGeometry(1.07,.025,4,14,Math.PI); B.geo(t,M.dark,0,2.29,zz,0,0,0,1,.42,1); } B.box(1.9,.7,.04,M.canvas,0,1.98,-3.06); }
    else if(o.cargo){ for(let i=0;i<5;i++) B.box(.5,.4,.6,M.plank,(i%2?.4:-.45),1.38,-.4-i*.55); for(let i=0;i<4;i++){ B.cylZ(.28,.62,10,M.rust,(i%2?-.5:.5),1.46,-2.5+(i>>1)*.66); } } }
  if(o.jerry) for(let i=0;i<3;i++) B.box(.14,.34,.24,vehBody(0x3a4232),1.1,.82,.6-i*.26); }
// carro estacionado (mantém a colisão antiga, só troca o visual)
function carDetail(x,z,alongZ){ const R=mulberry32(((x*73+z*31)|0)+9); const B=vehB(); const col=G&&G.level&&['06','07','08'].includes(G.level.id)?[0x8a7a5a,0x6a6048,0x4a4c48][R()*3|0]:CAR_COLORS[R()*CAR_COLORS.length|0]; vehSedan(B,col,{white:R()<.35}); B.place(x,z,(alongZ?0:Math.PI/2)+(R()<.5?Math.PI:0)+(R()-.5)*.06); }
// motocicleta + sidecar (frente = +z, sidecar em +x)
function bikeDetail(g,rider){ const M=vehMats(), body=vehBody(0x2f3530), B=vehB();
  for(const z of [-.7,.7]){ B.cylX(.33,.11,16,M.tire,0,.33,z); B.cylX(.24,.12,14,M.chrome,0,.33,z); B.cylX(.21,.125,14,M.rim,0,.33,z); B.cylX(.06,.16,8,M.chrome,0,.33,z); B.domeX(.37,.14,body,0,.35,z,1.1); }
  B.box(.06,.06,1.2,M.dark,0,.62,0,-.12); B.box(.06,.5,.06,M.dark,0,.62,.6,.35); B.box(.06,.06,.6,M.dark,0,.44,-.4,.25);
  B.geo(new T.SphereGeometry(.18,10,8),body,0,.9,.18,0,0,0,.9,.7,1.6); B.box(.2,.06,.36,M.dark,0,.88,-.28); B.box(.22,.08,.3,M.dark,0,.8,-.62);
  B.box(.3,.32,.4,M.rim,0,.58,.05); B.cylZ(.035,.9,6,M.chrome,-.18,.45,-.45); B.cylZ(.05,.25,8,M.chrome,-.18,.45,-.95);
  B.box(.62,.03,.03,M.chrome,0,1.05,.56); for(const s of [-1,1]) B.box(.04,.04,.1,M.dark,s*.31,1.05,.52); B.cylZ(.09,.1,12,M.chrome,0,.95,.72); B.cylZ(.075,.02,12,M.lamp,0,.95,.78);
  if(!rider){ B.geo(new T.SphereGeometry(.5,12,8),body,1.05,.62,0,0,0,0,.72,.5,1.55); B.box(.62,.06,.9,M.dark,1.05,.84,-.12); B.cylX(.03,1.05,6,M.dark,.52,.42,.4); B.cylX(.03,1.05,6,M.dark,.52,.42,-.4);
    B.cylX(.3,.1,14,M.tire,1.5,.3,0); B.cylX(.2,.11,12,M.rim,1.5,.3,0); B.domeX(.34,.12,body,1.5,.32,0,1.1); B.box(.06,.06,.3,M.dark,1.05,.92,.5); }
  for(const c of g.children.slice()) c.visible=false; B.bake(g); }
// trem: locomotiva a vapor e vagões fechados (eixo x = comprimento)
function locoDetail(g,len){ const M=vehMats(), blk=vehBody(0x1d1d1c), red=M.red, B=vehB(); const h=len/2;
  B.box(2.6,.35,len,M.dark,0,1.05,0); for(const s of [-1,1]) B.box(.08,.3,len,red,s*1.2,1.0,0);
  B.cylZ(1.05,len*.62,18,blk,0,2.45,h-len*.31-1.0); for(let i=0;i<5;i++) B.cylZ(1.07,.06,18,M.brass,0,2.45,h-1.2-i*1.2); B.cylZ(1.12,.5,18,M.soot,0,2.45,h-.8); B.cylZ(.7,.06,14,M.soot,0,2.45,h-.52);
  B.geo(new T.CylinderGeometry(.32,.42,1.0,12),M.soot,0,3.85,h-1.1); B.geo(new T.CylinderGeometry(.44,.36,.18,12),M.soot,0,4.4,h-1.1); B.geo(new T.SphereGeometry(.42,12,8),blk,0,3.4,h-3.3,0,0,0,1,.8,1); B.geo(new T.SphereGeometry(.32,10,6),M.brass,0,3.35,h-4.6,0,0,0,1,.8,1);
  B.cylZ(.14,.16,10,M.chrome,0,3.15,h-.48); B.cylZ(.12,.02,10,M.lamp,0,3.15,h-.39);
  for(const s of [-1,1]){ B.box(.5,.06,len*.6,blk,s*1.15,1.95,h-len*.3-1.0); for(let i=0;i<3;i++){ const z=h-3.1-i*1.65; B.cylX(.78,.16,18,M.dark,s*1.08,.85,z); B.cylX(.62,.17,16,red,s*1.08,.85,z); B.cylX(.12,.24,8,M.chrome,s*1.12,.85,z); } B.box(.06,.1,3.6,M.chrome,s*1.22,.72,h-4.75); B.cylZ(.24,1.0,10,blk,s*.95,1.1,h-1.6); }
  B.box(2.4,.5,.25,red,0,.8,h+.05); for(const s of [-1,1]){ B.cylZ(.1,.4,8,M.dark,s*.85,1.15,h+.3); B.cylZ(.2,.06,10,M.dark,s*.85,1.15,h+.52); }
  for(let i=0;i<5;i++) B.box(.08,.5,.7,M.dark,-.9+i*.45,.45,h+.25,0.5);
  B.box(2.7,2.4,2.4,blk,0,2.8,-h+1.4); B.box(2.9,.12,2.7,M.soot,0,4.05,-h+1.35); for(const s of [-1,1]) B.box(.04,.7,.8,M.glass,s*1.36,3.2,-h+1.6); B.box(1.0,.6,.04,M.glass,.6,3.3,-h+2.61); B.box(1.0,.6,.04,M.glass,-.6,3.3,-h+2.61);
  for(const c of g.children.slice()) c.visible=false; const sub=new T.Group(); sub.rotation.y=Math.PI/2; g.add(sub); return B.bake(sub); }
function boxcarDetail(g,len,color){ const M=vehMats(), body=vehBody(color), B=vehB(); const h=len/2, wallM=new T.MeshLambertMaterial({map:vehMats().plank.map,color:color===0x5a3a2a?0xb08868:0x9a9a8a});
  B.box(2.7,.3,len,M.dark,0,1.0,0); B.box(2.8,2.5,len-.1,wallM,0,2.35,0); B.domeZ(1.5,len,body,0,3.55,0,.22,14); for(let z=-h+.5;z<h;z+=1.0) for(const s of [-1,1]) B.box(.04,2.5,.08,M.dark,s*1.41,2.35,z);
  for(const s of [-1,1]){ B.box(.05,.06,len-.4,M.dark,s*1.43,3.55,0); B.box(.05,.06,len-.4,M.dark,s*1.43,1.15,0); }
  for(const e of [-1,1]){ B.box(2.4,.3,.2,M.red,0,1.0,e*(h+.05)); for(const s of [-1,1]){ B.cylZ(.09,.36,8,M.dark,s*.8,1.0,e*(h+.25)); B.cylZ(.18,.06,10,M.dark,s*.8,1.0,e*(h+.44)); } }
  for(const zz of [-h+1.2,h-1.2]){ B.box(2.2,.3,1.8,M.dark,0,.7,zz); for(const dz of [-.55,.55]) for(const s of [-1,1]){ B.cylX(.45,.12,14,M.dark,s*1.1,.45,zz+dz); B.cylX(.08,.2,8,M.chrome,s*1.14,.45,zz+dz); } }
  for(const c of g.children.slice()) if(c.geometry&&c.geometry.parameters&&c.geometry.parameters.width===len) c.visible=false; else if(c.geometry&&c.geometry.type==='CylinderGeometry') c.visible=false;
  const sub=new T.Group(); sub.rotation.y=Math.PI/2; g.add(sub); B.bake(sub); }
// enfeites dos caminhões móveis (Ops 7 e 8) — não alteram as zonas de tiro
function tankerDecor07(g){ const M=vehMats(), body=vehBody(0x5a5a46), B=vehB();
  for(const s of [-1,1]){ B.domeX(.56,.46,body,s*1.0,.5,3.62,1.45); B.box(.5,.06,2.1,M.dark,s*1.0,.98,-2.45); B.box(.03,.03,.5,M.dark,s*1.22,2.35,3.05,0,s*.5,0); B.box(.05,.18,.12,M.glass,s*1.45,2.4,3.25); B.box(.06,.08,.04,M.tail,s*.9,1.0,-3.82);
    B.cylX(.2,.32,10,M.rim,s*1.02,.46,-3.05); B.cylX(.2,.32,10,M.rim,s*1.02,.46,-1.85); B.cylX(.2,.32,10,M.rim,s*1.0,.46,3.62); B.cylZ(.03,4.6,6,M.dark,s*.32,3.32,-1.25); for(const zz of [-3.3,-1.25,.8]) B.box(.03,.26,.03,M.dark,s*.32,3.2,zz); }
  for(const zz of [-3.0,-2.1,-.4,.5]) B.cylZ(1.04,.06,18,M.dark,0,2.0,zz); for(let i=0;i<6;i++) B.box(.42,.03,.03,M.dark,0,1.2+i*.32,-3.78); for(const s of [-1,1]) B.box(.03,1.9,.03,M.dark,s*.2,2.1,-3.78);
  for(let i=-3;i<=3;i++) B.box(.03,.56,.06,M.chrome,i*.17,1.34,4.47); B.box(2.3,.14,.16,M.dark,0,.72,4.55); B.box(.36,.1,.02,M.plate,0,.92,4.56); B.box(.9,.04,.6,M.dark,0,2.56,2.45);
  B.bake(g); }
function cargoDecor08(g,lrdg){ const M=vehMats(), body=vehBody(lrdg?0xc8a48c:0x8a8064), B=vehB();
  B.box(1.8,.5,.05,M.glass,0,2.0,3.21); for(const s of [-1,1]){ B.box(.03,.42,.7,M.glass,s*1.1,1.98,2.5); B.domeX(.54,.44,body,s*1.0,.48,3.5,1.45); B.cylZ(.13,.16,12,M.dark,s*.6,1.5,4.3); B.cylZ(.11,.02,12,M.lamp,s*.6,1.5,4.39); B.box(.03,.03,.5,M.dark,s*1.2,2.25,3.0,0,s*.5,0); B.box(.05,.16,.12,M.glass,s*1.42,2.3,3.2);
    B.cylX(.19,.3,10,M.rim,s*1.0,.44,-2.6); B.cylX(.19,.3,10,M.rim,s*1.0,.44,-1.5); B.cylX(.19,.3,10,M.rim,s*1.0,.44,3.5); B.box(.06,.08,.04,M.tail,s*.95,1.0,-3.62); }
  B.box(1.6,.62,.06,M.dark,0,1.3,4.3); for(let i=-3;i<=3;i++) B.box(.03,.56,.07,M.chrome,i*.2,1.3,4.32); B.box(2.2,.14,.16,M.dark,0,.72,4.4); B.box(.36,.1,.02,M.plate,0,.92,4.41);
  if(lrdg){ for(const s of [-1,1]){ B.box(.05,.26,1.5,M.rust,s*1.14,1.55,-.6); for(let i=0;i<4;i++) B.box(.14,.34,.24,vehBody(0x4a5232),s*.85,1.62,-3.2+i*.3); } B.cylZ(.42,.26,14,M.tire,0,1.9,4.0); B.box(.6,.25,.4,M.canvas,-.5,1.6,-2.0); }
  else { for(const zz of [-3.4,-2.4,-1.4,-.4,.6]){ const t=new T.TorusGeometry(1.16,.03,4,14,Math.PI); B.geo(t,M.dark,0,1.5,zz,0,0,0); } B.box(2.2,.9,.04,M.canvas,0,1.95,-3.68); }
  B.bake(g); }

function dressAdd(m){ scene.add(m); DRESS.push(m); return m; }
function mergeDress(){ if(!DRESS.length) return; const groups=new Map(); for(const m of DRESS){ if(!m.parent) continue; m.updateMatrixWorld(true); const k=m.material.uuid; if(!groups.has(k)) groups.set(k,{mat:m.material,list:[]}); groups.get(k).list.push(m); }
  for(const {mat,list} of groups.values()){ if(list.length<4) continue; let n=0; const geos=list.map(m=>{ const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone(); g.applyMatrix4(m.matrixWorld); n+=g.attributes.position.count; return g; });
    const pos=new Float32Array(n*3), nor=new Float32Array(n*3), uv=new Float32Array(n*2); let o=0; for(const g of geos){ pos.set(g.attributes.position.array,o*3); if(g.attributes.normal) nor.set(g.attributes.normal.array,o*3); if(g.attributes.uv) uv.set(g.attributes.uv.array,o*2); o+=g.attributes.position.count; g.dispose(); }
    const G2=new T.BufferGeometry(); G2.setAttribute('position',new T.BufferAttribute(pos,3)); G2.setAttribute('normal',new T.BufferAttribute(nor,3)); G2.setAttribute('uv',new T.BufferAttribute(uv,2)); const M2=new T.Mesh(G2,mat); M2.matrixAutoUpdate=false; scene.add(M2); for(const m of list) m.parent.remove(m); }
  DRESS=[]; }
let PARIS_M=null;
function parisDress(x0,x1,z0,z1,h){ if(!PARIS_M) PARIS_M={zinc:new T.MeshLambertMaterial({color:0x5a6470}),corn:new T.MeshLambertMaterial({map:TEX.lime5,color:0xd8ccb8}),iron:new T.MeshLambertMaterial({color:0x1e2022}),chim:new T.MeshLambertMaterial({map:TEX.lime5,color:0xb08a6a}),pot:new T.MeshLambertMaterial({color:0x8a4a2a}),aw:[0xa02828,0x2a5a3a,0x284a7a,0x8a6a2a]};
  const M=PARIS_M, w=x1-x0, d=z1-z0, cx=(x0+x1)/2, cz=(z0+z1)/2; const R=mulberry32(((x0*31+z0*17+h)|0)+7);
  // cornija saliente no topo e faixa do térreo
  for(const [ww,dd,y,t] of [[w+.6,d+.6,h-.15,.3],[w+.24,d+.24,3.3,.18]]){ const m=new T.Mesh(BOX(ww,t,dd),M.corn); m.position.set(cx,y,cz); dressAdd(m); }
  // telhado mansarda (zinco) com águas-furtadas
  if(w>3&&d>3){ const g=new T.CylinderGeometry(.62,1,1,4,1); g.rotateY(Math.PI/4); g.scale(w*.72,2.6,d*.72); const m=new T.Mesh(g,M.zinc); m.position.set(cx,h+1.3,cz); dressAdd(m);
    const nd=Math.max(1,Math.floor(Math.max(w,d)/5)); for(let i=0;i<nd;i++){ const along=w>=d; const t=(i+.5)/nd; const dx=along?x0+w*t:x0-.1, dz=along?z0-.1:z0+d*t; for(const sgn of [0,1]){ const px=along?dx:(sgn?x1+.1:x0-.1)+(sgn?-.7:.7), pz=along?(sgn?z1+.1:z0-.1)+(sgn?-.7:.7):dz; const dm=new T.Mesh(BOX(along?1.1:1,1.1,along?1:1.1),M.corn); dm.position.set(px,h+.85,pz); dressAdd(dm); const gl=new T.Mesh(BOX(along?.6:1.02,.6,along?1.02:.6),new T.MeshBasicMaterial({color:0x2a3038})); gl.position.set(px,h+.8,pz); dressAdd(gl); const cap=new T.Mesh(BOX(along?1.3:1.2,.12,along?1.2:1.3),M.zinc); cap.position.set(px,h+1.45,pz); dressAdd(cap); } } }
  // chaminés
  for(let i=0;i<Math.max(2,Math.floor(w*d/120));i++){ const x=x0+1+R()*(w-2), z=z0+1+R()*(d-2); const c=new T.Mesh(BOX(1.2,1.6,.6),M.chim); c.position.set(x,h+2.4,z); dressAdd(c); for(let k=0;k<3;k++){ const p=new T.Mesh(new T.CylinderGeometry(.09,.11,.35,6),M.pot); p.position.set(x-.4+k*.4,h+3.35,z); dressAdd(p); } }
  // sacadas de ferro no 2º e 5º andar (faixa contínua)
  for(const y of [6.6,h>13?12.2:null]){ if(!y||y>h-1) continue; for(const [ww,dd,ox,oz] of [[w,.5,0,-d/2-.25],[w,.5,0,d/2+.25],[.5,d,-w/2-.25,0],[.5,d,w/2+.25,0]]){ const sl=new T.Mesh(BOX(ww,.08,dd),M.corn); sl.position.set(cx+ox,y,cz+oz); dressAdd(sl); const rl=new T.Mesh(BOX(ww>1?ww:.04,.05,dd>1?dd:.04),M.iron); rl.position.set(cx+ox+(ww>1?0:Math.sign(ox)*.24),y+.85,cz+oz+(dd>1?0:Math.sign(oz)*.24)); dressAdd(rl);
      const n=Math.floor(Math.max(ww,dd)/.35); const bars=[]; for(let i=0;i<n;i++){ const t=-Math.max(ww,dd)/2+i*.35+.17; bars.push(ww>1?[cx+ox+t,y+.43,cz+oz+Math.sign(oz)*.24,.025,.8,.025,0]:[cx+ox+Math.sign(ox)*.24,y+.43,cz+oz+t,.025,.8,.025,0]); } instanced(new T.BoxGeometry(1,1,1),M.iron,bars); } }
  // toldos de loja no térreo, em algumas fachadas
  for(const [side,len] of [[0,w],[1,w],[2,d],[3,d]]){ if(R()<.55||len<4) continue; const n=Math.floor(len/5); const col=M.aw[Math.floor(R()*4)]; const mat=new T.MeshLambertMaterial({map:textTex(32,32,(g,W2,H2)=>{ g.fillStyle='#'+col.toString(16).padStart(6,'0'); g.fillRect(0,0,W2,H2); g.fillStyle='#e8e0d0'; for(let i=0;i<4;i++) g.fillRect(i*8,0,4,H2); }),side:T.DoubleSide});
    for(let i=0;i<n;i++){ if(R()<.35) continue; const t=-len/2+(i+.5)*(len/n); const a=new T.Mesh(new T.PlaneGeometry(2.6,1.4),mat); if(side<2){ const zz=side?z1:z0, sg=side?1:-1; a.position.set(cx+t,2.85,zz+sg*.6); a.rotation.x=sg*(Math.PI/2-.55); } else { const xx=side===3?x1:x0, sg=side===3?1:-1; a.position.set(xx+sg*.6,2.85,cz+t); a.rotation.set(0,Math.PI/2,0); a.rotateX(-sg*(Math.PI/2-.55)); } dressAdd(a); } }
}
function planeTree(x,z,s){ s=s||1; if(!PARIS_M) parisDress(0,0,0,0,0); const tr=new T.Mesh(new T.CylinderGeometry(.16*s,.22*s,3.4*s,7),new T.MeshLambertMaterial({color:0x8a8070})); tr.position.set(x,1.7*s,z); dressAdd(tr); addSolidOnly(x-.25,x+.25,z-.25,z+.25,3,0,true);
  const R=mulberry32(((x*13+z*7)|0)+3); const leaf=[0x4a6a34,0x3e5a2c,0x56763a]; for(let i=0;i<4;i++){ const c=new T.Mesh(new T.IcosahedronGeometry((1.3+R()*.6)*s,0),new T.MeshLambertMaterial({color:leaf[i%3]})); c.position.set(x+rnd(-.9,.9)*s,(3.6+R()*1.4)*s,z+rnd(-.9,.9)*s); c.rotation.set(R()*3,R()*3,0); dressAdd(c); }
  const grate=new T.Mesh(BOX(1.4,.03,1.4),new T.MeshLambertMaterial({color:0x2a2c2e})); grate.position.set(x,.02,z); dressAdd(grate); }
function cafeTable(x,z,col){ const top=new T.Mesh(new T.CylinderGeometry(.36,.36,.04,12),new T.MeshLambertMaterial({color:0xd8d0c0})); top.position.set(x,.74,z); dressAdd(top); const leg=new T.Mesh(new T.CylinderGeometry(.03,.05,.74,6),PARIS_M?PARIS_M.iron:hm(0x1e2022)); leg.position.set(x,.37,z); dressAdd(leg);
  for(const [dx,dz] of [[.6,0],[-.6,0]]){ const ch=new T.Mesh(BOX(.36,.04,.36),new T.MeshLambertMaterial({color:0x8a5a2a})); ch.position.set(x+dx,.45,z+dz); dressAdd(ch); const bk=new T.Mesh(BOX(.04,.4,.36),new T.MeshLambertMaterial({color:0x8a5a2a})); bk.position.set(x+dx*1.25,.66,z+dz); dressAdd(bk); }
  const um=new T.Mesh(new T.ConeGeometry(1.1,.5,8,1,true),new T.MeshLambertMaterial({color:col||0xc83030,side:T.DoubleSide})); um.position.set(x,2.2,z); dressAdd(um); const pole=new T.Mesh(new T.CylinderGeometry(.02,.02,1.5,5),hm(0xd8d0c0)); pole.position.set(x,1.5,z); dressAdd(pole); addSolidOnly(x-.5,x+.5,z-.5,z+.5,1,0,true); }
function barricade(x0,x1,z,alongX){ const R=mulberry32(((x0*13+z*7)|0)+999); if(alongX!==false){ for(let x=x0;x<x1-.5;x+=1.4){ const h=.8+R()*.6; addBlock(x,x+1.3,z-.5,z+.5,h,{mat:R()<.5?MAT.sandbag:MAT.crate,surf:R()<.5?'sandbag':'wood',cover:true,seg:1}); } addMesh(new T.CylinderGeometry(.45,.45,1.4,10),hm(0x5a3a22),x0+1.5,1.4,z,'wood').rotation.z=Math.PI/2; }
  else { for(let zz=x0;zz<x1-.5;zz+=1.4){ const h=.8+R()*.6; addBlock(z-.5,z+.5,zz,zz+1.3,h,{mat:R()<.5?MAT.sandbag:MAT.crate,surf:R()<.5?'sandbag':'wood',cover:true,seg:1}); } } }
function tricolor(x,y,z,ry){ return poster(x,y,z,ry,1.4,.9,(g,w,h)=>{ g.fillStyle='#1a3a8a'; g.fillRect(0,0,w/3,h); g.fillStyle='#f0ece0'; g.fillRect(w/3,0,w/3,h); g.fillStyle='#c02020'; g.fillRect(2*w/3,0,w/3,h); }); }
function halftrack(id,x,z,ry){ const g=new T.Group(); g.position.set(x,0,z); g.rotation.y=ry||0; scene.add(g); const m=hm(0x5a5e4a), d=hm(0x2a2a26);
  const hull=new T.Mesh(BOX(2.2,1.3,5.6),m); hull.position.y=1.15; g.add(hull); const hood=new T.Mesh(BOX(1.8,.8,1.6),m); hood.position.set(0,1.1,3.4); g.add(hood);
  for(const s of [-1,1]){ const tr=new T.Mesh(BOX(.4,.8,3.6),d); tr.position.set(s*1,.4,-1); g.add(tr); const w=new T.Mesh(new T.CylinderGeometry(.42,.42,.3,12),d); w.rotation.z=Math.PI/2; w.position.set(s*.95,.42,3.4); g.add(w); }
  const mg=new T.Mesh(BOX(.1,.1,1.1),MAT.darkMetal); mg.position.set(0,2.1,1.6); g.add(mg); const sh=new T.Mesh(BOX(.9,.6,.06),m); sh.position.set(0,2,1.2); g.add(sh);
  const cs=Math.cos(ry||0), sn=Math.sin(ry||0), hx=Math.abs(cs)*1.15+Math.abs(sn)*2.9, hz=Math.abs(sn)*1.15+Math.abs(cs)*2.9; const sol=addSolidOnly(x-hx,x+hx,z-hz,z+hz,1.9,0,true);
  for(const c of g.children){ c.userData={mat:'metal'}; W.shootables.push(c); }
  const H={id,g,x,z,hp:100,dead:false,burn:0,sol}; (G.refs.hts||(G.refs.hts=[])).push(H); return H; }
function htDamage(H,dmg){ if(H.dead) return; H.hp-=dmg; if(H.hp<=0){ H.dead=true; for(const c of H.g.children) c.material=hm(0x1a1816); explode(V3(H.x,1.2,H.z),{r:6,dmgE:220,dmgP:70,src:'player',kind:'wreck'}); if(G.fires&&G.fires.length<8) G.fires.push({x:H.x,z:H.z,L:null}); AudioSys.play('explosion',V3(H.x,1,H.z),1.4); if(G.level.onHalftrack) G.level.onHalftrack(H); } }
function htExplodeHook(pos,o){ for(const H of (G.refs.hts||[])){ const d=Math.hypot(pos.x-H.x,pos.z-H.z); if(d<(o.r||5)+2.4) htDamage(H,o.kind==='molotov'?25:o.kind==='rocket'?95:Math.max(15,70*(1-d/((o.r||5)+2.4)))); } }
function molotovFire(pos){ (G.burns||(G.burns=[])).push({x:pos.x,z:pos.z,t:9,tick:0}); if(!G.fires) G.fires=[]; }
function burnTick(dt){ if(!G.burns) return; const P=G.player; for(const b of G.burns){ b.t-=dt; b.tick-=dt; if(Math.random()<dt*14) FX.puff(V3(b.x+rnd(-1.6,1.6),.4,b.z+rnd(-1.6,1.6)),1,Math.random()<.6?0xff8a30:0x3a2a1a,.6,.5,V3(0,1.6,0),.5);
    if(b.tick<=0){ b.tick=.4; for(const e of G.enemies){ if(e.dead) continue; if(Math.hypot(e.pos.x-b.x,e.pos.z-b.z)<2.4){ e.takeDamage({dmg:22,region:'chest',dir:V3(0,1,0),point:e.pos.clone(),shooter:'player'}); } } for(const H of (G.refs.hts||[])) if(Math.hypot(H.x-b.x,H.z-b.z)<3.6) htDamage(H,9); if(Math.hypot(P.pos.x-b.x,P.pos.z-b.z)<2) hurtPlayer(8,V3(b.x,1,b.z)); } }
  G.burns=G.burns.filter(b=>b.t>0); }
function firesTick(dt){ if(G.fires) for(const f of G.fires){ if(Math.random()<dt*6) FX.puff(V3(f.x+rnd(-1,1),1.2,f.z+rnd(-1,1)),1,Math.random()<.5?0xff9a40:0x2a2420,Math.random()<.5?.8:1.6,Math.random()<.5?.6:3,V3(0,1.4,0),.6); if(f.L) f.L.intensity=1.6+Math.random()*.8; } }
function summerSky(seed){ skyDome(seed,[[0,'#3a6aa8'],[.3,'#7aa0c8'],[.44,'#c8d8e0'],[.5,'#e8e0c8'],[.53,'#8a8070'],[1,'#4a4038']],null,10); }

/* =========================================================
   OPERAÇÃO 21 — Levante Final (Île de la Cité, 19/08/1944, 07h)
   ========================================================= */
const ENEMY_DEFS_21=[
  {id:'g1',x:-36,z:6,yaw:Math.PI/2,weapon:'rifle',helmet:true},
  {id:'g2',x:-40,z:14,weapon:'smg',patrol:[[-40,14],[-40,2]]},
  {id:'g3',x:-30,z:16,yaw:Math.PI,weapon:'rifle'},
  {id:'h1',x:15,z:-3,yaw:Math.PI/2,weapon:'smg',helmet:true},
  {id:'h2',x:7,z:-6,weapon:'rifle',helmet:true,patrol:[[7,-6],[7,6]]},
  {id:'h3',x:-17,z:-22,yaw:Math.PI,weapon:'smg',helmet:true},
  {id:'h4',x:-24,z:-28,weapon:'rifle',helmet:true,patrol:[[-24,-28],[-12,-28]]},
  {id:'s1',x:0,z:20,weapon:'rifle',helmet:true,patrol:[[0,20],[0,8]]},
  {id:'s2',x:22,z:18,yaw:-Math.PI/2,weapon:'rifle'},
  {id:'s3',x:-12,z:2,yaw:Math.PI,weapon:'smg',helmet:true},
  {id:'p1',x:-6,z:-34,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'p2',x:6,z:-34,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'p3',x:0,z:-36,yaw:Math.PI,weapon:'pistol',officer:true},
  {id:'p4',x:-11,z:-31,yaw:Math.PI*.8,weapon:'smg',helmet:true},
  {id:'p5',x:11,z:-31,yaw:-Math.PI*.8,weapon:'smg',helmet:true},
  {id:'w1',x:28,z:-14,weapon:'rifle',helmet:true,patrol:[[28,-14],[28,-20],[33,-20]]},
];
function light21(x,z){ return .85; }
function buildLevel21(){
  M5=mats05(); M6=mats06(); const M=M6;
  scene.background=new T.Color(0x8aa8c8); scene.fog=new T.FogExp2(0xa8b8c8,.008); summerSky(2121);
  scene.add(new T.HemisphereLight(0xd8e0f0,0x6a5a4a,.85)); const sun=new T.DirectionalLight(0xfff0d8,.9); sun.position.set(30,50,40); scene.add(sun); scene.add(new T.AmbientLight(0x5a5a60,.35));
  const gg=new T.PlaneGeometry(110,110,40,40); gg.rotateX(-Math.PI/2); { const p=gg.attributes.position, uv=gg.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i),p.getZ(i)); } const ground=new T.Mesh(gg,MAT.ground); ground.userData.mat='stone'; scene.add(ground); W.shootables.push(ground);
  // quarteirões (ruas: x=0 norte-sul, z=-6..6? e transversais)
  for(const [x0,x1,z0,z1] of [[-52,-46,-52,52],[46,52,-52,52],[-46,46,46,52],
    [-46,-24,24,46],[-18,-5,24,46],[5,18,24,46],[24,46,24,46],
    [-46,-44,-16,18],[-24,-5,8,18],[5,24,8,18],[30,46,8,18],
    [-24,-5,-18,-8],[5,24,-18,-8],[36,46,-18,8],
    [-46,-30,-52,-22],[30,46,-52,-22]]) parisBlock(x0,x1,z0,z1,13+((x0*7+z0)%3+3)%3);
  // garagem confiscada (oeste): x -44..-30, z -16..18 com portão
  const wl=(axis,c0,c1,a0,a1,ops,mat)=>wallOpen(axis,c0,c1,a0,a1,4.5,ops||[],mat||MAT.facadeA,{inner:{}});
  wl('z',-30.2,-30,-2,18,[{c:8,w:3}]); wl('x',-2.2,-2,-44,-30); wl('x',18,18.2,-44,-30); addBlock(-44.2,-29.8,-2.2,18.2,.4,{y0:4.5,mat:MAT.roof,bottom:MAT.ceil,surf:'stone',seg:3});
  crate(-40,4,1.4,1.2); crate(-38.4,4,1.2,1); car(-36,12,true); const cache=addBlock(-42.6,-41,14,15.6,.8,{mat:M.wood,surf:'wood',seg:1}); const bottles=[]; for(let i=0;i<6;i++){ const b=addMesh(new T.CylinderGeometry(.05,.06,.3,6),hm(0x3a5a2a),-42.4+i*.25,.95,14.8,null); bottles.push(b); }
  // a Prefeitura (norte): fachada, pátio atrás do portão
  addBlock(-30,30,-52,-40,16,{mat:MAT.facadeC,surf:'stone',seg:6}); addBlock(-2.5,2.5,-40.2,-40,4.6,{mat:new T.MeshBasicMaterial({color:0x0a0a0a}),solid:false});
  makeDoor('pref',{x:0,z:-39.9,w:5,d:.2,h:4.6,mat:MAT.darkMetal,offset:V3(5,0,0),locked:true,npc:false,nav:true,snd:'door'});
  for(const x of [-12,12]) tricolor(x,9,-39.9,0).visible=false;
  poster(0,6.4,-39.92,0,8,1.1,(g,w,h)=>{ g.fillStyle='#d8d0b8'; g.fillRect(0,0,w,h); g.fillStyle='#2a2418'; g.font='bold 21px serif'; g.textAlign='center'; g.fillText('PRÉFECTURE DE POLICE',w/2,h*.72); });
  sandbags(-8,-3,-37,-36.2); sandbags(3,8,-37,-36.2); sandbags(-13,-9,-33,-32.2); sandbags(9,13,-33,-32.2);
  // barricadas da Resistência
  barricade(-4,4,40); barricade(-4,4,-14,false); const R0=[]; barricade(34,46,-21,true);
  for(const [x,y,z,r] of [[-4.6,8,23.9,0],[12,9,23.9,0],[-20,9,17.9+.2,0]]) tricolor(x,y,z,r);
  // semilagartas
  G.refs.hts=[]; const ht1=halftrack('ht1',12,-1,Math.PI/2), ht2=halftrack('ht2',-14,-26,0);
  // postes, vasos, carros
  for(const [x,z] of [[-4,30],[4,0],[-4,-20],[20,-4]]) lampPost('L'+x+z,x,z,x<0?1:-1,0);
  car(-2.6,-6,true); car(26,21,false); car(-26,-4,false); barrel(-8,-12); barrel(-7.4,-12.6);
  // combatentes FFI
  const squad=ffiSquad([[-2.6,41,Math.PI,'rifle'],[2.6,41.2,Math.PI,'smg'],[0.4,42,Math.PI,'rifle'],[38,-20,Math.PI*1.2,'rifle'],[42,-20.4,Math.PI,'rifle']]);
  // navegação
  for(const [x,z,c] of [[-15,21,0xc83030],[-12.4,21,0x2a6a4a],[20.5,19.8,0x2a4a8a]]) if(!insideSolid(x,z,.8)) cafeTable(x,z,c); for(const [x,z] of [[-21,20],[21,21.5],[-21,-6],[26,-4],[-26,21],[42,20]]) if(!insideSolid(x,z,1.2)) planeTree(x,z,1);
  const N=[]; for(let x=-44;x<=44.1;x+=2.4) for(let z=-39;z<=45.1;z+=2.4) N.push({x,z});
  for(const [x,z] of [[-30,8],[-31.6,8],[-28.4,8],[0,-38.6]]) N.push({x,z});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=3.4; buildNav();
  return {sun,cache,bottles,squad,ht1,ht2,hts:G.refs.hts};
}
function objectives21(){ return [
  {id:'cache21',text:'Recupere as garrafas incendiárias na garagem confiscada (oeste)',state:'active',marker:{x:-41.8,z:14.8}},
  {id:'ht21',text:'Destrua os dois semilagartas (0/2)',state:'active',marker:{x:12,z:-1}},
  {id:'gate21',text:'Derrube a guarda do portão da Prefeitura',state:'active',marker:{x:0,z:-34}},
  {id:'enter21',text:'Entre na Prefeitura com a Resistência',state:'hidden',marker:{x:0,z:-38.6}},
  {id:'lucien21',text:'Opcional: Lucien termina com mais da metade da saúde',state:'active',optional:true},
]; }
function interact21(R){
  const I=W.interactables, F=()=>G.flags;
  I.push({id:'cache21',pt:()=>V3(-41.8,1,14.8),r:2.2,label:()=>F().cache21?null:'Pegar as garrafas incendiárias',use:()=>{ F().cache21=true; for(const b of R.bottles) b.visible=false; G.player.nades=Math.max(G.player.nades||0,6); AudioSys.play('pickup'); pickupMsg('6 coquetéis incendiários (G para jogar)'); complete('cache21'); G.radioMsg('LUCIEN','Seis garrafas. Nos semilagartas, mire no motor — a frente.','tip'); cp21(); }});
  I.push({id:'enter21',pt:()=>V3(0,1.4,-38.6),r:3,skip:true,label:()=>obj('enter21').state==='active'?'Entrar na Prefeitura':null,use:()=>{ if(obj('enter21').state!=='active') return; const A=G.ally; if(A&&!A.dead){ if(A.hp>A.maxHp*.5) complete('lucien21'); else failObjective('lucien21'); } complete('enter21'); missionComplete(); }});
  I.push({id:'lucRev',pt:()=>{ const A=G.ally; return V3(A.pos.x,A.pos.y+1.1,A.pos.z); },r:2.4,skip:true,label:()=>G.ally&&G.ally.downed?'Reanimar Lucien':null,hold:()=>1.6,use:()=>{ if(G.ally.downed) G.ally.revive(); }});
}
function update21(dt){
  const P=G.player, F=G.flags, R=G.refs, A=G.ally;
  if(!F.allyInit&&A){ F.allyInit=true; A.joined=true; A.mode='FOLLOW'; A.hidden=false; }
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('LUCIEN','Élise! Paris levantou. A polícia ocupou a Prefeitura e os alemães cercam a ilha. Nossas garrafas ficaram na garagem que eles tomaram, a oeste.','tip'); }
  if(!F.i2&&G.introT>10){ F.i2=true; G.radioMsg('DICA','G joga um coquetel: o fogo queima o que estiver perto por alguns segundos. Os combatentes da FFI atiram de trás das barricadas. G também chama/dispensa Lucien quando não há garrafa.','tip'); }
  ffiTick(R.squad,dt); burnTick(dt); firesTick(dt);
  const dn=R.hts.filter(h=>h.dead).length; const o=obj('ht21'); if(o.state==='active'){ const t='Destrua os dois semilagartas ('+dn+'/2)'; if(o.text!==t){ o.text=t; const nx=R.hts.find(h=>!h.dead); if(nx) o.marker={x:nx.x,z:nx.z}; refreshObjectiveUI(); } if(dn>=2){ complete('ht21'); G.radioMsg('LUCIEN','Os dois queimando! Agora o portão.'); cp21(); } }
  const gateAlive=G.enemies.some(e=>/^p\d/.test(e.id)&&!e.dead); if(obj('gate21').state==='active'&&!gateAlive){ complete('gate21'); G.radioMsg('LUCIEN','Guarda do portão no chão!'); cp21(); }
  if(obj('enter21').state==='hidden'&&['cache21','ht21','gate21'].every(id=>obj(id).state==='done')){ activate('enter21'); const d=W.doors.pref; if(d.state==='LOCKED'){ d.state='CLOSED'; openDoor(d,null); } G.radioMsg('POLÍCIA','(de dentro) Abram! Abram o portão para eles!','warn'); }
}
function cp21(){ checkpoint(); }
function restore21(s){ const F=G.flags, R=G.refs; if(F.cache21) for(const b of R.bottles) b.visible=false; F.allyInit=false;
  for(const H of R.hts) if(F['htd_'+H.id]){ H.dead=true; H.hp=0; for(const c of H.g.children) c.material=hm(0x1a1816); G.fires=G.fires||[]; G.fires.push({x:H.x,z:H.z,L:null}); } }
LEVELS['21']={id:'21',num:21,op:'Operação 21',name:'Levante Final',place:'Île de la Cité, Paris',prev:'20',
  loadout:{weapons:['smg','pistol','rifle'],ammo:{smg:{mag:32,reserve:128},pistol:{mag:8,reserve:24},rifle:{mag:5,reserve:20}},cur:'smg',camera:false},baseLight:.85,lightFn:light21,shadows:false,bloomTh:.9,grenades:true,nadeKind:'molotov',
  build:()=>buildLevel21(),enemies:ENEMY_DEFS_21,onExplode:(pos,o)=>htExplodeHook(pos,o),onHalftrack:H=>{ G.flags['htd_'+H.id]=true; },
  ally:{id:'luc',x:1.6,z:37,yaw:Math.PI,name:'LUCIEN',title:'Lucien',hp:160,range:45,dmg:36,look:{uniform:0x5a4630,pants:0x2d2a26,skin:0xcfa27e,hair:0x2b1e14,cap:'beret',weapon:'smg'},failTitle:'Lucien não resistiu',failText:'Lucien caiu nas ruas da Cité.'},
  start:{x:0,z:38,yaw:0},startDocs:[],drawMap:null,
  reinf:[{id:'n1',x:-30,z:-30,weapon:'smg',helmet:true},{id:'n2',x:30,z:-30,weapon:'rifle',helmet:true,nades:1}],
  radio:{x:0,z:-38,fx:0,fz:-36},radioRun:'',alarmPos:V3(0,1.4,-38),alarmText:'Os alemães pedem reforços pelo rádio!',alarmObjective:null,
  alarmYes:'',alarmLate:'',alarmNo:'',alarmOk:()=>true,deathText:'Élise caiu nas barricadas da Cité.',
  objectives:objectives21,interact:interact21,pickups:()=>{ addPickup('p_med1',-3,30,'med',30,.1); addPickup('p_smg1',20,-6,'smg',32,.1); addPickup('p_med2',-20,-4,'med',40,.1); addPickup('p_med3',30,-20,'med',35,.1); addPickup('p_smg2',-36,-6,'smg',32,.1); },
  update:update21,restore:restore21,
  resultTitle:'Levante final',outro:['ÉLISE','O portão da Prefeitura se abre por dentro. Policiais de camisa arregaçada, estudantes, um padeiro com um fuzil de 1916 — e Lucien, rindo como na noite da garagem, um ano e meio atrás.'],menuCam:{cx:0,cz:30,y:3,tx:0,tz:0},ambient:'medina',mist:null,
  briefing:{meta:'PARIS — 19 DE AGOSTO DE 1944 — 07h00',paras:['Paris se levantou. Policiais em greve tomaram a Prefeitura de Polícia, na Île de la Cité, e os alemães cercam a ilha com semilagartas. As garrafas incendiárias da Rede ficaram numa garagem que eles confiscaram.','Lucien está de volta ao seu lado. Recupere as garrafas, queime os dois semilagartas, derrube a guarda do portão e entre na Prefeitura com os combatentes da FFI.'],list:['Garrafas incendiárias (garagem confiscada)','Dois semilagartas','Guarda do portão → entrar na Prefeitura']}};
LEVEL_ORDER.push('21');


/* =========================================================
   OPERAÇÃO 22 — Rua por Rua (bulevar, 22/08/1944, 15h)
   três bloqueios, atiradores nas sacadas, blindado no último
   ========================================================= */
function tank22(x,z,ry){ const H=halftrack('tank',x,z,ry); H.hp=170; const m=hm(0x4a4e3e); const tur=new T.Group(); tur.position.set(0,2,-.4); H.g.add(tur); const tt=new T.Mesh(BOX(1.8,.7,2.2),m); tur.add(tt); const gun=new T.Mesh(new T.CylinderGeometry(.08,.1,3,8),MAT.darkMetal); gun.rotation.x=Math.PI/2; gun.position.set(0,.1,2.4); tur.add(gun); for(const c of tur.children){ c.userData={mat:'metal'}; W.shootables.push(c); } H.tur=tur; H.cd=6; return H; }
const ENEMY_DEFS_22=[
  {id:'a1',x:-3,z:20,yaw:0,weapon:'smg',helmet:true},{id:'a2',x:3,z:20.4,yaw:0,weapon:'rifle',helmet:true},{id:'a3',x:0,z:18,yaw:0,weapon:'rifle',helmet:true,fixed:true,sight:1.3},{id:'a4',x:-8,z:24,weapon:'rifle',patrol:[[-8,24],[-8,30]]},
  {id:'sn1',x:-9.1,z:6,yaw:Math.PI/2,weapon:'rifle',fixed:true,sight:1.6},{id:'sn2',x:9.1,z:-4,yaw:-Math.PI/2,weapon:'rifle',fixed:true,sight:1.6},
  {id:'b1',x:-3,z:-14,yaw:0,weapon:'smg',helmet:true},{id:'b2',x:3,z:-13.6,yaw:0,weapon:'rifle',helmet:true},{id:'b3',x:0,z:-16,yaw:0,weapon:'rifle',helmet:true},{id:'b4',x:6,z:-8,weapon:'smg',patrol:[[6,-8],[6,0]]},
  {id:'c1',x:-4,z:-46,yaw:0,weapon:'smg',helmet:true},{id:'c2',x:4,z:-46,yaw:0,weapon:'rifle',helmet:true},{id:'c3',x:-7,z:-40,yaw:0,weapon:'rifle',helmet:true},{id:'c4',x:7,z:-40,yaw:0,weapon:'rifle',helmet:true,nades:1},
];
function buildLevel22(){
  M5=mats05(); M6=mats06(); const M=M6;
  scene.background=new T.Color(0x9ab0c8); scene.fog=new T.FogExp2(0xb0c0d0,.009); summerSky(2222);
  scene.add(new T.HemisphereLight(0xe0e8f0,0x6a5a4a,.85)); const sun=new T.DirectionalLight(0xfff0d8,.95); sun.position.set(-30,50,20); scene.add(sun); scene.add(new T.AmbientLight(0x5a5a60,.35));
  const gg=new T.PlaneGeometry(80,140,30,50); gg.rotateX(-Math.PI/2); { const p=gg.attributes.position, uv=gg.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i),p.getZ(i)); } const ground=new T.Mesh(gg,MAT.ground); ground.userData.mat='stone'; scene.add(ground); W.shootables.push(ground);
  // bulevar x -10..10, quarteirões dos dois lados com becos em z=10 e z=-28
  for(const s of [-1,1]){ const a=s<0?-30:10, b=s<0?-10:30; parisBlock(a,b,30,64,15); parisBlock(a,b,-26,8,15); parisBlock(a,b,-64,-30,15); parisBlock(s<0?-30:22,s<0?-22:30,8,30,15); parisBlock(s<0?-30:22,s<0?-22:30,-30,-26,15); }
  addBlock(-30,30,-70,-64,15,{mat:MAT.facadeC}); addBlock(-30,30,64,70,15,{mat:MAT.facadeB}); addBlock(-34,-30,-70,70,15,{mat:MAT.facadeA}); addBlock(30,34,-70,70,15,{mat:MAT.facadeA});
  // becos laterais (atrás dos quarteirões) — rotas de flanco
  for(const s of [-1,1]){ const x0=s<0?-22:10, x1=s<0?-10:22; barricade(Math.min(x0,x1)+1,Math.max(x0,x1)-1,19,true); }
  // sacadas dos atiradores (com banca embaixo para ninguém passar por baixo)
  for(const [x,z,s] of [[-10,6,-1],[10,-4,1]]){ const bx0=s<0?-10:8.4, bx1=s<0?-8.4:10; addWalk(bx0,bx1,z-1.2,z+1.2,4.6,{y0:4.4,mat:MAT.darkMetal,surf:'metal',seg:1}); for(const zz of [z-1.2,z+1.2]) addMesh(BOX(1.6,.9,.05),MAT.darkMetal,(bx0+bx1)/2,5.05,zz,null); addMesh(BOX(.05,.9,2.4),MAT.darkMetal,s<0?bx1:bx0,5.05,z,null); addBlock(bx0,bx1,z-1.4,z+1.4,4.4,{mat:hm(0x2a4a3a),surf:'wood',seg:1}); poster(s<0?-8.38:8.38,2.2,z,s<0?Math.PI/2:-Math.PI/2,2.4,1,(g,w,h)=>{ g.fillStyle='#2a4a3a'; g.fillRect(0,0,w,h); g.fillStyle='#e8e0c8'; g.font='bold 30px serif'; g.textAlign='center'; g.fillText('JOURNAUX',w/2,h*.62); }); }
  // bloqueios alemães
  const rb=[]; for(const [z,i] of [[22,0],[-12,1],[-44,2]]){ sandbags(-6,-1.2,z-.4,z+.4); sandbags(1.2,6,z-.4,z+.4); sandbags(-9.6,-7,z-2,z-1.2); sandbags(7,9.6,z-2,z-1.2); rb.push(z); }
  const tank=tank22(0,-52,Math.PI);
  // barricadas da FFI que avançam
  barricade(-6,6,46,true); car(-7,40,true); car(7,-24,true); barrel(-8,-2); barrel(8,14); for(const [x,z] of [[-8,34],[8,34],[-8,-30],[8,-36]]) lampPost('L'+z+x,x,z,x<0?1:-1,0);
  tricolor(-10.02,8,40,Math.PI/2); tricolor(10.02,8,-10,-Math.PI/2);
  const squad=ffiSquad([[-4,47.4,Math.PI,'rifle'],[-1.4,47.6,Math.PI,'smg'],[1.4,47.4,Math.PI,'rifle'],[4,47.6,Math.PI,'rifle'],[0,48.4,Math.PI,'smg']]);
  for(const [x,z,c] of [[-7.2,28.5,0xc83030],[7,31,0x2a6a4a],[-7.2,-27,0x2a4a8a]]) if(!insideSolid(x,z,.8)) cafeTable(x,z,c);
  for(const sx of [-8.3,8.3]) for(let z=51;z>-62;z-=11){ if([22,-12,-44].some(q=>Math.abs(z-q)<4)||insideSolid(sx,z,1.4)) continue; planeTree(sx,z,.95); }
  const N=[]; for(let x=-9;x<=9.1;x+=2.25) for(let z=-62;z<=62.1;z+=2.4) N.push({x,z}); for(const s of [-1,1]) for(let x=(s<0?-21:11);x<=(s<0?-11:21);x+=2.5) for(let z=9;z<=29.1;z+=2.4) N.push({x,z}); for(const s of [-1,1]) for(let x=(s<0?-21:11);x<=(s<0?-11:21);x+=2.5) for(const z of [-29,-27]) N.push({x,z});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=3.4; buildNav();
  return {sun,squad,rb,tank,hts:G.refs.hts};
}
function objectives22(){ return [
  {id:'rb1',text:'Neutralize o primeiro bloqueio do bulevar',state:'active',marker:{x:0,z:20}},
  {id:'rb2',text:'Neutralize o segundo bloqueio (cuidado com as sacadas)',state:'hidden',marker:{x:0,z:-14}},
  {id:'rb3',text:'Destrua o blindado do último bloqueio (bazuca: tecla 4)',state:'hidden',marker:{x:0,z:-52}},
  {id:'snip22',text:'Opcional: derrube os dois atiradores das sacadas',state:'active',optional:true},
  {id:'luc22',text:'Opcional: Lucien termina com mais da metade da saúde',state:'active',optional:true},
]; }
function interact22(R){ W.interactables.push({id:'lucRev',pt:()=>{ const A=G.ally; return V3(A.pos.x,A.pos.y+1.1,A.pos.z); },r:2.4,skip:true,label:()=>G.ally&&G.ally.downed?'Reanimar Lucien':null,hold:()=>1.6,use:()=>{ if(G.ally.downed) G.ally.revive(); }}); }
function squadMove22(R,z){ R.squad.forEach((f,i)=>{ f.to={x:-4.5+i*2.25,z:z+.8+(i%2)*.4}; }); }
function update22(dt){
  const P=G.player, F=G.flags, R=G.refs, A=G.ally;
  if(!F.allyInit&&A){ F.allyInit=true; A.joined=true; A.mode='FOLLOW'; A.hidden=false; }
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('LUCIEN','Rua por rua até a praça. Três bloqueios no bulevar. Os becos dos lados levam por trás dos sacos de areia.','tip'); }
  if(!F.i2&&G.introT>10){ F.i2=true; G.radioMsg('DICA','Os combatentes da FFI avançam até cada bloqueio que você limpar. A bazuca (4) só tem três foguetes: guarde para o blindado.','tip'); }
  // FFI avança
  for(const f of R.squad){ if(f.to){ const a=f.a, dx=f.to.x-a.pos.x, dz=f.to.z-a.pos.z, d=Math.hypot(dx,dz); if(d>.2){ const sp=Math.min(d,3.4*dt); a.pos.x+=dx/d*sp; a.pos.z+=dz/d*sp; a.yaw=Math.atan2(dx,dz); a.speedNow=3.4; a.crouchTarget=.2; a.animate(dt); continue; } else { f.to=null; f.home={x:a.pos.x,z:a.pos.z}; f.yaw=Math.PI; } } }
  ffiTick(R.squad.filter(f=>!f.to),dt,42); burnTick(dt); firesTick(dt);
  const alive=re=>G.enemies.some(e=>re.test(e.id)&&!e.dead);
  if(obj('rb1').state==='active'&&!alive(/^a\d/)){ complete('rb1'); activate('rb2'); squadMove22(R,25); G.radioMsg('LUCIEN','Primeiro bloqueio é nosso! Pessoal, para a frente!'); cp22(); }
  if(obj('rb2').state==='active'&&!alive(/^b\d/)){ complete('rb2'); activate('rb3'); squadMove22(R,-9); G.radioMsg('LUCIEN','Segundo! E lá no fim... um blindado. Élise, a bazuca!','warn'); cp22(); }
  if(!alive(/^sn\d/)&&obj('snip22').state==='active'){ complete('snip22'); }
  // canhão do blindado
  const K=R.tank; if(K&&!K.dead&&obj('rb3').state!=='done'){ const dx=P.pos.x-K.x, dz=P.pos.z-K.z, d=Math.hypot(dx,dz); K.tur.rotation.y=lerp(K.tur.rotation.y,Math.atan2(-dx,-dz),.05);
    if(d<55&&obj('rb2').state==='done'){ K.cd-=dt; if(K.cd<1.2&&!K.warn){ K.warn=true; AudioSys.play('turret',V3(K.x,2,K.z),1); } if(K.cd<=0){ K.cd=G.diff==='veterano'?5:6.5; K.warn=false; const blocked=segFirst(K.x,2.2,K.z,P.pos.x,1.2,P.pos.z); const tgt=blocked?V3(K.x+dx*blocked.t,.5,K.z+dz*blocked.t):V3(P.pos.x+rnd(-2.5,2.5),.5,P.pos.z+rnd(-2.5,2.5)); AudioSys.play('tankfire',V3(K.x,2,K.z),1.4); FX.tracer(V3(K.x,2.2,K.z),tgt); explode(tgt,{r:4.6,dmgE:200,dmgP:G.diff==='recruta'?45:60,src:'tank',kind:'shell'}); } } }
  if(K&&K.dead&&obj('rb3').state==='active'){ const left=alive(/^c\d/); if(!left){ complete('rb3'); if(A&&!A.dead){ if(A.hp>A.maxHp*.5) complete('luc22'); else failObjective('luc22'); } squadMove22(R,-40); G.radioMsg('LUCIEN','O bulevar é nosso! Ouça — sinos! As igrejas estão tocando!','tip'); F.endT=4; } else if(!F.km){ F.km=true; G.radioMsg('LUCIEN','O blindado queima! Agora os últimos do bloqueio!'); } }
  if(F.endT>0){ F.endT-=dt; if(F.endT<=0) missionComplete(); }
}
function cp22(){ checkpoint(); }
function restore22(s){ const F=G.flags, R=G.refs; F.allyInit=false; const zz=obj('rb2').state==='done'?-9:obj('rb1').state==='done'?25:null; if(zz!==null) R.squad.forEach((f,i)=>{ f.a.pos.set(-4.5+i*2.25,0,zz+.8); f.home={x:f.a.pos.x,z:f.a.pos.z}; f.yaw=Math.PI; }); if(F['htd_tank']){ const K=R.tank; K.dead=true; K.hp=0; for(const c of K.g.children) c.material=hm(0x1a1816); } }
LEVELS['22']={id:'22',num:22,op:'Operação 22',name:'Rua por Rua',place:'Bulevar de Sébastopol, Paris',prev:'21',
  loadout:{weapons:['smg','rifle','pzf'],ammo:{smg:{mag:32,reserve:128},rifle:{mag:5,reserve:20},pzf:{mag:1,reserve:2}},cur:'smg',camera:false},baseLight:.85,lightFn:()=>.85,shadows:false,bloomTh:.9,grenades:true,nadeKind:'molotov',
  build:()=>buildLevel22(),enemies:ENEMY_DEFS_22,onExplode:(pos,o)=>{ if(o.src!=='tank') htExplodeHook(pos,o); },onHalftrack:H=>{ G.flags['htd_'+H.id]=true; },
  ally:{id:'luc',x:2,z:44,yaw:Math.PI,name:'LUCIEN',title:'Lucien',hp:160,range:45,dmg:36,look:{uniform:0x5a4630,pants:0x2d2a26,skin:0xcfa27e,hair:0x2b1e14,cap:'beret',weapon:'smg'},failTitle:'Lucien não resistiu',failText:'Lucien caiu no bulevar.'},
  start:{x:0,z:44,yaw:0},startDocs:[],drawMap:null,
  reinf:[],radio:{x:0,z:-60,fx:0,fz:-58},radioRun:'',alarmPos:V3(0,1.4,-60),alarmText:'',alarmObjective:null,alarmYes:'',alarmLate:'',alarmNo:'',alarmOk:()=>true,deathText:'Élise caiu no bulevar, a duas quadras da praça.',
  objectives:objectives22,interact:interact22,pickups:()=>{ addPickup('q_med1',-8,30,'med',35,.1); addPickup('q_pzf1',8,8,'pzf',1,.1); addPickup('q_smg1',-16,24,'smg',32,.1); addPickup('q_med2',16,-28,'med',40,.1); addPickup('q_nade1',-16,-28,'nade',2,.1); addPickup('q_med3',-8,-24,'med',30,.1); G.player.nades=Math.max(G.player.nades||0,3); },
  update:update22,restore:restore22,
  resultTitle:'Rua por rua',outro:['ÉLISE','O blindado ainda solta fumaça quando as janelas do bulevar se abrem. Bandeiras, lençóis, uma mulher cantando de uma sacada. Faltam poucas ruas.'],menuCam:{cx:0,cz:40,y:3,tx:0,tz:0},ambient:'medina',mist:null,
  briefing:{meta:'PARIS — 22 DE AGOSTO DE 1944 — 15h00',paras:['As barricadas se multiplicam. No bulevar, os alemães seguram três bloqueios em fila, com atiradores nas sacadas e um blindado no último, de costas para a praça.','Com Lucien e os combatentes da FFI, tome o bulevar bloqueio por bloqueio. Os becos laterais levam por trás dos sacos de areia. A bazuca tem três foguetes.'],list:['Primeiro e segundo bloqueios','Atiradores das sacadas (opcional)','Blindado do último bloqueio']}};
LEVEL_ORDER.push('22');


/* =========================================================
   OPERAÇÃO 23 — Operação Mercado (pavilhões do mercado, 23/08/1944, 10h)
   três cargas nos pavilhões, atirador no campanário, caminhão de munição
   ========================================================= */
const ENEMY_DEFS_23=[
  {id:'tw',x:0,z:-44,yaw:0,weapon:'rifle',helmet:true,fixed:true,sight:1.8},
  {id:'e1',x:-26,z:-6,weapon:'smg',helmet:true,patrol:[[-26,-6],[-26,10]]},{id:'e2',x:-18,z:12,yaw:Math.PI,weapon:'pistol'},
  {id:'e3',x:4,z:-10,weapon:'rifle',helmet:true,patrol:[[4,-10],[4,10]]},{id:'e4',x:-4,z:6,yaw:Math.PI/2,weapon:'smg'},
  {id:'e5',x:24,z:4,weapon:'rifle',helmet:true,patrol:[[24,4],[30,-10]]},{id:'e6',x:20,z:-14,yaw:0,weapon:'pistol',officer:true},
  {id:'s1',x:-42,z:-24,weapon:'rifle',patrol:[[-42,-24],[-42,24]]},{id:'s2',x:42,z:24,weapon:'rifle',helmet:true,patrol:[[42,24],[42,-24]]},
  {id:'s3',x:0,z:28,yaw:Math.PI,weapon:'smg',helmet:true},{id:'s4',x:-14,z:-28,yaw:0,weapon:'rifle'},
  {id:'k1',x:47,z:3,yaw:-Math.PI/2,weapon:'rifle',helmet:true},{id:'k2',x:46,z:-4,yaw:-Math.PI/2,weapon:'smg'},
];
function pavilion23(x0,x1,z0,z1){ const H=7, col=hm(0x3a4a48); for(let x=x0;x<=x1+.01;x+=4) for(const z of [z0,z1]){ addMesh(new T.CylinderGeometry(.14,.18,H,8),col,x,H/2,z,'metal'); addSolidOnly(x-.2,x+.2,z-.2,z+.2,H,0,true); } for(let z=z0+4;z<z1-.01;z+=4) for(const x of [x0,x1]){ addMesh(new T.CylinderGeometry(.14,.18,H,8),col,x,H/2,z,'metal'); addSolidOnly(x-.2,x+.2,z-.2,z+.2,H,0,true); }
  const roofM=MAT_HQ?new T.MeshPhongMaterial({color:0x8aa0a8,transparent:true,opacity:.55,shininess:60,side:T.DoubleSide}):new T.MeshLambertMaterial({color:0x8aa0a8,transparent:true,opacity:.55,side:T.DoubleSide});
  const cx=(x0+x1)/2, w=x1-x0; for(const s of [-1,1]){ const g=new T.PlaneGeometry(w*.56,z1-z0); g.rotateX(-Math.PI/2); const r=new T.Mesh(g,roofM); r.rotation.z=s*.4; r.position.set(cx+s*w*.25,H+1,(z0+z1)/2); scene.add(r); }
  addMesh(BOX(w,.12,.12),col,cx,H,z0,null); addMesh(BOX(w,.12,.12),col,cx,H,z1,null); addMesh(BOX(.12,.12,z1-z0),col,cx,H+2,(z0+z1)/2,null); }
function buildLevel23(){
  M5=mats05(); M6=mats06(); const M=M6;
  scene.background=new T.Color(0x9ab0c8); scene.fog=new T.FogExp2(0xb0c0d0,.008); summerSky(2323);
  scene.add(new T.HemisphereLight(0xe0e8f0,0x6a5a4a,.85)); const sun=new T.DirectionalLight(0xfff0d8,.95); sun.position.set(20,55,30); scene.add(sun); scene.add(new T.AmbientLight(0x5a5a60,.35));
  const gg=new T.PlaneGeometry(130,130,40,40); gg.rotateX(-Math.PI/2); { const p=gg.attributes.position, uv=gg.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i),p.getZ(i)); } const ground=new T.Mesh(gg,MAT.ground); ground.userData.mat='stone'; scene.add(ground); W.shootables.push(ground);
  for(const [x0,x1,z0,z1] of [[-60,-50,-60,60],[50,60,-60,60],[-50,50,36,60],[-50,-8,-60,-36],[8,50,-60,-36]]) parisBlock(x0,x1,z0,z1,15);
  // igreja com campanário (norte)
  addBlock(-8,8,-60,-46,13,{mat:new T.MeshLambertMaterial({map:TEX.lime5,color:0xc8bca8}),surf:'stone',seg:4}); addBlock(-2.2,2.2,-46.4,-41.8,12,{mat:new T.MeshLambertMaterial({map:TEX.lime5,color:0xc8bca8}),surf:'stone',seg:2});
  addWalk(-2.2,2.2,-46.4,-41.8,12.2,{y0:12,mat:MAT.darkMetal,surf:'stone',seg:1}); addMesh(new T.ConeGeometry(2.6,5,4),MAT.roof,0,17.5,-44.1,null).rotation.y=Math.PI/4; for(const [x,z] of [[-2,-42],[2,-42],[-2,-46.2],[2,-46.2]]) addMesh(BOX(.25,3,.25),new T.MeshLambertMaterial({map:TEX.lime5,color:0xc8bca8}),x,13.5,z,null);
  const clock=poster(0,9,-41.78,0,2,2,(g,w,h)=>{ g.fillStyle='#e8e0c8'; g.beginPath(); g.arc(w/2,h/2,w*.45,0,7); g.fill(); g.strokeStyle='#1a1410'; g.lineWidth=8; g.beginPath(); g.moveTo(w/2,h/2); g.lineTo(w/2,h*.15); g.moveTo(w/2,h/2); g.lineTo(w*.75,h/2); g.stroke(); });
  // pavilhões
  pavilion23(-38,-14,-24,24); pavilion23(-10,10,-24,24); pavilion23(14,38,-24,24);
  const R0=mulberry32(2323); for(const cx of [-26,0,26]) for(let z=-20;z<=20;z+=5){ if(Math.abs(z)<2) continue; for(const s of [-1,1]){ const x=cx+s*5; addBlock(x-1.6,x+1.6,z-.9,z+.9,.9,{mat:M.wood,surf:'wood',cover:true,seg:1}); for(let i=0;i<4;i++){ addMesh(new T.SphereGeometry(.13,6,5),hm([0xd84a2a,0xe8a030,0x6a9a3a,0xc8b060][Math.floor(R0()*4)]),x-1.1+i*.7,1.02,z,null); } } }
  // cargas
  const charges=[]; for(const [i,x,z] of [[0,-26,-1],[1,0,1],[2,26,-1]]){ const m=addMesh(BOX(.5,.4,.35),hm(0x8a2a1a),x,.2,z,null); const w=addMesh(new T.CylinderGeometry(.015,.015,6,4),MAT.darkMetal,x,.04,z+3,null); w.rotation.x=Math.PI/2; charges.push({i,x,z,m}); }
  // caminhão de munição
  truck04(46,0); const ammoH={x:46,z:0,hp:60,dead:false};
  // barricada FFI no sul
  barricade(-8,8,33,true); const squad=ffiSquad([[-5,34.4,Math.PI,'rifle'],[-1.6,34.6,Math.PI,'rifle'],[1.6,34.4,Math.PI,'smg'],[5,34.6,Math.PI,'rifle']]);
  for(const [x,z] of [[-46,30],[46,30],[-46,-30],[46,-30]]) lampPost('L'+x+z,x,z,x<0?1:-1,0); tricolor(-8.02,9,36.2,Math.PI*0); car(-44,10,true); barrel(40,10); barrel(40.6,10.4);
  const N=[]; for(let x=-48;x<=48.1;x+=2.4) for(let z=-34;z<=34.1;z+=2.4) N.push({x,z});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=3.4; buildNav();
  return {sun,charges,squad,ammoH,clock};
}
function objectives23(){ return [
  {id:'ch23',text:'Desarme as três cargas nos pavilhões do mercado (0/3)',state:'active',marker:{x:-26,z:-1}},
  {id:'tw23',text:'Derrube o atirador do campanário (norte)',state:'active',marker:{x:0,z:-44}},
  {id:'clear23',text:'Expulse a guarnição do mercado',state:'active'},
  {id:'truck23',text:'Opcional: destrua o caminhão de munição (rua leste)',state:'active',optional:true},
  {id:'luc23',text:'Opcional: Lucien termina com mais da metade da saúde',state:'active',optional:true},
]; }
function interact23(R){ const I=W.interactables, F=()=>G.flags;
  R.charges.forEach(c=>I.push({id:'ch'+c.i,pt:()=>V3(c.x,.4,c.z),r:2,hold:()=>2.6,label:()=>F()['ch'+c.i]?null:'Cortar o fio da carga (segure)',use:()=>{ F()['ch'+c.i]=true; c.m.material=hm(0x3a3a34); AudioSys.play('unlock'); F().chN=(F().chN||0)+1; const o=obj('ch23'); o.text='Desarme as três cargas nos pavilhões do mercado ('+F().chN+'/3)'; const nx=R.charges.find(k=>!F()['ch'+k.i]); if(nx) o.marker={x:nx.x,z:nx.z}; refreshObjectiveUI(); if(F().chN>=3){ complete('ch23'); G.progress=null; G.radioMsg('LUCIEN','Três fios cortados! O mercado não vai pelos ares.','tip'); } cp23(); }}));
  I.push({id:'lucRev',pt:()=>{ const A=G.ally; return V3(A.pos.x,A.pos.y+1.1,A.pos.z); },r:2.4,skip:true,label:()=>G.ally&&G.ally.downed?'Reanimar Lucien':null,hold:()=>1.6,use:()=>{ if(G.ally.downed) G.ally.revive(); }});
}
function update23(dt){
  const P=G.player, F=G.flags, R=G.refs, A=G.ally;
  if(!F.allyInit&&A){ F.allyInit=true; A.joined=true; A.mode='FOLLOW'; A.hidden=false; if(F.timer23===undefined) F.timer23=G.diff==='recruta'?330:G.diff==='veterano'?230:280; }
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('LUCIEN','Os sapadores minaram os pavilhões: se o mercado explodir, o bairro fica sem comida. Três cargas, uma em cada pavilhão. E há um atirador no campanário!','warn'); }
  ffiTick(R.squad,dt,40); burnTick(dt); firesTick(dt);
  if(obj('ch23').state==='active'){ F.timer23-=dt; G.progress={label:'Cargas no mercado: '+Math.floor(F.timer23/60)+':'+String(Math.max(0,Math.floor(F.timer23%60))).padStart(2,'0'),v:F.timer23/300}; if(F.timer23<=0){ for(const c of R.charges) if(!F['ch'+c.i]) explode(V3(c.x,.5,c.z),{r:9,dmgE:300,dmgP:200,src:'charge',kind:'wreck'}); setTimeout(()=>missionFail('O mercado explodiu','Os pavilhões caíram com as cargas dos sapadores. O bairro perdeu o mercado.'),600); F.timer23=1e9; } }
  const tw=G.enemies.find(e=>e.id==='tw'); if(tw&&tw.dead&&obj('tw23').state==='active'){ complete('tw23'); G.radioMsg('LUCIEN','O campanário calou!'); cp23(); }
  if(!R.ammoH.dead){ for(const b of (G.burns||[])) if(Math.hypot(b.x-R.ammoH.x,b.z-R.ammoH.z)<4) R.ammoH.hp-=dt*12; if(R.ammoH.hp<=0){ R.ammoH.dead=true; F.truck23=true; explode(V3(46,1.2,0),{r:8,dmgE:250,dmgP:80,src:'player',kind:'wreck'}); G.fires=G.fires||[]; G.fires.push({x:46,z:0,L:null}); complete('truck23'); } }
  const garrison=G.enemies.filter(e=>!e.dead&&e.id!=='tw').length; if(obj('clear23').state==='active'&&garrison===0){ complete('clear23'); }
  if(['ch23','tw23','clear23'].every(id=>obj(id).state==='done')&&!F.end23){ F.end23=true; if(A&&!A.dead){ if(A.hp>A.maxHp*.5) complete('luc23'); else failObjective('luc23'); } if(obj('truck23').state==='active') failObjective('truck23'); G.radioMsg('LUCIEN','O mercado é do bairro de novo!','tip'); setTimeout(()=>{ if(G&&G.levelId==='23') missionComplete(); },2500); }
}
function cp23(){ checkpoint(); }
function restore23(s){ const F=G.flags, R=G.refs; F.allyInit=false; for(const c of R.charges) if(F['ch'+c.i]) c.m.material=hm(0x3a3a34); if(F.truck23){ R.ammoH.dead=true; } F.timer23=Math.max(F.timer23||0,60); }
LEVELS['23']={id:'23',num:23,op:'Operação 23',name:'Operação Mercado',place:'Pavilhões do mercado, Paris',prev:'22',
  loadout:{weapons:['smg','rifle','pistol'],ammo:{smg:{mag:32,reserve:128},rifle:{mag:5,reserve:25},pistol:{mag:8,reserve:24}},cur:'smg',camera:false},baseLight:.85,lightFn:()=>.85,shadows:false,bloomTh:.9,grenades:true,nadeKind:'molotov',
  build:()=>buildLevel23(),enemies:ENEMY_DEFS_23,onExplode:(pos,o)=>{ const R=G.refs; if(R&&R.ammoH&&!R.ammoH.dead&&Math.hypot(pos.x-46,pos.z)<(o.r||4)+3) R.ammoH.hp-=o.kind==='rocket'?80:40; },
  ally:{id:'luc',x:2,z:31,yaw:Math.PI,name:'LUCIEN',title:'Lucien',hp:160,range:45,dmg:36,look:{uniform:0x5a4630,pants:0x2d2a26,skin:0xcfa27e,hair:0x2b1e14,cap:'beret',weapon:'smg'},failTitle:'Lucien não resistiu',failText:'Lucien caiu entre as bancas do mercado.'},
  start:{x:0,z:31,yaw:0},startDocs:[],drawMap:null,
  reinf:[{id:'n1',x:-44,z:-32,weapon:'smg',helmet:true},{id:'n2',x:44,z:-32,weapon:'rifle',helmet:true}],radio:{x:20,z:-16,fx:20,fz:-15},radioRun:'O oficial corre para o rádio!',alarmPos:V3(20,1.4,-16),alarmText:'Reforços alemães a caminho do mercado!',alarmObjective:null,alarmYes:'',alarmLate:'',alarmNo:'',alarmOk:()=>true,deathText:'Élise caiu entre as bancas do mercado.',
  objectives:objectives23,interact:interact23,pickups:()=>{ addPickup('m_med1',-14,30,'med',35,.1); addPickup('m_r1',12,30,'rifle',5,.1); addPickup('m_nade1',-38,30,'nade',2,.1); addPickup('m_med2',38,30,'med',40,.1); addPickup('m_smg1',0,-30,'smg',32,.1); G.player.nades=Math.max(G.player.nades||0,3); },
  update:update23,restore:restore23,
  resultTitle:'Operação mercado',outro:['ÉLISE','As feirantes voltam antes dos combatentes saírem. Uma delas me dá um pêssego e não aceita dinheiro. No campanário, o relógio parado marca dez e vinte.'],menuCam:{cx:0,cz:30,y:3,tx:0,tz:0},ambient:'medina',mist:null,
  briefing:{meta:'PARIS — 23 DE AGOSTO DE 1944 — 10h00',paras:['Os sapadores alemães minaram os pavilhões de ferro do mercado: se explodirem, o bairro inteiro fica sem comida. Um atirador no campanário da igreja cobre as três naves, e um caminhão de munição abastece a guarnição pela rua leste.','Desarme as três cargas antes do tempo, cale o campanário e expulse a guarnição com Lucien e a FFI.'],list:['Três cargas (tempo correndo)','Atirador do campanário','Guarnição do mercado']}};
LEVEL_ORDER.push('23');


/* =========================================================
   OPERAÇÃO 24 — Fim da Linha (pátio ferroviário do leste, 24/08/1944, 21h)
   agulha para o desvio morto, coronel von Rahn, vagões dos reféns, créditos
   ========================================================= */
const ENEMY_DEFS_24=[
  {id:'y1',x:-30,z:-18,weapon:'rifle',helmet:true,patrol:[[-30,-18],[-10,-18]]},{id:'y2',x:-20,z:-8,yaw:Math.PI,weapon:'smg',helmet:true},
  {id:'y3',x:-4,z:-20,weapon:'rifle',patrol:[[-4,-20],[-4,-8]]},{id:'y4',x:10,z:-16,yaw:Math.PI/2,weapon:'smg',helmet:true},
  {id:'sb1',x:20,z:-21,yaw:Math.PI,weapon:'rifle',helmet:true},{id:'sb2',x:24,z:-20,yaw:-Math.PI/2,weapon:'pistol',officer:true},
  {id:'y5',x:30,z:-8,weapon:'rifle',helmet:true,patrol:[[30,-8],[44,-8]]},{id:'y6',x:-40,z:20,weapon:'rifle',patrol:[[-40,20],[-10,20]]},
  {id:'y7',x:4,z:22,yaw:Math.PI,weapon:'smg',helmet:true},{id:'y8',x:36,z:20,yaw:-Math.PI/2,weapon:'rifle',helmet:true},
];
function train24(){ const R={cars:[]}; const mk=(len,color,loco)=>{ const g=new T.Group(); scene.add(g); const b=new T.Mesh(BOX(len,2.8,2.8),hm(color)); b.position.y=1.9; g.add(b); for(const sx of [-len/2+1.2,len/2-1.2]) for(const sz of [-1.1,1.1]){ const w=new T.Mesh(new T.CylinderGeometry(.45,.45,.2,10),MAT.darkMetal); w.rotation.x=Math.PI/2; w.position.set(sx,.45,sz); g.add(w); }
    if(loco){ const boiler=new T.Mesh(new T.CylinderGeometry(1.1,1.1,len*.6,14),hm(0x1a1a1a)); boiler.rotation.z=Math.PI/2; boiler.position.set(len*.15,2.6,0); g.add(boiler); const st=new T.Mesh(new T.CylinderGeometry(.35,.4,1.2,10),hm(0x1a1a1a)); st.position.set(len*.38,4,0); g.add(st); b.scale.y=.6; b.position.y=1.3; const cab=new T.Mesh(BOX(2.6,2.6,2.8),hm(0x2a2a26)); cab.position.set(-len/2+1.4,3,0); g.add(cab); }
    for(const c of g.children){ c.userData={mat:'metal'}; W.shootables.push(c); } const sol=addSolidOnly(0,0,0,0,3.4,0,true); return {g,len,sol}; };
  R.loco=mk(10,0x2a2a26,true); locoDetail(R.loco.g,10); R.cars.push(R.loco); for(let i=0;i<3;i++){ const c=mk(8,0x5a3a2a,false); const door=new T.Mesh(BOX(2,2.2,.08),vehMats().plank); door.position.set(0,1.75,1.47); c.g.add(door); c.door=door; boxcarDetail(c.g,8,0x5a3a2a); R.cars.push(c); } return R; }
function trainPose24(T_){ const F=G.flags; const head=F.tx; T_.cars.forEach((c,i)=>{ let off=0; for(let k=0;k<i;k++) off+=T_.cars[k].len/2+T_.cars[k+1].len/2+.6; const x=head-off; let z=4; if(F.switched&&x>0) z=4+Math.min(8,(x)*.57); c.g.position.set(x,0,z); c.g.rotation.y=F.switched&&x>0&&x<14?-.5:0; const s=c.sol; s.minX=x-c.len/2; s.maxX=x+c.len/2; s.minZ=z-1.5; s.maxZ=z+1.5; c.x=x; c.z=z; }); }
function buildLevel24(){
  M5=mats05(); M6=mats06(); const M=M6;
  scene.background=new T.Color(0x2a2a3a); scene.fog=new T.FogExp2(0x3a3440,.012);
  skyDome(2424,[[0,'#1a2040'],[.3,'#4a4a6a'],[.44,'#b07a6a'],[.5,'#e09a5a'],[.53,'#5a4a48'],[1,'#2a2420']],null,6);
  scene.add(new T.HemisphereLight(0xb0a8c0,0x4a3a30,.62)); const sun=new T.DirectionalLight(0xffa870,.5); sun.position.set(60,12,10); scene.add(sun); scene.add(new T.AmbientLight(0x3a3440,.4));
  floorPlane(140,80,0,0,new T.MeshLambertMaterial({map:TEX.dust5,color:0x6a6058}),'stone',0);
  // trilhos
  for(const z of [-12,-4,4,12]){ addMesh(BOX(130,.06,2.6),hm(0x4a4038),0,.03,z,null); for(const dz of [-.7,.7]) addMesh(BOX(130,.1,.1),MAT.darkMetal,0,.1,z+dz,null); }
  { const g=new T.Mesh(BOX(16,.1,.1),MAT.darkMetal); g.position.set(7,.1,8); g.rotation.y=-.5; scene.add(g); } addBlock(38,40,10.4,13.6,1.2,{mat:hm(0x8a2a1a),surf:'metal',seg:1});
  // limites: galpões, plataforma, muros
  for(const [x0,x1,z0,z1,h] of [[-70,70,-40,-30,9],[-70,70,30,40,9],[-70,-62,-30,30,9],[62,70,-30,30,9]]) addBlock(x0,x1,z0,z1,h,{mat:MAT.facadeB,surf:'stone',seg:5});
  addBlock(-50,-20,-30,-24,5,{mat:new T.MeshLambertMaterial({map:TEX.lime5,color:0x8a8070}),surf:'stone',seg:3}); addBlock(-58,-30,22,30,6,{mat:new T.MeshLambertMaterial({map:TEX.lime5,color:0x8a8070}),surf:'stone',seg:3});
  // posto de sinalização (sul)
  const wl=(axis,c0,c1,a0,a1,ops)=>wallOpen(axis,c0,c1,a0,a1,3.4,ops||[],new T.MeshLambertMaterial({map:TEX.lime5,color:0x9a8a78}),{inner:{}});
  wl('x',-26.2,-26,16,28); wl('x',-18,-17.8,16,28,[{c:22,w:1.6}]); wl('z',16,16.2,-26,-18); wl('z',27.8,28,-26,-18); addBlock(15.8,28.2,-26.2,-17.6,.4,{y0:3.4,mat:MAT.roof,bottom:MAT.ceil,surf:'stone',seg:2});
  for(let x=17;x<27;x+=.8) addMesh(BOX(.12,.9,.12),hm(x<22?0xa02a1a:0x2a2a2a),x,1.1,-25,null); const lever=addMesh(BOX(.14,1.1,.14),hm(0xe8c040),22,1.2,-24.8,null); lever.rotation.x=-.4; addBlock(16.6,27.4,-25.8,-25.2,.7,{mat:MAT.darkMetal,surf:'metal',seg:1});
  // vagões parados, caixas, postes
  for(const [x,z] of [[-36,-12],[-28,-12],[24,-12],[-44,12],[30,-4]]) addBlock(x-3.6,x+3.6,z-1.4,z+1.4,3,{mat:hm(0x4a4038),surf:'metal',seg:1,cover:true});
  for(const [x,z] of [[-10,-26],[-8.8,-26],[44,-20],[45,-21],[-24,-1],[12,0]]) crate(x,z,1.2,1.1); for(const [x,z] of [[-16,-26],[0,-26],[30,26],[-20,26],[50,0]]) lampPost('L'+x+z,x,z,0,1);
  const T_=train24();
  const N=[]; for(let x=-60;x<=60.1;x+=2.4) for(let z=-22.5;z<=28.1;z+=2.4) N.push({x,z}); N.push({x:22,z:-18},{x:22,z:-16.4},{x:22,z:-19.6}); for(let x=17;x<=27.1;x+=1.5) for(let z=-24.6;z<=-19;z+=1.4) N.push({x,z});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=3.4; buildNav();
  const squad=ffiSquad([[-58,0,Math.PI/2,'rifle'],[-57.4,-2.4,Math.PI/2,'smg'],[-57.6,2.4,Math.PI/2,'rifle']]);
  return {sun,T_,lever,squad};
}
function objectives24(){ return [
  {id:'sw24',text:'Mude a agulha no posto de sinalização antes que o trem passe (sul)',state:'active',marker:{x:22,z:-24.4}},
  {id:'rahn24',text:'Derrube o coronel von Rahn',state:'hidden'},
  {id:'cars24',text:'Abra os três vagões dos reféns (0/3)',state:'hidden'},
  {id:'luc24',text:'Opcional: Lucien termina com mais da metade da saúde',state:'active',optional:true},
]; }
function interact24(R){ const I=W.interactables, F=()=>G.flags;
  I.push({id:'sw24',pt:()=>V3(22,1.2,-24.4),r:2.2,hold:()=>1.6,label:()=>F().switched?null:'Puxar a alavanca da agulha (segure)',use:()=>{ if(F().tx>0){ G.radioMsg('ÉLISE','Tarde demais — a locomotiva já passou da agulha!','warn'); return; } F().switched=true; R.lever.rotation.x=.5; AudioSys.play('clank',V3(7,1,8),1.4); complete('sw24'); G.radioMsg('LUCIEN','A agulha virou! O trem vai entrar no desvio morto!','tip'); cp24(); }});
  R.T_.cars.slice(1).forEach((c,i)=>I.push({id:'car'+i,pt:()=>V3(c.x,1.4,c.z+1.6),r:2.6,hold:()=>1.4,label:()=>obj('cars24').state==='active'&&!F()['car'+i]?'Arrombar a porta do vagão (segure)':null,use:()=>{ F()['car'+i]=true; c.door.position.x+=1.9; AudioSys.play('door',V3(c.x,1,c.z),1.2); F().carN=(F().carN||0)+1; const o=obj('cars24'); o.text='Abra os três vagões dos reféns ('+F().carN+'/3)'; refreshObjectiveUI(); if(F().carN>=3){ complete('cars24'); const A=G.ally; if(A&&!A.dead){ if(A.hp>A.maxHp*.5) complete('luc24'); else failObjective('luc24'); } G.radioMsg('LUCIEN','Estão todos vivos! Ouça os sinos — Paris está livre!','tip'); F().end24=3.5; } cp24(); }}));
  I.push({id:'lucRev',pt:()=>{ const A=G.ally; return V3(A.pos.x,A.pos.y+1.1,A.pos.z); },r:2.4,skip:true,label:()=>G.ally&&G.ally.downed?'Reanimar Lucien':null,hold:()=>1.6,use:()=>{ if(G.ally.downed) G.ally.revive(); }});
}
function update24(dt){
  const P=G.player, F=G.flags, R=G.refs, A=G.ally;
  if(!F.allyInit&&A){ F.allyInit=true; A.joined=true; A.mode='FOLLOW'; A.hidden=false; if(F.tx===undefined){ F.tx=-38; F.depT=G.diff==='recruta'?40:G.diff==='veterano'?20:28; } }
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('LUCIEN','O último trem do coronel von Rahn: três vagões com gente da Rede. Se ele cruzar a agulha, some para o leste. O posto de sinalização fica do lado sul.','warn'); }
  ffiTick(R.squad,dt,45); burnTick(dt); firesTick(dt);
  // trem
  const TT=R.T_; if(F.depT>0){ F.depT-=dt; if(F.depT<=0){ AudioSys.play('honk',V3(F.tx,3,4),1.4); G.radioMsg('LUCIEN','O apito! O trem está saindo!','warn'); } }
  else if(!F.stopped){ const limit=F.switched?33:200; const v=F.switched&&F.tx>22?Math.max(.4,(33-F.tx)*.2):(G.diff==='veterano'?.95:.8); F.tx=Math.min(limit,F.tx+v*dt); if(Math.random()<dt*3) FX.puff(V3(F.tx+3.8,5,TT.loco.z),1,0x3a3a3a,.9,1.6,V3(0,2,0),.5); if(Math.random()<dt*1.5) AudioSys.play('engine',V3(F.tx,2,4),.5);
    if(!F.switched&&F.tx>0&&obj('sw24').state==='active'){ F.tx=-999; missionFail('O trem passou','A locomotiva cruzou a agulha e levou os reféns para o leste.'); }
    if(F.switched&&F.tx>=31.8){ F.stopped=true; AudioSys.play('metal',V3(37,1,12),1.4); explode(V3(37,1,12),{r:2,dmgE:0,dmgP:0,src:'player',kind:'nade'}); activate('rahn24'); spawnEnemy04({id:'rahn',x:34,z:15.6,weapon:'smg',officer:true,hp:420},true); spawnEnemy04({id:'rx1',x:24,z:15.6,weapon:'rifle',helmet:true},true); spawnEnemy04({id:'rx2',x:14,z:12.6,weapon:'smg',helmet:true},true); G.radioMsg('VON RAHN','(do estribo) Ninguém sai deste trem! Atirem!','warn'); cp24(); } }
  if(F.tx>-900) trainPose24(TT);
  if(obj('sw24').state==='active'){ const d=Math.max(0,-F.tx); G.progress={label:F.depT>0?'Partida do trem: '+Math.ceil(F.depT)+' s':'Trem até a agulha: '+Math.ceil(d)+' m',v:F.depT>0?1:d/38}; } else if(G.progress&&!F.stopped) G.progress=null;
  const rahn=G.enemies.find(e=>e.id==='rahn'); if(rahn&&obj('rahn24').state==='active'){ if(!rahn.dead) rahn.hp=Math.min(rahn.hp,420); if(rahn.dead&&!G.enemies.some(e=>/^rx/.test(e.id)&&!e.dead)){ complete('rahn24'); activate('cars24'); G.radioMsg('LUCIEN','Von Rahn caiu! Os vagões — rápido!','tip'); G.progress=null; cp24(); } }
  if(F.end24>0){ F.end24-=dt; if(F.end24<=0) missionComplete(); }
}
function cp24(){ checkpoint(); }
function restore24(s){ const F=G.flags, R=G.refs; F.allyInit=false; if(F.switched) R.lever.rotation.x=.5; R.T_.cars.slice(1).forEach((c,i)=>{ if(F['car'+i]) c.door.position.x+=1.9; }); if(F.tx!==undefined&&F.tx>-900) trainPose24(R.T_); }
LEVELS['24']={id:'24',num:24,op:'Operação 24',name:'Fim da Linha',place:'Pátio ferroviário do leste, Paris',prev:'23',finale:true,
  loadout:{weapons:['smg','rifle','pzf'],ammo:{smg:{mag:32,reserve:160},rifle:{mag:5,reserve:25},pzf:{mag:1,reserve:1}},cur:'smg',camera:false},baseLight:.55,lightFn:()=>.55,shadows:false,bloomTh:.85,grenades:true,nadeKind:'molotov',
  build:()=>buildLevel24(),enemies:ENEMY_DEFS_24,
  ally:{id:'luc',x:-54,z:-1.6,yaw:Math.PI/2,name:'LUCIEN',title:'Lucien',hp:170,range:45,dmg:38,look:{uniform:0x5a4630,pants:0x2d2a26,skin:0xcfa27e,hair:0x2b1e14,cap:'beret',weapon:'smg'},failTitle:'Lucien não resistiu',failText:'Lucien caiu no pátio ferroviário.'},
  start:{x:-54,z:0,yaw:-Math.PI/2},startDocs:[],drawMap:null,
  reinf:[{id:'n1',x:58,z:-20,weapon:'smg',helmet:true},{id:'n2',x:58,z:20,weapon:'rifle',helmet:true,nades:1}],radio:{x:24,z:-22,fx:24,fz:-21},radioRun:'O oficial corre para o telefone do posto!',alarmPos:V3(24,1.4,-22),alarmText:'Alarme no pátio! A escolta do trem se espalha.',alarmObjective:null,alarmYes:'',alarmLate:'',alarmNo:'',alarmOk:()=>true,deathText:'Élise caiu entre os trilhos, a metros do último trem.',
  objectives:objectives24,interact:interact24,pickups:()=>{ addPickup('t_med1',-40,-22,'med',35,.1); addPickup('t_nade1',-20,-22,'nade',2,.1); addPickup('t_med2',30,-24,'med',40,.1); addPickup('t_smg1',0,26,'smg',32,.1); addPickup('t_pzf1',44,26,'pzf',1,.1); addPickup('t_med3',40,26,'med',40,.1); G.player.nades=Math.max(G.player.nades||0,3); },
  update:update24,restore:restore24,
  resultTitle:'Fim da linha',outro:['ÉLISE','Abro a última porta e a luz do pátio entra num vagão cheio de rostos que eu conheço. Lá fora, todos os sinos de Paris tocam ao mesmo tempo. A guerra ainda não acabou — mas esta noite, a cidade é nossa.'],menuCam:{cx:-50,cz:0,y:3,tx:0,tz:4},ambient:'dawn',mist:null,
  briefing:{meta:'PARIS — 24 DE AGOSTO DE 1944 — 21h00',paras:['Os primeiros blindados aliados entram em Paris. No pátio ferroviário do leste, o coronel von Rahn prepara o último trem: três vagões lacrados com membros da Rede, e uma única agulha entre eles e a fronteira.','Chegue ao posto de sinalização e desvie o trem para o desvio morto antes que a locomotiva cruze a agulha. Depois, derrube von Rahn e abra os vagões.'],list:['Agulha no posto de sinalização','Coronel von Rahn','Três vagões dos reféns']}};
LEVEL_ORDER.push('24');