---
name: jvd-advancement-graphs
description: Port, change or debug the JVD portfolio advancement trees in React - tree topology, root/shortest-route glow, rapid-selection cancellation, pan/zoom/list view and the inspector. Use for M04 tree work and for any later change to node links, layout or path animation.
---

# Advancement trees

## Establish the task

Read applicable AGENTS.md, context/features/07-ADVANCEMENTS.md, context/milestones/04-TREES-MOTION.md, context/MOTION.md, context/DATA_MODEL.md and the advancement lines of context/TESTING.md. Treat reference/site/tree-paths.js, the `route==='achievements'` block of reference/site/public.js and reference/check-trees.mjs as authority. Editor connection work belongs to M05 and reference/site/tree-editor.js; do not build it here unless asked.

## Port the topology, do not rewrite it

1. Copy reference/site/tree-paths.js byte-for-byte into src/domain with a .d.ts declaration, the way M03 copied crafting-engine.js. Add the file to .gitattributes `-text` and to the original-copy integrity test. Wrap it with typed adapters instead of editing it.
2. Keep its semantics exactly: `rootPath` walks parents to a root and stops on a repeated id; `routeBetween` takes the longest common prefix, `retract` is the old non-shared tail reversed, `extend` is the new non-shared tail, and index 0 (the root, which has no edge) is never animated. `disconnected` is true when both paths exist with no shared prefix. `canConnect` rejects self, missing nodes and cycles; an empty parent detaches to root.
3. Achievements and certifications are separate trees. Validate at the adapter boundary: own-property ids, at most one parent, parent in the same tree, no cycles, positions within 0-900. Multiple roots are valid. Reject invalid content visibly; never draw a fictitious edge between roots.
4. Port every assertion in reference/check-trees.mjs into tests/unit (the script itself imports ./dist and cannot run unchanged). Add cases for a cross-tree parent, a missing parent, a cycle in loaded data and a selection id absent after a tree switch.

## Build the page as React components

1. Match the reference markup and class names so reference.css applies unchanged: `.advancement-page`, `.adv-toolbar` with `.tree-tabs` (aria-pressed, counts) and `.map-controls`, `.adv-explorer` with `#map-viewport` > `.map-coordinate` + `#map-world`, `.adv-inspector` (aria-live polite) and `.adv-legend`. Copy the visible strings exactly.
2. Edges: an SVG `.tree-lines` with viewBox 0 0 1000 1000; each child has a base path plus `.glow-edge` with `data-glow-edge=<child id>` and `pathLength="1"`, both using `treeLine` (orthogonal H/V/H). Nodes are `<button class="tree-node">` (`cert-node` on certifications) at left/top x/y with `--delay: i*70ms`, `aria-label` title and `aria-pressed` on the selected node.
3. State: tree, selected (first node of the tree by default, kept when it still exists), zoom 1 with ±0.15 steps clamped 0.5-1.8 (ignored in list mode), pan starting {30,25} clamped x -850..450 and y -450..350. Switching tree resets selection, zoom and pan. Center map resets zoom and pan. List view swaps to `.node-list-item` buttons with transform none and toggles its own label between List view and Map view.
4. Pan with pointer capture on the viewport only when the target is not a button; add and remove `.panning`; handle pointercancel. Write the transform through a ref inside requestAnimationFrame or directly; do not re-render React per pointer move.
5. The inspector shows CREDENTIAL RECORD or MILESTONE RECORD, the thumbnail for `item_<symbol>`, the SAMPLE ENTRY or PORTFOLIO ENTRY chip, date and issuer/context ("Not provided" fallback), and a safe evidence link ("Verify credential" or "View evidence") or the editor help text. Reuse `safeUrl` from src/lib/urls.ts. Key the inspector children on the selected id so the CSS `detailArrive` entrance replays on each selection. Do not invent owner credentials.

## Drive the glow animator from React

1. Create the animator in an effect keyed on the drawn tree and the list/map mode, passing the world element, the node array and a `paused` getter that reads a ref. Call `destroy()` in cleanup; React StrictMode will mount it twice.
2. Call `select(id)` when the selection changes, including the initial selection after drawing. The animator cancels the previous sequence itself; do not add a second queue or debounce.
3. Rapid clicks must leave exactly the final node's root path lit (`strokeDashoffset` 0 on its edges, 1 elsewhere, `.path-lit` only on its path), with no running animations once settled. Pause or reduced motion settles instantly.

## Verify

- Unit: all ported check-trees assertions, validation cases and the copy-integrity hash pass under `npm test`.
- Browser (Edge, both servers running): first select lights root to node; a sibling select retracts then extends in order; disconnected roots clear then start; five rapid clicks settle on the last; tree switch, list toggle, zoom limits, pan clamps and Center map match the reference; keyboard Tab/Enter selects nodes; no page errors; route teardown leaves no running animations.
- Visual: capture both trees in map and list views beside the reference at the TESTING.md viewports and compare with the jvd-parity-qa workflow.

Record what actually ran in context/M04_VERIFICATION.md and context/PROGRESS.md.
