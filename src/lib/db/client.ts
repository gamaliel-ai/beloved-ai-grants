import { PGlite } from "@electric-sql/pglite";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import {
  drizzle as drizzlePglite,
  type PgliteDatabase,
} from "drizzle-orm/pglite";
import ws from "ws";
import * as schema from "./schema";

export type AppDatabase = PgliteDatabase<typeof schema>;

type GlobalDatabase = typeof globalThis & {
  belovedDb?: AppDatabase;
  belovedPglite?: PGlite;
  belovedNeonPool?: Pool;
};

const globals = globalThis as GlobalDatabase;

function createDatabase(): AppDatabase {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: databaseUrl });
    globals.belovedNeonPool = pool;
    return drizzleNeon(pool, { schema }) as unknown as AppDatabase;
  }

  const dataDir = process.env.PGLITE_DATA_DIR ?? "./data/beloved-grants";
  const client = new PGlite(dataDir);
  globals.belovedPglite = client;
  return drizzlePglite(client, { schema });
}

export function getDb(): AppDatabase {
  if (!globals.belovedDb) {
    globals.belovedDb = createDatabase();
  }
  return globals.belovedDb;
}

export function createTestDb(client = new PGlite()) {
  return {
    client,
    db: drizzlePglite(client, { schema }),
  };
}
