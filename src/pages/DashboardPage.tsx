import { useEffect, useState } from 'react';
import type { LinkStatus, PlantIdentity, Telemetry } from '../types/telemetry';
import { MetricTile } from '../components/MetricTile';
import { SiteFlow } from '../components/SiteFlow';
import { PowerTrace, StateOfCharge } from '../components/PowerTrace';
import { StatusPill } from '../components/StatusPill';
import { StorexLogo } from '../components/StorexLogo';
import {
  BatteryBoltIcon,
  BoltIcon,
  ChargedTodayIcon,
  DischargedTodayIcon,
} from '../components/icons';
import { clockTime, fixed, longDate, secondsAgo, signedKw } from '../utils/format';

export interface DashboardPageProps {
  identity: PlantIdentity;
  telemetry: Telemetry | null;
  status: LinkStatus;
  detail?: string;
  powerHistory: number[];
  lastUpdate: number | null;
  onExit: () => void;
}

export function DashboardPage({
  identity,
  telemetry,
  status,
  detail,
  powerHistory,
  lastUpdate,
  onExit,
}: DashboardPageProps) {
  const [now, setNow] = useState(() => new Date().toISOString());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toISOString()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!telemetry) {
    return (
      <main className="dash dash--waiting">
        <p className="dash__waiting">Opening the link to {identity.substationName}…</p>
      </main>
    );
  }

  const charging = telemetry.activePowerKw < 0;
  const idle = Math.abs(telemetry.activePowerKw) < 1;

  return (
    <main className="dash">
      <header className="dash__bar">
        <button type="button" className="dash__brand" onClick={onExit} title="Back to the welcome screen">
          <StorexLogo variant="mark" size={26} />
        </button>

        <div className="dash__site">
          <h1 className="dash__name">{identity.siteName}</h1>
          <p className="dash__subject">Battery Energy Storage System</p>
        </div>

        <p className="dash__rating">
          {identity.ratedPowerMw} MW / {identity.ratedEnergyMwh} MWh
          <span className="dash__promise">Clean energy. Stable grid. Brighter tomorrow.</span>
        </p>

        <div className="dash__clock">
          <time dateTime={now}>{longDate(now)}</time>
          <time dateTime={now} className="dash__time">
            {clockTime(now)}
          </time>
        </div>

        <StatusPill
          status={status}
          mode={telemetry.mode}
          detail={detail}
          secondsSinceUpdate={secondsAgo(lastUpdate)}
        />
      </header>

      <section className="dash__tiles" aria-label="Live readings">
        <MetricTile
          label="Active power"
          value={signedKw(telemetry.activePowerKw)}
          unit="kW"
          note={idle ? 'Idle' : charging ? 'Charging' : 'Discharging'}
          tone="signal"
          icon={<BoltIcon />}
        />
        <MetricTile
          label="Chargeable energy"
          value={fixed(telemetry.chargeableEnergyMwh)}
          unit="MWh"
          icon={<BatteryBoltIcon />}
        />
        <MetricTile
          label="Dischargeable energy"
          value={fixed(telemetry.dischargeableEnergyMwh)}
          unit="MWh"
          icon={<BatteryBoltIcon />}
        />
        <MetricTile
          label="Energy charged today"
          value={fixed(telemetry.energyChargedTodayMwh)}
          unit="MWh"
          icon={<ChargedTodayIcon />}
        />
        <MetricTile
          label="Energy discharged today"
          value={fixed(telemetry.energyDischargedTodayMwh)}
          unit="MWh"
          icon={<DischargedTodayIcon />}
        />
      </section>

      <SiteFlow identity={identity} activePowerKw={telemetry.activePowerKw} />

      {/* <section className="dash__readouts" aria-label="Trend and state of charge">
        <PowerTrace
          history={powerHistory}
          ratedPowerKw={identity.ratedPowerMw * 1000}
          windowLabel="90 seconds"
        />
        <StateOfCharge
          socPercent={telemetry.socPercent}
          dischargeableMwh={telemetry.dischargeableEnergyMwh}
          ratedEnergyMwh={identity.ratedEnergyMwh}
        />
      </section> */}
    </main>
  );
}
