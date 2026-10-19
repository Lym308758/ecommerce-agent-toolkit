# 贡献指南

欢迎补充能力、修正对接细节或分享真实联调结论。本仓库的目标是让电商 Agent 的能力**可复用、可验证、可安全下线**。

## 三条硬规则

1. **事实与视图分离**：`capability-bank.json` 是唯一权威数据源。新增或修改能力必须改 JSON，文档与目录由 `node scripts/validate.mjs` 校验一致性。
2. **安全分级不可跳过**：每个工具必须标注 `L1 只读 / L2 可逆写 / L3 不可逆写 / L4 客户外发`。L3/L4 默认 `dry-run`，必须提供幂等键与审批位。
3. **注册 ≠ 可用**：标注为「现成可接」的能力，只有在真实店铺/沙箱联调通过后，才能把 `ledger` 从 `integrated_pending` 改为 `verified`，并在 README 注明验证环境与日期。

## 目录约定

| 目录 | 放什么 | 不放什么 |
|---|---|---|
| `mcp/<name>/` | 自建 MCP Server（TS）：`package.json`、`src/index.ts`、`src/client.ts`、`.env.example`、`test/` | 真实凭证、内部域名 |
| `skills/<name>/` | `SKILL.md`（带 frontmatter）+ `scripts/` + `references/` | 与业务无关的通用提示词 |
| `adapters/<name>/` | 第三方能力的接入文档：安装命令、`mcp.json` 片段、授权清单 | 复制第三方源码 |
| `docs/` | 架构、治理、上手说明、能力矩阵 | 内部店铺名、内网地址 |

## 提交流程

```bash
node scripts/validate.mjs     # 校验 62 项能力齐备、目录与台账一致
node scripts/check-secrets.mjs# 扫描是否误提交凭证
npm test                      # 四层全量测试（L0-L3，219 个用例）
```

> 其中两个 Skill 脚本用例（replenish.py / reconcile.py）需要 Python 3.10+：默认探测 PATH 上的 `python` / `python3`，也可用 `PYTHON=/path/to/python npm test` 显式指定。

- 新增 MCP Server：复制任一现有 `mcp/<name>/` 目录改 `tools.ts`，保证 `DRY_RUN=1` 下可独立启动。
- 新增 Skill：复制 `skills/_template/SKILL.md`，必须填写「输入契约 / 输出契约 / 验收门禁 / 失败样本」四节。
- 新增 adapter：只需 `README.md`，字段见 `adapters/_template/README.md`。

## 边界声明

- 不收录逆向协议、绕过风控、批量爬取平台私有数据的实现。
- 不提交任何真实的 API Key、Cookie、店铺名、内网域名；`.env.example` 只允许占位符。
- 引用第三方能力时注明来源与版本，并保留其原始许可证。
