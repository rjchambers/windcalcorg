import { useMemo } from 'react';
import { useCalculationStore } from '@/stores/calculation-store';

/**
 * Interactive SVG cross-section that reacts to calculator inputs/outputs.
 * Shows roof shape, zone bands (1, 1E, 2E, 3E), truss lines, dimension callouts,
 * wind arrows, and overhang — all driven by the Zustand store.
 */
const InteractiveBuildingDiagram = () => {
  const { inputs, outputs } = useCalculationStore();

  // ----- Layout constants (SVG user-space) -----
  const W = 520;
  const H = 340;
  const groundY = 280;
  const margin = { left: 60, right: 60 };

  // Proportional mapping — keep building centred
  const maxBuildingPx = W - margin.left - margin.right; // max pixel width for building
  const scale = useMemo(() => {
    const longestDim = Math.max(inputs.buildingWidth, inputs.buildingLength, 30);
    return Math.min(maxBuildingPx / longestDim, 12);
  }, [inputs.buildingWidth, inputs.buildingLength, maxBuildingPx]);

  const bldgPxW = inputs.buildingWidth * scale;
  const bldgLeft = (W - bldgPxW) / 2;
  const bldgRight = bldgLeft + bldgPxW;

  const wallH = Math.max(30, Math.min(inputs.h * scale * 0.6, 120));
  const eaveY = groundY - wallH;

  // Roof rise from pitch
  const pitchRad = (inputs.pitchDegrees * Math.PI) / 180;
  const roofRise = Math.min((bldgPxW / 2) * Math.tan(pitchRad), 100);
  const ridgeY = eaveY - roofRise;
  const ridgeX = W / 2;

  // Zone a in px
  const zoneAPx = outputs ? outputs.zone_a_ft * scale : 0;
  const zone2aPx = zoneAPx * 2;

  // Overhang
  const ohPx = inputs.hasOverhang ? inputs.overhangWidth * scale : 0;

  // Truss positions
  const trusses = useMemo(() => {
    const spacingPx = inputs.trussSpacing * scale;
    const positions: number[] = [];
    if (spacingPx < 4) return positions;
    let x = bldgLeft + spacingPx;
    while (x < bldgRight - 2) {
      positions.push(x);
      x += spacingPx;
    }
    return positions;
  }, [inputs.trussSpacing, scale, bldgLeft, bldgRight]);

  // Roof Y at a given X
  const roofYAt = (x: number) => {
    if (x <= ridgeX) {
      const t = (x - (bldgLeft - ohPx)) / (ridgeX - (bldgLeft - ohPx));
      return eaveY - t * roofRise;
    }
    const t = (x - ridgeX) / ((bldgRight + ohPx) - ridgeX);
    return ridgeY + t * roofRise;
  };

  // Helpers for dimension lines
  const DimLine = ({ x1, y1, x2, y2, label, offset = 'left' }: {
    x1: number; y1: number; x2: number; y2: number; label: string; offset?: 'left' | 'right' | 'bottom';
  }) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const isVert = Math.abs(x2 - x1) < 2;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(215 15% 40%)" strokeWidth="0.5" strokeDasharray="3,3" />
        <line x1={x1 - 2} y1={y1} x2={x1 + 2} y2={y1} stroke="hsl(215 15% 40%)" strokeWidth="0.5" />
        <line x1={x2 - 2} y1={y2} x2={x2 + 2} y2={y2} stroke="hsl(215 15% 40%)" strokeWidth="0.5" />
        {isVert ? (
          <text
            x={offset === 'left' ? mx - 8 : mx + 8}
            y={my}
            textAnchor="middle"
            className="text-[7px] font-mono"
            fill="hsl(215 15% 55%)"
            transform={`rotate(-90, ${offset === 'left' ? mx - 8 : mx + 8}, ${my})`}
          >
            {label}
          </text>
        ) : (
          <text x={mx} y={my + (offset === 'bottom' ? 12 : -5)} textAnchor="middle" className="text-[7px] font-mono" fill="hsl(215 15% 55%)">
            {label}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <h3 className="font-display text-sm font-semibold text-foreground mb-2">Building Cross-Section</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Interactive building cross-section with wind zones">
        <defs>
          <pattern id="calc-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(217 91% 53% / 0.04)" strokeWidth="0.5" />
          </pattern>
          <marker id="arr-red" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="hsl(0 72% 51%)" />
          </marker>
          <marker id="arr-blue" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="hsl(217 91% 53%)" />
          </marker>
          <marker id="arr-dim" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <circle cx="2" cy="2" r="1.5" fill="hsl(215 15% 40%)" />
          </marker>
        </defs>

        <rect width={W} height={H} fill="url(#calc-grid)" />

        {/* Ground */}
        <line x1={30} y1={groundY} x2={W - 30} y2={groundY} stroke="hsl(215 13% 28%)" strokeWidth="1.5" />
        <g opacity={0.4}>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={50 + i * 38} y1={groundY} x2={42 + i * 38} y2={groundY + 8} stroke="hsl(215 13% 28%)" strokeWidth="0.8" />
          ))}
        </g>

        {/* Building walls */}
        <rect
          x={bldgLeft} y={eaveY} width={bldgPxW} height={wallH}
          fill="hsl(215 19% 12%)" stroke="hsl(217 91% 53% / 0.35)" strokeWidth="1.2"
        />

        {/* Roof polygon */}
        <polygon
          points={`${bldgLeft - ohPx},${eaveY} ${ridgeX},${ridgeY} ${bldgRight + ohPx},${eaveY}`}
          fill="hsl(215 19% 15%)" stroke="hsl(217 91% 53% / 0.5)" strokeWidth="1.2"
        />

        {/* Zone bands — edge (2E) */}
        {zoneAPx > 0 && (
          <>
            {/* Left 2a zone band */}
            <polygon
              points={`${bldgLeft - ohPx},${eaveY} ${bldgLeft - ohPx + zone2aPx},${roofYAt(bldgLeft - ohPx + zone2aPx)} ${bldgLeft - ohPx + zone2aPx},${eaveY}`}
              fill="hsl(38 92% 44% / 0.12)" stroke="hsl(38 92% 44% / 0.3)" strokeWidth="0.5" strokeDasharray="4,2"
            />
            <text
              x={bldgLeft - ohPx + zone2aPx / 2} y={eaveY - 6}
              textAnchor="middle" className="text-[8px] font-mono font-bold" fill="hsl(38 92% 44%)"
            >2E</text>

            {/* Right 2a zone band */}
            <polygon
              points={`${bldgRight + ohPx},${eaveY} ${bldgRight + ohPx - zone2aPx},${roofYAt(bldgRight + ohPx - zone2aPx)} ${bldgRight + ohPx - zone2aPx},${eaveY}`}
              fill="hsl(38 92% 44% / 0.12)" stroke="hsl(38 92% 44% / 0.3)" strokeWidth="0.5" strokeDasharray="4,2"
            />
            <text
              x={bldgRight + ohPx - zone2aPx / 2} y={eaveY - 6}
              textAnchor="middle" className="text-[8px] font-mono font-bold" fill="hsl(38 92% 44%)"
            >2E</text>
          </>
        )}

        {/* Zone 1 interior label */}
        <text x={ridgeX} y={(ridgeY + eaveY) / 2 + 4} textAnchor="middle" className="text-[9px] font-mono font-bold" fill="hsl(217 91% 53% / 0.7)">
          Zone 1
        </text>

        {/* Zone 3E at ridge */}
        {roofRise > 15 && (
          <>
            <line x1={ridgeX - 12} y1={ridgeY + 2} x2={ridgeX + 12} y2={ridgeY + 2} stroke="hsl(0 72% 51% / 0.4)" strokeWidth="1" strokeDasharray="3,2" />
            <text x={ridgeX} y={ridgeY - 4} textAnchor="middle" className="text-[7px] font-mono font-bold" fill="hsl(0 72% 51% / 0.7)">3E</text>
          </>
        )}

        {/* Overhang markers */}
        {ohPx > 2 && (
          <>
            <line x1={bldgLeft} y1={eaveY} x2={bldgLeft - ohPx} y2={eaveY} stroke="hsl(217 91% 53% / 0.25)" strokeWidth="0.8" strokeDasharray="2,2" />
            <line x1={bldgRight} y1={eaveY} x2={bldgRight + ohPx} y2={eaveY} stroke="hsl(217 91% 53% / 0.25)" strokeWidth="0.8" strokeDasharray="2,2" />
            {/* OH dimension */}
            <text x={bldgLeft - ohPx / 2} y={eaveY + 12} textAnchor="middle" className="text-[6px] font-mono" fill="hsl(215 15% 55%)">
              OH {inputs.overhangWidth}'
            </text>
            <text x={bldgRight + ohPx / 2} y={eaveY + 12} textAnchor="middle" className="text-[6px] font-mono" fill="hsl(215 15% 55%)">
              OH {inputs.overhangWidth}'
            </text>
          </>
        )}

        {/* Truss lines */}
        {trusses.map((x, i) => (
          <g key={i} opacity={0.25}>
            <line x1={x} y1={eaveY} x2={x} y2={groundY} stroke="hsl(217 91% 53%)" strokeWidth="0.5" />
            <line x1={x} y1={eaveY} x2={ridgeX} y2={ridgeY} stroke="hsl(217 91% 53%)" strokeWidth="0.3" strokeDasharray="2,3" />
          </g>
        ))}

        {/* Wind arrows */}
        <g opacity={0.65}>
          {[0, 1, 2].map(i => {
            const y = eaveY - roofRise * 0.2 + i * (wallH * 0.35);
            return <line key={i} x1={18} y1={y} x2={bldgLeft - ohPx - 8} y2={y} stroke="hsl(0 72% 51%)" strokeWidth="1.5" markerEnd="url(#arr-red)" />;
          })}
          <text x={18} y={eaveY - roofRise * 0.2 - 8} className="text-[8px] font-mono font-bold" fill="hsl(0 72% 51%)">
            V={inputs.V} mph
          </text>
        </g>

        {/* Uplift arrows on roof */}
        <g opacity={0.5}>
          {[-0.3, 0, 0.3].map((offset, i) => {
            const x = ridgeX + offset * bldgPxW * 0.4;
            const yBase = roofYAt(x);
            return <line key={i} x1={x} y1={yBase - 2} x2={x} y2={yBase - 18} stroke="hsl(0 72% 51%)" strokeWidth="1" markerEnd="url(#arr-red)" />;
          })}
          <text x={ridgeX} y={ridgeY - 22} textAnchor="middle" className="text-[7px] font-mono" fill="hsl(0 72% 51% / 0.8)">uplift</text>
        </g>

        {/* Pitch angle arc */}
        {roofRise > 8 && (
          <g>
            <path
              d={`M ${bldgLeft + 28} ${eaveY} A 28 28 0 0 1 ${bldgLeft + 28 - 8} ${eaveY - 14}`}
              fill="none" stroke="hsl(142 76% 36%)" strokeWidth="0.8"
            />
            <text x={bldgLeft + 36} y={eaveY - 6} className="text-[7px] font-mono" fill="hsl(142 76% 36%)">
              θ={inputs.pitchDegrees}°
            </text>
          </g>
        )}

        {/* Dimension: h */}
        <DimLine x1={bldgLeft - ohPx - 18} y1={groundY} x2={bldgLeft - ohPx - 18} y2={eaveY} label={`h=${inputs.h}'`} offset="left" />

        {/* Dimension: building width */}
        <DimLine x1={bldgLeft} y1={groundY + 14} x2={bldgRight} y2={groundY + 14} label={`W=${inputs.buildingWidth}'`} offset="bottom" />

        {/* Dimension: zone a */}
        {zoneAPx > 8 && (
          <>
            <line x1={bldgLeft - ohPx} y1={eaveY - roofRise - 16} x2={bldgLeft - ohPx + zone2aPx} y2={eaveY - roofRise - 16}
              stroke="hsl(38 92% 44% / 0.5)" strokeWidth="0.6" markerEnd="url(#arr-dim)" />
            <text x={bldgLeft - ohPx + zone2aPx / 2} y={eaveY - roofRise - 20} textAnchor="middle"
              className="text-[6px] font-mono" fill="hsl(38 92% 44%)">2a={outputs?.zone_2a_width_ft}'</text>
          </>
        )}

        {/* qh callout */}
        {outputs && (
          <g>
            <rect x={W - 130} y={8} width={120} height={40} rx={4} fill="hsl(215 19% 11%)" stroke="hsl(217 91% 53% / 0.3)" strokeWidth="0.8" />
            <text x={W - 120} y={24} className="text-[7px] font-mono" fill="hsl(215 15% 55%)">
              qh = {outputs.qh.toFixed(2)} psf
            </text>
            <text x={W - 120} y={38} className="text-[7px] font-mono" fill="hsl(215 15% 55%)">
              Kz = {outputs.Kz} · Exp {inputs.exposureCategory}
            </text>
          </g>
        )}

        {/* Critical net uplift badge */}
        {outputs && (
          <g>
            <rect x={W - 130} y={54} width={120} height={22} rx={4} fill="hsl(0 72% 51% / 0.1)" stroke="hsl(0 72% 51% / 0.3)" strokeWidth="0.5" />
            <text x={W - 120} y={68} className="text-[7px] font-mono font-bold" fill="hsl(0 72% 51%)">
              Max Uplift: {outputs.max_net_uplift_lb} lb
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default InteractiveBuildingDiagram;
