# V2-06 — Editor page and email-code sign-in

Dependency: V2-01. Approvals needed first: P3 (auth change and owner enrollment), P4 (SMTP).

## Scope

AUTH.md and EDITOR.md: the `/editor` entry, Gmail → code sign-in, the simplified tabs, removal of the password and change-password UI, Supabase email-template and OTP-expiry settings, enrollment of jonvincent.din@gmail.com.

## Acceptance

AUTH.md tests against the emulator; RLS tests (`test:db`) still pass; one manual hosted check that the code reaches jonvincent.din@gmail.com and signs in; no Gmail in the built bundles. Password sign-in is disabled on the hosted project only after that hosted check passes.
