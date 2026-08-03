# Access and provisioning

How someone becomes a grant holder and receives a key.

**Conference / cohort recommendation:** pre-approved email allowlist + program QR + auto-provision for the **API track**. Agent/tools stipends may use the same list with different fulfillment — [GRANT-TRACKS.md](./GRANT-TRACKS.md). Approval and abuse detail: [ONBOARDING-AND-ABUSE.md](./ONBOARDING-AND-ABUSE.md).

## Access channels

### 1. Allowlist + program QR (primary for v1)

- Import named grantees (name + email) before the event.
- One multi-use program invite; QR encodes the redeem URL.
- Redeem: email must match allowlist, one active key per email → auto-provision with default limits.
- Admin can add a missing email at the booth without a full request workflow.

### 2. Invite / access code

- Admin creates a code (or magic link token) with:
  - max uses (1 for personal invite, N for a workshop)
  - expiry
  - limit template override (optional)
- Share as short code or URL / QR.

### 3. Email / form request (v1.5+)

- Public form: name, email, use case, optional referral
- Creates a pending request
- Admin approves → same provisioning path; delivery via secure one-time page or email link

Best for inbound interest without a pre-reg list.

### 4. Admin-direct

- Admin creates a grant and provisions immediately, then shares a one-time reveal link.

## Provisioning sequence

On successful redeem or approve:

1. Validate invite / grant state (not expired, under max uses, not already provisioned).
2. Call OpenAI Admin API:
   - create project (or reuse policy-defined project)
   - apply spend limit + alerts + model policy
   - create service account (+ API key)
3. Persist metadata; mark invite consumed / grant `active`.
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
