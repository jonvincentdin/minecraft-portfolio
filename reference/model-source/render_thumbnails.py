from pathlib import Path
import sys,json,numpy as np
from PIL import Image
from voxel_core import Scene
import render_design as r
ROOT=Path(__file__).resolve().parents[1];a=ROOT/'dist/assets';data=json.loads((a/'models/scene-data.json').read_text())
for key,entry in data.items():
 if not (key.startswith('character_') or key.startswith(('item_','material_','skill_','dye_')) or key=='crafting_table'):continue
 s=Scene();s.boxes=entry['boxes'];s.groups=entry['groups'];character=key.startswith('character_');im=Image.new('RGB',(1280,720),(13,17,19));r.render3d(im,s,0,256,443 if character else 256 if key.startswith(('material_','skill_','dye_')) else 420,112 if character else 150,.16 if character else .4,.13 if character else .46,clip=(0,0,512,512),animate=False);arr=np.array(im.crop((0,0,512,512)));alpha=np.where((arr==[13,17,19]).all(axis=2),0,255).astype('uint8');Image.fromarray(np.dstack([arr,alpha])).save(a/'thumbs'/(key+'.png'))
print('Rendered opaque models on transparent PNG backgrounds, no blend effects needed.')
