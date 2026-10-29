# Owner brief — active revision 2026-10-27

The earlier brief below is preserved as history. Where it conflicts, this latest direction controls.

## Latest instructions

> I want it to still have the minecraft vibe but focuses more on the portfolio side

> I currently don't like the models provided right now ... I want it to fit what you're doing

> Alright I want you to work on it, but before that read the rules for starting the project, refer to the previous versions. Check the rules and how the guidelines is built. And I want you to update all the files inside v2 for whatever you are trying to do. And provide a video in previs for what you are trying to do. If you can't do it yet without those models, make the models first before the video. Also, use the same database structure as v1 so we don't have to change that much

## Active interpretation

- Builder's Exhibition: portfolio imagery, contribution and evidence lead; Minecraft supplies crafted voxel objects, materials and restrained motion.
- One continuous page, short horizontal project passage on desktop, readable mobile stack. Projects follow the hero.
- Keep the enchanted DIN logo. Build a small new original model set for important visuals and preserve canonical assets, especially React.
- Smooth camera/image motion with stable text replaces the old skew/slam/minecart presentation. Immediate portfolio access replaces the compulsory opening tour.
- Update all v2 specifications and relevant preview sources; review and retain unchanged approved brand assets. Create a truthful video after the models exist.
- Same v1 database structure, document format, adapter, validators, Storage and RLS. No migration, owner-data replacement or auth change in this task.
- This is a reviewable design/model/previs package. Production milestones remain separate, with verification and review stops as in v1.

## Historical request (superseded where noted above)

Received 2026-10-25 (Asia/Singapore) from the owner, Jon Vincent Din. This is the authority for v2; the rest of `context/v2` interprets it.

## The request (verbatim)

> Right now, its lacking certain things, specially user experience. I want the whole website to be scrollable. We need to rework the whole portfolio, add another folder inside context called "v1" and put inside all the current context there, and add another folder called "v2" where we will be working. Add context for v2 for what i prompt here now.
>
> Version 2 should be a rework for the website.
>
> I want the whole portfolio to be scroll-motion website, where everything is scrollable, Instead of clicking and clicking. I want you to be creative with it, still maintaining the minecraft theme, I want this to be a cinematic scrolling motion-type of website. There should be interactive elements same as before but less. I want everything to be in a single page. However, editor should still be a simple site, but change it so that when I click the logo, it directs you to another page where the editor exists. But before that, make sure to ask for the gmail, and if correct, send code to the gmail associated with the website.
>
> I want you to improve the landing cinematic animation as well, i like it but it seems simple. make sure to make everything cinematic with interactive elements so that the user don't get bored. Add that scroll-feature as well where when elements depends on the user's scroll. Don't just think vertically, make sure there are horizontal scrolling as well. Be creative with how you transition elements. Add beautiful animations not just to text but to all elements applicable as well.
>
> I want you to create a logo for me, something that relates to minecraft and my name.
>
> GMAIL: jonvincent.din@gmail.com
>
> Remember: only add the context files, because i'll build it slowly, build the context files the same way we've structured our files, but remove evidence. when you copy the context to v1 make sure to remove evidence.

## Requirements extracted

| ID | Requirement | Where it is specified |
| --- | --- | --- |
| R1 | One page. Every public section lives on it and is reached by scrolling, not by route clicks. | ARCHITECTURE.md, STORYBOARD.md |
| R2 | A cinematic scroll-motion site: elements respond to scroll position (scrubbed), not only to "came into view". | MOTION.md, STORYBOARD.md |
| R3 | Both vertical and horizontal scrolling sequences. | STORYBOARD.md, features/04, features/06 |
| R4 | Creative transitions between sections; animate every applicable element, not just text. | MOTION.md (transition catalogue) |
| R5 | Keep the Minecraft theme. | DESIGN_SYSTEM.md |
| R6 | Interactive elements remain, but fewer than v1. | FEATURES.md (kept / reduced / dropped table) |
| R7 | A richer landing cinematic than v1's. | features/01-INTRO.md |
| R8 | Clicking the logo opens a separate editor page. The editor stays a simple site. | features/10-EDITOR-AUTH.md, EDITOR.md |
| R9 | The editor asks for the owner's Gmail first. Only when it matches is a sign-in code sent to that inbox. | AUTH.md |
| R10 | A logo that ties Minecraft to Jon's name. | BRAND.md, `brand/` |
| R11 | Context only for now: no application code changes in this step. | PROGRESS.md |
| R12 | (2026-10-26, after seeing the first previs) Heavy motion, not light easing: big travel, inertia and momentum. | MOTION.md → Owner direction |
| R13 | (2026-10-26) Scrolling must read as one continuous vertical journey. Sections scroll into each other; no pinned scene swapped for the next "page". | STORYBOARD.md → Owner direction |

Owner Gmail for editor sign-in: **jonvincent.din@gmail.com** (see AUTH.md for how it is used and why the browser must never hard-code it).
