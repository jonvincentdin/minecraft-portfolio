# Decisions and open questions

## Decided (from the brief)

- D1. One public page; the scroll position is the primary navigation.
- D2. Logo click → `/editor`, a separate page. The editor UI stays plain and functional, with no cinematic motion.
- D3. Editor sign-in is an emailed one-time code sent only to the owner's Gmail, jonvincent.din@gmail.com. Authority is enforced on the server (AUTH.md).
- D4. Fewer interactions than v1 (FEATURES.md lists what stays).
- D5. New logo: DIN, a cinematic block-built title render (BRAND.md). The owner rejected "JVD" letters on 2026-10-26.
- D6. Verification evidence is not committed (TESTING.md).

## Proposed (approve when the milestone starts)

| ID | Proposal | Why | Approval needed because |
| --- | --- | --- | --- |
| P1 | Add **GSAP + ScrollTrigger** for scroll-linked timelines, pinning and horizontal tracks, and **Lenis** for smoothed wheel scrolling. | Pinning, scrubbing, horizontal pin-tracks and refresh-on-resize are hard to make robust by hand. CSS scroll-driven animations alone can't pin or coordinate the renderer. GSAP and its plugins have been free to use since 2025. | AGENTS.md requires a documented need for a new animation library, and dependency manifests are protected. The custom WebGL renderer stays; GSAP only drives values. |
| P2 | Update `AGENTS.md` so its `context/...` paths point to `context/v2/`, and replace "preserve the supplied reference / never redesign" with "v2 is an owner-approved redesign; keep the theme, assets and backend." | The current text forbids the redesign the owner asked for, and its paths point to files now under `context/v1/`. | AGENTS.md is protected. |
| P3 | Replace password sign-in with Supabase email OTP. Enroll jonvincent.din@gmail.com as owner and decide whether to remove the chanseytheopiest@gmail.com membership. | The brief asks for an emailed code to the Gmail. | Auth and enrollment are protected. Removing the old owner is a production data change. |
| P4 | Configure custom SMTP (e.g. Resend, or Gmail SMTP with an app password) for Supabase Auth. | Supabase's built-in mailer is meant for testing: low rate limits and restricted recipients. OTP delivery has to be reliable. | It adds a secret held in Supabase. It must never be in the repo or a `VITE_` variable. |
| P5 | Serve the editor as a real path, `/editor` (Vite multi-page entry or a tiny path router), and make the hosting rewrite unknown paths to `index.html`. `#editor` redirects to `/editor`. | "Directs you to another page." | Deployment configuration is protected once hosting exists. |

## Open questions for the owner

- Q1. Public repository: this repo is public, so the Gmail written in these context files is public. Keep it, or move it to an ignored local note and the Supabase configuration only?
- Q2. Should visitors also get a visible way back to the top, given the logo now leads to the editor? (Proposed: the first hotbar slot and the `Home` key both return to Spawn.)
- Q3. Keep the experience multi-chapter comparison at all, or drop it? (Proposed: drop.)
- Q4. Hosting target for v2 (Vercel, Netlify, Cloudflare Pages, GitHub Pages). This affects the `/editor` rewrite.
