import { parse } from "csv-parse/sync";
import { inArray } from "drizzle-orm";
import * as z from "zod";
import type { AppDatabase } from "@/lib/db/client";
import { grantees } from "@/lib/db/schema";
import { normalizeEmail } from "@/lib/auth/admin-emails";

const csvRow = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Email is invalid"),
});

export type ImportResult = {
  inserted: number;
  updated: number;
  unchanged: number;
};

export async function importGranteesCsv(
  db: AppDatabase,
  csv: string,
): Promise<ImportResult> {
  const input = parse(csv, {
    columns: (headers: string[]) => headers.map((header) => header.trim()),
    bom: true,
    skip_empty_lines: true,
    trim: true,
  }) as unknown[];

  if (input.length === 0) {
    throw new Error("CSV must contain at least one grantee.");
  }

  const rows = input.map((row, index) => {
    const parsed = csvRow.safeParse(row);
    if (!parsed.success) {
      const detail = parsed.error.issues[0]?.message ?? "Invalid row";
      throw new Error(`CSV row ${index + 2}: ${detail}.`);
    }
    return {
      name: parsed.data.name,
      email: normalizeEmail(parsed.data.email),
    };
  });

  const duplicateEmails = rows
    .map((row) => row.email)
    .filter((email, index, all) => all.indexOf(email) !== index);
  if (duplicateEmails.length > 0) {
    throw new Error(`CSV contains duplicate email: ${duplicateEmails[0]}.`);
  }

  const existing = await db
    .select({ email: grantees.email, name: grantees.name })
    .from(grantees)
    .where(inArray(grantees.email, rows.map((row) => row.email)));
  const existingByEmail = new Map(existing.map((row) => [row.email, row.name]));

  const result = rows.reduce<ImportResult>(
    (counts, row) => {
      const existingName = existingByEmail.get(row.email);
      if (existingName === undefined) counts.inserted += 1;
      else if (existingName === row.name) counts.unchanged += 1;
      else counts.updated += 1;
      return counts;
    },
    { inserted: 0, updated: 0, unchanged: 0 },
  );

  await db.transaction(async (tx) => {
    for (const row of rows) {
      await tx
        .insert(grantees)
        .values(row)
        .onConflictDoUpdate({
          target: grantees.email,
          set: {
            name: row.name,
            updatedAt: new Date(),
          },
        });
    }
  });

  return result;
}
