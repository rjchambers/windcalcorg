import { useFastenerStore } from '@/stores/fastener-store';
import { AlertTriangle, AlertCircle, Info, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { FastenerOutputs } from '@/lib/fastener-engine';
import FastenerZoneDiagram from './FastenerZoneDiagram';

const FastenerResults = () => {
  const { inputs, outputs, tas105Outputs } = useFastenerStore();
  if (!outputs) return <div className="flex h-full items-center justify-center text-muted-foreground">Enter parameters to see results</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Zone Diagram */}
      <FastenerZoneDiagram />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <SummaryCard label="qh (ASD)" value={`${outputs.qh_ASD.toFixed(2)}`} unit="psf" />
        <SummaryCard label="Zone 3" value={`${outputs.zonePressures.zone3.toFixed(1)}`} unit="psf" variant="destructive" />
        <SummaryCard label="Max Extrap" value={`${outputs.maxExtrapolationFactor}×`} unit="" variant={outputs.maxExtrapolationFactor > 3 ? 'destructive' : outputs.maxExtrapolationFactor > 1 ? 'warning' : 'default'} />
        <SummaryCard label="Min FS" value={`${outputs.minFS_in}`} unit="in" variant={outputs.minFS_in < 6 ? 'destructive' : 'default'} />
        <SummaryCard label="Status" value={outputs.overallStatus === 'ok' ? '✅ OK' : outputs.overallStatus === 'warning' ? '⚠️' : '🔴 FAIL'} unit="" variant={outputs.overallStatus === 'fail' ? 'destructive' : outputs.overallStatus === 'warning' ? 'warning' : 'success'} />
      </div>

      {/* Velocity Pressure Derivation */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Velocity Pressure Derivation (ASD)</h3>
        <div className="font-mono text-xs text-muted-foreground space-y-1">
          <p>Kh = {outputs.Kh} (Exp {inputs.exposureCategory}, h = {inputs.h} ft)</p>
          <p>qh_ASD = 0.00256 × {outputs.Kh} × {inputs.Kzt} × {inputs.Ke} × {inputs.V}² × 0.6</p>
          <p className="text-foreground font-semibold">qh_ASD = {outputs.qh_ASD.toFixed(2)} psf</p>
        </div>
      </div>

      {/* Zone Pressure Table */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Zone Pressures (C&C)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-mono font-semibold text-muted-foreground">Zone</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">P (psf)</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Width (ft)</th>
                <th className="px-3 py-2 text-center font-mono font-semibold text-muted-foreground">MDP Check</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Extrap.</th>
              </tr>
            </thead>
            <tbody>
              {outputs.fastenerResults.map((r, i) => (
                <tr key={r.zone} className={`border-b border-border/50 ${i % 2 ? 'bg-muted/10' : ''}`}>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      r.zone === '3' ? 'bg-destructive/10 text-destructive' :
                      r.zone === '2' ? 'bg-warning/10 text-zone-edge' :
                      'bg-primary/10 text-primary'
                    }`}>{r.zone === "1'" ? "1' (Field)" : `Zone ${r.zone}`}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-uplift">{r.P_psf.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{outputs.zonePressures.zoneWidth_ft}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-[10px] font-mono font-bold ${
                      r.noaCheck === 'prescriptive' ? 'text-compression' :
                      r.noaCheck === 'enhanced' ? 'text-zone-edge' : 'text-destructive'
                    }`}>
                      {r.noaCheck === 'prescriptive' ? '✅ ≤ MDP' :
                       r.noaCheck === 'enhanced' ? '⚠️ Enhanced' : '🔴 Fail'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{r.extrapolationFactor > 1 ? `${r.extrapolationFactor}×` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fastener Pattern Results */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-card p-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">Fastener Pattern Results — RAS {inputs.systemType === 'single_ply' ? '137' : '117'}</h3>
          <span className="text-xs text-muted-foreground font-mono">Fy = {inputs.Fy_lbf} lbf</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-mono font-semibold text-muted-foreground">Zone</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">P (psf)</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">n Rows</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">RS (in)</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">FS Calc</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-foreground">FS Used</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">D/R</th>
                <th className="px-3 py-2 text-center font-mono font-semibold text-muted-foreground">½ Sheet</th>
              </tr>
            </thead>
            <tbody>
              {outputs.fastenerResults.map((r, i) => (
                <tr key={r.zone} className={`border-b border-border/50 ${i % 2 ? 'bg-muted/10' : ''}`}>
                  <td className="px-3 py-2 font-mono font-bold text-foreground">{r.zone === "1'" ? "1'" : r.zone}</td>
                  <td className="px-3 py-2 text-right font-mono text-uplift">{r.P_psf.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right font-mono">{r.n_rows}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{r.RS_in}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{r.FS_calculated_in}"</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-foreground">{r.FS_used_in}"</td>
                  <td className="px-3 py-2 text-right">
                    <DemandBar ratio={r.demandRatio} />
                  </td>
                  <td className="px-3 py-2 text-center font-mono">{r.halfSheetRequired ? '⚠️' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pattern Summary Card */}
      <PatternSummaryCard outputs={outputs} inputs={inputs} />

      {/* Insulation Board Results */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Insulation Board Fasteners (RAS 117 §8)</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {outputs.insulationResults.map(r => (
            <div key={r.zone} className="rounded border border-border bg-background p-3 text-center">
              <span className="font-mono text-[10px] text-muted-foreground">Zone {r.zone}</span>
              <div className="font-mono text-xl font-bold text-foreground mt-1">{r.N_used}</div>
              <div className="text-[10px] text-muted-foreground">{r.layout}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TAS 105 Results */}
      {tas105Outputs && (
        <div className={`rounded-lg border p-4 ${tas105Outputs.pass ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
          <h3 className="font-display text-sm font-semibold text-foreground mb-3">TAS 105 Results</h3>
          <div className="grid grid-cols-5 gap-3 font-mono text-xs text-center">
            <div><span className="text-muted-foreground block">n</span><span className="font-bold">{tas105Outputs.n}</span></div>
            <div><span className="text-muted-foreground block">X̄</span><span className="font-bold">{tas105Outputs.mean_lbf}</span></div>
            <div><span className="text-muted-foreground block">σ</span><span className="font-bold">{tas105Outputs.stdDev_lbf}</span></div>
            <div><span className="text-muted-foreground block">t</span><span className="font-bold">{tas105Outputs.tFactor}</span></div>
            <div><span className="text-muted-foreground block">MCRF</span><span className={`font-bold ${tas105Outputs.pass ? 'text-compression' : 'text-destructive'}`}>{tas105Outputs.MCRF_lbf}</span></div>
          </div>
          <div className={`mt-3 text-center text-sm font-bold ${tas105Outputs.pass ? 'text-compression' : 'text-destructive'}`}>
            {tas105Outputs.pass ? '✅ PASS — MCRF ≥ 275 lbf' : '🔴 FAIL — MCRF < 275 lbf. TAS 126 moisture survey required.'}
          </div>
        </div>
      )}

      {/* Tile Results */}
      {outputs.tileResults && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3">Tile Calculation (RAS 127 Method {inputs.tileMethod})</h3>
          {outputs.tileResults.map(tr => (
            <div key={tr.zone} className={`flex items-center gap-3 rounded p-2 mb-1 text-xs font-mono ${tr.pass ? 'bg-success/5' : 'bg-destructive/5'}`}>
              <span className="font-bold">Zone {tr.zone}:</span>
              {tr.Mr_required !== undefined && <span>Mr = {tr.Mr_required} ft-lbf | Mf = {tr.Mf_NOA} ft-lbf</span>}
              {tr.Fr_required !== undefined && <span>Fr = {tr.Fr_required} lbf | F' = {tr.Fprime_NOA} lbf</span>}
              <span className={`ml-auto font-bold ${tr.pass ? 'text-compression' : 'text-destructive'}`}>{tr.pass ? '✅ PASS' : '🔴 FAIL'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {outputs.warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-display text-sm font-semibold text-foreground">Warnings & Compliance</h3>
          {outputs.warnings.map((w, i) => (
            <div key={i} className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
              w.level === 'error' ? 'border-destructive/30 bg-destructive/5 text-destructive' :
              w.level === 'warning' ? 'border-warning/30 bg-warning/5 text-warning' :
              'border-primary/30 bg-primary/5 text-primary'
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

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        FastenerCalc HVHZ provides calculations as a design aid based on FBC 8th Edition, ASCE 7-22, and Florida Test Protocols (RAS 117, 127, 128, 137, TAS 105).
        All results must be reviewed and approved by a licensed PE. Engineer of Record assumes full responsibility.
      </p>
    </div>
  );
};

// ─── Sub-components ───

const SummaryCard = ({ label, value, unit, variant = 'default' }: {
  label: string; value: string; unit: string; variant?: 'default' | 'destructive' | 'success' | 'warning';
}) => (
  <div className="rounded-lg border border-border bg-card p-3">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <div className="mt-1 flex items-baseline gap-1">
      <span className={`font-mono text-lg font-bold ${
        variant === 'destructive' ? 'text-uplift' :
        variant === 'success' ? 'text-compression' :
        variant === 'warning' ? 'text-zone-edge' :
        'text-foreground'
      }`}>{value}</span>
      {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
    </div>
  </div>
);

const DemandBar = ({ ratio }: { ratio: number }) => {
  const pct = Math.min(ratio * 100, 100);
  const color = ratio > 0.95 ? 'bg-destructive' : ratio > 0.75 ? 'bg-warning' : 'bg-success';
  return (
    <div className="flex items-center gap-1">
      <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[10px]">{(ratio * 100).toFixed(0)}%</span>
    </div>
  );
};

const PatternSummaryCard = ({ outputs, inputs }: { outputs: FastenerOutputs; inputs: any }) => {
  const [copied, setCopied] = useState(false);

  const text = outputs.fastenerResults.map(r =>
    `Zone ${r.zone}: ${r.FS_used_in}" o.c. at ${inputs.lapWidth_in}" lap + ${r.FS_used_in}" o.c. at ${r.n_rows - 1} rows${r.halfSheetRequired ? ' [HALF SHEET]' : ''}`
  ).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Fastener Pattern Summary — Permit Ready
        </h3>
        <button onClick={handleCopy} className="flex items-center gap-1 rounded border border-primary/30 px-2 py-1 text-[10px] text-primary hover:bg-primary/10">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">{text}</pre>
    </div>
  );
};

export default FastenerResults;
