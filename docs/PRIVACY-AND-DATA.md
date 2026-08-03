# Privacy, data, and grant terms (stance)

This is the project’s working policy for how we talk about keys, visibility, and revocation — on the site, in grant acceptance copy, and in ops. Not legal advice; refine with counsel before publishing formal Terms if needed.

## What a grant is

Beloved AI Grants sponsors OpenAI API usage for qualified entrepreneurs (initially: founders with limited resources, including Kenyan entrepreneurs we meet through programs and events).

- We issue an API key under **our** OpenAI organization.
- We pay the bill and set default limits.
- The grantee uses the key in their own apps.
- There is **no lock-in**: at any time they can create their own OpenAI account and key and stop using ours. Switching is a config change on their side.

## What we see (honest default)

Traffic goes **grantee → OpenAI**, not through Beloved’s servers (we are a control plane, not a proxy).

| We intentionally use | We do not routinely access |
| --- | --- |
| Who the grant is for, status, limits | Prompt and response **content** |
| Spend, tokens, models, timestamps (usage/cost APIs) | Live “wiretap” of their product traffic |
| Ability to revoke or rotate the key | Org-member access for the grantee (they are not added to our OpenAI org) |

**Residual reality:** because the key lives in our org, OpenAI may retain data under their platform policies (e.g. abuse monitoring), and some APIs can persist artifacts in the org if the grantee uses them (files, assistants, etc.). Org owners also always see usage metadata. We cannot truthfully claim cryptographic or absolute blindness.

## Our policy (best effort)

1. **It is our policy not to look at prompt/response content** in the ordinary course of running the program.
2. We **monitor usage and spend** so we can run budgets, support grantees, and spot anomalies (e.g. sudden burn).
3. We **minimize** content surface where practical (no proxy; avoid building content logs into our app; prefer scoped keys / model allowlists).
4. We **reserve the right to revoke or suspend a key at any time**, for any reason we judge necessary — including misuse, safety concerns, ToS/policy violations, abuse of the grant, or operational need. We expect this to be rare; the right exists so we can act if something becomes apparent.
5. We will be **transparent** about the above on the website and at key handoff (redeem / accept screen).

We are not trying to surveil founders. We are sponsoring access and keeping a light hand with a clear off-switch.

## What grantees should assume

- Treat the sponsored key like a **shared sponsored account**: fine for building and learning; for highly sensitive production data, prefer their own OpenAI project and key.
- Don’t put secrets or data in prompts that they would be unwilling to send to OpenAI under a sponsored org.
- If they need full independent control and privacy posture of their own choosing, **buy their own key** — we encourage that as they grow.

## Website / accept-copy checklist

When we ship UI copy, include short plain language covering:

- [ ] We own/sponsor the key; we pay; we can revoke
- [ ] We track usage and limits; we don’t routinely read your prompts
- [ ] OpenAI’s own data policies still apply
- [ ] You can switch to your own key anytime — no lock-in
- [ ] Acceptable use / community expectations (brief)
- [ ] Contact path if they need a higher limit or have questions

Keep it human and short. Conference redeem flow should show this before or with the one-time key reveal.

## Alignment without reading traffic

We steer the program toward our values by:

- Who we invite (codes, QR, qualification)
- Default spend caps and model allowlists
- Clear revoke rights + fast revoke in the admin console
- Talking to people when something looks off — not by building a content surveillance product

## Related docs

- [SECURITY.md](./SECURITY.md) — technical guardrails
- [OPENAI-ADMIN-API.md](./OPENAI-ADMIN-API.md) — what the Admin API can and cannot do
- [ACCESS-AND-PROVISIONING.md](./ACCESS-AND-PROVISIONING.md) — how keys are issued
