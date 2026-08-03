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

Program context: this architecture covers the **API key track**. The **agent / tools track** (Cursor, Claude Code, ChatGPT seats, etc.) is first-class for impact but often ops-led — see [GRANT-TRACKS.md](./GRANT-TRACKS.md) and [DECISIONS.md](./DECISIONS.md).

## Suggested components

| Piece | Responsibility |
| --- | --- |
| Public site | Landing, request form, redeem invite/QR |
| Admin console | Grants, codes, limits, usage, revoke |
| Provisioning service | Talks to OpenAI Admin API; transactional with DB |
| Sync job | Pulls usage/costs periodically into local tables |
| Datastore | Grants, invites, admin users, OpenAI external IDs, audit of our actions |
| Auth | Admin auth required; grantee redeem may be code-only (no account) for v1 |

## Data model

Canonical detail: [DATA-MODEL.md](./DATA-MODEL.md).

Sketch:

- **AdminUser** — who can operate the console
- **Grantee** — person (name, email); one-to-many keys
- **InviteCode** — code/token, max redemptions, expiry, limit template
- **ApiKey** — OpenAI ids + redacted mirror + our status/provenance (not the full secret)
- **UsageSnapshot** — cached spend/tokens from OpenAI usage APIs
- **AppAuditEvent** — our actions (approve, provision, revoke, rotate)

OpenAI is source of truth for whether a key exists; our DB links people to OpenAI resource ids.

## Default limit template

Configurable defaults applied on provision, e.g.:

- Monthly hard spend: `$X`
- Alert at 50% / 80% / 100%
- Model allowlist: e.g. `gpt-4.1-mini`, `gpt-4.1` (TBD)
- Optional key scopes if we use scoped service-account keys

Admins override per grant.

## Stack (locked)

Boring full-stack TypeScript; prefer server rendering and small client JS (conference / constrained networks).

| Piece | Choice |
| --- | --- |
| Framework | **Next.js** (App Router) on **Vercel** |
| DB | **Postgres** (hosted); **PGlite** for local dev |
| Styling | **Tailwind CSS** |
| Components | **shadcn/ui** as a parts bin — only add what we use |
| Forms / selects | Prefer **native** `<select>` / inputs with Tailwind when styling is enough; use shadcn/Radix Select only when custom option UI is needed |
| Jobs | **Vercel Cron** for usage sync |

UI bias: Server Components + Server Actions by default; client components only for clipboard, one-time key reveal, and similar. No SPA state libraries unless forced.

## Trust boundaries

1. Browser never sees `OPENAI_ADMIN_KEY`.
2. Grantee key is returned once from our API after provision; prefer not to persist plaintext.
3. Invite codes are high-entropy; QR encodes HTTPS redeem URLs, not the Admin key.
4. Admin console behind real authentication (and eventually 2FA).
