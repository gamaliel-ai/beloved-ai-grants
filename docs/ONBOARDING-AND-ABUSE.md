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

## Recommended v1: pre-approved allowlist + auto-provision

Treat the first release as **“named people we already trust,”** not open applications.

### Before the event

1. Build a **registry** of grantees: name + email (spreadsheet → import into `grantees` or an `allowlist_entries` table).
2. Create one **program invite** (multi-use): max redemptions ≈ cohort size + small buffer, expiry shortly after the event.
3. Generate **one QR** → redeem URL for that program.
4. Configure **default limit template**: monthly hard spend per grant (OpenAI project limit), model allowlist, alert thresholds.
5. Set an **org-level spend ceiling** as a backstop above the sum of expected grants.

No per-person approval click at the booth.

### At redeem (QR or link)

1. Attendee opens QR → enter **email** (and name if not preloaded).
2. App checks: email on allowlist **and** not already issued an active key **and** invite under max uses **and** not expired.
3. **Auto-provision** project + service account + key; apply hard spend limit via Admin API.
4. Show key once + budget + short privacy/revoke copy.
5. Optional but nice: send magic link / confirmation email so we know the inbox works (can be phase 1.1 if booth Wi‑Fi is painful).

**Approval = being on the list**, not an admin inbox during the keynote.

### After the event (ongoing, light)

| Cadence | Action |
| --- | --- |
| Continuous | OpenAI **hard project spend limit** enforces the cap (requests fail with `429` when hit) |
| Periodic sync (e.g. hourly) | Pull usage/costs into our DB for admin + grantee “spent vs limit” |
| Alerts | Email admin at 50/80/100% (OpenAI spend alerts and/or our sync) |
| As needed | Admin raises limit, rotates, or revokes in our console |

**Do not** rely on “we’ll notice in our dashboard and manually cut them off” as the only limiter. Our monitoring is for visibility and courtesy; **OpenAI hard limits are the kill switch.**

## What about admin-approve requests?

Useful, but **not** the conference primary path.

| Mode | When to use |
| --- | --- |
| **Allowlist + auto** (v1) | Named cohort, event QR, low drama |
| **Request → admin approve** (v1.5+) | Inbound “I heard about you” form, no pre-reg |
| **Admin direct issue** | Special cases, VIPs, support re-issue |

Same provisioning and limit machinery underneath; only the gate differs.

Flow for requests later:

1. Public form → `GrantRequest` / grantee `pending`
2. Admin approves → same provision path as allowlist hit
3. Email magic link to reveal or redeem

## QR vs registry — use both

- **Registry (emails)** = who is allowed
- **QR** = how they conveniently start redeem

QR alone (no allowlist) is weaker: the poster photo becomes a public mint URL until expiry/max-uses. For ~100 named people, **QR + allowlist** is the sweet spot.

If someone isn’t on the list at the booth: admin adds their email in the console (or a “add to allowlist” quick action), then they redeem — still no full open signup.

## Abuse safeguards (layered, light → firm)

Abuse is unlikely short-term; still ship these. They are cheap.

### Must-have for v1

1. **Hard per-grant spend limit** set in OpenAI at provision time  
2. **Org-level spend ceiling** as backstop  
3. **Allowlist** (or single-use codes) — not open mint  
4. **One active key per email**  
5. **Invite max redemptions + expiry**  
6. **Rate-limit** redeem endpoint  
7. **Admin revoke** in one click  
8. **No plaintext key storage** (see [DATA-MODEL.md](./DATA-MODEL.md))

### Easy follow-ons

9. Email verification before mint (magic link)  
10. Usage sync + admin list sorted by spend  
11. Auto-flag / email when a grant hits 80%  
12. Model allowlist (block expensive models if desired)  
13. Scoped keys if we want to limit capabilities  

### Probably unnecessary at first

- Heavy fraud scoring, captchas beyond basic rate limits, KYC  
- Proxying traffic to inspect content  
- Manual approve-every-redeem at a live event  

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
- Invite expiry: end of event + 7 days  
- Max redemptions: allowlist size + ~10%  
- One active key per email; rotate replaces the old key  

## Simple narrative for operators

1. **Import the list** of people we intend to sponsor.  
2. Decide what the event funds: **agent stipends**, **API keys**, or both ([GRANT-TRACKS.md](./GRANT-TRACKS.md)).  
3. **Print one QR** (API redeem and/or agent instructions).  
4. API path: scan → email matches → key + budget; **OpenAI caps spend**.  
5. Watch a simple dashboard; revoke if something looks wrong.  
6. Later, add “request access” + admin approve for people not on a list.

That’s enough to make acquisition easy and abuse hard without building a bureaucracy.
