# M04 — Advancements and motion parity

Status: implemented and verified 2026-10-23 (Asia/Singapore) on feat/m04-advancements-motion (84543ec). See ../M04_VERIFICATION.md and ../evidence/m04. Not deployed.

Dependency: M03.

## Scope

Implement both tree maps, inspector, pan/zoom, root/shortest-route glow and rapid-selection cancellation; complete shared reveal/hover/pixel/panel motion.

## Acceptance

Trees have valid independent roots; paths retract/extend correctly; animation cancellation and reduced motion settle; no stuck opacity.

## Evidence to record

Tree tests, path interaction checks and route/motion parity review.

Update context/PROGRESS.md with actual work, decisions and remaining defects. Preserve the immutable reference and owner data.
