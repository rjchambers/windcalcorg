import { useState } from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const SIMPSON_CONNECTORS = [
  { model: 'H2.5A', uplift_lb: 490, gauge: 18, notes: 'Single-sided, moderate loads. 2×4 or 2×6.' },
  { model: 'H3', uplift_lb: 585, gauge: 18, notes: 'Single-sided. Compatible with 2×4 rafters.' },
  { model: 'H1', uplift_lb: 525, gauge: 18, notes: 'Double-sided U-shape. Higher lateral capacity.' },
  { model: 'H10A', uplift_lb: 1255, gauge: 18, notes: 'Heavy duty. Single-sided with extended strap.' },
  { model: 'H6', uplift_lb: 1005, gauge: 16, notes: 'Single-sided. For 2×6 and larger framing.' },
  { model: 'MTS12', uplift_lb: 1205, gauge: 16, notes: 'Twist strap. Installs over top plate.' },
  { model: 'MTS16', uplift_lb: 1565, gauge: 16, notes: 'Twist strap. Higher capacity.' },
  { model: 'HTS20', uplift_lb: 2130, gauge: 14, notes: 'Heavy twist strap. Large trusses.' },
  { model: 'HTS24', uplift_lb: 2505, gauge: 14, notes: 'Max capacity twist strap.' },
  { model: 'MGT', uplift_lb: 5200, gauge: 12, notes: 'Girder tiedown. Multi-ply trusses.' },
];

const ConnectorReference = ({ uplift_lb }: { uplift_lb: number }) => {
  const [open, setOpen] = useState(false);

  const candidates = SIMPSON_CONNECTORS
    .filter(c => c.uplift_lb >= uplift_lb)
    .sort((a, b) => a.uplift_lb - b.uplift_lb)
    .slice(0, 3);

  const exceeds = candidates.length === 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-muted/20 transition-colors">
        <span className="text-xs font-semibold text-foreground">Connector Reference (Simpson Strong-Tie)</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="rounded-b-lg border border-t-0 border-border bg-card p-4 space-y-3">
        <p className="text-[10px] text-muted-foreground">
          Required load: <span className="text-foreground font-mono font-bold">{uplift_lb.toLocaleString()} lb</span> (worst-case net uplift)
        </p>

        {exceeds ? (
          <div className="flex items-start gap-2 rounded border border-destructive/30 bg-destructive/5 p-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">
              Uplift exceeds single connector capacity. Consider multiple connectors per Simpson F-C-HWG23, or girder tiedowns.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Connector</th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Capacity</th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Margin</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => {
                  const margin = ((c.uplift_lb - uplift_lb) / uplift_lb * 100).toFixed(0);
                  return (
                    <tr key={c.model} className="border-b border-border/50">
                      <td className="px-3 py-2 font-mono font-bold text-foreground">{c.model}</td>
                      <td className="px-3 py-2 text-right font-mono text-foreground">{c.uplift_lb.toLocaleString()} lb</td>
                      <td className="px-3 py-2 text-right font-mono text-compression">+{margin}%</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-[9px] text-muted-foreground leading-relaxed border-t border-border pt-2">
          This reference is provided for planning purposes only. Connector selection must be verified by the Engineer of Record against project-specific framing, fastener schedules, and combined load conditions per ESR-2613. Use of these values does not constitute an engineering recommendation.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ConnectorReference;
