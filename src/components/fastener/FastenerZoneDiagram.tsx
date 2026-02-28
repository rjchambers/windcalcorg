import { useFastenerStore } from '@/stores/fastener-store';
import { useState } from 'react';

const ZONE_COLORS = {
  '3':      { fill: 'hsl(0 72% 51% / 0.18)',   stroke: 'hsl(0 72% 51% / 0.5)',   label: 'hsl(0 72% 51%)' },
  '2':      { fill: 'hsl(38 92% 44% / 0.15)',   stroke: 'hsl(38 92% 44% / 0.4)',  label: 'hsl(38 92% 44%)' },
  '1':      { fill: 'hsl(45 93% 47% / 0.10)',   stroke: 'hsl(45 93% 47% / 0.3)',  label: 'hsl(45 93% 47% / 0.8)' },
  '1prime': { fill: 'hsl(217 91% 53% / 0.08)',  stroke: 'hsl(217 91% 53% / 0.2)', label: 'hsl(217 91% 53% / 0.6)' },
};

const FastenerZoneDiagram = () => {
  const { inputs, outputs } = useFastenerStore();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  if (!outputs) return null;

  const W = 440;
  const H = 320;
  const ox = 50; // left offset for dimension line
  const oy = 36; // top offset for dimension line
  const bldgW = W - ox - 20; // SVG pixels for building length
  const bldgH = H - oy - 24; // SVG pixels for building width

  const bL = inputs.buildingLength; // building length in ft
  const bW = inputs.buildingWidth;  // building width in ft
  const zW = outputs.zonePressures.zoneWidth_ft; // zone width in ft (0.6h)

  const scaleX = bldgW / bL;
  const scaleY = bldgH / bW;

  // Zone 1' exists only if building > 4 * zoneWidth in both directions
  const zone1primeExists = (bL > 4 * zW) && (bW > 4 * zW);

  // Convert building coords to SVG
  const r = (bx: number, by: number, bw: number, bh: number) => ({
    x: ox + bx * scaleX,
    y: oy + by * scaleY,
    w: bw * scaleX,
    h: bh * scaleY,
  });

  const zoneOpacity = (zoneKey: string) =>
    hoveredZone && hoveredZone !== zoneKey ? 0.4 : 1.0;
  const zoneStrokeWidth = (zoneKey: string) =>
    hoveredZone === zoneKey ? 2.0 : 0.5;

  const hoverProps = (zoneKey: string) => ({
    onMouseEnter: () => setHoveredZone(zoneKey),
    onMouseLeave: () => setHoveredZone(null),
    style: { cursor: 'pointer' },
  });

  // Clamp zone widths to prevent overlap
  const zwX = Math.min(zW, bL / 2);
  const zwY = Math.min(zW, bW / 2);
  const zw2X = Math.min(2 * zW, bL / 2);
  const zw2Y = Math.min(2 * zW, bW / 2);

  // Zone 1 strips (inner ring, all 4 sides)
  const zone1Strips = [
    r(zwX, zwY, bL - 2 * zwX, Math.min(zW, zw2Y - zwY)),           // top
    r(zwX, bW - zw2Y, bL - 2 * zwX, Math.min(zW, zw2Y - zwY)),     // bottom
    r(zwX, zw2Y, Math.min(zW, zw2X - zwX), bW - 2 * zw2Y),         // left
    r(bL - zw2X, zw2Y, Math.min(zW, zw2X - zwX), bW - 2 * zw2Y),   // right
  ];

  // Zone 2 strips (outer ring, all 4 sides — between corners)
  const zone2Strips = [
    r(zwX, 0, bL - 2 * zwX, zwY),           // top
    r(zwX, bW - zwY, bL - 2 * zwX, zwY),     // bottom
    r(0, zwY, zwX, bW - 2 * zwY),             // left
    r(bL - zwX, zwY, zwX, bW - 2 * zwY),     // right
  ];

  // Zone 3 corners
  const zone3Corners = [
    r(0, 0, zwX, zwY),
    r(bL - zwX, 0, zwX, zwY),
    r(0, bW - zwY, zwX, zwY),
    r(bL - zwX, bW - zwY, zwX, zwY),
  ];

  // Zone 1' field
  const z1p = zone1primeExists
    ? r(zw2X, zw2Y, bL - 4 * zW, bW - 4 * zW)
    : null;

  // Label positions
  const z1pCenter = z1p ? { x: z1p.x + z1p.w / 2, y: z1p.y + z1p.h / 2 } : null;
  const z1TopCenter = { x: ox + (bL / 2) * scaleX, y: oy + (zwY + Math.min(zW, zw2Y - zwY) / 2) * scaleY };
  const z2TopCenter = { x: ox + (bL / 2) * scaleX, y: oy + (zwY / 2) * scaleY };

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <h3 className="font-display text-sm font-semibold text-foreground mb-2">Roof Zone Plan — ASCE 7-22 Fig. 30.3-2A</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Roof zone plan view">
        <defs>
          <pattern id="fz-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(217 91% 53% / 0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#fz-grid)" />

        {/* Building outline */}
        <rect x={ox} y={oy} width={bldgW} height={bldgH} fill="none" stroke="hsl(217 91% 53% / 0.4)" strokeWidth="1.5" />

        {/* Layer 1: Zone 1' field */}
        {z1p && z1p.w > 0 && z1p.h > 0 && (
          <rect x={z1p.x} y={z1p.y} width={z1p.w} height={z1p.h}
            fill={ZONE_COLORS['1prime'].fill} stroke={ZONE_COLORS['1prime'].stroke}
            strokeWidth={zoneStrokeWidth('1prime')} strokeDasharray="4,2"
            opacity={zoneOpacity('1prime')} {...hoverProps('1prime')} />
        )}

        {/* Layer 2: Zone 1 — four strips (inner ring) */}
        {zone1Strips.map((s, i) => (
          s.w > 0 && s.h > 0 ? (
            <rect key={`z1_${i}`} x={s.x} y={s.y} width={s.w} height={s.h}
              fill={ZONE_COLORS['1'].fill} stroke={ZONE_COLORS['1'].stroke}
              strokeWidth={zoneStrokeWidth('1')}
              opacity={zoneOpacity('1')} {...hoverProps('1')} />
          ) : null
        ))}

        {/* Layer 3: Zone 2 — four perimeter strips (outer ring) */}
        {zone2Strips.map((s, i) => (
          s.w > 0 && s.h > 0 ? (
            <rect key={`z2_${i}`} x={s.x} y={s.y} width={s.w} height={s.h}
              fill={ZONE_COLORS['2'].fill} stroke={ZONE_COLORS['2'].stroke}
              strokeWidth={zoneStrokeWidth('2')}
              opacity={zoneOpacity('2')} {...hoverProps('2')} />
          ) : null
        ))}

        {/* Layer 4: Zone 3 — four corner squares (topmost) */}
        {zone3Corners.map((s, i) => (
          <rect key={`z3_${i}`} x={s.x} y={s.y} width={s.w} height={s.h}
            fill={ZONE_COLORS['3'].fill} stroke={ZONE_COLORS['3'].stroke}
            strokeWidth={zoneStrokeWidth('3')}
            opacity={zoneOpacity('3')} {...hoverProps('3')} />
        ))}

        {/* Zone labels */}
        {z1pCenter && z1p && z1p.w > 40 && z1p.h > 20 && (
          <text x={z1pCenter.x} y={z1pCenter.y + 3} textAnchor="middle"
            className="text-[10px] font-mono font-bold" fill={ZONE_COLORS['1prime'].label}
            opacity={zoneOpacity('1prime')} pointerEvents="none">
            1′ (Field)
          </text>
        )}
        {!zone1primeExists && (
          <text x={ox + bldgW / 2} y={oy + bldgH / 2 + 3} textAnchor="middle"
            className="text-[9px] font-mono" fill={ZONE_COLORS['1'].label} fontStyle="italic"
            pointerEvents="none">
            ⚠ No Zone 1′ — entire interior is Zone 1
          </text>
        )}
        <text x={z1TopCenter.x} y={z1TopCenter.y + 3} textAnchor="middle"
          className="text-[8px] font-mono font-bold" fill={ZONE_COLORS['1'].label}
          opacity={zoneOpacity('1')} pointerEvents="none">1</text>
        <text x={z2TopCenter.x} y={z2TopCenter.y + 3} textAnchor="middle"
          className="text-[9px] font-mono font-bold" fill={ZONE_COLORS['2'].label}
          opacity={zoneOpacity('2')} pointerEvents="none">Zone 2</text>
        {zone3Corners.map((s, i) => (
          s.w > 12 ? (
            <text key={`z3l_${i}`} x={s.x + s.w / 2} y={s.y + s.h / 2 + 3} textAnchor="middle"
              className="text-[7px] font-mono font-bold" fill={ZONE_COLORS['3'].label}
              opacity={zoneOpacity('3')} pointerEvents="none">3</text>
          ) : null
        ))}

        {/* Dimension: Zone 2 bracket (0 to 0.6h) */}
        <line x1={ox} y1={oy - 18} x2={ox + zwX * scaleX} y2={oy - 18}
          stroke={ZONE_COLORS['2'].stroke} strokeWidth={1} />
        <text x={ox + (zwX * scaleX) / 2} y={oy - 22} textAnchor="middle"
          className="text-[6px] font-mono" fill={ZONE_COLORS['2'].label}>{zW.toFixed(1)}′</text>

        {/* Dimension: Zone 1 bracket (0.6h to 1.2h) */}
        <line x1={ox + zwX * scaleX} y1={oy - 18} x2={ox + zw2X * scaleX} y2={oy - 18}
          stroke={ZONE_COLORS['1'].stroke} strokeWidth={1} />
        <text x={ox + ((zwX + zw2X) / 2) * scaleX} y={oy - 22} textAnchor="middle"
          className="text-[6px] font-mono" fill={ZONE_COLORS['1'].label}>{zW.toFixed(1)}′</text>

        {/* Tick marks at 0, 0.6h, 1.2h */}
        {[0, zwX * scaleX, zw2X * scaleX].map((xOff, i) => (
          <line key={`tick_${i}`} x1={ox + xOff} y1={oy - 22} x2={ox + xOff} y2={oy - 14}
            stroke={i === 0 ? ZONE_COLORS['2'].stroke : i === 1 ? ZONE_COLORS['1'].stroke : ZONE_COLORS['1prime'].stroke}
            strokeWidth={1} />
        ))}

        {/* Dimension: building length */}
        <line x1={ox} y1={H - 8} x2={ox + bldgW} y2={H - 8} stroke="hsl(215 15% 40%)" strokeWidth="0.5" />
        <text x={ox + bldgW / 2} y={H - 1} textAnchor="middle" className="text-[7px] font-mono" fill="hsl(215 15% 55%)">{bL}′ L</text>

        {/* Dimension: building width */}
        <line x1={14} y1={oy} x2={14} y2={oy + bldgH} stroke="hsl(215 15% 40%)" strokeWidth="0.5" />
        <text x={10} y={oy + bldgH / 2} textAnchor="middle" className="text-[7px] font-mono" fill="hsl(215 15% 55%)"
          transform={`rotate(-90, 10, ${oy + bldgH / 2})`}>{bW}′ W</text>

        {/* Pressure legend — ordered highest to lowest */}
        <g>
          <rect x={W - 120} y={4} width={114} height={56} rx={4}
            fill="hsl(215 19% 11%)" stroke="hsl(217 91% 53% / 0.3)" strokeWidth="0.8" />
          <rect x={W - 114} y={10} width={6} height={6} rx={1} fill={ZONE_COLORS['3'].fill} stroke={ZONE_COLORS['3'].stroke} strokeWidth={0.5} />
          <text x={W - 105} y={16} className="text-[7px] font-mono" fill={ZONE_COLORS['3'].label}>3: {Math.abs(outputs.zonePressures.zone3).toFixed(1)} psf</text>

          <rect x={W - 114} y={21} width={6} height={6} rx={1} fill={ZONE_COLORS['2'].fill} stroke={ZONE_COLORS['2'].stroke} strokeWidth={0.5} />
          <text x={W - 105} y={27} className="text-[7px] font-mono" fill={ZONE_COLORS['2'].label}>2: {Math.abs(outputs.zonePressures.zone2).toFixed(1)} psf</text>

          <rect x={W - 114} y={32} width={6} height={6} rx={1} fill={ZONE_COLORS['1'].fill} stroke={ZONE_COLORS['1'].stroke} strokeWidth={0.5} />
          <text x={W - 105} y={38} className="text-[7px] font-mono" fill={ZONE_COLORS['1'].label}>1: {Math.abs(outputs.zonePressures.zone1).toFixed(1)} psf</text>

          <rect x={W - 114} y={43} width={6} height={6} rx={1} fill={ZONE_COLORS['1prime'].fill} stroke={ZONE_COLORS['1prime'].stroke} strokeWidth={0.5} />
          <text x={W - 105} y={49} className="text-[7px] font-mono" fill={ZONE_COLORS['1prime'].label}>1′: {Math.abs(outputs.zonePressures.zone1prime).toFixed(1)} psf</text>
        </g>

        {/* Hover tooltip */}
        {hoveredZone && (
          <g>
            {(() => {
              const zoneLabel = hoveredZone === '1prime' ? "1′ (Field)" : `Zone ${hoveredZone}`;
              const pressure = hoveredZone === '1prime' ? outputs.zonePressures.zone1prime :
                hoveredZone === '1' ? outputs.zonePressures.zone1 :
                hoveredZone === '2' ? outputs.zonePressures.zone2 : outputs.zonePressures.zone3;
              const fr = outputs.fastenerResults.find(f =>
                hoveredZone === '1prime' ? f.zone === "1'" : f.zone === hoveredZone
              );
              return (
                <g>
                  <rect x={W / 2 - 70} y={H - 56} width={140} height={48} rx={4}
                    fill="hsl(215 19% 8% / 0.95)" stroke="hsl(217 91% 53% / 0.3)" strokeWidth={0.8} />
                  <text x={W / 2} y={H - 42} textAnchor="middle" className="text-[8px] font-mono font-bold" fill="hsl(215 15% 85%)">{zoneLabel}</text>
                  <text x={W / 2} y={H - 31} textAnchor="middle" className="text-[7px] font-mono" fill="hsl(215 15% 60%)">P = {Math.abs(pressure).toFixed(1)} psf</text>
                  {fr && (
                    <text x={W / 2} y={H - 20} textAnchor="middle" className="text-[7px] font-mono" fill="hsl(215 15% 60%)">
                      FS: {fr.FS_used_in}" o.c. × {fr.n_rows} rows
                    </text>
                  )}
                </g>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
};

export default FastenerZoneDiagram;
