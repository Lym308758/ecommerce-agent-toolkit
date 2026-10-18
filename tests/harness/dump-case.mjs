#!/usr/bin/env node
// 辅助脚本：查看某 skill 的 L3 用例（输入 + 断言），用于 author 执行产物。
// 用法：node tests/harness/dump-case.mjs <skill>
import { readFileSync } from "node:fs";
import { join } from "node:path";

const skill = process.argv[2];
const files = [
  "tests/cases/l3-cases-proc-goods.json",
  "tests/cases/l3-cases-marketing.json",
  "tests/cases/l3-cases-orders-service.json",
  "tests/cases/l3-cases-logistics-finance.json",
];
const cases = [];
for (const f of files) {
  const d = JSON.parse(readFileSync(join(process.cwd(), f), "utf8"));
  cases.push(...d.cases.filter((c) => c.target === skill));
}
if (cases.length === 0) {
  console.error(`未找到 ${skill} 的用例`);
  process.exit(1);
}
for (const c of cases) {
  console.log(`\n========== ${c.id} [${c.category}] ${c.scenario}`);
  console.log("--- input:", JSON.stringify(c.input));
  console.log("--- assertions:");
  for (const a of c.assertions) console.log(`    ${a.op} ${a.path ?? "$"} ${a.expected !== undefined ? JSON.stringify(a.expected) : ""}  // ${a.message ?? ""}`);
  console.log("--- preconditions:", JSON.stringify(c.preconditions ?? []));
  console.log("--- judgeRubric:", JSON.stringify(c.judgeRubric ?? []));
  console.log("--- stabilityKeys:", JSON.stringify(c.stabilityKeys ?? []));
}
