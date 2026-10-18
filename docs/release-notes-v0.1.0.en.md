# Ecommerce AI Agent Toolkit v0.1.0 (Pre-release)

First public preview. **62 capabilities** across the nine core loops of an e-commerce business — sourcing, product, marketing, orders, customer service, logistics, after-sales, reconciliation, and analytics — delivered as 20 orchestration skills, 8 built-in MCP servers (36 tools), 18 third-party adapters, and a four-layer automated test suite.

This is a **pre-release**: contracts and safety gates are fully verified, but a few scripts remain skeletons and no integration has been exercised against a live platform. Try it in a test environment; do not point it at production writes yet.

---

## Highlights

- **End-to-end coverage.** 20 skills all follow one eight-section spec — when to use, input contract, workflow, output contract, acceptance gates, failure samples, dependencies, boundaries — so every capability is inspectable before you run it.
- **Safety tiers enforced at the tool level.** All 62 capabilities are labelled L1–L4: L1 read-only runs autonomously, L2 reversible writes require an idempotency key, L3/L4 high-risk actions return an approval preview instead of executing. Verified tool by tool across all 36 MCP tools.
- **Zero-credential sandbox.** Every server and adapter supports `DRY_RUN=1` and returns clearly labelled fixture data. Clone, install, and run the entire suite without holding a single secret.
- **A quantified quality baseline.** Four test layers — contract parsing → static contract → dependency capability → scenario execution — produce 460 execution records at **100% pass**. 120 scenario cases are judged twice: deterministic assertions plus a weighted rubric.
- **One command to reproduce it.** `npm run test:all` runs all four layers (219 test cases); `npm run report` regenerates the full report.

## What's included

| Category | Count | Detail |
|---|---|---|
| Skills | 20 | Replenishment, supplier evaluation, competitor & selection analysis, review operations · promo planning, content publishing, ad-report insight, sales attribution · order risk review, order status bot, pre-sales guidance, sentiment escalation, FAQ evolution · after-sales liability, refund risk · multi-platform reconciliation, invoice & tax · inventory alert, shipment anomaly, daily business report |
| Built-in MCP servers | 8 | `erp-scm`, `express`, `express-intercept`, `finance-erp`, `oms`, `platform-im`, `sourcing-1688`, `wms` — TypeScript + MCP SDK over stdio |
| MCP tools | 36 | Safety split: L1 × 20 / L2 × 12 / L3 × 3 / L4 × 1 |
| Third-party adapters | 18 | Ad platforms, marketplaces, payments, logistics, help desk, warehouse — documented integration contracts, dry-run ready |
| Test suite | 4 layers | L0 contract indexing · L1 static contract (80) · L2 dependency capability (116) · L3 scenario execution (264 records); 21 assertion operators |

## Quality data

Full report: [`docs/testing-report.md`](testing-report.md).

| Metric | Value |
|---|---|
| Execution records | 460 (L1 80 + L2 116 + L3 264) |
| Pass rate | **100%** (460/460; `npm run test:all` → 219/219) |
| Defects found in-cycle | 8 on the first run (1 Major, 7 Minor) — **all fixed and re-verified** |
| Scenario judgement | 120 cases (normal / boundary / error, 40 each); rubric score avg 0.979, min 0.860 against a 0.8 threshold |
| P0 stability | 8 skills × 6 cases × 3 rounds → stability keys consistent 48/48 |
| L2 real-call latency | 29 ms avg / 585 ms max, including MCP handshake |

The first run found 8 real defects — insufficient failure samples in 5 skills' golden corpora, leftover template placeholders in 2 script docstrings, and a reconciliation script whose output fields had drifted from its own contract. All 8 were caught and located automatically by the L1/L2 layers, which is the main evidence that the layered design actually works.

## Quick start

```bash
git clone https://github.com/Lym308758/ecommerce-agent-toolkit.git
cd ecommerce-agent-toolkit
npm install
node scripts/validate.mjs        # verify all 62 capabilities are present
npm run build                    # compile the 8 MCP servers (8/8)
npm run test:all                 # four-layer suite (219 test cases)
```

Run a single server, no credentials needed:

```bash
cd mcp/wms-mcp && npm install
DRY_RUN=1 npx tsx src/index.ts   # stdio — plug into any MCP client
```

```json
{
  "mcpServers": {
    "wms": {
      "command": "npx",
      "args": ["tsx", "/abs/path/to/ecommerce-agent-toolkit/mcp/wms-mcp/src/index.ts"],
      "env": { "DRY_RUN": "1" }
    }
  }
}
```

Requires Node.js ≥ 20. Full setup: [`docs/getting-started.md`](getting-started.md).

## Security model

| Tier | Definition | Policy | Count |
|---|---|---|---|
| L1 | Read-only | Agent autonomy | 37 |
| L2 | Reversible write | Autonomous + audit log + rollback | 15 |
| L3 | Irreversible write (money, shipment) | Mandatory human approval | 4 |
| L4 | Customer-facing outbound | Draft → approve → send; drafting and sending are separate | 6 |

Also built in: servers default to `DRY_RUN=1`; every write carries an `idempotencyKey`; each skill declares token and call budgets; scheduled tasks write to a staging area and commit atomically.

> ⚠️ Signing logic for platform open APIs (Douyin/Taobao/Pinduoduo/JD and similar) is **interface placeholders plus mock implementations only**. Before connecting a real environment, obtain your own open-platform credentials and read the authorization boundaries in [`docs/governance.md`](governance.md).

## Known limitations

1. **No live integration.** Every external service runs in `DRY_RUN=1` sandbox mode. Real API behaviour, auth flows, and rate limits are untested.
2. **`replenish.py` is still a skeleton.** The idempotent runner is complete, but the replenishment formula lives in `SKILL.md` and is verified only at the L3 layer. Deterministic implementation is planned for `v0.2.0`.
3. **L3 scoring is self-assessed.** Scenario outputs are produced and scored by an AI agent following a fixed prompt, so reported latency reflects replay judgement rather than model inference. Making the judge independent is on the roadmap.
4. **No concurrency or load testing**, and no real scraping path has been exercised.

## Roadmap

Next: **v0.2.0 Harden** — CI enforcement on a Node 20/22 matrix, clearing the 10 leftover findings from the test report. Then **v0.3.0 Connect** — real-environment integration and evidence. See [`ROADMAP.md`](../ROADMAP.md).

## License

MIT © 2026 Lym308758

---

**Links** — [Repository](https://github.com/Lym308758/ecommerce-agent-toolkit) · [Documentation](https://github.com/Lym308758/ecommerce-agent-toolkit/tree/main/docs) · [Issues](https://github.com/Lym308758/ecommerce-agent-toolkit/issues) · [Discussions](https://github.com/Lym308758/ecommerce-agent-toolkit/discussions)

*This release is a pre-release. Chinese release notes: [`release-notes-v0.1.0.md`](release-notes-v0.1.0.md).*
