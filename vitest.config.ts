import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Wrangler bundles .html as text modules (wrangler.jsonc). Vitest needs the same,
// so src/worker.ts can be tested directly instead of only through a deploy.
const htmlAsText = {
  name: "html-as-text",
  transform(_code: string, id: string) {
    if (!id.endsWith(".html")) return null;
    return { code: `export default ${JSON.stringify(readFileSync(id, "utf8"))};`, map: null };
  },
};

export default defineConfig({ plugins: [htmlAsText], test: { include: ["test/**/*.test.ts"] } });
