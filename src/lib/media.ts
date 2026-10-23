export const IMAGE_TYPES=['image/png','image/jpeg','image/webp'];
export const MAX_IMAGE_BYTES=15*1024*1024;

// Same limits and output as the reference editor: PNG/JPEG/WebP under 15 MB, longest side 1920px, WebP at 0.88.
export async function readImage(file:File):Promise<string>{
 if(!IMAGE_TYPES.includes(file.type))throw Error('Choose a PNG, JPEG, or WebP image.');
 if(file.size>MAX_IMAGE_BYTES)throw Error('Choose images smaller than 15 MB each.');
 const bitmap=await createImageBitmap(file),ratio=Math.min(1,1920/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');
 canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
 canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 return canvas.toDataURL('image/webp',.88);
}
