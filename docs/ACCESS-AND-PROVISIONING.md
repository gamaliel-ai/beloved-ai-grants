# Access and provisioning

How someone becomes a grant holder and receives a key.

**Conference recommendation:** one program QR + email check; pre-registered
attendees receive a claim link, while unmatched attendees can submit a short
application for admin approval. Provision and reveal only when an eligible
attendee clicks the emailed link. Agent/tools stipends may share the same
intake with different fulfillment — [GRANT-TRACKS.md](./GRANT-TRACKS.md).
Approval and abuse detail:
[ONBOARDING-AND-ABUSE.md](./ONBOARDING-AND-ABUSE.md).

## Access channels

### 1. Program QR + grantee/application + email claim (conference primary)

- Admin opens intake on the singleton program (dates, request cap, grant defaults).
- Admin may import a pre-registration list into `grantees`.
- One QR opens the public signup page (e.g. `/join`).
- Matching email receives a claim link without manual review.
- Unmatched email can submit a short application.
- Admin approves/rejects the manageable application queue.
- Approval emails a short-lived single-use claim link.
- Claim click provisions and reveals once; approval itself stores no key.

### 2. Pre-approved allowlist (fallback)

- Import named grantees before a closed cohort.
- Email match can auto-provision where skipping inbox verification is an
  explicit operational tradeoff.
- Admin can add a missing email directly.

### 3. Invite / access code

- Admin creates a code (or magic link token) with:
  - max uses (1 for personal invite, N for a workshop)
  - expiry
  - limit template override (optional)
- Share as short code or URL / QR.

### 4. General email / form request (later)

- Public form: name, email, use case, optional referral
- Creates a pending request
- Admin approves → same provisioning path; delivery via secure one-time page or email link

Best for inbound interest without a pre-reg list.

### 5. Admin-direct

- Admin creates a grant and provisions immediately, then shares a one-time reveal link.

## Provisioning sequence

On a valid claim-link click, allowlist redeem, or admin-direct issue:

1. Validate invite / grant state (not expired, under max uses, not already provisioned).
2. Call OpenAI Admin API:
   - create project (or reuse policy-defined project)
   - apply spend limit + alerts + model policy
   - create service account (+ API key)
3. Persist metadata; mark claim/invite consumed and grant `active`.
4. Show key once in UI (and optionally a one-time email link that expires quickly).
5. Offer rotate: revoke old key id, issue new key on same project/service account.

## Failure modes

| Failure | Behavior |
| --- | --- |
| OpenAI API error mid-provision | Roll back or mark `provision_failed`; no partial “active” grant without key id |
| User closes tab before copying key | “Reissue / rotate” path — never re-display stored plaintext if we didn’t keep it |
| Code reused past max | Reject with clear message |
| Spend limit hit | OpenAI returns 429 to the grantee; admin sees status and can raise limit |

## Grantee messaging (copy intent)

Keep it plain:

- What they received (API key + monthly budget)
- That the key is shown once
- Where to get help / request more budget
- That abuse or resale → revoke
