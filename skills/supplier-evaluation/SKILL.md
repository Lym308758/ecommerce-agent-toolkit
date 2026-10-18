---
name: supplier-evaluation
description: 供应商评估报告——按交期达成率、质检合格率、价格竞争力生成供应商季度评估时使用。
version: 0.1.0
module: 采购供应
safety: L1
ledger: connected
priority: P1
---

# 供应商评估报告

> 业务环节：**采购供应** ｜ 安全分级：**L1** ｜ 台账状态：`connected` ｜ 优先级：P1

## 何时使用

按交期达成率、质检合格率、价格竞争力生成供应商季度评估时使用。

## 输入契约

- `supplier_metrics`：交期/质检/价格数据
- `period`：评估周期

## 工作流

1. 汇总三项指标，按权重计算综合分。
2. 与上一周期对比，输出变化趋势。
3. 生成评估报告（Markdown/Word），附数据来源与采集时间。

## 输出契约

```json
{ "supplierId": "", "score": 0.0, "breakdown": {}, "trend": "up|flat|down", "reportPath": "" }
```

## 验收门禁

- 每项指标须注明数据窗口与来源。
- 数据缺失的维度标注「未评估」，不得按 0 分计入。

## 失败样本（Golden Corpus）

- 单项指标缺失 → 该维度标注「未评估」，不按 0 分计入综合分。
- 周期数据不完整 → 输出部分评估并标注覆盖度。

## 依赖能力

- `mcp/erp-scm-mcp get_supplier`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
