'use strict';
// CP-03C: ornamentos estáticos da Medina, fundidos pelo mesclador existente.
let MEDINA_SCENERY=null;
function medinaSceneryMaterials(){
  if(MEDINA_SCENERY) return MEDINA_SCENERY;
  const atlas=canvasTex(512,256,g=>{
    const labels=['LINGERIE','03','04','05','07','08','09','10','11','12','14'];
    for(let i=0;i<labels.length;i++){
      const x=i%4*128,y=Math.floor(i/4)*64;g.fillStyle='#204767';g.fillRect(x,y,128,64);g.strokeStyle='#cbb37a';g.lineWidth=3;g.strokeRect(x+4,y+4,120,56);
      g.fillStyle='#eadab3';g.font='bold 28px serif';g.textAlign='center';g.fillText(labels[i],x+64,y+42,112);
    }
  });
  MEDINA_SCENERY={ivory:new T.MeshLambertMaterial({color:0xe5d6b8}),blue:new T.MeshLambertMaterial({color:0x2c5a7c}),
    tile:new T.MeshLambertMaterial({map:TEX.zellige}),brass:new T.MeshLambertMaterial({color:0xb39a62}),
    water:new T.MeshBasicMaterial({color:0x789ca6}),sign:new T.MeshLambertMaterial({map:atlas})};
  return MEDINA_SCENERY;
}
RES.pin(()=>MEDINA_SCENERY?Object.values(MEDINA_SCENERY):[]);
function improveMedinaScenery(L){
  if(L.id!=='05'||G.refs.medinaScenery) return;
  const M=medinaSceneryMaterials();G.refs.medinaScenery={version:'cp03c',plaques:11};
  const put=(geo,mat,x,y,z,ry=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;dressAdd(m);return m;};
  const box=(w,h,d,x,y,z,mat=M.ivory)=>{
    const geo=BOX(w,h,d);
    if(mat===M.tile){const p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;
      for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/.75,p.getY(i)/.75);}
    return put(geo,mat,x,y,z);
  };
  // Molduras externas nas janelas corrigidas, sempre fora do vão de vidro.
  for(const x0 of [-16,8])for(const offset of [1.4,4.6]){
    const a=x0+offset,b=a+2;
    for(const x of [a-.07,b+.07])box(.12,1.72,.12,x,YT+1.8,14.04);
    box(2.26,.12,.2,(a+b)/2,YT+.94,14.08);box(2.26,.14,.16,(a+b)/2,YT+2.67,14.06);
  }
  // Entrada existente de 3,2 m: ornamentos ao redor, sem estreitar a passagem.
  for(const x of [-1.73,1.73]){box(.16,2.72,.14,x,1.36,14.26);box(.28,.16,.25,x,.08,14.27);}
  box(3.65,.14,.22,0,2.7,14.25);
  for(const x of [-7.85,7.85])box(.18,.28,.18,x,3.38,14.16,M.blue);
  // Pátio: azulejos em faixas, moldura e rodapé encostados à massa das alas.
  for(const side of [-1,1]){
    box(.07,.7,9.6,side*7.965,.65,-1.2,M.tile);box(.12,.1,9.6,side*7.95,1.05,-1.2,M.blue);
    box(.12,.16,9.6,side*7.95,.1,-1.2);
    for(const z of [-5.7,-1.2,3.3]){box(.14,3.35,.18,side*7.96,1.68,z);box(.2,.12,.28,side*7.94,3.38,z);}
  }
  // Fonte: borda e quatro filetes fixos; sem partículas por quadro ou novas luzes.
  const rim=put(new T.TorusGeometry(1.29,.065,5,24),M.ivory,0,.63,-1.5);rim.rotation.x=Math.PI/2;
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2,at=(r,y)=>new T.Vector3(Math.cos(a)*r,y,-1.5+Math.sin(a)*r);
    const curve=new T.CatmullRomCurve3([at(.25,1.36),at(.5,1.1),at(.88,.61)]);
    put(new T.TubeGeometry(curve,6,.012,4,false),M.water,0,0,0);
  }
  const plaque=(i,x,z,ry)=>{
    const geo=new T.PlaneGeometry(.5,.25),uv=geo.attributes.uv,c=i%4,r=Math.floor(i/4);
    for(let j=0;j<uv.count;j++)uv.setXY(j,(c+uv.getX(j))/4,1-(r+1-uv.getY(j))/4);
    put(geo,M.sign,x,YT+1.7,z,ry);
  };
  // Placas nos trechos sólidos ao lado dos vãos, orientadas para o corredor.
  [-11.4,-5.6,1.4,8.4].forEach((z,i)=>plaque(i,-9.88,z-.9,Math.PI/2));
  [-4.6,0,5].forEach((x,i)=>plaque(i+4,x-.9,-9.78,0));
  [-11,-5.2,.6,11].forEach((z,i)=>plaque(i+7,9.88,z-.9,-Math.PI/2));
  // Ferragens discretas no poço do souk (sobre os suportes existentes).
  for(const x of [23.4,24.6])box(.14,.1,.16,x,2.38,-16,M.brass);
}
