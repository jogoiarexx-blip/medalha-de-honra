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
  makeTextures(); makeTextures02(); makeTextures03(); makeMaterials(); FX.init(); buildViewmodels(); POST.init(); resize();
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
  window.__SDP={LEVELS,openBriefing,renderOps,get G(){return G;},W,APP,UI,startPlaying,resolveShot,settings,simStep,WEAPONS,camera,input,keys,goMenu,snapshot,openDoc};
}
boot();
