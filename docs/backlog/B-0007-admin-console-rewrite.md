# B-0007 — Admin console rewrite (IA + layout)

**Kind:** improvement  
**Status:** partial — thin shell shipped; full CRUD pages **dropped** in favor of MCP  
**Design:** [ADMIN-CONSOLE.md](../ADMIN-CONSOLE.md)  
**Related:** [B-0008](B-0008-mcp-admin-control-plane.md), [MCP-ADMIN.md](../MCP-ADMIN.md)

## Problem / goal

The steel-thread `/admin` page mixed infrequent setup with operational grant
monitoring. Replace it with a metrics-first admin shell.

**Re-scope (B-0008):** Mutations live in MCP. This ticket delivers the thin web
shell only — not a second CRUD product.

## Shipped

- `(admin)` route group with `requireAdmin()` layout (desktop top nav:
  Dashboard · MCP).
- Public layout: branding header, footer Admin link (no public header Admin).
- `/admin` dashboard skeleton: active grants, pending apps placeholder,
  grantee count, usage placeholder, recent grants table.
- Emergency revoke on active grant rows.
- Steel-thread CSV / invite / claim forms removed from the web UI.

## Remaining

- Real usage metrics on the dashboard ([B-0001](B-0001-usage-ingestion.md) +
  [B-0002](B-0002-admin-usage-dashboard.md)).
- Optional grant detail viz when usage data exists.

## Out of scope (explicitly cut)

- Dedicated Program / Grantees / Applications management pages
- Web CSV import, invite create form, send-claim buttons (MCP owns these)
- MCP server itself ([B-0008](B-0008-mcp-admin-control-plane.md))
