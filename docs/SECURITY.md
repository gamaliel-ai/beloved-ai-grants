# Security

## Assets

1. **OpenAI Admin API key** — can create/delete keys, change limits, invite users
2. **Grantee API keys** — spend our money; if leaked, burn budget
3. **Invite codes / redeem tokens** — gate free compute
4. **PII** — names, emails, application text
5. **Usage data** — who is building what (sensitive for founders)

## Principles

- Least privilege: Admin key only on the server; grantee keys scoped when possible
- One-time key reveal; prefer rotate over re-display
- High-entropy invites; rate-limit redeem and request endpoints
- Audit admin actions in our DB (and rely on OpenAI audit logs as backup)
- Default deny on admin routes

## Operational guardrails

- Production requirement: hard spend limits on every new project (deferred from
  the steel thread; do not treat the current app as budget-safe yet)
- Org-level ceiling as a backstop above sum of grants
- Fast revoke in admin UI
- Alerts to operator email before soft catastrophe
- Separate OpenAI projects so one runaway key doesn’t require guessing which sk- was at fault

## Explicit non-goals (v1)

- Storing grantee conversation content
- Acting as an LLM proxy/gateway
- Giving grantees access to the OpenAI org dashboard

## Privacy posture

Ordinary operation: usage/spend only, not prompt content. Revoke anytime if needed. Full stance and site-copy checklist: [PRIVACY-AND-DATA.md](./PRIVACY-AND-DATA.md).
