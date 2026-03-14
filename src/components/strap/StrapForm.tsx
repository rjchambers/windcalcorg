import { useStrapStore } from '@/stores/strap-store';
import { useCalculationStore } from '@/stores/calculation-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Info, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import type { WallType } from '@/lib/connector-database';

const FieldLabel = ({ label, ref_text }: { label: string; ref_text?: string }) => (
  <div className="flex items-center gap-1.5">
    <Label className="text-xs font-medium text-foreground">{label}</Label>
    {ref_text && (
      <Tooltip>
        <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px] text-xs">{ref_text}</TooltipContent>
      </Tooltip>
    )}
  </div>
);

const NumInput = ({ label, value, onChange, unit, ref_text, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; ref_text?: string; step?: number;
}) => (
  <div className="space-y-1">
    <FieldLabel label={label} ref_text={ref_text} />
    <div className="relative">
      <Input type="number" value={value} step={step} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="font-mono text-sm pr-12" />
      {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">{unit}</span>}
    </div>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <div className="pt-4 pb-2">
    <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-primary">{title}</h3>
    <Separator className="mt-2" />
  </div>
);

const StrapForm = () => {
  const { inputs, setInput } = useStrapStore();
  const calcStore = useCalculationStore();

  const handleImport = () => {
    const calcOutputs = calcStore.outputs;
    const calcInputs = calcStore.inputs;
    if (!calcOutputs || !calcOutputs.span_results.length) {
      toast.error('No wind calc results available. Run the Wind Uplift calculator first.');
      return;
    }

    const zone1Results = calcOutputs.span_results.filter(r => r.zone === '1');
    const zone2EResults = calcOutputs.span_results.filter(r => r.zone === '2E');
    const maxSpanZ1 = zone1Results.length ? zone1Results.reduce((a, b) => Math.abs(a.net_uplift_lb) > Math.abs(b.net_uplift_lb) ? a : b) : null;
    const maxSpanZ2E = zone2EResults.length ? zone2EResults.reduce((a, b) => Math.abs(a.net_uplift_lb) > Math.abs(b.net_uplift_lb) ? a : b) : null;

    setInput('zone1_netUplift_lbs', maxSpanZ1 ? Math.abs(maxSpanZ1.net_uplift_lb) : 0);
    setInput('zone2E_netUplift_lbs', maxSpanZ2E ? Math.abs(maxSpanZ2E.net_uplift_lb) : 0);
    setInput('zone3E_netUplift_lbs', maxSpanZ2E ? Math.round(Math.abs(maxSpanZ2E.net_uplift_lb) * 1.5) : 0);
    setInput('trussSpacing_ft', calcInputs.trussSpacing);
    setInput('deadLoad_psf', calcInputs.deadLoad);
    setInput('designBasis', calcInputs.designBasis);

    toast.success('Imported uplift values from Wind Calc');
  };

  return (
    <div className="space-y-3 p-4">
      <h2 className="font-display text-lg font-bold text-foreground">Strap Calculator</h2>

      <Button variant="outline" size="sm" onClick={handleImport} className="w-full">
        <Download className="mr-1 h-4 w-4" /> Import from Wind Calc
      </Button>

      <SectionTitle title="Uplift Demands" />
      <NumInput label="Zone 1 (Field) Net Uplift" value={inputs.zone1_netUplift_lbs} onChange={(v) => setInput('zone1_netUplift_lbs', v)} unit="lbs" ref_text="Net uplift per truss, Zone 1 (wind − 0.6D)" />
      <NumInput label="Zone 2E (Edge) Net Uplift" value={inputs.zone2E_netUplift_lbs} onChange={(v) => setInput('zone2E_netUplift_lbs', v)} unit="lbs" ref_text="Net uplift per truss, Zone 2E" />
      <NumInput label="Zone 3E (Corner) Net Uplift" value={inputs.zone3E_netUplift_lbs} onChange={(v) => setInput('zone3E_netUplift_lbs', v)} unit="lbs" ref_text="Net uplift per truss, Zone 3E" />

      <SectionTitle title="Wall & Connection" />
      <div className="space-y-1">
        <FieldLabel label="Wall Type" ref_text="FBC §R802.11" />
        <Select value={inputs.wallType} onValueChange={(v) => setInput('wallType', v as WallType)}>
          <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="wood_plate">Wood Top Plate</SelectItem>
            <SelectItem value="cmu">CMU Block</SelectItem>
            <SelectItem value="concrete">Concrete</SelectItem>
            <SelectItem value="steel">Steel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <FieldLabel label="Straps Per Truss" />
        <Select value={String(inputs.strapsPerTruss)} onValueChange={(v) => setInput('strapsPerTruss', Number(v) as 1 | 2)}>
          <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <FieldLabel label="Hip Girder Present" ref_text="Auto-estimates at 2× Zone 3E if no override" />
        <Switch checked={inputs.hipGirderPresent} onCheckedChange={(v) => setInput('hipGirderPresent', v)} />
      </div>

      {inputs.hipGirderPresent && (
        <NumInput label="Hip Girder Uplift Override" value={inputs.hipGirderUplift_lbs ?? 0} onChange={(v) => setInput('hipGirderUplift_lbs', v || undefined)} unit="lbs" ref_text="Leave 0 to auto-estimate at 2× Zone 3E" />
      )}

      <SectionTitle title="Site" />
      <div className="space-y-1">
        <FieldLabel label="County" />
        <Select value={inputs.county} onValueChange={(v) => setInput('county', v as 'miami_dade' | 'broward' | 'other')}>
          <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="miami_dade">Miami-Dade</SelectItem>
            <SelectItem value="broward">Broward</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <FieldLabel label="HVHZ" ref_text="FBC §1620" />
        <Switch checked={inputs.isHVHZ} onCheckedChange={(v) => setInput('isHVHZ', v)} />
      </div>

      <div className="space-y-1">
        <FieldLabel label="Design Basis" ref_text="ASD: 0.6D; LRFD: 0.9D" />
        <Select value={inputs.designBasis} onValueChange={(v) => setInput('designBasis', v as 'ASD' | 'LRFD')}>
          <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ASD">ASD</SelectItem>
            <SelectItem value="LRFD">LRFD</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StrapForm;
