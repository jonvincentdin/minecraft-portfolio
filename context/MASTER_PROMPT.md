# Master prompt — faithful React + Supabase rebuild

Copy the prompt below into Codex in VS Code after extracting this package and completing SETUP_PROMPT.md.

---

Act as the implementation engineer for **Jon Vincent Din's World of Builds portfolio**. Build the full application in this repository using React, TypeScript, Vite, plain CSS and Supabase. The exact existing source is included under `reference/site`; canonical assets are under `assets`, including `assets/models`.

This is a fidelity-focused migration. Reproduce the supplied website's distinct page layouts, typography, colors, model appearance, interactions, animations and responsive behavior. Do not design a new generic Minecraft portfolio. Use the immutable source snapshot as the baseline, and document genuine discrepancies rather than silently changing them. Aim for 1:1 parity under matched browser/viewport conditions; do not claim a perfect match until it has been compared and verified.

## Read first

Read AGENTS.md, context/CONTEXT.md, CURRENT_STATE.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, FEATURES.md, MOTION.md, MODELS.md, ASSETS.md, DATA_MODEL.md, SUPABASE.md, EDITOR.md, MILESTONES.md and TESTING.md. Read individual feature/milestone files when implementing them. Use context/content-seed.json for demo content; preserve demo labels. Inspect the corresponding reference source instead of reconstructing behavior from prose alone.

## Implementation constraints

- Use multi-file React components and hooks. Do not deliver an iframe containing the old app, a monolithic HTML file, or a permanent innerHTML wrapper around the old application.
- Preserve existing class names and CSS cascade while converting to JSX. Use the supplied JVDPixel font; keep the system-font body text, forest/olive palette, parchment surfaces, block-like borders and opaque inventory.
- Preserve canonical assets byte-for-byte. Use scripts/sync-assets.mjs for runtime copies and scripts/verify-assets.mjs for integrity. Do not regenerate the existing React artifact or make every skill output a book.
- Wrap the custom VoxelView renderer in a React component with proper effect cleanup. Keep its scene-data input, lighting, fit, pointer direction, depth testing, inertia and edge overlay. Do not switch to React Three Fiber merely because React is being used; propose it only if needed and validate the visual change.
- Use CSS and Web Animations API for baseline motion. Own and cancel animations/listeners/observers cleanly. No doubled effects under Strict Mode, stale route callbacks or permanently faded inventory.
- Keep public content, editor draft state and visitor game state separate. Visitor crafting never changes the owner's actual skills. Slot rearrangements and discoveries stay browser-local unless a later requirement explicitly changes that.
- Run without Supabase in explicit demo mode for frontend development. Never report a remote save in demo mode. Use the supplied environment placeholders; do not invent keys, real URLs or personal achievements.

## Required public experience

1. Cinematic loading scene with real asset readiness. Wait for Enter world; never automatically show Spawn. On click, title, scenery, controls and eight background strips slide upward in shuffled order while home appears underneath. Preserve replay, focus handling, inert state and reduced-motion behavior.
2. Spawn with Jon Vincent Din's exact name, world scene, primary CTAs, highlights, GitHub and LinkedIn slots and replay control.
3. About with journal composition and oak-framed actual portrait. Keep the placeholder until the owner supplies a photo; support crop positioning through the editor.
4. Projects inside the Minecraft-inspired inventory. Preserve 14 symbol choices, opaque cells, search/filter, drag-to-move/swap, rearrange/reset and accessible alternatives. Every project has editable case-study content and a multi-image gallery with captions, alt text and ordering.
5. Skills loadout always displays actual owner skills. Center the supplied crafting table; its button opens the workshop with recipe book, stacked inventory, 3×3 grid and result slot. Recipes use book + dye + special item. Clicking a valid recipe moves only required quantities into the grid with animated item flights; collect the result explicitly. Refund existing grid items before replacement. Preserve manual placement, exact quantities, stack splitting, prerequisite discovery history and no-duplication guarantees. Keep React's specialized output model and support optional book/model overrides per recipe.
6. Experience character selector with professional, school uniform, casual, builder and explorer outfits; each shows its records and permits multiple chapter comparison. Preserve two-eye model details and correct rotation direction.
7. Advancements with separate Achievements and Certifications trees, interactive map and inspector. First selection glows root-to-node. Subsequent selection retracts to the common ancestor then takes the shortest valid tree route to the new node. Handle disconnected roots and rapid clicks without stale glows.
8. Contact correspondence layout with message review. Do not claim to send a message unless a separately configured server submission succeeds.
9. Shared nav transitions, staggered reveals, hover/press motion, six-pixel button feedback, animated dialogs and detail panels. Preserve timing from MOTION.md. Respect reduced motion and the pause control.

## Required editor and backend

Keep the current editor sidebar and forms. Implement Landing, About, Projects, Skills, Experience, Achievements, Certifications and Contact. Skills contains Portfolio skills, Recipes and Starting inventory. All content collections need appropriate CRUD; settings need editing; required character IDs stay fixed. Project forms must include symbol selection, photo collection and all story fields. Tree editing supports parent→child connection, detaching, dragging positions and numeric positions, with cycle prevention.

Integrate Supabase Auth for owner access, Postgres for versioned draft/published content, and Storage for actual photos/portrait. Follow the proposed snapshot/adapter model in DATA_MODEL.md unless a concrete requirement justifies changing it. Save draft, preview and publish are distinct actions. Publish a validated snapshot atomically; public users never read drafts. Use revision checks for concurrent saves.

Enable and test RLS. Anonymous and ordinary signed-in users cannot read drafts, write content, publish, upload/delete media or self-enroll as editors. Enroll the actual owner through a trusted administrative step. Client-side route guards are not authorization. Use only the public project URL and publishable key in VITE variables. Keep privileged keys on the server. Protect unpublished media and validate file type/size. Document every migration and policy.

Keep JSON import/export, including migration from the existing version-5 document. Preserve current browser draft data by requesting an owner export if needed; do not assume the seed contains it. Failed saves and uploads keep the user's form data.

## Working process

Follow M00–M07 in order, keeping a runnable application after each milestone. Inspect the repository first and preserve existing work. Make reasonable implementation decisions without repeated approval questions. Use installed skills only when relevant; SKILLS.md clearly distinguishes available capabilities from proposed custom skills.

For each milestone: implement, run the relevant checks, compare the appropriate reference states, fix material mismatches and update context/PROGRESS.md. Record evidence and limitations. Do not stop after scaffolding or after producing a plan when implementation is possible. If credentials are missing, finish all independent frontend/schema work and state exactly what owner setup remains.

Before completion, run typecheck/build, domain tests, auth/RLS tests in a configured development project, browser workflows, desktop/mobile comparisons and asset checks. Specifically test entry replay, rapid navigation, recipe double-clicks, exact inventory counts, advancement cancellation, media failures and keyboard/touch alternatives. Verify WebGL on an actual capable device and disclose any environment you could not test.

Deliver the working repository, setup/environment instructions, reviewed migrations, owner enrollment instructions, test results and a concise parity report. Do not publish to an unrequested destination or overwrite the existing hosted reference. Preserve all source assets and the immutable reference folder.

Start by inspecting the current progress and complete the first unfinished milestone.

## Project memory and future model requests

Use the focused skills under `.agents/skills/` as documented in `context/MEMORY_WORKFLOW.md`. Read `context/PROJECT_FACTS.md` as a dated snapshot and verify it against current source before relying on it. Record actual milestone outcomes and propose memory cleanup when claims conflict.

For an explicitly requested new 3D model, use `$jvd-3d-integration`: stage editable source, GLB, previews and renderer-compatible scene data separately; preserve approved existing assets; validate geometry and real browser rendering. Do not install optional MCPs or invoke paid generators merely to start this project. Select external tools only when the specific task justifies them, under the existing permissions.
