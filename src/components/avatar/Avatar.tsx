import { motion, useReducedMotion } from 'framer-motion';
import type { Zone } from '../../types';

export interface ZoneMeta {
  id: Zone;
  label: string;
  hint: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export const ZONES: ZoneMeta[] = [
  { id: 'head', label: 'Head — beliefs & thoughts', hint: 'Beliefs', cx: 100, cy: 34, rx: 30, ry: 30 },
  { id: 'mouth', label: 'Mouth — voice & language', hint: 'Voice', cx: 100, cy: 62, rx: 16, ry: 9 },
  { id: 'chest', label: 'Chest — emotions', hint: 'Emotions', cx: 100, cy: 128, rx: 34, ry: 34 },
  { id: 'hands', label: 'Hands — actions', hint: 'Actions', cx: 100, cy: 196, rx: 78, ry: 18 },
  { id: 'feet', label: 'Feet — habits & grounding', hint: 'Habits', cx: 100, cy: 296, rx: 46, ry: 16 },
];

interface AvatarProps {
  /** number of traits equipped per zone (drives glow) */
  zoneCounts: Partial<Record<Zone, number>>;
  /** overall emotion energy 0..1 (drives chest aura) */
  emotionEnergy?: number;
  selectedZone?: Zone | null;
  onZoneClick?: (z: Zone) => void;
  className?: string;
}

export default function Avatar({ zoneCounts, emotionEnergy = 0, selectedZone, onZoneClick, className }: AvatarProps) {
  const reduced = useReducedMotion();
  return (
    <svg
      viewBox="0 0 200 330"
      className={className}
      role="group"
      aria-label="Persona avatar with five body zones"
    >
      {/* silhouette */}
      <g fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeWidth="1.5">
        {/* head */}
        <circle cx="100" cy="38" r="26" />
        {/* neck */}
        <rect x="93" y="62" width="14" height="12" rx="4" />
        {/* torso */}
        <path d="M68 76 Q100 68 132 76 L138 170 Q100 182 62 170 Z" />
        {/* arms */}
        <path d="M68 80 Q46 96 40 150 Q38 172 34 188 L52 194 Q60 168 64 140 Z" />
        <path d="M132 80 Q154 96 160 150 Q162 172 166 188 L148 194 Q140 168 136 140 Z" />
        {/* hands */}
        <circle cx="42" cy="198" r="11" />
        <circle cx="158" cy="198" r="11" />
        {/* legs */}
        <path d="M72 172 L68 280 L88 282 L94 180 Z" />
        <path d="M128 172 L132 280 L112 282 L106 180 Z" />
        {/* feet */}
        <ellipse cx="74" cy="292" rx="18" ry="9" />
        <ellipse cx="126" cy="292" rx="18" ry="9" />
        {/* mouth line */}
        <path d="M92 56 Q100 62 108 56" fill="none" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* chest emotion aura */}
      {emotionEnergy > 0 && (
        <motion.circle
          cx="100"
          cy="128"
          r={30 + emotionEnergy * 14}
          fill="var(--color-glow)"
          opacity={0.25}
          animate={reduced ? undefined : { scale: [1, 1.08, 1], opacity: [0.22, 0.32, 0.22] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 128px' }}
          pointerEvents="none"
        />
      )}

      {/* interactive zones */}
      {ZONES.map((z) => {
        const count = zoneCounts[z.id] ?? 0;
        const selected = selectedZone === z.id;
        return (
          <g key={z.id}>
            {count > 0 && (
              <motion.ellipse
                cx={z.cx}
                cy={z.cy}
                rx={z.rx + 4}
                ry={z.ry + 4}
                fill="var(--color-accent)"
                initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 0.18 + Math.min(count, 4) * 0.07, scale: 1 }}
                style={{ transformOrigin: `${z.cx}px ${z.cy}px` }}
                pointerEvents="none"
              />
            )}
            <motion.ellipse
              cx={z.cx}
              cy={z.cy}
              rx={z.rx}
              ry={z.ry}
              fill="transparent"
              stroke={selected ? 'var(--color-accent)' : 'transparent'}
              strokeWidth="2.5"
              strokeDasharray={selected ? undefined : '4 4'}
              role="button"
              tabIndex={0}
              aria-label={`${z.label}${count ? ` — ${count} equipped` : ''}`}
              aria-pressed={selected}
              className="cursor-pointer focus:outline-none [&:focus-visible]:stroke-[var(--color-glow)] [&:hover]:stroke-[var(--color-accent)]"
              whileHover={reduced ? undefined : { scale: 1.06 }}
              style={{ transformOrigin: `${z.cx}px ${z.cy}px` }}
              onClick={() => onZoneClick?.(z.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onZoneClick?.(z.id);
                }
              }}
            />
            {count > 0 && (
              <g pointerEvents="none">
                <circle cx={z.cx + z.rx - 2} cy={z.cy - z.ry + 2} r="9" fill="var(--color-accent)" />
                <text
                  x={z.cx + z.rx - 2}
                  y={z.cy - z.ry + 5.5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="white"
                >
                  {count}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
