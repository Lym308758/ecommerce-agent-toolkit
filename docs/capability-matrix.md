# 能力矩阵（62 项）

> 由 `capability-bank.json` 生成，是本仓库的唯一权威视图；修改请改 JSON 后重新生成。
> 状态含义：✅ 已有（平台内置）· ✅ 已建成（本仓库已交付 `mcp/` Server 或 `skills/` Skill，通过四层测试但未接真实环境）· 🔧 现成可接（有现成实现，本仓库仅提供 `adapters/` 接入文档）· 🏅 已验收（真实业务环境跑通并记录证据，当前 0 项）。

## 基础通用（11 项）

| 能力 | 类型 | 优先级 | 安全级 | 状态 | 台账 | 本仓库位置 |
|---|---|---|---|---|---|---|
| LLM 网关 | 大模型推理调度 | P0 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| Filesystem MCP | 文件读写管理 | P0 | L2 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| Web Search / WebFetch | 联网检索 | P0 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| 知识库 MCP（RAG） | 企业知识检索 | P0 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| 定时任务 Automation | 定时调度提醒 | P0 | L2 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| Excel/文档 Skill | 表格文档生成 | P0 | L2 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| PostgreSQL MCP | 业务库查询 | P0 | L1 | 🔧 现成可接 | 已调研 | `adapters/postgres-mcp` |
| Playwright MCP | 浏览器自动化 | P0 | L2 | 🔧 现成可接 | 已调研 | `adapters/playwright-mcp` |
| 代码执行沙箱 | 数据计算脚本 | P1 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| IM 通知 MCP | 消息推送 | P1 | L4 | 🔧 现成可接 | 已调研 | `adapters/im-notify` |
| Agent Mail | 邮件收发 | P1 | L4 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |

## 采购供应（5 项）

| 能力 | 类型 | 优先级 | 安全级 | 状态 | 台账 | 本仓库位置 |
|---|---|---|---|---|---|---|
| 自建 ERP/SCM MCP | 采购单管理 | P0 | L2 | ✅ 已建成 | 已接入（待验收） | `mcp/erp-scm-mcp` |
| 1688 采购 MCP | 寻源比价 | P1 | L1 | ✅ 已建成 | 已接入（待验收） | `mcp/sourcing-1688-mcp` |
| Firecrawl MCP | 行情价格监控 | P2 | L1 | 🔧 现成可接 | 已调研 | `adapters/firecrawl` |
| Skill：智能补货建议 | 补货决策 | P0 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/replenishment-advisor` |
| Skill：供应商评估报告 | 供应商评分 | P1 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/supplier-evaluation` |

## 商品管理（6 项）

| 能力 | 类型 | 优先级 | 安全级 | 状态 | 台账 | 本仓库位置 |
|---|---|---|---|---|---|---|
| 平台商品 MCP | 上下架与编辑 | P0 | L2 | 🔧 现成可接 | 已调研 | `adapters/platform-product-mcp` |
| Shopify/有赞 MCP | 私域跨境管理 | P1 | L2 | 🔧 现成可接 | 已调研 | `adapters/shopify-mcp` |
| ImageGen 图像生成 | 主图详情图 | P1 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| Skill：商品文案生成 | 文案撰写 | P0 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| Skill：竞品与选品分析 | 选品决策 | P1 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/competitor-selection` |
| Skill：评价运营 | 评价管理 | P1 | L4 | ✅ 已建成 | 已接入（待验收） | `skills/review-operations` |

## 营销推广（7 项）

| 能力 | 类型 | 优先级 | 安全级 | 状态 | 台账 | 本仓库位置 |
|---|---|---|---|---|---|---|
| 巨量引擎/千川 MCP | 国内广告数据 | P0 | L1 | 🔧 现成可接 | 已调研 | `adapters/oceanengine-ads-mcp` |
| Meta/Google Ads MCP | 跨境广告 | P1 | L2 | 🔧 现成可接 | 已调研 | `adapters/ads-mcp` |
| Klaviyo MCP | 会员营销 | P2 | L2 | 🔧 现成可接 | 已调研 | `adapters/klaviyo-mcp` |
| 内容平台连接器 | 内容发布 | P1 | L4 | ✅ 已建成 | 已接入（待验收） | `skills/content-publishing` |
| Skill：大促活动策划 | 活动方案 | P0 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/promo-planning` |
| Skill：投放报表解读 | 投放优化 | P1 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/ad-report-insight` |
| Skill：素材批量生成 | 内容工厂 | P1 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |

## 交易订单（5 项）

| 能力 | 类型 | 优先级 | 安全级 | 状态 | 台账 | 本仓库位置 |
|---|---|---|---|---|---|---|
| 平台订单 MCP | 订单同步 | P0 | L1 | 🔧 现成可接 | 已调研 | `adapters/platform-order-mcp` |
| 自建 OMS MCP | 订单中台 | P0 | L3 | ✅ 已建成 | 已接入（待验收） | `mcp/oms-mcp` |
| Stripe MCP / 微信支付 | 支付收款 | P1 | L3 | 🔧 现成可接 | 已调研 | `adapters/stripe-mcp` |
| Skill：订单风控审查 | 异常识别 | P1 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/order-risk-review` |
| Skill：订单状态应答 | 查询机器人 | P0 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/order-status-bot` |

## 客户服务（6 项）

| 能力 | 类型 | 优先级 | 安全级 | 状态 | 台账 | 本仓库位置 |
|---|---|---|---|---|---|---|
| 客服系统 MCP | 会话工单 | P0 | L2 | 🔧 现成可接 | 已调研 | `adapters/qidian-cs-mcp` |
| 平台 IM MCP | 平台聊天 | P0 | L4 | ✅ 已建成 | 已接入（待验收） | `mcp/platform-im-mcp` |
| 向量知识库 MCP | 知识检索 | P0 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| Skill：售前智能导购 | 导购应答 | P0 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/pre-sales-guidance` |
| Skill：情绪识别升级 | 会话路由 | P0 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/sentiment-escalation` |
| Skill：FAQ 自我进化 | 知识维护 | P2 | L2 | ✅ 已建成 | 已接入（待验收） | `skills/faq-evolution` |

## 物流仓储（5 项）

| 能力 | 类型 | 优先级 | 安全级 | 状态 | 台账 | 本仓库位置 |
|---|---|---|---|---|---|---|
| WMS MCP | 出入库库存 | P0 | L2 | ✅ 已建成 | 已接入（待验收） | `mcp/wms-mcp` |
| 快递100/菜鸟 MCP | 面单轨迹 | P0 | L2 | ✅ 已建成 | 已接入（待验收） | `mcp/express-mcp` |
| 高德地图 MCP | 地址路由 | P1 | L1 | 🔧 现成可接 | 已调研 | `adapters/amap-mcp` |
| Skill：库存水位预警 | 库存监控 | P0 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/inventory-alert` |
| Skill：发货异常监控 | 履约监控 | P1 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/shipment-anomaly` |

## 售后处理（5 项）

| 能力 | 类型 | 优先级 | 安全级 | 状态 | 台账 | 本仓库位置 |
|---|---|---|---|---|---|---|
| 平台售后 MCP | 售后单管理 | P0 | L3 | 🔧 现成可接 | 已调研 | `adapters/platform-aftersales-mcp` |
| 快递拦截 MCP | 退货拦截 | P1 | L3 | ✅ 已建成 | 已接入（待验收） | `mcp/express-intercept-mcp` |
| Skill：售后责任判定 | 定责决策 | P1 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/aftersales-liability` |
| Skill：退款风控 | 退款审核 | P1 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/refund-risk` |
| Skill：安抚挽单话术 | 客户挽留 | P0 | L4 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |

## 财务对账（6 项）

| 能力 | 类型 | 优先级 | 安全级 | 状态 | 台账 | 本仓库位置 |
|---|---|---|---|---|---|---|
| 平台台账单 MCP | 账单拉取 | P0 | L1 | 🔧 现成可接 | 已调研 | `adapters/platform-bill-mcp` |
| Stripe 对账 MCP | 支付对账 | P1 | L1 | 🔧 现成可接 | 已调研 | `adapters/stripe-mcp` |
| 金蝶/用友 MCP | 凭证总账 | P2 | L2 | ✅ 已建成 | 已接入（待验收） | `mcp/finance-erp-mcp` |
| Skill：多平台对账 | 自动对账 | P0 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/multi-platform-reconciliation` |
| Skill：利润核算 | 毛利分析 | P0 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| Skill：发票税务提醒 | 开票管理 | P2 | L2 | ✅ 已建成 | 已接入（待验收） | `skills/invoice-tax` |

## 数据分析（6 项）

| 能力 | 类型 | 优先级 | 安全级 | 状态 | 台账 | 本仓库位置 |
|---|---|---|---|---|---|---|
| 平台经营分析 MCP | 多平台数据 | P0 | L1 | 🔧 现成可接 | 已调研 | `adapters/mcp-cn-commerce` |
| GA MCP | 独立站流量 | P2 | L1 | 🔧 现成可接 | 已调研 | `adapters/google-analytics-mcp` |
| BI + Excel Skill | 自助分析 | P0 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |
| Skill：经营日报 | 自动报告 | P0 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/daily-business-report` |
| Skill：销量归因 | 异常诊断 | P1 | L1 | ✅ 已建成 | 已接入（待验收） | `skills/sales-attribution` |
| Skill：大促复盘 | 活动复盘 | P1 | L1 | ✅ 已有 | 已连接/内置 | `平台内置（不落代码）` |

## 汇总

- 总计 **62** 项：✅ 已有 16（平台内置）· ✅ 已建成 28（本仓库已交付并通过四层测试）· 🔧 现成可接 18（仅有 `adapters/` 接入文档）· 🏅 已验收 0
- 交付物：8 个自建 MCP Server · 20 个 Skill 包 · 17 份接入文档
- 已具备可运行交付物的：**44 项（约 71%）**；其中经真实业务环境验收的：**0 项**（见 `docs/governance.md` 第 3 节：进入 verified 须记录环境、日期与证据）
