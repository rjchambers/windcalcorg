import { useFastenerStore } from '@/stores/fastener-store';
import { useMemo } from 'react';

const FastenerZoneDiagram = () => {
  const { inputs, outputs } = useFastenerStore();
  if (!outputs) return null;

  const W = 420;
  const H = 300;
  const pad = 40;
  const bldgW = W - pad * 2;
  const bldgH = H - pad * 2;

  const zw = outputs.zonePressures.zoneWidth_ft;
  const scaleX = bldgW / inputs.buildingLength;
  const scaleY = bldgH / inputs.buildingWidth;
  const zwPxX = Math.min(zw * scaleX, bldgW / 2);
  const zwPxY = Math.min(zw * scaleY, bldgH / 2);

  const bx = pad;
  const by = pad;

  const zone3Color = 'hsl(0 72% 51% / 0.15)';
  const zone2Color = 'hsl(38 92% 44% / 0.15)';
  const zone1Color = 'hsl(38 92% 44% / 0.08)';
  const zone1pColor = 'hsl(217 91% 53% / 0.08)';

  // Check if Zone 1' exists
  const hasField = (inputs.buildingLength - 2 * zw > 0) && (inputs.buildingWidth - 2 * zw > 0);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <h3 className="font-display text-sm font-semibold text-foreground mb-2">Roof Zone Plan</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Roof zone plan view">
        <defs>
          <pattern id="fz-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(217 91% 53% / 0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#fz-grid)" />

        {/* Building outline */}
        <rect x={bx} y={by} width={bldgW} height={bldgH} fill="none" stroke="hsl(217 91% 53% / 0.4)" strokeWidth="1.5" />

        {/* Zone 1' field (if exists) */}
        {hasField && (
          <rect
            x={bx + zwPxX} y={by + zwPxY}
            width={bldgW - 2 * zwPxX} height={bldgH - 2 * zwPxY}
            fill={zone1pColor} stroke="hsl(217 91% 53% / 0.2)" strokeWidth="0.5" strokeDasharray="4,2"
          />
        )}

        {/* Zone 2 perimeter strips — top */}
        <rect x={bx + zwPxX} y={by} width={bldgW - 2 * zwPxX} height={zwPxY} fill={zone2Color} />
        {/* bottom */}
        <rect x={bx + zwPxX} y={by + bldgH - zwPxY} width={bldgW - 2 * zwPxX} height={zwPxY} fill={zone2Color} />
        {/* left */}
        <rect x={bx} y={by + zwPxY} width={zwPxX} height={bldgH - 2 * zwPxY} fill={zone1Color} />
        {/* right */}
        <rect x={bx + bldgW - zwPxX} y={by + zwPxY} width={zwPxX} height={bldgH - 2 * zwPxY} fill={zone1Color} />

        {/* Zone 3 corners (L-shaped) */}
        {/* Top-left */}
        <rect x={bx} y={by} width={zwPxX} height={zwPxY} fill={zone3Color} />
        {/* Top-right */}
        <rect x={bx + bldgW - zwPxX} y={by} width={zwPxX} height={zwPxY} fill={zone3Color} />
        {/* Bottom-left */}
        <rect x={bx} y={by + bldgH - zwPxY} width={zwPxX} height={zwPxY} fill={zone3Color} />
        {/* Bottom-right */}
        <rect x={bx + bldgW - zwPxX} y={by + bldgH - zwPxY} width={zwPxX} height={zwPxY} fill={zone3Color} />

        {/* Zone labels */}
        {hasField && (
          <text x={W / 2} y={H / 2} textAnchor="middle" className="text-[9px] font-mono font-bold" fill="hsl(217 91% 53% / 0.6)">
            1' (Field)
          </text>
        )}
        <text x={W / 2} y={by + zwPxY / 2 + 3} textAnchor="middle" className="text-[8px] font-mono font-bold" fill="hsl(38 92% 44%)">Zone 2</text>
        <text x={bx + zwPxX / 2} y={by + zwPxY / 2 + 3} textAnchor="middle" className="text-[7px] font-mono font-bold" fill="hsl(0 72% 51%)">3</text>
        <text x={bx + bldgW - zwPxX / 2} y={by + zwPxY / 2 + 3} textAnchor="middle" className="text-[7px] font-mono font-bold" fill="hsl(0 72% 51%)">3</text>
        <text x={bx + zwPxX / 2} y={by + bldgH - zwPxY / 2 + 3} textAnchor="middle" className="text-[7px] font-mono font-bold" fill="hsl(0 72% 51%)">3</text>
        <text x={bx + bldgW - zwPxX / 2} y={by + bldgH - zwPxY / 2 + 3} textAnchor="middle" className="text-[7px] font-mono font-bold" fill="hsl(0 72% 51%)">3</text>

        {/* Zone 1 side labels */}
        <text x={bx + zwPxX / 2} y={H / 2 + 3} textAnchor="middle" className="text-[8px] font-mono font-bold" fill="hsl(38 92% 44% / 0.7)">1</text>
        <text x={bx + bldgW - zwPxX / 2} y={H / 2 + 3} textAnchor="middle" className="text-[8px] font-mono font-bold" fill="hsl(38 92% 44% / 0.7)">1</text>

        {/* Dimension: building length */}
        <line x1={bx} y1={H - 10} x2={bx + bldgW} y2={H - 10} stroke="hsl(215 15% 40%)" strokeWidth="0.5" />
        <text x={W / 2} y={H - 3} textAnchor="middle" className="text-[7px] font-mono" fill="hsl(215 15% 55%)">{inputs.buildingLength}' L</text>

        {/* Dimension: building width */}
        <line x1={10} y1={by} x2={10} y2={by + bldgH} stroke="hsl(215 15% 40%)" strokeWidth="0.5" />
        <text x={6} y={H / 2} textAnchor="middle" className="text-[7px] font-mono" fill="hsl(215 15% 55%)" transform={`rotate(-90, 6, ${H / 2})`}>{inputs.buildingWidth}' W</text>

        {/* Zone width dimension */}
        <line x1={bx} y1={by - 6} x2={bx + zwPxX} y2={by - 6} stroke="hsl(38 92% 44% / 0.5)" strokeWidth="0.5" />
        <text x={bx + zwPxX / 2} y={by - 10} textAnchor="middle" className="text-[6px] font-mono" fill="hsl(38 92% 44%)">{zw}'</text>

        {/* Pressure callouts */}
        <g>
          <rect x={W - 115} y={6} width={108} height={52} rx={4} fill="hsl(215 19% 11%)" stroke="hsl(217 91% 53% / 0.3)" strokeWidth="0.8" />
          <text x={W - 108} y={18} className="text-[7px] font-mono" fill="hsl(215 15% 55%)">1': {Math.abs(outputs.zonePressures.zone1prime).toFixed(1)} psf</text>
          <text x={W - 108} y={28} className="text-[7px] font-mono" fill="hsl(215 15% 55%)">1: {Math.abs(outputs.zonePressures.zone1).toFixed(1)} psf</text>
          <text x={W - 108} y={38} className="text-[7px] font-mono" fill="hsl(38 92% 44%)">2: {Math.abs(outputs.zonePressures.zone2).toFixed(1)} psf</text>
          <text x={W - 108} y={48} className="text-[7px] font-mono" fill="hsl(0 72% 51%)">3: {Math.abs(outputs.zonePressures.zone3).toFixed(1)} psf</text>
        </g>
      </svg>
    </div>
  );
};

export default FastenerZoneDiagram;
