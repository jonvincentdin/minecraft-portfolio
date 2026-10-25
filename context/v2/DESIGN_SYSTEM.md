# Design system (v2)

v2 keeps v1's palette, type and material language (`../v1/DESIGN_SYSTEM.md`) and drops the requirement to match the reference stylesheet pixel for pixel. Start new styles in a fresh v2 stylesheet. Do not keep piling onto the v1 reference cascade.

## Tokens (carried over)

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | #111e1a | Page base (under the sky layer) |
| `--bg-header` | #0e1a17 | HUD bars |
| `--text` | #eee9d5 | Body text |
| `--cream` | #eee3be | Display type, logo letters |
| `--gold` | #c7b778 | Eyebrows, labels |
| `--focus` | #f1cf7f | Focus ring, 3px with 5px offset |
| `--muted` | #8fa397 | Secondary text |
| `--grass` | #bbd48e | Accent, active states, logo grass |
| `--grass-dk` | #8fb15a | Accent shade |
| `--forest` | #2f4a34 / #1c2e22 | Extrusions, shadows |
| `--dirt` | #8a6a43 / #6e5434 | Block sides (logo, crafting) |

Add sky tokens for the day cycle: dawn #2b3a4f→#e8a86b, noon #6fa8d8→#bfe3f5, golden #d98a4a→#f2c27a, dusk #3a2f4f→#c06a5a, night #0b1020→#1b2440. The sky layer interpolates between these by scroll. Body text must keep 4.5:1 contrast against whatever sky sits behind it, so put text on panels or add a scrim, never directly on a bright sky.

## Type

- Display: JVDPixel (`assets/fonts/JVDPixel.woff`), weight 400. Large chapter titles go up to `clamp(48px, 9vw, 140px)`.
- Body: system UI sans, 16–18px, line-height 1.55.
- Labels/HUD: ui-monospace 11–12px, letter-spacing .08em.

## Materials

Sharp corners, block borders with inset highlights, opaque parchment panels for reading, pixel-art icons, `image-rendering: pixelated` for sprite art. No rounded cards, no glassmorphism, no generic gradients except the sky.

## Layout

- Each chapter is a full-viewport stage. Content sits on a 12-column grid, max-width 1440px, side gutters 5% (16px minimum on phones).
- No accidental horizontal page overflow: horizontal tracks live inside pinned containers with `overflow: clip`.
- Breakpoints: 760, 1100 and 1600px.

## Editor

The editor (`/editor`) uses this palette and font but plain layout: sidebar, forms, buttons. No scroll choreography.
