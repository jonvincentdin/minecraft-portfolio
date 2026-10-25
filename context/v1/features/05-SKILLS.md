# F05 — Skills loadout and recipe workshop

Route `#skills`. The owner's actual skills are displayed before interacting with the crafting table. They must never be inferred from visitor-crafted items. Preserve skill descriptions, experience level, project/evidence links, model override, and sample labels.

Center the existing crafting table in the scene. Its interaction button opens the workshop, which contains an opaque stacked inventory, recipe book, 3×3 grid, result slot, prerequisite checklist and discoveries.

## Default recipes

| Output | Book count | Dye | Special item | Discovery prerequisites |
| --- | --- | --- | --- | --- |
| HTML | 1 | Orange ×1 | Oak plank ×1 | None |
| CSS | 1 | Blue ×1 | Layout shield ×1 | HTML |
| JavaScript | 1 | Yellow ×1 | Redstone ×1 | HTML, CSS |
| React | 1 | Cyan ×1 | Component pearl ×1 | HTML, CSS, JavaScript |
| SQL | 1 | Green ×1 | Iron ingot ×1 | None |
| API integration | 1 | Purple ×1 | Routing compass ×1 | JavaScript |

All recipes use book + dye + special item; outputs keep specialized models. React retains `skill_react`; a recipe's resultModel can alternatively use a classic book. Blue dye maps to `material_pigment` (there is no dye_blue.glb).

Starting inventory: 24 blank books; 8 each of six dyes; 8 each of plank, shield, redstone, pearl, iron and compass. Stack limit 64. Editor starter quantities 0–256. Ingredient counts 1–3 each; result amount 1–16. Columns represent books, dye and special item; repeated counts fill downward. Retain translated-pattern matching from the existing engine.

## Resource rules

Autofill first refunds existing grid contents, computes required resources and prerequisite availability, then reserves only the needed amount. Animate those units from actual inventory cells to their grid destinations. Do not move an entire stack. No ingredient/output duplication on double-click, cancelled animation, dialog close or route change.

The output is collected explicitly; the default recipe click fills the grid and does not silently collect it. Collection consumes grid ingredients once and adds output plus discovery history. Prerequisites check discovery history, not current inventory ownership, and are not consumed. Manual dragging and select/tap placements remain supported.

Reject invalid configurations, duplicate patterns, prerequisite cycles, missing item/model IDs, negative counts and impossible outputs. Config changes invalidate or migrate visitor play state using a fingerprint. Reuse the pure `crafting-engine.js` functions before considering a rewrite.

These dependencies are illustrative game rules, not claims that learning React literally requires every listed prerequisite.
