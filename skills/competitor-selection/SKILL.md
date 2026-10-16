---
name: competitor-selection
description: 竞品与选品分析——选品决策、竞品价格带与差异化卖点分析时使用。
version: 0.1.0
module: 商品管理
safety: L1
ledger: planned
priority: P1
---

# 竞品与选品分析

> 业务环节：**商品管理** ｜ 安全分级：**L1** ｜ 台账状态：`planned` ｜ 优先级：P1

## 何时使用

选品决策、竞品价格带与差异化卖点分析时使用。

## 输入契约

- `keyword` 或 `category`：目标品类
- `price_band`：目标价格带（可选）
- `sample_size`：竞品样本量，默认 20

## 工作流

1. 抓取竞品标题、价格、销量区间、评价关键句。
2. 按价格带分桶，统计各桶竞品数量与卖点高频词。
3. 找出**空档价格带**与**高频未被满足的痛点**。
4. 输出选品建议：差异化卖点 + 建议价格带 + 风险点。

## 输出契约

```json
{ "priceBuckets": [{ "band": "99-149", "count": 7, "topFeatures": ["静音", "可拆洗"] }], "gaps": ["199-259 区间仅 1 款"], "suggestion": { "positioning": "", "price": 0, "risks": [] }, "sources": [] }
```

## 验收门禁

- 每个结论必须附 `sources`（抓取来源与日期）。
- 样本量 <10 时必须声明「样本不足，结论仅供参考」。
- 价格带结论必须与抓取数据一致，禁止臆造销量。

## 失败样本（Golden Corpus）

- 抓取失败/反爬 → 输出已获取样本并标注覆盖率，不得补齐虚构数据。
- 同款跨店重复 → 按商品 ID 去重后再统计。

## 依赖能力

- `adapters/firecrawl`
- `mcp/sourcing-1688-mcp compare_item_prices`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
