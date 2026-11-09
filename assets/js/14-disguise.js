'use strict';


/* =========================================================
   DISFARCE E CREDENCIAIS — suspeita por guarda, inspeção
   de documentos, arma guardada e testemunhas
   ========================================================= */
function disguiseOn(){ return !!(G&&G.disguise&&!G.disguise.blown); }
function toggleHolster(){
  if(!G||G.player.dead||G.camMode) return; const P=G.player;
  if(P.holster){ drawWeapon(); return; }
  if(P.wpn.state!=='READY') return; P.holster=true; P.adsT=0; AudioSys.play('cloth'); G.hud.ammoT=4;
}
function drawWeapon(sel){
  const P=G.player; if(!P.holster) return; P.holster=false; G.drawT=simTime;
  if(sel&&P.weapons.includes(sel)) P.cur=sel; showVM(P.cur);
  const s=P.wpn; s.state='SWITCH'; s.t=.28; s.swapped=true; AudioSys.play('cloth'); G.hud.ammoT=4;
}
function blowDisguise(e,why){
  if(!disguiseOn()) return; const D_=G.disguise, P=G.player;
  D_.blown=true; G.flags.blown=true; G.inspector=null;
  const o=obj('cover'); if(o&&o.state==='active') failObjective('cover');
  const txt={tiro:'Viram você atirar — o disfarce caiu!',ataque:'Viram você atacar um soldado — o disfarce caiu!',suspeita:'Um guarda desconfiou de vez — o disfarce caiu!',credencial:'O passe não vale para esta área — o disfarce caiu!',fuga:'Você fugiu da inspeção — o disfarce caiu!',demora:'Você enrolou demais na inspeção — o disfarce caiu!',atacada:'O soldado que você atacou deu o alarme — disfarce comprometido!',falsificacao:'Pegaram você falsificando o passe — disfarce comprometido!',sabotagem:'Sabotagem à vista — disfarce comprometido!',raid:'Ataque aéreo! O bordj inteiro está de pé.'}[why]||'Disfarce comprometido!';
  G.radioMsg('ALERTA',txt,'warn'); AudioSys.play('alarm',P.pos,.5);
  if(e&&!e.dead){ e.sus=1; e.enterCombat(P.pos.x,P.pos.z,false,true); }
  for(const x of G.enemies){ if(x.dead||x===e) continue; if(x.state==='INSPECT'){ x.enterCombat(P.pos.x,P.pos.z,true,true); } }
  if(G.level.onBlown) G.level.onBlown(why);
}
Enemy.prototype.disguiseThink=function(pv,dP,dt){
  const P=G.player;
  if(pv>0){
    if(simTime-(G.lastFireT||-99)<.7&&dP<40){ blowDisguise(this,'tiro'); return; }
    if(simTime-(G.koT||-99)<.8&&dP<25){ blowDisguise(this,'ataque'); return; }
  }
  let fn=0, ff=0, top=0, why='';
  const add=(far,v,w)=>{ if(far) ff+=v; else fn+=v; if(v>top){ top=v; why=w; } };
  if(pv>0){
    const zl=G.level.zoneAt(P.pos.x,P.pos.z,P.pos.y);
    if(zl>G.cred&&!G.escort&&this.def.faction!=='it') add(0,.5,'área fora do seu passe');
    const mv=Math.hypot(P.vx,P.vz);
    if(P.sprinting) add(0,.2,'correndo'); else if(P.crouch>.5&&mv>.4) add(0,.14,'andando agachada');
    if(!P.holster) add(1,simTime-(G.drawT||-99)<1.5?1.1:.55,'arma à mostra');
    if(G.camMode){ const facing=Math.abs(angDiff(this.yaw+this.headYaw,Math.atan2(P.pos.x-this.pos.x,P.pos.z-this.pos.z)))<.75; add(1,(facing?1.3:.35)*(G.level.camPublic&&zl===0?.1:1),'câmera na mão'); }
    if(simTime-(G.photoT||-99)<1&&dP<14) add(1,1.8*(G.level.camPublic&&zl===0?.15:1),'fotografando');
    const calm=this.state==='IDLE'||this.state==='PATROL';
    if(dP<2.1&&calm&&this!==G.inspector){ this.closeT=(this.closeT||0)+dt; if(this.closeT>4.5) add(0,.25,'colada nele'); } else this.closeT=0;
    for(const c of G.enemies){ if(c.dead&&!c.gone&&Math.hypot(c.pos.x-P.pos.x,c.pos.z-P.pos.z)<4.5){ add(1,.9,'perto de um corpo'); break; } }
    if(curInteract&&curInteract.sus&&holdT>0&&dP<16) add(1,curInteract.sus,'mexendo onde não devia');
  }
  const vouched=simTime-(this.clearedT||-99)<30||simTime-(this.vouchT||-99)<20; if(vouched) fn=0;
  const near=clamp(1.35-dP/13,0,1.2), far=dP<30?Math.max(near,.3):0, pk=D().perception;
  const gain=(fn*near+ff*far)*pk*(this.def.faction==='it'?.4:1)*(this.bribed?0:1);
  if(gain>0){ this.sus=Math.min(1.2,(this.sus||0)+gain*dt); this.susWhy=why; }
  else this.sus=Math.max(0,(this.sus||0)-.24*dt);
  if(this.sus>=1&&(this===G.inspector||this.def.faction==='it')) this.sus=.95;
  if(this.sus>=1){ blowDisguise(this,curInteract&&curInteract.susWhy&&holdT>0?curInteract.susWhy:'suspeita'); return; }
  if(this.sus>=.62&&this.def.faction!=='it'&&this.state!=='INSPECT'&&!G.inspector&&simTime-(this.clearedT||-99)>25&&this.hasWeapon) this.startInspect();
};
Enemy.prototype.startInspect=function(){
  this.wake(); this.releaseCover(); this.state='INSPECT'; this.inspectT=0; this.waitT2=0; this.reached=false; this.repathT=0; this.aimTarget=.35; this.path=null; G.inspector=this;
  AudioSys.play('shout',this.pos); G.radioMsg('SENTINELA','“Alto! Documentos!”','warn');
};
Enemy.prototype.inspectStep=function(dt){
  const P=G.player.pos, d=Math.hypot(P.x-this.pos.x,P.z-this.pos.z);
  this.inspectT+=dt; this.headYaw*=.85; this.crouchTarget=0;
  const busy=(G.papers&&G.papers.e===this)||(G.escort&&G.escort.e===this);
  if(d>(busy?2.8:2)){ this.repathT-=dt; if(this.repathT<=0||!this.path){ this.setPath(P.x,P.z); this.repathT=.8; } this.followPath(2.6*this.speedMul(),dt); }
  else { this.moveDir(0,0,0,dt); this.faceTowards(P.x,P.z,dt,5); if(!busy) this.waitT2+=dt; }
  if(!disguiseOn()){ this.enterCombat(P.x,P.z,true,true); return; }
  if(d<=3.5) this.reached=true;
  if(busy){ if(G.escort&&d>16) blowDisguise(this,'fuga'); return; }
  if(this.reached&&d>7.5) blowDisguise(this,'fuga');
  else if(this.reached&&this.waitT2>7) blowDisguise(this,'demora');
  else if(!this.reached&&this.inspectT>22){ G.inspector=null; this.sus=.3; this.clearedT=simTime-8; this.toReturn(); }
};
let MARKTEX=null;
function susMark(e,kind){
  if(!MARKTEX){ const mk=(ch,col)=>textTex(64,64,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='rgba(10,14,17,.6)'; g.beginPath(); g.arc(32,32,22,0,7); g.fill(); g.fillStyle=col; g.font='bold 40px sans-serif'; g.textAlign='center'; g.fillText(ch,32,46); }); MARKTEX={q:mk('?','#e0b050'),x:mk('!','#e05a3a')}; }
  if(!e.mark){ e.mark=new T.Sprite(new T.SpriteMaterial({map:MARKTEX.q,depthTest:false,transparent:true})); e.mark.scale.set(.42,.42,1); e.mark.renderOrder=5; scene.add(e.mark); }
  e.mark.visible=!!kind; if(kind){ e.mark.material.map=kind==='x'?MARKTEX.x:MARKTEX.q; e.mark.position.set(e.pos.x,e.pos.y+2.25,e.pos.z); }
}
function updateHUD06(dt){
  inspectHUD();
  const el=$('#disgChip'); if(!G.disguise){ el.hidden=true; return; } el.hidden=false; const P=G.player;
  let st='seguro', cls='ok';
  if(G.disguise.blown){ st='comprometido'; cls='bad'; }
  else if(G.inspector){ st='inspeção'; cls='warn'; }
  let m=0, mw=''; for(const e of G.enemies) if(!e.dead&&(e.sus||0)>m){ m=e.sus; mw=e.susWhy||''; }
  if(!G.disguise.blown&&!G.inspector&&m>.22){ st='suspeita'; cls='warn'; }
  el.className='disg '+cls; $('#disgState').textContent=st;
  $('#disgSub').textContent=(st==='suspeita'&&mw?'Desconfiam: '+mw+' · ':'')+'Credencial '+(G.level.credNames?G.level.credNames[G.cred]:(G.cred>=2?'vermelha':'branca'))+(P.holster?' · arma guardada (H)':' · arma à mostra');
  for(const e of G.enemies){ if(e.dead||G.disguise.blown){ if(e.mark) e.mark.visible=false; continue; } susMark(e,e.state==='INSPECT'?'x':(e.sus>.25?'q':null)); }
}