# B-0006 — Program intake, approval, and key claim

**Kind:** improvement  
**Status:** open  
**Depends on:** [B-0003](B-0003-email-delivery-and-notifications.md)

## Problem / goal

The current steel thread assumes a pre-approved email allowlist. A conference
needs a hybrid: pre-registered attendees should claim without waiting for
review, while an unmatched attendee should get a short application rather than
a frustrating dead end.

**v1 scope:** one program per deployment — no `Campaign` entity. Intake
open/close and caps are singleton `program_settings`. Multi-campaign is deferred.

The request form must not mint a key. Approval must not mint and retain a
plaintext key while waiting for delivery. The approved attendee receives a
short-lived email claim link; clicking it atomically provisions the OpenAI
project/service account and reveals the key once.

## Locked journey

1. Admin opens intake on the singleton program (optional pre-registration CSV
   import into `grantees`).
2. Admin displays or prints one QR linking to the public email-entry page
   (e.g. `/join`).
3. Attendee submits email.
4. If email matches an existing grantee (pre-registered), send a short-lived
   claim link immediately.
5. If email is unmatched, explain that it is not registered and offer a light
   application: name, how they heard about the program, and what they plan to
   build/use the grant for.
6. Admin reviews pending applications and approves or rejects them.
7. Approval creates/updates a grantee with `application_approved` provenance and
   sends the same short-lived claim link. It does not mint a key.
8. Claim-link click verifies the token, provisions the project/key, marks the
   token used, and reveals the key once.
9. Admin closes intake after the event; new email checks/applications stop,
   while already issued claim links follow their own expiry policy.

## Direction

- Add `program_settings` (singleton), `applications`, and hashed `claim_tokens`
  — do not introduce `Campaign` / `CampaignEligibility` for v1.
- Extend `grantees` with provenance (`imported | application_approved |
  admin_added`); eligible email = grantee row.
- Normalize email; enforce one grantee per email and one pending application per
  email.
- Application states: pending, approved, rejected, withdrawn.
- Keep the application intentionally short; fields beyond email/name should
  primarily aid human review, not create a scoring bureaucracy.
- Support approve/reject individually and safe small-batch approval.
- Reuse the existing failure-safe provisioning and one-time reveal service.
- Keep the existing imported allowlist + `program_invites` redeem as fallback
  for named cohorts / steel-thread ops.
- Rate-limit signup and claim endpoints; honor program request cap and intake
  closed state.
- Audit program-setting changes, review decisions, mail delivery, claim, and
  provisioning.

## Acceptance

- Scanning the program QR reaches a mobile-friendly signup page.
- A pre-registered email receives a claim-link email without manual review.
- An unmatched email sees a clear, kind application option rather than a
  generic failure.
- Duplicate checks/applications for the same email do not create duplicate
  records or messages.
- Closing intake blocks new submissions without breaking unrelated grants.
- Application approval records who approved it and why the email became
  eligible; imported rows remain immutable provenance for their source list.
- Approval sends exactly one claim message and creates no OpenAI key yet.
- A valid claim link provisions and reveals one key; refresh/replay cannot mint
  another key or redisplay the secret.
- Expired, rejected, already-claimed, and revoked flows have clear safe states.
- Admin can filter the application queue by status and see delivery/claim
  history.
- Tests cover allowlist matching, duplicate application, concurrent signup,
  double approval, duplicate mail jobs, token replay, intake closure, and
  provisioning failure.

## Out of scope (v1)

- Multiple named campaigns / campaign picker
- Fully open auto-approval
- Complex KYC or fraud scoring
- Password-based grantee accounts
- Sending API keys in email
