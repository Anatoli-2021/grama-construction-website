/* ============ constants ============ */
const STATUSES = ["Discussed","Selected","Approved","Ordered","Received","Paid","Installed"];
const FILE_CATS = ["Survey","Drawing","Photo","Reference","Specification","Rendering"];
const SEL_CATS = { // category -> proposed trade (a suggestion, never an assignment)
  "Cabinets":"Cabinet installer","Countertops":"Countertop fabricator","Tile":"Tile setter","Plumbing fixtures":"Plumber",
  "Lighting":"Electrician","Appliances":"Appliance installer","Paint":"Painter","Flooring":"Flooring installer",
  "Windows & doors":"Carpenter","Siding":"Siding installer","Roofing":"Roofer","Landscape":"Landscaper","Other":"To be assigned"
};
const DEFAULT_AREAS = ["Kitchen","Bathrooms","Exterior","Interior finishes","Site & landscape"];
const ROLES = ["Owner / approver","Project lead","Design lead","Estimator","Site lead","Office / admin"];
const FLOW = ["Project","Upload sources","Design","Review & approve","Takeoff & budget","Client proposal","Work package","Construction"];
const PROPOSAL_STATES = ["Not started","Drafted in Wave","Sent to client","Accepted by client"];
const TASK_KINDS = ["Task","Client request","Follow-up"];
// Development checklist: the task list of the existing blank launch template (launch-template.json), grouped for this view.
// [key, group, task, appliesTo, approval gate]
const LAUNCH_TASKS = [
 ["T01","Feasibility","Identify opportunity and check duplicates","All","PM intake approval"],
 ["T04","Feasibility","Test use, yield and program alternatives","All","Investment screening"],
 ["T05","Feasibility","Validate sales or rental basis","All","Market assumptions review"],
 ["T06","Feasibility","Build cost, cash and downside feasibility","All","Go / hold / reject"],
 ["T07","Partners","Agree entity, funding, roles and authority","All","Principal / partner approval"],
 ["T02","Legal documents","Verify title, legal description and acquisition terms","All","Acquisition decision by authorized principal"],
 ["T08","Legal documents","Coordinate and execute required agreements","All","Authorized signature"],
 ["T03","Architecture","Verify survey and site constraints","All","Professional scope approval"],
 ["T09","Architecture","Confirm zoning and entitlement path","All","Agency decisions and principal review"],
 ["S01","Architecture","Define shared infrastructure and lot release gates","Subdivision","Shared infrastructure / phasing approval"],
 ["T10","Architecture","Set design program and drawing control","All","Owner design review; professional responsibility"],
 ["T11","Architecture","Coordinate survey, civil, structural and MEP","All","Professional release for intended use"],
 ["T12","Permits","Track permits and review comments","All","Required agency approvals"],
 ["T13","Permits","Track each utility and offsite requirement","All","Provider / agency release; commitment approval"],
 ["T14","Budgets","Measure quantities and build cost-code estimate","All","Estimator quantity check"],
 ["T15","Budgets","Level bids and reconcile complete scope","All","Quote selection; no purchase implied"],
 ["S02","Budgets","Approve shared-cost allocation and portfolio elimination","Subdivision","Allocation-method approval"],
 ["T16","Budgets","Approve budget, contingency and funding baseline","All","Separate budget approval"],
 ["T22","Budgets","Reconcile incurred costs and cost-to-complete","All","Finance review; no posting or payment implied"],
 ["T23","Budgets","Review cash, funding and payment requests","All","Authorized payment / capital decisions"],
 ["T18","Schedules","Build master schedule and lookahead","All","Schedule baseline approval"],
 ["T19","Schedules","Verify release-to-build readiness","All","Human release-to-build"],
 ["T20","Schedules","Track progress, quality and inspections","All","Professional / agency inspections"],
 ["T21","Schedules","Control RFIs and cost / schedule changes","All","Change approval before commitment"],
 ["T17","Team responsibilities","Authorize contracts and purchase orders","All","Per-commitment authority"],
 ["T24","Closeout","Complete inspections, punch list and turnover","All","Agency / owner acceptance"],
 ["T25","Closeout","Close sale or lease and reconcile distributions","All","Commercial closing / distribution approval"],
 ["T26","Closeout","Assign warranty and security-release obligations","All","Warranty / agency closure"],
 ["T27","Closeout","Archive evidence and reusable cost lessons","All","Final archive verification"]
];
const GROUPS = ["Partners","Legal documents","Feasibility","Architecture","Permits","Budgets","Schedules","Team responsibilities","Closeout","Other"];
const ICON = {
  daily:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  studio:'<path d="M4 17.5L15.5 6l2.5 2.5L6.5 20H4z"/><path d="M13.5 8l2.5 2.5M15 19h5"/>',
  "new":'<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
  higgsfield:'<rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="M4 15.5l4.5-4 4 3.5 3-2.5 4.5 4"/><circle cx="15.5" cy="9.5" r="1.2"/>',
  menu:'<path d="M4 20V10l8-5.5 8 5.5v10"/><path d="M9.5 20v-6h5v6"/>'
};
const AREAS3 = [["daily","Daily Workspace"],["studio","Design Studio"],["new","New Development Project"],["higgsfield","Higgsfield designs"]];
const mark = id => '<svg viewBox="0 0 512 512" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3e44"/><stop offset="1" stop-color="#17181b"/></linearGradient></defs><rect width="512" height="512" rx="116" fill="url(#'+id+')"/><path d="M329.5 182.5A104 104 0 1 0 360 256" fill="none" stroke="#f5f5f7" stroke-width="38" stroke-linecap="round"/><path d="M360 256H266" fill="none" stroke="#c9a36b" stroke-width="38" stroke-linecap="round"/></svg>';

/* ============ storage: records in localStorage, file contents in IndexedDB; both fall back to memory ============ */
const KEY = "dev-os-design-studio-v1";
let persistent = true;
const Files = (() => {
  let db = null; const mem = new Map();
  const open = () => new Promise(res => { try {
      const r = indexedDB.open(KEY, 1);
      r.onupgradeneeded = () => r.result.createObjectStore("files");
      r.onsuccess = () => { db = r.result; res(true); };
      r.onerror = () => res(false);
    } catch (e) { res(false); } });
  const put = (id, blob) => new Promise(res => { mem.set(id, blob); if (!db) return res();
      try { const t = db.transaction("files","readwrite"); t.objectStore("files").put(blob, id); t.oncomplete = () => res(); t.onerror = () => res(); } catch (e) { res(); } });
  const get = id => new Promise(res => { if (mem.has(id)) return res(mem.get(id)); if (!db) return res(null);
      try { const r = db.transaction("files").objectStore("files").get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); } catch (e) { res(null); } });
  const clear = () => new Promise(res => { mem.clear(); if (!db) return res();
      try { const t = db.transaction("files","readwrite"); t.objectStore("files").clear(); t.oncomplete = () => res(); t.onerror = () => res(); } catch (e) { res(); } });
  return { open, put, get, clear, ok: () => !!db };
})();
function loadState(){ try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { persistent = false; return null; } }
function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { persistent = false; } }

/* ============ helpers ============ */
const uid = () => Math.random().toString(36).slice(2, 10);
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = v => { const t = String(v == null ? "" : v).trim(); return t !== "" && isFinite(+t) ? +t : null; };
const money = n => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const today = () => iso(new Date());
const plus = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
const pad = n => String(n).padStart(2, "0");
const toTop = () => { try { scrollTo(0, 0); } catch (e) {} };
// One Project ID for the launch form and this workspace: the same rule as packages/shared/project-id.mjs.
// Every record ID starts with it: <project>-SEL-01 (selection), <project>-OPT-01 (design option), <project>-F-01 (file),
// <project>-DS-01 (contractor task) and <project>-T19 (launch plan task).
const PROJECT_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
function normalizeProjectId(value){ const id = String(value == null ? "" : value).trim(); if (!PROJECT_ID.test(id)) throw new Error("Use a Project ID of 1–80 letters, numbers, hyphens or underscores, starting with a letter or number."); return id; }
function suggestProjectId(address){ const base = String(address).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "PROJECT"; let id = base, n = 2; while (state && state.projects.some(p => p.id === id)) id = base + "-" + n++; return id; }
// A full copy of a selection revision, kept when an approved revision is replaced.
const snapshot = s => ({ rev: s.rev, status: s.status, when: today(), approvedOn: s.approvedOn || "", name: s.name, category: s.category, spec: s.spec, vendor: s.vendor, qty: s.qty, unit: s.unit, unitCost: s.unitCost, costCode: s.costCode, leadDays: s.leadDays, neededBy: s.neededBy, neededConfirmed: s.neededConfirmed, sourceId: s.sourceId || "", after: (s.after || []).slice() });
// Every status change is logged with its time and revision. These are demo actions on one device, not protected approvals.
const logEvent = (x, from, to) => { (x.log = x.log || []).push({ at: new Date().toISOString(), rev: x.rev, from, to }); };
function follows(p, fromId, targetId, seen = new Set()){ if (seen.has(fromId)) return false; seen.add(fromId); const s = p.selections.find(x => x.id === fromId); return !!s && (s.after || []).some(a => a === targetId || follows(p, a, targetId, seen)); }
const RENOVATION_GATES = ["T16", "T17", "T19"];
function checklist(type){
  const tasks = type.startsWith("Development") ? LAUNCH_TASKS.filter(t => t[3] === "All" || type.includes("subdivision")) : LAUNCH_TASKS.filter(t => RENOVATION_GATES.includes(t[0]));
  return tasks.map(t => ({ key: t[0], group: t[1], task: t[2], gate: t[4], status: "Not started", evidence: "" }));
}
function restoreRenovationGates(p){
  if (p.type.startsWith("Development") || p.launch) return;
  for (const c of checklist(p.type)) if (!p.checklist.some(x => x.key === c.key || x.id === p.id + "-" + c.key)) {
    p.checklist.push({ ...c, id: p.id + "-" + c.key, dependsOn: "", addedReason: "Missing draft renovation approval gate; no approval inferred" });
  }
}
function newProject(address, type, extra){
  const areas = DEFAULT_AREAS.map(n => ({ id: uid(), name: n })), id = (extra && extra.id) || suggestProjectId(address);
  return Object.assign({ id, address, type, client: "", source: "", description: "", step: 1, areaId: areas[0].id, areas, files: [], notes: {}, selections: [], options: [], seq: { SEL: 0, OPT: 0, F: 0 },
    team: ROLES.map(r => ({ role: r, name: "" })), checklist: checklist(type).map(c => Object.assign(c, { id: id + "-" + c.key, dependsOn: "" })), proposal: { state: PROPOSAL_STATES[0], waveNo: "" } }, extra || {});
}
function upgrade(s){ // older saved data gains the newer fields; nothing is dropped
  s.version = 3; s.view = ["daily","studio","new","higgsfield"].includes(s.view) ? s.view : "daily"; s.tasks = s.tasks || []; s.filter = s.filter || "All"; s.out = s.out === "budget" ? "budget" : "takeoff";
  for (const p of s.projects) { p.step = p.step || 1; p.options = p.options || []; p.client = p.client || ""; p.team = p.team || ROLES.map(r => ({ role: r, name: "" }));
    p.checklist = p.checklist || []; p.proposal = p.proposal || { state: PROPOSAL_STATES[0], waveNo: "" }; p.seq = p.seq || { SEL: 0, OPT: 0, F: 0 };
    for (const x of p.selections) { if (!x.seq) x.seq = ++p.seq.SEL; x.log = x.log || []; x.after = x.after || []; x.sourceId = x.sourceId || ""; }   // existing IDs are kept as they are
    for (const o of p.options) { if (!o.seq) o.seq = ++p.seq.OPT; o.log = o.log || []; }
    for (const f of p.files) if (!f.fid) f.fid = p.id + "-F-" + pad(++p.seq.F);
    restoreRenovationGates(p);
    for (const c of p.checklist) { c.id = c.id || p.id + "-" + c.key; c.dependsOn = c.dependsOn || ""; } }
  return s;
}
function sampleState(){
  const p = newProject("1200 Sample Lane", "Development — single home", { id: "DEMO-SAMPLE-LANE", sample: true });
  const a = n => p.areas.find(x => x.name === n).id;
  const sel = (area, name, category, status, o = {}) => { const n = ++p.seq.SEL; return Object.assign({ id: p.id + "-SEL-" + pad(n), seq: n, areaId: a(area), name, category, spec: "", vendor: "", qty: null, unit: "", unitCost: null, costCode: "", leadDays: null, neededBy: "", neededConfirmed: false, after: [], sourceId: "", status, rev: 1, history: [], log: [], approvedOn: STATUSES.indexOf(status) >= 2 ? today() : "" }, o); };
  p.selections = [
    sel("Kitchen","Base and wall cabinets","Cabinets","Approved",{ spec: "Shaker, painted, soft-close", vendor: "Sample Cabinet Co.", qty: 24, unit: "LF", costCode: "6400", neededBy: plus(21) }),
    sel("Kitchen","Quartz countertop","Countertops","Selected",{ spec: "3 cm, eased edge", qty: 58, unit: "SF" }),
    sel("Kitchen","36 in range","Appliances","Ordered",{ spec: "Dual fuel, stainless", vendor: "Sample Supply Co.", qty: 1, unit: "EA", unitCost: 4200, costCode: "11300", leadDays: 21, neededBy: plus(30), neededConfirmed: true }),
    sel("Kitchen","Backsplash tile","Tile","Discussed",{ spec: "Handmade-look ceramic, 3x12" }),
    sel("Bathrooms","60 in double vanity","Plumbing fixtures","Selected",{ qty: 1, unit: "EA" }),
    sel("Exterior","Fiber-cement lap siding","Siding","Approved",{ spec: "7 in exposure, factory finish", costCode: "7460" })
  ];
  p.selections[1].after = [p.selections[0].id];   // the countertop follows the cabinets
  const opt = (area, name, desc, status) => { const n = ++p.seq.OPT; return { id: p.id + "-OPT-" + pad(n), seq: n, areaId: a(area), name, desc, fileIds: [], status, rev: 1, history: [], log: [], comment: "" }; };
  p.options = [opt("Kitchen","Option A — island","Island with seating for four; range on the back wall.","In review"), opt("Kitchen","Option B — peninsula","Peninsula toward the dining room; more wall cabinets.","Draft")];
  p.checklist.forEach(c => { if (c.key === "T01") { c.status = "Done"; c.evidence = "Sample intake note"; } if (c.key === "T04") c.status = "In progress"; });
  return { version: 3, view: "daily", current: p.id, out: "takeoff", filter: "All", projects: [p], tasks: [
    { id: uid(), kind: "Client request", text: "Confirm countertop edge profile", projectId: p.id, due: plus(3), confirmed: false, done: false },
    { id: uid(), kind: "Task", text: "Walk the site with the framing lead", projectId: p.id, due: plus(1), confirmed: true, done: false },
    { id: uid(), kind: "Follow-up", text: "Cabinet shop drawings — ask for the revised set", projectId: p.id, due: plus(-1), confirmed: false, done: false }
  ] };
}

/* ============ derived data ============ */
let state = null, ui = { q: "", editing: null, hist: {} };
const thumbs = new Map();
const P = () => state.projects.find(p => p.id === state.current) || state.projects[0];
const proj = id => state.projects.find(p => p.id === id);
const areaName = (p, id) => (p.areas.find(a => a.id === id) || {}).name || "";
const idx = s => STATUSES.indexOf(s.status);
const approved = p => p.selections.filter(s => idx(s) >= 2);
const waiting = p => p.options.filter(o => o.status === "In review").length + p.selections.filter(s => idx(s) === 1).length;
function blockers(p){
  const out = [];
  for (const s of approved(p)) {
    if (s.qty == null) out.push(s.name + ": approved without a quantity");
    if (!s.spec) out.push(s.name + ": approved without a specification or model");
    if (!s.costCode) out.push(s.name + ": no cost code, cannot map to the budget");
  }
  for (const a of p.areas) if (p.selections.some(s => s.areaId === a.id && idx(s) >= 1) && !p.files.some(f => f.areaId === a.id && f.cat === "Drawing")) out.push(a.name + ": selections exist but no drawing is uploaded");
  return out;
}
function deadlines(){ // tasks and selections with a date, across all projects
  const t = today(), list = [];
  for (const k of state.tasks) if (k.due && !k.done) list.push({ date: k.due, what: k.text, where: (proj(k.projectId) || {}).address || "No project", confirmed: k.confirmed, kind: k.kind });
  for (const p of state.projects) for (const s of p.selections) if (s.neededBy && idx(s) < 6) list.push({ date: s.neededBy, what: s.name + " — " + s.status, where: p.address, confirmed: s.neededConfirmed, kind: "Selection" });
  return list.sort((a, b) => a.date.localeCompare(b.date)).map(d => Object.assign(d, { late: d.date < t }));
}

/* ============ shared pieces ============ */
function stepper(s){
  const i = idx(s);
  return `<div class="steps" role="img" aria-label="Status ${esc(s.status)}, step ${i + 1} of 7">${STATUSES.map((_, k) => `<i class="${k <= i ? (i >= 2 ? "ok" : "on") : ""}"></i>`).join("")}</div>
    <div class="steplbl"><span><b>${esc(s.status)}</b></span><span>${i < 6 ? "next: " + STATUSES[i + 1] : "complete"}</span></div>`;
}
function selRow(p, s, o = {}){
  const i = idx(s), meta = [s.category, s.spec, s.vendor].filter(Boolean).map(esc).join(" · ");
  const need = s.neededBy ? `needed ${esc(s.neededBy)} (${s.neededConfirmed ? "confirmed" : "proposed"})` : "no deadline set";
  let act = "";
  if (i === 0) act = `<button class="btn sm sec" data-act="next" data-id="${s.id}">Mark selected</button>`;
  else if (i === 1) act = `<button class="btn sm" data-act="next" data-id="${s.id}">Approve</button>`;
  else if (i < 6 && o.track) act = `<button class="btn sm sec" data-act="next" data-id="${s.id}">Mark ${STATUSES[i + 1].toLowerCase()}</button>`;
  const h = ui.hist[s.id] ? `<div class="hist"><b>Earlier revisions</b><br>${s.history.length ? s.history.map(x => `R${x.rev} · ${esc(x.status)}${x.approvedOn ? " · approved " + esc(x.approvedOn) : ""} · replaced ${esc(x.when)} — ${esc([x.spec, x.vendor, x.qty != null ? x.qty + " " + x.unit : "quantity not set", x.unitCost != null ? "unit cost " + money(x.unitCost) : "unit cost unknown", x.costCode ? "cost code " + x.costCode : "no cost code"].filter(Boolean).join(" · "))}`).join("<br>") : "None."}
    <br><b>Events</b> — demo actions on this device, not protected approvals<br>${(s.log || []).length ? s.log.map(l => `${esc(String(l.at).slice(0, 16).replace("T", " "))} · R${l.rev} · ${esc(l.from)} → ${esc(l.to)}`).join("<br>") : "None recorded."}</div>` : "";
  const fol = (s.after || []).map(a => (p.selections.find(x => x.id === a) || {}).name || a);
  return `<div class="row"><div class="t">${esc(s.name)} <span class="tag">R${s.rev}</span>${o.area ? ` <span class="tag">${esc(areaName(p, s.areaId))}</span>` : ""}</div>
    <div class="d">${meta || "No specification yet"}</div><div class="d">${s.qty != null ? s.qty + " " + esc(s.unit) : "quantity not set"} · ${need}${s.costCode ? " · cost code " + esc(s.costCode) : ""}</div>
    <div class="cap" data-layout="layout-02">${esc(s.id)}${fol.length ? " · follows " + esc(fol.join(", ")) : ""}${srcName(p, s) ? " · source " + esc(srcName(p, s)) : ""}</div>
    ${stepper(s)}<div class="acts">${act}<button class="btn sm sec" data-act="edit" data-id="${s.id}">Edit</button><button class="btn sm sec" data-act="hist" data-id="${s.id}">History (${s.history.length})</button></div>${h}</div>`;
}
function selForm(p){
  const e = ui.editing ? p.selections.find(s => s.id === ui.editing) : null, v = k => e && e[k] != null ? esc(e[k]) : "";
  const warn = e && idx(e) >= 2 ? `<div class="empty full"><b>This selection is ${esc(e.status)}.</b>Saving a change keeps R${e.rev} in its history, creates R${e.rev + 1} and returns it to Selected for your approval.</div>` : "";
  const others = p.selections.filter(s => !e || s.id !== e.id), srcs = p.files.filter(f => f.areaId === p.areaId), msg = ui.msg ? `<div class="empty full">${esc(ui.msg)}</div>` : "";
  return `<form class="form" id="selform">${warn}${msg}
    <label class="full">Item<input class="in" id="s_name" value="${v("name")}" placeholder="e.g. Island pendant lights"></label>
    <label>Category<select class="in" id="s_cat">${Object.keys(SEL_CATS).map(c => `<option${e && e.category === c ? " selected" : ""}>${c}</option>`).join("")}</select></label>
    <label>Vendor<input class="in" id="s_vendor" value="${v("vendor")}"></label>
    <label class="full">Specification or model<input class="in" id="s_spec" value="${v("spec")}"></label>
    <label>Quantity<input class="in" id="s_qty" inputmode="decimal" value="${v("qty")}"></label>
    <label>Unit<input class="in" id="s_unit" value="${v("unit")}" placeholder="EA, SF, LF"></label>
    <label>Unit cost (blank if unknown)<input class="in" id="s_cost" inputmode="decimal" value="${v("unitCost")}"></label>
    <label>Cost code<input class="in" id="s_code" value="${v("costCode")}"></label>
    <label>Needed by<input class="in" id="s_need" type="date" value="${v("neededBy")}"></label>
    <label>Deadline<select class="in" id="s_conf"><option value="">Proposed</option><option value="1"${e && e.neededConfirmed ? " selected" : ""}>Confirmed</option></select></label>
    <label>Must follow (optional)<select class="in" id="s_after"><option value="">Nothing</option>${others.map(s => `<option value="${esc(s.id)}"${e && (e.after || []).includes(s.id) ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label>
    <label>Source document (optional)<select class="in" id="s_src"><option value="">None recorded</option>${srcs.map(f => `<option value="${f.id}"${e && e.sourceId === f.id ? " selected" : ""}>${esc(f.name)} R${f.rev}</option>`).join("")}</select></label>
    <div class="full" data-layout="layout-03"><button class="btn" type="submit">${e ? "Save change" : "Add selection"}</button>${e ? '<button class="btn sec" type="button" data-act="cancel">Cancel</button>' : ""}</div></form>`;
}
const areaBar = p => `<div data-layout="layout-04">
  <div class="segctl" role="tablist">${p.areas.map(x => `<button role="tab" aria-selected="${x.id === p.areaId}" data-act="area" data-id="${x.id}">${esc(x.name)}</button>`).join("")}</div>
  <form id="addarea" data-layout="layout-05"><input class="in" id="a_name" placeholder="Add area" data-layout="layout-06" aria-label="New area name"><button class="btn sm sec" type="submit">Add</button></form></div>`;
function fileGrid(p, areaId){
  const list = p.files.filter(f => f.areaId === areaId);
  if (!list.length) return `<div class="empty" data-layout="layout-07"><b>No files yet</b>Add the survey, drawings, photos, references and specifications for this area.</div>`;
  return `<div class="files">${list.map(f => `<button class="file" data-act="open" data-id="${f.id}" title="Open ${esc(f.name)}"><div class="th" data-thumb="${f.type.startsWith("image/") ? f.id : ""}">${esc(f.cat)}</div><div class="m"><div class="n">${esc(f.name)}</div><div class="cap">${esc(f.cat)} · R${f.rev}${f.source ? " · " + esc(f.source) : ""} · ${Math.max(1, Math.round(f.size / 1024))} KB</div></div></button>`).join("")}</div>`;
}
function optRow(p, o, review){
  const imgs = o.fileIds.map(id => p.files.find(f => f.id === id)).filter(Boolean), pick = p.files.filter(f => f.areaId === o.areaId && !o.fileIds.includes(f.id));
  const cls = o.status === "Approved" ? " ok" : o.status === "Changes requested" ? " warn" : "";
  let act = "";
  if (o.status === "Draft" || o.status === "Changes requested") act = `<button class="btn sm" data-act="opt-review" data-id="${o.id}">Send for review</button>`;
  else if (o.status === "In review") act = `<button class="btn sm" data-act="opt-approve" data-id="${o.id}">Approve</button><button class="btn sm sec" data-act="opt-changes" data-id="${o.id}">Request changes</button>`;
  else act = `<button class="btn sm sec" data-act="opt-revise" data-id="${o.id}">Start revision R${o.rev + 1}</button>`;
  return `<div class="row"><div class="top"><div><div class="t">${esc(o.name)} <span class="tag">R${o.rev}</span>${review ? ` <span class="tag">${esc(areaName(p, o.areaId))}</span>` : ""}</div><div class="d">${esc(o.desc) || "No description"}</div></div><span class="tag${cls}">${esc(o.status)}</span></div>
    ${imgs.length ? `<div class="board">${imgs.map(f => `<div class="th" data-thumb="${f.type.startsWith("image/") ? f.id : ""}" title="${esc(f.name)}">${esc(f.cat)}</div>`).join("")}</div>` : `<div class="cap" data-layout="layout-08">No drawing or image attached yet.</div>`}
    ${o.comment ? `<div class="hist">Review note: ${esc(o.comment)}</div>` : ""}
    ${o.history.length ? `<div class="cap" data-layout="layout-09">Earlier: ${o.history.map(h => `R${h.rev} ${esc(h.status)} (${esc(h.when)})`).join(" · ")}</div>` : ""}
    <div class="acts">${act}${o.status === "In review" ? `<input class="in" data-oc="${o.id}" value="${esc(o.comment)}" placeholder="Review note (optional)" data-layout="layout-10" aria-label="Review note">` : ""}
      ${!review && o.status !== "Approved" && pick.length ? `<select class="in" data-pick="${o.id}" data-layout="layout-11" aria-label="File to attach">${pick.map(f => `<option value="${f.id}">${esc(f.name)}</option>`).join("")}</select><button class="btn sm sec" data-act="opt-attach" data-id="${o.id}">Attach</button>` : ""}</div></div>`;
}
function brief(p, areaId){
  const sels = p.selections.filter(s => s.areaId === areaId), line = s => `- ${s.name}${s.spec ? ": " + s.spec : ""}${s.qty != null ? " (" + s.qty + " " + s.unit + ")" : ""}`;
  const grp = (label, f) => { const l = sels.filter(f); return l.length ? `\n${label}\n${l.map(line).join("\n")}\n` : ""; };
  const files = p.files.filter(f => f.areaId === areaId), opts = p.options.filter(o => o.areaId === areaId);
  return `Design brief — ${areaName(p, areaId)} — ${p.address}\n\nGoal and notes\n${(p.notes[areaId] || "(none written yet)").trim()}\n` +
    (opts.length ? `\nDesign options so far\n${opts.map(o => `- ${o.name} (R${o.rev}, ${o.status})${o.desc ? ": " + o.desc : ""}`).join("\n")}\n` : "") +
    grp("Approved — do not change", s => idx(s) >= 2) + grp("Selected — awaiting approval", s => idx(s) === 1) + grp("Under discussion", s => idx(s) === 0) +
    `\nReference files\n${files.length ? files.map(f => `- ${f.cat}: ${f.name} (R${f.rev}${f.source ? ", from " + f.source : ""})`).join("\n") : "- none uploaded"}\n\nRequest\nPropose up to three options for this area that respect the approved items. List every assumption. Flag anything that conflicts with the drawings. Do not invent dimensions, prices or product availability.`;
}
// Traceability: every output line names its selection, revision, approval date, source document and project.
// A task key comes from the selection's own number, so adding or reordering items never renames an existing task.
const taskKey = s => "DS-" + pad(s.seq || 0);
// Predecessors: the launch plan's contract authority (T17) and release-to-build (T19) tasks, then any selection this one must follow.
const taskDeps = (p, s) => [p.id + "-T16", p.id + "-T17", p.id + "-T19", ...(s.after || []).map(a => p.selections.find(x => x.id === a)).filter(Boolean).map(x => p.id + "-" + taskKey(x))];
function dependencyIssues(p){
  const ap = approved(p), ids = new Set([...p.checklist.map(c => c.id), ...ap.map(s => p.id + "-" + taskKey(s))]), issues = [];
  for (const s of ap) {
    for (const d of taskDeps(p, s)) if (!ids.has(d)) issues.push("Missing dependency: " + d);
    for (const id of s.after || []) if (!ap.some(x => x.id === id)) issues.push("Predecessor selection is missing or not approved: " + id);
    if (follows(p, s.id, s.id)) issues.push("Selection dependency cycle: " + s.id);
  }
  return [...new Set(issues)];
}
function srcName(p, s){ const f = s.sourceId && p.files.find(x => x.id === s.sourceId); return f ? (f.fid || f.id) + " " + f.name + " R" + f.rev : ""; }
const TRACE = ["Selection ID","Revision","Approved on","Source document","Project ID"], trace = s => [s.id, "R" + s.rev, s.approvedOn || "", s._src, s._p.id];
const OUT = {
  takeoff: ["Takeoff", ["Area","Item","Specification","Quantity","Unit", ...TRACE], s => [s._a, s.name, s.spec, s.qty == null ? "" : s.qty, s.unit, ...trace(s)]],
  budget: ["Budget lines", ["Cost code","Area","Item","Quantity","Unit cost","Amount", ...TRACE], s => [s.costCode, s._a, s.name, s.qty == null ? "" : s.qty, s.unitCost == null ? "" : s.unitCost, s.qty != null && s.unitCost != null ? s.qty * s.unitCost : "", ...trace(s)]],
  proposal: ["Proposal inputs", ["Area","Line description","Quantity","Unit", ...TRACE], s => [s._a, s.name + (s.spec ? " — " + s.spec : ""), s.qty == null ? "" : s.qty, s.unit, ...trace(s)]],
  procurement: ["Procurement list", ["Vendor","Item","Specification","Quantity","Unit","Lead time (days)","Needed by","Status", ...TRACE], s => [s.vendor, s.name, s.spec, s.qty == null ? "" : s.qty, s.unit, s.leadDays == null ? "" : s.leadDays, s.neededBy, s.status, ...trace(s)]],
  tasks: ["Contractor tasks", ["Key","Task","Proposed trade","Status","Task ID","Depends on","Release", ...TRACE], s => [taskKey(s), `Install ${s.name} — ${s._a}, per approved selection R${s.rev}`, SEL_CATS[s.category] || "To be assigned", "Draft", s._p.id + "-" + taskKey(s), taskDeps(s._p, s).join("; "), "Not released", ...trace(s)]]
};
function outRows(p, k){
  if (k === "tasks" && dependencyIssues(p).length) return [];
  const l = approved(p).map(s => Object.assign({}, s, { _a: areaName(p, s.areaId), _p: p, _src: srcName(p, s) }));
  if (k === "procurement") l.sort((a, b) => (a.vendor || "~").localeCompare(b.vendor || "~"));
  if (k === "budget") l.sort((a, b) => (a.costCode || "~").localeCompare(b.costCode || "~"));
  return l.map((s, i) => OUT[k][2](s, i));
}
function table(k, rows){
  const cols = OUT[k][1], isNum = c => /Quantity|cost|Amount|Lead/.test(c);
  const cell = (c, v) => c === "Amount" || c === "Unit cost" ? (v === "" ? "<span class='cap'>unknown</span>" : money(v)) : (v === "" ? "<span class='cap'>—</span>" : esc(v));
  return rows.length ? `<div class="scroll"><table class="tbl"><thead><tr>${cols.map(c => `<th${isNum(c) ? ' class="num"' : ""}>${c}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((v, i) => `<td${isNum(cols[i]) ? ' class="num"' : ""}>${cell(cols[i], v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<div class="empty"><b>Nothing approved yet</b>Approve a selection in Review &amp; approve and it appears here.</div>`;
}
const card = (title, right, body, id) => `<section class="card"${id ? ` id="${id}"` : ""}><div class="card-h"><h2>${title}</h2>${right || ""}</div><div class="card-b">${body}</div></section>`;
const dl = (k, label) => `<button class="btn sm sec" data-act="dl" data-k="${k}">${label}</button>`;

/* ============ Design Studio: the eight steps ============ */
function stepProject(p){
  const groups = GROUPS.filter(g => p.checklist.some(c => c.group === g));
  return `<div class="grid two"><div class="grid">
    ${card("Project", `<span class="tag">${esc(p.type)}</span>`, `<div class="form">
      <label>Project ID (shared with the launch plan)<input class="in" value="${esc(p.id)}" disabled></label>
      <label>Address<input class="in" value="${esc(p.address)}" disabled></label>
      <label class="full">Client or owner (leave blank if not confirmed)<input class="in" id="p_client" value="${esc(p.client)}"></label></div>
      ${p.source || p.description ? `<p class="sub" data-layout="layout-12">${esc(p.source)}${p.source && p.description ? " · " : ""}${esc(p.description)}</p>` : ""}`)}
    ${p.checklist.length ? card("Development checklist", `<span class="cap">${p.checklist.filter(c => c.status === "Done").length} of ${p.checklist.length} done</span>`,
      `<p class="sub" data-layout="layout-13">From the standard launch template. Every item starts as Not started, with no owner and no date. Done needs evidence.</p>` +
      groups.map(g => `<div data-layout="layout-07"><div class="cap">${g}</div><div class="rows">${p.checklist.filter(c => c.group === g).map(c => `<div class="row"><div class="chk"><div><div class="t" data-layout="layout-14">${esc(c.task)} <span class="tag">${esc(c.id || c.key)}</span>${c.status === "Done" && !c.evidence ? ' <span class="tag warn">no evidence recorded</span>' : ""}</div><div class="d">Approval gate: ${esc(c.gate)}${c.dependsOn ? " · after " + esc(c.dependsOn) : ""}</div>
        <input class="in" data-ev="${c.key}" value="${esc(c.evidence)}" placeholder="Evidence: document, sheet row or email" data-layout="layout-08" aria-label="Evidence for ${c.key}"></div>
        <select class="in" data-chk="${c.key}" aria-label="Status of ${c.key}">${["Not started","In progress","Done"].map(s => `<option${c.status === s ? " selected" : ""}>${s}</option>`).join("")}</select></div></div>`).join("")}</div></div>`).join("")) :
      card("Development checklist", "", `<div class="empty"><b>Not a development project</b>Construction and renovation projects go straight to sources and design. Start a development project from New Development Project to get the full checklist.</div>`)}
    </div><div class="grid">
    ${card("Team responsibilities", `<span class="cap">Names you enter. None is assumed.</span>`, `<div class="rows">${p.team.map((t, i) => `<div class="row" data-layout="layout-15"><label class="lab">${esc(t.role)}<input class="in" data-team="${i}" value="${esc(t.name)}" placeholder="Not assigned"></label></div>`).join("")}</div>`)}
    ${card("Where this project stands", "", `<div class="rows">
      <div class="row"><div class="top"><span>Waiting for your approval</span><b>${waiting(p)}</b></div></div>
      <div class="row"><div class="top"><span>Approved selections</span><b>${approved(p).length} of ${p.selections.length}</b></div></div>
      <div class="row"><div class="top"><span>Files</span><b>${p.files.length}</b></div></div>
      <div class="row"><div class="top"><span>Blockers</span><b>${blockers(p).length}</b></div></div></div>`)}
    </div></div>`;
}
function stepSources(p){
  return areaBar(p) + card(`Sources — ${esc(areaName(p, p.areaId))}`, `<span class="cap">Kept on this device</span>`, `<div class="drop" id="drop"><span>Drop surveys, drawings, photos, references and specifications here, or</span>
    <div data-layout="layout-16"><select class="in" id="f_cat" data-layout="layout-11" aria-label="File type">${FILE_CATS.map(c => `<option>${c}</option>`).join("")}</select>
    <label class="btn sm">Choose files<input id="f_in" type="file" multiple hidden></label></div>
    <span class="cap">A file added again under the same name is kept as a new revision. Nothing is removed.</span></div>${fileGrid(p, p.areaId)}`);
}
function stepDesign(p){
  const a = p.areaId, sels = p.selections.filter(s => s.areaId === a), opts = p.options.filter(o => o.areaId === a);
  return areaBar(p) + `<div class="grid two"><div class="grid">
    ${card(`Design options — ${esc(areaName(p, a))}`, `<span class="cap">${plural(opts.length, "option")}</span>`, (opts.length ? `<div class="rows">${opts.map(o => optRow(p, o)).join("")}</div>` : `<div class="empty"><b>No options yet</b>Add a layout or rendering option, attach its images, then send it for review.</div>`) +
      `<form id="optform" class="form" data-layout="layout-07"><label>Option name<input class="in" id="o_name" placeholder="e.g. Option C — galley"></label><label>What it is<input class="in" id="o_desc"></label><div class="full"><button class="btn sm" type="submit">Add option</button></div></form>`)}
    ${card(`Material selections — ${esc(areaName(p, a))}`, `<span class="cap">${plural(sels.length, "item")}</span>`, sels.length ? `<div class="rows">${sels.map(s => selRow(p, s)).join("")}</div>` : `<div class="empty"><b>No selections yet</b>Add the first item below.</div>`)}
    ${card(ui.editing ? "Edit selection" : "Add a selection", "", selForm(p), "selcard")}
    </div><div class="grid">
    ${card("AI design brief", `<span class="chip"><i></i>AI not connected</span>`, `<p class="sub" data-layout="layout-17">Write what you want. The brief gathers your notes, options, selections and file list into one request to paste into your AI tool.</p>
      <textarea class="in" id="notes" placeholder="e.g. Warm modern kitchen, island seating for four, keep the range wall as drawn.">${esc(p.notes[a] || "")}</textarea>
      <div data-layout="layout-18"><button class="btn sm" data-act="brief">Build brief</button><button class="btn sm sec" data-act="copy">Copy</button><span class="cap" id="copied" data-layout="layout-19"></span></div>
      <pre class="brief" id="brief" hidden></pre>`)}
    ${card("Sources for this area", `<button class="btn sm sec" data-act="step" data-n="2">Upload</button>`, fileGrid(p, a))}
    </div></div>`;
}
function stepReview(p){
  const o = p.options.filter(x => x.status === "In review"), s = p.selections.filter(x => idx(x) === 1), done = p.options.filter(x => x.status === "Approved");
  return `<p class="sub" data-layout="layout-20">Only you approve. An approved option or selection is locked at its revision; changing it starts the next revision and brings it back here.</p><div class="grid two"><div class="grid">
    ${card("Design options to review", `<span class="cap">${o.length}</span>`, o.length ? `<div class="rows">${o.map(x => optRow(p, x, true)).join("")}</div>` : `<div class="empty"><b>Nothing to review</b>Send an option for review from Design.</div>`)}
    ${card("Selections to approve", `<span class="cap">${s.length}</span>`, s.length ? `<div class="rows">${s.map(x => selRow(p, x, { area: true })).join("")}</div>` : `<div class="empty"><b>Nothing is waiting</b>Selections marked Selected appear here.</div>`)}
    </div><div class="grid">
    ${card("Approved", dl("approvals", "Download history"), `<p class="sub" data-layout="layout-13">Approvals here are demo actions on this device. Budget approval, purchase commitment and released-for-work approval are separate.</p><div class="rows"><div class="row"><div class="top"><span>Design options</span><b>${done.length}</b></div><div class="d">${done.map(x => esc(x.name) + " R" + x.rev).join(" · ") || "none yet"}</div></div>
      <div class="row"><div class="top"><span>Selections</span><b>${approved(p).length}</b></div><div class="d">These feed the takeoff, budget, proposal inputs and work package.</div></div></div>`)}
    ${card("Blockers", `<span class="cap">${blockers(p).length}</span>`, blockers(p).length ? `<div class="rows">${blockers(p).map(b => `<div class="row" data-layout="layout-15"><div class="d" data-layout="layout-21">${esc(b)}</div></div>`).join("")}</div>` : `<div class="empty"><b>No blockers found</b>Checks: quantity, specification and cost code on approved items; a drawing for each active area.</div>`)}
    </div></div>`;
}
function stepTakeoff(p){
  const k = state.out, rows = outRows(p, k); let foot = "";
  if (k === "budget") { const known = rows.filter(r => r[5] !== ""), n = rows.length - known.length;
    foot = `<p class="sub" data-layout="layout-22"><b>${money(known.reduce((t, r) => t + r[5], 0))}</b> across ${plural(known.length, "line")} with a known amount. ${n} ${n === 1 ? "line has" : "lines have"} no amount yet and ${n === 1 ? "is" : "are"} not included. This is not an approved budget.</p>`; }
  return `<div class="segctl" role="tablist" data-layout="layout-23">${["takeoff","budget"].map(x => `<button role="tab" aria-selected="${x === k}" data-act="out" data-v="${x}">${OUT[x][0]}</button>`).join("")}</div>` +
    card(OUT[k][0], dl(k, "Download CSV"), `<p class="sub" data-layout="layout-24">${k === "takeoff" ? "Built only from approved selections. A blank quantity is unknown, not zero." : "Amount is quantity × unit cost only where both are known. Unknown stays blank and is not counted."}</p>${table(k, rows)}${foot}`);
}
function stepProposal(p){
  return `<div class="grid two">${card("Proposal inputs", dl("proposal", "Download CSV"), `<p class="sub" data-layout="layout-24">Line items to enter in Wave. Wave stays the record for estimates, proposals and invoices. This page does not produce a proposal document or a price.</p>${table("proposal", outRows(p, "proposal"))}`)}
    ${card("Proposal status", `<span class="chip"><i></i>Wave not connected</span>`, `<div class="form"><label class="full">Where the proposal stands (you set this by hand)<select class="in" id="pr_state">${PROPOSAL_STATES.map(s => `<option${p.proposal.state === s ? " selected" : ""}>${s}</option>`).join("")}</select></label>
      <label class="full">Wave document number<input class="in" id="pr_no" value="${esc(p.proposal.waveNo)}" placeholder="Enter after you create it in Wave"></label></div>
      ${p.proposal.state !== "Not started" && !p.proposal.waveNo ? `<p data-layout="layout-12"><span class="tag warn">No Wave document number recorded</span></p>` : ""}`)}</div>`;
}
function stepPackage(p){
  const ap = approved(p), issues = dependencyIssues(p), trades = [...new Set(ap.map(s => SEL_CATS[s.category] || "To be assigned"))];
  const pk = trades.map(t => { const items = ap.filter(s => (SEL_CATS[s.category] || "To be assigned") === t), areas = [...new Set(items.map(s => s.areaId))];
    const nine = [["Scope", items.every(s => s.spec)], ["Drawings", areas.every(a => p.files.some(f => f.areaId === a && f.cat === "Drawing"))], ["Quantities", items.every(s => s.qty != null)],
      ["Pricing inputs (unverified)", items.every(s => s.vendor && s.unitCost != null)], ["Cost coding", items.every(s => s.costCode)], ["Budget / purchase / work release", null], ["Schedule", items.every(s => s.neededBy && s.neededConfirmed)], ["Quality requirements", null], ["Completion records", items.every(s => idx(s) === 6)]];
    return `<div class="row"><div class="top"><div><div class="t">${esc(t)} <span class="tag">proposed trade</span></div><div class="d">${items.map(s => esc(s.name) + " R" + s.rev).join(" · ")}</div></div><span class="cap">${plural(items.length, "item")}</span></div>
      <div class="nine">${nine.map(n => `<span class="tag${n[1] === true ? " ok" : n[1] === false ? " warn" : ""}">${n[0]}: ${n[1] === true ? "ready" : n[1] === false ? "missing" : "not recorded"}</span>`).join("")}</div></div>`; });
  return `<p class="sub" data-layout="layout-20">One package per trade, built from approved selections. Each shows the nine things a work package needs. The trade is a suggestion; no contractor is assigned and nothing is ordered from here.</p><div class="grid two"><div class="grid">
    ${card("Work packages", `<span class="cap">${pk.length}</span>`, pk.length ? `<div class="rows">${pk.join("")}</div>` : `<div class="empty"><b>Nothing approved yet</b>Packages appear once selections are approved.</div>`)}
    ${card("Draft contractor tasks", issues.length ? '<span class="tag warn">Export blocked</span>' : dl("tasks", "Download JSON"), `<p class="sub" data-layout="layout-24">Same fields as the launch template tasks, for Smartsheet after your approval. No owner or date is set. Budget, purchase and work release are not approved here.</p>${issues.length ? '<div role="alert">' + issues.map(esc).join('<br>') + '</div>' : table("tasks", outRows(p, "tasks"))}`)}
    </div><div class="grid">${card("Procurement list", dl("procurement", "Download CSV"), table("procurement", outRows(p, "procurement")))}</div></div>`;
}
function stepBuild(p){
  const ap = approved(p);
  return `<p class="sub" data-layout="layout-20">Approved items only. Counts, not percentages. Smartsheet remains the record of field progress; this view is for the design items you approved.</p>
    <div class="grid kpis" data-layout="layout-23">${["Approved","Ordered","Received","Paid"].map(s => `<div class="card kpi"><div class="lbl">${s}</div><div class="val">${ap.filter(x => x.status === s).length}</div></div>`).join("")}</div>
    ${card("Tracking", `<span class="cap">${ap.filter(x => idx(x) === 6).length} of ${ap.length} installed</span>`, ap.length ? `<div class="rows">${ap.map(s => selRow(p, s, { area: true, track: true })).join("")}</div>` : `<div class="empty"><b>Nothing approved yet</b></div>`)}`;
}
function viewStudio(){
  const p = P(), n = p.step, ap = approved(p).length;
  const counts = [p.checklist.length ? p.checklist.filter(c => c.status === "Done").length + " of " + p.checklist.length : "details", plural(p.files.length, "file"), plural(p.options.length, "option"), waiting(p) + " waiting", ap + " approved", p.proposal.state, ap ? "by trade" : "—", approved(p).filter(s => idx(s) === 6).length + " installed"];
  const body = [stepProject, stepSources, stepDesign, stepReview, stepTakeoff, stepProposal, stepPackage, stepBuild][n - 1](p);
  return `<header class="head"><div class="crumb">Design Studio${p.sample ? ' <span class="chip"><i></i>Made-up sample data</span>' : ""}</div><h1>${esc(p.address)}</h1><p>${esc(p.id)} · ${esc(p.type)}${p.client ? " · " + esc(p.client) : ""} · <a href="#daily" data-act="view" data-v="daily">Dashboard</a></p></header>
    <div class="flow" role="list">${FLOW.map((f, i) => `<button role="listitem" data-act="step" data-n="${i + 1}"${n === i + 1 ? ' aria-current="step"' : ""}><span class="k">${i + 1}</span><span class="nm">${f}</span><span class="c">${esc(counts[i])}</span></button>`).join("")}</div>${body}`;
}

/* ============ Daily Workspace ============ */
function viewDaily(){
  const t = today(), open = state.tasks.filter(k => !k.done), dls = deadlines(), dec = state.projects.reduce((n, p) => n + waiting(p), 0);
  const list = open.filter(k => state.filter === "All" || k.kind === state.filter).sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
  return `<header class="head"><div class="crumb">Daily Workspace</div><h1>${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h1><p>Your priorities, requests, deadlines and decisions across every project in this workspace.</p></header>
    <div class="grid kpis">
      <div class="card kpi"><div class="lbl">Decisions waiting</div><div class="val">${dec}</div><div class="cap">options and selections to approve</div></div>
      <div class="card kpi"><div class="lbl">Open tasks</div><div class="val">${open.length}</div><div class="cap">${open.filter(k => k.kind === "Client request").length} client requests · ${open.filter(k => k.kind === "Follow-up").length} follow-ups</div></div>
      <div class="card kpi"><div class="lbl">Past their date</div><div class="val">${dls.filter(d => d.late).length}</div><div class="cap">confirmed and proposed dates</div></div>
      <div class="card kpi"><div class="lbl">Projects</div><div class="val">${state.projects.length}</div><div class="cap">${state.projects.reduce((n, p) => n + blockers(p).length, 0)} blockers in total</div></div>
    </div>
    <div class="grid two" data-layout="layout-25"><div class="grid">
      ${card("Priorities and active tasks", `<div class="segctl" role="tablist">${["All", ...TASK_KINDS].map(f => `<button role="tab" aria-selected="${state.filter === f}" data-act="filter" data-v="${f}">${f === "All" ? "All" : f + "s"}</button>`).join("")}</div>`,
        (list.length ? `<div class="rows">${list.map(k => `<div class="row"><div class="top"><div><div class="t" data-layout="layout-14">${esc(k.text)}</div><div class="d">${esc((proj(k.projectId) || {}).address || "No project")} · ${k.due ? esc(k.due) + " (" + (k.confirmed ? "confirmed" : "proposed") + ")" : "no date set"}</div></div>
          <span data-layout="layout-26"><span class="tag${k.due && k.due < t ? " warn" : ""}">${k.due && k.due < t ? "Past date · " : ""}${esc(k.kind)}</span><button class="btn sm sec" data-act="task-done" data-id="${k.id}">Done</button></span></div></div>`).join("")}</div>` : `<div class="empty"><b>Nothing open here</b>Add a task, a client request or a follow-up below.</div>`) +
        `<form id="newtask" class="form" data-layout="layout-07"><label class="full">What needs doing<input class="in" id="t_text" placeholder="e.g. Call the client about the vanity"></label>
          <label>Type<select class="in" id="t_kind">${TASK_KINDS.map(k => `<option>${k}</option>`).join("")}</select></label>
          <label>Project<select class="in" id="t_proj"><option value="">No project</option>${state.projects.map(p => `<option value="${p.id}">${esc(p.address)}</option>`).join("")}</select></label>
          <label>Date<input class="in" id="t_due" type="date"></label><label>Date is<select class="in" id="t_conf"><option value="">Proposed</option><option value="1">Confirmed</option></select></label>
          <div class="full"><button class="btn sm" type="submit">Add</button> <span class="cap">Client requests are typed in by hand. Email is not connected.</span></div></form>`)}
    </div><div class="grid">
      ${card("Decisions waiting on you", `<span class="cap">${dec}</span>`, dec ? `<div class="rows">${state.projects.filter(p => waiting(p)).map(p => `<div class="row"><div class="top"><div><div class="t" data-layout="layout-14">${esc(p.address)}</div><div class="d">${plural(p.options.filter(o => o.status === "In review").length, "design option")} · ${plural(p.selections.filter(s => idx(s) === 1).length, "selection")}</div></div><button class="btn sm" data-act="goto" data-id="${p.id}" data-n="4">Review</button></div></div>`).join("")}</div>` : `<div class="empty"><b>Nothing is waiting</b></div>`)}
      ${card("Deadlines", "", dls.length ? `<div class="rows">${dls.slice(0, 8).map(d => `<div class="row"><div class="top"><div><div class="t" data-layout="layout-14">${esc(d.what)}</div><div class="d">${esc(d.where)} · ${esc(d.kind)}</div></div><span class="tag${d.late ? " warn" : ""}">${esc(d.date)} · ${d.confirmed ? "confirmed" : "proposed"}</span></div></div>`).join("")}</div>` : `<div class="empty"><b>No date is set</b>Dates show as proposed until you mark them confirmed.</div>`)}
      ${card("Projects", `<button class="btn sm sec" data-act="view" data-v="new">New project</button>`, `<div class="rows">${state.projects.map(p => `<div class="row"><div class="top"><div><div class="t" data-layout="layout-14">${esc(p.address)}${p.sample ? ' <span class="tag">made-up sample</span>' : ""}</div><div class="d">${esc(p.id)} · ${esc(p.type)} · step ${p.step} of 8, ${FLOW[p.step - 1]} · ${plural(blockers(p).length, "blocker")} · ${waiting(p)} waiting</div></div><button class="btn sm sec" data-act="goto" data-id="${esc(p.id)}">Open</button></div></div>`).join("")}</div>`)}
    </div></div>`;
}

/* ============ New Development Project ============ */
function viewNew(){
  const counts = GROUPS.map(g => [g, LAUNCH_TASKS.filter(t => t[1] === g && t[3] === "All").length]);
  return `<header class="head"><div class="crumb">New Development Project</div><h1>Start a project by address</h1><p>One intake for a development or a construction job. It creates the project with a standard, empty structure — you fill in the facts.</p></header>
    <div class="grid two">${card("Intake", "", `<form id="newdev" class="form">
      <label class="full">Property address or site identity<input class="in" id="n_addr" autocomplete="off" placeholder="Street, city, state"></label>
      <label>Project type<select class="in" id="n_type"><option>Development — single home</option><option>Development — subdivision</option><option>Construction or renovation</option></select></label>
      <label>Project ID (blank: made from the address)<input class="in" id="n_id" autocomplete="off" value="${esc(ui.prefill || "")}" placeholder="Letters, numbers, hyphens"></label>
      <label>Client or partner (blank if not confirmed)<input class="in" id="n_client" autocomplete="off"></label>
      <label>Source reference<input class="in" id="n_src" autocomplete="off" placeholder="Listing, email or document"></label>
      <label class="full">Opportunity description<textarea class="in" id="n_desc"></textarea></label>
      <div class="full"><button class="btn" type="submit">Create project</button> <span class="cap" id="n_err"></span></div></form>`)}
    <div class="grid">${card("What gets organised", `<span class="cap">development projects</span>`, `<div class="rows">${counts.map(c => `<div class="row" data-layout="layout-15"><div class="top"><span>${c[0]}</span><span class="cap">${c[0] === "Team responsibilities" ? "roles to name + " : ""}${plural(c[1], "item")}</span></div></div>`).join("")}</div>
      <p class="cap" data-layout="layout-12">27 items for a single home, 29 for a subdivision — the existing launch template. A subdivision adds shared infrastructure and cost allocation, kept apart from each house budget.</p>`)}
      ${card("Continue a launch plan", "", `<p class="sub" data-layout="layout-24">Already made a Draft plan with the launch form? Add its file here. The project keeps the same Project ID, and its plan tasks become the checklist.</p>
        <label class="lab">Draft export from the launch form (.json)<input class="in" id="n_import" type="file" accept=".json,application/json"></label><p class="cap" id="n_imp" data-layout="layout-08"></p>`)}
      ${card("What it does not do", "", `<div class="empty">It creates nothing in Smartsheet, assigns no one, sets no date and enters no price. Those happen after your approval, in the systems of record.</div>`)}</div></div>`;
}

/* ============ Higgsfield designs ============ */
// Designs made in Higgsfield land in a project as Rendering files marked "Higgsfield". The page itself cannot talk to Higgsfield;
// an AI assistant with the Higgsfield connection, or the person, brings the image in. Only higgsfield.ai links are accepted.
const HG_LINK = /^https:\/\/([a-z0-9-]+\.)*higgsfield\.ai(\/|$)/i;
async function importHiggsfield({ projectId, areaId, optionId, files, link, prompt }){
  const p = proj(projectId); if (!p) return "Choose a project.";
  if (!files || !files.length) return "Add at least one image saved from Higgsfield.";
  if (link && !HG_LINK.test(link)) return "The link must be a higgsfield.ai address.";
  const area = p.areas.find(a => a.id === areaId) || p.areas[0], o = optionId && p.options.find(x => x.id === optionId);
  for (const f of files) { const id = uid(), same = p.files.filter(x => x.areaId === area.id && x.name === f.name);
    await Files.put(id, f);
    p.files.push({ id, fid: p.id + "-F-" + pad(++p.seq.F), areaId: area.id, name: f.name, cat: "Rendering", source: "Higgsfield", link: link || "", prompt: prompt || "", size: f.size, type: f.type || "", added: today(), rev: same.length + 1 });
    if (o && o.status !== "Approved") o.fileIds.push(id); }
  save(); return "";
}
function viewHiggs(){
  const p = proj(ui.hgProj) || P(), area = p.areas.find(a => a.id === ui.hgArea) || p.areas[0], opts = p.options.filter(o => o.areaId === area.id && o.status !== "Approved");
  const all = state.projects.flatMap(x => x.files.filter(f => f.source === "Higgsfield").map(f => ({ f, x })));
  return `<header class="head"><div class="crumb">Higgsfield designs <span class="chip"><i></i>Higgsfield not connected to this page</span></div><h1>Bring a Higgsfield design into a project</h1><p>Renderings and layouts made in Higgsfield become project files, marked as Higgsfield, ready to attach to a design option and review.</p></header>
    <div class="grid two">${card("Add a design", "", `<form id="hgform" class="form">
      <label>Project<select class="in" id="hg_proj">${state.projects.map(x => `<option value="${x.id}"${x.id === p.id ? " selected" : ""}>${esc(x.address)}</option>`).join("")}</select></label>
      <label>Area<select class="in" id="hg_area">${p.areas.map(a => `<option value="${a.id}"${a.id === area.id ? " selected" : ""}>${esc(a.name)}</option>`).join("")}</select></label>
      <label class="full">Attach to a design option<select class="in" id="hg_opt"><option value="">Do not attach yet</option>${opts.map(o => `<option value="${o.id}">${esc(o.name)} (R${o.rev}, ${esc(o.status)})</option>`).join("")}</select></label>
      <label class="full">Images saved from Higgsfield<input class="in" id="hg_in" type="file" accept="image/*" multiple></label>
      <label class="full">Higgsfield link (optional)<input class="in" id="hg_link" placeholder="https://higgsfield.ai/…" autocomplete="off"></label>
      <label class="full">Prompt or notes used (optional)<textarea class="in" id="hg_prompt"></textarea></label>
      <div class="full"><button class="btn" type="submit">Add to project</button> <span class="cap" id="hg_err"></span></div></form>`)}
    <div class="grid">${card("How designs get here", "", `<div class="rows">
      <div class="row"><div class="t" data-layout="layout-14">By hand, today</div><div class="d">Save the image from Higgsfield and add it on the left.</div></div>
      <div class="row"><div class="t" data-layout="layout-14">Through your AI assistant</div><div class="d">Once the Higgsfield connection is authorised for the assistant, it can fetch a design you name and file it in the project you choose. This page does not connect to Higgsfield itself.</div></div>
      <div class="row"><div class="t" data-layout="layout-14">Then</div><div class="d">Attach it to a design option, send the option for review, and approve it in step 4.</div></div></div>`)}</div></div>
    <div data-layout="layout-27"></div>${card("Designs from Higgsfield", `<span class="cap">${all.length}</span>`, all.length ? `<div class="files">${all.map(({ f, x }) => `<button class="file" data-act="open" data-id="${f.id}" title="Open ${esc(f.name)}"><div class="th" data-thumb="${f.type.startsWith("image/") ? f.id : ""}">Rendering</div><div class="m"><div class="n">${esc(f.name)}</div><div class="cap">${esc(x.address)} · ${esc(areaName(x, f.areaId))} · R${f.rev}${f.link ? " · link saved" : ""}</div></div></button>`).join("")}</div>` : `<div class="empty"><b>None yet</b>Designs you add appear here and in the sources of the project.</div>`)}`;
}

/* ============ shell ============ */
function render(){
  const p = P(), dec = state.projects.reduce((n, x) => n + waiting(x), 0);
  $("#nav").innerHTML = AREAS3.map(a => `<button data-act="view" data-v="${a[0]}"${state.view === a[0] ? ' aria-current="page"' : ""}><svg viewBox="0 0 24 24">${ICON[a[0]]}</svg><span>${a[1]}</span>${a[0] === "daily" && dec ? `<span class="n">${dec}</span>` : ""}</button>`).join("") +
    (DASHBOARD ? `<button data-act="dash"><svg viewBox="0 0 24 24">${ICON.menu}</svg><span>Dashboard</span></button>` : "");
  const q = ui.q.trim().toLowerCase();
  $("#plist").innerHTML = state.projects.filter(x => !q || x.address.toLowerCase().includes(q)).map(x => `<button data-act="goto" data-id="${x.id}" aria-current="${state.view === "studio" && x.id === p.id}">${esc(x.address)}<small>${esc(x.type)}${x.sample ? " · made-up sample" : ""}</small></button>`).join("") || `<span class="cap" data-layout="layout-28">No project matches.</span>`;
  $("#storage").textContent = persistent && Files.ok() ? "Saved in this browser on this device." : "Storage is unavailable in this view — work is kept only until the page closes.";
  $("#tabs").innerHTML = [["daily","Daily"],["studio","Studio"],["new","New"]].map(t => `<button data-act="view" data-v="${t[0]}"${state.view === t[0] ? ' aria-current="page"' : ""}><svg viewBox="0 0 24 24">${ICON[t[0]]}</svg><span>${t[1]}</span></button>`).join("") + `<button data-act="menu"><svg viewBox="0 0 24 24">${ICON.menu}</svg><span>Projects</span></button>`;
  $("#view").innerHTML = viewInfo(state.view); ui.msg = "";
  document.title = (state.view === "studio" ? p.address + " — Design Studio" : state.view === "new" ? "New Development Project" : state.view === "higgsfield" ? "Higgsfield designs" : "Daily Workspace") + " — Development OS prototype";
  try { history.replaceState(null, "", "#" + (state.view === "studio" ? "project/" + encodeURIComponent(p.id) + "/" + p.step : state.view)); } catch (e) {}
  loadThumbs();
}
// The top-level views by name. "today" and "daily" are the dashboard: every project in this workspace, by Project ID.
function viewInfo(k){ return k === "studio" ? viewStudio() : k === "new" ? viewNew() : k === "higgsfield" ? viewHiggs() : viewDaily(); }
async function loadThumbs(){
  for (const el of document.querySelectorAll("[data-thumb]")) { const id = el.dataset.thumb; if (!id) continue;
    if (!thumbs.has(id)) { const b = await Files.get(id); if (!b || !/^image\/(png|jpeg|webp|gif|avif)$/.test(b.type)) continue; try { thumbs.set(id, await imageDataURL(b)); } catch { continue; } }
    if (el.isConnected) el.innerHTML = `<img alt="" src="${thumbs.get(id)}">`; }
}
async function addFiles(list){
  const p = P(), cat = ($("#f_cat") || {}).value || "Reference";
  for (const f of list) { const id = uid(), same = p.files.filter(x => x.areaId === p.areaId && x.name === f.name);
    await Files.put(id, f);
    p.files.push({ id, fid: p.id + "-F-" + pad(++p.seq.F), areaId: p.areaId, name: f.name, cat, size: f.size, type: f.type || "", added: today(), rev: same.length + 1 }); }
  save(); render();
}
function imageDataURL(blob){ return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("Image preview unavailable")); reader.readAsDataURL(blob); }); }
function download(name, text, type){ const a = document.createElement("a"), url = URL.createObjectURL(new Blob([text], { type })); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
// Spreadsheet-safe CSV. Text that a spreadsheet would read as a formula (it starts with = + - @, a tab or a return, after any spaces)
// gets a leading apostrophe, as OWASP advises. Numbers from numeric fields stay numbers. Programs should read the JSON exports instead.
const csvCell = v => { if (typeof v === "number") return String(v); let s = String(v == null ? "" : v); if (/^\s*[=+\-@]/.test(s) || /^[\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = rows => rows.map(r => r.map(csvCell).join(",")).join("\r\n");
function taskJson(p){
  const issues = dependencyIssues(p); if (issues.length) throw new Error("Contractor export blocked: " + issues.join("; "));
  const ap = approved(p), rows = outRows(p, "tasks");   // task rows keep the order of the approved selections
  return JSON.stringify({ project: p.address, projectId: p.id, status: "Draft — not approved, not released, not in Smartsheet",
    note: "Selection approval here is a demo action on one device. Budget approval, purchase commitment and released-for-work approval are separate and are not recorded in this file.",
    tasks: ap.map((s, i) => ({ key: rows[i][0], taskId: rows[i][4], projectId: p.id, phase: "09", task: rows[i][1], proposedRole: rows[i][2], dependsOn: taskDeps(p, s), selectionId: s.id, selectionRevision: s.rev, approvedOn: s.approvedOn || null, sourceDocument: srcName(p, s) || null,
      definitionOfDone: "Installed per the approved selection revision; photo evidence recorded", approvalGate: "Released-for-work approval, separate from selection approval", releaseStatus: "Not released", status: "Draft", responsible: null, dueDate: null, nextFollowUp: null, evidence: null })),
    // the same tasks as rows shaped like the launch form's plan rows, so they can join the same project plan
    planRows: ap.map((s, i) => ({ "Task": rows[i][1], "Task ID": rows[i][4], "Project ID": p.id, "Proposed Responsible Role": rows[i][2], "Responsible": null, "Status": "Draft", "Approval Needed": "Released-for-work approval", "Depends On / Gate": taskDeps(p, s).join("; "), "Due Date": null, "Next Follow-Up": null, "Date Confidence": "Unconfirmed", "Source IDs / Link": s.id + " R" + s.rev, "Evidence Link": null })) }, null, 2);
}
function approvalJson(p){ return JSON.stringify({ project: p.address, projectId: p.id, note: "Demo approvals recorded on one device. They are not protected business approvals.",
  selections: p.selections.map(s => ({ id: s.id, name: s.name, revision: s.rev, status: s.status, approvedOn: s.approvedOn || null, earlierRevisions: s.history, events: s.log || [] })),
  designOptions: p.options.map(o => ({ id: o.id, name: o.name, revision: o.rev, status: o.status, approvedOn: o.approvedOn || null, earlierRevisions: o.history, events: o.log || [] })) }, null, 2); }
const optHist = o => o.history.push({ rev: o.rev, status: o.status, when: today(), approvedOn: o.approvedOn || "", name: o.name, desc: o.desc, fileIds: o.fileIds.slice(), comment: o.comment });
// The launch form's Draft export becomes a project here under the same Project ID, with its plan rows as the checklist.
function importLaunch(j){
  if (!j || typeof j !== "object" || !j.project || !Array.isArray(j.planRows)) return "This file is not a Draft export from the launch form.";
  let id; try { id = normalizeProjectId(j.project.project_id); } catch (e) { return e.message; }
  if (proj(id)) return "A project with this Project ID is already here.";
  const kind = String(j.project.project_type || ""), type = kind === "Subdivision" ? "Development — subdivision" : kind === "Renovation" ? "Construction or renovation" : "Development — single home";
  const np = newProject(String(j.project.address_or_site_identity || j.project.opportunity_description || id).slice(0, 120), type, { id, source: String(j.project.source_reference || ""), description: String(j.project.opportunity_description || ""), launch: { template: String(j.template || ""), version: String(j.version || "") } });
  np.checklist = j.planRows.map(r => { const tid = String(r["Task ID"] || ""), key = tid.startsWith(id + "-") ? tid.slice(id.length + 1) : tid, t = LAUNCH_TASKS.find(x => x[0] === key);
    return { key, id: tid, group: t ? t[1] : "Other", task: String(r["Task"] || key), gate: String(r["Approval Needed"] || ""), dependsOn: String(r["Depends On / Gate"] || ""), status: "Not started", evidence: "" }; });
  if (j.project.pm_name) np.team[1].name = String(j.project.pm_name);
  state.projects.push(np); state.current = np.id; state.view = "studio"; save(); return "";
}

document.addEventListener("click", async e => {
  const t = e.target.closest("[data-act]"); if (!t) return; const p = P(), act = t.dataset.act, id = t.dataset.id, s = id && p.selections.find(x => x.id === id), o = id && p.options.find(x => x.id === id);
  if (act === "menu") { $("#side").classList.toggle("open"); return; }
  if (act === "dash") { location.href = DASHBOARD; return; }
  if (act === "view") { state.view = t.dataset.v; ui.editing = null; $("#side").classList.remove("open"); toTop(); }
  else if (act === "goto") { state.current = id; state.view = "studio"; ui.editing = null; if (t.dataset.n) proj(id).step = +t.dataset.n; $("#side").classList.remove("open"); toTop(); }
  else if (act === "step") { p.step = +t.dataset.n; ui.editing = null; }
  else if (act === "area") { p.areaId = id; ui.editing = null; }
  else if (act === "out") state.out = t.dataset.v;
  else if (act === "filter") state.filter = t.dataset.v;
  else if (act === "task-done") { const k = state.tasks.find(x => x.id === id); if (k) { k.done = true; k.doneOn = today(); } }
  else if (act === "next" && s) { const i = idx(s); if (i < 6) { logEvent(s, s.status, STATUSES[i + 1]); s.status = STATUSES[i + 1]; if (i === 1) s.approvedOn = today(); } }
  else if (act === "edit" && s) { ui.editing = s.id; p.areaId = s.areaId; p.step = 3; save(); render(); const c = $("#selcard"); if (c) c.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
  else if (act === "cancel") ui.editing = null;
  else if (act === "hist") ui.hist[id] = !ui.hist[id];
  else if (act === "opt-review" && o) { logEvent(o, o.status, "In review"); o.status = "In review"; }
  else if (act === "opt-approve" && o) { logEvent(o, o.status, "Approved"); o.status = "Approved"; o.approvedOn = today(); }
  else if (act === "opt-changes" && o) { logEvent(o, o.status, "Changes requested" + (o.comment ? ": " + o.comment : "")); o.status = "Changes requested"; }
  else if (act === "opt-revise" && o) { optHist(o); logEvent(o, o.status, "Draft (revision " + (o.rev + 1) + " opened)"); o.rev++; o.status = "Draft"; o.comment = ""; o.approvedOn = ""; }
  else if (act === "opt-attach" && o) { const sel = document.querySelector(`[data-pick="${id}"]`); if (sel && sel.value) o.fileIds.push(sel.value); }
  else if (act === "open") { const b = await Files.get(id), f = state.projects.flatMap(x => x.files).find(x => x.id === id); if (b && f) download(f.name, b, "application/octet-stream"); return; }
  else if (act === "brief" || act === "copy") { const el = $("#brief"); el.textContent = brief(p, p.areaId); el.hidden = false;
    if (act === "copy") { try { await navigator.clipboard.writeText(el.textContent); $("#copied").textContent = "Copied."; } catch (x) { $("#copied").textContent = "Select the text to copy it."; } } return; }
  else if (act === "dl") { const k = t.dataset.k || state.out, slug = p.id;
    if (k === "tasks") download(`${slug}-draft-tasks.json`, taskJson(p), "application/json");
    else if (k === "approvals") download(`${slug}-approval-history.json`, approvalJson(p), "application/json");
    else download(`${slug}-${k}.csv`, csv([OUT[k][1], ...outRows(p, k)]), "text/csv"); return; }
  save(); render();
});
document.addEventListener("submit", e => {
  e.preventDefault(); const p = P(), f = e.target.id;
  if (f === "hgform") { const files = [...$("#hg_in").files];
    importHiggsfield({ projectId: $("#hg_proj").value, areaId: $("#hg_area").value, optionId: $("#hg_opt").value, files, link: $("#hg_link").value.trim(), prompt: $("#hg_prompt").value.trim() }).then(err => { if (err) $("#hg_err").textContent = err; else render(); });
    return; }
  if (f === "newproj") { const addr = $("#np_addr").value.trim(); if (!addr) { $("#np_addr").focus(); return; }
    const same = state.projects.find(x => x.address.toLowerCase() === addr.toLowerCase());
    if (same) state.current = same.id; else { const np = newProject(addr, $("#np_type").value || "Construction or renovation"); state.projects.push(np); state.current = np.id; }
    state.view = "studio"; $("#np_addr").value = ""; $("#side").classList.remove("open"); }
  else if (f === "newdev") { const addr = $("#n_addr").value.trim(); if (!addr) { $("#n_err").textContent = "An address is required."; $("#n_addr").focus(); return; }
    if (state.projects.some(x => x.address.toLowerCase() === addr.toLowerCase())) { $("#n_err").textContent = "A project with this address already exists."; return; }
    let id = $("#n_id").value.trim();
    if (id) { try { id = normalizeProjectId(id); } catch (x) { $("#n_err").textContent = x.message; return; }
      if (proj(id)) { $("#n_err").textContent = "A project with this Project ID already exists."; return; } }
    const np = newProject(addr, $("#n_type").value, Object.assign({ client: $("#n_client").value.trim(), source: $("#n_src").value.trim(), description: $("#n_desc").value.trim() }, id ? { id } : {}));
    state.projects.push(np); state.current = np.id; state.view = "studio"; ui.prefill = ""; }
  else if (f === "newtask") { const text = $("#t_text").value.trim(); if (!text) { $("#t_text").focus(); return; }
    state.tasks.push({ id: uid(), kind: $("#t_kind").value, text, projectId: $("#t_proj").value || null, due: $("#t_due").value, confirmed: !!$("#t_conf").value, done: false }); }
  else if (f === "addarea") { const n = $("#a_name").value.trim(); if (!n) return; const id = uid(); p.areas.push({ id, name: n }); p.areaId = id; }
  else if (f === "optform") { const n = $("#o_name").value.trim(); if (!n) { $("#o_name").focus(); return; }
    const k = ++p.seq.OPT; p.options.push({ id: p.id + "-OPT-" + pad(k), seq: k, areaId: p.areaId, name: n, desc: $("#o_desc").value.trim(), fileIds: [], status: "Draft", rev: 1, history: [], log: [], comment: "" }); }
  else if (f === "selform") { const name = $("#s_name").value.trim(); if (!name) { $("#s_name").focus(); return; }
    const cur = ui.editing && p.selections.find(s => s.id === ui.editing), aft = $("#s_after").value || "";
    const data = { name, category: $("#s_cat").value, vendor: $("#s_vendor").value.trim(), spec: $("#s_spec").value.trim(), qty: num($("#s_qty").value), unit: $("#s_unit").value.trim(), unitCost: num($("#s_cost").value), costCode: $("#s_code").value.trim(), neededBy: $("#s_need").value, neededConfirmed: !!$("#s_conf").value, sourceId: $("#s_src").value || "", after: aft ? [aft] : [] };
    if (cur && aft && (aft === cur.id || follows(p, aft, cur.id))) { data.after = cur.after || []; ui.msg = "That order would make a loop, so the earlier setting was kept."; }
    if (cur) { if (idx(cur) >= 2) { cur.history.push(snapshot(cur)); logEvent(cur, cur.status, "Selected (revision " + (cur.rev + 1) + " opened)"); cur.rev++; cur.status = "Selected"; cur.approvedOn = ""; }   // the full approved revision is kept
      Object.assign(cur, data); ui.editing = null; }
    else { const k = ++p.seq.SEL; p.selections.push(Object.assign({ id: p.id + "-SEL-" + pad(k), seq: k, areaId: p.areaId, leadDays: null, status: "Discussed", rev: 1, history: [], log: [], approvedOn: "" }, data)); } }
  save(); render();
});
document.addEventListener("input", e => {
  const t = e.target, p = P();
  if (t.id === "q") { ui.q = t.value; render(); const q = $("#q"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); return; }
  if (t.id === "notes") p.notes[p.areaId] = t.value;
  else if (t.id === "p_client") p.client = t.value;
  else if (t.id === "pr_no") p.proposal.waveNo = t.value.trim();
  else if (t.dataset.team != null) p.team[+t.dataset.team].name = t.value;
  else if (t.dataset.ev) { const c = p.checklist.find(x => x.key === t.dataset.ev); if (c) c.evidence = t.value; }
  else if (t.dataset.oc) { const o = p.options.find(x => x.id === t.dataset.oc); if (o) o.comment = t.value; }
  else return;
  save();
});
document.addEventListener("change", e => {
  const t = e.target, p = P();
  if (t.id === "f_in" && t.files.length) { addFiles([...t.files]); return; }
  if (t.id === "n_import" && t.files.length) { t.files[0].text().then(txt => { let err; try { err = importLaunch(JSON.parse(txt)); } catch (x) { err = "This file could not be read as JSON."; } if (err) $("#n_imp").textContent = err; else render(); }); return; }
  if (t.dataset.chk) { const c = p.checklist.find(x => x.key === t.dataset.chk); if (c) c.status = t.value; }
  else if (t.id === "pr_state") p.proposal.state = t.value;
  else if (t.id === "hg_proj") { ui.hgProj = t.value; ui.hgArea = null; }
  else if (t.id === "hg_area") ui.hgArea = t.value;
  else return;
  save(); render();
});
document.addEventListener("dragover", e => { const d = e.target.closest && e.target.closest("#drop"); if (d) { e.preventDefault(); d.classList.add("over"); } });
document.addEventListener("dragleave", e => { const d = e.target.closest && e.target.closest("#drop"); if (d) d.classList.remove("over"); });
document.addEventListener("drop", e => { const d = e.target.closest && e.target.closest("#drop"); if (d) { e.preventDefault(); d.classList.remove("over"); if (e.dataTransfer.files.length) addFiles([...e.dataTransfer.files]); } });
$("#theme").addEventListener("click", () => { const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"); document.documentElement.dataset.theme = cur === "dark" ? "light" : "dark"; });
$("#reset").addEventListener("click", async () => { if (!confirm("Remove everything added in this prototype on this device and restore the made-up sample?")) return; await Files.clear(); thumbs.clear(); state = sampleState(); ui = { q: "", editing: null, hist: {} }; save(); render(); });

/* Optional link back to a dashboard page: ?dashboard=<relative .html path>. Only a plain relative path is accepted. */
const DASHBOARD = (() => { try { const d = new URLSearchParams(location.search).get("dashboard"); return d && /^[A-Za-z0-9 ._()\/-]+\.html$/.test(d) && !d.includes("//") ? d : null; } catch (e) { return null; } })();

(async () => {
  await Files.open();
  const saved = loadState();
  state = saved && saved.projects && saved.projects.length ? upgrade(saved) : sampleState();
  // deep links: #daily, #new, #higgsfield, #studio, #studio-4 and, by shared Project ID, #project/<ID> or #project/<ID>/<step>
  const h = (location.hash || "").slice(1), m = h.match(/^studio-([1-8])$/), pm = h.match(/^project\/([^/]+)(?:\/([1-8]))?$/);
  if (pm) { let id = ""; try { id = decodeURIComponent(pm[1]); } catch (e) {}
    if (proj(id)) { state.current = id; state.view = "studio"; if (pm[2]) P().step = +pm[2]; }
    else { state.view = "new"; ui.prefill = PROJECT_ID.test(id) ? id : ""; } }     // unknown ID: offer to start that project
  else if (m) { state.view = "studio"; P().step = +m[1]; } else if (["daily","studio","new","higgsfield"].includes(h)) state.view = h;
  $("#brand").innerHTML = mark("g1") + "<div><b>Grama OS</b><span>Development OS</span></div>";
  $("#brand-m").innerHTML = mark("g2") + "<div><b>Grama OS</b><span>Development OS</span></div>";
  save(); render();
})();
