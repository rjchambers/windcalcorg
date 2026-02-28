import { useFastenerStore } from '@/stores/fastener-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Info, MapPin, Wind, Building2, Home, Wrench, Layers, TestTube, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import type { RoofSystemType } from '@/lib/fastener-engine';

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

const roofSystems: { type: RoofSystemType; label: string; icon: string; desc: string }[] = [
  { type: 'modified_bitumen', label: 'Modified Bitumen', icon: '🏗️', desc: 'BUR / Mod-Bit' },
  { type: 'single_ply', label: 'Single-Ply', icon: '📜', desc: 'TPO / EPDM / PVC' },
  { type: 'adhered', label: 'Adhered Membrane', icon: '🔗', desc: 'TAS 124' },
  { type: 'tile', label: 'Tile System', icon: '🏺', desc: 'Concrete / Clay' },
  { type: 'shingle', label: 'Shingles', icon: '🪴', desc: 'Asphalt' },
  { type: 'metal', label: 'Metal Panel', icon: '⚙️', desc: 'Standing Seam' },
];

const FastenerForm = () => {
  const { inputs, setInput, setTAS105Values, tas105Inputs } = useFastenerStore();
  const [csvInput, setCsvInput] = useState('');

  return (
    <div className="space-y-1 p-4">
      <h2 className="font-display text-lg font-bold text-foreground">FastenerCalc HVHZ</h2>
      <p className="text-[10px] text-muted-foreground mb-2">RAS 117 · 128 · 127 · 137</p>

      <Section title="Site & Code" icon={MapPin}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <FieldLabel label="County" />
            <Select value={inputs.county} onValueChange={(v) => setInput('county', v as any)}>
              <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="miami_dade">Miami-Dade</SelectItem>
                <SelectItem value="broward">Broward</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <FieldLabel label="Construction" />
            <Select value={inputs.constructionType} onValueChange={(v) => setInput('constructionType', v as any)}>
              <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reroof">Reroof</SelectItem>
                <SelectItem value="recover">Recover</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <FieldLabel label="Risk Category" ref_text="Table 1.5-1" />
            <Select value={inputs.riskCategory} onValueChange={(v) => setInput('riskCategory', v as any)}>
              <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['I', 'II', 'III', 'IV'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Switch checked={inputs.isHVHZ} onCheckedChange={(v) => setInput('isHVHZ', v)} />
            <Label className="text-xs">HVHZ</Label>
          </div>
        </div>
      </Section>

      <Section title="Wind & Exposure" icon={Wind}>
        <NumInput label="Basic Wind Speed (V)" value={inputs.V} onChange={(v) => setInput('V', v)} unit="mph" ref_text="Fig. 26.5-1" />
        <div className="space-y-1">
          <FieldLabel label="Exposure Category" ref_text="§26.7" />
          <Select value={inputs.exposureCategory} onValueChange={(v) => setInput('exposureCategory', v as any)}>
            <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['B', 'C', 'D'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumInput label="Kzt" value={inputs.Kzt} onChange={(v) => setInput('Kzt', v)} step={0.01} />
          <NumInput label="Kd" value={inputs.Kd} onChange={(v) => setInput('Kd', v)} step={0.01} />
          <NumInput label="Ke" value={inputs.Ke} onChange={(v) => setInput('Ke', v)} step={0.01} />
        </div>
        <div className="space-y-1">
          <FieldLabel label="Enclosure" ref_text="§26.12" />
          <Select value={inputs.enclosure} onValueChange={(v) => setInput('enclosure', v as any)}>
            <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="enclosed">Enclosed (GCpi = ±0.18)</SelectItem>
              <SelectItem value="partially_enclosed">Partially Enclosed (±0.55)</SelectItem>
              <SelectItem value="open">Open</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Building Geometry" icon={Building2}>
        <div className="grid grid-cols-2 gap-2">
          <NumInput label="Length" value={inputs.buildingLength} onChange={(v) => setInput('buildingLength', v)} unit="ft" />
          <NumInput label="Width" value={inputs.buildingWidth} onChange={(v) => setInput('buildingWidth', v)} unit="ft" />
        </div>
        <NumInput label="Mean Roof Height (h)" value={inputs.h} onChange={(v) => setInput('h', v)} unit="ft" />
        <NumInput label="Parapet Height" value={inputs.parapetHeight} onChange={(v) => setInput('parapetHeight', v)} unit="ft" />
        <div className="space-y-1">
          <FieldLabel label="Roof Type" />
          <Select value={inputs.roofType} onValueChange={(v) => setInput('roofType', v as any)}>
            <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low_slope">Low-Slope (≤ 7°)</SelectItem>
              <SelectItem value="hip">Hip</SelectItem>
              <SelectItem value="gable">Gable</SelectItem>
              <SelectItem value="monoslope">Monoslope</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NumInput label="Roof Pitch (θ)" value={inputs.pitchDegrees} onChange={(v) => setInput('pitchDegrees', v)} unit="°" step={0.5} />
      </Section>

      <Section title="Roof System" icon={Home}>
        <div className="grid grid-cols-2 gap-2">
          {roofSystems.map((sys) => (
            <button
              key={sys.type}
              onClick={() => setInput('systemType', sys.type)}
              className={`rounded-lg border p-3 text-left transition-all ${
                inputs.systemType === sys.type
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="text-lg mb-1">{sys.icon}</div>
              <div className="text-xs font-semibold text-foreground">{sys.label}</div>
              <div className="text-[10px] text-muted-foreground">{sys.desc}</div>
            </button>
          ))}
        </div>
        <div className="space-y-1">
          <FieldLabel label="Deck Type" />
          <Select value={inputs.deckType} onValueChange={(v) => setInput('deckType', v as any)}>
            <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="plywood">Plywood</SelectItem>
              <SelectItem value="structural_concrete">Structural Concrete</SelectItem>
              <SelectItem value="steel_deck">Steel Deck</SelectItem>
              <SelectItem value="wood_plank">Wood Plank</SelectItem>
              <SelectItem value="lw_concrete">LW Insulating Concrete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Fastener / Assembly" icon={Wrench}>
        <div className="grid grid-cols-2 gap-2">
          <NumInput label="Sheet Width (SW)" value={inputs.sheetWidth_in} onChange={(v) => setInput('sheetWidth_in', v)} unit="in" step={0.125} />
          <NumInput label="Lap Width (LW)" value={inputs.lapWidth_in} onChange={(v) => setInput('lapWidth_in', v)} unit="in" step={0.5} />
        </div>
        <NumInput label="Fastener Value (Fy)" value={inputs.Fy_lbf} onChange={(v) => setInput('Fy_lbf', v)} unit="lbf" step={0.1} ref_text="From NOA or TAS 105" />
        <div className="space-y-1">
          <FieldLabel label="Fy Source" />
          <Select value={inputs.fySource} onValueChange={(v) => setInput('fySource', v as any)}>
            <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="noa">NOA / Product Approval</SelectItem>
              <SelectItem value="tas105">TAS 105 Field Test</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NumInput label="NOA MDP" value={inputs.noaMDP_psf} onChange={(v) => setInput('noaMDP_psf', v)} unit="psf" ref_text="Max Design Pressure from NOA" />
        <div className="flex items-center justify-between">
          <FieldLabel label="Extrapolation Permitted" ref_text="Per NOA — asterisked systems = No" />
          <Switch checked={inputs.extrapolationPermitted} onCheckedChange={(v) => setInput('extrapolationPermitted', v)} />
        </div>
        <NumInput label="Initial Rows (n)" value={inputs.initialRows} onChange={(v) => setInput('initialRows', v)} step={1} />
      </Section>

      <Section title="Insulation Board" icon={Layers} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <NumInput label="Board Length" value={inputs.boardLength_ft} onChange={(v) => setInput('boardLength_ft', v)} unit="ft" />
          <NumInput label="Board Width" value={inputs.boardWidth_ft} onChange={(v) => setInput('boardWidth_ft', v)} unit="ft" />
        </div>
        <NumInput label="Insulation Fy" value={inputs.insulation_Fy_lbf} onChange={(v) => setInput('insulation_Fy_lbf', v)} unit="lbf" step={0.1} />
      </Section>

      {inputs.fySource === 'tas105' && (
        <Section title="TAS 105 Field Test" icon={TestTube}>
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground">Enter values or paste CSV</p>
            <div className="grid grid-cols-2 gap-2">
              {(tas105Inputs.rawValues_lbf.length > 0 ? tas105Inputs.rawValues_lbf : [0, 0, 0, 0, 0]).map((v, i) => (
                <div key={i} className="relative">
                  <Input
                    type="number"
                    value={v || ''}
                    placeholder={`Sample ${i + 1}`}
                    className="font-mono text-sm pr-10"
                    onChange={(e) => {
                      const vals = [...(tas105Inputs.rawValues_lbf.length > 0 ? tas105Inputs.rawValues_lbf : [0, 0, 0, 0, 0])];
                      vals[i] = parseFloat(e.target.value) || 0;
                      setTAS105Values(vals.filter(v => v > 0));
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">lbf</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Paste CSV: 320, 310, 290..."
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                className="text-xs"
              />
              <button
                className="rounded border border-primary/30 bg-primary/10 px-3 text-xs text-primary hover:bg-primary/20"
                onClick={() => {
                  const vals = csvInput.split(/[,\s]+/).map(Number).filter(n => n > 0);
                  if (vals.length >= 5) setTAS105Values(vals);
                }}
              >
                Import
              </button>
            </div>
          </div>
        </Section>
      )}

      {inputs.systemType === 'tile' && (
        <Section title="Tile Parameters (RAS 127)" icon={FileText} defaultOpen={true}>
          <div className="space-y-1">
            <FieldLabel label="Calculation Method" />
            <Select value={String(inputs.tileMethod ?? 1)} onValueChange={(v) => setInput('tileMethod', Number(v) as 1 | 2 | 3)}>
              <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Method 1 — Moment</SelectItem>
                <SelectItem value="2">Method 2 — Simplified</SelectItem>
                <SelectItem value="3">Method 3 — Uplift</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <NumInput label="Tile Weight" value={inputs.tileWeight_lbf ?? 0} onChange={(v) => setInput('tileWeight_lbf', v)} unit="lbf" />
          <div className="grid grid-cols-2 gap-2">
            <NumInput label="Exposed Length" value={inputs.tileExposedLength_ft ?? 0} onChange={(v) => setInput('tileExposedLength_ft', v)} unit="ft" step={0.1} />
            <NumInput label="Tile Width" value={inputs.tileWidth_ft ?? 0} onChange={(v) => setInput('tileWidth_ft', v)} unit="ft" step={0.1} />
          </div>
          {(inputs.tileMethod === 1) && (
            <>
              <NumInput label="CG Height" value={inputs.tileCGHeight_ft ?? 0} onChange={(v) => setInput('tileCGHeight_ft', v)} unit="ft" step={0.01} />
              <NumInput label="Mf (NOA)" value={inputs.Mf_NOA ?? 0} onChange={(v) => setInput('Mf_NOA', v)} unit="ft-lbf" />
            </>
          )}
          {(inputs.tileMethod === 3) && (
            <NumInput label="F' (NOA)" value={inputs.Fprime_NOA ?? 0} onChange={(v) => setInput('Fprime_NOA', v)} unit="lbf" />
          )}
        </Section>
      )}
    </div>
  );
};

export default FastenerForm;
