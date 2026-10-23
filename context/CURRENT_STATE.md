# Current implementation versus planned work

## React implementation update - 2026-10-23 (Asia/Singapore)

M00 is merged to main. M01 now implements the React shell, Spawn and explicit intro/replay on feat/m01-shell-entry. Other public routes/editor remain placeholders and Supabase is still an unavailable boundary. See PROJECT_FACTS.md and M01_VERIFICATION.md for current evidence. The sections below describe the original supplied vanilla reference, not completed React features.

## Already present in the baseline

Seven public routes; cinematic loading scene with explicit Enter world gate and randomized upward exit; home social-link slots; about journal and portrait frame; draggable project inventory and gallery case studies; crafting scene and recipe workshop; visible actual-skills loadout; five experience characters; separate Achievements and Certifications trees; editor forms; JSON import/export; WebGL rendering and thumbnails; motion pause; new navigation/reveal/hover/pixel/panel animations.

The current runtime is buildless HTML, CSS and JavaScript. It renders procedural scene data using a custom WebGL renderer. GLBs are supplied for reuse but are not what the baseline renderer loads at runtime.

## Persistence that exists today

- Editor drafts: IndexedDB `jvd-portfolio-editor-v5`, object store `content`, key `draft`.
- Project slot order: localStorage `jvd-slots-v5`.
- Workshop progress: localStorage `jvd-workshop-play-v2` with a configuration fingerprint.
- Local edits do not publish to other visitors. The editor currently has no real account authorization.
- Contact form produces a message review; it does not send email or store inbound messages remotely.

## Planned React/Supabase additions

Component-based React implementation; typed data adapters; authenticated owner editor; draft/save/preview/publish workflow; Postgres content persistence; Storage-backed photos and portrait; RLS; cross-browser access to published owner content. These are specified, not implemented in this ZIP.

## Known boundaries

Personal face, actual social URLs, real project evidence and verified career content were not supplied. Demo projects and skills stay labeled as examples. Live browser drafts may exist only on the owner's browser; export them there before migration. This package cannot recover those drafts.

The preview environment previously used model thumbnails because WebGL was unavailable. Actual GPU rendering and physical touch interactions need validation on the development computer. Mesh checks cover finite geometry, unit normals, winding and selected duplicate-face checks; they do not certify manifold geometry or rigging. Nine legacy models are retained separately from the 39 refined models.

Old concept videos are not accurate recordings of the final UI. They are not the parity reference. Tripo was not used; no new model generation is required.
