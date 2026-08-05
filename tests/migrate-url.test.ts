import { describe, expect, it } from "vitest";
import { resolveMigrationDatabaseUrl } from "../scripts/migrate-url";

describe("resolveMigrationDatabaseUrl", () => {
  it("prefers unpooled Neon URL over pooled DATABASE_URL", () => {
    expect(
      resolveMigrationDatabaseUrl({
        DATABASE_URL: "postgres://pooled",
        DATABASE_URL_UNPOOLED: "postgres://unpooled",
        POSTGRES_URL_NON_POOLING: "postgres://non-pooling",
      }),
    ).toBe("postgres://unpooled");
  });

  it("falls back to POSTGRES_URL_NON_POOLING then DATABASE_URL", () => {
    expect(
      resolveMigrationDatabaseUrl({
        DATABASE_URL: "postgres://pooled",
        POSTGRES_URL_NON_POOLING: "postgres://non-pooling",
      }),
    ).toBe("postgres://non-pooling");

    expect(
      resolveMigrationDatabaseUrl({
        DATABASE_URL: "postgres://pooled",
      }),
    ).toBe("postgres://pooled");
  });

  it("returns undefined when no URL is set", () => {
    expect(resolveMigrationDatabaseUrl({})).toBeUndefined();
  });
});
