'use strict';


/* =========================================================
   FLUXO DE TELAS
   ========================================================= */
/* =========================================================
   MENU 3D — porão da Rede Lampião (sala de operações animada)
   rádio, café, leitura de dossiê, cão dormindo; cena própria
   ========================================================= */
var MENU3D={on:false,built:false,t:0,parts:[],grade:[1.05,.98,.9,1.02,1.06]};
MENU3D.build=function(){
  if(this.built) return; this.built=true;
  const S=new T.Scene(); this.scene=S; S.background=new T.Color(0x07060a); S.fog=new T.Fog(0x0a0807,11,26);
  this.cam=new T.PerspectiveCamera(52,1,.05,60); this.cam.rotation.order='YXZ';
  const HQ=MAT_HQ, Lm=o=>HQ?new T.MeshPhongMaterial(Object.assign({shininess:6,specular:0x0c0c0c},o)):new T.MeshLambertMaterial(o);
  const add=(geo,mat,x,y,z,ry,par)=>{ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); if(ry) m.rotation.y=ry; (par||S).add(m); return m; };
  const box=(w,h,d,mat,x,y,z,ry,par)=>add(BOX(w,h,d),mat,x,y,z,ry,par);
  const cl=(t,rx,ry)=>{ const c=t.clone(); c.needsUpdate=true; c.wrapS=c.wrapT=T.RepeatWrapping; c.repeat.set(rx,ry); return c; };
  const R=mulberry32(1943);
  const plank=canvasTex(128,128,(g,w,h)=>{ g.fillStyle='#5a3e26'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=16){ const v=R()*30|0; g.fillStyle=`rgb(${80+v},${54+v*.7|0},${32+v*.4|0})`; g.fillRect(0,y+1,w,14); g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(0,y,w,1); for(let i=0;i<10;i++){ g.fillStyle='rgba(30,18,8,.18)'; g.fillRect(R()*w,y+2+R()*12,10+R()*30,1); } } });
  const mapT=canvasTex(512,384,(g,w,h)=>{ g.fillStyle='#d8c8a0'; g.fillRect(0,0,w,h); for(let i=0;i<500;i++){ g.fillStyle=`rgba(120,90,50,${R()*.08})`; g.fillRect(R()*w,R()*h,6+R()*30,2+R()*12); }
    g.fillStyle='#9ab4b4'; g.fillRect(0,0,w,h*.18); g.fillRect(0,h*.82,w,h*.18); g.fillStyle='#c8b888';
    g.beginPath(); g.moveTo(0,h*.2); for(let x=0;x<=w;x+=16) g.lineTo(x,h*(.18+.07*Math.sin(x*.03)+.03*R())); for(let x=w;x>=0;x-=16) g.lineTo(x,h*(.8-.06*Math.sin(x*.02+1)-.03*R())); g.closePath(); g.fill();
    g.strokeStyle='rgba(60,40,20,.25)'; g.lineWidth=1; for(let x=0;x<w;x+=48){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); } for(let y=0;y<h;y+=48){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
    g.strokeStyle='#4a6a8a'; g.lineWidth=2; g.beginPath(); g.moveTo(40,h*.5); for(let x=40;x<w;x+=20) g.lineTo(x,h*.5+Math.sin(x*.05)*24); g.stroke();
    g.strokeStyle='#a8241c'; g.lineWidth=3; g.setLineDash([10,6]); g.beginPath(); g.moveTo(90,280); g.lineTo(210,190); g.lineTo(330,230); g.lineTo(430,120); g.stroke(); g.setLineDash([]);
    for(const [x,y] of [[90,280],[210,190],[330,230],[430,120],[150,110],[380,300]]){ g.fillStyle='#b8241c'; g.beginPath(); g.arc(x,y,7,0,7); g.fill(); g.fillStyle='#2a1a10'; g.fillRect(x-1,y-1,2,2); }
    g.fillStyle='rgba(40,30,20,.7)'; for(let i=0;i<14;i++) g.fillRect(30+R()*440,40+R()*300,30+R()*40,3); });
  mapT.magFilter=T.LinearFilter;
  const paperT=canvasTex(64,96,(g,w,h)=>{ g.fillStyle='#e8dcc0'; g.fillRect(0,0,w,h); g.fillStyle='rgba(40,30,20,.6)'; for(let y=10;y<h-6;y+=6) g.fillRect(6,y,w-12-R()*16,2); g.fillStyle='#a8241c'; g.fillRect(36,6,22,6); });
  const posterT=canvasTex(128,180,(g,w,h)=>{ g.fillStyle='#1e2a24'; g.fillRect(0,0,w,h); g.strokeStyle='#d8a040'; g.lineWidth=4; g.strokeRect(8,8,w-16,h-16);
    g.fillStyle='#d8a040'; g.beginPath(); g.moveTo(64,40); g.lineTo(88,70); g.lineTo(80,110); g.lineTo(48,110); g.lineTo(40,70); g.closePath(); g.fill(); g.fillStyle='#fff2c0'; g.beginPath(); g.arc(64,82,12,0,7); g.fill(); g.fillStyle='#d8a040'; g.fillRect(56,26,16,10); g.fillRect(44,112,40,8);
    g.fillRect(24,136,80,6); g.fillRect(34,150,60,4); });
  const stoneW=Lm({map:cl(TEX.lime,6,1),color:0xa89878}), stoneV=Lm({map:cl(TEX.lime,7,3),color:0x9a8a6c,side:T.DoubleSide}), stoneB=Lm({map:cl(TEX.lime,3,1),color:0xa89878,side:T.DoubleSide});
  const floorM=Lm({map:cl(TEX.cobble,3,4),color:0xb0a080}), wood=Lm({map:plank,color:0xc0a080}), woodD=Lm({color:0x3a2616}), iron=Lm({color:0x1c1c1e}), brass=Lm({color:0xa8843a}), olive=Lm({color:0x3e4630});
  const RW=4.2, ZB=-9.5, ZF=6, LEN=ZF-ZB, ZC=(ZF+ZB)/2, WH=2.2, VS=.55;
  // chão, paredes e abóbada
  const fl=add(new T.PlaneGeometry(RW*2,LEN),floorM,0,0,ZC); fl.rotation.x=-Math.PI/2;
  for(const s of [-1,1]) box(.3,WH,LEN,stoneW,s*(RW+.15),WH/2,ZC);
  const vg=new T.CylinderGeometry(RW+.02,RW+.02,LEN,30,1,true,Math.PI/2,Math.PI); vg.rotateX(Math.PI/2); const vm=add(vg,stoneV,0,WH,ZC); vm.scale.y=VS;
  for(let z=ZB+1.4;z<ZF;z+=3.2){ const rg=new T.TorusGeometry(RW-.02,.13,5,24,Math.PI); const r=add(rg,stoneB,0,WH,z); r.scale.y=VS; }
  const cap=add(new T.CircleGeometry(RW+.05,30,0,Math.PI),stoneB,0,WH,ZB); cap.scale.y=VS; const capF=add(new T.CircleGeometry(RW+.05,30,0,Math.PI),stoneB,0,WH,ZF); capF.scale.y=VS; capF.rotation.y=Math.PI;
  const DX0=-1.1, DX1=.1, DH=2.05; box(DX0+RW,WH,.3,stoneW,(-RW+DX0)/2,WH/2,ZB-.15); box(RW-DX1,WH,.3,stoneW,(RW+DX1)/2,WH/2,ZB-.15); box(DX1-DX0,WH-DH,.3,stoneW,(DX0+DX1)/2,(WH+DH)/2,ZB-.15); box(RW*2,WH,.3,stoneW,0,WH/2,ZF+.15);
  box(DX1-DX0+.2,.12,.36,woodD,(DX0+DX1)/2,DH+.06,ZB-.1);
  // escada para a rua, com luar
  for(let i=0;i<9;i++) box(DX1-DX0,.2,.32,stoneW,(DX0+DX1)/2,.1+i*.2,ZB-.5-i*.3); box(DX1-DX0,3.6,.3,stoneW,(DX0+DX1)/2,3.2,ZB-3.4);
  for(const x of [DX0-.15,DX1+.15]) box(.3,4,3.2,stoneW,x,2,ZB-1.8);
  const moon=add(new T.PlaneGeometry(DX1-DX0,1.2),new T.MeshBasicMaterial({color:0x5a78b0}),(DX0+DX1)/2,2.5,ZB-3.24);
  const mL=new T.PointLight(0x6a88c8,1.1,7,1.6); mL.position.set((DX0+DX1)/2,2.2,ZB-2.4); S.add(mL);
  // vigas
  for(const x of [-1.5,1.5]) box(.22,.22,LEN,woodD,x,WH+VS*Math.sqrt(RW*RW-x*x)-.2,ZC);
  // luzes
  S.add(new T.HemisphereLight(0x8a7458,0x1a120c,.5));
  const bulbM=new T.MeshBasicMaterial({color:0xffe0a0}); this.bulbM=bulbM;
  const bulb=(x,z,i)=>{ const top=WH+VS*Math.sqrt(RW*RW-x*x)-.05; box(.01,top-3,.01,iron,x,(top+3)/2,z); add(new T.SphereGeometry(.06,10,8),bulbM,x,2.95,z); box(.06,.06,.06,brass,x,3.04,z); const l=new T.PointLight(0xffb468,i,11,1.5); l.position.set(x,2.85,z); S.add(l); return l; };
  this.bulbA=bulb(.4,-2.6,1.7); this.bulbB=bulb(.3,-7,1.0);
  // mesa de operações com o mapa
  const TX=2.0, TZ=-3.3, TL=2.8, TW=1.2; box(TW,.06,TL,wood,TX,.78,TZ); for(const sx of [-1,1]) for(const sz of [-1,1]) box(.07,.75,.07,woodD,TX+sx*(TW/2-.08),.375,TZ+sz*(TL/2-.1));
  const mp=add(new T.PlaneGeometry(1.05,1.45),Lm({map:mapT}),TX-.05,.815,TZ-.45); mp.rotation.set(-Math.PI/2,0,.06);
  for(const [x,z,r] of [[TX+.3,TZ+.75,.3],[TX+.36,TZ+.95,-.2],[TX-.3,TZ+.6,.1]]){ const p=add(new T.PlaneGeometry(.22,.32),Lm({map:paperT}),x,.816,z); p.rotation.set(-Math.PI/2,0,r); }
  add(new T.CylinderGeometry(.035,.04,.28,8),Lm({color:0x2a4a2a}),TX-.42,.95,TZ+1.1); add(new T.CylinderGeometry(.04,.035,.08,10),Lm({color:0xe8e0d0}),TX+.42,.85,TZ+.2);
  // abajur verde
  box(.12,.02,.12,brass,TX-.4,.82,TZ-1.25); box(.015,.32,.015,brass,TX-.4,.98,TZ-1.25); add(new T.ConeGeometry(.16,.13,12,1,true),Lm({color:0x2a5a3a,side:T.DoubleSide}),TX-.4,1.15,TZ-1.25);
  const tl=new T.PointLight(0xffd090,.9,4.5,1.8); tl.position.set(TX-.4,1.05,TZ-1.25); S.add(tl); add(new T.SphereGeometry(.035,8,6),bulbM,TX-.4,1.1,TZ-1.25);
  // cadeiras
  const chair=(x,z,yaw)=>{ const g=new T.Group(); g.position.set(x,0,z); g.rotation.y=yaw; S.add(g); box(.44,.04,.42,wood,0,.45,0,0,g); for(const sx of [-1,1]) for(const sz of [-1,1]) box(.04,.45,.04,woodD,sx*.19,.225,sz*.18,0,g); for(const sx of [-1,1]) box(.04,.55,.04,woodD,sx*.19,.72,-.19,0,g); box(.44,.14,.03,wood,0,.88,-.19,0,g); box(.44,.05,.03,wood,0,.66,-.19,0,g); return g; };
  chair(TX+.95,TZ+.4,-Math.PI/2); chair(TX-.95,TZ-.9,Math.PI/2+.3);
  // estação de rádio (parede direita)
  const DKX0=2.95, DKX1=4.1, DZ=-6.6; box(DKX1-DKX0,.05,1.5,wood,(DKX0+DKX1)/2,.76,DZ); for(const sx of [DKX0+.06,DKX1-.06]) for(const sz of [-.68,.68]) box(.05,.74,.05,woodD,sx,.37,DZ+sz);
  box(.42,.4,.62,olive,3.6,.98,DZ-.25); box(.02,.3,.5,Lm({color:0x23271c}),3.385,.99,DZ-.25);
  const dialM=new T.MeshBasicMaterial({color:0xffc870}); this.dialM=dialM; for(const z of [-.42,-.12]){ const d=add(new T.CircleGeometry(.055,14),dialM,3.372,1.05,DZ-.25+z+.03); d.rotation.y=-Math.PI/2; }
  for(const [z,y] of [[-.45,.88],[-.25,.88],[-.05,.88],[.02,1.08]]) { const k=add(new T.CylinderGeometry(.025,.025,.03,8),iron,3.37,y,DZ-.25+z); k.rotation.z=Math.PI/2; }
  box(.3,.22,.4,olive,3.65,1.29,DZ-.3); box(.12,.05,.08,brass,3.25,.8,DZ+.55); box(.07,.02,.02,iron,3.22,.83,DZ+.55);
  add(new T.PlaneGeometry(.2,.28),Lm({map:paperT}),3.2,.786,DZ+.2).rotation.set(-Math.PI/2,0,1.4);
  box(.01,1.9,.01,iron,3.75,2.4,DZ-.5); box(.01,.01,3,iron,3.75,3.35,DZ-1.5);
  chair(2.62,DZ+.1,Math.PI/2);
  const pst=add(new T.PlaneGeometry(.55,.78),Lm({map:posterT}),4.04,1.75,DZ+1.6); pst.rotation.y=-Math.PI/2;
  // canto do café (fundo, à esquerda da escada)
  const SX=3.8, SZ=-1.4; box(.55,.78,.62,iron,SX,.39,SZ); add(new T.CylinderGeometry(.07,.07,2.3,8),iron,SX+.12,1.9,SZ-.15);
  const fireM=new T.MeshBasicMaterial({color:0xff7a2a}); this.fireM=fireM; box(.02,.12,.3,fireM,SX-.28,.25,SZ);
  this.pot=add(new T.CylinderGeometry(.06,.085,.2,10),Lm({color:0x8a8a88,shininess:40}),SX-.08,.88,SZ+.12); add(new T.CylinderGeometry(.075,.075,.12,10),Lm({color:0x2a2a2a}),SX+.05,.84,SZ-.15);
  this.stoveL=new T.PointLight(0xff6a24,.7,3.2,1.6); this.stoveL.position.set(SX-.6,.35,SZ); S.add(this.stoveL);
  box(.26,.04,1.3,wood,4.0,1.5,SZ+.1); for(let i=0;i<4;i++) add(new T.CylinderGeometry(.04,.035,.08,8),Lm({color:0xe8e0d0}),4.0,1.56,SZ-.4+i*.22);
  for(let i=0;i<3;i++) add(new T.CylinderGeometry(.05,.05,.24,8),Lm({color:[0x6a2a1a,0x3a5a2a,0xa8843a][i]}),4.02,1.64,SZ+.45+i*.12);
  const wm=add(new T.PlaneGeometry(1.5,1.05),Lm({map:mapT}),1.6,1.55,ZB+.02);
  // fuzis encostados e caixotes
  for(let i=0;i<3;i++){ const r=box(.05,1.05,.1,woodD,DX0-.6-i*.18,.55,ZB+.12); r.rotation.x=-.12; r.rotation.z=(i-1)*.04; }
  const crate=Lm({map:cl(plank,1,1),color:0x9a8a64}); box(.7,.6,.6,crate,-3.5,.3,ZB+.6); box(.6,.5,.55,crate,-3.45,.85,ZB+.6,.2); box(.8,.6,.7,crate,3.6,.3,-8.6,.15); box(.6,.4,.5,crate,3.55,.8,-8.6,-.1);
  // barris (frente direita)
  const barM=Lm({color:0x6a4426}), hoop=Lm({color:0x2a2a28});
  for(const [x,y,z] of [[-3.55,.42,-.3],[-3.55,.42,.7],[-3.55,1.15,.2]]){ const b=add(new T.CylinderGeometry(.4,.4,.85,14),barM,x,y,z); b.rotation.x=Math.PI/2; for(const o of [-.32,.32]){ const h=add(new T.CylinderGeometry(.41,.41,.05,14),hoop,x,y,z+o); h.rotation.x=Math.PI/2; } }
  add(new T.CylinderGeometry(.38,.34,.9,14),barM,3.5,.45,1.2); add(new T.CylinderGeometry(.385,.385,.04,14),hoop,3.5,.7,1.2); box(.12,.2,.12,brass,3.5,1.0,1.2);
  // prateleira com garrafas (parede esquerda)
  for(let y=.5;y<2;y+=.5) box(.32,.04,2.4,wood,-4.0,y,-4.4); for(const z of [-5.6,-3.2]) box(.32,1.9,.04,woodD,-4.0,.95,z);
  for(let i=0;i<14;i++){ const y=.5+(i%3)*.5+.13, z=-5.45+(i*.37)%2.2; add(new T.CylinderGeometry(.035,.04,.22,6),Lm({color:R()<.5?0x1a3a1a:0x3a1a12}),-4.0,y,z); }
  // poeira suspensa
  const N=160, pg=new T.BufferGeometry(), pa=new Float32Array(N*3); for(let i=0;i<N;i++){ pa[i*3]=rnd(-3,3); pa[i*3+1]=rnd(.3,3.2); pa[i*3+2]=rnd(-8,3); } pg.setAttribute('position',new T.BufferAttribute(pa,3));
  this.dust=new T.Points(pg,new T.PointsMaterial({color:0xffd8a0,size:.018,transparent:true,opacity:.55,depthWrite:false})); S.add(this.dust);
  // fumaça e vapor
  const soft=canvasTex(64,64,(g)=>{ const gr=g.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,'rgba(255,255,255,.8)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); }); soft.magFilter=T.LinearFilter;
  this.puffs=[]; for(let i=0;i<36;i++){ const sp=new T.Sprite(new T.SpriteMaterial({map:soft,transparent:true,depthWrite:false,opacity:0})); sp.visible=false; S.add(sp); this.puffs.push({sp,life:0,max:1,v:V3()}); }
  // personagens
  const hp=(h,o)=>{ for(const k of ['headphones']) if(o[k]){ const hd=h.g.head; const b=box(.25,.03,.04,iron,0,.27,0,0,hd); for(const s of [-1,1]){ const c=add(new T.CylinderGeometry(.05,.05,.04,10),iron,s*.12,.12,0,0,hd); c.rotation.z=Math.PI/2; } } };
  const mk=(look,x,z,yaw,extra)=>{ const h=makeHuman(look,null); h.root.position.set(x,0,z); h.root.rotation.y=yaw; S.add(h.root); h.base={x,z,yaw}; if(extra) hp(h,extra); return h; };
  this.radio=mk({uniform:0x8a7a5a,pants:0x3a3630,skin:0xd8a880,hair:0x2a1c12,boots:true},2.62,DZ+.1,Math.PI/2,{headphones:true});
  this.coffee=mk({uniform:0x2c2c34,pants:0x3a3028,skin:0xc08a62,hair:0x161010,boots:true,cap:'beret',capColor:0x7a1e22},TX-.95,TZ+.4,Math.PI/2);
  this.reader=mk({uniform:0x4a3828,pants:0x2e2e32,skin:0xd8aa88,hair:0x6a6a66,boots:true},TX+.95,TZ+.4,-Math.PI/2);
  const cupM=Lm({color:0xe8e0d0}); this.cup=box(.07,.08,.07,cupM,0,-.1,.04,0,this.coffee.g.wrR); this.cup.visible=false;
  this.paper=add(new T.PlaneGeometry(.24,.32),Lm({map:paperT,side:T.DoubleSide}),0,0,0); this.paper.rotation.order='YXZ'; this.cig=box(.012,.012,.07,Lm({color:0xf0ece0}),0,-.1,.05,0,this.reader.g.wrL);
  // cão dormindo
  const dg=new T.Group(); dg.position.set(.55,0,-2.0); dg.rotation.y=1.3; dg.scale.setScalar(.85); S.add(dg); const fur=hm(0x6a4a2a), dark=hm(0x2a1a10);
  box(.42,.3,.95,fur,0,.17,0,0,dg); const dh=new T.Group(); dh.position.set(0,.22,.52); dg.add(dh); box(.3,.26,.34,fur,0,0,.05,0,dh); box(.17,.13,.2,dark,0,-.04,.3,0,dh); for(const s of [-1,1]) box(.07,.12,.05,dark,s*.12,.14,0,0,dh);
  for(const [x,z] of [[-.17,.4],[.17,.4]]) box(.1,.08,.36,fur,x,.04,z+.15,0,dg); for(const s of [-1,1]) box(.12,.1,.4,fur,s*.2,.06,-.3,0,dg);
  const tail=new T.Group(); tail.position.set(0,.22,-.48); dg.add(tail); box(.06,.06,.36,fur,0,0,-.17,0,tail); this.dog={g:dg,head:dh,tail};
  this.layout={TX,TZ,DZ,SX,SZ};
  const fillL=new T.PointLight(0xffc890,.75,9,1.4); fillL.position.set(.6,2.7,.6); S.add(fillL);
  this.bulbA.position.set(TX-.2,2.85,TZ+.3);
};
MENU3D.puff=function(p,col,size,life,vy){ const f=this.puffs.find(q=>q.life<=0); if(!f) return; f.life=f.max=life; f.sp.position.copy(p); f.v.set(rnd(-.05,.05),vy,rnd(-.05,.05)); f.size=size; f.sp.material.color.setHex(col); f.sp.visible=true; };
function m3Reset(h){ const g=h.g; for(const k in g){ const o=g[k]; if(o.isObject3D&&k!=='weapon') o.rotation.set(0,0,0); } g.pelvis.position.set(0,.95,0); }
function m3Sit(h){ const g=h.g; g.pelvis.position.set(0,.53,-.04); for(const s of ['L','R']){ g['hip'+s].rotation.x=-1.52; g['kn'+s].rotation.x=1.5; } }
function m3Walk(h,ph,amp){ const g=h.g, s=Math.sin(ph); g.hipL.rotation.x=s*.55*amp; g.hipR.rotation.x=-s*.55*amp; g.knL.rotation.x=Math.max(0,Math.sin(ph-1.2))*.9*amp; g.knR.rotation.x=Math.max(0,-Math.sin(ph-1.2))*.9*amp; g.shL.rotation.x=-s*.4*amp; g.shR.rotation.x=s*.4*amp; g.elL.rotation.x=-.25*amp; g.elR.rotation.x=-.25*amp; g.pelvis.position.y=.95+Math.abs(Math.cos(ph))*.03*amp; g.spine.rotation.y=s*.08*amp; }
const _m3v=new T.Vector3();
function m3Reach(h,side,wx,wy,wz,pole){ const g=h.g; h.root.updateMatrixWorld(true); _m3v.set(wx,wy,wz); g.chest.worldToLocal(_m3v); const p=pole||[side==='L'?1:-1,-.6,-.4]; ikArm(g['sh'+side],g['el'+side],g['wr'+side],_m3v.x,_m3v.y,_m3v.z,p[0],p[1],p[2]); }
MENU3D.update=function(dt){
  this.build(); const t=(this.t+=dt), Lt=this.layout, cam=this.cam;
  cam.aspect=camera.aspect; cam.fov=camera.aspect<1?70:52; cam.updateProjectionMatrix();
  const narrow=camera.aspect<1.25; cam.position.set((narrow?.3:-1.0)+Math.sin(t*.09)*.18,(narrow?2.0:1.7)+Math.sin(t*.14)*.04,(narrow?4.6:4.0)+Math.sin(t*.07)*.12);
  _m3v.set((narrow?1.9:.15)+Math.sin(t*.06)*.2,narrow?-.2:1.0,-4.3); cam.lookAt(_m3v);
  // luzes
  if(this.flick>0) this.flick-=dt; else if(Math.random()<dt*.18) this.flick=.08+Math.random()*.25;
  const fk=this.flick>0?(Math.random()<.5?.25:.8):1; this.bulbA.intensity=1.7*fk*(1+Math.sin(t*7.3)*.02); this.bulbM.color.setScalar(.6+.4*fk).multiply(_m3c.setHex(0xffe0a0));
  this.stoveL.intensity=.6+Math.sin(t*9)*.08+Math.random()*.12; this.fireM.color.setRGB(1,.42+Math.random()*.12,.14);
  this.dialM.color.setRGB(1,.75+Math.sin(t*3)*.05,.4);
  // poeira
  const pa=this.dust.geometry.attributes.position.array; for(let i=0;i<pa.length;i+=3){ pa[i+1]+=Math.sin(t*.3+i)*dt*.02-dt*.006; pa[i]+=Math.cos(t*.2+i*.7)*dt*.015; if(pa[i+1]<.2) pa[i+1]=3.2; } this.dust.geometry.attributes.position.needsUpdate=true;
  // radioperador
  { const h=this.radio, g=h.g; m3Reset(h); m3Sit(h); g.spine.rotation.x=.22; const cyc=t%16; const lis=cyc>11&&cyc<14;
    g.head.rotation.set(.18+Math.sin(t*.7)*.04,lis?-.25:Math.sin(t*.4)*.08,lis?.22:0);
    const tap=(t%7)<2.6; const tk=tap?(Math.sin(t*38)>.2?.0:.025)+(Math.sin(t*6.1)>.6?.02:0):.04;
    if(tap&&!this.tapOn&&Math.floor(t/7)%2===0&&APP.state==='MENU'&&AudioSys.ctx) AudioSys.play('morse',null,.25); this.tapOn=tap;
    m3Reach(h,'R',3.25,.86+tk,Lt.DZ+.55,[-1,-.5,-.6]);
    if(lis) m3Reach(h,'L',2.72,1.68,Lt.DZ+.28,[1,-.4,-.2]); else m3Reach(h,'L',3.34,1.04+Math.sin(t*.8)*.01,Lt.DZ-.34+Math.sin(t*.5)*.02,[1,-.6,-.4]);
    g.wrL.rotation.y=Math.sin(t*1.3)*.4; }
  // leitor do dossiê
  { const h=this.reader, g=h.g; m3Reset(h); m3Sit(h); g.spine.rotation.x=.3; const cyc=t%13; const flip=cyc>9&&cyc<10.4; const look=cyc>4&&cyc<6.5;
    g.head.rotation.set(look?-.05:.42,look?-.35:0,0);
    const base=h.root.localToWorld(_m3c2.set(0,.86,.48)); this.paper.position.set(base.x,base.y+.05,base.z); this.paper.rotation.set(-1.05,h.root.rotation.y,0);
    const fp=flip?Math.sin((cyc-9)/1.4*Math.PI):0; const pr=h.root.localToWorld(_m3c2.set(-.12+fp*.18,.86+fp*.1,.5)); m3Reach(h,'R',pr.x,pr.y,pr.z);
    const smoke=cyc>1&&cyc<3.2; const pl=h.root.localToWorld(_m3c2.set(.16,smoke?1.52:.86,smoke?.18:.42)); m3Reach(h,'L',pl.x,pl.y,pl.z,[1,-.5,smoke?-.9:-.4]);
    if(Math.random()<dt*3){ this.cig.getWorldPosition(_m3c2); this.puff(_m3c2,0xb0aca8,.12,2.6,.12); } }
  // café: mesa -> fogão -> mesa
  { const h=this.coffee, g=h.g; m3Reset(h); const C=26, c=t%C, A=V3(Lt.TX-.95,0,Lt.TZ+.4), Wp=V3(Lt.TX-.55,0,Lt.TZ+1.95), B=V3(Lt.SX-.68,0,Lt.SZ); let pos=A, yaw=Math.PI/2;
    const walkTo=(p0,p1,k)=>{ const a=p0.distanceTo(Wp), b=Wp.distanceTo(p1), d=k*(a+b); let q0=p0,q1=Wp,kk=d/a; if(d>a){ q0=Wp; q1=p1; kk=(d-a)/b; } pos=q0.clone().lerp(q1,kk); yaw=Math.atan2(q1.x-q0.x,q1.z-q0.z); m3Walk(h,t*7.2,1); };
    if(c<6){ g.spine.rotation.x=.35; g.head.rotation.x=.3; const pt=c>2&&c<4.5; const tp=h.root.localToWorld(_m3c2.set(-.12,pt?.86:.84,pt?.62:.45)); m3Reach(h,'R',tp.x,tp.y,tp.z); const tl=h.root.localToWorld(_m3c2.set(.22,.84,.45)); m3Reach(h,'L',tl.x,tl.y,tl.z); this.cup.visible=false; }
    else if(c<10.5) walkTo(A,B,(c-6)/4.5);
    else if(c<14.5){ pos=B; yaw=Math.PI/2; const k=c-10.5; g.spine.rotation.x=.12; g.head.rotation.x=.35; const pour=k>1&&k<3; this.cup.visible=k>.6;
      const tr=h.root.localToWorld(_m3c2.set(-.05,1.0,.42)); m3Reach(h,'L',tr.x,tr.y,tr.z); const tp=h.root.localToWorld(_m3c2.set(.08,pour?1.06:.92,.5)); m3Reach(h,'R',tp.x,tp.y,tp.z); if(pour){ g.wrR.rotation.z=-.9; this.pot.position.set(tp.x,tp.y-.06,tp.z); this.pot.rotation.z=.7; } else { this.pot.position.set(Lt.SX-.08,.88,Lt.SZ+.12); this.pot.rotation.z=0; }
      if(pour&&Math.random()<dt*14){ this.cup.getWorldPosition(_m3c2); this.puff(_m3c2.setY(_m3c2.y+.08),0xe8e4e0,.08,1.4,.25); } }
    else if(c<19){ walkTo(B,A,(c-14.5)/4.5); const tp=h.root.localToWorld(_m3c2.set(-.08,1.08,.36)); m3Reach(h,'R',tp.x,tp.y,tp.z); }
    else { pos=A; yaw=Math.PI/2+.25; const k=(c-19)%3.5, sip=k>1.4&&k<2.4; g.head.rotation.x=sip?-.2:.1; const tp=h.root.localToWorld(_m3c2.set(-.04,sip?1.5:1.1,sip?.14:.32)); m3Reach(h,'R',tp.x,tp.y,tp.z,[-1,-.3,-.8]); g.spine.rotation.x=.05; }
    if(this.cup.visible&&c>10.5&&Math.random()<dt*2.5){ this.cup.getWorldPosition(_m3c2); this.puff(_m3c2.setY(_m3c2.y+.06),0xe8e4e0,.05,1.2,.18); }
    if(c<10.5||c>=14.5){ this.pot.position.set(Lt.SX-.08,.88,Lt.SZ+.12); this.pot.rotation.z=0; }
    h.root.position.set(pos.x,0,pos.z); let dy=yaw-h.root.rotation.y; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); h.root.rotation.y+=dy*Math.min(1,dt*8);
    // cão acompanha quem passa
    const d=this.dog, dx=pos.x-d.g.position.x, dz=pos.z-d.g.position.z, near=dx*dx+dz*dz<9; d.head.rotation.x=near?-.35:.12+Math.sin(t*.3)*.03; d.head.rotation.y=near?clamp(Math.atan2(dx,dz)-d.g.rotation.y,-.9,.9):0; d.tail.rotation.y=Math.sin(t*(near?14:3))*(near?.7:.15); d.g.children[0].scale.y=1+Math.sin(t*1.6)*.03; }
  // fumaça
  for(const f of this.puffs){ if(f.life<=0) continue; f.life-=dt; const k=1-f.life/f.max; f.sp.position.addScaledVector(f.v,dt); f.sp.scale.setScalar(f.size*(1+k*3)); f.sp.material.opacity=Math.sin(k*Math.PI)*.35; if(f.life<=0) f.sp.visible=false; }
  if(Math.random()<dt*1.5) this.puff(V3(this.layout.SX-.08,1.02,this.layout.SZ+.12),0xd8d4d0,.06,1.6,.2);
};
const _m3c=new T.Color(), _m3c2=new T.Vector3();

function goMenu(){
  APP.state='MENU'; releaseLock(); AudioSys.ambient(null); UI.closeAll(); $('#hud').hidden=true; $('#touch').hidden=true; applyCheatsVisual();
  if(!G||G.ending) newMission(G&&G.ending?G.levelId:'01',settings.difficulty);
  const cp=store.get('sdp_checkpoint');
  $('#bContinue').hidden=!cp;
  if(cp){ const L=LEVELS[cp.mission||'01']; const cur=L.objectives().find(o=>!o.optional&&cp.obj&&cp.obj[o.id]==='active'); let t=cur?cur.text.split(' (')[0]:''; if(t.length>44) t=t.slice(0,42)+'…'; $('#contInfo').textContent=L.op+(t?' · '+t:'')+' · '+DIFF[cp.diff].label; }
  const camp=store.get('sdp_campaign'); const n=camp&&camp.done?Object.keys(camp.done).length:0;
  $('#recordLine').textContent=n?`Operações concluídas: ${n} de ${LEVEL_ORDER.length}.`:'';
  UI.show('menu');
}
function updateTouchButtons(){
  if(!APP.touch||!G||G._tbFor===G.levelId+'|'+!!G.ally+'|'+!!G.disguise) return; G._tbFor=G.levelId+'|'+!!G.ally+'|'+!!G.disguise; const L=G.level, P=G.player;
  const show={cam:!!(L.loadout&&L.loadout.camera),lamp:(L.baseLight||1)<.55,stone:true,nade:!!L.grenades,holster:!!G.disguise,map:true,ally:!!G.ally,journal:true,pause:true};
  for(const b of document.querySelectorAll('.tsmall button')){ const k=b.dataset.t; b.hidden=show[k]===false; }
}