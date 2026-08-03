import { migrate } from "drizzle-orm/pglite/migrator";
import { createTestDb } from "@/lib/db/client";

export async function migratedTestDb() {
  const result = createTestDb();
  await migrate(result.db, { migrationsFolder: "./drizzle" });
  return result;
}
