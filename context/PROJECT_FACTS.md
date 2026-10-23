# Project fact snapshot

Snapshot: 2026-10-24 (Asia/Singapore).

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

## Planned work

M06 Supabase sign-in, shared drafts, Storage, atomic publish and RLS behind the existing repository contract; M07 full verification.

## Blockers and unknowns

Physical touch, other browser engines, separate modal-entrance timing and the four minor M03 dialog capture differences remain unverified or unresolved. Owner portrait, social URLs and verified credentials remain unsupplied. No deployment occurred.

## Next concrete steps

Start M06 from main only when requested. M06 needs the owner’s Supabase project URL and publishable key, and approval for migrations and RLS policies.
