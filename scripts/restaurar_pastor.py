"""Recupera geometria/UV/atlas do pastor original sem voxelizar a superfície.

blender -b -t 2 -P scripts/restaurar_pastor.py -- original.glb saida.glb atlas.jpg
Fonte: assets-3d-pra-jogos-glb, pastor alemao.glb (blob 15e99c0296967ec9b306943c6376a3abee042099).
O atlas deve ser a imagem original convertida para JPEG 2048 px, qualidade 90, subsampling 2.
Preserva nodes, bind matrices e animação. Decima com UVs por canto, soldando
apenas posições coincidentes antes da redução; não colapsa o atlas por vértice.
"""
import bpy, bmesh, json, struct, sys, hashlib
src, dst, atlas = sys.argv[sys.argv.index('--') + 1:][:3]
raw=open(src,'rb').read();jl=struct.unpack_from('<I',raw,12)[0]
doc=json.loads(raw[20:20+jl]);binary=raw[28+jl:]
CT={5121:('B',1),5123:('H',2),5125:('I',4),5126:('f',4)}
NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def read(i):
    a=doc['accessors'][i];v=doc['bufferViews'][a['bufferView']];code,size=CT[a['componentType']];n=NC[a['type']]
    off=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',size*n)
    return [struct.unpack_from('<'+code*n,binary,off+k*stride) for k in range(a['count'])]
prim=doc['meshes'][0]['primitives'][0];attrs=prim['attributes']
pos=read(attrs['POSITION']);uv=read(attrs['TEXCOORD_0']);ji=read(attrs['JOINTS_0']);we=read(attrs['WEIGHTS_0'])
ix=[v[0] for v in read(prim['indices'])];faces=[ix[i:i+3] for i in range(0,len(ix),3)]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
mesh=bpy.data.meshes.new('Pastor UV original');mesh.from_pydata([tuple(x*100 for x in p) for p in pos],[],faces);mesh.update()
ob=bpy.data.objects.new('Pastor',mesh);bpy.context.collection.objects.link(ob);bpy.context.view_layer.objects.active=ob;ob.select_set(True)
layer=mesh.uv_layers.new(name='UV original')
for loop in mesh.loops:layer.data[loop.index].uv=uv[loop.vertex_index]
groups=[ob.vertex_groups.new(name='joint_'+str(j)) for j in range(len(doc['skins'][0]['joints']))]
for i,(j,w) in enumerate(zip(ji,we)):
    for bone,weight in zip(j,w):
        if weight>0:groups[bone].add([i],weight,'REPLACE')
# Reconecta costuras geométricas sem descartar as UVs distintas dos cantos.
bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7);bm.to_mesh(mesh);bm.free();mesh.update()
mod=ob.modifiers.new('Redução com atlas preservado','DECIMATE');mod.ratio=12000/len(faces)
bpy.ops.object.modifier_apply(modifier=mod.name)
mod=ob.modifiers.new('Triângulos','TRIANGULATE');bpy.ops.object.modifier_apply(modifier=mod.name)
mesh=ob.data
newpos=[];newuv=[];newji=[];newwe=[];newix=[];lookup={}
for poly in mesh.polygons:
    for li in poly.loop_indices:
        vi=mesh.loops[li].vertex_index;v=mesh.vertices[vi];tex=tuple(mesh.uv_layers.active.data[li].uv)
        key=(vi,tex)
        if key not in lookup:
            lookup[key]=len(newpos);newpos.append(tuple(x/100 for x in v.co));newuv.append(tex)
            influences=sorted([(g.group,g.weight) for g in v.groups],key=lambda p:p[1],reverse=True)[:4]
            while len(influences)<4:influences.append((0,0))
            total=sum(w for _,w in influences)
            newji.append(tuple(j for j,_ in influences));newwe.append(tuple(w/total for _,w in influences))
        newix.append((lookup[key],))
# Copia animações/matrizes sem conversão de eixos ou retarget.
animvals={i:read(i) for an in doc['animations'] for s in an['samplers'] for i in [s['input'],s['output']]}
for sk in doc['skins']:animvals[sk['inverseBindMatrices']]=read(sk['inverseBindMatrices'])
oldaccess=doc['accessors'];doc['accessors']=[];doc['bufferViews']=[];chunks=[];offset=0
def payload(data):
    global offset
    view=len(doc['bufferViews']);doc['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(data)})
    block=data+b'\0'*((-len(data))%4);chunks.append(block);offset+=len(block);return view
def add(values,ct,typ):
    code,_=CT[ct];n=NC[typ];v=payload(b''.join(struct.pack('<'+code*n,*p) for p in values))
    a={'bufferView':v,'componentType':ct,'count':len(values),'type':typ}
    if typ in ['VEC3','SCALAR']:a.update(min=[min(p[k] for p in values) for k in range(n)],max=[max(p[k] for p in values) for k in range(n)])
    doc['accessors'].append(a);return len(doc['accessors'])-1
mapping={i:add(vals,oldaccess[i]['componentType'],oldaccess[i]['type']) for i,vals in animvals.items()}
for an in doc['animations']:
    for s in an['samplers']:s['input']=mapping[s['input']];s['output']=mapping[s['output']]
for sk in doc['skins']:sk['inverseBindMatrices']=mapping[sk['inverseBindMatrices']]
prim.clear();prim.update(attributes={'POSITION':add(newpos,5126,'VEC3'),'TEXCOORD_0':add(newuv,5126,'VEC2'),'JOINTS_0':add(newji,5121,'VEC4'),'WEIGHTS_0':add(newwe,5126,'VEC4')},indices=add(newix,5123,'SCALAR'),material=0,mode=4)
doc['images']=[{'bufferView':payload(open(atlas,'rb').read()),'mimeType':'image/jpeg','name':'Pelagem original 2048'}]
doc['textures']=[{'sampler':0,'source':0}];doc['samplers']=[{'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071}]
doc['materials']=[{'name':'Pelagem original','doubleSided':True,'pbrMetallicRoughness':{'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':1}}]
doc.pop('extensionsUsed',None);doc.pop('extensionsRequired',None)
doc['buffers']=[{'byteLength':offset}]
doc['asset']['generator']='Blender / scripts/restaurar_pastor.py'
doc['asset']['extras']={'sourceBlob':'15e99c0296967ec9b306943c6376a3abee042099','sourceSha256':hashlib.sha256(raw).hexdigest(),'textureResolution':2048,'uvPreserved':True}
js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4);binary=b''.join(chunks)
out=struct.pack('<III',0x46546c67,2,28+len(js)+len(binary))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(binary),0x004e4942)+binary
open(dst,'wb').write(out)
print('RESTAURADO',len(newpos),'vértices',len(newix)//3,'triângulos',len(out),'bytes')
