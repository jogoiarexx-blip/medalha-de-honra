'use strict';
// CP-03A — acabamento local da Rue des Lanternes. Geometria estática fundida
// pelo mesclador existente; sem luzes novas, sem alterar a navegação/objetivos.
let PARIS_SCENERY=null;
function parisSceneryMaterials(){
  if(PARIS_SCENERY) return PARIS_SCENERY;
  const atlas=canvasTex(512,256,(g)=>{
    const names=['BOULANGERIE','LIBRAIRIE','ÉPICERIE','ATELIER'];
    const colors=['#495343','#4a3430','#394b50','#544733'];
    for(let k=0;k<4;k++){
      const x=k*128;g.fillStyle='#918777';g.fillRect(x,0,128,256);
      g.fillStyle=colors[k];g.fillRect(x+5,8,118,236);
      g.fillStyle='#cbbd94';g.fillRect(x+9,13,110,29);g.fillStyle='#242921';g.font='bold 11px serif';g.textAlign='center';g.fillText(names[k],x+64,32,104);
      g.fillStyle='#0e1b22';g.fillRect(x+12,53,104,139);
      g.fillStyle=k%2?'#263038':'#544c33';g.fillRect(x+17,58,42,128);
      g.fillStyle='rgba(170,190,193,.14)';g.beginPath();g.moveTo(x+18,59);g.lineTo(x+47,59);g.lineTo(x+18,132);g.fill();
      g.fillStyle='#aea084';g.fillRect(x+61,51,5,143);g.fillRect(x+11,115,106,4);
      g.fillStyle='#1b251f';g.fillRect(x+12,202,104,32);g.fillStyle='#998760';g.font='10px serif';g.fillText('FERMÉ',x+64,223);
      g.fillStyle='rgba(0,0,0,.17)';for(let i=0;i<140;i++)g.fillRect(x+(i*73%128),i*29%256,2,1);
    }
  });
  const paving=canvasTex(128,128,(g)=>{
    g.fillStyle='#343b3b';g.fillRect(0,0,128,128);
    for(let y=0;y<4;y++)for(let x=-1;x<5;x++){
      const v=94+((x*7+y*13+31)%17);g.fillStyle=`rgb(${v+7},${v+5},${v})`;g.fillRect(x*32+(y%2)*16+1,y*32+1,30,30);
      g.fillStyle='rgba(220,214,193,.15)';g.fillRect(x*32+(y%2)*16+2,y*32+2,28,2);
    }
  });
  const glow=canvasTex(64,64,(g)=>{
    const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,.7)');r.addColorStop(.35,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);
  });
  PARIS_SCENERY={
    shop:new T.MeshLambertMaterial({map:atlas}),pave:new T.MeshLambertMaterial({map:paving,color:0xc5c0ab}),
    trim:new T.MeshLambertMaterial({color:0xa99d86}),gutter:new T.MeshLambertMaterial({color:0x303a3b}),
    water:new T.MeshBasicMaterial({color:0x6b8994}),
    spill:new T.MeshBasicMaterial({map:glow,color:0xffbd65,transparent:true,opacity:.2,blending:T.AdditiveBlending,depthWrite:false}),
    glowGeo:new T.PlaneGeometry(1,1),shopGeos:[],
  };
  for(let k=0;k<4;k++){
    const geo=new T.PlaneGeometry(3.1,2.45),uv=geo.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setX(i,(k+uv.getX(i))/4);
    PARIS_SCENERY.shopGeos.push(geo);
  }
  PARIS_SCENERY.glowGeo.rotateX(-Math.PI/2);
  return PARIS_SCENERY;
}
RES.pin(()=>PARIS_SCENERY?[...Object.values(PARIS_SCENERY),...PARIS_SCENERY.shopGeos]:[]);
function fountainCollision01(){
  // Sete faixas inscritas na base redonda: sem quadrado invisível nos cantos.
  for(const [a,b,hx] of [[-.65,.65,2.08],[.65,1.3,1.75],[-1.3,-.65,1.75],[1.3,1.8,1.25],[-1.8,-1.3,1.25],[1.8,2.1,.65],[-2.1,-1.8,.65]])addSolidOnly(-hx,hx,a,b,.6,0,true);
  addSolidOnly(-.4,.4,-.4,.4,2.3);
}
function improveParisScenery(L){
  if(L.id!=='01'||G.refs.parisScenery) return;
  const M=parisSceneryMaterials(),info={version:'cp03a',storefronts:0,spills:0};G.refs.parisScenery=info;
  const box=(w,h,d,x,y,z,mat)=>{const m=new T.Mesh(BOX(w,h,d),mat);m.position.set(x,y,z);dressAdd(m);return m;};
  const floor=(w,d,x,z,y,mat)=>{
    const geo=new T.PlaneGeometry(w,d);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,uv=geo.attributes.uv;
    for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+x)/.9,(p.getZ(i)+z)/.9);
    const m=new T.Mesh(geo,mat);m.position.set(x,y,z);dressAdd(m);return m;
  };
  // Calçadas, sarjetas e tampas: planos baixos, sem novos obstáculos nas rotas.
  for(const [z0,z1] of [[8,44],[-46,-8]])for(const side of [-1,1]){
    floor(.82,z1-z0,side*4.55,(z0+z1)/2,.024,M.pave);
    floor(.16,z1-z0,side*4.04,(z0+z1)/2,.026,M.gutter);
    box(.09,.045,z1-z0,side*4.12,.0225,(z0+z1)/2,M.trim);
  }
  floor(1.2,2,13.35,0,.028,M.pave);floor(1.3,4,-4.4,-37,.028,M.pave);
  for(const z of [16,28,36,-12,-22,-40])for(const side of [-1,1]){
    box(.35,.025,.65,side*3.84,.018,z,M.gutter);
    for(let i=0;i<5;i++)box(.29,.012,.025,side*3.84,.036,z-.24+i*.12,M.trim);
  }
  // Vitrines fechadas, pilastras e molduras somente na rua sul.
  // Nada acrescentado diante da porta do posto nem do portão da garagem ao norte.
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const z=14+i*8,shop=new T.Mesh(M.shopGeos[(i+(side>0?2:0))%4],M.shop);
    shop.position.set(side*4.965,1.45,z);shop.rotation.y=side<0?Math.PI/2:-Math.PI/2;dressAdd(shop);info.storefronts++;
    box(.12,.16,3.5,side*4.96,2.77,z,M.trim);
    for(const dz of [-1.72,1.72])box(.12,2.7,.12,side*4.96,1.43,z+dz,M.trim);
    box(.1,.13,3.5,side*4.96,.14,z,M.trim);
  }
  for(const side of [-1,1])for(const z of [10,18,26,34,42]){
    box(.13,9,.2,side*4.97,7.2,z,M.trim);
    for(const y of [3.3,6.5,9.6])box(.2,.16,.48,side*4.95,y,z,M.trim);
  }
  // Fonte: borda de pedra e quatro filetes de água estáticos, fundidos.
  const rim=new T.Mesh(new T.TorusGeometry(2.04,.045,5,32),M.trim);rim.rotation.x=Math.PI/2;rim.position.y=.61;dressAdd(rim);
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2,at=(r,y)=>new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);
    const curve=new T.CatmullRomCurve3([at(.52,1.97),at(.82,1.6),at(1.15,.66)]);
    dressAdd(new T.Mesh(new T.TubeGeometry(curve,8,.014,4,false),M.water));
  }
  // Halo no chão ligado ao lampião destrutível; sem PointLight adicional.
  for(const lamp of W.lamps){
    if(!/^L[1-8]$/.test(lamp.id)) continue;
    const spill=new T.Mesh(M.glowGeo,M.spill);spill.position.set(lamp.x,.045,lamp.z);spill.scale.set(5.6,1,5.6);spill.visible=!lamp.broken;spill.renderOrder=1;scene.add(spill);lamp.spill=spill;info.spills++;
  }
}
