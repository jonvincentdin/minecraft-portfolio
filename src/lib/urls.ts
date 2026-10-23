export function safeUrl(value: string, allowMail = true): string {
 try { const url = new URL(value); return (['http:', 'https:'].includes(url.protocol) || (allowMail && url.protocol === 'mailto:')) ? url.href : ''; } catch { return ''; }
}
export function safeImage(value: string): string {
 if (/^\/?assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.split('/').includes('..')) return '/' + value.replace(/^\//, '');
 if (/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/i.test(value)) return value;
 return safeUrl(value, false);
}
