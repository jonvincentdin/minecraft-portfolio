# Editor (v2)

"Editor should still be a simple site." The `/editor` page keeps the v1 editor's content coverage (`../v1/EDITOR.md`) and its save/preview/publish model, without cinematic motion.

## Entry

- From the public page: click the DIN logo in the HUD. It is a normal link to `/editor`, so it opens in the same tab and middle-click works.
- `/editor` shows sign-in (AUTH.md) until there is an authorized session, then the editor.
- A "← Back to the world" link returns to `/`.

## Tabs (simplified from v1)

| Tab | Content | Change from v1 |
| --- | --- | --- |
| Spawn | Name, eyebrow, tagline, CTAs, GitHub, LinkedIn, highlights | Renamed from Landing |
| About | Biography, portrait and crop, journal chapters | Same |
| Projects | Case-study fields, symbol, gallery (files, alt text, captions, order) | Same; slot order no longer matters |
| Skills | Actual skills; recipes used by the scripted crafting and "Try a recipe" | Starting-inventory editor removed (no public workshop) |
| Experience | Five characters and their records | Same; comparison fields removed |
| Advancements | Achievements and Certifications trees: node fields, parent links, positions | Same controls; positions must fit without pan/zoom (warn when a tree is too wide) |
| Contact | Copy, email, links | Same |

## Behaviour (unchanged from v1)

Save draft with a revision check, preview, and atomic publish. Dirty, saving, saved, error and conflict states. Failed saves and uploads keep form data. JSON import/export with a recovery copy; import never publishes.

## Preview

Preview opens `/` with the draft snapshot and a "Draft preview" banner (v1 behaviour), so the owner sees the real scroll experience before publishing.
