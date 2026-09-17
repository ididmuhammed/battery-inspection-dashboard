import { useEffect, useRef, useState } from 'react';
import type { LinkStatus, Telemetry } from '../types/telemetry';
import type { TelemetrySource } from '../services/telemetrySource';

export interface UseTelemetryResult {
  telemetry: Telemetry | null;
  status: LinkStatus;
  detail?: string;
  /** Rolling window of active power in kW, oldest first — feeds the trace. */
  powerHistory: number[];
  lastUpdate: number | null;
}

/**
 * Subscribes to a telemetry source for the lifetime of the component.
 * `source` should be memoised by the caller, or the feed restarts every render.
 */
export function useTelemetry(source: TelemetrySource, historyLength = 90): UseTelemetryResult {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [status, setStatus] = useState<LinkStatus>('connecting');
  const [detail, setDetail] = useState<string | undefined>();
  const [powerHistory, setPowerHistory] = useState<number[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    source.start({
      onFrame: ({ data, receivedAt }) => {
        if (!mounted.current) return;
        setTelemetry(data);
        setLastUpdate(receivedAt);
        setPowerHistory((prev) => [...prev, data.activePowerKw].slice(-historyLength));
      },
      onStatus: (next, why) => {
        if (!mounted.current) return;
        setStatus(next);
        setDetail(why);
      },
    });

    return () => {
      mounted.current = false;
      source.stop();
    };
  }, [source, historyLength]);

  return { telemetry, status, detail, powerHistory, lastUpdate };
}
