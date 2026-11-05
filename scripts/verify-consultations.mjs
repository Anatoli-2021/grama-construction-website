import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
await mkdir(new URL('../evidence/', import.meta.url), { recursive: true });
const base = process.env.VERIFY_URL || 'http://localhost:5173';
const checks = [];
const valid = { name: 'Preview QA', email: 'preview-v3-validation@example.invalid', path: 'home', interest: 'Dexter Acres', consent: true };
for (const [name, patch] of [
  ['Unsupported consultation path', { path: 'unrelated' }],
  ['Topic must belong to selected path', { path: 'development', interest: 'Custom home' }],
  ['Lot cannot be attached to a partnership', { path: 'development', interest: 'Investment partnership', lot: 4 }],
  ['Details length is bounded', { details: 'x'.repeat(2001) }],
  ['Location length is bounded', { location: 'x'.repeat(201) }],
  ['Timeframe uses declared choices', { timing: 'Tomorrow guaranteed' }],
]) {
  const response = await fetch(base + '/api/interest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...valid, ...patch }) });
  assert.equal(response.status, 400, name);
  checks.push({ name, passed: true });
}
const file = new URL('../.data/interest.jsonl', import.meta.url);
let lines = [];
try { lines = (await readFile(file, 'utf8')).split('\n').filter(Boolean); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const qa = lines.map(line => JSON.parse(line)).filter(record => ['preview-v3-home@example.invalid', 'preview-v3-partner@example.invalid'].includes(record.email) && record.name === 'Preview QA' && record.source === 'localhost-preview');
for (const record of qa) {
  assert.equal(record.consent, true);
  if (record.email === 'preview-v3-home@example.invalid') {
    assert.equal(record.path, 'home'); assert.equal(record.interest, 'Dexter Acres'); assert.equal(record.lot, 4); assert.equal(record.timing, '6–12 months');
  } else {
    assert.equal(record.path, 'development'); assert.equal(record.interest, 'Investment partnership'); assert.equal(record.lot, null); assert.equal(record.location, 'Des Plaines'); assert.equal(record.details, 'Synthetic local website verification only.');
  }
  checks.push({ name: 'Browser ' + record.path + ' enquiry retained its qualifiers and consent', passed: true });
}
if (process.argv.includes('--require-browser')) assert.equal(qa.length, 2, 'Both browser consultation flows must have been submitted');
if (qa.length) {
  const ids = new Set(qa.map(record => record.id));
  const kept = lines.filter(line => !ids.has(JSON.parse(line).id));
  await writeFile(file, kept.length ? kept.join('\n') + '\n' : '', 'utf8');
  checks.push({ name: 'Removed only the two identified synthetic browser records', passed: true });
}
const result = { checkedAt: new Date().toISOString(), url: base, browserRecordsVerified: qa.length, checks };
await writeFile(new URL('../evidence/consultation-verification-v3.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
