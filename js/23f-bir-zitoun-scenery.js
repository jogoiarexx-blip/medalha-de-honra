'use strict';
let BIR_SCENERY=null;
function birSceneryMaterials(){
  if(BIR_SCENERY)return BIR_SCENERY;
  const atlas=canvasTex(512,128,g=>{
    ['CISTERNA — BIR ZITOUN','PISTA — LRDG'].forEach((s,i)=>{const y=i*64;g.fillStyle='#4d4537';g.fillRect(0,y,512,64);g.strokeStyle='#c5af86';g.lineWidth=3;g.strokeRect(4,y+4,504,56);g.fillStyle='#eee0bd';g.font='bold 33px serif';g.textAlign='center';g.fillText(s,256,y+43,488);});
  });
  BIR_SCENERY={sign:new T.MeshLambertMaterial({map:atlas}),frame:new T.MeshLambertMaterial({color:0xb8a17d})};return BIR_SCENERY;
}
RES.pin(()=>BIR_SCENERY?Object.values(BIR_SCENERY):[]);
function improveBirZitounScenery(L){
  if(L.id!=='08'||G.refs.birScenery)return;
  const M=birSceneryMaterials();G.refs.birScenery={version:'cp03f'};
  const box=(w,h,d,x,y,z)=>{const m=new T.Mesh(BOX(w,h,d),M.frame);m.position.set(x,y,z);dressAdd(m);};
  for(const [i,x,y,z,w]of [[0,5.97,2.76,9,2.2],[1,48,1.95,21,2.8]]){
    const geo=new T.PlaneGeometry(w,.36),uv=geo.attributes.uv;for(let k=0;k<uv.count;k++)uv.setY(k,(uv.getY(k)+1-i)/2);
    const m=new T.Mesh(geo,M.sign);m.position.set(x,y,z);m.rotation.y=-Math.PI/2;dressAdd(m);
  }
  for(const z of [8.27,9.73])box(.12,2.4,.12,5.96,1.2,z);
  box(.14,.12,1.7,5.95,2.46,9);
  for(const z of [19.8,22.2])box(.1,2,.1,48.03,1,z);
}
