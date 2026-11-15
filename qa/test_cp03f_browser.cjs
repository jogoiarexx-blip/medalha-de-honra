'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{withGame,ROOT,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs,boot})=>{
 const data=await page.evaluate(()=>{
  APP.noLock=true;settings.quality='baixo';settings.autoRes=false;
  const build=()=>{const old=Math.random;Math.random=mulberry32(308);try{startPlaying(null,'08');}finally{Math.random=old;}};
  const sig=()=>({solids:W.solids.map(s=>[s.minX,s.maxX,s.minY,s.maxY,s.minZ,s.maxZ]),nav:W.nav.nodes,doors:Object.keys(W.doors),objectives:G.objectives.map(o=>o.id),lights:scene.children.filter(o=>o.isLight).length});
  const views=[['cisterna',[2,1.7,8.6],[6,1.6,9]],['pista',[42,1.7,24],[49,1.8,21]]];
  const frame=([name,p,t])=>{MENU3D.on=false;VM.root.visible=false;camera.position.set(...p);camera.lookAt(...t);scene.updateMatrixWorld(true);renderFrame(false,.016);return {name,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,png:canvas.toDataURL('image/png').split(',')[1]};};
  build();const upgrade=improveBirZitounScenery;improveBirZitounScenery=()=>{};let before,beforeSig;try{build();beforeSig=sig();before=views.map(frame);}finally{improveBirZitounScenery=upgrade;}
  build();const afterSig=sig(),after=views.map(frame),closedBlocked=!segClear2D(4.6,9,7.4,9,.32,true);
  const use=id=>W.interactables.find(i=>i.id===id).use();
  // Chave e arrombamento usam os callbacks reais; portas animadas pelo update comum.
  use('celldoor');for(let i=0;i<50;i++)updateDoors(1/60);const forcedOpen=W.doors.cell.state==='OPEN';
  build();use('radio8w');G.flags.cellKey=true;use('celldoor');for(let i=0;i<50;i++)updateDoors(1/60);
  const openClear=segClear2D(4.6,9,7.4,9,.32,true),gate=W.doors.cell;
  scene.updateMatrixWorld(true);const ray=new T.Raycaster(V3(4,1.1,9.24),V3(1,0,0),0,6.5),gateClear=ray.intersectObject(gate.mesh,false).length===0;
  // Combate neutralizado nesta fixture: movimento real da aliada pela porta, sem recover.
  for(const e of G.enemies)e.dead=true;use('yas');const A=G.ally;let recoveries=0;A.recover=()=>{recoveries++;};G.player.pos.set(1,0,9);G.player.yaw=-Math.PI/2;
  const start=A.pos.toArray();for(let i=0;i<600;i++)A.update(1/60);const end=A.pos.toArray(),rescued=A.joined&&A.pos.x<5.5&&recoveries===0;
  const opened=frame(['grade-aberta',[3.8,1.7,9],[8,1.2,9]]);
  use('pot0');const first=readStoredCheckpoint().cp,firstSaved=!!first.flags.pot0&&first.flags.potN===1;
  startPlaying(first);const partial={text:obj('smoke').text,marker:obj('smoke').marker,ally:G.ally.pos.toArray(),door:W.doors.cell.state};
  use('pot1');const second=readStoredCheckpoint().cp;startPlaying(second);const both={text:obj('smoke').text,marker:obj('smoke').marker,hold:obj('hold').state};
  const initial=JSON.stringify(W.nav.edges);G.flags.boardOn=true;complete('hold',true);activate('board');cp08();startPlaying(readStoredCheckpoint().cp);
  const loaded=JSON.stringify(W.nav.edges);buildNav();const board={current:loaded===JSON.stringify(W.nav.edges),changed:initial!==loaded,trucks:G.refs.lrdg.map(v=>[v.x,v.z,v.state,v.solid.active]),active:obj('board').state};
  settings.quality='alto';saveSettings();return {before,after,beforeSig,afterSig,closedBlocked,forcedOpen,openClear,gateClear,start,end,recoveries,rescued,opened,firstSaved,partial,both,board};
 });
 await boot();const reload=await page.evaluate(()=>{APP.noLock=true;startPlaying(readStoredCheckpoint().cp);MENU3D.on=false;VM.root.visible=false;camera.position.set(3.8,1.7,9);camera.lookAt(8,1.2,9);scene.updateMatrixWorld(true);renderFrame(false,.016);const n=JSON.stringify(W.nav.edges);buildNav();return {level:G.levelId,kit:G.refs.birScenery?.version,high:MAT_HQ,door:W.doors.cell.state,smoke:obj('smoke').text,nav:n===JSON.stringify(W.nav.edges),board:obj('board').state,png:canvas.toDataURL('image/png').split(',')[1]};});
 const shots=path.join(ROOT,'qa-shots'),dir=path.join(ROOT,'qa-report');fs.mkdirSync(shots,{recursive:true});fs.mkdirSync(dir,{recursive:true});
 const write=(name,o)=>{fs.writeFileSync(path.join(shots,name+'.png'),Buffer.from(o.png,'base64'));delete o.png;};for(const [side,imgs]of [['antes',data.before],['depois',data.after]])for(const o of imgs)write('cp03f-'+o.name+'-'+side,o);write('cp03f-grade-aberta',data.opened);write('cp03f-reload-alto',reload);
 const failures=[];try{assert.deepEqual(data.beforeSig,data.afterSig);for(const k of ['closedBlocked','forcedOpen','openClear','gateClear','rescued','firstSaved'])assert.ok(data[k],k);assert.equal(data.recoveries,0);assert.equal(data.partial.door,'OPEN');assert.ok(data.partial.text.includes('1/2'));assert.equal(data.partial.marker.x,108);assert.deepEqual(data.partial.ally,data.end);assert.ok(data.both.text.includes('2/2'));assert.equal(data.both.marker,null);assert.equal(data.both.hold,'active');assert.ok(data.board.current&&data.board.changed);assert.deepEqual(data.board.trucks,[[118,-6,'DONE',true],[112,7,'DONE',true]]);assert.equal(data.board.active,'active');assert.equal(reload.level,'08');assert.equal(reload.kit,'cp03f');assert.equal(reload.door,'OPEN');assert.ok(reload.high&&reload.nav&&reload.smoke.includes('2/2'));assert.equal(reload.board,'active');for(let i=0;i<data.after.length;i++){assert.ok(data.after[i].calls-data.before[i].calls<=16);assert.ok(data.after[i].tris-data.before[i].tris<=5000);}}catch(e){failures.push(e.stack);}
 fs.writeFileSync(path.join(dir,'cp03f-cenarios.json'),JSON.stringify({data,reload},null,2));console.log('CP03F: '+JSON.stringify({...data,beforeSig:undefined,afterSig:undefined,reload}));failures.push(...errorsOf(logs));finish('CP-03F Bir Zitoun',failures,'grade, percurso local de Yasmina, fumaças/save e recarga Alto; defesa completa/Android pendentes');
}).catch(e=>{console.error(e);process.exit(1);});
