# API grant steel thread

Status: **implemented; local verification complete** (claim-link path added)

## Included

1. An administrator signs in with GitHub. The hardcoded admin email allowlist
   is checked on sign-in, page load, and every mutation (web + MCP).
2. The administrator manages the allowlist via **MCP** (`upsert_grantee` /
   `list_grantees`). Agents parse CSV locally and loop upserts — there is no
   CSV import tool. See [MCP-ADMIN.md](./MCP-ADMIN.md).
3. **Claim links (primary inbox proof):**
   - Admin sends a claim link via MCP `send_claim_link`, or a visitor submits
     an allowlisted email at `/join`.
   - App creates a hashed, single-use, 48h `claim_tokens` row and sends mail
     via Resend (or the in-process **fake** outbox when `RESEND_API_KEY` is
     missing or `APP_URL` is local).
   - Visitor opens `/claim/[token]` and claims; the app provisions an OpenAI
     project/service account/key and shows the secret once. No API key is
     emailed.
4. **Program invite fallback:** Admin creates an expiring, capacity-limited
   invite URL via MCP `create_program_invite`. Visitor opens `/redeem/[token]`,
   enters an allowlisted email, and receives a key the same way (allowlist
   match only — no inbox proof).
5. The administrator can list and revoke grants (MCP `revoke_grant` or
   emergency revoke on `/admin`). Revoke deletes the service account (the
   supported boundary for its keys), archives the project, and updates the
   local mirror.

## Deliberate limitations

- Unmatched `/join` emails do not yet get an application form (see B-0006).
- Live Resend delivery needs a verified sending domain (From is derived as
  `grants@{APP_URL host}` in code — not an env var).
- Lifecycle notices (near-limit, revoke) and delivery admin UI remain open
  under B-0003.
- Project and organization hard spend limits are supported by OpenAI but are
  not configured by this steel thread.
- QR image generation, key rotation, usage sync/dashboard, and alerts are
  deferred.
- Full API-key values are never persisted or logged.

## Config rule

Env vars are for **secrets** and the public hostname (`APP_URL`) only. Product
constants (sender local-part, claim TTL, subjects) and derived behavior (fake
vs live mail) live in code — no `EMAIL_MODE` (or similar) flags.

## Run locally

```sh
bun install
mkdir -p data
bun run db:migrate
AUTH_TEST_BYPASS=1 AUTH_TEST_EMAIL=test-admin@example.com MCP_TEST_TOKEN=test-mcp-token bun run dev
```

PGlite writes under `PGLITE_DATA_DIR` (default `./data/beloved-grants`). Set
`DATABASE_URL` for hosted Postgres/Neon.

Admin authentication requires `AUTH_SECRET` and `AUTH_GITHUB_SECRET` (or the
non-production auth bypass above). The GitHub OAuth client ID and admin email
allowlist are hardcoded in source. `APP_URL` defaults to
`http://localhost:3002` and is used for invite and claim absolute URLs.
Optional `MCP_TEST_TOKEN` is accepted by `/api/mcp` when bypass is on — see
[MCP-ADMIN.md](./MCP-ADMIN.md).

Optional secrets:

- `OPENAI_ADMIN_KEY` — live OpenAI Admin API; without it, the fake gateway is
  used (`OPENAI_MODE=fake` can force fake when a key is present).
- `RESEND_API_KEY` — live Resend; without it (or with a local `APP_URL`), mail
  goes to the fake outbox.

## Verification

```sh
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

The live OpenAI lifecycle test is write-gated and always attempts cleanup:

```sh
RUN_OPENAI_INTEGRATION=1 bun run smoke:openai
```

It creates a throwaway project and service account, calls `OPENAI_SMOKE_MODEL`
once with the issued key, then deletes the service account and archives the
project in `finally`.
