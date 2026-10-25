# Architecture (v2)

## Pages

| Path | What | Notes |
| --- | --- | --- |
| `/` | The single public page: intro overlay plus chapters 1–8 | Section anchors: `#spawn`, `#about`, `#projects`, `#skills`, `#experience`, `#advancements`, `#contact` |
| `/editor` | Editor sign-in, then the editor | Separate entry and bundle. Loads no scroll engine, particles or intro |
| `/#editor`, `/#home`, other v1 hashes | Back-compat | `#editor` → redirect to `/editor`. `#home` → `#spawn`. `#achievements` → `#advancements`. Others map to the same-named anchors |

Use a Vite multi-page build (`index.html`, `editor/index.html`) so the public page never ships editor code and vice versa. Hosting must rewrite `/editor` and `/editor/` to `editor/index.html`.

## Public page structure

```
<App>
  <SkyLayer/>                    fixed, scrubbed by global progress
  <Hud/>                         logo link, XP bar, hotbar, pause toggle
  <IntroCinematic/>              overlay; unmounts after entry
  <main>
    <Chapter id="spawn"> … </Chapter>
    …
    <Credits/>
  </main>
</App>
```

- `ScrollProvider` owns Lenis and the GSAP ticker, exposes `useChapterTimeline(ref, build)`, and kills its timelines on unmount, including under Strict Mode.
- Each chapter is a component folder under `src/v2/chapters/<name>/` with its timeline builder in a separate file, so the motion can be tested and tuned apart from the markup.
- `useVoxelView` wraps the existing renderer with mount-on-proximity and the three-context cap (MOTION.md). Scroll timelines call `view.setPose({ yaw, pitch, zoom })`.
- Motion preference (`reduced | paused | full`) lives in one store. Chapters read it and build either a scroll timeline or a static layout.

## Reused from v1

- `src/domain/*` (crafting engine, tree paths, validation): unchanged.
- `src/data/*` repositories (demo, local and Supabase): unchanged API. The public page reads only the published snapshot.
- The renderer and `public/assets`: unchanged.
- The editor's forms: moved to the `/editor` entry and simplified (EDITOR.md).

## Removed

Hash router and page transitions, the per-route reveal system, the v1 header nav and "Edit world" button, the public 3×3 workshop and inventory drag, tree pan/zoom, the experience comparison, and the password and change-password UI.

## State boundaries (unchanged rules)

Published owner content is public. Drafts need an authorized owner session. Visitor play state (the "Try a recipe" crafts) stays in memory or localStorage and never touches owner content.

## Secrets

Browser: only `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_CONTENT_MODE`. The SMTP credentials and service-role key live in Supabase, never in the repo or a `VITE_` variable. The owner's email is **not** compiled into the browser bundle (AUTH.md).
