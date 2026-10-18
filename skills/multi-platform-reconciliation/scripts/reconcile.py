#!/usr/bin/env python3
"""多平台对账 —— 幂等执行脚本（skill: multi-platform-reconciliation）。

用法：
    python scripts/reconcile.py --input data.json --output result.json --run-key 2026-10-16

约定：
- 同一 run-key 不重复执行（幂等）；
- 只读输入，产出的写动作需人工确认后由对应 MCP 执行；
- 数据缺失写入 dataGaps，禁止估算填充。

输入契约（JSON）：
- orders：订单侧数据，元素含 orderId / amount
- settlements（或 bills）：平台结算单，元素含 orderId / net（结算净额）
- payments：收款流水，元素含 orderId / received（实收金额）、可选 refund（退款金额）
- fee_rules：可选，含 commission_rate（佣金率，缺省 0）

输出契约：
{ "diffs": [{ "orderId", "type", "amount", "basis", "sources" }], "summary": { "total" }, "dataGaps": [] }
差异类型枚举：underpaid（少收款）/ overcharged（多扣佣）/ missing（漏单）/ refund_unsynced（退款未同步）
"""
import argparse
import hashlib
import json
import os
import sys

DIFF_TYPES = ("underpaid", "overcharged", "missing", "refund_unsynced")


def run_key_digest(run_key: str, payload: dict) -> str:
    raw = run_key + json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def _num(v):
    """安全取数：缺省/非数值按缺失处理（返回 None），禁止以 0 估算填充。"""
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return float(v)
    return None


def _index(rows, key="orderId"):
    """按订单号索引；重复条目合并金额并返回重复订单号列表。"""
    out = {}
    dupes = []
    for r in rows or []:
        if not isinstance(r, dict):
            continue
        oid = r.get(key)
        if oid is None:
            continue
        if oid in out:
            dupes.append(oid)
            # 同键多条：金额类字段累加（收款场景），其余保留首条
            for f in ("received", "refund"):
                if isinstance(r.get(f), (int, float)):
                    out[oid][f] = (out[oid].get(f) or 0) + r[f]
        else:
            out[oid] = dict(r)
    return out, dupes


def reconcile(orders, settlements, payments, fee_rules):
    """以订单号为主键三方对齐，逐笔核对金额；返回 (diffs, summary, dataGaps)。"""
    diffs = []
    data_gaps = []

    order_by_id, order_dupes = _index(orders)
    bill_by_id, bill_dupes = _index(settlements)
    pay_by_id, pay_dupes = _index(payments)
    for label, dupes in (("orders", order_dupes), ("settlements", bill_dupes), ("payments", pay_dupes)):
        for oid in dupes:
            data_gaps.append(f"{label} 中订单 {oid} 存在重复记录，已按金额累加处理，建议人工核对")

    rate = _num((fee_rules or {}).get("commission_rate")) or 0.0

    all_ids = sorted(set(order_by_id) | set(bill_by_id) | set(pay_by_id))
    for oid in all_ids:
        o = order_by_id.get(oid)
        b = bill_by_id.get(oid)
        p = pay_by_id.get(oid)
        sources = []
        if o:
            sources.append("orders")
        if b:
            sources.append("settlements")
        if p:
            sources.append("payments")

        # 漏单：订单一侧有、结算单缺失（或反之）
        if (o and not b) or (b and not o):
            side = "settlements" if (o and not b) else "orders"
            amt = _num((o or b).get("amount")) or _num((o or b).get("net"))
            if amt is None:
                data_gaps.append(f"订单 {oid} 缺少可核对金额，无法判定漏单")
                continue
            diffs.append({
                "orderId": oid,
                "type": "missing",
                "amount": round(amt, 2),
                "basis": f"订单侧存在而 {side} 缺失（或反之），金额 {amt:g} 未对齐",
                "sources": sources,
            })
            continue

        amount = _num(o.get("amount"))
        if amount is None:
            data_gaps.append(f"订单 {oid} 金额缺失或非数值，跳过核对")
            continue

        # 少收款：实收 < 应收
        received = _num(p.get("received")) if p else None
        if p and received is None:
            data_gaps.append(f"订单 {oid} 实收金额缺失，无法判定少收款")
        elif received is not None and received < amount:
            diffs.append({
                "orderId": oid,
                "type": "underpaid",
                "amount": round(amount - received, 2),
                "basis": f"应收 {amount:g} - 实收 {received:g} = {amount - received:g}",
                "sources": sources,
            })

        # 多扣佣：结算净额 < 应收 - 佣金（佣金按 fee_rules.commission_rate 计算；规则缺失时记 dataGaps 不做猜测）
        net = _num(b.get("net")) if b else None
        if b and net is None:
            data_gaps.append(f"订单 {oid} 结算净额缺失，无法判定多扣佣")
        elif net is not None:
            if not fee_rules or _num(fee_rules.get("commission_rate")) is None:
                data_gaps.append(f"订单 {oid} 缺少 fee_rules.commission_rate，佣金口径待确认，未判定多扣佣")
            else:
                expected_net = amount * (1 - rate)
                if net < expected_net - 1e-9:
                    diffs.append({
                        "orderId": oid,
                        "type": "overcharged",
                        "amount": round(expected_net - net, 2),
                        "basis": f"应结 {expected_net:g}（应收 {amount:g} × (1 - 佣金率 {rate:g})）- 实结 {net:g} = {expected_net - net:g}",
                        "sources": sources,
                    })

        # 退款未同步：收款侧有退款但结算净额未扣减
        refund = _num(p.get("refund")) if p else None
        if p and refund and refund > 0 and net is not None:
            expected_net_after_refund = amount * (1 - rate) - refund
            if net > expected_net_after_refund + 1e-9:
                diffs.append({
                    "orderId": oid,
                    "type": "refund_unsynced",
                    "amount": round(net - expected_net_after_refund, 2),
                    "basis": f"收款侧退款 {refund:g} 未同步至结算：实结 {net:g} vs 应结 {expected_net_after_refund:g}，差 {net - expected_net_after_refund:g}",
                    "sources": sources,
                })

    by_type = {}
    for d in diffs:
        by_type[d["type"]] = by_type.get(d["type"], 0) + 1
    summary = {
        "total": round(sum(d["amount"] for d in diffs), 2),
        "count": len(diffs),
        "byType": by_type,
    }
    return diffs, summary, data_gaps


def main() -> int:
    ap = argparse.ArgumentParser(description="多平台对账")
    ap.add_argument("--input", required=True, help="输入 JSON 文件路径")
    ap.add_argument("--output", required=True, help="输出 JSON 文件路径")
    ap.add_argument("--run-key", required=True, help="幂等键，如日期或 日期:任务名")
    ap.add_argument("--state-dir", default=".state", help="幂等状态目录")
    args = ap.parse_args()

    with open(args.input, encoding="utf-8") as f:
        payload = json.load(f)

    os.makedirs(args.state_dir, exist_ok=True)
    digest = run_key_digest(args.run_key, payload)
    state_file = os.path.join(args.state_dir, f"{args.run_key.replace(':', '_')}_{digest}.json")
    if os.path.exists(state_file):
        print(f"[skip] 该 run-key 已执行过：{args.run_key}")
        with open(state_file, encoding="utf-8") as f:
            json.dump(json.load(f), sys.stdout, ensure_ascii=False, indent=2)
        return 0

    orders = payload.get("orders") or []
    settlements = payload.get("settlements") or payload.get("bills") or []
    payments = payload.get("payments") or []
    fee_rules = payload.get("fee_rules") or {}

    diffs, summary, data_gaps = reconcile(orders, settlements, payments, fee_rules)

    warnings = []
    if not orders:
        warnings.append("orders 为空：无订单可核对")
    if not settlements:
        warnings.append("settlements/bills 为空：结算单缺失，差异结论仅覆盖订单与收款两侧")
    if not payments:
        warnings.append("payments 为空：收款流水缺失，无法判定少收款与退款同步")

    result = {
        "ok": True,
        "runKey": args.run_key,
        "inputKeys": sorted(payload.keys()),
        "diffs": diffs,
        "summary": summary,
        "dataGaps": data_gaps,
        "warnings": warnings,
    }

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"[done] 结果已写入 {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
