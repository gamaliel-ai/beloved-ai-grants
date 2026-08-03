import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "PGLITE_DATA_DIR=./data/e2e bun run db:migrate && PGLITE_DATA_DIR=./data/e2e AUTH_TEST_BYPASS=1 AUTH_TEST_EMAIL=test-admin@example.com OPENAI_MODE=fake bun run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
