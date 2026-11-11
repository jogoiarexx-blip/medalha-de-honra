'use strict';




/* =========================================================
   ENTRADA (teclado, mouse, controle, toque)
   ========================================================= */
const input={mx:0,mz:0,fire:false,firePressed:false,ads:false,adsToggled:false,sprint:false,crouchHeld:false,use:false,jumpPressed:false,reloadPressed:false,swapPressed:false,selectPressed:null};
const keys={};
const APP={state:'BOOT',locked:false,noLock:false,touch:false,debug:false,pad:null,padPrev:[]};
function edgeReset(){ input.firePressed=false; input.jumpPressed=false; input.reloadPressed=false; input.swapPressed=false; input.selectPressed=null; }
function playing(){ return APP.state==='PLAYING' && !UI.frozen(); }
addEventListener('keydown',e=>{
  if(e.code==='Tab'){ e.preventDefault(); if(APP.state==='PLAYING' && !UI.frozen()) toggleJournal(); return; }
  if(e.code==='F3'||e.code==='Backquote'){ e.preventDefault(); APP.debug=!APP.debug; $('#debug').hidden=!APP.debug; setDebugWire(APP.debug); return; }
  if(e.code==='Escape'){ if(UI.isOpen('doc')){ closeDoc(); return; } if(G&&G.camMode&&APP.state==='PLAYING'){ toggleCamera(); return; } if(UI.isOpen('cheats')&&APP.state==='PLAYING'){ UI.back(); applyCheatsVisual(); return; } if(UI.isOpen('options')||UI.isOpen('help')){ UI.back(); return; } if(UI.isOpen('journal')){ toggleJournal(); return; } if(APP.state==='PLAYING' && !UI.isOpen('pause') && !APP.locked) openPause(); return; }
  if(e.repeat) { keys[e.code]=true; return; }
  keys[e.code]=true;
  if(APP.state!=='PLAYING') return;
  if(UI.isOpen('doc')){ if(e.code==='KeyE') closeDoc(); return; }
  if(UI.frozen()) return;
  switch(e.code){
    case 'KeyR': input.reloadPressed=true; break;
    case 'KeyQ': input.swapPressed=true; break;
    case 'Digit1': input.selectPressed='pistol'; break;
    case 'Digit2': input.selectPressed='smg'; break;
    case 'Digit3': input.selectPressed='silenced'; break;
    case 'Digit4': input.selectPressed='pzf'; break;
    case 'Digit5': input.selectPressed='rifle'; break;
    case 'Digit6': input.selectPressed='xbow'; break;
    case 'KeyX': throwGrenade(); break;
    case 'KeyH': toggleHolster(); break;
    case 'KeyV': toggleCamera(); break;
    case 'Space': input.jumpPressed=true; e.preventDefault(); break;
    case 'KeyC': case 'ControlLeft': if(settings.crouchToggle) stanceCycle(); break;
    case 'KeyZ': proneToggle(); break;
    case 'KeyB': demandSurrender(); break;
    case 'KeyG': if(G.ally&&G.ally.joined) toggleAlly(); else throwGrenade(); break;
    case 'KeyF': toggleLantern(); break;
    case 'KeyT': throwPebble(); break;
    case 'KeyM': openMap(); break;
    case 'KeyI': if(G&&G.player&&!G.player.dead&&G.player.wpn.state!=='RELOAD'&&G.player.wpn.state!=='SWITCH') VM.inspectT=2.4; break;
  }
});
addEventListener('keyup',e=>{ keys[e.code]=false; });
addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; input.fire=false; if(APP.state==='PLAYING'&&!UI.frozen()&&!APP.touch) openPause(); });
canvas.addEventListener('mousedown',e=>{
  if(APP.state!=='PLAYING'||UI.frozen()) return;
  if(!APP.locked && !APP.noLock){ requestLock(); return; }
  if(e.button===0){ input.fire=true; input.firePressed=true; }
  if(e.button===2&&G&&G.camMode){ toggleCamera(); return; }
  if(e.button===2){ if(settings.adsToggle) input.adsToggled=!input.adsToggled; else input.ads=true; }
});
addEventListener('mouseup',e=>{ if(e.button===0) input.fire=false; if(e.button===2&&!settings.adsToggle) input.ads=false; });
canvas.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('wheel',e=>{ if(playing()&&Math.abs(e.deltaY)>4) input.swapPressed=true; },{passive:true});
addEventListener('mousemove',e=>{
  if(APP.state!=='PLAYING'||UI.frozen()||!G||G.player.dead) return;
  if(!APP.locked && !APP.noLock) return;
  const s=.0022*settings.sens*(G.player.adsT>.5?.65:1)*(G.player.adsT>.5&&WEAPONS[G.player.cur].scope?.3:1);
  G.player.yaw-=e.movementX*s; G.player.pitch+=(settings.invertY?1:-1)*e.movementY*s; G.player.pitch=clamp(G.player.pitch,-1.45,1.45);
});
function requestLock(){
  if(APP.touch) return;
  try{ const r=canvas.requestPointerLock(); if(r&&r.catch) r.catch(()=>{ APP.noLock=true; showHint('Captura do mouse indisponível: mova o mouse sobre a tela para olhar.'); }); }catch(e){ APP.noLock=true; }
}
function releaseLock(){ if(document.pointerLockElement) try{ document.exitPointerLock(); }catch(e){} }
document.addEventListener('pointerlockchange',()=>{
  APP.locked=document.pointerLockElement===canvas;
  if(APP.locked){ $('#resumeChip').hidden=true; return; }
  input.fire=false;
  if(APP.state!=='PLAYING') return;
  if(G&&G.camMode){ toggleCamera(); $('#resumeChip').hidden=false; return; }
  if(UI.isOpen('doc')||performance.now()-(APP.docClosedAt||0)<400){ if(UI.isOpen('doc')) closeDoc(); $('#resumeChip').hidden=false; return; }
  if(UI.isOpen('journal')){ toggleJournal(); $('#resumeChip').hidden=false; return; }
  if(!UI.isOpen('pause') && !UI.frozen()) openPause();
});
document.addEventListener('pointerlockerror',()=>{ APP.noLock=true; showHint('Captura do mouse indisponível: mova o mouse sobre a tela para olhar.'); });
$('#resumeChip').addEventListener('click',()=>{ requestLock(); $('#resumeChip').hidden=true; });

function pollKeyboard(){
  input.mx=(keys.KeyD?1:0)-(keys.KeyA?1:0); input.mz=(keys.KeyW?1:0)-(keys.KeyS?1:0);
  input.sprint=!!(keys.ShiftLeft||keys.ShiftRight); input.crouchHeld=!!(keys.KeyC||keys.ControlLeft); input.use=!!keys.KeyE;
  if(settings.adsToggle) input.ads=input.adsToggled;
}
function pollGamepad(dt){
  const pads=navigator.getGamepads?navigator.getGamepads():[]; const p=pads&&[...pads].find(x=>x&&x.connected); if(!p) return;
  const dz=v=>Math.abs(v)<.16?0:(v-Math.sign(v)*.16)/.84;
  const b=i=>p.buttons[i]&&(p.buttons[i].pressed||p.buttons[i].value>.4); const prev=APP.padPrev; const press=i=>b(i)&&!prev[i];
  const lx=dz(p.axes[0]||0), ly=dz(p.axes[1]||0), rx=dz(p.axes[2]||0), ry=dz(p.axes[3]||0);
  if(Math.abs(lx)+Math.abs(ly)>0){ input.mx=clamp(input.mx+lx,-1,1); input.mz=clamp(input.mz-ly,-1,1); }
  if(APP.state==='PLAYING'&&!UI.frozen()&&G&&!G.player.dead){
    const s=2.7*settings.sens*(G.player.adsT>.5?.55:1)*dt;
    G.player.yaw-=rx*Math.abs(rx)*s; G.player.pitch+=(settings.invertY?1:-1)*ry*Math.abs(ry)*s; G.player.pitch=clamp(G.player.pitch,-1.45,1.45);
    if(press(7)) input.firePressed=true; if(b(7)) input.fire=true; else if(prev[7]&&!b(7)) input.fire=false;
    if(b(6)) input.ads=true; else if(prev[6]&&!b(6)&&!settings.adsToggle) input.ads=false;
    if(press(2)) input.reloadPressed=true; if(press(3)) input.jumpPressed=true; if(press(4)) input.swapPressed=true; if(press(5)){ if(G.player.nades>0) throwGrenade(); else input.swapPressed=true; }
    if(press(1)) stanceCycle(); if(b(0)) input.use=true; if(press(10)) input.sprint=true; if(b(10)) input.sprint=true;
    if(press(11)) toggleCamera(); if(press(12)) toggleAlly(); if(press(13)) toggleLantern(); if(press(15)) throwPebble(); if(press(14)) openMap(); if(press(8)) toggleJournal(); if(press(9)) openPause();
  } else if(APP.state==='PLAYING'&&UI.isOpen('pause')&&press(9)) resumeGame();
  else if(UI.isOpen('doc')&&(press(0)||press(1))) closeDoc();
  APP.padPrev=p.buttons.map((x,i)=>b(i));
}
/* toque */
const touchState={move:null,look:null,fire:false,use:false};
function setupTouch(){
  APP.touch=true; APP.noLock=true; document.body.classList.add('is-touch');
  const stick=$('#tStick'), mz=$('#tMove'), lz=$('#tLook');
  mz.addEventListener('pointerdown',e=>{ touchState.move={id:e.pointerId,x:e.clientX,y:e.clientY}; stick.style.display='block'; const r=mz.getBoundingClientRect(); stick.style.left=(e.clientX-r.left-55)+'px'; stick.style.top=(e.clientY-r.top-55)+'px'; mz.setPointerCapture(e.pointerId); });
  mz.addEventListener('pointermove',e=>{ const m=touchState.move; if(!m||m.id!==e.pointerId) return; let dx=e.clientX-m.x, dy=e.clientY-m.y; const l=Math.hypot(dx,dy); if(l>50){ dx*=50/l; dy*=50/l; } stick.firstElementChild.style.transform=`translate(${dx}px,${dy}px)`; m.ax=dx/50; m.ay=dy/50; });
  const endMove=e=>{ if(touchState.move&&touchState.move.id===e.pointerId){ touchState.move=null; stick.style.display='none'; stick.firstElementChild.style.transform=''; } };
  mz.addEventListener('pointerup',endMove); mz.addEventListener('pointercancel',endMove);
  lz.addEventListener('pointerdown',e=>{ touchState.look={id:e.pointerId,x:e.clientX,y:e.clientY}; lz.setPointerCapture(e.pointerId); });
  lz.addEventListener('pointermove',e=>{ const l=touchState.look; if(!l||l.id!==e.pointerId||!G) return; const s=.0045*settings.sens; G.player.yaw-=(e.clientX-l.x)*s; G.player.pitch=clamp(G.player.pitch-(e.clientY-l.y)*s,-1.45,1.45); l.x=e.clientX; l.y=e.clientY; });
  const endLook=e=>{ if(touchState.look&&touchState.look.id===e.pointerId) touchState.look=null; };
  lz.addEventListener('pointerup',endLook); lz.addEventListener('pointercancel',endLook);
  document.querySelectorAll('#touch button').forEach(btn=>{
    const t=btn.dataset.t;
    btn.addEventListener('pointerdown',e=>{ e.preventDefault(); if(!G) return;
      if(t==='fire'){ touchState.fire=true; input.firePressed=true; } else if(t==='use') touchState.use=true;
      else if(t==='ads'){ input.adsToggled=!input.adsToggled; btn.classList.toggle('on',input.adsToggled); }
      else if(t==='reload') input.reloadPressed=true; else if(t==='swap') input.swapPressed=true;
      else if(t==='crouch'){ stanceCycle(); btn.classList.toggle('on',G.player.crouchOn||G.player.proneOn); }
      else if(t==='cam') toggleCamera(); else if(t==='lamp') toggleLantern(); else if(t==='stone') throwPebble(); else if(t==='nade') throwGrenade(); else if(t==='holster') toggleHolster(); else if(t==='map') openMap();
      else if(t==='ally') toggleAlly(); else if(t==='journal') toggleJournal(); else if(t==='pause') openPause();
      if(UI.isOpen('doc')&&t==='use') closeDoc();
    });
    const up=()=>{ if(t==='fire') touchState.fire=false; if(t==='use') touchState.use=false; };
    btn.addEventListener('pointerup',up); btn.addEventListener('pointercancel',up); btn.addEventListener('pointerleave',up);
  });
}
function pollTouch(){
  if(!APP.touch) return; const m=touchState.move; if(m&&m.ax!==undefined){ input.mx=clamp(input.mx+m.ax,-1,1); input.mz=clamp(input.mz-m.ay,-1,1); input.sprint=input.sprint||Math.hypot(m.ax,m.ay)>.95&&m.ay<-.8; }
  input.fire=touchState.fire; if(touchState.use) input.use=true; input.ads=input.adsToggled;
}

/* =========================================================
   INTERAÇÃO
   ========================================================= */
let curInteract=null, holdT=0, useLatch=false;
function updateInteraction(dt){
  const P=G.player; curInteract=null;
  if(P.dead){ $('#prompt').hidden=true; return; }
  const eye=camera.position, f=V3(0,0,-1).applyQuaternion(camera.quaternion);
  let best=null, bs=1e9;
  for(const it of W.interactables){
    const lbl=it.label(); if(!lbl) continue; const p=it.pt(); const d=eye.distanceTo(p); if(d>it.r) continue;
    const dir=V3().subVectors(p,eye).normalize(); const ang=Math.acos(clamp(dir.dot(f),-1,1));
    if(ang>.5 && d>1) continue;
    const skip=it.skipSolid?it.skipSolid():null;
    const blk=segFirst(eye.x,eye.y,eye.z,p.x,p.y,p.z,s=>s!==skip);
    if(blk && blk.t<.92 && !it.skip) continue;
    const sc=ang+d*.06; if(sc<bs){ bs=sc; best={it,lbl}; }
  }
  const pr=$('#prompt');
  if(!best){ pr.hidden=true; holdT=0; useLatch=input.use; return; }
  curInteract=best.it; pr.hidden=false; $('#promptText').textContent=best.lbl; pr.classList.toggle('locked',!!(best.it.locked&&best.it.locked()));
  $('#promptKey').textContent=APP.touch?'USAR':'E';
  const need=best.it.hold?best.it.hold():0;
  if(input.use){
    if(need>0){ holdT+=dt; $('#holdBar').style.width=Math.min(100,holdT/need*100)+'%'; if(holdT>=need&&!useLatch){ useLatch=true; holdT=0; best.it.use(); } }
    else if(!useLatch){ useLatch=true; best.it.use(); }
  } else { holdT=0; useLatch=false; $('#holdBar').style.width='0%'; }
}
function toggleAlly(){
  const A=G&&G.ally; if(!A||!A.joined||A.downed) return;
  if(A.mode==='FOLLOW'){ A.mode='WAIT'; A.waitPos={x:A.pos.x,z:A.pos.z}; G.radioMsg(A.nm,'Fico aqui. Chame quando precisar.'); }
  else { A.mode='FOLLOW'; G.radioMsg(A.nm,'Estou com você.'); }
}

/* =========================================================
   UI: pilha de telas, HUD, documentos
   ========================================================= */
const UI={
  stack:[], FREEZE:new Set(['pause','doc','options','help','cheats']),
  el(id){ return $('#'+(id==='doc'?'docView':id)); },
  show(id){ const el=this.el(id); if(el.classList.contains('screen')) for(const o of this.stack){ const oe=this.el(o); if(oe.classList.contains('screen')) oe.hidden=true; } el.hidden=false; this.stack=this.stack.filter(x=>x!==id); this.stack.push(id); const f=el.querySelector('button:not([hidden])'); if(f&&id!=='doc'&&id!=='journal') setTimeout(()=>f.focus({preventScroll:true}),30); },
  hide(id){ this.el(id).hidden=true; this.stack=this.stack.filter(x=>x!==id); },
  isOpen(id){ return this.stack.includes(id); },
  frozen(){ return this.stack.some(x=>this.FREEZE.has(x)); },
  back(){ const top=this.stack[this.stack.length-1]; if(!top) return; this.hide(top); const nt=this.stack[this.stack.length-1]; if(nt) this.show(nt); },
  closeAll(){ for(const id of [...this.stack]) this.hide(id); },
};
function openDoc(id){
  const d=DOCS[id]; if(!d) return; if(!G.docs.includes(id)) G.docs.push(id);
  $('#docPaper').innerHTML=`<h3></h3><div class="sub"></div><pre></pre>${d.pencil?'<div class="pencil"></div>':''}`;
  const pp=$('#docPaper');
  if(d.map&&LEVELS[d.map]&&LEVELS[d.map].drawMap){ const c=document.createElement('canvas'); c.width=640; c.height=640; LEVELS[d.map].drawMap(c.getContext('2d'),640,640); pp.querySelector('pre').replaceWith(c); }
  pp.querySelector('h3').textContent=d.title; pp.querySelector('.sub').textContent=d.sub; if(pp.querySelector('pre')) pp.querySelector('pre').textContent=d.body; if(d.pencil) pp.querySelector('.pencil').textContent=d.pencil;
  UI.show('doc'); input.fire=false; useLatch=true;
}
function closeDoc(){ $('#docView').hidden=true; UI.stack=UI.stack.filter(x=>x!=='doc'); useLatch=true; APP.docClosedAt=performance.now(); }
function toggleJournal(){
  if(!G) return;
  if(UI.isOpen('journal')){ UI.hide('journal'); return; }
  $('#jObj').innerHTML=''; for(const o of G.objectives){ if(o.state==='hidden') continue; const li=document.createElement('li'); li.textContent=o.text+(o.state==='failed'?' — falhou':''); li.className=(o.state==='done'?'done':o.state==='failed'?'failed':'')+(o.optional?' opt':''); $('#jObj').appendChild(li); }
  $('#jDocs').innerHTML=''; if(!G.docs.length){ const li=document.createElement('li'); li.textContent='Nenhum documento'; li.style.color='var(--dim)'; $('#jDocs').appendChild(li); }
  for(const id of G.docs){ const li=document.createElement('li'); li.textContent=DOCS[id].title; $('#jDocs').appendChild(li); const p=document.createElement('li'); p.style.cssText='padding-left:22px;color:var(--dim);font-size:14px;white-space:pre-wrap'; p.textContent=DOCS[id].body.split('\n').slice(0,3).join('\n')+' …'; $('#jDocs').appendChild(p); }
  UI.show('journal');
}
function openPause(){
  if(APP.state!=='PLAYING'||UI.isOpen('pause')) return;
  releaseLock(); input.fire=false; $('#resumeChip').hidden=true;
  const o=currentObjective(); $('#pauseObj').textContent=o?'Objetivo: '+o.text:'Pausa';
  $('#bCheckpoint').hidden=!G.cp; UI.show('pause');
}
function resumeGame(){ input.fire=false; input.firePressed=false; UI.hide('pause'); if(!APP.noLock) requestLock(); }
let radioCur=null, radioT=0;
function rebuildRadioUI(){ $('#radio').innerHTML=''; radioCur=null; radioT=0; }
function updateRadio(dt){
  radioT-=dt;
  if(radioCur && radioT<=0){ radioCur.remove(); radioCur=null; }
  if(!radioCur && G.radioQ.length){
    const m=G.radioQ.shift(); const el=document.createElement('div'); el.className='line '+(m.cls||''); const w=document.createElement('span'); w.className='who'; w.textContent=m.who; el.appendChild(w); el.appendChild(document.createTextNode(m.text));
    $('#radio').appendChild(el); radioCur=el; radioT=2.6+m.text.length*.045; if(m.who!=='DICA') AudioSys.play('radio');
  }
}
function pickupMsg(t){ const el=document.createElement('div'); el.textContent=t; const box=$('#pickups'); box.appendChild(el); while(box.children.length>3) box.firstChild.remove(); setTimeout(()=>el.remove(),2200); }
let hintTimer=0; function showHint(t){ const h=$('#hint'); h.textContent=t; h.hidden=false; clearTimeout(hintTimer); hintTimer=setTimeout(()=>h.hidden=true,4500); }
let headTagT=0; function headTag(){ const el=$('#hsTag'); el.textContent='Na cabeça'; el.className=''; el.hidden=false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); clearTimeout(headTagT); headTagT=setTimeout(()=>el.hidden=true,900); }
function hitMarker(kind){ if(!settings.hitmarkers) return; const h=$('#hitmarker'); h.className=''; void h.offsetWidth; h.className=kind+' show'; }
const dmgArcs=[]; function showDamageArc(bearing){
  let el=dmgArcs.find(a=>!a.busy); if(!el){ const d=document.createElement('div'); d.className='dmgArc'; $('#dmgLayer').appendChild(d); el={el:d,busy:false}; dmgArcs.push(el); if(dmgArcs.length>4) {} }
  el.busy=true; el.bearing=bearing; el.el.style.opacity=1; setTimeout(()=>{ el.el.style.opacity=0; setTimeout(()=>el.busy=false,450); },500);
}
function refreshObjectiveUI(flash){
  if(!G) return; const o=currentObjective(); const el=$('#objective');
  el.innerHTML=''; if(o){ const s=document.createElement('small'); s.textContent='Objetivo'; el.appendChild(s); el.appendChild(document.createTextNode(o.text)); }
  el.hidden=!o; if(flash){ el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); G.hud.objT=5; }
}
const cmp=$('#compass').getContext('2d');
const LABELS=['N','NE','L','SE','S','SO','O','NO'];
function drawCompass(){
  const c=cmp, Wc=c.canvas.width, H=c.canvas.height, P=G.player; c.clearRect(0,0,Wc,H);
  const heading=-P.yaw, span=Math.PI*.5, k=Wc/2/span;
  c.fillStyle='rgba(10,14,17,.5)'; c.fillRect(0,10,Wc,26);
  c.textAlign='center'; c.textBaseline='middle';
  for(let i=0;i<24;i++){ const a=i*15*DEG, rel=angDiff(heading,a); if(Math.abs(rel)>span) continue; const x=Wc/2+rel*k; const major=i%3===0;
    c.globalAlpha=1-Math.abs(rel)/span*.75; c.fillStyle='#e6dfcc';
    if(major){ c.font='600 15px "Barlow Condensed",sans-serif'; c.fillStyle=i===0?'#e9aa40':'#e6dfcc'; c.fillText(LABELS[i/3],x,23); } else c.fillRect(x-.5,18,1,10); }
  c.globalAlpha=1;
  const o=currentObjective();
  if(o&&o.marker&&settings.hud!=='cinematic'&&(!o.needs||G.flags[o.needs])){ const b=Math.atan2(o.marker.x-P.pos.x,-(o.marker.z-P.pos.z)); let rel=angDiff(heading,b); const off=Math.abs(rel)>span; rel=clamp(rel,-span,span); const x=Wc/2+rel*k;
    c.fillStyle='#e9aa40'; c.beginPath(); if(off){ const s=Math.sign(rel); c.moveTo(x-s*2,6); c.lineTo(x-s*10,1); c.lineTo(x-s*10,11); } else { c.moveTo(x,2); c.lineTo(x+5,7); c.lineTo(x,12); c.lineTo(x-5,7); } c.fill();
    if(!off){ const d=Math.hypot(o.marker.x-P.pos.x,o.marker.z-P.pos.z); c.font='500 11px "Barlow Condensed",sans-serif'; c.fillText(Math.round(d)+' m',x,43); } }
  for(const m of G.dmgMarks){ let rel=angDiff(heading,m.b); rel=clamp(rel,-span,span); const x=Wc/2+rel*k; c.fillStyle=`rgba(207,74,49,${Math.min(1,m.t)})`; c.fillRect(x-10,10,20,4); c.fillRect(x-10,32,20,4); }
  c.fillStyle='#e6dfcc'; c.fillRect(Wc/2-1,8,2,4);
}
function updateHUD(dt){
  const P=G.player, w=WEAPONS[P.cur], a=P.ammo[P.cur], preset=settings.hud;
  G.hud.healthT-=dt; G.hud.ammoT-=dt; G.hud.objT=(G.hud.objT||0)-dt;
  for(const m of G.dmgMarks) m.t-=dt; G.dmgMarks=G.dmgMarks.filter(m=>m.t>0);
  const inCombat=G.combatT>0, tab=UI.isOpen('journal');
  const showH=preset==='classic'||tab||(preset==='dynamic'&&(G.hud.healthT>0||inCombat||P.hp<35))||(preset==='cinematic'&&(P.hp<25));
  const showA=preset==='classic'||tab||(preset==='dynamic'&&(G.hud.ammoT>0||inCombat||P.wpn.state==='RELOAD'))||(preset==='cinematic'&&a.mag===0);
  $('#healthPanel').classList.toggle('is-faded',!showH); $('#ammoPanel').classList.toggle('is-faded',!showA);
  $('#compass').classList.toggle('is-faded',preset==='cinematic'&&!tab);
  $('#compass').style.opacity=(preset==='dynamic'&&!inCombat&&!tab&&G.hud.objT<=0)?.55:'';
  $('#objective').classList.toggle('is-faded',!(preset==='classic'||tab||G.hud.objT>0));
  $('#hpNum').textContent=Math.ceil(P.hp); $('#hpBar').style.width=P.hp+'%'; $('#healthPanel').classList.toggle('low',P.hp<35);
  $('#gem').style.opacity=(.15+P.light*.85).toFixed(2);
  $('#magNum').textContent=a.mag; $('#resNum').textContent=a.reserve; $('#wName').textContent=w.name; $('#wMode').textContent=w.mode;
  $('#wStat').textContent=P.wpn.state==='RELOAD'?'Recarregando':P.wpn.state==='SWITCH'?'Trocando':a.mag===0&&a.reserve===0?'Sem munição':a.mag===0?'Recarregue (R)':P.wpn.wallBlock?'Arma obstruída':'';
  const vg=$('#vignette'); vg.style.opacity=P.hp<35?'':0; vg.classList.toggle('pulse',P.hp<35&&settings.shake); if(P.hp<35&&!settings.shake) vg.style.opacity=.5;
  // retículo
  const ch=$('#crosshair'); const showC=P.adsT<.6&&!P.dead&&!G.camMode;
  if(G.camMode){ const c=photoCandidate(); const lb=$('#camLabel'); if(c&&c.ok){ lb.textContent=c.t.label.replace(' (cópia da mesa)','')+' — enquadrado, clique para fotografar'; lb.className='ok'; } else if(c){ lb.textContent=c.t.label.replace(' (cópia da mesa)','')+' — '+c.reason.toLowerCase(); lb.className=''; } else { lb.textContent='Nenhum alvo de interesse'; lb.className='none'; } } ch.style.display=showC?'':'none';
  if(showC){ const sp=currentSpread()*DEG; const px=Math.tan(sp)/Math.tan(camera.fov*DEG/2)*(canvas.clientHeight/2); ch.style.setProperty('--gap',(4+px).toFixed(1)+'px'); ch.classList.toggle('blocked',P.wpn.wallBlock); }
  // alerta
  let sus=0, cbt=false; for(const e of G.enemies){ if(e.dead) continue; if((e.state==='COMBAT'||e.state==='RADIO')&&e.lostT<5) cbt=true; sus=Math.max(sus,e.awareness*(e.state==='INVESTIGATE'||e.state==='SEARCH'?1:.8)); if(e.state==='SEARCH') sus=Math.max(sus,.6); }
  const chip=$('#alertChip'); if(cbt){ chip.hidden=false; chip.className='chip cbt'; chip.textContent='Combate'; } else if(sus>.3){ chip.hidden=false; chip.className='chip sus'; chip.textContent=G.alarm?'Alarme · busca':'Suspeita'; } else chip.hidden=true;
  // aliado
  $('#lampTag').hidden=!P.lantern; { const st=surrenderTarget(); const el=$('#surrHint'); if(el.hidden!==!st) el.hidden=!st; if(st){ const q=!(st.state==='COMBAT'||st.state==='RADIO')&&Math.hypot(P.pos.x-st.pos.x,P.pos.z-st.pos.z)<4.5; const tx=q?'Render em silêncio':'Mãos ao alto! (grita)'; if(el.dataset.t!==tx){ el.dataset.t=tx; el.innerHTML='<kbd>B</kbd> '+tx; } } } { const st=P.prone>.5?'Deitada':P.crouch>.5?'Agachada':''; const el=$('#stanceTag'); if(el.textContent!==st){ el.textContent=st; el.hidden=!st; } }
  const A=G.ally, ac=$('#allyChip'); ac.hidden=!(A&&(A.joined||A.downed));
  if(!ac.hidden){ ac.classList.toggle('down',A.downed); $('#allyText').textContent=A.downed?`${A.nmT} no chão · ${Math.ceil(A.downT)} s`:`${A.nmT} · ${A.mode==='FOLLOW'?'seguindo':'aguardando'}`; $('#allyHp').style.width=(A.hp/A.maxHp*100)+'%'; ac.classList.toggle('is-faded',preset==='cinematic'&&!A.downed&&!tab); }
  for(const d of dmgArcs) if(d.busy){ const rel=angDiff(-P.yaw,d.bearing); d.el.style.transform=`rotate(${rel}rad)`; }
  drawCompass(); updateRadio(dt); updateHUD04(dt); updateHUD06(dt); updateHUD07(dt); updateTouchButtons();
}

/* =========================================================
   DEPURAÇÃO (F3)
   ========================================================= */
const DBG_MAT={};
function setDebugWire(on){
  if(!G) return;
  const col=r=>r==='head'||r==='neck'?0xff4040:r==='equipment'?0x40ff60:/arm|hand/.test(r)?0x4090ff:/thigh|shin|foot/.test(r)?0xc060ff:0xffe040;
  for(const a of G.actors) for(const m of a.h.hitMeshes){ if(on){ m.userData.mat0=m.userData.mat0||m.material; const c=col(m.userData.region); m.material=DBG_MAT[c]||(DBG_MAT[c]=new T.MeshBasicMaterial({color:c,wireframe:true})); } else if(m.userData.mat0) m.material=m.userData.mat0; }
}
function logShot(o,ch,region,raw,final,ev){ if(!G) return; G.lastShot={id:G.shotId,target:ch?ch.id:'—',region,raw:raw.toFixed?raw.toFixed(1):raw,final:final.toFixed?final.toFixed(1):final,ev,hp:ch?Math.max(0,ch.hp).toFixed(0):'—'}; }
function lastShotLog(t){ if(G&&G.lastShot) G.lastShot.ev=(G.lastShot.ev?G.lastShot.ev+' · ':'')+t; }
let fpsAcc=0,fpsN=0,fpsShow=0,frameMax=0,dbgT=0;
function updateDebug(dt){
  fpsAcc+=dt; fpsN++; frameMax=Math.max(frameMax,dt); if(fpsAcc>.5){ fpsShow=fpsN/fpsAcc; fpsAcc=0; fpsN=0; }
  if(!APP.debug||!G) return;
  const s=G.lastShot, counts={}; for(const e of G.enemies) counts[e.state]=(counts[e.state]||0)+1;
  const props=W.props.filter(p=>!p.removed);
  if(fpsAcc!==0&&dbgT++%6!==0) return;      // o painel não precisa ser reescrito a cada quadro
  const pf=PERF.snapshot(), mz=typeof MZ!=='undefined'?MZ:null;
  $('#debug').textContent=`FPS ${fpsShow.toFixed(0)}  pior quadro ${(frameMax*1000).toFixed(0)} ms  ·  ${BUILD_ID}
quadro p50 ${pf.p50.toFixed(1)}  p95 ${pf.p95.toFixed(1)}  p99 ${pf.p99.toFixed(1)} ms  ·  1% low ${pf.low1.toFixed(0)} fps  (${pf.samples} amostras)
simulação ${pf.simMsAvg.toFixed(2)} ms/quadro (pico ${pf.simMsMax.toFixed(1)})  ·  render ${pf.renderMsAvg.toFixed(2)} ms  ·  passos ${SIM.lastSteps}
tempo de simulação descartado ${pf.droppedSimMs.toFixed(0)} ms em ${pf.droppedEvents} evento(s)
draw calls ${renderer.info.render.calls}  tri ${renderer.info.render.triangles}
GPU: geometrias ${pf.geometries}  texturas ${pf.textures}  programas ${pf.programs}  ·  liberados ${RES.stats.geometries}g/${RES.stats.textures}t em ${RES.stats.sweeps} troca(s)
perfil ${settings.quality}  escala ${Math.round(RES_SCALE.scale*100)}%${settings.autoRes===false?' (fixa)':''}  pós ${POST.ok&&settings.quality!=='baixo'?(POST.passes||0)+' passes':'desligado'}
IA ${AI_BUDGET.ms.toFixed(2)} ms/passo (pico ${AI_BUDGET.peak.toFixed(1)}, orçamento ${AI_BUDGET.budget})  intervalo distante ×${AI_BUDGET.far.toFixed(2)}
soldado 3D: ${mz?mz.tex.size+' atlas, '+mz.paints+' pinturas ('+mz.latePaints+' em combate)':'—'}  LOD longe ${typeof LOD_STATS!=='undefined'?LOD_STATS.far:0}/${G.actors.length}
${DIAG.log.length?'diagnóstico:\n'+DIAG.tail(3):'diagnóstico: sem ocorrências'}
objetos físicos ${props.length} (capacetes ${props.filter(p=>p.kind==='helmet').length})
luz no jogador ${G.player.light.toFixed(2)}
IA: ${Object.entries(counts).map(([k,v])=>k+' '+v).join(' · ')}
— último disparo —
id ${s?s.id:'—'}  alvo ${s?s.target:'—'}
região ${s?s.region:'—'}
dano bruto ${s?s.raw:'—'}  final ${s?s.final:'—'}  hp ${s?s.hp:'—'}
${s&&s.ev?s.ev:''}`;
  if(fpsAcc===0) frameMax=0;
}

/* =========================================================
   LAÇO PRINCIPAL
   ========================================================= */
let acc=0, last=performance.now(), menuT=0;
function simStep(dt){
  simTime+=dt; matricesFresh=false; cheatTick(); motesTick(dt);
  const ai0=performance.now();
  for(const e of G.enemies) e.update(dt);
  if(G.ally) G.ally.update(dt);
  AI_BUDGET.sample(performance.now()-ai0);
  matricesFresh=false;
  updatePlayer(dt);
  updateProps(dt); updateNades(dt); updateRockets(dt); updateBolts(dt); updateDoors(dt); updatePickups(); updateMission(dt); updateInteraction(dt);
  edgeReset();
}
function updateCamera(dt){
  const P=G.player;
  const eyeH=pStance(CFG.player.eye,CFG.player.eyeCrouch,.42)+(P.prone>.5?Math.sin(P.bob*.5)*.015*clamp(Math.hypot(P.vx,P.vz),0,1):0)-(P.dead?Math.min(1.3,P.deadT*1.4):0);
  const bob=settings.bob&&P.onGround?Math.sin(P.bob*2)*.03*clamp(Math.hypot(P.vx,P.vz)/3,0,1)*(1-P.adsT*.8):0;
  // posição de desenho interpolada entre o passo anterior e o atual (sem interpolar em teleporte)
  let cx=P.pos.x, cy=(P.ys!=null?P.ys:P.pos.y), cz=P.pos.z;
  if(SIM.interp&&_prevP.ok&&SIM.alpha<1){ const dx=cx-_prevP.x, dy=cy-_prevP.y, dz=cz-_prevP.z; if(dx*dx+dy*dy+dz*dz<1){ const a=SIM.alpha; cx=_prevP.x+dx*a; cy=_prevP.y+dy*a; cz=_prevP.z+dz*a; } }
  camera.position.set(cx,cy+eyeH+bob,cz);
  const sh=settings.shake?P.shake:0;
  camera.rotation.set(P.pitch+(Math.random()-.5)*.012*sh,P.yaw+(Math.random()-.5)*.012*sh,P.dead?Math.min(1.1,P.deadT):0);
  const w=WEAPONS[P.cur]; setCameraFov(G.camMode?38:lerp(settings.fov,w.fovADS*settings.fov/75,P.adsT));
}
const _vmBase=new T.Vector3(), _vmFwd=new T.Vector3();   // vetores de rascunho: nada de alocação por quadro
function updateViewmodel(dt){
  const P=G.player, m=VM.models[P.cur]; if(!m) return;
  VM.root.position.copy(camera.position); VM.root.quaternion.copy(camera.quaternion);
  VM.root.visible=!P.dead&&!P.holster&&!scoped();
  VM.kick=lerp(VM.kick,0,1-Math.exp(-dt*14)); VM.kickRot=lerp(VM.kickRot,0,1-Math.exp(-dt*12));
  const s=P.wpn; let lower=0, rotZ=0, rotX=0; { const crawl=(P.prone||0)*clamp(Math.hypot(P.vx,P.vz)/.8,0,1)*(1-P.adsT); lower+=crawl*.55; rotZ+=Math.sin(P.bob*.5)*.12*crawl; }
  if(s.state==='SWITCH') lower=s.t<.28?s.t/.28:1-(s.t-.28)/.28;
  if(P.sprinting){ lower=Math.max(lower,.35); rotZ=.35; }
  if(s.wallBlock){ lower=Math.max(lower,.45); rotX=.6; }
  if(s.state==='RELOAD'){ const w=WEAPONS[P.cur]; const tt=s.t/w.reload.end; const k=Math.sin(Math.min(1,tt)*Math.PI); lower=Math.max(lower,k*.4); rotZ=k*.6; rotX=-k*.2;
    m.mag.visible=P.cur==='pzf'?!!s.ev.in:(s.ev.out&&!s.ev.in ? true : P.cur==='smg');
    if(P.cur==='smg'){ m.mag.position.copy(m.magHome); if(s.ev.out&&!s.ev.in) m.mag.position.x-=.25; }
    else { m.mag.position.copy(m.magHome); if(s.ev.out&&!s.ev.in) m.mag.position.y-=.12; }
  } else { m.mag.visible=P.cur==='smg'||(P.cur==='pzf'&&!!P.ammo.pzf&&P.ammo.pzf.mag>0); m.mag.position.copy(m.magHome); }
  if(m.lh){ if(s.state==='RELOAD'){ const w=WEAPONS[P.cur]; const tt=clamp(s.t/w.reload.end,0,1); const k=Math.sin(tt*Math.PI), k2=Math.sin(clamp((tt-.2)/.6,0,1)*Math.PI); m.lh.position.set((P.cur==='smg'?-.18:-.04)*k,-.3*k2-.04*k,.08*k2); m.lh.rotation.set(.6*k2,0,-.4*k2); } else { m.lh.position.multiplyScalar(1-Math.min(1,dt*12)); m.lh.rotation.x*=1-Math.min(1,dt*12); m.lh.rotation.z*=1-Math.min(1,dt*12); } }
  let insY=0, insZ=0, insX=0; if(VM.inspectT>0){ if(P.adsT>.1||s.state!=='READY'&&s.state!=='IDLE'&&s.state!==undefined&&s.state!=='READY'||P.sprinting||G.lastFireT>simTime-.3) VM.inspectT=0; else { VM.inspectT-=dt; const t=1-VM.inspectT/2.4; const e1=Math.sin(clamp(t/.45,0,1)*Math.PI/2), e2=Math.sin(clamp((t-.45)/.4,0,1)*Math.PI); const back=t>.85?1-(t-.85)/.15:1; insZ=(.9*e1-1.4*e2*0)*back; insY=(-.7*e2)*back+(.25*e1)*back; insX=(-.25*e1+.35*e2)*back; } }
  const sp=Math.hypot(P.vx,P.vz); const bobX=settings.bob?Math.sin(P.bob)*.012*clamp(sp/3,0,1):0, bobY=settings.bob?Math.abs(Math.cos(P.bob))*.01*clamp(sp/3,0,1):0;
  const base=_vmBase.lerpVectors(m.hip,m.ads,P.adsT);
  m.g.position.set(base.x+bobX*(1-P.adsT*.85),base.y-bobY*(1-P.adsT*.85)-lower*.25,base.z+VM.kick);
  m.g.rotation.set(VM.kickRot+rotX+insX,insY,rotZ+insZ); if(VM.inspectT>0) m.g.position.x-=.06*Math.abs(insZ);
  if(VM.throwT>0){ VM.throwT-=dt; const k=Math.sin(clamp(VM.throwT/.5,0,1)*Math.PI); m.g.position.y-=k*.22; m.g.rotation.x-=k*.5; }
  VM.flashT-=dt; VM.flash.visible=VM.flashT>0; if(VM.flash.visible){ VM.flash.position.copy(m.g.position).add(m.muzzle.position); VM.flash.rotation.z=Math.random()*3; }
  const lit=.2+P.light*.8; VM.amb.intensity=.25+lit*.45; VM.dl.intensity=.2+lit*.6;
  G.flashLightT-=dt; G.flashLight.position.copy(camera.position); G.flashLight.intensity=G.flashLightT>0?2.2:0;
  VM.lamp.visible=P.lantern&&!P.dead; VM.lamp.position.y=-.25-P.adsT*.14+bobY; VM.lamp.rotation.z=bobX*3;
  { const lampOn=P.lantern&&!P.dead; for(const k in VM.models){ const mm=VM.models[k]; if(mm.lh) mm.lh.visible=!lampOn; } }
  const fwd=_vmFwd.set(0,0,-1).applyQuaternion(camera.quaternion); G.lanternLight.position.copy(camera.position).addScaledVector(fwd,.35); G.lanternLight.position.y-=.3;
  G.lanternLight.intensity=P.lantern&&!P.dead?1.55+Math.sin(simTime*9)*.05+Math.sin(simTime*23)*.03:0;
}
function updateLamps(dt){ for(const L of W.lamps){ if(L.broken) continue; L.ph+=dt; L.light.intensity=L.base*(1+Math.sin(L.ph*7.3)*.02+Math.sin(L.ph*13.1)*.015); if(L.cone&&L.id!=='SL') L.cone.material.opacity=.075; } }
/* ---------- passo fixo com teto explícito e sem descarte silencioso (REV-B · P0-02) ----------
   - no máximo SIM.maxSteps passos por quadro (não entra em espiral se a máquina não acompanha);
   - o atraso que sobra continua no acumulador e é recuperado nos quadros seguintes;
   - só o que passa de SIM.maxBacklog é descartado, e esse tempo fica registrado
     em PERF.droppedSimMs (aparece no painel F3);
   - a câmera e os atores são desenhados interpolados entre o passo anterior e o atual. */
let hudAcc=0;
const SIM={maxSteps:5,maxBacklog:CFG.step*6,maxFrame:.1,interp:true,alpha:1,lastSteps:0};
const _prevP={x:0,y:0,z:0,ok:false};
function simSavePrev(){
  const P=G.player; _prevP.x=P.pos.x; _prevP.y=(P.ys!=null?P.ys:P.pos.y); _prevP.z=P.pos.z; _prevP.ok=true;
  const A=G.actors; for(let i=0;i<A.length;i++){ const a=A[i]; a._px=a.pos.x; a._pz=a.pos.z; }
}
function advanceSim(dt){
  acc+=dt; let n=0;
  if(acc>=CFG.step){ const t0=performance.now();
    while(acc>=CFG.step&&n<SIM.maxSteps){ simSavePrev(); simStep(CFG.step); acc-=CFG.step; n++; }
    const ms=performance.now()-t0; PERF.simSteps+=n; PERF.simMs+=ms; if(ms>PERF.simMsMax) PERF.simMsMax=ms; }
  if(acc>SIM.maxBacklog){ PERF.drop((acc-SIM.maxBacklog)*1000); acc=SIM.maxBacklog; }
  SIM.lastSteps=n; SIM.alpha=SIM.interp?clamp(acc/CFG.step,0,1):1;
  return n;
}
// Posição de desenho dos atores vivos: entre o passo anterior e o atual (só X/Z; a altura segue a animação).
function interpolateActors(){
  if(!SIM.interp) return; const a=SIM.alpha, A=G.actors; let moved=false;
  for(let i=0;i<A.length;i++){ const e=A[i]; if(e.dead||e._px===undefined) continue; const dx=e.pos.x-e._px, dz=e.pos.z-e._pz;
    if(dx===0&&dz===0) continue; if(dx*dx+dz*dz>1){ continue; }   // teleporte: não interpola
    const r=e.h.root.position; r.x=e._px+dx*a; r.z=e._pz+dz*a; moved=true; }
  if(moved) matricesFresh=false;
}
function frame(now){
  const rawMs=now-last; last=now;
  const dt=Math.min(SIM.maxFrame,rawMs/1000);
  if(rawMs<1000) PERF.frame(rawMs);               // acima disso foi aba em segundo plano, não quadro lento
  pollKeyboard(); pollGamepad(dt); pollTouch();
  if(APP.state==='PLAYING' && G){
    if(!UI.frozen()){
      if(rawMs<1000&&rawMs/1000>SIM.maxFrame) PERF.drop(rawMs-SIM.maxFrame*1000);   // quadro mais longo que o teto: tempo perdido, registrado
      advanceSim(dt*(CHEATS.slowmo?.55:1)); interpolateActors();
    }
    updateCamera(dt); updateViewmodel(dt);
    // HUD no máximo a 60 Hz: em monitores de 120/144 Hz os dados não mudam mais rápido que isso.
    hudAcc+=dt; if(hudAcc>=1/61){ updateHUD(hudAcc); hudAcc=0; }
    updateLamps(dt); FX.update(UI.frozen()?0:dt);
    AudioSys.update(dt,G.combatT>0?1:0,G.enemies.some(e=>!e.dead&&(e.state==='INVESTIGATE'||e.state==='SEARCH'||(e.awareness||0)>.35)));
  } else if(G&&(MENU3D.on=APP.state==='MENU'&&$('#briefing').hidden)){
    MENU3D.update(dt); VM.root.visible=false; AudioSys.update(dt,0);
  } else if(G){
    menuT+=dt*.05; const r=15, mc=G.level.menuCam; camera.position.set(mc.cx+Math.sin(menuT)*r*.6,mc.y,mc.cz+Math.cos(menuT)*r*.4); camera.lookAt(mc.tx,1.6,mc.tz); setCameraFov(60);
    for(const a of G.actors) a.animate(dt); updateLamps(dt); VM.root.visible=false; AudioSys.update(dt,0);
  }
  if(G) updateAtmo(dt);
  if(APP.state!=='MENU') MENU3D.on=false;
  const r0=performance.now();
  renderFrame(APP.state==='PLAYING'&&G&&!G.player.dead&&!G.camMode,dt);
  PERF.renderMs+=performance.now()-r0;
  if(rawMs<1000) RES_SCALE.tick(rawMs,APP.state==='PLAYING'&&!UI.frozen()&&document.visibilityState!=='hidden');
  updateDebug(dt);
  requestAnimationFrame(frame);
}
