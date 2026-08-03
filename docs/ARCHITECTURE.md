# Architecture (proposed)

Docs-first; stack choices can change before implementation.

## High-level

```
┌─────────────┐     redeem / request      ┌──────────────────┐
│   Grantee   │ ─────────────────────────► │  Web app (UI)    │
└─────────────┘                            └────────┬─────────┘
                                                    │
┌─────────────┐     approve / monitor               │
│    Admin    │ ────────────────────────────────────┤
└─────────────┘                                     ▼
                                           ┌──────────────────┐
                                           │  App API + DB    │
                                           │  (grants, codes, │
                                           │   openai ids)    │
                                           └────────┬─────────┘
                                                    │ Admin API key
                                                    ▼
                                           ┌──────────────────┐
                                           │ OpenAI Org       │
                                           │ projects, keys,  │
                                           │ spend, usage     │
                                           └──────────────────┘
                                                    ▲
                         grantee uses sk-… directly │
                                           ┌────────┴─────────┐
                                           │ Grantee apps     │
                                           └──────────────────┘
```

We are a **control plane**, not a proxy. Model traffic does not flow through Beloved servers.

## Suggested components

| Piece | Responsibility |
| --- | --- |
| Public site | Landing, request form, redeem invite/QR |
| Admin console | Grants, codes, limits, usage, revoke |
| Provisioning service | Talks to OpenAI Admin API; transactional with DB |
| Sync job | Pulls usage/costs periodically into local tables |
| Datastore | Grants, invites, admin users, OpenAI external IDs, audit of our actions |
| Auth | Admin auth required; grantee redeem may be code-only (no account) for v1 |

## Data model (sketch)

- **AdminUser** — who can operate the console
- **Grant** — person/org, status (`pending` \| `active` \| `revoked` \| `expired`), limits, notes
- **InviteCode** — code/token, max redemptions, expiry, linked default limit template
- **ProvisionedCredential** — OpenAI `project_id`, `service_account_id`, `api_key_id`, redacted key, issued_at, revoked_at
- **UsageSnapshot** — periodic spend/tokens per grant/project
- **AppAuditEvent** — our actions (approve, provision, revoke, limit change)

## Default limit template

Configurable defaults applied on provision, e.g.:

- Monthly hard spend: `$X`
- Alert at 50% / 80% / 100%
- Model allowlist: e.g. `gpt-4.1-mini`, `gpt-4.1` (TBD)
- Optional key scopes if we use scoped service-account keys

Admins override per grant.

## Stack leanings (not locked)

Prefer a boring full-stack app that deploys easily:

- **TypeScript** end-to-end
- Web framework TBD (e.g. SvelteKit or Next.js)
- SQLite or Postgres
- Hosted where secrets and cron/sync are easy

Decide at implementation time; docs remain stack-agnostic.

## Trust boundaries

1. Browser never sees `OPENAI_ADMIN_KEY`.
2. Grantee key is returned once from our API after provision; prefer not to persist plaintext.
3. Invite codes are high-entropy; QR encodes HTTPS redeem URLs, not the Admin key.
4. Admin console behind real authentication (and eventually 2FA).
