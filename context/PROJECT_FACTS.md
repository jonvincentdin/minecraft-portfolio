# Project fact snapshot

Snapshot: 2026-10-23 (Asia/Singapore). Scope: verified M00 foundation.

## Verified current state

- Owner: Jon Vincent Din. React + TypeScript + Vite scaffold now exists; this supersedes the handoff's no-React statement. Sources: package.json, src/app/App.tsx.
- Branch: feat/m00-baseline-scaffold. Scaffold commit 49f5ed3; initial checkpoint 6a4d5ea preserved the supplied handoff from an unborn main. Configured origin: https://github.com/jonvincentdin/minecraft-portfolio.git; remote had no heads at inspection.
- Reference source revision 47d8b1ca11b05db6791adaf9bf33a5cf9bd946ca is provenance, not this repository's initial HEAD.
- The immutable vanilla reference and copied React renderer read scene-data.json, not GLBs. 48 GLBs and 39 thumbnails remain preserved.
- DemoContentRepository returns independent typed seed copies. All draft/media/publication operations reject. Supabase integration is a declared M06 boundary, not working persistence.

## Accepted decisions and sources

- Preserve original reference, typography, palette, assets and custom renderer: AGENTS.md and current M00 request.
- Fresh canvas per effect prevents lost-context reuse under StrictMode; cleanup owns fetch, RAF, observers and GL resources: VoxelCanvas.tsx and browser smoke evidence.
- Supplied .codex/.gemini settings remain local. No new MCP or generation service used during M00.
- Foundation placeholders are not completed feature pages. Existing visitor-domain specs remain under reference/.

## Completed work with evidence

- M00 scaffold, typed adapter boundary, runtime sync, separate reference server, shared shell, seven public placeholders and editor placeholder, React model smoke view.
- Asset verification (100 hashes), typecheck, build, five unit tests and browser smoke pass. Details and screenshots: M00_VERIFICATION.md and evidence/m00/.
- Actual GPU rendering verified with Edge / NVIDIA RTX 4060; forced thumbnail fallback also verified. Three unmount cycles leave no tracked renderer resources.

## Planned work

M01 visual shell and entry; M02 public routes; M03 crafting/skills; M04 advancements/motion; M05 editor; M06 Supabase auth/persistence/RLS; M07 full verification.

## Blockers and unknowns

Real owner portrait, social URLs and verified career/project content are not supplied. Physical touch and full visual parity remain untested. Backend integration, authorization and publication are not implemented. No merge or deployment occurred.

## Next concrete steps

Review M00 locally using README commands. Begin M01 only on the owner's next instruction. Preserve all M00 evidence and baseline assets.
