# Backlog

**Next id:** `B-0010`

## Active

#### [B-0001](backlog/B-0001-usage-ingestion.md): Ingest OpenAI usage activity

**Status:** Open — establish the trustworthy project-level data source needed
by reporting, alerts, and intervention. Unblocks dashboard metrics and MCP
`get_usage_summary`.

#### [B-0002](backlog/B-0002-admin-usage-dashboard.md): Admin usage operations dashboard

**Status:** Open — usage metrics on the thin `/admin` dashboard
([B-0007](backlog/B-0007-admin-console-rewrite.md)); depends on B-0001.
Management mutations are MCP-primary ([B-0008](backlog/B-0008-mcp-admin-control-plane.md)).

#### [B-0008](backlog/B-0008-mcp-admin-control-plane.md): MCP admin control plane (agent-first ops)

**Status:** Partial — authenticated MCP steel-thread tools + PAT auth + thin
web dashboard shipped ([MCP-ADMIN.md](./MCP-ADMIN.md)). Intake/usage tools
reserved until B-0006 / B-0001.

#### [B-0007](backlog/B-0007-admin-console-rewrite.md): Admin console rewrite (IA + layout)

**Status:** Partial — thin `(admin)` shell + dashboard + emergency revoke
shipped; full CRUD management pages dropped in favor of MCP.

#### [B-0003](backlog/B-0003-email-delivery-and-notifications.md): Email delivery and lifecycle notifications

**Status:** Partial — claim-link issue + fake/live mailer + `/join` /
`/claim` provision path landed; domain/live Resend, delivery admin UI, and
lifecycle notices (threshold/revoke) still open.

#### [B-0006](backlog/B-0006-campaign-intake-and-approval.md): Program intake, approval, and key claim

**Status:** Open — pre-registered emails receive claim links; unmatched
attendees can submit a light application for admin approval. Approval queue
is MCP-primary per [B-0008](backlog/B-0008-mcp-admin-control-plane.md).

## Deferred

#### [B-0004](backlog/B-0004-grantee-usage-access.md): Low-friction grantee usage access

**Status:** Deferred — provide a thin usage view through signed email links;
do not use pasted API keys as authentication.

#### [B-0005](backlog/B-0005-usage-threshold-intervention.md): Usage thresholds and automated intervention

**Status:** Deferred — flag, notify, and optionally revoke at policy thresholds
after usage data and email delivery are reliable.

#### [B-0009](backlog/B-0009-temporary-limit-bump.md): Temporary spend-limit bump / reactivation

**Status:** Deferred — propose/approve time-boxed OpenAI project limit raises
(MCP-primary, optional AI triage) when thresholds or hard limits are hit;
constructive twin of B-0005. Depends on usage sync + threshold signals.

## Recently closed

None yet.

## Will not do

- Authenticate grantees by asking them to paste a live OpenAI API key into the
  control plane. The key is a spendable secret, not an identity credential.
