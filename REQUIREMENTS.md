# REQUIREMENTS.md — Scope & Feature Requirements

What's in scope, what's explicitly out of scope, and what features each view must have. **Check this file before adding any feature.**

---

## In scope (Q2 2026 release)

### Companies covered
- **MVW** (Marriott Vacations Worldwide) — primary subject.
- **HGV** (Hilton Grand Vacations) — peer.
- **TNL** (Travel + Leisure Co.) — peer.

These three are the only public pure-play vacation-ownership operators of meaningful scale. TNL's Q3 2026 acquisitions (Yes& Vacations, Spinnaker Resorts) are private targets and are covered inside TNL's pages, not as separate companies. Adding a fourth company — flag and discuss before adding.

### Pages / routes
- **Overview** (`#/`) — Q2 2026 quarter banner, three-up momentum strip (single consistent metric: Q2 Adj EBITDA), three hero cards, comparative scorecard (Q2 P&L; Q2 timeshare KPIs incl. tours and Q2 / 1H adj FCF; market cap; capital position incl. leverage, buybacks, 1H dividends; FY2025 anchors; 2026 guidance midpoints), four side-by-side comparison charts, market-cap / share-price panel, executive-read panel with vector tags.
- **Per-company drill-down** (`#/company/<slug>/<tab>`) — six tabs:
  1. **Executive Overview** (`exec`) — Q2 KPI grid (revenue, Adj EBITDA, margin, NI, adj EPS, GAAP EPS, contract / Gross VOI sales, VPG, tours), company-at-a-glance, Q2 chapter narrative, **verbatim transcript-quote block for all three companies**, paraphrased key-items list.
  2. **Segment Drill-Down** (`segments`) — Q2 segment doughnut + revenue/EBITDA bars, segment table (revenue YoY, EBITDA YoY, margin), brand portfolio. All three companies use **Q2 2026 segment data** (MVW now discloses it).
  3. **Global Footprint** (`footprint`) — Leaflet map + regional table, including Q2/Q3 footprint changes (TNL acquisitions, HGV Elara / Ocean Reserve, MVW Dubai closure and pipeline).
  4. **Financial Deep Dive** (`financials`) — Q2 financial-position KPI grid (Q2 and 1H adj FCF, total debt, cash, leverage, liquidity, buybacks, dividends, authorization), FY revenue/EBITDA trend charts, **quarterly contract-sales cadence chart**, debt-structure stacked bar, **2026 guidance card with RAISED / LOWERED / REAFFIRMED / NEW status**, receivables & credit grid, **Q2/Q3 2026 capital-actions table** (securitizations, M&A, refinancings, dispositions, dividends).
  5. **Growth Catalysts** (`growth`) — Q2/Q3 strategic-initiatives panel (with status pills) + disclosed-growth-catalysts panel.
  6. **Risk Matrix** (`risks`) — analyst-coded 5×5 heat map of Item 1A risks + verbatim list with Q2 2026 management commentary; Q2-emergent risks tagged "(Q2 2026)".

### KPI coverage required (Q2 2026)
- **Quarterly P&L:** revenue, Adj EBITDA, Adj EBITDA margin, net income, GAAP diluted EPS, adjusted diluted EPS — all three companies, with Q2 2025 comparatives.
- **Quarterly timeshare KPIs:** contract sales / Gross VOI sales, VPG, tours, owner / member counts. Mark "not disclosed" where absent.
- **Capital position (Jun 30, 2026):** corporate debt, securitized debt, cash, liquidity, company-defined leverage ratio (definitions differ — caption it).
- **Capital return:** Q2 buybacks, Q2 / 1H dividends, remaining authorization, declared next-quarter dividend.
- **Receivables / credit:** FICO (latest disclosed basis), provision $ and/or rate, allowance, delinquency or default commentary, sales reserve (MVW).
- **Forward guidance:** 2026 full-year Adj EBITDA (required), plus contract sales / Gross VOI, VPG, FCF, Q3 outlook where disclosed — each with revision status vs the Q1 guide.
- **Capital actions:** ABS securitizations, M&A, debt issuance / refinancing, dispositions announced Q2 through early Q4 2026.
- **Market cap:** EoQ market cap, Q2 share-price change, SoQ / EoQ close prices, disclosed diluted shares.

### Company-specific requirements (Q2 2026)
- **MVW:** transcript quotes from Avril, Flaskey, Marino (Aug 6 call). Strategic-initiatives panel must cover Inner Circle (launched Jun 22), Premier Vacations (Jun 9), Reserve / Pinnacle loyalty tiers, Tour Logistics / Connections, Jul 1 price increase, Bonvoy / Hyatt partnership marketing, Asia-Pac right-sizing, Investor Day Dec 9. Guidance card must show every raised line with status. Note that "Dream Vacation Packages" (Q1 name) does not appear in Q2 primary sources.
- **HGV:** Adj EBITDA shown ex-deferrals with the reported figure alongside; VPG / contract-sales outlook cuts and the "leadership issue" explanation surfaced in narrative, risks, and quotes; Elara close, disposition loss, two ABS deals, TLB refinancing in capital actions.
- **TNL:** Yes& Vacations + Spinnaker acquisitions in initiatives, capital actions, footprint, and risks; Q3 guidance rows; Resort-Optimization progress; post-quarter SI Resorts (Nashville, Wyndham Hotels partnership) and Eddie Bauer Trail Partners news included as dated IR releases.

### Source-citation requirements
- Every numeric KPI in `js/data.js` carries a `source:` string naming the document and, where possible, the table / note.
- Calculated values say "calculated from disclosed inputs" (market cap, share-price change, HGV prior-year ex-deferral EBITDA, TNL receivable percentages, TNL liquidity).
- Every page renders a Sources block with links to: Q2 release (EDGAR), Q2 10-Q (EDGAR), transcript, relevant 8-Ks / IR releases, Q1 release (context), FY2025 10-K, IR site, EDGAR index.
- Risk Matrix scores explicitly labeled "analyst-coded overlays — not company disclosures."
- Consensus beat / miss figures are secondary-source and appear only in narrative notes, labeled as such.

### Live stock quotes (inherited)
- Live quote under each company nav pill; 60s refresh; graceful `—` fallback. Only networked data point.

## Out of scope (do not add without user buy-in)

- **Real-time market caps, multiples, analyst targets, consensus estimates** as data rows (beat / miss context in narrative only).
- **Forward EBITDA / earnings projections** other than company-disclosed guidance.
- **A 4th company.** Discuss first.
- **User accounts, saved views, comments, favoriting.** Static read-only.
- **Dark mode.** Single light theme per IR aesthetic.
- **Mobile-first redesign.** Responsive breakpoints exist; primary context is desktop.
- **Build tooling, framework migration.** See DECISIONS.md.
- **Inline editing of data.** Edit `js/data.js`.
- **Q3 2026 data.** TNL's Oct 27 and later Q3 releases belong in a `mvw2026q3` edition.

## Changelog
- 2026-10-11: Initial scope set for the Q2 2026 dashboard, forked from Q1 2026. Added: tours and 1H adj FCF scorecard rows, leverage and 1H-dividend rows, transcript quotes for all three companies, guidance status pills, quarterly contract-sales chart, generic capital-actions table, Q2 segment data for MVW.
