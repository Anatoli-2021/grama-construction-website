import assert from 'node:assert/strict';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
await mkdir(new URL('../evidence/', import.meta.url), { recursive: true });
const url = process.env.VERIFY_URL || 'http://localhost:5174';
const page = await fetch(url);
assert.equal(page.status, 200);
assert.equal(await page.text(), await readFile(new URL('../dist/index.html', import.meta.url), 'utf8'));
const files = (await readdir(new URL('../dist/assets/', import.meta.url))).filter(file => /\.(css|js)$/.test(file));
for (const file of files) {
  const response = await fetch(url + '/assets/' + file);
  assert.equal(response.status, 200);
  assert.ok(!(response.headers.get('content-type') || '').includes('text/html'));
}
assert.equal((await fetch(url + '/assets/residence-film.mp4', { method: 'HEAD' })).headers.get('content-type'), 'video/mp4');
assert.equal((await fetch(url + '/.data/interest.jsonl')).status, 403);
const result = { testedAt: new Date().toISOString(), url, passed: true, checks: ['Built document served unchanged', 'Production JavaScript and CSS served', 'Optimized concept video served as video/mp4', 'Private enquiry records denied'] };
await writeFile(new URL('../evidence/production-verification.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
