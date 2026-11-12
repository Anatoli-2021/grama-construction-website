// Workspace prototype — record logic. No page, storage or network access, so it can be loaded and tested in Node.
// Loaded before studio.js as a plain script; both share these names. In Node: await import(...) then use globalThis.StudioLogic.
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

/* ============ helpers ============ */
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = v => { const t = String(v == null ? "" : v).trim(); return t !== "" && isFinite(+t) ? +t : null; };
const money = n => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const today = () => iso(new Date());
const plus = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
const pad = n => String(n).padStart(2, "0");
// One Project ID for the launch form and this workspace: the same rule as packages/shared/project-id.mjs.
// Every record ID starts with it: <project>-SEL-01 (selection), <project>-OPT-01 (design option), <project>-F-01 (file),
// <project>-DS-01 (contractor task) and <project>-T19 (launch plan task).
const PROJECT_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
function normalizeProjectId(value){ const id = String(value == null ? "" : value).trim(); if (!PROJECT_ID.test(id)) throw new Error("Use a Project ID of 1–80 letters, numbers, hyphens or underscores, starting with a letter or number."); return id; }
function suggestProjectId(address){ const base = String(address).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "PROJECT"; const taken = typeof state !== "undefined" && state ? state.projects.map(p => p.id) : []; let id = base, n = 2; while (taken.includes(id)) id = base + "-" + n++; return id; }
// A full copy of a selection revision, kept when an approved revision is replaced.
const snapshot = s => ({ rev: s.rev, status: s.status, when: today(), approvedOn: s.approvedOn || "", name: s.name, category: s.category, spec: s.spec, vendor: s.vendor, qty: s.qty, unit: s.unit, unitCost: s.unitCost, costCode: s.costCode, leadDays: s.leadDays, neededBy: s.neededBy, neededConfirmed: s.neededConfirmed, sourceId: s.sourceId || "", after: (s.after || []).slice() });
// Every status change is logged with its time and revision. These are demo actions on one device, not protected approvals.
const logEvent = (x, from, to) => { (x.log = x.log || []).push({ at: new Date().toISOString(), rev: x.rev, from, to }); };
function follows(p, fromId, targetId, seen = new Set()){ if (seen.has(fromId)) return false; seen.add(fromId); const s = p.selections.find(x => x.id === fromId); return !!s && (s.after || []).some(a => a === targetId || follows(p, a, targetId, seen)); }
// A construction or renovation project skips land, feasibility and partnership but still gets the gates its work depends on,
// including contract authority (T17) and release-to-build (T19), so a contractor task never points at a gate that does not exist.
const CONSTRUCTION_KEYS = ["T10","T12","T14","T15","T16","T17","T18","T19","T20","T21","T22","T23","T24","T26","T27"];
function checklist(type){ const dev = type.startsWith("Development");
  return LAUNCH_TASKS.filter(t => dev ? (t[3] === "All" || type.includes("subdivision")) : CONSTRUCTION_KEYS.includes(t[0])).map(t => ({ key: t[0], group: t[1], task: t[2], gate: t[4], status: "Not started", evidence: "" })); }
function newProject(address, type, extra){
  const areas = DEFAULT_AREAS.map(n => ({ id: uid(), name: n })), id = (extra && extra.id) || suggestProjectId(address);
  return Object.assign({ id, address, type, client: "", source: "", description: "", step: 1, areaId: areas[0].id, areas, files: [], notes: {}, selections: [], options: [], seq: { SEL: 0, OPT: 0, F: 0 },
    team: ROLES.map(r => ({ role: r, name: "" })), checklist: checklist(type).map(c => Object.assign(c, { id: id + "-" + c.key, dependsOn: "" })), proposal: { state: PROPOSAL_STATES[0], waveNo: "" } }, extra || {});
}
function upgrade(s){ // older saved data gains the newer fields; nothing is dropped
  s.version = 3; s.view = ["daily","studio","new","higgsfield"].includes(s.view) ? s.view : "daily"; s.tasks = s.tasks || []; s.filter = s.filter || "All"; s.out = s.out === "budget" ? "budget" : "takeoff";
  for (const p of s.projects) { p.step = p.step || 1; p.options = p.options || []; p.client = p.client || ""; p.team = p.team || ROLES.map(r => ({ role: r, name: "" }));
    p.checklist = p.checklist && p.checklist.length ? p.checklist : checklist(p.type || ""); p.proposal = p.proposal || { state: PROPOSAL_STATES[0], waveNo: "" }; p.seq = p.seq || { SEL: 0, OPT: 0, F: 0 };
    for (const x of p.selections) { if (!x.seq) x.seq = ++p.seq.SEL; x.log = x.log || []; x.after = x.after || []; x.sourceId = x.sourceId || ""; }   // existing IDs are kept as they are
    for (const o of p.options) { if (!o.seq) o.seq = ++p.seq.OPT; o.log = o.log || []; }
    for (const f of p.files) if (!f.fid) f.fid = p.id + "-F-" + pad(++p.seq.F);
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

/* ============ record helpers ============ */
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
  if (approved(p).length && !canExportTasks(p)) out.push("The project plan has no release-to-build gate (T19), so contractor tasks cannot be exported");
  return out;
}
/* ============ outputs (logic) ============ */
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
// Only gates that exist in this project's own plan are referenced. Without a release-to-build gate (T19) there is no contractor export.
const GATE_KEYS = ["T17","T19"];
const gateIds = p => GATE_KEYS.map(k => p.id + "-" + k).filter(id => (p.checklist || []).some(c => c.id === id));
const canExportTasks = p => (p.checklist || []).some(c => c.id === p.id + "-T19");
const taskDeps = (p, s) => [...gateIds(p), ...(s.after || []).map(a => p.selections.find(x => x.id === a)).filter(Boolean).map(x => p.id + "-" + taskKey(x))];
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
  const l = approved(p).map(s => Object.assign({}, s, { _a: areaName(p, s.areaId), _p: p, _src: srcName(p, s) }));
  if (k === "procurement") l.sort((a, b) => (a.vendor || "~").localeCompare(b.vendor || "~"));
  if (k === "budget") l.sort((a, b) => (a.costCode || "~").localeCompare(b.costCode || "~"));
  return l.map((s, i) => OUT[k][2](s, i));
}
/* ============ exports (logic) ============ */
// Spreadsheet-safe CSV. Text that a spreadsheet would read as a formula (it starts with = + - @, a tab or a return, after any spaces)
// gets a leading apostrophe, as OWASP advises. Numbers from numeric fields stay numbers. Programs should read the JSON exports instead.
const csvCell = v => { if (typeof v === "number") return String(v); let s = String(v == null ? "" : v); if (/^\s*[=+\-@]/.test(s) || /^[\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = rows => rows.map(r => r.map(csvCell).join(",")).join("\r\n");
function taskJson(p){
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

/* ============ for tests ============ */
globalThis.StudioLogic = { STATUSES, FILE_CATS, SEL_CATS, DEFAULT_AREAS, ROLES, FLOW, PROPOSAL_STATES, LAUNCH_TASKS, GROUPS, CONSTRUCTION_KEYS, GATE_KEYS, PROJECT_ID, uid, esc, num, money, today, plus, pad, normalizeProjectId, suggestProjectId, snapshot, logEvent, follows, checklist, newProject, upgrade, sampleState, areaName, idx, approved, waiting, blockers, brief, taskKey, gateIds, canExportTasks, taskDeps, srcName, TRACE, OUT, outRows, csvCell, csv, taskJson, approvalJson, optHist };
