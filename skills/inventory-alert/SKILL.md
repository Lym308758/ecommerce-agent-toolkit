---
name: inventory-alert
description: 库存水位预警——按动销率监控安全库存，生成预警并联动采购时使用。
version: 0.1.0
module: 物流仓储
safety: L1
ledger: integrated_pending
priority: P0
---

# 库存水位预警

> 业务环节：**物流仓储** ｜ 安全分级：**L1** ｜ 台账状态：`integrated_pending` ｜ 优先级：P0

## 何时使用

按动销率监控安全库存，生成预警并联动采购时使用。

## 输入契约

- `stock_snapshot`：库存与在途
- `rules`：安全水位规则（按 SKU/品类）

## 工作流

1. 计算各 SKU 可售天数 = 可用 / 日均销量。
2. 低于安全天数触发预警，分级（紧急/关注）。
3. 输出预警清单并建议调用补货 Skill 生成采购建议。

## 输出契约

```json
{ "alerts": [{ "sku": "", "daysLeft": 0, "level": "high|mid", "suggestQty": 0 }], "runKey": "inventory-alert:2026-10-16" }
```

## 验收门禁

- 幂等键 `runKey` 保证同一天不重复推送。
- 误报率 <5%（按月复盘）。
- 库存取数必须为事实源实时值。

## 失败样本（Golden Corpus）

- 销量为 0 的新品 → 不触发预警，单独列出。
- 取数失败 → 输出失败并告警，不得沿用旧值。

## 依赖能力

- `mcp/wms-mcp get_stock`
- `skills/replenishment-advisor`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
