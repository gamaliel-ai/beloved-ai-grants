import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { getDb } from "@/lib/db/client";
import {
  authenticateMcpBearer,
  McpAuthError,
} from "@/lib/auth/mcp-tokens";
import { createAdminMcpServer } from "@/lib/mcp/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorized(message: string) {
  return Response.json(
    { error: message },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Bearer realm="beloved-mcp-admin"',
      },
    },
  );
}

async function handleMcp(request: Request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Authorization, Content-Type, Accept, mcp-session-id, Last-Event-ID, mcp-protocol-version",
        "Access-Control-Expose-Headers":
          "mcp-session-id, mcp-protocol-version",
      },
    });
  }

  let actor: string;
  try {
    actor = await authenticateMcpBearer(
      getDb(),
      request.headers.get("authorization"),
    );
  } catch (error) {
    if (error instanceof McpAuthError) {
      return unauthorized(error.message);
    }
    throw error;
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = createAdminMcpServer(actor);
  await server.connect(transport);
  const response = await transport.handleRequest(request);
  // Ensure CORS for MCP clients that probe from browser-like hosts.
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const GET = handleMcp;
export const POST = handleMcp;
export const DELETE = handleMcp;
export const OPTIONS = handleMcp;
