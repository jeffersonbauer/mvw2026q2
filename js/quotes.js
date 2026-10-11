/**
 * Live stock-quote module — Q2 2026 dashboard
 *
 * Renders compact "$XX.XX +X.XX (X%)" lines under each company nav pill.
 * Data: Yahoo Finance v7 SPARK endpoint (batched, smaller payload than the
 * v8/chart endpoint), proxied through allorigins.win (/get JSON wrapper,
 * then /raw) and corsproxy.io in parallel — first proxy to respond wins
 * (Promise.any). Updated 2026-10-11 after corsproxy.io began requiring a key.
 *
 * Boot sequence:
 *   1. Fire the network request as soon as the script parses (defer ensures
 *      DOM is parsed but render handlers may not be wired yet).
 *   2. On DOMContentLoaded, instantly hydrate from sessionStorage cache so
 *      previous values appear with zero latency.
 *   3. When the in-flight fetch resolves, swap in fresh values.
 *   4. Then poll every 60s while the tab is visible.
 *
 * No API key. If both proxies fail the cached values stay; if there's no
 * cache, the slot shows "—" with a hover tooltip.
 */

window.MVW_QUOTES = (() => {
  const SYMBOLS = ["VAC", "HGV", "TNL"];
  const REFRESH_MS = 60_000;
  const CACHE_PREFIX = "mvw_q2_quote_";
  const YAHOO_BATCH = (syms) =>
    `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${syms.join(",")}&interval=1d&range=2d`;
  // Each proxy: build(url) -> proxied URL; unwrap(json) -> Yahoo payload.
  // allorigins /get wraps the upstream body as a JSON string in `.contents`
  // and (unlike /raw) sends Access-Control-Allow-Origin. corsproxy.io (used
  // in the Q1 edition) began returning 403 without an API key in 2026 and
  // was dropped.
  const PROXIES = [
    { build: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, unwrap: (j) => JSON.parse(j.contents) },
    { build: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, unwrap: (j) => j }
  ];

  let timerId = null;
  let lastSuccess = null;

  // Race all proxies in parallel; Promise.any returns the first fulfilled
  // response. Cuts cold-start latency dramatically vs. sequential fallback.
  async function fetchAll() {
    const url = YAHOO_BATCH(SYMBOLS);
    const attempts = PROXIES.map(async (proxy) => {
      const r = await fetch(proxy.build(url), { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = proxy.unwrap(await r.json());
      const results = data?.spark?.result || [];
      const out = SYMBOLS.map((symbol) => {
        const entry = results.find((x) => x.symbol === symbol);
        const meta = entry?.response?.[0]?.meta;
        if (!meta) return null;
        const price = meta.regularMarketPrice;
        const prev = meta.chartPreviousClose ?? meta.previousClose;
        if (typeof price !== "number" || typeof prev !== "number") return null;
        return {
          symbol,
          price,
          prev,
          change: price - prev,
          pct: ((price - prev) / prev) * 100,
          currency: meta.currency || "USD",
          time: meta.regularMarketTime
        };
      });
      // Require at least one symbol to have parsed cleanly, otherwise
      // treat this proxy's response as bad and let the other one win.
      if (!out.some(Boolean)) throw new Error("no usable quotes");
      return out;
    });
    return Promise.any(attempts);
  }

  // Kick off the very first request immediately at module-eval time
  // (script is `defer`, so DOM is parsed but listeners may not be ready).
  // This trims ~200-400ms off the time-to-first-render.
  const initialFetchPromise = fetchAll().catch(() => null);

  function fmtPrice(v) { return "$" + v.toFixed(2); }
  function fmtChange(c, pct) {
    const sign = c > 0 ? "+" : (c < 0 ? "−" : "");
    return `${sign}${Math.abs(c).toFixed(2)} (${sign}${Math.abs(pct).toFixed(2)}%)`;
  }
  function changeClass(c) {
    if (c > 0) return "is-positive";
    if (c < 0) return "is-negative";
    return "is-neutral";
  }

  function saveCache(q) {
    try { sessionStorage.setItem(CACHE_PREFIX + q.symbol, JSON.stringify(q)); } catch (e) {}
  }
  function loadCache(symbol) {
    try { return JSON.parse(sessionStorage.getItem(CACHE_PREFIX + symbol) || "null"); }
    catch (e) { return null; }
  }

  function renderQuote(symbol, q) {
    const slot = document.querySelector(`.ticker-quote[data-symbol="${symbol}"]`);
    if (!slot) return;
    const priceEl = slot.querySelector(".ticker-price");
    const changeEl = slot.querySelector(".ticker-change");
    if (!q) {
      // Only swap to placeholder if we never had a value
      if (priceEl.dataset.placeholder === "1") {
        priceEl.textContent = "—";
        changeEl.textContent = "";
      }
      slot.title = lastSuccess
        ? `Quote feed unavailable; last good update ${new Date(lastSuccess).toLocaleTimeString()}`
        : "Quote feed unavailable";
      return;
    }
    const newPrice = fmtPrice(q.price);
    const newChange = fmtChange(q.change, q.pct);
    if (priceEl.textContent !== newPrice) priceEl.textContent = newPrice;
    priceEl.dataset.placeholder = "0";
    changeEl.className = `ticker-change ${changeClass(q.change)}`;
    if (changeEl.textContent !== newChange) changeEl.textContent = newChange;
    slot.title = `${symbol} · ${newPrice} · ${newChange}${q.time ? ` · last ${new Date(q.time * 1000).toLocaleTimeString()}` : ""}`;
  }

  function hydrateFromCache() {
    SYMBOLS.forEach((sym) => {
      const cached = loadCache(sym);
      if (cached) renderQuote(sym, cached);
    });
  }

  function applyQuotes(quotes) {
    if (!quotes) return false;
    let anySuccess = false;
    quotes.forEach((q, i) => {
      const sym = SYMBOLS[i];
      if (q) {
        renderQuote(sym, q);
        saveCache(q);
        anySuccess = true;
      } else {
        renderQuote(sym, null);
      }
    });
    if (anySuccess) lastSuccess = Date.now();
    return anySuccess;
  }

  async function refresh() {
    try {
      const quotes = await fetchAll();
      applyQuotes(quotes);
    } catch (e) {
      // Silent fail — cached values stay; placeholders remain "—"
      SYMBOLS.forEach((sym) => {
        const slot = document.querySelector(`.ticker-quote[data-symbol="${sym}"]`);
        const priceEl = slot?.querySelector(".ticker-price");
        if (priceEl?.dataset.placeholder === "1") renderQuote(sym, null);
      });
    }
  }

  async function boot() {
    // 1. Instant render of cached values (zero network latency)
    hydrateFromCache();
    // 2. Apply the in-flight initial fetch when it resolves. The public
    //    proxies are intermittent, so if the first attempt fails retry on a
    //    short backoff (5s / 15s / 30s) instead of waiting for the 60s tick.
    const quotes = await initialFetchPromise;
    if (!applyQuotes(quotes)) {
      for (const delay of [5_000, 15_000, 30_000]) {
        await new Promise((res) => setTimeout(res, delay));
        if (document.hidden) continue;
        let ok = false;
        try { ok = applyQuotes(await fetchAll()); } catch (e) { ok = false; }
        if (ok) break;
      }
    }
    // 3. Recurring refresh (visibility-aware)
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => { if (!document.hidden) refresh(); }, REFRESH_MS);
  }

  document.addEventListener("DOMContentLoaded", boot);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });

  return { refresh, fetchAll };
})();
