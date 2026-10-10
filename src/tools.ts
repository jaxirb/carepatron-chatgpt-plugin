import type { McpServer } from "@modelcontextprotocol/server";
import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import * as z from "zod/v4";
import { buildChecklist, COUNTRIES, PROFESSION_GROUPS, type Checklist, type Country, type ProfessionGroup } from "./checklist.js";
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
export const CARD_URI = "ui://carepatron/template-card-v4.html";
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

// Enum-only, same guarantee as the template tools: no field can carry a client detail.
export const checklistInput = z.strictObject({
  profession_group: z.enum(PROFESSION_GROUPS).describe("Kind of practice: mental_health, allied_health, dietetics or general"),
  country: z.enum(COUNTRIES).describe("Where the practice operates: US, AU, NZ, GB or CA"),
});

export const checklistOutput = z.object({
  profession_group: z.string(),
  country: z.string(),
  summary: z.string(),
  items: z.array(
    z.object({
      key: z.string(),
      title: z.string(),
      why: z.string(),
      wording: z.string(),
      template_id: z.string().optional(),
    }),
  ),
  caveats: z.array(z.string()),
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
  pdf_url: z.string().optional(),
  next_step: z.string(),
  last_verified: z.string(),
});

// The one thing to do with the document once it's open. Intake forms carry the journey's ask:
// a real client touching the practice's workspace is what separates trials that pay (growth challenge, Oct 2026).
export const NEXT_STEP: Record<DocumentType, string> = {
  intake_form:
    "Open it in Carepatron, add your client's email and click Send. They fill it in on their phone before the first session, and it's in their file when you meet.",
  consent_form:
    "Send it with the intake form. For AI notes or recording, also ask out loud at the start of the session and note the answer.",
  cancellation_policy:
    "Add it to your intake pack and your booking page so every new client agrees to it before the first session.",
  progress_note: "Open it in Carepatron to use it as the draft for your next note.",
  treatment_plan: "Open it in Carepatron and fill it in after the first session.",
  evaluation: "Open it in Carepatron and fill it in during or after the assessment.",
  worksheet: "Open it in Carepatron and share it with the client from their record.",
};

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
    open_in_carepatron_url: withUtm(openInCarepatronUrl(t)),
    ...(t.pdf_url ? { pdf_url: withUtm(t.pdf_url) } : {}),
    next_step: NEXT_STEP[t.document_type],
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
    `Next step: ${t.next_step}`,
    `Open in Carepatron: ${t.open_in_carepatron_url}`,
    `Template page: ${t.page_url}`,
    ...(t.pdf_url ? [`PDF: ${t.pdf_url}`] : []),
  ].join("\n");
}

// Logs tool name and enum arguments only; inputs can't contain prompts or client details.
function checklistText(c: Checklist): string {
  return [
    c.summary,
    "",
    ...c.items.map((i, n) => `${n + 1}. **${i.title}** — ${i.why}\n   Wording to adapt: "${i.wording}"`),
    "",
    ...c.caveats.map((x) => `_${x}_`),
    "",
    "Carepatron's own intake, consent and cancellation templates cover most of this. Ask for one by name and I'll open it for you.",
  ].join("\n");
}

function logCall(tool: string, args: unknown) {
  console.log(JSON.stringify({ tool, args }));
}

export function registerTools(server: McpServer) {
  server.registerTool(
    "templates.search",
    {
      title: "Find Carepatron templates",
      description:
        "Use this when a clinician asks for a blank clinical document template, such as a SOAP, DAP or BIRP note, intake form, consent form (including telehealth and AI note-taking consent), cancellation policy, treatment plan, evaluation or client worksheet, or asks for Carepatron templates. " +
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

  server.registerTool(
    "intake.checklist",
    {
      title: "What a new-client intake pack should include",
      description:
        "Use this when a clinician asks what to include in an intake form or new-client pack, what consent they need, whether they need written consent for AI note-taking or recording a session, or what paperwork to send a new client before the first appointment. " +
        "Returns a checklist with plain-language wording they can adapt, and names the Carepatron templates that cover each item. " +
        "It is general guidance, not legal advice, and the reply says so. " +
        "Do not use it to answer a question about one specific client, to give legal advice, or to decide whether a particular clinician has met their obligations. " +
        "Never pass names or client details; the only inputs are the kind of practice and the country.",
      inputSchema: checklistInput,
      outputSchema: checklistOutput,
      annotations: ANNOTATIONS,
      _meta: {
        "openai/toolInvocation/invoking": "Checking what a new-client pack needs",
        "openai/toolInvocation/invoked": "Intake pack checklist ready",
      },
    },
    async (args) => {
      logCall("intake.checklist", args);
      const checklist = buildChecklist(args.profession_group as ProfessionGroup, args.country as Country);
      return { structuredContent: checklist, content: [{ type: "text", text: checklistText(checklist) }] };
    },
  );

  registerAppTool(
    server,
    "templates.get",
    {
      title: "Show a Carepatron template",
      description:
        "Use this when the user has picked a Carepatron template, or templates.search returned one clear match, and wants its structure or a link to open it in Carepatron. " +
        "The card it shows already lists every section, the next step to take with it, and has an Open in Carepatron button, so reply with one short sentence and do not write out a separate copy of the template. " +
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
