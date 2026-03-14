import { useCalculationStore } from '@/stores/calculation-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Info, Plus, X, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SiteLookup from '@/components/shared/SiteLookup';

const FieldLabel = ({ label, ref_text }: { label: string; ref_text?: string }) => (
  <div className="flex items-center gap-1.5">
    <Label className="text-xs font-medium text-foreground">{label}</Label>
    {ref_text && (
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-3 w-3 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px] text-xs">
          {ref_text}
        </TooltipContent>
      </Tooltip>
    )}
  </div>
);

const NumericInput = ({
  label, value, onChange, unit, ref_text, step = 1, children,
}: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; ref_text?: string; step?: number; children?: React.ReactNode;
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5">
      <FieldLabel label={label} ref_text={ref_text} />
      {children}
    </div>
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

const WindSpeedHelper = () => (
  <Popover>
    <PopoverTrigger asChild>
      <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
    </PopoverTrigger>
    <PopoverContent side="right" className="w-72 text-xs space-y-2">
      <p className="font-semibold text-foreground">Finding Your Design Wind Speed</p>
      <p className="text-muted-foreground">For Florida, typical values (Risk Cat. II):</p>
      <ul className="text-muted-foreground space-y-1 pl-3 list-disc">
        <li>Miami-Dade / Broward (HVHZ): 170–185 mph</li>
        <li>Palm Beach, Monroe: 160–175 mph</li>
        <li>Central FL (Orlando area): 130–140 mph</li>
        <li>North FL (Jacksonville): 120–130 mph</li>
      </ul>
      <p className="text-muted-foreground">For exact values, use the <span className="text-primary font-medium">ASCE Hazards Tool</span> with your site coordinates.</p>
    </PopoverContent>
  </Popover>
);

const CalculatorForm = () => {
  const { inputs, setInput } = useCalculationStore();

  const handleSpanChange = (index: number, value: number) => {
    const newSpans = [...inputs.spans];
    newSpans[index] = value;
    setInput('spans', newSpans);
  };

  const handleAddSpan = () => {
    const lastSpan = inputs.spans[inputs.spans.length - 1] ?? 10;
    setInput('spans', [...inputs.spans, lastSpan + 2]);
  };

  const handleRemoveSpan = (index: number) => {
    if (inputs.spans.length <= 1) return;
    setInput('spans', inputs.spans.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 p-4">
      <h2 className="font-display text-lg font-bold text-foreground">Input Parameters</h2>

      <SectionTitle title="Wind & Site" />

      <NumericInput
        label="Basic Wind Speed (V)"
        value={inputs.V}
        onChange={(v) => setInput('V', v)}
        unit="mph"
        ref_text="ASCE 7-22 Fig. 26.5-1A/B/C"
      >
        <WindSpeedHelper />
      </NumericInput>

      <div className="space-y-1">
        <FieldLabel label="Risk Category" ref_text="ASCE 7-22 Table 1.5-1" />
        <Select value={inputs.riskCategory} onValueChange={(v) => setInput('riskCategory', v as any)}>
          <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['I', 'II', 'III', 'IV'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <FieldLabel label="Exposure Category" ref_text="ASCE 7-22 §26.7" />
        <Select value={inputs.exposureCategory} onValueChange={(v) => setInput('exposureCategory', v as any)}>
          <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['B', 'C', 'D'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <NumericInput label="K_zt" value={inputs.Kzt} onChange={(v) => setInput('Kzt', v)} step={0.01} ref_text="§26.8" />
        <NumericInput label="K_d" value={inputs.Kd} onChange={(v) => setInput('Kd', v)} step={0.01} ref_text="Table 26.6-1" />
        <NumericInput label="K_e" value={inputs.Ke} onChange={(v) => setInput('Ke', v)} step={0.01} ref_text="§26.9" />
      </div>

      <SectionTitle title="Building Geometry" />

      <div className="grid grid-cols-2 gap-2">
        <NumericInput label="Building Length" value={inputs.buildingLength} onChange={(v) => setInput('buildingLength', v)} unit="ft" />
        <NumericInput label="Building Width" value={inputs.buildingWidth} onChange={(v) => setInput('buildingWidth', v)} unit="ft" />
      </div>

      <NumericInput label="Mean Roof Height (h)" value={inputs.h} onChange={(v) => setInput('h', v)} unit="ft" ref_text="(h_eave + h_ridge) / 2" />

      <div className="space-y-1">
        <FieldLabel label="Roof Type" ref_text="Drives GCpf table selection" />
        <Select value={inputs.roofType} onValueChange={(v) => setInput('roofType', v as any)}>
          <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['gable', 'hip', 'flat', 'monoslope'].map(t => (
              <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <NumericInput label="Roof Pitch (θ)" value={inputs.pitchDegrees} onChange={(v) => setInput('pitchDegrees', v)} unit="deg" step={0.1} ref_text="Range: 0°–45°" />

      <SectionTitle title="Structural" />

      <div className="grid grid-cols-2 gap-2">
        <NumericInput label="Truss Spacing" value={inputs.trussSpacing} onChange={(v) => setInput('trussSpacing', v)} unit="ft" />
        <NumericInput label="Dead Load" value={inputs.deadLoad} onChange={(v) => setInput('deadLoad', v)} unit="psf" />
      </div>

      <div className="space-y-1">
        <FieldLabel label="Design Basis" ref_text="ASD: 0.6D; LRFD: 0.9D" />
        <Select value={inputs.designBasis} onValueChange={(v) => setInput('designBasis', v as any)}>
          <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ASD">ASD</SelectItem>
            <SelectItem value="LRFD">LRFD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <FieldLabel label="Enclosure Type" ref_text="ASCE 7-22 §26.12" />
        <Select value={inputs.enclosureType} onValueChange={(v) => setInput('enclosureType', v as any)}>
          <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="enclosed">Enclosed (GCpi = ±0.18)</SelectItem>
            <SelectItem value="partially_enclosed">Partially Enclosed (±0.55)</SelectItem>
            <SelectItem value="open">Open</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SectionTitle title="Spans" />

      <div className="space-y-2">
        {inputs.spans.map((span, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono w-16">Span {i + 1}:</span>
            <div className="relative flex-1">
              <Input type="number" value={span} step={1} onChange={(e) => handleSpanChange(i, parseFloat(e.target.value) || 0)} className="font-mono text-sm pr-10" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">ft</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleRemoveSpan(i)} disabled={inputs.spans.length <= 1}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddSpan} className="w-full">
          <Plus className="mr-1 h-3 w-3" /> Add Span
        </Button>
      </div>

      <SectionTitle title="Overhang" />

      <div className="flex items-center justify-between">
        <FieldLabel label="Include Overhang" ref_text="ASCE 7-22 §28.3.3" />
        <Switch checked={inputs.hasOverhang} onCheckedChange={(v) => setInput('hasOverhang', v)} />
      </div>

      {inputs.hasOverhang && (
        <NumericInput label="Overhang Width" value={inputs.overhangWidth} onChange={(v) => setInput('overhangWidth', v)} unit="ft" step={0.5} />
      )}
    </div>
  );
};

export default CalculatorForm;
