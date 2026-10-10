import { describe, expect, it } from "vitest";
import { buildChecklist, COUNTRIES, PROFESSION_GROUPS } from "../src/checklist.js";
import { TEMPLATE_IDS } from "../src/catalog.js";
import { checklistInput, checklistOutput } from "../src/tools.js";

const combos = PROFESSION_GROUPS.flatMap((g) => COUNTRIES.map((c) => [g, c] as const));

describe("intake checklist", () => {
  it.each(combos)("%s in %s returns a complete, usable pack", (group, country) => {
    const c = buildChecklist(group, country);
    expect(checklistOutput.parse(c)).toEqual(c);
    expect(c.items.length).toBeGreaterThanOrEqual(10);
    expect(new Set(c.items.map((i) => i.key)).size).toBe(c.items.length);
    for (const item of c.items) {
      expect(item.title.trim().length, item.key).toBeGreaterThan(0);
      expect(item.why.trim().length, item.key).toBeGreaterThan(0);
      // Wording is what the clinician pastes, so it has to be a real sentence, not a label.
      expect(item.wording.trim().length, item.key).toBeGreaterThan(40);
      if (item.template_id) expect(TEMPLATE_IDS, item.key).toContain(item.template_id);
    }
  });

  it.each(combos)("%s in %s always says it is not legal advice", (group, country) => {
    expect(buildChecklist(group, country).caveats.join(" ")).toMatch(/not legal advice/i);
  });

  it("gives country-specific consent guidance, not one generic line", () => {
    const wording = (country: (typeof COUNTRIES)[number]) =>
      buildChecklist("mental_health", country).items.find((i) => i.key === "ai_recording_consent")!.wording;
    expect(wording("US")).toMatch(/business associate|all-party/i);
    expect(wording("AU")).toMatch(/Ahpra|APS/);
    expect(wording("NZ")).toMatch(/Medical Council|Psychologists Board/);
    expect(wording("GB")).toMatch(/NHS England/);
    expect(wording("CA")).toMatch(/Ontario|Alberta|BC/);
    expect(new Set(COUNTRIES.map(wording)).size).toBe(COUNTRIES.length);
  });

  it("points the intake item at the template for that profession", () => {
    expect(buildChecklist("dietetics", "US").items[0].template_id).toBe("nutrition-intake-form");
    expect(buildChecklist("allied_health", "US").items[0].template_id).toBe("physical-therapy-intake-form");
  });

  it("has no path for client details (D2)", () => {
    expect(checklistInput.safeParse({ profession_group: "mental_health", country: "AU", client_name: "Maria Lopez" }).success).toBe(false);
    expect(checklistInput.safeParse({ profession_group: "a 42yo with low back pain", country: "AU" }).success).toBe(false);
    expect(checklistInput.safeParse({ profession_group: "mental_health", country: "AU" }).success).toBe(true);
  });
});
