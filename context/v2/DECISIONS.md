# Decisions and delivery boundaries

Updated 2026-10-27 (Asia/Singapore).

## Accepted direction

- D1. A continuous public page, with vertical reading and a short horizontal project passage on desktop. Native scroll is the source of truth.
- D2. Portfolio content leads; Minecraft supplies voxel craftsmanship, materials and restrained interactions. Projects follow the hero.
- D3. Keep the enchanted DIN logo and original React artifact. Create a small coherent set of new review models; preserve existing canonical assets.
- D4. Large, smooth image and camera movement; stable reading areas. Repeated skew, letter scattering, slamming entrances and minecart stations are superseded.
- D5. Use the same v1 database structure, document version, validators, repositories, Storage layout and RLS. No migration is required for this visual redesign.
- D6. The current task covers v2 documentation, model drafts and a local previs/video. It does not start production milestones.
- D7. Root AGENTS.md permits focused feature-branch commits, pushes and draft PRs. A merge still requires explicit authorization for that merge. The older PROJECT_FACTS claim of blanket merge permission was incorrect and is superseded.
- D8. Screenshots/reports remain ignored. The user-requested MP4 is a tracked design deliverable.

## Deferred proposals

| ID | Proposal and condition |
| --- | --- |
| P1 | GSAP/Lenis are optional, not required dependencies. First prove native scroll, CSS sticky and owned rAF satisfy the storyboard. Propose a dependency only for a measured, concrete gap. None installed here. |
| P2 | Correct root AGENTS.md and old skill paths separately if authorized. Current task leaves these rules unchanged; CONTEXT.md resolves their paths. |
| P3 | Earlier email-code sign-in request remains a separate auth milestone. Keep current working password access until an approved, tested replacement exists. No owner removal or enrollment in this task. |
| P4 | SMTP/email-template changes require a concrete hosted-auth plan and authorization. No credentials belong in chat, Git or VITE variables. |
| P5 | Separate /editor entry remains planned; hosting rewrites depend on the chosen host. No deployment changes now. |
| P6 | Real shadows, emissive materials or richer camera capability may justify extending the existing renderer. Document and compare a prototype before changing production rendering; new geometry alone does not supply those effects. |

## Model approval and next step

Review the video and the staged model gallery. The next production task is V2-01 only after the owner asks to proceed. Model drafts are authorized for review, not silently promoted over canonical assets.
