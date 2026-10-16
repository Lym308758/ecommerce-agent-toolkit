# WMS 仓储库存服务

> 业务环节：**物流仓储** ｜ 最高安全级：**L2** ｜ 台账状态：`planned → integrated`

库存查询、出入库、盘点与库存锁定。事实源权威，禁止在 Agent 侧缓存库存。

## 工具清单

| 工具 | 安全级 | 说明 |
|---|---|---|
| `get_stock` | L1 | 查询 SKU 可用/在途/锁定库存（事实源） |
| `list_warehouses` | L1 | 查询仓库列表与启用状态 |
| `create_outbound_order` | L2 | 创建销售出库单（可逆：未拣货可取消） |
| `create_inbound_order` | L2 | 创建入库单（采购/退货入库） |
| `adjust_stock` | L2 | 库存调整（盘盈盘亏，需原因码） |
| `create_stocktake` | L2 | 创建盘点任务 |

安全级约定：L1 只读（Agent 自治）· L2 可逆写（审计可回滚）· L3 不可逆写（强制人工批准）· L4 客户外发（草稿与发送分离）。
L3/L4 工具在未传 `__approved=true` 时只返回预演结果，绝不产生真实副作用。

## 本地运行（无需凭证）

```bash
npm install
DRY_RUN=1 npm start
```

`DRY_RUN=1` 或未配置 `WMS_API_BASE` 时，所有工具返回 `mock: true` 的预演数据。

## 接入 MCP 客户端

```json
{
  "mcpServers": {
    "wms-mcp": {
      "command": "npx",
      "args": ["tsx", "<repo>/mcp/wms-mcp/src/index.ts"],
      "env": { "DRY_RUN": "1" }
    }
  }
}
```

## 接入真实环境

1. `cp .env.example .env`，填写 `WMS_API_BASE` 与 `WMS_API_BASE_TOKEN`；
2. 在 `src/client.ts` 中按 TODO 注释实现真实请求；
3. 先在测试环境验证，再去掉 `DRY_RUN`。

## 幂等与恢复

所有写操作必须传 `idempotencyKey`（建议 `业务域:业务ID:动作:日期`）；同一幂等键重复调用应返回首次结果，不得重复执行。
