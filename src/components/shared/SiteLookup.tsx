import { useState } from 'react';
import { MapPin, ChevronDown, Check, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COUNTY_NAMES, lookupByCounty, type CountyWindData } from '@/hooks/use-site-lookup';
import { toast } from 'sonner';

interface SiteLookupProps {
  onApply: (vals: { V: number; exposure: 'B' | 'C' | 'D'; isHVHZ: boolean; county: string }) => void;
}

const SiteLookup = ({ onApply }: SiteLookupProps) => {
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [applied, setApplied] = useState(false);
  const [appliedCounty, setAppliedCounty] = useState('');

  const data = selectedCounty ? lookupByCounty(selectedCounty) : null;

  const handleApply = () => {
    if (!data || !selectedCounty) return;
    onApply({
      V: data.V_mph,
      exposure: data.exposureSuggestion,
      isHVHZ: data.isHVHZ,
      county: selectedCounty,
    });
    setApplied(true);
    setAppliedCounty(selectedCounty);
    toast.success(`Site parameters applied for ${selectedCounty} County.`);
  };

  if (applied) {
    const d = lookupByCounty(appliedCounty);
    return (
      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          <Check className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground font-medium">{appliedCounty} Co.</span>
          <span className="text-muted-foreground">— {d?.V_mph} mph Exp. {d?.exposureSuggestion}</span>
          {d?.isHVHZ && <Badge variant="secondary" className="text-[9px] px-1 py-0">HVHZ</Badge>}
        </div>
        <button onClick={() => setApplied(false)} className="text-[10px] text-primary hover:underline">Edit</button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card/50 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">Florida County Lookup</span>
      </div>

      <Select value={selectedCounty} onValueChange={setSelectedCounty}>
        <SelectTrigger className="text-sm"><SelectValue placeholder="Select county…" /></SelectTrigger>
        <SelectContent>
          {COUNTY_NAMES.map(c => (
            <SelectItem key={c} value={c}>{c} County</SelectItem>
          ))}
          <SelectItem value="__other">Other / Out of State</SelectItem>
        </SelectContent>
      </Select>

      {data && selectedCounty !== '__other' && (
        <div className="rounded border border-primary/20 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{selectedCounty} County</span>
            {data.isHVHZ && <Badge className="text-[9px] px-1.5 py-0">HVHZ</Badge>}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Suggested V: <span className="text-foreground font-mono font-semibold">{data.V_mph} mph</span> · Exposure: <span className="text-foreground font-mono font-semibold">{data.exposureSuggestion}</span> · HVHZ: {data.isHVHZ ? 'Yes' : 'No'}</p>
            {data.exposureSuggestion === 'C' && <p className="text-[10px]">Verify — coastal strip may require Exposure D</p>}
            {data.note && <p className="text-[10px] italic">{data.note}</p>}
          </div>
          <Button size="sm" className="w-full" onClick={handleApply}>
            Apply These Values →
          </Button>
        </div>
      )}

      <p className="text-[9px] text-muted-foreground leading-relaxed">
        Wind speeds are representative values for permit planning. For final design, verify with the{' '}
        <a href="https://asce7hazardtool.online" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
          ASCE 7-22 Hazard Tool <ExternalLink className="h-2.5 w-2.5" />
        </a>.
      </p>
    </div>
  );
};

export default SiteLookup;
