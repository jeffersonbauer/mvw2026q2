/**
 * MVW Competitive Intelligence Dashboard — Q2 2026 Edition — Data Module
 * ======================================================================
 * Single source of truth. All figures sourced from primary documents:
 *   - Q2 2026 earnings press releases (8-K Exhibit 99.1, SEC EDGAR)
 *   - Q2 2026 Form 10-Q filings (SEC EDGAR)
 *   - Q2 2026 earnings-call transcripts
 *   - Most recent FY2025 10-K filings (for trailing context)
 *   - Yahoo Finance closing prices (market-cap panel only)
 *
 * SHAPE (per company):
 *   slug, name, ticker, exchange, brandColor, hq, ceo, cfo, coo?
 *   fiscal: { year, period, releaseDate, callDate, sourceUrl }
 *   narrative: { history, oneLiner, currentChapter }
 *   q2Headline: { revenue, adjEbitda, contractSales, vpg, tours, ... }
 *     each leaf is { value, priorQ?, prior?, unit, source, calc?, note?, display? }
 *     `priorQ` = Q2 2025 comparative; `*FY` suffix = trailing FY2025 anchor
 *   guidance: { key: { label, low, high | value, unit, status, source, note } }
 *   strategicInitiatives[] (Q2/Q3 2026 programs), growth[] (longer-running catalysts)
 *   capitalActions[] (securitizations, M&A, debt, dispositions)
 *   transcriptQuotes[] (verbatim), recentCall.items[] (paraphrased), risks[], sources[]
 *
 * `overview` holds the period-specific editorial copy for the comparative page.
 *
 * Last refreshed: 2026-10-11 (all three peers have reported Q2 2026)
 *
 * Where a Q2 2026 figure is not disclosed, the leaf uses value:null with a note.
 * Calculated values say "calculated from disclosed inputs" in `source`/`calc`.
 * Do not invent numbers.
 */

window.MVW_DATA = {
  meta: {
    lastUpdated: "2026-10-11",
    fiscalPeriod: "Q2 2026 (quarter ended June 30, 2026)",
    periodLabels: {
      q: "Q2",
      year: 2026,
      quarter: "Q2 2026",
      priorQ: "Q2 2025",
      eoq: "Jun 30, 2026",
      eoqLong: "June 30, 2026",
      soq: "Mar 31, 2026",
      soqLong: "March 31, 2026"
    },
    note: "All three peers have reported Q2 2026: TNL (Jul 22), HGV (Jul 30), MVW (Aug 6). FY2025 baselines retained from each company's 10-K (filed Feb 2026). Q1 2026 figures carried for sequential context.",
    disclaimer: "This dashboard summarizes publicly disclosed information. Severity and likelihood scores in the Risk Matrix are analyst-coded overlays — they are not company disclosures. No projections or estimates are presented as facts."
  },

  // -------------------------------------------------------------------------
  // Overview page — period-specific editorial copy
  // -------------------------------------------------------------------------
  overview: {
    banner: {
      eyebrow: "Q2 2026 · Quarter ended Jun 30, 2026 · All three peers reported",
      headlineHtml: `<span class="quarter-banner__highlight">MVW breaks out</span> (contract sales +22%, VPG +23%, guide raised across the board), <span class="quarter-banner__highlight">TNL raises</span> and buys 100K owners, and <span class="quarter-banner__highlight">HGV stumbles</span> on sales execution — the turnaround story flipped in one quarter.`,
      stats: [
        { label: "TNL released", value: "Jul 22" },
        { label: "HGV released", value: "Jul 30" },
        { label: "MVW released", value: "Aug 6" }
      ]
    },
    // Single consistent metric across all three: Q2 Adj EBITDA (HGV shown excl. construction deferrals — the basis of its guidance)
    momentum: [
      { slug: "mvw", metricLabel: "Q2 Adj EBITDA", valueText: "$215M", yoyPct: 6, sub: "The breakout. Contract sales <strong>+22% to $545M</strong>, VPG <strong>$4,477 (+23%)</strong>; May and June were the two highest sales months in company history. 2026 Adj EBITDA guide raised $50M to <strong>$805-830M</strong>." },
      { slug: "hgv", metricLabel: "Q2 Adj EBITDA (ex-deferrals)", valueText: "$293M", yoyPct: 5, sub: "The stumble. Contract sales <strong>−3% to $810M</strong>, VPG <strong>−8.6%</strong>; mgmt called it a leadership issue at two Bluegreen sites. EBITDA guide <strong>reaffirmed</strong>; contract-sales and VPG outlook cut." },
      { slug: "tnl", metricLabel: "Q2 Adj EBITDA", valueText: "$269M", yoyPct: 8, sub: "The compounder. VO segment EBITDA <strong>+13%</strong>, Gross VOI +6%, adj EPS +14%. Guide raised to <strong>$1,065-1,085M</strong>; Yes&amp; Vacations + Spinnaker acquisitions add 100K+ owners." }
    ],
    intro: "Side-by-side view of the three pure-play public timeshare operators after the full Q2 2026 reporting cycle. Click any company column to drill into Executive Overview, Segment Drill-Down, Global Footprint, Financial Deep Dive, Growth Catalysts, and Risk Matrix. Leader cell in each row is highlighted in gold.",
    scorecardRows: [
      { label: "Q2 2026 quarterly P&L", isSection: true },
      { label: "Q2 revenue", path: "revenue", unit: "USD millions", direction: "high" },
      { label: "Q2 Adj EBITDA", path: "adjEbitda", unit: "USD millions", direction: "high", caption: "HGV shown excl. construction deferrals (guidance basis); reported Adj EBITDA attributable was $265M (+14%)." },
      { label: "Q2 Adj EBITDA margin", path: "adjEbitdaMargin", unit: "percent", direction: "high", caption: "MVW: on revenue excl. cost reimbursements. HGV: excl. reimbursements & deferrals (per CFO). TNL: on net revenue." },
      { label: "Q2 net income", path: "netIncome", unit: "USD millions", direction: "high" },
      { label: "Q2 diluted EPS (GAAP)", path: "dilutedEps", unit: "USD per share", direction: "high" },
      { label: "Q2 adjusted diluted EPS", path: "adjDilutedEps", unit: "USD per share", direction: "high" },

      { label: "Q2 2026 timeshare KPIs", isSection: true },
      { label: "Q2 contract / Gross VOI sales", path: { mvw: "contractSales", hgv: "contractSales", tnl: "grossVoiSales" }, unit: "USD millions", direction: "high", note: "MVW & HGV: contract sales; TNL: Gross VOI sales" },
      { label: "Q2 VPG", path: "vpg", unit: "USD per guest", direction: "high" },
      { label: "Q2 tours", path: "tours", unit: "tours", direction: "high", caption: "TNL reports tours rounded to thousands." },
      { label: "Q2 Adj free cash flow", path: "adjFreeCashFlow", unit: "USD millions", direction: "high", caption: "TNL discloses adj FCF on a year-to-date basis only — see 1H row." },
      { label: "1H 2026 Adj free cash flow", path: "adjFreeCashFlowYtd", unit: "USD millions", direction: "high" },

      { label: "Market capitalization (Jun 30, 2026)", isSection: true },
      { label: "Q2 EoQ market cap", path: "marketCapEoq", unit: "USD millions", direction: "high" },
      { label: "Q2 stock-price performance", path: "q2PricePerformance", unit: "percent", direction: "high" },
      { label: "Jun 30, 2026 close price", path: "priceEoq", unit: "USD per share", direction: "high" },

      { label: "Capital position (Jun 30, 2026)", isSection: true },
      { label: "Corporate debt", path: "corporateDebt", unit: "USD millions", direction: "low" },
      { label: "Securitized debt (non-recourse)", path: "securitizedDebt", unit: "USD millions", direction: "low" },
      { label: "Leverage (company-defined)", path: { mvw: "leverage", hgv: "netLeverage", tnl: "leverage" }, unit: "x", direction: "low", caption: "Definitions differ: MVW net corporate leverage; HGV TTM net leverage (pro forma); TNL first-lien covenant ratio." },
      { label: "Q2 buybacks", path: "buybacks", unit: "USD millions", direction: "high" },
      { label: "1H 2026 dividends paid", path: "dividendsPaidYtd", unit: "USD millions", direction: "high", caption: "HGV pays no common dividend." },

      { label: "FY2025 operating anchors", isSection: true },
      { label: "FY2025 revenue", path: "revenueFY", unit: "USD millions", direction: "high" },
      { label: "FY2025 Adj EBITDA", path: "adjEbitdaFY", unit: "USD millions", direction: "high" },
      { label: "FY2025 contract / Gross VOI sales", path: "contractSalesFY", unit: "USD millions", direction: "high" },
      { label: "FY2025 VPG", path: "vpgFY", unit: "USD per guest", direction: "high" },
      { label: "Owner / member families", path: "owners", unit: "owner families", direction: "high" },
      { label: "Resorts", path: "resorts", unit: "vacation-ownership resorts", direction: "high" },
      { label: "New-buyer FICO (latest disclosed)", path: "avgFico", unit: "FICO", direction: "high" },

      { label: "2026 Adj EBITDA guidance (as of Q2 release)", isSection: true },
      { label: "2026 Adj EBITDA guide (mid)", path: null, unit: "USD millions", direction: "high",
        guideMid: { mvw: 817.5, hgv: 1245, tnl: 1075 },
        guideRange: { mvw: "$805-830M (RAISED +$50M)", hgv: "$1,225-1,265M (reaffirmed)", tnl: "$1,065-1,085M (RAISED +$32.5M mid)" } }
    ],
    chartNotes: {
      revenue: "HGV led absolute revenue at $1.36B (+7.3% YoY, incl. a $54M construction-deferral drag); MVW +6% to $1.32B (+10% excl. cost reimbursements); TNL +4% to $1.06B.",
      ebitda: "MVW +6% to $215M (margin −90 bps on turnaround S&amp;M spend and reportability); HGV ex-deferrals +5% to $293M (reported attributable $265M, +14%); TNL +8% to $269M on VO segment +13%.",
      contract: "MVW +22% to $545M — the largest growth rate any of the three has posted in years; TNL Gross VOI +6% to $693M; HGV −3% to $810M on Bluegreen VPG moderation and sales-execution issues. Note: TNL \"contract sales\" reported as Gross VOI sales.",
      guide: "MVW midpoint $817.5M (RAISED +$50M from $755-780M). TNL midpoint $1,075M (RAISED from $1,030-1,055M). HGV midpoint $1,245M (reaffirmed; excl. deferrals).",
      mktcap: "Bars compare market cap on Mar 31, 2026 (Q2 starting) to Jun 30, 2026 (Q2 ending), both at Q2 weighted-average diluted shares. TNL still leads in absolute size, but MVW added ~$1.4B of equity value in the quarter.",
      perf: "VAC +56.5% in Q2 as April/May/June contract-sales acceleration validated the turnaround thesis; HGV +33.9% (before the post-quarter Q2 miss); TNL +10.5%. All three outran the Q1 2026 reaction."
    },
    executiveRead: [
      { slug: "mvw", title: "The breakout quarter", bullets: [
        "<strong>Contract sales +22% to $545M</strong>, VPG $4,477 (+23%), owner contract sales +41%. Flaskey: May and June were the two highest sales months in company history; July ran consistent with May/June.",
        "<strong>Guidance raised across the board</strong>: contract sales $2,080-2,115M (+18-20%), Adj EBITDA $805-830M (+$50M), adj EPS $8.25-9.05, adj FCF $410-460M.",
        "<strong>Beat its own Q2 guide</strong> by ~$20M of Adj EBITDA; adj EPS $2.31 vs. $1.96. Margin still −90 bps on S&amp;M investment and a $15M reportability drag.",
        "<strong>Commercial engine now live</strong>: Premier Vacations incentive (Jun 9), Inner Circle presented by Aflac (Jun 22; ~50 events in 2026, target 1,000 in 2027), Reserve/Pinnacle loyalty tiers, Jul 1 price increase.",
        "<strong>Balance sheet</strong>: net corporate leverage 4.0x (from 4.2x), $928M liquidity, $201M 1H adj FCF; buybacks to turn opportunistic once below 4x. Investor Day Dec 9, 2026."
      ]},
      { slug: "hgv", title: "The execution stumble", bullets: [
        "<strong>Contract sales −3% to $810M</strong>, VPG $3,372 (−8.6%) despite tours +6% (fourth straight quarter of tour growth). Wang: \"not a market issue or an integration issue… it really was a leadership issue\" at two high-volume Bluegreen sites.",
        "<strong>EBITDA guide reaffirmed</strong> ($1.225-1.265B ex-deferrals) but FY contract sales cut to flat/down slightly and VPG to down low-to-mid single digits; Q3 VPG guided down high single digits.",
        "<strong>Still profitable on the P&amp;L</strong>: adj EPS $0.89 vs. $0.54; real-estate margin ex-deferrals +220 bps to 28%; Adj EBITDA ex-deferrals $293M (+5%).",
        "<strong>Capital return intact</strong>: $150M Q2 buybacks (3.1M shares), $300M 1H, ~10% of float retired; pace ~$150M/quarter so long as net leverage doesn't rise.",
        "<strong>Portfolio moves</strong>: Elara buyout closed Apr 29 ($131M; ~$20M FY EBITDA), $48M loss on a Jun 30 disposition, two ABS deals ($500M + $300M), $850M TLB refinanced to 2033 (Jul 17)."
      ]},
      { slug: "tnl", title: "The compounder adds inorganic growth", bullets: [
        "<strong>VO segment EBITDA +13%</strong> to $247M on Gross VOI +6%, VPG +2%, tours +1%; consolidated Adj EBITDA +8%, adj EPS +14% to $1.88.",
        "<strong>Guide raised</strong>: Adj EBITDA $1,065-1,085M, Gross VOI $2.60-2.675B, VPG $3,325-3,375; Q3 guide $275-285M EBITDA.",
        "<strong>Two acquisitions</strong>: Yes&amp; Vacations ($193M, closed Jul 15) + Spinnaker Resorts ($150M + up to $10M contingent) — 23 resorts, 100K+ owners, ~$50M synergized EBITDA, ~5x net multiple.",
        "<strong>Resort-optimization near completion</strong>: 12 full + 5 partial resorts exited; developer obligations down $40M in 1H; $9M Q2 charges.",
        "<strong>Travel &amp; Membership still the soft spot</strong>: revenue −5%, EBITDA −11%, exchange transactions −13%, RCI members −2%. Capital return $125M in Q2 ($37M div + $88M buyback); $745M authorization left."
      ]}
    ],
    vectorTags: [
      "MVW · Inner Circle live (Jun 22)",
      "MVW · Premier Vacations (Jun 9)",
      "MVW · Investor Day Dec 9",
      "HGV · Bluegreen sales-leadership reset",
      "HGV · $850M TLB → 2033",
      "TNL · Yes& Vacations + Spinnaker",
      "TNL · SI Resorts Nashville (Sep 1)",
      "All · ABS issuance @ ~4.9-5.5%"
    ]
  },

  companies: {
    // -----------------------------------------------------------------------
    // MVW — Marriott Vacations Worldwide Corporation (NYSE: VAC)
    // -----------------------------------------------------------------------
    mvw: {
      slug: "mvw",
      name: "Marriott Vacations Worldwide",
      shortName: "MVW",
      ticker: "VAC",
      exchange: "NYSE",
      brandColor: "#0862A7",
      brandAccent: "#0862A7",
      brandSoft: "#04345C",
      hq: "Orlando, Florida",
      foundedSpinOff: "Spun off from Marriott International on November 21, 2011",
      ceo: { name: "Matthew E. Avril", title: "President & CEO", note: "Permanent CEO since February 16, 2026" },
      cfo: { name: "Jason P. Marino", title: "EVP & CFO", note: "New employment agreement effective Jul 30, 2026 incl. a 'CFO Transformation Award' tied to stock price and 4-quarter Adj EBITDA hurdles through 2028 (8-K Jul 30, 2026)" },
      coo: { name: "Michael A. Flaskey", title: "President & COO", note: "Joined mid-February 2026; architect of the five-step commercial strategy" },
      employees: { value: 21100, source: "10-K FY2025 (most recent disclosure)" },
      fiscal: {
        year: 2026,
        period: "Q2 2026 (quarter ended June 30, 2026)",
        filingType: "Q2 2026 earnings release / Form 10-Q",
        releaseDate: "2026-08-06",
        callDate: "2026-08-06",
        callTime: "8:30am ET",
        sourceUrl: "https://www.sec.gov/Archives/edgar/data/1524358/000152435826000035/a2026q2pressreleaseschedul.htm"
      },
      narrative: {
        oneLiner: "The largest pure-play vacation-ownership operator under the Marriott umbrella — and Q2 2026's standout: contract sales +22%, VPG +23% to an industry-leading $4,477, and full-year guidance raised on every line.",
        history: "Spun off from Marriott International in 2011, MVW expanded materially via the 2018 Interval Leisure Group merger (adding Interval International, Hyatt Vacation Club, Aqua-Aston) and the 2021 Welk Resorts acquisition (folded into the Hyatt vacation-ownership business). Licenses Marriott, Sheraton, Westin, Ritz-Carlton, St. Regis, Luxury Collection, and Hyatt timeshare brands.",
        currentChapter: "Q2 2026 was the quarter the commercial turnaround showed up in the numbers. Contract sales rose 22% YoY to $545M (North America +27%), VPG jumped 23% to $4,477, and owner contract sales grew 41% on a 33% lift in owner VPG. Each month improved sequentially; May and June were the two highest sales months in company history and July ran consistent with them. Adj EBITDA of $215M (+6%) exceeded the high end of Q2 guidance even with a $15M reportability drag and a 90 bps margin decline from upfront sales & marketing investment. Management raised 2026 guidance across the board — contract sales to $2,080-2,115M (+18-20%), Adj EBITDA to $805-830M, adj EPS to $8.25-9.05, adj FCF to $410-460M — implying 25-29% contract-sales growth in the second half. Net corporate leverage fell to 4.0x; buybacks are expected to turn opportunistic once below 4x. An Investor Day is set for Dec 9, 2026 in New York."
      },

      q2Headline: {
        revenue: { value: 1320, priorQ: 1246, unit: "USD millions", source: "MVW Q2 2026 release (Aug 6, 2026), Table A-1", note: "+6% YoY; +10% excl. cost reimbursements ($920M vs $839M)" },
        adjEbitda: { value: 215, priorQ: 203, unit: "USD millions", source: "MVW Q2 2026 release, A-1/A-4", note: "+6% YoY; ~$20M above midpoint of Q2 guidance (CEO Avril, Q2 call)" },
        adjEbitdaMargin: { value: 23.4, priorQ: 24.3, unit: "percent", source: "MVW Q2 2026 release, A-4/A-7", note: "On revenue excl. cost reimbursements; −90 bps YoY on higher S&M costs and unsold maintenance fees" },
        netIncome: { value: 77, priorQ: 69, unit: "USD millions", source: "MVW Q2 2026 release, A-1", note: "Net income attributable to common stockholders; +11%" },
        dilutedEps: { value: 2.12, priorQ: 1.77, unit: "USD per share", source: "MVW Q2 2026 release, A-1", note: "+20% YoY; diluted shares 38.2M vs 41.7M" },
        adjDilutedEps: { value: 2.31, priorQ: 1.96, unit: "USD per share", source: "MVW Q2 2026 release, A-1", note: "+18% YoY" },
        adjNetIncome: { value: 84, priorQ: 77, unit: "USD millions", source: "MVW Q2 2026 release, A-1", note: "+9% YoY" },
        contractSales: { value: 545, priorQ: 445, unit: "USD millions", source: "MVW Q2 2026 release", note: "+22% YoY; North America +27%; owner contract sales +41%, first-time-buyer contract sales −16% (10-Q MD&A)" },
        vpg: { value: 4477, priorQ: 3631, unit: "USD per guest", source: "MVW Q2 2026 release", note: "+23% YoY (nearly +22% ex-Asia-Pac); owner VPG +33%" },
        tours: { value: 112721, priorQ: 114402, unit: "tours", source: "MVW Q2 2026 release", note: "−1% YoY on planned Asia-Pac reductions; North America tours +3% (owner tours +7%)" },
        ownerArrivalToTour: { value: 600, unit: "bps", source: "MVW Q2 2026 call (Flaskey)", note: "'Connections' owner arrival-to-tour rate +600 bps YoY" },
        adjFreeCashFlow: { value: 87, priorQ: null, unit: "USD millions", source: "MVW Q2 2026 call (Marino)", note: "Q2 standalone; Q2 2025 standalone not disclosed. FY conversion guided to mid-50% range." },
        adjFreeCashFlowYtd: { value: 201, priorQ: 22, unit: "USD millions", source: "MVW Q2 2026 release, A-14", note: "1H 2026 vs 1H 2025; includes $50M Westin Cancun proceeds" },
        operatingCashFlowYtd: { value: 76, priorQ: -40, unit: "USD millions", source: "MVW Q2 2026 release, A-12", note: "1H 2026 operating cash flow vs 1H 2025" },

        // Trailing FY2025 anchors (from 10-K)
        revenueFY: { value: 5032, prior: 4967, unit: "USD millions", source: "10-K FY2025" },
        adjEbitdaFY: { value: 751, prior: 736, unit: "USD millions", source: "10-K FY2025" },
        adjEbitdaMarginFY: { value: 22.5, unit: "percent", source: "10-K FY2025 MD&A" },
        contractSalesFY: { value: 1762, prior: 1813, unit: "USD millions", source: "10-K FY2025" },
        vpgFY: { value: 3794, prior: 3911, unit: "USD per guest", source: "10-K FY2025" },
        toursFY: { value: 431974, prior: 432716, unit: "tours", source: "10-K FY2025" },
        owners: { value: 700000, unit: "owner families", source: "MVW Q2 2026 release", note: "~700,000 owner families; Interval International members 1,474,816 (−2%)" },
        avgFico: { value: 756, priorQ: 742, unit: "FICO", source: "MVW Q2 2026 10-Q, MD&A", note: "Average FICO of buyers who financed in Q2 2026 vs Q2 2025; weighted-avg FICO of total pool 731 (vs 729 at YE2025)" },
        financingPropensity: { value: 66, priorQ: 64, unit: "percent", source: "MVW Q2 2026 10-Q, MD&A" },
        salesReserve: { value: 13.4, unit: "percent of contract sales", source: "MVW Q2 2026 call (Marino)", note: "$72M vs $58M; up ~20 bps YoY as % of contract sales on higher financing propensity; mgmt expects a similar rate in 2H 2026" },
        defaultRate: { value: 13.05, unit: "percent", source: "MVW Q2 2026 10-Q, Note 6", note: "Estimated average remaining default rate on the notes-receivable pool at Jun 30, 2026 (vs 13.51% at Dec 31, 2025). Sub-120-day delinquencies down 54 bps per CFO." },

        // Market cap as of end of Q2 2026 (close × Q2 weighted-avg diluted shares)
        marketCapEoq: { value: 3892, unit: "USD millions", source: "calculated from disclosed inputs: Jun 30, 2026 close $101.88 (Yahoo Finance) × Q2 2026 weighted-avg diluted shares 38.2M (release A-1)" },
        priceEoq: { value: 101.88, unit: "USD per share", source: "Yahoo Finance (Jun 30, 2026 close)" },
        priceSoq: { value: 65.12, unit: "USD per share", source: "Yahoo Finance (Mar 31, 2026 close)" },
        q2PricePerformance: { value: 56.45, unit: "percent", source: "calculated from disclosed inputs: ($101.88 / $65.12) − 1", note: "Q2 2026 price-only return, ex-dividends" },
        dilutedShares: { value: 38.2, unit: "millions of weighted-avg diluted shares", source: "MVW Q2 2026 release, A-1" },

        // Liquidity / debt as of June 30, 2026
        liquidity: { value: 928, unit: "USD millions", source: "MVW Q2 2026 release", note: "$211M cash + $650M revolver availability" },
        cashOnHand: { value: 211, unit: "USD millions", source: "MVW Q2 2026 release" },
        revolverAvailability: { value: 650, unit: "USD millions", source: "MVW Q2 2026 release", note: "$145M drawn of $800M facility (expires Mar 2030)" },
        corporateDebt: { value: 3100, unit: "USD millions", source: "MVW Q2 2026 release, A-11", note: "Debt, net $3.1B: Term Loan $784M, revolver $145M, 2027 converts $575M, 2028 notes $350M, 2029 notes $500M, 2033 notes $575M, finance leases $198M (10-Q Note 12)" },
        securitizedDebt: { value: 2353, unit: "USD millions", source: "MVW Q2 2026 release, A-11", note: "Non-recourse VOI receivable securitizations, net" },
        leverage: { value: 4.0, unit: "x", source: "MVW Q2 2026 release", note: "Net corporate leverage; down from 4.2x at Q1. CFO expects 'upper 3s by the end of the year'." },

        // Capital return
        buybacks: { value: 0, unit: "USD millions", source: "MVW Q2 2026 10-Q, Note 13", note: "No repurchases in 1H 2026 (vs $36M in 1H 2025); $322M authorization remains through Dec 31, 2026" },
        remainingAuth: { value: 322, unit: "USD millions", source: "MVW Q2 2026 10-Q, Note 13", note: "Authorization expires Dec 31, 2026; buybacks to turn 'more opportunistic' below 4x leverage (CFO)" },
        dividendsPaidYtd: { value: 82, prior: 83, unit: "USD millions", source: "MVW Q2 2026 release, A-13", note: "1H 2026 dividends paid; $0.80/share quarterly ($3.20 annualized)" },
        dividendPerShare: { value: 0.80, unit: "USD per share", source: "MVW Q2 2026 10-Q, Note 13", note: "Q2 dividend paid Jun 10, 2026; Q3 dividend of $0.80 declared Sep 2, 2026" },

        inventory: { value: 902, unit: "USD millions", source: "MVW Q2 2026 release", note: "Incl. $229M in PP&E; ~1.7 years of supply per call" },
        resorts: { value: 120, unit: "vacation-ownership resorts", source: "MVW Q2 2026 release" },
        countries: { value: 13, unit: "countries / territories", source: "10-K FY2025" },
        keys: { value: 31640, unit: "keys", source: "10-K FY2025" }
      },

      // 2026 guidance as of Aug 6, 2026 release (all RAISED vs Q1)
      guidance: {
        contractSales: { label: "Contract sales", low: 2080, high: 2115, unit: "USD millions", status: "RAISED", source: "MVW Q2 2026 release", note: "From $1,815-1,885M; +18-20% YoY, implying +25-29% in 2H 2026" },
        adjEbitda: { label: "Adj EBITDA", low: 805, high: 830, unit: "USD millions", status: "RAISED", source: "MVW Q2 2026 release", note: "From $755-780M (+$50M at both ends)" },
        adjNetIncome: { label: "Adj net income", low: 300, high: 330, unit: "USD millions", status: "RAISED", source: "MVW Q2 2026 release", note: "From $255-285M" },
        adjDilutedEps: { label: "Adj diluted EPS", display: "$8.25-9.05", status: "RAISED", source: "MVW Q2 2026 release", note: "From $7.05-7.80" },
        adjFreeCashFlow: { label: "Adj free cash flow", low: 410, high: 460, unit: "USD millions", status: "RAISED", source: "MVW Q2 2026 release", note: "From $375-425M; mid-50% conversion" },
        interestExpense: { label: "Interest expense, net", low: 174, high: 178, unit: "USD millions", status: "LOWERED", source: "MVW Q2 2026 release", note: "From $179-184M (favorable)" },
        nonCoreDispositions: { label: "Non-core disposition proceeds (thru 2027)", display: "~$200M gross", status: "LOWERED", source: "MVW Q2 2026 10-Q MD&A / call", note: "From $200-250M; NYC property retained for inventory. $50M realized Q1; ~$50M more expected 2H26." }
      },
      guidanceNote: "Guidance raised on contract sales, Adj EBITDA, adj net income, adj EPS and adj FCF on Aug 6, 2026. No Q3-specific guidance given; no explicit VPG or tour-growth guidance disclosed.",

      strategicInitiatives: [
        { title: "Inner Circle presented by Aflac — launched Jun 22, 2026", status: "LAUNCHED", detail: "Experiential event-marketing platform debuted with a Lee Brice headline event; five more events in Q2. ~50 events planned for 2026; 2027 goal of 'a couple of hundred headline events' and a target of 1,000 total events (20% headline / 80% regional). Early indicators in 2H June were 'above our expectations'.", announced: "Q2 2026 call (Flaskey)" },
        { title: "Premier Vacations point-of-sale incentive — launched Jun 9, 2026", status: "LAUNCHED", detail: "Buyer-incentive program (the program the Q1 call previewed as a late-May launch) designed to lift close rates and VPG. Note: not referred to as 'Dream Vacation Packages' in any Q2 primary source.", announced: "Q2 2026 call" },
        { title: "Loyalty overhaul — new Reserve and Pinnacle top tiers", status: "LAUNCHED", detail: "Two new tiers at the top of the owner-loyalty program plus enhanced Owner Benefit Levels in Q2; aimed at driving upgrade sales and future-tour pipeline. Average points owner holds just 1.3 weeks equivalency vs. a 3-4 week lifetime potential (Flaskey).", announced: "Q2 2026 call / 10-Q MD&A" },
        { title: "Tour Logistics algorithm + 'Connections' arrival-to-tour program", status: "IN FLIGHT", detail: "Algorithm matching inbound tour guests to sales executives launched in April; owner arrival-to-tour rate up 600 bps YoY. Together these drove the 33% owner-VPG lift.", announced: "Q2 2026 call" },
        { title: "Price increase — Jul 1, 2026", status: "COMPLETED", detail: "Flaskey: 'We increased prices on July 1, and our performance continues to be strong. We have confidence that there is still incremental price increase opportunity ahead.'", announced: "Q2 2026 call" },
        { title: "Hotel-linkage & partnership marketing (Bonvoy / World of Hyatt)", status: "IN FLIGHT", detail: "Package-sales linkage with '4 or 5 hotels today', to be 'aggressively expanded'; partnership-marketing team being built on the Marriott Bonvoy and World of Hyatt databases.", announced: "Q2 2026 call" },
        { title: "Asia-Pacific right-sizing", status: "IN FLIGHT", detail: "Tours reduced in select markets, staffing aligned, Khao Lak future phase deferred, Dubai sales gallery closed on geopolitical uncertainty. Regional inventory spend expected down $35M in 2026.", announced: "Q2 2026 call / 10-Q" },
        { title: "Investor Day — Dec 9, 2026, New York City", status: "NEW", detail: "First investor day under the Avril / Flaskey / Marino team.", announced: "Q2 2026 call" }
      ],

      segmentNote: "Segment revenue shown <strong>excluding cost reimbursements</strong>, with segment Adj EBITDA, from the Q2 2026 release. Unlike Q1, MVW's Q2 release discloses quarterly segment splits, so these are <strong>Q2 2026 figures</strong> (prior-year = Q2 2025).",
      segments: [
        {
          name: "Vacation Ownership",
          period: "Q2 2026 (rev. excl. cost reimbursements)",
          revenue: 853,
          revenuePrior: 775,
          adjEbitda: 246,
          adjEbitdaPrior: 231,
          margin: 28.9,
          share: 94,
          color: "#0862A7",
          source: "MVW Q2 2026 release, segment tables",
          description: "Sales of vacation ownership interests, financing income, resort management, rental, and ancillary services across the Marriott, Sheraton, Westin, Ritz-Carlton, St. Regis, Luxury Collection, and Hyatt timeshare brands. Q2 segment margin 28.9% (−90 bps) on higher S&M and unsold maintenance-fee expense. Development profit $106M (+16%); financing profit $50M (−5%); rental profit $33M (−7%)."
        },
        {
          name: "Exchange & Third-Party Management",
          period: "Q2 2026 (rev. excl. cost reimbursements)",
          revenue: 50,
          revenuePrior: 51,
          adjEbitda: 22,
          adjEbitdaPrior: 23,
          margin: 43.3,
          share: 6,
          color: "#D4AF37",
          source: "MVW Q2 2026 release, segment tables",
          description: "Interval International exchange (1.47M members, −2% YoY) and Aqua-Aston third-party management. Revenue −2%, Adj EBITDA −7%, margin 43.3% (−260 bps)."
        }
      ],

      brands: [
        { name: "Marriott Vacation Club", resorts: 65, keys: 19076, licensor: "Marriott International", source: "10-K FY2025, Item 1" },
        { name: "Sheraton Vacation Club", resorts: 9, keys: 4377, licensor: "Marriott International", source: "10-K FY2025, Item 1" },
        { name: "Westin Vacation Club", resorts: 12, keys: 4334, licensor: "Marriott International", source: "10-K FY2025, Item 1" },
        { name: "Hyatt Vacation Club", resorts: 22, keys: 2672, licensor: "Hyatt", source: "10-K FY2025, Item 1" },
        { name: "Grand Residences by Marriott", resorts: 2, keys: 381, licensor: "Marriott International", source: "10-K FY2025, Item 1" },
        { name: "The Ritz-Carlton Club", resorts: 5, keys: 259, licensor: "Marriott International", source: "10-K FY2025, Item 1" },
        { name: "St. Regis / Luxury Collection Residence Club", resorts: 3, keys: 83, licensor: "Marriott International", source: "10-K FY2025, Item 1" },
        { name: "Other (incl. unbranded)", resorts: 2, keys: 458, source: "10-K FY2025, Item 1" }
      ],

      geography: {
        summary: "120 vacation-ownership resorts across 13 countries; 90% of FY2025 contract sales originated in North America. Q2 2026: North America contract sales +27% and tours +3% while Asia-Pacific is intentionally right-sized (tours reduced in select markets, Khao Lak phase deferred, Dubai sales gallery closed). Inventory pipeline: Puerto Vallarta 64 units ($46M, 2028), Nashville 168 units ($122M, 2027), Bali 32 units.",
        regions: [
          { name: "Florida (US)", lat: 27.99, lng: -81.76, resorts: 23, keys: 8005, source: "10-K FY2025, Item 2" },
          { name: "California (US)", lat: 36.78, lng: -119.42, resorts: 17, keys: 6248, source: "10-K FY2025, Item 2" },
          { name: "Hawaii (US)", lat: 21.31, lng: -157.86, resorts: 13, keys: 4894, source: "10-K FY2025, Item 2" },
          { name: "Colorado (US)", lat: 39.55, lng: -105.78, resorts: 13, keys: 971, source: "10-K FY2025, Item 2" },
          { name: "South Carolina (US)", lat: 33.84, lng: -81.16, resorts: 10, keys: 1865, source: "10-K FY2025, Item 2" },
          { name: "Arizona (US)", lat: 34.05, lng: -111.09, resorts: 5, source: "10-K FY2025, Item 2" },
          { name: "Nevada (US)", lat: 36.17, lng: -115.14, resorts: 2, source: "10-K FY2025, Item 2" },
          { name: "Utah (US)", lat: 39.32, lng: -111.09, resorts: 2, source: "10-K FY2025, Item 2" },
          { name: "Missouri (US)", lat: 38.48, lng: -92.30, resorts: 2, source: "10-K FY2025, Item 2" },
          { name: "New York (US)", lat: 40.71, lng: -74.00, resorts: 2, source: "10-K FY2025, Item 2", note: "NYC property pulled from disposition list and moved to inventory trust (Q2 2026 call)" },
          { name: "Tennessee (US) — Nashville pipeline", lat: 36.16, lng: -86.78, note: "168 units committed for $122M in 2027", source: "MVW Q2 2026 10-Q" },
          { name: "Other US (MA, NM, NJ, TX, VA, DC)", lat: 39.50, lng: -98.35, resorts: 6, source: "10-K FY2025, Item 2" },
          { name: "Aruba", lat: 12.52, lng: -69.97, resorts: 2, keys: 1211, source: "10-K FY2025, Item 2" },
          { name: "Mexico", lat: 21.16, lng: -86.85, resorts: 4, keys: 1295, source: "10-K FY2025, Item 2", note: "Westin Cancun sold for $50M in Q1 2026; 64 Puerto Vallarta units ($46M) due 2028" },
          { name: "U.S. Virgin Islands", lat: 18.34, lng: -64.93, resorts: 3, keys: 513, source: "10-K FY2025, Item 2" },
          { name: "Bahamas", lat: 25.04, lng: -77.35, resorts: 1, keys: 382, source: "10-K FY2025, Item 2" },
          { name: "Puerto Rico", lat: 18.22, lng: -66.59, resorts: 1, source: "10-K FY2025, Item 2" },
          { name: "Costa Rica", lat: 9.93, lng: -84.09, resorts: 1, source: "10-K FY2025, Item 2" },
          { name: "France", lat: 48.86, lng: 2.78, resorts: 1, keys: 202, source: "10-K FY2025, Item 2" },
          { name: "Spain", lat: 36.51, lng: -4.88, resorts: 3, keys: 715, source: "10-K FY2025, Item 2" },
          { name: "United Kingdom", lat: 51.51, lng: -0.13, resorts: 1, keys: 49, source: "10-K FY2025, Item 2" },
          { name: "UAE — Dubai sales gallery (closed Q2 2026)", lat: 25.20, lng: 55.27, note: "Closed on heightened geopolitical uncertainty (10-Q MD&A)", source: "MVW Q2 2026 10-Q" },
          { name: "Indonesia", lat: -8.34, lng: 115.09, resorts: 2, keys: 161, source: "10-K FY2025, Item 2", note: "Bali: 32 units, remaining $11M paid post-quarter" },
          { name: "Thailand", lat: 7.88, lng: 98.39, resorts: 4, keys: 384, source: "10-K FY2025, Item 2", note: "Khao Lak future-phase purchase deferred; $37M remaining for 60 units" },
          { name: "Australia", lat: -28.00, lng: 153.43, resorts: 1, keys: 77, source: "10-K FY2025, Item 2" }
        ]
      },

      financials: {
        revenueTrend: [
          { year: 2023, value: 4727, source: "10-K FY2025, comparative" },
          { year: 2024, value: 4967, source: "10-K FY2025, comparative" },
          { year: 2025, value: 5032, source: "10-K FY2025" }
        ],
        ebitdaTrend: [
          { year: 2023, value: 761, source: "10-K FY2025, comparative" },
          { year: 2024, value: 736, source: "10-K FY2025, comparative" },
          { year: 2025, value: 751, source: "10-K FY2025" }
        ],
        contractSalesTrend: [
          { period: "Q2'25", value: 445, source: "MVW Q2 2026 release (prior-year)" },
          { period: "Q1'26", value: 411, source: "MVW Q1 2026 release" },
          { period: "Q2'26", value: 545, source: "MVW Q2 2026 release" },
          { period: "FY2025", value: 1762, source: "10-K FY2025" },
          { period: "FY2026E (guide mid)", value: 2098, source: "MVW 2026 guidance midpoint ($2,080-2,115M)" }
        ],
        contractSalesNote: "Q2'26 contract sales +22% YoY and +33% sequentially vs Q1'26. FY2026E bar is the raised guidance midpoint (~$2.1B, +19%).",
        debtStack: [
          { label: "Term Loan", value: 784, source: "MVW Q2 2026 10-Q, Note 12" },
          { label: "Revolver (drawn)", value: 145, source: "MVW Q2 2026 10-Q, Note 12" },
          { label: "2027 3.25% Convertible Notes", value: 575, source: "MVW Q2 2026 10-Q, Note 12" },
          { label: "2028 4.750% Notes", value: 350, source: "MVW Q2 2026 10-Q, Note 12" },
          { label: "2029 4.500% Notes", value: 500, source: "MVW Q2 2026 10-Q, Note 12" },
          { label: "2033 6.500% Notes", value: 575, source: "MVW Q2 2026 10-Q, Note 12" },
          { label: "Finance leases", value: 198, source: "MVW Q2 2026 10-Q, Note 12" },
          { label: "Securitized (non-recourse)", value: 2353, source: "MVW Q2 2026 release, A-11" }
        ],
        capitalReturn: {
          dividends: 82,
          buybacks: 0,
          remainingAuthorization: 322,
          source: "MVW Q2 2026 release / 10-Q",
          note: "1H 2026: $82M dividends ($0.80/qtr); no buybacks. $322M authorization through Dec 31, 2026."
        }
      },

      growth: [
        {
          headline: "Five-step commercial strategy — now producing",
          detail: "Per COO Flaskey on the Q2 call: (1) Connections — owner arrival-to-tour +600 bps; (2) Tour Logistics algorithm (April); (3) loyalty overhaul with Reserve and Pinnacle tiers; (4) Premier Vacations point-of-sale incentive (Jun 9); (5) Inner Circle presented by Aflac (Jun 22). Result: contract sales +22%, VPG +23%, owner contract sales +41%.",
          source: "Q2 2026 call (Flaskey)"
        },
        {
          headline: "Inner Circle event platform scaling to 1,000 events in 2027",
          detail: "~50 events in 2026; 2027 target of a couple hundred headline events and ~1,000 total (20% headline / 80% regional). Early 2H-June indicators 'above our expectations'. Platform is expected to drive higher-quality incremental tour flow and VPG with meaningful EBITDA impact in 2H 2026 and 2027.",
          source: "Q2 2026 call (Flaskey)"
        },
        {
          headline: "Owner upgrade runway — 1.3 weeks owned vs. 3-4 week potential",
          detail: "Average points owner owns just 1.3 weeks equivalency; Flaskey's 30-year experience suggests engaged brand-loyal owners buy 3-4 weeks over a lifetime. Q2 owner VPG +33% and owner contract sales +41% are the first evidence of this lever.",
          source: "Q2 2026 call (Flaskey)"
        },
        {
          headline: "Pricing power — Jul 1 increase with more to come",
          detail: "Prices raised Jul 1, 2026 with performance 'continuing to be strong'; management sees further price-increase opportunity. July contract sales ran consistent with the ~29% growth of May/June.",
          source: "Q2 2026 call (Flaskey / Marino)"
        },
        {
          headline: "Partnership marketing on Bonvoy + World of Hyatt",
          detail: "Hotel-linkage package sales at 4-5 hotels today, to be aggressively expanded; new partnership-marketing team leveraging the Marriott Bonvoy and World of Hyatt databases for first-time-buyer tour flow — the segment that declined 16% in Q2 and is the next lever.",
          source: "Q2 2026 call"
        },
        {
          headline: "Free-cash-flow inflection and deleveraging",
          detail: "1H 2026 adj FCF $201M vs $22M; FY guide raised to $410-460M (mid-50% conversion). Net corporate leverage 4.0x heading to the upper 3s by year-end; below 4x, share repurchases turn 'more opportunistic'. $3.20/share annualized dividend maintained.",
          source: "Q2 2026 release / call (Marino)"
        },
        {
          headline: "Capital-efficient inventory and Asia-Pac right-sizing",
          detail: "Asia-Pac inventory spend down $35M in 2026; Khao Lak phase deferred; committed pipeline in Nashville (168 units, 2027), Puerto Vallarta (64 units, 2028) and Bali. ~1.7 years of inventory supply. Non-core disposition target trimmed to ~$200M gross through 2027 after NYC was retained as inventory.",
          source: "Q2 2026 10-Q / call"
        }
      ],

      risks: [
        { title: "Travel disruption / discretionary demand", severity: 5, likelihood: 4, verbatim: "Our business may be adversely affected by factors that disrupt or deter travel.", source: "10-K FY2025, Item 1A", note: "Q2 2026: no demand weakness cited; 90% resort occupancy, ~65% owner occupancy. No weather event flagged (vs. Maui disruption in Q1)." },
        { title: "Macroeconomic & geopolitical uncertainty", severity: 4, likelihood: 4, verbatim: "Uncertainty in the current global macroeconomic environment created by rapid governmental policy and regulatory changes could negatively impact our business.", source: "10-K FY2025, Item 1A", note: "Q2 2026: Dubai sales gallery closed on 'heightened geopolitical uncertainty in the region' (10-Q MD&A)." },
        { title: "Inflation / interest-rate sensitivity", severity: 4, likelihood: 4, verbatim: "Significant inflation, higher interest rates or deflation could adversely affect our business and financial results.", source: "10-K FY2025, Item 1A", note: "Q2 2026: interest-expense guide lowered to $174-178M; Q2 securitization priced at 4.86% weighted average." },
        { title: "Default rates above projections", severity: 4, likelihood: 3, verbatim: "If default rates increase beyond current projections and result in higher than expected foreclosure activity, our results of operations would be adversely affected.", source: "10-K FY2025, Item 1A", note: "Q2 2026: estimated remaining default rate 13.05% (vs 13.51% at YE2025); sub-120-day delinquencies −54 bps; financed-buyer FICO 756 (vs 742). Sales reserve raised to 13.4% of contract sales on higher financing propensity (66%). 'July actually finished up with good results as well' (Marino)." },
        { title: "Inventory mismatch", severity: 3, likelihood: 3, verbatim: "We may not have inventory available for sale when needed or we may have excess inventory.", source: "10-K FY2025, Item 1A", note: "Q2 2026: $902M inventory (~1.7 years supply); 10-Q flags cost of VO products as % of revenue 'expected to increase during the remainder of 2026'. NYC property retained for inventory; Khao Lak phase deferred." },
        { title: "Brand-license termination", severity: 5, likelihood: 1, verbatim: "The termination of our license agreements with Marriott International or Hyatt, or our rights to use their trademarks at our existing or future properties, could materially harm our business.", source: "10-K FY2025, Item 1A", note: "Marriott / Hyatt licenses extend to 2090-2095. Q2 call emphasized deeper Bonvoy / World of Hyatt marketing integration." },
        { title: "Spanish timeshare litigation", severity: 3, likelihood: 4, verbatim: "Spanish court rulings voiding certain timeshare contracts have increased our exposure to litigation that may materially adversely affect our business and financial condition.", source: "10-K FY2025, Item 1A", note: "Not specifically updated in Q2 2026 materials." },
        { title: "Turnaround execution & leadership-team churn", severity: 4, likelihood: 3, verbatim: "Effects of steps we have taken and may continue to take to reduce operating costs and accelerate growth and profitability.", source: "10-K FY2025, Item 1A (forward-looking factors)", note: "ANALYST OVERLAY: Q2 delivered, but the raised guide implies +25-29% 2H contract-sales growth with Inner Circle scaling from ~50 to ~1,000 events. EVP Chief Brand & Digital Officer role eliminated Jul 31, 2026 (8-K); CFO re-signed with a transformation award tied to $115/$145/$215 stock hurdles." },
        { title: "Margin pressure from upfront S&M investment and reportability (Q2 2026)", severity: 3, likelihood: 4, verbatim: "Simply put, we don't recognize revenue from contracts sold in the last 10 days of the quarter as they are still in the rescission period. However, we do recognize most of the sales and marketing costs. This negatively impacted development profit by $15 million in the quarter.", source: "MVW Q2 2026 call (CFO Marino)", note: "Q2 EMERGENT: Adj EBITDA margin −90 bps YoY (23.4%); VO segment margin −90 bps on higher S&M and unsold maintenance fees. Mgmt expects S&M as % of development revenue to decline in 2H and 'nice margin improvement'. Risk: in a fast-growth quarter, reportability keeps masking true run-rate profit." },
        { title: "First-time-buyer softness vs. owner strength (Q2 2026)", severity: 3, likelihood: 3, verbatim: "First-time buyer contract sales decreased 16% due to lower VPG and Tours.", source: "MVW Q2 2026 10-Q, MD&A", note: "Q2 EMERGENT: growth is owner-led (+41%); first-time-buyer sales fell 16%. Long-run owner-base replenishment depends on partnership marketing (Bonvoy / Hyatt) and Inner Circle ramp. Watch new-buyer mix through 2H." },
        { title: "Guidance credibility after a step-change raise (Q2 2026)", severity: 3, likelihood: 3, verbatim: "Given our Q2 contract sales and the strong momentum that continued into July, we now expect contract sales to increase 18% to 20% for the year, implying 25% to 29% growth in the second half.", source: "MVW Q2 2026 call (CFO Marino)", note: "ANALYST OVERLAY: VAC rose 56% in Q2 and ~8% on the print; the raised guide now embeds a 2H acceleration that has only one month (July) of evidence. Investor Day Dec 9 is the next checkpoint." }
      ],

      transcriptPanel: {
        title: "Q2 2026 earnings call — Aug 6, 2026 transcript highlights",
        intro: "<strong>Q2 2026 earnings call</strong> · CEO Matt Avril, President &amp; COO Mike Flaskey, and CFO Jason Marino. The first quarter in which the commercial-turnaround program launched on the May 5 call showed up in reported results."
      },
      transcriptQuotes: [
        { speaker: "Matt Avril, CEO", topic: "results", text: "In the second quarter, we exceeded the high end of our guidance for both contract sales and adjusted EBITDA. Contract sales increased 22% over prior year, driven by our industry-leading VPGs of $4,477. Owner contract sales increased 41% compared to the prior year, driven by a 33% lift in owner VPG." },
        { speaker: "Matt Avril, CEO", topic: "Asia-Pacific", text: "We also rightsized our Asia Pacific business and are seeing the benefits of those actions in our cash flow. Our inventory spending in that region is expected to be down $35 million this year compared to last year." },
        { speaker: "Mike Flaskey, President & COO", topic: "momentum", text: "Each month of the quarter got sequentially better, including May and June, which were the 2 highest sales months in the company's history." },
        { speaker: "Mike Flaskey, President & COO", topic: "pricing", text: "We increased prices on July 1, and our performance continues to be strong. We have confidence that there is still incremental price increase opportunity ahead." },
        { speaker: "Mike Flaskey, President & COO", topic: "Inner Circle scale", text: "We have plans to do about 50 in 2026… So when we get to 2027, our goal is to do a couple of hundred headline events, and I would say, target 1,000 events for the full year 2027." },
        { speaker: "Mike Flaskey, President & COO", topic: "owner upgrade runway", text: "Our average points owner owns just 1.3 weeks equivalency of ownership. In my 30 years in this industry, my experience would indicate that owners with a high affinity for brands and with strong engagement will purchase 3 to 4 weeks equivalent over the lifetime of their ownership." },
        { speaker: "Jason Marino, CFO", topic: "reportability", text: "Simply put, we don't recognize revenue from contracts sold in the last 10 days of the quarter as they are still in the rescission period. However, we do recognize most of the sales and marketing costs. This negatively impacted development profit by $15 million in the quarter." },
        { speaker: "Jason Marino, CFO", topic: "sales reserve", text: "Sales reserve was 13.4% of contract sales in the quarter. Given the significant 22% increase in contract sales, we determined it was prudent to increase our sales reserve measured as a percentage of our contract sales this quarter and expect a similar rate in the second half of the year." },
        { speaker: "Jason Marino, CFO", topic: "guidance", text: "Given our Q2 contract sales and the strong momentum that continued into July, we now expect contract sales to increase 18% to 20% for the year, implying 25% to 29% growth in the second half." },
        { speaker: "Jason Marino, CFO", topic: "capital allocation", text: "As we get below 4x, we can be more opportunistic in terms of share repurchases, and we'll evaluate that strategy on a continuous basis as we go forward." }
      ],

      recentCall: {
        period: "Q2 2026",
        date: "2026-08-06",
        sourceLabel: "MVW Q2 2026 earnings call transcript (Aug 6, 2026)",
        sourceUrl: "https://www.fool.com/earnings/call-transcripts/2026/08/13/marriott-vacations-vac-q2-2026-earnings-call-transcript/",
        items: [
          "Q2 specifics: revenue $1,320M (+6%; +10% ex-reimbursements); Adj EBITDA $215M (+6%, ~$20M above Q2 guide midpoint); adj diluted EPS $2.31 (+18%); GAAP diluted EPS $2.12 (+20%); net income $77M (+11%).",
          "Contract sales $545M (+22%; North America +27%); VPG $4,477 (+23%); tours 112,721 (−1%; NA +3%); owner contract sales +41% on owner VPG +33% and owner tours +7%; first-time-buyer contract sales −16%.",
          "Monthly cadence: April +8% (per Q1 call) implies ~29% growth in May/June — the two best sales months in company history; July 'largely consistent with the May and June numbers' (Marino).",
          "2026 guidance RAISED: contract sales $2,080-2,115M (+18-20%); Adj EBITDA $805-830M (from $755-780M); adj net income $300-330M; adj EPS $8.25-9.05; adj FCF $410-460M; interest expense lowered to $174-178M.",
          "Commercial program: Premier Vacations incentive launched Jun 9; Inner Circle presented by Aflac launched Jun 22 (Lee Brice) with ~50 events in 2026 and a 1,000-event target for 2027; Reserve and Pinnacle loyalty tiers; Tour Logistics algorithm (April); owner arrival-to-tour +600 bps; Jul 1 price increase.",
          "Credit: sales reserve 13.4% of contract sales (+~20 bps YoY) on 66% financing propensity; financed-buyer FICO 756 (vs 742); sub-120-day delinquencies −54 bps; down payments mid-to-high 20s incl. equity; 'July actually finished up with good results'.",
          "Balance sheet: $928M liquidity ($211M cash + $650M revolver); corporate debt $3.1B; securitized debt $2.35B; net corporate leverage 4.0x (from 4.2x), targeting upper 3s by YE; $460M MVW 2026-1 securitization at 4.86% weighted average; warehouse revolving period extended to Jun 2028.",
          "Cash flow: Q2 adj FCF $87M; 1H adj FCF $201M (vs $22M); FY conversion mid-50%. No buybacks in 1H; $322M authorization through Dec 31, 2026; $0.80 quarterly dividend maintained (Q3 declared Sep 2).",
          "Asia-Pac right-sized (inventory spend −$35M in 2026; Khao Lak deferred; Dubai gallery closed); non-core disposition target trimmed to ~$200M gross through 2027 after retaining the NYC property as inventory; Puerto Vallarta (64 units, $46M, 2028) and Nashville (168 units, $122M, 2027) in pipeline.",
          "Leadership: CFO Marino signed a new agreement (Jul 30) with a 'CFO Transformation Award' tied to stock-price and Adj EBITDA hurdles; EVP Chief Brand & Digital Officer position eliminated Jul 31. Investor Day Dec 9, 2026 (NYC)."
        ]
      },

      sources: [
        { label: "MVW Q2 2026 earnings press release (8-K Ex. 99.1, Aug 6, 2026)", url: "https://www.sec.gov/Archives/edgar/data/1524358/000152435826000035/a2026q2pressreleaseschedul.htm" },
        { label: "MVW Q2 2026 Form 10-Q (filed Aug 6, 2026)", url: "https://www.sec.gov/Archives/edgar/data/1524358/000152435826000037/vac-20260630.htm" },
        { label: "MVW Q2 2026 earnings-call transcript (Motley Fool)", url: "https://www.fool.com/earnings/call-transcripts/2026/08/13/marriott-vacations-vac-q2-2026-earnings-call-transcript/" },
        { label: "MVW 8-K — CFO employment agreement (Jul 30, 2026)", url: "https://www.sec.gov/Archives/edgar/data/1524358/000152435826000031/vac-20260730.htm" },
        { label: "MVW Q1 2026 earnings release (May 5, 2026) — prior-quarter context", url: "https://ir.marriottvacationsworldwide.com/news-releases" },
        { label: "FY2025 10-K (filed Feb 2026)", url: "https://www.sec.gov/Archives/edgar/data/1524358/000152435826000010/vac-20251231.htm" },
        { label: "EDGAR filings index (CIK 0001524358)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001524358" },
        { label: "Investor Relations", url: "https://ir.mvwc.com" }
      ]
    },

    // -----------------------------------------------------------------------
    // HGV — Hilton Grand Vacations Inc. (NYSE: HGV)
    // -----------------------------------------------------------------------
    hgv: {
      slug: "hgv",
      name: "Hilton Grand Vacations",
      shortName: "HGV",
      ticker: "HGV",
      exchange: "NYSE",
      brandColor: "#002C51",
      brandAccent: "#002C51",
      brandSoft: "#001628",
      hq: "Orlando, Florida",
      foundedSpinOff: "Became an independent public company on January 3, 2017 (spun off from Hilton Worldwide Holdings)",
      ceo: { name: "Mark D. Wang", title: "President & CEO", note: "CEO since 2017 spin-off" },
      cfo: { name: "Daniel J. Mathewes", title: "President & CFO" },
      employees: { value: 22300, source: "10-K FY2025 (most recent)" },
      fiscal: {
        year: 2026,
        period: "Q2 2026 (quarter ended June 30, 2026)",
        filingType: "Q2 2026 earnings release / Form 10-Q",
        releaseDate: "2026-07-30",
        callDate: "2026-07-30",
        callTime: "9:00am ET",
        sourceUrl: "https://www.sec.gov/Archives/edgar/data/1674168/000167416826000098/hgvq22026earningsreleaseex.htm"
      },
      narrative: {
        oneLiner: "Largest timeshare operator under the Hilton brand — 722K Club members, $1.36B Q2 revenue, and the quarter's execution stumble: contract sales −3% and VPG −8.6% on Bluegreen sales-leadership issues, offset by cost discipline that held the EBITDA guide.",
        history: "Spun off from Hilton in 2017. Acquired Diamond Resorts (August 2021) and Bluegreen Vacations (closed January 17, 2024 for $1.6B inclusive of net debt). The combination roughly doubled HGV's footprint and added Hilton Vacation Club, Hilton Club, and Bluegreen brands plus exclusive marketing alliances with Bass Pro Shops and Choice Hotels.",
        currentChapter: "Q2 2026 was a tale of two halves of the P&L. Tours grew 6% to 239K (fourth straight quarter of growth) and the cost side delivered — real-estate margin ex-deferrals +220 bps to 28%, adj EPS $0.89 vs $0.54, Adj EBITDA ex-deferrals $293M (+5%). But contract sales fell 3% to $810M and VPG dropped 8.6% to $3,372 as Bluegreen lapped a +45% VPG launch quarter and, per CEO Wang, 'sales execution fell short' at two high-volume locations — 'not a market issue or an integration issue… a leadership issue' now addressed with new leaders. HGV reiterated 2026 Adj EBITDA of $1.225-1.265B but cut the contract-sales outlook to flat/down slightly and VPG to down low-to-mid single digits (Q3 VPG down high single digits). Capital return stayed on plan: $150M Q2 buybacks, $300M 1H (~10% of float), Elara buyout closed Apr 29, two ABS deals, a $48M disposition loss, and an $850M term-loan refinancing to 2033 on Jul 17."
      },

      q2Headline: {
        revenue: { value: 1358, priorQ: 1266, unit: "USD millions", source: "HGV Q2 2026 release (Jul 30, 2026), T-4", note: "+7.3% YoY; net construction-deferral impact on revenue $(54)M vs $(82)M" },
        adjEbitda: { value: 293, priorQ: 278, unit: "USD millions", source: "HGV Q2 2026 call (CFO Mathewes): $293M excl. deferrals, 'grew 5%'", calc: "Prior-year ex-deferrals = $233M reported + $45M deferral (calculated from disclosed inputs)", note: "Excl. construction deferrals — the basis of HGV's guidance. Reported Adj EBITDA attributable $265M vs $233M (+14%)." },
        adjEbitdaReported: { value: 265, priorQ: 233, unit: "USD millions", source: "HGV Q2 2026 release, T-1/T-7", note: "Adj EBITDA attributable to stockholders, as reported (incl. $(28)M Hawaii deferral)" },
        adjEbitdaMargin: { value: 23.0, unit: "percent", source: "HGV Q2 2026 call (Mathewes)", note: "Excl. cost reimbursements & deferrals; +40 bps YoY. Reported margin on total revenues 19.8% (+100 bps)." },
        netIncome: { value: 12, priorQ: 25, unit: "USD millions", source: "HGV Q2 2026 release, T-4", note: "Net income attributable to stockholders; includes $48M loss on sale/impairment from the Jun 30 disposition" },
        dilutedEps: { value: 0.15, priorQ: 0.25, unit: "USD per share", source: "HGV Q2 2026 release, T-4", note: "Deferral impact $(0.35)/share" },
        adjDilutedEps: { value: 0.89, priorQ: 0.54, unit: "USD per share", source: "HGV Q2 2026 release, T-15", note: "+65% YoY; diluted shares 80.9M vs 92.2M" },
        adjNetIncome: { value: 72, priorQ: 50, unit: "USD millions", source: "HGV Q2 2026 release, T-15", note: "Attributable to stockholders" },
        contractSales: { value: 810, priorQ: 834, unit: "USD millions", source: "HGV Q2 2026 release, T-8", note: "−$24M / −3% YoY; owned mix 87.2% (fee-for-service 12.8% vs 17.0%)" },
        vpg: { value: 3372, priorQ: 3690, unit: "USD per guest", source: "HGV Q2 2026 release, T-8", note: "−8.6% YoY; Bluegreen VPG was +45% in Q2'25 launch quarter (Wang)" },
        tours: { value: 239064, priorQ: 225222, unit: "tours", source: "HGV Q2 2026 release, T-8", note: "+6.1% YoY; fourth consecutive quarter of consolidated tour growth; new-buyer tours high-single-digit growth" },
        members: { value: 721896, priorQ: 724306, unit: "Club members", source: "HGV Q2 2026 release, T-10", note: "−0.3% YoY" },
        hgvMax: { value: 300000, unit: "HGV Max members (approx.)", source: "HGV Q2 2026 call (Wang)", note: "'Nearly 300,000, or 40% of our base… growing 24% versus the prior year'; Bluegreen Max ~22,000 (more than doubled)" },
        newBuyerShare: { value: 28, unit: "percent of contract-sales volume", source: "HGV Q2 2026 call (Mathewes)", note: "+70 bps YoY; close rates stable" },
        realEstateMargin: { value: 28, unit: "percent", source: "HGV Q2 2026 call (Mathewes)", note: "Real-estate profit excl. deferrals $173M (+7%); margin +220 bps. Reported real-estate margin 25.4% vs 21.2%." },
        defaultRate: { value: null, unit: "percent", source: "HGV Q2 2026 release / 10-Q / call", display: "Not disclosed", note: "No annualized default rate given in Q2 materials (10.1% was disclosed on the Q1 call). 31-60 day delinquency 'remains stable for all three portfolios'; 31-90 day delinquencies down 9 bps from year-end (Mathewes)." },
        loanLossProvision: { value: 122, priorQ: 95, unit: "USD millions", source: "HGV Q2 2026 release, T-8", note: "Provision for financing receivables losses" },
        loanLossProvisionRate: { value: 17, unit: "percent of owned contract sales", source: "HGV Q2 2026 call (Mathewes)", note: "Up YoY but 'within our targeted mid-teen range'; back half expected 'marginally better'. Q1 2026 rate was 14.9%." },
        allowance: { value: 1400, unit: "USD millions", source: "HGV Q2 2026 call (Mathewes)", note: "'$1.4 billion on that $5 billion receivable balance, or 28% of the portfolio'" },
        feeForServiceMix: { value: 12.8, priorQ: 17.0, unit: "percent of contract sales", source: "HGV Q2 2026 release, T-8" },
        ownedMix: { value: 87.2, priorQ: 83.0, unit: "percent of contract sales", source: "HGV Q2 2026 release, T-8", note: "JIT mix not separately disclosed; Elara shifts ~3% of contract sales from fee-for-service to owned" },

        // Trailing FY2025 anchors
        revenueFY: { value: 5047, prior: 4981, unit: "USD millions", source: "10-K FY2025" },
        adjEbitdaFY: { value: 969, prior: 1094, unit: "USD millions", source: "10-K FY2025" },
        adjEbitdaMarginFY: { value: 19.2, unit: "percent", source: "10-K FY2025" },
        contractSalesFY: { value: 3314, prior: 3002, unit: "USD millions", source: "10-K FY2025" },
        vpgFY: { value: 3851, prior: 3572, unit: "USD per guest", source: "10-K FY2025" },
        toursFY: { value: 856676, prior: 835181, unit: "tours", source: "10-K FY2025" },
        owners: { value: 722000, unit: "Club members", source: "HGV Q2 2026 release", note: "721,896 total Club members at Jun 30, 2026" },
        avgFico: { value: 747, priorQ: 751, unit: "FICO", source: "HGV Q2 2026 10-Q, MD&A", note: "Weighted-average FICO at origination (U.S./Canada, six months ended Jun 30); single-FICO methodology adopted Q1 2026" },

        // Market cap as of end of Q2 2026
        marketCapEoq: { value: 4237, unit: "USD millions", source: "calculated from disclosed inputs: Jun 30, 2026 close $52.37 (Yahoo Finance) × Q2 2026 weighted-avg diluted shares 80.9M (release T-15)" },
        priceEoq: { value: 52.37, unit: "USD per share", source: "Yahoo Finance (Jun 30, 2026 close)" },
        priceSoq: { value: 39.12, unit: "USD per share", source: "Yahoo Finance (Mar 31, 2026 close)" },
        q2PricePerformance: { value: 33.87, unit: "percent", source: "calculated from disclosed inputs: ($52.37 / $39.12) − 1", note: "Q2 2026 price-only return, ex-dividends (HGV pays none)" },
        dilutedShares: { value: 80.9, unit: "millions of weighted-avg diluted shares", source: "HGV Q2 2026 release, T-15" },

        // Capital / balance sheet (June 30, 2026)
        corporateDebt: { value: 4900, unit: "USD millions", source: "HGV Q2 2026 release", note: "Net; weighted avg rate 5.626%. $850M TLB refinanced to Jul 2033 on Jul 17, 2026 (post-quarter)." },
        securitizedDebt: { value: 2900, unit: "USD millions", source: "HGV Q2 2026 release", note: "Non-recourse, net; weighted avg rate 5.035%; includes $293M of Elara receivables securitized" },
        netLeverage: { value: 3.8, unit: "x", source: "HGV Q2 2026 call (Mathewes)", note: "TTM, pro forma; 'consistent with year-end levels and down 0.1 turns compared to Q1'" },
        cash: { value: 272, unit: "USD millions", source: "HGV Q2 2026 release" },
        restrictedCash: { value: 296, unit: "USD millions", source: "HGV Q2 2026 release" },
        revolverCapacity: { value: 463, unit: "USD millions", source: "HGV Q2 2026 release", note: "Remaining capacity; total liquidity $735M" },
        liquidity: { value: 735, unit: "USD millions", source: "HGV Q2 2026 release", note: "$272M cash + $463M revolver capacity; Timeshare Facility $755M remaining of $1.0B (upsized May 2026)" },
        timeshareFacilityCapacity: { value: 755, unit: "USD millions", source: "HGV Q2 2026 10-Q", note: "Facility renewed May 2026, upsized $850M → $1.0B, commitment to May 2028" },

        freeCashFlow: { value: 113, priorQ: 28, unit: "USD millions", source: "HGV Q2 2026 release, T-5" },
        adjFreeCashFlow: { value: 180, priorQ: 135, unit: "USD millions", source: "HGV Q2 2026 release, T-5", note: "61% conversion in Q2; FY conversion guided to lower half of 55-65%" },
        adjFreeCashFlowYtd: { value: 143, priorQ: 319, unit: "USD millions", source: "HGV Q2 2026 release, T-5", note: "1H 2026 vs 1H 2025; driven by net non-recourse debt activity $(125)M vs +$179M" },
        operatingCashFlow: { value: 134, priorQ: 62, unit: "USD millions", source: "HGV Q2 2026 release, T-5" },
        buybacks: { value: 150, unit: "USD millions", source: "HGV Q2 2026 release", note: "3.1M shares in Q2 (incl. 750K at $50.00 from Apollo's June secondary); 1H $300M / 6M shares; Jul 1-23 another $25M / 488K shares" },
        remainingAuth: { value: 103, unit: "USD millions", source: "HGV Q2 2026 release / 10-Q", note: "As of Jul 23, 2026 under the $600M two-year 2025 plan ($128M at Jun 30). No new authorization announced." },
        dividendsPaidYtd: { value: 0, unit: "USD millions", source: "HGV Q2 2026 release", note: "HGV pays no common dividend" },

        resorts: { value: 200, unit: "properties (>200)", source: "10-K FY2025, Item 2" },
        salesCenters: { value: 100, unit: "sales distribution centers (>100)", source: "10-K FY2025" }
      },

      guidance: {
        adjEbitda: { label: "Adj EBITDA (excl. deferrals)", low: 1225, high: 1265, unit: "USD millions", status: "REAFFIRMED", source: "HGV Q2 2026 release", note: "'Reiterating'; Q1 had raised from $1,185-1,225M" },
        contractSalesGrowth: { label: "Contract sales (FY)", value: "Flat to down slightly", status: "LOWERED", source: "HGV Q2 2026 call (Mathewes)", note: "From slight gain; Q3 down mid-single digits" },
        vpgGrowth: { label: "VPG (FY)", value: "Down low-to-mid single digits", status: "LOWERED", source: "HGV Q2 2026 call (Mathewes)", note: "From flat to down slightly; Q3 down high single digits" },
        toursGrowth: { label: "Tours (FY)", value: "Low-to-mid single-digit growth", status: "REAFFIRMED", source: "HGV Q2 2026 call", note: "Q3 low-single-digit growth" },
        fcfConversion: { label: "Adj FCF conversion", value: "Lower half of 55-65%", status: "UPDATED", source: "HGV Q2 2026 call (Mathewes)" },
        buybackPace: { label: "Buyback pace", value: 150, unit: "USD millions / quarter", status: "REAFFIRMED", source: "HGV Q2 2026 call (Mathewes)", note: "'Subject to the repurchase activity not increasing our net leverage for the full year'" }
      },
      guidanceNote: "Adj EBITDA guide reiterated at $1.225-1.265B (excl. deferrals) on Jul 30, 2026, while contract-sales and VPG outlooks were cut. Holding the EBITDA range relies on cost discipline, lower provision, cost-of-product benefit and inventory recapture rather than a sales recovery (Mathewes, Q&A).",

      strategicInitiatives: [
        { title: "Bluegreen sales-leadership reset (Orlando, Myrtle Beach)", status: "IN FLIGHT", detail: "Wang: 'It's not a market issue or an integration issue. It really was a leadership issue, and we've identified the issue. We've addressed the situation with the leadership changes.' Performance expected to improve through Q3 and return to expectation by Q4.", announced: "Q2 2026 call" },
        { title: "Elara JV buyout — closed Apr 29, 2026", status: "CLOSED", detail: "Remaining 75% of BRE Ace LLC for $131M cash; acquired $411M receivables ($293M securitized). ~$3M EBITDA in Q3, ~$20M FY2026, $25-30M annualized in 2027; 'in line slightly better than our expectations'.", announced: "Q2 2026 10-Q / call" },
        { title: "Non-core disposition — closed Jun 30, 2026", status: "CLOSED", detail: "$48M non-cash loss on sale; $10-12M run-rate maintenance-fee relief (minimal 2026 impact); HGV participates in proceeds when the buyer sells the properties. No further dispositions to be announced in 2026.", announced: "Q2 2026 release / 10-Q Note 19" },
        { title: "$850M Term Loan B refinanced to 2033 — Jul 17, 2026", status: "COMPLETED", detail: "New TLB due Jul 17, 2033 repays ~$849M TLB due 2028; pricing unchanged at SOFR+2.00%; 0.25% quarterly amortization from Q4 2026.", announced: "8-K Jul 17, 2026" },
        { title: "Two ABS securitizations ($500M Apr; $300M Jun)", status: "COMPLETED", detail: "2026-1: ~$500M receivables, notes 4.67-7.21%, 98% advance rate. 2026-2: ~$300M receivables, notes 4.83-6.00%, 98% advance rate. Timeshare Facility renewed and upsized to $1.0B (May 2026).", announced: "Q2 2026 10-Q Note 11" },
        { title: "HGV Max + Ultimate Access scaling", status: "IN FLIGHT", detail: "HGV Max ~300K members (40% of base, +24%); Bluegreen Max ~22K (more than doubled). Ultimate Access hosted 137K+ guests over the past year incl. World Cup events in NY/Miami/LA; new member-flexibility tools launched.", announced: "Q2 2026 call" },
        { title: "Ocean Reserve, a Hilton Grand Vacations Club — Myrtle Beach", status: "NEW", detail: "227-unit oceanfront project adjacent to Ocean 22 with Strand Capital Group (sixth joint project). Construction began Dec 2025; sales began July 2026; occupancy expected Q2 2028.", announced: "HGV corporate release, Aug 2026" }
      ],

      segmentNote: "Segment revenue and Adj EBITDA from the Q2 2026 release (reported basis, incl. construction deferrals). Prior-year = Q2 2025.",
      segments: [
        {
          name: "Real Estate Sales & Financing",
          period: "Q2 2026",
          revenue: 809,
          revenuePrior: 760,
          adjEbitda: 211,
          adjEbitdaPrior: 176,
          margin: 26.1,
          share: 65,
          color: "#002C51",
          source: "HGV Q2 2026 release, T-6/T-7",
          description: "Sales of VOIs (net), sales/marketing/brand fees, and consumer financing. Reported real-estate margin 25.4% (vs 21.2%); excl. deferrals $173M profit at 28% (+220 bps). Financing revenue $144M (+14%), profit $86M, margin 59.7%."
        },
        {
          name: "Resort Operations & Club Management",
          period: "Q2 2026",
          revenue: 430,
          revenuePrior: 405,
          adjEbitda: 154,
          adjEbitdaPrior: 149,
          margin: 35.8,
          share: 35,
          color: "#D4AF37",
          source: "HGV Q2 2026 release, T-6/T-7",
          description: "Club & resort management revenue $189M (profit $128M, 67.7% margin); rental & ancillary revenue $210M with a $(10)M loss driven by developer maintenance fees on unsold inventory."
        }
      ],

      brands: [
        { name: "Hilton Grand Vacations Club", type: "Core club", source: "10-K FY2025, Item 1" },
        { name: "Hilton Club", type: "Premium urban product (NYC, etc.)", source: "10-K FY2025, Item 1" },
        { name: "HGV Max", type: "Top-tier owner program — ~300K members, 40% of base (+24% YoY in Q2'26)", source: "Q2 2026 call" },
        { name: "Hilton Vacation Club", type: "Mid-tier (legacy Diamond properties)", source: "10-K FY2025, Item 1" },
        { name: "Bluegreen Vacations", type: "Legacy Bluegreen; Bluegreen Max ~22K members; Q2'26 sales-leadership changes at Orlando & Myrtle Beach", source: "Q2 2026 call" },
        { name: "Big Cedar Lodge", type: "JV (HGV 51% / 49%); 4 wilderness resorts via Bass Pro/Bluegreen alliance", source: "10-K FY2025, Item 1" },
        { name: "Elara, a Hilton Grand Vacations Club", type: "Las Vegas flagship — 100% owned since Apr 29, 2026 ($131M)", source: "Q2 2026 10-Q" },
        { name: "Ocean Reserve, a Hilton Grand Vacations Club", type: "Myrtle Beach — 227 units, sales began Jul 2026, occupancy Q2 2028", source: "HGV release, Aug 2026" },
        { name: "Diamond Resorts (legacy)", type: "Legacy properties being converted to Hilton brand standards", source: "10-K FY2025, Item 1" }
      ],

      geography: {
        summary: ">200 properties in the United States, Europe, Canada, the Caribbean, Mexico, and Asia. Concentration in Florida, Hawaii, South Carolina, California, Arizona, Nevada, and Virginia. Q2 2026 developments: Elara (Las Vegas) now 100% owned; Hawaii project drove the $28M construction deferral; Myrtle Beach adds Ocean Reserve (227 units); Bluegreen Orlando and Myrtle Beach sales centers received new leadership. Resort-level country breakdown not disclosed — markers represent disclosed concentrations.",
        regions: [
          { name: "Florida (US) — concentration market", lat: 27.99, lng: -81.76, note: "Disclosed as concentration market; Bluegreen Orlando sales-center leadership change Q2'26", source: "10-K FY2025, Item 1A / Q2 2026 call" },
          { name: "Hawaii (US) — concentration market", lat: 21.31, lng: -157.86, note: "Hawaii project is the source of the Q2'26 $28M net construction deferral", source: "10-K FY2025 / Q2 2026 release" },
          { name: "Nevada / Las Vegas — Elara flagship (100% owned)", lat: 36.17, lng: -115.14, note: "Elara buyout closed Apr 29, 2026; primary call-center & sales hub", source: "Q2 2026 10-Q" },
          { name: "South Carolina (US) — Myrtle Beach", lat: 33.69, lng: -78.89, note: "Ocean Reserve (227 units) sales began Jul 2026; Bluegreen Myrtle Beach leadership change", source: "HGV release Aug 2026 / Q2 2026 call" },
          { name: "California (US) — concentration market", lat: 36.78, lng: -119.42, note: "Disclosed as concentration market", source: "10-K FY2025, Item 1A" },
          { name: "Arizona (US) — concentration market", lat: 34.05, lng: -111.09, note: "Disclosed as concentration market", source: "10-K FY2025, Item 1A" },
          { name: "Virginia (US) — concentration market", lat: 37.43, lng: -78.66, note: "Disclosed as concentration market", source: "10-K FY2025, Item 1A" },
          { name: "Orlando — corporate HQ + call center", lat: 28.54, lng: -81.46, note: "HQ at 6355 MetroWest Blvd", source: "10-K FY2025, Item 2" },
          { name: "New York City — Hilton Club urban product", lat: 40.71, lng: -74.00, note: "Hilton Club premium urban portfolio; World Cup Ultimate Access events", source: "10-K FY2025 / Q2 2026 call" },
          { name: "United Kingdom — Europe operations", lat: 51.51, lng: -0.13, note: "UK call-center; European resort presence", source: "10-K FY2025, Item 1" },
          { name: "Europe (Mediterranean)", lat: 41.90, lng: 12.50, note: "European resort presence", source: "10-K FY2025, Item 1" },
          { name: "Mexico", lat: 21.16, lng: -86.85, note: "Resort presence", source: "10-K FY2025, Item 1" },
          { name: "Caribbean", lat: 18.34, lng: -64.93, note: "Resort presence", source: "10-K FY2025, Item 1" },
          { name: "Canada", lat: 56.13, lng: -106.35, note: "Resort presence", source: "10-K FY2025, Item 1" },
          { name: "Asia (Japan)", lat: 35.69, lng: 139.69, note: "Asian resort presence; Japan project deferral lapped in Q2'25", source: "10-K FY2025 / Q2 2026 release" },
          { name: "Bass Pro / Cabela's footprint (US)", lat: 39.50, lng: -98.35, note: "10-year exclusive marketing agreement (Nov 2023); not updated on Q2 call", source: "Q2 2026 10-Q" }
        ]
      },

      financials: {
        revenueTrend: [
          { year: 2023, value: 3978, source: "10-K FY2025, comparative" },
          { year: 2024, value: 4981, source: "10-K FY2025, comparative" },
          { year: 2025, value: 5047, source: "10-K FY2025" }
        ],
        ebitdaTrend: [
          { year: 2023, value: 1005, source: "10-K FY2025, comparative" },
          { year: 2024, value: 1094, source: "10-K FY2025, comparative" },
          { year: 2025, value: 969, source: "10-K FY2025" }
        ],
        contractSalesTrend: [
          { period: "Q2'25", value: 834, source: "HGV Q2 2026 release (prior-year)" },
          { period: "Q1'26", value: 719, source: "HGV Q1 2026 release" },
          { period: "Q2'26", value: 810, source: "HGV Q2 2026 release" },
          { period: "FY2025", value: 3314, source: "10-K FY2025" }
        ],
        contractSalesNote: "Q2'26 contract sales −3% YoY; FY2026 outlook 'flat to down slightly' — no dollar guidance disclosed, so no FY2026E bar.",
        debtStack: [
          { label: "Corporate debt (net)", value: 4900, source: "HGV Q2 2026 release", note: "Weighted avg rate 5.626%; term loans (TLB refinanced to 2033 on Jul 17), senior notes, revolver" },
          { label: "Non-recourse securitized", value: 2900, source: "HGV Q2 2026 release", note: "Weighted avg rate 5.035%; VOI receivable securitizations incl. Elara" }
        ],
        capitalReturn: {
          dividends: 0,
          buybacks: 150,
          remainingAuthorization: 103,
          source: "HGV Q2 2026 release",
          note: "Q2: 3.1M shares / $150M; 1H: 6M shares / $300M (~10% of float); $103M remaining as of Jul 23; pace ~$150M/quarter; no common dividend."
        }
      },

      growth: [
        {
          headline: "Tour engine intact — fourth straight quarter of growth",
          detail: "239K tours (+6%), new-buyer tours and transactions both up high single digits, Bluegreen tours +10% and new-buyer transactions +16%. Wang: 'we don't believe the softness was demand related. Occupancy levels remained healthy, with on-the-books arrivals in the back half remaining ahead of prior year.'",
          source: "HGV Q2 2026 call (Wang)"
        },
        {
          headline: "Elara conversion — fee-for-service to owned",
          detail: "Closed Apr 29, 2026 for $131M. Shifts ~3% of contract sales to owned, unlocks the upgrade pipeline for existing Elara owners; ~$20M FY2026 EBITDA and $25-30M annualized in 2027, tracking 'slightly better than our expectations'.",
          source: "HGV Q2 2026 10-Q / call"
        },
        {
          headline: "HGV Max at 40% of the base",
          detail: "~300K HGV Max members (+24% YoY); Bluegreen Max ~22K, more than doubled. Ultimate Access hosted 137K+ guests over the past year (World Cup, Annika Sorenstam at the American Century Open, concert series). New member-flexibility tools launched.",
          source: "HGV Q2 2026 call"
        },
        {
          headline: "Margin and cost-of-product tailwinds",
          detail: "Real-estate margin ex-deferrals +220 bps to 28%; cost of product 10% (−130 bps); S&M 49% of contract sales (−40 bps). Inventory recapture from the more mature Diamond/Bluegreen bases is a growing low-cost inventory source.",
          source: "HGV Q2 2026 call (Mathewes)"
        },
        {
          headline: "Capital return — ~10% of float retired in 1H",
          detail: "$150M Q2 / $300M 1H buybacks (6M shares); ~$150M/quarter pace maintained so long as net leverage doesn't rise for the year. Apollo's June secondary (5.0M shares) included a 750K-share repurchase at $50.00.",
          source: "HGV Q2 2026 release / 10-Q"
        },
        {
          headline: "Balance-sheet runway extended",
          detail: "$850M TLB refinanced to 2033 (Jul 17) at unchanged SOFR+200; Timeshare Facility upsized to $1.0B through May 2028; two ABS deals at 98% advance rates; $1.3B unsecuritized notes (~$719M monetizable now). Net leverage ~3.8x.",
          source: "HGV 8-K Jul 17, 2026 / Q2 2026 10-Q"
        },
        {
          headline: "Ocean Reserve (Myrtle Beach) — new owned inventory",
          detail: "227-unit oceanfront project with Strand Capital Group (sixth joint project); sales began July 2026, occupancy expected Q2 2028.",
          source: "HGV corporate release, Aug 2026"
        }
      ],

      risks: [
        { title: "Discretionary travel demand", severity: 5, likelihood: 4, verbatim: "Macroeconomic and other factors beyond our control can adversely affect and reduce demand for our products and services.", source: "10-K FY2025, Item 1A", note: "Q2 2026: mgmt explicitly says softness was 'not demand related' — occupancy healthy, 2H arrivals ahead of prior year." },
        { title: "Hilton brand-license dependency", severity: 5, likelihood: 1, verbatim: "We do not own the Hilton brands and our business will be materially harmed if we breach our license agreement with Hilton or it is terminated.", source: "10-K FY2025, Item 1A", note: "License fees $58M in Q2 (vs $52M). Not otherwise updated." },
        { title: "Brand-conversion execution risk", severity: 3, likelihood: 3, verbatim: "Our ability to use the Hilton brands and trademarks and rebrand the Diamond and Bluegreen businesses and properties.", source: "10-K FY2025, Item 1A", note: "Not discussed on Q2 2026 call." },
        { title: "Diamond + Bluegreen integration", severity: 4, likelihood: 4, verbatim: "Our ability to integrate the Diamond and the Bluegreen businesses successfully and effectively manage our expanded operations resulting from both the Diamond Acquisition and the Bluegreen Acquisition.", source: "10-K FY2025, Item 1A", note: "Q2 2026: Bluegreen VPG moderated 'faster than predicted' lapping a +45% launch quarter; sales execution fell short at two high-volume Bluegreen locations (Orlando, Myrtle Beach). Mgmt: a leadership issue, not integration — leaders replaced." },
        { title: "Receivable defaults", severity: 4, likelihood: 4, verbatim: "Our limited underwriting standards and a possible decline in the default rates or other credit metrics underlying our timeshare financing receivables.", source: "10-K FY2025, Item 1A", note: "Q2 2026: provision $122M (vs $95M), 17% of owned contract sales — high end of mid-teens on higher financing propensity (68%) and trust/new-buyer mix; allowance $1.4B (28% of portfolio); 31-60 day delinquencies stable; origination FICO 747 (vs 751). Default rate not disclosed." },
        { title: "Substantial indebtedness / variable-rate", severity: 4, likelihood: 3, verbatim: "Our substantial indebtedness and other contractual obligations, restrictions imposed on us by certain of our debt agreements and instruments and our variable rate indebtedness which subjects us to interest rate risk.", source: "10-K FY2025, Item 1A", note: "Q2 2026: $4.9B corporate (5.626%) + $2.9B non-recourse (5.035%); net leverage ~3.8x; TLB extended to 2033; buyback pace conditioned on leverage not rising." },
        { title: "Industry competition", severity: 3, likelihood: 5, verbatim: "We operate in a highly competitive industry.", source: "10-K FY2025, Item 1A", note: "ANALYST OVERLAY: MVW's Q2 VPG of $4,477 (+23%) vs HGV's $3,372 (−8.6%) widened the productivity gap between the two Orlando-based peers in a single quarter." },
        { title: "VPG trajectory — FY outlook cut, Q3 down high single digits (Q2 2026)", severity: 4, likelihood: 5, verbatim: "In light of the second quarter's results, we now expect VPG for the year to decline in the low to mid-single digits versus our prior expectation of flat to down slightly. In Q3, we expect VPG to decline in the high single digits.", source: "HGV Q2 2026 call (CFO Mathewes)", note: "Q2 EMERGENT: worse than the Q1 framing (low-to-mid single-digit declines through Q2/Q3). Contract-sales outlook cut to flat/down slightly; Q3 down mid-single digits. Q4 inflection still expected. EBITDA guide now depends on cost levers rather than sales." },
        { title: "Sales-execution / leadership risk at high-volume sites (Q2 2026)", severity: 3, likelihood: 4, verbatim: "Sales execution fell short of our expectations, which weighed on overall sales productivity. This was most pronounced in the back half of the quarter at a couple of our higher-volume locations.", source: "HGV Q2 2026 call (CEO Wang)", note: "Q2 EMERGENT: leadership replaced at Bluegreen Orlando and Myrtle Beach late in Q2; SG&M 'a little pressure in Q3' before normalizing in Q4. Risk: a second quarter of underperformance would make the reaffirmed EBITDA guide hard to hold." },
        { title: "Adjusted FCF down 55% in 1H (Q2 2026)", severity: 3, likelihood: 3, verbatim: "Adjusted free cash flow of $143 million for the six months ended June 30, 2026 compared to $319 million in the prior-year period.", source: "HGV Q2 2026 release, T-5", note: "Q2 EMERGENT: Q2 adj FCF improved ($180M vs $135M) but 1H is down $176M on net non-recourse debt timing; FY conversion guided to the lower half of 55-65%. Watch vs the $150M/quarter buyback cadence." }
      ],

      transcriptPanel: {
        title: "Q2 2026 earnings call — Jul 30, 2026 transcript highlights",
        intro: "<strong>Q2 2026 earnings call</strong> · CEO Mark Wang and President &amp; CFO Dan Mathewes. The first quarterly miss on sales since the Bluegreen integration began, framed by management as an execution rather than a demand problem."
      },
      transcriptQuotes: [
        { speaker: "Mark Wang, CEO", topic: "tours", text: "We generated 239,000 tours in the quarter, an increase of 6% versus the prior year, marking our fourth consecutive quarter of consolidated tour growth and demonstrating the continued demand across the platform." },
        { speaker: "Mark Wang, CEO", topic: "the shortfall", text: "First, we observed faster-than-predicted VPG moderation at Bluegreen as we lapped the difficult comparisons from the successful launch period of HGV Max. Second, sales execution fell short of our expectations, which weighed on overall sales productivity. This was most pronounced in the back half of the quarter at a couple of our higher-volume locations." },
        { speaker: "Mark Wang, CEO", topic: "demand", text: "Importantly, we don't believe the softness was demand related. Occupancy levels remained healthy, with on-the-books arrivals in the back half remaining ahead of prior year." },
        { speaker: "Mark Wang, CEO", topic: "root cause", text: "It's not a market issue or an integration issue. It really was a leadership issue, and we've identified the issue. We've addressed the situation with the leadership changes." },
        { speaker: "Mark Wang, CEO", topic: "HGV Max", text: "Nearly 300,000, or 40% of our base, are Max members today, growing 24% versus the prior year." },
        { speaker: "Dan Mathewes, President & CFO", topic: "provision", text: "Our provision in the second quarter was 17% of owned contract sales, which increased versus the prior year, but remained within our targeted mid-teen range." },
        { speaker: "Dan Mathewes, President & CFO", topic: "guidance", text: "We are reiterating our guidance of Adjusted EBITDA before deferrals to be between $1.225 billion and $1.265 billion." },
        { speaker: "Dan Mathewes, President & CFO", topic: "VPG outlook", text: "In light of the second quarter's results, we now expect VPG for the year to decline in the low to mid-single digits versus our prior expectation of flat to down slightly. In Q3, we expect VPG to decline in the high single digits." },
        { speaker: "Dan Mathewes, President & CFO", topic: "buybacks", text: "We remain on track to continue repurchasing our shares at a pace of approximately $150 million per quarter, subject to the repurchase activity not increasing our net leverage for the full year." }
      ],

      recentCall: {
        period: "Q2 2026",
        date: "2026-07-30",
        sourceLabel: "HGV Q2 2026 earnings call transcript (Jul 30, 2026)",
        sourceUrl: "https://s27.q4cdn.com/757306400/files/doc_financials/2026/q2/HGV-Q226-Complete-Transcript.pdf",
        items: [
          "Q2 specifics: revenue $1,358M (+7.3%; $54M construction-deferral drag); Adj EBITDA attributable $265M reported (+14%) / $293M excl. deferrals (+5%); adj diluted EPS $0.89 vs $0.54; GAAP EPS $0.15 (incl. $48M disposition loss); net income $12M.",
          "KPIs: contract sales $810M (−3%); VPG $3,372 (−8.6%); tours 239,064 (+6%, fourth straight quarter of growth); owned mix 87.2%; Club members 721,896; HGV Max ~300K (40% of base, +24%); new-buyer share 28% of volume (+70 bps); close rates stable.",
          "Root cause of the miss: faster-than-expected Bluegreen VPG moderation (Q2'25 Bluegreen VPG was +45%) plus sales-execution shortfall at two high-volume locations (Bluegreen Orlando, Myrtle Beach) in the back half of the quarter — leadership replaced.",
          "2026 guidance: Adj EBITDA REAFFIRMED at $1.225-1.265B (excl. deferrals). Contract sales LOWERED to flat/down slightly (Q3 down mid-single digits); VPG LOWERED to down low-to-mid single digits (Q3 down high single digits); tours low-to-mid single-digit growth (Q3 low single digits).",
          "Margins/costs: real-estate profit ex-deferrals $173M (+7%) at 28% (+220 bps); cost of product 10% (−130 bps); S&M 49% of contract sales (−40 bps); Adj EBITDA margin ex-reimbursements & deferrals 23% (+40 bps); rental & ancillary loss $(10)M on developer maintenance fees.",
          "Credit: provision $122M (17% of owned contract sales, high end of mid-teens on 68% financing propensity and trust/new-buyer mix); allowance $1.4B (28% of $5B portfolio); 31-60 day delinquencies stable, 31-90 day down 9 bps from year-end; Bluegreen down payments +800 bps YoY; origination FICO 747.",
          "Capital: $150M Q2 buybacks (3.1M shares; $300M / 6M shares 1H, ~10% of float); $25M more Jul 1-23; $103M remaining; pace ~$150M/quarter conditioned on leverage. Net leverage ~3.8x; liquidity $735M; Timeshare Facility upsized to $1.0B.",
          "Transactions: Elara buyout closed Apr 29 ($131M; ~$20M FY EBITDA, $25-30M in 2027); Jun 30 disposition ($48M non-cash loss; $10-12M run-rate maintenance-fee relief); ABS 2026-1 $500M (Apr) and 2026-2 $300M (Jun) at 98% advance rates; $850M TLB refinanced to 2033 (Jul 17).",
          "Cash flow: Q2 adj FCF $180M (vs $135M; 61% conversion); 1H adj FCF $143M (vs $319M) on non-recourse debt timing; FY conversion guided to lower half of 55-65%.",
          "Board: Apollo designee David Sambur resigned Jul 2 after Apollo's June secondary; Christine Duffy appointed. Post-quarter: Ocean Reserve (Myrtle Beach, 227 units) sales launched July 2026."
        ]
      },

      sources: [
        { label: "HGV Q2 2026 earnings press release (8-K Ex. 99.1, Jul 30, 2026)", url: "https://www.sec.gov/Archives/edgar/data/1674168/000167416826000098/hgvq22026earningsreleaseex.htm" },
        { label: "HGV Q2 2026 Form 10-Q (filed Jul 30, 2026)", url: "https://www.sec.gov/Archives/edgar/data/1674168/000167416826000100/hgv-20260630.htm" },
        { label: "HGV Q2 2026 earnings-call transcript (company-posted PDF)", url: "https://s27.q4cdn.com/757306400/files/doc_financials/2026/q2/HGV-Q226-Complete-Transcript.pdf" },
        { label: "HGV 8-K — Term Loan B refinancing (Jul 17, 2026)", url: "https://www.sec.gov/Archives/edgar/data/1674168/000114036126028827/ef20078182_8k.htm" },
        { label: "HGV Q1 2026 earnings release (Apr 29, 2026) — prior-quarter context", url: "https://www.sec.gov/Archives/edgar/data/1674168/000167416826000063/hgvq12026earningsreleaseex.htm" },
        { label: "HGV Investor Relations", url: "https://investors.hgv.com" },
        { label: "FY2025 10-K (filed Feb 26, 2026)", url: "https://www.sec.gov/Archives/edgar/data/1674168/000167416826000017/hgv-20251231.htm" },
        { label: "EDGAR filings index (CIK 0001674168)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001674168" }
      ]
    },

    // -----------------------------------------------------------------------
    // TNL — Travel + Leisure Co. (NYSE: TNL)
    // -----------------------------------------------------------------------
    tnl: {
      slug: "tnl",
      name: "Travel + Leisure Co.",
      shortName: "TNL",
      ticker: "TNL",
      exchange: "NYSE",
      brandColor: "#1D6B44",
      brandAccent: "#1D6B44",
      brandSoft: "#0E3D26",
      hq: "Orlando, Florida",
      foundedSpinOff: "Wyndham Worldwide spun off from Cendant on July 31, 2006; renamed Travel + Leisure Co. on February 17, 2021",
      ceo: { name: "Michael D. Brown", title: "President & CEO" },
      cfo: { name: "Erik Hoag", title: "EVP & CFO" },
      employees: { value: 19300, source: "10-K FY2025 (most recent)" },
      fiscal: {
        year: 2026,
        period: "Q2 2026 (quarter ended June 30, 2026)",
        filingType: "Q2 2026 earnings release / Form 10-Q",
        releaseDate: "2026-07-22",
        callDate: "2026-07-22",
        callTime: "8:30am ET",
        sourceUrl: "https://www.sec.gov/Archives/edgar/data/1361658/000136165826000050/tnl2q26earningsrelease.htm"
      },
      narrative: {
        oneLiner: "The largest timeshare operator by resort count and operator of RCI. Q2 2026: Vacation Ownership EBITDA +13%, adj EPS +14%, full-year guide raised, and $343M of acquisitions (Yes& Vacations + Spinnaker) that add 100K+ owners.",
        history: "Corporate roots in Cendant (1990s); Wyndham Worldwide spun off in 2006. Hotel franchising spun off in 2018 (Wyndham Hotels & Resorts), leaving the vacation-ownership and exchange business as Wyndham Destinations. In 2021 acquired the Travel + Leisure media brand from Meredith and rebranded as Travel + Leisure Co. Owns Club Wyndham, WorldMark, Margaritaville Vacation Club, Sports Illustrated Resorts, Eddie Bauer Adventure Club, Accor Vacation Club, plus RCI exchange, Travel + Leisure GO, and Travel + Leisure For Business.",
        currentChapter: "Q2 2026 extended TNL's steady compounding: net revenue $1,063M (+4%), Adj EBITDA $269M (+8%), adj diluted EPS $1.88 (+14%). Vacation Ownership segment EBITDA rose 13% to $247M on Gross VOI sales of $693M (+6%), VPG $3,318 (+2%) and tours +1% — with stronger conversion offsetting owner-tour loss from closed sales centers under the Resort-Optimization Initiative (12 full and 5 partial resorts exited; developer obligations down $40M in 1H). Travel & Membership remained the soft spot (revenue −5%, EBITDA −11%, exchange transactions −13%). TNL RAISED full-year guidance to $1,065-1,085M Adj EBITDA, $2.60-2.675B Gross VOI and $3,325-3,375 VPG, and announced two acquisitions — Yes& Vacations ($193M, closed Jul 15) and Spinnaker Resorts ($150M + up to $10M contingent) — adding 23 resorts and 100K+ owners for ~$50M of synergized EBITDA at ~5x net. Capital return was $125M in Q2 ($37M dividends + $88M buybacks); first-lien leverage 3.16x."
      },

      q2Headline: {
        revenue: { value: 1063, priorQ: 1018, unit: "USD millions", source: "TNL Q2 2026 release (Jul 22, 2026), Table 1", note: "Net revenue +4% YoY; Net VOI sales $524M (+11%)" },
        adjEbitda: { value: 269, priorQ: 250, unit: "USD millions", source: "TNL Q2 2026 release", note: "+8% YoY" },
        adjEbitdaMargin: { value: 25.3, priorQ: 24.6, unit: "percent", source: "TNL Q2 2026 release", calc: "Adj EBITDA / net revenue", note: "+70 bps YoY" },
        netIncome: { value: 109, priorQ: 108, unit: "USD millions", source: "TNL Q2 2026 release", note: "Net income attributable to TNL; +1%" },
        dilutedEps: { value: 1.72, priorQ: 1.62, unit: "USD per share", source: "TNL Q2 2026 release", note: "+6% YoY; diluted shares 63.4M vs 66.5M" },
        adjDilutedEps: { value: 1.88, priorQ: 1.65, unit: "USD per share", source: "TNL Q2 2026 release", note: "+14% YoY" },
        adjNetIncome: { value: 119, priorQ: 110, unit: "USD millions", source: "TNL Q2 2026 release", note: "+8% YoY" },

        // Vacation Ownership segment
        voRevenue: { value: 907, priorQ: 853, unit: "USD millions", source: "TNL Q2 2026 release, Table 4", note: "+6% YoY" },
        voAdjEbitda: { value: 247, priorQ: 218, unit: "USD millions", source: "TNL Q2 2026 release, Table 4", note: "+13% YoY" },
        grossVoiSales: { value: 693, priorQ: 654, unit: "USD millions", source: "TNL Q2 2026 release", note: "+6% YoY; Gross VOI net of fee-for-service $665M (+10%); fee-for-service sales $28M (−46%)" },
        netVoiSales: { value: 524, priorQ: 474, unit: "USD millions", source: "TNL Q2 2026 release", note: "+11% YoY" },
        vpg: { value: 3318, priorQ: 3251, unit: "USD per guest", source: "TNL Q2 2026 release", note: "+2% YoY; lift from larger packages / owner ATP and price annualization (Hoag)" },
        tours: { value: 200000, priorQ: 197000, unit: "tours", source: "TNL Q2 2026 release (reported in thousands)", note: "+1% YoY (+1.4% per 10-Q); resort closures reduced owner tours; new-owner tours accelerated" },
        loanLossProvision: { value: 141, priorQ: 128, unit: "USD millions", source: "TNL Q2 2026 release, Table 4", note: "+10% YoY; FY consolidated provision rate guided to ~21% incl. acquisitions" },

        // Travel & Membership segment
        tmRevenue: { value: 157, priorQ: 166, unit: "USD millions", source: "TNL Q2 2026 release, Table 4", note: "−5% YoY" },
        tmAdjEbitda: { value: 49, priorQ: 55, unit: "USD millions", source: "TNL Q2 2026 release, Table 4", note: "−11% YoY on lower exchange volume and richer (lower-margin) travel-club mix" },
        rciAvgMembers: { value: 3275, priorQ: 3329, unit: "thousands", source: "TNL Q2 2026 release", note: "Average exchange members; −2% YoY" },
        exchangeTransactions: { value: 171, priorQ: 197, unit: "thousands", source: "TNL Q2 2026 release", note: "−13% YoY; revenue per exchange transaction $369 (flat)" },
        travelClubTransactions: { value: 242, priorQ: 191, unit: "thousands", source: "TNL Q2 2026 release", note: "+27% YoY; revenue per travel-club transaction $189 (−17%) on lower-commission partner mix" },

        // Trailing FY2025 anchors
        revenueFY: { value: 4021, prior: 3864, unit: "USD millions", source: "10-K FY2025" },
        adjEbitdaFY: { value: 990, prior: 929, unit: "USD millions", source: "10-K FY2025" },
        adjEbitdaMarginFY: { value: 24.6, unit: "percent", source: "10-K FY2025" },
        contractSalesFY: { value: 2486, prior: 2293, unit: "USD millions", source: "10-K FY2025" },
        vpgFY: { value: 3284, prior: 3094, unit: "USD per guest", source: "10-K FY2025" },
        toursFY: { value: 734000, prior: 716000, unit: "tours", source: "10-K FY2025" },
        owners: { value: 797000, unit: "owner families", source: "10-K FY2025, Item 1", note: "Pre-acquisition; Yes& Vacations + Spinnaker add 100K+ owners (>10%) once both close" },
        avgFico: { value: 740, unit: "FICO", source: "TNL Q2 2026 call (Hoag)", note: "'Weighted average FICO scores at origination remained above 740'; down payments in the mid-20s. Exact figure not in 10-Q." },

        // Credit / receivables (Q2 2026, 10-Q Note 6)
        allowance: { value: 660, unit: "USD millions", source: "TNL Q2 2026 10-Q, Note 6", note: "vs $663M at YE2025 and $604M at Jun 30, 2025; gross VOCRs $3,249M" },
        receivablesCurrent: { value: 94.9, unit: "percent", source: "calculated from disclosed inputs: $3,085M current / $3,249M gross (10-Q Note 6)", calc: "current / gross receivables" },
        delinquency91_120: { value: 42, unit: "USD millions", source: "TNL Q2 2026 10-Q, Note 6", note: "91-120 day bucket $42M (vs $49M at YE2025); 31-60 $68M; 61-90 $54M. Early-stage delinquencies improved ~80 bps since Q1 (Hoag)." },
        fico700plus: { value: 62.1, unit: "percent of receivables", source: "calculated from disclosed inputs: $2,017M ≥700 FICO / $3,249M gross (10-Q Note 6)", calc: "≥700 FICO bucket / gross receivables" },

        // Market cap as of end of Q2 2026
        marketCapEoq: { value: 4846, unit: "USD millions", source: "calculated from disclosed inputs: Jun 30, 2026 close $76.43 (Yahoo Finance) × Q2 2026 weighted-avg diluted shares 63.4M (release)" },
        priceEoq: { value: 76.43, unit: "USD per share", source: "Yahoo Finance (Jun 30, 2026 close)" },
        priceSoq: { value: 69.19, unit: "USD per share", source: "Yahoo Finance (Mar 31, 2026 close)" },
        q2PricePerformance: { value: 10.46, unit: "percent", source: "calculated from disclosed inputs: ($76.43 / $69.19) − 1", note: "Q2 2026 price-only return, ex-dividends" },
        dilutedShares: { value: 63.4, unit: "millions of weighted-avg diluted shares", source: "TNL Q2 2026 release" },

        // Capital / balance sheet (June 30, 2026)
        corporateDebt: { value: 3700, unit: "USD millions", source: "TNL Q2 2026 release, Table 2", note: "Incl. new $900M 6.250% secured notes due 2031 (May 20); 6.625% Jul-2026 notes redeemed; TLB $851M; revolver $45M drawn" },
        securitizedDebt: { value: 2010, unit: "USD millions", source: "TNL Q2 2026 release, Table 2", note: "Non-recourse VO debt; down from $2,124M at YE2025" },
        cash: { value: 282, unit: "USD millions", source: "TNL Q2 2026 release" },
        restrictedCash: { value: 189, unit: "USD millions", source: "TNL Q2 2026 release" },
        leverage: { value: 3.16, unit: "x (covenant)", source: "TNL Q2 2026 10-Q", note: "First-lien leverage ratio vs 4.25x max; 'down from 3.4 times in Q2 of last year'; YE2026 expected ~3.2x after acquisitions" },
        liquidity: { value: 1236, unit: "USD millions", source: "calculated from disclosed inputs: $282M cash + $954M revolver availability (10-Q)", calc: "cash + revolver availability", note: "'Over $1.2 billion of available capacity' (Hoag)" },

        // Capital return
        dividendsPaid: { value: 37, priorQ: 37, unit: "USD millions", source: "TNL Q2 2026 release", note: "$0.60/share paid Jun 30, 2026 (vs $0.56 in Q2 2025)" },
        dividendsPaidYtd: { value: 78, unit: "USD millions", source: "TNL Q2 2026 10-Q", note: "1H 2026: $1.20/share" },
        buybacks: { value: 88, unit: "USD millions", source: "TNL Q2 2026 release / 10-Q Item 2", note: "1.26M shares at $69.50 avg; 1H $175M / 2.4M shares at $70.97" },
        remainingAuth: { value: 745, unit: "USD millions", source: "TNL Q2 2026 release", note: "At Jun 30, 2026" },
        q3Dividend: { value: 0.60, unit: "USD per share", source: "TNL IR release (Aug 4, 2026)", note: "Q3 dividend declared Aug 4; paid Sep 30, 2026" },

        operatingCashFlowYtd: { value: 258, priorQ: 353, unit: "USD millions", source: "TNL Q2 2026 release, Table 3", note: "1H 2026; Q2 standalone not disclosed" },
        adjFreeCashFlow: { value: null, unit: "USD millions", source: "TNL Q2 2026 release", note: "TNL discloses adjusted FCF year-to-date only; see 1H figure" },
        adjFreeCashFlowYtd: { value: 95, priorQ: 123, unit: "USD millions", source: "TNL Q2 2026 release, Table 6", note: "1H 2026 vs 1H 2025; FY conversion guided to ~half of EBITDA" },
        capexYtd: { value: 44, priorQ: 58, unit: "USD millions", source: "TNL Q2 2026 release" },

        // Resort-optimization initiative
        resortOptimResorts: { value: 17, unit: "underperforming resorts identified", source: "TNL Q2 2026 release", note: "12 full + 5 partial resorts exited; all HOA/member approvals received" },
        resortOptimChargesQ2: { value: 9, unit: "USD millions", source: "TNL Q2 2026 10-Q, Note 20", note: "Q2 charges ($31M 1H); developer obligations down $40M in 1H YoY" },

        resorts: { value: 280, unit: "vacation-ownership resorts (>280)", source: "10-K FY2025, Item 1", note: "+23 resorts pending from Yes& Vacations and Spinnaker" },
        rciAffiliatedResorts: { value: 3600, unit: "affiliated VO resorts", source: "10-K FY2025, Item 1", note: "Across 101 countries" },
        rciCountries: { value: 101, unit: "countries / territories", source: "10-K FY2025, Item 1" }
      },

      guidance: {
        adjEbitda: { label: "Adj EBITDA (FY)", low: 1065, high: 1085, unit: "USD millions", status: "RAISED", source: "TNL Q2 2026 release", note: "From $1,030-1,055M; core ex-acquisitions $1,050-1,065M + $15-20M from acquisitions" },
        grossVoiSales: { label: "Gross VOI sales (FY)", low: 2600, high: 2675, unit: "USD millions", status: "RAISED", source: "TNL Q2 2026 release", note: "From $2.5-2.6B" },
        vpg: { label: "VPG (FY)", low: 3325, high: 3375, unit: "USD per guest", status: "RAISED", source: "TNL Q2 2026 release", note: "From $3,175-3,275" },
        q3AdjEbitda: { label: "Q3 Adj EBITDA", low: 275, high: 285, unit: "USD millions", status: "NEW", source: "TNL Q2 2026 release" },
        q3GrossVoiSales: { label: "Q3 Gross VOI sales", low: 700, high: 740, unit: "USD millions", status: "NEW", source: "TNL Q2 2026 release" },
        q3Vpg: { label: "Q3 VPG", low: 3300, high: 3350, unit: "USD per guest", status: "NEW", source: "TNL Q2 2026 release" },
        fcfConversion: { label: "Adj FCF conversion", value: "~50% of Adj EBITDA", status: "REAFFIRMED", source: "TNL Q2 2026 call (Hoag)" },
        provisionRate: { label: "Consolidated loan-loss provision rate (FY)", value: "~21% incl. acquisitions", status: "UPDATED", source: "TNL Q2 2026 call (Hoag)" }
      },
      guidanceNote: "Full-year Adj EBITDA, Gross VOI and VPG guidance all RAISED on Jul 22, 2026. Acquisitions contribute $15-20M of 2026 EBITDA; YE2026 leverage expected ~3.2x after ~0.2x from the deals.",

      strategicInitiatives: [
        { title: "Yes& Vacations acquisition — $193M, closed Jul 15, 2026", status: "CLOSED", detail: "Seven Maui properties plus a Las Vegas Strip resort. Part of a two-deal package adding 23 resorts and 100K+ owners (>10% owner-base expansion); ~80% of acquired owners have paid-off loans. Hoag: 'we're buying these companies for the 100,000 owners… and the ability to introduce Club Wyndham access, our multi-brand strategy, and… upgrade them over time.'", announced: "TNL release Jul 15, 2026 / Q2 call" },
        { title: "Spinnaker Resorts acquisition — $150M + up to $10M contingent", status: "IN FLIGHT", detail: "Definitive agreement Jul 14, 2026; six Hilton Head resorts plus Ormond Beach, Branson and Williamsburg. Expected to close Q3 2026 (Brown: 'in August'). Combined deals: ~$50M synergized EBITDA, ~$263M net capital after securitizing ~$80M receivables (~5x). Close not yet confirmed via 8-K as of Oct 11, 2026.", announced: "TNL release Jul 15, 2026 / Q2 call" },
        { title: "Resort-Optimization Initiative — nearing completion", status: "IN FLIGHT", detail: "17 resorts: 12 full and 5 partial exits; all HOA board and member approvals received; court approvals for HOA property sales expected by YE2026. Q2 charges $9M ($31M 1H); developer obligations down $40M in 1H. Remaining liability $3M through 2027.", announced: "Q2 2026 release / 10-Q Note 20" },
        { title: "$900M 6.250% senior secured notes due 2031 — May 20, 2026", status: "COMPLETED", detail: "Proceeds redeemed the $650M 6.625% notes due Jul 2026 (May 22), repaid revolver borrowings. Sierra Timeshare 2026-2 ($300M, 5.52% WAC, 98% advance) closed Jul 20.", announced: "8-K May 2026 / IR release Jul 20, 2026" },
        { title: "Sports Illustrated Resorts — Nashville opened Sep 1, 2026", status: "LAUNCHED", detail: "185 suites after renovation; sales center open. Pipeline: Chicago (early 2027), Baton Rouge (phased, later 2027, first with a hotel component), Tuscaloosa (ground-up, 2028). Oct 5, 2026: partnership with Wyndham Hotels & Resorts to develop traditional hotels under the SI Resorts brand.", announced: "TNL IR releases Sep 1 & Oct 5, 2026" },
        { title: "Lifestyle brands scaling — Margaritaville, Eddie Bauer, Accor", status: "IN FLIGHT", detail: "Margaritaville Vacation Club on track to exceed $150M of annual VOI sales (app launched); Eddie Bauer Adventure Club 'meaningfully exceeding our expectations' — Oct 2, 2026 'Trail Partners' network launched with Under Canvas (18 properties); Accor Vacation Club sales on track to nearly double in 2026. Multi-brand VOI sales approaching 10% of mix.", announced: "Q2 2026 call / IR release Oct 2, 2026" },
        { title: "Capital return — $125M in Q2", status: "IN FLIGHT", detail: "$37M dividends ($0.60/share) + $88M buybacks (1.26M shares at $69.50). 1H total $253M; shares outstanding −4%. $745M authorization remaining; Q3 dividend of $0.60 declared Aug 4.", announced: "Q2 2026 release / 10-Q" }
      ],

      segmentNote: "Segment revenue, Adj EBITDA and margin from the Q2 2026 release (Table 4). Prior-year = Q2 2025.",
      segments: [
        {
          name: "Vacation Ownership",
          period: "Q2 2026",
          revenue: 907,
          revenuePrior: 853,
          adjEbitda: 247,
          adjEbitdaPrior: 218,
          margin: 27.2,
          share: 85,
          color: "#1D6B44",
          source: "TNL Q2 2026 release, Table 4",
          description: "Sale of VOIs, consumer financing, club dues, resort management, and rentals across Club Wyndham, WorldMark, Margaritaville Vacation Club, Sports Illustrated Resorts, Eddie Bauer Adventure Club, and Accor Vacation Club. Q2: Gross VOI +6%, Net VOI +11%, VPG +2%, tours +1%; developer obligations −$21M YoY from resort optimization."
        },
        {
          name: "Travel & Membership",
          period: "Q2 2026",
          revenue: 157,
          revenuePrior: 166,
          adjEbitda: 49,
          adjEbitdaPrior: 55,
          margin: 31.2,
          share: 15,
          color: "#D4AF37",
          source: "TNL Q2 2026 release, Table 4",
          description: "RCI exchange (3.28M avg members, −2%), Travel + Leisure GO, Travel + Leisure For Business. Exchange transactions −13%; travel-club transactions +27% at −17% revenue per transaction; subscription revenue $42M (−2%)."
        }
      ],

      brands: [
        { name: "Club Wyndham", type: "Core points-based timeshare; app drives >30% of club bookings", source: "10-K FY2025 / Q2 2026 call" },
        { name: "WorldMark by Wyndham", type: "Northwest US / California-focused points club", source: "10-K FY2025, Item 1" },
        { name: "Margaritaville Vacation Club", type: "Licensed lifestyle brand — on track to exceed $150M annual VOI sales (Q2'26 call)", source: "Q2 2026 call" },
        { name: "Sports Illustrated Resorts", type: "Licensed brand — Nashville opened Sep 1, 2026; Chicago, Baton Rouge, Tuscaloosa pipeline; hotel partnership with Wyndham Hotels (Oct 2026)", source: "TNL IR releases Sep-Oct 2026" },
        { name: "Eddie Bauer Adventure Club", type: "Licensed outdoor brand — sales 'meaningfully exceeding expectations'; Trail Partners network with Under Canvas (Oct 2026)", source: "Q2 2026 call / IR release" },
        { name: "Accor Vacation Club", type: "Licensed brand (Accor) — Asia-Pacific; sales on track to nearly double in 2026", source: "Q2 2026 call" },
        { name: "Yes& Vacations (acquired Jul 15, 2026)", type: "7 Maui properties + Las Vegas Strip resort; $193M", source: "TNL release Jul 15, 2026" },
        { name: "Spinnaker Resorts (pending)", type: "6 Hilton Head + Ormond Beach, Branson, Williamsburg; $150M + $10M contingent", source: "TNL release Jul 15, 2026" },
        { name: "RCI", type: "Largest VO exchange — 3.28M avg members, 3,600 resorts, 101 countries", source: "Q2 2026 release / 10-K FY2025" },
        { name: "Travel + Leisure GO / For Business", type: "Direct-to-consumer and B2B travel clubs — travel-club transactions +27% in Q2'26", source: "Q2 2026 release" }
      ],

      geography: {
        summary: "280+ vacation-ownership resorts in U.S., Canada, Mexico, Caribbean, and Asia Pacific, plus RCI's 3,600 affiliated resorts across 101 countries. Directly-owned inventory is concentrated in the US (FL 21%, CA 12%, NV 9% of FY2025 VOI sales). Q2/Q3 2026 adds: Yes& Vacations (Maui ×7, Las Vegas) closed Jul 15; Spinnaker (Hilton Head ×6, Ormond Beach, Branson, Williamsburg) pending; SI Resorts Nashville opened Sep 1; 12 full + 5 partial resorts exited under the optimization initiative.",
        regions: [
          { name: "Florida (US) — 21% of FY2025 VOI sales", lat: 27.99, lng: -81.76, share: 21, source: "10-K FY2025, Note 23", note: "Spinnaker Ormond Beach pending" },
          { name: "California (US) — 12% of FY2025 VOI sales", lat: 36.78, lng: -119.42, share: 12, source: "10-K FY2025, Note 23" },
          { name: "Nevada (US) — 9% of FY2025 VOI sales", lat: 36.17, lng: -115.14, share: 9, source: "10-K FY2025, Note 23", note: "Yes& Vacations Las Vegas Strip resort acquired Jul 15, 2026" },
          { name: "Hawaii (US) — Maui (Yes& Vacations)", lat: 20.80, lng: -156.33, note: "7 Maui properties acquired Jul 15, 2026 ($193M package)", source: "TNL release Jul 15, 2026" },
          { name: "South Carolina (US) — Hilton Head (Spinnaker)", lat: 32.22, lng: -80.75, note: "6 Spinnaker resorts; close expected Q3 2026", source: "TNL release Jul 15, 2026" },
          { name: "Tennessee (US) — SI Resorts Nashville", lat: 36.16, lng: -86.78, note: "Opened Sep 1, 2026; 185 suites; sales center open", source: "TNL IR release Sep 1, 2026" },
          { name: "Orlando — corporate HQ", lat: 28.54, lng: -81.46, note: "501 W. Church St.; lease through Oct 2040", source: "10-K FY2025, Item 2" },
          { name: "Other US (Carolinas, NW, Branson, Williamsburg, etc.)", lat: 39.50, lng: -98.35, note: "Resorts disclosed in aggregate; Spinnaker adds Branson & Williamsburg", source: "10-K FY2025 / TNL release Jul 15, 2026" },
          { name: "Baton Rouge — SI Resort (phased, later 2027)", lat: 30.45, lng: -91.19, note: "First SI Resort with a hotel component", source: "TNL IR release Oct 5, 2026" },
          { name: "Canada", lat: 56.13, lng: -106.35, source: "10-K FY2025, Item 1" },
          { name: "Mexico", lat: 21.16, lng: -86.85, source: "10-K FY2025, Item 1" },
          { name: "Caribbean", lat: 18.34, lng: -64.93, source: "10-K FY2025, Item 1" },
          { name: "Asia-Pacific (Accor Vacation Club)", lat: -25.27, lng: 133.78, note: "Accor sales on track to nearly double in 2026; AUD/NZD conduit $122M", source: "Q2 2026 call / 10-Q" }
        ]
      },

      financials: {
        revenueTrend: [
          { year: 2023, value: 3750, source: "10-K FY2025, comparative" },
          { year: 2024, value: 3864, source: "10-K FY2025, comparative" },
          { year: 2025, value: 4021, source: "10-K FY2025" }
        ],
        ebitdaTrend: [
          { year: 2023, value: 908, source: "10-K FY2025, comparative" },
          { year: 2024, value: 929, source: "10-K FY2025, comparative" },
          { year: 2025, value: 990, source: "10-K FY2025" }
        ],
        contractSalesTrend: [
          { period: "Q2'25", value: 654, source: "TNL Q2 2026 release (prior-year Gross VOI)" },
          { period: "Q1'26", value: 549, source: "TNL Q1 2026 release (Gross VOI)" },
          { period: "Q2'26", value: 693, source: "TNL Q2 2026 release (Gross VOI)" },
          { period: "FY2025", value: 2486, source: "10-K FY2025" },
          { period: "FY2026E (guide mid)", value: 2638, source: "TNL 2026 guidance midpoint ($2,600-2,675M)" }
        ],
        contractSalesNote: "Gross VOI sales. Q2'26 +6% YoY; FY2026E bar is the raised guidance midpoint (~$2.64B).",
        debtStack: [
          { label: "Revolver (drawn)", value: 45, source: "TNL Q2 2026 10-Q, Note 12" },
          { label: "Term Loan B", value: 851, source: "TNL Q2 2026 10-Q, Note 12" },
          { label: "6.00% Notes due 2027", value: 401, source: "TNL Q2 2026 10-Q, Note 12" },
          { label: "4.50% Notes due 2029", value: 646, source: "TNL Q2 2026 10-Q, Note 12" },
          { label: "4.625% Notes due 2030", value: 348, source: "TNL Q2 2026 10-Q, Note 12" },
          { label: "6.250% Secured Notes due 2031 (new)", value: 891, source: "TNL Q2 2026 10-Q, Note 12" },
          { label: "6.125% Notes due 2033", value: 495, source: "TNL Q2 2026 10-Q, Note 12" },
          { label: "Finance leases", value: 23, source: "TNL Q2 2026 10-Q, Note 12" },
          { label: "Non-recourse securitized", value: 2010, source: "TNL Q2 2026 release, Table 2" }
        ],
        capitalReturn: {
          dividends: 37,
          buybacks: 88,
          remainingAuthorization: 745,
          source: "TNL Q2 2026 release",
          note: "Q2 2026: $0.60/share dividend ($37M); $88M / 1.26M shares at $69.50 avg. 1H: $253M total. $745M remaining; Q3 dividend $0.60 declared Aug 4."
        }
      },

      growth: [
        {
          headline: "Vacation Ownership +13% segment EBITDA; guide raised",
          detail: "Gross VOI $693M (+6%), Net VOI +11%, VPG $3,318 (+2%), tours +1%. Brown: 'stronger conversion and VPG have more than offset the lost tour volume from closed sales centers, allowing us to maintain our VOI sales growth rate.' FY guide raised to $1,065-1,085M Adj EBITDA.",
          source: "TNL Q2 2026 release / call"
        },
        {
          headline: "Yes& Vacations + Spinnaker — 100K owners for ~5x EBITDA",
          detail: "$343M upfront for 23 resorts and 100K+ owners (>10% base expansion); ~$50M synergized EBITDA; ~$263M net capital after securitizing ~$80M receivables. 2026 contribution $15-20M. Hoag: 'we're not buying these companies for the portfolio. We're buying these companies for the 100,000 owners.' RCI migration of acquired owners over 24-36 months.",
          source: "TNL release Jul 15, 2026 / Q2 call"
        },
        {
          headline: "Multi-brand strategy approaching 10% of VOI sales",
          detail: "Margaritaville Vacation Club >$150M annual run-rate; Eddie Bauer Adventure Club exceeding expectations with Trail Partners network (Under Canvas, 18 properties) launched Oct 2; Accor Vacation Club sales nearly doubling; SI Resorts Nashville opened Sep 1 with Chicago, Baton Rouge and Tuscaloosa in pipeline and a new hotel partnership with Wyndham Hotels (Oct 5).",
          source: "Q2 2026 call / TNL IR releases Sep-Oct 2026"
        },
        {
          headline: "Resort-Optimization Initiative delivering savings",
          detail: "12 full + 5 partial resorts exited; developer obligations −$40M in 1H ($21M in Q2); Q2 charges only $9M vs $233M in 2025. Court approvals for HOA property sales expected by YE2026; $3M remaining liability.",
          source: "Q2 2026 10-Q, Note 20 / MD&A"
        },
        {
          headline: "Credit normalizing",
          detail: "Early-stage delinquencies improved ~80 bps since Q1 (vs ~40 bps typical seasonal); origination FICO above 740; down payments in the mid-20s. Provision $141M (+10%); long-run provision expected to settle in the upper teens, ~21% consolidated in 2026 with acquisitions.",
          source: "Q2 2026 call (Hoag) / 10-Q"
        },
        {
          headline: "Capital return — $253M in 1H, shares −4%",
          detail: "Q2: $37M dividends + $88M buybacks (+25% YoY); $745M authorization remaining; Q3 dividend $0.60. Hoag: 'Our financial flexibility is a competitive advantage.' First-lien leverage 3.16x; YE ~3.2x post-deals.",
          source: "Q2 2026 release / call"
        },
        {
          headline: "Balance-sheet refinancing complete",
          detail: "$900M 6.250% secured notes due 2031 (May 20) retired the 6.625% Jul-2026 notes; Sierra 2026-2 ABS $300M at 5.52% / 98% advance (Jul 20); >$1.2B available capacity.",
          source: "8-K May 2026 / IR release Jul 20, 2026"
        }
      ],

      risks: [
        { title: "Industry competition", severity: 4, likelihood: 5, verbatim: "The timeshare industry is highly competitive and we are subject to risks related to competition that may adversely affect our performance.", source: "10-K FY2025, Item 1A", note: "Q2 2026: TNL's +2% VPG sits between MVW (+23%) and HGV (−8.6%); TNL is consolidating smaller independents (Yes&, Spinnaker)." },
        { title: "Travel-industry health", severity: 5, likelihood: 4, verbatim: "Our revenues are highly dependent on the health of the travel industry and declines in or disruptions to the travel industry such as those caused by economic conditions, terrorism or acts of violence, political strife, severe weather events and other natural disasters, war, and pandemics may adversely affect us.", source: "10-K FY2025, Item 1A", note: "Q2 2026: Brown — 'We've not seen anything in our metrics that would indicate there's a weakening occurring.' Booking window 109 days, 4-day average stay, both at/above prior year. 10-Q MD&A cites Middle East hostilities, inflation, rates, fuel costs, recession risk." },
        { title: "VO receivables portfolio", severity: 4, likelihood: 4, verbatim: "We are subject to risks related to our vacation ownership receivables portfolio.", source: "10-K FY2025, Item 1A", note: "Q2 2026: provision $141M (+10%); allowance $660M on $3.25B gross; 10-Q: delinquencies 'remaining elevated over historical levels' but normalizing with sequential improvement; acquired portfolios add modest provision pressure (~21% consolidated FY rate)." },
        { title: "Cyber & data integrity", severity: 4, likelihood: 3, verbatim: "Failure to maintain the integrity of internal or customer data or to protect our systems from cyber-attacks could disrupt our business, damage our reputation, and subject us to significant costs, fines or lawsuits.", source: "10-K FY2025, Item 1A", note: "Not specifically updated in Q2 2026 materials." },
        { title: "Indebtedness & cost of capital", severity: 3, likelihood: 3, verbatim: "We are subject to certain risks related to our indebtedness, hedging transactions, securitization of certain of our assets, surety bond requirements, the cost and availability of capital and the extension of credit by us.", source: "10-K FY2025, Item 1A", note: "Q2 2026: $3.7B corporate + $2.0B non-recourse; first-lien leverage 3.16x (max 4.25x); $900M 6.25% notes refinanced 2026 maturity; acquisitions add ~0.2x." },
        { title: "Regulatory compliance", severity: 3, likelihood: 4, verbatim: "Our business is subject to extensive regulation and the cost of compliance or failure to comply with such regulations may adversely affect us.", source: "10-K FY2025, Item 1A", note: "Q2 2026 10-Q: agreement in principle with SEC Staff to settle an inquiry into disclosures about delinquent/defaulted loans rescinded in 2019-2020; $975,000 civil penalty accrued." },
        { title: "Wyndham Hotels relationship", severity: 4, likelihood: 1, verbatim: "Our success depends in part on our ongoing relationship with Wyndham Hotels.", source: "10-K FY2025, Item 1A", note: "Oct 5, 2026: relationship extended into a partnership to develop Sports Illustrated Resorts-branded hotels with Wyndham Hotels & Resorts." },
        { title: "RCI exchange decline accelerating (Q2 2026)", severity: 3, likelihood: 5, verbatim: "This business may be negatively impacted in the future if we are required to purchase additional inventory to supplement the inventory supplied by exchange members.", source: "TNL Q2 2026 10-Q, MD&A", note: "Q2 EMERGENT: exchange transactions −13% (vs +17% in Q1), avg members −2%, T&M EBITDA −11%; travel-club growth (+27% transactions) comes at −17% revenue per transaction. Brown: 'the exchange business is the challenge side of the equation'; mgmt 'will continue to evaluate' strategic alternatives." },
        { title: "Acquisition integration & leverage (Q2 2026)", severity: 3, likelihood: 3, verbatim: "We're investing approximately $340 million to acquire businesses expected to generate about $50 million of EBITDA on a full year synergized basis.", source: "TNL Q2 2026 call (CFO Hoag)", note: "Q2 EMERGENT: first sizable VO M&A since 2021; adds ~0.2x leverage, ~$80M receivables to securitize, and 100K owners to migrate into Club Wyndham / RCI over 24-36 months. Spinnaker close not yet confirmed via 8-K as of Oct 11, 2026." },
        { title: "Cash conversion below EBITDA growth (Q2 2026)", severity: 3, likelihood: 4, verbatim: "Net cash provided by operating activities of $258 million for the six months ended June 30, 2026 compared to $353 million in the prior-year period; adjusted free cash flow of $95 million compared to $123 million.", source: "TNL Q2 2026 release, Tables 3 and 6", note: "Q2 EMERGENT: 1H adj FCF −23% while Adj EBITDA +9%; FY conversion guided to ~50%. Sustained gap would pressure the $125M/quarter capital-return cadence alongside $343M of acquisition spend." },
        { title: "Owner-tour attrition from closed sales centers (Q2 2026)", severity: 2, likelihood: 4, verbatim: "Stronger conversion and VPG have more than offset the lost tour volume from closed sales centers, allowing us to maintain our VOI sales growth rate.", source: "TNL Q2 2026 call (CEO Brown)", note: "Q2 EMERGENT: tours only +1% as the 17-resort optimization removed owner tour flow; growth now depends on VPG/conversion and new-owner tours (which accelerated in Q2)." }
      ],

      transcriptPanel: {
        title: "Q2 2026 earnings call — Jul 22, 2026 transcript highlights",
        intro: "<strong>Q2 2026 earnings call</strong> · President &amp; CEO Michael Brown and EVP &amp; CFO Erik Hoag. Guidance raised, two acquisitions announced, and the first clear commentary on the RCI exchange challenge."
      },
      transcriptQuotes: [
        { speaker: "Michael Brown, President & CEO", topic: "results (press release)", text: "We delivered another strong quarter driven by a highly engaged owner base and exceptional execution across our Vacation Ownership business. We also announced two acquisitions that add more than 100,000 owners." },
        { speaker: "Michael Brown, President & CEO", topic: "the consumer", text: "We've not seen anything in our metrics that would indicate there's a weakening occurring. Consistent and strong." },
        { speaker: "Michael Brown, President & CEO", topic: "resort optimization", text: "Stronger conversion and VPG have more than offset the lost tour volume from closed sales centers, allowing us to maintain our VOI sales growth rate." },
        { speaker: "Michael Brown, President & CEO", topic: "portfolio quality", text: "Putting these 23 resorts into the system when we've exited 12 full resorts and five partial ones is a absolute numerical increase, but also a quality increase to people's vacation options." },
        { speaker: "Michael Brown, President & CEO", topic: "Travel & Membership", text: "When you step into that business, you see the exchange business is the challenge side of the equation, and we continue to grow transactions, albeit lower margin on the travel club business." },
        { speaker: "Erik Hoag, EVP & CFO", topic: "results (press release)", text: "Revenue increased 4%, EBITDA increased 9% and adjusted earnings per share increased 21%. At the same time, we increased share repurchases by 25%, reduced leverage by approximately a quarter turn and announced two immediately-accretive acquisitions." },
        { speaker: "Erik Hoag, EVP & CFO", topic: "deal math", text: "We're investing approximately $340 million to acquire businesses expected to generate about $50 million of EBITDA on a full year synergized basis. After securitizing roughly $80 million of finance receivables, our net capital deployed falls to about $260 million, resulting in a net investment multiple of approximately 5x EBITDA." },
        { speaker: "Erik Hoag, EVP & CFO", topic: "acquisition rationale", text: "We're not buying these companies for the portfolio. We're buying these companies for the 100,000 owners that come with it and the ability for us to introduce Club Wyndham access, our multi-brand strategy, and have the ability to upgrade them over time." },
        { speaker: "Erik Hoag, EVP & CFO", topic: "delinquencies", text: "In Q1, we talked about a roughly 20 basis point sequential increase in early-stage delinquencies. Since that time, we've seen a roughly 80 basis point improvement since Q1, which is more pronounced than what we would typically expect to see between Q1 and Q2, which would have roughly been about 40 basis points." },
        { speaker: "Erik Hoag, EVP & CFO", topic: "balance sheet", text: "Our financial flexibility is a competitive advantage." }
      ],

      recentCall: {
        period: "Q2 2026",
        date: "2026-07-22",
        sourceLabel: "TNL Q2 2026 press release (Jul 22, 2026) and earnings-call transcript",
        sourceUrl: "https://www.sec.gov/Archives/edgar/data/1361658/000136165826000050/tnl2q26earningsrelease.htm",
        items: [
          "Q2 specifics: net revenue $1,063M (+4%); Adj EBITDA $269M (+8%); net income $109M; diluted EPS $1.72 (+6%); adj diluted EPS $1.88 (+14%); diluted shares 63.4M (vs 66.5M). 1H: revenue +4%, Adj EBITDA +9%, adj EPS +21%.",
          "Vacation Ownership: Gross VOI $693M (+6%; +10% net of fee-for-service); Net VOI $524M (+11%); VPG $3,318 (+2%); tours 200K (+1%); segment Adj EBITDA $247M (+13%); provision $141M (+10%); new-owner mix up slightly with healthy transaction volume and close rates.",
          "Travel & Membership: revenue $157M (−5%); Adj EBITDA $49M (−11%); avg exchange members 3.28M (−2%); exchange transactions 171K (−13%) at $369; travel-club transactions 242K (+27%) at $189 (−17%). Mgmt 'will continue to evaluate' strategic alternatives for T&M.",
          "Guidance RAISED: FY Adj EBITDA $1,065-1,085M (from $1,030-1,055M); Gross VOI $2.60-2.675B; VPG $3,325-3,375. Q3: Adj EBITDA $275-285M; Gross VOI $700-740M; VPG $3,300-3,350. FCF conversion ~50%; consolidated provision ~21% incl. acquisitions; YE leverage ~3.2x.",
          "Acquisitions: Yes& Vacations ($193M; 7 Maui + Las Vegas Strip) closed Jul 15; Spinnaker Resorts ($150M + up to $10M contingent; Hilton Head ×6, Ormond Beach, Branson, Williamsburg) expected to close Q3. Combined 23 resorts, 100K+ owners (~80% loan-free), ~$50M synergized EBITDA, ~5x net multiple, $15-20M 2026 contribution.",
          "Resort-Optimization Initiative: 12 full + 5 partial resorts exited; all HOA/member approvals received; Q2 charges $9M ($31M 1H); developer obligations −$40M in 1H; remaining liability $3M through 2027.",
          "Credit: allowance $660M on $3.25B gross receivables; early-stage delinquencies improved ~80 bps since Q1; origination FICO above 740; down payments mid-20s; long-run provision expected in the upper teens.",
          "Capital: $900M 6.25% secured notes due 2031 (May 20) retired the Jul-2026 notes; Sierra 2026-2 ABS $300M at 5.52% / 98% advance (Jul 20); corporate debt $3.7B, non-recourse $2.0B; first-lien leverage 3.16x; >$1.2B available capacity.",
          "Capital return: Q2 $125M ($37M dividends at $0.60 + $88M buybacks, 1.26M shares at $69.50); 1H $253M; shares outstanding −4%; $745M authorization remaining; Q3 dividend $0.60 declared Aug 4.",
          "Brands: Margaritaville Vacation Club >$150M annual VOI run-rate; Eddie Bauer exceeding expectations; Accor nearly doubling; multi-brand approaching 10% of mix; SI Resorts Nashville opened Sep 1 (post-quarter) with Chicago / Baton Rouge / Tuscaloosa in pipeline and an SI-branded hotel partnership with Wyndham Hotels (Oct 5)."
        ]
      },

      sources: [
        { label: "TNL Q2 2026 earnings press release (8-K Ex. 99.1, Jul 22, 2026)", url: "https://www.sec.gov/Archives/edgar/data/1361658/000136165826000050/tnl2q26earningsrelease.htm" },
        { label: "TNL Q2 2026 Form 10-Q (filed Jul 22, 2026)", url: "https://www.sec.gov/Archives/edgar/data/1361658/000136165826000053/wyn-20260630.htm" },
        { label: "TNL Q2 2026 earnings-call transcript", url: "https://allmind.ai/earnings/event/2937554" },
        { label: "TNL acquisition release — Yes& Vacations + Spinnaker Resorts (Jul 15, 2026)", url: "https://investor.travelandleisureco.com/news-events/press-releases/detail/971/travel-leisure-co-adds-premier-resort-destinations-and-expands-owner-base-by-over-10-with-the-acquisitions-of-yes-vacations-and-spinnaker-resorts" },
        { label: "TNL Q1 2026 press release (Apr 22, 2026) — prior-quarter context", url: "https://investor.travelandleisureco.com/news-events/press-releases/detail/955/travel-leisure-co-reports-first-quarter-2026-results" },
        { label: "FY2025 10-K (filed Feb 18, 2026)", url: "https://www.sec.gov/Archives/edgar/data/1361658/000136165826000009/tnl-20251231.htm" },
        { label: "TNL Investor Relations", url: "https://investor.travelandleisureco.com" },
        { label: "EDGAR filings index (CIK 0001361658)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001361658" }
      ]
    }
  }
};

// Capital-actions tables (rendered on Financial Deep Dive). Kept outside the
// company literals for readability; attached below.
window.MVW_DATA.companies.mvw.capitalActions = [
  { action: "MVW 2026-1 ABS securitization", date: "Q2 2026", value: 460, note: "$470M pool; Class A $277M @4.67%, B $97M @4.97%, C $86M @5.36%; 4.86% weighted avg; proceeds repaid credit facility. Advance rate not stated (~97.9% calculated from disclosed inputs).", source: "MVW Q2 2026 10-Q, Note 11" },
  { action: "Warehouse facility amendment", date: "Jul 15, 2026", value: 500, note: "Revolving period extended from Jun 2027 to Jun 12, 2028; $500M capacity at SOFR+110; $165M drawn at Jun 30", source: "MVW Q2 2026 10-Q" },
  { action: "Westin Cancun hotel sale", date: "Q1 2026", value: 50, note: "Proceeds included in 1H adj FCF; Puerto Vallarta 64-unit purchase ($46M, 2028) tied to the sale", source: "MVW Q2 2026 10-Q, Notes 3 & 9" },
  { action: "Nashville inventory commitment", date: "2027 delivery", value: 122, note: "168 VO units", source: "MVW Q2 2026 10-Q" },
  { action: "Bali inventory — final payment", date: "Post-Q2 2026", value: 11, note: "32 units; remaining $11M paid after quarter-end", source: "MVW Q2 2026 10-Q" },
  { action: "Q3 dividend declared", date: "Sep 2, 2026", value: null, note: "$0.80/share, record Sep 16, payable ~Sep 30", source: "MVW IR release Sep 2, 2026" }
];
window.MVW_DATA.companies.hgv.capitalActions = [
  { action: "Elara JV — remaining 75% acquired", date: "Apr 29, 2026", value: 131, note: "$128M paid + $3M accrued; $411M receivables acquired ($293M securitized); ~$20M FY2026 EBITDA, $25-30M annualized 2027", source: "HGV Q2 2026 10-Q, Note 3" },
  { action: "ABS 2026-1 securitization", date: "Apr 2026", value: 500, note: "Notes $210M @4.67%, $161M @5.01%, $83M @5.36%, $46M @7.21%; due Feb 2043; 98% advance rate", source: "HGV Q2 2026 10-Q, Note 11" },
  { action: "Timeshare Facility renewal & upsize", date: "May 2026", value: 1000, note: "Upsized from $850M to $1.0B; commitment to May 2028, maturity May 2029; Elara loans eligible", source: "HGV Q2 2026 10-Q" },
  { action: "ABS 2026-2 securitization", date: "Jun 2026", value: 300, note: "Notes $119M @4.83%, $99M @5.10%, $51M @5.54%, $31M @6.00%; due Mar 2045; 98% advance rate", source: "HGV Q2 2026 10-Q, Note 11" },
  { action: "Share repurchase (Q2)", date: "Q2 2026", value: 150, note: "3.1M shares incl. 750K at $50.00 from Apollo's June secondary; $25M more Jul 1-23; $103M remaining", source: "HGV Q2 2026 release / 10-Q Note 16" },
  { action: "Non-core disposition", date: "Jun 30, 2026", value: -48, note: "Non-cash loss on sale; $10-12M run-rate maintenance-fee relief; participation in buyer's future sale proceeds", source: "HGV Q2 2026 release / 10-Q Note 19" },
  { action: "Term Loan B refinancing", date: "Jul 17, 2026", value: 850, note: "New TLB due Jul 17, 2033 repays ~$849M TLB due 2028; SOFR+2.00% unchanged; 0.25% quarterly amortization from Q4 2026", source: "HGV 8-K Jul 17, 2026" }
];
window.MVW_DATA.companies.tnl.capitalActions = [
  { action: "6.250% senior secured notes due 2031", date: "May 20, 2026", value: 900, note: "Proceeds redeemed $650M 6.625% notes due Jul 2026 (May 22) and repaid revolver", source: "TNL 8-K May 2026 / Q2 2026 10-Q, Note 12" },
  { action: "Q2 share repurchase", date: "Q2 2026", value: 88, note: "1.26M shares at $69.50 avg; $745M remaining authorization", source: "TNL Q2 2026 release / 10-Q Item 2" },
  { action: "Q2 dividend paid", date: "Jun 30, 2026", value: 37, note: "$0.60/share; Q3 dividend $0.60 declared Aug 4, paid Sep 30", source: "TNL Q2 2026 release / IR release Aug 4, 2026" },
  { action: "Yes& Vacations acquisition", date: "Jul 15, 2026 (closed)", value: 193, note: "7 Maui properties + Las Vegas Strip resort; cash", source: "TNL release Jul 15, 2026 / 10-Q Note 23" },
  { action: "Spinnaker Resorts acquisition", date: "Jul 14, 2026 (agreement)", value: 150, note: "+ up to $10M contingent; 6 Hilton Head + Ormond Beach, Branson, Williamsburg; close expected Q3 2026", source: "TNL release Jul 15, 2026 / 10-Q Note 23" },
  { action: "Sierra Timeshare 2026-2 ABS", date: "Jul 20, 2026", value: 300, note: "5.52% weighted avg coupon; 98% advance rate; A $136M @4.98%, B $52M @5.19%, C $62M @5.63%, D $50M @7.19%", source: "TNL IR release Jul 20, 2026 / 10-Q Note 23" }
];
