#!/usr/bin/env node
// 统一测试入口：收集各 MCP Server 冒烟测试与 tests 分层测试，
// 交给 node --test 执行，真实传递退出码（不再以 || true 掩盖失败）。
import { globSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();

// 前置检查：L3 场景层依赖 tests/report/artifacts/<skill>.outputs.json 这一黄金回归资产。
// 缺失时 264 条记录会全部以「执行产物缺失」失败，先给出可操作的指引而不是一堆笼统报错。
{
  const artDir = join(ROOT, "tests", "report", "artifacts");
  const skillsDir = join(ROOT, "skills");
  const skills = existsSync(skillsDir)
    ? readdirSync(skillsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== "_template")
        .map((d) => d.name)
    : [];
  const missing = skills.filter((s) => !existsSync(join(artDir, `${s}.outputs.json`)));
  if (skills.length > 0 && missing.length === skills.length) {
    console.error("[test] L3 黄金回归资产缺失：tests/report/artifacts/ 下未找到任何 <skill>.outputs.json");
    console.error("       ① 全新检出请确认该目录已随仓库提交（.gitignore 已对其放行）；");
    console.error("       ② 若产物被清理，需按 tests/prompts/<skill>.md 重新 author 产物后再执行；");
    console.error("       ③ 只想跑 L1/L2，请改用 npm run test:contract 或 npm run test:deps。");
    process.exit(1);
  }
  if (missing.length > 0) {
    console.warn(`[test] 警告：${missing.length}/${skills.length} 个 skill 缺执行产物，其 L3 用例将失败 → ${missing.join(", ")}`);
  }
}
const files = [
  ...globSync("mcp/*/test/*.test.mjs", { cwd: ROOT }),
  ...globSync("tests/*.test.mjs", { cwd: ROOT }),
].sort();

if (files.length === 0) {
  console.error("未找到任何测试文件");
  process.exit(1);
}

// L0：先生成契约索引（L1 测试依赖 tests/report/contract-index.json，保证全新检出可跑）
console.log("[test] L0 生成契约索引…");
const idx = spawnSync(process.execPath, [join(ROOT, "tests", "harness", "contract-index.mjs")], {
  stdio: "inherit",
  cwd: ROOT,
});
if (idx.status !== 0) {
  console.error("[test] L0 契约索引生成失败");
  process.exit(idx.status ?? 1);
}

console.log(`[test] 共 ${files.length} 个测试文件`);
const r = spawnSync(process.execPath, ["--test", ...files.map((f) => join(ROOT, f))], {
  stdio: "inherit",
  cwd: ROOT,
});
process.exit(r.status ?? 1);
