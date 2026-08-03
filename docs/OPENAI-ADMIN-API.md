# OpenAI Admin API — feasibility

**Verdict: yes — the Administration API can power this product.**  
We provision keys under our organization, set spend controls, monitor usage, and revoke on demand. Grantees never need org membership.

Official overview: [Admin APIs](https://developers.openai.com/api/docs/guides/admin-apis) · [Administration reference](https://developers.openai.com/api/reference/administration/overview/)

## Mental model

| Our concept | OpenAI primitive |
| --- | --- |
| Beloved org (billed account) | Organization |
| Operator credentials for this app | **Admin API key** (`sk-admin-…`) — management only, not for chat/completions |
| Isolation unit for a grantee | **Project** (recommended) and/or **service account** |
| Key given to the entrepreneur | Project **service account API key** (`sk-…`) |
| Budget | Project / org **spend limits** and **spend alerts** |
| Monitoring | Organization **usage** and **costs** APIs; project-scoped reporting |

Admin keys cannot call model endpoints. Model traffic uses the grantee’s project API key.

## What we can automate

### Provision

- Create a **project** per grant (or per cohort) for isolation, model allowlists, and spend caps.
- Create a **service account** on that project; by default OpenAI returns an unredacted API key once.
- Optionally create additional keys with **scopes** (least privilege), e.g. responses/completions only.

Relevant endpoints (conceptual):

- `POST /v1/organization/projects`
- `POST /v1/organization/projects/{project_id}/service_accounts`
- `POST /v1/organization/projects/{project_id}/service_accounts/{id}/api_keys`

### Limit

- Organization hard spend limit: `POST /v1/organization/spend_limit` (amount in cents, monthly).
- Project-level hard limits and **spend alerts** (email when thresholds hit).
- Project **model permissions** (allowlist / denylist) so grants can be restricted to cheaper models.

When a hard limit is reached, API calls fail with `429` (`project_spend_limit_exceeded` / `organization_spend_limit_exceeded`). Enforcement is not perfectly instantaneous — spend can slightly overshoot.

### Monitor

- Usage and costs endpoints for org/project breakdowns (dashboard + polling/sync into our DB).
- Audit logs for admin actions (key create/delete, limit changes).

### Revoke

- Delete service account API keys and/or archive projects / remove service accounts.
- Immediate effect for new traffic once deletion propagates.

## Recommended grant shape

For v1, prefer **one OpenAI project per active grant** (or per grantee):

1. Create project `grant-<slug-or-id>`
2. Set default monthly hard spend + alert(s)
3. Optionally restrict models
4. Create service account + API key
5. Store OpenAI IDs + metadata in our DB; show `value` to the user once
6. Never store the full key long-term if we can avoid it (store key id + redacted value; optional encrypted vault if re-display is required — prefer one-time display)

Tradeoff: many projects vs one shared project. Shared projects simplify quotas but weaken isolation and per-grantee hard limits. **Per-grant projects match the product story.**

## Gaps / caveats

1. **Billing is ours** — OpenAI invoices the org; we are the financial sponsor.
2. **Key shown once** — design UX around one-time reveal + rotate/reissue.
3. **Usage attribution** — project-level is solid; per-key cost attribution may be coarser than project-level. Isolation via project avoids ambiguity.
4. **Rate limits** — org/project rate limits still apply; heavy grantees can affect shared org capacity unless isolated carefully.
5. **Compliance** — grantees’ prompts/data go to OpenAI under our org’s data settings; set retention / policies intentionally.
6. **Admin key security** — the Admin API key is crown jewels; server-only, never in the browser.

## SDK notes

Admin API support requires recent OpenAI SDKs (e.g. Node ≥ 6.36, Python ≥ 2.34 per OpenAI docs). Initialize with `adminAPIKey` / `admin_api_key`, not the standard project key.

## Proof-of-life checklist (before building UI)

- [ ] Create Admin API key in OpenAI dashboard
- [ ] Create a throwaway project via API
- [ ] Create service account + capture key once
- [ ] Set a low project spend alert / hard limit
- [ ] Call a cheap model with the provisioned key
- [ ] Confirm usage appears for that project
- [ ] Delete the key and confirm subsequent calls fail

## Codex, ChatGPT seats, and “credits”

**This Admin API surface is the API Platform**, not ChatGPT workspace billing.

| Want | Feasible via API Admin API? |
| --- | --- |
| Project API keys, spend limits, usage | **Yes** — this doc |
| Local Codex CLI/IDE via sponsored API key | **Yes, indirectly** — key works with API-key auth; billed as API usage |
| ChatGPT/Codex **seats** and workspace **credits** | **No** — different product; ChatGPT Business/Enterprise admin, invites, credits |
| Mint Codex access tokens for arbitrary grantees like `sk-…` | **No** — tokens are ChatGPT-user/workspace scoped; console/ops oriented |

Program implication: agent stipends and true Codex seats belong in [GRANT-TRACKS.md](./GRANT-TRACKS.md) Track A (ops), not as a second resource type next to `ApiKey` with the same automation.
