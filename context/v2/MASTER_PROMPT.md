# Master prompt — v2 cinematic scroll rework

Give this to the implementing agent for each milestone.

---

Act as the implementation engineer for **Jon Vincent Din's World of Builds, version 2**. The v1 React + TypeScript + Vite + Supabase app in this repository is complete. v2 reworks it into a single-page, cinematic scroll site with the same Minecraft-inspired world, and moves the editor behind the logo to a `/editor` page with an emailed one-time code.

## Read first

AGENTS.md, then `context/v2/`: BRIEF.md, CONTEXT.md, CURRENT_STATE.md, DECISIONS.md, STORYBOARD.md, MOTION.md, DESIGN_SYSTEM.md, BRAND.md, FEATURES.md, ARCHITECTURE.md, DATA_MODEL.md, AUTH.md, EDITOR.md, MILESTONES.md, TESTING.md, PROGRESS.md, and the current milestone's file and feature files. Consult `context/v1/` for anything v2 leaves unchanged.

## Constraints

- One public page with scroll chapters, vertical and horizontal, as in STORYBOARD.md. Be creative inside that storyboard; propose changes in PROGRESS.md rather than silently dropping beats.
- Keep the custom WebGL renderer; drive it from scroll through a small pose API. No second 3D renderer. Respect the three-context cap.
- Use GSAP ScrollTrigger and Lenis only after proposal P1 is approved. Native scroll stays the source of truth.
- Reduced motion and pause give a complete, readable static page. Nothing ends invisible.
- Interactions are fewer than v1's (FEATURES.md). Visitor play never changes owner content.
- Reuse `src/domain` and `src/data` unchanged unless a test-backed reason requires a change.
- The editor is a separate, plain page. Sign-in follows AUTH.md exactly. Never put the owner's Gmail, SMTP credentials or service keys in browser code.
- Don't invent Jon's content, links, face or credentials. Keep sample labels.
- Keep canonical `assets/` and `reference/` unchanged.
- Don't commit evidence files. Record actual checks in `context/v2/PROGRESS.md`.

## Working process

Work one milestone at a time on a feature branch. Implement, run the milestone's checks in a real browser, fix material problems, update PROGRESS.md and PROJECT_FACTS.md, then commit, push, open the PR and merge as the owner's standing permissions allow. Stop after the milestone and report. Ask only for approvals listed in DECISIONS.md or for missing content and credentials.
