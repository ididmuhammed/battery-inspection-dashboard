import { useId, useMemo, type ReactNode } from 'react';
import '../styles/scene.css';

export type FlowDirection = 'export' | 'import' | 'idle';

export interface AnimatedSiteSceneProps {
  /** Which way energy is moving. Sets the direction the beams and chevrons run. */
  flow?: FlowDirection;
  /** Set false to draw the scene alone, e.g. behind the welcome screen. */
  showLabels?: boolean;
  labels?: { pack: string; substation: string; grid: string };
  /** Drop the sun, stupa and distant ridge for a tighter crop. */
  compact?: boolean;
}

const DEFAULT_LABELS = {
  pack: 'Battery Energy Storage System',
  substation: 'Anuradhapura Substation',
  grid: 'National Grid',
};

/* ------------------------------------------------------------------ *
 * Foliage is generated rather than hand-placed: a seeded RNG keeps the
 * treeline identical between renders while giving it the irregularity
 * hand-authored circles never have.
 * ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Canopy {
  cx: number;
  cy: number;
  r: number;
  fill: string;
}

function buildBand(
  seed: number,
  count: number,
  xFrom: number,
  xTo: number,
  baseY: number,
  jitterY: number,
  minR: number,
  maxR: number,
  palette: string[],
): Canopy[] {
  const rand = mulberry32(seed);
  const trees: Canopy[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    trees.push({
      cx: xFrom + (xTo - xFrom) * t + (rand() - 0.5) * ((xTo - xFrom) / count) * 2.4,
      cy: baseY + (rand() - 0.5) * jitterY,
      r: minR + rand() * (maxR - minR),
      fill: palette[Math.floor(rand() * palette.length)],
    });
  }
  return trees;
}

export function AnimatedSiteScene({
  flow = 'export',
  showLabels = true,
  labels = DEFAULT_LABELS,
  compact = false,
}: AnimatedSiteSceneProps) {
  // useId keeps gradient and filter references unique when the scene is
  // mounted more than once on a page.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ref = (name: string) => `${uid}-${name}`;

  const farTrees = useMemo(
    () => buildBand(1337, 58, -40, 1640, 214, 16, 16, 30, ['#3f7f5e', '#4a8b66', '#356f52']),
    [],
  );
  const midTrees = useMemo(
    () => buildBand(4242, 46, -40, 1640, 238, 20, 22, 42, ['#2f7a45', '#27703d', '#399052']),
    [],
  );
  const nearTrees = useMemo(
    () => buildBand(909, 30, -40, 1640, 262, 22, 26, 52, ['#1f6634', '#28733c', '#17552b']),
    [],
  );

  const flowClass = `bess-scene bess-scene--${flow}`;

  return (
    <svg
      className={flowClass}
      viewBox="0 0 1600 500"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Battery storage site feeding the substation and the national grid"
    >
      <defs>
        <linearGradient id={ref('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1567d6" />
          <stop offset="42%" stopColor="#5aa9ef" />
          <stop offset="78%" stopColor="#bfe0f7" />
          <stop offset="100%" stopColor="#ffe3b4" />
        </linearGradient>

        <radialGradient id={ref('sunGlow')} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fffbe8" />
          <stop offset="35%" stopColor="#ffe9a8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffc96b" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={ref('water')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ec1e8" />
          <stop offset="100%" stopColor="#4c92c9" />
        </linearGradient>

        <linearGradient id={ref('field')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ea347" />
          <stop offset="45%" stopColor="#3b9040" />
          <stop offset="100%" stopColor="#14602b" />
        </linearGradient>

        <linearGradient id={ref('slab')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9eef2" />
          <stop offset="100%" stopColor="#b6c1c9" />
        </linearGradient>

        <linearGradient id={ref('shellFront')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#eef3f8" />
          <stop offset="100%" stopColor="#cfd9e2" />
        </linearGradient>

        <linearGradient id={ref('beam')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e9bff" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#59c8ff" />
          <stop offset="100%" stopColor="#1e9bff" stopOpacity="0.15" />
        </linearGradient>

        <linearGradient id={ref('groundGlow')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2bff8a" stopOpacity="0" />
          <stop offset="50%" stopColor="#2bff8a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2bff8a" stopOpacity="0" />
        </linearGradient>

        {/* Haze over the far treeline — the distance cue the render leans on. */}
        <linearGradient id={ref('haze')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe6f7" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#cfe6f7" stopOpacity="0" />
        </linearGradient>

        <filter id={ref('softGlow')} x="-60%" y="-300%" width="220%" height="700%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={ref('textShadow')} x="-20%" y="-60%" width="140%" height="240%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#04203f" floodOpacity="0.85" />
        </filter>

        {/* Grass and water texture. Cheaper and calmer than thousands of blades. */}
        <filter id={ref('grassTexture')}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.04" numOctaves="3" seed="7" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.22" intercept="0" />
          </feComponentTransfer>
        </filter>

        <filter id={ref('ripple')}>
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.32" numOctaves="2" seed="3">
            <animate
              attributeName="baseFrequency"
              dur="14s"
              values="0.012 0.32;0.016 0.28;0.012 0.32"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <clipPath id={ref('lakeClip')}>
          <path d="M1120 232 Q1300 198 1600 210 V268 Q1320 286 1120 262Z" />
        </clipPath>
      </defs>

      {/* ---------------------------------------------------------- sky */}
      <rect width="1600" height="270" fill={`url(#${ref('sky')})`} />

      {!compact && (
        <g className="bess-sun">
          <circle cx="40" cy="150" r="230" fill={`url(#${ref('sunGlow')})`} />
          <circle cx="40" cy="150" r="58" fill="#fff8dc" opacity="0.95" />
        </g>
      )}

      {/* clouds — three bands at different speeds for parallax */}
      <g fill="#ffffff" opacity="0.9">
        <g className="bess-cloud bess-cloud--far">
          <Cloud x={420} y={78} s={1} />
          <Cloud x={980} y={62} s={1.2} />
          <Cloud x={1420} y={92} s={0.85} />
        </g>
        <g className="bess-cloud bess-cloud--mid" opacity="0.95">
          <Cloud x={700} y={118} s={1.45} />
          <Cloud x={1180} y={132} s={1.15} />
        </g>
        <g className="bess-cloud bess-cloud--near" opacity="0.8">
          <Cloud x={220} y={150} s={0.9} />
          <Cloud x={1520} y={146} s={1.05} />
        </g>
      </g>

      {/* ------------------------------------------------------- horizon */}
      {!compact && (
        <g>
          {/* stupa on the ridge */}
          <g fill="#f6f9fc">
            <path d="M196 196c0-56 54-92 54-92s54 36 54 92z" />
            <rect x="188" y="192" width="124" height="10" rx="4" />
            <path d="M244 104l6-56 6 56z" />
            <circle cx="250" cy="40" r="6" />
          </g>
          <path d="M188 200h124l8 8H180z" fill="#d8656a" opacity="0.8" />
        </g>
      )}

      <g>
        {farTrees.map((t, i) => (
          <circle key={`f${i}`} cx={t.cx} cy={t.cy} r={t.r} fill={t.fill} />
        ))}
        <rect y="180" width="1600" height="60" fill={`url(#${ref('haze')})`} />
      </g>

      {/* reservoir */}
      <g clipPath={`url(#${ref('lakeClip')})`}>
        <rect x="1100" y="190" width="520" height="90" fill={`url(#${ref('water')})`} />
        <g filter={`url(#${ref('ripple')})`} opacity="0.55">
          <rect x="1100" y="214" width="520" height="2" fill="#ffffff" />
          <rect x="1100" y="232" width="520" height="2" fill="#ffffff" />
          <rect x="1100" y="250" width="520" height="2" fill="#ffffff" />
        </g>
      </g>

      <g>
        {midTrees.map((t, i) => (
          <circle key={`m${i}`} cx={t.cx} cy={t.cy} r={t.r} fill={t.fill} />
        ))}
      </g>
      <g>
        {nearTrees.map((t, i) => (
          <circle key={`n${i}`} cx={t.cx} cy={t.cy} r={t.r} fill={t.fill} />
        ))}
      </g>

      {/* ---------------------------------------------------------- field */}
      <path d="M0 268 Q420 246 900 272 T1600 262 V500 H0Z" fill={`url(#${ref('field')})`} />
      <path
        d="M0 268 Q420 246 900 272 T1600 262 V500 H0Z"
        fill="#0b3d1c"
        filter={`url(#${ref('grassTexture')})`}
        opacity="0.5"
      />

      {/* the green light line running along the ground, as in the render */}
      <rect className="bess-groundglow" x="1180" y="352" width="420" height="4" rx="2" fill={`url(#${ref('groundGlow')})`} />

      {/* ------------------------------------------------- perimeter fence */}
      <g stroke="#d8e3ec" strokeWidth="2" opacity="0.75" fill="none">
        <path d="M10 300v78M56 302v76M102 304v74M148 306v72" />
        <path d="M6 306h150M6 336h150M6 366h150" />
      </g>

      {/* --------------------------------------------- battery containers */}
      <g>
        {/* concrete pad, drawn in perspective */}
        <path d="M44 430 L332 398 L648 418 L360 462Z" fill={`url(#${ref('slab')})`} />
        <path d="M44 430 L360 462 L360 472 L44 440Z" fill="#9aa7b2" />

        <ShippingContainer x={96} y={288} w={218} h={96} d={46} uid={ref('shellFront')} />
        <ShippingContainer x={286} y={308} w={300} h={104} d={50} uid={ref('shellFront')} doors={false}>
          <path className="bess-bolt" d="M470 330l-28 48h21l-7 40 34-54h-24z" fill="#2ce06d" />
          <image
            href="/huawei-logo.png"
            x={300}
            y={320}
            width="160"
            height="40"
            preserveAspectRatio="xMidYMid meet"
          />
        </ShippingContainer>
      </g>

      {/* -------------------------------------------------- substation bay */}
      <g>
        <path d="M712 372 L906 346 L1136 364 L940 396Z" fill={`url(#${ref('slab')})`} />
        <path d="M712 372 L940 396 L940 406 L712 382Z" fill="#9aa7b2" />

        <LatticeFrame x={846} yTop={146} yBase={352} w={34} />
        <LatticeFrame x={960} yTop={132} yBase={346} w={38} />
        <LatticeFrame x={1062} yTop={148} yBase={356} w={34} />

        {/* busbars between the gantries */}
        <g stroke="#e8f1fa" strokeWidth="2.5" fill="none" opacity="0.9">
          <path d="M846 168 Q952 180 1062 170" />
          <path d="M846 186 Q952 200 1062 188" />
        </g>

        {/* transformer tanks */}
        <g>
          <rect x="898" y="258" width="108" height="86" rx="5" fill="#5b6773" />
          <rect x="898" y="258" width="108" height="14" rx="5" fill="#77848f" />
          <g stroke="#48545f" strokeWidth="3">
            {[906, 916, 926, 936, 946, 956, 966, 976, 986, 996].map((x) => (
              <path key={x} d={`M${x} 276v62`} />
            ))}
          </g>
          <rect x="1006" y="272" width="46" height="70" rx="4" fill="#6b7783" />
          <rect x="866" y="286" width="36" height="56" rx="4" fill="#6b7783" />

          {/* HV bushings */}
          {[920, 952, 984].map((x) => (
            <g key={x}>
              <path d={`M${x - 9} 258 L${x - 5} 214 L${x + 5} 214 L${x + 9} 258Z`} fill="#dfe8f1" />
              <rect x={x - 7} y="196" width="14" height="20" rx="3" fill="#6b4a2f" />
              <rect x={x - 9} y="192" width="18" height="5" rx="2" fill="#8a6440" />
              <path d={`M${x} 192v-22`} stroke="#e8f1fa" strokeWidth="2.5" />
            </g>
          ))}
        </g>
      </g>

      {/* --------------------------------------------- transmission tower */}
      <g>
        <path d="M1318 388 L1428 372 L1560 384 L1450 404Z" fill={`url(#${ref('slab')})`} />
        <TransmissionTower />
        {/* conductors leaving frame */}
        <g stroke="#2a3a4a" strokeWidth="2" fill="none" opacity="0.7">
          <path d="M1392 186 Q1200 214 1080 200" />
          <path d="M1508 186 Q1580 196 1600 190" />
          <path d="M1392 234 Q1210 262 1096 244" />
          <path d="M1508 234 Q1580 244 1600 238" />
        </g>
      </g>

      {/* ------------------------------------------------------ energy flow */}
      <EnergyBeam
        d="M636 352 Q740 336 844 330"
        glowId={ref('softGlow')}
        strokeId={ref('beam')}
      />
      <EnergyBeam
        d="M1104 334 Q1240 330 1396 336"
        glowId={ref('softGlow')}
        strokeId={ref('beam')}
      />

      <Chevron x={700} y={340} />
      <Chevron x={1186} y={330} />

      {/* ------------------------------------------------- foreground leaves */}
      <g fill="#1d7a35" opacity="0.95">
        <path d="M-10 500c40-70 96-96 150-96-24 50-72 82-150 96z" />
        <path d="M60 500c26-52 70-74 112-76-18 38-56 62-112 76z" fill="#2a9245" />
        <path d="M1610 500c-44-64-104-88-158-86 28 46 78 74 158 86z" />
      </g>

      {/* -------------------------------------------------------- labels */}
      {showLabels && (
        <g
          fill="#ffffff"
          filter={`url(#${ref('textShadow')})`}
          fontFamily="Manrope, Segoe UI, system-ui, sans-serif"
          fontWeight={700}
          textAnchor="middle"
        >
          <text x="370" y="486" fontSize="26">
            {labels.pack}
          </text>
          <text x="950" y="422" fontSize="23">
            {labels.substation}
          </text>
          <text x="1452" y="446" fontSize="21">
            {labels.grid}
          </text>
        </g>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="70" ry="20" />
      <ellipse cx="-38" cy="6" rx="42" ry="15" />
      <ellipse cx="34" cy="7" rx="48" ry="16" />
      <ellipse cx="-8" cy="-14" rx="34" ry="18" />
      <ellipse cx="26" cy="-9" rx="26" ry="14" />
    </g>
  );
}

interface ContainerProps {
  x: number;
  y: number;
  w: number;
  h: number;
  d: number;
  uid: string;
  doors?: boolean;
  children?: ReactNode;
}

/** A 20 ft battery container: front face, skewed top, corrugated flank. */
function ShippingContainer({ x, y, w, h, d, uid, doors = true, children }: ContainerProps) {
  const ribs = Math.floor(w / 13);

  return (
    <g>
      {/* top face */}
      <path d={`M${x} ${y} L${x + d} ${y - d * 0.42} L${x + w + d} ${y - d * 0.42 + 8} L${x + w} ${y + 8}Z`} fill="#dfe7ee" />
      {/* right flank */}
      <path d={`M${x + w} ${y + 8} L${x + w + d} ${y - d * 0.42 + 8} L${x + w + d} ${y + h - 8} L${x + w} ${y + h}Z`} fill="#b9c5d0" />
      {/* front face */}
      <rect x={x} y={y} width={w} height={h} rx="3" fill={`url(#${uid})`} stroke="#a9b6c2" />
      {/* corrugation */}
      <g stroke="#c8d3dd" strokeWidth="1.4" opacity="0.9">
        {Array.from({ length: ribs }, (_, i) => (
          <path key={i} d={`M${x + 8 + i * 13} ${y + 5}v${h - 10}`} />
        ))}
      </g>
      {doors && (
        <g stroke="#93a2b0" fill="#e3eaf1">
          <rect x={x + 10} y={y + 10} width={w * 0.34} height={h - 20} rx="2" />
          <rect x={x + 16 + w * 0.34} y={y + 10} width={w * 0.34} height={h - 20} rx="2" />
          <rect x={x + 22 + w * 0.68} y={y + 22} width={w * 0.2} height={h - 44} rx="2" fill="#4a5764" />
        </g>
      )}
      {/* vents */}
      <g fill="#8ad06a" opacity="0.9">
        <rect x={x + w - 26} y={y + 14} width="8" height="5" rx="2" />
        <rect x={x + w - 26} y={y + 26} width="8" height="5" rx="2" />
      </g>
      {/* base rail + shadow on the pad */}
      <rect x={x - 4} y={y + h} width={w + 8} height="7" rx="2" fill="#9aa7b2" />
      <ellipse cx={x + w / 2} cy={y + h + 16} rx={w * 0.58} ry="9" fill="#0b3d1c" opacity="0.28" />
      {children}
    </g>
  );
}

/** One A-frame gantry in the substation bay. */
function LatticeFrame({ x, yTop, yBase, w }: { x: number; yTop: number; yBase: number; w: number }) {
  const half = w / 2;
  const rungs = Math.floor((yBase - yTop) / 22);

  return (
    <g stroke="#dfe9f3" strokeWidth="2.4" fill="none">
      <path d={`M${x - half} ${yBase} L${x - half + 6} ${yTop}`} />
      <path d={`M${x + half} ${yBase} L${x + half - 6} ${yTop}`} />
      <path d={`M${x - half - 16} ${yTop + 22} h${w + 32}`} />
      <path d={`M${x - half - 12} ${yTop + 44} h${w + 24}`} />
      {Array.from({ length: rungs }, (_, i) => {
        const y1 = yTop + i * 22;
        const y2 = y1 + 22;
        return <path key={i} d={`M${x - half + 5} ${y1} L${x + half - 5} ${y2} M${x + half - 5} ${y1} L${x - half + 5} ${y2}`} strokeWidth="1.4" />;
      })}
      {/* insulator strings */}
      {[x - half - 10, x, x + half + 10].map((cx) => (
        <g key={cx} stroke="#c9d6e2" strokeWidth="4" strokeLinecap="round">
          <path d={`M${cx} ${yTop + 22}v16`} />
        </g>
      ))}
    </g>
  );
}

/** The classic lattice pylon on the right of the render. */
function TransmissionTower() {
  const legs = 'M1394 386 L1418 150 M1506 386 L1482 150';
  const braces = Array.from({ length: 11 }, (_, i) => {
    const t = i / 11;
    const nt = (i + 1) / 11;
    const yTop = 150 + t * 236;
    const yBot = 150 + nt * 236;
    const lTop = 1418 - t * 24;
    const rTop = 1482 + t * 24;
    const lBot = 1418 - nt * 24;
    const rBot = 1482 + nt * 24;
    return `M${lTop} ${yTop} L${rBot} ${yBot} M${rTop} ${yTop} L${lBot} ${yBot} M${lBot} ${yBot} L${rBot} ${yBot}`;
  }).join(' ');

  return (
    <g stroke="#eef4fa" fill="none" strokeWidth="2.6">
      <path d={legs} strokeWidth="3.4" />
      <path d={braces} strokeWidth="1.5" opacity="0.95" />
      {/* crossarms */}
      <path d="M1392 186 h116 M1404 172 L1392 186 M1496 172 L1508 186" />
      <path d="M1380 234 h140 M1400 216 L1380 234 M1500 216 L1520 234" />
      {/* peak */}
      <path d="M1420 150 L1450 118 L1480 150 M1450 118v-16" />
      {/* insulators */}
      <g stroke="#cbd8e4" strokeWidth="4" strokeLinecap="round">
        <path d="M1392 186v14 M1508 186v14 M1380 234v14 M1520 234v14" />
      </g>
      {/* footings */}
      <g fill="#c6d1da" stroke="none">
        <rect x="1382" y="378" width="26" height="12" rx="3" />
        <rect x="1494" y="378" width="26" height="12" rx="3" />
      </g>
    </g>
  );
}

/** A glowing conductor with light pulses running along it. */
function EnergyBeam({ d, glowId, strokeId }: { d: string; glowId: string; strokeId: string }) {
  return (
    <g filter={`url(#${glowId})`}>
      <path d={d} stroke={`url(#${strokeId})`} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
      <path className="bess-beam-pulse" d={d} stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** The white arrowhead that sits on each beam. */
function Chevron({ x, y }: { x: number; y: number }) {
  return (
    <g className="bess-chevron" transform={`translate(${x} ${y})`}>
      <path
        d="M-16 -22 L12 0 L-16 22 L-4 0Z"
        fill="#ffffff"
        stroke="#bfe6ff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </g>
  );
}
