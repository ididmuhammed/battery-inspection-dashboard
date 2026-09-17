# StoreX — Anuradhapura BESS HMI

React + TypeScript + Vite. Two screens for the 10 MW / 40 MWh plant: a welcome
screen that starts the feed, and a live dashboard that shows what the pack is
doing right now.

```bash
npm install
npm run dev     # http://localhost:5173
```

That's it — no assets to download, no gateway needed. The mock feed emits a
frame every second following a slow charge/discharge duty cycle, so every part
of the UI can be seen moving.

## Layout

```
index.html
vite.config.ts
tsconfig.json                 project references → app / node / server
.env.example
src/
  main.tsx                    React root
  App.tsx                     page switching + choice of data source
  pages/
    WelcomePage.tsx           standing screen, "Activate the system"
    DashboardPage.tsx         readings, single-line view, trend
  components/
    MetricTile.tsx            one reading, flashes when the value moves
    SiteFlow.tsx              pack → substation → grid, direction-aware beams
    SiteScene.tsx             the site drawn as SVG (replace with your render)
    PowerTrace.tsx            power sparkline + state-of-charge bar
    StatusPill.tsx            plant mode, or the link problem
    StorexLogo.tsx            brand mark (replace with the official artwork)
    icons.tsx                 tile icons
  hooks/useTelemetry.ts       subscribes to a source, keeps 90 samples of power
  services/telemetrySource.ts MockTelemetrySource + WebSocketTelemetrySource
  data/seedTelemetry.json     the dummy frame the mock starts from
  types/telemetry.ts          the one shape the UI understands
  utils/format.ts             number and time formatting
  styles/storex.css           all styling, one token block at the top
server/
  modbusGateway.ts            Modbus TCP polling → WebSocket push
```

## Going live on Modbus TCP

A browser cannot open a raw TCP socket, so React never speaks Modbus. The
gateway holds the only connection to the PCS/EMS and pushes decoded JSON:

```
PCS / BMS  ──Modbus TCP:502──►  server/modbusGateway.ts  ──WebSocket──►  browser
```

1. Put your device's register addresses, word counts and scaling factors into
   `REGISTERS` in `server/modbusGateway.ts`. The defaults follow the common
   Huawei Smart String ESS layout — confirm them against the vendor's Modbus
   interface document before trusting a reading.
2. Check word order. The decoder assumes big-endian 32-bit pairs; swap the two
   words in `decode()` if values come out wildly wrong or negative.
3. `cp .env.example .env`, set `PLC_HOST`, then `npm run gateway`.
4. Set `VITE_USE_LIVE_FEED=true` in `.env` and restart `npm run dev`.

Nothing in the components changes — they only ever see the `Telemetry` type.

## Swapping in the studio render

`SiteScene.tsx` draws the site as vector art so the project runs with no binary
assets. To use the render instead, drop the image in `src/assets/`, set it as a
`background-image` on `.welcome` and `.scene` in `storex.css`, and remove the
`<SiteScene />` elements. The node labels (`.scene__node--pack`,
`--substation`, `--grid`) and the two `.beam` rules are positioned in
percentages tuned to a 16:9 frame with containers left, substation centre and
tower right — nudge them to match your render.

## Details worth keeping

- **A stale screen is never shown as live.** The WebSocket source runs a
  watchdog; if frames stop arriving the status pill switches to how long ago
  the last reading was, and reconnects with backoff.
- **Numbers are tabular and fixed-decimal**, so values don't change width and
  shift the layout every second.
- **Beam direction is data.** The beams run toward the grid when the plant
  exports and back toward the pack when it charges, and pause under 1 kW.
- **Poll interval.** One second is comfortable for a ~210-register block. If
  you add more devices, poll each on its own connection rather than widening
  the block — a slow unit shouldn't hold up the whole screen.
- Motion is disabled under `prefers-reduced-motion`, and the SoC bar is a
  `role="meter"` with live values for screen readers.
