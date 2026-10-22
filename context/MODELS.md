# Models and renderer

48 GLB files and 48 scene-data entries are supplied; 39 are in the refined topology report. The original legacy manifests may contain older measurements. `assets/models/current-model-registry.json` is generated from the actual GLB headers/JSON chunks and records current hashes, animation clip names and thumbnail availability.

## Preserve these contracts

- Keep all five character outfits and the React artifact unchanged.
- The baseline runtime reads scene-data.json, not the GLB clips. It computes lighting and motion itself. Loading a GLB with its embedded animation clips is not automatically visually equivalent.
- Use original coordinates, flat vertex colors, unit normals, depth testing and projection/fit. Retain opaque rendering; do not fix shading by lowering opacity.
- Drag rotation is `yaw = -dx * .009`, `elevation += dy * .004`, clamped from −.12 to .8. Match the same camera convention; do not negate it again during React integration.
- Pointer capture, inertia, paused behavior, resize observers and visible-only drawing must survive the port. Cap pixel ratio at 2 as the baseline does.
- Wireframe uses authored edges rather than every triangle diagonal. Keep the filled pass and offset/edge pass from the source.
- Dispose requestAnimationFrame, GL buffers/programs and observers/listeners. Test both eyes from front and oblique views and table top/side alignment.
- A GLB without a thumbnail is expected among legacy models. Use the existing route fallback strategy or a documented neutral placeholder; never reference a nonexistent PNG.

Model regeneration is not part of parity. Source scripts are included for provenance and future specialized requests. If later editing a specific model, make a versioned copy, retain the original and rerun geometry plus visual checks. Tripo was not used or required.

## Current model catalog

| Model ID | Mesh status | Thumbnail | GLB embedded clip count |
| --- | --- | --- | --- |
| character_builder | Refined | Yes | 1 |
| character_casual | Refined | Yes | 1 |
| character_explorer | Refined | Yes | 1 |
| character_professional | Refined | Yes | 1 |
| character_student | Refined | Yes | 1 |
| chest | Legacy | No | 1 |
| contact_portal | Legacy | No | 1 |
| crafting_table | Refined | Yes | 1 |
| dye_cyan | Refined | Yes | 1 |
| dye_green | Refined | Yes | 1 |
| dye_orange | Refined | Yes | 1 |
| dye_purple | Refined | Yes | 1 |
| dye_yellow | Refined | Yes | 1 |
| home_landscape | Legacy | No | 6 |
| item_bow | Refined | Yes | 1 |
| item_clock | Refined | Yes | 1 |
| item_compass | Refined | Yes | 1 |
| item_diamond_pickaxe | Refined | Yes | 1 |
| item_diamond_sword | Refined | Yes | 1 |
| item_emerald | Refined | Yes | 1 |
| item_enchanted_book | Refined | Yes | 1 |
| item_ender_pearl | Refined | Yes | 1 |
| item_furnace | Refined | Yes | 1 |
| item_grass_block | Refined | Yes | 1 |
| item_lantern | Refined | Yes | 1 |
| item_potion | Refined | Yes | 1 |
| item_redstone | Refined | Yes | 1 |
| item_shield | Refined | Yes | 1 |
| material_book | Refined | Yes | 1 |
| material_fiber | Refined | Yes | 1 |
| material_iron | Refined | Yes | 1 |
| material_paper | Refined | Yes | 1 |
| material_pigment | Refined | Yes | 1 |
| material_plank | Refined | Yes | 1 |
| material_stick | Refined | Yes | 1 |
| material_string | Refined | Yes | 1 |
| open_book | Legacy | No | 1 |
| player_avatar | Legacy | No | 1 |
| project_book | Legacy | No | 1 |
| project_crystal | Legacy | No | 1 |
| project_device | Legacy | No | 1 |
| skill_api | Refined | Yes | 1 |
| skill_css | Refined | Yes | 1 |
| skill_html | Refined | Yes | 1 |
| skill_javascript | Refined | Yes | 1 |
| skill_react | Refined | Yes | 1 |
| skill_sql | Refined | Yes | 1 |
| tree | Legacy | No | 0 |
