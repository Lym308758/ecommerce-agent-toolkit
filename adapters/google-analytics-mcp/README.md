# Google Analytics

> 业务环节：**数据分析** ｜ 台账条目：`da-02` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

Google Analytics 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# Google 官方开源 MCP（本地运行，使用 Admin/Data API）
npx -y @google/analytics-mcp
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "ga": {
      "command": "npx",
      "args": ["-y", "@google/analytics-mcp"],
      "env": { "GOOGLE_APPLICATION_CREDENTIALS": "<path-to-service-account.json>" }
    }
  }
}
```

## 所需授权

- Google Cloud 服务账号凭据（Analytics 只读权限即可）

## 注意事项

- 提供账户摘要、实时报表、漏斗报表、自定义维度与指标。
- **纯报表只读**，无任何写能力，适合独立站分析场景。

## 来源

- Google Analytics MCP（Google Analytics 团队官方开源）

## 本仓库中的关联

skills/daily-business-report

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
