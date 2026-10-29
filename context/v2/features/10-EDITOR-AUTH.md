# V10 — Editor continuity

Updated 2026-10-27 (Asia/Singapore). See STORYBOARD.md, MOTION.md and DATA_MODEL.md.

Keep the full v1 editor workflow and database structure. Planned /editor entry is separate from the animated public page. Logo leads there with an accessible editor-sign-in name. The local previs shows an explanatory dialog only.

Do not remove starting inventory, character associations, tree positions or any unused field from saved documents. Preserve CRUD, galleries, draft/save/preview/publish, import recovery and conflict behavior.

AUTH.md separates the earlier email-code proposal from the current visual work. Existing password access, memberships and RLS stay until a separately approved replacement is verified. Do not install a new auth system or add content tables.

Acceptance for future implementation: existing editor/domain/RLS checks, private media, input preservation, import/export round-trip, correct preview, no secrets in bundles and no unexpected data migration.
