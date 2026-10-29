# Current state

Snapshot 2026-10-29 (Asia/Singapore). Baseline main: 2e60137. Design branch: feat/v2-portfolio-previs.

## Verified repository state

- Existing application: React + TypeScript + Vite, seven public hash routes and editor. v2 runtime has not replaced it.
- Existing custom VoxelView uses scene-data geometry and flat vertex colors. It does not load GLBs, textures, PBR materials or embedded animation clips.
- Canonical models, including skill_react, and the immutable reference are retained.
- The v1 Supabase migration, ContentRepository, validators, Auth code and media helpers remain the production contracts.
- The earlier v2 video used animated thumbnails. The revised previs renders new original voxel scenes through VoxelView and uses a projected DOM image for the display surface.

## This design package

Updated v2 specifications, deterministic model source, versioned draft export, responsive standalone preview and an MP4 walkthrough. See MODELS.md for model provenance and limitations; PROGRESS.md for actual checks.

## Still pending

Production V2-01 onward; real portfolio screenshots and copy; approval of the review models' final appearance; any optional rendering improvements; hosted auth decisions and deployment. The preview's sample content is not owner evidence.

Hosted account, SMTP, repository protection and deployment configuration were not re-audited in this task. Earlier notes about those services are historical, not verified-current facts.
