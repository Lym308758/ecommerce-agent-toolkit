# Firecrawl 网页抓取

> 业务环节：**采购供应** ｜ 台账条目：`proc-03` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

Firecrawl 网页抓取 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
npx -y firecrawl-mcp   # 需 FIRECRAWL_API_KEY
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "<your-key>" }
    }
  }
}
```

## 所需授权

- Firecrawl API Key（有免费额度）

## 注意事项

- 用于行情与竞品公开页抓取；**只抓公开页面**，不得用于绕过登录或反爬。
- 结果需标注抓取时间与来源，价格类结论要保留时间窗口。
- 按量计费，建议设置月度额度上限。

## 来源

- https://github.com/mendableai/firecrawl-mcp

## 本仓库中的关联

skills/competitor-selection · mcp/sourcing-1688-mcp

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
