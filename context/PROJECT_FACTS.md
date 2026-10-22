# Project fact snapshot

Snapshot: 2026-10-22 (UTC). Scope: supplied minecraft-portfolio.zip and this documentation/skill update.

## Verified current state

- Owner: Jon Vincent Din. Target: faithful React + TypeScript + Vite migration with Supabase content persistence. Sources: AGENTS.md, context/CONTEXT.md, context/ARCHITECTURE.md.
- Reference implementation is buildless HTML/CSS/JavaScript with a custom WebGL renderer using scene-data.json. No root package.json or completed React app exists in this handoff. Sources: reference/site/renderer.js, context/CURRENT_STATE.md.
- Canonical assets contain 48 GLBs and 39 model thumbnails. The React asset must be preserved. Source: assets/models, assets/thumbs, context/MODELS.md.
- Editor persistence is local; production owner authentication, RLS and publication remain planned. Source: context/CURRENT_STATE.md.
- Four repository skills are included under .agents/skills. No third-party 3D MCP or generation service was installed/connected by this update.
- Uploaded Git metadata has no main HEAD commit. Its metadata is preserved; this update does not claim a remote branch, PR, merge or deployment.

## Accepted decisions

- Preserve source/model fidelity; do not redesign from a generic Minecraft prompt. Source: AGENTS.md.
- Add tools only when useful to the concrete task. Support explicit future model-generation requests using staged editable outputs and evidence. Source: user's 2026-10-22 instructions; context/MEMORY_WORKFLOW.md.
- Retain existing GitHub branch, protected-file and merge rules. Do not infer new permissions from a skill.

## Completed handoff work

- Added memory audit, fact snapshot, retrospective and existing/new-model workflow instructions.
- Reviewed original documentation for the suggested 3D tools; source-level findings and uncertainties are in THREE_D_TOOL_VERIFICATION.md. These are not runtime compatibility certifications.
- See SKILL_UPDATE_VALIDATION.md for final checks of this update.

## Planned work and unknowns

- React/Supabase milestones M00–M07 remain incomplete; see PROGRESS.md.
- Real owner portrait, social links, credentials and career/project evidence must come from the owner.
- GPU rendering and physical touch must be tested on a capable development device. MCP installation does not resolve that evidence gap.

## Next concrete steps

1. Open the project root in VS Code/Codex and read AGENTS.md, CONTEXT.md and CURRENT_STATE.md.
2. Inspect the actual local Git state before creating a feature branch; do not overwrite existing work or blindly restore this ZIP's Git metadata over an active checkout.
3. Execute M00 using SETUP_PROMPT.md. Reuse the existing renderer/assets; invoke jvd-3d-integration when needed.
4. Update this snapshot after verified milestones. Request a new model separately when one is actually needed.
