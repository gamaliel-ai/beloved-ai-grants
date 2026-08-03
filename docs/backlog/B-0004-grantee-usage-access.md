# B-0004 — Low-friction grantee usage access

**Kind:** improvement  
**Status:** deferred  
**Depends on:** [B-0001](B-0001-usage-ingestion.md),
[B-0003](B-0003-email-delivery-and-notifications.md)

## Problem / goal

Grantees should be able to answer “is my grant active and how much have I
used?” without receiving OpenAI organization access or managing another
password.

Do not authenticate by asking for the OpenAI API key. It is a spendable secret,
may be copied into logs/forms/password managers, and does not prove who the
person is. Preserve the one-time key handling boundary.

## Direction

- Let a grantee enter their email and receive a short-lived signed link.
- Link access to a specific grantee/grant, with expiry, revocation, token-hash
  storage, and replay policy.
- Show a thin read-only view: identity email, grant/key status, redacted key,
  intended budget, current-period usage/cost, recent activity, data freshness,
  and support contact.
- Include clear states for revoked, limit reached, stale data, and no activity.
- Reuse the same link/session primitive for secure key reveal or reissue when
  email automation is available.

## Acceptance

- Possession of an API key is never accepted as application authentication.
- A signed link exposes only the intended grantee's grants.
- Links expire and can be invalidated; stored tokens are hashed.
- The page never exposes the original API key.
- Usage totals agree with the admin view for the same project and period.
- Requesting a link does not reveal whether an arbitrary email is allowlisted.

## Out of scope

- Passwords, profiles, teams, or social login for grantees
- OpenAI organization membership
- Re-displaying previously issued API keys
