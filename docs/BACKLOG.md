# Backlog

**Next id:** `B-0008`

## Active

#### [B-0001](backlog/B-0001-usage-ingestion.md): Ingest OpenAI usage activity

**Status:** Open — core sync + schema land with the admin console PR; cron and
gated live verification still outstanding.

#### [B-0002](backlog/B-0002-admin-usage-dashboard.md): Admin usage operations dashboard

**Status:** In progress — dashboard metrics and activity views inside the admin
console ([B-0007](backlog/B-0007-admin-console-rewrite.md)).

#### [B-0007](backlog/B-0007-admin-console-rewrite.md): Admin console rewrite (IA + layout)

**Status:** In progress — metrics-first `/admin` shell, sub-nav, admin-only
layout; relocate steel-thread setup to Program; split ops pages. Design:
[ADMIN-CONSOLE.md](./ADMIN-CONSOLE.md).

#### [B-0003](backlog/B-0003-email-delivery-and-notifications.md): Email delivery and lifecycle notifications

**Status:** Open — provide the claim-link foundation for approved conference
signups, then extend it to usage and revoke notifications.

#### [B-0006](backlog/B-0006-campaign-intake-and-approval.md): Program intake, approval, and key claim

**Status:** Open — pre-registered emails receive claim links; unmatched
attendees can submit a light application for admin approval.

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
