'use strict';
// Uso: node qa/test_operation_progress.cjs [IDs...]      ex.: node qa/test_operation_progress.cjs 01 09 S1
// Matriz honesta por operação (REV-A · P0-05). Cada coluna diz exatamente o que foi exercitado:
//   INICIO       fase monta, jogador nasce em posição válida, há objetivo obrigatório ativo
//   SIMULACAO    10 s de simulação (600 passos) sem exceção nem estado numérico inválido
//   MOVIMENTO    o jogador consegue sair do ponto de início (detecta nascer preso)
//   CHECKPOINT   checkpoint gravado passa íntegro pelo validador, sem consertos
//   LOAD         carregar o checkpoint restaura posição, objetivos, portas e inimigos; segue simulando
//   MORTE        morrer leva à tela de fracasso; "Recomeçar a missão" volta ao jogo
//   TRANSICAO    conclusão FORÇADA (missionComplete) → relatório → próxima operação/créditos
//   MENU         voltar ao menu sem erro
//   OBJETIVOS / EXTRACAO   NÃO TESTADO: exigem jogar a fase. Este teste não declara fase zerada.
const fs=require('node:fs'),path=require('node:path');
const {withGame,errorsOf,ROOT}=require('./lib/harness.cjs');
const COLS=['INICIO','SIMULACAO','MOVIMENTO','CHECKPOINT','LOAD','MORTE','TRANSICAO','MENU','OBJETIVOS','EXTRACAO'];
withGame(async({page,logs})=>{
  await page.evaluate(()=>{ settings.autoRes=false; APP.noLock=true; });
  const all=await page.evaluate(()=>[...LEVEL_ORDER,...SECRET_ORDER]);
  const ids=process.argv.slice(2).length?process.argv.slice(2):all;
  const rows=[]; let failed=0;
  for(const id of ids){
    const row={id,name:'',notes:[]}; for(const c of COLS) row[c]='NÃO TESTADO';
    const n0=logs.length;
    const step=async(col,fn,arg)=>{ try{ const r=await page.evaluate(fn,arg); if(r&&r.fail){ row[col]='FALHOU'; row.notes.push(col+': '+r.fail); } else { row[col]='PASSOU'; if(r&&r.note) row.notes.push(col+': '+r.note); } return r; } catch(e){ row[col]='FALHOU'; row.notes.push(col+': exceção — '+String(e.message).split('\n')[0].slice(0,200)); return null; } };
    const a=await step('INICIO',id=>{ localStorage.removeItem('sdp_checkpoint'); localStorage.removeItem('sdp_checkpoint_bak'); startPlaying(null,id); const P=G.player, L=G.level;
      if(APP.state!=='PLAYING') return {fail:'estado '+APP.state};
      if(![P.pos.x,P.pos.y,P.pos.z,P.yaw,P.hp].every(isFinite)) return {fail:'jogador com valores inválidos'};
      if(!G.objectives.some(o=>!o.optional&&o.state==='active')) return {fail:'sem objetivo obrigatório ativo'};
      for(const e of G.enemies) if(![e.pos.x,e.pos.y,e.pos.z].every(isFinite)) return {fail:'inimigo '+e.id+' em posição inválida'};
      const before={x:P.pos.x,z:P.pos.z}; resolveCircle(P.pos,CFG.player.radius,P.pos.y,P.pos.y+1.7); const push=Math.hypot(P.pos.x-before.x,P.pos.z-before.z);
      if(push>.6) return {fail:'ponto de início dentro de um sólido (empurrado '+push.toFixed(2)+' m)'};
      return {name:L.name,op:L.op,enemies:G.enemies.length}; },id);
    if(a&&a.name) row.name=a.name;
    if(row.INICIO==='PASSOU'){
      await step('SIMULACAO',()=>{ const keepGod=CHEATS.god; CHEATS.god=true; try{ for(let i=0;i<600;i++) simStep(CFG.step); } finally { CHEATS.god=keepGod; }
        const P=G.player; if(![P.pos.x,P.pos.y,P.pos.z,P.hp].every(isFinite)) return {fail:'jogador com valores inválidos após simular'};
        for(const e of G.enemies) if(![e.pos.x,e.pos.y,e.pos.z,e.hp].every(isFinite)) return {fail:'inimigo '+e.id+' com valores inválidos'};
        if(P.pos.y<-30) return {fail:'jogador caiu do mapa (y='+P.pos.y.toFixed(1)+')'};
        MENU3D.on=false; updateCamera(.016); renderFrame(true,.016); return {}; });
      await step('MOVIMENTO',()=>{ const P=G.player, keepGod=CHEATS.god; CHEATS.god=true; let best=0;
        try{ for(const [mx,mz] of [[0,1],[0,-1],[1,0],[-1,0]]){ const x0=P.pos.x, z0=P.pos.z; for(let i=0;i<90;i++){ input.mx=mx; input.mz=mz; simStep(CFG.step); } best=Math.max(best,Math.hypot(P.pos.x-x0,P.pos.z-z0)); } }
        finally { CHEATS.god=keepGod; input.mx=0; input.mz=0; }
        if(best<.3) return G.flags&&Object.keys(G.flags).some(k=>/rid|s20|veh|boat|side|gondol/i.test(k))?{note:'jogador conduzido por veículo/trilho no início (deslocamento livre não se aplica)'}:{fail:'jogador não saiu do lugar em nenhuma direção (máx. '+best.toFixed(2)+' m)'};
        return {}; });
      const cp=await step('CHECKPOINT',()=>{ if(G.player.dead||G.ending) return {fail:'fase terminou sozinha durante a simulação ociosa'}; checkpoint(); const st=readStoredCheckpoint();
        if(!st.cp||st.source!=='main') return {fail:'checkpoint gravado não passou no validador ('+st.reason+')'};
        if(st.repaired.length) return {fail:'checkpoint recém-gravado precisou de conserto: '+st.repaired.join('; ')};
        return {}; });
      if(row.CHECKPOINT==='PASSOU') await step('LOAD',()=>{ const ref={x:G.player.pos.x,z:G.player.pos.z,obj:JSON.stringify(G.objectives.map(o=>[o.id,o.state])),dead:G.enemies.filter(e=>e.dead).map(e=>e.id).sort().join(),n:G.enemies.length,doors:JSON.stringify(Object.values(W.doors).map(d=>[d.id,d.state==='OPENING'?'OPEN':d.state]).sort()),docs:G.docs.length};
        const st=readStoredCheckpoint(); startPlaying(st.cp);
        if(APP.state!=='PLAYING') return {fail:'estado '+APP.state+' após carregar'};
        // Na 20 (sidecar em trilho) a própria fase recua o percurso alguns metros e retira os perseguidores ao restaurar: é o comportamento projetado.
        const onRails=G.levelId==='20';
        if(!onRails&&Math.hypot(G.player.pos.x-ref.x,G.player.pos.z-ref.z)>.05) return {fail:'posição do jogador não restaurada'};
        if(JSON.stringify(G.objectives.map(o=>[o.id,o.state]))!==ref.obj) return {fail:'objetivos diferentes após carregar'};
        if(!onRails&&G.enemies.filter(e=>e.dead).map(e=>e.id).sort().join()!==ref.dead) return {fail:'lista de inimigos abatidos diferente após carregar'};
        if(G.enemies.length<ref.n) return {fail:'inimigos sumiram após carregar ('+G.enemies.length+' < '+ref.n+')'};
        if(JSON.stringify(Object.values(W.doors).map(d=>[d.id,d.state==='OPENING'?'OPEN':d.state]).sort())!==ref.doors) return {fail:'estado das portas diferente após carregar'};
        if(G.docs.length!==ref.docs) return {fail:'documentos diferentes após carregar'};
        const keepGod=CHEATS.god; CHEATS.god=true; try{ for(let i=0;i<180;i++) simStep(CFG.step); } finally { CHEATS.god=keepGod; }
        if(!G.cp) return {fail:'checkpoint em memória perdido (botão "Voltar ao checkpoint" sumiria)'};
        return onRails?{note:'fase em trilho: posição e perseguidores são reposicionados pela própria fase ao restaurar (não comparados)'}:{}; });
      // morte → tela de fracasso → recomeçar
      await step('MORTE',()=>{ startPlaying(null,G.levelId); CHEATS.god=false; hurtPlayer(99999,{x:G.player.pos.x+1,z:G.player.pos.z}); if(!G.player.dead) return {fail:'dano letal não matou o jogador'}; return {}; });
      if(row.MORTE==='PASSOU'){ await page.waitForFunction(()=>APP.state==='FAILED',{timeout:15000}).catch(()=>{});
        await step('MORTE',()=>{ if(APP.state!=='FAILED') return {fail:'tela de fracasso não abriu (estado '+APP.state+')'}; if(document.querySelector('#failed').hidden) return {fail:'tela de fracasso oculta'};
          const id=G.levelId; document.querySelector('#bRetryAll').click(); if(APP.state!=='PLAYING'||G.levelId!==id||G.player.dead) return {fail:'"Recomeçar a missão" não devolveu o jogo'}; return {}; }); }
      // conclusão forçada → relatório → próxima
      await step('TRANSICAO',()=>{ if(APP.state!=='PLAYING') startPlaying(null,G.levelId); missionComplete(); if(!G.ending) return {fail:'missionComplete não encerrou a fase'}; return {}; });
      if(row.TRANSICAO==='PASSOU'){ await page.waitForFunction(()=>APP.state==='RESULTS',{timeout:15000}).catch(()=>{});
        await step('TRANSICAO',()=>{ if(APP.state!=='RESULTS') return {fail:'relatório não abriu (estado '+APP.state+')'}; const L=G.level, ORD=L.secret?SECRET_ORDER:LEVEL_ORDER, nx=ORD[ORD.indexOf(G.levelId)+1];
          if(localStorage.getItem('sdp_checkpoint')) return {fail:'checkpoint não foi apagado ao concluir'};
          const camp=campaign(); if(!camp.done[G.levelId]) return {fail:'conclusão não registrada na campanha'};
          const b=document.querySelector('#bNext');
          if(L.finale){ if(b.hidden||b.textContent!=='Créditos') return {fail:'final sem botão de créditos'}; b.click(); if(document.querySelector('#credits').hidden) return {fail:'créditos não abriram'}; document.querySelector('#bCredBack').click(); if(APP.state!=='MENU') return {fail:'créditos não voltaram ao menu'}; return {note:'final: créditos e retorno ao menu'}; }
          if(nx){ if(b.hidden) return {fail:'sem botão para a próxima operação'}; b.click(); if(document.querySelector('#briefing').hidden||APP.briefLevel!==nx) return {fail:'próxima operação não abriu o dossiê ('+APP.briefLevel+' ≠ '+nx+')'}; return {}; }
          if(!b.hidden) return {fail:'última operação da lista com botão "próxima"'}; return {note:'última da lista: sem próxima operação'}; }); }
      await step('MENU',()=>{ G=null; goMenu(); if(APP.state!=='MENU'||document.querySelector('#menu').hidden) return {fail:'menu não abriu'}; MENU3D.on=true; MENU3D.update(.016); renderFrame(false,.016); return {}; });
    }
    const errs=errorsOf(logs.slice(n0)); if(errs.length){ row.notes.push('console: '+errs.slice(0,3).join(' | ')); if(row.SIMULACAO==='PASSOU') row.SIMULACAO='FALHOU'; }
    if(COLS.some(c=>row[c]==='FALHOU')) failed++;
    rows.push(row);
    console.log(id.padEnd(3)+COLS.slice(0,8).map(c=>(row[c]==='PASSOU'?'ok':row[c]==='FALHOU'?'FALHOU':'--').padEnd(7)).join('')+(row.notes.length?'  '+row.notes.join(' ; ').slice(0,220):''));
  }
  const dir=path.join(ROOT,'qa-report'); fs.mkdirSync(dir,{recursive:true});
  const build=await page.evaluate(()=>BUILD_ID);
  fs.writeFileSync(path.join(dir,'operacoes.json'),JSON.stringify({build,generatedAt:new Date().toISOString(),renderer:'Chromium headless (SwiftShader, sem GPU)',rows},null,1));
  const md=['# Matriz de QA por operação','',`Gerado por \`qa/test_operation_progress.cjs\` · build \`${build}\` · Chromium headless (SwiftShader).`,'',
    '**Leitura correta:** `PASSOU` vale só para o que a coluna exercita (ver cabeçalho do teste). `TRANSICAO` usa conclusão **forçada**; `OBJETIVOS` e `EXTRACAO` continuam `NÃO TESTADO` até haver playtest humano gravado. Nenhuma linha aqui significa "fase zerada".','',
    '| ID | Operação | '+COLS.join(' | ')+' |','|---|---|'+COLS.map(()=>'---').join('|')+'|',
    ...rows.map(r=>`| ${r.id} | ${r.name} | `+COLS.map(c=>r[c]).join(' | ')+' |'),'',
    ...rows.filter(r=>r.notes.length).map(r=>`- **${r.id}** — ${r.notes.join(' ; ')}`),''].join('\n');
  fs.writeFileSync(path.join(dir,'operacoes.md'),md);
  if(failed){ console.error('FALHOU: '+failed+' de '+rows.length+' operações com falha (detalhes em qa-report/operacoes.md)'); process.exit(1); }
  console.log('PASSOU: '+rows.length+' operações — início, simulação, movimento, checkpoint, load, morte, transição forçada e menu. OBJETIVOS/EXTRACAO: NÃO TESTADO (exigem playtest).');
}).catch(e=>{ console.error(e); process.exit(1); });
