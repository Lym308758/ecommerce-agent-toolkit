#!/usr/bin/env node
// 结果记录器：tests/report/results.jsonl 追加写；一条 = 一次用例执行。
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function createRecorder(reportDir, { fresh = true, name = "results.jsonl" } = {}) {
  mkdirSync(reportDir, { recursive: true });
  const file = join(reportDir, name);
  if (fresh) writeFileSync(file, "");
  return {
    file,
    record(rec) {
      const line = JSON.stringify({ ts: new Date().toISOString(), ...rec });
      appendFileSync(file, line + "\n");
      return rec;
    },
  };
}
