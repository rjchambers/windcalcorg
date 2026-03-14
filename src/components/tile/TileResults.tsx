import { useTileStore } from '@/stores/tile-store';
import { AlertTriangle, AlertCircle, Info, Check, X } from 'lucide-react';

const TileResults = () => {
  const { inputs, outputs } = useTileStore();
  if (!outputs) return <div className="flex h-full items-center justify-center text-muted-foreground">Enter parameters to see results</div>;

  const isMoment = inputs.method === 'moment';

  return (
    <div className="space-y-6 p-6">
      {/* Status Banner */}
      <div className={`rounded-lg border p-4 text-center ${
        outputs.overallPasses
          ? outputs.requiresPESeal
            ? 'border-warning/30 bg-warning/5'
            : 'border-compression/30 bg-compression/5'
          : 'border-destructive/30 bg-destructive/5'
      }`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          {outputs.overallPasses ? <Check className="h-5 w-5 text-compression" /> : <X className="h-5 w-5 text-destructive" />}
          <span className={`font-display text-lg font-bold ${outputs.overallPasses ? 'text-compression' : 'text-destructive'}`}>
            {outputs.overallPasses ? (outputs.requiresPESeal ? 'PASS — PE Seal Required' : 'PASS') : 'FAIL'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {outputs.overallPasses
            ? 'Tile attachment acceptable per RAS 127'
            : 'Attachment resistance insufficient — select higher-rated product'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Slope Band</span>
          <div className="font-mono text-lg font-bold text-foreground mt-1">{inputs.pitchRise}:12</div>
          <div className="text-[10px] text-muted-foreground">{outputs.pitchDegrees}° — {outputs.slopeBand}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Critical Zone</span>
          <div className="font-mono text-lg font-bold text-uplift mt-1">{outputs.criticalZone}</div>
          <div className="text-[10px] text-muted-foreground">Ratio: {outputs.criticalDemandRatio}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Method</span>
          <div className="font-mono text-lg font-bold text-primary mt-1">{isMoment ? 'Moment' : 'Uplift'}</div>
          <div className="text-[10px] text-muted-foreground">RAS 127 §{isMoment ? '2' : '3'}</div>
        </div>
      </div>

      {/* Zone Pressure Table */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Zone Pressures</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Zone</th>
                <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Pasd (psf)</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Source</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Field (1)', p: outputs.zonePressures.Pasd1 },
                { label: 'Perimeter (2)', p: outputs.zonePressures.Pasd2 },
                { label: 'Corner (3)', p: outputs.zonePressures.Pasd3 },
              ].map(z => (
                <tr key={z.label} className="border-b border-border/50">
                  <td className="px-3 py-2 font-mono font-bold text-foreground">{z.label}</td>
                  <td className="px-3 py-2 text-right font-mono text-uplift">{z.p} psf</td>
                  <td className="px-3 py-2 text-muted-foreground text-[10px]">{outputs.zonePressures.tableSource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attachment Check Table */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">
          {isMoment ? 'Moment Check (Method 1)' : 'Uplift Check (Method 3)'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Zone</th>
                <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{isMoment ? 'Mr (ft-lb)' : 'Fr (lbf)'}</th>
                <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{isMoment ? 'Mf (ft-lb)' : "F' (lbf)"}</th>
                <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Ratio</th>
                <th className="px-3 py-2 text-center font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {isMoment ? outputs.momentResults?.map(r => (
                <tr key={r.zone} className={`border-b border-border/50 ${!r.passes ? 'bg-destructive/5' : ''}`}>
                  <td className="px-3 py-2 font-mono font-bold text-foreground">{r.zone}</td>
                  <td className="px-3 py-2 text-right font-mono text-uplift">{r.Mr_ftlb}</td>
                  <td className="px-3 py-2 text-right font-mono text-compression">{r.Mf_ftlb}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">{r.demandRatio}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${r.passes ? 'bg-compression/10 text-compression' : 'bg-destructive/10 text-destructive'}`}>
                      {r.passes ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              )) : outputs.upliftResults?.map(r => (
                <tr key={r.zone} className={`border-b border-border/50 ${!r.passes ? 'bg-destructive/5' : ''}`}>
                  <td className="px-3 py-2 font-mono font-bold text-foreground">{r.zone}</td>
                  <td className="px-3 py-2 text-right font-mono text-uplift">{r.Fr_lbf}</td>
                  <td className="px-3 py-2 text-right font-mono text-compression">{r.F_prime_lbf}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">{r.demandRatio}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${r.passes ? 'bg-compression/10 text-compression' : 'bg-destructive/10 text-destructive'}`}>
                      {r.passes ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Derivation */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Derivation</h3>
        <div className="font-mono text-[10px] text-muted-foreground space-y-1">
          {isMoment ? (
            <>
              <p className="font-semibold text-foreground">Method 1 — Moment Based per RAS 127 §2.5:</p>
              <p>Mr = Pasd × λ − Mg</p>
              {outputs.momentResults?.map(r => (
                <p key={r.zone}>{r.zone}: Mr = {Math.abs(r.Pasd)} × {inputs.lambda} − {inputs.Mg_ftlb} = {r.Mr_ftlb} ft-lb → {r.passes ? 'PASS' : 'FAIL'} (ratio = {r.demandRatio})</p>
              ))}
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">Method 3 — Uplift Based per RAS 127 §3.4:</p>
              <p>Fr = [(Pasd × l × w) − W] × cos θ</p>
              {outputs.upliftResults?.map(r => (
                <p key={r.zone}>{r.zone}: Fr = {r.Fr_lbf} lbf → {r.passes ? 'PASS' : 'FAIL'} (ratio = {r.demandRatio})</p>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Warnings */}
      {outputs.warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-display text-sm font-semibold text-foreground">Warnings & Compliance</h3>
          {outputs.warnings.map((w, i) => (
            <div key={i} className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
              w.level === 'error' ? 'border-destructive/30 bg-destructive/5 text-destructive'
              : w.level === 'warning' ? 'border-warning/30 bg-warning/5 text-warning'
              : 'border-primary/30 bg-primary/5 text-primary'
            }`}>
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
        Calculations prepared per RAS 127-20. All results must be reviewed and approved by a licensed Professional Engineer. Engineer of Record assumes full responsibility.
      </p>
    </div>
  );
};

export default TileResults;
