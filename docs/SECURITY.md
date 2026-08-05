# Security

## Assets

1. **OpenAI Admin API key** — can create/delete keys, change limits, invite users
2. **Grantee API keys** — spend our money; if leaked, burn budget
3. **Grantee eligibility / claim tokens / invite codes** — gate free compute
4. **PII** — names, emails, application text
5. **Usage data** — who is building what (sensitive for founders)

## Principles

- Least privilege: Admin key only on the server; grantee keys scoped when possible
- One-time key reveal; prefer rotate over re-display
- High-entropy hashed claim/invite tokens; rate-limit email checks,
  applications, claims, and redeem endpoints
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

## MCP admin control plane

Operators may mutate grants through authenticated MCP tools
([MCP-ADMIN.md](./MCP-ADMIN.md), [B-0008](./backlog/B-0008-mcp-admin-control-plane.md)).

| Threat | Mitigation |
| --- | --- |
| Stolen MCP operator token | Short TTL (30d), hashed at rest, revoke UI; HTTPS only; same allowlist as web admin |
| Token ≈ admin session for tools | Never embed `OPENAI_ADMIN_KEY` / DB secrets in the agent; token only authorizes Beloved domain tools |
| Prompt injection orders `revoke_grant` | Allowlisted operators only; explicit grant id + required reason; audit `actor` = operator email (+ tool name in metadata where applicable). The LLM is not a second auth factor |
| Non-allowlisted caller | Bearer validation + `assertAdminEmail`; HTTP 401 |

## Privacy posture

Ordinary operation: usage/spend only, not prompt content. Revoke anytime if needed. Full stance and site-copy checklist: [PRIVACY-AND-DATA.md](./PRIVACY-AND-DATA.md).
