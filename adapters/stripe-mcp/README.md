# Stripe / 微信支付对账

> 业务环节：**交易订单 · 财务对账** ｜ 台账条目：`ord-03 / fin-02` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

Stripe / 微信支付对账 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# Stripe：官方远程 MCP（OAuth，需先在 Dashboard 开启 MCP 访问）
claude mcp add --transport http stripe https://mcp.stripe.com/
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "stripe": { "command": "npx", "args": ["-y", "mcp-remote", "https://mcp.stripe.com/"] }
  }
}
```

## 所需授权

- Stripe OAuth（管理员需分别为 sandbox / live 开启 MCP 访问）
- 国内：微信支付商户 API 或 weixinpay skill（需开通）

## 注意事项

- 通用工具 `stripe_api_read/write` 覆盖大部分能力，另有 `create_refund`、`stripe_report` 等专用工具。
- **退款属 L3 不可逆写**，即使有 MCP 也必须走人工审批。
- live 模式令牌务必最小权限，禁止提交到仓库。

## 来源

- https://mcp.stripe.com（Stripe 官方）
- stripe/ai（agent-toolkit，1952 stars）

## 本仓库中的关联

skills/multi-platform-reconciliation · mcp/finance-erp-mcp

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
