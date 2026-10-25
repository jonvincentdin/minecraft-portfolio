# Brand — DIN, breaking into blocks

Revised 2026-10-26. History: a flat pixel "JVD" logo, then block-built "JVD" and "DIN" scenes at dusk. The owner rejected each one: not cinematic, letters built from cubes looked crude, textures looked cheap, and the landscape scene didn't fit. The owner chose this direction: **solid letters whose edges break into blocks**.

## Concept

- **Solid, premium letters.** "DIN" (Jon's surname) as a heavy sans-serif sculpted in 3D: warm cream stone faces with a soft clearcoat, and polished gold-metal sides and bevels.
- **Minecraft as a hint, not a costume.** The N's right stem breaks apart into cubes. Next to the break they are still aligned in a grid; further out they drift up and to the right, turning and thinning out. A few glow like embers, and a few of the far ones are tiny grass blocks: the world forming as the letter breaks apart.
- **A film title card.** Near-black void with an olive-teal haze, a glossy dark floor, a warm key spotlight, teal and amber rim lights, dust in the light, light bloom, film grain and letterbox. "JON VINCENT DIN" in light, widely tracked sans-serif, over "WORLD OF BUILDS" in small gold capitals between hairlines.
- **Emblem.** The same treatment on a single "D".

## Files (all PNG, in `brand/`)

| File | Size | Use |
| --- | --- | --- |
| `din-keyart.png` | 2560×1440 | Hero key art: intro poster frame, social/OG image, README banner |
| `din-logo.png` | 1600×1222, transparent | Primary logo with name and tagline, for dark backgrounds |
| `din-logo-mark-only.png` | 1330×875, transparent | Letters and cubes only. HUD/header logo (the link to `/editor`), 44–64px tall |
| `din-emblem.png` | 1024×1024 | Square "D" emblem: avatar, app icon, OG fallback |
| `din-icon-512.png`, `-180.png`, `-64.png`, `-32.png` | as named | PWA icon, Apple touch icon, favicons |

## Rules

- Dark backgrounds only (#050807–#1c2e22). The transparent logos are lit for dark surroundings.
- Don't recolor, stretch or crop into the cube trail; the trail is part of the mark. Scale down only.
- Below 44px tall, use the emblem icons.
- The header logo's accessible name is "Jon Vincent Din — editor sign-in"; its `alt` text is "DIN — Jon Vincent Din".
- The key art's text is part of the image. On the live page, set the name in real HTML and use a text-free render (`&title=0`) where the text must be selectable.

## Regenerating

`brand/source/scene.html` builds the scene with three.js 0.160.0, loaded from jsDelivr for design tooling only; the site keeps its own renderer. The letters use the MgOpen Moderna typeface that ships with three.js as `helvetiker_bold` (permissive MgOpen license).

```
node context/v2/brand/source/render.mjs <out.png> keyart 1920 1080 1.3333333
node context/v2/brand/source/render.mjs <out.png> logo   1200 600  2 1
node context/v2/brand/source/render.mjs <out.png> logo   1200 520  2 1 "&title=0"
node context/v2/brand/source/render.mjs <out.png> emblem 512  512  2
node context/v2/brand/source/post.mjs trim   <in.png> <out.png>
node context/v2/brand/source/post.mjs resize <in.png> <out.png> <size>
```

Rendering needs Microsoft Edge (Playwright's `msedge` channel) and network access. The `seed` query parameter changes the cube scatter.

## Motion tie-in

The brand is a frozen frame of the intro's main move, so the intro should play it in reverse and then forward:

1. Cubes stream in from the upper right and snap into grid position, assembling D, I and N. The grid cubes then fuse into the solid, smooth letters, with a gold edge-light sweeping across as each letter becomes solid.
2. On Enter world, the letters break apart into cubes again, as in the key art, but completely. The cubes fly past the camera and become the world the visitor scrolls into.

Use the break-line function from `scene.html` (the solid region is `x + 0.22·y < cut`) so the live animation and the PNGs match.
