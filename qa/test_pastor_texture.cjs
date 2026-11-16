'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {fixture,ROOT}=require('./lib/pastor-fixture.cjs');
test('pelagem original acompanha o modelo até o material renderizado',async()=>{
 const f=await fixture(),mesh=f.dog._meshy.mesh;
 assert.equal(mesh.material.map,f.skin.material.map,'a textura foi descartada e substituída por manchas de cor');
 assert.equal(mesh.material.vertexColors,false,'cores espaciais não devem apagar a textura original');
 assert.ok(mesh.geometry.attributes.uv,'modelo sem coordenadas da textura');
 assert.deepEqual(mesh.geometry.attributes.uv.array,f.skin.geometry.attributes.uv.array,'coordenadas originais foram alteradas');
});
test('asset conserva atlas detalhado, UVs e orçamento para celular',()=>{
 const b=fs.readFileSync(path.join(ROOT,'assets/models/pastor-alemao-animado.glb')),n=b.readUInt32LE(12),doc=JSON.parse(b.subarray(20,20+n));
 assert.ok(doc.images?.length,'sem atlas: olhos, focinho e pelos foram apagados');
 const im=doc.images[0],v=doc.bufferViews[im.bufferView];
 assert.ok(v.byteLength>100000,'atlas excessivamente comprimido');
 const p=doc.meshes[0].primitives[0];
 assert.ok(p.attributes.TEXCOORD_0!==undefined,'UV original ausente');
 assert.ok(doc.accessors[p.indices].count/3<=16000,'malha acima do orçamento');
 assert.ok(b.length<1500000,'download do cachorro acima de 1,5 MB');
});
