import { connect as connectSocket, type AddressInfo } from "node:net";
import { request, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { createHttpServer } from "../src/server.js";
import { CARD_URI } from "../src/tools.js";

let server: Server | undefined;

async function start(port = 0): Promise<number> {
  server = createHttpServer([]);
  await new Promise<void>((resolve) => server!.listen(port, "127.0.0.1", resolve));
  return (server!.address() as AddressInfo).port;
}

async function stop() {
  await new Promise<void>((resolve) => server?.close(() => resolve()));
  server = undefined;
}

async function connect(port: number): Promise<Client> {
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`)));
  return client;
}

afterEach(stop);

describe("/mcp over streamable HTTP", () => {
  it("lists both tools with explicit read-only annotations", async () => {
    const client = await connect(await start());
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(["templates.get", "templates.search"]);
    for (const tool of tools) {
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false, openWorldHint: false });
      expect(tool.description).toMatch(/^Use this when/);
      expect(tool.description).toMatch(/Do not use/);
      expect(tool.inputSchema.additionalProperties).toBe(false);
    }
    const get = tools.find((t) => t.name === "templates.get")!;
    expect(get._meta?.ui).toMatchObject({ resourceUri: CARD_URI });
    await client.close();
  });

  it("calls search and get end to end", async () => {
    const client = await connect(await start());
    const search = await client.callTool({ name: "templates.search", arguments: { profession: "speech_pathology" } });
    expect(search.structuredContent).toMatchObject({ results: [{ id: "speech-therapy-soap" }] });
    const get = await client.callTool({ name: "templates.get", arguments: { template_id: "speech-therapy-soap" } });
    expect(get.structuredContent).toMatchObject({ title: "SOAP Notes For Speech Therapy Template" });
    expect(get.content).toEqual([expect.objectContaining({ type: "text", text: expect.stringContaining("Open in Carepatron") })]);
    await client.close();
  });

  it("rejects a call carrying client details", async () => {
    const client = await connect(await start());
    const result = await client
      .callTool({ name: "templates.search", arguments: { profession: "physical_therapy", client_name: "Maria Lopez" } })
      .catch((error: Error) => ({ isError: true, error }));
    expect(result.isError).toBe(true);
    await client.close();
  });

  it("serves the card with the MCP Apps MIME type and Carepatron redirect domains", async () => {
    const client = await connect(await start());
    const { contents } = await client.readResource({ uri: CARD_URI });
    expect(contents[0]).toMatchObject({ uri: CARD_URI, mimeType: RESOURCE_MIME_TYPE });
    expect((contents[0] as { text: string }).text).toContain("Open in Carepatron");
    expect(contents[0]._meta?.["openai/widgetCSP"]).toMatchObject({
      redirect_domains: ["https://app.carepatron.com", "https://www.carepatron.com"],
      resource_domains: ["https://fonts.googleapis.com", "https://fonts.gstatic.com"],
    });
    await client.close();
  });

  it("keeps answering after a server restart (stateless, D6)", async () => {
    const port = await start();
    const client = await connect(port);
    await stop();
    await start(port);
    const r = await client.callTool({ name: "templates.search", arguments: { note_format: "dap" } });
    expect(r.structuredContent).toMatchObject({ results: [{ id: "dap-notes" }] });
    await client.close();
  });

  it("answers GET with 405 and unknown paths with 404", async () => {
    const port = await start();
    expect((await fetch(`http://127.0.0.1:${port}/mcp`)).status).toBe(405);
    expect((await fetch(`http://127.0.0.1:${port}/other`)).status).toBe(404);
  });

  it("survives a malformed request path and keeps serving", async () => {
    const port = await start();
    // Raw socket: clients normalise "//[" away, but node:http passes it through untouched.
    const statusLine = await new Promise<string>((resolve, reject) => {
      const socket = connectSocket(port, "127.0.0.1", () => socket.end("GET //[ HTTP/1.1\r\nHost: localhost\r\n\r\n"));
      socket.once("data", (d) => resolve(String(d).split("\r\n")[0]));
      socket.on("error", reject);
    });
    expect(statusLine).toBe("HTTP/1.1 404 Not Found");
    expect((await fetch(`http://127.0.0.1:${port}/healthz`)).status).toBe(200);
  });

  it("rejects requests for hosts that aren't allowed", async () => {
    const port = await start();
    // fetch can't override Host, so use node:http directly.
    const status = await new Promise<number>((resolve, reject) => {
      const req = request(
        { host: "127.0.0.1", port, path: "/mcp", method: "POST", headers: { host: "evil.example.com", "content-type": "application/json" } },
        (res) => resolve(res.statusCode ?? 0),
      );
      req.on("error", reject);
      req.end("{}");
    });
    expect(status).toBe(403);
  });
});
