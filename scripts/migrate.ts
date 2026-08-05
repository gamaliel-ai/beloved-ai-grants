import "dotenv/config";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { migrate as migrateNeon } from "drizzle-orm/neon-serverless/migrator";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import ws from "ws";
import { resolveMigrationDatabaseUrl } from "./migrate-url";

const migrationsFolder = "./drizzle";

async function main() {
  const databaseUrl = resolveMigrationDatabaseUrl();
  if (databaseUrl) {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: databaseUrl });
    try {
      await migrateNeon(drizzleNeon(pool), { migrationsFolder });
    } finally {
      await pool.end();
    }
    return;
  }

  const dataDir = process.env.PGLITE_DATA_DIR ?? "./data/beloved-grants";
  // PGlite NodeFS creates the leaf dir only; ensure parents exist.
  mkdirSync(dirname(dataDir), { recursive: true });
  const client = new PGlite(dataDir);
  try {
    await migratePglite(drizzlePglite(client), { migrationsFolder });
  } finally {
    await client.close();
  }
}

await main();
console.log("Database migrations complete.");
