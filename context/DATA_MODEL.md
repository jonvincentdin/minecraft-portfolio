# Data model and adapter contract

This is a proposed schema to implement and test, not executable migrations already applied. The source's version-5 document is the initial content contract. For a single-owner portfolio, use versioned JSON snapshots first: it preserves nested galleries, recipe arrays and tree topology while avoiding a risky simultaneous redesign and database normalization.

## Recommended initial Postgres tables

| Table | Fields and constraints |
| --- | --- |
| portfolio_editors | user_id uuid primary key → auth.users; role limited to owner/editor; membership managed only by trusted administration |
| portfolio_drafts | portfolio_id text primary key; schema_version int; content jsonb; revision bigint; updated_at timestamptz; updated_by uuid |
| portfolio_publications | portfolio_id text primary key; schema_version int; content jsonb; revision bigint; published_at timestamptz; published_by uuid |
| media_assets | id uuid; owner_id uuid; bucket text; object_path text unique per bucket; mime text; size_bytes bigint; width/height int; alt text; created_at; lifecycle state |

Use one configured portfolio ID, e.g. `jvd-world`; membership is scoped to this application. Restrict all row writes to the enrolled owner/editor. Only trusted administration may enroll editors. Do not trust client-editable user_metadata for roles.

## Document collections

`settings`, `highlights`, `journal`, `projects`, `actualSkills`, legacy `skills`, `characters`, `experience`, `achievements`, `certifications`, `contacts`, `recipes`, `startingInventory`, and `version`. Field definitions and sample structure are in `content-seed.json` and reference `state.js`.

`skills` is a legacy discipline collection retained for import compatibility. The active editor/public actual-skills feature uses `actualSkills`; do not accidentally replace it with that legacy collection.

IDs remain stable strings across seed/import/publish. Project photo IDs, tree parents, skill projectId, recipe outputs/prerequisites and character associations must resolve. Recipe resultModel is independent from ingredient IDs and from the actual-skills list.

## Repository interface

- getPublishedContent(portfolioId): validated PortfolioContent + publication revision.
- getDraft(portfolioId): draft + revision, authorized only.
- saveDraft(content, expectedRevision): validate and compare-and-swap; return new revision.
- publishDraft(expectedRevision): transactionally publish exactly the saved draft revision.
- uploadMedia(file, metadata): validate file, upload, persist metadata; return durable path.
- removeUnusedMedia(id): reject referenced assets, then delete safely.

Publish via a database function/RPC with explicit authorization and validation. Whether invoker or definer is chosen, set privileges and search_path deliberately and test it. Avoid a publicly callable function that bypasses editor checks. Check-and-write must be atomic; two separate client requests do not implement revision locking.

Database validation must enforce document shape/types, size limits, allowed model/item IDs, quantities, reference integrity, parent-tree cycles, prerequisite cycles and photo metadata limits. Reuse client validation for usability but never rely on it as the only integrity check. Do not allow a generic privileged endpoint to publish arbitrary unvalidated JSON.

A normalized schema is a later option if multiple owners, granular queries or large content volume justify it. Preserve the adapter and public UI if normalization is introduced.
