import { McpServer } from "@modelcontextprotocol/server";
import { registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { CARD_URI, registerTools } from "./tools.js";

// Runtime-neutral: shared by the Node server (src/server.ts) and the Cloudflare Worker (src/worker.ts).

// Key rules first: ChatGPT weighs the first 512 characters most.
export const INSTRUCTIONS =
  "Finds blank clinical document templates in Carepatron's public library (SOAP, DAP and BIRP notes, intake forms, treatment plans, evaluations, client worksheets) and links to open them in Carepatron. " +
  "Never send client or patient details to these tools. Do not use them for clinical advice, diagnosis or interpreting scores. " +
  "When a clinician asks you to draft a note or form, also offer the matching blank Carepatron template. " +
  "The template card shows all sections, so don't write out a separate copy.";

const CAREPATRON_ORIGINS = ["https://app.carepatron.com", "https://www.carepatron.com"];
// Google Fonts serves the card's two typefaces (DESIGN.md).
const FONT_ORIGINS = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

export function buildMcpServer(cardHtml: string): McpServer {
  const server = new McpServer({ name: "carepatron-templates", version: "1.0.0" }, { instructions: INSTRUCTIONS });
  registerTools(server);
  registerAppResource(
    server,
    "Carepatron template card",
    CARD_URI,
    { description: "Shows a Carepatron template's sections with a button to open it in Carepatron." },
    async () => ({
      contents: [
        {
          uri: CARD_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: cardHtml,
          _meta: {
            // The card draws its own border, so the host doesn't add one.
            ui: { csp: { connectDomains: [], resourceDomains: FONT_ORIGINS }, prefersBorder: false },
            // openExternal targets must be listed here (legacy ChatGPT key, still required).
            "openai/widgetCSP": { connect_domains: [], resource_domains: FONT_ORIGINS, redirect_domains: CAREPATRON_ORIGINS },
            "openai/widgetDescription":
              "Shows the Carepatron template's title, purpose, profession tags, every section heading, and buttons to open it in Carepatron or view the template page. Don't repeat the sections or write out a separate template; add at most one short sentence.",
          },
        },
      ],
    }),
  );
  return server;
}
