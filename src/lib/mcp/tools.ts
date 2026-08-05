import * as z from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { absoluteUrl } from "@/lib/app-url";
import { getDb } from "@/lib/db/client";
import { ClaimError, issueClaimLink } from "@/lib/grants/claims";
import {
  findGranteeByEmail,
  listGrantees,
  listGrants,
  removeGrantee,
  upsertGrantee,
} from "@/lib/grants/grantees";
import { createProgramInvite } from "@/lib/grants/invites";
import { listProgramInvites } from "@/lib/grants/list-invites";
import { revokeGrant } from "@/lib/grants/revoke";
import { errorToolResult, jsonToolResult } from "./result";

function toolError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unexpected tool error.";
  return errorToolResult(message);
}

/** Phase C/D placeholders until B-0006 / B-0001 land. */
function deferredTool(ticket: string, feature: string) {
  return errorToolResult(
    `${feature} is not available yet (depends on ${ticket}).`,
  );
}

export function registerAdminTools(server: McpServer, actor: string) {
  server.registerTool(
    "list_grantees",
    {
      title: "List grantees",
      description:
        "List allowlisted grantees with live grant summary. Use this to reconcile bulk lists after parsing a CSV locally.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .optional()
          .describe("Max rows (default 200)"),
      },
    },
    async ({ limit }) => {
      try {
        const rows = await listGrantees(getDb(), limit ?? 200);
        return jsonToolResult({ grantees: rows, count: rows.length });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "upsert_grantee",
    {
      title: "Upsert grantee",
      description:
        "Add or update one allowlisted grantee by email. For bulk CSV imports, parse the file locally and call this once per row.",
      inputSchema: {
        name: z.string().min(1).describe("Grantee display name"),
        email: z.string().email().describe("Grantee email"),
      },
    },
    async ({ name, email }) => {
      try {
        const result = await upsertGrantee(getDb(), {
          name,
          email,
          actor,
          toolName: "upsert_grantee",
        });
        return jsonToolResult(result);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "remove_grantee",
    {
      title: "Remove grantee",
      description:
        "Remove an allowlisted grantee by email. Fails if the grantee has any grant history.",
      inputSchema: {
        email: z.string().email().describe("Grantee email to remove"),
      },
    },
    async ({ email }) => {
      try {
        const result = await removeGrantee(getDb(), {
          email,
          actor,
          toolName: "remove_grantee",
        });
        return jsonToolResult(result);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "list_grants",
    {
      title: "List grants",
      description:
        "List grants with status, redacted key, and OpenAI project id.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .optional()
          .describe("Max rows (default 200)"),
      },
    },
    async ({ limit }) => {
      try {
        const rows = await listGrants(getDb(), limit ?? 200);
        return jsonToolResult({ grants: rows, count: rows.length });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "send_claim_link",
    {
      title: "Send claim link",
      description:
        "Email a short-lived claim link to an allowlisted grantee (by email).",
      inputSchema: {
        email: z.string().email().describe("Grantee email"),
      },
    },
    async ({ email }) => {
      try {
        const grantee = await findGranteeByEmail(getDb(), email);
        if (!grantee) {
          return errorToolResult(`Grantee not found: ${email}`);
        }
        const result = await issueClaimLink({
          db: getDb(),
          granteeId: grantee.id,
          actor,
        });
        return jsonToolResult({
          email: result.email,
          claimTokenId: result.claimTokenId,
          mailMode: result.mailMode,
          expiresAt: result.expiresAt.toISOString(),
        });
      } catch (error) {
        if (error instanceof ClaimError) {
          return errorToolResult(error.message);
        }
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "revoke_grant",
    {
      title: "Revoke grant",
      description:
        "Revoke an active grant by id. Requires an explicit reason. Deletes the OpenAI API key.",
      inputSchema: {
        grant_id: z.string().uuid().describe("Grant id"),
        reason: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe("Why this grant is being revoked"),
      },
    },
    async ({ grant_id, reason }) => {
      try {
        const { getOpenAIAdminGateway } = await import("@/lib/openai/client");
        const result = await revokeGrant({
          db: getDb(),
          gateway: getOpenAIAdminGateway(),
          grantId: grant_id,
          actor,
          reason,
        });
        return jsonToolResult({
          grantId: grant_id,
          ...result,
          reason,
          tool: "revoke_grant",
        });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "create_program_invite",
    {
      title: "Create program invite",
      description:
        "Create an expiring, capacity-limited program invite redeem URL.",
      inputSchema: {
        name: z.string().min(1).describe("Invite / program name"),
        expires_at: z
          .string()
          .describe("ISO-8601 expiry timestamp in the future"),
        max_redemptions: z
          .number()
          .int()
          .min(1)
          .max(10_000)
          .describe("Maximum successful redemptions"),
      },
    },
    async ({ name, expires_at, max_redemptions }) => {
      try {
        const expiresAt = new Date(expires_at);
        if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
          return errorToolResult("expires_at must be a future ISO timestamp.");
        }
        const { invite, token } = await createProgramInvite(getDb(), {
          name,
          expiresAt,
          maxRedemptions: max_redemptions,
          actor,
        });
        return jsonToolResult({
          id: invite.id,
          name: invite.name,
          maxRedemptions: invite.maxRedemptions,
          expiresAt: invite.expiresAt.toISOString(),
          redeemUrl: absoluteUrl(`/redeem/${token}`),
        });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "list_program_invites",
    {
      title: "List program invites",
      description: "List program invites with redemption counts.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .optional()
          .describe("Max rows (default 100)"),
      },
    },
    async ({ limit }) => {
      try {
        const invites = await listProgramInvites(getDb(), limit ?? 100);
        return jsonToolResult({ invites, count: invites.length });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  // Phase C — B-0006
  server.registerTool(
    "list_applications",
    {
      title: "List applications",
      description: "List intake applications (requires B-0006).",
      inputSchema: {},
    },
    async () => deferredTool("B-0006", "list_applications"),
  );

  server.registerTool(
    "approve_application",
    {
      title: "Approve application",
      description: "Approve an intake application (requires B-0006).",
      inputSchema: {
        application_id: z.string().describe("Application id"),
      },
    },
    async () => deferredTool("B-0006", "approve_application"),
  );

  server.registerTool(
    "reject_application",
    {
      title: "Reject application",
      description: "Reject an intake application (requires B-0006).",
      inputSchema: {
        application_id: z.string().describe("Application id"),
        reason: z.string().optional().describe("Rejection reason"),
      },
    },
    async () => deferredTool("B-0006", "reject_application"),
  );

  server.registerTool(
    "get_program_status",
    {
      title: "Get program status",
      description: "Read singleton program intake settings (requires B-0006).",
      inputSchema: {},
    },
    async () => deferredTool("B-0006", "get_program_status"),
  );

  server.registerTool(
    "set_intake_open",
    {
      title: "Set intake open",
      description: "Open or close program intake (requires B-0006).",
      inputSchema: {
        open: z.boolean().describe("Whether intake should be open"),
      },
    },
    async () => deferredTool("B-0006", "set_intake_open"),
  );

  // Phase D — B-0001
  server.registerTool(
    "get_usage_summary",
    {
      title: "Get usage summary",
      description:
        "Read-only usage/spend summary for grants (requires B-0001). The web dashboard remains the canonical visualization.",
      inputSchema: {
        grant_id: z
          .string()
          .uuid()
          .optional()
          .describe("Optional grant id to scope the summary"),
      },
    },
    async () => deferredTool("B-0001", "get_usage_summary"),
  );
}
