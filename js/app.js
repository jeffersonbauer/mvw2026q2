/**
 * App — hash router, theme switching, view dispatcher.
 *
 * Routes:
 *   #/                              → comparative overview
 *   #/company/<slug>/<tab>          → company detail (slug = mvw|hgv|tnl)
 *
 * Tabs: exec | segments | footprint | financials | growth | risks
 */

(function () {
  const root = () => document.getElementById("app-root");

  function parseHash() {
    const h = window.location.hash || "#/";
    if (h === "#/" || h === "" || h === "#") return { route: "overview" };
    const parts = h.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (parts[0] === "company" && parts[1]) {
      return { route: "company", slug: parts[1], tab: parts[2] || "exec" };
    }
    return { route: "overview" };
  }

  function setTheme(slug) {
    const body = document.body;
    body.classList.remove("theme-mvw", "theme-hgv", "theme-tnl");
    if (slug) body.classList.add("theme-" + slug);
  }

  function setActiveNav(slug) {
    // NB: classList.toggle(name, force) treats an explicit `undefined` second
    // argument as "no force given" → the class flips instead of being set.
    // We must compute a strict boolean before calling toggle.
    document.querySelectorAll("#primary-nav .nav-pill").forEach(btn => {
      const r = btn.getAttribute("data-route") || "";
      const isActive = slug === undefined
        ? r === "#/"
        : r.includes("/company/" + slug + "/");
      btn.classList.toggle("is-active", isActive);
    });
  }

  function render() {
    if (!window.MVW_DATA || !window.MVW_VIEWS) {
      // libraries still loading
      requestAnimationFrame(render);
      return;
    }
    MVW_CHARTS.destroyAll();

    const r = parseHash();
    const D = window.MVW_DATA.companies;

    if (r.route === "company") {
      const co = D[r.slug];
      if (!co) { window.location.hash = "#/"; return; }
      setTheme(r.slug);
      setActiveNav(r.slug);
      let html = "";
      let after = null;
      switch (r.tab) {
        case "exec":       html = MVW_VIEWS.renderExec(co); break;
        case "segments":   html = MVW_VIEWS.renderSegments(co); after = () => MVW_VIEWS.afterSegments(co); break;
        case "footprint":  html = MVW_VIEWS.renderFootprint(co); after = () => MVW_VIEWS.afterFootprint(co); break;
        case "financials": html = MVW_VIEWS.renderFinancials(co); after = () => MVW_VIEWS.afterFinancials(co); break;
        case "growth":     html = MVW_VIEWS.renderGrowth(co); break;
        case "risks":      html = MVW_VIEWS.renderRisks(co); after = MVW_VIEWS.afterRisks; break;
        default:           window.location.hash = `#/company/${r.slug}/exec`; return;
      }
      root().innerHTML = html;
      if (after) requestAnimationFrame(after);
    } else {
      setTheme(null);
      setActiveNav(undefined);
      root().innerHTML = MVW_VIEWS.renderOverview();
      requestAnimationFrame(MVW_VIEWS.afterOverview);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function bindRouting() {
    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-route]");
      if (!target) return;
      e.preventDefault();
      const route = target.getAttribute("data-route");
      if (window.location.hash === route) {
        // force re-render
        render();
      } else {
        window.location.hash = route;
      }
    });
    window.addEventListener("hashchange", render);
  }

  // boot
  document.addEventListener("DOMContentLoaded", () => {
    bindRouting();
    render();
  });
})();
