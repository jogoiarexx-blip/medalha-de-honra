'use strict';


/* =========================================================
   RENDERIZAÇÃO
   ========================================================= */
const canvas=$('#view');
const renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
renderer.autoClear=false; renderer.info.autoReset=false;
const scene=new T.Scene();
const vmScene=new T.Scene();
const camera=new T.PerspectiveCamera(75,1,.05,260); camera.rotation.order='YXZ';
scene.add(camera);
function resize(){
  const w=canvas.clientWidth||innerWidth, h=canvas.clientHeight||innerHeight;
  const q=QUALITY[settings.quality]||QUALITY.medio;
  renderer.setPixelRatio(q.pr()*RES_SCALE.scale); renderer.setSize(w,h,false);
  camera.aspect=w/h; camera.updateProjectionMatrix(); CAM_PROJ.fov=camera.fov; CAM_PROJ.aspect=camera.aspect;
  if(typeof POST!=='undefined'&&POST.ok) POST.setSize();
}
addEventListener('resize',resize);
// A matriz de projeção só é refeita quando FOV ou proporção mudam de verdade (P1-09).
const CAM_PROJ={fov:-1,aspect:-1};
function setCameraFov(fov){ if(Math.abs(fov-CAM_PROJ.fov)>.004||camera.aspect!==CAM_PROJ.aspect){ camera.fov=fov; camera.updateProjectionMatrix(); CAM_PROJ.fov=fov; CAM_PROJ.aspect=camera.aspect; } }
/* ---------- resolução adaptativa com histerese (REV-F · P1-06) ----------
   Mede o tempo real de quadro em janelas de 2 s. Se o jogo não sustenta o
   orçamento, reduz a escala de renderização um degrau; só volta a subir depois
   de várias janelas folgadas, e cada recaída alonga a espera (não fica oscilando).
   Nunca troca de resolução a cada quadro. Desligável em Opções. */
const RES_SCALE={scale:1,min:.6,stepDown:.1,stepUp:.05,winT:0,winN:0,winMs:0,goodWins:0,badWins:0,needGood:4,changes:0,lastChange:0,
  reset(){ this.scale=1; this.winT=0; this.winN=0; this.winMs=0; this.goodWins=0; this.badWins=0; this.needGood=4; },
  tick(dtMs,active){
    if(settings.autoRes===false||!active){ this.winT=0; this.winN=0; this.winMs=0; return; }
    this.winT+=dtMs; this.winN++; this.winMs+=dtMs; if(this.winT<2000) return;
    const avg=this.winMs/this.winN; this.winT=0; this.winN=0; this.winMs=0;
    // alvo: 60 fps em Médio/Alto, 30 fps como piso em Baixo
    const budget=settings.quality==='baixo'?33.4:16.7;
    if(avg>budget*1.3){ this.goodWins=0; if(++this.badWins>=2&&this.scale>this.min+1e-3){ this.badWins=0; this.apply(Math.max(this.min,this.scale-this.stepDown)); this.needGood=Math.min(30,this.needGood*2); } }
    else if(avg<budget*1.06){ this.badWins=0; if(++this.goodWins>=this.needGood&&this.scale<1-1e-3){ this.goodWins=0; this.apply(Math.min(1,this.scale+this.stepUp)); } }
    else { this.badWins=0; this.goodWins=0; }
  },
  apply(v){ this.scale=Math.round(v*100)/100; this.changes++; this.lastChange=performance.now(); resize(); },
};
const POST={ok:false,
  init(){
    try{
      this.cam=new T.OrthographicCamera(-1,1,1,-1,0,1); this.scene=new T.Scene(); this.quad=new T.Mesh(new T.PlaneGeometry(2,2)); this.quad.frustumCulled=false; this.scene.add(this.quad);
      const vs='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }';
      const sm=(u,fs)=>new T.ShaderMaterial({uniforms:u,vertexShader:vs,fragmentShader:fs,depthTest:false,depthWrite:false});
      this.bright=sm({tDiffuse:{value:null},threshold:{value:.6}},'uniform sampler2D tDiffuse; uniform float threshold; varying vec2 vUv; void main(){ vec3 c=texture2D(tDiffuse,vUv).rgb; float l=dot(c,vec3(.2126,.7152,.0722)); gl_FragColor=vec4(c*smoothstep(threshold,threshold+.3,l),1.); }');
      this.blur=sm({tDiffuse:{value:null},dir:{value:new T.Vector2()}},'uniform sampler2D tDiffuse; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 s=texture2D(tDiffuse,vUv).rgb*.227; s+=texture2D(tDiffuse,vUv+dir*1.385).rgb*.316; s+=texture2D(tDiffuse,vUv-dir*1.385).rgb*.316; s+=texture2D(tDiffuse,vUv+dir*3.23).rgb*.07; s+=texture2D(tDiffuse,vUv-dir*3.23).rgb*.07; gl_FragColor=vec4(s,1.); }');
      this.final=sm({tDiffuse:{value:null},tBloom:{value:null},bloom:{value:.9},time:{value:0},grain:{value:.03},vig:{value:1},hurt:{value:0},tint:{value:new T.Vector3(1,1,1)},sat:{value:1},con:{value:1}},
        'uniform sampler2D tDiffuse,tBloom; uniform float bloom,time,grain,vig,hurt,sat,con; uniform vec3 tint; varying vec2 vUv; float rnd(vec2 c){ return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453); } void main(){ vec3 c=texture2D(tDiffuse,vUv).rgb; c+=texture2D(tBloom,vUv).rgb*bloom; float l=dot(c,vec3(.2126,.7152,.0722)); c*=mix(vec3(.86,.95,1.14),vec3(1.07,1.,.88),smoothstep(.04,.55,l)); c=mix(vec3(l),c,1.06); c=c*1.08/(1.+c*.1); c=(c-.45)*con+.45; c=mix(vec3(dot(c,vec3(.2126,.7152,.0722))),c,sat); c*=tint; c=max(c,0.); vec2 d=vUv-.5; c*=clamp(1.-dot(d,d)*vig*1.5,0.,1.); c=mix(c,vec3(dot(c,vec3(.33)))*vec3(1.3,.5,.45),hurt); c+=(rnd(vUv*vec2(1311.,717.)+time)-.5)*grain; gl_FragColor=vec4(c,1.); }');
      this.ok=true; this.setSize();
    }catch(e){ this.ok=false; this.fail('POST_INIT','pós-processamento indisponível; imagem segue sem bloom e correção de cor',e); }
  },
  setSize(){
    if(!this.ok) return; const v=new T.Vector2(); renderer.getDrawingBufferSize(v); const w=Math.max(2,v.x|0), h=Math.max(2,v.y|0);
    const mk=(a,b,depth)=>new T.WebGLRenderTarget(a,b,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:depth});
    for(const k of ['rt','bA','bB']) if(this[k]) this[k].dispose();
    this.rt=mk(w,h,true); this.bw=Math.max(2,w>>2); this.bh=Math.max(2,h>>2); this.bA=mk(this.bw,this.bh,false); this.bB=mk(this.bw,this.bh,false);
  },
  // Falha de pós-processamento nunca vira tela preta: desliga a cadeia, registra e segue no render direto.
  fail(code,msg,err){ this.ok=false; DIAG.report(code,msg,err); if(!this.warned){ this.warned=true; DIAG.notice('Efeitos de imagem desligados neste aparelho (o jogo continua normalmente).'); } },
  // Passes de blur por perfil: Baixo 0 (cadeia desligada), Médio 1, Alto 2.
  blurPasses(){ return settings.quality==='alto'?2:1; },
  pass(mat,target){ this.quad.material=mat; renderer.setRenderTarget(target); renderer.render(this.scene,this.cam); },
  render(useVM,dt){
    renderer.setRenderTarget(this.rt); renderer.clear(); if(MENU3D.on) renderer.render(MENU3D.scene,MENU3D.cam); else renderer.render(scene,camera); if(useVM){ renderer.clearDepth(); renderer.render(vmScene,camera); }
    this.bright.uniforms.tDiffuse.value=this.rt.texture; this.bright.uniforms.threshold.value=MENU3D.on?.55:(G&&G.level&&G.level.bloomTh)||.6; this.pass(this.bright,this.bA);
    const NB=this.blurPasses(); this.passes=2+NB*2+1;
    for(let i=0;i<NB;i++){ this.blur.uniforms.tDiffuse.value=this.bA.texture; this.blur.uniforms.dir.value.set((i+1)/this.bw,0); this.pass(this.blur,this.bB); this.blur.uniforms.tDiffuse.value=this.bB.texture; this.blur.uniforms.dir.value.set(0,(i+1)/this.bh); this.pass(this.blur,this.bA); }
    const u=this.final.uniforms; u.tDiffuse.value=this.rt.texture; u.tBloom.value=this.bA.texture; u.time.value=(u.time.value+dt)%100; u.grain.value=settings.quality==='alto'?.04:.02; u.bloom.value=settings.quality==='alto'?1:.8;
    const GR=MENU3D.on?MENU3D.grade:G&&G.grade; if(GR){ u.tint.value.set(GR[0],GR[1],GR[2]); u.sat.value=GR[3]; u.con.value=GR[4]; } else { u.tint.value.set(1,1,1); u.sat.value=1; u.con.value=1; }
    const P=G&&G.player; u.hurt.value=P&&APP.state==='PLAYING'?clamp((40-P.hp)/40,0,1)*.32+(P.dead?.4:0):0;
    renderer.setRenderTarget(null); this.pass(this.final,null);
  }
};
function renderFrame(useVM,dt){
  renderer.info.reset();
  if(POST.ok&&settings.quality!=='baixo'){
    try{ POST.render(useVM,dt); return; }
    catch(e){ POST.fail('POST_RENDER','falha ao compor o quadro; pós-processamento desligado',e); renderer.setRenderTarget(null); }
  }
  renderer.setRenderTarget(null); renderer.clear(); if(MENU3D.on) renderer.render(MENU3D.scene,MENU3D.cam); else renderer.render(scene,camera); if(useVM){ renderer.clearDepth(); renderer.render(vmScene,camera); }
}

/* ---------- texturas procedurais ---------- */
function canvasTex(w,h,draw,meters){
  const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); draw(g,w,h);
  const t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.magFilter=T.NearestFilter; t.anisotropy=4;
  if(meters) t.repeat.set(1/meters,1/meters);
  return t;
}
const TEX={};
function makeTextures(){
  const R=mulberry32(1943);
  TEX.cobble=canvasTex(256,256,(g,w,h)=>{
    g.fillStyle='#2c2a27'; g.fillRect(0,0,w,h);
    for(let y=0;y<16;y++)for(let x=-1;x<17;x++){ const ox=(y%2)*8, v=48+R()*34|0; g.fillStyle=`rgb(${v+8},${v+5},${v})`; g.fillRect(x*16+ox+1,y*16+1,14,14); g.fillStyle='rgba(255,255,255,.05)'; g.fillRect(x*16+ox+2,y*16+2,11,3); }
  },4);
  const lit=[]; for(let r=0;r<4;r++){ lit[r]=[]; for(let c=0;c<4;c++) lit[r][c]=r<3 && R()<.22; }
  TEX.facade=canvasTex(512,512,(g)=>{
    g.fillStyle='#857d6d'; g.fillRect(0,0,512,512);
    for(let i=0;i<2600;i++){ const v=R(); g.fillStyle=v<.5?'rgba(0,0,0,.06)':'rgba(255,255,255,.04)'; g.fillRect(R()*512,R()*512,2+R()*5,2+R()*4); }
    for(let r=0;r<4;r++){
      const y0=r*128; g.fillStyle='rgba(0,0,0,.22)'; g.fillRect(0,y0+122,512,6); g.fillStyle='rgba(255,255,255,.07)'; g.fillRect(0,y0+120,512,2);
      for(let c=0;c<4;c++){
        const x0=c*128;
        if(r===3){ // térreo: portas e vitrines
          g.fillStyle='#3a2c22'; g.fillRect(x0+18,y0+30,92,98); g.fillStyle='#1a1d20'; g.fillRect(x0+26,y0+38,76,52); g.fillStyle='#4b392b'; g.fillRect(x0+26,y0+92,76,36); g.fillStyle='rgba(0,0,0,.4)'; g.fillRect(x0+62,y0+38,3,52);
        } else {
          g.fillStyle=R()<.5?'#3f4c3c':'#5a4433'; g.fillRect(x0+22,y0+26,16,72); g.fillRect(x0+90,y0+26,16,72);
          g.fillStyle='#d8cfbe'; g.fillRect(x0+38,y0+22,52,80);
          g.fillStyle=lit[r][c]?'#d6a24b':'#151a1f'; g.fillRect(x0+42,y0+26,44,72);
          g.fillStyle='rgba(60,50,40,.9)'; g.fillRect(x0+62,y0+26,3,72); g.fillRect(x0+42,y0+56,44,3);
          g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(x0+34,y0+100,60,6);
          g.fillStyle='#2b2d2c'; for(let k=0;k<6;k++) g.fillRect(x0+38+k*10,y0+104,2,14); g.fillRect(x0+36,y0+104,56,2);
        }
      }
    }
  },12.8);
  TEX.facadeEm=canvasTex(512,512,(g)=>{
    g.fillStyle='#000'; g.fillRect(0,0,512,512);
    for(let r=0;r<4;r++)for(let c=0;c<4;c++) if(lit[r][c]){ g.fillStyle='#ffbb62'; g.fillRect(c*128+42,r*128+26,44,72); g.fillStyle='#7a4a18'; g.fillRect(c*128+62,r*128+26,3,72); }
  },12.8);
  TEX.plaster=canvasTex(256,256,(g)=>{
    g.fillStyle='#8f856f'; g.fillRect(0,0,256,256);
    for(let i=0;i<900;i++){ g.fillStyle=R()<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.04)'; g.fillRect(R()*256,R()*256,3,3); }
    g.fillStyle='#4f3d2c'; g.fillRect(0,156,256,100); g.fillStyle='#3a2c20'; g.fillRect(0,154,256,4);
    for(let x=0;x<256;x+=32){ g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(x,160,2,96); }
  },2.56);
  TEX.wood=canvasTex(128,128,(g)=>{
    g.fillStyle='#6b5034'; g.fillRect(0,0,128,128);
    for(let i=0;i<4;i++){ g.fillStyle=i%2?'#5e462e':'#735638'; g.fillRect(0,i*32,128,30); g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(0,i*32+30,128,2); }
    g.strokeStyle='#3e2d1d'; g.lineWidth=6; g.strokeRect(3,3,122,122); g.beginPath(); g.moveTo(6,6); g.lineTo(122,122); g.stroke();
  },1);
  TEX.floorWood=canvasTex(128,128,(g)=>{ for(let i=0;i<8;i++){ g.fillStyle=i%2?'#4a3826':'#54402b'; g.fillRect(0,i*16,128,15); g.fillStyle='#2c2116'; g.fillRect(0,i*16+15,128,1);} },1.6);
  TEX.sandbag=canvasTex(128,128,(g)=>{
    g.fillStyle='#4c4632'; g.fillRect(0,0,128,128);
    for(let r=0;r<4;r++)for(let c=-1;c<3;c++){ const x=c*64+(r%2)*32, y=r*32; g.fillStyle=(r+c)%2?'#8a7f5c':'#7d7352'; g.beginPath(); g.ellipse(x+32,y+16,30,13,0,0,Math.PI*2); g.fill(); g.fillStyle='rgba(0,0,0,.18)'; g.fillRect(x+10,y+20,44,3); }
  },1);
  TEX.metal=canvasTex(128,128,(g)=>{ for(let x=0;x<128;x+=8){ g.fillStyle=(x/8)%2?'#55605c':'#46504c'; g.fillRect(x,0,8,128);} g.fillStyle='rgba(120,60,30,.35)'; g.fillRect(0,96,128,32); },1);
  TEX.concrete=canvasTex(128,128,(g)=>{ g.fillStyle='#4a4a46'; g.fillRect(0,0,128,128); for(let i=0;i<400;i++){ g.fillStyle=R()<.5?'rgba(0,0,0,.08)':'rgba(255,255,255,.04)'; g.fillRect(R()*128,R()*128,4,4);} g.fillStyle='rgba(20,15,10,.35)'; g.beginPath(); g.ellipse(70,60,30,18,.4,0,Math.PI*2); g.fill(); },3);
}
function makeTextures02(){
  const R=mulberry32(4302);
  TEX.grass=canvasTex(128,128,(g)=>{ g.fillStyle='#1f2618'; g.fillRect(0,0,128,128); for(let i=0;i<1400;i++){ const v=R(); g.fillStyle=v<.4?'#2c3520':v<.7?'#262d1c':v<.9?'#33301f':'#3c4528'; g.fillRect(R()*128,R()*128,2,2+R()*3); } },2.5);
  TEX.gravel=canvasTex(128,128,(g)=>{ g.fillStyle='#4a463e'; g.fillRect(0,0,128,128); for(let i=0;i<900;i++){ const v=60+R()*60|0; g.fillStyle=`rgb(${v},${v-4},${v-10})`; g.fillRect(R()*128,R()*128,2+R()*2,2+R()*2); } },1.2);
  TEX.cwall=canvasTex(128,128,(g)=>{ g.fillStyle='#3a3833'; g.fillRect(0,0,128,128); for(let y=0;y<8;y++)for(let x=-1;x<5;x++){ const ox=(y%2)*16, v=70+R()*30|0; g.fillStyle=`rgb(${v},${v-3},${v-8})`; g.fillRect(x*32+ox+1,y*16+1,30,14); } g.fillStyle='rgba(30,50,25,.3)'; for(let i=0;i<40;i++) g.fillRect(R()*128,R()*30,6,4); },2);
  TEX.mstone=canvasTex(128,128,(g)=>{ g.fillStyle='#77736a'; g.fillRect(0,0,128,128); for(let y=0;y<4;y++){ g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(0,y*32+30,128,2); for(let x=0;x<2;x++) g.fillRect(x*64+(y%2)*32,y*32,2,32); } for(let i=0;i<500;i++){ g.fillStyle=R()<.5?'rgba(0,0,0,.07)':'rgba(255,255,255,.05)'; g.fillRect(R()*128,R()*128,3,3); } g.fillStyle='rgba(20,30,15,.3)'; for(let i=0;i<30;i++) g.fillRect(R()*128,R()*20+100,5,6); },2);
  TEX.bones=canvasTex(128,128,(g)=>{ g.fillStyle='#1d1914'; g.fillRect(0,0,128,128);
    for(let y=0;y<8;y++){ const yy=y*16;
      if(y%3===1){ for(let x=0;x<8;x++){ const cx=x*16+8+(R()-.5)*2, cy=yy+8+(R()-.5)*2; g.fillStyle=R()<.5?'#6f654e':'#625944'; g.beginPath(); g.ellipse(cx,cy,6.5,7,0,0,Math.PI*2); g.fill(); g.fillStyle='#1d1914'; g.fillRect(cx-4,cy-1,3,3); g.fillRect(cx+1,cy-1,3,3); g.fillRect(cx-1,cy+3,2,2); } }
      else { for(let x=-1;x<6;x++){ const ox=x*26+(y*9)%26; g.fillStyle=R()<.5?'#6b614b':'#5c533f'; g.fillRect(ox+3,yy+5,20,6); g.beginPath(); g.arc(ox+3,yy+8,4,0,Math.PI*2); g.arc(ox+23,yy+8,4,0,Math.PI*2); g.fill(); } } }
  },1.4);
  TEX.tfloor=canvasTex(128,128,(g)=>{ g.fillStyle='#1e1b17'; g.fillRect(0,0,128,128); for(let i=0;i<700;i++){ const v=30+R()*25|0; g.fillStyle=`rgb(${v},${v-3},${v-6})`; g.fillRect(R()*128,R()*128,3,3); } },2);
}
function makeTextures03(){
  const R=mulberry32(4303);
  const grad=(top,bot)=>{ const c=document.createElement('canvas'); c.width=4; c.height=128; const g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,0,128); gr.addColorStop(0,top); gr.addColorStop(1,bot); g.fillStyle=gr; g.fillRect(0,0,4,128); return new T.CanvasTexture(c); };
  TEX.beamGrad=grad('#fff','#000'); TEX.beamGrad2=grad('#fff','#111');
  { const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); const rg=g.createRadialGradient(32,32,0,32,32,32); rg.addColorStop(0,'rgba(255,255,255,1)'); rg.addColorStop(.45,'rgba(255,255,255,.45)'); rg.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=rg; g.fillRect(0,0,64,64); SOFTTEX=new T.CanvasTexture(c); }
  { const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); const rg=g.createRadialGradient(32,32,0,32,32,30); rg.addColorStop(0,'rgba(255,250,220,1)'); rg.addColorStop(.3,'rgba(255,200,110,.9)'); rg.addColorStop(1,'rgba(255,140,40,0)'); g.fillStyle=rg; g.fillRect(0,0,64,64); g.strokeStyle='rgba(255,230,170,.9)'; g.lineWidth=3; for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+.3; g.beginPath(); g.moveTo(32,32); g.lineTo(32+Math.cos(a)*30,32+Math.sin(a)*30); g.stroke(); } FLASHTEX=new T.CanvasTexture(c); }
  TEX.lime=canvasTex(256,256,(g)=>{ g.fillStyle='#b9b09c'; g.fillRect(0,0,256,256); for(let y=0;y<8;y++)for(let x=-1;x<4;x++){ const ox=(y%2)*40, v=172+R()*22|0; g.fillStyle=`rgb(${v},${v-8},${v-24})`; g.fillRect(x*80+ox+2,y*32+2,76,28); } for(let i=0;i<900;i++){ g.fillStyle=R()<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.05)'; g.fillRect(R()*256,R()*256,3,3); } },3);
  TEX.slate=canvasTex(128,128,(g)=>{ g.fillStyle='#2a2e33'; g.fillRect(0,0,128,128); for(let y=0;y<8;y++)for(let x=-1;x<9;x++){ const v=40+R()*18|0; g.fillStyle=`rgb(${v},${v+3},${v+8})`; g.fillRect(x*16+(y%2)*8+1,y*16+1,14,14); } },1);
  TEX.wallpaper=canvasTex(128,128,(g)=>{ g.fillStyle='#1f3a30'; g.fillRect(0,0,128,128); g.fillStyle='rgba(180,150,80,.18)'; for(const [x,y] of [[32,32],[96,96],[96,32],[32,96]]){ g.beginPath(); g.ellipse(x,y,12,20,0,0,Math.PI*2); g.fill(); g.beginPath(); g.moveTo(x,y-28); g.lineTo(x+8,y); g.lineTo(x,y+28); g.lineTo(x-8,y); g.fill(); } g.fillStyle='rgba(200,170,90,.25)'; g.fillRect(0,0,2,128); g.fillRect(64,0,2,128); },1.2);
  TEX.parquet=canvasTex(128,128,(g)=>{ g.fillStyle='#4a3020'; g.fillRect(0,0,128,128); for(let y=-1;y<9;y++)for(let x=0;x<8;x++){ const v=R(); g.fillStyle=v<.33?'#5a3a24':v<.66?'#4d321f':'#634229'; if((x+y)%2){ g.fillRect(x*16,y*16,16,32); } else { g.fillRect(x*16,y*16+8,32,16); } } g.strokeStyle='rgba(0,0,0,.35)'; for(let i=0;i<128;i+=16){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,128); g.stroke(); } },1.2);
  TEX.marble=canvasTex(128,128,(g)=>{ for(let y=0;y<2;y++)for(let x=0;x<2;x++){ g.fillStyle=(x+y)%2?'#d8d2c6':'#1e1d1c'; g.fillRect(x*64,y*64,64,64); } g.strokeStyle='rgba(120,120,120,.3)'; for(let i=0;i<12;i++){ g.beginPath(); g.moveTo(R()*128,R()*128); g.bezierCurveTo(R()*128,R()*128,R()*128,R()*128,R()*128,R()*128); g.stroke(); } },1.6);
  TEX.carpet=canvasTex(128,128,(g)=>{ g.fillStyle='#5a1418'; g.fillRect(0,0,128,128); g.fillStyle='rgba(200,150,70,.35)'; for(let x=0;x<128;x+=32){ g.beginPath(); g.moveTo(x+16,10); g.lineTo(x+28,64); g.lineTo(x+16,118); g.lineTo(x+4,64); g.fill(); } for(let i=0;i<500;i++){ g.fillStyle='rgba(0,0,0,.08)'; g.fillRect(R()*128,R()*128,2,2); } },1.2);
  TEX.hedge=canvasTex(128,128,(g)=>{ g.fillStyle='#1b2a16'; g.fillRect(0,0,128,128); for(let i=0;i<1500;i++){ const v=R(); g.fillStyle=v<.3?'#2b4220':v<.6?'#233719':v<.85?'#355228':'#14200f'; g.beginPath(); g.arc(R()*128,R()*128,1.5+R()*2.5,0,Math.PI*2); g.fill(); } },1.4);
  TEX.books=canvasTex(128,128,(g)=>{ g.fillStyle='#2a1a10'; g.fillRect(0,0,128,128); for(let y=0;y<4;y++){ let x=0; while(x<128){ const w=4+R()*7|0; const hue=[0,25,200,120,40][R()*5|0]; g.fillStyle=`hsl(${hue},${30+R()*30}%,${18+R()*18}%)`; g.fillRect(x,y*32+4+R()*5,w-1,26); x+=w; } g.fillStyle='#1a1008'; g.fillRect(0,y*32+30,128,3); } },1.2);
  TEX.switchb=textTex(256,160,(g,w,h)=>{ g.fillStyle='#2a221a'; g.fillRect(0,0,w,h); g.fillStyle='#14110d'; g.fillRect(14,12,w-28,92); for(let y=0;y<6;y++)for(let x=0;x<14;x++){ g.fillStyle='#c8b070'; g.beginPath(); g.arc(28+x*15,24+y*14,3,0,Math.PI*2); g.fill(); } g.fillStyle='#3a2e22'; g.fillRect(10,110,w-20,40); for(let x=0;x<10;x++){ g.fillStyle='#111'; g.fillRect(24+x*21,118,6,18); } });
  TEX.dossier=textTex(128,96,(g,w,h)=>{ g.fillStyle='#c9a86a'; g.fillRect(0,0,w,h); g.fillStyle='#3a2a18'; g.font='bold 11px serif'; g.textAlign='center'; g.fillText('RÉSEAU « LAMPION »',w/2,30); g.font='9px serif'; g.fillText('Dossier n° 43/117',w/2,46); g.strokeStyle='#9a2a1b'; g.lineWidth=2; g.strokeRect(30,58,68,20); g.fillStyle='#9a2a1b'; g.font='bold 11px sans-serif'; g.fillText('SECRET',w/2,72); });
  TEX.listPaper=textTex(96,128,(g,w,h)=>{ g.fillStyle='#ddd4bc'; g.fillRect(0,0,w,h); g.fillStyle='#333'; for(let i=0;i<12;i++) g.fillRect(10,12+i*9,30+R()*45,2); });
  TEX.wallMap=textTex(512,224,(g,w,h)=>{ g.fillStyle='#d8ceb2'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(80,70,50,.35)'; for(let i=0;i<40;i++){ g.beginPath(); g.moveTo(R()*w,R()*h); g.lineTo(R()*w,R()*h); g.stroke(); } g.strokeStyle='#6a8aa8'; g.lineWidth=10; g.beginPath(); g.moveTo(0,70); g.bezierCurveTo(140,140,260,40,380,110); g.bezierCurveTo(430,140,470,120,512,100); g.stroke();
    g.fillStyle='#9a2a1b'; for(let i=0;i<14;i++){ const x=30+R()*450, y=20+R()*190; g.beginPath(); g.arc(x,y,5,0,Math.PI*2); g.fill(); g.font='10px sans-serif'; g.fillText('19/3',x+7,y+3); } g.fillStyle='#2a241b'; g.font='bold 16px serif'; g.fillText('PLAN DES OPÉRATIONS — SECTEUR SUD',14,h-12); });
}
let SOFTTEX=null, FLASHTEX=null;
function textTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new T.CanvasTexture(c); t.magFilter=T.NearestFilter; return t; }