import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const forbidden = /(^|\/)(node_modules|dist|evidence|private-data|exports|backups|\.data)(\/|$)|(^|\/)\.env(?!\.example$)|\.(pem|key|p12|pfx|sqlite\w*|db|sql|xlsx|csv|jsonl)$/i;
assert.ok(!files.some(file => forbidden.test(file)), 'Tracked file violates repository data policy');
assert.ok(!files.some(file => /Tony Dashboard|Sprucewood|os_data\.json/i.test(file)), 'Private snapshot was added');
const tpl = JSON.parse(await readFile('apps/development-os/launch-template.json', 'utf8'));
assert.ok(Object.values(tpl.intakeFields).every(value => value === ''), 'Template intake must remain blank');
const spec = JSON.stringify(tpl);
assert.ok(!/https?:\/\/|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(spec), 'Reusable template contains an identity/source URL');
const launch = await readFile('apps/development-os/launch.html', 'utf8');
assert.deepEqual(JSON.parse(launch.match(/id="template-data"[^>]*>([\s\S]*?)<\/script>/)[1]), tpl, 'Embedded and standalone template differ');
const built = [];
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) await walk(path); else built.push(path);
  }
}
await walk('dist');
for (const file of built) {
  assert.ok(!/development-os|launch-template|Tony Dashboard|private-data|\.env/.test(relative('dist', file)), 'OS/private file in website artifact');
  if (/\.(html|js|json)$/.test(file)) assert.ok(!(await readFile(file, 'utf8')).includes('Grama New Project Launch Template'), 'OS specification embedded in public build');
}
assert.ok(built.some(file => relative('dist', file) === 'index.html'));
console.log(`Repository data policy passed for ${files.length} tracked files; public website artifact checked (${built.length} files).`);
