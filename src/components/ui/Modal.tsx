import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
export function Modal({ children, label, close }: { children:ReactNode; label:string; close:()=>void }) {
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const node=dialog.current!, trigger=document.activeElement as HTMLElement | null;
  node.showModal();
  return ()=>{ node.close(); if(trigger?.isConnected) trigger.focus({preventScroll:true}); else document.getElementById('main')?.focus({preventScroll:true}); };
 },[]);
 return createPortal(<dialog id="detail" ref={dialog} aria-label={label} onCancel={event=>{event.preventDefault();close();}} onClick={event=>{
  if(event.target!==event.currentTarget)return;const r=event.currentTarget.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();
 }}>
 <button className="dialog-close" aria-label="Close details" onClick={close} autoFocus>×</button><div id="detail-body">{children}</div>
 </dialog>,document.body);
}
