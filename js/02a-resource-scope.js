'use strict';

/* =========================================================
   ESCOPO DE RECURSOS (REV-C · P0-03 / P0-04)
   Trocar de missão ou reconstruir a sala do menu removia os nós
   da cena sem liberar geometrias, materiais e texturas da GPU.
   Aqui o descarte é por "marca e varre":
     1. antes de desmontar, RES.collect() anota tudo o que a cena
        antiga usava;
     2. depois de montar a nova, RES.sweep() libera só o que não
        está mais em uso em nenhuma cena viva nem nos caches
        globais (RES.pin).
   Recurso compartilhado nunca fica rosa/preto: o que continua em
   uso não é tocado, e o Three.js reenvia sozinho à GPU qualquer
   recurso de cache que volte a ser usado depois.
   ========================================================= */
const RES={
  TEX_KEYS:['map','emissiveMap','normalMap','bumpMap','alphaMap','specularMap','lightMap','aoMap','envMap','displacementMap','gradientMap','roughnessMap','metalnessMap'],
  pins:[],            // funções que devolvem recursos de cache global (não descartar)
  stats:{sweeps:0,geometries:0,materials:0,textures:0,skeletons:0,targets:0,lastMs:0},
  newSet(){ return {g:new Set(),m:new Set(),t:new Set(),s:new Set(),rt:new Set(),o:new Set()}; },
  _mat(m,set){
    if(!m||set.m.has(m)) return; set.m.add(m);
    for(const k of this.TEX_KEYS){ const t=m[k]; if(t&&t.isTexture) set.t.add(t); }
    if(m.uniforms) for(const k in m.uniforms){ const v=m.uniforms[k]&&m.uniforms[k].value; if(v&&v.isTexture) set.t.add(v); }
  },
  collect(root,set){
    set=set||this.newSet(); if(!root) return set;
    if(root.background&&root.background.isTexture) set.t.add(root.background);
    root.traverse(o=>{
      if(o.geometry) set.g.add(o.geometry);
      const m=o.material; if(m){ if(Array.isArray(m)) for(const x of m) this._mat(x,set); else this._mat(m,set); }
      if(o.skeleton) set.s.add(o.skeleton);
      if(o.isLight&&o.shadow&&o.shadow.map) set.rt.add(o.shadow.map);
      if(o.isInstancedMesh) set.o.add(o);
    });
    return set;
  },
  pin(fn){ this.pins.push(fn); },
  // tudo o que está em uso agora: cenas vivas + caches globais
  live(){
    const s=this.newSet();
    if(typeof scene!=='undefined') this.collect(scene,s);
    if(typeof vmScene!=='undefined') this.collect(vmScene,s);
    if(typeof MENU3D!=='undefined'&&MENU3D.scene) this.collect(MENU3D.scene,s);
    for(const fn of this.pins){ let list; try{ list=fn(); }catch(e){ DIAG.report('RES_PIN','cache global ilegível',e); continue; }
      for(const r of list||[]){ if(!r) continue; if(r.isTexture) s.t.add(r); else if(r.isMaterial) this._mat(r,s); else if(r.isBufferGeometry) s.g.add(r); } }
    return s;
  },
  sweep(old){
    if(!old) return 0; const t0=performance.now(), live=this.live(), st=this.stats; let n=0;
    for(const g of old.g) if(!live.g.has(g)){ g.dispose(); st.geometries++; n++; }
    for(const m of old.m) if(!live.m.has(m)){ m.dispose(); st.materials++; n++; }
    for(const t of old.t) if(!live.t.has(t)){ t.dispose(); st.textures++; n++; }
    for(const k of old.s) if(!live.s.has(k)){ k.dispose(); st.skeletons++; n++; }
    for(const r of old.rt) if(!live.rt.has(r)){ r.dispose(); st.targets++; n++; }
    for(const o of old.o) if(!live.o.has(o)&&o.dispose) o.dispose();
    st.sweeps++; st.lastMs=performance.now()-t0; return n;
  },
  memory(){ const m=renderer.info.memory; return {geometries:m.geometries,textures:m.textures,programs:renderer.info.programs?renderer.info.programs.length:0}; },
};
