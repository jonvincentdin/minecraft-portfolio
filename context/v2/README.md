# Jon Vincent Din — World of Builds, version 2

Version 2 reworks the finished v1 site (see `../v1/`) into a **single-page, cinematic scroll experience**. The world, palette, models and content stay; the way visitors move through it changes. Instead of clicking between seven routes, visitors scroll through one continuous journey with vertical and horizontal sequences, scroll-scrubbed motion, and a smaller set of interactions.

Status (2026-10-25): **specified, not built.** Only these context files and the logo exist. The owner will build v2 step by step from the milestones.

## Start here

1. `BRIEF.md`: the owner's request, word for word, and the requirements taken from it.
2. `CONTEXT.md`: authority order and reading order.
3. `STORYBOARD.md`: the scroll journey, section by section. This is the core of v2.
4. `MILESTONES.md`, then the current file under `milestones/`.

## What changes from v1

| v1 | v2 |
| --- | --- |
| Seven hash routes and a header nav | One page of scroll chapters. The header links scroll to anchors |
| Section reveals when an element enters view | Scroll-scrubbed timelines, pinned scenes and horizontal tracks |
| A rich interaction on every page (drag inventory, 3×3 workshop, tree pan/zoom, comparisons) | Fewer, lighter interactions (see FEATURES.md) |
| Intro: shuffled upward exit | Intro: a longer cinematic in which the logo is built from blocks, with depth and a hand-off into scroll |
| "Edit world" button → `#editor`, signed in with a password | Logo → `/editor` page, signed in with an emailed one-time code |
| Text "JVD." brand | The JVD block logo (`brand/`) |

## Unchanged and reused

The custom WebGL renderer and scene-data models (`../v1/MODELS.md`, `../v1/ASSETS.md`), canonical `/assets`, the content document and its Supabase draft/publish backend (`../v1/DATA_MODEL.md`, `../v1/SUPABASE.md`), RLS, the palette and JVDPixel font. The v1 React components are a parts bin, not a constraint: reuse what fits and rewrite what doesn't.

## Folder map

- `BRIEF.md`, `CONTEXT.md`, `CURRENT_STATE.md`, `DECISIONS.md`: orientation and open decisions.
- `STORYBOARD.md`, `MOTION.md`, `DESIGN_SYSTEM.md`, `BRAND.md`: the experience.
- `FEATURES.md` and `features/`: per-section specifications.
- `ARCHITECTURE.md`, `DATA_MODEL.md`, `AUTH.md`, `EDITOR.md`: structure, data and the editor.
- `USER_FLOWS.md`, `OWNER_CONTENT.md`, `TESTING.md`: flows, content still needed, how to verify.
- `MILESTONES.md` and `milestones/`: the build plan.
- `MASTER_PROMPT.md`: the implementation prompt for an agent.
- `PROGRESS.md`, `PROJECT_FACTS.md`: history and the current verified snapshot.
- `brand/`: logo SVGs and the script that generates them.

Verification evidence (screenshots, reports) is **not** committed in v2. Keep it in the ignored `test-results/` folder and summarise the checks in `PROGRESS.md`.
