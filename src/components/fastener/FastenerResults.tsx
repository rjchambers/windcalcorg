import { useFastenerStore } from '@/stores/fastener-store';
import { AlertTriangle, AlertCircle, Info, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { FastenerOutputs, FastenerInputs, NOAParams, NOAZoneResult } from '@/lib/fastener-engine';
import FastenerZoneDiagram from './FastenerZoneDiagram';

const FastenerResults = () => {
  const { inputs, outputs, tas105Outputs } = useFastenerStore();
  if (!outputs) return <div className="flex h-full items-center justify-center text-muted-foreground">Enter parameters to see results</div>;

  return (
    <div className="space-y-6 p-6">
      <FastenerZoneDiagram />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <SummaryCard label="qh (ASD)" value={`${outputs.qh_ASD.toFixed(2)}`} unit="psf" />
        <SummaryCard label="Zone 3" value={`${outputs.zonePressures.zone3.toFixed(1)}`} unit="psf" variant="destructive" />
        <SummaryCard
          label="Zone 3 Extrap"
          value={`${outputs.maxExtrapolationFactor}×`}
          unit="of 3.0×"
          variant={outputs.maxExtrapolationFactor > 3 ? 'destructive' : outputs.maxExtrapolationFactor > 2 ? 'warning' : 'default'}
        />
        <SummaryCard label="Min FS" value={`${outputs.minFS_in}`} unit="in" variant={outputs.minFS_in < 6 ? 'destructive' : 'default'} />
        <NOAMDPCard noa={inputs.noa} noaResults={outputs.noaResults} />
      </div>

      {/* Velocity Pressure Derivation */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Velocity Pressure Derivation (ASD)</h3>
        <div className="font-mono text-xs text-muted-foreground space-y-1">
          <p>Kh = {outputs.Kh} (Exp {inputs.exposureCategory}, h = {inputs.h} ft)</p>
          <p>qh_ASD = 0.00256 × {outputs.Kh} × {inputs.Kzt} × {inputs.Kd} × {inputs.Ke} × {inputs.V}² × 0.6</p>
          <p className="text-foreground font-semibold">qh_ASD = {outputs.qh_ASD.toFixed(2)} psf</p>
        </div>
      </div>

      {/* Zone Pressure Table with Attachment Basis */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Zone Pressures & Attachment Basis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-mono font-semibold text-muted-foreground">Zone</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">P (psf)</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Width (ft)</th>
                <th className="px-3 py-2 text-center font-mono font-semibold text-muted-foreground">Attachment Basis</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Extrap Factor</th>
              </tr>
            </thead>
            <tbody>
              {outputs.fastenerResults.map((r, i) => {
                const noa = r.noaCheck;
                return (
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
                      <AttachmentBasisBadge basis={noa.basis} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <ExtrapFactorBar factor={noa.extrapFactor} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 space-y-1 text-[10px] text-muted-foreground">
          <p>📋 <span className="text-blue-400">NOA Prescriptive</span> — Zone pressure within NOA MDP. Use published pattern.</p>
          <p>🔩 <span className="text-amber-400">RAS 117 Rational</span> — Enhanced spacing calculated per RAS 117-20 §10.4.5.</p>
        </div>
      </div>

      {/* Fastener Pattern Results */}
      {outputs.fastenerResults.length === 0 && inputs.systemType === 'adhered' ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <h3 className="font-display text-sm font-semibold text-foreground mb-2">Adhered Membrane System</h3>
          <p className="text-xs text-muted-foreground">
            Mechanical fastener spacing does not apply. Verify NOA adhesive bond value (psf) ≥ zone pressure for all zones. See zone pressure table above.
          </p>
        </div>
      ) : (
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-card p-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">Fastener Pattern Results — RAS {inputs.systemType === 'single_ply' ? '137' : '117'}</h3>
          <span className="text-xs text-muted-foreground font-mono">
            Fy = {inputs.Fy_lbf} lbf ({inputs.fySource === 'tas105' ? 'TAS 105' : 'NOA'})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-mono font-semibold text-muted-foreground">Zone</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">P (psf)</th>
                <th className="px-3 py-2 text-center font-mono font-semibold text-muted-foreground">Basis</th>
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
                  <td className="px-3 py-2 text-center">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      r.noaCheck.basis === 'prescriptive' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {r.noaCheck.basis === 'prescriptive' ? 'NOA' : inputs.systemType === 'single_ply' ? 'RAS 137' : 'RAS 117'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{r.n_rows}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{r.RS_in}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{r.FS_calculated_in}"</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-foreground">{r.FS_used_in}"</td>
                  <td className="px-3 py-2 text-right"><DemandBar ratio={r.demandRatio} /></td>
                  <td className="px-3 py-2 text-center font-mono">{r.halfSheetRequired ? '⚠️' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

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
          <div className="font-mono text-xs text-muted-foreground mt-2">
            MCRF = {tas105Outputs.mean_lbf} − ({tas105Outputs.tFactor} × {tas105Outputs.stdDev_lbf}) = {tas105Outputs.MCRF_lbf} lbf
          </div>
          <div className={`mt-3 text-center text-sm font-bold ${tas105Outputs.pass ? 'text-compression' : 'text-destructive'}`}>
            {tas105Outputs.pass ? '✅ PASS — MCRF ≥ 275 lbf' : '🔴 FAIL — MCRF < 275 lbf. TAS 126 moisture survey required.'}
          </div>
          {!tas105Outputs.pass && (
            <div className="mt-3 rounded border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
              <p className="font-bold">⛔ TAS 105 FAILURE — Permit Cannot Be Issued</p>
              <p>1. Perform moisture survey per TAS 126 on existing deck</p>
              <p>2. Submit TAS 126 results with deck examination findings to AHJ</p>
              <p>3. Provide deck repair/replacement specification</p>
              <p>4. Re-test after repair; re-submit with updated TAS 105 results</p>
            </div>
          )}
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
        FastenerCalc HVHZ provides calculations as a design aid based on FBC 8th Edition, ASCE 7-22, and Florida Test Protocols (RAS 117, 128, 137, TAS 105).
        All results must be reviewed and approved by a licensed PE. Engineer of Record assumes full responsibility.
      </p>
    </div>
  );
};

// ─── Sub-components ───

const AttachmentBasisBadge = ({ basis }: { basis: string }) => {
  switch (basis) {
    case 'prescriptive':
      return <span className="text-[10px] font-mono font-bold text-blue-400">📋 NOA Prescriptive</span>;
    case 'rational_analysis':
      return <span className="text-[10px] font-mono font-bold text-amber-400">🔩 RAS 117 Rational</span>;
    case 'exceeds_300pct':
      return <span className="text-[10px] font-mono font-bold text-orange-400">⚠️ Exceeds 300%</span>;
    case 'asterisked_fail':
      return <span className="text-[10px] font-mono font-bold text-destructive">🔴 Asterisked Fail</span>;
    default:
      return null;
  }
};

const ExtrapFactorBar = ({ factor }: { factor: number }) => {
  const pct = Math.min((factor / 3.0) * 100, 100);
  const color = factor > 3.0 ? 'bg-destructive' : factor > 2.7 ? 'bg-orange-500' : factor > 2.0 ? 'bg-amber-500' : 'bg-muted-foreground/30';
  const textColor = factor > 3.0 ? 'text-destructive' : factor > 2.7 ? 'text-orange-400' : factor > 2.0 ? 'text-amber-400' : 'text-muted-foreground';
  return (
    <div className="flex items-center gap-1">
      <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`font-mono text-[10px] ${textColor}`}>{factor.toFixed(2)}×</span>
    </div>
  );
};

const NOAMDPCard = ({ noa, noaResults }: { noa: NOAParams; noaResults: NOAZoneResult[] }) => {
  const worstBasis = noaResults.some(r => r.blocksCalculation) ? 'destructive' :
    noaResults.some(r => r.basis === 'rational_analysis') ? 'warning' : 'success';
  return (
    <div className={`rounded-lg border p-3 ${
      worstBasis === 'destructive' ? 'border-destructive/30' :
      worstBasis === 'warning' ? 'border-amber-500/30' : 'border-success/30'
    }`}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">NOA MDP</span>
      <div className="mt-1 font-mono text-lg font-bold text-foreground">{Math.abs(noa.mdp_psf)} psf</div>
      {noa.approvalNumber && <div className="font-mono text-[10px] text-muted-foreground">{noa.approvalNumber}</div>}
    </div>
  );
};

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

const PatternSummaryCard = ({ outputs, inputs }: { outputs: FastenerOutputs; inputs: FastenerInputs }) => {
  const [copied, setCopied] = useState(false);

  const text = outputs.fastenerResults.map(r => {
    const basis = r.noaCheck.basis === 'prescriptive' ? '(NOA)' : '(RAS 117)';
    return `Zone ${r.zone}: ${r.FS_used_in}" o.c. at ${inputs.lapWidth_in}" lap + ${r.FS_used_in}" o.c. at ${r.n_rows - 1} rows ${basis}${r.halfSheetRequired ? ' [HALF SHEET]' : ''}`;
  }).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold text-foreground">Fastener Pattern Summary — Permit Ready</h3>
        <button onClick={handleCopy} className="flex items-center gap-1 rounded border border-primary/30 px-2 py-1 text-[10px] text-primary hover:bg-primary/10">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {inputs.noa.approvalNumber && (
        <p className="font-mono text-[10px] text-muted-foreground mb-2">
          NOA: {inputs.noa.approvalNumber} | MDP: {Math.abs(inputs.noa.mdp_psf)} psf
        </p>
      )}
      <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">{text}</pre>
    </div>
  );
};

export default FastenerResults;
