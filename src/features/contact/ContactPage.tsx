import { useState, type FormEvent } from 'react';
import type { PortfolioContent } from '../../types/content';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Modal } from '../../components/ui/Modal';
import { safeUrl } from '../../lib/urls';
export function ContactPage({content}:{content:PortfolioContent}) {
 const [review,setReview]=useState<{name:string;email:string;message:string}|null>(null);
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const values=new FormData(event.currentTarget);setReview({name:String(values.get('name')),email:String(values.get('email')),message:String(values.get('message'))});}
 return <section className="contact-page"><SectionHeading label="06 / BOOK & QUILL" title={content.settings.contactTitle} description="A message is where a new adventure begins."/>
 <div className="contact-book"><div className="book-mark"/><article className="book-page"><span className="eyebrow">TO: {content.settings.name}</span><h2>Have an idea<br/>in mind?</h2><p>{content.settings.contactCopy}</p><div className="contact-links">{content.contacts.map(item=>safeUrl(item.url)?<a key={item.id} href={safeUrl(item.url)} target="_blank" rel="noopener noreferrer">{item.title} ↗</a>:<span key={item.id}>{item.title} <small>Link not set</small></span>)}</div></article>
 <form className="book-page" id="contact-form" onSubmit={submit}><h2>Your message.</h2><label htmlFor="name">NAME</label><input id="name" name="name" autoComplete="name" required maxLength={100}/><label htmlFor="email">EMAIL</label><input id="email" name="email" type="email" autoComplete="email" required/><label htmlFor="message">MESSAGE</label><textarea id="message" name="message" required maxLength={5000}/><button className="btn">Review message →</button><p className="help">Reference form. No message is sent.</p></form></div>
 {review&&<Modal label="Message review" close={()=>setReview(null)}><span className="eyebrow">MESSAGE REVIEW</span><h2>Your next chapter.</h2><p className="modal-lead">{review.name} · {review.email}</p><div className="review-message">{review.message}</div><p className="help">Nothing was sent. Connect a real delivery service when building the production version.</p><button className="btn secondary" onClick={()=>setReview(null)}>Continue editing</button></Modal>}</section>;
}
