# V05 — Skills crafting sequence

Anchor `#skills`. Pinned, about 60vh per actual skill. Storyboard §4.

Content: the owner's `actualSkills` (always visible, never inferred from visitor play), their recipes, and the crafting table model.

Scroll: per skill, the recipe's book, dye and special item fly into the 3×3 grid on scrubbed curved paths; the grid glows; the result pops with pixel particles and flies into its loadout slot, which then shows the skill's name, level and description. React keeps its specialized `skill_react` model. The exit is the plank split into Experience.

Interaction: "Try a recipe". A row of recipe buttons plays one craft at a time (the v1 autofill flight, 420ms per unit, then a craft success). The result goes to a small visitor bag stored under `jvd-v2-crafts`. This never changes `actualSkills`. Double clicks and clicks during a craft are ignored.

Use `src/domain` crafting functions to compute ingredients. Do not re-implement recipe matching.

Acceptance: the loadout shows all actual skills when the chapter ends and in reduced motion; scrubbing back un-crafts cleanly; Try-a-recipe never duplicates or loses items.
