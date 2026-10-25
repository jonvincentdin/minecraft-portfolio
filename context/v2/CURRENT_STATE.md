# Current state — the starting point for v2

Snapshot 2026-10-25 (Asia/Singapore), `main` after PR #19.

## What exists (v1, complete)

- React + TypeScript + Vite app with seven hash routes (`#home`, `#about`, `#projects`, `#skills`, `#experience`, `#achievements`, `#contact`) and `#editor`.
- Intro cinematic with explicit Enter world, shuffled upward exit, replay, pause and reduced motion.
- Custom WebGL `VoxelView` renderer in a React wrapper, rendering scene-data models (48 GLBs and 39 thumbnails are canonical in `assets/`).
- Project inventory and case-study gallery; crafting workshop (3×3 grid, recipes, inventory, discoveries); five experience characters; Achievements and Certifications trees with path glow; contact message review.
- World editor (Landing, About, Projects, Skills, Experience, Achievements, Certifications, Contact) with JSON import/export.
- Supabase backend: versioned draft and published snapshots, atomic publish, owner media in Storage, RLS, enrollment by membership row. Owner signs in with **email + password**; a change-password form exists.
- Hosted Supabase project `jvd-world` (ap-southeast-1) with the migration applied and sign-up disabled. The enrolled owner account is **chanseytheopiest@gmail.com**, not the v2 Gmail. The site is not deployed.
- Tests: unit, PGlite RLS (`test:db`), browser suites `test:m02`–`test:m07`, hosted `test:m06-hosted`.
- No CI, no branch protection, no deployment.

## What v2 keeps

Content document and backend, renderer, assets, palette, JVDPixel font, the crafting/tree domain logic (`src/domain`), the content repositories (`src/data`), and the visitor/owner separation rules.

## What v2 replaces

Route-based navigation and page compositions, the reveal-on-view motion system, the "Edit world" button and `#editor` route, password sign-in and the change-password form, the text brand, and most v1-specific browser suites, which assert route behaviour that will no longer exist.

## Known gaps carried over

Real owner content is still missing (see OWNER_CONTENT.md). Most of the seed is labelled sample content.
