'use strict';
// Execucao: node qa/test_material_paris.js
// Regressao da textura map undefined ao abrir o menu (carrega a operacao 01).
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const city=read('js/23-liberation-operations-21-24.js');
const renderer=read('js/02-renderer.js');
const boot=read('js/25-boot.js');
const mission=read('js/08-mission-framework.js');
const actors=read('js/06-actors.js');
const start=city.indexOf('function parisDress(');
const end=city.indexOf('function planeTree(',start);
assert(start>=0&&end>start,'Funcao parisDress indisponivel');
const dress=city.slice(start,end);
assert(!dress.includes('map:TEX.lime5'),'A decoracao de Paris depende da textura tardia da operacao 05');
assert(dress.includes('corn:new T.MeshLambertMaterial({map:TEX.lime,'),'Cornija deve usar textura criada no boot');
assert(dress.includes('chim:new T.MeshLambertMaterial({map:TEX.lime,'),'Chamine deve usar textura criada no boot');
assert(renderer.includes('TEX.lime=canvasTex('),'Textura local de Paris nao esta sendo criada');
const atTex=boot.indexOf('makeTextures03()');
const atMenu=boot.indexOf('goMenu()');
assert(atTex>=0&&atMenu>atTex,'Menu pode iniciar antes das texturas');
assert(mission.includes('polishLevel(L)'),'Missao deve aplicar acabamento');
assert(actors.includes("['01','02','03','04'].includes(L.id)"),'Acabamento das primeiras operacoes nao foi encontrado');
console.log('PASSOU: fachadas de Paris nao usam mais textura indefinida na operacao 01.');
