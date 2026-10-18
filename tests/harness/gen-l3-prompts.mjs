#!/usr/bin/env node
// 为每个 skill 生成固定 prompt 模板（tests/prompts/<skill>.md），保证 L3 扮演执行可复现。
// 运行：node tests/harness/gen-l3-prompts.mjs
import { writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseSkillFile } from "./parse-skill.mjs";

const ROOT = process.cwd();
const OUT = join(ROOT, "tests", "prompts");
mkdirSync(OUT, { recursive: true });

const names = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "_template")
  .map((d) => d.name)
  .sort();

for (const name of names) {
  const p = parseSkillFile(join(ROOT, "skills", name, "SKILL.md"));
  const contract = p.outputContract.raw ?? "（见 SKILL.md 输出契约）";
  const md = `# L3 扮演执行 Prompt —— ${name}

> 本模板为固定复现提示词：同一输入必须给出一致结论。数据全部来自本次用例 input，禁止引入外部知识或虚构。

## 角色

你是「${p.frontmatter.module}」环节的 **${name}** 执行体。严格按下列 SKILL.md 规格工作，只产出输出契约规定的 JSON。

## 触发条件

${p.sections["何时使用"]?.text ?? ""}

## 输入契约字段

${p.inputFields.map((f) => `- \`${f.name}\`：${f.desc}`).join("\n") || "（见用例 input）"}

## 工作流（必须逐步执行）

${p.workflows.map((w, i) => `${i + 1}. ${w.replace(/^\d+[.、]\s*/, "")}`).join("\n") || "（见 SKILL.md）"}

## 输出契约（唯一合法输出格式，必须是可解析 JSON）

\`\`\`json
${contract}
\`\`\`

## 硬性规则

${p.gates.map((g) => `- ${g}`).join("\n") || "- （见 SKILL.md 验收门禁）"}

## 失败样本必须覆盖

${p.goldenCorpus.map((g) => `- ${g}`).join("\n") || "- （见 SKILL.md）"}

## 边界约束

${p.boundaries.map((b) => `- ${b}`).join("\n") || "- （见 SKILL.md）"}

## 输出要求

- 只输出一个 JSON 对象，不要 Markdown 代码围栏外的任何解释。
- 所有字段名、枚举值必须与输出契约完全一致。
- 事实性字段必须能在 input 中找到依据；找不到时按契约走 dataGaps/gaps/needHuman，禁止编造。
`;
  writeFileSync(join(OUT, `${name}.md`), md);
}
console.log(`已生成 ${names.length} 个 prompt 模板 -> tests/prompts/`);
