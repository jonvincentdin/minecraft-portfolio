# V07 — Advancements descent

Anchor `#advancements`. Pinned, about 50vh per tree depth level. Storyboard §6.

Content: the Achievements and Certifications trees (v1 rules: one parent per node, multiple roots allowed, no cycles, no cross-tree parents, positions 0–900).

Scroll: the glow extends from the roots along edges in breadth-first depth order (v1's normalized stroke-dashoffset, scrubbed). When a node is reached, show an "Advancement Made!" toast with its symbol and title; toasts stack (max 3) and dismiss after 3s. Disconnected roots glow in parallel; no fictitious edges. The sky moves from golden hour to dusk, and torches light along the edges.

Interaction: an Achievements/Certifications toggle (cross-fade with a map flip). Clicking a node opens the inspector and runs v1's click path animation (retract to the common ancestor, then extend), with rapid clicks cancelling cleanly. An accessible list view of the nodes is always available to screen readers and keyboard users.

Use `src/domain` tree-path functions unchanged.

Acceptance: scrubbing back retracts the glow and does not re-fire toasts in reverse; toasts are announced politely (`aria-live="polite"`) and never steal focus; reduced motion shows the full tree lit, with no toasts.
