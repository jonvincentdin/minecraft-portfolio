# M07 verification - final parity report, 2026-10-24 (Asia/Singapore)

Branch: feat/m07-delivery, based on main 6dab5d4 (M00–M06 merged, Supabase project set up, password change merged).
Environment: Windows 11, Node 24.19, Microsoft Edge (Chromium) with an NVIDIA RTX 4060 for WebGL, plus Playwright
Firefox 157 and WebKit 27.2. The reference is `reference/site` at 47d8b1ca11b05db6791adaf9bf33a5cf9bd946ca, served
unchanged.

## Result

Accepted, with the limitations listed below. Every automated suite passes. Across 57 exact screenshot pairs, every
difference is either a deliberate, documented change or rendering noise of at most 1/255 per channel that varies between
runs. All 100 original asset hashes, `skill_react.glb` among them, are unchanged. The production build succeeds.

## Checks actually run (all passed)

| Check | Result |
| --- | --- |
| `npm run typecheck`, `npm run build` | Passed |
| `npm test` | 37 unit tests |
| `npm run test:db` | 11 (migration, RLS, grants, validator parity on 48 cases) |
| `npm run assets:verify` | 100 original hashes, including `skill_react.glb` |
| `npm run test:reference` (new) | The reference's own `check-assets`, `check-crafting` and `check-trees`, unchanged, against the React app's shared modules and runtime assets: 48 scenes, 39 refined GLBs, 14,478 triangles, crafting pathway, trees |
| `npm run test:browser` | Shell smoke: real GPU, entry/replay, teardown, fallback |
| `npm run test:m02`, `test:m03` | Routes, pointer, dialogs, crafting, edited configuration |
| `npm run test:m04` | 18 (trees, glow, motion) |
| `npm run test:m05` | 13 (editor, local mode) |
| `npm run test:m06` | 13 (Supabase mode against the emulator, now including a failed upload and the password change) |
| `npm run test:m06-hosted` | 10 against the real project; last run 2026-10-24 during setup, before any owner content existed. Not rerun, because it deletes content. The password change was checked separately on the hosted project with a temporary account. |
| `npm run test:m07` (new) | 3 sweeps: see *Accessibility, keyboard and touch* |
| `npm run test:engines` (new) | Firefox and WebKit: see *Other engines* |
| Visual capture and compare, M01–M05 | See the next section |

## Screenshot parity (Edge, same viewport and seed, reduced motion)

Source: `evidence/m07/visual-summary.json`.

| Set | Exact pairs | Remaining differences |
| --- | --- | --- |
| M01 shell and home (6) | 6 in a clean run | `home-768` shows 28,422 pixels at Δ1 in some runs: WebGL canvas noise, not reproducible from run to run |
| M02 routes (11) | 11 | none |
| M03 skills and workshop (11, plus 6 as-rendered blur pairs) | 11 | Blur pairs differ by Δ≤6 at the dialog edge only. This is Chromium backdrop-blur compositing (see M03_VERIFICATION). |
| M04 advancements (11) | 11 | none |
| M05 editor (12) | 3 | The same counts as recorded in M05: the deliberate editor topbar, local-mode notice and help text, plus antialiasing. Three workshop-editor pairs vary from run to run. |

**Test fix found during M07:** the M01 intro comparison had stopped matching (30% different) because the smoke test
opened React at `#projects` and the reference at `/`. After M02 made the projects page real, the page under the intro
had a different height. The test now opens both at `#projects`; the reference also returns to `#home` on entry. With
that change, the intro and every home pair match exactly.

## Accessibility, keyboard and touch (`npm run test:m07`)

Run on every route and the editor, React beside the reference (`evidence/m07/sweep-report.json`):

- **Desktop 1440×900:**
  - `lang="en"` and a `main` landmark on every route;
  - every visible image has `alt`, and every visible control has an accessible name (control counts match the
    reference route by route);
  - no horizontal overflow;
  - React logs no console error that the reference does not also log.
- **Keyboard:** Tab reaches the controls on home, projects, skills, achievements, contact and the editor. Every focused
  control shows a focus indicator.
  - **Fixed in M07:** the reference removes the outline from the project search box (`.search input:focus{outline:none}`)
    with no replacement. `foundation.css` adds a `:focus-within` ring in the site's focus colour. Unfocused screenshots
    are unchanged.
- **Phone 390×844 with touch emulation:** no overflow and no unnamed control on any route. Tapping navigation and
  inventory items works (`evidence/m07/phone-projects.png`).

Covered by earlier suites and rerun here:
- **Dialogs:** Escape closes them, focus is contained, focus is restored, and the rest of the page is inert (M02/M03).
- **Intro:** it keeps focus contained while open (M01; the reference lets Tab escape to the page).
- **Motion:** reduced motion and pause settle every animation (M04).
- **Errors:** validation failures keep the entered input (M05/M06).

## Other engines (`npm run test:engines`)

Firefox 157 and WebKit 27.2, each comparing React with the reference in the same engine (`evidence/m07/engines-report.json`):
- every route renders, and the 3D world draws (the canvas has more than 20 distinct colours);
- the project dialog opens and Escape closes it;
- HTML crafts through the recipe book;
- selecting an advancement updates the inspector;
- the local editor saves;
- React adds no page errors of its own.

Per-route pixel differences against the reference in the same engine were 0–23 pixels (Firefox) and 8–39 pixels
(WebKit). A repeat WebKit capture of the contact route was exact, so these vary between runs.

## WebGL and models

- **Real GPU:** the smoke test runs on the NVIDIA RTX 4060 through ANGLE/Direct3D 11. The forced-fallback and teardown
  checks from M00/M01 still pass.
- **Geometry:** `check-assets` confirms valid normals and winding, no duplicate refined triangles, and that every item,
  character and table model is mapped.
- **Drag:** the drag direction matches the reference (`check-crafting`).

## Backend (summary of M06)

**RLS, grants and validation:** proven on PGlite and on the hosted project.
- Anonymous visitors and non-enrolled accounts cannot read drafts, write content, enroll themselves, publish, or
  upload or delete media.
- The owner can save and publish; the public sees only the published revision.
- Covered cases: concurrent saves, stale publishes, invalid JSON, cross-tree links, recipe cycles, failed uploads (new in
  M07), orphan removal and private draft files.

Details are in M06_VERIFICATION.md.

## Owner content still needed

The published site still shows the sample world. In the seed:
- **Projects:** all 14 are samples, with 28 illustrative SVG photos.
- **Skills:** all 6 actual skills are samples.
- **Experience:** all 5 entries are "Add your …" prompts.
- **Advancements:** all 4 achievements and 3 certifications are samples.
- **Profile:** the portrait, GitHub and LinkedIn URLs and the contact email are empty.
- **Text:** the biography, journal and highlights are placeholder copy.

`OWNER_CONTENT.md` lists what to supply. Nothing was invented.

## Remaining limitations

1. **Physical touch hardware:** not tested. Touch is emulated in Chromium only.
2. **Deployment:** none has been done; `DEPLOYMENT.md` is the guide. The production origin is not yet in the Supabase
   Auth settings.
3. **Session expiry on the hosted project:** only tested against the emulator.
4. **Concurrent first saves:** reasoned about, not raced (PGlite has a single connection).
5. **Favicon:** neither site declares an icon, so browsers log a `/favicon.ico` 404. This is inherited and not added
   without an owner-supplied icon.
6. **Media cleanup:** images removed from a draft stay in storage until removed with `remove_unused_media`; there is no
   cleanup screen.
7. **Bundle size:** supabase-js is in the bundle in demo mode too (about 172 kB gzip in total).
8. **Owner password:** the generated password should be changed through the editor's *Change password* if that hasn't
   been done.
9. **Separate modal entrance timing:** not measured on its own (unchanged since M04).
