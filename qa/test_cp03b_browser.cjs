'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {withGame,ROOT,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
 const out=await page.evaluate(()=>{
  APP.noLock=true;settings.quality='baixo';settings.autoRes=false;settings.chars='modelo';
  const rows=[],upgrade=extendParisScenery,originalMats=mats04;
  const probesFor=id=>id==='02'?[[0,-28,0,-4]]:id==='03'?[[0,9,0,7],[0,-8,-8,-8]]:[[0,-23,0,-25],[-11,-31,-13,-31]];
  const cameras={
   '02':[['mausoleu',[14,1.7,-9],[8.1,2,-8.1]],['cemiterio',[0,1.7,-26],[-10,2,-29]]],
   '03':[['hotel',[0,1.7,14],[0,2.6,6]],['corredor',[0,1.7,-8],[-10,2,-9.8]]],
   '04':[['cais',[0,1.7,-25],[0,4,-45]],['barcaca',[3,1.7,-61],[7.5,-1,-72]]],
  };
  const sig=()=>({solids:W.solids.map(s=>[s.minX,s.maxX,s.minZ,s.maxZ,s.minY,s.maxY]),doors:Object.keys(W.doors),nav:W.nav.nodes.map(p=>[p.x,p.z]),interactions:W.interactables.map(i=>i.id),objectives:G.objectives.map(o=>o.id),shootables:W.shootables.length,lights:0});
  const capture=(id)=>{
   MENU3D.on=false;VM.root.visible=false;
   return cameras[id].map(([name,p,t])=>{camera.position.set(...p);camera.lookAt(...t);setCameraFov(75);scene.updateMatrixWorld(true);renderFrame(false,.016);
    const gl=renderer.getContext(),px=new Uint8Array(16*16*4);gl.readPixels((gl.drawingBufferWidth>>1)-8,(gl.drawingBufferHeight>>1)-8,16,16,gl.RGBA,gl.UNSIGNED_BYTE,px);let lum=0;for(let i=0;i<px.length;i+=4)lum+=px[i]+px[i+1]+px[i+2];
    return {name,png:canvas.toDataURL('image/png').split(',')[1],calls:renderer.info.render.calls,tris:renderer.info.render.triangles,lum:lum/(256*3)};
   });
  };
  for(const id of ['02','03','04']){
   // Reprodução do acabamento anterior; somente a 04 reverte também mapa/emissão.
   extendParisScenery=()=>{};mats04=()=>{const m=originalMats();for(const k of ['facA','facB','facC']){m[k].map=TEX.facade;m[k].emissiveIntensity=.1;if(m[k].bumpMap)m[k].bumpMap=TEX.facade;}return m;};
   let before,beforeSig,beforeClear;try{startPlaying(null,id);beforeSig=sig();scene.traverse(o=>{if(o.isLight)beforeSig.lights++;});before=capture(id);beforeClear=probesFor(id).map(p=>segClear2D(...p,.3,true));}finally{extendParisScenery=upgrade;mats04=originalMats;}
   startPlaying(null,id);const afterSig=sig();scene.traverse(o=>{if(o.isLight)afterSig.lights++;});const info={...G.refs.parisExtension},after=capture(id);
   let badDayMaterials=0;if(id==='04')scene.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m&&m.emissiveMap===TEX.facadeEm&&(m.map!==TEX.facadeDay||m.emissiveIntensity!==0))badDayMaterials++;});
   // Portas e acessos: testar os mesmos vãos físicos, sem forçar conclusão.
   const probes=probesFor(id);
   const clear=probes.map(p=>segClear2D(...p,.3,true));
   checkpoint();const cp=readStoredCheckpoint().cp;startPlaying(cp);const restored=!!G.refs.parisExtension&&JSON.stringify(G.objectives.map(o=>o.id))===JSON.stringify(afterSig.objectives);
   rows.push({id,before,after,beforeSig,afterSig,info,badDayMaterials,beforeClear,clear,restored});
  }
  startPlaying(null,'01');const previous=G.refs.parisScenery?.version==='cp03a'&&!G.refs.parisExtension;
  startPlaying(null,'05');const isolated=!G.refs.parisExtension;
  // Volta à 04 após trocar o perfil; a marca confirma reconstrução, não integridade visual do cache.
  settings.quality='alto';startPlaying(null,'04');const high=!!G.refs.parisExtension;renderFrame(false,.016);
  return {rows,previous,isolated,high};
 });
 const shots=path.join(ROOT,'qa-shots');fs.mkdirSync(shots,{recursive:true});
 for(const r of out.rows)for(const [side,imgs]of [['antes',r.before],['depois',r.after]])for(const i of imgs){fs.writeFileSync(path.join(shots,`cp03b-${i.name}-${side}.png`),Buffer.from(i.png,'base64'));delete i.png;}
 const failures=[];
 try{for(const r of out.rows){assert.deepEqual(r.afterSig,r.beforeSig,'contratos de cenário '+r.id);assert.equal(r.info.version,'cp03b');assert.equal(r.badDayMaterials,0);assert.ok(r.beforeClear.every(Boolean),'trajeto de referência bloqueado '+r.id);assert.ok(r.clear.every(Boolean),'passagem bloqueada '+r.id+': '+r.clear);assert.ok(r.restored);
   for(let i=0;i<r.after.length;i++){assert.ok(r.after[i].lum>1);assert.ok(r.after[i].calls-r.before[i].calls<=16);assert.ok(r.after[i].tris-r.before[i].tris<=5000);}
  }assert.ok(out.previous&&out.isolated&&out.high);
 }catch(e){failures.push(e.message);}
 const dir=path.join(ROOT,'qa-report');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'cp03b-cenarios.json'),JSON.stringify(out,null,2));
 console.log('CP03B: '+JSON.stringify({rows:out.rows.map(r=>({id:r.id,before:r.before,after:r.after,badDayMaterials:r.badDayMaterials,beforeClear:r.beforeClear,clear:r.clear,restored:r.restored})),previous:out.previous,isolated:out.isolated,high:out.high}));failures.push(...errorsOf(logs));finish('CP-03B cenários 02–04',failures,'capturas, orçamento, passagens, materiais e reentrada; percurso humano/Android pendentes');
}).catch(e=>{console.error(e);process.exit(1);});
