#!/usr/bin/env node
// 统一断言算子库（21 个）。每个算子签名：(actual, expected, ctx) => { pass, message }
// ctx = { path, root, get(path) }，供 crossField / noZeroFill 等跨字段算子使用。

export function getPath(root, path) {
  if (path === "$" || path === "") return root;
  let cur = root;
  for (const rawSeg of path.split(".")) {
    if (cur === null || cur === undefined) return undefined;
    // 段内可带一个或多个下标：name[0]、name[0][1]、name[]（通配全部元素）
    const m = rawSeg.match(/^([^[\]]+)((?:\[[^\]]*\])+)$/);
    if (m) {
      const key = m[1];
      cur = cur[key];
      if (cur === undefined || cur === null) return undefined;
      const idxs = [...m[2].matchAll(/\[([^\]]*)\]/g)].map((x) => x[1]);
      for (const idx of idxs) {
        if (idx === "") {
          // name[] 通配：返回全部元素数组，交由调用方处理
          if (!Array.isArray(cur)) return undefined;
          continue;
        }
        if (!Array.isArray(cur)) return undefined;
        cur = cur[Number(idx)];
      }
      continue;
    }
    if (rawSeg.endsWith("[]")) {
      const key = rawSeg.slice(0, -2);
      cur = cur[key];
      if (!Array.isArray(cur)) return undefined;
      continue;
    }
    cur = cur[rawSeg];
  }
  return cur;
}

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function fmt(v) {
  try {
    const s = JSON.stringify(v);
    return s && s.length > 120 ? s.slice(0, 117) + "..." : s;
  } catch {
    return String(v);
  }
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null || typeof a !== "object") return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export const OPERATORS = {
  eq: (a, e) => ({ pass: deepEqual(a, e), message: `期望等于 ${fmt(e)}，实际 ${fmt(a)}` }),
  neq: (a, e) => ({ pass: !deepEqual(a, e), message: `期望不等于 ${fmt(e)}，实际 ${fmt(a)}` }),
  in: (a, e) => ({ pass: Array.isArray(e) && e.includes(a), message: `期望取值属于 ${fmt(e)}，实际 ${fmt(a)}` }),
  notIn: (a, e) => ({ pass: Array.isArray(e) && !e.includes(a), message: `期望取值不属于 ${fmt(e)}，实际 ${fmt(a)}` }),
  oneOf: (a, e) => ({ pass: Array.isArray(e) && e.includes(a), message: `期望为枚举 ${fmt(e)} 之一，实际 ${fmt(a)}` }),
  lt: (a, e) => ({ pass: typeof a === "number" && a < e, message: `期望 < ${e}，实际 ${fmt(a)}` }),
  lte: (a, e) => ({ pass: typeof a === "number" && a <= e, message: `期望 <= ${e}，实际 ${fmt(a)}` }),
  gt: (a, e) => ({ pass: typeof a === "number" && a > e, message: `期望 > ${e}，实际 ${fmt(a)}` }),
  gte: (a, e) => ({ pass: typeof a === "number" && a >= e, message: `期望 >= ${e}，实际 ${fmt(a)}` }),
  type: (a, e) => ({ pass: typeOf(a) === e, message: `期望类型 ${e}，实际 ${typeOf(a)}（${fmt(a)}）` }),
  exists: (a) => ({ pass: a !== undefined && a !== null, message: `期望字段存在，实际 ${fmt(a)}` }),
  notExists: (a) => ({ pass: a === undefined || a === null, message: `期望字段不存在，实际 ${fmt(a)}` }),
  minLength: (a, e) => ({ pass: a != null && a.length >= e, message: `期望长度 >= ${e}，实际 ${a == null ? "null" : a.length}` }),
  notEmpty: (a) => {
    const len = typeof a === "string" || Array.isArray(a) ? a.length : a && typeof a === "object" ? Object.keys(a).length : 0;
    return { pass: len > 0, message: `期望非空，实际长度 ${len}` };
  },
  regex: (a, e) => ({ pass: typeof a === "string" && new RegExp(e).test(a), message: `期望匹配 /${e}/，实际 ${fmt(a)}` }),
  sumApprox: (a, e) => {
    const arr = Array.isArray(a) ? a : [];
    // expected.field 存在时按对象数组的该字段提取数值；否则直接对数组数值元素求和
    const vals = e && e.field !== undefined ? arr.map((x) => (x && typeof x === "object" ? x[e.field] : undefined)) : arr;
    const sum = vals.reduce((s, x) => s + (typeof x === "number" ? x : 0), 0);
    const ok = Math.abs(sum - e.target) <= (e.tolerance ?? 0);
    return { pass: ok, message: `期望合计 ≈ ${e.target}±${e.tolerance ?? 0}，实际合计 ${sum}` };
  },
  sumEq: (a, e) => {
    const arr = Array.isArray(a) ? a : [];
    const sum = arr.reduce((s, x) => s + (typeof x === "number" ? x : 0), 0);
    return { pass: sum === e, message: `期望合计 = ${e}，实际合计 ${sum}` };
  },
  crossField: (a, e, ctx) => {
    // e = { path, relation, value | pathB, tolerance }
    const b = e.pathB !== undefined ? ctx.get(e.pathB) : e.value;
    const rel = e.relation ?? "eq";
    let ok = false;
    let detail = "";
    const tol = e.tolerance ?? 0;
    if (typeof a === "number" && typeof b === "number") {
      if (rel === "eq") ok = Math.abs(a - b) <= tol;
      else if (rel === "neq") ok = Math.abs(a - b) > tol;
      else if (rel === "lt") ok = a < b - tol;
      else if (rel === "lte") ok = a <= b + tol;
      else if (rel === "gt") ok = a > b + tol;
      else if (rel === "gte") ok = a >= b - tol;
      detail = `${fmt(a)} ${rel} ${fmt(b)}（容差 ${tol}）`;
    } else {
      if (rel === "eq") ok = a === b;
      else if (rel === "neq") ok = a !== b;
      detail = `${fmt(a)} ${rel} ${fmt(b)}`;
    }
    return { pass: ok, message: `跨字段断言 ${e.path ?? "?"} ${detail}` };
  },
  noZeroFill: (a, e, ctx) => {
    // e = { field }：a 为对象数组，不得全部字段都恰为 0（零填充检测）
    const arr = Array.isArray(a) ? a : [];
    const field = e.field;
    if (arr.length === 0) return { pass: true, message: "空数组，跳过零填充检测" };
    const allZero = arr.every((x) => x && typeof x === "object" && x[field] === 0);
    const missing = arr.filter((x) => !(x && typeof x === "object" && field in x)).length;
    return {
      pass: !allZero && missing === 0,
      message: allZero ? `字段 ${field} 全部为 0，疑似零填充` : missing > 0 ? `${missing}/${arr.length} 条缺少字段 ${field}` : "字段非全零且有值",
    };
  },
  parseable: (a) => {
    if (typeof a !== "string") return { pass: false, message: "期望字符串，实际非字符串" };
    try {
      JSON.parse(a);
      return { pass: true, message: "可解析为 JSON" };
    } catch (err) {
      return { pass: false, message: `JSON 解析失败：${err.message}` };
    }
  },
  enumClosed: (a, e, ctx) => {
    // e = { path, values }：校验契约枚举闭合（路径值必须落在 values 内）
    const actual = e.path !== undefined ? ctx.get(e.path) : a;
    const ok = e.values.includes(actual);
    return { pass: ok, message: `期望 ${e.path ?? "?"} 落在枚举 ${fmt(e.values)}，实际 ${fmt(actual)}` };
  },
  stable: () => ({ pass: true, message: "stable 由 runner 跨轮次比对处理，单轮恒真" }),
};

// 执行单条断言：{ op, path?, expected?, message? }
export function runAssertion(assertion, root) {
  const { op, path } = assertion;
  const fn = OPERATORS[op];
  if (!fn) return { pass: false, message: `未知断言算子 ${op}` };
  const ctx = { path, root, get: (p) => getPath(root, p) };
  let actual;
  try {
    actual = path !== undefined ? getPath(root, path) : root;
  } catch (e) {
    return { pass: false, message: `取路径 ${path} 失败：${e.message}` };
  }
  try {
    const r = fn(actual, assertion.expected, ctx);
    return { pass: !!r.pass, message: assertion.message ? `${assertion.message}｜${r.message}` : r.message };
  } catch (e) {
    return { pass: false, message: `断言执行异常：${e.message}` };
  }
}

export function runAssertions(assertions, root) {
  return (assertions ?? []).map((a) => {
    const r = runAssertion(a, root);
    return { op: a.op, path: a.path, pass: r.pass, message: r.message };
  });
}
