# Context and reading order

## Objective

Rebuild the supplied portfolio in React, integrating Supabase for durable owner content and editor operations, while matching the published reference. Owner: **Jon Vincent Din**. Theme: original voxel/Minecraft-inspired world, olive and forest-green surfaces, cream pixel typography, warm parchment, opaque inventory panels.

## Authority order

1. The owner's newest explicit instruction.
2. The immutable `reference/site` snapshot for existing appearance and behavior.
3. These context files for React migration and the planned Supabase extension.
4. Older concept assets or prompts, only where compatible.

If source behavior and a written requirement differ, log the discrepancy and identify baseline behavior versus the requested correction. Do not silently reinterpret the design.

## Read in stages

| Stage | Files |
| --- | --- |
| Orientation | CURRENT_STATE.md, FEATURES.md, USER_FLOWS.md, OWNER_CONTENT.md |
| Visual implementation | DESIGN_SYSTEM.md, MOTION.md, MODELS.md, ASSETS.md, feature files |
| Structure and data | ARCHITECTURE.md, DATA_MODEL.md, SUPABASE.md, EDITOR.md |
| Execution | MILESTONES.md, relevant milestone file, TESTING.md, PROGRESS.md |
| Agent setup | SKILLS.md, SETUP_PROMPT.md, MASTER_PROMPT.md |
| Sources and integrity | SOURCES.md, assets/asset-manifest.json, reference source |

The context folder is development documentation. Do not serve it as public site content. `assets` is the canonical asset folder; the React runtime serves a synchronized copy from `public/assets`.
