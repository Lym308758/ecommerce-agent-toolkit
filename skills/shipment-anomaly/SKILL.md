---
name: shipment-anomaly
description: 发货异常监控——识别超时未发货、物流停滞、签收异常时使用。
version: 0.1.0
module: 物流仓储
safety: L1
ledger: connected
priority: P1
---

# 发货异常监控

> 业务环节：**物流仓储** ｜ 安全分级：**L1** ｜ 台账状态：`connected` ｜ 优先级：P1

## 何时使用

识别超时未发货、物流停滞、签收异常时使用。

## 输入契约

- `orders`：待发货/在途订单
- `tracking`：轨迹数据
- `sla`：时效规则

## 工作流

1. 超时未发货（>承诺时效）→ 列出并催办。
2. 物流停滞（>48h 无更新）→ 标记并建议拦截/补发评估。
3. 签收异常（代收/拒收/地址异常）→ 转客服跟进。
4. 输出异常清单与建议动作（**动作需人工执行**）。

## 输出契约

```json
{ "anomalies": [{ "orderId": "", "type": "not_shipped|stalled|delivery_issue", "detail": "", "suggestion": "" }], "runKey": "shipment-anomaly:2026-10-16" }
```

## 验收门禁

- 同 `runKey` 当天不重复告警。
- 停滞判定必须给出最后轨迹时间点。

## 失败样本（Golden Corpus）

- 订单号与平台不匹配 → 标记「数据错配」并暂停判定，要求人工核对。
- 轨迹接口超时 → 标记「待确认」，不得判为停滞。

## 依赖能力

- `mcp/express-mcp get_tracking`
- `mcp/oms-mcp list_orders`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
