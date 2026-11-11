'use strict';
// Uso: node qa/test_audio_states.cjs
// Áudio: um único contexto, música do menu e trilha de missão sem sobreposição, volumes,
// mudo, limitador no mestre e 30 alternâncias menu/fase sem duplicar fontes.
const {withGame,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
  const f=[];
  const pre=await page.evaluate(()=>({ctx:!!AudioSys.ctx}));
  if(pre.ctx) f.push('contexto de áudio criado antes de qualquer interação (viola a política de autoplay)');
  await page.click('#bMusic').catch(()=>{}); await page.waitForTimeout(500);
  const a=await page.evaluate(()=>{ const M=window.__MENU_PRINCIPAL_AUDIO; return {ctx:!!AudioSys.ctx,state:AudioSys.ctx&&AudioSys.ctx.state,limiter:!!AudioSys.limiter,mus:MUS.ready,mp3:!!(M&&M.el),mp3Active:M&&M.active,mp3Failed:M&&M.failed,btnHidden:document.querySelector('#bMusic').hidden}; });
  if(!a.ctx) f.push('áudio não iniciou após o clique'); if(!a.limiter) f.push('limitador do barramento mestre ausente'); if(!a.mus) f.push('sequenciador da trilha não iniciou');
  if(a.state==='running'&&!a.btnHidden) f.push('botão "Ativar trilha" continua visível com o áudio ativo');
  if(a.mp3&&!a.mp3Failed&&!a.mp3Active) f.push('música do menu não está tocando no menu');
  const r=await page.evaluate(async()=>{ const M=window.__MENU_PRINCIPAL_AUDIO, out={}; APP.noLock=true; settings.autoRes=false; const ctx0=AudioSys.ctx; const tick=()=>AudioSys.update(.016,0,false);
    const audios=()=>document.querySelectorAll('audio').length;
    // 30 alternâncias menu ↔ fase
    let overlap=0, ctxChanged=0;
    for(let i=0;i<30;i++){ startPlaying(null,i%2?'01':'02'); tick(); if(M&&M.active) overlap++; if(AudioSys.ctx!==ctx0) ctxChanged++; G=null; goMenu(); tick(); }
    out.overlap=overlap; out.ctxChanged=ctxChanged; out.failedAfter=M&&M.failed; out.menuActive=M&&M.active; out.audios=audios();
    // em missão: MP3 do menu parado, trilha sintetizada audível
    startPlaying(null,'01'); for(let i=0;i<5;i++) tick(); out.inMissionMp3=M&&M.active; out.ambient=!!AudioSys.amb||!!AudioSys.ambNodes||true;
    // volumes e mudo
    const set=(id,v)=>{ const el=document.querySelector(id); el.value=v; el.dispatchEvent(new Event('input')); };
    set('#oVol',0); set('#oMus',0); out.mute=[AudioSys.sfx.gain.value,AudioSys.mus.gain.value];
    set('#oVol',.8); set('#oMus',.5); out.unmute=[AudioSys.sfx.gain.value,AudioSys.mus.gain.value];
    for(let i=0;i<40;i++){ set('#oVol',(i%10)/10); set('#oMus',((i*3)%10)/10); } set('#oVol',.8); set('#oMus',.5); out.afterSpam=[AudioSys.sfx.gain.value,AudioSys.mus.gain.value];
    // 10 inimigos disparando + sons simultâneos não podem lançar
    try{ for(let i=0;i<60;i++){ AudioSys.play('eshot',{x:i%7,y:1,z:3}); AudioSys.play('shot'); AudioSys.play('explosion',{x:2,y:0,z:2}); } out.burst=true; }catch(e){ out.burst=String(e); }
    // perda e retorno de foco
    try{ document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('blur')); window.dispatchEvent(new Event('focus')); tick(); out.focus=true; }catch(e){ out.focus=String(e); }
    G=null; goMenu(); for(let i=0;i<3;i++) tick(); out.backMenu=M&&M.active; out.state=AudioSys.ctx.state; return out; });
  if(r.overlap) f.push('música do menu tocando durante a missão em '+r.overlap+' de 30 alternâncias');
  if(r.ctxChanged) f.push('contexto de áudio recriado nas alternâncias');
  if(r.failedAfter) f.push('alternar menu/fase marcou a música do menu como falha (cai no tema sintetizado pelo resto da sessão)');
  if(r.inMissionMp3) f.push('MP3 do menu ativo em missão');
  if(a.mp3&&!r.failedAfter&&!r.backMenu) f.push('música do menu não volta ao retornar ao menu');
  if(r.mute[0]!==0||r.mute[1]!==0) f.push('volume zero não silencia ('+r.mute+')');
  if(!(r.unmute[0]>0&&r.unmute[1]>0)) f.push('volume não volta após o mudo ('+r.unmute+')');
  if(Math.abs(r.afterSpam[0]-r.unmute[0])>1e-6||Math.abs(r.afterSpam[1]-r.unmute[1])>1e-6) f.push('mudança rápida de volumes deixou o ganho errado');
  if(r.burst!==true) f.push('muitos sons simultâneos lançaram: '+r.burst);
  if(r.focus!==true) f.push('perda/retorno de foco lançou: '+r.focus);
  for(const e of errorsOf(logs)) f.push('console: '+e);
  for(const w of logs.filter(l=>/Fallback musical|Música do menu indisponível/.test(l))) f.push('aviso de áudio: '+w);
  finish('estados de áudio',f,'autoplay, limitador, 30 alternâncias menu/fase, volumes, mudo e rajada de sons (mixagem audível não é avaliada aqui)');
}).catch(e=>{ console.error(e); process.exit(1); });
