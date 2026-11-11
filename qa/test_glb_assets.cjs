'use strict';
// Uso: node qa/test_glb_assets.cjs
// Valida, lendo o contêiner binário, todo .glb do repositório: cabeçalho, índices dentro
// da faixa, posições finitas, UV, pesos de skin somando 1, juntas válidas e animações.
// Não avalia aparência: isso continua sendo teste visual no navegador.
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const f=[]; const found=[];
(function walk(d){ for(const e of fs.readdirSync(d,{withFileTypes:true})){ if(e.name==='node_modules'||e.name.startsWith('.git')||e.name==='qa-shots'||e.name==='qa-report') continue; const p=path.join(d,e.name); if(e.isDirectory()) walk(p); else if(/\.glb$/i.test(e.name)) found.push(p); } })(ROOT);
const CT={5120:[Int8Array,1],5121:[Uint8Array,1],5122:[Int16Array,2],5123:[Uint16Array,2],5125:[Uint32Array,4],5126:[Float32Array,4]}, NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
const report=[];
for(const file of found){
  const rel=path.relative(ROOT,file), buf=fs.readFileSync(file), bad=m=>f.push(rel+': '+m);
  if(buf.toString('ascii',0,4)!=='glTF'){ bad('cabeçalho inválido'); continue; }
  if(buf.readUInt32LE(4)!==2) bad('versão glTF diferente de 2');
  if(buf.readUInt32LE(8)!==buf.length){ bad('tamanho declarado diferente do arquivo (truncado?)'); continue; }
  const jl=buf.readUInt32LE(12); if(buf.toString('ascii',16,20)!=='JSON'){ bad('primeiro bloco não é JSON'); continue; }
  let doc; try{ doc=JSON.parse(buf.toString('utf8',20,20+jl)); }catch(e){ bad('JSON ilegível'); continue; }
  const bo=20+jl; const bl=buf.readUInt32LE(bo); if(buf.toString('ascii',bo+4,bo+7)!=='BIN'){ bad('bloco binário ausente'); continue; }
  const bin=buf.subarray(bo+8,bo+8+bl);
  const acc=i=>{ const a=doc.accessors[i], bv=doc.bufferViews[a.bufferView], [T,sz]=CT[a.componentType], n=NC[a.type], stride=bv.byteStride||sz*n, off=(bv.byteOffset||0)+(a.byteOffset||0), out=new Array(a.count*n);
    const dv=new DataView(bin.buffer,bin.byteOffset+off,Math.min(bin.length-off,stride*(a.count-1)+sz*n));
    const rd={5120:'getInt8',5121:'getUint8',5122:'getInt16',5123:'getUint16',5125:'getUint32',5126:'getFloat32'}[a.componentType];
    const norm=a.normalized?{5120:127,5121:255,5122:32767,5123:65535}[a.componentType]:0;
    for(let k=0;k<a.count;k++) for(let c=0;c<n;c++){ const v=dv[rd](k*stride+c*sz,true); out[k*n+c]=norm?v/norm:v; } return {v:out,count:a.count,n}; };
  let verts=0,tris=0;
  for(const [mi,mesh] of (doc.meshes||[]).entries()) for(const [pi,prim] of mesh.primitives.entries()){
    const tag='malha '+mi+'/'+pi+': ', A=prim.attributes; if(A.POSITION===undefined){ bad(tag+'sem POSITION'); continue; }
    const pos=acc(A.POSITION); verts+=pos.count; if(pos.v.some(x=>!Number.isFinite(x))) bad(tag+'posição não finita');
    if(prim.indices!==undefined){ const ix=acc(prim.indices); tris+=ix.count/3; if(ix.count%3) bad(tag+'índices não formam triângulos'); let mx=0, deg=0; for(let k=0;k<ix.count;k+=3){ const a=ix.v[k],b=ix.v[k+1],c=ix.v[k+2]; mx=Math.max(mx,a,b,c); if(a===b||b===c||a===c) deg++; } if(mx>=pos.count) bad(tag+'índice fora da faixa ('+mx+' ≥ '+pos.count+')'); if(deg) bad(tag+deg+' triângulo(s) com índices repetidos'); } else tris+=pos.count/3;
    if(A.TEXCOORD_0!==undefined){ const uv=acc(A.TEXCOORD_0); if(uv.count!==pos.count) bad(tag+'UV com contagem diferente'); if(uv.v.some(x=>!Number.isFinite(x))) bad(tag+'UV não finita'); }
    if(A.NORMAL!==undefined){ const nr=acc(A.NORMAL); if(nr.count!==pos.count) bad(tag+'normais com contagem diferente'); }
    if(A.WEIGHTS_0!==undefined){ const w=acc(A.WEIGHTS_0), j=acc(A.JOINTS_0), nj=doc.skins&&doc.skins[0]?doc.skins[0].joints.length:0; let off=0, bj=0; for(let k=0;k<w.count;k++){ const s=w.v[k*4]+w.v[k*4+1]+w.v[k*4+2]+w.v[k*4+3]; if(Math.abs(s-1)>.02) off++; for(let c=0;c<4;c++) if(w.v[k*4+c]>0&&j.v[k*4+c]>=nj) bj++; } if(off) bad(tag+off+' vértice(s) com pesos que não somam 1'); if(bj) bad(tag+bj+' influência(s) apontando para osso inexistente'); }
  }
  for(const [si,sk] of (doc.skins||[]).entries()){ if(sk.inverseBindMatrices!==undefined){ const ib=acc(sk.inverseBindMatrices); if(ib.count!==sk.joints.length) bad('skin '+si+': matrizes de bind ≠ ossos'); if(ib.v.some(x=>!Number.isFinite(x))) bad('skin '+si+': matriz de bind não finita'); } for(const jn of sk.joints) if(!doc.nodes[jn]) bad('skin '+si+': osso inexistente'); }
  for(const [ai,an] of (doc.animations||[]).entries()){ for(const ch of an.channels){ const s=an.samplers[ch.sampler]; if(!s){ bad('animação '+ai+': canal sem sampler'); continue; } const t=acc(s.input), o=acc(s.output); if(t.v.some((x,k)=>k&&x<t.v[k-1])) bad('animação '+ai+': tempos fora de ordem'); if(o.v.some(x=>!Number.isFinite(x))) bad('animação '+ai+': quadro-chave não finito'); if(ch.target.node===undefined||!doc.nodes[ch.target.node]) bad('animação '+ai+': canal sem nó alvo'); } }
  for(const im of (doc.images||[])){ if(im.bufferView===undefined) continue; const bv=doc.bufferViews[im.bufferView], h=bin.subarray(bv.byteOffset||0,(bv.byteOffset||0)+4); const jpg=h[0]===0xff&&h[1]===0xd8, png=h[0]===0x89&&h[1]===0x50; if(!jpg&&!png) bad('textura embutida em formato não reconhecido'); }
  report.push(rel+' — '+buf.length+' bytes, '+verts+' vértices, '+Math.round(tris)+' triângulos, '+((doc.skins&&doc.skins[0]&&doc.skins[0].joints.length)||0)+' ossos, '+(doc.animations||[]).length+' animação(ões)/'+((doc.animations||[])[0]?doc.animations[0].channels.length:0)+' canais');
}
if(!found.length) f.push('nenhum .glb encontrado');
// contrato do pastor em produção (valores da auditoria, lidos do arquivo)
const dog=path.join(ROOT,'assets/models/pastor-alemao-animado.glb');
if(fs.existsSync(dog)){ const size=fs.statSync(dog).size; if(size>600000) f.push('pastor: GLB de produção passou de 600 KB ('+size+')'); } else f.push('pastor: GLB de produção ausente');
// fallback obrigatório: o código não pode deixar o cão invisível se o GLB falhar
const src=fs.readFileSync(path.join(ROOT,'js/24a-dog-meshy.js'),'utf8');
if(!/DATA\.status='fallback'/.test(src)) f.push('pastor: caminho de fallback procedural ausente');
if(!/settings\.chars==='modelo'/.test(src)) f.push('pastor: GLB não está condicionado ao estilo Modelo 3D');
for(const r of report) console.log('lido: '+r);
if(f.length){ console.error('FALHOU: arquivos GLB'); for(const x of f) console.error('  - '+x); process.exit(1); }
console.log('PASSOU: arquivos GLB — '+found.length+' arquivo(s) com contêiner, índices, UV, pesos e animações íntegros (aparência não é avaliada aqui)');
