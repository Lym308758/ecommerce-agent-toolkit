#!/usr/bin/env node
// L1 静态契约层：20 skill × 4 = 80 条
//   S-01 八章节齐全            S-02 frontmatter ↔ capability-bank 一致
//   S-03 输出契约可解析+枚举合法  S-04 依赖目标真实存在（MCP 工具/适配器/Skill）
// 运行：node --test tests/l1-contract.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createRecorder } from "./harness/record.mjs";
import { buildRecord, readJson, toolNamesOf, now } from "./harness/runner-utils.mjs";

const index = readJson("tests/report/contract-index.json");
const bank = readJson("capability-bank.json");
const recorder = createRecorder(join(process.cwd(), "tests", "report"), { fresh: true, name: "results-l1.jsonl" });

const bankByArtifact = new Map();
for (const c of bank.capabilities) {
  if (c.artifact) bankByArtifact.set(c.artifact, c);
}

const SKILLS = index.skills.map((s) => s.name);

for (const name of SKILLS) {
  const skill = index.skills.find((s) => s.name === name);
  const bankEntry = bankByArtifact.get(`skills/${name}`) ?? null;

  // ---------- S-01 八章节齐全 ----------
  test(`SK-${name}-S-01 八章节齐全`, () => {
    const t0 = now();
    const rec = buildRecord({
      id: `SK-${name}-S-01`,
      layer: "L1",
      target: name,
      category: "static",
      source: "output_contract",
      sourceRef: "SKILL.md 章节结构",
      severityIfFail: "Blocker",
      assertions: [
        { op: "eq", path: "missingSections", expected: [], message: "8 个必备章节不得缺失", severity: "Blocker" },
        { op: "gte", path: "workflowSteps", expected: 3, message: "工作流至少 3 步", severity: "Major" },
        { op: "gte", path: "gates", expected: 2, message: "验收门禁至少 2 条", severity: "Minor" },
        { op: "gte", path: "goldenCorpus", expected: 2, message: "Golden Corpus 至少 2 条", severity: "Minor" },
      ],
      output: { missingSections: skill.missingSections, workflowSteps: skill.workflowSteps, gates: skill.gates.length, goldenCorpus: skill.goldenCorpus.length },
      durationMs: now() - t0,
    });
    recorder.record(rec);
    assert.equal(rec.status, "pass", rec.assertions.filter((a) => !a.pass).map((a) => a.message).join("；"));
  });

  // ---------- S-02 frontmatter ↔ capability-bank 一致 ----------
  test(`SK-${name}-S-02 frontmatter 与能力台账一致`, () => {
    const t0 = now();
    const fm = skill.frontmatter ?? {};
    const rec = buildRecord({
      id: `SK-${name}-S-02`,
      layer: "L1",
      target: name,
      category: "static",
      source: "dependency",
      sourceRef: `capability-bank.json#skills/${name}`,
      severityIfFail: "Major",
      assertions: [
        { op: "exists", path: "bank", message: "能力台账中应存在对应条目" },
        { op: "eq", path: "bank.module", expected: skill.module, message: "module 应一致" },
        { op: "eq", path: "bank.safety", expected: skill.safety, message: "safety 应一致" },
        { op: "eq", path: "bank.ledger", expected: skill.ledger, message: "ledger 应一致" },
        { op: "eq", path: "bank.priority", expected: skill.priority, message: "priority 应一致" },
      ],
      output: { bank: bankEntry ? { module: bankEntry.module, safety: bankEntry.safety, ledger: bankEntry.ledger, priority: bankEntry.priority } : null },
      durationMs: now() - t0,
    });
    recorder.record(rec);
    assert.equal(rec.status, "pass", rec.assertions.filter((a) => !a.pass).map((a) => a.message).join("；"));
  });

  // ---------- S-03 输出契约可解析且枚举合法 ----------
  test(`SK-${name}-S-03 输出契约 JSON 可解析且枚举合法`, () => {
    const t0 = now();
    const enums = skill.outputContract.enums ?? [];
    const enumOk = enums.every(
      (e) => e.values.length >= 2 && new Set(e.values).size === e.values.length && e.values.every((v) => /^[A-Za-z0-9_-]+$/.test(v))
    );
    const rec = buildRecord({
      id: `SK-${name}-S-03`,
      layer: "L1",
      target: name,
      category: "static",
      source: "output_contract",
      sourceRef: "输出契约 JSON",
      severityIfFail: "Blocker",
      assertions: [
        { op: "notExists", path: "error", message: "输出契约 JSON 必须可解析" },
        { op: "gte", path: "leafCount", expected: 3, message: "输出契约至少 3 个叶子字段" },
        { op: "eq", path: "enumOk", expected: true, message: "枚举值须 ≥2 个、无重复、标识符风格" },
      ],
      output: { error: skill.outputContract.error, leafCount: (skill.outputContract.leaves ?? []).length, enumOk, enums: enums.map((e) => e.path) },
      durationMs: now() - t0,
    });
    recorder.record(rec);
    assert.equal(rec.status, "pass", rec.assertions.filter((a) => !a.pass).map((a) => a.message).join("；"));
  });

  // ---------- S-04 依赖目标真实存在 ----------
  test(`SK-${name}-S-04 依赖能力真实存在`, () => {
    const t0 = now();
    const unresolved = [];
    const resolved = [];
    for (const dep of skill.dependencies ?? []) {
      if (dep.server && dep.tool) {
        const tools = toolNamesOf(dep.server);
        if (tools === null) unresolved.push(`${dep.server}（server 目录不存在）`);
        else if (!tools.has(dep.tool)) unresolved.push(`${dep.server} ${dep.tool}（工具未导出）`);
        else resolved.push(`${dep.server} ${dep.tool}`);
      } else if (dep.ref.startsWith("adapters/")) {
        const dir = join(process.cwd(), dep.ref);
        if (!existsSync(join(dir, "README.md"))) unresolved.push(`${dep.ref}（适配器文档缺失）`);
        else resolved.push(dep.ref);
      } else if (dep.ref.startsWith("skills/")) {
        if (!existsSync(join(process.cwd(), dep.ref, "SKILL.md"))) unresolved.push(`${dep.ref}（SKILL.md 缺失）`);
        else resolved.push(dep.ref);
      } else {
        unresolved.push(`${dep.ref}（无法解析的引用格式）`);
      }
    }
    const rec = buildRecord({
      id: `SK-${name}-S-04`,
      layer: "L1",
      target: name,
      category: "static",
      source: "dependency",
      sourceRef: "依赖能力清单",
      severityIfFail: "Major",
      assertions: [
        { op: "gte", path: "depCount", expected: 1, message: "至少声明 1 项依赖" },
        { op: "eq", path: "unresolved", expected: [], message: "所有依赖必须可解析" },
      ],
      output: { depCount: (skill.dependencies ?? []).length, resolved, unresolved },
      durationMs: now() - t0,
    });
    recorder.record(rec);
    assert.equal(rec.status, "pass", rec.assertions.filter((a) => !a.pass).map((a) => a.message).join("；"));
  });
}

test("L1 汇总：20 个 skill 均生成 4 条静态用例", () => {
  assert.equal(SKILLS.length, 20, `期望 20 个 skill，实际 ${SKILLS.length}`);
  assert.equal(SKILLS.length * 4, 80);
});
