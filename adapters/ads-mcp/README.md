# Meta Ads / Google Ads

> 业务环节：**营销推广** ｜ 台账条目：`mkt-02` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

Meta Ads / Google Ads 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# Meta：官方托管 MCP（Business OAuth）
claude mcp add --transport http meta-ads https://mcp.facebook.com/ads/
# Google：官方开源 MCP（本地凭据）
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "meta-ads": { "command": "npx", "args": ["-y", "mcp-remote", "https://mcp.facebook.com/ads/"] },
    "google-ads": { "command": "npx", "args": ["-y", "google-ads-mcp"], "env": { "GOOGLE_ADS_CREDENTIALS": "<path>" } }
  }
}
```

## 所需授权

- Meta Business OAuth（29 个工具，覆盖报表/投放/目录/诊断）
- Google Ads API 凭据

## 注意事项

- Meta MCP **看不到库存**，出价与预算决策需结合库存数据（见 wms-mcp）。
- 写操作（改预算/建活动）建议先用草稿，人工确认后提交。

## 来源

- Meta Ads MCP（官方，2026-04 上线）
- Google Ads MCP（Google 开发者工具包官方项目）

## 本仓库中的关联

mcp/wms-mcp · skills/ad-report-insight

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
