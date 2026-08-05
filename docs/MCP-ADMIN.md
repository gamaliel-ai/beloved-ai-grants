# MCP admin control plane

Operators manage grants primarily through an authenticated **MCP** server.
The web `/admin` dashboard is for usage visualization and emergency revoke.

Implementation ticket: [B-0008](./backlog/B-0008-mcp-admin-control-plane.md).

## Connect (Cursor)

1. Sign in to the app as an allowlisted GitHub admin.
2. Open **Admin → MCP** (`/admin/mcp`) and create an operator token.
3. Copy the token once into your MCP client config:

```json
{
  "mcpServers": {
    "beloved-grants-admin": {
      "url": "http://localhost:3002/api/mcp",
      "headers": {
        "Authorization": "Bearer bag_mcp_…"
      }
    }
  }
}
```

Use your deployed `APP_URL` origin in place of `localhost` in production.

### Local test bypass

Non-production only:

```bash
AUTH_TEST_BYPASS=1 \
AUTH_TEST_EMAIL=test-admin@example.com \
OPENAI_MODE=fake \
bun run dev
```

When bypass is active, `/api/mcp` accepts Bearer `AUTH_TEST_MCP_TOKEN`
(default `test-mcp-token`) — same pattern as the default test admin email.
Ignored when `NODE_ENV=production`.

## Auth model

- Identity: same GitHub OAuth + `ADMIN_EMAILS` allowlist as the web admin.
- MCP credential: short-lived hashed **operator PAT** (or
  `AUTH_TEST_MCP_TOKEN` under `AUTH_TEST_BYPASS`). Presented as
  `Authorization: Bearer …` on every request.
- Never put `OPENAI_ADMIN_KEY`, DB credentials, or Auth.js cookies in the agent.
- Failed auth returns HTTP **401** (no redirect).

## Tool catalog (Phase A)

| Tool | Purpose |
| --- | --- |
| `list_grantees` | Allowlist directory + live grant summary |
| `upsert_grantee` | Add/update one email (bulk = agent parses CSV and loops) |
| `remove_grantee` | Remove allowlist row (fails if grant history exists) |
| `list_grants` | Grants with status / redacted key / project id |
| `send_claim_link` | Email claim link to a grantee |
| `revoke_grant` | Revoke by grant id; **reason required** |
| `create_program_invite` | Create redeem URL |
| `list_program_invites` | Invite list + redemption counts |

**Not exposed:** CSV import tool. Parse files in the agent and call
`upsert_grantee` / `list_grantees`.

### Deferred tools (catalog reserved)

| Tool | Depends on |
| --- | --- |
| `list_applications`, `approve_application`, `reject_application`, `get_program_status`, `set_intake_open` | [B-0006](./backlog/B-0006-campaign-intake-and-approval.md) |
| `get_usage_summary` | [B-0001](./backlog/B-0001-usage-ingestion.md) |

These tools exist but return a clear “not available yet” error until domain
services land.

## Bulk allowlist recipe

1. Read/parse a local `name,email` CSV in the agent.
2. Optionally call `list_grantees` to see current state.
3. Call `upsert_grantee` once per row.
4. Spot-check with `list_grantees` again.

## What stays on the web

- `/admin` dashboard (counts, recent grants, usage when B-0001 lands)
- Emergency **Revoke** on active grant rows
- `/admin/mcp` token mint / revoke UI
