'use strict';


/* =========================================================
   PERSONAGENS (low poly, hitboxes anatômicas)
   ========================================================= */
const HMAT={};
function hm(c){ return HMAT[c]||(HMAT[c]=MAT_HQ?new T.MeshPhongMaterial({color:c,shininess:12,specular:0x141414}):new T.MeshLambertMaterial({color:c})); }
const BOXG={}; function BOX(w,h,d){ const k=w+'|'+h+'|'+d; return BOXG[k]||(BOXG[k]=new T.BoxGeometry(w,h,d)); }
let helmetGeo=null, brimGeo=null, shadowGeo=null;
function makeHuman(look,owner){
  const root=new T.Group(); root.rotation.order='YXZ';
  const g={}, parts={}, hitMeshes=[];
  const uni=hm(look.uniform), pants=hm(look.pants), skin=hm(look.skin), hair=hm(look.hair), boot=hm(0x1b1815);
  const part=(name,parent,w,h,d,x,y,z,mat,region)=>{ const m=new T.Mesh(BOX(w,h,d),mat); m.position.set(x,y,z); parent.add(m); m.userData={char:owner,region:region||name}; parts[name]=m; hitMeshes.push(m);
    const pk=LIMB_PROXY[name.split('_')[0]]; if(pk&&!region){ if(!PROXYMAT) PROXYMAT=new T.MeshBasicMaterial({visible:false}); const px=new T.Mesh(BOX(w*pk,h*1.04,d*pk),PROXYMAT); px.position.set(x,y,z); parent.add(px); px.userData=m.userData; hitMeshes.push(px); }
    return m; };
  const grp=(name,parent,x,y,z)=>{ const o=new T.Group(); o.position.set(x,y,z); parent.add(o); g[name]=o; return o; };
  grp('pelvis',root,0,.95,0); part('pelvis',g.pelvis,.34,.18,.21,0,0,0,pants);
  grp('spine',g.pelvis,0,.09,0); part('abdomen',g.spine,.32,.2,.2,0,.1,0,uni);
  grp('chest',g.spine,0,.2,0); part('chest',g.chest,.42,.3,.23,0,.15,0,uni);
  part('neck',g.chest,.11,.08,.11,0,.34,0,skin);
  grp('head',g.chest,0,.37,0); const head=part('head',g.head,.2,.24,.22,0,.12,0,skin);
  part('hair',g.head,.21,.035,.23,0,.247,-.006,hair,'head');
  const eyeM=hm(0x16120e); for(const ex of [-.05,.05]){ const e=new T.Mesh(BOX(.035,.02,.01),eyeM); e.position.set(ex,.02,.111); head.add(e); }
  const nose=new T.Mesh(BOX(.03,.05,.03),skin); nose.position.set(0,-.01,.12); head.add(nose);
  for(const [side,s] of [['L',1],['R',-1]]){
    grp('sh'+side,g.chest,s*.265,.27,0); part('upperArm_'+side,g['sh'+side],.1,.3,.1,0,-.15,0,uni);
    grp('el'+side,g['sh'+side],0,-.3,0); part('forearm_'+side,g['el'+side],.09,.27,.09,0,-.13,0,uni);
    grp('wr'+side,g['el'+side],0,-.27,0); part('hand_'+side,g['wr'+side],.08,.1,.07,0,-.05,0,skin);
    grp('hip'+side,g.pelvis,s*.1,-.02,0); part('thigh_'+side,g['hip'+side],.14,.42,.15,0,-.21,0,pants);
    grp('kn'+side,g['hip'+side],0,-.42,0); part('shin_'+side,g['kn'+side],.12,.42,.12,0,-.21,0,look.boots?boot:pants);
    grp('an'+side,g['kn'+side],0,-.43,0); part('foot_'+side,g['an'+side],.11,.08,.25,0,-.04,.05,boot);
  }
  // capacete (socket independente da cabeça)
  let helmet=null, helmetMeshes=[], cap=null, capMeshes=[];
  if(look.helmet){
    helmetGeo=helmetGeo||new T.SphereGeometry(.16,10,6,0,Math.PI*2,0,Math.PI/2); brimGeo=brimGeo||new T.CylinderGeometry(.175,.183,.025,10);
    helmet=grp('helmet',g.head,0,.165,0); const hmM=hm(look.helmetColor||0x3d443a);
    const shell=new T.Mesh(helmetGeo,hmM); shell.scale.set(1.05,.95,1.12); helmet.add(shell);
    const brim=new T.Mesh(brimGeo,hmM); brim.position.y=.002; brim.scale.z=1.1; helmet.add(brim);
    for(const m of [shell,brim]){ m.userData={char:owner,region:'equipment',equip:'helmet'}; helmetMeshes.push(m); hitMeshes.push(m); }
  } else if(look.cap){
    cap=grp('cap',g.head,0,.255,0);
    const cm=hm(look.capColor||(look.cap==='beret'?0x1d1d22:look.cap==='officer'?0x3a3e36:0x4a5040));
    const crown=new T.Mesh(BOX(look.cap==='beret'?.24:.23,look.cap==='officer'?.09:.05,look.cap==='beret'?.25:.24),cm); crown.position.y=look.cap==='officer'?.05:.02; if(look.cap==='beret'){ crown.rotation.z=.18; crown.position.x=.02; } cap.add(crown);
    if(look.cap==='officer'){ const v=new T.Mesh(BOX(.2,.015,.09),hm(0x141414)); v.position.set(0,.0,.13); cap.add(v); const band=new T.Mesh(BOX(.232,.03,.242),hm(0x2a2a2a)); band.position.y=.015; cap.add(band); }
    cap.traverse(m=>{ if(m.isMesh){ m.userData={char:owner,region:'equipment',equip:'cap'}; capMeshes.push(m); hitMeshes.push(m); } });
  }
  // arma (presa ao peito, apontando +z)
  let weapon=null, weaponMeshes=[], muzzle=null;
  if(look.weapon){
    weapon=grp('weapon',g.chest,-.08,.19,.2);
    const wm=hm(0x232527), wd=hm(0x4a3420);
    const len=EW[look.weapon].len;
    const add=(w,h,d,x,y,z,m)=>{ const o=new T.Mesh(BOX(w,h,d),m); o.position.set(x,y,z); weapon.add(o); o.userData={char:owner,region:'equipment',equip:'weapon'}; weaponMeshes.push(o); hitMeshes.push(o); };
    if(look.weapon==='rifle'){ add(.045,.07,.42,0,-.01,-.02,wd); add(.03,.03,.6,0,.02,.42,wm); }
    else if(look.weapon==='smg'){ add(.05,.07,.36,0,0,.12,wm); add(.03,.18,.04,0,-.12,.2,wm); add(.02,.02,.2,0,.01,.38,wm); }
    else { add(.04,.1,.06,0,-.03,.05,wm); add(.035,.04,.16,0,.02,.1,wm); }
    muzzle=new T.Object3D(); muzzle.position.set(0,.02,len*.75); weapon.add(muzzle);
  }
  { const shade=(c,k)=>(((c>>16&255)*k|0)<<16)|(((c>>8&255)*k|0)<<8)|((c&255)*k|0);
    const deco=(parent,w,h,d,x,y,z,mat,rx=0,rz=0)=>{ const m=new T.Mesh(BOX(w,h,d),mat); m.position.set(x,y,z); m.rotation.x=rx; m.rotation.z=rz; parent.add(m); return m; };
    const leather=hm(0x2a221a), dark=hm(shade(look.uniform,.72));
    deco(g.spine,.336,.055,.212,0,.005,0,leather); deco(g.spine,.055,.045,.012,0,.005,.108,hm(0x8a8070));
    for(const s of [-1,1]) deco(g.spine,.075,.07,.045,s*.105,0,.118,leather);
    deco(g.chest,.25,.06,.19,0,.3,0,dark);
    for(let i=0;i<4;i++) deco(g.chest,.018,.018,.008,0,.26-i*.065,.118,hm(0x9a9384));
    for(const s of [-1,1]){ deco(g.chest,.07,.05,.01,s*.11,.2,.117,dark); }
    for(const s of [-1,1]) deco(parts.head,.055,.012,.012,s*.05,.045,.112,hair);
    deco(parts.head,.06,.008,.01,0,-.06,.111,hm(shade(look.skin,.7)));
    if(look.helmet){ const can=new T.Mesh(new T.CylinderGeometry(.045,.045,.24,8),hm(0x515a4a)); can.rotation.z=Math.PI/2; can.position.set(.03,-.02,-.135); g.spine.add(can); for(const s of [-1,1]) deco(g.chest,.032,.32,.008,s*.085,.13,.117,leather); }
    if(look.cap==='officer') for(const sd of ['L','R']) deco(g['sh'+sd],.1,.02,.13,0,.02,0,hm(0xa9a9a0));
    if(look.cap==='beret') deco(g.chest,.26,.08,.21,0,.31,0,hm(0x6e2420));
  }
  let lanternLight=null, lanternGlass=null, lanternMeshes=[];
  if(look.lantern){
    const lg=grp('lantern',g.wrL,0,-.17,.03);
    const fr=new T.Mesh(BOX(.11,.15,.11),hm(0x1e2022)); lg.add(fr);
    lanternGlass=new T.Mesh(BOX(.085,.1,.085),MAT.lantern); lanternGlass.position.y=-.005; lg.add(lanternGlass);
    for(const m of [fr,lanternGlass]){ m.userData={char:owner,region:'equipment',equip:'lantern'}; lanternMeshes.push(m); hitMeshes.push(m); }
    lanternLight=new T.PointLight(0xffc27a,1,8,1.8); lanternLight.position.y=-.02; lg.add(lanternLight);
  }
  shadowGeo=shadowGeo||new T.CircleGeometry(.42,10);
  const sh=new T.Mesh(shadowGeo,MAT.shadow); sh.rotation.x=-Math.PI/2; sh.position.y=.015; root.add(sh);
  const _H={wtype:look.weapon||null,root,g,parts,hitMeshes,helmet,helmetMeshes,cap,capMeshes,weapon,weaponMeshes,muzzle,lanternLight,lanternGlass,lanternMeshes,weaponHome:weapon?{pos:weapon.position.clone(),rot:weapon.rotation.clone()}:null};
  if(settings.chars!=='classico') h2Build(_H,look,owner); return _H;
}
/* =========================================================
   PERSONAGENS v2 — corpo contínuo com pele (SkinnedMesh presa ao
   mesmo esqueleto do jogo), cabeça esculpida, mãos com dedos,
   uniforme com equipamento. As caixas de acerto continuam iguais
   (invisíveis), então tiros, desarme e armaduras não mudam.
   ========================================================= */
const H2={geo:new Map(),mat:new Map(),tex:{}};
const H2_HIDE=new T.MeshBasicMaterial({visible:false});
const H2_BONES=['pelvis','spine','chest','head','shL','elL','wrL','shR','elR','wrR','hipL','knL','anL','hipR','knR','anR'];
const H2_BI={}; H2_BONES.forEach((b,i)=>H2_BI[b]=i);
function h2Tex(kind){ if(H2.tex[kind]) return H2.tex[kind]; const R=mulberry32(kind.length*977+13); let t;
  if(kind==='cloth') t=canvasTex(128,128,(g,w,h)=>{ g.fillStyle='#ececec'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=2){ g.fillStyle=`rgba(0,0,0,${.025+R()*.03})`; g.fillRect(0,y,w,1); } for(let x=0;x<w;x+=2){ g.fillStyle=`rgba(255,255,255,${.02+R()*.03})`; g.fillRect(x,0,1,h); }
    for(let i=0;i<70;i++){ g.fillStyle=`rgba(0,0,0,${R()*.05})`; g.beginPath(); g.ellipse(R()*w,R()*h,4+R()*18,2+R()*8,R()*3,0,7); g.fill(); } for(let i=0;i<14;i++){ g.strokeStyle=`rgba(0,0,0,${.05+R()*.06})`; g.lineWidth=1+R()*1.5; g.beginPath(); const x=R()*w; g.moveTo(x,R()*h); g.quadraticCurveTo(x+R()*20-10,R()*h,x+R()*16-8,R()*h); g.stroke(); } });
  else if(kind==='leather') t=canvasTex(64,64,(g,w,h)=>{ g.fillStyle='#e0e0e0'; g.fillRect(0,0,w,h); for(let i=0;i<300;i++){ g.fillStyle=`rgba(0,0,0,${R()*.08})`; g.fillRect(R()*w,R()*h,1+R()*3,1); } for(let i=0;i<20;i++){ g.fillStyle=`rgba(255,255,255,${R()*.12})`; g.fillRect(R()*w,R()*h,4+R()*10,1); } });
  else t=canvasTex(64,64,(g,w,h)=>{ g.fillStyle='#f4f4f4'; g.fillRect(0,0,w,h); for(let i=0;i<400;i++){ g.fillStyle=`rgba(${R()<.5?'120,60,40':'255,255,255'},${R()*.05})`; g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2); } });
  t.magFilter=T.LinearFilter; t.wrapS=t.wrapT=T.RepeatWrapping; return H2.tex[kind]=t; }
function h2Mat(color,kind,skinned,vc){ const k=color+'|'+kind+'|'+(skinned?1:0)+(vc?'v':''); if(H2.mat.has(k)) return H2.mat.get(k);
  const sh={cloth:5,leather:40,skin:12,metal:60,eye:90,hair:8,dark:10}[kind]||8, sp={cloth:0x0a0a0a,leather:0x3a3632,skin:0x1a1612,metal:0x6a6a6a,eye:0xaaaaaa,hair:0x151515,dark:0x111111}[kind]||0x111111;
  const o={color:kind==='skin'?hstShade(color,.84):color}; if(kind==='cloth'||kind==='leather'||kind==='skin') o.map=h2Tex(kind); if(skinned) o.skinning=true; if(vc) o.vertexColors=true;
  const m=MAT_HQ?new T.MeshPhongMaterial(Object.assign(o,{shininess:sh,specular:sp})):new T.MeshLambertMaterial(o); H2.mat.set(k,m); return m; }
// ---------- malha com pele: anéis ao longo dos ossos ----------
function h2Builder(){ const B={pos:[],nor:[],uv:[],idx:[],si:[],sw:[],groups:[],cur:0,
  start(){ B.cur=B.idx.length; }, end(mi){ B.groups.push([B.cur,B.idx.length-B.cur,mi]); },
  vert(x,y,z,u,v,w){ const n=B.pos.length/3; B.pos.push(x,y,z); B.uv.push(u,v); const ws=Object.entries(w).sort((a,b)=>b[1]-a[1]).slice(0,4); let s=0; for(const [,q] of ws) s+=q; const I=[0,0,0,0], W=[0,0,0,0]; ws.forEach(([b,q],i)=>{ I[i]=H2_BI[b]; W[i]=q/s; }); B.si.push(...I); B.sw.push(...W); return n; },
  // anéis: {x,y,z,a,b,n,w}; eixo vertical (posição de repouso)
  tube(rings,seg,capB,capT,uvScale){ const first=B.pos.length/3; let vacc=0;
    rings.forEach((r,ri)=>{ if(ri) vacc+=Math.hypot(r.y-rings[ri-1].y,r.a-rings[ri-1].a); for(let k=0;k<=seg;k++){ const t=k/seg*Math.PI*2, c=Math.cos(t), s=Math.sin(t), e=2/(r.n||2); const px=Math.sign(s)*Math.pow(Math.abs(s),e)*r.a, pz=Math.sign(c)*Math.pow(Math.abs(c),e)*r.b; B.vert(r.x+px,r.y,r.z+pz,k/seg*(uvScale||1),vacc*(uvScale||1)*2,r.w); } });
    const row=seg+1; for(let ri=0;ri<rings.length-1;ri++) for(let k=0;k<seg;k++){ const a=first+ri*row+k, b=a+row; B.idx.push(a,b,a+1, a+1,b,b+1); }
    if(capB){ const r=rings[0]; const c=B.vert(r.x,r.y,r.z,.5,0,r.w); for(let k=0;k<seg;k++) B.idx.push(c,first+k+1,first+k); }
    if(capT){ const r=rings[rings.length-1], base=first+(rings.length-1)*row; const c=B.vert(r.x,r.y+.004,r.z,.5,1,r.w); for(let k=0;k<seg;k++) B.idx.push(c,base+k,base+k+1); } },
  build(){ const g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(B.pos,3)); g.setAttribute('uv',new T.Float32BufferAttribute(B.uv,2)); g.setAttribute('skinIndex',new T.Uint16BufferAttribute(B.si,4)); g.setAttribute('skinWeight',new T.Float32BufferAttribute(B.sw,4)); g.setIndex(B.idx); g.computeVertexNormals(); for(const [s,c,m] of B.groups) g.addGroup(s,c,m); g.boundingSphere=new T.Sphere(new T.Vector3(0,1,0),1.25); return g; } }; return B; }
// interpolação de pesos por pontos de controle em y
function h2W(y,pts){ if(y>=pts[0][0]) return pts[0][1]; for(let i=0;i<pts.length-1;i++){ const [y0,w0]=pts[i], [y1,w1]=pts[i+1]; if(y<=y0&&y>=y1){ const t=(y0-y)/(y0-y1||1), o={}; for(const k in w0) o[k]=(o[k]||0)+w0[k]*(1-t); for(const k in w1) o[k]=(o[k]||0)+w1[k]*t; return o; } } return pts[pts.length-1][1]; }
// tronco (túnica): meia-largura a, meia-profundidade b, deslocamento z
const H2_TORSO=[[.83,.168,.118,0,2.2],[.87,.171,.12,0,2.2],[.94,.166,.116,0,2.2],[1.0,.16,.11,0,2.3],[1.06,.151,.104,0,2.3],[1.12,.154,.106,.002,2.3],[1.2,.168,.114,.006,2.4],[1.28,.186,.12,.012,2.5],[1.36,.198,.124,.016,2.6],[1.44,.203,.118,.012,2.6],[1.49,.19,.104,.006,2.6],[1.53,.155,.088,0,2.4],[1.56,.1,.07,-.004,2.2],[1.575,.07,.062,-.006,2]];
function h2TorsoAt(y){ const T_=H2_TORSO; if(y<=T_[0][0]) return T_[0]; for(let i=0;i<T_.length-1;i++){ const p=T_[i], q=T_[i+1]; if(y>=p[0]&&y<=q[0]){ const t=(y-p[0])/(q[0]-p[0]); return p.map((v,k)=>v+(q[k]-v)*t); } } return T_[T_.length-1]; }
function h2BodyGeo(boots){ const key='body'+(boots?1:0); if(H2.geo.has(key)) return H2.geo.get(key); const B=h2Builder();
  const WT=[[1.3,{chest:1}],[1.22,{chest:.4,spine:.6}],[1.12,{spine:1}],[1.04,{spine:.5,pelvis:.5}],[.98,{pelvis:1}]];
  // túnica + braços (material 0)
  B.start(); B.tube(H2_TORSO.map(([y,a,b,z,n])=>({x:0,y,z,a,b,n,w:h2W(y,WT)})),20,true,true,1);
  for(const s of [1,-1]){ const S=s>0?'L':'R', sh='sh'+S, el='el'+S, wr='wr'+S, x0=s*.262;
    const AW=[[1.56,{chest:.6,[sh]:.4}],[1.53,{chest:.3,[sh]:.7}],[1.49,{[sh]:1}],[1.26,{[sh]:1}],[1.21,{[sh]:.5,[el]:.5}],[1.16,{[el]:1}]];
    const ar=[[1.566,.022,.024],[1.55,.048,.054],[1.525,.06,.064],[1.48,.061,.063],[1.41,.056,.058],[1.33,.055,.057],[1.26,.05,.052],[1.21,.047,.05],[1.165,.05,.052],[1.1,.049,.05],[1.03,.043,.044],[.975,.038,.037],[.962,.041,.041],[.952,.036,.036]];
    B.tube(ar.map(([y,a,b])=>({x:x0-s*(y>1.5?(y-1.5)*.9:0),y,z:0,a,b,n:2,w:h2W(y,AW)})),12,false,true,.6); }
  B.end(0);
  // calças (material 1)
  B.start(); for(const s of [1,-1]){ const S=s>0?'L':'R', hip='hip'+S, kn='kn'+S, an='an'+S, x0=s*.1;
    const LW=[[.99,{pelvis:1}],[.9,{[hip]:.85,pelvis:.15}],[.58,{[hip]:1}],[.51,{[hip]:.5,[kn]:.5}],[.45,{[kn]:1}],[.14,{[kn]:1}],[.09,{[kn]:.4,[an]:.6}]];
    const lr=boots?[[1.0,.098,.098],[.95,.1,.104],[.88,.097,.101],[.8,.091,.095],[.7,.083,.087],[.6,.073,.077],[.53,.065,.067],[.5,.062,.064],[.46,.064,.067],[.41,.068,.072],[.375,.066,.068],[.355,.052,.054]]
      :[[1.0,.098,.098],[.95,.1,.104],[.88,.097,.101],[.8,.091,.095],[.7,.083,.087],[.6,.073,.077],[.53,.065,.067],[.5,.062,.064],[.46,.064,.067],[.38,.065,.069],[.28,.06,.063],[.18,.056,.058],[.115,.056,.058],[.105,.05,.05]];
    B.tube(lr.map(([y,a,b])=>({x:x0+(y<.55?-s*.004:0),y,z:.006,a,b,n:2,w:h2W(y,LW)})),12,false,!boots,.7); }
  B.end(1);
  // botas de cano (material 2)
  if(boots){ B.start(); for(const s of [1,-1]){ const S=s>0?'L':'R', kn='kn'+S, an='an'+S, x0=s*.096; const BW=[[.4,{[kn]:1}],[.15,{[kn]:1}],[.09,{[kn]:.35,[an]:.65}]];
    const br=[[.385,.05,.052],[.395,.058,.06],[.36,.059,.062],[.3,.057,.06],[.22,.051,.053],[.15,.046,.048],[.11,.046,.05],[.085,.048,.054]];
    B.tube(br.map(([y,a,b])=>({x:x0,y,z:.006,a,b,n:2,w:h2W(y,BW)})),12,false,false,.6); } B.end(2); }
  // pescoço (material 3)
  B.start(); { const NW=[[1.69,{head:1}],[1.62,{head:.5,chest:.5}],[1.57,{chest:1}]]; B.tube([[1.55,.058,.056],[1.6,.055,.053],[1.65,.052,.05],[1.7,.048,.046]].map(([y,a,b])=>({x:0,y,z:-.008,a,b,n:2,w:h2W(y,NW)})),12,false,false,.5); } B.end(3);
  const g=B.build(); H2.geo.set(key,g); return g; }
// ---------- cabeça esculpida ----------
const H2_HS=[.095,.116,.108];
function h2Gauss(X,Y,cx,cy,sx,sy){ const dx=(X-cx)/sx, dy=(Y-cy)/sy; return Math.exp(-(dx*dx+dy*dy)); }
function h2Sculpt(x,y,z){ let sx=H2_HS[0], sy=H2_HS[1], sz=H2_HS[2]; if(y<0){ const k=-y; sx*=1-.16*k*k*k-.05*k*k; sz*=z>0?1-.03*k:1-.42*k; } if(y>.1&&z<0) sz*=1.06; if(y>.35) sx*=1-.06*(y-.35);
  let X=x*sx, Y=y*sy, Z=z*sz; const wf=clamp((z-.25)/.45,0,1);
  if(wf>0){ const ax=Math.abs(X);
    Z+=wf*(.009*h2Gauss(ax,Y,.03,.045,.035,.01)-.012*h2Gauss(ax,Y,.034,.02,.016,.013)+.024*h2Gauss(X,Y,0,-.008,.0095,.034)+.012*h2Gauss(X,Y,0,-.036,.013,.012)+.004*h2Gauss(ax,Y,.013,-.04,.006,.006)
      -.004*h2Gauss(X,Y,0,-.056,.008,.006)+.006*h2Gauss(X,Y,0,-.069,.024,.008)-.004*h2Gauss(X,Y,0,-.076,.022,.0035)+.011*h2Gauss(X,Y,0,-.104,.022,.016)+.006*h2Gauss(ax,Y,.056,-.008,.02,.016)-.006*wf*h2Gauss(ax,Y,.05,-.05,.02,.025));
    Z-=.012*wf*clamp((ax-.06)/.03,0,1); }
  return [X,Y,Z]; }
function h2HeadGeo(skin,hair){ const key='head'+skin+'|'+hair; if(H2.geo.has(key)) return H2.geo.get(key); const sg=new T.SphereGeometry(1,28,22), p=sg.attributes.position, col=[];
  const S=new T.Color(skin), Hc=new T.Color(hair), lip=new T.Color(skin).lerp(new T.Color(0x9a4a3a),.35), tmp=new T.Color();
  for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i); const [X,Y,Z]=h2Sculpt(x,y,z); p.setXYZ(i,X,Y,Z); const ax=Math.abs(X);
    tmp.copy(S); const sock=h2Gauss(ax,Y,.034,.02,.02,.016); tmp.multiplyScalar(1-.28*sock*(z>0?1:0));
    if(z>.3){ const lp=h2Gauss(X,Y,0,-.071,.022,.009); tmp.lerp(lip,lp*.8); const brow=(Y>.036&&Y<.052&&ax>.012&&ax<.058)?1:0; if(brow) tmp.lerp(Hc,.85-.3*(ax-.012)/.046); }
    const stub=(Y<-.04&&z>-.4)||(Y<-.05&&Math.abs(X)<.03&&z>.3); if(stub&&!(z>.3&&h2Gauss(X,Y,0,-.071,.024,.01)>.4)) tmp.lerp(Hc,.16);
    if(Y>.07&&z<.55-Y*2) tmp.lerp(Hc,.92); else if(z<-.3&&Y>-.05) tmp.lerp(Hc,.88);
    if(Y<-.1&&z<0) tmp.multiplyScalar(.9);
    if(z>.2){ const ao=.22*h2Gauss(ax,Y,.018,.0,.008,.03)+.25*h2Gauss(ax,Y,.035,.038,.03,.006)+.2*h2Gauss(X,Y,0,-.048,.014,.006)+.18*h2Gauss(X,Y,0,-.083,.02,.006)+.16*h2Gauss(ax,Y,.065,-.035,.018,.03)+.12*h2Gauss(ax,Y,.03,-.06,.006,.02); tmp.multiplyScalar(1-ao); }
    if(Y<-.095) tmp.multiplyScalar(1-.25*clamp((-.095-Y)/.03,0,1)); if(ax>.085) tmp.multiplyScalar(.95);
    col.push(tmp.r,tmp.g,tmp.b); }
  sg.setAttribute('color',new T.Float32BufferAttribute(col,3)); sg.computeVertexNormals(); H2.geo.set(key,sg); return sg; }
function h2FrontZ(X,Y){ const x0=X/H2_HS[0], y0=Y/H2_HS[1], z0=Math.sqrt(Math.max(0,1-x0*x0-y0*y0)); return h2Sculpt(x0,y0,z0)[2]; }
function h2EyePos(sgn){ const X=sgn*.033, Y=.02; return [X,Y,h2FrontZ(X,Y)-.004]; }
function h2NoseGeo(){ if(H2.geo.has('nose')) return H2.geo.get('nose'); const v=[[0,.034,-.004],[0,.0,.014],[0,-.03,.024],[0,-.041,.014],[0,-.043,.004],[-.007,.026,-.006],[.007,.026,-.006],[-.01,-.004,.002],[.01,-.004,.002],[-.016,-.036,.004],[.016,-.036,.004],[-.011,-.043,.006],[.011,-.043,.006]];
  const f=[[0,5,1],[0,1,6],[5,7,1],[6,1,8],[1,7,2],[1,2,8],[7,9,2],[8,2,10],[2,9,11],[2,12,10],[2,11,3],[2,3,12],[3,11,4],[3,4,12]]; const pos=[]; for(const t of f) for(const k of t) pos.push(...v[k]); const g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(pos,3)); g.computeVertexNormals(); g.setAttribute('uv',new T.Float32BufferAttribute(new Array(pos.length/3*2).fill(.5),2)); H2.geo.set('nose',g); return g; }
function h2HairGeo(){ if(H2.geo.has('hair')) return H2.geo.get('hair'); const sg=new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*.62), p=sg.attributes.position;
  for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i); const thr=z>0?.18+.42*z:.18-.5*(-z); const [X,Y,Z]=h2Sculpt(x,y,z); const k=y>thr?1.045:.97; p.setXYZ(i,X*k,Y*k+(y>thr?.004:0),Z*k-(y>thr?.003:0)); }
  sg.computeVertexNormals(); H2.geo.set('hair',sg); return sg; }
// ---------- peças rígidas (fundidas por osso e material) ----------
function h2Rigid(key,build){ if(H2.geo.has(key)) return H2.geo.get(key); const list=[]; build((geo,x,y,z,rx,ry,rz,sx,sy,sz)=>{ const m=new T.Mesh(geo); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); if(sx!==undefined) m.scale.set(sx,sy,sz); m.updateMatrix(); list.push(m); });
  let n=0; const gs=list.map(m=>{ const g=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()); g.applyMatrix4(m.matrix); n+=g.attributes.position.count; return g; });
  const pos=new Float32Array(n*3), nor=new Float32Array(n*3), uv=new Float32Array(n*2); let o=0; for(const g of gs){ pos.set(g.attributes.position.array,o*3); nor.set(g.attributes.normal.array,o*3); if(g.attributes.uv) uv.set(g.attributes.uv.array,o*2); o+=g.attributes.position.count; }
  const G2=new T.BufferGeometry(); G2.setAttribute('position',new T.BufferAttribute(pos,3)); G2.setAttribute('normal',new T.BufferAttribute(nor,3)); G2.setAttribute('uv',new T.BufferAttribute(uv,2)); H2.geo.set(key,G2); return G2; }
function h2Round(w,h,d,r){ const sg=Math.max(w,h,d)<.06?1:2; const g=new T.BoxGeometry(w,h,d,sg,sg,sg), p=g.attributes.position, hw=w/2-r, hh=h/2-r, hd=d/2-r; for(let i=0;i<p.count;i++){ let x=p.getX(i), y=p.getY(i), z=p.getZ(i); const cx=clamp(x,-hw,hw), cy=clamp(y,-hh,hh), cz=clamp(z,-hd,hd); let dx=x-cx, dy=y-cy, dz=z-cz; const l=Math.hypot(dx,dy,dz); if(l>1e-6){ dx*=r/l; dy*=r/l; dz*=r/l; } p.setXYZ(i,cx+dx,cy+dy,cz+dz); } g.computeVertexNormals(); return g; }
function h2Front(y,ang){ const t=h2TorsoAt(y); const a=ang||0, c=Math.cos(a), s=Math.sin(a), e=2/t[4]; return [Math.sign(s)*Math.pow(Math.abs(s),e)*t[1], t[3]+Math.sign(c)*Math.pow(Math.abs(c),e)*t[2]]; }
function h2Hand(s){ return h2Rigid('hand'+s,(add)=>{ add(h2Round(.032,.085,.078,.012),0,-.046,0); add(h2Round(.026,.05,.074,.01),-s*.006,-.104,.002,0,0,s*.38); add(h2Round(.022,.04,.07,.009),-s*.028,-.132,.004,0,0,s*1.05); add(h2Round(.024,.05,.024,.01),-s*.012,-.05,.046,-.5,0,s*.35); add(h2Round(.02,.035,.02,.008),-s*.022,-.082,.06,-.3,0,s*.5); }); }
function h2Boot(s,tall){ return h2Rigid('boot'+(tall?1:0),(add)=>{ const g=h2Round(.098,.085,.24,.03), p=g.attributes.position; for(let i=0;i<p.count;i++){ const z=p.getZ(i), y=p.getY(i); if(z>.04&&y>-.01) p.setY(i,y-(z-.04)*.32); if(z>.06) p.setX(i,p.getX(i)*(1-(z-.06)*1.6)); } g.computeVertexNormals(); add(g,0,-.036,.045); add(h2Round(.104,.022,.25,.008),0,-.075,.046); add(h2Round(.09,.03,.06,.01),0,-.07,-.05); }); }
function h2Gear(kind){ return h2Rigid('gear_'+kind,(add)=>{
  if(kind==='belt'){ const t=h2TorsoAt(1.0); for(let k=0;k<16;k++){ const a0=k/16*Math.PI*2, a1=(k+1)/16*Math.PI*2, [x0,z0]=h2Front(1.0,a0), [x1,z1]=h2Front(1.0,a1); const sc=1.06; add(BOX(Math.hypot(x1-x0,z1-z0)*sc+.004,.048,.012),(x0+x1)/2*sc,0,(z0+z1)/2*sc,0,Math.atan2(z1-z0,x1-x0)*-1+0,0); } }
  else if(kind==='buckle'){ const [, z]=h2Front(1.0,0); add(h2Round(.06,.05,.014,.004),0,0,z*1.06+.008); }
  else if(kind==='pouches'){ for(const s of [-1,1]) for(let i=0;i<3;i++){ const a=s*(.42+i*.3), [x,z]=h2Front(1.0,a); add(h2Round(.052,.07,.032,.008),x*1.08,-.005,z*1.08+.01,0,a*.9,0); } }
  else if(kind==='canteen'){ const a=Math.PI*.78, [x,z]=h2Front(1.0,a); const c=new T.CylinderGeometry(.05,.05,.17,12); c.scale(1,1,.6); add(c,x*1.05,-.1,z*1.05,0,-a,0); }
  else if(kind==='bag'){ const a=-Math.PI*.72, [x,z]=h2Front(1.0,a); add(h2Round(.15,.13,.05,.02),x*1.03,-.1,z*1.03,0,-a,0); }
  else if(kind==='tunic'){ for(const s of [-1,1]){ const [x,z]=h2Front(1.4,s*.42); add(h2Round(.085,.08,.012,.008),x*1.0+s*.004,1.37-1.24,z+.004,0,s*.32,0); add(h2Round(.092,.03,.016,.006),x*1.0+s*.004,1.418-1.24,z+.007,-.12,s*.32,0); const [x2,z2]=h2Front(1.15,s*.5); add(h2Round(.1,.09,.012,.008),x2+s*.005,1.13-1.24,z2+.004,0,s*.4,0); add(h2Round(.108,.032,.016,.006),x2+s*.005,1.185-1.24,z2+.007,-.1,s*.4,0); }
    for(let i=0;i<5;i++){ const y=1.48-i*.085, [, z]=h2Front(y,0); add(new T.CylinderGeometry(.008,.008,.006,8),0,y-1.24,z+.004,Math.PI/2,0,0); } const [, zc]=h2Front(1.3,0); add(BOX(.006,.4,.004),0,1.3-1.24,zc+.002);
    for(const s of [-1,1]) add(h2Round(.055,.012,.1,.005),s*.165,1.532-1.24,0,0,0,s*.42); { const cg=new T.CylinderGeometry(.062,.068,.042,22,1,true,Math.PI*.1,Math.PI*1.8); cg.scale(1,1,.95); add(cg,0,1.588-1.24,-.008); } for(const s of [-1,1]) add(BOX(.026,.02,.004),s*.03,1.588-1.24,.058,0,s*.55,0); }
  else if(kind==='straps'){ for(const s of [-1,1]){ const pts=[[1.03,.36],[1.12,.32],[1.2,.3],[1.28,.31],[1.36,.33],[1.43,.37],[1.49,.46]]; for(let i=0;i<pts.length-1;i++){ const [y0,a0]=pts[i], [y1,a1]=pts[i+1], [x0,z0]=h2Front(y0,s*a0), [x1,z1]=h2Front(y1,s*a1); const L=Math.hypot(x1-x0,y1-y0,z1-z0); const m=BOX(.034,L+.004,.006); const nx=(x0+x1)/2, nz=(z0+z1)/2, nl=Math.hypot(nx,nz)||1; add(m,nx+nx/nl*.006,(y0+y1)/2-1.24,nz+nz/nl*.006,Math.atan2(z1-z0,y1-y0),0,-Math.atan2(x1-x0,y1-y0)); } const [x2,z2]=h2Front(1.5,s*1.2); add(BOX(.028,.012,.2),x2*.85,1.545-1.24,0,0,0,s*.3); const [x3,z3]=h2Front(1.3,s*2.6); add(BOX(.028,.35,.008),x3*1.02,1.3-1.24,z3*1.02-.004,0,0,s*.12); } }
  else if(kind==='cuffs'){ add(new T.CylinderGeometry(.044,.044,.03,12),0,-.0,0); }
}); }
function h2MergeKids(obj){ const groups=new Map(); for(const c of obj.children){ if(!c.isMesh||c.isSkinnedMesh||c.children.length||(c.userData&&c.userData.region)||Array.isArray(c.material)) continue; const k=c.material.uuid; if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(c); }
  for(const list of groups.values()){ if(list.length<2) continue; let n=0; const gs=list.map(m=>{ m.updateMatrix(); const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone(); g.applyMatrix4(m.matrix); n+=g.attributes.position.count; return g; });
    const hasC=gs.every(g=>g.attributes.color); const pos=new Float32Array(n*3), nor=new Float32Array(n*3), uv=new Float32Array(n*2), col=hasC?new Float32Array(n*3):null; let o=0; for(const g of gs){ pos.set(g.attributes.position.array,o*3); nor.set(g.attributes.normal.array,o*3); if(g.attributes.uv) uv.set(g.attributes.uv.array,o*2); if(col) col.set(g.attributes.color.array,o*3); o+=g.attributes.position.count; g.dispose(); }
    const G2=new T.BufferGeometry(); G2.setAttribute('position',new T.BufferAttribute(pos,3)); G2.setAttribute('normal',new T.BufferAttribute(nor,3)); G2.setAttribute('uv',new T.BufferAttribute(uv,2)); if(col) G2.setAttribute('color',new T.BufferAttribute(col,3)); const M2=new T.Mesh(G2,list[0].material); obj.add(M2); for(const m of list) obj.remove(m); } }
// ---------- armas dos personagens ----------
function h2Gun(kind,part){ return h2Rigid('gun'+kind+part,(add)=>{ const cyl=(r,len,x,y,z,seg)=>add(new T.CylinderGeometry(r,r,len,seg||10),x,y,z,Math.PI/2,0,0);
  if(kind==='rifle'){ if(part==='wood'){ const b=h2Round(.04,.1,.11,.014); b.translate(0,-.028,0); add(b,0,-.01,-.085,.12,0,0); add(h2Round(.032,.044,.07,.012),0,-.004,-.01,.22,0,0); add(h2Round(.038,.048,.44,.012),0,.0,.24); add(h2Round(.03,.02,.3,.008),0,.032,.3); }
    else if(part==='metal'){ cyl(.011,.64,0,.026,.42); add(h2Round(.034,.042,.17,.008),0,.024,.02); cyl(.014,.05,0,.026,.73); add(BOX(.008,.02,.012),0,.042,.72); add(BOX(.02,.014,.03),0,.046,.12); add(h2Round(.012,.012,.05,.005),.03,.03,-.03,0,0,0); add(new T.SphereGeometry(.011,8,6),.052,.028,-.04); add(new T.TorusGeometry(.018,.004,4,10,Math.PI),0,-.03,-.02,0,Math.PI/2,0); for(const z of [.12,.44]) add(BOX(.044,.012,.022),0,.0,z); }
    else { add(BOX(.012,.006,.5),.0,-.072,.08,-.05,0,0); } }
  else if(kind==='smg'){ if(part==='metal'){ cyl(.022,.28,0,0,.07,12); cyl(.009,.16,0,.0,.3); cyl(.012,.03,0,0,.38); add(h2Round(.022,.17,.034,.006),0,-.1,.14,.1,0,0); add(h2Round(.028,.05,.05,.008),0,-.03,.12); add(BOX(.006,.02,.012),0,.03,.34); add(new T.TorusGeometry(.018,.004,4,10,Math.PI),0,-.03,.02,0,Math.PI/2,0);
      for(const s of [-1,1]) add(BOX(.006,.006,.24),s*.016,-.045,.02,0,0,0); add(BOX(.04,.008,.04),0,-.05,.14); }
    else if(part==='dark'){ add(h2Round(.026,.085,.036,.008),0,-.065,.0,.28,0,0); } }
  else { if(part==='metal'){ add(h2Round(.024,.032,.15,.006),0,.022,.06); cyl(.007,.03,0,.024,.14,8); add(new T.TorusGeometry(.014,.003,4,10,Math.PI),0,-.002,.03,0,Math.PI/2,0); } else if(part==='dark'){ add(h2Round(.024,.085,.036,.008),0,-.035,.0,.25,0,0); } }
}); }
// ---------- capacete e bonés ----------
function h2HelmetGeo(){ if(H2.geo.has('helm2')) return H2.geo.get('helm2'); const pts=[[0,.118],[.06,.112],[.1,.09],[.122,.052],[.13,.012],[.136,-.014],[.142,-.022],[.141,-.027],[.128,-.02],[.12,.02],[.1,.07],[.06,.1],[0,.11]].map(([x,y])=>new T.Vector2(x,y));
  const g=new T.LatheGeometry(pts,16); g.scale(1,1,1.1); g.computeVertexNormals(); H2.geo.set('helm2',g); return g; }
function h2CapGeo(kind){ return h2Rigid('cap2'+kind,(add)=>{
  if(kind==='officer'){ const band=new T.CylinderGeometry(.104,.102,.042,24); band.scale(1,1,1.1); add(band,0,0,0); const cr=new T.CylinderGeometry(.13,.106,.05,24); cr.scale(1,1,1.12); add(cr,0,.045,-.008,-.08,0,0); const top=new T.SphereGeometry(.13,24,6,0,Math.PI*2,0,Math.PI/2); top.scale(1,.12,1.12); add(top,0,.07,-.012,-.08,0,0); const vz=new T.CylinderGeometry(.1,.1,.008,20,1,false,-Math.PI/2,Math.PI); vz.scale(1,1,.55); add(vz,0,-.016,.088,.32,0,0); }
  else if(kind==='beret'){ const b=new T.SphereGeometry(.125,20,10); b.scale(1.02,.3,1.08); add(b,.018,.02,-.004,0,0,.16); add(new T.TorusGeometry(.1,.008,5,22),0,-.004,0,Math.PI/2,0,0); }
  else { const c=new T.CylinderGeometry(.098,.104,.07,20); c.scale(1,1,1.12); add(c,0,.012,0); const t=new T.SphereGeometry(.098,20,5,0,Math.PI*2,0,Math.PI/2); t.scale(1,.18,1.12); add(t,0,.047,0); const vz=new T.CylinderGeometry(.085,.085,.007,18,1,false,-Math.PI/2,Math.PI); vz.scale(1,1,.6); add(vz,0,-.018,.09,.2,0,0); }
}); }
// ---------- montagem ----------
function h2Build(h,look,owner){ const P=h.parts, g=h.g, root=h.root; const boots=!!look.boots;
  for(const k in P){ const m=P[k]; for(const c of m.children.slice()) if(c.isMesh&&!c.userData.region) m.remove(c); m.material=H2_HIDE; }
  for(const gn of ['pelvis','spine','chest','shL','shR','head']){ const G_=g[gn]; if(!G_) continue; for(const c of G_.children.slice()) if(c.isMesh&&!(c.userData&&c.userData.region)&&!c.userData.mat) G_.remove(c); }
  for(const m of h.hitMeshes) if(m.userData.region==='equipment'&&m.userData.equip!=='weapon') {}
  // corpo com pele
  root.updateMatrixWorld(true); const bones=H2_BONES.map(b=>g[b]); const uni=h2Mat(look.uniform,'cloth',true), pants=h2Mat(look.pants,'cloth',true), bootM=h2Mat(0x231e19,'leather',true), skinS=h2Mat(look.skin,'skin',true);
  const body=new T.SkinnedMesh(h2BodyGeo(boots),[uni,pants,bootM,skinS]); body.frustumCulled=false; root.add(body); body.updateMatrixWorld(true);
  const inv=bones.map(b=>new T.Matrix4().copy(b.matrixWorld).invert()); const sk=new T.Skeleton(bones,inv); body.bind(sk,body.matrixWorld); h.body=body;
  // cabeça
  const skinM=h2Mat(look.skin,'skin',false), hairM=h2Mat(look.hair,'hair',false);
  const head=new T.Mesh(h2HeadGeo(look.skin,look.hair),h2Mat(0xffffff,'skin',false,true)); head.position.set(0,.112,.004); g.head.add(head); h.headMesh=head;
  if(!look.helmet){ const hr=new T.Mesh(h2HairGeo(),hairM); hr.position.copy(head.position); g.head.add(hr); }
  const eyeW=h2Mat(0xb4aa98,'eye',false), eyeD=h2Mat(0x1c140e,'eye',false); const eg=H2.geo.get('eye')||(H2.geo.set('eye',new T.SphereGeometry(.0118,8,6)),H2.geo.get('eye')), ig=H2.geo.get('iris')||(H2.geo.set('iris',new T.SphereGeometry(.0062,8,6)),H2.geo.get('iris'));
  for(const s of [-1,1]){ const [x,y,z]=h2EyePos(s); const e=new T.Mesh(eg,eyeW); e.position.set(x,y,z-.002); e.scale.set(.92,.62,.75); head.add(e); const ir=new T.Mesh(ig,eyeD); ir.position.set(x,y-.0012,z+.006); ir.scale.set(1.3,1.25,.55); head.add(ir);
    const lid=new T.Mesh(H2.geo.get('lid')||(H2.geo.set('lid',new T.SphereGeometry(.0128,8,4,0,Math.PI*2,0,Math.PI*.42)),H2.geo.get('lid')),skinM); lid.position.set(x,y+.0005,z-.001); lid.rotation.x=.5; lid.scale.set(1.0,.9,.92); head.add(lid);
    const brow=new T.Mesh(H2.geo.get('brow')||(H2.geo.set('brow',h2Round(.036,.009,.012,.004)),H2.geo.get('brow')),hairM); brow.position.set(s*.032,.045,h2FrontZ(s*.032,.045)+.002); brow.rotation.set(-.15,s*.3,-s*.14); head.add(brow);
    const ear=new T.Mesh(H2.geo.get('ear2')||(H2.geo.set('ear2',(()=>{ const q=new T.SphereGeometry(1,6,5); q.scale(.011,.03,.021); return q; })()),H2.geo.get('ear2')),skinM); ear.position.set(s*.091,.0,-.012); ear.rotation.set(0,s*.35,s*.08); head.add(ear); }
  { const n=new T.Mesh(h2NoseGeo(),skinM); n.scale.set(.85,.82,.7); n.position.set(0,-.006,h2FrontZ(0,-.006)-.006); head.add(n); const mo=new T.Mesh(BOX(.036,.0045,.006),h2Mat(0x4a2a22,'dark',false)); mo.position.set(0,-.073,h2FrontZ(0,-.073)+.0005); head.add(mo); }
  // mãos e botas
  for(const s of [1,-1]){ const S=s>0?'L':'R'; const hd=new T.Mesh(h2Hand(s),skinM); g['wr'+S].add(hd); const ft=new T.Mesh(h2Boot(s,boots),h2Mat(0x231e19,'leather',false)); g['an'+S].add(ft); }
  // equipamento (rígido)
  const leather=h2Mat(0x2c241c,'leather',false), metal=h2Mat(0x8a8270,'metal',false), uniR=h2Mat(look.uniform,'cloth',false), uniD=h2Mat(hstShade(look.uniform,.82),'cloth',false);
  const put=(geo,mat,par,y)=>{ const m=new T.Mesh(geo,mat); m.position.y=y||0; par.add(m); return m; };
  put(h2Gear('tunic'),uniD,g.chest,0); put(h2Gear('belt'),leather,g.pelvis,1.0-.95); put(h2Gear('buckle'),metal,g.pelvis,1.0-.95);
  if(look.helmet){ put(h2Gear('pouches'),leather,g.pelvis,1.0-.95); put(h2Gear('canteen'),h2Mat(0x4a5040,'cloth',false),g.pelvis,1.0-.95); put(h2Gear('bag'),h2Mat(0x6a6650,'cloth',false),g.pelvis,1.0-.95); }
  h2MergeKids(head); h2MergeKids(g.pelvis); h2MergeKids(g.chest);
  h.lod=[...head.children]; for(const c of g.chest.children) if(c.isMesh&&!c.userData.region&&c.geometry===H2.geo.get('gear_tunic')) h.lod.push(c); for(const c of g.chest.children) if(c.isMesh&&!c.userData.region&&!c.isSkinnedMesh&&c.material&&c.material.map===h2Tex('cloth')&&!h.lod.includes(c)) h.lod.push(c);
  // capacete novo
  if(h.helmet){ const [shell,brim]=h.helmetMeshes; const cm=hstCamo(look.helmetColor||0x3d443a); shell.geometry=h2HelmetGeo(); shell.material=cm; shell.scale.set(1,.82,1); shell.position.set(0,.022,-.008); shell.rotation.x=-.1; if(brim) brim.visible=false;
    for(const c of h.helmet.children.slice()) if(c!==shell&&c!==brim) h.helmet.remove(c);
    const strapM=h2Mat(0x3a3020,'leather',false); for(const s of [-1,1]){ const st=new T.Mesh(BOX(.006,.15,.01),strapM); st.position.set(s*.072,-.098,.034); st.rotation.set(-.5,0,-s*.5); h.helmet.add(st); } const ch=new T.Mesh(BOX(.05,.008,.014),strapM); ch.position.set(0,-.158,.07); h.helmet.add(ch); }
  if(h.cap){ for(const c of h.cap.children.slice()) h.cap.remove(c); const cm=h2Mat(look.capColor||(look.cap==='beret'?0x1d1d22:look.cap==='officer'?0x3a3e36:0x4a5040),'cloth',false); const m=new T.Mesh(h2CapGeo(look.cap==='officer'?'officer':look.cap==='beret'?'beret':'field'),cm); m.position.y=look.cap==='beret'?-.05:-.072; h.cap.add(m); m.userData={char:owner,region:'equipment',equip:'cap'};
    if(look.cap==='officer'){ const v=new T.Mesh(H2.geo.get('visor')||(H2.geo.set('visor',(()=>{ const q=new T.CylinderGeometry(.1,.1,.008,20,1,false,-Math.PI/2,Math.PI); q.scale(1,1,.55); return q; })()),H2.geo.get('visor')),h2Mat(0x121212,'leather',false)); v.position.set(0,-.088,.088); v.rotation.x=.32; h.cap.add(v); }
    h.capMeshes.length=0; h.cap.traverse(o=>{ if(o.isMesh){ o.userData={char:owner,region:'equipment',equip:'cap'}; h.capMeshes.push(o); } }); }
  // arma mais detalhada
  if(h.weapon&&h.wtype){ for(const m of h.weaponMeshes) m.material=H2_HIDE; const wk=h.wtype; const metalW=h2Mat(0x26282a,'metal',false), wood=h2Mat(0x4e3420,'leather',false), dark=h2Mat(0x141414,'dark',false);
    const vis=[[h2Gun(wk,'metal'),metalW],[h2Gun(wk,'wood'),wood],[h2Gun(wk,'dark'),dark]]; for(const [geo,mat] of vis){ if(!geo.attributes.position.count) continue; const m=new T.Mesh(geo,mat); h.weapon.add(m); } }
}

/* =========================================================
   VISUAL DOS PERSONAGENS — low poly facetado (membros cônicos,
   rosto pintado, capacete com jugular); o esqueleto e as caixas
   de acerto continuam as mesmas
   ========================================================= */
const HST={geo:new Map(),cloth:new Map(),face:new Map(),camo:new Map(),fab:null};
function hstFabric(){ if(HST.fab) return HST.fab; const R=mulberry32(5150); HST.fab=canvasTex(64,64,(g,w,h)=>{ g.fillStyle='#f2f2f2'; g.fillRect(0,0,w,h);
  for(let i=0;i<90;i++){ const x=R()*w, y=R()*h, s=6+R()*16; const v=R(); g.fillStyle=v<.6?`rgba(0,0,0,${.03+R()*.09})`:`rgba(255,255,255,${.05+R()*.08})`; g.beginPath(); g.moveTo(x,y); g.lineTo(x+s*(R()-.3),y+s*(R()*.6+.4)); g.lineTo(x-s*(R()*.8+.2),y+s*(R()-.2)); g.closePath(); g.fill(); }
  g.strokeStyle='rgba(0,0,0,.07)'; for(let i=0;i<8;i++){ const x=R()*w; g.lineWidth=1+R(); g.beginPath(); g.moveTo(x,0); g.lineTo(x+R()*10-5,h); g.stroke(); } }); HST.fab.magFilter=T.LinearFilter; return HST.fab; }
function hstCloth(c){ if(!HST.cloth.has(c)){ const o={color:c,map:hstFabric()}; HST.cloth.set(c,MAT_HQ?new T.MeshPhongMaterial(Object.assign(o,{shininess:4,specular:0x070707})):new T.MeshLambertMaterial(o)); } return HST.cloth.get(c); }
function hstCamo(c){ if(!HST.camo.has(c)){ const R=mulberry32(c&0xffff); const t=canvasTex(64,64,(g,w,h)=>{ g.fillStyle='#e8e8e0'; g.fillRect(0,0,w,h); const cols=['rgba(70,60,30,.35)','rgba(30,40,20,.35)','rgba(140,130,90,.3)','rgba(0,0,0,.18)']; for(let i=0;i<46;i++){ g.fillStyle=cols[i%4]; g.beginPath(); const x=R()*w, y=R()*h; g.moveTo(x,y); for(let k=0;k<5;k++) g.lineTo(x+(R()-.5)*20,y+(R()-.5)*16); g.closePath(); g.fill(); } }); t.magFilter=T.LinearFilter; const o={color:c,map:t};
  HST.camo.set(c,MAT_HQ?new T.MeshPhongMaterial(Object.assign(o,{shininess:10,specular:0x111111})):new T.MeshLambertMaterial(o)); } return HST.camo.get(c); }
function hstHex(c){ return '#'+c.toString(16).padStart(6,'0'); }
function hstShade(c,k){ return (Math.min(255,(c>>16&255)*k|0)<<16)|(Math.min(255,(c>>8&255)*k|0)<<8)|Math.min(255,(c&255)*k|0); }
function hstFace(skin,hair,seed){ const key=skin+'|'+hair+'|'+(seed%3); if(HST.face.has(key)) return HST.face.get(key); const R=mulberry32(skin^seed*7919);
  const t=canvasTex(80,96,(g,w,h)=>{ const S=hstHex(skin), D=hstHex(hstShade(skin,.62)), DD=hstHex(hstShade(skin,.45)), L=hstHex(hstShade(skin,1.14)), HC=hstHex(hair);
    g.fillStyle=S; g.fillRect(0,0,w,h); const sg=g.createLinearGradient(0,0,w,0); sg.addColorStop(0,'rgba(0,0,0,.22)'); sg.addColorStop(.2,'rgba(0,0,0,0)'); sg.addColorStop(.8,'rgba(0,0,0,0)'); sg.addColorStop(1,'rgba(0,0,0,.22)'); g.fillStyle=sg; g.fillRect(0,0,w,h);
    g.fillStyle=HC; g.fillRect(0,0,w,9); for(let x=0;x<w;x+=4) g.fillRect(x,9,3,2+R()*4);
    g.fillStyle=L; g.fillRect(14,16,52,10); // testa
    g.fillStyle=D; g.beginPath(); g.ellipse(25,41,11,6.5,0,0,7); g.fill(); g.beginPath(); g.ellipse(55,41,11,6.5,0,0,7); g.fill(); // órbitas
    g.fillStyle=HC; const bt=seed%3; g.save(); g.translate(25,33); g.rotate(.12+bt*.06); g.fillRect(-11,-2,22,4.5); g.restore(); g.save(); g.translate(55,33); g.rotate(-.12-bt*.06); g.fillRect(-11,-2,22,4.5); g.restore(); // sobrancelhas
    for(const ex of [25,55]){ g.fillStyle='#d8d0c0'; g.fillRect(ex-5,40,10,3); g.fillStyle='#1a1410'; g.fillRect(ex-2,40,4,3); g.fillStyle=DD; g.fillRect(ex-6,39,12,1); }
    g.fillStyle=L; g.beginPath(); g.moveTo(38,40); g.lineTo(42,40); g.lineTo(45,60); g.lineTo(35,60); g.closePath(); g.fill(); // nariz
    g.fillStyle=D; g.beginPath(); g.moveTo(35,60); g.lineTo(45,60); g.lineTo(43,64); g.lineTo(37,64); g.closePath(); g.fill(); g.fillStyle=DD; g.fillRect(36,62,3,2); g.fillRect(41,62,3,2);
    g.fillStyle='rgba(0,0,0,.16)'; g.beginPath(); g.moveTo(10,52); g.lineTo(30,58); g.lineTo(28,66); g.lineTo(12,64); g.closePath(); g.fill(); g.beginPath(); g.moveTo(70,52); g.lineTo(50,58); g.lineTo(52,66); g.lineTo(68,64); g.closePath(); g.fill(); // maçãs
    g.strokeStyle='rgba(0,0,0,.2)'; g.lineWidth=1.5; g.beginPath(); g.moveTo(32,62); g.lineTo(29,74); g.stroke(); g.beginPath(); g.moveTo(48,62); g.lineTo(51,74); g.stroke();
    g.fillStyle=DD; g.fillRect(31,73,18,2.5); g.fillStyle='rgba(255,255,255,.12)'; g.fillRect(33,76,14,2); // boca
    g.fillStyle='rgba(0,0,0,.14)'; g.fillRect(33,84,14,6); // queixo
    for(let i=0;i<260;i++){ const y=64+R()*30, x=8+R()*64; if(Math.abs(x-40)<9&&y<79&&y>70) continue; g.fillStyle=`rgba(${(hair>>16&255)},${(hair>>8&255)},${hair&255},${.12+R()*.16})`; g.fillRect(x,y,1,1); } });
  t.magFilter=T.LinearFilter; const o={color:0xffffff,map:t}; const m=MAT_HQ?new T.MeshPhongMaterial(Object.assign(o,{shininess:5,specular:0x0a0a0a})):new T.MeshLambertMaterial(o); HST.face.set(key,m); return m; }
function hstFlat(g,w,h,d){ const n=g.index?g.toNonIndexed():g; n.computeVertexNormals(); n.parameters={width:w,height:h,depth:d}; return n; }
function hstTaper(key,w,h,d,prof,seg){ const k=key+w+'|'+h+'|'+d; if(HST.geo.has(k)) return HST.geo.get(k); seg=seg||8; const rings=prof.length-1;
  const g=new T.CylinderGeometry(.5,.5,1,seg,rings,false,Math.PI/seg); const kk=1/Math.cos(Math.PI/seg), p=g.attributes.position;
  for(let i=0;i<p.count;i++){ const y=p.getY(i), t=clamp(y+.5,0,1), j=Math.round(t*rings), pr=prof[j]; p.setXYZ(i,p.getX(i)*w*pr[0]*kk,y*h,p.getZ(i)*d*pr[1]*kk+(pr[2]||0)*d); }
  const out=hstFlat(g,w,h,d); HST.geo.set(k,out); return out; }
function hstHead(w,h,d){ const k='head'+w+h+d; if(HST.geo.has(k)) return HST.geo.get(k); const g=new T.BoxGeometry(w,h,d,4,4,4), p=g.attributes.position, hw=w/2, hh=h/2, hd=d/2;
  for(let i=0;i<p.count;i++){ let x=p.getX(i), y=p.getY(i), z=p.getZ(i); const u=x/hw, v=y/hh, q=z/hd; const len=Math.hypot(u,v*.9,q)||1; const f=.58; x=x*(1-f)+x/len*f*1.05; y=y*(1-f)+y/len*f*1.05; z=z*(1-f)+z/len*f*1.05;
    if(v<0){ x*=1-.26*(-v); if(q<0) z*=1-.3*(-v); } if(v>.3&&Math.abs(q)<.9) x*=1+.04*(v-.3); if(q>.95&&Math.abs(u)<.3&&v>-.45&&v<.15) z+=.018*(1-Math.abs(u)/.3); if(q>.95&&v>.2&&v<.45) z+=.006; if(q<-.5&&v>0) z*=1.04;
    p.setXYZ(i,x,y,z); }
  const out=hstFlat(g,w,h,d); HST.geo.set(k,out); return out; }
function hstBoot(w,h,d){ const k='boot'+w+h+d; if(HST.geo.has(k)) return HST.geo.get(k); const g=new T.BoxGeometry(w,h,d,2,1,3), p=g.attributes.position;
  for(let i=0;i<p.count;i++){ let x=p.getX(i), y=p.getY(i), z=p.getZ(i); const f=(z+d/2)/d; if(f>.6){ x*=1-(f-.6)*.45; if(y>0) y-=(f-.6)*h*.9; } if(y<0) x*=1.06; p.setXYZ(i,x,y,z); }
  const out=hstFlat(g,w,h,d); HST.geo.set(k,out); return out; }
function hstHelmet(){ if(HST.geo.has('helm')) return HST.geo.get('helm'); const pts=[[0,.165],[.06,.162],[.11,.145],[.145,.112],[.165,.068],[.172,.025],[.176,.0],[.19,-.02],[.196,-.03],[.188,-.034]].map(([x,y])=>new T.Vector2(x,y));
  const g=new T.LatheGeometry(pts,10); const out=hstFlat(g,.39,.2,.39); HST.geo.set('helm',out); return out; }
const HST_PROF={pelvis:[[.94,.92],[1,1],[1.0,.98]],abdomen:[[.97,.96],[.88,.92],[.98,1]],chest:[[.9,.94],[1.04,1.06],[1.07,1.02],[.84,.8]],neck:[[1,1],[.88,.9]],
  upperArm:[[.82,.84],[.98,1],[1.1,1.06]],forearm:[[.7,.72],[.95,.95],[1.02,1.0]],hand:[[.78,.66],[1,.9]],thigh:[[.84,.86],[1.06,1.08],[1.05,1.04]],shin:[[.86,.88],[1.02,1.04],[.94,.96]],bootShin:[[.98,1],[1.0,1.02],[1.1,1.1]]};
function styleHuman(h,look){ const P=h.parts, seed=((look.uniform*13+look.skin*7+look.hair)>>>0);
  const uni=hstCloth(look.uniform), pants=hstCloth(look.pants), boot=hstCloth(0x2a2420);
  const set=(name,geo,mat)=>{ const m=P[name]; if(!m) return; m.geometry=geo; if(mat) m.material=mat; };
  const gp=n=>P[n].geometry.parameters;
  for(const n of ['pelvis','abdomen','chest','neck']){ if(!P[n]) continue; const q=gp(n); set(n,hstTaper(n,q.width,q.height,q.depth,HST_PROF[n]),n==='neck'?null:(n==='pelvis'?pants:uni)); }
  for(const s of ['L','R']){ let q;
    q=gp('upperArm_'+s); set('upperArm_'+s,hstTaper('ua',q.width,q.height,q.depth,HST_PROF.upperArm),uni);
    q=gp('forearm_'+s); set('forearm_'+s,hstTaper('fa',q.width,q.height,q.depth,HST_PROF.forearm),uni);
    q=gp('hand_'+s); set('hand_'+s,hstTaper('hd',q.width,q.height,q.depth,HST_PROF.hand,6));
    q=gp('thigh_'+s); set('thigh_'+s,hstTaper('th',q.width,q.height,q.depth,HST_PROF.thigh),pants);
    q=gp('shin_'+s); set('shin_'+s,hstTaper(look.boots?'bs':'sh',q.width,q.height,q.depth,look.boots?HST_PROF.bootShin:HST_PROF.shin),look.boots?boot:pants);
    q=gp('foot_'+s); set('foot_'+s,hstBoot(q.width,q.height,q.depth),boot); }
  // cabeça: rosto pintado na face da frente
  { const hd=P.head, q=hd.geometry.parameters; for(const c of hd.children.slice()) hd.remove(c); hd.geometry=hstHead(q.width,q.height,q.depth); const sk=hd.material; hd.material=[sk,sk,sk,sk,hstFace(look.skin,look.hair,seed),sk];
    const earG=HST.geo.get('ear')||(HST.geo.set('ear',hstTaper('ear',.03,.06,.04,[[.7,.8],[1,1]],5)),HST.geo.get('ear')); for(const s of [-1,1]){ const e=new T.Mesh(earG,sk); e.position.set(s*q.width*.52,.0,-.01); e.rotation.z=s*.1; hd.add(e); } }
  if(P.hair){ const q=P.hair.geometry.parameters; const k='hair'; let g=HST.geo.get(k); if(!g){ const sg=new T.SphereGeometry(.5,8,4,0,Math.PI*2,0,Math.PI/2); sg.scale(.218,.09,.238); sg.translate(0,-.036,-.006); g=hstFlat(sg,q.width,q.height,q.depth); HST.geo.set(k,g); } P.hair.geometry=g; }
  // capacete
  if(h.helmet){ const cm=hstCamo(look.helmetColor||0x3d443a); const [shell,brim]=h.helmetMeshes; shell.geometry=hstHelmet(); shell.scale.set(.8,.92,.86); shell.material=cm; shell.position.set(0,.012,-.008); if(brim){ brim.visible=false; }
    const strapM=hstCloth(0x3a3426); for(const s of [-1,1]){ const st=new T.Mesh(BOX(.01,.15,.018),strapM); st.position.set(s*.098,-.11,.03); st.rotation.set(.12,0,s*.06); h.helmet.add(st); } const ch=new T.Mesh(BOX(.17,.012,.02),strapM); ch.position.set(0,-.182,.05); ch.rotation.x=-.3; h.helmet.add(ch); const bk=new T.Mesh(BOX(.022,.026,.01),hm(0x8a8270)); bk.position.set(.1,-.08,.045); h.helmet.add(bk); }
}

function removeShootables(list){ const s=new Set(list); W.shootables=W.shootables.filter(m=>!s.has(m)); }