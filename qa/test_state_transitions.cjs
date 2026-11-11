'use strict';
// Uso: node qa/test_state_transitions.cjs
// Fluxo real de telas, clicando nos botões: menu → operações → dossiê → jogo → documento →
// pausa → opções → continuar → checkpoint → relatório → menu. Sem erros de console.
const {withGame,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
  const f=[]; const st=()=>page.evaluate(()=>({app:APP.state,stack:[...UI.stack],frozen:UI.frozen(),t:G?G.time:0,level:G&&G.levelId}));
  const expect=async(label,fn)=>{ const s=await st(); const why=fn(s); if(why) f.push(label+': '+why+' '+JSON.stringify(s)); };
  await page.evaluate(()=>{ settings.autoRes=false; APP.noLock=true; localStorage.clear(); goMenu(); });
  await expect('menu',s=>s.app!=='MENU'||!s.stack.includes('menu')?'menu não está aberto':'');
  await page.click('#bNew'); await expect('operações',s=>!s.stack.includes('ops')?'lista de operações não abriu':'');
  await page.click('#op01'); await expect('dossiê',s=>!s.stack.includes('briefing')?'dossiê não abriu':'');
  await page.click('#bBriefBack'); await expect('voltar do dossiê',s=>s.app!=='MENU'||!s.stack.includes('menu')?'não voltou ao menu':'');
  await page.click('#bNew'); await page.click('#op01'); await page.click('#bStart');
  await expect('iniciar',s=>s.app!=='PLAYING'||s.level!=='01'||s.frozen?'missão não iniciou':'');
  await page.waitForTimeout(600);
  const t1=(await st()).t; if(!(t1>0)) f.push('o tempo de missão não avança em jogo');
  // documento: congela, Esc fecha, jogo retoma sem pausa presa
  await page.evaluate(()=>openDoc('shiftlog')); await expect('documento',s=>!s.frozen||!s.stack.includes('doc')?'documento não congelou o jogo':'');
  const tDoc=(await st()).t; await page.waitForTimeout(400); if(Math.abs((await st()).t-tDoc)>1e-6) f.push('simulação continuou com documento aberto');
  const docText=await page.evaluate(()=>document.querySelector('#docPaper').textContent.length); if(docText<50) f.push('documento aberto sem texto');
  await page.keyboard.press('Escape'); await expect('fechar documento',s=>s.frozen||s.stack.includes('doc')||s.stack.includes('pause')?'documento não fechou limpo':'');
  // pausa → opções → voltar → continuar
  await page.evaluate(()=>openPause()); await expect('pausa',s=>!s.frozen||!s.stack.includes('pause')?'pausa não abriu':'');
  const tP=(await st()).t; await page.waitForTimeout(400); if(Math.abs((await st()).t-tP)>1e-6) f.push('simulação e IA continuaram durante a pausa');
  await page.click('#bPOptions'); await expect('opções na pausa',s=>!s.stack.includes('options')?'opções não abriram':'');
  await page.keyboard.press('Escape'); await expect('fechar opções',s=>s.stack.includes('options')||!s.stack.includes('pause')?'Esc não voltou para a pausa':'');
  const pauseVisible=await page.evaluate(()=>!document.querySelector('#pause').hidden); if(!pauseVisible) f.push('tela de pausa ficou oculta após fechar as opções (pausa irrecuperável)');
  // documento por cima da pausa não pode prender a pausa
  await page.evaluate(()=>openDoc('note')); await page.keyboard.press('Escape'); await expect('documento sobre a pausa',s=>s.stack.includes('doc')||!s.stack.includes('pause')?'fechar o documento desfez a pausa de forma inconsistente':'');
  await page.click('#bResume'); await expect('continuar',s=>s.app!=='PLAYING'||s.frozen?'jogo não retomou':'');
  await page.waitForTimeout(400); if(!((await st()).t>tP)) f.push('o tempo não voltou a correr após continuar');
  // diário não pausa
  await page.keyboard.press('Tab'); await expect('diário',s=>!s.stack.includes('journal')||s.frozen?'diário não abriu ou congelou o jogo':'');
  const jn=await page.evaluate(()=>{ toggleJournal(); toggleJournal(); toggleJournal(); return document.querySelectorAll('#jObj li').length+'/'+G.objectives.filter(o=>o.state!=='hidden').length; });
  { const [a,b]=jn.split('/'); if(a!==b) f.push('diário duplicou itens ao reabrir ('+jn+')'); }
  // checkpoint + voltar ao checkpoint pela pausa
  await page.evaluate(()=>{ if(UI.isOpen('journal')) toggleJournal(); checkpoint(); openPause(); });
  const cpBtn=await page.evaluate(()=>!document.querySelector('#bCheckpoint').hidden); if(!cpBtn) f.push('botão "Voltar ao checkpoint" ausente após checkpoint');
  await page.click('#bCheckpoint'); await expect('voltar ao checkpoint',s=>s.app!=='PLAYING'||s.frozen||s.level!=='01'?'não retomou do checkpoint':'');
  // sair para o menu pela pausa: Continuar aparece e funciona
  await page.evaluate(()=>openPause()); await page.click('#bQuit');
  await expect('sair para o menu',s=>s.app!=='MENU'?'não voltou ao menu':'');
  const cont=await page.evaluate(()=>!document.querySelector('#bContinue').hidden); if(!cont) f.push('progresso perdido: Continuar não aparece após sair para o menu');
  await page.click('#bContinue'); await expect('continuar do menu',s=>s.app!=='PLAYING'||s.level!=='01'?'Continuar não retomou a missão':'');
  // conclusão → relatório → menu
  await page.evaluate(()=>missionComplete()); await page.waitForFunction(()=>APP.state==='RESULTS',{timeout:15000}).catch(()=>{});
  await expect('relatório',s=>s.app!=='RESULTS'||!s.stack.includes('results')?'relatório não abriu':'');
  await page.click('#bResMenu'); await expect('menu final',s=>s.app!=='MENU'||!s.stack.includes('menu')?'não voltou ao menu':'');
  const end=await page.evaluate(()=>({cont:!document.querySelector('#bContinue').hidden,rec:document.querySelector('#recordLine').textContent,hud:document.querySelector('#hud').hidden}));
  if(end.cont) f.push('Continuar aparece depois de a missão ter sido concluída'); if(!/1 de 24/.test(end.rec)) f.push('registro de campanha não mostra a operação concluída ('+end.rec+')'); if(!end.hud) f.push('HUD visível no menu');
  // foco: perder a janela no meio do jogo não pode deixar teclas presas
  await page.click('#bNew'); await page.click('#op02'); await page.click('#bStart');
  const stuck=await page.evaluate(()=>{ keys.KeyW=true; input.fire=true; window.dispatchEvent(new Event('blur')); return {w:!!keys.KeyW,fire:!!input.fire}; });
  if(stuck.w||stuck.fire) f.push('perda de foco deixa entrada presa: '+JSON.stringify(stuck));
  for(const e of errorsOf(logs)) f.push('console: '+e);
  finish('transições de estado e telas',f,'menu → dossiê → jogo → documento → pausa → opções → checkpoint → relatório → menu');
}).catch(e=>{ console.error(e); process.exit(1); });
