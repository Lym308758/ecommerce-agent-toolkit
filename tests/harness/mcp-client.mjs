#!/usr/bin/env node
// MCP stdio JSON-RPC 客户端：spawn 一个 Server，initialize → tools/list → tools/call。
// 与 mcp/*/test/smoke.test.mjs 同一套协议写法，抽出复用。
import { spawn } from "node:child_process";
import { join } from "node:path";

export class McpClient {
  constructor(serverDir, { timeoutMs = 15000, dryRun = true } = {}) {
    this.serverDir = serverDir;
    this.timeoutMs = timeoutMs;
    this.dryRun = dryRun;
    this.child = null;
    this.nextId = 1;
  }

  async start() {
    const env = { ...process.env };
    if (this.dryRun) env.DRY_RUN = "1";
    this.child = spawn(process.execPath, ["--import", "tsx", "src/index.ts"], {
      cwd: this.serverDir,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.stderr = "";
    this.child.stderr.on("data", (c) => {
      this.stderr += c.toString();
    });
    const init = await this._rpc({
      jsonrpc: "2.0",
      id: this.nextId++,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "ecom-test-harness", version: "1.0.0" },
      },
    });
    if (init.error) throw new Error(`initialize 失败：${JSON.stringify(init.error)}`);
    this.child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
    return init;
  }

  _rpc(request) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`RPC 超时（${this.timeoutMs}ms）：${request.method}`)), this.timeoutMs);
      let buf = "";
      const onData = (chunk) => {
        buf += chunk.toString();
        for (const line of buf.split("\n")) {
          if (!line.trim()) continue;
          let msg;
          try {
            msg = JSON.parse(line);
          } catch {
            continue;
          }
          if (msg.id === request.id) {
            clearTimeout(timer);
            this.child.stdout.off("data", onData);
            resolve(msg);
          }
        }
      };
      this.child.stdout.on("data", onData);
      this.child.stdin.write(JSON.stringify(request) + "\n");
    });
  }

  async listTools() {
    const r = await this._rpc({ jsonrpc: "2.0", id: this.nextId++, method: "tools/list", params: {} });
    if (r.error) throw new Error(`tools/list 失败：${JSON.stringify(r.error)}`);
    return r.result.tools;
  }

  async callTool(name, args = {}) {
    const r = await this._rpc({
      jsonrpc: "2.0",
      id: this.nextId++,
      method: "tools/call",
      params: { name, arguments: args },
    });
    return r;
  }

  stop() {
    if (this.child) this.child.kill();
  }
}

// 便捷函数：一次性调用
export async function callOnce(serverDir, name, args, opts) {
  const c = new McpClient(serverDir, opts);
  try {
    await c.start();
    return await c.callTool(name, args);
  } finally {
    c.stop();
  }
}

export function serverPath(root, server) {
  return join(root, "mcp", server);
}
