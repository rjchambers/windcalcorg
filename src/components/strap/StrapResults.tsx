import { useStrapStore } from '@/stores/strap-store';
import { AlertTriangle, AlertCircle, Info, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const StrapResults = () => {
  const { inputs, outputs } = useStrapStore();
  const [copied, setCopied] = useState(false);

  if (!outputs) return <div className="flex h-full items-center justify-center text-muted-foreground">Enter parameters to see results</div>;

  const zone3 = outputs.zoneResults[2];
  const governingConnector = zone3?.selectedConnector?.model ?? 'N/A';

  const handleCopySchedule = () => {
    const header = 'Location\tQty\tModel\tCapacity (lbs)\tFL Approval\tNotes';
    const rows = outputs.connectorSchedule.map(r =>
      `${r.location}\t${r.quantity}\t${r.connectorModel}\t${r.upliftCapacity_lbs}\t${r.flApproval}\t${r.notes}`
    );
    navigator.clipboard.writeText([header, ...rows].join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard label="Zone 1 T_req" value={`${outputs.zoneResults[0]?.governingValue_lbs ?? 0}`} unit="lbs" />
        <SummaryCard label="Zone 3E T_req" value={`${zone3?.governingValue_lbs ?? 0}`} unit="lbs" variant={(zone3?.governingValue_lbs ?? 0) > 1000 ? 'destructive' : 'default'} />
        <SummaryCard label="Governing" value={governingConnector} unit="" />
        <div className={`rounded-lg border p-3 ${
          outputs.overallStatus === 'ok' ? 'border-green-500/30 bg-green-500/5' :
          outputs.overallStatus === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
          'border-destructive/30 bg-destructive/5'
        }`}>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</span>
          <div className={`mt-1 font-mono text-lg font-bold ${
            outputs.overallStatus === 'ok' ? 'text-green-500' :
            outputs.overallStatus === 'warning' ? 'text-amber-500' :
            'text-destructive'
          }`}>
            {outputs.overallStatus === 'ok' ? '✓ OK' : outputs.overallStatus === 'warning' ? '⚠ WARN' : '✗ FAIL'}
          </div>
        </div>
      </div>

      {/* Zone-by-Zone Results */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-card p-3">
          <h3 className="font-display text-sm font-semibold text-foreground">Zone-by-Zone Connector Selection</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left font-mono font-semibold text-muted-foreground">Zone</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">T_total</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">T_req/Strap</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Code Min</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Governing</th>
                <th className="px-3 py-2 text-center font-mono font-semibold text-muted-foreground">Connector</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Capacity</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Fast/End</th>
                <th className="px-3 py-2 text-center font-mono font-semibold text-muted-foreground">Pass</th>
              </tr>
            </thead>
            <tbody>
              {[...outputs.zoneResults, ...(outputs.hipGirderResult ? [outputs.hipGirderResult] : [])].map((r, i) => (
                <tr key={r.zone} className={`border-b border-border/50 ${i % 2 ? 'bg-muted/10' : ''}`}>
                  <td className="px-3 py-2 font-mono font-bold text-foreground">{r.zone}</td>
                  <td className="px-3 py-2 text-right font-mono">{r.T_total_lbs}</td>
                  <td className="px-3 py-2 text-right font-mono">{r.T_required_lbs}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{r.codeMinimum_lbs}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold">{r.governingValue_lbs}</td>
                  <td className="px-3 py-2 text-center font-mono font-bold text-primary">{r.selectedConnector?.model ?? '—'}</td>
                  <td className="px-3 py-2 text-right font-mono">{r.selectedConnector?.upliftCapacity_lbs ?? '—'}</td>
                  <td className="px-3 py-2 text-right font-mono">{r.fastenersRequired || '—'}</td>
                  <td className="px-3 py-2 text-center">{r.pass ? <span className="text-green-500 font-bold">✓</span> : <span className="text-destructive font-bold">✗</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connector Schedule */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 overflow-hidden">
        <div className="border-b border-primary/20 p-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">Connector Schedule — Permit Ready</h3>
          <button onClick={handleCopySchedule} className="flex items-center gap-1 rounded border border-primary/30 px-2 py-1 text-[10px] text-primary hover:bg-primary/10">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy Schedule'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-primary/20 bg-primary/5">
                <th className="px-3 py-2 text-left font-mono font-semibold text-muted-foreground">Location</th>
                <th className="px-3 py-2 text-left font-mono font-semibold text-muted-foreground">Qty</th>
                <th className="px-3 py-2 text-center font-mono font-semibold text-muted-foreground">Model</th>
                <th className="px-3 py-2 text-right font-mono font-semibold text-muted-foreground">Capacity</th>
                <th className="px-3 py-2 text-center font-mono font-semibold text-muted-foreground">FL Approval</th>
                <th className="px-3 py-2 text-left font-mono font-semibold text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {outputs.connectorSchedule.map((r, i) => (
                <tr key={r.location} className={`border-b border-primary/10 ${i % 2 ? 'bg-primary/5' : ''}`}>
                  <td className="px-3 py-2 font-mono font-bold text-foreground">{r.location}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{r.quantity}</td>
                  <td className="px-3 py-2 text-center font-mono font-bold text-primary">{r.connectorModel}</td>
                  <td className="px-3 py-2 text-right font-mono">{r.upliftCapacity_lbs} lbs</td>
                  <td className="px-3 py-2 text-center font-mono text-muted-foreground">{r.flApproval}</td>
                  <td className="px-3 py-2 text-muted-foreground text-[10px]">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alternate Connectors */}
      {outputs.zoneResults.filter(r => r.alternateConnectors.length > 0).map(r => (
        <Collapsible key={r.zone}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-xs font-mono text-muted-foreground hover:bg-muted/20">
            <span>Alternates for {r.zone}</span>
            <span className="text-[10px]">▼</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-1">
            {r.alternateConnectors.map(c => (
              <div key={c.model} className="rounded border border-border bg-card p-2 text-xs flex items-center justify-between">
                <span className="font-mono font-bold text-foreground">{c.model}</span>
                <span className="font-mono text-muted-foreground">{c.upliftCapacity_lbs} lbs · {c.fastenersPerEnd} fast/end · {c.flApprovalNumber}</span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}

      {/* Stud-to-Plate Flag */}
      {outputs.zoneResults.some(r => r.studToPlateRequired) && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-600">
          <p className="font-semibold">⚠ FBC §R802.11: Stud-to-plate connectors (min 500 lbs) required where accessible. Typically Simpson SP4 or equivalent.</p>
        </div>
      )}

      {/* Warnings */}
      {outputs.warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-display text-sm font-semibold text-foreground">Warnings & Compliance</h3>
          {outputs.warnings.map((w, i) => (
            <div key={i} className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
              w.level === 'error' ? 'border-destructive/30 bg-destructive/5 text-destructive' :
              w.level === 'warning' ? 'border-amber-500/30 bg-amber-500/5 text-amber-600' :
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
        Strap Calculator provides connector selections as a design aid based on FBC 8th Edition §R802.11 and manufacturer FL Product Approvals. 
        All connectors shall be installed per manufacturer's instructions. Engineer of Record assumes full responsibility.
      </p>
    </div>
  );
};

const SummaryCard = ({ label, value, unit, variant = 'default' }: {
  label: string; value: string; unit: string; variant?: 'default' | 'destructive';
}) => (
  <div className="rounded-lg border border-border bg-card p-3">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <div className="mt-1 flex items-baseline gap-1">
      <span className={`font-mono text-lg font-bold ${variant === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>{value}</span>
      {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
    </div>
  </div>
);

export default StrapResults;
