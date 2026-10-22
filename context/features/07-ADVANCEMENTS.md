# F07 — Advancements

Route `#achievements`. Two separate trees: Achievements and Certifications. Preserve map/inspector composition, filters or selection controls from the source, pan/zoom/reset and keyboard-readable node controls.

Each node: id, title, description, date, issuer, evidence URL, symbol, parent ID, x/y position and sample flag. Each node has at most one parent in the same tree. Multiple roots are valid; cycles, missing parents and cross-tree parents are invalid. Source positions are bounded 0–900.

First selection: animate glow from root through every edge to the selected node. Next selection: find both root paths and their longest common prefix; retract the old non-shared path in reverse, then extend the new branch. This is the unique shortest route in a parent tree. When roots are disconnected, clear the old path and start the new root; do not draw a fictitious connecting edge. Rapid clicks cancel the old sequence and settle consistently.

Editor: select a parent then connect a child; show preview/selection state; detach to root; drag nodes and edit numeric positions; prevent cycles before save. Persist node positions and parent linkage atomically for publishing. Deleting a parent requires an explicit child-handling choice; default to blocking until children are detached/reassigned.

Use `tree-paths.js` as the topology/motion baseline and `tree-editor.js` for interactions. Source uses orthogonal SVG connectors. Preserve normalized stroke-dashoffset animations and selected-node glow.
