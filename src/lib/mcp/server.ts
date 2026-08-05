import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAdminTools } from "./tools";

export function createAdminMcpServer(actor: string) {
  const server = new McpServer({
    name: "beloved-ai-grants-admin",
    version: "0.1.0",
  });
  registerAdminTools(server, actor);
  return server;
}
