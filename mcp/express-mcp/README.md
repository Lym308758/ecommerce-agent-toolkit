# 快递面单与轨迹服务

> 业务环节：**物流仓储** ｜ 最高安全级：**L2** ｜ 台账状态：`connected（已接入 · 未真实验收）`

电子面单取号、物流轨迹查询与面单取消，对接快递100/菜鸟等开放 API。

## 工具清单

| 工具 | 安全级 | 说明 |
|---|---|---|
| `create_waybill` | L2 | 下单取号获取电子面单（未揽收前可取消） |
| `get_tracking` | L1 | 查询物流全链路轨迹 |
| `list_carriers` | L1 | 查询可用快递公司与编码 |
| `cancel_waybill` | L2 | 取消电子面单（未揽收） |

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
    "express-mcp": {
      "command": "npx",
      "args": ["tsx", "<repo>/mcp/express-mcp/src/index.ts"],
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
