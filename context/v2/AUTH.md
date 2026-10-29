# Authentication — preserve access, isolate the earlier OTP proposal

Updated 2026-10-27. The current visual task makes no auth, membership, SMTP or database changes. The production application continues using its existing v1 email/password sign-in and server-enforced portfolio membership.

## Retained rules

- Signed-in does not mean authorized. portfolio_editors membership and RLS decide access to drafts, mutation RPCs and private media.
- Keep current owner access and password recovery/change behavior until a replacement has been explicitly approved and verified.
- No owner address comparison, service key, SMTP credential or authorization decision belongs in browser code.
- Demo mode stays visibly local; never fake a sent code, remote save or publication.

## Earlier requirement, still separate

The earlier v2 brief requested logo → /editor → Gmail → emailed code. That remains a deferred V2-06 auth proposal, not part of this design package. It does not require a new content database structure.

The old assertion that shouldCreateUser:false guarantees delivery only to the owner was too strong: preventing new users does not itself restrict an existing auth population to one address or enforce portfolio membership. Before implementation, inspect the actual auth configuration and design the owner-only send boundary under server control. Preserve a neutral response for unknown addresses and real rate limiting. A browser-only attempt counter is not a security control.

Decide and verify owner enrollment, template, expiry, delivery, resend throttling and recovery before removing any working access method. Existing owners are not deleted implicitly. Follow DECISIONS.md P3/P4 and root AGENTS.md.

## Acceptance when separately authorized

Test owner and non-member sessions, unknown address behavior, bad/expired codes, resend/abuse limits, session loss, preserved form data and RLS. Verify actual hosted email delivery manually. Do not replace hosted verification with a mocked send. Record which settings changed and rollback access.
