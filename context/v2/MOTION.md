# Motion specification (v2)

> **Owner direction, 2026-10-26: heavy, continuous motion.**
> - **Weight:** an inertial scroll layer that trails the real scroll position (previs lerp factor 0.075 per frame) and skews content with scroll velocity (up to about 7°). Native scroll stays the source of truth; Lenis with a low `lerp` is the production equivalent.
> - **Travel:** entrances cover 30–80vw or vh, not 12–20px. Use rotations of 6–45° and an overshoot ease (back-out) so elements land with a thud.
> - **Depth:** parallax speeds from 0.3× to 3× on decorative blocks.
> - **Flow:** no scene-swap transitions; see STORYBOARD.md → Owner direction.
> - Reduced motion and pause still give the static, readable page.

v1's timing table (`../v1/MOTION.md`) still holds for the interactions v2 keeps: hover, press, six-pixel feedback, the advancement edge and node glow, and dialogs. This file adds the scroll system.

## Engine

- Scroll-linked timelines, pinning and horizontal tracks: **GSAP ScrollTrigger** (proposal P1; approve before installing).
- Smoothed wheel input: **Lenis**, driven from the same `requestAnimationFrame` tick as GSAP. Native scrolling stays the source of truth: no virtual scroll containers, and keyboard, touch, find-in-page and anchor links must keep working.
- 3D: the existing VoxelView renderer. Scroll timelines set renderer parameters (yaw, pitch, zoom, focus) through a small imperative API on the React wrapper; the renderer keeps its own frame loop. Do not add a second 3D renderer.
- Everything else: CSS transforms and opacity. Avoid animating layout properties.

## Kinds of motion

| Kind | Use for | Rule |
| --- | --- | --- |
| Scrubbed | Camera moves, parallax, page curls, tracks, path glow, sky | Fully reversible; no state change at the ends |
| Triggered | Toasts, pick-up bounces, particle bursts, typing | Plays once per crossing; replays when re-crossed going forward only |
| Ambient | Clouds, fire, fireflies, idle bob | Pauses off-screen and when motion is paused |
| Interactive | Hover, press, drag-rotate, clicks | v1 timings |

## Easing and timing defaults

- Scrubs: `ease: "none"` with ScrollTrigger `scrub: 0.6` (a short catch-up lag that feels weighty).
- Entrances: `cubic-bezier(.16,1,.3,1)` (v1's "out-expo-ish"), 500–700ms.
- Impacts (blocks landing): a short drop with `power3.in`, then a 120ms squash (scaleY .85, scaleX 1.1) and settle.
- Stagger groups: 30–60ms per element, 12 elements max before switching to a wave (stagger from the centre or by grid distance).

## Transition catalogue (between chapters)

Use each at most once. Variety is part of the brief.

| Transition | Where | Description |
| --- | --- | --- |
| Chunk load | Intro start | Tiles pop in from the centre outward, scaled 0→1 with a stagger by distance |
| Depth dive | Intro → Spawn | Layers zoom past the camera at different speeds; the clouds are punched through |
| Block dissolve | Spawn → About | Screen-space tile grid; tiles fall and rotate with gravity, revealing the next chapter |
| Book close | About → Projects | 3D rotateY of the cover, then a slide down |
| Item drop | Projects → Skills | Card becomes a spinning item entity and falls; the camera follows |
| Plank split | Skills → Experience | The crafting table splits into slats that slide apart like doors |
| Mine-shaft fall | Experience → Advancements | Fast vertical whip with motion-blur streaks (pixel lines) |
| Nightfall | Advancements → Contact | Sky scrub with torches lighting up in sequence |
| Credits roll | Contact → Credits | Slow upward crawl, with the sky looping to dawn |

## Element animation (not just text)

- Text: pixel type-on for display headings, word-by-word rise for body, and ink-reveal on the journal.
- Images: pixelate-in. A canvas or CSS `image-rendering: pixelated` steps from 8px blocks to sharp over 400ms.
- Cards and panels: build from blocks. Borders draw on clockwise, then the fill appears.
- Icons and symbols: pop with a squash on arrival.
- Buttons: v1 six-pixel burst plus a 3px rise.
- 3D models: drop-in with bounce, scroll-scrubbed rotation, and drag-to-rotate where kept.
- Lines (tree edges, rails): stroke-dashoffset draw.
- Numbers (XP level, counts): tick up.

## Performance budget

- 60 fps on a mid-range laptop and no long tasks over 50ms while scrolling. Measure, don't assume.
- At most **three live WebGL contexts** at once. Mount a VoxelView only while its chapter is within one viewport of the screen; otherwise show its thumbnail. Browsers cap the number of WebGL contexts, so this cap matters on a single page.
- Particles: pooled DOM or a single canvas per chapter; no per-particle React state.
- Use `will-change` only during active pins.
- Recalculate triggers on resize, font load and image load (`ScrollTrigger.refresh`), debounced.

## Pause and reduced motion

- `prefers-reduced-motion: reduce`, or the pause toggle, turns the page into a **static, readable long page**: no pins, no scrubbing, no horizontal tracks (they become vertical lists), no particles, and the sky fixed per chapter. Content order and anchors are unchanged. The intro still requires Enter world, with fades only.
- Toggling either at runtime must settle every timeline into its readable end state. No element may stay invisible.
- Respond to the media query changing while the page is open (as v1 does).

## Determinism for tests

A test mode (`?test=1` or an env flag) seeds random order, freezes ambient loops and exposes `window.__scroll.progress()` per chapter. Test real timing separately.
