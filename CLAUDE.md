# CLAUDE.md — Project Operating Instructions

This file is loaded into context at the start of every Claude Code session. **Read it first.**

## What this project is

An interactive **executive competitive-intelligence dashboard** comparing **Marriott Vacations Worldwide (MVW / NYSE: VAC)** against its two largest pure-play timeshare peers, anchored on **Q2 2026 earnings results** (quarter ended June 30, 2026):

- **Travel + Leisure Co. (TNL)** — released Jul 22, 2026
- **Hilton Grand Vacations (HGV)** — released Jul 30, 2026
- **MVW** — released Aug 6, 2026

The dashboard is a static, single-page web app (HTML / CSS / vanilla JS) served from GitHub Pages. It is intended for use by executives evaluating quarterly market position, growth catalysts, and risk exposure.

Repo: https://github.com/jeffersonbauer/mvw2026q2
Live site: https://jeffersonbauer.github.io/mvw2026q2/

This project is the **Q2 2026 successor** to the Q1 2026 dashboard (https://github.com/jeffersonbauer/mvw2026q1) and the FY2025 dashboard (https://github.com/jeffersonbauer/mvw) — same layout, tabs, structure, fonts and styling, with Q2 data and a Q2-specific overview page. New in this edition: period-specific copy is data-driven (see DECISIONS.md).

## Source-of-truth rules (read every time)

1. **Facts come from primary documents.** Acceptable sources for figures, KPIs, segment data, risk language, and corporate facts are:
   - Q2 2026 earnings press releases (8-K Exhibit 99.1) on SEC EDGAR
   - Q2 2026 Form 10-Q filings on SEC EDGAR
   - Q2 2026 earnings-call transcripts (company-posted preferred; Motley Fool / other transcript services acceptable)
   - Other SEC EDGAR filings (10-K, 8-K, DEF 14A, 13D) for VAC, HGV, TNL
   - The companies' official investor-relations websites
   - Yahoo Finance closing prices — **only** for the market-cap / share-price panel and the live topbar quotes
2. **Never fabricate.** If a number is not in a filing or on the company's site, **do not invent or estimate**. Use `value: null` with a `note` (and optional `display`) in `js/data.js`, or ask the user. Calculated values must say "calculated from disclosed inputs" in `source` (and use the `calc:` field).
3. **Cite the source.** Every figure in `js/data.js` must include the source (e.g., `"MVW Q2 2026 release, Table A-1"`, `"HGV Q2 2026 call (Mathewes)"`, `"TNL Q2 2026 10-Q, Note 6"`).
4. **Date-stamp the snapshot.** `meta.lastUpdated` and each company's `fiscal.releaseDate` must be current.
5. **Secondary sources (consensus estimates, news summaries) are not facts.** Use them only as narrative context and label them as such.

## Required file maintenance — read this every session

There are **three governance files** in the repo root. Treat them as the project's working memory. **Always update them when conversational instructions change scope, design, or architecture.**

| File | When to update | Read before |
|---|---|---|
| `DECISIONS.md` | The user changes architecture, data shape, file structure, framework, or build approach | Changing architecture or data shape |
| `DESIGN.md` | The user changes color palette, typography, component patterns, layout primitives, or UX behavior | Touching colors, fonts, or component patterns |
| `REQUIREMENTS.md` | The user adds/removes a feature, view, KPI, or company; clarifies in/out of scope | Adding any feature |

**Rule:** when the user gives an instruction in conversation that would land in one of those buckets, append it to the corresponding file (with the date) **before** implementing. If you implement first and forget to log it, log it before ending the turn.

## Workflow when starting a new session

1. Read `DECISIONS.md`, `DESIGN.md`, `REQUIREMENTS.md` in that order.
2. Read this file (`CLAUDE.md`).
3. Skim `js/data.js` to refresh which fiscal period is loaded.
4. Then begin work.

**Specifically:**
- **Before changing architecture or data shape → check `DECISIONS.md`.**
- **Before touching colors, fonts, or component patterns → check `DESIGN.md`.**
- **Before adding features → check `REQUIREMENTS.md` for what's in/out of scope.**
- **Don't fabricate figures — if a number isn't in the source files or the docs, ask.**

## Workflow when the user gives a new instruction

1. Classify it: architecture (→ DECISIONS), design (→ DESIGN), scope (→ REQUIREMENTS), or implementation only (no log needed).
2. If logged, append a dated bullet under the relevant section. Use today's date in `YYYY-MM-DD` format.
3. Implement.
4. If the implementation differed from what was planned, update the log entry with the actual outcome.

## Tech stack (locked — see DECISIONS.md before changing)

- **No build step.** Plain HTML, CSS, vanilla JS. Open `index.html` in a browser or serve with `python3 -m http.server`.
- **Charts:** Chart.js via CDN.
- **Maps:** Leaflet via CDN with Esri World Light Gray Canvas tiles (no API key).
- **Styling:** Custom CSS — no Tailwind, no preprocessors. Design tokens live as CSS custom properties in `css/main.css`.
- **Data:** All facts live in `js/data.js`. One module, one global (`window.MVW_DATA`). Per-company shape is documented at the top of that file.

## Data shape note (Q2 edition)

- **`meta.periodLabels`** — `{ q, year, quarter, priorQ, eoq, eoqLong, soq, soqLong }`. The view layer uses these for every period label; do not hardcode "Q2" in `js/views.js`.
- **`overview`** — banner, momentum strip, intro, scorecard row definitions, chart notes, executive read, vector tags. All overview editorial copy lives here.
- **`q2Headline.*`** — Q2 2026 quarterly metrics. Each leaf is `{ value, priorQ?, prior?, unit, source, calc?, note?, display? }`. `priorQ` = Q2 2025; `*FY` suffix = FY2025 anchor; `*Ytd` suffix = first-half 2026.
- **`guidance.*`** — each row has `label`, `status` (RAISED / LOWERED / REAFFIRMED / NEW / UPDATED), and either `low/high` + `unit`, `value`, or `display`. `guidance.adjEbitda.low/high` is required (overview chart).
- **`strategicInitiatives[]`** — Q2/Q3 programs with optional `status` pill. **`growth[]`** — longer-running catalysts.
- **`capitalActions[]`** — `{ action, date, value, unit?, note, source }` rendered as the capital-actions table.
- **`transcriptQuotes[]`** + **`transcriptPanel`** — verbatim quotes for the Executive Overview (all three companies).
- **`financials.contractSalesTrend[]`** — quarterly cadence chart on Financial Deep Dive.

When refreshing for a new fiscal period (Q3 2026, etc.): follow the checklist in `README.md`.

## What NOT to do

- Don't add a build step or framework without updating DECISIONS.md and getting user buy-in.
- Don't introduce a 4th company without updating REQUIREMENTS.md.
- Don't change brand colors without updating DESIGN.md — they map to MVW/HGV/TNL identity.
- Don't fabricate any number, ever. If unknown, ask or mark "not disclosed".
- Don't commit secrets or API keys — there shouldn't be any in this project.
- Don't merge data across periods (e.g., don't blend Q2 2026 contract sales with FY2025 contract sales without labeling).
- Don't hardcode period strings in `js/views.js` — read them from `MVW_DATA.meta.periodLabels`.
