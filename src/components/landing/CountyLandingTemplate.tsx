import { Wind, ArrowRight, Shield, Check, Calculator, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface CountyLandingProps {
  county: string;
  state: string;
  V_mph: number;
  isHVHZ: boolean;
  exposureSuggestion: 'B' | 'C' | 'D';
  heroHeadline: string;
  metaDescription: string;
  localFacts: string[];
  faqs: { q: string; a: string }[];
}

const CountyLandingTemplate = ({
  county, V_mph, isHVHZ, exposureSuggestion, heroHeadline, metaDescription, localFacts, faqs,
}: CountyLandingProps) => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const countyParam = county.toLowerCase().replace(/\s+/g, '_').replace(/\./g, '');

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Wind className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">HVHZ Calc Pro</span>
          </div>
          <Button size="sm" onClick={() => navigate(`/calculator?county=${countyParam}`)}>
            Calculate Now <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16">
        <div className="gradient-hero">
          <div className="container mx-auto px-6 py-20 md:py-28">
            <div className="max-w-2xl mx-auto text-center">
              {isHVHZ && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Shield className="h-3 w-3" /> High Velocity Hurricane Zone
                </div>
              )}
              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                {heroHeadline}
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">{metaDescription}</p>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <p className="font-mono text-2xl font-bold text-primary">{V_mph}</p>
                  <p className="text-[10px] text-muted-foreground">mph Wind Speed</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <p className="font-mono text-2xl font-bold text-primary">{exposureSuggestion}</p>
                  <p className="text-[10px] text-muted-foreground">Exposure Cat.</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <p className="font-mono text-2xl font-bold text-primary">{isHVHZ ? 'Yes' : 'No'}</p>
                  <p className="text-[10px] text-muted-foreground">HVHZ</p>
                </div>
              </div>

              <Button size="lg" className="mt-8 shadow-glow" onClick={() => navigate(`/calculator?county=${countyParam}`)}>
                <Calculator className="mr-2 h-5 w-5" /> Calculate Wind Uplift for {county}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Local Facts */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            Why {county} County Engineers Use HVHZ Calc Pro
          </h2>
          <div className="space-y-4">
            {localFacts.map((fact, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{fact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">FAQ — {county} County</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-lg border border-border bg-card">
                <button className="flex w-full items-center justify-between p-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-display text-sm font-semibold text-foreground">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wind className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">HVHZ Calc Pro</span>
          </div>
          <p className="text-xs text-muted-foreground">ASCE 7-22 · FBC 8th Edition · Built for Florida Engineers</p>
        </div>
      </footer>
    </div>
  );
};

export default CountyLandingTemplate;
