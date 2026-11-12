// Unit tests for the Studio record logic. No browser needed: node --test apps/development-os/studio/test/
import test from 'node:test';
import assert from 'node:assert/strict';

await import('../studio-logic.js');
const L = globalThis.StudioLogic;

const selection = (p, over = {}) => { const n = ++p.seq.SEL; const s = Object.assign({ id: `${p.id}-SEL-${L.pad(n)}`, seq: n, areaId: p.areas[0].id, name: 'Demo item ' + n, category: 'Cabinets', spec: 'demo spec', vendor: '', qty: 2, unit: 'EA', unitCost: 100, costCode: 'DEMO-1', leadDays: null, neededBy: '', neededConfirmed: false, after: [], sourceId: '', status: 'Approved', rev: 1, history: [], log: [], approvedOn: L.today() }, over); p.selections.push(s); return s; };

test('the made-up sample is consistent', () => {
  const p = L.sampleState().projects[0];
  assert.equal(p.sample, true);
  assert.equal(L.approved(p).length, 3);
  assert.equal(L.waiting(p), 3);
  assert.equal(L.blockers(p).length, 4);
  assert.equal(p.checklist.length, 27);
});

test('Project ID follows the shared launch rule', () => {
  assert.equal(L.normalizeProjectId(' A-1 '), 'A-1');
  assert.equal(L.normalizeProjectId('GC_2026-014'), 'GC_2026-014');
  for (const bad of ['   ', '-x', 'a'.repeat(81), 'has space']) assert.throws(() => L.normalizeProjectId(bad));
});

test('a construction project carries the gates its tasks depend on', () => {
  const p = L.newProject('1 Demo Way', 'Construction or renovation', { id: 'DEMO-R' });
  const ids = new Set(p.checklist.map(c => c.id));
  assert.ok(ids.has('DEMO-R-T17') && ids.has('DEMO-R-T19'));
  assert.ok(!p.checklist.some(c => c.key === 'T01'));
  selection(p);
  const tasks = JSON.parse(L.taskJson(p)).tasks;
  assert.equal(tasks.length, 1);
  assert.ok(tasks[0].dependsOn.length === 2 && tasks[0].dependsOn.every(d => ids.has(d)));
  assert.equal(tasks[0].releaseStatus, 'Not released');
  assert.equal(tasks[0].status, 'Draft');
  assert.equal(tasks[0].responsible, null);
});

test('a plan with no release-to-build gate cannot export tasks', () => {
  const p = L.newProject('2 Demo Way', 'Construction or renovation', { id: 'DEMO-N' });
  p.checklist = p.checklist.filter(c => c.key !== 'T19');
  const s = selection(p);
  assert.equal(L.canExportTasks(p), false);
  assert.ok(L.blockers(p).some(b => b.includes('release-to-build')));
  assert.ok(!L.taskDeps(p, s).includes('DEMO-N-T19'));
});

test('task keys do not move when another item is inserted first', () => {
  const p = L.newProject('3 Demo Way', 'Development — single home', { id: 'DEMO-K' });
  const a = selection(p), before = L.outRows(p, 'tasks')[0][0];
  p.selections.unshift(Object.assign({}, a, { id: 'DEMO-K-SEL-09', seq: 9, name: 'Inserted' }));
  assert.equal(L.outRows(p, 'tasks').find(r => r[1].includes(a.name))[0], before);
  assert.equal(before, 'DS-01');
});

test('a task that follows another names it as a predecessor', () => {
  const p = L.newProject('4 Demo Way', 'Development — single home', { id: 'DEMO-F' });
  const a = selection(p), b = selection(p, { after: [] }); b.after = [a.id];
  assert.ok(L.taskDeps(p, b).includes('DEMO-F-DS-01'));
  assert.equal(L.follows(p, b.id, a.id), true);
  assert.equal(L.follows(p, a.id, b.id), false);
});

test('every output carries selection, revision and project', () => {
  const p = L.newProject('5 Demo Way', 'Development — single home', { id: 'DEMO-T' }); selection(p);
  for (const k of ['takeoff', 'budget', 'proposal', 'procurement', 'tasks']) {
    const cols = L.OUT[k][1], row = L.outRows(p, k)[0];
    assert.equal(row[cols.indexOf('Selection ID')], 'DEMO-T-SEL-01');
    assert.equal(row[cols.indexOf('Revision')], 'R1');
    assert.equal(row[cols.indexOf('Project ID')], 'DEMO-T');
  }
  assert.equal(L.outRows(p, 'budget')[0][5], 200);
});

test('unknown cost stays blank', () => {
  const p = L.newProject('6 Demo Way', 'Development — single home', { id: 'DEMO-U' }); selection(p, { unitCost: null });
  assert.equal(L.outRows(p, 'budget')[0][5], '');
});

test('a replaced revision keeps cost, code and approval date', () => {
  const p = L.newProject('7 Demo Way', 'Development — single home', { id: 'DEMO-H' }); const s = selection(p);
  const snap = L.snapshot(s);
  assert.equal(snap.unitCost, 100); assert.equal(snap.costCode, 'DEMO-1'); assert.ok(snap.approvedOn); assert.equal(snap.rev, 1);
});

test('CSV neutralises formula-leading text and keeps numbers', () => {
  for (const v of ['=1+1', ' +1', '-1', '@SUM(A1)', '\ttext', '\rtext']) { const c = L.csvCell(v); assert.ok((c.startsWith('"') ? c.slice(1) : c).startsWith("'"), JSON.stringify(v)); }
  assert.equal(L.csvCell(-2), '-2');
  assert.equal(L.csvCell('plain'), 'plain');
  assert.equal(L.csv([['a,b', 'c"d']]), '"a,b","c""d"');
});

test('text is escaped for HTML', () => { assert.equal(L.esc('<img onerror=x>'), '&lt;img onerror=x&gt;'); });
