// Original, deterministic v2 review geometry. Does not modify canonical assets.
// Units are arbitrary scene units; +Y is up and +Z is the presentation front.
const C = { stone:'#34433d', edge:'#526156', dark:'#192820', wood:'#986b42', light:'#c49862', end:'#6e4c34', brass:'#c2a46c', cream:'#ece2c6', moss:'#6f8b52', leaf:'#8da96b', metal:'#35483f', ink:'#172820', glow:'#f4cc7e', violet:'#9c8aba' };
const box = (out,p,s,c,part='body') => out.push({p,s,c,part});
function base(out,x=0,y=0,z=0,w=5,d=2.5) {
  box(out,[x,y+.12,z],[w,.24,d],C.dark);
  const cols=Math.round(w/.5), rows=Math.round(d/.5);
  for(let i=0;i<cols;i++) for(let j=0;j<rows;j++) {
    box(out,[x-w/2+(i+.5)*w/cols,y+.3,z-d/2+(j+.5)*d/rows],[w/cols-.015,.22,d/rows-.015],(i+j)%3===0?C.edge:C.stone);
  }
  box(out,[x,y+.435,z],[w+.06,.05,d+.06],C.edge);
}
function lantern(out,x=0,y=0,z=0,k=1) {
  const b=(p,s,c,part='lantern')=>box(out,[x+p[0]*k,y+p[1]*k,z+p[2]*k],s.map(v=>v*k),c,part);
  b([0,.08,0],[.72,.16,.72],C.metal); b([0,.19,0],[.60,.08,.60],C.brass);
  b([0,.57,0],[.43,.70,.43],C.glow,'light');
  b([0,.57,.223],[.25,.52,.01],'#ffe8ab','light');
  for(const a of [-1,1])for(const q of [-1,1])b([a*.285,.57,q*.285],[.085,.78,.085],C.metal);
  for(const a of [-1,1]) { b([0,.55,a*.295],[.64,.065,.055],C.brass); b([a*.295,.55,0],[.055,.065,.64],C.brass); }
  b([0,.98,0],[.72,.12,.72],C.metal);b([0,1.08,0],[.57,.09,.57],C.brass);b([0,1.17,0],[.4,.09,.4],C.metal);
  for(const a of [-1,1])b([a*.15,1.37,0],[.07,.32,.09],C.metal);
  b([0,1.52,0],[.37,.07,.09],C.metal);
  for(const a of [-1,1])for(const q of [-1,1])b([a*.23,.095,q*.23],[.07,.04,.07],C.brass);
}
function book(out,x=0,y=0,z=0,k=1) {
  const b=(p,s,c)=>box(out,[x+p[0]*k,y+p[1]*k,z+p[2]*k],s.map(v=>v*k),c,'journal');
  b([0,.05,0],[1.06,.10,.78],C.end);b([0,.11,0],[.94,.04,.68],C.cream);
  for(let i=0;i<5;i++)b([0,.14+i*.025,0],[.96,.018,.68],i%2?'#d1c5a4':C.cream);
  b([0,.29,0],[1.06,.09,.78],C.wood);b([-.49,.17,0],[.10,.3,.78],C.end);
  b([.27,.34,0],[.13,.025,.82],C.brass);b([.27,.36,.12],[.22,.035,.23],C.brass);b([.27,.38,.12],[.10,.01,.10],C.dark);
  for(const a of [-1,1])for(const q of [-1,1])b([a*.42,.345,q*.30],[.12,.025,.08],C.brass);
}
function plant(out,x,y,z,k=1) {
  const b=(p,s,c)=>box(out,[x+p[0]*k,y+p[1]*k,z+p[2]*k],s.map(v=>v*k),c,'plant');
  b([0,.17,0],[.45,.34,.45],C.end);b([0,.36,0],[.53,.09,.53],C.wood);b([0,.42,0],[.4,.04,.4],C.dark);
  b([0,.73,0],[.05,.62,.05],C.moss);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;for(let j=1;j<4;j++)b([Math.cos(a)*j*.10,.53+j*.12+(i%2)*.13,Math.sin(a)*j*.10],[.19,.09,.19],(i+j)%2?C.moss:C.leaf);}
}
function display(out) {
  base(out,0,0,0,5.4,2.6);
  for(const a of [-1,1]) { box(out,[a*1.72,.71,-.12],[.3,.55,.58],C.end);box(out,[a*1.72,.98,-.12],[.42,.09,.72],C.brass); }
  box(out,[0,1.14,-.12],[4.45,.24,.6],C.wood);
  box(out,[0,2.4,-.16],[4.55,2.66,.24],C.end);
  // Screen plane is intentionally blank; the page projects the supplied demo artwork onto it.
  box(out,[0,2.4,.005],[4.12,2.35,.075],C.ink,'screen');
  for(const a of [-1,1]){
    box(out,[a*2.23,2.4,.02],[.20,2.79,.29],C.wood);
    box(out,[a*2.32,2.4,.01],[.06,2.68,.30],C.light);
    box(out,[0,2.4+a*1.35,.02],[4.62,.16,.30],C.wood);
    box(out,[0,2.4+a*1.45,.02],[4.79,.055,.32],C.light);
    box(out,[a*2.1,2.4,.105],[.035,2.44,.055],C.brass);
    box(out,[0,2.4+a*1.235,.105],[4.23,.035,.055],C.brass);
    for(const q of [-1,1]){
      box(out,[a*2.25,2.4+q*1.29,.185],[.26,.28,.035],C.brass);
      box(out,[a*2.25,2.4+q*1.29,.21],[.065,.065,.025],C.end);
    }
  }
  for(let i=0;i<12;i++)box(out,[-2.08+i*.38,3.77,.19],[.13,.025,.02],i%2?C.end:C.light);
  box(out,[0,.52,1.05],[1.12,.08,.34],C.brass);box(out,[0,.57,1.07],[.88,.025,.20],C.dark);
}
export function createModels() {
  const gallery=[],lamp=[],journal=[],studio=[];
  display(gallery);lantern(lamp);book(journal);
  studio.push(...gallery.map(b=>({...b,p:[...b.p],s:[...b.s]})));
  base(studio,3.1,0,.15,1.45,1.8);lantern(studio,3.1,.46,.4,1.15);
  base(studio,-3.0,0,-.35,1.3,1.8);plant(studio,-3,.46,-.35,1.2);
  book(studio,-1.55,.47,.75,.9);
  for(let i=0;i<11;i++)box(studio,[-3.5+i*.67,.06,1.9],[.55,.12,.55],i%3?C.stone:C.edge,'path');
  for(let i=0;i<16;i++) { const x=(i<8?-1:1)*(2.65+(i%4)*.27), z=-.8+Math.floor(i/4)*.47;box(studio,[x,.48,z],[.16,.07,.17],i%2?C.moss:C.leaf,'moss'); }
  return {
    'gallery-display':{boxes:gallery,screen:{center:[0,2.4,.09],width:4.10,height:2.32}},
    'workshop-lantern':{boxes:lamp},
    'builder-journal':{boxes:journal},
    'portfolio-studio':{boxes:studio,screen:{center:[0,2.4,.09],width:4.10,height:2.32}}
  };
}
