# M02 verification - 2026-10-23 (Asia/Singapore)

Implementation: 9cc422f on feat/m02-public-routes, based on M01 b1b561c. M01 draft PR #2 remains a dependency, not a merged milestone.

## Implemented

React components replace the About, Projects, Experience and Contact placeholders. Home remains the M01 React implementation. The original CSS, scene-data geometry, custom renderer and canonical assets remain unchanged.

- About: oak portrait frame with honest missing-photo state, casual avatar, chapter journal.
- Projects: 14 demo projects in 27 initial slots, expanding capacity, ID reconciliation, move/swap/drag, arrow-key and select-then-place alternatives, category/search filters, browser-local persistence and reset. Failed storage writes display a session-only notice.
- Case studies: original gallery, captions/alt text and story fields, safe links, native modal, Escape/close control, focus containment and restoration.
- Experience: five original character models, outfit selectors, chapter details, multi-chapter comparison and rotate/reset/wire controls.
- Contact: required/email validation and local review retaining the form values. Explicitly states that nothing was sent.

No dependency, authentication, database, publication or deployment changes. package.json adds only test:m02. M03/M04/M05 routes remain placeholders.

## Actual checks

- npm run build: typecheck and Vite production bundle passed.
- npm test: eight tests passed, covering content boundaries, immutable source copies, inventory reconciliation/moves and URL handling.
- npm run assets:verify: all 100 original assets passed, including skill_react.glb.
- npm run test:browser: M01 shell/entry regression passed on Edge / NVIDIA GeForce RTX 4060, no page errors. Cleanup now navigates to the remaining Crafting placeholder because Projects mounts a model.
- node tests/e2e/m02.mjs: four routes; journal/avatar; gallery switching; Escape and opener focus; inventory move/swap/drag/filter/reset/persistence; keyboard arrangement; five models and controls; comparison; contact review; blocked-storage notification; emulated touch arrangement; thumbnail fallback all passed, no page errors.
- Three model-route teardown cycles left zero tracked frame callbacks, WebGL buffers/programs and observers.
- node tests/e2e/m02-pointer.mjs: all five characters respond to a right/down pointer drag with yaw -0.27 and elevation +0.04 radians. Native modal Tab/Shift+Tab containment and close control passed.
- git diff --check and staged diff checks passed. Immutable renderer, CSS, assets and reference were not changed.

## Visual evidence

Reports and paired screenshots: evidence/m02/. Final capture sequence:

```powershell
npm.cmd run test:browser
npm.cmd run test:m02
node tests/visual/capture-m02.mjs
node tests/visual/compare-m02.mjs
```

Keep both dev and reference servers running. Browser checks require installed Microsoft Edge. The capture script refreshes matched route/dialog states after interaction tests; compare-m02 also includes the comparison-panel screenshot from test:m02.

All eleven final pairs have identical dimensions and zero differing pixels: four routes at 1440x900 and 390x844; desktop/mobile project dialog; desktop two-chapter comparison. Full-page route captures may exceed viewport height. This establishes parity only for these captured reduced-motion states on the same browser/GPU.

Visually inspected desktop/mobile layouts, dialog readability, avatar, all five outfits and both eyes in their default and opposite-side oblique views. Initial comparison caught an extra scene set() changing the project camera on first mount; the wrapper now calls set() only for subsequent scene changes. Contiguous label text also preserves reference glyph spacing. No immutable source was edited to make comparisons pass.

## Boundaries and delivery

Physical touch hardware, other browser engines, full motion recordings and production backend permissions remain unverified. Touch coverage is browser emulation. The supplied portrait, real social URLs and verified career/project claims remain absent and are not invented. The contact form sends no network message.

Feature branch: feat/m02-public-routes. Draft PR targets main and depends on M01 PR #2. Neither M01 nor M02 has merge authorization from this task. No production deployment or database operation occurred. Review M01 first, then review the M02-only diff from b1b561c. A regression should be handled by a focused revert, preserving the reference and owner content.

Stop before M03 until requested.
