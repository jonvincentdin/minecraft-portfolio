"""Original, compact voxel ingredients and skill artifacts for the interactive workbench."""
import json,math
from pathlib import Path
from voxel_core import Scene
from refine_models import mesh,export
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'dist/assets/models'

def b(s,name,p,size,c):s.box(name,p,size,c,'showcase')
def glyph(s,letters,color,z=.16):
 font={'H':['101','101','111','101','101'],'T':['111','010','010','010','010'],'C':['111','100','100','100','111'],'S':['111','100','111','001','111'],'J':['111','001','001','101','111'],'Q':['111','101','101','111','001'],'L':['100','100','100','100','111'],'A':['010','101','111','101','101'],'P':['110','101','110','100','100'],'I':['111','010','010','010','111']}
 unit=.095;w=len(letters)*4-1
 for i,ch in enumerate(letters):
  for y,row in enumerate(font[ch]):
   for x,on in enumerate(row):
    if on=='1':b(s,'glyph',((i*4+x-(w-1)/2)*unit,(2-y)*unit,z),(unit*.94,unit*.94,.035),color)
def token(name,col,letters):
 s=Scene();b(s,'back',(0,0,0),(1.15,1.26,.19),'#303c32');b(s,'enamel',(0,0,.105),(1.02,1.12,.09),col);b(s,'rim_top',(0,.57,.16),(1.08,.08,.07),'#e3cf91');b(s,'rim_bottom',(0,-.57,.16),(1.08,.08,.07),'#816244');b(s,'rim_left',(-.5,0,.16),(.08,1.08,.07),'#c5ad73');b(s,'rim_right',(.5,0,.16),(.08,1.08,.07),'#866540');glyph(s,letters,'#fff1c7',.18);return s

def models():
 out={};s=Scene()
 for y in [-.3,0,.3]:
  b(s,'plank',(0,y,0),(1.36,.27,.24),'#ac7a45')
  for x in [-.50,.50]:b(s,'grain',(x,y+.035,.135),(.22,.035,.025),'#d6a66b')
 out['material_plank']=s;s=Scene()
 for x,y in [(-.27,-.24),(-.14,-.12),(0,0),(.14,.12),(.27,.24)]:
  b(s,'fiber',(x,y,0),(.075,1.0,.075),'#a3b573');b(s,'fiber_tip',(x+.06,y+.42,0),(.19,.16,.09),'#d2d69a')
 b(s,'tie',(0,-.12,.07),(.64,.13,.13),'#d7c48b');out['material_fiber']=s;s=Scene()
 for i in range(32):
  a=2*math.pi*i/32
  b(s,'thread',(math.cos(a)*.4,math.sin(a)*.39,0),(.10,.10,.10),'#e3ddbd')
 for i in range(7):b(s,'loose_thread',(.18+i*.06,-.39-i*.055,0),(.10,.10,.10),'#d7d1b7')
 out['material_string']=s;s=Scene()
 for i in range(14):b(s,'stick',(-.52+i*.08,-.63+i*.095,0),(.17,.18,.17),'#aa7541' if i%3 else '#cd9858')
 out['material_stick']=s;s=Scene()
 for i in range(3):b(s,'paper',(i*.035,i*.045,-i*.06),(1.10,.86,.045),'#e7ddb8' if i==0 else '#bcb38c')
 b(s,'fold',(.45,.31,.04),(.2,.18,.025),'#b6af8e');out['material_paper']=s;s=Scene()
 for x,y,w,h in [(-.26,-.1,.3,.42),(0,0,.34,.64),(.25,-.12,.26,.38)]:b(s,'pigment',(x,y,0),(w,h,.35),'#4a82b2')
 b(s,'spark',(-.05,.15,.2),(.16,.17,.06),'#9ec6df');out['material_pigment']=s;s=Scene()
 b(s,'ingot',(0,0,0),(1.15,.38,.48),'#9caeaa');b(s,'top',(0,.22,0),(.95,.09,.38),'#e1e4d8');b(s,'stamp',(.18,0,.255),(.28,.13,.025),'#637976');out['material_iron']=s
 out['skill_html']=token('html','#ba6340','HT');out['skill_css']=token('css','#427a9e','CS');out['skill_javascript']=token('javascript','#b59d3e','JS')
 s=Scene();b(s,'base',(0,-.66,0),(1.1,.13,.65),'#314f55')
 for angle in [0,math.pi/3,-math.pi/3]:
  for i in range(36):
   a=i*math.pi*2/36;x=math.cos(a)*.64;y=math.sin(a)*.22
   xx=x*math.cos(angle)-y*math.sin(angle);yy=x*math.sin(angle)+y*math.cos(angle)
   b(s,'orbit',(xx,yy,0),(.085,.085,.09),'#68bbc7')
 b(s,'core',(0,0,.06),(.22,.22,.22),'#bbecdf');out['skill_react']=s
 s=Scene()
 for y in [-.37,0,.37]:
  b(s,'data_layer',(0,y,0),(1.08,.25,.7),'#597e72');b(s,'rim',(0,y+.14,0),(1.16,.07,.76),'#b9cdad');b(s,'indicator',(-.34,y,.37),(.10,.08,.035),'#e2c685')
 out['skill_sql']=s;s=Scene()
 for x in [-.47,.47]:
  b(s,'endpoint',(x,0,0),(.36,.65,.44),'#8c9e62');b(s,'port',(x,0,.24),(.19,.3,.05),'#d2df99')
 for y in [-.16,.16]:b(s,'link',(0,y,0),(.66,.08,.09),'#c1bc78')
 b(s,'signal',(0,0,.12),(.15,.15,.15),'#e3ce7c');out['skill_api']=s
 return out
if __name__=='__main__':
 data=json.loads((OUT/'scene-data.json').read_text());report=json.loads((OUT/'topology-report.json').read_text())
 for key,s in models().items():
  m=mesh(s);export(m,OUT/(key+'.glb'),'item');data[key]={'boxes':s.boxes,'groups':s.groups,'mesh':m};report['models'][key]=m['stats']
 (OUT/'scene-data.json').write_text(json.dumps(data,separators=(',',':')));(OUT/'topology-report.json').write_text(json.dumps(report,indent=2));print('Created 13 original workshop ingredient and skill GLBs.')
