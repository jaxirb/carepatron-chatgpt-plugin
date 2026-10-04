// Pre-demo check: every catalog page and PDF still loads. Network required.
// App deep links aren't checked: app.carepatron.com blocks non-browser requests.
import { TEMPLATES } from "../src/catalog.js";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36";

async function check(url: string, expectType: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: "GET", headers: { "user-agent": UA }, redirect: "follow" });
    await res.body?.cancel();
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok) return `${res.status}`;
    if (!type.includes(expectType)) return `unexpected content-type ${type}`;
    return null;
  } catch (error) {
    return (error as Error).message;
  }
}

const checks = TEMPLATES.flatMap((t) => [
  { id: t.id, url: t.page_url, type: "text/html" },
  { id: t.id, url: t.pdf_url, type: "application/pdf" },
]);

const results = await Promise.all(checks.map(async (c) => ({ ...c, error: await check(c.url, c.type) })));
for (const r of results) console.log(`${r.error ? "FAIL" : "ok  "} ${r.url}${r.error ? `  (${r.error})` : ""}`);
const failed = results.filter((r) => r.error).length;
console.log(`\n${results.length - failed}/${results.length} OK`);
process.exit(failed ? 1 : 0);
