import { Wind, ArrowLeft, Wrench, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCalculationStore } from '@/stores/calculation-store';
import CalculatorForm from '@/components/calculator/CalculatorForm';
import ResultsPanel from '@/components/calculator/ResultsPanel';
import PdfExportButton from '@/components/pdf/PdfExportButton';

const CalculatorPage = () => {
  const navigate = useNavigate();
  const { outputs } = useCalculationStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-primary" />
              <span className="font-display text-sm font-semibold text-foreground">HVHZ Calc Pro</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab navigation */}
            <Button variant="secondary" size="sm" className="pointer-events-none">
              <Wind className="mr-1 h-4 w-4" /> Wind Uplift
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/fastener')} className="text-muted-foreground">
              <Wrench className="mr-1 h-4 w-4" /> Fastener Patterns
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/strap')} className="text-muted-foreground">
              <Link2 className="mr-1 h-4 w-4" /> Strap Calc
            </Button>
            <span className="hidden text-xs text-muted-foreground md:inline">ASCE 7-22 Ch. 28</span>
            <PdfExportButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="grid lg:grid-cols-[420px_1fr]">
        {/* Left: Form */}
        <div className="border-r border-border bg-card/30 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <CalculatorForm />
        </div>

        {/* Right: Results */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          {outputs ? (
            <ResultsPanel outputs={outputs} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Enter parameters to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
