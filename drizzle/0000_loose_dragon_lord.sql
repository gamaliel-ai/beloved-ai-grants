CREATE TYPE "public"."api_key_status" AS ENUM('active', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."grant_status" AS ENUM('provisioning', 'active', 'provision_failed', 'revoked');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grant_id" uuid NOT NULL,
	"openai_service_account_id" text NOT NULL,
	"openai_api_key_id" text NOT NULL,
	"redacted_value" text NOT NULL,
	"status" "api_key_status" DEFAULT 'active' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grantees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grantees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grantee_id" uuid NOT NULL,
	"invite_id" uuid NOT NULL,
	"status" "grant_status" DEFAULT 'provisioning' NOT NULL,
	"openai_project_id" text,
	"intended_budget_cents" integer,
	"provision_error" text,
	"activated_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"token_hash" text NOT NULL,
	"max_redemptions" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_by_email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redeem_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"subject_hash" text NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_grant_id_grants_id_fk" FOREIGN KEY ("grant_id") REFERENCES "public"."grants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grants" ADD CONSTRAINT "grants_grantee_id_grantees_id_fk" FOREIGN KEY ("grantee_id") REFERENCES "public"."grantees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grants" ADD CONSTRAINT "grants_invite_id_program_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."program_invites"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_rate_limits" ADD CONSTRAINT "redeem_rate_limits_invite_id_program_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."program_invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_openai_id_unique" ON "api_keys" USING btree ("openai_api_key_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_one_active_per_grant" ON "api_keys" USING btree ("grant_id") WHERE "api_keys"."status" = 'active';--> statement-breakpoint
CREATE INDEX "audit_events_entity_idx" ON "audit_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grants_one_live_per_grantee" ON "grants" USING btree ("grantee_id") WHERE "grants"."status" in ('provisioning', 'active');--> statement-breakpoint
CREATE UNIQUE INDEX "grants_openai_project_unique" ON "grants" USING btree ("openai_project_id") WHERE "grants"."openai_project_id" is not null;--> statement-breakpoint
CREATE INDEX "grants_invite_idx" ON "grants" USING btree ("invite_id");--> statement-breakpoint
CREATE UNIQUE INDEX "program_invites_token_hash_unique" ON "program_invites" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "redeem_rate_limits_bucket_unique" ON "redeem_rate_limits" USING btree ("invite_id","subject_hash","window_started_at");