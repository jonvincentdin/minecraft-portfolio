# V01 — Intro cinematic 2.0

The owner liked v1's intro but found it simple. Keep its contract and make it deeper. Full beat sheet: STORYBOARD.md §0.

## Contract kept from v1

States: loading → ready → exiting → entered. Real asset readiness. Ready waits indefinitely for **Enter world**. Repeat clicks while exiting are ignored. Replay works repeatedly, with no ghost layers or duplicate callbacks. Focus moves to `main` after entry, and inert is released. Pause and reduced motion settle cleanly.

## New beats

1. Chunk-loading landscape whose progress follows real loading.
2. The brand shot is recreated live (BRAND.md → Motion tie-in): the letter blocks fall into place from the grid in `brand/source/scene.html`, the grass caps land, the gold ore starts to glow, and the full-stop block drops and hovers.
3. The name types on in pixel type, with parallax clouds and rising particles.
4. Enter → depth dive through the layers and clouds, the letterbox opens, and the sky strips wipe as the last beat. About 2.2s.
5. Hand-off into Spawn at sunrise with a scroll cue.

## Acceptance

- No auto-entry after 10s at ready.
- Entry finishes in 2.0–2.5s at full motion. Nothing from the intro remains visible or blinks after the overlay is removed (v1 regression #18).
- Replay twice: identical sequence, no leftover nodes.
- Reduced motion: fades only, Enter still required, and entry is under 600ms.
- The page underneath does not scroll until entry. Scroll position is restored to the top of Spawn on entry and on replay.
