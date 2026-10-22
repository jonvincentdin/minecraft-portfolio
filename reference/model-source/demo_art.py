from pathlib import Path
root=Path(__file__).resolve().parents[1]/'dist/assets/demos'
for i,(name,accent,bg) in enumerate([('Atlas','#9ab58b','#132c29'),('Fieldnotes','#cfb27b','#28271f'),('Pulse','#a294c4','#252135')]):
 for v in range(2):
  blocks=''
  if v==0:
   for k in range(3):blocks+=f'<rect x="{270+k*265}" y="170" width="240" height="125" rx="14" fill="{accent}" opacity=".15"/><text x="{292+k*265}" y="205" fill="#bbcac2" font-size="14">{["Overview","In progress","Highlights"][k]}</text><text x="{292+k*265}" y="260" fill="#eee9d8" font-size="35">{["12","04","08"][k]}</text>'
   for k,h in enumerate([40,85,65,115,95,145,160,120,185]):blocks+=f'<rect x="{300+k*75}" y="{570-h}" width="42" height="{h}" rx="5" fill="{accent}" opacity="{.4+k*.06}"/>'
  else:
   for k in range(3):
    blocks+=f'<rect x="{270+k*270}" y="170" width="245" height="410" rx="12" fill="#ffffff" opacity=".04"/>'
    for j in range(3):blocks+=f'<rect x="{286+k*270}" y="{210+j*112}" width="212" height="92" rx="8" fill="{accent}" opacity=".14"/><rect x="{305+k*270}" y="{230+j*112}" width="120" height="9" rx="4" fill="{accent}"/><rect x="{305+k*270}" y="{252+j*112}" width="165" height="6" rx="3" fill="#c5d0c0" opacity=".4"/>'
  svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750"><rect width="1200" height="750" fill="{bg}"/><rect x="25" y="25" width="1150" height="700" rx="20" fill="#0a1517"/><rect x="25" y="25" width="190" height="700" rx="20" fill="{accent}" opacity=".1"/><g font-family="Arial,sans-serif"><text x="55" y="90" fill="{accent}" font-size="24" font-weight="bold">{name}</text><text x="55" y="155" fill="#cbd6c7" font-size="14">Overview</text><text x="55" y="198" fill="#7f9989" font-size="14">Collections</text><text x="55" y="241" fill="#7f9989" font-size="14">Activity</text><text x="55" y="284" fill="#7f9989" font-size="14">Settings</text><text x="270" y="95" fill="#eee9d8" font-size="28" font-weight="bold">{['A clearer view of your day.','Stories, collected.','Make room for progress.'][i]}</text><text x="270" y="128" fill="#819e8b" font-size="14">Illustrative project screen · replace with your actual work</text>{blocks}<text x="270" y="675" fill="#8ca28e" font-size="13">DEMO ARTWORK / NOT A CLAIMED COMPLETED PROJECT</text></g></svg>'''
  (root/f'project-{i+1}-{v+1}.svg').write_text(svg)
