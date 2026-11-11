'use strict';
// Uso: node qa/test_frame_pacing.cjs
// REV-B · P0-02 — o passo fixo não descarta tempo em silêncio: o atraso é recuperado
// nos quadros seguintes e só o que passa do teto é descartado, com registro.
const {withGame,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
  const r=await page.evaluate(()=>{
    settings.autoRes=false; startPlaying(null,'01'); CHEATS.god=true;
    const run=(seq,reps)=>{ acc=0; PERF.reset(); let sim=0, wall=0, maxSteps=0; const t0=simTime;
      for(let k=0;k<reps;k++) for(const ms of seq){ const dt=Math.min(SIM.maxFrame,ms/1000); if(ms/1000>SIM.maxFrame) PERF.drop(ms-SIM.maxFrame*1000); const n=advanceSim(dt); wall+=ms; maxSteps=Math.max(maxSteps,n); }
      sim=(simTime-t0)*1000; return {wall,sim,backlog:acc*1000,dropped:PERF.droppedSimMs,events:PERF.droppedEvents,maxSteps,alpha:SIM.alpha}; };
    const out={};
    out.alternado=run([16.7,40,80],60);          // cenário da auditoria
    out.estavel60=run([16.6667],300);
    out.estavel144=run([6.944],600);
    out.trinta=run([33.3],200);
    out.pico=run([16.7,16.7,16.7,100,16.7,16.7,16.7,16.7,16.7,16.7],30);   // um quadro de 100 ms a cada 10
    out.sobrecarga=run([100],60);                // máquina que não acompanha: aqui o descarte é esperado e precisa ser contado
    out.travada=run([16.7,16.7,400,16.7,16.7],10);   // engasgo de 400 ms
    out.cfg={step:CFG.step*1000,maxSteps:SIM.maxSteps,maxBacklog:SIM.maxBacklog*1000,maxFrame:SIM.maxFrame*1000};
    // interpolação: alpha sempre em [0,1] e câmera entre o passo anterior e o atual
    acc=0; const P=G.player; let bad=0; input.mz=1;
    for(let i=0;i<120;i++){ advanceSim(.011); updateCamera(.011); const a=SIM.alpha; if(!(a>=0&&a<=1)) bad++; const d=Math.hypot(camera.position.x-P.pos.x,camera.position.z-P.pos.z); if(d>CFG.player.sprint*CFG.step*1.5) bad++; }
    input.mz=0; out.interpBad=bad;
    return out;
  });
  const f=[], near=(a,b,tol)=>Math.abs(a-b)<=tol;
  const acct=(k,o)=>{ if(!near(o.sim+o.backlog+o.dropped,o.wall,1)) f.push(k+': tempo não fecha — simulado '+o.sim.toFixed(1)+' + pendente '+o.backlog.toFixed(1)+' + descartado '+o.dropped.toFixed(1)+' ≠ real '+o.wall.toFixed(1)+' ms (perda silenciosa)'); };
  for(const k of ['alternado','estavel60','estavel144','trinta','pico','sobrecarga','travada']) acct(k,r[k]);
  for(const k of ['alternado','estavel60','estavel144','trinta','pico']) if(r[k].dropped>0) f.push(k+': descartou '+r[k].dropped.toFixed(1)+' ms sem necessidade');
  if(r.alternado.maxSteps>r.cfg.maxSteps) f.push('mais passos por quadro que o teto');
  if(r.sobrecarga.dropped<=0||r.sobrecarga.events<=0) f.push('sobrecarga contínua: o descarte não foi registrado');
  if(r.sobrecarga.backlog>r.cfg.maxBacklog+.01) f.push('atraso acumulado passou do teto');
  if(r.travada.dropped<10*290) f.push('engasgo de 400 ms: tempo acima do teto de quadro não foi contabilizado ('+r.travada.dropped.toFixed(0)+' ms)');
  if(r.interpBad) f.push('interpolação fora do intervalo em '+r.interpBad+' quadro(s)');
  for(const e of errorsOf(logs)) f.push('console: '+e);
  console.log('medido: alternado 16,7/40/80 ms → simulado '+r.alternado.sim.toFixed(0)+' de '+r.alternado.wall.toFixed(0)+' ms, descartado '+r.alternado.dropped.toFixed(1)+' ms; sobrecarga 100 ms/quadro → descartado '+r.sobrecarga.dropped.toFixed(0)+' ms em '+r.sobrecarga.events+' registros');
  finish('passo fixo e acumulador',f,'nenhuma perda silenciosa; teto de '+r.cfg.maxSteps+' passos e '+r.cfg.maxBacklog.toFixed(0)+' ms de atraso');
}).catch(e=>{ console.error(e); process.exit(1); });
