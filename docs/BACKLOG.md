# Backlog

**Next id:** `B-0009`

## Active

#### [B-0001](backlog/B-0001-usage-ingestion.md): Ingest OpenAI usage activity

**Status:** Open — establish the trustworthy project-level data source needed
by reporting, alerts, and intervention.

#### [B-0002](backlog/B-0002-admin-usage-dashboard.md): Admin usage operations dashboard

**Status:** Open — dashboard metrics and activity views inside the admin console
([B-0007](backlog/B-0007-admin-console-rewrite.md)); depends on B-0001.
Revisit management vs visualization split with
[B-0008](backlog/B-0008-mcp-admin-control-plane.md).

#### [B-0008](backlog/B-0008-mcp-admin-control-plane.md): MCP admin control plane (agent-first ops)

**Status:** Open — authenticated MCP tools as the primary management surface
(allowlist, invites, claim links, approve/revoke); keep the web admin
read-mostly for usage visualization. May narrow B-0007’s CRUD page scope.
Discuss / spike before large console rewrite.

#### [B-0007](backlog/B-0007-admin-console-rewrite.md): Admin console rewrite (IA + layout)

**Status:** Open — metrics-first `/admin` shell, sub-nav, admin-only layout;
relocate steel-thread setup to Program; split ops pages. Design:
[ADMIN-CONSOLE.md](./ADMIN-CONSOLE.md). **Hold / re-scope against B-0008**
before investing in full management pages.

#### [B-0003](backlog/B-0003-email-delivery-and-notifications.md): Email delivery and lifecycle notifications

**Status:** Partial — claim-link issue + fake/live mailer + `/join` /
`/claim` provision path landed; domain/live Resend, delivery admin UI, and
lifecycle notices (threshold/revoke) still open.

#### [B-0006](backlog/B-0006-campaign-intake-and-approval.md): Program intake, approval, and key claim

**Status:** Open — pre-registered emails receive claim links; unmatched
attendees can submit a light application for admin approval. Approval queue
may be MCP-primary per [B-0008](backlog/B-0008-mcp-admin-control-plane.md).

## Deferred

#### [B-0004](backlog/B-0004-grantee-usage-access.md): Low-friction grantee usage access

**Status:** Deferred — provide a thin usage view through signed email links;
do not use pasted API keys as authentication.

#### [B-0005](backlog/B-0005-usage-threshold-intervention.md): Usage thresholds and automated intervention

**Status:** Deferred — flag, notify, and optionally revoke at policy thresholds
after usage data and email delivery are reliable.

## Recently closed

None yet.

## Will not do

- Authenticate grantees by asking them to paste a live OpenAI API key into the
  control plane. The key is a spendable secret, not an identity credential.
