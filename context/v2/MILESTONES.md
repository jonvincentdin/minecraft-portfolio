# Milestones (v2)

A dependency-ordered plan. The owner builds it step by step, so each milestone ends with a working page and stops for review. Do not start the next milestone unasked.

| Milestone | Depends on | File |
| --- | --- | --- |
| V2-00 — Context and logo | none | milestones/00-CONTEXT.md |
| V2-01 — Scroll foundation | V2-00 | milestones/01-FOUNDATION.md |
| V2-02 — Intro 2.0 and Spawn | V2-01 | milestones/02-INTRO-SPAWN.md |
| V2-03 — About and Projects | V2-02 | milestones/03-ABOUT-PROJECTS.md |
| V2-04 — Skills and Experience | V2-03 | milestones/04-SKILLS-EXPERIENCE.md |
| V2-05 — Advancements, Contact and credits | V2-04 | milestones/05-ADVANCEMENTS-CONTACT.md |
| V2-06 — Editor page and email-code sign-in | V2-01 (can run in parallel with 02–05) | milestones/06-EDITOR-AUTH.md |
| V2-07 — Polish, performance and handoff | V2-05, V2-06 | milestones/07-POLISH.md |

Mark a milestone done only after its acceptance checks have actually run. Record them in PROGRESS.md. Evidence files stay in `test-results/` and are not committed.
