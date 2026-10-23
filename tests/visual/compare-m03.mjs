import { chromium } from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage(), result={};
 for(const name of ["skills-1440","workshop-1440","skills-390","workshop-390","skills-1366","workshop-1366","skills-1024","workshop-1024","skills-768","workshop-768","react-crafted"]){
  const urls=await Promise.all(['react','reference'].map(async kind=>'data:image/png;base64,'+(await readFile('test-results/m03/'+kind+'-'+name+'.png')).toString('base64')));
  result[name]=await page.evaluate(async urls=>{
   const images=await Promise.all(urls.map(src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.src=src;})));
   const data=images.map(img=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);return c.getContext('2d').getImageData(0,0,c.width,c.height).data;});
   let changed=0; const bounds=[images[0].width,images[0].height,0,0];for(let i=0;i<data[0].length;i+=4)if([0,1,2,3].some(n=>data[0][i+n]!==data[1][i+n])){changed++; const x=(i/4)%images[0].width,y=Math.floor(i/4/images[0].width);bounds[0]=Math.min(bounds[0],x);bounds[1]=Math.min(bounds[1],y);bounds[2]=Math.max(bounds[2],x);bounds[3]=Math.max(bounds[3],y); }
   return {dimensions:images.map(i=>[i.width,i.height]),differentPixels:changed,bounds,fraction:changed/(data[0].length/4)};
  },urls);
 }
 await writeFile('test-results/m03/comparison.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
} finally {await browser.close();}
