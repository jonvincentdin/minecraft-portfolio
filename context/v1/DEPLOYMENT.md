# Deployment guide

The portfolio is a static site: Vite builds it into `dist/`, and it talks to Supabase from the browser. There is no
application server to run. V1 is live at https://minecraft-portfolio-v1.vercel.app (2026-10-29, Asia/Singapore).

## V1 production deployment

Dedicated Vercel project: `dream-team-9071/minecraft-portfolio-v1`. Deployment ID:
`dpl_9ptFMCuDVg4K4iEPkVSmGv4FpRhT`. Source runtime: `2e60137` on `origin/main`.
V2 remains on `feat/v2-portfolio-previs`; its files were not changed. The production deployment uploads only
the built static files, with the existing public Supabase configuration compiled into the bundle.
No Git auto-deployment was configured, so v2 work does not replace this deployment.

From the isolated `chore/deploy-v1` checkout, with the three public settings below in ignored `.env.local`:

```powershell
npm ci
npm run build
node scripts/prepare-vercel.mjs
vercel link --yes --project minecraft-portfolio-v1 --scope dream-team-9071
vercel deploy --prebuilt --prod --yes --scope dream-team-9071
```

Use a fresh checkout/output directory for each deployment. Do not deploy the repository folder as static content.
Build Output API documentation: https://vercel.com/docs/build-output-api/configuration.
Production smoke: set `CHECK_URL=https://minecraft-portfolio-v1.vercel.app`, then run
`node tests/e2e/deploy-v1.mjs`. It only reads public content and checks the signed-out editor.
Password sign-in remains supported by the existing app; no owner credentials were used during this deployment.
Email redirect configuration and database policies were not changed.

## Build

Requires Node 22.12 or newer (verified with Node 24.19).

```
npm ci
npm run build        # runs assets:sync (canonical assets and downloads into public/), typecheck, then vite build
```

Output: `dist/`. Preview it locally with `npm run preview` (http://127.0.0.1:4173).

Routing uses the URL hash (`#projects`, `#editor/about`, …), so the host needs **no rewrite rules**. Serve
`dist/index.html` at `/`.

## Environment

Vite inlines `VITE_` variables at **build time**, so set them in the host's build settings and rebuild after a change.

| Variable | Value |
| --- | --- |
| `VITE_CONTENT_MODE` | `supabase` (or `demo` for a browser-local site with no backend) |
| `VITE_SUPABASE_URL` | `https://bkfvkqnusckxyphpvsiq.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The project's publishable key (`sb_publishable_…`), from the Supabase dashboard (Project Settings → API) or `.env.local` |

Never add the secret key, the service-role key or the database password to the host. The browser needs none of them.

## Host settings

Any static host works. Typical values:

| Host | Build command | Output directory | Notes |
| --- | --- | --- | --- |
| Vercel | `npm run build` | `dist` | Framework preset "Vite". Set the Node version to 22 or newer. |
| Netlify | `npm run build` | `dist` | Set `NODE_VERSION=22` in the environment. |
| Cloudflare Pages | `npm run build` | `dist` | Framework preset "Vite". Set `NODE_VERSION=22`. |

Caching: files under `dist/assets/` built by Vite have hashed names and can be cached for a year. The runtime copies
under `/assets/models`, `/assets/thumbs`, `/assets/fonts`, `/assets/demos` and `/downloads` have stable names, so keep
the host's default caching for them.

## Connect the production address to Supabase

After the first deployment, add the site's origin to `supabase/config.toml`:

```toml
[auth]
site_url = "https://<your-domain>"
additional_redirect_urls = ["https://<your-domain>", "http://127.0.0.1:5173"]
```

Then run `npx supabase@2.122.0 config diff`, check that only these two properties change, and run
`npx supabase@2.122.0 config push`. Password sign-in works without this step. The site URL matters for any future
email-based flows.

## After deploying

1. Open the site. With nothing published it shows the sample world under "Nothing has been published yet".
2. Go to `#editor`, sign in as the owner and publish. Then reload the public pages in a private window to confirm
   visitors see the new revision.
3. Do **not** run `npm run test:m06-hosted` once real content exists: it deletes all content when it finishes.

## Rolling back

- **Site:** redeploy the previous build on the host. Reverting the site's code does not change the database.
- **Content:** before large edits, export the content JSON from the editor. Importing it later restores the draft,
  which you then publish again.
- **Database:** schema changes need their own data-preserving plan (see `supabase/README.md`).
