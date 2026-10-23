# Skills, plugins and development tools

Skills are workflow instructions for an agent. Plugins/connectors give it access to services. npm packages run in your website. Installing a skill does not install React, connect Supabase, create a database or guarantee visual fidelity.

## Core workflow

Use **Codex in VS Code** for repository implementation, terminal work and review. Open the extracted project folder and provide the context prompts. The current OpenAI documentation describes local skills under `.agents/skills/<name>/SKILL.md`, explicit selection through `/skills` or `$name` in Codex, and `@` selection in ChatGPT where supported. Use the visible installed catalog; this chat's available skills are not automatically installed in VS Code. [Official guide](https://learn.chatgpt.com/docs/build-skills).

Use Skill Installer to discover/install reviewed existing skills, and Skill Creator for project-specific workflows. Confirm their availability in your chosen client. Keep AGENTS.md for always-on project rules; use context Markdown as the source of truth. Skill definitions should point to those files instead of duplicating all requirements.

## Relevant capabilities visible in this ChatGPT session

| Skill/capability | When it helps this project | Needed for the rebuild? |
| --- | --- | --- |
| `openai-docs` | Current Codex/skills/IDE setup instructions | Useful for setup |
| `work-skill-creator:skill-creator` | Turn a repeated project workflow into a real skill | Optional; not a frontend renderer |
| `personal-context:personal-context` | Recover decisions from earlier conversations | Optional; supplied context is sufficient |
| `openai-library:library` | Store and retrieve the handoff/assets | Useful for file handoff, not a runtime dependency |
| `sites:sites` | Edit/publish the existing hosted reference | Optional; VS Code implementation can use a separate host |
| `figma:figma-design-to-code` | Implement a specified Figma design | Only if a Figma source becomes authoritative |
| `figma:figma-implement-motion` | Translate motion from an actual Figma design | Optional; this site's motion is in source code |
| `figma:figma-code-connect` | Map an existing Figma component library to code | Optional, unnecessary for initial parity |
| `figma:figma-use` and `figma:figma-generate-design` | Create/modify editable Figma reference screens | Optional documentation work |
| `imagegen` | New raster artwork, when explicitly needed | No; retain existing assets for parity |
| Higgsfield command-routing skill | Produce requested concept/video media | No; videos do not implement web interactions |
| Higgsfield website-builder skill | Build/edit a Higgsfield-hosted product | Not needed for this local React/Supabase migration |

These are capabilities exposed in this session, not promises that every name appears in another client's catalog. No plugins were installed for this handoff. Browser automation, terminal execution and tests must be available separately from descriptive skills.

## Included project skills

Seven focused skills now exist under `.agents/skills/`: `jvd-memory-audit`, `jvd-project-facts`, `jvd-agents-retrospective`, `jvd-3d-integration`, and, added for M04 on 2026-10-23, `jvd-advancement-graphs`, `jvd-motion-choreography` and `jvd-parity-qa`. Each also has a pointer under `.claude/skills/<name>/SKILL.md` so Claude Code discovers it; the pointer defers to the `.agents` file, which remains the single source of truth. See [MEMORY_WORKFLOW.md](MEMORY_WORKFLOW.md) for invocation and scope. The 3D skill supports both the current asset integration and future explicitly requested model creation; it does not require an MCP.

See [THREE_D_TOOL_VERIFICATION.md](THREE_D_TOOL_VERIFICATION.md) for the checked third-party sources. None of those tools was installed by this update.

## Other potential custom skills

The following are **suggested custom skill names**, not claimed marketplace listings. The following additional ideas remain specifications, not installed SKILL.md folders. Ask Skill Creator to author only the workflows you need, then review and commit them in your project.

| Suggested name | Trigger and responsibility | Required context | Completion evidence |
| --- | --- | --- | --- |
| jvd-reference-parity | Port or compare any public screen; prevent redesign | DESIGN_SYSTEM, corresponding feature, reference source | Matched layout and documented visual diff |
| jvd-react-migration | Convert imperative source to React components/hooks | ARCHITECTURE, CURRENT_STATE | Typed components, cleanup, successful build |
| jvd-voxel-rendering | Canvas lifecycle, pointer rotation, wireframe or fallback work | MODELS, source renderer, asset hashes | GPU check, orientation and resource cleanup |
| jvd-crafting-engine | Recipe/grid/inventory logic or configuration changes | Skills feature, engine and recipe data | Quantity/prerequisite/refund invariants pass |
| jvd-content-editor | Owner CRUD, galleries, draft previews or import/export | EDITOR, DATA_MODEL | Field matrix covered; errors preserve input |
| jvd-supabase-content | Database/Auth/Storage integration | SUPABASE, DATA_MODEL | Migrations and positive/negative RLS tests |
| jvd-accessibility-responsive | Keyboard, focus, mobile, reduced-motion work | DESIGN_SYSTEM, TESTING | Manual keyboard/touch checks and overflow review |
| jvd-release | Final environment/build/deployment documentation | MILESTONES, PROGRESS | Reproducible build and honest release notes |

Use the seven included skills where relevant. Keep the remaining workflows as context instructions until a repeated task justifies another skill. Do not install this entire suggested list.

## Optional connected tools

- Supabase's official MCP integration can help inspect/apply backend work if available and authorized. It is not connected here. A Supabase CLI or Dashboard plus reviewed migration files can do the same necessary work.
- A browser automation/testing capability is useful for rendered parity. Playwright is a possible local test runner, not a ChatGPT skill by itself.
- Git/GitHub integration is useful for checkpoints and review; a local Git repository is enough to begin.
- React Three Fiber/Three.js, Motion and GSAP are libraries, not skills. None is required to reproduce this source: retain the current WebGL and WAAPI first. Avoid overlapping animation stacks.
- Tripo AI is unnecessary for this rebuild and was not used. Regenerating supplied models would work against the fidelity target.

Do not add an OpenAI API call to the portfolio merely because Codex is building it. Development assistance does not require an AI API dependency in the deployed website.
