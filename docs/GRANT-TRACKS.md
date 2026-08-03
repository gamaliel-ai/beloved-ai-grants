# Grant tracks

Beloved sponsors **AI building**, not only API keys. Early entrepreneurs (limited infrastructure, early in their journey) often hit a wall with raw API keys. Coding agents are an easier on-ramp.

## Why two tracks

| | **Agent / tools** | **API keys** |
| --- | --- | --- |
| Job to be done | Start building this week | Put AI into a product / backend |
| Skill assumption | Can install an app / CLI and sign in | Comfortable with keys, env vars, APIs |
| Who we might miss if we only ship API keys | Many earliest founders | — |
| Automation fit | Usually **manual / semi-manual** | **Strong** via OpenAI Admin API |
| Abuse / limits | Softer (plan seats, coupons, human ops) | Hard spend caps + revoke by key id |

**Decision:** ship the API control plane in this repo, and treat **agent assistance as a first-class program track** so we don’t systematically exclude early-journey founders.

## Track A — Agent / tools (lowest friction)

**Examples:** Cursor, Claude Code, ChatGPT + Codex (subscription/seat style), similar coding agents.

**What “grant” means in practice (ops, not elegant API):**

- Buy or assign seats / team plans  
- Coupons, prepaid credits, or **reimburse up to $X for N months**  
- Invite allowlisted emails into a workspace (when the vendor works that way)

**Conference role:** when we can fund it, this should be the **easy start** at the booth — “get a coding agent so you can build.”

**Not the same as OpenAI API Admin automation.** Vendor admin UIs and finance workflows dominate. Document the chosen vendor(s) and runbook when we pick them for an event.

### Codex credits / seats (important distinction)

OpenAI **Codex** can be used in two ways:

1. **ChatGPT workspace** (Plus/Pro/Business/Enterprise): seats, workspace credits, ChatGPT sign-in. Managed in the **ChatGPT admin** world. Members are in *your workspace*. **Not** provisioned like API Platform project keys via the Admin API.  
2. **API key auth** for **local** Codex CLI/IDE: billed as normal API usage against a sponsored `sk-…`. Fits **Track B**. Fewer ChatGPT-cloud features than a full Codex seat.

**Decision:** do not block the API platform waiting to “Admin-API provision Codex credits.” If we want true Codex/ChatGPT seats, that’s a Track A ops program (possibly Enterprise/Business), separate from key minting.

## Track B — OpenAI API keys (this codebase’s automation focus)

Sponsored project API keys under our org:

- Allowlist + QR redeem (v1)  
- Hard spend limits, usage monitoring, revoke/rotate  
- Grantees are **not** org users  
- Can also power local Codex via API key (bonus, not the whole agent story)

See [ONBOARDING-AND-ABUSE.md](./ONBOARDING-AND-ABUSE.md), [DATA-MODEL.md](./DATA-MODEL.md), [OPENAI-ADMIN-API.md](./OPENAI-ADMIN-API.md).

## How tracks relate

```
Early founder ──► Track A (agent) ──► building confidence / MVP
                      │
                      └── when they need AI in a product ──► Track B (API key)
```

Same allowlist of people can be eligible for both. Redeem UX can offer one or both depending on what we’re funding that cohort.

## Conference recommendation

1. Fund **Track A** if budget allows — primary narrative for earliest builders.  
2. Run **Track B** with allowlist + QR + auto-provision + hard caps — especially for attendees ready for product/API use (and local Codex-via-key).  
3. Same registry of names/emails; clear copy on what each track is and isn’t.  
4. No lock-in on either track: they can pay for their own Cursor/OpenAI/etc. anytime.

## What this repo implements first

**Track B control plane** (automatable, OpenAI Admin API).  

Track A is documented here as program intent; implementation may be checklists, admin notes, and later lightweight tracking (who got which tool stipend) rather than full vendor API integration.
