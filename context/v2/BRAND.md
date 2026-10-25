# Brand — DIN, enchanted

Revised 2026-10-26. The owner asked for something **simple and iconic, not cinematic**, and chose the "Enchanted" concept from a round of options. Earlier directions (pixel JVD, block-built letters, letters breaking into cubes, cinematic dusk scenes) were rejected; see PROGRESS.md.

## Concept

- **One word, one effect.** "DIN" (Jon's surname) in a classical serif (Cinzel Black), carrying the shimmer of an enchanted item from the game: a lilac-white to violet-indigo fill, a crisp top light, two thin diagonal teal glints, and a soft violet glow.
- **Runes as the only decoration.** A few small, original pixel runes drift in loose clusters beside the word, rising toward it and fading as they get close, like the glyphs that float into an enchanting table. They never overlap the letters or the credit line. They are generated from simple rules (a stem, a tick or two, a detached dot on a 4×5 grid), so they are not letters and not a copied script.
- **Credit line.** "JON VINCENT DIN" in light, widely tracked Inter, over "WORLD OF BUILDS" in small lilac capitals between hairlines.
- **Emblem.** A single enchanted "D" with a few runes, for square spaces.

## Files (all PNG, in `brand/`)

| File | Size | Use |
| --- | --- | --- |
| `din-keyart.png` | 2560×1440 | Banner/OG image on the deep violet background |
| `din-logo.png` | 1933×994, transparent | Primary logo with the credit line |
| `din-logo-mark-only.png` | 2466×909, transparent | Word and runes only. Header/HUD logo (the link to `/editor`) |
| `din-emblem.png` | 1024×1024 | Square "D" emblem: avatar, app icon |
| `din-icon-512.png`, `-180.png`, `-64.png`, `-32.png` | as named | PWA icon, Apple touch icon, favicons |

## Colors

| Token | Value | Use |
| --- | --- | --- |
| `--enchant-white` | #f6f1ff | Top of the letter fill |
| `--enchant-lilac` | #cdb8ff | Fill, runes, tagline |
| `--enchant-violet` | #8f6be8 | Fill, glow |
| `--enchant-indigo` | #3a2a78 | Bottom of the fill |
| `--enchant-teal` | #7ff5e0 | Glints, some runes |
| `--enchant-bg` | #0a0812 → #140f24 | Key-art and emblem background |

This violet accent is new next to the site's olive/forest palette (DESIGN_SYSTEM.md). Decide in V2-01 whether violet becomes the site accent or stays reserved for the brand mark.

## Rules

- Use on dark backgrounds only. The transparent logos rely on their glow.
- Don't recolor, stretch or add effects. Scale down only.
- Below about 120px wide, use the emblem icons instead of the wordmark.
- The header logo's accessible name is "Jon Vincent Din — editor sign-in"; its `alt` text is "DIN — Jon Vincent Din".
- On the live site, set the name and tagline as real HTML text where they must be selectable; the PNGs have them baked in.

## Regenerating

`brand/source/scene.html` draws everything on a 2D canvas. It loads Cinzel and Inter from Google Fonts (both under the SIL Open Font License).

```
node context/v2/brand/source/render.mjs <out.png> keyart 1920 1080 1.3333333
node context/v2/brand/source/render.mjs <out.png> logo   1200 600  2 1
node context/v2/brand/source/render.mjs <out.png> logo   1200 520  2 1 "&title=0"
node context/v2/brand/source/render.mjs <out.png> emblem 512  512  2
node context/v2/brand/source/post.mjs trim   <in.png> <out.png>
node context/v2/brand/source/post.mjs resize <in.png> <out.png> <size>
```

Rendering needs Microsoft Edge (Playwright's `msedge` channel) and network access for the fonts. The `seed` query parameter changes the runes.

## Motion tie-in

The mark animates easily, with no 3D: the runes drift up and fade into the word, and the teal glints sweep across the letters every few seconds, like an enchanted item in the game's inventory. Use it in the intro (features/01-INTRO.md) and as a subtle hover on the header logo. Respect reduced motion: the glint stays still and the runes stay where they are.
