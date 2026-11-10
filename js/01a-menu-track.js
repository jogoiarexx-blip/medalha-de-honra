'use strict';
// Música MP3 otimizada do menu; o sequenciador MUS fica reservado às fases.
(function(){
  const mp3={
    file:'audio/menu-principal.mp3',el:null,source:null,active:false,failed:false,error:null,
    init(ctx,bus){
      if(this.el||this.failed)return;
      try{
        const el=new Audio(this.file);el.preload='auto';el.loop=true;
        el.addEventListener('error',()=>{
          this.failed=true;this.active=false;this.error='Falha ao carregar MP3';
          console.warn('Música do menu indisponível: usando tema sintetizado.');
        });
        this.source=ctx.createMediaElementSource(el);this.source.connect(bus);this.el=el;
      }catch(err){this.failed=true;this.error=String(err);console.warn('Fallback musical do menu:',err);}
    },
    sync(want){
      if(!this.el||this.failed)return false;
      if(want&&!this.active){
        this.active=true;
        const playing=this.el.play();
        if(playing&&typeof playing.catch==='function')playing.catch(err=>{
          this.active=false;this.failed=true;this.error=String(err);
          console.warn('Fallback musical do menu após falha de reprodução:',err);
        });
      }else if(!want&&this.active){
        this.active=false;this.el.pause();
        try{this.el.currentTime=0;}catch(err){}
      }
      return want&&!this.failed;
    }
  };
  window.__MENU_PRINCIPAL_AUDIO=mp3;
  const initOriginal=AudioSys.init;
  AudioSys.init=function(...args){
    const result=initOriginal.apply(this,args);
    if(this.ctx){
      mp3.init(this.ctx,this.mus);
      if(APP.state==='MENU')mp3.sync(true); // dentro do gesto que libera o áudio
    }
    return result;
  };
  const updateOriginal=AudioSys.update;
  AudioSys.update=function(dt,combatTarget,tension){
    if(!this.ctx)return;
    const withMp3=mp3.sync(APP.state==='MENU');
    if(this._menuMp3Muted!==withMp3){
      this._menuMp3Muted=withMp3;
      if(MUS.ready){
        const now=this.ctx.currentTime;
        MUS.out.gain.cancelScheduledValues(now);
        MUS.out.gain.setTargetAtTime(withMp3?0:9,now,.09);
        MUS.next=now+.10; // impede acúmulo de eventos ao voltar às fases
      }
    }
    if(withMp3)return; // não tocar o tema antigo por cima da música nova
    return updateOriginal.call(this,dt,combatTarget,tension);
  };
})();
