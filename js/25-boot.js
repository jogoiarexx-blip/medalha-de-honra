'use strict';


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
// A trilha é a original sintetizada em Web Audio, sem depender de MP3.
// Navegadores bloqueiam reprodução automática antes de um gesto do usuário.
function unlockMedalhaAudio(){
  if(AudioSys.ctx && AudioSys.ctx.state==='running'){
    const btn=$('#bMusic'); if(btn) btn.hidden=true;
    return;
  }
  try{
    AudioSys.init();
    const c=AudioSys.ctx;
    if(!c){const b=$('#bMusic');if(b) b.textContent='Áudio indisponível neste navegador';return;}
    const ready=()=>{
      if(c.state!=='running') return;
      // Reinicia a fila de notas para não tocar eventos acumulados enquanto suspenso.
      if(MUS.ready) MUS.next=c.currentTime+.06;
      const btn=$('#bMusic'); if(btn) btn.hidden=true;
    };
    if(c.state==='running'){ready();return;}
    const p=c.resume();
    if(p&&typeof p.then==='function') p.then(ready).catch(()=>{});
    else ready();
  }catch(err){console.warn('Não foi possível ativar o áudio:',err);}
}

function boot(){
  sanitizeStoredData();
  makeTextures(); makeTextures02(); makeTextures03(); makeMaterials(); FX.init(); buildViewmodels(); POST.init(); resize();
  // Caches globais que a troca de missão nunca deve descartar (REV-C).
  RES.pin(()=>{ const out=[SOFTTEX,FLASHTEX,H2_HIDE,MZ.geo,MZ.hgeo,MZ.sgeo];
    for(const k in TEX) out.push(TEX[k]); for(const k in MAT){ const m=MAT[k]; if(m&&(m.isMaterial||m.isTexture)) out.push(m); }
    for(const k in HMAT) out.push(HMAT[k]); for(const k in DBG_MAT) out.push(DBG_MAT[k]);
    for(const m of H2.mat.values()) out.push(m); for(const g of H2.geo.values()) out.push(g); for(const k in H2.tex){ const t=H2.tex[k]; if(t&&t.isTexture) out.push(t); }
    for(const m of MZ.mat.values()) out.push(m); for(const g of MZ_FAR.geo.values()) out.push(g); out.push(MZ_FAR.mat);
    if(DOG_MATS) for(const k in DOG_MATS) out.push(DOG_MATS[k]); if(DOG_GEOS) for(const k in DOG_GEOS) out.push(DOG_GEOS[k]);
    return out; });
  // Perda do contexto WebGL: avisa em vez de congelar numa tela preta.
  canvas.addEventListener('webglcontextlost',e=>{ e.preventDefault(); DIAG.report('GL_CONTEXT_LOST','contexto de vídeo perdido'); DIAG.notice('O vídeo foi interrompido pelo sistema. Se a imagem não voltar, recarregue a página — o checkpoint está salvo.',12000); });
  canvas.addEventListener('webglcontextrestored',()=>{ DIAG.report('GL_CONTEXT_RESTORED','contexto de vídeo restaurado'); resize(); });
  bindOptions(); bindScreens(); syncOptions();
  // Os eventos em captura ocorrem antes do clique da interface, liberando
  // música do menu, efeitos e a trilha adaptativa de toda a campanha.
  addEventListener('pointerdown',unlockMedalhaAudio,{capture:true,passive:true});
  addEventListener('keydown',unlockMedalhaAudio,{capture:true,passive:true});
  $('#bMusic').addEventListener('click',unlockMedalhaAudio);
  if(matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints>0) setupTouch();
  $('#boot').remove();
  goMenu();
  requestAnimationFrame(frame);
  window.__SDP={DIAG,PERF,RES,SIM,RES_SCALE,POST,MENU3D,LEVEL_ORDER,SECRET_ORDER,validateCheckpoint,readStoredCheckpoint,startMission:startPlaying,perf:()=>PERF.snapshot(),build:BUILD_ID,LEVELS,openBriefing,renderOps,get G(){return G;},W,APP,UI,startPlaying,resolveShot,settings,simStep,WEAPONS,camera,input,keys,goMenu,snapshot,openDoc,Enemy,makeHuman,MZ,get scene(){return scene;}};
}
boot();
