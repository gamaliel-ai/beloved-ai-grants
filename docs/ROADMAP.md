# Roadmap

## Phase 0 — Docs & API proof (current)

- [x] Repository + product docs (tracks, onboarding, privacy, data model, decisions)
- [ ] Manual Admin API smoke test (create project → key → limit → usage → delete)
- [ ] Lock default limit **numbers** and confirm per-grant project isolation
- [ ] Decide Track A vendors + budget for first conference ([GRANT-TRACKS.md](./GRANT-TRACKS.md))

## Phase 1 — API vertical slice (conference-shaped)

- Admin auth (single-operator is fine)
- Import allowlist (name + email)
- Program invite + QR redeem
- Auto-provision if email allowlisted (one active key per email)
- OpenAI hard spend limit applied at provision
- One-time key display; list grants + revoke
- Persist OpenAI ids and basic status  
  Detail: [ONBOARDING-AND-ABUSE.md](./ONBOARDING-AND-ABUSE.md)

## Phase 1b — Agent track (program ops)

- May ship as runbooks + spreadsheet/admin notes before deep product UI
- Record who received which agent stipend
- Conference messaging: agent as easy start when funded; API as product path
- Not blocked on ChatGPT “Codex credits” Admin API parity

## Phase 2 — API monitoring

- Sync usage/costs into local DB
- Admin usage view (spend vs limit); optional grantee “my usage”
- Email/webhook alerts when near limit
- Org-level spend ceiling as backstop

## Phase 3 — Request intake

- Public request form
- Approve / deny queue (API and/or agent)
- Email delivery of redeem/reveal links

## Phase 4 — Polish

- QR generation for invites in admin UI
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
