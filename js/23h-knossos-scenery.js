'use strict';
let KNOSSOS_SCENERY=null;
function knossosSceneryMaterials(){
  if(KNOSSOS_SCENERY)return KNOSSOS_SCENERY;
  const atlas=canvasTex(512,128,g=>{
    ['SALA DO TRONO','ARMAZÉNS — MUNIÇÃO'].forEach((s,i)=>{const y=i*64;g.fillStyle='#493c32';g.fillRect(0,y,512,64);g.strokeStyle='#c8b38b';g.lineWidth=3;g.strokeRect(4,y+4,504,56);g.fillStyle='#eee0bd';g.font='bold 32px serif';g.textAlign='center';g.fillText(s,256,y+43,488);});
  });
  KNOSSOS_SCENERY={sign:new T.MeshLambertMaterial({map:atlas}),stone:new T.MeshLambertMaterial({map:TEX.lime5,color:0xd1c5a8})};return KNOSSOS_SCENERY;
}
RES.pin(()=>KNOSSOS_SCENERY?Object.values(KNOSSOS_SCENERY):[]);
function improveKnossosScenery(L){
  if(L.id!=='10'||G.refs.knossosScenery)return;
  const M=knossosSceneryMaterials();G.refs.knossosScenery={version:'cp03h'};
  const box=(w,h,d,x,y,z)=>{const m=new T.Mesh(BOX(w,h,d),M.stone);m.position.set(x,y,z);dressAdd(m);};
  for(const [i,x,y,z,ry,w]of [[0,-8.5,Y10+2.83,-15.92,0,2.5],[1,-12.96,Y10+2.6,-8.6,Math.PI/2,2.4]]){
    const geo=new T.PlaneGeometry(w,.36),uv=geo.attributes.uv;for(let k=0;k<uv.count;k++)uv.setY(k,(uv.getY(k)+1-i)/2);
    const m=new T.Mesh(geo,M.sign);m.position.set(x,y,z);m.rotation.y=ry;dressAdd(m);
  }
  for(const x of [-9.74,-7.26])box(.14,2.4,.14,x,Y10+1.2,-15.94);
  box(2.7,.14,.18,-8.5,Y10+2.53,-15.92);
  // Faixas rasas acompanham os sete degraus de cada acesso, sem criar colisores.
  for(let k=0;k<7;k++){
    const y=Y10-.2-k*.2+.013;
    box(5.8,.025,.045,-2,y,22+k*.36+.32);
    box(.045,.025,4.8,30+k*.36+.32,y,-3.5);
    box(4.8,.025,.045,9.5,y,-28-k*.36-.32);
  }
}
