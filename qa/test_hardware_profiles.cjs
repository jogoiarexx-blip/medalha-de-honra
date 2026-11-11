'use strict';
// Uso: node qa/test_hardware_profiles.cjs
// Baixo/Médio/Alto × Modelo 3D/Detalhados/Clássicos, redimensionamento, perfil inicial em
// aparelho de toque e falha de pós-processamento. Verifica funcionamento, não velocidade.
const {withGame,errorsOf,finish}=require('./lib/harness.cjs');
(async()=>{
  const f=[]; const table=[];
  await withGame(async({page,logs})=>{
    await page.evaluate(()=>{ settings.autoRes=false; APP.noLock=true; });
    for(const q of ['baixo','medio','alto']) for(const c of ['modelo','detalhado','classico']){
      const n0=logs.length;
      const r=await page.evaluate(([q,c])=>{ const set=(id,v)=>{ const el=document.querySelector(id); el.value=v; el.dispatchEvent(new Event('change')); }; set('#oQuality',q); set('#oChars',c);
        G=null; goMenu(); MENU3D.on=true; MENU3D.update(.016); renderFrame(false,.016); const menuCalls=renderer.info.render.calls, dog=MENU3D.dog, dogModel=!!(dog&&dog._meshy&&dog._meshy.mesh.visible), dogProc=!!(dog&&dog.spine.visible);
        startPlaying(null,'01'); MENU3D.on=false; CHEATS.god=true; for(let i=0;i<60;i++) simStep(CFG.step); updateCamera(.016); updateViewmodel(.016); renderFrame(true,.016);
        const e=G.enemies[0]; const gl=renderer.getContext(); const px=new Uint8Array(4*64*64); gl.readPixels((gl.drawingBufferWidth>>1)-32,(gl.drawingBufferHeight>>1)-32,64,64,gl.RGBA,gl.UNSIGNED_BYTE,px); let lum=0; for(let i=0;i<px.length;i+=4) lum+=px[i]+px[i+1]+px[i+2];
        return {q,c,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,menuCalls,post:POST.ok&&settings.quality!=='baixo',passes:POST.ok&&settings.quality!=='baixo'?POST.passes:0,pr:renderer.getPixelRatio(),mz:!!e.h.mz,h2:!!e.h.body&&!e.h.mz,dogModel,dogProc,lum:lum/(64*64*3),hq:MAT_HQ}; },[q,c]);
      table.push(r);
      const tag=q+'/'+c+': ';
      if(r.calls<20||r.tris<1000) f.push(tag+'cena não renderizou ('+r.calls+' chamadas)');
      if(r.lum<1) f.push(tag+'centro da imagem totalmente preto');
      if((q==='baixo')===r.post) f.push(tag+'pós-processamento '+(r.post?'ligado':'desligado')+' no perfil errado');
      if(q==='medio'&&r.passes!==5) f.push(tag+'Médio deveria usar 1 sequência de blur (5 passes), usou '+r.passes);
      if(q==='alto'&&r.passes!==7) f.push(tag+'Alto deveria usar 2 sequências de blur (7 passes), usou '+r.passes);
      if((c==='modelo')!==r.mz) f.push(tag+'soldado 3D '+(r.mz?'ativo':'inativo')+' no estilo errado');
      if(c==='detalhado'&&!r.h2) f.push(tag+'estilo Detalhados sem corpo detalhado');
      if(c!=='modelo'&&(r.dogModel||!r.dogProc)) f.push(tag+'pastor GLB apareceu fora do estilo Modelo 3D');
      if((q!=='baixo')!==r.hq) f.push(tag+'materiais no nível errado');
      for(const e of errorsOf(logs.slice(n0))) f.push(tag+e);
    }
    // estilo Modelo 3D: o pastor GLB entra (ou o procedural segura enquanto carrega)
    await page.evaluate(()=>{ const el=document.querySelector('#oChars'); el.value='modelo'; el.dispatchEvent(new Event('change')); G=null; goMenu(); });
    await page.waitForFunction(()=>window.__PASTOR_MESHY.status!=='loading'&&window.__PASTOR_MESHY.status!=='idle',{timeout:20000}).catch(()=>{});
    const dog=await page.evaluate(()=>{ MENU3D.on=true; MENU3D.update(.016); const d=MENU3D.dog; return {status:window.__PASTOR_MESHY.status,model:!!(d._meshy&&d._meshy.mesh.visible),proc:d.spine.visible,scale:d.root.scale.x}; });
    if(dog.status==='ready'&&(!dog.model||dog.proc)) f.push('Modelo 3D: pastor GLB pronto mas não exibido'); if(dog.status!=='ready'&&!dog.proc) f.push('Modelo 3D: cão invisível enquanto o GLB não está pronto'); if(Math.abs(dog.scale-.85)>1e-6) f.push('escala do cão do menu mudou ('+dog.scale+')');
    // redimensionamento em vários formatos, em jogo
    for(const [w,h,name] of [[1920,1080,'16:9'],[1024,768,'4:3'],[2560,1080,'ultrawide'],[390,844,'retrato'],[844,390,'19,5:9']]){
      await page.setViewportSize({width:w,height:h}); await page.waitForTimeout(150);
      const r=await page.evaluate(()=>{ if(APP.state!=='PLAYING') startPlaying(null,'01'); MENU3D.on=false; updateCamera(.016); renderFrame(true,.016); const c=document.querySelector('#view'), hp=document.querySelector('#healthPanel').getBoundingClientRect(), am=document.querySelector('#ammoPanel').getBoundingClientRect();
        return {aspect:camera.aspect,want:c.clientWidth/c.clientHeight,calls:renderer.info.render.calls,hpIn:hp.left>=0&&hp.bottom<=innerHeight+1,amIn:am.right<=innerWidth+1&&am.bottom<=innerHeight+1}; });
      if(Math.abs(r.aspect-r.want)>.01) f.push(name+': proporção da câmera não acompanhou a janela'); if(r.calls<20) f.push(name+': cena não renderizou'); if(!r.hpIn||!r.amIn) f.push(name+': painel de saúde/munição fora da tela');
    }
    await page.setViewportSize({width:1280,height:720});
    // falha simulada do pós-processamento: sem tela preta, com registro
    const pf=await page.evaluate(()=>{ settings.quality='alto'; const keep=POST.render; POST.render=function(){ throw new Error('falha simulada'); }; renderFrame(true,.016); const calls=renderer.info.render.calls; const logged=DIAG.log.some(c=>c.code==='POST_RENDER'); POST.render=keep; const ok=POST.ok; POST.ok=true; POST.warned=false; return {calls,logged,disabled:!ok}; });
    if(pf.calls<20) f.push('falha de pós-processamento deixou a tela sem render'); if(!pf.logged||!pf.disabled) f.push('falha de pós-processamento sem diagnóstico/fallback ('+JSON.stringify(pf)+')');
    for(const e of errorsOf(logs)) if(!/POST_RENDER/.test(e)&&!f.some(x=>x.endsWith(e))) f.push('console: '+e);
  });
  // primeiro uso em aparelho de toque: perfil Baixo e controles de toque
  await withGame(async({page,logs})=>{
    const m=await page.evaluate(()=>({quality:settings.quality,touch:APP.touch,pr:renderer.getPixelRatio()}));
    if(m.quality!=='baixo') f.push('primeiro uso em aparelho de toque não começou no perfil Baixo ('+m.quality+')');
    if(!m.touch) f.push('controles de toque não foram ativados');
    const t=await page.evaluate(()=>{ APP.noLock=true; startPlaying(null,'01'); const vis=!document.querySelector('#touch').hidden; const bs=[...document.querySelectorAll('#touch button')].filter(b=>!b.hidden&&b.offsetParent).map(b=>b.getBoundingClientRect()); const out=bs.filter(r=>r.left<-1||r.top<-1||r.right>innerWidth+1||r.bottom>innerHeight+1).length;
      const el=document.querySelector('#oQuality'); el.value='medio'; el.dispatchEvent(new Event('change')); return {vis,n:bs.length,out,q:settings.quality}; });
    if(!t.vis||t.n<8) f.push('botões de toque ausentes em jogo'); if(t.out) f.push(t.out+' botão(ões) de toque fora da tela'); if(t.q!=='medio') f.push('não foi possível trocar o perfil manualmente no aparelho de toque');
    for(const e of errorsOf(logs)) f.push('toque: '+e);
  },{viewport:{width:844,height:390},touch:true,mobile:true});
  for(const r of table) console.log('medido: '+(r.q+'/'+r.c).padEnd(16)+' fase 01: '+String(r.calls).padStart(5)+' chamadas, '+String(r.tris).padStart(7)+' triângulos · menu '+r.menuCalls+' chamadas · pixel ratio '+r.pr.toFixed(2)+' · pós '+r.passes+' passes');
  finish('perfis gráficos e de aparelho',f,'3 perfis × 3 estilos, 5 formatos de tela, falha de pós-processo e primeiro uso em toque');
})().catch(e=>{ console.error(e); process.exit(1); });
