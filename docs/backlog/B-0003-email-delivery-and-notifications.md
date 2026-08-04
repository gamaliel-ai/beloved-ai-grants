# B-0003 — Email delivery and lifecycle notifications

**Kind:** improvement  
**Status:** open

## Problem / goal

Email unlocks several low-friction journeys without adding passwords or a
complex account system. The app currently cannot verify inbox ownership,
deliver secure access links, or notify a grantee when usage policy affects
their grant.

Add transactional mail infrastructure (Resend) and reusable,
auditable delivery primitives.

Config: only `RESEND_API_KEY` (+ optional `EMAIL_MODE`) and shared `APP_URL`.
Sender address is code-derived (`grants@{APP_URL host}`); local APP_URL or
missing key uses a fake outbox so real grantees are never emailed.

## Direction

Support these message classes:

1. Eligible grantee email (pre-registered or approved) → secure single-use
   claim link.
2. Email ownership / redemption verification.
3. Secure single-use key reveal or sign-in link—never the API key itself.
4. Grant issued / onboarding instructions.
5. Near-limit warning once reliable usage thresholds exist.
6. Limit reached, revoked, or suspended notice with plain-language next steps.
7. Operator alerts for unusual usage, sync failures, or automated actions.

Use idempotency keys, delivery status, retry policy, and templates with
development-safe recipients. Store message purpose and provider ids, not API
keys or unnecessary email content.

## Acceptance

- Local/test environments cannot accidentally email real grantees.
- Duplicate jobs do not send duplicate lifecycle messages.
- Delivery attempts and provider outcomes are visible to administrators.
- Signed links are high entropy, expire, are single use where appropriate, and
  store only token hashes.
- Approval can enqueue one claim email without provisioning or persisting an
  OpenAI API-key secret.
- Revocation and threshold messages explain what happened and how to contact
  the operator.
- Tests cover retries, duplicate suppression, expired links, and provider
  failure.

## Dependencies

- [B-0001](B-0001-usage-ingestion.md) for usage-driven messages
- [B-0005](B-0005-usage-threshold-intervention.md) for policy-triggered mail

## Out of scope

- Marketing/bulk campaigns (conference claim mail is transactional)
- Sending plaintext API keys by email
- Building a general notification platform
