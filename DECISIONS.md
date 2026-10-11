# DECISIONS.md — Architecture & Data-Shape Decisions

Append a dated bullet whenever architecture, data shape, file structure, framework, or build approach changes. **Check this file before changing any of those things.**

---

## 2026-10-11 — Q2 2026 edition forked from the Q1 2026 dashboard

- **Static SPA, no build step.** HTML + CSS + vanilla JS served as static files; deploy target is GitHub Pages. Same approach as `jeffersonbauer/mvw2026q1` (Q1 2026) and `jeffersonbauer/mvw` (FY2025). Rationale unchanged: zero deployment friction, instant local preview, reliably refreshable each quarter.
- **Hash-based router.** Routes are `#/` (overview) and `#/company/<slug>/<tab>` (company drill-down). Six tabs per company: `exec`, `segments`, `footprint`, `financials`, `growth`, `risks`. Unchanged from Q1.
- **Data file shape: one global, one source-of-truth.** All data lives on `window.MVW_DATA` in `js/data.js`. Quarterly metrics live in `q2Headline.*` with `priorQ` for the Q2 2025 comparative, `*FY` for FY2025 anchors, and `*Ytd` for first-half 2026 figures.
- **Charts library: Chart.js 4.4.1 via CDN. Map library: Leaflet 1.9.4 via CDN. Fonts: Montserrat + Lato + JetBrains Mono.** Unchanged. Basemap tiles changed — see below.
- **No analytics, no telemetry, no cookies.** Unchanged.

## 2026-10-11 — Period-specific copy moved out of the view layer (data-driven overview)

- In the Q1 edition the overview banner, momentum strip, chart footnotes, executive-read bullets, vector tags, the MVW transcript-quote block, the guidance-card rows, and the capital-actions table were all hardcoded in `js/views.js`. That made a quarterly refresh a two-file edit with a lot of hunt-and-replace.
- Q2 edition: all of that copy now lives in `js/data.js` — `MVW_DATA.overview` (banner / momentum / intro / scorecardRows / chartNotes / executiveRead / vectorTags), `MVW_DATA.meta.periodLabels` (every "Q2", "Q2 2025", "Jun 30, 2026" string), and per-company `transcriptQuotes[]`, `transcriptPanel`, `guidance.*.label/status`, `capitalActions[]`, `segmentNote`, `guidanceNote`, `financials.contractSalesNote`.
- `js/views.js` reads `P()` (period labels) for every label and renders the above generically. A small `richText()` helper whitelists `<strong>`, `<em>`, `<br>` in editorial strings; everything else is escaped.
- **Trade-off:** `js/data.js` is bigger and mixes facts with editorial copy. Accepted because the facts and the editorial framing change together each quarter, and the view layer is now close to period-agnostic. Renaming `q2Headline` → `q3Headline` is the main remaining view-layer touch for a refresh.

## 2026-10-11 — Guidance rows carry explicit status

- Each `guidance.<key>` entry has a `label` and a `status` (`RAISED`, `LOWERED`, `REAFFIRMED`, `NEW`, `UPDATED`) rendered as a `.guide-status` pill. Rows may be a `low/high` range, a single `value`, or a preformatted `display` string. Rationale: Q2 was a guidance-revision quarter (MVW raised everything; HGV reaffirmed EBITDA but cut sales/VPG; TNL raised everything) and executives need the direction of the revision at a glance. The same pill is reused for `strategicInitiatives[].status` (LAUNCHED / CLOSED / COMPLETED / IN FLIGHT / NEW).

## 2026-10-11 — Transcript quotes for all three companies

- Q1 rendered verbatim transcript quotes for MVW only (hardcoded). Q2 stores `transcriptQuotes[]` per company and renders the block whenever present. All three Q2 calls had material verbatim statements (HGV's "leadership issue" admission; TNL's acquisition math), so parity is warranted.

## 2026-10-11 — HGV Adj EBITDA shown on the ex-deferrals basis

- HGV reports Adj EBITDA attributable to stockholders both as reported (incl. net construction deferrals) and, on the call, excluding deferrals — the latter is the basis of its full-year guidance. Q1 used ex-deferrals ($267M). Q2 keeps ex-deferrals as the headline (`adjEbitda` = $293M; prior-year $278M is **calculated from disclosed inputs**: $233M reported + $45M deferral) and stores the reported figure separately (`adjEbitdaReported` = $265M vs $233M). The scorecard caption and chart notes state this explicitly.

## 2026-10-11 — MVW segment data uses Q2 figures (not FY2025 baselines)

- Unlike the Q1 release, MVW's Q2 2026 release discloses quarterly segment revenue (excl. cost reimbursements) and segment Adj EBITDA. The Q1 decision to show FY2025 baselines for MVW is therefore retired; all three companies now show Q2 segment data. `segmentNote` per company documents the basis.

## 2026-10-11 — Quarterly contract-sales cadence chart added to Financial Deep Dive

- `financials.contractSalesTrend[]` (Q2'25, Q1'26, Q2'26, FY2025, FY2026E guide midpoint) now renders via a new `MVW_CHARTS.singleBars()` helper. Guidance bars are drawn semi-transparent with an outline. HGV has no dollar guidance so no FY2026E bar.

## 2026-10-11 — Market-cap data sourcing methodology (Q2)

- End-of-quarter market cap = **closing price on Jun 30, 2026 × Q2 weighted-average diluted shares as disclosed in each release** (MVW 38.2M, HGV 80.9M, TNL 63.4M). This replaces the Q1 approach of deriving shares from net income / EPS, since all three Q2 releases disclose the diluted share count directly.
- Closing prices fetched once from Yahoo Finance (`/v8/finance/chart`, daily) and hardcoded: Jun 30, 2026 — VAC $101.88, HGV $52.37, TNL $76.43; Mar 31, 2026 — VAC $65.12, HGV $39.12, TNL $69.19 (the latter match the Q1 edition).
- Q2 share-price performance = Jun 30 close ÷ Mar 31 close − 1 (price-only, ex-dividends). Keys are now period-neutral (`priceEoq`, `priceSoq`) except `q2PricePerformance`.

## 2026-10-11 — Live stock-quote proxy update

- Inherited from Q1: Yahoo Finance `v7/finance/spark` batched endpoint, raced across public CORS proxies via `Promise.any`, 60s refresh, `sessionStorage` hydration (cache prefix now `mvw_q2_quote_`).
- As of 2026-10-11, `corsproxy.io` returns HTTP 403 without an API key and `api.allorigins.win/raw` responds without an `Access-Control-Allow-Origin` header, so the Q1 proxy list fails in the browser. The Q2 module adds **`api.allorigins.win/get`** (JSON-wrapped body in `.contents`, with CORS headers) as the primary racer, keeps `/raw` as a fallback, and drops corsproxy.io. Each proxy entry is now `{ build, unwrap }`. If the first fetch fails, `boot()` retries on a 5s / 15s / 30s backoff before falling back to the 60s cadence (allorigins is intermittent — roughly one in three requests timed out in testing). If all proxies fail the slot shows `—`; the rest of the dashboard is unaffected.

## 2026-10-11 — Map basemap switched from CARTO to Esri Light Gray Canvas

- The Q1/FY2025 editions used CARTO `light_all` tiles. On 2026-10-11 the live site rendered CARTO tiles watermarked "API KEY REQUIRED — carto.com/basemaps/apikey" (CARTO now gates its public basemaps by referer / key; direct curl still returns 200, so the gate is browser-side). Switched `afterFootprint()` to Esri's World Light Gray Canvas (`server.arcgisonline.com/.../Canvas/World_Light_Gray_Base`), which is free, key-less, and visually close to the CARTO light look. maxZoom 16. Attribution updated per Esri terms.
- The Q1 2026 and FY2025 dashboards still point at CARTO and will show the same watermark until patched the same way.

## Changelog
- 2026-10-11: Q2 2026 edition created from the Q1 2026 repo; data refreshed to Q2 2026 releases / 10-Qs / transcripts for all three companies.
- 2026-10-11: Overview copy, transcript quotes, guidance rows, capital actions made data-driven; period labels centralized.
- 2026-10-11: Added guidance/initiative status pills, quarterly contract-sales chart, transcript quotes for HGV and TNL.
- 2026-10-11: Market cap now uses disclosed diluted shares; live-quote proxy list updated.
- 2026-10-11: Footprint basemap switched to Esri World Light Gray Canvas after CARTO began requiring an API key.
