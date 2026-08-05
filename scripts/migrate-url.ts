/** Prefer Neon’s direct (unpooled) URL for DDL when present. */
export function resolveMigrationDatabaseUrl(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const candidates = [
    env.DATABASE_URL_UNPOOLED,
    env.POSTGRES_URL_NON_POOLING,
    env.DATABASE_URL,
  ];
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}
