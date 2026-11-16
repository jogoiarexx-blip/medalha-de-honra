'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {withGame,ROOT,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs,boot})=>{
 const data=await page.evaluate(()=>{
  APP.noLock=true;settings.quality='baixo';settings.autoRes=false;
  const build=()=>{const old=Math.random;Math.random=mulberry32(310);try{startPlaying(null,'10');}finally{Math.random=old;}};
  const sig=()=>({solids:W.solids.map(s=>[s.minX,s.maxX,s.minY,s.maxY,s.minZ,s.maxZ]),walk:W.walk.map(s=>[s.minX,s.maxX,s.minZ,s.maxZ,s.maxY]),nodes:W.nav.nodes,obj:G.objectives.map(o=>o.id),photos:W.photo.map(t=>[t.id,t.pos.toArray()]),lights:scene.children.filter(o=>o.isLight).length});
  const views=[['trono',[-8.5,3.3,-12],[-8.5,4.2,-16]],['armazens',[-9,3.3,-8],[-13,4.2,-8.6]],['escadaria',[35,1.7,-3.5],[29,1.3,-3.5]]];
  const frame=([name,p,t])=>{MENU3D.on=false;VM.root.visible=false;camera.position.set(...p);camera.lookAt(...t);setCameraFov(75);scene.updateMatrixWorld(true);renderFrame(false,.016);return {name,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,png:canvas.toDataURL('image/png').split(',')[1]};};
  const use=id=>{const i=W.interactables.find(i=>i.id===id),p=i.pt();G.player.pos.set(p.x-(id==='van'?.5:0),heightAt(p.x,p.z),p.z+(id==='charge10'?0:1));i.use();};
  const photo=(id,p)=>{const t=W.photo.find(t=>t.id===id);G.player.pos.set(p[0],heightAt(p[0],p[2]),p[2]);camera.position.set(...p);camera.lookAt(t.pos);const c=photoCandidate(),ok=!!c?.ok&&c.t.id===id;if(ok)takePhoto();return ok;};
  build();const upgrade=improveKnossosScenery;improveKnossosScenery=()=>{};let before,beforeSig;
  try{build();beforeSig=sig();before=views.map(frame);}finally{improveKnossosScenery=upgrade;}
  build();const afterSig=sig(),after=views.map(frame);
  const cap=segFirst(-9.5,3.15,4.8,-9.5,3.15,7.2),capHit=!!cap&&Math.abs(cap.solid.minY-3)<1e-6&&Math.abs(cap.solid.maxY-3.3)<1e-6,underCap=segFirst(-9.5,2.9,4.8,-9.5,2.9,7.2)===null;
  const stairs=[];for(const [name,x,z,yaw]of [['sul',-2,25.6,0],['leste',33.5,-3.5,Math.PI/2],['norte',9.5,-31.6,Math.PI]]){
    const P=G.player;resetGameplayInput();P.pos.set(x,0,z);P.vx=P.vz=P.vy=0;P.yaw=yaw;P.onGround=true;P.crouch=P.prone=P.adsT=0;P.crouchOn=P.proneOn=false;input.mz=1;
    for(let i=0;i<150;i++)updatePlayer(1/60);const up=P.pos.toArray();input.mz=-1;for(let i=0;i<150;i++)updatePlayer(1/60);input.mz=0;stairs.push({name,up,down:P.pos.toArray()});
  }
  build();use('ledger');closeDoc();const one={n:G.flags.evN,text:obj('evid').text,marker:obj('evid').marker};use('bull');startPlaying(readStoredCheckpoint().cp);
  const partial={n:G.flags.evN,text:obj('evid').text,marker:obj('evid').marker,ledger:!G.refs.ledger.visible,bull:!G.refs.bull.visible};
  const crates=photo('crates10',[14,1.7,31]),minimum={n:G.flags.evN,state:obj('evid').state,optional:obj('allEvid').state,marker:obj('evid').marker};
  const ammo=photo('ammo10',[-15.2,3.2,-9]);const investigation=readStoredCheckpoint().cp;startPlaying(investigation);
  const evidence={n:G.flags.evN,text:obj('evid').text,all:obj('allEvid').state,photos:W.photo.every(t=>t.taken),count:G.stats.photos};
  // Carga antecipada e tempo avançado são estados controlados, não corrida completa.
  build();use('charge10');G.flags.boomLeft=7;cp10();startPlaying(readStoredCheckpoint().cp);const timerFloor=G.flags.boomLeft;
  G.flags.boomLeft=.01;update10(.02);use('manolis');const blocked={ending:G.ending,evid:obj('evid').state,van:obj('van').state,locked:W.interactables.find(i=>i.id==='manolis').locked()};
  startPlaying(investigation);breakLamp(G.sl.lamp,false);cp10();startPlaying(readStoredCheckpoint().cp);const spotlight=G.sl.lamp.broken&&G.sl.light.intensity===0&&!G.sl.lamp.lantern.visible;
  use('van');const van=G.flags.vanDone&&obj('van').state==='done'&&obj('quietVan').state==='done';use('charge10');use('manolis');const waiting=!G.ending&&W.interactables.find(i=>i.id==='manolis').locked();
  G.flags.boomLeft=.01;update10(.02);cp10();const cp=readStoredCheckpoint().cp;startPlaying(cp);const blast={boomed:G.flags.boomed,chain:G.flags.chain,ready:!W.interactables.find(i=>i.id==='manolis').locked()};
  const cache=Object.values(KNOSSOS_SCENERY),textures=[...new Set(cache.map(m=>m.map).filter(Boolean))];let disposed=0;for(const r of [...cache,...textures])r.addEventListener('dispose',()=>disposed++);
  startPlaying(null,'11');const isolated=!G.refs.knossosScenery;settings.quality='alto';startPlaying(cp);const live=RES.live(),high=MAT_HQ&&cache.every(m=>live.m.has(m))&&textures.every(t=>live.t.has(t))&&disposed===0;saveSettings();
  return {before,after,beforeSig,afterSig,capHit,underCap,stairs,one,partial,crates,minimum,ammo,evidence,timerFloor,blocked,spotlight,van,waiting,blast,isolated,high,disposed};
 });
 await boot();const reload=await page.evaluate(()=>{
  APP.noLock=true;startPlaying(readStoredCheckpoint().cp);MENU3D.on=false;VM.root.visible=false;camera.position.set(-8.5,3.3,-12);camera.lookAt(-8.5,4.2,-16);scene.updateMatrixWorld(true);renderFrame(false,.016);
  return {level:G.levelId,kit:G.refs.knossosScenery?.version,high:MAT_HQ,n:G.flags.evN,text:obj('evid').text,photos:W.photo.every(t=>t.taken),count:G.stats.photos,van:G.flags.vanDone,boomed:G.flags.boomed,spotlight:G.sl.lamp.broken&&G.sl.light.intensity===0,ready:!W.interactables.find(i=>i.id==='manolis').locked(),png:canvas.toDataURL('image/png').split(',')[1]};
 });
 const completion=await page.evaluate(()=>{W.interactables.find(i=>i.id==='manolis').use();return G.ending;});await page.waitForFunction(()=>APP.state==='RESULTS',{timeout:10000});const results=await page.evaluate(()=>APP.state==='RESULTS'&&!$('#results').hidden);
 const shots=path.join(ROOT,'qa-shots'),dir=path.join(ROOT,'qa-report');fs.mkdirSync(shots,{recursive:true});fs.mkdirSync(dir,{recursive:true});const write=(n,o)=>{fs.writeFileSync(path.join(shots,n+'.png'),Buffer.from(o.png,'base64'));delete o.png;};for(const [side,imgs]of [['antes',data.before],['depois',data.after]])for(const o of imgs)write('cp03h-'+o.name+'-'+side,o);write('cp03h-reload-alto',reload);
 const failures=[];try{
  assert.deepEqual(data.beforeSig,data.afterSig);assert.ok(data.capHit&&data.underCap);for(const s of data.stairs){assert.ok(Math.abs(s.up[1]-1.6)<.02,s.name+' sobe');assert.ok(Math.abs(s.down[1])<.02,s.name+' desce');}assert.equal(data.one.n,1);assert.equal(data.one.marker.x,-10.8);assert.ok(data.one.text.includes('1/3'));assert.equal(data.partial.n,2);assert.ok(data.partial.text.includes('2/3'));assert.equal(data.partial.marker.x,14);assert.ok(data.partial.ledger&&data.partial.bull);assert.ok(data.crates&&data.ammo);assert.equal(data.minimum.n,3);assert.equal(data.minimum.state,'done');assert.equal(data.minimum.optional,'active');assert.equal(data.minimum.marker,null);assert.equal(data.evidence.n,4);assert.equal(data.evidence.all,'done');assert.ok(data.evidence.photos&&data.evidence.text.includes('3/3'));assert.equal(data.evidence.count,2);assert.equal(data.timerFloor,25);assert.equal(data.blocked.ending,false);assert.equal(data.blocked.evid,'active');assert.equal(data.blocked.van,'active');assert.ok(data.blocked.locked&&data.spotlight&&data.van&&data.waiting&&data.blast.boomed&&data.blast.ready);assert.equal(data.blast.chain,null);assert.ok(data.isolated&&data.high);assert.equal(data.disposed,0);assert.equal(reload.level,'10');assert.equal(reload.kit,'cp03h');assert.ok(reload.high&&reload.photos&&reload.van&&reload.boomed&&reload.spotlight&&reload.ready);assert.equal(reload.n,4);assert.equal(reload.count,2);assert.ok(completion&&results);for(let i=0;i<data.after.length;i++){assert.ok(data.after[i].calls-data.before[i].calls<=16);assert.ok(data.after[i].tris-data.before[i].tris<=5000);}
 }catch(e){failures.push(e.stack);}
 fs.writeFileSync(path.join(dir,'cp03h-cenarios.json'),JSON.stringify({data,reload,completion,results},null,2));console.log('CP03H: '+JSON.stringify({...data,beforeSig:undefined,afterSig:undefined,reload,completion,results}));failures.push(...errorsOf(logs));finish('CP-03H Cnossos',failures,'capitéis, escadas, provas, carga e fuga em fixture; percurso contínuo/Android pendentes');
}).catch(e=>{console.error(e);process.exit(1);});
