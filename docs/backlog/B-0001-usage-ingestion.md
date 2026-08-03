# B-0001 — Ingest OpenAI usage activity

**Kind:** improvement  
**Status:** open

## Problem / goal

The app can provision and revoke grants but has no local view of subsequent
OpenAI activity. Administrators cannot tell which grants are active, costly, or
possibly abused without leaving the control plane.

Build a trustworthy, idempotent sync from OpenAI organization usage/cost APIs
into local project-level snapshots. One OpenAI project per grant gives the
attribution boundary; do not claim per-key precision that the source API does
not provide.

## Direction

- Pull usage and cost buckets grouped by OpenAI project.
- Map `openai_project_id` to the local grant and grantee.
- Persist idempotent time buckets plus sync status/watermark; overlapping sync
  windows must not double count.
- Derive current-period spend, request/token activity, and last activity for
  fast reads without inventing a second billing ledger.
- Run manually first, then on Vercel Cron once behavior is proven.
- Surface stale/failed sync state explicitly so downstream dashboards never
  present old data as current.

## Acceptance

- Re-running the same interval does not duplicate usage or cost.
- Unknown OpenAI project ids are recorded for operator reconciliation.
- A grant can be queried for current-month cost, recent usage buckets, and last
  activity time.
- Pagination, rate limits, and partial API failures resume safely.
- Tests cover overlapping windows, duplicate buckets, unknown projects, and
  failed/retried syncs using a fake Admin API.
- A gated live test confirms one known project appears after model usage.

## Out of scope

- Reporting UI (B-0002)
- Email notifications (B-0003)
- Automated threshold actions (B-0005)
- Prompt or response content
