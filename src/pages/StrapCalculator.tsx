import { Wind, Wrench, ArrowLeft, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import StrapForm from '@/components/strap/StrapForm';
import StrapResults from '@/components/strap/StrapResults';

const StrapCalculatorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <span className="font-display text-sm font-semibold text-foreground">Strap Calc HVHZ</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/calculator')} className="text-muted-foreground">
              <Wind className="mr-1 h-4 w-4" /> Wind Uplift
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/fastener')} className="text-muted-foreground">
              <Wrench className="mr-1 h-4 w-4" /> Fastener Patterns
            </Button>
            <Button variant="secondary" size="sm" className="pointer-events-none">
              <Link2 className="mr-1 h-4 w-4" /> Strap Calc
            </Button>
            <span className="hidden text-xs text-muted-foreground md:inline">FBC §R802.11</span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[420px_1fr]">
        <div className="border-r border-border bg-card/30 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <StrapForm />
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <StrapResults />
        </div>
      </div>
    </div>
  );
};

export default StrapCalculatorPage;
