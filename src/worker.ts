import { createMcpHandler } from "@modelcontextprotocol/server";
import cardHtml from "../web/card.html";
import landingHtml from "../web/index.html";
import { buildMcpServer } from "./mcp.js";
import { getTemplate } from "./tools.js";
import { TEMPLATE_IDS } from "./catalog.js";

// Cloudflare Worker entry point: the hosted equivalent of src/server.ts.
// Same /mcp handler (a fresh server per request), plus two pages a browser can open:
// / (what this is, how to install it) and /demo (the card, rendered without ChatGPT).
const handler = createMcpHandler(() => buildMcpServer(cardHtml));

const HTML = { "content-type": "text/html; charset=utf-8" };

// The card normally reads window.openai.toolOutput, which only ChatGPT provides.
// For the demo we inject the same shape, so a plain browser renders exactly what a
// clinician sees in ChatGPT. Values are JSON, never interpolated into markup, and the
// id is checked against the catalog first.
// Order matters: the card reads window.openai once at the end of its own script, so the
// injection has to come first. Injecting before </body> leaves the card on "Loading template…".
function demoPage(templateId: string): string {
  const detail = getTemplate(templateId);
  const banner = `<div style="font:14px/1.5 system-ui,sans-serif;max-width:620px;margin:28px auto 14px;padding:0 20px;opacity:.72">
This is the card a clinician sees inside ChatGPT, rendered here so you can look at it without installing anything.
<a href="/" style="color:inherit">About this plugin</a></div>`;
  const inject = `<script>window.openai = { toolOutput: ${JSON.stringify(detail).replace(/</g, "\\u003c")} };</script>`;
  return cardHtml
    .replace("<body>", `<body style="background:#f6f5ef">${inject}${banner}<div style="max-width:620px;margin:0 auto;padding:0 20px 40px">`)
    .replace("</body>", "</div></body>");
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    if (pathname === "/healthz") return new Response("ok", { headers: { "content-type": "text/plain" } });
    if (pathname === "/") return new Response(landingHtml, { headers: HTML });
    if (pathname === "/demo") {
      const id = url.searchParams.get("template") ?? "counseling-intake-form";
      if (!(TEMPLATE_IDS as readonly string[]).includes(id)) return new Response("Unknown template", { status: 404 });
      return new Response(demoPage(id), { headers: HTML });
    }
    if (pathname !== "/mcp") return new Response(null, { status: 404 });
    return handler.fetch(request);
  },
};
