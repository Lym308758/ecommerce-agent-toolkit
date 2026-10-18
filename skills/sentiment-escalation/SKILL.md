---
name: sentiment-escalation
description: 情绪识别与人工升级——识别会话中的不满/投诉情绪并决定是否升级人工时使用。
version: 0.1.0
module: 客户服务
safety: L1
ledger: connected
priority: P0
---

# 情绪识别与人工升级

> 业务环节：**客户服务** ｜ 安全分级：**L1** ｜ 台账状态：`connected` ｜ 优先级：P0

## 何时使用

识别会话中的不满/投诉情绪并决定是否升级人工时使用。

## 输入契约

- `conversation`：会话文本
- `thresholds`：升级阈值（可配置）

## 工作流

1. 判定情绪等级与投诉意图（是否涉及赔付/投诉平台/舆情风险）。
2. 命中升级条件时生成**会话摘要**（问题、已尝试、客户诉求、情绪）。
3. 输出升级建议与优先级，附带摘要供人工接手。

## 输出契约

```json
{ "sentiment": "calm|upset|angry", "escalate": true, "priority": "P0|P1|P2", "summary": { "issue": "", "tried": "", "demand": "" } }
```

## 验收门禁

- 涉及「投诉平台/媒体/监管」一律升级 P0。
- 摘要必须包含客户诉求，不得只贴聊天记录。

## 失败样本（Golden Corpus）

- 触发条件配置缺失 → 使用默认阈值并在输出中标注配置来源。
- 情绪判断不确定 → 按 upgrade 处理，宁可多升级。

## 依赖能力

- `mcp/platform-im-mcp get_session_messages`

## 边界

- 本 Skill 只产出**结论与建议**；L2 及以上写动作必须经人工确认后由对应 MCP 执行。
- 所有事实性输出必须可回溯到数据源；无来源时输出「需人工确认」，不得臆造。
- 定时类用法必须带 `runKey`（日期 + 任务名）保证幂等。
