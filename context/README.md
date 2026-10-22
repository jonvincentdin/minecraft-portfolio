# Jon Vincent Din — React + Supabase rebuild handoff

This package is a source-grounded specification and asset bundle for rebuilding **World of Builds** in React in VS Code. It is **not an already converted React application** and does not create or connect a Supabase project.

## Start here

1. Extract the whole ZIP into a project folder and open it in VS Code.
2. Read `context/CONTEXT.md`, `context/CURRENT_STATE.md`, and `context/ARCHITECTURE.md`.
3. Give Codex `context/SETUP_PROMPT.md` first. It prepares the repository and a runnable foundation.
4. Then give it `context/MASTER_PROMPT.md` to implement the remaining milestones.
5. Keep `reference/site` immutable. Compare against it at matching viewport sizes.
6. Supply actual personal content using `context/OWNER_CONTENT.md`. Supplied content is clearly labeled demo content.

## Included

- `context/`: separate Markdown files for requirements, design, flows, features, assets, models, motion, architecture, backend, editor, testing, skills, milestones, setup and master prompts.
- `assets/models/`: **48 GLB files**, scene-data JSON, original manifests and topology report. **39 models have refined mesh entries**, plus 9 legacy scenes/models.
- `assets/thumbs/`: 39 thumbnails; `assets/fonts/`: original JVD font and its license; `assets/demos/`: 6 illustrative project SVGs.
- `reference/site/`: exact HTML/CSS/JavaScript and assets from the published reference, including its motion update. This is the visual and behavioral baseline.
- `reference/model-source/`: original procedural model and image-generation scripts; retained for provenance, not required for the React runtime.
- `context/content-seed.json`: deterministic IDs for the default demo content; not an export of private browser drafts.
- `scripts/verify-assets.mjs`: verify all supplied asset hashes, including the original React model.
- `scripts/sync-assets.mjs`: copy canonical assets into the future React app's `public/assets` folder.
- `.env.example`: public client configuration placeholders only.

## Baseline

Published reference: https://jon-vincent-din-voxel-world.kaylocastro1.chatgpt.site

Source commit: `47d8b1ca11b05db6791adaf9bf33a5cf9bd946ca`. Snapshot date: 22 October 2026.

Matching this snapshot is the acceptance target. “1:1” means reproducing its layout, content, assets, timing, state transitions, and responsive behavior. Exact pixels across different operating systems, GPUs, and font rasterizers cannot be guaranteed; compare under fixed conditions and document differences.

React handles the client application. Supabase supplies hosted Auth, Postgres and Storage; a separate Express/Node backend is unnecessary for this scope. Node is used locally by development tooling. Privileged or abuse-sensitive server work, if added later, belongs in a server function.

No live website was changed by creating this package. No Supabase credentials, deployments, or database migrations were executed.
