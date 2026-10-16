# 财务凭证对接服务

> 业务环节：**财务对账** ｜ 最高安全级：**L2** ｜ 台账状态：`planned → integrated`

把对账差异推送为财务凭证，对接金蝶/用友等系统。凭证可红冲，属 L2 可逆写。

## 工具清单

| 工具 | 安全级 | 说明 |
|---|---|---|
| `push_voucher` | L2 | 推送凭证（可红冲，需差异来源单号） |
| `get_voucher_status` | L1 | 查询凭证状态与红冲情况 |
| `list_accounts` | L1 | 查询科目列表 |

安全级约定：L1 只读（Agent 自治）· L2 可逆写（审计可回滚）· L3 不可逆写（强制人工批准）· L4 客户外发（草稿与发送分离）。
L3/L4 工具在未传 `__approved=true` 时只返回预演结果，绝不产生真实副作用。

## 本地运行（无需凭证）

```bash
npm install
DRY_RUN=1 npm start
```

`DRY_RUN=1` 或未配置 `FINANCE_API_BASE` 时，所有工具返回 `mock: true` 的预演数据。

## 接入 MCP 客户端

```json
{
  "mcpServers": {
    "finance-erp-mcp": {
      "command": "npx",
      "args": ["tsx", "<repo>/mcp/finance-erp-mcp/src/index.ts"],
      "env": { "DRY_RUN": "1" }
    }
  }
}
```

## 接入真实环境

1. `cp .env.example .env`，填写 `FINANCE_API_BASE` 与 `FINANCE_API_BASE_TOKEN`；
2. 在 `src/client.ts` 中按 TODO 注释实现真实请求；
3. 先在测试环境验证，再去掉 `DRY_RUN`。

## 幂等与恢复

所有写操作必须传 `idempotencyKey`（建议 `业务域:业务ID:动作:日期`）；同一幂等键重复调用应返回首次结果，不得重复执行。
