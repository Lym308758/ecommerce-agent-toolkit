---
name: refund-risk
description: 退款风控——退款审核前的风险识别（高频退款、调包退货、异常申请）时使用。
version: 0.1.0
module: 售后处理
safety: L1
ledger: connected
priority: P1
---

# 退款风控

> 业务环节：**售后处理** ｜ 安全分级：**L1** ｜ 台账状态：`connected` ｜ 优先级：P1

## 何时使用

退款审核前的风险识别（高频退款、调包退货、异常申请）时使用。

## 输入契约

- `refund_request`：退款/退货申请
- `buyer_history`：买家历史退款率与订单数
- `order`：订单与商品信息

## 工作流

1. 计算买家历史退款率与近 30 天退款次数。
2. 命中规则：高频退款、退货商品与订单不符、超期申请、只退不寄。
3. 输出风险等级与建议：自动通过 / 人工复核 / 需举证。
4. **只给建议**，最终审核由人工执行。

## 输出契约

```json
{ "riskLevel": "low|mid|high", "hits": [{ "rule": "", "evidence": "" }], "suggestion": "auto|review|evidence", "confidence": 0.0 }
```

## 验收门禁

- 命中必须给 evidence；`high` 需 ≥2 条命中。
- 不得因风险评分拒绝合规退款请求，只做分流。

## 失败样本（Golden Corpus）

- 历史数据缺失（新客）→ 按 low 处理并说明。
- 高价值订单 → 无论评分一律走人工。

## 依赖能力

- `mcp/oms-mcp get_order`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
