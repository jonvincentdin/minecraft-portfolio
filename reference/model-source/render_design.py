"""Jon Vincent Din: distinct Minecraft-inspired portfolio layouts and 3D assets.
Run with --stills or --videos. Python, NumPy, Pillow, and FFmpeg required.
All geometry and interface drawings are original; no game textures are bundled.
"""
from voxel_core import Scene, tree, avatar, portal, chest, export_glb, transform, VERT, FACES, rgb
from pathlib import Path
import math, random, json, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
W,H,FPS,DURATION=1280,720,24,10
SECTIONS=['home','about','projects','skills','achievements','contact']
NAMES=['Spawn','Profile','Inventory','Crafting','Advancements','Message']
FONT='/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
MONO='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
FONTS={}
def font(n,b=False,m=False):
    key=n,b,m
    if key not in FONTS:FONTS[key]=ImageFont.truetype(str(ROOT/'fonts'/'JVDPixel.ttf') if b and n>=20 else MONO if m else BOLD if b else FONT,n)
    return FONTS[key]
def txt(d,x,y,s,n=16,c='#f2ead5',b=False,m=False):d.text((int(x),int(y)),s,font=font(n,b,m),fill=c)
def center(d,y,s,n=20,c='#f2ead5',b=False,m=False,x=640):txt(d,x-font(n,b,m).getlength(s)/2,y,s,n,c,b,m)
def smooth(x):x=max(0,min(1,x));return x*x*(3-2*x)
def mix(a,b,t):return a+(b-a)*t

def panel(d,box,fill='#b9b8af',light='#e6e3d8',dark='#565952',edge='#161f1e',bevel=4):
    x,y,x2,y2=map(int,box);d.rectangle((x+5,y+7,x2+5,y2+7),fill='#101916');d.rectangle((x,y,x2,y2),fill=edge)
    d.rectangle((x+2,y+2,x2-2,y2-2),fill=fill)
    d.line((x+3,y2-4,x+3,y+3,x2-4,y+3),fill=light,width=bevel)
    d.line((x+5,y2-3,x2-3,y2-3,x2-3,y+5),fill=dark,width=bevel)
    d.line((x+8,y+8,x2-9,y+8),fill=light,width=1)
def slot(d,x,y,size=62,selected=False):
    panel(d,(x,y,x+size,y+size),'#777f72','#3a443c','#d0d4c2',bevel=3)
    if selected:d.rectangle((x-2,y-2,x+size+2,y+size+2),outline='#f1db8a',width=3)
def button(d,x,y,w,label,primary=False,hover=False):
    panel(d,(x,y,x+w,y+44),'#799355' if primary else '#666e66','#c8d39c' if primary else '#a1aa99','#38442d' if primary else '#333d36')
    if hover:d.rectangle((x+5,y+5,x+w-5,y+39),outline='#f7eab2',width=2)
    center(d,y+12,label,14,'#fff7dc',True,x=x+w/2)

PATTERNS={
'pick':['..GGGGGG.','.GGGGGGGG','....SS.GG','...SS....','..SS.....','.SS......','SS.......'],
'gem':['...AA....','..AAAA...','.AAAAAA..','AAAAAAAAA','.AAAAAA..','..AAAA...','...AA....'],
'book':['WWWWWWWW.','WPPWWPPWW','WPPWWPPWW','WPPWWPPWW','WPPWWPPWW','WWWWWWWWW','.WWWWWWW.'],
'screen':['SSSSSSSSS','SAAAAAAAS','SAASSAAAS','SAAAAAAAS','SSSSSSSSS','....S....','..SSSSS..'],
'chest':['WWWWWWWWW','WGGGGGGGW','WWWWWWWWW','WGGGWGGGW','WGGGWGGGW','WGGGGGGGW','WWWWWWWWW'],
'feather':['......PP.','.....PPPP','....PPPP.','...PPPP..','..PPPP...','.SPP.....','SS.......'],
'craft':['WWWWWWWWW','WGWWGWWGW','WWWWWWWWW','WGWWGWWGW','WWWWWWWWW','WGWWGWWGW','WWWWWWWWW'],
'star':['....G....','...GGG...','GGGGGGGGG','.GGGGGGG.','..GGGGG..','.GGG.GGG.','.GG...GG.'],
'code':['..A...A..','.A.....A.','A...G...A','.A.....A.','..A...A..'],
'map':['PPPPPPPPP','PAGGGGGGP','PAGGSSGGP','PAAAASGGP','PGGGASGGP','PGGGAAAAP','PPPPPPPPP'],
'lock':['..SSSS...','.SS..SS..','.SS..SS..','GGGGGGGG.','GGGSSGGG.','GGGSSGGG.','GGGGGGGG.'],
}
def icon(d,x,y,name,size=36):
    p=PATTERNS[name];u=max(2,int(size/9));colors={'W':'#67462d','G':'#d7aa59','S':'#343c38','A':'#5cd2c6','P':'#eadbb0'}
    for j,row in enumerate(p):
        for i,c in enumerate(row):
            if c!='.':d.rectangle((int(x+i*u),int(y+j*u),int(x+(i+1)*u-1),int(y+(j+1)*u-1)),fill=colors[c])

def crafting_table():
    s=Scene();g='crafting_table';s.group(g,(0,1,0),'spin',0,16)
    s.box('timber_core',(0,1,0),(2,2,2),'#7d4c2f',g)
    for x in [-.9,.9]:
        for z in [-.9,.9]:s.box('dark_corner',(x,.95,z),(.22,1.9,.22),'#4d3324',g)
    s.box('top_dark_border',(0,2.025,0),(2.1,.1,2.1),'#4e3024',g)
    for i in range(3):
        for j in range(3):
            x,z=(i-1)*.59,(j-1)*.59
            s.box(f'grid_cell_{i}_{j}',(x,2.09,z),(.51,.04,.51),'#b97e48' if (i+j)%2 else '#ce985a',g)
            s.box('top_grain',(x-.13,2.115,z+.12),(.2,.012,.04),'#9e693e',g)
    for face in range(4):
        for row in range(4):
            for i in range(5):
                x=(i-2)*.33;y=.26+row*.42;c=['#b17b45','#ae7442','#9e683b'][(i+row+face)%3]
                p=(x,y,1.01) if face==0 else (x,y,-1.01) if face==1 else (1.01,y,x) if face==2 else (-1.01,y,x)
                size=(.3,.35,.025) if face<2 else (.025,.35,.3);s.box('side_plank',p,size,c,g)
        for j,row in enumerate(PATTERNS['pick' if face%2==0 else 'feather']):
            for i,ch in enumerate(row):
                if ch=='.':continue
                x=(i-4)*.13;y=1.5-j*.13
                p=(x,y,1.04) if face==0 else (x,y,-1.04) if face==1 else (1.04,y,x) if face==2 else (-1.04,y,x)
                size=(.13,.13,.025) if face<2 else (.025,.13,.13)
                s.box('tool_pixel',p,size,'#433025' if ch=='S' else '#d7bb80',g)
    return s

def landscape():
    s=Scene();r=random.Random(41)
    for x in range(-10,11):
        for z in range(-3,4):
            ht=.2+(.7 if abs(x)>6 else 0)+(.6 if z<0 else 0)
            if x in [-1,0,1]:ht=.05
            s.box('ground',(x,ht/2-.4,z),(1,ht+.9,1),r.choice(['#526c3d','#637d43','#71924f']))
            if x in [-1,0,1]:s.box('river',(x,.075,z),(.98,.08,.98),r.choice(['#3a7275','#46888a']))
            if z==3:s.box('soil',(x,-.85,z),(.99,.55,.99),'#5a4435')
    for x,z,sc in [(-8,-1,1.3),(-5,0,1),(-3,-2,.8),(5,-1,1.1),(8,1,1.25),(10,-2,1.3)]:tree(s,x,z,sc)
    for x in [-1,0,1]:s.box('bridge',(x,.4,1),(1,.2,1.4),'woodlight')
    for i in range(6):
        x=-10+i*4;g=f'distant_cloud_{i}';s.group(g,(x,6,-9),'drift',.6,10+i);s.box('cloud',(x,6,-9),(3,.35,1.3),'#859c82',g)
    return s

def project_item(i):
    s=Scene();g='project_item';s.group(g,(0,1,0),'spin',0,12)
    # Original collectible objects represent project categories, not actual game items.
    if i==0:
        s.box('device',(0,1,0),(2,1.4,.25),'#394d47',g);s.box('screen',(0,1,.14),(1.7,1.1,.04),'#70bfac',g)
        for j in range(3):s.box('code',(-.25,1.3-j*.25,.18),(.8-j*.12,.07,.02),'#d7e5b3',g)
        s.box('stand',(0,.16,0),(.3,.4,.3),'#586e5e',g);s.box('foot',(0,-.05,0),(1,.15,.6),'#586e5e',g)
    elif i==1:
        s.box('book_cover',(0,1,0),(1.5,1.9,.35),'#7b527f',g);s.box('pages',(.1,1,.2),(1.2,1.65,.12),'#dfcf9c',g)
        s.box('spine',(-.66,1,0),(.22,1.92,.42),'#4d3958',g)
        for j in range(4):s.box('page_lines',(.1,1.5-j*.28,.27),(.8,.035,.02),'#ae9969',g)
    else:
        for y,w in [(.25,.4),(.6,.8),(1,1.1),(1.4,.8),(1.75,.4)]:s.box('gem',(0,y,0),(w,.35,w),'#6bcabc',g)
    return s

def book_model():
    s=Scene();s.group('open_book',(0,.3,0),'bob',.06,4)
    for x in [-.95,.95]:
        s.box('leather_cover',(x,.2,0),(1.9,.18,2.5),'#623c32','open_book');s.box('page_block',(x,.35,0),(1.75,.22,2.3),'#dfc990','open_book')
        for j in range(6):s.box('text_rule',(x,.47,-.75+j*.28),(1.2,.015,.025),'#9b835a','open_book')
    s.box('spine',(0,.38,0),(.16,.25,2.5),'#8b5838','open_book');return s

def scenes():
    av=Scene();avatar(av,0,0);po=Scene();portal(po,0,0);tr=Scene();tree(tr,0,0);ch=Scene();chest(ch,0,0)
    return {'home_landscape':landscape(),'player_avatar':av,'project_device':project_item(0),'project_book':project_item(1),'project_crystal':project_item(2),'crafting_table':crafting_table(),'open_book':book_model(),'contact_portal':po,'tree':tr,'chest':ch}
SCENES=scenes()

def render3d(im,s,t,cx,cy,zoom,yaw=.6,elev=.45,clip=None,animate=True):
    if not hasattr(s,'cache'):
        vs=np.array([VERT*np.array(b['s'])+np.array(b['p']) for b in s.boxes]);s.cache=(vs,np.array([[rgb(b['c'])]*6 for b in s.boxes]),{g:np.array([i for i,b in enumerate(s.boxes) if b['g']==g]) for g in s.groups})
    vertices,colors,groups=s.cache;v=vertices.copy();norms=np.broadcast_to(np.array([n for _,n in FACES]),(len(v),6,3)).copy().astype(float)
    for name,ids in groups.items():
        g=s.groups[name];R,ofs,scale=transform(g,t if animate else 0);origin=np.array(g['origin']);v[ids]=(v[ids]-origin)@R.T*scale+origin+ofs;norms[ids]=norms[ids]@R.T
    view=np.array([math.sin(yaw)*math.cos(elev),math.sin(elev),math.cos(yaw)*math.cos(elev)]);right=np.array([math.cos(yaw),0,-math.sin(yaw)]);up=np.cross(view,right)
    ids=np.array([f for f,_ in FACES]);faces=v[:,ids,:];dep=faces.mean(axis=2)@view;vis=norms@view>0
    poly=np.stack([cx+faces@right*zoom,cy-faces@up*zoom],axis=-1);light=.62+.38*np.maximum(0,norms@np.array([-.35,.86,.35]));colors=np.clip(colors*light[:,:,None],0,255).astype('uint8')
    # Per-pixel orthographic depth avoids large cube faces hiding raised details.
    polys=poly[vis];depth_vertices=(faces@view)[vis];cs=colors[vis]
    arr=np.array(im);depthbuffer=np.full((H,W),-np.inf,dtype=np.float32)
    clip=clip or (0,0,W,H)
    for quad,depths,color in zip(polys,depth_vertices,cs):
        x0=max(clip[0],int(np.floor(quad[:,0].min())));x1=min(clip[2],int(np.ceil(quad[:,0].max()))+1)
        y0=max(clip[1],int(np.floor(quad[:,1].min())));y1=min(clip[3],int(np.ceil(quad[:,1].max()))+1)
        if x1<=x0 or y1<=y0:continue
        a=quad[1]-quad[0];b=quad[3]-quad[0];det=a[0]*b[1]-a[1]*b[0]
        if abs(det)<1e-8:continue
        yy,xx=np.ogrid[y0:y1,x0:x1];dx=xx+.5-quad[0,0];dy=yy+.5-quad[0,1]
        u=(dx*b[1]-dy*b[0])/det;v=(a[0]*dy-a[1]*dx)/det
        depth=depths[0]+u*(depths[1]-depths[0])+v*(depths[3]-depths[0])
        z=depthbuffer[y0:y1,x0:x1];mask=(u>=0)&(u<=1)&(v>=0)&(v<=1)&(depth>z)
        z[mask]=depth[mask];arr[y0:y1,x0:x1][mask]=color
    im.paste(Image.fromarray(arr))

def background(top,bottom,stone=False):
    arr=np.zeros((H,W,3),dtype='uint8');a=np.array(rgb(top));b=np.array(rgb(bottom))
    for y in range(H):arr[y]=a+(b-a)*(y/H)
    im=Image.fromarray(arr)
    if stone:
        d=ImageDraw.Draw(im);r=random.Random(6)
        for y in range(0,H,32):
            for x in range(-32,W,64):
                xx=x+(32 if y%64 else 0);v=r.randrange(6);d.rectangle((xx,y,xx+62,y+30),fill=tuple(int(k+v) for k in a))
    return im
BGS={'home':background('#122e2a','#81976c'),'about':background('#263c31','#4b5c41'),'projects':background('#1d272d','#2c393b',True),'skills':background('#241c17','#4d3825'),'achievements':background('#242a25','#2b3029',True),'contact':background('#151329','#3b3151')}
def header(d,kind):
    d.rectangle((0,0,1280,75),fill='#0e1816');d.line((32,74,1248,74),fill='#546252');txt(d,32,23,'JVD',25,'#e3cf92',True);txt(d,104,28,'JON VINCENT DIN',12,'#cad1b9',m=True)
    x=425
    for i,k in enumerate(SECTIONS):
        label=NAMES[i];w=font(12,m=True).getlength(label)
        if k==kind:d.rectangle((x-10,21,x+w+10,53),fill='#3f5138',outline='#bac18a')
        txt(d,x,31,label,12,'#f0e5bc' if k==kind else '#a7b8a1',m=True);x+=w+35
    txt(d,1142,31,'PAUSE II',10,'#a3b48f',m=True)
def footer(d,label):
    txt(d,34,691,'JVD / CREATIVE MODE',11,'#a9b49d',m=True);txt(d,810,691,label,9,'#a9b49d',m=True)
def cursor(d,x,y):d.polygon([(x,y),(x,y+19),(x+6,y+14),(x+11,y+21),(x+15,y+18),(x+10,y+11),(x+19,y+11)],fill='#fff4d6',outline='#273729')

def home(t):
    im=BGS['home'].copy();d=ImageDraw.Draw(im);d.rectangle((1115,130,1168,183),fill='#d6ce97')
    for i in range(8):
        x=-100+i*200;hh=90+(i%3)*25;d.rectangle((x,380-hh,x+225,425),fill='#426456');d.rectangle((x+30,350-hh,x+180,425),fill='#426456')
    render3d(im,SCENES['home_landscape'],t,640,644,47,.05+.025*math.sin(t*.3),.22,clip=(0,370,1280,680))
    d=ImageDraw.Draw(im);header(d,'home');center(d,110,'WELCOME TO MY WORLD',13,'#dfd49b',m=True)
    off=14*(1-smooth(t));center(d,150+off,'JON VINCENT DIN',64,'#182a24',True,x=645);center(d,145+off,'JON VINCENT DIN',64,'#f0e9c8',True)
    center(d,238,'Ideas. Experiments. Builds worth exploring.',18,'#dce5c8');button(d,430,290,205,'Enter my world',True,t>5);button(d,649,290,205,'Browse projects');center(d,354,'SCROLL TO BEGIN YOUR ADVENTURE',10,'#e2e5bd',m=True)
    for i,ic in enumerate(['map','book','chest','craft','star','feather']):
        x=436+i*68;slot(d,x,598,60,i==0);icon(d,x+13,611,ic,36);txt(d,x+4,600,str(i+1),9,'#eef3cf',m=True)
    center(d,670,'A portfolio by Jon Vincent Din',12,'#d8dfc6',m=True)
    if t>4:cursor(d,int(mix(920,552,smooth((t-4)/1.2))),int(mix(420,318,smooth((t-4)/1.2))))
    return im

def about(t):
    im=BGS['about'].copy();d=ImageDraw.Draw(im);header(d,'about')
    # Field-journal / character-sheet composition, without inventory slots.
    txt(d,69,112,'MEET THE PLAYER',34,b=True);txt(d,71,162,'The person behind the builds.',15,'#d0d8b9')
    panel(d,(70,213,394,644),'#263b2d','#7d8965','#15241b')
    txt(d,96,236,'CHARACTER PREVIEW',11,'#bbcca3',m=True)
    render3d(im,SCENES['player_avatar'],t,230,568,130,.35+math.sin(t*.6)*.35,.13,clip=(85,277,380,577))
    d=ImageDraw.Draw(im);center(d,598,'JON VINCENT DIN',15,'#dedcba',True,x=232)
    # Broad parchment journal, with annotations and tabs instead of a repeated hero layout.
    d.polygon([(433,205),(1204,220),(1190,640),(443,626)],fill='#d4c497');d.line((465,236,465,600),fill='#b8a071',width=2)
    txt(d,490,246,'A little about me.',32,'#3e452c',True)
    for y,s in zip([306,338,370],['I like turning ideas into things you can use.','This is my space for projects, experiments,','and everything I learn along the way.']):txt(d,491,y,s,18,'#5c5b3d')
    d.line((492,418,1146,418),fill='#a49465')
    topics=['WHAT I BUILD','WHAT I EXPLORE','WHAT COMES NEXT'];active=min(2,int(t/3.4));body=['Useful digital experiences.','Ideas, interfaces, and new tools.','The next project starts with curiosity.']
    for i,label in enumerate(topics):
        x=491+i*215;d.rectangle((x,449,x+200,480),fill='#65704b' if i==active else '#baa97a');txt(d,x+10,459,label,10,'#f2e8c5' if i==active else '#5c5b3d',m=True)
    txt(d,492,507,body[active],21,'#41492f',True);txt(d,493,556,'Editable biography copy — add your actual role and story.',12,'#81754d')
    txt(d,492,594,'FIELD NOTES / 01',10,'#81754d',m=True);icon(d,1100,550,'feather',54)
    footer(d,'02 / CHARACTER + FIELD JOURNAL')
    return im

def projects(t):
    im=BGS['projects'].copy();d=ImageDraw.Draw(im);header(d,'projects')
    txt(d,49,107,'PROJECT INVENTORY',34,b=True);txt(d,51,157,'Select an item. Discover what I built.',14,'#bec7b8')
    # Minecraft-style 9-column chest inventory with a separate inspection panel.
    panel(d,(48,205,823,647),'#b9bcb0','#e9e9d9','#555e50')
    txt(d,74,227,'Project chest',22,'#34402e',True);txt(d,75,265,'COLLECTION / SELECT A PROJECT ITEM',10,'#59664f',m=True)
    positions={0:(0,0),1:(2,0),2:(4,0),3:(1,1),4:(3,1),5:(6,1)}
    selected=[0,1,2][min(2,int(t/3.4))];icons=['screen','book','gem','code','map','feather'];names=['PROJECT 01','PROJECT 02','PROJECT 03','PROJECT 04','PROJECT 05','PROJECT 06']
    for j in range(3):
        for i in range(9):slot(d,75+i*79,298+j*79,70,positions[selected]==(i,j))
    for k,(i,j) in positions.items():
        x=75+i*79;y=298+j*79;bob=int(3*math.sin(t*2)) if k==selected else 0;icon(d,x+16,y+19+bob,icons[k],36);txt(d,x+53,y+51,str(k+1),11,'#e8e4c6',m=True)
    txt(d,75,555,'QUICK ACCESS',10,'#58644d',m=True)
    for i,ic in enumerate(['chest','screen','book','gem','code','map','feather','craft','star']):slot(d,75+i*79,578,52,i==0);icon(d,85+i*79,591,ic,27)
    # Item-style tooltip appears above the current slot, clear of the grid.
    ix,iy=positions[selected];x=76+ix*79;y=299+iy*79
    if (t%3.4)>.9:
        tw=211;tx=min(x+23,587);ty=y+64;d.rectangle((tx,ty,tx+tw,ty+78),fill='#1d142b',outline='#80739b',width=2)
        txt(d,tx+12,ty+10,names[selected],15,'#d3b8f3',True);txt(d,tx+12,ty+35,['Web application','Interface study','Creative experiment'][selected],12,'#c4c0d1');txt(d,tx+12,ty+56,'Click to inspect',10,'#a2a59a',m=True)
        cursor(d,x+52,y+40)
    panel(d,(854,205,1232,647),'#202b27','#66765a','#111c17')
    txt(d,878,229,'ITEM DETAILS',11,'#afc09c',m=True)
    model=['project_device','project_book','project_crystal'][selected]
    render3d(im,SCENES[model],t*.55,1045,423,81,.5,.23,clip=(869,268,1218,437))
    d=ImageDraw.Draw(im);txt(d,878,448,names[selected],23,'#e1d59e',True);txt(d,879,488,['Web application','Interface study','Creative experiment'][selected],14,'#bfcdb1')
    txt(d,879,516,'Summary • tools • process',12,'#99ae91');button(d,878,554,329,'Inspect project',True);txt(d,880,613,'Sample projects — replace with yours.',10,'#8ea287')
    footer(d,'03 / PROJECT INVENTORY    •    HOVER + SELECT')
    return im

def skills(t):
    im=BGS['skills'].copy();d=ImageDraw.Draw(im);header(d,'skills')
    txt(d,52,106,'CRAFTING IDEAS INTO REALITY',31,b=True);txt(d,55,153,'Combine the right tools. Create something useful.',14,'#cdbb99')
    panel(d,(51,199,791,655),'#bbb8a8','#ede7d4','#5f5b4d');txt(d,81,222,'Crafting',23,'#343a30',True);txt(d,82,256,'THE TOOLKIT / INTERACTIVE RECIPE',10,'#5b624d',m=True)
    recipe=min(2,int(t/3.4));phase=t%3.4;labels=[['HTML','CSS','JS'],['API','SQL','LOGIC'],['UI','UX','FIGMA']][recipe];icnames=[['code','gem','pick'],['chest','map','code'],['book','feather','gem']][recipe]
    for j in range(3):
        for i in range(3):slot(d,85+i*74,292+j*74,66)
    for i in range(3):
        ex=98+i*74;ey=380;q=smooth((phase-.2-i*.3)/.65);x=mix(101+i*74,ex,q);y=mix(570,ey,q);icon(d,x,y,icnames[i],36)
        if q>.95:txt(d,ex-1,ey+38,labels[i],9,'#fff0ca',m=True)
    d.polygon([(337,379),(395,379),(395,365),(427,392),(395,419),(395,405),(337,405)],fill='#626d58');slot(d,459,348,95,phase>1.8)
    if phase>1.8:icon(d,483,375,'screen',54)
    txt(d,587,348,'OUTPUT',10,'#5a604c',m=True);txt(d,586,377,['Responsive UI','Connected app','Clear interface'][recipe],15,'#34432d',True);txt(d,586,409,'Recipe preview',11,'#687055')
    txt(d,83,527,'INVENTORY',12,'#4f5b42',True,m=True)
    for i,ic in enumerate(['code','gem','pick','chest','map','book','feather','craft','star']):x=83+i*72;slot(d,x,552,63);icon(d,x+13,568,ic,36)
    center(d,220,'THE CRAFTING TABLE',14,'#e7c88e',True,m=True,x=1012)
    render3d(im,SCENES['crafting_table'],t*.65,1010,502,87,.65,.48,clip=(817,256,1239,555))
    d=ImageDraw.Draw(im)
    for i,label in enumerate(['FRONTEND','BACKEND','DESIGN']):
        x=827+i*132;panel(d,(x,579,x+122,614),'#8a7046' if i==recipe else '#443a2b','#c7ac71','#26251b',bevel=2);center(d,590,label,10,'#f2e0bb',m=True,x=x+61)
    center(d,638,'Sample skills • confirm before publishing',10,'#c5ad85',x=1010);footer(d,'04 / CRAFTING BENCH   •   3 x 3 GRID + OUTPUT')
    return im

NODE_POS=[(135,437),(340,335),(340,550),(560,285),(560,420),(560,565),(830,285),(1040,285),(790,565)]
NODE_ICONS=['craft','code','book','screen','pick','feather','star','gem','lock']
NODE_TITLES=['The beginning','First commit','Keep learning','Interface crafter','Problem solver','Design notes','A proud moment','New possibilities','Next chapter']
EDGES=[(0,1),(0,2),(1,3),(1,4),(2,5),(3,6),(4,7),(5,8)]
def achievements(t):
    im=BGS['achievements'].copy();d=ImageDraw.Draw(im);header(d,'achievements')
    txt(d,48,104,'ADVANCEMENTS',31,b=True);txt(d,49,150,'A branching story of learning, building, and growing.',14,'#b7bda7')
    for i,(s,ic) in enumerate([('ALL','craft'),('BUILDING','pick'),('LEARNING','book'),('MILESTONES','star')]):
        x=47+i*186;panel(d,(x,184,x+174,229),'#777759' if i==0 else '#464c3d','#b7bc93','#252c23',bevel=3);icon(d,x+9,195,ic,27);txt(d,x+48,199,s,12,'#e7e4c4',m=True)
    panel(d,(45,233,1232,646),'#353a2e','#899079','#171e17');r=random.Random(9)
    for y in range(244,638,26):
        for x in range(55,1223,45):d.rectangle((x,y,min(x+42,1222),min(y+23,637)),fill=r.choice(['#373d30','#3b4134','#30372b']))
    active=[1,3,6][min(2,int(t/3.4))];pan=6*math.sin(t*.5);positions=[(x+pan,y) for x,y in NODE_POS]
    for a,b in EDGES:
        x,y=positions[a];xx,yy=positions[b];mid=(x+xx)/2;points=[(x+30,y),(mid,y),(mid,yy),(xx-30,yy)];d.line(points,fill='#182118',width=9);d.line(points,fill='#a5a784' if b<=active else '#666d56',width=3)
    for i,(x,y) in enumerate(positions):
        selected=i==active
        if i in [6,7]:d.polygon([(x-35,y-22),(x-22,y-35),(x+22,y-35),(x+35,y-22),(x+35,y+22),(x+22,y+35),(x-22,y+35),(x-35,y+22)],fill='#c7b77c' if selected else '#7b836b',outline='#141d16')
        else:panel(d,(x-32,y-32,x+32,y+32),'#ac985f' if selected else '#747b63','#e7d699' if selected else '#aeb497','#303a2b')
        icon(d,x-18,y-15,NODE_ICONS[i],36)
        if selected:d.rectangle((x-39,y-39,x+39,y+39),outline='#ebd68c',width=2)
    panel(d,(863,393,1209,625),'#242d25','#a49a62','#101b15');icon(d,883,412,NODE_ICONS[active],27)
    txt(d,925,412,NODE_TITLES[active],17,'#e8dca7',True);txt(d,885,450,'DEMO ENTRY / SELECTED',10,'#c5b270',m=True)
    lines={1:['Your first meaningful step.','Add the real project, date,','and evidence for this milestone.'],3:['A useful interface brought to life.','Add screenshots and the story','behind the actual achievement.'],6:['A milestone worth remembering.','Add a real award, certificate,','or completed project here.']}
    for y,line in zip([477,498,519],lines[active]):txt(d,885,y,line,12,'#bbc7ad')
    button(d,884,555,302,'View milestone details',True);txt(d,71,611,'SAMPLE TREE / DRAG TO EXPLORE',10,'#9fae92',m=True)
    if t>7:
        panel(d,(850,94,1232,162),'#343b29','#b3ad73','#182218',bevel=3);icon(d,864,111,'star',36);txt(d,914,107,'Milestone selected',13,'#e3d080',True);txt(d,914,132,'Previewing sample achievement',11,'#bfc6a4')
    footer(d,'05 / ADVANCEMENT TREE   •   PAN + SELECT')
    return im

def contact(t):
    im=BGS['contact'].copy();d=ImageDraw.Draw(im);r=random.Random(88)
    for i in range(65):
        x=r.randrange(1280);y=95+(r.randrange(590)+t*5)%590;d.rectangle((x,y,x+2,y+2),fill='#8672a0')
    header(d,'contact');center(d,101,'LET’S WRITE THE NEXT CHAPTER',31,b=True);center(d,149,'A message is where a new adventure begins.',14,'#bdb0ca')
    spread=24*(1-smooth(t/1.1));panel(d,(177+spread,206,1103-spread,645),'#5b382e','#9a6651','#211c21',bevel=8)
    d.polygon([(195+spread,218),(628,228),(628,626),(195+spread,612)],fill='#d8c597');d.polygon([(649,228),(1085-spread,218),(1085-spread,612),(649,626)],fill='#e7d8af');d.rectangle((629,224,648,630),fill='#a88d61');d.line((639,229,639,619),fill='#806743',width=2)
    txt(d,232,250,'To: Jon Vincent Din',21,'#443e2c',True);txt(d,233,305,'Have an idea in mind?',20,'#514832',True)
    for y,s in zip([353,382,411,440],['Tell me what you’re thinking.','A collaboration, a question,','or simply a hello —','there’s a page for that.']):txt(d,233,y,s,16,'#62553b')
    icon(d,243,507,'feather',72);txt(d,340,517,'EMAIL / GITHUB / LINKEDIN',11,'#65573c',m=True);txt(d,340,544,'Your real links go here.',12,'#847450');txt(d,233,591,'01',11,'#847450',m=True)
    txt(d,689,250,'Your message',21,'#443e2c',True)
    for y,label in [(299,'NAME'),(370,'EMAIL'),(441,'MESSAGE')]:txt(d,691,y,label,10,'#82714d',m=True);d.line((691,y+52,1037,y+52),fill='#b4a075',width=1)
    txt(d,693,324,'Your name',14,'#9c895f');txt(d,693,395,'you@example.com',14,'#9c895f');message='Let’s build something together.';visible=int(len(message)*smooth((t-2)/4));txt(d,693,466,message[:visible],14,'#514a32')
    if 2<t<7 and int(t*3)%2==0:
        x=693+font(14).getlength(message[:visible]);d.line((x,468,x,484),fill='#514a32',width=2)
    button(d,689,538,349,'Send message',True,t>7);txt(d,690,594,'Design preview • delivery not connected',10,'#8d7952');d.polygon([(1061,196),(1090,196),(1090,286),(1075,274),(1061,286)],fill='#8c554b');footer(d,'06 / BOOK + QUILL   •   MESSAGE COMPOSER')
    return im

def table_preview(t):
    im=BGS['skills'].copy();d=ImageDraw.Draw(im);center(d,52,'CRAFTING TABLE',37,b=True);center(d,110,'Original 3D model • 3×3 top • carved tool sides',15,'#ccb991')
    render3d(im,SCENES['crafting_table'],t*1.6,640,534,145,.55,.43,clip=(230,170,1050,630));d=ImageDraw.Draw(im);center(d,657,'crafting_table.glb / editable mesh / showcase animation included',12,'#cfb98d',m=True)
    return im

FRAME={'home':home,'about':about,'projects':projects,'skills':skills,'achievements':achievements,'contact':contact,'crafting_table':table_preview}
def main():
    for sub in ['models','previews']:(ROOT/sub).mkdir(exist_ok=True)
    for p in (ROOT/'models').glob('*.glb'):p.unlink()
    manifest={'owner':'Jon Vincent Din','revision':2,'format':'glTF 2.0 binary','units':'one unit is one block; crafting table is 2 units wide','models':[]}
    for name,scene in SCENES.items():manifest['models'].append(export_glb(scene,ROOT/'models'/f'{name}.glb'))
    (ROOT/'models'/'manifest.json').write_text(json.dumps(manifest,indent=2))
    for kind,fn in FRAME.items():fn(6.1).save(ROOT/'previews'/f'{kind}.png')
    if '--videos' not in sys.argv:return
    for i,(kind,fn) in enumerate(FRAME.items()):
        p=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r','24','-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/'previews'/f'{i+1:02}_{kind}.mp4')],stdin=subprocess.PIPE)
        for n in range(FPS*DURATION):p.stdin.write(fn(n/FPS).tobytes())
        p.stdin.close();assert p.wait()==0;print('Rendered '+kind,flush=True)
if __name__=='__main__':main()
