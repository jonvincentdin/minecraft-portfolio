# F04 — Project inventory and case studies

Route `#projects`. Keep the opaque inventory panel, 27 initial slots for 14 demo builds, category tabs/search, model inspector, model controls and case-study image preview. Derive usable slot capacity as projects are added; never truncate owner records silently.

Fourteen symbols: diamond pickaxe, diamond sword, bow, compass, clock, potion, enchanted book, redstone, furnace, grass block, lantern, emerald, shield and ender pearl.

Dragging moves an item to an empty slot or swaps occupied slots. Users may rearrange without changing the published project order. Preserve rearrange mode, reset and select-then-place/keyboard alternatives. Filter/search results must not corrupt the full saved layout. Reconcile saved slot IDs when projects are added or removed.

Case study: title, category, status, summary, demo indicator, role, date, stack, overview, problem, solution, features, process, outcome/lessons, live URL, source URL and gallery photos with alt/caption/order. Modal must close by its control and Escape, restore focus and stay usable on mobile.

Owner can add a project, select any supplied symbol, upload multiple images, reorder/remove photos and edit every story field. Default demo illustrations are not proof of real work. Remote uploads require ownership checks and failure handling; orphaned uploads are not committed as published gallery entries.
