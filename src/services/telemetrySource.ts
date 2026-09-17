import type { LinkStatus, Telemetry, TelemetryFrame } from '../types/telemetry';
import seed from '../data/seedTelemetry.json';

/**
 * Everything the UI needs from a data feed. Swap MockTelemetrySource for
 * WebSocketTelemetrySource when the Modbus gateway is up — nothing else changes.
 */
export interface TelemetrySource {
  start(handlers: TelemetryHandlers): void;
  stop(): void;
}

export interface TelemetryHandlers {
  onFrame(frame: TelemetryFrame): void;
  onStatus(status: LinkStatus, detail?: string): void;
}

// JSON widens 'on-grid' to string, so the cast goes through unknown.
const SEED = seed as unknown as Telemetry;

/* ------------------------------------------------------------------ */
/* Mock feed                                                           */
/* ------------------------------------------------------------------ */

/**
 * Simulates a plant that follows a slow charge/discharge duty cycle, so the
 * dashboard can be demoed and styled without a PLC on the bench.
 */
export class MockTelemetrySource implements TelemetrySource {
  private timer?: ReturnType<typeof setInterval>;
  private state: Telemetry = { ...SEED };
  private elapsedS = 0;

  constructor(
    private readonly intervalMs = 1000,
    private readonly ratedPowerKw = 10_000,
    private readonly ratedEnergyMwh = 40,
  ) {}

  start(handlers: TelemetryHandlers): void {
    handlers.onStatus('connecting');
    this.stop();

    const tick = () => {
      this.advance(this.intervalMs / 1000);
      handlers.onFrame({ data: { ...this.state }, receivedAt: Date.now() });
    };

    // First frame lands quickly so the page never shows an empty state for long.
    setTimeout(() => {
      handlers.onStatus('live');
      tick();
      this.timer = setInterval(tick, this.intervalMs);
    }, 450);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  /** One integration step of the toy plant model. */
  private advance(dtSeconds: number): void {
    this.elapsedS += dtSeconds;

    // Smooth setpoint ramp: a slow sine plus a little measurement noise, the
    // way a real active-power reading wanders around its command.
    const dutyCycle = Math.sin(this.elapsedS / 45);
    const noise = (Math.random() - 0.5) * 18;
    const power = clamp(dutyCycle * this.ratedPowerKw * 0.09 + noise, -this.ratedPowerKw, this.ratedPowerKw);

    const deltaMwh = (power / 1000) * (dtSeconds / 3600);

    if (power < 0) {
      this.state.energyChargedTodayMwh += Math.abs(deltaMwh);
    } else {
      this.state.energyDischargedTodayMwh += deltaMwh;
    }

    const stored = clamp(this.state.dischargeableEnergyMwh - deltaMwh, 0, this.ratedEnergyMwh);
    this.state.activePowerKw = round(power, 2);
    this.state.dischargeableEnergyMwh = round(stored, 2);
    this.state.chargeableEnergyMwh = round(this.ratedEnergyMwh - stored, 2);
    this.state.energyChargedTodayMwh = round(this.state.energyChargedTodayMwh, 2);
    this.state.energyDischargedTodayMwh = round(this.state.energyDischargedTodayMwh, 2);
    this.state.socPercent = round((stored / this.ratedEnergyMwh) * 100, 1);
    this.state.timestamp = new Date().toISOString();
  }
}

/* ------------------------------------------------------------------ */
/* Live feed                                                           */
/* ------------------------------------------------------------------ */

/**
 * Reads frames pushed by the Node gateway (see /server/modbusGateway.ts).
 * Reconnects with backoff and marks the link stale if frames stop arriving,
 * so a frozen dashboard can never be mistaken for a healthy one.
 */
export class WebSocketTelemetrySource implements TelemetrySource {
  private socket?: WebSocket;
  private watchdog?: ReturnType<typeof setInterval>;
  private retryMs = 1000;
  private closedByUs = false;
  private lastFrameAt = 0;

  constructor(
    private readonly url: string,
    private readonly staleAfterMs = 5000,
  ) {}

  start(handlers: TelemetryHandlers): void {
    this.closedByUs = false;
    this.connect(handlers);

    this.watchdog = setInterval(() => {
      if (this.lastFrameAt && Date.now() - this.lastFrameAt > this.staleAfterMs) {
        handlers.onStatus('stale', 'No frame from the gateway');
      }
    }, 1000);
  }

  stop(): void {
    this.closedByUs = true;
    if (this.watchdog) clearInterval(this.watchdog);
    this.socket?.close();
    this.socket = undefined;
  }

  private connect(handlers: TelemetryHandlers): void {
    handlers.onStatus('connecting');
    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.onopen = () => {
      this.retryMs = 1000;
      handlers.onStatus('live');
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as Telemetry;
        this.lastFrameAt = Date.now();
        handlers.onStatus('live');
        handlers.onFrame({ data, receivedAt: this.lastFrameAt });
      } catch {
        handlers.onStatus('error', 'Unreadable frame from the gateway');
      }
    };

    socket.onerror = () => handlers.onStatus('error', 'Gateway unreachable');

    socket.onclose = () => {
      if (this.closedByUs) return;
      handlers.onStatus('error', `Reconnecting in ${Math.round(this.retryMs / 1000)}s`);
      setTimeout(() => this.connect(handlers), this.retryMs);
      this.retryMs = Math.min(this.retryMs * 2, 15_000);
    };
  }
}

/* ------------------------------------------------------------------ */

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}
