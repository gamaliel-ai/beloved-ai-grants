# B-0002 — Admin usage operations dashboard

**Kind:** improvement  
**Status:** in progress  
**Depends on:** [B-0001](B-0001-usage-ingestion.md)

## Problem / goal

Routine administration is primarily operational: see recent usage, notice
unexpected spend or inactivity, investigate a grant, and revoke quickly.
Program setup and allowlist management are less frequent and should not crowd
that view.

Create a dedicated usage-oriented admin surface that answers, at a glance:

- What has been used recently?
- Which grants are spending fastest or nearing an intended budget?
- How fresh is this data?
- Which key/project should be investigated or revoked?

## Direction

- Make usage the default **`/admin` dashboard** (see
  [ADMIN-CONSOLE.md](../ADMIN-CONSOLE.md)); program setup lives under
  `/admin/program`.
- Server-render summary metrics and a sortable recent-activity table.
- Show grantee, redacted key, project, status, current-period cost,
  request/token activity, last activity, and sync freshness.
- Offer useful views: recent activity, highest spend, near intended budget,
  inactive grants, revoked grants, and sync/reconciliation problems.
- Treat “possible abuse” as an operator signal based on explainable facts such
  as spend velocity—not an unsupported fraud verdict.
- Keep revoke available from the usage row/detail view with confirmation and
  audit logging.
- Provide a grant detail timeline for usage buckets and lifecycle events.
- Preserve the network-light architecture: Server Components first, small
  client islands only for filters or destructive confirmation.

## Acceptance

- An administrator can identify the most recently active and highest-spend
  grants without visiting OpenAI.
- Every metric displays its period and data-freshness timestamp.
- Sorting/filtering works without loading the entire history into the browser.
- A grant can be revoked from the reporting flow and disappears from active
  views while remaining in audit/history views.
- Empty, stale, syncing, partial-failure, and no-usage states are explicit.
- Responsive layout remains usable on a phone at an event.

## Out of scope

- Automated fraud scoring
- Prompt/response inspection
- Grantee-facing reporting (B-0004)
- Automated revocation policy (B-0005)
