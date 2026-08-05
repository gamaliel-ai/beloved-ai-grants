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

1. Attendee scans the program QR and submits an email.
2. Pre-registered email gets a claim link; unmatched attendees can submit a
   short application for admin approval.
3. Approval sends the same short-lived email claim link.
4. Claim click provisions a key with policy and reveals it once.
5. Grantee copies the key; a thin “spent vs limit” view can follow.
6. Admins monitor, adjust limits, rotate, or revoke.

The implemented steel thread also supports pre-approved allowlist redemption as
a fallback for named cohorts.

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

The API-grant steel thread is implemented: GitHub-protected admin, idempotent
allowlist import, **claim tokens** (`/join` → email → `/claim/[token]`),
program-invite fallback redeem, one-time key reveal, and revoke. Transactional
mail uses Resend when `RESEND_API_KEY` is set and `APP_URL` is non-local;
otherwise a fake outbox. See [docs/STEEL-THREAD.md](docs/STEEL-THREAD.md).

Still open for the conference path: unmatched-email applications (B-0006),
verified sending domain, usage sync, and lifecycle notices (B-0003 remainder).

## Local development

```sh
bun install
cp .env.example .env
mkdir -p data
bun run db:migrate
AUTH_TEST_BYPASS=1 AUTH_TEST_EMAIL=test-admin@example.com bun run dev
```

Local data uses PGlite by default (port **3002**). Configure GitHub OAuth
secrets for real admin sign-in, or use the auth bypass above in
non-production. Admin emails and the GitHub client ID are hardcoded in source;
env is for secrets and `APP_URL` only — see `.env.example`.

- `OPENAI_ADMIN_KEY` — live provisioning (else fake gateway; `OPENAI_MODE=fake`
  forces fake when a key is present).
- `RESEND_API_KEY` — live claim emails (else fake outbox when key missing or
  `APP_URL` is local).

## Docs

| Doc | Purpose |
| --- | --- |
| [docs/README.md](docs/README.md) | Documentation organization and backlog conventions |
| [docs/BACKLOG.md](docs/BACKLOG.md) | Active and deferred implementation tickets |
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
| [docs/STEEL-THREAD.md](docs/STEEL-THREAD.md) | Implemented v1 slice, setup, and known limitations |

## Non-goals (for now)

- Proxying model traffic through our servers (API track: grantees call OpenAI directly)
- Fully self-serve public signup without qualification
- Automating every vendor’s coding-agent billing (Track A may stay ops-led)

## License

TBD.
