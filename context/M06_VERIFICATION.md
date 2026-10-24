# M06 verification - 2026-10-24 (Asia/Singapore)

Branch: feat/m06-supabase, based on fix/m03-dialog-parity (itself on main b3b6f69).

## Status

Implemented and verified against PostgreSQL 18 (PGlite) running the real migration, and against a local HTTP emulator
of the Supabase APIs. On 2026-10-24 it was also applied to, and verified against, the hosted project `jvd-world` (see
*Hosted verification* below).

## Implemented

**Database** (`supabase/migrations/20261024000000_portfolio_content.sql`, see `supabase/README.md`):
- **Tables:** `portfolio_editors`, `portfolio_drafts` (with a pre-import recovery copy), `portfolio_publications` and
  `media_assets`, all under RLS. Direct writes are revoked from API roles.
- **Write path:** `save_draft`, `import_draft` and `publish_draft` are the only ways to change content. Each one:
  - requires an enrolled editor (`42501`);
  - validates the whole document on the server (`PT422`);
  - compares and swaps the revision (`PT409`, with the current revision in `details`).

  Publishing copies exactly the saved revision in one transaction. It refuses if any uploaded image the draft shows
  has not been copied to the public bucket.
- **Server validator:** a PL/pgSQL port of `validateContent` and `validateWorkshopConfig`. It returns the same messages
  as the client. It also adds two server-only limits: a 2 MB document cap, and no inline `data:` images.
- **Media:** `register_media` reserves a name, and the storage policies accept objects only under registered names.
  There are no UPDATE policies, so names are immutable. Objects can be deleted only after `remove_unused_media` confirms
  that neither the draft nor the publication shows them. Uploads go to the private `portfolio-drafts` bucket; published
  images live in the public `portfolio-media` bucket under the same name.
- **Enrollment:** a trusted SQL step. There is no self-enrollment policy, and roles never come from user metadata.

**Client:**
- **`SupabaseContentRepository`** implements the existing `ContentRepository` contract. It loads the publication (or the
  labelled sample world when nothing is published, never a draft), reads and saves drafts, publishes, and handles
  upload, import and removal. Network, authorization, conflict and validation failures map to errors that say the
  edits were kept.
- **Contract:** `kind`, `importDraft`, `getRecovery` and `isPersistent` are now part of `ContentRepository`, so
  `useDraft` no longer special-cases the local adapter.
- **Media references:** content refers to uploads as `media:<uuid>.<ext>`. `safeImage` resolves them to the public bucket
  for visitors, and to signed or local object URLs for draft-only uploads in the editor and preview.
- **`EditorGate`** shows email/password sign-in, a not-enrolled state and sign-out. If the session ends while editing,
  the editor stays mounted with the working copy, and a sign-in dialog opens over it. A *Retry save* action resubmits
  the kept copy.
- **Editor wording** depends on the mode (shared draft and Publish versus local draft and Publish in this browser).
  Local-mode text and markup are unchanged.
- **Loader:** a failed or slow (15 s) publication request ends the intro with an explained error and *Try again*,
  which replays the entry sequence.
- **One auth client per page:** the repository is created once at module level, because StrictMode ran the state
  initializer twice.

**Dependencies:** `@supabase/supabase-js` 2.117.3 (runtime) and `@electric-sql/pglite` 0.5.8 (dev, tests only). Both
are pinned exact and were released more than two weeks earlier. `src/types/database.ts` is hand-written in the
generated shape until types can be generated from an applied project.

## Checks actually run

- `npm run test:db`: 11 tests passed (`evidence/m06/db-tests.txt`):
  - **Anonymous visitors** read only the publication and are denied drafts, membership, media, every RPC and storage
    writes.
  - **Signed in but not enrolled:** cannot save, publish, register media, enroll itself, or write tables directly, and
    sees no draft rows.
  - **Enrollment** is admin-only; editors cannot enroll others or change roles.
  - **Draft saves:** a stale revision gets `PT409` with the current revision; invalid content gets `PT422`; neither
    changes anything. Saving never publishes.
  - **Publishing** copies exactly the saved revision; a stale publish is refused and the public keeps the old revision.
  - **Import** keeps the replaced draft as recovery and does not publish.
  - **Media:**
    - only PNG/JPEG/WebP up to 10 MB is registered;
    - uploads are accepted only under registered names, and never from a stranger;
    - draft objects are invisible to strangers and anonymous visitors;
    - publishing fails until the image is copied, and nothing changes on failure;
    - referenced objects cannot be removed or renamed;
    - removal succeeds once nothing shows the image.
  - **Grants:** only `is_editor` is executable by anonymous visitors; the public RPCs only by authenticated users; every
    security-definer function pins `search_path`.
  - **Validator parity:** server and client agree on verdict and message for all 48 cases (24 reference-parity,
    4 stricter, 20 workshop/type cases).
  - **Catalog:** the item, model and symbol lists match the client data.
- `npm run test:m06`: 11 browser checks passed in Edge (`evidence/m06/report.json`, screenshots in `evidence/m06/`):
  - the labelled sample world is shown before anything is published;
  - the editor requires sign-in;
  - wrong passwords and non-enrolled accounts are refused (the database answers 403);
  - owner drafts stay private;
  - a PNG portrait is resized to a 60×80 WebP, stored privately, and shown through a signed URL in a second session;
  - preview, then publishing copies the image to the public bucket, and visitors see revision 2 with the image loaded;
  - concurrent sessions: the stale save is refused with "now revision 3", the edit is kept, and an explicit overwrite
    saves it;
  - when the session ends, the failed save keeps the input; signing in through the dialog and retrying saves it;
  - a bypassed client sending an invalid document gets 422;
  - with the REST API unreachable, the loader ends with an error and Try again, which recovers;
  - no service key is configured in the browser.
- `npm test`: 36 unit tests passed, including 8 new repository tests with a recording fake client (no fallback to a
  draft, error mapping, copy-before-publish ordering, no publish after a failed copy, media URL resolution, removal
  order).
- `npm run build` (typecheck plus bundle) passed. The bundle contains no `service_role`. `npm run assets:verify` checked
  all 100 hashes. `git diff --check` was clean.
- **Demo-mode regressions:** `test:browser`, `test:m02`, `test:m03`, `test:m04` (18) and `test:m05` (13) all passed.
- **M05 editor screenshot comparison, rerun three times:**
  - nine of twelve pairs reproduce the recorded difference counts exactly;
  - the three workshop-editor pairs vary between runs of the same build (recipe form 575 then 0, inventory 5212 then
    5466), which is capture noise already noted in M05;
  - local-mode text and markup are unchanged.

## Hosted verification - 2026-10-24

At the owner's request, the owner was signed in to the Supabase CLI (2.122.0). Then:

- **Project:** `jvd-world` (ref `bkfvkqnusckxyphpvsiq`) was created in the "Personal Projects" organization, region
  ap-southeast-1, free plan. The owner's other project ("Manthano") was not touched.
- **Migration:** `supabase db push --linked` was run after a dry run and applied `20261024000000_portfolio_content.sql`
  without errors.
- **Auth settings:** `supabase/config.toml` declares only `enable_signup = false`, `site_url` and
  `additional_redirect_urls`. `supabase config push` changed exactly those three properties; a fresh `config diff`
  shows no declared differences.
- **Owner:** `chanseytheopiest@gmail.com` was created through the Auth admin API with a generated password and email
  confirmed, then enrolled as `owner`. The secret key stayed in process memory and is not stored anywhere.
- **Local configuration:** `.env.local` (ignored by Git) holds only the URL and the publishable key. The CLI link state
  in `supabase/.temp/` is ignored, and the database password is in the ignored `.env.supabase.local`.
- **Types:** `src/types/database.ts` was generated from the applied schema. `portfolio_editors.role` is a text column,
  so the repository now narrows it.

`tests/e2e/m06-hosted.mjs`: 10 checks passed against the hosted project in Edge (`evidence/m06/hosted-report.json`, `hosted-*.png`):
- **Anonymous:** reads only the empty publication. Drafts, membership, media and `save_draft` return 401.
- **Visitors** see the labelled sample world.
- **Public sign-up** is refused (422).
- **Non-enrolled account:** a temporary account sees the not-enrolled state. `save_draft`, `register_media` and
  self-enrollment return 403, and it sees no draft rows.
- **Owner draft:** saving is private. A stale save gets HTTP 409 with `code: PT409` and `details: "1"` from real
  PostgREST, and an invalid document gets 422 with the validator message.
- **Upload:** stored privately as a 60×80 WebP. The public URL fails before publishing, and the drafts bucket is not
  public. A second owner session shows it through a signed URL.
- **Publish:** the image is copied to the public bucket (public URL 200), and visitors see revision 2 with the image
  loaded.
- **Sessions:** the owner session survives a reload; a stale session gets "now revision 3" and keeps its edit; sign-out
  works.

Afterwards the test deleted every draft, publication, media record and stored object it created, plus the temporary
account. The project was left with 0 drafts, 0 publications, 0 media records and one user, the enrolled owner.

The built bundle contains neither the secret nor the legacy service-role key value. The only match for `sb_secret_` is
supabase-js's own key-prefix check.

## What the emulator and PGlite do not prove

- **Hosted Storage service:** enforcement of bucket size and MIME limits (the emulator applies the same limits itself),
  real signed-URL tokens and CDN caching.
- **Supabase Auth:** JWT signature verification, refresh-token rotation, the sign-up toggle, rate limits and email
  settings. The emulator issues unsigned tokens and simulates expiry by invalidating every token.
- **PostgREST details:** the exact JSON for `PTxxx` errors. The client also maps HTTP 409/422/401/403, so it does not
  depend on the body alone.
- **True concurrency:** PGlite runs one connection. The revision guard uses `select … for update` plus a conditional
  `on conflict … where`, and the concurrent first-save path is reasoned about, not raced.

## Remaining items

1. **Production origin:** once the site is deployed, add its origin to `site_url` and `additional_redirect_urls` in
   `supabase/config.toml` and run `supabase config push`.
2. **Hosting variables:** set the same three `VITE_` variables in the hosting provider.
3. **Owner password:** the generated password was shown in the setup conversation, so the owner should rotate it. The
   app has no change-password screen yet.
4. **Not exercised against the hosted project:** session-expiry recovery and true concurrent first saves. Both are
   covered only by the emulator and by reasoning.

## Known limitations

- **Orphaned uploads:** images removed from the draft are not deleted automatically. `remove_unused_media` exists, but
  there is no editor UI for media cleanup yet.
- **Signed URLs** for draft-only images last one hour. Reloading the editor renews them.
- **Bundle size:** supabase-js is bundled in demo mode as well (602 kB minified, 172 kB gzip).
- **Contact** still sends nothing, as specified.

No deployment, no hosted migration, and no repository-setting change.
