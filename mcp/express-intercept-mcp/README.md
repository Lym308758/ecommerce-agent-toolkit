# 快递在途拦截服务

> 业务环节：**售后处理** ｜ 最高安全级：**L3** ｜ 台账状态：`planned → integrated`

在途包裹拦截与撤销，用于减少退款损失。拦截为 L3 不可逆写，需人工批准。

## 工具清单

| 工具 | 安全级 | 说明 |
|---|---|---|
| `request_intercept` | L3 | 发起在途拦截退回（不可逆，需人工批准） |
| `get_intercept_status` | L1 | 查询拦截单状态 |
| `cancel_intercept` | L3 | 撤销拦截（包裹未退回前可撤销） |

安全级约定：L1 只读（Agent 自治）· L2 可逆写（审计可回滚）· L3 不可逆写（强制人工批准）· L4 客户外发（草稿与发送分离）。
L3/L4 工具在未传 `__approved=true` 时只返回预演结果，绝不产生真实副作用。

## 本地运行（无需凭证）

```bash
npm install
DRY_RUN=1 npm start
```

`DRY_RUN=1` 或未配置 `EXPRESS_API_BASE` 时，所有工具返回 `mock: true` 的预演数据。

## 接入 MCP 客户端

```json
{
  "mcpServers": {
    "express-intercept-mcp": {
      "command": "npx",
      "args": ["tsx", "<repo>/mcp/express-intercept-mcp/src/index.ts"],
      "env": { "DRY_RUN": "1" }
    }
  }
}
```

## 接入真实环境

1. `cp .env.example .env`，填写 `EXPRESS_API_BASE` 与 `EXPRESS_API_BASE_TOKEN`；
2. 在 `src/client.ts` 中按 TODO 注释实现真实请求；
3. 先在测试环境验证，再去掉 `DRY_RUN`。

## 幂等与恢复

所有写操作必须传 `idempotencyKey`（建议 `业务域:业务ID:动作:日期`）；同一幂等键重复调用应返回首次结果，不得重复执行。
