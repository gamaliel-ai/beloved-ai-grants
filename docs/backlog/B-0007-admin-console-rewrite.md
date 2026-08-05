# B-0007 — Admin console rewrite (IA + layout)

**Kind:** improvement  
**Status:** open  
**Design:** [ADMIN-CONSOLE.md](../ADMIN-CONSOLE.md)

## Problem / goal

The current `/admin` page mixes infrequent setup (CSV import, invite creation)
with operational grant monitoring on one screen. It has no usage metrics, no
application queue home, no drill-down, and exposes an Admin link in the public
header.

Replace the monolith with a metrics-first admin shell: dedicated routes,
sub-navigation, admin-only layout, and clear separation between **operations**
(dashboard, grants, grantees, applications) and **program setup** (intake,
allowlist, QR).

This is a **rewrite**, not incremental edits to the existing page.

## Direction

- Add `(admin)` route group with shared layout calling `requireAdmin()`.
- **Public layout:** mobile-friendly; no nav; muted footer link to `/admin`.
- **Admin layout:** desktop-first; classic **top nav** (Dashboard · Grants ·
  Grantees · Applications · Program).
- **Default landing:** `/admin` dashboard (skeleton metrics until B-0001).
- Relocate existing steel-thread UI:
  - CSV import, intake settings placeholder → `/admin/program`
  - Grant list + revoke → `/admin/grants` (and detail route stub)
- Sub-nav: flat top bar under admin header (not sidebar).
- Applications page can ship as empty/pending until B-0006.
- Reuse existing server actions; refactor queries into shared admin data helpers
  as needed.
- Server Components first; client only for file upload, revoke confirm, copy QR.

## Acceptance

- Unauthenticated users cannot access any `/admin/*` route.
- Public pages have no header nav; admin entry is a footer link only.
- Admin console uses top nav and is laid out for desktop/large screens.
- `/admin` shows summary cards (local DB metrics) and a recent-grants/activity
  table — not import/invite forms.
- `/admin/program` contains allowlist import and program/invite management moved
  from the old home page.
- `/admin/grants` lists grants with status and links toward detail.
- Nav highlights active section.
- Existing E2E/admin flows updated for new routes (import, invite, revoke still
  work).
- Design doc open questions resolved or explicitly deferred in PR description.

## Depends on

- None for Phase A–B (shell + relocate + skeleton dashboard).
- [B-0001](B-0001-usage-ingestion.md) + [B-0002](B-0002-admin-usage-dashboard.md)
  for real usage metrics on dashboard/grant views.
- [B-0006](B-0006-campaign-intake-and-approval.md) for applications queue content.

## Out of scope

- Usage ingestion itself (B-0001)
- Application approval logic (B-0006)
- Grantee-facing pages (`/join`, claim flow)
- RBAC / multiple admin roles
- Charts beyond simple tables in v1
- MCP / agent control plane ([B-0008](B-0008-mcp-admin-control-plane.md)) —
  but **re-scope this rewrite** if B-0008 makes management pages redundant:
  prefer dashboard shell + emergency actions over a full CRUD console.
