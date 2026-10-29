# Project fact snapshot (v2)

Verified 2026-10-29 (Asia/Singapore). Historical work remains in PROGRESS.md.

## Repository and scope

- Remote: https://github.com/jonvincentdin/minecraft-portfolio.git. Baseline: 2e60137. Working branch: feat/v2-portfolio-previs.
- This delivery changes context/v2 only: specifications, standalone preview, original model authoring/export scripts and the requested video. Production v2 has not started.
- Direction: Builder's Exhibition. Portfolio imagery leads, with Minecraft-inspired objects/materials, smooth native scrolling, stable text and immediate project access. Accepted enchanted DIN brand is retained.
- V2-00R is the review package; owner visual acceptance remains pending. V2-01 through V2-07 remain pending. Do not advance automatically.

## Verified compatibility

- Existing React + TypeScript + Vite, plain CSS and custom VoxelView remain unchanged.
- Canonical assets, React GLB/thumbnail/scene geometry, immutable reference, application source, dependencies and Supabase migration are unchanged by this task.
- v1 content version 5, repositories, validators, tables, RPCs, RLS, media helpers and Storage contract remain authoritative. No migration, reseed, auth change or hosted mutation was performed.
- New models are decorative scene data, not crafting catalog IDs or owner media records.

## Deliverables and evidence

- context/v2/previs/din-v2-previs.mp4: 1440 x 900, H.264, no audio. Exact duration/bytes are in previs/video-metadata.json. Browser playback and fifteen seeks are verified by previs/check-video.mjs; decoded frames are reviewed separately. Target capture rate is 30fps, with variable encoded intervals.
- Four original model drafts: gallery-display, workshop-lantern, builder-journal, portfolio-studio. Deterministic source and exporter are tracked. GLBs, scene JSON, manifest and three-angle previews are under ignored work/model-drafts/portfolio-exhibition/v1/ and can be regenerated.
- Actual browser captures use unchanged VoxelView. Edge reported ANGLE / NVIDIA RTX 4060 / Direct3D11. This is rendering evidence, not a hardware performance benchmark.
- Browser evidence covers responsive layouts, forward/reverse projects, offscreen keyboard focus, dialog Escape/focus return, local contact review, pause, runtime reduced motion and model rotation. Final outcomes are in PROGRESS.md.
- Asset verification: 100 originals passed. Local database tests: 11/11 passed. Production typecheck/build: passed with the existing bundle-size warning.
- Unit tests: 36/37 passed. The unchanged integrity test fails on a pre-existing checkout mismatch: context/v1/content-seed.json is CRLF, src/data/demo-content.json is LF. The committed seed exactly matches the runtime bytes; normalizing working-copy CRLF also matches. No test or protected source was changed to hide it.
- Reproducible commands and limits are in TESTING.md. Local screenshots/reports are under test-results/v2-previs/.

## Boundaries and next step

- Preview content is labelled illustrative v1 seed data, not saved owner content or verified project claims. Real screenshots and copy are still needed for production.
- No real cast shadows, PBR, emissive shaders, rigging or GLB-loading support was added. Physical touch, screen readers, other engines and representative-device performance remain unverified.
- Hosted account state, email delivery, repository protection and deployment configuration were not re-audited. Older service notes are historical.
- This package does not authorize renderer replacement, canonical model promotion, auth changes, migrations, merge or deployment. Root AGENTS.md and the current user's scope govern subsequent work.
- Review the video and models, then explicitly authorize the next production milestone. Delivery commit/PR state is recorded in the final response and PROGRESS.md.
