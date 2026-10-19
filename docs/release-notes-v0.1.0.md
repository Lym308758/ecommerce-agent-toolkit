# Release Notes · v0.1.0（预发布）

> **能力口径（2026-10-19）**：62 项能力中 **44 项已建成**（16 项平台内置 + 8 个自建 MCP Server + 20 个编排 Skill），并通过四层自动化测试（460 条记录全绿）；**18 项第三方适配器待真实联调**；**暂无任何一项经真实业务环境验收**——所有外部调用目前都是 `DRY_RUN=1` 沙箱预演，未产生任何真实副作用。

---

## 电商全流程 AI Agent 能力工具箱 v0.1.0（预发布）

首个公开预览版。覆盖电商公司 9 大核心业务环节的 **62 项能力**：20 个 Skill、8 个内置 MCP Server（36 个工具）、18 个第三方服务适配器，配套一套四层自动化测试体系。**当前为预发布版本**：契约与安全门禁已全量验证，但部分脚本仍为骨架实现，建议在测试环境试用，暂勿直接用于生产写操作。

### 亮点

- **全流程能力闭环**：采购供应 → 商品管理 → 营销推广 → 交易订单 → 客户服务 → 物流仓储 → 售后处理 → 财务对账 → 数据分析，20 个 skill 均采用统一的八章节规格（输入契约 / 输出契约 / 验收门禁 / 失败样本 / 依赖能力 / 边界）。
- **安全分级门禁**：全部 62 项能力标注 L1–L4 安全级——L1 只读直调、L2 可逆写须幂等键、L3/L4 高风险写须人工审批预演。门禁在 MCP Server 层强制执行，36 个工具逐一实测通过。
- **零凭证沙箱模式**：所有 MCP 与适配器支持 `DRY_RUN=1`，返回明确标注的预演数据，clone 后无需任何密钥即可启动与测试。
- **可量化的质量基线**：四层测试体系（契约解析 → 静态契约 → 依赖能力 → 场景执行）累计 460 条执行记录，**通过率 100%**；120 条场景用例双判定（确定性断言 + rubric 评分）；P0 能力三轮回跑一致性 48/48。
- **一键复现**：`npm run test:all` 一条命令跑完 L0–L3 全层（219 个用例），`npm run report` 重新生成本次测试的完整报告。

### 包含内容

| 类别 | 数量 | 说明 |
|---|---|---|
| Skill | 20 | 选品/补货/供应商评估、投放解读/大促策划/内容发布/销量归因、订单风控/状态应答/售前导购/情绪升级/FAQ 进化、库存预警/发货异常、售后定责/退款风控、发票税务/多平台对账/经营日报 |
| 内置 MCP Server | 8 | erp-scm、express、express-intercept、finance-erp、oms、platform-im、sourcing-1688、wms（TypeScript + MCP SDK，stdio 协议） |
| MCP 工具 | 36 | 安全分级：L1×20 / L2×12 / L3×3 / L4×1 |
| 第三方适配器 | 18 | 广告投放、电商平台、支付、物流、客服、数仓等（DRY_RUN 契约接入） |
| 测试体系 | 4 层 | L0 契约解析 / L1 静态契约 80 条 / L2 依赖能力 116 条 / L3 场景执行 264 条记录；21 个断言算子 |

### 质量数据（详见 `docs/testing-report.md`）

| 指标 | 数值 |
|---|---|
| 执行记录总数 | 460（L1 80 + L2 116 + L3 264） |
| 通过率 | **100%**（460/460；`npm run test:all` 219/219 用例） |
| 测试周期缺陷 | 首轮检出 8 个（1 Major + 7 Minor），**全部修复后回归通过** |
| 场景用例判定 | 120 条：正常/边界/异常 × 各 40；judge 加权分均值 0.979、最低 0.860 |
| P0 三轮回跑 | 8 个 skill × 6 用例，stabilityKeys 跨轮一致 48/48 |
| L2 真实调用耗时 | 平均 29 ms / 最大 585 ms（含 MCP 握手） |

### 快速开始

```bash
git clone https://github.com/Lym308758/ecommerce-agent-toolkit.git
cd ecommerce-agent-toolkit
npm install
node scripts/validate.mjs        # 校验 62 项能力齐备
npm run build                    # 编译 8 个 MCP Server（8/8 通过）
npm run test:all                 # 四层全量测试（219 用例）
```

以单个 MCP Server 为例（无需凭证）：

```bash
cd mcp/wms-mcp && npm install
DRY_RUN=1 npx tsx src/index.ts   # stdio 模式，可接入任意 MCP 客户端
```

### 安全设计

- **分级门禁**：L2 及以上工具强制校验 `idempotencyKey`；L3/L4 未审批时返回 `requiresApproval` 预演而非执行。
- **人类在环**：本工具箱只产出结论与建议；一切写动作须人工确认后由对应 MCP 执行（skill 边界条款）。
- **可回溯**：结论类输出必须附 `sources`；数据缺失进 `dataGaps`，禁止估算填充。
- **密钥卫生**：`npm run lint:secrets` 纳入检查；`.env.example` 提供配置样例。

### 已知限制（预发布范围声明）

1. 全部外部服务为 `DRY_RUN=1` 沙箱预演，未做真实平台 API 联调；生产接入需自行配置凭证并先在测试店铺验证。
2. `replenishment-advisor` 的 `replenish.py` 仍为幂等骨架（计算逻辑在 skill 规格与 L3 层验证），确定性实现计划于下个版本补全。
3. L3 场景层的执行与评分由 AI Agent 推演自评（路径 B），响应时间反映回放判定耗时；judge 独立性优化列入路线图。
4. 未覆盖并发/压力测试与真实抓取链路。

### 路线图（v0.2 候选）

- `replenish.py` 等脚本补全确定性计算实现，L2 层锁定算术正确性
- 契约扩展：`shipment-anomaly` 增加 `data_unavailable`/`data_mismatch` 枚举；`supplier-evaluation` 综合分允许 `null`
- CI：GitHub Actions（node 20/22 矩阵）接入 `npm run test:all`，发布门槛全绿
- 真实环境联调指南（测试店铺/测试仓灰度流程）

### 许可

MIT © Lym308758

---

## 附：语种与延伸阅读

- **English version（英文版）**：[release-notes-v0.1.0.en.md](https://github.com/Lym308758/ecommerce-agent-toolkit/blob/main/docs/release-notes-v0.1.0.en.md)
- **路线图**：[中文版](https://github.com/Lym308758/ecommerce-agent-toolkit/blob/main/docs/ROADMAP.zh.md) · [英文版](https://github.com/Lym308758/ecommerce-agent-toolkit/blob/main/ROADMAP.md)
- **详细测试报告**：[docs/testing-report.md](https://github.com/Lym308758/ecommerce-agent-toolkit/blob/main/docs/testing-report.md)
- **变更历史**：[CHANGELOG.md](https://github.com/Lym308758/ecommerce-agent-toolkit/blob/main/CHANGELOG.md)
