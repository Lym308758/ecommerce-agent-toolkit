---
name: ad-report-insight
description: 投放报表解读——读取广告投放报表并给出调优建议时使用。
version: 0.1.0
module: 营销推广
safety: L1
ledger: connected
priority: P1
---

# 投放报表解读

> 业务环节：**营销推广** ｜ 安全分级：**L1** ｜ 台账状态：`connected` ｜ 优先级：P1

## 何时使用

读取广告投放报表并给出调优建议时使用。

## 输入契约

- `report`：投放报表（消耗/点击/转化/ROI）
- `target_roas`：目标 ROI

## 工作流

1. 拆解漏斗：曝光→点击→转化→成交，定位薄弱环节。
2. 按计划/创意维度排序，找出低效消耗。
3. 输出调优建议（预算再分配、暂停项、加注项）与预期影响。

## 输出契约

```json
{ "funnel": {}, "lowEfficiency": [], "suggestions": [{ "action": "", "expectedImpact": "" }], "sources": [] }
```

## 验收门禁

- 所有数字须来自报表原文，可回溯。
- 建议须标注预期影响与不确定性。

## 失败样本（Golden Corpus）

- 消耗字段缺失 → 该指标置空并在 gaps 标注，不得按 0 计算 ROI。
- 归因窗口不一致 → 标注口径差异后再比较。

## 依赖能力

- `adapters/oceanengine-ads-mcp`
- `adapters/ads-mcp`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
