# Supabase implementation plan

## Client setup

Use the official React quickstart and `@supabase/supabase-js`. Environment values: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Anything prefixed VITE is bundled for the browser; never put a secret/service-role key there. `.env.example` contains only placeholders. Keep real `.env.local` ignored by Git.

The publishable key identifies the app; the signed-in owner's token and RLS enforce permissions. Public visitors do not need accounts. Owner sign-in may use password or email magic link; choose one, configure redirects for localhost and production, and test sign-out/session-expiry behavior.

## Authorization matrix

| Resource/action | Anonymous | Signed in, not enrolled | Enrolled owner/editor |
| --- | --- | --- | --- |
| Read published document | Allow | Allow | Allow |
| Read draft | Deny | Deny | Allow |
| Save draft / publish | Deny | Deny | Allow with validation/revision guard |
| Read editor membership | Deny | At most own membership | At most own membership unless explicit admin flow |
| Enroll editors | Deny | Deny | Trusted administrative operation only |
| Upload/change/delete media | Deny | Deny | Allow for authorized scoped paths |
| Visitor slots/workshop | Local browser only | Local browser only | Local browser only |

Enable RLS on every exposed table. Write policies for each necessary SELECT/INSERT/UPDATE/DELETE, and test the denied cases as well as the allowed cases. Configure function execute grants explicitly. Keep owner bootstrap a documented trusted SQL/admin step using the actual user's Auth UUID; no self-enrollment policy.

## Storage

Bundled models, thumbnails and fonts stay static in the React app. Owner-uploaded photos and portrait use Storage with durable object paths and metadata.

Recommended: private bucket `portfolio-drafts` for unpublished uploads; public bucket `portfolio-media` only for approved public assets. A public bucket's URLs are public independently of draft row privacy. During publishing, copy approved uploads through an authorized workflow to immutable paths in the public bucket, validate success, then publish references atomically. Clean up failed staging operations without removing referenced content. If confidential draft media is unnecessary, a simpler public bucket is possible only with that explicit expectation documented.

Apply bucket/path ownership policies; validate size and MIME in client and server configuration. Accept PNG/JPEG/WebP for owner uploads initially. The bundled trusted SVG demos are static assets; do not treat them as permission to accept arbitrary uploaded SVG or HTML. Suggested project limit: 30 images, matching baseline validation; suggested upload size cap: 10MB per image, configurable.

## Operational behavior

A slow backend must not leave the cinematic loader stuck forever. Show clear loading/error states and an explicit retry. Demo mode is visibly separate from backend mode. Published content can be cached, but public queries must never retrieve drafts as fallback. No successful save/publish toast until the service confirms success.

Document migration, environment setup, owner enrollment, redirects, storage policies and deployment settings. Run auth/RLS tests against a development instance before production publication. Generate database TypeScript types after the schema is applied.

Contact delivery, if later added, uses a server function with validated input, anti-abuse limits and server-side credentials. It is not required for matching the current message-review feature.
