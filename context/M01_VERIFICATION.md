# M01 verification - 2026-10-23 (Asia/Singapore)

Implementation: 729f932 on feat/m01-shell-entry, based on M00 merge e6d134749a56f742a18009847d19940e89780c96.

## Implemented

Reference header/footer and Spawn in React components; original CSS and WebGL scene-data renderer preserved. Entry states loading/ready/exiting/entered, real content/model/font readiness, explicit Enter world, shuffled foreground and eight-strip upward exit, home staged beneath, replay, inert shell and focus management. Live reduced-motion preferences and pause controls settle animation state. Hash navigation cancels stale exits. Original #achievements URL retained; M00 #advancements remains an alias.

Original source/download bundles now synchronize to public/downloads for the working reference footer links. Generated copies remain ignored. No dependency, backend, canonical model or reference changes.

## Actual checks

- npm run assets:verify: 100 original files passed.
- npm run build (includes typecheck): passed.
- npm test: five foundation tests passed.
- npm run test:browser: passed with Edge and NVIDIA GeForce RTX 4060 / ANGLE Direct3D11.
- Ready waits 10 seconds without entering. Keyboard focus stays in intro; shell inert until entry; main focused afterward.
- Two completed replays, eight exit strips, reduced-motion change during exit, rapid hash changes and pause toggle passed.
- Three route teardown cycles leave zero tracked RAF callbacks, buffers, programs or observers. No page exceptions.
- Scene fetch failure and forced absent WebGL both show the supplied crafting-table fallback. A targeted shader-initialization failure check also recovers to the thumbnail with no page exceptions.
- Full exit timeline configured to 1322ms; measured click-to-detached wall time ranged 1366-1858ms across runs, including automation scheduling.
- Footer archive request returns 200. Responsive captures have no document overflow.
- git diff --check passed. assets/ and reference/ have no changes from main.

## Visual evidence

Screenshots and reports: evidence/m01/. Run node tests/visual/compare-m01.mjs after the browser test.

Matched reduced-motion captures in the same Edge browser/GPU show zero differing pixels for ready intro at 1440x900 and home at viewports 1440x900, 390x844, 1366x768, 1024x768 and 768x1024. Full-page captures can be taller than the viewport. Desktop/mobile images were also visually reviewed for typography, composition and model appearance.

Initial small differences were isolated to a settling native progress bar and a hovered social control. Waiting for settled progress and moving both pointers away resolved them; no reference or application styles were changed to conceal a mismatch. This is evidence for these captured states, not a claim of universal pixel parity.

## Limits and next work

Other public routes and editor remain honest placeholders. M02 covers About, Projects, Experience and Contact. M03/M04 cover crafting and advancements. Physical touch devices, browser engines other than Edge, full motion recording comparison and backend/RLS remain unverified or out of scope. No production deployment or database operation occurred.

## Git delivery

M00 was merged through PR #1 at the owner's explicit request; local and remote M00 feature branches were deleted only after ancestry verification. Local main tracks origin/main. M01 is delivered as a separate draft PR, not merged by the M00 authorization.
