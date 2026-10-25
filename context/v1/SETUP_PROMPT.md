# Setup prompt — prepare files and project foundation

Use this prompt first in Codex in VS Code, with the extracted package open.

---

Prepare this repository for a faithful React + Supabase rebuild of **Jon Vincent Din's World of Builds**. The handoff contains `/context`, `/assets/models`, other `/assets`, and the exact original site under `/reference/site`.

Read AGENTS.md, context/CONTEXT.md, CURRENT_STATE.md, ARCHITECTURE.md, ASSETS.md, MODELS.md and MILESTONES.md. Inspect the files before creating anything. Preserve the supplied context, assets, reference source and any existing user work.

Your task for this first pass is to complete milestone M00, not to invent a new design:

1. Inventory the existing files and verify the asset manifest with `node scripts/verify-assets.mjs`. Confirm all 48 GLBs are present and the original React model hash matches. Report missing files instead of substituting generated assets.
2. Initialize a multi-file React + TypeScript + Vite project safely in this folder. If scaffolding requires an empty folder, scaffold in a temporary sibling and merge only the needed files. Do not overwrite or delete context/assets/reference. Select compatible stable dependencies and commit the lockfile.
3. Keep `/assets` canonical. Add the asset synchronization script to dev/build preparation so `public/assets` contains exact copies. Serve models, fonts, thumbnails and demo images from `/assets/...` URLs. Preserve the font license. Adjust copied CSS URLs deliberately for the chosen stylesheet location.
4. Create the folder architecture described in ARCHITECTURE.md: app, components/layout, components/ui, components/three, each public feature, editor, domain, data, lib, styles, types, Supabase migrations and meaningful test folders.
5. Define typed content interfaces matching context/content-seed.json; create a demo-content adapter and a Supabase adapter boundary. Keep demo mode explicit. The foundation must run without backend credentials.
6. Add `.env.example` with only VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY and the demo/backend mode setting. Ignore real environment files. Do not create credentials, execute production SQL or enroll an owner during scaffolding.
7. Port the reference stylesheet and establish the app shell, route placeholders and shared layout without redesign. Add a safe VoxelCanvas lifecycle wrapper for the existing renderer. Dispose resources on unmount; do not install a second renderer yet.
8. Provide scripts for dev, typecheck, build, asset sync and asset verification. Set up the minimum appropriate test tooling and document commands. Keep the original domain tests as migration specifications.
9. Prepare a local reference viewing command so I can compare the original site alongside the React app. The reference is read-only and should be served over HTTP, not opened with file://.
10. Read context/SKILLS.md. Report which relevant skills/tools are actually available in this environment. Do not invent plugin availability or install every suggested item. Custom skill names in that document are workflow proposals, not already installed tools.
11. Run asset verification, typecheck, build and a smoke check. Update context/PROGRESS.md with files created, commands run, results, current limitations and the next milestone.

Leave a runnable foundation and concise setup instructions. Avoid empty placeholder modules that only imitate completeness. Do not mark the entire portfolio finished. After M00, continue with context/MASTER_PROMPT.md when I ask for the full implementation.

## Focused skill addendum

Read `context/MEMORY_WORKFLOW.md` and `context/PROJECT_FACTS.md`. Use the included project skills only when relevant; do not install the suggested third-party 3D tools as a setup step. Use `$jvd-3d-integration` for rendering integration and explicitly requested new model creation. Audit stale context before relying on it, and update facts after each verified milestone. Preserve the existing GitHub and protected-file rules.
