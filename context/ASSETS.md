# Asset inventory

The canonical asset folder is `/assets`. Keep it in the repository. The future Vite app serves a copy under `/public/assets`; this results in `/assets/...` browser URLs. Do not expose `/context`, `.env`, or server credentials as static assets.

| Folder/file | Contents | Use |
| --- | --- | --- |
| assets/models/*.glb | 48 binary glTF models | Reuse/download; optional future GLB renderer |
| assets/models/scene-data.json | 48 authored scenes | Exact baseline WebGL input |
| assets/models/topology-report.json | 39 refined entries | Mesh provenance and validation |
| assets/models/manifest.json, expansion-manifest.json | Historical manifests | Provenance; not authoritative current counts |
| assets/models/current-model-registry.json | Parsed current model metadata | Match IDs, paths, clip counts, thumbnail availability |
| assets/thumbs/*.png | 39 supplied thumbnails | Icons and model fallback |
| assets/fonts/JVDPixel.woff, .ttf | Original pixel font | Keep exact face and license |
| assets/fonts/LICENSE.txt | Font permission | Include in redistribution |
| assets/demos/*.svg | Six illustrative project screens | Demo galleries only |
| assets/asset-manifest.json | 100 original assets with size/hash | Source integrity checks |

The derived current-model-registry is generated after the original-asset manifest and is not one of those 100 original assets. Runtime sync copies it too. Baseline reference assets remain duplicated under reference/site/assets so the snapshot can run independently.

The project symbol `diamond_pickaxe` resolves to model `item_diamond_pickaxe`. The blue recipe dye `dye_blue` resolves to `material_pigment`. Explicit mapping lives in reference content.js and crafting-data.js; do not guess filenames from labels.

No actual portrait or real project screenshots were provided. Add them through the owner editor later. Do not use an invented face, project image or fabricated certificate as real evidence.

## Original asset files

| Relative path | Bytes |
| --- | ---: |
| assets/demos/project-1-1.svg | 2431 |
| assets/demos/project-1-2.svg | 3352 |
| assets/demos/project-2-1.svg | 2428 |
| assets/demos/project-2-2.svg | 3349 |
| assets/demos/project-3-1.svg | 2427 |
| assets/demos/project-3-2.svg | 3348 |
| assets/fonts/JVDPixel.ttf | 5268 |
| assets/fonts/JVDPixel.woff | 1976 |
| assets/fonts/LICENSE.txt | 268 |
| assets/models/character_builder.glb | 53144 |
| assets/models/character_casual.glb | 49048 |
| assets/models/character_explorer.glb | 49592 |
| assets/models/character_professional.glb | 46748 |
| assets/models/character_student.glb | 59116 |
| assets/models/chest.glb | 3968 |
| assets/models/contact_portal.glb | 6320 |
| assets/models/crafting_table.glb | 174620 |
| assets/models/dye_cyan.glb | 7576 |
| assets/models/dye_green.glb | 7576 |
| assets/models/dye_orange.glb | 7576 |
| assets/models/dye_purple.glb | 7576 |
| assets/models/dye_yellow.glb | 7576 |
| assets/models/expansion-manifest.json | 5766 |
| assets/models/home_landscape.glb | 33260 |
| assets/models/item_bow.glb | 23708 |
| assets/models/item_clock.glb | 28656 |
| assets/models/item_compass.glb | 34728 |
| assets/models/item_diamond_pickaxe.glb | 22712 |
| assets/models/item_diamond_sword.glb | 22568 |
| assets/models/item_emerald.glb | 21408 |
| assets/models/item_enchanted_book.glb | 11316 |
| assets/models/item_ender_pearl.glb | 21868 |
| assets/models/item_furnace.glb | 11608 |
| assets/models/item_grass_block.glb | 19368 |
| assets/models/item_lantern.glb | 17180 |
| assets/models/item_potion.glb | 9784 |
| assets/models/item_redstone.glb | 18120 |
| assets/models/item_shield.glb | 21600 |
| assets/models/manifest.json | 1963 |
| assets/models/material_book.glb | 10384 |
| assets/models/material_fiber.glb | 30364 |
| assets/models/material_iron.glb | 5988 |
| assets/models/material_paper.glb | 6808 |
| assets/models/material_pigment.glb | 7584 |
| assets/models/material_plank.glb | 11856 |
| assets/models/material_stick.glb | 20040 |
| assets/models/material_string.glb | 49068 |
| assets/models/open_book.glb | 5504 |
| assets/models/player_avatar.glb | 4320 |
| assets/models/project_book.glb | 4428 |
| assets/models/project_crystal.glb | 3392 |
| assets/models/project_device.glb | 4416 |
| assets/models/scene-data.json | 3609548 |
| assets/models/skill_api.glb | 10984 |
| assets/models/skill_css.glb | 29948 |
| assets/models/skill_html.glb | 27932 |
| assets/models/skill_javascript.glb | 30964 |
| assets/models/skill_react.glb | 125220 |
| assets/models/skill_sql.glb | 12424 |
| assets/models/topology-report.json | 6080 |
| assets/models/tree.glb | 2484 |
| assets/thumbs/character_builder.png | 4795 |
| assets/thumbs/character_casual.png | 4571 |
| assets/thumbs/character_explorer.png | 4554 |
| assets/thumbs/character_professional.png | 4677 |
| assets/thumbs/character_student.png | 4686 |
| assets/thumbs/crafting_table.png | 13161 |
| assets/thumbs/dye_cyan.png | 3131 |
| assets/thumbs/dye_green.png | 3137 |
| assets/thumbs/dye_orange.png | 3139 |
| assets/thumbs/dye_purple.png | 3138 |
| assets/thumbs/dye_yellow.png | 3130 |
| assets/thumbs/item_bow.png | 4638 |
| assets/thumbs/item_clock.png | 4132 |
| assets/thumbs/item_compass.png | 4812 |
| assets/thumbs/item_diamond_pickaxe.png | 4614 |
| assets/thumbs/item_diamond_sword.png | 4547 |
| assets/thumbs/item_emerald.png | 4449 |
| assets/thumbs/item_enchanted_book.png | 4408 |
| assets/thumbs/item_ender_pearl.png | 4068 |
| assets/thumbs/item_furnace.png | 5036 |
| assets/thumbs/item_grass_block.png | 4749 |
| assets/thumbs/item_lantern.png | 4658 |
| assets/thumbs/item_potion.png | 4229 |
| assets/thumbs/item_redstone.png | 3814 |
| assets/thumbs/item_shield.png | 3620 |
| assets/thumbs/material_book.png | 3611 |
| assets/thumbs/material_fiber.png | 3725 |
| assets/thumbs/material_iron.png | 3360 |
| assets/thumbs/material_paper.png | 3189 |
| assets/thumbs/material_pigment.png | 3139 |
| assets/thumbs/material_plank.png | 4169 |
| assets/thumbs/material_stick.png | 4564 |
| assets/thumbs/material_string.png | 4480 |
| assets/thumbs/skill_api.png | 3994 |
| assets/thumbs/skill_css.png | 4485 |
| assets/thumbs/skill_html.png | 4324 |
| assets/thumbs/skill_javascript.png | 4540 |
| assets/thumbs/skill_react.png | 7106 |
| assets/thumbs/skill_sql.png | 4870 |
