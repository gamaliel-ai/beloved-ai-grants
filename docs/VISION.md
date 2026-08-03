# Vision

## Problem

Early entrepreneurs often need help *starting* with AI (a coding agent on a laptop) and later need help *shipping* AI in a product (API usage with a budget). Shared keys, ad-hoc gift cards, and “figure out the API yourself” don’t serve people with limited resources and infrastructure.

Operators need:

- Controlled onboarding (not open signup)
- A low-friction path for the earliest builders
- An operable path for sponsored API usage (caps, visibility, revoke)
- Transparency about privacy and control without locking anyone in

## Product

**Beloved AI Grants** sponsors AI building for qualified founders through **two tracks** ([GRANT-TRACKS.md](./GRANT-TRACKS.md)):

1. **Agent / tools** — Cursor, Claude Code, ChatGPT/Codex-style access so someone can start building without mastering API keys first.  
2. **API keys** — a small web **control plane** on our OpenAI organization: redeem → provision key → default limits → monitor → revoke.

The software in this repo prioritizes track 2 (automatable). Track 1 is program-critical so we don’t miss founders early in their journey.

## Personas

### Grantee (entrepreneur)

- Often early-stage, limited infrastructure; may be non-expert with APIs
- Needs either a coding agent to start, or a budgeted API key to ship
- Does not need (and should not get) our OpenAI org admin access
- May arrive from an event, cohort, or personal intro

### Administrator (Beloved operator)

- Maintains allowlists / invites; may run agent stipends manually
- Sets default and per-grant API limits
- Watches usage and intervenes (warn, raise limit, revoke)
- Owns billing for sponsored API usage (and whatever agent vendors we fund)

## Core journeys

### A. Conference / cohort (primary v1 for API track)

1. Admin imports **pre-approved** name + email list; creates one program invite; prints **one QR**.
2. Grantee scans → enters email → must match allowlist → **auto-provision** API key with hard spend limit (or is steered to agent track if that’s the offer).
3. Key shown once; thin usage view later in our app.
4. OpenAI enforces spend; admin can revoke anytime.

Detail: [ONBOARDING-AND-ABUSE.md](./ONBOARDING-AND-ABUSE.md).

### B. Agent stipend (program track)

1. Foundation chooses vendor(s) and budget (seats, coupons, reimbursement).
2. Allowlisted founders receive access instructions.
3. Ops tracked lightly (who got what); not necessarily full Admin-API automation.

### C. Email request (later)

1. Grantee submits name, email, use case.
2. Admin approves → API provision and/or agent stipend.
3. Delivery via secure link / email.

### D. Monitor & govern (API track)

1. Admin dashboard: grants, spend vs limit, last used.
2. Raise limit, rotate, or revoke.
3. Alerts near threshold.

## Success criteria

- Earliest builders have a path that isn’t “learn API keys first”
- Allowlisted redeem → usable API key in minutes when that’s the track
- No shared API keys across grantees; default hard limits on every key
- Admin can answer spend questions without living in the OpenAI dashboard
- Compromised key revocable from our app
- Transparent privacy/revoke/no-lock-in copy at handoff

## Privacy and control (decided)

See [PRIVACY-AND-DATA.md](./PRIVACY-AND-DATA.md).

- We sponsor API keys; grantees are **not** added to our OpenAI API org.
- Policy: we do **not** routinely look at prompt/response content; we monitor usage/spend.
- We **may revoke at any time** if misuse or other concerns become apparent.
- **No lock-in:** own Cursor/OpenAI/etc. anytime.
- Be transparent on the site and at key handoff.

## Decided vs open

Locked choices: [DECISIONS.md](./DECISIONS.md).

Still open (do not block docs; decide before/during build):

1. Exact default monthly $ API cap and org ceiling  
2. Which agent tools we fund and how we procure them for the first event  
3. Single redeem UX for both tracks vs agent-first then API later  
4. Magic-link email verify before API mint vs booth speed  
