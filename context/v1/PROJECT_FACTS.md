# Project fact snapshot

Snapshot: 2026-10-24 (Asia/Singapore), after M07.

## Verified current state

- M00 merged through PR #1 at e6d134749a56f742a18009847d19940e89780c96. M01-M03 merged through PR #4 at e505c63e54e078e566e47dfacc2710f5fc13d70e.
- M04 merged to main through PR #7 (squash) at 656cedd8885086a6581e5a7620f0f905174537d5; implementation 84543ec, evidence 824ce5d.
- M05 merged to main through PR #9 (squash) at 048ec692450b6282fe1cfcafe295cabba6f58ee0; implementation 6c1caeb, evidence c22121d.
- All seven public routes and the world editor are React components. The editor runs against a browser-local repository (IndexedDB jvd-world-local-v1: draft, published, recovery). There is no sign-in or shared backend.
- Canonical assets and reference remain unchanged: 48 GLBs, 39 thumbnails; scene-data runtime. Reference revision: 47d8b1ca11b05db6791adaf9bf33a5cf9bd946ca.
- Supabase remains unavailable until M06. No remote save, authorization or publication behavior was added.
- Seven project skills live in .agents/skills with Claude Code pointers in .claude/skills.

## Accepted decisions and source

- The user pre-authorized commit, push and merge for each milestone on 2026-10-23, and asked that the next milestone not start automatically.
- Preserve the original renderer/CSS/models; reference modules (crafting, tree-paths, motion) are copied byte-for-byte with integrity tests.
- Keep #achievements and #advancements alias; original home fallback and explicit entry readiness remain.
- Visitor inventory and workshop progress are browser-local and never change actual skills.
- Pause and reduced motion settle every running sequence, including a glow route in progress, a documented difference from the reference.
- Invalid trees are reported and not drawn; multiple roots are valid; no edge is drawn between roots.
- Local mode: public pages show this browser’s published snapshot (or the seed), preview shows the draft under a banner, and publishing never leaves the browser. Every change is validated as a whole document; stale saves are refused, keeping the edits.
- Deleting referenced projects or parent nodes requires an explicit choice; import keeps a recovery copy and never publishes.
- Contact remains an unsent review; real owner content is not invented.

## Completed work with evidence

- M00-M03 verification records and evidence remain in context/.
- M04_VERIFICATION.md and evidence/m04 record the tree, motion and visual checks.
- M05_VERIFICATION.md and evidence/m05 record the field coverage matrix, editor checks and visual differences.
- Build/typecheck, 29 unit tests, 100 asset hashes, shell regression, test:m02, test:m03, test:m04 (18 checks) and test:m05 (13 checks) passed.
- All 11 advancement screenshot pairs across five viewports, both trees, list view and a deep selection match the reference with zero differing pixels.

## M06 state (merged to main, verified on the hosted project)

- The M03 dialog fix merged through PR #11 (squash) at b6caeb2. M06 merged through PR #12 (squash) at f80e90b. Main has no branch protection, CI workflow, webhook or deployment.
- Verified: test:db (11, PGlite), test:m06 (11 browser checks against the emulator), 36 unit tests, build, 100 asset hashes, and the demo-mode regressions smoke/M02/M03/M04/M05.
- Hosted: Supabase project jvd-world (ref bkfvkqnusckxyphpvsiq, ap-southeast-1, free plan). The migration is applied, sign-up is disabled, and chanseytheopiest@gmail.com is enrolled as owner. tests/e2e/m06-hosted.mjs passed 10 checks and left the project with no content. The site itself is not deployed.

## Planned work

All milestones (M00–M07) are complete. Next: deployment (host to be chosen by the owner) and the owner's real content.

## M07 state

- Final parity report: context/M07_VERIFICATION.md. All suites pass, including the new test:reference, test:m07 and test:engines (Firefox 157, WebKit 27.2).
- Every exact screenshot pair matches or has a documented cause.
- M07 changes: the M01 smoke comparison now uses the same deep link for both sites; the project search gets a focus ring the reference lacked; the failed-upload cleanup is tested; a deployment guide and a README rewrite were added.

## Blockers and unknowns

- **Supabase:** the production origin is not yet in the Auth settings or the hosting variables, and the owner should rotate the generated password (there is no change-password UI yet).
- **Unverified:** physical touch, other browser engines and separate modal-entrance timing.
- **Resolved:** the M03 dialog capture residual (backdrop-blur compositing); all 11 M03 pairs are exact.
- **Content not yet supplied:** owner portrait, social URLs and verified credentials.
- **Deployment:** none has occurred.

## Next concrete steps

1. Owner: sign in at #editor and import or enter real content, then publish.
2. When deploying: set the VITE_ variables in hosting, then add the production origin to supabase/config.toml and run supabase config push.
3. Physical touch-device check after deployment.

## V1 production deployment - 2026-10-29 (Asia/Singapore)

- Owner requested full v1 deployment while preserving v2. Used isolated branch `chore/deploy-v1` from fetched `origin/main` at `2e60137`; v2 checkout stays on `feat/v2-portfolio-previs` at `87b4a25`.
- Published https://minecraft-portfolio-v1.vercel.app to dedicated Vercel project `dream-team-9071/minecraft-portfolio-v1`; deployment `dpl_9ptFMCuDVg4K4iEPkVSmGv4FpRhT` reported READY. No merge or Git auto-deployment configured.
- Full existing React v1 runtime deployed unchanged, with the existing public Supabase configuration. Added static-only Vercel packaging and corrected the moved seed path in `.gitattributes` after a Windows line-ending integrity failure. No canonical asset/reference edits, migrations, content publication, auth configuration changes or private keys uploaded.
- Passed production build/typecheck (existing >500 kB chunk warning), all 37 unit tests after fixing the seed checkout line endings, and all 100 original asset hashes.
- Read-only browser smoke passed locally and on the public production URL: seven public routes, signed-out owner editor, Supabase publications HTTP 200, zero page errors, no horizontal overflow at 390px. Desktop/mobile screenshots and JSON evidence are local under `test-results/deploy-v1/`. Reproducible check: `tests/e2e/deploy-v1.mjs`.
- Owner-authenticated editing/publication and email redirects were not retested. No destructive hosted tests run. Existing owner content and missing social-link placeholders were preserved.
