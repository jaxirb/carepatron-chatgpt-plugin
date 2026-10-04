import { createServer, type Server } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { hostHeaderValidation, toNodeHandler } from "@modelcontextprotocol/node";
import { buildMcpServer } from "./mcp.js";

// Node entry point, used for local development behind ngrok. src/worker.ts is the hosted equivalent.

const CARD_HTML = readFileSync(fileURLToPath(new URL("../web/card.html", import.meta.url)), "utf8");

// Stateless: a fresh server per request, GET/DELETE answered 405 (eng review D6).
export function createHttpServer(allowedHosts: string[]): Server {
  const handler = toNodeHandler(createMcpHandler(() => buildMcpServer(CARD_HTML)));
  const validateHost = hostHeaderValidation(["localhost", "127.0.0.1", "[::1]", ...allowedHosts]);
  return createServer((req, res) => {
    // Plain split, not new URL(): a path like "//[" makes the URL parser throw and would crash the process.
    const path = (req.url ?? "/").split("?")[0];
    if (path === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain" }).end("ok");
      return;
    }
    if (path !== "/mcp") {
      res.writeHead(404).end();
      return;
    }
    if (!validateHost(req, res)) return;
    void handler(req, res);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 8787);
  // PUBLIC_HOST is the ngrok dev domain, e.g. abc123.ngrok-free.dev.
  const publicHost = process.env.PUBLIC_HOST;
  if (!publicHost) console.warn("PUBLIC_HOST not set: only localhost requests will be accepted.");
  // Loopback only: ngrok connects locally, so nothing else on the network needs to reach this.
  createHttpServer(publicHost ? [publicHost] : []).listen(port, "127.0.0.1", () => {
    console.log(`Carepatron templates MCP server on http://localhost:${port}/mcp`);
  });
}
