import {useState,type FormEvent} from 'react';
import {Modal} from '../../components/ui/Modal';
import {MIN_PASSWORD} from '../../data/SupabaseContentRepository';
import type {Account} from './EditorPage';

// Owner password change. The current password is confirmed by the service before the new one is set.
export function PasswordDialog({account,notify,close}:{account:Account;notify:(m:string)=>void;close:()=>void}) {
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();const form=new FormData(event.currentTarget);
  const current=String(form.get('current')),next=String(form.get('next'));
  if(next!==String(form.get('repeat'))){setMessage('The new passwords do not match. Nothing was changed.');return;}
  setBusy(true);setMessage('');
  try{await account.changePassword(current,next);notify('Password changed. Use the new password next time you sign in.');close();}
  catch(error){setMessage((error as Error).message);}
  finally{setBusy(false);}
 };
 return <Modal label="Change password" close={close}><span className="eyebrow">OWNER ACCESS</span><h2>Change password</h2>
  <p className="modal-lead">{'Signed in as '+account.email+'. Use at least '+MIN_PASSWORD+' characters; a password manager can generate one.'}</p>
  <form className="editor-form-panel" id="password-form" onSubmit={submit}><div className="editor-fields">
   <label className="editor-field"><span>Current password</span><input name="current" type="password" autoComplete="current-password" required/></label>
   <label className="editor-field"><span>New password</span><input name="next" type="password" autoComplete="new-password" minLength={MIN_PASSWORD} required/></label>
   <label className="editor-field"><span>Repeat new password</span><input name="repeat" type="password" autoComplete="new-password" minLength={MIN_PASSWORD} required/></label></div>
   <div className="form-actions"><button className="btn" type="submit" disabled={busy}>{busy?'Changing…':'Change password'}</button>{message&&<span className="help" role="alert" id="password-error">{message}</span>}</div></form></Modal>;
}
