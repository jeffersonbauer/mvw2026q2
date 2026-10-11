# DESIGN.md — Design System

The single source of truth for tokens, typography, components, and UX behavior. **Check this file before changing any color, font, or component pattern.**

The aesthetic is anchored to the **MVW Investor Relations website**: pure-white backgrounds, a deep-navy data anchor (`#1C1E35`), thin Montserrat display type, square edges (no rounded corners on tiles), and gold accent for "leader" highlighting. The Q2 2026 dashboard inherits every token and component from the Q1 2026 edition (which inherited from the FY2025 `jeffersonbauer/mvw` predecessor) and adds a small status-pill component.

---

## Color tokens

### Surfaces (light theme — MVW IR aesthetic)
- `--bg-base` `#FFFFFF` — page background
- `--bg-panel` `#FFFFFF` — panels, cards
- `--bg-elevated` `#F5F5F7` — scorecard headers, nested blocks
- `--bg-input` `#FAFAFC` — map background

### Text
- `--text-primary` `#262626` — body
- `--text-secondary` `#63656A` — subheads, secondary copy
- `--text-tertiary` `#8E8E94` — muted

### Anchor color (deep navy)
- `--ink-deep` `#1C1E35` — table headers, footer band, dark-row backgrounds, quarter banner
- `--ink-deep-soft` `#2B2D45` — hover states on the deep navy

### Borders
- `--border-subtle` `#E5E5E7` — light separators
- `--border-strong` `#CBCBCD` — stronger structural borders

### Accent
- `--accent-gold` `#B8860B` — "leader" highlighting in scorecards, callout left-borders, period tag pill, guidance-card top border
- `--accent-gold-dim` `#8B6508` — dimmer gold variant

### Brand colors (per company — driven by `body.theme-{slug}`)
- **MVW** `--mvw-primary` `#0862A7` (Pantone PMS 641 C)
- **HGV** `--hgv-primary` `#002C51` (Hilton brand navy)
- **TNL** `--tnl-primary` `#1D6B44` (Travel + Leisure deep forest)

Each brand also has a `--{slug}-soft` (10% alpha tint) used for subtle backgrounds. The gold `#D4AF37` is used as the second-segment color in segment charts.

### Semantic
- `--positive` `#059669` — YoY positive deltas, RAISED / LAUNCHED / CLOSED status
- `--negative` `#DC2626` — YoY negative deltas, LOWERED status
- `--neutral` `#64748B` — flat / unknown deltas
- `--warn` `#D97706` — warning / amber

---

## Typography

- **Display** (`h1`, `.display`, `.company-hero__name`, `.quarter-banner__headline`) — `Montserrat`, weight 200 (thin), tight letter-spacing. Used for big numbers and page titles.
- **Body** — `Lato`, 14px / 1.65 line-height.
- **Numerics** (`.num`, `.mono`) — `JetBrains Mono`, tabular numerals.
- **Subheads** (`h2`) — `Lato` 16px / 700.
- **Eyebrow labels** (`h3`, `.kpi__label`) — `Lato` 11-13px / 700, uppercase, 0.4px tracking.
- **Chart.js default font** is now `Lato` (was `Inter`, which was never loaded) — a correction in the Q2 edition, not a redesign.

All fonts loaded from Google Fonts in `css/main.css`.

---

## Component primitives

- **Square edges.** `--radius-sm` is `0`, `--radius-md` is `2px`, `--radius-lg` is `4px`.
- **Panels** (`.panel`) — white background, `--border-subtle` 1px border. `.panel--accent` adds a 3px brand-color top border.
- **KPI cards** (`.kpi`) — label (uppercase), value (Montserrat 30px thin), optional delta pill, optional source footer. `.kpi__value.is-small` is used for "Not disclosed" states.
- **Scorecard** (`.scorecard`) — CSS Grid `240px repeat(3, 1fr)`. Section dividers (`.sc-section`) span all columns. Leader cells (`.sc-cell--leader`) get a gold tint and 3px gold left-border. `.sc-cell__caption` carries methodology footnotes under a row label.
- **Tabs** (`.tab`) — uppercase Lato 700, 12px. Active state: 3px brand-color bottom border.
- **Callouts** (`.callout`) — elevated background, gold 3px left-border.
- **Tag** (`.tag`) — uppercase Lato 700, 11px, brand-colored.

## Quarterly components (inherited from Q1 2026)

- **Quarter banner** (`.quarter-banner`) — full-width navy hero on the overview. Headline copy with gold `.quarter-banner__highlight` phrases + release-date stats. Now rendered from `MVW_DATA.overview.banner`.
- **Momentum strip** (`.momentum-strip`) — three-up grid; one consistent metric (Q2 Adj EBITDA) per company with inline YoY. Rendered from `overview.momentum`.
- **Transcript quote** (`.transcript-quote`) — brand-color left-border, italic body, speaker eyebrow (now `Speaker — topic`). Rendered for all three companies from `transcriptQuotes[]`.
- **Guidance card** (`.guidance-card`) — gold 3px top-border; `label · value` rows with dashed underline. Rows now render generically from `guidance.*` with a status pill.
- **Period tag** (`.period-tag`) — "Q2 '26" pill on scorecard column headers (derived from `periodLabels`).
- **Vector tags** (`.vector-tag`) — gray pills on the executive-read panel.
- **Live stock quote** (`.nav-pill-stack` + `.ticker-quote`) — unchanged.

## Q2 2026 additions

- **Status pill** (`.guide-status`, added 2026-10-11) — 9px uppercase Lato 700 pill with a 1px border, used inline after a guidance-row label or an initiative title. Modifier classes derived from the status text: `--raised`, `--launched`, `--closed`, `--completed` (green); `--lowered`, `--withdrawn` (red); `--reaffirmed`, `--maintained`, `--narrowed`, `--new`, `--inflight`, `--updated` (neutral gray). Keeps the IR-clean look: no icons, color carries the meaning.
- **Quarterly contract-sales chart** — a single-series vertical bar (`MVW_CHARTS.singleBars`) on Financial Deep Dive. Actuals are solid brand color; guidance / estimate bars (label matches `E` or `guide`) are 33% alpha with a 1.5px outline so projections never read as actuals.
- **Favicon** — inline SVG data URI (navy square with three brand-colored bars) to avoid the 404 on static hosts. Not a branding element.

## Layout grid

- `--shell-max` `1440px` — content max-width.
- Spacing scale: `--space-1`..`--space-8` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px.
- Grid utilities: `.grid--2`, `.grid--3`, `.grid--4`, `.grid--6` collapse responsively at 1100px and 700px.

## UX behavior

- **Hash-based routing** — bookmarkable; survives refresh.
- **Theme switching** — `body.theme-mvw|hgv|tnl` rebinds `--brand-primary`.
- **Hover tooltips** — `[data-source]` elements show the source citation on hover. Scorecard cells, KPI cards, and guidance rows carry it; "—" cells carry the not-disclosed note.
- **Risk-dot click-to-scroll** — clicking a numbered heat-map dot scrolls to the verbatim risk block.
- **Map markers** — Leaflet `circleMarker` sized by resort count or VOI-sales share, colored by brand.
- **Charts always destroy on route change** — `MVW_CHARTS.destroyAll()` before each render.

## Iconography

- **No icon library.** Swatches, dots, pills, and `→` / `←` / `▲` / `▼` text characters only.
- **Hero "mark"** for each company — colored square with the 3-letter ticker abbreviation in white Montserrat 700.

## Changelog
- 2026-10-11: Q2 2026 design-system snapshot. Inherits all Q1 tokens/components; adds `.guide-status` pill, quarterly contract-sales bar chart styling, inline SVG favicon; Chart.js default font corrected to Lato.
