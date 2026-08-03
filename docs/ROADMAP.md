# Roadmap

## Phase 0 — Docs & API proof (current)

- [x] Repository + product docs
- [ ] Manual Admin API smoke test (create project → key → limit → usage → delete)
- [ ] Lock default limit numbers and isolation model (per-grant project)

## Phase 1 — Vertical slice

- Admin auth (single-operator is fine)
- Create invite code
- Redeem → provision → one-time key display
- List grants + revoke
- Persist OpenAI ids and basic status

## Phase 2 — Monitoring

- Sync usage/costs into local DB
- Admin usage view (spend vs limit)
- Email/webhook alerts when near limit (beyond OpenAI’s own alerts)

## Phase 3 — Request intake

- Public request form
- Approve / deny queue
- Email delivery of redeem/reveal links

## Phase 4 — Polish

- QR generation for invites
- Limit templates & model allowlists in UI
- Rotate key, extend grant, archive project
- Hardening, audit log UI, backups

## Out of scope until needed

- Multi-tenant “many sponsoring orgs”
- Non-OpenAI providers
- Automated fraud scoring
- Full grantee self-serve portal
