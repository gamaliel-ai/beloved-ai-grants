# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Early-stage entrepreneurs (grantees) — often limited infrastructure, may be new to APIs — who need a clear path from program intake to a usable sponsored OpenAI API key (or steering toward an agent/tools stipend). First programs include Kenyan founders and other nationalities met through events and cohorts. Success for them is: join → claim → copy a working key in minutes, with plain language about privacy, limits, and no lock-in.

**Secondary:** Beloved operators (admins) who open intake, manage allowlists/invites via MCP, monitor spend, and revoke compromised or misused keys. Admin UX is important but secondary to grantee-facing design authority.

## Product Purpose

Beloved AI Grants sponsors AI building for qualified founders through two program tracks: (1) agent/tools access so people can start without mastering API keys first, and (2) budgeted OpenAI API keys under the foundation’s org when they are ready to put AI in a product. This repository’s software is the **API key control plane**: redeem/claim → provision → default limits → monitor → revoke. Success means earliest builders are not blocked on “figure out the API yourself,” every key has hard limits, and operators can govern spend and revoke without living in the OpenAI dashboard.

## Positioning

A foundation-operated grant program with a thin control plane on OpenAI’s Admin API — not a proxy, not a shared key pool, and not lock-in. Grantees are never added to the org as members; traffic goes grantee → OpenAI; Beloved monitors usage/spend and can revoke anytime. Neighboring “buy your own key” or “share our key” approaches cannot honestly claim controlled onboarding + per-grantee caps + transparent revoke/no-lock-in in one program.

## Operating Context

- Conference / cohort intake: QR → email → claim link (pre-registered or admin-approved).
- Claim handoff: one-time key reveal, policy copy, optional later spend-vs-limit view.
- Admin: thin `/admin` dashboard (metrics + emergency revoke); mutations primarily via authenticated MCP tools.
- Local/dev: PGlite by default; fake OpenAI and auth bypass for non-production testing.
- Production: Next.js on Vercel; Neon when `DATABASE_URL` is set; Resend for claim mail when configured.

## Capabilities and Constraints

**In scope (software focus):** allowlist/invite and claim flows, OpenAI project/key provisioning, limits, revoke, admin dashboard, MCP admin control plane.

**Program track (may stay semi-manual):** agent/tools stipends (Cursor, Claude Code, ChatGPT/Codex-style seats).

**Hard product constraints:** no shared API keys across grantees; default hard spend limits; revoke available from the app; grantees not OpenAI org members; transparent privacy/revoke/no-lock-in copy at handoff; control plane only (no proxying LLM traffic).

**Undecided / open:** exact default monthly $ caps; which agent tools to fund first and how; single redeem UX for both tracks vs sequenced; full i18n rollout scope and languages (see Accessibility).

**Terminology:** grantee, grant, claim link, allowlist / program invite, revoke, control plane, agent track vs API track.

## Brand Commitments

- **Name:** Beloved AI Grants; ministry of the **Beloved in Christ Foundation**.
- **Visual baseline:** Colors and fonts aligned to belovedinchristfoundation.org (warm gold, near-black, parchment surfaces; Raleway display + light body type already in app). Treat that palette/type as the starting system, not a mandate to copy foundation marketing layout.
- **UX direction:** Design interaction patterns and information architecture for a **tech community** (builders, founders, operators) — clear, task-focused, credible to engineers — while keeping the foundation color/type baseline.
- **Voice:** Transparent, light-handed ministry stance without locking anyone in; honest about what we monitor (usage/spend) and what we do not routinely access (prompt/response content).

## Evidence on Hand

- Product docs under `docs/` (VISION, GRANT-TRACKS, PRIVACY-AND-DATA, ADMIN-CONSOLE, STEEL-THREAD, DECISIONS).
- Live public surfaces: `/`, `/join`, `/claim/[token]`, `/redeem/[token]`, FAQ, resources.
- Live admin: `/admin`, `/admin/mcp`.
- Incumbent visual implementation in `src/app/globals.css` and public/admin layouts — no fabricated testimonials or metrics beyond what the app and docs already state.
- Do not invent case studies, press, or success numbers that are not in the repo.

## Product Principles

1. **Grantee path first** — Public, mobile-first claim and handoff clarity outranks admin chrome when trade-offs arise.
2. **Trust through transparency** — Privacy, limits, revoke, and no-lock-in must be understandable at the moment the key is revealed.
3. **Govern without surveilling** — Cap, monitor spend, and revoke; do not build a content proxy or content logs into the product story.
4. **Tech-community UX, foundation baseline** — Interaction design for builders; color and type rooted in Beloved identity.
5. **Global from Kenya outward** — Plan for multiple languages and nationalities; avoid English-only assumptions in copy structure and layout.

## Accessibility & Inclusion

Serving multiple nationalities, starting with programs in Kenya. **Multi-language / translation support is a product ideal** — structure UI and copy so localization is practical (not English-locked strings baked into layout). Specific WCAG target and first locale set are not locked yet; default to inclusive, readable public flows and avoid idioms that do not travel.
