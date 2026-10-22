# User flows

## Visitor

Open site → preload content, fonts and scene data → Ready state → wait indefinitely for Enter world → randomized upward exit → Spawn. Loading completion alone must never navigate. Replay restarts the intro, and entry returns to Spawn.

Spawn → route via navigation or project/experience CTA → current page exits briefly → next page mounts → visible groups reveal in sequence. Route focus moves to main; the selected navigation item updates.

Inventory → inspect symbol → search/filter or rearrange slots → open case study → switch gallery image → close → return to inventory. Reordering is local visitor preference, not an owner-content write.

Crafting → inspect actual skills without playing → interact with centered table → workshop opens → browse recipe → inspect shortages/prerequisites → manually place ingredients OR click recipe to reserve exact quantities and animate them into grid → collect output → discovered skill enters visitor inventory/history. Close workshop → actual portfolio skills remain unchanged.

Experience → select character → show that chapter's model and content → optionally select multiple comparison chapters → compare the selected experiences.

Advancements → choose Achievements or Certifications → pan/zoom map → select node → root path illuminates → select another → previous branch retracts to shared ancestor, then new branch illuminates → inspector shows evidence.

About → view actual photo when supplied, adjust journal selection → read owner story. Contact → enter message → review. Sending is not part of baseline parity.

## Owner (planned backend flow)

Edit world → sign in → server verifies owner role → editor loads private draft → select tab → create/edit/reorder/archive content or upload media → Save draft → preview the same public components using draft data → Publish validated snapshot → public visitors receive new published content. Sign out returns to public view.

Recipe and inventory editing live under Skills. Achievement and certification editors have separate trees and parent connection controls. Failed saves keep form data and show an actionable error. Stale revisions trigger conflict recovery rather than silently overwriting another session.
