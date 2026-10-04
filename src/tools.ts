import type { McpServer } from "@modelcontextprotocol/server";
import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import * as z from "zod/v4";
import {
  DOCUMENT_TYPES,
  NOTE_FORMATS,
  PROFESSIONS,
  TEMPLATES,
  TEMPLATE_IDS,
  openInCarepatronUrl,
  type DocumentType,
  type NoteFormat,
  type Profession,
  type Template,
} from "./catalog.js";

// Bump the version on card changes: ChatGPT caches resources by URI.
export const CARD_URI = "ui://carepatron/template-card-v3.html";
export const SEARCH_LIMIT = 5;

// Read-only lookups over a fixed catalog (eng review D1, D2).
const ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
  idempotentHint: true,
} as const;

// Enum-only inputs: no field can carry client or patient details (eng review D2).
export const searchInput = z.strictObject({
  profession: z.enum(PROFESSIONS).optional().describe("Clinician's profession, e.g. speech_pathology"),
  document_type: z.enum(DOCUMENT_TYPES).optional().describe("Kind of document, e.g. progress_note or intake_form"),
  note_format: z.enum(NOTE_FORMATS).optional().describe("Progress note format: soap, dap or birp"),
});

export const getInput = z.strictObject({
  template_id: z.enum(TEMPLATE_IDS).describe("Template id from templates.search"),
});

const summary = z.object({
  id: z.string(),
  title: z.string(),
  professions: z.array(z.string()),
  document_type: z.string(),
  note_format: z.string().optional(),
  purpose: z.string(),
  page_url: z.string(),
});

export const searchOutput = z.object({
  results: z.array(summary),
  available: z.array(z.object({ profession: z.string(), document_type: z.string() })).optional(),
});

export const getOutput = summary.extend({
  section_headings: z.array(z.string()),
  open_in_carepatron_url: z.string(),
  pdf_url: z.string(),
  last_verified: z.string(),
});

export type SearchArgs = { profession?: Profession; document_type?: DocumentType; note_format?: NoteFormat };
export type SearchResult = z.infer<typeof searchOutput>;
export type TemplateDetail = z.infer<typeof getOutput>;

// Attribution for links that leave ChatGPT, so Carepatron can see this channel in analytics.
// The catalog keeps clean URLs; tags are added only to what the user sees.
export const UTM = "utm_source=chatgpt&utm_medium=plugin&utm_campaign=templates";
export function withUtm(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}${UTM}`;
}

function toSummary(t: Template) {
  return {
    id: t.id,
    title: t.title,
    professions: t.professions,
    document_type: t.document_type,
    ...(t.note_format ? { note_format: t.note_format } : {}),
    purpose: t.purpose,
    page_url: withUtm(t.page_url),
  };
}

function availablePairs() {
  const seen = new Set<string>();
  const pairs: { profession: string; document_type: string }[] = [];
  for (const t of TEMPLATES) {
    for (const profession of t.professions) {
      const key = `${profession}|${t.document_type}`;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({ profession, document_type: t.document_type });
      }
    }
  }
  return pairs;
}

// Exact AND match. No relaxation: zero hits return what exists instead (eng review D7).
export function searchTemplates(args: SearchArgs): SearchResult {
  const results = TEMPLATES.filter(
    (t) =>
      (!args.profession || t.professions.includes(args.profession)) &&
      (!args.document_type || t.document_type === args.document_type) &&
      (!args.note_format || t.note_format === args.note_format),
  )
    .slice(0, SEARCH_LIMIT)
    .map(toSummary);
  return results.length > 0 ? { results } : { results, available: availablePairs() };
}

export function getTemplate(id: string): TemplateDetail {
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown template_id: ${id}`);
  return {
    ...toSummary(t),
    section_headings: t.section_headings,
    open_in_carepatron_url: openInCarepatronUrl(t),
    pdf_url: withUtm(t.pdf_url),
    last_verified: t.last_verified,
  };
}

function searchText(r: SearchResult): string {
  if (r.results.length === 0) {
    const pairs = r.available!.map((p) => `${p.profession} / ${p.document_type}`).join("; ");
    return `No exact match in the Carepatron template catalog. Available: ${pairs}.`;
  }
  return [
    ...r.results.map((t) => `- ${t.title} (id: ${t.id}): ${t.purpose} ${t.page_url}`),
    `Call templates.get with the best match's id to show the user the template card with its Open in Carepatron button.`,
  ].join("\n");
}

// The card already shows sections and links; this text is the fallback when it can't render.
function detailText(t: TemplateDetail): string {
  return [
    `Shown to the user as a Carepatron template card. Don't repeat the sections or write out a separate template; one short sentence is enough.`,
    `${t.title}: ${t.purpose}`,
    `Sections: ${t.section_headings.join(", ")}`,
    `Open in Carepatron: ${t.open_in_carepatron_url}`,
    `Template page: ${t.page_url}`,
    `PDF: ${t.pdf_url}`,
  ].join("\n");
}

// Logs tool name and enum arguments only; inputs can't contain prompts or client details.
function logCall(tool: string, args: unknown) {
  console.log(JSON.stringify({ tool, args }));
}

export function registerTools(server: McpServer) {
  server.registerTool(
    "templates.search",
    {
      title: "Find Carepatron templates",
      description:
        "Use this when a clinician asks for a blank clinical document template, such as a SOAP, DAP or BIRP note, intake form, treatment plan, evaluation or client worksheet, or asks for Carepatron templates. " +
        "Also use it when a clinician asks you to write or draft clinical documentation such as a session note, intake or treatment plan: offer the matching blank Carepatron template alongside your own answer, choosing only the note format, document type and profession. " +
        "Do not use for clinical advice, diagnosis, treatment decisions or interpreting scores. " +
        "Never pass names, dates, symptoms or any client details; the only inputs are profession, document type and note format.",
      inputSchema: searchInput,
      outputSchema: searchOutput,
      annotations: ANNOTATIONS,
      _meta: {
        "openai/toolInvocation/invoking": "Searching Carepatron templates",
        "openai/toolInvocation/invoked": "Found Carepatron templates",
      },
    },
    async (args) => {
      logCall("templates.search", args);
      const result = searchTemplates(args);
      return { structuredContent: result, content: [{ type: "text", text: searchText(result) }] };
    },
  );

  registerAppTool(
    server,
    "templates.get",
    {
      title: "Show a Carepatron template",
      description:
        "Use this when the user has picked a Carepatron template, or templates.search returned one clear match, and wants its structure or a link to open it in Carepatron. " +
        "The card it shows already lists every section and has an Open in Carepatron button, so reply with one short sentence and do not write out a separate copy of the template. " +
        "Do not use to give clinical guidance or handle any client information.",
      inputSchema: getInput,
      outputSchema: getOutput,
      annotations: ANNOTATIONS,
      _meta: {
        ui: { resourceUri: CARD_URI },
        "openai/outputTemplate": CARD_URI,
        "openai/toolInvocation/invoking": "Opening Carepatron template",
        "openai/toolInvocation/invoked": "Carepatron template ready",
      },
    },
    async (args) => {
      logCall("templates.get", args);
      const detail = getTemplate(args.template_id);
      return { structuredContent: detail, content: [{ type: "text", text: detailText(detail) }] };
    },
  );
}
