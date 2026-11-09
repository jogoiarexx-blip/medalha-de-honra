'use strict';



/* =========================================================
   OPERAÇÕES SECRETAS — "Ferrolho à Solta!" (bônus arcade, fora da história)
   Sargento Ted Barlow, cães de capacete, desenterrados, autômatos e o robô Ferrolho
   ========================================================= */
(function(){ const up=Enemy.prototype.update; Enemy.prototype.update=function(dt){
  const d=this.def; if(!d||!d.melee) return up.call(this,dt);
  if(this.dead){ if(this.dogMesh){ this.dogMesh.rotation.z=Math.min(1.5,(this.deathT||0)*3); } return up.call(this,dt); }
  const P=G.player, dx=P.pos.x-this.pos.x, dz=P.pos.z-this.pos.z, dist=Math.hypot(dx,dz);
  if(!this.woke){ if(dist<(d.wake||22)||this.hp<this.maxHp||G.alarm){ this.woke=true; AudioSys.play(d.dog?'shout':'grunt',this.pos,1.1); if(d.zombie&&this.rise===undefined) this.rise=1; } else { this.moveDir(0,0,0,dt); this.animate(dt); if(this.dogMesh) syncDog25(this); return; } }
  if(this.rise>0){ this.rise-=dt; this.crouchTarget=.9*this.rise; this.moveDir(0,0,0,dt); this.animate(dt); return; }
  this.state='COMBAT'; this.awareness=1; this.biteT=(this.biteT||0)-dt;
  if(dist<(d.reach||1.4)&&!P.dead){ this.moveDir(0,0,0,dt); this.faceTowards(P.pos.x,P.pos.z,dt,12); if(this.biteT<=0){ this.biteT=d.biteCD||1.1; hurtPlayer((d.bite||12)*(G.diff==='recruta'?.7:G.diff==='veterano'?1.3:1),this.pos.clone()); AudioSys.play(d.dog?'grunt':'hurt',this.pos,1); if(d.zombie) AudioSys.play('grunt',this.pos,.8); } }
  else { this.repathT=(this.repathT||0)-dt; if(this.repathT<=0||!this.path){ this.repathT=.5+Math.random()*.3; if(segClear2D(this.pos.x,this.pos.z,P.pos.x,P.pos.z,.3,true)){ this.path=[{x:P.pos.x,z:P.pos.z}]; this.pathI=0; } else this.setPath(P.pos.x,P.pos.z); } this.followPath(d.speed||3,dt); }
  if(d.zombie&&Math.random()<dt*.25) AudioSys.play('grunt',this.pos,.5);
  this.aimTarget=0; this.animate(dt); if(this.dogMesh) syncDog25(this);
}; })();
function dogify25(e){ const r=e.h.root; r.scale.set(.85,.42,.85); r.traverse(o=>{ if(o.isMesh) o.visible=false; });
  const g=new T.Group(); scene.add(g); const fur=hm(0x6a4a2a), dark=hm(0x2a1a10); const body=new T.Mesh(BOX(.42,.4,1),fur); body.position.y=.55; g.add(body); const head=new T.Mesh(BOX(.32,.3,.38),fur); head.position.set(0,.78,.6); g.add(head); const snout=new T.Mesh(BOX(.18,.14,.22),dark); snout.position.set(0,.72,.86); g.add(snout);
  const helm=new T.Mesh(new T.SphereGeometry(.2,10,6,0,Math.PI*2,0,Math.PI/2),hm(0x4a5038)); helm.position.set(0,.9,.58); g.add(helm); for(const [x,z] of [[-.15,.38],[.15,.38],[-.15,-.38],[.15,-.38]]){ const l=new T.Mesh(BOX(.1,.36,.1),fur); l.position.set(x,.18,z); g.add(l); l.userData.leg=true; } const tail=new T.Mesh(BOX(.06,.06,.36),fur); tail.position.set(0,.66,-.62); tail.rotation.x=.6; g.add(tail);
  e.dogMesh=g; e.dogLegs=g.children.filter(c=>c.userData.leg); }
function syncDog25(e){ const g=e.dogMesh; g.position.set(e.pos.x,e.pos.y,e.pos.z); g.rotation.y=e.yaw; const s=e.speedNow||0; e.dogLegs.forEach((l,i)=>{ l.rotation.x=Math.sin(simTime*14+(i%2?Math.PI:0)+(i>1?Math.PI/2:0))*.6*Math.min(1,s/3); }); }
function zombify25(e){ const P=e.h.parts; const rot=hm(0x5a6a4a); if(e.h.headMesh){ e.h.headMesh.material=hm(0x8a9a7a); } else { if(P.head) P.head.material=hm(0x8a9a7a); for(const k of ['forearm_L','forearm_R']) if(P[k]) P[k].material=rot; } e.h.root.traverse(o=>{ if(o.isMesh&&o.material&&o.material.color&&!o.userData.keep){ } }); e.aimTarget=0; for(const w of (e.h.weaponMeshes||[])) w.visible=false; const eyes=new T.Mesh(BOX(.16,.03,.02),new T.MeshBasicMaterial({color:0xc8ff6a})); eyes.position.set(0,.05,.12); if(P.head) P.head.add(eyes); }
function botify25(e){ armorUp13(e); const P=e.h.parts; const eyes=new T.Mesh(BOX(.18,.04,.02),new T.MeshBasicMaterial({color:0xff2a1a})); eyes.position.set(0,.06,.15); if(P.head) P.head.add(eyes); }
function bonusTint25(fogC,bg){ scene.fog=new T.FogExp2(fogC,.022); scene.background=new T.Color(bg); scene.add(new T.AmbientLight(0x6a4a8a,.25)); }
function secretSetup25(){ const F=G.flags; if(F.setup25) return; F.setup25=true; for(const e of G.enemies){ const d=e.def; if(d.dog&&!e.dogMesh) dogify25(e); if(d.zombie&&!e.zmb){ e.zmb=true; zombify25(e); } if(d.bot&&!e.armored) botify25(e); } const t=$('#nadeTag'); }
function spawnWave25(list){ for(const d of list){ const e=spawnEnemy04(d,false); if(e){ if(d.dog) dogify25(e); if(d.zombie){ e.zmb=true; zombify25(e); } if(d.bot) botify25(e); } } }
const BARLOW_LOOK={};
/* ---------- S1 — Onde os Cães Ousam (castelo) ---------- */
const DOGS_S1=[[-14,-17],[8,-17],[-4,-12],[-29,-15],[-29,0],[-29,10],[-10,5],[6,10],[24,-8],[-6,26],[2,22],[24,-24]].map(([x,z],i)=>({id:'dg'+i,x,z,yaw:Math.random()*6,weapon:'pistol',melee:true,dog:true,speed:6,hp:55,bite:7,biteCD:.9,reach:1.3,wake:16}));
LEVELS['S1']={id:'S1',num:1,op:'Operação secreta 1',name:'Onde os Cães Ousam',place:'Castelo de Schwarzfels (versão de pesadelo)',prev:null,secret:true,
  loadout:{weapons:['smg','mg','pistol'],ammo:{smg:{mag:32,reserve:256},mg:{mag:75,reserve:450},pistol:{mag:8,reserve:40}},cur:'smg',camera:false},baseLight:.38,lightFn:()=>.45,shadows:false,bloomTh:.75,grenades:true,
  build:()=>{ const r=buildLevel13(); bonusTint25(0x1a1028,0x0c0814); return r; },enemies:DOGS_S1.concat([{id:'hd1',x:24,z:0,yaw:-Math.PI/2,weapon:'pistol',officer:true},{id:'hd2',x:-3,z:36,yaw:0,weapon:'smg',helmet:true}]),ally:null,start:{x:27.6,z:-29.3,yaw:Math.PI/2},startDocs:[],drawMap:null,
  reinf:[],radio:{x:0,z:0,fx:0,fz:0},radioRun:'',alarmPos:V3(0,1,0),alarmText:'',alarmObjective:null,alarmYes:'',alarmLate:'',alarmNo:'',alarmOk:()=>true,deathText:'Os cães de capacete venceram. (Não conte para ninguém.)',
  objectives:()=>[{id:'s1a',text:'Ache o relatório do “Projeto Totó” no arquivo (leste)',state:'active',marker:{x:26.5,z:2.5}},{id:'s1b',text:'Saia pelo portão sul',state:'hidden',marker:{x:-3,z:39}},{id:'s1c',text:'Opcional: derrube todos os cães (0/12)',state:'active',optional:true}],
  interact:R=>{ const I=W.interactables; I.push({id:'s1doc',pt:()=>V3(26.5,1,2.5),r:2.2,label:()=>G.flags.s1doc?null:'Ler o relatório',use:()=>{ G.flags.s1doc=true; openDoc('toto'); complete('s1a'); activate('s1b'); spawnWave25(DOGS_S1.slice(0,4).map((d,i)=>Object.assign({},d,{id:'dw'+i,x:-3+(i-1.5)*2,z:30}))); G.radioMsg('BARLOW','Mais cachorros no pátio! Quem deu capacete pra cachorro?!','warn'); }}); I.push({id:'s1exit',pt:()=>V3(-3,1.4,39.6),r:2.6,skip:true,label:()=>obj('s1b').state==='active'?'Sair pelo portão':null,use:()=>{ if(obj('s1b').state==='active'){ complete('s1b'); missionComplete(); } }}); },
  pickups:()=>{ addPickup('b_med1',-6,-17,'med',40,.85); addPickup('b_med2',-26,12,'med',40,.1); addPickup('b_nade',30,4,'nade',3,.1); addPickup('b_med3',-6,26,'med',40,.1); G.player.nades=4; },
  update:dt=>{ const F=G.flags; secretSetup25(); if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('BARLOW','Sargento Ted Barlow, rádio da Rede... ou de outro universo. Disseram que o castelo tem cachorros. Cachorros de CAPACETE.','tip'); } const n=G.enemies.filter(e=>e.def.dog&&e.dead).length; const o=obj('s1c'); if(o.state==='active'){ const t='Opcional: derrube todos os cães ('+Math.min(12,n)+'/12)'; if(o.text!==t){ o.text=t; refreshObjectiveUI(); } if(n>=12) complete('s1c'); } },
  restore:()=>{ G.flags.setup25=false; },resultTitle:'Onde os cães ousam',outro:['BARLOW','Relatório na mochila e um cachorro de capacete me seguindo, abanando o rabo. Este eu vou adotar.'],menuCam:{cx:0,cz:10,y:2,tx:-3,tz:-17},ambient:'forest',mist:null,
  briefing:{meta:'OPERAÇÃO SECRETA — NADA DISTO ACONTECEU',paras:['Em algum canto do arquivo da Rede existe uma pasta que ninguém assina. Nela, o Sargento Ted Barlow invade um castelo onde os guardas foram trocados por cães treinados — de capacete, e bravos.','Ache o relatório do “Projeto Totó” e saia vivo. Os cães são rápidos, mas não atiram.'],list:['Relatório do Projeto Totó','Portão sul','Bônus: todos os cães']}};
DOCS.toto={title:'Projeto Totó — relatório nº 7',sub:'carimbado MUITO SECRETO em três cores',body:`Resultado: os cães aceitam o capacete.
Os cães NÃO aceitam ordens em alemão.
Os cães aceitam salsicha.

Próxima fase: “soldados que não morrem”
(cripta de Montecalvo) e autômatos
(galeria de Graufels).`,pencil:'Alguém desenhou um osso na margem.'};
SECRET_ORDER.push('S1');
/* ---------- S2 — Podre até o Osso (cripta) ---------- */
const ZOMBIES_S2=[[20,17],[27,14],[20,-6],[29,6],[-8,15],[10,8],[-2,0],[10,-6],[-10,-13],[10,-13],[-23,20],[-23,8],[-24,-8],[-20,-24],[-27,-21],[26,-24]].map(([x,z],i)=>({id:'zb'+i,x,z,yaw:Math.random()*6,weapon:'pistol',melee:true,zombie:true,speed:1.9+Math.random()*.6,hp:140,bite:13,biteCD:1.3,reach:1.5,wake:14,look:{uniform:0x4a5040,pants:0x3a3a30,skin:0x8a9a7a,hair:0x2a2a20,helmet:true}}));
const RELICS_S2=[[24,-25.4],[-17.5,12],[-2,-14]];
LEVELS['S2']={id:'S2',num:2,op:'Operação secreta 2',name:'Podre até o Osso',place:'Cripta de Montecalvo (versão de pesadelo)',prev:'S1',secret:true,
  loadout:{weapons:['smg','mg','pistol'],ammo:{smg:{mag:32,reserve:256},mg:{mag:75,reserve:450},pistol:{mag:8,reserve:40}},cur:'mg',camera:false},baseLight:.3,lightFn:()=>.32,shadows:false,bloomTh:.7,grenades:true,
  build:()=>{ const r=buildLevel16(); bonusTint25(0x0a1a0e,0x040806); r.relics=RELICS_S2.map(([x,z])=>{ const m=addMesh(new T.CylinderGeometry(.16,.2,.42,10),new T.MeshBasicMaterial({color:0x9aff6a}),x,1,z,null); const l=new T.PointLight(0x9aff6a,1,5,1.6); l.position.set(x,1.4,z); scene.add(l); return {m,l,x,z}; }); return r; },
  enemies:ZOMBIES_S2,ally:null,start:{x:29,z:27,yaw:Math.PI/2},startDocs:[],drawMap:null,
  reinf:[],radio:{x:0,z:0,fx:0,fz:0},radioRun:'',alarmPos:V3(0,1,0),alarmText:'',alarmObjective:null,alarmYes:'',alarmLate:'',alarmNo:'',alarmOk:()=>true,deathText:'Os desenterrados pegaram Barlow. (Ele volta na próxima.)',
  objectives:()=>[{id:'s2a',text:'Recolha os três frascos verdes (0/3)',state:'active',marker:{x:24,z:-25.4}},{id:'s2b',text:'Fuja pelo poço (noroeste)',state:'hidden',marker:{x:-29,z:-29}}],
  interact:R=>{ const I=W.interactables, F=()=>G.flags; R.relics.forEach((r,i)=>I.push({id:'rel'+i,pt:()=>V3(r.x,1,r.z),r:2.2,label:()=>F()['rel'+i]?null:'Pegar o frasco brilhante',use:()=>{ F()['rel'+i]=true; r.m.visible=false; r.l.intensity=0; F().relN=(F().relN||0)+1; AudioSys.play('pickup'); const o=obj('s2a'); o.text='Recolha os três frascos verdes ('+F().relN+'/3)'; const nx=R.relics.find((k,j)=>!F()['rel'+j]); if(nx) o.marker={x:nx.x,z:nx.z}; refreshObjectiveUI(); spawnWave25([0,1].map(j=>Object.assign({},ZOMBIES_S2[0],{id:'zw'+i+j,x:r.x+(j?2:-2),z:r.z+1.5,wake:99}))); if(F().relN>=3){ complete('s2a'); activate('s2b'); G.radioMsg('BARLOW','Três frascos. Agora o poço — e sem olhar para trás.','warn'); } }})); I.push({id:'s2exit',pt:()=>V3(-29.6,1.2,-29),r:2.6,skip:true,label:()=>obj('s2b').state==='active'?'Subir pelo poço':null,use:()=>{ if(obj('s2b').state==='active'){ complete('s2b'); missionComplete(); } }});
    for(const k in W.doors) if(/^cell|intr/.test(k)){ const d=W.doors[k]; if(d.state==='LOCKED'){ d.state='CLOSED'; openDoor(d,null); } } },
  pickups:()=>{ addPickup('z_med1',22,22,'med',40,.1); addPickup('z_med2',-2,-14.5,'med',40,.1); addPickup('z_nade',27,-14,'nade',3,.1); addPickup('z_med3',-30,-10,'med',40,.1); G.player.nades=4; },
  update:dt=>{ const F=G.flags, R=G.refs; secretSetup25(); if(R.pows) for(const p of R.pows){ if(!p.hid){ p.hid=true; p.a.h.root.visible=false; } } if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('BARLOW','Os mortos da cripta... levantaram. Três frascos verdes brilhando. Pego e saio pelo poço.','tip'); } if(!F.nav25&&G.introT>.5){ F.nav25=true; buildNav(); } },
  restore:()=>{ G.flags.setup25=false; G.flags.nav25=false; },resultTitle:'Podre até o osso',outro:['BARLOW','Três frascos que brilham no escuro. Não vou beber nenhum.'],menuCam:{cx:23,cz:28,y:1.7,tx:23,tz:16},ambient:'crypt',mist:null,
  briefing:{meta:'OPERAÇÃO SECRETA — NADA DISTO ACONTECEU',paras:['A pasta sem assinatura continua: na cripta de Montecalvo, o “Projeto Lázaro” fez os mortos andarem. Lentos, duros de derrubar e famintos.','Recolha os três frascos verdes que alimentam a experiência e fuja pelo poço do claustro. Mire na cabeça.'],list:['Três frascos verdes','Fuga pelo poço']}};
SECRET_ORDER.push('S2');
/* ---------- S3 — Eu, Ferrolho (fábrica) ---------- */
const BOTS_S3=[[-40,-14],[-4,-12],[20,-16],[54,-14],[40,-4],[42.4,4],[-30,14],[6,16],[30,14],[-50,12],[-40,-2],[-14,3],[14,-3]].map(([x,z],i)=>({id:'bt'+i,x,z,yaw:Math.random()*6,weapon:i%3?'rifle':'smg',bot:true,hp:130,look:{uniform:0x5a5e66,pants:0x4a4e56,skin:0x7a7e86,hair:0x7a7e86,helmet:false,cap:null}}));
LEVELS['S3']={id:'S3',num:3,op:'Operação secreta 3',name:'Eu, Ferrolho',place:'Fábrica de Graufels (versão de pesadelo)',prev:'S2',secret:true,
  loadout:{weapons:['mg','smg','pzf'],ammo:{mg:{mag:75,reserve:600},smg:{mag:32,reserve:200},pzf:{mag:1,reserve:5}},cur:'mg',camera:false},baseLight:.42,lightFn:()=>.42,shadows:false,bloomTh:.7,grenades:true,
  build:()=>{ const r=buildLevel19(); bonusTint25(0x1a0e08,0x0a0604); r.cores=[[-40,0],[-14,0],[14,0]].map(([x,z],i)=>{ const m=addMesh(new T.CylinderGeometry(.5,.5,1.6,14),new T.MeshBasicMaterial({color:0xff4a2a}),x,5.7,z,'metal'); const L=new T.PointLight(0xff4a2a,1.4,9,1.6); L.position.set(x,5.7,z); scene.add(L); const C={m,L,x,z,hp:120,dead:false,i}; m.userData.zoneHit=()=>coreHit25(C,24); return C; }); return r; },
  enemies:BOTS_S3,ally:{id:'fer',x:-52,z:-11.6,yaw:-Math.PI/2,name:'FERROLHO',title:'Ferrolho',hp:420,range:50,dmg:44,look:{uniform:0x8a8e96,pants:0x6a6e76,skin:0x9a9ea6,hair:0x9a9ea6,cap:null,weapon:'rifle'},failTitle:'Ferrolho desmontou',failText:'O robô Ferrolho virou sucata.'},start:{x:-54,z:-11.6,yaw:-Math.PI/2},startDocs:[],drawMap:null,
  onExplode:(pos,o)=>{ const R=G.refs; if(R&&R.cores) for(const C of R.cores){ if(!C.dead&&Math.hypot(pos.x-C.x,pos.z-C.z)<(o.r||4)+2) coreHit25(C,o.kind==='rocket'?120:60); } },
  reinf:[],radio:{x:0,z:0,fx:0,fz:0},radioRun:'',alarmPos:V3(0,1,0),alarmText:'',alarmObjective:null,alarmYes:'',alarmLate:'',alarmNo:'',alarmOk:()=>true,deathText:'Os autômatos venceram desta vez.',
  objectives:()=>[{id:'s3a',text:'Destrua os três núcleos vermelhos das câmaras (0/3)',state:'active',marker:{x:-40,z:0}},{id:'s3b',text:'Saia pelo poço de ventilação com Ferrolho',state:'hidden',marker:{x:-55.5,z:15}},{id:'s3c',text:'Opcional: Ferrolho termina inteiro (mais da metade)',state:'active',optional:true}],
  interact:R=>{ const I=W.interactables; for(const id of R.grilles){ const d=W.doors[id]; d.state='CLOSED'; openDoor(d,null); } I.push({id:'s3exit',pt:()=>V3(-55.5,1.2,15),r:2.8,skip:true,label:()=>obj('s3b').state==='active'?'Subir pelo poço':null,use:()=>{ if(obj('s3b').state!=='active') return; const A=G.ally; if(A&&!A.dead){ if(A.hp>A.maxHp*.5) complete('s3c'); else failObjective('s3c'); } complete('s3b'); missionComplete(); }}); I.push({id:'ferRev',pt:()=>{ const A=G.ally; return V3(A.pos.x,A.pos.y+1.1,A.pos.z); },r:2.4,skip:true,label:()=>G.ally&&G.ally.downed?'Religar Ferrolho':null,hold:()=>1.6,use:()=>{ if(G.ally.downed) G.ally.revive(); }}); },
  pickups:()=>{ addPickup('r_med1',-28,-17.2,'med',40,.1); addPickup('r_pzf',-14,8,'pzf',2,.1); addPickup('r_nade',40,8,'nade',3,.1); addPickup('r_med2',30,17.2,'med',40,.1); addPickup('r_med3',-40,17.2,'med',40,.1); G.player.nades=4; },
  update:dt=>{ const F=G.flags, R=G.refs, A=G.ally; secretSetup25(); if(!F.allyInit&&A){ F.allyInit=true; A.joined=true; A.mode='FOLLOW'; A.hidden=false; const P=A.h.parts; const eyes=new T.Mesh(BOX(.18,.04,.02),new T.MeshBasicMaterial({color:0x6ad8ff})); eyes.position.set(0,.06,.15); if(P.head) P.head.add(eyes); }
    if(!F.i1&&G.introT>.8){ F.i1=true; G.radioMsg('FERROLHO','BIP. UNIDADE FERROLHO ATIVADA. AMIGO: BARLOW. INIMIGO: TODO O RESTO. BIP.','tip'); } if(!F.nav25&&G.introT>2.5){ F.nav25=true; buildNav(); }
    for(const C of R.cores){ if(C.dead) continue; C.m.rotation.y+=dt*2; C.L.intensity=1.2+Math.sin(simTime*6)*.4; } for(const w of (R.workers||[])) if(!w.hid){ w.hid=true; w.h.root.visible=false; } },
  restore:()=>{ G.flags.setup25=false; G.flags.nav25=false; G.flags.allyInit=false; const R=G.refs; for(const C of R.cores) if(G.flags['core'+C.i]){ C.dead=true; C.m.visible=false; C.L.intensity=0; } },resultTitle:'Eu, Ferrolho',outro:['FERROLHO','BIP. MISSÃO CUMPRIDA. FERROLHO GOSTA DE BARLOW. FERROLHO GOSTA DE CACHORRO DE CAPACETE. BIP.'],menuCam:{cx:-30,cz:-14,y:2,tx:0,tz:-14},ambient:'crypt',mist:null,
  briefing:{meta:'OPERAÇÃO SECRETA — NADA DISTO ACONTECEU',paras:['A última página da pasta: na fábrica de Graufels, os guardas viraram autômatos blindados de olhos vermelhos — e a Rede respondeu com um autômato seu, o Ferrolho.','Com Ferrolho ao lado, destrua os três núcleos vermelhos que alimentam os autômatos (tiro, granada ou bazuca) e saia pelo poço de ventilação.'],list:['Três núcleos vermelhos','Ferrolho inteiro (opcional)','Poço de ventilação']}};
function coreHit25(C,dmg){ if(C.dead) return; C.hp-=dmg; if(C.hp<=0){ C.dead=true; G.flags['core'+C.i]=true; C.m.visible=false; C.L.intensity=0; explode(V3(C.x,1.5,C.z),{r:5,dmgE:200,dmgP:40,src:'player',kind:'wreck'}); const F=G.flags; F.coreN=(F.coreN||0)+1; const o=obj('s3a'); o.text='Destrua os três núcleos vermelhos das câmaras ('+F.coreN+'/3)'; const nx=G.refs.cores.find(k=>!k.dead); if(nx) o.marker={x:nx.x,z:nx.z}; refreshObjectiveUI(); if(F.coreN>=3){ complete('s3a'); activate('s3b'); for(const e of G.enemies) if(e.def.bot&&!e.dead) e.takeDamage({dmg:999,region:'chest',dir:V3(0,1,0),point:e.pos.clone(),shooter:'player'}); G.radioMsg('FERROLHO','BIP. NÚCLEOS DESTRUÍDOS. AUTÔMATOS: DESLIGADOS. SAÍDA: POÇO.','tip'); } cp25(); } }
function cp25(){ checkpoint(); }
SECRET_ORDER.push('S3');

const CAMPAIGNS=[['01','Campanha 1 · Paris ocupada'],['05','Campanha 2 · Norte da África'],['09','Campanha 3 · Creta'],['12','Campanha 4 · Vestfália'],['15','Campanha 5 · Montecalvo'],['18','Campanha 6 · Graufels'],['21','Campanha 7 · Libertação']];
function renderOps(){
  const camp=store.get('sdp_campaign')||{}; const done=camp.done||{}; const box=$('#opsList'); box.innerHTML='';
  for(const id of LEVEL_ORDER){ const L=LEVELS[id], d=done[id];
    const cp=CAMPAIGNS.find(c=>c[0]===id); if(cp){ const h=document.createElement('div'); h.className='opcamp'; h.textContent=cp[1]; box.appendChild(h); }
    const b=document.createElement('button'); b.className='opcard'+(d?' done':''); b.id='op'+id;
    const parts=[['opn',String(L.num)],['opt',L.name],['opp',L.place],['opst',d?`Concluída · ${d.rating} · ${DIFF[d.diff].label}`:'Não concluída']];
    for(const [c,t] of parts){ const sp=document.createElement('span'); sp.className=c; sp.textContent=t; b.appendChild(sp); }
    b.onclick=()=>openBriefing(id); box.appendChild(b); }
}
function openBriefing(id){
  APP.briefLevel=id; const L=LEVELS[id], B=L.briefing;
  $('#bMeta').textContent=B.meta; const t=$('#bTitle'); t.textContent=''; t.append(L.op,document.createElement('br'),L.name);
  const body=$('#bBody'); body.innerHTML=''; for(const x of B.paras){ const p=document.createElement('p'); p.textContent=x; body.appendChild(p); }
  const ul=$('#bList'); ul.innerHTML=''; for(const x of B.list){ const li=document.createElement('li'); li.textContent=x; ul.appendChild(li); }
  let note='';
  if(L.loadout){ const c=(store.get('sdp_campaign')||{}).carry; note=(c&&c.from===L.prev)?'Equipamento trazido da '+LEVELS[L.prev].op+', completado pela rede: '+[...new Set([...c.weapons,...L.loadout.weapons])].map(w=>WEAPONS[w].name).join(' e ')+'. Saúde de entrada conforme a dificuldade.':'Equipamento padrão: '+L.loadout.weapons.map(w=>WEAPONS[w].name).join(' e ')+'.'; }
  $('#bCarry').textContent=note; $('#bCarry').hidden=!note;
  UI.show('briefing'); setDiff(settings.difficulty);
}
const CHEAT_DEFS=[
  ['god','Vida infinita','Élise não perde saúde.'],
  ['ammo','Munição e granadas infinitas','O pente nunca esvazia.'],
  ['ghost','Sombra','Ninguém vê você até você atacar.'],
  ['oneshot','Bala de prata','Qualquer tiro seu derruba na hora (até armadura).'],
  ['arsenal','Arsenal completo','Todas as armas em toda missão (vale ao iniciar).'],
  ['bighead','Cabeças grandes','Inimigos cabeçudos — e alvos maiores.'],
  ['slowmo','Câmera lenta','O tempo corre a 55%.'],
  ['film','Cinejornal de 1944','Imagem em preto e branco granulado.'],
  ['secret','Abrir as operações secretas','Libera as fases bônus em Extras.'],
];
let CHEATS={}; try{ CHEATS=JSON.parse(localStorage.getItem('sdp_cheats')||'{}')||{}; }catch(e){ CHEATS={}; }
function saveCheats(){ try{ localStorage.setItem('sdp_cheats',JSON.stringify(CHEATS)); }catch(e){} applyCheatsVisual(); }
function anyCheat(){ return CHEAT_DEFS.some(([k])=>k!=='secret'&&CHEATS[k]); }
function cheatsFound(){ try{ return localStorage.getItem('sdp_secret_found')==='1'; }catch(e){ return !!APP.secretFound; } }
function applyCheatsVisual(){ const c=document.getElementById('view'); if(c) c.style.filter=CHEATS.film?'grayscale(1) sepia(.3) contrast(1.15) brightness(1.05)':''; let t=document.getElementById('cheatTag'); if(!t){ t=document.createElement('div'); t.id='cheatTag'; t.className='cheattag'; document.body.appendChild(t); } t.textContent=anyCheat()?'CÓDIGOS ATIVOS':''; t.hidden=!anyCheat()||APP.state!=='PLAYING'; $('#bPCheats').hidden=!cheatsFound(); }
function cheatTick(){ if(!CHEATS.bighead) return; for(const e of G.enemies){ if(e._bh||!e.h||!e.h.parts.head) continue; e._bh=true; e.h.parts.head.scale.setScalar(1.9); } }
function secretUnlocked(){ const camp=store.get('sdp_campaign')||{}; const d=camp.done||{}; return !!CHEATS.secret||!!d['24']; }
function revealCheats(){ try{ localStorage.setItem('sdp_secret_found','1'); }catch(e){ APP.secretFound=true; } AudioSys.init(); AudioSys.play('objective'); renderCheats(); UI.show('cheats'); }
function renderCheats(){ const box=$('#cheatList'); box.innerHTML='';
  for(const [k,name,desc] of CHEAT_DEFS){ const l=document.createElement('label'); l.htmlFor='ch_'+k; l.textContent=name; const sm=document.createElement('small'); sm.textContent=desc; l.appendChild(sm); const i=document.createElement('input'); i.type='checkbox'; i.id='ch_'+k; i.checked=!!CHEATS[k]; i.onchange=()=>{ CHEATS[k]=i.checked; saveCheats(); }; box.append(l,i); } }
const SECRET_CODES={LAMPIAO:'cheats',LAMPIÃO:'cheats',PANZERKNACKER:'secret',FERROLHO:'secret',MANON:'film'};
function tryCode(raw){ const c=String(raw||'').trim().toUpperCase().replace(/\s+/g,''); const v=SECRET_CODES[c];
  if(v==='cheats'){ revealCheats(); return 'O arquivo secreto se abre.'; }
  if(v==='secret'){ CHEATS.secret=true; saveCheats(); renderExtras(); return 'Operações secretas liberadas.'; }
  if(v==='film'){ CHEATS.film=!CHEATS.film; saveCheats(); return CHEATS.film?'Cinejornal ligado.':'Cinejornal desligado.'; }
  return c?'Nada acontece.':''; }
function renderExtras(){ const camp=store.get('sdp_campaign')||{}; const d=camp.done||{};
  const ids=LEVEL_ORDER.filter(id=>!LEVELS[id].secret), nd=ids.filter(id=>d[id]).length, ex=ids.filter(id=>d[id]&&d[id].rating==='EXCELENTE').length;
  let best=0; for(const id of ids) if(d[id]) best+=d[id].time||0;
  $('#xStats').innerHTML=`<div><b>${nd}/${ids.length}</b><span>Operações concluídas</span></div><div><b>${ex}</b><span>Classificação excelente</span></div><div><b>${Math.floor(best/60)} min</b><span>Tempo somado</span></div><div><b>${(SECRET_ORDER||[]).filter(id=>d[id]).length}/${(SECRET_ORDER||[]).length}</b><span>Secretas</span></div>`;
  const box=$('#xSecret'); box.innerHTML=''; const open=secretUnlocked();
  for(const id of (SECRET_ORDER||[])){ const L=LEVELS[id]; const b=document.createElement('button'); b.className='opcard secret'+(open?'':' locked')+(d[id]?' done':'');
    const parts=[['opn','S'+L.num],['opt',open?L.name:'???'],['opp',open?L.place:'Conclua a Operação 24 — ou ache o código'],['opst',d[id]?'Concluída · '+d[id].rating:(open?'Não concluída':'Trancada')]];
    for(const [c,t] of parts){ const sp=document.createElement('span'); sp.className=c; sp.textContent=t; b.appendChild(sp); }
    b.onclick=()=>{ if(open) openBriefing(id); else $('#xMsg').textContent='Trancada. Termine a campanha… ou procure o código.'; }; box.appendChild(b); }
  $('#bCheatsOpen').hidden=!cheatsFound(); }
(function(){ const seq=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA']; let i=0, typed='';
  addEventListener('keydown',e=>{ if(APP.state==='PLAYING') return; if(e.target&&e.target.tagName==='INPUT') return;
    if(e.code===seq[i]){ i++; if(i===seq.length){ i=0; revealCheats(); } } else i=(e.code===seq[0])?1:0;
    if(/^Key[A-Z]$/.test(e.code)){ typed=(typed+e.code.slice(3)).slice(-12); if(typed.endsWith('LAMPIAO')){ typed=''; revealCheats(); } } });
  let taps=[]; addEventListener('pointerdown',e=>{ const t=e.target.closest&&e.target.closest('#menu .title'); if(!t) return; const now=performance.now(); taps=taps.filter(x=>now-x<2200); taps.push(now); if(taps.length>=7){ taps=[]; revealCheats(); } });
})();
function showCredits(){ const r=$('#cRoll'); const camp=store.get('sdp_campaign')||{}; const d=camp.done||{}; const n=LEVEL_ORDER.filter(id=>d[id]).length, ex=LEVEL_ORDER.filter(id=>d[id]&&d[id].rating==='EXCELENTE').length;
  const sec=[['Medalha de Honra',''],['Uma história da Rede Lampião','h4'],['Élise','h4'],['Agente da Rede, de Paris a Paris',''],['Ao lado dela','h4'],['Lucien · Yasmina · Manolis · Capitão Hale · Pavel · Bruna',''],['Campanhas','h4'],['Paris ocupada · Norte da África · Creta · Vestfália · Montecalvo · Graufels · Libertação',''],['Seu registro','h4'],[n+' de '+LEVEL_ORDER.length+' operações concluídas · '+ex+' excelentes',''],
    ['Inspirado nos princípios de design do GDD v2.0','h4'],['Personagens, mapas, textos e sons originais.',''],['Feito com','h4'],['Three.js · Web Audio · muita paciência com as setas do teclado',''],['Operações secretas','h4'],['Agora abertas em Extras. Leve fé: nada ali é história.',''],['',''],['Paris, 25 de agosto de 1944.','h4'],['Fim.','']];
  r.innerHTML=''; const h=document.createElement('h3'); h.textContent='Medalha de Honra'; r.appendChild(h); for(const [t,k] of sec.slice(1)){ const e=document.createElement(k||'p'); e.textContent=t; r.appendChild(e); } r.style.animation='none'; void r.offsetWidth; r.style.animation=''; UI.show('credits'); }
function startPlaying(save,levelId){
  AudioSys.init();
  const diff=save?save.diff:settings.difficulty, id=save?(save.mission||'01'):(levelId||APP.briefLevel||'01');
  newMission(id,diff,save||null);
  AudioSys.ambient(G.level.ambient); AudioSys.setRoom(G.level.ambient==='crypt'||['02','13','16','19','S1'].includes(G.level.id)?(G.level.id==='02'?'crypt':'indoor'):['05'].includes(G.level.id)?'indoor':['06','07','08','12','14','18','20','24'].includes(G.level.id)?'open':'street');
  APP.state='PLAYING'; UI.closeAll(); $('#hud').hidden=false; $('#hud').className='hud preset-'+settings.hud; $('#touch').hidden=!APP.touch;
  for(const k in keys) keys[k]=false; input.fire=false; input.firePressed=false; input.ads=false; input.adsToggled=false; acc=0;
  applyCheatsVisual();
  { const t=$('#nadeTag'); if(t&&t.firstChild) t.firstChild.nodeValue=(G.level.nadeKind==='molotov'?'Coquetéis ':'Granadas '); }
  if(!APP.noLock) requestLock();
  canvas.focus({preventScroll:true});
}
function syncOptions(){
  $('#oSens').value=settings.sens; $('#oFov').value=settings.fov; $('#oInvert').checked=settings.invertY; $('#oHud').value=settings.hud; $('#oHit').checked=settings.hitmarkers;
  $('#oAds').checked=settings.adsToggle; $('#oCrouch').checked=settings.crouchToggle; $('#oBob').checked=settings.bob; $('#oShake').checked=settings.shake; $('#oHelmet').checked=settings.helmetSave; $('#oBlood').value=settings.blood; $('#oChars').value=settings.chars||'detalhado'; $('#oBodies').value=settings.bodies||'somem'; $('#oQuality').value=settings.quality; $('#oVol').value=settings.volume; $('#oMus').value=settings.music;
}
function bindOptions(){
  const on=(id,ev,fn)=>$(id).addEventListener(ev,fn);
  on('#oSens','input',e=>{settings.sens=+e.target.value;saveSettings();}); on('#oFov','input',e=>{settings.fov=+e.target.value;saveSettings();});
  on('#oInvert','change',e=>{settings.invertY=e.target.checked;saveSettings();}); on('#oHud','change',e=>{settings.hud=e.target.value;$('#hud').className='hud preset-'+settings.hud;saveSettings();});
  on('#oHit','change',e=>{settings.hitmarkers=e.target.checked;saveSettings();}); on('#oAds','change',e=>{settings.adsToggle=e.target.checked;input.ads=false;input.adsToggled=false;saveSettings();});
  on('#oCrouch','change',e=>{settings.crouchToggle=e.target.checked;saveSettings();}); on('#oBob','change',e=>{settings.bob=e.target.checked;saveSettings();});
  on('#oShake','change',e=>{settings.shake=e.target.checked;saveSettings();}); on('#oHelmet','change',e=>{settings.helmetSave=e.target.checked;saveSettings();}); on('#oBlood','change',e=>{settings.blood=e.target.value;saveSettings();}); on('#oBodies','change',e=>{settings.bodies=e.target.value;saveSettings();});
  on('#oQuality','change',e=>{settings.quality=e.target.value;resize();saveSettings();});
  on('#oChars','change',e=>{settings.chars=e.target.value;saveSettings(); if(MENU3D.built){ MENU3D.built=false; MENU3D.scene=null; MENU3D.t=0; } });
  on('#oVol','input',e=>{settings.volume=+e.target.value;AudioSys.applyVolume();saveSettings();}); on('#oMus','input',e=>{settings.music=+e.target.value;AudioSys.applyVolume();saveSettings();});
}
function setDiff(d){ settings.difficulty=d; saveSettings(); document.querySelectorAll('#diffSeg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.d===d))); $('#diffNote').textContent=DIFF[d].note; }
function bindScreens(){
  $('#bNew').onclick=()=>{ AudioSys.init(); renderOps(); UI.show('ops'); };
  $('#bOpsBack').onclick=()=>goMenu();
  $('#bExtras').onclick=()=>{ AudioSys.init(); renderExtras(); $('#xMsg').textContent=''; $('#xCode').value=''; UI.show('extras'); };
  $('#bExtrasBack').onclick=()=>goMenu(); $('#bCheatsOpen').onclick=()=>{ renderCheats(); UI.show('cheats'); };
  $('#xCodeForm').onsubmit=e=>{ e.preventDefault(); const m=tryCode($('#xCode').value); if(UI.isOpen('extras')) $('#xMsg').textContent=m; $('#xCode').value=''; };
  $('#bCheatsBack').onclick=()=>{ if(APP.state==='PLAYING'||APP.state==='PAUSED'){ UI.back(); applyCheatsVisual(); } else { renderExtras(); UI.show('extras'); } };
  $('#bCheatsOff').onclick=()=>{ for(const [k] of CHEAT_DEFS) if(k!=='secret') CHEATS[k]=false; saveCheats(); renderCheats(); };
  $('#bPCheats').onclick=()=>{ renderCheats(); UI.show('cheats'); };
  $('#bNext').onclick=()=>{ if(APP.showCredits){ showCredits(); return; } if(APP.nextLevel){ UI.closeAll(); openBriefing(APP.nextLevel); } };
  $('#bCredBack').onclick=()=>goMenu();
  $('#bContinue').onclick=()=>{ const cp=store.get('sdp_checkpoint'); if(cp) startPlaying(cp); };
  $('#bHelp').onclick=()=>UI.show('help'); $('#bOptions').onclick=()=>{ syncOptions(); UI.show('options'); };
  $('#bHelpBack').onclick=()=>UI.back(); $('#bOptBack').onclick=()=>UI.back();
  $('#bBriefBack').onclick=()=>goMenu();
  document.querySelectorAll('#diffSeg button').forEach(b=>b.onclick=()=>setDiff(b.dataset.d));
  $('#bStart').onclick=()=>{ store.del('sdp_checkpoint'); startPlaying(null,APP.briefLevel); };
  $('#bResume').onclick=resumeGame;
  $('#bPOptions').onclick=()=>{ syncOptions(); UI.show('options'); }; $('#bPHelp').onclick=()=>UI.show('help');
  $('#bCheckpoint').onclick=()=>{ if(G&&G.cp) startPlaying(G.cp); };
  $('#bRestart').onclick=()=>{ const b=$('#bRestart'); if(!b.dataset.c){ b.dataset.c='1'; b.textContent='Confirmar: recomeçar do início?'; clearTimeout(b._t); b._t=setTimeout(()=>{ b.dataset.c=''; b.textContent='Reiniciar a fase'; },4000); return; } b.dataset.c=''; b.textContent='Reiniciar a fase'; restartLevel(); };
  $('#bQuit').onclick=()=>{ G=null; goMenu(); };
  $('#bAgain').onclick=()=>{ UI.closeAll(); openBriefing(G.levelId); };
  $('#bResMenu').onclick=()=>{ G=null; goMenu(); };
  $('#bRetryCp').onclick=()=>{ const cp=G&&G.cp; if(cp) startPlaying(cp); };
  $('#bRetryAll').onclick=()=>restartLevel();
  $('#bFailMenu').onclick=()=>{ G=null; goMenu(); };
}