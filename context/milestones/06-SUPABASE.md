# M06 — Auth, persistence and publication

Status: implemented on feat/m06-supabase 2026-10-24 (Asia/Singapore) and verified against the migration in PGlite and a local Supabase API emulator. Not yet applied to or verified against a hosted project: the owner's Supabase URL and publishable key are still missing. See ../M06_VERIFICATION.md.

Dependency: M05.

## Scope

Implement reviewed schema, owner enrollment procedure, RLS, Auth, Storage, revision-guarded draft saves and atomic publish; connect editor adapter; migrate baseline exports and media.

## Acceptance

Authorized owner works across sessions; public sees published only; all unauthorized operations denied; failed saves preserve input; concurrency and media rules hold.

## Evidence to record

Development-instance migration output, positive/negative RLS and Storage tests, and draft/publish flow evidence. Missing credentials remain an explicit blocker, never a fabricated pass.

Update context/PROGRESS.md with actual work, decisions and remaining defects. Preserve the immutable reference and owner data.
