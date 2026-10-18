---
name: review-operations
description: 评价运营——评价聚合分析、差评预警与评价回复生成时使用（回复为外发动作）。
version: 0.1.0
module: 商品管理
safety: L4
ledger: connected
priority: P1
---

# 评价运营

> 业务环节：**商品管理** ｜ 安全分级：**L4** ｜ 台账状态：`connected` ｜ 优先级：P1

## 何时使用

评价聚合分析、差评预警与评价回复生成时使用（回复为外发动作）。

## 输入契约

- `sku` 或 `item_id`
- `window`：评价时间窗口
- `reply_policy`：回复话术策略与禁语清单

## 工作流

1. 拉取窗口内评价，按情感与主题聚类（物流/质量/尺码/服务）。
2. 识别高频负面主题，输出预警与根因假设。
3. 生成回复草稿（**仅草稿**，标注依据）。
4. 涉及退款/补偿的回复转人工；其余进入审批队列。

## 输出契约

```json
{ "themes": [{ "theme": "物流", "negRate": 0.31, "samples": [] }], "alerts": [], "draftReplies": [{ "reviewId": "", "text": "", "basis": "", "needsApproval": true }] }
```

## 验收门禁

- 回复必须引用具体订单/物流事实，禁止模板空话。
- 涉及赔付、承诺时效的回复必须 `needsApproval: true`。
- 差评根因假设需标注置信度，不得写成确定结论。

## 失败样本（Golden Corpus）

- 评价含辱骂或敏感内容 → 一律转人工，不自动回复。
- 同一买家多次差评 → 标记高风险，转人工。

## 依赖能力

- `mcp/oms-mcp get_order`
- `mcp/express-mcp get_tracking`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
