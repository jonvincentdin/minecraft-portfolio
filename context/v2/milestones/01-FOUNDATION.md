# V2-01 — Scroll foundation

Dependency: V2-00. Approvals needed first: P1 (GSAP + Lenis dependencies), P2 (AGENTS.md update).

## Scope

- Feature branch from `main`. New v2 app shell alongside v1 code; remove v1 routing once v2 renders every section (by V2-05).
- Vite multi-page: `/` and `/editor` (the editor entry can mount the v1 editor unchanged for now).
- `ScrollProvider`, `Chapter` component, motion-preference store, sky layer, HUD (logo link, XP bar, chapter hotbar, pause), anchors and v1-hash redirects.
- Each chapter rendered as a static placeholder section with real content from the published snapshot, so the page reads top to bottom before any choreography.
- Brand PNGs copied into `public/brand/`; favicon and Apple touch icon set from `jvd-icon-*.png`; OG image from the keyart.
- `useVoxelView` with mount-on-proximity and the three-context cap.

## Acceptance

The page scrolls top to bottom with all content readable; the hotbar and XP bar track scroll; anchors and `#editor` → `/editor` work; reduced motion and pause produce the static page; WebGL contexts never exceed three; typecheck, build and unit tests pass.
