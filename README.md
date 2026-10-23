# Jon Vincent Din — React + Supabase rebuild handoff

M00 provides the React + TypeScript + Vite foundation. M01 adds the reference shell, Spawn and explicit entry/replay. M02 adds About, project inventory/gallery, Experience and Contact. M03 adds the actual-skills loadout and crafting workshop. Advancements and editor remain placeholders; the supplied vanilla implementation remains the immutable reference. Supabase is a declared boundary for M06, not an active backend.


## Run the React portfolio

Requires Node >=22.12 (verified with Node 24.19) and npm. From the repository root:

```powershell
npm.cmd ci
npm.cmd run dev
```

React: http://127.0.0.1:5173. In a second terminal:

```powershell
npm.cmd run reference
```

Immutable reference: http://127.0.0.1:4174.

| Command | Purpose |
| --- | --- |
| npm.cmd run typecheck | Strict TypeScript check |
| npm.cmd run build | Sync assets, typecheck, production bundle |
| npm.cmd run preview | Serve production build on port 4173 |
| npm.cmd run assets:sync | Exact runtime copies under public/assets |
| npm.cmd run assets:verify | Check 100 supplied original hashes |
| npm.cmd run test:m03 | Crafting, cancellation and edited-config browser checks (both servers running) |
| npm.cmd run test:m02 | M02 browser interactions and pointer controls (both servers running) |
| npm.cmd test | Repository behavior and copy integrity (sync assets first) |
| npm.cmd run test:browser | Edge smoke and screenshots; start dev and reference servers first |

No environment file is needed for demo mode. Optional .env.local uses only the public settings in .env.example. VITE_CONTENT_MODE=supabase requires both public settings and then honestly reports that M06 integration is pending. There are no remote saves or owner enrollment in M00.

The reference CSS is copied with root-relative font URLs. The custom renderer is copied exactly; a React effect manages its lifetime. Runtime assets are generated and ignored. The version-5 demo seed has a dedicated runtime copy, checked against the canonical seed by tests.

See context/M00_VERIFICATION.md for checks, screenshots and limitations. Historical handoff instructions below describe the original ZIP; M00 completion supersedes their setup step. M01 evidence is in context/M01_VERIFICATION.md. M02 evidence is in context/M02_VERIFICATION.md. M03 evidence and visual limits are in context/M03_VERIFICATION.md. Stop before M04.

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

No live website was changed by creating this package. No Supabase credentials, deployments, or database migrations were executed.

## Memory and 3D workflow update

Read `context/MEMORY_WORKFLOW.md` for the four included repository skills and `context/THREE_D_TOOL_VERIFICATION.md` for the checked tool sources. Current facts are in `context/PROJECT_FACTS.md`. No extra MCP is required to integrate the existing assets. Future explicitly requested model generation is supported by the 3D workflow.

When applying this ZIP to an existing checkout, copy the updated project files while retaining that checkout's own `.git` directory. The supplied Git metadata was not changed by this update.
