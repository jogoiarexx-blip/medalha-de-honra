'use strict';
// CP-02B: balística e save/load reais, em microcenários controlados.
const assert=require('node:assert/strict');
const {withGame,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
  const failures=[];
  const shots=await page.evaluate(()=>{
    settings.quality='baixo';settings.autoRes=false;APP.noLock=true;
    const rows=[];
    for(const target of ['player','ally'])for(const mode of ['above','below','blocked']){
      startPlaying(null,'01');CHEATS.god=false;G.diff='soldado';
      const e=G.enemies[0];G.enemies=[e];W.solids=[];W.glass=[];
      G.player.pos.set(target==='player'?0:100,0,target==='player'?0:100);G.ally.pos.set(target==='ally'?0:100,0,target==='ally'?0:100);
      const y=mode==='below'?-2:5;e.pos.set(0,y,0);e.muzzleWorld=()=>V3(0,y,0);e.ew={...e.ew,spread:0,dmg:10,noise:0};e.reactionT=-2;e.aimPenalty=0;e.suppression=0;e.tgtKind=target;
      if(mode==='blocked')W.solids.push({active:true,minX:-1,maxX:1,minZ:-1,maxZ:1,minY:2,maxY:3});
      const hp=target==='player'?G.player.hp:G.ally.hp;
      e.fireAt({x:0,z:0,chest:1.2,head:1.65});
      rows.push({target,mode,damage:hp-(target==='player'?G.player.hp:G.ally.hp)});
    }
    return rows;
  });
  for(const r of shots){try{assert.equal(r.damage,r.mode==='blocked'?0:r.target==='player'?10:8);}catch(e){failures.push(JSON.stringify(r)+': '+e.message);}}
  const saves=await page.evaluate(()=>{
    const original=LEVELS['01'].build;
    LEVELS['01'].build=()=>{const refs=original();addWalk(-12,-7,4,8,3,{mat:MAT.ground,surf:'stone'});return refs;};
    try{
      const rows=[];
      for(const mode of ['WAIT','FOLLOW']){
        startPlaying(null,'01');const a=G.ally;a.pos.set(-9.6,3,6.2);a.mode=mode;a.joined=true;a.hidden=false;G.player.hp=77;
        checkpoint();const stored=readStoredCheckpoint();if(!stored.cp)throw Error('checkpoint inválido');const cp=stored.cp;
        const noY=!Object.prototype.hasOwnProperty.call(cp.ally,'y');startPlaying(cp);
        const restored={y:G.ally.pos.y,mode:G.ally.mode,hp:G.player.hp,noY,wait:G.ally.waitPos.z};
        G.player.pos.set(-9.6,3,1.2);G.player.yaw=0;W.nav.nodes=[{x:-9.6,z:6.2}];G.ally.pos.set(30,0,30);G.ally.recover();
        rows.push({...restored,recoverY:G.ally.pos.y,recoverZ:G.ally.pos.z});
      }
      return rows;
    }finally{LEVELS['01'].build=original;}
  });
  for(const r of saves){try{assert.equal(r.y,3);assert.equal(r.hp,77);assert.equal(r.noY,true);assert.equal(r.recoverY,3);assert.equal(r.recoverZ,6.2);if(r.mode==='WAIT')assert.equal(r.wait,6.2);}catch(e){failures.push(JSON.stringify(r)+': '+e.message);}}
  failures.push(...errorsOf(logs));finish('CP-02B vertical e restauração',failures,'tiros verticais em jogador/aliado, cobertura e save/load/recuperação em piso elevado; fixtures, não percurso humano');
}).catch(e=>{console.error(e);process.exit(1);});
