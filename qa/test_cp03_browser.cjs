'use strict';
// CP-03A: comparação visual/geométrica e orçamento de desenho da operação 01.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {withGame,errorsOf,finish,ROOT}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
 const failures=[],shots=path.join(ROOT,'qa-shots'),reports=path.join(ROOT,'qa-report');fs.mkdirSync(shots,{recursive:true});fs.mkdirSync(reports,{recursive:true});
 const data=await page.evaluate(()=>{
  settings.quality='baixo';settings.chars='modelo';settings.autoRes=false;APP.noLock=true;
  const capture=()=>{
   const images=[];MENU3D.on=false;VM.root.visible=false;
   for(const [name,p,t] of [['rua',[0,1.65,41],[0,1.45,24]],['praca',[6,1.8,7],[0,1.1,0]]]){
    camera.position.set(...p);camera.lookAt(...t);setCameraFov(75);scene.updateMatrixWorld(true);renderFrame(false,.016);
    const gl=renderer.getContext(),px=new Uint8Array(64*64*4);gl.readPixels((gl.drawingBufferWidth>>1)-32,(gl.drawingBufferHeight>>1)-32,64,64,gl.RGBA,gl.UNSIGNED_BYTE,px);
    let lum=0;for(let i=0;i<px.length;i+=4)lum+=px[i]+px[i+1]+px[i+2];
    images.push({name,png:canvas.toDataURL('image/png').split(',')[1],calls:renderer.info.render.calls,tris:renderer.info.render.triangles,lum:lum/(64*64*3)});
   }
   return images;
  };
  const signature=()=>({nav:JSON.stringify(W.nav.nodes),doors:Object.keys(W.doors),interactions:W.interactables.map(x=>x.id),lamps:W.lamps.length,solids:W.solids.length,objectives:G.objectives.map(x=>x.id)});
  const upgrade=improveParisScenery;improveParisScenery=()=>{};
  let before,beforeState;try{startPlaying(null,'01');beforeState=signature();before=capture();}finally{improveParisScenery=upgrade;}
  startPlaying(null,'01');const afterState=signature(),info={...G.refs.parisScenery},after=capture();
  const lights=[];scene.traverse(o=>{if(o.isPointLight)lights.push(o);});
  const edge=V3(0,0,2.15);resolveCircle(edge,.34,0,1.75);const corner=V3(1.9,0,1.9);resolveCircle(corner,.34,0,1.75);
  const lamp=W.lamps.find(x=>x.id==='L1');breakLamp(lamp,false);const lampOff=lamp.spill.visible===false&&lamp.light.intensity===0;
  checkpoint();const cp=readStoredCheckpoint().cp;startPlaying(cp);const restored=W.lamps.find(x=>x.id==='L1');const lampRestored=restored.broken&&!restored.spill.visible;
  const route=findPath(0,41,-9.6,6.2);let prev={x:0,z:41};const clear=!!route&&route.every(p=>{const ok=segClear2D(prev.x,prev.z,p.x,p.z,.3,true);prev=p;return ok;});
  startPlaying(null,'02');const isolated=!G.refs.parisScenery&&!W.lamps.some(x=>x.spill);
  return {before,after,beforeState,afterState,info,edge:edge.z,corner:[corner.x,corner.z],lampOff,lampRestored,clear,isolated,pointLights:lights.length};
 });
 for(const [side,imgs] of [['antes',data.before],['depois',data.after]])for(const img of imgs){fs.writeFileSync(path.join(shots,`paris-${img.name}-${side}.png`),Buffer.from(img.png,'base64'));delete img.png;}
 try{
  assert.equal(data.beforeState.nav,data.afterState.nav);assert.deepEqual(data.beforeState.doors,data.afterState.doors);assert.deepEqual(data.beforeState.interactions,data.afterState.interactions);assert.deepEqual(data.beforeState.objectives,data.afterState.objectives);assert.equal(data.beforeState.lamps,data.afterState.lamps);
  assert.equal(data.info.storefronts,8);assert.equal(data.info.spills,8);assert.ok(data.edge>2.4);assert.ok(Math.abs(data.corner[0]-1.9)<.001&&Math.abs(data.corner[1]-1.9)<.001);
  assert.equal(data.lampOff,true);assert.equal(data.lampRestored,true);assert.equal(data.clear,true);assert.equal(data.isolated,true);
  for(let i=0;i<data.after.length;i++){assert.ok(data.after[i].lum>1,'imagem preta');assert.ok(data.after[i].calls-data.before[i].calls<=24,'orçamento de draw calls excedido');assert.ok(data.after[i].tris-data.before[i].tris<=4000,'orçamento de geometria excedido');}
 }catch(e){failures.push(e.message+' '+JSON.stringify(data));}
 fs.writeFileSync(path.join(reports,'cp03-cenarios.json'),JSON.stringify(data,null,2));
 failures.push(...errorsOf(logs));console.log('CENARIOS: '+JSON.stringify(data));finish('CP-03A cenários da operação 01',failures,'imagens antes/depois, colisão da fonte, passagem, lâmpadas/save e custo comparável; visual humano/Android pendentes');
}).catch(e=>{console.error(e);process.exit(1);});
