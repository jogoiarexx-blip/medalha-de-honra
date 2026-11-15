'use strict';
// CP-02A: Three.js, Enemy/Ally e malhas reais em posições controladas.
// Não representa trajeto de missão, avaliação visual humana ou FPS real.
const assert=require('node:assert/strict');
const {withGame,errorsOf,finish}=require('./lib/harness.cjs');
withGame(async({page,logs})=>{
  const failures=[];
  for(const style of ['modelo','detalhado','classico']){
    const r=await page.evaluate(style=>{
      settings.chars=style;settings.quality='baixo';settings.autoRes=false;APP.noLock=true;
      const reset=()=>{startPlaying(null,'01');G.diff='soldado';CHEATS.god=true;const e=G.enemies[0];G.enemies=[e];G.player.pos.set(100,0,100);e.pos.set(0,0,-6);e.yaw=0;e.animate(0);scene.updateMatrixWorld(true);matricesFresh=false;return e;};
      const shoot=(origin,dir,dmg=20)=>{matricesFresh=false;return resolveShot({shooter:'player',origin,dir,weapon:{dmg,falloff:[20,45,.7]},shotId:++G.shotId});};
      let e=reset();
      // Duplicated references emulate overlapping anatomy/proxy intersections.
      W.shootables=[e.h.parts.chest,e.h.parts.chest];const center=e.h.parts.chest.getWorldPosition(V3());const origin=center.clone().add(V3(0,0,4));
      shoot(origin,V3(0,0,-1));const body={hp:e.hp,hits:G.stats.hits};
      const wall=new T.Mesh(new T.BoxGeometry(2,3,.3),new T.MeshBasicMaterial());wall.position.copy(center).add(V3(0,0,2));wall.userData={mat:'stone'};scene.add(wall);W.shootables.push(wall);
      shoot(origin,V3(0,0,-1));const blocked=e.hp===body.hp;scene.remove(wall);
      // An armor hit uses real Enemy.takeDamage and UI, with a controlled plate.
      e=reset();const plate=new T.Mesh(new T.BoxGeometry(1,1,.2),new T.MeshBasicMaterial());plate.position.set(0,1,-3);plate.userData={char:e,region:'head',armor:true};scene.add(plate);W.shootables=[plate];
      shoot(V3(0,1,0),V3(0,0,-1));const armor={hp:e.hp,marker:$('#hitmarker').className,heads:G.stats.heads};scene.remove(plate);
      // Real helmet geometry; weak round transfers enough damage to a weakened enemy.
      e=reset();settings.helmetSave=true;e.hp=.1;const shell=e.h.helmetMeshes[0];W.shootables=[shell];const hc=shell.getWorldPosition(V3());
      shoot(hc.clone().add(V3(0,0,3)),V3(0,0,-1),5);
      const helmet={dead:e.dead,marker:$('#hitmarker').className,hits:G.stats.hits,heads:G.stats.heads};
      // Surrender preserves health and removes the real weapon from shootables.
      e=reset();W.shootables=[...e.h.hitMeshes];const hp=e.hp;yieldEnemy(e,true);
      const surrender={health:e.hp===hp,unarmed:!e.hasWeapon,state:e.state,surrender:e.surrender,weaponHits:W.shootables.some(m=>e.h.weaponMeshes.includes(m))};
      // Enemy ray/cylinder tests against the real ally at elevated and ground levels.
      const levels=[];
      for(const groundShot of [true,false]){
        e=reset();G.player.pos.set(100,0,100);W.solids=[];W.glass=[];
        e.ew={...e.ew,spread:0,dmg:10,noise:0};e.reactionT=-2;e.aimPenalty=0;e.suppression=0;e.tgtKind='ally';e.pos.set(0,groundShot?0:5,0);e.animate(0);matricesFresh=false;
        const m=e.muzzleWorld(),a=G.ally;a.pos.set(m.x,5,m.z-5);a.crouch=0;a.hidden=false;const health=a.hp,info=a.targetInfo();
        e.fireAt({x:a.pos.x,z:a.pos.z,chest:groundShot?1.2:info.chest,head:groundShot?1.7:info.head});
        levels.push({groundShot,damage:health-a.hp,head:info.head,chest:info.chest});
      }
      return {body,blocked,armor,helmet,surrender,levels};
    },style);
    try{
      assert.equal(r.body.hp,80);assert.equal(r.body.hits,1);assert.equal(r.blocked,true);
      assert.equal(r.armor.hp,96.8);assert.match(r.armor.marker,/equip/);assert.doesNotMatch(r.armor.marker,/body/);assert.equal(r.armor.heads,0);
      assert.equal(r.helmet.dead,true);assert.match(r.helmet.marker,/kill equip/);assert.equal(r.helmet.hits,1);assert.equal(r.helmet.heads,0);
      assert.equal(r.surrender.health,true);assert.equal(r.surrender.unarmed,true);assert.equal(r.surrender.state,'DISARMED');assert.equal(r.surrender.surrender,true);assert.equal(r.surrender.weaponHits,false);
      assert.equal(r.levels[0].damage,0);assert.equal(r.levels[1].damage,8);assert.equal(r.levels[1].head,6.65);assert.equal(r.levels[1].chest,6.25);
      console.log('PASSOU cenário CP02: '+style+' — cobertura, dano único, armadura, capacete, rendição e alturas');
    }catch(err){failures.push(style+': '+err.message+' '+JSON.stringify(r));}
  }
  failures.push(...errorsOf(logs));finish('CP-02A combate e alturas',failures,'3 estilos com atores/raycast reais em fixture; percurso humano e Android físico não cobertos');
}).catch(e=>{console.error(e);process.exit(1);});
