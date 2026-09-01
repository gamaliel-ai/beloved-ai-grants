# B-0005 — Usage thresholds and automated intervention

**Kind:** improvement  
**Status:** deferred  
**Depends on:** [B-0001](B-0001-usage-ingestion.md),
[B-0003](B-0003-email-delivery-and-notifications.md)

## Problem / goal

Reporting can reveal overspend or possible abuse, but operators should not need
to watch the dashboard continuously. Add explainable policy thresholds that
flag grants, notify people, and optionally revoke access.

OpenAI project hard limits remain the primary budget safety mechanism. Synced
usage is delayed and must not be represented as an instantaneous hard cap.

## Direction

- Define configurable warning/intervention thresholds per grant or template.
- Evaluate current-period spend and spend velocity after successful usage sync.
- Start in report-only mode, then add administrator and grantee notifications.
- Make automated revoke an explicit opt-in policy with a dry-run preview.
- Record every evaluation, notification, suppression, and action in audit
  history.
- Make actions idempotent and safe under repeated jobs or stale snapshots.
- Provide operator override, acknowledgement, and manual revoke/restore paths.

## Acceptance

- Operators can see why a grant was flagged, including metric, threshold,
  period, and source-data freshness.
- Re-running evaluation does not duplicate alerts or revoke twice.
- Stale or failed usage sync blocks automatic destructive action.
- Warning and revoke notices are sent once per policy transition.
- Automated revoke uses the same externally-first revocation service as manual
  revoke.
- Project hard-limit status is visible independently from app policy status.

## Out of scope

- Opaque fraud scoring
- Prompt/content inspection
- Treating periodic sync as hard real-time enforcement
- Temporary limit bumps / reactivation — see
  [B-0009](B-0009-temporary-limit-bump.md)
