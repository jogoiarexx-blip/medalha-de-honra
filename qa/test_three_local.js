'use strict';
// Uso: node qa/test_three_local.js
// Verificacao estatica do motor Three.js local; nao substitui playtest no navegador.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
const three=read('js/vendor/three-r128.min.js');
assert(three.includes('SPDX-License-Identifier: MIT'),'Licenca Three.js nao encontrada');
assert(three.length>580000,'Build Three.js r128 incompleto');
assert(/src="js\/vendor\/three-r128\.min\.js"/.test(html),'Three.js local nao esta no HTML');
assert(!html.includes('cdnjs.cloudflare.com/ajax/libs/three.js'),'Referencia ao CDN antigo');
for(const dep of ['js/vendor/GLTFLoader-r128.js','js/24a-dog-meshy.js','js/25-boot.js']){
  assert(html.includes('src="'+dep+'"'),'Dependencia nao encontrada: '+dep);
}
const positions=['js/vendor/three-r128.min.js','js/vendor/GLTFLoader-r128.js','js/24a-dog-meshy.js','js/25-boot.js']
  .map(p=>html.indexOf('src="'+p+'"'));
assert(positions.every((pos,i)=>i===0||pos>positions[i-1]),'Ordem das bibliotecas e do boot incorreta');
const fx=read('js/05-effects.js'),cemetery=read('js/09-paris-operations-01-03.js');
assert(fx.includes('map:SOFTTEX||null'),'Fallback da textura de particulas ausente');
assert(fx.includes('map:FLASHTEX||null'),'Fallback da textura de disparos ausente');
assert(cemetery.includes('map:TEX.soft2||SOFTTEX||null'),'Fallback da textura de holofotes ausente');
console.log('PASSOU: Three.js r128 local, ordem dos scripts e fallbacks de textura.');
