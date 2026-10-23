import { chromium } from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage(), result={};
 for(const name of ['intro-desktop','home-desktop','home-390','home-1366','home-1024','home-768']){
  const urls=await Promise.all(['react','reference'].map(async kind=>'data:image/png;base64,'+(await readFile('test-results/m01/'+kind+'-'+name+'.png')).toString('base64')));
  result[name]=await page.evaluate(async urls=>{
   const images=await Promise.all(urls.map(src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.src=src;})));
   const data=images.map(img=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);return c.getContext('2d').getImageData(0,0,c.width,c.height).data;});
   let changed=0;for(let i=0;i<data[0].length;i+=4)if([0,1,2,3].some(n=>data[0][i+n]!==data[1][i+n]))changed++;
   return {dimensions:images.map(i=>[i.width,i.height]),differentPixels:changed,fraction:changed/(data[0].length/4)};
  },urls);
 }
 await writeFile('test-results/m01/comparison.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
} finally {await browser.close();}
