// Browser check for the workspace prototype. No dependencies: Node 22+ (built-in WebSocket) and a local Chrome.
// Usage: node tools/browser-check.mjs [path/to/index.html] [screenshot-dir]
// Chrome is started headless with a throwaway profile; nothing touches a real browser profile. Set CHROME_PATH if Chrome is elsewhere.
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const page = resolve(process.argv[2] || join(here, '..', 'index.html'));
const shots = process.argv[3] ? resolve(process.argv[3]) : null;
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9300 + Math.floor(Math.random() * 500);
const profile = await mkdtemp(join(tmpdir(), 'studio-check-'));
if (shots) await mkdir(shots, { recursive: true });

const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--window-size=1360,900', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch { await sleep(250); } }
if (!target) { proc.kill(); throw new Error('Chrome did not start. Set CHROME_PATH.'); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pending = new Map(), errors = [], waiters = [];
ws.onmessage = ev => { const m = JSON.parse(ev.data);
  if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); return; }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
  if (m.method === 'Page.loadEventFired') waiters.splice(0).forEach(f => f()); };
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
const loaded = () => new Promise(res => waiters.push(res));
const run = async expression => { const r = await send('Runtime.evaluate', { expression: `(async () => { ${expression} })()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
let opened = false; // a second visit to the same file is a reload: a hash-only navigation fires no load event
const open = async (hash = '') => { if (opened) await run('location.hash = ' + JSON.stringify(hash) + ';'); const l = loaded();
  if (opened) await send('Page.reload'); else await send('Page.navigate', { url: pathToFileURL(page).href + hash }); opened = true; await l; await sleep(350); };
const size = (w, h, mobile) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
const shot = async name => { if (!shots) return; const r = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(join(shots, name + '.png'), Buffer.from(r.data, 'base64')); };

const results = []; let failed = 0;
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); if (!ok) failed++; };
const SUBMIT = `const submit = id => document.querySelector('#' + id).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); const set = (id, v) => { document.querySelector('#' + id).value = v; };`;

try {
  await send('Page.enable'); await send('Runtime.enable'); await size(1360, 900, false);

  // 1. first load: made-up sample only, storage available
  await open('#daily');
  let r = await run(`const p = P(); return { projects: state.projects.length, sample: p.sample === true, addr: p.address, waiting: waiting(p), approved: approved(p).length, blockers: blockers(p).length,
    budget: outRows(p, 'budget').filter(x => x[5] !== '').reduce((t, x) => t + x[5], 0), budgetRows: outRows(p, 'budget').length, checklist: p.checklist.length, late: deadlines().filter(d => d.late).length,
    stored: persistent && Files.ok(), kpis: [...document.querySelectorAll('.kpi .val')].map(e => e.textContent.trim()) };`);
  check('opens with one made-up sample project', r.projects === 1 && r.sample, r.addr);
  check('browser storage is available', r.stored === true);
  check('sample counts are consistent', r.waiting === 3 && r.approved === 3 && r.blockers === 4 && r.checklist === 27, JSON.stringify({ waiting: r.waiting, approved: r.approved, blockers: r.blockers, checklist: r.checklist }));
  check('budget counts known amounts only', r.budget === 4200 && r.budgetRows === 3, `$${r.budget} from 1 of ${r.budgetRows} lines`);
  check('daily workspace shows decisions, tasks and a past date', r.kpis[0] === '3' && r.kpis[1] === '3' && r.late >= 1, r.kpis.join(' | '));
  await shot('01-daily-workspace-desktop');

  // 2. approval, revision and option rules
  r = await run(`${SUBMIT} const p = P(); state.view = 'studio'; p.step = 3; render();
    const ct = p.selections.find(s => s.name === 'Quartz countertop'); document.querySelector('[data-act=next][data-id="' + ct.id + '"]').click();
    const cab = P().selections.find(s => s.name === 'Base and wall cabinets'); document.querySelector('[data-act=edit][data-id="' + cab.id + '"]').click();
    const warned = !!document.querySelector('#selform .empty'); set('s_spec', 'Flat panel, walnut'); submit('selform');
    const b = P().options.find(o => o.status === 'Draft'); document.querySelector('[data-act=opt-review][data-id="' + b.id + '"]').click();
    document.querySelector('[data-act=opt-approve][data-id="' + b.id + '"]').click(); const approvedOpt = P().options.find(o => o.id === b.id).status;
    document.querySelector('[data-act=opt-revise][data-id="' + b.id + '"]').click(); const o2 = P().options.find(o => o.id === b.id);
    const c2 = P().selections.find(s => s.id === cab.id);
    return { ct: P().selections.find(s => s.id === ct.id).status, warned, rev: c2.rev, status: c2.status, hist: c2.history.length, old: c2.history[0].spec, takeoff: outRows(P(), 'takeoff').length,
      approvedOpt, optRev: o2.rev, optStatus: o2.status, optHist: o2.history.length };`);
  check('approving a selection moves it into the outputs', r.ct === 'Approved' && r.takeoff === 3, `${r.takeoff} takeoff lines after one approval and one re-opened item`);
  check('editing an approved selection keeps the old revision and asks for approval again', r.warned && r.rev === 2 && r.status === 'Selected' && r.hist === 1 && r.old === 'Shaker, painted, soft-close');
  check('design option: review → approve → new revision', r.approvedOpt === 'Approved' && r.optRev === 2 && r.optStatus === 'Draft' && r.optHist === 1);
  await run('scrollTo(0, 0);'); await sleep(150);
  await shot('02-design-studio-step3-design-desktop');

  // 3. files keep revisions; text is escaped
  r = await run(`${SUBMIT} P().step = 2; render();
    const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='), c => c.charCodeAt(0));
    await addFiles([new File([png], 'plan.png', { type: 'image/png' })]); await addFiles([new File([png], 'plan.png', { type: 'image/png' })]);
    P().step = 3; render(); set('s_name', '<b>Test</b> item'); submit('selform');
    const rows = [...document.querySelectorAll('#view .row .t')];
    return { revs: P().files.map(f => f.rev), fid: P().files[0].id, escaped: !document.querySelector('#view .row .t b') && rows.some(e => e.textContent.includes('<b>Test</b>')), csv: csv([['a,b', 'c"d']]) };`);
  const fid = r.fid;
  check('a file added twice becomes revisions R1 and R2', r.revs.join() === '1,2');
  check('typed text is shown as text, not as HTML', r.escaped === true);
  check('CSV quoting', r.csv === '"a,b","c""d"');

  // 4. new project intake and daily tasks
  r = await run(`${SUBMIT} const out = {}; state.view = 'new'; render(); submit('newdev'); out.emptyRejected = state.projects.length === 1;
    set('n_addr', '1200 sample lane'); submit('newdev'); out.duplicateRejected = state.projects.length === 1;
    state.view = 'new'; render(); set('n_addr', '  77 Test Court  '); set('n_type', 'Development — subdivision'); submit('newdev'); out.sub = { addr: P().address, checklist: P().checklist.length, view: state.view, owner: P().team.every(t => t.name === '') };
    state.view = 'new'; render(); set('n_addr', '9 Demo Road'); set('n_type', 'Construction or renovation'); submit('newdev'); out.reno = P().checklist.length;
    state.view = 'daily'; render(); set('t_text', 'Call about the vanity'); set('t_kind', 'Client request'); submit('newtask'); out.tasks = state.tasks.filter(k => !k.done).length;
    document.querySelector('[data-act=task-done]').click(); out.afterDone = state.tasks.filter(k => !k.done).length;
    const j = JSON.parse(taskJson(state.projects[0])); out.draft = j.tasks.every(t => t.status === 'Draft' && t.responsible === null && t.dueDate === null); out.projects = state.projects.length; return out;`);
  check('intake rejects an empty address and a duplicate address', r.emptyRejected && r.duplicateRejected);
  check('subdivision gets 29 checklist items, no one assigned', r.sub.checklist === 29 && r.sub.owner && r.sub.addr === '77 Test Court' && r.sub.view === 'studio');
  check('construction or renovation gets no development checklist', r.reno === 0);
  check('tasks can be added and completed', r.tasks === 4 && r.afterDone === 3);
  check('exported tasks are Draft with no owner and no date', r.draft === true);

  // 4b. a Higgsfield design becomes a project rendering and can be attached to an option
  r = await run(`state.current = 'sample'; const p = P(), o = p.options.find(x => x.status !== 'Approved');
    const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='), c => c.charCodeAt(0)), f = () => [new File([png], 'kitchen-option.png', { type: 'image/png' })];
    const bad = await importHiggsfield({ projectId: p.id, areaId: p.areas[0].id, files: f(), link: 'https://example.com/x' });
    const none = await importHiggsfield({ projectId: p.id, areaId: p.areas[0].id, files: [] });
    const ok = await importHiggsfield({ projectId: p.id, areaId: p.areas[0].id, optionId: o.id, files: f(), link: 'https://higgsfield.ai/share/abc', prompt: 'warm modern kitchen' });
    const added = p.files.filter(x => x.source === 'Higgsfield'); state.view = 'higgsfield'; render();
    return { bad, none, ok, n: added.length, cat: added[0] && added[0].cat, attached: o.fileIds.includes(added[0] && added[0].id), listed: document.querySelectorAll('#view .files .file').length };`);
  check('Higgsfield import: rejects a non-Higgsfield link and an empty import', !!r.bad && !!r.none);
  check('Higgsfield import: saved as a Rendering marked Higgsfield and attached to the option', r.ok === '' && r.n === 1 && r.cat === 'Rendering' && r.attached && r.listed === 1);
  await shot('08-higgsfield-designs-desktop');

  // 5. persistence across a reload
  await open('#daily');
  r = await run(`return { projects: state.projects.length, tasks: state.tasks.length, file: !!(await Files.get(${JSON.stringify(fid)})), rev: P().selections.concat(state.projects[0].selections).find(s => s.name === 'Base and wall cabinets').rev };`);
  check('records are still there after a reload', r.projects === 3 && r.tasks === 4 && r.rev === 2, `${r.projects} projects, ${r.tasks} tasks`);
  check('an uploaded file is still there after a reload', r.file === true);

  // 6. every view at desktop and phone width: no sideways scroll, no script errors
  const views = ['#daily', '#new', '#higgsfield', ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => '#studio-' + n)];
  for (const [label, w, h, mobile] of [['desktop', 1360, 900, false], ['phone', 390, 844, true]]) {
    await size(w, h, mobile); const wide = [];
    for (const v of views) { await run(`state.current = 'sample'; const m = ${JSON.stringify(v)}.match(/studio-(\\d)/); if (m) { state.view = 'studio'; P().step = +m[1]; } else state.view = ${JSON.stringify(v)}.slice(1); render(); scrollTo(0, 0);`);
      await sleep(120); if (await run(`return document.documentElement.scrollWidth > innerWidth + 1;`)) wide.push(v);
      if (label === 'desktop' && v === '#studio-4') await shot('03-design-studio-step4-review-desktop');
      if (label === 'desktop' && v === '#studio-7') await shot('04-design-studio-step7-work-package-desktop');
      if (label === 'desktop' && v === '#new') await shot('05-new-development-project-desktop');
      if (label === 'phone' && v === '#daily') await shot('06-daily-workspace-phone');
      if (label === 'phone' && v === '#studio-3') await shot('07-design-studio-phone'); }
    check(`no sideways scroll in any of ${views.length} views at ${label} width`, wide.length === 0, wide.join(' '));
  }
  check('no script errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (e) { check('run completed', false, e.message); }
finally { try { await send('Browser.close'); } catch {} proc.kill(); await sleep(400); await rm(profile, { recursive: true, force: true }).catch(() => {}); }

console.log(results.join('\n')); console.log(`\n${results.length - failed} of ${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
