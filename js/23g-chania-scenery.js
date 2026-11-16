'use strict';
let CHANIA_SCENERY=null;
function chaniaSceneryMaterials(){
  if(CHANIA_SCENERY)return CHANIA_SCENERY;
  const atlas=canvasTex(512,128,g=>{
    ['KOMMANDANTUR','CAPITANIA','ARSENAL'].forEach((s,i)=>{const x=i%2*256,y=Math.floor(i/2)*64;g.fillStyle='#35463e';g.fillRect(x,y,256,64);g.strokeStyle='#cbbb96';g.lineWidth=3;g.strokeRect(x+4,y+4,248,56);g.fillStyle='#eee3c5';g.font='bold 29px serif';g.textAlign='center';g.fillText(s,x+128,y+42,236);});
  });
  CHANIA_SCENERY={sign:new T.MeshLambertMaterial({map:atlas}),stone:new T.MeshLambertMaterial({map:TEX.stone9,color:0xe5d8bb})};return CHANIA_SCENERY;
}
RES.pin(()=>CHANIA_SCENERY?Object.values(CHANIA_SCENERY):[]);
function improveChaniaScenery(L){
  if(L.id!=='09'||G.refs.chaniaScenery)return;
  const M=chaniaSceneryMaterials();G.refs.chaniaScenery={version:'cp03g'};
  const box=(w,h,d,x,y,z)=>{const m=new T.Mesh(BOX(w,h,d),M.stone);m.position.set(x,y,z);dressAdd(m);};
  // Molduras fora dos vãos, com placas acima da altura das portas.
  for(const [i,x,z,w,ry]of [[0,-34,-20.04,1.6,Math.PI],[1,35,-43.96,1.2,0],[2,40,-20.04,3,Math.PI]]){
    for(const side of [-1,1])box(.12,2.55,.14,x+side*(w/2+.14),1.275,z);
    box(w+.5,.16,.18,x,2.63,z);
    const geo=new T.PlaneGeometry(i===0?2.8:2.2,.42),uv=geo.attributes.uv,c=i%2,r=Math.floor(i/2);
    for(let k=0;k<uv.count;k++)uv.setXY(k,(c+uv.getX(k))/2,1-(r+1-uv.getY(k))/2);
    const sign=new T.Mesh(geo,M.sign);sign.position.set(x,3.03,z+(ry===0?.05:-.05));sign.rotation.y=ry;dressAdd(sign);
  }
}
