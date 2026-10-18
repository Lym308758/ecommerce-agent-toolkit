---
name: promo-planning
description: 大促活动策划——大促/活动的节奏、优惠梯度与货品组货方案生成时使用。
version: 0.1.0
module: 营销推广
safety: L1
ledger: connected
priority: P0
---

# 大促活动策划

> 业务环节：**营销推广** ｜ 安全分级：**L1** ｜ 台账状态：`connected` ｜ 优先级：P0

## 何时使用

大促/活动的节奏、优惠梯度与货品组货方案生成时使用。

## 输入契约

- `historical`：历史大促数据（GMV、转化、退款率）
- `stock_snapshot`：当前库存与在途
- `target`：目标 GMV 或增长率

## 工作流

1. 复盘历史大促：流量峰值时段、爆品结构、退款率。
2. 结合库存水位推算可承诺的销量上限（**不得超卖规划**）。
3. 设计优惠梯度与货品分层（引流款/利润款/清仓款）。
4. 输出活动节奏表（预热/爆发/返场）与风险清单。

## 输出契约

```json
{ "phases": [{ "name": "预热", "window": "", "actions": [] }], "assortment": [{ "sku": "", "role": "traffic|profit|clearance", "plannedQty": 0 }], "risks": [] }
```

## 验收门禁

- 每个货品的计划销量 ≤ 可用库存 + 在途。
- 优惠后毛利必须为正，负毛利 SKU 单独列出。
- 所有历史数据须注明来源活动与时间。

## 失败样本（Golden Corpus）

- 历史数据缺失 → 只输出框架并标注缺失项，禁止虚构历史 GMV。
- 库存快照过期（>24h）→ 要求重新取数。

## 依赖能力

- `mcp/wms-mcp get_stock`
- `adapters/mcp-cn-commerce`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
