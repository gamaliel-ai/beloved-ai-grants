# Roadmap

This is the phased product sequence, not the engineering queue. Concrete work
lives in [BACKLOG.md](./BACKLOG.md).

## Phase 0 — Docs & API proof

- [x] Repository + product docs (tracks, onboarding, privacy, data model, decisions)
- [x] Gated Admin API smoke test (create project → key → model call → revoke/archive)
- [ ] Lock default limit **numbers** and confirm per-grant project isolation
- [ ] Decide Track A vendors + budget for first conference ([GRANT-TRACKS.md](./GRANT-TRACKS.md))

## Phase 1 — API steel thread

- [x] GitHub admin auth with operator allowlist
- [x] Idempotent CSV allowlist import (name + email)
- [x] Expiring, capacity-limited program invite link
- [x] Auto-provision if email allowlisted (one active key per email)
- [x] One-time key display; list grants + revoke
- [x] Persist OpenAI ids and basic status
- [x] DB-backed redeem rate limits and transactional reservation
- [ ] OpenAI project hard spend limit applied and verified at provision
  Detail: [ONBOARDING-AND-ABUSE.md](./ONBOARDING-AND-ABUSE.md)

## Phase 1b — Agent track (program ops)

- May ship as runbooks + spreadsheet/admin notes before deep product UI
- Record who received which agent stipend
- Conference messaging: agent as easy start when funded; API as product path
- Not blocked on ChatGPT “Codex credits” Admin API parity

## Phase 1c — Conference program intake

- [x] Matching allowlisted email → claim link (admin send + `/join`)
- [x] Short-lived hashed claim token; provision and reveal on `/claim` click
- [x] Transactional mail scaffold (Resend + fake outbox; domain still needed)
  ([B-0003](backlog/B-0003-email-delivery-and-notifications.md) partial)
- [ ] Singleton program intake (open/close, request cap) and QR packaging
- [ ] Unmatched email → light application + admin approve/reject queue
- [ ] Program intake/approval implementation
  ([B-0006](backlog/B-0006-campaign-intake-and-approval.md))

## Phase 1d — Admin console rewrite

- Metrics-first dashboard as `/admin` home ([ADMIN-CONSOLE.md](./ADMIN-CONSOLE.md))
- Admin-only layout with sub-navigation; remove public Admin link
- Split: dashboard · grants · grantees · applications · program setup
- Implementation: [B-0007](backlog/B-0007-admin-console-rewrite.md)
- Usage metrics on dashboard when ingestion lands (B-0001 + B-0002)

## Phase 2 — API monitoring

- Sync usage/costs into local DB
  ([B-0001](backlog/B-0001-usage-ingestion.md))
- Admin usage operations view
  ([B-0002](backlog/B-0002-admin-usage-dashboard.md))
- Optional grantee usage access
  ([B-0004](backlog/B-0004-grantee-usage-access.md))
- Email/webhook alerts when near limit
- Org-level spend ceiling as backstop

## Phase 3 — Request intake

- General public request form outside an event
- Approve / deny queue (API and/or agent)
- Email delivery of redeem/reveal links

## Phase 4 — Polish

- Limit templates & model allowlists in UI
- Rotate key, extend grant, archive project
- Hardening, audit log UI, backups
- Optional: light Track A tracking UI

## Out of scope until needed

- Multi-tenant “many sponsoring orgs”
- Full automation of Cursor/Anthropic/etc. billing APIs
- Automated fraud scoring
- Proxying LLM traffic through Beloved
- Treating ChatGPT Codex seats as if they were API project keys
