# Beloved AI Grants

Sponsor AI building tools for entrepreneurs — coding agents for getting started, and OpenAI API keys (with limits, monitoring, and revoke) when they’re ready to put AI in a product.

## What this is

Beloved AI Grants is a foundation-operated program with **two tracks**:

| Track | For | How it works |
| --- | --- | --- |
| **Agent / tools** | Earliest builders | Cursor, Claude Code, ChatGPT/Codex-style access — easier on-ramp; often manual ops (seats, coupons, reimbursement) |
| **API keys** | Product-ready AI usage | Sponsored OpenAI `sk-…` under our org — provision, cap, monitor, revoke via a web control plane |

Many founders we serve have limited infrastructure and are early in their journey. **API keys alone would miss people** who need a coding agent first. Details: [docs/GRANT-TRACKS.md](docs/GRANT-TRACKS.md).

This repository’s software focus is the **API key control plane** (automatable via OpenAI’s Admin API). Agent stipends are a first-class *program* track; ops may stay semi-manual at first.

### API key track (app)

1. Pre-approved people redeem via program QR / invite (email on allowlist).
2. Site provisions a key with **default hard spend limits**.
3. Grantee copies the key once; optional thin “spent vs limit” view in our app.
4. Admins monitor, adjust limits, rotate, or revoke.

Grantees are **not** added to our OpenAI org. No lock-in — they can buy their own key anytime.

## Why the API track works with OpenAI

| Capability | Admin API support |
| --- | --- |
| Create projects / isolate grantees | Yes — Projects |
| Provision API keys | Yes — project service accounts (+ optional key scopes) |
| Revoke / delete keys | Yes |
| Spend alerts & hard limits | Yes — org and project spend controls |
| Usage / cost visibility | Yes — organization usage & costs endpoints |
| Audit trail | Yes — audit logs |

**Codex note:** ChatGPT/Codex *seats and credits* are a different system (workspace admin). Local Codex via API key fits the API track. See [docs/GRANT-TRACKS.md](docs/GRANT-TRACKS.md).

## Repo status

**Docs-first.** Vision and decisions are captured; application code comes next.

## Docs

| Doc | Purpose |
| --- | --- |
| [docs/DECISIONS.md](docs/DECISIONS.md) | **Decision log** (start here for what’s locked) |
| [docs/VISION.md](docs/VISION.md) | Product concept, personas, journeys |
| [docs/GRANT-TRACKS.md](docs/GRANT-TRACKS.md) | Agent track vs API track; Codex vs API keys |
| [docs/ONBOARDING-AND-ABUSE.md](docs/ONBOARDING-AND-ABUSE.md) | Allowlist, QR, approval, spend caps |
| [docs/ACCESS-AND-PROVISIONING.md](docs/ACCESS-AND-PROVISIONING.md) | Redeem channels and key handoff |
| [docs/DATA-MODEL.md](docs/DATA-MODEL.md) | Grantees, keys, OpenAI as source of truth |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Control-plane system shape |
| [docs/OPENAI-ADMIN-API.md](docs/OPENAI-ADMIN-API.md) | Admin API feasibility |
| [docs/PRIVACY-AND-DATA.md](docs/PRIVACY-AND-DATA.md) | What we see, revoke rights, no lock-in |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model and guardrails |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phased build plan |

## Non-goals (for now)

- Proxying model traffic through our servers (API track: grantees call OpenAI directly)
- Fully self-serve public signup without qualification
- Automating every vendor’s coding-agent billing (Track A may stay ops-led)

## License

TBD.
