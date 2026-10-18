#!/usr/bin/env node
// L0 契约解析：把 SKILL.md 解析为结构化契约对象，供 L1/L2/L3 用例生成与覆盖率统计使用。
// 解析目标：frontmatter / 8 章节 / 输入字段 / 输出契约 JSON（含枚举识别）/ 验收门禁 / Golden Corpus / 依赖能力 / 边界
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REQUIRED_SECTIONS = ["何时使用", "输入契约", "工作流", "输出契约", "验收门禁", "失败样本（Golden Corpus）", "依赖能力", "边界"];

// 识别 "merchant|logistics|customer|undetermined" 形式的枚举串
const ENUM_RE = /^[A-Za-z0-9_-]+(?:\|[A-Za-z0-9_-]+)+$/;

export function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const fm = {};
  if (!m) return { fm, raw: "" };
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]\w*):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return { fm, raw: m[1] };
}

export function parseSections(md) {
  const sections = {};
  let current = null;
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      current = h[1];
      sections[current] = [];
      continue;
    }
    if (current) sections[current].push(line);
  }
  // 每节转回文本 + 提取列表项
  const out = {};
  for (const [k, v] of Object.entries(sections)) {
    out[k] = {
      text: v.join("\n").trim(),
      items: v
        .map((l) => l.replace(/^\s*-\s+/, "").trim())
        .filter((l) => l.length > 0),
    };
  }
  return out;
}

export function parseInputFields(section) {
  // 形如：- `sales_window`：近 N 天销量（建议 14/28 天）
  const fields = [];
  for (const item of section?.items ?? []) {
    const m = item.match(/^`([^`]+)`\s*[：:]\s*(.*)$/);
    if (m) fields.push({ name: m[1], desc: m[2] });
  }
  return fields;
}

export function parseOutputContract(section) {
  // 取第一个 ```json 围栏块
  const m = (section?.text ?? "").match(/```json\s*\r?\n([\s\S]*?)```/);
  if (!m) return { raw: null, json: null, error: "未找到 ```json 输出契约块", enums: [], leaves: [] };
  const raw = m[1].trim();
  try {
    const json = JSON.parse(raw);
    return { raw, json, error: null, ...describeContract(json) };
  } catch (e) {
    return { raw, json: null, error: `输出契约 JSON 解析失败：${e.message}`, enums: [], leaves: [] };
  }
}

// 递归提取叶子字段路径与枚举约束
export function describeContract(node, prefix = "", acc = { enums: [], leaves: [] }) {
  if (node === null || node === undefined) return acc;
  if (Array.isArray(node)) {
    acc.leaves.push({ path: prefix || "$", kind: "array" });
    if (node.length > 0) describeContract(node[0], `${prefix}[]`, acc);
    return acc;
  }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string" && ENUM_RE.test(v)) {
        acc.enums.push({ path, values: v.split("|") });
        acc.leaves.push({ path, kind: "enum" });
      } else if (typeof v === "object" && v !== null) {
        describeContract(v, path, acc);
      } else {
        acc.leaves.push({ path, kind: Array.isArray(v) ? "array" : typeof v });
      }
    }
    return acc;
  }
  acc.leaves.push({ path: prefix || "$", kind: typeof node });
  return acc;
}

export function parseDependencies(section) {
  // 形如：- `mcp/wms-mcp get_stock` 或 - `adapters/xxx` 或 - `skills/xxx`
  const deps = [];
  for (const item of section?.items ?? []) {
    const m = item.match(/^`mcp\/([a-z0-9-]+)\s+([a-z0-9_]+)`/i);
    if (m) {
      deps.push({ server: m[1], tool: m[2], ref: `mcp/${m[1]} ${m[2]}` });
      continue;
    }
    const ref = item.replace(/^`|`$/g, "").trim(); // 去掉首尾反引号
    deps.push({ server: null, tool: null, ref });
  }
  return deps;
}

export function parseSkillFile(filePath) {
  const md = readFileSync(filePath, "utf8");
  const { fm } = parseFrontmatter(md);
  const sections = parseSections(md);
  const missingSections = REQUIRED_SECTIONS.filter((s) => !sections[s]);
  const inputFields = parseInputFields(sections["输入契约"]);
  const output = parseOutputContract(sections["输出契约"]);
  return {
    file: filePath,
    frontmatter: fm,
    sections,
    missingSections,
    inputFields,
    inputFieldNames: inputFields.map((f) => f.name),
    outputContract: output,
    gates: sections["验收门禁"]?.items ?? [],
    goldenCorpus: sections["失败样本（Golden Corpus）"]?.items ?? [],
    dependencies: parseDependencies(sections["依赖能力"]),
    boundaries: sections["边界"]?.items ?? [],
    workflows: sections["工作流"]?.items ?? [],
  };
}

export function skillDir(root, name) {
  return join(root, "skills", name, "SKILL.md");
}
