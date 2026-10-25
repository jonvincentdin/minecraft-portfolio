# Editor sign-in: Gmail, then an emailed code

## Owner requirement

Clicking the logo opens the editor page. The page first asks for the Gmail. Only if it is the owner's address, **jonvincent.din@gmail.com**, is a code sent to that inbox. Entering the code opens the editor.

## Design

Use Supabase Auth's built-in **email one-time password (OTP)**. No custom code store and no custom mailer code.

1. **Step 1, email.** A single field, "Gmail". On submit the client calls
   `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`.
   With `shouldCreateUser: false` and sign-ups disabled, Supabase sends a code **only to an existing auth user**. The owner is the only user, so only the owner's Gmail ever receives a code. This is the server-enforced "if correct" check.
2. **Step 2, code.** A 6-digit code field (`inputmode="numeric"`, `autocomplete="one-time-code"`). On submit:
   `supabase.auth.verifyOtp({ email, token, type: 'email' })`.
3. **Authorize.** After a session exists, load the draft. The existing membership table and RLS decide whether this user may edit. A valid session without a membership row still sees nothing.

## Rules

- **Do not hard-code or compare the Gmail in the browser.** A client-side check would ship the address in the bundle and can be bypassed. The server decides.
- **Use one response for every address.** After step 1, always show: "If that's the owner's Gmail, a code is on its way. Check your inbox." Then show step 2. Unknown addresses return an error from Supabase; map it to the same message so the page doesn't reveal which address is the owner's. Network and rate-limit errors are different: show those plainly ("Couldn't send right now, try again in a minute").
- **The Supabase email template must contain the code.** Edit the "Magic Link" template to include `{{ .Token }}` (for example "Your World of Builds editor code: {{ .Token }}") and remove or keep the link deliberately. Without `{{ .Token }}` Supabase sends a link, not a code.
- **Expiry and rate limits.** Set OTP expiry to 10 minutes. Keep Supabase's resend limit (about one send per 60 seconds per address) and show a countdown on "Resend code". Allow five code attempts, then require a new code.
- **Delivery.** Configure custom SMTP (proposal P4). Supabase's default mailer is for testing, and its limits are too low to rely on.
- **Sessions.** Keep the session in the Supabase client's storage, as v1 does. Add a "Sign out" button. No password, no change-password form.
- **Enrollment.** Create the auth user for jonvincent.din@gmail.com from the dashboard or with the admin API, then insert its membership row with the trusted SQL step from v1 (`../v1/SUPABASE.md`). The existing chanseytheopiest@gmail.com owner stays until the owner says to remove it (DECISIONS.md P3).
- **Demo mode.** Without Supabase configured, `/editor` shows the local editor with a clear "Demo — no sign-in" banner, as v1 does. Never fake a sent code.

## Migration from v1

- Disable "Email + password" sign-in in the Supabase dashboard only after the OTP flow is verified on the hosted project. Keep password auth until then so the owner isn't locked out.
- Remove the change-password UI and its tests when OTP replaces passwords.
- No database schema change is expected. If one becomes necessary, it is a protected migration (AGENTS.md).

## Tests

- Emulator: step 1 for the owner address results in an OTP-send call; an unknown address shows the same message and sends nothing; a wrong code shows an error; the correct code signs in; expiry; resend cooldown; a signed-in non-member sees no draft.
- Hosted, once and manually: the real code arrives at jonvincent.din@gmail.com and signs in.
