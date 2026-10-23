# Project fact snapshot

Snapshot: 2026-10-23 (Asia/Singapore).

## Verified current state

- M00 is merged to main through https://github.com/jonvincentdin/minecraft-portfolio/pull/1 at e6d134749a56f742a18009847d19940e89780c96. Its local/remote feature branches were deleted. Local main is current.
- M01 implementation 729f932 is on feat/m01-shell-entry, based on that merge. React shell, Spawn and explicit entry/replay are implemented. Other public routes and editor remain placeholders.
- Canonical assets and reference remain unchanged: 48 GLBs, 39 thumbnails, scene-data runtime. Documented original reference source revision remains 47d8b1ca11b05db6791adaf9bf33a5cf9bd946ca.
- Demo content works without credentials. Supabase operations remain unavailable until M06; no auth, RLS or database operations were added.

## Accepted decisions and source

- User approved M00 merge and deletion of its feature branch on 2026-10-23; this does not authorize M01 merge.
- Original custom renderer, CSS cascade, reference DOM structure and motion timings remain authoritative (context/MOTION.md and reference/site).
- Retain #achievements from the reference, with #advancements alias for M00 links.
- Preserve original crafting-table thumbnail as home fallback; no generated replacement.
- Root font/model/content readiness gates Enter; model failure uses an honest fallback notice. Header/main/footer stay inert independently of exit timing.

## Completed work with evidence

- M00_VERIFICATION.md retains foundation evidence.
- M01_VERIFICATION.md and evidence/m01 contain GPU/browser evidence, teardown checks, screenshots and pixel comparisons.
- Build/typecheck, five tests, 100-asset verification and browser smoke pass. Six matched screenshot comparisons have zero differing pixels.
- Explicit ready gate, two replays, reduced-motion interruption and rapid navigation pass. Shader failure also falls back safely.

## Planned work

M02 public content routes; M03 crafting/skills; M04 advancements/motion; M05 editor; M06 Supabase; M07 full verification.

## Blockers and unknowns

Physical touch, other browsers and broader motion/route parity remain unverified. Owner portrait/social URLs/verified credentials remain unsupplied. No production deployment performed.

## Next concrete steps

Review the M01 draft PR before merge. Continue M02 only when requested. Preserve immutable reference, assets and verification evidence.
