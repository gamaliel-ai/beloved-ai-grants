# Decisions log

Working decisions from product design discussions. Update when we change course.

## Audience and program

| Decision | Choice |
| --- | --- |
| Primary audience | Early entrepreneurs with limited resources (e.g. Kenyan founders at events/cohorts) |
| First major rollout | Conference / named cohort (~100), ~6 weeks horizon when first discussed |
| Open source | Public repo OK if Admin keys and other secrets stay out of git; attack surface is real invite/redeem design, not hiding source |

## Two grant tracks

| Decision | Choice |
| --- | --- |
| Product scope | **AI building grants**, not API-keys-only — see [GRANT-TRACKS.md](./GRANT-TRACKS.md) |
| **Agent / tools track** | Lower friction for earliest builders (Cursor, Claude Code, ChatGPT/Codex-style tools). Ops often manual (seats, coupons, reimbursement). Important so we don’t miss people early in the journey. |
| **API key track** | Sponsored OpenAI `sk-…` with limits; automatable via Admin API. For founders ready to put AI in a product (and local Codex-via-API-key). |
| Conference emphasis | Prefer **agent access as the easy start** when we can fund it; API keys as the next step / parallel redeem for those ready |
| Codex “credits” / seats | **Not** the same as API Admin API provisioning. ChatGPT workspace seats/credits ≠ project API keys. Don’t block API platform on a Codex seat Admin API that doesn’t exist the same way. Local Codex via API key is a bonus of the API track |

## API key track — onboarding

| Decision | Choice |
| --- | --- |
| First-conference gate | **Program QR → email check**; pre-registered email gets a claim link, unmatched email can submit a light application |
| Unmatched email | Friendly “not registered” state + optional short application; admin approve/reject |
| Approved application | Creates/updates grantee with reviewer/application provenance; do not rewrite the imported source list |
| Key claim | Approval sends a short-lived single-use link; **provision and reveal on link click**, never at approval time |
| Program lifecycle (v1) | **One program** per deployment; singleton intake open/close + request cap; closing blocks new intake |
| Pre-approved fallback | Imported allowlist + immediate redeem remains available for named cohorts/admin-direct issuance |
| Later | Multiple named campaigns; general public request form outside an event |
| Keys per person | One-to-many in schema; **one active key per email** in normal operation |
| Isolation | Prefer **one OpenAI project per grant** |
| Spend enforcement | **OpenAI hard project spend limits** are primary; our usage sync is visibility/alerts; org-level ceiling as backstop |
| Abuse (light but real) | Allowlist, max redemptions, expiry, rate limits, one active key, hard caps, one-click revoke |

Detail: [ONBOARDING-AND-ABUSE.md](./ONBOARDING-AND-ABUSE.md)

## Data model

| Decision | Choice |
| --- | --- |
| Grantee | Person: name + email (+ timestamps); 1→many keys |
| Source of truth for key lifecycle | **OpenAI** (by `openai_api_key_id`); our DB links people ↔ OpenAI ids and caches metadata |
| Full secret storage | **Do not store plaintext.** Show once; keep redacted value + ids; rotate to re-issue |
| Optional secret hash | Only if we need “is this pasted key ours?” — not required for revoke |

Detail: [DATA-MODEL.md](./DATA-MODEL.md)

## Privacy and terms

| Decision | Choice |
| --- | --- |
| Org membership | Grantees are **not** added to our OpenAI (API) org |
| Content | Policy: we do **not** routinely look at prompts/responses; we monitor usage/spend |
| Residual honesty | Org ownership + some OpenAI features can leave residual visibility; don’t claim zero visibility |
| Revoke | Reserve right to revoke anytime if misuse or other concerns become apparent |
| Lock-in | None — they can buy their own OpenAI key anytime |
| Tone | Transparent best-effort; clarity over heavy legal theater for this audience |

Detail: [PRIVACY-AND-DATA.md](./PRIVACY-AND-DATA.md)

## Architecture

| Decision | Choice |
| --- | --- |
| Role of our app | **Control plane**, not an LLM proxy |
| Grantee usage UI | Thin layer over Admin usage/costs (“spent vs limit”), not a full OpenAI console clone |
| Framework / host | **Next.js** (App Router) on **Vercel** |
| Datastore | **Neon/Postgres** (hosted); **PGlite** for local dev; **Drizzle** schema + SQL migrations |
| Styling | **Tailwind CSS** |
| UI components | **shadcn/ui** as a parts bin (only add what we use) — not a full design-system install |
| Form controls | Prefer **native** `<select>` / inputs + Tailwind when enough; reach for shadcn Select only when custom option UI is needed |
| Client JS bias | Minimize shipped JS for constrained networks; Server Components / Server Actions by default; small client islands (copy key, reveal once) |
| Background jobs | **Vercel Cron** for usage sync |
| Admin auth | **Auth.js + GitHub OAuth**, restricted by normalized `ADMIN_EMAILS` |
| CSV import | All-or-nothing validation; idempotent upsert by normalized email |
| Grantee / OpenAI project | Separate records; one active grant/project per grantee in v1 |
| Steel-thread verification | Allowlist match only via program invite remains; **claim tokens** prove inbox ownership for `/join` and admin-sent links |
| Claim tokens | Hashed, single-use, 48h TTL; provision on `/claim/[token]` click; never email the API key; fake mailer when local / no Resend key |
| Steel-thread spend controls | Per-project hard limit and org ceiling configuration deferred; do not present alerts as enforcement |
| Public base URL | Single env `APP_URL` (local default `http://localhost:3002`). Derive invite/claim links, email absolute URLs, and OAuth callback base from it — do not add parallel `AUTH_URL` / link-base env vars |
| Config vs secrets | Env only for **secrets** and the public hostname (`APP_URL`). Everything else is a code constant or derived (sender local-part, TTLs, fake vs live mail, subjects). No mode/flag env vars for product behavior |
| Transactional email | **Resend** under the LKC Studios LLC team; dedicated API key per app. `From` = `{local-part}@{APP_URL hostname}`. Mail is fake when `RESEND_API_KEY` is missing or `APP_URL` is local — never a separate mode env var |

## Still open

1. Exact default monthly $ cap and org ceiling for the conference  
2. Which **agent tools** we fund for track 1, and procurement (seats vs coupons vs reimbursement)  
3. Whether conference redeem offers both tracks in one flow or agent-first then API later  
4. Final optional application fields and approval batch UX
