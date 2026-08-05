# Focus

## Current focus

- [B-0001](docs/backlog/B-0001-usage-ingestion.md) — ingest trustworthy
  project-level usage and cost activity.
- [B-0002](docs/backlog/B-0002-admin-usage-dashboard.md) — usage metrics on
  the thin `/admin` dashboard; depends on B-0001.
- [B-0006](docs/backlog/B-0006-campaign-intake-and-approval.md) — program
  intake / applications (MCP tools reserved; domain still to build).

## WIP / stuck

- Reporting implementation has not started. B-0001 is the prerequisite.
- Conference program intake remainder is in B-0006 (applications,
  intake open/close). Claim-link foundation from
  [B-0003](docs/backlog/B-0003-email-delivery-and-notifications.md) is partial.
- Verified Resend sending domain (needed for live claim email).
- Default spend limits and production threshold policy remain undecided.

## Recently shipped

- [B-0008](docs/backlog/B-0008-mcp-admin-control-plane.md) — authenticated MCP
  admin control plane (`/api/mcp`) + thin `/admin` dashboard / emergency
  revoke; connect docs in [MCP-ADMIN.md](docs/MCP-ADMIN.md).
- [B-0007](docs/backlog/B-0007-admin-console-rewrite.md) — re-scoped to thin
  shell (no CRUD management pages); agent-first ops via MCP.
- Claim tokens + fake/live Resend mailer: `/join`, `/claim/[token]`
  provision (B-0003 partial); invite redeem remains as fallback.
- Initial allowlist → OpenAI project/key → one-time reveal → revoke steel
  thread (`2c936b2`).
