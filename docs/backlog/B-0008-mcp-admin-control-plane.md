# B-0008 — MCP admin control plane (agent-first ops)

**Kind:** improvement  
**Status:** partial — Phase 0–B shipped; Phase C/D tools reserved until B-0006 / B-0001  
**Related:** [ADMIN-CONSOLE.md](../ADMIN-CONSOLE.md),
[MCP-ADMIN.md](../MCP-ADMIN.md),
[B-0007](B-0007-admin-console-rewrite.md),
[B-0002](B-0002-admin-usage-dashboard.md),
[B-0006](B-0006-campaign-intake-and-approval.md),
[SECURITY.md](../SECURITY.md)

## Problem / goal

The steel-thread admin surface (`/admin`) was a management console: CSV
allowlist import, invite creation, claim-link send, grant list, revoke. That
proved provisioning works, but it is a clumsy primary interface for operators
who already work in coding agents (Cursor and other MCP-compliant clients).

**Goal:** Make an authenticated **MCP admin service** the primary control
surface for mutations and list/query ops, and keep the web admin to
**read-mostly usage visualization**—not a second full management product.

## Shipped

- Streamable HTTP MCP endpoint at `/api/mcp` (same Next.js deploy).
- Operator PAT mint/revoke at `/admin/mcp` (hashed at rest, 30d TTL).
- Non-prod `MCP_TEST_TOKEN` under `AUTH_TEST_BYPASS`.
- Phase A tools: `list_grantees`, `upsert_grantee`, `remove_grantee`,
  `list_grants`, `send_claim_link`, `revoke_grant`, `create_program_invite`,
  `list_program_invites`.
- No CSV import tool — agents parse CSV and loop `upsert_grantee`.
- Thin web dashboard + emergency revoke ([B-0007](B-0007-admin-console-rewrite.md)).
- Connect docs: [MCP-ADMIN.md](../MCP-ADMIN.md); threat notes in
  [SECURITY.md](../SECURITY.md); decisions in [DECISIONS.md](../DECISIONS.md).

## Remaining

- Phase C tools (wired as deferred errors): applications / intake when
  [B-0006](B-0006-campaign-intake-and-approval.md) lands.
- Phase D: `get_usage_summary` when [B-0001](B-0001-usage-ingestion.md) lands.
- Optional: upgrade PAT to MCP OAuth 2.1 discovery if a client requires it.

## Locked decisions

| Topic | Decision |
| --- | --- |
| Booth-day web | Thin dashboard + emergency revoke only (no Program/CRUD fallback) |
| CSV | No MCP CSV tool; no web CSV upload |
| Hosting | Same Next.js app, Streamable HTTP |
| Auth | Operator PAT after GitHub allowlist; Bearer header |

## Acceptance

- [x] Allowlisted operator can manage steel-thread ops without `/admin` forms
- [x] Non-allowlisted callers cannot invoke tools
- [x] Mutating tools write audit events; domain stays in `src/lib/grants/*`
- [x] Destructive tools require explicit ids/reasons
- [x] Docs describe connect / auth / catalog / web vs MCP split
- [x] B-0007 / ADMIN-CONSOLE re-scoped for agent-first ops
- [x] Automated tests cover auth rejection + read/write tools

## Ready checklist

- [x] Auth + transport spike outcome recorded (DECISIONS.md + MCP-ADMIN.md)
- [x] Tool catalog locked for Phase A
- [x] B-0007 / ADMIN-CONSOLE re-scoped
- [x] Threat notes in SECURITY.md
