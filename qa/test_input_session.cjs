'use strict';
// Regressões isoladas: handlers reais em VM com DOM/gamepad mínimos.
// Não substitui teste de navegador, captura de ponteiro ou Android físico.
const {test}=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path'), root=path.resolve(__dirname,'..');
function fixture(){
  const elements=new Map(),winEvents={},docEvents={};
  function el(id){
    if(elements.has(id)) return elements.get(id);
    const classes=new Set(), events={};
    const node={hidden:true,style:{},dataset:{},textContent:'',events,
      classList:{contains:x=>classes.has(x),add:x=>classes.add(x),remove:x=>classes.delete(x),toggle(x,v){if(v===undefined)v=!classes.has(x); v?classes.add(x):classes.delete(x);}},
      addEventListener(k,fn){(events[k]||=[]).push(fn);},
      querySelector(){return null;},getBoundingClientRect(){return {left:0,top:0};},
      setPointerCapture(){},hasPointerCapture(){return false;},releasePointerCapture(){}};
    elements.set(id,node); return node;
  }
  el('#tStick').firstElementChild={style:{}};
  const buttons=['fire','use','ads','crouch','pause','ally','reload'].map(t=>{const n=el('btn:'+t);n.dataset.t=t;return n;});
  const ctx=vm.createContext({console,Set,Math,performance:{now:()=>1000},setTimeout:()=>1,clearTimeout(){},
    $:el,canvas:el('canvas'),navigator:{getGamepads:()=>[]},
    document:{visibilityState:'visible',body:el('body'),pointerLockElement:null,
      addEventListener(k,fn){(docEvents[k]||=[]).push(fn);},querySelectorAll(sel){return sel==='#touch button'?buttons:[];}},
    addEventListener(k,fn){(winEvents[k]||=[]).push(fn);},
    V3:(x=0,y=0,z=0)=>({x,y,z}),
    clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),settings:{sens:1,adsToggle:false,crouchToggle:true},
    G:{player:{dead:false,yaw:0,pitch:0,crouchOn:false,proneOn:false},ending:false,cp:null,radioQ:[]},
    currentObjective:()=>null,releaseLock(){},AudioSys:{play(){}},
    toggleAlly(){},stanceCycle(){},toggleCamera(){},WEAPONS:{},showHint(){},setDebugWire(){}});
  const source=fs.readFileSync(path.join(root,'js/17-input-ui.js'),'utf8');
  vm.runInContext(source.slice(0,source.indexOf('let radioCur=')),ctx);
  const run=s=>vm.runInContext(s,ctx);
  const event=(events,k,data={})=>{for(const fn of events[k]||[]) fn({preventDefault(){},code:'',pointerId:1,clientX:10,clientY:10,...data});};
  return {ctx,run,el,win:(k,d)=>event(winEvents,k,d),doc:(k,d)=>event(docEvents,k,d),pointer:(id,k,d)=>event(el(id).events,k,d)};
}
test('pausa limpa movimento, disparo, mira e toque; olhar não altera câmera congelada',()=>{
  const f=fixture(); f.run("APP.state='PLAYING'; setupTouch();");
  f.pointer('#tMove','pointerdown'); f.pointer('#tMove','pointermove',{clientY:-30});
  f.pointer('#tLook','pointerdown'); f.pointer('btn:fire','pointerdown');
  f.run('input.ads=true; input.adsToggled=true; keys.KeyW=true; openPause();');
  assert.equal(f.run('touchState.move'),null,'joystick ficou ativo na pausa');
  assert.equal(f.run('touchState.fire'),false,'disparo ficou ativo na pausa');
  assert.equal(f.run('input.ads||input.adsToggled||keys.KeyW||input.firePressed'),false);
  const yaw=f.run('G.player.yaw');
  f.pointer('#tLook','pointerdown'); f.pointer('#tLook','pointermove',{clientX:110});
  assert.equal(f.run('G.player.yaw'),yaw,'câmera mudou na pausa');
  f.pointer('btn:reload','pointerdown'); assert.equal(f.run('input.reloadPressed'),false);
});
test('perda de foco/aba no toque limpa entradas e pausa automaticamente',()=>{
  for(const hidden of [false,true]){
    const f=fixture(); f.run("APP.state='PLAYING'; setupTouch(); touchState.move={id:2,ax:1,ay:1}; touchState.fire=true; touchState.use=true;");
    if(hidden){f.ctx.document.visibilityState='hidden';f.doc('visibilitychange');}else f.win('blur');
    assert.equal(f.run("UI.isOpen('pause')"),true,'aplicativo em segundo plano sem pausa');
    assert.equal(f.run('touchState.fire||touchState.use||!!touchState.move'),false);
  }
});
test('tecla mantida e repetição depois da pausa não voltam a mover até soltar',()=>{
  const f=fixture(); f.run("APP.state='PLAYING';");
  f.win('keydown',{code:'KeyW'}); f.run('openPause(); resumeGame();');
  f.win('keydown',{code:'KeyW',repeat:true});f.run('pollKeyboard();');
  assert.equal(f.run('input.mz'),0);
  f.win('keyup',{code:'KeyW'});f.win('keydown',{code:'KeyW'});f.run('pollKeyboard();');
  assert.equal(f.run('input.mz'),1);
});
test('controle mantido ao retomar aguarda neutro; dicas seguem último dispositivo',()=>{
  const f=fixture(),pad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
  f.ctx.navigator.getGamepads=()=>[pad];f.run("APP.state='PLAYING'; setupTouch(); pollGamepad(.016);");
  pad.buttons[7].pressed=true;f.run('pollGamepad(.016);');
  assert.equal(f.run("controlLabel('use')"),'A / ✕');
  assert.equal(f.run('input.fire'),true);
  f.run('openPause(); resumeGame(); pollGamepad(.016); pollTouch();');
  assert.equal(f.run('input.fire||input.firePressed'),false,'gatilho mantido voltou a disparar');
  pad.buttons[7].pressed=false;f.run('pollGamepad(.016);');
  pad.buttons[7].pressed=true;f.run('pollGamepad(.016); pollTouch();');
  assert.equal(f.run('input.fire'),true,'toque inativo anulou o gatilho');
  f.win('keydown',{code:'KeyE'});assert.equal(f.run("controlLabel('use')"),'E');
  f.pointer('btn:use','pointerdown');assert.equal(f.run("controlLabel('use')"),'USAR');
});
test('desconectar controle durante tiro/mira limpa entradas e reconectar exige neutro',()=>{
  const f=fixture(),pad={index:0,connected:true,axes:[0,0,0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
  f.ctx.navigator.getGamepads=()=>[pad];f.run("APP.state='PLAYING';pollGamepad(.016);");
  pad.buttons[7].pressed=true;pad.buttons[6].pressed=true;f.run('pollGamepad(.016);');
  assert.equal(f.run('input.fire&&input.ads'),true);
  f.ctx.navigator.getGamepads=()=>[];f.run('pollKeyboard();pollGamepad(.016);');
  assert.equal(f.run('input.fire||input.ads'),false,'controle desconectado deixou gatilhos ativos');
  f.ctx.navigator.getGamepads=()=>[pad];f.run('pollGamepad(.016);');assert.equal(f.run('input.fire||input.ads'),false);
  pad.buttons[7].pressed=false;pad.buttons[6].pressed=false;f.run('pollGamepad(.016);');
  pad.buttons[7].pressed=true;f.run('pollGamepad(.016);');assert.equal(f.run('input.fire'),true);
});
test('cancelamento de ponteiro libera tiro e joystick sem retomar movimento',()=>{
  const f=fixture();f.run("APP.state='PLAYING';setupTouch();");
  f.pointer('#tMove','pointerdown');f.pointer('btn:fire','pointerdown');
  f.pointer('#tMove','pointercancel');f.pointer('btn:fire','pointercancel');f.run('pollKeyboard();pollTouch();');
  assert.equal(f.run('input.mx||input.mz||input.fire'),false);
});
function missionFixture(){
  const callbacks=[];
  const ctx=vm.createContext({console,Math,Set,LEVELS:{'01':{}},newPlayer:()=>({}),
    callbacks,setTimeout:fn=>callbacks.push(fn),
    V3:(x,y,z)=>({x,y,z}),doorInteract:()=>({}),AudioSys:{play(){}},openDoor(){},complete(){},activate(){},
    checkpoint(){ctx.saves.push(vm.runInContext('G.levelId',ctx));},saves:[],
    emitNoise(){},obj:()=>({state:'done'}),APP:{state:'PLAYING'},
  });
  vm.runInContext(fs.readFileSync(path.join(root,'js/08-mission-framework.js'),'utf8'),ctx);
  const src=fs.readFileSync(path.join(root,'js/09-paris-operations-01-03.js'),'utf8');
  vm.runInContext(src.slice(src.indexOf('function interact01('),src.indexOf('function pickups01(')),ctx);
  // Keep the persistence boundary observable while executing real interaction callbacks.
  vm.runInContext('checkpoint=()=>saves.push(G.levelId); G=newGameState("01","soldado"); G.player.key=true; W={interactables:[],doors:{garage:{state:"LOCKED",mesh:{position:{}}}}}; interact01({});',ctx);
  return {ctx,run:s=>vm.runInContext(s,ctx)};
}
test('checkpoint atrasado da garagem não grava em outra sessão, mesmo reiniciando a 01',()=>{
  const f=missionFixture();f.run('W.interactables.find(x=>x.id==="garage").use();');
  // Legacy wall-clock callbacks are exercised too so the regression fails before the fix.
  f.run('G=newGameState("01","soldado");');
  for(const cb of f.ctx.callbacks) cb();
  f.run('if(typeof tickMissionTasks==="function") tickMissionTasks(3);');
  assert.equal(f.ctx.saves.length,0,'callback da sessão anterior gravou checkpoint');
});
test('tarefa da missão respeita tempo simulado e executa uma vez; conclusão descarta pendências',()=>{
  const f=missionFixture();f.run('W.interactables.find(x=>x.id==="garage").use(); tickMissionTasks(2);');
  assert.equal(f.ctx.saves.length,0);
  f.run('tickMissionTasks(.4); tickMissionTasks(5);');assert.equal(f.ctx.saves.length,1);
  f.run('missionAfter(100,()=>saves.push("indevido")); G.ending=true; tickMissionTasks(1);');
  assert.equal(f.ctx.saves.length,1);
});
