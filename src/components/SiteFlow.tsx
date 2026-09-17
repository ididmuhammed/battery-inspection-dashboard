import type { PlantIdentity } from '../types/telemetry';
import { AnimatedSiteScene, type FlowDirection } from './AnimatedSiteScene';

export interface SiteFlowProps {
  identity: PlantIdentity;
  /** Signed active power. Sign sets the direction the beams travel. */
  activePowerKw: number;
}

/**
 * The single-line view of the site: pack, substation, grid. The beams run
 * right when the plant exports and left when it charges, so the direction of
 * energy is readable from across the control room without reading a number.
 */
export function SiteFlow({ identity, activePowerKw }: SiteFlowProps) {
  const flow: FlowDirection =
    Math.abs(activePowerKw) < 1 ? 'idle' : activePowerKw > 0 ? 'export' : 'import';

  const caption =
    flow === 'idle'
      ? 'Holding state of charge'
      : flow === 'export'
        ? 'Exporting to the grid'
        : 'Drawing from the grid';

  return (
    <section className="scene" aria-label={`${identity.siteName} single line view`}>
      <AnimatedSiteScene
        flow={flow}
        labels={{
          pack: 'Battery Energy Storage System',
          substation: identity.substationName,
          grid: identity.gridName,
        }}
      />
      <p className="scene__direction">{caption}</p>
    </section>
  );
}
