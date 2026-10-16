# 高德地图地址与路由

> 业务环节：**物流仓储** ｜ 台账条目：`log-03` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

高德地图地址与路由 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
npx -y @amap/amap-maps-mcp-server   # 需 AMAP_KEY
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "amap": {
      "command": "npx",
      "args": ["-y", "@amap/amap-maps-mcp-server"],
      "env": { "AMAP_KEY": "<your-key>" }
    }
  }
}
```

## 所需授权

- 高德开放平台 Key（Web 服务类型）

## 注意事项

- 用于地址标准化、省市区校验、就近仓发货建议。
- 地图可视化类需求需遵守地图合规要求（审图号/底图来源）。
- Key 需限制调用量与域名白名单。

## 来源

- 高德开放平台 MCP（官方/社区实现多个版本）

## 本仓库中的关联

mcp/wms-mcp · mcp/express-mcp

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
