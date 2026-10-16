# 腾讯企点客服

> 业务环节：**客户服务** ｜ 台账条目：`cs-01` ｜ 类型：**第三方现成能力（本仓库不复制其源码）**

## 用途

腾讯企点客服 的接入说明：安装命令、MCP 客户端配置、所需授权与注意事项。

## 安装

```bash
# 连接器市场授权即用（id: tencent-qidian-cs），无需自建 MCP
```

## MCP 客户端配置

```json
{
  "mcpServers": {
    "qidian-cs": {
      "command": "<connector-cli>",
      "args": ["serve"],
      "env": { "QIDIAN_TOKEN": "<your-token>" }
    }
  }
}
```

## 所需授权

- 腾讯企点客服账号与 API 授权

## 注意事项

- 覆盖工单（查询/创建/更新/状态流转）、坐席与实时接待、客户资料、会话记录、满意度与响应度报表。
- **直接补齐客服系统 MCP 缺口**，无需自建客服中台。
- 对客消息仍属 L4 外发，自动回复需人工批准策略。

## 来源

- WorkBuddy 连接器市场：腾讯企点客服

## 本仓库中的关联

skills/sentiment-escalation · skills/pre-sales-guidance · mcp/platform-im-mcp

---

> 通用提醒：第三方能力标称的工具数量不等于可用数量，接入后请以真实店铺/账户实测；
> 台账状态从 `integrated_pending` 改为 `verified` 时，请记录验证环境、日期与证据。
