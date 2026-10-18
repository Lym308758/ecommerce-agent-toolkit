#!/usr/bin/env node
// 遍历各 MCP Server 的 tsconfig.json 逐个执行 tsc，任一失败即以非零退出。
// npm script 在 Windows 下不走 bash，glob 不展开，故用 node 脚本统一处理。
import { globSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
// Windows 下 .bin/tsc.cmd 无法被直接 spawn，统一用 node 执行 typescript 的 bin
const tscEntry = join(ROOT, "node_modules", "typescript", "bin", "tsc");
if (!existsSync(tscEntry)) {
  console.error("缺少 typescript 依赖，请先 npm install");
  process.exit(1);
}
const configs = globSync("mcp/*/tsconfig.json", { cwd: ROOT }).sort();

if (configs.length === 0) {
  console.error("未找到 mcp 服务 tsconfig");
  process.exit(1);
}

let failed = 0;
for (const rel of configs) {
  const proj = join(ROOT, dirname(rel));
  process.stdout.write(`\n[build] ${rel}\n`);
  try {
    execFileSync(process.execPath, [tscEntry, "-p", proj], { stdio: "inherit", cwd: ROOT });
  } catch {
    failed++;
    console.error(`[build] FAILED: ${rel}`);
  }
}

if (failed > 0) {
  console.error(`\nbuild 失败 ${failed}/${configs.length}`);
  process.exit(1);
}
console.log(`\nbuild 成功 ${configs.length}/${configs.length}`);
