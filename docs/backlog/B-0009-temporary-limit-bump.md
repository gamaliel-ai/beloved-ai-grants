# B-0009 — Temporary spend-limit bump / reactivation

**Kind:** improvement  
**Status:** deferred  
**Depends on:** [B-0001](B-0001-usage-ingestion.md),
[B-0005](B-0005-usage-threshold-intervention.md)  
**Related:** project hard spend limits at provision (steel-thread follow-on);
[B-0008](B-0008-mcp-admin-control-plane.md) for operator/MCP surface

## Problem / goal

When a grant hits a warning threshold or OpenAI project hard limit, operators
need a controlled way to **temporarily raise the cap** (reactivate traffic)
without permanently rewriting grant policy or relying on the OpenAI dashboard.

This is the constructive twin of B-0005: same spend signals, softer action than
revoke. OpenAI hard limits remain the live kill switch; synced usage remains
delayed and must not be sold as instant metering.

## Direction

- MCP-primary tools to **propose**, **approve/deny**, and **apply** a temporary
  project spend-limit bump (raise `threshold_amount` via Admin API).
- Optional AI-augmented triage: summarize recent spend, velocity, models used,
  prior bumps, and grant context → recommend approve/deny/amount. AI proposes
  only inside a hard policy envelope it cannot exceed.
- Guardrails before apply:
  - Org monthly hard ceiling headroom (proposed sum of project limits stays
    under org cap minus buffer).
  - Max bump amount, max bumps per grant per period, cohort/window rules.
  - Block or require extra review when anomaly / abuse signals are present.
- **Time-boxed bumps:** record prior limit, apply new limit, schedule revert to
  prior (or to remaining-lifetime policy) after a defined window.
- Distinguish paths: alert-threshold bump vs hard-limit reactivation vs
  lifetime-pause unpause (limit raised from `0` / soft pause).
- Full audit trail: actor, reason, old→new cents, expiry, approval chain.
- Start with human/MCP approval required; fully automatic apply only as an
  explicit opt-in policy with dry-run.

## Acceptance

- Operator can apply a temporary bump that updates the OpenAI project spend
  limit and mirrors intended limit metadata in our DB.
- Apply is refused when org headroom or bump policy would be violated.
- Scheduled revert restores the prior limit (or documented policy target) and
  is idempotent under retries.
- Proposal + decision + apply appear in audit history with freshness of the
  usage snapshot that justified the request.
- AI-assisted recommendations (if present) never bypass policy maxes or skip
  approval when auto-apply is off.
- Grantee traffic can resume after a hard-limit bump once OpenAI propagation
  completes; UX/docs acknowledge brief propagation lag.

## Out of scope

- Unbounded automatic top-ups without policy caps
- Proxying inference for real-time metering
- ChatGPT / workspace credit reactivation (Track A)
- Opaque fraud scoring as the sole gate
