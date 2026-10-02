/* ============================================================
   Dumka Student Hub — app logic
   Pattern used everywhere in this file:
     user action (click/submit) -> update an array in memory
     -> save array to localStorage -> re-render that list's HTML
   No framework, no build step. Each section is a small, separate
   set of functions so any one tool can be read on its own.
   ============================================================ */

/* ---------- tiny storage helpers ---------- */
function loadList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
function todayName() {
  return WEEK_DAYS[(new Date().getDay() + 6) % 7]; // Mon-first index
}

/* =========================================================
   HOME
   ========================================================= */
function renderHome() {
  const timetable = loadList("dsh_timetable");
  const alerts = loadList("dsh_alerts");
  const notices = loadList("dsh_notices");
  const lost = loadList("dsh_lostfound");
  const today = todayName();
  const todaysClasses = timetable
    .filter((e) => e.day === today)
    .sort((a, b) => TIME_SLOTS.indexOf(a.slot) - TIME_SLOTS.indexOf(b.slot));

  const nextClass = todaysClasses[0];
  const activeAlerts = alerts.filter((a) => !a.resolved);

  document.getElementById("home-today").textContent = today;
  document.getElementById("home-date").textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  document.getElementById("home-next-class").innerHTML = nextClass
    ? `<div class="big-stat">${esc(nextClass.slot)}</div><div class="stat-label">${esc(nextClass.subject)}${nextClass.room ? " · " + esc(nextClass.room) : ""}</div>`
    : `<div class="stat-label">No classes added for today yet.</div>`;

  document.getElementById("home-alerts").innerHTML = activeAlerts.length
    ? `<div class="big-stat">${activeAlerts.length}</div><div class="stat-label">active local alert${activeAlerts.length > 1 ? "s" : ""} — check Alerts</div>`
    : `<div class="big-stat">0</div><div class="stat-label">No active alerts right now</div>`;

  document.getElementById("home-notices").innerHTML = notices.length
    ? `<div class="big-stat">${notices.length}</div><div class="stat-label">notice${notices.length > 1 ? "s" : ""} on the board</div>`
    : `<div class="stat-label">Notice board is empty.</div>`;

  document.getElementById("home-lost").innerHTML = lost.length
    ? `<div class="big-stat">${lost.length}</div><div class="stat-label">lost &amp; found post${lost.length > 1 ? "s" : ""}</div>`
    : `<div class="stat-label">No lost &amp; found posts.</div>`;
}

/* =========================================================
   TIMETABLE
   ========================================================= */
function renderTimetable() {
  const timetable = loadList("dsh_timetable");
  const today = todayName();
  const head = `<tr><th>Time</th>${WEEK_DAYS.map((d) => `<th class="${d === today ? "today-col" : ""}">${d.slice(0, 3)}</th>`).join("")}</tr>`;
  const rows = TIME_SLOTS.map((slot) => {
    const cells = WEEK_DAYS.map((day) => {
      const entries = timetable.filter((e) => e.day === day && e.slot === slot);
      const cellHtml = entries.map((e) => `
        <div class="slot-entry">${esc(e.subject)}${e.room ? ` <span class="muted">(${esc(e.room)})</span>` : ""}
          <button type="button" class="slot-del" data-del-id="${e.id}">remove</button>
        </div>`).join("");
      return `<td class="${day === today ? "today-col" : ""}">${cellHtml}</td>`;
    }).join("");
    return `<tr><th>${slot}</th>${cells}</tr>`;
  }).join("");

  document.getElementById("timetable-table").innerHTML = head + rows;
}

function initTimetable() {
  const slotSel = document.getElementById("tt-slot");
  slotSel.innerHTML = TIME_SLOTS.map((s) => `<option value="${s}">${s}</option>`).join("");
  const daySel = document.getElementById("tt-day");
  daySel.innerHTML = WEEK_DAYS.map((d) => `<option value="${d}">${d}</option>`).join("");

  document.getElementById("tt-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const subject = document.getElementById("tt-subject").value.trim();
    if (!subject) return;
    const timetable = loadList("dsh_timetable");
    timetable.push({
      id: uid(),
      day: daySel.value,
      slot: slotSel.value,
      subject,
      room: document.getElementById("tt-room").value.trim(),
    });
    saveList("dsh_timetable", timetable);
    document.getElementById("tt-subject").value = "";
    document.getElementById("tt-room").value = "";
    renderTimetable();
    renderHome();
  });

  document.getElementById("timetable-table").addEventListener("click", (ev) => {
    const id = ev.target.dataset.delId;
    if (!id) return;
    const timetable = loadList("dsh_timetable").filter((e) => e.id !== id);
    saveList("dsh_timetable", timetable);
    renderTimetable();
    renderHome();
  });

  renderTimetable();
}

/* =========================================================
   TRANSPORT (static sample data, just search/filter)
   ========================================================= */
function renderTransport(filterText) {
  const q = (filterText || "").toLowerCase();
  const rows = TRANSPORT_DATA.filter((r) =>
    !q || r.route.toLowerCase().includes(q) || r.mode.toLowerCase().includes(q)
  );
  document.getElementById("transport-list").innerHTML = rows.length
    ? rows.map((r) => `
      <div class="row-item">
        <div class="col-main">
          <div class="row-title"><span class="row-tag">${esc(r.mode)}</span>${esc(r.route)}</div>
          <div class="row-sub">${esc(r.via)}</div>
        </div>
        <div class="col-meta">${esc(r.depart)}<br>${esc(r.duration)}</div>
      </div>`).join("")
    : `<div class="empty">No routes match that search.</div>`;
}

function initTransport() {
  document.getElementById("transport-search").addEventListener("input", (ev) => {
    renderTransport(ev.target.value);
  });
  renderTransport("");
}

/* =========================================================
   LOCAL ALERTS (power cut, water supply, road block, etc.)
   ========================================================= */
function renderAlerts() {
  const alerts = loadList("dsh_alerts").sort((a, b) => b.ts - a.ts);
  document.getElementById("alerts-list").innerHTML = alerts.length
    ? alerts.map((a) => `
      <div class="row-item">
        <div class="col-main">
          <div class="row-title">
            <span class="row-tag ${a.resolved ? "" : "urgent"}">${a.resolved ? "Resolved" : "Active"}</span>
            ${esc(a.title)}
          </div>
          <div class="row-sub">${esc(a.area)} — ${esc(a.detail)}</div>
        </div>
        <div class="col-meta">
          <button class="btn btn-outline btn-small" data-toggle-alert="${a.id}">${a.resolved ? "Mark active" : "Mark resolved"}</button>
        </div>
      </div>`).join("")
    : `<div class="empty">No alerts posted. If the power or water is out, post it so others know.</div>`;
}

function initAlerts() {
  document.getElementById("alert-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const title = document.getElementById("alert-title").value.trim();
    if (!title) return;
    const alerts = loadList("dsh_alerts");
    alerts.push({
      id: uid(),
      title,
      area: document.getElementById("alert-area").value.trim() || "Unspecified area",
      detail: document.getElementById("alert-detail").value.trim(),
      resolved: false,
      ts: Date.now(),
    });
    saveList("dsh_alerts", alerts);
    ev.target.reset();
    renderAlerts();
    renderHome();
  });

  document.getElementById("alerts-list").addEventListener("click", (ev) => {
    const id = ev.target.dataset.toggleAlert;
    if (!id) return;
    const alerts = loadList("dsh_alerts");
    const a = alerts.find((x) => x.id === id);
    if (a) a.resolved = !a.resolved;
    saveList("dsh_alerts", alerts);
    renderAlerts();
    renderHome();
  });

  renderAlerts();
}

/* =========================================================
   NEARBY ESSENTIALS (static sample directory, filter by category)
   ========================================================= */
function renderEssentials(cat) {
  const rows = ESSENTIALS_DATA.filter((e) => !cat || cat === "All" || e.category === cat);
  document.getElementById("essentials-list").innerHTML = rows.length
    ? rows.map((e) => `
      <div class="row-item">
        <div class="col-main">
          <div class="row-title"><span class="row-tag">${esc(e.category)}</span>${esc(e.name)}</div>
          <div class="row-sub">${esc(e.locality)}${e.note ? " — " + esc(e.note) : ""}</div>
        </div>
        <div class="col-meta">${esc(e.hours)}</div>
      </div>`).join("")
    : `<div class="empty">Nothing in this category yet.</div>`;
}

function initEssentials() {
  const cats = ["All", ...new Set(ESSENTIALS_DATA.map((e) => e.category))];
  const sel = document.getElementById("essentials-filter");
  sel.innerHTML = cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  sel.addEventListener("change", (ev) => renderEssentials(ev.target.value));
  renderEssentials("All");
}

/* =========================================================
   MESS MENU & COMPLAINTS
   ========================================================= */
function renderMess() {
  document.getElementById("mess-menu-table").innerHTML = MESS_MENU_DEFAULT.map((d) => `
    <tr>
      <th>${esc(d.day)}</th>
      <td>${esc(d.breakfast)}</td>
      <td>${esc(d.lunch)}</td>
      <td>${esc(d.dinner)}</td>
    </tr>`).join("");

  const complaints = loadList("dsh_messComplaints").sort((a, b) => b.ts - a.ts);
  document.getElementById("mess-complaints-list").innerHTML = complaints.length
    ? complaints.map((c) => `
      <div class="row-item">
        <div class="col-main">
          <div class="row-title">${esc(c.text)}</div>
          <div class="row-sub">${new Date(c.ts).toLocaleDateString("en-IN")}</div>
        </div>
      </div>`).join("")
    : `<div class="empty">No complaints logged.</div>`;
}

function initMess() {
  document.getElementById("mess-complaint-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const text = document.getElementById("mess-complaint-text").value.trim();
    if (!text) return;
    const complaints = loadList("dsh_messComplaints");
    complaints.push({ id: uid(), text, ts: Date.now() });
    saveList("dsh_messComplaints", complaints);
    ev.target.reset();
    renderMess();
  });
  renderMess();
}

/* =========================================================
   NOTES EXCHANGE
   ========================================================= */
function renderNotes() {
  const notes = loadList("dsh_notes").sort((a, b) => b.ts - a.ts);
  document.getElementById("notes-list").innerHTML = notes.length
    ? notes.map((n) => `
      <div class="row-item">
        <div class="col-main">
          <div class="row-title">${esc(n.subject)} <span class="row-tag">${esc(n.semester)}</span></div>
          <div class="row-sub">${esc(n.description)}</div>
          <div class="row-sub">Contact: ${esc(n.contact)}</div>
        </div>
        <div class="col-meta">
          <button class="btn btn-outline btn-small" data-del-note="${n.id}">Remove</button>
        </div>
      </div>`).join("")
    : `<div class="empty">No notes posted yet. Share your notes to help someone out.</div>`;
}

function initNotes() {
  document.getElementById("note-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const subject = document.getElementById("note-subject").value.trim();
    const contact = document.getElementById("note-contact").value.trim();
    if (!subject || !contact) return;
    const notes = loadList("dsh_notes");
    notes.push({
      id: uid(),
      subject,
      semester: document.getElementById("note-semester").value.trim() || "Any sem",
      description: document.getElementById("note-description").value.trim(),
      contact,
      ts: Date.now(),
    });
    saveList("dsh_notes", notes);
    ev.target.reset();
    renderNotes();
  });

  document.getElementById("notes-list").addEventListener("click", (ev) => {
    const id = ev.target.dataset.delNote;
    if (!id) return;
    saveList("dsh_notes", loadList("dsh_notes").filter((n) => n.id !== id));
    renderNotes();
  });

  renderNotes();
}

/* =========================================================
   LOST & FOUND
   ========================================================= */
function renderLostFound() {
  const posts = loadList("dsh_lostfound").sort((a, b) => b.ts - a.ts);
  document.getElementById("lostfound-list").innerHTML = posts.length
    ? posts.map((p) => `
      <div class="row-item">
        <div class="col-main">
          <div class="row-title"><span class="row-tag ${p.type === "Lost" ? "urgent" : ""}">${esc(p.type)}</span>${esc(p.item)}</div>
          <div class="row-sub">${esc(p.place)} — ${esc(p.contact)}</div>
        </div>
        <div class="col-meta">
          <button class="btn btn-outline btn-small" data-del-lf="${p.id}">Remove</button>
        </div>
      </div>`).join("")
    : `<div class="empty">Nothing posted yet.</div>`;
}

function initLostFound() {
  document.getElementById("lf-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const item = document.getElementById("lf-item").value.trim();
    const contact = document.getElementById("lf-contact").value.trim();
    if (!item || !contact) return;
    const posts = loadList("dsh_lostfound");
    posts.push({
      id: uid(),
      type: document.getElementById("lf-type").value,
      item,
      place: document.getElementById("lf-place").value.trim(),
      contact,
      ts: Date.now(),
    });
    saveList("dsh_lostfound", posts);
    ev.target.reset();
    renderLostFound();
    renderHome();
  });

  document.getElementById("lostfound-list").addEventListener("click", (ev) => {
    const id = ev.target.dataset.delLf;
    if (!id) return;
    saveList("dsh_lostfound", loadList("dsh_lostfound").filter((p) => p.id !== id));
    renderLostFound();
    renderHome();
  });

  renderLostFound();
}

/* =========================================================
   NOTICE BOARD
   ========================================================= */
function renderNotices() {
  const notices = loadList("dsh_notices").sort((a, b) => b.ts - a.ts);
  document.getElementById("notices-list").innerHTML = notices.length
    ? notices.map((n) => `
      <div class="row-item">
        <div class="col-main">
          <div class="row-title">${esc(n.title)}</div>
          <div class="row-sub">${esc(n.detail)}</div>
          <div class="row-sub">${new Date(n.ts).toLocaleDateString("en-IN")}</div>
        </div>
        <div class="col-meta">
          <button class="btn btn-outline btn-small" data-del-notice="${n.id}">Remove</button>
        </div>
      </div>`).join("")
    : `<div class="empty">No notices posted.</div>`;
}

function initNotices() {
  document.getElementById("notice-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const title = document.getElementById("notice-title").value.trim();
    if (!title) return;
    const notices = loadList("dsh_notices");
    notices.push({ id: uid(), title, detail: document.getElementById("notice-detail").value.trim(), ts: Date.now() });
    saveList("dsh_notices", notices);
    ev.target.reset();
    renderNotices();
    renderHome();
  });

  document.getElementById("notices-list").addEventListener("click", (ev) => {
    const id = ev.target.dataset.delNotice;
    if (!id) return;
    saveList("dsh_notices", loadList("dsh_notices").filter((n) => n.id !== id));
    renderNotices();
    renderHome();
  });

  renderNotices();
}

/* =========================================================
   EXPENSE TRACKER
   ========================================================= */
function renderExpenses() {
  const expenses = loadList("dsh_expenses").sort((a, b) => b.ts - a.ts);
  const now = new Date();
  const monthTotal = expenses
    .filter((e) => {
      const d = new Date(e.ts);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  document.getElementById("expense-month-total").textContent = "₹" + monthTotal.toLocaleString("en-IN");

  document.getElementById("expenses-list").innerHTML = expenses.length
    ? expenses.map((e) => `
      <div class="row-item">
        <div class="col-main">
          <div class="row-title"><span class="row-tag">${esc(e.category)}</span>${esc(e.note || "—")}</div>
          <div class="row-sub">${new Date(e.ts).toLocaleDateString("en-IN")}</div>
        </div>
        <div class="col-meta">₹${e.amount.toLocaleString("en-IN")}
          <br><button class="btn btn-outline btn-small" data-del-exp="${e.id}">Remove</button>
        </div>
      </div>`).join("")
    : `<div class="empty">No expenses logged yet.</div>`;
}

function initExpenses() {
  document.getElementById("expense-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const amount = parseFloat(document.getElementById("expense-amount").value);
    if (!amount || amount <= 0) return;
    const expenses = loadList("dsh_expenses");
    expenses.push({
      id: uid(),
      amount,
      category: document.getElementById("expense-category").value,
      note: document.getElementById("expense-note").value.trim(),
      ts: Date.now(),
    });
    saveList("dsh_expenses", expenses);
    ev.target.reset();
    renderExpenses();
  });

  document.getElementById("expenses-list").addEventListener("click", (ev) => {
    const id = ev.target.dataset.delExp;
    if (!id) return;
    saveList("dsh_expenses", loadList("dsh_expenses").filter((e) => e.id !== id));
    renderExpenses();
  });

  renderExpenses();
}

/* =========================================================
   DEADLINES (scholarship / fee / exam form dates)
   ========================================================= */
function renderDeadlines() {
  const deadlines = loadList("dsh_deadlines").sort((a, b) => new Date(a.date) - new Date(b.date));
  const todayMs = new Date().setHours(0, 0, 0, 0);

  document.getElementById("deadlines-list").innerHTML = deadlines.length
    ? deadlines.map((d) => {
        const diffDays = Math.round((new Date(d.date).setHours(0, 0, 0, 0) - todayMs) / 86400000);
        const label = diffDays < 0 ? "Past" : diffDays === 0 ? "Today" : `${diffDays}d`;
        return `
      <div class="row-item">
        <div class="deadline-days ${diffDays <= 3 ? "soon" : ""}">${label}</div>
        <div class="col-main">
          <div class="row-title">${esc(d.title)}</div>
          <div class="row-sub">Due ${new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
        </div>
        <div class="col-meta">
          <button class="btn btn-outline btn-small" data-del-dl="${d.id}">Remove</button>
        </div>
      </div>`;
      }).join("")
    : `<div class="empty">No deadlines tracked yet.</div>`;
}

function initDeadlines() {
  document.getElementById("deadline-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const title = document.getElementById("deadline-title").value.trim();
    const date = document.getElementById("deadline-date").value;
    if (!title || !date) return;
    const deadlines = loadList("dsh_deadlines");
    deadlines.push({ id: uid(), title, date });
    saveList("dsh_deadlines", deadlines);
    ev.target.reset();
    renderDeadlines();
  });

  document.getElementById("deadlines-list").addEventListener("click", (ev) => {
    const id = ev.target.dataset.delDl;
    if (!id) return;
    saveList("dsh_deadlines", loadList("dsh_deadlines").filter((d) => d.id !== id));
    renderDeadlines();
  });

  renderDeadlines();
}

/* =========================================================
   EMERGENCY CONTACTS (static + a couple of fill-in-yourself rows)
   ========================================================= */
function renderContacts() {
  document.getElementById("contacts-list").innerHTML = EMERGENCY_CONTACTS.map((c) => `
    <div class="row-item">
      <div class="col-main">
        <div class="row-title">${esc(c.name)}</div>
        <div class="row-sub">${esc(c.note)}</div>
      </div>
      <div class="col-meta">
        ${/^[0-9]+$/.test(c.number)
          ? `<a class="contact-call" href="tel:${c.number}">Call ${esc(c.number)}</a>`
          : `<span class="muted">${esc(c.number)}</span>`}
      </div>
    </div>`).join("");
}

/* =========================================================
   Routing / navigation
   ========================================================= */
const ROUTE_TITLES = {
  home: "Home",
  timetable: "Class Timetable",
  transport: "Bus & Train Times",
  alerts: "Local Alerts",
  essentials: "Nearby Essentials",
  mess: "Mess Menu & Complaints",
  notes: "Notes Exchange",
  lostfound: "Lost & Found",
  notices: "Notice Board",
  expenses: "Expense Tracker",
  deadlines: "Deadlines",
  contacts: "Emergency Contacts",
};

function navigate(route) {
  if (route === "more") {
    openSheet();
    return;
  }
  document.querySelectorAll(".section").forEach((s) => s.classList.toggle("active", s.id === "sec-" + route));
  document.querySelectorAll(".sidebar-link").forEach((b) => b.classList.toggle("active", b.dataset.route === route));
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.route === route));
  document.getElementById("topbarSection").textContent = ROUTE_TITLES[route] || "";
  closeSheet();
  window.scrollTo({ top: 0 });
}

function openSheet() {
  document.getElementById("moreSheet").classList.add("open");
  document.getElementById("sheetOverlay").classList.add("open");
}
function closeSheet() {
  document.getElementById("moreSheet").classList.remove("open");
  document.getElementById("sheetOverlay").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  buildSections();
  document.querySelectorAll("[data-route]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.route));
  });
  document.getElementById("sheetOverlay").addEventListener("click", closeSheet);

  initTimetable();
  initTransport();
  initAlerts();
  initEssentials();
  initMess();
  initNotes();
  initLostFound();
  initNotices();
  initExpenses();
  initDeadlines();
  renderContacts();
  renderHome();

  navigate("home");
});

/* =========================================================
   Build the static HTML shell for every section once at load.
   Keeping markup as plain strings here (rather than 12 separate
   HTML files) keeps the whole app a single page with one router.
   ========================================================= */
function buildSections() {
  const content = document.getElementById("content");
  content.innerHTML = `

  <section class="section" id="sec-home">
    <div class="dash-greeting">
      <h1>Namaste 👋</h1>
      <p class="date-line"><span id="home-today"></span> · <span id="home-date"></span></p>
    </div>
    <div class="dash-grid">
      <div class="dash-card"><h3>Next class today</h3><div id="home-next-class"></div></div>
      <div class="dash-card"><h3>Local alerts</h3><div id="home-alerts"></div></div>
      <div class="dash-card"><h3>Notice board</h3><div id="home-notices"></div></div>
      <div class="dash-card"><h3>Lost &amp; found</h3><div id="home-lost"></div></div>
    </div>
    <div class="quick-links">
      <button class="quick-link" data-route="transport">Bus/Train</button>
      <button class="quick-link" data-route="essentials">Nearby shops</button>
      <button class="quick-link" data-route="mess">Mess menu</button>
      <button class="quick-link" data-route="expenses">Expenses</button>
      <button class="quick-link" data-route="deadlines">Deadlines</button>
      <button class="quick-link" data-route="notes">Notes exchange</button>
      <button class="quick-link" data-route="lostfound">Lost &amp; found</button>
      <button class="quick-link" data-route="contacts">Emergency</button>
    </div>
  </section>

  <section class="section" id="sec-timetable">
    <div class="section-head"><h1>Class Timetable</h1><p>Your own weekly schedule, saved on this device.</p></div>
    <div class="panel">
      <form id="tt-form">
        <div class="field-row">
          <div class="field"><label for="tt-day">Day</label><select id="tt-day"></select></div>
          <div class="field"><label for="tt-slot">Time</label><select id="tt-slot"></select></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="tt-subject">Subject</label><input id="tt-subject" type="text" placeholder="e.g. BSM02" required /></div>
          <div class="field"><label for="tt-room">Room (optional)</label><input id="tt-room" type="text" placeholder="e.g. Block A-2" /></div>
        </div>
        <button class="btn" type="submit">Add to timetable</button>
      </form>
    </div>
    <div class="timetable-wrap">
      <table class="timetable" id="timetable-table"></table>
    </div>
  </section>

  <section class="section" id="sec-transport">
    <div class="section-head"><h1>Bus &amp; Train Times</h1><p>Dumka's main routes, in one place.</p></div>
    <span class="sample-flag">Sample schedule for this demo — confirm exact timing at the stand/station</span>
    <div class="panel">
      <div class="field"><label for="transport-search">Search a route</label><input id="transport-search" type="text" placeholder="e.g. Ranchi, Rampurhat, Bus" /></div>
    </div>
    <div class="row-list" id="transport-list"></div>
  </section>

  <section class="section" id="sec-alerts">
    <div class="section-head"><h1>Local Alerts</h1><p>Power cuts, water supply, road blocks — post it so others know.</p></div>
    <div class="panel">
      <form id="alert-form">
        <div class="field-row">
          <div class="field"><label for="alert-title">What's happening</label><input id="alert-title" type="text" placeholder="e.g. Power cut" required /></div>
          <div class="field"><label for="alert-area">Area</label><input id="alert-area" type="text" placeholder="e.g. Shivpahari" /></div>
        </div>
        <div class="field"><label for="alert-detail">Detail (optional)</label><input id="alert-detail" type="text" placeholder="e.g. Since 6 PM, maintenance work" /></div>
        <button class="btn" type="submit">Post alert</button>
      </form>
    </div>
    <div class="row-list" id="alerts-list"></div>
  </section>

  <section class="section" id="sec-essentials">
    <div class="section-head"><h1>Nearby Essentials</h1><p>Printing, pharmacy, budget food and more, near campus.</p></div>
    <span class="sample-flag">Sample directory for this demo — names/numbers are placeholders</span>
    <div class="panel">
      <div class="field"><label for="essentials-filter">Category</label><select id="essentials-filter"></select></div>
    </div>
    <div class="row-list" id="essentials-list"></div>
  </section>

  <section class="section" id="sec-mess">
    <div class="section-head"><h1>Mess Menu &amp; Complaints</h1><p>This week's menu, and a place to log mess issues.</p></div>
    <div class="timetable-wrap">
      <table class="timetable">
        <tr><th>Day</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th></tr>
        <tbody id="mess-menu-table"></tbody>
      </table>
    </div>
    <div class="panel mt16">
      <form id="mess-complaint-form">
        <div class="field"><label for="mess-complaint-text">Report an issue</label><input id="mess-complaint-text" type="text" placeholder="e.g. Dinner was cold, 2 Oct" required /></div>
        <button class="btn" type="submit">Log complaint</button>
      </form>
    </div>
    <h2 class="mt16">Logged complaints</h2>
    <div class="row-list" id="mess-complaints-list"></div>
  </section>

  <section class="section" id="sec-notes">
    <div class="section-head"><h1>Notes Exchange</h1><p>Share or find notes, PDFs and reference material from other students.</p></div>
    <div class="panel">
      <form id="note-form">
        <div class="field-row">
          <div class="field"><label for="note-subject">Subject</label><input id="note-subject" type="text" placeholder="e.g. BSC02 Chemistry" required /></div>
          <div class="field"><label for="note-semester">Semester</label><input id="note-semester" type="text" placeholder="e.g. 2nd sem" /></div>
        </div>
        <div class="field"><label for="note-description">What you're sharing / looking for</label><input id="note-description" type="text" placeholder="e.g. Handwritten unit 3 notes, scanned PDF" /></div>
        <div class="field"><label for="note-contact">Your contact (so people can reach you)</label><input id="note-contact" type="text" placeholder="e.g. WhatsApp number or email" required /></div>
        <button class="btn" type="submit">Post</button>
      </form>
    </div>
    <div class="row-list" id="notes-list"></div>
  </section>

  <section class="section" id="sec-lostfound">
    <div class="section-head"><h1>Lost &amp; Found</h1><p>Lost an ID card or found a bag on campus? Post it here.</p></div>
    <div class="panel">
      <form id="lf-form">
        <div class="field-row">
          <div class="field"><label for="lf-type">Type</label>
            <select id="lf-type"><option value="Lost">Lost</option><option value="Found">Found</option></select>
          </div>
          <div class="field"><label for="lf-item">Item</label><input id="lf-item" type="text" placeholder="e.g. Blue water bottle" required /></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="lf-place">Place</label><input id="lf-place" type="text" placeholder="e.g. Library, 2nd floor" /></div>
          <div class="field"><label for="lf-contact">Contact</label><input id="lf-contact" type="text" placeholder="e.g. phone/room no." required /></div>
        </div>
        <button class="btn" type="submit">Post</button>
      </form>
    </div>
    <div class="row-list" id="lostfound-list"></div>
  </section>

  <section class="section" id="sec-notices">
    <div class="section-head"><h1>Notice Board</h1><p>Campus notices, event info, deadlines worth sharing with everyone.</p></div>
    <div class="panel">
      <form id="notice-form">
        <div class="field"><label for="notice-title">Title</label><input id="notice-title" type="text" placeholder="e.g. Annual sports day, 10 Oct" required /></div>
        <div class="field"><label for="notice-detail">Detail</label><input id="notice-detail" type="text" placeholder="Optional details" /></div>
        <button class="btn" type="submit">Post notice</button>
      </form>
    </div>
    <div class="row-list" id="notices-list"></div>
  </section>

  <section class="section" id="sec-expenses">
    <div class="section-head"><h1>Expense Tracker</h1><p>Keep an eye on hostel-life spending.</p></div>
    <div class="panel">
      <div class="expense-total"><span>This month</span><span class="amt" id="expense-month-total">₹0</span></div>
      <form id="expense-form">
        <div class="field-row">
          <div class="field"><label for="expense-amount">Amount (₹)</label><input id="expense-amount" type="number" min="1" step="1" required /></div>
          <div class="field"><label for="expense-category">Category</label>
            <select id="expense-category">
              <option>Food</option><option>Travel</option><option>Stationery</option>
              <option>Hostel/Mess</option><option>Recharge</option><option>Other</option>
            </select>
          </div>
        </div>
        <div class="field"><label for="expense-note">Note (optional)</label><input id="expense-note" type="text" placeholder="e.g. Bus to Ranchi" /></div>
        <button class="btn" type="submit">Add expense</button>
      </form>
    </div>
    <div class="row-list" id="expenses-list"></div>
  </section>

  <section class="section" id="sec-deadlines">
    <div class="section-head"><h1>Deadlines</h1><p>Scholarship forms, fee payment, exam registration — don't miss the date.</p></div>
    <div class="panel">
      <form id="deadline-form">
        <div class="field-row">
          <div class="field"><label for="deadline-title">What's due</label><input id="deadline-title" type="text" placeholder="e.g. Scholarship form submission" required /></div>
          <div class="field"><label for="deadline-date">Due date</label><input id="deadline-date" type="date" required /></div>
        </div>
        <button class="btn" type="submit">Track it</button>
      </form>
    </div>
    <div class="row-list" id="deadlines-list"></div>
  </section>

  <section class="section" id="sec-contacts">
    <div class="section-head"><h1>Emergency Contacts</h1><p>Numbers worth saving before you need them.</p></div>
    <div class="row-list" id="contacts-list"></div>
  </section>

  `;
}
