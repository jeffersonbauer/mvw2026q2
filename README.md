# MVW Competitive Intelligence Dashboard — Q2 2026 Edition

Executive-grade competitive analysis dashboard for **Marriott Vacations Worldwide (NYSE: VAC)** vs. its two largest pure-play timeshare peers — **Hilton Grand Vacations (NYSE: HGV)** and **Travel + Leisure Co. (NYSE: TNL)** — anchored on **Q2 2026 earnings results** (quarter ended June 30, 2026).

All numbers are sourced from the **Q2 2026 earnings releases (8-K Ex. 99.1), Form 10-Q filings, and earnings-call transcripts**, with FY2025 10-K anchors for context. No projections, no estimates, no fabrication — every cited figure traces back to a specific document, and anything derived is labeled "calculated from disclosed inputs".

## Quick start

**Live site (GitHub Pages):** https://jeffersonbauer.github.io/mvw2026q2/

**Local:** No build step. Serve the directory with any static server:

```bash
cd /path/to/mvw2026q2
python3 -m http.server 8080
# then open http://localhost:8080
```

Or just double-click `index.html`.

## Edition lineage

| Edition | Repo | Live |
|---|---|---|
| FY2025 year-end | https://github.com/jeffersonbauer/mvw | https://jeffersonbauer.github.io/mvw/ |
| Q1 2026 | https://github.com/jeffersonbauer/mvw2026q1 | https://jeffersonbauer.github.io/mvw2026q1/ |
| **Q2 2026 (this repo)** | https://github.com/jeffersonbauer/mvw2026q2 | https://jeffersonbauer.github.io/mvw2026q2/ |

Same layout, tabs, fonts and styling as the Q1 edition; the topbar links back to both prior editions.

## What's inside

- **Comparative overview** (`#/`) — Q2 2026 quarter banner, three-up momentum strip (Q2 Adj EBITDA), comparative scorecard (Q2 P&L, timeshare KPIs, market cap, capital position, FY2025 anchors, 2026 guidance), four YoY charts, Q2 market-cap / share-price panel, executive read.
- **Per-company drill-down** (`#/company/<slug>/<tab>`) for MVW, HGV, and TNL — six tabs each:
  - **Executive Overview** — Q2 KPI grid, company-at-a-glance, Q2 chapter narrative, **verbatim transcript quotes** (all three companies), paraphrased key-items list.
  - **Segment Drill-Down** — Q2 segment doughnut + revenue/EBITDA bars, segment table with revenue and EBITDA YoY, brand portfolio.
  - **Global Footprint** — Leaflet world map + regional table, with Q2/Q3 footprint changes (acquisitions, closures, pipeline).
  - **Financial Deep Dive** — Q2 financial position, FY trend charts, **quarterly contract-sales cadence chart**, debt structure, 2026 guidance card with RAISED / LOWERED / REAFFIRMED status pills, receivables & credit, **Q2/Q3 2026 capital-actions table**.
  - **Growth Catalysts** — Q2/Q3 strategic initiatives (with status pills) + longer-running catalysts.
  - **Risk Matrix** — analyst-coded 5×5 heat map of Item 1A risks with verbatim language, Q2 2026 management commentary, and Q2-emergent risks.

## Tech stack

- **Static files only** — HTML / CSS / vanilla JS, no build step.
- Chart.js 4.4.1 (CDN), Leaflet 1.9.4 + CARTO light tiles (CDN).
- Google Fonts: Montserrat, Lato, JetBrains Mono.
- Live topbar stock quotes: Yahoo Finance via public CORS proxy (the only networked data point).

## Refreshing data

All facts live in `js/data.js`. Per-company shape is documented at the top of that file. The view layer reads period labels and editorial copy from `MVW_DATA.meta.periodLabels` and `MVW_DATA.overview`, so a quarterly refresh is mostly a data-file edit. To refresh for Q3 2026:

1. Pull the new earnings release (8-K Ex. 99.1) and 10-Q from SEC EDGAR for VAC, HGV, TNL; pull the call transcript.
2. Rename `q2Headline` → `q3Headline` (and `q2PricePerformance`) in `js/data.js` and `js/views.js`; update `meta.periodLabels`, `meta.lastUpdated`, each `fiscal.*`.
3. Replace `overview.*` copy (banner, momentum, chart notes, executive read, vector tags).
4. Update guidance (with status), strategic initiatives, capital actions, transcript quotes, risks notes, sources.
5. Pull EoQ / SoQ closing prices and diluted share counts for the market-cap panel.
6. Spot-check: revenue, Adj EBITDA, contract sales, VPG, tours, FICO, provision, owner count, resort count.
7. Open the dashboard, click into each company, verify all six tabs render.

## Governance files (read these first)

- [`CLAUDE.md`](./CLAUDE.md) — project operating instructions for Claude Code sessions.
- [`DECISIONS.md`](./DECISIONS.md) — architecture & data-shape decisions.
- [`DESIGN.md`](./DESIGN.md) — design system: colors, fonts, components.
- [`REQUIREMENTS.md`](./REQUIREMENTS.md) — scope: in/out of scope, KPI coverage required.

## Source attribution

- **MVW Q2 2026:** earnings release + 10-Q (Aug 6, 2026) + earnings-call transcript. https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001524358
- **HGV Q2 2026:** earnings release + 10-Q (Jul 30, 2026) + company-posted transcript. https://investors.hgv.com
- **TNL Q2 2026:** earnings release + 10-Q (Jul 22, 2026) + transcript; Jul 15 acquisition release. https://investor.travelandleisureco.com
- **Closing prices:** Yahoo Finance (Mar 31 and Jun 30, 2026).

Risk-matrix severity / likelihood scores are analyst-coded overlays — not company disclosures.

## License

This is a private analytical dashboard. All company logos, brand names, and verbatim text are the property of their respective owners and are used here solely for editorial / competitive-intelligence purposes.
