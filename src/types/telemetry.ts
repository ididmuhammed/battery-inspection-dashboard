/**
 * Canonical shape of one telemetry frame after the Modbus registers have been
 * decoded and scaled by the gateway. The UI only ever sees this — it never
 * deals with register addresses, word order or scaling factors.
 */

export type OperationMode = 'on-grid' | 'off-grid' | 'standby' | 'fault';

/** Health of the link between the browser and the Modbus gateway. */
export type LinkStatus = 'connecting' | 'live' | 'stale' | 'error';

export interface Telemetry {
  /** Negative = charging (importing), positive = discharging (exporting). */
  activePowerKw: number;
  /** Headroom left before the pack is full. */
  chargeableEnergyMwh: number;
  /** Energy still available to export. */
  dischargeableEnergyMwh: number;
  energyChargedTodayMwh: number;
  energyDischargedTodayMwh: number;
  /** 0–100. Derived on the gateway from the BMS SoC register. */
  socPercent: number;
  mode: OperationMode;
  /** ISO 8601 timestamp of the poll that produced this frame. */
  timestamp: string;
}

/** What the transport hands to the hook on every poll. */
export interface TelemetryFrame {
  data: Telemetry;
  receivedAt: number;
}

/** Static nameplate data — read once at start-up, not polled. */
export interface PlantIdentity {
  siteName: string;
  ratedPowerMw: number;
  ratedEnergyMwh: number;
  substationName: string;
  gridName: string;
}
