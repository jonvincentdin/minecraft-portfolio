# Models — Builder's Exhibition review set

Updated 2026-10-27. The owner explicitly authorized models needed for the new previs. Canonical assets and the React artifact remain unchanged.

## New original assets

| ID | Purpose | Geometry |
| --- | --- | --- |
| gallery-display | Project image stand with oak trim, brass joints and masonry base | 98 cuboids / 1176 triangles |
| workshop-lantern | Stepped cap, handle, cage and inset warm core | 22 cuboids / 264 triangles |
| builder-journal | Layered pages, spine, corner details and clasp | 16 cuboids / 192 triangles |
| portfolio-studio | Composed display, lantern, journal, plant and path | 213 cuboids / 2556 triangles |

Editable source: previs/model-sources.mjs. Build/export: previs/build-models.mjs. Review: previs/models.html. Versioned output: work/model-drafts/portfolio-exhibition/v1/ with GLBs, scene JSON, source, previews and manifest. Outputs are ignored; committed source reproduces them.

## Actual tools and compatibility

Original local procedural geometry in JavaScript. No paid provider, image-to-3D service, Blender, Blockbench or MCP was used. The existing VoxelView geometry/rendering path is reused unchanged. GLBs are interchange deliverables; the site still renders scene data. The display screen uses a DOM image projected with the same orthographic camera convention.

Colors encode material distinctions; the renderer supplies its existing simple directional shading. There are no new real cast shadows, emissive shaders, PBR textures or rigs. The lantern's core is warm geometry, not a dynamic light source. Do not claim these effects from a screenshot.

## Checks and review gates

Generation checks finite positions, positive dimensions and triangle winding; the manifest records bounds, triangle counts, byte sizes and SHA-256. Intentional intersecting cuboids are not claimed manifold or optimized union meshes. Browser previews must cover front, side and oblique views plus the actual page. Physical touch and hardware performance require separate verification.

New decorative IDs do not enter the v1 database's internal crafting or symbol catalogs. Any future replacement or owner-selectable model requires an explicit integration proposal. Review the complete project display at its intended page size before authoring more models.
