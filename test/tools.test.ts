import { describe, expect, it } from "vitest";
import { getInput, getOutput, getTemplate, searchInput, searchOutput, searchTemplates, SEARCH_LIMIT, UTM } from "../src/tools.js";

describe("templates.search", () => {
  it.each([
    [{ profession: "speech_pathology" as const }, ["speech-therapy-soap"]],
    [{ profession: "dietetics" as const }, ["nutrition-assessment"]],
    [{ document_type: "intake_form" as const }, ["therapy-intake-form"]],
    [{ document_type: "worksheet" as const }, ["cbt-thought-record"]],
    [{ note_format: "birp" as const }, ["birp-notes"]],
    [{ profession: "psychology_counseling" as const, note_format: "dap" as const }, ["dap-notes"]],
    [{ profession: "occupational_therapy" as const, document_type: "progress_note" as const, note_format: "soap" as const }, ["occupational-therapy-soap"]],
  ])("filters exactly with AND logic: %j", (args, ids) => {
    const r = searchTemplates(args);
    expect(r.results.map((t) => t.id)).toEqual(ids);
    expect(r.available).toBeUndefined();
  });

  it("returns no results plus the available pairs when nothing matches (D7)", () => {
    const r = searchTemplates({ profession: "speech_pathology", document_type: "intake_form" });
    expect(r.results).toEqual([]);
    expect(r.available).toContainEqual({ profession: "speech_pathology", document_type: "progress_note" });
    expect(r.available).toContainEqual({ profession: "psychology_counseling", document_type: "intake_form" });
    expect(r.available).not.toContainEqual({ profession: "speech_pathology", document_type: "intake_form" });
  });

  it("caps results at the search limit", () => {
    expect(searchTemplates({}).results).toHaveLength(SEARCH_LIMIT);
  });

  it("returns summaries only, never section headings or app links", () => {
    const [first] = searchTemplates({ note_format: "soap" }).results;
    expect(Object.keys(first)).not.toContain("section_headings");
    expect(Object.keys(first)).not.toContain("open_in_carepatron_url");
    expect(searchOutput.safeParse(searchTemplates({})).success).toBe(true);
  });
});

describe("input schemas (D2: no path for client details)", () => {
  it("rejects any field that isn't a declared enum", () => {
    expect(searchInput.safeParse({ client_name: "Maria Lopez" }).success).toBe(false);
    expect(searchInput.safeParse({ profession: "physical_therapy", notes: "42yo, low back pain" }).success).toBe(false);
    expect(getInput.safeParse({ template_id: "dap-notes", patient: "John" }).success).toBe(false);
  });

  it("rejects free text in enum fields", () => {
    expect(searchInput.safeParse({ profession: "Maria Lopez" }).success).toBe(false);
    expect(getInput.safeParse({ template_id: "soap note for John" }).success).toBe(false);
  });
});

describe("templates.get", () => {
  it("returns the full detail matching the output schema", () => {
    const t = getTemplate("soap-progress-notes");
    expect(getOutput.parse(t)).toEqual(t);
    expect(t.section_headings).toEqual(["Subjective", "Objective", "Assessment", "Plan"]);
    expect(t.open_in_carepatron_url).toBe(
      `https://app.carepatron.com/Templates?previewTemplateId=e5c6f3e6-0953-4243-996e-810ca8598266&${UTM}`,
    );
  });

  it("uses the confirmed BIRP PDF URL, not the page's broken .pdff link (D5)", () => {
    expect(getTemplate("birp-notes").pdf_url).toBe(`https://www.carepatron.com/files/birp-notes-template.pdf?${UTM}`);
  });

  it("tags outbound site links for attribution", () => {
    const t = getTemplate("dap-notes");
    expect(t.page_url).toBe(`https://www.carepatron.com/templates/dap-notes-template/?${UTM}`);
    expect(new URL(t.pdf_url).searchParams.get("utm_source")).toBe("chatgpt");
  });
});
