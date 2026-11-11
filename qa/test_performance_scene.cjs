'use strict';
// Uso: node qa/test_performance_scene.cjs            (15 s por cena)
//      QA_PERF_SECONDS=120 node qa/test_performance_scene.cjs   (protocolo da auditoria: 2 min por cena)
//      QA_PERF_HEADED=1 ...                          (janela real, usa a GPU da máquina)
// Captura repetível: mesma cena, sem entrada, laço real do jogo (requestAnimationFrame).
// IMPORTANTE: em modo headless o Chromium renderiza por SOFTWARE (SwiftShader). Os números de
// FPS/tempo de quadro daqui servem para comparar revisões na mesma máquina e achar regressões —
// NÃO são o desempenho em aparelhos reais. Chamadas de desenho, triângulos e recursos são exatos.
const fs=require('node:fs'),path=require('node:path');
const {withGame,errorsOf,ROOT}=require('./lib/harness.cjs');
const SECS=Math.max(3,+process.env.QA_PERF_SECONDS||15), WARM=Math.min(30,Math.max(2,SECS/4));
withGame(async({page,logs})=>{
  await page.evaluate(()=>{ settings.autoRes=false; settings.quality='medio'; RES_SCALE.reset(); resize(); APP.noLock=true; CHEATS.god=true; CHEATS.ghost=true; });
  const scenes=[['menu','Menu (porão, Modelo 3D)',null],['01','Operação 01 — rua de Paris','01'],['09','Operação 09 — porto e lancha','09'],['21','Operação 21 — Levante Final','21'],['S1','Secreta S1 — cães (pastor GLB)','S1']];
  const rows=[]; const f=[];
  for(const [key,label,id] of scenes){
    const n0=logs.length;
    await page.evaluate(id=>{ if(id) startPlaying(null,id); else { G=null; goMenu(); } },id);
    await page.waitForTimeout(WARM*1000);
    await page.evaluate(()=>{ PERF.reset(); window.__calls=[]; window.__iv=setInterval(()=>window.__calls.push([renderer.info.render.calls,renderer.info.render.triangles]),250); });
    await page.waitForTimeout(SECS*1000);
    const r=await page.evaluate(()=>{ clearInterval(window.__iv); const p=PERF.snapshot(), c=window.__calls, avg=k=>c.length?Math.round(c.reduce((a,x)=>a+x[k],0)/c.length):0;
      return Object.assign(p,{callsAvg:avg(0),trisAvg:avg(1),ai:AI_BUDGET.ms,lodFar:LOD_STATS.far,actors:G?G.actors.length:0,mzAtlas:MZ.tex.size,latePaints:MZ.latePaints,diag:DIAG.log.filter(d=>!/SAVE_/.test(d.code)).map(d=>d.code)}); });
    r.key=key; r.label=label; rows.push(r);
    console.log('medido: '+label.padEnd(34)+' FPS '+r.fps.toFixed(1).padStart(5)+' · p50 '+r.p50.toFixed(1)+' p95 '+r.p95.toFixed(1)+' p99 '+r.p99.toFixed(1)+' ms · 1% low '+r.low1.toFixed(1)+' · sim '+r.simMsAvg.toFixed(2)+' ms · descartado '+r.droppedSimMs.toFixed(0)+' ms · '+r.callsAvg+' chamadas · '+r.trisAvg+' tri · '+r.geometries+'g/'+r.textures+'t');
    if(r.samples<3) f.push(key+': laço de quadros parado ('+r.samples+' amostras)');
    if(id&&r.simSteps<10) f.push(key+': simulação não avançou');
    if(r.latePaints) f.push(key+': '+r.latePaints+' atlas do soldado pintado(s) durante o jogo (pré-aquecimento falhou)');
    for(const e of errorsOf(logs.slice(n0))) f.push(key+': '+e);
  }
  const env=await page.evaluate(()=>{ const gl=renderer.getContext(), ext=gl.getExtension('WEBGL_debug_renderer_info'); return {gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'desconhecida',ua:navigator.userAgent,res:innerWidth+'×'+innerHeight,dpr:devicePixelRatio,build:BUILD_ID,quality:settings.quality}; });
  const dir=path.join(ROOT,'qa-report'); fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'desempenho.json'),JSON.stringify({env,seconds:SECS,generatedAt:new Date().toISOString(),rows},null,1));
  const soft=/swiftshader|llvmpipe|software/i.test(env.gpu);
  const md=['# Captura de desempenho por cena','',`Build \`${env.build}\` · perfil ${env.quality} · ${env.res} · DPR ${env.dpr} · ${SECS} s por cena após ${WARM} s de aquecimento · sem entrada.`,'',`**Renderizador:** ${env.gpu}`,'',
    soft?'> **Renderização por software.** FPS e tempos de quadro abaixo NÃO representam aparelhos reais; servem só para comparar revisões nesta mesma máquina. Chamadas de desenho, triângulos e contagem de recursos independem da GPU.':'> Medido com GPU real desta máquina.','',
    '| Cena | FPS médio | 1% low | p50 ms | p95 ms | p99 ms | sim ms/quadro | descartado ms | draw calls | triângulos | geometrias | texturas | programas | LOD longe |','|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...rows.map(r=>`| ${r.label} | ${r.fps.toFixed(1)} | ${r.low1.toFixed(1)} | ${r.p50.toFixed(1)} | ${r.p95.toFixed(1)} | ${r.p99.toFixed(1)} | ${r.simMsAvg.toFixed(2)} | ${r.droppedSimMs.toFixed(0)} | ${r.callsAvg} | ${r.trisAvg} | ${r.geometries} | ${r.textures} | ${r.programs} | ${r.lodFar}/${r.actors} |`),'',
    'Pendente (não medido aqui): Android físico, PC fraco e PC médio com GPU; memória ao longo de 60 minutos.',''].join('\n');
  fs.writeFileSync(path.join(dir,'desempenho.md'),md);
  if(f.length){ console.error('FALHOU: captura de desempenho'); for(const x of f) console.error('  - '+x); process.exit(1); }
  console.log('PASSOU: captura de desempenho — '+rows.length+' cenas, '+SECS+' s cada; relatório em qa-report/desempenho.md'+(soft?' (renderização por software: não usar como FPS de aparelho real)':''));
},{}).catch(e=>{ console.error(e); process.exit(1); });
