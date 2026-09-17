import { useMemo } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
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
  // Memoised so the feed isn't torn down and restarted on every render.
  const source = useMemo<TelemetrySource>(
    () => (USE_LIVE_FEED ? new WebSocketTelemetrySource(GATEWAY_URL) : new MockTelemetrySource(1000)),
    [],
  );

  // The feed is kept alive at this level (above the routes) so switching
  // between the welcome and dashboard screens never tears the connection down.
  const { telemetry, status, detail, powerHistory, lastUpdate } = useTelemetry(source);

  return (
    <Routes>
      <Route path="/" element={<WelcomeRoute identity={IDENTITY} />} />
      <Route
        path="/dashboard"
        element={
          <DashboardRoute
            identity={IDENTITY}
            telemetry={telemetry}
            status={status}
            detail={detail}
            powerHistory={powerHistory}
            lastUpdate={lastUpdate}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function WelcomeRoute({ identity }: { identity: PlantIdentity }) {
  const navigate = useNavigate();
  return <WelcomePage identity={identity} onActivate={() => navigate('/dashboard')} />;
}

function DashboardRoute(props: Omit<Parameters<typeof DashboardPage>[0], 'onExit'>) {
  const navigate = useNavigate();
  return <DashboardPage {...props} onExit={() => navigate('/')} />;
}
