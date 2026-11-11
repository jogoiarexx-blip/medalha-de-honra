'use strict';

/* =========================================================
   GUARDA DE SAVES (REV-A · P0-01)
   Nada que venha do localStorage entra no jogo sem passar por
   aqui. validateCheckpoint() nunca lança exceção: devolve
   {ok,value,reason,repaired}. Campos opcionais ausentes (saves
   v1/v2) são migrados para o formato v3; campos essenciais
   inválidos reprovam o save inteiro, com motivo legível.
   ========================================================= */
const SAVE_VERSION=3;
const CP_KEY='sdp_checkpoint', CP_BAK_KEY='sdp_checkpoint_bak';
const SAVE_LIMITS={enemies:400,list:4000,flags:600,ammo:999,time:360000,coord:5000};
const OBJ_STATES=new Set(['hidden','active','done','failed']);
const DOOR_STATES=new Set(['OPEN','CLOSED','CLOSING','OPENING','LOCKED','GONE']);
const ALLY_MODES=new Set(['FOLLOW','WAIT']);
const HELMET_STATES=new Set(['ATTACHED','DETACHED','NONE']);

function validateCheckpoint(raw){
  const repaired=[];
  const bad=reason=>({ok:false,value:null,reason,repaired});
  const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
  const fin=v=>typeof v==='number'&&isFinite(v);
  const coord=v=>fin(v)&&Math.abs(v)<=SAVE_LIMITS.coord;
  const num=(v,d,lo,hi,label)=>{ if(!fin(v)){ if(label) repaired.push(label); return d; } if(v<lo||v>hi){ if(label) repaired.push(label+' fora da faixa'); return v<lo?lo:hi; } return v; };
  const strList=(a,label)=>{ if(a===undefined||a===null) return []; if(!Array.isArray(a)){ repaired.push(label); return []; } const out=a.filter(x=>typeof x==='string'&&x.length<120).slice(0,SAVE_LIMITS.list); if(out.length!==a.length) repaired.push(label); return out; };
  try{
    if(raw===null||raw===undefined) return bad('vazio');
    if(!isObj(raw)) return bad('formato desconhecido');
    const v=raw.v===undefined?1:raw.v;
    if(!fin(v)||v<1) return bad('versão ilegível');
    if(v>SAVE_VERSION) return bad('gravado por uma versão mais nova do jogo (v'+v+')');
    if(v<SAVE_VERSION) repaired.push('migrado de v'+v+' para v'+SAVE_VERSION);
    const mission=raw.mission===undefined?'01':raw.mission;
    if(typeof mission!=='string'||!Object.prototype.hasOwnProperty.call(LEVELS,mission)) return bad('missão desconhecida');
    const L=LEVELS[mission];
    let diff=raw.diff;
    if(typeof diff!=='string'||!Object.prototype.hasOwnProperty.call(DIFF,diff)){ diff=Object.prototype.hasOwnProperty.call(DIFF,settings.difficulty)?settings.difficulty:'soldado'; repaired.push('dificuldade desconhecida → '+DIFF[diff].label); }
    // jogador: posição é essencial; o resto tem conserto
    const p=raw.player;
    if(!isObj(p)) return bad('dados do jogador ausentes');
    if(!coord(p.x)||!coord(p.z)) return bad('posição do jogador inválida');
    let weapons=Array.isArray(p.weapons)?[...new Set(p.weapons.filter(w=>typeof w==='string'&&Object.prototype.hasOwnProperty.call(WEAPONS,w)))]:[];
    if(!Array.isArray(p.weapons)||weapons.length!==p.weapons.length) repaired.push('lista de armas');
    const ammo={}, srcAmmo=isObj(p.ammo)?p.ammo:{};
    if(!isObj(p.ammo)) repaired.push('munição');
    for(const w in srcAmmo){ if(!Object.prototype.hasOwnProperty.call(WEAPONS,w)||!isObj(srcAmmo[w])) continue; ammo[w]={mag:Math.round(num(srcAmmo[w].mag,0,0,SAVE_LIMITS.ammo,'munição de '+WEAPONS[w].name)),reserve:Math.round(num(srcAmmo[w].reserve,0,0,SAVE_LIMITS.ammo,'reserva de '+WEAPONS[w].name))}; }
    if(!weapons.length){ const lo=L.loadout; weapons=lo?[...lo.weapons]:['pistol']; for(const w of weapons) if(!ammo[w]) ammo[w]=lo&&lo.ammo[w]?{mag:lo.ammo[w].mag,reserve:lo.ammo[w].reserve}:{mag:WEAPONS[w].mag,reserve:0}; repaired.push('equipamento padrão da operação'); }
    for(const w of weapons) if(!ammo[w]){ ammo[w]={mag:0,reserve:0}; repaired.push('munição de '+WEAPONS[w].name); }
    const cur=weapons.includes(p.cur)?p.cur:weapons[0];
    const player={x:p.x,z:p.z,yaw:num(p.yaw,L.start?L.start.yaw||0:0,-1e4,1e4,'direção do jogador'),hp:num(p.hp,100,1,100,'saúde'),cur,weapons,ammo,key:!!p.key,nades:Math.round(num(p.nades,0,0,99))};
    // objetivos, portas, listas
    const obj={}; if(isObj(raw.obj)){ for(const k in raw.obj) if(OBJ_STATES.has(raw.obj[k])) obj[k]=raw.obj[k]; else repaired.push('objetivo '+k); } else repaired.push('objetivos');
    const flags={}; if(isObj(raw.flags)){ let n=0; for(const k in raw.flags){ if(++n>SAVE_LIMITS.flags) break; const fv=raw.flags[k]; if(fv===null||['boolean','number','string'].includes(typeof fv)||Array.isArray(fv)||isObj(fv)) flags[k]=fv; } } else if(raw.flags!==undefined) repaired.push('marcadores da missão');
    const doors={}; if(isObj(raw.doors)){ for(const k in raw.doors) if(DOOR_STATES.has(raw.doors[k])) doors[k]=raw.doors[k]==='OPENING'?'OPEN':raw.doors[k]; else repaired.push('porta '+k); } else if(raw.doors!==undefined) repaired.push('portas');
    const lamps=strList(raw.lamps,'lâmpadas'), taken=strList(raw.taken,'itens coletados'), discovered=strList(raw.discovered,'descobertas');
    const docs=strList(raw.docs,'documentos').filter(id=>Object.prototype.hasOwnProperty.call(DOCS,id));
    const stats={}; if(isObj(raw.stats)){ for(const k in raw.stats) if(fin(raw.stats[k])) stats[k]=Math.max(0,raw.stats[k]); }
    let ally=null;
    if(raw.ally!==null&&raw.ally!==undefined){ const a=raw.ally; if(isObj(a)&&coord(a.x)&&coord(a.z)&&ALLY_MODES.has(a.mode)) ally={x:a.x,z:a.z,mode:a.mode,hp:num(a.hp,100,1,1000),joined:!!a.joined,hidden:!!a.hidden}; else repaired.push('aliado (volta à posição inicial)'); }
    const enemies=[]; const known=new Set((L.enemies||[]).map(d=>d.id));
    if(Array.isArray(raw.enemies)){
      let dropped=0;
      for(const e of raw.enemies.slice(0,SAVE_LIMITS.enemies)){
        if(!isObj(e)||typeof e.id!=='string'||!coord(e.x)||!coord(e.z)){ dropped++; continue; }
        let def=null;
        if(!known.has(e.id)){ // reforço: precisa trazer a própria definição
          const d=e.def; if(!isObj(d)||d.id!==e.id||!Object.prototype.hasOwnProperty.call(EW,d.weapon)||!coord(d.x)||!coord(d.z)){ dropped++; continue; } def=d; }
        else def=isObj(e.def)?e.def:null;
        const w=isObj(e.wounds)?e.wounds:null;
        enemies.push({id:e.id,def,dead:!!e.dead,hp:num(e.hp,100,-1e4,1e4),x:e.x,z:e.z,yaw:num(e.yaw,0,-1e4,1e4),helmet:HELMET_STATES.has(e.helmet)?e.helmet:'ATTACHED',helmetDur:num(e.helmetDur,CFG.helmet.durability,0,1e4),cap:e.cap===undefined?true:!!e.cap,weapon:e.weapon===undefined?true:!!e.weapon,alert:num(e.alert,0,0,10),lanternBroken:!!e.lanternBroken,ko:!!e.ko,asleep:!!e.asleep,wounds:w,wf:isObj(e.wf)?e.wf:null});
      }
      if(dropped) repaired.push(dropped+' inimigo(s) com dados ilegíveis voltam ao estado inicial');
    } else repaired.push('inimigos (voltam ao estado inicial)');
    const value={v:SAVE_VERSION,mission,diff,time:num(raw.time,0,0,SAVE_LIMITS.time,'tempo de missão'),savedAt:fin(raw.savedAt)?raw.savedAt:0,player,obj,flags,doors,lamps,ally,enemies,taken,docs,stats,alarm:!!raw.alarm,radioDead:!!raw.radioDead,discovered};
    return {ok:true,value,reason:'',repaired};
  }catch(err){ return bad('estrutura corrompida ('+(err&&err.message||err)+')'); }
}

/* Lê o checkpoint gravado. Se o principal estiver ilegível, tenta a cópia
   de segurança; nunca lança. source: 'main' | 'backup' | null */
function readStoredCheckpoint(){
  const out={cp:null,source:null,present:false,reason:'',repaired:[]};
  const tryKey=k=>{ const r=store.raw(k); if(r===null||r==='') return null; out.present=true; let parsed; try{ parsed=JSON.parse(r); }catch(e){ return {ok:false,reason:'arquivo truncado ou ilegível',repaired:[]}; } return validateCheckpoint(parsed); };
  const a=tryKey(CP_KEY);
  if(a&&a.ok){ out.cp=a.value; out.source='main'; out.repaired=a.repaired; return out; }
  const b=tryKey(CP_BAK_KEY);
  if(b&&b.ok&&a){ out.cp=b.value; out.source='backup'; out.reason=a.reason; out.repaired=b.repaired; return out; }
  if(a) out.reason=a.reason;
  return out;
}
/* Grava o checkpoint novo e preserva o último íntegro numa chave de backup. */
function writeCheckpoint(cp){
  const prev=store.raw(CP_KEY);
  if(prev!==null){ let ok=false; try{ ok=validateCheckpoint(JSON.parse(prev)).ok; }catch(e){} if(ok) store.setRaw(CP_BAK_KEY,prev); }
  const done=store.set(CP_KEY,cp);
  if(!done) DIAG.report('SAVE_WRITE','checkpoint não gravado (armazenamento cheio ou bloqueado)');
  return done;
}
function clearCheckpoint(){ store.del(CP_KEY); store.del(CP_BAK_KEY); }

/* Campanha e ajustes: conserta em vez de quebrar a tela de Operações. */
function sanitizeCampaign(c){
  const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
  if(!isObj(c)) return {done:{}};
  const out={done:{}};
  if(isObj(c.done)) for(const id in c.done){ const d=c.done[id]; if(!Object.prototype.hasOwnProperty.call(LEVELS,id)||!isObj(d)) continue; out.done[id]={rating:['MÉDIO','BOM','EXCELENTE'].includes(d.rating)?d.rating:'MÉDIO',time:typeof d.time==='number'&&isFinite(d.time)&&d.time>=0?d.time:0,diff:Object.prototype.hasOwnProperty.call(DIFF,d.diff)?d.diff:'soldado'}; }
  const k=c.carry;
  if(isObj(k)&&typeof k.from==='string'&&Array.isArray(k.weapons)&&isObj(k.ammo)){
    const weapons=k.weapons.filter(w=>typeof w==='string'&&Object.prototype.hasOwnProperty.call(WEAPONS,w)); const ammo={};
    for(const w of weapons){ const a=k.ammo[w]; ammo[w]={mag:isObj(a)&&isFinite(a.mag)?Math.max(0,Math.min(999,a.mag|0)):0,reserve:isObj(a)&&isFinite(a.reserve)?Math.max(0,Math.min(999,a.reserve|0)):0}; }
    if(weapons.length) out.carry={from:k.from,weapons,ammo,cur:weapons.includes(k.cur)?k.cur:weapons[0],hp:typeof k.hp==='number'&&isFinite(k.hp)?Math.max(1,Math.min(100,k.hp)):100};
  }
  return out;
}
function sanitizeStoredData(){
  const raw=store.raw('sdp_campaign'); if(raw===null) return;
  let parsed=null; try{ parsed=JSON.parse(raw); }catch(e){}
  const clean=sanitizeCampaign(parsed), txt=JSON.stringify(clean);
  if(txt!==raw){ store.setRaw('sdp_campaign_bak',raw); store.set('sdp_campaign',clean); DIAG.report('CAMPAIGN_REPAIRED','registro de campanha consertado; original guardado em sdp_campaign_bak'); }
}
// Leitura única e sempre consertada do registro de campanha.
function campaign(){ return sanitizeCampaign(store.get('sdp_campaign')); }
