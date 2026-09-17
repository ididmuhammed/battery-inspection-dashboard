import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface MetricTileProps {
  label: string;
  value: string;
  unit: string;
  icon: ReactNode;
  /** Small line under the value, e.g. "Charging". */
  note?: string;
  /** 'signal' paints the value green — used for live active power. */
  tone?: 'default' | 'signal';
}

/**
 * One reading from the pack. The value briefly lifts when it changes, which is
 * the only cue an operator glancing at a wall screen needs to know the feed is
 * moving. Held to a single subtle pulse, and skipped entirely under
 * prefers-reduced-motion.
 */
export function MetricTile({ label, value, unit, icon, note, tone = 'default' }: MetricTileProps) {
  const [flash, setFlash] = useState(false);
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 420);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <article className={`tile${flash ? ' tile--flash' : ''}`}>
      <span className="tile__icon">{icon}</span>
      <div className="tile__body">
        <h2 className="tile__label">{label}</h2>
        <p className={`tile__value${tone === 'signal' ? ' tile__value--signal' : ''}`}>
          <span className="tile__number">{value}</span>
          <span className="tile__unit">{unit}</span>
        </p>
        {note ? <p className="tile__note">{note}</p> : null}
      </div>
    </article>
  );
}
