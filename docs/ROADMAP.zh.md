# 路线图

覆盖电商公司**九大核心业务环节**（采购供应、商品管理、营销推广、交易订单、客户服务、物流仓储、售后处理、财务对账、数据分析）的 AI Agent 能力工具箱。

本文档记录接下来的交付计划。英文版见 [`ROADMAP.md`](../ROADMAP.md)；完整任务分解、风险登记与决策记录见 [`docs/iteration-plan.md`](iteration-plan.md)。

---

## 当前状态

| | |
|---|---|
| **当前版本** | `v0.1.0`（预发布） |
| **能力总数** | 62 —— 20 个编排型 Skill、8 个自建 MCP Server（36 个工具）、17 份第三方适配器接入文档、16 项平台内置 |
| **建设状态** | 44 项已建成并通过四层测试；18 项适配器仅有接入文档、尚未联调；**0 项经真实业务环境验收** |
| **测试状态** | 460 条执行记录，通过率 100%（[`docs/testing-report.md`](testing-report.md)） |
| **下一里程碑** | `v0.2.0 硬化` |

> **诚实状态**：所有外部集成目前都跑在 `DRY_RUN=1` 沙箱模式下，尚未对接任何真实店铺、仓库或广告账户。补上这段差距正是 `v0.3.0` 的全部意义。

## 图例

| 标记 | 含义 |
|---|---|
| ✅ | 已完成 |
| 🚧 | 进行中 |
| ⬜ | 计划中 |
| 🔒 | 依赖你的环境——需要真实凭证、开放平台资质或测试店铺 |

---

## 里程碑

### v0.2.0 硬化 ⬜

**目标**：让 460 条测试记录在干净检出上可复现，并由 CI 强制守护。本版不新增业务能力。

- [x] **L3 黄金产物入库**。`tests/report/artifacts/`（256 KB，216 个产物键）是 264 条场景记录的判定依据，此前被 `.gitignore` 排除，导致全新检出无法复现测试。现已作为黄金回归资产纳入版本控制。
- [x] **能力台账状态校正**。28 项能力代码早已建成并通过测试，台账却仍标记为 `planned` / `build`。已校正为 `connected` / `ok`；`verified` 保持 0（须真实环境证据）。`scripts/validate.mjs` 新增双向检查，台账与实物再次脱节将直接报错。
- [ ] **CI 全量接入**。把 `.github/workflows/ci.yml` 从「仅冒烟」扩展到完整金字塔：`validate` → `lint:secrets` → `build` → `test:all` → `report`，Node 20/22 矩阵（Windows 作为夜间任务）。
- [ ] **清零 [`docs/testing-report.md`](testing-report.md) 第十节的 10 项遗留**：
  - [ ] 修正 `supplier-evaluation` N-02 的期望分数值区间。
  - [ ] 澄清三处自相矛盾的用例（`inventory-alert` E-02、`review-operations` N-01、`aftersales-liability` E-01）。
  - [ ] 扩展两处契约：`shipment-anomaly` 增加 `data_unavailable` / `data_mismatch`；`supplier-evaluation` 允许 `score: null`。
  - [ ] 为 `tests/harness/assert.mjs` 的 21 个断言算子补单元测试。
  - [ ] 把 `replenish.py` 的骨架实现替换为确定性计算（对齐 `reconcile.py` 的做法）。

### v0.3.0 联通 🔒

**目标**：把「沙箱里全绿」推进为「真实环境有证据」。每一项都需要人工批准的环境。

- [ ] **联调指南**。`docs/integration-guide.md`：测试店铺 / 测试仓的灰度流程、凭证配置、`DRY_RUN` → 真实的切换开关、观察期指标、回滚步骤。
- [ ] **真实环境演练**：至少对一个自建 MCP Server 完成一次联调（候选：`wms-mcp` 或 `erp-scm-mcp`，均为 L2 可逆写）。
- [ ] **实测 P0 只读适配器** —— `mcp-cn-commerce`、`postgres-mcp`、`playwright-mcp` —— 并公布沙箱数据与真实数据的差异清单。
- [ ] **judge 独立性**。L3 场景评分目前由执行 Agent 自评，改为执行/评审分离，或退而采用 10% 人工抽检，并公布偏差。
- [ ] **≥10 项能力推进到 `verified`**，逐项记录环境、日期与证据（[`docs/governance.md`](governance.md) 第 3 节）。

### v0.4.0 扩展 ⬜

- [ ] **性能与并发基线** —— 目前只测了单次调用耗时（L2：平均 29 ms / 最大 585 ms）。补充并发 spawn、Skill 端到端耗时，以及 `maxToolCalls` / `maxTokens` 预算防护的实测。
- [ ] **案例库** —— `examples/` 从 2 条链扩充到 ≥9 条，每个业务环节一条，含输入样例、执行路径与预期产物。
- [ ] **可观测性** —— L2 及以上写操作的审计日志规范（谁 / 何时 / 哪个工具 / 什么参数 / `idempotencyKey`）、调用指标，以及经 IM 适配器的告警链路。
- [ ] **剩余 P1/P2 能力**，依据 `v0.3.0` 的结果排优先级。

### v1.0.0 生产化 ⬜

- [ ] **安全审计** —— L3/L4 审批链端到端演练，含审批绕过、越权、重放攻击；密钥轮换；扩充 `check-secrets` 规则。
- [ ] **多租户** —— 店铺级数据与凭证隔离、租户级配额。
- [ ] **SLA 与运维** —— 可用性目标、LLM 网关降级路径、`DRY_RUN` → 真实切换的运维 SOP、事故响应流程。
- [ ] **契约版本化** —— minor（新增枚举值、新增可选字段）与 major（删除字段、语义变更）的划分规则与升级指南。

---

## 每版验收门禁

1. `npm run validate` 通过，台账与实物一致。
2. 干净检出：`git clone` → `npm ci && npm run build && npm run test:all` → **460/460**。
3. `npm run report` 重新生成 [`docs/testing-report.md`](testing-report.md)；任何回归都记为「首轮 X/460 → 修复后 460/460」。
4. 台账状态变更必须附证据。
5. L3/L4 写操作与任何对外动作，均须人工确认后再执行。

---

## 明确不做

- 真实店铺的日常运营——这是能力工具箱，不是运营系统。
- 商业授权、计费、License 服务器。
- 逆向协议、绕过平台风控、批量爬取私有数据。这是 [`docs/governance.md`](governance.md) 第 7 节的硬性红线。
- 电商领域之外的扩张。
- `v1.0.0` 之前的分布式 / 多机部署。

---

## 参与方式

路线图条目都按「可独立提交、可独立回归」的粒度切分。如果你想认领一项：

1. 先读 [`docs/governance.md`](governance.md) —— 安全分级与 HITL 规则是硬性约束，不是建议。
2. 读 [`CONTRIBUTING.md`](../CONTRIBUTING.md)。
3. 开 issue 说明你要认领哪个里程碑条目，以便台账保持准确。

标有 🔒 的 `v0.3.0` 条目需要真实环境；如果你有测试店铺或沙箱凭证，那是贡献价值最高的地方。
