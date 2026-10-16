#!/usr/bin/env python3
"""{cn} —— 幂等执行脚本（skill: {slug}）。

用法：
    python scripts/reconcile.py --input data.json --output result.json --run-key 2026-10-16

约定：
- 同一 run-key 不重复执行（幂等）；
- 只读输入，产出的写动作需人工确认后由对应 MCP 执行；
- 数据缺失写入 dataGaps，禁止估算填充。
"""
import argparse
import hashlib
import json
import os
import sys


def run_key_digest(run_key: str, payload: dict) -> str:
    raw = run_key + json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


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

    # TODO: 按 SKILL.md 的工作流实现具体计算逻辑，此处仅做骨架与字段校验
    result = {
        "ok": True,
        "runKey": args.run_key,
        "inputKeys": sorted(payload.keys()),
        "items": [],
        "warnings": ["骨架实现：请按 SKILL.md 的工作流补全计算逻辑"],
        "dataGaps": [],
    }

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"[done] 结果已写入 {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
