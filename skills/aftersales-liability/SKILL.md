---
name: aftersales-liability
description: 售后责任判定——售后投诉接入后，判定责任方（商家/物流/客户）与赔付方案时使用。
version: 0.1.0
module: 售后处理
safety: L1
ledger: connected
priority: P1
---

# 售后责任判定

> 业务环节：**售后处理** ｜ 安全分级：**L1** ｜ 台账状态：`connected` ｜ 优先级：P1

## 何时使用

售后投诉接入后，判定责任方（商家/物流/客户）与赔付方案时使用。

## 输入契约

- `order`：订单与商品信息
- `tracking`：物流轨迹
- `conversation`：会话记录
- `policy`：售后政策

## 工作流

1. 收集证据链：订单 → 轨迹 → 会话 → 政策条款。
2. 按规则判定：物流停滞/破损→物流；质量问题→商家；无理由→客户。
3. 输出责任方、置信度与依据引用（逐条可追溯）。
4. 证据不足时输出「证据缺口清单」，不强行定责。

## 输出契约

```json
{ "liable": "merchant|logistics|customer|undetermined", "confidence": 0.0, "evidence": [{ "type": "tracking", "ref": "", "quote": "" }], "compensation": { "type": "", "amount": 0 }, "gaps": [] }
```

## 验收门禁

- 每个判定必须引用 ≥1 条证据。
- `confidence < 0.6` 一律输出 `undetermined` 并转人工。
- 赔付金额不得超出政策上限。

## 失败样本（Golden Corpus）

- 轨迹缺失/签收争议 → 输出 gaps，转人工。
- 客户自述与物流记录冲突 → 并列呈现，不定责。

## 依赖能力

- `mcp/express-mcp get_tracking`
- `mcp/oms-mcp get_order`
- `mcp/express-intercept-mcp get_intercept_status`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
