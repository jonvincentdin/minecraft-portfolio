# Motion specification

Authoritative code: `reference/site/app.js`, `motion.js`, `style.css`, `workshop.js`, `tree-paths.js`, `renderer.js`. Preserve the final cascade and easing; CSS and Web Animations API are sufficient. A new animation library is not required.

| Interaction | Baseline timing / behavior |
| --- | --- |
| Intro foreground exit | Shuffled pieces; upward 115vh preserving initial transform; 650/710/770ms; i×18ms delay; cubic-bezier(.64,0,.32,1) |
| Intro sky exit | Eight shuffled vertical strips; upward 102%; 680ms; 320+i×46ms delay; cubic-bezier(.76,0,.24,1) |
| Letterbox exit | Upward 110vh; .8s duration, .15s delay |
| Home beneath intro | Opacity 0→1; Y 28→0; 600ms after 560ms; cubic-bezier(.16,1,.3,1) |
| Route exit | Opacity 1→0, Y 0→−12px; 140ms ease-in |
| Section groups | Opacity 0→1, Y 20→0; 460ms; (index mod 5)×42ms; visibility threshold .08 |
| Nav underline | ScaleX 0→1; 280ms cubic-bezier(.2,.8,.3,1) |
| Hover | Buttons rise 3px; social/filter 2px; cards 5px; 220ms; shadows/glows match CSS |
| Button press | TranslateY 1px and scale .98 |
| Pixel feedback | Six 5px squares; radial reach 24/36/48px; 440ms; fade and shrink |
| Detail/crafting modal | Opacity, Y 18→0, scale .97→1; 320ms cubic-bezier(.16,1,.3,1) |
| Detail text | 340ms; 12px rise; later children delayed 45/85ms |
| Recipe autofill | Each reserved unit flies inventory→grid for 420ms; i×90ms stagger |
| Craft success | Existing success class for up to 800ms |
| Advancement edge | 280ms per edge, sequential; ease-in-out |
| Advancement node | Brightness 1→1.8→1 over 400ms |
| Model interaction | Inertia/friction and idle bob from renderer; frame-time based |

Use requestAnimationFrame, transforms and opacity; avoid layout reads on every pointer frame. Capture geometry before moving ghost elements. Clean up animations, observers, listeners and canvas resources on unmount, especially under React Strict Mode's development lifecycle.

Loading overlay must not flash back after exit. Route cancellation must prevent stale navigation from rendering. End states must be fully opaque. Motion pauses must settle the UI into a usable state; no permanently invisible element.

Default motion preference follows prefers-reduced-motion and remains controllable through the visible pause toggle. For the migration, also respond to preference changes while open. Reduced motion skips spatial transitions and flying particles, never skips explicit Enter world. Preserve focus and inert state independently from animation completion.

For deterministic screenshot tests, freeze idle motion and seed intro shuffle in test mode only. Test the real timing separately; do not remove production randomness to pass snapshots.
