// Browser checks for the design-system refinement: navigation, phone menu,
// portfolio filters, galleries, the fourteen-lot plan, enquiry context and
// reduced motion. No dependencies: Node 22+ and a local Chrome (headless).
// Usage: start the built site (node scripts/serve-website.mjs), then
//   node scripts/verify-design-system.mjs [http://127.0.0.1:5174]
// Nothing is submitted: the enquiry form is inspected, never sent.
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { siteRoutes } from '../src/site-routes.js';

const base = (process.argv[2] || 'http://127.0.0.1:5174').replace(/\/$/, '');
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9300 + Math.floor(Math.random() * 500);
const profile = await mkdtemp(join(tmpdir(), 'grama-verify-'));
const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  [' + detail + ']' : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 1. Every public route answers with its own heading; private and source paths do not.
for (const route of siteRoutes) {
  const response = await fetch(base + route.path); const html = await response.text();
  if (response.status !== 200 || !/<h1[\s>]/.test(html)) check('route ' + route.path, false, 'status ' + response.status);
}
check(siteRoutes.length + ' public routes return 200 with an h1', true);
for (const path of ['/no-such-page', '/src/App.jsx', '/apps/development-os/', '/.env', '/package.json']) {
  const response = await fetch(base + path); check('blocked or missing path returns 404: ' + path, response.status === 404, 'status ' + response.status);
}

const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
let target;
for (let i = 0; i < 60 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch { await sleep(250); } }
if (!target) { proc.kill(); throw new Error('Chrome did not start. Set CHROME_PATH.'); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pending = new Map(), waiters = [], errors = [];
ws.onmessage = ev => { const m = JSON.parse(ev.data);
  if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); return; }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 200));
  if (m.method === 'Page.loadEventFired') waiters.splice(0).forEach(f => f()); };
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
const js = async expression => { const r = await send('Runtime.evaluate', { expression: `(async () => { ${expression} })()`, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
const loaded = () => new Promise(res => waiters.push(res));
const open = async path => { const l = loaded(); await send('Page.navigate', { url: base + path }); await l; await js('await document.fonts.ready;'); await sleep(500); };
const size = (w, h, mobile = false) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
const reduced = on => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: on ? 'reduce' : 'no-preference' }] });
const key = async name => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: name, code: name, windowsVirtualKeyCode: name === 'Escape' ? 27 : name === 'ArrowRight' ? 39 : 0 }); await sleep(250); };
await send('Page.enable'); await send('Runtime.enable');

// 2. Homepage, desktop.
await size(1440, 900); await reduced(false); await open('/');
let v = await js(`const q = s => [...document.querySelectorAll(s)]; const block = document.querySelector('.home-hero .ds-titleblock');
  return { sub: document.querySelector('.home-hero-copy p').textContent, cells: q('.home-hero .ds-titleblock > div').length, links: q('.home-hero .ds-titleblock a').map(a => a.getAttribute('href')),
    fold: Math.round(block.getBoundingClientRect().bottom) <= innerHeight, featured: q('.home-project > a').map(a => a.getAttribute('href')),
    watermark: q('.home-page img').some(i => /sedgwick|avondale\\.webp/.test(i.src)), record: q('.home-development-record > div').length, status: document.querySelector('.home-development-record').textContent.includes('Proposed development'),
    concept: document.querySelector('.home-development-image span').textContent, partners: q('.home-page .trusted-partner img').length, portraits: q('.family-section img').map(i => i.getAttribute('src').split('/').pop()),
    experience: document.querySelector('.home-construction a').getAttribute('href'), h1: q('h1').length, title: document.title };`);
check('home: positioning line', v.sub === 'Premium custom homes and residential development.', v.sub);
check('home: page title uses the company name', v.title.startsWith('Grama Development'), v.title);
check('home: hero title block has three cells and two destinations', v.cells === 3 && v.links.join() === '/projects,/projects/dexter-acres', v.links.join(' '));
check('home: hero title block is inside the first screen at 1440 x 900', v.fold);
check('home: selected work shows three authorized, unwatermarked photographs', v.featured.join() === '/projects/1171-prospect-lane,/projects/1906-lee-street,/projects/1847-dexter-lane' && !v.watermark, v.featured.join(' '));
check('home: Dexter Acres record has four cells and says proposed', v.record === 4 && v.status);
check('home: concept image keeps its label', /concept/i.test(v.concept), v.concept);
check('home: eleven partner marks and both family portraits remain', v.partners === 11 && v.portraits.length === 2, v.partners + ' logos; ' + v.portraits.join(', '));
check('home: Animated Experience entry point unchanged', v.experience === '/animated-experience');
check('home: one h1', v.h1 === 1);

// 3. Homepage, phone: hero destinations and the menu.
await size(390, 844, true); await open('/');
v = await js(`const links = [...document.querySelectorAll('.home-hero .ds-titleblock a')].filter(a => a.getClientRects().length);
  return { n: links.length, heights: links.map(a => Math.round(a.getBoundingClientRect().height)), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };`);
check('phone: hero shows two destinations with 44px targets', v.n === 2 && v.heights.every(h => h >= 44), v.heights.join(', ') + 'px');
check('phone: no horizontal overflow on the homepage', v.overflow <= 0, v.overflow + 'px');
v = await js(`const cols = sel => new Set([...document.querySelectorAll(sel + ' > div')].map(d => Math.round(d.getBoundingClientRect().left))).size; return cols('.home-development-record');`);
check('phone: homepage Dexter Acres record reads as one column', v === 1, v + ' column(s)');
await js(`document.querySelector('.menu-button').click();`); await sleep(350);
v = await js(`const nav = document.querySelector('.main-nav'), phone = nav.querySelector('.nav-phone'), r = phone.getBoundingClientRect();
  return { open: nav.classList.contains('is-open'), items: [...nav.querySelectorAll('a')].filter(a => a.getClientRects().length).map(a => a.getAttribute('href')), tel: phone.getAttribute('href'), visible: r.height >= 44 && r.bottom <= innerHeight, locked: document.body.style.overflow, inert: document.querySelector('main').inert };`);
check('phone menu: opens with six destinations and a direct phone line', v.open && v.items.length === 7 && v.tel === 'tel:+17738499634' && v.visible, v.items.join(' '));
check('phone menu: page behind is locked and inert', v.locked === 'hidden' && v.inert === true);
await key('Escape');
v = await js(`return { open: document.querySelector('.main-nav').classList.contains('is-open'), focus: document.activeElement.className };`);
check('phone menu: Escape closes it and returns focus to the button', !v.open && v.focus.includes('menu-button'), v.focus);

// 4. Portfolio filters.
await size(1440, 900); await open('/projects');
const counts = {};
for (const [index, label] of ['all', 'completed', 'upcoming', 'current'].entries()) {
  counts[label] = await js(`document.querySelectorAll('.projects-page-filters button')[${index}].click(); await new Promise(r => setTimeout(r, 200));
    return { cards: document.querySelectorAll('.projects-page-card').length, empty: !!document.querySelector('.projects-page-empty'), pressed: document.querySelectorAll('.projects-page-filters button')[${index}].getAttribute('aria-pressed') };`);
}
check('portfolio: filters give 9 / 8 / 1 projects and an honest empty current-listings view', counts.all.cards === 9 && counts.completed.cards === 8 && counts.upcoming.cards === 1 && counts.current.cards === 0 && counts.current.empty && counts.current.pressed === 'true', JSON.stringify(Object.fromEntries(Object.entries(counts).map(([k, c]) => [k, c.cards]))));

// 5. Case page gallery.
await open('/projects/1171-prospect-lane');
await js(`document.querySelector('.project-case-hero button').click();`); await sleep(400);
v = await js(`const d = document.querySelector('dialog'); return { open: !!d?.open, img: d?.querySelector('img')?.getAttribute('src'), count: d?.querySelector('[role=status]')?.textContent };`);
const firstImage = v.img;
check('case page: photograph opens in the gallery dialog', v.open && /portfolio-prospect/.test(v.img || ''), (v.img || '') + ' ' + (v.count || ''));
await key('ArrowRight');
v = await js(`const d = document.querySelector('dialog'); return { img: d?.querySelector('img')?.getAttribute('src'), count: d?.querySelector('[role=status]')?.textContent };`);
check('case page: arrow key moves to the next photograph', v.img !== firstImage && /^02/.test(v.count || ''), v.count);
await key('Escape');
check('case page: Escape closes the gallery', await js(`return !document.querySelector('dialog[open]');`));

// 6. Dexter Acres: record, cinematic sequence, lot plan and enquiry context.
await open('/projects/dexter-acres');
v = await js(`const q = s => [...document.querySelectorAll(s)];
  return { cells: q('.page-masthead .ds-titleblock > div').length, text: document.querySelector('.page-masthead .ds-titleblock').textContent, chapters: q('.cinema .cinema__chapter-button').length, lots: q('.siteplan__lot').length,
    cards: q('.ds-enquiry a').map(a => a.getAttribute('href')), h1: q('h1').length };`);
check('Dexter Acres: project record shows location, scope, drawing-reported lot areas and proposed status', v.cells === 4 && v.text.includes('8,435 to 13,701 sq ft') && v.text.includes('Proposed development') && v.text.includes('14 planned homes'));
check('Dexter Acres: original cinematic sequence and fourteen-lot plan are present', v.chapters === 3 && v.lots === 14, v.chapters + ' chapters, ' + v.lots + ' lots');
check('Dexter Acres: enquiry cards carry allowed context only', v.cards.join(' ') === '/contact?path=home&topic=Dexter+Acres /contact?path=development&topic=Investment+partnership tel:+17738499634', v.cards.join(' '));
v = await js(`document.querySelectorAll('.siteplan__lot')[6].dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 250));
  return { lot: document.querySelector('.lot-number strong').textContent, area: document.querySelector('.lot-panel dd').textContent, pressed: document.querySelectorAll('.siteplan__lot')[6].getAttribute('aria-pressed') };`);
check('lot plan: selecting lot 7 updates the lot record', v.lot === '07' && v.area.includes('9,552') && v.pressed === 'true', v.lot + ' ' + v.area);
const navigated = loaded();
await js(`document.querySelector('.lot-panel .button').click();`); await navigated; await sleep(600);
v = await js(`return { url: location.pathname + location.search, lot: document.querySelector('select[name=lot]')?.value, interest: document.querySelector('select[name=interest]')?.value, tab: document.querySelector('#consultation-tab-home')?.getAttribute('aria-selected') };`);
check('lot plan: "Enquire about this lot" opens Contact with the lot in context', v.url === '/contact?path=home&topic=Dexter+Acres&lot=7' && v.lot === '7' && v.interest === 'Dexter Acres' && v.tab === 'true', v.url);

// 7. Contact from a partnership card; the form is not submitted.
await open('/contact?path=development&topic=Investment+partnership');
v = await js(`return { interest: document.querySelector('select[name=interest]')?.value, tab: document.querySelector('#consultation-tab-development')?.getAttribute('aria-selected'), phone: !!document.querySelector('.consultation-direct a[href="tel:+17738499634"]') };`);
check('contact: partnership context is preselected and the phone line is offered', v.interest === 'Investment partnership' && v.tab === 'true' && v.phone, v.interest);

// 8. Reduced motion.
await reduced(true); await open('/');
v = await js(`const r = document.querySelector('.reveal'); return { motion: document.querySelector('.experience').dataset.motion, opacity: r ? getComputedStyle(r).opacity : '1', hero: getComputedStyle(document.querySelector('.hero-visual')).transform };`);
check('reduced motion: homepage renders without scroll animation', v.motion === 'off' && v.opacity === '1', 'data-motion ' + v.motion);
await open('/projects/dexter-acres');
check('reduced motion: Dexter Acres offers "Enable motion" and keeps the plan', await js(`return /Enable motion/.test(document.querySelector('.page-masthead-actions').textContent) && document.querySelectorAll('.siteplan__lot').length === 14;`));
await open('/animated-experience');
v = await js(`return { h1: document.querySelectorAll('h1').length, nav: document.querySelectorAll('.site-header .main-nav a').length, height: document.documentElement.scrollHeight };`);
check('Animated Experience: page loads under reduced motion (owner checks cover the animation itself)', v.h1 === 1, 'document height ' + v.height + 'px');
await reduced(false);

check('no console errors or uncaught exceptions during the run', errors.length === 0, [...new Set(errors)].join(' | '));
ws.close(); proc.kill(); await sleep(400); await rm(profile, { recursive: true, force: true }).catch(() => {});
const failed = results.filter(ok => !ok).length;
console.log(`\n${results.length - failed} of ${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
