/**
 * View renderers — Q2 2026 edition.
 *
 * Returns HTML strings and (where needed) exports an `after()` hook
 * that runs once the markup is mounted (charts, maps, etc.).
 *
 * Tabs: exec | segments | footprint | financials | growth | risks
 *
 * Data shape: see js/data.js. The Q2 2026 edition uses `q2Headline` to
 * distinguish quarterly figures from FY rollup figures (which carry the
 * `*FY` suffix on the same object).
 *
 * Period-specific copy (banner headline, momentum strip, executive read,
 * transcript quotes, guidance rows, capital actions) is DATA-DRIVEN from
 * `MVW_DATA.overview` and per-company blocks so a quarterly refresh only
 * touches js/data.js.
 */

window.MVW_VIEWS = (() => {

  const P = () => window.MVW_DATA.meta.periodLabels; // { q, year, quarter, priorQ, eoq, eoqLong, soq, soqLong }

  // ---------------------------------------------------------------- formatters
  function fmtNumber(v, unit) {
    if (v === null || v === undefined) return "—";
    if (typeof v !== "number") return v;
    if (unit === "USD millions" || unit === "USD billions") {
      const sign = v < 0 ? "-" : "";
      const abs = Math.abs(v);
      if (unit === "USD billions") return `${sign}$${abs.toFixed(1)}B`;
      if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2)}B`;
      return `${sign}$${abs.toLocaleString()}M`;
    }
    if (unit === "USD per share" || unit === "USD per share annualized") {
      return (v < 0 ? "-" : "") + "$" + Math.abs(v).toFixed(2);
    }
    if (unit === "USD per guest" || unit === "USD per transaction" || unit === "USD per exchange transaction" || unit === "USD per Travel Club transaction") {
      return "$" + v.toLocaleString();
    }
    if (unit === "USD") return "$" + v.toLocaleString();
    if (unit === "percent" || (unit && String(unit).startsWith("percent"))) return v.toFixed(1) + "%";
    if (unit === "bps") return (v > 0 ? "+" : "") + v + " bps";
    if (unit === "FICO") return v.toString();
    if (unit === "x" || unit === "x (covenant)") return v.toFixed(1) + "x";
    if (unit === "tours" || unit === "owner families" || unit === "Club members") return v.toLocaleString();
    if (unit === "thousands" || unit === "thousands of transactions") return v.toLocaleString() + "k";
    if (typeof unit === "string" && unit.includes("affiliated")) return v.toLocaleString();
    if (typeof unit === "string" && unit.includes("HGV Max")) return v.toLocaleString();
    return v.toLocaleString();
  }

  function fmtDelta(current, prior) {
    if (current === null || prior === null || current === undefined || prior === undefined) return null;
    if (prior === 0) return null;
    return ((current - prior) / Math.abs(prior)) * 100;
  }

  function deltaClass(pct, opts = {}) {
    if (pct === null || pct === undefined) return "is-neutral";
    if (opts.invert) return pct > 0 ? "is-negative" : (pct < 0 ? "is-positive" : "is-neutral");
    return pct > 0 ? "is-positive" : (pct < 0 ? "is-negative" : "is-neutral");
  }

  function fmtDeltaPct(pct) {
    if (pct === null || pct === undefined) return "";
    const sign = pct > 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}% YoY`;
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Allow a tiny whitelist of inline markup (<strong>, <em>, <br>) in editorial copy.
  function richText(s) {
    return escapeHtml(s)
      .replace(/&lt;strong&gt;/g, "<strong>").replace(/&lt;\/strong&gt;/g, "</strong>")
      .replace(/&lt;em&gt;/g, "<em>").replace(/&lt;\/em&gt;/g, "</em>")
      .replace(/&lt;br&gt;/g, "<br>");
  }

  // ---------------------------------------------------------------- KPI card
  function kpiCard({ label, value, unit, prior, source, note, valueOverride, invertDelta }) {
    let pct = null;
    let deltaTxt = "";
    if (typeof value === "number" && typeof prior === "number") {
      pct = fmtDelta(value, prior);
    }
    const cls = deltaClass(pct, { invert: invertDelta });
    if (pct !== null) deltaTxt = fmtDeltaPct(pct);

    const display = valueOverride !== undefined ? valueOverride : fmtNumber(value, unit);

    return `
      <div class="kpi" ${source ? `data-source="${escapeHtml(source)}"` : ""}>
        <div class="kpi__label">${escapeHtml(label)}</div>
        <div class="kpi__value">${escapeHtml(display)}</div>
        ${pct !== null ? `<div class="kpi__delta ${cls}">${escapeHtml(deltaTxt)}</div>` : ""}
        ${note ? `<div class="kpi__source">${escapeHtml(note)}</div>` : ""}
      </div>
    `;
  }

  // Prior-period value for a metric leaf (priorQ preferred, then prior)
  function priorOf(k) {
    if (!k) return undefined;
    if (typeof k.priorQ === "number") return k.priorQ;
    if (typeof k.prior === "number") return k.prior;
    return undefined;
  }

  // ---------------------------------------------------------------- Overview (comparative)
  function renderOverview() {
    const D = window.MVW_DATA.companies;
    const OV = window.MVW_DATA.overview;
    const pl = P();
    const mvw = D.mvw, hgv = D.hgv, tnl = D.tnl;

    const rows = OV.scorecardRows;

    function getKpi(co, path) {
      if (path === null || path === undefined) return null;
      const key = typeof path === "string" ? path : path[co.slug];
      if (!key) return null;
      return co.q2Headline[key] || null;
    }
    function findLeader(values, direction) {
      const valid = values.filter(v => typeof v === "number");
      if (valid.length === 0 || direction === "neutral") return -1;
      const target = direction === "high" ? Math.max(...valid) : Math.min(...valid);
      return values.indexOf(target);
    }

    const scorecardRows = rows.map(row => {
      if (row.isSection) {
        return `<div class="sc-section">${escapeHtml(row.label)}</div>`;
      }

      // guidance row uses pre-set midpoints
      if (row.guideMid) {
        const vals = [row.guideMid.mvw, row.guideMid.hgv, row.guideMid.tnl];
        const leaderIdx = findLeader(vals, row.direction);
        const cell = (idx, mid, range) => `
          <div class="sc-cell sc-cell--num ${idx === leaderIdx ? "sc-cell--leader" : ""}" data-source="2026 full-year guidance midpoint">
            ${escapeHtml(fmtNumber(mid, "USD millions"))}
            <span class="delta is-neutral" style="font-style:normal;">${escapeHtml(range)}</span>
          </div>`;
        return `
          <div class="sc-cell sc-cell--label">${escapeHtml(row.label)}${row.caption ? `<div class="sc-cell__caption">${escapeHtml(row.caption)}</div>` : ""}</div>
          ${cell(0, row.guideMid.mvw, row.guideRange.mvw)}
          ${cell(1, row.guideMid.hgv, row.guideRange.hgv)}
          ${cell(2, row.guideMid.tnl, row.guideRange.tnl)}
        `;
      }

      const m = getKpi(mvw, row.path);
      const h = getKpi(hgv, row.path);
      const t = getKpi(tnl, row.path);
      const vals = [m?.value, h?.value, t?.value];
      const leaderIdx = findLeader(vals, row.direction);

      const cell = (idx, kpi) => {
        if (!kpi || kpi.value === null || kpi.value === undefined) {
          return `<div class="sc-cell sc-cell--num muted" ${kpi?.note ? `data-source="${escapeHtml(kpi.note)}"` : ""}>—</div>`;
        }
        const isLeader = idx === leaderIdx;
        const pr = priorOf(kpi);
        const pct = (typeof kpi.value === "number" && typeof pr === "number") ? fmtDelta(kpi.value, pr) : null;
        return `
          <div class="sc-cell sc-cell--num ${isLeader ? "sc-cell--leader" : ""}" data-source="${escapeHtml(kpi.source || "")}">
            ${escapeHtml(fmtNumber(kpi.value, kpi.unit || row.unit))}
            ${pct !== null ? `<span class="delta ${deltaClass(pct, { invert: row.invert })}">${fmtDeltaPct(pct)}</span>` : ""}
          </div>
        `;
      };

      return `
        <div class="sc-cell sc-cell--label">
          ${escapeHtml(row.label)}${row.note ? ` <span class="muted">(${escapeHtml(row.note)})</span>` : ""}
          ${row.caption ? `<div class="sc-cell__caption">${escapeHtml(row.caption)}</div>` : ""}
        </div>
        ${cell(0, m)}
        ${cell(1, h)}
        ${cell(2, t)}
      `;
    }).join("");

    const headerCell = (slug, name, ticker, color) => `
      <div class="sc-cell sc-cell--head" data-route="#/company/${slug}/exec">
        <span class="swatch" style="background:${color}"></span>${escapeHtml(name)}
        <span class="ticker">${escapeHtml(ticker)}</span>
        <span class="period-tag">${escapeHtml(pl.q)} '${String(pl.year).slice(2)}</span>
        <span class="arrow">→</span>
      </div>
    `;

    const momentum = OV.momentum.map(mc => {
      const co = D[mc.slug];
      const cls = mc.yoyPct > 0 ? "var(--positive)" : (mc.yoyPct < 0 ? "var(--negative)" : "var(--neutral)");
      const sign = mc.yoyPct > 0 ? "+" : (mc.yoyPct < 0 ? "−" : "");
      return `
        <div class="momentum-strip__cell">
          <div class="momentum-strip__co"><span class="swatch" style="background:${co.brandColor}"></span>${escapeHtml(co.shortName)} · ${escapeHtml(mc.metricLabel)}</div>
          <div class="momentum-strip__metric">${escapeHtml(mc.valueText)} <span class="num" style="color:${cls};font-size:14px;">${sign}${Math.abs(mc.yoyPct).toFixed(0)}% YoY</span></div>
          <div class="momentum-strip__sub">${richText(mc.sub)}</div>
        </div>`;
    }).join("");

    const execRead = OV.executiveRead.map(col => {
      const co = D[col.slug];
      return `
        <div>
          <h3>${escapeHtml(co.shortName)} · ${escapeHtml(col.title)}</h3>
          <ul style="font-size:13px;color:var(--text-secondary);line-height:1.7;">
            ${col.bullets.map(b => `<li>${richText(b)}</li>`).join("")}
          </ul>
        </div>`;
    }).join("");

    return `
      <div class="quarter-banner">
        <div>
          <div class="quarter-banner__eyebrow">${escapeHtml(OV.banner.eyebrow)}</div>
          <h1 class="quarter-banner__headline">${OV.banner.headlineHtml}</h1>
        </div>
        <div class="quarter-banner__stats">
          ${OV.banner.stats.map(s => `<div class="quarter-banner__stat">${escapeHtml(s.label)}<span class="num">${escapeHtml(s.value)}</span></div>`).join("")}
        </div>
      </div>

      <div class="momentum-strip">${momentum}</div>

      <div class="page-header">
        <div>
          <h1>${escapeHtml(pl.quarter)} Vacation Ownership Competitive Position</h1>
          <p>${escapeHtml(OV.intro)}</p>
        </div>
        <span class="tag">${escapeHtml(pl.quarter)}</span>
      </div>

      <div class="grid grid--3" style="margin-bottom:32px;">
        ${heroCard("MVW", "Marriott Vacations", "VAC", mvw, "mvw")}
        ${heroCard("HGV", "Hilton Grand Vacations", "HGV", hgv, "hgv")}
        ${heroCard("TNL", "Travel + Leisure Co.", "TNL", tnl, "tnl")}
      </div>

      <h2>${escapeHtml(pl.quarter)} Comparative Scorecard</h2>
      <div class="scorecard">
        <div class="sc-cell sc-cell--label" style="background:var(--bg-elevated);font-weight:700;">Metric</div>
        ${headerCell("mvw", "Marriott Vacations", "NYSE: VAC", mvw.brandColor)}
        ${headerCell("hgv", "Hilton Grand Vacations", "NYSE: HGV", hgv.brandColor)}
        ${headerCell("tnl", "Travel + Leisure Co.", "NYSE: TNL", tnl.brandColor)}
        ${scorecardRows}
      </div>

      <div class="grid grid--2" style="margin-top:32px;">
        <div class="panel">
          <h2>${escapeHtml(pl.q)} Revenue — YoY comparison</h2>
          <div class="chart-wrap"><canvas id="ov-chart-revenue"></canvas></div>
          <p class="muted" style="margin-top:12px;font-size:11px;">${richText(OV.chartNotes.revenue)}</p>
        </div>
        <div class="panel">
          <h2>${escapeHtml(pl.q)} Adj EBITDA — YoY comparison</h2>
          <div class="chart-wrap"><canvas id="ov-chart-ebitda"></canvas></div>
          <p class="muted" style="margin-top:12px;font-size:11px;">${richText(OV.chartNotes.ebitda)}</p>
        </div>
        <div class="panel">
          <h2>${escapeHtml(pl.q)} Contract sales / Gross VOI sales</h2>
          <div class="chart-wrap"><canvas id="ov-chart-contract"></canvas></div>
          <p class="muted" style="margin-top:12px;font-size:11px;">${richText(OV.chartNotes.contract)}</p>
        </div>
        <div class="panel">
          <h2>2026 Adj EBITDA guidance (midpoint)</h2>
          <div class="chart-wrap"><canvas id="ov-chart-guide"></canvas></div>
          <p class="muted" style="margin-top:12px;font-size:11px;">${richText(OV.chartNotes.guide)}</p>
        </div>
      </div>

      <div class="panel" style="margin-top:32px;">
        <h2>${escapeHtml(pl.quarter)} market capitalization &amp; share-price performance</h2>
        <p class="muted" style="font-size:12px;margin-bottom:16px;">
          Market cap as of <strong>${escapeHtml(pl.eoqLong)}</strong> close (Yahoo Finance) × ${escapeHtml(pl.quarter)} weighted-average diluted shares (derived from each company's ${escapeHtml(pl.q)} net income / diluted EPS).
          ${escapeHtml(pl.q)} stock-price performance compares ${escapeHtml(pl.eoq)} close to ${escapeHtml(pl.soq)} close (price-only return, ex-dividends).
        </p>
        <div class="grid grid--3">
          ${marketCapCard(mvw, "mvw")}
          ${marketCapCard(hgv, "hgv")}
          ${marketCapCard(tnl, "tnl")}
        </div>
        <div class="grid grid--2" style="margin-top:24px;">
          <div>
            <h3>Market cap — ${escapeHtml(pl.q)} starting vs. ending</h3>
            <div class="chart-wrap"><canvas id="ov-chart-mktcap"></canvas></div>
            <p class="muted" style="font-size:11px;margin-top:8px;">${richText(OV.chartNotes.mktcap)}</p>
          </div>
          <div>
            <h3>${escapeHtml(pl.q)} stock-price performance</h3>
            <div class="chart-wrap"><canvas id="ov-chart-perf"></canvas></div>
            <p class="muted" style="font-size:11px;margin-top:8px;">${richText(OV.chartNotes.perf)}</p>
          </div>
        </div>
      </div>

      <div class="panel" style="margin-top:32px;">
        <h2>What's the executive read on ${escapeHtml(pl.quarter)}?</h2>
        <div class="grid grid--3" style="margin-top:8px;">${execRead}</div>
        <div style="margin-top:20px;">
          ${OV.vectorTags.map(t => `<span class="vector-tag">${escapeHtml(t)}</span>`).join("")}
        </div>
      </div>

      ${sourcesBlock([...mvw.sources, ...hgv.sources, ...tnl.sources])}
    `;

    function marketCapCard(co, slug) {
      const k = co.q2Headline;
      const mc = k.marketCapEoq.value;
      const change = k.q2PricePerformance.value;
      const changeClass = change > 0 ? "is-positive" : (change < 0 ? "is-negative" : "is-neutral");
      const changeArrow = change > 0 ? "▲" : (change < 0 ? "▼" : "▬");
      return `
        <div class="panel" style="border-top:3px solid ${co.brandColor};padding:20px 24px;cursor:pointer;" data-route="#/company/${slug}/financials">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <span style="display:inline-block;width:14px;height:14px;background:${co.brandColor};"></span>
            <span style="font-family:'Lato';font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:var(--text-secondary);">${escapeHtml(co.shortName)} · ${escapeHtml(co.ticker)}</span>
          </div>
          <div style="font-family:'Montserrat';font-size:30px;font-weight:200;color:var(--ink-deep);letter-spacing:-0.6px;line-height:1.05;">
            ${fmtNumber(mc, "USD millions")}
          </div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px;">EoQ market cap</div>
          <div style="margin-top:14px;padding-top:10px;border-top:1px dashed var(--border-subtle);display:flex;justify-content:space-between;align-items:baseline;font-size:12px;">
            <span style="color:var(--text-secondary);font-weight:600;">${escapeHtml(pl.q)} share-price</span>
            <span class="${changeClass}" style="font-family:'JetBrains Mono';font-weight:700;font-size:14px;">
              ${changeArrow} ${change > 0 ? "+" : ""}${change.toFixed(2)}%
            </span>
          </div>
          <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;color:var(--text-tertiary);">
            <div>${escapeHtml(pl.soq)}: <span class="num" style="color:var(--text-primary);font-weight:600;">$${k.priceSoq.value.toFixed(2)}</span></div>
            <div>${escapeHtml(pl.eoq)}: <span class="num" style="color:var(--text-primary);font-weight:600;">$${k.priceEoq.value.toFixed(2)}</span></div>
            <div style="grid-column:span 2;">Diluted shares: <span class="num" style="color:var(--text-primary);font-weight:600;">${k.dilutedShares.value.toFixed(1)}M</span></div>
          </div>
        </div>
      `;
    }

    function heroCard(short, full, ticker, co, slug) {
      const mark = co.brandColor;
      const accent = co.brandAccent || co.brandColor;
      const k = co.q2Headline;
      return `
        <div class="panel panel--accent hero-card" style="--brand-primary:${mark};--brand-primary-on-dark:${accent};border-top-color:${accent};" data-route="#/company/${slug}/exec">
          <div class="hero-card__head">
            <div class="hero-card__mark" style="background:${mark};">${short}</div>
            <div class="hero-card__title">
              <div class="hero-card__name">${full}</div>
              <div class="hero-card__ticker">${ticker} · ${escapeHtml(pl.quarter)}</div>
            </div>
            <div class="hero-card__arrow">→</div>
          </div>
          <div class="hero-card__revenue num">${fmtNumber(k.revenue.value, "USD millions")}<span class="kpi__unit"> ${escapeHtml(pl.q)} revenue</span></div>
          <div class="hero-card__desc">${escapeHtml(co.narrative.oneLiner)}</div>
          <div class="hero-card__stats">
            <div><span class="num">${fmtNumber(k.adjEbitda.value, "USD millions")}</span> ${escapeHtml(pl.q)} Adj EBITDA</div>
            <div><span class="num">${k.resorts.value}+</span> resorts</div>
            <div><span class="num">${(k.owners.value / 1000).toFixed(0)}k</span> owners</div>
          </div>
        </div>
      `;
    }
  }

  function afterOverview() {
    const D = window.MVW_DATA.companies;
    const pl = P();
    const H = (slug) => D[slug].q2Headline;
    const salesKey = (slug) => D[slug].q2Headline.contractSales ? "contractSales" : "grossVoiSales";

    MVW_CHARTS.comparativeBars("ov-chart-revenue", {
      labels: [pl.priorQ, pl.quarter],
      mvw: [H("mvw").revenue.priorQ ?? null, H("mvw").revenue.value],
      hgv: [H("hgv").revenue.priorQ ?? null, H("hgv").revenue.value],
      tnl: [H("tnl").revenue.priorQ ?? null, H("tnl").revenue.value],
      currency: true, unit: "M"
    });
    MVW_CHARTS.comparativeBars("ov-chart-ebitda", {
      labels: [pl.priorQ, pl.quarter],
      mvw: [H("mvw").adjEbitda.priorQ, H("mvw").adjEbitda.value],
      hgv: [H("hgv").adjEbitda.priorQ, H("hgv").adjEbitda.value],
      tnl: [H("tnl").adjEbitda.priorQ, H("tnl").adjEbitda.value],
      currency: true, unit: "M"
    });
    MVW_CHARTS.comparativeBars("ov-chart-contract", {
      labels: [pl.priorQ, pl.quarter],
      mvw: [H("mvw")[salesKey("mvw")].priorQ, H("mvw")[salesKey("mvw")].value],
      hgv: [H("hgv")[salesKey("hgv")].priorQ, H("hgv")[salesKey("hgv")].value],
      tnl: [H("tnl")[salesKey("tnl")].priorQ, H("tnl")[salesKey("tnl")].value],
      currency: true, unit: "M"
    });
    const mid = (g) => (g.low + g.high) / 2;
    MVW_CHARTS.comparativeBars("ov-chart-guide", {
      labels: ["2026 Adj EBITDA guide (mid)"],
      mvw: [mid(D.mvw.guidance.adjEbitda)],
      hgv: [mid(D.hgv.guidance.adjEbitda)],
      tnl: [mid(D.tnl.guidance.adjEbitda)],
      currency: true, unit: "M"
    });
    const startCap = (co) => Math.round(co.q2Headline.priceSoq.value * co.q2Headline.dilutedShares.value);
    MVW_CHARTS.comparativeBars("ov-chart-mktcap", {
      labels: [pl.soqLong, pl.eoqLong],
      mvw: [startCap(D.mvw), H("mvw").marketCapEoq.value],
      hgv: [startCap(D.hgv), H("hgv").marketCapEoq.value],
      tnl: [startCap(D.tnl), H("tnl").marketCapEoq.value],
      currency: true, unit: "M"
    });
    MVW_CHARTS.comparativeBars("ov-chart-perf", {
      labels: [`${pl.quarter} share-price change`],
      mvw: [H("mvw").q2PricePerformance.value],
      hgv: [H("hgv").q2PricePerformance.value],
      tnl: [H("tnl").q2PricePerformance.value],
      currency: false, unit: "%"
    });
  }

  // ---------------------------------------------------------------- Company hero
  function companyHero(co) {
    return `
      <div class="company-hero">
        <div class="company-hero__mark" style="background:${co.brandColor};">${co.shortName}</div>
        <div class="company-hero__body">
          <div class="company-hero__name">${escapeHtml(co.name)}</div>
          <div class="company-hero__meta">
            <span>${escapeHtml(co.exchange)}: ${escapeHtml(co.ticker)}</span>
            <span>HQ ${escapeHtml(co.hq)}</span>
            <span>CEO ${escapeHtml(co.ceo.name)}</span>
            <span>${escapeHtml(co.fiscal.period)}</span>
            <span>Released ${escapeHtml(co.fiscal.releaseDate)}</span>
          </div>
        </div>
        <button class="company-hero__back" data-route="#/">← Back to overview</button>
      </div>
    `;
  }

  function companyTabs(co, activeTab) {
    const tabs = [
      ["exec", "Executive Overview"],
      ["segments", "Segment Drill-Down"],
      ["footprint", "Global Footprint"],
      ["financials", "Financial Deep Dive"],
      ["growth", "Growth Catalysts"],
      ["risks", "Risk Matrix"]
    ];
    return `
      <div class="tabs">
        ${tabs.map(([slug, label]) => `
          <button class="tab ${activeTab === slug ? "is-active" : ""}" data-route="#/company/${co.slug}/${slug}">
            ${label}
          </button>
        `).join("")}
      </div>
    `;
  }

  function sourcesBlock(sources) {
    const unique = [...new Map(sources.map(s => [s.url + s.label, s])).values()];
    return `
      <div class="sources">
        <h3>Sources</h3>
        <ul>
          ${unique.map(s => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a></li>`).join("")}
        </ul>
      </div>
    `;
  }

  // ---------------------------------------------------------------- Tab: Executive Overview
  function renderExec(co) {
    const k = co.q2Headline;
    const pl = P();
    const salesKpi = k.contractSales
      ? kpiCard({ label: `${pl.q} contract sales`, value: k.contractSales.value, unit: k.contractSales.unit, prior: priorOf(k.contractSales), source: k.contractSales.source, note: k.contractSales.note })
      : (k.grossVoiSales ? kpiCard({ label: `${pl.q} Gross VOI sales`, value: k.grossVoiSales.value, unit: k.grossVoiSales.unit, prior: priorOf(k.grossVoiSales), source: k.grossVoiSales.source, note: k.grossVoiSales.note }) : "");
    const vpgKpi = (k.vpg && k.vpg.value !== null)
      ? kpiCard({ label: `${pl.q} VPG`, value: k.vpg.value, unit: k.vpg.unit, prior: priorOf(k.vpg), source: k.vpg.source, note: k.vpg.note })
      : `<div class="kpi" data-source="${escapeHtml(k.vpg?.source || "")}"><div class="kpi__label">${escapeHtml(pl.q)} VPG</div><div class="kpi__value is-small">${escapeHtml(k.vpg?.display || "Not separately disclosed")}</div><div class="kpi__source">${escapeHtml(k.vpg?.note || "")}</div></div>`;
    const toursKpi = k.tours
      ? (k.tours.value !== null && k.tours.value !== undefined
          ? kpiCard({ label: `${pl.q} tours`, value: k.tours.value, unit: k.tours.unit, prior: priorOf(k.tours), source: k.tours.source, note: k.tours.note })
          : `<div class="kpi" data-source="${escapeHtml(k.tours.source || "")}"><div class="kpi__label">${escapeHtml(pl.q)} tours</div><div class="kpi__value is-small">${escapeHtml(k.tours.display || "Not separately disclosed")}</div><div class="kpi__source">${escapeHtml(k.tours.note || "")}</div></div>`)
      : "";

    return `
      ${companyHero(co)}
      ${companyTabs(co, "exec")}

      <div class="callout">
        <strong>${escapeHtml(co.name)}.</strong> ${escapeHtml(co.narrative.oneLiner)}
      </div>

      <h3 style="margin-top:8px;">${escapeHtml(pl.quarter)} headline metrics</h3>
      <div class="grid grid--4" style="margin-bottom:24px;">
        ${kpiCard({ label: `${pl.q} revenue`, value: k.revenue.value, unit: k.revenue.unit, prior: priorOf(k.revenue), source: k.revenue.source, note: k.revenue.note })}
        ${kpiCard({ label: `${pl.q} Adj EBITDA`, value: k.adjEbitda.value, unit: k.adjEbitda.unit, prior: priorOf(k.adjEbitda), source: k.adjEbitda.source, note: k.adjEbitda.note })}
        ${kpiCard({ label: `${pl.q} Adj EBITDA margin`, value: k.adjEbitdaMargin.value, unit: k.adjEbitdaMargin.unit, source: k.adjEbitdaMargin.source, note: k.adjEbitdaMargin.note })}
        ${kpiCard({ label: `${pl.q} net income`, value: k.netIncome.value, unit: k.netIncome.unit, prior: priorOf(k.netIncome), source: k.netIncome.source, note: k.netIncome.note })}
        ${k.adjDilutedEps ? kpiCard({ label: `${pl.q} adj diluted EPS`, value: k.adjDilutedEps.value, unit: k.adjDilutedEps.unit, prior: priorOf(k.adjDilutedEps), source: k.adjDilutedEps.source, note: k.adjDilutedEps.note }) : ""}
        ${k.dilutedEps ? kpiCard({ label: `${pl.q} diluted EPS (GAAP)`, value: k.dilutedEps.value, unit: k.dilutedEps.unit, prior: priorOf(k.dilutedEps), source: k.dilutedEps.source, note: k.dilutedEps.note }) : ""}
        ${salesKpi}
        ${vpgKpi}
        ${toursKpi}
        ${k.toursGrowth ? kpiCard({ label: `${pl.q} tour growth`, value: k.toursGrowth.value, unit: k.toursGrowth.unit, source: k.toursGrowth.source, note: k.toursGrowth.note }) : ""}
      </div>

      <div class="grid grid--2">
        <div class="panel">
          <h2>Company at a glance</h2>
          <table class="data">
            <tbody>
              <tr><td>Headquarters</td><td class="num">${escapeHtml(co.hq)}</td></tr>
              <tr><td>History</td><td>${escapeHtml(co.foundedSpinOff)}</td></tr>
              <tr><td>CEO</td><td>${escapeHtml(co.ceo.name)} — ${escapeHtml(co.ceo.title)}<div class="muted">${escapeHtml(co.ceo.note || "")}</div></td></tr>
              <tr><td>CFO</td><td>${escapeHtml(co.cfo.name)} — ${escapeHtml(co.cfo.title)}<div class="muted">${escapeHtml(co.cfo.note || "")}</div></td></tr>
              ${co.coo ? `<tr><td>COO</td><td>${escapeHtml(co.coo.name)} — ${escapeHtml(co.coo.title)}<div class="muted">${escapeHtml(co.coo.note || "")}</div></td></tr>` : ""}
              <tr><td>Associates (latest 10-K)</td><td class="num">${co.employees.value.toLocaleString()}</td></tr>
              <tr><td>Resorts</td><td class="num">${k.resorts.value}+</td></tr>
              <tr><td>Owner / member families</td><td class="num">${k.owners.value.toLocaleString()}</td></tr>
              ${k.countries ? `<tr><td>Countries</td><td class="num">${k.countries.value}</td></tr>` : ""}
              <tr><td>${escapeHtml(pl.quarter)} release date</td><td>${escapeHtml(co.fiscal.releaseDate)}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="panel">
          <h2>The ${escapeHtml(pl.quarter)} chapter</h2>
          <p style="font-size:13px;line-height:1.7;color:var(--text-secondary);">${escapeHtml(co.narrative.history)}</p>
          <div class="divider"></div>
          <p style="font-size:13px;line-height:1.7;color:var(--text-primary);">${escapeHtml(co.narrative.currentChapter)}</p>
        </div>
      </div>

      ${co.transcriptQuotes && co.transcriptQuotes.length ? `
        <div class="panel" style="margin-top:24px;">
          <h2>${escapeHtml(co.transcriptPanel?.title || (pl.quarter + " earnings call — transcript highlights"))}</h2>
          ${co.transcriptPanel?.intro ? `<div class="callout" style="margin-bottom:16px;">${richText(co.transcriptPanel.intro)}</div>` : ""}
          ${co.transcriptQuotes.map(q => `
            <div class="transcript-quote">
              <div class="transcript-quote__speaker">${escapeHtml(q.speaker)}${q.topic ? ` — ${escapeHtml(q.topic)}` : ""}</div>
              <div class="transcript-quote__text">"${escapeHtml(q.text)}"</div>
            </div>
          `).join("")}
          <div class="call-source">
            Source: <a href="${escapeHtml(co.recentCall.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(co.recentCall.sourceLabel)}</a>
          </div>
        </div>
      ` : ""}

      ${co.recentCall ? `
        <div class="panel" style="margin-top:24px;">
          <h2>${escapeHtml(pl.quarter)} call — key items</h2>
          <div class="callout" style="margin-bottom:16px;">
            <strong>${escapeHtml(co.recentCall.period)} call</strong> · ${escapeHtml(co.recentCall.date)} · paraphrased from primary-source release / transcript.
          </div>
          <ul class="call-list">
            ${co.recentCall.items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
          <div class="call-source">
            Source: <a href="${escapeHtml(co.recentCall.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(co.recentCall.sourceLabel)}</a>
          </div>
        </div>
      ` : ""}

      ${sourcesBlock(co.sources)}
    `;
  }

  // ---------------------------------------------------------------- Tab: Segment Drill-Down
  function renderSegments(co) {
    const segs = co.segments;
    const pl = P();
    return `
      ${companyHero(co)}
      ${companyTabs(co, "segments")}

      <div class="callout">
        ${richText(co.segmentNote || `Segment-level revenue, Adj EBITDA, and margin from the company's ${pl.quarter} release.`)}
      </div>

      <div class="grid grid--2">
        <div class="panel">
          <h2>Revenue mix by segment</h2>
          <div class="chart-wrap chart-wrap--tall"><canvas id="seg-doughnut"></canvas></div>
        </div>
        <div class="panel">
          <h2>Revenue & Adj EBITDA — by segment</h2>
          <div class="chart-wrap chart-wrap--tall"><canvas id="seg-bars"></canvas></div>
        </div>
      </div>

      <div class="panel" style="margin-top:24px;">
        <h2>Segment detail</h2>
        <table class="data">
          <thead>
            <tr>
              <th>Segment</th>
              <th class="num">Revenue</th>
              <th class="num">YoY %</th>
              <th class="num">Adj EBITDA</th>
              <th class="num">EBITDA YoY %</th>
              <th class="num">Margin</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${segs.map(s => {
              const yoy = (s.revenuePrior && s.revenue) ? fmtDelta(s.revenue, s.revenuePrior) : null;
              const eyoy = (s.adjEbitdaPrior && s.adjEbitda) ? fmtDelta(s.adjEbitda, s.adjEbitdaPrior) : null;
              const ebitdaMargin = (s.margin || (s.revenue && s.adjEbitda ? (s.adjEbitda / s.revenue) * 100 : null));
              return `
                <tr>
                  <td><span class="tag" style="background:${s.color}22;border-color:${s.color};color:${s.color};">${escapeHtml(s.name)}</span><div class="muted" style="font-size:10px;margin-top:4px;">${escapeHtml(s.period || "")}</div></td>
                  <td class="num">${fmtNumber(s.revenue, "USD millions")}</td>
                  <td class="num"><span class="${deltaClass(yoy)}">${yoy !== null ? fmtDeltaPct(yoy) : "—"}</span></td>
                  <td class="num">${fmtNumber(s.adjEbitda, "USD millions")}</td>
                  <td class="num"><span class="${deltaClass(eyoy)}">${eyoy !== null ? fmtDeltaPct(eyoy) : "—"}</span></td>
                  <td class="num">${ebitdaMargin !== null ? ebitdaMargin.toFixed(1) + "%" : "—"}</td>
                  <td class="muted" style="max-width:380px;font-size:12px;">${escapeHtml(s.description)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <div class="panel" style="margin-top:24px;">
        <h2>Brand portfolio</h2>
        <table class="data">
          <thead>
            <tr>
              <th>Brand</th>
              ${co.brands[0].resorts !== undefined ? `<th class="num">Resorts</th>` : ""}
              ${co.brands[0].keys !== undefined ? `<th class="num">Keys</th>` : ""}
              <th>${co.brands[0].licensor ? "Licensor / Type" : "Type / Notes"}</th>
            </tr>
          </thead>
          <tbody>
            ${co.brands.map(b => `
              <tr>
                <td><strong>${escapeHtml(b.name)}</strong>${b.note ? `<div class="muted" style="font-size:11px;">${escapeHtml(b.note)}</div>` : ""}</td>
                ${co.brands[0].resorts !== undefined ? `<td class="num">${b.resorts !== undefined ? b.resorts : "—"}</td>` : ""}
                ${co.brands[0].keys !== undefined ? `<td class="num">${b.keys !== undefined ? b.keys.toLocaleString() : "—"}</td>` : ""}
                <td>${escapeHtml(b.licensor || b.type || "")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <p class="muted" style="font-size:11px;margin-top:12px;">
          Brand-level operating metrics (tours, contract sales, VPG) are <strong>not disclosed at the individual-brand level</strong> in any of the three peers' ${escapeHtml(pl.quarter)} releases — these metrics are reported only at the consolidated company or operating-segment level.
        </p>
      </div>

      ${sourcesBlock(co.sources)}
    `;
  }

  function afterSegments(co) {
    MVW_CHARTS.segmentDoughnut("seg-doughnut", { segments: co.segments });
    MVW_CHARTS.segmentBars("seg-bars", { segments: co.segments });
  }

  // ---------------------------------------------------------------- Tab: Global Footprint
  function renderFootprint(co) {
    const regions = co.geography.regions;
    const totalResorts = regions.reduce((s, r) => s + (r.resorts || 0), 0);

    return `
      ${companyHero(co)}
      ${companyTabs(co, "footprint")}

      <div class="callout">
        ${escapeHtml(co.geography.summary)}
      </div>

      <div class="panel">
        <h2>Resort footprint — interactive map</h2>
        <div id="footprint-map"></div>
        <p class="muted" style="font-size:11px;margin-top:12px;">
          Markers represent disclosed regions or country clusters from the company's filings.
          ${co.slug !== "mvw" ? "Resort-level coordinates are not disclosed; markers are positioned at approximate regional centroids and sized by available data." : "MVW provides state/country-level resort and key counts in Item 2 of the FY2025 10-K."}
        </p>
      </div>

      <div class="panel" style="margin-top:24px;">
        <h2>Regional table</h2>
        <table class="data">
          <thead>
            <tr>
              <th>Region</th>
              <th class="num">Resorts</th>
              <th class="num">Keys / units</th>
              <th>Notes</th>
              <th class="num">Source</th>
            </tr>
          </thead>
          <tbody>
            ${regions.map(r => `
              <tr>
                <td>${escapeHtml(r.name)}</td>
                <td class="num">${r.resorts !== undefined ? r.resorts : (r.share !== undefined ? r.share + "%" : "—")}</td>
                <td class="num">${r.keys ? r.keys.toLocaleString() : "—"}</td>
                <td class="muted" style="font-size:11px;">${escapeHtml(r.note || "")}</td>
                <td class="num muted" style="font-size:10px;">${escapeHtml(r.source || "")}</td>
              </tr>
            `).join("")}
            <tr style="font-weight:600;background:rgba(255,255,255,0.025);">
              <td>Total disclosed resorts (regions with counts)</td>
              <td class="num">${totalResorts}</td>
              <td class="num">—</td>
              <td class="muted" style="font-size:11px;">${co.slug === "mvw" ? "Sums to 120 (10-K Item 1)" : "Disclosed concentrations only"}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      ${sourcesBlock(co.sources)}
    `;
  }

  function afterFootprint(co) {
    if (!window.L) return;
    const map = L.map("footprint-map", {
      center: [25, -40],
      zoom: 2,
      minZoom: 2,
      worldCopyJump: true,
      scrollWheelZoom: false
    });
    // Esri World Light Gray Canvas — free, no API key. CARTO's public
    // basemaps began watermarking tiles "API KEY REQUIRED" for third-party
    // sites in Oct 2026 (see DECISIONS.md 2026-10-11).
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS, &copy; OpenStreetMap contributors',
      maxZoom: 16
    }).addTo(map);

    const color = co.brandAccent || co.brandColor;
    co.geography.regions.forEach(r => {
      if ((r.lat === 0 && r.lng === 0) || r.lat === undefined) return;
      const radius = r.resorts ? Math.min(28, 8 + Math.sqrt(r.resorts) * 4) : (r.share ? Math.min(28, 8 + Math.sqrt(r.share) * 3) : 8);
      const marker = L.circleMarker([r.lat, r.lng], {
        radius,
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.45
      }).addTo(map);
      const popup = `
        <strong>${escapeHtml(r.name)}</strong>
        ${r.resorts ? `<div>${r.resorts} resorts</div>` : ""}
        ${r.keys ? `<div>${r.keys.toLocaleString()} keys</div>` : ""}
        ${r.share ? `<div>${r.share}% of VOI sales</div>` : ""}
        ${r.note ? `<div style="color:var(--text-tertiary);font-size:11px;margin-top:4px;">${escapeHtml(r.note)}</div>` : ""}
      `;
      marker.bindPopup(popup);
    });

    setTimeout(() => map.invalidateSize(), 100);
  }

  // ---------------------------------------------------------------- Tab: Financial Deep Dive
  function renderFinancials(co) {
    const k = co.q2Headline;
    const pl = P();
    const totalDebt = (k.corporateDebt?.value || 0) + (k.securitizedDebt?.value || 0);
    const g = co.guidance || {};
    const cash = k.cash || k.cashOnHand;
    const lev = k.leverage || k.netLeverage;

    // Guidance rows: every entry with a `label` renders; range formatting by unit.
    const fmtGuide = (row) => {
      if (row.display) return row.display;
      const money = (v) => "$" + Number(v).toLocaleString();
      if (typeof row.low === "number" && typeof row.high === "number") {
        if (row.unit === "USD millions") return `${money(row.low)}-${money(row.high)}M${row.growth !== undefined ? ` (${row.growth > 0 ? "+" : ""}${row.growth}%)` : ""}`;
        if (row.unit === "USD per guest") return `${money(row.low)}-${money(row.high)}`;
        if (row.unit && row.unit.startsWith("percent")) return `${row.low > 0 ? "+" : ""}${row.low} to ${row.high > 0 ? "+" : ""}${row.high}%`;
        return `${row.low}-${row.high}`;
      }
      if (typeof row.value === "number") {
        if (row.unit === "USD millions / quarter") return `~$${row.value}M / quarter`;
        if (row.unit === "USD millions") return `${money(row.value)}M`;
        return String(row.value);
      }
      return row.value || "—";
    };
    const guideRows = Object.values(g).filter(r => r && r.label);
    const statusClass = (s) => "guide-status--" + String(s).toLowerCase().replace(/[^a-z]/g, "");

    return `
      ${companyHero(co)}
      ${companyTabs(co, "financials")}

      <h3>${escapeHtml(pl.quarter)} financial position</h3>
      <div class="grid grid--4" style="margin-bottom:24px;">
        ${k.adjFreeCashFlow ? kpiCard({ label: `${pl.q} Adj free cash flow`, value: k.adjFreeCashFlow.value, unit: k.adjFreeCashFlow.unit, prior: priorOf(k.adjFreeCashFlow), source: k.adjFreeCashFlow.source, note: k.adjFreeCashFlow.note }) : ""}
        ${k.adjFreeCashFlowYtd ? kpiCard({ label: `1H 2026 Adj free cash flow`, value: k.adjFreeCashFlowYtd.value, unit: k.adjFreeCashFlowYtd.unit, prior: priorOf(k.adjFreeCashFlowYtd), source: k.adjFreeCashFlowYtd.source, note: k.adjFreeCashFlowYtd.note }) : ""}
        ${kpiCard({ label: "Total debt (corp + non-recourse)", value: totalDebt, unit: "USD millions", source: `${pl.quarter} release`, note: `Corporate ${fmtNumber(k.corporateDebt.value, "USD millions")} + Non-recourse ${fmtNumber(k.securitizedDebt.value, "USD millions")}` })}
        ${cash ? kpiCard({ label: "Cash on hand", value: cash.value, unit: "USD millions", source: cash.source, note: cash.note }) : ""}
        ${lev ? kpiCard({ label: "Leverage", value: lev.value, unit: "x", source: lev.source, note: lev.note, invertDelta: true }) : ""}
        ${k.liquidity ? kpiCard({ label: "Total liquidity", value: k.liquidity.value, unit: k.liquidity.unit, source: k.liquidity.source, note: k.liquidity.note }) : ""}
        ${k.buybacks ? kpiCard({ label: `${pl.q} buybacks`, value: k.buybacks.value, unit: k.buybacks.unit, source: k.buybacks.source, note: k.buybacks.note }) : ""}
        ${k.dividendsPaid ? kpiCard({ label: `${pl.q} dividends paid`, value: k.dividendsPaid.value, unit: k.dividendsPaid.unit, source: k.dividendsPaid.source, note: k.dividendsPaid.note }) : ""}
        ${k.remainingAuth ? kpiCard({ label: "Remaining buyback authorization", value: k.remainingAuth.value, unit: k.remainingAuth.unit, source: k.remainingAuth.source, note: k.remainingAuth.note }) : ""}
      </div>

      <div class="grid grid--2">
        <div class="panel">
          <h2>Revenue trend (FY)</h2>
          <div class="chart-wrap chart-wrap--tall"><canvas id="fin-revenue"></canvas></div>
          <p class="muted" style="font-size:11px;margin-top:8px;">FY2023 / FY2024 / FY2025 from each company's most recent 10-K.</p>
        </div>
        <div class="panel">
          <h2>Adjusted EBITDA trend (FY)</h2>
          <div class="chart-wrap chart-wrap--tall"><canvas id="fin-ebitda"></canvas></div>
        </div>
        <div class="panel">
          <h2>Contract sales — quarterly cadence</h2>
          <div class="chart-wrap chart-wrap--tall"><canvas id="fin-contract"></canvas></div>
          <p class="muted" style="font-size:11px;margin-top:8px;">${escapeHtml(co.financials.contractSalesNote || "Quarterly contract / Gross VOI sales from the company's releases; FY2026E is the guidance midpoint where disclosed.")}</p>
        </div>
        <div class="panel">
          <h2>Debt structure (post-${escapeHtml(pl.quarter)})</h2>
          <div class="chart-wrap"><canvas id="fin-debt"></canvas></div>
          <p class="muted" style="font-size:11px;margin-top:8px;">Corporate tranches plus non-recourse securitized debt collateralized by VOI receivables.</p>
        </div>
      </div>

      <div class="grid grid--2" style="margin-top:24px;">
        <div class="panel guidance-card">
          <h3>2026 Guidance (as of ${escapeHtml(pl.q)} release)</h3>
          ${guideRows.map(r => `<div class="guidance-card__row" ${r.source ? `data-source="${escapeHtml(r.source)}"` : ""}><span class="label">${escapeHtml(r.label)}${r.status ? ` <span class="guide-status ${statusClass(r.status)}">${escapeHtml(r.status)}</span>` : ""}</span><span class="val">${escapeHtml(fmtGuide(r))}</span></div>`).join("")}
          ${co.guidanceNote ? `<p class="muted" style="font-size:11px;margin-top:12px;">${escapeHtml(co.guidanceNote)}</p>` : ""}
        </div>
        <div class="panel">
          <h2>Receivables &amp; credit (${escapeHtml(pl.quarter)})</h2>
          <div class="grid grid--2">
            ${k.avgFico ? kpiCard({ label: "New-buyer FICO (avg)", value: k.avgFico.value, unit: k.avgFico.unit, source: k.avgFico.source, note: k.avgFico.note }) : ""}
            ${k.defaultRate ? (k.defaultRate.value !== null ? kpiCard({ label: "Default rate", value: k.defaultRate.value, unit: k.defaultRate.unit, prior: priorOf(k.defaultRate), source: k.defaultRate.source, invertDelta: true, note: k.defaultRate.note }) : `<div class="kpi" data-source="${escapeHtml(k.defaultRate.source || "")}"><div class="kpi__label">Default rate</div><div class="kpi__value is-small">${escapeHtml(k.defaultRate.display || "Not disclosed as a figure")}</div><div class="kpi__source">${escapeHtml(k.defaultRate.note || "")}</div></div>`) : ""}
            ${k.salesReserve ? kpiCard({ label: `Sales reserve (${pl.q})`, value: k.salesReserve.value, unit: k.salesReserve.unit, prior: priorOf(k.salesReserve), source: k.salesReserve.source, note: k.salesReserve.note, invertDelta: true }) : ""}
            ${k.delinquency31_60 ? kpiCard({ label: "31-60 day delinquency", value: k.delinquency31_60.value, unit: k.delinquency31_60.unit, prior: priorOf(k.delinquency31_60), source: k.delinquency31_60.source, note: k.delinquency31_60.note, invertDelta: true }) : ""}
            ${k.delinquency91_120 ? kpiCard({ label: "91-120 day delinquency", value: k.delinquency91_120.value, unit: k.delinquency91_120.unit, prior: priorOf(k.delinquency91_120), source: k.delinquency91_120.source, note: k.delinquency91_120.note, invertDelta: true }) : ""}
            ${k.loanLossProvision ? kpiCard({ label: `Loan loss provision (${pl.q})`, value: k.loanLossProvision.value, unit: k.loanLossProvision.unit, prior: priorOf(k.loanLossProvision), source: k.loanLossProvision.source, note: k.loanLossProvision.note, invertDelta: true }) : ""}
            ${k.loanLossProvisionRate ? kpiCard({ label: "Loan loss provision rate", value: k.loanLossProvisionRate.value, unit: k.loanLossProvisionRate.unit, prior: priorOf(k.loanLossProvisionRate), source: k.loanLossProvisionRate.source, note: k.loanLossProvisionRate.note, invertDelta: true }) : ""}
            ${k.allowance ? kpiCard({ label: "Loan loss allowance", value: k.allowance.value, unit: k.allowance.unit, source: k.allowance.source, note: k.allowance.note }) : ""}
            ${k.fico700plus ? kpiCard({ label: "Receivables ≥ 700 FICO", value: k.fico700plus.value, unit: k.fico700plus.unit, source: k.fico700plus.source, note: k.fico700plus.note }) : ""}
          </div>
        </div>
      </div>

      ${co.capitalActions && co.capitalActions.length ? `
        <div class="panel" style="margin-top:24px;">
          <h2>Q2/Q3 2026 capital actions</h2>
          <table class="data">
            <thead><tr><th>Action</th><th>Date</th><th class="num">Size</th><th>Terms / Notes</th><th class="num">Source</th></tr></thead>
            <tbody>
              ${co.capitalActions.map(a => `<tr><td>${escapeHtml(a.action)}</td><td class="muted" style="font-size:12px;white-space:nowrap;">${escapeHtml(a.date || "")}</td><td class="num">${a.value !== null && a.value !== undefined ? fmtNumber(a.value, a.unit || "USD millions") : "—"}</td><td class="muted">${escapeHtml(a.note || "")}</td><td class="num muted" style="font-size:10px;">${escapeHtml(a.source || "")}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      ` : ""}

      ${sourcesBlock(co.sources)}
    `;
  }

  function afterFinancials(co) {
    const accent = co.brandAccent || co.brandColor;
    const rev = co.financials.revenueTrend.filter(r => r.value !== null);
    const ebitda = co.financials.ebitdaTrend.filter(r => r.value !== null);
    MVW_CHARTS.trendLine("fin-revenue", {
      labels: rev.map(r => "FY" + r.year),
      data: rev.map(r => r.value),
      color: accent,
      currency: true, unit: "M"
    });
    MVW_CHARTS.trendLine("fin-ebitda", {
      labels: ebitda.map(r => "FY" + r.year),
      data: ebitda.map(r => r.value),
      color: accent,
      currency: true, unit: "M"
    });
    const cs = (co.financials.contractSalesTrend || []).filter(r => r.value !== null);
    if (cs.length) {
      MVW_CHARTS.singleBars("fin-contract", {
        labels: cs.map(r => r.period),
        data: cs.map(r => r.value),
        color: accent,
        currency: true, unit: "M"
      });
    }
    MVW_CHARTS.stackedDebt("fin-debt", {
      tranches: co.financials.debtStack,
      color: accent
    });
  }

  // ---------------------------------------------------------------- Tab: Growth Catalysts
  function renderGrowth(co) {
    const pl = P();
    const statusClass = (s) => "guide-status--" + String(s).toLowerCase().replace(/[^a-z]/g, "");
    return `
      ${companyHero(co)}
      ${companyTabs(co, "growth")}

      <div class="callout">
        Strategic initiatives, capital-allocation priorities, and partnerships disclosed in the
        ${escapeHtml(co.fiscal.filingType)}, the ${escapeHtml(co.recentCall.period)} earnings call, and the most recent 10-K. No analyst projections.
      </div>

      ${co.strategicInitiatives && co.strategicInitiatives.length ? `
        <div class="panel">
          <h2>Initiatives announced or in-flight in ${escapeHtml(pl.q)}/Q3 2026</h2>
          ${co.strategicInitiatives.map((s, i) => `
            <div class="catalyst">
              <div class="catalyst__num">${i + 1}</div>
              <div>
                <div class="catalyst__head">${escapeHtml(s.title)}${s.status ? ` <span class="guide-status ${statusClass(s.status)}">${escapeHtml(s.status)}</span>` : ""}</div>
                <div class="catalyst__detail">${escapeHtml(s.detail)}</div>
                <div class="catalyst__source">${escapeHtml(s.announced ? "Announced / updated: " + s.announced : "")}</div>
              </div>
            </div>
          `).join("")}
        </div>
      ` : ""}

      <div class="panel" style="margin-top:24px;">
        <h2>Disclosed growth catalysts</h2>
        ${co.growth.map((g, i) => `
          <div class="catalyst">
            <div class="catalyst__num">${i + 1}</div>
            <div>
              <div class="catalyst__head">${escapeHtml(g.headline)}</div>
              <div class="catalyst__detail">${escapeHtml(g.detail)}</div>
              <div class="catalyst__source">Source: ${escapeHtml(g.source)}</div>
            </div>
          </div>
        `).join("")}
      </div>

      ${sourcesBlock(co.sources)}
    `;
  }

  // ---------------------------------------------------------------- Tab: Risk Matrix
  function renderRisks(co) {
    const pl = P();
    const SEV_WORDS = { 1: "Minor", 2: "Low", 3: "Moderate", 4: "Major", 5: "Severe" };
    const LIK_WORDS = { 1: "Rare", 2: "Unlikely", 3: "Possible", 4: "Likely", 5: "Almost Certain" };

    const cells = {};
    co.risks.forEach((r, i) => {
      const key = `${r.likelihood}_${r.severity}`;
      if (!cells[key]) cells[key] = [];
      cells[key].push({ ...r, idx: i + 1 });
    });

    const heatScore = (likelihood, severity) => Math.min(5, Math.round((likelihood + severity) / 2));
    const dotColor = co.brandAccent || co.brandColor;

    let matrixHTML = "";
    matrixHTML += `<div></div><div></div>`;
    for (let lik = 1; lik <= 5; lik++) {
      matrixHTML += `
        <div class="risk-x-label">
          <span class="risk-axis-num">${lik}</span>
          <span class="risk-axis-word">${LIK_WORDS[lik]}</span>
        </div>
      `;
    }
    matrixHTML += `<div class="risk-y-title" style="grid-column:1; grid-row:2 / 7;">Severity →</div>`;
    for (let sev = 5; sev >= 1; sev--) {
      matrixHTML += `
        <div class="risk-y-label">
          <span class="risk-axis-num">${sev}</span>
          <span class="risk-axis-word">${SEV_WORDS[sev]}</span>
        </div>
      `;
      for (let lik = 1; lik <= 5; lik++) {
        const cellRisks = cells[`${lik}_${sev}`] || [];
        const heat = heatScore(lik, sev);
        matrixHTML += `
          <div class="risk-cell" data-heat="${heat}">
            ${cellRisks.map(r => `
              <div class="risk-dot" style="background:${dotColor}" title="${escapeHtml(r.title)} — Sev ${r.severity}/5, Lik ${r.likelihood}/5" data-risk="${r.idx - 1}">${r.idx}</div>
            `).join("")}
          </div>
        `;
      }
    }

    return `
      ${companyHero(co)}
      ${companyTabs(co, "risks")}

      <div class="callout">
        Risk titles &amp; verbatim language come from <strong>FY2025 10-K Item 1A</strong>, enriched with <strong>${escapeHtml(pl.quarter)} management commentary</strong> on each topic. Items tagged <strong>(${escapeHtml(pl.quarter)})</strong> in the title are <strong>${escapeHtml(pl.q)}-emergent risks</strong> not in the 10-K — sourced from the ${escapeHtml(pl.q)} release / call / 10-Q. Severity &amp; likelihood scores are <strong>analyst-coded overlays</strong>, not company disclosures. Hover or click any dot to jump to the verbatim risk language.
      </div>

      <div class="grid grid--2" style="align-items:start;">
        <div class="panel">
          <h2>Risk heat map</h2>
          <div class="risk-matrix-wrap">
            <div class="risk-matrix">${matrixHTML}</div>
            <div class="risk-x-title">Likelihood →</div>
          </div>
        </div>

        <div class="panel">
          <h2>All disclosed risk factors (verbatim) — with ${escapeHtml(pl.quarter)} mgmt commentary</h2>
          <div class="risk-list">
            ${co.risks.map((r, i) => `
              <div class="risk-list-item" id="risk-${i}">
                <div class="risk-list-item__num">${i + 1}</div>
                <div>
                  <div class="risk-list-item__title">${escapeHtml(r.title)}</div>
                  <div class="risk-list-item__verbatim">"${escapeHtml(r.verbatim)}"</div>
                  <div class="risk-list-item__meta">
                    <span><strong>Severity:</strong> ${r.severity}/5 — ${SEV_WORDS[r.severity]}</span>
                    <span><strong>Likelihood:</strong> ${r.likelihood}/5 — ${LIK_WORDS[r.likelihood]}</span>
                    <span><strong>Source:</strong> ${escapeHtml(r.source)}</span>
                  </div>
                  ${r.note ? `<div class="muted" style="font-size:11px;margin-top:6px;"><strong>${escapeHtml(pl.quarter)} update:</strong> ${escapeHtml(r.note)}</div>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      ${sourcesBlock(co.sources)}
    `;
  }

  function afterRisks() {
    document.querySelectorAll(".risk-dot").forEach(dot => {
      dot.addEventListener("click", () => {
        const idx = dot.getAttribute("data-risk");
        const target = document.getElementById(`risk-${idx}`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  return {
    renderOverview, afterOverview,
    renderExec,
    renderSegments, afterSegments,
    renderFootprint, afterFootprint,
    renderFinancials, afterFinancials,
    renderGrowth,
    renderRisks, afterRisks
  };
})();
