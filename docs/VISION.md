# Vision

## Problem

Founders often need OpenAI API access to prototype or ship, but shared org keys, prepaid gift cards, and ad-hoc key sharing don’t scale. Operators need:

- Controlled onboarding (not open signup)
- Default spend caps per grantee
- Visibility into who is using what
- Fast revoke when a grant ends or a key leaks

## Product

**Beloved AI Grants** is a small web app that sits on top of an OpenAI organization. It turns “we’ll sponsor your OpenAI usage” into an operable workflow:

- **Recipients** redeem access and receive an API key with limits.
- **Administrators** approve or issue grants, monitor spend, raise/lower limits, and revoke.

## Personas

### Grantee (entrepreneur)

- Needs a usable `sk-…` key quickly
- Understands a monthly budget / hard stop
- Does not need org admin access
- May arrive from an event, cohort, or personal intro

### Administrator (Beloved operator)

- Issues invite codes / QR links or reviews email requests
- Sets default and per-grant limits
- Watches usage and intervenes (warn, raise limit, revoke)
- Owns billing for the OpenAI organization

## Core journeys

### A. Invite / access code (preferred for events)

1. Admin creates a grant or invite (one-time or limited-use code).
2. Grantee opens the site (link or QR), enters the code (or lands via tokenized URL).
3. App provisions an OpenAI project service account + API key with defaults.
4. Grantee sees the key **once**, copies it, and gets usage / limit guidance.

### B. Email request

1. Grantee submits name, email, brief pitch / use case.
2. Admin reviews in the admin UI (or email notification → approve).
3. On approval, same provisioning path as A; delivery via secure one-time page or email link.

### C. Monitor & govern

1. Admin dashboard lists grants: status, spend vs limit, last used, models if available.
2. Admin can raise limit, pause/revoke key, or archive the grant.
3. Alerts fire near threshold (OpenAI spend alerts + optional app-level notifications).

## Success criteria

- Time from valid invite to usable key: minutes, not days
- No shared keys across grantees
- Default limits applied on every new grant
- Admin can answer “who spent how much this month?” without the OpenAI dashboard
- Compromised key can be revoked from this app

## Open product questions

Document decisions as they land; do not block the first slice on all of them.

1. One OpenAI **project per grantee** vs shared project with per-key tracking?
2. Auto-approve with invite codes vs always-manual approval?
3. Key delivery: show once in UI only, or also email?
4. What is the default monthly budget?
5. Do we expose a grantee “my usage” page after issuance?
