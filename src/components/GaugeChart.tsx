import { useMemo } from 'react';

interface Props {
  label: string;
  value: number;
  target?: number;
  size?: number;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export default function GaugeChart({ label, value, target = 95, size = 160 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const strokeW = size * 0.09;

  // Semicircle: -210° to 30° (240° sweep) mapped to 0-100
  const START = -210;
  const SWEEP = 240;

  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  const toDeg = (pct: number) => START + (clamp(pct) / 100) * SWEEP;

  const fillDeg = toDeg(value);
  const targetDeg = toDeg(target);

  const isGood = value >= target;
  const fillColor = isGood ? '#22c55e' : '#f59e0b';
  const trackColor = '#e5e7eb';

  const targetPt = useMemo(() => polarToXY(cx, cy, r, targetDeg), [cx, cy, r, targetDeg]);

  const displayVal = Math.round(value);

  return (
    <div style={{ textAlign: 'center', width: size }}>
      <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`} overflow="visible">
        {/* Track */}
        <path
          d={describeArc(cx, cy, r, START, START + SWEEP)}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* Fill */}
        {value > 0 && (
          <path
            d={describeArc(cx, cy, r, START, fillDeg)}
            fill="none"
            stroke={fillColor}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        )}
        {/* Target tick */}
        <line
          x1={targetPt.x - (strokeW * 0.6 * Math.cos(((targetDeg - 90) * Math.PI) / 180))}
          y1={targetPt.y - (strokeW * 0.6 * Math.sin(((targetDeg - 90) * Math.PI) / 180))}
          x2={targetPt.x + (strokeW * 0.6 * Math.cos(((targetDeg - 90) * Math.PI) / 180))}
          y2={targetPt.y + (strokeW * 0.6 * Math.sin(((targetDeg - 90) * Math.PI) / 180))}
          stroke="#ef4444"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Value label */}
        <text
          x={cx}
          y={cy + size * 0.04}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.19}
          fontWeight="700"
          fill={fillColor}
        >
          {displayVal}%
        </text>
      </svg>
      <div
        style={{
          fontSize: size * 0.085,
          fontWeight: 600,
          color: '#374151',
          marginTop: -size * 0.04,
          lineHeight: 1.3,
          padding: '0 4px',
        }}
      >
        {label}
      </div>
    </div>
  );
}
