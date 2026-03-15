# Crucix — Claude Code Project Instructions

## What This Is

Crucix is a local intelligence engine that aggregates 25 OSINT data sources in parallel and produces structured JSON. Claude's job is to synthesize that raw data into two outputs: a written intelligence briefing and a visual Jarvis-style dashboard.

## Project Layout

```
Crucix/
├── apis/
│   ├── briefing.mjs          # Master orchestrator — runs all 25 sources
│   ├── BRIEFING_PROMPT.md     # Intelligence synthesis protocol (READ THIS)
│   ├── BRIEFING_TEMPLATE.md   # Output template for written briefings
│   └── sources/               # Individual source modules
├── dashboard/
│   ├── public/jarvis.html     # Self-contained Jarvis HUD dashboard
│   └── inject.mjs             # Data synthesis + injection script
├── runs/
│   └── latest.json            # Most recent sweep output
└── CLAUDE.md                  # You are here
```

## Trigger Phrases

When the user says any of the following (or similar):
- "brief me"
- "what's going on"
- "what's the latest"
- "time for my brief"
- "what's happening in the world"
- "run a sweep"
- "update the dashboard"

Execute the **Full Briefing Flow** below.

## Full Briefing Flow

### Step 1: Run the Crucix Sweep

```bash
node apis/briefing.mjs > runs/latest.json 2>&1
```

This runs all 25 OSINT sources in parallel (~30-60 seconds). Output goes to `runs/latest.json`. If a timestamped backup is desired:

```bash
cp runs/latest.json runs/briefing_$(date -u +%Y-%m-%dT%H-%M-%SZ).json
```

### Step 2: Gather Live Market Data

Use the Alpaca MCP tools to pull real-time context:

- **Broad indexes**: Get latest quotes/snapshots for SPY, QQQ, DIA, IWM
- **Rates proxies**: TLT, HYG, LQD
- **Commodities**: GLD, SLV, USO, UNG
- **Crypto**: BTC/USD, ETH/USD
- **VIX**: Get CBOE VIX latest

This supplements the FRED/EIA/BLS data in `latest.json` with live market prices.

### Step 3: Search for Breaking Developments

Use web search to check for breaking news in the last 6 hours:
- Geopolitical escalation or de-escalation
- Central bank actions or statements
- Major economic data releases
- Conflict developments
- Health emergencies
- Sanctions or policy shifts

### Step 4: Read the Briefing Protocol

Read `apis/BRIEFING_PROMPT.md` for the full intelligence synthesis protocol. Read `apis/BRIEFING_TEMPLATE.md` for the output structure.

Key principles:
- **Leverage first** — always lead with what the user can act on
- **Cross-correlate** — connect signals across conflict, economic, health, and market domains
- **Strong view** — form an opinion backed by evidence, not hedged filler
- **8 sections**: Leverageable Ideas → Executive Thesis → Situation Awareness → Pattern Recognition → Historical Parallels → Market Implications → Decision Board → Source Integrity

### Step 5: Write the Intelligence Briefing

Synthesize all inputs (Crucix sweep + Alpaca live data + web search) into a briefing following `BRIEFING_TEMPLATE.md`. Write it as markdown.

Save the briefing to:
```
runs/briefing_YYYY-MM-DDTHH-MM-SSZ.md
```

### Step 6: Generate the Jarvis Dashboard

After the briefing is written, update the visual dashboard:

```bash
node dashboard/inject.mjs
```

This script:
1. Reads `runs/latest.json`
2. Fetches RSS news from BBC, NYT, Al Jazeera and geo-tags them
3. Generates signal-based Leverageable Ideas from cross-source correlation
4. Synthesizes the raw data into a compact format (~18KB)
5. Injects it into `dashboard/public/jarvis.html` replacing the data placeholder
6. Filters non-English Telegram posts (Cyrillic detection)
7. **Auto-opens the dashboard in the user's default browser**

The dashboard is a self-contained HTML file — no server needed. It opens automatically after injection.

### Step 7: Confirm to User

Tell the user:
1. Briefing is ready (share key highlights from Leverageable Ideas and Executive Thesis)
2. Dashboard has been updated and auto-opened in their browser (if they already had it open, they should refresh)
3. Note any source failures or degraded data quality

## Dashboard Architecture

The Jarvis HUD (`dashboard/public/jarvis.html`) is a single self-contained file:
- **CDN dependencies**: GSAP (animations), D3.js + topojson (world map)
- **Visual style**: Glassmorphism, cyan-on-dark, IBM Plex Mono + Space Grotesk
- **Boot sequence**: Cinematic 3-4 second reveal with spinning logo ring
- **Layout**: 3-column grid
  - Left rail: Threat Mesh layers, Nuclear Watch, Risk Gauges
  - Center: D3 world map with 7 marker types + region filters + lower macro grid
  - Right rail: English-only OSINT stream + WHO alerts + Signal Core metrics

### Map Marker Types
- Green circles: Air traffic hotspots (OpenSky)
- Red circles: Thermal/fire detections (FIRMS)
- Cyan dots: SDR receivers in conflict zones (KiwiSDR)
- Yellow circles: Nuclear monitoring sites (Safecast)
- Purple diamonds: Maritime chokepoints
- Orange circles: OSINT events (Telegram urgent)
- Green circles (small): WHO health alerts
- Light blue broadcast icons: Geolocated world news (RSS) — click for article popup

### Region Filters
World, Americas, Europe, Middle East, Asia Pacific, Africa — with smooth D3 zoom transitions.

## Data Synthesis (inject.mjs)

The inject script maps raw `latest.json` fields to what the HTML expects:

| HTML property | Raw source | Key fields |
|---|---|---|
| `D.air` | OpenSky.hotspots | total, noCallsign, highAlt, region |
| `D.thermal` | FIRMS.hotspots | det, night, hc, fires[{lat,lon,frp}] |
| `D.chokepoints` | Maritime.chokepoints | label, note, lat, lon |
| `D.nuke` | Safecast.sites | site, anom, cpm, n |
| `D.sdr` | KiwiSDR | total, online, zones[{region,count,receivers}] |
| `D.tg` | Telegram | posts, urgent[], topPosts[] (English only) |
| `D.who` | WHO.diseaseOutbreakNews | title, date, summary |
| `D.fred` | FRED.indicators | id, value, momChange, etc. |
| `D.energy` | EIA | wti, brent, natgas, crudeStocks, wtiRecent[] |
| `D.bls` | BLS.indicators | id, value, momChange, momChangePct |
| `D.treasury` | Treasury.debt[0] | totalDebt |
| `D.gscpi` | GSCPI.latest | value, interpretation |
| `D.defense` | USAspending.recentDefenseContracts | recipient, amount, desc |
| `D.health` | All sources | name, error status |

## If Only Dashboard Update is Requested

If the user just says "update the dashboard" or "refresh the dashboard" (without wanting a full briefing):

1. Run the sweep: `node apis/briefing.mjs > runs/latest.json 2>&1`
2. Inject data: `node dashboard/inject.mjs`
3. Confirm dashboard is updated

## If Only Briefing is Requested

If the user just wants the written briefing without the dashboard:

1. Run the sweep
2. Gather Alpaca + web context
3. Read and follow BRIEFING_PROMPT.md
4. Write the briefing following BRIEFING_TEMPLATE.md
5. Share the briefing

## Source Notes

- **25 sources**: GDELT, OpenSky, FIRMS, Maritime, Safecast, ACLED, ReliefWeb, WHO, OFAC, OpenSanctions, ADS-B, FRED, Treasury, BLS, EIA, GSCPI, USAspending, Comtrade, NOAA, EPA, Patents, Bluesky, Reddit, Telegram, KiwiSDR
- Minimal dependencies (express required, discord.js optional, security hardening libs), pure ESM, Node 22+
- Some sources may return errors (ACLED rate limits, GDELT empty results) — note this in Source Integrity
- Telegram posts filtered for English (Cyrillic detection) — Russian-language posts are skipped in both briefing and dashboard
