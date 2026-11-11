'use strict';


/* =========================================================
   MISSÃO: objetivos, interação, portas, coletáveis
   ========================================================= */
let G=null; let simTime=0;
/* =========================================================
   DOCUMENTOS
   ========================================================= */
const DOCS={
  shiftlog:{title:'Registro de turnos — Posto de guarda nº 7',sub:'Rue des Lanternes · setor norte · semana de 8 a 14 de março',body:`22h00  Toque de recolher. Fechar a praça.
22h30  Ronda da rua: um homem, lado leste, até a fonte.
23h00  Ronda do pátio (entrada pelo beco oeste).
00h00  Troca de guarda na barreira norte.

Garagem Moreau (requisitada): chave no quadro do posto.
Nenhum veículo sai antes das 06h00 sem ordem escrita.

Lampião da esquina sul queimado duas vezes esta semana.
Solicitar reposição.

Incidente: rádio do posto, canal 3, quartel norte.
Reforço chega em até três minutos.

— Ten. H. Brandt`,pencil:'A lápis, outra letra: o posto não enxerga o pátio. Use o beco.'},
  note:{title:'Bilhete dobrado',sub:'Encontrado sobre a caixa de batatas',body:`Para quem vier buscar:
a Sten está na caixa, com dois carregadores.

Não confie no pátio depois da meia-noite —
a ronda volta pelo mesmo caminho.

— J.`,pencil:''},
  plan:{title:'Planta do cemitério de Saint-Aubin',sub:'Cópia do zelador, com anotações a lápis',map:'02',body:'',pencil:'A lápis: jazigo Vautrin, ala leste, encostado no muro. O telefone da casinha liga direto para o portão.'},
  madeleine:{title:'Bilhete de Madeleine',sub:'Dobrado dentro do livro de cifras',body:`Se você está lendo isto, cheguei a tempo de esconder o livro
e não a tempo de sair.

A laje atrás do altar abre para o ossuário.
Siga a galeria principal para o norte; a escada de serviço
sai num bueiro da Rue Daguerre.

Não volte pelo portão.

— M.`,pencil:''},
};

/* =========================================================
   ESTRUTURA COMUM DE MISSÃO
   ========================================================= */
function newGameState(levelId,diff){
  return {levelId,level:LEVELS[levelId],diff,player:newPlayer(),enemies:[],actors:[],ally:null,objectives:[],flags:{},stats:{shots:0,hits:0,heads:0,helmets:0,disarms:0,kills:0,alerts:0,dmgTaken:0,takedowns:0,photos:0},
    shotId:0,seed:(Math.random()*1e9)|0,time:0,dmgMarks:[],radioQ:[],hud:{healthT:4,ammoT:4},combatT:0,playerShotT:0,flashLightT:0,pebbleCD:0,discovered:new Set(),taken:new Set(),docs:[],
    alarm:false,radioDead:false,ending:false,introT:0,hintT:0,lastShot:null,refs:{},
    radioMsg(who,text,cls){ this.radioQ.push({who,text,cls}); }};
}
function newMission(levelId,diff,save){
  // REV-C: anota o que a cena antiga usava para liberar da GPU depois de montar a nova
  const oldRes=RES.collect(scene);
  if(MAT_Q!==settings.quality){ for(const k in HMAT){ RES._mat(HMAT[k],oldRes); delete HMAT[k]; } for(const k in MAT){ const m=MAT[k]; if(m&&m.isMaterial) RES._mat(m,oldRes); } if(typeof H2!=='undefined'){ for(const m of H2.mat.values()) RES._mat(m,oldRes); H2.mat.clear(); } if(typeof MZ!=='undefined'){ for(const m of MZ.mat.values()) RES._mat(m,oldRes); MZ.mat.clear(); } makeMaterials(); }
  while(scene.children.length) scene.remove(scene.children[0]);
  scene.add(camera); renderer.shadowMap.enabled=false;
  W.photo=[]; LOD_STATS.far=0;
  W.solids=[]; W.shootables=[]; W.lamps=[]; W.doors={}; W.interactables=[]; W.covers=[]; W.pickups=[]; W.props=[]; W.nades=[]; W.rockets=[]; W.walk=[]; W.glass=[]; W.shards=[]; W.nav={nodes:[],edges:[],link:17};
  FX.parts=[]; FX.decals=[]; FX.tracers=[]; FX.flashes=[]; FX.init();
  G=newGameState(levelId,diff); const L=G.level;
  G.refs=L.build()||{};
  polishLevel(L);
  buildCovers();
  G.flashLight=new T.PointLight(0xffd090,0,9,2); scene.add(G.flashLight);
  G.lanternLight=new T.PointLight(0xffc98a,0,11,1.5); scene.add(G.lanternLight);
  for(const d of L.enemies) G.enemies.push(new Enemy(d));
  G.ally=L.ally?new Ally(L.ally):null;
  G.actors=G.ally?[...G.enemies,G.ally]:[...G.enemies];
  G.objectives=L.objectives(); L.interact(G.refs); L.pickups(); for(const e of G.enemies) addTakedown(e);
  if(L.shadows) enableShadows(G.refs.sun);
  G.rain=L.rain?makeRain():null; G.mist=L.mist?makeMist(L.mist):null; G.camMode=false; $('#camView').hidden=true;
  const P=G.player; P.pos.set(L.start.x,heightAt(L.start.x,L.start.z),L.start.z); P.yaw=L.start.yaw; P.ys=null;
  if(save) applySave(save); else { applyLoadout(levelId); if(L.startDocs) G.docs=[...L.startDocs]; }
  P.hasCamera=!!(L.loadout&&L.loadout.camera);
  if(!P.weapons.includes(P.cur)) P.cur='pistol'; showVM(P.cur);
  rebuildRadioUI(); refreshObjectiveUI(true);
  matricesFresh=false;
  if(typeof mzWarmLevel==='function') mzWarmLevel(L);
  RES.sweep(oldRes);
}
function buildCovers(){
  W.covers=[];
  for(const s of W.solids){
    if(!s.cover) continue;
    const cx=(s.minX+s.maxX)/2, cz=(s.minZ+s.maxZ)/2, w=s.maxX-s.minX, d=s.maxZ-s.minZ, o=.6, pts=[];
    const along=(len)=>len>2.2?[-len/4,len/4]:[0];
    for(const k of along(d)){ pts.push([s.minX-o,cz+k,1,0]); pts.push([s.maxX+o,cz+k,-1,0]); }
    for(const k of along(w)){ pts.push([cx+k,s.minZ-o,0,1]); pts.push([cx+k,s.maxZ+o,0,-1]); }
    for(const [x,z,nx,nz] of pts){ const fh=heightAt(x,z); if(Math.abs(s.minY-fh)>.5&&!(s.minY<=fh&&s.maxY>fh+.5)) continue; if(!insideSolid(x,z,.32)) W.covers.push({x,z,nx,nz,h:s.maxY-fh,occupant:null}); }
  }
}
function insideSolid(x,z,r){ const h=heightAt(x,z); for(const t of W.solids){ if(!t.active) continue; if(t.walk){ if(t.maxY<=h+.42) continue; } else if(t.maxY<h+.3||t.minY>h+1.6) continue; if(x>t.minX-r&&x<t.maxX+r&&z>t.minZ-r&&z<t.maxZ+r) return true; } return false; }
function applyLoadout(levelId){
  const L=LEVELS[levelId], P=G.player; if(!L.loadout) return;
  const c=campaign().carry;
  if(c && c.from===L.prev){ P.weapons=[...c.weapons]; P.ammo=JSON.parse(JSON.stringify(c.ammo)); P.cur=c.cur||'pistol'; P.hp=entryHp(c.hp); G.carried=true; }
  else { const l=L.loadout; P.weapons=[...l.weapons]; P.ammo=JSON.parse(JSON.stringify(l.ammo)); P.cur=l.cur; P.hp=100; }
  if(CHEATS.arsenal){ const full={pistol:{mag:8,reserve:40},smg:{mag:32,reserve:128},silenced:{mag:6,reserve:24},rifle:{mag:5,reserve:30},xbow:{mag:1,reserve:10},pzf:{mag:1,reserve:2}}; for(const w in full){ if(!P.weapons.includes(w)) P.weapons.push(w); if(!P.ammo[w]) P.ammo[w]=full[w]; } }
  // a rede garante o equipamento mínimo da operação
  for(const w of L.loadout.weapons){ if(!P.weapons.includes(w)) P.weapons.push(w); P.ammo[w]=P.ammo[w]||{mag:0,reserve:0}; const a=P.ammo[w], m=L.loadout.ammo[w]; a.mag=Math.max(a.mag,m.mag); a.reserve=Math.max(a.reserve,m.reserve); }
}
function entryHp(h){ return G.diff==='recruta'?100:G.diff==='soldado'?Math.max(50,h):Math.max(25,h); }
const obj=id=>G.objectives.find(o=>o.id===id);
function activate(id){ const o=obj(id); if(o&&o.state==='hidden'){ o.state='active'; refreshObjectiveUI(true); } }
function complete(id,silent){
  const o=obj(id); if(!o||o.state==='done'||o.state==='failed') return false;
  o.state='done'; if(!silent){ AudioSys.play('objective'); refreshObjectiveUI(true); } return true;
}
function failObjective(id){ const o=obj(id); if(o&&o.state!=='done'&&o.state!=='failed'){ o.state='failed'; refreshObjectiveUI(true); } }
function currentObjective(){ return G.objectives.find(o=>o.state==='active'&&!o.optional)||null; }
function addPickup(id,x,z,type,n,y=.1){
  const k=D().pickups;
  const mesh=new T.Mesh(BOX(type==='med'?.28:.24,type==='med'?.16:.14,type==='med'?.2:.16),type==='med'?hm(0xd8d0bc):hm(type==='smg'?0x3a4a34:type==='silenced'?0x2e2e3a:0x4a3a26)); mesh.position.set(x,y,z); scene.add(mesh);
  if(type==='med'){ const c=new T.Mesh(BOX(.12,.17,.04),hm(0x9a2a1b)); c.position.z=.09; mesh.add(c); }
  W.pickups.push({id,x,z,y,type,n:Math.max(1,Math.round(n*(type==='med'?1:k))),mesh,taken:false});
}
function spawnDrop(e){
  const id='drop_'+e.id; if(G.taken.has(id)) return; const k=D().pickups; const dr=e.ew.drop;
  const mesh=new T.Mesh(BOX(.24,.12,.16),hm(dr.type==='smg'?0x3a4a34:0x4a3a26)); mesh.position.set(e.pos.x+.4,e.pos.y+.07,e.pos.z+.2); scene.add(mesh);
  W.pickups.push({id,x:mesh.position.x,z:mesh.position.z,y:e.pos.y+.07,type:dr.type,n:Math.max(2,Math.round(dr.n*k)),mesh,taken:false});
}
function updatePickups(){
  const P=G.player;
  for(const p of W.pickups){
    if(p.taken) continue; if(Math.hypot(P.pos.x-p.x,P.pos.z-p.z)>1.05) continue; if(Math.abs(P.pos.y-(p.y||0))>1.6) continue;
    if(p.type==='nade'||(p.type==='pzf'&&!P.weapons.includes('pzf'))){ if(!pickupSpecial(p)) continue; p.taken=true; p.mesh.visible=false; G.taken.add(p.id); AudioSys.play('pickup'); continue; }
    if(p.type==='med'){ if(P.hp>=100) continue; P.hp=Math.min(100,P.hp+p.n); G.hud.healthT=4; pickupMsg('Curativo +'+p.n); }
    else { const w=WEAPONS[p.type], a=P.ammo[p.type]; if(!P.weapons.includes(p.type)){ P.ammo[p.type]=P.ammo[p.type]||{mag:0,reserve:0}; const b=P.ammo[p.type]; if(b.reserve>=w.reserveMax) continue; b.reserve=Math.min(w.reserveMax,b.reserve+p.n); pickupMsg(w.ammoName+' +'+p.n+' (sem a arma)'); }
      else { if(a.reserve>=w.reserveMax) continue; const add=Math.min(p.n,w.reserveMax-a.reserve); a.reserve+=add; pickupMsg(w.ammoName+' +'+add); G.hud.ammoT=4; } }
    p.taken=true; p.mesh.visible=false; G.taken.add(p.id); AudioSys.play('pickup');
  }
}
function openDoor(d,who){ if(d.state!=='CLOSED') return; d.state='OPENING'; d.t=0; AudioSys.play(d.snd,d.mesh.position); if(who===null||who===undefined) emitNoise(d.mesh.position,d.loud||4,'step',null); }
function closeDoor(d){
  if(d.state!=='OPEN') return; const c=d.closed;
  const blocked=G.actors.some(a=>!a.dead&&Math.hypot(a.pos.x-c.x,a.pos.z-c.z)<1.2)||Math.hypot(G.player.pos.x-c.x,G.player.pos.z-c.z)<.9;
  if(blocked) return; d.state='CLOSING'; d.t=1; AudioSys.play(d.snd,d.mesh.position);
}
function updateDoors(dt){
  for(const k in W.doors){ const d=W.doors[k];
    if(d.state==='OPENING'){ d.t=Math.min(1,d.t+dt/d.dur); d.mesh.position.lerpVectors(d.closed,d.open,ease(d.t)); if(d.t>.45&&d.solid.active){ d.solid.active=false; if(d.nav) buildNav(); } if(d.t>=1) d.state='OPEN'; }
    else if(d.state==='CLOSING'){ d.t=Math.max(0,d.t-dt/d.dur); d.mesh.position.lerpVectors(d.closed,d.open,ease(d.t)); if(d.t<.45) d.solid.active=true; if(d.t<=0) d.state='CLOSED'; }
  }
}
function setDoorOpenInstant(d){ d.state='OPEN'; d.t=1; d.mesh.position.copy(d.open); d.solid.active=false; }
function doorInteract(id,pt){
  return {id:id+'door',pt:()=>pt,r:2.3,skipSolid:()=>W.doors[id].solid,
    label:()=>{ const d=W.doors[id]; return d.state==='CLOSED'?'Abrir porta':d.state==='OPEN'?'Fechar porta':null; },
    use:()=>{ const d=W.doors[id]; if(d.state==='CLOSED') openDoor(d,null); else if(d.state==='OPEN') closeDoor(d); }};
}
function raiseAlarm(){
  const L=G.level; if(G.alarm) return; G.alarm=true; if(L.alarmObjective) failObjective(L.alarmObjective);
  AudioSys.play('alarm',L.alarmPos,1.6);
  G.radioMsg('RÁDIO',L.alarmText,'warn');
  for(const d of L.reinf){ const e=new Enemy(d); G.enemies.push(e); G.actors.push(e); addTakedown(e); e.enterCombat(G.player.pos.x,G.player.pos.z,true); }
  for(const e of G.enemies){ if(e.dead) continue; e.alertLevel=1; if(e.state!=='COMBAT'&&e.state!=='RADIO'&&e.state!=='DISARMED'){ e.lastKnown={x:G.player.pos.x,z:G.player.pos.z}; e.toSearch(); } }
}
function updateMission(dt){
  G.time+=dt; G.combatT=Math.max(0,G.combatT-dt); G.playerShotT=Math.max(0,G.playerShotT-dt); G.introT+=dt;
  G.level.update(dt);
}

/* ---------- salvamento (checkpoint) ---------- */
function snapshot(){
  const P=G.player, A=G.ally;
  return {v:3,mission:G.levelId,diff:G.diff,time:G.time,savedAt:Date.now(),
    player:{x:P.pos.x,z:P.pos.z,yaw:P.yaw,hp:P.hp,cur:P.cur,weapons:[...P.weapons],ammo:JSON.parse(JSON.stringify(P.ammo)),key:P.key,nades:P.nades||0},
    obj:Object.fromEntries(G.objectives.map(o=>[o.id,o.state])),flags:Object.assign({},G.flags),
    doors:Object.fromEntries(Object.values(W.doors).map(d=>[d.id,(d.state==='OPEN'||d.state==='OPENING')?'OPEN':d.state])),
    lamps:W.lamps.filter(l=>l.broken).map(l=>l.id),
    ally:A?{x:A.pos.x,z:A.pos.z,mode:A.mode,hp:Math.max(A.hp,70),joined:A.joined,hidden:A.hidden}:null,
    enemies:G.enemies.map(e=>({id:e.id,def:e.def,dead:e.dead,hp:e.hp,x:e.pos.x,z:e.pos.z,yaw:e.yaw,helmet:e.helmetState,helmetDur:e.helmetDur,cap:e.hasCap,weapon:e.hasWeapon,alert:e.alertLevel,lanternBroken:!!e.lanternBroken,ko:!!e.ko,asleep:!!e.asleep,wounds:e.wounds||null,wf:e.woundFloor||null})),
    taken:[...G.taken],docs:[...G.docs],stats:Object.assign({},G.stats),alarm:G.alarm,radioDead:G.radioDead,discovered:[...G.discovered]};
}
function checkpoint(){ if(!G||G.ending||G.player.dead) return; G.cp=snapshot(); writeCheckpoint(G.cp); }
function applySave(s){
  const P=G.player;
  // cópias: o estado de jogo não pode alterar o checkpoint guardado em G.cp
  P.pos.set(s.player.x,heightAt(s.player.x,s.player.z),s.player.z); P.ys=null; P.yaw=s.player.yaw; P.cur=s.player.cur; P.weapons=[...s.player.weapons]; P.ammo=JSON.parse(JSON.stringify(s.player.ammo)); P.key=!!s.player.key; if(s.player.nades!==undefined) P.nades=s.player.nades;
  P.hp=entryHp(s.player.hp);
  for(const o of G.objectives) if(s.obj[o.id]) o.state=s.obj[o.id];
  G.flags=Object.assign({},s.flags,{waitHint:false,downHint:false}); G.introT=20;
  for(const id in s.doors){ const d=W.doors[id]; if(!d) continue; if(s.doors[id]==='OPEN') setDoorOpenInstant(d); else d.state=s.doors[id]; }
  buildNav();
  for(const id of s.lamps){ const L=W.lamps.find(l=>l.id===id); if(L) breakLamp(L,false); }
  G.taken=new Set(s.taken); for(const p of W.pickups) if(G.taken.has(p.id)){ p.taken=true; p.mesh.visible=false; }
  G.docs=[...(s.docs||[])]; G.stats=Object.assign(G.stats,s.stats); G.alarm=!!s.alarm; G.radioDead=!!s.radioDead; G.discovered=new Set(s.discovered||[]); G.time=s.time||0;
  const A=G.ally; if(A&&s.ally){ A.pos.set(s.ally.x,0,s.ally.z); A.mode=s.ally.mode; A.hp=s.ally.hp; A.joined=s.ally.joined; A.hidden=s.ally.hidden; if(A.mode==='WAIT'&&A.joined) A.waitPos={x:A.pos.x,z:A.pos.z}; }
  for(const es of s.enemies){
    let e=G.enemies.find(x=>x.id===es.id);
    if(!e){ if(!es.def) continue; e=new Enemy(es.def); G.enemies.push(e); G.actors.push(e); addTakedown(e); }
    e.pos.set(es.x,heightAt(es.x,es.z),es.z); e.yaw=es.yaw; e.hp=es.hp; e.alertLevel=es.alert;
    if(es.helmet!=='ATTACHED' && e.h.helmet && e.h.helmet.parent){ removeShootables(e.h.helmetMeshes); e.h.helmet.parent.remove(e.h.helmet); e.helmetState='DETACHED'; }
    e.helmetDur=es.helmetDur;
    if(es.wounds){ e.wounds=es.wounds; e.woundFloor=es.wf||{armL:0,armR:0,legL:0,legR:0}; }
    if(!es.cap && e.h.cap && e.h.cap.parent){ removeShootables(e.h.capMeshes); e.h.cap.parent.remove(e.h.cap); e.hasCap=false; }
    if(es.lanternBroken) breakLantern(e,true);
    if(es.dead){ e.killInstant(); e.ko=!!es.ko; if(!G.taken.has('drop_'+e.id)) spawnDrop(e); continue; }
    if(!es.asleep&&e.asleep){ e.asleep=false; e.doze=0; e.crouchTarget=0; }
    if(!es.weapon && e.h.weapon && e.h.weapon.parent){ removeShootables(e.h.weaponMeshes); e.h.weapon.parent.remove(e.h.weapon); e.hasWeapon=false; e.state='DISARMED'; e.fleeing=false; }
    else if(e.alertLevel){ e.state='RETURN'; e.setPath(e.post.x,e.post.z); }
  }
  if(G.level.restore) G.level.restore(s);
  G.cp=s;
}

/* ---------- conclusão / falha ---------- */
function missionComplete(){
  if(G.ending) return; G.ending=true;
  AudioSys.play('objective'); MUS.stinger('win'); for(const o of G.objectives){ if(!o.optional&&o.state==='active') o.state='done'; if(o.optional&&o.autoDone&&o.state==='active') o.state='done'; }
  if(G.level.outro) G.radioMsg(G.level.outro[0],G.level.outro[1]);
  $('#fade').classList.add('on');
  const g=G; setTimeout(()=>{ $('#fade').classList.remove('on'); if(G!==g||APP.state!=='PLAYING') return; clearCheckpoint(); showResults(); },1600);
}
function missionFail(title,text){
  if(!G||G.ending||APP.state!=='PLAYING') return; G.ending=true;
  APP.state='FAILED'; releaseLock(); UI.closeAll(); $('#hud').hidden=true; $('#touch').hidden=true;
  $('#failTitle').textContent=title; $('#failText').textContent=text; $('#bRetryCp').hidden=!G.cp;
  UI.show('failed');
}
function showResults(){
  APP.state='RESULTS'; releaseLock(); UI.closeAll(); $('#hud').hidden=true; $('#touch').hidden=true;
  const L=G.level, s=G.stats, acc=s.shots?s.hits/s.shots:1, hp=G.player.hp;
  const opts=G.objectives.filter(o=>o.optional), optDone=opts.filter(o=>o.state==='done').length;
  const score=50+optDone*10+hp/100*15+acc*15+(G.alarm&&!(L.alarmOk&&L.alarmOk())?0:10);
  const rating=score>=85?'EXCELENTE':score>=65?'BOM':'MÉDIO';
  $('#rMeta').textContent='RELATÓRIO DE MISSÃO · '+L.op.toUpperCase(); $('#rTitle').textContent=L.resultTitle; $('#rRating').textContent=rating;
  const mins=Math.floor(G.time/60), secs=Math.floor(G.time%60);
  $('#rText').textContent=(rating==='EXCELENTE'?'A Rede Lampião registra a medalha de prata da operação. ':'')+(G.alarm?(L.alarmOk&&L.alarmOk()?L.alarmLate:L.alarmYes):L.alarmNo)+(s.kills===0?(s.takedowns?'Ninguém morreu: só rendições silenciosas.':'Ninguém foi abatido: infiltração limpa.'):'Classificação baseada em objetivos, saúde, precisão e sigilo — não no número de abatidos.');
  const cells=[[`${mins}:${String(secs).padStart(2,'0')}`,'Tempo'],[s.shots?Math.round(acc*100)+'%':'—','Precisão'],[Math.round(hp),'Saúde final'],[s.kills,'Abatidos'],[s.takedowns,'Rendidos'],[s.disarms,'Desarmados'],[s.heads,'Tiros na cabeça'],[s.helmets,'Capacetes soltos'],[s.photos,'Fotos'],[optDone+'/'+opts.length,'Opcionais'],[s.alerts,'Alertas'],[G.alarm?'Sim':'Não','Alarme']];
  $('#rGrid').innerHTML=cells.map(([b,l])=>`<div><b>${b}</b><span>${l}</span></div>`).join('');
  const order={'MÉDIO':1,'BOM':2,'EXCELENTE':3};
  const camp=sanitizeCampaign(store.get('sdp_campaign'));
  const prev=camp.done[G.levelId]; if(anyCheat()){ $('#rText').textContent+=' (Códigos ativos: classificação não registrada.)'; } else if(!prev||order[rating]>order[prev.rating]||(order[rating]===order[prev.rating]&&G.time<prev.time)) camp.done[G.levelId]={rating,time:G.time,diff:G.diff};
  const P=G.player; camp.carry={from:G.levelId,weapons:[...P.weapons],ammo:JSON.parse(JSON.stringify(P.ammo)),cur:P.cur,hp:P.hp};
  store.set('sdp_campaign',camp);
  const ORD=L.secret?SECRET_ORDER:LEVEL_ORDER; const nx=ORD[ORD.indexOf(G.levelId)+1]; APP.nextLevel=nx||null; $('#bNext').hidden=!nx; $('#bNext').textContent='Próxima operação'; APP.showCredits=false;
  if(L.finale){ APP.showCredits=true; $('#bNext').hidden=false; $('#bNext').textContent='Créditos'; $('#rText').textContent+=' As operações secretas foram liberadas em Extras.'; }
  if(!nx&&!L.finale&&!L.secret){ const doneN=LEVEL_ORDER.filter(id=>camp.done[id]).length; $('#rText').textContent+=' — Fim das operações disponíveis ('+doneN+'/'+LEVEL_ORDER.length+' concluídas). O arquivo da Rede Lampião aguarda novas missões.'; }
  UI.show('results');
}