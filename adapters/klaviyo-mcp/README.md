# Klaviyo 会员与邮件营销

> 业务环节：**营销推广** ｜ 台账条目：`mkt-03` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

Klaviyo 会员与邮件营销 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# 官方远程 MCP，OAuth 接入
npx -y mcp-remote https://mcp.klaviyo.com/
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "klaviyo": { "command": "npx", "args": ["-y", "mcp-remote", "https://mcp.klaviyo.com/"] }
  }
}
```

## 所需授权

- Klaviyo 账户 OAuth

## 注意事项

- 擅长报表、审计与**创建草稿**（活动/模板/档案）；截至 2026 年中不能直接编辑 flow 或创建分群。
- 定时发送能力为逐步放开状态，接入前确认当前版本能力。
- 营销触达属 L4 外发，正式发送前需人工批准。

## 来源

- https://mcp.klaviyo.com（官方托管）

## 本仓库中的关联

skills/content-publishing

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
