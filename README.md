# Beloved AI Grants

Grant OpenAI API access to entrepreneurs — with provisioning, default spend limits, usage monitoring, and revocation — through a simple web UI.

## What this is

Beloved AI Grants is an admin-operated service that issues **scoped OpenAI API keys** to qualified founders. Recipients use the keys directly against OpenAI. Operators manage access, limits, and spend from this app.

Typical flow:

1. A qualified person arrives via invite link, access code, or QR code (or submits a request by email).
2. The site provisions a key with **default limits**.
3. The grantee copies the key once and uses it in their product.
4. Administrators monitor usage, adjust limits, and revoke keys when needed.

## Why this works with OpenAI

OpenAI’s **Administration API** supports the core lifecycle we need:

| Capability | Admin API support |
| --- | --- |
| Create projects / isolate grantees | Yes — Projects |
| Provision API keys | Yes — project service accounts (+ optional key scopes) |
| Revoke / delete keys | Yes |
| Spend alerts & hard limits | Yes — org and project spend controls |
| Usage / cost visibility | Yes — organization usage & costs endpoints |
| Audit trail | Yes — audit logs |

See [docs/OPENAI-ADMIN-API.md](docs/OPENAI-ADMIN-API.md) for details and caveats.

## Repo status

**Docs-first.** This repository currently holds product vision and technical notes. Application code comes next.

## Docs

| Doc | Purpose |
| --- | --- |
| [docs/VISION.md](docs/VISION.md) | Product concept, personas, journeys |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Proposed system shape |
| [docs/OPENAI-ADMIN-API.md](docs/OPENAI-ADMIN-API.md) | Feasibility notes on OpenAI Admin APIs |
| [docs/ACCESS-AND-PROVISIONING.md](docs/ACCESS-AND-PROVISIONING.md) | Invite codes, QR, email requests, key handoff |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model and operational guardrails |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phased build plan |

## Non-goals (for now)

- Proxying model traffic through our servers (grantees call OpenAI directly)
- Multi-provider grants (OpenAI first)
- Fully self-serve public signup without qualification

## License

TBD.
