# Feature index

Each feature has its own Markdown specification.

| ID | Feature | Specification | Reference implementation |
| --- | --- | --- | --- |
| F01 | Intro and entry | features/01-INTRO.md | index.html, app.js, style.css |
| F02 | Spawn | features/02-HOME.md | public.js |
| F03 | About | features/03-ABOUT.md | public.js, editor.js |
| F04 | Project inventory | features/04-PROJECTS.md | public.js, state.js |
| F05 | Skills and recipes | features/05-SKILLS.md | workshop.js, crafting-engine.js, crafting-data.js |
| F06 | Experience | features/06-EXPERIENCE.md | public.js |
| F07 | Advancements | features/07-ADVANCEMENTS.md | public.js, tree-paths.js, tree-editor.js |
| F08 | Contact | features/08-CONTACT.md | public.js |
| F09 | Content editor | features/09-EDITOR.md | editor.js, workshop-editor.js, tree-editor.js |
| F10 | Shared motion, models and accessibility | MOTION.md, MODELS.md, TESTING.md | app.js, motion.js, renderer.js, style.css |

All source paths in the last column are under `reference/site`. Supabase persistence is a new extension and must not change these public layouts.
