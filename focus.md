# Focus

## Current focus

- [B-0001](docs/backlog/B-0001-usage-ingestion.md) — ingest trustworthy
  project-level usage and cost activity.
- [B-0007](docs/backlog/B-0007-admin-console-rewrite.md) — admin console
  rewrite (metrics-first IA); design in
  [ADMIN-CONSOLE.md](docs/ADMIN-CONSOLE.md). Discuss before implementing.
- [B-0002](docs/backlog/B-0002-admin-usage-dashboard.md) — usage metrics on
  the dashboard; depends on B-0001 and B-0007 shell.

## WIP / stuck

- Reporting implementation has not started. B-0001 is the prerequisite.
- Conference program intake remainder is in
  [B-0006](docs/backlog/B-0006-campaign-intake-and-approval.md) (applications,
  intake open/close). Claim-link foundation from
  [B-0003](docs/backlog/B-0003-email-delivery-and-notifications.md) is partial.
- Verified Resend sending domain (needed for live claim email).
- Default spend limits and production threshold policy remain undecided.

## Recently shipped

- Claim tokens + fake/live Resend mailer: `/join`, admin send, `/claim/[token]`
  provision (B-0003 partial); invite redeem remains as fallback.
- Initial allowlist → OpenAI project/key → one-time reveal → revoke steel
  thread (`2c936b2`).
