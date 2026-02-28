import { type CalculationOutputs } from '@/lib/calculation-engine';
import { useCalculationStore } from '@/stores/calculation-store';
import { AlertTriangle, AlertCircle, Info, ArrowDown, ArrowUp } from 'lucide-react';
import InteractiveBuildingDiagram from './InteractiveBuildingDiagram';

const ResultsPanel = ({ outputs }: { outputs: CalculationOutputs }) => {
  const { inputs } = useCalculationStore();

  return (
    <div className="space-y-6 p-6">
      {/* Interactive Diagram */}
      <InteractiveBuildingDiagram />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard label="qh" value={`${outputs.qh.toFixed(2)}`} unit="psf" />
        <SummaryCard label="Zone a" value={`${outputs.zone_a_ft.toFixed(2)}`} unit="ft" />
        <SummaryCard
          label="Max Uplift"
          value={`${outputs.max_net_uplift_lb}`}
          unit="lb"
          variant="destructive"
        />
        <SummaryCard
          label="Min Uplift"
          value={`${outputs.min_net_uplift_lb}`}
          unit="lb"
          variant={outputs.min_net_uplift_lb >= 0 ? 'success' : 'destructive'}
        />
      </div>

      {/* Kz info */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Velocity Pressure Derivation</h3>
        <div className="font-mono text-xs text-muted-foreground space-y-1">
          <p>K<sub>z</sub> = {outputs.Kz} (Exp {inputs.exposureCategory}, h = {inputs.h} ft)</p>
          <p>q<sub>h</sub> = 0.00256 × {outputs.Kz} × {inputs.Kzt} × {inputs.Kd} × {inputs.Ke} × {inputs.V}²</p>
          <p className="text-foreground font-semibold">q<sub>h</sub> = {outputs.qh.toFixed(2)} psf</p>
        </div>
      </div>

      {/* Zone Pressure Summary */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Zone Pressures</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {outputs.zone_results.map((z) => (
            <div key={z.zone} className="rounded border border-border bg-background p-3">
              <span className={`font-mono text-xs font-bold ${z.zone.includes('E') ? 'text-zone-edge' : 'text-primary'}`}>
                Zone {z.zone}
              </span>
              <div className="mt-1 font-mono text-sm font-bold text-uplift">
                {z.p_psf.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">psf</span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                GCpf={z.GCpf.toFixed(3)} GCpi={z.GCpi.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overhang breakdown */}
      {outputs.overhang && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3">Overhang Breakdown</h3>
          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div>
              <span className="text-muted-foreground">p_top</span>
              <div className="text-foreground">{outputs.overhang.p_top_psf} psf</div>
            </div>
            <div>
              <span className="text-muted-foreground">p_soffit</span>
              <div className="text-foreground">{outputs.overhang.p_soffit_psf} psf</div>
            </div>
            <div>
              <span className="text-muted-foreground">p_net</span>
              <div className="text-uplift font-bold">{outputs.overhang.p_net_psf} psf</div>
            </div>
            <div>
              <span className="text-muted-foreground">Area</span>
              <div className="text-foreground">{outputs.overhang.area_ft2} ft²</div>
            </div>
            <div>
              <span className="text-muted-foreground">Wind Force</span>
              <div className="text-uplift">{outputs.overhang.F_oh_wind_lb} lb</div>
            </div>
            <div>
              <span className="text-muted-foreground">Net OH</span>
              <div className="text-uplift font-bold">{outputs.overhang.net_OH_lb} lb</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-card p-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Span Results — {inputs.designBasis}
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {inputs.roofType.charAt(0).toUpperCase() + inputs.roofType.slice(1)} · θ={inputs.pitchDegrees}°
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-mono font-semibold text-muted-foreground">Span (ft)</th>
                <th className="px-3 py-2 text-left font-mono font-semibold text-muted-foreground">Zone</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Trib (ft²)</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">p (psf)</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Wind (lb)</th>
                {outputs.overhang && (
                  <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">OH (lb)</th>
                )}
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">DL (lb)</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-foreground">Net (lb)</th>
              </tr>
            </thead>
            <tbody>
              {outputs.span_results.map((r, i) => (
                <tr
                  key={`${r.zone}-${r.span_ft}`}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${
                    r.zone === '2E' ? 'bg-warning/5' : ''
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-foreground">{r.span_ft}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      r.zone === '2E' ? 'bg-warning/10 text-zone-edge' : 'bg-primary/10 text-primary'
                    }`}>
                      {r.zone}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{r.trib_area_ft2.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right font-mono text-uplift">{r.p_psf.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-uplift">{r.main_wind_force_lb}</td>
                  {outputs.overhang && (
                    <td className="px-3 py-2 text-right font-mono text-uplift">{r.oh_wind_force_lb}</td>
                  )}
                  <td className="px-3 py-2 text-right font-mono text-compression">{r.total_dl_lb}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold">
                    <span className={`inline-flex items-center gap-1 ${r.net_uplift_lb < 0 ? 'text-uplift' : 'text-compression'}`}>
                      {r.net_uplift_lb < 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {Math.abs(r.net_uplift_lb)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warnings */}
      {outputs.warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-display text-sm font-semibold text-foreground">Warnings & Compliance</h3>
          {outputs.warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
                w.level === 'error'
                  ? 'border-destructive/30 bg-destructive/5 text-destructive'
                  : w.level === 'warning'
                  ? 'border-warning/30 bg-warning/5 text-warning'
                  : 'border-primary/30 bg-primary/5 text-primary'
              }`}
            >
              {w.level === 'error' ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> :
               w.level === 'warning' ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> :
               <Info className="h-4 w-4 shrink-0 mt-0.5" />}
              <div>
                <p>{w.message}</p>
                {w.reference && <p className="mt-1 font-mono opacity-70">{w.reference}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        HVHZ Calc Pro provides calculations as a design aid based on ASCE 7-22 Chapter 28 Envelope Procedure.
        All results must be reviewed and approved by a licensed Professional Engineer. Engineer of Record assumes full responsibility.
      </p>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  unit,
  variant = 'default',
}: {
  label: string;
  value: string;
  unit: string;
  variant?: 'default' | 'destructive' | 'success';
}) => (
  <div className="rounded-lg border border-border bg-card p-3 animate-count-up">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <div className="mt-1 flex items-baseline gap-1">
      <span className={`font-mono text-xl font-bold ${
        variant === 'destructive' ? 'text-uplift' :
        variant === 'success' ? 'text-compression' :
        'text-foreground'
      }`}>
        {value}
      </span>
      <span className="font-mono text-xs text-muted-foreground">{unit}</span>
    </div>
  </div>
);

export default ResultsPanel;
