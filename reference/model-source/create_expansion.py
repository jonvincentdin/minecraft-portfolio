"""Original voxel character wardrobe and Minecraft-inspired project symbols."""
from pathlib import Path
import json,math
from PIL import Image, ImageDraw
from voxel_core import Scene,export_glb
import render_design as r
ROOT=r.ROOT
CHARACTERS=[('professional','Professional','Work & collaboration','#97bcae'),('student','School uniform','Education & coursework','#86b8df'),('casual','Casual','Personal projects','#b2ce86'),('builder','Builder','Team projects','#edbd72'),('explorer','Explorer','Learning & community','#c6a5dd')]
ITEMS=[('diamond_pickaxe','Diamond pickaxe','Engineering','Tools'),('diamond_sword','Diamond sword','Problem solving','Tools'),('bow','Bow','Interactive experiences','Tools'),('compass','Compass','Navigation & discovery','Devices'),('clock','Clock','Planning & productivity','Devices'),('potion','Potion','Experiments','Magic'),('enchanted_book','Enchanted book','Learning platforms','Magic'),('redstone','Redstone','Automation','Materials'),('furnace','Furnace','Processing & services','Blocks'),('grass_block','Grass block','Worlds & environments','Blocks'),('lantern','Lantern','Guidance & utilities','Devices'),('emerald','Emerald','Commerce & value','Materials'),('shield','Shield','Security & reliability','Tools'),('ender_pearl','Ender pearl','Connected applications','Magic')]
def character(kind):
 s=Scene();s.group('idle',(0,0,0),'bob',.025,4)
 def b(n,p,z,c):s.box(n,p,z,c,'idle')
 skin='#c99772';hair='#332b25';shirt={'professional':'#263a45','student':'#e9e7d9','casual':'#699469','builder':'#dda14a','explorer':'#aa8c62'}[kind];pants={'professional':'#25343d','student':'#273e5c','casual':'#365565','builder':'#4e504b','explorer':'#56604b'}[kind]
 for x in [-.23,.23]:
  b('trouser',(x,.66,0),(.40,1.08,.44),pants);b('shoe',(x,.12,.07),(.43,.24,.60),'#222d2b');b('sole',(x,.04,.1),(.45,.08,.62),'#acb1a0' if kind=='casual' else '#39403a')
 b('torso',(0,1.72,0),(.94,1.12,.52),shirt)
 for x in [-.67,.67]:
  b('sleeve',(x,1.85,0),(.36,.84,.5),shirt);b('hand',(x,1.28,0),(.33,.33,.43),skin)
 b('neck',(0,2.35,0),(.28,.24,.32),skin);b('head',(0,2.86,0),(.85,.86,.80),skin)
 b('hair_top',(0,3.28,-.04),(.9,.20,.87),hair);b('hair_back',(0,2.98,-.39),(.88,.55,.12),hair);b('fringe',(-.20,3.16,.41),(.46,.22,.08),hair)
 for x in [-.2,.2]:b('eye_white',(x,2.90,.409),(.17,.11,.025),'#efe7d5');b('pupil',(x+.025,2.89,.427),(.075,.105,.025),'#263c35')
 b('nose',(0,2.73,.44),(.12,.14,.12),'#b27f5e');b('mouth',(0,2.60,.41),(.18,.04,.025),'#795640')
 if kind=='professional':
  b('white_shirt',(0,1.98,.277),(.32,.68,.05),'#e8e6d4');b('tie',(0,1.97,.318),(.11,.5,.04),'#ab6e52')
  for x in [-.23,.23]:b('lapel',(x,2.06,.30),(.16,.43,.08),'#415765')
  b('belt',(0,1.22,.28),(.91,.12,.04),'#1a252a');b('buckle',(0,1.22,.31),(.16,.1,.05),'#baaa71')
  b('briefcase',(.86,.76,.08),(.68,.54,.25),'#765139');b('case_trim',(.86,.78,.22),(.64,.06,.03),'#b88d5c');b('handle',(.86,1.08,.08),(.30,.12,.15),'#3b332b')
 if kind=='student':
  for x in [-.12,.12]:b('collar',(x,2.21,.30),(.2,.16,.06),'#cad6d8')
  b('tie',(0,1.98,.32),(.12,.45,.05),'#345c7c');b('pocket',(-.28,1.88,.29),(.22,.25,.04),'#ccd4d1');b('badge',(-.28,1.91,.32),(.09,.10,.02),'#c6ad66')
  b('satchel',(.66,1.12,.18),(.49,.57,.32),'#825d3d');b('satchel_flap',(.66,1.36,.36),(.53,.18,.07),'#ad8555')
  for i in range(9):b('strap',(-.34+i*.10,2.25-i*.12,.3),(.12,.18,.06),'#85623e')
 if kind=='casual':
  b('hood',(0,2.19,-.22),(1.0,.3,.72),'#41694d');b('zipper',(0,1.75,.29),(.04,.8,.03),'#c6d0af');b('pouch',(0,1.43,.31),(.68,.25,.08),'#517d56')
  for x in [-.13,.13]:b('drawstring',(x,2.02,.30),(.04,.3,.04),'#dce0c8')
  for x in [-.48,.48]:b('headphone',(x,2.9,0),(.18,.34,.4),'#263b38');b('ear_pad',(x*1.1,2.9,.02),(.09,.2,.22),'#aac99a')
  b('headband',(0,3.40,0),(1.08,.12,.16),'#263b38')
 if kind=='builder':
  b('helmet',(0,3.36,0),(.99,.35,.91),'#efb74e');b('helmet_brim',(0,3.22,.08),(1.12,.10,1.07),'#c18c32')
  for x in [-.28,.28]:b('reflective_vest',(x,1.8,.30),(.12,.94,.06),'#f0e5a1')
  b('reflective_band',(0,1.60,.34),(.95,.12,.04),'#f0e5a1');b('toolbelt',(0,1.20,.08),(1.03,.18,.64),'#68503b')
  for x in [-.35,.35]:b('tool_pouch',(x,1.03,.37),(.28,.32,.22),'#8c6740')
  b('hammer_handle',(.80,1.18,.12),(.11,.78,.11),'#75583b');b('hammer_head',(.80,1.63,.12),(.46,.23,.22),'#88958d')
 if kind=='explorer':
  b('hat_crown',(0,3.42,-.02),(.93,.32,.85),'#b49a6a');b('hat_brim',(0,3.25,.04),(1.18,.10,1.12),'#c8b284');b('hat_band',(0,3.29,.425),(.94,.10,.04),'#66573e')
  b('backpack',(0,1.8,-.48),(.85,.96,.40),'#465d4c')
  for x in [-.31,.31]:b('packstrap',(x,1.92,.30),(.12,.72,.06),'#586f51')
  b('scarf',(0,2.32,.08),(.57,.18,.60),'#b66d4a');b('scarf_end',(.21,2.07,.33),(.19,.40,.06),'#b66d4a')
  b('map',(-.78,1.32,.35),(.49,.55,.07),'#dbc895');b('map_path',(-.78,1.32,.40),(.07,.36,.03),'#759775')
 return s
PAT={
'diamond_pickaxe':['..AAAAAA...','.ADDDDDAA..','AA....AAD..','.....WAAD..','....WW.AA..','...WW......','..WW.......','.WW........','WW.........'],
'diamond_sword':['.........AA','........ADA','.......ADAA','......ADAA.','.....ADAA..','..A.AD AA...','...AAA.....','..WW.A.....','.WW........','WW.........'],
'bow':['...WW....','..W.SW...','.W..S.W..','W...S..W.','W...S...W','W...S..W.','.W..S.W..','..W.SW...','...WW....'],
'emerald':['...GGG...','..GHHHG..','.GHHHHHG.','GHHGGHHHG','.GHHHHHG.','..GHHHG..','...GGG...'],
'redstone':['....RR...','...RHRR..','..RHHRRR.','.RHRRRRRR','RRRRHRRR.','.RRRRRR..'],
'ender_pearl':['..GGGG...','.GHHHHG..','GHHGGHHG.','GHGGGGHG.','GHGGGGHG.','.GHHHHG..','..GGGG...'],
'shield':['WWWWWWW','WSSSSSW','WSSGSSW','WSSGSSW','WGGGGGW','.WSSSW.','..WSW..','...W...']}
def item(kind):
 s=Scene();s.group('showcase',(0,1.2,0),'spin',0,12)
 def b(n,p,z,c):s.box(n,p,z,c,'showcase')
 if kind in PAT:
  rows=PAT[kind];w=max(map(len,rows));h=len(rows);pal={'A':'#214d4e','D':'#5ed8ce','W':'#947044','S':'#aebbb0','G':'#27675a','H':'#6ae2b6','R':'#9b3435'}
  if kind=='redstone':pal['H']='#ed7264'
  if kind=='ender_pearl':pal.update(G='#244e56',H='#5dada1')
  for y,row in enumerate(rows):
   for x,c in enumerate(row):
    if c in pal:b('pixel',( (x-(w-1)/2)*.18,1.2+((h-1)/2-y)*.18,0),(.182,.182,.20 if kind not in ['emerald','ender_pearl'] else .40),pal[c])
 elif kind in ['compass','clock']:
  for x in range(-4,5):
   for y in range(-4,5):
    if abs(x)+abs(y)>6:continue
    edge=abs(x)==4 or abs(y)==4 or abs(x)+abs(y)==6
    b('rim' if edge else 'dial',(x*.18,1.2+y*.18,0),(.18,.18,.18 if edge else .13),'#b5a876' if edge else '#293d40' if kind=='compass' else '#d3c89c')
  if kind=='compass':
   for i in range(4):b('north',(i*.12,1.2+i*.17,.13),(.14,.2,.06),'#d2685c');b('south',(-i*.12,1.2-i*.17,.13),(.14,.2,.06),'#ced4c1')
  else:
   b('hour',(0,1.43,.13),(.10,.54,.08),'#536569');b('minute',(.25,1.2,.13),(.58,.1,.08),'#536569')
 elif kind=='potion':
  b('bottle',(0,1.10,0),(1.05,.85,.65),'#97b7bb');b('liquid',(0,.95,.35),(.83,.44,.08),'#ad7aca');b('shoulder',(0,1.60,0),(.66,.25,.50),'#c3d7d0');b('neck',(0,1.85,0),(.34,.32,.36),'#b2c8c4');b('cork',(0,2.08,0),(.4,.19,.42),'#b18b5d');b('shine',(-.32,1.25,.35),(.12,.36,.04),'#e3e5cc')
 elif kind=='enchanted_book':
  b('pages',(0,1.2,0),(1.22,1.5,.35),'#e8d4a0')
  for z in [-.23,.23]:b('cover',(0,1.2,z),(1.38,1.65,.13),'#71558a')
  b('spine',(-.65,1.2,0),(.18,1.65,.51),'#b6a070');b('rune',(0,1.2,.31),(.37,.37,.06),'#76c7c2')
  for y in [.54,1.86]:b('binding',(0,y,.31),(1.18,.08,.04),'#c8af72')
 elif kind=='furnace':
  b('stone',(0,1.2,0),(1.48,1.48,1.48),'#788582');b('opening',(0,.94,.76),(.94,.58,.05),'#243735');b('fire',(0,.81,.80),(.68,.20,.04),'#e8a957');b('vent',(0,1.62,.76),(.94,.20,.05),'#394a46')
  for y in [.52,1.2,1.9]:b('stone_joint',(0,y,.76),(1.45,.045,.03),'#a3aea0')
 elif kind=='grass_block':
  b('dirt',(0,1.12,0),(1.5,1.3,1.5),'#805c3e');b('grass',(0,1.85,0),(1.52,.22,1.52),'#86ac59')
  for i in range(5):b('roots',(-.6+i*.30,1.62,.76),(.21,.28+(i%2)*.1,.04),'#698b46')
  for x,y in [(-.4,.8),(.3,1.1),(.6,.65),(-.1,1.3)]:b('soil_detail',(x,y,.76),(.18,.14,.04),'#ab8157')
 elif kind=='lantern':
  b('light',(0,1.1,0),(.74,.94,.74),'#efd184')
  for x in [-.43,.43]:
   for z in [-.43,.43]:b('frame',(x,1.1,z),(.13,1.07,.13),'#485455')
  for y in [.55,1.65]:b('cap',(0,y,0),(1.04,.16,1.04),'#5e6b67')
  b('top',(0,1.83,0),(.55,.20,.55),'#788781')
  for x in [-.24,.24]:b('handle',(x,2.07,0),(.09,.35,.12),'#778a85')
  b('handle_top',(0,2.23,0),(.55,.09,.12),'#778a85')
 return s

def render_asset(s,path,ischar=False):
 im=Image.new('RGB',(1280,720),'#13211e');r.render3d(im,s,0,256,443 if ischar else 420,112 if ischar else 160,.4,.16 if ischar else .35,clip=(0,0,512,512),animate=False)
 im=im.crop((0,0,512,512));im.save(path)

def main():
 out=ROOT/'models';thumbs=ROOT/'previews'/'assets';thumbs.mkdir(exist_ok=True)
 models={};manifest=[]
 for key,label,desc,c in CHARACTERS:
  key='character_'+key;s=character(key.replace('character_',''));models[key]=s;manifest.append(export_glb(s,out/(key+'.glb')));render_asset(s,thumbs/(key+'.png'),True)
 for key,label,desc,cat in ITEMS:
  key='item_'+key;s=item(key.replace('item_',''));models[key]=s;manifest.append(export_glb(s,out/(key+'.glb')));render_asset(s,thumbs/(key+'.png'))
 data={k:{'boxes':s.boxes,'groups':s.groups} for k,s in {**r.SCENES,**models}.items()}
 (ROOT/'models'/'scene-data.json').write_text(json.dumps(data,separators=(',',':')))
 (ROOT/'models'/'expansion-manifest.json').write_text(json.dumps({'owner':'Jon Vincent Din','revision':4,'characters':[{'id':k,'label':l,'category':d,'color':c} for k,l,d,c in CHARACTERS],'items':[{'id':k,'label':l,'meaning':d,'category':c} for k,l,d,c in ITEMS],'models':manifest},indent=2))
 print(f'Created {len(CHARACTERS)} characters and {len(ITEMS)} items; {sum(len(s.boxes) for s in models.values())} cubes.')
if __name__=='__main__':main()
