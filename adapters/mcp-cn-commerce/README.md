# 中国电商经营数据 MCP 套件

> 业务环节：**数据分析** ｜ 台账条目：`da-01` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

中国电商经营数据 MCP 套件 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
pip install mcp-cn-commerce   # Python 3.11+，MIT 许可
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "cn-commerce": {
      "command": "python",
      "args": ["-m", "mcp_cn_commerce.douyin"],
      "env": { "DOUYIN_APP_KEY": "<your-key>", "DOUYIN_APP_SECRET": "<your-secret>" }
    }
  }
}
```

## 所需授权

- 各平台开放平台的 AppKey/AppSecret（抖店/淘宝/京东/快手/小红书/微信小店）
- 巨量引擎/千川的广告主账户授权

## 注意事项

- **默认只读**，不能直接做内容发布、改价等写操作。
- 仓库公开了 155 个注册工具，但能力矩阵中 `live_verified` 均为 false——**注册工具数 ≠ 可用工具数**，接入后必须用自己的店铺实测。
- 日报汇总会标记缺失数据与不完整分页，引用结论时保留数据覆盖说明。
- 各平台按独立 stdio MCP 提供，可按需只接授权的平台。

## 来源

- 仓库：https://github.com/TonyWang-hub/mcp-cn-commerce（MIT，2026-10 仍活跃）

## 本仓库中的关联

skills/daily-business-report · skills/sales-attribution · adapters/platform-order-mcp

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
