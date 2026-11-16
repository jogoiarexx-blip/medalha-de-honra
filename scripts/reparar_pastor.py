"""Repara a superfície do pastor sem modificar seu esqueleto ou clipe Walk.

Blender 4.3: blender -b -t 2 -P scripts/reparar_pastor.py -- original.glb saida.glb
O original pode ser extraído do commit 8d5ee5a: git show 8d5ee5a:assets/models/pastor-alemao-animado.glb > original.glb
Voxeliza em unidades de trabalho, suaviza e transfere os pesos por baricêntricas.
O arquivo final dispensa o atlas UV danificado; a pelagem é gerada pelo adaptador.
"""
import bpy, json, struct, sys
from mathutils import Vector
from mathutils.bvhtree import BVHTree
src, dst = sys.argv[sys.argv.index('--') + 1:][:2]
b = open(src, 'rb').read(); jl = struct.unpack_from('<I', b, 12)[0]
doc = json.loads(b[20:20+jl]); binary = b[28+jl:]
components = {5121:('B',1),5123:('H',2),5125:('I',4),5126:('f',4)}
widths = {'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def read(i):
    a=doc['accessors'][i]; v=doc['bufferViews'][a['bufferView']]
    code, size=components[a['componentType']]; n=widths[a['type']]
    off=v.get('byteOffset',0)+a.get('byteOffset',0); stride=v.get('byteStride',size*n)
    return [struct.unpack_from('<'+code*n,binary,off+k*stride) for k in range(a['count'])]
prim=doc['meshes'][0]['primitives'][0]; a=prim['attributes']
points=[Vector(p)*100 for p in read(a['POSITION'])]; flat=[p[0] for p in read(prim['indices'])]
faces=[flat[i:i+3] for i in range(0,len(flat),3)]
joints=read(a['JOINTS_0']); weights=read(a['WEIGHTS_0'])
bvh=BVHTree.FromPolygons(points,faces,all_triangles=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
mesh=bpy.data.meshes.new('Pastor superfície contínua');mesh.from_pydata(points,[],faces);mesh.update()
ob=bpy.data.objects.new('Pastor',mesh);bpy.context.collection.objects.link(ob)
bpy.context.view_layer.objects.active=ob;ob.select_set(True)
ob.data.remesh_voxel_size=.016;ob.data.remesh_voxel_adaptivity=0
bpy.ops.object.voxel_remesh()
s=ob.modifiers.new('Fechar fraturas','SMOOTH');s.factor=.8;s.iterations=3;bpy.ops.object.modifier_apply(modifier=s.name)
s=ob.modifiers.new('Orçamento móvel','DECIMATE');s.ratio=.20;bpy.ops.object.modifier_apply(modifier=s.name)
s=ob.modifiers.new('Triângulos','TRIANGULATE');bpy.ops.object.modifier_apply(modifier=s.name)
newpos=[]; newj=[]; neww=[]
for v in ob.data.vertices:
    p=v.co; near, normal, fi, dist=bvh.find_nearest(p); ids=faces[fi]
    x,y,z=[points[i] for i in ids]; e=y-x; f=z-x; q=near-x
    aa=e.dot(e); ab=e.dot(f); bb=f.dot(f); ac=q.dot(e); bc=q.dot(f); den=aa*bb-ab*ab
    u=(bb*ac-ab*bc)/den if abs(den)>1e-18 else 0
    w=(aa*bc-ab*ac)/den if abs(den)>1e-18 else 0
    bary=[max(0,1-u-w),max(0,u),max(0,w)]; total=sum(bary); bary=[t/total for t in bary]
    influences={}
    for k,i in enumerate(ids):
        norm=sum(weights[i])
        for j,t in zip(joints[i],weights[i]): influences[j]=influences.get(j,0)+bary[k]*t/norm
    keep=sorted(influences.items(),key=lambda x:x[1],reverse=True)[:4]
    while len(keep)<4:keep.append((0,0))
    total=sum(t for _,t in keep); vals=[round(255*t/total) for _,t in keep];vals[0]+=255-sum(vals)
    newpos.append(tuple(p/100));newj.append(tuple(j for j,_ in keep));neww.append(tuple(vals))
newix=[(i,) for f in ob.data.polygons for i in f.vertices]
# Reempacota apenas acessores usados; não carrega a textura e a geometria quebradas.
oldaccess=doc['accessors'];doc['accessors']=[];doc['bufferViews']=[];chunks=[];offset=0;mapping={}
def add(values,ct,typ):
    global offset
    code,_=components[ct]; n=widths[typ]; payload=b''.join(struct.pack('<'+code*n,*v) for v in values)
    view=len(doc['bufferViews']);doc['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(payload)})
    chunks.append(payload+b'\0'*((-len(payload))%4));offset+=len(chunks[-1])
    item={'bufferView':view,'componentType':ct,'count':len(values),'type':typ}
    if typ=='VEC3':item.update(min=[min(v[k] for v in values) for k in range(3)],max=[max(v[k] for v in values) for k in range(3)])
    ix=len(doc['accessors']);doc['accessors'].append(item);return ix
# read() usa os metadados de entrada até a cópia estar pronta.
source_doc=json.loads(b[20:20+jl]);saved=doc
# Copia animações/matrizes diretamente, preservando dados e canais sem retarget.
def copy(i):
    if i in mapping:return mapping[i]
    a=oldaccess[i];v=source_doc['bufferViews'][a['bufferView']];code,size=components[a['componentType']];n=widths[a['type']]
    off=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',size*n)
    vals=[struct.unpack_from('<'+code*n,binary,off+k*stride) for k in range(a['count'])]
    ni=add(vals,a['componentType'],a['type']);mapping[i]=ni
    if a.get('normalized'):doc['accessors'][ni]['normalized']=True
    if 'min' in a:doc['accessors'][ni]['min']=a['min'];doc['accessors'][ni]['max']=a['max']
    return ni
for anim in doc['animations']:
    for s in anim['samplers']:s['input']=copy(s['input']);s['output']=copy(s['output'])
for skin in doc['skins']:skin['inverseBindMatrices']=copy(skin['inverseBindMatrices'])
prim.clear();prim.update(attributes={'POSITION':add(newpos,5126,'VEC3'),'JOINTS_0':add(newj,5121,'VEC4'),'WEIGHTS_0':add(neww,5121,'VEC4')},indices=add(newix,5123,'SCALAR'),mode=4)
doc['accessors'][prim['attributes']['WEIGHTS_0']]['normalized']=True
for key in ['images','textures','samplers','materials']:doc.pop(key,None)
doc['buffers']=[{'byteLength':offset}];doc.setdefault('asset',{})['generator']='Blender 4.3 / scripts/reparar_pastor.py'
doc['asset']['extras']={'repair':'watertight-voxel-weight-transfer','sourceCommit':'8d5ee5a','voxel':.016,'decimate':.20}
js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4);binary=b''.join(chunks)
out=struct.pack('<III',0x46546c67,2,28+len(js)+len(binary))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(binary),0x004e4942)+binary
open(dst,'wb').write(out)
print('REPARADO',len(newpos),'vértices',len(newix)//3,'triângulos',len(out),'bytes')
