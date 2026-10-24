# Deployment guide

The portfolio is a static site: Vite builds it into `dist/`, and it talks to Supabase from the browser. There is no
application server to run. It has not been deployed yet.

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
