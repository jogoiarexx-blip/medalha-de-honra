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
test('pelagem não depende das coordenadas UV colapsadas do otimizador',async()=>{
 const a=await fixture(),b=await fixture({shiftUV:true}),hash=f=>{const ar=f.dog._meshy.mesh.geometry.attributes.color.array;return require('node:crypto').createHash('sha256').update(Buffer.from(ar.buffer,ar.byteOffset,ar.byteLength)).digest('hex');};assert.equal(hash(a),hash(b),'cores mudaram ao alterar UV, apesar da geometria idêntica');
});
test('pelagem conserva precisão linear e contraste entre dorso e pernas',async()=>{
 const f=await fixture(),g=f.dog._meshy.mesh.geometry,c=g.attributes.color;assert.ok(c.array instanceof Float32Array,'8 bits lineares criam faixas nas áreas escuras');let min=1,max=0;for(let i=0;i<c.count;i++){const v=c.getX(i);assert.ok(Number.isFinite(v)&&v>=0&&v<=1);min=Math.min(min,v);max=Math.max(max,v);}assert.ok(max-min>.15,'pelagem virou cor única');
});
test('animação conserva morphs compartilhados e não recalcula vértices por quadro',async()=>{
 const f=await fixture(),g=f.dog._meshy.mesh.geometry,before=new Float32Array(g.attributes.position.array);assert.equal(g.morphAttributes.position.length,8);for(let i=0;i<120;i++)f.c.poseDogRig(f.dog,i/60,1/60,{speed:i<60?6:0,resting:i>=60});assert.deepEqual(g.attributes.position.array,before);assert.ok(f.dog._meshy.mesh.morphTargetInfluences.every(v=>Number.isFinite(v)&&v>=0&&v<=1));
});
test('superfície fechada mantém duas faces por aresta',async()=>{
 const f=await fixture(),ix=f.skin.geometry.index.array,edges=new Map();for(let i=0;i<ix.length;i+=3)for(let j=0;j<3;j++){const a=ix[i+j],b=ix[i+(j+1)%3],k=Math.min(a,b)+','+Math.max(a,b);edges.set(k,(edges.get(k)||0)+1);}assert.ok([...edges.values()].every(n=>n===2),'a malha tem rachaduras/arestas não manifold');assert.ok(ix.length/3<=12245,'reparo ultrapassou orçamento original');
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
