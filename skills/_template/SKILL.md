---
name: your-skill-name
description: 一句话说明这个 Skill 在什么场景下被触发
version: 0.1.0
module: 所属业务环节
safety: L1
ledger: planned
priority: P1
---

# 你的 Skill 名称

> 业务环节：**X** ｜ 安全分级：**L1** ｜ 台账状态：`planned` ｜ 优先级：P1

## 何时使用

一句话触发条件。

## 输入契约

- `field`：含义、类型、是否必填

## 工作流

1. 第一步
2. 第二步

## 输出契约

```json
{ "ok": true }
```

## 验收门禁

- 确定性门禁（可自动校验）
- 业务验收（人工确认）

## 失败样本（Golden Corpus）

- 场景 → 期望行为

## 依赖能力

- `mcp/xxx-mcp tool_name`

## 边界

- 只产出结论与建议，写动作交人工确认后执行。
