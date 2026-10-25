# Testing (v2)

Evidence policy: screenshots, traces and JSON reports go to `test-results/` (ignored by Git) and are **not committed**. `PROGRESS.md` records what ran, the results and any limitations. Do not claim a check that did not run.

## Automated

| Check | Command (to be added) | Covers |
| --- | --- | --- |
| Typecheck and build | `npm run build` | Both entries (`/`, `/editor`) |
| Unit | `npm test` | Domain (crafting, trees, validation), repositories, Try-a-recipe quantities, the scroll-progress mapping functions |
| Database | `npm run test:db` | RLS and validators, unchanged |
| Scroll e2e | `npm run test:v2-scroll` | Scroll to each chapter's progress points (0, .25, .5, .75, 1) in test mode; assert the visible state; reverse and assert again; hotbar and XP bar values; anchors and v1-hash redirects |
| Motion preference | `npm run test:v2-motion` | Reduced motion and pause produce the static page; toggling mid-scroll settles everything visible |
| Intro | `npm run test:v2-intro` | No auto-entry; entry duration; replay twice; nothing left behind after the overlay is removed |
| Auth | `npm run test:v2-auth` | AUTH.md tests against the emulator |
| Bundle | `npm run test:v2-bundle` | No Gmail or secrets in `dist/` |
| Assets | `npm run assets:verify` | Canonical hashes unchanged |

## Manual or traced

- Performance: a Chrome/Edge performance trace scrolling the full page at 1440×900. Record fps and long tasks.
- WebGL: a real GPU device; the context count never exceeds three; the fallback with WebGL disabled.
- Keyboard: Tab order through HUD → chapters → overlays; Space/PageDown scroll; no focus traps except in open dialogs.
- Screen reader: chapter headings, hotbar `nav`, toasts announced politely, the tree list view.
- Widths: 390, 768, 1024, 1440, 1920. No horizontal page overflow.
- Hosted OTP: a real code to jonvincent.din@gmail.com, once.
