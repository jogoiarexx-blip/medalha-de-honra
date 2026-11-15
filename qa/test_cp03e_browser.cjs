'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');const {withGame,ROOT,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs,boot})=>{
 const data=await page.evaluate(()=>{
  APP.noLock=true;settings.quality='baixo';settings.autoRes=false;
  const build=()=>{const old=Math.random;Math.random=mulberry32(307);try{startPlaying(null,'07');}finally{Math.random=old;}};
  const sig=()=>({solids:W.solids.map(s=>[s.minX,s.maxX,s.minY,s.maxY,s.minZ,s.maxZ]),nav:W.nav.nodes,doors:Object.keys(W.doors),obj:G.objectives.map(o=>o.id),photo:W.photo.map(p=>p.id),trucks:G.refs.trucks.length,lights:scene.children.filter(o=>o.isLight).length});
  const views=[['bueiro',[-35,1.7,14],[-29,1.5,14]],['arsenal',[-10,1.7,-17],[-14,2,-19]],['galpao',[-4,1.7,8],[-3.5,2,12]]];
  const frame=([name,p,t])=>{MENU3D.on=false;VM.root.visible=false;camera.position.set(...p);camera.lookAt(...t);scene.updateMatrixWorld(true);renderFrame(false,.016);return {name,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,png:canvas.toDataURL('image/png').split(',')[1]};};
  build();const upgrade=improveDepotScenery;improveDepotScenery=()=>{};let before,beforeSig;
  try{build();beforeSig=sig();before=views.map(frame);}finally{improveDepotScenery=upgrade;}
  build();camera.position.set(-10.4,2,19.3);camera.lookAt(-10.4,.84,20);const pc=photoCandidate(),photo=!!pc?.ok&&pc.t.id==='cipher';const afterSig=sig(),after=views.map(frame),passage=segClear2D(-34.4,14,-28.6,14,.34,true);
  // Corpo central cabe na abertura sem acertar tampa ou teto da malha.
  const eyeRay=new T.Raycaster(V3(-33,1.6,14),V3(1,0,0),0,4);const culvertClear=!eyeRay.intersectObjects(scene.children,true).some(h=>h.distance<3&&h.object.geometry?.type==='CylinderGeometry');
  const initial=JSON.stringify(W.nav.edges);drumsExplode07(G.refs.drums.find(d=>d.id==='C'));cp07();const cp=readStoredCheckpoint().cp;startPlaying(cp);
  const restored=JSON.stringify(W.nav.edges);buildNav();const fresh=JSON.stringify(W.nav.edges),navCurrent=restored===fresh,navChanged=initial!==fresh;
  const trucks=G.refs.trucks.map(t=>[t.x,t.z,t.state,t.charge]);settings.quality='alto';saveSettings();
  return {before,after,beforeSig,afterSig,passage,culvertClear,photo,navCurrent,navChanged,trucks};
 });
 await boot();const reload=await page.evaluate(()=>{APP.noLock=true;startPlaying(readStoredCheckpoint().cp);const old=JSON.stringify(W.nav.edges);buildNav();MENU3D.on=false;VM.root.visible=false;camera.position.set(-35,1.7,14);camera.lookAt(-29,1.5,14);renderFrame(false,.016);return {level:G.levelId,version:G.refs.depotScenery?.version,high:MAT_HQ,nav:old===JSON.stringify(W.nav.edges),drum:G.refs.drums.find(d=>d.id==='C').state,trucks:G.refs.trucks.map(t=>[t.x,t.z,t.state,t.charge]),png:canvas.toDataURL('image/png').split(',')[1]};});
 const shots=path.join(ROOT,'qa-shots'),dir=path.join(ROOT,'qa-report');fs.mkdirSync(shots,{recursive:true});fs.mkdirSync(dir,{recursive:true});for(const [side,imgs]of [['antes',data.before],['depois',data.after]])for(const i of imgs){fs.writeFileSync(path.join(shots,`cp03e-${i.name}-${side}.png`),Buffer.from(i.png,'base64'));delete i.png;}fs.writeFileSync(path.join(shots,'cp03e-reload-alto.png'),Buffer.from(reload.png,'base64'));delete reload.png;
 const failures=[];try{assert.deepEqual(data.beforeSig,data.afterSig);assert.ok(data.passage&&data.culvertClear&&data.photo&&data.navCurrent&&data.navChanged);assert.equal(reload.level,'07');assert.equal(reload.version,'cp03e');assert.equal(reload.drum,'GONE');assert.ok(reload.high&&reload.nav);assert.deepEqual(reload.trucks,data.trucks);for(let i=0;i<data.after.length;i++){assert.ok(data.after[i].calls-data.before[i].calls<=16);assert.ok(data.after[i].tris-data.before[i].tris<=5000);}}catch(e){failures.push(e.message);}
 fs.writeFileSync(path.join(dir,'cp03e-cenarios.json'),JSON.stringify({data,reload},null,2));console.log('CP03E: '+JSON.stringify({...data,beforeSig:undefined,afterSig:undefined,reload}));failures.push(...errorsOf(logs));finish('CP-03E depósito',failures,'bueiro, restauração de rotas, comboio e recarga Alto; percurso humano/Android pendentes');
}).catch(e=>{console.error(e);process.exit(1);});
