#!/usr/bin/env node
// 辅助脚本：自检某 skill 的执行产物是否满足全部确定性断言。
// 用法：node tests/harness/verify-artifacts.mjs <skill> [--all]
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { runAssertions } from "./assert.mjs";

const CASE_FILES = [
  "tests/cases/l3-cases-proc-goods.json",
  "tests/cases/l3-cases-marketing.json",
  "tests/cases/l3-cases-orders-service.json",
  "tests/cases/l3-cases-logistics-finance.json",
];
const P0_SKILLS = new Set([
  "replenishment-advisor", "promo-planning", "order-status-bot", "pre-sales-guidance",
  "sentiment-escalation", "inventory-alert", "multi-platform-reconciliation", "daily-business-report",
]);

function derive(output) {
  const d = {};
  if (!output || typeof output !== "object" || Array.isArray(output)) return d;
  for (const [k, v] of Object.entries(output)) {
    if (Array.isArray(v)) d[`${k}Length`] = v.length;
    if (v && typeof v === "object") {
      try { d[`${k}Json`] = JSON.stringify(v); } catch { d[`${k}Json`] = ""; }
    }
  }
  if (Array.isArray(output.warnings)) d.warningsJoined = output.warnings.join(";");
  const sampleArr = [output.sources, output.samples, output.deduped, output.items].find((a) => Array.isArray(a));
  if (sampleArr) {
    const ids = sampleArr.map((x) => (x && typeof x === "object" ? (x.itemId ?? x.id ?? x.skuId) : null)).filter(Boolean);
    d.dedupedCount = new Set(ids).size;
  }
  if (Array.isArray(output.queue)) d.queuedCount = output.queue.length;
  else {
    const plan = [output.plan, output.items, output.entries].find((a) => Array.isArray(a));
    if (plan) d.queuedCount = plan.filter((x) => x && typeof x === "object" && x.status === "queued").length;
  }
  const score = output.score ?? output.overallScore ?? output.compositeScore;
  if (typeof score === "number") d.scoreIsZero = score === 0;
  if (Array.isArray(output.factors)) {
    const cs = output.factors.map((f) => (f && typeof f === "object" && typeof f.contribution === "number" ? f.contribution : -Infinity));
    if (cs.length > 0) d.topContribution = Math.max(...cs);
  }
  if (Array.isArray(output.items)) {
    let east = 0, south = 0;
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

const all = process.argv.includes("--all");
const skill = process.argv[2];
const cases = [];
for (const f of CASE_FILES) {
  const d = JSON.parse(readFileSync(join(process.cwd(), f), "utf8"));
  cases.push(...(all ? d.cases : d.cases.filter((c) => c.target === skill)));
}
const artFile = join(process.cwd(), "tests/report/artifacts", `${skill}.outputs.json`);
const artifacts = existsSync(artFile) ? JSON.parse(readFileSync(artFile, "utf8")) : {};

let pass = 0, fail = 0;
for (const c of cases) {
  const output = artifacts[c.id];
  if (output === undefined) {
    console.log(`MISSING ${c.id}`);
    fail += 1;
    continue;
  }
  const root = { ...output, ...derive(output) };
  const results = runAssertions(c.assertions ?? [], root);
  const bad = results.filter((r) => !r.pass);
  if (bad.length === 0) {
    pass += 1;
    if (process.argv.includes("-v")) console.log(`ok ${c.id}`);
  } else {
    fail += 1;
    console.log(`FAIL ${c.id}`);
    for (const b of bad) console.log(`     ${b.op} ${b.path ?? "$"} -> ${b.message}`);
  }
}
console.log(`\n${skill}: ${pass} pass / ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
