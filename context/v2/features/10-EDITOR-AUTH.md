# V10 — Editor page and email-code sign-in

Specification: AUTH.md (sign-in) and EDITOR.md (editor). Summary:

1. The logo links to `/editor` (a separate Vite entry).
2. Step 1 asks for the Gmail. `signInWithOtp` with `shouldCreateUser: false`; the same neutral message for any address.
3. Step 2 takes the 6-digit code. `verifyOtp`; then membership/RLS decides editor access.
4. The editor: the simplified v1 tabs, save, preview and publish, sign out.

Acceptance: as listed in AUTH.md → Tests, plus the v1 editor checks still applicable (save conflict, failed upload keeps input, publish atomicity), and no Gmail string in the built public or editor bundles (`grep` the `dist` output).
