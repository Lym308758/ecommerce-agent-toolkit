#!/usr/bin/env node
// L2 依赖能力层：36 MCP 工具 × 3 = 108 条 + 2 个 Python 脚本 × 4 = 8 条，共 116 条
//   D-01 tools/list 暴露且描述标注安全级   D-02 正常调用（DRY_RUN mock 往返）
//   D-03 安全门禁按分级生效（L1 无门禁 / L2 缺幂等键报错 / L3-L4 未批准返回预演）
//   SC-01 脚本正常执行   SC-02 同 run-key 幂等   SC-03 非 JSON 入参报错   SC-04 输出字段与契约比对
// 运行：node --test tests/l2-deps.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createRecorder } from "./harness/record.mjs";
import { buildRecord, readJson, ROOT, now } from "./harness/runner-utils.mjs";
import { McpClient, serverPath } from "./harness/mcp-client.mjs";

const recorder = createRecorder(join(ROOT, "tests", "report"), { fresh: true, name: "results-l2.jsonl" });
const inventory = readJson("tests/report/tool-inventory.json");
const index = readJson("tests/report/contract-index.json");
const SERVERS = [...new Set(inventory.map((t) => t.server))].sort();

// 解析可用的 Python 解释器：优先 PYTHON 环境变量，其次 PATH 上的 python / python3，
// 逐个探针验证——排除 WindowsApps 存根这类「在 PATH 上但执行即失败」的候选。
// 不硬编码任何本机路径：CI 与任意克隆者的环境各不相同。
function resolvePython() {
  const candidates = [process.env.PYTHON, "python", "python3"].filter(Boolean);
  for (const py of candidates) {
    const probe = spawnSync(py, ["-c", "import sys"], { timeout: 15000 });
    if (!probe.error && probe.status === 0) return py;
  }
  console.warn("[l2] 未探测到可用 Python，回退到 `python`（脚本用例可能失败）");
  return "python";
}
const PYTHON = resolvePython();

// 依据 inputSchema 的 required 字段生成合型伪参
function genArgs(schema, { idem = false, approve = false } = {}) {
  const props = schema?.properties ?? {};
  const required = schema?.required ?? [];
  const args = {};
  for (const key of required) {
    const p = props[key] ?? {};
    if (p.type === "string") args[key] = `test-${key}`;
    else if (p.type === "number" || p.type === "integer") args[key] = 7;
    else if (p.type === "boolean") args[key] = true;
    else if (p.type === "array") args[key] = [];
    else if (p.type === "object") args[key] = {};
    else args[key] = `test-${key}`;
  }
  if (idem) args.idempotencyKey = `l2-${Math.random().toString(36).slice(2, 10)}`;
  if (approve) args.__approved = true;
  return args;
}

function parseToolText(r) {
  try {
    return JSON.parse(r.result?.content?.[0]?.text ?? "null");
  } catch {
    return null;
  }
}

function failMsgs(rec) {
  return rec.assertions.filter((a) => !a.pass).map((a) => a.message).join("；");
}

// ============================ MCP 工具实测 ============================
for (const server of SERVERS) {
  const serverTools = inventory.filter((t) => t.server === server);

  test(`L2-MCP ${server}（${serverTools.length} 工具）`, async (t) => {
    const client = new McpClient(serverPath(ROOT, server));
    await client.start();
    t.after(() => client.stop());
    const listed = await client.listTools();
    const byName = new Map(listed.map((x) => [x.name, x]));

    for (const { tool, safety } of serverTools) {
      const idBase = `DP-${server}-${tool}`;
      const def = byName.get(tool);

      // D-01 暴露与描述
      await t.test(`${idBase}-D-01 tools/list 暴露且标注安全级`, () => {
        const t0 = now();
        const rec = buildRecord({
          id: `${idBase}-D-01`,
          layer: "L2",
          target: `${server} ${tool}`,
          category: "static",
          source: "dependency",
          severityIfFail: "Major",
          assertions: [
            { op: "exists", path: "def", message: "tools/list 必须返回该工具" },
            { op: "regex", path: "def.description", expected: `^\\[${safety}\\]`, message: `描述前缀应标注 [${safety}]` },
            { op: "exists", path: "def.inputSchema", message: "必须提供 inputSchema" },
          ],
          output: { def: def ? { name: def.name, description: def.description, inputSchema: def.inputSchema } : null },
          durationMs: now() - t0,
        });
        recorder.record(rec);
        assert.equal(rec.status, "pass", failMsgs(rec));
      });

      // D-02 正常调用
      await t.test(`${idBase}-D-02 正常调用返回 mock 结果`, async () => {
        const t0 = now();
        const args = genArgs(def?.inputSchema, { idem: safety !== "L1", approve: safety === "L3" || safety === "L4" });
        const r = await client.callTool(tool, args);
        const parsed = parseToolText(r);
        const rec = buildRecord({
          id: `${idBase}-D-02`,
          layer: "L2",
          target: `${server} ${tool}`,
          category: "normal",
          source: "dependency",
          severityIfFail: "Major",
          assertions: [
            { op: "eq", path: "isError", expected: false, message: "正常调用不应返回 isError" },
            { op: "eq", path: "ok", expected: true, message: "mock 结果 ok 应为 true" },
            { op: "eq", path: "mock", expected: true, message: "DRY_RUN 下应标记 mock=true" },
          ],
          output: { isError: r.result?.isError ?? false, ok: parsed?.ok ?? null, mock: parsed?.mock ?? null },
          durationMs: now() - t0,
        });
        recorder.record(rec);
        assert.equal(rec.status, "pass", failMsgs(rec));
      });

      // D-03 门禁
      await t.test(`${idBase}-D-03 安全门禁按 ${safety} 生效`, async () => {
        const t0 = now();
        const args = genArgs(def?.inputSchema, { idem: false, approve: false });
        delete args.idempotencyKey; // 门禁用例必须显式缺幂等键
        const r = await client.callTool(tool, args);
        const parsed = parseToolText(r);
        const text = r.result?.content?.[0]?.text ?? "";
        let assertions;
        if (safety === "L1") {
          assertions = [
            { op: "eq", path: "ok", expected: true, message: "L1 只读无门禁，缺幂等键也应正常返回" },
            { op: "eq", path: "isError", expected: false, message: "L1 不应报错" },
          ];
        } else if (safety === "L2") {
          assertions = [
            { op: "eq", path: "isError", expected: true, message: "L2 缺幂等键必须报错", severity: "Blocker" },
            { op: "regex", path: "text", expected: "idempotencyKey", message: "错误信息应点名 idempotencyKey", severity: "Blocker" },
          ];
        } else {
          assertions = [
            { op: "eq", path: "requiresApproval", expected: true, message: "L3/L4 未批准必须返回 requiresApproval", severity: "Blocker" },
            { op: "eq", path: "ok", expected: false, message: "未批准时 ok 应为 false", severity: "Blocker" },
            { op: "eq", path: "isError", expected: false, message: "审批拦截是预演而非错误" },
          ];
        }
        const rec = buildRecord({
          id: `${idBase}-D-03`,
          layer: "L2",
          target: `${server} ${tool}`,
          category: "error",
          source: "acceptance_gate",
          severityIfFail: "Blocker",
          assertions,
          output: {
            safety,
            isError: r.result?.isError ?? false,
            ok: parsed?.ok ?? null,
            requiresApproval: parsed?.requiresApproval ?? null,
            text: text.slice(0, 300),
          },
          durationMs: now() - t0,
        });
        recorder.record(rec);
        assert.equal(rec.status, "pass", failMsgs(rec));
      });
    }
  });
}

// ============================ Python 脚本实测 ============================
const SCRIPTS = [
  { skill: "replenishment-advisor", script: "skills/replenishment-advisor/scripts/replenish.py", contractKeys: ["items", "warnings"], input: { sales_window: [12, 14, 11, 13, 15, 12, 14], onhand: 40, in_transit: 30, lead_time_days: 7 } },
  { skill: "multi-platform-reconciliation", script: "skills/multi-platform-reconciliation/scripts/reconcile.py", contractKeys: ["diffs", "summary", "dataGaps"], input: { orders: [], bills: [], payments: [] } },
];

for (const sc of SCRIPTS) {
  const idBase = `SC-${sc.skill}`;

  test(`L2-Script ${sc.skill}`, async (t) => {
    const dir = mkdtempSync(join(tmpdir(), "l2-script-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    const inputPath = join(dir, "input.json");
    const outputPath = join(dir, "output.json");
    const stateDir = join(dir, "state");

    // SC-01 正常执行
    await t.test(`${idBase}-SC-01 正常执行产出契约字段`, () => {
      const t0 = now();
      writeFileSync(inputPath, JSON.stringify(sc.input));
      const r = spawnSync(PYTHON, [join(ROOT, sc.script), "--input", inputPath, "--output", outputPath, "--run-key", "2026-10-16", "--state-dir", stateDir], { encoding: "utf8", timeout: 30000 });
      let out = null;
      try {
        out = JSON.parse(readFileSync(outputPath, "utf8"));
      } catch {}
      const src = readFileSync(join(ROOT, sc.script), "utf8");
      const rec = buildRecord({
        id: `${idBase}-SC-01`,
        layer: "L2",
        target: sc.script,
        category: "normal",
        source: "output_contract",
        severityIfFail: "Major",
        assertions: [
          { op: "eq", path: "status", expected: 0, message: "退出码应为 0" },
          { op: "eq", path: "ok", expected: true, message: "输出 ok 应为 true" },
          { op: "eq", path: "runKey", expected: "2026-10-16", message: "runKey 应回显" },
          { op: "eq", path: "noPlaceholder", expected: true, message: "源码不得残留未替换占位符（{cn}/{slug}）", severity: "Minor" },
        ],
        output: { status: r.status, ok: out?.ok ?? null, runKey: out?.runKey ?? null, noPlaceholder: !/\{cn\}|\{slug\}/.test(src) },
        error: r.error,
        durationMs: now() - t0,
      });
      recorder.record(rec);
      assert.equal(rec.status, "pass", failMsgs(rec));
    });

    // SC-02 幂等：同 run-key + 同载荷二次执行应跳过且结果一致
    await t.test(`${idBase}-SC-02 同 run-key 二次执行幂等跳过`, () => {
      const t0 = now();
      const r2 = spawnSync(PYTHON, [join(ROOT, sc.script), "--input", inputPath, "--output", outputPath, "--run-key", "2026-10-16", "--state-dir", stateDir], { encoding: "utf8", timeout: 30000 });
      const first = JSON.parse(readFileSync(outputPath, "utf8"));
      const rec = buildRecord({
        id: `${idBase}-SC-02`,
        layer: "L2",
        target: sc.script,
        category: "boundary",
        source: "acceptance_gate",
        severityIfFail: "Major",
        assertions: [
          { op: "eq", path: "status", expected: 0, message: "二次执行退出码应为 0" },
          { op: "regex", path: "stdout", expected: "\\[skip\\]", message: "二次执行应打印 [skip]" },
          { op: "eq", path: "sameRunKey", expected: true, message: "输出 runKey 应保持一致" },
        ],
        output: { status: r2.status, stdout: (r2.stdout ?? "").slice(0, 200), sameRunKey: first.runKey === "2026-10-16" },
        durationMs: now() - t0,
      });
      recorder.record(rec);
      assert.equal(rec.status, "pass", failMsgs(rec));
    });

    // SC-03 异常入参：非 JSON 输入必须以非零退出且不产出输出文件
    await t.test(`${idBase}-SC-03 非 JSON 入参报错且无输出`, () => {
      const t0 = now();
      const badInput = join(dir, "bad.json");
      const badOutput = join(dir, "bad-output.json");
      writeFileSync(badInput, "this is not json {{{");
      const r = spawnSync(PYTHON, [join(ROOT, sc.script), "--input", badInput, "--output", badOutput, "--run-key", "2026-10-17", "--state-dir", stateDir], { encoding: "utf8", timeout: 30000 });
      const rec = buildRecord({
        id: `${idBase}-SC-03`,
        layer: "L2",
        target: sc.script,
        category: "error",
        source: "input_contract",
        severityIfFail: "Major",
        assertions: [
          { op: "neq", path: "status", expected: 0, message: "非 JSON 入参必须以非零退出" },
          { op: "eq", path: "noOutput", expected: true, message: "失败时不得产出输出文件" },
        ],
        output: { status: r.status, noOutput: !existsSync(badOutput) },
        durationMs: now() - t0,
      });
      recorder.record(rec);
      assert.equal(rec.status, "pass", failMsgs(rec));
    });

    // SC-04 输出字段与 SKILL.md 输出契约比对
    await t.test(`${idBase}-SC-04 输出字段与契约一致`, () => {
      const t0 = now();
      const out = JSON.parse(readFileSync(outputPath, "utf8"));
      const missing = sc.contractKeys.filter((k) => !(k in out));
      const rec = buildRecord({
        id: `${idBase}-SC-04`,
        layer: "L2",
        target: sc.script,
        category: "static",
        source: "output_contract",
        sourceRef: `skills/${sc.skill}/SKILL.md 输出契约`,
        severityIfFail: "Major",
        assertions: [
          { op: "eq", path: "missing", expected: [], message: `契约字段 ${sc.contractKeys.join("/")} 必须在输出中` },
        ],
        output: { contractKeys: sc.contractKeys, outputKeys: Object.keys(out), missing },
        durationMs: now() - t0,
      });
      recorder.record(rec);
      assert.equal(rec.status, "pass", failMsgs(rec));
    });
  });
}

test("L2 汇总：116 条用例全部执行", () => {
  assert.equal(inventory.length, 36, `期望 36 个工具，实际 ${inventory.length}`);
  assert.equal(inventory.length * 3 + SCRIPTS.length * 4, 116);
});
