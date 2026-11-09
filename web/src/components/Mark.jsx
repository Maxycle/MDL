import { useId } from 'react';
import { LEVEL_RANK, LEVELS, CERTS, DOMAINS } from '../lib/format.js';

/*
  The MDL target-and-arrow mark, redrawn as a vector so it can show a member's progress
  (it replaces the ten 480 KB JPEG variants of the old site).
    top half of each ring    = Droit Naturel      bottom half = École Autrichienne
    inner ring = Bases Acquises, middle = Sait Analyser, outer = Sait Extrapoler
    a ring half turns from blue to flame when that level is validated; porte-parole = all flame.
*/
const RINGS = [
  { ring: 1, rOut: 218, rIn: 140, gapRight: 88 },
  { ring: 2, rOut: 385, rIn: 307, gapRight: 92 },
  { ring: 3, rOut: 540, rIn: 462, gapRight: 324 },
];
const GAP_LEFT = 66;
const x = (r, g) => Math.sqrt(r * r - g * g).toFixed(1);
const halfRing = ({ rOut, rIn, gapRight }) =>
  `M-${x(rOut, GAP_LEFT)} ${-GAP_LEFT}A${rOut} ${rOut} 0 0 1 ${x(rOut, gapRight)} ${-gapRight}` +
  `L${x(rIn, gapRight)} ${-gapRight}A${rIn} ${rIn} 0 0 0 -${x(rIn, GAP_LEFT)} ${-GAP_LEFT}Z`;
const PATHS = RINGS.map((r) => ({ ...r, d: halfRing(r) }));
const ARROW = '-643,0 482,-35 362,-262 392,-262 842,0 392,262 362,262 482,35';

export function Mark({ levels, certification, size = 40, plate = true, ignite = false, className = '', label }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const pp = certification === 'PP';
  const isLit = (domain, ring) => ignite || pp || (LEVEL_RANK[levels?.[domain]] ?? 0) >= ring;
  const title = label ?? (levels
    ? `${certification ? CERTS[certification] + ' — ' : ''}${DOMAINS.DN} : ${LEVELS[levels.DN] || LEVELS.beginner}, ${DOMAINS.EA} : ${LEVELS[levels.EA] || LEVELS.beginner}`
    : 'Mouvement des Libertariens');
  let delay = 0;

  return (
    <svg viewBox="-700 -800 1600 1600" width={size} height={size} className={`shrink-0 ${className}`} role="img" aria-label={title}>
      <title>{title}</title>
      <defs>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0162af" />
          <stop offset=".45" stopColor="#0089d1" />
          <stop offset="1" stopColor="#0089d1" />
        </linearGradient>
        <linearGradient id={`f${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ee4127" />
          <stop offset=".5" stopColor="#f6911e" />
          <stop offset="1" stopColor="#ffde00" />
        </linearGradient>
        <linearGradient id={`a${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="-262" x2="0" y2="262">
          <stop offset="0" stopColor="#f7a51c" />
          <stop offset=".5" stopColor="#ffe000" />
          <stop offset="1" stopColor="#f58220" />
        </linearGradient>
      </defs>
      {plate && <circle cx="100" cy="0" r="800" fill="#14191d" />}
      {PATHS.map(({ ring, d }) =>
        ['DN', 'EA'].map((domain) => {
          const lit = isLit(domain, ring);
          const flip = domain === 'EA' ? 'scale(1,-1)' : undefined;
          const style = ignite ? { animationDelay: `${(delay += 0.18)}s` } : undefined;
          return (
            <g key={`${ring}${domain}`} transform={flip}>
              <path d={d} fill={`url(#b${uid})`} />
              {lit && <path d={d} fill={`url(#f${uid})`} className={ignite ? 'ignite' : undefined} style={style} />}
            </g>
          );
        })
      )}
      <polygon points={ARROW} fill={`url(#a${uid})`} />
    </svg>
  );
}
