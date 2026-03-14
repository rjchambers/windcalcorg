import { useTileStore } from '@/stores/tile-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Info, MapPin, Home, FileText, Wrench } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import SiteLookup from '@/components/shared/SiteLookup';
import type { ExposureCatT, RoofTypeT } from '@/lib/tile-engine';

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

const NumInput = ({ label, value, onChange, unit, ref_text, step = 1, disabled = false }: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; ref_text?: string; step?: number; disabled?: boolean;
}) => (
  <div className="space-y-1">
    <FieldLabel label={label} ref_text={ref_text} />
    <div className="relative">
      <Input type="number" value={value} step={step} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="font-mono text-sm pr-12" disabled={disabled} />
      {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">{unit}</span>}
    </div>
  </div>
);

const Section = ({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 pt-4 pb-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-primary flex-1 text-left">{title}</h3>
        <span className="text-[10px] text-muted-foreground">{open ? '▾' : '▸'}</span>
      </CollapsibleTrigger>
      <Separator className="mb-3" />
      <CollapsibleContent className="space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
};

const TileForm = () => {
  const { inputs, setInput } = useTileStore();
  const pitchDeg = Math.round(Math.atan(inputs.pitchRise / 12) * (180 / Math.PI) * 10) / 10;

  return (
    <div className="space-y-1 p-4">
      <h2 className="font-display text-lg font-bold text-foreground">TileCalc HVHZ</h2>
      <p className="text-[10px] text-muted-foreground mb-2">RAS 127-20 · Moment & Uplift Methods</p>

      <SiteLookup onApply={(vals) => {
        setInput('V', vals.V);
        setInput('exposureCategory', vals.exposure as ExposureCatT);
        setInput('isHVHZ', vals.isHVHZ);
        setInput('county', vals.county);
      }} />

      <Section title="Site Parameters" icon={MapPin}>
        <NumInput label="Basic Wind Speed (V)" value={inputs.V} onChange={(v) => setInput('V', v)} unit="mph" ref_text="RAS 127 tables are for V=175 mph" disabled={!inputs.useEngineeredPressures} />
        <div className="space-y-1">
          <FieldLabel label="Exposure Category" ref_text="§26.7" />
          <Select value={inputs.exposureCategory} onValueChange={(v) => setInput('exposureCategory', v as ExposureCatT)}>
            <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NumInput label="Mean Roof Height (h)" value={inputs.h} onChange={(v) => setInput('h', v)} unit="ft" ref_text="Max 60 ft for RAS 127 tables" step={5} />
        <div className="flex items-center justify-between">
          <FieldLabel label="HVHZ" />
          <Switch checked={inputs.isHVHZ} onCheckedChange={(v) => setInput('isHVHZ', v)} />
        </div>
        <div className="flex items-center justify-between">
          <FieldLabel label="Use Engineered Pressures" ref_text="Unlock custom Pasd inputs — requires PE seal" />
          <Switch checked={inputs.useEngineeredPressures} onCheckedChange={(v) => setInput('useEngineeredPressures', v)} />
        </div>
      </Section>

      <Section title="Roof Geometry" icon={Home}>
        <div className="grid grid-cols-2 gap-2">
          {(['hip', 'gable'] as RoofTypeT[]).map(t => (
            <button key={t} onClick={() => setInput('roofType', t)} className={`rounded-lg border p-3 text-center transition-all ${inputs.roofType === t ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card hover:border-primary/30'}`}>
              <div className="text-sm font-semibold text-foreground">{t === 'hip' ? '🏠 Hip' : '⛺ Gable'}</div>
            </button>
          ))}
        </div>
        <NumInput label={`Roof Slope (${inputs.pitchRise}:12 = ${pitchDeg}°)`} value={inputs.pitchRise} onChange={(v) => setInput('pitchRise', v)} step={0.5} ref_text="Rise per 12 in run" />
        {/* SVG pitch visualizer */}
        <div className="flex justify-center">
          <svg width="120" height="60" viewBox="0 0 120 60" className="text-primary">
            <line x1="10" y1="50" x2="110" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <line x1="10" y1="50" x2="110" y2={50 - (inputs.pitchRise / 12) * 40} stroke="currentColor" strokeWidth="2" />
            <text x="60" y={50 - (inputs.pitchRise / 12) * 40 - 5} textAnchor="middle" fill="currentColor" fontSize="9">{inputs.pitchRise}:12</text>
          </svg>
        </div>
        <div className="flex items-center justify-between">
          <FieldLabel label="Has Overhang" />
          <Switch checked={inputs.hasOverhang} onCheckedChange={(v) => setInput('hasOverhang', v)} />
        </div>
      </Section>

      <Section title="Product Approval Values" icon={FileText}>
        <div className="grid grid-cols-2 gap-2">
          {(['moment', 'uplift'] as const).map(m => (
            <button key={m} onClick={() => setInput('method', m)} className={`rounded-lg border p-3 text-left transition-all ${inputs.method === m ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card hover:border-primary/30'}`}>
              <div className="text-xs font-semibold text-foreground">{m === 'moment' ? 'Method 1 — Moment' : 'Method 3 — Uplift'}</div>
              <div className="text-[9px] text-muted-foreground">{m === 'moment' ? 'Mechanical attachment' : 'Mortar/adhesive set'}</div>
            </button>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground italic">Method 2 (Simplified Table) is for Broward Exp C only — use NOA table directly.</p>

        {inputs.method === 'moment' ? (
          <>
            <NumInput label="Aerodynamic Multiplier λ" value={inputs.lambda} onChange={(v) => setInput('lambda', v)} unit="ft²" step={0.01} ref_text="From Product Approval" />
            <NumInput label="Restoring Moment Mg" value={inputs.Mg_ftlb} onChange={(v) => setInput('Mg_ftlb', v)} unit="ft-lb" step={0.1} ref_text="Due to gravity" />
            <NumInput label="Attachment Resistance Mf" value={inputs.Mf_ftlb} onChange={(v) => setInput('Mf_ftlb', v)} unit="ft-lb" step={0.1} ref_text="From Product Approval" />
          </>
        ) : (
          <>
            <NumInput label="Tile Length (l)" value={inputs.tile_length_ft} onChange={(v) => setInput('tile_length_ft', v)} unit="ft" step={0.01} />
            <NumInput label="Tile Width (w)" value={inputs.tile_width_ft} onChange={(v) => setInput('tile_width_ft', v)} unit="ft" step={0.01} />
            <NumInput label="Tile Weight (W)" value={inputs.tile_weight_lb} onChange={(v) => setInput('tile_weight_lb', v)} unit="lb" step={0.1} />
            <NumInput label="Resistance F'" value={inputs.F_prime_lbf} onChange={(v) => setInput('F_prime_lbf', v)} unit="lbf" step={0.1} ref_text="Min characteristic resistance from Product Approval" />
          </>
        )}
      </Section>

      {inputs.useEngineeredPressures && (
        <Section title="Engineered Pressures" icon={Wrench} defaultOpen={true}>
          <div className="rounded border border-warning/30 bg-warning/5 p-2 mb-2">
            <p className="text-[10px] text-warning">Custom pressures require signed and sealed engineering per RAS 127 §1.</p>
          </div>
          <NumInput label="Pasd(1) Field" value={inputs.engineeredPasd1 ?? 0} onChange={(v) => setInput('engineeredPasd1', v)} unit="psf" />
          <NumInput label="Pasd(2) Perimeter" value={inputs.engineeredPasd2 ?? 0} onChange={(v) => setInput('engineeredPasd2', v)} unit="psf" />
          <NumInput label="Pasd(3) Corner" value={inputs.engineeredPasd3 ?? 0} onChange={(v) => setInput('engineeredPasd3', v)} unit="psf" />
        </Section>
      )}
    </div>
  );
};

export default TileForm;
