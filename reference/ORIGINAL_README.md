# Jon Vincent Din — World of Builds v7

Minecraft-inspired portfolio reference with seven distinct destinations, original voxel assets, and a working browser-local editor. Buildless HTML/CSS/JavaScript, no external runtime dependencies.

## Motion update

- Enter world lifts the intro scenery, title, controls and eight sky strips upward in shuffled order, revealing Spawn beneath. The loading screen still waits for an explicit click and supports replay.
- Navigation uses a brief exit and staggered viewport reveals. Buttons emit six pixel sparks; cards lift and glow; project and crafting dialogs unfold; detail panels enter progressively.
- Pause motion cancels section reveals and skips route transitions. Reduced-motion preferences initialize motion as paused and suppress CSS effects.
- Browser preview checked entry, replay, section navigation, project dialog and paused navigation.

## Current update

- The cinematic loading screen always waits for **Enter world**. Readiness never automatically opens Spawn. Replay and reduced motion remain available.
- Use the central 3D crafting table to open a bounded workshop dialog with a recipe book, 3×3 grid and opaque stacked inventory.
- Every default recipe uses **blank book + colored dye + special item**. Clicking a recipe automatically animates the exact required quantities from inventory to the grid. Previous grid ingredients are refunded first. Click the result to collect it; crafting consumes the reserved ingredients once.
- Manual drag/drop and select-then-tap placement remain supported. Prerequisites are discovery-history gates, not consumed ingredients. These are illustrative game rules, not educational claims.
- Each recipe can use a specialized artifact or classic book. The original React GLB, thumbnail and scene geometry remain unchanged.
- Editor → Skills has **Portfolio skills**, **Recipes**, and **Starting inventory**. Recipes expose ingredient choices/counts, output quantity/model, prerequisites and description with a live pattern preview. Starter quantities range from 0–256 and split into stacks of 64. Changed configuration starts a fresh visitor playground on its next mount.
- Portfolio skills are always visible without crafting. Their content stays separate from visitor progress; default entries remain labeled examples.
- Achievements and Certifications remain separate trees. Editor connection mode links a selected parent to a child, blocks cycles, and supports detaching roots, dragging positions and numeric positioning.
- Selecting an advancement traces a glow from its root. Subsequent selections retract to the common ancestor and continue along the unique shortest tree route. Rapid selections cancel old animations safely; reduced motion settles immediately.

| Skill | Dye | Special ingredient | Craft first |
| --- | --- | --- | --- |
| HTML | Orange | Oak plank | — |
| CSS | Blue | Layout shield | HTML |
| JavaScript | Yellow | Redstone | HTML, CSS |
| React | Cyan | Component pearl | HTML, CSS, JavaScript |
| SQL | Green | Iron ingot | — |
| API integration | Purple | Routing compass | JavaScript |

Every recipe also requires one blank book by default. Quantities are editable from one to three of each ingredient, occupying individual squares in their respective grid columns.

## Other portfolio features retained

Landing social links; portrait upload in an oak frame; project inventory with drag/move/swap, 14 symbols, case studies and photo galleries; five selectable experience characters and chapter comparison; contact message review. No contact message is sent. Real personal data, social URLs, skills and project evidence must be supplied by the owner.

## Content and storage

The editor stores the current draft and images in IndexedDB `jvd-portfolio-editor-v5`. Export/import JSON from the editor sidebar for backups. Existing version 5 drafts gain missing recipes and starter inventory without replacing their projects or portrait. Visitor play state uses `jvd-workshop-play-v2` plus a configuration fingerprint in localStorage. Editor changes are local to the browser/origin, not a shared CMS publication. This is a reference implementation, not production authentication or server storage.

## Models

48 total scenes, including 39 refined GLBs: five characters, fourteen project items, a table, thirteen ingredient/skill artifacts, and six new book/dye assets. Native WebGL uses depth testing, vertex colors and flat unit normals. The authored meshing pipeline removes hidden/coplanar overlapping faces and produces edge overlays without triangle diagonals; this is not a claim of manifold certification or skeletal character rigging. Thumbnail fallbacks remain available if WebGL cannot initialize.

Tripo was not used. All models are procedurally authored. Rebuild in this order: `source/refine_models.py`, `source/create_workshop_models.py`, `source/create_book_recipes.py`, then `source/render_thumbnails.py`.

## Validation

- `node check-crafting.mjs`: manual/translated patterns, exact resource reservation/consumption/refunds, full React/API progression, missing materials, edited quantities/models/starter inventory, stack splitting, migration, intro gate and drag direction.
- `node check-trees.mjs`: root routes, shortest paths, reverse/forward animation order, cycle rejection, disconnected roots and reduced motion.
- `node check-assets.mjs`: 48 scenes and 39 refined GLBs, finite geometry, unit normals, correct winding, no duplicate refined triangles, asset mapping, inventory swapping and URL guards.
- Syntax-check all `dist/*.js` modules.
- Desktop browser preview verified: click-to-enter gate, recipe auto-placement and output collection, prerequisite unlocking, recipe/starter form saving, parent-child connection saving and glow route selection. Fixed independent map scrolling on node focus. The preview browser used model thumbnails because WebGL was unavailable; actual GPU rendering and physical mobile/touch interaction remain unverified.

The downloadable kit contains current source/assets and this reference. Older hosted videos and concept PNGs are archived concepts, not recordings of v7.
