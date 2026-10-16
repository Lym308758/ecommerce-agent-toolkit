# IM 通知与群机器人

> 业务环节：**基础通用** ｜ 台账条目：`base-10` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

IM 通知与群机器人 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# 方式一：使用连接器（企业微信 / 飞书 / 钉钉），在连接器市场授权后即可用
# 方式二：自建 webhook MCP，见下方配置
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "im-notify": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "<your-webhook-mcp-endpoint>"],
      "env": { "IM_WEBHOOK_URL": "<your-webhook>", "DRY_RUN": "1" }
    }
  }
}
```

## 所需授权

- 企业微信/飞书/钉钉的机器人 Webhook 或应用凭证

## 注意事项

- 消息属 **L4 客户/同事外发**，不可撤回；告警可自动发，**对客内容必须人工批准**。
- 企业微信连接器在本环境中默认关闭，需在连接器菜单开启后授权。
- 告警类消息必须做去重与静默期，避免风暴。

## 来源

- 连接器市场：企业微信 / 飞书 / 钉钉（授权即用）

## 本仓库中的关联

skills/inventory-alert · skills/shipment-anomaly · skills/daily-business-report

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
