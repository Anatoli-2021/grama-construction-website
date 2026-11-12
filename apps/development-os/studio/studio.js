// Workspace prototype — page code: storage, views and events. Needs studio-logic.js loaded first.
const $ = s => document.querySelector(s);
const toTop = () => { try { scrollTo(0, 0); } catch (e) {} };
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

/* ============ state ============ */
let state = null, ui = { q: "", editing: null, hist: {} };
const thumbs = new Map();
const P = () => state.projects.find(p => p.id === state.current) || state.projects[0];
const proj = id => state.projects.find(p => p.id === id);
/* ============ deadlines ============ */
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
    <div class="cap" data-u="u2">${esc(s.id)}${fol.length ? " · follows " + esc(fol.join(", ")) : ""}${srcName(p, s) ? " · source " + esc(srcName(p, s)) : ""}</div>
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
    <div class="full" data-u="u3"><button class="btn" type="submit">${e ? "Save change" : "Add selection"}</button>${e ? '<button class="btn sec" type="button" data-act="cancel">Cancel</button>' : ""}</div></form>`;
}
const areaBar = p => `<div data-u="u4">
  <div class="segctl" role="tablist">${p.areas.map(x => `<button role="tab" aria-selected="${x.id === p.areaId}" data-act="area" data-id="${x.id}">${esc(x.name)}</button>`).join("")}</div>
  <form id="addarea" data-u="u5"><input class="in" id="a_name" placeholder="Add area" data-u="u6" aria-label="New area name"><button class="btn sm sec" type="submit">Add</button></form></div>`;
function fileGrid(p, areaId){
  const list = p.files.filter(f => f.areaId === areaId);
  if (!list.length) return `<div class="empty" data-u="u7"><b>No files yet</b>Add the survey, drawings, photos, references and specifications for this area.</div>`;
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
    ${imgs.length ? `<div class="board">${imgs.map(f => `<div class="th" data-thumb="${f.type.startsWith("image/") ? f.id : ""}" title="${esc(f.name)}">${esc(f.cat)}</div>`).join("")}</div>` : `<div class="cap" data-u="u8">No drawing or image attached yet.</div>`}
    ${o.comment ? `<div class="hist">Review note: ${esc(o.comment)}</div>` : ""}
    ${o.history.length ? `<div class="cap" data-u="u9">Earlier: ${o.history.map(h => `R${h.rev} ${esc(h.status)} (${esc(h.when)})`).join(" · ")}</div>` : ""}
    <div class="acts">${act}${o.status === "In review" ? `<input class="in" data-oc="${o.id}" value="${esc(o.comment)}" placeholder="Review note (optional)" data-u="u10" aria-label="Review note">` : ""}
      ${!review && o.status !== "Approved" && pick.length ? `<select class="in" data-pick="${o.id}" data-u="u11" aria-label="File to attach">${pick.map(f => `<option value="${f.id}">${esc(f.name)}</option>`).join("")}</select><button class="btn sm sec" data-act="opt-attach" data-id="${o.id}">Attach</button>` : ""}</div></div>`;
}
/* ============ output tables ============ */
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
      ${p.source || p.description ? `<p class="sub" data-u="u12">${esc(p.source)}${p.source && p.description ? " · " : ""}${esc(p.description)}</p>` : ""}`)}
    ${p.checklist.length ? card(p.type.startsWith("Development") ? "Development checklist" : "Project checklist", `<span class="cap">${p.checklist.filter(c => c.status === "Done").length} of ${p.checklist.length} done</span>`,
      `<p class="sub" data-u="u13">From the standard launch template. Every item starts as Not started, with no owner and no date. Done needs evidence.</p>` +
      groups.map(g => `<div data-u="u7"><div class="cap">${g}</div><div class="rows">${p.checklist.filter(c => c.group === g).map(c => `<div class="row"><div class="chk"><div><div class="t" data-u="u14">${esc(c.task)} <span class="tag">${esc(c.id || c.key)}</span>${c.status === "Done" && !c.evidence ? ' <span class="tag warn">no evidence recorded</span>' : ""}</div><div class="d">Approval gate: ${esc(c.gate)}${c.dependsOn ? " · after " + esc(c.dependsOn) : ""}</div>
        <input class="in" data-ev="${c.key}" value="${esc(c.evidence)}" placeholder="Evidence: document, sheet row or email" data-u="u8" aria-label="Evidence for ${c.key}"></div>
        <select class="in" data-chk="${c.key}" aria-label="Status of ${c.key}">${["Not started","In progress","Done"].map(s => `<option${c.status === s ? " selected" : ""}>${s}</option>`).join("")}</select></div></div>`).join("")}</div></div>`).join("")) :
      card("Development checklist", "", `<div class="empty"><b>Not a development project</b>Construction and renovation projects go straight to sources and design. Start a development project from New Development Project to get the full checklist.</div>`)}
    </div><div class="grid">
    ${card("Team responsibilities", `<span class="cap">Names you enter. None is assumed.</span>`, `<div class="rows">${p.team.map((t, i) => `<div class="row" data-u="u15"><label class="lab">${esc(t.role)}<input class="in" data-team="${i}" value="${esc(t.name)}" placeholder="Not assigned"></label></div>`).join("")}</div>`)}
    ${card("Where this project stands", "", `<div class="rows">
      <div class="row"><div class="top"><span>Waiting for your approval</span><b>${waiting(p)}</b></div></div>
      <div class="row"><div class="top"><span>Approved selections</span><b>${approved(p).length} of ${p.selections.length}</b></div></div>
      <div class="row"><div class="top"><span>Files</span><b>${p.files.length}</b></div></div>
      <div class="row"><div class="top"><span>Blockers</span><b>${blockers(p).length}</b></div></div></div>`)}
    </div></div>`;
}
function stepSources(p){
  return areaBar(p) + card(`Sources — ${esc(areaName(p, p.areaId))}`, `<span class="cap">Kept on this device</span>`, `<div class="drop" id="drop"><span>Drop surveys, drawings, photos, references and specifications here, or</span>
    <div data-u="u16"><select class="in" id="f_cat" data-u="u11" aria-label="File type">${FILE_CATS.map(c => `<option>${c}</option>`).join("")}</select>
    <label class="btn sm">Choose files<input id="f_in" type="file" multiple hidden></label></div>
    <span class="cap">A file added again under the same name is kept as a new revision. Nothing is removed.</span></div>${fileGrid(p, p.areaId)}`);
}
function stepDesign(p){
  const a = p.areaId, sels = p.selections.filter(s => s.areaId === a), opts = p.options.filter(o => o.areaId === a);
  return areaBar(p) + `<div class="grid two"><div class="grid">
    ${card(`Design options — ${esc(areaName(p, a))}`, `<span class="cap">${plural(opts.length, "option")}</span>`, (opts.length ? `<div class="rows">${opts.map(o => optRow(p, o)).join("")}</div>` : `<div class="empty"><b>No options yet</b>Add a layout or rendering option, attach its images, then send it for review.</div>`) +
      `<form id="optform" class="form" data-u="u7"><label>Option name<input class="in" id="o_name" placeholder="e.g. Option C — galley"></label><label>What it is<input class="in" id="o_desc"></label><div class="full"><button class="btn sm" type="submit">Add option</button></div></form>`)}
    ${card(`Material selections — ${esc(areaName(p, a))}`, `<span class="cap">${plural(sels.length, "item")}</span>`, sels.length ? `<div class="rows">${sels.map(s => selRow(p, s)).join("")}</div>` : `<div class="empty"><b>No selections yet</b>Add the first item below.</div>`)}
    ${card(ui.editing ? "Edit selection" : "Add a selection", "", selForm(p), "selcard")}
    </div><div class="grid">
    ${card("AI design brief", `<span class="chip"><i></i>AI not connected</span>`, `<p class="sub" data-u="u17">Write what you want. The brief gathers your notes, options, selections and file list into one request to paste into your AI tool.</p>
      <textarea class="in" id="notes" placeholder="e.g. Warm modern kitchen, island seating for four, keep the range wall as drawn.">${esc(p.notes[a] || "")}</textarea>
      <div data-u="u18"><button class="btn sm" data-act="brief">Build brief</button><button class="btn sm sec" data-act="copy">Copy</button><span class="cap" id="copied" data-u="u19"></span></div>
      <pre class="brief" id="brief" hidden></pre>`)}
    ${card("Sources for this area", `<button class="btn sm sec" data-act="step" data-n="2">Upload</button>`, fileGrid(p, a))}
    </div></div>`;
}
function stepReview(p){
  const o = p.options.filter(x => x.status === "In review"), s = p.selections.filter(x => idx(x) === 1), done = p.options.filter(x => x.status === "Approved");
  return `<p class="sub" data-u="u20">Only you approve. An approved option or selection is locked at its revision; changing it starts the next revision and brings it back here.</p><div class="grid two"><div class="grid">
    ${card("Design options to review", `<span class="cap">${o.length}</span>`, o.length ? `<div class="rows">${o.map(x => optRow(p, x, true)).join("")}</div>` : `<div class="empty"><b>Nothing to review</b>Send an option for review from Design.</div>`)}
    ${card("Selections to approve", `<span class="cap">${s.length}</span>`, s.length ? `<div class="rows">${s.map(x => selRow(p, x, { area: true })).join("")}</div>` : `<div class="empty"><b>Nothing is waiting</b>Selections marked Selected appear here.</div>`)}
    </div><div class="grid">
    ${card("Approved", dl("approvals", "Download history"), `<p class="sub" data-u="u13">Approvals here are demo actions on this device. Budget approval, purchase commitment and released-for-work approval are separate.</p><div class="rows"><div class="row"><div class="top"><span>Design options</span><b>${done.length}</b></div><div class="d">${done.map(x => esc(x.name) + " R" + x.rev).join(" · ") || "none yet"}</div></div>
      <div class="row"><div class="top"><span>Selections</span><b>${approved(p).length}</b></div><div class="d">These feed the takeoff, budget, proposal inputs and work package.</div></div></div>`)}
    ${card("Blockers", `<span class="cap">${blockers(p).length}</span>`, blockers(p).length ? `<div class="rows">${blockers(p).map(b => `<div class="row" data-u="u15"><div class="d" data-u="u21">${esc(b)}</div></div>`).join("")}</div>` : `<div class="empty"><b>No blockers found</b>Checks: quantity, specification and cost code on approved items; a drawing for each active area.</div>`)}
    </div></div>`;
}
function stepTakeoff(p){
  const k = state.out, rows = outRows(p, k); let foot = "";
  if (k === "budget") { const known = rows.filter(r => r[5] !== ""), n = rows.length - known.length;
    foot = `<p class="sub" data-u="u22"><b>${money(known.reduce((t, r) => t + r[5], 0))}</b> across ${plural(known.length, "line")} with a known amount. ${n} ${n === 1 ? "line has" : "lines have"} no amount yet and ${n === 1 ? "is" : "are"} not included. This is not an approved budget.</p>`; }
  return `<div class="segctl" role="tablist" data-u="u23">${["takeoff","budget"].map(x => `<button role="tab" aria-selected="${x === k}" data-act="out" data-v="${x}">${OUT[x][0]}</button>`).join("")}</div>` +
    card(OUT[k][0], dl(k, "Download CSV"), `<p class="sub" data-u="u24">${k === "takeoff" ? "Built only from approved selections. A blank quantity is unknown, not zero." : "Amount is quantity × unit cost only where both are known. Unknown stays blank and is not counted."}</p>${table(k, rows)}${foot}`);
}
function stepProposal(p){
  return `<div class="grid two">${card("Proposal inputs", dl("proposal", "Download CSV"), `<p class="sub" data-u="u24">Line items to enter in Wave. Wave stays the record for estimates, proposals and invoices. This page does not produce a proposal document or a price.</p>${table("proposal", outRows(p, "proposal"))}`)}
    ${card("Proposal status", `<span class="chip"><i></i>Wave not connected</span>`, `<div class="form"><label class="full">Where the proposal stands (you set this by hand)<select class="in" id="pr_state">${PROPOSAL_STATES.map(s => `<option${p.proposal.state === s ? " selected" : ""}>${s}</option>`).join("")}</select></label>
      <label class="full">Wave document number<input class="in" id="pr_no" value="${esc(p.proposal.waveNo)}" placeholder="Enter after you create it in Wave"></label></div>
      ${p.proposal.state !== "Not started" && !p.proposal.waveNo ? `<p data-u="u12"><span class="tag warn">No Wave document number recorded</span></p>` : ""}`)}</div>`;
}
function stepPackage(p){
  const ap = approved(p), trades = [...new Set(ap.map(s => SEL_CATS[s.category] || "To be assigned"))];
  const pk = trades.map(t => { const items = ap.filter(s => (SEL_CATS[s.category] || "To be assigned") === t), areas = [...new Set(items.map(s => s.areaId))];
    const nine = [["Scope", items.every(s => s.spec)], ["Drawings", areas.every(a => p.files.some(f => f.areaId === a && f.cat === "Drawing"))], ["Quantities", items.every(s => s.qty != null)],
      ["Quotations", items.every(s => s.vendor && s.unitCost != null)], ["Budget", items.every(s => s.costCode)], ["Approvals", true], ["Schedule", items.every(s => s.neededBy && s.neededConfirmed)], ["Quality requirements", null], ["Completion records", items.every(s => idx(s) === 6)]];
    return `<div class="row"><div class="top"><div><div class="t">${esc(t)} <span class="tag">proposed trade</span></div><div class="d">${items.map(s => esc(s.name) + " R" + s.rev).join(" · ")}</div></div><span class="cap">${plural(items.length, "item")}</span></div>
      <div class="nine">${nine.map(n => `<span class="tag${n[1] === true ? " ok" : n[1] === false ? " warn" : ""}">${n[0]}: ${n[1] === true ? "ready" : n[1] === false ? "missing" : "not recorded"}</span>`).join("")}</div></div>`; });
  return `<p class="sub" data-u="u20">One package per trade, built from approved selections. Each shows the nine things a work package needs. The trade is a suggestion; no contractor is assigned and nothing is ordered from here.</p><div class="grid two"><div class="grid">
    ${card("Work packages", `<span class="cap">${pk.length}</span>`, pk.length ? `<div class="rows">${pk.join("")}</div>` : `<div class="empty"><b>Nothing approved yet</b>Packages appear once selections are approved.</div>`)}
    ${canExportTasks(p) ? card("Draft contractor tasks", dl("tasks", "Download JSON"), `<p class="sub" data-u="u24">Same fields as the launch template tasks, for Smartsheet after your approval. No owner or date is set.</p>${table("tasks", outRows(p, "tasks"))}`)
      : card("Draft contractor tasks", `<span class="tag warn">Export unavailable</span>`, `<div class="empty"><b>This project's plan has no release-to-build gate</b>Contractor tasks must depend on that gate (T19). Add the plan through the launch form, then import it, before exporting tasks.</div>`)}
    </div><div class="grid">${card("Procurement list", dl("procurement", "Download CSV"), table("procurement", outRows(p, "procurement")))}</div></div>`;
}
function stepBuild(p){
  const ap = approved(p);
  return `<p class="sub" data-u="u20">Approved items only. Counts, not percentages. Smartsheet remains the record of field progress; this view is for the design items you approved.</p>
    <div class="grid kpis" data-u="u23">${["Approved","Ordered","Received","Paid"].map(s => `<div class="card kpi"><div class="lbl">${s}</div><div class="val">${ap.filter(x => x.status === s).length}</div></div>`).join("")}</div>
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
    <div class="grid two" data-u="u25"><div class="grid">
      ${card("Priorities and active tasks", `<div class="segctl" role="tablist">${["All", ...TASK_KINDS].map(f => `<button role="tab" aria-selected="${state.filter === f}" data-act="filter" data-v="${f}">${f === "All" ? "All" : f + "s"}</button>`).join("")}</div>`,
        (list.length ? `<div class="rows">${list.map(k => `<div class="row"><div class="top"><div><div class="t" data-u="u14">${esc(k.text)}</div><div class="d">${esc((proj(k.projectId) || {}).address || "No project")} · ${k.due ? esc(k.due) + " (" + (k.confirmed ? "confirmed" : "proposed") + ")" : "no date set"}</div></div>
          <span data-u="u26"><span class="tag${k.due && k.due < t ? " warn" : ""}">${k.due && k.due < t ? "Past date · " : ""}${esc(k.kind)}</span><button class="btn sm sec" data-act="task-done" data-id="${k.id}">Done</button></span></div></div>`).join("")}</div>` : `<div class="empty"><b>Nothing open here</b>Add a task, a client request or a follow-up below.</div>`) +
        `<form id="newtask" class="form" data-u="u7"><label class="full">What needs doing<input class="in" id="t_text" placeholder="e.g. Call the client about the vanity"></label>
          <label>Type<select class="in" id="t_kind">${TASK_KINDS.map(k => `<option>${k}</option>`).join("")}</select></label>
          <label>Project<select class="in" id="t_proj"><option value="">No project</option>${state.projects.map(p => `<option value="${p.id}">${esc(p.address)}</option>`).join("")}</select></label>
          <label>Date<input class="in" id="t_due" type="date"></label><label>Date is<select class="in" id="t_conf"><option value="">Proposed</option><option value="1">Confirmed</option></select></label>
          <div class="full"><button class="btn sm" type="submit">Add</button> <span class="cap">Client requests are typed in by hand. Email is not connected.</span></div></form>`)}
    </div><div class="grid">
      ${card("Decisions waiting on you", `<span class="cap">${dec}</span>`, dec ? `<div class="rows">${state.projects.filter(p => waiting(p)).map(p => `<div class="row"><div class="top"><div><div class="t" data-u="u14">${esc(p.address)}</div><div class="d">${plural(p.options.filter(o => o.status === "In review").length, "design option")} · ${plural(p.selections.filter(s => idx(s) === 1).length, "selection")}</div></div><button class="btn sm" data-act="goto" data-id="${p.id}" data-n="4">Review</button></div></div>`).join("")}</div>` : `<div class="empty"><b>Nothing is waiting</b></div>`)}
      ${card("Deadlines", "", dls.length ? `<div class="rows">${dls.slice(0, 8).map(d => `<div class="row"><div class="top"><div><div class="t" data-u="u14">${esc(d.what)}</div><div class="d">${esc(d.where)} · ${esc(d.kind)}</div></div><span class="tag${d.late ? " warn" : ""}">${esc(d.date)} · ${d.confirmed ? "confirmed" : "proposed"}</span></div></div>`).join("")}</div>` : `<div class="empty"><b>No date is set</b>Dates show as proposed until you mark them confirmed.</div>`)}
      ${card("Projects", `<button class="btn sm sec" data-act="view" data-v="new">New project</button>`, `<div class="rows">${state.projects.map(p => `<div class="row"><div class="top"><div><div class="t" data-u="u14">${esc(p.address)}${p.sample ? ' <span class="tag">made-up sample</span>' : ""}</div><div class="d">${esc(p.id)} · ${esc(p.type)} · step ${p.step} of 8, ${FLOW[p.step - 1]} · ${plural(blockers(p).length, "blocker")} · ${waiting(p)} waiting</div></div><button class="btn sm sec" data-act="goto" data-id="${esc(p.id)}">Open</button></div></div>`).join("")}</div>`)}
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
    <div class="grid">${card("What gets organised", `<span class="cap">development projects</span>`, `<div class="rows">${counts.map(c => `<div class="row" data-u="u15"><div class="top"><span>${c[0]}</span><span class="cap">${c[0] === "Team responsibilities" ? "roles to name + " : ""}${plural(c[1], "item")}</span></div></div>`).join("")}</div>
      <p class="cap" data-u="u12">27 items for a single home, 29 for a subdivision — the existing launch template. A subdivision adds shared infrastructure and cost allocation, kept apart from each house budget.</p>`)}
      ${card("Continue a launch plan", "", `<p class="sub" data-u="u24">Already made a Draft plan with the launch form? Add its file here. The project keeps the same Project ID, and its plan tasks become the checklist.</p>
        <label class="lab">Draft export from the launch form (.json)<input class="in" id="n_import" type="file" accept=".json,application/json"></label><p class="cap" id="n_imp" data-u="u8"></p>`)}
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
      <div class="row"><div class="t" data-u="u14">By hand, today</div><div class="d">Save the image from Higgsfield and add it on the left.</div></div>
      <div class="row"><div class="t" data-u="u14">Through your AI assistant</div><div class="d">Once the Higgsfield connection is authorised for the assistant, it can fetch a design you name and file it in the project you choose. This page does not connect to Higgsfield itself.</div></div>
      <div class="row"><div class="t" data-u="u14">Then</div><div class="d">Attach it to a design option, send the option for review, and approve it in step 4.</div></div></div>`)}</div></div>
    <div data-u="u27"></div>${card("Designs from Higgsfield", `<span class="cap">${all.length}</span>`, all.length ? `<div class="files">${all.map(({ f, x }) => `<button class="file" data-act="open" data-id="${f.id}" title="Open ${esc(f.name)}"><div class="th" data-thumb="${f.type.startsWith("image/") ? f.id : ""}">Rendering</div><div class="m"><div class="n">${esc(f.name)}</div><div class="cap">${esc(x.address)} · ${esc(areaName(x, f.areaId))} · R${f.rev}${f.link ? " · link saved" : ""}</div></div></button>`).join("")}</div>` : `<div class="empty"><b>None yet</b>Designs you add appear here and in the sources of the project.</div>`)}`;
}

/* ============ shell ============ */
function render(){
  const p = P(), dec = state.projects.reduce((n, x) => n + waiting(x), 0);
  $("#nav").innerHTML = AREAS3.map(a => `<button data-act="view" data-v="${a[0]}"${state.view === a[0] ? ' aria-current="page"' : ""}><svg viewBox="0 0 24 24">${ICON[a[0]]}</svg><span>${a[1]}</span>${a[0] === "daily" && dec ? `<span class="n">${dec}</span>` : ""}</button>`).join("") +
    (DASHBOARD ? `<button data-act="dash"><svg viewBox="0 0 24 24">${ICON.menu}</svg><span>Dashboard</span></button>` : "");
  const q = ui.q.trim().toLowerCase();
  $("#plist").innerHTML = state.projects.filter(x => !q || x.address.toLowerCase().includes(q)).map(x => `<button data-act="goto" data-id="${x.id}" aria-current="${state.view === "studio" && x.id === p.id}">${esc(x.address)}<small>${esc(x.type)}${x.sample ? " · made-up sample" : ""}</small></button>`).join("") || `<span class="cap" data-u="u28">No project matches.</span>`;
  $("#storage").textContent = persistent && Files.ok() ? "Saved in this browser on this device." : "Storage is unavailable in this view — work is kept only until the page closes.";
  $("#tabs").innerHTML = [["daily","Daily"],["studio","Studio"],["new","New"]].map(t => `<button data-act="view" data-v="${t[0]}"${state.view === t[0] ? ' aria-current="page"' : ""}><svg viewBox="0 0 24 24">${ICON[t[0]]}</svg><span>${t[1]}</span></button>`).join("") + `<button data-act="menu"><svg viewBox="0 0 24 24">${ICON.menu}</svg><span>Projects</span></button>`;
  $("#view").innerHTML = viewInfo(state.view) + (ui.preview ? `<div class="lightbox" data-act="closeprev" role="dialog" aria-label="Preview of ${esc(ui.preview.name)}"><img alt="${esc(ui.preview.name)}" src="${ui.preview.url}"><span>${esc(ui.preview.name)} — click anywhere to close</span></div>` : ""); ui.msg = "";
  document.title = (state.view === "studio" ? p.address + " — Design Studio" : state.view === "new" ? "New Development Project" : state.view === "higgsfield" ? "Higgsfield designs" : "Daily Workspace") + " — Development OS prototype";
  try { history.replaceState(null, "", "#" + (state.view === "studio" ? "project/" + encodeURIComponent(p.id) + "/" + p.step : state.view)); } catch (e) {}
  loadThumbs();
}
// The top-level views by name. "today" and "daily" are the dashboard: every project in this workspace, by Project ID.
function viewInfo(k){ return k === "studio" ? viewStudio() : k === "new" ? viewNew() : k === "higgsfield" ? viewHiggs() : viewDaily(); }
// Thumbnails and previews use data: addresses, which a strict content policy (img-src 'self' data:) allows; blob: addresses are not needed.
const dataUrl = blob => new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(""); r.readAsDataURL(blob); });
async function loadThumbs(){
  for (const el of document.querySelectorAll("[data-thumb]")) { const id = el.dataset.thumb; if (!id) continue;
    if (!thumbs.has(id)) { const b = await Files.get(id); if (!b) continue; thumbs.set(id, await dataUrl(b)); }
    if (el.isConnected && thumbs.get(id)) el.innerHTML = `<img alt="" src="${thumbs.get(id)}">`; }
}
async function addFiles(list){
  const p = P(), cat = ($("#f_cat") || {}).value || "Reference";
  for (const f of list) { const id = uid(), same = p.files.filter(x => x.areaId === p.areaId && x.name === f.name);
    await Files.put(id, f);
    p.files.push({ id, fid: p.id + "-F-" + pad(++p.seq.F), areaId: p.areaId, name: f.name, cat, size: f.size, type: f.type || "", added: today(), rev: same.length + 1 }); }
  save(); render();
}
function download(name, text, type){ const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
/* ============ launch import ============ */
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
  else if (act === "open") { const b = await Files.get(id); if (!b) return; const meta = state.projects.flatMap(x => x.files).find(f => f.id === id) || { name: "file" };
    if ((b.type || "").startsWith("image/")) { ui.preview = { name: meta.name, url: await dataUrl(b) }; render(); }      // pictures open in the page
    else { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = meta.name; document.body.appendChild(a); a.click(); a.remove(); }   // other files download
    return; }
  else if (act === "closeprev") ui.preview = null;
  else if (act === "brief" || act === "copy") { const el = $("#brief"); el.textContent = brief(p, p.areaId); el.hidden = false;
    if (act === "copy") { try { await navigator.clipboard.writeText(el.textContent); $("#copied").textContent = "Copied."; } catch (x) { $("#copied").textContent = "Select the text to copy it."; } } return; }
  else if (act === "dl") { const k = t.dataset.k || state.out, slug = p.id;
    if (k === "tasks") { if (canExportTasks(p)) download(`${slug}-draft-tasks.json`, taskJson(p), "application/json"); }
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
