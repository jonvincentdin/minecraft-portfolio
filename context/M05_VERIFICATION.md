# M05 verification - 2026-10-24 (Asia/Singapore)

Implementation: 6c1caeb on feat/m05-editor, based on main 4c06561 (M00-M04 merged).

## Implemented

A React world editor (`src/features/editor/`) replaces the editor placeholder. It mirrors the reference editor's markup, so reference.css applies unchanged.

**Editor coverage:**
- **Sections and records:** all eight sections, with list, add, edit, duplicate, reorder and confirmed delete.
- **Forms:** the four-tab project form, the symbol picker and sample flags.
- **Media:** a gallery editor (upload, alt text, caption, cover, order, remove) and portrait upload/crop/remove.
- **Trees:** the visual connection editor (move, connect, make root, numeric position, drag).
- **Workshop:** the recipe studio with its live pattern, and the starting inventory with split-stack preview.
- **Characters:** a card for the five fixed categories.
- **Backup:** JSON export and import.

**Local repository:** `LocalContentRepository` (`src/data/`) implements the existing ContentRepository contract in the browser.
- **Separate documents:** a draft and a published document (plus a pre-import recovery copy) live in IndexedDB `jvd-world-local-v1`.
- **Draft saves** use compare-and-swap on the revision, inside one transaction.
- **Publish** copies exactly the saved revision.
- **Blocked storage:** if IndexedDB is blocked, it falls back to memory and labels itself session-only.

**Validation:** `src/domain/content-validation.ts` ports the reference `validate`/`migrate`, which every save, publish and import calls. `useDraft` validates the whole document before any change is saved.

**Data flow:** the public pages read the published snapshot. Preview renders the unpublished working copy through the same public components, under a "Draft preview" banner.

## Field coverage matrix

Recorded by test:m05 from the live forms in `evidence/m05/field-matrix.json`.

| Tab | Fields with inputs |
| --- | --- |
| Landing | name, heroLabel, tagline, introTitle, github, linkedin; highlights: title, body |
| About | aboutTitle, bio, portrait (upload/remove), portraitPosition; journal: title, body |
| Projects | title, category, summary, status, role, date, stack, symbol, overview, problem, solution, features, process, outcome, liveUrl, sourceUrl, sample; gallery: upload, alt, caption, cover, order, remove |
| Skills / Portfolio skills | title, category, level, recipeId, resultModel, description, projectId, evidence, symbol, sample |
| Skills / Recipes | title, output, resultModel, amount, bookCount, color, colorCount, special, specialCount, note, requires |
| Skills / Starting inventory | item, quantity (0–256; cards show split stacks) |
| Experience | name/label/intro for each of the five fixed characters; title, character, organization, start, end, description, contribution, evidence, sample |
| Achievements | title, description, date, issuer, evidence, parent, x, y, symbol, sample; tree: move, connect, make root, x/y |
| Certifications | same as Achievements, in its own tree |
| Contact | contactTitle, contactCopy; links: title, url, body |

## Deliberate differences from the reference

- **Draft and publication:**
  - The reference had one browser draft that the public pages also rendered. Here, draft and publication are separate.
  - "Publish in this browser" asks for confirmation and states that nothing is uploaded.
  - Preview shows the draft under a banner.
  - The status line says exactly where data is: "Draft rev N saved on this browser · published rev M", "Session only — export to keep", "Not saved — export a backup" or "Conflict — your edits were kept".
- **Conflicts:** a stale tab's save is refused rather than overwriting a newer draft. The edits are kept, and the user chooses Load the newer draft, Download my version or Save mine over it.
- **Explicit deletion choices:** deleting a project linked from skills, or a tree node with children, names the affected records and requires "Unlink and delete" or "Detach children and delete". The reference cascaded silently.
- **Stricter validation than the reference** (every shared case agrees with it):
  - skill project links must resolve
  - portrait sources must be safe
  - photo ids are unique
  - projects, experience and tree nodes need boolean sample flags
- **Import:** keeps the replaced draft as a downloadable recovery copy and never publishes. The reference only advised exporting first.
- **Characters card:** added because EDITOR.md lists those fields and the reference editor had no form for them.
- **New entries:** carry only their own collection's fields. The reference gave every new entry the same template, so a highlight gained a symbol.
- **Tree editor fix:** selecting a node in Move mode now works. In the reference under current Chromium, capturing the pointer on pointerdown sent the click to the canvas, so the position fields never opened (checked side by side). Capture now starts only once a drag begins.
- **Copy:** the editor notice, the workshop notice and the settings help text describe local mode accurately ("no sign-in and no shared backend yet").

## Checks actually run

- `npm run build`: strict typecheck and production bundle passed.
- `npm test`: 29 tests passed. The 7 new data tests cover:
  - parity with the reference validator, imported as the oracle, on 24 mutation cases
  - 4 stricter cases
  - migration of older exports
  - compare-and-swap conflicts and rejected saves leaving storage unchanged
  - publishing exactly the saved revision and refusing a stale one
  - import validation, the recovery copy and no publication
  - demo mode using the local adapter with a memory fallback

  The existing content tests now target the local adapter and the unconfigured Supabase adapter, which still rejects every write.
- `npm run assets:verify`: all 100 hashes passed. `test:browser`, `test:m02`, `test:m03` and `test:m04` passed: no regressions.
- `npm run test:m05`: 13 checks passed in Edge, with no page errors; three consecutive runs passed after making toast assertions wait for asynchronous messages. They cover:
  - the field matrix above
  - CRUD, including an empty title, an http profile URL and an unsafe link being rejected
  - a gallery upload of real PNGs, resized to WebP, with alt, caption and cover order
  - a referenced project deleted with an explicit unlink
  - tree cycles rejected in both the parent field and connect mode
  - connect, make root, numeric position (950 rejected), drag, and explicit parent deletion
  - a recipe prerequisite cycle rejected with the form kept; the live pattern; 130 starting items showing three stacks
  - characters renamed
  - preview showing the unpublished draft (name, character, deleted node), and exiting back to the published site
  - publish updating the public header and surviving a reload
  - export equal to the stored draft
  - import rejecting non-JSON and cyclic files, migrating an older export, keeping and downloading the recovery copy, and appearing in preview without publishing
  - a two-tab conflict with overwrite and reload
  - blocked IndexedDB working for the session and labelled session-only
- `git diff --check` passed.

## Visual evidence and reproduction

Screenshots and reports are in evidence/m05. With the dev and reference servers running:

```powershell
npm.cmd run test:m05
node tests/visual/capture-m05.mjs
node tests/visual/compare-m05.mjs
```

There are 12 pairs: 8 editor states at 1440x900 and 4 at 390x844, each starting from the same seed.

| Result | Pairs |
| --- | --- |
| Pixel-identical | project form, project media tab and recipe form at 1440 |
| Topbar and notice only (publish button, status, local-mode notice; y 45–152) | projects and achievements at 1440 |
| Same, plus the reworded settings help text | landing at 1440 |
| Workshop notice line (y 267–278), plus 47–256 pixels of anti-aliasing around the guide images | recipes and inventory at 1440 |
| Topbar wraps and pushes the page down by one row | projects and achievements at 390 |
| Notice line only | recipes at 390 |
| Under 900 pixels in the sticky action bar (side-by-side crops look identical) | project form at 390 |

The changed regions were cropped side by side and inspected.

## Boundaries and delivery

**Local mode only:** this milestone delivers the editor against a browser-local adapter, and the backend is **not** claimed complete.
- There is no sign-in and no server authorization.
- Anyone using a browser edits only that browser's copy, which other visitors never see.
- Images are inline WebP data URLs, so `removeUnusedMedia` has nothing to delete.
- Authentication, shared drafts, Storage uploads, atomic server publish and RLS belong to M06.

**Not verified:** physical touch dragging of tree nodes, and engines other than Edge.

**Known limitations:**
- The draft preview banner does not survive a page reload.
- A draft left by the vanilla reference (`jvd-portfolio-editor-v5`) is not read automatically; export it there and import it here.

There are no new dependencies, migrations or environment changes; package.json only gains `test:m05`. Owner content remains demo-labelled.
