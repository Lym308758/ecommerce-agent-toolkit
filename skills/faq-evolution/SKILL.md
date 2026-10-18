---
name: faq-evolution
description: FAQ 自我进化——定期从未命中会话中挖掘新问题、建议新增 FAQ 条目时使用。
version: 0.1.0
module: 客户服务
safety: L2
ledger: connected
priority: P2
---

# FAQ 自我进化

> 业务环节：**客户服务** ｜ 安全分级：**L2** ｜ 台账状态：`connected` ｜ 优先级：P2

## 何时使用

定期从未命中会话中挖掘新问题、建议新增 FAQ 条目时使用。

## 输入契约

- `unmatched_sessions`：未命中会话集合
- `existing_faq`：现有 FAQ 条目
- `min_frequency`：成条门槛，默认 3 次

## 工作流

1. 对未命中问题做语义聚类。
2. 过滤低频（<min_frequency）与重复已有条目的问题。
3. 生成候选 FAQ：问题表述 + 建议答案 + 依据来源 + 命中次数。
4. 输出**待审清单**，入库需人工确认（L2 可逆写）。

## 输出契约

```json
{ "candidates": [{ "question": "", "suggestedAnswer": "", "sources": [], "hitCount": 7, "status": "pending" }] }
```

## 验收门禁

- 建议答案必须附 `sources`（政策/商品页/订单系统）。
- 无来源的候选不得进入清单。
- 入库前必须人工确认，禁止自动发布。

## 失败样本（Golden Corpus）

- 聚类把不同问题混为一类 → 降低相似度阈值重跑，宁缺勿滥。
- 涉及价格/政策的问题 → 强制人工撰写答案，不自动生成。

## 依赖能力

- `mcp/oms-mcp get_order`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
