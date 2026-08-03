import "dotenv/config";
import { readFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/pglite/migrator";
import OpenAI from "openai";
import { auditEvents } from "../src/lib/db/schema";
import { createTestDb } from "../src/lib/db/client";
import { importGranteesCsv } from "../src/lib/grants/import-grantees";
import { createProgramInvite } from "../src/lib/grants/invites";
import { redeemGrant } from "../src/lib/grants/redeem";
import { revokeGrant } from "../src/lib/grants/revoke";
import { RealOpenAIAdminGateway } from "../src/lib/openai/real-gateway";

if (process.env.RUN_OPENAI_INTEGRATION !== "1") {
  throw new Error(
    "Refusing live OpenAI writes. Set RUN_OPENAI_INTEGRATION=1 explicitly.",
  );
}

const adminKey = process.env.OPENAI_ADMIN_KEY;
if (!adminKey) throw new Error("OPENAI_ADMIN_KEY is required.");
const model = process.env.OPENAI_SMOKE_MODEL ?? "gpt-5-nano";
const gateway = new RealOpenAIAdminGateway(adminKey);
const { db, client } = createTestDb();
await migrate(db, { migrationsFolder: "./drizzle" });
await importGranteesCsv(
  db,
  await readFile("tests/fixtures/grantees.csv", "utf8"),
);
const { token } = await createProgramInvite(db, {
  name: "Live smoke",
  actor: "smoke-test",
  expiresAt: new Date(Date.now() + 60_000),
  maxRedemptions: 1,
});

let grantId: string | undefined;
let failure: unknown;

try {
  const redemption = await redeemGrant({
    db,
    gateway,
    inviteToken: token,
    email: "lewiscirne@mac.com",
    ipAddress: "127.0.0.1",
  });
  grantId = redemption.grantId;
  const granteeClient = new OpenAI({ apiKey: redemption.secret });
  const response = await granteeClient.responses.create({
    model,
    input: "Reply with exactly: OK",
    max_output_tokens: 64,
    store: false,
  });
  if (!response.id || response.status === "failed") {
    throw new Error("The issued key did not complete a Responses API request.");
  }
  console.log(`Live lifecycle succeeded with model ${model}.`);
} catch (error) {
  failure = error;
} finally {
  if (grantId) {
    try {
      await revokeGrant({
        db,
        gateway,
        grantId,
        actor: "smoke-test",
        reason: "live smoke cleanup",
      });
    } catch (error) {
      failure ??= error;
    }
  }
  const events = await db
    .select({ action: auditEvents.action })
    .from(auditEvents)
    .where(eq(auditEvents.entityType, "grant"));
  const actions = new Set(events.map((event) => event.action));
  if (
    grantId &&
    (!actions.has("grant.provisioned") || !actions.has("grant.revoked"))
  ) {
    failure ??= new Error("Expected provisioning and revoke audit events.");
  }
  await client.close();
  console.log("Live smoke resources were revoked and archived.");
}

if (failure) throw failure;
