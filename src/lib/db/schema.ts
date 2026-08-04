import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const grantStatus = pgEnum("grant_status", [
  "provisioning",
  "active",
  "provision_failed",
  "revoked",
]);

export const apiKeyStatus = pgEnum("api_key_status", [
  "active",
  "revoked",
]);

export const grantees = pgTable("grantees", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  ...timestamps,
});

export const programInvites = pgTable(
  "program_invites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    tokenHash: text("token_hash").notNull(),
    maxRedemptions: integer("max_redemptions").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdByEmail: text("created_by_email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("program_invites_token_hash_unique").on(table.tokenHash),
  ],
);

export const claimTokens = pgTable(
  "claim_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    granteeId: uuid("grantee_id")
      .notNull()
      .references(() => grantees.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdBy: text("created_by").notNull(),
    providerMessageId: text("provider_message_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("claim_tokens_token_hash_unique").on(table.tokenHash),
    index("claim_tokens_grantee_idx").on(table.granteeId),
  ],
);

export const grants = pgTable(
  "grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    granteeId: uuid("grantee_id")
      .notNull()
      .references(() => grantees.id, { onDelete: "restrict" }),
    inviteId: uuid("invite_id").references(() => programInvites.id, {
      onDelete: "restrict",
    }),
    claimTokenId: uuid("claim_token_id").references(() => claimTokens.id, {
      onDelete: "restrict",
    }),
    status: grantStatus("status").default("provisioning").notNull(),
    openaiProjectId: text("openai_project_id"),
    intendedBudgetCents: integer("intended_budget_cents"),
    provisionError: text("provision_error"),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedReason: text("revoked_reason"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("grants_one_live_per_grantee")
      .on(table.granteeId)
      .where(sql`${table.status} in ('provisioning', 'active')`),
    uniqueIndex("grants_openai_project_unique")
      .on(table.openaiProjectId)
      .where(sql`${table.openaiProjectId} is not null`),
    index("grants_invite_idx").on(table.inviteId),
    index("grants_claim_token_idx").on(table.claimTokenId),
  ],
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    grantId: uuid("grant_id")
      .notNull()
      .references(() => grants.id, { onDelete: "restrict" }),
    openaiServiceAccountId: text("openai_service_account_id").notNull(),
    openaiApiKeyId: text("openai_api_key_id").notNull(),
    redactedValue: text("redacted_value").notNull(),
    status: apiKeyStatus("status").default("active").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("api_keys_openai_id_unique").on(table.openaiApiKeyId),
    uniqueIndex("api_keys_one_active_per_grant")
      .on(table.grantId)
      .where(sql`${table.status} = 'active'`),
  ],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_events_entity_idx").on(table.entityType, table.entityId),
  ],
);

export const redeemRateLimits = pgTable(
  "redeem_rate_limits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inviteId: uuid("invite_id")
      .notNull()
      .references(() => programInvites.id, { onDelete: "cascade" }),
    subjectHash: text("subject_hash").notNull(),
    windowStartedAt: timestamp("window_started_at", {
      withTimezone: true,
    }).notNull(),
    attempts: integer("attempts").default(1).notNull(),
  },
  (table) => [
    uniqueIndex("redeem_rate_limits_bucket_unique").on(
      table.inviteId,
      table.subjectHash,
      table.windowStartedAt,
    ),
  ],
);

export const claimRateLimits = pgTable(
  "claim_rate_limits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectHash: text("subject_hash").notNull(),
    windowStartedAt: timestamp("window_started_at", {
      withTimezone: true,
    }).notNull(),
    attempts: integer("attempts").default(1).notNull(),
  },
  (table) => [
    uniqueIndex("claim_rate_limits_bucket_unique").on(
      table.subjectHash,
      table.windowStartedAt,
    ),
  ],
);

export type Grantee = typeof grantees.$inferSelect;
export type Grant = typeof grants.$inferSelect;
export type ProgramInvite = typeof programInvites.$inferSelect;
export type ClaimToken = typeof claimTokens.$inferSelect;
