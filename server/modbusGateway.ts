/**
 * Modbus TCP → WebSocket gateway.
 *
 * A browser cannot open a raw TCP socket, so the React app never speaks Modbus.
 * This process is the only thing that holds the connection to the PCS/EMS: it
 * polls the register block on a fixed interval, scales the raw words into
 * engineering units, and pushes one JSON frame to every connected screen.
 *
 *   npm i modbus-serial ws
 *   npx tsx server/modbusGateway.ts
 *
 * Replace REGISTERS with the addresses from your device's Modbus map — the
 * ones below follow the common Huawei Smart String ESS layout and are a
 * starting point, not a substitute for the vendor document.
 */

import ModbusRTU from 'modbus-serial';
import { WebSocketServer, type WebSocket } from 'ws';

const PLC_HOST = process.env.PLC_HOST ?? '192.168.1.10';
const PLC_PORT = Number(process.env.PLC_PORT ?? 502);
const UNIT_ID = Number(process.env.PLC_UNIT_ID ?? 1);
const POLL_MS = Number(process.env.POLL_MS ?? 1000);
const WS_PORT = Number(process.env.WS_PORT ?? 8080);

const RATED_ENERGY_MWH = 40;

/** address = register offset, words = 1 (16-bit) or 2 (32-bit), gain = raw ÷ gain. */
const REGISTERS = {
  activePowerKw: { address: 37113, words: 2, gain: 1000, signed: true },
  chargeableEnergyMwh: { address: 37015, words: 2, gain: 1000, signed: false },
  dischargeableEnergyMwh: { address: 37017, words: 2, gain: 1000, signed: false },
  energyChargedTodayMwh: { address: 37201, words: 2, gain: 1000, signed: false },
  energyDischargedTodayMwh: { address: 37203, words: 2, gain: 1000, signed: false },
  socPercent: { address: 37004, words: 1, gain: 10, signed: false },
  modeCode: { address: 37000, words: 1, gain: 1, signed: false },
} as const;

const MODES = ['standby', 'on-grid', 'off-grid', 'fault'] as const;

const BLOCK_START = 37000;
const BLOCK_LENGTH = 210;

const client = new ModbusRTU();
const wss = new WebSocketServer({ port: WS_PORT, path: '/telemetry' });
const clients = new Set<WebSocket>();
let lastFrame: string | null = null;

wss.on('connection', (socket) => {
  clients.add(socket);
  // New screens shouldn't wait a full poll cycle for their first reading.
  if (lastFrame) socket.send(lastFrame);
  socket.on('close', () => clients.delete(socket));
});

async function connect(): Promise<void> {
  await client.connectTCP(PLC_HOST, { port: PLC_PORT });
  client.setID(UNIT_ID);
  client.setTimeout(2000);
  console.log(`Connected to ${PLC_HOST}:${PLC_PORT}, unit ${UNIT_ID}`);
}

/** Big-endian word order. Flip the pair if your device is little-endian. */
function decode(words: number[], offset: number, spec: { words: number; gain: number; signed: boolean }): number {
  const raw =
    spec.words === 2
      ? (words[offset] << 16) | words[offset + 1]
      : words[offset];
  const value = spec.signed ? (raw | 0) : raw >>> 0;
  return value / spec.gain;
}

async function poll(): Promise<void> {
  const { data } = await client.readHoldingRegisters(BLOCK_START, BLOCK_LENGTH);

  const read = (spec: (typeof REGISTERS)[keyof typeof REGISTERS]) =>
    decode(data, spec.address - BLOCK_START, spec);

  const socPercent = read(REGISTERS.socPercent);

  const frame = {
    activePowerKw: round(read(REGISTERS.activePowerKw), 2),
    chargeableEnergyMwh: round(read(REGISTERS.chargeableEnergyMwh), 2),
    dischargeableEnergyMwh: round(read(REGISTERS.dischargeableEnergyMwh), 2),
    energyChargedTodayMwh: round(read(REGISTERS.energyChargedTodayMwh), 2),
    energyDischargedTodayMwh: round(read(REGISTERS.energyDischargedTodayMwh), 2),
    socPercent: round(socPercent, 1),
    mode: MODES[read(REGISTERS.modeCode)] ?? 'standby',
    ratedEnergyMwh: RATED_ENERGY_MWH,
    timestamp: new Date().toISOString(),
  };

  lastFrame = JSON.stringify(frame);
  for (const socket of clients) {
    if (socket.readyState === socket.OPEN) socket.send(lastFrame);
  }
}

function round(value: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}

async function main(): Promise<void> {
  await connect();
  console.log(`Serving telemetry on ws://localhost:${WS_PORT}/telemetry`);

  setInterval(() => {
    // Sockets that fall over get reopened on the next tick; screens see the
    // gap as a stale link rather than a frozen reading.
    poll().catch(async (error) => {
      console.error('Poll failed:', error.message);
      try {
        client.close(() => undefined);
        await connect();
      } catch {
        /* retried on the next tick */
      }
    });
  }, POLL_MS);
}

main().catch((error) => {
  console.error('Gateway failed to start:', error);
  process.exit(1);
});
