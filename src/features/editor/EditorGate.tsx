import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';
import type {ContentRepository} from '../../data/ContentRepository';
import {MIN_PASSWORD,SupabaseContentRepository} from '../../data/SupabaseContentRepository';
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
 const account=useMemo(()=>({email,signOut:()=>void signOut(),reauthorize:()=>void reauthorize(),changePassword:(current:string,next:string)=>repository.changePassword(current,next)}),[email,reauthorize,repository]);

 if(repository.recoveryActive && !repository.recoveryError && state.phase==='ready')return <ResetPasswordForm repository={repository} done={()=>{setOpened(false);void check();}}/>;
 if(opened && !repository.recoveryActive)return <><EditorPage {...rest} repository={repository} account={account}/>
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
   {repository.recoveryError&&<p role="alert" className="editor-notice">{repository.recoveryError}</p>}<SignInForm repository={repository}/></>}
  </div></div>;
}

function SignInForm({repository}:{repository:SupabaseContentRepository}) {
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[email,setEmail]=useState(''),[step,setStep]=useState<'email'|'password'>('email');
 const ownerEmail=(import.meta.env.VITE_OWNER_EMAIL as string|undefined)?.trim().toLowerCase();
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();setMessage('');
  if(step==='email'){
   if(ownerEmail && email.trim().toLowerCase()!==ownerEmail){setMessage('Use the Gmail address registered for this portfolio.');return;}
   setEmail(email.trim());setStep('password');return;
  }
  const form=new FormData(event.currentTarget);setBusy(true);
  try{await repository.signIn(email,String(form.get('password')));}
  catch(error){setMessage((error as Error).message);}
  finally{setBusy(false);}
 };
 const reset=async()=>{
  setBusy(true);setMessage('');
  try{await repository.requestPasswordReset(email);setMessage('If this address is registered, a password reset link has been sent. Check your inbox and spam folder.');}
  catch(error){setMessage((error as Error).message);}
  finally{setBusy(false);}
 };
 return <form className="editor-form-panel" id="sign-in-form" onSubmit={submit}><div className="editor-fields">
  <label className="editor-field"><span>Gmail address</span><input name="email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} readOnly={step==='password'} required/></label>
  {step==='password'&&<label className="editor-field"><span>Password</span><input name="password" type="password" autoComplete="current-password" autoFocus required/></label>}</div>
  <div className="form-actions"><button className="btn" type="submit" disabled={busy}>{busy?'Please wait...':step==='email'?'Continue':'Sign in'}</button>
  {step==='password'&&<><button className="text-button" type="button" disabled={busy} onClick={()=>{setStep('email');setMessage('');}}>Change email</button><button className="text-button" type="button" disabled={busy} onClick={()=>void reset()}>Forgot password?</button></>}
  {message&&<span className="help" role="status" id="sign-in-error">{message}</span>}</div></form>;
}

function ResetPasswordForm({repository,done}:{repository:SupabaseContentRepository;done:()=>void}) {
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();const form=new FormData(event.currentTarget);const password=String(form.get('password'));
  if(password!==form.get('confirm')){setMessage('The passwords do not match.');return;}
  setBusy(true);setMessage('');
  try{await repository.finishPasswordReset(password);done();}
  catch(error){setMessage((error as Error).message);}
  finally{setBusy(false);}
 };
 return <section className="editor-main"><h1>Set a new password</h1><p className="editor-notice">Choose at least {MIN_PASSWORD} characters. Then sign in with your new password.</p>
 <form className="editor-form-panel" id="reset-password-form" onSubmit={submit}><div className="editor-fields">
 <label className="editor-field"><span>New password</span><input type="password" name="password" autoComplete="new-password" minLength={MIN_PASSWORD} required autoFocus/></label>
 <label className="editor-field"><span>Confirm new password</span><input type="password" name="confirm" autoComplete="new-password" minLength={MIN_PASSWORD} required/></label></div>
 <div className="form-actions"><button className="btn" disabled={busy}>{busy?'Saving...':'Save new password'}</button>{message&&<p role="alert">{message}</p>}</div></form></section>;
}
