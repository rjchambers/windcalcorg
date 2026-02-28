const BuildingDiagram = () => (
  <div className="relative">
    <svg viewBox="0 0 400 300" className="w-full" aria-label="Building cross-section with wind zones">
      {/* Grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(217 91% 53% / 0.06)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#grid)" />

      {/* Ground */}
      <line x1="40" y1="240" x2="360" y2="240" stroke="hsl(215 13% 30%)" strokeWidth="2" />

      {/* Building walls */}
      <rect
        x="80" y="160" width="240" height="80"
        fill="hsl(215 19% 13%)" stroke="hsl(217 91% 53% / 0.4)" strokeWidth="1.5"
        className="animate-draw-in"
        style={{ strokeDasharray: 1000, animationDelay: '0.2s' }}
      />

      {/* Roof - hip shape */}
      <polygon
        points="60,160 200,90 340,160"
        fill="hsl(215 19% 16%)" stroke="hsl(217 91% 53% / 0.6)" strokeWidth="1.5"
        className="animate-draw-in"
        style={{ strokeDasharray: 1000, animationDelay: '0.5s' }}
      />

      {/* Zone 2E bands */}
      <rect x="60" y="125" width="50" height="35" fill="hsl(38 92% 44% / 0.15)" rx="2"
        className="animate-draw-in" style={{ strokeDasharray: 1000, animationDelay: '0.8s' }}
      />
      <rect x="290" y="125" width="50" height="35" fill="hsl(38 92% 44% / 0.15)" rx="2"
        className="animate-draw-in" style={{ strokeDasharray: 1000, animationDelay: '0.8s' }}
      />

      {/* Zone 1 interior */}
      <rect x="115" y="120" width="170" height="40" fill="hsl(217 91% 53% / 0.08)" rx="2"
        className="animate-draw-in" style={{ strokeDasharray: 1000, animationDelay: '1s' }}
      />

      {/* Labels */}
      <text x="200" y="145" textAnchor="middle" className="fill-primary text-[10px] font-mono font-bold" opacity="0.8">Zone 1</text>
      <text x="82" y="148" textAnchor="middle" className="text-[9px] font-mono font-bold" fill="hsl(38 92% 44%)" opacity="0.8">2E</text>
      <text x="318" y="148" textAnchor="middle" className="text-[9px] font-mono font-bold" fill="hsl(38 92% 44%)" opacity="0.8">2E</text>

      {/* Dimension lines */}
      <line x1="45" y1="160" x2="45" y2="240" stroke="hsl(215 15% 40%)" strokeWidth="0.5" strokeDasharray="3,3" />
      <text x="38" y="205" textAnchor="middle" className="text-[8px] font-mono" fill="hsl(215 15% 50%)" transform="rotate(-90, 38, 205)">h_eave</text>

      <line x1="355" y1="90" x2="355" y2="240" stroke="hsl(215 15% 40%)" strokeWidth="0.5" strokeDasharray="3,3" />
      <text x="370" y="170" textAnchor="middle" className="text-[8px] font-mono" fill="hsl(215 15% 50%)" transform="rotate(-90, 370, 170)">h_ridge</text>

      {/* Wind arrow */}
      <g opacity="0.7">
        <line x1="15" y1="140" x2="50" y2="140" stroke="hsl(0 72% 51%)" strokeWidth="2" markerEnd="url(#arrowRed)" />
        <line x1="15" y1="160" x2="50" y2="160" stroke="hsl(0 72% 51%)" strokeWidth="2" markerEnd="url(#arrowRed)" />
        <line x1="15" y1="180" x2="50" y2="180" stroke="hsl(0 72% 51%)" strokeWidth="2" markerEnd="url(#arrowRed)" />
        <text x="15" y="130" className="text-[9px] font-mono font-bold" fill="hsl(0 72% 51%)">V (mph)</text>
      </g>

      {/* Uplift arrows on roof */}
      <g opacity="0.6">
        <line x1="150" y1="130" x2="150" y2="105" stroke="hsl(0 72% 51%)" strokeWidth="1.5" markerEnd="url(#arrowRed)" />
        <line x1="200" y1="115" x2="200" y2="90" stroke="hsl(0 72% 51%)" strokeWidth="1.5" markerEnd="url(#arrowRed)" />
        <line x1="250" y1="130" x2="250" y2="105" stroke="hsl(0 72% 51%)" strokeWidth="1.5" markerEnd="url(#arrowRed)" />
      </g>

      {/* Pitch angle */}
      <path d="M 110 160 A 30 30 0 0 1 130 145" fill="none" stroke="hsl(142 76% 36%)" strokeWidth="1" />
      <text x="135" y="157" className="text-[8px] font-mono" fill="hsl(142 76% 36%)">θ</text>

      {/* Arrow marker defs */}
      <defs>
        <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="hsl(0 72% 51%)" />
        </marker>
      </defs>
    </svg>
  </div>
);

export default BuildingDiagram;
