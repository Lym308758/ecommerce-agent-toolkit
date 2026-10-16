# 示例一：大促作战链（端到端）

演示「营销 → 订单 → 物流 → 客服 → 财务」一条链上，Agent 如何调用本仓库的能力。所有写操作默认预演（`DRY_RUN=1` 或需 `__approved=true`）。

## 参与能力

| 环节 | 能力 | 类型 |
|---|---|---|
| 货品与库存 | `mcp/wms-mcp get_stock` | 自建 MCP（L1） |
| 活动策划 | `skills/promo-planning` | Skill（L1） |
| 广告投放 | `adapters/oceanengine-ads-mcp`、`skills/ad-report-insight` | 第三方 + Skill |
| 订单审单 | `mcp/oms-mcp list_orders` / `review_order`（L3） | 自建 MCP |
| 发货 | `mcp/wms-mcp create_outbound_order`（L2）、`mcp/express-mcp create_waybill`（L2） | 自建 MCP |
| 客服 FAQ | `skills/pre-sales-guidance`、`adapters/qidian-cs-mcp` | Skill + 第三方 |
| 对账 | `skills/multi-platform-reconciliation` | Skill（L1） |

## 执行流程

```
1. 取库存快照        wms-mcp.get_stock(sku 列表)          → 事实源，禁止缓存
2. 生成活动方案      skills/promo-planning                 → 计划销量 ≤ 可用+在途
3. 投放与复盘        oceanengine 读数 → ad-report-insight  → 只解读，调价需人工
4. 订单峰值审单      oms-mcp.review_order(__approved=true) → L3，逐单人审或批量审批
5. 出库与面单        wms → express                          → L2，带 idempotencyKey
6. 客服 FAQ 预置     pre-sales-guidance + qidian-cs         → 草稿，人工确认后启用
7. 活动后对账        multi-platform-reconciliation          → 输出差异清单，人工复核
```

## 幂等与审批约定

- 所有 L2 写操作带 `idempotencyKey`（如 `oms:ORDER-123:review:2026-10-16`）；
- L3（`review_order`）必须先由人工批准，服务在未传 `__approved=true` 时只返回预演；
- 活动期间的自动动作（改价、投放调整）一律走审批队列，不直接执行。

## 失败处理

| 场景 | 处理 |
|---|---|
| 库存快照超过 24 小时 | 重新取数，禁止沿用旧快照 |
| 平台取数失败 | 日报/策划标注 `dataGaps`，不估算填充 |
| 面单接口超时 | 幂等键相同可安全重试；连续 3 次失败转人工 |
| 对账发现多扣佣 | 进入差异清单，人工向平台申诉 |
