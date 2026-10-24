# Supabase backend

Implements M06: owner sign-in, private revision-guarded drafts, atomic publication, owner media and RLS.

**Current project:** `jvd-world`, ref `bkfvkqnusckxyphpvsiq`, region ap-southeast-1. Set up on 2026-10-24 by following
the steps below, with the CLI in place of the dashboard:
- the migration is applied;
- `config.toml` is pushed;
- the owner is enrolled;
- `.env.local` is written.

To re-verify it, run `npm run test:m06-hosted` with `M06_OWNER_EMAIL`, `M06_OWNER_PASSWORD` and `SUPABASE_SECRET_KEY` set in
the shell. Never put them in a file. The test deletes all content when it finishes, so do not run it once real content
is published.

## What the migration creates

`migrations/20261024000000_portfolio_content.sql`

| Object | Purpose |
| --- | --- |
| `portfolio_editors` | Who may edit (`owner`/`editor`). Users can read only their own row. No self-enrollment: rows are added by trusted SQL only. |
| `portfolio_drafts` | The single draft document, its revision and the pre-import recovery copy. Readable by enrolled editors only. |
| `portfolio_publications` | The published document and revision. Readable by everyone. |
| `media_assets` | One row per owner upload (WebP/PNG/JPEG, at most 10 MB, dimensions, alt text, publish time). Editors only. |
| `save_draft`, `import_draft`, `publish_draft` | The only write path for content. Each checks enrollment, validates the whole document on the server and compares-and-swaps the revision. Publishing copies exactly the saved revision in one transaction. |
| `register_media`, `remove_unused_media` | Reserve an upload name; delete an upload that neither the draft nor the publication shows. |
| `portfolio_internal.*` | The server validator (a port of `src/domain/content-validation.ts`) and the crafting/symbol catalog. Not exposed through the API. |
| Buckets | `portfolio-drafts` (private) for uploads, `portfolio-media` (public) for published images at immutable names. Both are limited to 10 MB and PNG/JPEG/WebP. |

Direct table writes are revoked for `anon` and `authenticated`, function execution is granted explicitly, and every
`security definer` function pins `search_path`. Errors use SQLSTATE `42501` (not an editor), `PT409` (stale revision,
HTTP 409, current revision in `details`) and `PT422` (invalid content or media, HTTP 422).

Content refers to uploads as `media:<uuid>.<ext>`. Visitors load them from the public bucket. Editors load draft-only
uploads through one-hour signed URLs. Publishing copies each upload from `portfolio-drafts` to the same name in
`portfolio-media` before calling `publish_draft`, which refuses to publish if any image shown is missing.

## Setting up a project (owner steps)

1. **Create a Supabase project.** Copy its URL and **publishable** key (Project Settings → API). Never use the
   service-role or secret key in this app.
2. **Apply the migration.** Use either the SQL editor (paste the migration file) or the CLI:
   `supabase link --project-ref <ref>` then `supabase db push`. Apply it to a development project first.
3. **Auth settings.** `supabase/config.toml` declares them; `supabase config push` applies only those properties.
   In the dashboard, the equivalent is: Authentication → Providers → Email keeps email + password enabled, and under
   Authentication → Sign In / Providers, **"Allow new users to sign up"** is off. Enrollment already blocks strangers, but there is no
   reason to accept accounts. Set Site URL to the production origin. Password sign-in needs no redirect URLs; add
   `http://127.0.0.1:5173` and the production origin to the Redirect URLs list if password reset is used later.
4. **Create the owner account.** Authentication → Users → Add user, with email and password and *Auto Confirm User*.
   Copy the new user's UUID.
5. **Enroll the owner.** This is the trusted step; run it in the SQL editor:
   ```sql
   insert into public.portfolio_editors (user_id, role) values ('<owner-auth-uuid>', 'owner');
   ```
6. **Configure the app.** In `.env.local` (ignored by Git):
   ```
   VITE_CONTENT_MODE=supabase
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
   ```
   Set the same three variables in the hosting provider's build settings.
7. **Move existing content.** Open `#editor`, sign in, then *Import content JSON* with an export from local mode. Inline
   images in the export are uploaded first. Import never publishes: review it, then press *Publish*.
8. **Generate types (optional).** Run `supabase gen types typescript --project-id <ref> > src/types/database.ts` to replace
   the hand-written file with generated types, then run `npm run typecheck`.

Until something is published, visitors see the bundled sample world under a "Nothing has been published yet" notice.
They never see a draft.

## Tests

- `npm run test:db`: applies the migration to PGlite (Postgres 18 in WASM) with a minimal stand-in for Supabase roles,
  `auth.uid()` and the storage tables. It covers the authorization matrix, storage policies, grants, revision guards,
  and parity of the server and client validators.
- `npm run test:m06`: the browser app in Supabase mode against `tests/e2e/supabase-emulator.ts`, which serves the
  Auth, PostgREST and Storage endpoints the app uses from that same database.

These prove the SQL and the app's behavior. They do not prove a hosted project's settings: bucket limits enforced by
the Storage service, the Auth configuration and real JWT verification. Re-run the browser flow against the development
project after applying the migration.

## Rollback

Reverting application code does not undo the database. To remove M06 from a development project, drop the four
tables, the `portfolio_internal` schema, the public functions, the three storage policies and the two buckets, and only
after exporting content. Do not do this to production without a data-preserving plan.
