import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { buildLaunch } from '../src/launch.mjs';

const dir = new URL('../studio/', import.meta.url);
const js = fs.readFileSync(new URL('studio.js', dir), 'utf8');
const html = fs.readFileSync(new URL('index.html', dir), 'utf8');
const css = fs.readFileSync(new URL('studio.css', dir), 'utf8');
const template = JSON.parse(fs.readFileSync(new URL('../launch-template.json', import.meta.url)));

// Execute only this reviewed repository script. vm is not a security sandbox.
// Real DOM/layout, browser CSP enforcement and IndexedDB durability are separate gates.
async function fixture(savedState) {
  const elements = new Map(), handlers = new Map(), downloads = [], blobs = new Map();
  const saved = new Map(savedState ? [['dev-os-design-studio-v1', JSON.stringify(savedState)]] : []);
  const element = id => {
    if (!elements.has(id)) elements.set(id, { id: id.replace(/^#/, ''), value: '', textContent: '', innerHTML: '', hidden: false, files: [],
      classList: { add() {}, remove() {}, toggle() {} }, focus() {}, setSelectionRange() {}, scrollIntoView() {}, addEventListener() {} });
    return elements.get(id);
  };
  class TestURL extends URL {
    static createObjectURL(blob) { const id = 'blob:synthetic-' + blobs.size; blobs.set(id, blob); return id; }
    static revokeObjectURL() {}
  }
  const context = vm.createContext({ console, URL: TestURL, URLSearchParams, Blob, File, setTimeout() {},
    location: { search: '', hash: '' }, history: { replaceState() {} }, scrollTo() {},
    window: { open() { throw Error('Uploaded sources must not open as executable same-origin documents'); } },
    navigator: { clipboard: { async writeText() {} } }, matchMedia() { return { matches: false }; }, confirm() { return false; },
    localStorage: { getItem: k => saved.get(k) || null, setItem: (k, v) => saved.set(k, v) },
    indexedDB: { open() { throw Error('Synthetic memory fallback; persistence not tested'); } },
    document: { querySelector: element, querySelectorAll() { return []; }, documentElement: { dataset: {} },
      addEventListener(type, fn) { if (!handlers.has(type)) handlers.set(type, []); handlers.get(type).push(fn); },
      createElement() { return { click() { downloads.push({ name: this.download, blob: blobs.get(this.href) }); }, remove() {} }; }, body: { appendChild() {} } }
  });
  const run = source => vm.runInContext(source, context, { timeout: 2000 });
  await run(js);
  return { run, element, downloads, saved,
    state: () => JSON.parse(run('JSON.stringify(state)')),
    fill(fields) { for (const [id, value] of Object.entries(fields)) element('#' + id).value = String(value); },
    submit(id) { for (const fn of handlers.get('submit') || []) fn({ preventDefault() {}, target: { id } }); },
    async click(act, data = {}) { for (const fn of handlers.get('click') || []) await fn({ target: { closest() { return { dataset: { act, ...data } }; } } }); }
  };
}
async function kitchen() {
  const f = await fixture();
  f.fill({ n_addr: 'DEMO custom kitchen remodel', n_id: 'DEMO-KITCHEN-QA', n_type: 'Construction or renovation', n_client: '', n_src: 'Synthetic drawing QA', n_desc: 'Fictional inputs only' });
  f.submit('newdev');
  f.element('#f_cat').value = 'Drawing';
  await f.run('addFiles([new File(["SYNTHETIC drawing, not for construction"],"DEMO-source.txt",{type:"text/plain"})])');
  f.fill({ s_name: 'DEMO cabinets', s_cat: 'Cabinets', s_vendor: 'DEMO supplier', s_spec: 'Synthetic shaker cabinets', s_qty: 2, s_unit: 'EA', s_cost: 100, s_code: 'DEMO-6400', s_need: '', s_conf: '', s_src: f.run('P().files[0].id'), s_after: '' });
  f.submit('selform');
  return f;
}
async function approve(f, id = f.run('P().selections[0].id')) { await f.click('next', { id }); await f.click('next', { id }); }

test('Studio uses external assets and contains no inline executable/style dependencies', () => {
  assert.match(html, /<script src="\.\/studio\.js" defer><\/script>/);
  assert.match(html, /href="\.\/studio\.css"/);
  assert.doesNotMatch(html + js, /<style\b|<script(?:\s*>|\s+[^>]*>[^<]+)|\sstyle\s*=|\son(?:click|load|error)\s*=/i);
  assert.match(html, /script-src 'self'; style-src 'self'/);
  assert.doesNotMatch(html, /unsafe-inline|unsafe-eval|https?:\/\//);
  for (const match of (html + js).matchAll(/data-layout="([^"]+)"/g)) assert.ok(css.includes('[data-layout="' + match[1] + '"]'));
});
test('DEP-02 direct renovation starts with real unapproved budget, contract and release gates', async () => {
  const f = await kitchen(); await approve(f);
  const p = f.state().projects.find(p => p.id === 'DEMO-KITCHEN-QA');
  assert.equal(p.checklist.length, 3);
  assert.ok(['T16', 'T17', 'T19'].every(key => p.checklist.some(c => c.id === p.id + '-' + key && c.status === 'Not started' && c.evidence === '')));
  const pack = JSON.parse(f.run('taskJson(P())'));
  assert.ok(pack.tasks[0].dependsOn.every(id => p.checklist.some(c => c.id === id)));
  assert.equal(pack.tasks[0].releaseStatus, 'Not released');
  assert.equal(pack.tasks[0].status, 'Draft');
  assert.equal(pack.tasks[0].responsible, null); assert.equal(pack.tasks[0].dueDate, null);
});
test('complete synthetic kitchen logic: design → demo approval → budget → draft package → Dashboard', async () => {
  const f = await kitchen();
  assert.equal(f.run('outRows(P(),"budget").length'), 0);
  await f.click('next', { id: f.run('P().selections[0].id') });
  assert.equal(f.run('outRows(P(),"budget").length'), 0);
  await f.click('next', { id: f.run('P().selections[0].id') });
  assert.equal(f.run('outRows(P(),"budget")[0][5]'), 200);
  f.element('#f_cat').value = 'Drawing';
  await f.run('addFiles([new File(["SYNTHETIC drawing only"],"DEMO-kitchen.txt",{type:"text/plain"})])');
  assert.equal(f.run('blockers(P()).length'), 0);
  await f.click('dl', { k: 'tasks' });
  const pack = JSON.parse(await f.downloads[0].blob.text());
  assert.equal(pack.tasks[0].projectId, 'DEMO-KITCHEN-QA');
  assert.equal(pack.tasks[0].selectionRevision, 1);
  assert.match(pack.tasks[0].sourceDocument, /DEMO-KITCHEN-QA-F-01 DEMO-source.txt R1/);
  f.fill({ t_text: 'DEMO review cabinet drawing', t_kind: 'Follow-up', t_proj: 'DEMO-KITCHEN-QA', t_due: '', t_conf: '' }); f.submit('newtask');
  assert.match(f.run('viewDaily()'), /DEMO review cabinet drawing/);
  await f.click('goto', { id: 'DEMO-KITCHEN-QA', n: '5' });
  assert.equal(f.run('state.view'), 'studio'); assert.equal(f.run('P().step'), 5);
  assert.match(f.run('stepPackage(P())'), /Budget \/ purchase \/ work release: not recorded/);
});
test('missing imported or corrupted gates block JSON download and never emit dangling rows', async () => {
  const f = await kitchen(); await approve(f);
  f.run('P().checklist = P().checklist.filter(c=>c.key!=="T19")');
  assert.throws(() => f.run('taskJson(P())'), /export blocked.*DEMO-KITCHEN-QA-T19/);
  assert.equal(f.run('outRows(P(),"tasks").length'), 0);
  assert.match(f.run('stepPackage(P())'), /Export blocked/);
});
test('older renovation state gains only missing draft gates without changing records or approvals', async () => {
  const f = await kitchen(); await approve(f);
  f.run('P().checklist=P().checklist.filter(c=>c.key==="T17"); P().checklist[0].status="Done"; P().checklist[0].evidence="DEMO preexisting evidence"');
  const before = f.state(), oldSelection = JSON.stringify(before.projects.find(p => p.id === 'DEMO-KITCHEN-QA').selections);
  const reopened = await fixture(before), p = reopened.state().projects.find(p => p.id === 'DEMO-KITCHEN-QA');
  assert.equal(JSON.stringify(p.selections), oldSelection);
  assert.equal(p.checklist.find(c => c.key === 'T17').status, 'Done');
  assert.equal(p.checklist.find(c => c.key === 'T17').evidence, 'DEMO preexisting evidence');
  assert.ok(p.checklist.filter(c => c.key !== 'T17').every(c => c.status === 'Not started' && c.evidence === ''));
  assert.equal(new Set(p.checklist.map(c => c.id)).size, 3);
});
test('revision, stable IDs, traceability, unknown amount and formula protections survive externalization', async () => {
  const f = await kitchen(); await approve(f); const id = f.run('P().selections[0].id'), key = f.run('outRows(P(),"tasks")[0][0]');
  await f.click('edit', { id }); f.fill({ s_name: 'DEMO cabinets', s_cost: 125, s_qty: 3 }); f.submit('selform');
  assert.equal(f.run('P().selections[0].rev'), 2); assert.equal(f.run('P().selections[0].history[0].unitCost'), 100);
  assert.equal(f.run('P().selections[0].history[0].costCode'), 'DEMO-6400'); assert.equal(f.run('outRows(P(),"budget").length'), 0);
  await f.click('next', { id });
  f.fill({ s_name: 'DEMO sink', s_cost: '', s_qty: 1 }); f.submit('selform'); await approve(f, f.run('P().selections.at(-1).id'));
  f.run('P().selections.unshift(P().selections.pop())');
  assert.equal(f.run('outRows(P(),"tasks").find(r=>r[1].includes("DEMO cabinets"))[0]'), key);
  assert.equal(f.run('new Set(outRows(P(),"tasks").map(r=>r[4])).size'), 2);
  assert.ok(f.run('outRows(P(),"budget").some(r=>r[5]==="")'));
  for (const kind of ['budget', 'takeoff', 'proposal', 'procurement', 'tasks']) for (const col of ['Project ID', 'Selection ID', 'Revision', 'Source document', 'Approved on']) assert.ok(f.run('OUT[' + JSON.stringify(kind) + '][1].includes(' + JSON.stringify(col) + ')'));
  for (const value of ['=1+1',' +1','-1','@SUM(A1)','\ttext','\rtext']) assert.match(f.run('csvCell(' + JSON.stringify(value) + ')'), /^"?'/);
  assert.equal(f.run('csvCell(-2)'), '-2');
});
test('actual launch JSON retains subdivision identities/dependencies and refuses repeat import', async () => {
  const f = await fixture();
  const draft = buildLaunch(template, { project_id: 'DEMO-IMPORT', opportunity_description: 'Synthetic only', project_type: 'Subdivision', pm_name: 'Demo Reviewer', pm_email: 'reviewer@example.invalid', source_reference: 'Synthetic source' });
  assert.equal(f.run('importLaunch(' + JSON.stringify(draft) + ')'), '');
  const p = f.state().projects.find(p => p.id === 'DEMO-IMPORT'); assert.equal(p.checklist.length, 29);
  for (const row of draft.planRows) assert.ok(p.checklist.some(c => c.id === row['Task ID'] && c.dependsOn === row['Depends On / Gate']));
  const count = f.run('state.projects.length'); assert.notEqual(f.run('importLaunch(' + JSON.stringify(draft) + ')'), ''); assert.equal(f.run('state.projects.length'), count);
});
test('unapproved/missing predecessor and cycles block contractor output', async () => {
  const f = await kitchen(); await approve(f);
  f.run('P().selections[0].after=["DEMO-MISSING"]'); assert.throws(() => f.run('taskJson(P())'), /missing or not approved/);
  f.run('P().selections[0].after=[P().selections[0].id]'); assert.throws(() => f.run('taskJson(P())'), /cycle/);
});
test('active source documents download as octet-stream rather than executing in an app tab', async () => {
  const f = await kitchen(); f.element('#f_cat').value = 'Reference';
  await f.run('addFiles([new File(["<script>never execute</script>"],"DEMO-reference.html",{type:"text/html"})])');
  await f.click('open', { id: f.run('P().files.at(-1).id') });
  assert.equal(f.downloads[0].name, 'DEMO-reference.html'); assert.equal(f.downloads[0].blob.type, 'application/octet-stream');
  assert.equal(await f.downloads[0].blob.text(), '<script>never execute</script>');
});
