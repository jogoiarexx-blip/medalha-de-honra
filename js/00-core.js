
'use strict';
const T = window.THREE;
const $ = s => document.querySelector(s);
if(!T){ $('#boot').textContent='Não foi possível carregar o motor 3D. Verifique a conexão e recarregue.'; throw new Error('Three.js não carregado'); }

/* =========================================================
   UTILITÁRIOS
   ========================================================= */
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, rnd=(a,b)=>a+Math.random()*(b-a), DEG=Math.PI/180;
const V3=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const UP=V3(0,1,0);
function angDiff(a,b){let d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const pick=(arr,r=Math.random)=>arr[Math.floor(r()*arr.length)];
const store={get(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}},del(k){try{localStorage.removeItem(k);}catch(e){}}};
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

/* =========================================================
   CONFIGURAÇÃO E DADOS
   ========================================================= */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEFAULT_SETTINGS={sens:1,fov:75,invertY:false,hud:'dynamic',hitmarkers:true,adsToggle:false,crouchToggle:true,bob:!REDUCED,shake:!REDUCED,helmetSave:false,blood:'discreto',bodies:'somem',chars:'modelo',quality:'medio',volume:.8,music:.5,difficulty:'soldado'};
let settings=Object.assign({},DEFAULT_SETTINGS,store.get('sdp_settings')||{}); if(settings.charsV!==3){ settings.chars='modelo'; settings.charsV=3; }
const saveSettings=()=>store.set('sdp_settings',settings);

const CFG={
  step:1/60,
  player:{radius:.34,eye:1.61,eyeCrouch:1.05,walk:2.7,sprint:4.7,crouch:1.5,jump:3.4,hp:100},
  helmet:{durability:24,detachThreshold:20,transferRatio:.45,life:25,minSpeed:2,maxSpeed:4.5},
  flinchCooldown:.18,
};
const QUALITY={
  baixo:{pr:()=>Math.min(devicePixelRatio||1,1)*.6,particles:.4,helmets:5,decals:30},
  medio:{pr:()=>Math.min(devicePixelRatio||1,1.25)*.85,particles:.75,helmets:8,decals:55},
  alto:{pr:()=>Math.min(devicePixelRatio||1,2),particles:1,helmets:12,decals:80},
};
const DIFF={
  recruta:{label:'Recruta',react:.95,spread:1.6,dmg:.6,perception:.8,pickups:1.4,note:'Inimigos lentos para reagir e menos precisos; mais munição. Checkpoints restauram a saúde.'},
  soldado:{label:'Soldado',react:.62,spread:1,dmg:1,perception:1,pickups:1,note:'Equilíbrio padrão. Checkpoints garantem ao menos 50 de saúde.'},
  veterano:{label:'Veterano',react:.42,spread:.78,dmg:1.3,perception:1.15,pickups:.75,note:'Reação rápida, mira firme e pouca munição. A saúde não é reposta.'},
};
const D=()=>DIFF[G?G.diff:settings.difficulty];

// Armas do jogador — parâmetros iniciais de balanceamento (não são dados históricos)
const WEAPONS={
  pistol:{id:'pistol',name:'P38',cat:'Pistola',mode:'SEMI',auto:false,rpm:350,dmg:34,mag:8,reserveMax:64,reload:{out:.28,in:1.0,end:1.42},spreadHip:1.6,spreadADS:.35,bloom:.55,recoil:1.25,recoilX:.25,adsTime:.16,noise:32,falloff:[20,45,.7],fovADS:58,ammoName:'munição 9 mm'},
  silenced:{id:'silenced',name:'Welrod Mk II',cat:'Pistola silenciada',mode:'MANUAL',auto:false,silent:true,rpm:75,dmg:32,mag:6,reserveMax:36,reload:{out:.4,in:1.4,end:1.9},spreadHip:1.4,spreadADS:.28,bloom:.4,recoil:.7,recoilX:.12,adsTime:.18,noise:2.5,falloff:[15,35,.7],fovADS:56,ammoName:'munição .32'},
  smg:{id:'smg',name:'Sten Mk II',cat:'Submetralhadora',mode:'AUTO',auto:true,rpm:540,dmg:21,mag:32,reserveMax:192,reload:{out:.34,in:1.5,end:2.05},spreadHip:2.5,spreadADS:.55,bloom:.3,recoil:.72,recoilX:.42,adsTime:.2,noise:38,falloff:[15,40,.6],fovADS:52,ammoName:'carregadores Sten'},
};
// Multiplicadores por região — pontos de partida de game design
const REGIONS={
  head:{m:3.0,n:'cabeça'},neck:{m:2.0,n:'pescoço'},chest:{m:1.0,n:'peito'},abdomen:{m:1.1,n:'abdômen'},pelvis:{m:1.15,n:'quadril'},
  upperArm_L:{m:.65,n:'braço esq.'},upperArm_R:{m:.65,n:'braço dir.'},forearm_L:{m:.55,n:'antebraço esq.'},forearm_R:{m:.55,n:'antebraço dir.'},
  hand_L:{m:.35,n:'mão esq.'},hand_R:{m:.35,n:'mão da arma'},thigh_L:{m:.8,n:'coxa esq.'},thigh_R:{m:.8,n:'coxa dir.'},
  shin_L:{m:.65,n:'canela esq.'},shin_R:{m:.65,n:'canela dir.'},foot_L:{m:.4,n:'pé esq.'},foot_R:{m:.4,n:'pé dir.'},
};
// Armas inimigas
const EW={
  rifle:{dmg:15,interval:1.15,burst:[1,1],mag:5,reload:2.6,spread:1.0,noise:40,len:.95,drop:{type:'pistol',n:6}},
  smg:{dmg:7.5,interval:.11,burst:[3,6],pause:[.75,1.35],mag:32,reload:2.8,spread:2.7,noise:38,len:.62,drop:{type:'smg',n:16}},
  pistol:{dmg:10,interval:.55,burst:[1,1],mag:8,reload:2.0,spread:2.1,noise:32,len:.3,drop:{type:'pistol',n:8}},
};