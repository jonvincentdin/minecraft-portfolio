# V2-06 — Separate editor and optional auth work

Updated 2026-10-27 (Asia/Singapore). Dependency: V2-01 plus explicit scope.

Status: pending production implementation.

## Scope

Move the familiar editor to the planned separate entry while preserving every content field and v1 backend behavior. Treat email-code sign-in, enrollment and SMTP as separately approved work under AUTH.md; preserve working password access until any replacement passes hosted checks.

## Acceptance

Full editor save/import/export/preview/publish/media/conflict checks; unchanged schema and RLS; no secrets in bundles. Hosted delivery/recovery/owner-only send checks only if the auth proposal is authorized. No implicit account deletion.

## Delivery boundary

Use a focused feature branch. Record real verification, update PROGRESS/PROJECT_FACTS, commit, push and open a draft PR. Explicit merge authorization is required. Stop after this milestone; do not begin the next one unasked.
