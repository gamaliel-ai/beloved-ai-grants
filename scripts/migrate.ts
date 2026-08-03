import "dotenv/config";
import { PGlite } from "@electric-sql/pglite";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { migrate as migrateNeon } from "drizzle-orm/neon-serverless/migrator";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import ws from "ws";

const migrationsFolder = "./drizzle";

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
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

  const client = new PGlite(
    process.env.PGLITE_DATA_DIR ?? "./data/beloved-grants",
  );
  try {
    await migratePglite(drizzlePglite(client), { migrationsFolder });
  } finally {
    await client.close();
  }
}

await main();
console.log("Database migrations complete.");
