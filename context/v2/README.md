# Jon Vincent Din — Builder’s Exhibition

Revised 2026-10-27 (Asia/Singapore). v2 presents the portfolio through a Minecraft-inspired exhibition: large project imagery, readable case studies, a restrained voxel setting, and smooth continuous scroll motion. The existing enchanted DIN brand remains.

## Status

This delivery is a design specification, original review models, and a working local previsualization. It is not the production React v2 implementation. V2-01 onward remain pending. Actual verification and delivery state are in PROGRESS.md and PROJECT_FACTS.md.

## Start here

1. Read root AGENTS.md, then BRIEF.md, CONTEXT.md, CURRENT_STATE.md and DECISIONS.md.
2. Read STORYBOARD.md, DESIGN_SYSTEM.md, MOTION.md and MODELS.md together.
3. Read DATA_MODEL.md, ARCHITECTURE.md and the current milestone before coding.
4. Use FEATURES.md to find each feature contract; TESTING.md defines evidence.

## Review the proposal

- Video: [din-v2-previs.mp4](previs/din-v2-previs.mp4).
- Run: node context/v2/previs/server.mjs; open the printed local URL.
- Model review: [previs/models.html](previs/models.html), served through the same local server.
- Rebuild model drafts: node context/v2/previs/build-models.mjs.
- Record: node context/v2/previs/record.mjs.
- Verify the exported MP4: node context/v2/previs/check-video.mjs.
- Draft GLBs, scene JSON, previews and manifest: work/model-drafts/portfolio-exhibition/v1/ (ignored; reproducible from tracked source).

The previs uses original voxel geometry with the existing VoxelView renderer and explicitly labelled v1 sample content. It makes no backend connection. The sample artwork is not evidence of Jon's completed projects.

## What stays / what changes

The React + TypeScript + Vite stack, plain CSS, v1 database schema, document version, content repositories, RLS, publication RPCs and Storage contract stay. Canonical assets and immutable reference files stay byte-identical.

The public composition, section order, presentation models, navigation and motion change. Projects come directly after the hero. Minecraft supplies materials, shape and a few meaningful interactions. Reading work never requires playing a game.

All v2 Markdown specifications have been reconciled with this direction. The accepted brand PNGs and their authoring sources were reviewed and retained without regeneration. Historical progress stays in PROGRESS.md; superseded instructions there describe history only.

The requested MP4 is a design deliverable and is tracked. Test captures, traces and reports remain in ignored test-results/. No deployment, merge, auth setting, owner enrollment or migration is implied by this package.
