import { Wind, Calculator, FileText, Shield, Zap, BarChart3, ArrowRight, Check, ChevronDown, Wrench, TestTube, User, LogOut, Crown, Link2, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import BuildingDiagram from '@/components/landing/BuildingDiagram';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCalc={() => navigate('/calculator')} onFastener={() => navigate('/fastener')} />
      <Hero onStart={() => navigate('/calculator')} onFastener={() => navigate('/fastener')} />
      <SocialProof />
      <Features />
      <FastenerSection onStart={() => navigate('/fastener')} />
      <HowItWorks />
      <PricingSection />
      <FAQ />
      <Footer />
    </div>
  );
};

const Navbar = ({ onCalc, onFastener }: { onCalc: () => void; onFastener: () => void }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Wind className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">HVHZ Calc Pro</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#fastener" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FastenerCalc</a>
          <span className="text-sm text-muted-foreground cursor-not-allowed pointer-events-none opacity-50">Tile Calc (Coming Soon)</span>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
          <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <User className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { signOut(); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate('/login')}>Log in</Button>
          )}
          <Button variant="outline" size="sm" onClick={onFastener}>FastenerCalc</Button>
          <Button size="sm" onClick={onCalc}>Wind Uplift</Button>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ onStart, onFastener }: { onStart: () => void; onFastener: () => void }) => {
  const navigate = useNavigate();
  return (
  <section className="relative overflow-hidden pt-16">
    <div className="gradient-hero grid-blueprint">
      <div className="container mx-auto px-6 py-24 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Shield className="h-3 w-3" /> ASCE 7-22 + FBC 8th Edition
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              From Truss to Tile.{' '}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Every HVHZ Calculation.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Wind uplift AND fastener patterns — the only HVHZ platform that covers both. 
              ASCE 7-22 Chapter 28 MWFRS + Chapter 30 C&C with RAS 117 &amp; RAS 137.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" className="shadow-glow" onClick={onStart}>
                💨 Wind Uplift Calc
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={onFastener}>
                🔩 FastenerCalc HVHZ
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              No credit card required to calculate. Pay only when you need a permit-ready PDF.
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>Free to calculate · $10 per clean PDF report</span>
              <button onClick={() => navigate('/sample-reports')} className="text-primary hover:underline font-medium">
                View Sample Reports →
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <BuildingDiagram />
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

const SocialProof = () => (
  <section className="border-b border-border bg-card/50 py-8">
    <div className="container mx-auto px-6 text-center">
      <p className="text-sm text-muted-foreground">
        Built for structural engineers and roofing contractors in Florida's High Velocity Hurricane Zone.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-8 opacity-40">
        {['Simpson Strong-Tie', 'FL Building Code', 'ASCE 7-22', 'IBC 2021'].map(name => (
          <span key={name} className="font-display text-sm font-semibold text-muted-foreground">{name}</span>
        ))}
      </div>
    </div>
  </section>
);

const features = [
  { icon: Shield, title: 'ASCE 7-22 Compliant', description: 'Full Chapter 28 Envelope Procedure with GCpf interpolation, zone mapping, and overhang calculations.' },
  { icon: Zap, title: 'Real-Time Results', description: 'Instant recalculation as you type. No "Calculate" button needed — results update in under 50ms.' },
  { icon: FileText, title: 'Export-Ready Reports', description: 'Professional PDF engineering reports with full derivation chains, ready for permit submittal.' },
  { icon: Calculator, title: 'Multi-Zone Analysis', description: 'Automatic zone assignment with interactive building diagrams. Zone 1, 2E, 3E all computed.' },
  { icon: Link2, title: 'Roof-to-Wall Strap Calc', description: 'Full connector schedule from uplift demand to Simpson/MiTek model selection. Permit-ready format with FL Product Approval numbers.' },
  { icon: Shield, title: 'HVHZ Detection', description: 'HVHZ mode with Miami-Dade (175 mph) and Broward (170 mph) wind speed presets and mandatory Exposure C enforcement.' },
];

const Features = () => (
  <section id="features" className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground">Built for Structural Engineers</h2>
        <p className="mt-3 text-muted-foreground">Every feature designed with engineering precision and code compliance in mind.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="group rounded-lg border border-border bg-card p-6 shadow-card transition-all hover:border-primary/30 hover:shadow-glow">
            <div className="mb-4 inline-flex rounded-md bg-primary/10 p-2.5"><f.icon className="h-5 w-5 text-primary" /></div>
            <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FastenerSection = ({ onStart }: { onStart: () => void }) => {
  const navigate = useNavigate();
  return (
  <section id="fastener" className="border-y border-border bg-card/30 py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-medium text-zone-edge">🔩 NEW</div>
        <h2 className="font-display text-3xl font-bold text-foreground">Now Includes FastenerCalc HVHZ</h2>
        <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">HVHZ roofing calculations. From wind load to fastener pattern. Per RAS 117, 128, 127, and 137.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        <div className="rounded-lg border border-border bg-card p-6 shadow-card">
          <div className="mb-4 inline-flex rounded-md bg-primary/10 p-2.5"><Wrench className="h-5 w-5 text-primary" /></div>
          <h3 className="font-display text-lg font-semibold text-foreground">Membrane, Tile & Shingle</h3>
          <p className="mt-2 text-sm text-muted-foreground">Modified bitumen, single-ply, adhered membrane, tile (RAS 127), and shingle (RAS 128) — with auto row escalation.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-card">
          <div className="mb-4 inline-flex rounded-md bg-primary/10 p-2.5"><TestTube className="h-5 w-5 text-primary" /></div>
          <h3 className="font-display text-lg font-semibold text-foreground">TAS 105 Integration</h3>
          <p className="mt-2 text-sm text-muted-foreground">Enter field test values, get MCRF instantly with pass/fail. Auto Fy update for reroofs.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-card">
          <div className="mb-4 inline-flex rounded-md bg-primary/10 p-2.5"><FileText className="h-5 w-5 text-primary" /></div>
          <h3 className="font-display text-lg font-semibold text-foreground">Permit-Ready Output</h3>
          <p className="mt-2 text-sm text-muted-foreground">Matches HVHZ Uniform Application Form. One-click copy for permit submittal.</p>
        </div>
      </div>
      <div className="mt-10 flex items-center justify-center gap-4">
        <Button size="lg" variant="outline" onClick={onStart} className="shadow-card">🔩 Try FastenerCalc HVHZ <ArrowRight className="ml-2 h-4 w-4" /></Button>
        <Button size="sm" variant="ghost" onClick={() => navigate('/sample-reports?tab=fastener')} className="text-primary">View Sample Report →</Button>
      </div>
    </div>
  </section>
  );
};

const steps = [
  { step: '01', title: 'Enter Parameters', description: 'Input wind speed, exposure, building geometry, and roof type with smart defaults.' },
  { step: '02', title: 'Review Results', description: 'See live zone pressures, net uplift forces, fastener patterns, and connector schedules.' },
  { step: '03', title: 'Export Report', description: 'Generate permit-ready PDF reports with full derivation chains and connector schedules.' },
];

const HowItWorks = () => (
  <section className="border-y border-border bg-card/30 py-20">
    <div className="container mx-auto px-6">
      <h2 className="text-center font-display text-3xl font-bold text-foreground">How It Works</h2>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.step} className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <span className="font-mono text-sm font-bold text-primary">{s.step}</span>
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const tiers = [
  { name: 'Calculate', price: 'Free', period: '', features: ['Unlimited wind uplift calcs', 'Unlimited fastener calcs', 'All system types', 'Interactive zone diagrams', 'Real-time results'], cta: 'Start Calculating', highlight: false, badge: null },
  { name: 'Pay Per Report', price: '$10', period: '/report', features: ['Clean, unwatermarked PDF', 'Full derivation chain', 'Zone pressure tables', 'Signature & seal block', 'Permit-ready format'], cta: 'Buy Report — $10', highlight: false, badge: null },
  { name: 'Pro', price: '$100', period: '/mo', features: ['Unlimited clean PDF exports', 'Both Wind & Fastener reports', 'No per-report fees', 'Priority support', 'Manage subscription anytime'], cta: 'Subscribe to Pro', highlight: true, badge: 'Best Value' },
];

const PricingSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('create-pro-checkout');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) { console.error('Pro checkout failed:', err); }
  };

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-center font-display text-3xl font-bold text-foreground">Simple, Transparent Pricing</h2>
        <p className="mt-3 text-center text-muted-foreground">Free to calculate. Pay only when you need a clean PDF.</p>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`relative rounded-lg border p-6 ${t.highlight ? 'border-primary bg-card shadow-glow' : 'border-border bg-card shadow-card'}`}>
              {t.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">{t.badge}</div>}
              <h3 className="font-display text-lg font-semibold text-foreground">{t.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-foreground">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" />{f}</li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={t.highlight ? 'default' : 'outline'} onClick={() => {
                if (t.name === 'Pro') handleProCheckout();
                else if (t.name === 'Pay Per Report') navigate('/sample-reports');
                else navigate('/calculator');
              }}>
                {t.name === 'Pro' && <Crown className="mr-2 h-4 w-4" />}
                {t.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const faqs = [
  { q: 'Is this PE-stamped?', a: 'HVHZ Calc Pro provides calculations as a design aid. The Engineer of Record is responsible for reviewing and stamping all outputs.' },
  { q: 'What code editions are supported?', a: 'ASCE 7-22, Florida Building Code 8th Edition (FBC 2023), and IBC 2021 are all supported.' },
  { q: 'Can I use this for permit submittal?', a: 'Yes. Our PDF reports include full derivation chains and are formatted for permit submittal when stamped by the EOR.' },
  { q: 'How do you handle HVHZ?', a: 'Select your county in the calculator. Miami-Dade and Broward auto-apply the correct design wind speed (175/170 mph) and enforce Exposure Category C per FBC §1620.' },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="border-t border-border bg-card/30 py-20">
      <div className="container mx-auto max-w-2xl px-6">
        <h2 className="text-center font-display text-3xl font-bold text-foreground">FAQ</h2>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-lg border border-border bg-card">
              <button className="flex w-full items-center justify-between p-4 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-display text-sm font-semibold text-foreground">{f.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="border-t border-border py-12">
    <div className="container mx-auto px-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          <span className="font-display font-semibold text-foreground">HVHZ Calc Pro</span>
        </div>
        <p className="text-center text-xs text-muted-foreground max-w-xl">
          HVHZ Calc Pro provides calculations as a design aid based on ASCE 7-22 Chapter 28. 
          All results must be reviewed by a licensed PE. Engineer of Record assumes full responsibility.
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

export default LandingPage;
