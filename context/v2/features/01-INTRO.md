# V01 — Intro cinematic 2.0

The owner liked v1's intro but found it simple. Keep its contract and make it deeper. Full beat sheet: STORYBOARD.md §0.

## Contract kept from v1

States: loading → ready → exiting → entered. Real asset readiness. Ready waits indefinitely for **Enter world**. Repeat clicks while exiting are ignored. Replay works repeatedly, with no ghost layers or duplicate callbacks. Focus moves to `main` after entry, and inert is released. Pause and reduced motion settle cleanly.

## New beats

1. Chunk-loading landscape whose progress follows real loading.
2. The brand assembles live (BRAND.md → Motion tie-in): cubes stream in and snap into a grid forming D, I and N, then fuse into the solid cream-and-gold letters as a gold edge-light sweeps across.
3. The name types on in pixel type, with parallax clouds and rising particles.
4. Enter → the letters break back into cubes (as in `brand/din-keyart.png`, but completely), and the cubes fly past the camera into the depth dive. The letterbox opens and the sky strips wipe as the last beat. About 2.2s.
5. Hand-off into Spawn at sunrise with a scroll cue.

## Acceptance

- No auto-entry after 10s at ready.
- Entry finishes in 2.0–2.5s at full motion. Nothing from the intro remains visible or blinks after the overlay is removed (v1 regression #18).
- Replay twice: identical sequence, no leftover nodes.
- Reduced motion: fades only, Enter still required, and entry is under 600ms.
- The page underneath does not scroll until entry. Scroll position is restored to the top of Spawn on entry and on replay.
