# Project fact snapshot

Snapshot: 2026-10-24 (Asia/Singapore), updated after M06 implementation.

## Verified current state

- M00 merged through PR #1 at e6d134749a56f742a18009847d19940e89780c96. M01-M03 merged through PR #4 at e505c63e54e078e566e47dfacc2710f5fc13d70e.
- M04 merged to main through PR #7 (squash) at 656cedd8885086a6581e5a7620f0f905174537d5; implementation 84543ec, evidence 824ce5d.
- M05 merged to main through PR #9 (squash) at 048ec692450b6282fe1cfcafe295cabba6f58ee0; implementation 6c1caeb, evidence c22121d.
- All seven public routes and the world editor are React components. The editor runs against a browser-local repository (IndexedDB jvd-world-local-v1: draft, published, recovery). There is no sign-in or shared backend.
- Canonical assets and reference remain unchanged: 48 GLBs, 39 thumbnails; scene-data runtime. Reference revision: 47d8b1ca11b05db6791adaf9bf33a5cf9bd946ca.
- Supabase remains unavailable until M06. No remote save, authorization or publication behavior was added.
- Seven project skills live in .agents/skills with Claude Code pointers in .claude/skills.

## Accepted decisions and source

- The user pre-authorized commit, push and merge for each milestone on 2026-10-23, and asked that the next milestone not start automatically.
- Preserve the original renderer/CSS/models; reference modules (crafting, tree-paths, motion) are copied byte-for-byte with integrity tests.
- Keep #achievements and #advancements alias; original home fallback and explicit entry readiness remain.
- Visitor inventory and workshop progress are browser-local and never change actual skills.
- Pause and reduced motion settle every running sequence, including a glow route in progress, a documented difference from the reference.
- Invalid trees are reported and not drawn; multiple roots are valid; no edge is drawn between roots.
- Local mode: public pages show this browser’s published snapshot (or the seed), preview shows the draft under a banner, and publishing never leaves the browser. Every change is validated as a whole document; stale saves are refused, keeping the edits.
- Deleting referenced projects or parent nodes requires an explicit choice; import keeps a recovery copy and never publishes.
- Contact remains an unsent review; real owner content is not invented.

## Completed work with evidence

- M00-M03 verification records and evidence remain in context/.
- M04_VERIFICATION.md and evidence/m04 record the tree, motion and visual checks.
- M05_VERIFICATION.md and evidence/m05 record the field coverage matrix, editor checks and visual differences.
- Build/typecheck, 29 unit tests, 100 asset hashes, shell regression, test:m02, test:m03, test:m04 (18 checks) and test:m05 (13 checks) passed.
- All 11 advancement screenshot pairs across five viewports, both trees, list view and a deep selection match the reference with zero differing pixels.

## M06 state (feat/m06-supabase, not merged)

- Migration, RLS, RPCs, storage policies, SupabaseContentRepository, EditorGate and the emulator-backed tests are on feat/m06-supabase, which is based on fix/m03-dialog-parity. Neither branch is merged and no PR exists yet: the GitHub CLI is not installed in this environment.
- Verified: test:db (11, PGlite), test:m06 (11 browser checks against the emulator), 36 unit tests, build, 100 asset hashes, and the demo-mode regressions smoke/M02/M03/M04/M05.
- Not verified: anything on a hosted Supabase project. No migration has been applied anywhere.

## Planned work

M06 hosted verification once credentials exist; M07 full verification.

## Blockers and unknowns

- **Supabase:** the owner's project URL, publishable key, owner account and approval to apply the migration.
- **Unverified:** physical touch, other browser engines and separate modal-entrance timing.
- **Resolved:** the M03 dialog capture residual (backdrop-blur compositing); all 11 M03 pairs are exact.
- **Content not yet supplied:** owner portrait, social URLs and verified credentials.
- **Deployment:** none has occurred.

## Next concrete steps

1. Open PRs for fix/m03-dialog-parity and feat/m06-supabase, in that order, and merge after review.
2. With credentials: follow supabase/README.md on a development project, then run the browser flow there and record the evidence in M06_VERIFICATION.md.
