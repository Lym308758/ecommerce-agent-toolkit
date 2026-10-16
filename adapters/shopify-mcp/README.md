# Shopify / 有赞 / WooCommerce

> 业务环节：**商品管理** ｜ 台账条目：`prod-02` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

Shopify / 有赞 / WooCommerce 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
npx shopify-mcp --accessToken <token> --domain <your-store>.myshopify.com
# 或用 Shopify 官方 Dev MCP（应用与主题开发场景）
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "shopify": {
      "command": "npx",
      "args": ["shopify-mcp", "--clientId", "<id>", "--clientSecret", "<secret>", "--domain", "<your-store>.myshopify.com"]
    }
  }
}
```

## 所需授权

- Shopify Admin API 访问令牌（shpat_）或 OAuth Client Credentials

## 注意事项

- 社区实现提供商品/订单/客户/库存/退款的 CRUD，**写操作建议先只读接入**。
- 令牌泄露风险高，务必最小 scope 并定期轮换；切勿提交令牌到仓库。
- 有赞为 SDK-only 接入（见 mcp-cn-commerce 说明），需自行封装。

## 来源

- 社区实现：https://github.com/GeLi2001/shopify-mcp
- Shopify 官方：shopify-dev-mcp（开发文档与 API 场景）

## 本仓库中的关联

adapters/stripe-mcp

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
