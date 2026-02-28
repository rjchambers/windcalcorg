import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { FileDown, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCalculationStore } from '@/stores/calculation-store';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import WindCalcPdfReport from './WindCalcPdfReport';

const PdfExportButton = () => {
  const { inputs, outputs } = useCalculationStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [generating, setGenerating] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [open, setOpen] = useState(false);

  const handlePreview = async () => {
    if (!outputs) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <WindCalcPdfReport
          inputs={inputs}
          outputs={outputs}
          projectName={projectName || 'Untitled Project'}
          preparedBy={preparedBy}
          watermark={true}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HVHZCalcPro_Wind_SAMPLE_${(projectName || 'Report').replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate preview PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please log in to purchase a report');
      navigate('/login');
      return;
    }
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-report-payment', {
        body: { reportType: 'wind' },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      toast.error('Failed to start checkout');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!outputs}>
          <FileDown className="mr-1 h-4 w-4" />
          Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Export PDF Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Project Name</Label>
            <Input
              placeholder="e.g. 123 Main St Residence"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Prepared By</Label>
            <Input
              placeholder="e.g. Jane Smith, PE"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Clean PDF Report</span>
              <span className="text-sm font-bold text-primary">$10.00</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Full derivation chain, zone pressures, span results, and signature block — no watermarks.
            </p>
            <Button onClick={handlePurchase} disabled={purchasing} className="w-full">
              {purchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening Checkout…
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Purchase Report — $10.00
                </>
              )}
            </Button>
          </div>

          <Button variant="outline" onClick={handlePreview} disabled={generating} className="w-full">
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Download Sample (Watermarked)
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfExportButton;
