import json
from pathlib import Path
from voxel_core import Scene
from refine_models import mesh,export
from create_workshop_models import models,b
ROOT=Path(__file__).resolve().parents[1];out=ROOT/'dist/assets/models'
s=Scene();b(s,'cover',(0,0,0),(1.10,1.32,.19),'#987347');b(s,'pages',(0,0,.14),(.94,1.15,.15),'#e4dab8');b(s,'front',(0,0,.25),(1.09,1.31,.07),'#b18f58');b(s,'binding',(-.47,0,.3),(.16,1.32,.10),'#664e34');b(s,'label',(.08,0,.31),(.54,.48,.05),'#e6d9a7');b(s,'label_line',(.08,-.05,.345),(.29,.035,.03),'#957744');new={'material_book':s}
for name,col,shine in [('orange','#d78a42','#f4bf78'),('yellow','#ddc450','#f7e799'),('cyan','#55b6c0','#a7e3e6'),('green','#6d9f56','#b3cf86'),('purple','#9877b4','#cfafe2')]:
 s=models()['material_pigment']
 for box in s.boxes:box['c']=shine if box['name']=='spark' else col
 new['dye_'+name]=s
data=json.loads((out/'scene-data.json').read_text());report=json.loads((out/'topology-report.json').read_text())
for key,s in new.items():
 m=mesh(s);export(m,out/(key+'.glb'),'item');data[key]={'boxes':s.boxes,'groups':s.groups,'mesh':m};report['models'][key]=m['stats']
(out/'scene-data.json').write_text(json.dumps(data,separators=(',',':')));(out/'topology-report.json').write_text(json.dumps(report,indent=2));print('Created blank book and five additional dye models.')
