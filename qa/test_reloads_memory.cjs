'use strict';
// Uso: node qa/test_reloads_memory.cjs
// REV-C · P0-03 / P0-04 — recursos de GPU estabilizam após reinícios e trocas:
// 10 mudanças de fase, 10 reinícios da mesma fase e 30 trocas de estilo de personagem.
const fs=require('node:fs'),path=require('node:path');
const {withGame,errorsOf,finish,ROOT}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
  const f=[]; const shots=path.join(ROOT,'qa-shots'); fs.mkdirSync(shots,{recursive:true});
  await page.evaluate(()=>{ settings.autoRes=false; APP.noLock=true; window.__mem=()=>({g:renderer.info.memory.geometries,t:renderer.info.memory.textures,p:renderer.info.programs.length});
    window.__play=id=>{ startPlaying(null,id); MENU3D.on=false; CHEATS.god=true; for(let i=0;i<20;i++) simStep(CFG.step); updateCamera(.016); updateViewmodel(.016); renderFrame(true,.016); return window.__mem(); }; });
  // imagem de referência da 01 antes de qualquer ciclo
  const grab=async name=>{ await page.evaluate(()=>{ window.__play('01'); }); await page.waitForTimeout(400); const buf=await page.locator('#view').screenshot(); fs.writeFileSync(path.join(shots,name),buf); return buf; };
  const stats=async()=>page.evaluate(()=>{ window.__play('01'); const gl=renderer.getContext(), w=gl.drawingBufferWidth, h=gl.drawingBufferHeight, px=new Uint8Array(w*h*4); renderFrame(true,.016); gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);
    let r=0,g=0,b=0,mag=0,blk=0,n=w*h; for(let i=0;i<px.length;i+=4){ r+=px[i]; g+=px[i+1]; b+=px[i+2]; if(px[i]>200&&px[i+2]>200&&px[i+1]<90) mag++; if(px[i]+px[i+1]+px[i+2]<6) blk++; } return {r:r/n,g:g/n,b:b/n,magenta:mag/n,black:blk/n}; });
  const s0=await stats(); await grab('memoria-01-antes.png');
  const cycle=await page.evaluate(()=>{ const out={levels:[],restarts:[],menu:[],swaps:[]};
    const ids=['01','05','09','13','16','19','21','23','S1','S2'];
    for(const id of ids) window.__play(id);                       // aquecimento: caches globais enchem
    for(const id of ids) out.levels.push([id,window.__play(id)]); // 10 mudanças de fase
    for(let i=0;i<10;i++) out.restarts.push(window.__play('01')); // 10 reinícios
    for(let i=0;i<10;i++){ G=null; goMenu(); MENU3D.on=true; MENU3D.update(.016); renderFrame(false,.016); out.menu.push(window.__mem()); window.__play('02'); }
    G=null; goMenu(); const el=document.querySelector('#oChars'); const keep=settings.chars;
    for(let i=0;i<30;i++){ el.value=['classico','detalhado','modelo'][i%3]; el.dispatchEvent(new Event('change')); MENU3D.on=true; MENU3D.update(.016); renderFrame(false,.016); out.swaps.push([el.value,window.__mem(),MENU3D.scene.children.filter(o=>o.isLight).length,(window.__PASTOR_MESHY.instances||[]).filter(window.__PASTOR_MESHY.inLiveScene).length]); }
    el.value=keep; el.dispatchEvent(new Event('change')); out.res=Object.assign({},RES.stats); out.rebuilds=MENU3D.rebuilds; return out; });
  const span=(arr,k)=>{ const v=arr.map(x=>x[k]); return Math.max(...v)-Math.min(...v); };
  // "Estável" = sem tendência de crescimento. Uma oscilação de poucas unidades é normal (texturas de
  // partículas e clarões só sobem para a GPU quando o efeito aparece); vazamento real cresce a cada ciclo.
  const TOL=4, grows=(arr,k)=>{ const v=arr.slice(1).map(x=>x[k]); return span(arr.slice(1),k)>TOL||v[v.length-1]-v[0]>TOL; };
  // reinícios da mesma fase: contagem idêntica
  if(grows(cycle.restarts,'g')||grows(cycle.restarts,'t')) f.push('10 reinícios da 01: recursos crescem ('+JSON.stringify(cycle.restarts.map(m=>[m.g,m.t]))+')');
  // menu↔fase repetido: sem crescimento
  if(grows(cycle.menu,'g')||grows(cycle.menu,'t')) f.push('10 idas ao menu: recursos crescem ('+JSON.stringify(cycle.menu.map(m=>[m.g,m.t]))+')');
  // trocas de estilo: cada estilo sempre com a mesma contagem, mesmas luzes e um só cão vivo
  for(const st of ['classico','detalhado','modelo']){ const rows=cycle.swaps.filter(x=>x[0]===st).map(x=>x[1]); if(grows(rows,'g')||grows(rows,'t')) f.push('30 trocas de estilo ('+st+'): recursos crescem '+JSON.stringify(rows.map(m=>[m.g,m.t]))); }
  if(new Set(cycle.swaps.map(x=>x[2])).size!==1) f.push('trocas de estilo: número de luzes do menu varia ('+[...new Set(cycle.swaps.map(x=>x[2]))].join(',')+')');
  if(cycle.swaps.some(x=>x[3]>1)) f.push('trocas de estilo: mais de um cão vivo no menu');
  if(cycle.rebuilds<30) f.push('sala do menu não foi reconstruída em cada troca ('+cycle.rebuilds+')');
  // teto absoluto: ordem de grandeza de UMA fase, não soma de várias
  const peak=Math.max(...cycle.levels.map(x=>x[1].g)); const base=cycle.restarts[0].g;
  if(peak>2500) f.push('pico de geometrias alto demais: '+peak);
  // depois de tudo, a 01 precisa renderizar como antes (nada rosa, preto ou sem textura)
  const s1=await stats(); await grab('memoria-01-depois.png');
  const d=Math.max(Math.abs(s1.r-s0.r),Math.abs(s1.g-s0.g),Math.abs(s1.b-s0.b));
  if(d>6) f.push('imagem da 01 mudou após os ciclos (Δ médio '+d.toFixed(1)+'/255) — possível recurso descartado indevidamente');
  if(s1.magenta>.002) f.push('pixels magenta após os ciclos ('+(s1.magenta*100).toFixed(2)+'%) — textura ausente');
  if(s1.black>s0.black+.05) f.push('área preta cresceu após os ciclos ('+(s0.black*100).toFixed(1)+'% → '+(s1.black*100).toFixed(1)+'%)');
  for(const e of errorsOf(logs)) f.push('console: '+e);
  console.log('medido: 01 estabiliza em '+base+' geometrias / '+cycle.restarts[0].t+' texturas; pico entre fases '+peak+'; liberados '+cycle.res.geometries+' geometrias, '+cycle.res.textures+' texturas e '+cycle.res.materials+' materiais em '+cycle.res.sweeps+' varreduras; Δ de imagem '+d.toFixed(2)+'/255');
  finish('memória de recursos em reinícios e trocas',f,'10 fases, 10 reinícios, 10 menus e 30 trocas de estilo sem crescimento');
}).catch(e=>{ console.error(e); process.exit(1); });
