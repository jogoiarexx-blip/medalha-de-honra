'use strict';
// CP-03B: acabamento estático 02–04; não registra sólidos, luzes ou alvos.
let PARIS_EXTENSION=null;
function parisExtensionMaterials(){
  if(PARIS_EXTENSION) return PARIS_EXTENSION;
  const atlas=canvasTex(512,64,g=>{
    for(const [i,label] of ['GARDE','BUREAU','ARCHIVES','HÔTEL DELORME'].entries()){
      const x=i*128;g.fillStyle='#302b23';g.fillRect(x,0,128,64);g.strokeStyle='#a99058';g.lineWidth=3;g.strokeRect(x+5,4,118,56);
      g.fillStyle='#e0c991';g.font='bold 23px serif';g.textAlign='center';g.fillText(label,x+64,40,112);
    }
  });
  PARIS_EXTENSION={stone:new T.MeshLambertMaterial({color:0x9c998c}),edge:new T.MeshLambertMaterial({color:0xc4baa5}),
    wood:new T.MeshLambertMaterial({color:0x4c3c2f}),iron:new T.MeshLambertMaterial({color:0x343a3c}),
    rope:new T.MeshLambertMaterial({color:0x8d8065}),sign:new T.MeshLambertMaterial({map:atlas})};
  return PARIS_EXTENSION;
}
RES.pin(()=>PARIS_EXTENSION?Object.values(PARIS_EXTENSION):[]);
function extendParisScenery(L){
  if(!['02','03','04'].includes(L.id)||G.refs.parisExtension) return;
  const M=parisExtensionMaterials();G.refs.parisExtension={version:'cp03b',level:L.id};
  const put=(geo,mat,x,y,z,ry=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;dressAdd(m);return m;};
  const box=(w,h,d,x,y,z,mat=M.edge)=>put(BOX(w,h,d),mat,x,y,z);
  // Uma placa usa um quarto do atlas; o UV é fundido junto à geometria.
  const plaque=(k,w,h,x,y,z,ry=0)=>{
    const geo=new T.PlaneGeometry(w,h),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,(k+uv.getX(i))/4);
    put(geo,M.sign,x,y,z,ry);
  };
  if(L.id==='02'){
    for(const [x,z,w,d,face] of MAUS02){
      box(w+.16,.18,d+.16,x,3.38,z);box(w+.1,.12,d+.1,x,.1,z,M.stone);
      // Moldura alinhada à face fechada original do mausoléu, sem ocupar rotas.
      const ry={'+z':0,'-z':Math.PI,'+x':Math.PI/2,'-x':-Math.PI/2}[face];
      const nx=Math.sin(ry),nz=Math.cos(ry),tx=Math.cos(ry),tz=-Math.sin(ry),dep=(Math.abs(nx)>.5?w:d)/2+.025;
      for(const s of [-1,1])put(BOX(.12,2.32,.1),M.edge,x+nx*dep+tx*s*.58,1.16,z+nz*dep+tz*s*.58,ry);
      put(BOX(1.4,.18,.16),M.edge,x+nx*dep,2.36,z+nz*dep,ry);
      put(new T.TorusGeometry(.18,.035,5,12),M.stone,x+nx*(dep+.06),2.89,z+nz*(dep+.06),ry);
    }
    // Pedra de capeamento dos muros, mantendo o portão e a abertura do jazigo.
    box(30.2,.14,1.08,-17.8,3.25,-32.5);box(30.2,.14,1.08,17.8,3.25,-32.5);
    box(66,.14,1.08,0,3.25,32.5);box(1.08,.14,64,-32.5,3.25,0);
  }
  if(L.id==='03'){
    // Ombreiras ficam para fora dos vãos; a porta da varanda desliza para leste.
    for(const x of [-1.34,1.34])box(.16,3.15,.14,x,1.58,6.56);
    box(2.85,.2,.2,0,3.18,6.57);box(3.1,.12,.25,0,3.34,6.58);
    plaque(3,2.3,.5,0,4.08,6.52);
    for(const side of [-1,1]){
      for(const [z0,z1] of [[-5.8,-1.2],[1.2,5.9]])box(.07,.22,z1-z0,side*3.8,.13,(z0+z1)/2,M.wood);
      box(.13,.14,11.8,side*3.78,4.08,0);
    }
    // Corredor: acabamento sobre trechos de parede, sem atravessar vãos.
    for(const [a,b] of [[-18,-11],[-9,-1],[1,8],[10,14],[16,18]]){
      box(b-a,.22,.07,(a+b)/2,.13,-9.8,M.wood);box(b-a,.12,.13,(a+b)/2,4.08,-9.77);
    }
    for(const [x,z,k] of [[7,-5.8,0],[-10,-9.8,1],[15,-9.8,2]]){
      for(const dx of [-1.07,1.07])box(.12,2.66,.1,x+dx,1.33,z);
      box(2.28,.13,.12,x,2.72,z);plaque(k,1.1,.3,x,3.04,z+.015);
    }
  }
  if(L.id==='04'){
    // Cornijas nos blocos do cais; a fachada do café mantém os vãos existentes.
    for(const side of [-1,1])for(const [a,b] of (side<0?[[-64,-40],[-28,-22]]:[[-64,-48],[-42,-22]])){
      box(.18,.24,b-a,side*11.94,3.28,(a+b)/2);box(.16,.24,b-a,side*11.94,.2,(a+b)/2,M.stone);
    }
    for(const [z,w] of [[-32,4],[-37,2]]){for(const s of [-1,1])box(.14,3.15,.12,-11.94,1.58,z+s*(w/2+.07));box(.18,.14,w+.28,-11.94,3.18,z);}
    // Cabeços sobre o parapeito, longe da abertura de extração x=6..9.
    for(const x of [-6,0,4,10.5]){
      put(new T.CylinderGeometry(.13,.16,.42,8),M.iron,x,1.18,-64.23);box(.48,.1,.18,x,1.38,-64.23,M.iron);
    }
    // Barcaça: bordas, tábuas e amarração estáticas sobre o casco existente.
    for(const x of [5.1,9.9])box(.12,.22,13.8,x,-1.53,-73,M.wood);
    box(4.8,.22,.12,7.5,-1.53,-79.88,M.wood);box(4.8,.22,.12,7.5,-1.53,-66.12,M.wood);
    for(let z=-78.8;z<-66.6;z+=.65)box(4.7,.012,.025,7.5,-1.588,z,M.wood);
    for(const x of [5.6,9.4]){
      put(new T.CylinderGeometry(.11,.13,.32,7),M.iron,x,-1.45,-67.6);
      const curve=new T.LineCurve3(new T.Vector3(x,1.1,-64.3),new T.Vector3(x,-1.35,-67.6));
      put(new T.TubeGeometry(curve,1,.025,5,false),M.rope,0,0,0);
    }
  }
}
