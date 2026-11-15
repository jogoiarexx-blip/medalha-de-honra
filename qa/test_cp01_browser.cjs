'use strict';
// Integração CP-01 no Chromium: eventos, telas, sessão e objetivos da operação 01.
// Objetivos usam interações reais, com posicionamento controlado (não é playthrough).
const assert=require('node:assert/strict');
const {withGame,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
  const failures=[];
  const check=async(name,fn)=>{try{await fn();console.log('ok: '+name);}catch(e){failures.push(name+': '+e.message);}};
  await page.evaluate(()=>{settings.quality='baixo'; settings.autoRes=false; APP.noLock=true; startPlaying(null,'01'); setupTouch();});
  await check('toque, documento e perda de foco',async()=>{
    const r=await page.evaluate(()=>{
      touchState.move={id:99,ax:1,ay:-1};touchState.look={id:98,x:20,y:20};touchState.fire=true;touchState.use=true;
      input.firePressed=true;input.adsToggled=true;openDoc('shiftlog');
      const yaw=G.player.yaw;
      $('#tLook').dispatchEvent(new PointerEvent('pointermove',{pointerId:98,clientX:200,clientY:20}));
      document.querySelector('[data-t="reload"]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
      const paused={clean:!touchState.move&&!touchState.look&&!touchState.fire&&!touchState.use&&!input.firePressed&&!input.adsToggled,camera:G.player.yaw===yaw,reload:input.reloadPressed};
      closeDoc();window.dispatchEvent(new Event('blur'));
      return {...paused,blur:UI.isOpen('pause')};
    });
    assert.equal(r.clean,true);assert.equal(r.camera,true);assert.equal(r.reload,false);assert.equal(r.blur,true);
    await page.click('#bResume');
  });
  await check('controle híbrido e gatilho mantido',async()=>{
    const r=await page.evaluate(()=>{
      const original=Object.getOwnPropertyDescriptor(navigator,'getGamepads');
      const pad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};
      Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
      try{
        pollGamepad(.016);pad.buttons[7].pressed=true;pollGamepad(.016);pollTouch();
        const fire=input.fire,label=controlLabel('use');openPause();resumeGame();pollGamepad(.016);const blocked=!input.fire&&!input.firePressed;
        pad.buttons[7].pressed=false;pollGamepad(.016);pad.buttons[7].pressed=true;pollGamepad(.016);pollTouch();
        return {fire,label,blocked,again:input.fire};
      }finally{if(original)Object.defineProperty(navigator,'getGamepads',original);else delete navigator.getGamepads;resetGameplayInput();}
    });
    assert.equal(r.fire,true);assert.equal(r.label,'A / ✕');assert.equal(r.blocked,true);assert.equal(r.again,true);
  });
  await check('timer de gameplay não atravessa reinício da mesma missão',async()=>{
    const r=await page.evaluate(()=>{
      missionAfter(100,()=>{G.flags.staleTask=true;});startPlaying(null,'01');tickMissionTasks(1);
      const old=!!G.flags.staleTask;missionAfter(100,()=>{G.flags.ownTask=(G.flags.ownTask||0)+1;});
      tickMissionTasks(.05);const early=!!G.flags.ownTask;tickMissionTasks(.06);tickMissionTasks(1);
      return {old,early,count:G.flags.ownTask};
    });assert.equal(r.old,false);assert.equal(r.early,false);assert.equal(r.count,1);
  });
  await check('operação 01: chave antes da conversa, rádio, Sten, save/load e extração real (fixture)',async()=>{
    const r=await page.evaluate(()=>{
      startPlaying(null,'01');
      const use=id=>{const it=W.interactables.find(it=>it.id===id);if(!it)throw Error('interação ausente: '+id);it.use();};
      use('key');use('radio');use('stencrate');
      const keyFirst=obj('meet').state==='done'&&obj('key').state==='done'&&G.ally.joined;
      use('garage');
      // Make the actual door finish opening before a checkpoint, as during gameplay.
      for(let i=0;i<180;i++){updateDoors(1/60);tickMissionTasks(1/60);}
      const saved=readStoredCheckpoint();if(!saved.cp)throw Error('checkpoint inválido: '+JSON.stringify(saved));
      const cp=saved.cp;startPlaying(cp);
      const restored=G.player.key&&G.radioDead&&G.flags.sten&&G.player.weapons.includes('smg')&&W.doors.garage.state==='OPEN'&&G.ally.joined&&obj('escape').state==='active';
      toggleAlly();const waits=G.ally.mode==='WAIT';toggleAlly();
      // Set fixture positions only; update01 must decide whether extraction is legal.
      G.player.pos.set(-12,0,-34);G.ally.pos.set(-12,0,-34);G.ally.downed=true;update01(1/60);const rejectsDowned=!G.ending;
      G.ally.downed=false;G.ally.pos.set(20,0,20);update01(1/60);const rejectsDistant=!G.ending;
      G.ally.pos.set(-12,0,-34);update01(1/60);
      return {keyFirst,restored,waits,rejectsDowned,rejectsDistant,ending:G.ending,radio:obj('radio').state};
    });
    for(const k of ['keyFirst','restored','waits','rejectsDowned','rejectsDistant','ending'])assert.equal(r[k],true,k);
    assert.equal(r.radio,'done');
    await page.waitForFunction(()=>APP.state==='RESULTS',{timeout:20000});await page.click('#bNext');await page.click('#bStart');
    assert.equal(await page.evaluate(()=>G.levelId),'02');
  });
  failures.push(...errorsOf(logs));
  finish('CP-01: entradas/sessão e integração de objetivos da 01',failures,'posicionamento controlado; percurso humano e Android físico NÃO cobertos');
}).catch(e=>{console.error(e);process.exit(1);});
