'use strict';


/* =========================================================
   ÁUDIO (sintetizado, autoral)
   ========================================================= */
/* =========================================================
   TRILHA SONORA ADAPTATIVA — composição original, sintetizada
   estados: menu · exploração · tensão · combate (+ vitória)
   ========================================================= */
const MUS={ready:false,step:0,next:0,bpm:72,state:'menu',region:'paris',bar:0,
  init(){ const A=AudioSys, c=A.ctx; if(!c||this.ready) return; this.ready=true; this.c=c;
    const bus=(v)=>{ const g=c.createGain(); g.gain.value=v; g.connect(this.out); return g; };
    this.out=c.createGain(); this.out.gain.value=9; this.out.connect(A.mus);
    // reverb leve própria da música
    const conv=c.createConvolver(); conv.buffer=AudioSys.makeIR(2.6,2.2); const wet=c.createGain(); wet.gain.value=.32; conv.connect(wet); wet.connect(A.mus); this.verb=conv;
    this.L={theme:bus(0),pad:bus(0),pulse:bus(0),tension:bus(0),combat:bus(0)}; for(const k in this.L) this.L[k].connect(conv);
    this.next=c.currentTime+.1; },
  // escalas e progressões por região (graus relativos a Ré)
  SC:{paris:[0,2,3,5,7,8,10],desert:[0,1,4,5,7,8,10],crete:[0,2,3,5,7,9,10],alps:[0,2,3,5,7,8,10]},
  PROG:[[0,3,7],[-4,0,3],[-7,-4,0],[-5,-1,2]],   // Dm · Bb · Gm · A
  PROGC:[[0,3,7],[-4,0,3],[-2,2,5],[-5,-1,2]],   // Dm · Bb · C · A
  MEL:[[7,null,3,2,0,null,2,3],[0,null,3,8,7,null,5,3],[5,null,8,7,5,3,2,0],[2,null,11,null,7,null,null,null],
       [7,null,12,10,7,null,5,7],[8,null,7,5,3,null,5,7],[5,3,2,0,-1,null,0,2],[-1,null,2,null,0,null,null,null]],
  ALT:{desert:{2:1,3:4,14:13,15:16,'-10':-11},crete:{8:9,'-4':-3}},
  hz(semi,oct){ return 146.83*Math.pow(2,(semi+12*(oct||0))/12); },  // Ré3
  set(state,region){ if(region) this.region=region; if(state===this.state) return; const prev=this.state; this.state=state;
    if(state==='combat'&&prev!=='combat') this.stinger('alarm'); },
  on(k){ return (this.want[k]||0)>0||this.L[k].gain.value>.01; },
  mix(){ const s=this.state, t=this.c.currentTime; this.want=this.want||{}; const M=(k,v,tc)=>{ if(this.want[k]!==v){ this.want[k]=v; this.L[k].gain.setTargetAtTime(v,t,tc||1.2); } };
    M('theme',s==='menu'?.9:0); M('pad',s==='menu'?.5:s==='combat'?.35:.6); M('pulse',s==='explore'||s==='tension'?.55:0,1.5); M('tension',s==='tension'?.9:0,1); M('combat',s==='combat'?.95:0,s==='combat'?.25:2.5); },
  // ---------- instrumentos ----------
  note(bus,f,t,dur,o){ const c=this.c; o=o||{}; const g=c.createGain(); const peak=o.gain||.1, att=o.att||.01, rel=o.rel||dur*.6;
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(peak,t+att); g.gain.setValueAtTime(peak,t+Math.max(att,dur-rel)); g.gain.exponentialRampToValueAtTime(.0001,t+dur+rel*.4);
    let head=g; if(o.lp){ const f2=c.createBiquadFilter(); f2.type=o.ftype||'lowpass'; f2.frequency.setValueAtTime(o.lp,t); if(o.lpTo) f2.frequency.exponentialRampToValueAtTime(o.lpTo,t+(o.lpT||dur)); f2.Q.value=o.q||.7; g.connect(f2); head=f2; } head.connect(bus);
    const waves=o.waves||[['sine',1,0]]; for(const [w,m,det] of waves){ const os=c.createOscillator(); os.type=w; os.frequency.setValueAtTime(f*m,t); os.detune.value=det||0; if(o.slide) os.frequency.exponentialRampToValueAtTime(f*m*o.slide,t+.08);
      if(o.vib){ const l=c.createOscillator(); l.frequency.value=o.vib; const lg=c.createGain(); lg.gain.value=f*m*.006; l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(t+dur+rel); }
      if(o.trem){ const tg=c.createGain(); const l=c.createOscillator(); l.frequency.value=o.trem; const lg=c.createGain(); lg.gain.value=.35; l.connect(lg); lg.connect(tg.gain); tg.gain.value=.65; os.connect(tg); tg.connect(g); l.start(t); l.stop(t+dur+rel); } else os.connect(g);
      os.start(t); os.stop(t+dur+rel+.05); } },
  noiseHit(bus,t,o){ const c=this.c, s=c.createBufferSource(); s.buffer=AudioSys.noiseBuf; const f=c.createBiquadFilter(); f.type=o.type||'highpass'; f.frequency.value=o.freq||1500; f.Q.value=o.q||.7; const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(o.gain,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+o.dur); s.connect(f); f.connect(g); g.connect(bus); s.start(t,Math.random()*.5); s.stop(t+o.dur+.05); },
  piano(bus,f,t,g){ this.note(bus,f,t,.05,{gain:g||.09,att:.004,rel:1.6,waves:[['triangle',1,0],['sine',2,3],['sine',3,-4]],lp:2600,lpTo:900,lpT:1.2}); },
  accordion(bus,f,t,dur,g){ this.note(bus,f,t,dur,{gain:g||.05,att:.06,rel:.2,waves:[['square',1,-6],['sawtooth',1,7],['square',2,0]],lp:1700,trem:5.6}); },
  lead(bus,f,t,dur,g){ const r=this.region; if(r==='paris') return this.accordion(bus,f,t,dur,g);
    if(r==='desert') return this.note(bus,f,t,Math.min(dur,.35),{gain:(g||.06)*1.3,att:.003,rel:.5,waves:[['sawtooth',1,0],['triangle',2,5]],lp:2400,lpTo:600,lpT:.4,slide:1.0});
    if(r==='crete') return this.note(bus,f,t,dur,{gain:(g||.05),att:.05,rel:.25,waves:[['sawtooth',1,0],['sawtooth',1,9]],lp:1500,vib:6});
    return this.note(bus,f,t,dur,{gain:(g||.05)*1.1,att:.08,rel:.3,waves:[['sawtooth',1,-5],['sawtooth',1,5],['triangle',.5,0]],lp:900,vib:4.5}); },
  pad(bus,ch,t,dur,g){ for(const n of ch) this.note(bus,this.hz(n,-1),t,dur,{gain:g||.025,att:.9,rel:1.4,waves:[['sawtooth',1,-8],['sawtooth',1,8]],lp:700,q:.5}); },
  strings(bus,f,t,dur,g){ this.note(bus,f,t,dur,{gain:g||.05,att:.012,rel:.08,waves:[['sawtooth',1,-6],['sawtooth',1,6]],lp:1500}); },
  brass(bus,ch,t,dur,g){ for(const n of ch) this.note(bus,this.hz(n,0),t,dur,{gain:g||.045,att:.03,rel:.25,waves:[['sawtooth',1,-4],['sawtooth',1,4]],lp:500,lpTo:2200,lpT:.12,q:1.2}); },
  timp(bus,f,t,g){ this.note(bus,f,t,.05,{gain:g||.35,att:.003,rel:1.1,waves:[['sine',1,0],['sine',1.5,0]],slide:.85}); this.noiseHit(bus,t,{type:'lowpass',freq:220,gain:(g||.35)*.4,dur:.25}); },
  snare(bus,t,g){ this.noiseHit(bus,t,{type:'highpass',freq:1800,gain:g||.12,dur:.13}); this.note(bus,190,t,.02,{gain:(g||.12)*.5,att:.002,rel:.06,waves:[['triangle',1,0]]}); },
  kick(bus,t,g){ this.note(bus,60,t,.02,{gain:g||.3,att:.002,rel:.25,waves:[['sine',1,0]],slide:.6}); },
  stinger(kind){ if(!this.ready) return; const t=this.c.currentTime+.02, b=this.out;
    if(kind==='alarm'){ this.brass(b,[0,1,6],t,.5,.08); this.timp(b,this.hz(0,-2),t,.5); for(let i=0;i<6;i++) this.snare(b,t+.3+i*.06,.06+i*.012); }
    if(kind==='win'){ [[0,4,7],[5,9,12],[7,11,14],[12,16,19]].forEach((ch,i)=>this.brass(b,ch,t+i*.45,i===3?2.2:.42,.05)); this.timp(b,this.hz(0,-2),t+1.35,.4); }
    if(kind==='lose'){ this.pad(b,[0,3,6],t,2.5,.04); this.note(b,this.hz(0,-2),t,2,{gain:.15,att:.01,rel:1.8,waves:[['sawtooth',1,0]],lp:300}); } },
  // ---------- sequenciador ----------
  update(dt){ if(!this.ready || !this.c || this.c.state!=='running') return; const c=this.c; this.mix(); const s=this.state; const bpm=s==='combat'?132:s==='tension'?88:s==='menu'?72:66; const spb=60/bpm/2; // colcheias
    while(this.next<c.currentTime+.25){ this.play(this.step,this.next,spb); this.step++; this.next+=spb; } },
  play(i,t,spb){ const L=this.L, sc=this.SC[this.region]||this.SC.paris; const bar=Math.floor(i/8), beat=i%8;
    const prog=this.state==='combat'?this.PROGC:this.PROG, ch=prog[bar%4];
    const deg=(n)=>{ const o=Math.floor(n/7), k=((n%7)+7)%7; return sc[k]+12*o; };
    // tema (menu)
    if(this.on('theme')){ if(beat===0) this.pad(L.theme,ch,t,spb*8*.95,.02);
    const ph=this.MEL[bar%8], m=ph[beat]; if(m!==null&&m!==undefined){ const al=this.ALT[this.region], n=al&&al[m]!==undefined?al[m]:m; let len=1; while(beat+len<8&&ph[beat+len]===null) len++; this.lead(L.theme,this.hz(n,1),t,spb*len*.92,.05); }
    if(beat%2===0) this.piano(L.theme,this.hz(ch[(beat/2)%3],0),t,.03); }
    // pad (todos menos menu)
    if(beat===0&&this.on('pad')) this.pad(L.pad,ch,t,spb*8,.022);
    // exploração: piano esparso + pulso grave
    if(this.on('pulse')){ if(beat===0||beat===4) this.kick(L.pulse,t,.12);
    if((beat===2||beat===6)&&Math.random()<.55){ const n=ch[(Math.random()*3)|0]+(Math.random()<.5?12:0); this.piano(L.pulse,this.hz(n,0),t,.05); }
    if(beat===7&&bar%2===1&&Math.random()<.5) this.piano(L.pulse,this.hz(deg(4+((Math.random()*3)|0)),1),t,.035); }
    // tensão: ostinato de cordas graves + tique
    if(this.on('tension')){ const pat=[0,0,1,0,0,0,1,0]; if(pat[beat]||beat%2===0) this.strings(L.tension,this.hz(ch[0]+(pat[beat]?1:0),-1),t,spb*.8,.04); if(beat%2===1) this.noiseHit(L.tension,t,{type:'highpass',freq:6000,gain:.025,dur:.03}); if(beat===0&&bar%2===0) this.timp(L.tension,this.hz(0,-2),t,.18); }
    // combate: caixa marcial, baixo em ostinato, metais nos tempos fortes, tímpano
    if(this.on('combat')){ const C=L.combat; const sn=[1,0,.5,.5,1,0,.6,1]; if(sn[beat]) this.snare(C,t,.05+.06*sn[beat]); if(beat===3||beat===7) this.snare(C,t+spb/2,.05);
      const bass=[0,0,12,0,3,0,7,5]; this.note(C,this.hz(ch[0]+bass[beat]%12-12,-1),t,spb*.7,{gain:.07,att:.005,rel:.05,waves:[['sawtooth',1,0]],lp:420});
      this.strings(C,this.hz(ch[beat%3],0),t,spb*.5,.03);
      if(beat===0) { this.brass(C,ch,t,spb*1.6,.04); this.timp(C,this.hz(ch[0],-2),t,.3); } if(beat===4&&bar%2===1) this.brass(C,ch.map(x=>x+12),t,spb*1.2,.03); }
  }
};

const AudioSys={
  ctx:null,
  init(){
    if(this.ctx){ if(this.ctx.state==='suspended'){ const p=this.ctx.resume(); if(p&&typeof p.catch==='function') p.catch(()=>{}); } return; }
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    try{ this.ctx=new AC(); }catch(e){ return; }
    const c=this.ctx;
    this.master=c.createGain();
    // Limitador no barramento mestre: várias explosões/tiros somados não estouram a saída.
    try{ const lim=c.createDynamicsCompressor(); lim.threshold.value=-8; lim.knee.value=6; lim.ratio.value=14; lim.attack.value=.003; lim.release.value=.22; this.master.connect(lim); lim.connect(c.destination); this.limiter=lim; }
    catch(e){ this.master.connect(c.destination); if(typeof DIAG!=='undefined') DIAG.report('AUDIO_LIMITER','limitador indisponível; áudio segue sem ele',e); }
    this.sfx=c.createGain(); this.sfx.connect(this.master);
    this.mus=c.createGain(); this.mus.connect(this.master);
    this.combatBus=c.createGain(); this.combatBus.gain.value=0; this.combatBus.connect(this.mus);
    const len=c.sampleRate; const b=c.createBuffer(1,len,c.sampleRate); const d=b.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1; this.noiseBuf=b;
    this.verbIn=c.createGain(); this.verbIn.gain.value=.18; const cv=c.createConvolver(); cv.buffer=this.makeIR(1.5,3); this.sfx.connect(this.verbIn); this.verbIn.connect(cv); cv.connect(this.master); this.conv=cv;
    this.applyVolume(); this.startMusic(); this.beatT=0; this.combat=0;
  },
  makeIR(dur,decay){ const c=this.ctx, n=Math.floor(c.sampleRate*dur), b=c.createBuffer(2,n,c.sampleRate); for(let ch=0;ch<2;ch++){ const d=b.getChannelData(ch); for(let i=0;i<n;i++){ const t=i/n; d[i]=(Math.random()*2-1)*Math.pow(1-t,decay)*(i<c.sampleRate*.012?.35:1); } } return b; },
  setRoom(kind){ if(!this.ctx) return; const R={indoor:[.42,1.9,2.6],crypt:[.55,2.6,2.2],street:[.2,1.3,3],open:[.08,.8,4]}[kind]||[.2,1.3,3]; this.verbIn.gain.setTargetAtTime(R[0],this.ctx.currentTime,.3); if(this.roomK!==kind){ this.roomK=kind; this.conv.buffer=this.makeIR(R[1],R[2]); } },
  applyVolume(){ if(!this.ctx) return; this.sfx.gain.value=settings.volume; this.mus.gain.value=settings.music*.55; },
  spatial(pos){
    if(!pos) return {g:1,pan:0,occ:false};
    const cp=camera.position; const dx=pos.x-cp.x, dz=pos.z-cp.z; const d=Math.hypot(dx,dz,(pos.y||1.4)-cp.y);
    const yaw=G?G.player.yaw:0; const rel=angDiff(-yaw,Math.atan2(dx,-dz));
    let g=1/(1+d*.1), occ=false;
    if(d>2.5 && W.solids.length && segFirst(cp.x,cp.y,cp.z,pos.x,(pos.y||1.4),pos.z)){ occ=true; g*=.42; }
    return {g,pan:Math.sin(rel)*.85,occ};
  },
  route(node,o){
    const c=this.ctx; let n=node;
    if(o.occ){ const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=650; n.connect(lp); n=lp; }
    if(o.pan && c.createStereoPanner){ const p=c.createStereoPanner(); p.pan.value=clamp(o.pan,-1,1); n.connect(p); n=p; }
    n.connect(o.bus||this.sfx);
  },
  env(g,t,peak,dur,att){ g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+(att||.004)); g.gain.exponentialRampToValueAtTime(.0001,t+dur); },
  noise(o){
    const c=this.ctx; const t=c.currentTime+(o.delay||0);
    const s=c.createBufferSource(); s.buffer=this.noiseBuf; s.playbackRate.value=o.rate||1;
    const f=c.createBiquadFilter(); f.type=o.type||'bandpass'; f.frequency.setValueAtTime(o.freq||1000,t); if(o.freqTo) f.frequency.exponentialRampToValueAtTime(o.freqTo,t+o.dur); f.Q.value=o.q||.8;
    const g=c.createGain(); this.env(g,t,o.gain,o.dur,o.att);
    s.connect(f); f.connect(g); this.route(g,o); s.start(t,Math.random()*.6); s.stop(t+o.dur+.05);
  },
  tone(o){
    const c=this.ctx; const t=c.currentTime+(o.delay||0);
    const s=c.createOscillator(); s.type=o.wave||'sine'; s.frequency.setValueAtTime(o.freq,t); if(o.to) s.frequency.exponentialRampToValueAtTime(o.to,t+o.dur);
    const g=c.createGain(); this.env(g,t,o.gain,o.dur,o.att);
    let n=g; if(o.lp){ const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=o.lp; g.connect(f); n=f; }
    s.connect(g); this.route(n,o); s.start(t); s.stop(t+o.dur+.05);
  },
  play(name,pos,k=1){
    if(!this.ctx) return;
    const s=this.spatial(pos); const g=s.g*k; const o={pan:s.pan,occ:s.occ};
    const N=(x)=>this.noise(Object.assign({},o,x)), Tn=(x)=>this.tone(Object.assign({},o,x));
    switch(name){
      case 'pistol': N({type:'highpass',freq:4200,gain:.5*g,dur:.025}); N({freq:1500,q:.6,gain:.9*g,dur:.16}); Tn({freq:110,to:40,gain:.75*g,dur:.18}); Tn({freq:55,to:35,gain:.4*g,dur:.25}); N({type:'lowpass',freq:700,gain:.25*g,dur:.8,delay:.03}); Tn({freq:2400,wave:'square',gain:.03*g,dur:.02,delay:.06}); break;
      case 'smg': N({type:'highpass',freq:4500,gain:.4*g,dur:.02}); N({freq:2000,q:.7,gain:.75*g,dur:.09}); Tn({freq:130,to:55,gain:.55*g,dur:.11}); Tn({freq:62,to:40,gain:.3*g,dur:.14}); N({type:'lowpass',freq:600,gain:.17*g,dur:.5,delay:.02}); break;
      case 'eshot': N({type:'highpass',freq:3800,gain:.35*g,dur:.03}); N({freq:1100,q:.6,gain:.75*g,dur:.18}); Tn({freq:95,to:38,gain:.5*g,dur:.2}); N({type:'lowpass',freq:500,gain:.22*g,dur:1.1,delay:.05}); N({type:'lowpass',freq:300,gain:.1*g,dur:1.4,delay:.25}); break;
      case 'dry': Tn({freq:1800,wave:'square',gain:.12*g,dur:.03}); break;
      case 'magout': Tn({freq:900,wave:'square',gain:.1*g,dur:.04}); N({freq:3000,gain:.12*g,dur:.05,delay:.02}); break;
      case 'magin': Tn({freq:600,wave:'square',gain:.14*g,dur:.05}); N({freq:2400,gain:.16*g,dur:.05}); break;
      case 'chamber': Tn({freq:1300,wave:'square',gain:.12*g,dur:.03}); Tn({freq:700,wave:'square',gain:.12*g,dur:.04,delay:.07}); break;
      case 'helmet': Tn({freq:2050,gain:.5*g,dur:.32}); Tn({freq:3170,gain:.28*g,dur:.22}); N({type:'highpass',freq:4000,gain:.3*g,dur:.05}); break;
      case 'helmetDrop': Tn({freq:1400+Math.random()*500,gain:.22*g,dur:.14}); Tn({freq:2600,gain:.08*g,dur:.08}); break;
      case 'cloth': N({type:'lowpass',freq:900,gain:.25*g,dur:.06}); break;
      case 'body': N({type:'lowpass',freq:420,gain:.55*g,dur:.09}); Tn({freq:80,to:50,gain:.35*g,dur:.08}); break;
      case 'stone': N({freq:2600,q:1,gain:.35*g,dur:.06}); break;
      case 'wood': N({freq:900,q:1.2,gain:.4*g,dur:.08}); break;
      case 'metal': Tn({freq:2600+Math.random()*600,gain:.18*g,dur:.12}); N({freq:4000,gain:.2*g,dur:.04}); break;
      case 'glass': N({type:'highpass',freq:3200,gain:.5*g,dur:.35}); Tn({freq:4200,gain:.08*g,dur:.2,delay:.05}); Tn({freq:5100,gain:.06*g,dur:.15,delay:.12}); break;
      case 'step': { const sf=this.surf||'stone';
        if(sf==='wood'){ N({type:'lowpass',freq:380,gain:.15*g,dur:.07}); Tn({freq:150+Math.random()*30,to:90,gain:.09*g,dur:.06}); }
        else if(sf==='metal'){ N({type:'lowpass',freq:500,gain:.11*g,dur:.05}); Tn({freq:700+Math.random()*200,gain:.05*g,dur:.09}); Tn({freq:1500,gain:.025*g,dur:.06,delay:.01}); }
        else if(sf==='snow'){ N({type:'bandpass',freq:1300+Math.random()*400,q:.5,gain:.16*g,dur:.13,att:.02}); N({type:'lowpass',freq:300,gain:.08*g,dur:.08}); }
        else if(sf==='sand'){ N({type:'bandpass',freq:2200+Math.random()*600,q:.6,gain:.1*g,dur:.1,att:.015}); }
        else if(sf==='grass'){ N({type:'highpass',freq:2600,gain:.07*g,dur:.08,att:.01}); N({type:'lowpass',freq:420,gain:.08*g,dur:.06}); }
        else if(sf==='cloth'||sf==='sandbag'){ N({type:'lowpass',freq:600,gain:.12*g,dur:.08}); }
        else { N({type:'lowpass',freq:480,gain:.13*g,dur:.06}); N({freq:2400+Math.random()*500,q:1.2,gain:.025*g,dur:.025}); } } break;
      case 'silenced': N({type:'lowpass',freq:1100,gain:.4*g,dur:.07}); Tn({freq:220,to:100,gain:.16*g,dur:.07}); Tn({freq:1600,wave:'square',gain:.05*g,dur:.02,delay:.03}); break;
      case 'casing': Tn({freq:3800+Math.random()*900,gain:.05*g,dur:.06}); Tn({freq:5200,gain:.03*g,dur:.04,delay:.02}); break;
      case 'thud': N({type:'lowpass',freq:300,gain:.42*g,dur:.15}); Tn({freq:90,to:50,gain:.25*g,dur:.15}); break;
      case 'shutter': Tn({freq:2600,wave:'square',gain:.08,dur:.015}); N({freq:3500,q:2,gain:.14,dur:.04,delay:.01}); Tn({freq:1800,wave:'square',gain:.06,dur:.015,delay:.07}); break;
      case 'dirtHit': N({type:'lowpass',freq:900,gain:.3*g,dur:.07}); break;
      case 'pebble': N({freq:2400,q:2,gain:.3*g,dur:.04}); Tn({freq:1900+Math.random()*700,gain:.06*g,dur:.05}); break;
      case 'lamp': Tn({freq:900,wave:'square',gain:.06,dur:.03}); N({type:'highpass',freq:3000,gain:.08,dur:.25,att:.05}); break;
      case 'throw': N({freq:700,freqTo:300,q:1,gain:.12,dur:.15}); break;
      case 'land': N({type:'lowpass',freq:300,gain:.3*g,dur:.12}); break;
      case 'whiz': N({freq:3200,freqTo:900,q:4,gain:.35*g,dur:.13}); break;
      case 'door': N({freq:320,freqTo:180,q:3,gain:.28*g,dur:.55}); break;
      case 'garage': N({type:'lowpass',freq:240,gain:.4*g,dur:2.2,att:.2}); Tn({freq:60,gain:.15*g,dur:2,att:.2}); break;
      case 'pickup': Tn({freq:700,gain:.12*g,dur:.08}); Tn({freq:1050,gain:.12*g,dur:.1,delay:.07}); break;
      case 'objective': [523,659,784].forEach((f,i)=>Tn({freq:f,gain:.12,dur:.5,delay:i*.12,wave:'triangle'})); break;
      case 'grunt': Tn({freq:150+Math.random()*40,to:90,wave:'sawtooth',lp:700,gain:.22*g,dur:.2}); break;
      case 'death': Tn({freq:130,to:70,wave:'sawtooth',lp:500,gain:.22*g,dur:.38}); break;
      case 'shout': [0,.16].forEach(dl=>Tn({freq:220+Math.random()*30,to:180,wave:'sawtooth',lp:1100,gain:.2*g,dur:.13,delay:dl})); break;
      case 'hurt': N({type:'lowpass',freq:300,gain:.5,dur:.12}); Tn({freq:240,to:170,wave:'triangle',gain:.18,dur:.15}); break;
      case 'radio': N({freq:2400,q:3,gain:.08,dur:.12}); break;
      case 'alarm': for(let i=0;i<8;i++){ Tn({freq:i%2?640:820,wave:'square',lp:1800,gain:.12*g,dur:.7,delay:i*.75,att:.05}); } break;
      case 'explosion': N({type:'lowpass',freq:220,gain:1.1*g,dur:1.8,att:.005}); Tn({freq:70,to:28,gain:.9*g,dur:.9}); N({type:'highpass',freq:1800,gain:.45*g,dur:.18}); N({type:'lowpass',freq:600,gain:.3*g,dur:2.6,delay:.12}); break;
      case 'tankfire': N({type:'lowpass',freq:300,gain:1.25*g,dur:1.7}); Tn({freq:60,to:24,gain:1*g,dur:.9}); N({freq:1400,q:.6,gain:.75*g,dur:.25}); N({type:'lowpass',freq:500,gain:.35*g,dur:3,delay:.15}); break;
      case 'engine': N({type:'lowpass',freq:140,gain:.42*g,dur:.38,att:.05}); Tn({freq:38+Math.random()*6,wave:'sawtooth',lp:180,gain:.13*g,dur:.36,att:.04}); break;
      case 'tracks': N({freq:900,q:3,gain:.06*g,dur:.05}); Tn({freq:420,wave:'square',lp:900,gain:.03*g,dur:.04,delay:.06}); break;
      case 'rocket': N({freq:900,freqTo:250,q:.7,gain:.85*g,dur:.9}); N({type:'lowpass',freq:400,gain:.6*g,dur:.6}); break;
      case 'clank': Tn({freq:1700+Math.random()*500,gain:.25*g,dur:.18}); N({type:'highpass',freq:3500,gain:.25*g,dur:.06}); break;
      case 'nadeBounce': Tn({freq:900+Math.random()*300,gain:.16*g,dur:.08}); N({freq:1800,q:2,gain:.12*g,dur:.04}); break;
      case 'pin': Tn({freq:2600,wave:'square',gain:.06,dur:.02}); Tn({freq:3400,gain:.05,dur:.05,delay:.05}); break;
      case 'turret': Tn({freq:170,to:240,wave:'sawtooth',lp:520,gain:.22*g,dur:1.3,att:.1}); break;
      case 'unlock': Tn({freq:1800,wave:'square',gain:.05,dur:.03}); Tn({freq:1150,gain:.07,dur:.06,delay:.09}); break;
      case 'stamp': N({type:'lowpass',freq:500,gain:.5,dur:.08}); Tn({freq:140,gain:.2,dur:.08}); break;
      case 'morse': for(let i=0;i<6;i++) Tn({freq:820,wave:'square',lp:2000,gain:.05,dur:Math.random()<.5?.06:.16,delay:i*.2}); break;
      case 'flare': N({type:'highpass',freq:1800,gain:.4*g,dur:1.6,att:.05}); N({type:'lowpass',freq:300,gain:.25*g,dur:.3}); break;
      case 'drone': Tn({freq:58+Math.random()*4,wave:'sawtooth',lp:220,gain:.16*g,dur:1.6,att:.4}); Tn({freq:61,wave:'sawtooth',lp:200,gain:.12*g,dur:1.6,att:.4,delay:.05}); break;
      case 'siren': Tn({freq:380,to:760,wave:'sawtooth',lp:1400,gain:.12*g,dur:2.2,att:.3}); Tn({freq:760,to:380,wave:'sawtooth',lp:1400,gain:.1*g,dur:2.2,att:.1,delay:2.2}); break;
      case 'hiss': N({type:'highpass',freq:2600,gain:.32*g,dur:.7,att:.02}); break;
      case 'squeak': Tn({freq:3200,to:4200,gain:.025,dur:.05}); Tn({freq:3600,to:2800,gain:.02,dur:.06,delay:.08}); break;
      case 'drip': Tn({freq:1500,to:620,gain:.05,dur:.07}); Tn({freq:1200,to:520,gain:.02,dur:.07,delay:.22}); break;
      case 'leak': N({type:'bandpass',freq:520,gain:.3*g,dur:1.1,att:.05}); N({type:'lowpass',freq:240,gain:.18*g,dur:.9}); break;
      case 'fireball': N({type:'lowpass',freq:240,gain:.95*g,dur:2.6,att:.04}); Tn({freq:40,wave:'sawtooth',lp:110,gain:.32*g,dur:2,att:.05}); N({type:'highpass',freq:1600,gain:.2*g,dur:1.6,att:.2}); break;
      case 'honk': Tn({freq:330,wave:'square',lp:1300,gain:.13*g,dur:.55}); Tn({freq:415,wave:'square',lp:1300,gain:.1*g,dur:.55}); break;
      case 'sabotage': N({type:'highpass',freq:2500,gain:.3,dur:.25}); Tn({freq:180,wave:'square',gain:.1,dur:.4}); break;
    }
  },
  ambient(kind){
    if(!this.ctx) return; if(this.amb){ for(const n of this.amb){ try{ n.stop(); }catch(e){} } this.amb=null; } if(!kind) return;
    const c=this.ctx, nodes=[], out=c.createGain(); out.gain.setValueAtTime(0,c.currentTime); out.gain.linearRampToValueAtTime(1,c.currentTime+2.5); out.connect(this.sfx);
    const noise=(type,f,q,gain)=>{ const s=c.createBufferSource(); s.buffer=this.noiseBuf; s.loop=true; s.playbackRate.value=.97+Math.random()*.06; const fl=c.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const gg=c.createGain(); gg.gain.value=gain; s.connect(fl); fl.connect(gg); gg.connect(out); s.start(); nodes.push(s); return gg; };
    if(kind==='crypt'){ noise('lowpass',110,.7,.035); noise('bandpass',1400,.3,.004); }
    if(kind==='rain'){ noise('highpass',2000,.4,.045); noise('bandpass',700,.6,.025); }
    if(kind==='wind'){ const gg=noise('bandpass',360,.9,.05); const l=c.createOscillator(); l.frequency.value=.07; const lg=c.createGain(); lg.gain.value=.035; l.connect(lg); lg.connect(gg.gain); l.start(); nodes.push(l); }
    if(kind==='medina'){ noise('bandpass',520,.5,.022); noise('highpass',3800,.4,.005); noise('lowpass',160,.7,.02); }
    if(kind==='night'){ noise('lowpass',650,.5,.018); const o=c.createOscillator(); o.frequency.value=4300; const og=c.createGain(); og.gain.value=0; const lfo=c.createOscillator(); lfo.type='square'; lfo.frequency.value=21; const lg=c.createGain(); lg.gain.value=.005; const sl=c.createOscillator(); sl.frequency.value=.4; const sg=c.createGain(); sg.gain.value=.005; lfo.connect(lg); lg.connect(og.gain); sl.connect(sg); sg.connect(og.gain); o.connect(og); og.connect(out); o.start(); lfo.start(); sl.start(); nodes.push(o,lfo,sl); }
    if(kind==='dawn'){ noise('bandpass',340,.9,.035); noise('highpass',2800,.5,.006); noise('lowpass',120,.7,.03); }
    if(kind==='forest'){ noise('lowpass',180,.5,.03); noise('highpass',4600,.4,.006); noise('bandpass',700,.6,.008); }
    if(kind==='harbor'){ noise('lowpass',360,.6,.05); noise('bandpass',1100,.5,.01); noise('highpass',4200,.3,.003); }
    if(kind==='desert'){ noise('bandpass',260,.6,.042); noise('lowpass',90,.7,.03); noise('highpass',5200,.3,.004); }
    this.amb=nodes;
  },
  startMusic(){ MUS.init(); },
  update(dt,combatTarget,tension){
    if(!this.ctx) return;
    this.combat=lerp(this.combat,combatTarget,1-Math.exp(-dt*(combatTarget>this.combat?3:.6)));
    { const id=G&&G.level?G.level.id:''; const reg=['05','06','07','08'].includes(id)?'desert':['09','10','11','15','16','17'].includes(id)?'crete':['12','13','14','18','19','20'].includes(id)?'alps':'paris';
      const st=APP.state==='MENU'?'menu':(G&&G.ending)?'explore':combatTarget>0?'combat':tension?'tension':'explore'; MUS.set(st,APP.state==='MENU'?'paris':reg); MUS.update(dt); }
    this.combatBus.gain.value=0;
    this.beatT-=dt;
    if(this.beatT<=0){
      this.beatT=.62;
      if(this.combat>.04){
        this.beat=(this.beat||0)+1;
        this.tone({freq:72,to:44,gain:.5,dur:.28,bus:this.combatBus});
        if(this.beat%2===0) this.noise({type:'highpass',freq:5000,gain:.12,dur:.05,bus:this.combatBus});
        if(this.beat%4===3) this.tone({freq:146.8,wave:'sawtooth',lp:600,gain:.12,dur:.5,bus:this.combatBus});
      }
    }
  }
};