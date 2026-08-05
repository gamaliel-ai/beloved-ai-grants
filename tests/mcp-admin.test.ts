import { afterEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import {
  authenticateMcpBearer,
  createMcpOperatorToken,
  McpAuthError,
} from "@/lib/auth/mcp-tokens";
import { auditEvents, grantees } from "@/lib/db/schema";
import {
  listGrants,
  removeGrantee,
  upsertGrantee,
} from "@/lib/grants/grantees";
import { createAdminMcpServer } from "@/lib/mcp/server";
import { migratedTestDb } from "./helpers/database";

const originalBypass = process.env.AUTH_TEST_BYPASS;
const originalTestEmail = process.env.AUTH_TEST_EMAIL;
const originalTestToken = process.env.MCP_TEST_TOKEN;

afterEach(() => {
  process.env.AUTH_TEST_BYPASS = originalBypass;
  process.env.AUTH_TEST_EMAIL = originalTestEmail;
  process.env.MCP_TEST_TOKEN = originalTestToken;
});

describe("MCP operator tokens", () => {
  it("rejects missing bearer tokens", async () => {
    const { db, client } = await migratedTestDb();
    try {
      await expect(authenticateMcpBearer(db, null)).rejects.toBeInstanceOf(
        McpAuthError,
      );
    } finally {
      await client.close();
    }
  });

  it("accepts MCP_TEST_TOKEN under AUTH_TEST_BYPASS", async () => {
    process.env.AUTH_TEST_BYPASS = "1";
    process.env.AUTH_TEST_EMAIL = "test-admin@example.com";
    process.env.MCP_TEST_TOKEN = "test-mcp-token";

    const { db, client } = await migratedTestDb();
    try {
      await expect(
        authenticateMcpBearer(db, "Bearer test-mcp-token"),
      ).resolves.toBe("test-admin@example.com");
    } finally {
      await client.close();
    }
  });

  it("mints and authenticates a hashed DB token for an allowlisted actor", async () => {
    delete process.env.AUTH_TEST_BYPASS;
    delete process.env.MCP_TEST_TOKEN;

    const { db, client } = await migratedTestDb();
    try {
      const created = await createMcpOperatorToken(db, {
        actor: "lewiscirne@mac.com",
        label: "unit",
      });
      await expect(
        authenticateMcpBearer(db, `Bearer ${created.token}`),
      ).resolves.toBe("lewiscirne@mac.com");
    } finally {
      await client.close();
    }
  });
});

describe("grantee domain helpers", () => {
  it("upserts and removes a grantee with audit events", async () => {
    const { db, client } = await migratedTestDb();
    try {
      const inserted = await upsertGrantee(db, {
        name: "Ada Lovelace",
        email: "ada@example.com",
        actor: "lewiscirne@mac.com",
        toolName: "upsert_grantee",
      });
      expect(inserted.change).toBe("inserted");

      const unchanged = await upsertGrantee(db, {
        name: "Ada Lovelace",
        email: "ada@example.com",
        actor: "lewiscirne@mac.com",
        toolName: "upsert_grantee",
      });
      expect(unchanged.change).toBe("unchanged");

      const removed = await removeGrantee(db, {
        email: "ada@example.com",
        actor: "lewiscirne@mac.com",
        toolName: "remove_grantee",
      });
      expect(removed.email).toBe("ada@example.com");

      const remaining = await db.select().from(grantees);
      expect(remaining).toHaveLength(0);

      const audits = await db
        .select()
        .from(auditEvents)
        .where(eq(auditEvents.actor, "lewiscirne@mac.com"));
      expect(audits.map((row) => row.action)).toEqual(
        expect.arrayContaining(["grantee.upserted", "grantee.removed"]),
      );
    } finally {
      await client.close();
    }
  });
});

describe("MCP admin tools", () => {
  it("runs upsert_grantee and list_grants for an authenticated actor", async () => {
    process.env.OPENAI_MODE = "fake";
    const { db, client } = await migratedTestDb();

    const globals = globalThis as typeof globalThis & {
      belovedDb?: typeof db;
    };
    const previousDb = globals.belovedDb;
    globals.belovedDb = db;

    try {
      const server = createAdminMcpServer("lewiscirne@mac.com");
      const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();
      const mcpClient = new Client({ name: "test-client", version: "0.0.0" });

      await Promise.all([
        server.connect(serverTransport),
        mcpClient.connect(clientTransport),
      ]);

      const upsert = await mcpClient.callTool({
        name: "upsert_grantee",
        arguments: {
          name: "Grace Hopper",
          email: "grace@example.com",
        },
      });
      expect(upsert.isError).toBeFalsy();

      const listed = await mcpClient.callTool({
        name: "list_grants",
        arguments: {},
      });
      expect(listed.isError).toBeFalsy();
      const listedText = (listed.content as { type: string; text: string }[])[0]
        ?.text;
      expect(listedText).toContain('"grants"');
      expect(await listGrants(db)).toEqual([]);

      const rows = await db.select().from(grantees);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.email).toBe("grace@example.com");

      const revokeMissing = await mcpClient.callTool({
        name: "revoke_grant",
        arguments: {
          grant_id: "00000000-0000-4000-8000-000000000099",
          reason: "cleanup",
        },
      });
      expect(revokeMissing.isError).toBeTruthy();

      await mcpClient.close();
      await server.close();
    } finally {
      globals.belovedDb = previousDb;
      await client.close();
    }
  });
});
