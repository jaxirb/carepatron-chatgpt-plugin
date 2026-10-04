import { createMcpHandler } from "@modelcontextprotocol/server";
import cardHtml from "../web/card.html";
import { buildMcpServer } from "./mcp.js";

// Cloudflare Worker entry point: the hosted equivalent of src/server.ts.
// Same routes and the same stateless handler (a fresh server per request).
const handler = createMcpHandler(() => buildMcpServer(cardHtml));

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/healthz") return new Response("ok", { headers: { "content-type": "text/plain" } });
    if (pathname !== "/mcp") return new Response(null, { status: 404 });
    return handler.fetch(request);
  },
};
