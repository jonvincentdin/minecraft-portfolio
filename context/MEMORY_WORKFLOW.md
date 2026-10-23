# Project memory and focused skills

Updated: 2026-10-22 (UTC).

The seven project skills in `.agents/skills/` are actual instruction files, with Claude Code pointers in `.claude/skills/`, not marketplace suggestions. Open this extracted project root in Codex/VS Code. If the client does not discover them, start a fresh session and inspect its skill list; you can always ask Codex to read the relevant SKILL.md directly. These files do not install an MCP, change personal ChatGPT memory, or schedule a background job.

| Skill | Use | Invocation |
| --- | --- | --- |
| `jvd-memory-audit` | Find stale/conflicting/duplicate claims with evidence before cleanup | `Use $jvd-memory-audit to audit this project's context. Propose changes first.` |
| `jvd-project-facts` | Record verified state at a milestone/handoff | `Use $jvd-project-facts to update the current snapshot from the repository and checks.` |
| `jvd-agents-retrospective` | Turn evidenced recurring mistakes into a reviewed rule | `Use $jvd-agents-retrospective to analyze these two incidents and propose an AGENTS.md diff.` |
| `jvd-3d-integration` | Preserve current models, troubleshoot rendering, or create a specifically requested new model | `Use $jvd-3d-integration for the crafting-table React wrapper; preserve canonical assets.` |
| `jvd-advancement-graphs` | Port or change the two advancement trees, route glow, pan/zoom/list and inspector | `Use $jvd-advancement-graphs to implement the M04 trees with reference parity.` |
| `jvd-motion-choreography` | Port or change shared motion with real timing, cancellation and reduced-motion settling | `Use $jvd-motion-choreography to complete M04 motion parity.` |
| `jvd-parity-qa` | Run milestone acceptance: reference screenshots, comparisons, evidence and draft PR | `Use $jvd-parity-qa to verify the current milestone and record evidence.` |

## What goes where

- `AGENTS.md`: durable project instructions and existing GitHub/permission rules.
- `context/PROJECT_FACTS.md`: concise current facts with dates and evidence.
- `context/PROGRESS.md`: actual milestone history and checks.
- `.local/memory-audits/`: ignored reports containing memory excerpts, only if requested.
- Personal memory directories: only inspect when explicitly included in the task. Their existence and format depend on the client; this package does not assume `~/.codex/memories/` is active.
- `work/model-drafts/`: ignored staging for future models before review and integration.

## Routine

At a milestone, inspect actual changes, audit relevant context if it has drifted, then update project facts and progress. Preserve historical decisions but identify superseded claims. Age is a review signal, not grounds for deletion. Missing evidence remains an unknown.

A cleanup request should name its scope. An audit proposes changes; deletion or consolidation follows authorization for the concrete changes. Never commit personal-memory excerpts or secrets. The retrospective skill never grants new permissions.

## Future generation prompt

> Use $jvd-3d-integration to create a new Minecraft-style [subject] for [tab/use]. Match the existing palette, proportions and camera. Keep all current assets, especially the React model, unchanged. Start with editable procedural voxel geometry. Stage a versioned source, GLB, previews and renderer-compatible scene data; validate them in the actual renderer. If an external generation service would materially improve the result, explain the provider, uploads and cost before using it. Report which tools you actually used.

The current package has no new third-party MCP configuration or paid-generation dependency. See THREE_D_TOOL_VERIFICATION.md for reviewed options and the conditions under which they become useful.
