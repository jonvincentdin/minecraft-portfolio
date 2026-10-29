# Editor — familiar v1 workflow

Updated 2026-10-27. The public redesign does not require a new content editor or schema. A separate /editor entry remains planned. The local previs only explains that entry; it does not connect to an account.

## Preserve coverage

Keep Landing settings/highlights, About biography/portrait/crop/journal, Projects with all case-study fields and photo ordering, Skills with actual skills/recipes/starting inventory, Experience with fixed character associations, both advancement trees, and Contact. Fields unused by the new public presentation remain editable or safely retained; never silently delete them on save.

Use existing media uploads and media: references. Public cover images derive from the first project photo; reorder through the current gallery controls. New decorative voxel scenes are application assets, not a new media-upload type.

## Workflow

Authorized session → private draft → edit → Save draft with expected revision → Preview through the same public React components → Publish the saved revision atomically. Import creates a recovery copy and does not publish. Preserve edits on network, authorization, validation, upload and revision-conflict failures.

The production logo leads to /editor. The editor has a visible Back to portfolio link. Auth follows AUTH.md; the visual redesign does not disable passwords or enroll users.

## Acceptance

All existing collections survive load/save/import/export. Sample flags, IDs and unused legacy fields persist. Draft preview is labelled and never leaks private media. Editor remains keyboard-accessible and usable without cinematic motion.
