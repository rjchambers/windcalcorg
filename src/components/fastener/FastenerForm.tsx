import { useFastenerStore } from '@/stores/fastener-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Info, MapPin, Wind, Building2, Home, Wrench, Layers, TestTube, FileText, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { RoofSystemType } from '@/lib/fastener-engine';
import { isTAS105Required } from '@/lib/fastener-engine';

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

const Section = ({ title, icon: Icon, children, defaultOpen = true, badge: badgeEl }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean; badge?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 pt-4 pb-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-primary flex-1 text-left">{title}</h3>
        {badgeEl}
        <span className="text-[10px] text-muted-foreground">{open ? '▾' : '▸'}</span>
      </CollapsibleTrigger>
      <Separator className="mb-3" />
      <CollapsibleContent className="space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
};

const roofSystems: { type: RoofSystemType; label: string; icon: string; desc: string; standard: string }[] = [
  { type: 'modified_bitumen', label: 'Modified Bitumen', icon: '🏗️', desc: 'BUR / Mod-Bit', standard: 'RAS 117' },
  { type: 'single_ply', label: 'Single-Ply', icon: '📜', desc: 'TPO · EPDM · PVC', standard: 'RAS 137' },
  { type: 'adhered', label: 'Adhered Membrane', icon: '🔗', desc: 'Full Bond / SA', standard: 'TAS 124' },
];

const FastenerForm = () => {
  const { inputs, setInput, setNOA, setTAS105Values, setTAS105Meta, tas105Inputs, tas105Outputs } = useFastenerStore();
  const [csvInput, setCsvInput] = useState('');

  const tas105check = useMemo(() =>
    isTAS105Required(inputs.deckType, inputs.constructionType),
    [inputs.deckType, inputs.constructionType]
  );

  const showTAS105 = tas105check.required || inputs.fySource === 'tas105';

  return (
    <div className="space-y-1 p-4">
      <h2 className="font-display text-lg font-bold text-foreground">FastenerCalc HVHZ</h2>
      <p className="text-[10px] text-muted-foreground mb-2">RAS 117 · 128 · 137 · Low-Slope Only</p>

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
        <p className="text-[10px] text-muted-foreground rounded border border-primary/20 bg-primary/5 p-2">
          Low-slope (≤ 7°) only. Zone geometry per ASCE 7-22 Fig. 30.3-2A.
        </p>
      </Section>

      <Section title="Roof System" icon={Home}>
        <div className="grid grid-cols-3 gap-2">
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
              <div className="text-xs font-semibold text-foreground">{sys.label}</div>
              <div className="text-[10px] text-muted-foreground">{sys.desc}</div>
              <div className="text-[9px] font-mono text-primary/60 mt-0.5">{sys.standard}</div>
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
        <NumInput
          label={`Fastener Value (Fy)${inputs.fySource === 'tas105' ? ' — FROM TAS 105' : ''}`}
          value={inputs.Fy_lbf}
          onChange={(v) => setInput('Fy_lbf', v)}
          unit="lbf"
          step={0.1}
          ref_text="From NOA or TAS 105"
          disabled={inputs.fySource === 'tas105' && (tas105Outputs?.pass ?? false)}
        />
        {inputs.fySource === 'tas105' && tas105Outputs?.pass && (
          <p className="text-[10px] text-amber-500 font-mono">Design Fy set to MCRF = {tas105Outputs.MCRF_lbf} lbf from TAS 105 field test.</p>
        )}
        <NumInput label="Initial Rows (n)" value={inputs.initialRows} onChange={(v) => setInput('initialRows', v)} step={1} />
      </Section>

      {/* NOA / Product Approval Section */}
      <Section title="Product Approval / NOA" icon={FileText}>
        <div className="space-y-1">
          <FieldLabel label="Approval Type" />
          <Select value={inputs.noa.approvalType} onValueChange={(v) => setNOA('approvalType', v as any)}>
            <SelectTrigger className="text-sm font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="miami_dade_noa">Miami-Dade NOA</SelectItem>
              <SelectItem value="fl_product_approval">FL Product Approval</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <FieldLabel label="Approval Number" />
          <Input
            placeholder="e.g. FL1654-R36"
            value={inputs.noa.approvalNumber}
            onChange={(e) => setNOA('approvalNumber', e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <FieldLabel label="Manufacturer" />
            <Input placeholder="e.g. Polyglass USA" value={inputs.noa.manufacturer ?? ''} onChange={(e) => setNOA('manufacturer', e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-1">
            <FieldLabel label="Product / System" />
            <Input placeholder="e.g. Elastobase V" value={inputs.noa.productName ?? ''} onChange={(e) => setNOA('productName', e.target.value)} className="text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <FieldLabel label="System Number" />
          <Input placeholder="e.g. W-75" value={inputs.noa.systemNumber ?? ''} onChange={(e) => setNOA('systemNumber', e.target.value)} className="font-mono text-sm" />
        </div>
        <div className="space-y-1">
          <FieldLabel label="Max Design Pressure (MDP)" ref_text="From NOA — Zone 1 field attachment" />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">−</span>
            <Input
              type="number"
              value={Math.abs(inputs.noa.mdp_psf)}
              onChange={(e) => setNOA('mdp_psf', -(parseFloat(e.target.value) || 0))}
              className="font-mono text-sm pl-7 pr-12"
              step={0.1}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">psf</span>
          </div>
          <p className="text-[9px] text-muted-foreground">
            Tested uplift capacity of Zone 1 prescriptive pattern. Zones 2/3 use RAS 117 rational analysis when exceeded.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <FieldLabel label="Asterisked Assembly (*)" ref_text="Extrapolation prohibited for (*) assemblies" />
          </div>
          <Switch checked={inputs.noa.asterisked} onCheckedChange={(v) => setNOA('asterisked', v)} />
        </div>
        {inputs.noa.asterisked && (
          <div className="rounded border border-primary/20 bg-primary/5 p-2">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Asterisked (*) assemblies have been tested at a specific fastener configuration only. The manufacturer does not warrant performance at alternative fastener densities. MDP must equal or exceed all zone pressures.
            </p>
          </div>
        )}
      </Section>

      <Section title="Insulation Board" icon={Layers} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <NumInput label="Board Length" value={inputs.boardLength_ft} onChange={(v) => setInput('boardLength_ft', v)} unit="ft" />
          <NumInput label="Board Width" value={inputs.boardWidth_ft} onChange={(v) => setInput('boardWidth_ft', v)} unit="ft" />
        </div>
        <NumInput label="Insulation Fy" value={inputs.insulation_Fy_lbf} onChange={(v) => setInput('insulation_Fy_lbf', v)} unit="lbf" step={0.1} />
      </Section>

      {/* TAS 105 Section — conditional display */}
      {showTAS105 && (
        <Section
          title="TAS 105 Field Test"
          icon={TestTube}
          badge={
            tas105check.required ? (
              <Badge variant={inputs.deckType === 'lw_concrete' ? 'destructive' : 'secondary'} className="text-[9px] px-1.5 py-0">
                REQUIRED
              </Badge>
            ) : null
          }
        >
          {/* Test metadata */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <FieldLabel label="Testing Agency" />
              <Input placeholder="Agency name" value={tas105Inputs.testingAgency ?? ''} onChange={(e) => setTAS105Meta({ testingAgency: e.target.value })} className="text-sm" />
            </div>
            <div className="space-y-1">
              <FieldLabel label="Test Date" />
              <Input type="date" value={tas105Inputs.testDate ?? ''} onChange={(e) => setTAS105Meta({ testDate: e.target.value })} className="text-sm font-mono" />
            </div>
          </div>
          <div className="space-y-1">
            <FieldLabel label="Deck Condition Notes" />
            <Input placeholder="e.g. Deck in good condition, no delamination" value={tas105Inputs.deckConditionNotes ?? ''} onChange={(e) => setTAS105Meta({ deckConditionNotes: e.target.value })} className="text-sm" />
          </div>

          {/* Sample values */}
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground">Enter pullout values (min 5 samples, 10+ recommended)</p>
            <div className="grid grid-cols-2 gap-2">
              {(tas105Inputs.rawValues_lbf.length > 0 ? tas105Inputs.rawValues_lbf : [0, 0, 0, 0, 0]).map((v, i) => (
                <div key={i} className="relative">
                  <Input
                    type="number"
                    value={v || ''}
                    placeholder={`#${i + 1}`}
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
              <button
                className="flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] text-primary hover:bg-primary/20"
                onClick={() => {
                  const current = tas105Inputs.rawValues_lbf.length > 0 ? tas105Inputs.rawValues_lbf : [0, 0, 0, 0, 0];
                  setTAS105Values([...current, 0]);
                }}
              >
                <Plus className="h-3 w-3" /> Add Sample
              </button>
              <Input
                placeholder="Paste CSV: 320, 310, 290..."
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                className="text-xs flex-1"
              />
              <button
                className="rounded border border-primary/30 bg-primary/10 px-3 text-xs text-primary hover:bg-primary/20"
                onClick={() => {
                  const vals = csvInput.split(/[,\s]+/).map(Number).filter(n => n > 0);
                  if (vals.length >= 5) { setTAS105Values(vals); setInput('fySource', 'tas105'); }
                }}
              >
                Import
              </button>
            </div>

            {/* Live statistics */}
            {tas105Inputs.rawValues_lbf.filter(v => v > 0).length >= 2 && (
              <div className="rounded border border-border bg-muted/30 p-3 space-y-1">
                <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Live Statistics</p>
                {(() => {
                  const vals = tas105Inputs.rawValues_lbf.filter(v => v > 0);
                  const n = vals.length;
                  const mean = vals.reduce((a, b) => a + b, 0) / n;
                  const variance = vals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / Math.max(n - 1, 1);
                  const stdDev = Math.sqrt(variance);
                  const tFactor = n >= 10 ? 1.645 : 2.010;
                  const mcrf = mean - tFactor * stdDev;
                  return (
                    <>
                      <p className="font-mono text-xs text-muted-foreground">
                        n = {n} &nbsp; X̄ = {mean.toFixed(1)} lbf &nbsp; σ = {stdDev.toFixed(1)} lbf
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        t = {tFactor} ({n >= 10 ? 'n ≥ 10' : 'n < 10, conservative'})
                      </p>
                      <p className="font-mono text-xs text-foreground font-semibold">
                        MCRF = {mean.toFixed(1)} − ({tFactor} × {stdDev.toFixed(1)}) = {mcrf.toFixed(1)} lbf
                      </p>
                      {n >= 5 && (
                        <p className={`text-xs font-bold ${mcrf >= 275 ? 'text-green-500' : 'text-destructive'}`}>
                          {mcrf >= 275 ? '✅ PASS — MCRF ≥ 275 lbf' : '🔴 FAIL — MCRF < 275 lbf'}
                        </p>
                      )}
                      {n < 5 && (
                        <p className="text-[10px] text-destructive">Minimum 5 samples required.</p>
                      )}

                      {/* Mini histogram */}
                      {n >= 5 && (
                        <TAS105Histogram values={vals} mean={mean} mcrf={mcrf} />
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Info when TAS 105 not required */}
      {!showTAS105 && (inputs.deckType === 'plywood' || inputs.deckType === 'wood_plank') &&
        (inputs.constructionType === 'new' || inputs.constructionType === 'reroof') && (
        <div className="rounded border border-primary/20 bg-primary/5 p-3 mx-4">
          <p className="text-[10px] text-muted-foreground">
            ℹ️ TAS 105 field testing is not required for wood deck {inputs.constructionType} applications. NOA Fy value is used directly.
          </p>
        </div>
      )}
    </div>
  );
};

// ──── TAS 105 Histogram ────

const TAS105Histogram = ({ values, mean, mcrf }: { values: number[]; mean: number; mcrf: number }) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const binCount = Math.min(10, values.length);
  const binWidth = range / binCount;
  const bins = Array(binCount).fill(0);
  values.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
    bins[idx]++;
  });
  const maxBin = Math.max(...bins);
  const svgW = 280;
  const svgH = 80;
  const barW = svgW / binCount - 2;

  const toX = (val: number) => ((val - min) / range) * svgW;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH + 15}`} className="w-full mt-2">
      {bins.map((count, i) => (
        <rect
          key={i}
          x={i * (svgW / binCount) + 1}
          y={svgH - (count / maxBin) * svgH}
          width={barW}
          height={(count / maxBin) * svgH}
          fill="hsl(217 91% 53% / 0.5)"
          stroke="hsl(217 91% 53% / 0.7)"
          strokeWidth="0.5"
        />
      ))}
      {/* Mean line */}
      <line x1={toX(mean)} y1={0} x2={toX(mean)} y2={svgH} stroke="white" strokeWidth="1" strokeDasharray="3,2" />
      <text x={toX(mean)} y={svgH + 10} textAnchor="middle" fontSize="6" fill="white" fontFamily="monospace">X̄={mean.toFixed(0)}</text>
      {/* MCRF line */}
      <line x1={toX(mcrf)} y1={0} x2={toX(mcrf)} y2={svgH} stroke={mcrf >= 275 ? '#22c55e' : '#ef4444'} strokeWidth="1.5" />
      <text x={toX(mcrf)} y={svgH + 10} textAnchor="middle" fontSize="6" fill={mcrf >= 275 ? '#22c55e' : '#ef4444'} fontFamily="monospace">MCRF={mcrf.toFixed(0)}</text>
      {/* 275 threshold */}
      {min <= 275 && max >= 200 && (
        <>
          <line x1={toX(275)} y1={0} x2={toX(275)} y2={svgH} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2" />
          <text x={toX(275) + 2} y={8} fontSize="5" fill="#ef4444" fontFamily="monospace">275</text>
        </>
      )}
    </svg>
  );
};

export default FastenerForm;
