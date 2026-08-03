import { readFile } from "node:fs/promises";
import { count } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { grantees } from "@/lib/db/schema";
import { importGranteesCsv } from "@/lib/grants/import-grantees";
import { migratedTestDb } from "./helpers/database";

describe("grantee CSV import", () => {
  it("upserts the single test grantee idempotently", async () => {
    const { db, client } = await migratedTestDb();
    try {
      const csv = await readFile("tests/fixtures/grantees.csv", "utf8");

      await expect(importGranteesCsv(db, csv)).resolves.toEqual({
        inserted: 1,
        updated: 0,
        unchanged: 0,
      });
      await expect(importGranteesCsv(db, csv)).resolves.toEqual({
        inserted: 0,
        updated: 0,
        unchanged: 1,
      });

      const [total] = await db.select({ value: count() }).from(grantees);
      expect(Number(total.value)).toBe(1);
      const [grantee] = await db.select().from(grantees);
      expect(grantee).toMatchObject({
        name: "Lewis Cirne",
        email: "lewiscirne@mac.com",
      });
    } finally {
      await client.close();
    }
  });

  it("validates the entire file before writing any row", async () => {
    const { db, client } = await migratedTestDb();
    try {
      const invalid = [
        "name,email",
        "Lewis Cirne,lewiscirne@mac.com",
        "Missing Email,not-an-email",
      ].join("\n");

      await expect(importGranteesCsv(db, invalid)).rejects.toThrow(
        "CSV row 3",
      );
      const [total] = await db.select({ value: count() }).from(grantees);
      expect(Number(total.value)).toBe(0);
    } finally {
      await client.close();
    }
  });
});
