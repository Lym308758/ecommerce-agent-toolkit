# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

See [`ROADMAP.md`](ROADMAP.md) for planned work. Target: **v0.2.0 Harden** — full CI enforcement on a Node 20/22 matrix and clearing the 10 leftover findings listed in [`docs/testing-report.md`](docs/testing-report.md) §10.

## [0.1.0] - 2026-10-19

First public preview. 62 capabilities across the nine core loops of an e-commerce business, plus a four-layer automated test suite that passes 460/460.

### Added

- **Capability ledger** — `capability-bank.json` as the single authoritative source for 62 capabilities (module, priority, deployment, safety tier, ledger state, source, artifact path). Markdown and HTML views are rendered from it.
- **8 built-in MCP servers** (`mcp/`) — `erp-scm`, `sourcing-1688`, `oms`, `platform-im`, `wms`, `express`, `express-intercept`, `finance-erp`. TypeScript + MCP SDK over stdio, 36 tools, real/mock dual client implementations, `DRY_RUN=1` by default.
- **20 orchestration skills** (`skills/`) — each an eight-section spec: when to use, input contract, workflow, output contract, acceptance gates, failure samples, dependencies, boundaries.
- **17 third-party adapter documents** (`adapters/`) — install commands, MCP config snippets and authorization checklists; no vendored source.
- **Four-layer test suite** (`tests/`) — L0 contract indexing, L1 static contract (80), L2 dependency capability (116), L3 scenario execution (264 records from 120 cases), with 21 assertion operators and an aggregate/report pipeline.
- **Governance specification** (`docs/governance.md`) — L1–L4 safety tiers, HITL outbound state machine, idempotency and recovery, budget and loop protection, acceptance gates, authorization boundaries.
- **Repository scripts** — `validate.mjs` (ledger consistency), `check-secrets.mjs` (credential leak scan), `build.mjs`, `test-all.mjs`.
- **Two end-to-end example chains** (`examples/`) — promo battle chain and after-sales closure chain.
- **CI workflow** — validate, secret scan, and MCP smoke tests on pushes and pull requests.

### Changed

- **Capability ledger reclassified (2026-10-19).** 28 capabilities that were already built and tested were still marked `planned` / `integrated_pending`. They are now `connected` / `ok`; `verified` remains 0 because it requires real-business-environment evidence. Public counts now read 44 built / 18 to connect. `scripts/validate.mjs` now fails if the ledger and the filesystem drift apart again.
- **`tests/report/artifacts/` is now versioned.** These 216 scenario outputs are the evidence base for 264 L3 records; previously excluded by `.gitignore`, which made the suite unreproducible on a clean clone. `results-*.jsonl` and `summary.json` remain ignored (regenerable).

### Fixed

Defects found by the first full test run — 8 in capabilities, 3 in the test harness itself. All are re-verified at 460/460.

- `multi-platform-reconciliation/scripts/reconcile.py` emitted output fields that did not match its own contract, and its difference calculation was a TODO skeleton. Rewritten: three-way alignment on order ID, four difference types (`underpaid` / `overcharged` / `missing` / `refund_unsynced`), a recomputable `basis` expression on every line, and a summary equal to the sum of its parts. *(Major)*
- Golden corpus for 5 skills (`ad-report-insight`, `order-status-bot`, `sentiment-escalation`, `shipment-anomaly`, `supplier-evaluation`) held only one failure sample each, below the gate of ≥2. One sample added per skill.
- Leftover template placeholders `{cn}` / `{slug}` in the docstrings of `reconcile.py` and `replenish.py`.
- `tests/harness/assert.mjs` — `getPath` did not support indexed paths such as `items[0].suggestQty`, silently returning `undefined` for 45 assertions; `sumApprox` ignored `expected.field` on arrays of objects.
- `tests/harness/runner-utils.mjs` — `buildRecord` re-ran assertions against the raw output, dropping derived fields and misreporting 194 of 264 records as failed while the tests themselves passed.
- `tests/harness/record.mjs` — all three layers wrote to the same `results.jsonl` with `fresh: true`, so they deleted each other's records. Now split per layer.

---

[Unreleased]: https://github.com/Lym308758/ecommerce-agent-toolkit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Lym308758/ecommerce-agent-toolkit/releases/tag/v0.1.0
