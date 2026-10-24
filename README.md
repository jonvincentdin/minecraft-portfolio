# Jon Vincent Din — World of Builds (React + Supabase)

A React + TypeScript + Vite rebuild of the voxel portfolio. It covers the cinematic entry, seven public routes, the
crafting workshop, the advancement trees and a world editor. The editor saves drafts and publishes through Supabase,
with the owner signed in and access enforced by RLS. The supplied vanilla implementation in `reference/site/` stays
unchanged and is the parity baseline.

Status: milestones M00–M07 are complete. See `context/M07_VERIFICATION.md` for the final parity report and
`context/PROGRESS.md` for the history. The site has not been deployed; see `context/DEPLOYMENT.md`.

## Run it

Requires Node 22.12 or newer (verified with Node 24.19) and npm.

```powershell
npm ci
npm run dev          # http://127.0.0.1:5173
npm run reference    # the immutable reference, http://127.0.0.1:4174 (second terminal)
```

The content mode comes from `.env.local`, which Git ignores:

- **Demo** (the default when no `.env.local` exists): content stays in this browser and needs no account.
- **Supabase:** `VITE_CONTENT_MODE=supabase` plus `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The owner
  signs in at `#editor`. This checkout is configured for the project `jvd-world`; see `supabase/README.md`.

To run the demo-mode browser suites while `.env.local` selects Supabase, start the dev server with the mode overridden:
`$env:VITE_CONTENT_MODE='demo'; npm run dev`. Process variables take priority over `.env` files.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Sync assets, typecheck, production bundle in `dist/` |
| `npm run preview` | Serve the production build on port 4173 |
| `npm run typecheck` | Strict TypeScript check |
| `npm run assets:sync` / `assets:verify` | Copy runtime assets / check all 100 original hashes |
| `npm test` | Unit tests (domain, repositories, copy integrity) |
| `npm run test:db` | Migration, RLS, grants and validator parity in PGlite |
| `npm run test:reference` | The reference's own check scripts, run against the React app's modules and assets |
| `npm run test:browser`, `test:m02` … `test:m05` | Demo-mode browser suites (dev server in demo mode, plus reference server for M02–M04) |
| `npm run test:m06` | Supabase-mode browser suite against a local API emulator (starts its own servers) |
| `npm run test:m06-hosted` | The same flows against the real project. **Deletes all content**; see `supabase/README.md` |
| `npm run test:m07` | Accessibility, keyboard and touch sweep beside the reference (both servers running) |
| `node tests/visual/capture-m0N.mjs` + `compare-m0N.mjs` | Screenshot capture and pixel comparison per milestone |

## Where things are

- `src/`: app shell and routes (`app/`, `features/`), the exact renderer wrapper (`components/three/`), domain logic
  (`domain/`), content repositories (`data/`), types.
- `supabase/`: migration, Auth config and setup guide. `context/DEPLOYMENT.md` covers hosting.
- `context/`: requirements, verification records (`M00`–`M07_VERIFICATION.md`), evidence screenshots, the progress log,
  and `OWNER_CONTENT.md`, the content that still needs Jon's real details.

## Original handoff starting instructions

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

No live website was changed by creating this package. (Historical note: the Supabase project and its migration were set up later, in M06.)

## Memory and 3D workflow update

Read `context/MEMORY_WORKFLOW.md` for the four included repository skills and `context/THREE_D_TOOL_VERIFICATION.md` for the checked tool sources. Current facts are in `context/PROJECT_FACTS.md`. No extra MCP is required to integrate the existing assets. Future explicitly requested model generation is supported by the 3D workflow.

When applying this ZIP to an existing checkout, copy the updated project files while retaining that checkout's own `.git` directory. The supplied Git metadata was not changed by this update.
