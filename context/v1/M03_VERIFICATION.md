# M03 verification - 2026-10-23 (Asia/Singapore)

Implementation: 56f3acf on feat/m03-crafting-skills, based on M02 32c263a. M01 PR #2 and M02 PR #3 are unmerged dependencies.

## Implemented

React skills loadout, centered original crafting table and native workshop dialog. Actual skills retain descriptions, levels, sample labels, model overrides and evidence/project links independently of visitor play. Linked projects open the inventory with the intended project selected.

The original crafting-data.js and crafting-engine.js are copied byte-for-byte with TypeScript declarations. React components own the recipe book, inventory stacks, 3x3 grid, result, checklist, discoveries and interaction state. Recipe clicks reserve exact quantities and require explicit output collection. Manual selection, tap, drag, grid moves and keyboard return remain available. Configured outputs retain specialized models, including skill_react; optional classic-book output is supported.

Animation reservations update synchronously before another activation can run. Each required unit flies from its actual inventory cell for 420ms with 90ms staggering. Pause settles flights; close/navigation invalidates asynchronous completion and refunds unfinished ingredients. Completed discoveries persist only in jvd-workshop-play-v2, separate from portfolio content. Malformed or differently fingerprinted play data starts fresh.

## Deliberate differences from the reference

- Reference close retains the filled grid in local play state. The React version refunds unfinished reservations on close, route teardown and reload, preventing stranded pending work while preserving completed discoveries.
- Explicit Tab boundary handling keeps focus inside the dialog; browser testing exposed native backward-tab focus escaping to the document boundary.
- Existing validators are reused, with an additional own-property item-ID check at the adapter boundary to reject inherited object names.
- Skill-linked project selection uses #projects/<id> so the React inventory can open the corresponding inspector.
- Opening the workshop resets its instructional message after a prior refund. No reference CSS, source, geometry or canonical asset was changed.

## Checks actually run

- npm run build: strict typecheck and production bundle passed.
- npm test: 14 tests passed. Coverage includes translated patterns, all six recipe paths, exact consumption/refunds, repeated autofill, no double collection, prerequisites based on discovery, edited quantities, stack splitting, invalid configuration, fingerprint recovery, content separation and original-copy integrity.
- npm run assets:verify: all 100 original hashes passed, including skill_react.glb.
- npm run test:browser: shell/intro regression passed on Edge / NVIDIA RTX 4060; no page errors. The non-model teardown destination is now the Advancements placeholder.
- node tests/e2e/m03.mjs: six complete paths, exact bag/grid totals, recipe/search filters, two-click restart, duplicate clicks, manual translated placement, drag/move/return, keyboard return, persistence, focus, always-visible skills and owner-content separation passed.
- Real-motion close, route change and reduced-motion cancellation passed. Default recipe flights contain three single-unit ghosts. No stale ghosts remain.
- Three route teardown cycles return tracked frames, WebGL buffers/programs and observers to zero.
- Emulated mobile tap placement and blocked storage notice passed.
- node tests/e2e/m03-config.mjs: StrictMode fixture with 130 books splits into 64/64/2; edited 3-book/2-dye/1-special recipe makes six single-unit flights and two outputs; configured classic-book model works; changed configuration resets play.
- Table drag uses the original -0.009 yaw per horizontal pixel, with solid and authored-edge wireframe screenshots inspected for top/side depth alignment.
- git diff --check and staged diff checks passed.

## Visual evidence and reproduction

Screenshots and reports are in evidence/m03. With dev and reference servers running:

```powershell
npm.cmd run test:m03
node tests/visual/capture-m03.mjs
node tests/visual/compare-m03.mjs
```

The visual capture script aligns page and internal scroll positions after the interaction tests. Viewports: 1440x900, 390x844, 1366x768, 1024x768 and 768x1024. All five full-page skills screenshots match exactly, including the table and six loadout cards. Workshop dialogs at 1024 and 768 also match exactly.

All eleven final pairs have zero differing pixels (re-verified 2026-10-24, three consecutive runs).

Dialog residual, resolved 2026-10-24: the original captures showed 2061 (1440), 1688 (390), 2567 (1366) and 2061 (crafted) differing pixels at most 6/255 per channel, confined to a band just outside the dialog's top/left edge (y=7..89). Root cause is Chromium compositing of the `.craft-dialog::backdrop` `blur(5px)` edge after a preceding fullPage capture, not the implementation: the dialog trees have the same elements, boxes and computed styles (attribute order and `draggable=false` on empty cells aside); the page under the dialog and the blurred backdrop with the dialog hidden are pixel-identical; without the prior fullPage capture both sides are identical; and the reference's own frames vary under the same blur. The capture now disables the backdrop blur identically on both sides for the exact pairs, and still records the as-rendered pairs as `*-blur.png` with `maxChannelDelta` in comparison.json (1440 and 1366/390 at Δ6 and Δ4, 1024/768 identical). No application or reference CSS changed.

Desktop/mobile layouts, the solid/wireframe table and crafted React output were visually inspected. Full-page screenshots may be taller than their viewport.

## Boundaries and delivery

M03 is implemented and functionally verified; the dialog capture residual is explained and resolved above. Physical touch hardware, other browser engines and full motion-recording comparison remain unverified. The edited-content fixture is an ignored test artifact, not an owner editor. Owner content remains demo-labeled. No new dependency, backend, migration, environment, publication or deployment changes.

Feature branch: feat/m03-crafting-skills; draft PR targets main and depends on #2 and #3. Merge remains separately authorized. Roll back through a focused revert PR without changing immutable assets or database state. M04 is not started.
