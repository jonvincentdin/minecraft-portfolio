# V04 — Projects hotbar track (horizontal)

Anchor `#projects`. Pinned; vertical scroll drives a horizontal track. Storyboard §3.

Content: all projects in document order, with sample labels kept. Each card shows the symbol item (3D or thumbnail), title, category, summary, role/date/stack and a pixelated-in screenshot.

Scroll: the track translates horizontally; the card at the centre scales up slightly and its item spins with progress; screenshots parallax faster than text; a pick-up bounce when a card centres. The project hotbar (nine slots per page, paged after nine) highlights the centred project. The exit is the item drop into Skills.

Interaction: click a hotbar slot to scroll to that card. "Open" on a card opens the case-study overlay (v1 content: overview, problem, solution, features, process, outcome, links, gallery with captions and alt text). While the overlay is open, Lenis is stopped and focus is trapped; closing returns focus to the card.

Acceptance: the hotbar and track stay in sync while scrolling both directions; keyboard users can tab through cards and the page scrolls to keep the focused card visible; reduced motion shows a vertical list of cards; no horizontal page overflow at 390px.
