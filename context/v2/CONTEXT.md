# Context and reading order

## Objective

Rebuild Jon Vincent Din's World of Builds as a single-page, cinematic scroll site that keeps the v1 world (voxel/Minecraft-inspired, olive and forest-green surfaces, cream pixel type, parchment) and the v1 content backend. A separate, simple editor page sits behind the logo and uses an emailed sign-in code.

## Authority order

1. The owner's newest explicit instruction.
2. `BRIEF.md` (the v2 request).
3. These v2 context files.
4. v1 context (`../v1/`) and the v1 implementation, for anything v2 does not change: content model, backend, renderer, assets, palette, font.
5. `reference/site`, now only as the source of the v1 look and of reusable modules. **v2 is a deliberate redesign, so pixel parity with the reference is no longer an acceptance target.**

If a v2 file and the brief disagree, the brief wins; record the discrepancy in `PROGRESS.md`. If v2 is silent, follow v1.

## Read in stages

| Stage | Files |
| --- | --- |
| Orientation | BRIEF.md, CURRENT_STATE.md, DECISIONS.md, FEATURES.md |
| Experience | STORYBOARD.md, MOTION.md, DESIGN_SYSTEM.md, BRAND.md, feature files |
| Structure and data | ARCHITECTURE.md, DATA_MODEL.md, AUTH.md, EDITOR.md |
| Execution | MILESTONES.md, current milestone file, TESTING.md, PROGRESS.md |
| Agent setup | MASTER_PROMPT.md, `../v1/MEMORY_WORKFLOW.md`, `../v1/SKILLS.md` |
| Unchanged v1 specifications | `../v1/MODELS.md`, `../v1/ASSETS.md`, `../v1/SUPABASE.md`, `../v1/DATA_MODEL.md` |

The context folder is development documentation. Do not serve it as site content. `assets/` stays canonical; the runtime serves the synced copy in `public/assets`. Logo files move from `context/v2/brand/` into the app (e.g. `public/brand/`) when V2-01 is built; `context/v2/brand/` stays the source.
