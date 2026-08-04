CREATE TABLE "claim_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_hash" text NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grantee_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"provider_message_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grants" ALTER COLUMN "invite_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "grants" ADD COLUMN "claim_token_id" uuid;--> statement-breakpoint
ALTER TABLE "claim_tokens" ADD CONSTRAINT "claim_tokens_grantee_id_grantees_id_fk" FOREIGN KEY ("grantee_id") REFERENCES "public"."grantees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "claim_rate_limits_bucket_unique" ON "claim_rate_limits" USING btree ("subject_hash","window_started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "claim_tokens_token_hash_unique" ON "claim_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "claim_tokens_grantee_idx" ON "claim_tokens" USING btree ("grantee_id");--> statement-breakpoint
ALTER TABLE "grants" ADD CONSTRAINT "grants_claim_token_id_claim_tokens_id_fk" FOREIGN KEY ("claim_token_id") REFERENCES "public"."claim_tokens"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "grants_claim_token_idx" ON "grants" USING btree ("claim_token_id");