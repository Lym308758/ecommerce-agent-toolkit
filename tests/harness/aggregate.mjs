#!/usr/bin/env node
// 聚合器：合并 L1/L2/L3 记录 + L0 契约索引 + 能力台账 → tests/report/summary.json
// 用法：node tests/harness/aggregate.mjs
import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const REPORT = join(ROOT, "tests", "report");
const SEVERITY_ORDER = ["Info", "Minor", "Major", "Blocker"];

function readJsonl(name) {
  const f = join(REPORT, name);
  if (!existsSync(f)) return [];
  return readFileSync(f, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
}
function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

const l1 = readJsonl("results-l1.jsonl");
const l2 = readJsonl("results-l2.jsonl");
const l3 = readJsonl("results-l3.jsonl");
const all = [...l1, ...l2, ...l3];

const bank = readJson("capability-bank.json");
const index = readJson("tests/report/contract-index.json");
const inventory = readJson("tests/report/tool-inventory.json");

// ---- 能力台账：skill 元数据（以 artifact 目录名为键） ----
const skills = bank.capabilities.filter((c) => c.artifact && c.artifact.startsWith("skills/"));
const skillMeta = {};
for (const s of skills) {
  const slug = s.artifact.split("/")[1];
  skillMeta[slug] = { name: slug, display: s.name, module: s.module, priority: s.priority, safety: s.safety, artifact: s.artifact };
}
const skillNames = skills.map((s) => s.artifact.split("/")[1]).sort();

// ---- 分 skill 聚合 ----
function skillOfTarget(target) {
  if (!target) return null;
  if (target.startsWith("skills/")) return target.split("/")[1];
  return target;
}

const bySkill = {};
for (const name of skillNames) {
  bySkill[name] = {
    ...skillMeta[name],
    l1: { total: 0, pass: 0, fail: 0 },
    l2: { total: 0, pass: 0, fail: 0 },
    l3: { total: 0, pass: 0, fail: 0 },
    l3Runs: { total: 0, pass: 0 },
    l3Stability: { total: 0, pass: 0 },
    judgeAvg: null,
    judgeMin: null,
    durations: [],
    failures: [],
    caseCategories: { normal: 0, boundary: 0, error: 0 },
  };
}

for (const r of all) {
  const skill = skillOfTarget(r.target);
  if (!skill || !bySkill[skill]) continue;
  const layer = r.layer.toLowerCase();
  const bucket = bySkill[skill][layer];
  if (!bucket) continue;
  bucket.total += 1;
  if (r.status === "pass") bucket.pass += 1;
  else bucket.fail += 1;
  if (r.layer === "L3") {
    if (r.id.endsWith("#stability")) bySkill[skill].l3Stability.total += 1;
    else bySkill[skill].l3Runs.total += 1;
    if (r.id.endsWith("#stability") && r.status === "pass") bySkill[skill].l3Stability.pass += 1;
    if (!r.id.endsWith("#stability") && r.status === "pass") bySkill[skill].l3Runs.pass += 1;
    if (!r.id.endsWith("#stability") && r.category) bySkill[skill].caseCategories[r.category] = (bySkill[skill].caseCategories[r.category] ?? 0) + 1;
    bySkill[skill].durations.push(r.durationMs ?? 0);
  }
  if (r.status !== "pass") {
    bySkill[skill].failures.push({
      id: r.id,
      layer: r.layer,
      severity: r.severity,
      category: r.category,
      failedAssertions: r.assertions.filter((a) => !a.pass).map((a) => ({ op: a.op, path: a.path, message: a.message })),
      error: r.error,
    });
  }
}

// L3 judge 分数（按 skill 平均/最低）
const judgeDir = join(REPORT, "l3-judge-scores");
if (existsSync(judgeDir)) {
  for (const f of readdirSync(judgeDir)) {
    if (!f.endsWith(".json")) continue;
    const skill = f.replace(/\.json$/, "");
    if (!bySkill[skill]) continue;
    const js = JSON.parse(readFileSync(join(judgeDir, f), "utf8"));
    const vals = Object.values(js).map((e) => e.items.reduce((s, x) => s + x.weight * x.score, 0));
    if (vals.length > 0) {
      bySkill[skill].judgeAvg = vals.reduce((a, b) => a + b, 0) / vals.length;
      bySkill[skill].judgeMin = Math.min(...vals);
    }
  }
}

// ---- 分层统计 ----
function layerStats(records) {
  const byStatus = {};
  const bySeverity = {};
  const byCategory = {};
  const durations = records.map((r) => r.durationMs ?? 0).sort((a, b) => a - b);
  for (const r of records) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    if (r.status !== "pass") bySeverity[r.severity] = (bySeverity[r.severity] ?? 0) + 1;
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  }
  const n = durations.length;
  return {
    total: records.length,
    pass: byStatus.pass ?? 0,
    fail: byStatus.fail ?? 0,
    error: byStatus.error ?? 0,
    passRate: n > 0 ? (byStatus.pass ?? 0) / n : 0,
    bySeverity,
    byCategory,
    durationMs: n === 0 ? null : {
      avg: Math.round(durations.reduce((a, b) => a + b, 0) / n),
      max: durations[n - 1],
      p95: durations[Math.min(n - 1, Math.floor(n * 0.95))],
    },
  };
}

const layers = { L1: layerStats(l1), L2: layerStats(l2), L3: layerStats(l3) };

// ---- MCP 工具门禁实测（L2 D-03 记录；id 形如 DP-<server>-<tool>-D-03，target 形如 "<server> <tool>"） ----
const gateRecords = l2.filter((r) => /D-03$/.test(r.id));
const toolSafety = {};
for (const t of inventory) toolSafety[`${t.server}/${t.tool}`] = t.safety;
const toolKeyOf = (r) => r.target.replace(/\s+/g, "/");
const gates = {
  toolsTotal: inventory.length,
  bySafety: inventory.reduce((acc, t) => ({ ...acc, [t.safety]: (acc[t.safety] ?? 0) + 1 }), {}),
  gateCases: gateRecords.length,
  gatePass: gateRecords.filter((r) => r.status === "pass").length,
  detail: gateRecords.map((r) => ({
    tool: toolKeyOf(r),
    safety: toolSafety[toolKeyOf(r)] ?? null,
    status: r.status,
  })),
};

// ---- 问题清单（按严重度排序） ----
const problems = [];
for (const r of all) {
  if (r.status === "pass") continue;
  problems.push({
    id: r.id,
    layer: r.layer,
    target: r.target,
    severity: r.severity,
    category: r.category,
    failedAssertions: r.assertions.filter((a) => !a.pass).map((a) => `${a.op} ${a.path}: ${a.message}`),
    error: r.error,
    scenario: r.meta?.scenario ?? null,
    repro: r.meta?.repro ?? null,
  });
}
problems.sort((a, b) => SEVERITY_ORDER.indexOf(b.severity) - SEVERITY_ORDER.indexOf(a.severity) || a.id.localeCompare(b.id));

// ---- L2 工具响应时间（真实 MCP 调用；D-01/D-02/D-03 记录，target 形如 "<server> <tool>"） ----
const toolDurations = {};
for (const r of l2) {
  if (/D-0[123]$/.test(r.id)) {
    const key = toolKeyOf(r);
    (toolDurations[key] ??= []).push(r.durationMs ?? 0);
  }
}
const toolTiming = Object.entries(toolDurations).map(([tool, ds]) => ({
  tool,
  calls: ds.length,
  avgMs: Math.round(ds.reduce((a, b) => a + b, 0) / ds.length),
  maxMs: Math.max(...ds),
})).sort((a, b) => b.maxMs - a.maxMs);

// ---- L0 契约索引摘要 ----
const idxTotals = index.totals ?? {};
const contractSummary = {
  skills: idxTotals.skills ?? skillNames.length,
  inputFields: idxTotals.inputFields ?? null,
  outputLeaves: idxTotals.outputLeaves ?? null,
  enums: idxTotals.outputEnums ?? null,
  gates: idxTotals.gates ?? null,
  goldenCorpus: idxTotals.goldenCorpus ?? null,
  dependencies: idxTotals.dependencies ?? null,
  boundaries: idxTotals.boundaries ?? null,
  missingSections: idxTotals.missingSections ?? 0,
};

const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    skills: skillNames.length,
    mcpTools: inventory.length,
    l1Cases: l1.length,
    l2Cases: l2.length,
    l3Cases: l3.length,
    allRecords: all.length,
    pass: all.filter((r) => r.status === "pass").length,
    fail: all.filter((r) => r.status === "fail").length,
    error: all.filter((r) => r.status === "error").length,
  },
  layers,
  skills: bySkill,
  gates,
  toolTiming,
  contractSummary,
  problems,
};

writeFileSync(join(REPORT, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
console.log("summary.json 已生成");
console.log(`L1: ${layers.L1.pass}/${layers.L1.total} | L2: ${layers.L2.pass}/${layers.L2.total} | L3: ${layers.L3.pass}/${layers.L3.total}`);
console.log(`总记录: ${summary.totals.allRecords}（pass ${summary.totals.pass} / fail ${summary.totals.fail} / error ${summary.totals.error}）`);
console.log(`问题清单: ${problems.length} 条（${SEVERITY_ORDER.map((s) => `${s} ${problems.filter((p) => p.severity === s).length}`).join(" / ")}）`);
