'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {withGame,ROOT,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs,boot})=>{
 const data=await page.evaluate(()=>{
  APP.noLock=true;settings.quality='baixo';settings.autoRes=false;settings.chars='modelo';
  const build=()=>{const old=Math.random;Math.random=mulberry32(306);try{startPlaying(null,'06');}finally{Math.random=old;}};
  const sig=()=>{let lights=0;scene.traverse(o=>{if(o.isLight)lights++;});return {solids:W.solids.map(s=>[s.minX,s.maxX,s.minY,s.maxY,s.minZ,s.maxZ]),nav:W.nav.nodes,doors:Object.keys(W.doors),objectives:G.objectives.map(o=>o.id),targets:W.shootables.length,photos:W.photo.map(t=>[t.id,...t.pos.toArray()]),lights};};
  const probes=()=>[[-23,0,-18.5,0],[-15,-9,-5,-9],[15.6,-7.2,9.3,-7.2]].map(p=>segClear2D(...p,.25,true));
  const photoChecks=()=>[['schedule',[-5,1.9,-18],[-5,1.9,-19.74]],['flak',[9.5,5.7,-16.6],[8.25,5.7,-16.6]]].map(([id,p,t])=>{camera.position.set(...p);camera.lookAt(...t);const c=photoCandidate();return {id,found:c?.t.id,ok:!!c?.ok};});
  const views=[['entrada',[-30,1.8,1],[-21,4,0]],['barracas',[-21,1.8,7],[-14,2.5,13]],['qg',[-7,1.7,-6],[-5,2,-11]],['arame',[23.8,1.7,19],[23.8,1.3,15]]];
  const frame=([name,p,t])=>{MENU3D.on=false;VM.root.visible=false;camera.position.set(...p);camera.lookAt(...t);setCameraFov(75);scene.updateMatrixWorld(true);renderFrame(false,.016);
   const gl=renderer.getContext(),px=new Uint8Array(16*16*4);gl.readPixels((gl.drawingBufferWidth>>1)-8,(gl.drawingBufferHeight>>1)-8,16,16,gl.RGBA,gl.UNSIGNED_BYTE,px);let lum=0;for(let i=0;i<px.length;i+=4)lum+=px[i]+px[i+1]+px[i+2];return {name,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,lum:lum/768,png:canvas.toDataURL('image/png').split(',')[1]};};
  const linked=()=>{const a=W.nav.nodes.findIndex(p=>Math.hypot(p.x-23.8,p.z-15.1)<.01),b=W.nav.nodes.findIndex(p=>Math.hypot(p.x-23.8,p.z-17)<.01);return a>=0&&b>=0&&W.nav.edges[a].includes(b);};
  // Aquecer caches/UUIDs antes das duas montagens com a mesma semente.
  build();const upgrade=improveBordjScenery;improveBordjScenery=()=>{};let before,beforeSig,beforeClear,beforePhotos;
  try{build();beforeSig=sig();beforeClear=probes();beforePhotos=photoChecks();before=views.map(frame);}finally{improveBordjScenery=upgrade;}
  build();const afterSig=sig(),afterClear=probes(),afterPhotos=photoChecks(),after=views.map(frame),closedEdge=linked();
  // Ações reais em posições controladas: levantar cancela e cortar arame.
  G.player.pos.set(-25.5,0,0);G.player.holster=true;W.interactables.find(i=>i.id==='gate').use();
  G.player.pos.set(23.8,0,14.8);W.interactables.find(i=>i.id==='wire').use();const openEdge=linked(),cutShot=frame(['arame-cortado',...views[3].slice(1)]);
  checkpoint();const cp=readStoredCheckpoint().cp;startPlaying(cp);const restored=G.flags.wireCut&&!G.refs.wire.active&&G.refs.wireMesh.every(m=>!m.visible)&&linked()&&W.doors.barrier.state==='OPEN'&&W.doors.barrier.mesh.material.map===BORDJ_SCENERY.stripeMap;
  const cache=Object.values(BORDJ_SCENERY),atlas=BORDJ_SCENERY.sign.map;let disposed=0;for(const r of [...cache,atlas])r.addEventListener('dispose',()=>disposed++);
  startPlaying(null,'07');const isolated=!G.refs.bordjScenery;
  settings.quality='alto';startPlaying(cp);const live=RES.live(),high=MAT_HQ&&Object.values(BORDJ_SCENERY).every((r,i)=>r===cache[i]&&(r.isMaterial?live.m.has(r):live.t.has(r)))&&live.t.has(atlas)&&disposed===0;saveSettings();
  return {before,after,beforeSig,afterSig,beforeClear,afterClear,beforePhotos,afterPhotos,closedEdge,openEdge,cutShot,restored,isolated,high,disposed};
 });
 await boot();
 const reload=await page.evaluate(()=>{
  APP.noLock=true;const cp=readStoredCheckpoint().cp;startPlaying(cp);
  const a=W.nav.nodes.findIndex(p=>Math.hypot(p.x-23.8,p.z-15.1)<.01),b=W.nav.nodes.findIndex(p=>Math.hypot(p.x-23.8,p.z-17)<.01);
  MENU3D.on=false;VM.root.visible=false;camera.position.set(-30,1.8,1);camera.lookAt(-21,4,0);scene.updateMatrixWorld(true);renderFrame(false,.016);
  const gl=renderer.getContext(),px=new Uint8Array(16*16*4);gl.readPixels((gl.drawingBufferWidth>>1)-8,(gl.drawingBufferHeight>>1)-8,16,16,gl.RGBA,gl.UNSIGNED_BYTE,px);let lum=0;for(let i=0;i<px.length;i+=4)lum+=px[i]+px[i+1]+px[i+2];
  return {level:G.levelId,version:G.refs.bordjScenery?.version,high:MAT_HQ,edge:a>=0&&b>=0&&W.nav.edges[a].includes(b),wire:!G.refs.wire.active,gate:W.doors.barrier.state,striped:W.doors.barrier.mesh.material.map===BORDJ_SCENERY.stripeMap,lum:lum/768,png:canvas.toDataURL('image/png').split(',')[1]};
 });
 const shots=path.join(ROOT,'qa-shots'),dir=path.join(ROOT,'qa-report');fs.mkdirSync(shots,{recursive:true});fs.mkdirSync(dir,{recursive:true});
 const write=(name,img)=>{fs.writeFileSync(path.join(shots,`cp03d-${name}.png`),Buffer.from(img.png,'base64'));delete img.png;};
 for(const [side,imgs]of [['antes',data.before],['depois',data.after]])for(const i of imgs)write(i.name+'-'+side,i);write('arame-cortado',data.cutShot);write('entrada-alto-recarregada',reload);
 const failures=[];
 try{assert.deepEqual(data.afterSig,data.beforeSig,'acabamento alterou contrato físico');assert.ok(data.beforeClear.every(Boolean),'referência '+data.beforeClear);assert.ok(data.afterClear.every(Boolean));assert.ok(data.beforePhotos.every(p=>p.ok&&p.id===p.found));assert.deepEqual(data.afterPhotos,data.beforePhotos);
  assert.equal(data.closedEdge,false);assert.ok(data.openEdge&&data.restored&&data.isolated&&data.high);assert.equal(data.disposed,0);
  for(let i=0;i<data.after.length;i++){assert.ok(data.after[i].lum>1);assert.ok(data.after[i].calls-data.before[i].calls<=16);assert.ok(data.after[i].tris-data.before[i].tris<=5000);}
  assert.equal(reload.level,'06');assert.equal(reload.version,'cp03d');assert.equal(reload.gate,'OPEN');assert.ok(reload.high&&reload.edge&&reload.wire&&reload.striped&&reload.lum>1);
 }catch(e){failures.push(e.message);}
 fs.writeFileSync(path.join(dir,'cp03d-cenarios.json'),JSON.stringify({data,reload},null,2));console.log('CP03D: '+JSON.stringify({...data,beforeSig:undefined,afterSig:undefined,reload}));failures.push(...errorsOf(logs));finish('CP-03D Bordj',failures,'cenários, fotos, passagem, arame/grafo/save e recarga Alto; percurso humano/Android pendentes');
}).catch(e=>{console.error(e);process.exit(1);});
