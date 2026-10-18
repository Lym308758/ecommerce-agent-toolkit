# Roadmap

An AI agent capability toolkit covering the **nine core loops of an e-commerce business**: sourcing, product, marketing, orders, customer service, logistics, after-sales, reconciliation, and analytics.

This document tracks what ships next. Chinese version: [`docs/ROADMAP.zh.md`](docs/ROADMAP.zh.md). For the full rationale, task breakdown and risk register, see [`docs/iteration-plan.md`](docs/iteration-plan.md) (Chinese).

---

## Status

| | |
|---|---|
| **Current version** | `v0.1.0` (pre-release) |
| **Capabilities tracked** | 62 — 20 orchestration skills, 8 built-in MCP servers (36 tools), 17 third-party adapter docs, 16 platform built-ins |
| **Build state** | 44 built and tested in-repo; 18 adapters documented but not yet connected; **0 verified against a real business environment** |
| **Test state** | 460 execution records, 100% passing ([`docs/testing-report.md`](docs/testing-report.md)) |
| **Next milestone** | `v0.2.0 — Harden` |

> **Honest status:** every external integration currently runs in `DRY_RUN=1` sandbox mode. Nothing here has been exercised against a live store, warehouse, or ad account. Closing that gap is the whole point of `v0.3.0`.

## Legend

| Marker | Meaning |
|---|---|
| ✅ | Shipped |
| 🚧 | In progress |
| ⬜ | Planned |
| 🔒 | Blocked on your environment — needs real credentials, platform approval, or a test store |

---

## Milestones

### v0.2.0 — Harden ⬜

**Goal:** make the 460-record test suite reproducible on a clean checkout, and enforce it in CI. No new business capabilities.

- [x] **Commit L3 golden artifacts.** `tests/report/artifacts/` (256 KB, 216 keys) is the evidence base for 264 scenario records; it was previously excluded by `.gitignore`, so a fresh clone could not reproduce the suite. Now versioned as a golden regression asset.
- [x] **Correct the capability ledger.** 28 capabilities were marked `planned` / `build` although the code was already built and tested. Now `connected` / `ok`; `verified` stays at 0 because it requires real-environment evidence. `scripts/validate.mjs` now fails the build if the ledger and the filesystem ever drift apart again.
- [ ] **Full CI.** Extend `.github/workflows/ci.yml` from smoke-only to the whole pyramid: `validate` → `lint:secrets` → `build` → `test:all` → `report`, on a Node 20/22 matrix (Windows as a nightly job).
- [ ] **Clear the 10 leftover findings** from [`docs/testing-report.md`](docs/testing-report.md) §10:
  - [ ] Fix the `supplier-evaluation` N-02 expected-score interval.
  - [ ] Resolve three self-contradictory cases (`inventory-alert` E-02, `review-operations` N-01, `aftersales-liability` E-01).
  - [ ] Extend two contracts: `shipment-anomaly` gains `data_unavailable` / `data_mismatch`; `supplier-evaluation` allows `score: null`.
  - [ ] Unit-test all 21 assertion operators in `tests/harness/assert.mjs`.
  - [ ] Replace the `replenish.py` stub with deterministic calculation, matching `reconcile.py`.

### v0.3.0 — Connect 🔒

**Goal:** turn "green in sandbox" into "evidenced in reality". Every item needs a human-approved environment.

- [ ] **Integration guide.** `docs/integration-guide.md`: canary procedure for a test store / test warehouse, credential setup, the `DRY_RUN` → live switch, observation metrics, and rollback.
- [ ] **Real-environment drill** against at least one built-in MCP server (candidate: `wms-mcp` or `erp-scm-mcp`, both L2 reversible writes).
- [ ] **Live-connect the P0 read-only adapters** — `mcp-cn-commerce`, `postgres-mcp`, `playwright-mcp` — and publish the diff between sandbox fixtures and real payloads.
- [ ] **Judge independence.** L3 scenario scoring is currently self-assessed by the executing agent. Move to execution/review separation, or fall back to a 10% human audit, and publish the deviation.
- [ ] **Promote ≥10 capabilities to `verified`** with environment, date, and evidence recorded ([`docs/governance.md`](docs/governance.md) §3).

### v0.4.0 — Extend ⬜

- [ ] **Performance and concurrency baseline** — today only single-call latency is measured (L2: 29 ms avg / 585 ms max). Add concurrent spawn, end-to-end skill latency, and a live test of the `maxToolCalls` / `maxTokens` budget guards.
- [ ] **Example library** — grow `examples/` from 2 chains to ≥9, one per business loop, each with input sample, execution path, and expected output.
- [ ] **Observability** — audit-log schema for every L2+ write (who / when / which tool / which payload / `idempotencyKey`), call metrics, and an alerting path through the IM adapter.
- [ ] **Remaining P1/P2 capabilities**, prioritized after `v0.3.0` shows what is actually reachable.

### v1.0.0 — Productionize ⬜

- [ ] **Security audit** — end-to-end L3/L4 approval drill, including approval-bypass, cross-tenant, and replay attempts; secret rotation; expanded `check-secrets` rules.
- [ ] **Multi-tenancy** — per-store data and credential isolation, tenant-level quotas.
- [ ] **SLA and operations** — availability target, LLM-gateway degradation path, runbook for the `DRY_RUN` → live switch, incident response.
- [ ] **Contract versioning** — minor (new enum value, new optional field) vs. major (removed field, changed semantics), plus an upgrade guide.

---

## Definition of done (applies to every release)

1. `npm run validate` passes, with the ledger and the filesystem in agreement.
2. On a clean clone: `npm ci && npm run build && npm run test:all` → **460/460**.
3. `npm run report` regenerates [`docs/testing-report.md`](docs/testing-report.md); any regression is recorded as "first run X/460 → after fix 460/460".
4. Every capability state change carries evidence.
5. L3/L4 writes and anything public are human-approved before execution.

---

## Not planned

- Operating real stores — this is a capability toolkit, not an operations system.
- Commercial licensing, billing, or a license server.
- Reverse-engineered protocols, anti-risk-control bypasses, or bulk scraping of private data. This is a hard boundary, stated in [`docs/governance.md`](docs/governance.md) §7.
- Expansion beyond e-commerce.
- Distributed / multi-node deployment before `v1.0.0`.

---

## Contributing

Roadmap items are deliberately sized to be independently committable and independently regression-testable. If you want to pick one up:

1. Read [`docs/governance.md`](docs/governance.md) — the safety tiers and HITL rules are hard constraints, not suggestions.
2. Read [`CONTRIBUTING.md`](CONTRIBUTING.md).
3. Open an issue describing which milestone item you are taking, so the ledger stays accurate.

`v0.3.0` items marked 🔒 need a real environment; if you have test-store or sandbox credentials, that is the highest-leverage place to contribute.
