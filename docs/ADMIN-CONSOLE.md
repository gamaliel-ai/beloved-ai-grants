# Admin console — design

The current `/admin` page is a **steel-thread ops dump**: CSV import, invite
creation, and a flat grant table share one screen. That was fine to prove
provisioning, but it is the wrong default for day-to-day operation.

This doc specifies a **full rewrite** of the admin experience: metrics-first
overview, separate management pages, admin-only chrome. Implementation:
[B-0007](./backlog/B-0007-admin-console-rewrite.md).

**Related:** usage data ([B-0001](./backlog/B-0001-usage-ingestion.md)),
dashboard metrics ([B-0002](./backlog/B-0002-admin-usage-dashboard.md)),
applications ([B-0006](./backlog/B-0006-campaign-intake-and-approval.md)),
agent-first management ([B-0008](./backlog/B-0008-mcp-admin-control-plane.md)).

**Open product question (B-0008):** Should mutations (allowlist, invites,
approve/reject, revoke) live primarily in an authenticated **MCP** surface for
coding agents, with this console staying **read-mostly usage visualization**?
If yes, prefer a thin dashboard shell over building every CRUD page below.
Resolve before investing in the full route map.

---

## What’s wrong today

| Issue | Why it matters |
| --- | --- |
| **Setup dominates the home screen** | Import and invite forms are infrequent; they crowd out “what’s happening now.” |
| **No usage or spend signal** | Operators must leave the app (OpenAI console) to see activity. |
| **Flat grant list only** | No drill-down, timeline, or sort by spend/activity. |
| **No application queue** | Conference intake (B-0006) has nowhere to live. |
| **Public header links to Admin** | Grantees on `/join` or `/redeem` should not see admin navigation. |
| **Single page, no structure** | Everything will keep accreting on one route without a deliberate split. |

Incremental patches (adding a card here, a table there) will not fix the
information hierarchy. Replace the monolith with a **route group + layout**.

---

## Design principles

1. **Dashboard first** — landing on `/admin` answers “how is the program doing?”
2. **Metrics before menus** — headline numbers and recent activity above the fold
3. **Ops vs program setup** — reviewing spend and approving applications are daily; CSV import and intake toggles are occasional
4. **Drill-down, don’t dump** — list pages link to grant / grantee detail
5. **Two shells** — public grantee pages vs admin console; no shared nav between them
6. **Public: mobile-first, task-focused** — grantees arrive via QR/link; no site nav required
7. **Admin: desktop-first** — classic management dashboard with top nav; optimize for large screens
8. **Honest data freshness** — every usage number shows period + last sync time (B-0001)

---

## Public site chrome (grantees)

Grantees do **not** need navigation. They land on a single-purpose page
(`/join`, claim link, legacy redeem) and complete one task. A header nav adds
noise and exposes operator surfaces.

**Public layout:**

- **Mobile-friendly** content width and typography
- Optional minimal **branding only** (product name / logo) — no nav links
- **No header link to admin**
- **Footer:** unobtrusive “Admin” text link → `/admin` (operators who know the
  URL; not promoted to grantees scanning the page)
- Later: privacy/terms in footer if needed

Grantee flows stay full-width and readable on a phone at a booth. That is
separate from the admin console, which assumes a laptop or large monitor.

---

## Route map

Use an `(admin)` route group with its own layout and `requireAdmin()` on the
layout (not repeated per page).

```
/admin                          Dashboard — summary metrics + recent activity
/admin/grants                   Grant registry (sortable/filterable)
/admin/grants/[grantId]         Grant detail — usage, limits, revoke, audit
/admin/grantees                 Grantee directory
/admin/grantees/[granteeId]     Grantee detail — provenance, grants, applications
/admin/applications             Application review queue (B-0006)
/admin/program                  Program settings — intake, cap, allowlist import, QR
```

Optional later:

```
/admin/audit                    Cross-cutting audit log search
/admin/sync                     Manual sync trigger + reconciliation (ops/debug)
```

**Default redirect:** `/admin` → dashboard, not program setup.

---

## Navigation (admin console)

**Top nav** — classic horizontal management dashboard. Desktop / large-screen
assumption: comfortable table density, multi-column dashboard, no hamburger menu
required for v1.

Nav items (flat top bar under the header):

```
Dashboard │ Grants │ Grantees │ Applications │ Program
```

Applications shows a badge when pending count > 0.

**Admin header bar:**

- Product name → `/admin`
- OpenAI mode badge (`fake` / `live`)
- Signed-in operator email
- Sign out

Admins reach the console via footer link, bookmark, or post–GitHub-sign-in
redirect to `/admin`. No admin entry point in the public header.

## Page sketches

### Dashboard (`/admin`) — primary surface

**Purpose:** At-a-glance program health during an event or between syncs.

**Summary cards (top row):**

| Metric | Source (v1) |
| --- | --- |
| Active grants | Local DB |
| Pending applications | Local DB (0 until B-0006) |
| Total spend (current period) | B-0001 snapshots |
| Total tokens / requests (period) | B-0001 snapshots |
| Pre-registered grantees (eligible, no grant yet) | Local DB |

**Below cards:**

- **Recent activity table** — last N grants with activity: grantee, status,
  period spend, tokens, last activity, sync age. Rows link to grant detail.
- **Needs attention** strip (when data supports it):
  - Highest spend this period
  - Near intended budget (if recorded)
  - Provision failures
  - Stale sync (> threshold)
  - Pending applications count (link to queue)

**Empty / pre-B-0001 state:** Show grant counts and lifecycle stats from local
DB; usage cards display “Sync not configured” or placeholders — not fake zeros.

### Grants (`/admin/grants`)

Sortable table: grantee, status, redacted key, project id, period spend, last
activity, created. Filters: active · revoked · failed · all. Default sort:
recent activity desc (falls back to created desc without usage data).

Row actions: View · Revoke (active only).

### Grant detail (`/admin/grants/[grantId]`)

- Grantee link, status, OpenAI project id, key metadata
- Usage summary for selected period (B-0001)
- Simple usage-over-time chart or bucket table (optional v1 — table is enough)
- Lifecycle timeline: provisioned, revoked, sync events, admin actions
- **Revoke** with confirmation (reuse existing server action)

### Grantees (`/admin/grantees`)

Directory: name, email, provenance (`imported` / `application_approved` /
`admin_added`), grant status summary, last activity. Search by email/name.

### Grantee detail (`/admin/grantees/[granteeId]`)

- Profile + provenance
- Grants list (current + history)
- Related applications and claim-token state (B-0006)
- Admin actions: add note (later), revoke active grant, resend claim link (B-0003)

### Applications (`/admin/applications`) — B-0006

Queue for unmatched signup submissions. Columns: email, name, referral, intended
use, submitted, status. Bulk approve/reject where safe. Approval does **not**
mint a key — enqueues claim email.

Badge on nav when pending count > 0.

### Program (`/admin/program`)

Infrequent setup — **not** the admin home.

- **Intake:** open / closed toggle (singleton `program_settings`)
- **Request cap** and claim-link TTL
- **Allowlist import** (CSV — moved from current home page)
- **Public QR / join URL** display + copy (single program link)
- **Legacy program invites** (steel-thread `/redeem/[token]`) — secondary
  section or collapsible “Advanced / fallback” so the happy path is one QR

---

Public site — mobile-friendly, no nav:

```
┌──────────────────────────────┐
│ Beloved AI Grants            │  ← branding only, optional
├──────────────────────────────┤
│                              │
│   (join / claim / redeem     │
│    single-task content)      │
│                              │
├──────────────────────────────┤
│              Admin           │  ← footer link, muted
└──────────────────────────────┘
```

Admin console — desktop-first, top nav:
┌─────────────────────────────────────────────────────────────┐
│ Beloved Admin          [live]  operator@…          Sign out │
├─────────────────────────────────────────────────────────────┤
│ Dashboard │ Grants │ Grantees │ Applications │ Program      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Active  │ │ Pending │ │ Spend   │ │ Tokens  │  …        │
│  │   42    │ │ apps  3 │ │ $128.40 │ │ 1.2M    │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  Synced 4 min ago · Period: Aug 2026                        │
│                                                             │
│  Recent activity                          Needs attention   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ grantee · spend · last active · → detail             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation phases

| Phase | Delivers | Depends on |
| --- | --- | --- |
| **A — Shell** | `(admin)` layout, top nav, auth gate; public layout with footer admin link (remove header Admin); relocate existing UI to `/admin/program` + `/admin/grants` | — |
| **B — Dashboard skeleton** | Summary cards from local DB; empty usage placeholders; recent grants table | Phase A |
| **C — Usage metrics** | Real spend/tokens/activity on dashboard + grant views | B-0001, B-0002 |
| **D — Applications** | Review queue page + nav badge | B-0006, B-0003 |
| **E — Detail pages** | Grant + grantee drill-down with timeline | B-0001 (for usage on grant detail) |

Phase A–B is the **rewrite** even before usage ingestion ships. Phases C–E fill
in data and B-0006 flows without restructuring again.

---

## Relationship to existing backlog

| Item | Role in new console |
| --- | --- |
| **B-0001** | Feeds metrics, activity timestamps, sync freshness |
| **B-0002** | Dashboard + grant list/detail **content** spec; folded into this IA |
| **B-0003** | Claim/resend email from grantee detail and application approval |
| **B-0006** | `/admin/applications` + intake fields on `/admin/program` |
| **B-0007** | **This rewrite** — routes, layout, navigation, page split |
| **B-0008** | MCP admin control plane — may own mutations; narrows how much CRUD UI this console needs |

---

## Locked decisions

| Topic | Decision |
| --- | --- |
| Public nav | **None** — task-focused pages; branding optional |
| Admin entry (public) | **Footer link** only — not in header |
| Admin nav pattern | **Top nav** — flat horizontal items |
| Admin viewport | **Desktop / large screen** — dense tables OK |
| Public viewport | **Mobile-friendly** — grantee flows at events |
| Route map | Dashboard · Grants · Grantees · Applications · Program |
| Default admin landing | `/admin` dashboard |

## Open questions

1. **Default metrics period:** Calendar month vs rolling 7/30 days vs
   operator-selectable on dashboard?

2. **Legacy invites:** Keep `/redeem/[token]` admin UI under Program →
   Advanced, or hide until someone asks?

3. **Org-level ceiling:** Show foundation-wide OpenAI spend on the dashboard,
   or only aggregated grant spend we attribute?

4. **Dashboard default sort for “recent activity”:** Last API usage (B-0001) vs
   last provision/revoke event (available now)?

5. **Grantee list scope:** All imported emails (recommended) vs only people with
   at least one grant?

---

## Ready to implement

- [x] Route map and top nav approved
- [x] Public chrome: no nav, footer admin link
- [x] Admin chrome: desktop-first top nav
- [ ] Dashboard metric set for v1 (with and without B-0001)
- [ ] Where steel-thread invite UI lives (Program advanced vs remove)
- [ ] Phase A–B scope for first PR (shell + relocated pages + skeleton dashboard)

Implement via [B-0007](./backlog/B-0007-admin-console-rewrite.md) and retire the
monolithic `src/app/admin/page.tsx` structure.
