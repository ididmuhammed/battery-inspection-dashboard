export interface PowerTraceProps {
  /** kW samples, oldest first. */
  history: number[];
  /** Rated power in kW — sets the vertical scale so the trace never rescales. */
  ratedPowerKw: number;
  windowLabel: string;
}

const W = 320;
const H = 72;

/**
 * Ninety seconds of active power around a zero line. Fixed scale on purpose:
 * an auto-scaling axis makes a calm plant look as dramatic as a swinging one.
 */
export function PowerTrace({ history, ratedPowerKw, windowLabel }: PowerTraceProps) {
  const span = ratedPowerKw * 0.25 || 1;
  const points = history.map((kw, i) => {
    const x = history.length > 1 ? (i / (history.length - 1)) * W : 0;
    const clamped = Math.max(Math.min(kw, span), -span);
    const y = H / 2 - (clamped / span) * (H / 2 - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const path = points.length > 1 ? `M${points.join(' L')}` : '';
  const area = path ? `${path} L${W},${H / 2} L0,${H / 2} Z` : '';

  return (
    <figure className="trace">
      <figcaption className="trace__caption">
        Active power, last {windowLabel}
        <span className="trace__scale">±{Math.round(span)} kW</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="trace__svg" role="img" aria-label="Active power trend">
        <defs>
          <linearGradient id="traceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} className="trace__zero" />
        {area ? <path d={area} fill="url(#traceFill)" /> : null}
        {path ? <path d={path} className="trace__line" /> : null}
      </svg>
      <p className="trace__legend">
        <span className="trace__key trace__key--charge" /> below the line, charging
        <span className="trace__key trace__key--discharge" /> above, discharging
      </p>
    </figure>
  );
}

export interface StateOfChargeProps {
  socPercent: number;
  dischargeableMwh: number;
  ratedEnergyMwh: number;
}

export function StateOfCharge({ socPercent, dischargeableMwh, ratedEnergyMwh }: StateOfChargeProps) {
  const pct = Math.max(0, Math.min(100, socPercent));

  return (
    <div className="soc">
      <div className="soc__head">
        <h2 className="soc__label">State of charge</h2>
        <p className="soc__value">
          {pct.toFixed(1)}
          <span className="soc__unit">%</span>
        </p>
      </div>
      <div
        className="soc__track"
        role="meter"
        aria-valuenow={Number(pct.toFixed(1))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="State of charge"
      >
        <span className="soc__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="soc__foot">
        {dischargeableMwh.toFixed(2)} of {ratedEnergyMwh} MWh stored
      </p>
    </div>
  );
}
