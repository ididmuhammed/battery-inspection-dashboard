import type { FC, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  viewBox: '0 0 24 24',
  width: 28,
  height: 28,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const BoltIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M13.2 2 4.8 13.2h5.4L9.9 22l8.6-11.4h-5.6L13.2 2Z" fill="currentColor" stroke="none" />
  </svg>
);

/** Battery outline with a bolt — chargeable / dischargeable headroom. */
export const BatteryBoltIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <rect x="5" y="2.5" width="14" height="19" rx="3" />
    <path d="M9 1.5h6" />
    <path d="M13 7.5 9.8 12.6h3.1L11.8 17l3.5-5.3h-3l.7-4.2Z" fill="currentColor" stroke="none" />
  </svg>
);

/** Battery with an up arrow — energy taken in today. */
export const ChargedTodayIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="4" width="16" height="16" rx="3.5" />
    <path d="M12 16V8.5" />
    <path d="M8.8 11.6 12 8.4l3.2 3.2" />
  </svg>
);

/** Battery with a down arrow — energy sent out today. */
export const DischargedTodayIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="4" width="16" height="16" rx="3.5" />
    <path d="M12 8v7.5" />
    <path d="M15.2 12.4 12 15.6l-3.2-3.2" />
  </svg>
);

export const LeafIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M20 4c0 9-5.2 13.2-11 13.2A5.2 5.2 0 0 1 4 12C4 6.4 10.6 3.6 20 4Z" fill="currentColor" stroke="none" />
    <path d="M4.6 20c2.6-4.6 6-7.6 10.4-9.6" stroke="#0d4d2a" />
  </svg>
);

export const ArrowRightIcon: FC<IconProps> = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 12h14" />
    <path d="m13.2 6.4 5.8 5.6-5.8 5.6" />
  </svg>
);
