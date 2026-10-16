# 平台 IM 客服消息服务

> 业务环节：**客户服务** ｜ 最高安全级：**L4** ｜ 台账状态：`planned → integrated`

平台买家会话与消息收发。发送为 L4 客户外发，默认只生成草稿，必须经人工批准后发送。

## 工具清单

| 工具 | 安全级 | 说明 |
|---|---|---|
| `list_sessions` | L1 | 查询会话列表（可按时段/未读过滤） |
| `get_session_messages` | L1 | 拉取指定会话的历史消息 |
| `draft_reply` | L1 | 生成回复草稿（不发送，返回文本与依据引用） |
| `send_message` | L4 | 发送消息给买家（需 __approved=true，不可撤回） |

安全级约定：L1 只读（Agent 自治）· L2 可逆写（审计可回滚）· L3 不可逆写（强制人工批准）· L4 客户外发（草稿与发送分离）。
L3/L4 工具在未传 `__approved=true` 时只返回预演结果，绝不产生真实副作用。

## 本地运行（无需凭证）

```bash
npm install
DRY_RUN=1 npm start
```

`DRY_RUN=1` 或未配置 `IM_API_BASE` 时，所有工具返回 `mock: true` 的预演数据。

## 接入 MCP 客户端

```json
{
  "mcpServers": {
    "platform-im-mcp": {
      "command": "npx",
      "args": ["tsx", "<repo>/mcp/platform-im-mcp/src/index.ts"],
      "env": { "DRY_RUN": "1" }
    }
  }
}
```

## 接入真实环境

1. `cp .env.example .env`，填写 `IM_API_BASE` 与 `IM_API_BASE_TOKEN`；
2. 在 `src/client.ts` 中按 TODO 注释实现真实请求；
3. 先在测试环境验证，再去掉 `DRY_RUN`。

## 幂等与恢复

所有写操作必须传 `idempotencyKey`（建议 `业务域:业务ID:动作:日期`）；同一幂等键重复调用应返回首次结果，不得重复执行。
