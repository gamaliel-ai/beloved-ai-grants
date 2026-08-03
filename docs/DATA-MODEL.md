# Data model — grantees, keys, source of truth

## Grantee

A **grantee** is a person we sponsor — typically a founder with limited resources who receives API access through a program or event.

Minimum fields:

| Field | Notes |
| --- | --- |
| `id` | Our UUID |
| `name` | Display name |
| `email` | Unique enough for login / magic link; normalize lowercase |
| `created_at` / `updated_at` | |
| Optional later | org/company name, country, notes, program tags |

**Relationship to grants:** one-to-many over time, with one `provisioning` or
`active` grant at once in v1. A grant points to one OpenAI project. Keys belong
to the grant so rotation history does not overload the person record.

Optional later: a **Program** / cohort (`Nairobi Summit 2026`) that many grantees belong to, and invites that point at a program. Keep that separate from the person record.

```
ProgramInvite 1──* Grant *──1 Grantee
                       │
                       └──* ApiKey
```

For v1 you can skip `Program` as a table and hang `program_slug` on the invite + grantee if you want less schema.

## Grant

`Grant` is our local sponsorship lifecycle; an OpenAI project is the external
isolation and billing container. They are deliberately not the same entity.

Minimum steel-thread fields:

- `grantee_id`, `invite_id`
- status: `provisioning | active | provision_failed | revoked`
- nullable `openai_project_id`
- activation/revoke timestamps and safe failure/revoke reason
- nullable intended budget (record-only until spend controls are implemented)

The database enforces one `provisioning` or `active` grant per grantee.

## Source of truth

| Concern | Source of truth | Our DB’s job |
| --- | --- | --- |
| Does the key still exist / work? | **OpenAI** (retrieve/list/delete by `key_id`) | Cache status; sync or check-on-action |
| Full secret `sk-…` | **Nowhere after handoff** (OpenAI only returns it once) | Never treat our DB as able to re-show the secret |
| Who is this person? | **Our DB** | Grantee profile |
| Which OpenAI resources belong to them? | **Our DB** links to OpenAI IDs | Foreign keys into OpenAI |
| Spend vs limit | **OpenAI** usage/costs + spend limits; we cache | Snapshots for UI |
| Our revoke reason, invite provenance, labels | **Our DB** | Program-specific metadata |

**Rule:** lifecycle operations (create, revoke, replace) always go through the Admin API first (or in the same transaction mindset: API success → then update local row). Local `status` is a mirror, not an independent authority.

If OpenAI says the key is gone and we still say `active`, a sync job or the next admin action should reconcile.

## Storing the secret (password analogy — with a twist)

OpenAI API keys are like passwords in one way and unlike them in another:

| Password-like | Not password-like |
| --- | --- |
| Never store plaintext at rest | You **cannot** “log in as” the key later from a hash — and you don’t need to |
| Show once at creation | Revoke/replace uses OpenAI’s **`key_id`**, not the secret |
| Optional: hash to detect a pasted leak | Re-display requires **issuing a new key**, not reversing storage |

**Recommended default: do not store the full secret at all.**

On provision:

1. Create service account / API key via Admin API.
2. Show `value` once to the grantee.
3. Persist OpenAI identifiers + `redacted_value` (e.g. `sk-…Ab12`) for UI.
4. Discard plaintext from memory; never write it to the DB or logs.

**Optional** `secret_hash` (HMAC-SHA256 with a server pepper, or Argon2id): only if you want “someone pasted an `sk-…` — is it one of ours?” Without that product need, skip it — less risk, less complexity.

**Do not** encrypt-and-store the full key “so we can show it again.” That recreates a vault of spendable secrets. Prefer **rotate**: delete old key id at OpenAI, create new, show once.

## `ApiKey` row — what to keep beyond `grantee_id`

Think in three layers: **OpenAI pointers**, **mirrored OpenAI fields**, **our metadata**.

### 1. OpenAI pointers (required — how we act on the key)

| Field | Why |
| --- | --- |
| `openai_project_id` | Isolation unit; spend limits; list/retrieve keys |
| `openai_service_account_id` | Owner of the key in the project model |
| `openai_api_key_id` | **Primary handle for revoke/retrieve** (`key_…`) |

These are the join keys to the source of truth. Index `openai_api_key_id` uniquely.

### 2. Mirrored from OpenAI (cache — refresh on sync / after actions)

| Field | Why |
| --- | --- |
| `name` | Label we set at create (e.g. `grantee-uuid` / email slug) |
| `redacted_value` | Safe display (`sk-…`) |
| `openai_created_at` | From OpenAI |
| `openai_last_used_at` | From OpenAI; null if never used |
| `openai_owner_project_access` | `active` / `inactive` if exposed for that key type |
| `last_synced_at` | When we last confirmed against Admin API |

Do not invent a parallel “is_valid” that disagrees with OpenAI without a sync path.

### 3. Our metadata (program — OpenAI does not know this)

| Field | Why |
| --- | --- |
| `grantee_id` | Ownership in our app |
| `status` | Our lifecycle: `pending_provision` \| `active` \| `revoked` \| `replaced` \| `provision_failed` |
| `issued_at` | When we handed it to the human |
| `revoked_at` | When we revoked (local) |
| `revoked_reason` | Optional short note (“rotation”, “abuse”, “ended”, …) |
| `replaced_by_key_id` | Our UUID of the successor key after rotate |
| `replaces_key_id` | Our UUID of the predecessor |
| `invite_id` / `program_slug` | Provenance (which QR/code minted this) |
| `scopes` | JSON/text of scopes we requested at create (if any) |
| `label` | Optional human label (“primary”, “workshop laptop”) |
| `secret_hash` | Optional; see above |
| `created_at` / `updated_at` | Our row timestamps |

Usage totals belong in **`UsageSnapshot`** (or similar) keyed by `openai_project_id` / `api_key_id`, not denormalized forever on the key row — unless you keep a thin `cached_spend_cents_month` updated by sync for list views.

Spend **limits** live on the OpenAI project (source of truth) with optional local `limit_template` / `monthly_limit_cents` as what we *intended* to set, reconciled by sync.

## Rotate / revoke flows

**Revoke**

1. `DELETE` OpenAI project API key by `openai_api_key_id` (and/or disable service account / archive project per policy).
2. Set local `status = revoked`, `revoked_at`, `revoked_reason`.
3. Audit log the action.

**Replace (rotate)**

1. Create new key on same (or new) service account/project.
2. Insert new `ApiKey` row `active`; show secret once.
3. Delete old key at OpenAI; mark old row `replaced`, link `replaced_by_key_id` / `replaces_key_id`.

OpenAI remains authoritative that the old secret no longer works.

## What not to duplicate

- Full prompt logs
- A second billing system (use OpenAI usage/costs)
- Storing Admin API keys in this table (those are env/secrets manager only)

## Sketch (SQL-ish)

```text
grantees (
  id, name, email UNIQUE, created_at, updated_at
)

grants (
  id,
  grantee_id → grantees,
  invite_id → program_invites,
  status,
  openai_project_id UNIQUE NULL,
  intended_budget_cents NULL,
  activated_at, revoked_at, revoked_reason,
  created_at, updated_at
)

api_keys (
  id,                          -- our UUID
  grant_id → grants,
  openai_service_account_id NOT NULL,
  openai_api_key_id NOT NULL UNIQUE,
  name,
  redacted_value,
  openai_created_at,
  openai_last_used_at,
  openai_owner_project_access,
  last_synced_at,
  status,                      -- active | revoked | replaced | …
  issued_at,
  revoked_at,
  revoked_reason,
  replaces_key_id → api_keys,
  replaced_by_key_id → api_keys,
  invite_id NULL,
  scopes NULL,
  label NULL,
  secret_hash NULL,            -- optional
  created_at, updated_at
)
```

## Practical v1 rule

- Grantee = name + email (+ timestamps).
- Grant = local sponsorship lifecycle linked to one external OpenAI project.
- One active grant per grantee and one active `api_keys` row per grant under normal operation; history retained for audit.
- Persist **OpenAI IDs + redacted value + our status/provenance**; discard plaintext.
- Any revoke/replace/path that matters calls OpenAI, then updates the mirror.
