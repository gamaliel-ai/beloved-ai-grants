# API grant steel thread

Status: **implemented; local verification complete**

## Included

1. An administrator signs in with GitHub. `ADMIN_EMAILS` is checked on sign-in, page load, and every mutation.
2. The administrator imports a `name,email` CSV. Import is all-or-nothing and idempotently upserts normalized email addresses.
3. The administrator creates an expiring, capacity-limited program invite. Only a SHA-256 token hash is stored; the URL is shown once.
4. A visitor opens `/redeem/[token]` and enters an allowlisted email.
5. The app rate-limits the attempt, reserves one active grant transactionally, creates an isolated OpenAI project and service account, and shows the API key once.
6. The administrator can list and revoke grants. Revoke deletes the service account (the supported boundary for its keys), archives the project, and updates the local mirror.

## Deliberate limitations

- Email allowlist matching is the only grantee identity check. Magic-link verification with Resend is deferred.
- Project and organization hard spend limits are supported by OpenAI but are not configured by this steel thread.
- QR image generation, key rotation, usage sync/dashboard, alerts, and public requests are deferred.
- Full API-key values are never persisted or logged.

## Run locally

```sh
bun install
bun run db:migrate
bun run dev
```

PGlite writes under `PGLITE_DATA_DIR` (default `./data/beloved-grants`). Set `DATABASE_URL` for hosted Postgres/Neon.

Admin authentication requires `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, and `ADMIN_EMAILS`. `APP_URL` is used to construct invite links.

If `OPENAI_ADMIN_KEY` is present, provisioning is live unless `OPENAI_MODE=fake` is set. Without an Admin key, the deterministic fake gateway is used.

## Verification

```sh
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

The live lifecycle test is write-gated and always attempts cleanup:

```sh
RUN_OPENAI_INTEGRATION=1 bun run smoke:openai
```

It creates a throwaway project and service account, calls `OPENAI_SMOKE_MODEL` once with the issued key, then deletes the service account and archives the project in `finally`.
