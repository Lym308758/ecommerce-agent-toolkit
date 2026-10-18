#!/usr/bin/env node
// L0：构建 contract-index.json —— 20 个 skill 的结构化契约索引 + 聚合统计（覆盖率分母的数据源）
// 运行：node tests/harness/contract-index.mjs
import { writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseSkillFile } from "./parse-skill.mjs";

const ROOT = process.cwd();
const REPORT = join(ROOT, "tests", "report");

const skillNames = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "_template")
  .map((d) => d.name)
  .sort();

const skills = skillNames.map((name) => {
  const p = parseSkillFile(join(ROOT, "skills", name, "SKILL.md"));
  return {
    name,
    module: p.frontmatter.module ?? null,
    safety: p.frontmatter.safety ?? null,
    ledger: p.frontmatter.ledger ?? null,
    priority: p.frontmatter.priority ?? null,
    version: p.frontmatter.version ?? null,
    missingSections: p.missingSections,
    inputFields: p.inputFields,
    outputContract: {
      raw: p.outputContract.raw,
      error: p.outputContract.error,
      enums: p.outputContract.enums,
      leaves: p.outputContract.leaves,
    },
    gates: p.gates,
    goldenCorpus: p.goldenCorpus,
    dependencies: p.dependencies,
    boundaries: p.boundaries,
    workflowSteps: p.workflows.length,
  };
});

const totals = {
  skills: skills.length,
  inputFields: skills.reduce((s, k) => s + k.inputFields.length, 0),
  outputLeaves: skills.reduce((s, k) => s + k.outputContract.leaves.length, 0),
  outputEnums: skills.reduce((s, k) => s + k.outputContract.enums.length, 0),
  gates: skills.reduce((s, k) => s + k.gates.length, 0),
  goldenCorpus: skills.reduce((s, k) => s + k.goldenCorpus.length, 0),
  dependencies: skills.reduce((s, k) => s + k.dependencies.length, 0),
  boundaries: skills.reduce((s, k) => s + k.boundaries.length, 0),
  missingSections: skills.reduce((s, k) => s + k.missingSections.length, 0),
};

// 被引用的 MCP 工具去重集合（C3 覆盖率分母）
const referencedTools = new Set();
for (const k of skills) {
  for (const d of k.dependencies) {
    if (d.server && d.tool) referencedTools.add(`${d.server} ${d.tool}`);
  }
}

const index = { generatedAt: new Date().toISOString(), skills, totals, referencedTools: [...referencedTools].sort() };

mkdirSync(REPORT, { recursive: true });
writeFileSync(join(REPORT, "contract-index.json"), JSON.stringify(index, null, 2));

console.log("contract-index.json 已生成");
console.log(`  skills=${totals.skills} inputFields=${totals.inputFields} outputLeaves=${totals.outputLeaves} enums=${totals.outputEnums}`);
console.log(`  gates=${totals.gates} goldenCorpus=${totals.goldenCorpus} dependencies=${totals.dependencies} boundaries=${totals.boundaries}`);
console.log(`  缺失章节合计=${totals.missingSections}  被引用 MCP 工具=${referencedTools.size}`);
if (totals.missingSections > 0) {
  for (const k of skills) {
    if (k.missingSections.length) console.log(`  [缺失] ${k.name}: ${k.missingSections.join(", ")}`);
  }
}
const badOutput = skills.filter((k) => k.outputContract.error);
if (badOutput.length) {
  for (const k of badOutput) console.log(`  [输出契约异常] ${k.name}: ${k.outputContract.error}`);
}
