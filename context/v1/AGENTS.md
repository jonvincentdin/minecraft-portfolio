# Project instructions

Build Jon Vincent Din's World of Builds portfolio as specified in `context/MASTER_PROMPT.md`. Read `context/CONTEXT.md` and `context/CURRENT_STATE.md` before implementation.

- Preserve the supplied reference. Never redesign from a generic Minecraft prompt.
- Use React + TypeScript + Vite; plain CSS from the baseline; Supabase for the production content backend.
- Keep canonical `/assets` unchanged; copy it to `/public/assets` through the supplied script. Preserve `skill_react.glb`, its thumbnail, and the scene-data geometry.
- Start with the exact custom WebGL renderer in a React lifecycle wrapper. Do not introduce a second renderer or animation library unless there is a documented need and visual parity is checked.
- Build each page as React components. The old imperative application is a reference, not the finished implementation. Do not embed the old app in an iframe or retain a wholesale innerHTML bridge as completion.
- Keep visitor play state separate from the owner's actual skills and content.
- Published content is public; editor access and drafts require server-enforced authorization. Never ship secrets or service-role keys to the browser.
- Do not invent Jon's credentials, social URLs, face, work experience, or project claims.
- Record decisions, actual verification and incomplete work in `context/PROGRESS.md`. Never mark a milestone complete without its acceptance evidence.
- Preserve existing user edits. Use Git checkpoints. Ask only for missing credentials/content or an unresolved material requirement; otherwise execute the current milestone.
