# V09 — Navigation and native scroll

Updated 2026-10-27 (Asia/Singapore). See STORYBOARD.md, MOTION.md and DATA_MODEL.md.

Replace the icon-only hotbar/XP HUD with visible Work, About, Skills and Contact links, a motion control and a quiet reading-progress line. The production DIN logo links to /editor; Back to top is separate. Experience and credentials retain stable anchors even when absent from the compact header.

Use native document scrolling and CSS sticky for the short desktop project passage. Scroll progress drives transforms through a lifecycle-owned rAF. No fixed translated document, global skew, browser-find breakage or mandatory scroll smoothing. The previs uses no GSAP or Lenis.

Deep links land on readable content; legacy aliases are a production task. At narrow widths the work track becomes a vertical list. Pause and reduced motion do the same at every width. Track active state with aria-current; avoid viewport jumps when changing motion mode.

Acceptance: keyboard, wheel, touch emulation, resize, find-in-page and anchors; focus remains visible; no page overflow; progress works both ways; context cap and teardown; existing logo assets preserved.
