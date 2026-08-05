# Admin console — design

The web admin is a **thin, metrics-first dashboard** plus emergency revoke.
Operators manage allowlist, invites, claim links, and (later) applications
through authenticated **MCP** tools — see [MCP-ADMIN.md](./MCP-ADMIN.md) and
[B-0008](./backlog/B-0008-mcp-admin-control-plane.md).

Implementation of the shell: [B-0007](./backlog/B-0007-admin-console-rewrite.md).

**Related:** usage data ([B-0001](./backlog/B-0001-usage-ingestion.md)),
dashboard metrics ([B-0002](./backlog/B-0002-admin-usage-dashboard.md)),
applications ([B-0006](./backlog/B-0006-campaign-intake-and-approval.md)).

---

## Design principles

1. **Dashboard first** — `/admin` answers “how is the program doing?”
2. **MCP for mutations** — do not rebuild CRUD forms that duplicate tools
3. **Emergency revoke** — one-click revoke remains on the web for booth safety
4. **Two shells** — public grantee pages vs admin console
5. **Public: mobile-first, task-focused** — branding + footer Admin link only
6. **Admin: desktop-first** — top nav, dense tables OK
7. **Honest data freshness** — every usage number shows period + last sync (B-0001)

---

## Route map

```
/admin                          Dashboard — summary metrics + recent activity + emergency revoke
/admin/mcp                      Mint / revoke MCP operator tokens + connect snippet
```

Optional later (viz only, not CRUD):

```
/admin/grants/[grantId]         Grant detail — usage timeline when B-0001 lands
```

**Dropped from the original CRUD map:** `/admin/grants` list management page,
`/admin/grantees`, `/admin/applications`, `/admin/program` setup forms.

---

## Navigation

**Admin top nav:** `Dashboard │ MCP`

**Admin header:** product name → `/admin`, OpenAI/Email mode badges, operator
email, Sign out.

**Public:** branding only in header; FAQ / Resources / Admin in footer.

---

## Dashboard (`/admin`)

Summary cards (local DB today; usage when B-0001 lands):

| Metric | Source (v1) |
| --- | --- |
| Active grants | Local DB |
| Pending applications | Local DB (0 until B-0006) |
| Pre-registered grantees | Local DB |
| Total spend / tokens | B-0001 — placeholder until then |

Below: recent grants table with emergency **Revoke** on active rows.

---

## Locked decisions

| Topic | Decision |
| --- | --- |
| Public nav | **None** — branding + footer links |
| Admin entry (public) | **Footer link** only |
| Admin nav | **Top nav** — Dashboard · MCP |
| Mutations | **MCP-primary** |
| Web revoke | **Keep** emergency revoke |
| CSV / invite / claim UI | **Removed** from web |

## Relationship to backlog

| Item | Role |
| --- | --- |
| **B-0001 / B-0002** | Usage metrics content on dashboard |
| **B-0006** | Intake domain; applications managed via MCP, not a web queue |
| **B-0007** | Thin shell rewrite (this doc) |
| **B-0008** | MCP control plane — primary management surface |
