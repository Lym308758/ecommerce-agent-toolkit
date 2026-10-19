# 迭代计划：从 v0.1.0 到 v1.0.0

- 文档性质：**计划文档（Plan Mode）**。本文只定义「做什么、为什么、怎么验收」；其中所有任务均**未执行**。v0.1.0 预发布的 git 动作（remote / push / tag / release）同样仍待审核，执行清单见本文第十节附节（本地 commit 已完成）。
- 制定依据：`docs/testing-report.md`（460 条记录全量测试）、`docs/governance.md`（治理规范）、`capability-bank.json`（62 项能力台账）、仓库实物盘点（2026-10-17）。
- 审批流：每版计划 → 人类审核 → 执行 → 回归测试 → 更新测试报告与台账 → 进入下一版。

---

## 一、现状基线（计划的事实起点）

### 1.1 已达成（v0.1.0）

| 维度 | 数据 |
|---|---|
| 测试记录 | 460 条全绿（L1 静态契约 80 + L2 依赖能力 116 + L3 场景执行 264）；首轮 452/460 → 修复 8 缺陷（1 Major + 7 Minor）→ 回归 460/460，`npm run test:all` 219/219 用例全绿 |
| Skill | 20/20 建成并通过 L1-L3；P0 的 8 个三轮回跑稳定性 48/48；judge 加权分均值 0.979 / 最低 0.860 |
| MCP | 8/8 Server 建成（36 个工具），L2 真实 spawn 验证：L1 直调 / L2 幂等键门禁 / L3-L4 预演待审批，无一误放行 |
| 安全治理 | 四级分类落地；HITL 状态机、幂等键、预算与循环防护均有实现与测试 |
| 文档 | architecture / capability-matrix / getting-started / governance / testing-report / release-notes 六篇 + 17 份 adapter 接入文档 + 2 条端到端案例 |

### 1.2 本轮盘点新发现的三个结构性缺口

计划的核心输入不是「继续建设」，而是以下三个在测试全绿表象之下的事实：

| # | 缺口 | 证据 | 影响 |
|---|---|---|---|
| G1 | **L3 黄金产物未入库，CI 无法全量** | `.gitignore` 第 14 行 `artifacts/` 命中 `tests/report/artifacts/`（256K / 20 文件，git check-ignore 实测确认）；全新检出后 L3 运行器全部报「执行产物缺失」 | CI 一旦从「仅冒烟」扩展到「分层全量」必红；`npm run test:all` 在他人机器上不可复现 |
| G2 | **能力台账滞后于实物，治理语义失效** | 台账 62 项中 21 项标记 `availability: build / ledger: planned`，但 13 个 skill + 8 个 MCP **实物已全部建成且通过测试**；`scripts/validate.mjs` 只校验目录存在，不校验状态语义，所以滞后一直不可见 | governance 第 3 节「注册 ≠ 可用」的台账失去决策价值；对外展示的「需自建 21 项」与实际不符 |
| G3 | **真实环境联调为零，全部能力停在 connected/integrated_pending** | 62 项中 verified 0 项；所有外部行为经 `DRY_RUN=1` 沙箱预演；17 份 adapter 只有文档没有一次真实调用记录 | 「开箱即用」缺乏证据；L3 场景为 Agent 推演自评，与真实数据分布可能存在系统性偏差 |

### 1.3 台账真实状态重估（用于设定各版目标）

| 台账标记 | 项数 | 实物实况（2026-10-17 盘点） |
|---|---|---|
| connected（16，全部 builtin） | 16 | 平台内置，属实 |
| integrated_pending（25：18 adapter + 7 skill） | 25 | **7 个 skill 已全部建成并测试通过**；18 个 adapter 仅有接入文档 |
| planned（21：13 skill + 8 mcp） | 21 | **实物已全部建成并通过测试**，状态滞后 |
| **verified** | **0** | 无任何真实业务环境验收 |

**结论：建设期已基本结束。** 44/46 项仓库内能力（20 skill + 8 mcp + 16 builtin）已有实物；下一阶段的主线是 **硬化发布基建（v0.2）→ 真实联通与验收（v0.3）→ 扩展与生产化（v0.4 / v1.0）**，而不是继续从零建设。

---

## 二、迭代原则

1. **每版以可验证门禁收口**：每版定义 Definition of Done（全绿命令 + 台账状态目标 + 证据落点），不达标不发版。
2. **测试先行，双数字叙事**：每轮迭代先跑 `npm run test:all` 取基线，修复后回归，把「首轮 X/N → 回归 N/N」回写 `docs/testing-report.md`（v0.1.0 已验证该模式有效）。
3. **台账跟随实物**：任何目录/契约变更同轮更新 `capability-bank.json`；状态推进必须有证据（环境、日期、记录），与 governance 第 3 节一致。
4. **人类决策点前置**：L3/L4 动作、真实平台凭证、对外发布，一律人工确认后执行（本计划不含任何真实外发动作）。
5. **小步可回退**：每任务独立提交、独立可回归；契约变更为 minor 级别（新增枚举/null 允许）不破坏既有产物，除非显式标记 major。

---

## 三、版本路线图总览

| 版本 | 主题 | 核心目标 | 台账目标 | 工作量预估 |
|---|---|---|---|---|
| v0.2.0 | 硬化期 Harden | 修复 G1/G2：测试资产入库、CI 全量、台账校正、测试报告 10 项遗留清零 | 44 项实物全部标记正确状态 | 4-6 会话 |
| v0.3.0 | 联通期 Connect | 修复 G3：真实环境联调指南 + P0 只读 adapter 实测 + judge 独立性 | ≥10 项转 verified | 6-9 会话 |
| v0.4.0 | 扩展期 Extend | 性能/并发基线、案例库扩充、可观测性规范 | 视 C 阶段结果 | 4-6 会话 |
| v1.0.0 | 生产化 Productionize | 安全审计、多租户隔离、SLA、契约版本化 | verified 覆盖全部 P0 | 6-9 会话 |

> 工作量单位「会话」= 一次 Agent 工作会话（含人工审核往返）。S≈1 会话，M≈2-3，L≈4+。

---

## 四、v0.2.0 硬化期 —— 任务分解

> 目标：让「460 条全绿」在**任何机器、任何全新检出**上可复现，并让台账重新可信。本版不引入任何新业务能力。

### H1 · L3 黄金产物入库策略（阻塞项，优先级最高）

- **内容**：决定 `tests/report/artifacts/`（256K，20 个文件，216 个产物键）的版本化策略。
  - **推荐方案（待审核确认）**：将 artifacts 提交入库，定位为「L3 黄金回归资产」——与 governance 第 6 节 Golden Corpus 理念一致，且体积极小；`results-l*.jsonl` 与 `summary.json` 保持 ignore（可再生，由 `npm run report` 重建）。
  - 备选方案 A：CI 跳过 L3（放弃全新检出全量验证，不推荐）；备选方案 B：提供 artifacts 再生成脚本（工作量大且引入「生成即正确」循环论证，不推荐）。
- **配套**：`scripts/test-all.mjs` 在 artifacts 缺失时给出明确报错与指引（现状是 264 条记录全部以 error 形式失败，信息不可操作）。
- **验收**：`git clone` 到干净目录 → `npm ci && npm run build && npm run test:all` → 460/460 通过，无需任何本地 artifacts。
- **依赖**：无（H2 的前置）。
- **规模**：S。**风险**：低（黄金资产腐化风险由 H4-R4 登记册管控）。

### H2 · CI 全量化接入

- **内容**：扩展现有 `.github/workflows/ci.yml`（当前仅 ubuntu + node 22 + validate/secrets/冒烟）：
  - 矩阵：node 20 × 22（engines 声明 >=20）；OS 先 ubuntu-latest，windows-latest 作为夜间任务（规避 Windows 换行符/路径差异，见 R5）。
  - 步骤链：`validate` → `lint:secrets` → `npm ci` → `build` → `test:all`（DRY_RUN=1）→ `report` → 上传 `docs/testing-report.md` 为 workflow artifact。
  - 发布门槛：main 分支保护规则要求 CI 全绿。
- **验收**：推送后 Actions 两次矩阵运行均绿；workflow artifact 中可下载测试报告。
- **依赖**：H1（否则 L3 步必红）。
- **规模**：M。**风险**：中（Linux 下 MCP spawn 行为差异；需实测一轮）。

### H3 · 测试报告 10 项遗留改进清零（第十节编号 1-10）

| 子任务 | 对应改进项 | 内容 | 验收 |
|---|---|---|---|
| H3a | #1 | supplier-evaluation N-02 期望区间修正为 [0.869, 0.871]（或 fixture 权重调整） | 该用例无偏差披露注释 |
| H3b | #2 #5 #6 | inventory-alert E-02 矛盾澄清；review-operations N-01 差评率口径补全；aftersales-liability E-01 场景与 rubric 表述统一 | 三用例场景/断言/rubric 自洽 |
| H3c | #3 #4 | 契约扩展：shipment-anomaly 枚举增加 `data_unavailable`/`data_mismatch`；supplier-evaluation 综合分允许 `null` | SKILL.md 输出契约 + L1 契约测试 + L3 用例产物同轮更新，回归全绿 |
| H3d | #7 | 为 assert.mjs 21 个算子补单测（含 `field[idx]`、`sumApprox.field`、`noZeroFill` 边界） | `node --test` 算子单测独立通过 |
| H3e | #10 | replenish.py 按 reconcile.py 同款方式补全确定性计算（补货量公式） | L2 脚本层 4 类用例锁定算术；SKILL.md 口径不变 |
| H3f | #8 #9 | 归入 H2 与本版预留（#9 judge 独立性移交 v0.3 C3） | — |

- **注意**：H3c 修改输出契约后，`tests/report/artifacts/` 中对应 skill 的产物必须同轮重新 author 并回归（否则 H1 的黄金资产与新契约不一致）。
- **验收**：`npm run test:all` 全绿 + 测试报告第十节遗留项全部关闭（新报告记录第二轮双数字）。
- **依赖**：H1（产物同轮变更）；H3d 无依赖。
- **规模**：M。**风险**：中（契约扩展可能牵连下游 L3 产物）。

### H4 · 台账校正与 validate 增强（修复 G2）✅ 已完成

> **状态：已随 v0.1.0 完成**（原属 v0.2，已前置；见第十节决策 #2）。以下为当时的任务描述，保留作执行记录。

- **内容**：
  1. `capability-bank.json` 状态重估：21 项 `availability: build / ledger: planned` → 实物已建成，`availability` 改 `ok`、`ledger` 改 `connected`（语义：仓库内已接入，业务未验收——与治理规范第 3 节一致；`verified` 严格保留给真实环境验收，留给 v0.3）。7 个 integrated_pending 的 skill 同理改 `connected`。adapter 的 18 项维持 integrated_pending（仅有文档，诚实标注）。
  2. `scripts/validate.mjs` 增强：新增「状态-实物一致性」检查——`ledger: planned` 或 `availability: build` 但 artifact 目录齐全 → 报 problem（防止台账再次滞后）；`ledger: connected` 但目录缺失 → 报 problem。
  3. `counts` 字段随改随校验（validate 已有该机制）。
- **验收**：`npm run validate` 通过；台账对外表述（README / capability-matrix / release-notes 中引用的「62 项 / 需自建 21」等数字）同步刷新为真实口径；反向验证：手工把一项改回 planned 能被 validate 抓住。
- **依赖**：无（与 H1/H3 并行）。**规模**：S。**风险**：低-中（对外数字变化需同步多处文档，防遗漏——用 grep 全仓库扫描引用点）。

### v0.2.0 版本门禁（Definition of Done）

1. 干净检出 `npm ci && npm run build && npm run test:all` 460/460（H1+H2）。
2. CI 双 node 矩阵绿（H2）。
3. 测试报告第十节 10 项遗留全部关闭，报告更新为第二轮双数字（H3）。
4. `npm run validate` 通过且台账状态与实物一致（H4）。
5. tag `v0.2.0` + release notes（**需人工确认后执行**）。

---

## 五、v0.3.0 联通期 —— 任务分解

> 目标：把「DRY_RUN 沙箱全绿」推进为「真实环境有证据」。本版开始接触真实外部系统，全部动作人工确认、灰度先行。

### C1 · 真实环境联调指南

- **内容**：新文档 `docs/integration-guide.md`：测试店铺 / 测试仓灰度流程、凭证配置（`.env.example` 已有骨架）、DRY_RUN→真实的切换开关、观察期指标、回滚步骤。联调记录模板（环境、日期、操作、结果、证据链接）——即 governance 第 3 节 verified 所要求的「验证环境、日期与证据」。
- **验收**：按指南对一个内置 MCP（建议 wms 或 erp-scm，L2 可逆写）完成一次测试环境联调并留存记录。
- **依赖**：v0.2.0 发布。**规模**：M。**风险**：高（依赖用户侧提供测试环境与凭证；不可得时降级为「指南 + 社区 MCP 演示」）。

### C2 · P0 只读 adapter 实测联调

- **内容**：优先 L1 只读类（无副作用，最适合首批）：`mcp-cn-commerce`（经营数据）、`postgres-mcp`（业务库查询）、`playwright-mcp`（后台截图）。输出：每项一份联调记录 + 与 DRY_RUN 预演数据的差异说明（验证 G3 中「mock 掩盖真实异常」的假设）。
- **验收**：≥3 项联调记录入库；差异清单回写测试报告「环境假设与限制」节。
- **依赖**：C1。**规模**：L。**风险**：高（平台资质/授权；社区 MCP 稳定性）。

### C3 · judge 独立性（测试报告改进 #9）

- **内容**：二选一（建议 A）：
  - A. 执行-评审分离：L3 产物 author 后，由独立 Agent 实例按同一 rubric 复评，分歧 ≥0.1 的用例人工仲裁；
  - B. 人工抽检 10% 用例（12 条）并记录抽检口径。
- **验收**：抽检/复评报告；judge 分与人工分偏差统计（目标：均值差 ≤0.05）。
- **依赖**：H1（产物在库才能复评）。**规模**：M。**风险**：中（复评者与被评者若同模型仍可能同偏，需在报告中披露）。

### C4 · 台账推进至 verified

- **内容**：按 C1/C2 证据，将完成真实联调的能力 `ledger: connected → verified`，逐项记录环境/日期/证据；未联调项维持 connected，不得虚报。
- **验收**：台账 verified ≥10 项；`npm run validate` 增加 verified 必须有证据字段的检查。
- **依赖**：C1-C3。**规模**：S。**风险**：低。

### v0.3.0 版本门禁

1. integration-guide.md 发布且至少 1 次内置 MCP 测试环境联调（C1）。
2. ≥3 项 P0 只读 adapter 联调记录（C2）。
3. judge 独立性机制落地并有报告（C3）。
4. verified ≥10 项且证据齐全（C4）。

---

## 六、v0.4.0 扩展期 —— 任务分解

### E1 · 性能与并发基线（填补测试报告「未覆盖项」）

- **内容**：MCP 并发 spawn 压测（当前 L2 单工具 max 585ms；目标：并发 50 调用的成功率与 p95）、skill 端到端耗时基线、governance 第 5 节 `maxToolCalls`/`maxTokens` 预算的实测验证、工具重试与循环防护的触发测试。
- **验收**：性能基线报告（吞吐 / p50 / p95 / 失败率）；超预算场景按治理规则停止并告警的实测记录。
- **依赖**：v0.2.0 CI 基建（压测脚本可入 CI 夜间任务）。**规模**：M。**风险**：中（Windows 本地环境与 CI 数据需分开口径）。

### E2 · 案例库扩充

- **内容**：`examples/` 从 2 条链（aftersales-closure-chain、promo-battle-chain）扩充至覆盖九大业务模块各 ≥1 条代表链，每链含输入样例、执行路径、预期产物与对应测试用例 ID。
- **验收**：≥9 条链；每条链可在测试环境复现（或引用对应 L3 用例）。
- **依赖**：无。**规模**：M。**风险**：低。

### E3 · 可观测性规范

- **内容**：L2+ 写操作审计日志格式规范（谁/何时/何工具/何参数/何结果/idempotencyKey）；调用 metrics（量、失败率、耗时）接线 IM 通知 adapter（base-10，注意其 L4 分级走 HITL）。
- **验收**：审计日志 schema 文档 + 至少 1 条告警链路实测（DRY_RUN 下）。
- **依赖**：H4 台账（im-notify 状态准确）。**规模**：M。**风险**：中（L4 外发审批链端到端）。

### E4 · 剩余能力按需补齐

- **内容**：v0.3 后仍未 verified 的 P1/P2 项（如 1688 寻源、FAQ 进化、发票税务等）按业务优先级挑选推进；每项沿用四层测试与台账流程。
- **验收**：所选项达到与 v0.1.0 同等的测试覆盖。
- **依赖**：C4 结论。**规模**：L（弹性）。**风险**：中（范围蔓延，见 R7）。

---

## 七、v1.0.0 生产化 —— 任务分解

| # | 任务 | 内容 | 验收 |
|---|---|---|---|
| P1 | 安全审计 | L3/L4 审批链端到端演练（含审批绕过尝试、越权调用、重放攻击）；密钥卫生与轮换；`check-secrets` 规则扩充 | 审计报告 + 越权/重放用例全部按预期拒绝 |
| P2 | 多租户与隔离 | 店铺级数据隔离、凭证隔离、租户级配额（governance 第 5 节额度上限落地） | 跨租户访问被拒的实测记录 |
| P3 | SLA 与运维 | 可用性目标、降级预案（LLM 网关降级链）、DRY_RUN→生产开关的运维 SOP、事故响应流程 | SLA 文档 + 降级演练记录 |
| P4 | 契约版本化策略 | 输出契约变更规则（minor=新增枚举/可选字段；major=字段删除/语义变更）+ 升级指南 | 版本化策略文档；H3c 类变更按 minor 流程走的实例 |

**v1.0.0 版本门禁**：P1-P4 全部交付；verified 覆盖全部 P0 能力（20 项中的 P0 集合）；测试记录 ≥460 条且全绿（新增能力带来的增量）。

---

## 八、风险登记册

| # | 风险 | 概率/影响 | 缓解 |
|---|---|---|---|
| R1 | 真实平台 API 资质/授权不可得，C2 受阻 | 高/高 | 优先官方远程 MCP（Stripe/Klaviyo 类）与社区高星项目；自建件保留接口位与 DRY_RUN 骨架，联调降级为指南+演示 |
| R2 | L3 judge 自评偏宽，场景层虚假信心 | 中/高 | C3 执行-评审分离或 10% 人工抽检；报告中持续披露方法学局限 |
| R3 | DRY_RUN mock 数据与真实分布差异大，联调后大量预期漂移 | 中/中 | C1 灰度观察期 + C2 差异清单回写；契约断言以结构性为主、数值阈值留配置化空间 |
| R4 | L3 黄金资产（H1 入库的 artifacts）腐化，与契约演进脱节 | 中/中 | 规则：任何 SKILL.md/契约变更必须同轮重新 author 并回归；validate 增加 artifacts 与契约索引一致性检查 |
| R5 | Windows（开发机）与 Linux（CI）行为差异：换行符、路径、spawn | 中/中 | `.gitattributes` 已处理换行符；CI 增加 windows 夜间任务；H2 首轮以 ubuntu 为准并实测 |
| R6 | 台账状态语义扩张（connected/verified 泛化）稀释治理 | 中/中 | H4 明确语义并在 validate 中强制：verified 必须带证据字段 |
| R7 | 范围蔓延（新能力诱惑）拖垮硬化/联通主线 | 中/中 | 每版门禁未达不发版；E4 弹性任务需人工批准才启动 |

---

## 九、明确不做（Out of Scope）

- 真实店铺的业务数据接入与日常运营（本仓库是能力工具箱，不是运营系统）。
- 商业化、计费、License 服务器。
- 逆向协议、绕过平台风控、批量爬取私有数据的实现（governance 第 7 节红线，持续有效）。
- 非电商领域的 MCP/Skill 扩张。
- v1.0 之前的分布式/多机部署（当前定位：单组织内单实例 + 人工审批环）。

---

## 十、决策记录（2026-10-19 已确认）

| # | 决策点 | 结论 | 执行状态 |
|---|---|---|---|
| 1 | H1 产物入库策略 | 将 256K 的 L3 artifacts 作为**黄金回归资产提交入库** | ✅ 已随 v0.1.0 完成（`.gitignore` 放行 + `test-all.mjs` 前置检查） |
| 2 | H4 台账语义 | 28 项已建成能力从 `planned/integrated_pending` 调整为 `connected`（`verified` 保留给真实验收） | ✅ 已随 v0.1.0 完成（`capability-bank.json` + 20 份 SKILL.md + 8 份 MCP README + `capability-matrix.md` + README 同步；`validate.mjs` 增加反向检查） |
| 3 | 版本切分 | 按 **v0.2 → v0.3 → v0.4 → v1.0** 四步走，每版独立门禁 | 生效中 |
| 4 | v0.1.0 预发布 | 仓库**公开**；Tag 用 **v0.1.0**；另出根目录 **CHANGELOG.md**（Keep a Changelog 格式） | 待执行发布动作 |
| 5 | 发布语种 | **Release 正文用中文版** `docs/release-notes-v0.1.0.md`；英文版 `docs/release-notes-v0.1.0.en.md` 作为**附加语种**保留 | ✅ 已完成 |
| 6 | 文档语种 | `ROADMAP.md` 保持英文 + 新增中文版 `docs/ROADMAP.zh.md`；`CHANGELOG.md` 中英双语（英文标题 + 中文条目） | ✅ 已完成 |

**补充决策（本轮新增）**：H1 与 H4 原属 v0.2，因两者均为 S 规模且直接影响公开仓库的可信度（全新检出不可复现、对外数字失真），已**前置到 v0.1.0 提交中**。v0.2.0 保留 H2（CI 全量）与 H3（测试报告 10 项遗留）。

**连带影响说明**：台账状态变更后，L1 的 S-02 断言（`frontmatter.ledger === bank.ledger`）要求同步刷新 20 份 SKILL.md 的 frontmatter 与 8 份 MCP README 的状态描述；且修改后必须重新生成 `tests/report/contract-index.json`，否则 L1 会读到旧索引快照而误报 20 条失败。

### 附：v0.1.0 发布执行清单

> 原附于 `docs/release-notes-v0.1.0.md` 末尾，因该文件已作为 Release 正文对外发布，清单迁移至此。

> 前置：本机已完成（工作树干净、分支已改名 `main`、历史已清理、219/219 全绿）。以下命令**需在可访问 GitHub 的环境执行**（当前沙箱出站网络被拦截）。

```bash
# 0. 探测仓库是否已存在（返回 repository not found 说明还没建）
git ls-remote https://github.com/Lym308758/ecommerce-agent-toolkit.git

# 1. 若不存在：网页创建 —— Public / 名称 ecommerce-agent-toolkit / 不勾选 README、.gitignore、LICENSE
#    （本地已有 LICENSE 与 README，远程若初始化会 non-fast-forward 拒推）

# 2. remote + 推送（首次会弹浏览器 OAuth，GCM 已装，无需 PAT）
git remote add origin https://github.com/Lym308758/ecommerce-agent-toolkit.git
git branch --show-current          # 必须输出 main
git push -u origin main            # 只推 main，勿用 --all/--mirror（会带上本地备份分支）

# 3. Tag
git tag -a v0.1.0 -m "电商全流程 AI Agent 能力工具箱 v0.1.0（预发布）"
git push origin v0.1.0

# 4. Release（推荐 gh；未安装则先 winget install --id GitHub.cli 后 gh auth login）
gh release create v0.1.0 --prerelease \
  --title "v0.1.0 预发布 · 电商全流程 AI Agent 能力工具箱" \
  --notes-file docs/release-notes-v0.1.0.md
```

**Release 备选路线**：① GitHub REST API（需 PAT，本机无 jq，用 PowerShell `ConvertTo-Json`）；② 网页端 `/releases/new` 选 tag `v0.1.0`、勾选 pre-release、粘贴 `docs/release-notes-v0.1.0.md` 全文。

**发布后核对**：仓库 Public ✅ · 默认分支 `main` · Actions 首次运行绿 · Release 中文正文 + Pre-release 徽标 · `git ls-remote --tags origin` 见 `v0.1.0`。

**清理**：发布确认无误后删除本地备份分支 `git branch -D backup/pre-push-20261019`（该分支保留着含本机路径的旧提交，切勿推送）。

---

*本计划文档随每版执行结果滚动更新；执行记录与测试数据以 `docs/testing-report.md` 与 `capability-bank.json` 为准。*
