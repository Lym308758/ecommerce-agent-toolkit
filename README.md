# ecommerce-agent-toolkit

电商公司全流程 AI Agent 的**能力工具箱**：把采购供应、商品管理、营销推广、交易订单、客户服务、物流仓储、售后处理、财务对账、数据分析九大环节，拆成**可独立部署的 MCP Server**与**可复用的编排型 Skill**。

设计哲学借鉴 Agent 原生工程实践：**系统拥有事实，Agent 拥有推理，人类拥有最终决策**。因此本仓库不只提供工具，还提供一整套安全分级、审批与验收规范。

---

## 能力全景（62 项）

| 状态 | 数量 | 含义 | 本仓库的交付形态 |
|---|---|---|---|
| ✅ 已有 | 16 | 平台内置、开箱即用 | 不写代码，见 `docs/capability-matrix.md` 的启用说明 |
| ✅ 已建成 | 28 | 本仓库已交付并通过四层测试，尚未接真实环境 | `mcp/` 8 个 TypeScript Server + `skills/` 20 个编排 Skill |
| 🔧 现成可接 | 18 | 有现成实现，仅提供接入文档 | `adapters/`：17 份接入文档（安装命令 + MCP 配置片段 + 授权清单） |
| 🏅 已验收 | 0 | 真实业务环境跑通并记录证据 | 见 `docs/governance.md`：进入 verified 须记录验证环境、日期与证据 |

> 44 项已有可运行交付物（16 + 28），但**没有任何一项经过真实业务环境验收**——全部外部调用目前都是 `DRY_RUN=1` 沙箱预演。

### 自建 MCP Server（`mcp/`，8 个）

| 服务 | 环节 | 核心工具 | 最高安全级 |
|---|---|---|---|
| `erp-scm-mcp` | 采购供应 | 采购单查询/创建、到货入库、供应商档案 | L2 可逆写 |
| `sourcing-1688-mcp` | 采购供应 | 货源搜索、比价、供应商画像 | L1 只读 |
| `oms-mcp` | 交易订单 | 订单聚合、拆单/合单、审单、状态回传 | L3 不可逆写 |
| `platform-im-mcp` | 客户服务 | 会话列表、消息拉取、消息发送（默认草稿） | L4 客户外发 |
| `wms-mcp` | 物流仓储 | 库存查询、出入库、盘点、库存锁定 | L2 可逆写 |
| `express-mcp` | 物流仓储 | 电子面单取号、轨迹查询、取消面单 | L2 可逆写 |
| `express-intercept-mcp` | 售后处理 | 在途拦截、拦截状态、撤销拦截 | L3 不可逆写 |
| `finance-erp-mcp` | 财务对账 | 凭证推送、凭证状态、科目列表 | L2 可逆写 |

### 编排型 Skill（`skills/`，20 个）

采购：智能补货建议 · 竞品与选品分析 · 评价运营
营销：大促活动策划 · 内容发布编排
订单：订单风控审查 · 售前智能导购 · FAQ 自我进化
售后：售后责任判定 · 退款风控
财务：多平台对账 · 发票与税务提醒
数据：销量波动归因

---

## 快速开始

```bash
git clone https://github.com/Lym308758/ecommerce-agent-toolkit.git
cd ecommerce-agent-toolkit
npm install
node scripts/validate.mjs      # 校验 62 项能力齐备
```

以仓储服务为例（`dry-run` 模式无需任何凭证即可启动）：

```bash
cd mcp/wms-mcp
npm install
DRY_RUN=1 npx tsx src/index.ts
```

接入任意 MCP 客户端（Claude Desktop / Cursor / WorkBuddy 等）：

```json
{
  "mcpServers": {
    "wms": {
      "command": "npx",
      "args": ["tsx", "/abs/path/to/ecommerce-agent-toolkit/mcp/wms-mcp/src/index.ts"],
      "env": { "DRY_RUN": "1" }
    }
  }
}
```

完整接入说明见 `docs/getting-started.md`。

---

## 目录结构

```
ecommerce-agent-toolkit/
├─ README.md · LICENSE(MIT) · CONTRIBUTING.md
├─ docs/                getting-started · architecture · governance · capability-matrix
├─ capability-bank.json 62 项能力的唯一权威数据源
├─ mcp/<8 个>/          每个：package.json · tsconfig.json · src/index.ts · src/tools.ts
│                       src/client.ts(真实/mock 双实现) · .env.example · README · test/
├─ skills/<20 个>/      每个：SKILL.md(含输入/输出契约、验收门禁、失败样本)
├─ adapters/<17 个>/    第三方能力接入文档（不复制源码，不重复造轮子）
├─ examples/            大促作战链、售后闭环链两个端到端工作流
└─ scripts/             validate.mjs（一致性校验）· check-secrets.mjs（凭证泄漏扫描）
```

---

## 安全与治理（务必先读 `docs/governance.md`）

| 级别 | 定义 | 执行策略 | 数量 |
|---|---|---|---|
| L1 | 只读 | Agent 自治 | 37 |
| L2 | 可逆写 | 自治 + 审计日志 + 可回滚 | 15 |
| L3 | 不可逆写（资金/发货） | 强制人工审批 | 4 |
| L4 | 客户外发（不可撤回） | 起草→批准→发送，草稿与发送分离 | 6 |

其他内置约束：所有 Server 默认 `DRY_RUN=1`；写操作必须带幂等键；每个 Skill 声明 token/调用次数上限；定时类任务输出先写临时区再原子提交。

> ⚠️ 平台开放 API（抖店/淘宝/拼多多/京东等）的签名逻辑在本仓库中只保留**接口位与 mock 实现**。接入真实环境前，请自行申请开放平台资质并阅读 `docs/governance.md` 的授权边界。

---

## 状态与路线图

- **v0.1.0（当前，预发布）**：44 项能力已建成并通过四层测试（460 条记录 100% 通过），18 项 adapter 待真实联调，**0 项经真实业务环境验收**。
- **v0.2.0 硬化**：CI 全量接入（Node 20/22 矩阵）+ 测试报告 10 项遗留清零。
- **v0.3.0 联通**：真实环境联调指南与灰度流程、P0 只读 adapter 实测、judge 独立性，≥10 项转 verified。
- **v0.4.0 扩展**：性能与并发基线、案例库扩充、可观测性规范。
- **v1.0.0 生产化**：安全审计、多租户隔离、SLA、契约版本化。

完整任务分解与风险登记：[`docs/ROADMAP.zh.md`](docs/ROADMAP.zh.md)（中文）· [`ROADMAP.md`](ROADMAP.md)（英文）· [`docs/iteration-plan.md`](docs/iteration-plan.md)（中文详细版）· [`CHANGELOG.md`](CHANGELOG.md)（中英双语）。

## 许可证

MIT © 2026 Lym308758
