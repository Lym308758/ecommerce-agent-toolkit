#!/usr/bin/env node
// L3 场景执行层（路径B：本会话 Agent 扮演执行，产物回放 + 双判定）。
// - 用例来源：tests/cases/l3-cases-*.json（20 skill × 6 = 120 条）
// - 执行产物：tests/report/artifacts/<skill>.outputs.json（按用例 ID 索引；P0 skill 附 #run2/#run3）
// - 判定：确定性断言（硬失败，runAssertions）+ judge 加权分（≥0.8 通过）
// - 稳定性：P0 用例跨 3 轮比对 stabilityKeys，写入 <caseId>#stability 记录
// - 记录：tests/report/results-l3.jsonl（一条 = 一次执行）
import { test } from "node:test";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { runAssertions, getPath } from "./harness/assert.mjs";
import { buildRecord, REPORT_DIR, now } from "./harness/runner-utils.mjs";
import { createRecorder } from "./harness/record.mjs";

const CASE_FILES = [
  "tests/cases/l3-cases-proc-goods.json",
  "tests/cases/l3-cases-marketing.json",
  "tests/cases/l3-cases-orders-service.json",
  "tests/cases/l3-cases-logistics-finance.json",
];

// 与 capability-bank.json 中 priority=P0 的 skill 对齐（8 个）
const P0_SKILLS = new Set([
  "replenishment-advisor",
  "promo-planning",
  "order-status-bot",
  "pre-sales-guidance",
  "sentiment-escalation",
  "inventory-alert",
  "multi-platform-reconciliation",
  "daily-business-report",
]);

const JUDGE_THRESHOLD = 0.8;

function loadCases() {
  const cases = [];
  for (const f of CASE_FILES) {
    const d = JSON.parse(readFileSync(join(process.cwd(), f), "utf8"));
    cases.push(...d.cases);
  }
  return cases;
}

function loadArtifacts() {
  const map = {};
  const dir = join(REPORT_DIR, "artifacts");
  if (!existsSync(dir)) return map;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".outputs.json")) continue;
    Object.assign(map, JSON.parse(readFileSync(join(dir, f), "utf8")));
  }
  return map;
}

function loadJudgeScores() {
  // 按 skill 分文件（tests/report/l3-judge-scores/<skill>.json）合并为单一视图
  const merged = {};
  const dir = join(REPORT_DIR, "l3-judge-scores");
  if (existsSync(dir)) {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      Object.assign(merged, JSON.parse(readFileSync(join(dir, f), "utf8")));
    }
  }
  const single = join(REPORT_DIR, "l3-judge-scores.json");
  if (existsSync(single)) Object.assign(merged, JSON.parse(readFileSync(single, "utf8")));
  return merged;
}

// ---------- 派生字段：供 <array>Length / xxxJson / dedupedCount 等断言使用 ----------
function derive(output) {
  const d = {};
  if (!output || typeof output !== "object" || Array.isArray(output)) return d;
  for (const [k, v] of Object.entries(output)) {
    if (Array.isArray(v)) d[`${k}Length`] = v.length;
    if (v && typeof v === "object") d[`${k}Json`] = safeStringify(v);
  }
  if (Array.isArray(output.warnings)) d.warningsJoined = output.warnings.join(";");

  // dedupedCount：按商品 ID（itemId/id/skuId）去重计数，样本数组取 sources/samples/items/deduped 中首个存在者
  const sampleArr = [output.sources, output.samples, output.deduped, output.items].find((a) => Array.isArray(a));
  if (sampleArr) {
    const ids = sampleArr.map((x) => (x && typeof x === "object" ? (x.itemId ?? x.id ?? x.skuId) : null)).filter(Boolean);
    d.dedupedCount = new Set(ids).size;
  }

  // queuedCount：显式 queue 数组长度；否则统计 plan/items/entries 中 status==="queued" 的条目
  if (Array.isArray(output.queue)) {
    d.queuedCount = output.queue.length;
  } else {
    const plan = [output.plan, output.items, output.entries].find((a) => Array.isArray(a));
    if (plan) d.queuedCount = plan.filter((x) => x && typeof x === "object" && x.status === "queued").length;
  }

  // scoreIsZero：综合分是否为 0（score/overallScore/compositeScore 任一存在）
  const score = output.score ?? output.overallScore ?? output.compositeScore;
  if (typeof score === "number") d.scoreIsZero = score === 0;

  // topContribution：factors[].contribution 的最大值
  if (Array.isArray(output.factors)) {
    const cs = output.factors.map((f) => (f && typeof f === "object" && typeof f.contribution === "number" ? f.contribution : -Infinity));
    if (cs.length > 0) d.topContribution = Math.max(...cs);
  }

  // whEastQty / whSouthQty：items 按仓（warehouse/wh/warehouseName）汇总 suggestQty
  if (Array.isArray(output.items)) {
    let east = 0;
    let south = 0;
    for (const it of output.items) {
      if (!it || typeof it !== "object") continue;
      const wh = String(it.warehouse ?? it.wh ?? it.warehouseName ?? "");
      const q = typeof it.suggestQty === "number" ? it.suggestQty : 0;
      if (/east|华东/i.test(wh)) east += q;
      if (/south|华南/i.test(wh)) south += q;
    }
    d.whEastQty = east;
    d.whSouthQty = south;
  }
  return d;
}

function safeStringify(v) {
  try {
    return JSON.stringify(v);
  } catch {
    return "";
  }
}

// 断言求值根 = 输出对象 + 派生字段（派生优先，避免与真实字段同名冲突时歧义）
function evalCase(c, output) {
  const root = { ...(output ?? {}), ...derive(output) };
  return runAssertions(c.assertions ?? [], root);
}

// judge 加权分：按用例 judgeRubric 的权重逐项计分
function judgeResult(c, judge, runKey) {
  const entry = judge[c.id];
  if (!entry || !Array.isArray(entry.items)) {
    return { ok: false, reason: `缺少 judge 评分（${c.id}）`, weighted: null };
  }
  const rubric = c.judgeRubric ?? [];
  if (rubric.length > 0 && entry.items.length !== rubric.length) {
    return { ok: false, reason: `judge 项数与 rubric 不一致（${entry.items.length} vs ${rubric.length}）`, weighted: null };
  }
  let weighted = 0;
  for (let i = 0; i < entry.items.length; i += 1) {
    const w = rubric[i]?.weight ?? entry.items[i].weight;
    const s = entry.items[i].score;
    if (typeof w !== "number" || typeof s !== "number") {
      return { ok: false, reason: `judge 第 ${i + 1} 项缺少 weight/score`, weighted: null };
    }
    weighted += w * s;
  }
  return { ok: weighted >= JUDGE_THRESHOLD, reason: `judge 加权分 ${weighted.toFixed(3)}（阈值 ${JUDGE_THRESHOLD}）`, weighted };
}

test("L3 场景执行（120 条，P0 × 3 轮）", async (t) => {
  const cases = loadCases();
  const artifacts = loadArtifacts();
  const judge = loadJudgeScores();
  const recorder = createRecorder(join(process.cwd(), "tests", "report"), { fresh: true, name: "results-l3.jsonl" });

  const missing = cases.filter((c) => artifacts[c.id] === undefined).map((c) => c.id);
  await t.test("执行产物齐全（120 条）", () => {
    if (missing.length > 0) {
      throw new Error(`缺少 ${missing.length} 条执行产物：${missing.slice(0, 10).join(", ")}${missing.length > 10 ? " ..." : ""}`);
    }
  });

  let passCount = 0;
  let failCount = 0;

  for (const c of cases) {
    const runs = P0_SKILLS.has(c.target) ? ["", "#run2", "#run3"] : [""];
    const perRun = [];

    for (const suffix of runs) {
      const execId = `${c.id}${suffix}`;
      const output = artifacts[execId];
      const t0 = now();
      const results = evalCase(c, output);
      const j = judgeResult(c, judge, execId);
      const durationMs = now() - t0;

      const failed = results.filter((r) => !r.pass);
      // judge 失败并入失败断言列表（保持单一 status 口径）
      const judgeAssertions = j.ok
        ? []
        : [{ op: "judge", path: "$judge", pass: false, message: j.reason }];
      const allFailed = [...failed, ...judgeAssertions];
      const mergedAssertions = [...results, ...judgeAssertions];

      const status = output === undefined ? "error" : allFailed.length > 0 ? "fail" : "pass";
      if (status === "pass") passCount += 1;
      else failCount += 1;

      const rec = buildRecord({
        id: execId,
        layer: "L3",
        target: c.target,
        category: c.category,
        source: c.source,
        sourceRef: c.sourceRef,
        severityIfFail: c.severityIfFail,
        assertions: mergedAssertions,
        results: mergedAssertions,
        durationMs,
        output,
        error: output === undefined ? new Error(`执行产物缺失：tests/report/artifacts/${c.target}.outputs.json 无键 ${execId}`) : null,
        meta: {
          scenario: c.scenario,
          run: suffix === "" ? 1 : Number(suffix.slice(1)),
          judgeWeighted: j.weighted,
          passCriteria: c.passCriteria,
          repro: c.repro,
        },
      });
      recorder.record(rec);
      perRun.push({ output, results, judge: j });
    }

    // P0 三轮稳定性：stabilityKeys 跨轮 deep-equal
    if (runs.length === 3) {
      const keys = c.stabilityKeys ?? [];
      const unstable = [];
      for (const k of keys) {
        const vals = perRun.map((r) => stableValue(r.output, k));
        const first = JSON.stringify(vals[0]);
        if (!vals.every((v) => JSON.stringify(v) === first)) unstable.push(k);
      }
      const t0 = now();
      const durationMs = now() - t0;
      const rec = buildRecord({
        id: `${c.id}#stability`,
        layer: "L3",
        target: c.target,
        category: "stability",
        source: c.source,
        sourceRef: c.sourceRef,
        severityIfFail: "Minor",
        assertions: keys.map((k) => ({
          op: "stable",
          path: k,
          message: unstable.includes(k) ? `跨 3 轮不稳定：${k}` : `跨 3 轮一致：${k}`,
          pass: !unstable.includes(k),
        })),
        results: keys.map((k) => ({
          op: "stable",
          path: k,
          pass: !unstable.includes(k),
          message: unstable.includes(k) ? `跨 3 轮不稳定：${k}` : `跨 3 轮一致：${k}`,
        })),
        durationMs,
        output: { stabilityKeys: keys, unstable },
        error: null,
        meta: { scenario: c.scenario, run: "stability", repro: c.repro },
      });
      recorder.record(rec);
      if (rec.status === "fail") failCount += 1;
      else passCount += 1;
    }
  }

  await t.test("汇总：通过率 ≥ 0.95", () => {
    const total = passCount + failCount;
    const rate = total > 0 ? passCount / total : 0;
    if (failCount > 0) {
      // 失败明细由聚合器输出，这里仅给出快速定位信息
      const lines = readFileSync(recorder.file, "utf8").trim().split("\n").filter(Boolean);
      const bad = lines.map((l) => JSON.parse(l)).filter((r) => r.status !== "pass");
      throw new Error(`L3 失败 ${failCount}/${total}（通过率 ${(rate * 100).toFixed(1)}%）：\n` + bad.map((r) => `  ${r.id} [${r.severity}] ${r.assertions.filter((a) => !a.pass).map((a) => `${a.op}:${a.path}`).join(", ")}`).join("\n"));
    }
  });
});

// 稳定性取值：支持点号/下标路径，读「原始输出 + 派生字段」合并视图（与断言求值同源）
function stableValue(output, path) {
  const root = { ...(output ?? {}), ...derive(output) };
  return getPath(root, path);
}
