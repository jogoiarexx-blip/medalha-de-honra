'use strict';
// Uso: node qa/test_ai_budget.cjs
// REV-G · P1-10 — custo MEDIDO do passo de simulação com 10, 25 e 40 inimigos em combate
// (CPU desta máquina; a GPU não participa). Falha se 40 inimigos estourarem o orçamento
// de um quadro de 60 Hz ou se o custo crescer de forma explosiva com a quantidade.
const {withGame,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
  const r=await page.evaluate(()=>{
    settings.autoRes=false; APP.noLock=true; const out=[];
    for(const n of [10,25,40]){
      startPlaying(null,'07'); CHEATS.god=true; const P=G.player;
      for(const e of G.enemies){ e.hp=0; e.killInstant(); }
      const made=[]; let k=0, guard=0;
      while(made.length<n&&guard++<4000){ const a=k*2.399963, rad=10+((k*7)%34); k++; const x=P.pos.x+Math.sin(a)*rad, z=P.pos.z+Math.cos(a)*rad; if(insideSolid(x,z,.5)) continue;
        const e=new Enemy({id:'st'+made.length,x,z,weapon:made.length%3?'rifle':'smg',helmet:true}); G.enemies.push(e); G.actors.push(e); addTakedown(e); e.enterCombat(P.pos.x,P.pos.z,true); made.push(e); }
      AI_BUDGET.ms=0; AI_BUDGET.peak=0; AI_BUDGET.far=1;
      for(let i=0;i<120;i++) simStep(CFG.step);                 // aquecimento (JIT, caminhos)
      AI_BUDGET.peak=0; const t0=performance.now(); let worst=0; const N=600, ts=new Float32Array(N);
      for(let i=0;i<N;i++){ const s=performance.now(); simStep(CFG.step); const d=performance.now()-s; ts[i]=d; if(d>worst) worst=d; }
      ts.sort(); const p95=ts[Math.floor(N*.95)], p99=ts[Math.floor(N*.99)];
      const total=performance.now()-t0; const alive=made.filter(e=>!e.dead).length, combat=made.filter(e=>!e.dead&&e.state!=='IDLE'&&e.state!=='PATROL').length;
      out.push({n,placed:made.length,alive,combat,avg:total/N,worst,p95,p99,ai:AI_BUDGET.ms,aiPeak:AI_BUDGET.peak,far:AI_BUDGET.far,finite:made.every(e=>isFinite(e.pos.x)&&isFinite(e.pos.z))});
    }
    return out;
  });
  const f=[];
  for(const o of r){ console.log('medido: '+String(o.n).padStart(2)+' inimigos ('+o.combat+' alertas/em combate) → passo médio '+o.avg.toFixed(2)+' ms, p95 '+o.p95.toFixed(2)+', p99 '+o.p99.toFixed(2)+', pior '+o.worst.toFixed(1)+' ms, IA '+o.ai.toFixed(2)+' ms/passo (pico '+o.aiPeak.toFixed(1)+'), intervalo distante ×'+o.far.toFixed(2));
    if(o.placed<o.n) f.push(o.n+': só foi possível posicionar '+o.placed); if(!o.finite) f.push(o.n+': inimigo com posição inválida'); if(o.combat<o.n*.5) f.push(o.n+': menos da metade ficou em alerta/combate ('+o.combat+')'); }
  const a=r.find(o=>o.n===10), c=r.find(o=>o.n===40);
  if(c.p99>16.7) f.push('40 inimigos: p99 do passo ('+c.p99.toFixed(1)+' ms) estoura um quadro de 60 Hz');
  if(c.avg>16.7) f.push('40 inimigos: passo médio de '+c.avg.toFixed(1)+' ms não cabe em um quadro de 60 Hz');
  if(c.avg>a.avg*12) f.push('custo explode com a quantidade: 40 inimigos custam '+(c.avg/a.avg).toFixed(1)+'× o de 10');
  for(const e of errorsOf(logs)) f.push('console: '+e);
  finish('orçamento da IA',f,'valores acima medidos nesta CPU; não substituem medição em aparelho real');
}).catch(e=>{ console.error(e); process.exit(1); });
