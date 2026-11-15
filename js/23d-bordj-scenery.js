'use strict';
// CP-03D: sinalização e acabamento estático do forte, sem novos alvos/luzes.
let BORDJ_SCENERY=null;
function bordjSceneryMaterials(){
  if(BORDJ_SCENERY) return BORDJ_SCENERY;
  const atlas=canvasTex(512,256,g=>{
    const labels=['BORDJ EL-HAMRA','SECRETARIA','OPERAÇÕES','CANTINA','COMANDO','RÁDIO','COMBUSTÍVEL','NÃO FUME'];
    labels.forEach((label,i)=>{const x=i%2*256,y=Math.floor(i/2)*64;g.fillStyle=i>5?'#6a3224':'#303e36';g.fillRect(x,y,256,64);g.strokeStyle='#cabb94';g.lineWidth=3;g.strokeRect(x+4,y+4,248,56);g.fillStyle='#e8dfbd';g.font='bold 27px serif';g.textAlign='center';g.fillText(label,x+128,y+42,238);});
  });
  const stripeMap=canvasTex(128,64,g=>{
    g.fillStyle='#d9bb56';g.fillRect(0,0,128,64);g.fillStyle='#242821';
    for(let x=-64;x<192;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x+16,0);g.lineTo(x+80,64);g.lineTo(x+64,64);g.closePath();g.fill();}
  });
  BORDJ_SCENERY={stone:new T.MeshLambertMaterial({color:0xc4a57d}),edge:new T.MeshLambertMaterial({color:0xe4caa2}),iron:new T.MeshLambertMaterial({color:0x3c423b}),sign:new T.MeshLambertMaterial({map:atlas}),stripeMap};
  return BORDJ_SCENERY;
}
RES.pin(()=>BORDJ_SCENERY?Object.values(BORDJ_SCENERY):[]);
function improveBordjScenery(L){
  if(L.id!=='06'||G.refs.bordjScenery) return;
  const M=bordjSceneryMaterials();G.refs.bordjScenery={version:'cp03d',signs:8};
  const put=(geo,mat,x,y,z,ry=0)=>{const mesh=new T.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.rotation.y=ry;dressAdd(mesh);return mesh;};
  const box=(w,h,d,x,y,z,mat=M.edge)=>put(BOX(w,h,d),mat,x,y,z);
  const sign=(i,w,h,x,y,z,ry=0)=>{
    const geo=new T.PlaneGeometry(w,h),uv=geo.attributes.uv,c=i%2,r=Math.floor(i/2);
    for(let j=0;j<uv.count;j++)uv.setXY(j,(c+uv.getX(j))/2,1-(r+1-uv.getY(j))/4);
    put(geo,M.sign,x,y,z,ry);
  };
  // Capeamentos sobre os muros existentes, conservando entradas e escadarias.
  for(const z of [-20.4,20.4]){box(42,.14,1.3,0,6.04,z,M.stone);box(41.6,.12,1.32,0,5.78,z);}
  for(const side of [-1,1])for(const [a,b] of [[-19.8,-2.3],[2.3,19.8]]){
    box(1.3,.14,b-a,side*20.4,6.04,(a+b)/2,M.stone);box(1.32,.12,b-a,side*20.4,5.78,(a+b)/2);
  }
  // Nome do forte no lintel, face voltada à estrada. Depósito na face leste.
  sign(0,3.5,.55,-21.025,5.2,0,-Math.PI/2);
  sign(6,3.3,.5,21.025,5.35,0,Math.PI/2);sign(7,2.5,.35,21.025,4.73,0,Math.PI/2);
  for(const [x,z,y,k] of [[-15,-10.97,0,1],[-5,-10.97,0,2],[3,-10.97,0,3],[11,-12.97,4,4],[17,-12.97,4,5]]){
    for(const dx of [-.69,.69])box(.12,2.4,.1,x+dx,y+1.2,z);
    box(1.5,.12,.12,x,y+2.43,z);sign(k,1.25,.27,x,y+2.82,z+.01);
  }
  // A textura acompanha a própria cancela móvel, inclusive ao carregar aberta.
  const gate=W.doors&&W.doors.barrier;
  if(gate&&gate.mesh){gate.mesh.material.map=M.stripeMap;gate.mesh.material.needsUpdate=true;}
  // Ferragens sobre os postes laterais da cancela, fora da passagem.
  for(const z of [-2.6,2.6]){box(.34,.1,.34,-24,1.08,z,M.iron);box(.1,.22,.36,-24,.7,z,M.iron);}
}
