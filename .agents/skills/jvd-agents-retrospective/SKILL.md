---
name: jvd-agents-retrospective
description: Analyze repeated agent mistakes and propose a narrow AGENTS.md improvement for the JVD portfolio. Use after two evidenced occurrences of the same mistake or an explicit retrospective request; do not automatically grant new permissions.
---

# Turn repeated mistakes into a focused rule

1. Read the applicable AGENTS.md files and the current user request. Collect dated evidence for two occurrences: task, observed result, expected result and corrective action. If only one is evidenced, say so; do not invent a second incident.
2. Determine whether the cause is a missing rule, an existing rule being ignored, a tooling limitation, an unclear requirement or a regression in code. Fix code through its normal workflow; do not encode every one-off bug as a permanent instruction.
3. Search existing rules before adding one. Propose the smallest rule that addresses the recurring cause, with a clear trigger, action and observable completion check. Prefer amending an existing relevant rule over duplication.
4. Prepare a concise retrospective and an exact proposed diff for the nearest appropriate AGENTS.md. Explain the evidence and scope. Do not add global instructions for a local issue or copy unrelated conversation into the repository.
5. Check for conflicts with parent instructions and the user's existing GitHub/permission policy. Never grant yourself access, waive approvals, weaken tests or rewrite immutable reference requirements through a retrospective.
6. Apply only when this exact rule change is authorized; an instruction to audit or propose is not authorization to apply. Reuse approval already given for the same concrete scope. Otherwise deliver the proposal for review.
7. When applied, record the change and evidence in context/PROGRESS.md and create a focused checkpoint under the repository policy. Do not claim the mistake is prevented until a subsequent relevant task is checked.
