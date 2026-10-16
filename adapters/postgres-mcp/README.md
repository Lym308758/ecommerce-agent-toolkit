# PostgreSQL 业务库只读查询

> 业务环节：**基础通用** ｜ 台账条目：`base-07` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

PostgreSQL 业务库只读查询 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
npx -y @crystaldba/postgres-mcp   # Postgres MCP Pro，含健康检查与索引建议
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@crystaldba/postgres-mcp", "--access-mode", "restricted"],
      "env": { "DATABASE_URI": "postgresql://<user>:<pwd>@<host>:5432/<db>" }
    }
  }
}
```

## 所需授权

- 数据库连接串（建议使用**只读账号**）

## 注意事项

- 强烈建议使用 `--access-mode restricted` 或只读账号，避免 Agent 误写业务库。
- 官方参考实现（server-postgres）已归档，优先选活跃维护的社区实现。
- 只用于分析查询；业务事实源仍应走对应 MCP（WMS/OMS/账单）。

## 来源

- Postgres MCP Pro：https://github.com/crystaldba/postgres-mcp
- 官方归档参考：modelcontextprotocol/servers-archived

## 本仓库中的关联

docs/architecture.md（事实源登记）

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
