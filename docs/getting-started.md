# 上手指南

## 1. 选择落地顺序

不要一次性接入 62 项。推荐按业务价值与风险排序：

1. **先只读**（L1）：`sourcing-1688-mcp`、`oms-mcp` 的查询工具、`wms-mcp` 的 `get_stock`、adapters 里的 `mcp-cn-commerce`。
2. **再可逆写**（L2）：`wms-mcp` 出入库、`express-mcp` 面单、`erp-scm-mcp` 采购单 —— 打开审计日志，先在测试仓跑一周。
3. **最后不可逆/外发**（L3/L4）：`express-intercept-mcp`、`oms-mcp` 审单发货、`platform-im-mcp` 发送 —— 接人工审批后再开启。

## 2. 跑通第一个 Server（无需任何凭证）

```bash
cd mcp/wms-mcp
npm install
DRY_RUN=1 npx tsx src/index.ts
```

进程通过 stdio 提供 MCP 协议。任意 MCP 客户端按 `README.md` 的配置片段接入即可看到工具列表。`DRY_RUN=1` 时所有写操作返回 `mock: true` 的预演结果，不会产生任何真实副作用。

## 3. 接入真实环境

1. 复制 `.env.example` 为 `.env`，填入开放平台 / WMS / 快递的凭证（**不要提交 `.env`**）。
2. 在 `src/client.ts` 中实现真实请求（已给出接口位与 TODO 标记）。
3. 去掉 `DRY_RUN`，先用**测试店铺/测试仓**跑通，再切生产。

## 4. 接入第三方现成能力

`adapters/` 下每个目录一份 README：安装命令、`mcp.json` 片段、所需授权、注意事项。例如国内平台经营数据：

```bash
pipx install mcp-cn-commerce      # 详见 adapters/mcp-cn-commerce/README.md
```

> 提醒：`mcp-cn-commerce` 公开了 155 个注册工具，但其能力矩阵中 `live_verified` 状态均为 false——**注册工具数 ≠ 可用工具数**，接入前请按自己的店铺实测。

## 5. 使用 Skill

Skill 是给 Agent 看的编排说明书，放在 `skills/<name>/SKILL.md`。可直接复制到你的 Agent 技能目录，或在提示词中引用。每个 Skill 都包含：输入契约、输出契约、验收门禁、失败样本、安全分级。

## 6. 校验仓库完整性

```bash
node scripts/validate.mjs        # 62 项能力是否齐备、目录与 capability-bank.json 是否一致
node scripts/check-secrets.mjs   # 是否误提交真实凭证
```
