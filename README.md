# Dumka Student Hub

A single mobile-first website that bundles the small, repetitive problems of
daily student life in Dumka — "when's the next bus," "is the power out,"
"where do I get this printed," "who do I call" — into one place, instead of
ten different group-chat messages.

## How It Works

**What it does.** Dumka Student Hub is a utility site for students in Dumka
(studying at places like SKMU or the local engineering college). It covers
11 everyday tools: class timetable, bus/train times, local alerts, nearby
essentials, mess menu & complaints, notes exchange, lost & found, notice
board, expense tracker, deadline tracker, and emergency contacts.

**Main user flow.**
```
Student opens the site on their phone
→ bottom tab bar: Home / Classes / Alerts / Nearby / More
→ Home shows today's next class, active alerts, and notice/lost&found counts
→ taps into any tool (e.g. Alerts) to read or post something
→ data is saved on their own device, so it's still there next visit
```

**Main technical implementation.**
- Plain HTML, CSS and JavaScript — no framework, no build step, no server.
- `index.html` holds the page shell: top bar, desktop sidebar, mobile bottom
  tab bar, and a "More" sheet for the tools that don't fit the tab bar.
- `js/app.js` builds the 12 section panels once, then routes between them
  by toggling a CSS class — one `navigate(route)` function for the whole
  site. Every list (alerts, notices, notes, lost & found, expenses,
  deadlines, timetable, mess complaints) follows the same small pattern:
  user submits a form → push into an array → save the array to
  `localStorage` → re-render that list's HTML.
- `js/data.js` holds the static sample data for bus/train times, the
  nearby-shops directory, the mess menu, and emergency numbers. These are
  clearly labelled as sample data in the UI — a real deployment would have
  a college office or transport union supply and update them.
- `css/style.css` defines the look: a warm paper background, a serif
  display face for headings, a turmeric accent and a forest-green
  secondary color, hairline borders instead of card shadows. Mobile is the
  default layout (bottom tab bar); past 900px wide, a left sidebar replaces
  the tab bar and the content area gets more breathing room.

**Why this architecture.** The product only needs small, independent lists
of local information — it doesn't need a backend, a database, or a state
library. Keeping everything in one HTML file + one CSS file + one JS file
means any teammate can open `app.js`, find the one function for the tool
they're asked about, and explain it in under a minute.

## Running it

No install needed. Open `index.html` directly in a browser, or serve the
folder with any static server, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Data & privacy note

All user-submitted content (timetable entries, alerts, notes, lost & found
posts, notices, expenses, deadlines, mess complaints) is stored only in the
browser's `localStorage` on that device — nothing is sent to a server. That
keeps the demo self-contained, but it also means posts aren't shared
between different students' phones yet (see "What we'd build next" below).

---

## JUDGE CHEAT SHEET

**What problem are we solving?**
Daily student life in a smaller town like Dumka runs on scattered
WhatsApp messages and word of mouth — bus times, power cuts, lost IDs,
mess complaints, notes sharing. This puts it all in one site.

**Who is it for?**
A college student in Dumka (e.g. SKMU or Dumka Engineering College) who
needs quick, mobile answers between classes.

**Main demo flow**
1. Open the site on a phone-sized screen — land on Home.
2. Tap "Classes," add a class to the timetable — it shows up as "Next
   class" on Home.
3. Tap "Alerts," post a power-cut alert — Home's alert count updates.
4. Tap "More → Lost & Found," post a lost item.
5. Tap "Nearby," filter the essentials directory by category (e.g.
   Pharmacy).
6. Resize the browser wide — the bottom tab bar becomes a left sidebar,
   same data, same app.

**Tech stack**
Plain HTML, CSS, JavaScript. `localStorage` for persistence. No
framework, no backend, no build step.

**How the main implementation works**
- One router function (`navigate`) switches between 12 pre-built section
  panels.
- One storage pattern (`loadList` / `saveList`) backs every list-based
  tool — timetable, alerts, notes, lost & found, notices, expenses,
  deadlines, mess complaints.
- Static reference data (transport, essentials, emergency numbers, mess
  menu) lives in one file, clearly flagged in the UI as sample data.
- Mobile bottom-tab navigation is primary; a sidebar is swapped in above
  900px via a CSS media query — same markup, no separate mobile build.

**One interesting technical decision**
Rather than one bottom-tab item per tool (which wouldn't fit 11 tools on
a small screen), the 4 tools used most often during a normal day (Home,
Classes, Alerts, Nearby) sit directly on the tab bar, and the rest live
behind a single "More" sheet — so the primary actions stay one tap away
without crowding the thumb-reachable zone.

**What we would build next**
- A shared backend (even a lightweight one) so alerts, notices, and lost
  & found posts are visible across everyone's phones, not just the
  device that posted them.
- Replace the sample transport/essentials data with a real, maintained
  listing (ideally supplied by a student body or local transport union).
- Push notifications for new local alerts and upcoming deadlines.
