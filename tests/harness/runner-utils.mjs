#!/usr/bin/env node
// 分层测试共享工具：记录构造、严重度映射、文件定位。
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { runAssertions } from "./assert.mjs";

export const ROOT = process.cwd();
export const REPORT_DIR = join(ROOT, "tests", "report");

export function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

// 从 tools.ts 提取某 server 导出的工具名集合
export function toolNamesOf(server) {
  const f = join(ROOT, "mcp", server, "src", "tools.ts");
  if (!existsSync(f)) return null;
  const src = readFileSync(f, "utf8");
  return new Set([...src.matchAll(/name:\s*"([a-z0-9_]+)"/g)].map((m) => m[1]));
}

// 从 tools.ts 提取工具的安全分级映射
export function toolSafetyOf(server) {
  const f = join(ROOT, "mcp", server, "src", "tools.ts");
  if (!existsSync(f)) return null;
  const src = readFileSync(f, "utf8");
  const map = {};
  const re = /name:\s*"([a-z0-9_]+)",\s*\r?\n\s*safety:\s*"(L[1-4])"/g;
  let m;
  while ((m = re.exec(src))) map[m[1]] = m[2];
  return map;
}

const SEVERITY_ORDER = ["Info", "Minor", "Major", "Blocker"];

// 用例记录构造器：统一 status 判定（任一断言失败即 fail；抛错即 error）
// 严重度 = 失败断言中的最高严重度（断言可带 severity 字段），低于用例预置值时以断言为准
// results 可传入预计算的断言结果（如 L3 需要在「原始输出 + 派生字段」合并视图上求值）
export function buildRecord({ id, layer, target, category, source, sourceRef, severityIfFail, assertions, results: precomputed, durationMs, output, error, meta }) {
  const results = precomputed ?? runAssertions(assertions ?? [], output);
  const failed = results.filter((r) => !r.pass);
  let status = "pass";
  if (error) status = "error";
  else if (failed.length > 0) status = "fail";

  // 失败断言的最高严重度
  let sev = severityIfFail ?? "Major";
  const sevRanks = (assertions ?? []).map((a, i) => ({ rank: SEVERITY_ORDER.indexOf(a.severity ?? severityIfFail ?? "Major"), failed: results[i] && !results[i].pass }));
  const maxFailed = sevRanks.filter((s) => s.failed).sort((a, b) => b.rank - a.rank)[0];
  if (maxFailed) sev = SEVERITY_ORDER[maxFailed.rank] ?? sev;

  return {
    id,
    layer,
    target,
    category,
    source: source ?? null,
    sourceRef: sourceRef ?? null,
    severity: sev,
    status,
    durationMs: Math.round(durationMs ?? 0),
    assertions: results,
    failureCount: failed.length,
    output: output === undefined ? null : output,
    error: error ? String(error.message ?? error) : null,
    meta: meta ?? {},
  };
}

export function now() {
  return performance.now();
}
