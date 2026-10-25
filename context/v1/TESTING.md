# Verification and acceptance

“1:1” is a verification goal, not a promise made from a prompt alone. Compare the reference and React implementation in the same browser, OS, viewport, zoom, font readiness, content seed, selected route and motion state.

## Visual comparison

Capture all seven routes, intro ready state, editor tabs, project modal, workshop, both advancement trees and multi-character comparison. Use desktop 1440×900 and mobile 390×844 first; check 1366×768, 1024×768 and 768×1024 when layouts differ. Freeze random/idle animation only in screenshot tests. Compare overlays/diffs and review every material mismatch; font-antialiasing exceptions require documentation. A single global image-difference percentage is insufficient for testing model orientation or tiny text defects.

## Domain tests

Reuse `reference/check-crafting.mjs`, `check-trees.mjs`, `check-assets.mjs` as test specifications; their paths expect a `dist` folder, so adapt paths or port assertions rather than claiming they run unchanged here.

- Recipes: translated manual patterns; exact counts; refund before autofill; insufficient resources; prerequisite order; no double collection; nonnegative bag/grid totals; stack splitting; configuration migration; specialized React result.
- Trees: initial root path; common ancestor; ancestor/descendant/sibling navigation; disconnected roots; rapid selection cancellation; cycle/missing-parent rejection; delete-parent rules.
- Inventory: move/swap/reset; filtered views; added/deleted projects; touch/tap/keyboard alternatives.
- Models: asset SHA integrity; correct drag sign; two eyes in all characters; table face depth; wireframe without triangle diagonals; fallback; cleanup across route changes.

## Browser flows

Intro never auto-enters; enter and replay twice; pause/unpause; reduced-motion setting; fast route changes; project gallery; two selected experience chapters; both trees and connection editing; recipe click flies only needed units; craft React after prerequisites; actual skills visible before play; all editor CRUD/media flows; import/export; form errors preserve input.

Check keyboard navigation, focus restoration, Escape, focus-visible outlines, alt text, announcements, dialog inertness and scroll containment. Verify a real WebGL device and a physical touch device; report any untested environment explicitly.

## Backend tests

Anonymous and unenrolled users cannot read drafts, write content, enroll themselves, publish or upload/delete media. Owner can save and publish. Public reads see only the published revision. Test concurrent draft saves, publish revision conflict, invalid JSON, cross-tree link, recipe cycle, failed upload, orphan cleanup and private-draft file access. Test through real client credentials with RLS active, not solely through a privileged dashboard.

## Completion evidence

Successful typecheck and production build, meaningful domain and RLS tests, browser workflow results, screenshot comparison report, preserved asset hashes, no new application console errors, and a list of remaining owner-content placeholders. Do not report unrun tests as passed.
