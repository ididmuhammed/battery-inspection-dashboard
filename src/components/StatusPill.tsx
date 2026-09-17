import type { LinkStatus, OperationMode } from '../types/telemetry';

export interface StatusPillProps {
  status: LinkStatus;
  mode: OperationMode;
  detail?: string;
  secondsSinceUpdate: number | null;
}

const MODE_TEXT: Record<OperationMode, string> = {
  'on-grid': 'On-grid operation',
  'off-grid': 'Off-grid operation',
  standby: 'Standby',
  fault: 'Fault — see alarms',
};

/**
 * Reports the plant mode when the feed is healthy, and the link problem when
 * it isn't. A stale reading is called out rather than left looking live.
 */
export function StatusPill({ status, mode, detail, secondsSinceUpdate }: StatusPillProps) {
  const healthy = status === 'live';
  const text = healthy
    ? MODE_TEXT[mode]
    : status === 'connecting'
      ? 'Connecting to the gateway'
      : status === 'stale'
        ? `Last reading ${secondsSinceUpdate ?? '—'}s ago`
        : (detail ?? 'Gateway unreachable');

  return (
    <p className={`status status--${status}`}>
      <span className="status__dot" aria-hidden />
      {text}
    </p>
  );
}
