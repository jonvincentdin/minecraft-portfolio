# Project fact snapshot

Snapshot: 2026-10-23 (Asia/Singapore).

## Verified current state

- M00 merged through PR #1 at e6d134749a56f742a18009847d19940e89780c96. Main remains at that commit.
- M01 shell, Spawn and explicit entry/replay are on feat/m01-shell-entry, draft PR #2, not merged.
- M02 implementation 9cc422f is on feat/m02-public-routes, based on M01 b1b561c. About, project inventory/gallery, Experience and Contact now use React components.
- Canonical assets and reference remain unchanged: 48 GLBs, 39 thumbnails, scene-data runtime. Reference source revision: 47d8b1ca11b05db6791adaf9bf33a5cf9bd946ca.
- Demo content works without credentials. Supabase remains unavailable until M06; no authorization, publication or remote-save implementation.

## Accepted decisions and source

- The user requested M02 on 2026-10-23. Earlier M00 merge authorization does not authorize M01/M02 merges.
- Preserve original CSS, renderer, geometry and reference layouts. No second renderer or generated models.
- Retain #achievements with #advancements alias; preserve the original crafting-table fallback. Root font/model/content readiness gates entry and the shell stays inert during exit.
- Inventory layout is visitor-local under jvd-slots-v5; project content stays unchanged. Blocked storage reports session-only behavior.
- Contact remains an explicit unsent review. Sample projects and experience labels remain visible.

## Completed work with evidence

- M00_VERIFICATION.md and M01_VERIFICATION.md retain prior evidence.
- M02_VERIFICATION.md and evidence/m02 contain route screenshots, pixel comparisons, pointer evidence and interaction reports.
- Build/typecheck, eight unit tests, 100-asset verification, M01 browser regression, M02 interactions and pointer/modal tests passed.
- Eleven matched M02 screenshot pairs have zero differing pixels. Five character models show two eyes and correct drag direction. Three model-route teardown cycles return tracked resources to zero.

## Planned work

M03 crafting/skills; M04 advancements/motion; M05 editor; M06 Supabase; M07 full verification.

## Blockers and unknowns

Physical touch, other browser engines and broader motion parity remain unverified. Owner portrait/social URLs/verified credentials remain unsupplied. No production deployment performed.

## Next concrete steps

Review M01 draft PR #2 before the dependent M02 draft PR. Keep both branches until authorized merge. Start M03 only when requested.
