# 示例二：售后闭环链（端到端）

演示「客服接入 → 并行取数 → 定责 → 退款/拦截 → 财务记录 → 指标回哺」的完整闭环，重点是可追溯与外发审批。

## 参与能力

| 环节 | 能力 | 安全级 |
|---|---|---|
| 会话读取 | `mcp/platform-im-mcp get_session_messages` | L1 |
| 情绪升级 | `skills/sentiment-escalation` | L1 |
| 订单与轨迹 | `mcp/oms-mcp get_order`、`mcp/express-mcp get_tracking` | L1 |
| 责任判定 | `skills/aftersales-liability` | L1 |
| 退款风控 | `skills/refund-risk` | L1 |
| 拦截 | `mcp/express-intercept-mcp request_intercept` | L3 |
| 退款执行 | `adapters/platform-aftersales-mcp`（写自建） | L3 |
| 财务凭证 | `mcp/finance-erp-mcp push_voucher` | L2 |
| 指标回哺 | `skills/daily-business-report` | L1 |

## 执行流程

```
1. 会话接入      platform-im.get_session_messages        → 只读
2. 情绪判定      sentiment-escalation                    → 命中即生成人工摘要
3. 并行取证据    oms.get_order + express.get_tracking    → 证据链（订单/轨迹/会话/政策）
4. 责任判定      aftersales-liability                    → 置信度<0.6 输出 undetermined
5a. 可拦截       express-intercept.request_intercept     → L3，需 __approved=true
5b. 需退款       refund-risk → platform-aftersales 退款  → L3，人工审批
6. 财务记录      finance-erp.push_voucher                → L2，带 sourceRef 与幂等键
7. 指标回哺      daily-business-report                   → 计入售后率
```

## 关键约束

- **证据链可追溯**：定责结论必须引用 ≥1 条证据（订单号、轨迹时间点、会话原文、政策条款）；
- **外发必须审批**：`platform-im-mcp.send_message` 未传 `__approved=true` 时只返回草稿，绝不发送；
- **不可逆写有预演**：L3 工具默认返回 `requiresApproval: true` 的预演结果；
- **只分流不拒赔**：`refund-risk` 只做风险分流，不得因评分拒绝合规退款。

## 失败样本

| 场景 | 期望行为 |
|---|---|
| 轨迹缺失 | 输出 `gaps`，定责 `undetermined`，转人工 |
| 客户自述与轨迹冲突 | 并列呈现，不强行定责 |
| 拦截接口超时 | 幂等键重试 ≤3 次，失败转人工，不得重复发起 |
| 涉及投诉平台/监管 | 一律 P0 升级人工，不自动回复 |
