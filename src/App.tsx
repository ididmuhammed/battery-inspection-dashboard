import { useMemo, useState } from 'react';
import type { PlantIdentity } from './types/telemetry';
import {
  MockTelemetrySource,
  WebSocketTelemetrySource,
  type TelemetrySource,
} from './services/telemetrySource';
import { useTelemetry } from './hooks/useTelemetry';
import { WelcomePage } from './pages/WelcomePage';
import { DashboardPage } from './pages/DashboardPage';
import './styles/storex.css';

const IDENTITY: PlantIdentity = {
  siteName: 'Anuradhapura',
  ratedPowerMw: 10,
  ratedEnergyMwh: 40,
  substationName: 'Anuradhapura Substation',
  gridName: 'National Grid',
};

/**
 * Set VITE_USE_LIVE_FEED=true in .env once the Modbus gateway is running.
 * Nothing below the source changes — the components only see the Telemetry type.
 */
const USE_LIVE_FEED = import.meta.env.VITE_USE_LIVE_FEED === 'true';
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_WS ?? 'ws://localhost:8080/telemetry';

export default function App() {
  const [activated, setActivated] = useState(false);

  // Memoised so the feed isn't torn down and restarted on every render.
  const source = useMemo<TelemetrySource>(
    () => (USE_LIVE_FEED ? new WebSocketTelemetrySource(GATEWAY_URL) : new MockTelemetrySource(1000)),
    [],
  );

  const { telemetry, status, detail, powerHistory, lastUpdate } = useTelemetry(source);

  if (!activated) {
    return <WelcomePage identity={IDENTITY} onActivate={() => setActivated(true)} />;
  }

  return (
    <DashboardPage
      identity={IDENTITY}
      telemetry={telemetry}
      status={status}
      detail={detail}
      powerHistory={powerHistory}
      lastUpdate={lastUpdate}
      onExit={() => setActivated(false)}
    />
  );
}
