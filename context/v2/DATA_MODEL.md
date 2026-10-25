# Data model (v2)

The v1 content document, its snapshot tables, RLS and Storage layout (`../v1/DATA_MODEL.md`, `../v1/SUPABASE.md`) carry over unchanged. v2 changes only how the document is presented.

## Field usage changes

| Field | v2 use |
| --- | --- |
| `settings` (name, heroLabel, tagline, introTitle, github, linkedin) and `highlights` | Spawn chapter |
| `settings` (aboutTitle, bio, portrait, portraitPosition) and `journal` | About journal |
| `projects` (14 in the seed) | Projects track and hotbar. `symbol` is the hotbar slot icon and the item spinning on the card |
| Visitor slot order (localStorage `jvd-slots-v5`) | Unused; the track follows document order |
| `actualSkills` | The loadout in the Skills chapter; one scripted crafting step each |
| `recipes` | Drive the scripted crafting and "Try a recipe" |
| `startingInventory` | Unused on the public page; kept in the document for compatibility |
| `skills` (skill cards) | Optional detail cards beside the loadout; decide in V2-04 |
| `characters`, `experience` | Minecart stations and their chapters |
| `achievements`, `certifications` (node `x`/`y`, `parent`) | Advancements descent. The layout must fit one pinned viewport |
| `contacts`, `settings` (contactTitle, contactCopy) | Campfire signposts and the contact book |

## Rules

- Do not delete fields the public page no longer reads. Old exports and published snapshots must still validate.
- Any new field (for example a per-chapter accent or a project's hotbar order) goes through the existing validator in `src/domain` and, if stored server-side, the database validator. That is a protected migration.
- Visitor play state for "Try a recipe" uses a new localStorage key, `jvd-v2-crafts`, and never touches owner content.
