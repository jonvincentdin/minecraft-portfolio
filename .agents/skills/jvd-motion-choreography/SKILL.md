---
name: jvd-motion-choreography
description: Implement or change JVD portfolio motion in React - section reveals, hover/press, pixel feedback, panel and detail motion, route exit, item flights and advancement path animation - with real timing, cancellation, pause and reduced-motion settling. Use for M04 motion parity and any later animation edit.
---

# Motion choreography

## Establish the task

Read applicable AGENTS.md, context/MOTION.md (the timing table is the contract), context/USER_FLOWS.md and context/milestones/04-TREES-MOTION.md. Authority is reference/site/motion.js, app.js, style.css, workshop.js and tree-paths.js. Use CSS and the Web Animations API; do not add an animation library.

## Inventory before building

List each MOTION.md row as already ported, missing or partial by reading src. As of M03 the intro, route exit (src/app/App.tsx), workshop flights and the model renderer are ported. The section reveal (`mountSectionMotion`, `reveal`) and pixel feedback (`pixelBurst`) from motion.js are not yet in src. CSS-driven hover, press, nav underline and modal entrance come from reference.css; confirm them in the browser rather than reimplementing them.

## Port shared motion

1. Copy reference/site/motion.js byte-for-byte into src (with a .d.ts, `-text` in .gitattributes and an integrity test) and call it from a hook such as `useSectionMotion(rootRef, pausedRef)` that runs after the route content renders and returns the module's cleanup.
2. Keep the reveal selector list and its semantics: `data-reveal-order = index mod 5`, a 42ms stagger, a 0.08 threshold, unobserve after the first reveal, `fill: 'backwards'` so the end state is the element's own style, and skip entirely when paused or IntersectionObserver is missing. Re-run when the route changes or content first arrives, not on every render.
3. Pixel feedback matches the delegated document click listener in reference/site/app.js: only `event.target.closest('.btn')`, and skipped while paused, while `body.editing` is set or while `body.intro-open` is set. Register it once at app level with cleanup. Keyboard activation (`event.detail === 0`) bursts from the button centre; pixels remove themselves on finish.
4. Detail text is CSS, not script: `#adv-inspector>*`, `#project-summary>*`, `#role-detail>*` and `#journal-text>*` use `detailArrive .34s cubic-bezier(.16,1,.3,1) both`, with `:nth-child(2)` delayed 45ms and `:nth-child(3)` 85ms, and `animation: none` when paused. In React the animation only replays if those children remount, so key the inspector content on the selected id; do not reimplement it with WAAPI. Keep the native dialog focus and inert handling independent of animation completion.

## Cancellation and settling rules

- Track every Animation you start in a set; cancel all of them in effect cleanup and on route change. StrictMode double-mount must not leave duplicate observers or animations.
- End states must be fully opaque and in place. With `fill: 'backwards'` the element's own style is the end state; with `fill: 'forwards'`, commit or cancel explicitly. Never leave opacity 0 or a transform waiting for an event that cancellation skips.
- The pause toggle and `prefers-reduced-motion` share the `paused` state in App.tsx, which already follows media changes. Read it through a ref inside async sequences, so pausing mid-sequence settles instead of continuing.
- Reduced motion skips spatial transitions and flying particles, never the explicit Enter world action or focus moves.
- Capture geometry before moving ghosts, use transforms and opacity, and avoid layout reads on every pointer frame.

## Verify with real timing

1. In Edge with real motion (not `reducedMotion: 'reduce'`), use `document.getAnimations()` to read durations, delays, easing and keyframes and compare them with MOTION.md and with the same probe on the reference at port 4174. Record mismatches.
2. Cancellation: navigate away mid-reveal, pause mid-reveal, click advancement nodes rapidly and close a dialog mid-flight. Afterwards assert `document.getAnimations().length === 0` once settled, every revealed element has computed opacity 1 and no transform offset, and no `.interaction-pixel` remains.
3. Toggle reduced motion while a route is open, using `page.emulateMedia({ reducedMotion })`, and confirm it settles immediately.
4. Three route teardown cycles return the tracked frames and observers to zero; reuse the `__lifecycle` init script from tests/e2e/m03.mjs.
5. Screenshot tests freeze idle motion only in test mode; keep production randomness.

Report actual timings measured, any differences kept on purpose and what remains unverified, such as physical touch or other engines.
