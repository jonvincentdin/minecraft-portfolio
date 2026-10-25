# V09 — HUD, sky and scroll system

## Scroll system

`ScrollProvider` (ARCHITECTURE.md) with GSAP ScrollTrigger and Lenis (proposal P1). It provides per-chapter progress, global progress, pin registration, refresh on resize/font/image load, and teardown. Anchor links and hotbar clicks scroll through Lenis with an offset that lands on the chapter's resting frame. Native keyboard scrolling (Space, PageDown, arrows, Home/End) works unchanged.

## Sky layer

A fixed full-screen layer behind all chapters. Global progress drives the gradient between the day-cycle tokens (DESIGN_SYSTEM.md), the sun and moon positions on an arc, cloud drift speed and star opacity.

## HUD

- **Logo** (top-left): `jvd-wordmark.svg`, a link to `/editor`, accessible name "Jon Vincent Din — editor sign-in".
- **XP bar** (bottom edge): global progress; the level number is the count of chapters passed; a level-up flash when a chapter is completed.
- **Hotbar** (bottom-centre): nine slots, one per chapter plus the logo block; active highlight; click scrolls; `aria-current` on the active slot; works as a `nav` landmark labelled "Chapters". It swaps to the project hotbar while Projects is pinned.
- **Pause motion** toggle (top-right).

## Acceptance

Hotbar and XP bar track the scroll position in both directions; deep links (`/#skills`) land on the right resting frame after the intro; no layout shift when the HUD appears; HUD controls reachable by keyboard in a sensible order.
