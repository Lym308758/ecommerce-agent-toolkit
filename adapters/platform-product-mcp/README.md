# 平台商品 MCP（淘宝/抖店/京东/拼多多）

> 业务环节：**商品管理** ｜ 台账条目：`prod-01` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

平台商品 MCP（淘宝/抖店/京东/拼多多） 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# 优先用平台官方开放 MCP（如淘宝闪购已开放 35 个 Server，覆盖商品管理等 15 个业务域）
# 只读分析可先用 mcp-cn-commerce 替代，写操作需按开放平台 API 自建
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "platform-product": {
      "command": "python",
      "args": ["-m", "your_platform_mcp.product"],
      "env": { "PLATFORM_APP_KEY": "<your-key>", "PLATFORM_APP_SECRET": "<your-secret>", "DRY_RUN": "1" }
    }
  }
}
```

## 所需授权

- 各平台开放平台应用资质（AppKey/AppSecret）与商家授权（OAuth）

## 注意事项

- **只读可接现成，写操作（上架/改价/改库存）必须自建并加二次确认**。
- 平台侧对高危写入通常有二次确认规则，接入时保留该机制。
- 商品主图/详情图可配合 Picset 电商设计连接器生成，不必自己造出图流水线。

## 来源

- 淘宝闪购开放 MCP：面向服务商与自研商家，OAuth 授权 + 高危写二次确认
- 只读替代：adapters/mcp-cn-commerce

## 本仓库中的关联

mcp/wms-mcp（库存事实源） · skills/promo-planning

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
