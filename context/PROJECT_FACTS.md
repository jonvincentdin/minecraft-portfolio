# Project fact snapshot

Snapshot: 2026-10-23 (Asia/Singapore).

## Verified current state

- M00 merged through PR #1 at e6d134749a56f742a18009847d19940e89780c96.
- M01-M03 merged to main through PR #4 at e505c63e54e078e566e47dfacc2710f5fc13d70e (merge commit). PRs #2 and #3 closed as merged by that merge.
- M03 implementation 56f3acf; verification record 0e9bf9f.
- Skills loadout, original table and React crafting workshop are implemented. Advancements/editor remain placeholders.
- Canonical assets and reference remain unchanged: 48 GLBs, 39 thumbnails; scene-data runtime. Reference revision: 47d8b1ca11b05db6791adaf9bf33a5cf9bd946ca.
- Supabase remains unavailable until M06. No remote save, authorization or publication behavior was added.

## Accepted decisions and source

- User authorized the next milestone, M03, on 2026-10-23; user authorized the PR #4 merge on 2026-10-23.
- Preserve the original renderer/CSS/models; no second renderer or generated assets.
- Keep #achievements and #advancements alias; original home fallback and explicit entry readiness remain.
- Visitor inventory and workshop progress are browser-local and never change actual skills.
- Close/navigation/reload refunds unfinished workshop ingredients; completed discoveries persist. Pause settles flights. Recipe clicks never silently collect output.
- Contact remains an unsent review; real owner content is not invented.

## Completed work with evidence

- M00_VERIFICATION.md, M01_VERIFICATION.md and M02_VERIFICATION.md retain earlier evidence.
- M03_VERIFICATION.md and evidence/m03 record actual crafting checks and visual limitations.
- Build/typecheck, 14 tests, 100 asset hashes, shell regression, M03 interaction/cancellation and edited-config browser checks passed.
- All six paths, exact quantities, double-click guards, keyboard/tap/drag alternatives, config invalidation and StrictMode fixture passed.
- All five skills-page viewport comparisons match exactly. Seven of eleven total pairs are exact; four dialog captures retain small top-region differences (maximum 0.513%).
- Three renderer teardown cycles return tracked resources to zero.

## Planned work

M04 advancements/motion; M05 editor; M06 Supabase; M07 full verification.

## Blockers and unknowns

Physical touch, other browser engines, full motion parity and minor dialog capture differences remain unverified/unresolved. Owner portrait/social URLs/verified credentials remain unsupplied. No deployment occurred.

## Next concrete steps

Start M04 from main only when requested.
