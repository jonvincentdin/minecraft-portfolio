import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';
import type {ContentRepository} from '../../data/ContentRepository';
import {SupabaseContentRepository} from '../../data/SupabaseContentRepository';
import type {ContentSnapshot,PortfolioContent} from '../../types/content';
import {Modal} from '../../components/ui/Modal';
import {EditorPage} from './EditorPage';

interface Props { repository:ContentRepository; notify:(m:string)=>void; paused:boolean; onPreview:(content:PortfolioContent,revision:number)=>void; onPublished:(snapshot:ContentSnapshot)=>void }
type Phase={phase:'checking'}|{phase:'signed-out'}|{phase:'not-enrolled';email:string}|{phase:'ready';email:string}|{phase:'error';message:string};

// Local mode needs no account. Backend mode shows the editor only to an enrolled account; the database
// enforces the same rule, so this gate is for clarity, not security.
export function EditorGate(props:Props) {
 if(!(props.repository instanceof SupabaseContentRepository))return <EditorPage {...props}/>;
 return <BackendGate {...props} repository={props.repository}/>;
}

function BackendGate({repository,...rest}:Props&{repository:SupabaseContentRepository}) {
 const [state,setState]=useState<Phase>({phase:'checking'});
 // Once the editor has opened it stays mounted when the session ends, so the working copy survives re-sign-in.
 const [opened,setOpened]=useState(false);
 const check=useCallback(async()=>{
  try{
   const member=await repository.membership();
   if(!member)setState({phase:'signed-out'});
   else if(!member.role)setState({phase:'not-enrolled',email:member.user.email??''});
   else{setState({phase:'ready',email:member.user.email??''});setOpened(true);}
  }catch(error){setState({phase:'error',message:(error as Error).message});}
 },[repository]);
 // Auth callbacks must not await other client calls directly, so the check runs on the next task.
 useEffect(()=>repository.onAuthChange(()=>{setTimeout(()=>void check(),0);}),[repository,check]);
 useEffect(()=>{void check();},[check]);
 const signOut=async()=>{setOpened(false);await repository.signOut();};
 const reauthorize=useCallback(async()=>{await repository.refreshAccess();await check();},[repository,check]);
 // The last signed-in address stays on screen while the editor waits for a new sign-in.
 const [email,setEmail]=useState('');
 useEffect(()=>{if(state.phase==='ready')setEmail(state.email);},[state]);
 const account=useMemo(()=>({email,signOut:()=>void signOut(),reauthorize:()=>void reauthorize()}),[email,reauthorize]);

 if(opened)return <><EditorPage {...rest} repository={repository} account={account}/>
  {state.phase!=='ready'&&state.phase!=='checking'&&<Modal label="Sign in again" close={()=>void signOut()}><span className="eyebrow">SESSION ENDED</span><h2>Sign in again to keep saving.</h2>
   <p className="modal-lead">Your edits are still here and have not been lost. Changes made while signed out were not saved; after signing in, choose Retry save.</p>
   {state.phase==='not-enrolled'?<p className="modal-lead" role="alert">{state.email+' is not enrolled as an editor of this portfolio.'}</p>:state.phase==='error'?<p className="modal-lead" role="alert">{state.message}</p>:null}
   <SignInForm repository={repository}/></Modal>}</>;
 return <div className="editor-shell"><aside className="editor-sidebar"><a href="#home" className="editor-logo">JVD<span>WORLD EDITOR</span></a><span className="editor-mode"><i></i> OWNER ACCESS</span>
  <div className="editor-side-bottom"><a href="#home">← Return to portfolio</a></div></aside>
  <div className="editor-main"><div className="editor-topbar"><div><span className="eyebrow">CONTENT STUDIO / SIGN IN</span><h1>Owner sign-in</h1></div></div>
  {state.phase==='checking'?<p className="editor-notice" role="status">Checking your sign-in…</p>
  :state.phase==='not-enrolled'?<><p className="editor-notice" role="alert" id="not-enrolled">{'Signed in as '+state.email+', but this account is not enrolled as an editor of this portfolio. Enrollment is done by the site administrator; nothing can be changed from this account.'}</p><button className="btn secondary" id="sign-out" onClick={()=>void signOut()}>Sign out</button></>
  :<><p className="editor-notice">The World Editor is for the portfolio owner. Visitors can explore everything else without an account.</p>
   {state.phase==='error'&&<p className="editor-notice conflict-notice" role="alert">{state.message} <button className="text-button" onClick={()=>void check()}>Try again</button></p>}
   <SignInForm repository={repository}/></>}
  </div></div>;
}

function SignInForm({repository}:{repository:SupabaseContentRepository}) {
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();const form=new FormData(event.currentTarget);
  setBusy(true);setMessage('');
  try{await repository.signIn(String(form.get('email')),String(form.get('password')));}
  catch(error){setMessage((error as Error).message);}
  finally{setBusy(false);}
 };
 return <form className="editor-form-panel" id="sign-in-form" onSubmit={submit}><div className="editor-fields">
  <label className="editor-field"><span>Email</span><input name="email" type="email" autoComplete="username" required/></label>
  <label className="editor-field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required/></label></div>
  <div className="form-actions"><button className="btn" type="submit" disabled={busy}>{busy?'Signing in…':'Sign in'}</button>{message&&<span className="help" role="alert" id="sign-in-error">{message}</span>}</div></form>;
}
