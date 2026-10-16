# 平台售后与退款单

> 业务环节：**售后处理** ｜ 台账条目：`as-01` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

平台售后与退款单 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# 只读：mcp-cn-commerce 售后/退款信息入口
# 审核与执行退款：按平台开放 API 自建（L3，强制审批）
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "platform-aftersales": {
      "command": "python",
      "args": ["-m", "mcp_cn_commerce.douyin"],
      "env": { "DOUYIN_APP_KEY": "<key>", "DOUYIN_APP_SECRET": "<secret>", "DRY_RUN": "1" }
    }
  }
}
```

## 所需授权

- 各平台开放平台应用与店铺授权

## 注意事项

- **只读免开发**；审核同意/执行退款为不可逆写，必须人工批准并留审计。
- 退款前建议先调用 `mcp/express-intercept-mcp` 评估拦截可能性。

## 来源

- 见 adapters/mcp-cn-commerce

## 本仓库中的关联

skills/refund-risk · skills/aftersales-liability · mcp/express-intercept-mcp

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
