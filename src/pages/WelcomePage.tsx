import { useState } from 'react';
import type { PlantIdentity } from '../types/telemetry';
import { ArrowRightIcon, LeafIcon } from '../components/icons';
import { StorexLogo } from '../components/StorexLogo';

export interface WelcomePageProps {
  identity: PlantIdentity;
  /** Hands control to the dashboard once the feed has been opened. */
  onActivate: () => void;
}

/**
 * Standing screen for the site. It does one job: start the feed. The button
 * carries the state of that action so nobody presses it twice.
 */
export function WelcomePage({ identity, onActivate }: WelcomePageProps) {
  const [starting, setStarting] = useState(false);

  const activate = () => {
    if (starting) return;
    setStarting(true);
    // Short hold so the press registers on a wall-mounted touchscreen.
    setTimeout(onActivate, 500);
  };

  return (
    <main className="welcome">
      <div className="welcome__wash" aria-hidden />

      <span className="welcome__logo">
        <StorexLogo />
      </span>

      <span className="welcome__copy">
        <h1 className="welcome__title">Welcome</h1>
        <span className="welcome__rule" aria-hidden>
          <LeafIcon width={50} height={50} />
        </span>
        <p className="welcome__rating">
          {identity.ratedPowerMw} MW / {identity.ratedEnergyMwh} MWh
        </p>
        <p className="welcome__subject">Battery Energy Storage System</p>
        <p className="welcome__site">{identity.siteName}</p>
      </span>

      <button type="button" className="activate" onClick={activate} disabled={starting}>
        {starting ? 'Starting the system' : 'Activate the system'}
        <ArrowRightIcon width={22} height={22} />
      </button>
    </main>
  );
}
