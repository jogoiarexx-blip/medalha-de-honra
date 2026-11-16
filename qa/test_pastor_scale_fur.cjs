'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {fixture,T}=require('./lib/pastor-fixture.cjs');
const bounds=(g,frame)=>new T.Box3().setFromBufferAttribute(g.morphAttributes.position[frame]);
test('pose parada cabe no tamanho procedural, sem crescer ao sair da caminhada',async()=>{
 const f=await fixture(),g=f.dog._meshy.mesh.geometry,expected=new T.Box3().setFromObject(f.makeOriginal(false).spine).getSize(new T.Vector3()),size=bounds(g,4).getSize(new T.Vector3());
 for(const axis of ['x','y','z']){assert.ok(size[axis]<=expected[axis]*1.05,axis+' grande: '+size[axis]+' / '+expected[axis]);assert.ok(size[axis]>=expected[axis]*.9,axis+' perdeu proporção');}
});
test('descanso mantém porte do procedural e patas no chão',async()=>{
 const f=await fixture(),d=f.makeOriginal(false);d.restT=1;f.poseOriginal(d,0,.016,{resting:true});const ref=new T.Box3().setFromObject(d.spine),b=bounds(f.dog._meshy.mesh.geometry,5),size=b.getSize(new T.Vector3()),r=ref.getSize(new T.Vector3());
 assert.ok(size.x<=r.x*1.05);assert.ok(size.z<=r.z*1.05);assert.ok(b.max.y<=ref.max.y*1.05);assert.ok(Math.abs(b.min.y)<.015,'patas flutuando/enterradas');
});
test('animação conserva morphs compartilhados e não recalcula vértices por quadro',async()=>{
 const f=await fixture(),g=f.dog._meshy.mesh.geometry,before=new Float32Array(g.attributes.position.array);assert.equal(g.morphAttributes.position.length,8);for(let i=0;i<120;i++)f.c.poseDogRig(f.dog,i/60,1/60,{speed:i<60?6:0,resting:i>=60});assert.deepEqual(g.attributes.position.array,before);assert.ok(f.dog._meshy.mesh.morphTargetInfluences.every(v=>Number.isFinite(v)&&v>=0&&v<=1));
});
test('costuras UV não abrem fraturas grandes na superfície',async()=>{
 const f=await fixture(),g=f.dog._meshy.mesh.geometry,p=g.attributes.position,ix=g.index.array,ids=[],keys=new Map(),points=[],edges=new Map();
 // glTF duplica vértices nas ilhas UV: conferir arestas por posição, não índice.
 for(let i=0;i<p.count;i++){
  const pos=[p.getX(i),p.getY(i),p.getZ(i)],key=pos.map(v=>Math.round(v*1e6)).join(',');
  if(!keys.has(key)){keys.set(key,keys.size);points.push(pos);}ids[i]=keys.get(key);
 }
 for(let i=0;i<ix.length;i+=3)for(let j=0;j<3;j++){
  const a=ids[ix[i+j]],b=ids[ix[i+(j+1)%3]],key=Math.min(a,b)+','+Math.max(a,b);edges.set(key,(edges.get(key)||0)+1);
 }
 let total=0,max=0;
 for(const [key,n] of edges)if(n===1){const [a,b]=key.split(',').map(Number),len=Math.hypot(...points[a].map((v,k)=>v-points[b][k]));total+=len;max=Math.max(max,len);}
 assert.ok(max<.01,'fratura maior que 1 cm: '+max);assert.ok(total<.10,'bordas abertas excessivas: '+total);
 assert.ok(ix.length/3<=16000,'malha ultrapassou orçamento');
});
test('capacete da S1 acompanha o porte original',async()=>{
 const f=await fixture(),ref=f.makeOriginal(true),dog=f.c.makeDogRig(true);f.c.scene.add(dog.root);ref.root.updateMatrixWorld(true);
 const original=ref.head.children.find(o=>o.geometry?.parameters?.thetaLength<Math.PI*.6),cap=dog._meshy.cap;
 assert.ok(cap.position.distanceTo(original.getWorldPosition(new T.Vector3()))<.02,'capacete deslocado');const a=new T.Box3().setFromObject(original).getSize(new T.Vector3()),b=new T.Box3().setFromObject(cap).getSize(new T.Vector3());for(const k of ['x','y','z'])assert.ok(Math.abs(a[k]-b[k])<.02,'capacete fora de escala '+k);
});
test('cada pata mantém contato próximo do chão no repouso do menu',async()=>{
 const f=await fixture(),p=f.dog._meshy.mesh.geometry.morphAttributes.position[5],j=f.skin.geometry.attributes.skinIndex,w=f.skin.geometry.attributes.skinWeight;
 for(const name of ['frontleg2','R_frontleg2','backleg2','R_backleg2']){
  const id=f.skin.skeleton.bones.findIndex(b=>b.name===name);let min=Infinity,count=0;
  for(let i=0;i<p.count;i++)for(let k=0;k<4;k++)if(j.array[i*4+k]===id&&w.array[i*4+k]>.5){min=Math.min(min,p.getY(i));count++;}
  assert.ok(count>4,'pata não identificada '+name);assert.ok(min>=-.01&&min<.035,name+' suspensa em '+min);
 }
});
test('repouso não cria triângulos esticados entre barriga e patas',async()=>{
 const f=await fixture(),g=f.dog._meshy.mesh.geometry,a=g.morphAttributes.position[4],b=g.morphAttributes.position[5],ix=g.index.array;let max=0;
 for(let i=0;i<ix.length;i+=3)for(let k=0;k<3;k++){const u=ix[i+k],v=ix[i+(k+1)%3],len=p=>Math.hypot(p.getX(u)-p.getX(v),p.getY(u)-p.getY(v),p.getZ(u)-p.getZ(v));max=Math.max(max,len(b)/Math.max(1e-8,len(a)));}
 assert.ok(max<1.05,'repouso esticou arestas por fator '+max);
});
