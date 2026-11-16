'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {withGame,ROOT,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs,boot})=>{
 const data=await page.evaluate(()=>{
  APP.noLock=true;settings.quality='baixo';settings.autoRes=false;
  const build=()=>{const old=Math.random;Math.random=mulberry32(309);try{startPlaying(null,'09');}finally{Math.random=old;}};
  const sig=()=>({solids:W.solids.map(s=>[s.minX,s.maxX,s.minY,s.maxY,s.minZ,s.maxZ]),nodes:W.nav.nodes,doors:Object.keys(W.doors),objectives:G.objectives.map(o=>o.id),photos:W.photo.map(t=>[t.id,t.pos.toArray()]),lights:scene.children.filter(o=>o.isLight).length,boats:scene.children.filter(o=>o.name?.startsWith('Barco pesqueiro')||o.name?.startsWith('Lancha torpedeira')).map(o=>[o.name,o.position.toArray()])});
  const views=[['kommandantur',[-34,1.7,-24],[-34,2,-20]],['capitania',[35,1.7,-39],[35,2,-44]],['arsenal',[36,1.7,-24],[40,2,-20]]];
  const frame=([name,p,t])=>{MENU3D.on=false;VM.root.visible=false;camera.position.set(...p);camera.lookAt(...t);setCameraFov(75);scene.updateMatrixWorld(true);renderFrame(false,.016);return {name,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,png:canvas.toDataURL('image/png').split(',')[1]};};
  const use=id=>{const i=W.interactables.find(i=>i.id===id),p=i.pt();G.player.pos.set(p.x,heightAt(p.x,p.z),p.z+(id==='clerk'?-1:1));i.use();};
  const photo=(id,p)=>{const t=W.photo.find(t=>t.id===id);G.player.pos.set(p[0],0,p[2]);camera.position.set(...p);camera.lookAt(t.pos);const c=photoCandidate();const ok=!!c?.ok&&c.t.id===id;if(ok)takePhoto();return ok;};
  build();const upgrade=improveChaniaScenery;improveChaniaScenery=()=>{};let before,beforeSig;
  try{build();beforeSig=sig();before=views.map(frame);}finally{improveChaniaScenery=upgrade;}
  build();const afterSig=sig(),after=views.map(frame);
  const poles=[[-3.4,-26,2.6,.07],[3.4,-26,2.6,.07],[-25,-27.1,2.2,.06],[-23,-27.1,2.2,.06],[-31,-27.1,2.2,.06],[-29,-27.1,2.2,.06],[-9.2,-13.9,2.2,.06],[-7.2,-13.9,2.2,.06]];
  const supports=poles.every(([x,z,h,w])=>W.solids.some(s=>Math.abs((s.minX+s.maxX)/2-x)<1e-6&&Math.abs((s.minZ+s.maxZ)/2-z)<1e-6&&Math.abs(s.maxY-h)<1e-6&&Math.abs(s.maxX-s.minX-w)<1e-6));
  const walk=z=>{const P=G.player;P.pos.set(-4.4,0,z);P.vx=P.vz=P.vy=0;P.yaw=0;P.onGround=true;input.mx=1;input.mz=0;try{for(let i=0;i<90;i++)updatePlayer(1/60);}finally{input.mx=0;input.mz=0;}return P.pos.x;};
  const blockedX=walk(-26),clearX=walk(-27);
  // Patrulha real do cais, com os demais atores estáticos e jogador fora de vista.
  build();G.player.pos.set(-60,0,0);const e=G.enemies.find(e=>e.id==='fp1');let right=false,returned=false,maxStuck=0,steps=0;
  for(;steps<4500;steps++){simTime+=1/30;e.update(1/30);maxStuck=Math.max(maxStuck,e.stuck||0);if(e.pos.x>22)right=true;if(right&&e.pos.x<-48){returned=true;break;}}
  const patrol={right,returned,maxStuck,steps,state:e.state,position:e.pos.toArray()};
  build();const capClosed=!segClear2D(35,-43,35,-45.4,.32,true);use('hkdoor');use('kfrontdoor');use('depdoor');for(let i=0;i<50;i++)updateDoors(1/60);
  const passages={capitania:segClear2D(35,-43,35,-45.4,.32,true),kommandantur:segClear2D(-34,-21,-34,-18.6,.32,true),deposito:segClear2D(30,-5.4,30,-2.8,.32,true)};
  use('sched');closeDoc();use('board9');const blocked={ending:G.ending,pass:obj('pass').state,map:obj('map').state,locked:W.interactables.find(i=>i.id==='board9').locked()};
  use('seller');use('tenente');startPlaying(readStoredCheckpoint().cp);const visa={flag:G.flags.visto,text:obj('pass').text,cred:G.cred};
  use('clerk');use('board9');const mapBlocked=!G.ending&&obj('map').state==='active'&&G.cred===2;
  const map=photo('map9',[35,1.7,-48.5]),boat=photo('eboat',[40,1.7,-48]);cp09();const investigation=readStoredCheckpoint().cp;startPlaying(investigation);
  const restoredPhotos=W.photo.every(t=>t.taken)&&G.stats.photos===2,documents=G.cred===2&&G.flags.pass&&obj('pass').state==='done'&&!G.refs.clip.visible;
  // Alternativa do suborno e carimbo, sem substituir o caminho com visto/escrivão.
  build();use('seller');use('itsentry');const mid=readStoredCheckpoint().cp;const opening={live:W.doors.itgate.state,saved:mid.doors.itgate};startPlaying(mid);
  const bribe={flag:G.flags.bribed,guard:G.enemies.find(e=>e.id==='it3').bribed,gate:W.doors.itgate.state,clear:segClear2D(29,11.5,32,11.5,.32,true)};
  use('stamp9');const forged=G.flags.forged&&G.flags.pass&&G.cred===2&&obj('pass').state==='done';
  startPlaying(investigation);blowDisguise(null,'tiro');update09(0);cp09();const finalCP=readStoredCheckpoint().cp;
  const cache=Object.values(CHANIA_SCENERY),textures=[...new Set(cache.map(m=>m.map).filter(Boolean))];let disposed=0;for(const r of [...cache,...textures])r.addEventListener('dispose',()=>disposed++);
  startPlaying(null,'10');const isolated=!G.refs.chaniaScenery;settings.quality='alto';startPlaying(finalCP);const live=RES.live(),high=MAT_HQ&&cache.every(m=>live.m.has(m))&&textures.every(t=>live.t.has(t))&&disposed===0;saveSettings();
  return {before,after,beforeSig,afterSig,supports,blockedX,clearX,patrol,capClosed,passages,blocked,visa,mapBlocked,map,boat,restoredPhotos,documents,opening,bribe,forged,isolated,high,disposed};
 });
 await boot();const reload=await page.evaluate(()=>{
  APP.noLock=true;startPlaying(readStoredCheckpoint().cp);MENU3D.on=false;VM.root.visible=false;camera.position.set(35,1.7,-39);camera.lookAt(35,2,-44);scene.updateMatrixWorld(true);renderFrame(false,.016);
  const b=W.interactables.find(i=>i.id==='board9');return {level:G.levelId,kit:G.refs.chaniaScenery?.version,high:MAT_HQ,photos:W.photo.every(t=>t.taken),count:G.stats.photos,pass:G.cred===2,blown:G.disguise.blown,ready:!b.locked(),gate:W.doors.hk.state,png:canvas.toDataURL('image/png').split(',')[1]};
 });
 const completion=await page.evaluate(()=>{W.interactables.find(i=>i.id==='board9').use();return G.ending;});await page.waitForFunction(()=>APP.state==='RESULTS',{timeout:10000});
 const results=await page.evaluate(()=>APP.state==='RESULTS'&&!$('#results').hidden);
 const shots=path.join(ROOT,'qa-shots'),dir=path.join(ROOT,'qa-report');fs.mkdirSync(shots,{recursive:true});fs.mkdirSync(dir,{recursive:true});const write=(n,o)=>{fs.writeFileSync(path.join(shots,n+'.png'),Buffer.from(o.png,'base64'));delete o.png;};for(const [side,imgs]of [['antes',data.before],['depois',data.after]])for(const o of imgs)write('cp03g-'+o.name+'-'+side,o);write('cp03g-reload-alto',reload);
 const failures=[];try{
  assert.deepEqual(data.beforeSig,data.afterSig);assert.ok(data.supports);assert.ok(data.blockedX<-3.7&&data.blockedX>-4.4);assert.ok(data.clearX>-2.5);assert.ok(data.patrol.right&&data.patrol.returned);assert.equal(data.patrol.maxStuck,0);assert.equal(data.patrol.state,'PATROL');assert.ok(data.capClosed&&Object.values(data.passages).every(Boolean));assert.equal(data.blocked.ending,false);assert.equal(data.blocked.pass,'active');assert.equal(data.blocked.map,'active');assert.ok(data.blocked.locked);assert.ok(data.visa.flag&&data.visa.cred===1&&data.visa.text.includes('escrivão'));assert.ok(data.mapBlocked&&data.map&&data.boat&&data.restoredPhotos&&data.documents);assert.equal(data.opening.live,'OPENING');assert.equal(data.opening.saved,'OPEN');assert.ok(data.bribe.flag&&data.bribe.guard&&data.bribe.clear);assert.equal(data.bribe.gate,'OPEN');assert.ok(data.forged&&data.isolated&&data.high);assert.equal(data.disposed,0);assert.equal(reload.level,'09');assert.equal(reload.kit,'cp03g');assert.ok(reload.high&&reload.photos&&reload.pass&&reload.blown&&reload.ready);assert.equal(reload.count,2);assert.equal(reload.gate,'OPEN');assert.ok(completion&&results);for(let i=0;i<data.after.length;i++){assert.ok(data.after[i].calls-data.before[i].calls<=16);assert.ok(data.after[i].tris-data.before[i].tris<=5000);}
 }catch(e){failures.push(e.stack);}
 fs.writeFileSync(path.join(dir,'cp03g-cenarios.json'),JSON.stringify({data,reload,completion,results},null,2));console.log('CP03G: '+JSON.stringify({...data,beforeSig:undefined,afterSig:undefined,reload,completion,results}));failures.push(...errorsOf(logs));finish('CP-03G Chania',failures,'postes, patrulha, documentos, fotos e embarque em fixture; percurso completo/Android pendentes');
}).catch(e=>{console.error(e);process.exit(1);});
