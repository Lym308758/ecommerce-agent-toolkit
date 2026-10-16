#!/usr/bin/env node
/** 扫描是否误提交真实凭证。CI 与本地提交前都应执行。 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', 'dist', 'coverage']);
const EXT = new Set(['.ts', '.mjs', '.js', '.json', '.md', '.yml', '.yaml', '.env.example', '']);

const PATTERNS = [
  { name: 'OpenAI Key', re: /sk-[A-Za-z0-9]{20,}/ },
  { name: 'AWS Access Key', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'Slack Token', re: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'Shopify Admin Token', re: /shp(at|ca|pa)_[A-Fa-f0-9]{16,}/ },
  { name: 'GitHub PAT', re: /gh[pousr]_[A-Za-z0-9]{30,}/ },
  { name: '私钥', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: '硬编码赋值', re: /(password|passwd|secret|access_token|app_secret)\s*[:=]\s*["'](?!<|\$\{|your-|x{3}|placeholder)[^"'$]{8,}["']/i },
  { name: '长十六进制串', re: /\b[A-Fa-f0-9]{40,}\b/ },
];

const findings = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!EXT.has(extname(p)) && name !== '.env.example') continue;
    let text;
    try { text = readFileSync(p, 'utf8'); } catch { continue; }
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      for (const pat of PATTERNS) {
        if (pat.re.test(line)) {
          findings.push(`${p.replace(ROOT + '\\', '')}:${i + 1}  [${pat.name}]  ${line.trim().slice(0, 80)}`);
        }
      }
    });
  }
}
walk(ROOT);

if (findings.length) {
  console.error(`✗ 疑似凭证泄漏 ${findings.length} 处：`);
  findings.forEach(f => console.error('   - ' + f));
  console.error('\n请改用 .env（已在 .gitignore 中）或占位符，切勿提交真实密钥。');
  process.exit(1);
}
console.log('✓ 未发现疑似凭证。');
