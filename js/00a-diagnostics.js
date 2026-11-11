'use strict';

/* =========================================================
   DIAGNÓSTICO E TELEMETRIA (REV-A/REV-B · P0-02, P1-12)
   DIAG  — registro de falhas com código, contexto e versão.
           Nada de tela preta silenciosa: cada fallback deixa
           um rastro identificável (console + painel F3).
   PERF  — tempos de quadro reais (p50/p95/p99, 1% low), custo
           da simulação e tempo de simulação descartado.
   Os números só existem depois de medidos; nada aqui é estimado.
   ========================================================= */
const BUILD_ID='rev-abc-2026-11-11';
const DIAG={
  log:[], seen:new Map(), max:40, errors:0,
  report(code,msg,err){
    const ctx={code,msg:String(msg||''),err:err?String(err&&err.message||err):'',t:Math.round(performance.now()),state:(typeof APP!=='undefined'&&APP.state)||'BOOT',level:(typeof G!=='undefined'&&G&&G.levelId)||null,build:BUILD_ID};
    this.log.push(ctx); if(this.log.length>this.max) this.log.shift();
    const n=(this.seen.get(code)||0)+1; this.seen.set(code,n);
    // mesma falha repetida não inunda o console: 1ª, 2ª, 3ª e depois a cada 50
    if(n<=3||n%50===0) console.warn('[Medalha:'+code+'] '+ctx.msg+(ctx.err?' — '+ctx.err:'')+(n>3?' (×'+n+')':''),{estado:ctx.state,fase:ctx.level,versao:BUILD_ID});
    return ctx;
  },
  // aviso discreto ao jogador (some sozinho); para o que muda o que ele vai ver
  notice(text,ms){
    let el=document.getElementById('diagToast');
    if(!el){ el=document.createElement('div'); el.id='diagToast'; el.setAttribute('role','status'); el.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:min(92vw,560px);padding:10px 16px;background:rgba(10,14,17,.92);color:#e6dfcc;border:1px solid rgba(217,164,65,.55);font:500 15px/1.35 "Barlow Condensed",system-ui,sans-serif;letter-spacing:.02em;z-index:60;pointer-events:none;opacity:0;transition:opacity .25s'; document.body.appendChild(el); }
    el.textContent=text; el.style.opacity='1'; clearTimeout(this._nt); this._nt=setTimeout(()=>{ el.style.opacity='0'; },ms||6000);
  },
  tail(n){ return this.log.slice(-(n||4)).map(c=>c.code+': '+c.msg+(c.err?' — '+c.err:'')).join('\n'); },
};
addEventListener('error',e=>{ DIAG.errors++; DIAG.report('JS_ERROR',(e.message||'erro')+(e.filename?' @ '+String(e.filename).split('/').pop()+':'+e.lineno:''),e.error); });
addEventListener('unhandledrejection',e=>{ DIAG.errors++; DIAG.report('JS_REJECTION','promessa rejeitada',e.reason); });

const PERF={
  N:600, ms:new Float32Array(600), i:0, n:0,
  droppedSimMs:0, droppedEvents:0, simSteps:0, simMs:0, simMsMax:0, renderMs:0, frames:0, longFrames:0,
  _sorted:new Float32Array(600),
  frame(ms){ this.ms[this.i]=ms; this.i=(this.i+1)%this.N; if(this.n<this.N) this.n++; this.frames++; if(ms>50) this.longFrames++; },
  drop(ms){ this.droppedSimMs+=ms; this.droppedEvents++; },
  stats(){
    const n=this.n; if(!n) return {samples:0,fps:0,p50:0,p95:0,p99:0,low1:0,max:0};
    const s=this._sorted.subarray(0,n); s.set(this.ms.subarray(0,n)); s.sort();
    let sum=0; for(let k=0;k<n;k++) sum+=s[k];
    const q=p=>s[Math.min(n-1,Math.floor(p*n))];
    const worst=Math.max(1,Math.floor(n*.01)); let ws=0; for(let k=n-worst;k<n;k++) ws+=s[k];
    return {samples:n,fps:1000/(sum/n),p50:q(.5),p95:q(.95),p99:q(.99),low1:1000/(ws/worst),max:s[n-1]};
  },
  reset(){ this.i=0; this.n=0; this.droppedSimMs=0; this.droppedEvents=0; this.simSteps=0; this.simMs=0; this.simMsMax=0; this.renderMs=0; this.frames=0; this.longFrames=0; },
  // retrato completo para o painel F3 e para os testes (window.__SDP.perf())
  snapshot(){
    const st=this.stats(), r=typeof renderer!=='undefined'?renderer:null;
    return Object.assign(st,{droppedSimMs:this.droppedSimMs,droppedEvents:this.droppedEvents,simSteps:this.simSteps,simMsAvg:this.frames?this.simMs/this.frames:0,simMsMax:this.simMsMax,renderMsAvg:this.frames?this.renderMs/this.frames:0,longFrames:this.longFrames,
      calls:r?r.info.render.calls:0,triangles:r?r.info.render.triangles:0,geometries:r?r.info.memory.geometries:0,textures:r?r.info.memory.textures:0,programs:r&&r.info.programs?r.info.programs.length:0,
      resScale:typeof RES_SCALE!=='undefined'?RES_SCALE.scale:1,quality:settings.quality,build:BUILD_ID});
  },
};
