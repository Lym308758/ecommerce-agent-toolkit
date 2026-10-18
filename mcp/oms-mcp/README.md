# OMS 订单中台服务

> 业务环节：**交易订单** ｜ 最高安全级：**L3** ｜ 台账状态：`connected（已接入 · 未真实验收）`

多平台订单聚合、拆合单、审单与状态回传。审单发货为 L3 不可逆写，强制人工审批。

## 工具清单

| 工具 | 安全级 | 说明 |
|---|---|---|
| `list_orders` | L1 | 查询订单列表（平台/状态/时间范围） |
| `get_order` | L1 | 查询订单详情、买家留言与履约进度 |
| `split_order` | L2 | 拆分订单（可逆：可合并回去） |
| `merge_orders` | L2 | 合并订单（同一买家同地址，可逆） |
| `review_order` | L3 | 审单通过并下发仓库（不可逆，需人工批准） |
| `update_order_status` | L2 | 更新订单状态（可逆的状态流转） |

安全级约定：L1 只读（Agent 自治）· L2 可逆写（审计可回滚）· L3 不可逆写（强制人工批准）· L4 客户外发（草稿与发送分离）。
L3/L4 工具在未传 `__approved=true` 时只返回预演结果，绝不产生真实副作用。

## 本地运行（无需凭证）

```bash
npm install
DRY_RUN=1 npm start
```

`DRY_RUN=1` 或未配置 `OMS_API_BASE` 时，所有工具返回 `mock: true` 的预演数据。

## 接入 MCP 客户端

```json
{
  "mcpServers": {
    "oms-mcp": {
      "command": "npx",
      "args": ["tsx", "<repo>/mcp/oms-mcp/src/index.ts"],
      "env": { "DRY_RUN": "1" }
    }
  }
}
```

## 接入真实环境

1. `cp .env.example .env`，填写 `OMS_API_BASE` 与 `OMS_API_BASE_TOKEN`；
2. 在 `src/client.ts` 中按 TODO 注释实现真实请求；
3. 先在测试环境验证，再去掉 `DRY_RUN`。

## 幂等与恢复

所有写操作必须传 `idempotencyKey`（建议 `业务域:业务ID:动作:日期`）；同一幂等键重复调用应返回首次结果，不得重复执行。
