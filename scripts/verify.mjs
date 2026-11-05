import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

await mkdir(new URL('../evidence/', import.meta.url), { recursive: true });
const root = fileURLToPath(new URL('../', import.meta.url));
const base = process.env.VERIFY_URL || 'http://localhost:5173';
const results = [];
function passed(name) { results.push({ check: name, passed: true }); }
const health = await fetch(base + '/api/health');
assert.equal(health.status, 200);
assert.equal((await health.json()).mode, 'local-preview');
passed('Local server responds');
const page = await fetch(base);
assert.equal(page.status, 200);
assert.match(await page.text(), /Dexter Acres/);
passed('Main document and project title');
for (const file of ['residence.webp', 'community.webp', 'logo-light.png', 'general-sans.ttf', 'portfolio-dexter.webp', 'portfolio-lee.webp', 'portfolio-prospect.webp', 'portfolio-1914-entry.webp', 'portfolio-prospect-interior.webp', 'portfolio-lee-bath.webp', 'residence-film.mp4']) {
  const response = await fetch(base + '/assets/' + file, { method: 'HEAD' });
  assert.equal(response.status, 200, file);
  assert.ok(!response.headers.get('content-type')?.includes('text/html'), file);
}
passed('All key local image/font/video assets respond with media types');
const invalid = [
  { name: 'Missing consent rejected', input: { name: 'QA', email: 'qa@example.invalid', consent: false } },
  { name: 'Invalid email rejected', input: { name: 'QA', email: 'invalid', consent: true } },
  { name: 'Out-of-range lot rejected', input: { name: 'QA', email: 'qa@example.invalid', consent: true, lot: 15 } },
];
for (const test of invalid) {
  const response = await fetch(base + '/api/interest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(test.input) });
  assert.equal(response.status, 400, test.name);
  passed(test.name);
}
const crossOrigin = await fetch(base + '/api/interest', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://unrelated.invalid' }, body: JSON.stringify({ name: 'QA', email: 'qa@example.invalid', consent: true }) });
assert.equal(crossOrigin.status, 403);
passed('Cross-origin submissions rejected');
const privateFile = await fetch(base + '/.data/interest.jsonl');
assert.ok([403,404].includes(privateFile.status), 'Private enquiry records must not be served');
passed('Private enquiry records blocked from static serving');
const jsx = await readFile(resolve(root, 'src/components/SitePlan.jsx'), 'utf8');
const lotIds = [...jsx.matchAll(/\{ id: (\d+), area:/g)].map(match => Number(match[1]));
assert.deepEqual(lotIds, Array.from({ length: 14 }, (_, index) => index + 1));
passed('Fourteen unique source-plan lots');
const file = resolve(root, '.data/interest.jsonl');
try {
  const lines = (await readFile(file, 'utf8')).split('\n').filter(Boolean);
  const uiTest = lines.map(line => JSON.parse(line)).find(record => record.email === 'preview-qa-20261105@example.invalid' && record.name === 'Preview QA' && record.source === 'localhost-preview');
  if (uiTest) {
    assert.equal(uiTest.lot, 3);
    assert.equal(uiTest.consent, true);
    passed('Browser form saved its selected lot and explicit consent');
    const kept = lines.filter(line => JSON.parse(line).id !== uiTest.id);
    await writeFile(file, kept.length ? kept.join('\n') + '\n' : '', 'utf8');
    passed('Only the synthetic browser QA record was removed');
  }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const assets = await readdir(resolve(root, 'public/assets'));
assert.ok(assets.length >= 12);
const summary = { testedAt: new Date().toISOString(), url: base, passed: results.length, results };
await writeFile(resolve(root, 'evidence/api-verification.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
