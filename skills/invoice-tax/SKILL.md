---
name: invoice-tax
description: 发票与税务提醒——开票需求汇总、重复开票检测与税期提醒时使用。
version: 0.1.0
module: 财务对账
safety: L2
ledger: planned
priority: P2
---

# 发票与税务提醒

> 业务环节：**财务对账** ｜ 安全分级：**L2** ｜ 台账状态：`planned` ｜ 优先级：P2

## 何时使用

开票需求汇总、重复开票检测与税期提醒时使用。

## 输入契约

- `invoice_requests`：开票请求集合
- `issued`：已开票记录
- `tax_calendar`：税期节点

## 工作流

1. 汇总待开票请求，按抬头/税号归并。
2. 与已开票记录比对，检测重复开票与金额不符。
3. 输出待开票清单、风险项与税期倒计时提醒。
4. 开票动作需人工确认（L2 可逆写，可红冲）。

## 输出契约

```json
{ "pending": [{ "requestId": "", "amount": 0, "taxNo": "" }], "risks": [{ "type": "duplicate|mismatch", "ref": "" }], "taxReminders": [] }
```

## 验收门禁

- 重复开票必须 100% 检出（历史样本回归）。
- 金额不符需给出差异明细。

## 失败样本（Golden Corpus）

- 抬头信息不全 → 列入待补资料，不得跳过。
- 跨期开票 → 标注所属期间，提醒税务口径。

## 依赖能力

- `mcp/finance-erp-mcp list_accounts`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
