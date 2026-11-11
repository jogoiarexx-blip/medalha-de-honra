'use strict';
// Uso: node qa/test_registry_27.cjs
// Contrato estrutural das 27 operações (24 principais + 3 secretas), lido do jogo
// em execução — não de strings do código-fonte. NÃO prova que as fases são termináveis.
const {withGame,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
  const r=await page.evaluate(()=>{
    const fails=[], ids=[...LEVEL_ORDER,...SECRET_ORDER];
    const need=['build','objectives','interact','pickups','update','start','briefing','name','op','place','menuCam','enemies','reinf','resultTitle'];
    for(const id of ids){
      const L=LEVELS[id]; if(!L){ fails.push(id+': sem registro em LEVELS'); continue; }
      for(const k of need) if(L[k]===undefined||L[k]===null) fails.push(id+': campo obrigatório ausente — '+k);
      for(const k of ['build','objectives','interact','pickups','update']) if(L[k]!==undefined&&typeof L[k]!=='function') fails.push(id+': '+k+' não é função');
      if(L.start&&!(isFinite(L.start.x)&&isFinite(L.start.z))) fails.push(id+': ponto de início inválido');
      if(L.briefing&&!(Array.isArray(L.briefing.paras)&&L.briefing.paras.length&&Array.isArray(L.briefing.list))) fails.push(id+': dossiê incompleto');
      if(L.loadout){ for(const w of L.loadout.weapons){ if(!WEAPONS[w]) fails.push(id+': arma desconhecida no equipamento — '+w); if(!L.loadout.ammo[w]) fails.push(id+': equipamento sem munição para '+w); } if(!L.loadout.weapons.includes(L.loadout.cur)) fails.push(id+': arma inicial fora do equipamento'); }
      let objs=[]; try{ objs=L.objectives(); }catch(e){ fails.push(id+': objectives() lançou '+e.message); }
      if(!objs.some(o=>!o.optional&&o.state==='active')) fails.push(id+': nenhum objetivo obrigatório ativo no início');
      const seen=new Set(); for(const o of objs){ if(seen.has(o.id)) fails.push(id+': objetivo duplicado — '+o.id); seen.add(o.id); if(!['hidden','active','done','failed'].includes(o.state)) fails.push(id+': estado inválido em '+o.id); }
      const eids=new Set(); for(const d of [...(L.enemies||[]),...(L.reinf||[])]){ if(eids.has(d.id)) fails.push(id+': inimigo duplicado — '+d.id); eids.add(d.id); if(!EW[d.weapon]) fails.push(id+': inimigo '+d.id+' com arma desconhecida'); }
      if(L.prev&&!LEVELS[L.prev]) fails.push(id+': operação anterior inexistente — '+L.prev);
      if(L.alarmObjective&&!objs.some(o=>o.id===L.alarmObjective)) fails.push(id+': alarmObjective aponta para objetivo inexistente');
    }
    const finales=LEVEL_ORDER.filter(id=>LEVELS[id]&&LEVELS[id].finale);
    return {main:LEVEL_ORDER.length,secret:SECRET_ORDER.length,total:Object.keys(LEVELS).length,finales,last:LEVEL_ORDER[LEVEL_ORDER.length-1],dup:new Set(ids).size!==ids.length,fails,
      chain:LEVEL_ORDER.map((id,i)=>i&&LEVELS[id].loadout&&LEVELS[id].prev&&LEVELS[id].prev!==LEVEL_ORDER[i-1]?id+'←'+LEVELS[id].prev:null).filter(Boolean)};
  });
  const f=[...r.fails];
  if(r.main!==24) f.push('esperadas 24 operações principais, encontradas '+r.main);
  if(r.secret!==3) f.push('esperadas 3 operações secretas, encontradas '+r.secret);
  if(r.total!==27) f.push('LEVELS tem '+r.total+' registros (esperado 27)');
  if(r.dup) f.push('IDs repetidos na ordem da campanha');
  if(r.finales.length!==1||r.finales[0]!==r.last) f.push('o final da campanha deve ser exatamente a última operação ('+r.finales.join(',')+' / '+r.last+')');
  if(r.chain.length) f.push('cadeia de equipamento (prev) fora da ordem da campanha: '+r.chain.join(', '));
  for(const e of errorsOf(logs)) f.push('console: '+e);
  finish('registro das 27 operações',f,'24 principais + 3 secretas com contrato completo (estrutura; conclusão das fases não é coberta por este teste)');
}).catch(e=>{ console.error(e); process.exit(1); });
