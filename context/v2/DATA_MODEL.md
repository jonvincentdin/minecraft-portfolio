# Data model — unchanged v1 contract

Owner requirement, 2026-10-27: use the same database structure as v1. This is a presentation redesign. No schema migration or content-version bump is planned or applied.

## Executable authority

Use supabase/migrations/20261024000000_portfolio_content.sql, src/types/content.ts, src/types/database.ts and src/data/ContentRepository.ts. Early v1 prose describes a proposal; the checked-in migration and adapter record what was implemented.

| Existing resource | Retained contract |
| --- | --- |
| public.portfolio_editors | Portfolio-scoped user membership, owner/editor roles; trusted enrollment only |
| public.portfolio_drafts | schema_version, content, revision, recovery and update metadata |
| public.portfolio_publications | schema_version, content, revision and publication metadata |
| public.media_assets | file identity, portfolio/owner, image metadata and publication lifecycle |
| portfolio_internal catalogs | Existing symbols and crafting item/model IDs; no decorative v2 IDs added |
| Storage portfolio-drafts | Private draft images, signed access |
| Storage portfolio-media | Immutable published copies addressed through existing media helpers |
| RPCs | save_draft, import_draft, publish_draft, register_media, remove_unused_media |

Retain all RLS, validation, compare-and-swap revisions, recovery export and atomic publication. Do not replace owner content with the seed or run a reseed for v2.

## Presentation mapping

| Document field | v2 use |
| --- | --- |
| settings / highlights | Name, introduction, links and factual highlights |
| projects / photos | Featured showcase, complete collection and case studies. Existing order controls display; photos[0] is the cover when available |
| settings.bio / portrait / portraitPosition / journal | About and optional portrait |
| actualSkills | Actual skills and evidence; never derive from visitor crafts |
| recipes / startingInventory | Retained and editable; optional demonstration uses existing logic |
| legacy skills | Retained for import compatibility; not a replacement for actualSkills |
| characters / experience | Preserve fixed associations; public view can render ordinary readable rows |
| achievements / certifications | Separate collections; retain parent/x/y and evidence even when shown as lists |
| contacts / contact settings | Configured links and existing message review |
| version | Existing version 5; no redesign-only bump |

The preview features the first three projects and leaves every record reachable in a collection index. Production selection is derived from existing order or component configuration; no new featured field is required. Do not persist presentation-only camera paths, lighting, model drafts or scroll progress in the document.

## New models without a migration

New display/lantern/journal scenes are decorative application assets selected by components. They are not recipe outputs, project symbol IDs, media uploads, or owner-uploaded GLBs. Existing validated model IDs remain unchanged. Any later request to make model assignment owner-editable needs a separate schema/validation proposal.

## Compatibility checks

Validate the unchanged v1 seed; preserve import/export round-trips, gallery ordering, IDs, references, sample labels and media resolution. Run unit and database suites when reusing the adapter. Never claim hosted state was verified by local PGlite tests.
