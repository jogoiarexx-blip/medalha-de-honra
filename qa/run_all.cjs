'use strict';
// Uso: node qa/run_all.cjs            roda toda a suíte (estrutural + navegador)
//      node qa/run_all.cjs --rapido   pula a matriz das 27 operações e a captura de desempenho
// Gera qa-report/RESUMO.md com o que foi executado, o que passou e o que NÃO foi executado.
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'), quick=process.argv.includes('--rapido');
const SUITE=[
  ['test_chania.cjs','Isolado','CP03G Chania'],
  ['test_cp03g_browser.cjs','Navegador','CP03G porto, investigação e embarque'],
  ['test_bir_zitoun.cjs','Isolado','CP03F cisterna e fumaças'],
  ['test_cp03f_browser.cjs','Navegador','CP03F resgate e retomada'],
  ['test_depot_scenery.cjs','Isolado','CP03E depósito'],
  ['test_cp03e_browser.cjs','Navegador','CP03E depósito'],
  ['test_bordj_scenery.cjs','Isolado','CP-03D: barracas, arame e cenários do Bordj'],
  ['test_cp03d_browser.cjs','Navegador','CP-03D: fotos, passagens, recursos e recarga'],
  ['test_medina_scenery.cjs','Isolado','CP-03C: fachada, vidros e kit da Medina'],
  ['test_cp03c_browser.cjs','Navegador','CP-03C: cenários, passagens, recursos e recarga'],
  ['test_paris_extension.cjs','Isolado','CP-03B: cenários 02–04 e fachada diurna'],
  ['test_cp03b_browser.cjs','Navegador','CP-03B: capturas, materiais e passagens'],
  ['test_paris_scenery.cjs','Isolado','CP-03A: decoração, materiais e colisores da fonte'],
  ['test_cp03_browser.cjs','Navegador','CP-03A: cenários antes/depois e orçamento'],
  ['test_vertical.cjs','Isolado','CP-02B: cilindro fechado, restauração e recuperação do aliado'],
  ['test_cp02b_browser.cjs','Navegador','CP-02B: tiros verticais e saves em piso elevado'],
  ['test_combat.cjs','Isolado','Combate: dano único, armadura, capacete e alturas'],
  ['test_cp02_browser.cjs','Navegador','CP-02A: combate e alturas com três estilos'],
  ['test_request_failure.cjs','Isolado','Cancelamento esperado de stream durante recarga'],
  ['test_input_session.cjs','Isolado','Entradas em pausa/foco e tarefas por sessão (Node VM)'],
  ['test_cp01_browser.cjs','Navegador','CP-01: entradas, sessão e objetivos da 01 com posicionamento controlado'],
  ['test_three_local.js','Estrutural','Three.js r128 local e ordem dos scripts'],
  ['test_menu_principal.js','Estrutural','Música do menu (arquivo e integração)'],
  ['test_material_paris.js','Estrutural','Materiais das fachadas de Paris'],
  ['test_fase9_lancha_refinada2.js','Estrutural','Lancha da operação 09'],
  ['test_pastor_visibilidade.js','Estrutural','Pastor-alemão: GLB e integração'],
  ['test_glb_assets.cjs','Estrutural','Arquivos GLB: contêiner, índices, UV, pesos, animações'],
  ['test_registry_27.cjs','Navegador','Contrato das 27 operações'],
  ['test_save_migration.cjs','Navegador','Saves: validação, migração, backup, menu com dados corrompidos'],
  ['test_frame_pacing.cjs','Navegador','Passo fixo: sem perda silenciosa de tempo'],
  ['test_state_transitions.cjs','Navegador','Telas: menu, dossiê, jogo, documento, pausa, relatório'],
  ['test_reloads_memory.cjs','Navegador','Memória de GPU em reinícios e trocas'],
  ['test_hardware_profiles.cjs','Navegador','Perfis gráficos, estilos, formatos de tela, toque'],
  ['test_audio_states.cjs','Navegador','Estados de áudio'],
  ['test_ai_budget.cjs','Navegador','Orçamento da IA (10/25/40 inimigos)'],
  ['browser_pastor_diagnostico.cjs','Navegador','Pastor-alemão no menu e na S1 (regressão existente)'],
  ['test_operation_progress.cjs','Navegador','Matriz por operação (27 fases)','lento'],
  ['test_performance_scene.cjs','Navegador','Captura de desempenho por cena','lento'],
];
const rows=[]; let failed=0;
for(const [file,kind,what,slow] of SUITE){
  if(quick&&slow){ rows.push({file,kind,what,status:'NÃO EXECUTADO',ms:0,line:'pulado com --rapido'}); console.log('--   '+file+' (pulado)'); continue; }
  const t0=Date.now(); const r=spawnSync(process.execPath,[path.join(__dirname,file)],{cwd:ROOT,encoding:'utf8',timeout:20*60*1000,maxBuffer:64*1024*1024});
  const out=(r.stdout||'')+(r.stderr||''), ok=r.status===0; if(!ok) failed++;
  const lines=out.trim().split('\n'); const line=(lines.filter(l=>/^(PASSOU|FALHOU)/.test(l)).pop()||lines.pop()||'').slice(0,300);
  rows.push({file,kind,what,status:ok?'TESTE AUTOMÁTICO PASSOU':'FALHOU',ms:Date.now()-t0,line,detail:ok?'':lines.filter(l=>/^\s+-/.test(l)).slice(0,8).join('\n')});
  console.log((ok?'ok   ':'FALHA')+' '+file.padEnd(34)+((Date.now()-t0)/1000).toFixed(1).padStart(7)+' s  '+line.slice(0,150));
  if(!ok&&rows[rows.length-1].detail) console.log(rows[rows.length-1].detail);
}
const dir=path.join(ROOT,'qa-report'); fs.mkdirSync(dir,{recursive:true});
const md=['# Resumo da suíte de QA','',`Gerado por \`qa/run_all.cjs\` em ${new Date().toISOString()}.`,'',
  '| Teste | Tipo | Cobre | Status | Tempo |','|---|---|---|---|---:|',
  ...rows.map(r=>`| \`qa/${r.file}\` | ${r.kind} | ${r.what} | ${r.status} | ${(r.ms/1000).toFixed(1)} s |`),'',
  '## O que esta suíte NÃO executa','',
  '- Playthrough humano das 27 operações (objetivos jogados até a extração, segredos, chefes, créditos assistidos). Status: `NÃO TESTADO`.',
  '- FPS em aparelhos reais (Android físico, PC fraco, PC médio com GPU) e memória por 60 minutos.',
  '- Qualidade visual das animações quadro a quadro e mixagem de áudio ouvida por uma pessoa.','',
  ...rows.filter(r=>r.status==='FALHOU').map(r=>'### Falha: '+r.file+'\n\n```\n'+r.line+'\n'+r.detail+'\n```\n')].join('\n');
fs.writeFileSync(path.join(dir,'RESUMO.md'),md);
console.log('\n'+(failed?'FALHOU: '+failed+' de ':'PASSOU: ')+rows.filter(r=>r.status!=='NÃO EXECUTADO').length+' testes executados'+(failed?' com falha':'')+'. Resumo em qa-report/RESUMO.md');
process.exit(failed?1:0);
