---
name: jvd-parity-qa
description: Run milestone acceptance for the JVD portfolio - browser checks against the immutable reference, screenshot capture and pixel comparison, evidence files, verification record and draft PR. Use when finishing or re-verifying any milestone (M04 onward) or when a screen must be proven to match the reference.
---

# Parity QA and milestone delivery

## Establish the task

Read applicable AGENTS.md, context/TESTING.md, the milestone file under context/milestones/ and the previous context/M0x_VERIFICATION.md as the format example. Acceptance is the milestone's listed evidence, not a summary of the code.

## Run the servers

- React dev: `npm.cmd run dev` (port 5173, syncs assets first).
- Immutable reference: `npm.cmd run reference` (port 4174).
- Start both in the background before browser tests; tests use Playwright with `channel: 'msedge'`.

## Write the milestone tests

1. Add `tests/e2e/m0N.mjs` following tests/e2e/m03.mjs: the `__lifecycle` init script (rAF, observers, WebGL buffers and programs), page and reference pages side by side, the `enter()` helper that clicks `#skip-intro` and waits for `#loader`, `pageerror` collection and a JSON report written to `test-results/m0N/report.json` with an `errors` array and a `checks` list. Assert behavior; do not only screenshot.
2. Add an npm script `test:m0N`. Adding a script entry to package.json is not a dependency change; adding a package is, and needs approval.
3. Add `tests/visual/capture-m0N.mjs` and `compare-m0N.mjs` following the M03 versions. Capture react-* and reference-* PNGs with identical viewport, seed content, fonts loaded, images decoded, mouse at 0,0, matching page and internal scroll, and idle motion frozen in test mode only. Use 1440x900 and 390x844, plus 1366x768, 1024x768 and 768x1024 where layouts differ.
4. The comparison records per pair the dimensions, the differing-pixel count, the bounding box and the fraction. A global percentage alone is not acceptance: inspect every non-zero pair, locate the difference and either fix it or document it with its region and cause.

## Standard checks

Run and keep the output of: `npm.cmd run build` (typecheck and bundle), `npm.cmd test`, `npm.cmd run assets:verify` (100 hashes, including skill_react.glb), `npm.cmd run test:browser` (shell regression), the earlier milestone suites that the change could affect (`test:m02`, `test:m03`), the new suite, and `git diff --check`. Never report a check that did not run; say which were unavailable.

## Record evidence

1. Copy the final screenshots and JSON reports from test-results/ into `context/evidence/m0N/`. test-results/ is ignored; evidence is committed. Check the size before adding many large PNGs.
2. Write `context/M0N_VERIFICATION.md` with these sections: Implemented, Deliberate differences from the reference, Checks actually run, Visual evidence and reproduction (with commands), Boundaries and delivery.
3. Update the milestone file status, context/PROGRESS.md (checkbox only with acceptance evidence), context/PROJECT_FACTS.md (via jvd-project-facts), CURRENT_STATE.md and README.md run-table rows.

## Deliver

1. Feature branch `feat/m0N-<topic>` from the latest origin/main. Implementation and docs/evidence are separate focused commits, as in M02 and M03.
2. Push and open a draft PR targeting main. `gh` may be absent on this machine; the GitHub REST API with the existing git credential works (`git credential fill` for github.com, never printed or committed). The body covers requirement, changes, deliberate differences, validation actually run, known limitations, migrations/env/dependencies and rollback.
3. Merging needs the user's explicit authorization for that PR. Main has no CI or deploy hook as of 2026-10-23; recheck before merging.

## Never

Modify reference/, canonical assets/ or reference.css to make a comparison pass; claim pixel parity for a pair with differences; mark a milestone complete without its acceptance evidence.
