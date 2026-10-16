import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const cwd = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED = ["list_orders", "get_order", "split_order", "merge_orders", "review_order", "update_order_status"];

function rpc(serverProcess, request) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), 8000);
    let buf = "";
    const onData = (chunk) => {
      buf += chunk.toString();
      for (const line of buf.split("\n")) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id === request.id) {
            clearTimeout(timer);
            serverProcess.stdout.off("data", onData);
            resolve(msg);
          }
        } catch { /* 等待完整行 */ }
      }
    };
    serverProcess.stdout.on("data", onData);
    serverProcess.stdin.write(JSON.stringify(request) + "\n");
  });
}

test("tools/list 暴露全部工具且 dry-run 可用", async (t) => {
  const child = spawn("npx", ["tsx", "src/index.ts"], {
    cwd,
    env: { ...process.env, DRY_RUN: "1" },
  });
  t.after(() => child.kill());

  const init = await rpc(child, {
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "0.0.0" } },
  });
  assert.ok(init.result, "initialize 应返回结果");

  const listed = await rpc(child, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const got = listed.result.tools.map((x) => x.name);
  for (const name of EXPECTED) assert.ok(got.includes(name), `缺少工具 ${name}`);
});
