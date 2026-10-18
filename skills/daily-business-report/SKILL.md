---
name: daily-business-report
description: 经营日报——每日定时汇总各平台经营数据并推送图文日报时使用。
version: 0.1.0
module: 数据分析
safety: L1
ledger: connected
priority: P0
---

# 经营日报

> 业务环节：**数据分析** ｜ 安全分级：**L1** ｜ 台账状态：`connected` ｜ 优先级：P0

## 何时使用

每日定时汇总各平台经营数据并推送图文日报时使用。

## 输入契约

- `date`：统计日期
- `platforms`：平台列表与数据源
- `compare`：对比口径（环比/同比）

## 工作流

1. 拉取各平台 GMV、流量、转化、退款率、库存。
2. 与对比口径计算涨跌并标注异常。
3. 生成日报（Markdown/Word），**数据缺失必须显式标注**。
4. 以 `runKey=日期` 保证幂等，不重复推送。

## 输出契约

```json
{ "date": "", "metrics": {}, "alerts": [], "dataGaps": [], "reportPath": "", "runKey": "daily-report:2026-10-16" }
```

## 验收门禁

- 随机抽 1 平台与后台人工核对，误差 = 0。
- 缺失数据进 `dataGaps`，严禁以 0 或均值填充。
- 连续 5 天无人工修正视为通过。

## 失败样本（Golden Corpus）

- 某平台取数失败 → 日报保留该平台区块并标注「数据缺失」。
- 分页不完整 → 标注覆盖边界。

## 依赖能力

- `adapters/mcp-cn-commerce`
- `mcp/wms-mcp get_stock`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
