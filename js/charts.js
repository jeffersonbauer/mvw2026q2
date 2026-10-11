/**
 * Chart.js helpers — applies a consistent dark theme to all charts.
 * Charts are destroyed and recreated on view changes; see app.js.
 */

window.MVW_CHARTS = (() => {
  const palette = {
    mvw: "#0862A7",          // MVW — Pantone PMS 641 C
    hgv: "#002C51",          // Hilton brand navy — reads sharply on white
    tnl: "#1D6B44",          // Travel + Leisure deep forest
    gold: "#B8860B",         // darker gold to contrast on white
    text: "#475569",         // slate text for light theme axes/labels
    grid: "rgba(15,23,42,0.06)",
    axis: "rgba(15,23,42,0.10)",
    tooltipBg: "#FFFFFF",
    tooltipText: "#0F172A",
    tooltipBody: "#475569"
  };

  const registry = new Map(); // canvasId -> Chart instance

  function applyDefaults() {
    if (!window.Chart) return;
    Chart.defaults.color = palette.text;
    Chart.defaults.font.family = "'Lato', system-ui, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.borderColor = palette.grid;
    Chart.defaults.scale.grid.color = palette.grid;
    Chart.defaults.scale.ticks.color = palette.text;
    // Light-theme tooltips
    Chart.defaults.plugins.tooltip.backgroundColor = palette.tooltipBg;
    Chart.defaults.plugins.tooltip.titleColor = palette.tooltipText;
    Chart.defaults.plugins.tooltip.bodyColor = palette.tooltipBody;
    Chart.defaults.plugins.tooltip.borderColor = palette.axis;
    Chart.defaults.plugins.tooltip.borderWidth = 1;
  }

  function destroy(canvasId) {
    const existing = registry.get(canvasId);
    if (existing) { existing.destroy(); registry.delete(canvasId); }
  }

  function destroyAll() {
    registry.forEach((chart) => chart.destroy());
    registry.clear();
  }

  function ctx(canvasId) {
    const el = document.getElementById(canvasId);
    if (!el) return null;
    destroy(canvasId);
    return el.getContext("2d");
  }

  // ---------------------------------------------------------------- Comparative bar
  function comparativeBars(canvasId, { labels, mvw, hgv, tnl, unit, currency }) {
    applyDefaults();
    const c = ctx(canvasId); if (!c) return;
    const fmt = currency ? (v) => "$" + v.toLocaleString() : (v) => v.toLocaleString();
    const chart = new Chart(c, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "MVW", data: mvw, backgroundColor: palette.mvw, borderRadius: 3 },
          { label: "HGV", data: hgv, backgroundColor: palette.hgv, borderRadius: 3 },
          { label: "TNL", data: tnl, backgroundColor: palette.tnl, borderRadius: 3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: "rect" } },
          tooltip: {
            backgroundColor: palette.tooltipBg,
            titleColor: palette.tooltipText,
            bodyColor: palette.tooltipBody,
            borderColor: palette.axis, borderWidth: 1,
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)} ${unit || ""}` }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { ticks: { callback: (v) => fmt(v) } }
        }
      }
    });
    registry.set(canvasId, chart);
    return chart;
  }

  // ---------------------------------------------------------------- Single-series line / bar trend
  function trendLine(canvasId, { labels, data, color, unit, currency, fill = true }) {
    applyDefaults();
    const c = ctx(canvasId); if (!c) return;
    const fmt = currency ? (v) => "$" + v.toLocaleString() : (v) => v.toLocaleString();
    const chart = new Chart(c, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "",
          data,
          borderColor: color,
          backgroundColor: fill ? color + "30" : "transparent",
          fill,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: color,
          pointBorderColor: "#fff",
          pointBorderWidth: 1.5,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: palette.tooltipBg,
            titleColor: palette.tooltipText,
            bodyColor: palette.tooltipBody,
            borderColor: palette.axis, borderWidth: 1,
            callbacks: { label: (ctx) => ` ${fmt(ctx.parsed.y)} ${unit || ""}` }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { ticks: { callback: (v) => fmt(v) } }
        }
      }
    });
    registry.set(canvasId, chart);
    return chart;
  }

  // ---------------------------------------------------------------- Stacked debt bar
  function stackedDebt(canvasId, { tranches, color }) {
    applyDefaults();
    const c = ctx(canvasId); if (!c) return;
    const datasets = tranches.map((t, i) => ({
      label: t.label,
      data: [t.value],
      backgroundColor: shade(color, i),
      borderRadius: 2,
      stack: "debt"
    }));
    const chart = new Chart(c, {
      type: "bar",
      data: { labels: ["Debt structure"], datasets },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { boxWidth: 10, boxHeight: 10, font: { size: 11 } } },
          tooltip: {
            backgroundColor: palette.tooltipBg,
            titleColor: palette.tooltipText,
            bodyColor: palette.tooltipBody,
            borderColor: palette.axis, borderWidth: 1,
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.x.toLocaleString()}M` }
          }
        },
        scales: {
          x: { stacked: true, ticks: { callback: (v) => "$" + v.toLocaleString() + "M" } },
          y: { stacked: true, grid: { display: false } }
        }
      }
    });
    registry.set(canvasId, chart);
    return chart;
  }

  // ---------------------------------------------------------------- Doughnut (segment share)
  function segmentDoughnut(canvasId, { segments }) {
    applyDefaults();
    const c = ctx(canvasId); if (!c) return;
    const chart = new Chart(c, {
      type: "doughnut",
      data: {
        labels: segments.map(s => s.name),
        datasets: [{
          data: segments.map(s => s.revenue),
          backgroundColor: segments.map(s => s.color),
          borderColor: "#FFFFFF",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 10, boxHeight: 10, font: { size: 11 }, padding: 12 } },
          tooltip: {
            backgroundColor: palette.tooltipBg,
            titleColor: palette.tooltipText,
            bodyColor: palette.tooltipBody,
            borderColor: palette.axis, borderWidth: 1,
            callbacks: { label: (ctx) => ` ${ctx.label}: $${ctx.parsed.toLocaleString()}M` }
          }
        }
      }
    });
    registry.set(canvasId, chart);
    return chart;
  }

  // ---------------------------------------------------------------- Horizontal segment bars (revenue + EBITDA)
  function segmentBars(canvasId, { segments }) {
    applyDefaults();
    const c = ctx(canvasId); if (!c) return;
    const chart = new Chart(c, {
      type: "bar",
      data: {
        labels: segments.map(s => s.name),
        datasets: [
          { label: "Revenue", data: segments.map(s => s.revenue), backgroundColor: palette.gold, borderRadius: 3 },
          { label: "Adj EBITDA", data: segments.map(s => s.adjEbitda), backgroundColor: segments[0].color, borderRadius: 3 }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: "rect" } },
          tooltip: {
            backgroundColor: palette.tooltipBg,
            titleColor: palette.tooltipText,
            bodyColor: palette.tooltipBody,
            borderColor: palette.axis, borderWidth: 1,
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.x.toLocaleString()}M` }
          }
        },
        scales: {
          x: { ticks: { callback: (v) => "$" + v.toLocaleString() + "M" } },
          y: { grid: { display: false } }
        }
      }
    });
    registry.set(canvasId, chart);
    return chart;
  }

  // ---------------------------------------------------------------- Capital allocation bar
  function capitalAllocation(canvasId, { dividends, buybacks, color }) {
    applyDefaults();
    const c = ctx(canvasId); if (!c) return;
    const chart = new Chart(c, {
      type: "bar",
      data: {
        labels: ["Capital return"],
        datasets: [
          { label: "Dividends", data: [dividends], backgroundColor: palette.gold, borderRadius: 2 },
          { label: "Buybacks", data: [buybacks], backgroundColor: color, borderRadius: 2 }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { boxWidth: 10, boxHeight: 10, font: { size: 11 } } },
          tooltip: {
            backgroundColor: palette.tooltipBg,
            titleColor: palette.tooltipText,
            bodyColor: palette.tooltipBody,
            borderColor: palette.axis, borderWidth: 1,
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.x.toLocaleString()}M` }
          }
        },
        scales: {
          x: { stacked: false, ticks: { callback: (v) => "$" + v.toLocaleString() + "M" } },
          y: { stacked: false, grid: { display: false } }
        }
      }
    });
    registry.set(canvasId, chart);
    return chart;
  }

  // ---------------------------------------------------------------- Single-series vertical bars (quarterly cadence)
  function singleBars(canvasId, { labels, data, color, unit, currency }) {
    applyDefaults();
    const c = ctx(canvasId); if (!c) return;
    const fmt = currency ? (v) => "$" + v.toLocaleString() : (v) => v.toLocaleString();
    const chart = new Chart(c, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "",
          data,
          backgroundColor: labels.map(l => /E|guide/i.test(l) ? color + "55" : color),
          borderColor: color,
          borderWidth: labels.map(l => /E|guide/i.test(l) ? 1.5 : 0),
          borderRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: palette.tooltipBg,
            titleColor: palette.tooltipText,
            bodyColor: palette.tooltipBody,
            borderColor: palette.axis, borderWidth: 1,
            callbacks: { label: (ctx) => ` ${fmt(ctx.parsed.y)} ${unit || ""}` }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { ticks: { callback: (v) => fmt(v) } }
        }
      }
    });
    registry.set(canvasId, chart);
    return chart;
  }

  // tint a hex color by an index for the stacked debt visual
  function shade(hex, idx) {
    const opacities = [1, 0.85, 0.72, 0.6, 0.48, 0.36, 0.26, 0.18];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = opacities[idx % opacities.length];
    return `rgba(${r},${g},${b},${a})`;
  }

  return {
    palette, applyDefaults, destroy, destroyAll,
    comparativeBars, trendLine, singleBars, stackedDebt, segmentDoughnut, segmentBars, capitalAllocation
  };
})();
