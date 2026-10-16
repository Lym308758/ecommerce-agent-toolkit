# 平台账单与结算

> 业务环节：**财务对账** ｜ 台账条目：`fin-01` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

平台账单与结算 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# 淘宝闪购已开放财务账单域 MCP；其他平台经 mcp-cn-commerce 或按结算 API 自建
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "platform-bill": {
      "command": "python",
      "args": ["-m", "your_platform_mcp.bill"],
      "env": { "PLATFORM_APP_KEY": "<key>", "PLATFORM_APP_SECRET": "<secret>", "DRY_RUN": "1" }
    }
  }
}
```

## 所需授权

- 各平台开放平台应用与商家授权（财务类权限需单独申请）

## 注意事项

- 拉取结算单、佣金明细、推广费、罚款扣款；**资金类数据只读**，任何一方不得写。
- 对账必须双源核对（平台账单 + 支付通道），差异进 `dataGaps` 而非估算补齐。

## 来源

- 淘宝闪购开放 MCP（财务账单域）
- 见 adapters/mcp-cn-commerce

## 本仓库中的关联

skills/multi-platform-reconciliation · adapters/stripe-mcp

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
