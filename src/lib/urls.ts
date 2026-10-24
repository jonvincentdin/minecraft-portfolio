import { MEDIA_REF } from '../domain/content-validation';

export function safeUrl(value: string, allowMail = true): string {
 try { const url = new URL(value); return (['http:', 'https:'].includes(url.protocol) || (allowMail && url.protocol === 'mailto:')) ? url.href : ''; } catch { return ''; }
}
// Uploaded media ('media:<file>') resolves through the active content source: the public bucket for
// published images, or a short-lived signed URL for draft-only uploads. Without a backend it shows nothing.
let mediaResolver: (file: string) => string = () => '';
export function setMediaResolver(resolve: (file: string) => string) { mediaResolver = resolve; }
export function mediaFile(value: string) { return MEDIA_REF.exec(value)?.[1] ?? ''; }
export function safeImage(value: string): string {
 if (/^\/?assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.split('/').includes('..')) return '/' + value.replace(/^\//, '');
 if (/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/i.test(value)) return value;
 const file = mediaFile(value);
 if (file) return mediaResolver(file);
 return safeUrl(value, false);
}
