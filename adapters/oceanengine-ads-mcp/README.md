# 巨量引擎 / 巨量千川广告数据

> 业务环节：**营销推广** ｜ 台账条目：`mkt-01` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

巨量引擎 / 巨量千川广告数据 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# 经 mcp-cn-commerce 的巨量引擎/千川入口读取账户信息与余额
pip install mcp-cn-commerce
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "oceanengine": {
      "command": "python",
      "args": ["-m", "mcp_cn_commerce.oceanengine"],
      "env": { "OCEANENGINE_APP_ID": "<id>", "OCEANENGINE_SECRET": "<secret>" }
    }
  }
}
```

## 所需授权

- 巨量引擎/千川开放平台应用与广告主账户授权

## 注意事项

- 现成入口覆盖**账户信息与余额**，消耗明细/计划级数据可能需按开放平台 API 自建。
- 广告数据口径与平台后台需对齐（归因窗口），解读时注明口径。

## 来源

- 见 adapters/mcp-cn-commerce 的能力矩阵说明

## 本仓库中的关联

skills/ad-report-insight

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
