# B-0008 — MCP admin control plane (agent-first ops)

**Kind:** improvement  
**Status:** open  
**Related:** [ADMIN-CONSOLE.md](../ADMIN-CONSOLE.md),
[B-0007](B-0007-admin-console-rewrite.md),
[B-0002](B-0002-admin-usage-dashboard.md),
[B-0006](B-0006-campaign-intake-and-approval.md),
[SECURITY.md](../SECURITY.md)

## Problem / goal

The steel-thread admin surface (`/admin`) is a management console: CSV
allowlist import, invite creation, claim-link send, grant list, revoke. That
proved provisioning works, but it is a clumsy primary interface for operators
who already work in coding agents (Cursor and other MCP-compliant clients).

Examples of friction:

- Adding or revoking a single email via CSV upload is heavier than “add
  `founder@example.com` to the allowlist.”
- Approving applications, listing grantees, and revoking a grant are natural
  **tool calls** with structured arguments and audit trails—not form posts.
- Building a rich CRUD admin UI (B-0007’s full Grants / Grantees / Applications /
  Program pages) may be the wrong investment if agents can drive the same
  domain services more directly.

Meanwhile, **usage visualization** still benefits from a static web dashboard:
spend, recent activity, freshness, “needs attention.” That is glanceable,
shareable in a browser, and poorly replaced by chat transcripts.

**Goal:** Make an authenticated **MCP admin service** the primary control
surface for mutations and list/query ops, and keep (or slim) the web admin to
**read-mostly usage visualization**—not a second full management product.

## Hypothesis

| Concern | Prefer |
| --- | --- |
| Add/remove allowlist emails, create invites, send claim links, approve/reject applications, revoke grants | **MCP tools** in an authenticated agent session |
| “How is the program doing?” spend, velocity, stale sync, needs attention | **Web dashboard** (B-0001 + B-0002; thin shell from B-0007) |
| Bulk one-time bootstrap of a large pre-registration list | Optional: keep CSV import as a tool *or* a rare Program UI escape hatch |

If the hypothesis holds, B-0007’s full multi-page management IA should be
**narrowed**: shell + metrics dashboard first; defer or drop dedicated
management pages that duplicate MCP tools.

## Direction

### 1. MCP server as operator API

Expose a small, intentional tool set over the existing domain services under
`src/lib/grants/*` (and later B-0006 application services). Do **not** invent a
parallel business layer for the browser and another for MCP—both should call the
same functions that today’s Server Actions wrap.

**v1 tool sketch** (names illustrative):

| Tool | Maps to today / planned |
| --- | --- |
| `list_grantees` | Grantee directory (eligibility, provenance, grant summary) |
| `upsert_grantee` / `remove_grantee` | Allowlist management without CSV |
| `import_grantees_csv` | Optional bulk path (same validation as `importGranteesAction`) |
| `list_grants` | Status, redacted key, project id, optional usage summary |
| `send_claim_link` | `sendClaimLinkAction` |
| `revoke_grant` | `revokeGrantAction` (require explicit reason) |
| `create_program_invite` / `list_program_invites` | Invite create + list |
| `list_applications` / `approve_application` / `reject_application` | B-0006 (when built) |
| `get_program_status` / `set_intake_open` | B-0006 program settings |
| `get_usage_summary` | Read-only; depends on B-0001 |

Destructive tools must require unambiguous identifiers (email or grant id) and
emit the same audit events as the web path (`grantees.imported`,
`grant.revoked`, etc.).

### 2. Authentication (reuse GitHub)

Operators already sign in with **GitHub OAuth** + a hardcoded admin email
allowlist (`src/lib/auth/admin-emails.ts`). The MCP surface must be at least as
strong:

**Preferred direction to spike:**

1. Reuse the existing GitHub OAuth app / NextAuth configuration so operator
   identity is the same GitHub account + allowlisted email.
2. Issue a **short-lived, server-side operator credential** (or session token)
   that MCP clients present on every tool call—never embed `OPENAI_ADMIN_KEY` or
   DB credentials in the agent.
3. Reject non-allowlisted identities the same way `requireAdmin()` does today.
4. Non-production `AUTH_TEST_BYPASS` may mint a local test credential for e2e;
   ignored when `NODE_ENV=production`.

**Open design choices** (resolve in a spike before “ready”):

- Transport: Streamable HTTP / SSE MCP endpoint on the Next app vs a small
  dedicated worker process sharing the same DB and domain libs.
- How Cursor (and other clients) complete the OAuth / token handoff without
  pasting long-lived secrets into chat.
- Whether tools are available only over a private URL / Vercel Deployment
  Protection / IP allowlist in addition to OAuth.
- Token lifetime, revocation, and audit of “which agent session did what.”

### 3. Web admin: visualize, don’t CRUD

Align with the spirit of B-0002 / ADMIN-CONSOLE “dashboard first,” but **stop
assuming** Program / Grantees / Applications pages are the only way to operate:

- **Keep:** metrics-first `/admin` (active grants, spend, recent activity, sync
  freshness, needs-attention). Revoke-from-dashboard may remain as an emergency
  affordance if one-click safety matters at an event.
- **Defer or drop from B-0007 Phase A–E:** dedicated management forms that exist
  only to wrap the same mutations MCP will own (CSV-centric Program page,
  application queue UI) unless we still want a no-agent fallback for booth day.
- **Document the operator path:** “Connect MCP → manage allowlist / approve /
  revoke; open `/admin` to watch usage.”

Update [ADMIN-CONSOLE.md](../ADMIN-CONSOLE.md) when this ticket moves toward
ready so the route map and B-0007 acceptance criteria stay honest.

### 4. Why this fits the product

Beloved is already a **control plane** (Architecture): provision and revoke
under our OpenAI org; grantees never become org admins. An MCP control plane is
the same idea with an agent-native interface—especially natural for a foundation
whose operators live in Cursor-like tools and whose grantees may too.

## Phased delivery (suggested)

| Phase | Delivers |
| --- | --- |
| **0 — Spike** | Auth + transport decision; one read tool (`list_grants`) and one write tool (`upsert_grantee`) against fake OpenAI + PGlite; prove Cursor (or another MCP client) can call them as an allowlisted admin |
| **A — Steel-thread parity** | Tools covering today’s Server Actions: import/upsert grantees, invites, send claim link, list, revoke — with audit parity and tests |
| **B — Thin web** | Re-scope B-0007: dashboard + emergency revoke; management pages optional/fallback; remove assumption that CSV UI is primary |
| **C — Intake tools** | Application list/approve/reject + intake open/close when B-0006 lands |
| **D — Usage tools** | Read-only usage summaries once B-0001 exists (dashboard remains canonical viz) |

## Acceptance

- An allowlisted operator can perform steel-thread management **without** the
  `/admin` forms: add/remove allowlist emails, create an invite, send a claim
  link, list grants, revoke a grant—via MCP tools.
- Non-allowlisted callers cannot invoke tools (same allowlist semantics as
  `requireAdmin()`).
- Every mutating tool writes the same (or stricter) audit events as the web
  Server Actions.
- Domain logic remains in `src/lib/grants/*` (or successors); MCP is an adapter,
  not a fork of business rules.
- Destructive tools require explicit ids/reasons; no “revoke all” footguns in
  v1.
- Docs describe: how to connect (Cursor / MCP client), auth model, tool catalog,
  and what still lives on the web dashboard.
- B-0007 / ADMIN-CONSOLE updated so management-page scope reflects
  agent-first ops (not an accidental second CRUD product).
- Automated tests cover auth rejection + at least one read and one write tool
  against fake gateway / in-memory or throwaway PGlite.

## Depends on

- None for Phase 0 spike (can use existing steel-thread services).
- [B-0006](B-0006-campaign-intake-and-approval.md) for application/intake tools.
- [B-0001](B-0001-usage-ingestion.md) for usage read tools and for the web
  dashboard to stay the visualization home ([B-0002](B-0002-admin-usage-dashboard.md)).

## Out of scope

- Grantee-facing MCP (grantees are not operators; claim/redeem stay HTTP).
- Exposing OpenAI Admin API primitives raw to the agent (no `create_project`
  passthrough)—only Beloved domain tools.
- Replacing public `/join` / `/claim` / `/redeem` flows.
- Full RBAC / multiple admin roles (still a single allowlist).
- Automated fraud scoring or prompt inspection.
- Building a second REST “public management API” for third-party dashboards
  unless MCP proves insufficient.

## Open questions

1. **Booth-day fallback:** Keep a minimal web Program + Applications UI for
   when an agent is unavailable, or accept MCP-only ops + dashboard?
2. **CSV:** Retain as an MCP bulk tool only, or also keep file upload in UI?
3. **Revoke on dashboard:** Emergency button on usage rows, or MCP-only?
4. **Hosting:** Same Next.js deployment vs separate MCP process?
5. **Client UX:** First-class Cursor deep link / config snippet in docs?
6. **Interaction with B-0007:** Pause full IA rewrite until Phase 0 spike
   reports, or ship dashboard shell now and explicitly cut management pages?

## Ready checklist (before implementation PR)

- [ ] Auth + transport spike outcome recorded (here or DECISIONS.md)
- [ ] Tool catalog locked for Phase A
- [ ] B-0007 / ADMIN-CONSOLE re-scoped in the same change set that marks this
      ready
- [ ] Threat notes: token theft, prompt-injection ordering an agent to revoke,
      audit attribution (link from SECURITY.md)
