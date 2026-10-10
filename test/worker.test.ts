import { describe, expect, it } from "vitest";
import worker from "../src/worker.js";

const get = (path: string) => worker.fetch(new Request(`https://example.workers.dev${path}`));

describe("worker routes", () => {
  it("serves the landing page with the install URL", async () => {
    const res = await get("/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const body = await res.text();
    expect(body).toContain("/mcp");
    expect(body).toContain("/demo?template=");
  });

  it("renders a template card in a plain browser, no ChatGPT needed", async () => {
    const body = await (await get("/demo?template=counseling-intake-form")).text();
    expect(body).toContain("Counseling Intake Form");
    expect(body).toContain("window.openai");
    // The injected payload carries the next step, which is the whole point of the card.
    expect(body).toMatch(/add your client's email and click Send/);
    // The card reads window.openai at the end of its own script, so the injection must come
    // first. Put it last and the page sits on "Loading template…" forever.
    expect(body.indexOf("window.openai = {")).toBeLessThan(body.indexOf("window.openai && window.openai.toolOutput"));
  });

  it("defaults the demo to the intake form and rejects an unknown id", async () => {
    expect((await get("/demo")).status).toBe(200);
    expect((await get("/demo?template=../secrets")).status).toBe(404);
    expect((await get("/demo?template=soap note for John")).status).toBe(404);
  });

  it("keeps healthz and 404s everything else", async () => {
    expect((await get("/healthz")).status).toBe(200);
    expect((await get("/anything")).status).toBe(404);
  });
});
