'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),T=require('../../js/vendor/three-r128.min.js');
const ROOT=path.resolve(__dirname,'../..');
async function loadAsset(){
 global.THREE=T;global.window={URL};require('../../js/vendor/GLTFLoader-r128.js');
 const b=fs.readFileSync(path.join(ROOT,'assets/models/pastor-alemao-animado.glb')),n=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+n).toString()),bin=b.subarray(28+n);
 // Materiais são fornecidos pela fixture; geometria, rig e animação são os bytes reais.
 delete j.images;delete j.textures;delete j.samplers;delete j.materials;for(const m of j.meshes)for(const p of m.primitives)delete p.material;
 const text=Buffer.from(JSON.stringify(j)),js=Buffer.concat([text,Buffer.alloc((4-text.length%4)%4,32)]),out=Buffer.alloc(28+js.length+bin.length);
 out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(js.length,12);out.writeUInt32LE(0x4e4f534a,16);js.copy(out,20);out.writeUInt32LE(bin.length,20+js.length);out.writeUInt32LE(0x004e4942,24+js.length);bin.copy(out,28+js.length);
 return new Promise((resolve,reject)=>new T.GLTFLoader().parse(out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength),'',resolve,reject));
}
async function fixture(options={}){
 const gltf=await loadAsset();let skin;gltf.scene.traverse(o=>{if(o.isSkinnedMesh)skin=o;});
 const rgba=options.rgba||Buffer.alloc(512*512*4);
 if(!options.rgba)for(let y=0;y<512;y++)for(let x=0;x<512;x++){const k=(y*512+x)*4,v=((x>>5)^(y>>5))&1;rgba[k]=v?185:30;rgba[k+1]=v?140:23;rgba[k+2]=v?85:18;rgba[k+3]=255;}
 if(options.shiftUV){skin.geometry.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(skin.geometry.attributes.position.count*2).fill(.99),2));}
 const map=new T.Texture({width:512,height:512});map.flipY=false;skin.material=new T.MeshBasicMaterial({map});
 const T2={...T,GLTFLoader:class{load(url,ok){ok(gltf);}}};
 const c=vm.createContext({T:T2,Math,Uint8Array,Uint16Array,Int16Array,Float32Array,window:{},settings:{chars:'modelo'},scene:new T.Scene(),MENU3D:{scene:new T.Scene()},console,atob:s=>Buffer.from(s,'base64').toString('binary'),document:{createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:rgba})})})}});
 const proc=fs.readFileSync(path.join(ROOT,'js/18-menu-system.js'),'utf8');vm.runInContext(proc.slice(proc.indexOf('let DOG_MATS='),proc.indexOf('/* REV-C')),c);
 const makeOriginal=c.makeDogRig,poseOriginal=c.poseDogRig;
 vm.runInContext(fs.readFileSync(path.join(ROOT,'js/24a-dog-meshy.js'),'utf8'),c);
 const dog=c.makeDogRig(false);c.scene.add(dog.root);
 return {c,dog,skin,gltf,T,makeOriginal,poseOriginal,data:c.window.__PASTOR_MESHY};
}
module.exports={fixture,T,ROOT,loadAsset};
