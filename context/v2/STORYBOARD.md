# Storyboard — one Minecraft day, one scroll

The page is a single journey through Jon's world, told as **one in-game day**. Scroll position is time: dawn at the intro, noon over the projects, golden hour over the advancements, night at the contact campfire. A global sky layer behind every chapter scrubs its colour, sun/moon arc and stars from overall scroll progress. This one device makes the whole page feel continuous instead of a stack of sections.

Notation:
- **Pin**: the chapter sticks while the scroll distance drives a timeline.
- **Scrub**: the property is tied to scroll progress and reverses when scrolling back.
- **Trigger**: a one-shot animation that plays when a threshold is crossed.
- Lengths are in viewport heights (vh) of scroll distance and are starting values to tune.

| # | Chapter | Anchor | Axis | Pin length | Time of day |
| --- | --- | --- | --- | --- | --- |
| 0 | Intro cinematic | n/a (overlay) | none | none (time-based) | Pre-dawn → dawn |
| 1 | Spawn | `#spawn` | vertical | 150vh | Sunrise |
| 2 | About: the journal | `#about` | vertical, page turns | 200vh | Morning |
| 3 | Projects: the hotbar | `#projects` | **horizontal** | one viewport width per project + 50vh | Noon |
| 4 | Skills: the crafting table | `#skills` | vertical, step per skill | 60vh per skill | Afternoon |
| 5 | Experience: the minecart line | `#experience` | **horizontal** (diagonal rail) | 120vh per character | Late afternoon |
| 6 | Advancements: the descent | `#advancements` | vertical through the tree | tree depth × 50vh | Golden hour → dusk |
| 7 | Contact: the campfire | `#contact` | vertical | 100vh | Night |
| 8 | Credits / footer | n/a | vertical | none | Night → next dawn (sky loops) |

## 0. Intro cinematic (time-based, not scroll)

Keeps the v1 contract: real asset readiness, an explicit **Enter world**, replay, and pause/reduced motion. It is longer and deeper.

1. **Black → world loads.** Letterbox bars. A chunk-loading grid fades in: blocks pop into a low-poly landscape tile by tile, from the centre outward, with progress tied to real asset loading. The pixel progress bar fills like a Minecraft XP bar.
2. **The logo builds.** Cubes stream in from the upper right, snap into a grid forming D, I and N, then fuse into solid cream-and-gold letters as a gold edge-light sweeps across. A few cubes stay drifting off the N, as in the brand key art.
3. **Ready.** The name types on in pixel type, letter by letter, each letter blinking once like a cursor. Clouds drift in parallax and particles rise. **Enter world** pulses gently. Ready never auto-enters.
4. **Enter.** The camera dives forward: the logo flies at the viewer and passes overhead, the landscape layers separate in depth (far mountains slowly, near blocks fast), and the cloud layer is punched through. The letterbox bars open vertically, and the sky strips from v1 survive as the final wipe. Spawn's sunrise is waiting underneath. About 2.2s in total.
5. **Hand-off.** The dive ends with Spawn's hero in place and a "scroll" cue (a pixel mouse whose wheel ticks). Focus moves to `main`.

Reduced motion: chunk loading, the logo build and the dive are replaced by short fades; Enter world is still required.

## 1. Spawn (pinned 150vh)

- At rest: the hero name, eyebrow, tagline, CTAs and social slots on the left; the home world scene on the right, rendered by VoxelView.
- Scrub 0→1: the world scene orbits about 40° and dollies out to show more terrain. The name splits into its letters, which drift apart in depth with parallax. Highlights slide in from the right edge as two floating blocks. The sun rises from behind the terrain.
- Exit transition: **block dissolve**. The hero breaks into a grid of square tiles that fall away with gravity and a slight rotation, revealing About underneath.

## 2. About: the journal (pinned 200vh)

- The oak-framed portrait builds in plank by plank, a scrub along the frame's perimeter.
- A book opens in the centre. Each scroll segment turns one page with a 3D page-curl (CSS 3D transform, scrubbed). Journal chapters sit on the pages. The biography is written on the first spread, revealing line by line like ink.
- Interaction (kept): click a chapter tab on the book's edge to jump to that page. This scrolls to the matching position; it does not toggle state outside the scroll.
- Exit transition: the book closes and slides down out of frame. The camera tilts up to the noon sky.

## 3. Projects: the hotbar (horizontal track)

- Vertical scroll drives a horizontal track of large project cards, one per project. Pinned.
- A Minecraft **hotbar** at the bottom of the screen shows the projects as slots: nine at a time, like the game, paging to the next row after slot 9 (the seed has 14 projects). The selected slot highlights as each card reaches the centre, so the hotbar works like the scroll wheel in-game. Clicking a slot scrolls to that card. While this chapter is pinned, the project hotbar temporarily replaces the chapter hotbar in the HUD.
- Each card's 3D item model rotates with horizontal progress, and its screenshots parallax at a different speed from the text. The project title "picks up" with a small bounce when the card centres, like an item pick-up.
- Interaction (kept, reduced): open a case study as an overlay with the gallery. Inventory drag-and-drop, search and filter are dropped.
- Exit transition: the last card is "dropped". It spins and falls as an item entity, and the camera follows it down into the crafting room.

## 4. Skills: the crafting table (pinned, one step per skill)

- The crafting table sits centre stage. The owner's **actual skills** loadout is always readable on one side and fills in as the chapter progresses.
- For each actual skill, a scroll step drives one crafting: book, dye and special item fly from the edges into the 3×3 grid (scrubbed along curved paths), the grid glows, the result pops out with a burst of six-pixel particles, and the result flies into the loadout slot.
- Interaction (kept, reduced): after the scripted sequence, a "Try a recipe" row lets visitors click a recipe to watch it craft once. This is visitor play state only and never changes the owner's skills. The full v1 workshop (manual 3×3 placement, stack splitting, starting inventory) is dropped from the public page.
- Exit transition: the crafted items scatter. The crafting table splits into planks that slide sideways and open onto the rail line.

## 5. Experience: the minecart line (horizontal track)

- A rail runs across the screen. A minecart rides it with scroll progress and passes five stations: professional, school, casual, builder and explorer.
- At each station the character model steps forward (scale and turn toward the viewer), and its chapter text slides up from the track bed. Background parallax uses three depth layers: distant hills, mid trees, near fence posts.
- The rail dips and rises between stations, so the horizontal track has vertical motion too. Wheel sparks trigger on the downhill.
- Interaction (kept): click a station marker to scroll to it. Rotate the 3D character by dragging (renderer inertia). The multi-chapter comparison is dropped.
- Exit transition: the minecart rides off the end of the rail into a mine shaft, and the screen falls with it into the advancements chapter.

## 6. Advancements: the descent (pinned, vertical through the tree)

- The Achievements tree fills the viewport. As the visitor scrolls, the glowing path extends from the root along the edges in depth order, using v1's stroke-dashoffset animation, now scrubbed.
- When the glow reaches a node, an **"Advancement Made!" toast** slides in at the top right with the node's title and symbol, as in the game. The toasts stack and auto-dismiss.
- A toggle switches the scene to the Certifications tree. The trees cross-fade with a page-flip of the map.
- Interaction (kept): click a node to open the inspector (title, issuer, date, evidence link). The v1 retract-to-common-ancestor path animation runs for clicks. Pan/zoom is dropped, so the tree has to fit; deep trees scroll within the pinned section.
- The sky turns golden, then dusk. Torches light along the tree edges as dusk arrives.

## 7. Contact: the campfire (pinned 100vh)

- Night. Stars fade in, the moon rises, and fireflies (pixel particles) drift. A campfire flickers (sprite loop) beside a lectern holding a book and quill.
- The contact book opens as the visitor arrives. The fields are written into its pages. The message review keeps v1 behaviour: it never claims to send without a real service.
- Email, GitHub and LinkedIn appear as signposts hammered in one by one.

## 8. Credits

- Rolling end credits, Minecraft end-poem style, slow and short: name, role line, links and a **Replay intro** button. The sky loops back to dawn at the very bottom.

## Always-on HUD

- **XP bar** along the bottom edge fills with overall scroll progress, and a level number counts chapters passed.
- The **hotbar** (chapter navigator) has nine slots: chapters 1–7 plus Credits, and one spare slot showing the logo block. The active chapter is highlighted; clicking scrolls there. On wide screens it sits bottom-centre. On small screens it collapses into a single slot that opens the list.
- Top bar: the DIN logo (→ `/editor`), a pause-motion toggle, and the sound toggle if sound is ever added (not in scope).

## Mobile (below 760px)

Horizontal tracks stay horizontal but become shorter. Projects scroll one card per swipe of vertical scroll. Experience stations get more spacing. Pin lengths shrink by about 40%. Page-curl becomes a slide. All 3D views fall back to thumbnails when WebGL is unavailable or more than two views are active.
