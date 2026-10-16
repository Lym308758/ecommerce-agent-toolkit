# Playwright 浏览器自动化

> 业务环节：**基础通用** ｜ 台账条目：`base-08` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

Playwright 浏览器自动化 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
npx -y @playwright/mcp@latest   # 或 npx -y @executeautomation/playwright-mcp-server
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

## 所需授权

- 无需 API Key；首次运行需下载浏览器内核（ playwright install ）

## 注意事项

- 用于操作**没有开放 API 的商家后台页面**（改价、审核、导出），是 API 的兜底手段。
- 页面结构变化会导致工具失效，需定期回归；优先用官方 API，浏览器只做补充。
- 涉及真实写操作的页面动作建议保留人工确认。

## 来源

- 仓库：https://github.com/microsoft/playwright-mcp（Microsoft 官方维护，38k+ stars）

## 本仓库中的关联

adapters/platform-product-mcp · adapters/platform-aftersales-mcp

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
