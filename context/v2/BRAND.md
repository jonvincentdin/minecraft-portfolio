# Brand — JVD, the monument at dusk

Revised 2026-10-25 for v2. The owner rejected the first flat pixel logo as not cinematic and asked for **PNG**, not SVG. The brand is now a lit 3D render: the letters are built from real blocks, lit like a film title card.

## Concept

- **A title card, not an icon.** J, V and D are built from blocks standing in a voxel landscape at dusk, backlit by a low sun, with fog, god rays, drifting embers, bloom, film grain and letterbox bars. It reads like the opening shot of the intro and sets the tone for the whole scroll journey (STORYBOARD.md).
- **Built from Minecraft materials.** The letter blocks are cream "stone" (the site's cream #eee3be) with grass caps on top. About one block in eleven is gold ore, and its veins glow.
- **The full stop is a floating grass block.** v1's brand was "JVD." with a green dot. Here the dot is a grass block hovering like a dropped item, lit from below by a warm glow.
- **The emblem hides the name in the ore.** For square spaces, a single grass block carries "JVD" in glowing gold-ore pixels on its side.
- **Type.** "JON VINCENT DIN" in the JVDPixel font with wide cinematic tracking and a warm glow, above "WORLD OF BUILDS" in small gold monospace between hairlines.

## Files (all PNG)

| File | Size | Use |
| --- | --- | --- |
| `brand/jvd-keyart.png` | 2560×1440 | Hero key art: intro poster frame, social/OG image (crop as needed), README banner. Dark, cinematic, with letterbox |
| `brand/jvd-logo.png` | 1881×945, transparent | Primary logo with name and tagline, for dark backgrounds |
| `brand/jvd-logo-mark-only.png` | 1573×596, transparent | Letters and block only. HUD/header logo (the link to `/editor`), 40–56px tall |
| `brand/jvd-emblem.png` | 1024×1024 | Square emblem: avatar, app icon, OG fallback |
| `brand/jvd-icon-512.png`, `-180.png`, `-64.png`, `-32.png` | as named | PWA icon, Apple touch icon, favicons |

## Rules

- Use on dark backgrounds only (#0e1a17–#1c2e22, or the night/dusk sky). The transparent logos are lit for dark surroundings.
- Don't recolor, stretch or add outlines. Scale down only; the sources are already at 2×.
- Below 40px tall, use the emblem icons, not the wordmark.
- In the header the logo is the editor entry. Its accessible name is "Jon Vincent Din — editor sign-in"; the `alt` text describes the brand ("JVD — Jon Vincent Din").
- The keyart's text is part of the image. On the live page, set the name in real HTML text and use a text-free render (re-render with the title off) wherever the text must be selectable or translated.

## Regenerating

`brand/source/` holds the scene and scripts that produced every file:

```
node context/v2/brand/source/render.mjs <out.png> keyart 1920 1080 1.3333333
node context/v2/brand/source/render.mjs <out.png> logo   1200 600  2 1
node context/v2/brand/source/render.mjs <out.png> logo   1200 520  2 1 "&title=0"
node context/v2/brand/source/render.mjs <out.png> emblem 512  512  2
node context/v2/brand/source/post.mjs trim   <in.png> <out.png>
node context/v2/brand/source/post.mjs resize <in.png> <out.png> <size>
```

Rendering needs Microsoft Edge (Playwright's `msedge` channel) and network access, because the scene loads three.js 0.160.0 from jsDelivr. These scripts are design tooling only. three.js is not a site dependency, and the site keeps its own renderer.

## Motion tie-in

The intro (features/01-INTRO.md) should recreate this shot live with the site's own VoxelView renderer: the landscape chunk-loads, the letter blocks fall into place, the grass caps land, the ore starts to glow, the full-stop block drops and hovers, and the camera settles on this framing before Enter world. The letter pixel grid is `G` in `brand/source/scene.html`. Reuse it so the live intro and the PNGs match.
