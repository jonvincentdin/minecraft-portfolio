# Testing and evidence

Updated 2026-10-27. Test screenshots, traces and JSON reports stay in ignored test-results/. The explicitly requested MP4 is a tracked design deliverable. PROGRESS.md records commands that actually ran and known limitations.

## This design package

- node context/v2/previs/build-models.mjs: deterministic geometry and GLB export checks, bounds and hashes.
- node context/v2/previs/check.mjs: browser rendering, desktop/tablet/mobile screenshots, project scrolling, dialog focus, pause/reduced motion, server boundaries, resource counts and model review views.
- node context/v2/previs/record.mjs: record the complete concept; inspect sampled frames and final media metadata.
- npm.cmd run assets:verify: canonical hashes, including React GLB/thumbnail/scene data.
- npm.cmd test and npm.cmd run test:db: retained v1 contracts; local DB tests do not establish hosted state.
- npm.cmd run build: existing production app remains buildable.
- git diff --check; review scoped diff and ensure no migration, dependency or canonical asset change.

## Exported video

The delivered video is also checked independently with `node context/v2/previs/check-video.mjs`: browser decode, dimensions, duration, playback advancement and fifteen seeks. Review `test-results/v2-previs/video-contact-sheet.png` for the first/last frame and section coverage. The capture target is 30fps; the encoder produces variable frame intervals, so do not claim a constant frame rate or use the recording as a performance benchmark.

## Production acceptance (not completed by this previs)

At 390, 768, 1024, 1440 and 1920px: no page overflow, readable content, complete project collection, usable controls. Keyboard traversal must bring focused project controls into view. Test forward/reverse scroll, deep links, browser find, resizing, pause and runtime preference changes.

Case-study dialog traps focus, closes with Escape and restores the invoking element. Contact review preserves input and does not fake a send. Reduced motion gives complete vertical content. Validate WebGL fallback and at most three contexts; dispose listeners, observers and frames under React remounts.

Use unchanged domain and authorization tests. Check import/export compatibility, revision conflicts, publication atomicity, private media access and retained unused fields when production integration changes those paths.

Record browser/viewport and renderer vendor. A successful headless WebGL render may use software; do not call it hardware acceptance. Measure performance on a representative device and test physical touch and assistive technology separately. No blanket claim of 60fps, accessibility conformance or production readiness without those checks.
