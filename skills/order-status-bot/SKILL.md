---
name: order-status-bot
description: 订单状态应答——客服或买家查询订单进度时的标准应答（对内查询、对外自助）。
version: 0.1.0
module: 交易订单
safety: L1
ledger: integrated_pending
priority: P0
---

# 订单状态应答

> 业务环节：**交易订单** ｜ 安全分级：**L1** ｜ 台账状态：`integrated_pending` ｜ 优先级：P0

## 何时使用

客服或买家查询订单进度时的标准应答（对内查询、对外自助）。

## 输入契约

- `order_id`
- `requester`：customer|agent

## 工作流

1. 查询订单状态与物流轨迹。
2. 按角色组织应答（买家：白话+时效承诺；客服：结构化字段）。
3. 异常状态给出下一步动作建议。

## 输出契约

```json
{ "status": "", "tracking": {}, "reply": "", "nextAction": "" }
```

## 验收门禁

- 状态与轨迹必须与系统一致，禁止推测。
- 承诺时效须引用政策原文。

## 失败样本（Golden Corpus）

- 订单不存在 → 回问核对信息，不猜测订单号。

## 依赖能力

- `mcp/oms-mcp get_order`
- `mcp/express-mcp get_tracking`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
