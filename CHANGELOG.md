# Changelog

本文件记录项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。
章节标题保留英文（规范约定），条目正文使用中文。

## [Unreleased]

计划中的工作见 [`ROADMAP.md`](ROADMAP.md)（中文版见 [`docs/ROADMAP.zh.md`](docs/ROADMAP.zh.md)）。目标：**v0.2.0 硬化** —— CI 全量接入（Node 20/22 矩阵），并清零 [`docs/testing-report.md`](docs/testing-report.md) 第十节列出的 10 项遗留。

## [0.1.0] - 2026-10-19

首个公开预览版。覆盖电商九大业务环节的 62 项能力，配套四层自动化测试（460 条记录全绿）。

### Added

- **能力台账** — `capability-bank.json` 作为 62 项能力的唯一权威数据源（业务环节、优先级、部署方式、安全分级、台账状态、来源、产物路径）。Markdown 与 HTML 视图均由其渲染。
- **8 个自建 MCP Server**（`mcp/`）— `erp-scm`、`sourcing-1688`、`oms`、`platform-im`、`wms`、`express`、`express-intercept`、`finance-erp`。TypeScript + MCP SDK，stdio 协议，36 个工具，真实/mock 双实现，默认 `DRY_RUN=1`。
- **20 个编排型 Skill**（`skills/`）— 统一八章节规格：何时使用、输入契约、工作流、输出契约、验收门禁、失败样本、依赖能力、边界。
- **17 份第三方适配器接入文档**（`adapters/`）— 安装命令、MCP 配置片段、授权清单；不复制第三方源码。
- **四层测试体系**（`tests/`）— L0 契约解析、L1 静态契约（80）、L2 依赖能力（116）、L3 场景执行（264 条记录 / 120 条用例）；21 个断言算子；聚合与报告流水线。
- **治理规范**（`docs/governance.md`）— L1–L4 安全分级、HITL 外发状态机、幂等与恢复、预算与循环防护、验收门禁、授权与合规边界。
- **仓库脚本** — `validate.mjs`（台账一致性）、`check-secrets.mjs`（凭证泄漏扫描）、`build.mjs`、`test-all.mjs`。
- **两条端到端示例链**（`examples/`）— 大促作战链、售后闭环链。
- **CI 工作流** — 推送与 PR 时执行校验、凭证扫描与 MCP 冒烟测试。
- **英文发布资产** — `ROADMAP.md`（英文路线图）、`docs/release-notes-v0.1.0.en.md`（附加语种发布说明）。

### Changed

- **能力台账状态校正（2026-10-19）** —— 28 项已建成并通过测试的能力此前仍标记为 `planned` / `integrated_pending`，现校正为 `connected` / `ok`；`verified` 保持 0（须真实业务环境验收证据）。对外口径改为「已建成 44 / 待接入 18」，替代原「需建设 21 项」。`scripts/validate.mjs` 新增双向一致性检查，台账与实物再次脱节将直接报错。
- **`tests/report/artifacts/` 纳入版本控制** —— 这 216 条场景产物是 264 条 L3 记录的判定依据，此前被 `.gitignore` 排除，导致全新检出无法复现测试结果。`results*.jsonl` 与 `summary.json` 仍保持忽略（可再生）。
- **发布语种** —— Release 正文使用中文版 `docs/release-notes-v0.1.0.md`，英文版作为附加语种保留；路线图新增中文版 `docs/ROADMAP.zh.md`。

### Fixed

首轮全量测试发现的缺陷——能力层 8 个、测试框架自身 3 个，全部修复并回归通过（460/460）。

- `multi-platform-reconciliation/scripts/reconcile.py` 输出字段与自身契约不符，且差异计算为 TODO 骨架。已重写：按订单号三方对齐，输出四类差异（`underpaid` / `overcharged` / `missing` / `refund_unsynced`），每笔附可复算的 `basis` 算式，汇总等于各笔之和。*(Major)*
- 5 个 skill（`ad-report-insight`、`order-status-bot`、`sentiment-escalation`、`shipment-anomaly`、`supplier-evaluation`）的 Golden Corpus 各仅有 1 条失败样本，低于 ≥2 的门禁要求。每个补 1 条。
- `reconcile.py` 与 `replenish.py` 的 docstring 残留模板占位符 `{cn}` / `{slug}`。
- `tests/harness/assert.mjs` —— `getPath` 不支持 `items[0].suggestQty` 这类下标路径，导致 45 条断言静默取到 `undefined`；`sumApprox` 忽略 `expected.field`，无法对对象数组按字段求和。
- `tests/harness/runner-utils.mjs` —— `buildRecord` 用原始 output 重跑断言、丢失派生字段，致使 264 条记录中 194 条误报失败（测试实际通过）。
- `tests/harness/record.mjs` —— 三层测试均以 `fresh: true` 写同一个 `results.jsonl`，互相删除记录。已按层分文件。
- `scripts/validate.mjs` —— 类别计数归零时 `undefined !== 0` 导致误报（台账校正后 `build` 归零才暴露）。

---

[Unreleased]: https://github.com/Lym308758/ecommerce-agent-toolkit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Lym308758/ecommerce-agent-toolkit/releases/tag/v0.1.0
