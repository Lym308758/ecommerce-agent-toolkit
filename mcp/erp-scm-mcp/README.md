# ERP / SCM 采购供应服务

> 业务环节：**采购供应** ｜ 最高安全级：**L2** ｜ 台账状态：`planned → integrated`

采购单、到货入库与供应商档案的读写入口，最高安全级 L2（可逆写）。

## 工具清单

| 工具 | 安全级 | 说明 |
|---|---|---|
| `list_suppliers` | L1 | 查询供应商档案列表 |
| `get_supplier` | L1 | 查询单个供应商详情与评分 |
| `list_purchase_orders` | L1 | 查询采购单列表（可按状态/供应商过滤） |
| `get_purchase_order` | L1 | 查询采购单详情与行项目 |
| `create_purchase_order` | L2 | 创建采购单（可逆，未审核前可作废） |
| `receive_purchase_order` | L2 | 采购到货入库确认（可逆：可红冲） |

安全级约定：L1 只读（Agent 自治）· L2 可逆写（审计可回滚）· L3 不可逆写（强制人工批准）· L4 客户外发（草稿与发送分离）。
L3/L4 工具在未传 `__approved=true` 时只返回预演结果，绝不产生真实副作用。

## 本地运行（无需凭证）

```bash
npm install
DRY_RUN=1 npm start
```

`DRY_RUN=1` 或未配置 `ERP_SCM_API_BASE` 时，所有工具返回 `mock: true` 的预演数据。

## 接入 MCP 客户端

```json
{
  "mcpServers": {
    "erp-scm-mcp": {
      "command": "npx",
      "args": ["tsx", "<repo>/mcp/erp-scm-mcp/src/index.ts"],
      "env": { "DRY_RUN": "1" }
    }
  }
}
```

## 接入真实环境

1. `cp .env.example .env`，填写 `ERP_SCM_API_BASE` 与 `ERP_SCM_API_BASE_TOKEN`；
2. 在 `src/client.ts` 中按 TODO 注释实现真实请求；
3. 先在测试环境验证，再去掉 `DRY_RUN`。

## 幂等与恢复

所有写操作必须传 `idempotencyKey`（建议 `业务域:业务ID:动作:日期`）；同一幂等键重复调用应返回首次结果，不得重复执行。
