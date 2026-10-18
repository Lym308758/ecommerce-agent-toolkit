---
name: multi-platform-reconciliation
description: 多平台对账——订单、平台账单与收款三方核对，输出差异清单时使用。
version: 0.1.0
module: 财务对账
safety: L1
ledger: connected
priority: P0
---

# 多平台对账

> 业务环节：**财务对账** ｜ 安全分级：**L1** ｜ 台账状态：`connected` ｜ 优先级：P0

## 何时使用

订单、平台账单与收款三方核对，输出差异清单时使用。

## 输入契约

- `orders`：订单侧数据
- `settlements`：平台结算单/账单
- `payments`：收款流水
- `fee_rules`：佣金与推广费规则

## 工作流

1. 以订单号为主键三方对齐，逐笔核对金额。
2. 分类差异：少收款、多扣佣、漏单、退款未同步、重复入账。
3. 每笔差异给出计算过程与来源引用。
4. 输出差异清单与汇总金额，缺失数据单独标注。

## 输出契约

```json
{ "diffs": [{ "orderId": "", "type": "underpaid|overcharged|missing|refund_unsynced", "amount": 0, "basis": "", "sources": [] }], "summary": { "total": 0 }, "dataGaps": [] }
```

## 验收门禁

- 注入 10 个已知差异样本（少收款/多扣佣/漏单）必须全部识别。
- 每笔差异必须可复算，误差 = 0。
- 数据缺失进 `dataGaps`，不得估算补齐。

## 失败样本（Golden Corpus）

- 订单号跨平台重复 → 用平台+订单号复合键。
- 汇率/手续费口径不一致 → 标注口径差异，不自行换算。

## 依赖能力

- `adapters/platform-bill-mcp`
- `adapters/stripe-mcp`
- `mcp/finance-erp-mcp push_voucher`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
