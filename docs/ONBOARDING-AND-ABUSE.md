# Onboarding, approval, and abuse safeguards

Recommendation for the first real rollout (conference / named cohort ~100), then what to add ongoing.

**Related:** two program tracks (agents vs API keys) in [GRANT-TRACKS.md](./GRANT-TRACKS.md). This doc focuses on the **API key** redeem path. Agent stipends may use the same allowlist but different fulfillment.

Implementation note: the current [steel thread](./STEEL-THREAD.md) proves the
allowlist-to-key lifecycle but deliberately defers email verification and hard
spend-limit configuration. The requirements below remain production gates.

## Goals

- Easy for a founder to get access in minutes at an event (agent and/or API key)
- Some approval so random scanners don’t mint unlimited API keys
- Hard to abuse even if someone shares the QR
- Low admin burden during the event
- API spend cannot run away if our app or attention fails

## Recommended first conference: program signup + approval

Treat the conference QR as intake, not as a public key-mint URL. **v1 runs one
program** — no campaign entity; intake is a singleton open/closed switch.

### Before the event

1. Open **program intake** with an optional request cap, default grant policy,
   and optional imported pre-registration list (`grantees`).
2. Generate one QR pointing to the signup page.
3. Prepare an admin review queue for the expected, manageable attendee volume.
4. Configure **default limit template**: monthly hard spend per grant (OpenAI project limit), model allowlist, alert thresholds.
5. Set an **org-level spend ceiling** as a backstop above the sum of expected grants.

### Signup, review, and claim

1. Attendee scans QR and submits **email**.
2. If email matches a grantee (pre-registered), app sends one short-lived,
   single-use **email claim link**; no key is created yet.
3. If email is unmatched, app says it is not registered and offers a short
   application: name, how they heard about the program, and what they plan to
   build/use the grant for.
4. Admin approves or rejects pending applications.
5. Approval creates/updates a grantee with reviewer/application provenance
   and sends the same claim link; no key is created or stored at approval time.
6. Attendee clicks the link. The app verifies it, provisions project + service
   account + key, applies grant policy, and shows the key once.
7. After the event, admin closes intake. Existing claim links expire according
   to their own shorter policy.

This proves inbox ownership without passwords and preserves the rule that
plaintext API keys are never stored for later delivery.

### After the event (ongoing, light)

| Cadence | Action |
| --- | --- |
| Continuous | OpenAI **hard project spend limit** enforces the cap (requests fail with `429` when hit) |
| Periodic sync (e.g. hourly) | Pull usage/costs into our DB for admin + grantee “spent vs limit” |
| Alerts | Email admin at 50/80/100% (OpenAI spend alerts and/or our sync) |
| As needed | Admin raises limit, rotates, or revokes in our console |

**Do not** rely on “we’ll notice in our dashboard and manually cut them off” as the only limiter. Our monitoring is for visibility and courtesy; **OpenAI hard limits are the kill switch.**

## Other approval modes

| Mode | When to use |
| --- | --- |
| **Program grantee + fallback application** (conference) | Pre-registered attendees claim directly; unmatched attendees enter a manageable review list |
| **Allowlist + auto** (fallback) | Named/pre-registered cohort where inbox verification is intentionally skipped |
| **General request → admin approve** (later) | Inbound “I heard about you” form outside an event |
| **Admin direct issue** | Special cases, VIPs, support re-issue |

Same provisioning and limit machinery underneath; only the gate differs.

## QR vs approval — use both

- **QR** starts signup for the one program.
- **Grantee record / admin approval** decides who receives an email claim link.
- **Email claim** proves control of the approved inbox before minting.

A shared QR may escape the venue, so it must never mint directly. Program
intake open/close, request caps, rate limits, idempotent email checks, inbox
claim, and application review contain that exposure.

## Abuse safeguards (layered, light → firm)

Abuse is unlikely short-term; still ship these. They are cheap.

### Must-have for v1

1. **Hard per-grant spend limit** set in OpenAI at provision time  
2. **Org-level spend ceiling** as backstop  
3. **Grantee eligibility** — imported/admin-approved email; QR never mints directly
4. **Email claim link** before mint (short-lived, single-use, token hash stored)
5. **One active key per email**
6. **Program request cap + intake open/close**
7. **Rate-limit** signup and claim endpoints
8. **Admin revoke** in one click
9. **No plaintext key storage** (see [DATA-MODEL.md](./DATA-MODEL.md))

### Easy follow-ons

10. Usage sync + admin list sorted by spend  
11. Auto-flag / email when a grant hits 80%  
12. Model allowlist (block expensive models if desired)  
13. Scoped keys if we want to limit capabilities  

### Probably unnecessary at first

- Heavy fraud scoring, captchas beyond basic rate limits, KYC  
- Proxying traffic to inspect content  

## Limit enforcement: OpenAI vs our monitoring

| Mechanism | Role |
| --- | --- |
| OpenAI project hard spend limit | **Primary.** Stops spend even if our app is down |
| OpenAI spend alerts | Early warning to operators |
| Our synced usage UI | Human-friendly monitoring, support, “who’s hot” |
| Our app blocking redeem | Stops *new* keys; does not stop an already-issued key |

Periodic job: refresh usage; optionally **reconcile** that the OpenAI project limit still matches our intended template (drift detection). Do not invent a second soft-only limiter and call it done.

## Suggested default numbers (tune before event)

Document real numbers when chosen; placeholders:

- Per-grant monthly hard cap: e.g. $25–$50 (pick what the foundation can afford × ~100)  
- Org monthly ceiling: slightly above expected active grants × cap  
- Program intake closes at event end + a short grace period
- Claim-link expiry: hours or a few days, independent of intake closure
- Request cap: expected attendance + a reasonable buffer
- One active key per email; rotate replaces the old key  

## Simple narrative for operators

1. Open program intake and decide what it funds.
2. Print one QR to the signup page.
3. Attendees scan and submit email; pre-registered attendees get claim links.
4. Unmatched attendees can submit a short application.
5. Approve appropriate applications; the app emails claim links.
6. Claim click creates the key + budget and shows the secret once.
7. Close intake after the event.
8. Watch usage; notify or revoke when appropriate.

That’s enough to make acquisition easy and abuse hard without building a bureaucracy.
