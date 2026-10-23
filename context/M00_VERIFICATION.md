# M00 evidence - 2026-10-23 (Asia/Singapore)

Scope: foundation only; route placeholders are not completed public features. No M01 entry sequence was implemented.

## Provenance and integrity

- Initial local HEAD absent; origin https://github.com/jonvincentdin/minecraft-portfolio.git had no heads after successful fetch/ls-remote.
- Created feat/m00-baseline-scaffold without moving or discarding supplied files.
- Initial local checkpoint: 6a4d5ea. Documented upstream reference source revision: 47d8b1ca11b05db6791adaf9bf33a5cf9bd946ca (a separate history).
- Original verifier passes all 100 manifest entries. 48 GLBs, 48 scene records, 39 thumbnails.
- Runtime copy comparison checks every canonical file, including registry and licenses.
- renderer.js is copied byte-for-byte; reference.css differs only in root-relative asset URLs.
- .gitattributes disables text normalization for canonical assets and reference to preserve hashes across checkouts.

## Implementation choices

- React 19.3.1, TypeScript 7.0.2 and Vite 8.3.5, checked against npm metadata; Node 24.19.0 used. Vite's built-in JSX transform is sufficient for M00; no second renderer, motion library or React compiler plugin.
- Typed version-5 seed and repository contract; demo reads clone the seed. All mutations reject. Supabase SDK/network operations are deferred to M06, with an explicit unavailable repository boundary.
- Default mode is demo. Invalid mode or incomplete Supabase configuration reports an error, never silently loads demo content in backend mode.
- Wrapper uses a fresh canvas per effect because the unchanged renderer loses its GL context on destroy. AbortController cancels scene requests; effect cleanup destroys the view. Latest pause state is read through a ref.
- Shared shell uses baseline classes and stylesheet. Foundation-only layout and copy are explicitly marked. Actual public layouts and visual parity remain later milestones.
- Supplied personal .codex/ and .gemini/ configuration remains on disk and is excluded from commits.

## Verification

- npm run assets:verify: passed 100 original hashes.
- npm run typecheck and npm run build: passed.
- npm test: passed five tests covering content isolation, unavailable mutations, backend mode, routes and exact runtime copies.
- npm run test:browser: passed in headless Microsoft Edge, with actual NVIDIA GeForce RTX 4060 / ANGLE Direct3D11 WebGL.
- Mouse drag, keyboard-accessible rotation/reset controls, responsive resize, all public placeholder routes and editor placeholder checked.
- Three route unmount/remount cycles: zero tracked RAF callbacks, buffers, programs and resize/intersection observers after unmount; one canvas after remount. React StrictMode enabled.
- Forced no-WebGL mode renders the supplied React thumbnail. No application or reference page exceptions recorded.
- Font, license, GLB, thumbnail, scene JSON and demo image HTTP paths return 200. Vite refuses direct context/content-seed.json access.
- Mobile document has no horizontal overflow. Reference home and intro captured independently; no screenshot-diff parity claim.
- Matched screenshots use reduced motion, 1440x900 desktop and 390x844 mobile. See evidence/m00/ and its report.json.
- Production preview on port 4173 rendered WebGL. A separate backend-mode dev server on port 5175 showed the missing-configuration alert and no demo-mode notice.
- Raw SHA-256 comparison confirmed all 232 files under assets/ and reference/ were unchanged.
- git diff --check passed. Reference/canonical files unchanged from the checkpoint and raw hash snapshot.

## Limits

No physical touch-device check, full route parity, crafting/tree migration tests, authorization/RLS tests, remote publication or deployment. Those are outside M00. Backend credentials and real owner content remain unsupplied. Browser automation uses installed Edge; install Edge or adjust the channel explicitly on other machines.
