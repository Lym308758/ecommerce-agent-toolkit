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
  if (declared[k] !== byAvail[k]) problems.push(`counts.${k} ${declared[k]} != 实际 ${byAvail[k]}`);
}

// 安全分级字段完整性
for (const c of caps) {
  if (!/^L[1-4]$/.test(c.safety || '')) problems.push(`${c.id} 缺少合法的 safety 分级（L1-L4）`);
  if (!c.ledger) problems.push(`${c.id} 缺少 ledger 台账状态`);
  if (!c.source) problems.push(`${c.id} 缺少 source 来源说明`);
}

// 目录统计（仅提示，不阻断）
const actualDirs = {
  mcp: existsSync(join(ROOT, 'mcp')) ? readdirSync(join(ROOT, 'mcp')).filter(f => statSync(join(ROOT, 'mcp', f)).isDirectory()).length : 0,
  skills: existsSync(join(ROOT, 'skills')) ? readdirSync(join(ROOT, 'skills')).filter(f => statSync(join(ROOT, 'skills', f)).isDirectory()).length : 0,
  adapters: existsSync(join(ROOT, 'adapters')) ? readdirSync(join(ROOT, 'adapters')).filter(f => statSync(join(ROOT, 'adapters', f)).isDirectory()).length : 0,
};

console.log('能力台账校验');
console.log('  总能力项：', caps.length, '| 已有', byAvail.ok, '现成可接', byAvail.ready, '需建设', byAvail.build);
console.log('  映射分布：', JSON.stringify(seen));
console.log('  实际目录：', JSON.stringify(actualDirs));

if (problems.length) {
  console.error('\n✗ 发现 ' + problems.length + ' 个问题：');
  for (const p of problems) console.error('   - ' + p);
  process.exit(1);
}
console.log('\n✓ 全部通过：目录结构与 capability-bank.json 一致，分级与来源字段完整。');
