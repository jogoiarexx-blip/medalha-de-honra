'use strict';



/* =========================================================
   OPERAÇÃO 5 — Hôtel des Orangers, Túnis (abril de 1943)
   ========================================================= */
const YT=3.6, YB=6.0, YC=4.8;
function tex05(){
  if(TEX.lime5) return;
  const plaster=(seed,base,tint)=>canvasTex(256,256,(g,w,h)=>{ const R=mulberry32(seed); g.fillStyle=base; g.fillRect(0,0,w,h);
    for(let i=0;i<2600;i++){ const a=R()*.06; g.fillStyle=R()<.5?`rgba(${tint},${a})`:`rgba(255,255,255,${a*1.4})`; g.fillRect(R()*w,R()*h,1+R()*5,1+R()*4); }
    for(let i=0;i<9;i++){ g.strokeStyle=`rgba(${tint},.2)`; g.lineWidth=1; g.beginPath(); let x=R()*w,y=R()*h; g.moveTo(x,y); for(let k=0;k<6;k++){ x+=R()*16-8; y+=R()*14; g.lineTo(x,y); } g.stroke(); }
    for(let i=0;i<7;i++){ const x=R()*w, gr=g.createLinearGradient(0,h*.55,0,h); gr.addColorStop(0,`rgba(${tint},0)`); gr.addColorStop(1,`rgba(${tint},.13)`); g.fillStyle=gr; g.fillRect(x,h*.55,6+R()*16,h*.45); } },3);
  TEX.lime5=plaster(501,'#ece6d9','120,100,70'); TEX.ochre5=plaster(502,'#d6b78e','110,80,50'); TEX.pink5=plaster(504,'#dcc0aa','120,80,60');
  TEX.zellige=canvasTex(128,128,(g,w,h)=>{ const cols=['#1f5d8e','#2d7a58','#ece4d0','#c9952c','#ece4d0','#1f5d8e'];
    for(let y=0;y<h;y+=16) for(let x=0;x<w;x+=16){ g.fillStyle=cols[((x/16)+(y/16)*3)%cols.length]; g.fillRect(x,y,16,16); }
    g.fillStyle='#ece4d0'; for(let y=0;y<h;y+=32) for(let x=0;x<w;x+=32){ g.save(); g.translate(x+16,y+16); g.fillRect(-7,-7,14,14); g.rotate(Math.PI/4); g.fillRect(-7,-7,14,14); g.restore(); }
    g.fillStyle='#1f5d8e'; for(let y=0;y<h;y+=32) for(let x=0;x<w;x+=32){ g.beginPath(); g.arc(x+16,y+16,3.4,0,7); g.fill(); }
    g.fillStyle='#c9952c'; for(let y=0;y<h;y+=32) for(let x=0;x<w;x+=32){ g.fillRect(x-2,y-2,4,4); }
    g.strokeStyle='rgba(70,60,50,.5)'; for(let i=0;i<=w;i+=16){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,h); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(w,i); g.stroke(); } },1);
  TEX.terra5=canvasTex(128,128,(g,w,h)=>{ const R=mulberry32(505); for(let y=0;y<h;y+=32) for(let x=0;x<w;x+=32){ const k=R()*.18; g.fillStyle=`rgb(${(180-k*120)|0},${(100-k*60)|0},${(62-k*40)|0})`; g.fillRect(x,y,32,32); for(let i=0;i<30;i++){ g.fillStyle=`rgba(0,0,0,${R()*.08})`; g.fillRect(x+R()*30,y+R()*30,2,2); } } g.strokeStyle='#d8c8a8'; g.lineWidth=2; for(let i=0;i<=w;i+=32){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,h); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(w,i); g.stroke(); } },1.2);
  TEX.dust5=canvasTex(256,256,(g,w,h)=>{ const R=mulberry32(506); g.fillStyle='#c8b08a'; g.fillRect(0,0,w,h); for(let i=0;i<4000;i++){ g.fillStyle=R()<.5?`rgba(90,70,45,${R()*.12})`:`rgba(255,240,210,${R()*.1})`; g.fillRect(R()*w,R()*h,1+R()*3,1+R()*2); } for(let i=0;i<40;i++){ g.fillStyle='rgba(120,100,80,.25)'; g.beginPath(); g.arc(R()*w,R()*h,2+R()*6,0,7); g.fill(); } },4);
  TEX.cobble5=canvasTex(256,256,(g,w,h)=>{ const R=mulberry32(507); g.fillStyle='#8a7c66'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=18) for(let x=(y/18%2)*12;x<w;x+=24){ const k=R()*.25; g.fillStyle=`rgb(${(196-k*90)|0},${(178-k*80)|0},${(146-k*70)|0})`; g.beginPath(); g.ellipse(x+12,y+9,10.5,7.5,0,0,7); g.fill(); } },3);
  TEX.fac5=canvasTex(512,512,(g,w,h)=>{ const R=mulberry32(508); g.fillStyle='#ebe4d4'; g.fillRect(0,0,w,h);
    for(let i=0;i<5000;i++){ g.fillStyle=R()<.5?`rgba(110,90,60,${R()*.06})`:`rgba(255,255,255,${R()*.08})`; g.fillRect(R()*w,R()*h,1+R()*5,1+R()*4); }
    for(let r=0;r<3;r++) for(let c=0;c<4;c++){ const x=24+c*124+R()*16, y=36+r*168; if(R()<.18) continue; g.fillStyle='#1d2a33'; g.fillRect(x,y,46,70); g.fillStyle=R()<.6?'#2c6aa0':'#3b7a6a'; g.fillRect(x-14,y,14,70); g.fillRect(x+46,y,14,70); g.strokeStyle='rgba(20,20,20,.7)'; g.lineWidth=2; for(let k=0;k<5;k++){ g.beginPath(); g.moveTo(x+4+k*9.5,y); g.lineTo(x+4+k*9.5,y+70); g.stroke(); } g.fillStyle='rgba(90,70,50,.25)'; g.fillRect(x-16,y+72,78,6); }
    g.fillStyle='rgba(120,100,70,.18)'; g.fillRect(0,0,w,10); },8);
  TEX.arch5=canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#ece6d9'; g.fillRect(0,0,w,h); const dado=h*.66;
    const z=TEX.zellige.image; for(let x=0;x<w;x+=36) for(let y=dado;y<h;y+=36) g.drawImage(z,0,0,128,128,x,y,36,36);
    g.fillStyle='#8a6a3a'; g.fillRect(0,dado-5,w,6);
    g.fillStyle='#d9cfbd'; g.beginPath(); g.moveTo(70,dado-6); g.lineTo(70,92); g.arc(128,92,58,Math.PI*1.08,Math.PI*1.92+Math.PI*0); g.lineTo(186,dado-6); g.closePath(); g.fill();
    g.strokeStyle='#b08a50'; g.lineWidth=5; g.beginPath(); g.moveTo(66,dado-6); g.lineTo(66,92); g.arc(128,92,62,Math.PI*1.08,Math.PI*1.92); g.lineTo(190,dado-6); g.stroke();
    g.fillStyle='#2a5f98'; g.fillRect(96,104,64,dado-110); g.fillStyle='rgba(0,0,0,.25)'; for(let k=0;k<4;k++) g.fillRect(100,112+k*24,56,2); },3.6);
  TEX.door5=textTex(64,128,(g,w,h)=>{ g.fillStyle='#2b5e9c'; g.fillRect(0,0,w,h); g.strokeStyle='#1c3e68'; g.lineWidth=3; g.strokeRect(5,5,w-10,h-10); g.fillStyle='#d8c890'; for(let y=14;y<h-8;y+=14) for(let x=12;x<w-8;x+=13){ g.beginPath(); g.arc(x,y,1.6,0,7); g.fill(); } g.beginPath(); g.arc(w-14,h/2,3,0,7); g.fill(); });
  TEX.shutter5=canvasTex(128,128,(g,w,h)=>{ g.fillStyle='#3b6f8e'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=8){ g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(0,y+6,w,2); g.fillStyle='rgba(255,255,255,.08)'; g.fillRect(0,y,w,2); } },2.4);
  TEX.awn5=canvasTex(128,64,(g,w,h)=>{ for(let x=0;x<w;x+=16){ g.fillStyle=(x/16)%2?'#e8dcc0':'#a8402e'; g.fillRect(x,0,16,h); } g.fillStyle='rgba(0,0,0,.12)'; g.fillRect(0,h-6,w,6); },2);
  TEX.rug5=textTex(128,192,(g,w,h)=>{ g.fillStyle='#8a2a22'; g.fillRect(0,0,w,h); g.strokeStyle='#e0c890'; g.lineWidth=4; g.strokeRect(8,8,w-16,h-16); for(let y=28;y<h-20;y+=34){ g.fillStyle=(y/34|0)%2?'#1e3a5a':'#d8b060'; g.beginPath(); g.moveTo(w/2,y); g.lineTo(w/2+26,y+16); g.lineTo(w/2,y+32); g.lineTo(w/2-26,y+16); g.closePath(); g.fill(); } g.fillStyle='#1e3a5a'; g.fillRect(16,16,w-32,6); g.fillRect(16,h-22,w-32,6); });
}
function mats05(){
  tex05(); const HQ=MAT_HQ;
  const L=(o,ex)=>{ if(!HQ) return new T.MeshLambertMaterial(o); const p=Object.assign({shininess:6,specular:0x0d0d0d},o,ex||{}); if(p.map&&p.bump!==false){ p.bumpMap=p.map; p.bumpScale=p.bumpScale||.03; } delete p.bump; return new T.MeshPhongMaterial(p); };
  return {
    lime:L({map:TEX.lime5}), limeW:L({map:TEX.lime5,color:0xf2eee6}), ochre:L({map:TEX.ochre5}), pink:L({map:TEX.pink5}),
    fac:L({map:TEX.fac5}), facO:L({map:TEX.fac5,color:0xe2c8a2}), facP:L({map:TEX.fac5,color:0xe6d0c0}),
    zel:L({map:TEX.zellige},{shininess:40,specular:0x333333,bumpScale:.01}), terra:L({map:TEX.terra5},{bumpScale:.02}), dust:L({map:TEX.dust5}), cobble:L({map:TEX.cobble5},{bumpScale:.05}),
    arch:L({map:TEX.arch5}), door:L({map:TEX.door5,bump:false}), shutter:L({map:TEX.shutter5}), awn:new T.MeshLambertMaterial({map:TEX.awn5,side:T.DoubleSide}),
    rug:L({map:TEX.rug5,bump:false}), wood:L({map:TEX.wood,color:0x7a5534}), dark:MAT.darkWood, brass:MAT.brass, water:MAT.water,
    leaf:L({color:0x3e6a34}), palm:L({color:0x4a6a2e}), trunk:L({color:0x7a6248}), orange:L({color:0xe08a20}), clay:L({color:0xb0623a}), sheet:new T.MeshLambertMaterial({color:0xf2efe6,side:T.DoubleSide}), sheetB:new T.MeshLambertMaterial({color:0x8fb6d8,side:T.DoubleSide}),
    reed:L({color:0xb89a62}), copper:L({color:0xb06a3a},{specular:0x775533,shininess:60}), bed:L({color:0xe8e2d4}), cushion:L({color:0x9a3a2a}), green:L({color:0x2f5a3a}), steel:L({color:0x4a4e52},{specular:0x666666,shininess:50}),
  };
}
let M5=null;
function stairSteps(axis,edge,sgn,a0,a1,topHigh,n,mat,side){
  // axis 'x': degraus avançam em x a partir de 'edge'; a0..a1 é a faixa em z (e vice-versa)
  const d=.36, rise=.2, list=[];
  for(let k=0;k<n;k++){ const top=topHigh-rise*k, p0=edge+sgn*d*k, p1=edge+sgn*d*(k+1), lo=Math.min(p0,p1), hi=Math.max(p0,p1);
    const s=axis==='x'?addWalk(lo,hi,a0,a1,top,{mat:side||M5.lime,top:mat,seg:1}):addWalk(a0,a1,lo,hi,top,{mat:side||M5.lime,top:mat,seg:1}); list.push(s); }
  return list;
}
function stairParapet(axis,edge,sgn,c0,c1,topHigh,n,mat,hRail=.9){
  // muro escalonado de um lado da escada (c0..c1 = faixa transversal fina)
  const d=.36, rise=.2;
  for(let k=0;k<n;k++){ const top=topHigh-rise*k, p0=edge+sgn*d*k, p1=edge+sgn*d*(k+1), lo=Math.min(p0,p1), hi=Math.max(p0,p1);
    if(axis==='x') addBlock(lo,hi,c0,c1,top+hRail,{mat,surf:'stone',seg:1}); else addBlock(c0,c1,lo,hi,top+hRail,{mat,surf:'stone',seg:1}); }
}
function wallT(x0,x1,z0,z1,mat,y0=YT,y1=7.0,o={}){ return addBlock(x0,x1,z0,z1,y1-y0,Object.assign({y0,mat:mat||M5.lime,surf:'stone',seg:1.5,top:mat||M5.lime},o)); }
function doorT(id,x,z,alongX,o={}){ // porta no terraço (alongX: a porta fica em parede que corre em x)
  const w=o.w||1.1, h=2.3;
  return makeDoor(id,{x,z,y0:o.y0!=null?o.y0:YT,w:alongX?w:.1,d:alongX?.1:w,h,mat:o.mat||M5.door,offset:alongX?V3(w*.95,0,0):V3(0,0,w*.95),locked:!!o.locked,npc:o.npc!==false,nav:true,label:o.label});
}
function bedT(x,z,rot,y=YT){ const g=new T.Group(); g.position.set(x,y,z); g.rotation.y=rot||0; const add=(w,h,d,px,py,pz,m)=>{ const o=new T.Mesh(BOX(w,h,d),m); o.position.set(px,py,pz); g.add(o); o.userData.mat='cloth'; W.shootables.push(o); };
  add(1.5,.42,2.1,0,.21,0,M5.dark); add(1.42,.16,2.0,0,.5,0,M5.bed); add(1.2,.14,.42,0,.62,-.75,M5.cushion); add(1.5,.9,.08,0,.45,-1.05,M5.dark); scene.add(g); const c=Math.abs(Math.sin(rot||0))>.5; addSolidOnly(x-(c?1.05:.75),x+(c?1.05:.75),z-(c?.75:1.05),z+(c?.75:1.05),.6,y,true); }
function tableT(x,z,y=YT,r=.45){ addMesh(new T.CylinderGeometry(r,r,.04,14),M5.wood,x,y+.72,z,'wood'); addMesh(new T.CylinderGeometry(.05,.07,.7,8),M5.dark,x,y+.36,z,'wood'); addSolidOnly(x-r*.7,x+r*.7,z-r*.7,z+r*.7,.74,y); }
function chairT(x,z,ry,y=YT){ const c=chair(x,z,ry,M5.dark); c.position.y=y; }
function wardrobeT(x0,x1,z0,z1,y=YT){ return addBlock(x0,x1,z0,z1,2.1,{y0:y,mat:M5.dark,surf:'wood',seg:1,cover:true}); }
function potPlant(x,z,y=0,big){ const r=big?.45:.3; addMesh(new T.CylinderGeometry(r,r*.75,r*1.5,10),M5.clay,x,y+r*.75,z,'stone'); const c=new T.Mesh(new T.SphereGeometry(r*1.5,8,6),M5.leaf); c.position.set(x,y+r*1.5+r*1.1,z); c.scale.y=.8; scene.add(c); addSolidOnly(x-r,x+r,z-r,z+r,r*1.5+.6,y,true); }
function orangeTree(x,z){ addMesh(new T.CylinderGeometry(.55,.42,.75,12),M5.clay,x,.37,z,'stone'); addMesh(new T.CylinderGeometry(.07,.1,1.6,7),M5.trunk,x,1.4,z,'wood'); const c=new T.Mesh(new T.SphereGeometry(1.15,10,8),M5.leaf); c.position.set(x,2.55,z); scene.add(c); addSolidOnly(x-.5,x+.5,z-.5,z+.5,.75,0,true);
  const R=mulberry32((x*31+z*17)|0), list=[]; for(let i=0;i<16;i++){ const a=R()*6.28, b=R()*1.4-.4; list.push([x+Math.cos(a)*1.05*Math.cos(b),2.55+Math.sin(b)*.95,z+Math.sin(a)*1.05*Math.cos(b),.09,.09,.09,0]); } instanced(new T.SphereGeometry(1,6,4),M5.orange,list); }
function palm(x,z,h=7){ const tr=addMesh(new T.CylinderGeometry(.16,.24,h,8),M5.trunk,x,h/2,z,'wood'); addSolidOnly(x-.24,x+.24,z-.24,z+.24,h);
  for(let i=0;i<9;i++){ const a=i/9*6.28; const f=new T.Mesh(BOX(.36,.03,2.4),M5.palm); f.position.set(x+Math.sin(a)*1.0,h-.1,z+Math.cos(a)*1.0); f.rotation.set(.5,a,0,'YXZ'); f.rotation.order='YXZ'; f.rotation.y=a; f.rotation.x=.45; scene.add(f); } }
function awning(x0,x1,z,y,depth,facing){ const g=new T.PlaneGeometry(x1-x0,depth); const m=new T.Mesh(g,M5.awn); m.position.set((x0+x1)/2,y-.25,z+facing*depth/2); m.rotation.x=-Math.PI/2+facing*.42; scene.add(m); return m; }
function stall(x,z,rot){ const g=new T.Group(); g.position.set(x,0,z); g.rotation.y=rot; scene.add(g);
  const add=(w,h,d,px,py,pz,m)=>{ const o=new T.Mesh(BOX(w,h,d),m); o.position.set(px,py,pz); g.add(o); o.userData.mat='wood'; W.shootables.push(o); return o; };
  add(2.2,.85,1.0,0,.42,0,M5.wood); for(const s of [-1,1]) add(.07,2.4,.07,s*1.05,1.2,-.45,M5.dark), add(.07,2.0,.07,s*1.05,1.0,.45,M5.dark);
  const cv=new T.Mesh(new T.PlaneGeometry(2.4,1.4),M5.awn); cv.position.set(0,2.25,0); cv.rotation.x=-Math.PI/2+.25; g.add(cv);
  const cols=[0xc8402a,0xe0a020,0x8a5a2a,0x6a8a3a,0xd86a20], R=mulberry32((x*7+z*3)|0);
  for(let i=0;i<5;i++){ const c=new T.Mesh(new T.ConeGeometry(.17,.22,8),hm(cols[i%5])); c.position.set(-.85+i*.42,.96,-.1+R()*.2); g.add(c); }
  for(let i=0;i<3;i++){ const p=new T.Mesh(new T.CylinderGeometry(.12,.09,.24,8),M5.copper); p.position.set(-.6+i*.6,.97,.3); g.add(p); }
  const c=Math.abs(Math.sin(rot))>.5; addSolidOnly(x-(c?.5:1.1),x+(c?.5:1.1),z-(c?1.1:.5),z+(c?1.1:.5),.85,0,true); }
function laundry(x0,x1,z,y){ const n=Math.max(2,Math.round((x1-x0)/1.3)); const line=new T.Mesh(BOX(x1-x0,.01,.01),MAT.darkMetal); line.position.set((x0+x1)/2,y,z); scene.add(line); const out=[];
  for(let i=0;i<n;i++){ const s=new T.Mesh(new T.PlaneGeometry(.9,rnd(.7,1.1)),i%3===1?M5.sheetB:M5.sheet); s.geometry.translate(0,-.45,0); s.position.set(x0+.6+i*((x1-x0-1.2)/Math.max(1,n-1)),y,z); scene.add(s); out.push(s); } return out; }
function waterTank(x,z,y){ addMesh(new T.CylinderGeometry(.7,.7,1.4,14),M5.steel,x,y+1.3,z,'metal'); for(const [a,b] of [[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]]) addMesh(BOX(.06,.6,.06),MAT.darkMetal,x+a,y+.3,z+b,'metal'); addSolidOnly(x-.7,x+.7,z-.7,z+.7,2,y,true); }

const ENEMY_DEFS_05=[
  {id:'kessel',x:4.6,z:9.2,yaw:-Math.PI/2,weapon:'pistol',officer:true},
  {id:'l1',x:-2.6,z:9.4,yaw:Math.PI,weapon:'rifle',helmet:true},
  {id:'l2',x:0,z:12.6,yaw:Math.PI,weapon:'smg'},
  {id:'c1',x:-5,z:-3,weapon:'rifle',helmet:true,patrol:[[-5,-3],[3.5,-3],[3.5,2.4],[-5,2.4]]},
  {id:'c2',x:-3.4,z:-5.6,yaw:0,weapon:'smg',helmet:true},
  {id:'t1',x:-9,z:-9,weapon:'smg',patrol:[[-9,-9],[0,-9],[9,-9],[9,2.6],[9,-9],[-9,-9],[-9,3],[-9,-9]]},
  {id:'t2',x:9.1,z:2.8,yaw:-Math.PI/2,weapon:'rifle',helmet:true},
  {id:'t3',x:4,z:-11,yaw:Math.PI/2,weapon:'rifle'},
  {id:'r1',x:7.6,z:-21.6,yaw:Math.PI/2,weapon:'rifle',helmet:true},
  {id:'r2',x:-12.4,z:-24,yaw:Math.PI,weapon:'rifle',sleep:true},
  {id:'s1',x:21,z:-1.5,yaw:0,weapon:'smg',helmet:true},
  {id:'s2',x:20.5,z:-24,weapon:'rifle',helmet:true,patrol:[[20.5,-24],[27.5,-14],[20.5,-10.5],[27.5,-26]]},
  {id:'s3',x:20.6,z:9,yaw:Math.PI,weapon:'rifle'},
  {id:'st1',x:10.4,z:16.4,yaw:0,weapon:'rifle',helmet:true},
  {id:'st2',x:-3.4,z:16.2,yaw:Math.PI/2,weapon:'smg'},
];
function buildLevel05(){
  M5=mats05(); const M=M5;
  scene.background=new T.Color(0xc8d6e4); scene.fog=new T.FogExp2(0xd8ccb2,.0085);
  skyDome(505,[[0,'#2f68b0'],[.3,'#6a9ad0'],[.45,'#b8d0e4'],[.5,'#ecdcc0'],[.56,'#c8ae86'],[1,'#8a7458']],[300,92,22],10);
  scene.add(new T.HemisphereLight(0xd8e6ff,0xb89870,.5));
  const sun=new T.DirectionalLight(0xfff0d4,.88); sun.target.position.set(4,0,-4); sun.position.set(4-34,58,-4+30); scene.add(sun); scene.add(sun.target);
  scene.add(new T.AmbientLight(0x6a5a48,.2));
  // ---- chão ----
  floorPlane(74,62,4,1,M.dust,'stone',0);
  floorPlane(70,8,4,18,M.cobble,'stone',.012);
  floorPlane(16,12,0,-2,M.zel,'stone',.02); floorPlane(16,10,0,9,M.terra,'stone',.02);
  floorPlane(8,10,34,-1,MAT.concrete,'stone',.02);
  // ---- quarteirões ao redor ----
  const fb=(x0,x1,z0,z1,h,mat,inner)=>addBlock(x0,x1,z0,z1,h,{mat,surf:'stone',top:M.ochre,seg:4,inner});
  fb(-34,40,22,32,11,M.facO); fb(-34,-16,-36,14,12,M.fac); fb(-34,32,-38,-28,13,M.facP);
  fb(30,42,-38,-8,11,M.fac); fb(24,42,4,14,10,M.facO,{'-x':M.fac}); fb(38,42,-8,4,8,M.fac);
  addBlock(30,38,-8,-7.6,6,{mat:M.lime,surf:'stone',seg:2}); addBlock(30,38,3.6,4,6,{mat:M.lime,surf:'stone',seg:2});
  addBlock(30,38,-8,4,.4,{y0:4.2,mat:M.lime,bottom:MAT.ceil,top:M.ochre,seg:3}); addBlock(30,30.4,-8,-6,4.2,{mat:M.lime,surf:'stone',seg:1}); addBlock(30,30.4,2,4,4.2,{mat:M.lime,surf:'stone',seg:1}); addBlock(30,30.4,-6,2,1.0,{y0:3.2,mat:M.lime,surf:'stone',seg:1});
  addBlock(-34,-32,14,22,4,{mat:M.ochre,surf:'stone',seg:2}); addBlock(40,42,14,22,4,{mat:M.ochre,surf:'stone',seg:2});
  // ---- hotel: plataformas do terraço (sólidas até o chão) ----
  addWalk(-16,-8,-14,14,YT,{mat:M.arch,top:M.terra,seg:3.6,inner:{'+z':M.shutter}});
  addWalk(8,16,-14,14,YT,{mat:M.arch,top:M.terra,seg:3.6,inner:{'+z':M.shutter,'+x':M.fac}});
  addWalk(-8,8,-14,-8,YT,{mat:M.arch,top:M.terra,seg:3.6});
  addWalk(16,17.4,-7,3,YT,{mat:M.lime,top:M.terra,seg:2});
  for(let z=-6;z<=2;z+=2.6) addMesh(BOX(.5,.35,.3),M.lime,16.9,YT-.1,z,'stone');
  // saguão: massa acima (teto do saguão) e fachada
  addBlock(-8,8,4,14,3.8,{y0:YT,mat:M.fac,bottom:MAT.ceil,top:M.ochre,seg:4});
  const lf=(x0,x1,h,y0=0,cover=false)=>addBlock(x0,x1,13.8,14.2,h,{y0,mat:M.lime,surf:'stone',seg:1.5,cover,inner:{'+z':M.limeW}});
  lf(-8,-6.4,YT); lf(-6.4,-3,1,0,true); lf(-6.4,-3,1,2.6); lf(-3,-1.6,YT); lf(-1.6,1.6,1,2.6); lf(1.6,3,YT); lf(3,6.4,1,0,true); lf(3,6.4,1,2.6); lf(6.4,8,YT);
  addGlass('lobbyW',-6.4,-3,1,2.6,13.95,14.05); addGlass('lobbyE',3,6.4,1,2.6,13.95,14.05);
  for(const s of [-1,1]){ const d=addMesh(BOX(.08,2.5,1.5),M.door,s*1.62,1.25,14.85,'wood'); d.rotation.y=s*.15; }
  poster(0,3.15,14.24,0,4.6,.55,(g,w,h)=>{ g.fillStyle='#1c3e68'; g.fillRect(0,0,w,h); g.strokeStyle='#d8c890'; g.lineWidth=3; g.strokeRect(4,4,w-8,h-8); g.fillStyle='#f2e6c4'; g.font='bold 20px serif'; g.textAlign='center'; g.fillText('HÔTEL DES ORANGERS',w/2,h/2+7); });
  awning(-6.6,-2.8,14.2,2.9,1.4,1); awning(2.8,6.6,14.2,2.9,1.4,1);
  // pilares da arcada saguão/pátio
  for(const x of [-4,4]){ addBlock(x-.25,x+.25,3.75,4.25,3.2,{mat:M.lime,surf:'stone',seg:1}); addMesh(BOX(.7,.25,.7),M.limeW,x,3.1,4,'stone'); }
  addBlock(-8,8,3.8,4.2,.6,{y0:3.0,mat:M.arch,surf:'stone',seg:3.6});
  // ---- saguão (térreo) ----
  addBlock(-7.6,-4,10.8,11.6,1.1,{mat:M.dark,surf:'wood',cover:true,seg:1}); addMesh(BOX(3.7,.06,1),M.brass,-5.8,1.13,11.2,'metal');
  addBlock(-7.9,-4.6,13.3,13.75,2.2,{mat:M.dark,surf:'wood',seg:1});
  const keyBoard=poster(-6.2,1.9,13.28,Math.PI,1.6,.9,(g,w,h)=>{ g.fillStyle='#4a3020'; g.fillRect(0,0,w,h); g.fillStyle='#c8a050'; g.font='bold 13px serif'; for(let r=0;r<3;r++) for(let c=0;c<6;c++){ const n=1+r*6+c; if(n>16) continue; g.fillText(String(n),12+c*40,26+r*44); if(n!==12||true){ g.fillRect(18+c*40,30+r*44,3,12); } } });
  keyBoard.position.z=13.27;
  const key12=addMesh(BOX(.05,.12,.02),M.brass,-6.02,1.73,13.24,'metal');
  addBlock(-7.7,-6.7,12.9,13.3,1.1,{mat:M.dark,surf:'wood',seg:1}); const radio5=addMesh(BOX(.5,.32,.3),hm(0x3a3a2e),-7.2,1.27,13.1,'metal'); addMesh(BOX(.03,.6,.03),MAT.darkMetal,-7.0,1.7,13.15,'metal');
  const ledger=addMesh(BOX(.42,.05,.3),hm(0x5a2a1a),-5.2,1.15,11.2,'cloth');
  // bar
  addBlock(3,7.4,6.4,7.2,1.1,{mat:M.dark,surf:'wood',cover:true,seg:1}); addMesh(BOX(4.4,.06,.9),M.brass,5.2,1.13,6.8,'metal');
  addBlock(7.4,7.95,5.2,8.8,2.4,{mat:M.dark,surf:'wood',seg:1});
  addGlass('mirror',7.36,7.4,1.5,2.6,5.6,8.4,{solid:false,loud:10});
  { const cols=[0x2a5a2a,0x6a3a10,0x3a5a6a,0x8a6a2a]; let k=0; for(const y of [1.25,1.85]) for(let z=5.5;z<8.6;z+=.42){ const b=new T.Mesh(new T.CylinderGeometry(.04,.045,.3,7),new T.MeshPhongMaterial({color:cols[k++%4],shininess:80,specular:0x888888,transparent:true,opacity:.85})); b.position.set(7.25,y,z); scene.add(b); const g={id:'bot'+k,mesh:b,broken:false,minX:7.2,maxX:7.3,minY:y-.15,maxY:y+.15,minZ:z-.05,maxZ:z+.05,small:true,loud:8}; b.userData={mat:'glass',glass:g}; W.shootables.push(b); W.glass.push(g); } }
  for(const [x,z] of [[-3.5,6.6],[0,7.6],[1.2,10.4],[-2.2,11.8]]){ tableT(x,z,0,.5); chairT(x+.7,z,-Math.PI/2,0); chairT(x-.7,z,Math.PI/2,0); }
  addMesh(new T.PlaneGeometry(4,2.6),M.rug,0,.03,9,'cloth').rotation.x=-Math.PI/2;
  potPlant(-7.3,5,0,true); potPlant(7.2,12.6,0,true); potPlant(-3.4,13.3,0);
  const fans=[]; for(const [x,z] of [[-3,8],[3,10.5]]){ const f=new T.Group(); f.position.set(x,3.25,z); for(let i=0;i<4;i++){ const b=new T.Mesh(BOX(.9,.02,.14),M.dark); b.position.x=.45; const p=new T.Group(); p.rotation.y=i*Math.PI/2; p.add(b); f.add(p); } scene.add(f); addMesh(new T.CylinderGeometry(.02,.02,.35,4),MAT.darkMetal,x,3.45,z,null); fans.push(f); }
  bulb('B1',0,3.1,8,8); bulb('B2',-5.5,3.1,12,6); W.lamps.slice(-2).forEach(l=>{ l.base=.9; l.light.intensity=.9; });
  // ---- pátio ----
  addMesh(new T.CylinderGeometry(1.35,1.45,.6,8),M.zel,0,.3,-1.5,'stone'); addSolidOnly(-1.1,1.1,-2.6,-.4,.6,0,true);
  const pool=new T.Mesh(new T.CircleGeometry(1.2,8),M.water); pool.rotation.x=-Math.PI/2; pool.position.set(0,.58,-1.5); scene.add(pool);
  addMesh(new T.CylinderGeometry(.12,.18,.9,8),M.zel,0,.9,-1.5,'stone'); addMesh(new T.CylinderGeometry(.35,.2,.12,10),M.zel,0,1.36,-1.5,'stone');
  orangeTree(-5.6,1.8); orangeTree(5.6,1.8); orangeTree(-5.6,-4.4);
  for(const [x0,x1,z0,z1] of [[-7.9,-7.4,-5,-1],[7.4,7.9,-4,0]]) addBlock(x0,x1,z0,z1,.5,{mat:M.zel,surf:'stone',cover:true,seg:1});
  // escada principal: patamar a leste, degraus descendo para oeste
  addWalk(6.2,8,-8,-6.2,YT,{mat:M.lime,top:M.terra,seg:1});
  stairSteps('x',6.2,-1,-8,-6.2,3.4,17,M.terra,M.zel);
  stairParapet('x',6.2,-1,-6.2,-6.05,3.4,17,M.zel); addBlock(6.2,8,-6.2,-6.05,YT+.9,{mat:M.zel,surf:'stone',seg:1});
  // balaustradas do terraço
  const rail=(x0,x1,z0,z1)=>addBlock(x0,x1,z0,z1,.95,{y0:YT,mat:M.dark,surf:'wood',cover:true,seg:1});
  rail(-8.15,-8,-8,4); rail(8,8.15,-6.05,4); rail(-8,6.2,-8.15,-8);
  for(let x=-7.6;x<6;x+=.5) addMesh(BOX(.06,.8,.06),M.brass,x,YT+.45,-8.075,null);
  // ---- terraço: corredores e quartos ----
  // teto/telhado (não caminhável) sobre as alas, com vão na escada da rouparia
  addBlock(-16,-8,-9,14,.4,{y0:7.0,mat:M.lime,bottom:MAT.ceil,top:M.ochre,seg:3}); addBlock(-13.6,-8,-14,-9,.4,{y0:7.0,mat:M.lime,bottom:MAT.ceil,top:M.ochre,seg:3});
  addBlock(8,16,-14,14,.4,{y0:7.0,mat:M.lime,bottom:MAT.ceil,top:M.ochre,seg:3}); addBlock(-8,8,-14,-8,.4,{y0:7.0,mat:M.lime,bottom:MAT.ceil,top:M.ochre,seg:3});
  
  // parede norte (para os telhados B/C), com vão da escada
  wallT(-16,-15.6,-14.2,-14); wallT(-13.8,16,-14.2,-14);
  // parede frontal (rua) das alas, com janelas
  // (fachada frontal)
  const front=(x0,x1)=>{ wallT(x0,x0+1.4,13.8,14,M.lime,YT,7,{inner:{'+z':M.fac}}); wallT(x0+1.4,x0+3.4,13.8,14,M.lime,YT,YT+1,{inner:{'+z':M.fac}}); wallT(x0+1.4,x0+3.4,13.8,14,M.lime,YT+2.6,7,{inner:{'+z':M.fac}}); wallT(x0+3.4,x0+4.6,13.8,14,M.lime,YT,7,{inner:{'+z':M.fac}}); wallT(x0+4.6,x0+6.6,13.8,14,M.lime,YT,YT+1,{inner:{'+z':M.fac}}); wallT(x0+4.6,x0+6.6,13.8,14,M.lime,YT+2.6,7,{inner:{'+z':M.fac}}); wallT(x0+6.6,x1,13.8,14,M.lime,YT,7,{inner:{'+z':M.fac}}); };
  front(-16,-10); front(10,16); wallT(-10,-8,13.8,14,M.lime,YT,7,{inner:{'+z':M.fac}}); wallT(8,10,13.8,14,M.lime,YT,7,{inner:{'+z':M.fac}});
  for(const x0 of [-16,10]){ addGlass('fw'+x0+'a',x0+1.4,x0+3.4,YT+1,YT+2.6,13.86,13.94); addGlass('fw'+x0+'b',x0+4.6,x0+6.6,YT+1,YT+2.6,13.86,13.94); }
  // parede leste externa (varanda e souk)
  wallT(16,16.2,-14,-6); wallT(16,16.2,-4.8,.2); wallT(16,16.2,1.4,14); wallT(16,16.2,-6,-4.8,M.lime,YT+2.4,7); wallT(16,16.2,.2,1.4,M.lime,YT+2.4,7);
  addBlock(17.25,17.4,-7,3,.95,{y0:YT,mat:M.dark,surf:'wood',cover:true,seg:1}); addBlock(16,17.4,-7.15,-7,.95,{y0:YT,mat:M.dark,surf:'wood',seg:1}); addBlock(16,17.4,3,3.15,.95,{y0:YT,mat:M.dark,surf:'wood',seg:1});
  potPlant(17.0,-6.55,YT); potPlant(17.0,2.55,YT);
  // paredes dos corredores (lado dos quartos) com vãos de porta
  // oeste x=-10: rouparia z[-14,-9] porta z -11.4; Q3 z[-9,-2] porta -5.6; Q4 z[-2,5] porta 1.4; Q5 z[5,14] porta 8.4
  const wx=(x,segs)=>{ for(const [z0,z1] of segs) wallT(x-.1,x+.1,z0,z1); };
  wx(-10,[[-14,-11.95],[-10.85,-6.15],[-5.05,.85],[1.95,7.85],[8.95,13.8]]);
  doorT('linen',-10,-11.4,false); doorT('q3',-10,-5.6,false); doorT('q4',-10,1.4,false); doorT('q5',-10,8.4,false);
  wallT(-16,-10,-9.1,-8.9); wallT(-16,-10,-2.1,-1.9); wallT(-16,-10,4.9,5.1);
  // norte z=-10: Q7 x[-8,-2.6] porta -4.6; Q8 x[-2.6,2.6] porta 0; Q9 x[2.6,8] porta 5
  wallT(-8,-5.15,-10.1,-9.9); wallT(-4.05,-.55,-10.1,-9.9); wallT(.55,4.45,-10.1,-9.9); wallT(5.55,8,-10.1,-9.9);
  doorT('q7',-4.6,-10,true); doorT('q8',0,-10,true); doorT('q9',5,-10,true);
  wallT(-2.7,-2.5,-14,-10); wallT(2.5,2.7,-14,-10); wallT(-8.1,-7.9,-14,-10); wallT(7.9,8.1,-14,-10);
  // leste x=10: Q10 z[-14,-8] porta -11; Q11 z[-8,-2] porta -5.2; suíte z[-2,8] porta .6; Q14 z[8,14] porta 11
  wx(10,[[-14,-11.55],[-10.45,-5.75],[-4.65,.05],[1.15,10.45],[11.55,13.8]]);
  doorT('q10',10,-11,false); doorT('q11',10,-5.2,false); doorT('suite',10,.6,false,{locked:true,npc:false}); doorT('q14',10,11,false);
  wallT(10,16,-8.1,-7.9); wallT(10,16,-2.1,-1.9); wallT(10,16,7.9,8.1);
  wallT(10,12.2,2.9,3.1); wallT(13.4,16,2.9,3.1); wallT(13.4,13.6,7,7.9); wallT(13.6,16,5.9,6.1); // salão/quarto e banheiro
  // porta-janela da suíte (vidro): trancada; pode ser forçada ou estilhaçada
  const bdoor=makeDoor('balc',{x:16.1,z:.8,y0:YT,w:.08,d:1.2,h:2.3,mat:new T.MeshPhongMaterial({color:0x9ec4d4,transparent:true,opacity:.35,shininess:90,specular:0xffffff,depthWrite:false}),offset:V3(0,0,1.15),locked:true,npc:false,nav:true});
  bdoor.mesh.userData.glassDoor=true; addMesh(BOX(.1,2.4,.08),M.dark,16.1,YT+1.2,.18,'wood'); addMesh(BOX(.1,2.4,.08),M.dark,16.1,YT+1.2,1.42,'wood');
  const q11d=addMesh(BOX(.06,2.3,1.1),M.door,16.6,YT+1.15,-5.9,'wood'); q11d.rotation.y=1.2;
  // ---- mobília dos quartos ----
  // Q7 (início)
  bedT(-6.6,-12.6,Math.PI/2); wardrobeT(-3.4,-2.75,-13.9,-12.6); tableT(-4.4,-13.3,YT,.35); chairT(-4.4,-12.7,Math.PI);
  addMesh(new T.PlaneGeometry(2.2,1.6),M.rug,-5,YT+.02,-11.8,'cloth').rotation.x=-Math.PI/2;
  const suitcase7=addMesh(BOX(.6,.22,.4),hm(0x6a4a2a),-6.2,YT+.72,-12.3,'cloth');
  // rouparia + escada para o telhado B
  addBlock(-12.4,-10.2,-13.8,-12.6,1.9,{y0:YT,mat:M.wood,surf:'wood',seg:1}); addBlock(-12.4,-10.2,-10,-9.2,1.2,{y0:YT,mat:M.wood,surf:'wood',seg:1,cover:true});
  for(let i=0;i<4;i++) addMesh(BOX(.5,.12,.4),M.sheet,-11.8+(i%2)*.8,YT+1.95+((i/2)|0)*.13,-13.2,'cloth');
  stairSteps('z',-14,1,-15.6,-13.8,5.8,11,M.terra,M.lime);
  stairParapet('z',-14,1,-13.8,-13.65,5.8,11,M.lime,.95);
  bulb('Y1',-12,6.6,-11.5,5); W.lamps[W.lamps.length-1].base=.6;
  // Q3, Q4, Q5, Q8, Q9, Q10, Q14 (camas, armários)
  bedT(-14,-5.6,0); wardrobeT(-15.9,-15.3,-8.8,-7.4); bedT(-14,1.6,0); tableT(-11.4,3.4); bedT(-14,9.6,0); wardrobeT(-15.9,-15.3,12,13.6);
  bedT(0,-12.8,Math.PI/2); tableT(1.6,-11.2,YT,.35); bedT(5.2,-12.8,Math.PI/2); wardrobeT(7.2,7.85,-11.8,-10.3);
  bedT(13.6,-11.2,Math.PI/2); bedT(14.6,-3.4,Math.PI/2); tableT(11.2,-3,YT,.35); bedT(13.6,11,Math.PI/2);
  // ---- suíte 12 do major Kessel ----
  addMesh(new T.PlaneGeometry(4.6,3.6),M.rug,13,YT+.02,.4,'cloth').rotation.x=-Math.PI/2;
  const desk=addBlock(14.2,15.8,-1.6,-.6,.78,{y0:YT,mat:M.dark,surf:'wood',seg:1,cover:true}); chairT(14.9,.0,Math.PI);
  addMesh(BOX(.32,.03,.24),hm(0xd8d0bc),14.7,YT+.8,-1.1,'cloth'); addMesh(new T.CylinderGeometry(.08,.12,.4,8),M.brass,15.5,YT+1,-1.3,'metal');
  addBlock(10.3,11.4,1.4,2.6,.85,{y0:YT,mat:M.cushion,surf:'cloth',seg:1,cover:true}); tableT(12.2,1.6,YT,.4);
  const safeM=addMesh(BOX(.06,.55,.6),MAT.cabinet,15.88,YT+1.5,-1.0,'metal'); addMesh(new T.CylinderGeometry(.06,.06,.04,12),M.brass,15.84,YT+1.55,-1.0,'metal').rotation.z=Math.PI/2;
  const painting=addMesh(BOX(.04,.7,.9),hm(0x8a6a3a),15.8,YT+1.5,-1.0,'wood');
  bedT(14.4,4.8,Math.PI/2); wardrobeT(10.25,10.9,3.4,5.6); const suitcase=addMesh(BOX(.7,.26,.45),hm(0x3a2a1a),13.9,YT+.76,4.4,'cloth');
  addMesh(BOX(.5,.6,.04),MAT.cabinet,15.85,YT+1.5,7.0,'metal'); addGlass('bathMirror',15.8,15.84,YT+1.2,YT+1.9,6.5,7.5,{solid:false,loud:8});
  addBlock(14,15.9,6.2,7.9,.5,{y0:YT,mat:M.limeW,surf:'stone',seg:1});
  bulb('K1',13,6.6,0,5); W.lamps[W.lamps.length-1].base=.5; W.lamps[W.lamps.length-1].light.intensity=.5;
  // luzes dos corredores
  bulb('G1',-9,6.6,-3,5); bulb('G2',9,6.6,-3,5); bulb('G3',0,6.6,-9,5); W.lamps.slice(-3).forEach(l=>{ l.base=.7; l.light.intensity=.7; });
  // ---- telhados ----
  addWalk(-16,-4,-28,-14,YB,{mat:M.fac,top:M.ochre,seg:3});
  addWalk(-4,16,-28,-14,YC,{mat:M.facO,top:M.ochre,seg:3});
  addBlock(-4.2,-4,-28,-20,.9,{y0:YB,mat:M.ochre,surf:'stone',cover:true,seg:1}); addBlock(-4.2,-4,-18.6,-14.2,.9,{y0:YB,mat:M.ochre,surf:'stone',cover:true,seg:1});
  stairSteps('x',-4,1,-20,-18.6,5.8,5,M.ochre,M.ochre);
  addBlock(15.8,16,-28,-20.15,.9,{y0:YC,mat:M.ochre,surf:'stone',cover:true,seg:1}); addBlock(15.8,16,-18.25,-14.2,.9,{y0:YC,mat:M.ochre,surf:'stone',cover:true,seg:1});
  stairSteps('x',16,1,-20,-18.4,4.6,23,M.ochre,M.lime);
  stairParapet('x',16,1,-20.15,-20,4.6,23,M.lime); stairParapet('x',16,1,-18.4,-18.25,4.6,23,M.lime);
  // telhado B: caixas d'água, toldo de junco (guarda dormindo), varal
  waterTank(-14,-17,YB); waterTank(-6.4,-26,YB);
  for(const [x,z] of [[-14.4,-25.6],[-10.4,-25.6],[-14.4,-22.4],[-10.4,-22.4]]) addMesh(BOX(.08,2.3,.08),M.trunk,x,YB+1.15,z,'wood');
  { const r=new T.Mesh(BOX(4.4,.05,3.6),M.reed); r.position.set(-12.4,YB+2.3,-24); scene.add(r); }
  addMesh(new T.PlaneGeometry(2.4,1.6),M.rug,-12.4,YB+.03,-24,'cloth').rotation.x=-Math.PI/2;
  const sheets=[...laundry(-14,-6,-20.5,YB+2.1),...laundry(0,9,-17,YC+2.1),...laundry(-2,6,-25,YC+2.1)];
  for(const [x,z] of [[-8,-15],[-15,-27],[-5,-21.5]]) addMesh(BOX(.6,1.2,.6),M.lime,x,YB+.6,z,'stone');
  // telhado C: quiosque com cúpula, potes, chaminés
  addBlock(5.4,9.4,-26.8,-23,2.6,{y0:YC,mat:M.limeW,surf:'stone',seg:1.5}); { const d=new T.Mesh(new T.SphereGeometry(1.6,14,8,0,Math.PI*2,0,Math.PI/2),M.limeW); d.position.set(7.4,YC+2.6,-24.9); scene.add(d); }
  addMesh(BOX(1.1,2.1,.06),M.door,7.4,YC+1.05,-22.97,'wood');
  waterTank(12.6,-25,YC); potPlant(2,-15.2,YC); potPlant(3,-15.2,YC); potPlant(14.8,-15.4,YC,true);
  for(const [x,z] of [[-1,-26],[11,-16.4]]) addMesh(BOX(.5,1,.5),M.lime,x,YC+.5,z,'stone');
  addBlock(0,3,-23.2,-22.2,.9,{y0:YC,mat:M.ochre,surf:'stone',cover:true,seg:1}); addBlock(10,13,-21.4,-20.6,.9,{y0:YC,mat:M.ochre,surf:'stone',cover:true,seg:1});
  // ---- souk ----
  for(const [x,z,r] of [[20,-26,0],[27,-21,Math.PI/2],[20.2,-14.6,0],[27.2,-6,Math.PI/2],[19.6,-6.4,0]]) stall(x,z,r);
  addMesh(new T.CylinderGeometry(.85,.95,.85,12),M.lime,24,.42,-16,'stone'); addSolidOnly(23.2,24.8,-16.8,-15.2,.85,0,true);
  addMesh(BOX(.08,1.8,.08),M.dark,23.4,1.5,-16,'wood'); addMesh(BOX(.08,1.8,.08),M.dark,24.6,1.5,-16,'wood'); addMesh(BOX(1.4,.08,.08),M.dark,24,2.4,-16,'wood');
  crate(28.6,-12,1,.9); crate(28.6,-10.9,.9,.8); crate(22.6,2.6,.9,.9); barrel(18.4,-1.2); barrel(23.4,7.6);
  addBlock(25.6,28.6,-1.4,.2,1.0,{mat:M.wood,surf:'wood',cover:true,seg:1}); for(const z of [-1.6,.4]){ const w=addMesh(new T.CylinderGeometry(.6,.6,.08,12),M.dark,27.1,.6,z,'wood'); w.rotation.x=Math.PI/2; }
  for(const [x0,x1,z,f] of [[17.6,23.6,-27.8,1],[24.4,29.8,-27.8,1],[24.2,29.6,-8,-1],[17.6,23,4.2,-1]]) awning(x0,x1,z,3.1,1.6,f);
  for(let z=-26;z<3;z+=5) addMesh(new T.PlaneGeometry(.9,1.6),M.rug,29.95,1.6,z,'cloth').rotation.y=-Math.PI/2;
  { const arch=addBlock(16,24,12.6,13.4,1.8,{y0:3.6,mat:M.lime,bottom:M.lime,top:M.ochre,seg:2}); addBlock(16,16.6,12.6,13.4,3.6,{mat:M.lime,surf:'stone',seg:1}); addBlock(23.4,24,12.6,13.4,3.6,{mat:M.lime,surf:'stone',seg:1});
    poster(20,4.1,13.42,0,4,.5,(g,w,h)=>{ g.fillStyle='#ece6d9'; g.fillRect(0,0,w,h); g.fillStyle='#2a5f98'; g.font='bold 18px serif'; g.textAlign='center'; g.fillText('SOUK EL-ATTARINE',w/2,h/2+6); }); }
  for(let z=-24;z<12;z+=9){ const L=new T.Group(); L.position.set(20+((z/9)%2?4:0),3.4,z); const lb=new T.Mesh(BOX(.22,.32,.22),M.brass); L.add(lb); scene.add(L); }
  // garagem e carro de Yasmina
  car(34.2,-1.4,true); addBlock(36.8,37.8,-6.6,-3,1,{mat:M.wood,surf:'wood',cover:true,seg:1}); barrel(36.9,2.4); barrel(36.3,3);
  bulb('GA',34,3.9,-1,7); W.lamps[W.lamps.length-1].base=.7;
  const yas=new Actor({id:'yasmina',x:32.4,z:-3.6,yaw:-Math.PI/2+.3},{uniform:0x2e4a5a,pants:0x2a2622,skin:0xb88a66,hair:0x1e1a17,boots:false}); removeShootables(yas.h.hitMeshes); addSolidOnly(32.1,32.7,-3.9,-3.3,1.7);
  // ---- rua ----
  truck04(13.6,18.6); car(-14,18.8,false);
  for(const x of [-26,-20,-8,24,30]) palm(x,21.2,rnd(6,8));
  for(const [x,z] of [[-10.6,16.2],[-11.8,15.4]]) { tableT(x,z,0,.4); chairT(x+.6,z,-Math.PI/2,0); }
  for(const [id,x] of [['S1',-22],['S2',6.5],['S3',27]]){ const L=lampPost(id,x,15,0,.6); L.base=.2; L.light.intensity=.15; }
  poster(-12.5,2,21.96,Math.PI,1.6,2.2,(g,w,h)=>{ g.fillStyle='#d8c090'; g.fillRect(0,0,w,h); g.fillStyle='#8a2a1a'; g.font='bold 30px serif'; g.textAlign='center'; g.fillText('CINÉMA',w/2,54); g.fillStyle='#2a1a10'; g.font='20px serif'; g.fillText('LE PALMARIUM',w/2,100); g.fillText('SÉANCE 21h',w/2,140); });
  poster(-30,2,14.05,0,2,1.4,(g,w,h)=>{ g.fillStyle='#e8e0d0'; g.fillRect(0,0,w,h); g.fillStyle='#1c3e68'; g.font='bold 22px serif'; g.textAlign='center'; g.fillText('RUE DE LA KASBAH',w/2,h/2+8); });
  // ---- navegação ----
  const N=[];
  for(let x=-30;x<=38;x+=2.6) for(let z=15;z<=21;z+=2.4) N.push({x,z});
  for(let x=-7;x<=7;x+=2) for(let z=5;z<=13;z+=2) N.push({x,z});
  for(let x=-7;x<=7;x+=2) for(let z=-6;z<=3;z+=2) N.push({x,z});
  for(let k=1;k<17;k+=2) N.push({x:6.2-.36*k-.18,z:-7.1});
  N.push({x:7.1,z:-7.1},{x:-1.3,z:-7.1},{x:0,z:3.2},{x:0,z:4.8},{x:-6,z:4},{x:6,z:4});
  for(let z=-13;z<=13;z+=2) N.push({x:-9,z},{x:9,z}); for(let x=-7;x<=7;x+=2) N.push({x,z:-9});
  for(let x=-15;x<=-11;x+=2) for(let z=-13;z<=13;z+=2) N.push({x,z});
  for(let x=11;x<=15;x+=2) for(let z=-13;z<=13;z+=2) N.push({x,z});
  for(let x=-7;x<=7;x+=2) for(let z=-13;z<=-11;z+=2) N.push({x,z});
  N.push({x:15.1,z:-5.4},{x:16.7,z:-5.4},{x:16.7,z:-3},{x:16.7,z:0},{x:16.7,z:2});
  for(const [x,z] of [[-10,-11.4],[-10,-5.6],[-10,1.4],[-10,8.4],[10,-11],[10,-5.2],[10,.6],[10,11]]){ N.push({x:x-.9,z},{x:x+.9,z}); }
  for(const x of [-4.6,0,5]) N.push({x,z:-10.9},{x,z:-9.1});
  for(let k=0;k<11;k+=2) N.push({x:-14.7,z:-14+.36*k+.18}); N.push({x:-14.7,z:-9.6},{x:-14.7,z:-14.8});
  for(let x=-15;x<=-5;x+=2.5) for(let z=-27;z<=-15;z+=2.4) N.push({x,z});
  for(let k=0;k<5;k++) N.push({x:-4+.36*k+.18,z:-19.3}); N.push({x:-1,z:-19.3});
  for(let x=-2.6;x<=15;x+=2.5) for(let z=-27;z<=-15;z+=2.4) N.push({x,z});
  for(let k=0;k<23;k+=2) N.push({x:16+.36*k+.18,z:-19.2}); N.push({x:25,z:-19.2},{x:15.2,z:-19.2});
  for(let x=18;x<=29;x+=2.4) for(let z=-27;z<=3;z+=2.4) N.push({x,z});
  for(let x=18;x<=23;x+=2.4) for(let z=4;z<=13;z+=2.2) N.push({x,z});
  for(let x=31;x<=37;x+=2) for(let z=-6;z<=3;z+=2) N.push({x,z});
  N.push({x:20,z:12.2},{x:20,z:14},{x:29.4,z:-2},{x:30.8,z:-2},{x:-5.6,z:12.4},{x:-3.4,z:12.4},{x:-3.4,z:10.2});
  W.nav.nodes=N.filter(n=>!insideSolid(n.x,n.z,.4)); W.nav.link=5.2; buildNav();
  return {sun,fans,key12,radio5,ledger,suitcase7,safeM,painting,suitcase,desk,yas,sheets,pool,bdoor};
}
function objectives05(){ return [
  {id:'suite',text:'Entre na suíte 12 do major Kessel (ala leste do terraço)',state:'active',marker:{x:10,z:.6}},
  {id:'dossier',text:'Reviste a suíte e encontre o dossiê de logística',state:'hidden',marker:{x:14.9,z:-1.1}},
  {id:'escape',text:'Fuja do hotel: escada da rouparia até os telhados — ou pela rua',state:'hidden',marker:{x:-14.7,z:-11.4}},
  {id:'car',text:'Chegue ao carro de Yasmina, na garagem do souk',state:'hidden',marker:{x:33,z:-2}},
  {id:'alarm',text:'Opcional: o major Kessel não chega ao rádio da recepção',state:'active',optional:true,autoDone:true},
  {id:'pass',text:'Opcional: leve o salvo-conduto do major',state:'active',optional:true},
]; }
function doorI(id,x,y,z){ const it=doorInteract(id,V3(x,y,z)); W.interactables.push(it); return it; }
function searchSpot(id,pt,label,hold,use,cond){ W.interactables.push({id,pt:()=>pt,r:2.2,hold:()=>hold,label:()=>(cond&&!cond())||G.flags['s_'+id]?null:label,use:()=>{ if(G.flags['s_'+id]) return; G.flags['s_'+id]=true; AudioSys.play('cloth',pt); use(); }}); }
function interact05(R){
  const I=W.interactables, F=()=>G.flags;
  for(const [id,x,z] of [['q7',-4.6,-10],['q8',0,-10],['q9',5,-10],['linen',-10,-11.4],['q3',-10,-5.6],['q4',-10,1.4],['q5',-10,8.4],['q10',10,-11],['q11',10,-5.2],['q14',10,11]]) doorI(id,x,YT+1.2,z);
  I.push({id:'suitedoor',pt:()=>V3(10,YT+1.2,.6),r:2.3,skipSolid:()=>W.doors.suite.solid,
    label:()=>{ const d=W.doors.suite; if(d.state==='LOCKED') return F().key12?'Destrancar a suíte 12':'Suíte 12 — trancada (chave na recepção)'; return d.state==='CLOSED'?'Abrir porta':d.state==='OPEN'?'Fechar porta':null; },
    locked:()=>W.doors.suite.state==='LOCKED'&&!F().key12,
    use:()=>{ const d=W.doors.suite; if(d.state==='LOCKED'){ if(!F().key12){ showHint('Trancada. A chave 12 fica no quadro da recepção — ou tente a varanda do quarto 11.'); return; } d.state='CLOSED'; AudioSys.play('unlock',d.mesh.position); openDoor(d,null); return; } if(d.state==='CLOSED') openDoor(d,null); else if(d.state==='OPEN') closeDoor(d); }});
  I.push({id:'balcdoor',pt:()=>V3(16.1,YT+1.2,.8),r:2.2,skipSolid:()=>W.doors.balc.solid,hold:()=>W.doors.balc.state==='LOCKED'?2.2:0,
    label:()=>{ const d=W.doors.balc; if(d.state==='LOCKED') return 'Forçar o trinco da porta-janela (segure)'; return d.state==='CLOSED'?'Abrir porta-janela':d.state==='OPEN'?'Fechar porta-janela':null; },
    use:()=>{ const d=W.doors.balc; if(d.state==='LOCKED'){ d.state='CLOSED'; AudioSys.play('unlock',d.mesh.position); emitNoise(d.mesh.position,2.5,'step',null); openDoor(d,null); return; } if(d.state==='CLOSED') openDoor(d,null); else if(d.state==='OPEN') closeDoor(d); }});
  I.push({id:'key12',pt:()=>V3(-6.02,1.73,13.24),r:2.4,skip:true,label:()=>F().key12?null:'Pegar a chave da suíte 12',use:()=>{ F().key12=true; R.key12.visible=false; AudioSys.play('pickup'); pickupMsg('Chave da suíte 12'); }});
  I.push({id:'ledger',pt:()=>V3(-5.2,1.2,11.2),r:2.2,label:()=>'Ler o registro de hóspedes',use:()=>openDoc('registro05')});
  I.push({id:'radio5',pt:()=>V3(-7.2,1.3,13.1),r:2.3,skip:true,hold:()=>1.2,label:()=>G.radioDead?null:'Arrancar o fio do rádio (segure)',use:()=>{ G.radioDead=true; AudioSys.play('sabotage',R.radio5.position); pickupMsg('Rádio da recepção mudo'); }});
  I.push({id:'case7',pt:()=>V3(-6.2,YT+.8,-12.3),r:2,label:()=>F().case7?null:'Abrir a mala (equipamento da rede)',use:()=>{ F().case7=true; const P=G.player; P.ammo.silenced.reserve=Math.min(WEAPONS.silenced.reserveMax,P.ammo.silenced.reserve+6); AudioSys.play('cloth'); pickupMsg('Munição da Welrod +6'); G.radioMsg('YASMINA','Boa. Agora, devagar: a patrulha do terraço passa pela sua porta a cada minuto.','tip'); }});
  searchSpot('desk',V3(14.9,YT+.9,-1.1),'Revistar a escrivaninha (segure)',1.6,()=>{ F().comb=true; openDoc('bilhete05'); const o=obj('dossier'); o.text='Abra o cofre atrás do quadro: combinação 4 · 17 · 31'; o.marker={x:15.6,z:-1}; refreshObjectiveUI(true); });
  searchSpot('wardrobe',V3(10.6,YT+1.2,4.5),'Revistar o guarda-roupa do major (segure)',1.6,()=>{ G.player.ammo.pistol.reserve=Math.min(WEAPONS.pistol.reserveMax,G.player.ammo.pistol.reserve+16); openDoc('passe05'); complete('pass'); pickupMsg('Salvo-conduto · munição P38 +16'); });
  searchSpot('suitcase',V3(13.9,YT+.9,4.4),'Revistar a mala sobre a cama (segure)',1.3,()=>{ G.player.hp=Math.min(100,G.player.hp+30); G.hud.healthT=4; pickupMsg('Kit de primeiros socorros +30'); });
  searchSpot('bath',V3(15.85,YT+1.5,7),'Abrir o armário do banheiro',.6,()=>{ showHint('Lâminas de barbear, colônia e um vidro de quinino. Nada da rede.'); });
  I.push({id:'painting',pt:()=>V3(15.78,YT+1.5,-1.0),r:2.2,label:()=>F().painting?null:'Afastar o quadro',use:()=>{ F().painting=true; R.painting.position.z=-.25; R.painting.rotation.y=.3; AudioSys.play('cloth'); if(!F().comb) showHint('Um cofre de parede. Falta a combinação — o major deve tê-la anotado em algum lugar.'); }});
  I.push({id:'safe',pt:()=>V3(15.82,YT+1.5,-1.0),r:2.2,hold:()=>F().comb?2.4:0,
    label:()=>{ if(!F().painting||F().dossier) return null; return F().comb?'Girar o segredo: 4 · 17 · 31 (segure)':'Cofre de parede — falta a combinação'; }, locked:()=>!F().comb,
    use:()=>{ if(!F().comb){ showHint('Sem a combinação não adianta. Reviste a suíte.'); return; } takeDossier05(); }});
  I.push({id:'car',pt:()=>V3(34.2,1.2,-1.4),r:3,skip:true,label:()=>obj('car').state==='active'?'Entrar no carro de Yasmina':(F().dossier?null:'Yasmina: “Sem o dossiê, não saímos daqui.”'),locked:()=>obj('car').state!=='active',
    use:()=>{ if(obj('car').state==='active') missionComplete(); }});
}
function pickups05(){
  addPickup('h_med1',-4.4,-13.3,'med',30,YT+.78); addPickup('h_pis1',7.65,-2.6,'pistol',8,.55);
  addPickup('h_med2',5.6,12.9,'med',35,.1); addPickup('h_smg1',-15.4,-6.6,'smg',32,YT+.1); addPickup('h_med3',-11.6,3.4,'med',30,YT+.78);
  addPickup('h_smg2',-12.4,-23,'smg',32,YB+.1); addPickup('h_med4',8.4,-24.8,'med',35,YC+.1); addPickup('h_pis2',2.2,-22.7,'pistol',8,YC+.95);
  addPickup('h_smg3',22.6,2.6,'smg',32,1.0); addPickup('h_med5',36.8,-5,'med',40,1.05); addPickup('h_smg4',-10.6,16.2,'smg',24,.8);
}
function takeDossier05(){
  const F=G.flags; if(F.dossier) return; F.dossier=true;
  AudioSys.play('pickup'); openDoc('dossie05'); complete('dossier'); if(obj('suite').state!=='done') complete('suite',true);
  activate('escape');
  G.radioMsg('YASMINA','Você pegou? A rota do comboio de combustível… é isso que Londres queria. Kessel mandou subir dois homens — saia pela rouparia, pelos telhados.','warn');
  for(const d of [{id:'x1',x:-1,z:11.6,weapon:'smg',helmet:true},{id:'x2',x:1,z:11.6,weapon:'rifle',helmet:true}]){ if(G.enemies.find(e=>e.id===d.id)) continue; const e=new Enemy(d); G.enemies.push(e); G.actors.push(e); addTakedown(e); e.alertLevel=1; e.awareness=.8; e.toInvestigate(12.8,.6); e.searchT=20; }
  checkpoint();
}
function update05(dt){
  const P=G.player, F=G.flags, R=G.refs;
  if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('YASMINA','Élise, a Feldgendarmerie entrou no saguão. Kessel está no bar — o dossiê do comboio está na suíte 12, ala leste.','warn'); }
  if(!F.i2&&G.introT>7){ F.i2=true; G.radioMsg('DICA','Tiros nos membros agora deixam marcas: perna ferida faz o soldado mancar e se ajoelhar; braço ferido derruba a mira — ou a arma.','tip'); }
  if(!F.i3&&G.introT>14){ F.i3=true; G.radioMsg('YASMINA','A chave fica no quadro da recepção, atrás de Kessel. Ou passe pela varanda do quarto 11 — a porta-janela da suíte cede com jeito.','tip'); }
  for(const f of R.fans) f.rotation.y+=dt*4.2;
  for(let i=0;i<R.sheets.length;i++){ const s=R.sheets[i]; s.rotation.x=Math.sin(simTime*1.7+i*1.3)*.22+.12; }
  if(Math.random()<dt*6) FX.puff(V3(rnd(-.15,.15),1.45,-1.5+rnd(-.15,.15)),1,0xe8f4ff,.12,.5,V3(rnd(-.3,.3),.6,rnd(-.3,.3)),.5);
  R.yas.animate(dt);
  const s=obj('suite');
  if(s.state==='active'&&P.pos.x>10.3&&P.pos.x<16&&P.pos.z>-1.9&&P.pos.z<7.9&&P.pos.y>3){ complete('suite'); activate('dossier'); G.radioMsg('YASMINA','Kessel guarda papéis num cofre. Reviste tudo — escrivaninha, armário, mala.','tip'); checkpoint(); }
  if(obj('escape').state==='active'){ const out=(P.pos.y>5.5)||(P.pos.y<.5&&(P.pos.z>14.4||P.pos.x>16.2)); if(out){ complete('escape'); activate('car'); G.radioMsg('YASMINA','Estou na garagem do souk, porta azul, com o motor ligado. Cuidado com a patrulha da praça.'); checkpoint(); } }
}
function restore05(s){
  const F=G.flags, R=G.refs;
  if(F.key12) R.key12.visible=false;
  if(F.painting){ R.painting.position.z=-.25; R.painting.rotation.y=.3; }
  if(F.glass) for(const id of F.glass){ const g=W.glass.find(x=>x.id===id); if(g&&!g.broken){ g.broken=true; g.mesh.visible=false; if(g.solid) g.solid.active=false; } }
  if(F.comb){ const o=obj('dossier'); o.text='Abra o cofre atrás do quadro: combinação 4 · 17 · 31'; o.marker={x:15.6,z:-1}; }
}
function light05(x,z){
  const h=heightAt(x,z);
  if(h>3&&h<4){ if(x>-10&&x<-8||x>8&&x<10||z>-10&&z<-8&&x>-8&&x<8) return .62; if(x>16) return .9; return .3; }
  if(h<.5&&x>-8&&x<8&&z>4&&z<14) return .42;
  if(x>30&&z>-8&&z<4) return .36;
  return .9;
}
function drawMap05(g,w,h){
  g.fillStyle='#e9dfc6'; g.fillRect(0,0,w,h);
  const S=w/62, X=x=>(x+22)*S, Z=z=>(z+30)*S;
  const rect=(x0,x1,z0,z1,fill,stroke)=>{ g.fillStyle=fill; g.fillRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); if(stroke){ g.strokeStyle=stroke; g.lineWidth=1.5; g.strokeRect(X(x0),Z(z0),(x1-x0)*S,(z1-z0)*S); } };
  rect(-16,16,-14,14,'#d8ccb0','#3a3020'); rect(-8,8,-8,4,'#c6d4c0','#3a3020'); rect(-8,8,4,14,'#d0c2a4','#3a3020');
  rect(-16,-4,-28,-14,'#cbbd9a','#5a4a30'); rect(-4,16,-28,-14,'#d4c6a2','#5a4a30'); rect(16,30,-28,14,'#e2d6b8','#5a4a30'); rect(30,38,-8,4,'#bfb090','#3a3020'); rect(-22,40,14,22,'#ddd2b6',null);
  g.strokeStyle='#3a3020'; g.lineWidth=1;
  for(const z of [-9,-2,5]) { g.beginPath(); g.moveTo(X(-16),Z(z)); g.lineTo(X(-10),Z(z)); g.stroke(); }
  for(const z of [-8,-2,8]) { g.beginPath(); g.moveTo(X(10),Z(z)); g.lineTo(X(16),Z(z)); g.stroke(); }
  for(const x of [-10,10]){ g.beginPath(); g.moveTo(X(x),Z(-14)); g.lineTo(X(x),Z(14)); g.stroke(); }
  g.beginPath(); g.moveTo(X(-8),Z(-10)); g.lineTo(X(8),Z(-10)); g.stroke(); for(const x of [-2.6,2.6]){ g.beginPath(); g.moveTo(X(x),Z(-14)); g.lineTo(X(x),Z(-10)); g.stroke(); }
  g.fillStyle='#2a2418'; g.font='bold 15px serif'; g.textAlign='center';
  const t=(s,x,z,f)=>{ g.font=f||'13px serif'; g.fillText(s,X(x),Z(z)); };
  t('PÁTIO',0,-1,'bold 15px serif'); t('SAGUÃO · BAR',0,9.4); t('recepção',-5.6,12.6,'11px serif'); t('Q7',-5.3,-11.6,'bold 13px serif'); t('(você)',-5.3,-10.6,'10px serif');
  t('ROUP.',-13,-11.2,'11px serif'); t('Q3',-13,-5.4); t('Q4',-13,1.6); t('Q5',-13,9.6); t('Q8',0,-11.6); t('Q9',5.3,-11.6); t('Q10',13,-10.8); t('Q11',13,-4.8); t('SUÍTE 12',13,1.2,'bold 13px serif'); t('Q14',13,11.2);
  t('telhado',-10,-21); t('telhado',6,-21); t('SOUK',23,-12,'bold 15px serif'); t('garagem',34,-1.2,'bold 12px serif'); t('RUE DE LA KASBAH',8,18.6,'bold 13px serif');
  g.strokeStyle='#8a2a1a'; g.lineWidth=2.5; g.setLineDash([6,5]); g.beginPath(); g.moveTo(X(-5),Z(-11)); g.lineTo(X(-9),Z(-9)); g.lineTo(X(-9),Z(-11.4)); g.lineTo(X(-14.7),Z(-11.4)); g.lineTo(X(-14.7),Z(-16)); g.lineTo(X(-6),Z(-19.3)); g.lineTo(X(16),Z(-19.3)); g.lineTo(X(24.5),Z(-19.3)); g.lineTo(X(24),Z(-4)); g.lineTo(X(32),Z(-2)); g.stroke(); g.setLineDash([]);
  g.fillStyle='#8a2a1a'; g.font='italic 13px serif'; g.textAlign='left'; g.fillText('rota de fuga — escada da rouparia',X(-15),Z(-15.3)); g.fillText('varanda: Q11 → suíte',X(16.6),Z(5.6));
  g.textAlign='center'; g.fillText('escada',X(3.2),Z(-6.4));
}
DOCS.planta05={title:'Planta do Hôtel des Orangers',sub:'Desenhada por Yasmina · terraço sobre o saguão',map:'05',body:'',pencil:'Os quartos ficam no terraço, um andar acima do pátio. A escada principal sobe do pátio para o lado leste. A rouparia tem a escada de serviço para os telhados.'};
DOCS.registro05={title:'Registro de hóspedes',sub:'Hôtel des Orangers · Túnis · abril de 1943',body:`Q 5   Sr. e Sra. Benhamou — Sousse
Q 7   Mlle. E. Morel — correspondente, Genebra
Q 9   Cap. Hartwig — trânsito
Q 11  (reservado — Intendência)
Q 12  Major A. Kessel — Intendência, permanente
      visitas: Sr. Ferrand (Cia. de Petróleos),
      ten. Brauer (depósito de Oued el-Kebir)
Q 14  Sr. Laval — comerciante de couros

Pedido do Q 12: não limpar o quarto. Chave fica no quadro.`,pencil:'Q12 = Kessel. A chave fica no quadro da recepção.'};
DOCS.bilhete05={title:'Bilhete amassado',sub:'Na gaveta da escrivaninha da suíte 12',body:`Lembrete — cofre:
  4 · 17 · 31

(não deixar com o ordenança)`,pencil:'A combinação do cofre.'};
DOCS.passe05={title:'Salvo-conduto (Passierschein)',sub:'Intendência — Túnis',body:`O portador está autorizado a circular
entre o porto de La Goulette e o
depósito de Oued el-Kebir em serviço
da Intendência, a qualquer hora.

Válido até 30 de abril de 1943.
Carimbo e assinatura: Maj. A. Kessel`,pencil:'Vai servir para entrar no depósito.'};
DOCS.dossie05={title:'Dossiê de logística — combustível',sub:'Intendência · Tunísia · CONFIDENCIAL',body:`Comboio semanal de combustível
  La Goulette → estrada costeira → Oued el-Kebir
  Partida: quintas, 02h00 · 14 caminhões-tanque
  Escolta: 2 blindados leves, 1 caminhão de tropa

Depósito de Oued el-Kebir
  Tanques enterrados, ala norte
  Arsenal e livro de cifras no galpão B
  Troca de guarda: 06h00 · 18h00

Reserva para o setor sul: 9 dias.`,pencil:'A rota até a instalação de suprimentos. Londres precisa disto — e o depósito é o próximo alvo.'};
LEVELS['05']={id:'05',num:5,op:'Operação 5',name:'O Hotel da Medina',place:'Hôtel des Orangers, Túnis',prev:null,
  loadout:{weapons:['silenced','pistol'],ammo:{silenced:{mag:6,reserve:12},pistol:{mag:8,reserve:16}},cur:'silenced'},baseLight:.9,lightFn:light05,tropical:true,shadows:true,bloomTh:.93,
  build:buildLevel05,enemies:ENEMY_DEFS_05,ally:null,start:{x:-4.4,z:-12.4,yaw:Math.PI},startDocs:['planta05'],drawMap:drawMap05,
  reinf:[{id:'n1',x:-30,z:17,weapon:'smg',helmet:true},{id:'n2',x:-30,z:19.6,weapon:'rifle',helmet:true},{id:'n3',x:38,z:17,weapon:'rifle',helmet:true},{id:'n4',x:38,z:19.6,weapon:'smg',helmet:true}],
  radio:{x:-6,z:12.3,fx:-7.2,fz:13.1},radioRun:'O major corre para o rádio da recepção!',alarmPos:V3(-7.2,1.3,13.1),alarmText:'Alarme no Hôtel des Orangers! Caminhões fecham a Rue de la Kasbah.',alarmObjective:'alarm',
  alarmYes:'O alarme soou e a Rue de la Kasbah encheu de caminhões. ',alarmNo:'O rádio da recepção nunca chamou reforços. ',deathText:'A Feldgendarmerie encerrou a busca no Hôtel des Orangers.',
  objectives:objectives05,interact:interact05,pickups:pickups05,update:update05,restore:restore05,
  resultTitle:'A rota do comboio',outro:['YASMINA','Segure firme. Até La Marsa sem faróis — e depois, o depósito de Oued el-Kebir.'],menuCam:{cx:2,cz:-1,y:2.2,tx:0,tz:8},ambient:'medina',
  mist:{n:20,x0:-30,x1:38,z0:-28,z1:22,color:0xe8d8b8},
  briefing:{meta:'TÚNIS — 22 DE ABRIL DE 1943 — 16h20',paras:['Depois de Paris, Londres mandou Élise para o Norte da África, agora a serviço do OSS. Com papéis de correspondente suíça, ela está hospedada no Hôtel des Orangers, na medina de Túnis — dois andares abaixo do major Kessel, da Intendência alemã, que controla o combustível do setor sul.','Esta tarde a Feldgendarmerie fechou o saguão: procuram uma agente estrangeira. Antes de sair, Élise precisa do dossiê de logística de Kessel — a rota do comboio até o depósito de suprimentos. Yasmina, da rede local, espera com um carro na garagem do souk. Os quartos ficam no terraço, um andar acima do pátio; a rouparia tem uma escada de serviço para os telhados.'],list:['Entrar na suíte 12 — pela porta (chave na recepção) ou pela varanda do quarto 11','Revistar a suíte e abrir o cofre do major','Fugir pelos telhados ou pela rua até o carro de Yasmina']}};
LEVEL_ORDER.push('05');

window.__SDP5={heightAt,breakGlass,takeDossier05,segClear2D,findPath,explode,throwGrenade,hurtPlayer,VM,switchWeapon,scene,renderer,get MENU3D(){return MENU3D;},h2TorsoAt:(y)=>h2TorsoAt(y),HGRIP:HGRIP,demandSurrender:()=>demandSurrender(),surrenderTarget:()=>surrenderTarget(),yieldEnemy:(e)=>yieldEnemy(e),stanceCycle:()=>stanceCycle(),get AudioSys(){return AudioSys;},get MUS(){return MUS;}};