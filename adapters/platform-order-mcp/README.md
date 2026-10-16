# 平台订单查询（抖店/淘宝/京东/拼多多）

> 业务环节：**交易订单** ｜ 台账条目：`ord-01` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

平台订单查询（抖店/淘宝/京东/拼多多） 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# 只读：mcp-cn-commerce 各平台订单入口
# 写回传/实时推送：按各平台开放 API 自建（参考 mcp/oms-mcp 的接口约定）
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "platform-order": {
      "command": "python",
      "args": ["-m", "mcp_cn_commerce.douyin"],
      "env": { "DOUYIN_APP_KEY": "<key>", "DOUYIN_APP_SECRET": "<secret>" }
    }
  }
}
```

## 所需授权

- 各平台开放平台应用与店铺授权

## 注意事项

- **只读免开发**；订单状态回传、留言回复属写操作，需自建并加审批。
- 订单事实源统一到 OMS，平台侧仅作为同步来源，避免双写冲突。

## 来源

- 见 adapters/mcp-cn-commerce

## 本仓库中的关联

mcp/oms-mcp · skills/order-status-bot

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
