'use strict';


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
function boot(){
  makeTextures(); makeTextures02(); makeTextures03(); makeMaterials(); FX.init(); buildViewmodels(); POST.init(); resize();
  bindOptions(); bindScreens(); syncOptions();
  if(matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints>0) setupTouch();
  $('#boot').remove();
  goMenu();
  requestAnimationFrame(frame);
  window.__SDP={LEVELS,openBriefing,renderOps,get G(){return G;},W,APP,UI,startPlaying,resolveShot,settings,simStep,WEAPONS,camera,input,keys,goMenu,snapshot,openDoc};
}
boot();
