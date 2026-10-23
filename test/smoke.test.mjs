import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const storage = mkdtempSync(join(tmpdir(), "smoke-"));
const entry = fileURLToPath(new URL("../stdio.mjs", import.meta.url));

test("stdio server answers an MCP initialize request", async () => {
  const child = spawn(process.execPath, [entry, storage], { stdio: ["pipe", "pipe", "pipe"] });
  try {
    const reply = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("no initialize reply")), 15000);
      let buf = "";
      child.stdout.on("data", (d) => {
        buf += d;
        const line = buf.split("\n").find((l) => l.includes('"result"'));
        if (line) { clearTimeout(timer); resolve(JSON.parse(line)); }
      });
      child.on("error", reject);
      child.stdin.write(JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "initialize",
        params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "smoke", version: "0.0.0" } },
      }) + "\n");
    });
    assert.equal(reply.id, 1);
    assert.ok(reply.result.serverInfo);
  } finally {
    child.kill();
  }
});
