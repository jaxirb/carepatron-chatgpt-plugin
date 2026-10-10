import { describe, expect, it } from "vitest";
import { DOCUMENT_TYPES, NOTE_FORMATS, PROFESSIONS, TEMPLATES, TEMPLATE_IDS } from "../src/catalog.js";
import { searchTemplates } from "../src/tools.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("catalog", () => {
  it("has 18 templates with unique ids and template ids", () => {
    expect(TEMPLATES).toHaveLength(18);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(18);
    expect(new Set(TEMPLATES.map((t) => t.preview_template_id)).size).toBe(18);
    expect(TEMPLATE_IDS).toHaveLength(18);
  });

  it.each(TEMPLATES.map((t) => [t.id, t] as const))("%s has valid links and content", (_id, t) => {
    expect(t.preview_template_id).toMatch(UUID);
    expect(t.page_url).toMatch(/^https:\/\/www\.carepatron\.com\/templates\/[a-z0-9-]+\/$/);
    if (t.pdf_url) expect(t.pdf_url).toMatch(/^https:\/\/www\.carepatron\.com\/files\/[a-z0-9-]+\.pdf$/);
    expect(t.section_headings.length).toBeGreaterThan(0);
    expect(t.section_headings.every((h) => h.trim().length > 0 && h.length <= 60)).toBe(true);
    expect(t.purpose.split(". ")).toHaveLength(1);
    expect(t.last_verified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(t.professions.length).toBeGreaterThan(0);
  });

  it("has an intake form for every profession (the new-client pack)", () => {
    for (const profession of PROFESSIONS) {
      expect(searchTemplates({ profession, document_type: "intake_form" }).results.length, profession).toBeGreaterThan(0);
    }
  });

  it("spans at least three professions", () => {
    expect(PROFESSIONS.length).toBeGreaterThanOrEqual(3);
  });

  it("makes every template reachable through the search enums", () => {
    for (const t of TEMPLATES) {
      const found = t.professions.some((profession) =>
        searchTemplates({ profession, document_type: t.document_type, note_format: t.note_format }).results.some(
          (r) => r.id === t.id,
        ),
      );
      expect(found, t.id).toBe(true);
    }
  });

  it("derives enums from the catalog", () => {
    expect([...DOCUMENT_TYPES].sort()).toEqual([
      "cancellation_policy",
      "consent_form",
      "evaluation",
      "intake_form",
      "progress_note",
      "treatment_plan",
      "worksheet",
    ]);
    expect([...NOTE_FORMATS].sort()).toEqual(["birp", "dap", "soap"]);
  });
});
