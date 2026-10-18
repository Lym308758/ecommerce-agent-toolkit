# 1688/开放平台寻源比价服务

> 业务环节：**采购供应** ｜ 最高安全级：**L1** ｜ 台账状态：`connected（已接入 · 未真实验收）`

货源搜索、比价与供应商画像。全流程只读（L1），不产生任何写副作用。

## 工具清单

| 工具 | 安全级 | 说明 |
|---|---|---|
| `search_supply_items` | L1 | 按关键词搜索货源商品 |
| `compare_item_prices` | L1 | 对同一关键词的多个货源做比价排序 |
| `get_supplier_profile` | L1 | 查询供应商画像：评分、复购率、所在地 |
| `watch_price` | L1 | 登记价格监控（返回当前价与历史区间） |

安全级约定：L1 只读（Agent 自治）· L2 可逆写（审计可回滚）· L3 不可逆写（强制人工批准）· L4 客户外发（草稿与发送分离）。
L3/L4 工具在未传 `__approved=true` 时只返回预演结果，绝不产生真实副作用。

## 本地运行（无需凭证）

```bash
npm install
DRY_RUN=1 npm start
```

`DRY_RUN=1` 或未配置 `SOURCING_API_BASE` 时，所有工具返回 `mock: true` 的预演数据。

## 接入 MCP 客户端

```json
{
  "mcpServers": {
    "sourcing-1688-mcp": {
      "command": "npx",
      "args": ["tsx", "<repo>/mcp/sourcing-1688-mcp/src/index.ts"],
      "env": { "DRY_RUN": "1" }
    }
  }
}
```

## 接入真实环境

1. `cp .env.example .env`，填写 `SOURCING_API_BASE` 与 `SOURCING_API_BASE_TOKEN`；
2. 在 `src/client.ts` 中按 TODO 注释实现真实请求；
3. 先在测试环境验证，再去掉 `DRY_RUN`。

## 幂等与恢复

所有写操作必须传 `idempotencyKey`（建议 `业务域:业务ID:动作:日期`）；同一幂等键重复调用应返回首次结果，不得重复执行。
