"""Visible-surface voxel meshing: remove covered faces, weld matching vertices, export flat normals."""
import json,math,struct
from pathlib import Path
import numpy as np
from voxel_core import Scene,rgb
import create_expansion as original
import render_design as base
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'dist/assets/models'

def subtract(rect,cut):
 a,b,c,d=rect;u,v,w,z=cut;u=max(a,u);v=max(b,v);w=min(c,w);z=min(d,z)
 if w-u<1e-7 or z-v<1e-7:return [rect]
 result=[]
 if u-a>1e-7:result.append((a,b,u,d))
 if c-w>1e-7:result.append((w,b,c,d))
 if v-b>1e-7:result.append((u,b,w,v))
 if d-z>1e-7:result.append((u,z,w,d))
 return result

def mesh(scene):
 boxes=scene.boxes;bounds=[(np.array(b['p'])-np.array(b['s'])/2,np.array(b['p'])+np.array(b['s'])/2) for b in boxes]
 positions=[];normals=[];colors=[];indices=[];edges={};weld={};quads=0
 for i,b in enumerate(boxes):
  lo,hi=bounds[i]
  for axis in range(3):
   axes=[a for a in range(3) if a!=axis]
   for sign in [-1,1]:
    p=float(lo[axis] if sign<0 else hi[axis]);normal=np.zeros(3);normal[axis]=sign
    rects=[(lo[axes[0]],lo[axes[1]],hi[axes[0]],hi[axes[1]])]
    for j,(l,h) in enumerate(bounds):
     if j==i:continue
     probe=p+sign*1e-6
     coplanar=j>i and abs(float(l[axis] if sign<0 else h[axis])-p)<1e-7
     if l[axis]<probe<h[axis] or coplanar:
      cut=(l[axes[0]],l[axes[1]],h[axes[0]],h[axes[1]])
      rects=[q for rect in rects for q in subtract(rect,cut)]
      if not rects:break
    for a,bv,c,d in rects:
     pts=[]
     for u,v in [(a,bv),(c,bv),(c,d),(a,d)]:
      q=np.zeros(3);q[axis]=p;q[axes[0]]=u;q[axes[1]]=v;pts.append(q)
     if np.dot(np.cross(pts[1]-pts[0],pts[2]-pts[0]),normal)<0:pts.reverse()
     col=np.array(rgb(b['c']))/255;ids=[]
     for q in pts:
      key=tuple(np.round(q,7))+tuple(normal)+tuple(col)
      if key not in weld:
       weld[key]=len(positions);positions.append(q.tolist());normals.append(normal.tolist());colors.append(col.tolist())
      ids.append(weld[key])
     indices.extend([ids[0],ids[1],ids[2],ids[0],ids[2],ids[3]])
     for k in range(4):
      p1=tuple(np.round(pts[k],7));p2=tuple(np.round(pts[(k+1)%4],7));key=tuple(sorted([p1,p2]));edges[key]=[list(p1),list(p2)]
     quads+=1
 return {'positions':positions,'normals':normals,'colors':colors,'indices':indices,'edges':[p for edge in edges.values() for p in edge],'stats':{'boxes':len(boxes),'vertices':len(positions),'triangles':len(indices)//3,'visible_patches':quads,'unique_edges':len(edges)}}

def export(data,path,kind):
 doc={'asset':{'version':'2.0','generator':'JVD visible-surface mesher v5'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':path.stem,'mesh':0}],'meshes':[],'materials':[{'name':'voxel_flat','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':0,'roughnessFactor':.85}}],'accessors':[],'bufferViews':[],'buffers':[]};binary=bytearray()
 def acc(values,typ,ctype=5126,bound=False):
  nonlocal binary
  a=np.asarray(values,dtype='<f4' if ctype==5126 else '<u4');raw=a.tobytes()
  binary+=b'\0'*((-len(binary))%4);off=len(binary);binary+=raw;vi=len(doc['bufferViews']);doc['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':len(raw)})
  ac={'bufferView':vi,'componentType':ctype,'count':len(a),'type':typ}
  if bound:ac.update(min=np.atleast_1d(a.min(axis=0)).tolist(),max=np.atleast_1d(a.max(axis=0)).tolist())
  doc['accessors'].append(ac);return len(doc['accessors'])-1
 pos=acc(data['positions'],'VEC3',bound=True);nor=acc(data['normals'],'VEC3');col=acc(data['colors'],'VEC3');ix=acc(data['indices'],'SCALAR',5125)
 doc['meshes']=[{'primitives':[{'attributes':{'POSITION':pos,'NORMAL':nor,'COLOR_0':col},'indices':ix,'material':0}]}]
 times=np.linspace(0,4 if kind=='character' else 16,65);vals=[]
 for t in times:
  a=2*math.pi*t/times[-1];vals.append([0,.018*math.sin(a),0] if kind=='character' else [0,math.sin(a/2),0,math.cos(a/2)])
 ti=acc(times,'SCALAR',bound=True);va=acc(vals,'VEC3' if kind=='character' else 'VEC4');doc['animations']=[{'name':'idle_loop' if kind=='character' else 'showcase_loop','samplers':[{'input':ti,'output':va,'interpolation':'LINEAR'}],'channels':[{'sampler':0,'target':{'node':0,'path':'translation' if kind=='character' else 'rotation'}}]}]
 doc['buffers']=[{'byteLength':len(binary)}];js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4);binary+=b'\0'*((-len(binary))%4)
 path.write_bytes(struct.pack('<4sII',b'glTF',2,28+len(js)+len(binary))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(binary),b'BIN\0')+binary)

def refined_character(kind):
 s=original.character(kind)
 for b in s.boxes:
  if b['name']=='eye_white':b['p'][1]=2.90;b['p'][2]=.435;b['s']=[.19,.13,.04]
  if b['name']=='pupil':b['p'][1]=2.895;b['p'][2]=.465;b['s']=[.08,.115,.025]
  if b['name']=='fringe':b['s'][1]=.13;b['p'][1]=3.20
 for x in [-.20,.20]:s.box('eyebrow',(x,3.025,.425),(.20,.035,.035),'#503e2e','idle')
 return s

def main():
 data=json.loads((OUT/'scene-data.json').read_text());stats={}
 targets={**{'character_'+k:refined_character(k) for k,_,_,_ in original.CHARACTERS},**{'item_'+k:original.item(k) for k,_,_,_ in original.ITEMS},'crafting_table':base.crafting_table()}
 for key,s in targets.items():
  m=mesh(s);export(m,OUT/(key+'.glb'),'character' if key.startswith('character_') else 'item');data[key]={'boxes':s.boxes,'groups':s.groups,'mesh':m};stats[key]=m['stats']
 (OUT/'scene-data.json').write_text(json.dumps(data,separators=(',',':')));(OUT/'topology-report.json').write_text(json.dumps({'method':'Covered face subtraction, matching-attribute vertex welding, flat unit normals, unique rectangle edges; no triangle diagonals in wireframe','models':stats},indent=2));print('Refined',len(targets),'models; removed covered face fragments and welded vertices.')
if __name__=='__main__':main()
