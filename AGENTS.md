# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 16 (App Router) app — the "Beloved AI Grants" OpenAI API-key
control plane. It is managed with **bun** (see `packageManager` in
`package.json`); use `bun`/`bun run`, not `npm`/`pnpm`. Standard scripts live in
`package.json` and setup/verification is documented in `README.md` and
`docs/STEEL-THREAD.md`; prefer those instead of duplicating commands here.

The update script already runs `bun install` and creates the local `data/`
directories on VM startup. The notes below are the non-obvious gotchas.

### Running / testing without external services

- No separate database or Docker is needed. The DB is **embedded PGlite** by
  default (files under `PGLITE_DATA_DIR`, default `./data/beloved-grants`); a
  remote Neon/Postgres is used only if `DATABASE_URL` is set.
- Admin auth is GitHub OAuth + `ADMIN_EMAILS`, but **you do not need real OAuth
  credentials** to develop or test. Non-production requests honor a bypass:
  run with `AUTH_TEST_BYPASS=1` (and optionally `AUTH_TEST_EMAIL=...`) to be
  treated as an admin. The bypass is ignored when `NODE_ENV=production`.
- OpenAI provisioning defaults to a deterministic in-memory **fake** gateway.
  Force it with `OPENAI_MODE=fake`; it issues `sk-fake-...` keys with no network
  calls. Live mode requires `OPENAI_ADMIN_KEY` (and the write-gated
  `smoke:openai` script needs `RUN_OPENAI_INTEGRATION=1`).
- Recommended local dev command for exercising the admin console end to end:
  `AUTH_TEST_BYPASS=1 AUTH_TEST_EMAIL=test-admin@example.com OPENAI_MODE=fake bun run dev`.

### Gotchas

- `.env` is gitignored. Copy it once from `.env.example` (`cp .env.example .env`)
  before running the app or migrations.
- **`bun run db:migrate` fails if the `data/` directory does not exist.** PGlite's
  NodeFS only creates the leaf directory, not parents, so a fresh checkout errors
  with `ENOENT ... mkdir '.../data/beloved-grants'`. Ensure `mkdir -p data`
  first (the update script does this; run it manually if migrating into a new
  `PGLITE_DATA_DIR`).
- The Playwright e2e suite (`bun run test:e2e`) starts its **own** dev server via
  `playwright.config.ts` (with the auth bypass + fake OpenAI + `PGLITE_DATA_DIR=./data/e2e`),
  runs migrations itself, and reuses an already-running server on port 3002 if
  present. Chromium must be installed for Playwright (`bunx playwright install chromium`);
  this is part of the VM snapshot and does not need reinstalling each run.
- Unit tests (`bun run test`, vitest) use throwaway in-memory PGlite and touch no
  filesystem or network.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
