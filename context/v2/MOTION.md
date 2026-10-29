# Motion specification — smooth, purposeful movement

Active direction 2026-10-27. Supersedes the earlier global skew, 30–80vw text slams, repeated overshoot, character railway and scene-swap catalogue.

## Principles

Native vertical scroll is authoritative. One main movement at a time. Substantial travel belongs to imagery, frames and camera composition; text settles early and remains level. No scroll velocity skew on the whole document. No state mutations, credential unlocks or message submission from scroll position.

## Choreography

| Element | Proposed behavior |
| --- | --- |
| Opening | Camera settles over about 1.4s; portfolio is visible and usable throughout |
| Hero model | Small continuous yaw change linked to viewport progress; no full spin through an unreadable screen |
| Project arrival | Artwork scales from .82 to 1 as it arrives; frame accents separate slightly |
| Desktop projects | One sticky region; native vertical distance maps reversibly to horizontal travel; 2–4 featured records, remainder in the full collection |
| About / skills | Controlled object turn while copy remains stationary within normal flow |
| Experience / credentials | Clear progression beside readable entries; no autoplaying achievement claims |
| Contact | Model settles beside an immediately usable contact action |
| Controls | 180–250ms hover/press feedback; no required animation delay before action |
| Detail dialog | Native focus handling and Escape; opening/closing must not depend on animation finishing |

Previs actual behavior lives in previs/app.mjs and style.css. It uses native scroll, CSS sticky and an owned rAF, with no new library. Future library choice is P1 in DECISIONS.md; do not treat an old GSAP/Lenis proposal as installed or approved.

## Lifecycle and resources

Use the existing VoxelView renderer. Dispose offscreen views before mounting nearby scenes; maximum three live contexts. Share scroll measurements per frame. Clean up observers, events, rAF, buffers and programs on unmount. Preserve canonical geometry and correct axes. Pause WebGL when hidden/offscreen.

## Pause / reduced motion

Both turn the project track into normal vertical content, remove spatial choreography and settle every model. Follow media-query changes at runtime. No text remains invisible; focused elements remain reachable. Native touch, wheel, keyboard, browser find and anchor navigation retain their meaning.

## Acceptance

Forward/reverse scrolling, fast anchor jumps, resize, pause mid-track, reduced-motion toggle, dialog focus and offscreen resource cleanup need browser checks. Target smooth 60fps on a representative laptop, but report measured hardware and traces; a video or software-rendered capture alone does not prove the performance target.
