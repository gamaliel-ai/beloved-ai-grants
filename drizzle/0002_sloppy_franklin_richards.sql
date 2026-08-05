CREATE TABLE "mcp_operator_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"label" text,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "mcp_operator_tokens_hash_unique" ON "mcp_operator_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "mcp_operator_tokens_email_idx" ON "mcp_operator_tokens" USING btree ("email");