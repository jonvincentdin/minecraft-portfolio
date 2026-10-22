"""Original voxel geometry, glTF 2.0 export, and deterministic motion mockup renderer.
Requires Python 3, numpy, Pillow, and ffmpeg. No network or external art assets.
Used by render_design.py to export the original GLB assets.
"""
import os, math, json, struct, random, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
W,H=1280,720
FPS,DURATION=24,10
COLORS={'grass':'#719e51','grass2':'#86af5c','soil':'#684c39','stone':'#657579','wood':'#8e6744','woodlight':'#b99161','leaf':'#4d814f','leaf2':'#6b9859','mint':'#b9f48c','aqua':'#58d8c2','gold':'#f2c464','dark':'#183734','white':'#efe8ce','purple':'#b399ea'}
def rgb(c):
    c=COLORS.get(c,c).lstrip('#');return tuple(int(c[i:i+2],16) for i in (0,2,4))
def col(c,v=1):return tuple(max(0,min(255,round(i*v))) for i in rgb(c))

class Scene:
    def __init__(self):self.boxes=[];self.groups={}
    def group(self,name,origin=(0,0,0),kind='bob',amplitude=.15,period=4):
        self.groups[name]={'origin':list(origin),'kind':kind,'amplitude':amplitude,'period':period}
    def box(self,name,p,s,c,g=None):self.boxes.append({'name':name,'p':list(p),'s':list(s),'c':COLORS.get(c,c),'g':g})

def terrain(s):
    r=random.Random(33)
    for x in range(-4,5):
        for z in range(-3,4):
            if abs(x)==4 and abs(z)==3:continue
            y=-.05+r.choice([0,0,0,-.13])
            s.box('grass_%s_%s'%(x,z),(x,y,z),(.99,.27,.99),r.choice(['grass','grass2','#759d51']))
            depth=r.choice([.75,1,1.35])
            s.box('earth',(x,y-.25-depth/2,z),(.98,depth,.98),r.choice(['soil','#795b40','#5d4d3f']))
            if abs(x)<3 and abs(z)<3:s.box('stone',(x,-1.7,z),(.98,r.uniform(.6,1.4),.98),r.choice(['stone','#506465','#64726b']))
    for z in range(-3,4):s.box('path',(0,.13,z),(.85,.05,.96),'#c8b787')
    for i in range(18):
        x,z=r.uniform(-4,4),r.uniform(-3,3)
        if abs(x)<.7:continue
        s.box('grass_tuft',(x,.25,z),(.08,.3,.08),'#a0bd66')
        if i%3==0:s.box('flower',(x,.42,z),(.18,.15,.18),r.choice(['white','gold','#d8a0a0']))
    for j,(x,z) in enumerate([(-5.7,1.5),(5.1,-2.2),(-4,-5)]):
        s.group('satellite_%d'%j,(x,-1,z),'bob',.15,5+j)
        s.box('satellite_grass',(x,-1,z),(1.1,.25,1.1),'grass',f'satellite_{j}')
        s.box('satellite_rock',(x,-1.5,z),(.8,.8,.8),'stone',f'satellite_{j}')

def tree(s,x,z,scale=1):
    s.box('tree_trunk',(x,1.1*scale,z),(.45*scale,2.1*scale,.45*scale),'wood')
    for dx,dy,dz,sx,sy,sz in [(0,2.4,0,2.3,1.3,2),(0,3.2,0,1.5,.8,1.4),(-.8,2.1,.2,1,.7,1),(1,2.2,-.1,1,.9,1)]:
        s.box('canopy',(x+dx*scale,dy*scale,z+dz*scale),(sx*scale,sy*scale,sz*scale),'leaf2' if dy>3 else 'leaf')

def clouds(s):
    for i,(x,y,z) in enumerate([(-3,3.7,-4),(3,4,-3.6)]):
        g=f'cloud_{i}';s.group(g,(x,y,z),'drift',.45,10)
        for k,(dx,dy,sx,sy) in enumerate([(-.8,0,1.2,.4),(0,.2,1.6,.7),(1,.05,1,.4)]):s.box('cloud',(x+dx,y+dy,z),(sx,sy,.7),'#b3ccc0',g)

def portal(s,x=0,z=-1.3):
    for xx in [-1.1,1.1]:
        s.box('portal_pillar',(x+xx,1.65,z),(.45,3.3,.5),'dark')
        for yy in [.4,1.5,2.6]:s.box('portal_inlay',(x+xx,yy,z+.28),(.2,.35,.08),'aqua')
    s.box('portal_lintel',(x,3.4,z),(2.65,.5,.6),'dark')
    s.box('portal_crown',(x,3.8,z),(.55,.35,.6),'gold')
    s.group('portal_core',(x,1.75,z),'pulse',.035,3)
    for j in range(7):s.box('portal_light',(x,.4+j*.42,z),(1.72,.37,.12),['#418d89','#4aa79b','#66bca4'][j%3],'portal_core')
    for j in range(3):s.box('portal_step',(x,.15+j*.12,z+1-j*.3),(2.3-j*.2,.18,.5),'stone')

def chest(s,x,z,g='chest_lid'):
    s.box('chest_body',(x,.55,z),(1.35,.8,.9),'wood')
    for dx in [-.58,.58]:s.box('chest_band',(x+dx,.56,z+.46),(.12,.8,.04),'gold')
    s.group(g,(x,.96,z-.45),'hinge',-.6,5)
    s.box('lid',(x,1.05,z),(1.4,.2,.96),'woodlight',g)
    s.box('lock',(x,.8,z+.5),(.2,.28,.09),'gold')

def desk(s,x=0,z=0):
    s.box('desk_top',(x,1.15,z),(2.8,.25,1.4),'woodlight')
    for dx in [-1.1,1.1]:
        for dz in [-.5,.5]:s.box('desk_leg',(x+dx,.58,z+dz),(.2,1.1,.2),'wood')
    s.box('monitor',(x,1.95,z-.2),(1.65,1.15,.18),'dark')
    s.box('monitor_glass',(x,1.97,z-.095),(1.4,.9,.03),'aqua')
    for i in range(4):s.box('code_line',(x-.25,2.25-i*.18,z-.07),(.65+i%2*.3,.04,.025),'white')
    s.box('monitor_stand',(x,1.38,z-.2),(.15,.35,.15),'stone')
    s.box('keyboard',(x,1.3,z+.35),(1.25,.08,.4),'dark')
    s.box('mug',(x+1,1.5,z+.2),(.25,.45,.25),'white')

def avatar(s,x,z):
    s.group('builder',(x,0,z),'bob',.035,3)
    for dx in [-.18,.18]:s.box('boot',(x+dx,.32,z),(.28,.55,.35),'dark','builder')
    s.box('jacket',(x,1,z),(.75,.85,.38),'#d0a15c','builder')
    s.box('head',(x,1.75,z),(.62,.62,.6),'#ddb18b','builder')
    s.box('hair',(x,2.04,z-.04),(.65,.17,.65),'#433b33','builder')
    for dx in [-.13,.13]:s.box('eyes',(x+dx,1.8,z+.31),(.06,.08,.025),'dark','builder')
    for dx in [-.52,.52]:s.box('arm',(x+dx,1,z),(.25,.7,.32),'#d0a15c','builder')

def trophy(s,x,z,g='trophy',color='gold'):
    s.box('plinth',(x,.45,z),(1.35,.7,1.2),'stone')
    s.box('plinth_trim',(x,.83,z),(1.5,.12,1.35),'white')
    s.group(g,(x,1.8,z),'spin',0,7)
    for p,sz in [((0,1,0),(.65,.12,.65)),((0,1.35,0),(.18,.65,.18)),((0,1.8,0),(.85,.45,.65)),((-.55,1.85,0),(.25,.45,.23)),((.55,1.85,0),(.25,.45,.23)),((0,2.05,0),(1.05,.12,.75))]:
        s.box('trophy_piece',(x+p[0],p[1],z+p[2]),sz,color,g)

def crystal(s,x,z,g,color='aqua'):
    s.box('pedestal',(x,.45,z),(1.2,.7,1.2),'stone')
    s.group(g,(x,1.8,z),'spin',0,6)
    for yy,w in [(1.25,.4),(1.55,.7),(1.9,.7),(2.2,.4)]:s.box('crystal',(x,yy,z),(w,.33,w),color,g)

VERT=np.array([[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]])
FACES=[([0,3,2,1],[0,0,-1]),([4,5,6,7],[0,0,1]),([0,4,7,3],[-1,0,0]),([1,2,6,5],[1,0,0]),([3,7,6,2],[0,1,0]),([0,1,5,4],[0,-1,0])]
def transform(g,t):
    R=np.eye(3);ofs=np.zeros(3);scale=1
    phase=2*math.pi*t/g['period'];a=g['amplitude']
    if g['kind']=='bob':ofs[1]=a*math.sin(phase)
    if g['kind']=='drift':ofs[0]=a*math.sin(phase)
    if g['kind']=='pulse':scale=1+a*math.sin(phase)
    if g['kind'] in ['spin','hinge']:
        angle=phase if g['kind']=='spin' else a*(.5-.5*math.cos(phase))
        c,ss=math.cos(angle),math.sin(angle)
        R=np.array([[c,0,ss],[0,1,0],[-ss,0,c]]) if g['kind']=='spin' else np.array([[1,0,0],[0,c,-ss],[0,ss,c]])
    return R,ofs,scale

def export_glb(s,path):
    doc={'asset':{'version':'2.0','generator':'Voxelfolio original procedural asset builder'},'scene':0,'scenes':[{'nodes':[]}],'nodes':[],'meshes':[],'materials':[],'buffers':[],'bufferViews':[],'accessors':[]}
    data=bytearray()
    def acc(a,typ,component=5126,bounds=False):
        nonlocal data
        a=np.asarray(a,dtype='<f4' if component==5126 else '<u2');raw=a.tobytes()
        while len(data)%4:data+=b'\0'
        vi=len(doc['bufferViews']);doc['bufferViews'].append({'buffer':0,'byteOffset':len(data),'byteLength':len(raw)});data+=raw
        ac={'bufferView':vi,'componentType':component,'count':len(a),'type':typ}
        if bounds:ac.update(min=np.atleast_1d(a.min(axis=0)).tolist(),max=np.atleast_1d(a.max(axis=0)).tolist())
        doc['accessors'].append(ac);return len(doc['accessors'])-1
    vv=[];nn=[];ind=[]
    for ids,n in FACES:
        off=len(vv);vv.extend(VERT[ids]);nn.extend([n]*4);ind.extend([off,off+1,off+2,off,off+2,off+3])
    pa=acc(vv,'VEC3',bounds=True);na=acc(nn,'VEC3');ia=acc(ind,'SCALAR',5123)
    cmap={}
    for b in s.boxes:
        c=b['c']
        if c in cmap:continue
        mi=len(doc['materials']);cr=[v/255 for v in rgb(c)]
        mat={'name':c,'pbrMetallicRoughness':{'baseColorFactor':cr+[1],'metallicFactor':0,'roughnessFactor':.85}}
        if c in [COLORS['aqua'],COLORS['mint']]:mat['emissiveFactor']=[v*.15 for v in cr]
        doc['materials'].append(mat);cmap[c]=len(doc['meshes'])
        doc['meshes'].append({'name':'cube_'+c,'primitives':[{'attributes':{'POSITION':pa,'NORMAL':na},'indices':ia,'material':mi}]})
    gids={}
    for name,g in s.groups.items():
        gids[name]=len(doc['nodes']);doc['scenes'][0]['nodes'].append(len(doc['nodes']));doc['nodes'].append({'name':name,'translation':g['origin'],'children':[]})
    for b in s.boxes:
        p=np.array(b['p'])
        if b['g']:p=p-np.array(s.groups[b['g']]['origin'])
        node={'name':b['name'],'mesh':cmap[b['c']],'translation':p.tolist(),'scale':b['s']}
        idx=len(doc['nodes']);doc['nodes'].append(node)
        if b['g']:doc['nodes'][gids[b['g']]]['children'].append(idx)
        else:doc['scenes'][0]['nodes'].append(idx)
    doc['animations']=[]
    for name,g in s.groups.items():
        times=np.linspace(0,g['period'],49);values=[];kind=g['kind'];pathkey='translation'
        for t in times:
            R,ofs,scale=transform(g,t)
            if kind in ['bob','drift']:values.append((np.array(g['origin'])+ofs).tolist())
            elif kind=='pulse':pathkey='scale';values.append([scale]*3)
            else:
                pathkey='rotation';ang=2*math.pi*t/g['period'] if kind=='spin' else g['amplitude']*(.5-.5*math.cos(2*math.pi*t/g['period']))
                values.append([0,math.sin(ang/2),0,math.cos(ang/2)] if kind=='spin' else [math.sin(ang/2),0,0,math.cos(ang/2)])
        ti=acc(times,'SCALAR',bounds=True);va=acc(values,'VEC4' if pathkey=='rotation' else 'VEC3')
        doc['animations'].append({'name':name+'_loop','samplers':[{'input':ti,'output':va,'interpolation':'LINEAR'}],'channels':[{'sampler':0,'target':{'node':gids[name],'path':pathkey}}]})
    doc['buffers']=[{'byteLength':len(data)}]
    js=json.dumps(doc,separators=(',',':')).encode();js+=b' ' *((-len(js))%4);data+=b'\0'*((-len(data))%4)
    blob=struct.pack('<4sII',b'glTF',2,12+8+len(js)+8+len(data))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(data),b'BIN\0')+data
    path.write_bytes(blob)
    return {'file':path.name,'boxes':len(s.boxes),'triangles':len(s.boxes)*12,'animations':[a['name'] for a in doc['animations']],'bytes':len(blob)}

