# M04 verification - 2026-10-23 (Asia/Singapore)

Implementation: 84543ec on feat/m04-advancements-motion, based on main 397bba2 (M00-M03 merged).

## Implemented

React advancements page (`src/features/advancements/AdvancementsPage.tsx`) with separate Achievements and Certifications trees, orthogonal SVG connectors, node buttons, inspector, pan, zoom, Center map and list view. The markup, class names and strings match the reference, so reference.css applies unchanged.

`tree-paths.js` and `motion.js` are copied byte-for-byte from reference/site, with TypeScript declarations and integrity tests. React creates one path animator per drawn tree and destroys it on redraw or unmount. The animator owns `path-lit` and the dash offsets, so the `active` class is toggled directly rather than through React's className. The inspector is keyed per selection, so the stylesheet's `detailArrive` entrance replays as it did with the reference's innerHTML.

`src/domain/advancement-trees.ts` validates each tree before drawing: duplicate ids, parents missing or in the other tree, cycles and positions outside 0-900 are rejected. Multiple roots are valid.

Shared motion: App mounts the reference section reveal once per rendered route, never while the intro is open, and cancels it on pause. A document-level listener adds the reference pixel burst to `.btn` clicks, except while paused, editing or during the intro.

## Deliberate differences from the reference

- **Pause mid-route:** pausing or switching to reduced motion while a glow route is animating settles it on the current selection at once. The reference lets the sequence finish. MOTION.md requires pauses to settle.
- **Invalid trees:** an invalid tree shows an alert and is not drawn. The reference draws whatever data it receives.
- **pointercancel:** it also removes `.panning`. The reference left the class set after a cancelled drag.

## Checks actually run

- `npm run build`: strict typecheck and production bundle passed.
- `npm test`: 22 tests passed. The 8 new tree tests cover:
  - every check-trees.mjs assertion, ported
  - ancestor, descendant and sibling routes
  - disconnected roots that never animate an edge
  - reverse-then-forward order with final edge state
  - rapid selection settling on the last node
  - paused settling
  - validation, including inherited names such as `constructor`
  - demo tree independence
  - byte identity of both copied modules
- `npm run assets:verify`: all 100 original hashes passed, including skill_react.glb.
- `npm run test:browser` (shell regression; teardown destination updated to the new Advancements heading), `npm run test:m02` and `npm run test:m03`: passed.
- `npm run test:m04`: 18 checks passed in Edge (RTX 4060), with no page errors. React and the reference ran side by side in separate contexts:
  - **Markup:** structure matches the reference for the achievements map, the certifications map and the list view.
  - **Selection:** every node lights exactly its root path, with matching inspector text; keyboard Enter selects.
  - **Map controls:** zoom 50-180%, pan clamps, Center map, tree reset and list behavior match after every step.
  - **Glow sequence:** a sibling route retracts in reverse, then extends. Edges run 280ms ease-in-out with forwards fill, and the node pulse runs 400ms.
  - **Interruption:** five rapid clicks settle identically to the reference. Pause and a reduced-motion change mid-route settle immediately.
  - **Section reveals:** 460ms, backwards fill, with identical delays and counts on all seven routes. Pausing mid-reveal and interrupting a route leave every group at opacity 1.
  - **Pixel burst:** six 440ms pixels, centred for keyboard activation, none while paused, all removed afterwards.
  - **Hover and press:** settled transforms match (-3px lift; 0.98 scale with 1px press).
  - **Teardown:** three teardowns leave zero frames, observers and script animations.
  - **StrictMode fixture:** across disconnected roots it runs one sequence (retract, retract, then the new branch only), never draws an edge between roots, and shows an alert for an invalid tree.
- `git diff --check` passed.

## Visual evidence and reproduction

Screenshots and reports are in evidence/m04. With the dev and reference servers running:

```powershell
npm.cmd run test:m04
node tests/visual/capture-m04.mjs
node tests/visual/compare-m04.mjs
```

Captures use reduced motion, so the glow and reveals are settled, plus loaded fonts, decoded images and the mouse at 0,0. Pairs: the achievements map at 1440x900, 390x844, 1366x768, 1024x768 and 768x1024, plus certifications, list view and the ach4 selection at 1440 and 390. All 11 pairs have zero differing pixels; see comparison.json. The ach4 and list captures were also inspected by eye.

## Boundaries and delivery

M04 is implemented and verified for desktop Edge with emulated input.

**Not verified:**
- physical touch panning of the map
- other browser engines
- independent timing of the stylesheet-driven modal entrance, which is unchanged since M02/M03

**Known limitation:** a hash change that stays on the same route (for example `#projects/<id>`) does not re-run section reveals, while the reference re-rendered on every hash change.

Tree editing remains M05; owner content remains demo-labeled. There are no new dependencies, backend, migrations or environment changes; package.json only gains the `test:m04` script.
