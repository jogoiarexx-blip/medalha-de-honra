'use strict';
let DEPOT_SCENERY=null;
function depotSceneryMaterials(){
  if(DEPOT_SCENERY) return DEPOT_SCENERY;
  const atlas=canvasTex(512,128,g=>{
    ['BUEIRO — ACESSO','A — ARSENAL','B — TRANSMISSÕES','GERADOR'].forEach((label,i)=>{const x=i%2*256,y=Math.floor(i/2)*64;g.fillStyle='#343d37';g.fillRect(x,y,256,64);g.strokeStyle='#b4a282';g.lineWidth=3;g.strokeRect(x+4,y+4,248,56);g.fillStyle='#e6dabb';g.font='bold 25px serif';g.textAlign='center';g.fillText(label,x+128,y+41,236);});
  });
  DEPOT_SCENERY={sign:new T.MeshLambertMaterial({map:atlas}),edge:new T.MeshLambertMaterial({color:0x9c9784})};return DEPOT_SCENERY;
}
RES.pin(()=>DEPOT_SCENERY?Object.values(DEPOT_SCENERY):[]);
function improveDepotScenery(L){
  if(L.id!=='07'||G.refs.depotScenery) return;
  const M=depotSceneryMaterials();G.refs.depotScenery={version:'cp03e',signs:4};
  const box=(w,h,d,x,y,z)=>{const m=new T.Mesh(BOX(w,h,d),M.edge);m.position.set(x,y,z);dressAdd(m);};
  for(const [k,x,y,z,ry,w] of [[0,-31.72,2.32,14,-Math.PI/2,1.6],[1,-13.98,2.96,-19,Math.PI/2,2],[2,-3.5,2.83,11.97,Math.PI,2.2],[3,-13.5,1.4,1.53,Math.PI,1.2]]){
    const geo=new T.PlaneGeometry(w,.34),uv=geo.attributes.uv,c=k%2,r=Math.floor(k/2);
    for(let i=0;i<uv.count;i++)uv.setXY(i,(c+uv.getX(i))/2,1-(r+1-uv.getY(i))/2);
    const m=new T.Mesh(geo,M.sign);m.position.set(x,y,z);m.rotation.y=ry;dressAdd(m);
  }
  // Ombreiras fora dos vãos existentes; sem cobrir o livro ou a entrada.
  for(const z of [-19.77,-18.23])box(.1,2.55,.1,-13.97,1.28,z);
  box(.14,.12,1.7,-13.96,2.56,-19);
  for(const x of [-4.18,-2.82])box(.1,2.45,.1,x,1.23,11.96);
  box(1.5,.12,.12,-3.5,2.5,11.96);
}
