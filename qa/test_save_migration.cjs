'use strict';
// Uso: node qa/test_save_migration.cjs
// REV-A · P0-01 — saves válidos continuam funcionando; saves vazios, truncados,
// antigos ou corrompidos nunca derrubam o menu nem a missão.
const {withGame,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs,boot})=>{
  const f=[];
  // 1) validador puro: corpus de payloads ruins não lança e devolve motivo
  const a=await page.evaluate(()=>{
    startPlaying(null,'01'); for(let i=0;i<30;i++) simStep(CFG.step); checkpoint();
    const good=JSON.parse(JSON.stringify(G.cp)), out={fails:[],reasons:{}};
    const clone=()=>JSON.parse(JSON.stringify(good));
    const v0=validateCheckpoint(good); if(!v0.ok) out.fails.push('save recém-gravado reprovado: '+v0.reason); if(v0.repaired.length) out.fails.push('save íntegro foi "consertado": '+v0.repaired.join('; '));
    const bad={
      nulo:null, indefinido:undefined, numero:42, texto:'x', lista:[], vazio:{},
      semJogador:(()=>{ const s=clone(); delete s.player; return s; })(),
      jogadorNaN:(()=>{ const s=clone(); s.player.x=NaN; return s; })(),
      jogadorTexto:(()=>{ const s=clone(); s.player.z='12'; return s; })(),
      jogadorLonge:(()=>{ const s=clone(); s.player.x=1e9; return s; })(),
      missaoInvalida:(()=>{ const s=clone(); s.mission='99'; return s; })(),
      missaoProto:(()=>{ const s=clone(); s.mission='constructor'; return s; })(),
      versaoFutura:(()=>{ const s=clone(); s.v=99; return s; })(),
      versaoTexto:(()=>{ const s=clone(); s.v='três'; return s; })(),
    };
    for(const k in bad){ let r; try{ r=validateCheckpoint(bad[k]); }catch(e){ out.fails.push(k+': validateCheckpoint lançou '+e.message); continue; } if(r.ok) out.fails.push(k+': deveria ser reprovado'); else if(!r.reason) out.fails.push(k+': reprovado sem motivo'); out.reasons[k]=r.reason; }
    // consertáveis: devem ser aceitos, com registro do conserto
    const fix={
      dificuldadeDesconhecida:(()=>{ const s=clone(); s.diff='impossivel'; return s; })(),
      semInimigos:(()=>{ const s=clone(); delete s.enemies; return s; })(),
      inimigoAusente:(()=>{ const s=clone(); s.enemies=s.enemies.slice(1); return s; })(),
      inimigoLixo:(()=>{ const s=clone(); s.enemies[0]={id:5}; s.enemies.push(null,'x',{id:'fantasma',x:1,z:1}); return s; })(),
      objCorrompido:(()=>{ const s=clone(); s.obj={meet:'explodiu'}; return s; })(),
      semObj:(()=>{ const s=clone(); delete s.obj; return s; })(),
      armaDesconhecida:(()=>{ const s=clone(); s.player.weapons=['bazuca-laser']; s.player.cur='bazuca-laser'; return s; })(),
      municaoLixo:(()=>{ const s=clone(); s.player.ammo={pistol:{mag:'cheio',reserve:-5}}; return s; })(),
      portasLixo:(()=>{ const s=clone(); s.doors={x:'DERRETIDA'}; return s; })(),
      aliadoLixo:(()=>{ const s=clone(); s.ally={x:'a'}; return s; })(),
      listasLixo:(()=>{ const s=clone(); s.taken=7; s.docs={}; s.lamps=null; s.discovered='x'; return s; })(),
      v1:(()=>{ const s=clone(); delete s.v; delete s.mission; delete s.lamps; delete s.discovered; delete s.docs; delete s.stats; return s; })(),
      v2:(()=>{ const s=clone(); s.v=2; delete s.discovered; delete s.radioDead; return s; })(),
      saudeAbsurda:(()=>{ const s=clone(); s.player.hp=1e6; s.time=-5; return s; })(),
    };
    out.fixed={};
    for(const k in fix){ let r; try{ r=validateCheckpoint(fix[k]); }catch(e){ out.fails.push(k+': validateCheckpoint lançou '+e.message); continue; }
      if(!r.ok){ out.fails.push(k+': deveria ser consertado, foi reprovado ('+r.reason+')'); continue; }
      if(!r.repaired.length&&k!=='inimigoAusente') out.fails.push(k+': consertado sem registro');
      // e o save consertado precisa de fato carregar
      try{ startPlaying(r.value); for(let i=0;i<20;i++) simStep(CFG.step); if(APP.state!=='PLAYING') out.fails.push(k+': não entrou em jogo'); if(!isFinite(G.player.pos.x)||!isFinite(G.player.hp)) out.fails.push(k+': estado do jogador inválido após carregar'); if(!DIFF[G.diff]) out.fails.push(k+': dificuldade inválida em jogo'); }
      catch(e){ out.fails.push(k+': carregar o save consertado lançou '+e.message); }
      out.fixed[k]=r.repaired; }
    const hp=validateCheckpoint(fix.saudeAbsurda); if(hp.ok&&(hp.value.player.hp>100||hp.value.time<0)) out.fails.push('limites de saúde/tempo não aplicados');
    // o checkpoint em memória não pode ser alterado pelo jogo (antes, as listas eram compartilhadas)
    startPlaying(null,'01'); for(let i=0;i<10;i++) simStep(CFG.step); checkpoint(); const before=JSON.stringify(G.cp); const cp=G.cp;
    startPlaying(cp); G.player.weapons.push('smg'); G.player.ammo.pistol.mag=0; G.docs.push('note');
    if(JSON.stringify(cp)!==before) out.fails.push('jogar após carregar alterou o checkpoint guardado');
    return out;
  });
  f.push(...a.fails);

  // 2) menu com localStorage estragado: cada caso recarrega a página de verdade
  const cases=[
    ['truncado','{"v":3,"mission":"01","pla'],
    ['vazio',''],
    ['json-nulo','null'],
    ['lista','[1,2,3]'],
    ['missao-invalida','{"v":3,"mission":"zz","diff":"soldado","player":{"x":0,"z":0}}'],
    ['dificuldade-desconhecida-sem-jogador','{"v":3,"mission":"01","diff":"deus"}'],
    ['texto','olá'],
  ];
  for(const [name,raw] of cases){
    await page.evaluate(r=>{ localStorage.clear(); localStorage.setItem('sdp_checkpoint',r); localStorage.setItem('sdp_campaign','{"done":{"01":{"rating":"BOM","time":120,"diff":"marciano"},"xx":{"rating":"?"}},"carry":{"from":"01","weapons":"nenhuma"}}'); localStorage.setItem('sdp_settings','{"quality":"ultra","difficulty":"deus","fov":"largo","hud":7,"chars":"modelo","charsV":3}'); },raw);
    const n0=logs.length; await boot();
    const st=await page.evaluate(()=>{ const o={state:APP.state,menu:!document.querySelector('#menu').hidden,cont:!document.querySelector('#bContinue').hidden,note:!document.querySelector('#cpNote').hidden,noteText:document.querySelector('#cpNoteText').textContent,quality:settings.quality,diff:settings.difficulty,fov:settings.fov,hud:settings.hud};
      try{ renderOps(); o.ops=document.querySelectorAll('#opsList .opcard').length; o.op01=document.querySelector('#op01 .opst').textContent; }catch(e){ o.opsErr=e.message; }
      try{ openBriefing('02'); o.brief=true; goMenu(); }catch(e){ o.briefErr=e.message; }
      return o; });
    if(st.state!=='MENU'||!st.menu) f.push(name+': menu não abriu ('+st.state+')');
    if(st.cont) f.push(name+': botão Continuar apareceu para checkpoint ilegível');
    if(raw!==''&&!st.note) f.push(name+': faltou aviso claro de checkpoint ilegível');
    if(raw===''&&st.note) f.push(name+': checkpoint inexistente não deveria gerar aviso');
    if(st.opsErr) f.push(name+': tela de Operações quebrou — '+st.opsErr);
    if(st.briefErr) f.push(name+': dossiê quebrou — '+st.briefErr);
    if(st.ops!==24) f.push(name+': esperados 24 cartões de operação, vieram '+st.ops);
    if(st.quality!=='medio'||st.diff!=='soldado'||st.fov!==75||st.hud!=='dynamic') f.push(name+': ajustes inválidos não voltaram ao padrão ('+JSON.stringify([st.quality,st.diff,st.fov,st.hud])+')');
    for(const e of errorsOf(logs.slice(n0))) f.push(name+': '+e);
  }
  // 3) descartar checkpoint pelo aviso limpa e devolve o menu normal
  const d=await page.evaluate(()=>{ localStorage.setItem('sdp_checkpoint','{quebrado'); goMenu(); const shown=!document.querySelector('#cpNote').hidden&&!document.querySelector('#bCpDiscard').hidden; document.querySelector('#bCpDiscard').click(); return {shown,after:document.querySelector('#cpNote').hidden,raw:localStorage.getItem('sdp_checkpoint')}; });
  if(!d.shown||!d.after||d.raw!==null) f.push('botão "Descartar checkpoint" não limpou o estado: '+JSON.stringify(d));
  // 4) backup: principal corrompido depois de dois checkpoints válidos → Continuar usa a cópia
  const b=await page.evaluate(()=>{ localStorage.clear(); startPlaying(null,'02'); for(let i=0;i<20;i++) simStep(CFG.step); checkpoint(); const t1=G.cp.time; for(let i=0;i<60;i++) simStep(CFG.step); checkpoint();
    const hasBak=!!localStorage.getItem('sdp_checkpoint_bak'); localStorage.setItem('sdp_checkpoint',localStorage.getItem('sdp_checkpoint').slice(0,200));
    G=null; goMenu(); const st=readStoredCheckpoint(); const cont=!document.querySelector('#bContinue').hidden, note=document.querySelector('#cpNoteText').textContent;
    document.querySelector('#bContinue').click(); return {hasBak,source:st.source,cont,note,state:APP.state,level:G&&G.levelId,time:G&&G.time,t1}; });
  if(!b.hasBak) f.push('cópia de segurança do checkpoint não foi gravada');
  if(b.source!=='backup'||!b.cont) f.push('checkpoint principal truncado: backup não foi oferecido ('+JSON.stringify(b)+')');
  if(!/cópia de segurança/.test(b.note)) f.push('uso do backup sem aviso ao jogador');
  if(b.state!=='PLAYING'||b.level!=='02') f.push('Continuar pelo backup não entrou na operação 02');
  // 5) checkpoint válido segue funcionando de ponta a ponta pelo menu
  const g=await page.evaluate(()=>{ localStorage.clear(); startPlaying(null,'03'); for(let i=0;i<40;i++) simStep(CFG.step); G.player.hp=63; checkpoint(); const px=G.player.pos.x; G=null; goMenu();
    const cont=!document.querySelector('#bContinue').hidden, info=document.querySelector('#contInfo').textContent, note=!document.querySelector('#cpNote').hidden; document.querySelector('#bContinue').click();
    return {cont,info,note,state:APP.state,level:G&&G.levelId,dx:G?Math.abs(G.player.pos.x-px):9,hp:G&&G.player.hp}; });
  if(!g.cont||g.note||!g.info) f.push('checkpoint válido: Continuar/resumo incorretos '+JSON.stringify(g));
  if(g.state!=='PLAYING'||g.level!=='03'||g.dx>.01||g.hp!==63) f.push('checkpoint válido não restaurou o estado: '+JSON.stringify(g));
  for(const e of errorsOf(logs)) if(!f.includes('console: '+e)) f.push('console: '+e);
  finish('validação e migração de saves',[...new Set(f)],Object.keys(a.reasons).length+' payloads reprovados com motivo, '+Object.keys(a.fixed||{}).length+' consertados e carregados, '+cases.length+' menus com armazenamento corrompido');
}).catch(e=>{ console.error(e); process.exit(1); });
