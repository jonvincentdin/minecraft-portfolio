# Project fact snapshot

Snapshot: 2026-10-23 (Asia/Singapore).

## Verified current state

- M00 merged through PR #1 at e6d134749a56f742a18009847d19940e89780c96. M01-M03 merged through PR #4 at e505c63e54e078e566e47dfacc2710f5fc13d70e.
- M04 merged to main through PR #7 (squash) at 656cedd8885086a6581e5a7620f0f905174537d5; implementation 84543ec, evidence 824ce5d.
- All seven public routes are React components. Both advancement trees, path glow and shared reveal/pixel motion are implemented. Only the editor remains a placeholder.
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
- Contact remains an unsent review; real owner content is not invented.

## Completed work with evidence

- M00-M03 verification records and evidence remain in context/.
- M04_VERIFICATION.md and evidence/m04 record the tree, motion and visual checks.
- Build/typecheck, 22 unit tests, 100 asset hashes, shell regression, test:m02, test:m03 and test:m04 (18 checks) passed.
- All 11 advancement screenshot pairs across five viewports, both trees, list view and a deep selection match the reference with zero differing pixels.

## Planned work

M05 editor; M06 Supabase; M07 full verification.

## Blockers and unknowns

Physical touch, other browser engines, separate modal-entrance timing and the four minor M03 dialog capture differences remain unverified or unresolved. Owner portrait, social URLs and verified credentials remain unsupplied. No deployment occurred.

## Next concrete steps

Start M05 from main only when requested.
