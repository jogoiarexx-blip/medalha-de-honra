'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {withGame,ROOT,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs,boot})=>{
 const data=await page.evaluate(()=>{
  APP.noLock=true;settings.quality='baixo';settings.autoRes=false;settings.chars='modelo';
  const build=()=>{const old=Math.random;Math.random=mulberry32(305);try{startPlaying(null,'05');}finally{Math.random=old;}};
  const sig=()=>{let lights=0;scene.traverse(o=>{if(o.isLight)lights++;});return {solids:W.solids.map(s=>[s.minX,s.maxX,s.minY,s.maxY,s.minZ,s.maxZ]),nav:W.nav.nodes,doors:Object.keys(W.doors),objectives:G.objectives.map(o=>o.id),targets:W.shootables.length,lights};};
  const probes=()=>[[0,16,0,12.8],[-7,-9,7,-9],[.3,-7.1,7.1,-7.1]].map(p=>segClear2D(...p,.25,true));
  const capture=()=>{
   MENU3D.on=false;VM.root.visible=false;
   return [['fachada',[0,2,20],[0,4,14]],['patio',[3,1.7,2],[0,1.1,-1.5]],['quartos',[-4.6,5.25,-8.7],[-5.5,5.3,-10]]].map(([name,p,t])=>{
    camera.position.set(...p);camera.lookAt(...t);setCameraFov(75);scene.updateMatrixWorld(true);renderFrame(false,.016);
    const gl=renderer.getContext(),px=new Uint8Array(16*16*4);gl.readPixels((gl.drawingBufferWidth>>1)-8,(gl.drawingBufferHeight>>1)-8,16,16,gl.RGBA,gl.UNSIGNED_BYTE,px);let lum=0;for(let i=0;i<px.length;i+=4)lum+=px[i]+px[i+1]+px[i+2];
    return {name,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,lum:lum/768,png:canvas.toDataURL('image/png').split(',')[1]};
   });
  };
  // Antes/depois da decoração: ambas já usam a fachada corrigida.
  const upgrade=improveMedinaScenery;improveMedinaScenery=()=>{};let before,beforeSig,beforeClear;
  try{build();beforeSig=sig();beforeClear=probes();before=capture();}finally{improveMedinaScenery=upgrade;}
  build();const afterSig=sig(),afterClear=probes(),after=capture(),info={...G.refs.medinaScenery};
  const frontWalls=W.solids.filter(s=>s.minZ===13.8&&s.maxZ===14&&s.minY>=YT);
  const glass=W.glass.filter(g=>/^fw/.test(g.id));
  const validFront=frontWalls.every(s=>s.maxX>s.minX)&&glass.length===4&&glass.every(g=>((g.minX>=-16&&g.maxX<=-8)||(g.minX>=8&&g.maxX<=16))&&!frontWalls.some(s=>Math.min(g.maxX,s.maxX)>Math.max(g.minX,s.minX)+1e-6&&Math.min(g.maxY,s.maxY)>Math.max(g.minY,s.minY)+1e-6));
  breakGlass(W.glass.find(g=>g.id==='fw10b'),null,false);checkpoint();const cp=readStoredCheckpoint().cp;startPlaying(cp);
  const restored=W.glass.find(g=>g.id==='fw10b').broken&&G.refs.medinaScenery?.plaques===11;
  const cache=Object.values(MEDINA_SCENERY),atlas=MEDINA_SCENERY.sign.map;let disposed=0;for(const r of [...cache,atlas])r.addEventListener('dispose',()=>disposed++);
  startPlaying(null,'04');const isolated=!G.refs.medinaScenery;
  settings.quality='alto';startPlaying(cp);const live=RES.live();
  const high=MAT_HQ&&Object.values(MEDINA_SCENERY).every((m,i)=>m===cache[i]&&live.m.has(m))&&live.t.has(atlas)&&disposed===0;
  saveSettings();
  return {before,after,beforeSig,afterSig,beforeClear,afterClear,info,validFront,restored,isolated,high,disposed};
 });
 // Navegação real: nova página no mesmo contexto com settings/checkpoint persistidos.
 await boot();
 const reload=await page.evaluate(()=>{
  APP.noLock=true;const cp=readStoredCheckpoint().cp;startPlaying(cp);
  MENU3D.on=false;VM.root.visible=false;camera.position.set(0,2,20);camera.lookAt(0,4,14);scene.updateMatrixWorld(true);renderFrame(false,.016);
  const gl=renderer.getContext(),px=new Uint8Array(16*16*4);gl.readPixels((gl.drawingBufferWidth>>1)-8,(gl.drawingBufferHeight>>1)-8,16,16,gl.RGBA,gl.UNSIGNED_BYTE,px);let lum=0;for(let i=0;i<px.length;i+=4)lum+=px[i]+px[i+1]+px[i+2];
  return {level:G.levelId,version:G.refs.medinaScenery?.version,high:MAT_HQ,broken:W.glass.find(g=>g.id==='fw10b')?.broken,lum:lum/768,png:canvas.toDataURL('image/png').split(',')[1]};
 });
 const shots=path.join(ROOT,'qa-shots'),dir=path.join(ROOT,'qa-report');fs.mkdirSync(shots,{recursive:true});fs.mkdirSync(dir,{recursive:true});
 for(const [side,imgs] of [['antes',data.before],['depois',data.after]])for(const i of imgs){fs.writeFileSync(path.join(shots,`cp03c-${i.name}-${side}.png`),Buffer.from(i.png,'base64'));delete i.png;}
 fs.writeFileSync(path.join(shots,'cp03c-fachada-alto-recarregada.png'),Buffer.from(reload.png,'base64'));delete reload.png;
 const failures=[];
 try{assert.deepEqual(data.beforeSig,data.afterSig,'decoração mudou contrato físico');assert.ok(data.beforeClear.every(Boolean),'trajeto de referência '+data.beforeClear);assert.ok(data.afterClear.every(Boolean));assert.ok(data.validFront&&data.restored&&data.isolated&&data.high);assert.equal(data.disposed,0);
  for(let i=0;i<data.after.length;i++){assert.ok(data.after[i].lum>1,'captura preta');assert.ok(data.after[i].calls-data.before[i].calls<=16);assert.ok(data.after[i].tris-data.before[i].tris<=5000);}
  assert.equal(reload.level,'05');assert.equal(reload.version,'cp03c');assert.ok(reload.high&&reload.broken&&reload.lum>1);
 }catch(e){failures.push(e.message);}
 fs.writeFileSync(path.join(dir,'cp03c-cenarios.json'),JSON.stringify({data,reload},null,2));
 console.log('CP03C: '+JSON.stringify({...data,beforeSig:undefined,afterSig:undefined,reload}));failures.push(...errorsOf(logs));finish('CP-03C Medina',failures,'fachada, orçamento, passagens/escada, vidro/save, recursos e recarga Alto; percurso humano/Android pendentes');
}).catch(e=>{console.error(e);process.exit(1);});
