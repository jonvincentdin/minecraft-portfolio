export const IMAGE_TYPES=['image/png','image/jpeg','image/webp'];
export const MAX_IMAGE_BYTES=15*1024*1024;

export interface PreparedImage { blob:Blob; width:number; height:number }
// Same limits and output as the reference editor: PNG/JPEG/WebP under 15 MB, longest side 1920px, WebP at 0.88.
async function resize(file:File){
 if(!IMAGE_TYPES.includes(file.type))throw Error('Choose a PNG, JPEG, or WebP image.');
 if(file.size>MAX_IMAGE_BYTES)throw Error('Choose images smaller than 15 MB each.');
 const bitmap=await createImageBitmap(file),ratio=Math.min(1,1920/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');
 canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
 canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 return canvas;
}
export async function readImage(file:File):Promise<string>{return (await resize(file)).toDataURL('image/webp',.88);}
// The upload form of readImage(): the resized WebP as a Blob with its dimensions.
export async function prepareImage(file:File):Promise<PreparedImage>{
 const canvas=await resize(file);
 const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.88));
 if(!blob||blob.type!=='image/webp')throw Error('This browser could not prepare the image. Try a different browser.');
 return {blob,width:canvas.width,height:canvas.height};
}
// Inline images from local-mode exports, turned back into files for upload.
export async function dataUrlFile(src:string,name:string):Promise<File>{
 const blob=await (await fetch(src)).blob();
 return new File([blob],name,{type:blob.type});
}
