#!/usr/bin/env node
/**
 * 校验仓库与 capability-bank.json 的一致性。
 * 规则：capability-bank.json 是唯一权威数据源，目录结构必须覆盖其中每一项能力。
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const bank = JSON.parse(readFileSync(join(ROOT, 'capability-bank.json'), 'utf8'));
const caps = bank.capabilities;

const problems = [];
const seen = { builtin: 0, mcp: 0, skills: 0, adapters: 0 };

function expectFile(rel) {
  if (!existsSync(join(ROOT, rel))) problems.push(`缺少文件：${rel}`);
}

// 某项能力的实物是否齐全（与上面的 expectFile 同一套清单，但不重复报问题）
function requiredFiles(c) {
  const [kind] = c.artifact.split('/');
  if (kind === 'builtin') return [];
  if (kind === 'adapters') return [join(c.artifact, 'README.md')];
  if (kind === 'skills') return [join(c.artifact, 'SKILL.md')];
  if (kind === 'mcp') {
    return ['package.json', join('src', 'index.ts'), join('src', 'tools.ts'), join('src', 'client.ts'), '.env.example', 'README.md']
      .map((f) => join(c.artifact, f));
  }
  return [];
}

function artifactComplete(c) {
  return requiredFiles(c).every((f) => existsSync(join(ROOT, f)));
}

for (const c of caps) {
  const [kind, ...rest] = c.artifact.split('/');
  seen[kind]++;
  if (kind === 'builtin') continue;                       // 平台内置，无目录要求
  const dir = c.artifact;
  if (kind === 'adapters') expectFile(join(dir, 'README.md'));
  if (kind === 'skills') expectFile(join(dir, 'SKILL.md'));
  if (kind === 'mcp') {
    expectFile(join(dir, 'package.json'));
    expectFile(join(dir, 'src', 'index.ts'));
    expectFile(join(dir, 'src', 'tools.ts'));
    expectFile(join(dir, 'src', 'client.ts'));
    expectFile(join(dir, '.env.example'));
    expectFile(join(dir, 'README.md'));
  }
}

// 计数一致性
const declared = bank.counts;
if (declared.total !== caps.length) problems.push(`counts.total ${declared.total} != 实际 ${caps.length}`);
const byAvail = caps.reduce((a, c) => ((a[c.availability] = (a[c.availability] || 0) + 1), a), {});
for (const k of ['ok', 'ready', 'build']) {
  // 归零的类别在 byAvail 中不存在（undefined），需按 0 比较
  if ((declared[k] || 0) !== (byAvail[k] || 0)) problems.push(`counts.${k} ${declared[k]} != 实际 ${byAvail[k] || 0}`);
}
const availOf = (k) => byAvail[k] || 0;

// 安全分级字段完整性
for (const c of caps) {
  if (!/^L[1-4]$/.test(c.safety || '')) problems.push(`${c.id} 缺少合法的 safety 分级（L1-L4）`);
  if (!c.ledger) problems.push(`${c.id} 缺少 ledger 台账状态`);
  if (!c.source) problems.push(`${c.id} 缺少 source 来源说明`);
}

// 台账状态与实物的一致性（防「注册 ≠ 可用」再次失真，见 docs/governance.md 第 3 节）
const byLedger = {};
for (const c of caps) {
  byLedger[c.ledger] = (byLedger[c.ledger] || 0) + 1;
  const stale = c.ledger === 'planned' || c.availability === 'build';
  if (stale && artifactComplete(c)) {
    problems.push(`${c.id} 台账滞后：标记 ${c.ledger}/${c.availability}，但 ${c.artifact} 产物已齐全——应校正为 connected/ok`);
  }
  if (c.ledger === 'connected' && !artifactComplete(c)) {
    problems.push(`${c.id} 台账超前：标记 connected，但 ${c.artifact} 产物缺失`);
  }
  if (c.ledger === 'verified' && !c.evidence) {
    problems.push(`${c.id} 标记 verified 但缺 evidence（须记录验证环境、日期与证据）`);
  }
}

// 目录统计（仅提示，不阻断）
const actualDirs = {
  mcp: existsSync(join(ROOT, 'mcp')) ? readdirSync(join(ROOT, 'mcp')).filter(f => statSync(join(ROOT, 'mcp', f)).isDirectory()).length : 0,
  skills: existsSync(join(ROOT, 'skills')) ? readdirSync(join(ROOT, 'skills')).filter(f => statSync(join(ROOT, 'skills', f)).isDirectory()).length : 0,
  adapters: existsSync(join(ROOT, 'adapters')) ? readdirSync(join(ROOT, 'adapters')).filter(f => statSync(join(ROOT, 'adapters', f)).isDirectory()).length : 0,
};

console.log('能力台账校验');
console.log('  总能力项：', caps.length, '| 已有', availOf('ok'), '现成可接', availOf('ready'), '需建设', availOf('build'));
console.log('  映射分布：', JSON.stringify(seen));
console.log('  实际目录：', JSON.stringify(actualDirs));
console.log('  台账状态：', JSON.stringify(byLedger), '（verified 须带 evidence）');

if (problems.length) {
  console.error('\n✗ 发现 ' + problems.length + ' 个问题：');
  for (const p of problems) console.error('   - ' + p);
  process.exit(1);
}
console.log('\n✓ 全部通过：目录结构与 capability-bank.json 一致，分级与来源字段完整。');
